import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock3, History, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ExpandableCard } from "@/components/expandable-card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useAbrirModal } from "@/hooks/use-abrir-modal";
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
  selecionada: boolean;
  id: string;
  numero: string | null;
  venda_id: string | null;
  cliente_id: string | null;
  cliente_nome: string | null;
  tipo_servico: string;
  data_pedido: string;
  data_inicio: string | null;
  data_termino: string | null;
  prazo_dias: number;
  data_limite: string | null;
  responsavel: string | null;
  endereco_obra: string | null;
  os_instalacao: string | null;
  os_logistica: string | null;
  os_acabamento: string | null;
  escavacao_inicio: string | null;
  escavacao_fim: string | null;
  instalacao_inicio: string | null;
  instalacao_fim: string | null;
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

/** Colunas da linha da obra: obra, cliente, escavação, instalação, limite, OS, status, ações. */
const GRID_OBRA =
  "grid gap-2 grid-cols-[32px_84px_minmax(180px,1fr)_280px_280px_92px_96px_156px_80px]";

const STATUS_TONE: Record<string, string> = {
  Agendado: "border-status-scheduled/60 bg-status-scheduled/10 text-status-scheduled",
  "Em Execução": "border-status-running/60 bg-status-running/10 text-status-running",
  Pausado: "border-status-paused/60 bg-status-paused/10 text-status-paused",
  Concluído: "border-status-done/60 bg-status-done/10 text-status-done",
};

const vazio = {
  venda_id: "",
  cliente_id: "",
  tipo_servico: "Instalação Nova" as (typeof TIPOS_SERVICO)[number],
  prazo_dias: "30",
  responsavel: "",
  endereco_obra: "",
  data_inicio: "",
  data_termino: "",
};

function progresso(obra: Obra) {
  const concluidas = ETAPAS_OBRA.filter((e) => obra[e.key] === "concluido").length;
  return concluidas;
}

function FlightBoard() {
  const qc = useQueryClient();
  const [agora, setAgora] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  useAbrirModal("novo", () => setOpen(true));
  const [form, setForm] = useState(vazio);
  const [excluirId, setExcluirId] = useState<string | null>(null);
  const [historico, setHistorico] = useState<{ id: string | null; nome: string } | null>(null);

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

  useEffect(() => {
    setAgora(new Date());
    const timer = window.setInterval(() => setAgora(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

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

  const salvarDatas = useMutation({
    mutationFn: async ({
      id,
      campo,
      valor,
    }: {
      id: string;
      campo:
        | "data_inicio"
        | "data_termino"
        | "escavacao_inicio"
        | "escavacao_fim"
        | "instalacao_inicio"
        | "instalacao_fim";
      valor: string;
    }) => {
      const { error } = await supabase
        .from("obras")
        .update({ [campo]: valor || null } as Record<string, never>)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["obras"] }),
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

      // Evita obras duplicadas: mesmo cliente, mesmo serviço e ainda em aberto.
      const duplicada = obras.find(
        (o) =>
          o.status_geral !== "Concluído" &&
          o.tipo_servico === form.tipo_servico &&
          ((clienteId && o.cliente_id === clienteId) ||
            (!clienteId &&
              (o.cliente_nome ?? "").trim().toLowerCase() ===
                (clienteNome ?? "").trim().toLowerCase())) &&
          (!form.venda_id || !o.venda_id || o.venda_id === form.venda_id),
      );
      if (duplicada) {
        throw new Error(
          `Este cliente já tem a obra ${duplicada.numero ?? ""} em aberto para "${form.tipo_servico}". Abra o histórico do cliente antes de criar outra.`,
        );
      }

      const prazoDias = Number(form.prazo_dias) || 30;
      const dataPedido = hojeISO();
      const dataLimite = form.data_termino || addDiasUteis(dataPedido, prazoDias);

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
        data_inicio: form.data_inicio || null,
        data_termino: form.data_termino || null,
        escavacao_inicio: form.data_inicio || null,
        instalacao_fim: form.data_termino || null,
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

  // Histórico / recorrência do cliente
  const { data: historicoOS = [] } = useQuery({
    queryKey: ["historico-os", historico?.id, historico?.nome],
    enabled: Boolean(historico),
    queryFn: async () => {
      let q = supabase
        .from("ordens_servico")
        .select("id, numero, tipo_servico, status, data_agendada, valor, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      q = historico?.id
        ? q.eq("cliente_id", historico.id)
        : q.eq("cliente_nome", historico?.nome ?? "");
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const historicoObras = useMemo(
    () =>
      historico
        ? obras.filter((o) =>
            historico.id
              ? o.cliente_id === historico.id
              : (o.cliente_nome ?? "") === historico.nome,
          )
        : [],
    [obras, historico],
  );

  // ----- Serviços Out: pedidos externos, suas OS e a obra no board -----
  const { data: vendasOut = [] } = useQuery({
    queryKey: ["vendas-out"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendas")
        .select("id, numero, data, cliente_id, cliente_nome, valor_mao_obra, status_pedido")
        .eq("tipo_atendimento", "out")
        .order("data", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const { data: osVinculadas = [] } = useQuery({
    queryKey: ["os-vinculadas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordens_servico")
        .select("id, numero, venda_id, tipo_servico, status")
        .not("venda_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return data;
    },
  });

  const servicosOut = useMemo(
    () =>
      vendasOut.map((v) => ({
        ...v,
        os: osVinculadas.find((o) => o.venda_id === v.id) ?? null,
        obra: obras.find((o) => o.venda_id === v.id) ?? null,
      })),
    [vendasOut, osVinculadas, obras],
  );

  type ServicoOut = (typeof servicosOut)[number];

  const selecionar = useMutation({
    mutationFn: async ({ venda, obra, marcado }: { venda: string | null; obra: string | null; marcado: boolean }) => {
      const { error } = await supabase.rpc("selecionar_obra_board", {
        p_venda: venda, p_obra: obra, p_selecionada: marcado,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      for (const key of ["obras", "os-vinculadas", "agenda-obras", "agenda-ordens"]) qc.invalidateQueries({ queryKey: [key] });
      toast.success("Seleção salva no Flight Board.");
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
                <Field label="Data de início dos trabalhos">
                  <Input
                    type="date"
                    value={form.data_inicio}
                    onChange={(e) => set("data_inicio")(e.target.value)}
                  />
                </Field>
                <Field label="Data de término dos trabalhos">
                  <Input
                    type="date"
                    value={form.data_termino}
                    onChange={(e) => set("data_termino")(e.target.value)}
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
        <Kpi label="Obras ativas" value={String(kpis.ativas)} to="/ordens" />
        <Kpi label="Atrasadas" value={String(kpis.atrasadas)} tone={kpis.atrasadas > 0 ? "negative" : "default"} to="/ordens" />
        <Kpi label="Concluídas no mês" value={String(kpis.concluidasMes)} tone="positive" to="/vendas" />
        <Kpi label="Prazo médio" value={`${kpis.prazoMedio} dias`} to="/ordens" />
      </div>

      <ExpandableCard className="gap-0 overflow-hidden rounded-lg border-2 border-flight-grid bg-flight-panel py-0 shadow-xl">
        <div className="flex items-center justify-between border-b-2 border-flight-grid px-4 py-3 sm:px-5">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold uppercase text-flight-heading">
              <span className="flex size-8 items-center justify-center rounded bg-primary text-primary-foreground">FB</span>
              Operações
            </div>
            <p className="mt-1 text-xs uppercase text-muted-foreground">Obras e serviços programados</p>
          </div>
          <div className="pr-8 text-right text-flight-heading">
            <div className="flex items-center justify-end gap-2 text-xl font-semibold tabular-nums sm:text-2xl">
              <Clock3 className="size-5 text-primary" />
              {agora ? agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "--:--"}
            </div>
            <div className="text-[10px] uppercase text-muted-foreground">
              {agora ? agora.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }) : ""}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1400px]">
            <div className={`${GRID_OBRA} border-b border-flight-grid bg-flight-row-a px-4 py-2 text-[10px] font-bold uppercase text-flight-heading`}>
                    <div></div><div>Obra / Venda</div>
                    <div>Cliente</div>
                    <div className="text-center">Escavação (início / término)</div>
                    <div className="text-center">Instalação (início / término)</div>
                    <div className="text-center">Limite</div>
                    <div>O.S.</div>
                    <div>Status</div>
                    <div className="text-right">Ações</div>
            </div>

            {obras.length === 0 && (
              <p className="px-4 py-8 text-center text-xs text-muted-foreground">Nenhuma obra registrada.</p>
            )}

            {obras.map((obra, index) => {
                    const d = diasAte(obra.data_limite);
                    const atrasada = d !== null && d < 0 && obra.status_geral !== "Concluído";
                    const proximo = d !== null && d >= 0 && d <= 3 && obra.status_geral !== "Concluído";
                    const concluidas = progresso(obra);
                    const dataTone = atrasada
                      ? "text-destructive"
                      : proximo
                        ? "text-warning"
                        : "text-foreground";
                    const recorrencia = obras.filter((o) =>
                      obra.cliente_id
                        ? o.cliente_id === obra.cliente_id
                        : (o.cliente_nome ?? "") === (obra.cliente_nome ?? ""),
                    ).length;
                    return (
                      <div
                        key={obra.id}
                        className={`group ${GRID_OBRA} items-center border-b border-flight-grid px-4 py-3 text-sm last:border-b-0 ${index % 2 === 0 ? "bg-flight-row-a" : "bg-flight-row-b"} hover:bg-accent`}
                      >
                        <Checkbox aria-label={`Selecionar obra ${obra.numero}`} checked={obra.selecionada} disabled={selecionar.isPending || !obra.venda_id} onCheckedChange={(v) => selecionar.mutate({ venda: obra.venda_id, obra: obra.id, marcado: v === true })} />
                        <div>
                          <Link
                            to="/obras/$id"
                            params={{ id: obra.id }}
                            className="font-bold text-primary hover:underline"
                          >
                            {obra.selecionada ? obra.numero : vendasOut.find((v) => v.id === obra.venda_id)?.numero ?? obra.numero}
                          </Link>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate font-medium">{obra.cliente_nome ?? "—"}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              title="Histórico do cliente"
                              onClick={() =>
                                setHistorico({
                                  id: obra.cliente_id,
                                  nome: obra.cliente_nome ?? "—",
                                })
                              }
                              className="h-6 shrink-0 gap-1 px-1.5 text-[10px] text-muted-foreground hover:text-primary"
                            >
                              <History className="size-3" />
                              {recorrencia}
                            </Button>
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {obra.tipo_servico}
                            {obra.responsavel ? ` · ${obra.responsavel}` : ""}
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-1">
                          <Input
                            type="date"
                            className="h-8 text-xs"
                            value={obra.escavacao_inicio ?? ""}
                            onChange={(e) =>
                              salvarDatas.mutate({
                                id: obra.id,
                                campo: "escavacao_inicio",
                                valor: e.target.value,
                              })
                            }
                          />
                          <span className="text-xs text-muted-foreground">→</span>
                          <Input
                            type="date"
                            className="h-8 text-xs"
                            value={obra.escavacao_fim ?? ""}
                            onChange={(e) =>
                              salvarDatas.mutate({
                                id: obra.id,
                                campo: "escavacao_fim",
                                valor: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-center gap-1">
                          <Input
                            type="date"
                            className="h-8 text-xs"
                            value={obra.instalacao_inicio ?? ""}
                            onChange={(e) =>
                              salvarDatas.mutate({
                                id: obra.id,
                                campo: "instalacao_inicio",
                                valor: e.target.value,
                              })
                            }
                          />
                          <span className="text-xs text-muted-foreground">→</span>
                          <Input
                            type="date"
                            className="h-8 text-xs"
                            value={obra.instalacao_fim ?? ""}
                            onChange={(e) =>
                              salvarDatas.mutate({
                                id: obra.id,
                                campo: "instalacao_fim",
                                valor: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className={`text-center text-xs font-medium tabular-nums ${dataTone}`}>
                          {dataBR(obra.data_limite)}
                          {d !== null && (atrasada || proximo) && (
                            <span className="ml-1 text-[10px] font-bold">({d}d)</span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {obra.selecionada && obra.os_instalacao && (
                            <Badge variant="outline" className="text-[10px]">
                              {obra.os_instalacao}
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Select
                            value={obra.status_geral}
                            onValueChange={(status) => mudarStatus.mutate({ id: obra.id, status })}
                          >
                            <SelectTrigger className={`h-8 border-flight-grid bg-flight-panel text-xs font-bold uppercase ${STATUS_TONE[obra.status_geral] ?? "text-foreground"}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OBRA.map((s) => (
                                 <SelectItem key={s} value={s} className={`font-semibold ${STATUS_TONE[s]}`}>
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

                        <div className="flex items-center justify-end gap-1">
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
            {servicosOut.filter((s) => !s.obra).map((s, index) => (
              <div key={s.id} className={`${GRID_OBRA} items-center border-b border-flight-grid px-4 py-3 text-sm ${(obras.length + index) % 2 === 0 ? "bg-flight-row-a" : "bg-flight-row-b"}`}>
                <Checkbox aria-label={`Selecionar pedido ${s.numero}`} checked={false} disabled={selecionar.isPending} onCheckedChange={(v) => selecionar.mutate({ venda: s.id, obra: null, marcado: v === true })} />
                <Link to="/vendas/$id" params={{ id: s.id }} className="font-bold text-primary hover:underline">{s.numero}</Link>
                <div className="truncate">{s.cliente_nome}</div>
                <div className="text-center text-muted-foreground">—</div><div className="text-center text-muted-foreground">—</div><div className="text-center">—</div><div>—</div>
                <Badge variant="outline">{s.status_pedido}</Badge>
                <Button asChild variant="ghost" size="icon" title="Abrir pedido"><Link to="/vendas/$id" params={{ id: s.id }}><Pencil className="size-4" /></Link></Button>
              </div>
            ))}
          </div>
        </div>
      </ExpandableCard>

      {/* Histórico / recorrência do cliente */}
      <Dialog open={!!historico} onOpenChange={(v) => !v && setHistorico(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="size-4" /> Histórico de {historico?.nome}
            </DialogTitle>
            <DialogDescription>
              Todas as obras e ordens de serviço já abertas para este cliente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-semibold">Obras ({historicoObras.length})</h3>
              <div className="space-y-1">
                {historicoObras.map((o) => (
                  <Link
                    key={o.id}
                    to="/obras/$id"
                    params={{ id: o.id }}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm hover:border-primary"
                  >
                    <span className="font-medium">{o.numero ?? "—"}</span>
                    <span className="text-xs text-muted-foreground">{o.tipo_servico}</span>
                    <span className="text-xs text-muted-foreground">
                      {dataBR(o.data_inicio) || dataBR(o.data_pedido)}
                    </span>
                    <Badge variant="secondary">{o.status_geral}</Badge>
                  </Link>
                ))}
                {historicoObras.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhuma obra registrada.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold">
                Ordens de serviço ({historicoOS.length})
              </h3>
              <div className="space-y-1">
                {historicoOS.map((os) => (
                  <div
                    key={os.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{os.numero ?? "—"}</span>
                    <span className="text-xs text-muted-foreground">{os.tipo_servico}</span>
                    <span className="text-xs text-muted-foreground">
                      {dataBR(os.data_agendada)}
                    </span>
                    <Badge variant="secondary">{os.status}</Badge>
                  </div>
                ))}
                {historicoOS.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhuma OS registrada.</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
