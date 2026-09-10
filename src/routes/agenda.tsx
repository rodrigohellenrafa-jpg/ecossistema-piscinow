import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, Copy, Plus, RefreshCw, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/field";
import { PageHeader, Kpi } from "@/components/page-header";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { meuTokenAgenda, regenerarTokenAgenda } from "@/lib/agenda.functions";
import {
  enviarAgendaParaGoogle,
  listarAgendasGoogle,
  sincronizarAgendaGoogle,
} from "@/lib/google-agenda.functions";

export const Route = createFileRoute("/agenda")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Agenda da Equipe | Piscinow ERP" },
      {
        name: "description",
        content:
          "Agenda compartilhada da Piscinow: compromissos, obras e ordens de serviço de toda a equipe, com destaque para os seus.",
      },
      { property: "og:title", content: "Agenda da Equipe | Piscinow ERP" },
      {
        property: "og:description",
        content: "Todos veem a agenda da equipe; cada um recebe a sua no celular.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Agenda />
    </RequireAuth>
  ),
});

type Evento = {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: string;
  inicio: string;
  fim: string | null;
  dia_inteiro: boolean;
  local: string | null;
  status: string;
  responsavel_id: string | null;
  responsavel_nome: string | null;
  cliente_nome: string | null;
  created_by: string | null;
};

type Item = {
  id: string;
  origem: "evento" | "os" | "obra";
  titulo: string;
  detalhe: string | null;
  local: string | null;
  quando: string;
  hora: string | null;
  responsavelId: string | null;
  responsavelNome: string | null;
  tipo: string;
  status: string;
};

const vazio = {
  titulo: "",
  descricao: "",
  tipo: "trabalho",
  data: new Date().toISOString().slice(0, 10),
  hora: "09:00",
  duracao: "60",
  dia_inteiro: "nao",
  local: "",
  cliente_nome: "",
  responsavel_id: "",
};

const diaLongo = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

function Agenda() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(vazio);
  const [periodo, setPeriodo] = useState("30");
  const [somenteMeus, setSomenteMeus] = useState(false);

  const pegarToken = useServerFn(meuTokenAgenda);
  const trocarToken = useServerFn(regenerarTokenAgenda);
  const listarGoogle = useServerFn(listarAgendasGoogle);
  const sincronizarGoogle = useServerFn(sincronizarAgendaGoogle);
  const enviarGoogle = useServerFn(enviarAgendaParaGoogle);
  const [agendaGoogle, setAgendaGoogle] = useState("primary");

  const { data: agendasGoogle = [] } = useQuery({
    queryKey: ["google-agendas"],
    queryFn: () => listarGoogle(),
    retry: false,
  });

  const sincronizar = useMutation({
    mutationFn: () => sincronizarGoogle({ data: { calendarId: agendaGoogle } }),
    onSuccess: (r) => {
      toast.success(`${r.importados} compromisso(s) do Google trazidos para a agenda.`);
      qc.invalidateQueries({ queryKey: ["agenda-eventos"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const enviar = useMutation({
    mutationFn: () => enviarGoogle({ data: { calendarId: agendaGoogle } }),
    onSuccess: (r) => {
      toast.success(`${r.enviados} compromisso(s) do sistema enviados para o Google.`);
      qc.invalidateQueries({ queryKey: ["agenda-eventos"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const { data: assinatura } = useQuery({
    queryKey: ["agenda-token"],
    queryFn: () => pegarToken(),
  });

  const { data: eventos = [] } = useQuery({
    queryKey: ["agenda-eventos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agenda_eventos")
        .select("*")
        .neq("status", "cancelado")
        .order("inicio");
      if (error) throw error;
      return data as Evento[];
    },
  });

  const { data: ordens = [] } = useQuery({
    queryKey: ["agenda-ordens"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordens_servico")
        .select("id, numero, tipo_servico, cliente_nome, data_agendada, responsavel, status")
        .not("data_agendada", "is", null);
      if (error) throw error;
      return data;
    },
  });

  const { data: obras = [] } = useQuery({
    queryKey: ["agenda-obras"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("obras")
        .select("id, numero, tipo_servico, cliente_nome, endereco_obra, data_limite, responsavel, status_geral")
        .not("data_limite", "is", null);
      if (error) throw error;
      return data;
    },
  });

  const { data: equipe = [] } = useQuery({
    queryKey: ["agenda-equipe"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funcionarios")
        .select("id, nome, user_id, email")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const itens = useMemo<Item[]>(() => {
    const lista: Item[] = [];

    for (const e of eventos) {
      const d = new Date(e.inicio);
      lista.push({
        id: `ev-${e.id}`,
        origem: "evento",
        titulo: e.titulo,
        detalhe: [e.descricao, e.cliente_nome ? `Cliente: ${e.cliente_nome}` : null]
          .filter(Boolean)
          .join(" · "),
        local: e.local,
        quando: d.toISOString().slice(0, 10),
        hora: e.dia_inteiro ? null : d.toTimeString().slice(0, 5),
        responsavelId: e.responsavel_id,
        responsavelNome: e.responsavel_nome,
        tipo: e.tipo,
        status: e.status,
      });
    }

    for (const o of ordens) {
      lista.push({
        id: `os-${o.id}`,
        origem: "os",
        titulo: `OS ${o.numero ?? ""} · ${o.tipo_servico}`,
        detalhe: o.cliente_nome ? `Cliente: ${o.cliente_nome}` : null,
        local: null,
        quando: String(o.data_agendada),
        hora: null,
        responsavelId: null,
        responsavelNome: o.responsavel,
        tipo: "trabalho",
        status: o.status,
      });
    }

    for (const ob of obras) {
      lista.push({
        id: `obra-${ob.id}`,
        origem: "obra",
        titulo: `Obra ${ob.numero ?? ""} · ${ob.tipo_servico}`,
        detalhe: ob.cliente_nome ? `Cliente: ${ob.cliente_nome}` : null,
        local: ob.endereco_obra,
        quando: String(ob.data_limite),
        hora: null,
        responsavelId: null,
        responsavelNome: ob.responsavel,
        tipo: "trabalho",
        status: ob.status_geral,
      });
    }

    return lista.sort((a, b) => (a.quando + (a.hora ?? "")).localeCompare(b.quando + (b.hora ?? "")));
  }, [eventos, ordens, obras]);

  const meuNome = useMemo(() => {
    const f = equipe.find((x) => x.user_id === user?.id);
    return f?.nome ?? user?.email ?? "";
  }, [equipe, user]);

  const ehMeu = (i: Item) =>
    (!!i.responsavelId && i.responsavelId === user?.id) ||
    (!!i.responsavelNome && !!meuNome && i.responsavelNome.toLowerCase() === meuNome.toLowerCase());

  const filtrados = useMemo(() => {
    const hoje = new Date().toISOString().slice(0, 10);
    const limite =
      periodo === "todos"
        ? null
        : new Date(Date.now() + Number(periodo) * 86_400_000).toISOString().slice(0, 10);
    return itens.filter((i) => {
      if (i.quando < hoje) return false;
      if (limite && i.quando > limite) return false;
      if (somenteMeus && !ehMeu(i)) return false;
      return true;
    });
  }, [itens, periodo, somenteMeus, user, meuNome]);

  const porDia = useMemo(() => {
    const mapa = new Map<string, Item[]>();
    for (const i of filtrados) {
      const lista = mapa.get(i.quando) ?? [];
      lista.push(i);
      mapa.set(i.quando, lista);
    }
    return [...mapa.entries()];
  }, [filtrados]);

  const hoje = new Date().toISOString().slice(0, 10);
  const kpis = {
    hoje: itens.filter((i) => i.quando === hoje).length,
    meus: filtrados.filter(ehMeu).length,
    total: filtrados.length,
  };

  const criar = useMutation({
    mutationFn: async () => {
      if (!form.titulo.trim()) throw new Error("Informe o título do compromisso.");
      const diaInteiro = form.dia_inteiro === "sim";
      const inicio = diaInteiro
        ? new Date(`${form.data}T00:00:00`)
        : new Date(`${form.data}T${form.hora || "09:00"}:00`);
      const fim = diaInteiro
        ? inicio
        : new Date(inicio.getTime() + (Number(form.duracao) || 60) * 60_000);
      const responsavel = equipe.find((f) => f.user_id === form.responsavel_id);

      const { error } = await supabase.from("agenda_eventos").insert({
        titulo: form.titulo.trim(),
        descricao: form.descricao || null,
        tipo: form.tipo,
        inicio: inicio.toISOString(),
        fim: fim.toISOString(),
        dia_inteiro: diaInteiro,
        local: form.local || null,
        cliente_nome: form.cliente_nome || null,
        responsavel_id: form.responsavel_id || user?.id || null,
        responsavel_nome: responsavel?.nome ?? meuNome ?? null,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Compromisso na agenda da equipe!");
      setForm(vazio);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["agenda-eventos"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agenda_eventos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Compromisso removido.");
      qc.invalidateQueries({ queryKey: ["agenda-eventos"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const regenerar = useMutation({
    mutationFn: () => trocarToken(),
    onSuccess: () => {
      toast.success("Novo link gerado. Reassine a agenda no celular.");
      qc.invalidateQueries({ queryKey: ["agenda-token"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const linkAgenda =
    typeof window !== "undefined" && assinatura?.token
      ? `${window.location.origin}/api/public/agenda/${assinatura.token}.ics`
      : "";

  const set = (k: keyof typeof vazio) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda da Equipe"
        subtitle="Todos veem a agenda inteira; os compromissos sob sua responsabilidade aparecem em destaque."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus /> Novo compromisso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Novo compromisso</DialogTitle>
                <DialogDescription>
                  Vale para serviço, visita, reunião ou compromisso pessoal.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Título" className="sm:col-span-2">
                  <Input value={form.titulo} onChange={(e) => set("titulo")(e.target.value)} />
                </Field>
                <Field label="Tipo">
                  <Select value={form.tipo} onValueChange={set("tipo")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trabalho">Trabalho</SelectItem>
                      <SelectItem value="pessoal">Pessoal</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Responsável">
                  <Select value={form.responsavel_id} onValueChange={set("responsavel_id")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Eu mesmo" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipe
                        .filter((f) => f.user_id)
                        .map((f) => (
                          <SelectItem key={f.id} value={f.user_id as string}>
                            {f.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Data">
                  <Input type="date" value={form.data} onChange={(e) => set("data")(e.target.value)} />
                </Field>
                <Field label="Dia inteiro">
                  <Select value={form.dia_inteiro} onValueChange={set("dia_inteiro")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nao">Não</SelectItem>
                      <SelectItem value="sim">Sim</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                {form.dia_inteiro === "nao" && (
                  <>
                    <Field label="Hora de início">
                      <Input type="time" value={form.hora} onChange={(e) => set("hora")(e.target.value)} />
                    </Field>
                    <Field label="Duração (minutos)">
                      <Input
                        type="number"
                        value={form.duracao}
                        onChange={(e) => set("duracao")(e.target.value)}
                      />
                    </Field>
                  </>
                )}
                <Field label="Cliente (opcional)">
                  <Input
                    value={form.cliente_nome}
                    onChange={(e) => set("cliente_nome")(e.target.value)}
                  />
                </Field>
                <Field label="Local">
                  <Input value={form.local} onChange={(e) => set("local")(e.target.value)} />
                </Field>
                <Field label="Observações" className="sm:col-span-2">
                  <Textarea
                    value={form.descricao}
                    onChange={(e) => set("descricao")(e.target.value)}
                  />
                </Field>
              </div>
              <DialogFooter>
                <Button onClick={() => criar.mutate()} disabled={criar.isPending}>
                  Salvar na agenda
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Compromissos hoje" value={String(kpis.hoje)} />
        <Kpi label="Sob sua responsabilidade" value={String(kpis.meus)} tone="positive" />
        <Kpi label="Total no período" value={String(kpis.total)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="size-4" /> Ver a agenda no celular
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Este link é pessoal. Adicione-o no calendário do celular (Google Agenda → Outros
            calendários → Assinar por URL, ou iPhone → Calendários → Adicionar assinatura) e a
            agenda da equipe aparece direto no seu telefone, sempre atualizada. Os itens sob sua
            responsabilidade vêm marcados com ★.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input readOnly value={linkAgenda} className="font-mono text-xs" />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  navigator.clipboard.writeText(linkAgenda);
                  toast.success("Link copiado.");
                }}
                disabled={!linkAgenda}
              >
                <Copy /> Copiar
              </Button>
              <Button
                variant="outline"
                onClick={() => regenerar.mutate()}
                disabled={regenerar.isPending}
              >
                <RefreshCw /> Novo link
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="size-4" /> Google Agenda (nos dois sentidos)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            "Trazer do Google" puxa os compromissos da conta conectada (Campinas Jardim do Trevo).
            "Enviar para o Google" leva tudo que é criado aqui — compromissos, obras do Flight
            Board e ordens de serviço. Pode repetir quando quiser: nada é duplicado, só atualizado.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={agendaGoogle} onValueChange={setAgendaGoogle}>
              <SelectTrigger className="sm:w-96">
                <SelectValue placeholder="Agenda do Google" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Agenda principal da conta</SelectItem>
                {agendasGoogle
                  .filter((a) => !a.principal)
                  .map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nome}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              onClick={() => sincronizar.mutate()}
              disabled={sincronizar.isPending}
            >
              <RefreshCw /> {sincronizar.isPending ? "Trazendo…" : "Trazer do Google"}
            </Button>
            <Button onClick={() => enviar.mutate()} disabled={enviar.isPending}>
              <Upload /> {enviar.isPending ? "Enviando…" : "Enviar para o Google"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Somente hoje</SelectItem>
            <SelectItem value="7">Próximos 7 dias</SelectItem>
            <SelectItem value="30">Próximos 30 dias</SelectItem>
            <SelectItem value="90">Próximos 90 dias</SelectItem>
            <SelectItem value="todos">Tudo</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={somenteMeus ? "default" : "outline"}
          onClick={() => setSomenteMeus((v) => !v)}
        >
          Só os meus
        </Button>
      </div>

      {porDia.length === 0 && (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nenhum compromisso neste período.
        </p>
      )}

      <div className="space-y-4">
        {porDia.map(([dia, lista]) => (
          <Card key={dia}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm capitalize">
                {diaLongo(dia)} {dia === hoje && <Badge className="ml-2">Hoje</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lista.map((i) => {
                const meu = ehMeu(i);
                return (
                  <div
                    key={i.id}
                    className={`flex flex-col gap-1 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between ${
                      meu ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <div className="min-w-0">
                      <p
                        className={`truncate text-sm ${meu ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                      >
                        {i.hora ? `${i.hora} · ` : "Dia inteiro · "}
                        {i.titulo}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[i.responsavelNome ?? "sem responsável", i.detalhe, i.local]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {meu && <Badge>Você</Badge>}
                      {i.tipo === "pessoal" && <Badge variant="secondary">Pessoal</Badge>}
                      <Badge variant="outline">
                        {i.origem === "evento" ? "Agenda" : i.origem === "os" ? "OS" : "Obra"}
                      </Badge>
                      {i.origem === "evento" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => remover.mutate(i.id.replace("ev-", ""))}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
