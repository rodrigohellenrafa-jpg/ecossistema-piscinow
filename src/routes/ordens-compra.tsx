import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Printer, Trash2 } from "lucide-react";
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
import { brl, dataBR, hojeISO, proximoCodigo } from "@/lib/erp";

export const Route = createFileRoute("/ordens-compra")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Ordens de Compra | Piscinow ERP" },
      {
        name: "description",
        content:
          "Gerencie ordens de compra por fornecedor: itens, ICMS, ICMS ST, status e impressão.",
      },
      { property: "og:title", content: "Ordens de Compra | Piscinow ERP" },
      {
        property: "og:description",
        content: "Acompanhe e edite ordens de compra até a entrada da mercadoria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <OrdensCompra />
    </RequireAuth>
  ),
});

const STATUS = ["sob_encomenda", "pendente", "enviada", "recebida", "cancelada"] as const;

const statusLabel: Record<string, string> = {
  sob_encomenda: "Sob encomenda",
  pendente: "Pendente",
  enviada: "Enviada",
  recebida: "Recebida",
  cancelada: "Cancelada",
};

const statusVariant = (s: string): "secondary" | "default" | "destructive" | "outline" => {
  if (s === "recebida") return "default";
  if (s === "cancelada") return "destructive";
  if (s === "enviada") return "outline";
  return "secondary";
};

type Ordem = {
  id: string;
  numero: string | null;
  fornecedor_id: string | null;
  fornecedor_nome: string | null;
  data_pedido: string;
  previsao_entrega: string | null;
  condicoes: string | null;
  valor_produtos: number;
  desconto: number;
  icms_base: number;
  icms_valor: number;
  icms_st_base: number;
  icms_st_valor: number;
  valor_total: number;
  status: string;
  observacoes: string | null;
};

type Item = {
  id: string;
  ordem_id: string;
  produto_id: string | null;
  codigo: string | null;
  descricao: string;
  ncm: string | null;
  cst: string | null;
  unidade: string;
  quantidade: number;
  valor_unitario: number;
  desconto: number;
  total: number;
};

type Fornecedor = { id: string; nome: string };
type Produto = {
  id: string;
  codigo: string | null;
  nome: string;
  unidade: string;
  ncm: string | null;
  cst: string | null;
  preco_custo: number;
};

const novoItemVazio = {
  produto_id: "",
  quantidade: "1",
  valor_unitario: "0",
  desconto: "0",
};

function OrdensCompra() {
  const qc = useQueryClient();
  const [filtroStatus, setFiltroStatus] = useState<string>("todas");
  const [detalheId, setDetalheId] = useState<string | null>(null);
  const [novaOpen, setNovaOpen] = useState(false);
  const [novoItem, setNovoItem] = useState(novoItemVazio);
  const [novaOrdem, setNovaOrdem] = useState({
    fornecedor_id: "",
    previsao_entrega: "",
    condicoes: "",
    observacoes: "",
  });
  const [itensNovaOrdem, setItensNovaOrdem] = useState<
    { produto_id: string; codigo: string; descricao: string; ncm: string; cst: string; unidade: string; quantidade: number; valor_unitario: number; desconto: number }[]
  >([]);

  const { data: ordens = [] } = useQuery({
    queryKey: ["ordens_compra"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordens_compra")
        .select("*")
        .order("data_pedido", { ascending: false });
      if (error) throw error;
      return data as Ordem[];
    },
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ["fornecedores", "lista"],
    queryFn: async () => {
      const { data, error } = await supabase.from("fornecedores").select("id, nome").order("nome");
      if (error) throw error;
      return data as Fornecedor[];
    },
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos", "lista-simples"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("id, codigo, nome, unidade, ncm, cst, preco_custo")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data as Produto[];
    },
  });

  const { data: itensDetalhe = [] } = useQuery({
    queryKey: ["ordem_compra_itens", detalheId],
    enabled: !!detalheId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordem_compra_itens")
        .select("*")
        .eq("ordem_id", detalheId!)
        .order("created_at");
      if (error) throw error;
      return data as Item[];
    },
  });

  const ordensFiltradas = useMemo(
    () => (filtroStatus === "todas" ? ordens : ordens.filter((o) => o.status === filtroStatus)),
    [ordens, filtroStatus],
  );

  const ordemDetalhe = ordens.find((o) => o.id === detalheId) ?? null;

  const atualizarStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("ordens_compra").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status atualizado");
      qc.invalidateQueries({ queryKey: ["ordens_compra"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const atualizarIcms = useMutation({
    mutationFn: async (campos: Partial<Ordem> & { id: string }) => {
      const { id, ...resto } = campos;
      const { error } = await supabase.from("ordens_compra").update(resto).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ordens_compra"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const excluirOrdem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ordens_compra").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ordem removida");
      setDetalheId(null);
      qc.invalidateQueries({ queryKey: ["ordens_compra"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const recalcularTotal = (o: Ordem) =>
    Number(o.valor_produtos) - Number(o.desconto) + Number(o.icms_st_valor);

  const salvarIcmsBase = (campo: "icms_base" | "icms_st_base", valor: string) => {
    if (!ordemDetalhe) return;
    const num = Number(valor) || 0;
    const patch: Partial<Ordem> & { id: string } = { id: ordemDetalhe.id, [campo]: num } as any;
    if (campo === "icms_base") patch.icms_valor = num * 0.18;
    if (campo === "icms_st_base") patch.icms_st_valor = num * 0.18;
    const merged = { ...ordemDetalhe, ...patch };
    patch.valor_total = recalcularTotal(merged);
    atualizarIcms.mutate(patch);
  };

  const adicionarItemNovaOrdem = () => {
    const produto = produtos.find((p) => p.id === novoItem.produto_id);
    if (!produto) return toast.error("Selecione um produto");
    const quantidade = Number(novoItem.quantidade) || 0;
    const valor_unitario = Number(novoItem.valor_unitario) || Number(produto.preco_custo);
    const desconto = Number(novoItem.desconto) || 0;
    setItensNovaOrdem((it) => [
      ...it,
      {
        produto_id: produto.id,
        codigo: produto.codigo ?? "",
        descricao: produto.nome,
        ncm: produto.ncm ?? "",
        cst: produto.cst ?? "",
        unidade: produto.unidade,
        quantidade,
        valor_unitario,
        desconto,
      },
    ]);
    setNovoItem(novoItemVazio);
  };

  const criarOrdem = useMutation({
    mutationFn: async () => {
      if (!novaOrdem.fornecedor_id) throw new Error("Selecione o fornecedor");
      if (itensNovaOrdem.length === 0) throw new Error("Adicione ao menos um item");
      const fornecedor = fornecedores.find((f) => f.id === novaOrdem.fornecedor_id);
      const valorProdutos = itensNovaOrdem.reduce(
        (s, i) => s + (i.quantidade * i.valor_unitario - i.desconto),
        0,
      );
      const icmsBase = valorProdutos;
      const icmsValor = icmsBase * 0.18;
      const { data: auth } = await supabase.auth.getUser();
      const { data: existentes } = await supabase.from("ordens_compra").select("numero");
      const numero = proximoCodigo("OC", (existentes ?? []).map((o) => o.numero));

      const { data: ordem, error: erroOrdem } = await supabase
        .from("ordens_compra")
        .insert({
          numero,
          fornecedor_id: novaOrdem.fornecedor_id,
          fornecedor_nome: fornecedor?.nome ?? null,
          data_pedido: hojeISO(),
          previsao_entrega: novaOrdem.previsao_entrega || null,
          condicoes: novaOrdem.condicoes || null,
          observacoes: novaOrdem.observacoes || null,
          valor_produtos: valorProdutos,
          desconto: 0,
          icms_base: icmsBase,
          icms_valor: icmsValor,
          icms_st_base: 0,
          icms_st_valor: 0,
          valor_total: valorProdutos,
          status: "pendente",
          created_by: auth.user?.id ?? null,
        })
        .select("id")
        .single();
      if (erroOrdem) throw erroOrdem;

      const payload = itensNovaOrdem.map((i) => ({
        ordem_id: ordem.id,
        produto_id: i.produto_id,
        codigo: i.codigo,
        descricao: i.descricao,
        ncm: i.ncm,
        cst: i.cst,
        unidade: i.unidade,
        quantidade: i.quantidade,
        valor_unitario: i.valor_unitario,
        desconto: i.desconto,
        total: i.quantidade * i.valor_unitario - i.desconto,
      }));
      const { error: erroItens } = await supabase.from("ordem_compra_itens").insert(payload);
      if (erroItens) throw erroItens;
    },
    onSuccess: () => {
      toast.success("Ordem de compra criada");
      setNovaOpen(false);
      setNovaOrdem({ fornecedor_id: "", previsao_entrega: "", condicoes: "", observacoes: "" });
      setItensNovaOrdem([]);
      qc.invalidateQueries({ queryKey: ["ordens_compra"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ordens de Compra"
        subtitle="Controle de pedidos por fornecedor, ICMS, status e impressão."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos os status</SelectItem>
                {STATUS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabel[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={novaOpen} onOpenChange={setNovaOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus /> Nova ordem
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Criar ordem de compra</DialogTitle>
                  <DialogDescription>
                    Escolha o fornecedor, adicione os itens e salve a ordem.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Fornecedor *">
                    <Select
                      value={novaOrdem.fornecedor_id}
                      onValueChange={(v) => setNovaOrdem((f) => ({ ...f, fornecedor_id: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {fornecedores.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Previsão de entrega">
                    <Input
                      type="date"
                      value={novaOrdem.previsao_entrega}
                      onChange={(e) =>
                        setNovaOrdem((f) => ({ ...f, previsao_entrega: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Condições" className="sm:col-span-2">
                    <Input
                      value={novaOrdem.condicoes}
                      onChange={(e) => setNovaOrdem((f) => ({ ...f, condicoes: e.target.value }))}
                      placeholder="30/60 dias, boleto..."
                    />
                  </Field>
                  <Field label="Observações" className="sm:col-span-2">
                    <Textarea
                      value={novaOrdem.observacoes}
                      onChange={(e) =>
                        setNovaOrdem((f) => ({ ...f, observacoes: e.target.value }))
                      }
                    />
                  </Field>
                </div>

                <div className="space-y-2 rounded-lg border border-border p-3">
                  <p className="text-sm font-medium">Adicionar item</p>
                  <div className="grid gap-2 sm:grid-cols-4">
                    <Select
                      value={novoItem.produto_id}
                      onValueChange={(v) => setNovoItem((i) => ({ ...i, produto_id: v }))}
                    >
                      <SelectTrigger className="sm:col-span-2">
                        <SelectValue placeholder="Produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {produtos.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.codigo ? `${p.codigo} — ` : ""}
                            {p.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Qtd"
                      value={novoItem.quantidade}
                      onChange={(e) => setNovoItem((i) => ({ ...i, quantidade: e.target.value }))}
                    />
                    <Input
                      type="number"
                      placeholder="Vlr unitário"
                      value={novoItem.valor_unitario}
                      onChange={(e) =>
                        setNovoItem((i) => ({ ...i, valor_unitario: e.target.value }))
                      }
                    />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={adicionarItemNovaOrdem}>
                    <Plus className="size-4" /> Adicionar item
                  </Button>

                  {itensNovaOrdem.length > 0 && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-right">Qtd</TableHead>
                          <TableHead className="text-right">Vlr Unit</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {itensNovaOrdem.map((i, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{i.descricao}</TableCell>
                            <TableCell className="text-right">{i.quantidade}</TableCell>
                            <TableCell className="text-right">{brl(i.valor_unitario)}</TableCell>
                            <TableCell className="text-right">
                              {brl(i.quantidade * i.valor_unitario - i.desconto)}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  setItensNovaOrdem((it) => it.filter((_, j) => j !== idx))
                                }
                              >
                                <Trash2 className="text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>

                <DialogFooter>
                  <Button onClick={() => criarOrdem.mutate()} disabled={criarOrdem.isPending}>
                    Salvar ordem
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Ordens <Badge variant="secondary">{ordensFiltradas.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ordensFiltradas.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma ordem de compra encontrada.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Previsão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordensFiltradas.map((o) => (
                    <TableRow
                      key={o.id}
                      className="cursor-pointer"
                      onClick={() => setDetalheId(o.id)}
                    >
                      <TableCell className="font-mono text-xs">{o.numero ?? "—"}</TableCell>
                      <TableCell className="font-medium">{o.fornecedor_nome ?? "—"}</TableCell>
                      <TableCell>{dataBR(o.data_pedido)}</TableCell>
                      <TableCell>{dataBR(o.previsao_entrega)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(o.status)}>
                          {statusLabel[o.status] ?? o.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{brl(Number(o.valor_total))}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            excluirOrdem.mutate(o.id);
                          }}
                        >
                          <Trash2 className="text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!detalheId} onOpenChange={(v) => !v && setDetalheId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl print:max-h-none print:overflow-visible">
          {ordemDetalhe && (
            <div className="space-y-6">
              <DialogHeader className="print:hidden">
                <DialogTitle>Ordem de compra {ordemDetalhe.numero}</DialogTitle>
                <DialogDescription>
                  Detalhe completo da ordem, itens e tributos.
                </DialogDescription>
              </DialogHeader>

              <div className="hidden print:block">
                <h1 className="text-xl font-semibold">Ordem de Compra {ordemDetalhe.numero}</h1>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Fornecedor</p>
                  <p className="font-medium">{ordemDetalhe.fornecedor_nome ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Data do pedido</p>
                  <p className="font-medium">{dataBR(ordemDetalhe.data_pedido)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Previsão de entrega</p>
                  <p className="font-medium">{dataBR(ordemDetalhe.previsao_entrega)}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Condições</p>
                  <p className="font-medium">{ordemDetalhe.condicoes ?? "—"}</p>
                </div>
                <div className="print:hidden">
                  <p className="mb-1 text-xs text-muted-foreground">Status</p>
                  <Select
                    value={ordemDetalhe.status}
                    onValueChange={(status) =>
                      atualizarStatus.mutate({ id: ordemDetalhe.id, status })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {statusLabel[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cód</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>NCM</TableHead>
                    <TableHead>CST</TableHead>
                    <TableHead>Unid.</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Vlr Unit</TableHead>
                    <TableHead className="text-right">Desconto</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itensDetalhe.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-mono text-xs">{i.codigo ?? "—"}</TableCell>
                      <TableCell>{i.descricao}</TableCell>
                      <TableCell>{i.ncm ?? "—"}</TableCell>
                      <TableCell>{i.cst ?? "—"}</TableCell>
                      <TableCell>{i.unidade}</TableCell>
                      <TableCell className="text-right">{i.quantidade}</TableCell>
                      <TableCell className="text-right">{brl(Number(i.valor_unitario))}</TableCell>
                      <TableCell className="text-right">{brl(Number(i.desconto))}</TableCell>
                      <TableCell className="text-right">{brl(Number(i.total))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-4">
                <Field label="Base ICMS" className="print:hidden">
                  <Input
                    type="number"
                    defaultValue={ordemDetalhe.icms_base}
                    onBlur={(e) => salvarIcmsBase("icms_base", e.target.value)}
                  />
                </Field>
                <div>
                  <p className="text-xs text-muted-foreground">Valor ICMS</p>
                  <p className="font-medium">{brl(Number(ordemDetalhe.icms_valor))}</p>
                </div>
                <Field label="Base ICMS ST" className="print:hidden">
                  <Input
                    type="number"
                    defaultValue={ordemDetalhe.icms_st_base}
                    onBlur={(e) => salvarIcmsBase("icms_st_base", e.target.value)}
                  />
                </Field>
                <div>
                  <p className="text-xs text-muted-foreground">Valor ICMS ST</p>
                  <p className="font-medium">{brl(Number(ordemDetalhe.icms_st_valor))}</p>
                </div>
                <div className="sm:col-span-4 border-t border-border pt-3 text-right">
                  <p className="text-sm text-muted-foreground">Valor total da ordem</p>
                  <p className="text-2xl font-semibold">{brl(Number(ordemDetalhe.valor_total))}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 print:hidden">
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer /> Imprimir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
