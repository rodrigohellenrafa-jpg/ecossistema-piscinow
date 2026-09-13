import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
  tipo: "pagar",
  descricao: "",
  parceiro: "",
  categoria: "",
  valor: "0",
  valor_juros: "0",
  vencimento: "",
  observacoes: "",
};

function Contas() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(vazio);

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

  const salvar = useMutation({
    mutationFn: async () => {
      if (!form.descricao.trim()) throw new Error("Informe a descrição do título.");
      if (!form.vencimento) throw new Error("Informe o vencimento.");
      const { error } = await supabase.from("contas").insert({
        tipo: form.tipo,
        descricao: form.descricao.trim(),
        parceiro: form.parceiro || null,
        categoria: form.categoria || null,
        valor: Number(form.valor) || 0,
        valor_juros: Number(form.valor_juros) || 0,
        vencimento: form.vencimento,
        status: "aberto",
        observacoes: form.observacoes || null,
        created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Título lançado!");
      setForm(vazio);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["contas"] });
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

  const set = (k: keyof typeof vazio) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const pagar = data.filter((c) => c.tipo === "pagar");
  const receber = data.filter((c) => c.tipo === "receber");
  const soma = (l: typeof data) =>
    l.filter((c) => c.status !== "pago").reduce((s, c) => s + Number(c.valor), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contas a Pagar e Receber</h1>
          <p className="text-sm text-muted-foreground">Títulos com vencimento e baixa manual.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus /> Novo título
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Novo lançamento</DialogTitle>
              <DialogDescription>Conta a pagar ou a receber.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
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
              <Field label="Valor da parcela (R$)">
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
                  Total do título: {brl((Number(form.valor) || 0) + (Number(form.valor_juros) || 0))}
                </p>
              </Field>
              <Field label="Vencimento">
                <Input
                  type="date"
                  value={form.vencimento}
                  onChange={(e) => set("vencimento")(e.target.value)}
                />
              </Field>
              <Field label="Observações" className="sm:col-span-2">
                <Textarea
                  rows={3}
                  value={form.observacoes}
                  onChange={(e) => set("observacoes")(e.target.value)}
                />
              </Field>
            </div>
            <DialogFooter>
              <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
                Lançar título
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
            onBaixar={(id) => baixar.mutate(id)}
            onExcluir={(id) => excluir.mutate(id)}
          />
        </TabsContent>
        <TabsContent value="receber">
          <Lista
            titulo={`Em aberto: ${brl(soma(receber))}`}
            itens={receber}
            onBaixar={(id) => baixar.mutate(id)}
            onExcluir={(id) => excluir.mutate(id)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

type Conta = {
  id: string;
  descricao: string;
  parceiro: string | null;
  categoria: string | null;
  valor: number;
  valor_juros?: number | null;
  vencimento: string;
  status: string;
};

function Lista({
  titulo,
  itens,
  onBaixar,
  onExcluir,
}: {
  titulo: string;
  itens: Conta[];
  onBaixar: (id: string) => void;
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
                  <TableCell className="font-medium">{c.descricao}</TableCell>
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
