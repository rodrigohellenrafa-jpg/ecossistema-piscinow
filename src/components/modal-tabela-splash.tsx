import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, RefreshCw, Search, Sparkles, Plus, ExternalLink } from "lucide-react";
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
import { brl } from "@/lib/erp";
import {
  TABELA_SPLASH_PISCINAS_2026,
  type ItemSplashTabela,
} from "@/data/tabela-splash-piscinas";
import type { Tables } from "@/integrations/supabase/types";

type Produto = Tables<"produtos">;

export function ModalTabelaSplash({
  produtosExistentes = [],
}: {
  produtosExistentes?: Produto[];
}) {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroModelo, setFiltroModelo] = useState("TODOS");
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

  const totalCadastrados = useMemo(() => {
    return TABELA_SPLASH_PISCINAS_2026.filter((i) => estaCadastrado(i)).length;
  }, [cadastradosSet]);

  const sincronizarTodos = useMutation({
    mutationFn: async () => {
      const { data: userData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !userData.user) {
        throw new Error("Faça login novamente para realizar a sincronização.");
      }
      const uid = userData.user.id;

      // 1. Garante que o fornecedor Splash Piscinas exista
      const { data: fornList, error: fornErr } = await supabase
        .from("fornecedores")
        .select("id, nome")
        .ilike("nome", "%Splash%");
      if (fornErr) throw fornErr;

      let splashFornecedorId = fornList?.[0]?.id;
      if (!splashFornecedorId) {
        const { data: novoForn, error: createFornErr } = await supabase
          .from("fornecedores")
          .insert({
            nome: "Splash Piscinas by iGUI",
            contato: "Fábrica Splash",
            observacoes: "Fornecedor oficial de piscinas Splash by iGUI 2026",
            ativo: true,
            created_by: uid,
          })
          .select("id")
          .single();
        if (createFornErr) throw createFornErr;
        splashFornecedorId = novoForn.id;
      }

      // 2. Prepara os dados para inserção / atualização
      const payload = TABELA_SPLASH_PISCINAS_2026.map((item) => ({
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
        descricao: item.descricao,
        ativo: true,
        created_by: uid,
      }));

      // Inserção em lotes de 40 para não estourar payload
      for (let i = 0; i < payload.length; i += 40) {
        const chunk = payload.slice(i, i + 40);
        // Usamos upsert baseado em 'codigo'
        const { error: upsertErr } = await supabase
          .from("produtos")
          .upsert(chunk as never, { onConflict: "codigo", ignoreDuplicates: false });

        if (upsertErr) {
          // Fallback se 'codigo' não for unique constraint no banco: busca e insere os que faltam
          for (const item of chunk) {
            const existe = produtosExistentes.find(
              (p) => p.codigo === item.codigo || p.nome === item.nome,
            );
            if (existe) {
              await supabase
                .from("produtos")
                .update({
                  preco_venda: item.preco_venda,
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
      toast.success("Catálogo Splash 2026 sincronizado com sucesso no sistema!");
      qc.invalidateQueries({ queryKey: ["produtos"] });
      qc.invalidateQueries({ queryKey: ["fornecedores-select"] });
    },
    onError: (e: Error) => {
      toast.error(e.message || "Erro ao sincronizar tabela Splash.");
    },
  });

  const cadastrarItemIndividual = async (item: ItemSplashTabela) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;

      // Busca fornecedor Splash se existir
      const { data: fornList } = await supabase
        .from("fornecedores")
        .select("id")
        .ilike("nome", "%Splash%")
        .limit(1);
      const fornId = fornList?.[0]?.id ?? null;

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/5">
          <Sparkles className="size-4 text-amber-500" />
          Tabela Splash 2026 ({totalCadastrados}/{TABELA_SPLASH_PISCINAS_2026.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="size-5 text-amber-500" />
                Tabela de Preços Oficial Splash Piscinas by iGUI (2026)
              </DialogTitle>
              <DialogDescription className="mt-1">
                Catálogo oficial completo com 116 modelos e acessórios. Vigência a partir de
                15/04/2026.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
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
                  : `Sincronizar no ERP (${TABELA_SPLASH_PISCINAS_2026.length} itens)`}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
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
                  <TableHead className="w-32">Código</TableHead>
                  <TableHead>Modelo / Piscina</TableHead>
                  <TableHead>Dimensões</TableHead>
                  <TableHead>Acabamento / Detalhes</TableHead>
                  <TableHead className="text-right">Preço Tabela 2026</TableHead>
                  <TableHead className="text-center w-28">Status</TableHead>
                  <TableHead className="text-right w-24">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itensFiltrados.map((item) => {
                  const cadastrado = estaCadastrado(item);
                  return (
                    <TableRow key={item.codigo} className={cadastrado ? "bg-emerald-500/[0.02]" : ""}>
                      <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                        {item.codigo}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {item.nome}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.dimensoes}
                      </TableCell>
                      <TableCell className="text-xs">
                        {item.acabamento ? (
                          <Badge variant="secondary" className="text-[11px]">
                            {item.acabamento}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">Padrão Splash</span>
                        )}
                        {item.opcionalPower && (
                          <span className="block text-[11px] text-amber-600 mt-0.5">
                            Suporta {item.opcionalPower}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground">
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
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      Nenhum modelo encontrado para a busca "{busca}".
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="items-center justify-between border-t pt-4 sm:justify-between">
          <p className="text-xs text-muted-foreground">
            * A tabela serve como referência oficial de fábrica. Valores podem ser ajustados conforme frete e mão de obra local.
          </p>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
