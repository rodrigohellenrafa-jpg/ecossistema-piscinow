import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Save, Search, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/field";
import { PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ExpandableCard } from "@/components/expandable-card";
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
import { useAbrirModal } from "@/hooks/use-abrir-modal";

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

const STATUS = [
  "sob_encomenda",
  "pendente",
  "enviada",
  "faturada",
  "concluida",
  "recebida",
  "cancelada",
] as const;

const statusLabel: Record<string, string> = {
  sob_encomenda: "Sob encomenda",
  pendente: "A comprar",
  enviada: "Enviada ao fornecedor",
  faturada: "Faturada pelo fornecedor",
  concluida: "Entregue",
  recebida: "Finalizada (baixada)",
  cancelada: "Cancelada",
};


/** Ordem das etapas do fluxo da O.C. */
const FLUXO = ["pendente", "enviada", "faturada", "concluida"] as const;

const etapaAtual = (s: string) => {
  if (s === "sob_encomenda") return 0;
  if (s === "recebida") return 3;
  const i = FLUXO.indexOf(s as (typeof FLUXO)[number]);
  return i < 0 ? 0 : i;
};

const statusVariant = (s: string): "secondary" | "default" | "destructive" | "outline" => {
  if (s === "recebida" || s === "concluida") return "default";
  if (s === "cancelada") return "destructive";
  if (s === "enviada" || s === "faturada") return "outline";
  return "secondary";
};

const normalizar = (valor: string) =>
  valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

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
  enviada_em?: string | null;
  faturada_em?: string | null;
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
  venda_id?: string | null;
  numero_nf: string | null;
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
  categoria: string | null;
  tipo: string;
  unidade: string;
  ncm: string | null;
  cst: string | null;
  preco_custo: number;
  fornecedor_id: string | null;
  cor_pastilha: string | null;
  modelo_pastilha: string | null;
  quantidade_compra: number;
  desconto_compra: number;
  status_compra: string;
};

const STATUS_COMPRA = [
  { valor: "a_comprar", rotulo: "A comprar" },
  { valor: "comprado", rotulo: "Comprado" },
  { valor: "recebido", rotulo: "Recebido" },
] as const;

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
  const [buscaFornecedor, setBuscaFornecedor] = useState("");
  const [detalheId, setDetalheId] = useState<string | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [novaOpen, setNovaOpen] = useState(false);
  useAbrirModal("novo", () => setNovaOpen(true));
  const [novoItem, setNovoItem] = useState(novoItemVazio);
  const [novaOrdem, setNovaOrdem] = useState({
    fornecedor_id: "",
    previsao_entrega: "",
    condicoes: "",
    observacoes: "",
  });
  const [itensNovaOrdem, setItensNovaOrdem] = useState<ItemForm[]>([]);
  const [selecionadosCompra, setSelecionadosCompra] = useState<Record<string, boolean>>({});
  const [selecionadosExecutados, setSelecionadosExecutados] = useState<Record<string, boolean>>({});
  const [usarCreditoFabricante, setUsarCreditoFabricante] = useState(false);
  const [creditoFabricante, setCreditoFabricante] = useState("");
  const [creditoDisponivelInput, setCreditoDisponivelInput] = useState<string | null>(null);

  const [quantidadesCompra, setQuantidadesCompra] = useState<Record<string, string>>({});
  const [valoresCompra, setValoresCompra] = useState<Record<string, string>>({});
  const [percentuaisCompra, setPercentuaisCompra] = useState<Record<string, string>>({});
  const [coresCompra, setCoresCompra] = useState<Record<string, string>>({});
  const [modelosCompra, setModelosCompra] = useState<Record<string, string>>({});
  const [statusCompra, setStatusCompra] = useState<Record<string, string>>({});
  const [vinculosCompra, setVinculosCompra] = useState<Record<string, string>>({});
  const salvamentosPendentes = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [produtoCompraEditando, setProdutoCompraEditando] = useState<Produto | null>(null);
  const [produtoCompraForm, setProdutoCompraForm] = useState({
    codigo: "",
    nome: "",
    categoria: "",
    unidade: "UN",
    preco_custo: "0",
    fornecedor_id: SEM_CLIENTE,
  });

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
        .select("id, codigo, nome, categoria, tipo, unidade, ncm, cst, preco_custo, fornecedor_id, cor_pastilha, modelo_pastilha, quantidade_compra, desconto_compra, status_compra")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data as Produto[];
    },
  });

  const { data: creditoRegistro } = useQuery({
    queryKey: ["credito_fabricante"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("credito_fabricante" as never)
        .select("id, saldo")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as { id: string; saldo: number } | null) ?? null;
    },
  });

  const salvarCreditoDisponivel = useMutation({
    mutationFn: async (saldo: number) => {
      if (creditoRegistro?.id) {
        const { error } = await supabase
          .from("credito_fabricante" as never)
          .update({ saldo, updated_at: new Date().toISOString() } as never)
          .eq("id", creditoRegistro.id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase
        .from("credito_fabricante" as never)
        .insert({ fornecedor_nome: "Geral", saldo } as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["credito_fabricante"] }),
    onError: (erro: Error) => toast.error(erro.message),
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

  /** Todos os itens das ordens listadas, para agrupar produtos por fornecedor. */
  const { data: itensTodos = [] } = useQuery({
    queryKey: ["ordem_compra_itens", "todos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordem_compra_itens")
        .select("*")
        .order("created_at");
      if (error) throw error;
      return data as Item[];
    },
  });

  /** Pedidos de venda vinculados aos itens comprados. */
  const { data: vendasVinculo = [] } = useQuery({
    queryKey: ["vendas", "vinculo-compras"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendas")
        .select("id, numero, cliente_id, cliente_nome")
        .order("numero");
      if (error) throw error;
      return data as {
        id: string;
        numero: string | null;
        cliente_id: string | null;
        cliente_nome: string | null;
      }[];
    },
  });

  const vendaPorId = useMemo(() => {
    const m = new Map<
      string,
      { numero: string | null; cliente_id: string | null; cliente_nome: string | null }
    >();
    for (const v of vendasVinculo) m.set(v.id, v);
    return m;
  }, [vendasVinculo]);

  const ordensFiltradas = useMemo(() => {
    const busca = normalizar(buscaFornecedor.trim());
    return ordens.filter(
      (ordem) =>
        (filtroStatus === "todas" || ordem.status === filtroStatus) &&
        (!busca || normalizar(ordem.fornecedor_nome ?? "").includes(busca)),
    );
  }, [ordens, filtroStatus, buscaFornecedor]);

  /** Produto comprado, com a ordem e o pedido de venda vinculados. */
  type LinhaProduto = {
    id: string;
    ordemId: string;
    ordemNumero: string | null;
    descricao: string;
    codigo: string | null;
    unidade: string;
    quantidade: number;
    total: number;
    pedido: string;
    cliente: string;
    numeroNf: string | null;
  };

  /** Ordens agrupadas por fornecedor (e não por pedido). */
  const gruposFornecedor = useMemo(() => {
    const mapa = new Map<
      string,
      { chave: string; nome: string; ordens: Ordem[]; total: number; produtos: LinhaProduto[] }
    >();
    const ordemPorId = new Map(ordensFiltradas.map((o) => [o.id, o]));
    for (const o of ordensFiltradas) {
      const chave = o.fornecedor_id ?? "sem-fornecedor";
      const grupo =
        mapa.get(chave) ??
        {
          chave,
          nome: o.fornecedor_nome ?? "Fornecedor não definido",
          ordens: [] as Ordem[],
          total: 0,
          produtos: [] as LinhaProduto[],
        };
      grupo.ordens.push(o);
      grupo.total += Number(o.valor_total ?? 0);
      mapa.set(chave, grupo);
    }
    for (const it of itensTodos) {
      const ordem = ordemPorId.get(it.ordem_id);
      if (!ordem) continue;
      const grupo = mapa.get(ordem.fornecedor_id ?? "sem-fornecedor");
      if (!grupo) continue;
      const venda = it.venda_id ? vendaPorId.get(it.venda_id) : undefined;
      grupo.produtos.push({
        id: it.id,
        ordemId: ordem.id,
        ordemNumero: ordem.numero,
        descricao: it.descricao,
        codigo: it.codigo,
        unidade: it.unidade,
        quantidade: Number(it.quantidade ?? 0),
        total: Number(it.total ?? 0),
        pedido: venda?.numero ?? "Estoque",
        cliente: it.cliente_nome ?? venda?.cliente_nome ?? "—",
        numeroNf: it.numero_nf ?? null,
      });
    }
    for (const g of mapa.values()) {
      g.produtos.sort(
        (a, b) => a.pedido.localeCompare(b.pedido) || a.descricao.localeCompare(b.descricao),
      );
    }
    return Array.from(mapa.values()).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [ordensFiltradas, itensTodos, vendaPorId]);

  const linhasExecutadas = useMemo(() => {
    const ordensPorId = new Map(ordensFiltradas.map((ordem) => [ordem.id, ordem]));
    const produtosPorId = new Map(produtos.map((produto) => [produto.id, produto]));
    return itensTodos.flatMap((item) => {
      const ordem = ordensPorId.get(item.ordem_id);
      if (!ordem) return [];
      const produto = item.produto_id ? produtosPorId.get(item.produto_id) : undefined;
      const venda = item.venda_id ? vendaPorId.get(item.venda_id) : undefined;
      return [{ item, ordem, produto, venda }];
    });
  }, [ordensFiltradas, itensTodos, produtos, vendaPorId]);

  const ordemDetalhe = ordens.find((o) => o.id === detalheId) ?? null;
  const fornecedorDetalhe = ordemDetalhe?.fornecedor_id
    ? (fornecedores.find((f) => f.id === ordemDetalhe.fornecedor_id) ?? null)
    : null;

  const fornecedorDaCompra = (produto: Produto) => {
    const categoria = normalizar(produto.categoria ?? "");
    const nome = normalizar(produto.nome);
    const alvo =
      produto.tipo === "servico"
        ? "splash jardim do trevo"
        : categoria.includes("piscina") || nome.includes("piscina")
          ? "analandia"
          : "progeu";
    const encontrado =
      fornecedores.find((f) => normalizar(f.nome).includes(alvo)) ??
      fornecedores.find((f) => f.id === produto.fornecedor_id);
    if (encontrado) return encontrado;
    if (produto.tipo === "servico") {
      return { id: SEM_CLIENTE, nome: "Splash Jardim do Trevo" } satisfies Fornecedor;
    }
    return null;
  };

  const produtosFiltrados = useMemo(() => {
    const busca = normalizar(buscaFornecedor.trim());
    if (!busca) return produtos;
    return produtos.filter((produto) =>
      normalizar(fornecedorDaCompra(produto)?.nome ?? "").includes(busca),
    );
  }, [produtos, fornecedores, buscaFornecedor]);

  const quantidadeCompra = (produto: Produto) => {
    const valor = quantidadesCompra[produto.id];
    return valor === undefined
      ? Number(produto.quantidade_compra ?? 1)
      : Math.max(Number(valor) || 0, 0);
  };

  const valorCompra = (produto: Produto) => {
    const valor = valoresCompra[produto.id];
    return valor === undefined ? Number(produto.preco_custo) : Math.max(Number(valor) || 0, 0);
  };

  const percentualCompra = (produto: Produto) =>
    percentuaisCompra[produto.id] === undefined
      ? Math.min(Math.max(Number(produto.desconto_compra ?? 0) || 0, 0), 100)
      : Math.min(Math.max(Number(percentuaisCompra[produto.id]) || 0, 0), 100);

  const totalCompra = (produto: Produto) =>
    quantidadeCompra(produto) * valorCompra(produto) * (1 - percentualCompra(produto) / 100);

  const produtosSelecionados = produtosFiltrados.filter((p) => selecionadosCompra[p.id]);
  const totalSelecionadoCompra = produtosSelecionados.reduce((total, p) => total + totalCompra(p), 0);
  const creditoDisponivel = Number(creditoRegistro?.saldo ?? 0);
  const creditoDisponivelValor =
    creditoDisponivelInput === null
      ? creditoDisponivel
      : Number(creditoDisponivelInput) || 0;
  const creditoCreditar = usarCreditoFabricante ? Number(creditoFabricante) || 0 : 0;
  const creditoAplicado = (() => {
    if (creditoCreditar === 0 || totalSelecionadoCompra <= 0) return 0;
    // Valor negativo digitado: entra como cobrança (soma no total a pagar).
    if (creditoCreditar < 0) return creditoCreditar;
    // Saldo do fabricante negativo: creditar passa a cobrar, limitado ao débito existente.
    if (creditoDisponivelValor < 0) {
      return -Math.min(creditoCreditar, Math.abs(creditoDisponivelValor));
    }
    return Math.min(creditoCreditar, totalSelecionadoCompra);
  })();
  const saldoCredito = creditoDisponivelValor - creditoCreditar;
  const totalAPagarCompra = Math.max(totalSelecionadoCompra - creditoAplicado, 0);

  const itensExecutadosSelecionados = linhasExecutadas.filter(({ item }) => selecionadosExecutados[item.id]);
  const todosProdutosSelecionados =
    (produtosFiltrados.length > 0 || linhasExecutadas.length > 0) &&
    produtosFiltrados.every((p) => selecionadosCompra[p.id]) &&
    linhasExecutadas.every(({ item }) => selecionadosExecutados[item.id]);

  const marcarTodosProdutos = (marcado: boolean) => {
    setSelecionadosCompra(
      marcado ? Object.fromEntries(produtosFiltrados.map((produto) => [produto.id, true])) : {},
    );
    setSelecionadosExecutados(
      marcado ? Object.fromEntries(linhasExecutadas.map(({ item }) => [item.id, true])) : {},
    );
  };

  const comprarSelecionados = useMutation({
    mutationFn: async () => {
      if (produtosSelecionados.length === 0) throw new Error("Selecione ao menos um produto");

      const semFornecedor = produtosSelecionados.filter((produto) => !fornecedorDaCompra(produto));
      if (semFornecedor.length > 0) {
        throw new Error(`Fornecedor não encontrado para: ${semFornecedor.map((p) => p.nome).join(", ")}`);
      }
      if (produtosSelecionados.some((produto) => quantidadeCompra(produto) <= 0)) {
        throw new Error("A quantidade dos produtos selecionados deve ser maior que zero");
      }

      const { data: auth } = await supabase.auth.getUser();
      const { data: existentes, error: erroNumeros } = await supabase
        .from("ordens_compra")
        .select("numero");
      if (erroNumeros) throw erroNumeros;
      const numeros = (existentes ?? []).map((ordem) => ordem.numero);
      const grupos = new Map<string, { fornecedor: Fornecedor; itens: Produto[] }>();

      for (const produto of produtosSelecionados) {
        const fornecedor = fornecedorDaCompra(produto);
        if (!fornecedor) continue;
        const grupo = grupos.get(fornecedor.id);
        grupos.set(fornecedor.id, {
          fornecedor,
          itens: [...(grupo?.itens ?? []), produto],
        });
      }

      let quantidadeOrdens = 0;
      const idsCriados: string[] = [];
      for (const { fornecedor, itens } of grupos.values()) {
        const numero = proximoCodigo("OC", numeros);
        numeros.push(numero);
        const valorProdutos = itens.reduce((total, produto) => total + totalCompra(produto), 0);
        const creditoOrdem =
          creditoAplicado !== 0 && totalSelecionadoCompra > 0
            ? (valorProdutos / totalSelecionadoCompra) * creditoAplicado
            : 0;
        const { data: ordem, error: erroOrdem } = await supabase
          .from("ordens_compra")
          .insert({
            numero,
            fornecedor_id: fornecedor.id === SEM_CLIENTE ? null : fornecedor.id,
            fornecedor_nome: fornecedor.nome,
            data_pedido: hojeISO(),
            valor_produtos: valorProdutos,
            desconto: creditoOrdem,
            icms_base: valorProdutos,
            icms_valor: valorProdutos * 0.18,
            icms_st_base: 0,
            icms_st_valor: 0,
            valor_total: valorProdutos - creditoOrdem,
            status: "pendente",
            observacoes:
              creditoOrdem > 0
                ? `Compra selecionada na grade de produtos | Crédito fabricante abatido: ${brl(creditoOrdem)}`
                : creditoOrdem < 0
                  ? `Compra selecionada na grade de produtos | Crédito fabricante negativo cobrado: ${brl(Math.abs(creditoOrdem))}`
                  : "Compra selecionada na grade de produtos",
            created_by: auth.user?.id ?? null,
          })
          .select("id")
          .single();
        if (erroOrdem) throw erroOrdem;

        const payload = itens.map((produto) => {
          const vendaId = vinculosCompra[produto.id];
          const venda = vendaId ? vendaPorId.get(vendaId) : undefined;
          const bruto = quantidadeCompra(produto) * valorCompra(produto);
          const desconto = bruto * (percentualCompra(produto) / 100);
          return {
            ordem_id: ordem.id,
            produto_id: produto.id,
            codigo: produto.codigo,
            descricao: produto.nome,
            ncm: produto.ncm,
            cst: produto.cst,
            unidade: produto.unidade,
            quantidade: quantidadeCompra(produto),
            valor_unitario: valorCompra(produto),
            desconto,
            total: bruto - desconto,
            cliente_id: venda?.cliente_id ?? null,
            cliente_nome: venda?.cliente_nome ?? null,
            venda_id: vendaId || null,
          };
        });
        const { error: erroItens } = await supabase.from("ordem_compra_itens").insert(payload);
        if (erroItens) throw erroItens;
        quantidadeOrdens += 1;
        idsCriados.push(ordem.id);
      }
      return { quantidadeOrdens, idsCriados };
    },
    onSuccess: ({ quantidadeOrdens: quantidade }) => {
      toast.success(
        quantidade === 1 ? "1 ordem de compra criada" : `${quantidade} ordens de compra criadas`,
      );
      if (creditoAplicado !== 0 || creditoCreditar !== 0) {
        salvarCreditoDisponivel.mutate(saldoCredito);
        setCreditoDisponivelInput(null);
        setCreditoFabricante("");
        setUsarCreditoFabricante(false);
      }
      setSelecionadosCompra({});
      setQuantidadesCompra({});
      setValoresCompra({});
      setPercentuaisCompra({});
      setVinculosCompra({});
      qc.invalidateQueries({ queryKey: ["ordens_compra"] });
      qc.invalidateQueries({ queryKey: ["ordem_compra_itens", "todos"] });
    },
    onError: (erro: Error) => toast.error(erro.message),
  });

  const abrirEdicaoProdutoCompra = (produto: Produto) => {
    setProdutoCompraEditando(produto);
    setProdutoCompraForm({
      codigo: produto.codigo ?? "",
      nome: produto.nome,
      categoria: produto.categoria ?? "",
      unidade: produto.unidade,
      preco_custo: String(Number(produto.preco_custo ?? 0)),
      fornecedor_id: produto.fornecedor_id ?? SEM_CLIENTE,
    });
  };

  const salvarProdutoCompra = useMutation({
    mutationFn: async () => {
      if (!produtoCompraEditando) throw new Error("Produto não encontrado");
      if (!produtoCompraForm.nome.trim()) throw new Error("Informe o nome do produto");
      const { error } = await supabase
        .from("produtos")
        .update({
          codigo: produtoCompraForm.codigo.trim() || null,
          nome: produtoCompraForm.nome.trim(),
          categoria: produtoCompraForm.categoria.trim() || null,
          unidade: produtoCompraForm.unidade.trim() || "UN",
          preco_custo: Math.max(Number(produtoCompraForm.preco_custo) || 0, 0),
          fornecedor_id:
            produtoCompraForm.fornecedor_id === SEM_CLIENTE
              ? null
              : produtoCompraForm.fornecedor_id,
        })
        .eq("id", produtoCompraEditando.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Produto atualizado");
      setProdutoCompraEditando(null);
      qc.invalidateQueries({ queryKey: ["produtos", "lista-simples"] });
      qc.invalidateQueries({ queryKey: ["produtos"] });
    },
    onError: (erro: Error) => toast.error(erro.message),
  });

  const excluirProdutoCompra = useMutation({
    mutationFn: async (produto: Produto) => {
      const confirmado = window.confirm(
        `Excluir “${produto.nome}” do cadastro de produtos? Esta ação não pode ser desfeita.`,
      );
      if (!confirmado) return false;
      const { error } = await supabase.from("produtos").delete().eq("id", produto.id);
      if (error) throw error;
      return true;
    },
    onSuccess: (excluido, produto) => {
      if (!excluido) return;
      toast.success(`${produto.nome} excluído`);
      setSelecionadosCompra((atual) => {
        const proximo = { ...atual };
        delete proximo[produto.id];
        return proximo;
      });
      qc.invalidateQueries({ queryKey: ["produtos", "lista-simples"] });
      qc.invalidateQueries({ queryKey: ["produtos"] });
    },
    onError: (erro: Error) => toast.error(erro.message),
  });

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

  /** Envio da O.C. ao fornecedor: ainda não gera dívida. */
  const enviarAoFornecedor = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ordens_compra")
        .update({ status: "enviada", enviada_em: new Date().toISOString() } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ordem marcada como enviada ao fornecedor");
      qc.invalidateQueries({ queryKey: ["ordens_compra"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [faturaOpen, setFaturaOpen] = useState(false);
  const [fatura, setFatura] = useState({
    valor: "",
    vencimento: hojeISO(),
    forma: "Boleto",
    observacoes: "",
  });

  const abrirFatura = () => {
    if (!ordemDetalhe) return;
    setFatura({
      valor: String(Number(ordemDetalhe.valor_total ?? 0)),
      vencimento: hojeISO(),
      forma: "Boleto",
      observacoes: "",
    });
    setFaturaOpen(true);
  };

  /** Faturamento: só aqui nasce o título no Contas a Pagar. */
  const faturarOrdem = useMutation({
    mutationFn: async () => {
      if (!ordemDetalhe) throw new Error("Ordem não encontrada");
      const valor = Number(fatura.valor) || 0;
      if (valor <= 0) throw new Error("Informe o valor cobrado pelo fornecedor");
      if (!fatura.vencimento) throw new Error("Informe a data de vencimento");

      const { data: auth } = await supabase.auth.getUser();

      const { data: existentes, error: erroBusca } = await supabase
        .from("contas")
        .select("id")
        .eq("ordem_compra_id" as never, ordemDetalhe.id as never);
      if (erroBusca) throw erroBusca;
      if ((existentes ?? []).length > 0) {
        throw new Error("Esta ordem já possui título no Contas a Pagar");
      }

      const { error: erroConta } = await supabase.from("contas").insert({
        tipo: "pagar",
        descricao: `Ordem de compra ${ordemDetalhe.numero ?? ""} - ${ordemDetalhe.fornecedor_nome ?? "Fornecedor"}`,
        parceiro: ordemDetalhe.fornecedor_nome,
        categoria: "Compras",
        valor,
        vencimento: fatura.vencimento,
        status: "pendente",
        observacoes: [fatura.forma, fatura.observacoes].filter(Boolean).join(" - ") || null,
        ordem_compra_id: ordemDetalhe.id,
        created_by: auth.user?.id ?? null,
      } as never);
      if (erroConta) throw erroConta;

      const { error: erroOrdem } = await supabase
        .from("ordens_compra")
        .update({
          status: "faturada",
          faturada_em: new Date().toISOString(),
          condicoes: `${fatura.forma} - venc. ${fatura.vencimento}`,
        } as never)
        .eq("id", ordemDetalhe.id);
      if (erroOrdem) throw erroOrdem;
    },
    onSuccess: () => {
      toast.success("Ordem faturada e título lançado no Contas a Pagar");
      setFaturaOpen(false);
      qc.invalidateQueries({ queryKey: ["ordens_compra"] });
      qc.invalidateQueries({ queryKey: ["contas"] });
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

  const atualizarNumeroNf = useMutation({
    mutationFn: async ({ id, numeroNf }: { id: string; numeroNf: string }) => {
      const { error } = await supabase
        .from("ordem_compra_itens")
        .update({ numero_nf: numeroNf.trim() || null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Número da NF salvo");
      qc.invalidateQueries({ queryKey: ["ordem_compra_itens"] });
    },
    onError: (erro: Error) => toast.error(erro.message),
  });

  /** Salva automaticamente quantidade, valor, desconto e status de compra do produto. */
  const atualizarCompra = useMutation({
    mutationFn: async ({ id, campo, valor }: { id: string; campo: string; valor: number | string }) => {
      const { error } = await supabase
        .from("produtos")
        .update({ [campo]: valor } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: ({ id, campo, valor }) => {
      qc.setQueryData<Produto[]>(["produtos", "lista-simples"], (atuais) =>
        atuais?.map((produto) =>
          produto.id === id ? ({ ...produto, [campo]: valor } as Produto) : produto,
        ),
      );
    },
    onError: (erro: Error) => toast.error(erro.message),
  });

  const salvarAutomaticamente = (
    id: string,
    campo: string,
    valor: number | string,
    imediato = false,
  ) => {
    const chave = `${id}:${campo}`;
    const pendente = salvamentosPendentes.current[chave];
    if (pendente) clearTimeout(pendente);
    if (imediato) {
      delete salvamentosPendentes.current[chave];
      atualizarCompra.mutate({ id, campo, valor });
      return;
    }
    salvamentosPendentes.current[chave] = setTimeout(() => {
      delete salvamentosPendentes.current[chave];
      atualizarCompra.mutate({ id, campo, valor });
    }, 450);
  };

  useEffect(
    () => () => {
      Object.values(salvamentosPendentes.current).forEach(clearTimeout);
    },
    [],
  );

  const salvarTodosItens = useMutation({
    mutationFn: async () => {
      Object.values(salvamentosPendentes.current).forEach(clearTimeout);
      salvamentosPendentes.current = {};
      const resultados = await Promise.all(
        produtos.map((produto) =>
          supabase
            .from("produtos")
            .update({
              quantidade_compra: quantidadeCompra(produto),
              preco_custo: valorCompra(produto),
              desconto_compra: percentualCompra(produto),
              cor_pastilha: (coresCompra[produto.id] ?? produto.cor_pastilha ?? "").trim(),
              modelo_pastilha: (modelosCompra[produto.id] ?? produto.modelo_pastilha ?? "").trim(),
              status_compra: statusCompra[produto.id] ?? produto.status_compra ?? "a_comprar",
            } as any)
            .eq("id", produto.id),
        ),
      );
      const erro = resultados.find((r) => r.error)?.error;
      if (erro) throw erro;
      return resultados.length;
    },
    onSuccess: (total) => {
      toast.success(total === 1 ? "1 item salvo" : `${total} itens salvos`);
      qc.invalidateQueries({ queryKey: ["produtos", "lista-simples"] });
    },
    onError: (erro: Error) => toast.error(erro.message),
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
            <div className="relative min-w-56 flex-1 sm:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Buscar por fornecedor"
                className="pl-9 sm:w-64"
                placeholder="Buscar por fornecedor"
                value={buscaFornecedor}
                onChange={(evento) => setBuscaFornecedor(evento.target.value)}
              />
            </div>
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
          </div>
        }
      />

      <ExpandableCard>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Ordem de compra</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecione e ajuste os produtos. Ao executar, a ordem recebe um número e uma nova fica pronta.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => marcarTodosProdutos(!todosProdutosSelecionados)}
            >
              {todosProdutosSelecionados ? "Limpar seleção" : "Selecionar todos"}
            </Button>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total selecionado</p>
              <p className="text-lg font-semibold">{brl(totalSelecionadoCompra)}</p>
            </div>
            <div className="rounded-lg border p-3 text-left">
              <label className="flex items-center gap-2 text-xs font-medium">
                <Checkbox
                  checked={usarCreditoFabricante}
                  onCheckedChange={(valor) => setUsarCreditoFabricante(valor === true)}
                />
                Crédito fabricante
              </label>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-muted-foreground">CRÉDITO</span>
                  <Input
                    className="h-8 w-32 text-right"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0,00"
                    value={creditoDisponivelInput ?? String(creditoDisponivel)}
                    onChange={(evento) => setCreditoDisponivelInput(evento.target.value)}
                    onBlur={() => {
                      if (creditoDisponivelInput === null) return;
                      const valor = Math.max(Number(creditoDisponivelInput) || 0, 0);
                      if (valor !== creditoDisponivel) salvarCreditoDisponivel.mutate(valor);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-muted-foreground">(−) CREDITAR</span>
                  <Input
                    className="h-8 w-32 text-right"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    disabled={!usarCreditoFabricante}
                    value={creditoFabricante}
                    onChange={(evento) => setCreditoFabricante(evento.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 border-t pt-1">
                  <span className="text-xs font-semibold">(=) SALDO</span>
                  <span className={`w-32 text-right font-semibold ${saldoCredito < 0 ? "text-destructive" : ""}`}>{brl(saldoCredito)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {creditoAplicado < 0
                    ? `Cobrado na compra: ${brl(Math.abs(creditoAplicado))}`
                    : `Abatido na compra: ${brl(creditoAplicado)}`}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total a pagar</p>
              <p className="text-lg font-semibold text-primary">{brl(totalAPagarCompra)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table className="min-w-[1560px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <div className="flex items-center gap-1">
                      <Checkbox
                        aria-label="Selecionar todos os produtos"
                        checked={todosProdutosSelecionados}
                        onCheckedChange={(valor) => marcarTodosProdutos(valor === true)}
                      />
                      <span className="text-[10px] font-normal text-muted-foreground">Todos</span>
                    </div>
                  </TableHead>
                  <TableHead>O.C.</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead className="text-right">Qtde</TableHead>
                  <TableHead className="text-right">Vl. unit.</TableHead>
                  <TableHead className="text-right">%</TableHead>
                  <TableHead className="text-right">Total a pagar</TableHead>
                  <TableHead>Vínculo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>NF</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtosFiltrados.map((produto) => {
                  const fornecedor = fornecedorDaCompra(produto);
                  return (
                    <TableRow key={produto.id}>
                      <TableCell>
                        <Checkbox
                          aria-label={`Selecionar ${produto.nome}`}
                          checked={selecionadosCompra[produto.id] === true}
                          onCheckedChange={(valor) =>
                            setSelecionadosCompra((atual) => ({
                              ...atual,
                              [produto.id]: valor === true,
                            }))
                          }
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">Nova</TableCell>
                      <TableCell className="font-medium">{fornecedor?.nome ?? "Não encontrado"}</TableCell>
                      <TableCell className="font-mono text-xs">{produto.codigo ?? "—"}</TableCell>
                      <TableCell>{produto.nome}</TableCell>
                      <TableCell>
                        <Input
                          aria-label={`Cor da pastilha de ${produto.nome}`}
                          className="w-28"
                          placeholder="Cor"
                          value={coresCompra[produto.id] ?? produto.cor_pastilha ?? ""}
                          onChange={(evento) => {
                            const valor = evento.target.value;
                            setCoresCompra((atual) => ({ ...atual, [produto.id]: valor }));
                            salvarAutomaticamente(produto.id, "cor_pastilha", valor.trim());
                          }}
                          onBlur={(evento) =>
                            salvarAutomaticamente(produto.id, "cor_pastilha", evento.target.value.trim(), true)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          aria-label={`Modelo da pastilha de ${produto.nome}`}
                          className="w-32"
                          placeholder="Modelo"
                          value={modelosCompra[produto.id] ?? produto.modelo_pastilha ?? ""}
                          onChange={(evento) => {
                            const valor = evento.target.value;
                            setModelosCompra((atual) => ({ ...atual, [produto.id]: valor }));
                            salvarAutomaticamente(produto.id, "modelo_pastilha", valor.trim());
                          }}
                          onBlur={(evento) =>
                            salvarAutomaticamente(produto.id, "modelo_pastilha", evento.target.value.trim(), true)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          aria-label={`Quantidade de ${produto.nome}`}
                          className="ml-auto w-20 text-right"
                          type="number"
                          min="0"
                          step="0.001"
                          value={quantidadesCompra[produto.id] ?? String(Number(produto.quantidade_compra ?? 1))}
                          onChange={(evento) => {
                            const valor = evento.target.value;
                            setQuantidadesCompra((atual) => ({
                              ...atual,
                              [produto.id]: valor,
                            }));
                            salvarAutomaticamente(produto.id, "quantidade_compra", Math.max(Number(valor) || 0, 0));
                          }}
                          onBlur={(evento) =>
                            salvarAutomaticamente(produto.id, "quantidade_compra", Math.max(Number(evento.target.value) || 0, 0), true)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          aria-label={`Valor unitário de ${produto.nome}`}
                          className="ml-auto w-28 text-right"
                          type="number"
                          min="0"
                          step="0.01"
                          value={valoresCompra[produto.id] ?? String(Number(produto.preco_custo))}
                          onChange={(evento) => {
                            const valor = evento.target.value;
                            setValoresCompra((atual) => ({
                              ...atual,
                              [produto.id]: valor,
                            }));
                            salvarAutomaticamente(produto.id, "preco_custo", Math.max(Number(valor) || 0, 0));
                          }}
                          onBlur={(evento) =>
                            salvarAutomaticamente(produto.id, "preco_custo", Math.max(Number(evento.target.value) || 0, 0), true)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          aria-label={`Desconto percentual de ${produto.nome}`}
                          className="ml-auto w-20 text-right"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={percentuaisCompra[produto.id] ?? String(Number(produto.desconto_compra ?? 0))}
                          onChange={(evento) => {
                            const valor = evento.target.value;
                            setPercentuaisCompra((atual) => ({
                              ...atual,
                              [produto.id]: valor,
                            }));
                            salvarAutomaticamente(produto.id, "desconto_compra", Math.min(Math.max(Number(valor) || 0, 0), 100));
                          }}
                          onBlur={(evento) =>
                            salvarAutomaticamente(produto.id, "desconto_compra", Math.min(Math.max(Number(evento.target.value) || 0, 0), 100), true)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right font-semibold">{brl(totalCompra(produto))}</TableCell>
                      <TableCell>
                        <Select
                          value={vinculosCompra[produto.id] ?? SEM_CLIENTE}
                          onValueChange={(valor) =>
                            setVinculosCompra((atual) => ({
                              ...atual,
                              [produto.id]: valor === SEM_CLIENTE ? "" : valor,
                            }))
                          }
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={SEM_CLIENTE}>Estoque</SelectItem>
                            {vendasVinculo.map((venda) => (
                              <SelectItem key={venda.id} value={venda.id}>
                                {venda.numero ?? "Pedido"} — {venda.cliente_nome ?? "Cliente"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={statusCompra[produto.id] ?? produto.status_compra ?? "a_comprar"}
                          onValueChange={(valor) => {
                            setStatusCompra((atual) => ({ ...atual, [produto.id]: valor }));
                            salvarAutomaticamente(produto.id, "status_compra", valor, true);
                          }}
                        >
                          <SelectTrigger
                            className="w-32"
                            aria-label={`Status de compra de ${produto.nome}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_COMPRA.map((opcao) => (
                              <SelectItem key={opcao.valor} value={opcao.valor}>
                                {opcao.rotulo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground">Após faturar</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label={`Editar ${produto.nome}`}
                            title="Editar produto"
                            onClick={() => abrirEdicaoProdutoCompra(produto)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label={`Excluir ${produto.nome}`}
                            title="Excluir produto"
                            disabled={excluirProdutoCompra.isPending}
                            onClick={() => excluirProdutoCompra.mutate(produto)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {linhasExecutadas.map(({ item, ordem, produto, venda }) => (
                  <TableRow key={`executada-${item.id}`}>
                    <TableCell />
                    <TableCell className="font-mono text-xs font-semibold">{ordem.numero ?? "—"}</TableCell>
                    <TableCell className="font-medium">{ordem.fornecedor_nome ?? "Não definido"}</TableCell>
                    <TableCell className="font-mono text-xs">{item.codigo ?? "—"}</TableCell>
                    <TableCell>{item.descricao}</TableCell>
                    <TableCell>{produto?.cor_pastilha ?? "—"}</TableCell>
                    <TableCell>{produto?.modelo_pastilha ?? "—"}</TableCell>
                    <TableCell className="text-right">{Number(item.quantidade)}</TableCell>
                    <TableCell className="text-right">{brl(Number(item.valor_unitario))}</TableCell>
                    <TableCell className="text-right">
                      {Number(item.quantidade) * Number(item.valor_unitario) > 0
                        ? `${((Number(item.desconto) / (Number(item.quantidade) * Number(item.valor_unitario))) * 100).toFixed(2)}%`
                        : "0%"}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{brl(Number(item.total))}</TableCell>
                    <TableCell>{venda ? `${venda.numero ?? "Pedido"} — ${item.cliente_nome ?? venda.cliente_nome ?? "Cliente"}` : "Estoque"}</TableCell>
                    <TableCell>
                      <Select
                        value={ordem.status}
                        onValueChange={(status) => atualizarStatus.mutate({ id: ordem.id, status })}
                      >
                        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUS.map((status) => (
                            <SelectItem key={status} value={status}>{statusLabel[status]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {etapaAtual(ordem.status) >= 2 ? (
                        <Input
                          className="w-28 font-mono"
                          defaultValue={item.numero_nf ?? ""}
                          placeholder="Nº da NF"
                          onBlur={(evento) => {
                            const numeroNf = evento.target.value.trim();
                            if (numeroNf !== (item.numero_nf ?? "")) atualizarNumeroNf.mutate({ id: item.id, numeroNf });
                          }}
                        />
                      ) : (
                        <span className="text-muted-foreground">Após faturar</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" title="Abrir ordem" onClick={() => setDetalheId(ordem.id)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button size="icon" variant="ghost" title="Excluir ordem" onClick={() => excluirOrdem.mutate(ordem.id)}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => salvarTodosItens.mutate()}
              disabled={produtos.length === 0 || salvarTodosItens.isPending}
            >
              <Save /> Salvar itens
            </Button>
            <Button
              onClick={() => comprarSelecionados.mutate()}
              disabled={produtosSelecionados.length === 0 || comprarSelecionados.isPending}
            >
              <ShoppingCart /> Executar ordem ({produtosSelecionados.length})
            </Button>
          </div>
        </CardContent>
      </ExpandableCard>

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
                    <TableHead>NF</TableHead>
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
                      <TableCell>
                        {etapaAtual(ordemDetalhe.status) >= 2 ? (
                          <Input
                            aria-label={`Número da NF de ${i.descricao}`}
                            className="min-w-28 font-mono"
                            defaultValue={i.numero_nf ?? ""}
                            placeholder="Nº da NF"
                            onBlur={(evento) => {
                              const numeroNf = evento.target.value.trim();
                              if (numeroNf !== (i.numero_nf ?? "")) {
                                atualizarNumeroNf.mutate({ id: i.id, numeroNf });
                              }
                            }}
                          />
                        ) : (
                          <span className="text-muted-foreground">Após faturar</span>
                        )}
                      </TableCell>
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

              <div className="space-y-3 rounded-lg border border-border p-4 print:hidden">
                <div>
                  <p className="text-sm font-medium">Fluxo da ordem de compra</p>
                  <p className="text-xs text-muted-foreground">
                    A dívida no Contas a Pagar só é criada quando o fornecedor fatura o pedido.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {FLUXO.map((s, i) => (
                    <Badge
                      key={s}
                      variant={i <= etapaAtual(ordemDetalhe.status) ? "default" : "secondary"}
                    >
                      {i + 1}. {statusLabel[s]}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    disabled={
                      etapaAtual(ordemDetalhe.status) >= 1 || enviarAoFornecedor.isPending
                    }
                    onClick={() => enviarAoFornecedor.mutate(ordemDetalhe.id)}
                  >
                    Marcar como enviada
                  </Button>
                  <Button
                    variant="outline"
                    disabled={etapaAtual(ordemDetalhe.status) >= 2}
                    onClick={abrirFatura}
                  >
                    Registrar faturamento
                  </Button>
                  <Button
                    variant="outline"
                    disabled={
                      ordemDetalhe.status === "concluida" ||
                      ordemDetalhe.status === "recebida"
                    }
                    onClick={() =>
                      atualizarStatus.mutate({ id: ordemDetalhe.id, status: "concluida" })
                    }
                  >
                    Marcar como entregue
                  </Button>
                  <Button
                    disabled={ordemDetalhe.status === "recebida"}
                    onClick={() =>
                      atualizarStatus.mutate({ id: ordemDetalhe.id, status: "recebida" })
                    }
                  >
                    Dar baixa (finalizar)
                  </Button>

                </div>
                {ordemDetalhe.faturada_em && (
                  <p className="text-xs text-muted-foreground">
                    Título gerado no Contas a Pagar em {dataBR(ordemDetalhe.faturada_em)}.
                  </p>
                )}
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
                <Button
                  variant="destructive"
                  disabled={excluirOrdem.isPending}
                  onClick={() => {
                    if (!window.confirm(`Excluir a ordem ${ordemDetalhe.numero ?? "selecionada"}?`)) return;
                    excluirOrdem.mutate(ordemDetalhe.id);
                  }}
                >
                  <Trash2 className="size-4" /> Excluir
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

      <Dialog
        open={produtoCompraEditando !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setProdutoCompraEditando(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar produto a comprar</DialogTitle>
            <DialogDescription>
              As alterações serão usadas nesta grade e nos próximos pedidos.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Produto *" className="sm:col-span-2">
              <Input
                value={produtoCompraForm.nome}
                onChange={(evento) =>
                  setProdutoCompraForm((atual) => ({ ...atual, nome: evento.target.value }))
                }
              />
            </Field>
            <Field label="SKU">
              <Input
                value={produtoCompraForm.codigo}
                onChange={(evento) =>
                  setProdutoCompraForm((atual) => ({ ...atual, codigo: evento.target.value }))
                }
              />
            </Field>
            <Field label="Categoria">
              <Input
                value={produtoCompraForm.categoria}
                onChange={(evento) =>
                  setProdutoCompraForm((atual) => ({ ...atual, categoria: evento.target.value }))
                }
              />
            </Field>
            <Field label="Unidade">
              <Input
                value={produtoCompraForm.unidade}
                onChange={(evento) =>
                  setProdutoCompraForm((atual) => ({ ...atual, unidade: evento.target.value }))
                }
              />
            </Field>
            <Field label="Valor unitário de custo (R$)">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={produtoCompraForm.preco_custo}
                onChange={(evento) =>
                  setProdutoCompraForm((atual) => ({
                    ...atual,
                    preco_custo: evento.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Fornecedor" className="sm:col-span-2">
              <Select
                value={produtoCompraForm.fornecedor_id}
                onValueChange={(valor) =>
                  setProdutoCompraForm((atual) => ({ ...atual, fornecedor_id: valor }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SEM_CLIENTE}>Fornecedor automático pela categoria</SelectItem>
                  {fornecedores.map((fornecedor) => (
                    <SelectItem key={fornecedor.id} value={fornecedor.id}>
                      {fornecedor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter className="gap-2">
            {produtoCompraEditando ? (
              <Button
                type="button"
                variant="destructive"
                disabled={excluirProdutoCompra.isPending}
                onClick={() => excluirProdutoCompra.mutate(produtoCompraEditando)}
              >
                <Trash2 className="size-4" /> Excluir
              </Button>
            ) : null}
            <Button
              type="button"
              onClick={() => salvarProdutoCompra.mutate()}
              disabled={salvarProdutoCompra.isPending}
            >
              <Pencil className="size-4" /> Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={faturaOpen} onOpenChange={setFaturaOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Condições de pagamento do fornecedor</DialogTitle>
            <DialogDescription>
              Informe o que o fornecedor cobrou. O título será criado no Contas a Pagar vinculado a
              esta ordem.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <Field label="Valor cobrado (R$) *">
              <Input
                type="number"
                step="0.01"
                value={fatura.valor}
                onChange={(e) => setFatura((f) => ({ ...f, valor: e.target.value }))}
              />
            </Field>
            <Field label="Data de vencimento *">
              <Input
                type="date"
                value={fatura.vencimento}
                onChange={(e) => setFatura((f) => ({ ...f, vencimento: e.target.value }))}
              />
            </Field>
            <Field label="Forma de pagamento">
              <Select
                value={fatura.forma}
                onValueChange={(v) => setFatura((f) => ({ ...f, forma: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Boleto", "Pix", "Transferência", "Cartão de Crédito", "Dinheiro"].map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Observações">
              <Textarea
                rows={2}
                value={fatura.observacoes}
                onChange={(e) => setFatura((f) => ({ ...f, observacoes: e.target.value }))}
                placeholder="Ex.: nota 12345, entrega em 5 dias"
              />
            </Field>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFaturaOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => faturarOrdem.mutate()} disabled={faturarOrdem.isPending}>
              Faturar e gerar conta a pagar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
