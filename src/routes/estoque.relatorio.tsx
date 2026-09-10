import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownCircle, ArrowUpCircle, Boxes, Printer } from "lucide-react";

import { PageHeader, Kpi } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { brl } from "@/lib/erp";

export const Route = createFileRoute("/estoque/relatorio")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Relatório de Estoque | Piscinow ERP" },
      {
        name: "description",
        content:
          "Entradas, saídas e saldo por produto para acompanhar toda a movimentação do estoque.",
      },
      { property: "og:title", content: "Relatório de Estoque | Piscinow ERP" },
      {
        property: "og:description",
        content: "Acompanhe o que entra, o que sai e o saldo atual de cada produto.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <RelatorioEstoque />
    </RequireAuth>
  ),
});

type Produto = {
  id: string;
  codigo: string | null;
  nome: string;
  unidade: string;
  categoria: string | null;
  estoque_atual: number;
  estoque_minimo: number;
  preco_custo: number;
};

type Movimento = {
  produto_id: string;
  tipo: string;
  quantidade: number;
  created_at: string;
};

function hoje() {
  return new Date().toISOString().slice(0, 10);
}
function inicioDoMes() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

function RelatorioEstoque() {
  const [de, setDe] = useState(inicioDoMes());
  const [ate, setAte] = useState(hoje());
  const [busca, setBusca] = useState("");

  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos", "relatorio-estoque"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("id, codigo, nome, unidade, categoria, estoque_atual, estoque_minimo, preco_custo")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return (data ?? []) as Produto[];
    },
  });

  const { data: movimentos = [] } = useQuery({
    queryKey: ["estoque-movimentos", de, ate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estoque_movimentos")
        .select("produto_id, tipo, quantidade, created_at")
        .gte("created_at", `${de}T00:00:00`)
        .lte("created_at", `${ate}T23:59:59`);
      if (error) throw error;
      return (data ?? []) as Movimento[];
    },
  });

  const linhas = useMemo(() => {
    const mapa = new Map<string, { entradas: number; saidas: number }>();
    for (const m of movimentos) {
      const atual = mapa.get(m.produto_id) ?? { entradas: 0, saidas: 0 };
      const qtd = Number(m.quantidade ?? 0);
      if (m.tipo === "entrada" || m.tipo === "ajuste_positivo") atual.entradas += qtd;
      else atual.saidas += qtd;
      mapa.set(m.produto_id, atual);
    }
    const termo = busca.trim().toLowerCase();
    return produtos
      .map((p) => {
        const mov = mapa.get(p.id) ?? { entradas: 0, saidas: 0 };
        const saldo = Number(p.estoque_atual ?? 0);
        return {
          ...p,
          entradas: mov.entradas,
          saidas: mov.saidas,
          saldo,
          inicial: saldo - mov.entradas + mov.saidas,
          valor: saldo * Number(p.preco_custo ?? 0),
        };
      })
      .filter((l) =>
        termo
          ? `${l.nome} ${l.codigo ?? ""} ${l.categoria ?? ""}`.toLowerCase().includes(termo)
          : true,
      );
  }, [produtos, movimentos, busca]);

  const totais = useMemo(
    () =>
      linhas.reduce(
        (acc, l) => ({
          entradas: acc.entradas + l.entradas,
          saidas: acc.saidas + l.saidas,
          valor: acc.valor + l.valor,
          abaixoMinimo: acc.abaixoMinimo + (l.saldo < Number(l.estoque_minimo ?? 0) ? 1 : 0),
        }),
        { entradas: 0, saidas: 0, valor: 0, abaixoMinimo: 0 },
      ),
    [linhas],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatório de Estoque"
        description="Entradas, saídas e saldo por produto no período selecionado."
        actions={
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 size-4" /> Imprimir / PDF
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Entradas no período"
          value={totais.entradas.toLocaleString("pt-BR")}
          icon={ArrowDownCircle}
        />
        <Kpi
          label="Saídas no período"
          value={totais.saidas.toLocaleString("pt-BR")}
          icon={ArrowUpCircle}
        />
        <Kpi label="Valor em estoque" value={brl(totais.valor)} icon={Boxes} />
        <Kpi
          label="Abaixo do mínimo"
          value={String(totais.abaixoMinimo)}
          icon={Boxes}
          to="/compras"
        />
      </div>

      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-end sm:justify-between">
          <CardTitle>Movimentação por produto</CardTitle>
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground" htmlFor="de">
                De
              </label>
              <Input id="de" type="date" value={de} onChange={(e) => setDe(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground" htmlFor="ate">
                Até
              </label>
              <Input id="ate" type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground" htmlFor="busca">
                Produto
              </label>
              <Input
                id="busca"
                placeholder="Buscar por nome ou código"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Código</TableHead>
                <TableHead className="text-right">Saldo inicial</TableHead>
                <TableHead className="text-right">Entradas</TableHead>
                <TableHead className="text-right">Saídas</TableHead>
                <TableHead className="text-right">Saldo atual</TableHead>
                <TableHead className="text-right">Valor em custo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{l.codigo ?? "-"}</TableCell>
                  <TableCell className="text-right">{l.inicial.toLocaleString("pt-BR")}</TableCell>
                  <TableCell className="text-right text-emerald-500">
                    {l.entradas ? `+${l.entradas.toLocaleString("pt-BR")}` : "-"}
                  </TableCell>
                  <TableCell className="text-right text-destructive">
                    {l.saidas ? `-${l.saidas.toLocaleString("pt-BR")}` : "-"}
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${
                      l.saldo < Number(l.estoque_minimo ?? 0) ? "text-destructive" : ""
                    }`}
                  >
                    {l.saldo.toLocaleString("pt-BR")} {l.unidade}
                  </TableCell>
                  <TableCell className="text-right">{brl(l.valor)}</TableCell>
                </TableRow>
              ))}
              {linhas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    Nenhum produto encontrado para o filtro atual.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
