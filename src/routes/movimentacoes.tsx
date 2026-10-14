import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  Loader2,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Kpi, PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  agruparDuplicidadesMovimentacoes,
  excluirDuplicidadesEmLote,
  excluirMovimentacaoPermanente,
  type LinhaMovimentacao,
} from "@/lib/exclusao-movimentacao";

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

export type Linha = LinhaMovimentacao;

export function Movimentacoes() {
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");
  const [sentido, setSentido] = useState("todos");
  const [situacao, setSituacao] = useState("todos");
  const [origem, setOrigem] = useState("todas");
  const [conta, setConta] = useState("todas");
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");

  const [itemParaExcluir, setItemParaExcluir] = useState<Linha | null>(null);
  const [modalDuplicidadesAberto, setModalDuplicidadesAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [excluindoLote, setExcluindoLote] = useState(false);

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
      // Não duplica receitas de vendas que já têm lançamento financeiro no fluxo
      if (c.venda_id && c.tipo === "receber" && vendasEmLancamentos.has(String(c.venda_id))) {
        continue;
      }

      const pago = c.status === "pago";
      const valorLiquid = pago
        ? Number(c.valor_pago) > 0
          ? Number(c.valor_pago)
          : Number(c.valor || 0)
        : Number(c.valor || 0);
      const retencao = Number(c.valor_desconto || 0);

      lista.push({
        id: `conta-${c.id}`,
        rawId: String(c.id),
        tipoRegistro: "conta",
        data: String(pago ? (c.data_pagamento ?? c.vencimento) : c.vencimento).slice(0, 10),
        descricao:
          retencao > 0.009
            ? `${String(c.descricao ?? "—")} (Líq. ${brl(valorLiquid)} | Retenção: ${brl(retencao)})`
            : String(c.descricao ?? "—"),
        parceiro: String(c.parceiro ?? "—"),
        origem: c.tipo === "receber" ? "Conta a receber" : "Conta a pagar",
        categoria: String(c.categoria ?? "—"),
        conta: String(c.conta_bancaria ?? "—"),
        sentido: c.tipo === "receber" ? "entrada" : "saida",
        valor: valorLiquid,
        realizado: pago,
        link: "/contas",
        vendaId: c.venda_id ? String(c.venda_id) : null,
      });
    }

    for (const l of lancamentos as unknown as Record<string, string | number | null>[]) {
      if (l.status === "Cancelado") continue;
      const pago = l.status === "Pago";
      const receita = l.tipo_fluxo === "receita" || l.tipo_fluxo === "entrada";
      lista.push({
        id: `lanc-${l.id}`,
        rawId: String(l.id),
        tipoRegistro: "lancamento",
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
        vendaId: l.venda_id ? String(l.venda_id) : null,
      });
    }

    return lista.sort((a, b) => (a.data < b.data ? 1 : -1));
  }, [contas, lancamentos]);

  // Agrupamento de possíveis duplicidades
  const gruposDuplicados = useMemo(() => {
    return agruparDuplicidadesMovimentacoes(linhas);
  }, [linhas]);

  const todosItensDuplicados = useMemo(() => {
    return gruposDuplicados.flatMap((g) => g.duplicados);
  }, [gruposDuplicados]);

  const idsDuplicados = useMemo(() => {
    return new Set(todosItensDuplicados.map((d) => d.id));
  }, [todosItensDuplicados]);

  const linhasComFlag = useMemo(() => {
    return linhas.map((l) => ({
      ...l,
      ehDuplicado: idsDuplicados.has(l.id),
    }));
  }, [linhas, idsDuplicados]);

  const origens = useMemo(
    () => Array.from(new Set(linhasComFlag.map((l) => l.origem))).sort(),
    [linhasComFlag],
  );
  const contasLista = useMemo(
    () =>
      Array.from(
        new Set(linhasComFlag.map((l) => l.conta).filter((c) => c && c !== "—")),
      ).sort(),
    [linhasComFlag],
  );

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return linhasComFlag.filter((l) => {
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
  }, [linhasComFlag, busca, sentido, situacao, origem, conta, de, ate]);

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

  const handleConfirmarExclusaoUnica = async () => {
    if (!itemParaExcluir) return;
    try {
      setExcluindo(true);
      await excluirMovimentacaoPermanente(
        {
          id: itemParaExcluir.rawId,
          tipo: itemParaExcluir.tipoRegistro,
          descricao: itemParaExcluir.descricao,
          valor: itemParaExcluir.valor,
          contaBancaria: itemParaExcluir.conta,
          sentido: itemParaExcluir.sentido,
          realizado: itemParaExcluir.realizado,
          vendaId: itemParaExcluir.vendaId,
        },
        qc,
      );
      toast.success("Registro removido permanentemente e saldo atualizado imediatamente!");
      setItemParaExcluir(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao excluir registro.");
    } finally {
      setExcluindo(false);
    }
  };

  const handleExcluirTodosDuplicados = async () => {
    if (todosItensDuplicados.length === 0) return;
    try {
      setExcluindoLote(true);
      const res = await excluirDuplicidadesEmLote(todosItensDuplicados, qc);
      toast.success(
        `${res.removidos} lançamento(s) duplicado(s) removido(s) com sucesso! Saldo recalculado.`,
      );
      setModalDuplicidadesAberto(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao excluir duplicados em lote.");
    } finally {
      setExcluindoLote(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Movimentações"
        subtitle="Tudo que entra e sai do sistema — já realizado ou ainda previsto."
        actions={
          <div className="flex items-center gap-2">
            {idsDuplicados.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5 shadow-sm"
                onClick={() => setModalDuplicidadesAberto(true)}
              >
                <Trash2 className="size-4" />
                Limpar Duplicados ({idsDuplicados.size})
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link to="/fluxo-caixa">Fluxo de caixa</Link>
            </Button>
          </div>
        }
      />

      {/* Alerta de Lançamentos Duplicados Detectados */}
      {idsDuplicados.size > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3.5 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="font-semibold">Lançamentos duplicados identificados:</span> Existem{" "}
              {idsDuplicados.size} registros concorrentes que podem distorcer o saldo bancário e o
              faturamento.
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setModalDuplicidadesAberto(true)}
            className="shrink-0 gap-1.5 shadow-sm"
          >
            <Trash2 className="size-4" />
            Revisar e Excluir Duplicados ({idsDuplicados.size})
          </Button>
        </div>
      )}

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
          hint="atualizado em tempo real"
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
          <Table className="min-w-[1050px]">
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
                <TableHead className="w-[90px] text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtradas.map((l) => (
                <TableRow
                  key={l.id}
                  className={l.ehDuplicado ? "bg-amber-50/40 dark:bg-amber-950/20" : undefined}
                >
                  <TableCell className="whitespace-nowrap">{dataBR(l.data)}</TableCell>
                  <TableCell className="max-w-[280px]">
                    <div className="flex flex-col gap-0.5">
                      {l.link ? (
                        <Link to={l.link} className="hover:underline">
                          {l.descricao}
                        </Link>
                      ) : (
                        l.descricao
                      )}
                    </div>
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
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {l.ehDuplicado && (
                        <Badge
                          variant="outline"
                          className="border-amber-500/50 bg-amber-500/15 text-[10px] text-amber-700 dark:text-amber-300"
                          title="Lançamento com duplicidade detectada"
                        >
                          Duplicado
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                        title="Excluir lançamento permanentemente"
                        onClick={() => setItemParaExcluir(l)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtradas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
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
                  <TableCell />
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
                  <TableCell />
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Confirmação de Exclusão Individual */}
      <Dialog
        open={Boolean(itemParaExcluir)}
        onOpenChange={(aberto) => !aberto && !excluindo && setItemParaExcluir(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5" /> Excluir permanentemente?
            </DialogTitle>
            <DialogDescription>
              Esta operação removerá definitivamente este registro do banco de dados e atualizará o
              saldo da conta bancária imediatamente.
            </DialogDescription>
          </DialogHeader>

          {itemParaExcluir && (
            <div className="space-y-2.5 rounded-lg border bg-muted/40 p-4 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descrição:</span>
                <span className="font-semibold text-foreground text-right">
                  {itemParaExcluir.descricao}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor:</span>
                <span className="text-base font-bold text-foreground tabular-nums">
                  {brl(itemParaExcluir.valor)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data:</span>
                <span>{dataBR(itemParaExcluir.data)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Conta Bancária:</span>
                <span className="font-medium">{itemParaExcluir.conta}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Origem do Registro:</span>
                <span>{itemParaExcluir.origem}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Situação:</span>
                <Badge variant={itemParaExcluir.realizado ? "default" : "outline"}>
                  {itemParaExcluir.realizado ? "Realizado (estorna saldo bancário)" : "Previsto"}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={excluindo}
              onClick={() => setItemParaExcluir(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={excluindo}
              onClick={handleConfirmarExclusaoUnica}
              className="gap-2"
            >
              {excluindo ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Excluindo...
                </>
              ) : (
                "Sim, excluir permanentemente"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Gestão e Exclusão em Lote de Lançamentos Duplicados */}
      <Dialog
        open={modalDuplicidadesAberto}
        onOpenChange={(aberto) => !aberto && !excluindoLote && setModalDuplicidadesAberto(false)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-5" /> Lançamentos Duplicados Detectados (
              {idsDuplicados.size})
            </DialogTitle>
            <DialogDescription>
              Abaixo estão os grupos de lançamentos que possuem a mesma data, valor, pedido de venda
              ou conta. Você pode excluir os registros duplicados mantendo o lançamento original.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {gruposDuplicados.map((grupo, gIdx) => (
              <div
                key={grupo.id}
                className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Grupo {gIdx + 1}: {grupo.criterio}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Excedente: {brl(grupo.totalDuplicado)}
                  </Badge>
                </div>

                {/* Registro Principal (Mantido) */}
                <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs sm:text-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="size-4" /> Lançamento Original (Será mantido)
                    </span>
                    <Badge variant="outline" className="text-emerald-700 dark:text-emerald-300">
                      {grupo.principal.origem}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-muted-foreground">
                    <div>
                      <span className="text-[11px] block">Data:</span>
                      <strong className="text-foreground">{dataBR(grupo.principal.data)}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] block">Valor:</span>
                      <strong className="text-foreground tabular-nums">
                        {brl(grupo.principal.valor)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[11px] block">Conta:</span>
                      <strong className="text-foreground">{grupo.principal.conta}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] block">Situação:</span>
                      <strong className="text-foreground">
                        {grupo.principal.realizado ? "Realizado" : "Previsto"}
                      </strong>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-foreground/80 truncate">
                    {grupo.principal.descricao}
                  </p>
                </div>

                {/* Registros Duplicados (Marcados para exclusão) */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-destructive">
                    Registros duplicados que devem ser excluídos permanentemente:
                  </span>
                  {grupo.duplicados.map((dup) => (
                    <div
                      key={dup.id}
                      className="flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs sm:text-sm"
                    >
                      <div className="space-y-0.5 max-w-[75%]">
                        <div className="flex items-center gap-2">
                          <strong className="text-foreground">{brl(dup.valor)}</strong>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">{dataBR(dup.data)}</span>
                          <span className="text-muted-foreground">·</span>
                          <Badge variant="outline" className="text-[10px]">
                            {dup.origem}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{dup.descricao}</p>
                      </div>

                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={excluindoLote}
                        onClick={async () => {
                          try {
                            await excluirMovimentacaoPermanente(
                              {
                                id: dup.rawId,
                                tipo: dup.tipoRegistro,
                                descricao: dup.descricao,
                                valor: dup.valor,
                                contaBancaria: dup.conta,
                                sentido: dup.sentido,
                                realizado: dup.realizado,
                                vendaId: dup.vendaId,
                              },
                              qc,
                            );
                            toast.success("Duplicado excluído e saldo atualizado!");
                          } catch (e) {
                            toast.error(
                              e instanceof Error ? e.message : "Erro ao excluir duplicado.",
                            );
                          }
                        }}
                        className="gap-1 h-8 px-2.5 text-xs"
                      >
                        <Trash2 className="size-3.5" /> Excluir Este
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {gruposDuplicados.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhum lançamento duplicado encontrado no momento.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={excluindoLote}
              onClick={() => setModalDuplicidadesAberto(false)}
            >
              Fechar
            </Button>
            {todosItensDuplicados.length > 0 && (
              <Button
                type="button"
                variant="destructive"
                disabled={excluindoLote}
                onClick={handleExcluirTodosDuplicados}
                className="gap-2"
              >
                {excluindoLote ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Excluindo todos...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4" /> Excluir Todos os Duplicados (
                    {todosItensDuplicados.length})
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
