import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";

/** Agenda principal obrigatória da loja Splash Piscinas Campinas Jardim do Trevo */
export const EMAIL_AGENDA_LOJA_PRINCIPAL = "campinasjardimdotrevo@splashpiscinas.com";

type GoogleEvento = {
  id: string;
  status?: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
  attendees?: { email?: string; displayName?: string; responseStatus?: string }[];
};

async function requisitar(
  path: string,
  opts: { query?: Record<string, string>; method?: string; body?: unknown } = {},
) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connKey = process.env["GOOGLE_CALENDAR_API_KEY"];
  if (!lovableKey || !connKey) {
    throw new Error("Conexão com o Google Agenda não está configurada.");
  }
  const qs = opts.query ? `?${new URLSearchParams(opts.query).toString()}` : "";
  const res = await fetch(`${GATEWAY}${path}${qs}`, {
    method: opts.method ?? "GET",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": connKey,
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
    },
    ...(opts.body ? { body: JSON.stringify(opts.body) } : {}),
  });
  const texto = await res.text();
  return { ok: res.ok, status: res.status, texto };
}

async function chamar(path: string, query: Record<string, string>) {
  const r = await requisitar(path, { query });
  if (!r.ok) throw new Error(`Google Agenda respondeu ${r.status}: ${r.texto}`);
  return JSON.parse(r.texto) as { items?: GoogleEvento[]; nextPageToken?: string };
}

/** ID estável no Google (só aceita 0-9 a-v), derivado do id do registro. */
function idGoogle(prefixo: string, uuid: string) {
  const limpo = uuid.toLowerCase().replace(/[^0-9a-v]/g, "");
  return `${prefixo}${limpo}`.slice(0, 64);
}

async function enviarEvento(calendarId: string, id: string, corpo: Record<string, unknown>) {
  const base = `/calendars/${encodeURIComponent(calendarId)}/events`;
  const query = { sendUpdates: "all" };
  const criar = await requisitar(base, { method: "POST", body: { ...corpo, id }, query });
  if (criar.ok) return "criado";
  if (criar.status === 409) {
    const atualizar = await requisitar(`${base}/${id}`, { method: "PUT", body: { ...corpo, id }, query });
    if (atualizar.ok) return "atualizado";
    throw new Error(`Google Agenda respondeu ${atualizar.status}: ${atualizar.texto}`);
  }
  throw new Error(`Google Agenda respondeu ${criar.status}: ${criar.texto}`);
}

async function removerEventoGoogle(calendarId: string, id: string) {
  const base = `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(id)}`;
  await requisitar(base, { method: "DELETE", query: { sendUpdates: "all" } });
}

const FUSO = "America/Sao_Paulo";
const proximoDia = (data: string) =>
  new Date(new Date(`${data}T12:00:00Z`).getTime() + 86_400_000).toISOString().slice(0, 10);

function inferirModalidadeExecucao(titulo: string, descricao: string | null | undefined): "com_execucao" | "sem_execucao" {
  const texto = `${titulo} ${descricao ?? ""}`.toLowerCase();
  if (texto.includes("[sem_execucao]") || texto.includes("[sem execução]") || texto.includes("sem execução")) {
    return "sem_execucao";
  }
  if (texto.includes("[com_execucao]") || texto.includes("[com execução]") || texto.includes("com execução")) {
    return "com_execucao";
  }
  if (/\b(os[-\s#]?\d+|ordem de servi|escava|instala|tubula|acabamento|obra|manuten|vinil|casa de m[aá]quinas|campo)\b/i.test(texto)) {
    return "com_execucao";
  }
  return "sem_execucao";
}

function aplicarTagDescricao(
  descricaoBase: string | null | undefined,
  modalidade: "com_execucao" | "sem_execucao",
  etapaExecucao?: string | null,
  osNumero?: string | null,
  emailsVinculados?: string[],
): string {
  const limpo = (descricaoBase ?? "")
    .replace(/\[(COM_EXECUCAO|SEM_EXECUCAO)\]\s*/gi, "")
    .replace(/\[ETAPA:[^\]]*\]\s*/gi, "")
    .replace(/\[OS:[^\]]*\]\s*/gi, "")
    .replace(/\[EMAILS:[^\]]*\]\s*/gi, "")
    .trim();
  const tagModalidade = modalidade === "sem_execucao" ? "[SEM_EXECUCAO]" : "[COM_EXECUCAO]";
  const tagEtapa = etapaExecucao?.trim() ? `[ETAPA:${etapaExecucao.trim()}]` : "";
  const tagOs = osNumero?.trim() ? `[OS:${osNumero.trim()}]` : "";
  const emailsValidos = (emailsVinculados ?? []).map((e) => e.trim().toLowerCase()).filter(Boolean);
  const tagEmails = emailsValidos.length > 0 ? `[EMAILS:${emailsValidos.join(",")}]` : "";
  return [tagModalidade, tagEtapa, tagOs, tagEmails, limpo].filter(Boolean).join(" ").trim();
}

/** Lista as agendas disponíveis na conta Google conectada. */
export const listarAgendasGoogle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const dados = (await chamar("/users/me/calendarList", { maxResults: "50" })) as unknown as {
      items?: { id: string; summary?: string; primary?: boolean }[];
    };
    return (dados.items ?? [])
      .filter((c) => !c.id.includes("#holiday@"))
      .map((c) => ({ id: c.id, nome: c.summary ?? c.id, principal: !!c.primary }));
  });

/** Traz os compromissos do Google Agenda para a agenda da equipe e Flight Board. */
export const sincronizarAgendaGoogle = createServerFn({ method: "POST" })
  .inputValidator((input: { calendarId?: string; diasPassados?: number; diasFuturos?: number }) => input)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const calendarId = data?.calendarId || "primary";
    const diasPassados = data?.diasPassados ?? 30;
    const diasFuturos = data?.diasFuturos ?? 365;

    const timeMin = new Date(Date.now() - diasPassados * 86_400_000).toISOString();
    const timeMax = new Date(Date.now() + diasFuturos * 86_400_000).toISOString();

    const calendariosParaBuscar = Array.from(
      new Set([calendarId, EMAIL_AGENDA_LOJA_PRINCIPAL]),
    );

    const eventosMap = new Map<string, GoogleEvento>();
    for (const calId of calendariosParaBuscar) {
      let pageToken: string | undefined;
      try {
        do {
          const query: Record<string, string> = {
            singleEvents: "true",
            orderBy: "startTime",
            maxResults: "250",
            timeMin,
            timeMax,
          };
          if (pageToken) query["pageToken"] = pageToken;
          const pagina = await chamar(`/calendars/${encodeURIComponent(calId)}/events`, query);
          for (const ev of pagina.items ?? []) {
            if (ev.id && !eventosMap.has(ev.id)) {
              eventosMap.set(ev.id, ev);
            }
          }
          pageToken = pagina.nextPageToken;
        } while (pageToken && eventosMap.size < 2000);
      } catch (err) {
        // Se for a agenda principal primária, propaga o erro; se for secundária e não acessível diretamente, segue com primary
        if (calId === calendarId) throw err;
      }
    }

    const eventos = Array.from(eventosMap.values());
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const cancelados = eventos.filter((e) => e.status === "cancelled").map((e) => e.id);
    if (cancelados.length) {
      await supabaseAdmin.from("agenda_eventos").delete().in("google_event_id", cancelados);
    }

    // Busca eventos já existentes para preservar a tag Com Execução / Sem Execução definida pelo usuário
    const { data: existentesDb } = await supabaseAdmin
      .from("agenda_eventos")
      .select("google_event_id, descricao, tipo")
      .not("google_event_id", "is", null);
    const mapaExistentes = new Map(
      (existentesDb ?? []).map((row) => [row.google_event_id, row]),
    );

    const nosso = /^(ev|obra|os|fb)[0-9a-v]{16,64}$/;
    const linhas = eventos
      .filter(
        (e) =>
          e.status !== "cancelled" && !nosso.test(e.id) && (e.start?.date || e.start?.dateTime),
      )
      .map((e) => {
        const diaInteiro = !!e.start?.date;
        const inicio = diaInteiro
          ? new Date(`${e.start?.date}T00:00:00-03:00`).toISOString()
          : new Date(e.start?.dateTime as string).toISOString();
        const fim = diaInteiro
          ? new Date(`${e.end?.date ?? e.start?.date}T00:00:00-03:00`).toISOString()
          : new Date((e.end?.dateTime ?? e.start?.dateTime) as string).toISOString();

        const previo = mapaExistentes.get(e.id);
        const modalidade = previo?.descricao?.includes("[COM_EXECUCAO]")
          ? "com_execucao"
          : previo?.descricao?.includes("[SEM_EXECUCAO]")
            ? "sem_execucao"
            : inferirModalidadeExecucao(e.summary ?? "", e.description);

        const descricaoComTag = aplicarTagDescricao(e.description, modalidade);

        return {
          titulo: e.summary?.trim() || "(sem título)",
          descricao: descricaoComTag,
          tipo: modalidade === "com_execucao" ? "trabalho" : "pessoal",
          inicio,
          fim,
          dia_inteiro: diaInteiro,
          local: e.location ?? null,
          status: "agendado",
          responsavel_id: context.userId,
          responsavel_nome: null,
          google_event_id: e.id,
          google_calendar_id: EMAIL_AGENDA_LOJA_PRINCIPAL,
          created_by: context.userId,
          updated_at: new Date().toISOString(),
        };
      });

    let importados = 0;
    for (let i = 0; i < linhas.length; i += 200) {
      const lote = linhas.slice(i, i + 200);
      const { error } = await supabaseAdmin
        .from("agenda_eventos")
        .upsert(lote, { onConflict: "google_event_id" });
      if (error) throw new Error(error.message);
      importados += lote.length;
    }

    return { importados, removidos: cancelados.length, calendarId };
  });

/**
 * Sincroniza imediatamente um item/OS individual do Flight Board com o Google Calendar
 * (agenda principal campinasjardimdotrevo@splashpiscinas.com e e-mails vinculados).
 */
export const sincronizarItemFlightBoardGoogle = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      acao: "upsert" | "delete";
      registroId: string;
      prefixoId?: "fb" | "os" | "ev" | "obra";
      googleEventIdExistente?: string | null;
      osNumero?: string | null;
      clienteNome?: string | null;
      servicoNatureza?: string | null;
      etapaExecucao?: string | null;
      status?: string | null;
      modalidadeExecucao?: "com_execucao" | "sem_execucao";
      dataInicio: string;
      dataFim?: string | null;
      horaInicio?: string | null;
      horaFim?: string | null;
      diaInteiro?: boolean;
      responsavel?: string | null;
      enderecoObra?: string | null;
      observacoes?: string | null;
      emailsVinculados?: string[];
      calendarId?: string;
    }) => input,
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data }) => {
    const calendarId = data.calendarId || "primary";
    const eventId =
      data.googleEventIdExistente && data.googleEventIdExistente.trim()
        ? data.googleEventIdExistente.trim()
        : idGoogle(data.prefixoId || "fb", data.registroId);

    if (data.acao === "delete") {
      try {
        await removerEventoGoogle(calendarId, eventId);
      } catch {
        // Ignora caso ainda não exista no Google
      }
      if (calendarId !== EMAIL_AGENDA_LOJA_PRINCIPAL) {
        try {
          await removerEventoGoogle(EMAIL_AGENDA_LOJA_PRINCIPAL, eventId);
        } catch {
          // Ignora
        }
      }
      return { ok: true, googleEventId: eventId, acao: "delete" };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: equipe } = await supabaseAdmin
      .from("funcionarios")
      .select("email, nome")
      .eq("ativo", true)
      .not("email", "is", null);

    const emailsSet = new Set<string>([EMAIL_AGENDA_LOJA_PRINCIPAL]);
    for (const f of equipe ?? []) {
      const em = (f.email ?? "").trim().toLowerCase();
      if (/.+@.+\..+/.test(em)) emailsSet.add(em);
    }
    for (const emRaw of data.emailsVinculados ?? []) {
      const em = (emRaw ?? "").trim().toLowerCase();
      if (/.+@.+\..+/.test(em)) emailsSet.add(em);
    }

    const convidados = Array.from(emailsSet).map((email) => ({ email }));
    const modalidade = data.modalidadeExecucao ?? "com_execucao";
    const rotuloModalidade = modalidade === "sem_execucao" ? "Sem Execução" : "Com Execução";

    const tituloEvento = data.osNumero
      ? `[OS ${data.osNumero}] ${data.clienteNome || "Cliente"} — ${data.etapaExecucao || data.servicoNatureza || "Execução"} (${rotuloModalidade})`
      : `${data.servicoNatureza || data.clienteNome || "Compromisso"} (${rotuloModalidade})`;

    const descricaoEvento = [
      data.osNumero ? `Nº da OS: ${data.osNumero}` : null,
      data.clienteNome ? `Cliente: ${data.clienteNome}` : null,
      data.etapaExecucao ? `Etapa de Execução: ${data.etapaExecucao}` : null,
      data.servicoNatureza ? `Serviço / Detalhes: ${data.servicoNatureza}` : null,
      `Classificação: ${rotuloModalidade}`,
      data.status ? `Status no Flight Board: ${data.status}` : null,
      data.responsavel ? `Equipe / Responsável: ${data.responsavel}` : null,
      `Agenda Principal: ${EMAIL_AGENDA_LOJA_PRINCIPAL}`,
      data.observacoes ? `Observações: ${data.observacoes}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const diaInicio = data.dataInicio.slice(0, 10);
    const diaFim = (data.dataFim || data.dataInicio).slice(0, 10);
    const usarHorario = !data.diaInteiro && Boolean(data.horaInicio);

    const startPayload = usarHorario
      ? {
          dateTime: new Date(`${diaInicio}T${data.horaInicio}:00-03:00`).toISOString(),
          timeZone: FUSO,
        }
      : { date: diaInicio };

    const endPayload = usarHorario
      ? {
          dateTime: new Date(
            `${diaFim}T${data.horaFim || data.horaInicio || "17:00"}:00-03:00`,
          ).toISOString(),
          timeZone: FUSO,
        }
      : { date: proximoDia(diaFim) };

    const corpo: Record<string, unknown> = {
      summary: tituloEvento,
      description: descricaoEvento,
      location: data.enderecoObra || undefined,
      start: startPayload,
      end: endPayload,
      attendees: convidados,
      guestsCanSeeOtherGuests: true,
    };

    await enviarEvento(calendarId, eventId, corpo);
    if (calendarId !== EMAIL_AGENDA_LOJA_PRINCIPAL) {
      try {
        await enviarEvento(EMAIL_AGENDA_LOJA_PRINCIPAL, eventId, corpo);
      } catch {
        // Caso a agenda principal seja o próprio 'primary' ou receba via attendee, prossegue normalmente
      }
    }

    return {
      ok: true,
      googleEventId: eventId,
      agendaPrincipal: EMAIL_AGENDA_LOJA_PRINCIPAL,
      emailsSincronizados: Array.from(emailsSet),
    };
  });

/** Envia para o Google Agenda os compromissos, obras e ordens de serviço do sistema. */
export const enviarAgendaParaGoogle = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      calendarId?: string;
      selecionados?: { eventoIds?: string[]; osIds?: string[]; obraIds?: string[] };
    }) => input,
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data }) => {
    const calendarId = data?.calendarId || "primary";
    const sel = data?.selecionados;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const desde = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const desdeDia = desde.slice(0, 10);

    const evIds = sel?.eventoIds;
    const osIds = sel?.osIds;
    const obraIds = sel?.obraIds;
    const buscaEventos = !sel || (evIds?.length ?? 0) > 0;
    const buscaOs = !sel || (osIds?.length ?? 0) > 0;
    const buscaObras = !sel || (obraIds?.length ?? 0) > 0;

    const { data: equipe } = await supabaseAdmin
      .from("funcionarios")
      .select("email")
      .eq("ativo", true)
      .not("email", "is", null);
    const convidados = Array.from(
      new Set([
        EMAIL_AGENDA_LOJA_PRINCIPAL,
        ...(equipe ?? [])
          .map((f) => (f.email ?? "").trim().toLowerCase())
          .filter((e) => /.+@.+\..+/.test(e)),
      ]),
    ).map((email) => ({ email }));

    const qEventos = supabaseAdmin
      .from("agenda_eventos")
      .select("id, titulo, descricao, local, inicio, fim, dia_inteiro, cliente_nome, responsavel_nome, google_event_id")
      .neq("status", "cancelado")
      .gte("inicio", desde);
    const qOrdens = supabaseAdmin
      .from("ordens_servico")
      .select("id, numero, tipo_servico, descricao, cliente_nome, data_agendada, responsavel, status")
      .not("status", "in", '("orcamento","cancelado","cancelada")')
      .not("data_agendada", "is", null)
      .gte("data_agendada", desdeDia);
    const qObras = supabaseAdmin
      .from("obras")
      .select("id, numero, tipo_servico, cliente_nome, endereco_obra, data_limite, escavacao_inicio, instalacao_inicio, responsavel, status_geral, board_os_id")
      .not("board_os_id", "is", null)
      .not("data_limite", "is", null)
      .gte("data_limite", desdeDia);
    const [{ data: eventos }, { data: ordens }, { data: obras }] = await Promise.all([
      buscaEventos ? (evIds?.length ? qEventos.in("id", evIds) : qEventos) : Promise.resolve({ data: [] }),
      buscaOs ? (osIds?.length ? qOrdens.in("id", osIds) : qOrdens) : Promise.resolve({ data: [] }),
      buscaObras ? (obraIds?.length ? qObras.in("id", obraIds) : qObras) : Promise.resolve({ data: [] }),
    ]);

    let enviados = 0;
    const erros: string[] = [];

    for (const e of eventos ?? []) {
      if (e.google_event_id && !/^(ev|fb)[0-9a-v]{16,64}$/.test(e.google_event_id)) continue;
      const id = e.google_event_id || idGoogle("ev", e.id);
      const inicioIso = new Date(e.inicio).toISOString();
      const fimIso = new Date(e.fim ?? new Date(new Date(e.inicio).getTime() + 3_600_000)).toISOString();
      const corpo = e.dia_inteiro
        ? {
            summary: e.titulo,
            description: [e.descricao, e.cliente_nome ? `Cliente: ${e.cliente_nome}` : null]
              .filter(Boolean)
              .join("\n"),
            location: e.local ?? undefined,
            start: { date: inicioIso.slice(0, 10) },
            end: { date: proximoDia(inicioIso.slice(0, 10)) },
          }
        : {
            summary: e.titulo,
            description: [e.descricao, e.cliente_nome ? `Cliente: ${e.cliente_nome}` : null]
              .filter(Boolean)
              .join("\n"),
            location: e.local ?? undefined,
            start: { dateTime: inicioIso, timeZone: FUSO },
            end: { dateTime: fimIso, timeZone: FUSO },
          };
      Object.assign(corpo, { attendees: convidados, guestsCanSeeOtherGuests: true });
      try {
        await enviarEvento(calendarId, id, corpo);
        enviados++;
        if (e.google_event_id !== id) {
          await supabaseAdmin
            .from("agenda_eventos")
            .update({ google_event_id: id, google_calendar_id: EMAIL_AGENDA_LOJA_PRINCIPAL })
            .eq("id", e.id);
        }
      } catch (err) {
        erros.push((err as Error).message);
      }
    }

    for (const o of ordens ?? []) {
      const dia = String(o.data_agendada);
      try {
        await enviarEvento(calendarId, idGoogle("os", o.id), {
          summary: `[OS ${o.numero ?? "S/N"}] ${o.cliente_nome ?? "Cliente"} — ${o.tipo_servico} (Com Execução)`.trim(),
          description: [
            `Nº da OS: ${o.numero ?? "—"}`,
            `Cliente: ${o.cliente_nome ?? "—"}`,
            `Etapa / Serviço: ${o.tipo_servico}`,
            o.descricao ? `Detalhes da Etapa: ${o.descricao}` : null,
            o.responsavel ? `Responsável: ${o.responsavel}` : null,
            `Status: ${o.status}`,
            `Agenda Principal: ${EMAIL_AGENDA_LOJA_PRINCIPAL}`,
          ]
            .filter(Boolean)
            .join("\n"),
          start: { date: dia },
          end: { date: proximoDia(dia) },
          attendees: convidados,
        });
        enviados++;
      } catch (err) {
        erros.push((err as Error).message);
      }
    }

    for (const ob of obras ?? []) {
      const dia = String(ob.instalacao_inicio || ob.escavacao_inicio || ob.data_limite);
      try {
        await enviarEvento(calendarId, idGoogle("obra", ob.id), {
          summary: `[OS ${ob.numero ?? ""}] ${ob.cliente_nome ?? "Cliente"} — ${ob.tipo_servico} (Com Execução)`.trim(),
          description: [
            `Nº da OS / Obra: ${ob.numero ?? "—"}`,
            `Cliente: ${ob.cliente_nome ?? "—"}`,
            `Serviço / Etapa: ${ob.tipo_servico}`,
            ob.responsavel ? `Responsável: ${ob.responsavel}` : null,
            `Status: ${ob.status_geral}`,
            `Agenda Principal: ${EMAIL_AGENDA_LOJA_PRINCIPAL}`,
          ]
            .filter(Boolean)
            .join("\n"),
          location: ob.endereco_obra ?? undefined,
          start: { date: dia },
          end: { date: proximoDia(dia) },
          attendees: convidados,
        });
        enviados++;
      } catch (err) {
        erros.push((err as Error).message);
      }
    }

    if (enviados === 0 && erros.length) throw new Error(erros[0] as string);
    return { enviados, falhas: erros.length, calendarId };
  });

/**
 * Sincronização Bidirecional Completa do Flight Board com Google Calendar:
 * 1) Puxa todos os eventos do Google Calendar (técnicos, administrativos e pessoais) para o Flight Board.
 * 2) Envia todas as OS emitidas e agendamentos do Flight Board para o Google Calendar
 *    (incluindo obrigatoriamente campinasjardimdotrevo@splashpiscinas.com e e-mails vinculados).
 */
export const sincronizarFlightBoardBidirecionalGoogle = createServerFn({ method: "POST" })
  .inputValidator((input: { calendarId?: string }) => input)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const calendarId = data?.calendarId || "primary";

    // Passo 1: Google Calendar -> Sistema (Flight Board)
    const resultadoImportacao = await sincronizarAgendaGoogle({
      data: { calendarId, diasPassados: 30, diasFuturos: 365 },
    });

    // Passo 2: Sistema (Flight Board) -> Google Calendar
    const resultadoEnvio = await enviarAgendaParaGoogle({
      data: { calendarId },
    });

    return {
      importados: resultadoImportacao.importados,
      removidos: resultadoImportacao.removidos,
      enviados: resultadoEnvio.enviados,
      falhasEnvio: resultadoEnvio.falhas,
      agendaPrincipal: EMAIL_AGENDA_LOJA_PRINCIPAL,
      sincronizadoPor: context.userId,
      sincronizadoEm: new Date().toISOString(),
    };
  });
