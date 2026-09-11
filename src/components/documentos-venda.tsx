import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FileSignature, Printer, Files } from "lucide-react";

import { Button } from "@/components/ui/button";
import { brl, dataBR } from "@/lib/erp";

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

const hojeExtenso = () =>
  new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

export function DocumentosVenda({ venda, cliente, itens, condicoes = [], empresa }: Props) {
  const emp = { ...EMPRESA_PADRAO, ...(empresa ?? {}) };
  const [modo, setModo] = useState<"pedido" | "contrato" | "ambos" | null>(null);
  const nomeCliente = cliente?.nome ?? venda.cliente_nome ?? "—";
  const docCliente = cliente?.documento ?? "—";

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

  const cabecalho = (titulo: string) => (
    <header className="doc-header">
      <div>
        <img src={logoSplash.url} alt="Splash Jardim do Trevo" className="mb-1 h-16 w-auto" />
        <p className="doc-logo">{emp.nome}</p>
        <p className="doc-mini">{emp.endereco}</p>
        <p className="doc-mini">{emp.documento}</p>
        {emp.contato ? <p className="doc-mini">{emp.contato}</p> : null}
      </div>
      <div className="doc-right">
        <p className="doc-title">{titulo}</p>
        <p className="doc-mini">Nº {venda.numero ?? "—"}</p>
        <p className="doc-mini">Emissão: {dataBR(venda.data)}</p>
      </div>
    </header>
  );

  const documentos = (
    <div id="documentos-venda" className="doc-root">
      {(modo === "pedido" || modo === "ambos") && (
        <section className="doc-page">
          {cabecalho("PEDIDO DE VENDA")}

          <div className="doc-box">
            <p className="doc-box-title">Dados do cliente</p>
            <div className="doc-grid">
              <p>
                <strong>Nome:</strong> {nomeCliente}
              </p>
              <p>
                <strong>CPF/CNPJ:</strong> {docCliente}
              </p>
              <p>
                <strong>Telefone:</strong> {cliente?.telefone ?? "—"}
              </p>
              <p>
                <strong>E-mail:</strong> {cliente?.email ?? "—"}
              </p>
              <p className="doc-span2">
                <strong>Endereço / obra:</strong> {enderecoCliente(cliente)}
              </p>
              <p className="doc-span2">
                <strong>Vendedor:</strong> {venda.vendedor ?? "—"}
              </p>
            </div>
          </div>

          <table className="doc-table doc-itens">
            <thead>
              <tr>
                <th style={{ width: "12%" }}>Código</th>
                <th>Descrição do produto / serviço</th>
                <th style={{ width: "10%" }}>Qtd</th>
                <th style={{ width: "16%" }}>Valor unit.</th>
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
              {Array.from({ length: Math.max(0, 8 - itens.length) }).map((_, idx) => (
                <tr key={`vazio-${idx}`}>
                  <td>&nbsp;</td>
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
                <strong>Valor total do pedido:</strong> {brl(venda.valor_total)}
              </p>
              <p>
                <strong>Entrada / pago:</strong> {brl(venda.valor_entrada)}
              </p>
              <p>
                <strong>Saldo a pagar:</strong> {brl(venda.saldo_devedor)}
              </p>
              <p>
                <strong>Parcelamento:</strong>{" "}
                {venda.parcelas > 1
                  ? `${venda.parcelas}x de ${brl(venda.valor_parcela)}`
                  : venda.forma_pagamento || "À vista"}
              </p>
            </div>
          </div>

          {condicoes.length > 0 && (
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Condição de pagamento</th>
                  <th style={{ width: "18%" }}>Data</th>
                  <th style={{ width: "16%" }}>Parcelas</th>
                  <th style={{ width: "20%" }}>Valor parcela</th>
                </tr>
              </thead>
              <tbody>
                {condicoes.map((c) => (
                  <tr key={c.id}>
                    <td>
                      {c.forma_pagamento}
                      {c.bandeira ? ` · ${c.bandeira}` : ""} {c.pago ? "(pago)" : "(a receber)"}
                    </td>
                    <td className="doc-center">{c.data_prevista ? dataBR(c.data_prevista) : "—"}</td>
                    <td className="doc-center">{c.parcelas}x</td>
                    <td className="doc-right-cell">{brl(c.valor_parcela)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {venda.observacoes ? (
            <div className="doc-box">
              <p className="doc-box-title">Observações</p>
              <p>{venda.observacoes}</p>
            </div>
          ) : null}

          <div className="doc-assinaturas">
            <div>
              {venda.assinatura_imagem ? (
                <img src={venda.assinatura_imagem} alt="Assinatura do comprador" className="doc-assinatura-img" />
              ) : null}
              <div className="doc-linha" />
              <p className="doc-mini">
                Comprador — {venda.assinatura_nome ?? nomeCliente}
                {venda.assinatura_codigo ? ` · cód. ${venda.assinatura_codigo}` : ""}
              </p>
            </div>
            <div>
              <div className="doc-linha" />
              <p className="doc-mini">Vendedor — {venda.vendedor ?? emp.nome}</p>
            </div>
          </div>
        </section>
      )}

      {(modo === "contrato" || modo === "ambos") && (
        <section className="doc-page doc-contrato">
          {cabecalho("CONTRATO DE COMPRA E VENDA")}

          <p className="doc-p">
            <strong>CONTRATADA:</strong> {emp.nome}, {emp.documento}, doravante denominada VENDEDORA.
          </p>
          <p className="doc-p">
            <strong>CONTRATANTE:</strong> {nomeCliente}, inscrito(a) no CPF/CNPJ sob o nº {docCliente},
            residente/estabelecido(a) em {enderecoCliente(cliente)}, telefone {cliente?.telefone ?? "—"},
            doravante denominado(a) COMPRADOR(A).
          </p>

          <p className="doc-clausula">CLÁUSULA 1ª — DO OBJETO</p>
          <p className="doc-p">
            O presente contrato tem por objeto o fornecimento, pela VENDEDORA ao COMPRADOR, dos produtos e
            serviços discriminados no Pedido de Venda nº {venda.numero ?? "—"}, emitido em {dataBR(venda.data)},
            a saber:
          </p>
          <table className="doc-table doc-itens">
            <thead>
              <tr>
                <th>Item</th>
                <th style={{ width: "10%" }}>Qtd</th>
                <th style={{ width: "18%" }}>Valor unit.</th>
                <th style={{ width: "18%" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((i) => (
                <tr key={i.id}>
                  <td>{i.descricao}</td>
                  <td className="doc-center">{i.quantidade}</td>
                  <td className="doc-right-cell">{brl(i.preco_unitario)}</td>
                  <td className="doc-right-cell">{brl(i.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="doc-clausula">CLÁUSULA 2ª — DO PREÇO E FORMA DE PAGAMENTO</p>
          <p className="doc-p">
            O valor total ajustado é de <strong>{brl(venda.valor_total)}</strong>, sendo{" "}
            {brl(venda.valor_entrada)} a título de entrada e o saldo de {brl(venda.saldo_devedor)} pago
            {venda.parcelas > 1
              ? ` em ${venda.parcelas} parcelas de ${brl(venda.valor_parcela)}`
              : ` conforme condição ${venda.forma_pagamento ?? "acordada"}`}
            . As condições registradas no pedido integram este contrato para todos os fins, inclusive eventuais
            acréscimos de operadora de cartão suportados pelo COMPRADOR.
          </p>

          <p className="doc-clausula">CLÁUSULA 3ª — DA ENTREGA E EXECUÇÃO</p>
          <p className="doc-p">
            A entrega dos produtos e a execução dos serviços ocorrerão no endereço indicado pelo COMPRADOR,
            após a confirmação do pagamento da entrada e mediante local preparado e com acesso adequado para
            equipamentos e equipe. Atrasos causados por condições do local, clima ou terceiros prorrogam
            automaticamente os prazos, sem ônus para a VENDEDORA.
          </p>

          <p className="doc-clausula">CLÁUSULA 4ª — DA GARANTIA</p>
          <p className="doc-p">
            Os produtos possuem a garantia legal e a garantia oferecida por seus respectivos fabricantes. A
            garantia não cobre danos decorrentes de uso indevido, falta de manutenção, alterações feitas por
            terceiros ou eventos da natureza.
          </p>

          <p className="doc-clausula">CLÁUSULA 5ª — DA RESCISÃO</p>
          <p className="doc-p">
            O descumprimento de qualquer cláusula faculta à parte prejudicada a rescisão do contrato. Em caso
            de desistência do COMPRADOR após o início da produção ou execução, serão descontados os custos já
            incorridos pela VENDEDORA.
          </p>

          <p className="doc-clausula">CLÁUSULA 6ª — DO FORO</p>
          <p className="doc-p">
            As partes elegem o foro da comarca da sede da VENDEDORA para dirimir questões oriundas deste
            contrato, com renúncia a qualquer outro, por mais privilegiado que seja.
          </p>

          <p className="doc-p">
            E, por estarem justas e contratadas, as partes assinam o presente instrumento em duas vias de igual
            teor. {hojeExtenso()}.
          </p>

          <div className="doc-assinaturas">
            <div>
              {venda.assinatura_imagem ? (
                <img src={venda.assinatura_imagem} alt="Assinatura do cliente" className="doc-assinatura-img" />
              ) : null}
              <div className="doc-linha" />
              <p className="doc-mini">{venda.assinatura_nome ?? nomeCliente} — COMPRADOR(A)</p>
              <p className="doc-mini">CPF/CNPJ: {venda.assinatura_documento ?? docCliente}</p>
            </div>
            <div>
              <div className="doc-linha" />
              <p className="doc-mini">{emp.nome} — VENDEDORA</p>
              <p className="doc-mini">{emp.documento}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );

  return (
    <>
      <Button variant="outline" onClick={() => setModo("pedido")}>
        <Printer /> Imprimir pedido
      </Button>
      <Button variant="outline" onClick={() => setModo("contrato")}>
        <FileSignature /> Imprimir contrato
      </Button>
      <Button onClick={() => setModo("ambos")}>
        <Files /> Imprimir / Gerar PDF (pedido + contrato)
      </Button>
      {modo && typeof document !== "undefined" ? createPortal(documentos, document.body) : null}
    </>
  );
}
