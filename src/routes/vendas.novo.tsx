import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ClienteRapidoDialog } from "@/components/cliente-rapido-dialog";
import { ProdutoRapidoDialog } from "@/components/produto-rapido-dialog";
import { Field } from "@/components/field";
import { PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExpandableCard } from "@/components/expandable-card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import { rotearEstoque } from "@/lib/venda-automacao";

export const Route = createFileRoute("/vendas/novo")({
  staticData: { sitemap: false },
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
  desconto_pct: number;
  desconto_valor: number;
  custo_unitario: number;
  sob_encomenda: boolean;
  estoque_atual: number;
}

interface MaterialExtra {
  id: string;
  nome: string;
  quantidade: string;
}

interface AcessorioLinha {
  key: string;
  produto_id: string;
  nome: string;
  valor: number;
}

const novaKey = () => Math.random().toString(36).slice(2);

const subtotalBrutoItem = (i: ItemLinha) => i.quantidade * i.preco_unitario;

/** Desconto total do item: percentual sobre o bruto + valor fixo, limitado ao bruto. */
const descontoTotalItem = (i: ItemLinha) => {
  const bruto = subtotalBrutoItem(i);
  const descPct = (Math.min(Math.max(i.desconto_pct, 0), 100) / 100) * bruto;
  return Math.min(bruto, descPct + Math.max(i.desconto_valor, 0));
};

const totalItem = (i: ItemLinha) =>
  Math.max(0, subtotalBrutoItem(i) - descontoTotalItem(i));

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
const RASCUNHO_VENDA_KEY = "piscinow:pdv-rascunho-venda";

/** Uma forma de pagamento aplicada ao pedido (pode haver várias no mesmo pedido). */
interface CondicaoLinha {
  key: string;
  forma_pagamento: string;
  /** Valor que essa condição abate do total do pedido. */
  valor: number;
  /** Quantidade de parcelas (em branco ou zero enquanto não preenchido). */
  parcelas: number | string;
  /** Valor de cada parcela cobrada do cliente (já com juros da maquininha). */
  valor_parcela: number;
  data_prevista: string;
  pago: boolean;
  bandeira: string;
  observacoes: string;
  /** Conta bancária em que o recurso dessa condição entra. */
  conta_bancaria: string;
}


/** Normaliza a quantidade de parcelas (em branco ou zero vira 1). */
const parcelasNum = (parcelas: number | string) =>
  Math.max(1, Number(parcelas) || 1);

/** Total que o cliente desembolsa nessa condição (parcelas x valor da parcela). */
const cobradoCondicao = (c: CondicaoLinha) =>
  parcelasNum(c.parcelas) * c.valor_parcela;


/** Juros/acréscimo embutido: diferença entre o cobrado e o valor abatido. */
const acrescimoCondicao = (c: CondicaoLinha) =>
  Math.max(0, cobradoCondicao(c) - c.valor);


function NovoPedido() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [rascunhoVendaId, setRascunhoVendaId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(RASCUNHO_VENDA_KEY);
    } catch {
      return null;
    }
  });

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

  const { data: fornecedores = [] } = useQuery({
    queryKey: ["fornecedores-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fornecedores")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const { user } = useAuth();

  const { data: vendedores = [] } = useQuery({
    queryKey: ["vendedores-select", user?.id],
    queryFn: async () => {
      // A lista de vendedores vem do cadastro de Colaboradores (Cadastros → Colaboradores).
      const [colab, importados] = await Promise.all([
        supabase.from("funcionarios").select("id, nome, email").eq("ativo", true).order("nome"),
        supabase.from("usuarios_importados").select("id, nome, email").eq("ativo", true),
      ]);
      if (colab.error) throw colab.error;

      type V = { id: string; nome: string; email: string | null };
      const lista: V[] = (colab.data ?? []).map((f) => ({
        id: f.id,
        nome: f.nome,
        email: f.email,
      }));
      const temEmail = (e?: string | null) =>
        !!e && lista.some((v) => v.email?.toLowerCase() === e.toLowerCase());

      // Usuários do sistema que ainda não têm ficha de colaborador entram pelo nome cadastrado.
      for (const u of importados.data ?? []) {
        if (temEmail(u.email)) continue;
        lista.push({
          id: u.id,
          nome: u.nome ?? u.email?.split("@")[0] ?? "Sem nome",
          email: u.email,
        });
      }

      // Garante que o usuário logado sempre apareça como vendedor.
      if (user?.id && user.email && !temEmail(user.email) && !lista.some((v) => v.id === user.id)) {
        lista.push({
          id: user.id,
          nome: (user.user_metadata?.nome as string | undefined) ?? user.email.split("@")[0],
          email: user.email,
        });
      }

      lista.sort((a, b) => a.nome.localeCompare(b.nome));
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

  const { data: tabelaFabricante = [] } = useQuery({
    queryKey: ["tabela-fabricante"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tabela_fabricante")
        .select(
          "id, modelo, linha, custo_casco, custo_filtro, frete, instalacao, imposto, lucro, preco_venda",
        )
        .eq("ativo", true)
        .order("modelo");
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

  /** Contas bancárias cadastradas (para escolher onde o recurso entra). */
  const { data: contasBancarias = [] } = useQuery({
    queryKey: ["saldos-bancarios", "contas-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saldos_bancarios")
        .select("conta")
        .order("conta", { ascending: true });
      if (error) throw error;
      return (data as { conta: string }[]).map((c) => c.conta);
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
  const [descontoPctInputs, setDescontoPctInputs] = useState<Record<string, string>>({});
  const [produtoSel, setProdutoSel] = useState("");
  const [produtoAberto, setProdutoAberto] = useState(false);

  const [cascoId, setCascoId] = useState("");
  const [filtroId, setFiltroId] = useState("");
  const [acessorios, setAcessorios] = useState<AcessorioLinha[]>([]);
  const [custoFrete, setCustoFrete] = useState(0);
  const [custoMaoObra, setCustoMaoObra] = useState(0);
  const [impostosKit, setImpostosKit] = useState(0);
  const [precoVendaKit, setPrecoVendaKit] = useState(0);
  const [modeloTabela, setModeloTabela] = useState("");
  const [custoCasco, setCustoCasco] = useState(0);
  const [custoFiltro, setCustoFiltro] = useState(0);
  const [lucroSugerido, setLucroSugerido] = useState(0);
  /** Entrada paga pelo cliente no fechamento do pedido. */
  const [entrada, setEntrada] = useState(0);
  /** Conta bancária em que a entrada paga no fechamento entra. */
  const [contaEntrada, setContaEntrada] = useState("");

  /** Prazo de entrega e endereço de instalação impressos no pedido Splash. */
  const [prazoEntrega, setPrazoEntrega] = useState("");
  const [enderecoInstalacao, setEnderecoInstalacao] = useState("");
  /** Quantidades de material de obra solicitadas ao cliente (item 9 do pedido). */
  const [materiais, setMateriais] = useState<Record<string, string>>({
    areia_m3: "",
    cimento_sc: "",
    blocos_un: "",
    agua_m3: "",
    fios_eletrodutos: "",
  });
  const [materiaisExtras, setMateriaisExtras] = useState<MaterialExtra[]>([]);
  const [materiaisAberto, setMateriaisAberto] = useState(false);
  const materiaisPreenchidos =
    Object.values(materiais).filter((v) => v.trim()).length +
    materiaisExtras.filter((item) => item.nome.trim() && item.quantidade.trim()).length;


  /** Preenche os custos do kit a partir da tabela do fabricante. */
  function aplicarTabela(modelo: string) {
    setModeloTabela(modelo);
    const t = tabelaFabricante.find((x) => x.modelo === modelo);
    if (!t) return;
    setCustoCasco(num(t.custo_casco));
    setCustoFiltro(num(t.custo_filtro));
    setCustoFrete(num(t.frete));
    setCustoMaoObra(num(t.instalacao));
    setImpostosKit(num(t.imposto));
    setLucroSugerido(num(t.lucro));
    setPrecoVendaKit(num(t.preco_venda));
  }

  const [condicoes, setCondicoes] = useState<CondicaoLinha[]>([]);

  // ----- Rascunho automático: mantém o pedido em andamento ao trocar de tela -----
  const [rascunhoPronto, setRascunhoPronto] = useState(false);
  /** Depois de concluir a venda o rascunho não volta a ser gravado. */
  const finalizadoRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RASCUNHO_KEY);
      if (raw) {
        const d = JSON.parse(raw) as Record<string, unknown>;
        if (typeof d.data === "string") setData(d.data);
        if (d.tipoAtendimento === "in" || d.tipoAtendimento === "out")
          setTipoAtendimento(d.tipoAtendimento);
        if (typeof d.clienteId === "string") setClienteId(d.clienteId);
        if (typeof d.vendedorId === "string") setVendedorId(d.vendedorId);
        if (typeof d.observacoes === "string") setObservacoes(d.observacoes);
        if (Array.isArray(d.itens)) setItens(d.itens as ItemLinha[]);
        if (d.descontoInputs && typeof d.descontoInputs === "object")
          setDescontoInputs(d.descontoInputs as Record<string, string>);
        if (d.descontoPctInputs && typeof d.descontoPctInputs === "object")
          setDescontoPctInputs(d.descontoPctInputs as Record<string, string>);
        if (typeof d.cascoId === "string") setCascoId(d.cascoId);
        if (typeof d.filtroId === "string") setFiltroId(d.filtroId);
        if (Array.isArray(d.acessorios)) setAcessorios(d.acessorios as AcessorioLinha[]);
        if (typeof d.custoFrete === "number") setCustoFrete(d.custoFrete);
        if (typeof d.custoMaoObra === "number") setCustoMaoObra(d.custoMaoObra);
        if (typeof d.impostosKit === "number") setImpostosKit(d.impostosKit);
        if (typeof d.precoVendaKit === "number") setPrecoVendaKit(d.precoVendaKit);
        if (typeof d.modeloTabela === "string") setModeloTabela(d.modeloTabela);
        if (typeof d.custoCasco === "number") setCustoCasco(d.custoCasco);
        if (typeof d.custoFiltro === "number") setCustoFiltro(d.custoFiltro);
        if (typeof d.lucroSugerido === "number") setLucroSugerido(d.lucroSugerido);
        if (Array.isArray(d.condicoes)) setCondicoes(d.condicoes as CondicaoLinha[]);
        if (typeof d.prazoEntrega === "string") setPrazoEntrega(d.prazoEntrega);
        if (typeof d.enderecoInstalacao === "string") setEnderecoInstalacao(d.enderecoInstalacao);
        if (d.materiais && typeof d.materiais === "object")
          setMateriais((prev) => ({ ...prev, ...(d.materiais as Record<string, string>) }));
        if (Array.isArray(d.materiaisExtras)) setMateriaisExtras(d.materiaisExtras as MaterialExtra[]);
        const temConteudo =
          (Array.isArray(d.itens) && d.itens.length > 0) ||
          Boolean(d.clienteId) ||
          Boolean(d.cascoId);
        if (temConteudo) toast.info("Rascunho do pedido restaurado.");
      }
    } catch {
      /* rascunho inválido é ignorado */
    }
    setRascunhoPronto(true);
  }, []);

  useEffect(() => {
    if (!rascunhoPronto || finalizadoRef.current) return;
    try {
      localStorage.setItem(
        RASCUNHO_KEY,
        JSON.stringify({
          data,
          tipoAtendimento,
          clienteId,
          vendedorId,
          observacoes,
          itens,
          descontoInputs,
          descontoPctInputs,
          cascoId,
          filtroId,
          acessorios,
          custoFrete,
          custoMaoObra,
          impostosKit,
          precoVendaKit,
          modeloTabela,
          custoCasco,
          custoFiltro,
          lucroSugerido,
          condicoes,
          prazoEntrega,
          enderecoInstalacao,
          materiais,
          materiaisExtras,
        }),
      );
    } catch {
      /* armazenamento indisponível */
    }
  }, [
    rascunhoPronto,
    data,
    tipoAtendimento,
    clienteId,
    vendedorId,
    observacoes,
    itens,
    descontoInputs,
    descontoPctInputs,
    cascoId,
    filtroId,
    acessorios,
    custoFrete,
    custoMaoObra,
    impostosKit,
    precoVendaKit,
    modeloTabela,
    custoCasco,
    custoFiltro,
    lucroSugerido,
    condicoes,
    prazoEntrega,
    enderecoInstalacao,
    materiais,
    materiaisExtras,
  ]);

  /** Zera todos os campos da tela (usado ao descartar e após concluir a venda). */
  const limparCampos = () => {
    setData(hojeISO());
    setTipoAtendimento("in");
    setClienteId("");
    setObservacoes("");
    setItens([]);
    setDescontoInputs({});
    setDescontoPctInputs({});
    setCascoId("");
    setFiltroId("");
    setAcessorios([]);
    setCustoFrete(0);
    setCustoMaoObra(0);
    setImpostosKit(0);
    setPrecoVendaKit(0);
    setModeloTabela("");
    setCustoCasco(0);
    setCustoFiltro(0);
    setLucroSugerido(0);
    setCondicoes([]);
    setEntrada(0);
    setContaEntrada("");
    setPrazoEntrega("");
    setEnderecoInstalacao("");
    setMateriais({
      areia_m3: "",
      cimento_sc: "",
      blocos_un: "",
      agua_m3: "",
      fios_eletrodutos: "",
    });
    setMateriaisExtras([]);
  };

  const descartarRascunho = async () => {
    localStorage.removeItem(RASCUNHO_KEY);
    localStorage.removeItem(RASCUNHO_VENDA_KEY);
    if (rascunhoVendaId) {
      await supabase.from("venda_itens").delete().eq("venda_id", rascunhoVendaId);
      await supabase.from("vendas").delete().eq("id", rascunhoVendaId);
      setRascunhoVendaId(null);
      queryClient.invalidateQueries({ queryKey: ["vendas"] });
    }
    limparCampos();
    toast.success("Rascunho descartado.");
  };


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
  // Custo informado na tabela do fabricante tem prioridade sobre o cadastro do produto.
  const custoCascoFinal = custoCasco > 0 ? custoCasco : num(casco?.preco_custo);
  const custoFiltroFinal = custoFiltro > 0 ? custoFiltro : num(filtro?.preco_custo);
  const custoKitBase = custoCascoFinal + custoFiltroFinal;
  const custoAcessorios = acessorios.reduce((s, a) => s + a.valor, 0);
  const custoTotalKit = custoKitBase + custoAcessorios + custoFrete + custoMaoObra + impostosKit;
  const margemKit = margem(precoVendaKit, custoTotalKit);
  const corMargem = margemKit >= 0.25 ? "text-success" : margemKit < 0.1 ? "text-destructive" : "text-warning";

  // A composição do kit é apenas uma prévia de lucro: não entra no total do
  // pedido nem no custo do pedido (o que vale é o que está nos itens).
  const custoTotalGeral = custoTotalItens;
  const valorTotal = Number(subtotalProdutos.toFixed(2));

  // Condições de pagamento: cada linha abate um valor do pedido e pode ter
  // parcelas com juros da maquininha (o cliente paga mais do que abate).
  const totalAplicado = condicoes.reduce((s, c) => s + c.valor, 0);
  const totalCobradoCliente = condicoes.reduce((s, c) => s + cobradoCondicao(c), 0);
  const totalJuros = Math.max(0, totalCobradoCliente - totalAplicado);
  const saldoAposEntrada = Math.max(valorTotal - entrada, 0);
  const faltaAlocar = valorTotal - totalAplicado - entrada;
  const valorEntrada =
    entrada + condicoes.filter((c) => c.pago).reduce((s, c) => s + c.valor, 0);
  const saldoDevedor = Math.max(valorTotal - valorEntrada, 0);
  const pendentes = condicoes.filter((c) => !c.pago);
  const parcelasQtd = Math.max(1, pendentes.reduce((s, c) => s + parcelasNum(c.parcelas), 0));
  const valorParcela = pendentes.length > 0 ? pendentes[0].valor_parcela : saldoDevedor;
  const formaPagamento =
    condicoes.length > 0
      ? Array.from(new Set(condicoes.map((c) => c.forma_pagamento))).join(" + ")
      : FORMAS_PAGAMENTO[0];

  // Cliente do pedido pode ser um cliente cadastrado, um fornecedor ou um
  // funcionário (valores "for:<id>" / "fun:<id>" no seletor). Só clientes
  // cadastrados preenchem o vínculo cliente_id; os demais gravam só o nome.
  const selecaoCliente = useMemo(() => {
    if (clienteId.startsWith("for:")) {
      const id = clienteId.slice(4);
      const f = fornecedores.find((x) => x.id === id);
      return { id: null as string | null, nome: f?.nome ?? null };
    }
    if (clienteId.startsWith("fun:")) {
      const id = clienteId.slice(4);
      const f = vendedores.find((x) => x.id === id);
      return { id: null as string | null, nome: f?.nome ?? null };
    }
    const c = clientes.find((x) => x.id === clienteId);
    return { id: clienteId || null, nome: c?.nome ?? null };
  }, [clienteId, clientes, fornecedores, vendedores]);

  // ----- Rascunho salvo no banco como orçamento não concluído -----
  useEffect(() => {
    if (!rascunhoPronto) return;
    if (!clienteId && itens.length === 0) return;
    const timer = setTimeout(async () => {
      try {
        const cabecalho = {
          numero,
          data,
          cliente_id: selecaoCliente.id,
          cliente_nome: selecaoCliente.nome,
          forma_pagamento: formaPagamento,
          status_pagamento: "pendente",
          status_pedido: "orcamento",
          tipo_atendimento: tipoAtendimento,
          etiqueta: "Rascunho não concluído",
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
          created_by: user?.id ?? null,
        };

        let id = rascunhoVendaId;
        if (id) {
          const { error } = await supabase.from("vendas").update(cabecalho).eq("id", id);
          if (error) throw error;
        } else {
          const { data: nova, error } = await supabase
            .from("vendas")
            .insert(cabecalho)
            .select("id")
            .single();
          if (error) throw error;
          id = nova.id as string;
          setRascunhoVendaId(id);
          localStorage.setItem(RASCUNHO_VENDA_KEY, id);
        }

        await supabase.from("venda_itens").delete().eq("venda_id", id);
        if (itens.length > 0) {
          await supabase.from("venda_itens").insert(
            itens.map((i) => {
              const bruto = subtotalBrutoItem(i);
              return {
                venda_id: id,
                produto_id: i.produto_id,
                sku: i.sku || null,
                descricao: i.descricao,
                quantidade: i.quantidade,
                preco_unitario: i.preco_unitario,
                desconto_valor: Number(descontoTotalItem(i).toFixed(2)),
                desconto_perc:
                  bruto > 0 ? Number(((descontoTotalItem(i) / bruto) * 100).toFixed(2)) : 0,
                total: totalItem(i),
                custo_unitario: i.custo_unitario,
              };
            }),
          );
        }
        queryClient.invalidateQueries({ queryKey: ["vendas", "orcamentos"] });
      } catch {
        /* rascunho no banco é best-effort */
      }
    }, 4000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    rascunhoPronto,
    clienteId,
    itens,
    condicoes,
    observacoes,
    data,
    tipoAtendimento,
    valorTotal,
    precoVendaKit,
  ]);



  const adicionarCondicao = () => {
    // Saldo restante = total do pedido menos a entrada paga e o que já foi
    // alocado em outras condições.
    const restante = Math.max(0, Number((valorTotal - entrada - totalAplicado).toFixed(2)));
    setCondicoes((prev) => [
      ...prev,
      {
        key: novaKey(),
        forma_pagamento: FORMAS_PAGAMENTO[0],
        valor: restante,
        parcelas: "",
        valor_parcela: restante,
        data_prevista: data,

        pago: false,
        bandeira: "",
        observacoes: "",
        conta_bancaria: "",
      },
    ]);
  };

  const atualizarCondicao = (key: string, patch: Partial<CondicaoLinha>) =>
    setCondicoes((prev) => prev.map((c) => (c.key === key ? { ...c, ...patch } : c)));

  const atualizarEntrada = (novaEntrada: number) => {
    const entradaLimitada = Math.min(Math.max(novaEntrada, 0), valorTotal);
    setEntrada(entradaLimitada);
    setCondicoes((prev) => {
      if (prev.length === 0) return prev;

      const alvoCondicoes = Math.max(valorTotal - entradaLimitada, 0);
      const aplicadoAtual = prev.reduce((s, c) => s + c.valor, 0);
      const diferenca = Number((alvoCondicoes - aplicadoAtual).toFixed(2));
      if (Math.abs(diferenca) < 0.01) return prev;

      const ajustadas = [...prev];
      if (diferenca > 0) {
        const indice = ajustadas.length - 1;
        const atual = ajustadas[indice];
        if (!atual) return prev;
        const juros = acrescimoCondicao(atual);
        const valor = Number((atual.valor + diferenca).toFixed(2));
        ajustadas[indice] = {
          ...atual,
          valor,
          valor_parcela: (valor + juros) / parcelasNum(atual.parcelas),
        };
        return ajustadas;
      }

      let reduzir = Math.abs(diferenca);
      for (let indice = ajustadas.length - 1; indice >= 0 && reduzir > 0; indice -= 1) {
        const atual = ajustadas[indice];
        if (!atual) continue;
        const juros = acrescimoCondicao(atual);
        const abatimento = Math.min(atual.valor, reduzir);
        const valor = Number((atual.valor - abatimento).toFixed(2));
        ajustadas[indice] = {
          ...atual,
          valor,
          valor_parcela: (valor + juros) / parcelasNum(atual.parcelas),
        };
        reduzir = Number((reduzir - abatimento).toFixed(2));
      }
      return ajustadas;
    });
  };

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
        desconto_pct: 0,
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
    mutationFn: async (modo: "pedido" | "venda" = "pedido") => {
      if (!clienteId) throw new Error("Selecione o cliente.");
      if (itens.length === 0 && !cascoId) throw new Error("Adicione ao menos um item ou monte o kit.");
      if (contasBancarias.length > 0) {
        const norm = (s: string) => s.trim().toLowerCase();
        const validas = new Set(contasBancarias.map(norm));
        const checar = (conta: string, rotulo: string) => {
          if (!conta.trim()) throw new Error(`Escolha a conta onde o dinheiro entrou (${rotulo}).`);
          if (!validas.has(norm(conta))) throw new Error(`Conta bancária não cadastrada (${rotulo}): ${conta}. Escolha uma conta da lista.`);
        };
        if (entrada > 0) checar(contaEntrada, "entrada");
        condicoes.filter((c) => c.pago && c.valor > 0).forEach((c, i) => checar(c.conta_bancaria ?? "", `condição paga ${i + 1}`));
      }

      const cliente = { id: selecaoCliente.id, nome: selecaoCliente.nome };
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

      // O rascunho salvo como orçamento não concluído dá lugar ao pedido final.
      if (rascunhoVendaId) {
        await supabase.from("venda_itens").delete().eq("venda_id", rascunhoVendaId);
        await supabase.from("vendas").delete().eq("id", rascunhoVendaId);
        setRascunhoVendaId(null);
        try {
          localStorage.removeItem(RASCUNHO_VENDA_KEY);
        } catch {
          /* armazenamento indisponível */
        }
      }

      // O número definitivo é calculado no banco no momento de gravar, para não
      // "queimar" códigos com rascunhos que foram apagados.
      const { data: numeroRpc } = await supabase.rpc("proximo_numero_venda");
      const numeroFinal = (numeroRpc as string | null) ?? numero;

      const { data: venda, error: erroVenda } = await supabase
        .from("vendas")
        .insert({
          numero: numeroFinal,
          data,
          cliente_id: selecaoCliente.id,
          cliente_nome: selecaoCliente.nome,
          vendedor: vendedor?.nome ?? null,
          // O vendedor vem dos usuários do sistema (auth), não do cadastro de funcionários.
          vendedor_id: null,
          forma_pagamento: formaPagamento,
          status_pagamento: "pendente",
          status_pedido: modo === "venda" ? "aprovado" : "orcamento",
          tipo_atendimento: tipoAtendimento,

          observacoes: observacoes || null,
          prazo_entrega: prazoEntrega || null,
          endereco_instalacao: enderecoInstalacao || null,
          materiais: {
            ...materiais,
            itens_adicionais: materiaisExtras.map(({ nome, quantidade }) => ({ nome, quantidade })),
          },
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
              desconto_valor: Number(descontoTotalItem(i).toFixed(2)),
              desconto_perc: bruto > 0 ? Number(((descontoTotalItem(i) / bruto) * 100).toFixed(2)) : 0,
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
        numero: numeroFinal,
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
            parcelas: parcelasNum(c.parcelas),
            acrescimo: acrescimoCondicao(c),
            valor_cobrado: cobradoCondicao(c),
            valor_parcela: c.valor_parcela,
            data_prevista: c.data_prevista || data,
            pago: c.pago,
            bandeira: c.bandeira || null,
            conta_bancaria: c.conta_bancaria || null,
            observacoes: c.observacoes || null,
            created_by: userId,
          })) as never,
        );
        if (erroCond) throw erroCond;
      }

      // 1b) Contas a Receber é gerado automaticamente pelo banco a partir de
      // cada condição de pagamento (valor abatido, sem juros), vinculado ao
      // pedido. Editar ou excluir a condição atualiza/remove o título sozinho.

      // 1b-2) Os juros/acréscimo da maquininha NÃO viram receita: ficam apenas
      // registrados na condição de pagamento (venda_condicoes.acrescimo) como
      // informação, sem alimentar o financeiro nem o DRE.


      // 1c) Condições já pagas viram transações da venda: recalculam saldo,
      // status do pedido e entram no fluxo de caixa.
      const pagas = condicoes.filter((c) => c.pago && c.valor > 0);
      const pagamentos = pagas.map((c) => ({
        venda_id: venda.id,
        data_pagamento: c.data_prevista || data,
        forma_pagamento: c.forma_pagamento || "Dinheiro",
        valor: c.valor,
        conta_bancaria: c.conta_bancaria || null,
        observacoes:
          parcelasNum(c.parcelas) > 1
            ? `${parcelasNum(c.parcelas)}x de ${brl(c.valor_parcela)} (cobrado ${brl(cobradoCondicao(c))})`
            : c.observacoes || "Pagamento no fechamento do pedido",
        created_by: userId,
      }));
      if (entrada > 0) {
        pagamentos.unshift({
          venda_id: venda.id,
          data_pagamento: data,
          forma_pagamento: condicoes[0]?.forma_pagamento || "Dinheiro",
          valor: entrada,
          conta_bancaria: contaEntrada || null,
          observacoes: "Entrada paga no fechamento do pedido",
          created_by: userId,
        });
      }
      if (pagamentos.length > 0) {
        const { error: erroPag } = await supabase
          .from("venda_pagamentos")
          .insert(pagamentos as never);
        if (erroPag) throw erroPag;

        queryClient.invalidateQueries({ queryKey: ["saldos-bancarios"] });
      }

      // 2) Estoque: baixa o que tem saldo, encomenda automaticamente o que falta.
      // Falhas aqui não podem derrubar a venda já gravada.
      let roteamento: Awaited<ReturnType<typeof rotearEstoque>> = {
        baixados: 0,
        encomendados: 0,
        ordensCriadas: [],
      };
      let aviso: string | null = null;
      try {
        roteamento = await rotearEstoque(
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
      } catch {
        aviso = "Pedido salvo, mas a baixa de estoque não pôde ser feita com o seu acesso.";
      }

      // 2b) Pagamento parcial: o que faltou virar dinheiro entra como título em
      // Contas a Receber, qualquer que seja o serviço, a categoria ou a forma de
      // pagamento. As condições de pagamento em aberto já geram os próprios
      // títulos (trigger), então aqui entra só o que ficou sem cobertura.
      let contaReceber = 0;
      const houvePagamento = entrada > 0 || pagas.length > 0;
      if (modo === "venda" || houvePagamento) {
        const semCobertura = Number((valorTotal - entrada - totalAplicado).toFixed(2));
        if (semCobertura > 0.01) {
          const { error: erroConta } = await supabase.from("contas").insert({
            tipo: "receber",
            descricao: `Pedido ${numeroFinal} — saldo a receber`,
            parceiro: selecaoCliente.nome,
            cliente_id: selecaoCliente.id,
            venda_id: venda.id,
            categoria: "Vendas",
            valor: semCobertura,
            vencimento: data,
            status: "aberto",
            observacoes: "Gerado automaticamente: pagamento parcial (total do pedido menos o valor pago).",
            created_by: userId,
          });
          if (erroConta) {
            aviso = "Venda salva, mas o título em Contas a Receber não pôde ser gerado com o seu acesso.";
          } else {
            contaReceber = semCobertura;
          }
        }
      }

      // Obras e O.S. são criadas somente pela seleção no Flight Board.
      const obraCriada = false;
      queryClient.invalidateQueries({ queryKey: ["vendas-out"] });

      return { id: venda.id as string, roteamento, aviso, contaReceber, modo, obraCriada };
    },
    onSuccess: ({ id, roteamento, aviso, contaReceber, modo, obraCriada }) => {

      toast.success(
        modo === "venda"
          ? "Venda confirmada e financeiro lançado!"
          : tipoAtendimento === "in"
            ? "Pedido de balcão registrado e financeiro lançado!"
            : "Pedido registrado e financeiro lançado!",
      );
      if (obraCriada) {
        toast.success("Serviço externo enviado para o Flight Board.");
        queryClient.invalidateQueries({ queryKey: ["obras"] });
      }
      if (contaReceber > 0) {
        toast.warning(
          `Saldo de ${brl(contaReceber)} não quitado: título gerado em Contas a Receber.`,
        );
      }
      if (roteamento.baixados > 0) {
        toast.success(`Estoque baixado em ${roteamento.baixados} item(ns).`);
      }
      if (roteamento.ordensCriadas.length > 0) {
        toast.warning(
          `Itens sem saldo: ordem(ns) de compra ${roteamento.ordensCriadas.join(", ")} gerada(s) sob encomenda.`,
        );
      }
      if (aviso) toast.warning(aviso);

      // Venda concluída: impede o autosave de regravar e limpa a tela.
      finalizadoRef.current = true;
      setRascunhoVendaId(null);
      limparCampos();
      try {
        localStorage.removeItem(RASCUNHO_KEY);
        localStorage.removeItem(RASCUNHO_VENDA_KEY);
      } catch {
        /* armazenamento indisponível */
      }
      navigate({ to: "/vendas/$id", params: { id } });
    },

    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader title="Novo Pedido (PDV)" subtitle={`Pedido ${numero}`} />
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Rascunho salvo automaticamente</span>
          <Button variant="outline" size="sm" onClick={descartarRascunho}>
            Descartar rascunho
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <ExpandableCard>
            <CardHeader className="pr-12">
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
                      <SelectGroup>
                        <SelectLabel>Clientes</SelectLabel>
                        {clientes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nome}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Fornecedores</SelectLabel>
                        {fornecedores.map((f) => (
                          <SelectItem key={f.id} value={`for:${f.id}`}>
                            {f.nome}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Funcionários</SelectLabel>
                        {vendedores.map((f) => (
                          <SelectItem key={f.id} value={`fun:${f.id}`}>
                            {f.nome}
                          </SelectItem>
                        ))}
                      </SelectGroup>
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
          </ExpandableCard>

          <ExpandableCard className="overflow-hidden border-border">
            <CardHeader className="border-b border-border p-5 pr-12">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3 shrink-0">
                  <div className="h-8 w-1.5 rounded-full bg-primary" />
                  <CardTitle className="whitespace-nowrap text-xl tracking-tight">Itens do Pedido</CardTitle>
                </div>

                <div className="flex flex-1 items-center gap-3 lg:max-w-2xl">
                  <Field label="Produto" className="flex-1">
                    <div className="relative flex items-center gap-2">
                      <Popover open={produtoAberto} onOpenChange={setProdutoAberto}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={produtoAberto}
                            className="relative flex-1 justify-start bg-muted/50 pl-10 font-normal"
                          >
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <span className="truncate text-left">
                              {produtoSel
                                ? (() => {
                                    const p = produtos.find((x) => x.id === produtoSel);
                                    if (!p) return "Produto selecionado";
                                    return p.codigo ? `${p.codigo} - ${p.nome}` : p.nome;
                                  })()
                                : "Buscar produto por SKU ou nome..."}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[380px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Digite para buscar por SKU ou nome..." />
                            <CommandList>
                              <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                              <CommandGroup>
                                {produtos.map((p) => (
                                  <CommandItem
                                    key={p.id}
                                    value={`${p.codigo ?? ""} ${p.nome}`.toLowerCase()}
                                    onSelect={() => {
                                      setProdutoSel(p.id);
                                      setProdutoAberto(false);
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 size-4 ${produtoSel === p.id ? "opacity-100" : "opacity-0"}`}
                                    />
                                    {p.codigo ? `${p.codigo} - ${p.nome}` : p.nome}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <ProdutoRapidoDialog
                        iconOnly
                        onCreated={async (id) => {
                          await refetchProdutos();
                          setProdutoSel(id);
                        }}
                      />
                    </div>
                  </Field>
                  <Button onClick={adicionarItem} className="gap-2 bg-primary px-6 font-bold text-primary-foreground hover:bg-primary/90">
                    <Plus className="size-5" />
                    <span>Adicionar</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-0 p-0">
              <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="px-6 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">SKU</TableHead>
                      <TableHead className="px-6 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Descrição</TableHead>
                      <TableHead className="w-20 px-6 py-3 text-center text-[11px] uppercase tracking-wider text-muted-foreground">Qtd</TableHead>
                      <TableHead className="w-28 px-6 py-3 text-right text-[11px] uppercase tracking-wider text-muted-foreground">Vlr. Unit.</TableHead>
                      <TableHead className="w-24 px-6 py-3 text-center text-[11px] uppercase tracking-wider text-muted-foreground">Desc. (%)</TableHead>
                      <TableHead className="w-28 px-6 py-3 text-right text-[11px] uppercase tracking-wider text-muted-foreground">Desc. (R$)</TableHead>
                      <TableHead className="w-32 px-6 py-3 text-right text-[11px] uppercase tracking-wider text-muted-foreground">Total</TableHead>
                      <TableHead className="w-36 px-6 py-3 text-center text-[11px] uppercase tracking-wider text-muted-foreground">Status</TableHead>
                      <TableHead className="w-24 px-6 py-3 text-center text-[11px] uppercase tracking-wider text-muted-foreground">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/50">
                    {itens.map((i) => (
                      <TableRow key={i.key} className="group transition-colors hover:bg-muted/20">
                        <TableCell className="whitespace-nowrap px-6 py-4 text-xs font-mono text-muted-foreground">
                          {i.sku || "—"}
                        </TableCell>
                        <TableCell className="max-w-0 px-6 py-4">
                          <div className="truncate text-sm font-medium" title={i.descricao}>
                            {i.descricao}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <Input
                            type="number"
                            min={1}
                            className="h-8 w-16 border-border bg-muted/50 text-center text-white"
                            value={i.quantidade}
                            onChange={(e) => atualizarItem(i.key, { quantidade: num(e.target.value) || 1 })}
                          />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <MoedaInput
                            value={i.preco_unitario}
                            onChange={(n) => atualizarItem(i.key, { preco_unitario: n })}
                            className="h-8 w-28 border-border bg-muted/50 text-right text-white"
                          />
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="0,00"
                            className="h-8 w-20 border-border bg-muted/50 text-center text-white"
                            value={descontoPctInputs[i.key] ?? (i.desconto_pct ? i.desconto_pct.toString() : "")}
                            onChange={(e) => {
                              const raw = e.target.value;
                              setDescontoPctInputs((prev) => ({ ...prev, [i.key]: raw }));
                              const pct = Math.min(parseMoedaInput(raw), 100);
                              atualizarItem(i.key, { desconto_pct: pct });
                            }}
                            onBlur={(e) => {
                              const pct = Math.min(parseMoedaInput(e.target.value), 100);
                              setDescontoPctInputs((prev) => ({ ...prev, [i.key]: pct ? pct.toFixed(2) : "" }));
                              atualizarItem(i.key, { desconto_pct: pct });
                            }}
                          />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <MoedaInput
                            value={i.desconto_valor}
                            onChange={(n) => {
                              const max = subtotalBrutoItem(i);
                              atualizarItem(i.key, { desconto_valor: Math.min(n, max) });
                            }}
                            className="h-8 w-24 border-border bg-muted/50 text-right text-white"
                          />
                        </TableCell>
                        <TableCell className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="font-bold text-primary">{brl(totalItem(i))}</div>
                          {descontoTotalItem(i) > 0 && (
                            <div className="text-xs text-destructive">
                              -{brl(descontoTotalItem(i))} desc.
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          {i.sob_encomenda ? (
                            <span className="inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/15 px-2.5 py-1 text-[11px] font-medium text-sky-500">
                              Encomendado
                            </span>
                          ) : i.estoque_atual < i.quantidade ? (
                            <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-1 text-[11px] font-medium text-amber-500">
                              Encomendado
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-500">
                              Em estoque
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                const produto = produtos.find((p) => p.id === i.produto_id);
                                if (produto) {
                                  setProdutoSel(i.produto_id ?? "");
                                }
                                toast.info(`Edição do item: ${i.descricao}. Alterações podem ser feitas diretamente nos campos da linha.`);
                              }}
                              className="size-8 rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary group-hover:bg-muted/50"
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removerItem(i.key)}
                              className="size-8 rounded-full border border-border text-muted-foreground hover:border-destructive hover:text-destructive group-hover:bg-muted/50"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {itens.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                          Nenhum item adicionado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-8 border-t border-border bg-muted/20 p-6">
                <div className="text-right">
                  <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">Subtotal</p>
                  <p className="text-xl font-medium text-foreground">{brl(itens.reduce((s, i) => s + subtotalBrutoItem(i), 0))}</p>
                </div>
                <div className="text-right">
                  <p className="mb-1 text-xs uppercase tracking-widest text-primary">Descontos</p>
                  <p className="text-xl font-medium text-primary">- {brl(itens.reduce((s, i) => s + descontoTotalItem(i), 0))}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 px-6 py-3 text-right">
                  <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">Subtotal de produtos</p>
                  <p className="text-2xl font-bold tracking-tight text-foreground">{brl(subtotalProdutos)}</p>
                </div>
              </div>
            </CardContent>
          </ExpandableCard>

          {tipoAtendimento === "out" && (
          <ExpandableCard>
            <CardHeader className="pr-12">
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

              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <Field label="Tabela de custos do fabricante">
                  <Select value={modeloTabela} onValueChange={aplicarTabela}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o modelo da tabela" />
                    </SelectTrigger>
                    <SelectContent>
                      {tabelaFabricante.map((t) => (
                        <SelectItem key={t.id} value={t.modelo}>
                          {t.modelo} — {brl(num(t.preco_venda))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <p className="mt-2 text-xs text-muted-foreground">
                  Ao escolher o modelo, os custos de casco, filtro, frete, mão de obra e imposto são
                  preenchidos automaticamente, junto com o preço de venda sugerido. Você pode
                  ajustar qualquer valor depois.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Custo do casco">
                  <MoedaInput value={custoCascoFinal} onChange={setCustoCasco} />
                </Field>
                <Field label="Custo do filtro">
                  <MoedaInput value={custoFiltroFinal} onChange={setCustoFiltro} />
                </Field>
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
          </ExpandableCard>
          )}


          <ExpandableCard>
            <CardHeader className="pr-12">
              <CardTitle>Condições de pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 rounded-md border border-border bg-muted/30 p-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Valor total do pedido</Label>
                  <Input value={brl(valorTotal)} disabled className="font-semibold" />
                </div>
                <Field label="Entrada">
                  <MoedaInput value={entrada} onChange={atualizarEntrada} />
                </Field>
                <div className="space-y-2">
                  <Label>Saldo</Label>
                  <Input value={brl(saldoAposEntrada)} disabled className="font-semibold" />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Conta que recebe a entrada">
                  <Input
                    list="contas-bancarias-opcoes"
                    placeholder="Selecione ou digite a conta"
                    value={contaEntrada}
                    onChange={(e) => setContaEntrada(e.target.value)}
                  />
                </Field>
                <div className="flex items-end">
                  <Button className="w-full md:w-auto" onClick={adicionarCondicao}>
                    <Plus /> Nova condição
                  </Button>
                </div>
              </div>

              {condicoes.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma condição informada. A entrada já foi abatida; adicione as parcelas do saldo.
                </p>
              )}

              {condicoes.map((c, idx) => (
                <div key={c.key} className="rounded-md border border-border p-4">
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

                  <div className="grid gap-3 lg:grid-cols-[minmax(260px,1.4fr)_minmax(200px,1fr)_minmax(180px,0.8fr)]">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Field label="Parcelas">
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="1"
                          value={c.parcelas || ""}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === "") {
                              atualizarCondicao(c.key, { parcelas: "" });
                              return;
                            }
                            const n = Number(raw);
                            if (!Number.isFinite(n)) return;
                            const parcelas = Math.min(48, Math.max(1, n));
                            atualizarCondicao(c.key, {
                              parcelas,
                              valor_parcela: cobradoCondicao(c) / parcelas,
                            });
                          }}
                        />
                      </Field>
                      <Field label="Valor da parcela">
                        <MoedaInput
                          value={c.valor_parcela}
                          onChange={(valor_parcela) => atualizarCondicao(c.key, { valor_parcela })}
                        />
                      </Field>
                      <Field label="Valor abatido">
                        <MoedaInput
                          value={c.valor}
                          onChange={(valor) => {
                            const parcelas = parcelasNum(c.parcelas);
                            const juros = acrescimoCondicao(c);
                            atualizarCondicao(c.key, {
                              valor,
                              valor_parcela: (valor + juros) / parcelas,
                            });
                          }}
                        />
                      </Field>
                    </div>

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

                    <Field label="Status">
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
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <Field label="Data prevista">
                      <Input
                        type="date"
                        value={c.data_prevista}
                        onChange={(e) => atualizarCondicao(c.key, { data_prevista: e.target.value })}
                      />
                    </Field>
                    <Field label="Conta que recebe o recurso">
                      <Input
                        list="contas-bancarias-opcoes"
                        placeholder="Selecione ou digite a conta"
                        value={c.conta_bancaria}
                        onChange={(e) => atualizarCondicao(c.key, { conta_bancaria: e.target.value })}
                      />
                    </Field>
                    <Field label="Cartão / identificação">
                      <Input
                        placeholder="Ex.: Visa maquininha"
                        value={c.bandeira}
                        onChange={(e) => atualizarCondicao(c.key, { bandeira: e.target.value })}
                      />
                    </Field>
                  </div>

                  <div className="mt-4 border-t border-border pt-3">
                    <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
                      Informações preliminares — apenas informativo
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <Field label="Total das parcelas">
                        <MoedaInput
                          value={Number(cobradoCondicao(c).toFixed(2))}
                          onChange={(cobrado) =>
                            atualizarCondicao(c.key, {
                              valor_parcela: cobrado / parcelasNum(c.parcelas),
                            })
                          }
                        />
                      </Field>
                      <Field label="Juros">
                        <MoedaInput
                          value={Number(acrescimoCondicao(c).toFixed(2))}
                          onChange={(juros) =>
                            atualizarCondicao(c.key, {
                              valor_parcela: (c.valor + juros) / parcelasNum(c.parcelas),
                            })
                          }
                        />
                      </Field>
                      <Field label="Observações" className="sm:col-span-2">
                        <Input
                          placeholder="Informações adicionais da condição"
                          value={c.observacoes}
                          onChange={(e) => atualizarCondicao(c.key, { observacoes: e.target.value })}
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              ))}

              <div className="grid gap-3 border-t border-border pt-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">Total das condições</p>
                  <p className="font-semibold">{brl(totalAplicado)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Saldo sem condição</p>
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
                  <p className="text-muted-foreground">Juros informativos</p>
                  <p className="font-semibold">{brl(totalJuros)}</p>
                </div>
              </div>

              <datalist id="contas-bancarias-opcoes">
                {contasBancarias.map((nome) => (
                  <option key={nome} value={nome} />
                ))}
              </datalist>

              <Field label="Observações do pedido">
                <Textarea
                  rows={3}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
              </Field>
            </CardContent>
          </ExpandableCard>

          <ExpandableCard>
            <CardHeader>
              <CardTitle>Entrega e material de obra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Prazo de entrega">
                  <Input
                    value={prazoEntrega}
                    onChange={(e) => setPrazoEntrega(e.target.value)}
                    placeholder="Ex.: 30 dias após faturamento"
                  />
                </Field>
                <Field label="Endereço de instalação">
                  <Input
                    value={enderecoInstalacao}
                    onChange={(e) => setEnderecoInstalacao(e.target.value)}
                    placeholder="Se diferente do endereço do cliente"
                  />
                </Field>
              </div>

              <div className="flex items-center gap-3">
                <Dialog open={materiaisAberto} onOpenChange={setMateriaisAberto}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      <Plus /> Material a solicitar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Material a ser solicitado</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { chave: "areia_m3", rotulo: "Areia (m³)" },
                        { chave: "cimento_sc", rotulo: "Cimento (sc)" },
                        { chave: "blocos_un", rotulo: "Blocos (un.)" },
                        { chave: "agua_m3", rotulo: "Água (m³)" },
                        { chave: "fios_eletrodutos", rotulo: "Fios e eletrodutos" },
                      ].map((m) => (
                        <Field key={m.chave} label={m.rotulo}>
                          <Input
                            value={materiais[m.chave] ?? ""}
                            onChange={(e) =>
                              setMateriais((prev) => ({ ...prev, [m.chave]: e.target.value }))
                            }
                            placeholder="Quantidade"
                          />
                        </Field>
                      ))}
                    </div>
                    <div className="space-y-3 border-t pt-4">
                      <div className="flex items-center justify-between gap-3">
                        <Label>Outros materiais</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          title="Adicionar outro material"
                          aria-label="Adicionar outro material"
                          onClick={() =>
                            setMateriaisExtras((prev) => [
                              ...prev,
                              { id: crypto.randomUUID(), nome: "", quantidade: "" },
                            ])
                          }
                        >
                          <Plus />
                        </Button>
                      </div>
                      {materiaisExtras.map((item) => (
                        <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_8rem_auto] gap-2">
                          <Input
                            value={item.nome}
                            onChange={(e) =>
                              setMateriaisExtras((prev) =>
                                prev.map((atual) =>
                                  atual.id === item.id ? { ...atual, nome: e.target.value } : atual,
                                ),
                              )
                            }
                            placeholder="Nome do material"
                            aria-label="Nome do material"
                          />
                          <Input
                            value={item.quantidade}
                            onChange={(e) =>
                              setMateriaisExtras((prev) =>
                                prev.map((atual) =>
                                  atual.id === item.id ? { ...atual, quantidade: e.target.value } : atual,
                                ),
                              )
                            }
                            placeholder="Quantidade"
                            aria-label={`Quantidade de ${item.nome || "material"}`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Remover material"
                            aria-label="Remover material"
                            onClick={() =>
                              setMateriaisExtras((prev) => prev.filter((atual) => atual.id !== item.id))
                            }
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <DialogFooter>
                      <Button type="button" onClick={() => setMateriaisAberto(false)}>
                        Salvar quantidades
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <p className="text-sm text-muted-foreground">
                  {materiaisPreenchidos > 0
                    ? `${materiaisPreenchidos} item(ns) de material informado(s).`
                    : "Nenhum material informado ainda."}
                </p>
              </div>
            </CardContent>
          </ExpandableCard>

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              size="lg"
              variant="outline"
              onClick={() => salvar.mutate("pedido")}
              disabled={salvar.isPending}
            >
              Salvar pedido
            </Button>
            <Button size="lg" onClick={() => salvar.mutate("venda")} disabled={salvar.isPending}>
              Vender
            </Button>
          </div>
          <p className="text-right text-xs text-muted-foreground">
            "Vender" confirma a venda; se o total não for quitado, o saldo vira título em Contas a
            Receber automaticamente.
          </p>
        </div>

        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Resumo do Kit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {modeloTabela && (
                <p className="text-xs text-muted-foreground">Tabela: {modeloTabela}</p>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Casco</span>
                <span>{brl(custoCascoFinal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Filtro</span>
                <span>{brl(custoFiltroFinal)}</span>
              </div>
              {custoAcessorios > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Acessórios</span>
                  <span>{brl(custoAcessorios)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frete</span>
                <span>{brl(custoFrete)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mão de obra</span>
                <span>{brl(custoMaoObra)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Imposto</span>
                <span>{brl(impostosKit)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-muted-foreground">Custo total do kit</span>
                <span className="font-medium">{brl(custoTotalKit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lucro no pedido</span>
                <span className="font-medium">{brl(precoVendaKit - custoTotalKit)}</span>
              </div>
              {lucroSugerido > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lucro sugerido (fabricante)</span>
                  <span>{brl(lucroSugerido)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Preço de venda</span>
                <span className="font-medium">{brl(precoVendaKit)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
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
                <span className="text-muted-foreground">
                  Kit piscina (prévia — não soma ao total)
                </span>
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
