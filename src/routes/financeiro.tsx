import { TelaPermitida } from "@/components/tela-permitida";
import { LancarEmLote } from "@/components/lancar-em-lote";
import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Link2, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DespesasRecorrentes } from "@/components/despesas-recorrentes";
import { SaldosBancarios } from "@/components/saldos-bancarios";
import { CentroCustoField, VinculoField, parseVinculo } from "@/components/centro-custo-field";
import { Field } from "@/components/field";
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
  DialogTrigger,
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
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR, FORMAS_PAGAMENTO, hojeISO, mesLabel } from "@/lib/erp";
import { useAbrirModal } from "@/hooks/use-abrir-modal";

export const Route = createFileRoute("/financeiro")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Fluxo de Caixa | Piscinow ERP" },
      {
        name: "description",
        content: "Lançamentos financeiros, fluxo de caixa mensal e conciliação bancária da Piscinow.",
      },
      { property: "og:title", content: "Fluxo de Caixa | Piscinow ERP" },
      {
        property: "og:description",
        content: "Receitas, despesas, previsto x realizado e conciliação bancária.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Financeiro />
    </RequireAuth>
  ),
});

type Lancamento = {
  id: string;
  tipo_fluxo: string;
  categoria: string;
  descricao: string;
  valor: number;
  data_competencia: string;
  vencimento: string | null;
  data_pagamento: string | null;
  venda_id: string | null;
  fornecedor_id: string | null;
  funcionario_id: string | null;
  conta_bancaria: string | null;
  forma_pagamento: string | null;
  status: string;
  conciliado: boolean;
  observacoes: string | null;
  recorrencia?: string | null;
};

const RECORRENCIAS = [
  { v: "nenhuma", r: "Pagamento único" },
  { v: "diaria", r: "Diária" },
  { v: "semanal", r: "Semanal" },
  { v: "quinzenal", r: "Quinzenal" },
  { v: "mensal", r: "Mensal" },
  { v: "bimestral", r: "Bimestral" },
  { v: "trimestral", r: "Trimestral" },
  { v: "semestral", r: "Semestral" },
  { v: "anual", r: "Anual" },
] as const;

function proximaData(iso: string, recorrencia: string): string {
  const d = new Date(iso + "T12:00:00");
  const dias: Record<string, number> = { diaria: 1, semanal: 7, quinzenal: 15 };
  const meses: Record<string, number> = { mensal: 1, bimestral: 2, trimestral: 3, semestral: 6, anual: 12 };
  if (dias[recorrencia]) d.setDate(d.getDate() + dias[recorrencia]);
  else if (meses[recorrencia]) d.setMonth(d.getMonth() + meses[recorrencia]);
  return d.toISOString().slice(0, 10);
}

const rotuloRecorrencia = (v?: string | null) => RECORRENCIAS.find((r) => r.v === v)?.r ?? null;

const vazio = {
  obra_id: "",
  vinculo: "",
  numero_documento: "",
  tipo_fluxo: "receita",
  categoria: "",
  descricao: "",
  valor: "0",
  data_competencia: hojeISO(),
  vencimento: "",
  data_pagamento: "",
  conta_bancaria: "",
  forma_pagamento: FORMAS_PAGAMENTO[0],
  venda_id: "",
  fornecedor_id: "",
  funcionario_id: "",
  tipo_despesa: "",
  recorrencia: "nenhuma",
  status: "Pendente",
  observacoes: "",
};

function Financeiro() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  useAbrirModal("novo", () => setOpen(true));
  const [form, setForm] = useState(vazio);
  const [baixa, setBaixa] = useState<{
    id: string;
    descricao: string;
    valor: number;
    conta: string;
    data: string;
  } | null>(null);

  const [fTipo, setFTipo] = useState("todos");
  const [fCategoria, setFCategoria] = useState("todas");
  const [fStatus, setFStatus] = useState("todos");
  const [fConta, setFConta] = useState("todas");
  const [fDe, setFDe] = useState("");
  const [fAte, setFAte] = useState("");

  const { data: lancamentos = [] } = useQuery({
    queryKey: ["lancamentos_financeiros"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lancamentos_financeiros")
        .select("*")
        .order("data_competencia", { ascending: false });
      if (error) throw error;
      return data as Lancamento[];
    },
  });

  const { data: contasBancarias = [] } = useQuery({
    queryKey: ["saldos-bancarios-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saldos_bancarios")
        .select("id, conta, banco")
        .order("conta", { ascending: true });
      if (error) throw error;
      return data as { id: string; conta: string; banco: string | null }[];
    },
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ["fornecedores-lite"],
    queryFn: async () => {
      const { data, error } = await supabase.from("fornecedores").select("id, nome").order("nome");
      if (error) throw error;
      return data;
    },
  });

  const { data: funcionarios = [] } = useQuery({
    queryKey: ["funcionarios-lite"],
    queryFn: async () => {
      const { data, error } = await supabase.from("funcionarios").select("id, nome").order("nome");
      if (error) throw error;
      return data;
    },
  });

  const { data: categoriasDb = [] } = useQuery({
    queryKey: ["categorias-financeiras"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categorias_financeiras")
        .select("id, nome, tipo")
        .eq("ativo", true)
        .order("nome", { ascending: true });
      if (error) throw error;
      return data as { id: string; nome: string; tipo: string }[];
    },
  });

  const { data: rateios = [] } = useQuery({
    queryKey: ["lancamento-rateios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lancamento_rateios")
        .select("id, lancamento_id, categoria, valor");
      if (error) throw error;
      return data as { id: string; lancamento_id: string; categoria: string; valor: number }[];
    },
  });

  const [ratear, setRatear] = useState(false);
  const [rateio, setRateio] = useState<{ categoria: string; valor: string }[]>([
    { categoria: "", valor: "" },
    { categoria: "", valor: "" },
  ]);

  const totalLancamento = Number(form.valor) || 0;
  const somaRateio = rateio.reduce((s, r) => s + (Number(r.valor) || 0), 0);
  const diferencaRateio = Math.round((totalLancamento - somaRateio) * 100) / 100;

  const { data: pedidos = [] } = useQuery({
    queryKey: ["vendas-lite"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendas")
        .select("id, numero, cliente_nome")
        .order("data", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  /** Rótulo do pedido vinculado (número · cliente) por id. */
  const rotuloPedido = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const p of pedidos) {
      mapa.set(p.id, `${p.numero ?? p.id.slice(0, 8)}${p.cliente_nome ? ` · ${p.cliente_nome}` : ""}`);
    }
    return mapa;
  }, [pedidos]);

  const salvar = useMutation({
    mutationFn: async () => {
      if (!form.descricao.trim()) throw new Error("Informe a descrição.");
      if (!ratear && !form.categoria.trim()) throw new Error("Informe a categoria.");
      if (form.status === "Pago" && contasBancarias.length > 0 && !form.conta_bancaria)
        throw new Error("Escolha a conta onde o dinheiro entrou ou saiu.");

      const linhas = rateio
        .map((r) => ({ categoria: r.categoria.trim(), valor: Number(r.valor) || 0 }))
        .filter((r) => r.categoria && r.valor > 0);

      if (ratear) {
        if (linhas.length < 2) throw new Error("Informe ao menos duas categorias no rateio.");
        if (Math.abs(diferencaRateio) > 0.005)
          throw new Error(
            `A soma das categorias (${brl(somaRateio)}) precisa bater com o valor do lançamento (${brl(totalLancamento)}).`,
          );
      }

      const uid = (await supabase.auth.getUser()).data.user?.id ?? null;
      const vinc = parseVinculo(form.vinculo);
      const { data: criado, error } = await supabase.from("lancamentos_financeiros").insert({
        tipo_fluxo: form.tipo_fluxo,
        categoria: ratear ? "Rateio" : form.categoria.trim(),
        descricao: form.descricao.trim(),
        valor: Number(form.valor) || 0,
        data_competencia: form.data_competencia || hojeISO(),
        vencimento: form.vencimento || null,
        data_pagamento: form.data_pagamento || null,
        conta_bancaria: form.conta_bancaria || null,
        forma_pagamento: form.forma_pagamento || null,
        venda_id: form.venda_id || null,
        fornecedor_id: form.fornecedor_id || null,
        funcionario_id: vinc.funcionario_id ?? (form.funcionario_id || null),
        cliente_id: vinc.cliente_id,
        tipo_despesa: form.tipo_fluxo === "despesa" && form.tipo_despesa ? form.tipo_despesa : null,
        recorrencia: form.recorrencia,
        status: form.status,
        observacoes: form.observacoes || null,
        obra_id: vinc.obra_id ?? (form.obra_id || null),
        numero_documento: form.numero_documento || null,
        created_by: uid,
      })
        .select("id")
        .single();
      if (error) throw error;

      if (ratear && criado) {
        const { error: err2 } = await supabase.from("lancamento_rateios").insert(
          linhas.map((l) => ({
            lancamento_id: criado.id,
            categoria: l.categoria,
            valor: l.valor,
            created_by: uid,
          })),
        );
        if (err2) throw err2;
      }
    },
    onSuccess: () => {
      toast.success("Lançamento criado!");
      setForm(vazio);
      setRatear(false);
      setRateio([
        { categoria: "", valor: "" },
        { categoria: "", valor: "" },
      ]);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["lancamentos_financeiros"] });
      qc.invalidateQueries({ queryKey: ["lancamento-rateios"] });
      qc.invalidateQueries({ queryKey: ["saldos-bancarios"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reverterBaixa = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("lancamentos_financeiros")
        .update({ status: "Pendente", data_pagamento: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Baixa revertida — o valor voltou para o saldo da conta.");
      qc.invalidateQueries({ queryKey: ["lancamentos_financeiros"] });
      qc.invalidateQueries({ queryKey: ["saldos-bancarios"] });
      qc.invalidateQueries({ queryKey: ["saldos-bancarios-select"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const marcarPago = useMutation({
    mutationFn: async ({ id, conta, data }: { id: string; conta: string; data: string }) => {
      const { data: orig } = await supabase
        .from("lancamentos_financeiros")
        .select("*")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("lancamentos_financeiros")
        .update({
          status: "Pago",
          data_pagamento: data || hojeISO(),
          conta_bancaria: conta || orig?.conta_bancaria || null,
        })
        .eq("id", id);
      if (error) throw error;

      if (orig && orig.recorrencia && orig.recorrencia !== "nenhuma") {
        const base = orig.vencimento || orig.data_competencia;
        const proxima = proximaData(base, orig.recorrencia);
        const { error: err2 } = await supabase.from("lancamentos_financeiros").insert({
          tipo_fluxo: orig.tipo_fluxo,
          categoria: orig.categoria,
          descricao: orig.descricao,
          valor: orig.valor,
          data_competencia: proxima,
          vencimento: orig.vencimento ? proxima : null,
          conta_bancaria: orig.conta_bancaria,
          forma_pagamento: orig.forma_pagamento,
          venda_id: orig.venda_id,
          fornecedor_id: orig.fornecedor_id,
          funcionario_id: orig.funcionario_id,
          cliente_id: orig.cliente_id,
          obra_id: orig.obra_id,
          numero_documento: orig.numero_documento,
          tipo_despesa: orig.tipo_despesa,
          recorrencia: orig.recorrencia,
          status: "Pendente",
          observacoes: orig.observacoes,
          created_by: orig.created_by,
        });
        if (err2) throw err2;
      }
    },
    onSuccess: () => {
      toast.success("Lançamento pago e saldo da conta atualizado.");
      setBaixa(null);
      qc.invalidateQueries({ queryKey: ["lancamentos_financeiros"] });
      qc.invalidateQueries({ queryKey: ["saldos-bancarios"] });
      qc.invalidateQueries({ queryKey: ["saldos-bancarios-select"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleConciliado = useMutation({
    mutationFn: async ({ id, valor }: { id: string; valor: boolean }) => {
      const { error } = await supabase
        .from("lancamentos_financeiros")
        .update({ conciliado: valor })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lancamentos_financeiros"] }),
  });

  const excluir = useMutation({
    mutationFn: async (id: string) => {
      const { data: orig } = await supabase
        .from("lancamentos_financeiros")
        .select("tipo_fluxo, valor, status, conta_bancaria")
        .eq("id", id)
        .maybeSingle();

      const { error } = await supabase.from("lancamentos_financeiros").delete().eq("id", id);
      if (error) throw error;

    },
    onSuccess: () => {
      toast.success("Lançamento excluído.");
      qc.invalidateQueries({ queryKey: ["lancamentos_financeiros"] });
      qc.invalidateQueries({ queryKey: ["saldos-bancarios"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (k: keyof typeof vazio) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const categorias = useMemo(
    () => Array.from(new Set(lancamentos.map((l) => l.categoria))).sort(),
    [lancamentos],
  );
  const contas = useMemo(
    () => Array.from(new Set(lancamentos.map((l) => l.conta_bancaria).filter(Boolean))) as string[],
    [lancamentos],
  );

  const filtrados = lancamentos.filter((l) => {
    if (fTipo !== "todos" && l.tipo_fluxo !== fTipo) return false;
    if (fCategoria !== "todas" && l.categoria !== fCategoria) return false;
    if (fStatus !== "todos" && l.status !== fStatus) return false;
    if (fConta !== "todas" && l.conta_bancaria !== fConta) return false;
    if (fDe && l.data_competencia < fDe) return false;
    if (fAte && l.data_competencia > fAte) return false;
    return true;
  });

  const hoje = new Date();
  const mesAtual = hoje.toISOString().slice(0, 7);
  const doMes = lancamentos.filter((l) => l.data_competencia.slice(0, 7) === mesAtual);
  const receitaMes = doMes.filter((l) => l.tipo_fluxo === "receita").reduce((s, l) => s + Number(l.valor), 0);
  const despesaMes = doMes.filter((l) => l.tipo_fluxo === "despesa").reduce((s, l) => s + Number(l.valor), 0);
  const saldoMes = receitaMes - despesaMes;
  const previsto = doMes.reduce(
    (s, l) => s + (l.tipo_fluxo === "receita" ? Number(l.valor) : -Number(l.valor)),
    0,
  );
  const realizado = doMes
    .filter((l) => l.status?.toLowerCase() === "pago")
    .reduce((s, l) => s + (l.tipo_fluxo === "receita" ? Number(l.valor) : -Number(l.valor)), 0);

  const grafico = useMemo(() => {
    const meses: Record<string, { mes: string; receita: number; despesa: number }> = {};
    for (const l of lancamentos) {
      const key = l.data_competencia.slice(0, 7);
      if (!meses[key]) meses[key] = { mes: mesLabel(l.data_competencia), receita: 0, despesa: 0 };
      if (l.tipo_fluxo === "receita") meses[key].receita += Number(l.valor);
      else meses[key].despesa += Number(l.valor);
    }
    return Object.entries(meses)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([, v]) => v);
  }, [lancamentos]);

  return (
    <div className="space-y-6">
      <DespesasRecorrentes />
      <PageHeader
        title="Fluxo de Caixa"
        subtitle="Lançamentos financeiros, evolução mensal e conciliação bancária."
        actions={
          <>
          <LancarEmLote destino="financeiro" />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus /> Novo lançamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Novo lançamento</DialogTitle>
                <DialogDescription>Receita ou despesa do fluxo de caixa.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                <h3 className="border-b pb-2 text-sm font-semibold sm:col-span-2">Dados do lançamento</h3>
<Field label="Tipo">
                  <Select value={form.tipo_fluxo} onValueChange={set("tipo_fluxo")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Fornecedor">
                  <Select
                    value={form.fornecedor_id || "none"}
                    onValueChange={(v) => set("fornecedor_id")(v === "none" ? "" : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nenhum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {fornecedores.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                 </Field>
                                 <Field label="Descrição" className="sm:col-span-2">
                  <Input value={form.descricao} onChange={(e) => set("descricao")(e.target.value)} />
                </Field>
<h3 className="border-b pb-2 text-sm font-semibold sm:col-span-2">Valores e categorias</h3>
                {!ratear && (
                <Field label="Categoria">
                  <Select value={form.categoria} onValueChange={set("categoria")}>
                    <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                    <SelectContent>
                      {categoriasDb.filter(c => c.tipo === "ambas" || c.tipo === (form.tipo_fluxo === "despesa" ? "pagar" : "receber")).map(c => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                )}
                <Field label="Valor (R$)">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.valor}
                    onChange={(e) => set("valor")(e.target.value)}
                  />
                </Field>
                <div className="rounded-lg border p-3 sm:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Rateio de categorias</p>
                      <p className="text-xs text-muted-foreground">
                        Um único lançamento dividido entre várias categorias no DRE e nos relatórios.
                      </p>
                    </div>
                    <Switch checked={ratear} onCheckedChange={setRatear} aria-label="Ativar rateio" />
                  </div>

                  {ratear && (
                    <div className="mt-3 space-y-2">
                      {rateio.map((linha, i) => (
                        <div key={i} className="flex items-end gap-2">
                          <div className="flex-1">
                            <Select
                              value={linha.categoria}
                              onValueChange={(v) =>
                                setRateio((r) =>
                                  r.map((x, j) => (j === i ? { ...x, categoria: v } : x)),
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Categoria" />
                              </SelectTrigger>
                              <SelectContent>
                                {categoriasDb
                                  .filter(
                                    (c) =>
                                      c.tipo === "ambas" ||
                                      (form.tipo_fluxo === "despesa" ? c.tipo === "pagar" : c.tipo === "receber"),
                                  )
                                  .map((c) => (
                                    <SelectItem key={c.id} value={c.nome}>
                                      {c.nome}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Input
                            className="w-32"
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={linha.valor}
                            onChange={(e) =>
                              setRateio((r) =>
                                r.map((x, j) => (j === i ? { ...x, valor: e.target.value } : x)),
                              )
                            }
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label="Remover linha"
                            onClick={() => setRateio((r) => r.filter((_, j) => j !== i))}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setRateio((r) => [...r, { categoria: "", valor: "" }])}
                        >
                          <Plus /> Adicionar categoria
                        </Button>
                        <p
                          className={
                            Math.abs(diferencaRateio) > 0.005
                              ? "text-xs font-medium text-destructive"
                              : "text-xs font-medium text-emerald-600"
                          }
                        >
                          Rateado {brl(somaRateio)} de {brl(totalLancamento)}
                          {Math.abs(diferencaRateio) > 0.005
                            ? ` — faltam ${brl(diferencaRateio)}`
                            : " — valores conferem"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

<h3 className="border-b pb-2 text-sm font-semibold sm:col-span-2">Pagamento e recorrência</h3>
                <Field label="Status">
                  <Select value={form.status} onValueChange={set("status")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Pago">Pago</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Competência">
                  <Input
                    type="date"
                    value={form.data_competencia}
                    onChange={(e) => set("data_competencia")(e.target.value)}
                  />
                </Field>
                <Field label="Vencimento">
                  <Input
                    type="date"
                    value={form.vencimento}
                    onChange={(e) => set("vencimento")(e.target.value)}
                  />
                </Field>
                <Field label="Recorrência">
                  <Select value={form.recorrencia} onValueChange={set("recorrencia")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RECORRENCIAS.map((r) => (
                        <SelectItem key={r.v} value={r.v}>
                          {r.r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.recorrencia !== "nenhuma" && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ao marcar como pago, o próximo lançamento é gerado automaticamente.
                    </p>
                  )}
                </Field>
                <Field label="Data de pagamento">
                  <Input
                    type="date"
                    value={form.data_pagamento}
                    onChange={(e) => set("data_pagamento")(e.target.value)}
                  />
                </Field>
                <Field
                  label={
                    form.tipo_fluxo === "despesa"
                      ? "De onde o recurso sai (conta)"
                      : "Onde o recurso entra (conta)"
                  }
                >
                  <Select
                    value={form.conta_bancaria}
                    onValueChange={(v) => set("conta_bancaria")(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {contasBancarias.map((c) => (
                        <SelectItem key={c.id} value={c.conta}>
                          {c.conta}
                          {c.banco ? ` — ${c.banco}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Forma de pagamento">
                  <Select value={form.forma_pagamento} onValueChange={set("forma_pagamento")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAS_PAGAMENTO.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
<h3 className="border-b pb-2 text-sm font-semibold sm:col-span-2">Vínculos e documento</h3>
                <Field label="Pedido vinculado">
                  <Select value={form.venda_id || "none"} onValueChange={(v) => set("venda_id")(v === "none" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Nenhum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {pedidos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.numero ?? p.id.slice(0, 8)} · {p.cliente_nome ?? "—"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
{form.tipo_fluxo === "despesa" && (
                   <Field label="Tipo de despesa">
                     <Select
                       value={form.tipo_despesa || "none"}
                       onValueChange={(v) => set("tipo_despesa")(v === "none" ? "" : v)}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Selecione" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="none">Não classificado</SelectItem>
                         <SelectItem value="fixa">Despesa fixa</SelectItem>
                         <SelectItem value="variavel">Despesa variável</SelectItem>
                          <SelectItem value="operacional">Despesa operacional</SelectItem>
                          <SelectItem value="pessoal">Despesa pessoal</SelectItem>
                       </SelectContent>
                     </Select>
                   </Field>
                 )}
                 <Field label="Funcionário vinculado">
                  <Select
                    value={form.funcionario_id || "none"}
                    onValueChange={(v) => set("funcionario_id")(v === "none" ? "" : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nenhum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {funcionarios.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <VinculoField value={form.vinculo} onChange={v=>setForm(f=>({...f,vinculo:v}))} />
              <Field label="Número do documento / NF-e"><Input value={form.numero_documento} onChange={e=>setForm(f=>({...f,numero_documento:e.target.value}))}/></Field>
<h3 className="border-b pb-2 text-sm font-semibold sm:col-span-2">Observações</h3>
              <Field label="Observações" className="sm:col-span-2">
                  <Textarea
                    rows={3}
                    value={form.observacoes}
                    onChange={(e) => set("observacoes")(e.target.value)}
                  />
                </Field>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
                  {salvar.isPending ? "Salvando…" : "Salvar lançamento"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Receitas do mês" value={brl(receitaMes)} tone="positive" to="/contas" />
        <Kpi label="Despesas do mês" value={brl(despesaMes)} tone="negative" to="/contas" />
        <Kpi label="Saldo do mês" value={brl(saldoMes)} tone={saldoMes >= 0 ? "positive" : "negative"} to="/fluxo-caixa" />
        <Kpi
          label="Previsto x Realizado"
          value={`${brl(realizado)} / ${brl(previsto)}`}
          hint="Realizado (pago) sobre o previsto no período"
          to="/relatorio-contas"
        />
      </div>

      <TelaPermitida tela="saldos"><SaldosBancarios /></TelaPermitida>

      <Tabs defaultValue="lancamentos">
        <TabsList>
          <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
          <TabsTrigger value="conciliacao">Conciliação bancária</TabsTrigger>
        </TabsList>

        <TabsContent value="lancamentos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Receitas x Despesas (mensal)</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={grafico}>
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
                  <Legend />
                  <Bar dataKey="receita" name="Receita" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="despesa" name="Despesa" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <Field label="De">
                <Input type="date" value={fDe} onChange={(e) => setFDe(e.target.value)} />
              </Field>
              <Field label="Até">
                <Input type="date" value={fAte} onChange={(e) => setFAte(e.target.value)} />
              </Field>
              <Field label="Tipo">
                <Select value={fTipo} onValueChange={setFTipo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Categoria">
                <Select value={fCategoria} onValueChange={setFCategoria}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {categorias.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Status">
                <Select value={fStatus} onValueChange={setFStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Pago">Pago</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Conta">
                <Select value={fConta} onValueChange={setFConta}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {contas.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lançamentos ({filtrados.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Competência</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Conta</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Conciliado</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtrados.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell>{dataBR(l.data_competencia)}</TableCell>
                        <TableCell>
                          <Badge variant={l.tipo_fluxo === "receita" ? "secondary" : "outline"}>
                            {l.tipo_fluxo === "receita" ? "Receita" : "Despesa"}
                          </Badge>
                        </TableCell>
                        <TableCell>{l.categoria}</TableCell>
                         <TableCell className="max-w-[220px] truncate">
                          {l.descricao}
                          {rotuloRecorrencia(l.recorrencia) && (
                            <Badge variant="outline" className="ml-2 text-[10px]">
                              {rotuloRecorrencia(l.recorrencia)}
                            </Badge>
                          )}
                          {rateios.some((r) => r.lancamento_id === l.id) && (
                            <span className="mt-1 block text-xs font-normal text-muted-foreground">
                              Rateio:{" "}
                              {rateios
                                .filter((r) => r.lancamento_id === l.id)
                                .map((r) => `${r.categoria} ${brl(Number(r.valor))}`)
                                .join(" · ")}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate">
                          {l.venda_id ? (rotuloPedido.get(l.venda_id) ?? "Pedido") : "—"}
                        </TableCell>
                        <TableCell>{l.conta_bancaria ?? "—"}</TableCell>
                        <TableCell
                          className={`text-right tabular-nums ${l.tipo_fluxo === "receita" ? "text-success" : "text-destructive"}`}
                        >
                          {brl(l.valor)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={l.status?.toLowerCase() === "pago" ? "secondary" : l.status === "Cancelado" ? "outline" : "default"}>
                            {l.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant={l.conciliado ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => toggleConciliado.mutate({ id: l.id, valor: !l.conciliado })}
                          >
                            <Link2 className="size-3.5" /> {l.conciliado ? "Sim" : "Não"}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {l.status !== "Pago" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const combina = contasBancarias.find(
                                    (c) =>
                                      c.conta.trim().toLowerCase() ===
                                      (l.conta_bancaria ?? "").trim().toLowerCase(),
                                  );
                                  setBaixa({
                                    id: l.id,
                                    descricao: l.descricao,
                                    valor: l.valor,
                                    conta: combina?.conta ?? "",
                                    data: hojeISO(),
                                  });
                                }}
                                title="Dar baixa"
                              >
                                <CheckCircle2 className="size-4" />
                              </Button>
                             )}
                             {l.status === "Pago" && (
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 onClick={() => {
                                   if (window.confirm(`Reverter a baixa de "${l.descricao}"?`))
                                     reverterBaixa.mutate(l.id);
                                 }}
                                 title="Reverter baixa"
                               >
                                 <RotateCcw className="size-4" />
                               </Button>
                             )}
                             <Button variant="ghost" size="icon" onClick={() => excluir.mutate(l.id)} title="Excluir">
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtrados.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                          Nenhum lançamento encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conciliacao">
          <Conciliacao lancamentos={lancamentos} onConciliar={(id) => toggleConciliado.mutate({ id, valor: true })} />
        </TabsContent>
      </Tabs>

      <Dialog open={!!baixa} onOpenChange={(o) => !o && setBaixa(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dar baixa</DialogTitle>
            <DialogDescription>
              {baixa ? `${baixa.descricao} — ${brl(baixa.valor)}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Conta que recebeu / pagou">
              <Select
                value={baixa?.conta ?? ""}
                onValueChange={(v) => setBaixa((b) => (b ? { ...b, conta: v } : b))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent>
                  {contasBancarias.map((c) => (
                    <SelectItem key={c.id} value={c.conta}>
                      {c.conta}
                      {c.banco ? ` — ${c.banco}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Data do pagamento">
              <Input
                type="date"
                value={baixa?.data ?? ""}
                onChange={(e) => setBaixa((b) => (b ? { ...b, data: e.target.value } : b))}
              />
            </Field>
            {contasBancarias.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma conta bancária cadastrada. Cadastre em Saldos bancários para que o saldo
                seja atualizado na baixa.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBaixa(null)}>
              Cancelar
            </Button>
            <Button
              disabled={
                !baixa ||
                marcarPago.isPending ||
                (contasBancarias.length > 0 && !baixa.conta)
              }
              onClick={() =>
                baixa &&
                marcarPago.mutate({ id: baixa.id, conta: baixa.conta, data: baixa.data })
              }
            >
              Confirmar baixa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type LinhaExtrato = { data: string; descricao: string; valor: number; match?: Lancamento };

function Conciliacao({
  lancamentos,
  onConciliar,
}: {
  lancamentos: Lancamento[];
  onConciliar: (id: string) => void;
}) {
  const [csv, setCsv] = useState("");
  const [linhas, setLinhas] = useState<LinhaExtrato[]>([]);

  const processar = () => {
    const parsed: LinhaExtrato[] = csv
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((linha) => {
        const [data, descricao, valorStr] = linha.split(";");
        const valor = Number((valorStr ?? "0").replace(",", "."));
        return { data: (data ?? "").trim(), descricao: (descricao ?? "").trim(), valor };
      })
      .filter((l) => l.data && !Number.isNaN(l.valor));

    const comMatch = parsed.map((linha) => {
      const alvo = new Date(`${linha.data}T12:00:00`).getTime();
      const match = lancamentos.find((l) => {
        if (l.conciliado) return false;
        const diffValor = Math.abs(Number(l.valor) - Math.abs(linha.valor));
        if (diffValor > 0.01) return false;
        const dataRef = l.data_pagamento ?? l.vencimento ?? l.data_competencia;
        const diffDias = Math.abs(new Date(`${dataRef}T12:00:00`).getTime() - alvo) / 86_400_000;
        return diffDias <= 3;
      });
      return { ...linha, match };
    });
    setLinhas(comMatch);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Extrato bancário (CSV)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Cole ou envie um extrato simples no formato <code>data;descricao;valor</code> (uma linha por
            transação, data no formato AAAA-MM-DD).
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              type="file"
              accept=".csv,text/csv"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setCsv(await file.text());
              }}
            />
          </div>
          <Textarea
            rows={6}
            placeholder="2024-05-10;Pagamento cliente João;1500.00"
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
          />
          <Button onClick={processar}>Processar extrato</Button>
        </CardContent>
      </Card>

      {linhas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Linhas do extrato ({linhas.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Lançamento correspondente</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {linhas.map((l, i) => (
                  <TableRow key={i}>
                    <TableCell>{dataBR(l.data)}</TableCell>
                    <TableCell>{l.descricao}</TableCell>
                    <TableCell className="text-right tabular-nums">{brl(l.valor)}</TableCell>
                    <TableCell>
                      {l.match ? (
                        <span className="text-sm">{l.match.descricao}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sem correspondência</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {l.match && !l.match.conciliado && (
                        <Button size="sm" onClick={() => onConciliar(l.match!.id)}>
                          <CheckCircle2 className="size-3.5" /> Conciliar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
