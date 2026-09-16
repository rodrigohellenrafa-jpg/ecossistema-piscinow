import { jsPDF } from "jspdf";

import logoSplash from "@/assets/logo-splash.png.asset.json";
import { CONTRATO_CABECALHO } from "@/lib/contrato-venda";

export type PdfVenda = {
  numero?: string | null;
  data?: string | null;
  vendedor?: string | null;
  cliente_nome?: string | null;
  valor_total?: number | string | null;
  valor_entrada?: number | string | null;
  saldo_devedor?: number | string | null;
  parcelas?: number | null;
  valor_parcela?: number | string | null;
  forma_pagamento?: string | null;
  prazo_entrega?: string | null;
  endereco_instalacao?: string | null;
  observacoes?: string | null;
  status_pedido?: string | null;
};

export type PdfCliente = {
  nome?: string | null;
  documento?: string | null;
  telefone?: string | null;
  email?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
} | null;

export type PdfItem = {
  sku?: string | null;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  total: number;
};

const num = (v: unknown) => Number(v ?? 0) || 0;
const brl = (v: unknown) =>
  num(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dt = (d?: string | null) =>
  d ? new Date(d + (d.length === 10 ? "T12:00:00" : "")).toLocaleDateString("pt-BR") : "—";

async function logoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch(logoSplash.url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Gera o PDF do orçamento/pedido e devolve o arquivo pronto para baixar ou compartilhar. */
export async function gerarOrcamentoPdf({
  venda,
  cliente,
  itens,
  empresa = CONTRATO_CABECALHO.empresa,
}: {
  venda: PdfVenda;
  cliente: PdfCliente;
  itens: PdfItem[];
  empresa?: string;
}): Promise<{ blob: Blob; nome: string }> {
  const orcamento = venda.status_pedido === "orcamento";
  const titulo = orcamento ? "ORÇAMENTO" : "PEDIDO DE VENDA";
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const L = 14;
  const R = 196;
  let y = 14;

  const logo = await logoDataUrl();
  if (logo) {
    try {
      doc.addImage(logo, "PNG", L, y - 2, 22, 16);
    } catch {
      /* logo opcional */
    }
  }

  const textoX = logo ? L + 26 : L;
  doc.setFont("helvetica", "bold").setFontSize(14);
  doc.text(`${titulo}${venda.numero ? ` Nº ${venda.numero}` : ""}`, textoX, y + 3);
  doc.setFont("helvetica", "normal").setFontSize(8);
  doc.text(`${empresa} · ${CONTRATO_CABECALHO.documento}`, textoX, y + 8);
  doc.text(CONTRATO_CABECALHO.endereco, textoX, y + 12);
  doc.text(`${CONTRATO_CABECALHO.telefone} · ${CONTRATO_CABECALHO.email}`, textoX, y + 16);
  doc.setFontSize(9);
  doc.text(`Data: ${dt(venda.data)}`, R, y + 3, { align: "right" });
  doc.text(`Vendedor: ${venda.vendedor ?? "—"}`, R, y + 8, { align: "right" });

  y += 22;
  doc.setDrawColor(20).setLineWidth(0.5).line(L, y, R, y);
  y += 7;

  const secao = (t: string) => {
    doc.setFont("helvetica", "bold").setFontSize(10);
    doc.text(t.toUpperCase(), L, y);
    y += 1.5;
    doc.setLineWidth(0.2).line(L, y, R, y);
    y += 5;
    doc.setFont("helvetica", "normal").setFontSize(9);
  };

  const endereco = [
    cliente?.logradouro,
    cliente?.numero,
    cliente?.bairro,
    cliente?.cidade,
    cliente?.estado,
    cliente?.cep,
  ]
    .filter(Boolean)
    .join(", ");

  secao("Dados do cliente");
  const linhasCliente: [string, string][] = [
    ["Nome", cliente?.nome ?? venda.cliente_nome ?? "—"],
    ["Documento", cliente?.documento ?? "—"],
    ["Telefone", cliente?.telefone ?? "—"],
    ["E-mail", cliente?.email ?? "—"],
  ];
  linhasCliente.forEach(([k, v], i) => {
    const col = i % 2 === 0 ? L : L + 92;
    if (i % 2 === 0 && i > 0) y += 5;
    doc.setFont("helvetica", "bold").text(`${k}: `, col, y);
    doc.setFont("helvetica", "normal").text(String(v).slice(0, 48), col + doc.getTextWidth(`${k}: `), y);
  });
  y += 6;
  if (endereco) {
    doc.setFont("helvetica", "bold").text("Endereço: ", L, y);
    doc.setFont("helvetica", "normal").text(endereco.slice(0, 110), L + doc.getTextWidth("Endereço: "), y);
    y += 5;
  }
  if (venda.endereco_instalacao) {
    doc.setFont("helvetica", "bold").text("Local da obra: ", L, y);
    doc
      .setFont("helvetica", "normal")
      .text(String(venda.endereco_instalacao).slice(0, 105), L + doc.getTextWidth("Local da obra: "), y);
    y += 5;
  }
  if (venda.prazo_entrega) {
    doc.setFont("helvetica", "bold").text("Prazo de entrega: ", L, y);
    doc
      .setFont("helvetica", "normal")
      .text(String(venda.prazo_entrega), L + doc.getTextWidth("Prazo de entrega: "), y);
    y += 5;
  }
  y += 3;

  // Itens
  secao("Itens");
  const colX = { desc: L + 2, qtd: 126, unit: 156, tot: R - 2 };
  doc.setFillColor(235).rect(L, y - 4, R - L, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.text("Descrição", colX.desc, y);
  doc.text("Qtd", colX.qtd, y, { align: "right" });
  doc.text("Unitário", colX.unit, y, { align: "right" });
  doc.text("Total", colX.tot, y, { align: "right" });
  y += 6;
  doc.setFont("helvetica", "normal");

  for (const it of itens) {
    if (y > 258) {
      doc.addPage();
      y = 20;
    }
    const desc = `${it.sku ? `${it.sku} · ` : ""}${it.descricao}`;
    const linhas = doc.splitTextToSize(desc, 100) as string[];
    doc.text(linhas, colX.desc, y);
    doc.text(String(it.quantidade), colX.qtd, y, { align: "right" });
    doc.text(brl(it.preco_unitario), colX.unit, y, { align: "right" });
    doc.text(brl(it.total), colX.tot, y, { align: "right" });
    y += Math.max(5, linhas.length * 4.4) + 1;
    doc.setDrawColor(210).setLineWidth(0.1).line(L, y - 2.5, R, y - 2.5);
  }

  y += 2;
  doc.setDrawColor(20).setLineWidth(0.3).line(L, y, R, y);
  y += 6;
  doc.setFont("helvetica", "bold").setFontSize(11);
  doc.text("Valor total", 150, y, { align: "right" });
  doc.text(brl(venda.valor_total), colX.tot, y, { align: "right" });
  y += 6;
  doc.setFont("helvetica", "normal").setFontSize(9);
  if (num(venda.valor_entrada) > 0) {
    doc.text("Entrada", 150, y, { align: "right" });
    doc.text(brl(venda.valor_entrada), colX.tot, y, { align: "right" });
    y += 5;
  }
  if (num(venda.saldo_devedor) > 0) {
    doc.text("Saldo devedor", 150, y, { align: "right" });
    doc.text(brl(venda.saldo_devedor), colX.tot, y, { align: "right" });
    y += 5;
  }
  if ((venda.parcelas ?? 0) > 1) {
    doc.text("Parcelamento", 150, y, { align: "right" });
    doc.text(`${venda.parcelas}x de ${brl(venda.valor_parcela)}`, colX.tot, y, { align: "right" });
    y += 5;
  }
  if (venda.forma_pagamento) {
    doc.text("Forma de pagamento", 150, y, { align: "right" });
    doc.text(String(venda.forma_pagamento), colX.tot, y, { align: "right" });
    y += 5;
  }
  y += 4;

  if (venda.observacoes) {
    if (y > 235) {
      doc.addPage();
      y = 20;
    }
    secao("Observações");
    const obs = doc.splitTextToSize(String(venda.observacoes), R - L) as string[];
    doc.text(obs, L, y);
    y += obs.length * 4.4 + 4;
  }

  if (orcamento) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    const aviso = doc.splitTextToSize(
      `Orçamento Nº ${venda.numero ?? ""} — sujeito a aprovação. Documento sem valor fiscal, válido por 15 dias a partir da data de emissão. Valores, prazos e disponibilidade podem ser revistos após esse período. A aprovação pelo cliente converte este orçamento em pedido de venda.`,
      R - L - 6,
    ) as string[];
    doc.setDrawColor(20).setLineWidth(0.3).rect(L, y - 4, R - L, aviso.length * 4.4 + 6);
    doc.text(aviso, L + 3, y);
    y += aviso.length * 4.4 + 10;
  }

  if (y > 250) {
    doc.addPage();
    y = 30;
  }
  y = Math.max(y, 250);
  doc.setDrawColor(20).line(L, y, L + 75, y);
  doc.line(R - 75, y, R, y);
  doc.setFontSize(8);
  doc.text(orcamento ? "Aprovação do cliente" : "Cliente", L, y + 4);
  doc.text(empresa, R, y + 4, { align: "right" });

  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFontSize(7.5).setTextColor(90);
    doc.text(
      `${CONTRATO_CABECALHO.empresa} · ${CONTRATO_CABECALHO.documento} · ${CONTRATO_CABECALHO.telefone} · ${CONTRATO_CABECALHO.email}`,
      105,
      288,
      { align: "center" },
    );
    doc.text(`Página ${p} de ${total}`, R, 288, { align: "right" });
    doc.setTextColor(0);
  }

  const nome = `${orcamento ? "orcamento" : "pedido"}-${(venda.numero ?? "sn").toString().replace(/\W+/g, "-")}.pdf`;
  return { blob: doc.output("blob"), nome };
}

export function baixarBlob(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}
