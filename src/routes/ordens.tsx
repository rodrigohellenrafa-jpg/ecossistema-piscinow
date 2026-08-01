import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
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

export const Route = createFileRoute("/ordens")({
  head: () => ({
    meta: [
      { title: "Ordens de Serviço | Piscinow ERP" },
      {
        name: "description",
        content:
          "Abra ordens de serviço vinculando cliente, tipo de serviço, responsável e prazo.",
      },
      { property: "og:title", content: "Ordens de Serviço | Piscinow ERP" },
      {
        property: "og:description",
        content: "Controle das obras e manutenções da Piscinow.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Ordens />
    </RequireAuth>
  ),
});

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const STATUS = ["orcamento", "aprovado", "em_execucao", "concluido", "cancelado"] as const;
const LABEL: Record<string, string> = {
  orcamento: "Orçamento",
  aprovado: "Aprovado",
  em_execucao: "Em execução",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

const vazio = {
  numero: "",
  cliente_id: "",
  tipo_servico: "",
  descricao: "",
  responsavel: "",
  status: "orcamento",
  prioridade: "media",
  data_agendada: "",
  valor: "0",
};

function Ordens() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(vazio);

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clientes").select("id, nome").order("nome");
      if (error) throw error;
      return data;
    },
  });

  const { data = [] } = useQuery({
    queryKey: ["ordens"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordens_servico")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const salvar = useMutation({
    mutationFn: async () => {
      if (!form.cliente_id) throw new Error("Selecione o cliente.");
      if (!form.tipo_servico.trim()) throw new Error("Informe o tipo de serviço.");
      const cliente = clientes.find((c) => c.id === form.cliente_id);
      const { error } = await supabase.from("ordens_servico").insert({
        numero: form.numero || `OS-${Date.now().toString().slice(-6)}`,
        cliente_id: form.cliente_id,
        cliente_nome: cliente?.nome ?? null,
        tipo_servico: form.tipo_servico.trim(),
        descricao: form.descricao || null,
        responsavel: form.responsavel || null,
        status: form.status,
        prioridade: form.prioridade,
        data_agendada: form.data_agendada || null,
        valor: Number(form.valor) || 0,
        created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ordem de serviço criada!");
      setForm(vazio);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["ordens"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mudarStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("ordens_servico").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ordens"] }),
  });

  const set = (k: keyof typeof vazio) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ordens de Serviço</h1>
          <p className="text-sm text-muted-foreground">
            Abertura de OS vinculada ao cliente e ao Flight Board.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus /> Nova OS
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova ordem de serviço</DialogTitle>
              <DialogDescription>Vincule cliente, serviço, prazo e responsável.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cliente" className="sm:col-span-2">
                <Select value={form.cliente_id} onValueChange={set("cliente_id")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Número da OS (opcional)">
                <Input value={form.numero} onChange={(e) => set("numero")(e.target.value)} />
              </Field>
              <Field label="Tipo de serviço">
                <Input
                  placeholder="Instalação, manutenção, limpeza…"
                  value={form.tipo_servico}
                  onChange={(e) => set("tipo_servico")(e.target.value)}
                />
              </Field>
              <Field label="Responsável">
                <Input
                  value={form.responsavel}
                  onChange={(e) => set("responsavel")(e.target.value)}
                />
              </Field>
              <Field label="Data agendada">
                <Input
                  type="date"
                  value={form.data_agendada}
                  onChange={(e) => set("data_agendada")(e.target.value)}
                />
              </Field>
              <Field label="Status">
                <Select value={form.status} onValueChange={set("status")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Prioridade">
                <Select value={form.prioridade} onValueChange={set("prioridade")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Valor (R$)">
                <Input
                  type="number"
                  step="0.01"
                  value={form.valor}
                  onChange={(e) => set("valor")(e.target.value)}
                />
              </Field>
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
                Criar OS
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ordens abertas ({data.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>OS</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Agenda</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-44">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.numero}</TableCell>
                  <TableCell>{o.cliente_nome ?? "—"}</TableCell>
                  <TableCell>
                    {o.tipo_servico}
                    <Badge variant="secondary" className="ml-2">
                      {o.prioridade}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {o.data_agendada
                      ? new Date(`${o.data_agendada}T00:00:00`).toLocaleDateString("pt-BR")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">{brl(Number(o.valor))}</TableCell>
                  <TableCell>
                    <Select
                      value={o.status}
                      onValueChange={(status) => mudarStatus.mutate({ id: o.id, status })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {LABEL[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Nenhuma ordem de serviço cadastrada.
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
