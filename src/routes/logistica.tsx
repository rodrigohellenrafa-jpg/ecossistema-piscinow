import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plane,
  Clock,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileText,
  Printer,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Flame,
  ArrowUpDown,
  RefreshCw,
  Info,
} from "lucide-react";
import { toast } from "sonner";

import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  VisualizadorDocumentoModal,
  BotaoVisualizarDocumento,
} from "@/components/visualizador-documento-modal";
import { BotaoVisualizarFormulariosEmitidos } from "@/components/modal-formularios-emitidos";
import { supabase } from "@/integrations/supabase/client";
import { dataBR, hojeISO, addDiasUteis } from "@/lib/erp";

export const Route = createFileRoute("/logistica")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "✈️ Flight Board — Controle de Logística | Piscinow ERP" },
      {
        name: "description",
        content:
          "Painel de controle de voos operacionais e logística de piscinas com design FIDS de aeroporto, monitoramento de etapas e serviços OUT.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <FlightBoardPage />
    </RequireAuth>
  ),
});

export type FlightStatus = "CONFIRMADO" | "AGENDADO" | "OUT" | "AGUARDANDO" | "CONCLUÍDO";
export type EtapaStatus = "pendente" | "em_andamento" | "concluido";

export interface FlightBoardItem {
  id: string;
  voo_codigo: string;
  obra_id?: string | null;
  venda_id?: string | null;
  cliente_id?: string | null;
  cliente_nome: string;
  servico_natureza: string;
  data_pedido: string;
  prazo_dias: number;
  prazo_limite: string;
  escavacao_data?: string | null;
  escavacao_status: EtapaStatus;
  instalacao_data?: string | null;
  instalacao_status: EtapaStatus;
  os_instalacao?: string | null;
  os_instalacao_status: EtapaStatus;
  os_logistica?: string | null;
  os_logistica_status: EtapaStatus;
  os_acabamento?: string | null;
  os_acabamento_status: EtapaStatus;
  status: FlightStatus;
  is_out: boolean;
  responsavel?: string | null;
  endereco_obra?: string | null;
  observacoes?: string | null;
  origem: "logistics_board" | "obra" | "venda";
}

function calcularPrazoRestante(
  dataLimiteStr: string | null | undefined,
  dataPedidoStr: string,
  prazoDias: number,
) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let limiteDate: Date;
  if (dataLimiteStr) {
    limiteDate = new Date(dataLimiteStr + "T00:00:00");
  } else {
    limiteDate = new Date(dataPedidoStr + "T00:00:00");
    limiteDate.setDate(limiteDate.getDate() + (prazoDias || 30));
  }

  const diffTime = limiteDate.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function FlightBoardPage() {
  const qc = useQueryClient();

  // Relógio do aeroporto em tempo real
  const [horaAeroporto, setHoraAeroporto] = useState("");
  useEffect(() => {
    const atualizar = () => {
      const agora = new Date();
      setHoraAeroporto(
        agora.toLocaleTimeString("pt-BR", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    atualizar();
    const timer = setInterval(atualizar, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [apenasOut, setApenasOut] = useState(false);
  const [ordemCrescente, setOrdemCrescente] = useState(true);

  // Drawer / Edição
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [itemEditando, setItemEditando] = useState<FlightBoardItem | null>(null);

  // Modal Novo Voo
  const [novoModalAberto, setNovoModalAberto] = useState(false);
  const [novoItemForm, setNovoItemForm] = useState({
    voo_codigo: "",
    cliente_nome: "",
    cliente_id: "",
    servico_natureza: "",
    data_pedido: hojeISO(),
    prazo_dias: 30,
    prazo_limite: addDiasUteis(hojeISO(), 30),
    status: "AGENDADO" as FlightStatus,
    is_out: false,
    responsavel: "",
    endereco_obra: "",
    observacoes: "",
    os_instalacao: "OS-02",
    os_logistica: "OL",
    os_acabamento: "OS-03",
  });

  // Modal Visualizador de Documento
  const [docModalAberto, setDocModalAberto] = useState(false);
  const [docModalTipo, setDocModalTipo] = useState<"os" | "venda">("os");
  const [docModalId, setDocModalId] = useState<string | null>(null);

  // 1. Busca da tabela dedicada logistics_flight_board
  const { data: boardDb = [] } = useQuery({
    queryKey: ["logistics_flight_board"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("logistics_flight_board" as never)
          .select("*")
          .order("data_pedido", { ascending: true });
        if (error) return [];
        return (data as unknown as FlightBoardItem[]) ?? [];
      } catch {
        return [];
      }
    },
  });

  // 2. Busca das obras ativas
  const { data: obrasDb = [] } = useQuery({
    queryKey: ["obras", "flight-board"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("obras")
        .select("*")
        .order("data_pedido", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  // 3. Busca de clientes
  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes", "flight-board"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nome, endereco_obra")
        .order("nome");
      if (error) throw error;
      return data ?? [];
    },
  });

  // 4. Supabase Realtime Listener
  useEffect(() => {
    const channel = supabase
      .channel("flight-board-realtime-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "logistics_flight_board" },
        () => {
          qc.invalidateQueries({ queryKey: ["logistics_flight_board"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "obras" },
        () => {
          qc.invalidateQueries({ queryKey: ["obras", "flight-board"] });
          qc.invalidateQueries({ queryKey: ["logistics_flight_board"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  // Consolidação unificada de itens (Garantindo que todos os OUTs e Obras constem)
  const itensConsolidados = useMemo(() => {
    const mapa = new Map<string, FlightBoardItem>();

    // 1) Insere itens da tabela de board dedicada
    for (const item of boardDb) {
      mapa.set(item.id, {
        ...item,
        origem: "logistics_board",
      });
    }

    // 2) Insere/Complementa com dados de obras
    for (const ob of obrasDb) {
      const idKey = ob.id;
      if (!mapa.has(idKey)) {
        const textoServico = `${ob.tipo_servico || "Piscina"} ${ob.observacoes || ""}`.toUpperCase();
        const textoStatus = `${ob.status_geral || ""}`.toUpperCase();
        const ehOut = textoServico.includes("OUT") || textoStatus.includes("OUT");

        let statusNorm: FlightStatus = "AGENDADO";
        if (ehOut) statusNorm = "OUT";
        else if (textoStatus.includes("CONCLU")) statusNorm = "CONCLUÍDO";
        else if (textoStatus.includes("CONFIRM") || textoStatus.includes("ANDAMENTO"))
          statusNorm = "CONFIRMADO";
        else if (textoStatus.includes("AGUARD")) statusNorm = "AGUARDANDO";

        mapa.set(idKey, {
          id: ob.id,
          voo_codigo: ob.numero || `OBRA-${ob.id.slice(0, 4).toUpperCase()}`,
          obra_id: ob.id,
          venda_id: ob.venda_id,
          cliente_id: ob.cliente_id,
          cliente_nome: ob.cliente_nome || "Cliente",
          servico_natureza: ob.tipo_servico || "Instalação de Piscina",
          data_pedido: ob.data_pedido || hojeISO(),
          prazo_dias: ob.prazo_dias || 30,
          prazo_limite: ob.data_limite || addDiasUteis(ob.data_pedido || hojeISO(), 30),
          escavacao_data: ob.escavacao_inicio,
          escavacao_status: (ob.etapa_escavacao as EtapaStatus) || "pendente",
          instalacao_data: ob.instalacao_inicio,
          instalacao_status: (ob.etapa_base as EtapaStatus) || "pendente",
          os_instalacao: ob.os_instalacao || "OS-02",
          os_instalacao_status:
            ob.etapa_tubulacao === "concluido" ? "concluido" : "pendente",
          os_logistica: ob.os_logistica || "OL",
          os_logistica_status: ob.etapa_furacao === "concluido" ? "concluido" : "pendente",
          os_acabamento: ob.os_acabamento || "OS-03",
          os_acabamento_status:
            ob.etapa_cascata === "concluido" ? "concluido" : "pendente",
          status: statusNorm,
          is_out: ehOut,
          responsavel: ob.responsavel,
          endereco_obra: ob.endereco_obra,
          observacoes: ob.observacoes,
          origem: "obra",
        });
      }
    }

    const lista = Array.from(mapa.values());

    // Regra crítica 2: ordenação estritamente cronológica por data de pedido / execução
    lista.sort((a, b) => {
      const dataA = new Date(a.data_pedido).getTime();
      const dataB = new Date(b.data_pedido).getTime();
      return ordemCrescente ? dataA - dataB : dataB - dataA;
    });

    return lista;
  }, [boardDb, obrasDb, ordemCrescente]);

  // Contadores para métricas de display
  const stats = useMemo(() => {
    let outCount = 0;
    let confirmadosCount = 0;
    let agendadosCount = 0;
    let aguardandoCount = 0;
    let concluidosCount = 0;

    for (const it of itensConsolidados) {
      if (it.is_out || it.status === "OUT") outCount++;
      else if (it.status === "CONFIRMADO") confirmadosCount++;
      else if (it.status === "AGENDADO") agendadosCount++;
      else if (it.status === "AGUARDANDO") aguardandoCount++;
      else if (it.status === "CONCLUÍDO") concluidosCount++;
    }

    return {
      total: itensConsolidados.length,
      out: outCount,
      confirmados: confirmadosCount,
      agendados: agendadosCount,
      aguardando: aguardandoCount,
      concluidos: concluidosCount,
    };
  }, [itensConsolidados]);

  // Filtragem dos voos
  const itensFiltrados = useMemo(() => {
    return itensConsolidados.filter((it) => {
      if (apenasOut && !it.is_out && it.status !== "OUT") return false;

      if (filtroStatus !== "TODOS") {
        if (filtroStatus === "OUT" && !(it.is_out || it.status === "OUT")) return false;
        if (filtroStatus !== "OUT" && it.status !== filtroStatus) return false;
      }

      if (busca.trim()) {
        const t = busca.toLowerCase();
        const casa =
          it.voo_codigo.toLowerCase().includes(t) ||
          it.cliente_nome.toLowerCase().includes(t) ||
          it.servico_natureza.toLowerCase().includes(t) ||
          (it.responsavel || "").toLowerCase().includes(t) ||
          (it.endereco_obra || "").toLowerCase().includes(t);
        if (!casa) return false;
      }

      return true;
    });
  }, [itensConsolidados, apenasOut, filtroStatus, busca]);

  // Mutation: Salvar Edição do Voo
  const salvarEdicao = useMutation({
    mutationFn: async (dados: FlightBoardItem) => {
      // 1. Atualiza na tabela de obras se existir obra_id
      if (dados.obra_id) {
        await supabase
          .from("obras")
          .update({
            tipo_servico: dados.servico_natureza,
            data_pedido: dados.data_pedido,
            prazo_dias: dados.prazo_dias,
            data_limite: dados.prazo_limite,
            escavacao_inicio: dados.escavacao_data || null,
            instalacao_inicio: dados.instalacao_data || null,
            responsavel: dados.responsavel || null,
            endereco_obra: dados.endereco_obra || null,
            observacoes: dados.observacoes || null,
            status_geral: dados.status === "OUT" ? "OUT" : dados.status,
          })
          .eq("id", dados.obra_id);
      }

      // 2. Upsert na tabela logistics_flight_board
      const payloadBoard = {
        id: dados.id,
        voo_codigo: dados.voo_codigo,
        obra_id: dados.obra_id || null,
        venda_id: dados.venda_id || null,
        cliente_id: dados.cliente_id || null,
        cliente_nome: dados.cliente_nome,
        servico_natureza: dados.servico_natureza,
        data_pedido: dados.data_pedido,
        prazo_dias: dados.prazo_dias,
        prazo_limite: dados.prazo_limite,
        escavacao_data: dados.escavacao_data || null,
        escavacao_status: dados.escavacao_status,
        instalacao_data: dados.instalacao_data || null,
        instalacao_status: dados.instalacao_status,
        os_instalacao: dados.os_instalacao || null,
        os_instalacao_status: dados.os_instalacao_status,
        os_logistica: dados.os_logistica || null,
        os_logistica_status: dados.os_logistica_status,
        os_acabamento: dados.os_acabamento || null,
        os_acabamento_status: dados.os_acabamento_status,
        status: dados.status,
        is_out: dados.is_out,
        responsavel: dados.responsavel || null,
        endereco_obra: dados.endereco_obra || null,
        observacoes: dados.observacoes || null,
      };

      const { error } = await supabase
        .from("logistics_flight_board" as never)
        .upsert(payloadBoard as never);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Voo / Operação atualizada com sucesso!");
      setDrawerAberto(false);
      qc.invalidateQueries({ queryKey: ["logistics_flight_board"] });
      qc.invalidateQueries({ queryKey: ["obras"] });
    },
    onError: (e: Error) => toast.error(`Erro ao salvar: ${e.message}`),
  });

  // Mutation: Criar Novo Voo
  const criarNovoVoo = useMutation({
    mutationFn: async () => {
      if (!novoItemForm.cliente_nome.trim()) {
        throw new Error("Informe o nome do cliente");
      }
      if (!novoItemForm.servico_natureza.trim()) {
        throw new Error("Informe a descrição do serviço / modelo");
      }

      const codigoFinal =
        novoItemForm.voo_codigo.trim() ||
        (novoItemForm.is_out
          ? `OUT-${String(Math.floor(Math.random() * 900) + 100)}`
          : `FL-${String(Math.floor(Math.random() * 900) + 100)}`);

      // 1. Cria a obra correspondente
      const { data: novaObra, error: erroObra } = await supabase
        .from("obras")
        .insert({
          numero: codigoFinal,
          cliente_id: novoItemForm.cliente_id || null,
          cliente_nome: novoItemForm.cliente_nome,
          tipo_servico: novoItemForm.servico_natureza,
          data_pedido: novoItemForm.data_pedido,
          prazo_dias: novoItemForm.prazo_dias,
          data_limite: novoItemForm.prazo_limite,
          responsavel: novoItemForm.responsavel || null,
          endereco_obra: novoItemForm.endereco_obra || null,
          observacoes: novoItemForm.observacoes || null,
          status_geral: novoItemForm.is_out ? "OUT" : novoItemForm.status,
          os_instalacao: novoItemForm.os_instalacao,
          os_logistica: novoItemForm.os_logistica,
          os_acabamento: novoItemForm.os_acabamento,
        })
        .select("id")
        .single();

      if (erroObra) throw erroObra;

      // 2. Registra na tabela logistics_flight_board
      const payload = {
        voo_codigo: codigoFinal,
        obra_id: novaObra.id,
        cliente_id: novoItemForm.cliente_id || null,
        cliente_nome: novoItemForm.cliente_nome,
        servico_natureza: novoItemForm.servico_natureza,
        data_pedido: novoItemForm.data_pedido,
        prazo_dias: novoItemForm.prazo_dias,
        prazo_limite: novoItemForm.prazo_limite,
        status: novoItemForm.is_out ? "OUT" : novoItemForm.status,
        is_out: novoItemForm.is_out,
        responsavel: novoItemForm.responsavel || null,
        endereco_obra: novoItemForm.endereco_obra || null,
        observacoes: novoItemForm.observacoes || null,
        os_instalacao: novoItemForm.os_instalacao,
        os_logistica: novoItemForm.os_logistica,
        os_acabamento: novoItemForm.os_acabamento,
      };

      const { error: erroBoard } = await supabase
        .from("logistics_flight_board" as never)
        .insert(payload as never);

      if (erroBoard) throw erroBoard;
    },
    onSuccess: () => {
      toast.success("Novo voo / operação registrado no Flight Board!");
      setNovoModalAberto(false);
      qc.invalidateQueries({ queryKey: ["logistics_flight_board"] });
      qc.invalidateQueries({ queryKey: ["obras"] });
    },
    onError: (e: Error) => toast.error(`Erro ao criar: ${e.message}`),
  });

  const abrirEdicaoLinha = (item: FlightBoardItem) => {
    setItemEditando({ ...item });
    setDrawerAberto(true);
  };

  const abrirVisualizacaoOS = (item: FlightBoardItem) => {
    setDocModalTipo("os");
    setDocModalId(item.obra_id || item.id);
    setDocModalAberto(true);
  };

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 p-3 md:p-6 space-y-5 font-sans">
      {/* ========================================================= */}
      {/* TOP HEADER: ESTILO PAINEL DE AEROPORTO FIDS               */}
      {/* ========================================================= */}
      <div className="bg-[#0B0F17] rounded-xl border border-slate-800 p-4 md:p-6 shadow-2xl relative overflow-hidden">
        {/* Glow de fundo âmbar aeroporto */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold tracking-widest bg-amber-950/80 text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                <Plane className="w-3.5 h-3.5 animate-pulse" />
                DEPARTURES & LOGISTICS DISPATCH TERMINAL
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                <Radio className="w-3 h-3 text-emerald-400 animate-ping" />
                LIVE RADAR ACTIVE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wider font-mono text-slate-50 uppercase flex items-center gap-2.5">
              <span>✈️ FLIGHT BOARD</span>
              <span className="text-slate-500 font-light">|</span>
              <span className="text-amber-400">CONTROLE DE LOGÍSTICA</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              SISTEMA INTEGRADO DE RASTREAMENTO DE OBRAS, EXECUÇÃO E SERVIÇOS CRÍTICOS (OUT)
            </p>
          </div>

          {/* Relógio Digital Split-Flap em Tempo Real */}
          <div className="flex items-center gap-3">
            <div className="bg-black/90 border border-amber-500/40 px-4 py-2 rounded-lg shadow-inner flex items-center gap-3 font-mono">
              <Clock className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-[10px] text-amber-500/70 tracking-widest uppercase">
                  LOCAL TIME (BRT)
                </div>
                <div className="text-xl md:text-2xl font-bold text-amber-400 tabular-nums tracking-widest">
                  {horaAeroporto || "12:00:00"}
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                setNovoItemForm({
                  voo_codigo: "",
                  cliente_nome: "",
                  cliente_id: "",
                  servico_natureza: "",
                  data_pedido: hojeISO(),
                  prazo_dias: 30,
                  prazo_limite: addDiasUteis(hojeISO(), 30),
                  status: "AGENDADO",
                  is_out: false,
                  responsavel: "",
                  endereco_obra: "",
                  observacoes: "",
                  os_instalacao: "OS-02",
                  os_logistica: "OL",
                  os_acabamento: "OS-03",
                });
                setNovoModalAberto(true);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold tracking-wider px-4 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              NOVO VOO / SERVIÇO
            </Button>
          </div>
        </div>

        {/* CONTADORES EM ESTILO DISPLAY FIDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-4">
          <div className="bg-[#06090F] border border-slate-800 rounded-lg p-2.5 font-mono">
            <div className="text-[10px] text-slate-400 tracking-wider uppercase">
              TOTAL OPERAÇÕES
            </div>
            <div className="text-xl font-bold text-slate-100 tabular-nums mt-0.5">
              {stats.total}
            </div>
          </div>

          <div
            onClick={() => setApenasOut((v) => !v)}
            className={`border rounded-lg p-2.5 font-mono cursor-pointer transition-all ${
              apenasOut || stats.out > 0
                ? "bg-amber-950/40 border-amber-500/70 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                : "bg-[#06090F] border-slate-800 text-slate-300"
            }`}
          >
            <div className="text-[10px] flex items-center justify-between tracking-wider uppercase">
              <span>ALERTA OUT</span>
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            </div>
            <div className="text-xl font-bold tabular-nums mt-0.5 text-amber-400 flex items-center gap-1.5">
              {stats.out}
              {apenasOut && <span className="text-[10px] text-amber-300">(FILTRADO)</span>}
            </div>
          </div>

          <div className="bg-[#06090F] border border-emerald-900/40 rounded-lg p-2.5 font-mono">
            <div className="text-[10px] text-emerald-400 tracking-wider uppercase">
              CONFIRMADOS
            </div>
            <div className="text-xl font-bold text-emerald-400 tabular-nums mt-0.5">
              {stats.confirmados}
            </div>
          </div>

          <div className="bg-[#06090F] border border-sky-900/40 rounded-lg p-2.5 font-mono">
            <div className="text-[10px] text-sky-400 tracking-wider uppercase">AGENDADOS</div>
            <div className="text-xl font-bold text-sky-400 tabular-nums mt-0.5">
              {stats.agendados}
            </div>
          </div>

          <div className="bg-[#06090F] border border-cyan-900/40 rounded-lg p-2.5 font-mono">
            <div className="text-[10px] text-cyan-400 tracking-wider uppercase">AGUARDANDO</div>
            <div className="text-xl font-bold text-cyan-400 tabular-nums mt-0.5">
              {stats.aguardando}
            </div>
          </div>

          <div className="bg-[#06090F] border border-slate-800 rounded-lg p-2.5 font-mono">
            <div className="text-[10px] text-slate-400 tracking-wider uppercase">CONCLUÍDOS</div>
            <div className="text-xl font-bold text-slate-300 tabular-nums mt-0.5">
              {stats.concluidos}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BARRA DE FILTROS & CONTROLE ESTILO TERMINAL               */}
      {/* ========================================================= */}
      <div className="bg-[#0B0F17] rounded-xl border border-slate-800 p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="SEARCH / BUSCAR VOO, CLIENTE, SERVIÇO, RESPONSÁVEL..."
              className="bg-[#06090F] border-slate-800 text-slate-100 placeholder:text-slate-500 font-mono text-xs pl-9 h-9 tracking-wider focus-visible:ring-amber-500/50"
            />
          </div>

          {/* Quick status filters */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {["TODOS", "OUT", "CONFIRMADO", "AGENDADO", "AGUARDANDO", "CONCLUÍDO"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setFiltroStatus(st);
                  if (st === "OUT") setApenasOut(true);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono tracking-wider transition-all whitespace-nowrap ${
                  filtroStatus === st
                    ? st === "OUT"
                      ? "bg-amber-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                      : "bg-slate-200 text-slate-950 font-bold"
                    : "bg-[#06090F] text-slate-400 hover:text-slate-200 border border-slate-800/80"
                }`}
              >
                {st === "OUT" ? "🚨 OUT (CRÍTICO)" : st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão de Ordenação Cronológica Estrita */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOrdemCrescente((v) => !v)}
            className="bg-[#06090F] border-slate-800 text-slate-300 font-mono text-xs hover:bg-[#131A26] hover:text-amber-400"
          >
            <ArrowUpDown className="w-3.5 h-3.5 mr-1 text-amber-400" />
            {ordemCrescente ? "CRONOLÓGICO (MAIS ANTIGO)" : "MAIS RECENTE"}
          </Button>

          {/* Botão de Formulários Emitidos */}
          <BotaoVisualizarFormulariosEmitidos
            variant="outline"
            size="sm"
            rotulo="Formulários"
            tipoInicial="os"
          />

          {/* Link para o Formulário Oficial de OS */}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="bg-[#06090F] border-slate-800 text-slate-300 font-mono text-xs hover:bg-[#131A26] hover:text-amber-400"
          >
            <Link to="/os/formulario">
              <FileText className="w-3.5 h-3.5 mr-1" />
              Formulário OS
            </Link>
          </Button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TABELA DE VOO OPERACIONAL (FIDS / SPLIT-FLAP DISPLAY)     */}
      {/* ========================================================= */}
      <div className="bg-[#0B0F17] rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <Table className="w-full text-left border-collapse">
            <TableHeader className="bg-[#05080E] border-b-2 border-amber-500/40">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-amber-400 font-mono text-[11px] tracking-widest uppercase font-bold py-3.5 w-32">
                  STATUS
                </TableHead>
                <TableHead className="text-slate-400 font-mono text-[11px] tracking-widest uppercase font-bold w-28">
                  DATA PEDIDO
                </TableHead>
                <TableHead className="text-slate-400 font-mono text-[11px] tracking-widest uppercase font-bold w-28">
                  PEDIDO / VOO
                </TableHead>
                <TableHead className="text-slate-400 font-mono text-[11px] tracking-widest uppercase font-bold min-w-[180px]">
                  CLIENTE
                </TableHead>
                <TableHead className="text-slate-400 font-mono text-[11px] tracking-widest uppercase font-bold min-w-[200px]">
                  SERVIÇO / NATUREZA
                </TableHead>
                <TableHead className="text-slate-400 font-mono text-[11px] tracking-widest uppercase font-bold w-36">
                  PRAZO RESTANTE
                </TableHead>
                <TableHead className="text-slate-400 font-mono text-[11px] tracking-widest uppercase font-bold w-32">
                  ESCAVAÇÃO / ET.1
                </TableHead>
                <TableHead className="text-slate-400 font-mono text-[11px] tracking-widest uppercase font-bold w-32">
                  INSTALAÇÃO / EXEC.
                </TableHead>
                <TableHead className="text-slate-400 font-mono text-[11px] tracking-widest uppercase font-bold w-28">
                  PRAZO LIMITE
                </TableHead>
                <TableHead className="text-slate-400 font-mono text-[11px] tracking-widest uppercase font-bold w-48 text-center">
                  ETAPAS TÉCNICAS (OS)
                </TableHead>
                <TableHead className="text-slate-400 font-mono text-[11px] tracking-widest uppercase font-bold w-28 text-right pr-4">
                  AÇÕES / OS
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {itensFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="h-32 text-center text-slate-500 font-mono text-sm"
                  >
                    NENHUM VOO OU OPERAÇÃO ENCONTRADA COM OS FILTROS APLICADOS.
                  </TableCell>
                </TableRow>
              ) : (
                itensFiltrados.map((item, idx) => {
                  const diasRestantes = calcularPrazoRestante(
                    item.prazo_limite,
                    item.data_pedido,
                    item.prazo_dias,
                  );

                  // Zebrado contrastante alternado estilo terminal
                  // Linha par: #06090F (preto absoluto) / Linha ímpar: #0E1522 (cinza azulado escuro)
                  const zebradoClass =
                    idx % 2 === 0
                      ? "bg-[#06090F]"
                      : "bg-[#0E1522]/90 border-t border-b border-[#141E30]";

                  return (
                    <TableRow
                      key={item.id}
                      onClick={() => abrirEdicaoLinha(item)}
                      className={`${zebradoClass} hover:bg-[#1A263D] hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] cursor-pointer transition-all duration-150 border-b border-slate-800/60`}
                    >
                      {/* 1. STATUS (Badge Luminoso) */}
                      <TableCell className="py-3 font-mono">
                        {item.is_out || item.status === "OUT" ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold tracking-widest bg-amber-950/90 text-amber-300 border border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)] animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            OUT
                          </span>
                        ) : item.status === "CONFIRMADO" ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold tracking-widest bg-emerald-950/90 text-emerald-300 border border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.35)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            CONFIRMADO
                          </span>
                        ) : item.status === "AGENDADO" ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold tracking-widest bg-sky-950/90 text-sky-300 border border-sky-500/80 shadow-[0_0_12px_rgba(14,165,233,0.35)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                            AGENDADO
                          </span>
                        ) : item.status === "CONCLUÍDO" ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold tracking-widest bg-slate-900 text-emerald-400 border border-slate-700">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            CONCLUÍDO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold tracking-widest bg-cyan-950/90 text-cyan-300 border border-cyan-500/80 shadow-[0_0_12px_rgba(6,182,212,0.35)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            AGUARDANDO
                          </span>
                        )}
                      </TableCell>

                      {/* 2. DATA DO PEDIDO */}
                      <TableCell className="font-mono text-xs text-slate-300 tracking-wider">
                        {dataBR(item.data_pedido)}
                      </TableCell>

                      {/* 3. PEDIDO / VOO */}
                      <TableCell>
                        <span className="font-mono font-bold text-amber-400 bg-black/70 px-2 py-1 rounded border border-amber-500/30 text-xs tracking-wider shadow-inner">
                          {item.voo_codigo}
                        </span>
                      </TableCell>

                      {/* 4. CLIENTE */}
                      <TableCell>
                        <div className="font-semibold text-slate-100 uppercase tracking-wide text-xs">
                          {item.cliente_nome}
                        </div>
                        {item.endereco_obra && (
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                            {item.endereco_obra}
                          </div>
                        )}
                      </TableCell>

                      {/* 5. SERVIÇO / NATUREZA */}
                      <TableCell>
                        <div className="text-xs text-slate-200 font-mono flex items-center gap-1.5">
                          {item.servico_natureza}
                          {item.is_out && (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-500/40">
                              [OUT]
                            </span>
                          )}
                        </div>
                        {item.responsavel && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            Resp: {item.responsavel}
                          </div>
                        )}
                      </TableCell>

                      {/* 6. PRAZO RESTANTE (Countdown) */}
                      <TableCell className="font-mono text-xs">
                        {diasRestantes < 0 ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-950/90 text-rose-300 border border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse font-bold">
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            {Math.abs(diasRestantes)}D ATRASADO
                          </span>
                        ) : diasRestantes === 0 ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] font-bold">
                            ⏳ HOJE (TODAY)
                          </span>
                        ) : diasRestantes <= 3 ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-950/80 text-orange-300 border border-orange-500/60 font-bold">
                            ⚡ {diasRestantes} DIAS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-500/50">
                            🟢 {diasRestantes} DIAS
                          </span>
                        )}
                      </TableCell>

                      {/* 7. ESCAVAÇÃO / ETAPA 1 */}
                      <TableCell className="font-mono text-xs text-slate-300">
                        {item.escavacao_data ? (
                          <div className="flex items-center gap-1">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                item.escavacao_status === "concluido"
                                  ? "bg-emerald-400"
                                  : "bg-cyan-400 animate-pulse"
                              }`}
                            />
                            <span>{dataBR(item.escavacao_data)}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px]">— PENDENTE —</span>
                        )}
                      </TableCell>

                      {/* 8. INSTALAÇÃO / EXECUÇÃO */}
                      <TableCell className="font-mono text-xs text-slate-300">
                        {item.instalacao_data ? (
                          <div className="flex items-center gap-1">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                item.instalacao_status === "concluido"
                                  ? "bg-emerald-400"
                                  : "bg-cyan-400 animate-pulse"
                              }`}
                            />
                            <span>{dataBR(item.instalacao_data)}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px]">— PENDENTE —</span>
                        )}
                      </TableCell>

                      {/* 9. PRAZO LIMITE */}
                      <TableCell className="font-mono text-xs text-amber-300 font-semibold tracking-wider">
                        {dataBR(item.prazo_limite)}
                      </TableCell>

                      {/* 10. ETAPAS TÉCNICAS (OS-02, OL, OS-03) */}
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5 font-mono text-[11px]">
                          {/* OS-02 */}
                          <span
                            title="OS-02: Instalação"
                            className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${
                              item.os_instalacao_status === "concluido"
                                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/70"
                                : "bg-black/80 text-slate-400 border-slate-700"
                            }`}
                          >
                            {item.os_instalacao || "OS-02"}
                          </span>

                          {/* OL */}
                          <span
                            title="OL: Logística & Transporte"
                            className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${
                              item.os_logistica_status === "concluido"
                                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/70"
                                : "bg-black/80 text-slate-400 border-slate-700"
                            }`}
                          >
                            {item.os_logistica || "OL"}
                          </span>

                          {/* OS-03 */}
                          <span
                            title="OS-03: Acabamento"
                            className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${
                              item.os_acabamento_status === "concluido"
                                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/70"
                                : "bg-black/80 text-slate-400 border-slate-700"
                            }`}
                          >
                            {item.os_acabamento || "OS-03"}
                          </span>
                        </div>
                      </TableCell>

                      {/* 11. AÇÕES / ABRIR OS */}
                      <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => abrirVisualizacaoOS(item)}
                            title="Visualizar e Imprimir Formulário de OS"
                            className="h-7 w-7 text-amber-400 hover:text-amber-300 hover:bg-amber-950/40"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => abrirEdicaoLinha(item)}
                            title="Editar detalhes do voo"
                            className="h-7 w-7 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* DRAWER LATERAL: EDIÇÃO RÁPIDA 100% COMPLETA (SHEET)       */}
      {/* ========================================================= */}
      <Sheet open={drawerAberto} onOpenChange={setDrawerAberto}>
        <SheetContent className="bg-[#0B0F17] text-slate-100 border-l border-slate-800 w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="border-b border-slate-800 pb-3">
            <SheetTitle className="font-mono text-amber-400 flex items-center gap-2">
              <Plane className="w-4 h-4" />
              <span>EDITAR VOO: {itemEditando?.voo_codigo}</span>
            </SheetTitle>
            <SheetDescription className="text-slate-400 text-xs font-mono">
              Atualize prazos, cronograma, status e etapas de execução do cliente.
            </SheetDescription>
          </SheetHeader>

          {itemEditando && (
            <div className="space-y-4 py-4 text-xs font-mono">
              {/* Flag Serviço OUT */}
              <div className="bg-[#06090F] p-3 rounded-lg border border-amber-500/40 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    SERVIÇO OUT (EMERGÊNCIA / CRÍTICO)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Marca para exibição destacada de manutenção química, reforma ou transporte.
                  </div>
                </div>
                <Switch
                  checked={itemEditando.is_out}
                  onCheckedChange={(checked) =>
                    setItemEditando({
                      ...itemEditando,
                      is_out: checked,
                      status: checked ? "OUT" : itemEditando.status === "OUT" ? "AGENDADO" : itemEditando.status,
                    })
                  }
                />
              </div>

              {/* Status do Voo */}
              <div className="space-y-1.5">
                <Label className="text-slate-300">Status Operacional</Label>
                <Select
                  value={itemEditando.status}
                  onValueChange={(val: FlightStatus) =>
                    setItemEditando({
                      ...itemEditando,
                      status: val,
                      is_out: val === "OUT" ? true : itemEditando.is_out,
                    })
                  }
                >
                  <SelectTrigger className="bg-[#06090F] border-slate-700 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0B0F17] border-slate-800 text-slate-100">
                    <SelectItem value="CONFIRMADO">🟢 CONFIRMADO</SelectItem>
                    <SelectItem value="AGENDADO">🔵 AGENDADO</SelectItem>
                    <SelectItem value="OUT">🚨 OUT (ALERTA CRÍTICO)</SelectItem>
                    <SelectItem value="AGUARDANDO">⚡ AGUARDANDO</SelectItem>
                    <SelectItem value="CONCLUÍDO">🏁 CONCLUÍDO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Identificador & Cliente */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Código de Voo</Label>
                  <Input
                    value={itemEditando.voo_codigo}
                    onChange={(e) =>
                      setItemEditando({ ...itemEditando, voo_codigo: e.target.value })
                    }
                    className="bg-[#06090F] border-slate-700 text-slate-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Cliente</Label>
                  <Input
                    value={itemEditando.cliente_nome}
                    onChange={(e) =>
                      setItemEditando({ ...itemEditando, cliente_nome: e.target.value })
                    }
                    className="bg-[#06090F] border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              {/* Serviço / Natureza */}
              <div className="space-y-1.5">
                <Label className="text-slate-300">Serviço / Natureza (Modelo Piscina)</Label>
                <Input
                  value={itemEditando.servico_natureza}
                  onChange={(e) =>
                    setItemEditando({ ...itemEditando, servico_natureza: e.target.value })
                  }
                  className="bg-[#06090F] border-slate-700 text-slate-100"
                />
              </div>

              {/* Prazos */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Data Pedido</Label>
                  <Input
                    type="date"
                    value={itemEditando.data_pedido}
                    onChange={(e) =>
                      setItemEditando({ ...itemEditando, data_pedido: e.target.value })
                    }
                    className="bg-[#06090F] border-slate-700 text-slate-100 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Prazo (Dias)</Label>
                  <Input
                    type="number"
                    value={itemEditando.prazo_dias}
                    onChange={(e) => {
                      const p = Number(e.target.value) || 0;
                      setItemEditando({
                        ...itemEditando,
                        prazo_dias: p,
                        prazo_limite: addDiasUteis(itemEditando.data_pedido, p),
                      });
                    }}
                    className="bg-[#06090F] border-slate-700 text-slate-100 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Prazo Limite</Label>
                  <Input
                    type="date"
                    value={itemEditando.prazo_limite}
                    onChange={(e) =>
                      setItemEditando({ ...itemEditando, prazo_limite: e.target.value })
                    }
                    className="bg-[#06090F] border-slate-700 text-slate-100 text-xs text-amber-400 font-bold"
                  />
                </div>
              </div>

              {/* Etapa 1: Escavação */}
              <div className="p-2.5 rounded-lg bg-[#06090F] border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-200">ETAPA 1: ESCAVAÇÃO</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] text-slate-400">Data Prevista</Label>
                    <Input
                      type="date"
                      value={itemEditando.escavacao_data || ""}
                      onChange={(e) =>
                        setItemEditando({ ...itemEditando, escavacao_data: e.target.value })
                      }
                      className="bg-[#0B0F17] border-slate-700 text-slate-100 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-slate-400">Status</Label>
                    <Select
                      value={itemEditando.escavacao_status}
                      onValueChange={(val: EtapaStatus) =>
                        setItemEditando({ ...itemEditando, escavacao_status: val })
                      }
                    >
                      <SelectTrigger className="bg-[#0B0F17] border-slate-700 text-slate-100 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0B0F17] border-slate-800 text-slate-100">
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="em_andamento">Em andamento</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Etapa 2: Instalação */}
              <div className="p-2.5 rounded-lg bg-[#06090F] border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-200">ETAPA 2: INSTALAÇÃO / BASE</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] text-slate-400">Data Prevista</Label>
                    <Input
                      type="date"
                      value={itemEditando.instalacao_data || ""}
                      onChange={(e) =>
                        setItemEditando({ ...itemEditando, instalacao_data: e.target.value })
                      }
                      className="bg-[#0B0F17] border-slate-700 text-slate-100 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-slate-400">Status</Label>
                    <Select
                      value={itemEditando.instalacao_status}
                      onValueChange={(val: EtapaStatus) =>
                        setItemEditando({ ...itemEditando, instalacao_status: val })
                      }
                    >
                      <SelectTrigger className="bg-[#0B0F17] border-slate-700 text-slate-100 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0B0F17] border-slate-800 text-slate-100">
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="em_andamento">Em andamento</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Etapas Técnicas (OS-02, OL, OS-03) */}
              <div className="p-2.5 rounded-lg bg-[#06090F] border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-200">
                  CÓDIGOS E STATUS DE OS (TÉCNICA)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[10px] text-slate-400">OS-02 (Instalação)</Label>
                    <Select
                      value={itemEditando.os_instalacao_status}
                      onValueChange={(val: EtapaStatus) =>
                        setItemEditando({ ...itemEditando, os_instalacao_status: val })
                      }
                    >
                      <SelectTrigger className="bg-[#0B0F17] border-slate-700 text-slate-100 text-[11px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0B0F17] border-slate-800 text-slate-100">
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-[10px] text-slate-400">OL (Logística)</Label>
                    <Select
                      value={itemEditando.os_logistica_status}
                      onValueChange={(val: EtapaStatus) =>
                        setItemEditando({ ...itemEditando, os_logistica_status: val })
                      }
                    >
                      <SelectTrigger className="bg-[#0B0F17] border-slate-700 text-slate-100 text-[11px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0B0F17] border-slate-800 text-slate-100">
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-[10px] text-slate-400">OS-03 (Acabamento)</Label>
                    <Select
                      value={itemEditando.os_acabamento_status}
                      onValueChange={(val: EtapaStatus) =>
                        setItemEditando({ ...itemEditando, os_acabamento_status: val })
                      }
                    >
                      <SelectTrigger className="bg-[#0B0F17] border-slate-700 text-slate-100 text-[11px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0B0F17] border-slate-800 text-slate-100">
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Responsável e Endereço */}
              <div className="space-y-1.5">
                <Label className="text-slate-300">Responsável Técnico</Label>
                <Input
                  value={itemEditando.responsavel || ""}
                  onChange={(e) =>
                    setItemEditando({ ...itemEditando, responsavel: e.target.value })
                  }
                  className="bg-[#06090F] border-slate-700 text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300">Endereço da Obra</Label>
                <Input
                  value={itemEditando.endereco_obra || ""}
                  onChange={(e) =>
                    setItemEditando({ ...itemEditando, endereco_obra: e.target.value })
                  }
                  className="bg-[#06090F] border-slate-700 text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300">Observações Operacionais</Label>
                <Textarea
                  value={itemEditando.observacoes || ""}
                  onChange={(e) =>
                    setItemEditando({ ...itemEditando, observacoes: e.target.value })
                  }
                  className="bg-[#06090F] border-slate-700 text-slate-100 text-xs"
                  rows={2}
                />
              </div>
            </div>
          )}

          <SheetFooter className="border-t border-slate-800 pt-3 flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => itemEditando && abrirVisualizacaoOS(itemEditando)}
              className="bg-[#06090F] border-slate-700 text-amber-400 hover:bg-slate-800 font-mono text-xs w-full sm:w-auto"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Ver OS Oficial
            </Button>
            <Button
              onClick={() => itemEditando && salvarEdicao.mutate(itemEditando)}
              disabled={salvarEdicao.isPending}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs w-full sm:w-auto"
            >
              {salvarEdicao.isPending ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ========================================================= */}
      {/* MODAL: NOVO VOO / SERVIÇO                                 */}
      {/* ========================================================= */}
      <Dialog open={novoModalAberto} onOpenChange={setNovoModalAberto}>
        <DialogContent className="bg-[#0B0F17] text-slate-100 border border-slate-800 max-w-lg font-mono text-xs">
          <DialogHeader>
            <DialogTitle className="text-amber-400 text-base font-bold flex items-center gap-2">
              <Plus className="w-4 h-4" /> NOVO VOO / OPERAÇÃO NO FLIGHT BOARD
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Cadastre um novo voo, instalação ou serviço OUT para controle logístico imediato.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Toggle OUT */}
            <div className="bg-[#06090F] p-2.5 rounded border border-amber-500/40 flex items-center justify-between">
              <div>
                <div className="font-bold text-amber-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  FLAG SERVIÇO OUT (EMERGÊNCIA/CRÍTICO)
                </div>
                <div className="text-[10px] text-slate-400">
                  Manutenção química, reforma de fibra ou transporte técnico.
                </div>
              </div>
              <Switch
                checked={novoItemForm.is_out}
                onCheckedChange={(c) =>
                  setNovoItemForm({
                    ...novoItemForm,
                    is_out: c,
                    status: c ? "OUT" : "AGENDADO",
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-slate-300 text-[11px]">Código Identificador</Label>
                <Input
                  value={novoItemForm.voo_codigo}
                  onChange={(e) =>
                    setNovoItemForm({ ...novoItemForm, voo_codigo: e.target.value })
                  }
                  placeholder={novoItemForm.is_out ? "OUT-042" : "FL-042"}
                  className="bg-[#06090F] border-slate-700 text-slate-100 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300 text-[11px]">Status Inicial</Label>
                <Select
                  value={novoItemForm.status}
                  onValueChange={(val: FlightStatus) =>
                    setNovoItemForm({
                      ...novoItemForm,
                      status: val,
                      is_out: val === "OUT" ? true : novoItemForm.is_out,
                    })
                  }
                >
                  <SelectTrigger className="bg-[#06090F] border-slate-700 text-slate-100 text-xs font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0B0F17] border-slate-800 text-slate-100 font-mono text-xs">
                    <SelectItem value="CONFIRMADO">🟢 CONFIRMADO</SelectItem>
                    <SelectItem value="AGENDADO">🔵 AGENDADO</SelectItem>
                    <SelectItem value="OUT">🚨 OUT (CRÍTICO)</SelectItem>
                    <SelectItem value="AGUARDANDO">⚡ AGUARDANDO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-slate-300 text-[11px]">Cliente</Label>
              <div className="flex gap-2">
                <Select
                  value={novoItemForm.cliente_id}
                  onValueChange={(cid) => {
                    const c = clientes.find((cli) => cli.id === cid);
                    setNovoItemForm({
                      ...novoItemForm,
                      cliente_id: cid,
                      cliente_nome: c?.nome || novoItemForm.cliente_nome,
                      endereco_obra: c?.endereco_obra || novoItemForm.endereco_obra,
                    });
                  }}
                >
                  <SelectTrigger className="bg-[#06090F] border-slate-700 text-slate-100 text-xs font-mono w-1/2">
                    <SelectValue placeholder="Selecionar cliente..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0B0F17] border-slate-800 text-slate-100 font-mono text-xs">
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={novoItemForm.cliente_nome}
                  onChange={(e) =>
                    setNovoItemForm({ ...novoItemForm, cliente_nome: e.target.value })
                  }
                  placeholder="Ou digite o nome do cliente..."
                  className="bg-[#06090F] border-slate-700 text-slate-100 text-xs font-mono flex-1"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-slate-300 text-[11px]">Serviço / Natureza</Label>
              <Input
                value={novoItemForm.servico_natureza}
                onChange={(e) =>
                  setNovoItemForm({ ...novoItemForm, servico_natureza: e.target.value })
                }
                placeholder="Ex: Piscina Splash Tradicional 6x3, Tratamento Químico OUT..."
                className="bg-[#06090F] border-slate-700 text-slate-100 text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-slate-300 text-[11px]">Data do Pedido</Label>
                <Input
                  type="date"
                  value={novoItemForm.data_pedido}
                  onChange={(e) =>
                    setNovoItemForm({
                      ...novoItemForm,
                      data_pedido: e.target.value,
                      prazo_limite: addDiasUteis(e.target.value, novoItemForm.prazo_dias),
                    })
                  }
                  className="bg-[#06090F] border-slate-700 text-slate-100 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300 text-[11px]">Prazo (Dias)</Label>
                <Input
                  type="number"
                  value={novoItemForm.prazo_dias}
                  onChange={(e) => {
                    const p = Number(e.target.value) || 0;
                    setNovoItemForm({
                      ...novoItemForm,
                      prazo_dias: p,
                      prazo_limite: addDiasUteis(novoItemForm.data_pedido, p),
                    });
                  }}
                  className="bg-[#06090F] border-slate-700 text-slate-100 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-slate-300 text-[11px]">Endereço da Obra / Local</Label>
              <Input
                value={novoItemForm.endereco_obra}
                onChange={(e) =>
                  setNovoItemForm({ ...novoItemForm, endereco_obra: e.target.value })
                }
                placeholder="Rua, Número, Bairro, Cidade..."
                className="bg-[#06090F] border-slate-700 text-slate-100 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-slate-300 text-[11px]">Responsável Técnico</Label>
              <Input
                value={novoItemForm.responsavel}
                onChange={(e) =>
                  setNovoItemForm({ ...novoItemForm, responsavel: e.target.value })
                }
                placeholder="Nome do encarregado ou técnico..."
                className="bg-[#06090F] border-slate-700 text-slate-100 text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-slate-800 pt-3">
            <Button
              variant="outline"
              onClick={() => setNovoModalAberto(false)}
              className="bg-[#06090F] border-slate-700 text-slate-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => criarNovoVoo.mutate()}
              disabled={criarNovoVoo.isPending}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono"
            >
              {criarNovoVoo.isPending ? "REGISTRANDO..." : "REGISTRAR NO FLIGHT BOARD"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL OFICIAL: VISUALIZADOR DE DOCUMENTOS (OS / VENDA)    */}
      {/* ========================================================= */}
      {docModalId && (
        <VisualizadorDocumentoModal
          open={docModalAberto}
          onOpenChange={setDocModalAberto}
          tipo={docModalTipo}
          id={docModalId}
        />
      )}
    </div>
  );
}
