import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FileSignature, Printer, Files } from "lucide-react";

import { Button } from "@/components/ui/button";
import { brl, dataBR } from "@/lib/erp";
import logoSplash from "@/assets/logo-splash.png.asset.json";
import contratoSplash from "@/assets/contrato-splash-atualizado-2022.pdf.asset.json";

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

const EMPRESA_PADRAO = {
  nome: "Splash Jardim do Trevo",
  documento: "CNPJ 26.108.962/0001-52",
  endereco: "Comércio e Instalação de Piscinas",
  contato: "",
};

const enderecoCliente = (c: Cliente) =>
  c?.endereco_obra ||
  [c?.logradouro, c?.numero, c?.bairro, c?.cidade, c?.estado, c?.cep].filter(Boolean).join(", ") ||
  "—";

export function DocumentosVenda({ venda, cliente, itens, condicoes = [], empresa }: Props) {
  const emp = { ...EMPRESA_PADRAO, ...(empresa ?? {}) };
  const [modo, setModo] = useState<"pedido" | null>(null);
  const nomeCliente = cliente?.nome ?? venda.cliente_nome ?? "—";
  const docCliente = cliente?.documento ?? "—";
  const mats = (venda.materiais ?? {}) as Record<string, unknown>;
  const material = (chave: string) => {
    const v = mats[chave];
    return v === undefined || v === null || v === "" ? "—" : String(v);
  };

  useEffect(() => {
    if (!modo) return;
    document.body.classList.add("imprimindo-documento");
    const encerrar = () => {
      document.body.classList.remove("imprimindo-documento");
      setModo(null);
    };
    window.addEventListener("afterprint", encerrar);
    const t = window.setTimeout(() => window.print(), 120);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("afterprint", encerrar);
      document.body.classList.remove("imprimindo-documento");
    };
  }, [modo]);

  const abrirContrato = () => {
    window.open(contratoSplash.url, "_blank", "noopener,noreferrer");
  };

  const imprimirPedidoEContrato = () => {
    abrirContrato();
    setModo("pedido");
  };

  const documentos = (
    <div id="documentos-venda" className="doc-root">
      {modo === "pedido" && (
        <section className="doc-page doc-splash">
          <header className="doc-splash-header">
            <img src={logoSplash.url} alt="Splash" className="doc-splash-logo" />
            <div>
              <p className="doc-logo">{emp.nome}</p>
              <p className="doc-mini">
                Rua Clodomiro Franco de Andrade Junior, 96 - Jd. Leonor - Campinas/SP - CEP 13041-081
              </p>
              <p className="doc-mini">Fone: (19) 3272-1000</p>
              <p className="doc-mini">campinasjardimdotrevo@splashpiscinas.com</p>
              <p className="doc-mini">facebook.com/splashpiscinascampinasjardimdotrevo</p>
            </div>
            <div className="doc-right">
              <p className="doc-title">QUADRO RESUMO DE CONTRATO DE VENDA</p>
              <p className="doc-mini">Pedido nº {venda.numero ?? "—"}</p>
            </div>
          </header>

          <div className="doc-box doc-splash-box">
            <div className="doc-grid">
              <p>
                <strong>Data do pedido:</strong> {dataBR(venda.data)}
              </p>
              <p>
                <strong>Prazo de entrega:</strong> {venda.prazo_entrega ?? "—"}
              </p>
              <p className="doc-span2 doc-mini">
                A contar deste documento 100% faturado e / ou quitado
              </p>
            </div>
          </div>

          <div className="doc-box doc-splash-box">
            <div className="doc-grid">
              <p>
                <strong>Consultor de vendas:</strong> {venda.vendedor ?? "—"}
              </p>
              <p>
                <strong>E-mail:</strong> {cliente?.email ?? "—"}
              </p>
            </div>
          </div>

          <div className="doc-box doc-splash-box">
            <div className="doc-grid">
              <p className="doc-span2">
                <strong>Nome / Razão Social:</strong> {nomeCliente}
              </p>
              <p>
                <strong>CPF/CNPJ:</strong> {docCliente}
              </p>
              <p>
                <strong>RG / IE:</strong> ______________________
              </p>
              <p>
                <strong>Contato 1:</strong> {cliente?.telefone ?? "—"}
              </p>
              <p>
                <strong>Contato 2:</strong> ______________________
              </p>
              <p className="doc-span2">
                <strong>End. residencial:</strong> {enderecoCliente(cliente)}
              </p>
              <p className="doc-span2">
                <strong>End. instalação:</strong>{" "}
                {venda.endereco_instalacao || cliente?.endereco_obra || enderecoCliente(cliente)}
              </p>
            </div>
          </div>

          <table className="doc-table doc-itens">
            <thead>
              <tr>
                <th style={{ width: "14%" }}>Código</th>
                <th>Descrição</th>
                <th style={{ width: "10%" }}>Qtde</th>
                <th style={{ width: "16%" }}>$ Unitário</th>
                <th style={{ width: "16%" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((i) => (
                <tr key={i.id}>
                  <td>{i.sku ?? "—"}</td>
                  <td>{i.descricao}</td>
                  <td className="doc-center">{i.quantidade}</td>
                  <td className="doc-right-cell">{brl(i.preco_unitario)}</td>
                  <td className="doc-right-cell">{brl(i.total)}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 9 - itens.length) }).map((_, idx) => (
                <tr key={`vazio-${idx}`}>
                  <td>&nbsp;</td>
                  <td />
                  <td />
                  <td />
                  <td />
                </tr>
              ))}
              <tr>
                <td colSpan={4} className="doc-right-cell">
                  <strong>TOTAL:</strong>
                </td>
                <td className="doc-right-cell">
                  <strong>{brl(venda.valor_total)}</strong>
                </td>
              </tr>
            </tbody>
          </table>

          <table className="doc-table">
            <thead>
              <tr>
                <th>Entrada</th>
                <th>Saldo</th>
                <th>Parcelas</th>
                <th>Valor</th>
                <th>Vencimento</th>
              </tr>
            </thead>
            <tbody>
              {condicoes.length > 0 ? (
                condicoes.map((c) => (
                  <tr key={c.id}>
                    <td className="doc-center">{c.pago ? brl(c.valor) : "—"}</td>
                    <td className="doc-center">{c.pago ? "—" : brl(c.valor)}</td>
                    <td className="doc-center">{c.parcelas}x</td>
                    <td className="doc-center">{brl(c.valor_parcela)}</td>
                    <td className="doc-center">{c.data_prevista ? dataBR(c.data_prevista) : "—"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="doc-center">{brl(venda.valor_entrada)}</td>
                  <td className="doc-center">{brl(venda.saldo_devedor)}</td>
                  <td className="doc-center">{venda.parcelas}x</td>
                  <td className="doc-center">{brl(venda.valor_parcela)}</td>
                  <td className="doc-center">—</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="doc-box doc-splash-box">
            <p className="doc-box-title">Observações</p>
            <p>{venda.observacoes || " "}</p>
          </div>

          <table className="doc-table">
            <thead>
              <tr>
                <th>Areia (m³)</th>
                <th>Cimento (sc)</th>
                <th>Blocos (un.)</th>
                <th>Água (m³)</th>
                <th>Fios e eletrodutos</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="doc-center">{material("areia_m3")}</td>
                <td className="doc-center">{material("cimento_sc")}</td>
                <td className="doc-center">{material("blocos_un")}</td>
                <td className="doc-center">{material("agua_m3")}</td>
                <td className="doc-center">{material("fios_eletrodutos")}</td>
              </tr>
            </tbody>
          </table>

          <div className="doc-splash-final">
            <div className="doc-box doc-splash-box">
              <p className="doc-mini">
                Declaro estar ciente das informações acima descritas, e reitero ser minha vontade. Uma vez
                assinado, em caso de desistência, será cobrada multa por rescisão de 30% do valor do
                contrato. Reservamo-nos o direito de protestar este documento caso não haja o pagamento ou
                até mesmo da multa. Por fim, autorizo a cessão total das informações contidas nesse QUADRO
                RESUMO DE CONTRATO DE VENDA.
              </p>
            </div>
            <div className="doc-box doc-splash-box">
              <p className="doc-box-title">Assinatura</p>
              {venda.assinatura_imagem ? (
                <img
                  src={venda.assinatura_imagem}
                  alt="Assinatura do comprador"
                  className="doc-assinatura-img"
                />
              ) : null}
              <div className="doc-linha" />
              <p className="doc-mini">
                {venda.assinatura_nome ?? nomeCliente}
                {venda.assinatura_codigo ? ` · cód. ${venda.assinatura_codigo}` : ""}
              </p>
            </div>
          </div>

          <div className="doc-box doc-splash-box">
            <p className="doc-box-title">Controle interno</p>
            <div className="doc-grid doc-splash-controle">
              {[
                "Projeto solicitado",
                "Piscina",
                "O.S impressa",
                "Entrega técnica",
                "Projeto recebido",
                "Filtro",
                "O.S liberada",
                "1ª revisão",
                "Projeto enviado",
                "Acessórios",
                "O.S finalizada",
                "2ª revisão",
              ].map((c) => (
                <p key={c} className="doc-mini">
                  ☐ {c}
                </p>
              ))}
            </div>
          </div>

          <p className="doc-center doc-mini">A MELHOR PISCINA COM O MELHOR PREÇO!</p>
        </section>
      )}

    </div>
  );

  return (
    <>
      <Button variant="outline" onClick={() => setModo("pedido")}>
        <Printer /> Imprimir pedido
      </Button>
      <Button variant="outline" onClick={abrirContrato}>
        <FileSignature /> Abrir contrato em PDF
      </Button>
      <Button onClick={imprimirPedidoEContrato}>
        <Files /> Imprimir / Gerar PDF (pedido + contrato)
      </Button>
      {modo && typeof document !== "undefined" ? createPortal(documentos, document.body) : null}
    </>
  );
}
