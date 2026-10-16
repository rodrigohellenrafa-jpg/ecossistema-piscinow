import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Ban,
  Boxes,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  ExternalLink,
  Eye,
  EyeOff,
  Factory,
  FileText,
  Filter,
  Layers,
  Link2,
  Mail,
  Maximize2,
  MessageSquare,
  Minimize2,
  Package,
  Pencil,
  Plus,
  Printer,
  Save,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
  Unlink,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/field";
import { PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ComprovanteAnexo } from "@/components/comprovante-anexo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ExpandableCard } from "@/components/expandable-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
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
import { DocumentoOrdemCompra, gerarPdfOrdemCompra } from "@/components/documento-ordem-compra";
import { BotaoVisualizarDocumento } from "@/components/visualizador-documento-modal";
import { ModalPedirCarga } from "@/components/modal-pedir-carga";
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
  "comprado",
  "enviada",
  "faturada",
  "concluida",
  "recebida",
  "cancelada",
] as const;

const statusLabel: Record<string, string> = {
  sob_encomenda: "Sob encomenda",
  pendente: "A comprar",
  comprado: "Comprado",
  enviada: "Enviada ao fornecedor",
  faturada: "Faturada pelo fornecedor",
  concluida: "Entregue",
  recebida: "Finalizada (baixada)",
  cancelada: "Cancelada",
};


/** Ordem das etapas do fluxo da O.C. */
const FLUXO = ["pendente", "comprado", "enviada", "faturada", "concluida"] as const;

const etapaAtual = (s: string) => {
  if (s === "sob_encomenda") return 0;
  if (s === "recebida") return 4;
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
  carga_id?: string | null;
  status_carga?: string | null;
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
  cor: string | null;
  pastilha: string | null;
  carga_id?: string | null;
  status_carga?: string | null;
};

type NotaOrdem = {
  id: string;
  ordem_id: string;
  numero_nf: string | null;
  valor: number;
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
  venda_vinculo_id: string | null;
  estoque_atual?: number;
  estoque_minimo?: number;
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
  venda_id?: string | null;
  numero_nf?: string | null;
  cor: string;
  pastilha: string;
};

const novoItemVazio = {
  produto_id: "",
  quantidade: "1",
  valor_unitario: "0",
  desconto: "0",
  cliente_id: SEM_CLIENTE,
  cor: "",
  pastilha: "",
};

function OrdensCompra() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [abaVisao, setAbaVisao] = useState<"fornecedores" | "grade" | "executadas">("fornecedores");
  const [filtroVinculo, setFiltroVinculo] = useState<"todos" | "com_vinculo" | "sem_vinculo">("com_vinculo");
  const [filtroNecessidade, setFiltroNecessidade] = useState<"precisa_comprar" | "todos">("precisa_comprar");
  const [filtroExibicaoCatalogo, setFiltroExibicaoCatalogo] = useState<
    "apenas_vinculados_selecionados" | "catalogo_completo"
  >("apenas_vinculados_selecionados");
  const [ocultarJaComprados, setOcultarJaComprados] = useState(true);
  const [linhasExpandidas, setLinhasExpandidas] = useState<Record<string, boolean>>({});
  const [ordensExpandidas, setOrdensExpandidas] = useState<Record<string, boolean>>({});
  const [fornecedoresRecolhidos, setFornecedoresRecolhidos] = useState<Record<string, boolean>>({});
  const [filtroFornecedor, setFiltroFornecedor] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todas");
  const [buscaFornecedor, setBuscaFornecedor] = useState("");
  const [detalheId, setDetalheId] = useState<string | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [modalDetalheMaximized, setModalDetalheMaximized] = useState(false);
  const [novaOpen, setNovaOpen] = useState(false);
  const [modalPedirCargaAberto, setModalPedirCargaAberto] = useState(false);
  const [fornecedorCargaSelecionado, setFornecedorCargaSelecionado] = useState<string | null>(null);
  const [itensCargaIniciais, setItensCargaIniciais] = useState<string[]>([]);
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
  const [vinculosSelecionadosCompra, setVinculosSelecionadosCompra] = useState<
    Record<string, Record<number, boolean>>
  >({});
  const [selecionadosExecutados, setSelecionadosExecutados] = useState<Record<string, boolean>>({});
  const [usarCreditoFabricante, setUsarCreditoFabricante] = useState(false);
  const [creditoFabricante, setCreditoFabricante] = useState("");
  const [creditoDisponivelInput, setCreditoDisponivelInput] = useState<string | null>(null);

  // Sincronização em tempo real para ordens e itens de compra
  useEffect(() => {
    const canal = supabase
      .channel("realtime-ordens-compra-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ordens_compra" },
        () => {
          qc.invalidateQueries({ queryKey: ["ordens_compra"] });
          qc.invalidateQueries({ queryKey: ["ordem_compra_itens"] });
          qc.invalidateQueries({ queryKey: ["produtos"] });
          qc.invalidateQueries({ queryKey: ["produtos", "lista-simples"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ordem_compra_itens" },
        () => {
          qc.invalidateQueries({ queryKey: ["ordem_compra_itens"] });
          qc.invalidateQueries({ queryKey: ["ordens_compra"] });
          qc.invalidateQueries({ queryKey: ["produtos"] });
          qc.invalidateQueries({ queryKey: ["produtos", "lista-simples"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [qc]);

  const isVinculoSelecionado = useCallback(
    (produtoId: string, indice: number) => {
      const prodSel = vinculosSelecionadosCompra[produtoId];
      if (prodSel !== undefined && prodSel[indice] !== undefined) {
        return prodSel[indice];
      }
      return selecionadosCompra[produtoId] === true;
    },
    [vinculosSelecionadosCompra, selecionadosCompra],
  );

  const alternarSelecaoVinculo = useCallback(
    (produtoId: string, indice: number, totalVinculos: number) => {
      setVinculosSelecionadosCompra((prev) => {
        const atual = prev[produtoId] ?? {};
        const mapa: Record<number, boolean> = {};
        for (let i = 0; i < totalVinculos; i++) {
          mapa[i] = atual[i] !== undefined ? atual[i] : (selecionadosCompra[produtoId] === true);
        }
        mapa[indice] = !mapa[indice];
        const algumMarcado = Object.values(mapa).some(Boolean);
        setSelecionadosCompra((sPrev) => ({
          ...sPrev,
          [produtoId]: algumMarcado,
        }));
        return { ...prev, [produtoId]: mapa };
      });
    },
    [selecionadosCompra],
  );

  const alternarSelecaoProdutoPai = useCallback(
    (produtoId: string, marcado: boolean, totalVinculos: number) => {
      setSelecionadosCompra((prev) => ({
        ...prev,
        [produtoId]: marcado,
      }));
      setVinculosSelecionadosCompra((prev) => {
        const mapa: Record<number, boolean> = {};
        for (let i = 0; i < totalVinculos; i++) {
          mapa[i] = marcado;
        }
        return { ...prev, [produtoId]: mapa };
      });
    },
    [],
  );

  const [quantidadesCompra, setQuantidadesCompra] = useState<Record<string, string>>({});
  const [valoresCompra, setValoresCompra] = useState<Record<string, string>>({});
  const [percentuaisCompra, setPercentuaisCompra] = useState<Record<string, string>>({});
  const [coresCompra, setCoresCompra] = useState<Record<string, string>>({});
  const [modelosCompra, setModelosCompra] = useState<Record<string, string>>({});
  const [statusCompra, setStatusCompra] = useState<Record<string, string>>({});
  const [vinculosCompra, setVinculosCompra] = useState<Record<string, string[]>>({});
  const salvamentosPendentes = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [produtoCompraEditando, setProdutoCompraEditando] = useState<Produto | null>(null);
  const [produtoCompraForm, setProdutoCompraForm] = useState({
    codigo: "",
    nome: "",
    categoria: "",
    unidade: "UN",
    preco_custo: "0",
    fornecedor_id: SEM_CLIENTE,
    ncm: "",
    cst: "",
  });

  const { data: ordens = [] } = useQuery({
    queryKey: ["ordens_compra"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordens_compra")
        .select("*")
        .order("data_pedido", { ascending: false })
        .order("created_at", { ascending: false });
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

  /** Garante que Analândia e Progeu estejam sempre presentes na lista de fornecedores */
  const fornecedoresCompletos = useMemo(() => {
    const lista = [...fornecedores];
    const temAnalandia = lista.some(
      (f) => normalizar(f.nome).includes("analandia") || normalizar(f.nome).includes("analândia"),
    );
    if (!temAnalandia) {
      lista.unshift({ id: "analandia", nome: "Analândia" });
    }
    const temProgeu = lista.some((f) => normalizar(f.nome).includes("progeu"));
    if (!temProgeu) {
      lista.push({ id: "progeu", nome: "Progeu" });
    }
    return lista;
  }, [fornecedores]);

  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos", "lista-simples"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("id, codigo, nome, categoria, tipo, unidade, ncm, cst, preco_custo, fornecedor_id, cor_pastilha, modelo_pastilha, quantidade_compra, desconto_compra, status_compra, venda_vinculo_id, estoque_atual, estoque_minimo")
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

  /** Pagamentos registrados para a ordem aberta. */
  const { data: pagamentosOrdem = [] } = useQuery({
    queryKey: ["ordem_compra_pagamentos", detalheId],
    enabled: !!detalheId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordem_compra_pagamentos")
        .select("*")
        .eq("ordem_id", detalheId!)
        .order("data_pagamento", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  /** Notas fiscais lançadas na ordem aberta (meia nota / múltiplas notas). */
  const notasOrdem = useQuery({
    queryKey: ["ordem_compra_notas", detalheId],
    enabled: !!detalheId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("ordem_compra_notas")
        .select("*")
        .eq("ordem_id", detalheId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as NotaOrdem[];
    },
  });

  const { data: pagamentosTodasOrdens = [] } = useQuery({
    queryKey: ["ordem_compra_pagamentos", "todas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordem_compra_pagamentos")
        .select("id, ordem_id, valor");
      if (error) throw error;
      return data;
    },
  });

  const { data: contasBancarias = [] } = useQuery({
    queryKey: ["saldos_bancarios", "contas-ordens"],
    queryFn: async () => {
      const { data, error } = await supabase.from("saldos_bancarios").select("conta").order("conta");
      if (error) throw error;
      return Array.from(new Set((data ?? []).map((c) => c.conta))).filter(Boolean);
    },
  });

  const [novoPagamento, setNovoPagamento] = useState({
    data_pagamento: hojeISO(),
    forma_pagamento: "Pix",
    conta_bancaria: "",
    valor: "",
    observacoes: "",
    comprovante_path: null as string | null,
  });
  const [editPagamentoId, setEditPagamentoId] = useState<string | null>(null);
  const [ordemParaBaixar, setOrdemParaBaixar] = useState<Ordem | null>(null);
  const [baixaCompra, setBaixaCompra] = useState({
    data_pagamento: hojeISO(),
    conta_bancaria: "",
    valor: "",
    comprovante_path: null as string | null,
  });

  const totalPagoOrdem = pagamentosOrdem.reduce((s, p) => s + Number(p.valor ?? 0), 0);

  const totaisPagosPorOrdem = useMemo(() => {
    const totais = new Map<string, number>();
    for (const pagamento of pagamentosTodasOrdens) {
      totais.set(
        pagamento.ordem_id,
        (totais.get(pagamento.ordem_id) ?? 0) + Number(pagamento.valor ?? 0),
      );
    }
    return totais;
  }, [pagamentosTodasOrdens]);

  const sincronizarValorPago = async (ordemId: string) => {
    const { data } = await supabase
      .from("ordem_compra_pagamentos")
      .select("valor")
      .eq("ordem_id", ordemId);
    const soma = (data ?? []).reduce((s, p) => s + Number(p.valor ?? 0), 0);
    await supabase.from("ordens_compra").update({ valor_pago: soma }).eq("id", ordemId);
  };

  const salvarPagamento = useMutation({
    mutationFn: async () => {
      if (!detalheId) throw new Error("Ordem não encontrada");
      const valor = Number(novoPagamento.valor);
      if (!Number.isFinite(valor) || valor === 0) throw new Error("Informe o valor do pagamento");
      if (!novoPagamento.conta_bancaria)
        throw new Error("Escolha a conta de onde o dinheiro saiu");
      if ((novoPagamento.data_pagamento || hojeISO()) > hojeISO())
        throw new Error(
          "Pagamento com data futura (ex.: boleto a vencer) não é pagamento realizado. Deixe o valor em aberto em Contas a Pagar e registre aqui só quando pagar.",
        );
      const payload = {
        ordem_id: detalheId,
        data_pagamento: novoPagamento.data_pagamento || hojeISO(),
        forma_pagamento: novoPagamento.forma_pagamento,
        conta_bancaria: novoPagamento.conta_bancaria || null,
        valor,
        observacoes: novoPagamento.observacoes || null,
        comprovante_path: novoPagamento.comprovante_path,
      };
      if (editPagamentoId) {
        const { error } = await supabase
          .from("ordem_compra_pagamentos")
          .update(payload)
          .eq("id", editPagamentoId);
        if (error) throw error;
      } else {
        const { data: auth } = await supabase.auth.getUser();
        const { error } = await supabase
          .from("ordem_compra_pagamentos")
          .insert({ ...payload, created_by: auth.user?.id ?? null });
        if (error) throw error;
      }
      await sincronizarValorPago(detalheId);
    },
    onSuccess: () => {
      toast.success(editPagamentoId ? "Pagamento atualizado" : "Pagamento registrado");
      setEditPagamentoId(null);
      setNovoPagamento({
        data_pagamento: hojeISO(),
        forma_pagamento: "Pix",
        conta_bancaria: "",
        valor: "",
        observacoes: "",
        comprovante_path: null,
      });
      qc.invalidateQueries({ queryKey: ["ordem_compra_pagamentos"] });
      qc.invalidateQueries({ queryKey: ["ordens_compra"] });
      qc.invalidateQueries({ queryKey: ["contas"] });
      qc.invalidateQueries({ queryKey: ["lancamentos_financeiros"] });
      qc.invalidateQueries({ queryKey: ["saldos-bancarios"] });
      qc.invalidateQueries({ queryKey: ["saldos-bancarios-select"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const excluirPagamento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ordem_compra_pagamentos").delete().eq("id", id);
      if (error) throw error;
      if (detalheId) await sincronizarValorPago(detalheId);
    },
    onSuccess: () => {
      toast.success("Pagamento excluído");
      qc.invalidateQueries({ queryKey: ["ordem_compra_pagamentos"] });
      qc.invalidateQueries({ queryKey: ["ordens_compra"] });
      qc.invalidateQueries({ queryKey: ["contas"] });
      qc.invalidateQueries({ queryKey: ["lancamentos_financeiros"] });
      qc.invalidateQueries({ queryKey: ["saldos-bancarios"] });
      qc.invalidateQueries({ queryKey: ["saldos-bancarios-select"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const abrirBaixaCompra = (ordem: Ordem) => {
    const pago = totaisPagosPorOrdem.get(ordem.id) ?? Number(ordem.valor_pago ?? 0);
    const saldo = Math.max(Number(ordem.valor_total ?? 0) - pago, 0);
    if (saldo <= 0) {
      atualizarStatus.mutate({ id: ordem.id, status: "comprado" });
      return;
    }
    setOrdemParaBaixar(ordem);
    setBaixaCompra({
      data_pagamento: hojeISO(),
      conta_bancaria: "",
      valor: String(saldo),
      comprovante_path: null,
    });
  };

  const baixarCompra = useMutation({
    mutationFn: async () => {
      if (!ordemParaBaixar) throw new Error("Ordem não encontrada");
      const valor = Number(baixaCompra.valor);
      if (!Number.isFinite(valor) || valor <= 0) throw new Error("Informe o valor pago");
      if (!baixaCompra.conta_bancaria) throw new Error("Escolha a conta de onde o dinheiro saiu");
      const { data: pagos } = await supabase
        .from("ordem_compra_pagamentos")
        .select("valor")
        .eq("ordem_id", ordemParaBaixar.id);
      const jaPago = (pagos ?? []).reduce((s, p) => s + Number(p.valor ?? 0), 0);
      const saldoAtual = Number(ordemParaBaixar.valor_total ?? 0) - jaPago;
      if (saldoAtual <= 0.009) throw new Error("Esta ordem já foi paga. Nenhuma nova baixa foi feita.");
      if (valor - saldoAtual > 0.009)
        throw new Error(`O valor passa do que falta pagar (${saldoAtual.toFixed(2).replace(".", ",")}).`);
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("ordem_compra_pagamentos").insert({
        ordem_id: ordemParaBaixar.id,
        data_pagamento: baixaCompra.data_pagamento || hojeISO(),
        forma_pagamento: "Baixa ao marcar como comprado",
        conta_bancaria: baixaCompra.conta_bancaria,
        valor,
        observacoes: "Baixa automática pelo status Comprado",
        comprovante_path: baixaCompra.comprovante_path,
        created_by: auth.user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Compra baixada e saldo da conta atualizado");
      setOrdemParaBaixar(null);
      qc.invalidateQueries({ queryKey: ["ordens_compra"] });
      qc.invalidateQueries({ queryKey: ["ordem_compra_pagamentos"] });
      qc.invalidateQueries({ queryKey: ["contas"] });
      qc.invalidateQueries({ queryKey: ["saldos-bancarios"] });
      qc.invalidateQueries({ queryKey: ["saldos-bancarios-select"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const alterarStatusOrdem = (ordem: Ordem, status: string) => {
    if (status === "comprado") {
      abrirBaixaCompra(ordem);
      return;
    }
    atualizarStatus.mutate({ id: ordem.id, status });
  };




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
        .select("id, numero, cliente_id, cliente_nome, status_pedido")
        .order("numero");
      if (error) throw error;
      return data as {
        id: string;
        numero: string | null;
        cliente_id: string | null;
        cliente_nome: string | null;
        status_pedido: string | null;
      }[];
    },
  });

  /** Itens de pedidos que consomem cada produto (demanda por pedido). */
  const { data: consumoItens = [] } = useQuery({
    queryKey: ["venda_itens", "consumo-compras"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venda_itens")
        .select("produto_id, quantidade, venda_id");
      if (error) throw error;
      return data as { produto_id: string | null; quantidade: number; venda_id: string }[];
    },
  });

  /** Kits e combos de vendas para desmembramento automático de cascos e acessórios na fila. */
  const { data: kitsVendas = [] } = useQuery({
    queryKey: ["venda_kit", "consumo-compras"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venda_kit")
        .select("id, venda_id, casco_id, filtro_id, acessorios");
      if (error) throw error;
      return (data ?? []) as {
        id: string;
        venda_id: string;
        casco_id: string | null;
        filtro_id: string | null;
        acessorios: { produto_id?: string; nome?: string; valor?: number }[] | null;
      }[];
    },
  });

  const vendaPorId = useMemo(() => {
    const m = new Map<
      string,
      {
        numero: string | null;
        cliente_id: string | null;
        cliente_nome: string | null;
        status_pedido: string | null;
      }
    >();
    for (const v of vendasVinculo) m.set(v.id, v);
    return m;
  }, [vendasVinculo]);

  /** Informações consolidadas sobre itens e vínculos que já tiveram Ordem de Compra gerada, foram faturados/comprados ou estão em lotes anteriores. */
  const itensCompradosInfo = useMemo(() => {
    const mapaOrdens = new Map<string, Ordem>();
    for (const o of ordens) mapaOrdens.set(o.id, o);

    // Quantidade já comprada por par (produto_id, venda_id)
    const qtdCompradaPorProdutoVenda = new Map<string, number>();
    // Quantidade total já comprada por produto_id
    const qtdTotalCompradaPorProduto = new Map<string, number>();
    // Conjunto de IDs de produtos com ordem gerada em ordens ativas (não-canceladas)
    const produtosComOrdemGerada = new Set<string>();
    // Conjunto de IDs de produtos faturados ou concluídos
    const produtosFaturadosOuConcluidos = new Set<string>();
    // Conjunto de IDs de produtos comprados ou consolidados em lotes/cargas anteriores
    const produtosEmCargasAnteriores = new Set<string>();
    // Conjunto de IDs de produtos finalizados (ordem concluída/recebida)
    const produtosFinalizados = new Set<string>();

    for (const it of itensTodos) {
      if (!it.produto_id) continue;
      const ordem = mapaOrdens.get(it.ordem_id);
      // Desconsidera ordens canceladas no histórico
      if (ordem && ordem.status === "cancelada") continue;

      const qtd = Number(it.quantidade ?? 1);
      produtosComOrdemGerada.add(it.produto_id);

      if (
        ordem &&
        (ordem.status === "recebida" ||
          ordem.status === "concluida" ||
          ordem.status === "finalizada")
      ) {
        produtosFinalizados.add(it.produto_id);
      }

      // Itens já consolidados em carga/lote anterior
      if (
        it.carga_id ||
        it.status_carga === "em_carga" ||
        it.status_carga === "em_transito" ||
        it.status_carga === "entregue" ||
        (ordem as any)?.carga_id
      ) {
        produtosEmCargasAnteriores.add(it.produto_id);
      }

      if (
        it.numero_nf ||
        (ordem &&
          (ordem.status === "faturada" ||
            ordem.status === "entregue" ||
            ordem.status === "concluida" ||
            ordem.status === "recebida" ||
            ordem.status === "comprado" ||
            Boolean(ordem.faturada_em)))
      ) {
        produtosFaturadosOuConcluidos.add(it.produto_id);
      }

      const totalAnt = qtdTotalCompradaPorProduto.get(it.produto_id) ?? 0;
      qtdTotalCompradaPorProduto.set(it.produto_id, totalAnt + qtd);

      const vendaIdEfetiva =
        it.venda_id ||
        (it.cliente_id
          ? vendasVinculo.find((v) => v.cliente_id === it.cliente_id)?.id
          : null);
      if (vendaIdEfetiva) {
        const chave = `${it.produto_id}::${vendaIdEfetiva}`;
        const ant = qtdCompradaPorProdutoVenda.get(chave) ?? 0;
        qtdCompradaPorProdutoVenda.set(chave, ant + qtd);
      }
    }

    return {
      qtdCompradaPorProdutoVenda,
      qtdTotalCompradaPorProduto,
      produtosComOrdemGerada,
      produtosFaturadosOuConcluidos,
      produtosEmCargasAnteriores,
      produtosFinalizados,
    };
  }, [itensTodos, ordens, vendasVinculo]);

  /** Demanda consolidada PENDENTE: apenas pedidos de venda ativos que ainda NÃO tiveram ordem de compra gerada e que não foram entregues/instalados/concluídos. Desmembra combos de venda_kit automaticamente. */
  const demandaPorProduto = useMemo(() => {
    const mapa = new Map<
      string,
      { total: number; pedidos: { id: string; rotulo: string; quantidade: number }[] }
    >();

    const paresProcessados = new Set<string>();

    for (const item of consumoItens) {
      if (!item.produto_id) continue;
      const quantidadeTotal = Number(item.quantidade ?? 0);
      if (quantidadeTotal <= 0) continue;

      paresProcessados.add(`${item.produto_id}::${item.venda_id}`);

      const venda = vendaPorId.get(item.venda_id);
      // Oculta automaticamente itens de pedidos já entregues, instalados, concluídos, cancelados ou orçamento
      const statusVenda = (venda?.status_pedido || "").toLowerCase().trim();
      if (
        statusVenda === "entregue" ||
        statusVenda === "instalado" ||
        statusVenda === "instalada" ||
        statusVenda === "concluido" ||
        statusVenda === "concluida" ||
        statusVenda === "cancelado" ||
        statusVenda === "cancelada" ||
        statusVenda === "orcamento"
      ) {
        continue;
      }

      // Abate o que já teve Ordem de Compra gerada para esta venda específica
      const chave = `${item.produto_id}::${item.venda_id}`;
      const jaComprado = itensCompradosInfo.qtdCompradaPorProdutoVenda.get(chave) ?? 0;
      const quantidadePendente = Math.max(0, quantidadeTotal - jaComprado);

      // Se já foi totalmente pedido/comprado, não há demanda pendente para esta venda
      if (quantidadePendente <= 0) continue;

      const atual = mapa.get(item.produto_id) ?? { total: 0, pedidos: [] };
      const rotulo = `${venda?.numero ?? "Pedido"} — ${venda?.cliente_nome ?? "Cliente"}`;
      const existente = atual.pedidos.find((p) => p.id === item.venda_id);
      if (existente) existente.quantidade += quantidadePendente;
      else atual.pedidos.push({ id: item.venda_id, rotulo, quantidade: quantidadePendente });
      atual.total += quantidadePendente;
      mapa.set(item.produto_id, atual);
    }

    // Desmembramento automático de kits/combos gravados em venda_kit
    for (const kit of kitsVendas) {
      const venda = vendaPorId.get(kit.venda_id);
      const statusVenda = (venda?.status_pedido || "").toLowerCase().trim();
      if (
        statusVenda === "entregue" ||
        statusVenda === "instalado" ||
        statusVenda === "instalada" ||
        statusVenda === "concluido" ||
        statusVenda === "concluida" ||
        statusVenda === "cancelado" ||
        statusVenda === "cancelada" ||
        statusVenda === "orcamento"
      ) {
        continue;
      }

      const itensKit: string[] = [];
      if (kit.casco_id) itensKit.push(kit.casco_id);
      if (kit.filtro_id) itensKit.push(kit.filtro_id);
      if (kit.acessorios && Array.isArray(kit.acessorios)) {
        for (const ac of kit.acessorios) {
          if (ac && ac.produto_id) itensKit.push(ac.produto_id);
        }
      }

      for (const prodId of itensKit) {
        const chave = `${prodId}::${kit.venda_id}`;
        if (paresProcessados.has(chave)) continue;
        paresProcessados.add(chave);

        const jaComprado = itensCompradosInfo.qtdCompradaPorProdutoVenda.get(chave) ?? 0;
        const quantidadePendente = Math.max(0, 1 - jaComprado);
        if (quantidadePendente <= 0) continue;

        const atual = mapa.get(prodId) ?? { total: 0, pedidos: [] };
        const rotulo = `${venda?.numero ?? "Pedido"} — ${venda?.cliente_nome ?? "Cliente"}`;
        const existente = atual.pedidos.find((p) => p.id === kit.venda_id);
        if (existente) existente.quantidade += quantidadePendente;
        else atual.pedidos.push({ id: kit.venda_id, rotulo, quantidade: quantidadePendente });
        atual.total += quantidadePendente;
        mapa.set(prodId, atual);
      }
    }

    return mapa;
  }, [consumoItens, kitsVendas, vendaPorId, itensCompradosInfo]);


  const termoBusca = useMemo(() => normalizar(buscaFornecedor.trim()), [buscaFornecedor]);

  const ordensFiltradas = useMemo(() => {
    const casaStatus = (ordem: Ordem) =>
      filtroStatus === "todas" || ordem.status === filtroStatus;
    const casaFornecedor = (ordem: Ordem) =>
      filtroFornecedor === "todos" || ordem.fornecedor_id === filtroFornecedor;

    const ordensBase = ordens.filter((o) => casaStatus(o) && casaFornecedor(o));
    if (!termoBusca) return ordensBase;

    const itensPorOrdem = new Map<string, Item[]>();
    for (const it of itensTodos) {
      const lista = itensPorOrdem.get(it.ordem_id) ?? [];
      lista.push(it);
      itensPorOrdem.set(it.ordem_id, lista);
    }
    return ordensBase.filter((ordem) => {
      if (normalizar(ordem.fornecedor_nome ?? "").includes(termoBusca)) return true;
      if (normalizar(ordem.numero ?? "").includes(termoBusca)) return true;
      return (itensPorOrdem.get(ordem.id) ?? []).some((it) => {
        const venda = it.venda_id ? vendaPorId.get(it.venda_id) : undefined;
        return (
          normalizar(it.descricao ?? "").includes(termoBusca) ||
          normalizar(it.codigo ?? "").includes(termoBusca) ||
          normalizar(it.cliente_nome ?? venda?.cliente_nome ?? "").includes(termoBusca) ||
          normalizar(venda?.numero ?? "").includes(termoBusca)
        );
      });
    });
  }, [ordens, filtroStatus, filtroFornecedor, termoBusca, itensTodos, vendaPorId]);

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

  /** Total faturado nas notas da ordem; sem notas lançadas, cai para o valor único antigo. */
  const notasLista = notasOrdem.data ?? [];
  const totalNotas =
    notasLista.length > 0
      ? notasLista.reduce((s, n) => s + Number(n.valor ?? 0), 0)
      : Number(ordemDetalhe?.valor_nota ?? 0);


  const fornecedorDaCompra = useCallback(
    (produto: Produto) => {
      const categoria = normalizar(produto.categoria ?? "");
      const nome = normalizar(produto.nome);
      const ehPiscina =
        categoria.includes("piscina") ||
        nome.includes("piscina") ||
        normalizar(produto.tipo ?? "").includes("casco");

      // 1. Prioridade: fornecedor direto cadastrado no produto
      if (produto.fornecedor_id) {
        const fDireto = fornecedoresCompletos.find((f) => f.id === produto.fornecedor_id);
        if (fDireto) {
          const ehAnal = normalizar(fDireto.nome).includes("analandia") || normalizar(fDireto.nome).includes("analândia");
          // Analândia é exclusivo de cascos de piscina; se o produto não for piscina, direciona obrigatoriamente para Progeu
          if (ehAnal && !ehPiscina) {
            const fProgeu = fornecedoresCompletos.find((f) => normalizar(f.nome).includes("progeu"));
            return fProgeu ?? ({ id: "progeu", nome: "Progeu" } satisfies Fornecedor);
          }
          return fDireto;
        }
      }
      // 2. Serviço interno Splash
      if (produto.tipo === "servico") {
        const fSplash = fornecedoresCompletos.find((f) =>
          normalizar(f.nome).includes("splash jardim do trevo"),
        );
        return fSplash ?? ({ id: SEM_CLIENTE, nome: "Splash Jardim do Trevo" } satisfies Fornecedor);
      }
      // 3. Fallback inteligente: Casco/Piscina -> Analândia, Demais -> Progeu
      const alvo = ehPiscina ? "analandia" : "progeu";
      const encontrado = fornecedoresCompletos.find((f) => normalizar(f.nome).includes(alvo));
      if (encontrado) return encontrado;
      return ehPiscina
        ? ({ id: "analandia", nome: "Analândia" } satisfies Fornecedor)
        : ({ id: "progeu", nome: "Progeu" } satisfies Fornecedor);
    },
    [fornecedoresCompletos],
  );

  /** Identifica se o produto já teve ordem de compra gerada ou já foi faturado/comprado ou está em lote anterior. */
  const ehProdutoJaCompradoOuFaturado = useCallback(
    (p: Produto) => {
      const status = statusCompra[p.id] ?? p.status_compra ?? "a_comprar";
      if (
        status === "comprado" ||
        status === "faturada" ||
        status === "concluida" ||
        status === "recebida"
      ) {
        return true;
      }

      // Se já teve ordem de compra finalizada/recebida, oculta da visualização
      if (itensCompradosInfo.produtosFinalizados.has(p.id)) {
        return true;
      }

      if (itensCompradosInfo.produtosFaturadosOuConcluidos.has(p.id)) {
        const pendente = demandaPorProduto.get(p.id)?.total ?? 0;
        if (pendente === 0) return true;
      }

      // Se já está consolidado em lote/carga anterior e não possui demanda pendente
      if (itensCompradosInfo.produtosEmCargasAnteriores.has(p.id)) {
        const pendente = demandaPorProduto.get(p.id)?.total ?? 0;
        if (pendente === 0) return true;
      }

      // Se possui vínculo direto com venda e esse vínculo já teve OC gerada e não há mais demanda pendente
      if (p.venda_vinculo_id) {
        const chave = `${p.id}::${p.venda_vinculo_id}`;
        const jaComprado = itensCompradosInfo.qtdCompradaPorProdutoVenda.get(chave) ?? 0;
        const pendente = demandaPorProduto.get(p.id)?.total ?? 0;
        if (jaComprado > 0 && pendente === 0) return true;
      }

      // Se já teve ordem de compra gerada em ordem ativa e não possui demanda pendente
      if (itensCompradosInfo.produtosComOrdemGerada.has(p.id)) {
        const pendente = demandaPorProduto.get(p.id)?.total ?? 0;
        if (pendente === 0) return true;
      }

      return false;
    },
    [statusCompra, itensCompradosInfo, demandaPorProduto],
  );

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((produto) => {
      const forn = fornecedorDaCompra(produto);

      // 0. Filtro por fornecedor selecionado no seletor principal
      if (filtroFornecedor !== "todos" && forn?.id !== filtroFornecedor) {
        return false;
      }

      const jaComprado = ehProdutoJaCompradoOuFaturado(produto);
      const estaSelecionado = Boolean(selecionadosCompra[produto.id]);

      // 1. Ocultar automaticamente itens já comprados, faturados ou em lotes anteriores
      if (ocultarJaComprados && jaComprado && !estaSelecionado) {
        return false;
      }

      // 2. Se o usuário ativamente marcou/selecionou este item, sempre exibe
      if (estaSelecionado) return true;

      // 3. Verifica vínculo explícito ou demanda pendente de pedidos de venda ativos
      const temDemandaPendente = (demandaPorProduto.get(produto.id)?.total ?? 0) > 0;
      const temVinculoManual = Boolean(
        vinculosCompra[produto.id]?.some((v) => v && v !== SEM_CLIENTE),
      );
      let temVinculoProduto = false;
      if (produto.venda_vinculo_id && !jaComprado) {
        const v = vendaPorId.get(produto.venda_vinculo_id);
        const st = (v?.status_pedido || "").toLowerCase().trim();
        if (
          st !== "entregue" &&
          st !== "instalado" &&
          st !== "instalada" &&
          st !== "concluido" &&
          st !== "concluida" &&
          st !== "cancelado" &&
          st !== "cancelada" &&
          st !== "orcamento"
        ) {
          temVinculoProduto = true;
        }
      }

      const estaExplicitamenteVinculado =
        temDemandaPendente || temVinculoManual || temVinculoProduto;

      // 4. Se o usuário ativou o modo "Catálogo completo"
      if (filtroExibicaoCatalogo === "catalogo_completo") {
        if (termoBusca) {
          const casaFornecedor = normalizar(forn?.nome ?? "").includes(termoBusca);
          const casaProduto =
            normalizar(produto.nome).includes(termoBusca) ||
            normalizar(produto.codigo ?? "").includes(termoBusca) ||
            normalizar(produto.categoria ?? "").includes(termoBusca);
          const vendaVinculo = produto.venda_vinculo_id
            ? vendaPorId.get(produto.venda_vinculo_id)
            : undefined;
          const casaVinculo =
            vendaVinculo &&
            (normalizar(vendaVinculo.numero ?? "").includes(termoBusca) ||
              normalizar(vendaVinculo.cliente_nome ?? "").includes(termoBusca));
          const pedidos = demandaPorProduto.get(produto.id)?.pedidos ?? [];
          const casaDemanda = pedidos.some((p) => normalizar(p.rotulo).includes(termoBusca));

          return casaFornecedor || casaProduto || casaVinculo || casaDemanda;
        }
        return true;
      }

      // 5. Padrão: "Apenas Vinculados / Demanda": nunca exibe o catálogo completo automaticamente
      if (termoBusca) {
        const casaProduto =
          normalizar(produto.nome).includes(termoBusca) ||
          normalizar(produto.codigo ?? "").includes(termoBusca) ||
          normalizar(produto.categoria ?? "").includes(termoBusca);
        const vendaVinculo = produto.venda_vinculo_id
          ? vendaPorId.get(produto.venda_vinculo_id)
          : undefined;
        const casaVinculo =
          vendaVinculo &&
          (normalizar(vendaVinculo.numero ?? "").includes(termoBusca) ||
            normalizar(vendaVinculo.cliente_nome ?? "").includes(termoBusca));
        const pedidos = demandaPorProduto.get(produto.id)?.pedidos ?? [];
        const casaDemanda = pedidos.some((p) => normalizar(p.rotulo).includes(termoBusca));

        if (casaProduto || casaVinculo || casaDemanda) {
          return true;
        }

        return false;
      }

      return estaExplicitamenteVinculado;
    });
  }, [
    produtos,
    filtroFornecedor,
    fornecedorDaCompra,
    termoBusca,
    vendaPorId,
    demandaPorProduto,
    selecionadosCompra,
    vinculosCompra,
    ocultarJaComprados,
    filtroExibicaoCatalogo,
    ehProdutoJaCompradoOuFaturado,
  ]);

  const quantidadeCompra = (produto: Produto) => {
    const valor = quantidadesCompra[produto.id];
    if (valor !== undefined) return Math.max(Number(valor) || 0, 0);
    const pendente = demandaPorProduto.get(produto.id)?.total;
    if (pendente !== undefined && pendente > 0) return pendente;
    return Number(produto.quantidade_compra ?? 1);
  };

  const vinculosDoProduto = (produto: Produto) => {
    const quantidade = Math.max(0, Math.trunc(quantidadeCompra(produto)));
    const salvos = vinculosCompra[produto.id];
    if (salvos) return Array.from({ length: quantidade }, (_, indice) => salvos[indice] ?? "");

    const demanda = demandaPorProduto.get(produto.id)?.pedidos ?? [];
    const automaticos = demanda.flatMap((pedido) =>
      Array.from({ length: Math.max(0, Math.trunc(pedido.quantidade)) }, () => pedido.id),
    );
    return Array.from(
      { length: quantidade },
      (_, indice) => automaticos[indice] ?? (indice === 0 ? produto.venda_vinculo_id ?? "" : ""),
    );
  };

  const valorCompra = (produto: Produto) => {
    const valor = valoresCompra[produto.id];
    return valor === undefined ? Number(produto.preco_custo) : Math.max(Number(valor) || 0, 0);
  };

  const percentualCompra = (produto: Produto) =>
    percentuaisCompra[produto.id] === undefined
      ? Math.min(Math.max(Number(produto.desconto_compra ?? 0) || 0, 0), 100)
      : Math.min(Math.max(Number(percentuaisCompra[produto.id]) || 0, 0), 100);

  const totalCompra = (produto: Produto) => {
    const vinculos = vinculosDoProduto(produto);
    const vincSel = vinculosSelecionadosCompra[produto.id];
    let qtd = quantidadeCompra(produto);
    if (vincSel && Object.keys(vincSel).length > 0) {
      const selecionadosCount = vinculos.filter((_, idx) => isVinculoSelecionado(produto.id, idx)).length;
      if (selecionadosCount > 0) {
        qtd = selecionadosCount;
      }
    }
    return qtd * valorCompra(produto) * (1 - percentualCompra(produto) / 100);
  };

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
    setVinculosSelecionadosCompra(
      marcado
        ? Object.fromEntries(
            produtosFiltrados.map((produto) => [
              produto.id,
              Object.fromEntries(
                vinculosDoProduto(produto).map((_, idx) => [idx, true]),
              ),
            ]),
          )
        : {},
    );
    setSelecionadosExecutados(
      marcado ? Object.fromEntries(linhasExecutadas.map(({ item }) => [item.id, true])) : {},
    );
  };

  type ItemVisaoFornecedor = {
    produto: Produto;
    fornecedor: Fornecedor;
    demanda: { total: number; pedidos: { id: string; rotulo: string; quantidade: number }[] } | undefined;
    estoqueAtual: number;
    estoqueMinimo: number;
    estoqueBaixo: boolean;
    estoqueZerado: boolean;
    quantidadeAComprar: number;
    valorUnitario: number;
    desconto: number;
    totalItem: number;
    vinculos: string[];
    comVinculoCount: number;
    semVinculoCount: number;
    temVinculo: boolean;
    temSemVinculo: boolean;
    precisaComprar: boolean;
    status: string;
    jaComprado?: boolean;
    jaFaturado?: boolean;
  };

  type GrupoVisaoFornecedor = {
    fornecedor: Fornecedor;
    chave: string;
    nome: string;
    itens: ItemVisaoFornecedor[];
    totalItens: number;
    totalUnidades: number;
    totalValor: number;
    totalComVinculo: number;
    totalSemVinculo: number;
    totalDemandaPedidos: number;
    selecionadosQtd: number;
    todosSelecionados: boolean;
    totalValorSelecionados: number;
  };

  const dadosItensCompra = useMemo(() => {
    return produtosFiltrados.map((p): ItemVisaoFornecedor => {
      const fornecedor = fornecedorDaCompra(p) ?? { id: "outros", nome: "Outros Fornecedores" };
      const demanda = demandaPorProduto.get(p.id);
      const totalDemanda = demanda?.total ?? 0;
      const estoqueAtual = Number(p.estoque_atual ?? 0);
      const estoqueMinimo = Number(p.estoque_minimo ?? 0);
      const estoqueZerado = estoqueAtual <= 0;
      const estoqueBaixo = estoqueAtual <= estoqueMinimo && estoqueMinimo > 0;
      const quantidadeAComprar = quantidadeCompra(p);
      const valorUnitario = valorCompra(p);
      const desconto = percentualCompra(p);
      const totalItem = totalCompra(p);
      const vinculos = vinculosDoProduto(p);
      const comVinculoCount = vinculos.filter((v) => v && v !== SEM_CLIENTE).length;
      const semVinculoCount = vinculos.filter((v) => !v || v === SEM_CLIENTE).length;
      const status = statusCompra[p.id] ?? p.status_compra ?? "a_comprar";

      const jaComprado = ehProdutoJaCompradoOuFaturado(p);
      const jaFaturado = itensCompradosInfo.produtosFaturadosOuConcluidos.has(p.id);

      const temVinculo =
        comVinculoCount > 0 ||
        totalDemanda > 0 ||
        Boolean(p.venda_vinculo_id && !jaComprado);
      const temSemVinculo =
        semVinculoCount > 0 || (!p.venda_vinculo_id && totalDemanda === 0);

      const precisaComprar =
        totalDemanda > 0 ||
        (Boolean(p.venda_vinculo_id) && !jaComprado) ||
        Boolean(selecionadosCompra[p.id]) ||
        Boolean(vinculosCompra[p.id]?.some((v) => v && v !== SEM_CLIENTE)) ||
        (estoqueZerado && !jaComprado) ||
        (estoqueBaixo && !jaComprado);

      return {
        produto: p,
        fornecedor,
        demanda,
        estoqueAtual,
        estoqueMinimo,
        estoqueBaixo,
        estoqueZerado,
        quantidadeAComprar,
        valorUnitario,
        desconto,
        totalItem,
        vinculos,
        comVinculoCount,
        semVinculoCount,
        temVinculo,
        temSemVinculo,
        precisaComprar,
        status,
        jaComprado,
        jaFaturado,
      };
    });
  }, [
    produtosFiltrados,
    fornecedores,
    demandaPorProduto,
    quantidadesCompra,
    valoresCompra,
    percentuaisCompra,
    vinculosCompra,
    statusCompra,
    selecionadosCompra,
    itensCompradosInfo,
  ]);

  const totalJaCompradosOcultos = useMemo(() => {
    let count = 0;
    for (const p of produtos) {
      if (filtroFornecedor !== "todos" && fornecedorDaCompra(p)?.id !== filtroFornecedor) {
        continue;
      }
      if (ehProdutoJaCompradoOuFaturado(p) && !selecionadosCompra[p.id]) {
        count++;
      }
    }
    return count;
  }, [produtos, filtroFornecedor, fornecedorDaCompra, ehProdutoJaCompradoOuFaturado, selecionadosCompra]);

  const contagensFiltroVinculo = useMemo(() => {
    const base = dadosItensCompra.filter((item) =>
      filtroNecessidade === "precisa_comprar" ? item.precisaComprar : true,
    );
    return {
      todos: base.length,
      comVinculo: base.filter((i) => i.temVinculo).length,
      semVinculo: base.filter((i) => i.temSemVinculo).length,
    };
  }, [dadosItensCompra, filtroNecessidade]);

  const itensVisaoFiltrados = useMemo(() => {
    return dadosItensCompra.filter((item) => {
      if (filtroNecessidade === "precisa_comprar" && !item.precisaComprar) {
        return false;
      }
      if (filtroVinculo === "com_vinculo" && !item.temVinculo) {
        return false;
      }
      if (filtroVinculo === "sem_vinculo" && !item.temSemVinculo) {
        return false;
      }
      return true;
    });
  }, [dadosItensCompra, filtroNecessidade, filtroVinculo]);

  const gruposVisaoFornecedor = useMemo(() => {
    const mapa = new Map<string, GrupoVisaoFornecedor>();

    for (const item of itensVisaoFiltrados) {
      const chave = item.fornecedor.id || "sem-fornecedor";
      const grupo =
        mapa.get(chave) ??
        {
          fornecedor: item.fornecedor,
          chave,
          nome: item.fornecedor.nome,
          itens: [],
          totalItens: 0,
          totalUnidades: 0,
          totalValor: 0,
          totalComVinculo: 0,
          totalSemVinculo: 0,
          totalDemandaPedidos: 0,
          selecionadosQtd: 0,
          todosSelecionados: false,
          totalValorSelecionados: 0,
        };

      grupo.itens.push(item);
      grupo.totalItens += 1;
      grupo.totalUnidades += item.quantidadeAComprar;
      grupo.totalValor += item.totalItem;
      grupo.totalComVinculo += item.comVinculoCount;
      grupo.totalSemVinculo += item.semVinculoCount;
      grupo.totalDemandaPedidos += item.demanda?.total ?? 0;
      if (selecionadosCompra[item.produto.id]) {
        grupo.selecionadosQtd += 1;
        grupo.totalValorSelecionados += item.totalItem;
      }
      mapa.set(chave, grupo);
    }

    const lista = Array.from(mapa.values());
    for (const g of lista) {
      g.todosSelecionados = g.itens.length > 0 && g.selecionadosQtd === g.itens.length;
      g.itens.sort((a, b) => {
        if (a.temVinculo !== b.temVinculo) return a.temVinculo ? -1 : 1;
        if ((b.demanda?.total ?? 0) !== (a.demanda?.total ?? 0)) {
          return (b.demanda?.total ?? 0) - (a.demanda?.total ?? 0);
        }
        return a.produto.nome.localeCompare(b.produto.nome);
      });
    }

    return lista.sort((a, b) => a.nome.localeCompare(b.nome));
  }, [itensVisaoFiltrados, selecionadosCompra]);

  const resumoGeralCompra = useMemo(() => {
    let totalValor = 0;
    let totalUnidades = 0;
    let totalProdutos = 0;
    let totalComVinculo = 0;
    let totalSemVinculo = 0;
    let totalFornecedoresComItens = 0;

    for (const g of gruposVisaoFornecedor) {
      if (g.itens.length > 0) totalFornecedoresComItens++;
      totalValor += g.totalValor;
      totalUnidades += g.totalUnidades;
      totalProdutos += g.totalItens;
      totalComVinculo += g.totalComVinculo;
      totalSemVinculo += g.totalSemVinculo;
    }

    return {
      totalValor,
      totalUnidades,
      totalProdutos,
      totalComVinculo,
      totalSemVinculo,
      totalFornecedoresComItens,
    };
  }, [gruposVisaoFornecedor]);

  const alternarRecolhimentoFornecedor = (chave: string) => {
    setFornecedoresRecolhidos((atual) => ({
      ...atual,
      [chave]: !atual[chave],
    }));
  };

  const recolherTodosFornecedores = (recolher: boolean) => {
    if (recolher) {
      const mapa: Record<string, boolean> = {};
      for (const g of gruposVisaoFornecedor) mapa[g.chave] = true;
      setFornecedoresRecolhidos(mapa);
    } else {
      setFornecedoresRecolhidos({});
    }
  };

  const alternarSelecaoGrupoFornecedor = (grupo: GrupoVisaoFornecedor) => {
    const marcar = !grupo.todosSelecionados;
    setSelecionadosCompra((atual) => {
      const proximo = { ...atual };
      for (const item of grupo.itens) {
        if (marcar) {
          proximo[item.produto.id] = true;
        } else {
          delete proximo[item.produto.id];
        }
      }
      return proximo;
    });
    setVinculosSelecionadosCompra((atual) => {
      const proximo = { ...atual };
      for (const item of grupo.itens) {
        if (marcar) {
          proximo[item.produto.id] = Object.fromEntries(
            item.vinculos.map((_, idx) => [idx, true]),
          );
        } else {
          delete proximo[item.produto.id];
        }
      }
      return proximo;
    });
  };

  const comprarItensDoFornecedor = (grupo: GrupoVisaoFornecedor) => {
    const itensSelecionados = grupo.itens.filter((i) => selecionadosCompra[i.produto.id]);
    const itensAlvo = itensSelecionados.length > 0 ? itensSelecionados : grupo.itens;

    if (itensAlvo.length === 0) {
      toast.error(`Nenhum produto deste fornecedor para comprar`);
      return;
    }

    const novoMapa: Record<string, boolean> = {};
    const novoMapaVinculos: Record<string, Record<number, boolean>> = {};
    for (const i of itensAlvo) {
      novoMapa[i.produto.id] = true;
      const vincs = i.vinculos;
      const vincAtual = vinculosSelecionadosCompra[i.produto.id];
      if (vincAtual && Object.values(vincAtual).some(Boolean)) {
        novoMapaVinculos[i.produto.id] = vincAtual;
      } else {
        novoMapaVinculos[i.produto.id] = Object.fromEntries(vincs.map((_, idx) => [idx, true]));
      }
    }
    setSelecionadosCompra(novoMapa);
    setVinculosSelecionadosCompra(novoMapaVinculos);
    setSelecionadosExecutados({});

    toast.info(`Iniciando ordem de compra para ${grupo.nome} (${itensAlvo.length} itens)...`);
    setTimeout(() => {
      comprarSelecionados.mutate();
    }, 100);
  };

  const comprarSelecionados = useMutation({
    mutationFn: async () => {
      if (produtosSelecionados.length === 0) throw new Error("Selecione ao menos um produto");

      // Filtra apenas produtos que têm pelo menos um vínculo selecionado para compra
      const produtosParaComprar = produtosSelecionados.filter((produto) => {
        const vinculos = vinculosDoProduto(produto);
        return vinculos.some((_, idx) => isVinculoSelecionado(produto.id, idx));
      });

      if (produtosParaComprar.length === 0) {
        throw new Error("Selecione ao menos um vínculo para realizar a compra");
      }

      const semFornecedor = produtosParaComprar.filter((produto) => !fornecedorDaCompra(produto));
      if (semFornecedor.length > 0) {
        throw new Error(`Fornecedor não encontrado para: ${semFornecedor.map((p) => p.nome).join(", ")}`);
      }

      const { data: auth } = await supabase.auth.getUser();
      const { data: existentes, error: erroNumeros } = await supabase
        .from("ordens_compra")
        .select("numero");
      if (erroNumeros) throw erroNumeros;
      const numeros = (existentes ?? []).map((ordem) => ordem.numero);
      const grupos = new Map<string, { fornecedor: Fornecedor; itens: Produto[] }>();

      for (const produto of produtosParaComprar) {
        const fornecedor = fornecedorDaCompra(produto);
        if (!fornecedor) continue;
        const grupo = grupos.get(fornecedor.id);
        grupos.set(fornecedor.id, {
          fornecedor,
          itens: [...(grupo?.itens ?? []), produto],
        });
      }

      let quantidadeOrdens = 0;
      const ordensCriadas: Ordem[] = [];
      const todosItensCriadosIds: string[] = [];
      const mapaNumeroPorCliente = new Map<string, string>();

      for (const { fornecedor, itens } of grupos.values()) {
        const fornecedorIdAlvo = fornecedor.id === SEM_CLIENTE ? null : fornecedor.id;

        // Identifica clientes e pedidos vinculados aos itens selecionados desta compra
        const vinculosSelecionadosDosItens = itens.flatMap((produto) => {
          const todos = vinculosDoProduto(produto);
          return todos
            .map((vendaId, idx) => ({ vendaId, idx }))
            .filter(({ idx }) => isVinculoSelecionado(produto.id, idx));
        });

        const clientesDosItens = Array.from(
          new Set(
            vinculosSelecionadosDosItens
              .map(({ vendaId }) => (vendaId ? vendaPorId.get(vendaId)?.cliente_id : null))
              .filter(Boolean) as string[],
          ),
        );
        const vendasDosItens = Array.from(
          new Set(vinculosSelecionadosDosItens.map(({ vendaId }) => vendaId).filter(Boolean) as string[]),
        );
        const nomesDosItens = Array.from(
          new Set(
            vinculosSelecionadosDosItens
              .map(({ vendaId }) => (vendaId ? vendaPorId.get(vendaId)?.cliente_nome : null))
              .filter(Boolean) as string[],
          ),
        );

        // Verifica se já existe ordem ativa deste fornecedor para o mesmo cliente/venda
        const ordemExistente = ordens.find((o) => {
          if (o.status === "cancelada") return false;
          if (o.fornecedor_id !== fornecedorIdAlvo) return false;
          const itensDestaOrdem = itensTodos.filter((it) => it.ordem_id === o.id);
          return itensDestaOrdem.some(
            (it) =>
              (it.cliente_id && clientesDosItens.includes(it.cliente_id)) ||
              (it.venda_id && vendasDosItens.includes(it.venda_id)) ||
              (it.cliente_nome && nomesDosItens.includes(it.cliente_nome)),
          );
        });

        let ordemFinalId: string;
        let ordemFinalObj: Ordem;

        if (ordemExistente) {
          ordemFinalId = ordemExistente.id;
          ordemFinalObj = ordemExistente;
        } else {
          // Busca número de ordem já existente para este cliente em qualquer fornecedor
          let numeroCliente: string | null = null;
          for (const cid of clientesDosItens) {
            if (mapaNumeroPorCliente.has(cid)) {
              numeroCliente = mapaNumeroPorCliente.get(cid)!;
              break;
            }
            const itemComNum = itensTodos.find((it) => it.cliente_id === cid);
            if (itemComNum) {
              const o = ordens.find((ord) => ord.id === itemComNum.ordem_id && ord.numero);
              if (o?.numero) {
                numeroCliente = o.numero;
                break;
              }
            }
          }
          if (!numeroCliente) {
            for (const vid of vendasDosItens) {
              if (mapaNumeroPorCliente.has(vid)) {
                numeroCliente = mapaNumeroPorCliente.get(vid)!;
                break;
              }
              const itemComNum = itensTodos.find((it) => it.venda_id === vid);
              if (itemComNum) {
                const o = ordens.find((ord) => ord.id === itemComNum.ordem_id && ord.numero);
                if (o?.numero) {
                  numeroCliente = o.numero;
                  break;
                }
              }
            }
          }

          const numero = numeroCliente ?? proximoCodigo("OC", numeros);
          if (!numeroCliente) {
            numeros.push(numero);
            for (const cid of clientesDosItens) mapaNumeroPorCliente.set(cid, numero);
            for (const vid of vendasDosItens) mapaNumeroPorCliente.set(vid, numero);
          } else {
            for (const cid of clientesDosItens) mapaNumeroPorCliente.set(cid, numeroCliente);
            for (const vid of vendasDosItens) mapaNumeroPorCliente.set(vid, numeroCliente);
          }

          const valorProdutos = itens.reduce((total, produto) => total + totalCompra(produto), 0);
          const creditoOrdem =
            creditoAplicado !== 0 && totalSelecionadoCompra > 0
              ? (valorProdutos / totalSelecionadoCompra) * creditoAplicado
              : 0;
          const { data: ordem, error: erroOrdem } = await supabase
            .from("ordens_compra")
            .insert({
              numero,
              fornecedor_id: fornecedorIdAlvo,
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
              status_carga: "pendente_carga",
              observacoes:
                creditoOrdem > 0
                  ? `Compra selecionada na grade de produtos | Crédito fabricante abatido: ${brl(creditoOrdem)}`
                  : creditoOrdem < 0
                    ? `Compra selecionada na grade de produtos | Crédito fabricante negativo cobrado: ${brl(Math.abs(creditoOrdem))}`
                    : "Compra selecionada na grade de produtos",
              created_by: auth.user?.id ?? null,
            })
            .select("*")
            .single();
          if (erroOrdem) throw erroOrdem;

          ordemFinalId = ordem.id;
          ordemFinalObj = ordem as Ordem;
        }

        const payload = itens.flatMap((produto) => {
          const valorUnitario = valorCompra(produto);
          const descontoUnitario = valorUnitario * (percentualCompra(produto) / 100);
          const vinculosTodos = vinculosDoProduto(produto);
          const vinculosParaComprar = vinculosTodos
            .map((vendaId, idx) => ({ vendaId, idx }))
            .filter(({ idx }) => isVinculoSelecionado(produto.id, idx));

          return vinculosParaComprar.map(({ vendaId }) => {
            const venda = vendaId ? vendaPorId.get(vendaId) : undefined;
            return {
              ordem_id: ordemFinalId,
              produto_id: produto.id,
              codigo: produto.codigo,
              descricao: produto.nome,
              ncm: produto.ncm,
              cst: produto.cst,
              unidade: produto.unidade,
              quantidade: 1,
              valor_unitario: valorUnitario,
              desconto: descontoUnitario,
              total: valorUnitario - descontoUnitario,
              cliente_id: venda?.cliente_id ?? null,
              cliente_nome: venda?.cliente_nome ?? null,
              venda_id: vendaId || null,
              cor: coresCompra[produto.id] ?? produto.cor_pastilha ?? null,
              pastilha: modelosCompra[produto.id] ?? produto.modelo_pastilha ?? null,
              status_carga: "pendente_carga",
            };
          });
        });
        const { data: itensInseridos, error: erroItens } = await supabase
          .from("ordem_compra_itens")
          .insert(payload)
          .select("id");
        if (erroItens) throw erroItens;
        if (itensInseridos) {
          for (const it of itensInseridos) {
            todosItensCriadosIds.push(it.id);
          }
        }

        // Se complementou ordem existente, recalcula o total
        if (ordemExistente) {
          const { data: todosItens } = await supabase
            .from("ordem_compra_itens")
            .select("total")
            .eq("ordem_id", ordemFinalId);
          const novoTotal = (todosItens ?? []).reduce((s, it) => s + Number(it.total || 0), 0);
          await supabase
            .from("ordens_compra")
            .update({
              valor_produtos: novoTotal,
              valor_total: Math.max(novoTotal - Number(ordemExistente.desconto || 0), 0),
              icms_base: novoTotal,
              icms_valor: novoTotal * 0.18,
            })
            .eq("id", ordemFinalId);
        }

        quantidadeOrdens += 1;
        ordensCriadas.push(ordemFinalObj);
      }
      return { quantidadeOrdens, ordensCriadas, itemIds: todosItensCriadosIds };
    },
    onSuccess: async ({ quantidadeOrdens: quantidade, ordensCriadas }) => {
      toast.success(
        quantidade === 1 ? "1 ordem de compra criada" : `${quantidade} ordens de compra criadas`,
      );
      if (creditoAplicado !== 0 || creditoCreditar !== 0) {
        salvarCreditoDisponivel.mutate(saldoCredito);
        setCreditoDisponivelInput(null);
        setCreditoFabricante("");
        setUsarCreditoFabricante(false);
      }

      // Mantém apenas os vínculos que NÃO foram selecionados para compra
      setVinculosCompra((prev) => {
        const proximo = { ...prev };
        for (const produto of produtosSelecionados) {
          const vinculosTodos = vinculosDoProduto(produto);
          const restantes = vinculosTodos.filter(
            (_, idx) => !isVinculoSelecionado(produto.id, idx),
          );
          if (restantes.length > 0) {
            proximo[produto.id] = restantes;
          } else {
            delete proximo[produto.id];
          }
        }
        return proximo;
      });

      setQuantidadesCompra((prev) => {
        const proximo = { ...prev };
        for (const produto of produtosSelecionados) {
          const vinculosTodos = vinculosDoProduto(produto);
          const restantes = vinculosTodos.filter(
            (_, idx) => !isVinculoSelecionado(produto.id, idx),
          );
          if (restantes.length > 0) {
            proximo[produto.id] = String(restantes.length);
          } else {
            delete proximo[produto.id];
          }
        }
        return proximo;
      });

      setSelecionadosCompra({});
      setVinculosSelecionadosCompra({});
      qc.setQueryData<Ordem[]>(["ordens_compra"], (atuais = []) => [
        ...ordensCriadas,
        ...atuais.filter((atual) => !ordensCriadas.some((criada) => criada.id === atual.id)),
      ]);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["ordens_compra"] }),
        qc.invalidateQueries({ queryKey: ["ordem_compra_itens"] }),
        qc.invalidateQueries({ queryKey: ["venda_itens", "consumo-compras"] }),
        qc.invalidateQueries({ queryKey: ["venda_kit", "consumo-compras"] }),
        qc.invalidateQueries({ queryKey: ["produtos", "lista-simples"] }),
        qc.invalidateQueries({ queryKey: ["produtos"] }),
      ]);
      const primeiraOrdem = ordensCriadas[0];
      if (primeiraOrdem) {
        setModoEdicao(false);
        setDetalheId(primeiraOrdem.id);
      }
    },
    onError: (erro: Error) => toast.error(erro.message),
  });

  const pedirCarga = async (fornecedorIdAlvo?: string | null) => {
    // 1. Se o usuário marcou itens já existentes na aba executadas (ordem_compra_itens)
    const idsExecutados = Object.keys(selecionadosExecutados).filter(
      (id) => selecionadosExecutados[id] === true,
    );
    if (idsExecutados.length > 0) {
      const primeiroItem = itensTodos.find((it) => it.id === idsExecutados[0]);
      const ordemDoItem = ordens.find((o) => o.id === primeiroItem?.ordem_id);
      const fornId = fornecedorIdAlvo || ordemDoItem?.fornecedor_id || null;
      setFornecedorCargaSelecionado(fornId);
      setItensCargaIniciais(idsExecutados);
      setModalPedirCargaAberto(true);
      return;
    }

    // 2. Se o usuário marcou produtos na tela para compra (selecionadosCompra)
    if (produtosSelecionados.length > 0) {
      try {
        const resultado = await comprarSelecionados.mutateAsync();
        const fornId =
          fornecedorIdAlvo ||
          (produtosSelecionados[0] ? fornecedorDaCompra(produtosSelecionados[0])?.id : null);
        setFornecedorCargaSelecionado(fornId || null);
        setItensCargaIniciais(resultado.itemIds ?? []);
        setModalPedirCargaAberto(true);
      } catch {
        // Erro já disparado por comprarSelecionados.onError
      }
      return;
    }

    // 3. Sem itens marcados: abre o modal de carga diretamente
    setFornecedorCargaSelecionado(fornecedorIdAlvo || null);
    setItensCargaIniciais([]);
    setModalPedirCargaAberto(true);
  };

  const abrirEdicaoProdutoCompra = (produto: Produto) => {
    setProdutoCompraEditando(produto);
    setProdutoCompraForm({
      codigo: produto.codigo ?? "",
      nome: produto.nome,
      categoria: produto.categoria ?? "",
      unidade: produto.unidade,
      preco_custo: String(Number(produto.preco_custo ?? 0)),
      fornecedor_id: produto.fornecedor_id ?? SEM_CLIENTE,
      ncm: produto.ncm ?? "",
      cst: produto.cst ?? "",
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
          ncm: produtoCompraForm.ncm.trim() || null,
          cst: produtoCompraForm.cst.trim() || null,
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
        venda_id: i.venda_id ?? null,
        numero_nf: i.numero_nf ?? null,
        cor: i.cor ?? "",
        pastilha: i.pastilha ?? "",
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

      // Mantém itens existentes para preservar integridade de cargas geradas
      const { data: itensExistentes } = await supabase
        .from("ordem_compra_itens")
        .select("id")
        .eq("ordem_id", ordemDetalhe.id);

      const idsMantidos = new Set(formEdicao.itens.map((i) => i.id).filter(Boolean));
      const idsParaExcluir = (itensExistentes ?? [])
        .map((it) => it.id)
        .filter((id) => !idsMantidos.has(id));

      if (idsParaExcluir.length > 0) {
        try {
          await (supabase as any)
            .from("cargas_itens")
            .delete()
            .in("item_ordem_id", idsParaExcluir);
        } catch (_) {}
        await supabase
          .from("ordem_compra_itens")
          .delete()
          .in("id", idsParaExcluir);
      }

      for (const i of formEdicao.itens) {
        const itemPayload = {
          ordem_id: ordemDetalhe.id,
          produto_id: i.produto_id || null,
          codigo: i.codigo,
          descricao: i.descricao,
          ncm: i.ncm,
          cst: i.cst,
          unidade: i.unidade,
          quantidade: Number(i.quantidade) || 0,
          valor_unitario: Number(i.valor_unitario) || 0,
          desconto: Number(i.desconto) || 0,
          total: (Number(i.quantidade) || 0) * (Number(i.valor_unitario) || 0) - (Number(i.desconto) || 0),
          cliente_id: i.cliente_id,
          cliente_nome: i.cliente_nome,
          venda_id: i.venda_id ?? null,
          numero_nf: i.numero_nf ?? null,
          cor: i.cor?.trim() || null,
          pastilha: i.pastilha?.trim() || null,
        };

        if (i.id) {
          await supabase.from("ordem_compra_itens").update(itemPayload).eq("id", i.id);
          try {
            await (supabase as any)
              .from("cargas_itens")
              .update({
                valor_unitario: Number(i.valor_unitario) || 0,
                valor_total: (Number(i.quantidade) || 0) * (Number(i.valor_unitario) || 0),
              })
              .eq("item_ordem_id", i.id);
          } catch (_) {}
        } else {
          await supabase.from("ordem_compra_itens").insert(itemPayload);
        }
      }

      // Recalcula total da carga se existir
      try {
        const { data: cargaItens } = await (supabase as any)
          .from("cargas_itens")
          .select("carga_id")
          .eq("ordem_id", ordemDetalhe.id);

        const cargasIds = Array.from(new Set((cargaItens ?? []).map((ci: any) => ci.carga_id)));
        for (const cId of cargasIds) {
          const { data: itensC } = await (supabase as any)
            .from("cargas_itens")
            .select("valor_total")
            .eq("carga_id", cId);
          const totalC = (itensC ?? []).reduce((acc: number, c: any) => acc + Number(c.valor_total ?? 0), 0);
          await (supabase as any).from("cargas").update({ total_valor: totalC }).eq("id", cId);
        }
      } catch (_) {}
    },
    onSuccess: () => {
      toast.success("Ordem de compra atualizada");
      setModoEdicao(false);
      qc.invalidateQueries({ queryKey: ["ordens_compra"] });
      qc.invalidateQueries({ queryKey: ["ordem_compra_itens"] });
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
      cor: novoItem.cor.trim() || produto.cor_pastilha || "",
      pastilha: novoItem.pastilha.trim() || produto.modelo_pastilha || "",
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

  /** Separa unidades de um item em linhas próprias, cada uma com seu vínculo (individual ou lote). */
  const separarItemEdicao = (idx: number, todas: boolean) => {
    setFormEdicao((f) => {
      const itens = [...f.itens];
      const item = itens[idx];
      const qtd = Math.trunc(Number(item.quantidade) || 0);
      if (qtd < 2) return f;
      const descUnit = Number(item.desconto || 0) / Number(item.quantidade);
      const copia = (q: number) => {
        const { id: _id, ...resto } = item as typeof item & { id?: string };
        return { ...resto, quantidade: q, desconto: Number((descUnit * q).toFixed(2)) };
      };
      const novos = todas
        ? Array.from({ length: qtd }, () => copia(1))
        : [copia(qtd - 1), { ...copia(1), cliente_id: null, cliente_nome: null }];
      if (!todas) novos[0] = { ...item, quantidade: qtd - 1, desconto: Number((descUnit * (qtd - 1)).toFixed(2)) };
      itens.splice(idx, 1, ...novos);
      return { ...f, itens };
    });
  };

  const alterarCorItemEdicao = (idx: number, valor: string) => {
    setFormEdicao((f) => {
      const itens = [...f.itens];
      itens[idx] = { ...itens[idx], cor: valor };
      return { ...f, itens };
    });
  };

  const alterarPastilhaItemEdicao = (idx: number, valor: string) => {
    setFormEdicao((f) => {
      const itens = [...f.itens];
      itens[idx] = { ...itens[idx], pastilha: valor };
      return { ...f, itens };
    });
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
      const updates: any = { status };
      if (status === "recebida" || status === "concluida" || status === "entregue") {
        updates.status_carga = "entregue";
      }
      const { error } = await supabase.from("ordens_compra").update(updates).eq("id", id);
      if (error) throw error;

      // Se a ordem foi finalizada/recebida/concluída, atualiza os itens e produtos correspondentes
      if (status === "recebida" || status === "concluida" || status === "entregue") {
        await supabase
          .from("ordem_compra_itens")
          .update({ status_carga: "entregue" })
          .eq("ordem_id", id);

        const itensDaOrdem = itensTodos.filter((it) => it.ordem_id === id);
        const produtoIds = Array.from(
          new Set(itensDaOrdem.map((it) => it.produto_id).filter(Boolean) as string[]),
        );
        if (produtoIds.length > 0) {
          await supabase
            .from("produtos")
            .update({ status_compra: status })
            .in("id", produtoIds);
        }
      }
    },
    onSuccess: () => {
      toast.success("Status atualizado");
      qc.invalidateQueries({ queryKey: ["ordens_compra"] });
      qc.invalidateQueries({ queryKey: ["ordem_compra_itens"] });
      qc.invalidateQueries({ queryKey: ["produtos"] });
      qc.invalidateQueries({ queryKey: ["produtos", "lista-simples"] });
      qc.invalidateQueries({ queryKey: ["venda_itens", "consumo-compras"] });
      qc.invalidateQueries({ queryKey: ["venda_kit", "consumo-compras"] });
      qc.invalidateQueries({ queryKey: ["cargas"] });
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

  /** Atualiza o título criado na execução com os dados da fatura do fornecedor. */
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
        .eq("ordem_compra_id" as never, ordemDetalhe.id as never)
        .is("ordem_pagamento_id" as never, null);
      if (erroBusca) throw erroBusca;
      const tituloId = (existentes?.[0] as { id?: string } | undefined)?.id;
      const dadosConta = {
        tipo: "pagar",
        descricao: `Ordem de compra ${ordemDetalhe.numero ?? ""} - ${ordemDetalhe.fornecedor_nome ?? "Fornecedor"}`,
        parceiro: ordemDetalhe.fornecedor_nome,
        categoria: "Compras",
        valor,
        vencimento: fatura.vencimento,
        observacoes: [fatura.forma, fatura.observacoes].filter(Boolean).join(" - ") || null,
        ordem_compra_id: ordemDetalhe.id,
        created_by: auth.user?.id ?? null,
        saldo_gerenciado_externamente: true,
      };
      const { error: erroConta } = tituloId
        ? await supabase.from("contas").update(dadosConta as never).eq("id", tituloId)
        : await supabase.from("contas").insert({ ...dadosConta, status: "aberto" } as never);
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
      toast.success("Faturamento atualizado no Contas a Pagar");
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

  /** Permite editar valores unitários de itens/piscinas mesmo após a geração da carga, sincronizando ordem e carga. */
  const atualizarValorUnitarioItem = useMutation({
    mutationFn: async ({
      itemId,
      ordemId,
      valorUnitario,
    }: {
      itemId: string;
      ordemId: string;
      valorUnitario: number;
    }) => {
      // 1. Busca o item para recalcular quantidade e desconto
      const { data: itemAtual, error: erroItem } = await supabase
        .from("ordem_compra_itens")
        .select("id, quantidade, desconto, produto_id, descricao")
        .eq("id", itemId)
        .single();
      if (erroItem || !itemAtual) throw erroItem || new Error("Item não encontrado");

      const qtd = Number(itemAtual.quantidade ?? 1);
      const desc = Number(itemAtual.desconto ?? 0);
      const novoTotalItem = Math.max(0, qtd * valorUnitario - desc);

      // 2. Atualiza ordem_compra_itens
      const { error: erroUpdateItem } = await supabase
        .from("ordem_compra_itens")
        .update({
          valor_unitario: valorUnitario,
          total: novoTotalItem,
        })
        .eq("id", itemId);
      if (erroUpdateItem) throw erroUpdateItem;

      // 3. Atualiza também em cargas_itens caso já tenha carga gerada
      try {
        await (supabase as any)
          .from("cargas_itens")
          .update({
            valor_unitario: valorUnitario,
            valor_total: qtd * valorUnitario,
          })
          .eq("item_ordem_id", itemId);

        // Recalcula o valor total da carga se existir
        const { data: cargaItem } = await (supabase as any)
          .from("cargas_itens")
          .select("carga_id")
          .eq("item_ordem_id", itemId)
          .maybeSingle();

        if (cargaItem?.carga_id) {
          const { data: todosItensCarga } = await (supabase as any)
            .from("cargas_itens")
            .select("valor_total")
            .eq("carga_id", cargaItem.carga_id);

          const novoTotalCarga = (todosItensCarga ?? []).reduce(
            (acc: number, cur: any) => acc + Number(cur.valor_total ?? 0),
            0,
          );

          await (supabase as any)
            .from("cargas")
            .update({ total_valor: novoTotalCarga })
            .eq("id", cargaItem.carga_id);
        }
      } catch (e) {
        console.warn("Aviso ao sincronizar carga:", e);
      }

      // 4. Recalcula os totais da ordem de compra
      const { data: todosItensOrdem } = await supabase
        .from("ordem_compra_itens")
        .select("total")
        .eq("ordem_id", ordemId);

      const novoValorProdutos = (todosItensOrdem ?? []).reduce(
        (acc, cur) => acc + Number(cur.total ?? 0),
        0,
      );

      const { data: ordemAtual } = await supabase
        .from("ordens_compra")
        .select("desconto, icms_st_valor")
        .eq("id", ordemId)
        .single();

      const descOrdem = Number(ordemAtual?.desconto ?? 0);
      const icmsStOrdem = Number(ordemAtual?.icms_st_valor ?? 0);
      const novoValorTotal = novoValorProdutos - descOrdem + icmsStOrdem;

      await supabase
        .from("ordens_compra")
        .update({
          valor_produtos: novoValorProdutos,
          icms_base: novoValorProdutos,
          icms_valor: novoValorProdutos * 0.18,
          valor_total: novoValorTotal,
        })
        .eq("id", ordemId);

      // 5. Se tiver produto_id, também atualiza preco_custo no catálogo do produto
      if (itemAtual.produto_id) {
        await supabase
          .from("produtos")
          .update({ preco_custo: valorUnitario })
          .eq("id", itemAtual.produto_id);
      }
    },
    onSuccess: () => {
      toast.success("Valor unitário atualizado com sucesso!");
      qc.invalidateQueries({ queryKey: ["ordens_compra"] });
      qc.invalidateQueries({ queryKey: ["ordem_compra_itens"] });
      qc.invalidateQueries({ queryKey: ["cargas"] });
      qc.invalidateQueries({ queryKey: ["cargas_itens"] });
      qc.invalidateQueries({ queryKey: ["produtos"] });
    },
    onError: (erro: Error) => toast.error(`Erro ao atualizar valor: ${erro.message}`),
  });

  /** Recalcula o valor faturado na nota (soma das NFs lançadas) e grava na ordem. */
  const sincronizarValorNota = async (ordemId: string) => {
    const { data: notas } = await (supabase as any)
      .from("ordem_compra_notas")
      .select("valor")
      .eq("ordem_id", ordemId);
    const total = (notas ?? []).reduce(
      (s: number, n: { valor: number | string | null }) => s + Number(n.valor ?? 0),
      0,
    );
    const { error } = await supabase
      .from("ordens_compra")
      .update({ valor_nota: total } as never)
      .eq("id", ordemId);
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ["ordens_compra"] });
  };

  const adicionarNota = useMutation({
    mutationFn: async () => {
      if (!ordemDetalhe) throw new Error("Ordem não encontrada");
      const primeira = (notasOrdem.data ?? []).length === 0;
      const { error } = await (supabase as any).from("ordem_compra_notas").insert({
        ordem_id: ordemDetalhe.id,
        valor: primeira ? Number(ordemDetalhe.valor_nota ?? 0) : 0,
      });
      if (error) throw error;
      await sincronizarValorNota(ordemDetalhe.id);
    },
    onSuccess: () => {
      toast.success("Nota adicionada");
      qc.invalidateQueries({ queryKey: ["ordem_compra_notas", detalheId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const atualizarNota = useMutation({
    mutationFn: async ({
      id,
      campo,
      valor,
    }: {
      id: string;
      campo: "numero_nf" | "valor";
      valor: string;
    }) => {
      if (!ordemDetalhe) throw new Error("Ordem não encontrada");
      const patch =
        campo === "valor"
          ? { valor: Number(valor) || 0 }
          : { numero_nf: valor.trim() || null };
      const { error } = await (supabase as any)
        .from("ordem_compra_notas")
        .update(patch)
        .eq("id", id);
      if (error) throw error;
      await sincronizarValorNota(ordemDetalhe.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ordem_compra_notas", detalheId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const excluirNota = useMutation({
    mutationFn: async (id: string) => {
      if (!ordemDetalhe) throw new Error("Ordem não encontrada");
      const { error } = await (supabase as any)
        .from("ordem_compra_notas")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await sincronizarValorNota(ordemDetalhe.id);
    },
    onSuccess: () => {
      toast.success("Nota removida");
      qc.invalidateQueries({ queryKey: ["ordem_compra_notas", detalheId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });


  /** Salva automaticamente quantidade, valor, desconto e status de compra do produto. */
  const atualizarCompra = useMutation({
    mutationFn: async ({ id, campo, valor }: { id: string; campo: string; valor: number | string | null }) => {
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
    valor: number | string | null,
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
      qc.invalidateQueries({ queryKey: ["ordem_compra_itens"] });
      qc.invalidateQueries({ queryKey: ["venda_itens", "consumo-compras"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cancelarOrdem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ordens_compra")
        .update({ status: "cancelada", status_carga: null } as any)
        .eq("id", id);
      if (error) throw error;
      await supabase
        .from("ordem_compra_itens")
        .update({ status_carga: null } as any)
        .eq("ordem_id", id);
    },
    onSuccess: () => {
      toast.success("Ordem de Compra cancelada com sucesso! Os itens retornaram para a fila de espera.");
      qc.invalidateQueries({ queryKey: ["ordens_compra"] });
      qc.invalidateQueries({ queryKey: ["ordem_compra_itens"] });
      qc.invalidateQueries({ queryKey: ["venda_itens", "consumo-compras"] });
      qc.invalidateQueries({ queryKey: ["produtos", "lista-simples"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const dispararWhatsAppOrdem = async (ordem: Ordem) => {
    try {
      const itensDestaOrdem = itensTodos.filter((it) => it.ordem_id === ordem.id);
      const fornecedor = fornecedoresCompletos.find((f) => f.id === ordem.fornecedor_id);

      // Gera e baixa o PDF oficial
      try {
        const doc = await gerarPdfOrdemCompra({
          ordem: {
            numero: ordem.numero,
            data_pedido: ordem.data_pedido,
            previsao_entrega: ordem.previsao_entrega,
            condicoes: ordem.condicoes,
            observacoes: ordem.observacoes,
            valor_produtos: ordem.valor_produtos,
            desconto: ordem.desconto,
            valor_total: ordem.valor_total,
            valor_nota: ordem.valor_nota,
            valor_pago: ordem.valor_pago,
            obs_pagamento: ordem.obs_pagamento,
          },
          fornecedor: fornecedor ? { nome: fornecedor.nome, telefone: fornecedor.telefone, email: fornecedor.email, documento: fornecedor.cnpj } : null,
          itens: itensDestaOrdem.map((it) => ({
            id: it.id,
            codigo: it.codigo,
            descricao: it.descricao,
            unidade: it.unidade,
            quantidade: it.quantidade,
            valor_unitario: it.valor_unitario,
            desconto: it.desconto,
            total: it.total,
            cliente_nome: it.cliente_nome,
            cor: it.cor,
            pastilha: it.pastilha,
          })),
        });
        const nomePdf = `Ordem-de-Compra-${(ordem.numero ?? "s-num").replace(/[^\w-]/g, "")}.pdf`;
        doc.save(nomePdf);
        toast.success("PDF oficial baixado.");
      } catch (errPdf) {
        console.warn("PDF não pôde ser gerado para download:", errPdf);
      }

      const resumoItens = itensDestaOrdem
        .map((i) => `• ${i.quantidade}x ${i.descricao} (${i.cliente_nome ?? "Estoque"}) - ${brl(Number(i.total))}`)
        .join("\n");

      const texto = [
        `*ORDEM DE COMPRA: ${ordem.numero ?? ""}*`,
        `*Fornecedor:* ${ordem.fornecedor_nome ?? fornecedor?.nome ?? "—"}`,
        `*Data do Pedido:* ${dataBR(ordem.data_pedido)}`,
        ordem.previsao_entrega ? `*Previsão de Entrega:* ${dataBR(ordem.previsao_entrega)}` : "",
        `*Valor Total:* ${brl(Number(ordem.valor_total))}`,
        "",
        `*Itens da Carga:*`,
        resumoItens || "• Conforme espelho de pedido anexo",
        "",
        `*Faturamento / Entrega:*`,
        `Splash Jardim do Trevo · CNPJ 26.108.962/0001-52`,
        `Comércio e Instalação de Piscinas`,
        "",
        `_O PDF oficial foi gerado e baixado no seu dispositivo. Favor anexá-lo nesta conversa._`,
      ].filter(Boolean).join("\n");

      const fone = (fornecedor?.telefone ?? "").replace(/\D/g, "");
      const foneFinal = fone.length >= 10 ? (fone.startsWith("55") ? fone : `55${fone}`) : "";
      const urlWa = foneFinal
        ? `https://wa.me/${foneFinal}?text=${encodeURIComponent(texto)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
      window.open(urlWa, "_blank", "noopener");
    } catch (e: any) {
      toast.error("Erro ao preparar WhatsApp: " + e.message);
    }
  };

  const dispararEmailOrdem = async (ordem: Ordem) => {
    try {
      const itensDestaOrdem = itensTodos.filter((it) => it.ordem_id === ordem.id);
      const fornecedor = fornecedoresCompletos.find((f) => f.id === ordem.fornecedor_id);

      try {
        const doc = await gerarPdfOrdemCompra({
          ordem: {
            numero: ordem.numero,
            data_pedido: ordem.data_pedido,
            previsao_entrega: ordem.previsao_entrega,
            condicoes: ordem.condicoes,
            observacoes: ordem.observacoes,
            valor_produtos: ordem.valor_produtos,
            desconto: ordem.desconto,
            valor_total: ordem.valor_total,
            valor_nota: ordem.valor_nota,
            valor_pago: ordem.valor_pago,
            obs_pagamento: ordem.obs_pagamento,
          },
          fornecedor: fornecedor ? { nome: fornecedor.nome, telefone: fornecedor.telefone, email: fornecedor.email, documento: fornecedor.cnpj } : null,
          itens: itensDestaOrdem.map((it) => ({
            id: it.id,
            codigo: it.codigo,
            descricao: it.descricao,
            unidade: it.unidade,
            quantidade: it.quantidade,
            valor_unitario: it.valor_unitario,
            desconto: it.desconto,
            total: it.total,
            cliente_nome: it.cliente_nome,
            cor: it.cor,
            pastilha: it.pastilha,
          })),
        });
        const nomePdf = `Ordem-de-Compra-${(ordem.numero ?? "s-num").replace(/[^\w-]/g, "")}.pdf`;
        doc.save(nomePdf);
        toast.success("PDF oficial baixado para anexação.");
      } catch (errPdf) {
        console.warn("PDF não pôde ser gerado para download:", errPdf);
      }

      const resumoItens = itensDestaOrdem
        .map((i) => `• ${i.quantidade}x ${i.descricao} (${i.cliente_nome ?? "Estoque"}) - ${brl(Number(i.total))}`)
        .join("\n");
      const assunto = `Ordem de Compra ${ordem.numero ?? ""} - Splash Jardim do Trevo`;
      const corpo = [
        `Olá,`,
        ``,
        `Segue nossa Ordem de Compra ${ordem.numero ?? ""} emitida em ${dataBR(ordem.data_pedido)}.`,
        `Valor total: ${brl(Number(ordem.valor_total))}`,
        ``,
        `Itens solicitados:`,
        resumoItens,
        ``,
        `Favor confirmar recebimento e previsão de entrega.`,
        ``,
        `Splash Jardim do Trevo`,
      ].join("\n");

      const mailto = `mailto:${fornecedor?.email ?? ""}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
      window.location.href = mailto;
    } catch (e: any) {
      toast.error("Erro ao preparar e-mail: " + e.message);
    }
  };

  /** Remove em lote os itens de ordens já executadas que foram marcados na grade. */
  const excluirItensSelecionados = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("ordem_compra_itens").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Itens removidos");
      setSelecionadosExecutados({});
      qc.invalidateQueries({ queryKey: ["ordem_compra_itens"] });
      qc.invalidateQueries({ queryKey: ["ordens_compra"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  /** Exclui um item específico de uma ordem de compra e atualiza o total da ordem */
  const excluirItemOrdem = useMutation({
    mutationFn: async ({ itemId, ordemId }: { itemId: string; ordemId: string }) => {
      const { error } = await supabase.from("ordem_compra_itens").delete().eq("id", itemId);
      if (error) throw error;
      const { data: itensRestantes } = await supabase
        .from("ordem_compra_itens")
        .select("total")
        .eq("ordem_id", ordemId);
      const novoTotal = (itensRestantes ?? []).reduce((s, it) => s + Number(it.total || 0), 0);
      await supabase
        .from("ordens_compra")
        .update({
          valor_produtos: novoTotal,
          valor_total: novoTotal,
          icms_base: novoTotal,
          icms_valor: novoTotal * 0.18,
        })
        .eq("id", ordemId);
    },
    onSuccess: () => {
      toast.success("Item removido da ordem");
      qc.invalidateQueries({ queryKey: ["ordem_compra_itens"] });
      qc.invalidateQueries({ queryKey: ["ordens_compra"] });
      qc.invalidateQueries({ queryKey: ["venda_itens", "consumo-compras"] });
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

      let numeroCliente: string | null = null;
      for (const i of itensNovaOrdem) {
        if (i.cliente_id && i.cliente_id !== SEM_CLIENTE) {
          const itemComNum = itensTodos.find((it) => it.cliente_id === i.cliente_id);
          if (itemComNum) {
            const o = ordens.find((ord) => ord.id === itemComNum.ordem_id && ord.numero);
            if (o?.numero) {
              numeroCliente = o.numero;
              break;
            }
          }
        }
      }

      const numero = numeroCliente ?? proximoCodigo("OC", (existentes ?? []).map((o) => o.numero));

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
        cor: i.cor?.trim() || null,
        pastilha: i.pastilha?.trim() || null,
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
                aria-label="Buscar por fornecedor, cliente, produto ou vínculo"
                className="pl-9 sm:w-72"
                placeholder="Buscar por fornecedor, cliente, produto ou vínculo"
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
            <Select value={filtroFornecedor} onValueChange={setFiltroFornecedor}>
              <SelectTrigger className="w-48">
                <Building2 className="size-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Fornecedor: Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os fornecedores</SelectItem>
                {fornecedores.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm flex items-center gap-1.5"
              onClick={() => {
                pedirCarga(filtroFornecedor !== "todos" ? filtroFornecedor : null);
              }}
            >
              <Truck className="size-4" />
              📦 PEDIR CARGA
            </Button>
            <Button onClick={() => setNovaOpen(true)}>
              <Plus /> Nova ordem de compra
            </Button>
          </div>
        }
      />

      <Tabs
        value={abaVisao}
        onValueChange={(v) => setAbaVisao(v as any)}
        className="space-y-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-3 print:hidden">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="fornecedores" className="flex items-center gap-2">
              <Building2 className="size-4" />
              <span>Visão por Fornecedor</span>
              {resumoGeralCompra.totalProdutos > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 text-[10px] px-1.5 py-0 h-4 bg-primary/15 text-primary font-bold"
                >
                  {resumoGeralCompra.totalProdutos}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="grade" className="flex items-center gap-2">
              <Layers className="size-4" />
              <span>Grade Geral</span>
            </TabsTrigger>
            <TabsTrigger value="executadas" className="flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              <span>Ordens Emitidas ({ordensFiltradas.length})</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>
              Total a comprar:{" "}
              <strong className="text-foreground font-semibold">
                {brl(resumoGeralCompra.totalValor)}
              </strong>
            </span>
            <span>·</span>
            <span>
              Selecionados:{" "}
              <strong className="text-primary font-semibold">
                {produtosSelecionados.length} ({brl(totalSelecionadoCompra)})
              </strong>
            </span>
          </div>
        </div>

        {/* ABA 1: VISÃO GERAL POR FORNECEDOR (O QUE PRECISO COMPRAR) */}
        <TabsContent value="fornecedores" className="space-y-6 m-0 print:hidden">
          <ExpandableCard>
            <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
              <div>
                <CardTitle>Visão por Fornecedor · Compras Pendentes</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Demandas vinculadas a clientes e reposição de estoque agrupadas por fabricante.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* BARRA DE CONTROLES: FILTRO DE VÍNCULO E NECESSIDADE */}
              <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-4">
                  {/* FILTRO DE VÍNCULO */}
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Filter className="size-3.5" />
                      Vínculo:
                    </span>
                <div className="inline-flex rounded-lg border bg-muted/50 p-0.5">
                  <button
                    type="button"
                    onClick={() => setFiltroVinculo("todos")}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all",
                      filtroVinculo === "todos"
                        ? "bg-background text-foreground shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Todos ({contagensFiltroVinculo.todos})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroVinculo("com_vinculo")}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                      filtroVinculo === "com_vinculo"
                        ? "bg-emerald-600 text-white shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Link2 className="size-3" />
                    Com Vínculo ({contagensFiltroVinculo.comVinculo})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroVinculo("sem_vinculo")}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                      filtroVinculo === "sem_vinculo"
                        ? "bg-amber-600 text-white shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Boxes className="size-3" />
                    Sem Vínculo / Estoque ({contagensFiltroVinculo.semVinculo})
                  </button>
                </div>
              </div>

              {/* FILTRO DE NECESSIDADE E CATÁLOGO */}
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Catálogo:
                </span>
                <div className="inline-flex rounded-lg border bg-muted/50 p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setFiltroExibicaoCatalogo("apenas_vinculados_selecionados");
                      setFiltroNecessidade("precisa_comprar");
                    }}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1",
                      filtroExibicaoCatalogo === "apenas_vinculados_selecionados"
                        ? "bg-background text-foreground shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span>Apenas Vinculados / Demanda</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFiltroExibicaoCatalogo("catalogo_completo");
                      setFiltroNecessidade("todos");
                    }}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1",
                      filtroExibicaoCatalogo === "catalogo_completo"
                        ? "bg-background text-foreground shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span>Catálogo completo</span>
                  </button>
                </div>
              </div>

              {/* BOTÃO TOGGLE OCULTAR JÁ COMPRADOS */}
              <Button
                type="button"
                variant={ocultarJaComprados ? "outline" : "secondary"}
                size="sm"
                onClick={() => setOcultarJaComprados(!ocultarJaComprados)}
                className={cn(
                  "text-xs h-8 gap-1.5 transition-all",
                  ocultarJaComprados
                    ? "border-primary/30 text-foreground hover:bg-muted"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
                )}
                title={
                  ocultarJaComprados
                    ? "Itens que já tiveram ordem de compra gerada ou já foram comprados estão ocultos. Clique para exibir."
                    : "Exibindo itens já comprados. Clique para ocultar."
                }
              >
                {ocultarJaComprados ? (
                  <>
                    <EyeOff className="size-3.5 text-muted-foreground" />
                    <span>Ocultando já comprados</span>
                    {totalJaCompradosOcultos > 0 && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] py-0 px-1 font-mono font-bold bg-muted"
                      >
                        {totalJaCompradosOcultos}
                      </Badge>
                    )}
                  </>
                ) : (
                  <>
                    <Eye className="size-3.5 text-amber-600" />
                    <span className="font-semibold">Exibindo já comprados</span>
                  </>
                )}
              </Button>
            </div>

            {/* AÇÕES DE EXPANSÃO E SELEÇÃO */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => recolherTodosFornecedores(false)}
                className="text-xs h-8"
              >
                <ChevronDown className="size-3.5 mr-1" />
                Expandir todos
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => recolherTodosFornecedores(true)}
                className="text-xs h-8"
              >
                <ChevronUp className="size-3.5 mr-1" />
                Recolher todos
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => marcarTodosProdutos(!todosProdutosSelecionados)}
                className="text-xs h-8"
              >
                {todosProdutosSelecionados ? "Limpar seleção" : "Selecionar todos"}
              </Button>
            </div>
          </div>

          {/* CARDS DE RESUMO GLOBAL */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card/70 border">
              <CardContent className="p-4 space-y-1">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <ShoppingCart className="size-3.5 text-primary" />
                  Total Estimado da Demanda
                </p>
                <p className="text-2xl font-bold tracking-tight text-foreground font-mono">
                  {brl(resumoGeralCompra.totalValor)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {resumoGeralCompra.totalProdutos} produtos · {resumoGeralCompra.totalUnidades} unidades
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/70 border">
              <CardContent className="p-4 space-y-1">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Factory className="size-3.5 text-blue-500" />
                  Fornecedores Envolvidos
                </p>
                <p className="text-2xl font-bold tracking-tight text-foreground font-mono">
                  {resumoGeralCompra.totalFornecedoresComItens}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Fabricantes com compras a realizar
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/70 border border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="p-4 space-y-1">
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Link2 className="size-3.5" />
                  Demandas com Vínculo
                </p>
                <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">
                  {resumoGeralCompra.totalComVinculo} un.
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Vinculadas a pedidos de clientes
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/70 border border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-4 space-y-1">
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Boxes className="size-3.5" />
                  Reposição sem Vínculo
                </p>
                <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 font-mono">
                  {resumoGeralCompra.totalSemVinculo} un.
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Itens para estoque livre
                </p>
              </CardContent>
            </Card>
          </div>

          {/* BARRA DE AÇÃO FLUTUANTE / FIXA QUANDO HÁ SELEÇÃO */}
          {produtosSelecionados.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 p-4 shadow-sm animate-in fade-in">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold flex items-center gap-2 text-primary">
                  <ShoppingCart className="size-4" />
                  {produtosSelecionados.length} produto(s) selecionado(s) para compra
                </p>
                <p className="text-xs text-muted-foreground">
                  Total selecionado: <strong>{brl(totalSelecionadoCompra)}</strong> · A pagar:{" "}
                  <strong className="text-foreground">{brl(totalAPagarCompra)}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => salvarTodosItens.mutate()}
                  disabled={salvarTodosItens.isPending}
                >
                  <Save className="size-3.5 mr-1.5" /> Salvar alterações
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => pedirCarga(produtosSelecionados[0] ? fornecedorDaCompra(produtosSelecionados[0])?.id : null)}
                  disabled={comprarSelecionados.isPending}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Truck className="size-4" />
                  Pedir Carga ({produtosSelecionados.length})
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => comprarSelecionados.mutate()}
                  disabled={comprarSelecionados.isPending}
                  className="font-semibold"
                >
                  <ShoppingCart className="size-4 mr-1.5" />
                  Executar Ordem ({produtosSelecionados.length})
                </Button>
              </div>
            </div>
          )}

          {/* LISTA DE FORNECEDORES E PRODUTOS */}
          {gruposVisaoFornecedor.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground space-y-3">
                <Package className="size-10 mx-auto text-muted-foreground/60" />
                <p className="text-base font-medium">Nenhum produto encontrado para estes filtros.</p>
                <p className="text-xs">
                  Tente alterar o filtro de vínculo ou necessidade para ver mais itens.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFiltroVinculo("todos");
                    setFiltroNecessidade("todos");
                    setBuscaFornecedor("");
                  }}
                >
                  Limpar filtros
                </Button>
              </CardContent>
            </Card>
          ) : (
            gruposVisaoFornecedor.map((grupo) => {
              const recolhido = fornecedoresRecolhidos[grupo.chave] === true;
              return (
                <ExpandableCard
                  key={grupo.chave}
                  className={cn(
                    "overflow-hidden border transition-all shadow-sm",
                    grupo.selecionadosQtd > 0 && "border-primary/40 ring-1 ring-primary/20",
                  )}
                >
                  {/* CABEÇALHO DO FORNECEDOR */}
                  <div className="flex flex-col gap-3 p-4 pr-12 bg-muted/20 border-b sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary mt-0.5">
                        <Factory className="size-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-base text-foreground tracking-tight">
                            {grupo.nome}
                          </h3>
                          <Badge variant="secondary" className="text-xs font-mono font-semibold">
                            {grupo.totalItens} {grupo.totalItens === 1 ? "produto" : "produtos"} · {grupo.totalUnidades} un.
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-xs">
                          {grupo.totalComVinculo > 0 && (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-medium"
                            >
                              <Link2 className="size-3 mr-1" />
                              {grupo.totalComVinculo} un. com vínculo (pedidos)
                            </Badge>
                          )}
                          {grupo.totalSemVinculo > 0 && (
                            <Badge
                              variant="outline"
                              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px] font-medium"
                            >
                              <Boxes className="size-3 mr-1" />
                              {grupo.totalSemVinculo} un. para estoque
                            </Badge>
                          )}
                          {grupo.totalDemandaPedidos > 0 && (
                            <span className="text-muted-foreground">
                              · Demanda de pedidos: <strong>{grupo.totalDemandaPedidos} un.</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0">
                      <div className="text-right mr-1">
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                          Total Estimado
                        </p>
                        <p className="text-lg font-bold font-mono text-foreground">
                          {brl(grupo.totalValor)}
                        </p>
                      </div>

                      {(() => {
                        const produtosDesteFornecedor = produtos.filter(
                          (p) => fornecedorDaCompra(p)?.id === grupo.fornecedor.id,
                        );
                        const produtosDisponiveis = produtosDesteFornecedor.filter(
                          (p) =>
                            !grupo.itens.some((it) => it.produto.id === p.id) &&
                            (!ocultarJaComprados || !ehProdutoJaCompradoOuFaturado(p)),
                        );
                        if (produtosDisponiveis.length === 0) return null;
                        return (
                          <Select
                            value=""
                            onValueChange={(prodId) => {
                              if (!prodId) return;
                              setSelecionadosCompra((prev) => ({ ...prev, [prodId]: true }));
                              setQuantidadesCompra((prev) => ({ ...prev, [prodId]: prev[prodId] ?? 1 }));
                              const pNome = produtos.find((p) => p.id === prodId)?.nome;
                              toast.success(`"${pNome}" adicionado à lista`);
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs w-44 bg-background border-dashed">
                              <Plus className="size-3.5 mr-1 text-primary" />
                              <SelectValue placeholder="+ Adicionar produto..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-64">
                              {produtosDisponiveis.map((prod) => (
                                <SelectItem key={prod.id} value={prod.id}>
                                  {prod.nome} {prod.codigo ? `(${prod.codigo})` : ""} · {brl(Number(prod.preco_custo ?? 0))}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        );
                      })()}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => alternarSelecaoGrupoFornecedor(grupo)}
                        className="text-xs h-8"
                      >
                        {grupo.todosSelecionados ? "Desmarcar itens" : "Selecionar itens"}
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => comprarItensDoFornecedor(grupo)}
                        disabled={comprarSelecionados.isPending}
                        className="text-xs h-8 font-medium gap-1.5"
                      >
                        <ShoppingCart className="size-3.5" />
                        Comprar deste fornecedor
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          pedirCarga(grupo.fornecedor.id);
                        }}
                        className="text-xs h-8 font-semibold gap-1.5 border border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                      >
                        <Truck className="size-3.5" />
                        Pedir Carga
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => alternarRecolhimentoFornecedor(grupo.chave)}
                        className="size-8"
                        title={recolhido ? "Expandir fornecedor" : "Recolher fornecedor"}
                        aria-label={recolhido ? "Expandir fornecedor" : "Recolher fornecedor"}
                      >
                        {recolhido ? (
                          <ChevronDown className="size-4 text-muted-foreground" />
                        ) : (
                          <ChevronUp className="size-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* TABELA DE PRODUTOS DO FORNECEDOR */}
                  {!recolhido && (
                    <div className="overflow-x-auto">
                      <Table className="w-full min-w-[1300px]">
                        <TableHeader>
                          <TableRow className="text-xs bg-muted/10">
                            <TableHead className="w-10">
                              <Checkbox
                                aria-label={`Selecionar todos os produtos de ${grupo.nome}`}
                                checked={grupo.todosSelecionados}
                                onCheckedChange={() => alternarSelecaoGrupoFornecedor(grupo)}
                              />
                            </TableHead>
                            <TableHead className="w-24">SKU</TableHead>
                            <TableHead className="min-w-56">Produto</TableHead>
                            <TableHead className="w-32">Estoque</TableHead>
                            <TableHead className="w-44">Demanda Pedidos</TableHead>
                            <TableHead className="min-w-48">Vínculo (Cliente / Estoque)</TableHead>
                            <TableHead className="w-20 text-right">Qtde</TableHead>
                            <TableHead className="w-28 text-right">Vl. Unit.</TableHead>
                            <TableHead className="w-20 text-right">% Desc.</TableHead>
                            <TableHead className="w-28 text-right">Total</TableHead>
                            <TableHead className="w-32">Status</TableHead>
                            <TableHead className="w-40 min-w-[160px] text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {grupo.itens.map((item) => (
                            <Fragment key={item.produto.id}>
                              <TableRow
                                key={item.produto.id}
                              className={cn(
                                selecionadosCompra[item.produto.id] && "bg-primary/5",
                                item.temVinculo && "border-l-2 border-l-emerald-500",
                              )}
                            >
                              <TableCell>
                                <Checkbox
                                  aria-label={`Selecionar ${item.produto.nome}`}
                                  checked={selecionadosCompra[item.produto.id] === true}
                                  onCheckedChange={(valor) =>
                                    alternarSelecaoProdutoPai(
                                      item.produto.id,
                                      valor === true,
                                      item.vinculos.length,
                                    )
                                  }
                                />
                              </TableCell>

                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {item.produto.codigo ?? "—"}
                              </TableCell>

                              <TableCell>
                                <p className="font-medium text-sm leading-snug">{item.produto.nome}</p>
                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                  {item.produto.categoria && (
                                    <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal text-muted-foreground">
                                      {item.produto.categoria}
                                    </Badge>
                                  )}
                                  {item.produto.unidade && (
                                    <span className="text-[11px] text-muted-foreground">({item.produto.unidade})</span>
                                  )}
                                  {(item.produto.cor_pastilha || item.produto.modelo_pastilha) && (
                                    <span className="text-[11px] text-muted-foreground font-mono">
                                      {[item.produto.cor_pastilha, item.produto.modelo_pastilha].filter(Boolean).join(" · ")}
                                    </span>
                                  )}
                                  {item.jaComprado && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] py-0 px-1.5 font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                    >
                                      Já Comprado / O.C. Gerada
                                    </Badge>
                                  )}
                                  {item.jaFaturado && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] py-0 px-1.5 font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                                    >
                                      Faturado
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>

                              <TableCell>
                                {item.estoqueZerado ? (
                                  <Badge variant="destructive" className="text-[10px] py-0 px-1.5 font-semibold">
                                    Zerado (0)
                                  </Badge>
                                ) : item.estoqueBaixo ? (
                                  <Badge
                                    variant="secondary"
                                    className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] py-0 px-1.5 font-semibold"
                                  >
                                    Baixo ({item.estoqueAtual} / mín {item.estoqueMinimo})
                                  </Badge>
                                ) : (
                                  <span className="text-xs font-mono text-muted-foreground">
                                    {item.estoqueAtual} {item.produto.unidade}
                                  </span>
                                )}
                              </TableCell>

                              <TableCell>
                                {item.demanda && item.demanda.total > 0 ? (
                                  <div className="space-y-0.5">
                                    <Badge
                                      variant="outline"
                                      className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[10px] py-0 px-1.5 font-semibold"
                                    >
                                      {item.demanda.total} un. em {item.demanda.pedidos.length} pedido(s)
                                    </Badge>
                                    <p
                                      className="text-[10px] text-muted-foreground truncate max-w-[180px]"
                                      title={item.demanda.pedidos.map((p) => p.rotulo).join(" · ")}
                                    >
                                      {item.demanda.pedidos.map((p) => p.rotulo).join(" · ")}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>

                              <TableCell>
                                <div className="space-y-1">
                                  {item.vinculos.map((vinculoAtual, indice) => (
                                    <div key={`${item.produto.id}-vinculo-${indice}`} className="flex items-center gap-1.5">
                                      <Checkbox
                                        aria-label={`Comprar vínculo ${indice + 1} de ${item.produto.nome}`}
                                        checked={isVinculoSelecionado(item.produto.id, indice)}
                                        onCheckedChange={() =>
                                          alternarSelecaoVinculo(
                                            item.produto.id,
                                            indice,
                                            item.vinculos.length,
                                          )
                                        }
                                      />
                                      {item.vinculos.length > 1 && (
                                        <span className="w-4 shrink-0 text-[10px] font-mono text-muted-foreground">
                                          #{indice + 1}
                                        </span>
                                      )}
                                      <Select
                                        value={vinculoAtual || SEM_CLIENTE}
                                        onValueChange={(valor) => {
                                          const vinculo = valor === SEM_CLIENTE ? "" : valor;
                                          const proximos = vinculosDoProduto(item.produto);
                                          proximos[indice] = vinculo;
                                          setVinculosCompra((atual) => ({
                                            ...atual,
                                            [item.produto.id]: proximos,
                                          }));
                                          if (indice === 0) {
                                            salvarAutomaticamente(
                                              item.produto.id,
                                              "venda_vinculo_id",
                                              vinculo || (null as unknown as string),
                                              true,
                                            );
                                          }
                                        }}
                                      >
                                        <SelectTrigger
                                          className={cn(
                                            "h-7 text-xs w-48 font-medium",
                                            vinculoAtual && vinculoAtual !== SEM_CLIENTE
                                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                                              : "border-border bg-background text-muted-foreground",
                                          )}
                                        >
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value={SEM_CLIENTE}>
                                            <span className="flex items-center gap-1.5 text-xs">
                                              <Boxes className="size-3 text-amber-500" />
                                              <span>Estoque Livre (Sem cliente)</span>
                                            </span>
                                          </SelectItem>
                                          {vendasVinculo.map((venda) => (
                                            <SelectItem key={venda.id} value={venda.id}>
                                              <span className="flex items-center gap-1.5 text-xs">
                                                <Link2 className="size-3 text-emerald-500" />
                                                <span>
                                                  {venda.numero ?? "Pedido"} — {venda.cliente_nome ?? "Cliente"}
                                                </span>
                                              </span>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  ))}
                                </div>
                              </TableCell>

                              <TableCell>
                                <Input
                                  aria-label={`Quantidade de ${item.produto.nome}`}
                                  className="ml-auto h-8 w-20 text-right font-medium"
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={
                                    quantidadesCompra[item.produto.id] ??
                                    String(Number(item.produto.quantidade_compra ?? 1))
                                  }
                                  onChange={(evento) => {
                                    const valor = evento.target.value;
                                    setQuantidadesCompra((atual) => ({
                                      ...atual,
                                      [item.produto.id]: valor,
                                    }));
                                    salvarAutomaticamente(
                                      item.produto.id,
                                      "quantidade_compra",
                                      Math.max(Number(valor) || 0, 0),
                                    );
                                  }}
                                  onBlur={(evento) =>
                                    salvarAutomaticamente(
                                      item.produto.id,
                                      "quantidade_compra",
                                      Math.max(Number(evento.target.value) || 0, 0),
                                      true,
                                    )
                                  }
                                />
                              </TableCell>

                              <TableCell>
                                <Input
                                  aria-label={`Valor unitário de ${item.produto.nome}`}
                                  className="ml-auto h-8 w-24 text-right font-mono"
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={
                                    valoresCompra[item.produto.id] ??
                                    String(Number(item.produto.preco_custo))
                                  }
                                  onChange={(evento) => {
                                    const valor = evento.target.value;
                                    setValoresCompra((atual) => ({
                                      ...atual,
                                      [item.produto.id]: valor,
                                    }));
                                    salvarAutomaticamente(
                                      item.produto.id,
                                      "preco_custo",
                                      Math.max(Number(valor) || 0, 0),
                                    );
                                  }}
                                  onBlur={(evento) =>
                                    salvarAutomaticamente(
                                      item.produto.id,
                                      "preco_custo",
                                      Math.max(Number(evento.target.value) || 0, 0),
                                      true,
                                    )
                                  }
                                />
                              </TableCell>

                              <TableCell>
                                <Input
                                  aria-label={`Desconto percentual de ${item.produto.nome}`}
                                  className="ml-auto h-8 w-20 text-right font-mono"
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={
                                    percentuaisCompra[item.produto.id] ??
                                    String(Number(item.produto.desconto_compra ?? 0))
                                  }
                                  onChange={(evento) => {
                                    const valor = evento.target.value;
                                    setPercentuaisCompra((atual) => ({
                                      ...atual,
                                      [item.produto.id]: valor,
                                    }));
                                    salvarAutomaticamente(
                                      item.produto.id,
                                      "desconto_compra",
                                      Math.min(Math.max(Number(valor) || 0, 0), 100),
                                    );
                                  }}
                                  onBlur={(evento) =>
                                    salvarAutomaticamente(
                                      item.produto.id,
                                      "desconto_compra",
                                      Math.min(Math.max(Number(evento.target.value) || 0, 0), 100),
                                      true,
                                    )
                                  }
                                />
                              </TableCell>

                              <TableCell className="text-right font-semibold font-mono text-sm">
                                {brl(item.totalItem)}
                              </TableCell>

                              <TableCell>
                                <Select
                                  value={statusCompra[item.produto.id] ?? item.produto.status_compra ?? "a_comprar"}
                                  onValueChange={(valor) => {
                                    setStatusCompra((atual) => ({ ...atual, [item.produto.id]: valor }));
                                    salvarAutomaticamente(item.produto.id, "status_compra", valor, true);
                                  }}
                                >
                                  <SelectTrigger className="h-8 w-28 text-xs">
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

                              <TableCell className="text-right w-40 min-w-[160px] whitespace-nowrap">
                                <div className="flex justify-end items-center gap-1">
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="size-7 text-muted-foreground hover:text-foreground"
                                    aria-label={`Expandir detalhes de ${item.produto.nome}`}
                                    title={linhasExpandidas[item.produto.id] ? "Recolher detalhes" : "Expandir detalhes"}
                                    onClick={() =>
                                      setLinhasExpandidas((prev) => ({
                                        ...prev,
                                        [item.produto.id]: !prev[item.produto.id],
                                      }))
                                    }
                                  >
                                    {linhasExpandidas[item.produto.id] ? (
                                      <ChevronUp className="size-3.5" />
                                    ) : (
                                      <ChevronDown className="size-3.5" />
                                    )}
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="size-7"
                                    aria-label={`Editar ${item.produto.nome}`}
                                    title="Editar produto"
                                    onClick={() => abrirEdicaoProdutoCompra(item.produto)}
                                  >
                                    <Pencil className="size-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="size-7 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
                                    aria-label={`Desvincular ${item.produto.nome}`}
                                    title="Desvincular de pedidos (enviar para estoque livre)"
                                    onClick={() => {
                                      salvarAutomaticamente(item.produto.id, "venda_vinculo_id", null, true);
                                      setVinculosCompra((prev) => ({
                                        ...prev,
                                        [item.produto.id]: [SEM_CLIENTE],
                                      }));
                                      toast.success(`Vínculo de "${item.produto.nome}" desfeito.`);
                                    }}
                                  >
                                    <Unlink className="size-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="size-7 text-destructive hover:bg-destructive/10"
                                    aria-label={`Excluir ${item.produto.nome}`}
                                    title="Excluir produto"
                                    disabled={excluirProdutoCompra.isPending}
                                    onClick={() => {
                                      if (window.confirm(`Excluir ${item.produto.nome}?`)) {
                                        excluirProdutoCompra.mutate(item.produto);
                                      }
                                    }}
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                            {linhasExpandidas[item.produto.id] && (
                              <TableRow className="bg-muted/15 border-b-2">
                                <TableCell colSpan={12} className="p-3">
                                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                                    <div className="p-2.5 rounded-md border bg-card space-y-1">
                                      <p className="font-semibold text-muted-foreground flex items-center gap-1 text-[11px] uppercase">
                                        <Link2 className="size-3 text-emerald-500" />
                                        Pedidos Vinculados
                                      </p>
                                      {item.demanda && item.demanda.pedidos.length > 0 ? (
                                        <div className="space-y-1 pt-0.5">
                                          {item.demanda.pedidos.map((p) => (
                                            <div key={p.id} className="flex items-center justify-between font-medium">
                                              <span className="truncate max-w-[160px]">{p.rotulo}</span>
                                              <Badge variant="secondary" className="font-mono text-[10px] py-0 px-1">
                                                {p.quantidade} un.
                                              </Badge>
                                            </div>
                                          ))}
                                        </div>
                                      ) : item.produto.venda_vinculo_id ? (
                                        <p className="text-foreground">
                                          {vendaPorId.get(item.produto.venda_vinculo_id)?.numero ?? "Pedido"} —{" "}
                                          {vendaPorId.get(item.produto.venda_vinculo_id)?.cliente_nome ?? "Cliente"}
                                        </p>
                                      ) : (
                                        <p className="text-muted-foreground italic">Reposição para estoque (sem pedidos diretos)</p>
                                      )}
                                    </div>

                                    <div className="p-2.5 rounded-md border bg-card space-y-1">
                                      <p className="font-semibold text-muted-foreground flex items-center gap-1 text-[11px] uppercase">
                                        <Boxes className="size-3 text-blue-500" />
                                        Situação do Estoque
                                      </p>
                                      <p className="text-foreground">
                                        Estoque atual: <strong>{item.estoqueAtual} {item.produto.unidade}</strong>
                                      </p>
                                      <p className="text-muted-foreground">
                                        Estoque mínimo: {item.estoqueMinimo} {item.produto.unidade}
                                      </p>
                                    </div>

                                    <div className="p-2.5 rounded-md border bg-card space-y-1">
                                      <p className="font-semibold text-muted-foreground text-[11px] uppercase">
                                        Dados Fiscais / Unidade
                                      </p>
                                      <p className="text-foreground">
                                        NCM: <span className="font-mono">{item.produto.ncm ?? "—"}</span> · CST: <span className="font-mono">{item.produto.cst ?? "—"}</span>
                                      </p>
                                      <p className="text-muted-foreground">
                                        Unidade: {item.produto.unidade} · Tipo: {item.produto.tipo}
                                      </p>
                                    </div>

                                    <div className="p-2.5 rounded-md border bg-card space-y-1">
                                      <p className="font-semibold text-muted-foreground text-[11px] uppercase">
                                        Especificações do Modelo
                                      </p>
                                      <p className="text-foreground truncate">
                                        {item.produto.cor_pastilha ? `Cor: ${item.produto.cor_pastilha}` : "Cor padrão"}
                                        {item.produto.modelo_pastilha ? ` · Pastilha: ${item.produto.modelo_pastilha}` : ""}
                                      </p>
                                      <p className="text-muted-foreground">
                                        Custo unitário base: {brl(Number(item.produto.preco_custo))}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </ExpandableCard>
              );
            })
          )}
            </CardContent>
          </ExpandableCard>
        </TabsContent>

        {/* ABA 2: GRADE GERAL DE PRODUTOS */}
        <TabsContent value="grade" className="space-y-6 m-0 print:hidden">
          <ExpandableCard>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Ordem de compra · Grade Geral</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Mostrando {produtosFiltrados.length} item(ns) vinculados ou selecionados para compra. Itens já comprados são ocultados automaticamente.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button
              type="button"
              variant={ocultarJaComprados ? "outline" : "secondary"}
              size="sm"
              onClick={() => setOcultarJaComprados(!ocultarJaComprados)}
              className="text-xs h-8 gap-1.5"
            >
              {ocultarJaComprados ? (
                <>
                  <EyeOff className="size-3.5 text-muted-foreground" />
                  <span>Ocultando já comprados</span>
                  {totalJaCompradosOcultos > 0 && (
                    <Badge variant="secondary" className="text-[10px] py-0 px-1 font-mono font-bold">
                      {totalJaCompradosOcultos}
                    </Badge>
                  )}
                </>
              ) : (
                <>
                  <Eye className="size-3.5 text-primary" />
                  <span>Exibindo já comprados</span>
                </>
              )}
            </Button>
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
                  <TableHead className="text-right w-40 min-w-[160px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtosFiltrados.map((produto) => {
                  const fornecedor = fornecedorDaCompra(produto);
                  return (
                    <Fragment key={produto.id}>
                      <TableRow key={produto.id}>
                      <TableCell>
                        <Checkbox
                          aria-label={`Selecionar ${produto.nome}`}
                          checked={selecionadosCompra[produto.id] === true}
                          onCheckedChange={(valor) =>
                            alternarSelecaoProdutoPai(
                              produto.id,
                              valor === true,
                              vinculosDoProduto(produto).length,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">Nova</TableCell>
                      <TableCell className="font-medium">{fornecedor?.nome ?? "Não encontrado"}</TableCell>
                      <TableCell className="font-mono text-xs">{produto.codigo ?? "—"}</TableCell>
                      <TableCell>
                        <p className="font-medium text-sm leading-snug">{produto.nome}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          {ehProdutoJaCompradoOuFaturado(produto) && (
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 px-1.5 font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                            >
                              Já Comprado / O.C. Gerada
                            </Badge>
                          )}
                          {itensCompradosInfo.produtosFaturadosOuConcluidos.has(produto.id) && (
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 px-1.5 font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                            >
                              Faturado
                            </Badge>
                          )}
                        </div>
                      </TableCell>
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
                          step="1"
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
                        <div className="space-y-1.5">
                          {vinculosDoProduto(produto).map((vinculoAtual, indice) => (
                            <div key={`${produto.id}-vinculo-${indice}`} className="flex items-center gap-1.5">
                              <Checkbox
                                aria-label={`Comprar vínculo ${indice + 1} de ${produto.nome}`}
                                checked={isVinculoSelecionado(produto.id, indice)}
                                onCheckedChange={() =>
                                  alternarSelecaoVinculo(
                                    produto.id,
                                    indice,
                                    vinculosDoProduto(produto).length,
                                  )
                                }
                              />
                              <span className="w-5 shrink-0 text-xs text-muted-foreground">{indice + 1}.</span>
                              <Select
                                value={vinculoAtual || SEM_CLIENTE}
                                onValueChange={(valor) => {
                                  const vinculo = valor === SEM_CLIENTE ? "" : valor;
                                  const proximos = vinculosDoProduto(produto);
                                  proximos[indice] = vinculo;
                                  setVinculosCompra((atual) => ({ ...atual, [produto.id]: proximos }));
                                  if (indice === 0) {
                                    salvarAutomaticamente(
                                      produto.id,
                                      "venda_vinculo_id",
                                      vinculo || (null as unknown as string),
                                      true,
                                    );
                                  }
                                }}
                              >
                                <SelectTrigger className="w-48" aria-label={`Vínculo ${indice + 1} de ${produto.nome}`}>
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
                            </div>
                          ))}
                        </div>
                        {(() => {
                          const demanda = demandaPorProduto.get(produto.id);
                          if (!demanda || demanda.pedidos.length === 0) return null;
                          return (
                            <div className="mt-1 w-48 text-xs text-muted-foreground">
                              <p className="font-medium">
                                Demanda: {demanda.total} un. em {demanda.pedidos.length} pedido(s)
                              </p>
                              <ul className="space-y-0.5">
                                {demanda.pedidos.slice(0, 4).map((p) => (
                                  <li key={p.id} className="truncate">
                                    {p.rotulo} · {p.quantidade} un.
                                  </li>
                                ))}
                                {demanda.pedidos.length > 4 && (
                                  <li>+{demanda.pedidos.length - 4} outro(s)</li>
                                )}
                              </ul>
                            </div>
                          );
                        })()}
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
                      <TableCell className="text-right w-40 min-w-[160px] whitespace-nowrap">
                        <div className="flex justify-end items-center gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-7 text-muted-foreground hover:text-foreground"
                            aria-label={`Expandir detalhes de ${produto.nome}`}
                            title={linhasExpandidas[produto.id] ? "Recolher detalhes" : "Expandir detalhes"}
                            onClick={() =>
                              setLinhasExpandidas((prev) => ({
                                ...prev,
                                [produto.id]: !prev[produto.id],
                              }))
                            }
                          >
                            {linhasExpandidas[produto.id] ? (
                              <ChevronUp className="size-3.5" />
                            ) : (
                              <ChevronDown className="size-3.5" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-7"
                            aria-label={`Editar ${produto.nome}`}
                            title="Editar produto"
                            onClick={() => abrirEdicaoProdutoCompra(produto)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-7 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
                            aria-label={`Desvincular ${produto.nome}`}
                            title="Desvincular de pedidos (enviar para estoque livre)"
                            onClick={() => {
                              salvarAutomaticamente(produto.id, "venda_vinculo_id", null, true);
                              setVinculosCompra((prev) => ({
                                ...prev,
                                [produto.id]: [SEM_CLIENTE],
                              }));
                              toast.success(`Vínculo de "${produto.nome}" desfeito.`);
                            }}
                          >
                            <Unlink className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-7 text-destructive hover:bg-destructive/10"
                            aria-label={`Excluir ${produto.nome}`}
                            title="Excluir produto"
                            disabled={excluirProdutoCompra.isPending}
                            onClick={() => {
                              if (window.confirm(`Excluir permanentemente o produto "${produto.nome}"?`)) {
                                excluirProdutoCompra.mutate(produto);
                              }
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {linhasExpandidas[produto.id] && (
                      <TableRow className="bg-muted/15 border-b-2">
                        <TableCell colSpan={15} className="p-3">
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                            <div className="p-2.5 rounded-md border bg-card space-y-1">
                              <p className="font-semibold text-muted-foreground flex items-center gap-1 text-[11px] uppercase">
                                <Link2 className="size-3 text-emerald-500" />
                                Pedidos Vinculados
                              </p>
                              {(() => {
                                const demanda = demandaPorProduto.get(produto.id);
                                if (!demanda || demanda.pedidos.length === 0) {
                                  return <p className="text-muted-foreground">Destinado ao estoque livre (sem vínculo)</p>;
                                }
                                return (
                                  <div className="space-y-1 pt-0.5">
                                    {demanda.pedidos.map((p) => (
                                      <div key={p.id} className="flex items-center justify-between font-medium">
                                        <span className="truncate max-w-[160px]">{p.rotulo}</span>
                                        <Badge variant="secondary" className="font-mono text-[10px] py-0 px-1">
                                          {p.quantidade} un.
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="p-2.5 rounded-md border bg-card space-y-1">
                              <p className="font-semibold text-muted-foreground text-[11px] uppercase">
                                Especificações
                              </p>
                              <div className="space-y-0.5 text-muted-foreground">
                                <p><span className="text-foreground font-medium">Categoria:</span> {produto.categoria || "—"}</p>
                                <p><span className="text-foreground font-medium">Tipo:</span> {produto.tipo || "—"}</p>
                                <p><span className="text-foreground font-medium">Unidade:</span> {produto.unidade || "UN"}</p>
                              </div>
                            </div>
                            <div className="p-2.5 rounded-md border bg-card space-y-1">
                              <p className="font-semibold text-muted-foreground text-[11px] uppercase">
                                Acabamento & Modelo
                              </p>
                              <div className="space-y-0.5 text-muted-foreground">
                                <p><span className="text-foreground font-medium">Cor:</span> {coresCompra[produto.id] ?? produto.cor_pastilha ?? "—"}</p>
                                <p><span className="text-foreground font-medium">Modelo Pastilha:</span> {modelosCompra[produto.id] ?? produto.modelo_pastilha ?? "—"}</p>
                              </div>
                            </div>
                            <div className="p-2.5 rounded-md border bg-card space-y-1">
                              <p className="font-semibold text-muted-foreground text-[11px] uppercase">
                                Dados Fiscais & Estoque
                              </p>
                              <div className="space-y-0.5 text-muted-foreground">
                                <p><span className="text-foreground font-medium">NCM:</span> {produto.ncm || "—"}</p>
                                <p><span className="text-foreground font-medium">CST:</span> {produto.cst || "—"}</p>
                                <p><span className="text-foreground font-medium">Estoque Atual:</span> {produto.estoque_atual ?? 0} un.</p>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
                {linhasExecutadas.map(({ item, ordem, produto, venda }) => (
                  <TableRow key={`executada-${item.id}`}>
                    <TableCell>
                      <Checkbox
                        aria-label={`Selecionar item ${item.descricao}`}
                        checked={selecionadosExecutados[item.id] === true}
                        onCheckedChange={(valor) =>
                          setSelecionadosExecutados((atual) => ({
                            ...atual,
                            [item.id]: valor === true,
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold">{ordem.numero ?? "—"}</TableCell>
                    <TableCell className="font-medium">{ordem.fornecedor_nome ?? "Não definido"}</TableCell>
                    <TableCell className="font-mono text-xs">{item.codigo ?? "—"}</TableCell>
                    <TableCell>{item.descricao}</TableCell>
                    <TableCell>{produto?.cor_pastilha ?? "—"}</TableCell>
                    <TableCell>{produto?.modelo_pastilha ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        aria-label={`Valor unitário de ${item.descricao}`}
                        className="h-8 w-28 text-right font-mono ml-auto"
                        defaultValue={Number(item.valor_unitario) || 0}
                        key={`exec-vlr-${item.id}-${item.valor_unitario}`}
                        onBlur={(evento) => {
                          const novoValor = Math.max(Number(evento.target.value) || 0, 0);
                          if (novoValor !== Number(item.valor_unitario)) {
                            atualizarValorUnitarioItem.mutate({
                              itemId: item.id,
                              ordemId: ordem.id,
                              valorUnitario: novoValor,
                            });
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(item.quantidade) * Number(item.valor_unitario) > 0
                        ? `${((Number(item.desconto) / (Number(item.quantidade) * Number(item.valor_unitario))) * 100).toFixed(2)}%`
                        : "0%"}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{brl(Number(item.total))}</TableCell>
                    <TableCell>
                      {(() => {
                        if (venda)
                          return `${venda.numero ?? "Pedido"} — ${item.cliente_nome ?? venda.cliente_nome ?? "Cliente"}`;
                        const vinculoProduto = produto?.venda_vinculo_id
                          ? vendaPorId.get(produto.venda_vinculo_id)
                          : undefined;
                        if (vinculoProduto)
                          return `${vinculoProduto.numero ?? "Pedido"} — ${vinculoProduto.cliente_nome ?? "Cliente"}`;
                        const pedidos = produto ? demandaPorProduto.get(produto.id)?.pedidos : undefined;
                        if (pedidos && pedidos.length > 0)
                          return pedidos.map((p) => p.rotulo).join(" · ");
                        return "Estoque";
                      })()}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={ordem.status}
                        onValueChange={(status) => alterarStatusOrdem(ordem, status)}
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
                        <BotaoVisualizarDocumento
                          tipo="ordem_compra"
                          id={ordem.id}
                          titulo={`Visualizar ordem de compra ${ordem.numero ?? ""}`}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          title={`Editar/abrir ordem ${ordem.numero ?? ""}`}
                          onClick={() => {
                            setModoEdicao(false);
                            setDetalheId(ordem.id);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title={`Excluir o item "${item.descricao}" desta ordem`}
                          className="text-destructive hover:bg-destructive/10"
                          disabled={excluirItemOrdem.isPending}
                          onClick={() => {
                            if (window.confirm(`Excluir o item "${item.descricao}" da ordem ${ordem.numero ?? ""}?`)) {
                              excluirItemOrdem.mutate({ itemId: item.id, ordemId: ordem.id });
                            }
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {itensExecutadosSelecionados.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (!window.confirm(`Excluir ${itensExecutadosSelecionados.length} item(ns) das ordens executadas?`)) return;
                  excluirItensSelecionados.mutate(itensExecutadosSelecionados.map(({ item }) => item.id));
                }}
                disabled={excluirItensSelecionados.isPending}
              >
                <Trash2 /> Excluir itens selecionados ({itensExecutadosSelecionados.length})
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => salvarTodosItens.mutate()}
              disabled={produtos.length === 0 || salvarTodosItens.isPending}
            >
              <Save /> Salvar itens
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5"
              onClick={() =>
                pedirCarga(
                  produtosSelecionados[0]
                    ? fornecedorDaCompra(produtosSelecionados[0])?.id
                    : null,
                )
              }
              disabled={produtosSelecionados.length === 0 || comprarSelecionados.isPending}
            >
              <Truck className="size-4" /> Pedir Carga ({produtosSelecionados.length})
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
    </TabsContent>

    {/* ABA 3: ORDENS EMITIDAS E PAGAMENTOS */}
    <TabsContent value="executadas" className="space-y-6 m-0 print:hidden">
      <ExpandableCard>
        <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
          <div>
            <CardTitle>Ordens Executadas e Pagamentos</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Cada ordem permanece aqui com o número, o valor pago e o saldo.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {ordensFiltradas.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground space-y-2">
                <CheckCircle2 className="size-8 mx-auto text-muted-foreground/60" />
                <p className="text-base font-medium">Nenhuma ordem de compra emitida encontrada.</p>
                <p className="text-xs">
                  Quando você executar ordens na Visão por Fornecedor ou na Grade Geral, elas aparecerão aqui.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {ordensFiltradas.map((ordem) => {
                const pago = totaisPagosPorOrdem.get(ordem.id) ?? Number(ordem.valor_pago ?? 0);
                const total = Number(ordem.valor_total ?? 0);
                const saldo = total - pago;
                const pctPago = total > 0 ? Math.min(Math.max(pago / total, 0), 1) : 0;
                const pctLabel = Math.round(pctPago * 100);
                const itensDestaOrdem = itensTodos.filter((it) => it.ordem_id === ordem.id);
                const tom =
                  pctPago >= 1
                    ? {
                        fill: "bg-emerald-500/15",
                        border: "border-emerald-500/30",
                        texto: "text-emerald-400",
                        selo: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
                        sombra: "shadow-emerald-500/5",
                      }
                    : pctPago > 0
                      ? {
                          fill: "bg-amber-500/15",
                          border: "border-amber-500/20",
                          texto: "text-amber-400",
                          selo: "bg-amber-500/20 border-amber-500/40 text-amber-400",
                          sombra: "shadow-amber-500/5",
                        }
                      : {
                          fill: "bg-red-500/10",
                          border: "border-red-500/20",
                          texto: "text-red-400",
                          selo: "bg-red-500/20 border-red-500/40 text-red-400",
                          sombra: "shadow-red-500/5",
                        };
                return (
                  <Card
                    key={ordem.id}
                    className={`relative overflow-hidden border ${tom.border} shadow-2xl ${tom.sombra}`}
                  >
                    <div
                      aria-hidden
                      className={`absolute inset-y-0 left-0 ${tom.fill} transition-all duration-700`}
                      style={{ width: `${pctLabel}%` }}
                    />
                    <CardHeader className="relative space-y-2 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="font-mono text-base">{ordem.numero ?? "O.C. sem número"}</CardTitle>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {ordem.fornecedor_nome ?? "Fornecedor não definido"}
                          </p>
                          <p className="mt-0.5 text-[11px] font-mono text-muted-foreground">
                            {itensDestaOrdem.length} {itensDestaOrdem.length === 1 ? "item" : "itens"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={statusVariant(ordem.status)}>{statusLabel[ordem.status] ?? ordem.status}</Badge>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tom.selo}`}
                          >
                            {pctLabel}% pago
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="relative space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-right">
                        <div>
                          <p className="text-[11px] text-muted-foreground">Total</p>
                          <p className="text-sm font-semibold">{brl(total)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground">Pago</p>
                          <p className={`text-sm font-semibold ${tom.texto}`}>{brl(pago)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground">Saldo</p>
                          <p className="text-sm font-semibold">{brl(saldo)}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-border/40">
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            className="text-xs h-8 px-2.5"
                            variant="outline"
                            onClick={() => {
                              setModoEdicao(false);
                              setDetalheId(ordem.id);
                            }}
                          >
                            Abrir O.C.
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={ordensExpandidas[ordem.id] ? "secondary" : "ghost"}
                            className="h-8 px-2 text-xs flex items-center gap-1"
                            title={ordensExpandidas[ordem.id] ? "Recolher detalhes da O.C." : "Expandir detalhes da O.C."}
                            onClick={() =>
                              setOrdensExpandidas((prev) => ({ ...prev, [ordem.id]: !prev[ordem.id] }))
                            }
                          >
                            {ordensExpandidas[ordem.id] ? (
                              <>
                                <ChevronUp className="size-3.5" /> Recolher
                              </>
                            ) : (
                              <>
                                <ChevronDown className="size-3.5" /> Detalhes
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                            title="Editar ordem de compra"
                            onClick={() => {
                              setModoEdicao(true);
                              setDetalheId(ordem.id);
                            }}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <BotaoVisualizarDocumento
                            tipo="ordem_compra"
                            id={ordem.id}
                            titulo={`Visualizar e Imprimir O.C. ${ordem.numero ?? ""}`}
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            title="Gerar PDF e Enviar por WhatsApp"
                            onClick={() => dispararWhatsAppOrdem(ordem)}
                          >
                            <MessageSquare className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-8 text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/30"
                            title="Gerar PDF e Enviar por E-mail"
                            onClick={() => dispararEmailOrdem(ordem)}
                          >
                            <Mail className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                            title="Abrir tela de Notas de Compra (/notas-compra)"
                            onClick={() => navigate({ to: "/notas-compra" })}
                          >
                            <FileText className="size-3.5" />
                          </Button>
                          {ordem.status !== "cancelada" && (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="size-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                              title="Cancelar O.C. (libera itens de volta para a fila)"
                              disabled={cancelarOrdem.isPending}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Cancelar a Ordem de Compra ${ordem.numero ?? ""}? Os itens voltarão para a fila de espera.`,
                                  )
                                ) {
                                  cancelarOrdem.mutate(ordem.id);
                                }
                              }}
                            >
                              <Ban className="size-3.5" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-8 text-destructive hover:bg-destructive/10"
                            title="Excluir ordem de compra permanentemente"
                            disabled={excluirOrdem.isPending}
                            onClick={() => {
                              if (window.confirm(`Excluir permanentemente a Ordem de Compra ${ordem.numero ?? ""}?`)) {
                                excluirOrdem.mutate(ordem.id);
                              }
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      {ordensExpandidas[ordem.id] && (
                        <div className="mt-3 pt-3 border-t space-y-2 bg-muted/20 -mx-6 -mb-6 p-4 rounded-b-lg">
                          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <span>Itens da Ordem ({itensDestaOrdem.length})</span>
                            <span className="text-[11px] font-normal normal-case">Vl. Unitário é editável</span>
                          </div>
                          {itensDestaOrdem.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">Nenhum item vinculado a esta ordem.</p>
                          ) : (
                            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                              {itensDestaOrdem.map((it) => {
                                const venda = it.venda_id ? vendaPorId.get(it.venda_id) : undefined;
                                const clienteVinculado = it.cliente_nome ?? venda?.cliente_nome ?? "Estoque Livre";
                                return (
                                  <div
                                    key={it.id}
                                    className="flex items-center justify-between gap-2 p-2 rounded bg-card border text-xs"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium truncate">{it.descricao}</p>
                                      <div className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                                        <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                                          {it.quantidade} {it.unidade}
                                        </Badge>
                                        <span>·</span>
                                        <span className="truncate text-foreground/80 font-medium">{clienteVinculado}</span>
                                        {it.cor && <span>· Cor: {it.cor}</span>}
                                        {it.pastilha && <span>· Pastilha: {it.pastilha}</span>}
                                        {it.numero_nf && (
                                          <Badge variant="secondary" className="text-[10px] py-0 px-1 font-mono">
                                            NF: {it.numero_nf}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <div className="text-right">
                                        <Input
                                          type="number"
                                          min={0}
                                          step="0.01"
                                          aria-label={`Valor unitário de ${it.descricao}`}
                                          className="h-7 w-24 text-right font-mono text-xs"
                                          defaultValue={Number(it.valor_unitario) || 0}
                                          key={`exec-card-vlr-${it.id}-${it.valor_unitario}`}
                                          onBlur={(evento) => {
                                            const novoValor = Math.max(Number(evento.target.value) || 0, 0);
                                            if (novoValor !== Number(it.valor_unitario)) {
                                              atualizarValorUnitarioItem.mutate({
                                                itemId: it.id,
                                                ordemId: ordem.id,
                                                valorUnitario: novoValor,
                                              });
                                            }
                                          }}
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                                          Total: {brl(Number(it.total))}
                                        </p>
                                      </div>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="size-7 text-destructive hover:bg-destructive/10"
                                        title="Excluir item desta ordem"
                                        disabled={excluirItemOrdem.isPending}
                                        onClick={() => {
                                          if (window.confirm(`Excluir o item "${it.descricao}" desta ordem?`)) {
                                            excluirItemOrdem.mutate({ itemId: it.id, ordemId: ordem.id });
                                          }
                                        }}
                                      >
                                        <Trash2 className="size-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {ordem.observacoes && (
                            <p className="text-[11px] text-muted-foreground bg-card/60 p-1.5 rounded border border-dashed">
                              <span className="font-semibold text-foreground">Obs:</span> {ordem.observacoes}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </ExpandableCard>
    </TabsContent>
  </Tabs>

      <Dialog
        open={!!detalheId}
        onOpenChange={(v) => {
          if (!v) {
            setDetalheId(null);
            setModoEdicao(false);
          }
        }}
      >
        <DialogContent
          className={cn(
            "overflow-y-auto transition-all duration-200 print:max-h-none print:overflow-visible",
            modalDetalheMaximized
              ? "fixed inset-2 md:inset-4 max-w-none w-[calc(100vw-1rem)] md:w-[calc(100vw-2rem)] h-[calc(100vh-1rem)] md:h-[calc(100vh-2rem)] max-h-none z-50 flex flex-col"
              : "max-h-[90vh] sm:max-w-4xl",
          )}
        >
          {ordemDetalhe && !modoEdicao && (
            <div className="space-y-6">
              <DialogHeader className="print:hidden">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      <span>Ordem de compra {ordemDetalhe.numero}</span>
                      <Badge variant={statusVariant(ordemDetalhe.status)}>
                        {statusLabel[ordemDetalhe.status] ?? ordemDetalhe.status}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription>
                      Detalhe completo da ordem, itens, tributos e pagamentos.
                    </DialogDescription>
                  </div>
                  <div className="flex items-center gap-1.5 mr-6">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10 font-medium"
                      title="Abrir tela de Notas Fiscais de Compra (/notas-compra)"
                      onClick={() => navigate({ to: "/notas-compra" })}
                    >
                      <FileText className="size-3.5" />
                      <span>NFs de Compra</span>
                      <ExternalLink className="size-3 text-muted-foreground" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-primary"
                      title={modalDetalheMaximized ? "Reduzir tela (Esc)" : "Expandir para tela cheia"}
                      onClick={() => setModalDetalheMaximized((v) => !v)}
                    >
                      {modalDetalheMaximized ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                    </Button>
                    <BotaoVisualizarDocumento
                      tipo="ordem_compra"
                      id={ordemDetalhe.id}
                      titulo={`Visualizar e Imprimir O.C. ${ordemDetalhe.numero ?? ""}`}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      title="Gerar PDF e Enviar por WhatsApp"
                      onClick={() => dispararWhatsAppOrdem(ordemDetalhe)}
                    >
                      <MessageSquare className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-8 text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/30"
                      title="Gerar PDF e Enviar por E-mail"
                      onClick={() => dispararEmailOrdem(ordemDetalhe)}
                    >
                      <Mail className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                      title="Editar ordem"
                      onClick={() => setModoEdicao(true)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    {ordemDetalhe.status !== "cancelada" && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                        title="Cancelar O.C. (libera itens de volta para a fila)"
                        disabled={cancelarOrdem.isPending}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Cancelar a Ordem de Compra ${ordemDetalhe.numero ?? ""}? Os itens voltarão para a fila de espera.`,
                            )
                          ) {
                            cancelarOrdem.mutate(ordemDetalhe.id);
                          }
                        }}
                      >
                        <Ban className="size-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-8 text-destructive hover:bg-destructive/10"
                      title="Excluir ordem"
                      disabled={excluirOrdem.isPending}
                      onClick={() => {
                        if (window.confirm(`Excluir permanentemente a ordem de compra ${ordemDetalhe.numero ?? ""}?`)) {
                          excluirOrdem.mutate(ordemDetalhe.id);
                          setDetalheId(null);
                        }
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
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
                     onValueChange={(status) => alterarStatusOrdem(ordemDetalhe, status)}
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
                    <TableHead>Cor</TableHead>
                    <TableHead>Pastilha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>NCM</TableHead>
                    <TableHead>CST</TableHead>
                    <TableHead>Unid.</TableHead>
                    <TableHead className="print:hidden">Ações</TableHead>
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
                      <TableCell>{i.cor ?? "—"}</TableCell>
                      <TableCell>{i.pastilha ?? "—"}</TableCell>
                      <TableCell>{i.cliente_nome ?? "Estoque"}</TableCell>
                      <TableCell>{i.ncm ?? "—"}</TableCell>
                      <TableCell>{i.cst ?? "—"}</TableCell>
                      <TableCell>{i.unidade}</TableCell>
                      <TableCell className="print:hidden">
                        <div className="flex items-center gap-1">
                          {(() => {
                            const produto = i.produto_id
                              ? produtos.find((p) => p.id === i.produto_id)
                              : undefined;
                            return (
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="size-7"
                                aria-label={`Editar produto ${i.descricao}`}
                                title={
                                  produto
                                    ? "Editar cadastro do produto"
                                    : "Item sem cadastro de produto"
                                }
                                disabled={!produto}
                                onClick={() => {
                                  if (produto) abrirEdicaoProdutoCompra(produto);
                                }}
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                            );
                          })()}
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-7 text-destructive hover:bg-destructive/10"
                            aria-label={`Excluir ${i.descricao} da ordem`}
                            title="Excluir item da ordem"
                            disabled={excluirItemOrdem.isPending}
                            onClick={() => {
                              if (window.confirm(`Excluir o item "${i.descricao}" desta ordem de compra?`)) {
                                excluirItemOrdem.mutate({ itemId: i.id, ordemId: ordemDetalhe.id });
                              }
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          aria-label={`Valor unitário de ${i.descricao}`}
                          className="h-8 w-28 text-right font-mono ml-auto"
                          defaultValue={Number(i.valor_unitario) || 0}
                          key={`det-vlr-${i.id}-${i.valor_unitario}`}
                          onBlur={(evento) => {
                            const novoValor = Math.max(Number(evento.target.value) || 0, 0);
                            if (novoValor !== Number(i.valor_unitario)) {
                              atualizarValorUnitarioItem.mutate({
                                itemId: i.id,
                                ordemId: ordemDetalhe.id,
                                valorUnitario: novoValor,
                              });
                            }
                          }}
                        />
                      </TableCell>
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
                <div className="sm:col-span-3 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">Notas fiscais do fornecedor</p>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-xs h-7 gap-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 font-medium"
                        onClick={() => navigate({ to: "/notas-compra" })}
                        title="Abrir tela de Notas de Compra"
                      >
                        <FileText className="size-3.5" />
                        <span>Abrir tela de Notas de Compra</span>
                        <ExternalLink className="size-3 text-muted-foreground" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => adicionarNota.mutate()}
                        disabled={adicionarNota.isPending}
                      >
                        <Plus className="size-4" /> Adicionar nota
                      </Button>
                    </div>
                  </div>
                  {notasLista.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Nenhuma nota lançada. Clique em "Adicionar nota" para lançar o valor
                      faturado de cada NF — a primeira já vem com o valor atual.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {notasLista.map((nota, idx) => (
                        <div key={nota.id} className="flex flex-wrap items-center gap-2">
                          <Input
                            className="max-w-52"
                            placeholder={`Número da NF ${idx + 1}`}
                            defaultValue={nota.numero_nf ?? ""}
                            onBlur={(e) => {
                              if ((nota.numero_nf ?? "") !== e.target.value)
                                atualizarNota.mutate({
                                  id: nota.id,
                                  campo: "numero_nf",
                                  valor: e.target.value,
                                });
                            }}
                          />
                          <Input
                            type="number"
                            step="0.01"
                            className="max-w-40"
                            aria-label={`Valor da NF ${idx + 1}`}
                            defaultValue={Number(nota.valor ?? 0)}
                            onBlur={(e) => {
                              if (Number(nota.valor ?? 0) !== Number(e.target.value))
                                atualizarNota.mutate({
                                  id: nota.id,
                                  campo: "valor",
                                  valor: e.target.value,
                                });
                            }}
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label={`Excluir NF ${idx + 1}`}
                            onClick={() => excluirNota.mutate(nota.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-border pt-2 text-xs">
                    <span className="text-muted-foreground">Total faturado em notas</span>
                    <span className="font-medium">{brl(totalNotas)}</span>
                  </div>
                </div>
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
                    {brl(Number(ordemDetalhe.valor_pago ?? 0) - totalNotas)}
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

              <div className="space-y-4 rounded-lg border border-border p-4 print:hidden">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">Pagamentos da compra</p>
                    <p className="text-xs text-muted-foreground">
                      Registre quantos pagamentos forem necessários para esta ordem.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Pago / Saldo</p>
                    <p className="font-semibold">
                      {brl(totalPagoOrdem)} /{" "}
                      {brl(Number(ordemDetalhe.valor_total ?? 0) - totalPagoOrdem)}
                    </p>
                  </div>
                </div>

                {pagamentosOrdem.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Forma</TableHead>
                        <TableHead>Conta</TableHead>
                        <TableHead>Observações</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagamentosOrdem.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{dataBR(p.data_pagamento)}</TableCell>
                          <TableCell>{p.forma_pagamento}</TableCell>
                          <TableCell>{p.conta_bancaria ?? "—"}</TableCell>
                          <TableCell>{p.observacoes ?? "—"}</TableCell>
                          <TableCell className="text-right font-medium">
                            {brl(Number(p.valor))}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label="Editar pagamento"
                                onClick={() => {
                                  setEditPagamentoId(p.id);
                                  setNovoPagamento({
                                    data_pagamento: p.data_pagamento,
                                    forma_pagamento: p.forma_pagamento,
                                    conta_bancaria: p.conta_bancaria ?? "",
                                    valor: String(p.valor),
                                    observacoes: p.observacoes ?? "",
                                    comprovante_path: p.comprovante_path ?? null,
                                  });
                                }}
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label="Excluir pagamento"
                                onClick={() => {
                                  if (window.confirm("Excluir este pagamento?")) {
                                    excluirPagamento.mutate(p.id);
                                  }
                                }}
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                <div className="grid gap-3 sm:grid-cols-5">
                  <Field label="Data">
                    <Input
                      type="date"
                      value={novoPagamento.data_pagamento}
                      onChange={(e) =>
                        setNovoPagamento((s) => ({ ...s, data_pagamento: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Forma">
                    <Select
                      value={novoPagamento.forma_pagamento}
                      onValueChange={(v) =>
                        setNovoPagamento((s) => ({ ...s, forma_pagamento: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Pix", "Boleto", "Transferência", "Cartão", "Dinheiro", "Crédito fabricante"].map(
                          (f) => (
                            <SelectItem key={f} value={f}>
                              {f}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Conta">
                    <Select
                      value={novoPagamento.conta_bancaria}
                      onValueChange={(v) =>
                        setNovoPagamento((s) => ({ ...s, conta_bancaria: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {contasBancarias.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Valor (R$)">
                    <Input
                      type="number"
                      step="0.01"
                      value={novoPagamento.valor}
                      onChange={(e) => setNovoPagamento((s) => ({ ...s, valor: e.target.value }))}
                    />
                  </Field>
                  <Field label="Observações">
                    <Input
                      value={novoPagamento.observacoes}
                      onChange={(e) =>
                        setNovoPagamento((s) => ({ ...s, observacoes: e.target.value }))
                      }
                    />
                  </Field>
                  <div className="sm:col-span-5">
                    <Field label="Comprovante">
                      <ComprovanteAnexo
                        tabela="ordem_compra_pagamentos"
                        valor={novoPagamento.comprovante_path}
                        onChange={(comprovante_path) =>
                          setNovoPagamento((s) => ({ ...s, comprovante_path }))
                        }
                      />
                    </Field>
                  </div>
                  <div className="flex gap-2 sm:col-span-5">
                    <Button
                      onClick={() => salvarPagamento.mutate()}
                      disabled={salvarPagamento.isPending}
                    >
                      <Plus /> {editPagamentoId ? "Salvar pagamento" : "Adicionar pagamento"}
                    </Button>
                    {editPagamentoId && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditPagamentoId(null);
                          setNovoPagamento({
                            data_pagamento: hojeISO(),
                            forma_pagamento: "Pix",
                            conta_bancaria: "",
                            valor: "",
                            observacoes: "",
                            comprovante_path: null,
                          });
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              </div>



              <div className="space-y-3 rounded-lg border border-border p-4 print:hidden">
                <div>
                  <p className="text-sm font-medium">Fluxo da ordem de compra</p>
                  <p className="text-xs text-muted-foreground">
                     A despesa é criada no Contas a Pagar ao executar a ordem. Ao marcar como Comprado, escolha a conta para efetuar a baixa.
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
                <BotaoVisualizarDocumento
                  tipo="ordem_compra"
                  id={ordemDetalhe.id}
                  variant="default"
                  size="default"
                  rotulo="Visualizar formulário completo"
                />
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
                    onValueChange={(v) =>
                      setNovoItem((i) => ({
                        ...i,
                        produto_id: v,
                        cor: produtos.find((p) => p.id === v)?.cor_pastilha ?? i.cor,
                        pastilha: produtos.find((p) => p.id === v)?.modelo_pastilha ?? i.pastilha,
                      }))
                    }
                  >
                    <SelectTrigger className="sm:col-span-2">
                      <SelectValue placeholder="Produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos
                        .filter((p) => {
                          const fId = formEdicao.fornecedor_id || ordemDetalhe?.fornecedor_id;
                          if (fId) {
                            return fornecedorDaCompra(p)?.id === fId;
                          }
                          return true;
                        })
                        .map((p) => (
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
                  <Input
                    placeholder="Cor (ex.: azul, areia)"
                    aria-label="Cor do item"
                    value={novoItem.cor}
                    onChange={(e) => setNovoItem((i) => ({ ...i, cor: e.target.value }))}
                  />
                  <Input
                    placeholder="Pastilha (modelo)"
                    aria-label="Modelo da pastilha do item"
                    value={novoItem.pastilha}
                    onChange={(e) => setNovoItem((i) => ({ ...i, pastilha: e.target.value }))}
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
                        <TableHead>Cor</TableHead>
                        <TableHead>Pastilha</TableHead>
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
                            <Input
                              aria-label={`Cor de ${i.descricao}`}
                              className="w-32"
                              placeholder="Cor"
                              value={i.cor}
                              onChange={(e) => alterarCorItemEdicao(idx, e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              aria-label={`Pastilha de ${i.descricao}`}
                              className="w-32"
                              placeholder="Pastilha"
                              value={i.pastilha}
                              onChange={(e) => alterarPastilhaItemEdicao(idx, e.target.value)}
                            />
                          </TableCell>
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
                            <div className="flex items-center gap-1">
                              {Math.trunc(Number(i.quantidade)) >= 2 ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    title="Separa 1 unidade em outra linha para dar outro vínculo (repita para formar lotes)"
                                    onClick={() => separarItemEdicao(idx, false)}
                                  >
                                    Separar 1
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    title="Cria uma linha por unidade, cada uma com seu vínculo"
                                    onClick={() => separarItemEdicao(idx, true)}
                                  >
                                    1 por un.
                                  </Button>
                                </>
                              ) : null}
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => removerItemEdicao(idx)}
                              >
                                <Trash2 className="text-destructive" />
                              </Button>
                            </div>
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

      <Dialog open={!!ordemParaBaixar} onOpenChange={(aberto) => !aberto && setOrdemParaBaixar(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Baixar compra {ordemParaBaixar?.numero}</DialogTitle>
            <DialogDescription>
              Escolha a conta de onde o pagamento saiu. A despesa será baixada também em Contas a Pagar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data do pagamento">
              <Input
                type="date"
                value={baixaCompra.data_pagamento}
                onChange={(e) => setBaixaCompra((atual) => ({ ...atual, data_pagamento: e.target.value }))}
              />
            </Field>
            <Field label="Valor pago (R$)">
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={baixaCompra.valor}
                onChange={(e) => setBaixaCompra((atual) => ({ ...atual, valor: e.target.value }))}
              />
            </Field>
            <Field label="Conta que pagou" className="sm:col-span-2">
              <Select
                value={baixaCompra.conta_bancaria}
                onValueChange={(conta_bancaria) => setBaixaCompra((atual) => ({ ...atual, conta_bancaria }))}
              >
                <SelectTrigger><SelectValue placeholder="Selecione a conta bancária" /></SelectTrigger>
                <SelectContent>
                  {contasBancarias.map((conta) => (
                    <SelectItem key={conta} value={conta}>{conta}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Comprovante (opcional)">
                <ComprovanteAnexo
                  tabela="ordem_compra_pagamentos"
                  valor={baixaCompra.comprovante_path}
                  onChange={(comprovante_path) =>
                    setBaixaCompra((atual) => ({ ...atual, comprovante_path }))
                  }
                />
              </Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrdemParaBaixar(null)}>Cancelar</Button>
            <Button onClick={() => baixarCompra.mutate()} disabled={baixarCompra.isPending}>
              <CreditCard /> Confirmar baixa
            </Button>
          </DialogFooter>
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
            <Field label="NCM">
              <Input
                value={produtoCompraForm.ncm}
                onChange={(evento) =>
                  setProdutoCompraForm((atual) => ({ ...atual, ncm: evento.target.value }))
                }
                placeholder="Ex.: 32091010"
              />
            </Field>
            <Field label="CST">
              <Input
                value={produtoCompraForm.cst}
                onChange={(evento) =>
                  setProdutoCompraForm((atual) => ({ ...atual, cst: evento.target.value }))
                }
                placeholder="Ex.: 010"
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
                  {["Boleto", "Pix", "Transferência", "Cartão de Crédito", "Cartão de Débito", "Dinheiro"].map((m) => (
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

      <Dialog open={novaOpen} onOpenChange={setNovaOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Nova ordem de compra</DialogTitle>
            <DialogDescription>
              Itens com Cliente "Estoque (sem cliente)" entram como reposição de estoque.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Fornecedor">
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
                onChange={(e) => setNovaOrdem((f) => ({ ...f, previsao_entrega: e.target.value }))}
              />
            </Field>
            <Field label="Condições">
              <Input
                value={novaOrdem.condicoes}
                onChange={(e) => setNovaOrdem((f) => ({ ...f, condicoes: e.target.value }))}
                placeholder="30/60 dias, boleto..."
              />
            </Field>
            <Field label="Observações">
              <Input
                value={novaOrdem.observacoes}
                onChange={(e) => setNovaOrdem((f) => ({ ...f, observacoes: e.target.value }))}
              />
            </Field>
          </div>

          <div className="space-y-2 rounded-lg border border-border p-3">
            <p className="text-sm font-medium">Adicionar item</p>
            <div className="grid gap-2 sm:grid-cols-4">
              <Select
                value={novoItem.produto_id}
                onValueChange={(v) =>
                  setNovoItem((i) => ({
                    ...i,
                    produto_id: v,
                    valor_unitario: String(produtos.find((p) => p.id === v)?.preco_custo ?? i.valor_unitario),
                    cor: produtos.find((p) => p.id === v)?.cor_pastilha ?? i.cor,
                    pastilha: produtos.find((p) => p.id === v)?.modelo_pastilha ?? i.pastilha,
                  }))
                }
              >
                <SelectTrigger className="sm:col-span-2">
                  <SelectValue placeholder="Produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos
                    .filter((p) => {
                      if (novaOrdem.fornecedor_id) {
                        return fornecedorDaCompra(p)?.id === novaOrdem.fornecedor_id;
                      }
                      return true;
                    })
                    .filter((p) => (!ocultarJaComprados ? true : !ehProdutoJaCompradoOuFaturado(p)))
                    .map((p) => (
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
                aria-label="Quantidade"
                value={novoItem.quantidade}
                onChange={(e) => setNovoItem((i) => ({ ...i, quantidade: e.target.value }))}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Vlr unitário"
                aria-label="Valor unitário"
                value={novoItem.valor_unitario}
                onChange={(e) => setNovoItem((i) => ({ ...i, valor_unitario: e.target.value }))}
              />
              <Input
                placeholder="Cor"
                value={novoItem.cor}
                onChange={(e) => setNovoItem((i) => ({ ...i, cor: e.target.value }))}
              />
              <Input
                placeholder="Pastilha"
                value={novoItem.pastilha}
                onChange={(e) => setNovoItem((i) => ({ ...i, pastilha: e.target.value }))}
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
                          variant="ghost"
                          size="icon"
                          aria-label="Remover item"
                          onClick={() =>
                            setItensNovaOrdem((it) => it.filter((_, k) => k !== idx))
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <p className="text-right text-sm font-semibold">
              Total:{" "}
              {brl(
                itensNovaOrdem.reduce((s, i) => s + i.quantidade * i.valor_unitario - i.desconto, 0),
              )}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNovaOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => criarOrdem.mutate()} disabled={criarOrdem.isPending}>
              <Save className="size-4" /> Criar ordem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ModalPedirCarga
        open={modalPedirCargaAberto}
        onOpenChange={(aberto) => {
          setModalPedirCargaAberto(aberto);
          if (!aberto) {
            setItensCargaIniciais([]);
          }
        }}
        fornecedorInicialId={fornecedorCargaSelecionado}
        itensIniciaisIds={itensCargaIniciais}
      />
    </div>
  );
}
