import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { sincronizarNotas } from "@/lib/focus-nfe.functions";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
  ShoppingCart,
  TrendingUp,
  Wallet,
  Waves,
} from "lucide-react";

import { PageHeader, Kpi } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR, diasAte, ETAPAS_OBRA, margem, mesLabel, pct } from "@/lib/erp";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Painel Executivo | Piscinow ERP" },
      {
        name: "description",
        content:
          "Visão executiva da Piscinow: faturamento, margem das obras, flight board, fluxo de caixa e alertas de estoque em tempo real.",
      },
      { property: "og:title", content: "Painel Executivo | Piscinow ERP" },
      {
        property: "og:description",
        content:
          "Indicadores de vendas, obras em campo, financeiro e reposição de estoque do ERP Piscinow.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  ),
});

const inicioMes = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
};

function Dashboard() {
  const qc = useQueryClient();
  const sincronizarFn = useServerFn(sincronizarNotas);

  // Sincroniza o status das notas na Focus NFe ao abrir o painel.
  useEffect(() => {
    let ativo = true;
    sincronizarFn()
      .then((r) => {
        if (ativo && r.ativo && r.atualizadas > 0) {
          qc.invalidateQueries({ queryKey: ["dash-notas"] });
          qc.invalidateQueries({ queryKey: ["notas_fiscais"] });
        }
      })
      .catch(() => undefined);
    return () => {
      ativo = false;
    };
  }, [sincronizarFn, qc]);


  const { data: vendas = [] } = useQuery({
    queryKey: ["dash-vendas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendas")
        .select("*")
        .order("data", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as Record<string, unknown>[];
    },
  });

  const { data: obras = [] } = useQuery({
    queryKey: ["dash-obras"],
    queryFn: async () => {
      const { data, error } = await supabase.from("obras").select("*").limit(200);
      if (error) throw error;
      return data as Record<string, unknown>[];
    },
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ["dash-produtos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("produtos").select("*").limit(500);
      if (error) throw error;
      return data as Record<string, unknown>[];
    },
  });

  const { data: lancamentos = [] } = useQuery({
    queryKey: ["dash-lancamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lancamentos_financeiros")
        .select("*")
        .limit(1000);
      if (error) throw error;
      return data as Record<string, unknown>[];
    },
  });

  const { data: notasFiscais = [] } = useQuery({
    queryKey: ["dash-notas-fiscais"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notas_fiscais")
        .select("*")
        .order("data_emissao", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as Record<string, unknown>[];
    },
  });

  // Saldos das contas bancárias: pega o registro mais recente de cada conta
  // e atualiza em tempo real quando qualquer saldo muda.
  const { data: saldosContas = [] } = useQuery({
    queryKey: ["dash-saldos-bancarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saldos_bancarios")
        .select("id, conta, banco, saldo, data_saldo")
        .order("data_saldo", { ascending: false });
      if (error) throw error;
      const porConta = new Map<string, { conta: string; banco: string | null; saldo: number }>();
      for (const r of (data ?? []) as {
        conta: string;
        banco: string | null;
        saldo: number | string;
      }[]) {
        if (!porConta.has(r.conta)) {
          porConta.set(r.conta, { conta: r.conta, banco: r.banco, saldo: Number(r.saldo) });
        }
      }
      return [...porConta.values()];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("dash-saldos-bancarios")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "saldos_bancarios" },
        () => {
          qc.invalidateQueries({ queryKey: ["dash-saldos-bancarios"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const saldoTotalContas = saldosContas.reduce((a, c) => a + c.saldo, 0);

  const { data: notasCompra = [] } = useQuery({
    queryKey: ["dash-notas-compra"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notas_compra")
        .select("*")
        .order("data_entrada", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as Record<string, unknown>[];
    },
  });

  // Movimentações do dia: quantas ações foram registradas hoje em cada módulo.
  const { data: atividadeHoje = [] } = useQuery({
    queryKey: ["dash-atividade-hoje"],
    refetchInterval: 60000,
    queryFn: async () => {
      const inicioDia = new Date();
      inicioDia.setHours(0, 0, 0, 0);
      const desde = inicioDia.toISOString();
      const alvos = [
        { tabela: "vendas", rotulo: "Vendas" },
        { tabela: "ordens_servico", rotulo: "Ordens de serviço" },
        { tabela: "obras", rotulo: "Obras" },
        { tabela: "ordens_compra", rotulo: "Ordens de compra" },
        { tabela: "notas_compra", rotulo: "Notas de compra" },
        { tabela: "notas_fiscais", rotulo: "Notas fiscais" },
        { tabela: "estoque_movimentos", rotulo: "Movimentos de estoque" },
        { tabela: "contas", rotulo: "Contas a pagar/receber" },
        { tabela: "lancamentos_financeiros", rotulo: "Lançamentos financeiros" },
        { tabela: "venda_pagamentos", rotulo: "Pagamentos recebidos" },
        { tabela: "clientes", rotulo: "Clientes cadastrados" },
        { tabela: "produtos", rotulo: "Produtos cadastrados" },
        { tabela: "fornecedores", rotulo: "Fornecedores cadastrados" },
        { tabela: "agenda_eventos", rotulo: "Compromissos da agenda" },
      ] as const;
      const linhas = await Promise.all(
        alvos.map(async (a) => {
          const { count, error } = await supabase
            .from(a.tabela)
            .select("id", { count: "exact", head: true })
            .gte("created_at", desde);
          if (error) return { rotulo: a.rotulo, total: 0 };
          return { rotulo: a.rotulo, total: count ?? 0 };
        }),
      );
      return linhas;
    },
  });

  const totalAcoesHoje = atividadeHoje.reduce((a, l) => a + l.total, 0);
  const atividadeOrdenada = [...atividadeHoje].sort((a, b) => b.total - a.total);

  const ini = inicioMes();
  const n = (v: unknown) => Number(v ?? 0);
  const s = (v: unknown) => String(v ?? "");

  const vendasMes = vendas.filter((v) => s(v["data"]) >= ini);
  const faturamentoMes = vendasMes.reduce((a, v) => a + n(v["valor_total"]), 0);
  const custoMes = vendasMes.reduce((a, v) => a + n(v["custo_total"]), 0);
  const margemMedia = margem(faturamentoMes, custoMes);
  const ticket = vendasMes.length ? faturamentoMes / vendasMes.length : 0;

  const obrasAtivas = obras.filter((o) => s(o["status_geral"]) !== "Concluído");
  const atrasadas = obrasAtivas.filter((o) => {
    const d = diasAte(s(o["data_limite"]) || null);
    return d !== null && d < 0;
  });

  const receitas = lancamentos.filter((l) => s(l["tipo_fluxo"]) === "receita");
  const despesas = lancamentos.filter((l) => s(l["tipo_fluxo"]) === "despesa");
  const saldo =
    receitas.reduce((a, l) => a + n(l["valor"]), 0) -
    despesas.reduce((a, l) => a + n(l["valor"]), 0);

  // Margem líquida do mês: faturamento - custo das vendas - despesas do mês.
  const despesasMes = despesas
    .filter((l) => s(l["data_competencia"]) >= ini)
    .reduce((a, l) => a + n(l["valor"]), 0);
  const lucroLiquidoMes = faturamentoMes - custoMes - despesasMes;
  const margemLiquida = faturamentoMes > 0 ? lucroLiquidoMes / faturamentoMes : 0;

  const nfMes = notasFiscais.filter((f) => s(f["data_emissao"]) >= ini);
  const nfAutorizadas = nfMes.filter((f) => s(f["status"]) === "autorizada");
  const nfValor = nfAutorizadas.reduce((a, f) => a + n(f["valor_total"]), 0);
  const nfPendentes = nfMes.filter((f) =>
    ["rascunho", "processando", "rejeitada"].includes(s(f["status"])),
  );
  const ncMes = notasCompra.filter((f) => s(f["data_entrada"]) >= ini);
  const ncValor = ncMes.reduce((a, f) => a + n(f["valor_total"]), 0);

  const criticos = produtos.filter(
    (p) => n(p["estoque_atual"]) <= n(p["estoque_minimo"]) && s(p["tipo"]) !== "servico",
  );


  // Série mensal (últimos 6 meses) de faturamento x custo.
  const serie = (() => {
    const mapa = new Map<string, { mes: string; faturamento: number; custo: number }>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      mapa.set(key, { mes: mesLabel(`${key}-01`), faturamento: 0, custo: 0 });
    }
    for (const v of vendas) {
      const key = s(v["data"]).slice(0, 7);
      const item = mapa.get(key);
      if (item) {
        item.faturamento += n(v["valor_total"]);
        item.custo += n(v["custo_total"]);
      }
    }
    return [...mapa.values()];
  })();

  const funil = (() => {
    const cont = new Map<string, number>();
    for (const o of obras) {
      const k = s(o["status_geral"]) || "Agendado";
      cont.set(k, (cont.get(k) ?? 0) + 1);
    }
    return [...cont.entries()].map(([name, value]) => ({ name, value }));
  })();

  const coresPizza = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  const progressoObra = (o: Record<string, unknown>) =>
    (ETAPAS_OBRA.filter((e) => s(o[e.key]) === "concluido").length / ETAPAS_OBRA.length) * 100;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel Executivo"
        subtitle="Piscinow — venda, fabricação, obra e financeiro em um só lugar."
        actions={
          <>
            <Button asChild>
              <Link to="/vendas/novo">
                <ShoppingCart /> Novo pedido
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/logistica">
                <ClipboardCheck /> Flight Board
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Faturamento do mês"
          value={brl(faturamentoMes)}
          hint={`${vendasMes.length} pedidos · ticket ${brl(ticket)}`}
          tone="positive"
          to="/vendas"
        />
        <Kpi
          label="Margem bruta média"
          value={pct(margemMedia)}
          hint={`Custo de obra ${brl(custoMes)}`}
          tone={margemMedia >= 0.25 ? "positive" : margemMedia >= 0.1 ? "warning" : "negative"}
          to="/dre"
        />
        <Kpi
          label="Obras em campo"
          value={String(obrasAtivas.length)}
          hint={`${atrasadas.length} fora do prazo`}
          tone={atrasadas.length ? "negative" : "default"}
          to="/logistica"
        />
        <Kpi
          label="Saldo financeiro"
          value={brl(saldo)}
          hint="Receitas menos despesas lançadas"
          tone={saldo >= 0 ? "positive" : "negative"}
          to="/fluxo-caixa"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Margem líquida do mês"
          value={pct(margemLiquida)}
          hint={`Lucro ${brl(lucroLiquidoMes)} · despesas ${brl(despesasMes)}`}
          tone={margemLiquida >= 0.15 ? "positive" : margemLiquida >= 0 ? "warning" : "negative"}
          to="/dre"
        />
        <Kpi
          label="Notas emitidas no mês"
          value={String(nfAutorizadas.length)}
          hint={`${nfPendentes.length} pendentes de transmissão`}
          tone={nfPendentes.length ? "warning" : "positive"}
          to="/fiscal"
        />
        <Kpi
          label="Valor autorizado (NF-e/NFS-e)"
          value={brl(nfValor)}
          hint="Somatório das notas autorizadas no mês"
          to="/fiscal"
        />
        <Kpi
          label="Notas recebidas no mês"
          value={String(ncMes.length)}
          hint={`${brl(ncValor)} em compras lançadas`}
          to="/notas-compra"
        />
      </div>


      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardCheck className="size-4 text-primary" /> Movimentações de hoje
          </CardTitle>
          <Badge variant="secondary">{totalAcoesHoje} ações</Badge>
        </CardHeader>
        <CardContent>
          {totalAcoesHoje === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma movimentação registrada hoje ainda.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {atividadeOrdenada
                .filter((l) => l.total > 0)
                .map((l) => (
                  <div
                    key={l.rotulo}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span className="truncate text-muted-foreground">{l.rotulo}</span>
                    <span className="shrink-0 tabular-nums font-semibold">{l.total}</span>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-primary" /> Faturamento x custo (6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={serie}>
                <defs>
                  <linearGradient id="gFat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} width={80} />
                <Tooltip
                  formatter={(v: number) => brl(v)}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--popover-foreground)",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="faturamento"
                  name="Faturamento"
                  stroke="var(--chart-1)"
                  fill="url(#gFat)"
                />
                <Area
                  type="monotone"
                  dataKey="custo"
                  name="Custo"
                  stroke="var(--chart-3)"
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Waves className="size-4 text-primary" /> Obras por status
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {funil.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                Nenhuma obra cadastrada ainda.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={funil} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                    {funil.map((_, i) => (
                      <Cell key={i} fill={coresPizza[i % coresPizza.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      color: "var(--popover-foreground)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Obras em execução</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link to="/logistica">
                Ver board <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {obrasAtivas.slice(0, 5).map((o) => {
              const d = diasAte(s(o["data_limite"]) || null);
              return (
                <div key={String(o["id"])} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">
                      {s(o["numero"]) || "Obra"} · {s(o["cliente_nome"]) || "Cliente"}
                    </p>
                    <Badge variant={d !== null && d < 0 ? "destructive" : "secondary"}>
                      {d === null ? "sem prazo" : d < 0 ? `${Math.abs(d)}d atrasada` : `${d}d`}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {s(o["tipo_servico"])} · limite {dataBR(s(o["data_limite"]) || null)}
                  </p>
                  <Progress className="mt-2 h-1.5" value={progressoObra(o)} />
                </div>
              );
            })}
            {obrasAtivas.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma obra ativa. Crie uma no Flight Board.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-warning" /> Reposição de estoque
            </CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link to="/compras">
                Central de compras <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {criticos.slice(0, 7).map((p) => (
              <div
                key={String(p["id"])}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span className="truncate">{s(p["nome"])}</span>
                <span className="shrink-0 tabular-nums text-destructive">
                  {n(p["estoque_atual"])} / mín {n(p["estoque_minimo"])}
                </span>
              </div>
            ))}
            {criticos.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Estoque saudável — nenhum item abaixo do mínimo.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="size-4 text-primary" /> Últimos pedidos
          </CardTitle>
          <Button asChild size="sm" variant="ghost">
            <Link to="/vendas">
              Histórico <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {vendas.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum pedido lançado. Comece pelo PDV.
            </p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendas.slice(0, 8).reverse().map((v) => ({
                  nome: s(v["numero"]) || s(v["cliente_nome"]).slice(0, 10),
                  total: n(v["valor_total"]),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="nome" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} width={80} />
                  <Tooltip
                    formatter={(v: number) => brl(v)}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Bar dataKey="total" name="Total" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
