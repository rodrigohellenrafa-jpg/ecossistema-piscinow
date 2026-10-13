import logoSplash from "@/assets/logo-splash.png.asset.json";
import plantaPiscina from "@/assets/planta-piscina-limpa.png";
import { CONTRATO_CABECALHO, CONTRATO_CLAUSULAS, CONTRATO_ANEXO_DRENOS } from "@/lib/contrato-venda";

const logoUrl = () =>
  typeof window !== "undefined" ? `${window.location.origin}${logoSplash.url}` : logoSplash.url;

const plantaUrl = () =>
  typeof window !== "undefined" ? `${window.location.origin}${plantaPiscina}` : plantaPiscina;

const esc = (s: string | null | undefined) =>
  (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const fmt = (v: number | string | null | undefined) =>
  Number(v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtData = (d: string | null | undefined) =>
  d ? new Date(d + (d.length === 10 ? "T12:00:00" : "")).toLocaleDateString("pt-BR") : "—";

/** Utilitário universal de impressão via iframe oculto */
export function imprimirHtml(html: string) {
  if (typeof document === "undefined") return;
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) {
    iframe.remove();
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();

  const disparar = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    window.setTimeout(() => iframe.remove(), 60000);
  };
  if (doc.readyState === "complete") window.setTimeout(disparar, 150);
  else iframe.onload = () => window.setTimeout(disparar, 150);
}

/* ======================================================================
 * 1. DOCUMENTO DE VENDA E ORÇAMENTO (A4)
 * ====================================================================== */
export type HtmlVendaProps = {
  venda: {
    numero?: string | null;
    data: string;
    vendedor?: string | null;
    cliente_nome?: string | null;
    valor_total: number;
    valor_entrada?: number;
    saldo_devedor?: number;
    parcelas?: number;
    valor_parcela?: number;
    forma_pagamento?: string | null;
    observacoes?: string | null;
    assinatura_nome?: string | null;
    assinatura_imagem?: string | null;
    assinatura_documento?: string | null;
    assinatura_codigo?: string | null;
    assinatura_em?: string | null;
    prazo_entrega?: string | null;
    endereco_instalacao?: string | null;
    materiais?: unknown;
    status_pedido?: string | null;
    tipo_atendimento?: string | null;
  };
  cliente?: {
    nome?: string | null;
    documento?: string | null;
    telefone?: string | null;
    email?: string | null;
    cep?: string | null;
    logradouro?: string | null;
    numero?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    estado?: string | null;
    endereco_obra?: string | null;
  } | null;
  itens: Array<{
    id?: string;
    sku?: string | null;
    descricao: string;
    quantidade: number;
    preco_unitario: number;
    total: number;
  }>;
  condicoes?: Array<{
    id?: string;
    forma_pagamento: string;
    valor: number;
    parcelas: number;
    valor_parcela: number;
    valor_cobrado?: number;
    data_prevista: string | null;
    bandeira?: string | null;
    pago?: boolean;
  }>;
  empresa?: { nome: string; documento?: string; endereco?: string; contato?: string };
};

export function htmlPedido({ venda, cliente, itens = [], condicoes = [], empresa }: HtmlVendaProps): string {
  const orcamento = venda.status_pedido === "orcamento";
  const titulo = orcamento ? "ORÇAMENTO" : "PEDIDO DE VENDA";
  const endereco = cliente
    ? [cliente.logradouro, cliente.numero, cliente.bairro, cliente.cidade, cliente.estado, cliente.cep]
        .filter(Boolean)
        .join(", ")
    : "";

  const rotulosMats: Record<string, string> = {
    areia_m3: "Areia (m³)",
    cimento_sc: "Cimento (sc)",
    blocos_un: "Blocos (un)",
    agua_m3: "Água (m³)",
    fios_eletrodutos: "Fios/Eletrodutos",
  };
  const mats: [string, string][] = [];
  if (venda.materiais && typeof venda.materiais === "object") {
    for (const [k, v] of Object.entries(venda.materiais as Record<string, unknown>)) {
      if (v !== null && v !== undefined && v !== "" && v !== 0) {
        mats.push([rotulosMats[k] ?? k, String(v)]);
      }
    }
  }

  const linhasItens = itens
    .map(
      (i) => `<tr>
        <td>${esc(i.sku)}</td>
        <td>${esc(i.descricao)}</td>
        <td class="num">${i.quantidade}</td>
        <td class="num">${fmt(i.preco_unitario)}</td>
        <td class="num">${fmt(i.total)}</td>
      </tr>`
    )
    .join("");

  const linhasCond = condicoes
    .map(
      (c) => `<tr>
        <td>${esc(c.forma_pagamento)}${c.bandeira ? ` (${esc(c.bandeira)})` : ""}</td>
        <td class="num">${c.parcelas || 1}x</td>
        <td class="num">${fmt(c.valor_parcela || c.valor)}</td>
        <td class="num">${fmt(c.valor_cobrado || c.valor)}</td>
        <td>${fmtData(c.data_prevista)}</td>
        <td>${c.pago ? "Pago" : "Pendente"}</td>
      </tr>`
    )
    .join("");

  const linhasMats = mats
    .map(([k, v]) => `<tr><td>${esc(k)}</td><td class="num">${esc(v)}</td></tr>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>${titulo} ${esc(venda.numero ?? "")}</title>
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #111; margin: 0; line-height: 1.4; }
  h1 { font-size: 16px; margin: 0; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .04em; margin: 16px 0 6px; border-bottom: 1px solid #999; padding-bottom: 3px; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 8px; }
  .head .marca { display: flex; align-items: center; gap: 10px; }
  .head .marca img { height: 46px; width: auto; }
  .empresa { font-size: 11px; color: #333; margin-top: 2px; }
  .rodape-timbre { margin-top: 18px; border-top: 1px solid #111; padding-top: 5px; font-size: 9.5px; color: #333; text-align: center; }
  table { width: 100%; border-collapse: collapse; margin-top: 4px; }
  th, td { border: 1px solid #bbb; padding: 4px 6px; text-align: left; vertical-align: top; }
  th { background: #eee; font-size: 11px; }
  .num { text-align: right; white-space: nowrap; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; }
  .campo { border-bottom: 1px dotted #999; padding: 2px 0; min-height: 16px; }
  .rotulo { font-size: 10px; color: #555; text-transform: uppercase; font-weight: 600; }
  .totais td { font-weight: bold; }
  .obs { border: 1px solid #bbb; min-height: 48px; padding: 6px; margin-top: 4px; white-space: pre-wrap; }
  .declaracao { font-size: 10.5px; color: #333; margin-top: 14px; text-align: justify; }
  .assinatura { margin-top: 36px; display: flex; justify-content: space-between; gap: 32px; }
  .assinatura .bloco { flex: 1; text-align: center; }
  .assinatura .linha { border-top: 1px solid #111; margin-top: 40px; padding-top: 4px; font-size: 11px; }
  .assinatura img { max-height: 56px; display: block; margin: 0 auto; }
  .interno { margin-top: 20px; border-top: 1px dashed #999; padding-top: 8px; font-size: 10.5px; color: #444; }
  .aviso { margin-top: 10px; border: 1px solid #111; padding: 6px 8px; font-size: 10.5px; background: #fafafa; }
</style>
</head>
<body>
  <div class="head">
    <div class="marca">
      <img src="${logoUrl()}" alt="Logotipo" />
      <div>
        <h1>${titulo}${venda.numero ? ` Nº ${esc(venda.numero)}` : ""}</h1>
        <div class="empresa">${esc(empresa?.nome ?? CONTRATO_CABECALHO.empresa)} · ${esc(CONTRATO_CABECALHO.documento)}</div>
        <div class="empresa">${esc(CONTRATO_CABECALHO.endereco)} · ${esc(CONTRATO_CABECALHO.telefone)} · ${esc(CONTRATO_CABECALHO.email)}</div>
      </div>
    </div>
    <div style="text-align:right">
      <div>Data: <strong>${fmtData(venda.data)}</strong></div>
      <div>Vendedor: <strong>${esc(venda.vendedor ?? "—")}</strong></div>
    </div>
  </div>

  <h2>Dados do cliente</h2>
  <div class="grid">
    <div><span class="rotulo">Nome</span><div class="campo">${esc(cliente?.nome ?? venda.cliente_nome ?? "")}</div></div>
    <div><span class="rotulo">Documento</span><div class="campo">${esc(cliente?.documento ?? "")}</div></div>
    <div><span class="rotulo">Telefone</span><div class="campo">${esc(cliente?.telefone ?? "")}</div></div>
    <div><span class="rotulo">E-mail</span><div class="campo">${esc(cliente?.email ?? "")}</div></div>
    <div style="grid-column: 1 / -1"><span class="rotulo">Endereço</span><div class="campo">${esc(endereco)}</div></div>
    <div style="grid-column: 1 / -1"><span class="rotulo">Endereço da obra / instalação</span><div class="campo">${esc(venda.endereco_instalacao ?? cliente?.endereco_obra ?? "")}</div></div>
    <div><span class="rotulo">Prazo de entrega</span><div class="campo">${esc(venda.prazo_entrega ?? "")}</div></div>
  </div>

  <h2>Itens do pedido</h2>
  <table>
    <thead><tr><th>SKU</th><th>Descrição</th><th class="num">Qtd</th><th class="num">Unitário</th><th class="num">Total</th></tr></thead>
    <tbody>${linhasItens || '<tr><td colspan="5" style="text-align:center;padding:12px;">Nenhum item lançado</td></tr>'}</tbody>
    <tfoot>
      <tr class="totais"><td colspan="4" class="num">Valor total</td><td class="num">${fmt(venda.valor_total)}</td></tr>
      <tr><td colspan="4" class="num">Entrada</td><td class="num">${fmt(venda.valor_entrada ?? 0)}</td></tr>
      <tr><td colspan="4" class="num">Saldo devedor</td><td class="num">${fmt(venda.saldo_devedor ?? 0)}</td></tr>
      <tr><td colspan="4" class="num">Parcelas</td><td class="num">${venda.parcelas ?? 1}x de ${fmt(venda.valor_parcela ?? venda.valor_total)}</td></tr>
    </tfoot>
  </table>

  ${condicoes.length ? `<h2>Condições de pagamento</h2>
  <table>
    <thead><tr><th>Forma</th><th class="num">Parcelas</th><th class="num">Parcela</th><th class="num">Valor</th><th>Previsão</th><th>Status</th></tr></thead>
    <tbody>${linhasCond}</tbody>
  </table>` : ""}

  ${mats.length ? `<h2>Material a ser solicitado</h2>
  <table>
    <thead><tr><th>Material</th><th class="num">Quantidade</th></tr></thead>
    <tbody>${linhasMats}</tbody>
  </table>` : ""}

  ${venda.observacoes ? `<h2>Observações</h2><div class="obs">${esc(venda.observacoes)}</div>` : ""}

  ${orcamento
    ? `<div class="aviso"><strong>Orçamento Nº ${esc(venda.numero ?? "")} — sujeito a aprovação.</strong> Documento sem valor fiscal, válido por 15 dias a partir da data de emissão. Valores, prazos e disponibilidade podem ser revistos após esse período. A aprovação pelo cliente converte este orçamento em pedido de venda.</div>
  <p class="declaracao">Declaro ter recebido e conferido as condições deste orçamento, ciente dos valores, prazos, itens e condições de pagamento aqui descritos. A execução depende da aprovação abaixo.</p>`
    : `<p class="declaracao">Declaro ter recebido e conferido as condições deste pedido de venda, ciente dos valores, prazos, itens e condições de pagamento aqui descritos, concordando integralmente com o estabelecido.</p>`}

  <div class="assinatura">
    <div class="bloco">
      ${venda.assinatura_imagem ? `<img src="${esc(venda.assinatura_imagem)}" alt="Assinatura do cliente" />` : ""}
      <div class="linha">${orcamento ? "Aprovação do cliente" : "Cliente"}${venda.assinatura_nome ? `: ${esc(venda.assinatura_nome)}` : ""}${venda.assinatura_documento ? ` · Doc: ${esc(venda.assinatura_documento)}` : ""}</div>
    </div>
    <div class="bloco">
      <div class="linha">${esc(empresa?.nome ?? "Empresa")}</div>
    </div>
  </div>

  <div class="rodape-timbre">
    ${esc(CONTRATO_CABECALHO.empresa)} · ${esc(CONTRATO_CABECALHO.documento)} · ${esc(CONTRATO_CABECALHO.endereco)} · ${esc(CONTRATO_CABECALHO.telefone)} · ${esc(CONTRATO_CABECALHO.email)}
  </div>

  <div class="interno">
    Controle interno${venda.assinatura_codigo ? ` · Código de assinatura: ${esc(venda.assinatura_codigo)}` : ""}${venda.assinatura_em ? ` · Assinado em: ${new Date(venda.assinatura_em).toLocaleString("pt-BR")}` : ""}
  </div>
</body>
</html>`;
}

export function htmlContrato({ venda, cliente, itens = [], condicoes = [], empresa }: HtmlVendaProps): string {
  const enderecoCli = cliente
    ? [cliente.logradouro, cliente.numero, cliente.bairro, cliente.cidade, cliente.estado, cliente.cep]
        .filter(Boolean)
        .join(", ")
    : "";
  const hoje = new Date();
  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];

  const clausulas = CONTRATO_CLAUSULAS.map(
    (s) =>
      `<h3>${esc(s.titulo)}</h3>${s.itens.map((i) => `<p>${esc(i)}</p>`).join("")}`
  ).join("");

  const linhasItens = itens
    .map(
      (i) => `<tr>
        <td>${esc(i.sku)}</td><td>${esc(i.descricao)}</td>
        <td class="num">${i.quantidade}</td>
        <td class="num">${fmt(i.preco_unitario)}</td>
        <td class="num">${fmt(i.total)}</td>
      </tr>`
    )
    .join("");

  const linhasCond = condicoes
    .map(
      (c) => `<tr>
        <td>${esc(c.forma_pagamento)}${c.bandeira ? ` (${esc(c.bandeira)})` : ""}</td>
        <td class="num">${c.parcelas || 1}x</td>
        <td class="num">${fmt(c.valor_parcela || c.valor)}</td>
        <td class="num">${fmt(c.valor_cobrado || c.valor)}</td>
        <td>${fmtData(c.data_prevista)}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Contrato de venda ${esc(venda.numero ?? "")}</title>
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10.5px; color: #111; margin: 0; line-height: 1.45; text-align: justify; }
  .topo { text-align: center; border-bottom: 2px solid #111; padding-bottom: 8px; }
  .topo h1 { font-size: 13px; margin: 0 0 2px; }
  .topo div { font-size: 10px; color: #333; }
  .topo img { height: 52px; width: auto; display: block; margin: 0 auto 4px; }
  .rodape-timbre { margin-top: 20px; border-top: 1px solid #111; padding-top: 5px; font-size: 9px; color: #333; text-align: center; }
  h2 { font-size: 12px; text-align: center; margin: 14px 0 8px; text-transform: uppercase; }
  h3 { font-size: 11px; margin: 12px 0 4px; text-transform: uppercase; }
  p { margin: 4px 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 10px; }
  th, td { border: 1px solid #bbb; padding: 3px 5px; text-align: left; vertical-align: top; }
  th { background: #eee; }
  .num { text-align: right; white-space: nowrap; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 16px; }
  .campo { border-bottom: 1px dotted #999; padding: 2px 0; min-height: 15px; }
  .rotulo { font-size: 9px; color: #555; text-transform: uppercase; }
  .quadro { border: 1px solid #111; padding: 8px; margin-top: 6px; }
  .assinaturas { margin-top: 28px; page-break-inside: avoid; }
  .assinaturas .linha { border-top: 1px solid #111; margin-top: 38px; padding-top: 4px; }
  .assinaturas img { max-height: 54px; display: block; }
  .quebra { page-break-before: always; }
</style>
</head>
<body>
  <div class="topo">
    <img src="${logoUrl()}" alt="Logotipo" />
    <h1>${esc(empresa?.nome ?? CONTRATO_CABECALHO.empresa)}</h1>
    <div>${esc(CONTRATO_CABECALHO.documento)} · ${esc(CONTRATO_CABECALHO.telefone)}</div>
    <div>${esc(CONTRATO_CABECALHO.email)}</div>
    <div>${esc(CONTRATO_CABECALHO.endereco)}</div>
  </div>

  <h2>${esc(CONTRATO_CABECALHO.titulo)}</h2>
  <p>${esc(CONTRATO_CABECALHO.preambulo)}</p>

  <h3>Quadro de contrato de venda</h3>
  <div class="quadro">
    <div class="grid">
      <div><span class="rotulo">Contrato nº</span><div class="campo">${esc(venda.numero ?? "")}</div></div>
      <div><span class="rotulo">Data</span><div class="campo">${fmtData(venda.data)}</div></div>
      <div><span class="rotulo">Comprador</span><div class="campo">${esc(cliente?.nome ?? venda.cliente_nome ?? "")}</div></div>
      <div><span class="rotulo">CPF/CNPJ</span><div class="campo">${esc(cliente?.documento ?? "")}</div></div>
      <div><span class="rotulo">Telefone</span><div class="campo">${esc(cliente?.telefone ?? "")}</div></div>
      <div><span class="rotulo">E-mail</span><div class="campo">${esc(cliente?.email ?? "")}</div></div>
      <div style="grid-column:1/-1"><span class="rotulo">Endereço do comprador</span><div class="campo">${esc(enderecoCli)}</div></div>
      <div style="grid-column:1/-1"><span class="rotulo">Local da instalação (obra)</span><div class="campo">${esc(venda.endereco_instalacao ?? cliente?.endereco_obra ?? "")}</div></div>
      <div><span class="rotulo">Prazo de entrega</span><div class="campo">${esc(venda.prazo_entrega ?? "")}</div></div>
      <div><span class="rotulo">Vendedor</span><div class="campo">${esc(venda.vendedor ?? "")}</div></div>
    </div>

    <h3>Item 6 — Produtos e serviços adquiridos</h3>
    <table>
      <thead><tr><th>SKU</th><th>Descrição</th><th class="num">Qtd</th><th class="num">Unitário</th><th class="num">Total</th></tr></thead>
      <tbody>${linhasItens || '<tr><td colspan="5" style="text-align:center;">Nenhum item</td></tr>'}</tbody>
      <tfoot>
        <tr><td colspan="4" class="num"><strong>Valor total do contrato</strong></td><td class="num"><strong>${fmt(venda.valor_total)}</strong></td></tr>
        <tr><td colspan="4" class="num">Entrada</td><td class="num">${fmt(venda.valor_entrada ?? 0)}</td></tr>
        <tr><td colspan="4" class="num">Saldo devedor</td><td class="num">${fmt(venda.saldo_devedor ?? 0)}</td></tr>
      </tfoot>
    </table>

    <h3>Item 7 — Condição de pagamento</h3>
    ${condicoes.length
      ? `<table>
      <thead><tr><th>Forma</th><th class="num">Parcelas</th><th class="num">Parcela</th><th class="num">Valor</th><th>Previsão</th></tr></thead>
      <tbody>${linhasCond}</tbody>
    </table>`
      : `<p>${esc(venda.forma_pagamento ?? "")} — ${venda.parcelas ?? 1}x de ${fmt(venda.valor_parcela ?? venda.valor_total)}</p>`}

    ${venda.observacoes ? `<h3>Observações</h3><p>${esc(venda.observacoes)}</p>` : ""}
  </div>

  ${clausulas}

  <div class="assinaturas">
    <h3>Assinaturas</h3>
    <p>CAMPINAS, ${hoje.getDate()} de ${meses[hoje.getMonth()]} de ${hoje.getFullYear()}.</p>
    <div class="grid" style="gap:0 32px">
      <div>
        <div class="linha">EMPRESA VENDEDORA: ${esc(empresa?.nome ?? CONTRATO_CABECALHO.empresa)}</div>
      </div>
      <div>
        ${venda.assinatura_imagem ? `<img src="${esc(venda.assinatura_imagem)}" alt="Assinatura do comprador" />` : ""}
        <div class="linha">COMPRADOR(A): ${esc(venda.assinatura_nome ?? cliente?.nome ?? venda.cliente_nome ?? "")}${venda.assinatura_documento ? ` · Doc: ${esc(venda.assinatura_documento)}` : ""}</div>
      </div>
    </div>
    <p style="margin-top:18px"><strong>TESTEMUNHAS</strong> (nome completo e CPF ou RG)</p>
    <div class="grid" style="gap:0 32px">
      <div><div class="linha">1) ______________________________</div></div>
      <div><div class="linha">2) ______________________________</div></div>
    </div>
  </div>

  <div class="quebra">
    <h3>${esc(CONTRATO_ANEXO_DRENOS[0])}</h3>
    ${CONTRATO_ANEXO_DRENOS.slice(1).map((p) => `<p>${esc(p)}</p>`).join("")}
  </div>

  <div class="rodape-timbre">
    ${esc(CONTRATO_CABECALHO.empresa)} · ${esc(CONTRATO_CABECALHO.documento)} · ${esc(CONTRATO_CABECALHO.endereco)} · ${esc(CONTRATO_CABECALHO.telefone)} · ${esc(CONTRATO_CABECALHO.email)}
  </div>
</body>
</html>`;
}

export function htmlCupom({ venda, cliente, itens = [], condicoes = [], empresa }: HtmlVendaProps): string {
  const linhas = itens
    .map(
      (i) => `<div class="item">
        <div class="desc">${esc(i.sku ? `${i.sku} ` : "")}${esc(i.descricao)}</div>
        <div class="ln"><span>${i.quantidade} x ${fmt(i.preco_unitario)}</span><span>${fmt(i.total)}</span></div>
      </div>`
    )
    .join("");

  const pagtos = condicoes.length
    ? condicoes
        .map(
          (c) =>
            `<div class="ln"><span>${esc(c.forma_pagamento)}${c.parcelas > 1 ? ` ${c.parcelas}x` : ""}</span><span>${fmt(c.valor_cobrado || c.valor)}</span></div>`
        )
        .join("")
    : `<div class="ln"><span>${esc(venda.forma_pagamento ?? "—")}</span><span>${fmt(venda.valor_total)}</span></div>`;

  const qtdTotal = itens.reduce((s, i) => s + Number(i.quantidade || 0), 0);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Cupom ${esc(venda.numero ?? "")}</title>
<style>
  @page { size: 80mm auto; margin: 4mm; }
  * { box-sizing: border-box; }
  body { font-family: "Courier New", monospace; font-size: 11px; color: #000; margin: 0; width: 72mm; }
  .c { text-align: center; }
  .b { font-weight: bold; }
  img { max-width: 40mm; display: block; margin: 0 auto 4px; }
  .sep { border-top: 1px dashed #000; margin: 6px 0; }
  .ln { display: flex; justify-content: space-between; gap: 6px; }
  .item { margin-bottom: 3px; }
  .desc { word-break: break-word; }
  .total { font-size: 15px; font-weight: bold; }
  .peq { font-size: 9.5px; }
</style>
</head>
<body>
  <div class="c">
    <img src="${logoUrl()}" alt="" />
    <div class="b">${esc(empresa?.nome ?? CONTRATO_CABECALHO.empresa)}</div>
    <div class="peq">${esc(CONTRATO_CABECALHO.documento)}</div>
    <div class="peq">${esc(CONTRATO_CABECALHO.endereco)}</div>
    <div class="peq">${esc(CONTRATO_CABECALHO.telefone)}</div>
  </div>
  <div class="sep"></div>
  <div class="c b">CUPOM DE VENDA — BALCÃO (IN)</div>
  <div class="c peq">DOCUMENTO NÃO FISCAL</div>
  <div class="sep"></div>
  <div class="ln"><span>Cupom</span><span>${esc(venda.numero ?? "—")}</span></div>
  <div class="ln"><span>Data</span><span>${fmtData(venda.data)}</span></div>
  <div class="ln"><span>Operador</span><span>${esc(venda.vendedor ?? "—")}</span></div>
  <div class="ln"><span>Cliente</span><span>${esc((cliente?.nome ?? venda.cliente_nome ?? "Consumidor").slice(0, 22))}</span></div>
  ${cliente?.documento ? `<div class="ln"><span>CPF/CNPJ</span><span>${esc(cliente.documento)}</span></div>` : ""}
  <div class="sep"></div>
  ${linhas}
  <div class="sep"></div>
  <div class="ln"><span>Itens / Qtd</span><span>${itens.length} / ${qtdTotal}</span></div>
  <div class="ln total"><span>TOTAL</span><span>${fmt(venda.valor_total)}</span></div>
  ${venda.valor_entrada ? `<div class="ln"><span>Entrada/Pago</span><span>${fmt(venda.valor_entrada)}</span></div>` : ""}
  ${venda.saldo_devedor ? `<div class="ln"><span>Saldo devedor</span><span>${fmt(venda.saldo_devedor)}</span></div>` : ""}
  <div class="sep"></div>
  <div class="b">PAGAMENTO</div>
  ${pagtos}
  ${venda.observacoes ? `<div class="sep"></div><div class="peq">Obs.: ${esc(venda.observacoes)}</div>` : ""}
  <div class="sep"></div>
  <div class="c peq">Obrigado pela preferência!</div>
  <div class="c peq">Este cupom não substitui documento fiscal.</div>
</body>
</html>`;
}

/* ======================================================================
 * 2. DOCUMENTO DE ORDEM DE SERVIÇO (A4 FRENTE E VERSO)
 * ====================================================================== */
export type HtmlOsProps = {
  ordem: {
    numero?: string | null;
    cliente_nome?: string | null;
    responsavel?: string | null;
    tipo_servico?: string | null;
    descricao?: string | null;
    data_agendada?: string | null;
    materiais_utilizados?: string | null;
    horas_trabalhadas?: number | null;
    status?: string | null;
    prioridade?: string | null;
    assinatura_nome?: string | null;
    assinatura_imagem?: string | null;
    assinatura_documento?: string | null;
    assinatura_em?: string | null;
  };
  cliente?: {
    nome?: string | null;
    documento?: string | null;
    telefone?: string | null;
    logradouro?: string | null;
    numero?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    estado?: string | null;
    endereco_obra?: string | null;
  } | null;
  itens?: Array<{
    descricao: string;
    quantidade: number;
  }>;
  empresa?: { nome: string; documento?: string; endereco?: string; contato?: string };
};

export function htmlOrdemServico({ ordem, cliente, itens = [], empresa }: HtmlOsProps): string {
  const endereco = cliente?.endereco_obra ||
    [cliente?.logradouro, cliente?.numero, cliente?.bairro, cliente?.cidade, cliente?.estado]
      .filter(Boolean)
      .join(", ") || "—";

  const dataPrevista = ordem.data_agendada ? fmtData(ordem.data_agendada) : "—";
  const modeloPiscina = ordem.tipo_servico || (itens.find((i) => /piscina|casco|spa/i.test(i.descricao))?.descricao ?? "—");

  const linhasItensChecklist = itens
    .map(
      (i) => `<tr>
        <td><strong>${i.quantidade}x</strong> ${esc(i.descricao)}</td>
        <td class="check"><span class="quadradinho"></span></td>
        <td class="check"><span class="quadradinho"></span></td>
      </tr>`
    )
    .join("");

  const linhasApoioVazias = Array.from({ length: 8 })
    .map(
      () => `<tr>
        <td style="height: 20px;"></td>
        <td class="check"><span class="quadradinho"></span></td>
        <td class="check"><span class="quadradinho"></span></td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Ordem de Serviço ${esc(ordem.numero ?? "")}</title>
<style>
  @page { size: A4 portrait; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #0f172a; margin: 0; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 6px; }
  .head .marca { display: flex; align-items: center; gap: 10px; }
  .head .marca img { height: 42px; width: auto; }
  .head-title { text-align: right; }
  .head-title h1 { font-size: 15px; margin: 0; text-transform: uppercase; letter-spacing: .08em; }
  .head-title p { margin: 2px 0 0; font-size: 10px; color: #475569; }
  .tabela-campos { width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid #0f172a; }
  .tabela-campos td { border: 1px solid #0f172a; padding: 4px 6px; vertical-align: top; }
  .rotulo { font-size: 8.5px; text-transform: uppercase; font-weight: bold; color: #475569; letter-spacing: .06em; display: block; }
  .valor { font-size: 11.5px; font-weight: 500; color: #0f172a; margin-top: 1px; min-height: 14px; }
  .secao { border: 1px solid #0f172a; margin-top: 10px; }
  .secao-header { background: #f1f5f9; border-bottom: 1px solid #0f172a; padding: 4px 8px; font-size: 9.5px; font-weight: bold; text-transform: uppercase; letter-spacing: .08em; }
  .desenho-wrapper { text-align: center; padding: 8px; }
  .desenho-wrapper img { max-height: 120mm; width: auto; object-fit: contain; }
  .borda-referencia { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #0f172a; padding: 6px 10px; font-size: 10px; font-weight: 600; }
  .quadradinho { display: inline-block; width: 11px; height: 11px; border: 1px solid #0f172a; vertical-align: middle; margin-right: 4px; }
  .obs-box { padding: 6px 8px; min-height: 50px; font-size: 11px; white-space: pre-wrap; }
  .assinaturas { margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; text-align: center; }
  .assinaturas .linha { border-top: 1px solid #0f172a; padding-top: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
  .assinaturas img { max-height: 48px; margin: 0 auto 4px; display: block; }
  .quebra { page-break-before: always; }
  table.checklist { width: 100%; border-collapse: collapse; margin-top: 8px; border: 1px solid #0f172a; }
  table.checklist th, table.checklist td { border: 1px solid #0f172a; padding: 3px 6px; }
  table.checklist th { background: #f1f5f9; font-size: 9.5px; text-transform: uppercase; font-weight: bold; }
  table.checklist td.check { text-align: center; width: 85px; }
</style>
</head>
<body>
  <!-- ================= FRENTE ================= -->
  <div class="head">
    <div class="marca">
      <img src="${logoUrl()}" alt="Splash" />
      <div>
        <strong style="font-size: 13px;">${esc(empresa?.nome ?? CONTRATO_CABECALHO.empresa)}</strong>
        <div style="font-size: 9.5px; color: #475569;">Instalação de piscinas · ${esc(CONTRATO_CABECALHO.telefone)}</div>
      </div>
    </div>
    <div class="head-title">
      <h1>Ordem de Serviço</h1>
      <p>Instalação & Execução · Frente</p>
    </div>
  </div>

  <table class="tabela-campos">
    <tr>
      <td colspan="2"><span class="rotulo">Cliente</span><div class="valor">${esc(cliente?.nome ?? ordem.cliente_nome ?? "—")}</div></td>
      <td><span class="rotulo">Telefone</span><div class="valor">${esc(cliente?.telefone ?? "—")}</div></td>
      <td><span class="rotulo">Nº da O.S.</span><div class="valor"><strong>${esc(ordem.numero ?? "—")}</strong></div></td>
    </tr>
    <tr>
      <td colspan="2"><span class="rotulo">Endereço da obra / instalação</span><div class="valor">${esc(endereco)}</div></td>
      <td colspan="2"><span class="rotulo">Modelo da piscina</span><div class="valor">${esc(modeloPiscina)}</div></td>
    </tr>
    <tr>
      <td colspan="2"><span class="rotulo">Profissional responsável</span><div class="valor">${esc(ordem.responsavel ?? "—")}</div></td>
      <td><span class="rotulo">Data agendada</span><div class="valor">${dataPrevista}</div></td>
      <td><span class="rotulo">Status</span><div class="valor" style="text-transform: capitalize;">${esc(ordem.status ?? "aberto")}</div></td>
    </tr>
    <tr>
      <td colspan="4"><span class="rotulo">Descrição do serviço</span><div class="valor">${esc(ordem.descricao ?? "Instalação completa e nivelamento")}</div></td>
    </tr>
  </table>

  <div class="secao">
    <div class="secao-header">Desenho técnico — planta baixa e corte</div>
    <div class="desenho-wrapper">
      <img src="${plantaUrl()}" alt="Planta da piscina" />
    </div>
    <div class="borda-referencia">
      <div>
        <span style="margin-right: 14px;">BORDA:</span>
        <span class="quadradinho"></span> Normal &nbsp;&nbsp;&nbsp;&nbsp;
        <span class="quadradinho"></span> Rebaixada
      </div>
      <div>
        REFERÊNCIA DE NÍVEL: __________________________________
      </div>
    </div>
  </div>

  <div class="secao">
    <div class="secao-header">Observações da obra / instruções técnicas</div>
    <div class="obs-box">${esc(ordem.materiais_utilizados ? `Materiais: ${ordem.materiais_utilizados}\n` : "")}${esc(ordem.descricao ?? "")}</div>
  </div>

  <div class="assinaturas">
    <div>
      <div class="linha">Assinatura do Cliente / Aceite</div>
    </div>
    <div>
      <div class="linha">Responsável Técnico Splash</div>
    </div>
  </div>

  <!-- ================= VERSO ================= -->
  <div class="quebra"></div>
  <div class="head">
    <div class="marca">
      <img src="${logoUrl()}" alt="Splash" />
      <div>
        <strong style="font-size: 13px;">${esc(empresa?.nome ?? CONTRATO_CABECALHO.empresa)}</strong>
        <div style="font-size: 9.5px; color: #475569;">Checklist de conferência técnica</div>
      </div>
    </div>
    <div class="head-title">
      <h1>Checklist & Verso</h1>
      <p>O.S. ${esc(ordem.numero ?? "—")} · ${esc(cliente?.nome ?? ordem.cliente_nome ?? "")}</p>
    </div>
  </div>

  <table class="checklist">
    <thead>
      <tr>
        <th>Item / Equipamento / Descrição</th>
        <th style="width: 100px; text-align: center;">Loja (saída)</th>
        <th style="width: 100px; text-align: center;">Obra (recebido)</th>
      </tr>
    </thead>
    <tbody>
      ${linhasItensChecklist || '<tr><td colspan="3" style="text-align:center;padding:8px;">Itens carregados no pedido</td></tr>'}
      <tr>
        <td colspan="3" style="background:#f8fafc; font-weight:bold; font-size:9px; text-transform:uppercase; letter-spacing:.08em; padding: 4px 6px;">
          Itens de apoio e conferência de obra
        </td>
      </tr>
      ${linhasApoioVazias}
    </tbody>
  </table>

  <div class="secao" style="margin-top: 14px;">
    <div class="secao-header">Conferência dos itens e entrega técnica</div>
    <div class="obs-box" style="min-height: 40px; font-size: 10px;">
      Declaro que recebi os itens acima listados em perfeitas condições e com as devidas orientações de instalação, funcionamento e manutenção preliminar.
    </div>
  </div>

  <div class="assinaturas" style="margin-top: 36px;">
    <div>
      ${ordem.assinatura_imagem ? `<img src="${esc(ordem.assinatura_imagem)}" alt="Assinatura" />` : ""}
      <div class="linha">Cliente: ${esc(ordem.assinatura_nome ?? cliente?.nome ?? ordem.cliente_nome ?? "Responsável")}</div>
    </div>
    <div>
      <div class="linha">Técnico responsável / Montador</div>
    </div>
  </div>
</body>
</html>`;
}

/* ======================================================================
 * 3. DOCUMENTO DE ORDEM DE COMPRA (A4)
 * ====================================================================== */
export type HtmlOrdemCompraProps = {
  ordem: {
    numero?: string | null;
    data_pedido: string;
    previsao_entrega?: string | null;
    condicoes?: string | null;
    observacoes?: string | null;
    valor_produtos: number;
    desconto?: number;
    valor_total: number;
    valor_nota?: number | null;
    valor_pago?: number | null;
    obs_pagamento?: string | null;
  };
  fornecedor?: {
    nome?: string | null;
    documento?: string | null;
    telefone?: string | null;
    email?: string | null;
  } | null;
  itens: Array<{
    codigo?: string | null;
    descricao: string;
    cor?: string | null;
    pastilha?: string | null;
    cliente_nome?: string | null;
    unidade?: string | null;
    quantidade: number;
    valor_unitario: number;
    total: number;
  }>;
  empresa?: { nome: string; documento?: string; endereco?: string; contato?: string };
};

export function htmlOrdemCompra({ ordem, fornecedor, itens = [], empresa }: HtmlOrdemCompraProps): string {
  const empNome = empresa?.nome ?? "Splash Jardim do Trevo";
  const empDoc = empresa?.documento ?? "CNPJ 26.108.962/0001-52";
  const empEnd = empresa?.endereco ?? "Comércio e Instalação de Piscinas";

  const linhasItens = itens
    .map(
      (i) => `<tr>
        <td class="font-mono">${esc(i.codigo ?? "—")}</td>
        <td>${esc(i.descricao)}</td>
        <td>${esc(i.cor ?? "—")}</td>
        <td>${esc(i.pastilha ?? "—")}</td>
        <td>${esc(i.cliente_nome ?? "Estoque")}</td>
        <td style="text-align:center;">${esc(i.unidade ?? "un")}</td>
        <td class="num">${i.quantidade}</td>
        <td class="num">${fmt(i.valor_unitario)}</td>
        <td class="num">${fmt(i.total)}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Ordem de Compra ${esc(ordem.numero ?? "")}</title>
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111; margin: 0; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #7f1d1d; padding-bottom: 8px; }
  .head .marca { display: flex; align-items: center; gap: 10px; }
  .head .marca img { height: 44px; width: auto; }
  .head-title { text-align: right; }
  .head-title h1 { font-size: 16px; margin: 0; color: #7f1d1d; font-weight: bold; }
  .secao { border: 1px solid #7f1d1d; margin-top: 10px; }
  .secao-header { background: #fee2e2; border-bottom: 1px solid #7f1d1d; padding: 4px 8px; font-size: 9.5px; font-weight: bold; text-transform: uppercase; color: #7f1d1d; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; padding: 6px 8px; }
  .num { text-align: right; white-space: nowrap; }
  .font-mono { font-family: monospace; font-size: 10px; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid #7f1d1d; }
  th, td { border: 1px solid #f87171; padding: 4px 6px; vertical-align: top; font-size: 10.5px; }
  th { background: #fee2e2; color: #7f1d1d; font-size: 10px; text-transform: uppercase; }
  .totais { margin-top: 10px; border: 1px solid #7f1d1d; padding: 6px 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; font-size: 11px; }
  .totais .destaque { font-size: 13px; font-weight: bold; color: #7f1d1d; }
  .assinaturas { margin-top: 36px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; text-align: center; }
  .assinaturas .linha { border-top: 1px solid #111; padding-top: 4px; font-size: 10.5px; }
</style>
</head>
<body>
  <div class="head">
    <div class="marca">
      <img src="${logoUrl()}" alt="Splash" />
      <div>
        <strong style="font-size: 13px;">${esc(empNome)}</strong>
        <div style="font-size: 9.5px; color: #555;">${esc(empEnd)} · ${esc(empDoc)}</div>
      </div>
    </div>
    <div class="head-title">
      <h1>ORDEM DE COMPRA</h1>
      <div style="font-size: 12px; font-weight: bold;">Nº ${esc(ordem.numero ?? "—")}</div>
      <div style="font-size: 9.5px; color: #555;">Emissão: ${fmtData(ordem.data_pedido)} · Previsão: ${fmtData(ordem.previsao_entrega)}</div>
    </div>
  </div>

  <div class="secao">
    <div class="secao-header">Dados do fornecedor</div>
    <div class="grid">
      <div><strong>Fornecedor:</strong> ${esc(fornecedor?.nome ?? "—")}</div>
      <div><strong>CNPJ/CPF:</strong> ${esc(fornecedor?.documento ?? "—")}</div>
      <div><strong>Telefone:</strong> ${esc(fornecedor?.telefone ?? "—")}</div>
      <div><strong>E-mail:</strong> ${esc(fornecedor?.email ?? "—")}</div>
      <div style="grid-column: 1 / -1;"><strong>Condições de pagamento:</strong> ${esc(ordem.condicoes ?? "—")}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 10%;">Cód</th>
        <th>Descrição do produto</th>
        <th style="width: 10%;">Cor</th>
        <th style="width: 10%;">Pastilha</th>
        <th style="width: 14%;">Cliente / Destino</th>
        <th style="width: 5%; text-align: center;">Un.</th>
        <th class="num" style="width: 6%;">Qtd</th>
        <th class="num" style="width: 12%;">Valor unit.</th>
        <th class="num" style="width: 12%;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${linhasItens || '<tr><td colspan="9" style="text-align:center;padding:10px;">Nenhum item na ordem de compra</td></tr>'}
    </tbody>
  </table>

  <div class="totais">
    <div>Valor dos produtos: <strong>${fmt(ordem.valor_produtos)}</strong></div>
    <div>Desconto: <strong>${fmt(ordem.desconto ?? 0)}</strong></div>
    <div>Valor faturado na nota: <strong>${fmt(ordem.valor_nota ?? 0)}</strong></div>
    <div>Valor pago ao fornecedor: <strong>${fmt(ordem.valor_pago ?? 0)}</strong></div>
    <div class="destaque" style="grid-column: 1 / -1; margin-top: 4px; border-top: 1px dotted #7f1d1d; padding-top: 4px;">
      Valor total da compra: ${fmt(ordem.valor_total)}
    </div>
  </div>

  ${ordem.obs_pagamento ? `<div class="secao"><div class="secao-header">Observações de pagamento</div><div style="padding:6px 8px;">${esc(ordem.obs_pagamento)}</div></div>` : ""}
  ${ordem.observacoes ? `<div class="secao"><div class="secao-header">Observações gerais</div><div style="padding:6px 8px;">${esc(ordem.observacoes)}</div></div>` : ""}

  <div class="assinaturas">
    <div>
      <div class="linha">Comprador — ${esc(empNome)}</div>
    </div>
    <div>
      <div class="linha">Fornecedor — ${esc(fornecedor?.nome ?? "Representante")}</div>
    </div>
  </div>
</body>
</html>`;
}

/* ======================================================================
 * 4. DOCUMENTO DE CONTAS A PAGAR / RECEBER (RECIBO OFICIAL / FICHA FINANCEIRA)
 * ====================================================================== */
export type HtmlContaProps = {
  conta: {
    id?: string;
    tipo: "pagar" | "receber" | string;
    descricao: string;
    valor: number;
    vencimento?: string | null;
    data_pagamento?: string | null;
    status: string;
    parceiro?: string | null;
    categoria?: string | null;
    centro_custo?: string | null;
    forma_pagamento?: string | null;
    conta_bancaria?: string | null;
    numero_documento?: string | null;
    observacoes?: string | null;
    comprovante_path?: string | null;
  };
  empresa?: { nome: string; documento?: string; endereco?: string; contato?: string };
};

export function htmlReciboConta({ conta, empresa }: HtmlContaProps): string {
  const pagar = conta.tipo === "pagar";
  const titulo = pagar ? "RECIBO DE PAGAMENTO" : "RECIBO DE RECEBIMENTO";
  const subtitulo = pagar ? "Comprovante financeiro de despesa" : "Comprovante financeiro de quitação / receita";
  const empNome = empresa?.nome ?? CONTRATO_CABECALHO.empresa;
  const empDoc = empresa?.documento ?? CONTRATO_CABECALHO.documento;
  const statusPago = conta.status?.toLowerCase() === "pago" || Boolean(conta.data_pagamento);

  const hoje = new Date();
  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>${titulo} - ${esc(conta.descricao)}</title>
<style>
  @page { size: A4 portrait; margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #1e293b; margin: 0; line-height: 1.45; }
  .recibo-card { border: 2px solid #0f172a; padding: 20px; border-radius: 4px; max-width: 100%; margin: 0 auto; background: #fff; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 10px; }
  .head .marca { display: flex; align-items: center; gap: 12px; }
  .head .marca img { height: 46px; width: auto; }
  .head-title { text-align: right; }
  .head-title h1 { font-size: 16px; margin: 0; text-transform: uppercase; letter-spacing: .08em; color: #0f172a; }
  .head-title p { margin: 2px 0 0; font-size: 10px; color: #64748b; }
  .badge-status { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 9.5px; font-weight: bold; text-transform: uppercase; margin-top: 4px; }
  .badge-pago { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
  .badge-aberto { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
  .destaque-valor { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 12px 16px; margin: 16px 0; display: flex; justify-content: space-between; align-items: center; }
  .destaque-valor .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
  .destaque-valor .valor { font-size: 22px; font-weight: bold; color: ${pagar ? "#b91c1c" : "#15803d"}; }
  .grid-dados { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; margin: 14px 0; border: 1px solid #e2e8f0; padding: 12px; border-radius: 4px; }
  .campo { border-bottom: 1px dotted #cbd5e1; padding: 3px 0; }
  .campo .rotulo { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold; display: block; }
  .campo .conteudo { font-size: 11.5px; color: #0f172a; font-weight: 500; min-height: 16px; }
  .termo-quitacao { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px 14px; font-size: 10.5px; text-align: justify; margin: 16px 0; color: #334155; }
  .assinaturas { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center; }
  .assinaturas .linha { border-top: 1px solid #0f172a; padding-top: 4px; font-size: 10px; text-transform: uppercase; font-weight: 600; }
  .rodape { margin-top: 24px; border-top: 1px dashed #cbd5e1; padding-top: 8px; font-size: 9px; color: #64748b; text-align: center; }
</style>
</head>
<body>
  <div class="recibo-card">
    <div class="head">
      <div class="marca">
        <img src="${logoUrl()}" alt="Splash" />
        <div>
          <strong style="font-size: 13px;">${esc(empNome)}</strong>
          <div style="font-size: 9.5px; color: #64748b;">${esc(empDoc)}</div>
          <div style="font-size: 9px; color: #64748b;">${esc(CONTRATO_CABECALHO.endereco)} · ${esc(CONTRATO_CABECALHO.telefone)}</div>
        </div>
      </div>
      <div class="head-title">
        <h1>${titulo}</h1>
        <p>${subtitulo}</p>
        <span class="badge-status ${statusPago ? "badge-pago" : "badge-aberto"}">
          ${statusPago ? "Status: LIQUIDADO / PAGO" : `Status: ${esc(conta.status ?? "EM ABERTO")}`}
        </span>
      </div>
    </div>

    <div class="destaque-valor">
      <div>
        <div class="label">Valor Total do Lançamento</div>
        <div style="font-size: 10.5px; color: #475569; margin-top: 2px;">
          ${conta.tipo === "pagar" ? "Saída / Despesa autorizada" : "Entrada / Receita recebida"}
        </div>
      </div>
      <div class="valor">${fmt(conta.valor)}</div>
    </div>

    <div class="grid-dados">
      <div style="grid-column: 1 / -1;" class="campo">
        <span class="rotulo">Descrição do Lançamento</span>
        <div class="conteudo" style="font-weight: 600;">${esc(conta.descricao)}</div>
      </div>
      <div class="campo">
        <span class="rotulo">${pagar ? "Favorecido / Fornecedor" : "Pagador / Cliente"}</span>
        <div class="conteudo">${esc(conta.parceiro ?? "Não informado")}</div>
      </div>
      <div class="campo">
        <span class="rotulo">Número do Documento / NF-e</span>
        <div class="conteudo">${esc(conta.numero_documento ?? "—")}</div>
      </div>
      <div class="campo">
        <span class="rotulo">Data de Vencimento</span>
        <div class="conteudo">${fmtData(conta.vencimento)}</div>
      </div>
      <div class="campo">
        <span class="rotulo">Data de Liquidação / Pagamento</span>
        <div class="conteudo">${conta.data_pagamento ? fmtData(conta.data_pagamento) : (statusPago ? "Liquidado" : "Pendente")}</div>
      </div>
      <div class="campo">
        <span class="rotulo">Forma de Pagamento</span>
        <div class="conteudo">${esc(conta.forma_pagamento ?? "—")}</div>
      </div>
      <div class="campo">
        <span class="rotulo">Conta Bancária / Destino</span>
        <div class="conteudo">${esc(conta.conta_bancaria ?? "—")}</div>
      </div>
      <div class="campo">
        <span class="rotulo">Categoria</span>
        <div class="conteudo">${esc(conta.categoria ?? "—")}</div>
      </div>
      <div class="campo">
        <span class="rotulo">Centro de Custo</span>
        <div class="conteudo">${esc(conta.centro_custo ?? "—")}</div>
      </div>
      ${conta.observacoes ? `
      <div style="grid-column: 1 / -1;" class="campo">
        <span class="rotulo">Observações</span>
        <div class="conteudo">${esc(conta.observacoes)}</div>
      </div>` : ""}
    </div>

    <div class="termo-quitacao">
      ${statusPago
        ? `Declaramos para os devidos fins de direito que o valor acima discriminado de <strong>${fmt(conta.valor)}</strong> foi devidamente quitado em <strong>${fmtData(conta.data_pagamento ?? conta.vencimento)}</strong>, dando-se plena, geral e irrevogável quitação referente a este lançamento.`
        : `Título financeiro registrado para controle interno com vencimento previsto para <strong>${fmtData(conta.vencimento)}</strong> no valor de <strong>${fmt(conta.valor)}</strong>.`}
    </div>

    <div style="text-align: right; font-size: 10px; color: #475569; margin-top: 20px;">
      Campinas - SP, ${hoje.getDate()} de ${meses[hoje.getMonth()]} de ${hoje.getFullYear()}.
    </div>

    <div class="assinaturas">
      <div>
        <div class="linha">${esc(empNome)}<br /><span style="font-size: 8.5px; font-weight: normal; color: #64748b;">Administração / Financeiro</span></div>
      </div>
      <div>
        <div class="linha">${esc(conta.parceiro ?? (pagar ? "Favorecido" : "Pagador"))}<br /><span style="font-size: 8.5px; font-weight: normal; color: #64748b;">Assinatura do Responsável</span></div>
      </div>
    </div>

    <div class="rodape">
      Documento gerado eletronicamente pelo Piscinow ERP · ID: ${esc(conta.id ?? "—")} · ${esc(CONTRATO_CABECALHO.email)}
    </div>
  </div>
</body>
</html>`;
}
