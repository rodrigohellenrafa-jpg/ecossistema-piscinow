import { ExpandableCard } from "@/components/expandable-card";
import { LancarEmLote } from "@/components/lancar-em-lote";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, CheckCircle2, ChevronsUpDown, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { VinculoField, parseVinculo } from "@/components/centro-custo-field";
import { Field } from "@/components/field";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAbrirModal } from "@/hooks/use-abrir-modal";

export const Route = createFileRoute("/contas")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Contas a Pagar e Receber | Piscinow ERP" },
      {
        name: "description",
        content: "Lance contas a pagar e a receber, acompanhe vencimentos e dê baixa nos títulos.",
      },
      { property: "og:title", content: "Contas a Pagar e Receber | Piscinow ERP" },
      { property: "og:description", content: "Controle financeiro de títulos da Piscinow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Contas />
    </RequireAuth>
  ),
});

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const vazio = {
  obra_id: "",
  vinculo: "",
  numero_documento: "",
  conta_bancaria: "",
  tipo: "pagar",
  descricao: "",
  parceiro: "",
  categoria: "",
  valor: "0",
  valor_juros: "0",
  vencimento: "",
  recorrencia: "nenhuma",
  recorrencia_fim: "",
  tipo_despesa: "",
  observacoes: "",
};

const TIPOS_DESPESA = [
  { valor: "fixa", rotulo: "Despesa fixa" },
  { valor: "variavel", rotulo: "Despesa variável" },
  { valor: "operacional", rotulo: "Despesa operacional" },
  { valor: "pessoal", rotulo: "Despesa pessoal" },
] as const;

const fornecedorVazio = {
  nome: "",
  cnpj: "",
  telefone: "",
  email: "",
};

const RECORRENCIAS: { valor: string; rotulo: string }[] = [
  { valor: "nenhuma", rotulo: "Pagamento único (sem recorrência)" },
  { valor: "diaria", rotulo: "Diária" },
  { valor: "semanal", rotulo: "Semanal" },
  { valor: "quinzenal", rotulo: "Quinzenal" },
  { valor: "mensal", rotulo: "Mensal" },
  { valor: "bimestral", rotulo: "Bimestral" },
  { valor: "trimestral", rotulo: "Trimestral" },
  { valor: "semestral", rotulo: "Semestral" },
  { valor: "anual", rotulo: "Anual" },
];

function proximaData(iso: string, recorrencia: string): string | null {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  switch (recorrencia) {
    case "diaria": d.setDate(d.getDate() + 1); break;
    case "semanal": d.setDate(d.getDate() + 7); break;
    case "quinzenal": d.setDate(d.getDate() + 15); break;
    case "mensal": d.setMonth(d.getMonth() + 1); break;
    case "bimestral": d.setMonth(d.getMonth() + 2); break;
    case "trimestral": d.setMonth(d.getMonth() + 3); break;
    case "semestral": d.setMonth(d.getMonth() + 6); break;
    case "anual": d.setFullYear(d.getFullYear() + 1); break;
    default: return null;
  }
  return d.toISOString().slice(0, 10);
}

const rotuloRecorrencia = (v: string) =>
  RECORRENCIAS.find((r) => r.valor === v)?.rotulo ?? null;

/** Próximos vencimentos de uma recorrência: até 12 parcelas, limitadas a 12 meses à frente. */
function ocorrenciasFuturas(inicio: string, recorrencia: string, fim: string | null) {
  if (!recorrencia || recorrencia === "nenhuma") return [];
  const limite = new Date(`${inicio}T12:00:00`);
  limite.setMonth(limite.getMonth() + 12);
  const limiteISO = limite.toISOString().slice(0, 10);
  const datas: string[] = [];
  let atual = inicio;
  for (let i = 0; i < 12; i++) {
    const prox = proximaData(atual, recorrencia);
    if (!prox) break;
    if (prox > limiteISO) break;
    if (fim && prox > fim) break;
    datas.push(prox);
    atual = prox;
  }
  return datas;
}

const PERIODOS = [
  { valor: "todas", rotulo: "Todas" },
  { valor: "hoje", rotulo: "Hoje" },
  { valor: "semana", rotulo: "Esta semana" },
  { valor: "mes", rotulo: "Este mês" },
  { valor: "trimestre", rotulo: "Este trimestre" },
  { valor: "semestre", rotulo: "Este semestre" },
  { valor: "ano", rotulo: "Este ano" },
];

function noPeriodo(vencimento: string, periodo: string): boolean {
  if (periodo === "todas") return true;
  const d = new Date(`${vencimento}T00:00:00`);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  if (periodo === "hoje") return d.getTime() === hoje.getTime();
  if (periodo === "semana") {
    const inicio = new Date(hoje);
    inicio.setDate(hoje.getDate() - hoje.getDay()); // domingo
    const fim = new Date(inicio);
    fim.setDate(inicio.getDate() + 6);
    return d >= inicio && d <= fim;
  }
  if (periodo === "mes") return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
  if (periodo === "trimestre")
    return Math.floor(d.getMonth() / 3) === Math.floor(hoje.getMonth() / 3) && d.getFullYear() === hoje.getFullYear();
  if (periodo === "semestre")
    return Math.floor(d.getMonth() / 6) === Math.floor(hoje.getMonth() / 6) && d.getFullYear() === hoje.getFullYear();
  if (periodo === "ano") return d.getFullYear() === hoje.getFullYear();
  return true;
}

function Contas() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  useAbrirModal("novo", () => setOpen(true));
  const [form, setForm] = useState(vazio);
  const [periodo, setPeriodo] = useState("todas");
  const [baixando, setBaixando] = useState<Conta | null>(null);

  const { data = [] } = useQuery({
    queryKey: ["contas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas")
        .select("*")
        .order("vencimento", { ascending: true });
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
        .order("nome", { ascending: true });
      if (error) throw error;
      return data as Tables<"fornecedores">[];
    },
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ["funcionarios-select-contas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funcionarios")
        .select("id, nome, cargo")
        .eq("ativo", true)
        .order("nome", { ascending: true });
      if (error) throw error;
      return data as { id: string; nome: string; cargo: string | null }[];
    },
  });

  const { data: clientesSelect = [] } = useQuery({
    queryKey: ["clientes-select-contas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome", { ascending: true });
      if (error) throw error;
      return data as { id: string; nome: string }[];
    },
  });

  const { data: contasBancarias = [] } = useQuery({
    queryKey: ["saldos-bancarios-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saldos_bancarios")
        .select("id, conta, banco")
        .order("conta", { ascending: true });
      if (error) throw error;
      return data as { id: string; conta: string; banco: string | null }[];
    },
  });

  const [parceiroOpen, setParceiroOpen] = useState(false);
  const [parceiroBusca, setParceiroBusca] = useState("");

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias-financeiras"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categorias_financeiras")
        .select("id, nome, tipo")
        .eq("ativo", true)
        .order("nome", { ascending: true });
      if (error) throw error;
      return data as { id: string; nome: string; tipo: string }[];
    },
  });

  const [novaCategoria, setNovaCategoria] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  useAbrirModal("categoria", () => setCatOpen(true));

  const [fornOpen, setFornOpen] = useState(false);
  const [novoFornecedor, setNovoFornecedor] = useState(fornecedorVazio);

  const [ratear, setRatear] = useState(false);
  const [rateio, setRateio] = useState<{ categoria: string; valor: string }[]>([
    { categoria: "", valor: "" },
    { categoria: "", valor: "" },
  ]);

  const { data: rateios = [] } = useQuery({
    queryKey: ["conta-rateios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conta_rateios")
        .select("id, conta_id, categoria, valor");
      if (error) throw error;
      return data as { id: string; conta_id: string; categoria: string; valor: number }[];
    },
  });

  const totalTitulo = (Number(form.valor) || 0) + (Number(form.valor_juros) || 0);
  const somaRateio = rateio.reduce((s, r) => s + (Number(r.valor) || 0), 0);
  const diferenca = Math.round((totalTitulo - somaRateio) * 100) / 100;

  const salvarCategoria = useMutation({
    mutationFn: async () => {
      const nome = novaCategoria.trim();
      if (!nome) throw new Error("Informe o nome da categoria.");
      const { error } = await supabase.from("categorias_financeiras").insert({
        nome,
        tipo: form.tipo,
        created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
      });
      if (error) throw error;
      return nome;
    },
    onSuccess: (nome) => {
      toast.success("Categoria cadastrada!");
      setNovaCategoria("");
      setCatOpen(false);
      setForm((f) => ({ ...f, categoria: nome }));
      qc.invalidateQueries({ queryKey: ["categorias-financeiras"] });
    },
    onError: (e: Error) =>
      toast.error(e.message.includes("duplicate") ? "Categoria já existe." : e.message),
  });

  const salvarFornecedor = useMutation({
    mutationFn: async () => {
      const nome = novoFornecedor.nome.trim();
      if (!nome) throw new Error("Informe o nome do fornecedor.");
      const { data: criado, error } = await supabase
        .from("fornecedores")
        .insert({
          nome,
          cnpj: novoFornecedor.cnpj || null,
          telefone: novoFornecedor.telefone || null,
          email: novoFornecedor.email || null,
          prazo_entrega_dias: 0,
          ativo: true,
          created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
        })
        .select("nome")
        .single();
      if (error) throw error;
      return criado.nome;
    },
    onSuccess: (nome) => {
      toast.success("Fornecedor cadastrado!");
      setNovoFornecedor(fornecedorVazio);
      setFornOpen(false);
      setForm((f) => ({ ...f, parceiro: nome }));
      qc.invalidateQueries({ queryKey: ["fornecedores"] });
      qc.invalidateQueries({ queryKey: ["fornecedores-select"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const salvar = useMutation({
    mutationFn: async () => {
      if (!form.descricao.trim()) throw new Error("Informe a descrição do título.");
      if (!form.vencimento) throw new Error("Informe o vencimento.");

      const linhas = rateio
        .map((r) => ({ categoria: r.categoria.trim(), valor: Number(r.valor) || 0 }))
        .filter((r) => r.categoria && r.valor > 0);

      if (ratear) {
        if (linhas.length < 2) throw new Error("Informe ao menos duas categorias no rateio.");
        if (Math.abs(diferenca) > 0.005)
          throw new Error(
            `A soma das categorias (${brl(somaRateio)}) precisa bater com o total do título (${brl(totalTitulo)}).`,
          );
      }

      const uid = (await supabase.auth.getUser()).data.user?.id ?? null;

      if (editando) {
        const { error } = await supabase
          .from("contas")
          .update({
            tipo: form.tipo,
            descricao: form.descricao.trim(),
            parceiro: form.parceiro || null,
            categoria: ratear ? "Rateio" : form.categoria || null,
            valor: Number(form.valor) || 0,
            valor_juros: Number(form.valor_juros) || 0,
            vencimento: form.vencimento,
            observacoes: form.observacoes || null,
            obra_id: parseVinculo(form.vinculo).obra_id ?? (form.obra_id || null),
            funcionario_id: parseVinculo(form.vinculo).funcionario_id,
            cliente_id: parseVinculo(form.vinculo).cliente_id,
            numero_documento: form.numero_documento || null,
            conta_bancaria: form.conta_bancaria || null,
            recorrencia: form.recorrencia,
            recorrencia_fim:
              form.recorrencia !== "nenhuma" && form.recorrencia_fim
                ? form.recorrencia_fim
                : null,
            tipo_despesa: form.tipo === "pagar" && form.tipo_despesa ? form.tipo_despesa : null,
          })
          .eq("id", editando);
        if (error) throw error;

        const { error: errDel } = await supabase
          .from("conta_rateios")
          .delete()
          .eq("conta_id", editando);
        if (errDel) throw errDel;
        if (ratear) {
          const { error: err2 } = await supabase.from("conta_rateios").insert(
            linhas.map((l) => ({
              conta_id: editando,
              categoria: l.categoria,
              valor: l.valor,
              created_by: uid,
            })),
          );
          if (err2) throw err2;
        }
        return;
      }

      const { data: criada, error } = await supabase
        .from("contas")
        .insert({
          tipo: form.tipo,
          descricao: form.descricao.trim(),
          parceiro: form.parceiro || null,
          categoria: ratear ? "Rateio" : form.categoria || null,
          valor: Number(form.valor) || 0,
          valor_juros: Number(form.valor_juros) || 0,
          vencimento: form.vencimento,
          status: "aberto",
          observacoes: form.observacoes || null,
          obra_id: parseVinculo(form.vinculo).obra_id ?? (form.obra_id || null),
          funcionario_id: parseVinculo(form.vinculo).funcionario_id,
          cliente_id: parseVinculo(form.vinculo).cliente_id,
          numero_documento: form.numero_documento || null,
          conta_bancaria: form.conta_bancaria || null,
          recorrencia: form.recorrencia,
          recorrencia_fim:
            form.recorrencia !== "nenhuma" && form.recorrencia_fim ? form.recorrencia_fim : null,
          tipo_despesa: form.tipo === "pagar" && form.tipo_despesa ? form.tipo_despesa : null,
          created_by: uid,
        })
        .select("id")
        .single();
      if (error) throw error;

      if (ratear && criada) {
        const { error: err2 } = await supabase.from("conta_rateios").insert(
          linhas.map((l) => ({
            conta_id: criada.id,
            categoria: l.categoria,
            valor: l.valor,
            created_by: uid,
          })),
        );
        if (err2) throw err2;
      }

      // Recorrência: já cria os próximos vencimentos para aparecerem na lista.
      const futuras = ocorrenciasFuturas(
        form.vencimento,
        form.recorrencia,
        form.recorrencia !== "nenhuma" && form.recorrencia_fim ? form.recorrencia_fim : null,
      );
      if (futuras.length > 0) {
        const { error: errFut } = await supabase.from("contas").insert(
          futuras.map((venc) => ({
            tipo: form.tipo,
            descricao: form.descricao.trim(),
            parceiro: form.parceiro || null,
            categoria: ratear ? "Rateio" : form.categoria || null,
            valor: Number(form.valor) || 0,
            valor_juros: Number(form.valor_juros) || 0,
            vencimento: venc,
            status: "aberto",
            observacoes: form.observacoes || null,
            obra_id: parseVinculo(form.vinculo).obra_id ?? (form.obra_id || null),
            funcionario_id: parseVinculo(form.vinculo).funcionario_id,
            cliente_id: parseVinculo(form.vinculo).cliente_id,
            numero_documento: form.numero_documento || null,
            conta_bancaria: form.conta_bancaria || null,
            recorrencia: form.recorrencia,
            recorrencia_fim: form.recorrencia_fim || null,
            tipo_despesa: form.tipo === "pagar" && form.tipo_despesa ? form.tipo_despesa : null,
            created_by: uid,
          })),
        );
        if (errFut) throw errFut;
      }
    },
    onSuccess: () => {
      toast.success(editando ? "Lançamento atualizado!" : "Título lançado!");
      setForm(vazio);
      setEditando(null);
      setRatear(false);
      setRateio([
        { categoria: "", valor: "" },
        { categoria: "", valor: "" },
      ]);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["contas"] });
      qc.invalidateQueries({ queryKey: ["conta-rateios"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const baixar = useMutation({
    mutationFn: async ({
      id,
      valorPago,
      dataPagamento,
      modo,
      contaBancaria,
    }: {
      id: string;
      valorPago: number;
      dataPagamento: string;
      modo: "quitar" | "saldo";
      contaBancaria: string;
    }) => {
      const { data: conta } = await supabase.from("contas").select("*").eq("id", id).single();
      if (!conta) throw new Error("Título não encontrado.");

      const total = Number(conta.valor) + Number(conta.valor_juros ?? 0);
      const diferenca = Number((total - valorPago).toFixed(2));
      const uidBaixa = (await supabase.auth.getUser()).data.user?.id ?? null;

      if (diferenca > 0.009 && modo === "saldo") {
        // Paga em parte agora: o título original fica com o valor pago e o
        // restante vira um novo título em aberto.
        const jurosOriginais = Number(conta.valor_juros ?? 0);
        const jurosPagos = Math.min(jurosOriginais, valorPago);
        const { error: errParcial } = await supabase
          .from("contas")
          .update({
            status: "pago",
            data_pagamento: dataPagamento,
            valor: Number((valorPago - jurosPagos).toFixed(2)),
            valor_juros: jurosPagos,
            valor_pago: valorPago,
            valor_desconto: 0,
            conta_bancaria: contaBancaria || null,
          })
          .eq("id", id);
        if (errParcial) throw errParcial;

        const { error: errSaldo } = await supabase.from("contas").insert({
          tipo: conta.tipo,
          descricao: `${conta.descricao} (saldo)`,
          parceiro: conta.parceiro,
          cliente_id: conta.cliente_id,
          funcionario_id: (conta as { funcionario_id?: string | null }).funcionario_id ?? null,
          categoria: conta.categoria,
          valor: diferenca,
          valor_juros: 0,
          vencimento: conta.vencimento,
          status: "aberto",
          observacoes: conta.observacoes,
          obra_id: conta.obra_id,
          numero_documento: conta.numero_documento,
          venda_id: conta.venda_id,
          conta_bancaria: contaBancaria || null,
          recorrencia: "nenhuma",
          tipo_despesa: (conta as { tipo_despesa?: string | null }).tipo_despesa ?? null,
          created_by: uidBaixa,
        });
        if (errSaldo) throw errSaldo;
      } else {
        const { error } = await supabase
          .from("contas")
          .update({
            status: "pago",
            data_pagamento: dataPagamento,
            valor_pago: valorPago,
            valor_desconto: diferenca > 0.009 ? diferenca : 0,
            conta_bancaria: contaBancaria || null,
          })
          .eq("id", id);
        if (error) throw error;
      }

      if (conta && conta.recorrencia && conta.recorrencia !== "nenhuma") {
        const proxima = proximaData(conta.vencimento, conta.recorrencia);
        const fimRecorrencia = (conta as { recorrencia_fim?: string | null }).recorrencia_fim;
        const { data: jaExiste } = proxima
          ? await supabase
              .from("contas")
              .select("id")
              .eq("descricao", conta.descricao)
              .eq("tipo", conta.tipo)
              .eq("vencimento", proxima)
              .limit(1)
          : { data: [] as { id: string }[] };
        if (
          proxima &&
          (jaExiste ?? []).length === 0 &&
          (!fimRecorrencia || proxima <= fimRecorrencia)
        ) {
          const uid = (await supabase.auth.getUser()).data.user?.id ?? null;
          const { error: errRec } = await supabase.from("contas").insert({
            tipo: conta.tipo,
            descricao: conta.descricao,
            parceiro: conta.parceiro,
            cliente_id: conta.cliente_id,
            funcionario_id: (conta as { funcionario_id?: string | null }).funcionario_id ?? null,
            categoria: conta.categoria,
            valor: conta.valor,
            valor_juros: conta.valor_juros ?? 0,
            vencimento: proxima,
            status: "aberto",
            observacoes: conta.observacoes,
            obra_id: conta.obra_id,
            numero_documento: conta.numero_documento,
            venda_id: conta.venda_id,
            recorrencia: conta.recorrencia,
            recorrencia_fim: fimRecorrencia ?? null,
            tipo_despesa: (conta as { tipo_despesa?: string | null }).tipo_despesa ?? null,
            created_by: uid,
          });
          if (errRec) throw errRec;
        }
      }
    },
    onSuccess: () => {
      toast.success("Baixa registrada e saldo da conta atualizado.");
      qc.invalidateQueries({ queryKey: ["contas"] });
      qc.invalidateQueries({ queryKey: ["saldos-bancarios-select"] });
      qc.invalidateQueries({ queryKey: ["saldos-bancarios"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const excluir = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contas"] }),
  });

  const abrirEdicao = (c: Conta) => {
    setEditando(c.id);
    const vinculo = c.obra_id
      ? `obra:${c.obra_id}`
      : c.funcionario_id
        ? `func:${c.funcionario_id}`
        : c.cliente_id
          ? `cli:${c.cliente_id}`
          : "";
    setForm({
      obra_id: c.obra_id ?? "",
      vinculo,
      numero_documento: c.numero_documento ?? "",
      conta_bancaria: (c as { conta_bancaria?: string | null }).conta_bancaria ?? "",
      tipo: c.tipo,
      descricao: c.descricao,
      parceiro: c.parceiro ?? "",
      categoria: c.categoria === "Rateio" ? "" : (c.categoria ?? ""),
      valor: String(c.valor ?? 0),
      valor_juros: String(c.valor_juros ?? 0),
      vencimento: c.vencimento,
      recorrencia: c.recorrencia ?? "nenhuma",
      recorrencia_fim: c.recorrencia_fim ?? "",
      tipo_despesa: c.tipo_despesa ?? "",
      observacoes: c.observacoes ?? "",
    });
    const linhasExistentes = rateios.filter((r) => r.conta_id === c.id);
    if (linhasExistentes.length > 0) {
      setRatear(true);
      setRateio(
        linhasExistentes.map((r) => ({ categoria: r.categoria, valor: String(r.valor) })),
      );
    } else {
      setRatear(false);
      setRateio([
        { categoria: "", valor: "" },
        { categoria: "", valor: "" },
      ]);
    }
    setOpen(true);
  };

  const set = (k: keyof typeof vazio) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const filtradas = data.filter((c) => noPeriodo(c.vencimento, periodo));
  const pagar = filtradas.filter((c) => c.tipo === "pagar");
  // A receber: mostra apenas títulos em aberto; os baixados saem da tela.
  const receber = filtradas.filter((c) => c.tipo === "receber" && c.status !== "pago");
  const soma = (l: typeof data) =>
    l.filter((c) => c.status !== "pago").reduce((s, c) => s + Number(c.valor), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contas a Pagar e Receber</h1>
          <p className="text-sm text-muted-foreground">Títulos com vencimento e baixa manual.</p>
        </div>
        <LancarEmLote destino="contas" />
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) {
              setEditando(null);
              setForm(vazio);
              setRatear(false);
              setRateio([
                { categoria: "", valor: "" },
                { categoria: "", valor: "" },
              ]);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus /> Novo lançamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editando ? "Editar lançamento" : "Novo lançamento"}</DialogTitle>
              <DialogDescription>Conta a pagar ou a receber.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
<h3 className="border-b pb-2 text-sm font-semibold sm:col-span-2">Dados do lançamento</h3>
              <Field label="Tipo">
                <Select value={form.tipo} onValueChange={set("tipo")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pagar">A pagar</SelectItem>
                    <SelectItem value="receber">A receber</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={form.tipo === "pagar" ? "Beneficiário (quem será pago)" : "Cliente"}>
                {form.tipo === "pagar" ? (
                  <div className="flex gap-1">
                    <Popover open={parceiroOpen} onOpenChange={setParceiroOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between font-normal"
                        >
                          <span className={form.parceiro ? "" : "text-muted-foreground"}>
                            {form.parceiro || "Fornecedor, colaborador, cliente ou pessoa"}
                          </span>
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Digite o nome…"
                            value={parceiroBusca}
                            onValueChange={setParceiroBusca}
                          />
                          <CommandList>
                            <CommandEmpty>Nenhum cadastro encontrado.</CommandEmpty>
                            {parceiroBusca.trim() && (
                              <CommandGroup heading="Pessoa / contato avulso">
                                <CommandItem
                                  value={`usar-${parceiroBusca}`}
                                  onSelect={() => {
                                    set("parceiro")(parceiroBusca.trim());
                                    setParceiroOpen(false);
                                  }}
                                >
                                  <Plus /> Usar “{parceiroBusca.trim()}”
                                </CommandItem>
                              </CommandGroup>
                            )}
                            {[
                              { titulo: "Fornecedores", itens: fornecedores.map((f) => ({ id: f.id, nome: f.nome, extra: "" })) },
                              {
                                titulo: "Colaboradores",
                                itens: colaboradores.map((c) => ({
                                  id: c.id,
                                  nome: c.nome,
                                  extra: c.cargo ?? "",
                                })),
                              },
                              { titulo: "Clientes", itens: clientesSelect.map((c) => ({ id: c.id, nome: c.nome, extra: "" })) },
                            ]
                              .filter((g) => g.itens.length > 0)
                              .map((grupo) => (
                                <CommandGroup key={grupo.titulo} heading={grupo.titulo}>
                                  {grupo.itens.map((i) => (
                                    <CommandItem
                                      key={`${grupo.titulo}-${i.id}`}
                                      value={`${i.nome} ${i.extra}`.toLowerCase()}
                                      onSelect={() => {
                                        set("parceiro")(i.nome);
                                        setParceiroOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={
                                          form.parceiro === i.nome
                                            ? "text-emerald-600"
                                            : "opacity-0"
                                        }
                                      />
                                      <span className="truncate">{i.nome}</span>
                                      {i.extra && (
                                        <span className="ml-auto text-xs text-muted-foreground">
                                          {i.extra}
                                        </span>
                                      )}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Dialog open={fornOpen} onOpenChange={setFornOpen}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="icon" title="Novo fornecedor">
                          <Plus />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Novo fornecedor</DialogTitle>
                          <DialogDescription>
                            Cadastre o fornecedor rapidamente.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="Nome / Razão social" className="sm:col-span-2">
                            <Input
                              value={novoFornecedor.nome}
                              onChange={(e) =>
                                setNovoFornecedor((f) => ({ ...f, nome: e.target.value }))
                              }
                              placeholder="Ex.: Light S/A"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  salvarFornecedor.mutate();
                                }
                              }}
                            />
                          </Field>
                          <Field label="CNPJ">
                            <Input
                              value={novoFornecedor.cnpj}
                              onChange={(e) =>
                                setNovoFornecedor((f) => ({ ...f, cnpj: e.target.value }))
                              }
                            />
                          </Field>
                          <Field label="Telefone">
                            <Input
                              value={novoFornecedor.telefone}
                              onChange={(e) =>
                                setNovoFornecedor((f) => ({ ...f, telefone: e.target.value }))
                              }
                            />
                          </Field>
                          <Field label="E-mail" className="sm:col-span-2">
                            <Input
                              type="email"
                              value={novoFornecedor.email}
                              onChange={(e) =>
                                setNovoFornecedor((f) => ({ ...f, email: e.target.value }))
                              }
                            />
                          </Field>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFornOpen(false)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={() => salvarFornecedor.mutate()}
                            disabled={salvarFornecedor.isPending}
                          >
                            Salvar fornecedor
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <Input
                    value={form.parceiro}
                    onChange={(e) => set("parceiro")(e.target.value)}
                    placeholder="Nome do cliente"
                  />
                )}
              </Field>
              <Field label="Descrição" className="sm:col-span-2">
                <Input value={form.descricao} onChange={(e) => set("descricao")(e.target.value)} />
              </Field>
<h3 className="border-b pb-2 text-sm font-semibold sm:col-span-2">Valores e categorias</h3>
              {!ratear && (
              <Field label="Categoria">
                <div className="flex gap-1">
                  <Select value={form.categoria} onValueChange={set("categoria")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias
                        .filter((c) => c.tipo === "ambas" || c.tipo === form.tipo)
                        .map((c) => (
                          <SelectItem key={c.id} value={c.nome}>
                            {c.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={catOpen} onOpenChange={setCatOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon" title="Nova categoria">
                        <Plus />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-sm">
                      <DialogHeader>
                        <DialogTitle>Nova categoria</DialogTitle>
                        <DialogDescription>
                          Cadastre uma categoria de {form.tipo === "pagar" ? "contas a pagar" : "contas a receber"}.
                        </DialogDescription>
                      </DialogHeader>
                      <Input
                        value={novaCategoria}
                        onChange={(e) => setNovaCategoria(e.target.value)}
                        placeholder="Ex.: Combustível"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            salvarCategoria.mutate();
                          }
                        }}
                      />
                      <DialogFooter>
                        <Button onClick={() => salvarCategoria.mutate()} disabled={salvarCategoria.isPending}>
                          Salvar categoria
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </Field>
              )}
              <Field label="Valor (R$)">
                <Input
                  type="number"
                  step="0.01"
                  value={form.valor}
                  onChange={(e) => set("valor")(e.target.value)}
                />
              </Field>
              <Field label="Juros (R$)">
                <Input
                  type="number"
                  step="0.01"
                  value={form.valor_juros}
                  onChange={(e) => set("valor_juros")(e.target.value)}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Total do lançamento: {brl((Number(form.valor) || 0) + (Number(form.valor_juros) || 0))}
                </p>
              </Field>
              <div className="rounded-lg border p-3 sm:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Rateio de categorias</p>
                    <p className="text-xs text-muted-foreground">
                      Um único pagamento dividido entre várias categorias no DRE e nos relatórios.
                    </p>
                  </div>
                  <Switch checked={ratear} onCheckedChange={setRatear} aria-label="Ativar rateio" />
                </div>

                {ratear && (
                  <div className="mt-3 space-y-2">
                    {rateio.map((linha, i) => (
                      <div key={i} className="flex items-end gap-2">
                        <div className="flex-1">
                          <Select
                            value={linha.categoria}
                            onValueChange={(v) =>
                              setRateio((r) =>
                                r.map((x, j) => (j === i ? { ...x, categoria: v } : x)),
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              {categorias
                                .filter((c) => c.tipo === "ambas" || c.tipo === form.tipo)
                                .map((c) => (
                                  <SelectItem key={c.id} value={c.nome}>
                                    {c.nome}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Input
                          className="w-32"
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={linha.valor}
                          onChange={(e) =>
                            setRateio((r) =>
                              r.map((x, j) => (j === i ? { ...x, valor: e.target.value } : x)),
                            )
                          }
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Remover linha"
                          onClick={() => setRateio((r) => r.filter((_, j) => j !== i))}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setRateio((r) => [...r, { categoria: "", valor: "" }])}
                      >
                        <Plus /> Adicionar categoria
                      </Button>
                      <p
                        className={
                          Math.abs(diferenca) > 0.005
                            ? "text-xs font-medium text-destructive"
                            : "text-xs font-medium text-emerald-600"
                        }
                      >
                        Rateado {brl(somaRateio)} de {brl(totalTitulo)}
                        {Math.abs(diferenca) > 0.005
                          ? ` — faltam ${brl(diferenca)}`
                          : " — valores conferem"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
<h3 className="border-b pb-2 text-sm font-semibold sm:col-span-2">Pagamento e recorrência</h3>
              <Field label="Vencimento">
                <Input
                  type="date"
                  value={form.vencimento}
                  onChange={(e) => set("vencimento")(e.target.value)}
                />
              </Field>
              <Field label="Recorrência">
                <Select value={form.recorrencia} onValueChange={set("recorrencia")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pagamento único" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECORRENCIAS.map((r) => (
                      <SelectItem key={r.valor} value={r.valor}>
                        {r.rotulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.recorrencia !== "nenhuma" && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ao dar baixa, o próximo vencimento ({rotuloRecorrencia(form.recorrencia)?.toLowerCase()}) é gerado automaticamente.
                  </p>
                )}
              </Field>
              {form.recorrencia !== "nenhuma" && (
                <Field label="Repetir até (opcional)">
                  <Input
                    type="date"
                    value={form.recorrencia_fim}
                    onChange={(e) => set("recorrencia_fim")(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Deixe em branco para repetir sem limite. Depois dessa data nenhum novo
                    vencimento é gerado.
                  </p>
                </Field>
              )}
              {form.tipo === "pagar" && (
                <Field label="Tipo de despesa">
                  <Select
                    value={form.tipo_despesa || "none"}
                    onValueChange={(v) => set("tipo_despesa")(v === "none" ? "" : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Não classificado</SelectItem>
                      {TIPOS_DESPESA.map((t) => (
                        <SelectItem key={t.valor} value={t.valor}>
                          {t.rotulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
<h3 className="border-b pb-2 text-sm font-semibold sm:col-span-2">Vínculos e documento</h3>
              <VinculoField value={form.vinculo} onChange={(v: string)=>setForm(f=>({...f,vinculo:v}))} />
              <Field label="Número do documento / NF-e"><Input value={form.numero_documento} onChange={e=>setForm(f=>({...f,numero_documento:e.target.value}))}/></Field>
              <Field
                label={form.tipo === "pagar" ? "De onde o recurso sai (conta)" : "Onde o recurso entra (conta)"}
                className="sm:col-span-2"
              >
                <Input
                  list="contas-bancarias-lista"
                  value={form.conta_bancaria}
                  onChange={(e) => set("conta_bancaria")(e.target.value)}
                  placeholder="Ex.: Caixa, Itaú c/c 1234, Nubank PJ"
                />
                <datalist id="contas-bancarias-lista">
                  {contasBancarias.map((c) => (
                    <option key={c.id} value={c.conta}>
                      {c.banco ?? ""}
                    </option>
                  ))}
                </datalist>
              </Field>
<h3 className="border-b pb-2 text-sm font-semibold sm:col-span-2">Observações</h3>
              <Field label="Observações" className="sm:col-span-2">
                <Textarea
                  rows={3}
                  value={form.observacoes}
                  onChange={(e) => set("observacoes")(e.target.value)}
                />
              </Field>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
                {salvar.isPending ? "Salvando…" : editando ? "Salvar alterações" : "Salvar lançamento"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Período:</span>
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODOS.map((p) => (
              <SelectItem key={p.valor} value={p.valor}>
                {p.rotulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {periodo !== "todas" && (
          <span className="text-xs text-muted-foreground">
            Filtrando por data de vencimento: {PERIODOS.find((p) => p.valor === periodo)?.rotulo.toLowerCase()}.
          </span>
        )}
      </div>

      <Tabs defaultValue="pagar">
        <TabsList>
          <TabsTrigger value="pagar">A pagar ({pagar.length})</TabsTrigger>
          <TabsTrigger value="receber">A receber ({receber.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pagar">
          <Lista
            titulo={`Em aberto: ${brl(soma(pagar))}`}
            itens={pagar}
            rateios={rateios}
            onBaixar={setBaixando}
            onEditar={abrirEdicao}
            onExcluir={(id) => excluir.mutate(id)}
          />
        </TabsContent>
        <TabsContent value="receber">
          <Lista
            expansivel
            titulo={`Em aberto: ${brl(soma(receber))}`}
            itens={receber}
            rateios={rateios}
            onBaixar={setBaixando}
            onEditar={abrirEdicao}
            onExcluir={(id) => excluir.mutate(id)}
          />
        </TabsContent>
      </Tabs>

      <BaixaDialog
        conta={baixando}
        pendente={baixar.isPending}
        onFechar={() => setBaixando(null)}
        onConfirmar={(p) => baixar.mutate(p, { onSuccess: () => setBaixando(null) })}
      />
    </div>
  );
}

/** Modal de baixa: separa o valor do título do valor realmente pago. */
function BaixaDialog({
  conta,
  pendente,
  onFechar,
  onConfirmar,
}: {
  conta: Conta | null;
  pendente: boolean;
  onFechar: () => void;
  onConfirmar: (p: {
    id: string;
    valorPago: number;
    dataPagamento: string;
    modo: "quitar" | "saldo";
  }) => void;
}) {
  const total = conta ? Number(conta.valor) + Number(conta.valor_juros ?? 0) : 0;
  const [valorPago, setValorPago] = useState("");
  const [dataPagamento, setDataPagamento] = useState("");
  const [modo, setModo] = useState<"quitar" | "saldo">("quitar");

  const aberto = !!conta;
  const chave = conta?.id ?? "";
  const [ultima, setUltima] = useState("");
  if (aberto && chave !== ultima) {
    setUltima(chave);
    setValorPago(total.toFixed(2));
    setDataPagamento(new Date().toISOString().slice(0, 10));
    setModo("quitar");
  }

  const pago = Number(String(valorPago).replace(",", ".")) || 0;
  const diferenca = Number((total - pago).toFixed(2));
  const recebe = conta?.tipo === "receber";

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{recebe ? "Registrar recebimento" : "Registrar pagamento"}</DialogTitle>
          <DialogDescription>{conta?.descricao}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Valor do título (boleto)">
            <Input value={brl(total)} readOnly className="bg-muted" />
          </Field>
          <Field label={recebe ? "Valor recebido" : "Valor pago"}>
            <Input
              inputMode="decimal"
              value={valorPago}
              onChange={(e) => setValorPago(e.target.value)}
              autoFocus
            />
          </Field>
          <Field label={recebe ? "Data do recebimento" : "Data do pagamento"}>
            <Input
              type="date"
              value={dataPagamento}
              onChange={(e) => setDataPagamento(e.target.value)}
            />
          </Field>
          <div className="flex items-end text-sm">
            {diferenca > 0.009 ? (
              <span className="text-destructive">Faltam {brl(diferenca)}</span>
            ) : diferenca < -0.009 ? (
              <span className="text-muted-foreground">
                Pago {brl(Math.abs(diferenca))} a mais que o título
              </span>
            ) : (
              <span className="text-muted-foreground">Valor integral</span>
            )}
          </div>
          {diferenca > 0.009 && (
            <div className="sm:col-span-2">
              <Field label="O que fazer com a diferença">
                <Select value={modo} onValueChange={(v) => setModo(v as "quitar" | "saldo")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quitar">
                      Quitar o título (desconto/abatimento de {brl(diferenca)})
                    </SelectItem>
                    <SelectItem value="saldo">
                      Deixar {brl(diferenca)} em aberto como novo título
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onFechar}>
            Cancelar
          </Button>
          <Button
            disabled={pendente || pago <= 0 || !dataPagamento}
            onClick={() =>
              conta && onConfirmar({ id: conta.id, valorPago: pago, dataPagamento, modo })
            }
          >
            Confirmar baixa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type Conta = {
  id: string;
  tipo: string;
  descricao: string;
  parceiro: string | null;
  categoria: string | null;
  valor: number;
  valor_juros?: number | null;
  valor_pago?: number | null;
  valor_desconto?: number | null;
  vencimento: string;
  status: string;
  recorrencia?: string | null;
  recorrencia_fim?: string | null;
  tipo_despesa?: string | null;
  observacoes?: string | null;
  numero_documento?: string | null;
  obra_id?: string | null;
  funcionario_id?: string | null;
  cliente_id?: string | null;
};

function Lista({
  expansivel = false,
  titulo,
  itens,
  rateios = [],
  onBaixar,
  onEditar,
  onExcluir,
}: {
  expansivel?: boolean;
  titulo: string;
  itens: Conta[];
  rateios?: { conta_id: string; categoria: string; valor: number }[];
  onBaixar: (c: Conta) => void;
  onEditar: (c: Conta) => void;
  onExcluir: (id: string) => void;
}) {
  const hoje = new Date().toISOString().slice(0, 10);
  const [fDescricao, setFDescricao] = useState("");
  const [fParceiro, setFParceiro] = useState("");
  const [fVencimento, setFVencimento] = useState("");
  const [fValor, setFValor] = useState("");
  const [fStatus, setFStatus] = useState("todos");

  const dataBR = (iso: string) => {
    const [a, m, d] = iso.slice(0, 10).split("-");
    return `${d}/${m}/${a}`;
  };
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const contem = (campo: string | null | undefined, filtro: string) =>
    !filtro || norm(campo ?? "").includes(norm(filtro));

  const statusDe = (c: Conta) =>
    c.status === "pago" ? "pago" : c.vencimento < hoje ? "vencido" : "aberto";

  const visiveis = itens.filter((c) => {
    if (!contem(c.descricao, fDescricao)) return false;
    if (!contem(c.parceiro, fParceiro)) return false;
    if (fVencimento) {
      const alvo = norm(fVencimento);
      const v = c.vencimento.slice(0, 10);
      if (!norm(v).includes(alvo) && !norm(dataBR(v)).includes(alvo)) return false;
    }
    if (fValor) {
      const alvo = norm(fValor);
      const total = (Number(c.valor) + Number(c.valor_juros ?? 0))
        .toFixed(2)
        .replace(".", ",");
      const parcela = Number(c.valor).toFixed(2).replace(".", ",");
      if (!norm(total).includes(alvo) && !norm(parcela).includes(alvo)) return false;
    }
    if (fStatus !== "todos" && statusDe(c) !== fStatus) return false;
    return true;
  });

  const Container = expansivel ? ExpandableCard : Card;
  const acoesFixas = expansivel ? "sticky right-0 z-10 bg-card" : "";
  const temFiltro = fDescricao || fParceiro || fVencimento || fValor || fStatus !== "todos";
  return (
    <Container className="mt-4">
      <CardHeader className="pr-12">
        <CardTitle>
          {titulo}
          {temFiltro ? ` · ${visiveis.length} resultado(s)` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Parceiro</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead className="text-right">Parcela</TableHead>
              <TableHead className="text-right">Juros</TableHead>
              <TableHead className="text-right">Total do título</TableHead>
              <TableHead className="text-right">Valor pago</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className={`w-36 text-right ${acoesFixas}`}>Ações</TableHead>
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <TableHead className="py-1">
                <Input
                  value={fDescricao}
                  onChange={(e) => setFDescricao(e.target.value)}
                  placeholder="Buscar descrição…"
                  className="h-8 text-xs font-normal"
                  aria-label="Filtrar por descrição"
                />
              </TableHead>
              <TableHead className="py-1">
                <Input
                  value={fParceiro}
                  onChange={(e) => setFParceiro(e.target.value)}
                  placeholder="Buscar fornecedor…"
                  className="h-8 text-xs font-normal"
                  aria-label="Filtrar por parceiro"
                />
              </TableHead>
              <TableHead className="py-1">
                <Input
                  value={fVencimento}
                  onChange={(e) => setFVencimento(e.target.value)}
                  placeholder="Ex.: 09/2026"
                  className="h-8 text-xs font-normal"
                  aria-label="Filtrar por vencimento"
                />
              </TableHead>
              <TableHead className="py-1" colSpan={4}>
                <Input
                  value={fValor}
                  onChange={(e) => setFValor(e.target.value)}
                  placeholder="Buscar valor…"
                  className="h-8 text-xs font-normal"
                  aria-label="Filtrar por valor"
                />
              </TableHead>
              <TableHead className="py-1">
                <Select value={fStatus} onValueChange={setFStatus}>
                  <SelectTrigger className="h-8 text-xs font-normal" aria-label="Filtrar por status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="aberto">Aberto</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                  </SelectContent>
                </Select>
              </TableHead>
              <TableHead className={`py-1 ${acoesFixas}`} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visiveis.map((c) => {
              const vencido = c.status !== "pago" && c.vencimento < hoje;
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {c.descricao}
                    {c.recorrencia && c.recorrencia !== "nenhuma" && (
                      <Badge variant="outline" className="ml-2 align-middle text-xs font-normal">
                        {rotuloRecorrencia(c.recorrencia)}
                      </Badge>
                    )}
                    {rateios.some((r) => r.conta_id === c.id) && (
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">
                        Rateio:{" "}
                        {rateios
                          .filter((r) => r.conta_id === c.id)
                          .map((r) => `${r.categoria} ${brl(Number(r.valor))}`)
                          .join(" · ")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{c.parceiro ?? "—"}</TableCell>
                  <TableCell className={vencido ? "text-destructive" : undefined}>
                    {new Date(`${c.vencimento}T00:00:00`).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">{brl(Number(c.valor))}</TableCell>
                  <TableCell className="text-right">{brl(Number(c.valor_juros ?? 0))}</TableCell>
                  <TableCell className="text-right font-medium">
                    {brl(Number(c.valor) + Number(c.valor_juros ?? 0))}
                  </TableCell>
                  <TableCell className="text-right">
                    {c.status === "pago" ? (
                      <>
                        {brl(Number(c.valor_pago ?? 0))}
                        {Number(c.valor_desconto ?? 0) > 0.009 && (
                          <span className="block text-xs text-muted-foreground">
                            desconto {brl(Number(c.valor_desconto))}
                          </span>
                        )}
                      </>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.status === "pago" ? "secondary" : vencido ? "destructive" : "outline"}>
                      {c.status === "pago" ? "Pago" : vencido ? "Vencido" : "Aberto"}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right ${acoesFixas}`}><div className="flex justify-end gap-1">
                    {c.status !== "pago" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onBaixar(c)}
                        aria-label="Dar baixa"
                      >
                        <CheckCircle2 className="size-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEditar(c)}
                      title="Editar lançamento"
                      aria-label="Editar lançamento"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onExcluir(c.id)}
                      title="Excluir lançamento"
                      aria-label="Excluir"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div></TableCell>
                </TableRow>
              );
            })}
            {visiveis.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                  {itens.length === 0
                    ? "Nenhum título lançado."
                    : "Nenhum título encontrado com esses filtros."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Container>
  );
}
