import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ambiente = "homologacao" | "producao";

const baseUrl = (ambiente: Ambiente) =>
  ambiente === "producao"
    ? "https://api.focusnfe.com.br"
    : "https://homologacao.focusnfe.com.br";

const authHeader = (token: string) =>
  `Basic ${Buffer.from(`${token}:`).toString("base64")}`;

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) {
    const { data: gerente } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "gerente",
    });
    if (!gerente) throw new Error("Somente administradores podem alterar a integração fiscal.");
  }
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Testa o token chamando um endpoint leve da Focus NFe. */
async function validarToken(ambiente: Ambiente, token: string) {
  const res = await fetch(`${baseUrl(ambiente)}/v2/empresas`, {
    headers: { Authorization: authHeader(token) },
  });
  const texto = await res.text();
  if (res.status === 401 || res.status === 403) {
    return { valido: false, mensagem: "Token recusado pela Focus NFe (não autorizado)." };
  }
  if (!res.ok) {
    return { valido: false, mensagem: `Focus NFe respondeu ${res.status}: ${texto.slice(0, 200)}` };
  }
  return { valido: true, mensagem: "Token validado com sucesso na Focus NFe." };
}

/** Situação atual da integração (sem nunca devolver o token). */
export const statusFocus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const db = await admin();
    const { data, error } = await db
      .from("fiscal_credenciais")
      .select("ambiente, valido, validado_em, mensagem, updated_at");
    if (error) throw new Error(error.message);
    return { credenciais: data ?? [] };
  });

export const salvarTokenFocus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { ambiente: Ambiente; token: string }) => {
    if (input.ambiente !== "homologacao" && input.ambiente !== "producao") {
      throw new Error("Ambiente inválido.");
    }
    const token = String(input.token ?? "").trim();
    if (token.length < 10) throw new Error("Informe um token válido.");
    return { ambiente: input.ambiente, token };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { valido, mensagem } = await validarToken(data.ambiente, data.token);
    const db = await admin();
    const { error } = await db.from("fiscal_credenciais").upsert(
      {
        ambiente: data.ambiente,
        token: data.token,
        valido,
        validado_em: new Date().toISOString(),
        mensagem,
        atualizado_por: context.userId,
      },
      { onConflict: "ambiente" },
    );
    if (error) throw new Error(error.message);

    const { data: cfg } = await db
      .from("configuracao_fiscal")
      .select("id, ambiente")
      .maybeSingle();
    if (cfg) {
      const { data: todas } = await db
        .from("fiscal_credenciais")
        .select("ambiente, valido")
        .eq("ambiente", cfg.ambiente as string)
        .maybeSingle();
      await db
        .from("configuracao_fiscal")
        .update({ token_configurado: !!todas?.valido })
        .eq("id", cfg.id as string);
    }
    return { valido, mensagem };
  });

export const removerTokenFocus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { ambiente: Ambiente }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const db = await admin();
    await db.from("fiscal_credenciais").delete().eq("ambiente", data.ambiente);
    const { data: cfg } = await db.from("configuracao_fiscal").select("id, ambiente").maybeSingle();
    if (cfg && cfg.ambiente === data.ambiente) {
      await db
        .from("configuracao_fiscal")
        .update({ token_configurado: false })
        .eq("id", cfg.id as string);
    }
    return { ok: true };
  });

async function credencialAtiva() {
  const db = await admin();
  const { data: cfg } = await db.from("configuracao_fiscal").select("*").maybeSingle();
  if (!cfg) throw new Error("Configure os dados fiscais antes de transmitir.");
  const ambiente = (cfg.ambiente as Ambiente) ?? "homologacao";
  const { data: cred } = await db
    .from("fiscal_credenciais")
    .select("token, valido")
    .eq("ambiente", ambiente)
    .maybeSingle();
  if (!cred?.token || !cred.valido) {
    throw new Error(
      `Nenhum token válido da Focus NFe cadastrado para o ambiente de ${ambiente === "producao" ? "produção" : "homologação"}.`,
    );
  }
  return { db, cfg, ambiente, token: cred.token as string };
}

function payloadNfe(cfg: any, nota: any) {
  const itens = Array.isArray(nota.itens) ? nota.itens : [];
  return {
    natureza_operacao: nota.natureza_operacao,
    data_emissao: new Date(`${nota.data_emissao}T12:00:00`).toISOString(),
    tipo_documento: nota.tipo_documento === "entrada" ? 0 : 1,
    finalidade_emissao: nota.finalidade === "devolucao" ? 4 : 1,
    consumidor_final: nota.consumidor_final ? 1 : 0,
    presenca_comprador: Number(nota.presenca_comprador) || 1,
    modalidade_frete: Number(nota.modalidade_frete) || 9,
    cnpj_emitente: String(cfg.cnpj ?? "").replace(/\D/g, ""),
    nome_destinatario: nota.cliente_nome,
    cpf_destinatario:
      String(nota.cliente_documento ?? "").replace(/\D/g, "").length === 11
        ? String(nota.cliente_documento).replace(/\D/g, "")
        : undefined,
    cnpj_destinatario:
      String(nota.cliente_documento ?? "").replace(/\D/g, "").length === 14
        ? String(nota.cliente_documento).replace(/\D/g, "")
        : undefined,
    valor_frete: Number(nota.valor_frete) || 0,
    valor_desconto: Number(nota.valor_desconto) || 0,
    valor_total: Number(nota.valor_total) || 0,
    valor_produtos: Number(nota.valor_produtos) || 0,
    items: itens.map((i: any, idx: number) => ({
      numero_item: idx + 1,
      codigo_produto: i.codigo ?? String(idx + 1),
      descricao: i.descricao,
      cfop: i.cfop ?? "5102",
      codigo_ncm: i.ncm ?? "00000000",
      unidade_comercial: i.unidade ?? "UN",
      quantidade_comercial: Number(i.quantidade) || 1,
      valor_unitario_comercial: Number(i.valor_unitario) || 0,
      valor_bruto: Number(i.total ?? (i.quantidade || 1) * (i.valor_unitario || 0)),
      unidade_tributavel: i.unidade ?? "UN",
      quantidade_tributavel: Number(i.quantidade) || 1,
      valor_unitario_tributavel: Number(i.valor_unitario) || 0,
      icms_origem: Number(i.origem_mercadoria ?? 0),
      icms_situacao_tributaria: i.cst ?? "102",
    })),
  };
}

function payloadNfse(cfg: any, nota: any) {
  return {
    data_emissao: new Date(`${nota.data_emissao}T12:00:00`).toISOString(),
    prestador: {
      cnpj: String(cfg.cnpj ?? "").replace(/\D/g, ""),
      inscricao_municipal: cfg.inscricao_municipal ?? "",
      codigo_municipio: cfg.codigo_municipio ?? "",
    },
    tomador: {
      cnpj:
        String(nota.cliente_documento ?? "").replace(/\D/g, "").length === 14
          ? String(nota.cliente_documento).replace(/\D/g, "")
          : undefined,
      cpf:
        String(nota.cliente_documento ?? "").replace(/\D/g, "").length === 11
          ? String(nota.cliente_documento).replace(/\D/g, "")
          : undefined,
      razao_social: nota.cliente_nome,
    },
    servico: {
      aliquota: Number(nota.aliquota_iss) || 0,
      discriminacao: nota.discriminacao ?? nota.natureza_operacao,
      iss_retido: !!nota.iss_retido,
      item_lista_servico: nota.codigo_servico ?? "",
      valor_servicos: Number(nota.valor_servicos ?? nota.valor_total) || 0,
    },
  };
}

/** Envia a nota para a Focus NFe e marca como processando. */
export const transmitirNota = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!input?.id) throw new Error("Nota inválida.");
    return input;
  })
  .handler(async ({ data }) => {
    const { db, cfg, ambiente, token } = await credencialAtiva();
    const { data: nota, error } = await db
      .from("notas_fiscais")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!nota) throw new Error("Nota não encontrada.");
    if (nota.status === "autorizada") throw new Error("Esta nota já está autorizada.");

    const ref = (nota.referencia as string) || `${nota.modelo}-${nota.id}`;
    const rota = nota.modelo === "nfse" ? "nfse" : "nfe";
    const corpo = nota.modelo === "nfse" ? payloadNfse(cfg, nota) : payloadNfe(cfg, nota);

    const res = await fetch(
      `${baseUrl(ambiente)}/v2/${rota}?ref=${encodeURIComponent(ref)}`,
      {
        method: "POST",
        headers: { Authorization: authHeader(token), "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      },
    );
    const texto = await res.text();
    let json: any = {};
    try {
      json = texto ? JSON.parse(texto) : {};
    } catch {
      json = { mensagem: texto };
    }

    if (!res.ok && res.status !== 422) {
      await db
        .from("notas_fiscais")
        .update({
          referencia: ref,
          status: "rejeitada",
          mensagem_sefaz: json.mensagem ?? `Erro ${res.status}: ${texto.slice(0, 300)}`,
        })
        .eq("id", nota.id);
      throw new Error(json.mensagem ?? `Focus NFe respondeu ${res.status}: ${texto.slice(0, 300)}`);
    }

    const status =
      json.status === "autorizado"
        ? "autorizada"
        : json.status === "erro_autorizacao" || json.status === "denegado"
          ? "rejeitada"
          : "processando";

    await db
      .from("notas_fiscais")
      .update({
        referencia: ref,
        status,
        chave_acesso: json.chave_nfe ?? json.chave_nfse ?? nota.chave_acesso,
        protocolo: json.protocolo ?? nota.protocolo,
        url_danfe: json.caminho_danfe
          ? `${baseUrl(ambiente)}${json.caminho_danfe}`
          : (json.url ?? nota.url_danfe),
        url_xml: json.caminho_xml_nota_fiscal
          ? `${baseUrl(ambiente)}${json.caminho_xml_nota_fiscal}`
          : nota.url_xml,
        mensagem_sefaz: json.mensagem_sefaz ?? json.mensagem ?? null,
      })
      .eq("id", nota.id);

    return { status, mensagem: json.mensagem_sefaz ?? json.mensagem ?? "Nota enviada." };
  });

/** Consulta na Focus NFe todas as notas ainda em processamento e atualiza o status. */
export const sincronizarNotas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    let ctx;
    try {
      ctx = await credencialAtiva();
    } catch {
      return { atualizadas: 0, pendentes: 0, ativo: false };
    }
    const { db, ambiente, token } = ctx;
    const { data: notas } = await db
      .from("notas_fiscais")
      .select("id, modelo, referencia, status")
      .in("status", ["processando", "enviada"])
      .not("referencia", "is", null)
      .limit(50);

    let atualizadas = 0;
    for (const nota of notas ?? []) {
      const rota = nota.modelo === "nfse" ? "nfse" : "nfe";
      const res = await fetch(
        `${baseUrl(ambiente)}/v2/${rota}/${encodeURIComponent(nota.referencia as string)}?completa=1`,
        { headers: { Authorization: authHeader(token) } },
      );
      if (!res.ok) continue;
      const json: any = await res.json().catch(() => null);
      if (!json) continue;
      const status =
        json.status === "autorizado"
          ? "autorizada"
          : json.status === "cancelado"
            ? "cancelada"
            : json.status === "erro_autorizacao" || json.status === "denegado"
              ? "rejeitada"
              : "processando";
      if (status === nota.status) continue;
      await db
        .from("notas_fiscais")
        .update({
          status,
          numero: json.numero ?? undefined,
          serie: json.serie ?? undefined,
          chave_acesso: json.chave_nfe ?? json.chave_nfse ?? undefined,
          protocolo: json.protocolo ?? undefined,
          url_danfe: json.caminho_danfe ? `${baseUrl(ambiente)}${json.caminho_danfe}` : undefined,
          url_xml: json.caminho_xml_nota_fiscal
            ? `${baseUrl(ambiente)}${json.caminho_xml_nota_fiscal}`
            : undefined,
          mensagem_sefaz: json.mensagem_sefaz ?? json.mensagem ?? undefined,
        })
        .eq("id", nota.id);
      atualizadas += 1;
    }
    return { atualizadas, pendentes: (notas ?? []).length, ativo: true };
  });
