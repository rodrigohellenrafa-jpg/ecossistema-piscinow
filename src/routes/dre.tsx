import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Input } from "@/components/ui/input";
import { Field } from "@/components/field";
import { PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { brl, mesLabel, pct } from "@/lib/erp";

export const Route = createFileRoute("/dre")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "DRE | Piscinow ERP" },
      {
        name: "description",
        content: "Demonstrativo de resultado do exercício: faturamento, custos, despesas e lucro.",
      },
      { property: "og:title", content: "DRE | Piscinow ERP" },
      {
        property: "og:description",
        content: "Acompanhe faturamento, deduções, CMV, despesas e resultado líquido operacional.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Dre />
    </RequireAuth>
  ),
});

const anoAtual = new Date().getFullYear();
const anos = Array.from({ length: 5 }, (_, i) => String(anoAtual - i));
const meses = [
  "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12",
];

function Dre() {
  const [visao, setVisao] = useState<"mensal" | "anual" | "trimestral" | "personalizado">("mensal");
  const [trimestre, setTrimestre] = useState("1");
  const [inicio, setInicio] = useState(`${anoAtual}-01-01`);
  const [fim, setFim] = useState(`${anoAtual}-12-31`);
  const [ano, setAno] = useState(String(anoAtual));
  const [mes, setMes] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));

  const { data: vendas = [] } = useQuery({
    queryKey: ["vendas-dre"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendas")
        .select("id, data, valor_total, custo_total, valor_impostos, valor_frete, valor_mao_obra");
      if (error) throw error;
      return data;
    },
  });

  const { data: lancamentos = [] } = useQuery({
    queryKey: ["lancamentos-dre"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lancamentos_financeiros")
        .select("tipo_fluxo, categoria, valor, data_competencia, status");
      if (error) throw error;
      return data;
    },
  });

  const { data: contasPagas = [] } = useQuery({
    queryKey: ["contas-dre"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas")
        .select("id, categoria, valor, valor_juros, data_pagamento, vencimento, status")
        .eq("tipo", "pagar")
        .eq("status", "pago");
      if (error) throw error;
      return data;
    },
  });

  const { data: retencoes = [] } = useQuery({
    queryKey: ["retencoes-financeiras-dre"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venda_pagamentos")
        .select("retencao_financeira, data_pagamento, observacoes");
      if (error) throw error;
      return data;
    },
  });

  const { data: rateios = [] } = useQuery({
    queryKey: ["conta-rateios-dre"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conta_rateios")
        .select("conta_id, categoria, valor");
      if (error) throw error;
      return data as { conta_id: string; categoria: string; valor: number }[];
    },
  });

  const { data: funcionarios = [] } = useQuery({
    queryKey: ["funcionarios-dre"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funcionarios")
        .select("salario_base, ativo")
        .eq("ativo", true);
      if (error) throw error;
      return data;
    },
  });

  const noPeriodo = (iso: string) =>
    visao === "personalizado" ? iso >= inicio && iso <= fim :
    visao === "trimestral" ? iso.slice(0, 4) === ano && Math.ceil(Number(iso.slice(5, 7)) / 3) === Number(trimestre) :
    visao === "anual" ? iso.slice(0, 4) === ano : iso.slice(0, 7) === `${ano}-${mes}`;

  const linha = useMemo(() => {
    const vendasPeriodo = vendas.filter((v) => noPeriodo(v.data));
    const faturamentoBruto = vendasPeriodo.reduce((s, v) => s + Number(v.valor_total), 0);
    const impostos = vendasPeriodo.reduce((s, v) => s + Number(v.valor_impostos), 0);
    const faturamentoLiquido = faturamentoBruto - impostos;
    const cmv = vendasPeriodo.reduce(
      (s, v) => s + Number(v.custo_total) + Number(v.valor_frete) + Number(v.valor_mao_obra),
      0,
    );
    const lucroBruto = faturamentoLiquido - cmv;

    const despesasLancamentos = lancamentos
      .filter((l) => l.tipo_fluxo === "despesa" && noPeriodo(l.data_competencia))
      .reduce((s, l) => s + Number(l.valor), 0);

    // Contas a pagar quitadas: uma saída no caixa, mas quebradas por categoria no DRE.
    const porCategoria = new Map<string, number>();
    const somaCat = (cat: string, v: number) =>
      porCategoria.set(cat, (porCategoria.get(cat) ?? 0) + v);

    for (const c of contasPagas) {
      const ref = c.data_pagamento ?? c.vencimento;
      if (!ref || !noPeriodo(ref)) continue;
      const total = Number(c.valor ?? 0) + Number(c.valor_juros ?? 0);
      const linhas = rateios.filter((r) => r.conta_id === c.id);
      if (linhas.length > 0) {
        for (const l of linhas) somaCat(l.categoria, Number(l.valor) || 0);
        const resto = total - linhas.reduce((s, l) => s + (Number(l.valor) || 0), 0);
        if (Math.abs(resto) > 0.005) somaCat(c.categoria ?? "Sem categoria", resto);
      } else {
        somaCat(c.categoria ?? "Sem categoria", total);
      }
    }

    const despesasContas = [...porCategoria.values()].reduce((s, v) => s + v, 0);
    const retencoesPeriodo = retencoes.filter(
      (p) => p.data_pagamento && noPeriodo(p.data_pagamento),
    );
    const ehInadimplencia = (obs: string | null) => /inadimpl/i.test(obs ?? "");
    const inadimplencia = retencoesPeriodo
      .filter((p) => ehInadimplencia(p.observacoes))
      .reduce((s, p) => s + Number(p.retencao_financeira ?? 0), 0);
    const taxasMaquina = retencoesPeriodo
      .filter((p) => !ehInadimplencia(p.observacoes))
      .reduce((s, p) => s + Number(p.retencao_financeira ?? 0), 0);
    const taxasFinanceiras = taxasMaquina + inadimplencia;
    const despesasFixas = despesasLancamentos + despesasContas;
    const categorias = [...porCategoria.entries()]
      .map(([categoria, valor]) => ({ categoria, valor }))
      .sort((a, b) => b.valor - a.valor);


    const salarios = funcionarios.reduce((s, f) => s + Number(f.salario_base), 0);
    // Comissão estimada: 3% do faturamento bruto do período como proxy de comissões.
    const comissoesEstimadas = faturamentoBruto * 0.03;
    const mesesFolha = visao === "anual" ? 12 : visao === "trimestral" ? 3 : visao === "personalizado" ? Math.max(0, (Number(fim.slice(0, 4)) - Number(inicio.slice(0, 4))) * 12 + Number(fim.slice(5, 7)) - Number(inicio.slice(5, 7)) + 1) : 1;
    const folha = salarios * mesesFolha + comissoesEstimadas;

    const resultado = lucroBruto - despesasFixas - taxasFinanceiras - folha;

    const base = faturamentoBruto || 1;
    return {
      faturamentoBruto,
      impostos,
      faturamentoLiquido,
      cmv,
      lucroBruto,
      despesasFixas,
      taxasFinanceiras,
      taxasMaquina,
      inadimplencia,
      categorias,
      folha,
      resultado,
      base,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendas, lancamentos, contasPagas, rateios, retencoes, funcionarios, visao, ano, mes, trimestre, inicio, fim]);

  const evolucao = useMemo(() => {
    const porMes: Record<string, { faturamento: number; custo: number; despesa: number }> = {};
    for (const v of vendas) {
      if (v.data.slice(0, 4) !== ano) continue;
      const k = v.data.slice(0, 7);
      porMes[k] ??= { faturamento: 0, custo: 0, despesa: 0 };
      porMes[k].faturamento += Number(v.valor_total);
      porMes[k].custo += Number(v.custo_total) + Number(v.valor_frete) + Number(v.valor_mao_obra);
    }
    for (const l of lancamentos) {
      if (l.tipo_fluxo !== "despesa" || l.data_competencia.slice(0, 4) !== ano) continue;
      const k = l.data_competencia.slice(0, 7);
      porMes[k] ??= { faturamento: 0, custo: 0, despesa: 0 };
      porMes[k].despesa += Number(l.valor);
    }
    return Object.entries(porMes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => ({
        mes: mesLabel(`${k}-01`),
        resultado: v.faturamento - v.custo - v.despesa,
      }));
  }, [vendas, lancamentos, ano]);

  const linhas: Array<{ label: string; valor: number; sinal?: "+" | "-" | "="; destaque?: boolean }> = [
    { label: "(+) Faturamento Bruto", valor: linha.faturamentoBruto, sinal: "+" },
    { label: "(-) Deduções e Impostos", valor: -linha.impostos, sinal: "-" },
    { label: "(=) Faturamento Líquido", valor: linha.faturamentoLiquido, sinal: "=", destaque: true },
    { label: "(-) CMV e Custos de Obra", valor: -linha.cmv, sinal: "-" },
    { label: "(=) Lucro Bruto", valor: linha.lucroBruto, sinal: "=", destaque: true },
    { label: "(-) Despesas Fixas e Administrativas", valor: -linha.despesasFixas, sinal: "-" },
    { label: "   Taxas de máquina / financeira", valor: -linha.taxasMaquina, sinal: "-" },
    { label: "   Retenção por inadimplência (contratos antigos)", valor: -linha.inadimplencia, sinal: "-" },
    { label: "(-) Folha de Pagamento", valor: -linha.folha, sinal: "-" },
    { label: "(=) Resultado Líquido Operacional", valor: linha.resultado, sinal: "=", destaque: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="DRE — Demonstrativo de Resultado"
        subtitle="Faturamento, custos, despesas e resultado líquido operacional."
      />

      <Card>
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-3">
          <Field label="Visão">
            <Select value={visao} onValueChange={(v) => setVisao(v as typeof visao)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {visao === "trimestral" && <Field label="Trimestre"><Select value={trimestre} onValueChange={setTrimestre}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[1,2,3,4].map(t => <SelectItem key={t} value={String(t)}>{t}º trimestre</SelectItem>)}</SelectContent></Select></Field>}
          {visao === "personalizado" && <><Field label="De"><Input type="date" value={inicio} onChange={e => setInicio(e.target.value)} /></Field><Field label="Até"><Input type="date" min={inicio} value={fim} onChange={e => setFim(e.target.value)} /></Field></>}
          <Field label="Ano">
            <Select value={ano} onValueChange={setAno}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {anos.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {visao === "mensal" && (
            <Field label="Mês">
              <Select value={mes} onValueChange={setMes}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meses.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultado do período</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {linhas.map((l) => (
            <div key={l.label} className="flex items-center justify-between py-2.5">
              <span className={l.destaque ? "font-semibold" : "text-sm text-muted-foreground"}>
                {l.label}
              </span>
              <div className="flex items-center gap-4">
                <span
                  className={`tabular-nums ${l.destaque ? "font-semibold" : "text-sm"} ${
                    l.valor < 0 ? "text-destructive" : "text-foreground"
                  }`}
                >
                  {brl(l.valor)}
                </span>
                <span className="w-16 text-right text-xs text-muted-foreground tabular-nums">
                  {pct(linha.base ? l.valor / linha.base : 0)}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {linha.categorias.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Despesas por categoria (com rateio)</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {linha.categorias.map((c) => (
              <div key={c.categoria} className="flex items-center justify-between py-2.5">
                <span className="text-sm text-muted-foreground">{c.categoria}</span>
                <span className="text-sm tabular-nums">{brl(c.valor)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Evolução mensal do resultado — {ano}</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolucao}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickFormatter={(v: number) => `${v / 1000}k`}
              />
              <Tooltip
                formatter={(v: number) => brl(v)}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  color: "var(--popover-foreground)",
                }}
              />
              <Line type="monotone" dataKey="resultado" name="Resultado" stroke="var(--chart-2)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
