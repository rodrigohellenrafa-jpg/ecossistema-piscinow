import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownCircle, ArrowUpCircle, Search } from "lucide-react";

import { Kpi, PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  TableFooter,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR } from "@/lib/erp";

export const Route = createFileRoute("/movimentacoes")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Movimentações Financeiras | Piscinow ERP" },
      {
        name: "description",
        content:
          "Todas as entradas e saídas do sistema — realizadas e previstas — com origem, conta, sentido e filtros de busca.",
      },
      { property: "og:title", content: "Movimentações Financeiras | Piscinow ERP" },
      {
        property: "og:description",
        content: "Extrato único de entradas e saídas, já pagas ou a vencer, da Piscinow.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Movimentacoes />
    </RequireAuth>
  ),
});

type Linha = {
  id: string;
  data: string;
  descricao: string;
  parceiro: string;
  origem: string;
  categoria: string;
  conta: string;
  sentido: "entrada" | "saida";
  valor: number;
  realizado: boolean;
  link?: string;
};

export function Movimentacoes() {
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");
  const [sentido, setSentido] = useState("todos");
  const [situacao, setSituacao] = useState("todos");
  const [origem, setOrigem] = useState("todas");
  const [conta, setConta] = useState("todas");
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");

  useEffect(() => {
    const atualizar = () => {
      qc.invalidateQueries({ queryKey: ["contas"] });
      qc.invalidateQueries({ queryKey: ["lancamentos_financeiros"] });
      qc.invalidateQueries({ queryKey: ["saldos-bancarios"] });
    };
    const canal = supabase
      .channel("movimentacoes-financeiras")
      .on("postgres_changes", { event: "*", schema: "public", table: "contas" }, atualizar)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lancamentos_financeiros" },
        atualizar,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "saldos_bancarios" },
        atualizar,
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(canal);
    };
  }, [qc]);

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

  const { data: saldos = [] } = useQuery({
    queryKey: ["saldos-bancarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saldos_bancarios")
        .select("conta, saldo")
        .order("conta");
      if (error) throw error;
      return data;
    },
  });

  const linhas = useMemo<Linha[]>(() => {
    const lista: Linha[] = [];

    // Vendas que já possuem lançamento registrado no livro caixa / lançamentos
    const vendasEmLancamentos = new Set<string>();
    for (const l of lancamentos as unknown as Record<string, string | number | null>[]) {
      if (l.venda_id && l.status !== "Cancelado") {
        vendasEmLancamentos.add(String(l.venda_id));
      }
    }

    for (const c of contas as unknown as Record<string, string | number | null>[]) {
      // Não duplica receitas de vendas que já têm lançamento financeiro
      if (c.venda_id && c.tipo === "receber" && vendasEmLancamentos.has(String(c.venda_id))) {
        continue;
      }

      const pago = c.status === "pago";
      lista.push({
        id: `conta-${c.id}`,
        data: String(pago ? (c.data_pagamento ?? c.vencimento) : c.vencimento).slice(0, 10),
        descricao: String(c.descricao ?? "—"),
        parceiro: String(c.parceiro ?? "—"),
        origem: c.tipo === "receber" ? "Conta a receber" : "Conta a pagar",
        categoria: String(c.categoria ?? "—"),
        conta: String(c.conta_bancaria ?? "—"),
        sentido: c.tipo === "receber" ? "entrada" : "saida",
        valor: Number((pago ? c.valor_pago : null) || c.valor || 0),
        realizado: pago,
        link: "/contas",
      });
    }

    for (const l of lancamentos as unknown as Record<string, string | number | null>[]) {
      if (l.status === "Cancelado") continue;
      const pago = l.status === "Pago";
      const receita = l.tipo_fluxo === "receita" || l.tipo_fluxo === "entrada";
      lista.push({
        id: `lanc-${l.id}`,
        data: String((pago ? l.data_pagamento : null) ?? l.vencimento ?? l.data_competencia).slice(
          0,
          10,
        ),
        descricao: String(l.descricao ?? "—"),
        parceiro: "—",
        origem: receita ? "Receita lançada" : "Despesa lançada",
        categoria: String(l.categoria ?? "—"),
        conta: String(l.conta_bancaria ?? "—"),
        sentido: receita ? "entrada" : "saida",
        valor: Number(l.valor ?? 0),
        realizado: pago,
        link: "/financeiro",
      });
    }

    return lista.sort((a, b) => (a.data < b.data ? 1 : -1));
  }, [contas, lancamentos]);

  const origens = useMemo(() => Array.from(new Set(linhas.map((l) => l.origem))).sort(), [linhas]);
  const contasLista = useMemo(
    () => Array.from(new Set(linhas.map((l) => l.conta).filter((c) => c && c !== "—"))).sort(),
    [linhas],
  );

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return linhas.filter((l) => {
      if (sentido !== "todos" && l.sentido !== sentido) return false;
      if (situacao === "realizado" && !l.realizado) return false;
      if (situacao === "previsto" && l.realizado) return false;
      if (origem !== "todas" && l.origem !== origem) return false;
      if (conta !== "todas" && l.conta !== conta) return false;
      if (de && l.data < de) return false;
      if (ate && l.data > ate) return false;
      if (
        termo &&
        !`${l.descricao} ${l.parceiro} ${l.categoria} ${l.conta} ${l.origem}`
          .toLowerCase()
          .includes(termo)
      )
        return false;
      return true;
    });
  }, [linhas, busca, sentido, situacao, origem, conta, de, ate]);

  const soma = (fn: (l: Linha) => boolean) =>
    filtradas.filter(fn).reduce((acc, l) => acc + l.valor, 0);

  const entradasReal = soma((l) => l.sentido === "entrada" && l.realizado);
  const saidasReal = soma((l) => l.sentido === "saida" && l.realizado);
  const entradasPrev = soma((l) => l.sentido === "entrada" && !l.realizado);
  const saidasPrev = soma((l) => l.sentido === "saida" && !l.realizado);
  const totalEntradas = soma((l) => l.sentido === "entrada");
  const totalSaidas = soma((l) => l.sentido === "saida");
  const saldoPeriodo = totalEntradas - totalSaidas;
  const periodoRotulo =
    de || ate
      ? `${de ? dataBR(de) : "início"} a ${ate ? dataBR(ate) : "hoje"}`
      : "todos os períodos";
  const saldoBancos = (saldos as { conta: string; saldo: number }[]).reduce(
    (acc, s) => acc + Number(s.saldo ?? 0),
    0,
  );

  const limpar = () => {
    setBusca("");
    setSentido("todos");
    setSituacao("todos");
    setOrigem("todas");
    setConta("todas");
    setDe("");
    setAte("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Movimentações"
        subtitle="Tudo que entra e sai do sistema — já realizado ou ainda previsto."
        actions={
          <Button variant="outline" asChild>
            <Link to="/fluxo-caixa">Fluxo de caixa</Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi
          label="Entradas realizadas"
          value={brl(entradasReal)}
          tone="positive"
          hint={`período: ${periodoRotulo}`}
        />
        <Kpi
          label="Saídas realizadas"
          value={brl(saidasReal)}
          tone="negative"
          hint={`período: ${periodoRotulo}`}
        />
        <Kpi label="Entradas previstas" value={brl(entradasPrev)} hint="ainda não recebidas" />
        <Kpi label="Saídas previstas" value={brl(saidasPrev)} hint="ainda não pagas" />
        <Kpi
          label="Saldo em conta"
          value={brl(saldoBancos)}
          tone={saldoBancos >= 0 ? "positive" : "negative"}
          hint="só muda quando é pago/recebido"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros de busca</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Buscar por descrição, parceiro, categoria ou conta"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <Select value={sentido} onValueChange={setSentido}>
            <SelectTrigger>
              <SelectValue placeholder="Sentido" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Entradas e saídas</SelectItem>
              <SelectItem value="entrada">Só entradas</SelectItem>
              <SelectItem value="saida">Só saídas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={situacao} onValueChange={setSituacao}>
            <SelectTrigger>
              <SelectValue placeholder="Situação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Realizado e previsto</SelectItem>
              <SelectItem value="realizado">Só realizado</SelectItem>
              <SelectItem value="previsto">Só previsto</SelectItem>
            </SelectContent>
          </Select>
          <Select value={origem} onValueChange={setOrigem}>
            <SelectTrigger>
              <SelectValue placeholder="Origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as origens</SelectItem>
              {origens.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={conta} onValueChange={setConta}>
            <SelectTrigger>
              <SelectValue placeholder="Conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as contas</SelectItem>
              {contasLista.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Input type="date" value={de} onChange={(e) => setDe(e.target.value)} />
            <span className="text-sm text-muted-foreground">até</span>
            <Input type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
          </div>
          <Button variant="ghost" onClick={limpar}>
            Limpar filtros
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {filtradas.length} movimentação{filtradas.length === 1 ? "" : "ões"}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Parceiro</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Entrada</TableHead>
                <TableHead className="text-right">Saída</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtradas.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="whitespace-nowrap">{dataBR(l.data)}</TableCell>
                  <TableCell className="max-w-[280px]">
                    {l.link ? (
                      <Link to={l.link} className="hover:underline">
                        {l.descricao}
                      </Link>
                    ) : (
                      l.descricao
                    )}
                  </TableCell>
                  <TableCell>{l.parceiro}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      {l.sentido === "entrada" ? (
                        <ArrowUpCircle className="h-4 w-4 text-success" />
                      ) : (
                        <ArrowDownCircle className="h-4 w-4 text-destructive" />
                      )}
                      {l.origem}
                    </span>
                  </TableCell>
                  <TableCell>{l.categoria}</TableCell>
                  <TableCell>{l.conta}</TableCell>
                  <TableCell>
                    <Badge variant={l.realizado ? "default" : "outline"}>
                      {l.realizado ? "Realizado" : "Previsto"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-success">
                    {l.sentido === "entrada" ? brl(l.valor) : "—"}
                  </TableCell>
                  <TableCell className="text-right text-destructive">
                    {l.sentido === "saida" ? brl(l.valor) : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {filtradas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    Nenhuma movimentação com esses filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {filtradas.length > 0 && (
              <TableFooter>
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell colSpan={7} className="whitespace-nowrap">
                    Total do período ({periodoRotulo})
                  </TableCell>
                  <TableCell className="text-right text-success">{brl(totalEntradas)}</TableCell>
                  <TableCell className="text-right text-destructive">{brl(totalSaidas)}</TableCell>
                </TableRow>
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell colSpan={8} className="whitespace-nowrap">
                    Saldo do período (entradas − saídas)
                  </TableCell>
                  <TableCell
                    className={`text-right ${saldoPeriodo >= 0 ? "text-success" : "text-destructive"}`}
                  >
                    {brl(saldoPeriodo)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
