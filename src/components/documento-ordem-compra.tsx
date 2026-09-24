import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FileDown, Mail, Printer } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { Button } from "@/components/ui/button";
import { brl, dataBR } from "@/lib/erp";
import logoSplash from "@/assets/logo-splash.png.asset.json";

type Ordem = {
  numero: string | null;
  data_pedido: string;
  previsao_entrega: string | null;
  condicoes: string | null;
  observacoes: string | null;
  valor_produtos: number;
  desconto: number;
  valor_total: number;
  valor_nota?: number | null;
  valor_pago?: number | null;
  obs_pagamento?: string | null;
};

type Fornecedor = {
  nome?: string | null;
  documento?: string | null;
  telefone?: string | null;
  email?: string | null;
} | null;

type Item = {
  id: string;
  codigo: string | null;
  descricao: string;
  unidade: string;
  quantidade: number;
  valor_unitario: number;
  desconto: number;
  total: number;
  cliente_nome: string | null;
};

interface Props {
  ordem: Ordem;
  fornecedor: Fornecedor;
  itens: Item[];
  empresa?: { nome: string; documento?: string; endereco?: string; contato?: string };
}

const EMPRESA_PADRAO = {
  nome: "Splash Jardim do Trevo",
  documento: "CNPJ 26.108.962/0001-52",
  endereco: "Comércio e Instalação de Piscinas",
  contato: "",
};


export function DocumentoOrdemCompra({ ordem, fornecedor, itens, empresa }: Props) {
  const emp = { ...EMPRESA_PADRAO, ...(empresa ?? {}) };
  const [imprimindo, setImprimindo] = useState(false);

  useEffect(() => {
    if (!imprimindo) return;
    document.body.classList.add("imprimindo-documento");
    const encerrar = () => {
      document.body.classList.remove("imprimindo-documento");
      setImprimindo(false);
    };
    window.addEventListener("afterprint", encerrar);
    const t = window.setTimeout(() => window.print(), 120);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("afterprint", encerrar);
      document.body.classList.remove("imprimindo-documento");
    };
  }, [imprimindo]);

  const assunto = `Ordem de Compra ${ordem.numero ?? ""} - ${emp.nome}`;
  const mensagemCurta = [
    "Olá,",
    "",
    `Segue em anexo nossa ordem de compra ${ordem.numero ?? ""} emitida em ${dataBR(ordem.data_pedido)}.`,
    `Valor total: ${brl(Number(ordem.valor_total))}`,
    "",
    "Favor confirmar o recebimento e o prazo de entrega.",
    "",
    emp.nome,
  ].join("\n");
  const mailto = `mailto:${fornecedor?.email ?? ""}?subject=${encodeURIComponent(
    assunto,
  )}&body=${encodeURIComponent(mensagemCurta)}`;


  const valorNota = Number(ordem.valor_nota ?? 0);
  const valorPago = Number(ordem.valor_pago ?? 0);

  const nomeArquivo = `Ordem-de-Compra-${(ordem.numero ?? "s-numero").replace(/[^\w-]/g, "")}.pdf`;

  /** Gera o PDF da ordem com todos os itens e devolve o documento. */
  const gerarPdf = async () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const m = 14;
    let y = m;

    try {
      const resp = await fetch(logoSplash.url);
      const blob = await resp.blob();
      const dataUrl: string = await new Promise((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(String(fr.result));
        fr.onerror = rej;
        fr.readAsDataURL(blob);
      });
      doc.addImage(dataUrl, "PNG", m, y, 34, 20);
    } catch {
      /* segue sem logo */
    }

    doc.setFontSize(14).setFont("helvetica", "bold");
    doc.text("ORDEM DE COMPRA", 196, y + 6, { align: "right" });
    doc.setFontSize(9).setFont("helvetica", "normal");
    doc.text(`Nº ${ordem.numero ?? "—"}`, 196, y + 12, { align: "right" });
    doc.text(`Emissão: ${dataBR(ordem.data_pedido)}`, 196, y + 17, { align: "right" });
    doc.text(`Previsão: ${dataBR(ordem.previsao_entrega)}`, 196, y + 22, { align: "right" });

    y += 24;
    doc.setFont("helvetica", "bold").setFontSize(11);
    doc.text(emp.nome, m, y);
    doc.setFont("helvetica", "normal").setFontSize(9);
    doc.text(`${emp.endereco} — ${emp.documento}`, m, y + 5);

    y += 12;
    doc.setDrawColor(153, 27, 27).line(m, y, 196, y);
    y += 6;

    doc.setFont("helvetica", "bold").setFontSize(10);
    doc.text("DADOS DO FORNECEDOR", m, y);
    doc.setFont("helvetica", "normal").setFontSize(9);
    y += 5;
    doc.text(`Fornecedor: ${fornecedor?.nome ?? "—"}`, m, y);
    doc.text(`CNPJ/CPF: ${fornecedor?.documento ?? "—"}`, 110, y);
    y += 5;
    doc.text(`Telefone: ${fornecedor?.telefone ?? "—"}`, m, y);
    doc.text(`E-mail: ${fornecedor?.email ?? "—"}`, 110, y);
    y += 5;
    doc.text(`Condições de pagamento: ${ordem.condicoes ?? "—"}`, m, y);

    autoTable(doc, {
      startY: y + 6,
      margin: { left: m, right: 14 },
      head: [["Código", "Descrição do produto", "Cliente / destino", "Un.", "Qtd", "Valor unit.", "Total"]],
      body: itens.map((i) => [
        i.codigo ?? "—",
        i.descricao,
        i.cliente_nome ?? "Estoque",
        i.unidade,
        String(i.quantidade),
        brl(Number(i.valor_unitario)),
        brl(Number(i.total)),
      ]),
      styles: { fontSize: 8, textColor: [69, 10, 10], lineColor: [153, 27, 27], lineWidth: 0.2 },
      headStyles: { fillColor: [254, 202, 202], textColor: [69, 10, 10], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [254, 242, 242] },
      columnStyles: {
        3: { halign: "center" },
        4: { halign: "center" },
        5: { halign: "right" },
        6: { halign: "right" },
      },
    });

    let ty = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
    doc.setFont("helvetica", "bold").setFontSize(10);
    doc.text("TOTALIZAÇÃO", m, ty);
    doc.setFont("helvetica", "normal").setFontSize(9);
    ty += 5;
    doc.text(`Valor dos produtos: ${brl(Number(ordem.valor_produtos))}`, m, ty);
    doc.text(`Desconto: ${brl(Number(ordem.desconto))}`, 110, ty);
    ty += 5;
    doc.text(`Valor faturado na nota: ${brl(valorNota)}`, m, ty);
    doc.text(`Valor pago ao fornecedor: ${brl(valorPago)}`, 110, ty);
    ty += 5;
    doc.setFont("helvetica", "bold");
    doc.text(`Valor total da compra: ${brl(Number(ordem.valor_total))}`, m, ty);
    doc.setFont("helvetica", "normal");

    if (ordem.obs_pagamento) {
      ty += 5;
      doc.text(doc.splitTextToSize(`Observação de pagamento: ${ordem.obs_pagamento}`, 182), m, ty);
      ty += 4;
    }
    if (ordem.observacoes) {
      ty += 6;
      doc.setFont("helvetica", "bold").text("OBSERVAÇÕES", m, ty);
      doc.setFont("helvetica", "normal");
      ty += 5;
      doc.text(doc.splitTextToSize(String(ordem.observacoes), 182), m, ty);
    }

    return doc;
  };

  const baixarPdf = async () => {
    const doc = await gerarPdf();
    doc.save(nomeArquivo);
  };

  /** Baixa o PDF e em seguida abre o e-mail para anexá-lo. */
  const enviarPorEmail = async () => {
    await baixarPdf();
    window.setTimeout(() => {
      window.location.href = mailto;
    }, 600);
  };


  const documento = (
    <div id="documentos-venda" className="doc-root">
      <section className="doc-page doc-compra">
        <header className="doc-header">
          <div>
            <img src={logoSplash.url} alt={emp.nome} className="mb-1 h-24 w-auto" />
            <p className="doc-logo">{emp.nome}</p>
            <p className="doc-mini">{emp.endereco}</p>
            <p className="doc-mini">{emp.documento}</p>
          </div>
          <div className="doc-right">
            <p className="doc-title">ORDEM DE COMPRA</p>
            <p className="doc-mini">Nº {ordem.numero ?? "—"}</p>
            <p className="doc-mini">Emissão: {dataBR(ordem.data_pedido)}</p>
            <p className="doc-mini">Previsão: {dataBR(ordem.previsao_entrega)}</p>
          </div>
        </header>

        <div className="doc-box">
          <p className="doc-box-title">Dados do fornecedor</p>
          <div className="doc-grid">
            <p>
              <strong>Fornecedor:</strong> {fornecedor?.nome ?? "—"}
            </p>
            <p>
              <strong>CNPJ/CPF:</strong> {fornecedor?.documento ?? "—"}
            </p>
            <p>
              <strong>Telefone:</strong> {fornecedor?.telefone ?? "—"}
            </p>
            <p>
              <strong>E-mail:</strong> {fornecedor?.email ?? "—"}
            </p>
            <p className="doc-span2">
              <strong>Condições de pagamento:</strong> {ordem.condicoes ?? "—"}
            </p>
          </div>
        </div>

        <table className="doc-table doc-itens-compra">
          <thead>
            <tr>
              <th style={{ width: "11%" }}>Código</th>
              <th>Descrição do produto</th>
              <th style={{ width: "16%" }}>Cliente / destino</th>
              <th style={{ width: "8%" }}>Un.</th>
              <th style={{ width: "8%" }}>Qtd</th>
              <th style={{ width: "14%" }}>Valor unit.</th>
              <th style={{ width: "14%" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((i) => (
              <tr key={i.id}>
                <td>{i.codigo ?? "—"}</td>
                <td>{i.descricao}</td>
                <td>{i.cliente_nome ?? "Estoque"}</td>
                <td className="doc-center">{i.unidade}</td>
                <td className="doc-center">{i.quantidade}</td>
                <td className="doc-right-cell">{brl(Number(i.valor_unitario))}</td>
                <td className="doc-right-cell">{brl(Number(i.total))}</td>
              </tr>
            ))}
            {Array.from({ length: Math.max(0, 8 - itens.length) }).map((_, idx) => (
              <tr key={`vazio-${idx}`}>
                <td>&nbsp;</td>
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
              </tr>
            ))}
          </tbody>
        </table>

        <div className="doc-box">
          <p className="doc-box-title">Totalização</p>
          <div className="doc-grid">
            <p>
              <strong>Valor dos produtos:</strong> {brl(Number(ordem.valor_produtos))}
            </p>
            <p>
              <strong>Desconto:</strong> {brl(Number(ordem.desconto))}
            </p>
            <p>
              <strong>Valor faturado na nota:</strong> {brl(valorNota)}
            </p>
            <p>
              <strong>Valor pago ao fornecedor:</strong> {brl(valorPago)}
            </p>
            <p className="doc-span2">
              <strong>Valor total da compra:</strong> {brl(Number(ordem.valor_total))}
            </p>
            {ordem.obs_pagamento ? (
              <p className="doc-span2">
                <strong>Observação de pagamento:</strong> {ordem.obs_pagamento}
              </p>
            ) : null}
          </div>
        </div>

        {ordem.observacoes ? (
          <div className="doc-box">
            <p className="doc-box-title">Observações</p>
            <p>{ordem.observacoes}</p>
          </div>
        ) : null}

        <div className="doc-assinaturas">
          <div>
            <div className="doc-linha" />
            <p className="doc-mini">Comprador — {emp.nome}</p>
          </div>
          <div>
            <div className="doc-linha" />
            <p className="doc-mini">Fornecedor — {fornecedor?.nome ?? "—"}</p>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <>
      <Button variant="outline" onClick={() => setImprimindo(true)}>
        <Printer /> Imprimir ordem de compra
      </Button>
      <Button variant="outline" onClick={baixarPdf}>
        <FileDown /> Baixar PDF do pedido
      </Button>
      <Button onClick={enviarPorEmail}>
        <Mail /> Gerar PDF e enviar por e-mail
      </Button>
      {imprimindo && typeof document !== "undefined"
        ? createPortal(documento, document.body)
        : null}
    </>
  );
}
