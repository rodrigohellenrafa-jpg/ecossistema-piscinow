import { FileSignature, Printer, Files } from "lucide-react";

import { Button } from "@/components/ui/button";
import contratoSplash from "@/assets/contrato-splash-atualizado-2022.pdf.asset.json";
import formularioPedido from "@/assets/formulario-pedido-venda-splash.pdf.asset.json";

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

export function DocumentosVenda(_props: Props) {
  const abrirPedido = () => {
    window.open(formularioPedido.url, "_blank", "noopener,noreferrer");
  };

  const abrirContrato = () => {
    window.open(contratoSplash.url, "_blank", "noopener,noreferrer");
  };

  const imprimirPedidoEContrato = () => {
    abrirContrato();
    abrirPedido();
  };

  return (
    <>
      <Button variant="outline" onClick={abrirPedido}>
        <Printer /> Abrir pedido em PDF
      </Button>
      <Button variant="outline" onClick={abrirContrato}>
        <FileSignature /> Abrir contrato em PDF
      </Button>
      <Button onClick={imprimirPedidoEContrato}>
        <Files /> Abrir pedido + contrato
      </Button>
    </>
  );
}
