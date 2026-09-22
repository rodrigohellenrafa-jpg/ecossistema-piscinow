/**
 * Histórico da venda em formato de extrato bancário.
 *
 * Cada linha é um evento do pedido/obra: pode ser só uma anotação (sem valor)
 * ou um evento financeiro (entrada/saída). O extrato mostra saldo acumulado e
 * totais por obra, e permite programar chamados recorrentes ligados ao cliente.
 */
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpandableCard } from "@/components/expandable-card";
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
    mutationFn: async ({ itemId, valor }: { itemId: string; valor: string }) => {
      const custo = num(valor);
      if (custo < 0) throw new Error("O valor cadastrado não pode ser negativo.");
      const { error } = await supabase
        .from("venda_itens")
        .update({ custo_unitario: custo })
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

  const totalEntradas = extrato.reduce((s, l) => s + (l.mov > 0 ? l.mov : 0), 0);
  const totalRetencoes = pagamentos.reduce(
    (s, p) => s + Number(p.retencao_financeira ?? 0),
    0,
  );
  const totalOrigem = pagamentos.reduce(
    (s, p) => s + Number(p.valor_origem ?? p.valor ?? 0),
    0,
  );

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
          <div>
            <p className="font-medium">Custo multipartido dos produtos</p>
            <p className="text-sm text-muted-foreground">
              Cada produto aparece em duas linhas: o nome e, abaixo, o valor cadastrado de custo —
              corrija para confrontar com o valor real da venda.
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto / custo cadastrado</TableHead>
                  <TableHead className="text-right">Qtde</TableHead>
                  <TableHead className="text-right">Venda</TableHead>
                  <TableHead className="text-right">Total custo</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum produto registrado nesta venda.
                    </TableCell>
                  </TableRow>
                )}
                {itens.map((item) => {
                  const valor = custosEditados[item.id] ?? String(item.custo_unitario ?? 0);
                  const qtd = Number(item.quantidade ?? 0);
                  const venda = Number(item.preco_unitario ?? 0) * qtd;
                  const custo = num(valor) * qtd;
                  return (
                    <Fragment key={item.id}>
                      <TableRow>
                        <TableCell className="font-medium">{item.descricao}</TableCell>
                        <TableCell className="text-right">{qtd}</TableCell>
                        <TableCell className="text-right">{brl(venda)}</TableCell>
                        <TableCell className="text-right">{brl(custo)}</TableCell>
                        <TableCell />
                      </TableRow>
                      <TableRow className="border-b">
                        <TableCell colSpan={3}>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Valor cadastrado (unitário)
                            </span>
                            <Input
                              className="h-8 w-36"
                              inputMode="decimal"
                              value={valor}
                              onChange={(e) =>
                                setCustosEditados((atual) => ({
                                  ...atual,
                                  [item.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  salvarCustoItem.mutate({ itemId: item.id, valor });
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          Lucro {brl(venda - custo)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="outline"
                            aria-label={`Salvar valor cadastrado de ${item.descricao}`}
                            title="Salvar valor cadastrado"
                            disabled={
                              salvarCustoItem.isPending || custosEditados[item.id] === undefined
                            }
                            onClick={() => salvarCustoItem.mutate({ itemId: item.id, valor })}
                          >
                            <Save className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {itens.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Valor real da venda</p>
                <p className="text-lg font-semibold">{brl(totalVendaItens)}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Custo cadastrado</p>
                <p className="text-lg font-semibold text-destructive">{brl(totalCustoItens)}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Lucro</p>
                <p className="text-lg font-semibold text-success">
                  {brl(totalVendaItens - totalCustoItens)}
                </p>
              </div>
            </div>
          )}
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
            <p className="text-lg font-semibold text-success">{brl(totalEntradas)}</p>
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
  );
}
