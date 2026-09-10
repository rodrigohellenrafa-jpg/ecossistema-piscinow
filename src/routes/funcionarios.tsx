import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/field";
import { PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { brl, proximoCodigo } from "@/lib/erp";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/funcionarios")({
  head: () => ({
    meta: [
      { title: "Funcionários | Piscinow ERP" },
      {
        name: "description",
        content: "Cadastro de colaboradores, cargos, salários e comissões da Piscinow.",
      },
      { property: "og:title", content: "Funcionários | Piscinow ERP" },
      {
        property: "og:description",
        content: "Gerencie os colaboradores e a política de comissões da Piscinow.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Funcionarios />
    </RequireAuth>
  ),
});

type Funcionario = Tables<"funcionarios">;
type Perfil = Funcionario["perfil"];

const PERFIS: { value: Perfil; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "gerente", label: "Gerente" },
  { value: "vendedor", label: "Vendedor" },
  { value: "financeiro", label: "Financeiro" },
  { value: "tecnico", label: "Técnico" },
  { value: "usuario", label: "Usuário" },
];

const PERFIL_LABEL: Record<string, string> = Object.fromEntries(
  PERFIS.map((p) => [p.value, p.label]),
);

const vazio = {
  codigo: "",
  nome: "",
  cargo: "",
  perfil: "usuario" as Perfil,
  perfis: ["usuario"] as Perfil[],
  email: "",
  telefone: "",
  data_admissao: "",
  salario_base: "0",
  vt: "0",
  vr: "0",
  inss_perc: "0",
  irrf_perc: "0",
  sindicato: "0",
  bonificacao: "0",
  comissao_piscinas: "0",
  comissao_acessorios: "0",
  comissao_quimicos: "0",
};

function Funcionarios() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState<Funcionario | null>(null);
  const [form, setForm] = useState(vazio);

  const { data = [], isLoading } = useQuery({
    queryKey: ["funcionarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funcionarios")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const abrirNovo = () => {
    setEditando(null);
    setForm({ ...vazio, codigo: proximoCodigo("FUNC", data.map((f) => f.codigo)) });
    setOpen(true);
  };

  const abrirEdicao = (f: Funcionario) => {
    setEditando(f);
    setForm({
      codigo: f.codigo ?? "",
      nome: f.nome,
      cargo: f.cargo ?? "",
      perfil: f.perfil,
      email: f.email ?? "",
      telefone: f.telefone ?? "",
      data_admissao: f.data_admissao ?? "",
      salario_base: String(f.salario_base ?? 0),
      vt: String(f.vt ?? 0),
      vr: String(f.vr ?? 0),
      inss_perc: String(f.inss_perc ?? 0),
      irrf_perc: String(f.irrf_perc ?? 0),
      sindicato: String(f.sindicato ?? 0),
      bonificacao: String(f.bonificacao ?? 0),
      comissao_piscinas: String(f.comissao_piscinas ?? 0),
      comissao_acessorios: String(f.comissao_acessorios ?? 0),
      comissao_quimicos: String(f.comissao_quimicos ?? 0),
    });
    setOpen(true);
  };

  const salvar = useMutation({
    mutationFn: async () => {
      if (!form.nome.trim()) throw new Error("Informe o nome do colaborador.");
      const payload = {
        codigo: form.codigo || null,
        nome: form.nome.trim(),
        cargo: form.cargo || "",
        perfil: form.perfil,
        email: form.email || null,
        telefone: form.telefone || null,
        data_admissao: form.data_admissao || null,
        salario_base: Number(form.salario_base) || 0,
        vt: Number(form.vt) || 0,
        vr: Number(form.vr) || 0,
        inss_perc: Number(form.inss_perc) || 0,
        irrf_perc: Number(form.irrf_perc) || 0,
        sindicato: Number(form.sindicato) || 0,
        bonificacao: Number(form.bonificacao) || 0,
        comissao_piscinas: Number(form.comissao_piscinas) || 0,
        comissao_acessorios: Number(form.comissao_acessorios) || 0,
        comissao_quimicos: Number(form.comissao_quimicos) || 0,
      };
      if (editando) {
        const { error } = await supabase
          .from("funcionarios")
          .update(payload)
          .eq("id", editando.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("funcionarios").insert({
          ...payload,
          created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editando ? "Colaborador atualizado!" : "Colaborador cadastrado!");
      setForm(vazio);
      setEditando(null);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["funcionarios"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const excluir = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("funcionarios").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Colaborador excluído.");
      qc.invalidateQueries({ queryKey: ["funcionarios"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const lista = data.filter((f) =>
    `${f.nome} ${f.codigo ?? ""} ${f.cargo ?? ""} ${f.email ?? ""}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  const set = (k: keyof typeof vazio) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const totalProventos = (f: Funcionario) =>
    Number(f.salario_base ?? 0) + Number(f.vt ?? 0) + Number(f.vr ?? 0) + Number(f.bonificacao ?? 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Funcionários"
        subtitle="Cadastro de colaboradores, salários e comissões."
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
                <Plus /> Novo colaborador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>{editando ? "Editar colaborador" : "Novo colaborador"}</DialogTitle>
                <DialogDescription>Dados pessoais, remuneração e comissões.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Código">
                  <Input value={form.codigo} onChange={(e) => set("codigo")(e.target.value)} />
                </Field>
                <Field label="Nome">
                  <Input value={form.nome} onChange={(e) => set("nome")(e.target.value)} />
                </Field>
                <Field label="Cargo">
                  <Input value={form.cargo} onChange={(e) => set("cargo")(e.target.value)} />
                </Field>
                <Field label="Perfil de acesso">
                  <Select value={form.perfil} onValueChange={(v) => set("perfil")(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERFIS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <Field label="Data de admissão">
                  <Input
                    type="date"
                    value={form.data_admissao}
                    onChange={(e) => set("data_admissao")(e.target.value)}
                  />
                </Field>
                <Field label="Salário base (R$)">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.salario_base}
                    onChange={(e) => set("salario_base")(e.target.value)}
                  />
                </Field>
                <Field label="Vale-transporte (R$)">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.vt}
                    onChange={(e) => set("vt")(e.target.value)}
                  />
                </Field>
                <Field label="Vale-refeição (R$)">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.vr}
                    onChange={(e) => set("vr")(e.target.value)}
                  />
                </Field>
                <Field label="INSS (%)">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.inss_perc}
                    onChange={(e) => set("inss_perc")(e.target.value)}
                  />
                </Field>
                <Field label="IRRF (%)">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.irrf_perc}
                    onChange={(e) => set("irrf_perc")(e.target.value)}
                  />
                </Field>
                <Field label="Sindicato (R$)">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.sindicato}
                    onChange={(e) => set("sindicato")(e.target.value)}
                  />
                </Field>
                <Field label="Bonificação (R$)">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.bonificacao}
                    onChange={(e) => set("bonificacao")(e.target.value)}
                  />
                </Field>
              </div>
              <Separator className="my-2" />
              <p className="text-sm font-medium text-foreground">Matriz de comissões</p>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="% Piscinas">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.comissao_piscinas}
                    onChange={(e) => set("comissao_piscinas")(e.target.value)}
                  />
                </Field>
                <Field label="% Acessórios">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.comissao_acessorios}
                    onChange={(e) => set("comissao_acessorios")(e.target.value)}
                  />
                </Field>
                <Field label="% Químicos">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.comissao_quimicos}
                    onChange={(e) => set("comissao_quimicos")(e.target.value)}
                  />
                </Field>
              </div>
              <DialogFooter>
                <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
                  {editando ? "Salvar alterações" : "Salvar colaborador"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader className="gap-3">
          <CardTitle>Colaboradores ({lista.length})</CardTitle>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome, código, cargo ou e-mail"
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
                <TableHead>Colaborador</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead className="text-right">Proventos base</TableHead>
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
                  <TableCell>{f.cargo || "—"}</TableCell>
                  <TableCell>
                    <Badge>{PERFIL_LABEL[f.perfil] ?? f.perfil}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{brl(totalProventos(f))}</TableCell>
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
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Nenhum colaborador cadastrado ainda.
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
