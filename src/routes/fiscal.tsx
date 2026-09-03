import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Copy, Download, Eye, Plus, Settings, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/field";
import { Kpi, PageHeader } from "@/components/page-header";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR, hojeISO } from "@/lib/erp";

export const Route = createFileRoute("/fiscal")({
  head: () => ({
    meta: [
      { title: "Emissão de Notas Fiscais | Piscinow ERP" },
      {
        name: "description",
        content:
          "Emita e acompanhe NF-e e NFS-e, consulte status na SEFAZ e gerencie o cancelamento de notas.",
      },
      { property: "og:title", content: "Emissão de Notas Fiscais | Piscinow ERP" },
      {
        property: "og:description",
        content: "Central de emissão fiscal: NF-e de produtos e NFS-e de serviços.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Fiscal />
    </RequireAuth>
  ),
});

type Modelo = "nfe" | "nfse";

type NotaFiscal = {
  id: string;
  modelo: string;
  numero: string | null;
  serie: string | null;
  referencia: string | null;
  venda_id: string | null;
  cliente_id: string | null;
  cliente_nome: string | null;
  cliente_documento: string | null;
  natureza_operacao: string;
  tipo_documento: string;
  finalidade: string;
  consumidor_final: boolean;
  presenca_comprador: string;
  modalidade_frete: string;
  data_emissao: string;
  itens: any;
  valor_produtos: number;
  valor_servicos: number;
  valor_frete: number;
  valor_desconto: number;
  base_icms: number;
  valor_icms: number;
  valor_ipi: number;
  valor_pis: number;
  valor_cofins: number;
  valor_iss: number;
  aliquota_iss: number;
  iss_retido: boolean;
  codigo_servico: string | null;
  discriminacao: string | null;
  valor_total: number;
  status: string;
  chave_acesso: string | null;
  protocolo: string | null;
  url_danfe: string | null;
  url_xml: string | null;
  mensagem_sefaz: string | null;
  motivo_cancelamento: string | null;
  observacoes: string | null;
};

type Cliente = {
  id: string;
  nome: string;
  documento: string | null;
  tipo: string;
  inscricao_estadual: string | null;
  indicador_ie: string;
  inscricao_municipal: string | null;
  logradouro: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
};

type Venda = {
  id: string;
  numero: string | null;
  cliente_id: string | null;
  cliente_nome: string | null;
  valor_total: number;
  data: string;
};

type ItemNota = {
  produto_id: string | null;
  codigo: string;
  descricao: string;
  ncm: string;
  cst: string;
  cfop: string;
  cest: string;
  origem: string;
  unidade: string;
  quantidade: number;
  valor_unitario: number;
  aliquota_icms: number;
  aliquota_ipi: number;
  aliquota_pis: number;
  aliquota_cofins: number;
};

const statusLabel: Record<string, string> = {
  rascunho: "Rascunho",
  processando: "Processando",
  autorizada: "Autorizada",
  rejeitada: "Rejeitada",
  cancelada: "Cancelada",
};

const statusVariant = (s: string): "secondary" | "default" | "destructive" | "outline" => {
  if (s === "autorizada") return "default";
  if (s === "rejeitada" || s === "cancelada") return "destructive";
  if (s === "processando") return "outline";
  return "secondary";
};

const FINALIDADES = [
  { value: "normal", label: "Normal" },
  { value: "complementar", label: "Complementar" },
  { value: "ajuste", label: "Ajuste" },
  { value: "devolucao", label: "Devolução" },
];

const PRESENCA = [
  { value: "presencial", label: "Operação presencial" },
  { value: "internet", label: "Operação pela internet" },
  { value: "telefone", label: "Operação por telefone" },
  { value: "entrega_domicilio", label: "Entrega em domicílio" },
  { value: "nao_presencial_outros", label: "Não presencial (outros)" },
];

const FRETES = [
  { value: "0", label: "Por conta do emitente" },
  { value: "1", label: "Por conta do destinatário" },
  { value: "9", label: "Sem frete" },
];

const itemVazio: ItemNota = {
  produto_id: null,
  codigo: "",
  descricao: "",
  ncm: "",
  cst: "",
  cfop: "5102",
  cest: "",
  origem: "0",
  unidade: "UN",
  quantidade: 1,
  valor_unitario: 0,
  aliquota_icms: 0,
  aliquota_ipi: 0,
  aliquota_pis: 0,
  aliquota_cofins: 0,
};

const novaNfeVazia = {
  venda_id: "",
  cliente_id: "",
  cliente_nome: "",
  cliente_documento: "",
  natureza_operacao: "Venda de mercadoria",
  finalidade: "normal",
  consumidor_final: true,
  presenca_comprador: "presencial",
  modalidade_frete: "9",
  valor_frete: "0",
  valor_desconto: "0",
  observacoes: "",
};

const novaNfseVazia = {
  venda_id: "",
  cliente_id: "",
  cliente_nome: "",
  cliente_documento: "",
  codigo_servico: "",
  discriminacao: "",
  valor_servicos: "0",
  aliquota_iss: "5",
  iss_retido: false,
  observacoes: "",
};

/**
 * Ponto de integração com a Focus NFe.
 * Ainda não implementado: exige o token de homologação/produção cadastrado
 * em configuracao_fiscal.token_configurado. Quando o token for informado,
 * substituir o corpo desta função pela chamada real à API da Focus NFe
 * (POST /v2/nfe ou /v2/nfse conforme o modelo), tratando o retorno
 * assíncrono (status "processando" -> autorizada/rejeitada via webhook ou
 * consulta) e atualizando chave_acesso, protocolo, url_danfe, url_xml e
 * mensagem_sefaz na tabela notas_fiscais.
 */
async function transmitirNota(_notaId: string): Promise<void> {
  throw new Error(
    "Transmissão para a Focus NFe ainda não configurada. Cadastre o token em /fiscal/config.",
  );
}

function Fiscal() {
  const qc = useQueryClient();
  const [modelo, setModelo] = useState<Modelo>("nfe");
  const [filtroStatus, setFiltroStatus] = useState("todas");
  const [busca, setBusca] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [detalheId, setDetalheId] = useState<string | null>(null);
  const [cancelarId, setCancelarId] = useState<string | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [novaOpen, setNovaOpen] = useState(false);

  const [novaNfe, setNovaNfe] = useState(novaNfeVazia);
  const [itensNfe, setItensNfe] = useState<ItemNota[]>([]);
  const [novaNfse, setNovaNfse] = useState(novaNfseVazia);

  const { data: notas = [] } = useQuery({
    queryKey: ["notas_fiscais"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notas_fiscais")
        .select("*")
        .order("data_emissao", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as NotaFiscal[];
    },
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes", "lista-fiscal"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select(
          "id, nome, documento, tipo, inscricao_estadual, indicador_ie, inscricao_municipal, logradouro, numero, bairro, cidade, estado, cep",
        )
        .order("nome");
      if (error) throw error;
      return data as Cliente[];
    },
  });

  const { data: vendas = [] } = useQuery({
    queryKey: ["vendas", "lista-fiscal"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendas")
        .select("id, numero, cliente_id, cliente_nome, valor_total, data")
        .order("data", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Venda[];
    },
  });

  const { data: config } = useQuery({
    queryKey: ["configuracao_fiscal"],
    queryFn: async () => {
      const { data, error } = await supabase.from("configuracao_fiscal").select("*").maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const notasModelo = useMemo(() => notas.filter((n) => n.modelo === modelo), [notas, modelo]);

  const notasFiltradas = useMemo(() => {
    return notasModelo.filter((n) => {
      if (filtroStatus !== "todas" && n.status !== filtroStatus) return false;
      if (dataInicial && n.data_emissao < dataInicial) return false;
      if (dataFinal && n.data_emissao > dataFinal) return false;
      if (busca) {
        const alvo = `${n.cliente_nome ?? ""} ${n.numero ?? ""} ${n.chave_acesso ?? ""}`.toLowerCase();
        if (!alvo.includes(busca.toLowerCase())) return false;
      }
      return true;
    });
  }, [notasModelo, filtroStatus, dataInicial, dataFinal, busca]);

  const kpis = useMemo(() => {
    const mes = new Date().toISOString().slice(0, 7);
    const doMes = notasModelo.filter((n) => n.data_emissao.startsWith(mes));
    const autorizadas = doMes.filter((n) => n.status === "autorizada");
    const rejeitadas = notasModelo.filter((n) => n.status === "rejeitada");
    const rascunhos = notasModelo.filter((n) => n.status === "rascunho");
    return {
      autorizadas: autorizadas.length,
      valorAutorizado: autorizadas.reduce((s, n) => s + Number(n.valor_total ?? 0), 0),
      rejeitadas: rejeitadas.length,
      rascunhos: rascunhos.length,
    };
  }, [notasModelo]);

  const detalhe = notas.find((n) => n.id === detalheId) ?? null;
  const notaCancelar = notas.find((n) => n.id === cancelarId) ?? null;

  const copiarChave = (chave?: string | null) => {
    if (!chave) return;
    void navigator.clipboard?.writeText(chave).catch(() => undefined);
    toast.success("Chave de acesso copiada");
  };

  const cancelar = useMutation({
    mutationFn: async () => {
      if (!cancelarId) return;
      if (motivoCancelamento.trim().length < 15) {
        throw new Error("Informe um motivo com pelo menos 15 caracteres");
      }
      const { error } = await supabase
        .from("notas_fiscais")
        .update({ status: "cancelada", motivo_cancelamento: motivoCancelamento.trim() })
        .eq("id", cancelarId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Nota cancelada");
      qc.invalidateQueries({ queryKey: ["notas_fiscais"] });
      setCancelarId(null);
      setMotivoCancelamento("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const carregarVenda = async (vendaId: string, alvo: Modelo) => {
    const venda = vendas.find((v) => v.id === vendaId);
    if (!venda) return;
    if (alvo === "nfe") {
      setNovaNfe((f) => ({
        ...f,
        venda_id: vendaId,
        cliente_id: venda.cliente_id ?? "",
        cliente_nome: venda.cliente_nome ?? "",
      }));
      const { data: itens, error } = await supabase
        .from("venda_itens")
        .select("*")
        .eq("venda_id", vendaId);
      if (error) return toast.error(error.message);
      const produtoIds = (itens ?? []).map((i) => i.produto_id).filter(Boolean) as string[];
      let produtosMap = new Map<string, any>();
      if (produtoIds.length > 0) {
        const { data: produtos } = await supabase
          .from("produtos")
          .select(
            "id, codigo, ncm, cst, cfop, cest, origem_mercadoria, unidade, aliquota_icms, aliquota_ipi, aliquota_pis, aliquota_cofins",
          )
          .in("id", produtoIds);
        produtosMap = new Map((produtos ?? []).map((p) => [p.id, p]));
      }
      const novosItens: ItemNota[] = (itens ?? []).map((i) => {
        const p = i.produto_id ? produtosMap.get(i.produto_id) : null;
        return {
          produto_id: i.produto_id,
          codigo: p?.codigo ?? i.sku ?? "",
          descricao: i.descricao,
          ncm: p?.ncm ?? "",
          cst: p?.cst ?? "",
          cfop: p?.cfop ?? "5102",
          cest: p?.cest ?? "",
          origem: p?.origem_mercadoria ?? "0",
          unidade: p?.unidade ?? "UN",
          quantidade: Number(i.quantidade) || 1,
          valor_unitario: Number(i.preco_unitario) || 0,
          aliquota_icms: Number(p?.aliquota_icms) || 0,
          aliquota_ipi: Number(p?.aliquota_ipi) || 0,
          aliquota_pis: Number(p?.aliquota_pis) || 0,
          aliquota_cofins: Number(p?.aliquota_cofins) || 0,
        };
      });
      setItensNfe(novosItens);
      toast.success("Itens importados do pedido");
    } else {
      const { data: itens } = await supabase.from("venda_itens").select("descricao, total").eq("venda_id", vendaId);
      const total = (itens ?? []).reduce((s, i) => s + Number(i.total ?? 0), 0) || Number(venda.valor_total ?? 0);
      const discriminacao = (itens ?? []).map((i) => i.descricao).join("; ");
      setNovaNfse((f) => ({
        ...f,
        venda_id: vendaId,
        cliente_id: venda.cliente_id ?? "",
        cliente_nome: venda.cliente_nome ?? "",
        valor_servicos: String(total || 0),
        discriminacao: discriminacao || f.discriminacao,
      }));
      toast.success("Dados importados do pedido");
    }
  };

  const selecionarClienteNfe = (clienteId: string, alvo: Modelo) => {
    const c = clientes.find((cli) => cli.id === clienteId);
    if (!c) return;
    if (alvo === "nfe") {
      setNovaNfe((f) => ({ ...f, cliente_id: c.id, cliente_nome: c.nome, cliente_documento: c.documento ?? "" }));
    } else {
      setNovaNfse((f) => ({ ...f, cliente_id: c.id, cliente_nome: c.nome, cliente_documento: c.documento ?? "" }));
    }
  };

  const clienteSelecionadoNfe = clientes.find((c) => c.id === novaNfe.cliente_id) ?? null;
  const clienteSelecionadoNfse = clientes.find((c) => c.id === novaNfse.cliente_id) ?? null;

  const totaisNfe = useMemo(() => {
    let valorProdutos = 0;
    let baseIcms = 0;
    let valorIcms = 0;
    let valorIpi = 0;
    let valorPis = 0;
    let valorCofins = 0;
    for (const i of itensNfe) {
      const totalItem = i.quantidade * i.valor_unitario;
      valorProdutos += totalItem;
      baseIcms += totalItem;
      valorIcms += totalItem * (i.aliquota_icms / 100);
      valorIpi += totalItem * (i.aliquota_ipi / 100);
      valorPis += totalItem * (i.aliquota_pis / 100);
      valorCofins += totalItem * (i.aliquota_cofins / 100);
    }
    const frete = Number(novaNfe.valor_frete) || 0;
    const desconto = Number(novaNfe.valor_desconto) || 0;
    const total = valorProdutos + frete + valorIpi - desconto;
    return { valorProdutos, baseIcms, valorIcms, valorIpi, valorPis, valorCofins, total };
  }, [itensNfe, novaNfe.valor_frete, novaNfe.valor_desconto]);

  const totaisNfse = useMemo(() => {
    const servicos = Number(novaNfse.valor_servicos) || 0;
    const aliquota = Number(novaNfse.aliquota_iss) || 0;
    const iss = servicos * (aliquota / 100);
    return { servicos, iss, total: servicos };
  }, [novaNfse.valor_servicos, novaNfse.aliquota_iss]);

  const adicionarItem = () => setItensNfe((it) => [...it, { ...itemVazio }]);
  const removerItem = (idx: number) => setItensNfe((it) => it.filter((_, i) => i !== idx));
  const atualizarItem = (idx: number, campo: keyof ItemNota, valor: string) => {
    setItensNfe((it) =>
      it.map((item, i) => {
        if (i !== idx) return item;
        const numericos: (keyof ItemNota)[] = [
          "quantidade",
          "valor_unitario",
          "aliquota_icms",
          "aliquota_ipi",
          "aliquota_pis",
          "aliquota_cofins",
        ];
        return { ...item, [campo]: numericos.includes(campo) ? Number(valor) || 0 : valor };
      }),
    );
  };

  const gerarReferencia = (m: Modelo) => `${m === "nfe" ? "NFE" : "NFSE"}-${Date.now()}`;

  const criarNota = useMutation({
    mutationFn: async () => {
      if (modelo === "nfe") {
        if (!novaNfe.cliente_nome.trim()) throw new Error("Informe o destinatário");
        if (itensNfe.length === 0) throw new Error("Adicione ao menos um item");
      } else {
        if (!novaNfse.cliente_nome.trim()) throw new Error("Informe o tomador do serviço");
        if (!novaNfse.discriminacao.trim()) throw new Error("Informe a discriminação do serviço");
      }
      const { data: auth } = await supabase.auth.getUser();

      let numero = "1";
      let serie = "1";
      if (config?.id) {
        const campoNumero = modelo === "nfe" ? "proximo_numero_nfe" : "proximo_numero_nfse";
        const campoSerie = modelo === "nfe" ? "serie_nfe" : "serie_nfse";
        numero = String((config as any)[campoNumero] ?? 1);
        serie = String((config as any)[campoSerie] ?? "1");
        const { error: erroCfg } = await supabase
          .from("configuracao_fiscal")
          .update({ [campoNumero]: Number(numero) + 1 } as Record<string, never>)
          .eq("id", config.id);
        if (erroCfg) throw erroCfg;
      }

      const payload: Record<string, unknown> = {
        modelo,
        numero,
        serie,
        referencia: gerarReferencia(modelo),
        data_emissao: hojeISO(),
        status: "rascunho",
        created_by: auth.user?.id ?? null,
      };

      if (modelo === "nfe") {
        payload.tipo_documento = "nfe";
        payload.venda_id = novaNfe.venda_id || null;
        payload.cliente_id = novaNfe.cliente_id || null;
        payload.cliente_nome = novaNfe.cliente_nome.trim();
        payload.cliente_documento = novaNfe.cliente_documento || null;
        payload.natureza_operacao = novaNfe.natureza_operacao;
        payload.finalidade = novaNfe.finalidade;
        payload.consumidor_final = novaNfe.consumidor_final;
        payload.presenca_comprador = novaNfe.presenca_comprador;
        payload.modalidade_frete = novaNfe.modalidade_frete;
        payload.valor_frete = Number(novaNfe.valor_frete) || 0;
        payload.valor_desconto = Number(novaNfe.valor_desconto) || 0;
        payload.itens = itensNfe.map((i) => ({ ...i, total: i.quantidade * i.valor_unitario }));
        payload.valor_produtos = totaisNfe.valorProdutos;
        payload.base_icms = totaisNfe.baseIcms;
        payload.valor_icms = totaisNfe.valorIcms;
        payload.valor_ipi = totaisNfe.valorIpi;
        payload.valor_pis = totaisNfe.valorPis;
        payload.valor_cofins = totaisNfe.valorCofins;
        payload.valor_total = totaisNfe.total;
        payload.observacoes = novaNfe.observacoes || null;
      } else {
        payload.tipo_documento = "nfse";
        payload.venda_id = novaNfse.venda_id || null;
        payload.cliente_id = novaNfse.cliente_id || null;
        payload.cliente_nome = novaNfse.cliente_nome.trim();
        payload.cliente_documento = novaNfse.cliente_documento || null;
        payload.natureza_operacao = "Prestação de serviços";
        payload.codigo_servico = novaNfse.codigo_servico || null;
        payload.discriminacao = novaNfse.discriminacao.trim();
        payload.valor_servicos = totaisNfse.servicos;
        payload.aliquota_iss = Number(novaNfse.aliquota_iss) || 0;
        payload.iss_retido = novaNfse.iss_retido;
        payload.valor_iss = totaisNfse.iss;
        payload.valor_total = totaisNfse.total;
        payload.itens = [];
        payload.observacoes = novaNfse.observacoes || null;
      }

      const { error } = await supabase.from("notas_fiscais").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(modelo === "nfe" ? "NF-e salva como rascunho" : "NFS-e salva como rascunho");
      qc.invalidateQueries({ queryKey: ["notas_fiscais"] });
      qc.invalidateQueries({ queryKey: ["configuracao_fiscal"] });
      setNovaOpen(false);
      setNovaNfe(novaNfeVazia);
      setItensNfe([]);
      setNovaNfse(novaNfseVazia);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const tokenConfigurado = !!config?.token_configurado;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emissão de Notas Fiscais"
        subtitle="Emita NF-e de produtos e NFS-e de serviços, acompanhe status e cancele quando necessário."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link to="/fiscal/config">
                <Settings /> Configuração fiscal
              </Link>
            </Button>
            <Dialog open={novaOpen} onOpenChange={setNovaOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus /> {modelo === "nfe" ? "Nova NF-e" : "Nova NFS-e"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                  <DialogTitle>{modelo === "nfe" ? "Emitir NF-e" : "Emitir NFS-e"}</DialogTitle>
                  <DialogDescription>
                    Preencha os dados fiscais. A nota é salva como rascunho antes da transmissão.
                  </DialogDescription>
                </DialogHeader>

                {!tokenConfigurado && (
                  <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                    <span>
                      Token de homologação da Focus NFe ainda não configurado.{" "}
                      <Link to="/fiscal/config" className="underline">
                        Configurar agora
                      </Link>
                      .
                    </span>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Importar de um pedido" className="sm:col-span-2">
                    <Select
                      value={modelo === "nfe" ? novaNfe.venda_id : novaNfse.venda_id}
                      onValueChange={(v) => void carregarVenda(v, modelo)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um pedido recente" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendas.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.numero ?? v.id.slice(0, 8)} — {v.cliente_nome ?? "Sem cliente"} —{" "}
                            {brl(v.valor_total)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Cliente cadastrado">
                    <Select
                      value={modelo === "nfe" ? novaNfe.cliente_id : novaNfse.cliente_id}
                      onValueChange={(v) => selecionarClienteNfe(v, modelo)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
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

                  <Field label="Nome / razão social *">
                    <Input
                      value={modelo === "nfe" ? novaNfe.cliente_nome : novaNfse.cliente_nome}
                      onChange={(e) =>
                        modelo === "nfe"
                          ? setNovaNfe((f) => ({ ...f, cliente_nome: e.target.value }))
                          : setNovaNfse((f) => ({ ...f, cliente_nome: e.target.value }))
                      }
                    />
                  </Field>

                  <Field label="CPF/CNPJ">
                    <Input
                      value={
                        modelo === "nfe" ? novaNfe.cliente_documento : novaNfse.cliente_documento
                      }
                      onChange={(e) =>
                        modelo === "nfe"
                          ? setNovaNfe((f) => ({ ...f, cliente_documento: e.target.value }))
                          : setNovaNfse((f) => ({ ...f, cliente_documento: e.target.value }))
                      }
                    />
                  </Field>

                  {(modelo === "nfe" ? clienteSelecionadoNfe : clienteSelecionadoNfse) && (
                    <div className="sm:col-span-2 rounded-lg border border-border p-3 text-xs text-muted-foreground">
                      {(() => {
                        const c = modelo === "nfe" ? clienteSelecionadoNfe! : clienteSelecionadoNfse!;
                        return (
                          <>
                            IE: {c.inscricao_estadual ?? "—"} · Indicador IE: {c.indicador_ie} · IM:{" "}
                            {c.inscricao_municipal ?? "—"} · Endereço: {c.logradouro ?? "—"},{" "}
                            {c.numero ?? "s/n"} — {c.bairro ?? "—"}, {c.cidade ?? "—"}/{c.estado ?? "—"}{" "}
                            {c.cep ?? ""}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {modelo === "nfe" ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="Natureza da operação" className="sm:col-span-2">
                        <Input
                          value={novaNfe.natureza_operacao}
                          onChange={(e) =>
                            setNovaNfe((f) => ({ ...f, natureza_operacao: e.target.value }))
                          }
                        />
                      </Field>
                      <Field label="Finalidade">
                        <Select
                          value={novaNfe.finalidade}
                          onValueChange={(v) => setNovaNfe((f) => ({ ...f, finalidade: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FINALIDADES.map((f) => (
                              <SelectItem key={f.value} value={f.value}>
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Presença do comprador">
                        <Select
                          value={novaNfe.presenca_comprador}
                          onValueChange={(v) =>
                            setNovaNfe((f) => ({ ...f, presenca_comprador: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRESENCA.map((p) => (
                              <SelectItem key={p.value} value={p.value}>
                                {p.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Modalidade do frete">
                        <Select
                          value={novaNfe.modalidade_frete}
                          onValueChange={(v) =>
                            setNovaNfe((f) => ({ ...f, modalidade_frete: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FRETES.map((f) => (
                              <SelectItem key={f.value} value={f.value}>
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Valor do frete">
                        <Input
                          type="number"
                          step="0.01"
                          value={novaNfe.valor_frete}
                          onChange={(e) =>
                            setNovaNfe((f) => ({ ...f, valor_frete: e.target.value }))
                          }
                        />
                      </Field>
                      <Field label="Desconto">
                        <Input
                          type="number"
                          step="0.01"
                          value={novaNfe.valor_desconto}
                          onChange={(e) =>
                            setNovaNfe((f) => ({ ...f, valor_desconto: e.target.value }))
                          }
                        />
                      </Field>
                      <Field label="Consumidor final">
                        <div className="flex h-9 items-center gap-2">
                          <Switch
                            checked={novaNfe.consumidor_final}
                            onCheckedChange={(v) =>
                              setNovaNfe((f) => ({ ...f, consumidor_final: v }))
                            }
                          />
                          <span className="text-sm text-muted-foreground">
                            {novaNfe.consumidor_final ? "Sim" : "Não"}
                          </span>
                        </div>
                      </Field>
                    </div>

                    <div className="space-y-2 rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Itens</p>
                        <Button type="button" size="sm" variant="outline" onClick={adicionarItem}>
                          <Plus className="size-4" /> Adicionar item
                        </Button>
                      </div>
                      {itensNfe.length > 0 && (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>NCM</TableHead>
                                <TableHead>CST</TableHead>
                                <TableHead>CFOP</TableHead>
                                <TableHead>CEST</TableHead>
                                <TableHead>Orig.</TableHead>
                                <TableHead>Un.</TableHead>
                                <TableHead className="text-right">Qtd</TableHead>
                                <TableHead className="text-right">Vlr Unit</TableHead>
                                <TableHead className="text-right">ICMS%</TableHead>
                                <TableHead className="text-right">IPI%</TableHead>
                                <TableHead className="text-right">PIS%</TableHead>
                                <TableHead className="text-right">COFINS%</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead />
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {itensNfe.map((item, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>
                                    <Input
                                      className="w-20"
                                      value={item.codigo}
                                      onChange={(e) => atualizarItem(idx, "codigo", e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      className="w-40"
                                      value={item.descricao}
                                      onChange={(e) =>
                                        atualizarItem(idx, "descricao", e.target.value)
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      className="w-20"
                                      value={item.ncm}
                                      onChange={(e) => atualizarItem(idx, "ncm", e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      className="w-16"
                                      value={item.cst}
                                      onChange={(e) => atualizarItem(idx, "cst", e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      className="w-20"
                                      value={item.cfop}
                                      onChange={(e) => atualizarItem(idx, "cfop", e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      className="w-16"
                                      value={item.cest}
                                      onChange={(e) => atualizarItem(idx, "cest", e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      className="w-12"
                                      value={item.origem}
                                      onChange={(e) => atualizarItem(idx, "origem", e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      className="w-14"
                                      value={item.unidade}
                                      onChange={(e) =>
                                        atualizarItem(idx, "unidade", e.target.value)
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      className="w-16 text-right"
                                      value={item.quantidade}
                                      onChange={(e) =>
                                        atualizarItem(idx, "quantidade", e.target.value)
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      className="w-24 text-right"
                                      value={item.valor_unitario}
                                      onChange={(e) =>
                                        atualizarItem(idx, "valor_unitario", e.target.value)
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      className="w-16 text-right"
                                      value={item.aliquota_icms}
                                      onChange={(e) =>
                                        atualizarItem(idx, "aliquota_icms", e.target.value)
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      className="w-16 text-right"
                                      value={item.aliquota_ipi}
                                      onChange={(e) =>
                                        atualizarItem(idx, "aliquota_ipi", e.target.value)
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      className="w-16 text-right"
                                      value={item.aliquota_pis}
                                      onChange={(e) =>
                                        atualizarItem(idx, "aliquota_pis", e.target.value)
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      className="w-16 text-right"
                                      value={item.aliquota_cofins}
                                      onChange={(e) =>
                                        atualizarItem(idx, "aliquota_cofins", e.target.value)
                                      }
                                    />
                                  </TableCell>
                                  <TableCell className="text-right whitespace-nowrap">
                                    {brl(item.quantidade * item.valor_unitario)}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => removerItem(idx)}
                                    >
                                      <XCircle className="text-destructive" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>

                    <div className="grid gap-2 rounded-lg border border-border p-3 text-sm sm:grid-cols-3">
                      <p>Produtos: <span className="font-medium">{brl(totaisNfe.valorProdutos)}</span></p>
                      <p>Base ICMS: <span className="font-medium">{brl(totaisNfe.baseIcms)}</span></p>
                      <p>ICMS: <span className="font-medium">{brl(totaisNfe.valorIcms)}</span></p>
                      <p>IPI: <span className="font-medium">{brl(totaisNfe.valorIpi)}</span></p>
                      <p>PIS: <span className="font-medium">{brl(totaisNfe.valorPis)}</span></p>
                      <p>COFINS: <span className="font-medium">{brl(totaisNfe.valorCofins)}</span></p>
                      <p className="sm:col-span-3 text-base">
                        Total da nota: <span className="font-semibold">{brl(totaisNfe.total)}</span>
                      </p>
                    </div>

                    <Field label="Observações">
                      <Textarea
                        value={novaNfe.observacoes}
                        onChange={(e) => setNovaNfe((f) => ({ ...f, observacoes: e.target.value }))}
                      />
                    </Field>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="Código de serviço municipal">
                        <Input
                          value={novaNfse.codigo_servico}
                          onChange={(e) =>
                            setNovaNfse((f) => ({ ...f, codigo_servico: e.target.value }))
                          }
                        />
                      </Field>
                      <Field label="Valor dos serviços">
                        <Input
                          type="number"
                          step="0.01"
                          value={novaNfse.valor_servicos}
                          onChange={(e) =>
                            setNovaNfse((f) => ({ ...f, valor_servicos: e.target.value }))
                          }
                        />
                      </Field>
                      <Field label="Alíquota ISS (%)">
                        <Input
                          type="number"
                          step="0.01"
                          value={novaNfse.aliquota_iss}
                          onChange={(e) =>
                            setNovaNfse((f) => ({ ...f, aliquota_iss: e.target.value }))
                          }
                        />
                      </Field>
                      <Field label="ISS retido">
                        <div className="flex h-9 items-center gap-2">
                          <Switch
                            checked={novaNfse.iss_retido}
                            onCheckedChange={(v) =>
                              setNovaNfse((f) => ({ ...f, iss_retido: v }))
                            }
                          />
                          <span className="text-sm text-muted-foreground">
                            {novaNfse.iss_retido ? "Sim" : "Não"}
                          </span>
                        </div>
                      </Field>
                    </div>
                    <Field label="Discriminação do serviço *">
                      <Textarea
                        rows={4}
                        value={novaNfse.discriminacao}
                        onChange={(e) =>
                          setNovaNfse((f) => ({ ...f, discriminacao: e.target.value }))
                        }
                      />
                    </Field>
                    <div className="grid gap-2 rounded-lg border border-border p-3 text-sm sm:grid-cols-3">
                      <p>Serviços: <span className="font-medium">{brl(totaisNfse.servicos)}</span></p>
                      <p>ISS: <span className="font-medium">{brl(totaisNfse.iss)}</span></p>
                      <p className="text-base">
                        Total da nota: <span className="font-semibold">{brl(totaisNfse.total)}</span>
                      </p>
                    </div>
                    <Field label="Observações">
                      <Textarea
                        value={novaNfse.observacoes}
                        onChange={(e) =>
                          setNovaNfse((f) => ({ ...f, observacoes: e.target.value }))
                        }
                      />
                    </Field>
                  </div>
                )}

                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    disabled={!tokenConfigurado}
                    title={
                      tokenConfigurado
                        ? "Transmitir para a SEFAZ via Focus NFe"
                        : "Token de homologação da Focus NFe ainda não configurado"
                    }
                    onClick={() => {
                      toast.info("Salve a nota como rascunho para depois transmiti-la.");
                    }}
                  >
                    Transmitir para SEFAZ (Focus NFe)
                  </Button>
                  <Button onClick={() => criarNota.mutate()} disabled={criarNota.isPending}>
                    Salvar como rascunho
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <Tabs value={modelo} onValueChange={(v) => setModelo(v as Modelo)}>
        <TabsList>
          <TabsTrigger value="nfe">NF-e (produtos)</TabsTrigger>
          <TabsTrigger value="nfse">NFS-e (serviços)</TabsTrigger>
        </TabsList>
      </Tabs>

      {!tokenConfigurado && (
        <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
          <span>
            Token de homologação da Focus NFe ainda não configurado.{" "}
            <Link to="/fiscal/config" className="underline">
              Configurar agora
            </Link>
            .
          </span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        <Kpi label="Autorizadas no mês" value={String(kpis.autorizadas)} />
        <Kpi label="Valor total autorizado" value={brl(kpis.valorAutorizado)} tone="positive" />
        <Kpi label="Rejeitadas" value={String(kpis.rejeitadas)} tone="negative" />
        <Kpi label="Rascunhos" value={String(kpis.rascunhos)} tone="warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-3">
            {modelo === "nfe" ? "Notas fiscais eletrônicas" : "Notas fiscais de serviço"}
            <Badge variant="secondary">{notasFiltradas.length}</Badge>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Input
                placeholder="Buscar cliente, número ou chave"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-56"
              />
              <Input
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
                className="w-40"
              />
              <Input
                type="date"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
                className="w-40"
              />
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todos os status</SelectItem>
                  {Object.entries(statusLabel).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notasFiltradas.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma nota encontrada com os filtros atuais.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº / Série</TableHead>
                    <TableHead>Emissão</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notasFiltradas.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell>
                        {n.numero ?? "—"}
                        {n.serie ? ` / ${n.serie}` : ""}
                      </TableCell>
                      <TableCell>{dataBR(n.data_emissao)}</TableCell>
                      <TableCell className="font-medium">{n.cliente_nome ?? "—"}</TableCell>
                      <TableCell className="text-right">{brl(n.valor_total)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(n.status)}>
                          {statusLabel[n.status] ?? n.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Ver detalhes"
                          onClick={() => setDetalheId(n.id)}
                        >
                          <Eye />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Copiar chave de acesso"
                          disabled={!n.chave_acesso}
                          onClick={() => copiarChave(n.chave_acesso)}
                        >
                          <Copy />
                        </Button>
                        {n.url_danfe && (
                          <Button size="icon" variant="ghost" title="Abrir DANFE" asChild>
                            <a href={n.url_danfe} target="_blank" rel="noopener noreferrer">
                              <Download />
                            </a>
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Cancelar nota"
                          disabled={n.status === "cancelada"}
                          onClick={() => setCancelarId(n.id)}
                        >
                          <XCircle className="text-destructive" />
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

      <Dialog open={!!detalheId} onOpenChange={(o) => !o && setDetalheId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da nota</DialogTitle>
            <DialogDescription>
              {detalhe?.numero ? `Nº ${detalhe.numero}` : "Rascunho"}{" "}
              {detalhe?.serie ? `/ Série ${detalhe.serie}` : ""}
            </DialogDescription>
          </DialogHeader>
          {detalhe && (
            <div className="space-y-3 text-sm">
              <div className="grid gap-2 sm:grid-cols-2">
                <p>Modelo: <span className="font-medium">{detalhe.modelo === "nfe" ? "NF-e" : "NFS-e"}</span></p>
                <p>Status: <Badge variant={statusVariant(detalhe.status)}>{statusLabel[detalhe.status] ?? detalhe.status}</Badge></p>
                <p>Cliente: <span className="font-medium">{detalhe.cliente_nome ?? "—"}</span></p>
                <p>Documento: <span className="font-medium">{detalhe.cliente_documento ?? "—"}</span></p>
                <p>Emissão: <span className="font-medium">{dataBR(detalhe.data_emissao)}</span></p>
                <p>Referência: <span className="font-mono text-xs">{detalhe.referencia ?? "—"}</span></p>
                <p>Chave de acesso: <span className="font-mono text-xs break-all">{detalhe.chave_acesso ?? "—"}</span></p>
                <p>Protocolo: <span className="font-medium">{detalhe.protocolo ?? "—"}</span></p>
              </div>

              {detalhe.modelo === "nfe" ? (
                <>
                  <p className="text-muted-foreground">Natureza: {detalhe.natureza_operacao}</p>
                  {Array.isArray(detalhe.itens) && detalhe.itens.length > 0 && (
                    <div className="overflow-x-auto rounded-lg border border-border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Descrição</TableHead>
                            <TableHead className="text-right">Qtd</TableHead>
                            <TableHead className="text-right">Vlr Unit</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {detalhe.itens.map((i: any, idx: number) => (
                            <TableRow key={idx}>
                              <TableCell>{i.descricao}</TableCell>
                              <TableCell className="text-right">{i.quantidade}</TableCell>
                              <TableCell className="text-right">{brl(i.valor_unitario)}</TableCell>
                              <TableCell className="text-right">{brl(i.total ?? i.quantidade * i.valor_unitario)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  <div className="grid gap-2 sm:grid-cols-3">
                    <p>Produtos: {brl(detalhe.valor_produtos)}</p>
                    <p>ICMS: {brl(detalhe.valor_icms)}</p>
                    <p>IPI: {brl(detalhe.valor_ipi)}</p>
                    <p>PIS: {brl(detalhe.valor_pis)}</p>
                    <p>COFINS: {brl(detalhe.valor_cofins)}</p>
                    <p>Frete: {brl(detalhe.valor_frete)}</p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground">Código de serviço: {detalhe.codigo_servico ?? "—"}</p>
                  <p>{detalhe.discriminacao}</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <p>Serviços: {brl(detalhe.valor_servicos)}</p>
                    <p>ISS ({detalhe.aliquota_iss}%): {brl(detalhe.valor_iss)}</p>
                    <p>ISS retido: {detalhe.iss_retido ? "Sim" : "Não"}</p>
                  </div>
                </>
              )}

              <p className="text-base font-semibold">Total: {brl(detalhe.valor_total)}</p>

              {detalhe.mensagem_sefaz && (
                <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs">
                  <p className="font-medium">Mensagem da SEFAZ</p>
                  <p className="text-muted-foreground">{detalhe.mensagem_sefaz}</p>
                </div>
              )}
              {detalhe.motivo_cancelamento && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs">
                  <p className="font-medium">Motivo do cancelamento</p>
                  <p className="text-muted-foreground">{detalhe.motivo_cancelamento}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!cancelarId}
        onOpenChange={(o) => {
          if (!o) {
            setCancelarId(null);
            setMotivoCancelamento("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar nota</DialogTitle>
            <DialogDescription>
              Nota {notaCancelar?.numero ?? "—"} — {notaCancelar?.cliente_nome ?? ""}. Informe o
              motivo do cancelamento (mínimo de 15 caracteres).
            </DialogDescription>
          </DialogHeader>
          <Field label="Motivo do cancelamento *">
            <Textarea
              value={motivoCancelamento}
              onChange={(e) => setMotivoCancelamento(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">{motivoCancelamento.trim().length}/15</p>
          </Field>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => cancelar.mutate()}
              disabled={cancelar.isPending}
            >
              Confirmar cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
