import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, Layers, PieChart, Tag } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/relatorio-contas")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Relatório Financeiro por Mês | Piscinow ERP" },
      {
        name: "description",
        content:
          "Relatório de contas a pagar e a receber com resumo mensal, status de títulos e saldo previsto.",
      },
      { property: "og:title", content: "Relatório Financeiro por Mês | Piscinow ERP" },
      {
        property: "og:description",
        content: "Resumo mensal de contas a pagar e receber, vencidos, pagos e saldo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <RelatorioContas />
    </RequireAuth>
  ),
});

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Linha = {
  mes: string;
  label: string;
  pagarAberto: number;
  pagarPago: number;
  pagarVencido: number;
  receberAberto: number;
  receberPago: number;
  receberVencido: number;
};

function RelatorioContas() {
  const { data, isLoading } = useQuery({
    queryKey: ["contas", "relatorio"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas")
        .select("id,descricao,parceiro,tipo,valor,valor_juros,valor_pago,categoria,vencimento,status")
        .order("vencimento", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: rateios = [] } = useQuery({
    queryKey: ["conta-rateios-relatorio"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conta_rateios")
        .select("conta_id, categoria, valor");
      if (error) throw error;
      return data as { conta_id: string; categoria: string; valor: number }[];
    },
  });


  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const contas = data ?? [];
  const hoje = new Date().toISOString().slice(0, 10);

  const mapa = new Map<string, Linha>();
  for (const c of contas) {
    const mes = c.vencimento.slice(0, 7);
    if (!mapa.has(mes)) {
      const [ano, m] = mes.split("-");
      mapa.set(mes, {
        mes,
        label: new Date(Number(ano), Number(m) - 1, 1).toLocaleDateString("pt-BR", {
          month: "short",
          year: "2-digit",
        }),
        pagarAberto: 0,
        pagarPago: 0,
        pagarVencido: 0,
        receberAberto: 0,
        receberPago: 0,
        receberVencido: 0,
      });
    }
    const linha = mapa.get(mes)!;
    const valor = Number(c.valor) || 0;
    const pago = c.status === "pago";
    const vencido = !pago && c.vencimento < hoje;
    if (c.tipo === "pagar") {
      if (pago) linha.pagarPago += valor;
      else if (vencido) linha.pagarVencido += valor;
      else linha.pagarAberto += valor;
    } else {
      if (pago) linha.receberPago += valor;
      else if (vencido) linha.receberVencido += valor;
      else linha.receberAberto += valor;
    }
  }

  const linhas = [...mapa.values()].sort((a, b) => a.mes.localeCompare(b.mes));

  const total = linhas.reduce(
    (acc, l) => ({
      pagarAberto: acc.pagarAberto + l.pagarAberto,
      pagarPago: acc.pagarPago + l.pagarPago,
      pagarVencido: acc.pagarVencido + l.pagarVencido,
      receberAberto: acc.receberAberto + l.receberAberto,
      receberPago: acc.receberPago + l.receberPago,
      receberVencido: acc.receberVencido + l.receberVencido,
    }),
    {
      pagarAberto: 0,
      pagarPago: 0,
      pagarVencido: 0,
      receberAberto: 0,
      receberPago: 0,
      receberVencido: 0,
    },
  );

  const aReceber = total.receberAberto + total.receberVencido;
  const aPagar = total.pagarAberto + total.pagarVencido;
  const saldo = aReceber - aPagar;

  const grafico = linhas.map((l) => ({
    label: l.label,
    Receber: l.receberAberto + l.receberVencido + l.receberPago,
    Pagar: l.pagarAberto + l.pagarVencido + l.pagarPago,
  }));

  const kpis = [
    { titulo: "A receber (em aberto)", valor: aReceber, to: "/contas" },
    { titulo: "A pagar (em aberto)", valor: aPagar, to: "/contas" },
    {
      titulo: "Vencidos",
      valor: total.pagarVencido + total.receberVencido,
      alerta: true,
      to: "/contas",
    },
    { titulo: "Saldo previsto", valor: saldo, to: "/fluxo-caixa" },
  ];

  const [mesFiltroCat, setMesFiltroCat] = useState<string>("vigente");

  const mesVigente = hoje.slice(0, 7);
  const mesAnterior = (() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  })();

  const labelMesVigente = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const labelMesAnterior = (() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  })();

  // Despesas por categoria e contribuição no fechamento do mês
  const contasParaCat = useMemo(() => {
    return contas.filter((c) => {
      if (c.tipo !== "pagar") return false;
      if (mesFiltroCat === "vigente") return c.vencimento.startsWith(mesVigente);
      if (mesFiltroCat === "anterior") return c.vencimento.startsWith(mesAnterior);
      return true;
    });
  }, [contas, mesFiltroCat, mesVigente, mesAnterior]);

  const { categoriasDespesa, totalDespesasFechamento, totalPagoFechamento, totalAbertoFechamento } = useMemo(() => {
    const mapaCat = new Map<string, { categoria: string; total: number; pago: number; aberto: number; qtd: number }>();
    let totalDespesasFechamento = 0;
    let totalPagoFechamento = 0;
    let totalAbertoFechamento = 0;

    for (const c of contasParaCat) {
      const totalTitulo = (Number(c.valor) || 0) + (Number(c.valor_juros) || 0);
      const pagoTitulo = c.status === "pago" ? (Number((c as any).valor_pago) || totalTitulo) : 0;
      const abertoTitulo = Math.max(0, totalTitulo - pagoTitulo);

      totalDespesasFechamento += totalTitulo;
      totalPagoFechamento += pagoTitulo;
      totalAbertoFechamento += abertoTitulo;

      const linhasRateio = rateios.filter((r) => r.conta_id === c.id);
      if (linhasRateio.length > 0) {
        let somaRateio = 0;
        for (const l of linhasRateio) {
          const val = Number(l.valor) || 0;
          somaRateio += val;
          const prop = totalTitulo > 0 ? val / totalTitulo : 0;
          const k = l.categoria?.trim() || "Sem categoria";
          const cur = mapaCat.get(k) ?? { categoria: k, total: 0, pago: 0, aberto: 0, qtd: 0 };
          cur.total += val;
          cur.pago += pagoTitulo * prop;
          cur.aberto += abertoTitulo * prop;
          cur.qtd += 1;
          mapaCat.set(k, cur);
        }
        const resto = totalTitulo - somaRateio;
        if (Math.abs(resto) > 0.005) {
          const k = c.categoria?.trim() || "Sem categoria";
          const prop = totalTitulo > 0 ? resto / totalTitulo : 0;
          const cur = mapaCat.get(k) ?? { categoria: k, total: 0, pago: 0, aberto: 0, qtd: 0 };
          cur.total += resto;
          cur.pago += pagoTitulo * prop;
          cur.aberto += abertoTitulo * prop;
          cur.qtd += 1;
          mapaCat.set(k, cur);
        }
      } else {
        const k = c.categoria?.trim() || "Sem categoria";
        const cur = mapaCat.get(k) ?? { categoria: k, total: 0, pago: 0, aberto: 0, qtd: 0 };
        cur.total += totalTitulo;
        cur.pago += pagoTitulo;
        cur.aberto += abertoTitulo;
        cur.qtd += 1;
        mapaCat.set(k, cur);
      }
    }

    const lista = [...mapaCat.values()]
      .map((item) => ({
        ...item,
        percentual: totalDespesasFechamento > 0 ? (item.total / totalDespesasFechamento) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return {
      categoriasDespesa: lista,
      totalDespesasFechamento,
      totalPagoFechamento,
      totalAbertoFechamento,
    };
  }, [contasParaCat, rateios]);

  // Alertas de vencimento
  const abertas = contas.filter((c) => c.status !== "pago");
  const dias = (venc: string) =>
    Math.round(
      (new Date(`${venc}T00:00:00`).getTime() - new Date(`${hoje}T00:00:00`).getTime()) / 86400000,
    );

  const alertas = abertas
    .map((c) => ({ ...c, dias: dias(c.vencimento) }))
    .filter((c) => c.dias <= 30)
    .sort((a, b) => a.dias - b.dias);

  const risco = (d: number) =>
    d < 0
      ? { label: "Vencido", variant: "destructive" as const }
      : d <= 7
        ? { label: d === 0 ? "Vence hoje" : `Em ${d} dia${d > 1 ? "s" : ""}`, variant: "destructive" as const }
        : { label: `Em ${d} dias`, variant: "secondary" as const };

  const somaAl = (f: (d: number) => boolean) =>
    alertas.filter((c) => f(c.dias)).reduce((s, c) => s + (Number(c.valor) || 0), 0);

  const resumoAlertas = [
    { titulo: "Vencidas", valor: somaAl((d) => d < 0), qtd: alertas.filter((c) => c.dias < 0).length, critico: true },
    {
      titulo: "Vencem em 7 dias",
      valor: somaAl((d) => d >= 0 && d <= 7),
      qtd: alertas.filter((c) => c.dias >= 0 && c.dias <= 7).length,
      critico: true,
    },
    {
      titulo: "Vencem em 30 dias",
      valor: somaAl((d) => d >= 0 && d <= 30),
      qtd: alertas.filter((c) => c.dias >= 0 && c.dias <= 30).length,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Relatório de Contas</h1>
        <p className="text-sm text-muted-foreground">
          Resumo mensal de contas a pagar e a receber por status.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Link key={k.titulo} to={k.to} className="block">
            <Card className="h-full transition-colors hover:border-primary/50 hover:bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {k.titulo}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={
                    k.alerta && k.valor > 0
                      ? "text-2xl font-semibold text-destructive"
                      : "text-2xl font-semibold"
                  }
                >
                  {brl(k.valor)}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <PieChart className="size-4 text-primary" />
              Contribuição por Tipo de Despesa · Fechamento do Mês
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Participação percentual de cada categoria no total de despesas e fechamento mensal.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-md border bg-muted/40 p-0.5 text-xs">
              <Button
                type="button"
                variant={mesFiltroCat === "vigente" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => setMesFiltroCat("vigente")}
              >
                Mês vigente ({labelMesVigente.split(" ")[0]})
              </Button>
              <Button
                type="button"
                variant={mesFiltroCat === "anterior" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => setMesFiltroCat("anterior")}
              >
                Mês anterior ({labelMesAnterior.split(" ")[0]})
              </Button>
              <Button
                type="button"
                variant={mesFiltroCat === "todos" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => setMesFiltroCat("todos")}
              >
                Todo o histórico
              </Button>
            </div>
            <Button asChild variant="outline" size="sm" className="h-7 text-xs gap-1">
              <Link to="/contas" search={{ periodo: undefined, tipo: undefined }}>
                Ver Contas <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-background/50 p-3">
              <span className="text-xs text-muted-foreground uppercase font-medium">
                Total de Despesas
              </span>
              <div className="text-xl font-bold tabular-nums">
                {brl(totalDespesasFechamento)}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {contasParaCat.length} lançamento(s) no fechamento
              </span>
            </div>
            <div className="rounded-lg border bg-background/50 p-3">
              <span className="text-xs text-muted-foreground uppercase font-medium">
                Total Já Liquidado
              </span>
              <div className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {brl(totalPagoFechamento)}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {totalDespesasFechamento > 0
                  ? `${((totalPagoFechamento / totalDespesasFechamento) * 100).toFixed(1)}% liquidado`
                  : "0%"}
              </span>
            </div>
            <div className="rounded-lg border bg-background/50 p-3">
              <span className="text-xs text-muted-foreground uppercase font-medium">
                Pendente / Em Aberto
              </span>
              <div className="text-xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
                {brl(totalAbertoFechamento)}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {totalDespesasFechamento > 0
                  ? `${((totalAbertoFechamento / totalDespesasFechamento) * 100).toFixed(1)}% a liquidar`
                  : "0%"}
              </span>
            </div>
          </div>

          {categoriasDespesa.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma despesa encontrada para o período selecionado.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categoriasDespesa.map((c) => (
                <div key={c.categoria} className="rounded-lg border bg-card/50 p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold tracking-tight line-clamp-1">
                      {c.categoria}
                    </span>
                    <Badge variant="secondary" className="text-[11px] font-semibold tabular-nums shrink-0">
                      {c.percentual.toFixed(1)}% do mês
                    </Badge>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold tabular-nums">
                      {brl(c.total)}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {c.qtd} conta(s)
                    </span>
                  </div>
                  <Progress value={c.percentual} className="h-1.5" />
                  <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Pago: {brl(c.pago)}
                    </span>
                    <span className="text-amber-600 dark:text-amber-400">
                      Aberto: {brl(c.aberto)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={alertas.some((c) => c.dias <= 7) ? "border-destructive/50" : undefined}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" />
            Alertas de vencimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {resumoAlertas.map((r) => (
              <div key={r.titulo} className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">{r.titulo}</p>
                <p
                  className={
                    r.critico && r.valor > 0
                      ? "text-xl font-semibold text-destructive"
                      : "text-xl font-semibold"
                  }
                >
                  {brl(r.valor)}
                </p>
                <p className="text-xs text-muted-foreground">{r.qtd} título(s)</p>
              </div>
            ))}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Parceiro</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Risco</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alertas.map((c) => {
                const r = risco(c.dias);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.descricao}</TableCell>
                    <TableCell>{c.parceiro ?? "—"}</TableCell>
                    <TableCell className="capitalize">
                      {c.tipo === "pagar" ? "A pagar" : "A receber"}
                    </TableCell>
                    <TableCell className={c.dias <= 7 ? "text-destructive" : undefined}>
                      {new Date(`${c.vencimento}T00:00:00`).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">{brl(Number(c.valor))}</TableCell>
                    <TableCell>
                      <Badge variant={r.variant}>{r.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {alertas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Nenhuma conta vencendo nos próximos 30 dias.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pagar x Receber por mês</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {grafico.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Nenhum título lançado ainda.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grafico}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v: number) => brl(v)}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--popover-foreground)",
                  }}
                />
                <Legend />
                <Bar dataKey="Receber" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pagar" fill="var(--muted-foreground)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento mensal</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead className="text-right">Receber aberto</TableHead>
                <TableHead className="text-right">Receber vencido</TableHead>
                <TableHead className="text-right">Recebido</TableHead>
                <TableHead className="text-right">Pagar aberto</TableHead>
                <TableHead className="text-right">Pagar vencido</TableHead>
                <TableHead className="text-right">Pago</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map((l) => {
                const s =
                  l.receberAberto +
                  l.receberVencido -
                  (l.pagarAberto + l.pagarVencido);
                return (
                  <TableRow key={l.mes}>
                    <TableCell className="font-medium capitalize">{l.label}</TableCell>
                    <TableCell className="text-right">{brl(l.receberAberto)}</TableCell>
                    <TableCell className="text-right">
                      {l.receberVencido > 0 ? (
                        <Badge variant="destructive">{brl(l.receberVencido)}</Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right">{brl(l.receberPago)}</TableCell>
                    <TableCell className="text-right">{brl(l.pagarAberto)}</TableCell>
                    <TableCell className="text-right">
                      {l.pagarVencido > 0 ? (
                        <Badge variant="destructive">{brl(l.pagarVencido)}</Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right">{brl(l.pagarPago)}</TableCell>
                    <TableCell
                      className={
                        s < 0 ? "text-right font-medium text-destructive" : "text-right font-medium"
                      }
                    >
                      {brl(s)}
                    </TableCell>
                  </TableRow>
                );
              })}
              {linhas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    Nenhum título lançado.
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
