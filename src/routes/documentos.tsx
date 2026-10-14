import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Folder,
  FolderOpen,
  FileText,
  ClipboardCheck,
  Building2,
  Truck,
  Search,
  Users,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  Printer,
  Calendar,
  Layers,
  Boxes,
  MapPin,
  Phone,
  Factory,
  Pencil,
  Trash2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { toast } from "sonner";

import { ExpandableCard } from "@/components/expandable-card";
import { PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BotaoVisualizarDocumento } from "@/components/visualizador-documento-modal";
import { ModalPedirCarga } from "@/components/modal-pedir-carga";
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR } from "@/lib/erp";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/documentos")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Dossiê de Documentos por Cliente | Piscinow ERP" },
      {
        name: "description",
        content:
          "Gestão de documentos por cliente: navegação em pastas de OSs e Ordens de Compra por fornecedor.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <DocumentosClientes />
    </RequireAuth>
  ),
});

interface Cliente {
  id: string;
  nome: string;
  telefone?: string | null;
  cidade?: string | null;
  logradouro?: string | null;
}

interface OrdemServico {
  id: string;
  numero: string | null;
  cliente_id: string | null;
  cliente_nome: string | null;
  tipo_servico: string;
  descricao: string | null;
  responsavel: string | null;
  status: string;
  data_agendada: string | null;
  created_at: string;
}

interface OrdemCompraItem {
  id: string;
  ordem_id: string;
  ordem_numero: string | null;
  cliente_id: string | null;
  cliente_nome: string | null;
  fornecedor_id: string | null;
  fornecedor_nome: string | null;
  produto_id: string | null;
  codigo: string | null;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  total: number;
  carga_id: string | null;
  status_carga: string | null;
  status_ordem: string | null;
  created_at: string;
}

function DocumentosClientes() {
  const qc = useQueryClient();
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [abaDossie, setAbaDossie] = useState<"os" | "oc">("os");
  const [modalPedirCargaAberto, setModalPedirCargaAberto] = useState(false);

  const excluirOS = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ordens_servico").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ordem de Serviço excluída com sucesso");
      qc.invalidateQueries({ queryKey: ["ordens_servico"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const excluirItemOC = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ordem_compra_itens").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Item de compra excluído com sucesso");
      qc.invalidateQueries({ queryKey: ["ordem_compra_itens"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // 1. Carrega todos os clientes
  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes", "dossie-lista"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nome, telefone, cidade, logradouro")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data as Cliente[];
    },
  });

  // 2. Carrega todas as Ordens de Serviço (OSs)
  const { data: ordensServico = [] } = useQuery({
    queryKey: ["ordens_servico", "dossie"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordens_servico")
        .select("id, numero, cliente_id, cliente_nome, tipo_servico, descricao, responsavel, status, data_agendada, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as OrdemServico[];
    },
  });

  // 3. Carrega todos os itens de Ordens de Compra (OCs)
  const { data: itensCompra = [] } = useQuery({
    queryKey: ["ordem_compra_itens", "dossie"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordem_compra_itens")
        .select(`
          id,
          ordem_id,
          cliente_id,
          cliente_nome,
          codigo,
          descricao,
          quantidade,
          valor_unitario,
          total,
          carga_id,
          status_carga,
          created_at,
          ordens_compra:ordem_id (
            numero,
            fornecedor_id,
            fornecedor_nome,
            status
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        ordem_id: row.ordem_id,
        ordem_numero: row.ordens_compra?.numero || "O.C.",
        cliente_id: row.cliente_id,
        cliente_nome: row.cliente_nome,
        fornecedor_id: row.ordens_compra?.fornecedor_id,
        fornecedor_nome: row.ordens_compra?.fornecedor_nome || "Fornecedor não identificado",
        produto_id: row.produto_id,
        codigo: row.codigo,
        descricao: row.descricao,
        quantidade: Number(row.quantidade || 1),
        valor_unitario: Number(row.valor_unitario || 0),
        total: Number(row.total || 0),
        carga_id: row.carga_id,
        status_carga: row.status_carga || "pendente_carga",
        status_ordem: row.ordens_compra?.status || "pendente",
        created_at: row.created_at,
      })) as OrdemCompraItem[];
    },
  });

  // Mapeamento e agrupamento por cliente
  const dadosPorCliente = useMemo(() => {
    const mapa = new Map<
      string,
      {
        cliente: Cliente;
        oss: OrdemServico[];
        ocs: OrdemCompraItem[];
        fornecedores: Set<string>;
        totalDocs: number;
        totalGastoOC: number;
      }
    >();

    for (const c of clientes) {
      mapa.set(c.id, {
        cliente: c,
        oss: [],
        ocs: [],
        fornecedores: new Set(),
        totalDocs: 0,
        totalGastoOC: 0,
      });
    }

    // Vincula OSs aos clientes
    for (const os of ordensServico) {
      let grupo = os.cliente_id ? mapa.get(os.cliente_id) : undefined;
      if (!grupo && os.cliente_nome) {
        const porNome = clientes.find(
          (c) => c.nome.toLowerCase() === os.cliente_nome?.toLowerCase(),
        );
        if (porNome) grupo = mapa.get(porNome.id);
      }
      if (grupo) {
        grupo.oss.push(os);
        grupo.totalDocs += 1;
      }
    }

    // Vincula OCs aos clientes
    for (const oc of itensCompra) {
      let grupo = oc.cliente_id ? mapa.get(oc.cliente_id) : undefined;
      if (!grupo && oc.cliente_nome) {
        const porNome = clientes.find(
          (c) => c.nome.toLowerCase() === oc.cliente_nome?.toLowerCase(),
        );
        if (porNome) grupo = mapa.get(porNome.id);
      }
      if (grupo) {
        grupo.ocs.push(oc);
        if (oc.fornecedor_nome) grupo.fornecedores.add(oc.fornecedor_nome);
        grupo.totalDocs += 1;
        grupo.totalGastoOC += oc.total;
      }
    }

    return mapa;
  }, [clientes, ordensServico, itensCompra]);

  // Lista de pastas de clientes filtradas
  const pastasFiltradas = useMemo(() => {
    const lista = Array.from(dadosPorCliente.values());
    if (!busca.trim()) {
      return lista.sort((a, b) => b.totalDocs - a.totalDocs || a.cliente.nome.localeCompare(b.cliente.nome));
    }
    const termo = busca.toLowerCase();
    return lista
      .filter((g) => {
        if (g.cliente.nome.toLowerCase().includes(termo)) return true;
        if (g.oss.some((os) => os.numero?.toLowerCase().includes(termo) || os.tipo_servico.toLowerCase().includes(termo))) {
          return true;
        }
        if (g.ocs.some((oc) => oc.ordem_numero?.toLowerCase().includes(termo) || oc.descricao.toLowerCase().includes(termo))) {
          return true;
        }
        return false;
      })
      .sort((a, b) => b.totalDocs - a.totalDocs || a.cliente.nome.localeCompare(b.cliente.nome));
  }, [dadosPorCliente, busca]);

  // Dossiê do cliente atualmente aberto
  const clienteAtual = clienteSelecionadoId ? dadosPorCliente.get(clienteSelecionadoId) : null;

  // No dossiê do cliente: agrupa as OCs OBRIGATORIAMENTE por FORNECEDOR
  const ocsAgrupadasPorFornecedor = useMemo(() => {
    if (!clienteAtual) return [];
    const mapa = new Map<string, { fornecedorNome: string; itens: OrdemCompraItem[]; total: number }>();

    for (const oc of clienteAtual.ocs) {
      const nomeForn = oc.fornecedor_nome || "Outros Fornecedores";
      const grupo = mapa.get(nomeForn) ?? { fornecedorNome: nomeForn, itens: [], total: 0 };
      grupo.itens.push(oc);
      grupo.total += oc.total;
      mapa.set(nomeForn, grupo);
    }

    return Array.from(mapa.values()).sort((a, b) => a.fornecedorNome.localeCompare(b.fornecedorNome));
  }, [clienteAtual]);

  return (
    <div className="space-y-6">
      {/* CABEÇALHO PRINCIPAL */}
      <PageHeader
        title="Dossiê de Documentos por Cliente"
        subtitle="Navegue pelas pastas dos clientes para acessar Ordens de Serviço (OS) e Ordens de Compra (OC) separadas por fornecedor."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <div className="relative min-w-56 flex-1 sm:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente, OS, OC ou produto..."
                className="pl-9 sm:w-72"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <Button
              onClick={() => setModalPedirCargaAberto(true)}
              className="gap-2 bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90"
            >
              <Truck className="size-4" />
              📦 PEDIR CARGA
            </Button>
          </div>
        }
      />

      {/* BREADCRUMB DE NAVEGAÇÃO EM PASTAS */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 p-2.5 px-3.5 rounded-lg border">
        <button
          type="button"
          onClick={() => setClienteSelecionadoId(null)}
          className={cn(
            "flex items-center gap-1.5 font-medium hover:text-foreground transition-colors",
            !clienteAtual && "text-foreground font-bold",
          )}
        >
          <Folder className="size-3.5 text-amber-500" />
          <span>Pastas do Sistema (Dossiês)</span>
        </button>

        {clienteAtual && (
          <>
            <ChevronRight className="size-3.5 text-muted-foreground/60" />
            <span className="flex items-center gap-1.5 font-bold text-foreground">
              <FolderOpen className="size-3.5 text-primary" />
              <span>{clienteAtual.cliente.nome}</span>
            </span>
          </>
        )}
      </div>

      {/* ======================================================== */}
      {/* CASO 1: VISÃO DE PASTAS DE TODOS OS CLIENTES             */}
      {/* ======================================================== */}
      {!clienteAtual ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Clientes com Documentos Operacionais ({pastasFiltradas.length})
            </p>
            <span className="text-xs text-muted-foreground">
              Clique em qualquer pasta para abrir o dossiê completo
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {pastasFiltradas.map(({ cliente, oss, ocs, fornecedores, totalDocs, totalGastoOC }) => {
              const temDocs = totalDocs > 0;
              return (
                <Card
                  key={cliente.id}
                  onClick={() => setClienteSelecionadoId(cliente.id)}
                  className={cn(
                    "cursor-pointer border transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 group",
                    temDocs ? "bg-card/90" : "bg-card/40 opacity-70",
                  )}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <Folder className="size-6 fill-amber-500/20 group-hover:fill-primary/20" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {cliente.nome}
                          </h3>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {cliente.cidade || "Cliente Ativo"}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={temDocs ? "secondary" : "outline"}
                        className="font-mono text-[10px] shrink-0"
                      >
                        {totalDocs} doc(s)
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t">
                      <div className="space-y-0.5">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <ClipboardCheck className="size-3 text-blue-400" />
                          OSs: <strong>{oss.length}</strong>
                        </span>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <span className="text-muted-foreground flex items-center justify-end gap-1">
                          <Boxes className="size-3 text-emerald-400" />
                          OCs: <strong>{ocs.length}</strong>
                        </span>
                      </div>
                    </div>

                    {fornecedores.size > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {Array.from(fornecedores).slice(0, 2).map((forn, i) => (
                          <Badge key={i} variant="outline" className="text-[9px] py-0 px-1 font-normal text-muted-foreground">
                            {forn}
                          </Badge>
                        ))}
                        {fornecedores.size > 2 && (
                          <span className="text-[9px] text-muted-foreground">
                            +{fornecedores.size - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* CASO 2: DENTRO DA PASTA DO CLIENTE (DOSSIÊ COMPLETO)     */
        /* ======================================================== */
        <ExpandableCard className="space-y-6 p-6">
          {/* CARTÃO DE CABEÇALHO DO CLIENTE */}
          <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setClienteSelecionadoId(null)}
                  className="gap-1.5 text-xs h-8"
                >
                  <ArrowLeft className="size-3.5" />
                  Voltar às Pastas
                </Button>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <FolderOpen className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                      Dossiê: {clienteAtual.cliente.nome}
                    </h2>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      {clienteAtual.cliente.telefone && (
                        <span className="flex items-center gap-1">
                          <Phone className="size-3" /> {clienteAtual.cliente.telefone}
                        </span>
                      )}
                      {clienteAtual.cliente.logradouro && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" /> {clienteAtual.cliente.logradouro}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1">
                  {clienteAtual.oss.length} Ordem(ns) de Serviço
                </Badge>
                <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1">
                  {clienteAtual.ocs.length} Itens de Compra
                </Badge>
              </div>
            </div>
          </div>

          {/* ABAS DO DOSSIÊ: ORDENS DE SERVIÇO (OS) & ORDENS DE COMPRA (OC) */}
          <Tabs value={abaDossie} onValueChange={(v) => setAbaDossie(v as any)} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 sm:w-auto">
              <TabsTrigger value="os" className="flex items-center gap-2">
                <ClipboardCheck className="size-4" />
                <span>Ordens de Serviço ({clienteAtual.oss.length})</span>
              </TabsTrigger>
              <TabsTrigger value="oc" className="flex items-center gap-2">
                <Boxes className="size-4" />
                <span>Ordens de Compra por Fornecedor ({ocsAgrupadasPorFornecedor.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* ---------------------------------------------------- */}
            {/* ABA 1: ORDENS DE SERVIÇO (OS)                        */}
            {/* ---------------------------------------------------- */}
            <TabsContent value="os" className="space-y-4 m-0">
              {clienteAtual.oss.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center text-muted-foreground space-y-2">
                    <ClipboardCheck className="size-8 mx-auto text-muted-foreground/60" />
                    <p className="text-base font-medium">Nenhuma Ordem de Serviço encontrada.</p>
                    <p className="text-xs">
                      Ordens de serviço como OS-02 (Instalação), OL (Logística) ou OS-03 geradas para este cliente aparecerão aqui.
                    </p>
                    <Button asChild variant="outline" size="sm" className="mt-2">
                      <Link to="/ordens">Abrir Módulo de Ordens de Serviço</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="text-xs bg-muted/20">
                        <TableHead className="w-28">Número da OS</TableHead>
                        <TableHead className="w-40">Tipo de Serviço</TableHead>
                        <TableHead>Descrição / Observações</TableHead>
                        <TableHead className="w-32">Data Agendada</TableHead>
                        <TableHead className="w-32">Responsável</TableHead>
                        <TableHead className="w-28">Status</TableHead>
                        <TableHead className="w-36 text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clienteAtual.oss.map((os) => (
                        <TableRow key={os.id} className="text-xs">
                          <TableCell className="font-mono font-bold text-foreground">
                            {os.numero || "OS-—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-semibold text-[11px] bg-primary/10 text-primary border-primary/20">
                              {os.tipo_servico}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-muted-foreground">
                            {os.descricao || "—"}
                          </TableCell>
                          <TableCell className="font-mono">
                            {os.data_agendada ? dataBR(os.data_agendada) : "A definir"}
                          </TableCell>
                          <TableCell>{os.responsavel || "Equipe Splash"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                os.status === "concluido"
                                  ? "default"
                                  : os.status === "em_execucao"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="text-[10px] uppercase font-mono"
                            >
                              {os.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <BotaoVisualizarDocumento
                                tipo="os"
                                id={os.id}
                                titulo={`Visualizar OS ${os.numero ?? ""}`}
                              />
                              <Button asChild size="icon" variant="ghost" className="size-7" title="Editar OS no Módulo de Ordens">
                                <Link to="/ordens">
                                  <Pencil className="size-3.5" />
                                </Link>
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-7 text-destructive hover:bg-destructive/10"
                                title="Excluir OS"
                                disabled={excluirOS.isPending}
                                onClick={() => {
                                  if (window.confirm(`Excluir permanentemente a Ordem de Serviço ${os.numero ?? ""}?`)) {
                                    excluirOS.mutate(os.id);
                                  }
                                }}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* ---------------------------------------------------- */}
            {/* ABA 2: ORDENS DE COMPRA (OC) - AGRUPADAS POR FORNECEDOR */}
            {/* ---------------------------------------------------- */}
            <TabsContent value="oc" className="space-y-4 m-0">
              {ocsAgrupadasPorFornecedor.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center text-muted-foreground space-y-2">
                    <Boxes className="size-8 mx-auto text-muted-foreground/60" />
                    <p className="text-base font-medium">Nenhum pedido de compra vinculado a este cliente.</p>
                    <p className="text-xs">
                      Itens de pedidos de venda vinculados a ordens de compra aparecerão aqui agrupados por fornecedor.
                    </p>
                    <Button asChild variant="outline" size="sm" className="mt-2">
                      <Link to="/ordens-compra">Acessar Ordens de Compra</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {ocsAgrupadasPorFornecedor.map((grupo) => (
                    <ExpandableCard key={grupo.fornecedorNome} className="overflow-hidden border">
                      {/* CABEÇALHO DO FORNECEDOR DENTRO DA PASTA DO CLIENTE */}
                      <div className="flex flex-col gap-2 p-3.5 pr-12 bg-muted/20 border-b sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Factory className="size-4" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-foreground">
                              {grupo.fornecedorNome}
                            </h3>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {grupo.itens.length} item(ns) comprado(s) deste fabricante
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-medium">
                              Subtotal Fornecedor
                            </p>
                            <p className="text-sm font-bold font-mono text-primary">
                              {brl(grupo.total)}
                            </p>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setModalPedirCargaAberto(true)}
                            className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                          >
                            <Truck className="size-3" />
                            Pedir Carga
                          </Button>
                        </div>
                      </div>

                      {/* TABELA DE PRODUTOS COMPRADOS DO FORNECEDOR */}
                      <Table>
                        <TableHeader>
                          <TableRow className="text-xs bg-muted/10">
                            <TableHead className="w-24">Ordem (O.C.)</TableHead>
                            <TableHead className="w-28">Código / SKU</TableHead>
                            <TableHead>Produto / Insumo</TableHead>
                            <TableHead className="w-20 text-right">Qtd</TableHead>
                            <TableHead className="w-28 text-right">Valor Unit.</TableHead>
                            <TableHead className="w-28 text-right">Total</TableHead>
                            <TableHead className="w-32">Status da Carga</TableHead>
                            <TableHead className="w-32 text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {grupo.itens.map((item) => (
                            <TableRow key={item.id} className="text-xs">
                              <TableCell className="font-mono font-bold text-foreground">
                                {item.ordem_numero}
                              </TableCell>
                              <TableCell className="font-mono text-muted-foreground">
                                {item.codigo || "—"}
                              </TableCell>
                              <TableCell className="font-medium">
                                {item.descricao}
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                {item.quantidade} un.
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {brl(item.valor_unitario)}
                              </TableCell>
                              <TableCell className="text-right font-mono font-semibold">
                                {brl(item.total)}
                              </TableCell>
                              <TableCell>
                                {item.status_carga === "em_carga" ? (
                                  <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-[10px] font-mono gap-1">
                                    <Truck className="size-3" />
                                    Em Carga
                                  </Badge>
                                ) : item.status_carga === "entregue" ? (
                                  <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 text-[10px] font-mono gap-1">
                                    Entregue
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                                    Pendente Carga
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <BotaoVisualizarDocumento
                                    tipo="ordem_compra"
                                    id={item.ordem_id}
                                    titulo={`O.C. ${item.ordem_numero ?? ""}`}
                                  />
                                  <Button asChild size="icon" variant="ghost" className="size-7" title="Abrir e editar O.C.">
                                    <Link to="/ordens-compra">
                                      <Pencil className="size-3.5" />
                                    </Link>
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-7 text-destructive hover:bg-destructive/10"
                                    title="Excluir item desta ordem"
                                    disabled={excluirItemOC.isPending}
                                    onClick={() => {
                                      if (window.confirm(`Excluir o item "${item.descricao}" da ordem ${item.ordem_numero ?? ""}?`)) {
                                        excluirItemOC.mutate(item.id);
                                      }
                                    }}
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ExpandableCard>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ExpandableCard>
      )}

      {/* MODAL GLOBAL PARA PEDIR CARGA */}
      <ModalPedirCarga
        open={modalPedirCargaAberto}
        onOpenChange={setModalPedirCargaAberto}
      />
    </div>
  );
}
