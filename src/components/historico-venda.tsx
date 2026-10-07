/**
 * Histórico da venda em formato de extrato bancário.
 *
 * Cada linha é um evento do pedido/obra: pode ser só uma anotação (sem valor)
 * ou um evento financeiro (entrada/saída). O extrato mostra saldo acumulado e
 * totais por obra, e permite programar chamados recorrentes ligados ao cliente.
 */
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpandableCard } from "@/components/expandable-card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR, hojeISO, num } from "@/lib/erp";
import { useAuth } from "@/hooks/use-auth";

export const TIPOS_HISTORICO = [
  { valor: "anotacao", label: "Anotação" },
  { valor: "chamado", label: "Chamado / assistência" },
  { valor: "visita", label: "Visita técnica" },
  { valor: "manutencao", label: "Manutenção" },
  { valor: "custo", label: "Custo da obra" },
  { valor: "receita", label: "Recebimento" },
] as const;

const RECORRENCIAS = [
  { valor: "nenhuma", label: "Não se repete" },
  { valor: "mensal", label: "Mensal" },
  { valor: "trimestral", label: "Trimestral" },
  { valor: "semestral", label: "Semestral" },
  { valor: "anual", label: "Anual" },
] as const;

const MESES_RECORRENCIA: Record<string, number> = {
  mensal: 1,
  trimestral: 3,
  semestral: 6,
  anual: 12,
};

/** Soma meses a uma data ISO (YYYY-MM-DD). */
const somarMeses = (iso: string, meses: number) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setMonth(d.getMonth() + meses);
  return d.toISOString().slice(0, 10);
};

interface Props {
  vendaId: string;
  clienteId: string | null;
  clienteNome: string | null;
  itens: Array<{
    id: string;
    descricao: string;
    quantidade: number;
    custo_unitario: number | null;
    preco_unitario?: number | null;
  }>;
}

interface FormState {
  data: string;
  tipo: string;
  descricao: string;
  natureza: "neutro" | "entrada" | "saida";
  valor: string;
  obra_id: string;
  recorrencia: string;
  proxima_data: string;
  observacoes: string;
}

const formVazio = (): FormState => ({
  data: hojeISO(),
  tipo: "anotacao",
  descricao: "",
  natureza: "neutro",
  valor: "",
  obra_id: "",
  recorrencia: "nenhuma",
  proxima_data: "",
  observacoes: "",
});

export function HistoricoVenda({ vendaId, clienteId, clienteNome, itens }: Props) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(formVazio);
  const [filtroObra, setFiltroObra] = useState("todas");
  const [custosEditados, setCustosEditados] = useState<Record<string, string>>({});
  const [extrasEditados, setExtrasEditados] = useState<Record<string, string>>({});
  const [acessoriosEditados, setAcessoriosEditados] = useState<Record<string, string>>({});
  const [addAcessorioAberto, setAddAcessorioAberto] = useState(false);
  const [novoAcessorioNome, setNovoAcessorioNome] = useState("");
  const [novoAcessorioValor, setNovoAcessorioValor] = useState("");

  const { data: kit } = useQuery({
    queryKey: ["venda-kit", vendaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venda_kit")
        .select("*")
        .eq("venda_id", vendaId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const acessoriosKit = useMemo(() => {
    if (!kit?.acessorios || !Array.isArray(kit.acessorios)) return [];
    return kit.acessorios as Array<{
      produto_id?: string;
      nome: string;
      valor: number;
    }>;
  }, [kit?.acessorios]);

  const { data: obras = [] } = useQuery({
    queryKey: ["historico-obras", vendaId, clienteId],
    queryFn: async () => {
      let q = supabase.from("obras").select("id, numero, tipo_servico, venda_id, cliente_id");
      q = clienteId ? q.or(`venda_id.eq.${vendaId},cliente_id.eq.${clienteId}`) : q.eq("venda_id", vendaId);
      const { data, error } = await q.order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const { data: lancamentos = [] } = useQuery({
    queryKey: ["historico-venda", vendaId, clienteId],
    queryFn: async () => {
      // Mostra o histórico do pedido e também o do cliente (lançamentos
      // financeiros vinculados apenas ao cliente, sem pedido).
      const filtro = clienteId
        ? `venda_id.eq.${vendaId},and(venda_id.is.null,cliente_id.eq.${clienteId})`
        : null;
      let q = supabase.from("venda_historico").select("*");
      q = filtro ? q.or(filtro) : q.eq("venda_id", vendaId);
      const { data, error } = await q.order("data").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const { data: pagamentos = [] } = useQuery({
    queryKey: ["historico-venda-pagamentos", vendaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venda_pagamentos")
        .select("valor, valor_origem, retencao_financeira")
        .eq("venda_id", vendaId);
      if (error) throw error;
      return data;
    },
  });

  const { data: venda } = useQuery({
    queryKey: ["historico-venda-dados", vendaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendas")
        .select("id, valor_frete, valor_mao_obra, valor_impostos")
        .eq("id", vendaId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });


  const salvar = useMutation({
    mutationFn: async () => {
      if (!form.descricao.trim()) throw new Error("Descreva o que aconteceu.");
      const valor = form.natureza === "neutro" ? 0 : num(form.valor);
      if (form.natureza !== "neutro" && valor <= 0)
        throw new Error("Informe o valor do movimento ou marque como registro sem valor.");

      const meses = MESES_RECORRENCIA[form.recorrencia];
      const proxima =
        form.proxima_data || (meses ? somarMeses(form.data, meses) : null);

      const { error } = await supabase.from("venda_historico").insert({
        venda_id: vendaId,
        cliente_id: clienteId,
        obra_id: form.obra_id || null,
        data: form.data,
        tipo: form.tipo,
        descricao: form.descricao.trim(),
        natureza: form.natureza,
        valor,
        recorrencia: form.recorrencia,
        proxima_data: proxima,
        observacoes: form.observacoes.trim() || null,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Histórico registrado.");
      setForm(formVazio());
      qc.invalidateQueries({ queryKey: ["historico-venda", vendaId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("venda_historico").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Registro removido.");
      qc.invalidateQueries({ queryKey: ["historico-venda", vendaId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const salvarCustoItem = useMutation({
    mutationFn: async ({
      itemId,
      valorTotal,
      qtd,
    }: {
      itemId: string;
      valorTotal: string;
      qtd: number;
    }) => {
      const total = num(valorTotal);
      if (total < 0) throw new Error("O valor cadastrado não pode ser negativo.");
      const unitario = qtd > 0 ? total / qtd : 0;
      const { error } = await supabase
        .from("venda_itens")
        .update({ custo_unitario: unitario })
        .eq("id", itemId)
        .eq("venda_id", vendaId);
      if (error) throw error;
    },
    onSuccess: (_, variaveis) => {
      toast.success("Valor cadastrado atualizado. O lucro foi recalculado.");
      setCustosEditados((atual) => {
        const proximo = { ...atual };
        delete proximo[variaveis.itemId];
        return proximo;
      });
      qc.invalidateQueries({ queryKey: ["venda-itens", vendaId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const salvarExtra = useMutation({
    mutationFn: async ({ campo, valor }: { campo: "frete" | "mao_obra" | "imposto"; valor: string }) => {
      const v = num(valor);
      if (v < 0) throw new Error("O valor não pode ser negativo.");
      const atualizacao =
        campo === "frete"
          ? { valor_frete: v }
          : campo === "mao_obra"
            ? { valor_mao_obra: v }
            : { valor_impostos: v };
      const { error } = await supabase.from("vendas").update(atualizacao).eq("id", vendaId);
      if (error) throw error;
    },
    onSuccess: (_, variaveis) => {
      toast.success("Valor atualizado. O lucro foi recalculado.");
      setExtrasEditados((atual) => {
        const proximo = { ...atual };
        delete proximo[variaveis.campo];
        return proximo;
      });
      qc.invalidateQueries({ queryKey: ["historico-venda-dados", vendaId] });
      qc.invalidateQueries({ queryKey: ["venda", vendaId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const salvarCustoAcessorio = useMutation({
    mutationFn: async ({ index, valorTotal }: { index: number; valorTotal: string }) => {
      if (!kit?.id) return;
      const v = num(valorTotal);
      if (v < 0) throw new Error("O valor não pode ser negativo.");
      const novos = [...acessoriosKit];
      const antigoValor = Number(novos[index]?.valor ?? 0);
      novos[index] = { ...novos[index], valor: v };
      const novoTotalKit = Number(kit.custo_total_kit ?? 0) - antigoValor + v;
      const { error } = await supabase
        .from("venda_kit")
        .update({ acessorios: novos, custo_total_kit: novoTotalKit })
        .eq("id", kit.id);
      if (error) throw error;
    },
    onSuccess: (_, variaveis) => {
      toast.success("Custo do acessório atualizado.");
      setAcessoriosEditados((atual) => {
        const proximo = { ...atual };
        delete proximo[String(variaveis.index)];
        return proximo;
      });
      qc.invalidateQueries({ queryKey: ["venda-kit", vendaId] });
      qc.invalidateQueries({ queryKey: ["venda", vendaId] });
      qc.invalidateQueries({ queryKey: ["pedido-comparativo", vendaId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const adicionarAcessorio = useMutation({
    mutationFn: async ({ nome, valor }: { nome: string; valor: number }) => {
      if (!nome.trim()) throw new Error("Informe o nome do acessório.");
      if (valor < 0) throw new Error("O valor não pode ser negativo.");
      const novos = [...acessoriosKit, { nome: nome.trim(), valor }];
      if (kit?.id) {
        const novoTotalKit = Number(kit.custo_total_kit ?? 0) + valor;
        const { error } = await supabase
          .from("venda_kit")
          .update({ acessorios: novos, custo_total_kit: novoTotalKit })
          .eq("id", kit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("venda_kit").insert({
          venda_id: vendaId,
          acessorios: novos,
          custo_frete: Number(venda?.valor_frete ?? 0),
          custo_mao_obra: Number(venda?.valor_mao_obra ?? 0),
          impostos: Number(venda?.valor_impostos ?? 0),
          custo_total_kit: valor,
          preco_venda_kit: 0,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Acessório adicionado ao multipartido.");
      setNovoAcessorioNome("");
      setNovoAcessorioValor("");
      setAddAcessorioAberto(false);
      qc.invalidateQueries({ queryKey: ["venda-kit", vendaId] });
      qc.invalidateQueries({ queryKey: ["venda", vendaId] });
      qc.invalidateQueries({ queryKey: ["pedido-comparativo", vendaId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removerAcessorio = useMutation({
    mutationFn: async (index: number) => {
      if (!kit?.id) return;
      const removidoValor = Number(acessoriosKit[index]?.valor ?? 0);
      const novos = acessoriosKit.filter((_, i) => i !== index);
      const novoTotalKit = Math.max(0, Number(kit.custo_total_kit ?? 0) - removidoValor);
      const { error } = await supabase
        .from("venda_kit")
        .update({ acessorios: novos, custo_total_kit: novoTotalKit })
        .eq("id", kit.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Acessório removido.");
      qc.invalidateQueries({ queryKey: ["venda-kit", vendaId] });
      qc.invalidateQueries({ queryKey: ["venda", vendaId] });
      qc.invalidateQueries({ queryKey: ["pedido-comparativo", vendaId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtrados = useMemo(
    () =>
      filtroObra === "todas"
        ? lancamentos
        : filtroObra === "sem"
          ? lancamentos.filter((l) => !l.obra_id)
          : lancamentos.filter((l) => l.obra_id === filtroObra),
    [lancamentos, filtroObra],
  );

  /** Extrato com saldo acumulado (entradas somam, saídas subtraem). */
  const extrato = useMemo(() => {
    let saldo = 0;
    return filtrados.map((l) => {
      const v = Number(l.valor ?? 0);
      const mov = l.natureza === "entrada" ? v : l.natureza === "saida" ? -v : 0;
      saldo += mov;
      return { ...l, mov, saldo };
    });
  }, [filtrados]);

  const debitosExtrato = useMemo(
    () => filtrados.filter((l) => l.natureza === "saida"),
    [filtrados],
  );

  const totalEntradas = extrato.reduce((s, l) => s + (l.mov > 0 ? l.mov : 0), 0);
  const totalRetencoes = pagamentos.reduce(
    (s, p) => s + Number(p.retencao_financeira ?? 0),
    0,
  );
  const totalOrigem = pagamentos.reduce(
    (s, p) => s + Number(p.valor_origem ?? p.valor ?? 0),
    0,
  );
  /** Recebido = soma do que realmente entrou como pagamento do pedido. */
  const totalRecebido = pagamentos.reduce((s, p) => s + Number(p.valor ?? 0), 0);
  /** Custo de cada linha do multipartido: produto (unitário × qtde) e extras da venda. */
  const custoLinhaItem = (item: Props["itens"][number]) =>
    num(custosEditados[item.id] ?? String(item.custo_unitario ?? 0)) *
    Number(item.quantidade ?? 0);
  const custoFrete = num(extrasEditados.frete ?? String(venda?.valor_frete ?? 0));
  const custoMaoObra = num(extrasEditados.mao_obra ?? String(venda?.valor_mao_obra ?? 0));
  const custoImposto = num(extrasEditados.imposto ?? String(venda?.valor_impostos ?? 0));
  const extrasLinhas = [
    { campo: "frete" as const, label: "Frete", padrao: String(venda?.valor_frete ?? 0) },
    { campo: "mao_obra" as const, label: "M.O.", padrao: String(venda?.valor_mao_obra ?? 0) },
    { campo: "imposto" as const, label: "Imposto", padrao: String(venda?.valor_impostos ?? 0) },
  ];

  /** Linhas com saldo acumulado: Recebido → cada produto → cada acessório → Frete/M.O./Imposto → débitos do extrato. */
  const linhas = useMemo(() => {
    const arr: Array<{ key: string; custo: number; saldo: number }> = [];
    let saldo = totalRecebido;
    arr.push({ key: "recebido", custo: 0, saldo });
    for (const item of itens) {
      const custo = custoLinhaItem(item);
      saldo -= custo;
      arr.push({ key: item.id, custo, saldo });
    }
    for (let i = 0; i < acessoriosKit.length; i++) {
      const a = acessoriosKit[i];
      const custo = num(acessoriosEditados[String(i)] ?? String(a.valor ?? 0));
      saldo -= custo;
      arr.push({ key: `acessorio-${i}`, custo, saldo });
    }
    for (const ex of extrasLinhas) {
      const custo = num(extrasEditados[ex.campo] ?? ex.padrao);
      saldo -= custo;
      arr.push({ key: ex.campo, custo, saldo });
    }
    for (const deb of debitosExtrato) {
      const custo = Number(deb.valor ?? 0);
      saldo -= custo;
      arr.push({ key: `debito-${deb.id}`, custo, saldo });
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itens, totalRecebido, custoFrete, custoMaoObra, custoImposto, custosEditados, extrasEditados, venda, acessoriosKit, acessoriosEditados, debitosExtrato]);

  const saldoDe = Object.fromEntries(linhas.map((l) => [l.key, l.saldo]));
  const custoTotalGeral = linhas.reduce((s, l) => s + l.custo, 0);
  const lucroMultipartido = totalRecebido - custoTotalGeral;
  const margemMultipartido = totalRecebido > 0 ? (lucroMultipartido / totalRecebido) * 100 : 0;

  /** Salva o custo da linha: produto grava o unitário; extras gravam na venda. */
  const salvarLinha = (key: string, valor: string) => {
    const item = itens.find((i) => i.id === key);
    if (item) {
      salvarCustoItem.mutate({
        itemId: item.id,
        valorTotal: valor,
        qtd: Number(item.quantidade ?? 0),
      });
    } else {
      salvarExtra.mutate({ campo: key as "frete" | "mao_obra" | "imposto", valor });
    }
  };

  const proximos = lancamentos
    .filter((l) => l.recorrencia !== "nenhuma" && l.proxima_data)
    .sort((a, b) => String(a.proxima_data).localeCompare(String(b.proxima_data)));

  const nomeObra = (id: string | null) => {
    if (!id) return "Sem obra";
    const o = obras.find((x) => x.id === id);
    return o ? `${o.numero ?? "Obra"} · ${o.tipo_servico}` : "Obra";
  };

  const tipoLabel = (t: string) =>
    TIPOS_HISTORICO.find((x) => x.valor === t)?.label ?? t;

  return (
    <>
      <ExpandableCard className="print:hidden">
      <CardHeader className="pr-12">
        <CardTitle>Histórico da venda (extrato)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Registre chamados, visitas e custos de {clienteNome ?? "este cliente"}. Movimentos com
          valor entram no resultado por obra; anotações ficam só como histórico.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium">Multipartido da venda</p>
              <p className="text-sm text-muted-foreground">
                Produto · venda recebida · (−) custo · (=) total acumulado. Digite o custo de cada
                linha e clique fora (ou Enter) para salvar — o lucro é recalculado na hora.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setAddAcessorioAberto(true)}
              className="gap-1.5"
            >
              <Plus className="size-3.5" /> Adicionar acessório
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto / Item de custo</TableHead>
                  <TableHead className="text-right">Venda rec.</TableHead>
                  <TableHead className="text-right">(−) Custo</TableHead>
                  <TableHead className="text-right">(=) Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Recebido</TableCell>
                  <TableCell className="text-right font-medium">{brl(totalRecebido)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">—</TableCell>
                  <TableCell className="text-right font-medium">{brl(totalRecebido)}</TableCell>
                </TableRow>
                {itens.length === 0 && acessoriosKit.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhum produto ou acessório registrado nesta venda.
                    </TableCell>
                  </TableRow>
                )}
                {itens.map((item) => {
                  const qtd = Number(item.quantidade ?? 0);
                  const valorPadrao = String(num(String(item.custo_unitario ?? 0)) * qtd);
                  const valor = custosEditados[item.id] ?? valorPadrao;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.descricao}</TableCell>
                      <TableCell />
                      <TableCell className="text-right">
                        <Input
                          className="ml-auto h-8 w-28 text-right"
                          inputMode="decimal"
                          aria-label={`Custo de ${item.descricao}`}
                          value={valor}
                          onChange={(e) =>
                            setCustosEditados((atual) => ({
                              ...atual,
                              [item.id]: e.target.value,
                            }))
                          }
                          onBlur={() => {
                            if (custosEditados[item.id] !== undefined)
                              salvarLinha(item.id, custosEditados[item.id]);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") salvarLinha(item.id, valor);
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {brl(saldoDe[item.id] ?? 0)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {acessoriosKit.map((acessorio, idx) => {
                  const chave = `acessorio-${idx}`;
                  const valorPadrao = String(acessorio.valor ?? 0);
                  const valor = acessoriosEditados[String(idx)] ?? valorPadrao;
                  return (
                    <TableRow key={chave}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            Acessório
                          </Badge>
                          <span>{acessorio.nome || `Acessório ${idx + 1}`}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-6 text-muted-foreground hover:text-destructive"
                            title="Remover acessório"
                            onClick={() => removerAcessorio.mutate(idx)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell />
                      <TableCell className="text-right">
                        <Input
                          className="ml-auto h-8 w-28 text-right"
                          inputMode="decimal"
                          aria-label={`Custo de ${acessorio.nome}`}
                          value={valor}
                          onChange={(e) =>
                            setAcessoriosEditados((atual) => ({
                              ...atual,
                              [String(idx)]: e.target.value,
                            }))
                          }
                          onBlur={() => {
                            if (acessoriosEditados[String(idx)] !== undefined)
                              salvarCustoAcessorio.mutate({
                                index: idx,
                                valorTotal: acessoriosEditados[String(idx)],
                              });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              salvarCustoAcessorio.mutate({
                                index: idx,
                                valorTotal: valor,
                              });
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {brl(saldoDe[chave] ?? 0)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {extrasLinhas.map((ex) => {
                  const valor = extrasEditados[ex.campo] ?? ex.padrao;
                  return (
                    <TableRow key={ex.campo}>
                      <TableCell className="font-medium">{ex.label}</TableCell>
                      <TableCell />
                      <TableCell className="text-right">
                        <Input
                          className="ml-auto h-8 w-28 text-right"
                          inputMode="decimal"
                          aria-label={`Custo de ${ex.label}`}
                          value={valor}
                          onChange={(e) =>
                            setExtrasEditados((atual) => ({
                              ...atual,
                              [ex.campo]: e.target.value,
                            }))
                          }
                          onBlur={() => {
                            if (extrasEditados[ex.campo] !== undefined)
                              salvarLinha(ex.campo, extrasEditados[ex.campo]);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") salvarLinha(ex.campo, valor);
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {brl(saldoDe[ex.campo] ?? 0)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {debitosExtrato.map((deb) => {
                  const chave = `debito-${deb.id}`;
                  return (
                    <TableRow key={chave}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-destructive/30 text-xs text-destructive">
                            Débito extrato
                          </Badge>
                          <span>{deb.descricao}</span>
                        </div>
                      </TableCell>
                      <TableCell />
                      <TableCell className="text-right font-medium text-destructive">
                        {brl(Number(deb.valor ?? 0))}
                      </TableCell>
                      <TableCell className="text-right">
                        {brl(saldoDe[chave] ?? 0)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="border-t-2 font-semibold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{brl(totalRecebido)}</TableCell>
                  <TableCell className="text-right text-destructive">
                    {brl(custoTotalGeral)}
                  </TableCell>
                  <TableCell className="text-right">{brl(lucroMultipartido)}</TableCell>
                </TableRow>
                <TableRow className="font-semibold">
                  <TableCell>(%)</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell className="text-right">
                    {margemMultipartido.toFixed(1)}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>



        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Data">
            <Input
              type="date"
              value={form.data}
              onChange={(e) => setForm({ ...form, data: e.target.value })}
            />
          </Field>
          <Field label="Tipo de registro">
            <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_HISTORICO.map((t) => (
                  <SelectItem key={t.valor} value={t.valor}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Obra / centro de custo">
            <Select
              value={form.obra_id || "sem"}
              onValueChange={(v) => setForm({ ...form, obra_id: v === "sem" ? "" : v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sem">Sem obra vinculada</SelectItem>
                {obras.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.numero ?? "Obra"} · {o.tipo_servico}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Movimento">
            <Select
              value={form.natureza}
              onValueChange={(v) =>
                setForm({ ...form, natureza: v as FormState["natureza"], valor: v === "neutro" ? "" : form.valor })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="neutro">Sem valor (só histórico)</SelectItem>
                <SelectItem value="saida">Custo (saída)</SelectItem>
                <SelectItem value="entrada">Recebimento (entrada)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Valor (R$)">
            <Input
              inputMode="decimal"
              placeholder="0,00"
              disabled={form.natureza === "neutro"}
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
            />
          </Field>
          <Field label="Repetição do chamado">
            <Select
              value={form.recorrencia}
              onValueChange={(v) => setForm({ ...form, recorrencia: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECORRENCIAS.map((r) => (
                  <SelectItem key={r.valor} value={r.valor}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Próximo atendimento">
            <Input
              type="date"
              value={form.proxima_data}
              onChange={(e) => setForm({ ...form, proxima_data: e.target.value })}
            />
          </Field>
          <Field label="Descrição" className="sm:col-span-2 lg:col-span-4">
            <Textarea
              rows={2}
              placeholder="Ex.: chamado de manutenção do motor — troca de selo mecânico."
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </Field>
          <Field label="Observações internas" className="sm:col-span-2 lg:col-span-3">
            <Input
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            />
          </Field>
          <div className="flex items-end">
            <Button
              className="w-full"
              onClick={() => salvar.mutate()}
              disabled={salvar.isPending}
            >
              <Plus className="size-4" /> Lançar no extrato
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Valor de origem</p>
            <p className="text-lg font-semibold">{brl(totalOrigem || totalEntradas)}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Recebido</p>
            <p className="text-lg font-semibold text-success">
              {brl(totalRecebido || totalEntradas)}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Taxas / retenções</p>
            <p className="text-lg font-semibold text-destructive">{brl(totalRetencoes)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">Filtrar por obra</span>
          <Select value={filtroObra} onValueChange={setFiltroObra}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as obras</SelectItem>
              <SelectItem value="sem">Sem obra vinculada</SelectItem>
              {obras.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.numero ?? "Obra"} · {o.tipo_servico}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Histórico</TableHead>
                <TableHead>Obra</TableHead>
                <TableHead className="text-right">Débito</TableHead>
                <TableHead className="text-right">Crédito</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {extrato.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhum registro no histórico ainda.
                  </TableCell>
                </TableRow>
              )}
              {extrato.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="whitespace-nowrap">{dataBR(l.data)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{tipoLabel(l.tipo)}</Badge>
                      <span className="font-medium">{l.descricao}</span>
                    </div>
                    {l.observacoes && (
                      <p className="text-xs text-muted-foreground">{l.observacoes}</p>
                    )}
                    {l.recorrencia !== "nenhuma" && (
                      <p className="text-xs text-muted-foreground">
                        Repete {l.recorrencia} · próximo em {dataBR(l.proxima_data)}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {nomeObra(l.obra_id)}
                  </TableCell>
                  <TableCell className="text-right text-destructive">
                    {l.mov < 0 ? brl(-l.mov) : "—"}
                  </TableCell>
                  <TableCell className="text-right text-success">
                    {l.mov > 0 ? brl(l.mov) : "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium">{brl(l.saldo)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Excluir registro"
                      onClick={() => remover.mutate(l.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {proximos.length > 0 && (
          <div className="rounded-lg border border-border p-3">
            <p className="mb-2 text-sm font-medium">Chamados programados</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {proximos.map((p) => (
                <li key={`prox-${p.id}`}>
                  {dataBR(p.proxima_data)} · {tipoLabel(p.tipo)} — {p.descricao} (
                  {nomeObra(p.obra_id)})
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </ExpandableCard>

    <Dialog open={addAcessorioAberto} onOpenChange={setAddAcessorioAberto}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar acessório ao multipartido</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Field label="Nome / Descrição do acessório">
            <Input
              placeholder="Ex.: Cascata em inox, LED RGB, etc."
              value={novoAcessorioNome}
              onChange={(e) => setNovoAcessorioNome(e.target.value)}
            />
          </Field>
          <Field label="Custo do acessório (R$)">
            <Input
              inputMode="decimal"
              placeholder="0,00"
              value={novoAcessorioValor}
              onChange={(e) => setNovoAcessorioValor(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  adicionarAcessorio.mutate({
                    nome: novoAcessorioNome,
                    valor: num(novoAcessorioValor),
                  });
                }
              }}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAddAcessorioAberto(false)}>
            Cancelar
          </Button>
          <Button
            disabled={adicionarAcessorio.isPending}
            onClick={() =>
              adicionarAcessorio.mutate({
                nome: novoAcessorioNome,
                valor: num(novoAcessorioValor),
              })
            }
          >
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
