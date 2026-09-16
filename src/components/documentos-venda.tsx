import { useState } from "react";
import { FileSignature, Printer, Files, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [aberto, setAberto] = useState<null | "pedido" | "contrato">(null);
  const doc =
    aberto === "contrato"
      ? { titulo: "Contrato de venda", url: contratoSplash.url }
      : { titulo: "Pedido de venda", url: formularioPedido.url };

  return (
    <>
      <Button variant="outline" onClick={() => setAberto("pedido")}>
        <Printer /> Ver pedido de venda
      </Button>
      <Button variant="outline" onClick={() => setAberto("contrato")}>
        <FileSignature /> Ver contrato
      </Button>
      <Button
        onClick={() => {
          window.open(formularioPedido.url, "_blank", "noopener,noreferrer");
          window.open(contratoSplash.url, "_blank", "noopener,noreferrer");
        }}
      >
        <Files /> Abrir pedido + contrato
      </Button>

      <Dialog open={aberto !== null} onOpenChange={(o) => !o && setAberto(null)}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{doc.titulo}</DialogTitle>
          </DialogHeader>
          <object
            data={doc.url}
            type="application/pdf"
            className="h-[70vh] w-full rounded-md border"
          >
            <iframe src={doc.url} title={doc.titulo} className="h-[70vh] w-full" />
          </object>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => window.open(doc.url, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink /> Abrir em nova aba
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
