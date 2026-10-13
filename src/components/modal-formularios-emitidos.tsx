import { useState, useMemo } from "react";
import {
  FileText,
  Eye,
  Printer,
  Search,
  CheckCircle2,
  Calendar,
  User,
  ExternalLink,
  ClipboardList,
  Filter,
  FileCheck,
  Building2,
  ShoppingBag,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR } from "@/lib/erp";
import { VisualizadorDocumentoModal } from "@/components/visualizador-documento-modal";

export type ItemFormularioEmitido = {
  id: string;
  tipo: "os" | "venda" | "obra";
  numero: string | null;
  clienteNome: string | null;
  clienteId?: string | null;
  responsavelOuVendedor: string | null;
  data: string | null;
  valor?: number | null;
  descricaoOuServico: string | null;
  status: string | null;
  subtipo?: string | null; // ex: "orcamento" | "pedido"
};

export interface ModalFormulariosEmitidosProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Se informado, ao clicar em "Carregar no formulário", dispara este callback */
  onSelecionar?: (item: ItemFormularioEmitido) => void;
  tipoInicial?: "todos" | "os" | "venda" | "obra";
}

export function ModalFormulariosEmitidos({
  open,
  onOpenChange,
  onSelecionar,
  tipoInicial = "todos",
}: ModalFormulariosEmitidosProps) {
  const [busca, setBusca] = useState("");
  const [abaTipo, setAbaTipo] = useState<string>(tipoInicial);
  const [visualizadorDoc, setVisualizadorDoc] = useState<{
    aberto: boolean;
    tipo: "os" | "venda";
    id: string;
    titulo?: string;
  }>({
    aberto: false,
    tipo: "os",
    id: "",
  });

  // 1. Busca Ordens de Serviço emitidas
  const { data: ordens = [], isLoading: carregandoOS } = useQuery({
    queryKey: ["formularios-emitidos-os"],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordens_servico")
        .select("id, numero, cliente_nome, responsavel, tipo_servico, descricao, status, data_agendada, created_at, valor")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []).map(
        (o): ItemFormularioEmitido => ({
          id: o.id,
          tipo: "os",
          numero: o.numero,
          clienteNome: o.cliente_nome,
          responsavelOuVendedor: o.responsavel,
          data: o.data_agendada || o.created_at,
          valor: o.valor ? Number(o.valor) : null,
          descricaoOuServico: o.tipo_servico || o.descricao || "Ordem de Serviço de Instalação",
          status: o.status || "aberta",
        }),
      );
    },
  });

  // 2. Busca Pedidos de Venda e Orçamentos emitidos
  const { data: vendas = [], isLoading: carregandoVendas } = useQuery({
    queryKey: ["formularios-emitidos-vendas"],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendas")
        .select("id, numero, cliente_nome, vendedor, status_pedido, data, created_at, valor_total, tipo_atendimento")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []).map(
        (v): ItemFormularioEmitido => ({
          id: v.id,
          tipo: "venda",
          numero: v.numero,
          clienteNome: v.cliente_nome,
          responsavelOuVendedor: v.vendedor,
          data: v.data || v.created_at,
          valor: v.valor_total ? Number(v.valor_total) : null,
          descricaoOuServico: v.status_pedido === "orcamento" ? "Orçamento emitido" : "Pedido de Venda emitido",
          status: v.status_pedido || "pendente",
          subtipo: v.status_pedido === "orcamento" ? "orcamento" : "pedido",
        }),
      );
    },
  });

  // 3. Busca Obras emitidas/registradas
  const { data: obras = [], isLoading: carregandoObras } = useQuery({
    queryKey: ["formularios-emitidos-obras"],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("obras")
        .select("id, numero, cliente_nome, responsavel, tipo_servico, observacoes, created_at, status_geral")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []).map(
        (ob): ItemFormularioEmitido => ({
          id: ob.id,
          tipo: "obra",
          numero: ob.numero,
          clienteNome: ob.cliente_nome,
          responsavelOuVendedor: ob.responsavel,
          data: ob.created_at,
          descricaoOuServico: ob.tipo_servico || ob.observacoes || "Obra de Instalação",
          status: ob.status_geral || "em_andamento",
        }),
      );
    },
  });

  const carregando = carregandoOS || carregandoVendas || carregandoObras;

  // Lista unificada
  const todosItens = useMemo(() => {
    return [...ordens, ...vendas, ...obras].sort((a, b) => {
      const da = a.data ? new Date(a.data).getTime() : 0;
      const db = b.data ? new Date(b.data).getTime() : 0;
      return db - da;
    });
  }, [ordens, vendas, obras]);

  // Filtro de aba e texto
  const itensFiltrados = useMemo(() => {
    return todosItens.filter((item) => {
      // Filtro de aba
      if (abaTipo === "os" && item.tipo !== "os") return false;
      if (abaTipo === "pedidos" && (item.tipo !== "venda" || item.subtipo === "orcamento")) return false;
      if (abaTipo === "orcamentos" && (item.tipo !== "venda" || item.subtipo !== "orcamento")) return false;
      if (abaTipo === "obras" && item.tipo !== "obra") return false;

      // Filtro de busca textual
      if (!busca.trim()) return true;
      const termo = busca.toLowerCase().trim();
      const numMatch = (item.numero || "").toLowerCase().includes(termo);
      const cliMatch = (item.clienteNome || "").toLowerCase().includes(termo);
      const respMatch = (item.responsavelOuVendedor || "").toLowerCase().includes(termo);
      const descMatch = (item.descricaoOuServico || "").toLowerCase().includes(termo);
      return numMatch || cliMatch || respMatch || descMatch;
    });
  }, [todosItens, abaTipo, busca]);

  const abrirVisualizador = (item: ItemFormularioEmitido) => {
    if (item.tipo === "os" || item.tipo === "obra") {
      setVisualizadorDoc({
        aberto: true,
        tipo: "os",
        id: item.id,
        titulo: `Formulário da OS ${item.numero ?? ""}`.trim(),
      });
    } else {
      setVisualizadorDoc({
        aberto: true,
        tipo: "venda",
        id: item.id,
        titulo: `${item.subtipo === "orcamento" ? "Orçamento" : "Pedido de Venda"} ${item.numero ?? ""}`.trim(),
      });
    }
  };

  const statusBadgeVariant = (status: string | null) => {
    switch (status) {
      case "concluida":
      case "concluido":
      case "aprovado":
        return "default";
      case "em_andamento":
      case "em_producao":
      case "aberta":
        return "secondary";
      case "cancelada":
      case "cancelado":
        return "destructive";
      default:
        return "outline";
    }
  };

  const statusLabel = (status: string | null) => {
    switch (status) {
      case "concluida":
      case "concluido":
        return "Concluído";
      case "aprovado":
        return "Aprovado";
      case "em_andamento":
        return "Em andamento";
      case "em_producao":
        return "Em produção";
      case "aberta":
        return "Aberta";
      case "orcamento":
        return "Orçamento";
      case "cancelada":
      case "cancelado":
        return "Cancelado";
      default:
        return status || "Ativo";
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[88vh] flex flex-col p-0 gap-0 overflow-hidden sm:max-w-5xl">
          {/* Cabeçalho */}
          <DialogHeader className="p-4 border-b bg-muted/40 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <ClipboardList className="size-5 text-primary" /> Formulários Emitidos
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Consulte, imprima ou recarregue ordens de serviço, orçamentos e pedidos já gerados.
                </DialogDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {itensFiltrados.length} formulário{itensFiltrados.length === 1 ? "" : "s"} encontrado{itensFiltrados.length === 1 ? "" : "s"}
              </Badge>
            </div>

            {/* Barra de pesquisa e abas */}
            <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Pesquisar por número, cliente, responsável..."
                  className="pl-8 h-9 text-xs"
                />
              </div>

              <Tabs value={abaTipo} onValueChange={setAbaTipo} className="shrink-0">
                <TabsList className="h-9">
                  <TabsTrigger value="todos" className="text-xs gap-1.5">
                    Todos <Badge variant="secondary" className="text-[10px] px-1 py-0">{todosItens.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="os" className="text-xs gap-1.5">
                    <FileCheck className="size-3.5" /> OS <Badge variant="secondary" className="text-[10px] px-1 py-0">{ordens.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="pedidos" className="text-xs gap-1.5">
                    <ShoppingBag className="size-3.5" /> Pedidos <Badge variant="secondary" className="text-[10px] px-1 py-0">{vendas.filter(v => v.subtipo !== "orcamento").length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="orcamentos" className="text-xs gap-1.5">
                    <FileText className="size-3.5" /> Orçamentos <Badge variant="secondary" className="text-[10px] px-1 py-0">{vendas.filter(v => v.subtipo === "orcamento").length}</Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </DialogHeader>

          {/* Tabela de formulários */}
          <div className="flex-1 overflow-y-auto p-4">
            {carregando ? (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm">Carregando formulários emitidos...</p>
              </div>
            ) : itensFiltrados.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed rounded-lg">
                <Filter className="size-8 text-muted-foreground/60 mb-2" />
                <h3 className="font-semibold text-sm">Nenhum formulário encontrado</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  {busca
                    ? `Nenhum formulário coincide com o termo de busca "${busca}".`
                    : "Ainda não há formulários emitidos para a categoria selecionada."}
                </p>
                {busca && (
                  <Button variant="ghost" size="sm" onClick={() => setBusca("")} className="mt-3 text-xs">
                    Limpar filtro de busca
                  </Button>
                )}
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-28">Nº / Tipo</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Serviço / Descrição</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itensFiltrados.map((item) => (
                      <TableRow key={`${item.tipo}-${item.id}`} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-xs text-foreground">
                              {item.tipo.toUpperCase()} {item.numero ? `#${item.numero}` : "S/N"}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase">
                              {item.tipo === "os"
                                ? "Ordem de Serviço"
                                : item.tipo === "obra"
                                  ? "Obra"
                                  : item.subtipo === "orcamento"
                                    ? "Orçamento"
                                    : "Venda / Pedido"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="font-medium text-xs">
                          {item.clienteNome || "Cliente não informado"}
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground max-w-[240px] truncate" title={item.descricaoOuServico || ""}>
                          {item.descricaoOuServico || "—"}
                          {item.valor ? (
                            <span className="block font-semibold text-foreground text-[11px]">
                              {brl(item.valor)}
                            </span>
                          ) : null}
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground">
                          {item.responsavelOuVendedor || "—"}
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {dataBR(item.data)}
                        </TableCell>

                        <TableCell>
                          <Badge variant={statusBadgeVariant(item.status)} className="text-[10px] uppercase">
                            {statusLabel(item.status)}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Botão de Visualização / Impressão do Formulário */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2.5 text-xs gap-1"
                              title="Visualizar e imprimir formulário"
                              onClick={() => abrirVisualizador(item)}
                            >
                              <Eye className="size-3.5 text-primary" /> Visualizar
                            </Button>

                            {/* Botão para carregar no formulário da página atual (se callback fornecido) */}
                            {onSelecionar ? (
                              <Button
                                size="sm"
                                variant="default"
                                className="h-7 px-2.5 text-xs gap-1"
                                title="Carregar dados deste formulário na tela"
                                onClick={() => {
                                  onSelecionar(item);
                                  onOpenChange(false);
                                }}
                              >
                                <CheckCircle2 className="size-3.5" /> Carregar
                              </Button>
                            ) : item.tipo === "os" ? (
                              <Button
                                size="sm"
                                variant="secondary"
                                asChild
                                className="h-7 px-2.5 text-xs gap-1"
                                title="Abrir no formulário de OS"
                              >
                                <Link to="/os/formulario" search={{ os: item.id } as any}>
                                  <ExternalLink className="size-3.5" /> Abrir no formulário
                                </Link>
                              </Button>
                            ) : item.tipo === "venda" ? (
                              <Button
                                size="sm"
                                variant="secondary"
                                asChild
                                className="h-7 px-2.5 text-xs gap-1"
                                title="Abrir detalhes da venda"
                              >
                                <Link to="/vendas/$id" params={{ id: item.id }}>
                                  <ExternalLink className="size-3.5" /> Detalhes
                                </Link>
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de visualização do documento completo */}
      {visualizadorDoc.aberto && (
        <VisualizadorDocumentoModal
          open={visualizadorDoc.aberto}
          onOpenChange={(aberto) =>
            setVisualizadorDoc((v) => ({ ...v, aberto }))
          }
          tipo={visualizadorDoc.tipo}
          id={visualizadorDoc.id}
          tituloCustom={visualizadorDoc.titulo}
        />
      )}
    </>
  );
}

/* ======================================================================
 * BOTAO DE ACAO UNIVERSAL PARA VISUALIZAR OS FORMULARIOS EMITIDOS
 * ====================================================================== */
export interface BotaoVisualizarFormulariosEmitidosProps {
  variant?: "outline" | "default" | "secondary" | "ghost";
  size?: "default" | "sm" | "icon";
  rotulo?: string;
  className?: string;
  onSelecionar?: (item: ItemFormularioEmitido) => void;
  tipoInicial?: "todos" | "os" | "venda" | "obra";
}

export function BotaoVisualizarFormulariosEmitidos({
  variant = "outline",
  size = "sm",
  rotulo = "Formulários emitidos",
  className,
  onSelecionar,
  tipoInicial = "todos",
}: BotaoVisualizarFormulariosEmitidosProps) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        title="Visualizar formulários que já foram emitidos"
        aria-label="Visualizar formulários que já foram emitidos"
        onClick={(e) => {
          e.stopPropagation();
          setAberto(true);
        }}
      >
        <ClipboardList className="size-4" />
        {size !== "icon" && <span>{rotulo}</span>}
      </Button>

      <ModalFormulariosEmitidos
        open={aberto}
        onOpenChange={setAberto}
        onSelecionar={onSelecionar}
        tipoInicial={tipoInicial}
      />
    </>
  );
}
