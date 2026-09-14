import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, Kpi } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { brl, hojeISO, proximoCodigo } from "@/lib/erp";

export const Route = createFileRoute("/compras")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Central de Reposição | Piscinow ERP" },
      {
        name: "description",
        content:
          "Reposição inteligente de estoque: produtos abaixo do mínimo, sugestão de compra e geração automática de ordens de compra por fornecedor.",
      },
      { property: "og:title", content: "Central de Reposição | Piscinow ERP" },
      {
        property: "og:description",
        content: "Gere ordens de compra automaticamente a partir do estoque mínimo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Compras />
    </RequireAuth>
  ),
});

type Produto = {
  id: string;
  codigo: string | null;
  nome: string;
  categoria: string | null;
  unidade: string;
  preco_custo: number;
  estoque_atual: number;
  estoque_minimo: number;
  fornecedor_id: string | null;
};

type Fornecedor = { id: string; nome: string; codigo: string | null };

function Compras() {
  const qc = useQueryClient();
  const [selecionados, setSelecionados] = useState<Record<string, boolean>>({});
  const [qtds, setQtds] = useState<Record<string, string>>({});

  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos", "reposicao"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select(
          "id, codigo, nome, categoria, unidade, preco_custo, estoque_atual, estoque_minimo, fornecedor_id",
        )
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data as Produto[];
    },
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ["fornecedores", "lista"],
    queryFn: async () => {
      const { data, error } = await supabase.from("fornecedores").select("id, nome, codigo");
      if (error) throw error;
      return data as Fornecedor[];
    },
  });

  const fornecedorPorId = useMemo(() => {
    const m = new Map<string, Fornecedor>();
    for (const f of fornecedores) m.set(f.id, f);
    return m;
  }, [fornecedores]);

  const sugestoes = useMemo(
    () =>
      produtos
        .filter((p) => Number(p.estoque_atual) <= Number(p.estoque_minimo))
        .map((p) => {
          const sugestao = Math.max(
            p.estoque_minimo * 2 - p.estoque_atual,
            p.estoque_minimo,
          );
          return { ...p, sugestao: sugestao > 0 ? sugestao : p.estoque_minimo || 1 };
        }),
    [produtos],
  );

  const qtdFor = (id: string, sugestao: number) => {
    const raw = qtds[id];
    if (raw === undefined) return sugestao;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  const totalSelecionado = sugestoes.reduce((acc, p) => {
    if (!selecionados[p.id]) return acc;
    return acc + qtdFor(p.id, p.sugestao) * Number(p.preco_custo);
  }, 0);

  const fornecedoresEnvolvidos = new Set(
    sugestoes
      .filter((p) => selecionados[p.id])
      .map((p) => p.fornecedor_id ?? "sem-fornecedor"),
  ).size;

  const todosMarcados = sugestoes.length > 0 && sugestoes.every((p) => selecionados[p.id]);

  const marcarTodos = (v: boolean) => {
    const novo: Record<string, boolean> = {};
    for (const p of sugestoes) novo[p.id] = v;
    setSelecionados(novo);
  };

  const gerarOrdens = useMutation({
    mutationFn: async () => {
      const itensSelecionados = sugestoes.filter((p) => selecionados[p.id]);
      if (itensSelecionados.length === 0) throw new Error("Selecione ao menos um item");

      const { data: auth } = await supabase.auth.getUser();
      const { data: ordensExistentes } = await supabase
        .from("ordens_compra")
        .select("numero");

      const numerosExistentes = (ordensExistentes ?? []).map((o) => o.numero);
      let contador = 0;

      const grupos = new Map<string, typeof itensSelecionados>();
      for (const item of itensSelecionados) {
        const chave = item.fornecedor_id ?? "sem-fornecedor";
        if (!grupos.has(chave)) grupos.set(chave, []);
        grupos.get(chave)!.push(item);
      }

      for (const [fornecedorId, itens] of grupos) {
        const fornecedor =
          fornecedorId !== "sem-fornecedor" ? fornecedorPorId.get(fornecedorId) : undefined;

        const linhas = itens.map((p) => {
          const qtd = qtdFor(p.id, p.sugestao);
          const total = qtd * Number(p.preco_custo);
          return { produto: p, qtd, total };
        });

        const valorProdutos = linhas.reduce((s, l) => s + l.total, 0);
        const icmsBase = valorProdutos;
        const icmsValor = icmsBase * 0.18;
        const valorTotal = valorProdutos;

        contador += 1;
        const numero = proximoCodigo("OC", [...numerosExistentes, `OC-${String(contador).padStart(3, "0")}`]);

        const { data: ordem, error: erroOrdem } = await supabase
          .from("ordens_compra")
          .insert({
            numero,
            fornecedor_id: fornecedorId !== "sem-fornecedor" ? fornecedorId : null,
            fornecedor_nome: fornecedor?.nome ?? "Fornecedor não definido",
            data_pedido: hojeISO(),
            valor_produtos: valorProdutos,
            desconto: 0,
            icms_base: icmsBase,
            icms_valor: icmsValor,
            icms_st_base: 0,
            icms_st_valor: 0,
            valor_total: valorTotal,
            status: "pendente",
            observacoes: "Gerada automaticamente pela Central de Reposição",
            created_by: auth.user?.id ?? null,
          })
          .select("id")
          .single();
        if (erroOrdem) throw erroOrdem;

        const itensPayload = linhas.map((l) => ({
          ordem_id: ordem.id,
          produto_id: l.produto.id,
          codigo: l.produto.codigo,
          descricao: l.produto.nome,
          unidade: l.produto.unidade,
          quantidade: l.qtd,
          valor_unitario: Number(l.produto.preco_custo),
          desconto: 0,
          total: l.total,
        }));

        const { error: erroItens } = await supabase.from("ordem_compra_itens").insert(itensPayload);
        if (erroItens) throw erroItens;
      }

      return grupos.size;
    },
    onSuccess: (qtdOrdens) => {
      toast.success(
        qtdOrdens === 1 ? "1 ordem de compra gerada" : `${qtdOrdens} ordens de compra geradas`,
      );
      setSelecionados({});
      setQtds({});
      qc.invalidateQueries({ queryKey: ["ordens_compra"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Central de Reposição Inteligente"
        subtitle="Produtos com estoque igual ou abaixo do mínimo, com sugestão automática de compra."
        actions={
          <Button
            disabled={fornecedoresEnvolvidos === 0 && totalSelecionado === 0}
            onClick={() => gerarOrdens.mutate()}
          >
            <ShoppingBag /> Gerar Ordem de Compra para os itens selecionados
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Itens críticos" value={String(sugestoes.length)} tone="warning" to="/estoque/relatorio" />
        <Kpi label="Valor total de reposição selecionada" value={brl(totalSelecionado)} to="/ordens-compra" />
        <Kpi label="Fornecedores envolvidos" value={String(fornecedoresEnvolvidos)} to="/fornecedores" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Itens a repor <Badge variant="secondary">{sugestoes.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sugestoes.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhum item abaixo do estoque mínimo. Tudo abastecido!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={todosMarcados}
                        onCheckedChange={(v) => marcarTodos(!!v)}
                      />
                    </TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Fornecedor habitual</TableHead>
                    <TableHead className="text-right">Atual</TableHead>
                    <TableHead className="text-right">Mínimo</TableHead>
                    <TableHead className="text-right">Sugestão</TableHead>
                    <TableHead className="text-right">Qtd a comprar</TableHead>
                    <TableHead className="text-right">Custo unit.</TableHead>
                    <TableHead className="text-right">Total estimado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sugestoes.map((p) => {
                    const qtd = qtdFor(p.id, p.sugestao);
                    const fornecedor = p.fornecedor_id ? fornecedorPorId.get(p.fornecedor_id) : undefined;
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Checkbox
                            checked={!!selecionados[p.id]}
                            onCheckedChange={(v) =>
                              setSelecionados((s) => ({ ...s, [p.id]: !!v }))
                            }
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs">{p.codigo ?? "—"}</TableCell>
                        <TableCell className="font-medium">{p.nome}</TableCell>
                        <TableCell>{p.categoria ?? "—"}</TableCell>
                        <TableCell>{fornecedor?.nome ?? "—"}</TableCell>
                        <TableCell className="text-right text-destructive">
                          {p.estoque_atual}
                        </TableCell>
                        <TableCell className="text-right">{p.estoque_minimo}</TableCell>
                        <TableCell className="text-right font-medium text-primary">
                          {p.sugestao}
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min={0}
                            className="w-24 text-right"
                            value={qtds[p.id] ?? String(p.sugestao)}
                            onChange={(e) =>
                              setQtds((s) => ({ ...s, [p.id]: e.target.value }))
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">{brl(Number(p.preco_custo))}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {brl(qtd * Number(p.preco_custo))}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
