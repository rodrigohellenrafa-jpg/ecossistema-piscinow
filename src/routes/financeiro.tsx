import { createFileRoute } from "@tanstack/react-router";
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { brl, fluxoMensal, vendas } from "@/lib/mock-data";

export const Route = createFileRoute("/financeiro")({
  head: () => ({
    meta: [
      { title: "Fluxo de Caixa | Piscinow ERP" },
      {
        name: "description",
        content: "Receitas, despesas e contas a receber da Piscinow mês a mês.",
      },
      { property: "og:title", content: "Fluxo de Caixa | Piscinow ERP" },
      {
        property: "og:description",
        content: "Acompanhe receitas, despesas e inadimplência do negócio.",
      },
    ],
  }),
  component: Financeiro,
});

function Financeiro() {
  const receita = fluxoMensal.reduce((s, m) => s + m.receita, 0);
  const despesa = fluxoMensal.reduce((s, m) => s + m.despesa, 0);
  const aReceber = vendas
    .filter((v) => v.statusPagamento !== "Pago")
    .reduce((s, v) => s + v.totalLiquido, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Fluxo de Caixa</h1>
        <p className="text-sm text-muted-foreground">Resultado consolidado dos últimos 6 meses.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Receita total" value={brl(receita)} tone="text-success" />
        <Kpi label="Despesa total" value={brl(despesa)} tone="text-destructive" />
        <Kpi label="Resultado" value={brl(receita - despesa)} tone="text-primary" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receitas x Despesas</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fluxoMensal}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="mes" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickFormatter={(v: number) => `${v / 1000}k`}
              />
              <Tooltip
                formatter={(v: number) => brl(v)}
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  color: "var(--color-popover-foreground)",
                }}
              />
              <Legend />
              <Bar dataKey="receita" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="despesa" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contas a receber — {brl(aReceber)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {vendas
            .filter((v) => v.statusPagamento !== "Pago")
            .map((v) => (
              <div
                key={v.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium">{v.cliente}</p>
                  <p className="text-xs text-muted-foreground">
                    {v.id} · {v.formaPagamento}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{brl(v.totalLiquido)}</span>
                  <Badge
                    variant={v.statusPagamento === "Atrasado" ? "destructive" : "secondary"}
                  >
                    {v.statusPagamento}
                  </Badge>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-semibold tracking-tight ${tone}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
