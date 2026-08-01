import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, TrendingUp, Waves, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  brl,
  fluxoMensal,
  ordensServico,
  produtos,
  vendas,
} from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | Piscinow ERP" },
      {
        name: "description",
        content:
          "Painel de vendas, serviços ativos, fluxo de caixa e alertas de estoque da Piscinow.",
      },
      { property: "og:title", content: "Dashboard | Piscinow ERP" },
      {
        property: "og:description",
        content: "Visão geral de vendas, logística e financeiro da Piscinow.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const totalMes = vendas.reduce((s, v) => s + v.totalLiquido, 0);
  const ativos = ordensServico.filter((o) => o.status !== "Concluído").length;
  const saldo =
    fluxoMensal.reduce((s, m) => s + m.receita - m.despesa, 0);
  const alertas = produtos.filter((p) => p.estoqueAtual < p.estoqueMinimo);

  const kpis = [
    { label: "Vendas do mês", value: brl(totalMes), icon: TrendingUp, hint: `${vendas.length} pedidos` },
    { label: "Serviços ativos", value: String(ativos), icon: Waves, hint: "Flight Board" },
    { label: "Saldo em caixa", value: brl(saldo), icon: Wallet, hint: "Acumulado 6 meses" },
    { label: "Alertas de estoque", value: String(alertas.length), icon: AlertTriangle, hint: "Abaixo do mínimo" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Menu Principal</h1>
        <p className="text-sm text-muted-foreground">
          Visão consolidada de vendas, obras e financeiro.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
              <kpi.icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fluxo de caixa</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fluxoMensal}>
                <defs>
                  <linearGradient id="rec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="des" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area type="monotone" dataKey="receita" stroke="var(--color-chart-1)" fill="url(#rec)" strokeWidth={2} />
                <Area type="monotone" dataKey="despesa" stroke="var(--color-chart-3)" fill="url(#des)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas de estoque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertas.length === 0 && (
              <p className="text-sm text-muted-foreground">Tudo em ordem por aqui.</p>
            )}
            {alertas.map((p) => (
              <div key={p.sku} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.descricao}</p>
                  <p className="text-xs text-muted-foreground">{p.sku}</p>
                </div>
                <Badge variant="destructive">
                  {p.estoqueAtual}/{p.estoqueMinimo}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos pedidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {vendas.map((v) => (
            <div
              key={v.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 last:border-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium">{v.cliente}</p>
                <p className="text-xs text-muted-foreground">
                  {v.id} · {v.vendedor}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{brl(v.totalLiquido)}</span>
                <Badge
                  variant={
                    v.statusPagamento === "Pago"
                      ? "default"
                      : v.statusPagamento === "Atrasado"
                        ? "destructive"
                        : "secondary"
                  }
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
