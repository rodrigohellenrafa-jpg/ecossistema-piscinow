import { useRef, useMemo } from "react";
import {
  Printer,
  FileDown,
  MessageCircle,
  Truck,
  Building2,
  Calendar,
  Users,
  PackageCheck,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brl, dataBR } from "@/lib/erp";
import logoSplash from "@/assets/logo-splash.png.asset.json";

export interface ItemCargaManifesto {
  ordem_numero?: string | null;
  cliente_nome: string;
  produto_nome: string;
  quantidade: number;
  valor_unitario?: number;
  valor_total?: number;
}

export interface CargaManifestoDados {
  id?: string;
  numero: string;
  fornecedor_nome: string;
  data_solicitacao: string;
  previsao_entrega?: string | null;
  status: string;
  total_itens: number;
  total_valor: number;
  volume_cubagem?: string | null;
  placa_veiculo?: string | null;
  motorista_contato?: string | null;
  observacoes?: string | null;
  itens: ItemCargaManifesto[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carga: CargaManifestoDados | null;
}

export function ManifestoCargaModal({ open, onOpenChange, carga }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!carga) return null;

  // Agrupa e consolida produtos idênticos por cliente para exibição clara de remessa
  const itensPorCliente = useMemo(() => {
    const acc: Record<string, ItemCargaManifesto[]> = {};
    for (const item of carga.itens) {
      const cliente = item.cliente_nome || "Estoque Geral";
      if (!acc[cliente]) acc[cliente] = [];
      const nomeNorm = (item.produto_nome || "").trim().toLowerCase();
      const existente = acc[cliente].find(
        (i) => (i.produto_nome || "").trim().toLowerCase() === nomeNorm,
      );
      if (existente) {
        existente.quantidade += item.quantidade;
        existente.valor_total = (existente.valor_total || 0) + (item.valor_total || 0);
        if (item.ordem_numero) {
          if (existente.ordem_numero) {
            if (!existente.ordem_numero.includes(item.ordem_numero)) {
              existente.ordem_numero = `${existente.ordem_numero}, ${item.ordem_numero}`;
            }
          } else {
            existente.ordem_numero = item.ordem_numero;
          }
        }
      } else {
        acc[cliente].push({ ...item });
      }
    }
    return acc;
  }, [carga.itens]);

  const clientesUnicos = Object.keys(itensPorCliente);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const textoItens = clientesUnicos
      .map((cliente) => {
        const itensCliente = itensPorCliente[cliente];
        const linhas = itensCliente
          .map((i) => `  • ${i.quantidade}x ${i.produto_nome}`)
          .join("\n");
        return `*Cliente: ${cliente}*\n${linhas}`;
      })
      .join("\n\n");

    const mensagem = encodeURIComponent(
      `*📦 PEDIDO DE CARGA CONSOLIDADA - PISCINOW / SPLASH*\n\n` +
        `*Manifesto:* ${carga.numero}\n` +
        `*Fornecedor:* ${carga.fornecedor_nome}\n` +
        `*Data do Pedido:* ${dataBR(carga.data_solicitacao)}\n` +
        (carga.previsao_entrega ? `*Previsão de Saída/Entrega:* ${dataBR(carga.previsao_entrega)}\n` : "") +
        (carga.placa_veiculo ? `*Placa do Veículo:* ${carga.placa_veiculo}\n` : "") +
        (carga.motorista_contato ? `*Motorista/Contato:* ${carga.motorista_contato}\n` : "") +
        `*Total de Itens:* ${carga.total_itens} un.\n` +
        `*Clientes Atendidos:* ${clientesUnicos.length}\n\n` +
        `*RELAÇÃO DE PRODUTOS POR DESTINO:*\n\n${textoItens}\n\n` +
        (carga.observacoes ? `*Observações:* ${carga.observacoes}\n\n` : "") +
        `Favor confirmar a liberação e carregamento deste lote. Obrigado!`,
    );

    window.open(`https://api.whatsapp.com/send?text=${mensagem}`, "_blank");
    toast.success("Mensagem do manifesto preparada para envio");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl print:max-h-none print:overflow-visible print:p-0 print:border-none print:bg-white print:text-black">
        <DialogHeader className="print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <Truck className="size-5 text-primary" />
                Manifesto de Carga #{carga.numero}
              </DialogTitle>
              <DialogDescription>
                Romaneio consolidado de carregamento e envio ao fornecedor {carga.fornecedor_nome}.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleWhatsApp}
                className="gap-1.5 text-xs bg-emerald-600/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-600/20"
              >
                <MessageCircle className="size-4" />
                Enviar WhatsApp
              </Button>
              <Button type="button" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
                <Printer className="size-4" />
                Imprimir / PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* ÁREA DO DOCUMENTO / MANIFESTO */}
        <div ref={printRef} className="space-y-6 pt-2 text-foreground print:text-black">
          {/* CABEÇALHO DO MANIFESTO */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <img
                src={logoSplash.url}
                alt="Splash Piscinas"
                className="h-14 w-auto object-contain"
              />
              <div>
                <h2 className="text-lg font-bold tracking-tight">PISCINOW LOGÍSTICA & OBRAS</h2>
                <p className="text-xs text-muted-foreground print:text-neutral-600">
                  Splash Jardim do Trevo · Manifesto de Transporte e Carga
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground print:text-neutral-600">
                Lote de Carga
              </p>
              <p className="font-mono text-xl font-black text-primary print:text-black">
                {carga.numero}
              </p>
              <Badge variant="outline" className="mt-1 font-mono text-[10px] uppercase">
                {carga.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* DADOS DA CARGA */}
          <div className="grid gap-4 rounded-xl border bg-muted/20 p-4 sm:grid-cols-3 print:bg-neutral-50 print:border-neutral-300">
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Building2 className="size-3.5" /> Fornecedor de Origem
              </p>
              <p className="font-semibold text-sm mt-0.5">{carga.fornecedor_nome}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3.5" /> Data da Solicitação
              </p>
              <p className="font-semibold text-sm mt-0.5">{dataBR(carga.data_solicitacao)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3.5" /> Previsão de Saída / Entrega
              </p>
              <p className="font-semibold text-sm mt-0.5">
                {carga.previsao_entrega ? dataBR(carga.previsao_entrega) : "A combinar"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Truck className="size-3.5" /> Placa / Veículo
              </p>
              <p className="font-semibold text-sm mt-0.5">{carga.placa_veiculo || "Não informada"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="size-3.5" /> Motorista / Contato
              </p>
              <p className="font-semibold text-sm mt-0.5">
                {carga.motorista_contato || "A definir pelo fornecedor"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <PackageCheck className="size-3.5" /> Resumo do Lote
              </p>
              <p className="font-semibold text-sm mt-0.5">
                {carga.total_itens} itens · {clientesUnicos.length} destino(s)
              </p>
            </div>
          </div>

          {/* DETALHAMENTO DE PRODUTOS POR CLIENTE */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Relação de Produtos por Cliente de Destino
              </h3>
              <span className="text-xs text-muted-foreground font-mono">
                {carga.total_itens} volumes no caminhão
              </span>
            </div>

            {clientesUnicos.map((cliente) => {
              const itens = itensPorCliente[cliente];
              const subtotalCliente = itens.reduce(
                (sum, i) => sum + Number(i.valor_total || 0),
                0,
              );
              return (
                <div
                  key={cliente}
                  className="rounded-lg border overflow-hidden print:border-neutral-300"
                >
                  <div className="bg-muted/40 p-2.5 px-3 flex items-center justify-between border-b print:bg-neutral-100">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-primary" />
                      <span className="font-bold text-sm">{cliente}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {itens.length} {itens.length === 1 ? "item" : "itens"} ·{" "}
                      {brl(subtotalCliente)}
                    </span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="text-xs bg-muted/10 print:bg-white">
                        <TableHead className="w-24">Ordem (O.C.)</TableHead>
                        <TableHead>Produto / Descrição</TableHead>
                        <TableHead className="w-20 text-right">Qtd</TableHead>
                        <TableHead className="w-28 text-right">Valor Unit.</TableHead>
                        <TableHead className="w-28 text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itens.map((item, idx) => (
                        <TableRow key={idx} className="text-xs">
                          <TableCell className="font-mono text-muted-foreground">
                            {item.ordem_numero || "O.C."}
                          </TableCell>
                          <TableCell className="font-medium">{item.produto_nome}</TableCell>
                          <TableCell className="text-right font-bold">
                            {item.quantidade} un.
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {item.valor_unitario ? brl(item.valor_unitario) : "—"}
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            {item.valor_total ? brl(item.valor_total) : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              );
            })}
          </div>

          {/* OBSERVAÇÕES E TOTAIS */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-t pt-4">
            <div className="flex-1 text-xs text-muted-foreground print:text-neutral-600">
              {carga.observacoes && (
                <p>
                  <strong>Instruções Logísticas:</strong> {carga.observacoes}
                </p>
              )}
              {carga.volume_cubagem && (
                <p className="mt-1">
                  <strong>Cubagem Estimada:</strong> {carga.volume_cubagem}
                </p>
              )}
              <p className="mt-2 text-[10px] text-muted-foreground/80">
                Documento emitido eletronicamente via Piscinow ERP em{" "}
                {new Date().toLocaleString("pt-BR")}.
              </p>
            </div>
            <div className="text-right w-full sm:w-auto p-3 rounded-lg border bg-muted/10 print:bg-transparent">
              <p className="text-xs text-muted-foreground">Valor Total da Carga</p>
              <p className="text-xl font-bold font-mono text-primary print:text-black">
                {brl(carga.total_valor)}
              </p>
            </div>
          </div>

          {/* CAMPOS DE ASSINATURA PARA IMPRESSÃO */}
          <div className="hidden print:grid grid-cols-2 gap-12 pt-14 text-center text-xs">
            <div className="border-t pt-2 border-neutral-400">
              <p className="font-semibold">Responsável pela Expedição (Fornecedor)</p>
              <p className="text-neutral-500 mt-0.5">Assinatura / Data</p>
            </div>
            <div className="border-t pt-2 border-neutral-400">
              <p className="font-semibold">Transportador / Motorista</p>
              <p className="text-neutral-500 mt-0.5">Assinatura / Placa</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
