import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { proximoCodigo } from "@/lib/erp";
import type { Tables } from "@/integrations/supabase/types";
import { useAbrirModal } from "@/hooks/use-abrir-modal";

export const Route = createFileRoute("/fornecedores")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Fornecedores | Piscinow ERP" },
      {
        name: "description",
        content: "Cadastro de fornecedores com prazos de entrega e dados de contato.",
      },
      { property: "og:title", content: "Fornecedores | Piscinow ERP" },
      {
        property: "og:description",
        content: "Gerencie a base de fornecedores da Piscinow.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Fornecedores />
    </RequireAuth>
  ),
});

type Fornecedor = Tables<"fornecedores">;

const vazio = {
  codigo: "",
  nome: "",
  cnpj: "",
  contato: "",
  telefone: "",
  email: "",
  prazo_entrega_dias: "0",
  observacoes: "",
};

function Fornecedores() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  useAbrirModal("novo", () => setOpen(true));
  const [editando, setEditando] = useState<Fornecedor | null>(null);
  const [form, setForm] = useState(vazio);

  const { data = [], isLoading } = useQuery({
    queryKey: ["fornecedores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fornecedores")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const abrirNovo = () => {
    setEditando(null);
    setForm({
      ...vazio,
      codigo: proximoCodigo("FOR", data.map((f) => f.codigo)),
    });
    setOpen(true);
  };

  const abrirEdicao = (f: Fornecedor) => {
    setEditando(f);
    setForm({
      codigo: f.codigo ?? "",
      nome: f.nome,
      cnpj: f.cnpj ?? "",
      contato: f.contato ?? "",
      telefone: f.telefone ?? "",
      email: f.email ?? "",
      prazo_entrega_dias: String(f.prazo_entrega_dias ?? 0),
      observacoes: f.observacoes ?? "",
    });
    setOpen(true);
  };

  const salvar = useMutation({
    mutationFn: async () => {
      if (!form.nome.trim()) throw new Error("Informe o nome do fornecedor.");
      const payload = {
        codigo: form.codigo || null,
        nome: form.nome.trim(),
        cnpj: form.cnpj || null,
        contato: form.contato || null,
        telefone: form.telefone || null,
        email: form.email || null,
        prazo_entrega_dias: Number(form.prazo_entrega_dias) || 0,
        observacoes: form.observacoes || null,
      };
      if (editando) {
        const { error } = await supabase
          .from("fornecedores")
          .update(payload)
          .eq("id", editando.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("fornecedores").insert({
          ...payload,
          created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editando ? "Fornecedor atualizado!" : "Fornecedor cadastrado!");
      setForm(vazio);
      setEditando(null);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["fornecedores"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const excluir = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fornecedores").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Fornecedor excluído.");
      qc.invalidateQueries({ queryKey: ["fornecedores"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const lista = data.filter((f) =>
    `${f.nome} ${f.codigo ?? ""} ${f.cnpj ?? ""} ${f.contato ?? ""}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  const set = (k: keyof typeof vazio) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const prazoMedio = lista.length
    ? Math.round(lista.reduce((acc, f) => acc + Number(f.prazo_entrega_dias ?? 0), 0) / lista.length)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fornecedores"
        subtitle={`Prazo médio de entrega: ${prazoMedio} dias.`}
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
                <Plus /> Novo fornecedor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editando ? "Editar fornecedor" : "Novo fornecedor"}</DialogTitle>
                <DialogDescription>Preencha os dados cadastrais.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Código">
                  <Input value={form.codigo} onChange={(e) => set("codigo")(e.target.value)} />
                </Field>
                <Field label="Nome / Razão social">
                  <Input value={form.nome} onChange={(e) => set("nome")(e.target.value)} />
                </Field>
                <Field label="CNPJ">
                  <Input value={form.cnpj} onChange={(e) => set("cnpj")(e.target.value)} />
                </Field>
                <Field label="Contato">
                  <Input value={form.contato} onChange={(e) => set("contato")(e.target.value)} />
                </Field>
                <Field label="Telefone">
                  <Input value={form.telefone} onChange={(e) => set("telefone")(e.target.value)} />
                </Field>
                <Field label="E-mail">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email")(e.target.value)}
                  />
                </Field>
                <Field label="Prazo de entrega (dias)">
                  <Input
                    type="number"
                    value={form.prazo_entrega_dias}
                    onChange={(e) => set("prazo_entrega_dias")(e.target.value)}
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
                  {editando ? "Salvar alterações" : "Salvar fornecedor"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader className="gap-3">
          <CardTitle>Base de fornecedores ({lista.length})</CardTitle>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome, código, CNPJ ou contato"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="text-right">Prazo de entrega</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>
                    <Badge variant="secondary">{f.codigo ?? "—"}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{f.nome}</TableCell>
                  <TableCell>{f.contato || f.telefone || f.email || "—"}</TableCell>
                  <TableCell className="text-right">
                    {f.prazo_entrega_dias} dia{f.prazo_entrega_dias === 1 ? "" : "s"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => abrirEdicao(f)}
                        aria-label={`Editar ${f.nome}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => excluir.mutate(f.id)}
                        aria-label={`Excluir ${f.nome}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && lista.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    Nenhum fornecedor cadastrado ainda.
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
