import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, RefreshCw, Search, Sparkles, Plus, Layers, Package } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { brl } from "@/lib/erp";
import {
  TABELA_SPLASH_PISCINAS_2026,
  TABELA_PORCELANAS_ATLAS_2026,
  type ItemSplashTabela,
  type ItemPorcelanaAtlas,
} from "@/data/tabela-splash-piscinas";
import {
  TABELA_PECAS_ESTOQUE_2026,
  type ItemPecaEstoque,
} from "@/data/tabela-pecas-estoque";
import {
  garantirFornecedorAnalandiaEMigrarProdutos,
  sincronizarPecasEstoqueNoBanco,
} from "@/hooks/use-sincronizar-pecas-estoque";
import type { Tables } from "@/integrations/supabase/types";

type Produto = Tables<"produtos">;

export function ModalTabelaSplash({
  produtosExistentes = [],
}: {
  produtosExistentes?: Produto[];
}) {
  const [open, setOpen] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<"piscinas" | "porcelanas" | "pecas">("piscinas");

  // Filtros de Piscinas
  const [busca, setBusca] = useState("");
  const [filtroModelo, setFiltroModelo] = useState("TODOS");

  // Filtros de Porcelanas
  const [buscaPorcelana, setBuscaPorcelana] = useState("");

  // Filtros de Peças e Estoque
  const [buscaPeca, setBuscaPeca] = useState("");

  const qc = useQueryClient();

  // Mapeia códigos e nomes já cadastrados no banco
  const cadastradosSet = useMemo(() => {
    const set = new Set<string>();
    for (const p of produtosExistentes) {
      if (p.codigo) set.add(p.codigo.toUpperCase());
      if (p.nome) set.add(p.nome.toLowerCase().trim());
    }
    return set;
  }, [produtosExistentes]);

  const estaCadastrado = (item: ItemSplashTabela) =>
    cadastradosSet.has(item.codigo.toUpperCase()) ||
    cadastradosSet.has(item.nome.toLowerCase().trim());

  const estaPorcelanaCadastrada = (item: ItemPorcelanaAtlas) =>
    cadastradosSet.has(item.codigo.toUpperCase()) ||
    cadastradosSet.has(item.nome.toLowerCase().trim());

  const estaPecaCadastrada = (item: ItemPecaEstoque) =>
    cadastradosSet.has(item.codigo.toUpperCase()) ||
    cadastradosSet.has(item.nome.toLowerCase().trim());

  const modelosUnicos = useMemo(() => {
    const mods = Array.from(new Set(TABELA_SPLASH_PISCINAS_2026.map((i) => i.modelo)));
    return mods.sort();
  }, []);

  const itensFiltrados = useMemo(() => {
    return TABELA_SPLASH_PISCINAS_2026.filter((item) => {
      const bateModelo = filtroModelo === "TODOS" || item.modelo === filtroModelo;
      const termo = busca.toLowerCase();
      const bateBusca =
        !termo ||
        item.nome.toLowerCase().includes(termo) ||
        item.codigo.toLowerCase().includes(termo) ||
        item.dimensoes.toLowerCase().includes(termo) ||
        item.modelo.toLowerCase().includes(termo) ||
        (item.acabamento && item.acabamento.toLowerCase().includes(termo));
      return bateModelo && bateBusca;
    });
  }, [busca, filtroModelo]);

  const porcelanasFiltradas = useMemo(() => {
    return TABELA_PORCELANAS_ATLAS_2026.filter((item) => {
      const termo = buscaPorcelana.toLowerCase();
      return (
        !termo ||
        item.nome.toLowerCase().includes(termo) ||
        item.codigo.toLowerCase().includes(termo) ||
        item.modeloOriginal.toLowerCase().includes(termo) ||
        item.modeloPiscinaCompativel.toLowerCase().includes(termo) ||
        item.dimensoesReferencia.toLowerCase().includes(termo)
      );
    });
  }, [buscaPorcelana]);

  const pecasFiltradas = useMemo(() => {
    const termo = buscaPeca.trim().toLowerCase();
    if (!termo) return TABELA_PECAS_ESTOQUE_2026;
    return TABELA_PECAS_ESTOQUE_2026.filter(
      (item) =>
        item.nome.toLowerCase().includes(termo) ||
        item.codigo.toLowerCase().includes(termo) ||
        item.ncm.toLowerCase().includes(termo) ||
        String(item.linha) === termo,
    );
  }, [buscaPeca]);

  const totalCadastrados = useMemo(() => {
    return TABELA_SPLASH_PISCINAS_2026.filter((i) => estaCadastrado(i)).length;
  }, [cadastradosSet]);

  const totalPorcelanasCadastradas = useMemo(() => {
    return TABELA_PORCELANAS_ATLAS_2026.filter((i) => estaPorcelanaCadastrada(i)).length;
  }, [cadastradosSet]);

  const totalPecasCadastradas = useMemo(() => {
    return TABELA_PECAS_ESTOQUE_2026.filter((i) => estaPecaCadastrada(i)).length;
  }, [cadastradosSet]);

  // Garante fornecedor Analandia Ind Piscinas e migra cadastros antigos de Splash Piscinas by iGUI
  const obterFornecedorSplashId = async (uid: string) => {
    const { analandiaId } = await garantirFornecedorAnalandiaEMigrarProdutos(uid || null);
    if (!analandiaId) {
      throw new Error("Não foi possível localizar ou cadastrar o fornecedor Analandia Ind Piscinas.");
    }
    return analandiaId;
  };

  // Sincronização de Piscinas
  const sincronizarTodos = useMutation({
    mutationFn: async () => {
      const { data: userData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !userData.user) {
        throw new Error("Faça login novamente para realizar a sincronização.");
      }
      const uid = userData.user.id;
      const splashFornecedorId = await obterFornecedorSplashId(uid);

      const payload = TABELA_SPLASH_PISCINAS_2026.map((item) => ({
        codigo: item.codigo,
        nome: item.nome,
        categoria: item.categoria,
        tipo: item.tipo,
        unidade: item.unidade,
        preco_custo: item.preco_custo,
        preco_venda: item.preco_venda,
        custo_fabricacao: item.custoFabricacao ?? 0,
        custo_logistico: item.custoLogistico ?? 0,
        estoque_atual: 0,
        estoque_minimo: 0,
        sob_encomenda: true,
        fornecedor_id: splashFornecedorId,
        descricao: item.descricao,
        ativo: true,
        created_by: uid,
      }));

      for (let i = 0; i < payload.length; i += 40) {
        const chunk = payload.slice(i, i + 40);
        const { error: upsertErr } = await supabase
          .from("produtos")
          .upsert(chunk as never, { onConflict: "codigo", ignoreDuplicates: false });

        if (upsertErr) {
          for (const item of chunk) {
            const existe = produtosExistentes.find(
              (p) => p.codigo === item.codigo || p.nome === item.nome,
            );
            if (existe) {
              await supabase
                .from("produtos")
                .update({
                  preco_custo: item.preco_custo,
                  preco_venda: item.preco_venda,
                  custo_fabricacao: item.custo_fabricacao,
                  custo_logistico: item.custo_logistico,
                  sob_encomenda: true,
                  categoria: item.categoria,
                  fornecedor_id: splashFornecedorId,
                  descricao: item.descricao,
                } as never)
                .eq("id", existe.id);
            } else {
              await supabase.from("produtos").insert(item as never);
            }
          }
        }
      }
    },
    onSuccess: () => {
      toast.success("Catálogo de Piscinas Splash sincronizado com sucesso!");
      qc.invalidateQueries({ queryKey: ["produtos"] });
      qc.invalidateQueries({ queryKey: ["fornecedores-select"] });
    },
    onError: (e: Error) => {
      toast.error(e.message || "Erro ao sincronizar piscinas Splash.");
    },
  });

  // Sincronização de Porcelanas / Pastilhas Atlas
  const sincronizarPorcelanas = useMutation({
    mutationFn: async () => {
      const { data: userData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !userData.user) {
        throw new Error("Faça login novamente para realizar a sincronização.");
      }
      const uid = userData.user.id;
      const splashFornecedorId = await obterFornecedorSplashId(uid);

      const payload = TABELA_PORCELANAS_ATLAS_2026.map((item) => ({
        codigo: item.codigo,
        nome: item.nome,
        categoria: item.categoria,
        tipo: item.tipo,
        unidade: item.unidade,
        preco_custo: item.preco_custo,
        preco_venda: item.preco_venda,
        estoque_atual: 0,
        estoque_minimo: 0,
        sob_encomenda: true,
        fornecedor_id: splashFornecedorId,
        modelo_pastilha: item.modeloOriginal,
        descricao: item.descricao,
        ativo: true,
        created_by: uid,
      }));

      const { error: upsertErr } = await supabase
        .from("produtos")
        .upsert(payload as never, { onConflict: "codigo", ignoreDuplicates: false });

      if (upsertErr) {
        for (const item of payload) {
          const existe = produtosExistentes.find(
            (p) => p.codigo === item.codigo || p.nome === item.nome,
          );
          if (existe) {
            await supabase
              .from("produtos")
              .update({
                preco_venda: item.preco_venda,
                categoria: item.categoria,
                modelo_pastilha: item.modelo_pastilha,
                descricao: item.descricao,
                fornecedor_id: splashFornecedorId,
              } as never)
              .eq("id", existe.id);
          } else {
            await supabase.from("produtos").insert(item as never);
          }
        }
      }
    },
    onSuccess: () => {
      toast.success("31 Porcelanas/Pastilhas Atlas sincronizadas no ERP!");
      qc.invalidateQueries({ queryKey: ["produtos"] });
      qc.invalidateQueries({ queryKey: ["fornecedores-select"] });
    },
    onError: (e: Error) => {
      toast.error(e.message || "Erro ao sincronizar tabela de Porcelanas.");
    },
  });

  const cadastrarItemIndividual = async (item: ItemSplashTabela) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      const fornId = await obterFornecedorSplashId(uid ?? "");

      const { error } = await supabase.from("produtos").insert({
        codigo: item.codigo,
        nome: item.nome,
        categoria: item.categoria,
        tipo: item.tipo,
        unidade: item.unidade,
        preco_custo: item.preco_custo,
        preco_venda: item.preco_venda,
        custo_fabricacao: item.custoFabricacao ?? 0,
        custo_logistico: item.custoLogistico ?? 0,
        estoque_atual: 0,
        estoque_minimo: 0,
        sob_encomenda: true,
        fornecedor_id: fornId,
        descricao: item.descricao,
        ativo: true,
        created_by: uid,
      } as never);

      if (error) throw error;
      toast.success(`${item.nome} cadastrado!`);
      qc.invalidateQueries({ queryKey: ["produtos"] });
    } catch (e) {
      toast.error((e as Error).message || "Erro ao cadastrar modelo.");
    }
  };

  const cadastrarPorcelanaIndividual = async (item: ItemPorcelanaAtlas) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      const fornId = await obterFornecedorSplashId(uid ?? "");

      const { error } = await supabase.from("produtos").insert({
        codigo: item.codigo,
        nome: item.nome,
        categoria: item.categoria,
        tipo: item.tipo,
        unidade: item.unidade,
        preco_custo: item.preco_custo,
        preco_venda: item.preco_venda,
        estoque_atual: 0,
        estoque_minimo: 0,
        sob_encomenda: true,
        fornecedor_id: fornId,
        modelo_pastilha: item.modeloOriginal,
        descricao: item.descricao,
        ativo: true,
        created_by: uid,
      } as never);

      if (error) throw error;
      toast.success(`${item.nome} cadastrada!`);
      qc.invalidateQueries({ queryKey: ["produtos"] });
    } catch (e) {
      toast.error((e as Error).message || "Erro ao cadastrar porcelana.");
    }
  };

  const sincronizarPecas = useMutation({
    mutationFn: async () => {
      return await sincronizarPecasEstoqueNoBanco({ silencioso: false });
    },
    onSuccess: ({ inseridos }) => {
      toast.success(
        inseridos > 0
          ? `${inseridos} peças e acessórios incluídos no estoque!`
          : "Todas as 529 peças e acessórios já estão no estoque!",
      );
      qc.invalidateQueries({ queryKey: ["produtos"] });
      qc.invalidateQueries({ queryKey: ["fornecedores-select"] });
    },
    onError: (e: Error) => {
      toast.error(e.message || "Erro ao sincronizar peças no estoque.");
    },
  });

  const cadastrarPecaIndividual = async (item: ItemPecaEstoque) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      const fornId = await obterFornecedorSplashId(uid ?? "");

      const { error } = await supabase.from("produtos").insert({
        codigo: item.codigo,
        nome: item.nome,
        categoria: item.categoria,
        tipo: item.tipo,
        unidade: item.unidade,
        ncm: item.ncm,
        preco_custo: item.preco_custo,
        preco_venda: item.preco_venda,
        unidades_por_compra: item.unidadesPorCompra,
        estoque_atual: 0,
        estoque_minimo: 0,
        sob_encomenda: false,
        fornecedor_id: fornId,
        descricao: item.descricao,
        ativo: true,
        created_by: uid,
      } as never);

      if (error) throw error;
      toast.success(`${item.nome} incluído no estoque!`);
      qc.invalidateQueries({ queryKey: ["produtos"] });
    } catch (e) {
      toast.error((e as Error).message || "Erro ao incluir peça no estoque.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/5">
          <Sparkles className="size-4 text-amber-500" />
          Catálogo Splash & Peças ({totalCadastrados + totalPorcelanasCadastradas + totalPecasCadastradas}/
          {TABELA_SPLASH_PISCINAS_2026.length +
            TABELA_PORCELANAS_ATLAS_2026.length +
            TABELA_PECAS_ESTOQUE_2026.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="size-5 text-amber-500" />
                Catálogo Oficial Splash Piscinas, Porcelanas Atlas & Peças de Estoque
              </DialogTitle>
              <DialogDescription className="mt-1">
                Tabela oficial com 116 piscinas, 31 Porcelanas Atlas e {TABELA_PECAS_ESTOQUE_2026.length} peças e acessórios de estoque com NCM e ST.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {abaAtiva === "piscinas" ? (
                <Button
                  size="sm"
                  onClick={() => sincronizarTodos.mutate()}
                  disabled={sincronizarTodos.isPending}
                  className="gap-2"
                >
                  <RefreshCw
                    className={`size-4 ${sincronizarTodos.isPending ? "animate-spin" : ""}`}
                  />
                  {sincronizarTodos.isPending
                    ? "Sincronizando…"
                    : `Sincronizar Piscinas (${TABELA_SPLASH_PISCINAS_2026.length})`}
                </Button>
              ) : abaAtiva === "porcelanas" ? (
                <Button
                  size="sm"
                  onClick={() => sincronizarPorcelanas.mutate()}
                  disabled={sincronizarPorcelanas.isPending}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <RefreshCw
                    className={`size-4 ${sincronizarPorcelanas.isPending ? "animate-spin" : ""}`}
                  />
                  {sincronizarPorcelanas.isPending
                    ? "Sincronizando…"
                    : `Sincronizar 31 Porcelanas no ERP`}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => sincronizarPecas.mutate()}
                  disabled={sincronizarPecas.isPending}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <RefreshCw
                    className={`size-4 ${sincronizarPecas.isPending ? "animate-spin" : ""}`}
                  />
                  {sincronizarPecas.isPending
                    ? "Sincronizando…"
                    : `Sincronizar ${TABELA_PECAS_ESTOQUE_2026.length} Peças no Estoque`}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs
          value={abaAtiva}
          onValueChange={(v) => setAbaAtiva(v as "piscinas" | "porcelanas" | "pecas")}
          className="w-full space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="piscinas" className="gap-2">
              <Sparkles className="size-4 text-amber-500" />
              Piscinas Splash ({totalCadastrados}/{TABELA_SPLASH_PISCINAS_2026.length})
            </TabsTrigger>
            <TabsTrigger value="porcelanas" className="gap-2">
              <Layers className="size-4 text-indigo-500" />
              Porcelanas Atlas ({totalPorcelanasCadastradas}/{TABELA_PORCELANAS_ATLAS_2026.length})
            </TabsTrigger>
            <TabsTrigger value="pecas" className="gap-2">
              <Package className="size-4 text-emerald-500" />
              Peças & Estoque ({totalPecasCadastradas}/{TABELA_PECAS_ESTOQUE_2026.length})
            </TabsTrigger>
          </TabsList>

          {/* ======================================================== */}
          {/* ABA 1: PISCINAS SPLASH                                   */}
          {/* ======================================================== */}
          <TabsContent value="piscinas" className="space-y-4 mt-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Buscar modelo, código ou dimensão (ex: Tropical, 6,00m, Atlas, Cancún)"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>

              <Select value={filtroModelo} onValueChange={setFiltroModelo}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Filtrar por modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos os modelos ({TABELA_SPLASH_PISCINAS_2026.length})</SelectItem>
                  {modelosUnicos.map((m) => {
                    const qtd = TABELA_SPLASH_PISCINAS_2026.filter((i) => i.modelo === m).length;
                    return (
                      <SelectItem key={m} value={m}>
                        {m} ({qtd})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-3 py-2 rounded-md">
                <span>Status no ERP:</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  {totalCadastrados} cadastrados
                </Badge>
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  {TABELA_SPLASH_PISCINAS_2026.length - totalCadastrados} pendentes
                </Badge>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">Código</TableHead>
                    <TableHead>Modelo / Piscina</TableHead>
                    <TableHead>Dimensões</TableHead>
                    <TableHead>Acabamento</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Custo s/ Margem</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Margem / Lucro</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Preço de Venda</TableHead>
                    <TableHead className="text-center w-24">Status</TableHead>
                    <TableHead className="text-right w-20">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itensFiltrados.map((item, idx) => {
                    const cadastrado = estaCadastrado(item);
                    return (
                      <TableRow
                        key={item.codigo}
                        className={
                          cadastrado
                            ? idx % 2 === 0
                              ? "bg-emerald-500/[0.04]"
                              : "bg-emerald-500/[0.08]"
                            : idx % 2 === 0
                              ? "bg-muted/20"
                              : "bg-background"
                        }
                      >
                        <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                          {item.codigo}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          <div>{item.nome}</div>
                          {item.custoCasco ? (
                            <div className="text-[11px] text-muted-foreground font-normal mt-0.5">
                              Casco {brl(item.custoCasco)} + Filtro {brl(item.custoFiltro ?? 0)} + Frete {brl(item.custoFrete ?? 0)} + Inst. {brl(item.custoInstalacao ?? 0)} + Imp. {brl(item.custoImposto ?? 0)}
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {item.dimensoes}
                        </TableCell>
                        <TableCell className="text-xs">
                          {item.acabamento ? (
                            <Badge variant="secondary" className="text-[11px]">
                              {item.acabamento}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Padrão</span>
                          )}
                          {item.opcionalPower && (
                            <span className="block text-[11px] text-amber-600 mt-0.5">
                              Suporta {item.opcionalPower}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {item.preco_custo > 0 ? (
                            <span className="font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap">
                              {brl(item.preco_custo)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {item.lucroProjetado ? (
                            <span className="font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                              +{brl(item.lucroProjetado)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-foreground whitespace-nowrap">
                          {brl(item.preco_venda)}
                        </TableCell>
                        <TableCell className="text-center">
                          {cadastrado ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                              <CheckCircle2 className="size-3.5" /> No ERP
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Pendente</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {cadastrado ? (
                            <Button size="sm" variant="ghost" disabled className="text-xs text-muted-foreground h-8 px-2">
                              Cadastrado
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 px-2 gap-1"
                              onClick={() => cadastrarItemIndividual(item)}
                            >
                              <Plus className="size-3" /> Incluir
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {itensFiltrados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                        Nenhum modelo encontrado para a busca "{busca}".
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ======================================================== */}
          {/* ABA 2: PORCELANAS & PASTILHAS ATLAS                      */}
          {/* ======================================================== */}
          <TabsContent value="porcelanas" className="space-y-4 mt-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Buscar modelo de porcelana (ex: TRAD 4, Bonaire 3, Tortuga, Atalaia...)"
                  value={buscaPorcelana}
                  onChange={(e) => setBuscaPorcelana(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-3 py-2 rounded-md">
                <span>Porcelanas no ERP:</span>
                <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/30">
                  {totalPorcelanasCadastradas} cadastradas
                </Badge>
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  {TABELA_PORCELANAS_ATLAS_2026.length - totalPorcelanasCadastradas} pendentes
                </Badge>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-36">Código SKU</TableHead>
                    <TableHead>Modelo / Piscina Compatível</TableHead>
                    <TableHead className="w-28">Medida</TableHead>
                    <TableHead className="w-32">Categoria</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Preço Porcelana</TableHead>
                    <TableHead className="text-center w-28">Status</TableHead>
                    <TableHead className="text-right w-24">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {porcelanasFiltradas.map((item, idx) => {
                    const cadastrada = estaPorcelanaCadastrada(item);
                    return (
                      <TableRow
                        key={item.codigo}
                        className={
                          cadastrada
                            ? idx % 2 === 0
                              ? "bg-indigo-500/[0.04]"
                              : "bg-indigo-500/[0.08]"
                            : idx % 2 === 0
                              ? "bg-muted/20"
                              : "bg-background"
                        }
                      >
                        <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                          {item.codigo}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          <div>{item.nome}</div>
                          <span className="text-[11px] text-muted-foreground">
                            Modelo de Fábrica: <b className="text-indigo-600 dark:text-indigo-400">{item.modeloOriginal}</b>
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {item.dimensoesReferencia}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[11px] border-indigo-500/30 text-indigo-600 bg-indigo-500/10">
                            {item.categoria}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-foreground whitespace-nowrap font-mono text-sm">
                          {brl(item.preco_venda)}
                        </TableCell>
                        <TableCell className="text-center">
                          {cadastrada ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                              <CheckCircle2 className="size-3.5" /> No ERP
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Pendente</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {cadastrada ? (
                            <Button size="sm" variant="ghost" disabled className="text-xs text-muted-foreground h-8 px-2">
                              Cadastrada
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 px-2 gap-1 border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-600"
                              onClick={() => cadastrarPorcelanaIndividual(item)}
                            >
                              <Plus className="size-3" /> Incluir
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {porcelanasFiltradas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        Nenhuma porcelana encontrada para a busca "{buscaPorcelana}".
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ======================================================== */}
          {/* ABA 3: PEÇAS & ESTOQUE (529 ITENS)                       */}
          {/* ======================================================== */}
          <TabsContent value="pecas" className="space-y-4 mt-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Buscar peça por descrição, linha (4 a 534), código (PEC-) ou NCM..."
                  value={buscaPeca}
                  onChange={(e) => setBuscaPeca(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-3 py-2 rounded-md">
                <span>Peças no Estoque:</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  {totalPecasCadastradas} cadastradas
                </Badge>
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  {TABELA_PECAS_ESTOQUE_2026.length - totalPecasCadastradas} pendentes
                </Badge>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden max-h-[55vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Linha</TableHead>
                    <TableHead className="w-28">Código</TableHead>
                    <TableHead>Descrição da Peça / Acessório</TableHead>
                    <TableHead className="w-28">NCM</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Preço Unit.</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Valor ST</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Preço Unit. c/ ST</TableHead>
                    <TableHead className="text-center w-24">Status</TableHead>
                    <TableHead className="text-right w-24">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pecasFiltradas.map((item, idx) => {
                    const cadastrada = estaPecaCadastrada(item);
                    return (
                      <TableRow
                        key={item.codigo}
                        className={
                          cadastrada
                            ? idx % 2 === 0
                              ? "bg-emerald-500/[0.04]"
                              : "bg-emerald-500/[0.08]"
                            : idx % 2 === 0
                              ? "bg-muted/20"
                              : "bg-background"
                        }
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{item.linha}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                          {item.codigo}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          <div>{item.nome}</div>
                          {item.unidadesPorCompra > 1 && (
                            <span className="text-[11px] text-muted-foreground">
                              Caixa com {item.unidadesPorCompra} UN
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {item.ncm}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs whitespace-nowrap">
                          {brl(item.precoUnit)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-amber-600 dark:text-amber-400 whitespace-nowrap">
                          {brl(item.valorSt)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-semibold text-foreground whitespace-nowrap">
                          {brl(item.precoUnitSt)}
                        </TableCell>
                        <TableCell className="text-center">
                          {cadastrada ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                              <CheckCircle2 className="size-3.5" /> No Estoque
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Pendente</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {cadastrada ? (
                            <Button size="sm" variant="ghost" disabled className="text-xs text-muted-foreground h-8 px-2">
                              Cadastrado
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 px-2 gap-1 border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-600"
                              onClick={() => cadastrarPecaIndividual(item)}
                            >
                              <Plus className="size-3" /> Incluir
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {pecasFiltradas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                        Nenhuma peça encontrada para a busca "{buscaPeca}".
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="items-center justify-between border-t pt-4 sm:justify-between">
          <p className="text-xs text-muted-foreground">
            * Valores oficiais de Piscinas, Porcelanas Atlas e Peças/Acessórios de Estoque (com NCM e ST).
          </p>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
