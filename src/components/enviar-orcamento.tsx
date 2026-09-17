import { useState } from "react";
import { Copy, Download, Link2, Mail, MessageCircle, Send, Share2 } from "lucide-react";
import { toast } from "sonner";

import { baixarBlob, gerarOrcamentoPdf } from "@/lib/orcamento-pdf";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/field";
import { brl, dataBR } from "@/lib/erp";

type Venda = {
  id?: string | null;
  cliente_id?: string | null;
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
  endereco_instalacao?: string | null;
  status_pedido?: string | null;
  prazo_entrega?: string | null;
  observacoes?: string | null;
};

type Cliente = {
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

type Item = {
  sku?: string | null;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  total: number;
};

const soDigitos = (v: string | null | undefined) => (v ?? "").replace(/\D/g, "");

export function EnviarOrcamento({
  venda,
  cliente,
  itens = [],
  empresa = "Splash Jardim do Trevo",
}: {
  venda: Venda;
  cliente: Cliente;
  itens?: Item[];
  empresa?: string;
}) {
  const orcamento = venda.status_pedido === "orcamento";
  const rotulo = orcamento ? "Orçamento" : "Pedido de venda";

  const [aberto, setAberto] = useState(false);

  // Quando a tela de origem não passou cliente/itens (lista de orçamentos),
  // buscamos os dados ao abrir para a mensagem e o PDF saírem completos.
  const { data: extra } = useQuery({
    queryKey: ["enviar-orcamento", venda.id],
    enabled: aberto && !!venda.id && (!cliente || itens.length === 0),
    queryFn: async () => {
      const [itensRes, clienteRes] = await Promise.all([
        supabase
          .from("venda_itens")
          .select("sku, descricao, quantidade, preco_unitario, total")
          .eq("venda_id", venda.id!),
        venda.cliente_id
          ? supabase
              .from("clientes")
              .select(
                "nome, documento, telefone, email, logradouro, numero, bairro, cidade, estado, cep",
              )
              .eq("id", venda.cliente_id)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);
      if (itensRes.error) throw itensRes.error;
      return {
        itens: (itensRes.data ?? []) as Item[],
        cliente: (clienteRes.data ?? null) as Cliente,
      };
    },
  });

  const clienteFinal: Cliente = cliente ?? extra?.cliente ?? null;
  const itensFinal: Item[] = itens.length ? itens : extra?.itens ?? [];

  const textoPadrao = [
    `Olá${clienteFinal?.nome ? ` ${clienteFinal.nome.split(" ")[0]}` : ""}! Segue o ${rotulo.toLowerCase()} Nº ${venda.numero ?? ""} da ${empresa}.`,
    venda.data ? `Data: ${dataBR(venda.data)}` : "",
    "",
    ...itensFinal.map(
      (i) =>
        `• ${i.descricao} — ${i.quantidade} x ${brl(Number(i.preco_unitario))} = ${brl(Number(i.total))}`,
    ),
    "",
    `Total: ${brl(Number(venda.valor_total ?? 0))}`,
    venda.prazo_entrega ? `Prazo de entrega: ${venda.prazo_entrega}` : "",
    venda.observacoes ? `Observações: ${venda.observacoes}` : "",
    "",
    orcamento
      ? "Este orçamento é válido por 15 dias e está sujeito a aprovação. Qualquer dúvida, é só responder por aqui!"
      : "Qualquer dúvida, é só responder por aqui!",
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const [telefone, setTelefone] = useState(clienteFinal?.telefone ?? "");
  const [email, setEmail] = useState(clienteFinal?.email ?? "");
  const [mensagem, setMensagem] = useState(textoPadrao);
  const [editado, setEditado] = useState(false);

  useEffect(() => {
    if (!editado) setMensagem(textoPadrao);
  }, [textoPadrao, editado]);

  useEffect(() => {
    if (clienteFinal?.telefone) setTelefone((t) => t || clienteFinal.telefone!);
    if (clienteFinal?.email) setEmail((e) => e || clienteFinal.email!);
  }, [clienteFinal?.telefone, clienteFinal?.email]);

  const assunto = `${rotulo} Nº ${venda.numero ?? ""} — ${empresa}`;

  /** Monta o link do WhatsApp já com a mensagem pronta. */
  const linkWhats = () => {
    const fone = soDigitos(telefone);
    const texto = encodeURIComponent(mensagem);
    if (fone.length < 10) return `https://wa.me/?text=${texto}`;
    const numero = fone.length <= 11 ? `55${fone}` : fone;
    return `https://wa.me/${numero}?text=${texto}`;
  };

  const enviarWhats = () => {
    const fone = soDigitos(telefone);
    if (fone.length < 10) {
      toast.error("Informe um telefone válido com DDD.");
      return;
    }
    window.open(linkWhats(), "_blank", "noopener");
  };

  const copiarLinkWhats = () => {
    void navigator.clipboard.writeText(linkWhats());
    toast.success("Link do WhatsApp copiado — é só colar onde quiser.");
  };

  const enviarEmail = () => {
    if (!email.includes("@")) {
      toast.error("Informe um e-mail válido.");
      return;
    }
    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
      assunto,
    )}&body=${encodeURIComponent(mensagem)}`;
  };

  const [gerando, setGerando] = useState(false);

  const criarPdf = async () => {
    setGerando(true);
    try {
      return await gerarOrcamentoPdf({ venda, cliente, itens, empresa });
    } finally {
      setGerando(false);
    }
  };

  const baixarPdf = async () => {
    try {
      const { blob, nome } = await criarPdf();
      baixarBlob(blob, nome);
      toast.success("PDF gerado.");
    } catch {
      toast.error("Não foi possível gerar o PDF.");
    }
  };

  const compartilharPdf = async () => {
    try {
      const { blob, nome } = await criarPdf();
      const arquivo = new File([blob], nome, { type: "application/pdf" });
      const nav = navigator as Navigator & {
        canShare?: (data: { files?: File[] }) => boolean;
        share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
      };
      if (nav.share && nav.canShare?.({ files: [arquivo] })) {
        await nav.share({ files: [arquivo], title: assunto, text: mensagem });
        return;
      }
      baixarBlob(blob, nome);
      toast.info("PDF baixado — anexe no WhatsApp ou no e-mail.");
    } catch {
      toast.error("Não foi possível compartilhar o PDF.");
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Send /> Enviar {orcamento ? "orçamento" : "pedido"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar {rotulo.toLowerCase()} para o cliente</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="WhatsApp (com DDD)">
              <Input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(19) 99999-9999"
              />
            </Field>
            <Field label="E-mail">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@email.com"
              />
            </Field>
          </div>
          <Field label="Mensagem">
            <Textarea rows={10} value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
          </Field>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                void navigator.clipboard.writeText(mensagem);
                toast.success("Mensagem copiada.");
              }}
            >
              <Copy /> Copiar
            </Button>
            <Button variant="outline" disabled={gerando} onClick={() => void baixarPdf()}>
              <Download /> Baixar PDF
            </Button>
            <Button variant="outline" disabled={gerando} onClick={() => void compartilharPdf()}>
              <Share2 /> Enviar PDF
            </Button>
            <Button variant="outline" onClick={enviarEmail}>
              <Mail /> Enviar por e-mail
            </Button>
            <Button variant="outline" onClick={copiarLinkWhats}>
              <Link2 /> Copiar link do WhatsApp
            </Button>
            <Button onClick={enviarWhats}>
              <MessageCircle /> Enviar no WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
