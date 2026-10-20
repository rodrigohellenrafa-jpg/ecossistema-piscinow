import { useEffect, useState, useMemo, useId } from "react";
import {
  Eye,
  Printer,
  FileDown,
  ExternalLink,
  Loader2,
  FileText,
  FileSignature,
  Receipt,
  FileCheck,
  Paperclip,
  ZoomIn,
  ZoomOut,
  Mail,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  htmlPedido,
  htmlContrato,
  htmlCupom,
  htmlOrdemServico,
  htmlOrdemCompra,
  htmlReciboConta,
  imprimirHtml,
} from "@/lib/documentos-html";
import logoSplash from "@/assets/logo-splash.png.asset.json";
import { brl, dataBR } from "@/lib/erp";
import { baixarBlob, gerarOrcamentoPdf } from "@/lib/orcamento-pdf";

export type TipoDocumento = "venda" | "os" | "ordem_compra" | "conta" | "custom";

export interface VisualizadorDocumentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo: TipoDocumento;
  id?: string | null;
  dados?: any;
  tituloCustom?: string;
  subtituloCustom?: string;
}

export function VisualizadorDocumentoModal({
  open,
  onOpenChange,
  tipo,
  id,
  dados: dadosIniciais,
  tituloCustom,
  subtituloCustom,
}: VisualizadorDocumentoModalProps) {
  const [carregando, setCarregando] = useState(false);
  const [dadosCompletos, setDadosCompletos] = useState<any>(dadosIniciais ?? null);
  const [abaAtiva, setAbaAtiva] = useState<string>("principal");
  const [zoom, setZoom] = useState<number>(100);
  const [urlAnexo, setUrlAnexo] = useState<string | null>(null);
  const [carregandoAnexo, setCarregandoAnexo] = useState(false);

  // Carrega dados completos quando abre o modal por ID se necessário
  useEffect(() => {
    if (!open) return;
    setZoom(100);

    // Ajusta a aba padrão conforme o tipo
    if (tipo === "venda") setAbaAtiva("pedido");
    else if (tipo === "os") setAbaAtiva("os_completa");
    else if (tipo === "ordem_compra") setAbaAtiva("oc_a4");
    else if (tipo === "conta") setAbaAtiva("recibo");
    else setAbaAtiva("principal");

    const carregar = async () => {
      setCarregando(true);
      try {
        if (tipo === "venda") {
          const vendaId = id || dadosIniciais?.id;
          if (!vendaId) {
            setDadosCompletos(dadosIniciais);
            return;
          }
          // Busca venda, cliente, itens, condições e pagamentos da venda
          const [resVenda, resItens, resCondicoes, resPagamentos] = await Promise.all([
            supabase.from("vendas").select("*").eq("id", vendaId).single(),
            supabase.from("venda_itens").select("*").eq("venda_id", vendaId).order("created_at", { ascending: true }),
            supabase.from("venda_condicoes").select("*").eq("venda_id", vendaId).order("parcelas", { ascending: true }),
            supabase.from("venda_pagamentos").select("*").eq("venda_id", vendaId).order("created_at", { ascending: true }),
          ]);
          if (resVenda.error) throw resVenda.error;
          const venda = resVenda.data;
          let cliente = null;
          if (venda.cliente_id) {
            const resCliente = await supabase.from("clientes").select("*").eq("id", venda.cliente_id).maybeSingle();
            cliente = resCliente.data;
          }

          let condicoesFinais = (resCondicoes.data ?? []) as any[];
          if (condicoesFinais.length === 0 && (resPagamentos.data ?? []).length > 0) {
            condicoesFinais = (resPagamentos.data ?? []).map((p) => ({
              id: p.id,
              forma_pagamento: p.forma_pagamento ?? "Pix",
              valor: Number(p.valor ?? 0),
              parcelas: 1,
              valor_parcela: Number(p.valor ?? 0),
              valor_cobrado: Number(p.valor ?? 0),
              data_prevista: p.data_pagamento ?? p.created_at ?? null,
              pago: true,
            }));
          } else if (condicoesFinais.length === 0 && Number(venda.valor_total ?? 0) > 0) {
            condicoesFinais = [
              {
                id: "cond-padrao",
                forma_pagamento: venda.forma_pagamento ?? "Pix",
                valor: Number(venda.valor_total ?? 0),
                parcelas: Number(venda.parcelas ?? 1),
                valor_parcela: Number(venda.valor_parcela ?? venda.valor_total ?? 0),
                valor_cobrado: Number(venda.valor_total ?? 0),
                data_prevista: venda.data ?? null,
                pago: venda.status_pagamento === "pago",
              },
            ];
          }

          setDadosCompletos({
            venda,
            cliente,
            itens: resItens.data ?? [],
            condicoes: condicoesFinais,
          });
        } else if (tipo === "os") {
          const osId = id || dadosIniciais?.id;
          if (!osId) {
            setDadosCompletos(dadosIniciais);
            return;
          }
          const { data: ordem, error: errOs } = await supabase
            .from("ordens_servico")
            .select("*")
            .eq("id", osId)
            .single();
          if (errOs) throw errOs;

          let cliente = null;
          if (ordem.cliente_id) {
            const resCli = await supabase.from("clientes").select("*").eq("id", ordem.cliente_id).maybeSingle();
            cliente = resCli.data;
          }

          let itens: any[] = [];
          const vendaId = ordem.venda_id;
          const vendasIds = Array.from(new Set([...(ordem.vendas_ids ?? []), ...(vendaId ? [vendaId] : [])]));
          if (vendasIds.length > 0) {
            const resItens = await supabase
              .from("venda_itens")
              .select("descricao, quantidade")
              .in("venda_id", vendasIds)
              .order("created_at", { ascending: true });
            itens = resItens.data ?? [];
          }

          setDadosCompletos({ ordem, cliente, itens });
        } else if (tipo === "ordem_compra") {
          const ocId = id || dadosIniciais?.id;
          if (!ocId) {
            setDadosCompletos(dadosIniciais);
            return;
          }
          const [resOrdem, resItens] = await Promise.all([
            supabase.from("ordens_compra").select("*").eq("id", ocId).single(),
            supabase.from("ordem_compra_itens").select("*").eq("ordem_id", ocId).order("created_at", { ascending: true }),
          ]);
          if (resOrdem.error) throw resOrdem.error;
          const ordem = resOrdem.data;
          let fornecedor = null;
          if (ordem.fornecedor_id) {
            const resForn = await supabase
              .from("fornecedores")
              .select("id, nome, cnpj, telefone, email")
              .eq("id", ordem.fornecedor_id)
              .maybeSingle();
            if (resForn.data) {
              fornecedor = {
                nome: resForn.data.nome,
                documento: resForn.data.cnpj,
                telefone: resForn.data.telefone,
                email: resForn.data.email,
              };
            }
          }
          setDadosCompletos({
            ordem,
            fornecedor: fornecedor || { nome: ordem.fornecedor_nome },
            itens: resItens.data ?? [],
          });
        } else if (tipo === "conta") {
          const contaId = id || dadosIniciais?.id;
          let conta = dadosIniciais;
          if (contaId && (!conta || !conta.descricao)) {
            const { data, error } = await supabase.from("contas").select("*").eq("id", contaId).single();
            if (error) throw error;
            conta = data;
          }
          setDadosCompletos({ conta });

          // Se tiver anexo de comprovante, busca URL assinada
          const path = conta?.comprovante_path;
          if (path) {
            setCarregandoAnexo(true);
            try {
              const { data: signData, error: errSign } = await supabase.storage
                .from("comprovantes")
                .createSignedUrl(path, 60 * 60);
              if (!errSign && signData?.signedUrl) {
                setUrlAnexo(signData.signedUrl);
              }
            } catch {
              setUrlAnexo(null);
            } finally {
              setCarregandoAnexo(false);
            }
          } else {
            setUrlAnexo(null);
          }
        } else {
          setDadosCompletos(dadosIniciais);
        }
      } catch (e) {
        console.error("Erro ao carregar dados do documento:", e);
        toast.error("Não foi possível carregar os dados completos do documento.");
      } finally {
        setCarregando(false);
      }
    };

    void carregar();
  }, [open, tipo, id, dadosIniciais]);

  // Gera os HTMLs correspondentes (inclusive contrato original e formulário original sem depender de blob/plugin PDF)
  const htmlDocMap = useMemo(() => {
    if (!dadosCompletos) return {};

    if (tipo === "venda") {
      const { venda, cliente, itens = [], condicoes = [] } = dadosCompletos;
      if (!venda) return {};
      const docPedido = htmlPedido({ venda, cliente, itens, condicoes });
      const docContrato = htmlContrato({ venda, cliente, itens, condicoes });
      const docContratoEmBranco = htmlContrato({
        venda: {
          numero: venda.numero ?? "",
          data: venda.data ?? "",
          vendedor: venda.vendedor ?? "",
          cliente_nome: venda.cliente_nome ?? "",
          valor_total: venda.valor_total ?? 0,
          valor_entrada: venda.valor_entrada ?? 0,
          saldo_devedor: venda.saldo_devedor ?? 0,
          forma_pagamento: venda.forma_pagamento ?? "",
          parcelas: venda.parcelas ?? 1,
          valor_parcela: venda.valor_parcela ?? venda.valor_total ?? 0,
          prazo_entrega: venda.prazo_entrega ?? "",
          endereco_instalacao: venda.endereco_instalacao ?? "",
          observacoes: venda.observacoes ?? "",
        },
        cliente,
        itens,
        condicoes,
      });
      return {
        pedido: docPedido,
        contrato: docContrato,
        cupom: htmlCupom({ venda, cliente, itens, condicoes }),
        pdf_contrato: docContratoEmBranco,
        pdf_formulario: docPedido,
      };
    }

    if (tipo === "os") {
      const { ordem, cliente, itens = [] } = dadosCompletos;
      if (!ordem) return {};
      return {
        os_completa: htmlOrdemServico({ ordem, cliente, itens }),
      };
    }

    if (tipo === "ordem_compra") {
      const { ordem, fornecedor, itens = [] } = dadosCompletos;
      if (!ordem) return {};
      return {
        oc_a4: htmlOrdemCompra({ ordem, fornecedor, itens }),
      };
    }

    if (tipo === "conta") {
      const { conta } = dadosCompletos;
      if (!conta) return {};
      return {
        recibo: htmlReciboConta({ conta }),
      };
    }

    return {};
  }, [tipo, dadosCompletos]);

  // HTML da aba atual
  const htmlAtual = (htmlDocMap as Record<string, string | undefined>)[abaAtiva] || Object.values(htmlDocMap)[0] || "";

  // Ação de impressão rápida (sempre via documento HTML limpo, sem erro de recurso blob)
  const dispararImpressao = () => {
    if (abaAtiva === "anexo" && urlAnexo) {
      window.open(urlAnexo, "_blank", "noopener");
      return;
    }
    if (htmlAtual) {
      imprimirHtml(htmlAtual);
    } else {
      toast.error("Nenhum formulário pronto para impressão.");
    }
  };

  // Gerador de PDF direto para Venda / Orçamento
  const baixarPdfVenda = async () => {
    if (!dadosCompletos?.venda) return;
    try {
      const { venda, cliente, itens = [] } = dadosCompletos;
      const { blob, nome } = await gerarOrcamentoPdf({
        venda,
        cliente: cliente ?? null,
        itens,
      });
      baixarBlob(blob, nome);
      toast.success(`PDF baixado: ${nome}`);
    } catch {
      toast.error("Não foi possível gerar o PDF.");
    }
  };

  // Gerador de PDF para Ordem de Compra
  const baixarPdfOrdemCompra = async () => {
    if (!dadosCompletos?.ordem) return;
    const { ordem, fornecedor, itens = [] } = dadosCompletos;
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
      /* sem logo */
    }

    doc.setFontSize(14).setFont("helvetica", "bold");
    doc.text("ORDEM DE COMPRA", 196, y + 6, { align: "right" });
    doc.setFontSize(9).setFont("helvetica", "normal");
    doc.text(`Nº ${ordem.numero ?? "—"}`, 196, y + 12, { align: "right" });
    doc.text(`Emissão: ${dataBR(ordem.data_pedido)}`, 196, y + 17, { align: "right" });
    doc.text(`Previsão: ${dataBR(ordem.previsao_entrega)}`, 196, y + 22, { align: "right" });

    y += 24;
    doc.setFont("helvetica", "bold").setFontSize(11);
    doc.text("Splash Jardim do Trevo", m, y);
    doc.setFont("helvetica", "normal").setFontSize(9);
    doc.text("Comércio e Instalação de Piscinas — CNPJ 26.108.962/0001-52", m, y + 5);

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
    doc.text(`Condições: ${ordem.condicoes ?? "—"}`, m, y);

    autoTable(doc, {
      startY: y + 6,
      margin: { left: m, right: 14 },
      head: [["Código", "Descrição", "Cor", "Pastilha", "Destino", "Un.", "Qtd", "Unitário", "Total"]],
      body: itens.map((i: any) => [
        i.codigo ?? "—",
        i.descricao,
        i.cor ?? "—",
        i.pastilha ?? "—",
        i.cliente_nome ?? "Estoque",
        i.unidade ?? "un",
        String(i.quantidade),
        brl(Number(i.valor_unitario)),
        brl(Number(i.total)),
      ]),
      styles: { fontSize: 8, textColor: [69, 10, 10], lineColor: [153, 27, 27], lineWidth: 0.2 },
      headStyles: { fillColor: [254, 202, 202], textColor: [69, 10, 10], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [254, 242, 242] },
    });

    const finalY = (doc as any).lastAutoTable?.finalY ?? y + 40;
    let ty = finalY + 8;
    doc.setFont("helvetica", "bold").setFontSize(10);
    doc.text("TOTALIZAÇÃO", m, ty);
    doc.setFont("helvetica", "normal").setFontSize(9);
    ty += 5;
    doc.text(`Valor produtos: ${brl(Number(ordem.valor_produtos))}`, m, ty);
    doc.text(`Desconto: ${brl(Number(ordem.desconto ?? 0))}`, 110, ty);
    ty += 5;
    doc.text(`Valor faturado: ${brl(Number(ordem.valor_nota ?? 0))}`, m, ty);
    doc.text(`Valor pago: ${brl(Number(ordem.valor_pago ?? 0))}`, 110, ty);
    ty += 5;
    doc.setFont("helvetica", "bold");
    doc.text(`VALOR TOTAL: ${brl(Number(ordem.valor_total))}`, m, ty);

    const nome = `ordem-de-compra-${(ordem.numero ?? "sn").replace(/[^\w-]/g, "")}.pdf`;
    doc.save(nome);
    toast.success("PDF da Ordem de Compra baixado.");
  };

  // Título e identificador amigável do documento
  const infoCabecalho = useMemo(() => {
    if (tituloCustom) {
      return { titulo: tituloCustom, subtitulo: subtituloCustom || "Visualização de documento gerado" };
    }
    if (tipo === "venda") {
      const v = dadosCompletos?.venda;
      const orc = v?.status_pedido === "orcamento";
      return {
        titulo: `${orc ? "Orçamento" : "Pedido de Venda"} ${v?.numero ? `#${v.numero}` : ""}`.trim(),
        subtitulo: `Cliente: ${v?.cliente_nome ?? "Não informado"} · Total: ${brl(v?.valor_total ?? 0)}`,
        badge: orc ? "Orçamento" : "Pedido Aprovado",
      };
    }
    if (tipo === "os") {
      const o = dadosCompletos?.ordem;
      return {
        titulo: `Ordem de Serviço ${o?.numero ? `#${o.numero}` : ""}`.trim(),
        subtitulo: `Cliente: ${o?.cliente_nome ?? "Não informado"} · Responsável: ${o?.responsavel ?? "—"}`,
        badge: "Instalação & Obra",
      };
    }
    if (tipo === "ordem_compra") {
      const oc = dadosCompletos?.ordem;
      return {
        titulo: `Ordem de Compra ${oc?.numero ? `#${oc.numero}` : ""}`.trim(),
        subtitulo: `Fornecedor: ${dadosCompletos?.fornecedor?.nome ?? oc?.fornecedor_nome ?? "—"} · Total: ${brl(oc?.valor_total ?? 0)}`,
        badge: "Suprimentos",
      };
    }
    if (tipo === "conta") {
      const c = dadosCompletos?.conta;
      const pagar = c?.tipo === "pagar";
      return {
        titulo: `${pagar ? "Conta a Pagar" : "Conta a Receber"} ${c?.numero_documento ? `· Doc ${c.numero_documento}` : ""}`.trim(),
        subtitulo: `${c?.descricao ?? ""} · Valor: ${brl(c?.valor ?? 0)} · ${c?.parceiro ?? ""}`,
        badge: pagar ? "Despesa" : "Receita",
      };
    }
    return { titulo: "Visualização de Documento", subtitulo: "" };
  }, [tituloCustom, subtituloCustom, tipo, dadosCompletos]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[92vh] flex flex-col p-0 gap-0 overflow-hidden sm:max-w-6xl">
        {/* Cabeçalho do modal */}
        <DialogHeader className="p-4 border-b bg-muted/30 shrink-0 flex flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-lg font-bold text-foreground">
                {infoCabecalho.titulo}
              </DialogTitle>
              {infoCabecalho.badge && (
                <Badge variant="outline" className="text-xs">
                  {infoCabecalho.badge}
                </Badge>
              )}
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              {infoCabecalho.subtitulo}
            </DialogDescription>
          </div>

          {/* Barra de ações de visualização e impressão */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Controles de zoom */}
            <div className="hidden sm:flex items-center border rounded-md mr-1 px-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setZoom((z) => Math.max(50, z - 15))}
                title="Diminuir zoom"
              >
                <ZoomOut className="size-3.5" />
              </Button>
              <span className="text-[11px] font-mono px-1 select-none">{zoom}%</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setZoom((z) => Math.min(150, z + 15))}
                title="Aumentar zoom"
              >
                <ZoomIn className="size-3.5" />
              </Button>
            </div>

            {/* Ações específicas por tipo */}
            {tipo === "venda" && dadosCompletos?.venda && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs"
                onClick={() => void baixarPdfVenda()}
              >
                <FileDown className="size-3.5" /> Baixar PDF
              </Button>
            )}

            {tipo === "ordem_compra" && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs"
                onClick={baixarPdfOrdemCompra}
              >
                <FileDown className="size-3.5" /> Baixar PDF
              </Button>
            )}

            {tipo === "os" && dadosCompletos?.ordem?.id && (
              <Button size="sm" variant="outline" asChild className="h-8 gap-1.5 text-xs">
                <Link to="/os/formulario" search={{ os: dadosCompletos.ordem.id } as any}>
                  <ExternalLink className="size-3.5" /> Abrir no formulário
                </Link>
              </Button>
            )}

            {tipo === "venda" && dadosCompletos?.venda?.id && (
              <Button size="sm" variant="outline" asChild className="h-8 gap-1.5 text-xs">
                <Link to="/vendas/$id" params={{ id: dadosCompletos.venda.id }}>
                  <ExternalLink className="size-3.5" /> Detalhes do pedido
                </Link>
              </Button>
            )}

            <Button
              size="sm"
              variant="default"
              className="h-8 gap-1.5 text-xs shadow-sm"
              onClick={dispararImpressao}
              disabled={carregando}
            >
              <Printer className="size-3.5" /> Imprimir documento
            </Button>
          </div>
        </DialogHeader>

        {/* Abas e corpo do formulário */}
        <div className="flex-1 flex flex-col min-h-0 bg-neutral-100 dark:bg-neutral-900/50">
          <Tabs
            value={abaAtiva}
            onValueChange={setAbaAtiva}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Barra de seleção de abas de documento */}
            <div className="px-4 py-2 border-b bg-background flex items-center justify-between gap-2 overflow-x-auto">
              <TabsList className="h-8 bg-muted/60 p-0.5">
                {tipo === "venda" && (
                  <>
                    <TabsTrigger value="pedido" className="text-xs h-7 gap-1.5">
                      <FileText className="size-3.5" />
                      {dadosCompletos?.venda?.status_pedido === "orcamento"
                        ? "Orçamento (A4)"
                        : "Pedido de Venda (A4)"}
                    </TabsTrigger>
                    <TabsTrigger value="contrato" className="text-xs h-7 gap-1.5">
                      <FileSignature className="size-3.5" /> Contrato preenchido
                    </TabsTrigger>
                    <TabsTrigger value="cupom" className="text-xs h-7 gap-1.5">
                      <Receipt className="size-3.5" /> Cupom de balcão (80mm)
                    </TabsTrigger>
                    <TabsTrigger value="pdf_contrato" className="text-xs h-7 gap-1.5">
                      <Paperclip className="size-3.5" /> Contrato original
                    </TabsTrigger>
                    <TabsTrigger value="pdf_formulario" className="text-xs h-7 gap-1.5">
                      <Paperclip className="size-3.5" /> Formulário original
                    </TabsTrigger>
                  </>
                )}

                {tipo === "os" && (
                  <>
                    <TabsTrigger value="os_completa" className="text-xs h-7 gap-1.5">
                      <FileCheck className="size-3.5" /> O.S. Frente & Verso (A4)
                    </TabsTrigger>
                  </>
                )}

                {tipo === "ordem_compra" && (
                  <>
                    <TabsTrigger value="oc_a4" className="text-xs h-7 gap-1.5">
                      <FileText className="size-3.5" /> Ordem de Compra (A4)
                    </TabsTrigger>
                  </>
                )}

                {tipo === "conta" && (
                  <>
                    <TabsTrigger value="recibo" className="text-xs h-7 gap-1.5">
                      <Receipt className="size-3.5" /> Recibo / Ficha de quitação
                    </TabsTrigger>
                    {dadosCompletos?.conta?.comprovante_path && (
                      <TabsTrigger value="anexo" className="text-xs h-7 gap-1.5">
                        <Paperclip className="size-3.5" /> Comprovante anexo
                      </TabsTrigger>
                    )}
                  </>
                )}

                {tipo === "custom" && (
                  <TabsTrigger value="principal" className="text-xs h-7 gap-1.5">
                    <FileText className="size-3.5" /> Visualização
                  </TabsTrigger>
                )}
              </TabsList>

              <span className="text-[11px] text-muted-foreground hidden md:inline">
                Visualização direta para impressão e conferência
              </span>
            </div>

            {/* Conteúdo da visualização */}
            <div className="flex-1 overflow-auto p-4 flex justify-center items-start">
              {carregando ? (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <p className="text-sm">Carregando formulário do documento...</p>
                </div>
              ) : (
                <>
                  {/* Se for comprovante anexo da conta */}
                  {abaAtiva === "anexo" && (
                    <div className="w-full max-w-3xl flex flex-col items-center justify-center bg-background rounded-lg border shadow-sm p-4">
                      {carregandoAnexo ? (
                        <div className="flex items-center gap-2 p-8 text-muted-foreground">
                          <Loader2 className="size-5 animate-spin" /> Gerando link seguro do comprovante...
                        </div>
                      ) : urlAnexo ? (
                        <div className="w-full flex flex-col items-center gap-3">
                          {urlAnexo.toLowerCase().includes(".pdf") ? (
                            <iframe
                              src={urlAnexo}
                              title="Comprovante anexo"
                              className="w-full h-[70vh] rounded border"
                            />
                          ) : (
                            <img
                              src={urlAnexo}
                              alt="Comprovante anexo"
                              className="max-h-[72vh] max-w-full rounded border object-contain shadow-sm"
                            />
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(urlAnexo, "_blank", "noopener")}
                            className="gap-1.5"
                          >
                            <ExternalLink className="size-3.5" /> Abrir anexo em tamanho real
                          </Button>
                        </div>
                      ) : (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                          Não foi possível carregar o anexo do comprovante.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Formulário gerado em HTML (Pedido, Contrato, Contrato Original, Formulário Original, Cupom, OS, OC, Recibo) */}
                  {abaAtiva !== "anexo" && (
                    <div
                      className="transition-transform duration-150 origin-top bg-white rounded-md shadow-lg border border-neutral-300"
                      style={{
                        transform: `scale(${zoom / 100})`,
                        width: abaAtiva === "cupom" ? "90mm" : "216mm",
                        minHeight: abaAtiva === "cupom" ? "120mm" : "297mm",
                      }}
                    >
                      <iframe
                        srcDoc={htmlAtual}
                        title="Pré-visualização do Documento"
                        className="w-full border-0 rounded-md"
                        style={{
                          minHeight: abaAtiva === "cupom" ? "160mm" : "320mm",
                          height: "100%",
                        }}
                        onLoad={(e) => {
                          try {
                            const f = e.currentTarget;
                            const ch = f.contentWindow?.document?.body?.scrollHeight;
                            if (ch && ch > 100) f.style.height = `${ch + 40}px`;
                          } catch {
                            /* ignore */
                          }
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ======================================================================
 * BOTAO DE ACAO UNIVERSAL PARA VISUALIZACAO DE QUALQUER DOCUMENTO
 * ====================================================================== */
export interface BotaoVisualizarDocumentoProps {
  tipo: TipoDocumento;
  id?: string | null;
  dados?: any;
  titulo?: string;
  rotulo?: string;
  label?: string;
  icone?: React.ReactNode;
  variant?: "ghost" | "outline" | "default" | "secondary";
  size?: "icon" | "sm" | "default";
  className?: string;
}

export function BotaoVisualizarDocumento({
  tipo,
  id,
  dados,
  titulo = "Visualizar formulário / documento",
  rotulo,
  label,
  icone,
  variant = "ghost",
  size = "icon",
  className,
}: BotaoVisualizarDocumentoProps) {
  const rotuloFinal = rotulo ?? label;
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        title={titulo}
        aria-label={titulo}
        onClick={(e) => {
          e.stopPropagation();
          setAberto(true);
        }}
      >
        {icone ?? <Eye className="size-4" />}
        {rotuloFinal ? <span>{rotuloFinal}</span> : null}
      </Button>

      <VisualizadorDocumentoModal
        open={aberto}
        onOpenChange={setAberto}
        tipo={tipo}
        id={id}
        dados={dados}
        tituloCustom={titulo !== "Visualizar formulário / documento" ? titulo : undefined}
      />
    </>
  );
}
