import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Truck,
  Building2,
  PackageCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Calendar,
  AlertCircle,
  Users,
  Search,
  ShoppingCart,
  Boxes,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR, hojeISO, proximoCodigo } from "@/lib/erp";
import {
  ManifestoCargaModal,
  type CargaManifestoDados,
  type ItemCargaManifesto,
} from "@/components/manifesto-carga-modal";

interface Fornecedor {
  id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  cnpj?: string | null;
}

interface ItemPendente {
  id: string;
  ordem_id: string;
  ordem_numero: string | null;
  cliente_id: string | null;
  cliente_nome: string;
  produto_id: string | null;
  produto_nome: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  fornecedor_id: string | null;
  fornecedor_nome: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fornecedorInicialId?: string | null;
}

export function ModalPedirCarga({ open, onOpenChange, fornecedorInicialId }: Props) {
  const qc = useQueryClient();
  const [passo, setPasso] = useState<1 | 2 | 3 | 4>(1);
  const [fornecedorId, setFornecedorId] = useState<string>(fornecedorInicialId || "");
  const [itensSelecionados, setItensSelecionados] = useState<Record<string, boolean>>({});
  const [busca, setBusca] = useState("");

  // Dados do formulário de fechamento (Passo 4)
  const [previsaoEntrega, setPrevisaoEntrega] = useState("");
  const [placaVeiculo, setPlacaVeiculo] = useState("");
  const [motoristaContato, setMotoristaContato] = useState("");
  const [volumeCubagem, setVolumeCubagem] = useState("");
  const [observacoes, setObservacoes] = useState("");

  // Estado para visualização do manifesto logo após criação
  const [manifestoAberto, setManifestoAberto] = useState(false);
  const [cargaCriada, setCargaCriada] = useState<CargaManifestoDados | null>(null);

  // 1. Carrega fornecedores ativos
  const { data: fornecedores = [] } = useQuery({
    queryKey: ["fornecedores", "lista-cargas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fornecedores")
        .select("id, nome, email, telefone, cnpj")
        .order("nome");
      if (error) throw error;
      return data as Fornecedor[];
    },
  });

  // 2. Carrega ordens de compra e seus itens pendentes de carga
  const { data: itensTodos = [] } = useQuery({
    queryKey: ["ordem_compra_itens", "pendentes-carga"],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordem_compra_itens")
        .select(`
          id,
          ordem_id,
          cliente_id,
          cliente_nome,
          produto_id,
          descricao,
          quantidade,
          valor_unitario,
          total,
          carga_id,
          status_carga,
          ordens_compra:ordem_id (
            id,
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
        cliente_nome: row.cliente_nome || "Estoque Geral",
        produto_id: row.produto_id,
        produto_nome: row.descricao,
        quantidade: Number(row.quantidade || 1),
        valor_unitario: Number(row.valor_unitario || 0),
        valor_total: Number(row.total || 0),
        fornecedor_id: row.ordens_compra?.fornecedor_id,
        fornecedor_nome: row.ordens_compra?.fornecedor_nome || "Fornecedor não identificado",
        carga_id: row.carga_id,
        status_carga: row.status_carga,
        ordem_status: row.ordens_compra?.status,
      })) as (ItemPendente & { carga_id?: string | null; status_carga?: string | null; ordem_status?: string })[];
    },
  });

  // Filtra itens que ainda não foram consolidados em nenhuma carga
  const itensPendentes = useMemo(() => {
    return itensTodos.filter((item) => {
      // Ignora ordens canceladas ou já em carga
      if (item.ordem_status === "cancelada") return false;
      if (item.carga_id) return false;
      if (item.status_carga && item.status_carga !== "pendente_carga") return false;
      return true;
    });
  }, [itensTodos]);

  // Contadores por fornecedor para o Passo 1
  const contagemPorFornecedor = useMemo(() => {
    const mapa = new Map<string, { totalItens: number; totalOcs: Set<string>; totalValor: number }>();
    for (const item of itensPendentes) {
      if (!item.fornecedor_id) continue;
      const atual = mapa.get(item.fornecedor_id) ?? {
        totalItens: 0,
        totalOcs: new Set<string>(),
        totalValor: 0,
      };
      atual.totalItens += item.quantidade;
      if (item.ordem_numero) atual.totalOcs.add(item.ordem_numero);
      atual.totalValor += item.valor_total;
      mapa.set(item.fornecedor_id, atual);
    }
    return mapa;
  }, [itensPendentes]);

  // Fornecedor selecionado
  const fornecedorAtual = useMemo(() => {
    return fornecedores.find((f) => f.id === fornecedorId) ?? null;
  }, [fornecedores, fornecedorId]);

  // Itens pendentes do fornecedor escolhido
  const itensDoFornecedor = useMemo(() => {
    if (!fornecedorId) return [];
    return itensPendentes.filter((item) => item.fornecedor_id === fornecedorId);
  }, [itensPendentes, fornecedorId]);

  // Itens filtrados pela busca
  const itensFiltrados = useMemo(() => {
    if (!busca.trim()) return itensDoFornecedor;
    const termo = busca.toLowerCase();
    return itensDoFornecedor.filter(
      (item) =>
        item.produto_nome.toLowerCase().includes(termo) ||
        item.cliente_nome.toLowerCase().includes(termo) ||
        (item.ordem_numero && item.ordem_numero.toLowerCase().includes(termo)),
    );
  }, [itensDoFornecedor, busca]);

  // Itens efetivamente marcados para entrarem na carga
  const itensMarcados = useMemo(() => {
    return itensDoFornecedor.filter((item) => itensSelecionados[item.id] === true);
  }, [itensDoFornecedor, itensSelecionados]);

  const totalItensMarcados = itensMarcados.reduce((sum, item) => sum + item.quantidade, 0);
  const totalValorMarcado = itensMarcados.reduce((sum, item) => sum + item.valor_total, 0);
  const clientesAtendidos = Array.from(new Set(itensMarcados.map((i) => i.cliente_nome)));

  const todosFiltradosMarcados =
    itensFiltrados.length > 0 && itensFiltrados.every((i) => itensSelecionados[i.id]);

  const marcarTodosItens = (marcar: boolean) => {
    setItensSelecionados((atual) => {
      const proximo = { ...atual };
      for (const item of itensFiltrados) {
        if (marcar) {
          proximo[item.id] = true;
        } else {
          delete proximo[item.id];
        }
      }
      return proximo;
    });
  };

  // Mutação para criar a carga e fechar o lote
  const criarCargaMutation = useMutation({
    mutationFn: async () => {
      if (!fornecedorAtual) throw new Error("Selecione um fornecedor");
      if (itensMarcados.length === 0) throw new Error("Selecione ao menos um item para a carga");

      const { data: auth } = await supabase.auth.getUser();

      // Busca próximo número sequencial de carga (CRG-001, CRG-002...)
      const { data: cargasExistentes } = await (supabase as any)
        .from("cargas")
        .select("numero");
      const numeros = (cargasExistentes ?? []).map((c: any) => c.numero);
      const numeroCarga = proximoCodigo("CRG", numeros);

      // Snapshot dos itens
      const itensSnapshot: ItemCargaManifesto[] = itensMarcados.map((item) => ({
        ordem_numero: item.ordem_numero,
        cliente_nome: item.cliente_nome,
        produto_nome: item.produto_nome,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        valor_total: item.valor_total,
      }));

      // 1. Cria a carga
      const { data: novaCarga, error: erroCarga } = await (supabase as any)
        .from("cargas")
        .insert({
          numero: numeroCarga,
          fornecedor_id: fornecedorAtual.id,
          fornecedor_nome: fornecedorAtual.nome,
          data_solicitacao: hojeISO(),
          previsao_entrega: previsaoEntrega || null,
          status: "solicitada",
          total_itens: totalItensMarcados,
          total_valor: totalValorMarcado,
          volume_cubagem: volumeCubagem.trim() || null,
          placa_veiculo: placaVeiculo.trim() || null,
          motorista_contato: motoristaContato.trim() || null,
          observacoes: observacoes.trim() || null,
          itens_snapshot: itensSnapshot,
          created_by: auth.user?.id ?? null,
        })
        .select("id, numero")
        .single();

      if (erroCarga) throw erroCarga;

      const cargaId = novaCarga.id;

      // 2. Insere itens na tabela cargas_itens
      const payloadItens = itensMarcados.map((item) => ({
        carga_id: cargaId,
        ordem_id: item.ordem_id,
        item_ordem_id: item.id,
        cliente_id: item.cliente_id,
        cliente_nome: item.cliente_nome,
        produto_id: item.produto_id,
        produto_nome: item.produto_nome,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        valor_total: item.valor_total,
      }));

      const { error: erroItens } = await (supabase as any)
        .from("cargas_itens")
        .insert(payloadItens);
      if (erroItens) throw erroItens;

      // 3. Atualiza ordem_compra_itens para em_carga
      const idsItens = itensMarcados.map((i) => i.id);
      const { error: erroUpItens } = await supabase
        .from("ordem_compra_itens")
        .update({
          carga_id: cargaId,
          status_carga: "em_carga",
        } as any)
        .in("id", idsItens);
      if (erroUpItens) throw erroUpItens;

      // 4. Atualiza ordens_compra relacionadas
      const idsOrdens = Array.from(new Set(itensMarcados.map((i) => i.ordem_id)));
      for (const ordemId of idsOrdens) {
        await supabase
          .from("ordens_compra")
          .update({
            carga_id: cargaId,
            status_carga: "em_carga",
          } as any)
          .eq("id", ordemId);
      }

      return {
        id: cargaId,
        numero: numeroCarga,
        fornecedor_nome: fornecedorAtual.nome,
        data_solicitacao: hojeISO(),
        previsao_entrega: previsaoEntrega,
        status: "solicitada",
        total_itens: totalItensMarcados,
        total_valor: totalValorMarcado,
        volume_cubagem: volumeCubagem,
        placa_veiculo: placaVeiculo,
        motorista_contato: motoristaContato,
        observacoes: observacoes,
        itens: itensSnapshot,
      } as CargaManifestoDados;
    },
    onSuccess: (dados) => {
      toast.success(`Carga #${dados.numero} criada e solicitada com sucesso!`);
      qc.invalidateQueries({ queryKey: ["cargas"] });
      qc.invalidateQueries({ queryKey: ["ordens_compra"] });
      qc.invalidateQueries({ queryKey: ["ordem_compra_itens"] });

      setCargaCriada(dados);
      setManifestoAberto(true);
      onOpenChange(false);
      resetar();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const resetar = () => {
    setPasso(1);
    setFornecedorId("");
    setItensSelecionados({});
    setBusca("");
    setPrevisaoEntrega("");
    setPlacaVeiculo("");
    setMotoristaContato("");
    setVolumeCubagem("");
    setObservacoes("");
  };

  const handleNext = () => {
    if (passo === 1) {
      if (!fornecedorId) {
        toast.error("Selecione um fornecedor para continuar");
        return;
      }
      // Marca todos os itens deste fornecedor por padrão
      const mapa: Record<string, boolean> = {};
      for (const item of itensDoFornecedor) mapa[item.id] = true;
      setItensSelecionados(mapa);
      setPasso(2);
    } else if (passo === 2 || passo === 3) {
      if (itensMarcados.length === 0) {
        toast.error("Selecione ao menos um produto para entrar no caminhão");
        return;
      }
      setPasso(4);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) resetar();
          onOpenChange(v);
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Truck className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">
                    📦 Pedir Carga · Fechamento de Lote
                  </DialogTitle>
                  <DialogDescription>
                    Consolide Ordens de Compra por fornecedor em um manifesto único de transporte.
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* STEPPER / PROGRESSO */}
            <div className="grid grid-cols-4 gap-2 pt-3 border-t">
              {[
                { step: 1, label: "1. Fornecedor" },
                { step: 2, label: "2. OCs Pendentes" },
                { step: 3, label: "3. Seleção de Carga" },
                { step: 4, label: "4. Fechamento" },
              ].map(({ step, label }) => (
                <div
                  key={step}
                  onClick={() => {
                    if (step < passo) setPasso(step as any);
                  }}
                  className={`flex items-center justify-center p-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    passo === step
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : passo > step
                        ? "bg-muted text-foreground hover:bg-muted/80"
                        : "bg-muted/30 text-muted-foreground opacity-60"
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
          </DialogHeader>

          {/* CONTEÚDO DOS PASSOS */}
          <div className="space-y-4 py-2">
            {/* PASSO 1: SELEÇÃO DO FORNECEDOR */}
            {passo === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm">
                    Passo 1: Selecione o Fornecedor de Origem
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Escolha de qual fábrica ou distribuidor os produtos serão carregados no caminhão.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {fornecedores.map((forn) => {
                    const stats = contagemPorFornecedor.get(forn.id);
                    const temPendencias = Boolean(stats && stats.totalItens > 0);
                    const isSelected = fornecedorId === forn.id;

                    return (
                      <Card
                        key={forn.id}
                        onClick={() => setFornecedorId(forn.id)}
                        className={`cursor-pointer transition-all border ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
                            : temPendencias
                              ? "hover:border-foreground/30 hover:bg-muted/20"
                              : "opacity-60 bg-muted/10"
                        }`}
                      >
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Building2
                                className={`size-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                              />
                              <span className="font-bold text-sm leading-tight line-clamp-1">
                                {forn.nome}
                              </span>
                            </div>
                            {temPendencias ? (
                              <Badge variant="secondary" className="bg-amber-500/15 text-amber-500 font-mono text-[10px]">
                                {stats?.totalItens} un.
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                Sem OCs
                              </Badge>
                            )}
                          </div>

                          <div className="text-xs text-muted-foreground space-y-0.5">
                            <p>
                              OCs aguardando: <strong>{stats?.totalOcs.size ?? 0} pedidos</strong>
                            </p>
                            <p>
                              Valor estimado:{" "}
                              <strong className="text-foreground">
                                {brl(stats?.totalValor ?? 0)}
                              </strong>
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PASSO 2 & 3: LISTAGEM E SELEÇÃO DE PRODUTOS PARA A CARGA */}
            {(passo === 2 || passo === 3) && (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <span>Passo {passo}: Produtos Pendentes de {fornecedorAtual?.nome}</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {itensDoFornecedor.length} itens disponíveis
                      </Badge>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Marque exatamente quais produtos entrarão no caminhão desta carga.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por cliente, OC ou produto..."
                      className="pl-8 h-8 text-xs"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                    />
                  </div>
                </div>

                {/* TABELA DE PRODUTOS */}
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="text-xs bg-muted/20">
                        <TableHead className="w-10">
                          <Checkbox
                            checked={todosFiltradosMarcados}
                            onCheckedChange={(val) => marcarTodosItens(val === true)}
                          />
                        </TableHead>
                        <TableHead className="w-24">Ordem (O.C.)</TableHead>
                        <TableHead className="min-w-44">Cliente de Destino</TableHead>
                        <TableHead className="min-w-56">Produto / Modelo</TableHead>
                        <TableHead className="w-20 text-right">Qtd</TableHead>
                        <TableHead className="w-28 text-right">Valor Unit.</TableHead>
                        <TableHead className="w-28 text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itensFiltrados.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-xs">
                            Nenhum item pendente de carga encontrado para este fornecedor.
                          </TableCell>
                        </TableRow>
                      ) : (
                        itensFiltrados.map((item) => {
                          const isChecked = itensSelecionados[item.id] === true;
                          return (
                            <TableRow
                              key={item.id}
                              className={`text-xs cursor-pointer ${isChecked ? "bg-primary/5" : ""}`}
                              onClick={() => {
                                setItensSelecionados((atual) => ({
                                  ...atual,
                                  [item.id]: !atual[item.id],
                                }));
                              }}
                            >
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(val) => {
                                    setItensSelecionados((atual) => ({
                                      ...atual,
                                      [item.id]: val === true,
                                    }));
                                  }}
                                />
                              </TableCell>
                              <TableCell className="font-mono font-semibold">
                                {item.ordem_numero}
                              </TableCell>
                              <TableCell className="font-medium text-foreground">
                                {item.cliente_nome}
                              </TableCell>
                              <TableCell className="font-medium">
                                {item.produto_nome}
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                {item.quantidade} un.
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {brl(item.valor_unitario)}
                              </TableCell>
                              <TableCell className="text-right font-mono font-bold text-foreground">
                                {brl(item.valor_total)}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* BARRA DE RESUMO EM TEMPO REAL DA SELEÇÃO */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border bg-muted/10 text-xs">
                  <div className="flex items-center gap-4">
                    <span>
                      Marcados: <strong>{itensMarcados.length} produtos ({totalItensMarcados} un.)</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Clientes contemplados: <strong>{clientesAtendidos.length}</strong>
                    </span>
                  </div>
                  <div className="text-right">
                    <span>Total da carga: </span>
                    <strong className="text-sm font-mono text-primary">
                      {brl(totalValorMarcado)}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 4: FECHAMENTO DA CARGA E INFORMAÇÕES DE TRANSPORTE */}
            {passo === 4 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm">
                    Passo 4: Resumo e Fechamento da Carga
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Confira os dados do lote antes de confirmar a solicitação ao fornecedor.
                  </p>
                </div>

                {/* RESUMO CONSOLIDADO */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <Card className="bg-muted/10 border">
                    <CardContent className="p-3.5 space-y-1">
                      <p className="text-[11px] text-muted-foreground uppercase font-medium">Fornecedor</p>
                      <p className="font-bold text-sm text-foreground">{fornecedorAtual?.nome}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/10 border">
                    <CardContent className="p-3.5 space-y-1">
                      <p className="text-[11px] text-muted-foreground uppercase font-medium">Total de Produtos</p>
                      <p className="font-bold text-sm text-foreground">
                        {totalItensMarcados} volumes em {itensMarcados.length} itens
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/10 border">
                    <CardContent className="p-3.5 space-y-1">
                      <p className="text-[11px] text-muted-foreground uppercase font-medium">Valor Total do Lote</p>
                      <p className="font-bold text-sm font-mono text-primary">{brl(totalValorMarcado)}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* DESTINOS / CLIENTES */}
                <div className="p-3 rounded-lg border bg-muted/10 space-y-1 text-xs">
                  <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                    Clientes Contemplados nesta Carga ({clientesAtendidos.length}):
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {clientesAtendidos.map((cliente, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-background">
                        <Users className="size-3 mr-1 text-muted-foreground" />
                        {cliente}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* FORMULÁRIO DE TRANSPORTE */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Previsão de Saída / Entrega
                    </label>
                    <Input
                      type="date"
                      value={previsaoEntrega}
                      onChange={(e) => setPrevisaoEntrega(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Volume / Cubagem Aproximada
                    </label>
                    <Input
                      placeholder="Ex: 1 carreta fechada / 3 piscinas + caixas"
                      value={volumeCubagem}
                      onChange={(e) => setVolumeCubagem(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Placa do Veículo (opcional)
                    </label>
                    <Input
                      placeholder="Ex: ABC-1234"
                      value={placaVeiculo}
                      onChange={(e) => setPlacaVeiculo(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Motorista / Transportador (opcional)
                    </label>
                    <Input
                      placeholder="Nome do motorista ou telefone da transportadora"
                      value={motoristaContato}
                      onChange={(e) => setMotoristaContato(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Instruções / Observações Logísticas
                    </label>
                    <Textarea
                      rows={2}
                      placeholder="Observações de carregamento, ordem de descarregamento por cidade, etc..."
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RODAPÉ E NAVEGAÇÃO DOS PASSOS */}
          <DialogFooter className="flex flex-row items-center justify-between border-t pt-3">
            <div>
              {passo > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPasso((p) => Math.max(1, p - 1) as any)}
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="size-4" />
                  Voltar
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs"
              >
                Cancelar
              </Button>

              {passo < 4 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleNext}
                  className="gap-1 text-xs font-semibold"
                >
                  Continuar
                  <ChevronRight className="size-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => criarCargaMutation.mutate()}
                  disabled={criarCargaMutation.isPending || itensMarcados.length === 0}
                  className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                >
                  <CheckCircle2 className="size-4" />
                  Confirmar e Enviar Pedido de Carga
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MANIFESTO AUTOMÁTICO APÓS FECHAMENTO DA CARGA */}
      {cargaCriada && (
        <ManifestoCargaModal
          open={manifestoAberto}
          onOpenChange={setManifestoAberto}
          carga={cargaCriada}
        />
      )}
    </>
  );
}
