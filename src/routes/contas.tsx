import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { VinculoField, parseVinculo } from "@/components/centro-custo-field";
import { Field } from "@/components/field";
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
import { Switch } from "@/components/ui/switch";
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
import type { Tables } from "@/integrations/supabase/types";
import { useAbrirModal } from "@/hooks/use-abrir-modal";

export const Route = createFileRoute("/contas")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Contas a Pagar e Receber | Piscinow ERP" },
      {
        name: "description",
        content: "Lance contas a pagar e a receber, acompanhe vencimentos e dê baixa nos títulos.",
      },
      { property: "og:title", content: "Contas a Pagar e Receber | Piscinow ERP" },
      { property: "og:description", content: "Controle financeiro de títulos da Piscinow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Contas />
    </RequireAuth>
  ),
});

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const vazio = {
  obra_id: "",
  vinculo: "",
  numero_documento: "",
  tipo: "pagar",
  descricao: "",
  parceiro: "",
  categoria: "",
  valor: "0",
  valor_juros: "0",
  vencimento: "",
  recorrencia: "nenhuma",
  recorrencia_fim: "",
  tipo_despesa: "",
  observacoes: "",
};

const TIPOS_DESPESA = [
  { valor: "fixa", rotulo: "Despesa fixa" },
  { valor: "variavel", rotulo: "Despesa variável" },
  { valor: "operacional", rotulo: "Despesa operacional" },
  { valor: "pessoal", rotulo: "Despesa pessoal" },
] as const;

const fornecedorVazio = {
  nome: "",
  cnpj: "",
  telefone: "",
  email: "",
};

const RECORRENCIAS: { valor: string; rotulo: string }[] = [
  { valor: "nenhuma", rotulo: "Pagamento único (sem recorrência)" },
  { valor: "diaria", rotulo: "Diária" },
  { valor: "semanal", rotulo: "Semanal" },
  { valor: "quinzenal", rotulo: "Quinzenal" },
  { valor: "mensal", rotulo: "Mensal" },
  { valor: "bimestral", rotulo: "Bimestral" },
  { valor: "trimestral", rotulo: "Trimestral" },
  { valor: "semestral", rotulo: "Semestral" },
  { valor: "anual", rotulo: "Anual" },
];

function proximaData(iso: string, recorrencia: string): string | null {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  switch (recorrencia) {
    case "diaria": d.setDate(d.getDate() + 1); break;
    case "semanal": d.setDate(d.getDate() + 7); break;
    case "quinzenal": d.setDate(d.getDate() + 15); break;
    case "mensal": d.setMonth(d.getMonth() + 1); break;
    case "bimestral": d.setMonth(d.getMonth() + 2); break;
    case "trimestral": d.setMonth(d.getMonth() + 3); break;
    case "semestral": d.setMonth(d.getMonth() + 6); break;
    case "anual": d.setFullYear(d.getFullYear() + 1); break;
    default: return null;
  }
  return d.toISOString().slice(0, 10);
}

const rotuloRecorrencia = (v: string) =>
  RECORRENCIAS.find((r) => r.valor === v)?.rotulo ?? null;

const PERIODOS = [
  { valor: "todas", rotulo: "Todas" },
  { valor: "hoje", rotulo: "Hoje" },
  { valor: "semana", rotulo: "Esta semana" },
  { valor: "mes", rotulo: "Este mês" },
  { valor: "trimestre", rotulo: "Este trimestre" },
  { valor: "semestre", rotulo: "Este semestre" },
  { valor: "ano", rotulo: "Este ano" },
];

function noPeriodo(vencimento: string, periodo: string): boolean {
  if (periodo === "todas") return true;
  const d = new Date(`${vencimento}T00:00:00`);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  if (periodo === "hoje") return d.getTime() === hoje.getTime();
  if (periodo === "semana") {
    const inicio = new Date(hoje);
    inicio.setDate(hoje.getDate() - hoje.getDay()); // domingo
    const fim = new Date(inicio);
    fim.setDate(inicio.getDate() + 6);
    return d >= inicio && d <= fim;
  }
  if (periodo === "mes") return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
  if (periodo === "trimestre")
    return Math.floor(d.getMonth() / 3) === Math.floor(hoje.getMonth() / 3) && d.getFullYear() === hoje.getFullYear();
  if (periodo === "semestre")
    return Math.floor(d.getMonth() / 6) === Math.floor(hoje.getMonth() / 6) && d.getFullYear() === hoje.getFullYear();
  if (periodo === "ano") return d.getFullYear() === hoje.getFullYear();
  return true;
}

function Contas() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  useAbrirModal("novo", () => setOpen(true));
  const [form, setForm] = useState(vazio);
  const [periodo, setPeriodo] = useState("todas");

  const { data = [] } = useQuery({
    queryKey: ["contas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas")
        .select("*")
        .order("vencimento", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ["fornecedores-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fornecedores")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome", { ascending: true });
      if (error) throw error;
      return data as Tables<"fornecedores">[];
    },
  });

  const { data: categorias = [] } = useQuery({
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

  const [novaCategoria, setNovaCategoria] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  useAbrirModal("categoria", () => setCatOpen(true));

  const [fornOpen, setFornOpen] = useState(false);
  const [novoFornecedor, setNovoFornecedor] = useState(fornecedorVazio);

  const [ratear, setRatear] = useState(false);
  const [rateio, setRateio] = useState<{ categoria: string; valor: string }[]>([
    { categoria: "", valor: "" },
    { categoria: "", valor: "" },
  ]);

  const { data: rateios = [] } = useQuery({
    queryKey: ["conta-rateios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conta_rateios")
        .select("id, conta_id, categoria, valor");
      if (error) throw error;
      return data as { id: string; conta_id: string; categoria: string; valor: number }[];
    },
  });

  const totalTitulo = (Number(form.valor) || 0) + (Number(form.valor_juros) || 0);
  const somaRateio = rateio.reduce((s, r) => s + (Number(r.valor) || 0), 0);
  const diferenca = Math.round((totalTitulo - somaRateio) * 100) / 100;

  const salvarCategoria = useMutation({
    mutationFn: async () => {
      const nome = novaCategoria.trim();
      if (!nome) throw new Error("Informe o nome da categoria.");
      const { error } = await supabase.from("categorias_financeiras").insert({
        nome,
        tipo: form.tipo,
        created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
      });
      if (error) throw error;
      return nome;
    },
    onSuccess: (nome) => {
      toast.success("Categoria cadastrada!");
      setNovaCategoria("");
      setCatOpen(false);
      setForm((f) => ({ ...f, categoria: nome }));
      qc.invalidateQueries({ queryKey: ["categorias-financeiras"] });
    },
    onError: (e: Error) =>
      toast.error(e.message.includes("duplicate") ? "Categoria já existe." : e.message),
  });

  const salvarFornecedor = useMutation({
    mutationFn: async () => {
      const nome = novoFornecedor.nome.trim();
      if (!nome) throw new Error("Informe o nome do fornecedor.");
      const { data: criado, error } = await supabase
        .from("fornecedores")
        .insert({
          nome,
          cnpj: novoFornecedor.cnpj || null,
          telefone: novoFornecedor.telefone || null,
          email: novoFornecedor.email || null,
          prazo_entrega_dias: 0,
          ativo: true,
          created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
        })
        .select("nome")
        .single();
      if (error) throw error;
      return criado.nome;
    },
    onSuccess: (nome) => {
      toast.success("Fornecedor cadastrado!");
      setNovoFornecedor(fornecedorVazio);
      setFornOpen(false);
      setForm((f) => ({ ...f, parceiro: nome }));
      qc.invalidateQueries({ queryKey: ["fornecedores"] });
      qc.invalidateQueries({ queryKey: ["fornecedores-select"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const salvar = useMutation({
    mutationFn: async () => {
      if (!form.descricao.trim()) throw new Error("Informe a descrição do título.");
      if (!form.vencimento) throw new Error("Informe o vencimento.");

      const linhas = rateio
        .map((r) => ({ categoria: r.categoria.trim(), valor: Number(r.valor) || 0 }))
        .filter((r) => r.categoria && r.valor > 0);

      if (ratear) {
        if (linhas.length < 2) throw new Error("Informe ao menos duas categorias no rateio.");
        if (Math.abs(diferenca) > 0.005)
          throw new Error(
            `A soma das categorias (${brl(somaRateio)}) precisa bater com o total do título (${brl(totalTitulo)}).`,
          );
      }

      const uid = (await supabase.auth.getUser()).data.user?.id ?? null;

      if (editando) {
        const { error } = await supabase
          .from("contas")
          .update({
            tipo: form.tipo,
            descricao: form.descricao.trim(),
            parceiro: form.parceiro || null,
            categoria: ratear ? "Rateio" : form.categoria || null,
            valor: Number(form.valor) || 0,
            valor_juros: Number(form.valor_juros) || 0,
            vencimento: form.vencimento,
            observacoes: form.observacoes || null,
            obra_id: parseVinculo(form.vinculo).obra_id ?? (form.obra_id || null),
            funcionario_id: parseVinculo(form.vinculo).funcionario_id,
            cliente_id: parseVinculo(form.vinculo).cliente_id,
            numero_documento: form.numero_documento || null,
            recorrencia: form.recorrencia,
            recorrencia_fim:
              form.recorrencia !== "nenhuma" && form.recorrencia_fim
                ? form.recorrencia_fim
                : null,
            tipo_despesa: form.tipo === "pagar" && form.tipo_despesa ? form.tipo_despesa : null,
          })
          .eq("id", editando);
        if (error) throw error;

        const { error: errDel } = await supabase
          .from("conta_rateios")
          .delete()
          .eq("conta_id", editando);
        if (errDel) throw errDel;
        if (ratear) {
          const { error: err2 } = await supabase.from("conta_rateios").insert(
            linhas.map((l) => ({
              conta_id: editando,
              categoria: l.categoria,
              valor: l.valor,
              created_by: uid,
            })),
          );
          if (err2) throw err2;
        }
        return;
      }

      const { data: criada, error } = await supabase
        .from("contas")
        .insert({
          tipo: form.tipo,
          descricao: form.descricao.trim(),
          parceiro: form.parceiro || null,
          categoria: ratear ? "Rateio" : form.categoria || null,
          valor: Number(form.valor) || 0,
          valor_juros: Number(form.valor_juros) || 0,
          vencimento: form.vencimento,
          status: "aberto",
          observacoes: form.observacoes || null,
          obra_id: parseVinculo(form.vinculo).obra_id ?? (form.obra_id || null),
          funcionario_id: parseVinculo(form.vinculo).funcionario_id,
          cliente_id: parseVinculo(form.vinculo).cliente_id,
          numero_documento: form.numero_documento || null,
          recorrencia: form.recorrencia,
          recorrencia_fim:
            form.recorrencia !== "nenhuma" && form.recorrencia_fim ? form.recorrencia_fim : null,
          tipo_despesa: form.tipo === "pagar" && form.tipo_despesa ? form.tipo_despesa : null,
          created_by: uid,
        })
        .select("id")
        .single();
      if (error) throw error;

      if (ratear && criada) {
        const { error: err2 } = await supabase.from("conta_rateios").insert(
          linhas.map((l) => ({
            conta_id: criada.id,
            categoria: l.categoria,
            valor: l.valor,
            created_by: uid,
          })),
        );
        if (err2) throw err2;
      }
    },
    onSuccess: () => {
      toast.success(editando ? "Lançamento atualizado!" : "Título lançado!");
      setForm(vazio);
      setEditando(null);
      setRatear(false);
      setRateio([
        { categoria: "", valor: "" },
        { categoria: "", valor: "" },
      ]);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["contas"] });
      qc.invalidateQueries({ queryKey: ["conta-rateios"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const baixar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contas")
        .update({ status: "pago", data_pagamento: new Date().toISOString().slice(0, 10) })
        .eq("id", id);
      if (error) throw error;

      // Recorrência: gera o próximo vencimento automaticamente
      const { data: conta } = await supabase
        .from("contas")
        .select("*")
        .eq("id", id)
        .single();
      if (conta && conta.recorrencia && conta.recorrencia !== "nenhuma") {
        const proxima = proximaData(conta.vencimento, conta.recorrencia);
        const fimRecorrencia = (conta as { recorrencia_fim?: string | null }).recorrencia_fim;
        if (proxima && (!fimRecorrencia || proxima <= fimRecorrencia)) {
          const uid = (await supabase.auth.getUser()).data.user?.id ?? null;
          const { error: errRec } = await supabase.from("contas").insert({
            tipo: conta.tipo,
            descricao: conta.descricao,
            parceiro: conta.parceiro,
            cliente_id: conta.cliente_id,
            funcionario_id: (conta as { funcionario_id?: string | null }).funcionario_id ?? null,
            categoria: conta.categoria,
            valor: conta.valor,
            valor_juros: conta.valor_juros ?? 0,
            vencimento: proxima,
            status: "aberto",
            observacoes: conta.observacoes,
            obra_id: conta.obra_id,
            numero_documento: conta.numero_documento,
            venda_id: conta.venda_id,
            recorrencia: conta.recorrencia,
            recorrencia_fim: fimRecorrencia ?? null,
            tipo_despesa: (conta as { tipo_despesa?: string | null }).tipo_despesa ?? null,
            created_by: uid,
          });
          if (errRec) throw errRec;
        }
      }
    },
    onSuccess: () => {
      toast.success("Baixa registrada.");
      qc.invalidateQueries({ queryKey: ["contas"] });
    },
  });

  const excluir = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contas"] }),
  });

  const abrirEdicao = (c: Conta) => {
    setEditando(c.id);
    const vinculo = c.obra_id
      ? `obra:${c.obra_id}`
      : c.funcionario_id
        ? `func:${c.funcionario_id}`
        : c.cliente_id
          ? `cli:${c.cliente_id}`
          : "";
    setForm({
      obra_id: c.obra_id ?? "",
      vinculo,
      numero_documento: c.numero_documento ?? "",
      tipo: c.tipo,
      descricao: c.descricao,
      parceiro: c.parceiro ?? "",
      categoria: c.categoria === "Rateio" ? "" : (c.categoria ?? ""),
      valor: String(c.valor ?? 0),
      valor_juros: String(c.valor_juros ?? 0),
      vencimento: c.vencimento,
      recorrencia: c.recorrencia ?? "nenhuma",
      recorrencia_fim: c.recorrencia_fim ?? "",
      tipo_despesa: c.tipo_despesa ?? "",
      observacoes: c.observacoes ?? "",
    });
    const linhasExistentes = rateios.filter((r) => r.conta_id === c.id);
    if (linhasExistentes.length > 0) {
      setRatear(true);
      setRateio(
        linhasExistentes.map((r) => ({ categoria: r.categoria, valor: String(r.valor) })),
      );
    } else {
      setRatear(false);
      setRateio([
        { categoria: "", valor: "" },
        { categoria: "", valor: "" },
      ]);
    }
    setOpen(true);
  };

  const set = (k: keyof typeof vazio) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const filtradas = data.filter((c) => noPeriodo(c.vencimento, periodo));
  const pagar = filtradas.filter((c) => c.tipo === "pagar");
  const receber = filtradas.filter((c) => c.tipo === "receber");
  const soma = (l: typeof data) =>
    l.filter((c) => c.status !== "pago").reduce((s, c) => s + Number(c.valor), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contas a Pagar e Receber</h1>
          <p className="text-sm text-muted-foreground">Títulos com vencimento e baixa manual.</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) {
              setEditando(null);
              setForm(vazio);
              setRatear(false);
              setRateio([
                { categoria: "", valor: "" },
                { categoria: "", valor: "" },
              ]);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus /> Novo lançamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editando ? "Editar lançamento" : "Novo lançamento"}</DialogTitle>
              <DialogDescription>Conta a pagar ou a receber.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
<h3 className="border-b pb-2 text-sm font-semibold sm:col-span-2">Dados do lançamento</h3>
              <Field label="Tipo">
                <Select value={form.tipo} onValueChange={set("tipo")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pagar">A pagar</SelectItem>
                    <SelectItem value="receber">A receber</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={form.tipo === "pagar" ? "Fornecedor" : "Cliente"}>
                {form.tipo === "pagar" ? (
                  <div className="flex gap-1">
                    <Select value={form.parceiro} onValueChange={set("parceiro")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o fornecedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {fornecedores.map((f) => (
                          <SelectItem key={f.id} value={f.nome}>
                            {f.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Dialog open={fornOpen} onOpenChange={setFornOpen}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="icon" title="Novo fornecedor">
                          <Plus />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Novo fornecedor</DialogTitle>
                          <DialogDescription>
                            Cadastre o fornecedor rapidamente.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="Nome / Razão social" className="sm:col-span-2">
                            <Input
                              value={novoFornecedor.nome}
                              onChange={(e) =>
                                setNovoFornecedor((f) => ({ ...f, nome: e.target.value }))
                              }
                              placeholder="Ex.: Light S/A"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  salvarFornecedor.mutate();
                                }
                              }}
                            />
                          </Field>
                          <Field label="CNPJ">
                            <Input
                              value={novoFornecedor.cnpj}
                              onChange={(e) =>
                                setNovoFornecedor((f) => ({ ...f, cnpj: e.target.value }))
                              }
                            />
                          </Field>
                          <Field label="Telefone">
                            <Input
                              value={novoFornecedor.telefone}
                              onChange={(e) =>
                                setNovoFornecedor((f) => ({ ...f, telefone: e.target.value }))
                              }
                            />
                          </Field>
                          <Field label="E-mail" className="sm:col-span-2">
                            <Input
                              type="email"
                              value={novoFornecedor.email}
                              onChange={(e) =>
                                setNovoFornecedor((f) => ({ ...f, email: e.target.value }))
                              }
                            />
                          </Field>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFornOpen(false)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={() => salvarFornecedor.mutate()}
                            disabled={salvarFornecedor.isPending}
                          >
                            Salvar fornecedor
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <Input
                    value={form.parceiro}
                    onChange={(e) => set("parceiro")(e.target.value)}
                    placeholder="Nome do cliente"
                  />
                )}
              </Field>
              <Field label="Descrição" className="sm:col-span-2">
                <Input value={form.descricao} onChange={(e) => set("descricao")(e.target.value)} />
              </Field>
<h3 className="border-b pb-2 text-sm font-semibold sm:col-span-2">Valores e categorias</h3>
              {!ratear && (
              <Field label="Categoria">
                <div className="flex gap-1">
                  <Select value={form.categoria} onValueChange={set("categoria")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias
                        .filter((c) => c.tipo === "ambas" || c.tipo === form.tipo)
                        .map((c) => (
                          <SelectItem key={c.id} value={c.nome}>
                            {c.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={catOpen} onOpenChange={setCatOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon" title="Nova categoria">
                        <Plus />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-sm">
                      <DialogHeader>
                        <DialogTitle>Nova categoria</DialogTitle>
                        <DialogDescription>
                          Cadastre uma categoria de {form.tipo === "pagar" ? "contas a pagar" : "contas a receber"}.
                        </DialogDescription>
                      </DialogHeader>
                      <Input
                        value={novaCategoria}
                        onChange={(e) => setNovaCategoria(e.target.value)}
                        placeholder="Ex.: Combustível"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            salvarCategoria.mutate();
                          }
                        }}
                      />
                      <DialogFooter>
                        <Button onClick={() => salvarCategoria.mutate()} disabled={salvarCategoria.isPending}>
                          Salvar categoria
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
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
              <Field label="Juros (R$)">
                <Input
                  type="number"
                  step="0.01"
                  value={form.valor_juros}
                  onChange={(e) => set("valor_juros")(e.target.value)}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Total do lançamento: {brl((Number(form.valor) || 0) + (Number(form.valor_juros) || 0))}
                </p>
              </Field>
              <div className="rounded-lg border p-3 sm:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Rateio de categorias</p>
                    <p className="text-xs text-muted-foreground">
                      Um único pagamento dividido entre várias categorias no DRE e nos relatórios.
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
                              {categorias
                                .filter((c) => c.tipo === "ambas" || c.tipo === form.tipo)
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
                          Math.abs(diferenca) > 0.005
                            ? "text-xs font-medium text-destructive"
                            : "text-xs font-medium text-emerald-600"
                        }
                      >
                        Rateado {brl(somaRateio)} de {brl(totalTitulo)}
                        {Math.abs(diferenca) > 0.005
                          ? ` — faltam ${brl(diferenca)}`
                          : " — valores conferem"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
<h3 className="border-b pb-2 text-sm font-semibold sm:col-span-2">Pagamento e recorrência</h3>
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
                    <SelectValue placeholder="Pagamento único" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECORRENCIAS.map((r) => (
                      <SelectItem key={r.valor} value={r.valor}>
                        {r.rotulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.recorrencia !== "nenhuma" && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ao dar baixa, o próximo vencimento ({rotuloRecorrencia(form.recorrencia)?.toLowerCase()}) é gerado automaticamente.
                  </p>
                )}
              </Field>
              {form.recorrencia !== "nenhuma" && (
                <Field label="Repetir até (opcional)">
                  <Input
                    type="date"
                    value={form.recorrencia_fim}
                    onChange={(e) => set("recorrencia_fim")(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Deixe em branco para repetir sem limite. Depois dessa data nenhum novo
                    vencimento é gerado.
                  </p>
                </Field>
              )}
              {form.tipo === "pagar" && (
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
                      {TIPOS_DESPESA.map((t) => (
                        <SelectItem key={t.valor} value={t.valor}>
                          {t.rotulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
<h3 className="border-b pb-2 text-sm font-semibold sm:col-span-2">Vínculos e documento</h3>
              <VinculoField value={form.vinculo} onChange={(v: string)=>setForm(f=>({...f,vinculo:v}))} />
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
                {salvar.isPending ? "Salvando…" : editando ? "Salvar alterações" : "Salvar lançamento"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="pagar">
        <TabsList>
          <TabsTrigger value="pagar">A pagar ({pagar.length})</TabsTrigger>
          <TabsTrigger value="receber">A receber ({receber.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pagar">
          <Lista
            titulo={`Em aberto: ${brl(soma(pagar))}`}
            itens={pagar}
            rateios={rateios}
            onBaixar={(id) => baixar.mutate(id)}
            onEditar={abrirEdicao}
            onExcluir={(id) => excluir.mutate(id)}
          />
        </TabsContent>
        <TabsContent value="receber">
          <Lista
            titulo={`Em aberto: ${brl(soma(receber))}`}
            itens={receber}
            rateios={rateios}
            onBaixar={(id) => baixar.mutate(id)}
            onEditar={abrirEdicao}
            onExcluir={(id) => excluir.mutate(id)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

type Conta = {
  id: string;
  tipo: string;
  descricao: string;
  parceiro: string | null;
  categoria: string | null;
  valor: number;
  valor_juros?: number | null;
  vencimento: string;
  status: string;
  recorrencia?: string | null;
  recorrencia_fim?: string | null;
  tipo_despesa?: string | null;
  observacoes?: string | null;
  numero_documento?: string | null;
  obra_id?: string | null;
  funcionario_id?: string | null;
  cliente_id?: string | null;
};

function Lista({
  titulo,
  itens,
  rateios = [],
  onBaixar,
  onEditar,
  onExcluir,
}: {
  titulo: string;
  itens: Conta[];
  rateios?: { conta_id: string; categoria: string; valor: number }[];
  onBaixar: (id: string) => void;
  onEditar: (c: Conta) => void;
  onExcluir: (id: string) => void;
}) {
  const hoje = new Date().toISOString().slice(0, 10);
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Parceiro</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead className="text-right">Parcela</TableHead>
              <TableHead className="text-right">Juros</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens.map((c) => {
              const vencido = c.status !== "pago" && c.vencimento < hoje;
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {c.descricao}
                    {c.recorrencia && c.recorrencia !== "nenhuma" && (
                      <Badge variant="outline" className="ml-2 align-middle text-xs font-normal">
                        {rotuloRecorrencia(c.recorrencia)}
                      </Badge>
                    )}
                    {rateios.some((r) => r.conta_id === c.id) && (
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">
                        Rateio:{" "}
                        {rateios
                          .filter((r) => r.conta_id === c.id)
                          .map((r) => `${r.categoria} ${brl(Number(r.valor))}`)
                          .join(" · ")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{c.parceiro ?? "—"}</TableCell>
                  <TableCell className={vencido ? "text-destructive" : undefined}>
                    {new Date(`${c.vencimento}T00:00:00`).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">{brl(Number(c.valor))}</TableCell>
                  <TableCell className="text-right">{brl(Number(c.valor_juros ?? 0))}</TableCell>
                  <TableCell className="text-right font-medium">
                    {brl(Number(c.valor) + Number(c.valor_juros ?? 0))}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.status === "pago" ? "secondary" : vencido ? "destructive" : "outline"}>
                      {c.status === "pago" ? "Pago" : vencido ? "Vencido" : "Aberto"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-1">
                    {c.status !== "pago" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onBaixar(c.id)}
                        aria-label="Dar baixa"
                      >
                        <CheckCircle2 className="size-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEditar(c)}
                      aria-label="Editar lançamento"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onExcluir(c.id)}
                      aria-label="Excluir"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {itens.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Nenhum título lançado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
