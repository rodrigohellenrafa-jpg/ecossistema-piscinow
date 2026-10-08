import { TelaPermitida } from "@/components/tela-permitida";
import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownCircle, ArrowUpCircle, Plus } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ConciliacaoBancaria } from "@/components/conciliacao-bancaria";
import { FluxoColunas } from "@/components/fluxo-colunas";
import { Kpi, PageHeader } from "@/components/page-header";
import { SaldosBancarios } from "@/components/saldos-bancarios";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR, hojeISO, mesLabel } from "@/lib/erp";

export const Route = createFileRoute("/fluxo-caixa")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Fluxo de Caixa Consolidado | Piscinow ERP" },
      {
        name: "description",
        content:
          "Entradas e saídas consolidadas de contas a pagar, contas a receber e lançamentos, com saldo acumulado e projeção.",
      },
      { property: "og:title", content: "Fluxo de Caixa Consolidado | Piscinow ERP" },
      {
        property: "og:description",
        content: "Saldo realizado, projeção de caixa e movimentos diários da Piscinow.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <FluxoCaixa />
    </RequireAuth>
  ),
});

type Movimento = {
  id: string;
  data: string;
  descricao: string;
  origem: string;
  categoria: string;
  entrada: number;
  saida: number;
  realizado: boolean;
};

function FluxoCaixa() {
  const [horizonte, setHorizonte] = useState("90");

  const { data: contas = [] } = useQuery({
    queryKey: ["contas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contas").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: lancamentos = [] } = useQuery({
    queryKey: ["lancamentos_financeiros"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lancamentos_financeiros").select("*");
      if (error) throw error;
      return data;
    },
  });

  const movimentos = useMemo<Movimento[]>(() => {
    const lista: Movimento[] = [];

    for (const c of contas as unknown as Record<string, string | number | null>[]) {
      const pago = c.status === "pago";
      const data = String(pago ? (c.data_pagamento ?? c.vencimento) : c.vencimento).slice(0, 10);
      const valor = Number(c.valor ?? 0);
      lista.push({
        id: `conta-${c.id}`,
        data,
        descricao: String(c.descricao ?? "—"),
        origem: c.tipo === "receber" ? "Conta a receber" : "Conta a pagar",
        categoria: String(c.categoria ?? "—"),
        entrada: c.tipo === "receber" ? valor : 0,
        saida: c.tipo === "receber" ? 0 : valor,
        realizado: pago,
      });
    }

    for (const l of lancamentos as unknown as Record<string, string | number | null>[]) {
      const pago = l.status === "Pago";
      const data = String(
        (pago ? l.data_pagamento : null) ?? l.vencimento ?? l.data_competencia,
      ).slice(0, 10);
      const valor = Number(l.valor ?? 0);
      const receita = l.tipo_fluxo === "receita" || l.tipo_fluxo === "entrada";
      if (l.status === "Cancelado") continue;
      lista.push({
        id: `lanc-${l.id}`,
        data,
        descricao: String(l.descricao ?? "—"),
        origem: receita ? "Receita" : "Despesa",
        categoria: String(l.categoria ?? "—"),
        entrada: receita ? valor : 0,
        saida: receita ? 0 : valor,
        realizado: pago,
      });
    }

    return lista
      .filter((m) => m.data && m.data !== "null")
      .sort((a, b) => a.data.localeCompare(b.data));
  }, [contas, lancamentos]);

  const hoje = hojeISO();

  const realizados = movimentos.filter((m) => m.realizado);
  const saldoAtual = realizados.reduce((s, m) => s + m.entrada - m.saida, 0);

  const mesAtual = hoje.slice(0, 7);
  const doMes = movimentos.filter((m) => m.data.slice(0, 7) === mesAtual);
  const entradasMes = doMes.reduce((s, m) => s + m.entrada, 0);
  const saidasMes = doMes.reduce((s, m) => s + m.saida, 0);

  const limite = useMemo(() => {
    const d = new Date(`${hoje}T12:00:00`);
    d.setDate(d.getDate() + Number(horizonte));
    return d.toISOString().slice(0, 10);
  }, [hoje, horizonte]);

  const futuros = movimentos.filter((m) => !m.realizado && m.data <= limite);
  const previstoEntrada = futuros.reduce((s, m) => s + m.entrada, 0);
  const previstoSaida = futuros.reduce((s, m) => s + m.saida, 0);
  const saldoProjetado = saldoAtual + previstoEntrada - previstoSaida;

  /** Agrupamento mensal com saldo acumulado. */
  const porMes = useMemo(() => {
    const mapa = new Map<string, { key: string; mes: string; entradas: number; saidas: number }>();
    for (const m of movimentos) {
      const key = m.data.slice(0, 7);
      const item = mapa.get(key) ?? { key, mes: mesLabel(m.data), entradas: 0, saidas: 0 };
      item.entradas += m.entrada;
      item.saidas += m.saida;
      mapa.set(key, item);
    }
    let acumulado = 0;
    return Array.from(mapa.values())
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-12)
      .map((v) => {
        acumulado += v.entradas - v.saidas;
        return { ...v, saldo: acumulado, resultado: v.entradas - v.saidas };
      });
  }, [movimentos]);

  /** Agenda futura dia a dia dentro do horizonte, com saldo acumulado. */
  const agenda = useMemo(() => {
    let acumulado = saldoAtual;
    const mapa = new Map<string, { data: string; entradas: number; saidas: number }>();
    for (const m of futuros) {
      const item = mapa.get(m.data) ?? { data: m.data, entradas: 0, saidas: 0 };
      item.entradas += m.entrada;
      item.saidas += m.saida;
      mapa.set(m.data, item);
    }
    return Array.from(mapa.values())
      .sort((a, b) => a.data.localeCompare(b.data))
      .map((d) => {
        acumulado += d.entradas - d.saidas;
        return { ...d, saldo: acumulado };
      });
  }, [futuros, saldoAtual]);

  const ultimos = [...realizados].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 40);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fluxo de Caixa"
        subtitle="Entradas e saídas consolidadas de contas a pagar, contas a receber e lançamentos financeiros."
        actions={
          <>
            <Select value={horizonte} onValueChange={setHorizonte}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Projeção 7 dias</SelectItem>
                <SelectItem value="30">Projeção 30 dias</SelectItem>
                <SelectItem value="90">Projeção 90 dias</SelectItem>
                <SelectItem value="180">Projeção 180 dias</SelectItem>
              </SelectContent>
            </Select>
            <Button asChild variant="outline">
              <Link to="/contas" search={{ periodo: undefined, tipo: undefined }}>
                <Plus /> Conta a pagar/receber
              </Link>
            </Button>
            <Button asChild>
              <Link to="/financeiro">
                <Plus /> Novo lançamento
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Saldo em caixa (realizado)"
          value={brl(saldoAtual)}
          hint="Somente títulos e lançamentos já baixados"
          to="/financeiro"
          tone={saldoAtual >= 0 ? "positive" : "negative"}
        />
        <Kpi
          label="Entradas do mês"
          value={brl(entradasMes)}
          hint="Previsto + realizado"
          tone="positive"
          to="/contas"
        />
        <Kpi
          label="Saídas do mês"
          value={brl(saidasMes)}
          hint="Previsto + realizado"
          tone="negative"
          to="/contas"
        />
        <Kpi
          label={`Saldo projetado (${horizonte} dias)`}
          value={brl(saldoProjetado)}
          hint={`${brl(previstoEntrada)} a receber · ${brl(previstoSaida)} a pagar`}
          to="/relatorio-contas"
          tone={saldoProjetado >= 0 ? "positive" : "negative"}
        />
      </div>

      <TelaPermitida tela="saldos">
        <SaldosBancarios />
      </TelaPermitida>

      <ConciliacaoBancaria />

      <Card>
        <CardHeader>
          <CardTitle>Evolução mensal e saldo acumulado</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {porMes.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Nenhum movimento financeiro registrado ainda.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={porMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  formatter={(v: number) => brl(Number(v))}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Bar
                  dataKey="entradas"
                  name="Entradas"
                  fill="var(--success)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="saidas"
                  name="Saídas"
                  fill="var(--destructive)"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="saldo"
                  name="Saldo acumulado"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="agenda">
        <TabsList>
          <TabsTrigger value="agenda">Projeção diária ({agenda.length})</TabsTrigger>
          <TabsTrigger value="extrato">Extrato realizado ({realizados.length})</TabsTrigger>
          <TabsTrigger value="mensal">Resumo mensal</TabsTrigger>
        </TabsList>

        <TabsContent value="agenda">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Próximos {horizonte} dias</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Entradas</TableHead>
                    <TableHead className="text-right">Saídas</TableHead>
                    <TableHead className="text-right">Saldo acumulado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agenda.map((d) => (
                    <TableRow key={d.data}>
                      <TableCell className={d.data < hoje ? "text-destructive" : undefined}>
                        {dataBR(d.data)}
                        {d.data < hoje && (
                          <Badge variant="destructive" className="ml-2">
                            Vencido
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-success">
                        {d.entradas ? brl(d.entradas) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-destructive">
                        {d.saidas ? brl(d.saidas) : "—"}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium tabular-nums ${d.saldo < 0 ? "text-destructive" : ""}`}
                      >
                        {brl(d.saldo)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {agenda.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                        Nenhum recebimento ou pagamento previsto no período.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extrato">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Últimos movimentos realizados</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ultimos.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{dataBR(m.data)}</TableCell>
                      <TableCell className="font-medium">{m.descricao}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{m.origem}</Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right tabular-nums ${m.entrada ? "text-success" : "text-destructive"}`}
                      >
                        <span className="inline-flex items-center gap-1">
                          {m.entrada ? (
                            <ArrowUpCircle className="size-4" />
                          ) : (
                            <ArrowDownCircle className="size-4" />
                          )}
                          {brl(m.entrada || m.saida)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {ultimos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                        Nenhum movimento baixado até agora.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mensal">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Resumo por mês</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês</TableHead>
                    <TableHead className="text-right">Entradas</TableHead>
                    <TableHead className="text-right">Saídas</TableHead>
                    <TableHead className="text-right">Resultado</TableHead>
                    <TableHead className="text-right">Saldo acumulado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {porMes.map((m) => (
                    <TableRow key={m.key}>
                      <TableCell className="font-medium capitalize">{m.mes}</TableCell>
                      <TableCell className="text-right text-success">{brl(m.entradas)}</TableCell>
                      <TableCell className="text-right text-destructive">{brl(m.saidas)}</TableCell>
                      <TableCell
                        className={`text-right tabular-nums ${m.resultado < 0 ? "text-destructive" : "text-success"}`}
                      >
                        {brl(m.resultado)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {brl(m.saldo)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {porMes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                        Sem dados para resumir.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <FluxoColunas />
    </div>
  );
}
