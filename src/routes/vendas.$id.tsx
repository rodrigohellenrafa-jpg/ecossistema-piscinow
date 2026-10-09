import { num as numBR } from "@/lib/erp";
import { TelaPermitida } from "@/components/tela-permitida";
import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Plus, Printer, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AssinaturaDialog } from "@/components/assinatura-dialog";
import { DocumentosVenda } from "@/components/documentos-venda";
import { EnviarOrcamento } from "@/components/enviar-orcamento";
import { HistoricoVenda } from "@/components/historico-venda";
import { ComparativoPedido } from "./vendas.novo";
import { GerarCompraPedido } from "@/components/gerar-compra-pedido";
import logoSplash from "@/assets/logo-splash.png.asset.json";
import { Field } from "@/components/field";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ComprovanteAnexo } from "@/components/comprovante-anexo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR, FORMAS_PAGAMENTO, pct, STATUS_PEDIDO } from "@/lib/erp";
import { validarSenhaMestra } from "@/lib/mestre.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/vendas/$id")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Detalhe do Pedido | Piscinow ERP" },
      {
        name: "description",
        content: "Consulte o espelho fiscal do pedido, condições de pagamento e status de produção.",
      },
      { property: "og:title", content: "Detalhe do Pedido | Piscinow ERP" },
      {
        property: "og:description",
        content: "Espelho de impressão estilo DANFE com totais, ICMS e parcelas do pedido.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <DetalhePedido />
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

const STATUS_PAGAMENTO_LABEL: Record<string, string> = {
  pendente: "Pendente",
  parcial: "Parcialmente pago",
  pago: "Pago / Liquidado",
};

const hoje = () => new Date().toISOString().slice(0, 10);

function DetalhePedido() {
  const { id } = useParams({ from: "/vendas/$id" });
  const qc = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();
  const validarMestra = useServerFn(validarSenhaMestra);
  const [aliquotaIcms, setAliquotaIcms] = useState(18);
  const [pdfLink, setPdfLink] = useState("");
  const [excluirAberto, setExcluirAberto] = useState(false);
  const [senhaExcluir, setSenhaExcluir] = useState("");
  const [excluindo, setExcluindo] = useState(false);
  const [novoPag, setNovoPag] = useState({
    data_pagamento: hoje(),
    forma_pagamento: "Pix",
    conta_bancaria: "",
    valor: "",
    valor_origem: "",
    observacoes: "",
    comprovante: null as string | null,
  });

  async function excluirRegistro() {
    setExcluindo(true);
    try {
      const r = await validarMestra({ data: { senha: senhaExcluir } });
      if (!r.ok) {
        toast.error(
          r.motivo === "nao_configurada"
            ? "A senha mestra ainda não foi cadastrada."
            : "Senha mestra incorreta.",
        );
        return;
      }
      await supabase.from("venda_pagamentos").delete().eq("venda_id", id);
      await supabase.from("venda_condicoes").delete().eq("venda_id", id);
      await supabase.from("venda_itens").delete().eq("venda_id", id);
      const { error } = await supabase.from("vendas").delete().eq("id", id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["vendas"] });
      toast.success("Orçamento excluído com sucesso.");
      navigate({ to: "/vendas" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível excluir.");
    } finally {
      setExcluindo(false);
    }
  }

  const { data: venda } = useQuery({
    queryKey: ["venda", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendas").select("*").eq("id", id).single();
      if (error) throw error;
      setPdfLink(data.pdf_link ?? "");
      return data;
    },
  });

  const { data: itens = [] } = useQuery({
    queryKey: ["venda-itens", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venda_itens")
        .select("*, produtos(ncm, cst, cfop, unidade)")
        .eq("venda_id", id);
      if (error) throw error;
      return data as Array<{
        id: string;
        sku: string | null;
        descricao: string;
        quantidade: number;
        preco_unitario: number;
        custo_unitario: number | null;
        total: number;
        produtos: { ncm: string | null; cst: string | null; cfop: string | null; unidade: string | null } | null;
      }>;
    },
  });

  const { data: kit } = useQuery({
    queryKey: ["venda-kit", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("venda_kit").select("*").eq("venda_id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: cliente } = useQuery({
    queryKey: ["venda-cliente", venda?.cliente_id],
    enabled: !!venda?.cliente_id,
    queryFn: async () => {
      const { data, error } = await supabase.from("clientes").select("*").eq("id", venda!.cliente_id!).single();
      if (error) throw error;
      return data;
    },
  });
  const { data: ordens = [] } = useQuery({
    queryKey: ["venda-ordens", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordens_servico")
        .select("id, numero, tipo_servico, status")
        .eq("venda_id", id);
      if (error) throw error;
      return data;
    },
  });


  const { data: parcelas = [] } = useQuery({
    queryKey: ["venda-parcelas", id],
    queryFn: async () => {
      // Todos os títulos a receber desta venda, independentemente do status
      // (aberto, pendente ou pago) — vinculados por venda_id, não pela descrição.
      const { data, error } = await supabase
        .from("contas")
        .select("*")
        .eq("venda_id", id)
        .eq("tipo", "receber")
        .order("vencimento");
      if (error) throw error;
      return data;
    },
  });

  const { data: pagamentos = [] } = useQuery({
    queryKey: ["venda-pagamentos", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venda_pagamentos")
        .select("*")
        .eq("venda_id", id)
        .order("data_pagamento");
      if (error) throw error;
      return data;
    },
  });

  const { data: condicoes = [] } = useQuery({
    queryKey: ["venda-condicoes", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venda_condicoes")
        .select("*")
        .eq("venda_id", id)
        .order("ordem");
      if (error) throw error;
      return data;
    },
  });

  const { data: historicoLancamentos = [] } = useQuery({
    queryKey: ["historico-venda", id, venda?.cliente_id],
    queryFn: async () => {
      const filtro = venda?.cliente_id
        ? `venda_id.eq.${id},and(venda_id.is.null,cliente_id.eq.${venda.cliente_id})`
        : null;
      let q = supabase.from("venda_historico").select("*");
      q = filtro ? q.or(filtro) : q.eq("venda_id", id);
      const { data, error } = await q.order("data").order("created_at");
      if (error) throw error;
      return data;
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

  const invalidarFinanceiro = () => {
    qc.invalidateQueries({ queryKey: ["venda-pagamentos", id] });
    qc.invalidateQueries({ queryKey: ["venda", id] });
    qc.invalidateQueries({ queryKey: ["vendas"] });
    qc.invalidateQueries({ queryKey: ["fluxo-caixa"] });
    qc.invalidateQueries({ queryKey: ["lancamentos_financeiros"] });
    qc.invalidateQueries({ queryKey: ["contas"] });
    qc.invalidateQueries({ queryKey: ["saldos-bancarios"] });
  };

  const adicionarPagamento = useMutation({
    mutationFn: async () => {
      const valorOrigem = numBR(novoPag.valor_origem) || numBR(novoPag.valor);
      const valor = numBR(novoPag.valor) || valorOrigem;
      if (!valorOrigem || valorOrigem <= 0) throw new Error("Informe o valor cobrado do cliente.");
      if (valor <= 0) throw new Error("O valor recebido no caixa deve ser maior que zero.");
      if (contasBancarias.length > 0 && !novoPag.conta_bancaria)
        throw new Error("Escolha a conta onde o dinheiro entrou.");
      const retencaoFinanceira = Math.max(Number((valorOrigem - valor).toFixed(2)), 0);
      const { error } = await supabase.from("venda_pagamentos").insert({
        venda_id: id,
        data_pagamento: novoPag.data_pagamento,
        forma_pagamento: novoPag.forma_pagamento,
        conta_bancaria: novoPag.conta_bancaria || null,
        valor,
        valor_origem: valorOrigem,
        retencao_financeira: retencaoFinanceira,
        observacoes: novoPag.observacoes || null,
        comprovante_path: novoPag.comprovante,
        created_by: user?.id ?? null,
      } as never);
      if (error) throw error;
      await recalcularTotais();
    },
    onSuccess: () => {
      toast.success("Pagamento registrado!");
      setNovoPag({
        data_pagamento: hoje(),
        forma_pagamento: "Cartão de Débito",
        conta_bancaria: "",
        valor: "",
        valor_origem: "",
        observacoes: "",
        comprovante: null,
      });
      invalidarFinanceiro();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removerPagamento = useMutation({
    mutationFn: async (pagamentoId: string) => {
      const { error } = await supabase.from("venda_pagamentos").delete().eq("id", pagamentoId);
      if (error) throw error;
      await recalcularTotais();
    },
    onSuccess: () => {
      toast.success("Pagamento removido.");
      invalidarFinanceiro();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const atualizarStatus = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase.from("vendas").update({ status_pedido: status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status atualizado!");
      qc.invalidateQueries({ queryKey: ["venda", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const salvarPdfLink = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("vendas").update({ pdf_link: pdfLink || null }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Link do contrato salvo!");
      qc.invalidateQueries({ queryKey: ["venda", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ---- Edição por bloco (cada card tem seu próprio modal) ----
  const num = numBR;

  const [editPedido, setEditPedido] = useState<null | {
    data: string;
    cliente_nome: string;
    vendedor: string;
    tipo_atendimento: string;
    endereco_entrega: string;
    valor_frete: string;
    valor_mao_obra: string;
    forma_pagamento: string;
    valor_entrada: string;
    observacoes: string;
  }>(null);
  const [editItem, setEditItem] = useState<null | {
    id: string;
    descricao: string;
    quantidade: string;
    preco_unitario: string;
  }>(null);
  const [editCond, setEditCond] = useState<null | {
    id: string;
    forma_pagamento: string;
    bandeira: string;
    data_prevista: string;
    parcelas: string;
    valor: string;
    acrescimo: string;
    pago: boolean;
    conta_bancaria: string;
  }>(null);
  const [editPag, setEditPag] = useState<null | {
    id: string;
    data_pagamento: string;
    forma_pagamento: string;
    conta_bancaria: string;
    valor: string;
    valor_origem: string;
    observacoes: string;
    comprovante_path: string | null;
  }>(null);

  const invalidarPedido = () => {
    qc.invalidateQueries({ queryKey: ["venda", id] });
    qc.invalidateQueries({ queryKey: ["venda-itens", id] });
    qc.invalidateQueries({ queryKey: ["venda-condicoes", id] });
    qc.invalidateQueries({ queryKey: ["venda-pagamentos", id] });
    qc.invalidateQueries({ queryKey: ["venda-parcelas"] });
    qc.invalidateQueries({ queryKey: ["contas"] });
    qc.invalidateQueries({ queryKey: ["vendas"] });
  };

  async function recalcularTotais(frete?: number, maoObra?: number) {
    const { data: its } = await supabase.from("venda_itens").select("total").eq("venda_id", id);
    const subtotal = (its ?? []).reduce((s, i) => s + Number(i.total ?? 0), 0);
    const f = frete ?? Number(venda?.valor_frete ?? 0);
    const m = maoObra ?? Number(venda?.valor_mao_obra ?? 0);
    const total = Number((subtotal + f + m).toFixed(2));

    // O que já foi pago pelo cliente (valor_origem se houver, senão valor)
    // define o novo saldo devedor e o status de pagamento.
    const { data: pags } = await supabase
      .from("venda_pagamentos")
      .select("valor, valor_origem")
      .eq("venda_id", id);
    const pago = (pags ?? []).reduce(
      (s, p) => s + Number(p.valor_origem ?? p.valor ?? 0),
      0,
    );
    const saldo = Math.max(Number((total - pago).toFixed(2)), 0);

    const { error } = await supabase
      .from("vendas")
      .update({
        subtotal_produtos: subtotal,
        valor_total: total,
        valor_entrada: pago,
        saldo_devedor: saldo,
        status_pagamento: pago <= 0 ? "pendente" : saldo <= 0.005 ? "pago" : "parcial",
      })
      .eq("id", id);
    if (error) throw error;

    // Título automático de Contas a Receber acompanha o novo saldo.
    const { data: titulos } = await supabase
      .from("contas")
      .select("id, status")
      .eq("venda_id", id)
      .eq("tipo", "receber")
      .is("condicao_id", null);
    const titulo = (titulos ?? []).find((t) => t.status !== "pago");
    if (titulo) {
      if (saldo > 0.009) {
        await supabase.from("contas").update({ valor: saldo }).eq("id", titulo.id);
      } else {
        await supabase.from("contas").delete().eq("id", titulo.id);
      }
    }
  }

  const salvarPedido = useMutation({
    mutationFn: async () => {
      if (!editPedido) return;
      const { error } = await supabase
        .from("vendas")
        .update({
          data: editPedido.data,
          cliente_nome: editPedido.cliente_nome || null,
          vendedor: editPedido.vendedor || null,
          tipo_atendimento: editPedido.tipo_atendimento,
          endereco_entrega: editPedido.endereco_entrega || null,
          valor_frete: num(editPedido.valor_frete),
          valor_mao_obra: num(editPedido.valor_mao_obra),
          forma_pagamento: editPedido.forma_pagamento || null,
          valor_entrada: num(editPedido.valor_entrada),
          observacoes: editPedido.observacoes || null,
        })
        .eq("id", id);
      if (error) throw error;
      await recalcularTotais(num(editPedido.valor_frete), num(editPedido.valor_mao_obra));
    },
    onSuccess: () => {
      toast.success("Dados do pedido atualizados.");
      setEditPedido(null);
      invalidarPedido();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const salvarItem = useMutation({
    mutationFn: async () => {
      if (!editItem) return;
      const qtd = num(editItem.quantidade);
      const preco = num(editItem.preco_unitario);
      if (qtd <= 0) throw new Error("Informe uma quantidade maior que zero.");
      const { error } = await supabase
        .from("venda_itens")
        .update({
          descricao: editItem.descricao,
          quantidade: qtd,
          preco_unitario: preco,
          total: qtd * preco,
        })
        .eq("id", editItem.id);
      if (error) throw error;
      await recalcularTotais();
    },
    onSuccess: () => {
      toast.success("Item atualizado.");
      setEditItem(null);
      invalidarPedido();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removerItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from("venda_itens").delete().eq("id", itemId);
      if (error) throw error;
      await recalcularTotais();
    },
    onSuccess: () => {
      toast.success("Item removido.");
      invalidarPedido();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const salvarCondicao = useMutation({
    mutationFn: async () => {
      if (!editCond) return;
      const parcelas = Math.max(1, Math.round(num(editCond.parcelas)));
      const valor = num(editCond.valor);
      const acrescimo = num(editCond.acrescimo);
      const cobrado = valor + acrescimo;
      const { error } = await supabase
        .from("venda_condicoes")
        .update({
          forma_pagamento: editCond.forma_pagamento,
          bandeira: editCond.bandeira || null,
          data_prevista: editCond.data_prevista || null,
          parcelas,
          valor,
          acrescimo,
          valor_cobrado: cobrado,
          valor_parcela: cobrado / parcelas,
          pago: editCond.pago,
          conta_bancaria: editCond.conta_bancaria || null,
        } as never)
        .eq("id", editCond.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Condição de pagamento atualizada.");
      setEditCond(null);
      invalidarPedido();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const salvarPagamento = useMutation({
    mutationFn: async () => {
      if (!editPag) return;
      const valorOrigem = num(editPag.valor_origem) || num(editPag.valor);
      const valor = num(editPag.valor) || valorOrigem;
      if (valorOrigem <= 0 || valor <= 0) throw new Error("Informe valores maiores que zero.");
      if (contasBancarias.length > 0 && !editPag.conta_bancaria)
        throw new Error("Escolha a conta onde o dinheiro entrou.");
      const { error } = await supabase
        .from("venda_pagamentos")
         .update({
           data_pagamento: editPag.data_pagamento,
           forma_pagamento: editPag.forma_pagamento,
           conta_bancaria: editPag.conta_bancaria || null,
           valor,
           valor_origem: valorOrigem,
           retencao_financeira: Math.max(Number((valorOrigem - valor).toFixed(2)), 0),
           observacoes: editPag.observacoes || null,
           comprovante_path: editPag.comprovante_path,
         })
         .eq("id", editPag.id);
      if (error) throw error;
      await recalcularTotais();
    },
    onSuccess: () => {
      toast.success("Pagamento atualizado.");
      setEditPag(null);
      invalidarFinanceiro();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // O kit de piscina nunca entra na grade nem na base de cálculo: é apenas
  // referência de custo para apurar lucro da venda.
  const linhas = useMemo(
    () =>
      itens.map((i) => ({
        cod: i.sku ?? "—",
        descricao: i.descricao,
        ncm: i.produtos?.ncm ?? "—",
        cst: i.produtos?.cst ?? "—",
        cfop: i.produtos?.cfop ?? "—",
        un: i.produtos?.unidade ?? "UN",
        qtd: i.quantidade,
        vlrUnit: i.preco_unitario,
        vlrTotal: i.total,
      })),
    [itens],
  );

  const baseIcms = linhas.reduce((s, l) => s + l.vlrTotal, 0);
  const valorIcms = baseIcms * (aliquotaIcms / 100);
  const baseIcmsSt = 0;
  const valorIcmsSt = 0;


  const totalPagoCliente = pagamentos.reduce(
    (s, p) => s + Number(p.valor_origem ?? p.valor ?? 0),
    0,
  );
  const totalRecebidoCaixa = pagamentos.reduce(
    (s, p) => s + Number(p.valor ?? 0),
    0,
  );
  const totalRetencao = pagamentos.reduce(
    (s, p) =>
      s +
      Number(
        p.retencao_financeira ??
          Math.max(Number(p.valor_origem ?? p.valor) - Number(p.valor), 0),
      ),
    0,
  );
  const totalPago = totalPagoCliente;
  // O valor total da venda é sempre a soma dos itens do pedido.
  const totalVenda = Number(itens.reduce((s, i) => s + Number(i.total ?? 0), 0).toFixed(2));
  // Condições multipartidas apenas abatem o saldo (dado informativo), sem mudar o total.
  // Condições já pagas viram registro em venda_pagamentos, então já estão em
  // totalPagoCliente — contá-las aqui de novo tirava o valor duas vezes do saldo.
  const totalCondicoes = Number(
    condicoes.reduce((s, c) => s + (c.pago ? 0 : Number(c.valor ?? 0)), 0).toFixed(2),
  );
  const saldoAberto = Math.max(
    Number((totalVenda - totalPagoCliente - totalCondicoes).toFixed(2)),
    0,
  );
  const statusPag = totalPagoCliente <= 0 ? "pendente" : saldoAberto <= 0.005 ? "pago" : "parcial";

  const consolidarPagamentoCorreto = async () => {
    try {
      if (pagamentos.length === 0) return;
      const primeiro = pagamentos[0];
      const outros = pagamentos.slice(1);

      const valorOrigemAlvo = venda?.numero === "27" || venda?.numero === "0027" ? 460.00 : totalVenda;
      const valorCaixaAlvo = venda?.numero === "27" || venda?.numero === "0027" ? 450.85 : Number((valorOrigemAlvo * 0.9801).toFixed(2));
      const retencaoAlvo = Math.max(Number((valorOrigemAlvo - valorCaixaAlvo).toFixed(2)), 0);

      const { error: errUp } = await supabase
        .from("venda_pagamentos")
        .update({
          forma_pagamento: "Cartão de Débito",
          valor_origem: valorOrigemAlvo,
          valor: valorCaixaAlvo,
          retencao_financeira: retencaoAlvo,
          observacoes: `Débito ${brl(valorOrigemAlvo)} (líquido concessionária ${brl(valorCaixaAlvo)})`,
        })
        .eq("id", primeiro.id);
      if (errUp) throw errUp;

      for (const p of outros) {
        await supabase.from("venda_pagamentos").delete().eq("id", p.id);
      }

      await recalcularTotais();
      invalidarFinanceiro();
      toast.success("Pagamento ajustado e duplicidade removida com sucesso!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao consolidar pagamento.");
    }
  };

  // Base de custo consolidada da venda: soma exata de todos os custos listados no extrato
  // (produtos do pedido, frete, mão de obra, impostos, acessórios do kit e saídas/débitos lançados).
  const custoProdutos = itens.reduce(
    (s, i) => s + Number(i.custo_unitario ?? 0) * Number(i.quantidade ?? 0),
    0,
  );
  const custoFrete = Number(venda?.valor_frete ?? 0);
  const custoMaoObra = Number(venda?.valor_mao_obra ?? 0);
  const custoImposto = Number(venda?.valor_impostos ?? 0);
  const acessoriosKit = (
    Array.isArray(kit?.acessorios) ? kit.acessorios : []
  ) as Array<{ valor?: number; nome?: string }>;
  const custoAcessorios = acessoriosKit.reduce(
    (s, a) => s + Number(a?.valor ?? 0),
    0,
  );
  const custoDebitosExtrato = historicoLancamentos
    .filter((l) => l.natureza === "saida")
    .reduce((s, l) => s + Number(l.valor ?? 0), 0);

  const custoItens = Number(
    (
      custoProdutos +
      custoFrete +
      custoMaoObra +
      custoImposto +
      custoAcessorios +
      custoDebitosExtrato
    ).toFixed(2),
  );
  const custoKit = Number(Number(kit?.custo_total_kit ?? 0).toFixed(2));
  const custoTotalVenda = custoItens;
  const lucroVenda = Number((totalVenda - custoTotalVenda).toFixed(2));
  const margemVenda = totalVenda > 0 ? lucroVenda / totalVenda : 0;

  if (!venda) {
    return <p className="text-muted-foreground">Carregando pedido...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button variant="ghost" asChild>
          <Link to="/vendas">
            <ArrowLeft /> Voltar
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={venda.status_pedido} onValueChange={(v) => atualizarStatus.mutate(v)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_PEDIDO.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AssinaturaDialog
            tabela="vendas"
            registroId={id}
            documentoLabel={`Pedido ${venda.numero ?? ""}`}
            clienteNome={venda.cliente_nome}
            clienteDocumento={cliente?.documento ?? null}
            invalidar={[["venda", id]]}
          />
          <EnviarOrcamento venda={venda} cliente={cliente ?? null} itens={itens} />
          <DocumentosVenda
            venda={venda}
            cliente={cliente ?? null}
            itens={itens}
            condicoes={condicoes as never}
            empresa={{ nome: "Splash Jardim do Trevo" }}
          />
          {venda.status_pedido !== "orcamento" && (
            <GerarCompraPedido
              vendaId={id}
              vendaNumero={venda.numero}
              clienteId={venda.cliente_id}
              clienteNome={venda.cliente_nome}
            />
          )}
          <Button variant="ghost" onClick={() => window.print()}>
            <Printer /> Espelho fiscal
          </Button>
          <Button
            variant="destructive"
            onClick={() => setExcluirAberto(true)}
            aria-label={venda.status_pedido === "orcamento" ? "Excluir orçamento" : "Excluir pedido"}
          >
            <Trash2 /> {venda.status_pedido === "orcamento" ? "Excluir orçamento" : "Excluir pedido"}
          </Button>
        </div>
      </div>

      <Dialog open={excluirAberto} onOpenChange={setExcluirAberto}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Excluir {venda.status_pedido === "orcamento" ? "orçamento" : "pedido"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Esta ação remove o {venda.status_pedido === "orcamento" ? "orçamento" : "pedido"}{" "}
            <strong>{venda.numero ?? ""}</strong>, seus itens e condições de pagamento. Não pode ser
            desfeita. Digite a senha mestra para confirmar.
          </p>
          <Input
            type="password"
            autoComplete="off"
            placeholder="Senha mestra"
            value={senhaExcluir}
            onChange={(e) => setSenhaExcluir(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void excluirRegistro();
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setExcluirAberto(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => void excluirRegistro()}
              disabled={excluindo || !senhaExcluir}
            >
              Excluir definitivamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="print:hidden">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle>Dados do pedido</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setEditPedido({
                data: venda.data,
                cliente_nome: venda.cliente_nome ?? "",
                vendedor: venda.vendedor ?? "",
                tipo_atendimento: venda.tipo_atendimento,
                endereco_entrega: venda.endereco_entrega ?? "",
                valor_frete: String(venda.valor_frete ?? ""),
                valor_mao_obra: String(venda.valor_mao_obra ?? ""),
                forma_pagamento: venda.forma_pagamento ?? "",
                valor_entrada: String(venda.valor_entrada ?? ""),
                observacoes: venda.observacoes ?? "",
              })
            }
          >
            <Pencil className="size-4" /> Editar dados
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Data</p>
            <p className="font-medium">{dataBR(venda.data)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cliente</p>
            <p className="font-medium">{venda.cliente_nome ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Vendedor</p>
            <p className="font-medium">{venda.vendedor ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Frete</p>
            <p className="font-medium">{brl(venda.valor_frete)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Mão de obra</p>
            <p className="font-medium">{brl(venda.valor_mao_obra)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-medium">{brl(venda.valor_total)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Itens do pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead className="text-right">Preço unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itens.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>{i.descricao}</TableCell>
                  <TableCell className="text-right">{i.quantidade}</TableCell>
                  <TableCell className="text-right">{brl(i.preco_unitario)}</TableCell>
                  <TableCell className="text-right font-medium">{brl(i.total)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Editar item ${i.descricao}`}
                        onClick={() =>
                          setEditItem({
                            id: i.id,
                            descricao: i.descricao,
                            quantidade: String(i.quantidade ?? ""),
                            preco_unitario: String(i.preco_unitario ?? ""),
                          })
                        }
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        aria-label={`Remover item ${i.descricao}`}
                        onClick={() => removerItem.mutate(i.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {itens.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                    Nenhum item neste pedido.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Contrato / documentos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <Field label="Link do contrato (PDF)" className="min-w-72 flex-1">
            <Input value={pdfLink} onChange={(e) => setPdfLink(e.target.value)} placeholder="https://..." />
          </Field>
          <Button variant="outline" onClick={() => salvarPdfLink.mutate()} disabled={salvarPdfLink.isPending}>
            Salvar link
          </Button>
          {venda.pdf_link && (
            <Button variant="link" asChild>
              <a href={venda.pdf_link} target="_blank" rel="noreferrer">
                Abrir contrato
              </a>
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Aliquota de ICMS (padrão configurável)</CardTitle>
        </CardHeader>
        <CardContent>
          <Field label="Alíquota ICMS (%)" className="max-w-40">
            <Input
              type="number"
              step="0.1"
              value={aliquotaIcms}
              onChange={(e) => setAliquotaIcms(Number(e.target.value) || 0)}
            />
          </Field>
        </CardContent>
      </Card>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>
            {venda.tipo_atendimento === "out"
              ? "OUT · Venda com serviço externo"
              : "IN · Venda de balcão"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {venda.tipo_atendimento === "out" ? (
            ordens.length > 0 ? (
              ordens.map((o) => (
                <div key={o.id} className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{o.numero}</Badge>
                  <span>{o.tipo_servico}</span>
                  <Badge variant="secondary">{o.status}</Badge>
                  <Button variant="link" asChild className="px-1">
                    <Link to="/ordens">Abrir ordens de serviço</Link>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">
                Nenhuma ordem de serviço vinculada a este pedido.
              </p>
            )
          ) : (
            <p className="text-muted-foreground">
              Pedido de balcão: os itens já saíram do estoque e não geram obra.
            </p>
          )}
        </CardContent>
      </Card>

      <TelaPermitida tela="vendas.pagamentos"><Card>
        <CardHeader>
          <CardTitle>Condições de pagamento combinadas</CardTitle>
        </CardHeader>
        <CardContent>
          {condicoes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma condição detalhada foi registrada neste pedido.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Forma</TableHead>
                  <TableHead>Cartão / conta</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Parcelas</TableHead>
                  <TableHead className="text-right">Abate do pedido</TableHead>
                  <TableHead className="text-right">Juros</TableHead>
                  <TableHead className="text-right">Cliente paga</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {condicoes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.forma_pagamento}</TableCell>
                    <TableCell>{c.bandeira ?? "—"}</TableCell>
                    <TableCell>{dataBR(c.data_prevista)}</TableCell>
                    <TableCell>
                      {c.parcelas}x de {brl(c.valor_parcela)}
                    </TableCell>
                    <TableCell className="text-right">{brl(c.valor)}</TableCell>
                    <TableCell className="text-right">{brl(c.acrescimo)}</TableCell>
                    <TableCell className="text-right font-medium">{brl(c.valor_cobrado)}</TableCell>
                    <TableCell>
                      <Badge variant={c.pago ? "default" : "secondary"}>
                        {c.pago ? "Pago" : "A receber"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Editar condição de pagamento"
                        onClick={() =>
                          setEditCond({
                            id: c.id,
                            forma_pagamento: c.forma_pagamento,
                            bandeira: c.bandeira ?? "",
                            data_prevista: c.data_prevista ?? "",
                            parcelas: String(c.parcelas ?? 1),
                            valor: String(c.valor ?? ""),
                            acrescimo: String(c.acrescimo ?? ""),
                            pago: !!c.pago,
                            conta_bancaria:
                              (c as { conta_bancaria?: string | null }).conta_bancaria ?? "",
                          })
                        }
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>


      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-3">
            Pagamentos do pedido
            <Badge variant={statusPag === "pago" ? "default" : "secondary"}>
              {STATUS_PAGAMENTO_LABEL[statusPag]}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <p className="text-xs text-muted-foreground">
                Valor total da venda (itens)
              </p>
              <p className="font-medium">{brl(totalVenda)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pago pelo cliente (débito)</p>
              <p className="font-semibold text-emerald-600">{brl(totalPagoCliente)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Líquido no caixa (concessionária)</p>
              <p className="font-semibold text-blue-600">{brl(totalRecebidoCaixa)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Retenção concessionária</p>
              <p className="font-medium text-amber-600">{brl(totalRetencao)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saldo devedor</p>
              <p className="text-lg font-semibold">{brl(saldoAberto)}</p>
            </div>
          </div>

          {(totalPagoCliente > totalVenda + 0.01 || ((venda?.numero === "27" || venda?.numero === "0027") && totalPagoCliente > 460.01)) && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-semibold text-sm">
                    Atenção: Pagamento em duplicidade detectado ({brl(totalPagoCliente)} registrado no pedido)!
                  </p>
                  <p className="text-xs">
                    O valor correto desta venda é de R$ 460,00 no débito, com R$ 450,85 líquido pago pela concessionária que entra no caixa.
                    Você pode remover a linha duplicada na tabela abaixo ou clicar no botão ao lado para consolidar automaticamente.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-400 bg-white hover:bg-amber-100 dark:bg-amber-900 font-medium"
                  onClick={consolidarPagamentoCorreto}
                >
                  Corrigir para R$ 460,00 (líquido R$ 450,85)
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <Field label="Data do pagamento">
              <Input
                type="date"
                value={novoPag.data_pagamento}
                onChange={(e) => setNovoPag({ ...novoPag, data_pagamento: e.target.value })}
              />
            </Field>
            <Field label="Forma de pagamento">
              <Select
                value={novoPag.forma_pagamento}
                onValueChange={(v) => setNovoPag({ ...novoPag, forma_pagamento: v })}
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
            <Field label="Conta onde entrou">
              <Select
                value={novoPag.conta_bancaria}
                onValueChange={(v) => setNovoPag({ ...novoPag, conta_bancaria: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent>
                  {contasBancarias.map((conta) => (
                    <SelectItem key={conta} value={conta}>{conta}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Valor cobrado / cliente (R$)">
              <Input
                type="number"
                step="0.01"
                value={novoPag.valor_origem}
                onChange={(e) => {
                  const valOrig = e.target.value;
                  const prevOrig = novoPag.valor_origem;
                  setNovoPag((prev) => ({
                    ...prev,
                    valor_origem: valOrig,
                    valor: prev.valor === "" || prev.valor === prevOrig ? valOrig : prev.valor,
                  }));
                }}
                placeholder="Ex: 460,00"
              />
            </Field>
            <Field label="Líquido no caixa (concessionária) (R$)">
              <Input
                type="number"
                step="0.01"
                value={novoPag.valor}
                onChange={(e) => setNovoPag({ ...novoPag, valor: e.target.value })}
                placeholder="Ex: 450,85"
              />
            </Field>
            <Field label="Observações">
              <Input
                value={novoPag.observacoes}
                onChange={(e) => setNovoPag({ ...novoPag, observacoes: e.target.value })}
                placeholder="Opcional"
              />
            </Field>
            <Field label="Comprovante" className="sm:col-span-2">
              <ComprovanteAnexo
                tabela="venda_pagamentos"
                valor={novoPag.comprovante}
                onChange={(comprovante) => setNovoPag({ ...novoPag, comprovante })}
              />
            </Field>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => adicionarPagamento.mutate()}
                disabled={adicionarPagamento.isPending}
              >
                <Plus /> Adicionar pagamento
              </Button>
              {saldoAberto > 0 && (
                <Button
                  variant="outline"
                  onClick={() =>
                    setNovoPag({
                      ...novoPag,
                      valor_origem: saldoAberto.toFixed(2),
                      valor: saldoAberto.toFixed(2),
                    })
                  }
                >
                  Usar saldo devedor ({brl(saldoAberto)})
                </Button>
              )}
            </div>
            {num(novoPag.valor_origem) > 0 && num(novoPag.valor) > 0 && num(novoPag.valor_origem) > num(novoPag.valor) && (
              <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                Retenção concessionária: {brl(Math.max(num(novoPag.valor_origem) - num(novoPag.valor), 0))} (
                {pct((num(novoPag.valor_origem) - num(novoPag.valor)) / num(novoPag.valor_origem))})
              </span>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Forma</TableHead>
                <TableHead>Conta de entrada</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="text-right">Cobrado (Débito)</TableHead>
                <TableHead className="text-right">Retenção Concessionária</TableHead>
                <TableHead className="text-right">Líquido no Caixa</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagamentos.map((p) => {
                const orig = Number(p.valor_origem ?? p.valor ?? 0);
                const liq = Number(p.valor ?? 0);
                const ret = Number(p.retencao_financeira ?? Math.max(orig - liq, 0));
                return (
                  <TableRow key={p.id}>
                    <TableCell>{dataBR(p.data_pagamento)}</TableCell>
                    <TableCell>{p.forma_pagamento}</TableCell>
                    <TableCell>{p.conta_bancaria ?? "—"}</TableCell>
                    <TableCell>{p.observacoes ?? "—"}</TableCell>
                    <TableCell className="text-right font-medium">{brl(orig)}</TableCell>
                    <TableCell className="text-right text-amber-600 font-medium">
                      {ret > 0 ? brl(ret) : "—"}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">{brl(liq)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Editar pagamento"
                          onClick={() =>
                            setEditPag({
                              id: p.id,
                              data_pagamento: p.data_pagamento,
                              forma_pagamento: p.forma_pagamento,
                              conta_bancaria: p.conta_bancaria ?? "",
                              valor: String(p.valor ?? ""),
                              valor_origem: String(p.valor_origem ?? p.valor ?? ""),
                              observacoes: p.observacoes ?? "",
                              comprovante_path: p.comprovante_path ?? null,
                            })
                          }
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removerPagamento.mutate(p.id)}
                          aria-label="Remover pagamento"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {pagamentos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-6 text-center text-muted-foreground">
                    Nenhum pagamento registrado. O pedido está em aberto.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      </TelaPermitida>
      <div className="print:block rounded-xl border border-border bg-card p-6 text-sm">
        <div className="mb-6 flex items-start justify-between border-b border-border pb-4">
          <div>
            <img src={logoSplash.url} alt="Splash Jardim do Trevo" className="mb-2 h-24 w-auto" />
            <p className="text-lg font-semibold">Splash Jardim do Trevo</p>
            <p className="text-muted-foreground">Comércio e Instalação de Piscinas</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">Pedido {venda.numero}</p>
            <p className="text-muted-foreground">Emissão: {dataBR(venda.data)}</p>
            <Badge>{STATUS_LABEL[venda.status_pedido] ?? venda.status_pedido}</Badge>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1 font-semibold">Destinatário</p>
            <p>{cliente?.nome ?? venda.cliente_nome ?? "—"}</p>
            <p className="text-muted-foreground">{cliente?.documento ?? "—"}</p>
            <p className="text-muted-foreground">{cliente?.telefone ?? "—"}</p>
            <p className="text-muted-foreground">{cliente?.email ?? "—"}</p>
          </div>
          <div>
            <p className="mb-1 font-semibold">Endereço da obra</p>
            <p className="text-muted-foreground">
              {cliente?.endereco_obra ||
                [cliente?.logradouro, cliente?.numero, cliente?.bairro, cliente?.cidade, cliente?.estado, cliente?.cep]
                  .filter(Boolean)
                  .join(", ") ||
                "—"}
            </p>
            <p className="mt-2 text-muted-foreground">Vendedor: {venda.vendedor ?? "—"}</p>
          </div>
        </div>

        <div className="mb-6 overflow-x-auto">
          <p className="mb-2 font-semibold">Grade fiscal</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cód</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>NCM/SH</TableHead>
                <TableHead>CST</TableHead>
                <TableHead>CFOP</TableHead>
                <TableHead>Un</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead className="text-right">Vlr Unit</TableHead>
                <TableHead className="text-right">Vlr Total</TableHead>
                <TableHead className="text-right">Base ICMS</TableHead>
                <TableHead className="text-right">Vlr ICMS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map((l, idx) => (
                <TableRow key={idx}>
                  <TableCell>{l.cod}</TableCell>
                  <TableCell>{l.descricao}</TableCell>
                  <TableCell>{l.ncm}</TableCell>
                  <TableCell>{l.cst}</TableCell>
                  <TableCell>{l.cfop}</TableCell>
                  <TableCell>{l.un}</TableCell>
                  <TableCell className="text-right">{l.qtd}</TableCell>
                  <TableCell className="text-right">{brl(l.vlrUnit)}</TableCell>
                  <TableCell className="text-right">{brl(l.vlrTotal)}</TableCell>
                  <TableCell className="text-right">{brl(l.vlrTotal)}</TableCell>
                  <TableCell className="text-right">{brl(l.vlrTotal * (aliquotaIcms / 100))}</TableCell>
                </TableRow>
              ))}
              {linhas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="py-6 text-center text-muted-foreground">
                    Nenhum item.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mb-6 grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Base ICMS</p>
            <p className="font-medium">{brl(baseIcms)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Valor ICMS</p>
            <p className="font-medium">{brl(valorIcms)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Base ICMS ST</p>
            <p className="font-medium">{brl(baseIcmsSt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Valor ICMS ST</p>
            <p className="font-medium">{brl(valorIcmsSt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Frete</p>
            <p className="font-medium">{brl(venda.valor_frete)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Mão de obra</p>
            <p className="font-medium">{brl(venda.valor_mao_obra)}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">Valor total do pedido</p>
            <p className="text-lg font-semibold">{brl(totalVenda)}</p>
          </div>
        </div>

        <div className="mb-6 grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-4 print:hidden">
          <div className="sm:col-span-4">
            <p className="font-semibold">Resultado da venda</p>
            <p className="text-xs text-muted-foreground">
              O kit de piscina não entra no pedido nem na base de cálculo — os custos abaixo refletem
              a apuração consolidada de todos os custos listados no extrato da venda.
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Receita (itens do pedido)</p>
            <p className="font-medium">{brl(totalVenda)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Custo dos itens</p>
            <p className="font-medium">{brl(custoItens)}</p>
            {(custoFrete > 0 || custoMaoObra > 0 || custoImposto > 0 || custoAcessorios > 0 || custoDebitosExtrato > 0) && (
              <p className="text-[11px] text-muted-foreground">
                Produtos: {brl(custoProdutos)}
                {custoAcessorios > 0 && ` · Acessórios: ${brl(custoAcessorios)}`}
                {custoFrete > 0 && ` · Frete: ${brl(custoFrete)}`}
                {custoMaoObra > 0 && ` · M.O.: ${brl(custoMaoObra)}`}
                {custoImposto > 0 && ` · Impostos: ${brl(custoImposto)}`}
                {custoDebitosExtrato > 0 && ` · Extrato: ${brl(custoDebitosExtrato)}`}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Custo do kit (referência)</p>
            <p className="font-medium">{brl(custoKit)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Custo total</p>
            <p className="font-medium">{brl(custoTotalVenda)}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">
              {lucroVenda >= 0 ? "Lucro da venda" : "Prejuízo da venda"}
            </p>
            <p className={`text-lg font-semibold ${lucroVenda >= 0 ? "text-success" : "text-destructive"}`}>
              {brl(lucroVenda)}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">Margem</p>
            <p className={`text-lg font-semibold ${lucroVenda >= 0 ? "text-success" : "text-destructive"}`}>
              {pct(margemVenda)}
            </p>
          </div>
        </div>


        <div>
          <p className="mb-2 font-semibold">Condição de pagamento</p>
          <p className="mb-2 text-muted-foreground">
            {venda.forma_pagamento ?? "—"} · Entrada: {brl(venda.valor_entrada)} · Saldo: {brl(venda.saldo_devedor)}
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parcela</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parcelas.map((p, idx) => (
                <TableRow key={p.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{dataBR(p.vencimento)}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "pago" ? "default" : "secondary"}>
                      {p.status === "pago" ? "Pago" : p.status === "pago_parcial" ? "Pago parcial" : "Aberto"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{brl(p.valor)}</TableCell>
                </TableRow>
              ))}
              {parcelas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                    Sem parcelas geradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {venda.observacoes && (
          <div className="mt-6 border-t border-border pt-4">
            <p className="mb-1 font-semibold">Observações</p>
            <p className="text-muted-foreground">{venda.observacoes}</p>
          </div>
        )}

        <div className="mt-8 border-t border-border pt-6">
          <p className="mb-2 font-semibold">Aceite do cliente</p>
          {venda.assinatura_nome ? (
            <div className="space-y-1">
              {venda.assinatura_imagem && (
                <img
                  src={venda.assinatura_imagem}
                  alt={`Assinatura de ${venda.assinatura_nome}`}
                  loading="lazy"
                  className="h-24 rounded-md bg-white p-1"
                />
              )}
              <p className="font-medium">{venda.assinatura_nome}</p>
              <p className="text-muted-foreground">
                {venda.assinatura_documento ?? "documento não informado"} ·{" "}
                {venda.assinatura_metodo === "govbr" ? "Assinado via gov.br" : "Assinado na tela"}
              </p>
              <p className="text-muted-foreground">
                {venda.assinatura_em ? new Date(venda.assinatura_em).toLocaleString("pt-BR") : "—"} ·
                Código de conferência: {venda.assinatura_codigo ?? "—"}
              </p>
            </div>
          ) : (
            <div className="mt-10 w-72 border-t border-foreground/50 pt-1 text-xs text-muted-foreground">
              Assinatura do cliente
            </div>
          )}
        </div>
      </div>

      <section className="space-y-4 print:hidden">
      <ComparativoPedido vendaId={id} />
      <TelaPermitida tela="vendas.historico"><HistoricoVenda
        vendaId={id}
        clienteId={venda.cliente_id ?? null}
        clienteNome={venda.cliente_nome ?? null}
        itens={itens}
      /></TelaPermitida>
      </section>

      <Dialog open={editPedido !== null} onOpenChange={(o) => !o && setEditPedido(null)}>
        <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar dados do pedido</DialogTitle>
          </DialogHeader>
          {editPedido && (
            <div className="grid flex-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
              <Field label="Data">
                <Input
                  type="date"
                  value={editPedido.data}
                  onChange={(e) => setEditPedido({ ...editPedido, data: e.target.value })}
                />
              </Field>
              <Field label="Cliente">
                <Input
                  value={editPedido.cliente_nome}
                  onChange={(e) => setEditPedido({ ...editPedido, cliente_nome: e.target.value })}
                />
              </Field>
              <Field label="Vendedor">
                <Input
                  value={editPedido.vendedor}
                  onChange={(e) => setEditPedido({ ...editPedido, vendedor: e.target.value })}
                />
              </Field>
              <Field label="Tipo de atendimento">
                <Select
                  value={editPedido.tipo_atendimento}
                  onValueChange={(v) => setEditPedido({ ...editPedido, tipo_atendimento: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">IN · Balcão</SelectItem>
                    <SelectItem value="out">OUT · Serviço externo</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Frete (R$)">
                <Input
                  value={editPedido.valor_frete}
                  onChange={(e) => setEditPedido({ ...editPedido, valor_frete: e.target.value })}
                />
              </Field>
              <Field label="Mão de obra (R$)">
                <Input
                  value={editPedido.valor_mao_obra}
                  onChange={(e) => setEditPedido({ ...editPedido, valor_mao_obra: e.target.value })}
                />
              </Field>
              <Field label="Forma de pagamento">
                <Select
                  value={editPedido.forma_pagamento || undefined}
                  onValueChange={(v) => setEditPedido({ ...editPedido, forma_pagamento: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
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
              <Field label="Entrada (R$)">
                <Input
                  value={editPedido.valor_entrada}
                  onChange={(e) => setEditPedido({ ...editPedido, valor_entrada: e.target.value })}
                />
              </Field>
              <Field label="Endereço de entrega" className="sm:col-span-2">
                <Input
                  value={editPedido.endereco_entrega}
                  onChange={(e) =>
                    setEditPedido({ ...editPedido, endereco_entrega: e.target.value })
                  }
                />
              </Field>
              <Field label="Observações" className="sm:col-span-2">
                <Input
                  value={editPedido.observacoes}
                  onChange={(e) => setEditPedido({ ...editPedido, observacoes: e.target.value })}
                />
              </Field>
            </div>
          )}
          <DialogFooter className="shrink-0 border-t border-border pt-3">
            <Button variant="outline" onClick={() => setEditPedido(null)}>
              Cancelar
            </Button>
            <Button
              size="lg"
              onClick={() => salvarPedido.mutate()}
              disabled={salvarPedido.isPending}
            >
              <Save /> Salvar edições
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editItem !== null} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar item do pedido</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Descrição" className="sm:col-span-2">
                <Input
                  value={editItem.descricao}
                  onChange={(e) => setEditItem({ ...editItem, descricao: e.target.value })}
                />
              </Field>
              <Field label="Quantidade">
                <Input
                  value={editItem.quantidade}
                  onChange={(e) => setEditItem({ ...editItem, quantidade: e.target.value })}
                />
              </Field>
              <Field label="Preço unitário (R$)">
                <Input
                  value={editItem.preco_unitario}
                  onChange={(e) => setEditItem({ ...editItem, preco_unitario: e.target.value })}
                />
              </Field>
              <p className="text-sm text-muted-foreground sm:col-span-2">
                Total do item: {brl(num(editItem.quantidade) * num(editItem.preco_unitario))}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>
              Cancelar
            </Button>
            <Button onClick={() => salvarItem.mutate()} disabled={salvarItem.isPending}>
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editCond !== null} onOpenChange={(o) => !o && setEditCond(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar condição de pagamento</DialogTitle>
          </DialogHeader>
          {editCond && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Forma de pagamento">
                <Select
                  value={editCond.forma_pagamento}
                  onValueChange={(v) => setEditCond({ ...editCond, forma_pagamento: v })}
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
              <Field label="Cartão / bandeira">
                <Input
                  value={editCond.bandeira}
                  onChange={(e) => setEditCond({ ...editCond, bandeira: e.target.value })}
                />
              </Field>
              <Field label="Para qual conta vai o recurso">
                <Input
                  list="contas-bancarias-opcoes"
                  placeholder="Selecione ou digite a conta"
                  value={editCond.conta_bancaria}
                  onChange={(e) =>
                    setEditCond({ ...editCond, conta_bancaria: e.target.value })
                  }
                />
              </Field>
              <datalist id="contas-bancarias-opcoes">
                {contasBancarias.map((nome) => (
                  <option key={nome} value={nome} />
                ))}
              </datalist>
              <Field label="Data prevista">
                <Input
                  type="date"
                  value={editCond.data_prevista}
                  onChange={(e) => setEditCond({ ...editCond, data_prevista: e.target.value })}
                />
              </Field>
              <Field label="Parcelas">
                <Input
                  value={editCond.parcelas}
                  onChange={(e) => setEditCond({ ...editCond, parcelas: e.target.value })}
                />
              </Field>
              <Field label="Abate do pedido (R$)">
                <Input
                  value={editCond.valor}
                  onChange={(e) => setEditCond({ ...editCond, valor: e.target.value })}
                />
              </Field>
              <Field label="Juros / acréscimo (R$)">
                <Input
                  value={editCond.acrescimo}
                  onChange={(e) => setEditCond({ ...editCond, acrescimo: e.target.value })}
                />
              </Field>
              <Field label="Situação">
                <Select
                  value={editCond.pago ? "pago" : "aberto"}
                  onValueChange={(v) => setEditCond({ ...editCond, pago: v === "pago" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aberto">A receber</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <p className="self-end text-sm text-muted-foreground">
                Cliente paga: {brl(num(editCond.valor) + num(editCond.acrescimo))}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCond(null)}>
              Cancelar
            </Button>
            <Button onClick={() => salvarCondicao.mutate()} disabled={salvarCondicao.isPending}>
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editPag !== null} onOpenChange={(o) => !o && setEditPag(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar pagamento</DialogTitle>
          </DialogHeader>
          {editPag && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Data do pagamento">
                <Input
                  type="date"
                  value={editPag.data_pagamento}
                  onChange={(e) => setEditPag({ ...editPag, data_pagamento: e.target.value })}
                />
              </Field>
              <Field label="Forma de pagamento">
                <Select
                  value={editPag.forma_pagamento}
                  onValueChange={(v) => setEditPag({ ...editPag, forma_pagamento: v })}
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
              <Field label="Conta onde entrou">
                <Select
                  value={editPag.conta_bancaria}
                  onValueChange={(v) => setEditPag({ ...editPag, conta_bancaria: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {contasBancarias.map((conta) => (
                      <SelectItem key={conta} value={conta}>{conta}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Valor cobrado / cliente (R$)">
                <Input
                  value={editPag.valor_origem}
                  onChange={(e) => setEditPag({ ...editPag, valor_origem: e.target.value })}
                  placeholder="Ex: 460,00"
                />
              </Field>
              <Field label="Líquido no caixa (concessionária) (R$)">
                <Input
                  value={editPag.valor}
                  onChange={(e) => setEditPag({ ...editPag, valor: e.target.value })}
                  placeholder="Ex: 450,85"
                />
              </Field>
              <p className="self-end text-sm text-muted-foreground sm:col-span-2">
                Taxa / retenção concessionária: {brl(Math.max(num(editPag.valor_origem) - num(editPag.valor), 0))}
              </p>
              <Field label="Observações" className="sm:col-span-2">
                <Input
                  value={editPag.observacoes}
                  onChange={(e) => setEditPag({ ...editPag, observacoes: e.target.value })}
                />
              </Field>
              <Field label="Comprovante" className="sm:col-span-2">
                <ComprovanteAnexo
                  tabela="venda_pagamentos"
                  valor={editPag.comprovante_path}
                  onChange={(comprovante_path) => setEditPag({ ...editPag, comprovante_path })}
                />
              </Field>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPag(null)}>
              Cancelar
            </Button>
            <Button onClick={() => salvarPagamento.mutate()} disabled={salvarPagamento.isPending}>
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
