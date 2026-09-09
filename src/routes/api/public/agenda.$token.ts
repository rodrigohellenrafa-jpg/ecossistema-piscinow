import { createFileRoute } from "@tanstack/react-router";

function fmt(dt: string, diaInteiro: boolean) {
  const d = new Date(dt);
  if (diaInteiro) {
    return d.toISOString().slice(0, 10).replace(/-/g, "");
  }
  return `${d.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`;
}

function esc(v: string | null | undefined) {
  return String(v ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function vevento(opts: {
  uid: string;
  titulo: string;
  descricao?: string | null;
  local?: string | null;
  inicio: string;
  fim?: string | null;
  diaInteiro: boolean;
}) {
  const linhas: string[] = ["BEGIN:VEVENT", `UID:${opts.uid}@piscinow`];
  linhas.push(`DTSTAMP:${fmt(new Date().toISOString(), false)}`);
  if (opts.diaInteiro) {
    const inicio = fmt(opts.inicio, true);
    const fimDate = new Date(opts.fim ?? opts.inicio);
    fimDate.setDate(fimDate.getDate() + 1);
    linhas.push(`DTSTART;VALUE=DATE:${inicio}`);
    linhas.push(`DTEND;VALUE=DATE:${fmt(fimDate.toISOString(), true)}`);
  } else {
    linhas.push(`DTSTART:${fmt(opts.inicio, false)}`);
    const fim = opts.fim ?? new Date(new Date(opts.inicio).getTime() + 3600_000).toISOString();
    linhas.push(`DTEND:${fmt(fim, false)}`);
  }
  linhas.push(`SUMMARY:${esc(opts.titulo)}`);
  if (opts.descricao) linhas.push(`DESCRIPTION:${esc(opts.descricao)}`);
  if (opts.local) linhas.push(`LOCATION:${esc(opts.local)}`);
  linhas.push("END:VEVENT");
  return linhas.join("\r\n");
}

export const Route = createFileRoute("/api/public/agenda/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const token = String(params.token ?? "").replace(/\.ics$/i, "");
        if (!token) return new Response("Não encontrado", { status: 404 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: assinatura } = await supabaseAdmin
          .from("agenda_assinaturas")
          .select("user_id")
          .eq("token", token)
          .maybeSingle();

        if (!assinatura) return new Response("Não encontrado", { status: 404 });

        const meuId = assinatura.user_id;
        const marca = (dono: string | null | undefined, texto: string) =>
          dono && dono === meuId ? `★ ${texto}` : texto;

        const [{ data: eventos }, { data: ordens }, { data: obras }] = await Promise.all([
          supabaseAdmin
            .from("agenda_eventos")
            .select(
              "id, titulo, descricao, local, inicio, fim, dia_inteiro, tipo, status, responsavel_id, responsavel_nome, cliente_nome",
            )
            .neq("status", "cancelado")
            .order("inicio"),
          supabaseAdmin
            .from("ordens_servico")
            .select("id, numero, tipo_servico, descricao, cliente_nome, data_agendada, responsavel, status")
            .not("data_agendada", "is", null),
          supabaseAdmin
            .from("obras")
            .select("id, numero, tipo_servico, cliente_nome, endereco_obra, data_limite, responsavel, status_geral")
            .not("data_limite", "is", null),
        ]);

        const blocos: string[] = [];

        for (const e of eventos ?? []) {
          blocos.push(
            vevento({
              uid: `ev-${e.id}`,
              titulo: marca(e.responsavel_id, e.titulo),
              descricao: [
                e.descricao,
                e.cliente_nome ? `Cliente: ${e.cliente_nome}` : null,
                e.responsavel_nome ? `Responsável: ${e.responsavel_nome}` : null,
                e.tipo === "pessoal" ? "Compromisso pessoal" : null,
              ]
                .filter(Boolean)
                .join("\n"),
              local: e.local,
              inicio: e.inicio,
              fim: e.fim,
              diaInteiro: e.dia_inteiro,
            }),
          );
        }

        for (const o of ordens ?? []) {
          blocos.push(
            vevento({
              uid: `os-${o.id}`,
              titulo: `OS ${o.numero ?? ""} · ${o.tipo_servico} — ${o.cliente_nome ?? ""}`.trim(),
              descricao: [o.descricao, o.responsavel ? `Responsável: ${o.responsavel}` : null, `Status: ${o.status}`]
                .filter(Boolean)
                .join("\n"),
              inicio: `${o.data_agendada}T00:00:00.000Z`,
              fim: `${o.data_agendada}T00:00:00.000Z`,
              diaInteiro: true,
            }),
          );
        }

        for (const ob of obras ?? []) {
          blocos.push(
            vevento({
              uid: `obra-${ob.id}`,
              titulo: `Obra ${ob.numero ?? ""} · ${ob.tipo_servico} — ${ob.cliente_nome ?? ""}`.trim(),
              descricao: [ob.responsavel ? `Responsável: ${ob.responsavel}` : null, `Status: ${ob.status_geral}`]
                .filter(Boolean)
                .join("\n"),
              local: ob.endereco_obra,
              inicio: `${ob.data_limite}T00:00:00.000Z`,
              fim: `${ob.data_limite}T00:00:00.000Z`,
              diaInteiro: true,
            }),
          );
        }

        const ics = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Piscinow ERP//Agenda//PT-BR",
          "CALSCALE:GREGORIAN",
          "METHOD:PUBLISH",
          "X-WR-CALNAME:Agenda Piscinow",
          "X-WR-TIMEZONE:America/Sao_Paulo",
          ...blocos,
          "END:VCALENDAR",
        ].join("\r\n");

        return new Response(ics, {
          headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
