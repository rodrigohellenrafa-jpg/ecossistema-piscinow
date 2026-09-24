import { useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowDownCircle,
  ArrowRight,
  ArrowUpCircle,
  CalendarDays,
  Landmark,
  Scale,
  Waves,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { sincronizarNotas } from "@/lib/focus-nfe.functions";
import { brl } from "@/lib/erp";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Painel Executivo | Piscinow ERP" },
      {
        name: "description",
        content: "Agenda, saldo, vencimentos e ponto de equilíbrio da Piscinow em uma visão diária.",
      },
      { property: "og:title", content: "Painel Executivo | Piscinow ERP" },
      {
        property: "og:description",
        content: "Acompanhe a semana, o caixa, as contas do dia e o ponto de equilíbrio mensal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  ),
});

const numero = (valor: unknown) => Number(valor ?? 0);
const texto = (valor: unknown) => String(valor ?? "");
const dataLocal = (data: Date) =>
  `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;

function intervaloAtual() {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - hoje.getDay());
  const fim = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + 6);
  return { inicio: dataLocal(inicio), fim: dataLocal(fim) };
}

type AgendaItem = {
  id: string;
  data: string;
  titulo: string;
  detalhe: string;
  obra: boolean;
};

function AcessoCard({ to, children }: { to: "/agenda" | "/fluxo-caixa" | "/contas" | "/dre"; children: string }) {
  return (
    <Button asChild size="sm" variant="ghost">
      <Link to={to} search={to === "/contas" ? { periodo: "hoje", tipo: undefined } : undefined}>
        {children} <ArrowRight />
      </Link>
    </Button>
  );
}

function Dashboard() {
  const qc = useQueryClient();
  const sincronizarFn = useServerFn(sincronizarNotas);
  const hoje = dataLocal(new Date());
  const ontemData = new Date();
  ontemData.setDate(ontemData.getDate() - 1);
  const ontem = dataLocal(ontemData);
  const mes = hoje.slice(0, 7);
  const semana = intervaloAtual();

  useEffect(() => {
    sincronizarFn()
      .then((resultado) => {
        if (resultado.ativo && resultado.atualizadas > 0) {
          qc.invalidateQueries({ queryKey: ["notas_fiscais"] });
        }
      })
      .catch(() => undefined);
  }, [qc, sincronizarFn]);

  const { data: eventos = [] } = useQuery({
    queryKey: ["dashboard-agenda", semana.inicio, semana.fim],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agenda_eventos")
        .select("id, titulo, inicio, cliente_nome, responsavel_nome, obra_id")
        .neq("status", "cancelado")
        .gte("inicio", `${semana.inicio}T00:00:00`)
        .lte("inicio", `${semana.fim}T23:59:59`)
        .order("inicio");
      if (error) throw error;
      return data;
    },
  });

  const { data: ordens = [] } = useQuery({
    queryKey: ["dashboard-ordens-semana", semana.inicio, semana.fim],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordens_servico")
        .select("id, numero, tipo_servico, cliente_nome, data_agendada, responsavel")
        .gte("data_agendada", semana.inicio)
        .lte("data_agendada", semana.fim)
        .order("data_agendada");
      if (error) throw error;
      return data;
    },
  });

  const { data: obras = [] } = useQuery({
    queryKey: ["dashboard-obras-semana"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("obras")
        .select("id, numero, cliente_nome, tipo_servico, responsavel, data_limite, escavacao_inicio, escavacao_fim, instalacao_inicio, instalacao_fim")
        .eq("selecionada", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: saldosContas = [] } = useQuery({
    queryKey: ["saldos-bancarios", "dashboard-principal"],
    refetchInterval: 5000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saldos_bancarios")
        .select("conta, banco, saldo, data_saldo")
        .order("data_saldo", { ascending: false });
      if (error) throw error;
      const unicas = new Map<string, { conta: string; banco: string | null; saldo: number }>();
      for (const item of data ?? []) {
        if (!unicas.has(item.conta)) {
          unicas.set(item.conta, { conta: item.conta, banco: item.banco, saldo: numero(item.saldo) });
        }
      }
      return [...unicas.values()];
    },
  });

  const { data: contas = [] } = useQuery({
    queryKey: ["dashboard-contas-principal"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas")
        .select("id, tipo, descricao, parceiro, valor, valor_pago, status, vencimento, data_pagamento");
      if (error) throw error;
      return data;
    },
  });

  const { data: lancamentos = [] } = useQuery({
    queryKey: ["dashboard-lancamentos-principal"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lancamentos_financeiros")
        .select("id, tipo_fluxo, categoria, descricao, valor, status, data_competencia, data_pagamento");
      if (error) throw error;
      return data;
    },
  });

  const { data: vendas = [] } = useQuery({
    queryKey: ["dashboard-equilibrio-vendas", mes],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendas")
        .select("data, valor_total, custo_total, valor_impostos, valor_frete, valor_mao_obra")
        .gte("data", `${mes}-01`);
      if (error) throw error;
      return data;
    },
  });

  const { data: contasPagas = [] } = useQuery({
    queryKey: ["dashboard-equilibrio-contas", mes],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas")
        .select("valor, valor_juros, data_pagamento")
        .eq("tipo", "pagar")
        .eq("status", "pago")
        .gte("data_pagamento", `${mes}-01`);
      if (error) throw error;
      return data;
    },
  });

  const { data: retencoes = [] } = useQuery({
    queryKey: ["dashboard-equilibrio-retencoes", mes],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venda_pagamentos")
        .select("retencao_financeira, data_pagamento")
        .gte("data_pagamento", `${mes}-01`);
      if (error) throw error;
      return data;
    },
  });

  const { data: funcionarios = [] } = useQuery({
    queryKey: ["dashboard-equilibrio-folha"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funcionarios")
        .select("salario_base")
        .eq("ativo", true);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const canal = supabase
      .channel("dashboard-principal-saldos")
      .on("postgres_changes", { event: "*", schema: "public", table: "saldos_bancarios" }, () => {
        qc.invalidateQueries({ queryKey: ["saldos-bancarios"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, [qc]);

  const agendaSemana = useMemo<AgendaItem[]>(() => {
    const itens: AgendaItem[] = eventos.map((evento) => ({
      id: `evento-${evento.id}`,
      data: texto(evento.inicio).slice(0, 10),
      titulo: evento.titulo,
      detalhe: [evento.cliente_nome, evento.responsavel_nome].filter(Boolean).join(" · "),
      obra: Boolean(evento.obra_id),
    }));
    for (const ordem of ordens) {
      itens.push({
        id: `ordem-${ordem.id}`,
        data: texto(ordem.data_agendada).slice(0, 10),
        titulo: `OS ${ordem.numero ?? ""} · ${ordem.tipo_servico}`,
        detalhe: [ordem.cliente_nome, ordem.responsavel].filter(Boolean).join(" · "),
        obra: false,
      });
    }
    const etapas = [
      ["escavacao_inicio", "Início da escavação"],
      ["escavacao_fim", "Término da escavação"],
      ["instalacao_inicio", "Início da instalação"],
      ["instalacao_fim", "Término da instalação"],
      ["data_limite", "Prazo da obra"],
    ] as const;
    for (const obra of obras) {
      for (const [campo, rotulo] of etapas) {
        const data = texto(obra[campo]).slice(0, 10);
        if (!data || data < semana.inicio || data > semana.fim) continue;
        itens.push({
          id: `obra-${obra.id}-${campo}`,
          data,
          titulo: `${obra.numero ?? "Obra"} · ${rotulo}`,
          detalhe: [obra.cliente_nome, obra.tipo_servico, obra.responsavel].filter(Boolean).join(" · "),
          obra: true,
        });
      }
    }
    return itens.sort((a, b) => a.data.localeCompare(b.data));
  }, [eventos, obras, ordens, semana.fim, semana.inicio]);

  const obrasHoje = agendaSemana.filter((item) => item.data === hoje && item.obra);
  const contasHoje = contas.filter((conta) => conta.vencimento === hoje);
  const pagarHoje = contasHoje.filter((conta) => conta.tipo === "pagar");
  const receberHoje = contasHoje.filter((conta) => conta.tipo === "receber");
  const totalPagarHoje = pagarHoje.reduce((soma, conta) => soma + numero(conta.valor), 0);
  const totalReceberHoje = receberHoje.reduce((soma, conta) => soma + numero(conta.valor), 0);

  const fluxoOntem = useMemo(() => {
    let entradas = 0;
    let saidas = 0;
    for (const conta of contas) {
      if (conta.status !== "pago" || texto(conta.data_pagamento).slice(0, 10) !== ontem) continue;
      const valor = numero(conta.valor_pago) || numero(conta.valor);
      if (conta.tipo === "receber") entradas += valor;
      else saidas += valor;
    }
    for (const lancamento of lancamentos) {
      if (lancamento.status !== "Pago" || texto(lancamento.data_pagamento).slice(0, 10) !== ontem) continue;
      if (lancamento.tipo_fluxo === "receita") entradas += numero(lancamento.valor);
      else saidas += numero(lancamento.valor);
    }
    return { entradas, saidas, resultado: entradas - saidas };
  }, [contas, lancamentos, ontem]);

  const saldoTotal = saldosContas.reduce((soma, conta) => soma + conta.saldo, 0);
  const faturamento = vendas.reduce((soma, venda) => soma + numero(venda.valor_total), 0);
  const custosVariaveis = vendas.reduce(
    (soma, venda) =>
      soma + numero(venda.custo_total) + numero(venda.valor_impostos) + numero(venda.valor_frete) + numero(venda.valor_mao_obra),
    0,
  );
  const despesasLancadas = lancamentos
    .filter((item) => item.tipo_fluxo === "despesa" && texto(item.data_competencia).startsWith(mes))
    .reduce((soma, item) => soma + numero(item.valor), 0);
  const despesasPagas = contasPagas.reduce(
    (soma, conta) => soma + numero(conta.valor) + numero(conta.valor_juros),
    0,
  );
  const folha = funcionarios.reduce((soma, funcionario) => soma + numero(funcionario.salario_base), 0);
  const taxas = retencoes.reduce((soma, item) => soma + numero(item.retencao_financeira), 0);
  const despesasFixas = despesasLancadas + despesasPagas + folha + taxas;
  const margemContribuicao = faturamento > 0 ? Math.max(0, (faturamento - custosVariaveis) / faturamento) : 0;
  const pontoEquilibrio = margemContribuicao > 0 ? despesasFixas / margemContribuicao : 0;
  const percentualEquilibrio = pontoEquilibrio > 0 ? Math.min(100, (faturamento / pontoEquilibrio) * 100) : 0;
  const dadosEquilibrio = [
    { nome: "Mês atual", faturamento, equilibrio: pontoEquilibrio },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visão do dia"
        subtitle={`${new Date(`${hoje}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })} · agenda, caixa e compromissos financeiros.`}
      />

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <Card className="min-w-0 overflow-hidden xl:min-h-[31rem]">
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="size-4 text-primary" /> Agenda da semana
            </CardTitle>
            <AcessoCard to="/agenda">Abrir agenda</AcessoCard>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-medium">Obras de hoje</p>
                <Badge>{obrasHoje.length}</Badge>
              </div>
              {obrasHoje.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma etapa de obra programada para hoje.</p>
              ) : (
                <div className="space-y-2">
                  {obrasHoje.map((item) => (
                    <div key={item.id} className="border-l-2 border-primary pl-3 text-sm">
                      <p className="font-medium">{item.titulo}</p>
                      <p className="text-xs text-muted-foreground">{item.detalhe || "Sem detalhes"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              {agendaSemana.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">Nenhum compromisso nesta semana.</p>
              ) : (
                agendaSemana.slice(0, 8).map((item) => (
                  <div key={item.id} className="flex gap-3 border-b border-border py-2 last:border-0">
                    <div className="w-16 shrink-0 text-xs font-medium text-muted-foreground">
                      {new Date(`${item.data}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" })}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.titulo}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.detalhe || "Sem detalhes"}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden xl:min-h-[31rem]">
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Landmark className="size-4 text-primary" /> Saldo e fluxo de ontem
            </CardTitle>
            <AcessoCard to="/fluxo-caixa">Ver fluxo</AcessoCard>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Saldo atual nas contas</p>
              <p className={`mt-1 text-3xl font-semibold tabular-nums ${saldoTotal < 0 ? "text-destructive" : "text-success"}`}>
                {brl(saldoTotal)}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <ResumoValor label="Entradas ontem" valor={fluxoOntem.entradas} positivo />
              <ResumoValor label="Saídas ontem" valor={fluxoOntem.saidas} />
              <ResumoValor label="Resultado ontem" valor={fluxoOntem.resultado} positivo={fluxoOntem.resultado >= 0} />
            </div>
            <div className="space-y-2">
              {saldosContas.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma conta bancária cadastrada.</p>
              ) : (
                saldosContas.map((conta) => (
                  <div key={conta.conta} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{conta.conta}</p>
                      <p className="truncate text-xs text-muted-foreground">{conta.banco || "Conta bancária"}</p>
                    </div>
                    <span className={`shrink-0 font-semibold tabular-nums ${conta.saldo < 0 ? "text-destructive" : "text-success"}`}>
                      {brl(conta.saldo)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden xl:min-h-[29rem]">
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Waves className="size-4 text-primary" /> Contas com vencimento hoje
            </CardTitle>
            <AcessoCard to="/contas">Abrir contas</AcessoCard>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border p-3">
                <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <ArrowDownCircle className="size-4 text-destructive" /> A pagar
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-destructive">{brl(totalPagarHoje)}</p>
                <p className="text-xs text-muted-foreground">{pagarHoje.length} título(s)</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <ArrowUpCircle className="size-4 text-success" /> A receber
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-success">{brl(totalReceberHoje)}</p>
                <p className="text-xs text-muted-foreground">{receberHoje.length} título(s)</p>
              </div>
            </div>
            {contasHoje.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">Nenhuma conta vence hoje.</p>
            ) : (
              <div className="space-y-2">
                {contasHoje.slice(0, 7).map((conta) => (
                  <div key={conta.id} className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{conta.descricao}</p>
                      <p className="truncate text-xs text-muted-foreground">{conta.parceiro || "Sem beneficiário"} · {conta.status}</p>
                    </div>
                    <span className={`shrink-0 font-medium tabular-nums ${conta.tipo === "receber" ? "text-success" : "text-destructive"}`}>
                      {conta.tipo === "receber" ? "+" : "−"} {brl(numero(conta.valor))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden xl:min-h-[29rem]">
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Scale className="size-4 text-primary" /> Ponto de equilíbrio do mês
            </CardTitle>
            <AcessoCard to="/dre">Abrir DRE</AcessoCard>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Faturamento</p>
                <p className="font-semibold tabular-nums text-success">{brl(faturamento)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Necessário para empatar</p>
                <p className="font-semibold tabular-nums">{brl(pontoEquilibrio)}</p>
              </div>
            </div>
            <div className="h-64">
              {faturamento === 0 && pontoEquilibrio === 0 ? (
                <p className="py-20 text-center text-sm text-muted-foreground">Ainda não há dados suficientes neste mês.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosEquilibrio} margin={{ top: 16, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="nome" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} width={78} tickFormatter={(v) => `${Math.round(Number(v) / 1000)} mil`} />
                    <Tooltip formatter={(v: number) => brl(Number(v))} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                    <Legend />
                    <ReferenceLine y={pontoEquilibrio} stroke="var(--destructive)" strokeDasharray="4 4" />
                    <Bar dataKey="faturamento" name="Faturamento" fill="var(--success)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="equilibrio" name="Ponto de equilíbrio" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Progresso até o equilíbrio</span>
              <strong className={faturamento >= pontoEquilibrio && pontoEquilibrio > 0 ? "text-success" : "text-warning"}>
                {percentualEquilibrio.toFixed(1)}%
              </strong>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ResumoValor({ label, valor, positivo = false }: { label: string; valor: number; positivo?: boolean }) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm font-semibold tabular-nums ${positivo ? "text-success" : "text-destructive"}`}>
        {brl(valor)}
      </p>
    </div>
  );
}