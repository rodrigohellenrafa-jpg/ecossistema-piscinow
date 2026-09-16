import { useState } from "react";
import { FileSignature, Printer, Files, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import contratoSplash from "@/assets/contrato-splash-atualizado-2022.pdf.asset.json";
import logoSplash from "@/assets/logo-splash.png.asset.json";
import {
  CONTRATO_ANEXO_DRENOS,
  CONTRATO_CABECALHO,
  CONTRATO_CLAUSULAS,
} from "@/lib/contrato-venda";

type Venda = {
  numero: string | null;
  data: string;
  vendedor: string | null;
  cliente_nome: string | null;
  valor_total: number;
  valor_entrada: number;
  saldo_devedor: number;
  parcelas: number;
  valor_parcela: number;
  forma_pagamento: string | null;
  observacoes: string | null;
  assinatura_nome?: string | null;
  assinatura_imagem?: string | null;
  assinatura_documento?: string | null;
  assinatura_codigo?: string | null;
  assinatura_em?: string | null;
  prazo_entrega?: string | null;
  endereco_instalacao?: string | null;
  materiais?: unknown;
  status_pedido?: string | null;
};

type Cliente = {
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

type Item = {
  id: string;
  sku: string | null;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  total: number;
};

type Condicao = {
  id: string;
  forma_pagamento: string;
  valor: number;
  parcelas: number;
  valor_parcela: number;
  valor_cobrado: number;
  data_prevista: string | null;
  bandeira: string | null;
  pago: boolean;
};

interface Props {
  venda: Venda;
  cliente: Cliente;
  itens: Item[];
  condicoes?: Condicao[];
  /** Dados da empresa emitente exibidos no cabeçalho. */
  empresa?: { nome: string; documento?: string; endereco?: string; contato?: string };
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtData = (d: string | null | undefined) =>
  d ? new Date(d + (d.length === 10 ? "T12:00:00" : "")).toLocaleDateString("pt-BR") : "—";

/** URL absoluta do logotipo, para o timbre funcionar dentro do iframe de impressão. */
const logoUrl = () =>
  typeof window !== "undefined" ? `${window.location.origin}${logoSplash.url}` : logoSplash.url;

const esc = (s: string | null | undefined) =>
  (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function materiaisLinhas(materiais: unknown): [string, string][] {
  if (!materiais || typeof materiais !== "object") return [];
  const rotulos: Record<string, string> = {
    areia_m3: "Areia (m³)",
    cimento_sc: "Cimento (sc)",
    blocos_un: "Blocos (un)",
    agua_m3: "Água (m³)",
    fios_eletrodutos: "Fios/Eletrodutos",
  };
  const out: [string, string][] = [];
  for (const [k, v] of Object.entries(materiais as Record<string, unknown>)) {
    if (v === null || v === undefined || v === "" || v === 0) continue;
    out.push([rotulos[k] ?? k, String(v)]);
  }
  return out;
}

function htmlPedido({ venda, cliente, itens, condicoes = [], empresa }: Props): string {
  const orcamento = venda.status_pedido === "orcamento";
  const titulo = orcamento ? "ORÇAMENTO" : "PEDIDO DE VENDA";
  const endereco = cliente
    ? [cliente.logradouro, cliente.numero, cliente.bairro, cliente.cidade, cliente.estado, cliente.cep]
        .filter(Boolean)
        .join(", ")
    : "";
  const mats = materiaisLinhas(venda.materiais);
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
        <td class="num">${c.parcelas}x</td>
        <td class="num">${fmt(c.valor_parcela)}</td>
        <td class="num">${fmt(c.valor_cobrado || c.valor)}</td>
        <td>${fmtData(c.data_prevista)}</td>
        <td>${c.pago ? "Pago" : "Pendente"}</td>
      </tr>`
    )
    .join("");
  const linhasMats = mats.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="num">${esc(v)}</td></tr>`).join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>${titulo} ${esc(venda.numero ?? "")}</title>
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #111; margin: 0; }
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
  .rotulo { font-size: 10px; color: #555; text-transform: uppercase; }
  .totais td { font-weight: bold; }
  .obs { border: 1px solid #bbb; min-height: 48px; padding: 6px; margin-top: 4px; white-space: pre-wrap; }
  .declaracao { font-size: 10.5px; color: #333; margin-top: 14px; text-align: justify; }
  .assinatura { margin-top: 36px; display: flex; justify-content: space-between; gap: 32px; }
  .assinatura .bloco { flex: 1; text-align: center; }
  .assinatura .linha { border-top: 1px solid #111; margin-top: 40px; padding-top: 4px; font-size: 11px; }
  .assinatura img { max-height: 56px; display: block; margin: 0 auto; }
  .interno { margin-top: 20px; border-top: 1px dashed #999; padding-top: 8px; font-size: 10.5px; color: #444; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body>
  <div class="head">
    <div class="marca">
      <img src="${logoUrl()}" alt="Logotipo" />
      <div>
      <h1>PEDIDO DE VENDA${venda.numero ? ` Nº ${esc(venda.numero)}` : ""}</h1>
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
    <tbody>${linhasItens}</tbody>
    <tfoot>
      <tr class="totais"><td colspan="4" class="num">Valor total</td><td class="num">${fmt(venda.valor_total)}</td></tr>
      <tr><td colspan="4" class="num">Entrada</td><td class="num">${fmt(venda.valor_entrada)}</td></tr>
      <tr><td colspan="4" class="num">Saldo devedor</td><td class="num">${fmt(venda.saldo_devedor)}</td></tr>
      <tr><td colspan="4" class="num">Parcelas</td><td class="num">${venda.parcelas}x de ${fmt(venda.valor_parcela)}</td></tr>
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

  <h2>Observações</h2>
  <div class="obs">${esc(venda.observacoes ?? "")}</div>

  <p class="declaracao">Declaro ter recebido e conferido as condições deste pedido de venda, ciente dos valores, prazos, itens e condições de pagamento aqui descritos, concordando integralmente com o estabelecido.</p>

  <div class="assinatura">
    <div class="bloco">
      ${venda.assinatura_imagem ? `<img src="${esc(venda.assinatura_imagem)}" alt="Assinatura do cliente" />` : ""}
      <div class="linha">Cliente${venda.assinatura_nome ? `: ${esc(venda.assinatura_nome)}` : ""}${venda.assinatura_documento ? ` · Doc: ${esc(venda.assinatura_documento)}` : ""}</div>
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

/** Contrato de venda preenchido com os dados do pedido (texto do contrato original). */
function htmlContrato({ venda, cliente, itens, condicoes = [], empresa }: Props): string {
  const enderecoCli = cliente
    ? [cliente.logradouro, cliente.numero, cliente.bairro, cliente.cidade, cliente.estado, cliente.cep]
        .filter(Boolean)
        .join(", ")
    : "";
  const mats = materiaisLinhas(venda.materiais);
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
        <td class="num">${c.parcelas}x</td>
        <td class="num">${fmt(c.valor_parcela)}</td>
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
      <div><span class="rotulo">Prazo de entrega (item 1)</span><div class="campo">${esc(venda.prazo_entrega ?? "")}</div></div>
      <div><span class="rotulo">Vendedor</span><div class="campo">${esc(venda.vendedor ?? "")}</div></div>
    </div>

    <h3>Item 6 — Produtos e serviços adquiridos</h3>
    <table>
      <thead><tr><th>SKU</th><th>Descrição</th><th class="num">Qtd</th><th class="num">Unitário</th><th class="num">Total</th></tr></thead>
      <tbody>${linhasItens}</tbody>
      <tfoot>
        <tr><td colspan="4" class="num"><strong>Valor total do contrato</strong></td><td class="num"><strong>${fmt(venda.valor_total)}</strong></td></tr>
        <tr><td colspan="4" class="num">Entrada</td><td class="num">${fmt(venda.valor_entrada)}</td></tr>
        <tr><td colspan="4" class="num">Saldo devedor</td><td class="num">${fmt(venda.saldo_devedor)}</td></tr>
      </tfoot>
    </table>

    <h3>Item 7 — Condição de pagamento</h3>
    ${condicoes.length
      ? `<table>
      <thead><tr><th>Forma</th><th class="num">Parcelas</th><th class="num">Parcela</th><th class="num">Valor</th><th>Previsão</th></tr></thead>
      <tbody>${linhasCond}</tbody>
    </table>`
      : `<p>${esc(venda.forma_pagamento ?? "")} — ${venda.parcelas}x de ${fmt(venda.valor_parcela)}</p>`}

    <h3>Item 8 — Material básico a ser fornecido pelo comprador</h3>
    ${mats.length
      ? `<table>
      <thead><tr><th>Material</th><th class="num">Quantidade</th></tr></thead>
      <tbody>${mats.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="num">${esc(v)}</td></tr>`).join("")}</tbody>
    </table>`
      : `<p>Quantidades a serem informadas pela equipe de instalação, conforme cláusula 8.1.1.</p>`}

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
    ${venda.assinatura_codigo || venda.assinatura_em
      ? `<p style="font-size:9.5px;color:#444;margin-top:12px">Controle interno${venda.assinatura_codigo ? ` · Código de assinatura: ${esc(venda.assinatura_codigo)}` : ""}${venda.assinatura_em ? ` · Assinado em: ${new Date(venda.assinatura_em).toLocaleString("pt-BR")}` : ""}</p>`
      : ""}
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

/** Imprime sem abrir aba nova: usa um iframe oculto na própria página. */
function imprimirHtml(html: string) {
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

export function DocumentosVenda(props: Props) {
  const [contratoAberto, setContratoAberto] = useState(false);

  const imprimirPedido = () => imprimirHtml(htmlPedido(props));
  const imprimirContrato = () => imprimirHtml(htmlContrato(props));

  const imprimirPedidoEContrato = () => {
    imprimirPedido();
    window.setTimeout(imprimirContrato, 1200);
  };

  return (
    <>
      <Button variant="outline" onClick={imprimirPedido}>
        <Printer /> Imprimir pedido de venda
      </Button>
      <Button variant="outline" onClick={imprimirContrato}>
        <FileSignature /> Imprimir contrato preenchido
      </Button>
      <Button variant="outline" onClick={() => setContratoAberto(true)}>
        <FileSignature /> Ver contrato original (PDF)
      </Button>
      <Button onClick={imprimirPedidoEContrato}>
        <Files /> Imprimir pedido + contrato
      </Button>

      <Dialog open={contratoAberto} onOpenChange={setContratoAberto}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Contrato de venda</DialogTitle>
            <DialogDescription className="sr-only">Visualização do contrato original de venda.</DialogDescription>
          </DialogHeader>
          <object
            data={contratoSplash.url}
            type="application/pdf"
            className="h-[70vh] w-full rounded-md border"
          >
            <iframe src={contratoSplash.url} title="Contrato de venda" className="h-[70vh] w-full" />
          </object>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => window.open(contratoSplash.url, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink /> Abrir em nova aba
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
