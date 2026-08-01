import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Plus, Search, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos e Serviços | Piscinow ERP" },
      {
        name: "description",
        content: "Cadastro de produtos e serviços com preços, estoque atual e estoque mínimo.",
      },
      { property: "og:title", content: "Produtos e Serviços | Piscinow ERP" },
      {
        property: "og:description",
        content: "Gerencie catálogo, preços e estoque da Piscinow.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Produtos />
    </RequireAuth>
  ),
});

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const vazio = {
  codigo: "",
  nome: "",
  categoria: "",
  tipo: "produto",
  unidade: "UN",
  preco_custo: "0",
  preco_venda: "0",
  estoque_atual: "0",
  estoque_minimo: "0",
  descricao: "",
};

function Produtos() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(vazio);

  const { data = [] } = useQuery({
    queryKey: ["produtos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("produtos").select("*").order("nome");
      if (error) throw error;
      return data;
    },
  });

  const salvar = useMutation({
    mutationFn: async () => {
      if (!form.nome.trim()) throw new Error("Informe o nome do item.");
      const { error } = await supabase.from("produtos").insert({
        codigo: form.codigo || null,
        nome: form.nome.trim(),
        categoria: form.categoria || null,
        tipo: form.tipo,
        unidade: form.unidade,
        preco_custo: Number(form.preco_custo) || 0,
        preco_venda: Number(form.preco_venda) || 0,
        estoque_atual: Number(form.estoque_atual) || 0,
        estoque_minimo: Number(form.estoque_minimo) || 0,
        descricao: form.descricao || null,
        created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Item cadastrado!");
      setForm(vazio);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["produtos"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const excluir = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("produtos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["produtos"] }),
  });

  const lista = data.filter((p) =>
    `${p.nome} ${p.codigo ?? ""} ${p.categoria ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  );
  const set = (k: keyof typeof vazio) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Produtos e Serviços</h1>
          <p className="text-sm text-muted-foreground">Catálogo, preços e estoque no banco.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus /> Novo item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo produto ou serviço</DialogTitle>
              <DialogDescription>Serviços não controlam estoque.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome" className="sm:col-span-2">
                <Input value={form.nome} onChange={(e) => set("nome")(e.target.value)} />
              </Field>
              <Field label="Código / SKU">
                <Input value={form.codigo} onChange={(e) => set("codigo")(e.target.value)} />
              </Field>
              <Field label="Categoria">
                <Input value={form.categoria} onChange={(e) => set("categoria")(e.target.value)} />
              </Field>
              <Field label="Tipo">
                <Select value={form.tipo} onValueChange={set("tipo")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="produto">Produto</SelectItem>
                    <SelectItem value="servico">Serviço</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Unidade">
                <Input value={form.unidade} onChange={(e) => set("unidade")(e.target.value)} />
              </Field>
              <Field label="Preço de custo (R$)">
                <Input
                  type="number"
                  step="0.01"
                  value={form.preco_custo}
                  onChange={(e) => set("preco_custo")(e.target.value)}
                />
              </Field>
              <Field label="Preço de venda (R$)">
                <Input
                  type="number"
                  step="0.01"
                  value={form.preco_venda}
                  onChange={(e) => set("preco_venda")(e.target.value)}
                />
              </Field>
              {form.tipo === "produto" && (
                <>
                  <Field label="Estoque atual">
                    <Input
                      type="number"
                      step="0.001"
                      value={form.estoque_atual}
                      onChange={(e) => set("estoque_atual")(e.target.value)}
                    />
                  </Field>
                  <Field label="Estoque mínimo">
                    <Input
                      type="number"
                      step="0.001"
                      value={form.estoque_minimo}
                      onChange={(e) => set("estoque_minimo")(e.target.value)}
                    />
                  </Field>
                </>
              )}
              <Field label="Descrição" className="sm:col-span-2">
                <Textarea
                  rows={3}
                  value={form.descricao}
                  onChange={(e) => set("descricao")(e.target.value)}
                />
              </Field>
            </div>
            <DialogFooter>
              <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
                Salvar item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="gap-3">
          <CardTitle>Catálogo ({lista.length})</CardTitle>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar item"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Venda</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((p) => {
                const baixo =
                  p.tipo === "produto" && Number(p.estoque_atual) <= Number(p.estoque_minimo);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {p.nome}
                      {p.codigo && (
                        <span className="ml-2 text-xs text-muted-foreground">{p.codigo}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{p.tipo}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{brl(Number(p.preco_custo))}</TableCell>
                    <TableCell className="text-right">{brl(Number(p.preco_venda))}</TableCell>
                    <TableCell className="text-right">
                      {p.tipo === "servico" ? (
                        "—"
                      ) : (
                        <span
                          className={
                            baixo ? "inline-flex items-center gap-1 text-destructive" : undefined
                          }
                        >
                          {baixo && <AlertTriangle className="size-3.5" />}
                          {Number(p.estoque_atual)} {p.unidade}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => excluir.mutate(p.id)}
                        aria-label={`Excluir ${p.nome}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {lista.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Nenhum item cadastrado ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
