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

/** Monta o corpo do e-mail em texto simples com os itens da ordem. */
const corpoEmail = (ordem: Ordem, itens: Item[], empresaNome: string) => {
  const linhas = itens.map(
    (i) =>
      `- ${i.quantidade} ${i.unidade} | ${i.descricao}${i.codigo ? ` (cód. ${i.codigo})` : ""} | unit. ${brl(
        Number(i.valor_unitario),
      )} | total ${brl(Number(i.total))}`,
  );
  return [
    "Olá,",
    "",
    `Segue nossa ordem de compra ${ordem.numero ?? ""} emitida em ${dataBR(ordem.data_pedido)}.`,
    "",
    "ITENS:",
    ...linhas,
    "",
    `Valor total: ${brl(Number(ordem.valor_total))}`,
    ordem.previsao_entrega ? `Previsão de entrega: ${dataBR(ordem.previsao_entrega)}` : "",
    ordem.condicoes ? `Condições de pagamento: ${ordem.condicoes}` : "",
    ordem.observacoes ? `Observações: ${ordem.observacoes}` : "",
    "",
    "Favor confirmar o recebimento e o prazo de entrega.",
    "",
    "Atenciosamente,",
    empresaNome,
  ]
    .filter((l) => l !== "")
    .join("\n");
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
  const mailto = `mailto:${fornecedor?.email ?? ""}?subject=${encodeURIComponent(
    assunto,
  )}&body=${encodeURIComponent(corpoEmail(ordem, itens, emp.nome))}`;

  const valorNota = Number(ordem.valor_nota ?? 0);
  const valorPago = Number(ordem.valor_pago ?? 0);

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
      <Button asChild>
        <a href={mailto}>
          <Mail /> Enviar por e-mail
        </a>
      </Button>
      {imprimindo && typeof document !== "undefined"
        ? createPortal(documento, document.body)
        : null}
    </>
  );
}
