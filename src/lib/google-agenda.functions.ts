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

async function chamar(path: string, query: Record<string, string>) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connKey = process.env["GOOGLE_CALENDAR_API_KEY"];
  if (!lovableKey || !connKey) {
    throw new Error("Conexão com o Google Agenda não está configurada.");
  }
  const url = `${GATEWAY}${path}?${new URLSearchParams(query).toString()}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": connKey,
    },
  });
  const texto = await res.text();
  if (!res.ok) {
    throw new Error(`Google Agenda respondeu ${res.status}: ${texto}`);
  }
  return JSON.parse(texto) as { items?: GoogleEvento[]; nextPageToken?: string };
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

    const linhas = eventos
      .filter((e) => e.status !== "cancelled" && (e.start?.date || e.start?.dateTime))
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
