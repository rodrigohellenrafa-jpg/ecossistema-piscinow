import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ClienteRapidoDialog } from "@/components/cliente-rapido-dialog";
import { ProdutoRapidoDialog } from "@/components/produto-rapido-dialog";
import { Field } from "@/components/field";
import { PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { brl, FORMAS_PAGAMENTO, hojeISO, margem, num, pct, proximoCodigo } from "@/lib/erp";
import { provisionarFinanceiro, rotearEstoque } from "@/lib/venda-automacao";

export const Route = createFileRoute("/vendas/novo")({
  head: () => ({
    meta: [
      { title: "Novo Pedido (PDV) | Piscinow ERP" },
      {
        name: "description",
        content:
          "Ponto de venda Piscinow: monte itens, composição de kit de piscina e condições comerciais em um pedido único.",
      },
      { property: "og:title", content: "Novo Pedido (PDV) | Piscinow ERP" },
      {
        property: "og:description",
        content: "Feche pedidos de piscinas com cálculo automático de totais, margem e parcelas.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <NovoPedido />
    </RequireAuth>
  ),
});

interface ItemLinha {
  key: string;
  produto_id: string | null;
  sku: string;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  desconto_perc: number;
  custo_unitario: number;
  sob_encomenda: boolean;
  estoque_atual: number;
}

interface AcessorioLinha {
  key: string;
  produto_id: string;
  nome: string;
  valor: number;
}

const novaKey = () => Math.random().toString(36).slice(2);

const totalItem = (i: ItemLinha) =>
  i.quantidade * i.preco_unitario * (1 - i.desconto_perc / 100);

function NovoPedido() {
  const navigate = useNavigate();

  const { data: clientes = [], refetch: refetchClientes } = useQuery({
    queryKey: ["clientes-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nome, documento, logradouro, numero, bairro, cidade, estado, cep, endereco_obra")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const { data: funcionarios = [] } = useQuery({
    queryKey: ["funcionarios-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funcionarios")
        .select("id, nome")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const { data: produtos = [], refetch: refetchProdutos } = useQuery({
    queryKey: ["produtos-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select(
          "id, codigo, nome, categoria, unidade, preco_venda, preco_custo, estoque_atual, sob_encomenda",
        )
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const { data: numerosExistentes = [] } = useQuery({
    queryKey: ["vendas-numeros"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendas").select("numero");
      if (error) throw error;
      return data.map((v) => v.numero);
    },
  });

  const numero = useMemo(() => proximoCodigo("VEN", numerosExistentes), [numerosExistentes]);

  const [data, setData] = useState(hojeISO());
  const [tipoAtendimento, setTipoAtendimento] = useState<"in" | "out">("in");
  const [clienteId, setClienteId] = useState("");
  const [vendedorId, setVendedorId] = useState("");
  const [observacoes, setObservacoes] = useState("");


  const [itens, setItens] = useState<ItemLinha[]>([]);
  const [produtoSel, setProdutoSel] = useState("");

  const [cascoId, setCascoId] = useState("");
  const [filtroId, setFiltroId] = useState("");
  const [acessorios, setAcessorios] = useState<AcessorioLinha[]>([]);
  const [custoFrete, setCustoFrete] = useState(0);
  const [custoMaoObra, setCustoMaoObra] = useState(0);
  const [impostosKit, setImpostosKit] = useState(0);
  const [precoVendaKit, setPrecoVendaKit] = useState(0);

  const [formaPagamento, setFormaPagamento] = useState<string>(FORMAS_PAGAMENTO[0]);
  const [valorEntrada, setValorEntrada] = useState(0);
  const [parcelasQtd, setParcelasQtd] = useState(1);

  const subtotalProdutos = useMemo(
    () => itens.reduce((s, i) => s + totalItem(i), 0),
    [itens],
  );
  const custoTotalItens = useMemo(
    () => itens.reduce((s, i) => s + i.quantidade * i.custo_unitario, 0),
    [itens],
  );

  const casco = produtos.find((p) => p.id === cascoId);
  const filtro = produtos.find((p) => p.id === filtroId);
  const custoKitBase = num(casco?.preco_custo) + num(filtro?.preco_custo);
  const custoAcessorios = acessorios.reduce((s, a) => s + a.valor, 0);
  const custoTotalKit = custoKitBase + custoAcessorios + custoFrete + custoMaoObra + impostosKit;
  const margemKit = margem(precoVendaKit, custoTotalKit);
  const corMargem = margemKit >= 0.25 ? "text-success" : margemKit < 0.1 ? "text-destructive" : "text-warning";

  const custoTotalGeral = custoTotalItens + custoTotalKit;
  const valorTotal = subtotalProdutos + precoVendaKit;
  const saldoDevedor = Math.max(valorTotal - valorEntrada, 0);
  const valorParcela = parcelasQtd > 0 ? saldoDevedor / parcelasQtd : 0;

  const adicionarItem = () => {
    const p = produtos.find((x) => x.id === produtoSel);
    if (!p) return toast.error("Selecione um produto");
    setItens((prev) => [
      ...prev,
      {
        key: novaKey(),
        produto_id: p.id,
        sku: p.codigo ?? "",
        descricao: p.nome,
        quantidade: 1,
        preco_unitario: num(p.preco_venda),
        desconto_perc: 0,
        custo_unitario: num(p.preco_custo),
        sob_encomenda: Boolean((p as { sob_encomenda?: boolean }).sob_encomenda),
        estoque_atual: num(p.estoque_atual),
      },
    ]);
    setProdutoSel("");
  };

  const atualizarItem = (key: string, patch: Partial<ItemLinha>) =>
    setItens((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));

  const removerItem = (key: string) => setItens((prev) => prev.filter((i) => i.key !== key));

  const adicionarAcessorio = () => {
    if (acessorios.length >= 10) return toast.error("Máximo de 10 acessórios");
    setAcessorios((prev) => [...prev, { key: novaKey(), produto_id: "", nome: "", valor: 0 }]);
  };

  const atualizarAcessorio = (key: string, patch: Partial<AcessorioLinha>) =>
    setAcessorios((prev) => prev.map((a) => (a.key === key ? { ...a, ...patch } : a)));

  const removerAcessorio = (key: string) => setAcessorios((prev) => prev.filter((a) => a.key !== key));

  const salvar = useMutation({
    mutationFn: async () => {
      if (!clienteId) throw new Error("Selecione o cliente.");
      if (itens.length === 0 && !cascoId) throw new Error("Adicione ao menos um item ou monte o kit.");

      const cliente = clientes.find((c) => c.id === clienteId);
      const vendedor = funcionarios.find((f) => f.id === vendedorId);
      const userId = (await supabase.auth.getUser()).data.user?.id ?? null;

      const { data: venda, error: erroVenda } = await supabase
        .from("vendas")
        .insert({
          numero,
          data,
          cliente_id: clienteId,
          cliente_nome: cliente?.nome ?? null,
          vendedor: vendedor?.nome ?? null,
          vendedor_id: vendedorId || null,
          forma_pagamento: formaPagamento,
          status_pagamento: "pendente",
          status_pedido: "orcamento",
          tipo_atendimento: tipoAtendimento,

          observacoes: observacoes || null,
          valor_total: valorTotal,
          subtotal_produtos: subtotalProdutos,
          valor_frete: custoFrete,
          valor_mao_obra: custoMaoObra,
          valor_impostos: impostosKit,
          custo_total: custoTotalGeral,
          valor_entrada: valorEntrada,
          saldo_devedor: saldoDevedor,
          parcelas: parcelasQtd,
          valor_parcela: valorParcela,
          created_by: userId,
        })
        .select("id")
        .single();
      if (erroVenda) throw erroVenda;

      if (itens.length > 0) {
        const { error } = await supabase.from("venda_itens").insert(
          itens.map((i) => ({
            venda_id: venda.id,
            produto_id: i.produto_id,
            sku: i.sku || null,
            descricao: i.descricao,
            quantidade: i.quantidade,
            preco_unitario: i.preco_unitario,
            desconto_perc: i.desconto_perc,
            total: totalItem(i),
            custo_unitario: i.custo_unitario,
          })),
        );
        if (error) throw error;
      }

      if (cascoId || filtroId || acessorios.length > 0) {
        const { error } = await supabase.from("venda_kit").insert({
          venda_id: venda.id,
          casco_id: cascoId || null,
          filtro_id: filtroId || null,
          acessorios: acessorios.map((a) => ({ produto_id: a.produto_id, nome: a.nome, valor: a.valor })),
          custo_frete: custoFrete,
          custo_mao_obra: custoMaoObra,
          impostos: impostosKit,
          custo_total_kit: custoTotalKit,
          preco_venda_kit: precoVendaKit,
        });
        if (error) throw error;
      }

      const ctx = {
        numero,
        data,
        clienteId,
        clienteNome: cliente?.nome ?? null,
        userId,
      };

      // 1) Financeiro: parcelas provisionadas em contas a receber.
      await provisionarFinanceiro(ctx, {
        valorEntrada: 0,
        saldoDevedor,
        parcelas: parcelasQtd,
        valorParcela,
      });

      // 1b) Entrada paga na hora vira uma transação de pagamento da venda,
      // que recalcula sozinha o saldo/status e entra no fluxo de caixa.
      if (valorEntrada > 0) {
        const { error: erroPag } = await supabase.from("venda_pagamentos").insert({
          venda_id: venda.id,
          data_pagamento: data,
          forma_pagamento: formaPagamento || "Dinheiro",
          valor: valorEntrada,
          observacoes: "Entrada no fechamento do pedido",
          created_by: userId,
        } as never);
        if (erroPag) throw erroPag;
      }

      // 2) Estoque: baixa o que tem saldo, encomenda automaticamente o que falta.
      const roteamento = await rotearEstoque(
        ctx,
        itens.map((i) => ({
          produto_id: i.produto_id,
          sku: i.sku,
          descricao: i.descricao,
          quantidade: i.quantidade,
          preco_unitario: i.preco_unitario,
          custo_unitario: i.custo_unitario,
        })),
      );

      // 3) Serviço externo (OUT): abre a ordem de serviço do pedido.
      if (tipoAtendimento === "out") {
        const { error } = await supabase.from("ordens_servico").insert({
          numero: `OS-${numero}`,
          venda_id: venda.id,
          cliente_id: clienteId,
          cliente_nome: cliente?.nome ?? null,
          tipo_servico: cascoId ? "Instalação de piscina" : "Serviço externo",
          descricao: `Serviço externo referente ao pedido ${numero}.`,
          responsavel: vendedor?.nome ?? null,
          status: "orcamento",
          prioridade: "media",
          valor: custoMaoObra,
          created_by: userId,
        });
        if (error) throw error;
      }

      return { id: venda.id as string, roteamento };
    },
    onSuccess: ({ id, roteamento }) => {
      toast.success(
        tipoAtendimento === "in"
          ? "Pedido de balcão registrado e financeiro lançado!"
          : "Pedido registrado, ordem de serviço aberta e financeiro lançado!",
      );
      if (roteamento.baixados > 0) {
        toast.success(`Estoque baixado em ${roteamento.baixados} item(ns).`);
      }
      if (roteamento.ordensCriadas.length > 0) {
        toast.warning(
          `Itens sem saldo: ordem(ns) de compra ${roteamento.ordensCriadas.join(", ")} gerada(s) sob encomenda.`,
        );
      }
      navigate({ to: "/vendas/$id", params: { id } });
    },

    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Novo Pedido (PDV)" subtitle={`Pedido ${numero}`} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Identificação</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <Field label="Tipo de atendimento" className="sm:col-span-3">
                <Select
                  value={tipoAtendimento}
                  onValueChange={(v) => setTipoAtendimento(v as "in" | "out")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">
                      IN — Balcão (produtos, baixa direta do estoque)
                    </SelectItem>
                    <SelectItem value="out">
                      OUT — Venda + serviço externo (gera ordem de serviço)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-muted-foreground">
                  {tipoAtendimento === "in"
                    ? "Ao salvar, os itens saem do estoque na hora e nenhuma obra é criada."
                    : "Ao salvar, uma ordem de serviço é aberta para a instalação/obra deste pedido."}
                </p>
              </Field>

              <Field label="Nº do pedido">
                <Input value={numero} disabled />
              </Field>
              <Field label="Data">
                <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
              </Field>
              <Field label="Vendedor">
                <Select value={vendedorId} onValueChange={setVendedorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {funcionarios.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Cliente" className="sm:col-span-3">
                <div className="mb-2 flex justify-end">
                  <ClienteRapidoDialog
                    onCreated={async (id) => {
                      await refetchClientes();
                      setClienteId(id);
                    }}
                  />
                </div>
                <Select value={clienteId} onValueChange={setClienteId}>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Itens do pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-end gap-2">
                <Field label="Produto" className="min-w-64 flex-1">
                  <Select value={produtoSel} onValueChange={setProdutoSel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Buscar produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.codigo ? `${p.codigo} - ${p.nome}` : p.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Button onClick={adicionarItem}>
                  <Plus /> Adicionar
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-20">Qtd</TableHead>
                    <TableHead className="w-28">Vlr. Unit.</TableHead>
                    <TableHead className="w-20">Desc. %</TableHead>
                    <TableHead className="w-28 text-right">Subtotal</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itens.map((i) => (
                    <TableRow key={i.key}>
                      <TableCell className="text-xs text-muted-foreground">{i.sku || "—"}</TableCell>
                      <TableCell>{i.descricao}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          value={i.quantidade}
                          onChange={(e) => atualizarItem(i.key, { quantidade: num(e.target.value) || 1 })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={i.preco_unitario}
                          onChange={(e) => atualizarItem(i.key, { preco_unitario: num(e.target.value) })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.1"
                          value={i.desconto_perc}
                          onChange={(e) => atualizarItem(i.key, { desconto_perc: num(e.target.value) })}
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">{brl(totalItem(i))}</TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => removerItem(i.key)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {itens.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        Nenhum item adicionado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex justify-end text-sm">
                <p>
                  Subtotal de produtos:{" "}
                  <span className="font-semibold">{brl(subtotalProdutos)}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {tipoAtendimento === "out" && (
          <Card>
            <CardHeader>
              <CardTitle>Composição da Piscina (Multipartido)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Modelo do casco">
                  <Select value={cascoId} onValueChange={setCascoId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos
                        .filter((p) => p.categoria === "Piscinas")
                        .map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Filtro">
                  <Select value={filtroId} onValueChange={setFiltroId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o filtro" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos
                        .filter((p) => p.categoria === "Filtros")
                        .map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Acessórios (até 10)</Label>
                  <Button size="sm" variant="outline" onClick={adicionarAcessorio}>
                    <Plus className="size-3.5" /> Acessório
                  </Button>
                </div>
                {acessorios.map((a) => (
                  <div key={a.key} className="flex items-end gap-2">
                    <Field label="Produto" className="flex-1">
                      <Select
                        value={a.produto_id}
                        onValueChange={(v) => {
                          const p = produtos.find((x) => x.id === v);
                          atualizarAcessorio(a.key, {
                            produto_id: v,
                            nome: p?.nome ?? "",
                            valor: num(p?.preco_venda),
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {produtos.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Valor" className="w-32">
                      <Input
                        type="number"
                        step="0.01"
                        value={a.valor}
                        onChange={(e) => atualizarAcessorio(a.key, { valor: num(e.target.value) })}
                      />
                    </Field>
                    <Button size="icon" variant="ghost" onClick={() => removerAcessorio(a.key)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <Field label="Custo de frete">
                  <Input
                    type="number"
                    step="0.01"
                    value={custoFrete}
                    onChange={(e) => setCustoFrete(num(e.target.value))}
                  />
                </Field>
                <Field label="Custo de mão de obra">
                  <Input
                    type="number"
                    step="0.01"
                    value={custoMaoObra}
                    onChange={(e) => setCustoMaoObra(num(e.target.value))}
                  />
                </Field>
                <Field label="Impostos">
                  <Input
                    type="number"
                    step="0.01"
                    value={impostosKit}
                    onChange={(e) => setImpostosKit(num(e.target.value))}
                  />
                </Field>
                <Field label="Preço de venda do kit">
                  <Input
                    type="number"
                    step="0.01"
                    value={precoVendaKit}
                    onChange={(e) => setPrecoVendaKit(num(e.target.value))}
                  />
                </Field>
              </div>
            </CardContent>
          </Card>
          )}


          <Card>
            <CardHeader>
              <CardTitle>Condições comerciais</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-4">
              <Field label="Forma de pagamento">
                <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMAS_PAGAMENTO.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Valor de entrada">
                <Input
                  type="number"
                  step="0.01"
                  value={valorEntrada}
                  onChange={(e) => setValorEntrada(num(e.target.value))}
                />
              </Field>
              <Field label="Saldo devedor">
                <Input value={brl(saldoDevedor)} disabled />
              </Field>
              <Field label="Qtd. de parcelas">
                <Input
                  type="number"
                  min={1}
                  max={24}
                  value={parcelasQtd}
                  onChange={(e) => setParcelasQtd(Math.min(24, Math.max(1, num(e.target.value) || 1)))}
                />
              </Field>
              <Field label="Valor por parcela">
                <Input value={brl(valorParcela)} disabled />
              </Field>
              <Field label="Observações" className="sm:col-span-4">
                <Textarea
                  rows={3}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
              </Field>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" onClick={() => salvar.mutate()} disabled={salvar.isPending}>
              Salvar pedido
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Resumo do Kit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Custo total do kit</span>
                <span className="font-medium">{brl(custoTotalKit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Preço de venda</span>
                <span className="font-medium">{brl(precoVendaKit)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">Margem bruta</span>
                <span className={`text-lg font-semibold ${corMargem}`}>{pct(margemKit)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Totais do pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Produtos</span>
                <span>{brl(subtotalProdutos)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kit piscina</span>
                <span>{brl(precoVendaKit)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{brl(valorTotal)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
