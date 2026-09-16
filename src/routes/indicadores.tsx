import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Lightbulb, TrendingUp } from "lucide-react";

import { PageHeader, Kpi } from "@/components/page-header";
import { ExpandableCard } from "@/components/expandable-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/erp";
import { RequireAuth } from "@/components/require-auth";

export const Route = createFileRoute("/indicadores")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Indicadores e Autoanálise | Piscinow ERP" },
      {
        name: "description",
        content:
          "ROI, CAC, ticket médio, runway, churn, MRR e EBITDA calculados com os dados do ERP, com recomendações automáticas.",
      },
      { property: "og:title", content: "Indicadores e Autoanálise | Piscinow ERP" },
      {
        property: "og:description",
        content: "Painel de indicadores financeiros e comerciais do Piscinow ERP.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <IndicadoresPage />
    </RequireAuth>
  ),
});

const PERIODOS = [
  { valor: "3", rotulo: "Últimos 3 meses" },
  { valor: "6", rotulo: "Últimos 6 meses" },
  { valor: "12", rotulo: "Últimos 12 meses" },
];

/** Categorias tratadas como investimento de marketing/aquisição de clientes. */
const MARKETING = ["marketing", "publicidade", "propaganda", "anúncio", "anuncio", "trafego", "tráfego", "comissão", "comissao"];
/** Itens que saem do EBITDA (juros, impostos, depreciação e amortização). */
const FORA_EBITDA = ["juros", "imposto", "tarifa banc", "deprecia", "amortiza", "empréstimo", "emprestimo"];

const norm = (s: string | null | undefined) =>
  (s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const contem = (texto: string | null | undefined, lista: string[]) =>
  lista.some((t) => norm(texto).includes(norm(t)));

/** Converte o valor de uma recorrência para o equivalente mensal. */
const porMes: Record<string, number> = {
  diaria: 30,
  semanal: 4.33,
  quinzenal: 2,
  mensal: 1,
  bimestral: 1 / 2,
  trimestral: 1 / 3,
  semestral: 1 / 6,
  anual: 1 / 12,
};

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function mesesAtras(n: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

function IndicadoresPage() {
  const [meses, setMeses] = useState("6");
  const n = Number(meses);

  const inicio = useMemo(() => iso(mesesAtras(n)), [n]);
  const inicioAnterior = useMemo(() => iso(mesesAtras(n * 2)), [n]);
  const hoje = iso(new Date());

  const { data, isLoading } = useQuery({
    queryKey: ["indicadores", meses],
    queryFn: async () => {
      const [lanc, contas, vendas, clientes, saldos] = await Promise.all([
        supabase
          .from("lancamentos_financeiros")
          .select("tipo_fluxo, categoria, valor, data_pagamento, status, recorrencia")
          .gte("data_pagamento", inicioAnterior),
        supabase
          .from("contas")
          .select(
            "tipo, categoria, descricao, valor, valor_juros, status, data_pagamento, recorrencia, recorrencia_fim",
          ),
        supabase
          .from("vendas")
          .select("id, cliente_id, data, valor_total")
          .gte("data", inicioAnterior),
        supabase.from("clientes").select("id, created_at").gte("created_at", inicioAnterior),
        supabase.from("saldos_bancarios").select("saldo"),
      ]);
      return {
        lanc: lanc.data ?? [],
        contas: contas.data ?? [],
        vendas: vendas.data ?? [],
        clientes: clientes.data ?? [],
        saldos: saldos.data ?? [],
      };
    },
    refetchInterval: 60_000,
  });

  const m = useMemo(() => {
    const lanc = data?.lanc ?? [];
    const contas = data?.contas ?? [];
    const vendas = data?.vendas ?? [];
    const clientes = data?.clientes ?? [];
    const saldos = data?.saldos ?? [];

    const noPeriodo = (d?: string | null) => !!d && d >= inicio && d <= hoje;
    const noAnterior = (d?: string | null) => !!d && d >= inicioAnterior && d < inicio;

    // Receita realizada = lançamentos de receita já pagos.
    const receita = lanc
      .filter((l) => l.tipo_fluxo === "receita" && noPeriodo(l.data_pagamento))
      .reduce((s, l) => s + Number(l.valor ?? 0), 0);

    // Despesa realizada = lançamentos de despesa pagos + títulos a pagar baixados.
    const despesaLanc = lanc.filter(
      (l) => l.tipo_fluxo === "despesa" && noPeriodo(l.data_pagamento),
    );
    const despesaContas = contas.filter(
      (c) => c.tipo === "pagar" && c.status === "pago" && noPeriodo(c.data_pagamento),
    );
    const despesa =
      despesaLanc.reduce((s, l) => s + Number(l.valor ?? 0), 0) +
      despesaContas.reduce(
        (s, c) => s + Number(c.valor ?? 0) + Number(c.valor_juros ?? 0),
        0,
      );

    const lucro = receita - despesa;

    // ROI sobre o custo total operacional do período.
    const roi = despesa > 0 ? (lucro / despesa) * 100 : 0;

    // CAC: gasto de marketing/aquisição dividido pelos clientes novos.
    const gastoAquisicao =
      despesaLanc
        .filter((l) => contem(l.categoria, MARKETING))
        .reduce((s, l) => s + Number(l.valor ?? 0), 0) +
      despesaContas
        .filter((c) => contem(c.categoria, MARKETING) || contem(c.descricao, MARKETING))
        .reduce((s, c) => s + Number(c.valor ?? 0), 0);
    const novosClientes = clientes.filter((c) => noPeriodo(c.created_at?.slice(0, 10))).length;
    const cac = novosClientes > 0 ? gastoAquisicao / novosClientes : 0;

    // Ticket médio (AOV) sobre os pedidos do período.
    const pedidos = vendas.filter((v) => noPeriodo(v.data));
    const receitaPedidos = pedidos.reduce((s, v) => s + Number(v.valor_total ?? 0), 0);
    const aov = pedidos.length > 0 ? receitaPedidos / pedidos.length : 0;

    // Runway: caixa informado dividido pelo consumo líquido mensal.
    const caixa = saldos.reduce((s, x) => s + Number(x.saldo ?? 0), 0);
    const burnMensal = (despesa - receita) / n;
    const runway = burnMensal > 0 ? caixa / burnMensal : Infinity;

    // Churn: clientes que compraram no período anterior e não voltaram.
    const compraramAntes = new Set(
      vendas.filter((v) => noAnterior(v.data)).map((v) => v.cliente_id).filter(Boolean),
    );
    const compraramAgora = new Set(
      pedidos.map((v) => v.cliente_id).filter(Boolean),
    );
    const perdidos = [...compraramAntes].filter((id) => !compraramAgora.has(id)).length;
    const churn = compraramAntes.size > 0 ? (perdidos / compraramAntes.size) * 100 : 0;

    // MRR: títulos a receber recorrentes convertidos para base mensal.
    const mrr = contas
      .filter(
        (c) =>
          c.tipo === "receber" &&
          c.recorrencia &&
          c.recorrencia !== "nenhuma" &&
          (!c.recorrencia_fim || c.recorrencia_fim >= hoje),
      )
      .reduce((s, c) => s + Number(c.valor ?? 0) * (porMes[c.recorrencia as string] ?? 0), 0);

    // EBITDA: lucro sem juros, impostos, depreciação e amortização.
    const foraEbitda =
      despesaLanc
        .filter((l) => contem(l.categoria, FORA_EBITDA))
        .reduce((s, l) => s + Number(l.valor ?? 0), 0) +
      despesaContas
        .filter((c) => contem(c.categoria, FORA_EBITDA) || contem(c.descricao, FORA_EBITDA))
        .reduce((s, c) => s + Number(c.valor ?? 0) + Number(c.valor_juros ?? 0), 0);
    const ebitda = lucro + foraEbitda;
    const margemEbitda = receita > 0 ? (ebitda / receita) * 100 : 0;

    const ltv = aov > 0 ? aov * (churn > 0 ? 100 / churn : 1) : 0;

    return {
      receita,
      despesa,
      lucro,
      roi,
      cac,
      gastoAquisicao,
      novosClientes,
      aov,
      pedidos: pedidos.length,
      caixa,
      burnMensal,
      runway,
      churn,
      perdidos,
      baseChurn: compraramAntes.size,
      mrr,
      ebitda,
      margemEbitda,
      foraEbitda,
      ltv,
    };
  }, [data, inicio, inicioAnterior, hoje, n]);

  // Autoanálise: cada regra vira uma recomendação prática.
  const analises = useMemo(() => {
    const out: { tom: "bom" | "atencao" | "risco"; titulo: string; texto: string }[] = [];
    if (!data) return out;

    if (m.receita === 0 && m.despesa === 0) {
      out.push({
        tom: "atencao",
        titulo: "Ainda não há movimento suficiente no período",
        texto:
          "Registre os recebimentos e pagamentos do período para que os indicadores fiquem confiáveis.",
      });
      return out;
    }

    if (m.lucro < 0)
      out.push({
        tom: "risco",
        titulo: "Você está gastando mais do que recebe",
        texto: `No período as saídas superaram as entradas em ${brl(Math.abs(m.lucro))}. Reveja despesas fixas e o preço praticado antes de assumir novos custos.`,
      });
    else
      out.push({
        tom: "bom",
        titulo: "Resultado positivo no período",
        texto: `Sobrou ${brl(m.lucro)} depois de pagar tudo, um retorno de ${m.roi.toFixed(1)}% sobre o que foi gasto.`,
      });

    if (m.roi < 20 && m.roi >= 0)
      out.push({
        tom: "atencao",
        titulo: "Retorno abaixo do ideal",
        texto:
          "Um retorno menor que 20% deixa pouca folga para imprevistos. Priorize vendas com margem maior e renegocie os custos dos fornecedores.",
      });

    if (m.runway !== Infinity && m.runway < 3)
      out.push({
        tom: "risco",
        titulo: "Caixa curto",
        texto: `No ritmo atual o dinheiro em conta dura cerca de ${m.runway.toFixed(1)} mês(es). Antecipe recebimentos, alongue pagamentos e corte o que não é essencial.`,
      });
    else if (m.runway !== Infinity && m.runway < 6)
      out.push({
        tom: "atencao",
        titulo: "Caixa apertado",
        texto: `O caixa cobre cerca de ${m.runway.toFixed(1)} meses. O saudável é manter ao menos 6 meses de folga.`,
      });

    if (m.novosClientes === 0)
      out.push({
        tom: "atencao",
        titulo: "Nenhum cliente novo no período",
        texto:
          "Sem clientes novos o custo de aquisição não pode ser calculado e o crescimento depende só da carteira atual.",
      });
    else if (m.cac > 0 && m.aov > 0 && m.cac > m.aov * 0.3)
      out.push({
        tom: "atencao",
        titulo: "Custo para conquistar cliente está alto",
        texto: `Cada novo cliente custa ${brl(m.cac)} contra um ticket médio de ${brl(m.aov)}. O ideal é ficar abaixo de 30% do ticket.`,
      });

    if (m.churn > 40)
      out.push({
        tom: "risco",
        titulo: "Muitos clientes deixaram de comprar",
        texto: `${m.perdidos} de ${m.baseChurn} clientes do período anterior não voltaram (${m.churn.toFixed(0)}%). Use a tela de Reativação de Clientes para retomar contato.`,
      });
    else if (m.churn > 20)
      out.push({
        tom: "atencao",
        titulo: "Perda de clientes acima do confortável",
        texto: `${m.churn.toFixed(0)}% dos clientes anteriores não compraram de novo. Vale criar manutenção recorrente para fidelizar.`,
      });

    if (m.mrr === 0)
      out.push({
        tom: "atencao",
        titulo: "Sem receita recorrente",
        texto:
          "Contratos mensais de manutenção dariam previsibilidade ao caixa. Hoje toda a receita depende de vendas pontuais.",
      });
    else
      out.push({
        tom: "bom",
        titulo: "Receita recorrente ativa",
        texto: `${brl(m.mrr)} por mês já estão contratados de forma recorrente, o que cobre ${m.despesa > 0 ? ((m.mrr / (m.despesa / n)) * 100).toFixed(0) : "0"}% das despesas mensais.`,
      });

    if (m.margemEbitda > 0 && m.margemEbitda < 10)
      out.push({
        tom: "atencao",
        titulo: "Margem operacional baixa",
        texto: `A operação em si devolve ${m.margemEbitda.toFixed(1)}% da receita. Abaixo de 10% qualquer imprevisto vira prejuízo.`,
      });

    if (m.ltv > 0 && m.cac > 0 && m.ltv < m.cac * 3)
      out.push({
        tom: "atencao",
        titulo: "Valor do cliente x custo de conquista",
        texto: `Cada cliente devolve cerca de ${brl(m.ltv)} ao longo do relacionamento, menos de 3x o custo de conquistá-lo. Aumente o ticket ou a recompra.`,
      });

    return out;
  }, [m, data, n]);

  const icones = {
    bom: <CheckCircle2 className="size-4 text-success" />,
    atencao: <Lightbulb className="size-4 text-warning" />,
    risco: <AlertTriangle className="size-4 text-destructive" />,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Indicadores & Autoanálise"
        subtitle="O sistema lê os próprios números e aponta o caminho a seguir"
        actions={
          <Select value={meses} onValueChange={setMeses}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODOS.map((p) => (
                <SelectItem key={p.valor} value={p.valor}>
                  {p.rotulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Calculando indicadores…</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi
              label="ROI"
              value={`${m.roi.toFixed(1)}%`}
              hint={`Lucro ${brl(m.lucro)} sobre custo ${brl(m.despesa)}`}
              tone={m.roi >= 20 ? "positive" : m.roi >= 0 ? "warning" : "negative"}
              to="/dre"
            />
            <Kpi
              label="CAC"
              value={brl(m.cac)}
              hint={`${brl(m.gastoAquisicao)} em aquisição · ${m.novosClientes} clientes novos`}
              to="/clientes"
            />
            <Kpi
              label="Ticket médio (AOV)"
              value={brl(m.aov)}
              hint={`${m.pedidos} pedido(s) no período`}
              to="/vendas"
            />
            <Kpi
              label="Runway"
              value={m.runway === Infinity ? "Caixa positivo" : `${m.runway.toFixed(1)} meses`}
              hint={`Caixa ${brl(m.caixa)} · consumo ${brl(Math.max(m.burnMensal, 0))}/mês`}
              tone={
                m.runway === Infinity ? "positive" : m.runway < 3 ? "negative" : m.runway < 6 ? "warning" : "positive"
              }
              to="/fluxo-caixa"
            />
            <Kpi
              label="Churn"
              value={`${m.churn.toFixed(1)}%`}
              hint={`${m.perdidos} de ${m.baseChurn} clientes não voltaram`}
              tone={m.churn > 40 ? "negative" : m.churn > 20 ? "warning" : "positive"}
              to="/reativacao"
            />
            <Kpi
              label="MRR"
              value={brl(m.mrr)}
              hint="Receita contratada por mês"
              to="/contas"
            />
            <Kpi
              label="EBITDA"
              value={brl(m.ebitda)}
              hint={`Margem ${m.margemEbitda.toFixed(1)}% · fora do cálculo ${brl(m.foraEbitda)}`}
              tone={m.ebitda >= 0 ? "positive" : "negative"}
              to="/dre"
            />
            <Kpi
              label="Valor do cliente (LTV)"
              value={brl(m.ltv)}
              hint="Ticket médio projetado pelo tempo de permanência"
              to="/clientes"
            />
          </div>

          <ExpandableCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="size-4 text-primary" />
                Autoanálise do período
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analises.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sem recomendações para este período.
                </p>
              ) : (
                analises.map((a) => (
                  <div
                    key={a.titulo}
                    className="flex gap-3 rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <div className="mt-0.5">{icones[a.tom]}</div>
                    <div>
                      <p className="text-sm font-medium">{a.titulo}</p>
                      <p className="text-sm text-muted-foreground">{a.texto}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </ExpandableCard>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Como cada número é calculado</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <p>
                <strong className="text-foreground">ROI</strong> = lucro do período ÷ tudo o que foi
                pago × 100.
              </p>
              <p>
                <strong className="text-foreground">CAC</strong> = gastos de marketing, propaganda e
                comissões ÷ clientes novos cadastrados.
              </p>
              <p>
                <strong className="text-foreground">Ticket médio</strong> = valor total dos pedidos ÷
                quantidade de pedidos.
              </p>
              <p>
                <strong className="text-foreground">Runway</strong> = saldo informado das contas ÷
                quanto o caixa consome por mês.
              </p>
              <p>
                <strong className="text-foreground">Churn</strong> = clientes do período anterior que
                não compraram de novo ÷ total daquele período × 100.
              </p>
              <p>
                <strong className="text-foreground">MRR</strong> = títulos a receber recorrentes
                convertidos para valor mensal.
              </p>
              <p>
                <strong className="text-foreground">EBITDA</strong> = lucro do período somando de
                volta juros, impostos, depreciação e amortização.
              </p>
              <p>
                <strong className="text-foreground">LTV</strong> = ticket médio projetado pelo tempo
                que o cliente costuma permanecer.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
