import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Printer, Trash2 } from "lucide-react";
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
import { DocumentoOrdemCompra } from "@/components/documento-ordem-compra";
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR, hojeISO, proximoCodigo } from "@/lib/erp";
import logoSplash from "@/assets/logo-splash.png.asset.json";

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
  /** Valor efetivamente faturado na nota fiscal do fornecedor (meia nota). */
  valor_nota: number;
  /** Valor realmente pago ao fornecedor, incluindo a parte fora da nota. */
  valor_pago: number;
  obs_pagamento: string | null;
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
  cliente_id: string | null;
  cliente_nome: string | null;
};

type Fornecedor = {
  id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  cnpj?: string | null;
};
type Cliente = { id: string; nome: string };
type Produto = {
  id: string;
  codigo: string | null;
  nome: string;
  unidade: string;
  ncm: string | null;
  cst: string | null;
  preco_custo: number;
};

/** Valor usado no Select quando o item é para reposição de estoque (sem cliente). */
const SEM_CLIENTE = "__estoque__";

type ItemForm = {
  id?: string;
  produto_id: string;
  codigo: string;
  descricao: string;
  ncm: string;
  cst: string;
  unidade: string;
  quantidade: number;
  valor_unitario: number;
  desconto: number;
  cliente_id: string | null;
  cliente_nome: string | null;
};

const novoItemVazio = {
  produto_id: "",
  quantidade: "1",
  valor_unitario: "0",
  desconto: "0",
  cliente_id: SEM_CLIENTE,
};

function OrdensCompra() {
  const qc = useQueryClient();
  const [filtroStatus, setFiltroStatus] = useState<string>("todas");
  const [detalheId, setDetalheId] = useState<string | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [novaOpen, setNovaOpen] = useState(false);
  const [novoItem, setNovoItem] = useState(novoItemVazio);
  const [novaOrdem, setNovaOrdem] = useState({
    fornecedor_id: "",
    previsao_entrega: "",
    condicoes: "",
    observacoes: "",
  });
  const [itensNovaOrdem, setItensNovaOrdem] = useState<ItemForm[]>([]);

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
      const { data, error } = await supabase
        .from("fornecedores")
        .select("id, nome, email, telefone, cnpj")
        .order("nome");
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

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes", "lista-simples"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data as Cliente[];
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

  /** Ordens agrupadas por fornecedor (e não por pedido). */
  const gruposFornecedor = useMemo(() => {
    const mapa = new Map<string, { chave: string; nome: string; ordens: Ordem[]; total: number }>();
    for (const o of ordensFiltradas) {
      const chave = o.fornecedor_id ?? "sem-fornecedor";
      const grupo =
        mapa.get(chave) ??
        {
          chave,
          nome: o.fornecedor_nome ?? "Fornecedor não definido",
          ordens: [] as Ordem[],
          total: 0,
        };
      grupo.ordens.push(o);
      grupo.total += Number(o.valor_total ?? 0);
      mapa.set(chave, grupo);
    }
    return Array.from(mapa.values()).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [ordensFiltradas]);

  const ordemDetalhe = ordens.find((o) => o.id === detalheId) ?? null;
  const fornecedorDetalhe = ordemDetalhe?.fornecedor_id
    ? (fornecedores.find((f) => f.id === ordemDetalhe.fornecedor_id) ?? null)
    : null;

  const [formEdicao, setFormEdicao] = useState<{
    fornecedor_id: string;
    fornecedor_nome: string;
    previsao_entrega: string;
    condicoes: string;
    observacoes: string;
    status: string;
    itens: ItemForm[];
  }>({ fornecedor_id: "", fornecedor_nome: "", previsao_entrega: "", condicoes: "", observacoes: "", status: "pendente", itens: [] });

  const iniciarEdicao = () => {
    if (!ordemDetalhe) return;
    setFormEdicao({
      fornecedor_id: ordemDetalhe.fornecedor_id ?? "",
      fornecedor_nome: ordemDetalhe.fornecedor_nome ?? "Fornecedor não definido",
      previsao_entrega: ordemDetalhe.previsao_entrega ?? "",
      condicoes: ordemDetalhe.condicoes ?? "",
      observacoes: ordemDetalhe.observacoes ?? "",
      status: ordemDetalhe.status,
      itens: itensDetalhe.map((i) => ({
        id: i.id,
        produto_id: i.produto_id ?? "",
        codigo: i.codigo ?? "",
        descricao: i.descricao,
        ncm: i.ncm ?? "",
        cst: i.cst ?? "",
        unidade: i.unidade,
        quantidade: Number(i.quantidade),
        valor_unitario: Number(i.valor_unitario),
        desconto: Number(i.desconto),
        cliente_id: i.cliente_id ?? null,
        cliente_nome: i.cliente_nome ?? null,
      })),
    });
    setModoEdicao(true);
  };

  const atualizarOrdem = useMutation({
    mutationFn: async () => {
      if (!ordemDetalhe) throw new Error("Ordem não encontrada");
      if (!formEdicao.fornecedor_id) throw new Error("Selecione o fornecedor");
      if (formEdicao.itens.length === 0) throw new Error("Adicione ao menos um item");

      const fornecedor = fornecedores.find((f) => f.id === formEdicao.fornecedor_id);
      const valorProdutos = formEdicao.itens.reduce(
        (s, i) => s + (i.quantidade * i.valor_unitario - i.desconto),
        0,
      );
      const icmsBase = valorProdutos;
      const icmsValor = icmsBase * 0.18;
      const icmsStBase = 0;
      const icmsStValor = 0;
      const valorTotal = valorProdutos;

      const { error: erroOrdem } = await supabase
        .from("ordens_compra")
        .update({
          fornecedor_id: formEdicao.fornecedor_id,
          fornecedor_nome: fornecedor?.nome ?? formEdicao.fornecedor_nome,
          previsao_entrega: formEdicao.previsao_entrega || null,
          condicoes: formEdicao.condicoes || null,
          observacoes: formEdicao.observacoes || null,
          status: formEdicao.status,
          valor_produtos: valorProdutos,
          desconto: 0,
          icms_base: icmsBase,
          icms_valor: icmsValor,
          icms_st_base: icmsStBase,
          icms_st_valor: icmsStValor,
          valor_total: valorTotal,
        })
        .eq("id", ordemDetalhe.id);
      if (erroOrdem) throw erroOrdem;

      const { error: erroExcluirItens } = await supabase
        .from("ordem_compra_itens")
        .delete()
        .eq("ordem_id", ordemDetalhe.id);
      if (erroExcluirItens) throw erroExcluirItens;

      const payload = formEdicao.itens.map((i) => ({
        ordem_id: ordemDetalhe.id,
        produto_id: i.produto_id || null,
        codigo: i.codigo,
        descricao: i.descricao,
        ncm: i.ncm,
        cst: i.cst,
        unidade: i.unidade,
        quantidade: i.quantidade,
        valor_unitario: i.valor_unitario,
        desconto: i.desconto,
        total: i.quantidade * i.valor_unitario - i.desconto,
        cliente_id: i.cliente_id,
        cliente_nome: i.cliente_nome,
      }));
      const { error: erroItens } = await supabase.from("ordem_compra_itens").insert(payload);
      if (erroItens) throw erroItens;
    },
    onSuccess: () => {
      toast.success("Ordem de compra atualizada");
      setModoEdicao(false);
      qc.invalidateQueries({ queryKey: ["ordens_compra"] });
      qc.invalidateQueries({ queryKey: ["ordem_compra_itens", detalheId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const montarItemForm = (): ItemForm | null => {
    const produto = produtos.find((p) => p.id === novoItem.produto_id);
    if (!produto) {
      toast.error("Selecione um produto");
      return null;
    }
    const cliente =
      novoItem.cliente_id && novoItem.cliente_id !== SEM_CLIENTE
        ? clientes.find((c) => c.id === novoItem.cliente_id)
        : undefined;
    return {
      produto_id: produto.id,
      codigo: produto.codigo ?? "",
      descricao: produto.nome,
      ncm: produto.ncm ?? "",
      cst: produto.cst ?? "",
      unidade: produto.unidade,
      quantidade: Number(novoItem.quantidade) || 0,
      valor_unitario: Number(novoItem.valor_unitario) || Number(produto.preco_custo),
      desconto: Number(novoItem.desconto) || 0,
      cliente_id: cliente?.id ?? null,
      cliente_nome: cliente?.nome ?? null,
    };
  };

  const adicionarItemEdicao = () => {
    const item = montarItemForm();
    if (!item) return;
    setFormEdicao((f) => ({ ...f, itens: [...f.itens, item] }));
    setNovoItem(novoItemVazio);
  };

  const alterarClienteItemEdicao = (idx: number, valor: string) => {
    const cliente = valor === SEM_CLIENTE ? undefined : clientes.find((c) => c.id === valor);
    setFormEdicao((f) => {
      const itens = [...f.itens];
      itens[idx] = {
        ...itens[idx],
        cliente_id: cliente?.id ?? null,
        cliente_nome: cliente?.nome ?? null,
      };
      return { ...f, itens };
    });
  };

  const removerItemEdicao = (idx: number) => {
    setFormEdicao((f) => ({ ...f, itens: f.itens.filter((_, i) => i !== idx) }));
  };

  const alterarItemEdicao = (idx: number, campo: "quantidade" | "valor_unitario" | "desconto", valor: string) => {
    const num = Number(valor) || 0;
    setFormEdicao((f) => {
      const itens = [...f.itens];
      itens[idx] = { ...itens[idx], [campo]: num };
      return { ...f, itens };
    });
  };

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
    const item = montarItemForm();
    if (!item) return;
    setItensNovaOrdem((it) => [...it, item]);
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
        cliente_id: i.cliente_id,
        cliente_nome: i.cliente_nome,
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
                    <Select
                      value={novoItem.cliente_id}
                      onValueChange={(v) => setNovoItem((i) => ({ ...i, cliente_id: v }))}
                    >
                      <SelectTrigger className="sm:col-span-2">
                        <SelectValue placeholder="Cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SEM_CLIENTE}>Estoque (sem cliente)</SelectItem>
                        {clientes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nome}
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
                          <TableHead>Cliente</TableHead>
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
                            <TableCell>{i.cliente_nome ?? "Estoque"}</TableCell>
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

      {ordensFiltradas.length === 0 ? (
        <Card>
          <CardContent>
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma ordem de compra encontrada.
            </p>
          </CardContent>
        </Card>
      ) : (
        gruposFornecedor.map((g) => (
          <Card key={g.chave}>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                {g.nome}
                <Badge variant="secondary">
                  {g.ordens.length} ordem{g.ordens.length === 1 ? "" : "s"}
                </Badge>
              </CardTitle>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total do fornecedor</p>
                <p className="text-lg font-semibold">{brl(g.total)}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Previsão</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {g.ordens.map((o) => (
                      <TableRow
                        key={o.id}
                        className="cursor-pointer"
                        onClick={() => setDetalheId(o.id)}
                      >
                        <TableCell className="font-mono text-xs">{o.numero ?? "—"}</TableCell>
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
                              setDetalheId(o.id);
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
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
            </CardContent>
          </Card>
        ))
      )}

      <Dialog
        open={!!detalheId}
        onOpenChange={(v) => {
          if (!v) {
            setDetalheId(null);
            setModoEdicao(false);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl print:max-h-none print:overflow-visible">
          {ordemDetalhe && !modoEdicao && (
            <div className="space-y-6">
              <DialogHeader className="print:hidden">
                <DialogTitle>Ordem de compra {ordemDetalhe.numero}</DialogTitle>
                <DialogDescription>
                  Detalhe completo da ordem, itens e tributos.
                </DialogDescription>
              </DialogHeader>

              <div className="hidden print:block">
                <img src={logoSplash.url} alt="Splash Jardim do Trevo" className="mb-2 h-24 w-auto" />
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
                    <TableHead>Cliente</TableHead>
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
                      <TableCell>{i.cliente_nome ?? "Estoque"}</TableCell>
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

              <div className="grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-3 print:hidden">
                <div className="sm:col-span-3">
                  <p className="text-sm font-medium">Pagamento (meia nota)</p>
                  <p className="text-xs text-muted-foreground">
                    Informe quanto o fornecedor faturou na nota e quanto foi realmente pago. A
                    diferença fica registrada como pagamento fora da nota.
                  </p>
                </div>
                <Field label="Valor faturado na nota (R$)">
                  <Input
                    type="number"
                    step="0.01"
                    defaultValue={Number(ordemDetalhe.valor_nota ?? 0)}
                    onBlur={(e) =>
                      atualizarIcms.mutate({
                        id: ordemDetalhe.id,
                        valor_nota: Number(e.target.value) || 0,
                      })
                    }
                  />
                </Field>
                <Field label="Valor pago ao fornecedor (R$)">
                  <Input
                    type="number"
                    step="0.01"
                    defaultValue={Number(ordemDetalhe.valor_pago ?? 0)}
                    onBlur={(e) =>
                      atualizarIcms.mutate({
                        id: ordemDetalhe.id,
                        valor_pago: Number(e.target.value) || 0,
                      })
                    }
                  />
                </Field>
                <div>
                  <p className="text-xs text-muted-foreground">Diferença fora da nota</p>
                  <p className="font-medium">
                    {brl(
                      Number(ordemDetalhe.valor_pago ?? 0) - Number(ordemDetalhe.valor_nota ?? 0),
                    )}
                  </p>
                </div>
                <Field label="Observação do pagamento" className="sm:col-span-3">
                  <Input
                    defaultValue={ordemDetalhe.obs_pagamento ?? ""}
                    placeholder="Ex.: R$ 2.000 na nota e R$ 1.500 pagos em Pix"
                    onBlur={(e) =>
                      atualizarIcms.mutate({
                        id: ordemDetalhe.id,
                        obs_pagamento: e.target.value || null,
                      })
                    }
                  />
                </Field>
              </div>

              <div className="flex flex-wrap justify-end gap-2 print:hidden">
                <DocumentoOrdemCompra
                  ordem={ordemDetalhe}
                  fornecedor={
                    fornecedorDetalhe
                      ? {
                          nome: fornecedorDetalhe.nome,
                          email: fornecedorDetalhe.email,
                          telefone: fornecedorDetalhe.telefone,
                          documento: fornecedorDetalhe.cnpj,
                        }
                      : { nome: ordemDetalhe.fornecedor_nome }
                  }
                  itens={itensDetalhe}
                />
                <Button onClick={iniciarEdicao}>
                  <Pencil className="size-4" /> Editar
                </Button>
              </div>
            </div>
          )}

          {ordemDetalhe && modoEdicao && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>Editar ordem {ordemDetalhe.numero}</DialogTitle>
                <DialogDescription>
                  Altere fornecedor, status, dados gerais e itens da ordem.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Fornecedor *">
                  <Select
                    value={formEdicao.fornecedor_id}
                    onValueChange={(v) => setFormEdicao((f) => ({ ...f, fornecedor_id: v }))}
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
                <Field label="Status">
                  <Select
                    value={formEdicao.status}
                    onValueChange={(v) => setFormEdicao((f) => ({ ...f, status: v }))}
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
                </Field>
                <Field label="Previsão de entrega">
                  <Input
                    type="date"
                    value={formEdicao.previsao_entrega}
                    onChange={(e) =>
                      setFormEdicao((f) => ({ ...f, previsao_entrega: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Condições">
                  <Input
                    value={formEdicao.condicoes}
                    onChange={(e) => setFormEdicao((f) => ({ ...f, condicoes: e.target.value }))}
                    placeholder="30/60 dias, boleto..."
                  />
                </Field>
                <Field label="Observações" className="sm:col-span-2">
                  <Textarea
                    value={formEdicao.observacoes}
                    onChange={(e) =>
                      setFormEdicao((f) => ({ ...f, observacoes: e.target.value }))
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
                  <Select
                    value={novoItem.cliente_id}
                    onValueChange={(v) => setNovoItem((i) => ({ ...i, cliente_id: v }))}
                  >
                    <SelectTrigger className="sm:col-span-2">
                      <SelectValue placeholder="Cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SEM_CLIENTE}>Estoque (sem cliente)</SelectItem>
                      {clientes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome}
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
                <Button type="button" variant="outline" size="sm" onClick={adicionarItemEdicao}>
                  <Plus className="size-4" /> Adicionar item
                </Button>

                {formEdicao.itens.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">Vlr Unit</TableHead>
                        <TableHead className="text-right">Desc</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formEdicao.itens.map((i, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{i.descricao}</TableCell>
                          <TableCell>
                            <Select
                              value={i.cliente_id ?? SEM_CLIENTE}
                              onValueChange={(v) => alterarClienteItemEdicao(idx, v)}
                            >
                              <SelectTrigger className="w-44">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={SEM_CLIENTE}>Estoque (sem cliente)</SelectItem>
                                {clientes.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min={0}
                              className="w-20 text-right"
                              value={i.quantidade}
                              onChange={(e) =>
                                alterarItemEdicao(idx, "quantidade", e.target.value)
                              }
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              className="w-28 text-right"
                              value={i.valor_unitario}
                              onChange={(e) =>
                                alterarItemEdicao(idx, "valor_unitario", e.target.value)
                              }
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              className="w-24 text-right"
                              value={i.desconto}
                              onChange={(e) =>
                                alterarItemEdicao(idx, "desconto", e.target.value)
                              }
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {brl(i.quantidade * i.valor_unitario - i.desconto)}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removerItemEdicao(idx)}
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

              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total estimado</p>
                <p className="text-xl font-semibold">
                  {brl(
                    formEdicao.itens.reduce(
                      (s, i) => s + (i.quantidade * i.valor_unitario - i.desconto),
                      0,
                    ),
                  )}
                </p>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setModoEdicao(false)}
                  disabled={atualizarOrdem.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => atualizarOrdem.mutate()}
                  disabled={atualizarOrdem.isPending}
                >
                  Salvar alterações
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
