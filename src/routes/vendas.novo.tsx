import { useEffect, useMemo, useState } from "react";
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
import { useAuth } from "@/hooks/use-auth";
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
  desconto_valor: number;
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

const subtotalBrutoItem = (i: ItemLinha) => i.quantidade * i.preco_unitario;

const totalItem = (i: ItemLinha) =>
  Math.max(0, subtotalBrutoItem(i) - i.desconto_valor);

/** Converte texto digitado como moeda brasileira (R$ 1.500,00 ou 1500,00) em número. */
const parseMoedaInput = (valor: string): number => {
  const limpo = valor
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".");
  const n = Number(limpo);
  return Number.isFinite(n) && n >= 0 ? n : 0;
  };

/** Formata número no padrão brasileiro sem o símbolo (1500,00). */
const formatMoedaInput = (n: number) =>
  n ? n.toFixed(2).replace(".", ",") : "";

/** Campo monetário que aceita vírgula/ponto e formata ao sair do campo. */
function MoedaInput({
  value,
  onChange,
  className = "",
}: {
  value: number;
  onChange: (n: number) => void;
  className?: string;
}) {
  const [texto, setTexto] = useState(formatMoedaInput(value));

  useEffect(() => {
    if (Math.abs(parseMoedaInput(texto) - value) > 0.005) {
      setTexto(formatMoedaInput(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Input
      type="text"
      inputMode="decimal"
      placeholder="0,00"
      className={`text-white ${className}`}
      value={texto}
      onChange={(e) => {
        setTexto(e.target.value);
        onChange(parseMoedaInput(e.target.value));
      }}
      onBlur={() => {
        const n = parseMoedaInput(texto);
        setTexto(formatMoedaInput(n));
        onChange(n);
      }}
    />
  );
}

const RASCUNHO_KEY = "piscinow:pdv-rascunho";

/** Uma forma de pagamento aplicada ao pedido (pode haver várias no mesmo pedido). */
interface CondicaoLinha {
  key: string;
  forma_pagamento: string;
  /** Valor que essa condição abate do total do pedido. */
  valor: number;
  parcelas: number;
  /** Valor de cada parcela cobrada do cliente (já com juros da maquininha). */
  valor_parcela: number;
  data_prevista: string;
  pago: boolean;
  bandeira: string;
  observacoes: string;
}

/** Total que o cliente desembolsa nessa condição (parcelas x valor da parcela). */
const cobradoCondicao = (c: CondicaoLinha) =>
  Math.max(1, c.parcelas) * c.valor_parcela;

/** Pagamentos no cartão são repassados pela operadora em um único crédito. */
const ehCartao = (forma: string) => /cart[ãa]o/i.test(forma ?? "");

/** Juros/acréscimo embutido: diferença entre o cobrado e o valor abatido. */
const acrescimoCondicao = (c: CondicaoLinha) =>
  Math.max(0, cobradoCondicao(c) - c.valor);

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

  const { user } = useAuth();

  const { data: vendedores = [] } = useQuery({
    queryKey: ["vendedores-select", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("usuarios_importados")
        .select("id, nome, email")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      const lista = (data ?? []) as { id: string; nome: string | null; email: string | null }[];

      // Garante que o usuário logado sempre apareça como vendedor,
      // mesmo que ainda não conste na lista de usuários importados.
      if (user?.id && user.email) {
        const existe =
          lista.some((v) => v.id === user.id) ||
          lista.some((v) => v.email?.toLowerCase() === user.email!.toLowerCase());
        if (!existe) {
          lista.push({
            id: user.id,
            nome: (user.user_metadata?.nome as string | undefined) ?? user.email.split("@")[0],
            email: user.email,
          });
          lista.sort((a, b) => (a.nome ?? "").localeCompare(b.nome ?? ""));
        }
      }
      return lista;
    },
    enabled: !!user,
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

  // Pré-seleciona o usuário logado como vendedor do pedido (por id ou e-mail).
  useEffect(() => {
    if (vendedorId || !user?.id) return;
    const atual =
      vendedores.find((v) => v.id === user.id) ??
      vendedores.find((v) => v.email?.toLowerCase() === user.email?.toLowerCase());
    if (atual) setVendedorId(atual.id);
  }, [user, vendedores, vendedorId]);
  const [observacoes, setObservacoes] = useState("");


  const [itens, setItens] = useState<ItemLinha[]>([]);
  const [descontoInputs, setDescontoInputs] = useState<Record<string, string>>({});
  const [produtoSel, setProdutoSel] = useState("");

  const [cascoId, setCascoId] = useState("");
  const [filtroId, setFiltroId] = useState("");
  const [acessorios, setAcessorios] = useState<AcessorioLinha[]>([]);
  const [custoFrete, setCustoFrete] = useState(0);
  const [custoMaoObra, setCustoMaoObra] = useState(0);
  const [impostosKit, setImpostosKit] = useState(0);
  const [precoVendaKit, setPrecoVendaKit] = useState(0);

  const [condicoes, setCondicoes] = useState<CondicaoLinha[]>([]);

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

  // Condições de pagamento: cada linha abate um valor do pedido e pode ter
  // parcelas com juros da maquininha (o cliente paga mais do que abate).
  const totalAplicado = condicoes.reduce((s, c) => s + c.valor, 0);
  const totalCobradoCliente = condicoes.reduce((s, c) => s + cobradoCondicao(c), 0);
  const totalJuros = Math.max(0, totalCobradoCliente - totalAplicado);
  const faltaAlocar = valorTotal - totalAplicado;
  const valorEntrada = condicoes.filter((c) => c.pago).reduce((s, c) => s + c.valor, 0);
  const saldoDevedor = Math.max(valorTotal - valorEntrada, 0);
  const pendentes = condicoes.filter((c) => !c.pago);
  const parcelasQtd = Math.max(1, pendentes.reduce((s, c) => s + Math.max(1, c.parcelas), 0));
  const valorParcela = pendentes.length > 0 ? pendentes[0].valor_parcela : saldoDevedor;
  const formaPagamento =
    condicoes.length > 0
      ? Array.from(new Set(condicoes.map((c) => c.forma_pagamento))).join(" + ")
      : FORMAS_PAGAMENTO[0];

  const adicionarCondicao = () => {
    const restante = Math.max(0, Number((valorTotal - totalAplicado).toFixed(2)));
    setCondicoes((prev) => [
      ...prev,
      {
        key: novaKey(),
        forma_pagamento: FORMAS_PAGAMENTO[0],
        valor: restante,
        parcelas: 1,
        valor_parcela: restante,
        data_prevista: data,
        pago: false,
        bandeira: "",
        observacoes: "",
      },
    ]);
  };

  const atualizarCondicao = (key: string, patch: Partial<CondicaoLinha>) =>
    setCondicoes((prev) => prev.map((c) => (c.key === key ? { ...c, ...patch } : c)));

  const removerCondicao = (key: string) =>
    setCondicoes((prev) => prev.filter((c) => c.key !== key));

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
        desconto_valor: 0,
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
      const vendedor =
        vendedores.find((v) => v.id === vendedorId) ??
        vendedores.find((v) => v.id === user?.id) ??
        (user?.email
          ? {
              id: user.id,
              nome: (user.user_metadata?.nome as string | undefined) ?? user.email.split("@")[0],
              email: user.email,
            }
          : undefined);
      const userId = user?.id ?? (await supabase.auth.getUser()).data.user?.id ?? null;

      const { data: venda, error: erroVenda } = await supabase
        .from("vendas")
        .insert({
          numero,
          data,
          cliente_id: clienteId,
          cliente_nome: cliente?.nome ?? null,
          vendedor: vendedor?.nome ?? null,
          // O vendedor vem dos usuários do sistema (auth), não do cadastro de funcionários.
          vendedor_id: null,
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
          itens.map((i) => {
            const bruto = subtotalBrutoItem(i);
            return {
              venda_id: venda.id,
              produto_id: i.produto_id,
              sku: i.sku || null,
              descricao: i.descricao,
              quantidade: i.quantidade,
              preco_unitario: i.preco_unitario,
              desconto_valor: i.desconto_valor,
              desconto_perc: bruto > 0 ? Number(((i.desconto_valor / bruto) * 100).toFixed(2)) : 0,
              total: totalItem(i),
              custo_unitario: i.custo_unitario,
            };
          }),
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

      // 1) Condições de pagamento do pedido (uma linha por forma usada).
      if (condicoes.length > 0) {
        const { error: erroCond } = await supabase.from("venda_condicoes").insert(
          condicoes.map((c, idx) => ({
            venda_id: venda.id,
            ordem: idx + 1,
            forma_pagamento: c.forma_pagamento,
            valor: c.valor,
            parcelas: Math.max(1, c.parcelas),
            acrescimo: acrescimoCondicao(c),
            valor_cobrado: cobradoCondicao(c),
            valor_parcela: c.valor_parcela,
            data_prevista: c.data_prevista || data,
            pago: c.pago,
            bandeira: c.bandeira || null,
            observacoes: c.observacoes || null,
            created_by: userId,
          })) as never,
        );
        if (erroCond) throw erroCond;
      }

      // 1b) Contas a Receber recebe SEMPRE o valor do pedido (sem juros).
      // Cartão: a operadora repassa em um crédito só, então gera um título único.
      for (const c of condicoes.filter((x) => !x.pago && x.valor > 0)) {
        const cartao = ehCartao(c.forma_pagamento);
        const parcelas = cartao ? 1 : Math.max(1, c.parcelas);
        await provisionarFinanceiro(
          { ...ctx, data: c.data_prevista || data },
          {
            valorEntrada: 0,
            saldoDevedor: c.valor,
            parcelas,
            valorParcela: Number((c.valor / parcelas).toFixed(2)),
          },
        );
      }

      // 1b-2) Os juros/acréscimo da maquininha viram receita financeira
      // vinculada ao pedido (não inflam a receita de vendas no DRE).
      const comJuros = condicoes.filter((c) => acrescimoCondicao(c) > 0);
      if (comJuros.length > 0) {
        const { error: erroJuros } = await supabase.from("lancamentos_financeiros").insert(
          comJuros.map((c) => ({
            tipo_fluxo: "receita",
            categoria: "Juros de cartão",
            descricao: `Juros ${c.forma_pagamento} - Pedido ${numero}${
              cliente?.nome ? ` - ${cliente.nome}` : ""
            }`,
            valor: acrescimoCondicao(c),
            data_competencia: c.data_prevista || data,
            vencimento: c.data_prevista || data,
            data_pagamento: c.pago ? c.data_prevista || data : null,
            venda_id: venda.id,
            forma_pagamento: c.forma_pagamento || null,
            conta_bancaria: c.bandeira || null,
            status: c.pago ? "pago" : "pendente",
            conciliado: false,
            observacoes: `${Math.max(1, c.parcelas)}x de ${brl(c.valor_parcela)} - cobrado ${brl(
              cobradoCondicao(c),
            )} sobre ${brl(c.valor)}`,
            created_by: userId,
          })) as never,
        );
        if (erroJuros) throw erroJuros;
      }


      // 1c) Condições já pagas viram transações da venda: recalculam saldo,
      // status do pedido e entram no fluxo de caixa.
      const pagas = condicoes.filter((c) => c.pago && c.valor > 0);
      if (pagas.length > 0) {
        const { error: erroPag } = await supabase.from("venda_pagamentos").insert(
          pagas.map((c) => ({
            venda_id: venda.id,
            data_pagamento: c.data_prevista || data,
            forma_pagamento: c.forma_pagamento || "Dinheiro",
            valor: c.valor,
            conta_bancaria: c.bandeira || null,
            observacoes:
              c.parcelas > 1
                ? `${c.parcelas}x de ${brl(c.valor_parcela)} (cobrado ${brl(cobradoCondicao(c))})`
                : c.observacoes || "Pagamento no fechamento do pedido",
            created_by: userId,
          })) as never,
        );
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
                    {vendedores.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Cliente" className="sm:col-span-3">
                <div className="flex items-center gap-2">
                  <Select value={clienteId} onValueChange={setClienteId}>
                    <SelectTrigger className="flex-1">
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
                  <ClienteRapidoDialog
                    iconOnly
                    onCreated={async (id) => {
                      await refetchClientes();
                      setClienteId(id);
                    }}
                  />
                </div>
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
                  <div className="flex items-center gap-2">
                    <Select value={produtoSel} onValueChange={setProdutoSel}>
                      <SelectTrigger className="flex-1">
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
                    <ProdutoRapidoDialog
                      iconOnly
                      onCreated={async (id) => {
                        await refetchProdutos();
                        setProdutoSel(id);
                      }}
                    />
                  </div>
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
                    <TableHead className="w-28">Desc. (R$)</TableHead>
                    <TableHead className="w-32 text-right">Total</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itens.map((i) => (
                    <TableRow key={i.key}>
                      <TableCell className="text-xs text-muted-foreground">{i.sku || "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{i.descricao}</span>
                          {i.sob_encomenda ? (
                            <span className="rounded-full border border-sky-500/30 bg-sky-500/15 px-2 py-0.5 text-[11px] font-medium text-sky-500">
                              Sob encomenda
                            </span>
                          ) : (
                            i.estoque_atual < i.quantidade && (
                              <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-500">
                                Sem saldo · será encomendado
                              </span>
                            )
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          className="text-white"
                          value={i.quantidade}
                          onChange={(e) => atualizarItem(i.key, { quantidade: num(e.target.value) || 1 })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          className="text-white"
                          value={i.preco_unitario}
                          onChange={(e) => atualizarItem(i.key, { preco_unitario: num(e.target.value) })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          inputMode="decimal"
                          placeholder="0,00"
                          className="w-28 text-white"
                          value={descontoInputs[i.key] ?? (i.desconto_valor ? i.desconto_valor.toString() : "")}
                          onChange={(e) => {
                            const raw = e.target.value;
                            setDescontoInputs((prev) => ({ ...prev, [i.key]: raw }));
                            const valor = parseMoedaInput(raw);
                            const max = subtotalBrutoItem(i);
                            atualizarItem(i.key, { desconto_valor: Math.min(valor, max) });
                          }}
                          onBlur={(e) => {
                            const valor = parseMoedaInput(e.target.value);
                            const max = subtotalBrutoItem(i);
                            const ajustado = Math.min(valor, max);
                            setDescontoInputs((prev) => ({ ...prev, [i.key]: ajustado ? ajustado.toFixed(2) : "" }));
                            atualizarItem(i.key, { desconto_valor: ajustado });
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium">{brl(totalItem(i))}</div>
                        {i.desconto_valor > 0 && (
                          <div className="text-xs text-destructive">
                            -{brl(i.desconto_valor)} desc.
                          </div>
                        )}
                      </TableCell>
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
                      <MoedaInput
                        value={a.valor}
                        onChange={(v) => atualizarAcessorio(a.key, { valor: v })}
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
                  <MoedaInput value={custoFrete} onChange={setCustoFrete} />
                </Field>
                <Field label="Custo de mão de obra">
                  <MoedaInput value={custoMaoObra} onChange={setCustoMaoObra} />
                </Field>
                <Field label="Impostos">
                  <MoedaInput value={impostosKit} onChange={setImpostosKit} />
                </Field>
                <Field label="Preço de venda do kit">
                  <MoedaInput value={precoVendaKit} onChange={setPrecoVendaKit} />
                </Field>
              </div>
            </CardContent>
          </Card>
          )}


          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Condições de pagamento</CardTitle>
              <Button variant="outline" size="sm" onClick={adicionarCondicao}>
                <Plus /> Adicionar condição
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {condicoes.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma condição informada. Adicione uma ou mais formas de pagamento — por
                  exemplo 50% no cartão em 24x com juros da maquininha e o restante depois.
                </p>
              )}

              {condicoes.map((c, idx) => (
                <div key={c.key} className="rounded-lg border border-border p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium">Condição {idx + 1}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removerCondicao(c.key)}
                      aria-label="Remover condição"
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Forma de pagamento">
                      <Select
                        value={c.forma_pagamento}
                        onValueChange={(v) => atualizarCondicao(c.key, { forma_pagamento: v })}
                      >
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

                    <Field label="Cartão / conta (opcional)">
                      <Input
                        className="text-white"
                        placeholder="Ex.: Visa maquininha"
                        value={c.bandeira}
                        onChange={(e) => atualizarCondicao(c.key, { bandeira: e.target.value })}
                      />
                    </Field>

                    <Field label="Data">
                      <Input
                        type="date"
                        className="text-white"
                        value={c.data_prevista}
                        onChange={(e) =>
                          atualizarCondicao(c.key, { data_prevista: e.target.value })
                        }
                      />
                    </Field>

                    <Field label="Valor abatido do pedido (R$)">
                      <Input
                        type="text"
                        inputMode="decimal"
                        className="text-white"
                        value={c.valor ? String(c.valor) : ""}
                        placeholder="0,00"
                        onChange={(e) => {
                          const valor = parseMoedaInput(e.target.value);
                          const parcelas = Math.max(1, c.parcelas);
                          // Sem juros informados, a parcela acompanha o valor abatido.
                          const semJuros = Math.abs(cobradoCondicao(c) - c.valor) < 0.01;
                          atualizarCondicao(c.key, {
                            valor,
                            ...(semJuros ? { valor_parcela: valor / parcelas } : {}),
                          });
                        }}
                      />
                      <button
                        type="button"
                        className="mt-1 text-xs text-primary underline"
                        onClick={() => {
                          const metade = Number((valorTotal / 2).toFixed(2));
                          atualizarCondicao(c.key, {
                            valor: metade,
                            valor_parcela: metade / Math.max(1, c.parcelas),
                          });
                        }}
                      >
                        usar 50% do pedido
                      </button>
                    </Field>

                    <Field label="Parcelas">
                      <Input
                        type="number"
                        min={1}
                        max={48}
                        className="text-white"
                        value={c.parcelas}
                        onChange={(e) => {
                          const parcelas = Math.min(48, Math.max(1, num(e.target.value) || 1));
                          const cobradoAtual = cobradoCondicao(c);
                          atualizarCondicao(c.key, {
                            parcelas,
                            valor_parcela: cobradoAtual / parcelas,
                          });
                        }}
                      />
                    </Field>

                    <Field label="Valor de cada parcela (R$)">
                      <Input
                        type="text"
                        inputMode="decimal"
                        className="text-white"
                        placeholder="0,00"
                        value={c.valor_parcela ? c.valor_parcela.toFixed(2) : ""}
                        onChange={(e) =>
                          atualizarCondicao(c.key, {
                            valor_parcela: parseMoedaInput(e.target.value),
                          })
                        }
                      />
                    </Field>

                    <Field label="Total cobrado do cliente (R$)">
                      <Input
                        type="text"
                        inputMode="decimal"
                        className="text-white"
                        placeholder="0,00"
                        value={cobradoCondicao(c) ? cobradoCondicao(c).toFixed(2) : ""}
                        onChange={(e) => {
                          const cobrado = parseMoedaInput(e.target.value);
                          atualizarCondicao(c.key, {
                            valor_parcela: cobrado / Math.max(1, c.parcelas),
                          });
                        }}
                      />
                    </Field>

                    <Field label="Juros / acréscimo da maquininha">
                      <Input value={brl(acrescimoCondicao(c))} disabled />
                    </Field>

                    <Field label="Situação">
                      <Select
                        value={c.pago ? "pago" : "pendente"}
                        onValueChange={(v) => atualizarCondicao(c.key, { pago: v === "pago" })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pago">Já pago pelo cliente</SelectItem>
                          <SelectItem value="pendente">A receber</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Observações da condição" className="sm:col-span-3">
                      <Input
                        className="text-white"
                        placeholder="Ex.: 50% no cartão em 24x, restante em outro cartão"
                        value={c.observacoes}
                        onChange={(e) => atualizarCondicao(c.key, { observacoes: e.target.value })}
                      />
                    </Field>
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {Math.max(1, c.parcelas)}x de {brl(c.valor_parcela)} = {brl(cobradoCondicao(c))}{" "}
                    cobrados · abate {brl(c.valor)} do pedido
                  </p>
                </div>
              ))}

              <div className="grid gap-3 border-t border-border pt-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-muted-foreground">Total do pedido</p>
                  <p className="font-semibold">{brl(valorTotal)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Alocado nas condições</p>
                  <p className="font-semibold">{brl(totalAplicado)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Falta alocar</p>
                  <p
                    className={`font-semibold ${
                      Math.abs(faltaAlocar) < 0.01
                        ? "text-success"
                        : faltaAlocar > 0
                          ? "text-warning"
                          : "text-destructive"
                    }`}
                  >
                    {brl(faltaAlocar)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cliente paga (com juros)</p>
                  <p className="font-semibold">{brl(totalCobradoCliente)}</p>
                  {totalJuros > 0 && (
                    <p className="text-xs text-muted-foreground">
                      juros embutidos: {brl(totalJuros)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Já recebido (condições marcadas como pagas)">
                  <Input value={brl(valorEntrada)} disabled />
                </Field>
                <Field label="Saldo devedor">
                  <Input value={brl(saldoDevedor)} disabled />
                </Field>
              </div>

              <Field label="Observações do pedido">
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
