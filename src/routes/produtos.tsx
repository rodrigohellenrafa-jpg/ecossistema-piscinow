import { useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ExternalLink,
  Pencil,
  Plus,
  Search,
  ShoppingCart,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/field";
import { LancarProdutosEmLote } from "@/components/lancar-produtos-em-lote";
import { ModalTabelaSplash } from "@/components/modal-tabela-splash";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { brl, CATEGORIAS_PRODUTO, hojeISO, margem, pct, proximoCodigo } from "@/lib/erp";
import type { Tables } from "@/integrations/supabase/types";
import { useAbrirModal } from "@/hooks/use-abrir-modal";
import { useSincronizarPecasEstoque } from "@/hooks/use-sincronizar-pecas-estoque";

export const Route = createFileRoute("/produtos")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Produtos e Serviços | Piscinow ERP" },
      {
        name: "description",
        content: "Cadastro de produtos e serviços com preços, custos, fornecedor, fiscal e estoque.",
      },
      { property: "og:title", content: "Produtos e Serviços | Piscinow ERP" },
      {
        property: "og:description",
        content: "Gerencie catálogo, preços, margens e estoque da Piscinow.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Produtos />
    </RequireAuth>
  ),
});

type Produto = Tables<"produtos">;

const SEM_FORNECEDOR = "__nenhum__";
const TODAS_CATEGORIAS = "__todas__";

const vazio = {
  codigo: "",
  nome: "",
  categoria: "",
  tipo: "produto",
  unidade: "UN",
  preco_custo: "0",
  preco_venda: "0",
  estoque_atual: "0",
  estoque_minimo: "0",
  unidades_por_compra: "1",
  custo_fabricacao: "0",
  custo_logistico: "0",
  fornecedor_id: SEM_FORNECEDOR,
  ncm: "",
  cst: "",
  cfop: "",
  localizacao: "",
  descricao: "",
  cest: "",
  origem_mercadoria: "0",
  aliquota_icms: "0",
  aliquota_ipi: "0",
  aliquota_pis: "0",
  aliquota_cofins: "0",
  aliquota_iss: "0",
  codigo_servico_municipal: "",
  sob_encomenda: "nao",
};

const ORIGENS_MERCADORIA = [
  { value: "0", label: "0 - Nacional" },
  { value: "1", label: "1 - Estrangeira - Importação direta" },
  { value: "2", label: "2 - Estrangeira - Adquirida no mercado interno" },
  { value: "3", label: "3 - Nacional - Conteúdo de importação > 40%" },
  { value: "4", label: "4 - Nacional - Processos produtivos básicos" },
  { value: "5", label: "5 - Nacional - Conteúdo de importação <= 40%" },
  { value: "6", label: "6 - Estrangeira - Importação direta, sem similar nacional" },
  { value: "7", label: "7 - Estrangeira - Mercado interno, sem similar nacional" },
  { value: "8", label: "8 - Nacional - Conteúdo de importação > 70%" },
] as const;

function Produtos() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  useSincronizarPecasEstoque();
  const [q, setQ] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>(TODAS_CATEGORIAS);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [open, setOpen] = useState(false);
  useAbrirModal("novo", () => setOpen(true));
  const [editando, setEditando] = useState<Produto | null>(null);
  const [form, setForm] = useState(vazio);

  // Estado e referência para o modal rápido "Gerar Ordem de Compra"
  const qtdOcInputRef = useRef<HTMLInputElement | null>(null);
  const [ocProduto, setOcProduto] = useState<Produto | null>(null);
  const [ocForm, setOcForm] = useState({
    produto_id: "",
    fornecedor_id: "",
    quantidade: "1",
    valor_unitario: "0",
    desconto: "0",
    previsao_entrega: "",
    condicoes: "",
    observacoes: "",
  });

  const { data = [] } = useQuery({
    queryKey: ["produtos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("produtos").select("*").order("nome");
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
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const resolverFornecedorPadrao = (p: Produto) => {
    const normalizar = (s: string) =>
      s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
    const analandiaForn = fornecedores.find((f) => normalizar(f.nome).includes("analandia"));

    if (p.fornecedor_id) {
      const fornAtual = fornecedores.find((f) => f.id === p.fornecedor_id);
      if (fornAtual) {
        const nomeNorm = normalizar(fornAtual.nome);
        const eraSplashIgui =
          nomeNorm.includes("splash piscinas") ||
          nomeNorm.includes("by igui") ||
          nomeNorm === "splash";
        if (eraSplashIgui && analandiaForn) {
          return analandiaForn.id;
        }
        return fornAtual.id;
      }
    }

    const ehPiscinaOuSplash =
      p.codigo?.toUpperCase().startsWith("SPL-") ||
      p.codigo?.toUpperCase().startsWith("PEC-") ||
      p.nome.toLowerCase().includes("splash") ||
      p.nome.toLowerCase().includes("piscina") ||
      p.categoria === "Piscinas";
    if (ehPiscinaOuSplash && analandiaForn) {
      return analandiaForn.id;
    }
    return fornecedores[0]?.id ?? "";
  };

  const abrirGerarOc = (p: Produto) => {
    const custoPadrao =
      Number(p.preco_custo) > 0
        ? Number(p.preco_custo)
        : Number(p.custo_fabricacao ?? 0) + Number(p.custo_logistico ?? 0);
    const qtdSugerida =
      Number(p.estoque_minimo ?? 0) > Number(p.estoque_atual ?? 0)
        ? Math.max(1, Number(p.estoque_minimo ?? 0) - Number(p.estoque_atual ?? 0))
        : 1;
    setOcProduto(p);
    setOcForm({
      produto_id: p.id,
      fornecedor_id: resolverFornecedorPadrao(p),
      quantidade: String(qtdSugerida),
      valor_unitario: String(custoPadrao || 0),
      desconto: "0",
      previsao_entrega: "",
      condicoes: "",
      observacoes: "",
    });
    setTimeout(() => {
      qtdOcInputRef.current?.focus();
      qtdOcInputRef.current?.select();
    }, 60);
  };

  const gerarOrdemCompra = useMutation({
    mutationFn: async () => {
      const prod = data.find((x) => x.id === ocForm.produto_id) ?? ocProduto;
      if (!prod) throw new Error("Produto não encontrado.");
      if (!ocForm.fornecedor_id) throw new Error("Selecione o fornecedor para a Ordem de Compra.");
      const quantidade = Number(ocForm.quantidade);
      if (!Number.isFinite(quantidade) || quantidade <= 0) {
        throw new Error("Informe uma quantidade válida maior que zero.");
      }
      const valorUnitario = Math.max(Number(ocForm.valor_unitario) || 0, 0);
      const desconto = Math.max(Number(ocForm.desconto) || 0, 0);
      const totalItem = Math.max(quantidade * valorUnitario - desconto, 0);

      const fornecedor = fornecedores.find((f) => f.id === ocForm.fornecedor_id);
      const { data: auth } = await supabase.auth.getUser();
      const { data: existentes } = await supabase.from("ordens_compra").select("numero");
      const numero = proximoCodigo("OC", (existentes ?? []).map((o) => o.numero));

      const { data: ordemCriada, error: erroOrdem } = await supabase
        .from("ordens_compra")
        .insert({
          numero,
          fornecedor_id: ocForm.fornecedor_id,
          fornecedor_nome: fornecedor?.nome ?? null,
          data_pedido: hojeISO(),
          previsao_entrega: ocForm.previsao_entrega || null,
          condicoes: ocForm.condicoes || null,
          observacoes: ocForm.observacoes || null,
          valor_produtos: totalItem,
          desconto,
          icms_base: totalItem,
          icms_valor: totalItem * 0.18,
          icms_st_base: 0,
          icms_st_valor: 0,
          valor_total: totalItem,
          status: "pendente",
          created_by: auth.user?.id ?? null,
        })
        .select("id, numero")
        .single();
      if (erroOrdem) throw erroOrdem;

      const { error: erroItem } = await supabase.from("ordem_compra_itens").insert({
        ordem_id: ordemCriada.id,
        produto_id: prod.id,
        codigo: prod.codigo ?? "",
        descricao: prod.nome,
        ncm: prod.ncm ?? "",
        cst: prod.cst ?? "",
        unidade: prod.unidade || "UN",
        quantidade,
        valor_unitario: valorUnitario,
        desconto,
        total: totalItem,
        cliente_id: null,
        cliente_nome: null,
        cor: prod.cor_pastilha ?? null,
        pastilha: prod.modelo_pastilha ?? null,
      });
      if (erroItem) throw erroItem;

      // Mantém fornecedor padrão e custo sincronizados no cadastro do produto se necessário
      const patchProduto: Record<string, unknown> = {};
      if (!prod.fornecedor_id && ocForm.fornecedor_id) {
        patchProduto.fornecedor_id = ocForm.fornecedor_id;
      }
      if (valorUnitario > 0 && valorUnitario !== Number(prod.preco_custo ?? 0)) {
        patchProduto.preco_custo = valorUnitario;
      }
      if (Object.keys(patchProduto).length > 0) {
        await supabase.from("produtos").update(patchProduto as never).eq("id", prod.id);
      }

      return ordemCriada;
    },
    onSuccess: (ordemCriada) => {
      toast.success(`Ordem de Compra ${ordemCriada.numero} gerada com sucesso!`);
      setOcProduto(null);
      qc.invalidateQueries({ queryKey: ["ordens_compra"] });
      qc.invalidateQueries({ queryKey: ["ordem_compra_itens"] });
      qc.invalidateQueries({ queryKey: ["produtos"] });
      qc.invalidateQueries({ queryKey: ["produtos-select"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const abrirNovo = () => {
    setEditando(null);
    setForm(vazio);
    setOpen(true);
  };

  const abrirEdicao = (p: Produto) => {
    setEditando(p);
    setForm({
      codigo: p.codigo ?? "",
      nome: p.nome,
      categoria: p.categoria ?? "",
      tipo: p.tipo,
      unidade: p.unidade,
      preco_custo: String(p.preco_custo ?? 0),
      preco_venda: String(p.preco_venda ?? 0),
      estoque_atual: String(p.estoque_atual ?? 0),
      estoque_minimo: String(p.estoque_minimo ?? 0),
      unidades_por_compra: String(
        (p as { unidades_por_compra?: number }).unidades_por_compra ?? 1,
      ),
      custo_fabricacao: String(p.custo_fabricacao ?? 0),
      custo_logistico: String(p.custo_logistico ?? 0),
      fornecedor_id: p.fornecedor_id ?? SEM_FORNECEDOR,
      ncm: p.ncm ?? "",
      cst: p.cst ?? "",
      cfop: p.cfop ?? "",
      localizacao: p.localizacao ?? "",
      descricao: p.descricao ?? "",
      cest: p.cest ?? "",
      origem_mercadoria: p.origem_mercadoria ?? "0",
      aliquota_icms: String(p.aliquota_icms ?? 0),
      aliquota_ipi: String(p.aliquota_ipi ?? 0),
      aliquota_pis: String(p.aliquota_pis ?? 0),
      aliquota_cofins: String(p.aliquota_cofins ?? 0),
      aliquota_iss: String(p.aliquota_iss ?? 0),
      codigo_servico_municipal: p.codigo_servico_municipal ?? "",
      sob_encomenda: (p as { sob_encomenda?: boolean }).sob_encomenda ? "sim" : "nao",
    });
    setOpen(true);
  };

  const salvar = useMutation({
    mutationFn: async () => {
      if (!form.nome.trim()) throw new Error("Informe o nome do item.");
      const payload = {
        codigo: form.codigo || null,
        nome: form.nome.trim(),
        categoria: form.categoria || null,
        tipo: form.tipo,
        unidade: form.unidade,
        preco_custo: Number(form.preco_custo) || 0,
        preco_venda: Number(form.preco_venda) || 0,
        estoque_atual: Number(form.estoque_atual) || 0,
        estoque_minimo: Number(form.estoque_minimo) || 0,
        unidades_por_compra: Math.max(Number(form.unidades_por_compra) || 1, 1),
        custo_fabricacao: Number(form.custo_fabricacao) || 0,
        custo_logistico: Number(form.custo_logistico) || 0,
        fornecedor_id: form.fornecedor_id === SEM_FORNECEDOR ? null : form.fornecedor_id,
        ncm: form.ncm || null,
        cst: form.cst || null,
        cfop: form.cfop || null,
        localizacao: form.localizacao || null,
        descricao: form.descricao || null,
        cest: form.cest || null,
        origem_mercadoria: form.origem_mercadoria || "0",
        aliquota_icms: Number(form.aliquota_icms) || 0,
        aliquota_ipi: Number(form.aliquota_ipi) || 0,
        aliquota_pis: Number(form.aliquota_pis) || 0,
        aliquota_cofins: Number(form.aliquota_cofins) || 0,
        aliquota_iss: Number(form.aliquota_iss) || 0,
        codigo_servico_municipal: form.codigo_servico_municipal || null,
        sob_encomenda: form.sob_encomenda === "sim",
      };
      if (editando) {
        const { error } = await supabase
          .from("produtos")
          .update(payload as never)
          .eq("id", editando.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("produtos").insert({
          ...payload,
          created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
        } as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editando ? "Item atualizado!" : "Item cadastrado!");
      setForm(vazio);
      setEditando(null);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["produtos"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const excluir = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("produtos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["produtos"] }),
  });

  const totalSplashNoBanco = data.filter(
    (p) => p.codigo?.startsWith("SPL-") || p.nome?.toLowerCase().includes("splash"),
  ).length;

  const lista = data
    .filter((p) => filtroCategoria === TODAS_CATEGORIAS || p.categoria === filtroCategoria)
    .filter((p) => {
      if (filtroTipo === "todos") return true;
      if (filtroTipo === "splash")
        return p.codigo?.startsWith("SPL-") || p.nome?.toLowerCase().includes("splash");
      if (filtroTipo === "uso_geral")
        return p.tipo === "uso_geral" || p.categoria === "Peças" || p.categoria === "Ferramentas";
      return p.tipo === filtroTipo;
    })
    .filter((p) =>
      `${p.nome} ${p.codigo ?? ""} ${p.categoria ?? ""} ${p.descricao ?? ""}`
        .toLowerCase()
        .includes(q.toLowerCase()),
    );
  const set = (k: keyof typeof vazio) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const nomeFornecedor = (id: string | null, p?: Produto) => {
    const f = fornecedores.find((x) => x.id === id);
    if (f) {
      const nomeNorm = f.nome
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
      if (
        nomeNorm.includes("splash piscinas") ||
        nomeNorm.includes("by igui") ||
        nomeNorm === "splash" ||
        nomeNorm.includes("analandia")
      ) {
        return "Analandia Ind Piscinas";
      }
      return f.nome;
    }
    if (p && (p.categoria === "Piscinas" || p.codigo?.toUpperCase().startsWith("SPL-"))) {
      return "Analandia Ind Piscinas";
    }
    return "—";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos e Serviços"
        subtitle="Catálogo, preços, custos e estoque no banco."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ModalTabelaSplash produtosExistentes={data} />
            <LancarProdutosEmLote />
            <Dialog
              open={open}
              onOpenChange={(v) => {
                setOpen(v);
                if (!v) setEditando(null);
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={abrirNovo}>
                  <Plus /> Novo item
                </Button>
              </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editando ? "Editar item" : "Novo produto ou serviço"}</DialogTitle>
                <DialogDescription>Serviços não controlam estoque.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome" className="sm:col-span-2">
                  <Input value={form.nome} onChange={(e) => set("nome")(e.target.value)} />
                </Field>
                <Field label="Código / SKU">
                  <Input value={form.codigo} onChange={(e) => set("codigo")(e.target.value)} />
                </Field>
                <Field label="Categoria">
                  <Select value={form.categoria || undefined} onValueChange={set("categoria")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_PRODUTO.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Tipo">
                  <Select value={form.tipo} onValueChange={set("tipo")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="produto">Produto</SelectItem>
                      <SelectItem value="servico">Serviço</SelectItem>
                      <SelectItem value="uso_geral">Uso Geral</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Unidade">
                  <Input value={form.unidade} onChange={(e) => set("unidade")(e.target.value)} />
                </Field>
                <Field label="Preço de custo (R$)">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.preco_custo}
                    onChange={(e) => set("preco_custo")(e.target.value)}
                  />
                </Field>
                <Field label="Preço de venda (R$)">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.preco_venda}
                    onChange={(e) => set("preco_venda")(e.target.value)}
                  />
                </Field>
                <Field label="Custo de fabricação (R$)">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.custo_fabricacao}
                    onChange={(e) => set("custo_fabricacao")(e.target.value)}
                  />
                </Field>
                <Field label="Custo logístico (R$)">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.custo_logistico}
                    onChange={(e) => set("custo_logistico")(e.target.value)}
                  />
                </Field>
                <Field label="Fornecedor">
                  <Select value={form.fornecedor_id} onValueChange={set("fornecedor_id")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SEM_FORNECEDOR}>Sem fornecedor</SelectItem>
                      {fornecedores.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Localização no galpão">
                  <Input
                    value={form.localizacao}
                    onChange={(e) => set("localizacao")(e.target.value)}
                  />
                </Field>
                <Field label="NCM">
                  <Input value={form.ncm} onChange={(e) => set("ncm")(e.target.value)} />
                </Field>
                <Field label="CST">
                  <Input value={form.cst} onChange={(e) => set("cst")(e.target.value)} />
                </Field>
                <Field label="CFOP">
                  <Input value={form.cfop} onChange={(e) => set("cfop")(e.target.value)} />
                </Field>
                {(form.tipo === "produto" || form.tipo === "uso_geral") && (
                  <>
                    <Field label="Estoque atual">
                      <Input
                        type="number"
                        step="0.001"
                        value={form.estoque_atual}
                        onChange={(e) => set("estoque_atual")(e.target.value)}
                      />
                    </Field>
                    <Field label="Estoque mínimo">
                      <Input
                        type="number"
                        step="0.001"
                        value={form.estoque_minimo}
                        onChange={(e) => set("estoque_minimo")(e.target.value)}
                      />
                    </Field>
                    <Field label="Unidades por caixa (compra)">
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={form.unidades_por_compra}
                        onChange={(e) => set("unidades_por_compra")(e.target.value)}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Quantas unidades vêm em cada caixa do fornecedor. Use 1 quando comprar e
                        vender na mesma unidade.
                      </p>
                    </Field>
                  </>
                )}
                {form.tipo === "produto" && (
                  <div className="flex items-start gap-2 rounded-md border border-border p-3 sm:col-span-2">
                    <Checkbox
                      id="produto-sob-encomenda"
                      checked={form.sob_encomenda === "sim"}
                      onCheckedChange={(v) => set("sob_encomenda")(v === true ? "sim" : "nao")}
                    />
                    <div className="space-y-0.5">
                      <Label htmlFor="produto-sob-encomenda">Vendido sob encomenda</Label>
                      <p className="text-xs text-muted-foreground">
                        Item que não fica em estoque. Não aparece como falta e a venda é concluída
                        normalmente, gerando pedido ao fornecedor.
                      </p>
                    </div>
                  </div>
                )}
                <Field label="Descrição" className="sm:col-span-2">
                  <Textarea
                    rows={3}
                    value={form.descricao}
                    onChange={(e) => set("descricao")(e.target.value)}
                  />
                </Field>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="fiscal">
                  <AccordionTrigger>Dados fiscais</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 pt-1 sm:grid-cols-2">
                      <Field label="CEST">
                        <Input value={form.cest} onChange={(e) => set("cest")(e.target.value)} />
                      </Field>
                      <Field label="Origem da mercadoria">
                        <Select
                          value={form.origem_mercadoria}
                          onValueChange={set("origem_mercadoria")}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORIGENS_MERCADORIA.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Alíquota ICMS (%)">
                        <Input
                          type="number"
                          step="0.01"
                          value={form.aliquota_icms}
                          onChange={(e) => set("aliquota_icms")(e.target.value)}
                        />
                      </Field>
                      <Field label="Alíquota IPI (%)">
                        <Input
                          type="number"
                          step="0.01"
                          value={form.aliquota_ipi}
                          onChange={(e) => set("aliquota_ipi")(e.target.value)}
                        />
                      </Field>
                      <Field label="Alíquota PIS (%)">
                        <Input
                          type="number"
                          step="0.01"
                          value={form.aliquota_pis}
                          onChange={(e) => set("aliquota_pis")(e.target.value)}
                        />
                      </Field>
                      <Field label="Alíquota COFINS (%)">
                        <Input
                          type="number"
                          step="0.01"
                          value={form.aliquota_cofins}
                          onChange={(e) => set("aliquota_cofins")(e.target.value)}
                        />
                      </Field>
                      {form.tipo === "servico" && (
                        <>
                          <Field label="Alíquota ISS (%)">
                            <Input
                              type="number"
                              step="0.01"
                              value={form.aliquota_iss}
                              onChange={(e) => set("aliquota_iss")(e.target.value)}
                            />
                          </Field>
                          <Field label="Código de serviço municipal">
                            <Input
                              value={form.codigo_servico_municipal}
                              onChange={(e) => set("codigo_servico_municipal")(e.target.value)}
                            />
                          </Field>
                        </>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <DialogFooter>
                <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
                  {editando ? "Salvar alterações" : "Salvar item"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      }
      />

      {totalSplashNoBanco === 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-foreground">
          <div className="flex items-center gap-2.5">
            <Sparkles className="size-5 text-amber-500 shrink-0" />
            <div>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                Tabela Oficial Splash Piscinas by iGUI 2026:
              </span>{" "}
              <span>
                116 modelos oficiais com preços da nova tabela estão disponíveis para sincronização no catálogo.
              </span>
            </div>
          </div>
          <ModalTabelaSplash produtosExistentes={data} />
        </div>
      )}

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Catálogo ({lista.length})</CardTitle>
            {totalSplashNoBanco > 0 && (
              <Badge variant="outline" className="text-xs bg-muted/40 font-normal">
                {totalSplashNoBanco} piscinas Splash no sistema
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-sm flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar item"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="produto">Apenas Produtos</SelectItem>
                <SelectItem value="servico">Apenas Serviços</SelectItem>
                <SelectItem value="uso_geral">Uso Geral (Peças & Ferramentas)</SelectItem>
                <SelectItem value="splash">Piscinas Splash</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODAS_CATEGORIAS}>Todas as categorias</SelectItem>
                {CATEGORIAS_PRODUTO.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
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
                <TableHead>Item</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Venda</TableHead>
                <TableHead className="text-right">Margem</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead className="w-44 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((p, idx) => {
                const encomenda = Boolean((p as { sob_encomenda?: boolean }).sob_encomenda);
                const controlaEstoque = p.tipo === "produto" || p.tipo === "uso_geral";
                const baixo =
                  controlaEstoque &&
                  !encomenda &&
                  Number(p.estoque_atual) <= Number(p.estoque_minimo);
                const custoTotal =
                  Number(p.custo_fabricacao) + Number(p.custo_logistico) || Number(p.preco_custo);
                const m = margem(Number(p.preco_venda), custoTotal);
                return (
                  <TableRow
                    key={p.id}
                    className={
                      baixo
                        ? "bg-destructive/10"
                        : idx % 2 === 0
                          ? "bg-muted/20"
                          : "bg-background"
                    }
                  >
                    <TableCell className="font-medium">
                      {p.nome}
                      {p.codigo && (
                        <span className="ml-2 text-xs text-muted-foreground">{p.codigo}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1">
                        <Badge
                          variant={p.tipo === "uso_geral" ? "outline" : "secondary"}
                          className={
                            p.tipo === "uso_geral"
                              ? "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium"
                              : undefined
                          }
                        >
                          {p.tipo === "uso_geral"
                            ? "Uso geral"
                            : p.tipo === "servico"
                              ? "Serviço"
                              : "Produto"}
                        </Badge>
                        {encomenda && (
                          <span className="rounded-full border border-sky-500/30 bg-sky-500/15 px-2 py-0.5 text-[11px] font-medium text-sky-500">
                            Sob encomenda
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{nomeFornecedor(p.fornecedor_id, p)}</TableCell>
                    <TableCell className="text-right">{brl(Number(p.preco_custo))}</TableCell>
                    <TableCell className="text-right">{brl(Number(p.preco_venda))}</TableCell>
                    <TableCell className="text-right">{pct(m)}</TableCell>
                    <TableCell className="text-right">
                      {p.tipo === "servico" ? (
                        "—"
                      ) : encomenda ? (
                        <span className="text-muted-foreground">Sob encomenda</span>
                      ) : (
                        <span
                          className={
                            baixo ? "inline-flex items-center gap-1 text-destructive" : undefined
                          }
                        >
                          {baixo && <AlertTriangle className="size-3.5" />}
                          {Number(p.estoque_atual)} {p.unidade}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1.5 px-2.5 text-xs font-medium"
                                onClick={() => abrirGerarOc(p)}
                                title="Gerar Ordem de Compra"
                                aria-label={`Gerar Ordem de Compra para ${p.nome}`}
                              >
                                <ShoppingCart className="size-3.5 text-primary" />
                                <span>Gerar OC</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Gerar Ordem de Compra</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 shrink-0"
                          onClick={() => abrirEdicao(p)}
                          title="Editar produto"
                          aria-label={`Editar ${p.nome}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 shrink-0"
                          onClick={() => excluir.mutate(p.id)}
                          title="Excluir produto"
                          aria-label={`Excluir ${p.nome}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {lista.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    Nenhum item cadastrado ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal rápido de criação de Ordem de Compra com produto pré-selecionado */}
      <Dialog open={!!ocProduto} onOpenChange={(v) => !v && setOcProduto(null)}>
        <DialogContent
          className="sm:max-w-lg"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            qtdOcInputRef.current?.focus();
            qtdOcInputRef.current?.select();
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="size-5 text-primary" />
              Nova Ordem de Compra
            </DialogTitle>
            <DialogDescription>
              Crie rapidamente uma Ordem de Compra com o produto, fornecedor padrão e custo unitário
              já preenchidos.
            </DialogDescription>
          </DialogHeader>

          {ocProduto && (
            <form
              className="grid gap-4 py-2"
              onSubmit={(e) => {
                e.preventDefault();
                gerarOrdemCompra.mutate();
              }}
            >
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Produto selecionado
                    </p>
                    <p className="text-sm font-semibold text-foreground">{ocProduto.nome}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      ID: {ocProduto.id.slice(0, 8)}
                      {ocProduto.codigo ? ` • SKU: ${ocProduto.codigo}` : ""}
                      {` • Estoque atual: ${Number(ocProduto.estoque_atual)} ${ocProduto.unidade}`}
                    </p>
                  </div>
                  <Badge variant="secondary">{ocProduto.unidade || "UN"}</Badge>
                </div>
              </div>

              <Field label="Fornecedor *">
                <Select
                  value={ocForm.fornecedor_id || "none"}
                  onValueChange={(v) =>
                    setOcForm({ ...ocForm, fornecedor_id: v === "none" ? "" : v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Selecione um fornecedor...</SelectItem>
                    {fornecedores.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label={`Quantidade (${ocProduto.unidade || "UN"}) *`}>
                  <Input
                    ref={qtdOcInputRef}
                    type="number"
                    min="0.01"
                    step="0.01"
                    autoFocus
                    value={ocForm.quantidade}
                    onChange={(e) => setOcForm({ ...ocForm, quantidade: e.target.value })}
                  />
                </Field>
                <Field label="Custo unitário (R$)">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={ocForm.valor_unitario}
                    onChange={(e) => setOcForm({ ...ocForm, valor_unitario: e.target.value })}
                  />
                </Field>
                <Field label="Desconto (R$)">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={ocForm.desconto}
                    onChange={(e) => setOcForm({ ...ocForm, desconto: e.target.value })}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Previsão de entrega">
                  <Input
                    type="date"
                    value={ocForm.previsao_entrega}
                    onChange={(e) => setOcForm({ ...ocForm, previsao_entrega: e.target.value })}
                  />
                </Field>
                <Field label="Condições de pagamento">
                  <Input
                    placeholder="Ex.: 28/56 DDL, PIX..."
                    value={ocForm.condicoes}
                    onChange={(e) => setOcForm({ ...ocForm, condicoes: e.target.value })}
                  />
                </Field>
              </div>

              <Field label="Observações">
                <Input
                  placeholder="Observações opcionais do pedido..."
                  value={ocForm.observacoes}
                  onChange={(e) => setOcForm({ ...ocForm, observacoes: e.target.value })}
                />
              </Field>

              <div className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Total estimado da OC:</span>
                <span className="font-semibold text-foreground">
                  {brl(
                    Math.max(
                      (Number(ocForm.quantidade) || 0) * (Number(ocForm.valor_unitario) || 0) -
                        (Number(ocForm.desconto) || 0),
                      0,
                    ),
                  )}
                </span>
              </div>

              <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs text-muted-foreground"
                  onClick={() => {
                    const pid = ocProduto.id;
                    setOcProduto(null);
                    navigate({
                      to: "/ordens-compra",
                      search: { produtoId: pid } as never,
                    });
                  }}
                >
                  <ExternalLink className="size-3.5" />
                  Abrir tela completa de OC
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOcProduto(null)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={gerarOrdemCompra.isPending}>
                    <ShoppingCart className="mr-1.5 size-4" />
                    {gerarOrdemCompra.isPending ? "Gerando..." : "Gerar Ordem de Compra"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
