import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/field";
import { PageHeader } from "@/components/page-header";
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
import { brl, CATEGORIAS_PRODUTO, margem, pct } from "@/lib/erp";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos e Serviços | Piscinow ERP" },
      {
        name: "description",
        content: "Cadastro de produtos e serviços com preços, custos, fornecedor, fiscal e estoque.",
      },
      { property: "og:title", content: "Produtos e Serviços | Piscinow ERP" },
      {
        property: "og:description",
        content: "Gerencie catálogo, preços, margens e estoque da Piscinow.",
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

type Produto = Tables<"produtos">;

const SEM_FORNECEDOR = "__nenhum__";
const TODAS_CATEGORIAS = "__todas__";

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
  custo_fabricacao: "0",
  custo_logistico: "0",
  fornecedor_id: SEM_FORNECEDOR,
  ncm: "",
  cst: "",
  cfop: "",
  localizacao: "",
  descricao: "",
};

function Produtos() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>(TODAS_CATEGORIAS);
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [form, setForm] = useState(vazio);

  const { data = [] } = useQuery({
    queryKey: ["produtos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("produtos").select("*").order("nome");
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
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const abrirNovo = () => {
    setEditando(null);
    setForm(vazio);
    setOpen(true);
  };

  const abrirEdicao = (p: Produto) => {
    setEditando(p);
    setForm({
      codigo: p.codigo ?? "",
      nome: p.nome,
      categoria: p.categoria ?? "",
      tipo: p.tipo,
      unidade: p.unidade,
      preco_custo: String(p.preco_custo ?? 0),
      preco_venda: String(p.preco_venda ?? 0),
      estoque_atual: String(p.estoque_atual ?? 0),
      estoque_minimo: String(p.estoque_minimo ?? 0),
      custo_fabricacao: String(p.custo_fabricacao ?? 0),
      custo_logistico: String(p.custo_logistico ?? 0),
      fornecedor_id: p.fornecedor_id ?? SEM_FORNECEDOR,
      ncm: p.ncm ?? "",
      cst: p.cst ?? "",
      cfop: p.cfop ?? "",
      localizacao: p.localizacao ?? "",
      descricao: p.descricao ?? "",
    });
    setOpen(true);
  };

  const salvar = useMutation({
    mutationFn: async () => {
      if (!form.nome.trim()) throw new Error("Informe o nome do item.");
      const payload = {
        codigo: form.codigo || null,
        nome: form.nome.trim(),
        categoria: form.categoria || null,
        tipo: form.tipo,
        unidade: form.unidade,
        preco_custo: Number(form.preco_custo) || 0,
        preco_venda: Number(form.preco_venda) || 0,
        estoque_atual: Number(form.estoque_atual) || 0,
        estoque_minimo: Number(form.estoque_minimo) || 0,
        custo_fabricacao: Number(form.custo_fabricacao) || 0,
        custo_logistico: Number(form.custo_logistico) || 0,
        fornecedor_id: form.fornecedor_id === SEM_FORNECEDOR ? null : form.fornecedor_id,
        ncm: form.ncm || null,
        cst: form.cst || null,
        cfop: form.cfop || null,
        localizacao: form.localizacao || null,
        descricao: form.descricao || null,
      };
      if (editando) {
        const { error } = await supabase.from("produtos").update(payload).eq("id", editando.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("produtos").insert({
          ...payload,
          created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editando ? "Item atualizado!" : "Item cadastrado!");
      setForm(vazio);
      setEditando(null);
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

  const lista = data
    .filter((p) => filtroCategoria === TODAS_CATEGORIAS || p.categoria === filtroCategoria)
    .filter((p) =>
      `${p.nome} ${p.codigo ?? ""} ${p.categoria ?? ""}`.toLowerCase().includes(q.toLowerCase()),
    );
  const set = (k: keyof typeof vazio) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const nomeFornecedor = (id: string | null) =>
    fornecedores.find((f) => f.id === id)?.nome ?? "—";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos e Serviços"
        subtitle="Catálogo, preços, custos e estoque no banco."
        actions={
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) setEditando(null);
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={abrirNovo}>
                <Plus /> Novo item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editando ? "Editar item" : "Novo produto ou serviço"}</DialogTitle>
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
                  <Select value={form.categoria || undefined} onValueChange={set("categoria")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_PRODUTO.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <Field label="Custo de fabricação (R$)">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.custo_fabricacao}
                    onChange={(e) => set("custo_fabricacao")(e.target.value)}
                  />
                </Field>
                <Field label="Custo logístico (R$)">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.custo_logistico}
                    onChange={(e) => set("custo_logistico")(e.target.value)}
                  />
                </Field>
                <Field label="Fornecedor">
                  <Select value={form.fornecedor_id} onValueChange={set("fornecedor_id")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SEM_FORNECEDOR}>Sem fornecedor</SelectItem>
                      {fornecedores.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Localização no galpão">
                  <Input
                    value={form.localizacao}
                    onChange={(e) => set("localizacao")(e.target.value)}
                  />
                </Field>
                <Field label="NCM">
                  <Input value={form.ncm} onChange={(e) => set("ncm")(e.target.value)} />
                </Field>
                <Field label="CST">
                  <Input value={form.cst} onChange={(e) => set("cst")(e.target.value)} />
                </Field>
                <Field label="CFOP">
                  <Input value={form.cfop} onChange={(e) => set("cfop")(e.target.value)} />
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
                  {editando ? "Salvar alterações" : "Salvar item"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader className="gap-3">
          <CardTitle>Catálogo ({lista.length})</CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar item"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODAS_CATEGORIAS}>Todas as categorias</SelectItem>
                {CATEGORIAS_PRODUTO.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Venda</TableHead>
                <TableHead className="text-right">Margem</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((p) => {
                const baixo =
                  p.tipo === "produto" && Number(p.estoque_atual) <= Number(p.estoque_minimo);
                const custoTotal =
                  Number(p.custo_fabricacao) + Number(p.custo_logistico) || Number(p.preco_custo);
                const m = margem(Number(p.preco_venda), custoTotal);
                return (
                  <TableRow key={p.id} className={baixo ? "bg-destructive/5" : undefined}>
                    <TableCell className="font-medium">
                      {p.nome}
                      {p.codigo && (
                        <span className="ml-2 text-xs text-muted-foreground">{p.codigo}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{p.tipo}</Badge>
                    </TableCell>
                    <TableCell>{nomeFornecedor(p.fornecedor_id)}</TableCell>
                    <TableCell className="text-right">{brl(Number(p.preco_custo))}</TableCell>
                    <TableCell className="text-right">{brl(Number(p.preco_venda))}</TableCell>
                    <TableCell className="text-right">{pct(m)}</TableCell>
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
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => abrirEdicao(p)}
                          aria-label={`Editar ${p.nome}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => excluir.mutate(p.id)}
                          aria-label={`Excluir ${p.nome}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {lista.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
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
