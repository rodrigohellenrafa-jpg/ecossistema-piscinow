import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { History, Pencil, Plus, Trash2 } from "lucide-react";
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
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Flight Board | Piscinow ERP" },
      {
        name: "description",
        content:
          "Lista linear das obras: agendado, em execução, pausado e concluído, com checklist técnico.",
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
  const [excluirId, setExcluirId] = useState<string | null>(null);

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

  const excluir = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("obras").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Obra excluída.");
      setExcluirId(null);
      qc.invalidateQueries({ queryKey: ["obras"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (k: keyof typeof vazio) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flight Board"
        subtitle="Lista linear das obras por status, com prazos e checklist técnico."
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

      <div className="space-y-6">
        {porStatus.map((col) => {
          const concluido = col.status === "Concluído";
          return (
            <div
              key={col.status}
              className="rounded-xl border border-border bg-card/50"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{col.status}</span>
                  <Badge variant="secondary">{col.itens.length}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {concluido ? "Finalizadas" : "Em andamento"}
                </span>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[900px]">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-2 border-b border-border bg-muted/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <div className="col-span-1">Obra</div>
                    <div className="col-span-3">Cliente</div>
                    <div className="col-span-1 text-center">Prazo</div>
                    <div className="col-span-2 text-center">Data limite</div>
                    <div className="col-span-2">Ordem de serviço</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1 text-right">Ações</div>
                  </div>

                  {col.itens.length === 0 && (
                    <p className="px-4 py-6 text-center text-xs text-muted-foreground">
                      Sem obras neste status
                    </p>
                  )}

                  {col.itens.map((obra) => {
                    const d = diasAte(obra.data_limite);
                    const atrasada = d !== null && d < 0 && obra.status_geral !== "Concluído";
                    const proximo = d !== null && d >= 0 && d <= 3 && obra.status_geral !== "Concluído";
                    const concluidas = progresso(obra);
                    const dataTone = atrasada
                      ? "text-destructive"
                      : proximo
                        ? "text-warning"
                        : "text-foreground";
                    return (
                      <div
                        key={obra.id}
                        className="group grid grid-cols-12 items-center gap-2 border-b border-border px-4 py-3 text-sm last:border-b-0 hover:bg-primary/5"
                      >
                        <div className="col-span-1">
                          <Link
                            to="/obras/$id"
                            params={{ id: obra.id }}
                            className="font-bold text-primary hover:underline"
                          >
                            {obra.numero ?? "—"}
                          </Link>
                        </div>

                        <div className="col-span-3 min-w-0">
                          <div className="truncate font-medium">{obra.cliente_nome ?? "—"}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {obra.tipo_servico}
                            {obra.responsavel ? ` · ${obra.responsavel}` : ""}
                          </div>
                        </div>

                        <div className="col-span-1 text-center tabular-nums">
                          {obra.prazo_dias} dias
                        </div>

                        <div className={`col-span-2 text-center font-medium tabular-nums ${dataTone}`}>
                          {dataBR(obra.data_limite)}
                          {atrasada && (
                            <span className="ml-1 text-[10px] font-bold">({d}d)</span>
                          )}
                          {proximo && !atrasada && (
                            <span className="ml-1 text-[10px] font-bold">({d}d)</span>
                          )}
                        </div>

                        <div className="col-span-2 flex flex-wrap gap-1">
                          {obra.os_instalacao && (
                            <Badge variant="outline" className="text-[10px]">
                              {obra.os_instalacao}
                            </Badge>
                          )}
                          {obra.os_logistica && (
                            <Badge variant="outline" className="text-[10px]">
                              {obra.os_logistica}
                            </Badge>
                          )}
                          {obra.os_acabamento && (
                            <Badge variant="outline" className="text-[10px]">
                              {obra.os_acabamento}
                            </Badge>
                          )}
                        </div>

                        <div className="col-span-2 space-y-1.5">
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
                          <div className="flex items-center gap-2">
                            <Progress className="h-1 flex-1" value={(concluidas / 10) * 100} />
                            <span className="text-[10px] text-muted-foreground tabular-nums">
                              {concluidas}/10
                            </span>
                          </div>
                        </div>

                        <div className="col-span-1 flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link to="/obras/$id" params={{ id: obra.id }}>
                              <Pencil className="size-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setExcluirId(obra.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!excluirId} onOpenChange={(v) => !v && setExcluirId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir obra</DialogTitle>
            <DialogDescription>
              Deseja realmente excluir esta obra? A ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExcluirId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => excluirId && excluir.mutate(excluirId)}
              disabled={excluir.isPending}
            >
              <Trash2 className="size-4" /> Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
