import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/field";
import { PageHeader, Kpi } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  addDiasUteis,
  dataBR,
  diasAte,
  ETAPAS_OBRA,
  hojeISO,
  proximoCodigo,
  STATUS_OBRA,
} from "@/lib/erp";

export const Route = createFileRoute("/logistica")({
  head: () => ({
    meta: [
      { title: "Flight Board | Piscinow ERP" },
      {
        name: "description",
        content:
          "Quadro Kanban das obras: agendado, em execução, pausado e concluído, com checklist técnico.",
      },
      { property: "og:title", content: "Flight Board | Piscinow ERP" },
      {
        property: "og:description",
        content: "Acompanhe cada obra de piscina por status em tempo real.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <FlightBoard />
    </RequireAuth>
  ),
});

type Obra = {
  id: string;
  numero: string | null;
  venda_id: string | null;
  cliente_id: string | null;
  cliente_nome: string | null;
  tipo_servico: string;
  data_pedido: string;
  prazo_dias: number;
  data_limite: string | null;
  responsavel: string | null;
  endereco_obra: string | null;
  os_instalacao: string | null;
  os_logistica: string | null;
  os_acabamento: string | null;
  status_geral: string;
  etapa_escavacao: string;
  etapa_base: string;
  etapa_nivel: string;
  etapa_esquadro: string;
  etapa_furacao: string;
  etapa_tubulacao: string;
  etapa_casa_maquinas: string;
  etapa_motor: string;
  etapa_aquecimento: string;
  etapa_cascata: string;
};

const TIPOS_SERVICO = ["Instalação Nova", "Reforma", "Manutenção"] as const;

const vazio = {
  venda_id: "",
  cliente_id: "",
  tipo_servico: "Instalação Nova" as (typeof TIPOS_SERVICO)[number],
  prazo_dias: "30",
  responsavel: "",
  endereco_obra: "",
};

function progresso(obra: Obra) {
  const concluidas = ETAPAS_OBRA.filter((e) => obra[e.key] === "concluido").length;
  return concluidas;
}

function FlightBoard() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(vazio);

  const { data: obras = [] } = useQuery({
    queryKey: ["obras"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("obras")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Obra[];
    },
  });

  const { data: vendas = [] } = useQuery({
    queryKey: ["vendas-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendas")
        .select("id, numero, cliente_id, cliente_nome")
        .order("data", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nome, endereco_obra")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const porStatus = useMemo(
    () =>
      STATUS_OBRA.map((status) => ({
        status,
        itens: obras.filter((o) => o.status_geral === status),
      })),
    [obras],
  );

  const kpis = useMemo(() => {
    const ativas = obras.filter((o) => o.status_geral !== "Concluído").length;
    const atrasadas = obras.filter((o) => {
      const d = diasAte(o.data_limite);
      return o.status_geral !== "Concluído" && d !== null && d < 0;
    }).length;
    const mesAtual = hojeISO().slice(0, 7);
    const concluidasMes = obras.filter(
      (o) => o.status_geral === "Concluído" && (o.data_limite ?? "").slice(0, 7) === mesAtual,
    ).length;
    const prazoMedio = obras.length
      ? Math.round(obras.reduce((acc, o) => acc + o.prazo_dias, 0) / obras.length)
      : 0;
    return { ativas, atrasadas, concluidasMes, prazoMedio };
  }, [obras]);

  const mudarStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("obras").update({ status_geral: status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["obras"] });
      toast.success("Status atualizado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const criar = useMutation({
    mutationFn: async () => {
      if (!form.cliente_id && !form.venda_id) {
        throw new Error("Selecione um pedido de venda ou um cliente.");
      }
      const venda = vendas.find((v) => v.id === form.venda_id);
      const cliente = clientes.find((c) => c.id === form.cliente_id) ||
        clientes.find((c) => c.id === venda?.cliente_id);
      const clienteId = form.cliente_id || venda?.cliente_id || null;
      const clienteNome = cliente?.nome || venda?.cliente_nome || null;
      const prazoDias = Number(form.prazo_dias) || 30;
      const dataPedido = hojeISO();
      const dataLimite = addDiasUteis(dataPedido, prazoDias);

      const codInstalacao = proximoCodigo("OS-02", obras.map((o) => o.os_instalacao));
      const codLogistica = proximoCodigo("OL", obras.map((o) => o.os_logistica));
      const codAcabamento = proximoCodigo("OS-03", obras.map((o) => o.os_acabamento));

      const { error } = await supabase.from("obras").insert({
        venda_id: form.venda_id || null,
        cliente_id: clienteId,
        cliente_nome: clienteNome,
        numero: proximoCodigo("OBRA", obras.map((o) => o.numero)),
        tipo_servico: form.tipo_servico,
        data_pedido: dataPedido,
        prazo_dias: prazoDias,
        data_limite: dataLimite,
        responsavel: form.responsavel || null,
        endereco_obra: form.endereco_obra || cliente?.endereco_obra || null,
        os_instalacao: codInstalacao,
        os_logistica: codLogistica,
        os_acabamento: codAcabamento,
        status_geral: "Agendado",
        created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Obra criada no Flight Board!");
      setForm(vazio);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["obras"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (k: keyof typeof vazio) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flight Board"
        subtitle="Painel Kanban das obras por status, com prazos e checklist técnico."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus /> Nova obra
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova obra</DialogTitle>
                <DialogDescription>
                  Vincule a um pedido de venda ou cliente e defina prazo e responsável.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Pedido de venda (opcional)" className="sm:col-span-2">
                  <Select value={form.venda_id} onValueChange={set("venda_id")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o pedido" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendas.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.numero} — {v.cliente_nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Cliente (se não houver pedido)" className="sm:col-span-2">
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
                <Field label="Tipo de serviço">
                  <Select
                    value={form.tipo_servico}
                    onValueChange={(v) => set("tipo_servico")(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_SERVICO.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Prazo (dias úteis)">
                  <Input
                    type="number"
                    value={form.prazo_dias}
                    onChange={(e) => set("prazo_dias")(e.target.value)}
                  />
                </Field>
                <Field label="Responsável">
                  <Input
                    value={form.responsavel}
                    onChange={(e) => set("responsavel")(e.target.value)}
                  />
                </Field>
                <Field label="Endereço da obra" className="sm:col-span-2">
                  <Input
                    value={form.endereco_obra}
                    onChange={(e) => set("endereco_obra")(e.target.value)}
                    placeholder="Preenchido pelo cliente se vazio"
                  />
                </Field>
              </div>
              <DialogFooter>
                <Button onClick={() => criar.mutate()} disabled={criar.isPending}>
                  Criar obra
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Obras ativas" value={String(kpis.ativas)} />
        <Kpi label="Atrasadas" value={String(kpis.atrasadas)} tone={kpis.atrasadas > 0 ? "negative" : "default"} />
        <Kpi label="Concluídas no mês" value={String(kpis.concluidasMes)} tone="positive" />
        <Kpi label="Prazo médio" value={`${kpis.prazoMedio} dias`} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {porStatus.map((col) => (
          <div key={col.status} className="flex min-h-40 flex-col gap-3 rounded-xl border border-border bg-card/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{col.status}</span>
              <Badge variant="secondary">{col.itens.length}</Badge>
            </div>

            {col.itens.length === 0 && (
              <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                Sem obras neste status
              </p>
            )}

            {col.itens.map((obra) => {
              const d = diasAte(obra.data_limite);
              const atrasada = d !== null && d < 0 && obra.status_geral !== "Concluído";
              const proximo = d !== null && d >= 0 && d <= 3 && obra.status_geral !== "Concluído";
              const concluidas = progresso(obra);
              return (
                <Card key={obra.id} className="gap-2 py-3">
                  <CardHeader className="px-3">
                    <CardTitle className="flex items-center justify-between text-sm">
                      <Link to="/obras/$id" params={{ id: obra.id }} className="hover:underline">
                        {obra.numero ?? "—"}
                      </Link>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          atrasada
                            ? "bg-destructive/20 text-destructive"
                            : proximo
                              ? "bg-warning/20 text-warning"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {dataBR(obra.data_limite)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 px-3">
                    <p className="text-sm font-medium">{obra.cliente_nome ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{obra.tipo_servico}</p>
                    <p className="text-xs text-muted-foreground">
                      Prazo: {obra.prazo_dias} dias úteis · {obra.responsavel ?? "sem responsável"}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {obra.os_instalacao && <Badge variant="outline">{obra.os_instalacao}</Badge>}
                      {obra.os_logistica && <Badge variant="outline">{obra.os_logistica}</Badge>}
                      {obra.os_acabamento && <Badge variant="outline">{obra.os_acabamento}</Badge>}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Checklist</span>
                        <span>{concluidas}/10</span>
                      </div>
                      <Progress value={(concluidas / 10) * 100} />
                    </div>
                    <Select
                      value={obra.status_geral}
                      onValueChange={(status) => mudarStatus.mutate({ id: obra.id, status })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OBRA.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
