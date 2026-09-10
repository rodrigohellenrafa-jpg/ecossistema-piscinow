import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Link2, Plus, Trash2 } from "lucide-react";
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

export const Route = createFileRoute("/financeiro")({
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
};

const vazio = {
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
  status: "Pendente",
  observacoes: "",
};

function Financeiro() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(vazio);

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
      if (!form.categoria.trim()) throw new Error("Informe a categoria.");
      const { error } = await supabase.from("lancamentos_financeiros").insert({
        tipo_fluxo: form.tipo_fluxo,
        categoria: form.categoria.trim(),
        descricao: form.descricao.trim(),
        valor: Number(form.valor) || 0,
        data_competencia: form.data_competencia || hojeISO(),
        vencimento: form.vencimento || null,
        data_pagamento: form.data_pagamento || null,
        conta_bancaria: form.conta_bancaria || null,
        forma_pagamento: form.forma_pagamento || null,
        venda_id: form.venda_id || null,
        fornecedor_id: form.fornecedor_id || null,
        funcionario_id: form.funcionario_id || null,
        status: form.status,
        observacoes: form.observacoes || null,
        created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lançamento criado!");
      setForm(vazio);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["lancamentos_financeiros"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const marcarPago = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("lancamentos_financeiros")
        .update({ status: "Pago", data_pagamento: hojeISO() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lançamento marcado como pago.");
      qc.invalidateQueries({ queryKey: ["lancamentos_financeiros"] });
    },
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
      const { error } = await supabase.from("lancamentos_financeiros").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lançamento excluído.");
      qc.invalidateQueries({ queryKey: ["lancamentos_financeiros"] });
    },
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
    .filter((l) => l.status === "Pago")
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
      <PageHeader
        title="Fluxo de Caixa"
        subtitle="Lançamentos financeiros, evolução mensal e conciliação bancária."
        actions={
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
                <Field label="Tipo de fluxo">
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
                <Field label="Categoria">
                  <Input value={form.categoria} onChange={(e) => set("categoria")(e.target.value)} />
                </Field>
                <Field label="Descrição" className="sm:col-span-2">
                  <Input value={form.descricao} onChange={(e) => set("descricao")(e.target.value)} />
                </Field>
                <Field label="Valor (R$)">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.valor}
                    onChange={(e) => set("valor")(e.target.value)}
                  />
                </Field>
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
                <Field label="Data de pagamento">
                  <Input
                    type="date"
                    value={form.data_pagamento}
                    onChange={(e) => set("data_pagamento")(e.target.value)}
                  />
                </Field>
                <Field label="Conta bancária">
                  <Input
                    value={form.conta_bancaria}
                    onChange={(e) => set("conta_bancaria")(e.target.value)}
                  />
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
                <Field label="Fornecedor vinculado">
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
                <Field label="Observações" className="sm:col-span-2">
                  <Textarea
                    value={form.observacoes}
                    onChange={(e) => set("observacoes")(e.target.value)}
                  />
                </Field>
              </div>
              <DialogFooter>
                <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
                  Salvar lançamento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Receitas do mês" value={brl(receitaMes)} tone="positive" />
        <Kpi label="Despesas do mês" value={brl(despesaMes)} tone="negative" />
        <Kpi label="Saldo do mês" value={brl(saldoMes)} tone={saldoMes >= 0 ? "positive" : "negative"} />
        <Kpi
          label="Previsto x Realizado"
          value={`${brl(realizado)} / ${brl(previsto)}`}
          hint="Realizado (pago) sobre o previsto no período"
        />
      </div>

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
                        <TableCell className="max-w-[220px] truncate">{l.descricao}</TableCell>
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
                          <Badge variant={l.status === "Pago" ? "secondary" : l.status === "Cancelado" ? "outline" : "default"}>
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
                              <Button variant="ghost" size="icon" onClick={() => marcarPago.mutate(l.id)} title="Marcar como pago">
                                <CheckCircle2 className="size-4" />
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
