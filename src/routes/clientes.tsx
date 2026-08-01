import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
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

export const Route = createFileRoute("/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes | Piscinow ERP" },
      {
        name: "description",
        content: "Cadastro completo de clientes Piscinow com contatos, endereço e documentos.",
      },
      { property: "og:title", content: "Clientes | Piscinow ERP" },
      {
        property: "og:description",
        content: "Cadastre e gerencie a base de clientes da Piscinow.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Clientes />
    </RequireAuth>
  ),
});

const vazio = {
  nome: "",
  tipo: "PF",
  documento: "",
  email: "",
  telefone: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  observacoes: "",
};

function Clientes() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(vazio);

  const { data = [], isLoading } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const salvar = useMutation({
    mutationFn: async () => {
      if (!form.nome.trim()) throw new Error("Informe o nome do cliente.");
      const { error } = await supabase.from("clientes").insert({
        ...form,
        nome: form.nome.trim(),
        created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cliente cadastrado!");
      setForm(vazio);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["clientes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const excluir = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cliente excluído.");
      qc.invalidateQueries({ queryKey: ["clientes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const lista = data.filter((c) =>
    `${c.nome} ${c.cidade ?? ""} ${c.telefone ?? ""} ${c.documento ?? ""}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  const set = (k: keyof typeof vazio) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Cadastro salvo no banco de dados da equipe.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus /> Novo cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo cliente</DialogTitle>
              <DialogDescription>Preencha os dados cadastrais.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome / Razão social" className="sm:col-span-2">
                <Input value={form.nome} onChange={(e) => set("nome")(e.target.value)} />
              </Field>
              <Field label="Tipo">
                <Select value={form.tipo} onValueChange={set("tipo")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PF">Pessoa física</SelectItem>
                    <SelectItem value="PJ">Pessoa jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="CPF / CNPJ">
                <Input value={form.documento} onChange={(e) => set("documento")(e.target.value)} />
              </Field>
              <Field label="E-mail">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email")(e.target.value)}
                />
              </Field>
              <Field label="Telefone">
                <Input value={form.telefone} onChange={(e) => set("telefone")(e.target.value)} />
              </Field>
              <Field label="CEP">
                <Input value={form.cep} onChange={(e) => set("cep")(e.target.value)} />
              </Field>
              <Field label="Logradouro">
                <Input
                  value={form.logradouro}
                  onChange={(e) => set("logradouro")(e.target.value)}
                />
              </Field>
              <Field label="Número">
                <Input value={form.numero} onChange={(e) => set("numero")(e.target.value)} />
              </Field>
              <Field label="Complemento">
                <Input
                  value={form.complemento}
                  onChange={(e) => set("complemento")(e.target.value)}
                />
              </Field>
              <Field label="Bairro">
                <Input value={form.bairro} onChange={(e) => set("bairro")(e.target.value)} />
              </Field>
              <Field label="Cidade">
                <Input value={form.cidade} onChange={(e) => set("cidade")(e.target.value)} />
              </Field>
              <Field label="Estado">
                <Input
                  maxLength={2}
                  value={form.estado}
                  onChange={(e) => set("estado")(e.target.value.toUpperCase())}
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
              <Button
                onClick={() => salvar.mutate()}
                disabled={salvar.isPending}
              >
                Salvar cliente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="gap-3">
          <CardTitle>Base de clientes ({lista.length})</CardTitle>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome, cidade, telefone ou documento"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.nome}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{c.tipo}</Badge>
                  </TableCell>
                  <TableCell>{c.telefone || c.email || "—"}</TableCell>
                  <TableCell>
                    {c.cidade ? `${c.cidade}${c.estado ? `/${c.estado}` : ""}` : "—"}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => excluir.mutate(c.id)}
                      aria-label={`Excluir ${c.nome}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && lista.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    Nenhum cliente cadastrado ainda.
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

export function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
