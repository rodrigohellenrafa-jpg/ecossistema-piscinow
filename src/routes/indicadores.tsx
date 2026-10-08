import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Layers,
  Lightbulb,
  Store,
  TrendingUp,
  Truck,
  Wallet,
} from "lucide-react";

import { PageHeader, Kpi } from "@/components/page-header";
import { ExpandableCard } from "@/components/expandable-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR } from "@/lib/erp";
import { RequireAuth } from "@/components/require-auth";

export const Route = createFileRoute("/indicadores")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Indicadores e Autoanálise | Piscinow ERP" },
      {
        name: "description",
        content:
          "ROI, CAC, ticket médio OUT, margens de balcão, runway, churn, MRR e EBITDA calculados com os dados do ERP, com segregação retroativa desde 04/09/2026.",
      },
      { property: "og:title", content: "Indicadores e Autoanálise | Piscinow ERP" },
      {
        property: "og:description",
        content:
          "Painel de indicadores financeiros e comerciais do Piscinow ERP com dados segregados.",
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

/** Data de início do controle estrito no ERP (processamento retroativo). */
export const INICIO_CONTROLE = "2026-09-04";

const PERIODOS = [
  { valor: "controle", rotulo: "Desde 04/09/2026 (Início do controle)" },
  { valor: "3", rotulo: "Últimos 3 meses" },
  { valor: "6", rotulo: "Últimos 6 meses" },
  { valor: "12", rotulo: "Últimos 12 meses" },
];

/** Categorias tratadas como investimento de marketing/aquisição de clientes. */
const MARKETING = [
  "marketing",
  "publicidade",
  "propaganda",
  "anúncio",
  "anuncio",
  "trafego",
  "tráfego",
  "comissão",
  "comissao",
];

/** Itens que saem do EBITDA (juros, impostos, depreciação e amortização). */
const FORA_EBITDA = [
  "juros",
  "imposto",
  "tarifa banc",
  "deprecia",
  "amortiza",
  "empréstimo",
  "emprestimo",
];

const norm = (s: string | null | undefined) =>
  (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const contem = (texto: string | null | undefined, lista: string[]) =>
  lista.some((t) => norm(texto).includes(norm(t)));

const ehEntradaFluxo = (t?: string | null) =>
  ["receita", "entrada", "receber"].includes((t ?? "").toLowerCase().trim());

const ehSaidaFluxo = (t?: string | null) =>
  ["despesa", "saida", "pagar"].includes((t ?? "").toLowerCase().trim());

const ehPagoStatus = (s?: string | null) =>
  ["pago", "pago_parcial"].includes((s ?? "").toLowerCase().trim());

const isOut = (v: { tipo_atendimento?: string | null }) =>
  (v.tipo_atendimento ?? "").toLowerCase() === "out" ||
  (v.tipo_atendimento ?? "").toLowerCase().includes("externo");

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
  const [meses, setMeses] = useState("controle");
  const hoje = iso(new Date());

  const n = useMemo(() => {
    if (meses === "controle") {
      const dias = Math.max(
        1,
        Math.round((new Date(hoje).getTime() - new Date(INICIO_CONTROLE).getTime()) / 86_400_000),
      );
      return Math.max(1, dias / 30);
    }
    return Number(meses);
  }, [meses, hoje]);

  const inicio = useMemo(() => {
    if (meses === "controle") return INICIO_CONTROLE;
    return iso(mesesAtras(Number(meses)));
  }, [meses]);

  const inicioAnterior = useMemo(() => {
    if (meses === "controle") {
      const dias = Math.max(
        1,
        Math.round((new Date(hoje).getTime() - new Date(INICIO_CONTROLE).getTime()) / 86_400_000),
      );
      const d = new Date(new Date(INICIO_CONTROLE).getTime() - dias * 86_400_000);
      return iso(d);
    }
    return iso(mesesAtras(Number(meses) * 2));
  }, [meses, hoje]);

  const { data, isLoading } = useQuery({
    queryKey: ["indicadores", meses],
    queryFn: async () => {
      const dataMinimaVendas = inicioAnterior < INICIO_CONTROLE ? inicioAnterior : INICIO_CONTROLE;

      const [lanc, contas, vendas, clientes, saldos] = await Promise.all([
        supabase
          .from("lancamentos_financeiros")
          .select(
            "id, tipo_fluxo, categoria, descricao, valor, data_pagamento, data_competencia, status, recorrencia",
          )
          .gte("data_pagamento", inicioAnterior),
        supabase
          .from("contas")
          .select(
            "id, tipo, categoria, descricao, valor, valor_juros, valor_desconto, status, data_pagamento, vencimento, recorrencia, recorrencia_fim",
          ),
        supabase
          .from("vendas")
          .select(
            "id, cliente_id, data, valor_total, custo_total, valor_impostos, valor_frete, valor_mao_obra, tipo_atendimento, status_pedido",
          )
          .gte("data", dataMinimaVendas),
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

    // Pedidos do período registrados a partir do início do controle (04/09/2026),
    // ignorando orçamentos pendentes e cancelamentos.
    const pedidosPeriodo = vendas.filter((v) => {
      const d = v.data ? v.data.slice(0, 10) : "";
      return (
        d >= INICIO_CONTROLE &&
        noPeriodo(d) &&
        v.status_pedido !== "orcamento" &&
        v.status_pedido !== "cancelado"
      );
    });

    // 1. Segregação de Pedidos: OUT (Serviço Externo) vs IN (Balcão)
    const pedidosOut = pedidosPeriodo.filter(isOut);
    const pedidosIn = pedidosPeriodo.filter((v) => !isOut(v));

    // A) Módulo OUT (Serviço externo)
    const receitaOut = pedidosOut.reduce((s, v) => s + Number(v.valor_total ?? 0), 0);
    const custoDiretoOut = pedidosOut.reduce(
      (s, v) =>
        s + Number(v.custo_total ?? 0) + Number(v.valor_frete ?? 0) + Number(v.valor_mao_obra ?? 0),
      0,
    );
    const impostosOut = pedidosOut.reduce((s, v) => s + Number(v.valor_impostos ?? 0), 0);
    const custoTotalOut = custoDiretoOut + impostosOut;
    const lucroBrutoOut = receitaOut - custoTotalOut;
    const margemLucroOut = receitaOut > 0 ? (lucroBrutoOut / receitaOut) * 100 : 0;

    // TICKET MÉDIO (AOV): Aplicado EXCLUSIVAMENTE aos pedidos classificados como 'out serviço externo'
    const aov = pedidosOut.length > 0 ? receitaOut / pedidosOut.length : 0;

    // B) Módulo IN (Balcão)
    // Para pedidos 'in balcão', computa APENAS a margem de lucro e a margem de contribuição (sem ticket médio)
    const receitaIn = pedidosIn.reduce((s, v) => s + Number(v.valor_total ?? 0), 0);
    const custoVariavelIn = pedidosIn.reduce(
      (s, v) => s + Number(v.custo_total ?? 0) + Number(v.valor_frete ?? 0),
      0,
    );
    const impostosIn = pedidosIn.reduce((s, v) => s + Number(v.valor_impostos ?? 0), 0);
    const maoObraIn = pedidosIn.reduce((s, v) => s + Number(v.valor_mao_obra ?? 0), 0);
    const custoTotalIn = custoVariavelIn + impostosIn + maoObraIn;

    // Margem de Contribuição do Balcão: Faturamento menos custos variáveis
    const margemContribuicaoInValor = Math.max(0, receitaIn - custoVariavelIn);
    const margemContribuicaoInPerc =
      receitaIn > 0 ? ((receitaIn - custoVariavelIn) / receitaIn) * 100 : 0;

    // Margem de Lucro do Balcão: Faturamento menos custos e impostos diretos
    const lucroIn = receitaIn - custoTotalIn;
    const margemLucroInPerc = receitaIn > 0 ? (lucroIn / receitaIn) * 100 : 0;

    // 2. Saldo do Fluxo de Caixa Corrigido (Entradas e Saídas Efetivamente Realizadas)
    // Entradas: lançamentos quitados ('receita' ou 'entrada') + contas a receber baixadas
    const lancEntradas = lanc.filter(
      (l) => ehEntradaFluxo(l.tipo_fluxo) && ehPagoStatus(l.status) && noPeriodo(l.data_pagamento),
    );
    const contasEntradas = contas.filter(
      (c) => c.tipo === "receber" && ehPagoStatus(c.status) && noPeriodo(c.data_pagamento),
    );
    const entradasRealizadas =
      lancEntradas.reduce((s, l) => s + Number(l.valor ?? 0), 0) +
      contasEntradas.reduce(
        (s, c) =>
          s + Number(c.valor ?? 0) + Number(c.valor_juros ?? 0) - Number(c.valor_desconto ?? 0),
        0,
      );

    // Saídas: lançamentos quitados ('despesa' ou 'saida') + contas a pagar quitadas
    const lancSaidas = lanc.filter(
      (l) => ehSaidaFluxo(l.tipo_fluxo) && ehPagoStatus(l.status) && noPeriodo(l.data_pagamento),
    );
    const contasSaidas = contas.filter(
      (c) => c.tipo === "pagar" && ehPagoStatus(c.status) && noPeriodo(c.data_pagamento),
    );
    const saidasRealizadas =
      lancSaidas.reduce((s, l) => s + Number(l.valor ?? 0), 0) +
      contasSaidas.reduce(
        (s, c) =>
          s + Number(c.valor ?? 0) + Number(c.valor_juros ?? 0) - Number(c.valor_desconto ?? 0),
        0,
      );

    // Saldo líquido corrigido do fluxo de caixa:
    const saldoFluxoCaixa = entradasRealizadas - saidasRealizadas;
    const saldoBancario = saldos.reduce((s, x) => s + Number(x.saldo ?? 0), 0);

    // 3. Dashboards de ROI e EBITDA refletindo os dados segregados
    const faturamentoVendas = receitaOut + receitaIn;
    const receitaConsolidada = faturamentoVendas > 0 ? faturamentoVendas : entradasRealizadas;

    const custoTotalVendas = custoTotalOut + custoTotalIn;
    const lucroBrutoVendas = lucroBrutoOut + lucroIn;

    // Despesas operacionais gerais (fixas, administrativas, marketing, pessoal) apuradas no fluxo:
    const despesasOperacionaisGerais = saidasRealizadas;
    const custosTotaisOperacao = custoTotalVendas + despesasOperacionaisGerais;

    // Lucro Líquido Operacional do período:
    const lucroConsolidado =
      faturamentoVendas > 0 ? lucroBrutoVendas - despesasOperacionaisGerais : saldoFluxoCaixa;

    // ROI consolidado e por segmento segregado:
    const roi = custosTotaisOperacao > 0 ? (lucroConsolidado / custosTotaisOperacao) * 100 : 0;
    const roiOut = custoTotalOut > 0 ? (lucroBrutoOut / custoTotalOut) * 100 : 0;
    const roiIn = custoTotalIn > 0 ? (lucroIn / custoTotalIn) * 100 : 0;

    // Itens fora do EBITDA (juros, impostos, tarifas bancárias, depreciação):
    const impostosTotaisVendas = impostosOut + impostosIn;
    const foraEbitdaFluxo =
      lancSaidas
        .filter((l) => contem(l.categoria, FORA_EBITDA))
        .reduce((s, l) => s + Number(l.valor ?? 0), 0) +
      contasSaidas
        .filter((c) => contem(c.categoria, FORA_EBITDA) || contem(c.descricao, FORA_EBITDA))
        .reduce((s, c) => s + Number(c.valor ?? 0) + Number(c.valor_juros ?? 0), 0);

    const foraEbitda = foraEbitdaFluxo + impostosTotaisVendas;
    const ebitda = lucroConsolidado + foraEbitda;
    const margemEbitda = receitaConsolidada > 0 ? (ebitda / receitaConsolidada) * 100 : 0;

    // Runway e Queima de Caixa calculados a partir do saldo corrigido do fluxo:
    const burnMensal = saldoFluxoCaixa < 0 ? Math.abs(saldoFluxoCaixa) / n : 0;
    const runway = burnMensal > 0 ? saldoBancario / burnMensal : Infinity;

    // CAC: Gasto de aquisição dividido por novos clientes cadastrados
    const gastoAquisicao =
      lancSaidas
        .filter((l) => contem(l.categoria, MARKETING))
        .reduce((s, l) => s + Number(l.valor ?? 0), 0) +
      contasSaidas
        .filter((c) => contem(c.categoria, MARKETING) || contem(c.descricao, MARKETING))
        .reduce((s, c) => s + Number(c.valor ?? 0), 0);
    const novosClientes = clientes.filter((c) => noPeriodo(c.created_at?.slice(0, 10))).length;
    const cac = novosClientes > 0 ? gastoAquisicao / novosClientes : 0;

    // Churn: Clientes anteriores que não compraram de novo
    const compraramAntes = new Set(
      vendas
        .filter((v) => noAnterior(v.data))
        .map((v) => v.cliente_id)
        .filter(Boolean),
    );
    const compraramAgora = new Set(pedidosPeriodo.map((v) => v.cliente_id).filter(Boolean));
    const perdidos = [...compraramAntes].filter((id) => !compraramAgora.has(id)).length;
    const churn = compraramAntes.size > 0 ? (perdidos / compraramAntes.size) * 100 : 0;

    // MRR: Títulos recorrentes convertidos para base mensal
    const mrr = contas
      .filter(
        (c) =>
          c.tipo === "receber" &&
          c.recorrencia &&
          c.recorrencia !== "nenhuma" &&
          (!c.recorrencia_fim || c.recorrencia_fim >= hoje),
      )
      .reduce((s, c) => s + Number(c.valor ?? 0) * (porMes[c.recorrencia as string] ?? 0), 0);

    // LTV: Projetado pelo ticket médio exclusivo de serviço externo (AOV OUT)
    const ltv = aov > 0 ? aov * (churn > 0 ? 100 / churn : 1) : 0;

    return {
      // Vendas Segregadas
      pedidosTotal: pedidosPeriodo.length,
      pedidosOut: pedidosOut.length,
      receitaOut,
      custoTotalOut,
      lucroBrutoOut,
      margemLucroOut,
      aov, // Ticket Médio exclusivo OUT
      roiOut,

      pedidosIn: pedidosIn.length,
      receitaIn,
      custoVariavelIn,
      custoTotalIn,
      lucroIn,
      margemContribuicaoInValor,
      margemContribuicaoInPerc,
      margemLucroInPerc,
      roiIn,

      // Fluxo de Caixa Corrigido
      entradasRealizadas,
      saidasRealizadas,
      saldoFluxoCaixa,
      saldoBancario,
      burnMensal,
      runway,

      // Consolidação, ROI e EBITDA
      faturamentoVendas,
      receitaConsolidada,
      custosTotaisOperacao,
      lucroConsolidado,
      roi,
      ebitda,
      margemEbitda,
      foraEbitda,

      // Métricas de Aquisição e Retenção
      cac,
      gastoAquisicao,
      novosClientes,
      churn,
      perdidos,
      baseChurn: compraramAntes.size,
      mrr,
      ltv,
    };
  }, [data, inicio, inicioAnterior, hoje, n]);

  // Autoanálise com recomendações práticas baseadas nos dados segregados e fluxo corrigido
  const analises = useMemo(() => {
    const out: { tom: "bom" | "atencao" | "risco"; titulo: string; texto: string }[] = [];
    if (!data) return out;

    if (m.pedidosTotal === 0 && m.entradasRealizadas === 0 && m.saidasRealizadas === 0) {
      out.push({
        tom: "atencao",
        titulo: "Ainda não há movimento suficiente no período",
        texto: `Nenhum pedido ou lançamento registrado desde ${dataBR(inicio)}. Registre transações para alimentar os indicadores.`,
      });
      return out;
    }

    // Avaliação do Saldo do Fluxo de Caixa
    if (m.saldoFluxoCaixa < 0) {
      out.push({
        tom: "risco",
        titulo: "Fluxo de caixa deficitário no período",
        texto: `As saídas de caixa superaram as entradas em ${brl(Math.abs(m.saldoFluxoCaixa))}. Saldo em conta bancária: ${brl(m.saldoBancario)}. Priorize cobrança e renegocie prazos de saída.`,
      });
    } else {
      out.push({
        tom: "bom",
        titulo: "Fluxo de caixa com superávit corrigido",
        texto: `O caixa gerou saldo positivo de ${brl(m.saldoFluxoCaixa)} (${brl(m.entradasRealizadas)} entradas vs ${brl(m.saidasRealizadas)} saídas).`,
      });
    }

    // Avaliação de Pedidos IN (Balcão)
    if (m.pedidosIn > 0) {
      if (m.margemContribuicaoInPerc < 25) {
        out.push({
          tom: "atencao",
          titulo: "Margem de contribuição do balcão abaixo do alvo",
          texto: `Os pedidos de balcão (IN) estão gerando ${m.margemContribuicaoInPerc.toFixed(1)}% de margem de contribuição (${brl(m.margemContribuicaoInValor)}). O alvo para produtos de revenda é no mínimo 25% a 30%.`,
        });
      } else {
        out.push({
          tom: "bom",
          titulo: "Margem de contribuição saudável no balcão",
          texto: `O balcão (IN) entregou ${m.margemContribuicaoInPerc.toFixed(1)}% de margem de contribuição (${brl(m.margemContribuicaoInValor)}) e ${m.margemLucroInPerc.toFixed(1)}% de margem de lucro líquido.`,
        });
      }
    }

    // Avaliação de Pedidos OUT (Serviço Externo)
    if (m.pedidosOut > 0) {
      if (m.aov > 0 && m.cac > 0 && m.cac > m.aov * 0.3) {
        out.push({
          tom: "atencao",
          titulo: "Custo de aquisição alto frente ao ticket médio externo",
          texto: `Cada novo cliente custa ${brl(m.cac)} para um ticket médio de serviço externo (OUT) de ${brl(m.aov)}. O recomendável é manter o CAC abaixo de 30% do ticket médio.`,
        });
      }
    }

    // Avaliação do ROI Consolidado
    if (m.roi < 20 && m.roi >= 0) {
      out.push({
        tom: "atencao",
        titulo: "ROI consolidado abaixo da meta operacional (20%)",
        texto: `O retorno geral da operação está em ${m.roi.toFixed(1)}% (OUT: ${m.roiOut.toFixed(1)}% · Balcão: ${m.roiIn.toFixed(1)}%). Priorize produtos e serviços de maior margem.`,
      });
    } else if (m.roi >= 20) {
      out.push({
        tom: "bom",
        titulo: "ROI consolidado em patamar saudável",
        texto: `Retorno operacional de ${m.roi.toFixed(1)}% sobre todos os custos e despesas do período.`,
      });
    }

    // Avaliação do EBITDA
    if (m.margemEbitda > 0 && m.margemEbitda < 10) {
      out.push({
        tom: "atencao",
        titulo: "Margem EBITDA reduzida",
        texto: `A margem operacional EBITDA está em ${m.margemEbitda.toFixed(1)}% (${brl(m.ebitda)}). Uma margem inferior a 10% deixa a operação vulnerável a oscilações de custos.`,
      });
    }

    // Churn e Retenção
    if (m.churn > 30) {
      out.push({
        tom: "risco",
        titulo: "Perda de clientes em alta",
        texto: `${m.perdidos} de ${m.baseChurn} clientes do ciclo anterior não realizaram novas compras (${m.churn.toFixed(0)}%). Utilize a Reativação de Clientes para recuperar contatos.`,
      });
    }

    return out;
  }, [m, data, inicio]);

  const icones = {
    bom: <CheckCircle2 className="size-4 text-success" />,
    atencao: <Lightbulb className="size-4 text-warning" />,
    risco: <AlertTriangle className="size-4 text-destructive" />,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Indicadores & Autoanálise"
        subtitle={`Processamento retroativo desde ${dataBR(INICIO_CONTROLE)} com métricas segregadas por tipo de pedido.`}
        actions={
          <Select value={meses} onValueChange={setMeses}>
            <SelectTrigger className="w-64">
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
          {/* Grade Principal de KPIs Segregados e Consolidados */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi
              label="ROI Consolidado"
              value={`${m.roi.toFixed(1)}%`}
              hint={`OUT ${m.roiOut.toFixed(1)}% · Balcão ${m.roiIn.toFixed(1)}%`}
              tone={m.roi >= 20 ? "positive" : m.roi >= 0 ? "warning" : "negative"}
              to="/dre"
            />
            <Kpi
              label="EBITDA"
              value={brl(m.ebitda)}
              hint={`Margem ${m.margemEbitda.toFixed(1)}% · Fora ${brl(m.foraEbitda)}`}
              tone={m.ebitda >= 0 ? "positive" : "negative"}
              to="/dre"
            />
            <Kpi
              label="Ticket médio (OUT · Serviço externo)"
              value={brl(m.aov)}
              hint={`${m.pedidosOut} pedido(s) OUT · exclusivo serviço externo`}
              to="/vendas"
            />
            <Kpi
              label="Margem de contribuição (Balcão)"
              value={`${m.margemContribuicaoInPerc.toFixed(1)}%`}
              hint={`${brl(m.margemContribuicaoInValor)} sobre ${brl(m.receitaIn)} (${m.pedidosIn} pedidos)`}
              tone={
                m.margemContribuicaoInPerc >= 30
                  ? "positive"
                  : m.margemContribuicaoInPerc >= 15
                    ? "warning"
                    : "negative"
              }
              to="/vendas"
            />
            <Kpi
              label="Margem de lucro (Balcão)"
              value={`${m.margemLucroInPerc.toFixed(1)}%`}
              hint={`Lucro líquido ${brl(m.lucroIn)} em pedidos IN`}
              tone={
                m.margemLucroInPerc >= 20
                  ? "positive"
                  : m.margemLucroInPerc >= 5
                    ? "warning"
                    : "negative"
              }
              to="/vendas"
            />
            <Kpi
              label="Saldo do Fluxo de Caixa"
              value={brl(m.saldoFluxoCaixa)}
              hint={`Entradas ${brl(m.entradasRealizadas)} · Saídas ${brl(m.saidasRealizadas)}`}
              tone={m.saldoFluxoCaixa >= 0 ? "positive" : "negative"}
              to="/fluxo-caixa"
            />
            <Kpi
              label="Runway"
              value={m.runway === Infinity ? "Caixa superavitário" : `${m.runway.toFixed(1)} meses`}
              hint={`Caixa em conta ${brl(m.saldoBancario)} · queima ${brl(m.burnMensal)}/mês`}
              tone={
                m.runway === Infinity
                  ? "positive"
                  : m.runway < 3
                    ? "negative"
                    : m.runway < 6
                      ? "warning"
                      : "positive"
              }
              to="/fluxo-caixa"
            />
            <Kpi
              label="CAC"
              value={brl(m.cac)}
              hint={`${brl(m.gastoAquisicao)} aquisição · ${m.novosClientes} cliente(s) novo(s)`}
              to="/clientes"
            />
            <Kpi
              label="Valor do cliente (LTV)"
              value={brl(m.ltv)}
              hint={`Projetado pelo ticket OUT (${brl(m.aov)})`}
              to="/clientes"
            />
            <Kpi label="MRR" value={brl(m.mrr)} hint="Receita recorrente por mês" to="/contas" />
            <Kpi
              label="Churn"
              value={`${m.churn.toFixed(1)}%`}
              hint={`${m.perdidos} de ${m.baseChurn} clientes não voltaram`}
              tone={m.churn > 40 ? "negative" : m.churn > 20 ? "warning" : "positive"}
              to="/reativacao"
            />
          </div>

          {/* Painel Especial de Segregação: OUT (Serviço Externo) vs IN (Balcão) */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Layers className="size-4 text-primary" />
                  Segregação Operacional: OUT (Serviço Externo) vs IN (Balcão)
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  Processamento retroativo desde {dataBR(INICIO_CONTROLE)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Bloco 1: OUT (Serviço Externo) */}
                <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="flex items-center gap-2">
                      <Truck className="size-4 text-primary" />
                      <span className="font-semibold text-sm">OUT · Serviço Externo</span>
                    </div>
                    <Badge variant="default" className="text-xs">
                      {m.pedidosOut} pedido(s)
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Faturamento bruto:</span>
                      <span className="font-medium">{brl(m.receitaOut)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Custos diretos & impostos:</span>
                      <span className="font-medium text-destructive">{brl(m.custoTotalOut)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lucro bruto:</span>
                      <span className="font-medium text-success">{brl(m.lucroBrutoOut)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Margem de lucro:</span>
                      <span className="font-medium">{m.margemLucroOut.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 bg-primary/5 px-2 py-1 rounded">
                      <span className="font-medium text-primary">
                        Ticket médio exclusivo (AOV):
                      </span>
                      <span className="font-bold text-primary">{brl(m.aov)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>ROI do segmento:</span>
                      <span className="font-medium text-foreground">{m.roiOut.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* Bloco 2: IN (Balcão) */}
                <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="flex items-center gap-2">
                      <Store className="size-4 text-emerald-600" />
                      <span className="font-semibold text-sm">IN · Balcão</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {m.pedidosIn} pedido(s)
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Faturamento bruto:</span>
                      <span className="font-medium">{brl(m.receitaIn)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Custos variáveis (CMV/frete):</span>
                      <span className="font-medium text-destructive">{brl(m.custoVariavelIn)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-1 bg-emerald-500/10 px-2 py-1 rounded">
                      <span className="font-medium text-emerald-700 dark:text-emerald-300">
                        Margem de contribuição:
                      </span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">
                        {m.margemContribuicaoInPerc.toFixed(1)}% ({brl(m.margemContribuicaoInValor)}
                        )
                      </span>
                    </div>
                    <div className="flex justify-between bg-emerald-500/10 px-2 py-1 rounded">
                      <span className="font-medium text-emerald-700 dark:text-emerald-300">
                        Margem de lucro líquido:
                      </span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">
                        {m.margemLucroInPerc.toFixed(1)}% ({brl(m.lucroIn)})
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-1 text-xs text-muted-foreground">
                      <span>Ticket médio:</span>
                      <span className="italic text-muted-foreground">
                        Não computado (exclusivo para OUT)
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Retorno sobre custos (IN):</span>
                      <span className="font-medium text-foreground">{m.roiIn.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloco 3: Impacto Integrado nos Dashboards de ROI, EBITDA e Fluxo de Caixa */}
              <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Wallet className="size-4 text-primary" />
                  Impacto Consolidado no Fluxo de Caixa, ROI e EBITDA
                </div>
                <div className="grid gap-2 text-sm sm:grid-cols-3">
                  <div className="rounded border border-border p-2.5 bg-muted/10">
                    <p className="text-xs text-muted-foreground">Fluxo de Caixa Realizado</p>
                    <p
                      className={`text-base font-bold ${m.saldoFluxoCaixa >= 0 ? "text-success" : "text-destructive"}`}
                    >
                      {brl(m.saldoFluxoCaixa)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Entradas {brl(m.entradasRealizadas)} · Saídas {brl(m.saidasRealizadas)}
                    </p>
                  </div>
                  <div className="rounded border border-border p-2.5 bg-muted/10">
                    <p className="text-xs text-muted-foreground">EBITDA da Operação</p>
                    <p
                      className={`text-base font-bold ${m.ebitda >= 0 ? "text-success" : "text-destructive"}`}
                    >
                      {brl(m.ebitda)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Margem EBITDA {m.margemEbitda.toFixed(1)}% · Fora {brl(m.foraEbitda)}
                    </p>
                  </div>
                  <div className="rounded border border-border p-2.5 bg-muted/10">
                    <p className="text-xs text-muted-foreground">ROI Operacional Global</p>
                    <p
                      className={`text-base font-bold ${m.roi >= 20 ? "text-success" : m.roi >= 0 ? "text-warning" : "text-destructive"}`}
                    >
                      {m.roi.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Lucro {brl(m.lucroConsolidado)} sobre custos de {brl(m.custosTotaisOperacao)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Autoanálise Inteligente */}
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

          {/* Regras e Fórmulas de Cálculo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Como cada indicador é calculado</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <p>
                <strong className="text-foreground">Processamento retroativo:</strong> abrange todos
                os pedidos registrados a partir de 04/09/2026, com segregação estrita entre balcão e
                serviço externo.
              </p>
              <p>
                <strong className="text-foreground">Ticket médio (AOV):</strong> valor total dos
                pedidos OUT ÷ quantidade de pedidos OUT. Aplicado <em>exclusivamente</em> a pedidos
                classificados como serviço externo.
              </p>
              <p>
                <strong className="text-foreground">Margem de contribuição (Balcão):</strong>{" "}
                apurada apenas para pedidos IN (faturamento de balcão menos custos variáveis
                diretos).
              </p>
              <p>
                <strong className="text-foreground">Margem de lucro (Balcão):</strong> lucro líquido
                dos pedidos IN ÷ faturamento de balcão. Não possui cálculo de ticket médio.
              </p>
              <p>
                <strong className="text-foreground">ROI Consolidado:</strong> lucro líquido
                operacional ÷ soma de todos os custos de produtos, impostos e despesas operacionais
                × 100.
              </p>
              <p>
                <strong className="text-foreground">EBITDA:</strong> lucro operacional consolidado
                somando de volta impostos de vendas, juros e depreciações do fluxo.
              </p>
              <p>
                <strong className="text-foreground">Saldo do Fluxo de Caixa:</strong> entradas
                realizadas (receitas e títulos quitados) − saídas realizadas (despesas e pagamentos
                quitados).
              </p>
              <p>
                <strong className="text-foreground">Runway:</strong> saldo bancário informado ÷
                consumo líquido mensal apurado pelo fluxo corrigido.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
