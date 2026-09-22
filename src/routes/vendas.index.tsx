import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Kpi, PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { validarSenhaMestra } from "@/lib/mestre.functions";
import { brl, dataBR, diasAte, margem, STATUS_PEDIDO } from "@/lib/erp";

/** Data em que o controle passou a valer; pedidos anteriores são só histórico. */
const INICIO_CONTROLE = "2026-09-04";

const TIPOS_ATENDIMENTO = [
  { value: "in", label: "IN · Balcão" },
  { value: "out", label: "OUT · Serviço externo" },
];

export const Route = createFileRoute("/vendas/")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Vendas | Piscinow ERP" },
      {
        name: "description",
        content: "Gerencie pedidos, orçamentos, faturamento e margem das vendas Piscinow.",
      },
      { property: "og:title", content: "Vendas | Piscinow ERP" },
      {
        property: "og:description",
        content: "Acompanhe pedidos e orçamentos, filtre por período, cliente e status.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Vendas />
    </RequireAuth>
  ),
});

const STATUS_LABEL: Record<string, string> = {
  orcamento: "Orçamento",
  aprovado: "Aprovado",
  em_producao: "Em produção",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  orcamento: "secondary",
  aprovado: "default",
  em_producao: "outline",
  concluido: "default",
  cancelado: "destructive",
};

const TIPO_LABEL: Record<string, string> = {
  in: "IN · Balcão",
  out: "OUT · Serviço externo",
};

function Vendas() {
  const [aba, setAba] = useState<string>("pedidos");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("todos");
  const [tipo, setTipo] = useState<string>("todos");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const qc = useQueryClient();
  const validarMestra = useServerFn(validarSenhaMestra);
  const navigate = useNavigate();
  const [alvo, setAlvo] = useState<{
    id: string;
    numero: string | null;
    acao: "excluir" | "editar";
  } | null>(null);
  const [senha, setSenha] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  const [editTipo, setEditTipo] = useState<{
    id: string;
    numero: string | null;
    tipo_atendimento: string;
  } | null>(null);
  const [novoTipo, setNovoTipo] = useState<string>("in");
  const [salvandoTipo, setSalvandoTipo] = useState(false);

  const [sel, setSel] = useState<string[]>([]);
  const [loteAberto, setLoteAberto] = useState(false);
  const [excluindoLote, setExcluindoLote] = useState(false);

  const alternar = (id: string) =>
    setSel((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  async function excluirSelecionados() {
    if (sel.length === 0) return;
    setExcluindoLote(true);
    try {
      const r = await validarMestra({ data: { senha } });
      if (!r.ok) {
        toast.error(
          r.motivo === "nao_configurada"
            ? "A senha mestra ainda não foi cadastrada."
            : "Senha mestra incorreta.",
        );
        return;
      }
      const { error } = await supabase.from("vendas").delete().in("id", sel);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["vendas"] });
      toast.success(`${sel.length} pedido(s) excluído(s).`);
      setSel([]);
      setSenha("");
      setLoteAberto(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível excluir os pedidos.");
    } finally {
      setExcluindoLote(false);
    }
  }

  async function confirmarAcao() {
    if (!alvo) return;
    setExcluindo(true);
    try {
      const r = await validarMestra({ data: { senha } });
      if (!r.ok) {
        toast.error(
          r.motivo === "nao_configurada"
            ? "A senha mestra ainda não foi cadastrada."
            : "Senha mestra incorreta.",
        );
        return;
      }
      if (alvo.acao === "editar") {
        const id = alvo.id;
        setAlvo(null);
        setSenha("");
        void navigate({ to: "/vendas/$id", params: { id } });
        return;
      }
      const { error } = await supabase.from("vendas").delete().eq("id", alvo.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["vendas"] });
      toast.success(`Pedido ${alvo.numero ?? ""} excluído.`);
      setAlvo(null);
      setSenha("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível concluir a ação.");
    } finally {
      setExcluindo(false);
    }
  }

  const { data: vendas = [] } = useQuery({
    queryKey: ["vendas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendas")
        .select("*")
        .order("data", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const atualizarStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("vendas")
        .update({ status_pedido: status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["vendas"] });
      toast.success(v.status === "aprovado" ? "Orçamento aprovado." : "Orçamento cancelado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const atualizarTipoAtendimento = useMutation({
    mutationFn: async ({ id, tipo_atendimento }: { id: string; tipo_atendimento: string }) => {
      const { error } = await supabase.from("vendas").update({ tipo_atendimento }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendas"] });
      toast.success("Tipo de atendimento atualizado.");
      setEditTipo(null);
      setNovoTipo("in");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function salvarTipoAtendimento() {
    if (!editTipo || !novoTipo) return;
    setSalvandoTipo(true);
    try {
      const r = await validarMestra({ data: { senha } });
      if (!r.ok) {
        toast.error(
          r.motivo === "nao_configurada"
            ? "A senha mestra ainda não foi cadastrada."
            : "Senha mestra incorreta.",
        );
        return;
      }
      await atualizarTipoAtendimento.mutateAsync({
        id: editTipo.id,
        tipo_atendimento: novoTipo,
      });
      setSenha("");
    } finally {
      setSalvandoTipo(false);
    }
  }

  const pedidos = useMemo(
    () =>
      vendas.filter((v) => v.status_pedido !== "orcamento").filter((v) => {
        const buscaOk = `${v.numero ?? ""} ${v.cliente_nome ?? ""} ${v.vendedor ?? ""}`
          .toLowerCase()
          .includes(q.toLowerCase());
        const statusOk = status === "todos" || v.status_pedido === status;
        const tipoOk = tipo === "todos" || v.tipo_atendimento === tipo;
        const inicioOk = !inicio || v.data >= inicio;
        const fimOk = !fim || v.data <= fim;
        return buscaOk && statusOk && tipoOk && inicioOk && fimOk;
      }),
    [vendas, q, status, tipo, inicio, fim],
  );

  const orcamentos = useMemo(
    () =>
      vendas
        .filter((v) => v.status_pedido === "orcamento")
        .filter((v) =>
          `${v.numero ?? ""} ${v.cliente_nome ?? ""} ${v.vendedor ?? ""}`
            .toLowerCase()
            .includes(q.toLowerCase()),
        ),
    [vendas, q],
  );

  /** Pedidos anteriores ao início do controle ficam só como histórico. */
  const pedidosAtuais = useMemo(
    () => pedidos.filter((v) => String(v.data).slice(0, 10) >= INICIO_CONTROLE),
    [pedidos],
  );
  const pedidosHistoricos = useMemo(
    () => pedidos.filter((v) => String(v.data).slice(0, 10) < INICIO_CONTROLE),
    [pedidos],
  );

  const faturamento = pedidosAtuais.reduce((s, v) => s + Number(v.valor_total), 0);
  const ticketMedio = pedidosAtuais.length ? faturamento / pedidosAtuais.length : 0;
  const custoTotal = pedidosAtuais.reduce((s, v) => s + Number(v.custo_total), 0);
  const margemMedia = margem(faturamento, custoTotal);
  const emAberto = pedidosAtuais.filter((v) =>
    ["aprovado", "em_producao"].includes(v.status_pedido),
  ).length;

  const faturamentoHistorico = pedidosHistoricos.reduce(
    (s, v) => s + Number(v.valor_total),
    0,
  );

  const totalOrcado = orcamentos.reduce((s, v) => s + Number(v.valor_total), 0);
  const ticketOrcamento = orcamentos.length ? totalOrcado / orcamentos.length : 0;
  const antigos = orcamentos.filter((v) => (diasAte(v.data) ?? 0) <= -15).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendas"
        subtitle="Gerencie pedidos e orçamentos em um só lugar."
        actions={
          <div className="flex flex-wrap gap-2">
            {sel.length > 0 && (
              <>
                <Button variant="outline" onClick={() => setSel([])}>
                  Limpar seleção ({sel.length})
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setSenha("");
                    setLoteAberto(true);
                  }}
                >
                  <Trash2 /> Excluir {sel.length} selecionado(s)
                </Button>
              </>
            )}
            <Button asChild>
              <Link to="/vendas/novo">
                <Plus /> Novo pedido
              </Link>
            </Button>
          </div>
        }
      />

      <Tabs value={aba} onValueChange={setAba} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          <TabsTrigger value="orcamentos">
            Orçamentos
            {orcamentos.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {orcamentos.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pedidos" className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label="Faturamento" value={brl(faturamento)} to="/dre" />
            <Kpi label="Ticket médio" value={brl(ticketMedio)} to="/dre" />
            <Kpi
              label="Margem média"
              value={`${(margemMedia * 100).toFixed(1)}%`}
              tone={margemMedia >= 0.25 ? "positive" : margemMedia < 0.1 ? "negative" : "warning"}
              to="/dre"
            />
            <Kpi label="Pedidos em aberto" value={String(emAberto)} to="/logistica" />
          </div>

          <Card>
            <CardHeader className="gap-3">
              <CardTitle>Histórico de Pedidos</CardTitle>
              <div className="flex flex-wrap items-end gap-3">
                <div className="relative max-w-sm flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Buscar por pedido, cliente ou vendedor"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
                <Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className="w-40" />
                <Input type="date" value={fim} onChange={(e) => setFim(e.target.value)} className="w-40" />
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    {STATUS_PEDIDO.filter((s) => s !== "orcamento").map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    <SelectItem value="in">IN · Balcão</SelectItem>
                    <SelectItem value="out">OUT · Serviço externo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        aria-label="Selecionar todos os pedidos"
                        checked={pedidos.length > 0 && pedidos.every((v) => sel.includes(v.id))}
                        onCheckedChange={(c) =>
                          setSel((prev) =>
                            c
                              ? Array.from(new Set([...prev, ...pedidos.map((v) => v.id)]))
                              : prev.filter((id) => !pedidos.some((v) => v.id === id)),
                          )
                        }
                      />
                    </TableHead>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidos.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>
                        <Checkbox
                          checked={sel.includes(v.id)}
                          onCheckedChange={() => alternar(v.id)}
                          aria-label={`Selecionar pedido ${v.numero ?? ""}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link to="/vendas/$id" params={{ id: v.id }} className="text-primary hover:underline">
                          {v.numero}
                        </Link>
                      </TableCell>
                      <TableCell>{dataBR(v.data)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Badge variant={v.tipo_atendimento === "out" ? "default" : "outline"}>
                            {TIPO_LABEL[v.tipo_atendimento] ?? v.tipo_atendimento}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Alterar tipo do pedido ${v.numero ?? ""}`}
                            onClick={() => {
                              setSenha("");
                              setNovoTipo(v.tipo_atendimento || "in");
                              setEditTipo({
                                id: v.id,
                                numero: v.numero,
                                tipo_atendimento: v.tipo_atendimento || "in",
                              });
                            }}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{v.cliente_nome ?? "—"}</TableCell>
                      <TableCell>{v.vendedor ?? "—"}</TableCell>
                      <TableCell className="text-right font-medium">{brl(v.valor_total)}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[v.status_pedido] ?? "secondary"}>
                          {STATUS_LABEL[v.status_pedido] ?? v.status_pedido}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Editar pedido ${v.numero ?? ""}`}
                            onClick={() => {
                              setSenha("");
                              setAlvo({ id: v.id, numero: v.numero, acao: "editar" });
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Excluir pedido ${v.numero ?? ""}`}
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSenha("");
                              setAlvo({ id: v.id, numero: v.numero, acao: "excluir" });
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pedidos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                        Nenhum pedido encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orcamentos" className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label="Orçamentos abertos" value={String(orcamentos.length)} to="/vendas/orcamentos" />
            <Kpi label="Valor em negociação" value={brl(totalOrcado)} to="/vendas/orcamentos" />
            <Kpi label="Ticket médio" value={brl(ticketOrcamento)} to="/vendas/orcamentos" />
            <Kpi
              label="Parados há 15+ dias"
              value={String(antigos)}
              tone={antigos > 0 ? "warning" : "default"}
              to="/reativacao"
            />
          </div>

          <Card>
            <CardHeader className="gap-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Propostas em aberto</CardTitle>
                <Button variant="outline" asChild>
                  <Link to="/vendas/orcamentos">Abrir tela exclusiva</Link>
                </Button>
              </div>
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Buscar por número, cliente ou vendedor"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        aria-label="Selecionar todos os orçamentos"
                        checked={orcamentos.length > 0 && orcamentos.every((v) => sel.includes(v.id))}
                        onCheckedChange={(c) =>
                          setSel((prev) =>
                            c
                              ? Array.from(new Set([...prev, ...orcamentos.map((v) => v.id)]))
                              : prev.filter((id) => !orcamentos.some((v) => v.id === id)),
                          )
                        }
                      />
                    </TableHead>
                    <TableHead>Orçamento</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orcamentos.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>
                        <Checkbox
                          checked={sel.includes(v.id)}
                          onCheckedChange={() => alternar(v.id)}
                          aria-label={`Selecionar orçamento ${v.numero ?? ""}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link
                          to="/vendas/$id"
                          params={{ id: v.id }}
                          className="text-primary hover:underline"
                        >
                          {v.numero}
                        </Link>
                      </TableCell>
                      <TableCell>{dataBR(v.data)}</TableCell>
                      <TableCell>
                        <Badge variant={v.tipo_atendimento === "out" ? "default" : "outline"}>
                          {v.tipo_atendimento === "out" ? "OUT · Serviço externo" : "IN · Balcão"}
                        </Badge>
                      </TableCell>
                      <TableCell>{v.cliente_nome ?? "—"}</TableCell>
                      <TableCell>{v.vendedor ?? "—"}</TableCell>
                      <TableCell className="text-right font-medium">{brl(v.valor_total)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => atualizarStatus.mutate({ id: v.id, status: "aprovado" })}
                          >
                            <Check /> Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => atualizarStatus.mutate({ id: v.id, status: "cancelado" })}
                          >
                            <X /> Recusar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {orcamentos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                        Nenhum orçamento em aberto.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={loteAberto} onOpenChange={(o) => !o && setLoteAberto(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir {sel.length} pedido(s)</DialogTitle>
            <DialogDescription>
              Todos os pedidos selecionados serão excluídos. Esta ação não pode ser desfeita.
              Digite a senha mestra para confirmar.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            value={senha}
            autoComplete="off"
            placeholder="Senha mestra"
            onChange={(e) => setSenha(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void excluirSelecionados();
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoteAberto(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={excluindoLote || !senha}
              onClick={() => void excluirSelecionados()}
            >
              Excluir selecionados
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <Dialog open={alvo !== null} onOpenChange={(o) => !o && setAlvo(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {alvo?.acao === "editar" ? "Editar" : "Excluir"} pedido {alvo?.numero ?? ""}
            </DialogTitle>
            <DialogDescription>
              {alvo?.acao === "editar"
                ? "Digite a senha mestra para abrir o pedido em modo de edição."
                : "Esta ação não pode ser desfeita. Digite a senha mestra para confirmar."}
            </DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            value={senha}
            autoComplete="off"
            placeholder="Senha mestra"
            onChange={(e) => setSenha(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void confirmarAcao();
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAlvo(null)}>
              Cancelar
            </Button>
            <Button
              variant={alvo?.acao === "editar" ? "default" : "destructive"}
              disabled={excluindo || !senha}
              onClick={() => void confirmarAcao()}
            >
              {alvo?.acao === "editar" ? "Abrir para editar" : "Excluir pedido"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editTipo !== null}
        onOpenChange={(o) => {
          if (!o) {
            setEditTipo(null);
            setSenha("");
            setNovoTipo("in");
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Alterar tipo do pedido {editTipo?.numero ?? ""}</DialogTitle>
            <DialogDescription>
              Escolha se o pedido é IN (balcão) ou OUT (serviço externo). A alteração exige senha mestra.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={novoTipo} onValueChange={setNovoTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de atendimento" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_ATENDIMENTO.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="password"
              value={senha}
              autoComplete="off"
              placeholder="Senha mestra"
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void salvarTipoAtendimento();
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditTipo(null);
                setSenha("");
                setNovoTipo("in");
              }}
            >
              Cancelar
            </Button>
            <Button
              disabled={salvandoTipo || !senha || novoTipo === editTipo?.tipo_atendimento}
              onClick={() => void salvarTipoAtendimento()}
            >
              Salvar tipo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
