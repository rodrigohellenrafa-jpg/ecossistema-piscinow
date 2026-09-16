import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Hammer, Plus, FileText, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AssinaturaDialog } from "@/components/assinatura-dialog";
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
import { addDiasUteis, hojeISO, proximoCodigo } from "@/lib/erp";
import { useAbrirModal } from "@/hooks/use-abrir-modal";

export const Route = createFileRoute("/ordens")({
  staticData: { sitemap: false },
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

const PRIORIDADES = ["baixa", "media", "alta"] as const;
const PRIORIDADE_LABEL: Record<string, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
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
  const [busca, setBusca] = useState("");
  const [registro, setRegistro] = useState<{id:string; materiais:string; horas:string} | null>(null);
  const [gravando, setGravando] = useState(false);
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  useAbrirModal("novo", () => {
    setEditando(null);
    setForm(vazio);
    setOpen(true);
  });
  const [form, setForm] = useState(vazio);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>("todos");

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clientes").select("id, nome, endereco_obra").order("nome");
      if (error) throw error;
      return data;
    },
  });

  const { data = [] } = useQuery({
    queryKey: ["ordens"],
    refetchInterval: 10000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordens_servico")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: obras = [] } = useQuery({
    queryKey: ["obras-codigos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("obras")
        .select(
          "numero, os_instalacao, os_logistica, os_acabamento, cliente_id, cliente_nome, tipo_servico, status_geral",
        );
      if (error) throw error;
      return data;
    },
  });

  const filtradas = useMemo(
    () =>
      data.filter(
        (o) =>
          `${o.numero} ${o.cliente_nome} ${o.tipo_servico}`.toLocaleLowerCase().includes(busca.toLocaleLowerCase()) &&
          (filtroStatus === "todos" || o.status === filtroStatus) &&
          (filtroPrioridade === "todos" || o.prioridade === filtroPrioridade),
      ),
    [data, filtroStatus, filtroPrioridade, busca],
  );

  const salvar = useMutation({
    mutationFn: async () => {
      if (!form.cliente_id) throw new Error("Selecione o cliente.");
      if (!form.tipo_servico.trim()) throw new Error("Informe o tipo de serviço.");
      const cliente = clientes.find((c) => c.id === form.cliente_id);
      const payload = {
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
      };
      if (editando) {
        const { error } = await supabase.from("ordens_servico").update(payload).eq("id", editando);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("ordens_servico").insert({
          ...payload,
          created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editando ? "Ordem de serviço atualizada!" : "Ordem de serviço criada!");
      setForm(vazio);
      setEditando(null);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["ordens"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const abrirEdicao = (o: (typeof data)[number]) => {
    setEditando(o.id);
    setForm({
      numero: o.numero ?? "",
      cliente_id: o.cliente_id ?? "",
      tipo_servico: o.tipo_servico ?? "",
      descricao: o.descricao ?? "",
      responsavel: o.responsavel ?? "",
      status: o.status ?? "orcamento",
      prioridade: o.prioridade ?? "media",
      data_agendada: o.data_agendada ?? "",
      valor: String(o.valor ?? 0),
    });
    setOpen(true);
  };

  const excluir = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ordens_servico").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ordem de serviço excluída.");
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

  const gerarObra = useMutation({
    mutationFn: async (os: (typeof data)[number]) => {
      const cliente = clientes.find((c) => c.id === os.cliente_id);

      // Não duplica: se o cliente já tem obra em aberto do mesmo serviço, avisa.
      const duplicada = obras.find(
        (o) =>
          o.status_geral !== "Concluído" &&
          o.tipo_servico === os.tipo_servico &&
          (os.cliente_id
            ? o.cliente_id === os.cliente_id
            : (o.cliente_nome ?? "") === (os.cliente_nome ?? "")),
      );
      if (duplicada) {
        throw new Error(
          `Este cliente já tem a obra ${duplicada.numero ?? ""} em aberto para "${os.tipo_servico}".`,
        );
      }

      const dataPedido = hojeISO();
      const prazoDias = 30;
      const dataLimite = addDiasUteis(dataPedido, prazoDias);
      const { error } = await supabase.from("obras").insert({
        cliente_id: os.cliente_id,
        cliente_nome: os.cliente_nome ?? cliente?.nome ?? null,
        numero: proximoCodigo("OBRA", obras.map((o) => o.numero)),
        tipo_servico: os.tipo_servico,
        data_pedido: dataPedido,
        prazo_dias: prazoDias,
        data_limite: dataLimite,
        responsavel: os.responsavel ?? null,
        endereco_obra: cliente?.endereco_obra ?? null,
        os_instalacao: proximoCodigo("OS-02", obras.map((o) => o.os_instalacao)),
        os_logistica: proximoCodigo("OL", obras.map((o) => o.os_logistica)),
        os_acabamento: proximoCodigo("OS-03", obras.map((o) => o.os_acabamento)),
        status_geral: "Agendado",
        created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Obra criada no Flight Board!");
      qc.invalidateQueries({ queryKey: ["obras"] });
      qc.invalidateQueries({ queryKey: ["obras-codigos"] });
    },
    onError: (e: Error) => toast.error(e.message),
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
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to="/os/formulario">
              <FileText /> Formulário de OS
            </Link>
          </Button>
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) {
                setEditando(null);
                setForm(vazio);
              }
            }}
          >
          <DialogTrigger asChild>
            <Button onClick={() => { setEditando(null); setForm(vazio); }}>
              <Plus /> Nova OS
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editando ? "Editar ordem de serviço" : "Nova ordem de serviço"}</DialogTitle>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ordens abertas ({filtradas.length})</CardTitle>
          <div className="flex flex-wrap gap-2 pt-2">
            <Input className="max-w-xs" placeholder="Buscar cliente, OS ou serviço" aria-label="Buscar ordens" value={busca} onChange={e=>setBusca(e.target.value)} />
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                {STATUS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as prioridades</SelectItem>
                {PRIORIDADES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {PRIORIDADE_LABEL[p]}
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
                <TableHead>OS</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Agenda</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-44">Status</TableHead>
                <TableHead className="w-36">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtradas.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.numero}</TableCell>
                  <TableCell>{o.cliente_nome ?? "—"}</TableCell>
                  <TableCell>
                    {o.tipo_servico}
                    <Badge variant="secondary" className="ml-2">
                      {PRIORIDADE_LABEL[o.prioridade] ?? o.prioridade}
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
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => gerarObra.mutate(o)}
                        disabled={gerarObra.isPending}
                      >
                        <Hammer /> Gerar obra
                      </Button>
                      <Button variant="outline" size="sm" onClick={()=>setRegistro({id:o.id,materiais:o.materiais_utilizados ?? "",horas:String(o.horas_trabalhadas ?? 0)})}>Materiais e horas</Button>
                      <AssinaturaDialog
                        tabela="ordens_servico"
                        registroId={o.id}
                        documentoLabel={`Ordem de serviço ${o.numero ?? ""}`}
                        clienteNome={o.cliente_nome}
                        invalidar={[["ordens"], ["ordens-servico"]]}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtradas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    Nenhuma ordem de serviço encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!registro} onOpenChange={v=>{if(!v)setRegistro(null);}}><DialogContent><DialogHeader><DialogTitle>Registro de execução</DialogTitle></DialogHeader><Field label="Materiais utilizados"><Textarea value={registro?.materiais ?? ""} onChange={e=>registro && setRegistro({...registro,materiais:e.target.value})}/></Field><Field label="Horas trabalhadas"><Input type="number" min="0" step="0.25" value={registro?.horas ?? "0"} onChange={e=>registro && setRegistro({...registro,horas:e.target.value})}/></Field><Button disabled={gravando} onClick={async()=>{if(!registro)return;const horas=Number(registro.horas);if(!Number.isFinite(horas)||horas<0){toast.error("Informe horas válidas.");return;}setGravando(true);try{const {error}=await supabase.from("ordens_servico").update({materiais_utilizados:registro.materiais,horas_trabalhadas:horas}).eq("id",registro.id);if(error)throw error;await qc.invalidateQueries({queryKey:["ordens"]});setRegistro(null);toast.success("Execução registrada.");}catch(e){toast.error(e instanceof Error?e.message:"Não foi possível salvar.");}finally{setGravando(false);}}}>Salvar</Button></DialogContent></Dialog>
      <p className="text-xs text-muted-foreground">
        Acompanhe as obras geradas em{" "}
        <Link to="/logistica" className="underline">
          Flight Board
        </Link>
        .
      </p>
    </div>
  );
}
