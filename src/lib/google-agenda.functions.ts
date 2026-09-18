import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";

type GoogleEvento = {
  id: string;
  status?: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
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
  return `${prefixo}${uuid.replace(/-/g, "")}`;
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

const FUSO = "America/Sao_Paulo";
const proximoDia = (data: string) =>
  new Date(new Date(`${data}T12:00:00Z`).getTime() + 86_400_000).toISOString().slice(0, 10);

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

/** Traz os compromissos do Google Agenda para a agenda da equipe. */
export const sincronizarAgendaGoogle = createServerFn({ method: "POST" })
  .inputValidator((input: { calendarId?: string; diasPassados?: number; diasFuturos?: number }) => input)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const calendarId = data?.calendarId || "primary";
    const diasPassados = data?.diasPassados ?? 30;
    const diasFuturos = data?.diasFuturos ?? 365;

    const timeMin = new Date(Date.now() - diasPassados * 86_400_000).toISOString();
    const timeMax = new Date(Date.now() + diasFuturos * 86_400_000).toISOString();

    const eventos: GoogleEvento[] = [];
    let pageToken: string | undefined;
    do {
      const query: Record<string, string> = {
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: "250",
        timeMin,
        timeMax,
      };
      if (pageToken) query["pageToken"] = pageToken;
      const pagina = await chamar(`/calendars/${encodeURIComponent(calendarId)}/events`, query);
      eventos.push(...(pagina.items ?? []));
      pageToken = pagina.nextPageToken;
    } while (pageToken && eventos.length < 2000);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const cancelados = eventos.filter((e) => e.status === "cancelled").map((e) => e.id);
    if (cancelados.length) {
      await supabaseAdmin.from("agenda_eventos").delete().in("google_event_id", cancelados);
    }

    const nosso = /^(ev|obra|os)[0-9a-f]{32}$/;
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
        return {
          titulo: e.summary?.trim() || "(sem título)",
          descricao: e.description ?? null,
          tipo: "trabalho",
          inicio,
          fim,
          dia_inteiro: diaInteiro,
          local: e.location ?? null,
          status: "agendado",
          responsavel_id: context.userId,
          responsavel_nome: null,
          google_event_id: e.id,
          google_calendar_id: calendarId,
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

    // Quando o usuário marca itens na tela, só os marcados vão para o Google.
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
      new Set(
        (equipe ?? [])
          .map((f) => (f.email ?? "").trim().toLowerCase())
          .filter((e) => /.+@.+\..+/.test(e)),
      ),
    ).map((email) => ({ email }));

    const [{ data: eventos }, { data: ordens }, { data: obras }] = await Promise.all([
      supabaseAdmin
        .from("agenda_eventos")
        .select("id, titulo, descricao, local, inicio, fim, dia_inteiro, cliente_nome, responsavel_nome, google_event_id")
        .neq("status", "cancelado")
        .gte("inicio", desde),
      supabaseAdmin
        .from("ordens_servico")
        .select("id, numero, tipo_servico, descricao, cliente_nome, data_agendada, responsavel, status")
        .not("data_agendada", "is", null)
        .gte("data_agendada", desdeDia),
      supabaseAdmin
        .from("obras")
        .select("id, numero, tipo_servico, cliente_nome, endereco_obra, data_limite, responsavel, status_geral")
        .not("data_limite", "is", null)
        .gte("data_limite", desdeDia),
    ]);

    let enviados = 0;
    const erros: string[] = [];

    for (const e of eventos ?? []) {
      // Eventos que vieram do próprio Google não são reenviados.
      if (e.google_event_id && !/^ev[0-9a-f]{32}$/.test(e.google_event_id)) continue;
      const id = idGoogle("ev", e.id);
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
            .update({ google_event_id: id, google_calendar_id: calendarId })
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
          summary: `OS ${o.numero ?? ""} · ${o.tipo_servico}${o.cliente_nome ? ` — ${o.cliente_nome}` : ""}`.trim(),
          description: [o.descricao, o.responsavel ? `Responsável: ${o.responsavel}` : null, `Status: ${o.status}`]
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
      const dia = String(ob.data_limite);
      try {
        await enviarEvento(calendarId, idGoogle("obra", ob.id), {
          summary: `Obra ${ob.numero ?? ""} · ${ob.tipo_servico}${ob.cliente_nome ? ` — ${ob.cliente_nome}` : ""}`.trim(),
          description: [ob.responsavel ? `Responsável: ${ob.responsavel}` : null, `Status: ${ob.status_geral}`]
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
