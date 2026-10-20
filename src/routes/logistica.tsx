import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plane,
  Clock,
  CheckCircle2,
  Calendar,
  FileText,
  Printer,
  Pencil,
  Trash2,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Flame,
  RefreshCw,
  Wrench,
  Briefcase,
  Mail,
  Users,
  CheckCheck,
  LayoutGrid,
  Columns3,
  ListFilter,
  Sparkles,
  CalendarCheck2,
  AlertTriangle,
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
import {
  EMAIL_AGENDA_LOJA_PRINCIPAL,
  sincronizarFlightBoardBidirecionalGoogle,
  sincronizarItemFlightBoardGoogle,
} from "@/lib/google-agenda.functions";

export const Route = createFileRoute("/logistica")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "✈️ Flight Board — Quadro de Execução e Cronograma | Piscinow ERP" },
      {
        name: "description",
        content:
          "Quadro de Execução e Cronograma (Flight Board) com alto contraste, filtro obrigatório de OS emitida e sincronização bidirecional com Google Agenda.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <FlightBoardPage />
    </RequireAuth>
  ),
});

export type FlightStatus =
  | "EM_ANDAMENTO"
  | "AGENDADO"
  | "CONCLUIDO"
  | "AGUARDANDO"
  | "OUT";

export type EtapaStatus = "pendente" | "em_andamento" | "concluido";
export type ModalidadeExecucao = "com_execucao" | "sem_execucao";

export interface FlightBoardCardItem {
  id: string;
  origem: "flight_board" | "os_emitida" | "agenda_google";
  registro_id: string; // ID na tabela de origem (logistics_flight_board.id ou agenda_eventos.id ou ordens_servico.id)
  flight_board_id?: string | null;
  agenda_evento_id?: string | null;
  ordem_id?: string | null;
  os_numero?: string | null;
  obra_id?: string | null;
  venda_id?: string | null;
  cliente_id?: string | null;
  voo_codigo: string;
  cliente_nome: string;
  cliente_telefone?: string | null;
  cliente_cidade?: string | null;
  kit_titulo: string;
  etapa_execucao: string;
  data_execucao: string; // YYYY-MM-DD
  hora_inicio: string; // HH:mm
  hora_fim: string; // HH:mm
  status: FlightStatus;
  modalidade_execucao: ModalidadeExecucao;
  equipe_responsavel: string;
  emails_vinculados: string;
  observacoes: string;
  google_event_id?: string | null;
  google_calendar_id?: string | null;
  tem_os_emitida: boolean;
  os_status_original?: string | null;
  etapa_conferencia: EtapaStatus;
  etapa_separacao: EtapaStatus;
  etapa_carregamento: EtapaStatus;
  etapa_transito: EtapaStatus;
  etapa_entrega: EtapaStatus;
  etapa_instalacao: EtapaStatus;
  servico_out: boolean;
  motivo_out?: string | null;
}

const DIAS_SEMANA_CURTO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DIAS_SEMANA_LONGO = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

function normalizarStatusFlight(raw?: string | null, servicoOut?: boolean): FlightStatus {
  if (servicoOut) return "OUT";
  const s = (raw || "").toUpperCase().trim();
  if (s === "OUT" || s === "BLOQUEADO") return "OUT";
  if (
    s === "EM_ANDAMENTO" ||
    s === "EM ANDAMENTO" ||
    s === "CONFIRMADO" ||
    s === "EXECUCAO" ||
    s === "EM EXECUÇÃO"
  ) {
    return "EM_ANDAMENTO";
  }
  if (s === "CONCLUIDO" || s === "CONCLUÍDO" || s === "FINALIZADO" || s === "ENTREGUE") {
    return "CONCLUIDO";
  }
  if (s === "AGUARDANDO" || s === "PENDENTE") {
    return "AGUARDANDO";
  }
  return "AGENDADO";
}

function statusParaBancoFlight(status: FlightStatus): string {
  switch (status) {
    case "EM_ANDAMENTO":
      return "EM ANDAMENTO";
    case "CONCLUIDO":
      return "CONCLUÍDO";
    case "AGUARDANDO":
      return "AGUARDANDO";
    case "OUT":
      return "OUT";
    case "AGENDADO":
    default:
      return "AGENDADO";
  }
}

function getStatusBadgeConfig(status: FlightStatus) {
  switch (status) {
    case "EM_ANDAMENTO":
      return {
        label: "Em Andamento",
        badgeClass:
          "bg-emerald-600 text-white border-emerald-700 dark:bg-emerald-500 dark:text-slate-950 font-bold shadow-xs",
        stripeClass: "bg-emerald-600 dark:bg-emerald-500",
        headerBg: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
        headerText: "text-emerald-900 dark:text-emerald-200",
      };
    case "AGENDADO":
      return {
        label: "Agendado",
        badgeClass:
          "bg-blue-600 text-white border-blue-700 dark:bg-blue-500 dark:text-slate-950 font-bold shadow-xs",
        stripeClass: "bg-blue-600 dark:bg-blue-500",
        headerBg: "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800",
        headerText: "text-blue-900 dark:text-blue-200",
      };
    case "CONCLUIDO":
      return {
        label: "Concluído",
        badgeClass:
          "bg-violet-600 text-white border-violet-700 dark:bg-violet-500 dark:text-slate-950 font-bold shadow-xs",
        stripeClass: "bg-violet-600 dark:bg-violet-500",
        headerBg: "bg-violet-50 dark:bg-violet-950/50 border-violet-200 dark:border-violet-800",
        headerText: "text-violet-900 dark:text-violet-200",
      };
    case "AGUARDANDO":
      return {
        label: "Aguardando",
        badgeClass:
          "bg-amber-500 text-slate-950 border-amber-600 dark:bg-amber-400 dark:text-slate-950 font-bold shadow-xs",
        stripeClass: "bg-amber-500 dark:bg-amber-400",
        headerBg: "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
        headerText: "text-amber-900 dark:text-amber-200",
      };
    case "OUT":
      return {
        label: "OUT / Impedido",
        badgeClass:
          "bg-red-600 text-white border-red-700 dark:bg-red-500 dark:text-white font-bold shadow-xs",
        stripeClass: "bg-red-600 dark:bg-red-500",
        headerBg: "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800",
        headerText: "text-red-900 dark:text-red-200",
      };
  }
}

function getModalidadeBadgeConfig(modalidade: ModalidadeExecucao) {
  if (modalidade === "com_execucao") {
    return {
      label: "Com Execução",
      sublabel: "Campo / Instalação",
      badgeClass:
        "bg-teal-700 text-white border-teal-800 hover:bg-teal-800 dark:bg-teal-500 dark:text-slate-950 dark:border-teal-400 font-bold",
      icon: Wrench,
    };
  }
  return {
    label: "Sem Execução",
    sublabel: "Reunião / Aviso / Compromisso",
    badgeClass:
      "bg-slate-700 text-white border-slate-800 hover:bg-slate-800 dark:bg-slate-300 dark:text-slate-950 dark:border-slate-200 font-bold",
    icon: Briefcase,
  };
}

/**
 * Extrai metadados embutidos em observações/descrição para manter compatibilidade total
 * mesmo antes de migrações extras rodarem.
 */
function parseMetadadosTexto(texto?: string | null): {
  modalidade?: ModalidadeExecucao;
  osNumero?: string;
  etapaExecucao?: string;
  horaInicio?: string;
  horaFim?: string;
  emailsVinculados?: string;
  equipe?: string;
  statusFlight?: FlightStatus;
  textoLimpo: string;
} {
  const raw = texto || "";
  let modalidade: ModalidadeExecucao | undefined;
  if (/\[SEM_EXECUCAO\]/i.test(raw)) modalidade = "sem_execucao";
  else if (/\[COM_EXECUCAO\]/i.test(raw)) modalidade = "com_execucao";

  const osMatch = raw.match(/\[OS:([^\]]+)\]/i);
  const etapaMatch = raw.match(/\[ETAPA:([^\]]+)\]/i);
  const horarioMatch = raw.match(/\[HORARIO:(\d{2}:\d{2})-(\d{2}:\d{2})\]/i);
  const emailsMatch = raw.match(/\[EMAILS:([^\]]+)\]/i);
  const equipeMatch = raw.match(/\[EQUIPE:([^\]]+)\]/i);
  const statusMatch = raw.match(/\[STATUS_FB:([^\]]+)\]/i);

  const textoLimpo = raw
    .replace(/\[(COM_EXECUCAO|SEM_EXECUCAO)\]/gi, "")
    .replace(/\[OS:[^\]]+\]/gi, "")
    .replace(/\[ETAPA:[^\]]+\]/gi, "")
    .replace(/\[HORARIO:[^\]]+\]/gi, "")
    .replace(/\[EMAILS:[^\]]+\]/gi, "")
    .replace(/\[EQUIPE:[^\]]+\]/gi, "")
    .replace(/\[STATUS_FB:[^\]]+\]/gi, "")
    .trim();

  return {
    modalidade,
    osNumero: osMatch?.[1]?.trim(),
    etapaExecucao: etapaMatch?.[1]?.trim(),
    horaInicio: horarioMatch?.[1]?.trim(),
    horaFim: horarioMatch?.[2]?.trim(),
    emailsVinculados: emailsMatch?.[1]?.trim(),
    equipe: equipeMatch?.[1]?.trim(),
    statusFlight: statusMatch?.[1] ? normalizarStatusFlight(statusMatch[1]) : undefined,
    textoLimpo,
  };
}

function empacotarMetadadosTexto(params: {
  modalidade: ModalidadeExecucao;
  osNumero?: string | null;
  etapaExecucao?: string | null;
  horaInicio?: string | null;
  horaFim?: string | null;
  emailsVinculados?: string | null;
  equipe?: string | null;
  statusFlight?: FlightStatus;
  observacoesLimpa?: string | null;
}): string {
  const tags: string[] = [
    params.modalidade === "sem_execucao" ? "[SEM_EXECUCAO]" : "[COM_EXECUCAO]",
  ];
  if (params.osNumero?.trim()) tags.push(`[OS:${params.osNumero.trim()}]`);
  if (params.etapaExecucao?.trim()) tags.push(`[ETAPA:${params.etapaExecucao.trim()}]`);
  if (params.horaInicio && params.horaFim) {
    tags.push(`[HORARIO:${params.horaInicio}-${params.horaFim}]`);
  }
  if (params.emailsVinculados?.trim()) tags.push(`[EMAILS:${params.emailsVinculados.trim()}]`);
  if (params.equipe?.trim()) tags.push(`[EQUIPE:${params.equipe.trim()}]`);
  if (params.statusFlight) tags.push(`[STATUS_FB:${params.statusFlight}]`);

  const corpo = (params.observacoesLimpa || "").trim();
  return corpo ? `${tags.join(" ")} ${corpo}` : tags.join(" ");
}

function adicionarDiasISO(baseISO: string, deltaDias: number): string {
  const partes = baseISO.split("-").map(Number);
  const dt = new Date(partes[0], (partes[1] || 1) - 1, partes[2] || 1, 12, 0, 0);
  dt.setDate(dt.getDate() + deltaDias);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function obterInicioSemanaSegundaISO(refISO: string): string {
  const partes = refISO.split("-").map(Number);
  const dt = new Date(partes[0], (partes[1] || 1) - 1, partes[2] || 1, 12, 0, 0);
  const day = dt.getDay(); // 0 = Dom, 1 = Seg...
  const diff = day === 0 ? -6 : 1 - day;
  dt.setDate(dt.getDate() + diff);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatarDiaColuna(iso: string): {
  diaSemanaCurto: string;
  diaSemanaLongo: string;
  diaMes: string;
  ehHoje: boolean;
} {
  const partes = iso.split("-").map(Number);
  const dt = new Date(partes[0], (partes[1] || 1) - 1, partes[2] || 1, 12, 0, 0);
  const diaSemanaCurto = DIAS_SEMANA_CURTO[dt.getDay()] || "";
  const diaSemanaLongo = DIAS_SEMANA_LONGO[dt.getDay()] || "";
  const diaMes = `${String(partes[2]).padStart(2, "0")}/${String(partes[1]).padStart(2, "0")}`;
  return {
    diaSemanaCurto,
    diaSemanaLongo,
    diaMes,
    ehHoje: iso === hojeISO(),
  };
}

/**
 * Verifica se o status de uma Ordem de Serviço (ordens_servico) representa
 * uma OS formalmente emitida.
 */
function isOsFormalmenteEmitida(status?: string | null): boolean {
  const s = (status || "").toLowerCase().trim();
  if (!s) return false;
  return s !== "orcamento" && s !== "orçamento" && s !== "cancelado" && s !== "cancelada";
}

function FlightBoardPage() {
  const queryClient = useQueryClient();
  const [relogio, setRelogio] = useState<string>("");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [filtroModalidade, setFiltroModalidade] = useState<string>("TODAS");
  const [modoVisao, setModoVisao] = useState<"CRONOGRAMA_DIAS" | "COLUNAS_STATUS" | "LISTA">(
    "CRONOGRAMA_DIAS"
  );
  const [semanaBaseISO, setSemanaBaseISO] = useState<string>(() =>
    obterInicioSemanaSegundaISO(hojeISO())
  );
  const [ultimaSyncGoogle, setUltimaSyncGoogle] = useState<string | null>(null);

  // Modal de Visualização de Documento (OS / Pedido)
  const [docModalAberto, setDocModalAberto] = useState(false);
  const [docModalTipo, setDocModalTipo] = useState<"os" | "venda">("os");
  const [docModalId, setDocModalId] = useState<string>("");

  // Modal Unificado de Incluir / Editar Card no Flight Board
  const [editorModalAberto, setEditorModalAberto] = useState(false);
  const [modoEditor, setModoEditor] = useState<"INCLUIR" | "EDITAR">("INCLUIR");
  const [cardEditando, setCardEditando] = useState<FlightBoardCardItem | null>(null);

  // Campos do formulário de Incluir / Editar
  const [formTipoVinculo, setFormTipoVinculo] = useState<"OS_EMITIDA" | "COMPROMISSO_AGENDA">(
    "OS_EMITIDA"
  );
  const [formOrdemId, setFormOrdemId] = useState<string>("");
  const [formTituloEvento, setFormTituloEvento] = useState<string>("");
  const [formEtapaExecucao, setFormEtapaExecucao] = useState<string>(
    "Instalação e Execução Técnica"
  );
  const [formDataExecucao, setFormDataExecucao] = useState<string>(hojeISO());
  const [formHoraInicio, setFormHoraInicio] = useState<string>("08:00");
  const [formHoraFim, setFormHoraFim] = useState<string>("17:00");
  const [formStatus, setFormStatus] = useState<FlightStatus>("AGENDADO");
  const [formModalidade, setFormModalidade] = useState<ModalidadeExecucao>("com_execucao");
  const [formEquipe, setFormEquipe] = useState<string>("");
  const [formEmailsVinculados, setFormEmailsVinculados] = useState<string>(
    EMAIL_AGENDA_LOJA_PRINCIPAL
  );
  const [formObservacoes, setFormObservacoes] = useState<string>("");
  const [formServicoOut, setFormServicoOut] = useState<boolean>(false);
  const [formMotivoOut, setFormMotivoOut] = useState<string>("");

  // Modal de Confirmação de Exclusão
  const [cardParaExcluir, setCardParaExcluir] = useState<FlightBoardCardItem | null>(null);

  // Relógio em tempo real
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setRelogio(
        now.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dias da semana exibidos nas colunas do Cronograma (7 dias: Seg a Dom)
  const diasDaSemanaISO = useMemo(() => {
    return Array.from({ length: 7 }, (_, idx) => adicionarDiasISO(semanaBaseISO, idx));
  }, [semanaBaseISO]);

  // ============================================================================
  // CONSULTA PRINCIPAL:
  // 1. Carrega SOMENTE Ordens de Serviço (ordens_servico) formalmente emitidas.
  // 2. Carrega agendamentos do logistics_flight_board que pertençam a uma OS emitida.
  // 3. Carrega compromissos do Google Calendar / agenda_eventos (Com ou Sem Execução).
  // ============================================================================
  const {
    data: dadosFlightBoard,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["logistics_flight_board_v2"],
    queryFn: async () => {
      // 1. Buscar todas as Ordens de Serviço emitidas
      const { data: ordensRaw, error: ordensErr } = await supabase
        .from("ordens_servico")
        .select(
          "id, numero, cliente_id, descricao, status, prioridade, responsavel, data_agendada, created_at, valor, observacoes, clientes(id, nome, telefone, cidade, email)"
        )
        .order("created_at", { ascending: false });

      if (ordensErr) {
        console.error("Erro ao carregar ordens_servico:", ordensErr);
      }

      const ordensEmitidas = (ordensRaw || []).filter((os: any) =>
        isOsFormalmenteEmitida(os.status)
      );

      // 2. Buscar obras e vendas para cruzar vínculo de OS emitida com obra/venda quando houver
      const [{ data: obrasRaw }, { data: vendasRaw }, { data: boardRaw }, { data: agendaRaw }, { data: funcionariosRaw }] =
        await Promise.all([
          supabase
            .from("obras")
            .select(
              "id, numero, cliente_id, venda_id, tipo_servico, status_geral, data_inicio, data_limite, responsavel, endereco_obra, observacoes, clientes(id, nome, telefone, cidade, email)"
            ),
          supabase
            .from("vendas")
            .select(
              "id, numero, cliente_id, observacoes, prazo_entrega, status_pedido"
            )
            .neq("status_pedido", "cancelada"),
          supabase
            .from("logistics_flight_board")
            .select(
              "*, obras(id, numero, tipo_servico, responsavel, data_limite, venda_id), vendas(id, numero, observacoes, prazo_entrega), clientes(id, nome, telefone, cidade, email)"
            )
            .order("created_at", { ascending: false }),
          supabase
            .from("agenda_eventos")
            .select("*")
            .neq("status", "cancelado")
            .order("inicio", { ascending: true }),
          supabase
            .from("funcionarios")
            .select("id, nome, email, cargo, ativo")
            .eq("ativo", true),
        ]);

      const emailsEquipeAtiva = Array.from(
        new Set([
          EMAIL_AGENDA_LOJA_PRINCIPAL,
          ...(funcionariosRaw || [])
            .map((f: any) => f.email?.trim())
            .filter(Boolean),
        ])
      );

      // Mapear OS emitida por ID, por número e por cliente_id
      const osPorId = new Map<string, any>();
      const osPorNumero = new Map<string, any>();
      const osPorClienteId = new Map<string, any[]>();

      for (const os of ordensEmitidas) {
        osPorId.set(os.id, os);
        if (os.numero) osPorNumero.set(String(os.numero).toUpperCase().trim(), os);
        if (os.cliente_id) {
          const lista = osPorClienteId.get(os.cliente_id) || [];
          lista.push(os);
          osPorClienteId.set(os.cliente_id, lista);
        }
      }

      // Mapear obras por cliente_id e por id
      const obraPorId = new Map<string, any>();
      const obraPorClienteId = new Map<string, any>();
      for (const ob of obrasRaw || []) {
        obraPorId.set(ob.id, ob);
        if (ob.cliente_id && !obraPorClienteId.has(ob.cliente_id)) {
          obraPorClienteId.set(ob.cliente_id, ob);
        }
      }

      const vendaPorId = new Map<string, any>();
      for (const vd of vendasRaw || []) {
        vendaPorId.set(vd.id, vd);
      }

      const cards: FlightBoardCardItem[] = [];
      const ordensJaNoBoard = new Set<string>();
      const googleEventIdsJaNoBoard = new Set<string>();

      // 3. Processar registros de logistics_flight_board
      // REGRA DE OURO #2: Somente clientes/pedidos cuja OS já tenha sido formalmente emitida podem constar!
      for (const row of (boardRaw || []) as any[]) {
        const meta = parseMetadadosTexto(row.observacoes);

        // Tentar localizar a OS formalmente emitida correspondente a este registro
        let osVinculada: any = null;
        if (row.ordem_id && osPorId.has(row.ordem_id)) {
          osVinculada = osPorId.get(row.ordem_id);
        } else if (row.os_numero && osPorNumero.has(String(row.os_numero).toUpperCase().trim())) {
          osVinculada = osPorNumero.get(String(row.os_numero).toUpperCase().trim());
        } else if (meta.osNumero && osPorNumero.has(meta.osNumero.toUpperCase().trim())) {
          osVinculada = osPorNumero.get(meta.osNumero.toUpperCase().trim());
        } else if (row.cliente_id && osPorClienteId.has(row.cliente_id)) {
          osVinculada = osPorClienteId.get(row.cliente_id)![0];
        }

        // Filtro Obrigatório: Se não possui OS formalmente emitida, NÃO entra no Flight Board!
        if (!osVinculada || !isOsFormalmenteEmitida(osVinculada.status)) {
          continue;
        }

        ordensJaNoBoard.add(osVinculada.id);
        if (row.google_event_id) {
          googleEventIdsJaNoBoard.add(row.google_event_id);
        }

        const obra =
          (row.obra_id && obraPorId.get(row.obra_id)) ||
          row.obras ||
          (osVinculada.cliente_id ? obraPorClienteId.get(osVinculada.cliente_id) : null);

        const clienteObj = row.clientes || osVinculada.clientes || obra?.clientes;
        const numeroOsExibicao =
          row.os_numero || meta.osNumero || osVinculada.numero || osVinculada.id.slice(0, 8);

        const dataExec =
          row.data_execucao ||
          row.previsao_entrega ||
          (osVinculada.data_agendada ? String(osVinculada.data_agendada).slice(0, 10) : null) ||
          (osVinculada.created_at ? String(osVinculada.created_at).slice(0, 10) : null) ||
          hojeISO();

        const modalidade: ModalidadeExecucao =
          row.modalidade_execucao === "sem_execucao" || meta.modalidade === "sem_execucao"
            ? "sem_execucao"
            : "com_execucao";

        const statusNorm = normalizarStatusFlight(
          meta.statusFlight || row.status_voo,
          Boolean(row.servico_out)
        );

        const emailsCard =
          row.emails_vinculados ||
          meta.emailsVinculados ||
          [EMAIL_AGENDA_LOJA_PRINCIPAL, clienteObj?.email].filter(Boolean).join(", ");

        cards.push({
          id: `fb-${row.id}`,
          origem: "flight_board",
          registro_id: row.id,
          flight_board_id: row.id,
          ordem_id: osVinculada.id,
          os_numero: numeroOsExibicao,
          obra_id: row.obra_id || obra?.id || null,
          venda_id: row.venda_id || obra?.venda_id || null,
          cliente_id: row.cliente_id || osVinculada.cliente_id || clienteObj?.id || null,
          voo_codigo: row.voo_codigo || `OS-${numeroOsExibicao}`,
          cliente_nome:
            row.cliente_nome || clienteObj?.nome || "Cliente com OS Emitida",
          cliente_telefone: clienteObj?.telefone || null,
          cliente_cidade: clienteObj?.cidade || null,
          kit_titulo:
            row.kit_titulo ||
            osVinculada.descricao ||
            obra?.tipo_servico ||
            "Ordem de Serviço Emitida",
          etapa_execucao:
            row.etapa_execucao ||
            meta.etapaExecucao ||
            osVinculada.descricao ||
            "Execução de OS",
          data_execucao: String(dataExec).slice(0, 10),
          hora_inicio: row.hora_inicio || meta.horaInicio || "08:00",
          hora_fim: row.hora_fim || meta.horaFim || "17:00",
          status: statusNorm,
          modalidade_execucao: modalidade,
          equipe_responsavel:
            row.equipe_responsavel ||
            meta.equipe ||
            osVinculada.responsavel ||
            obra?.responsavel ||
            "Equipe Técnica",
          emails_vinculados: emailsCard,
          observacoes: meta.textoLimpo || osVinculada.observacoes || "",
          google_event_id: row.google_event_id || null,
          google_calendar_id: row.google_calendar_id || EMAIL_AGENDA_LOJA_PRINCIPAL,
          tem_os_emitida: true,
          os_status_original: osVinculada.status,
          etapa_conferencia: (row.etapa_conferencia as EtapaStatus) || "pendente",
          etapa_separacao: (row.etapa_separacao as EtapaStatus) || "pendente",
          etapa_carregamento: (row.etapa_carregamento as EtapaStatus) || "pendente",
          etapa_transito: (row.etapa_transito as EtapaStatus) || "pendente",
          etapa_entrega: (row.etapa_entrega as EtapaStatus) || "pendente",
          etapa_instalacao: (row.etapa_instalacao as EtapaStatus) || "pendente",
          servico_out: Boolean(row.servico_out),
          motivo_out: row.motivo_out || null,
        });
      }

      // 4. Incluir automaticamente no Flight Board todas as Ordens de Serviço (ordens_servico)
      // formalmente emitidas que ainda não possuam linha dedicada em logistics_flight_board
      for (const os of ordensEmitidas) {
        if (ordensJaNoBoard.has(os.id)) continue;

        const obra = os.cliente_id ? obraPorClienteId.get(os.cliente_id) : null;
        const venda = obra?.venda_id ? vendaPorId.get(obra.venda_id) : null;
        const clienteObj = os.clientes || obra?.clientes;
        const meta = parseMetadadosTexto(os.observacoes);

        const dataExec =
          (os.data_agendada ? String(os.data_agendada).slice(0, 10) : null) ||
          (obra?.data_limite
            ? String(obra.data_limite).slice(0, 10)
            : null) ||
          (venda?.prazo_entrega
            ? String(venda.prazo_entrega).slice(0, 10)
            : null) ||
          (os.created_at ? addDiasUteis(String(os.created_at).slice(0, 10), 2) : hojeISO());

        let statusInicial: FlightStatus = "AGENDADO";
        const stLower = String(os.status || "").toLowerCase();
        if (stLower === "em_andamento" || stLower === "em andamento") {
          statusInicial = "EM_ANDAMENTO";
        } else if (stLower === "concluido" || stLower === "concluído" || stLower === "finalizado") {
          statusInicial = "CONCLUIDO";
        } else if (meta.statusFlight) {
          statusInicial = meta.statusFlight;
        }

        const numeroOs = os.numero || os.id.slice(0, 8).toUpperCase();

        cards.push({
          id: `os-${os.id}`,
          origem: "os_emitida",
          registro_id: os.id,
          flight_board_id: null,
          ordem_id: os.id,
          os_numero: numeroOs,
          obra_id: obra?.id || null,
          venda_id: obra?.venda_id || null,
          cliente_id: os.cliente_id || clienteObj?.id || null,
          voo_codigo: `OS-${numeroOs}`,
          cliente_nome: clienteObj?.nome || "Cliente OS Emitida",
          cliente_telefone: clienteObj?.telefone || null,
          cliente_cidade: clienteObj?.cidade || null,
          kit_titulo: os.descricao || obra?.tipo_servico || "Ordem de Serviço",
          etapa_execucao:
            meta.etapaExecucao || os.descricao || "Execução Técnica de Ordem de Serviço",
          data_execucao: String(dataExec).slice(0, 10),
          hora_inicio: meta.horaInicio || "08:00",
          hora_fim: meta.horaFim || "17:00",
          status: statusInicial,
          modalidade_execucao: meta.modalidade || "com_execucao",
          equipe_responsavel:
            meta.equipe ||
            os.responsavel ||
            obra?.equipe_instalacao ||
            obra?.responsavel_obra ||
            "Equipe Técnica",
          emails_vinculados:
            meta.emailsVinculados ||
            [EMAIL_AGENDA_LOJA_PRINCIPAL, clienteObj?.email].filter(Boolean).join(", "),
          observacoes: meta.textoLimpo || "",
          google_event_id: null,
          google_calendar_id: EMAIL_AGENDA_LOJA_PRINCIPAL,
          tem_os_emitida: true,
          os_status_original: os.status,
          etapa_conferencia: "concluido",
          etapa_separacao: statusInicial === "CONCLUIDO" ? "concluido" : "em_andamento",
          etapa_carregamento: statusInicial === "CONCLUIDO" ? "concluido" : "pendente",
          etapa_transito: statusInicial === "CONCLUIDO" ? "concluido" : "pendente",
          etapa_entrega: statusInicial === "CONCLUIDO" ? "concluido" : "pendente",
          etapa_instalacao:
            statusInicial === "CONCLUIDO"
              ? "concluido"
              : statusInicial === "EM_ANDAMENTO"
                ? "em_andamento"
                : "pendente",
          servico_out: false,
          motivo_out: null,
        });
      }

      // 5. Incluir compromissos vindos do Google Calendar / agenda_eventos
      // (Requisito 4: Qualquer compromisso ou evento criado no Google Calendar deve ser puxado
      // para o Flight Board com tag "Com Execução" ou "Sem Execução")
      for (const ev of (agendaRaw || []) as any[]) {
        if (ev.google_event_id && googleEventIdsJaNoBoard.has(ev.google_event_id)) {
          continue;
        }

        const meta = parseMetadadosTexto(ev.descricao);
        // Se este evento de agenda já referencia uma OS que já está exibida na mesma data, evitamos duplicar
        if (meta.osNumero) {
          const osMatch = osPorNumero.get(meta.osNumero.toUpperCase());
          if (osMatch && ordensJaNoBoard.has(osMatch.id)) {
            continue;
          }
        }

        const temTagComExec =
          meta.modalidade === "com_execucao" ||
          /\[(OS|FLIGHT|COM_EXECUCAO)/i.test(ev.titulo || "") ||
          (ev.tipo === "trabalho" && meta.modalidade !== "sem_execucao");

        const modalidade: ModalidadeExecucao = temTagComExec ? "com_execucao" : "sem_execucao";

        let statusEvento: FlightStatus = "AGENDADO";
        if (ev.status === "concluido") statusEvento = "CONCLUIDO";
        else if (meta.statusFlight) statusEvento = meta.statusFlight;

        const horaIni = ev.hora ? String(ev.hora).slice(0, 5) : meta.horaInicio || "09:00";
        const horaFim = meta.horaFim || "10:00";

        cards.push({
          id: `ag-${ev.id}`,
          origem: "agenda_google",
          registro_id: ev.id,
          agenda_evento_id: ev.id,
          ordem_id: null,
          os_numero: meta.osNumero || null,
          obra_id: null,
          venda_id: null,
          cliente_id: null,
          voo_codigo: ev.google_event_id ? "G-CAL" : "AGENDA",
          cliente_nome: ev.titulo || "Compromisso Google Agenda",
          cliente_telefone: null,
          cliente_cidade: null,
          kit_titulo:
            modalidade === "com_execucao"
              ? "Atividade de Campo / Execução (Agenda)"
              : "Compromisso / Reunião / Aviso (Google Agenda)",
          etapa_execucao:
            meta.etapaExecucao ||
            meta.textoLimpo ||
            (modalidade === "com_execucao"
              ? "Execução / Visita Técnica"
              : "Reunião / Compromisso Sem Execução"),
          data_execucao: String(ev.data || hojeISO()).slice(0, 10),
          hora_inicio: horaIni,
          hora_fim: horaFim,
          status: statusEvento,
          modalidade_execucao: modalidade,
          equipe_responsavel: meta.equipe || "Agenda da Loja",
          emails_vinculados: meta.emailsVinculados || EMAIL_AGENDA_LOJA_PRINCIPAL,
          observacoes: meta.textoLimpo || "",
          google_event_id: ev.google_event_id || null,
          google_calendar_id: ev.google_calendar_id || EMAIL_AGENDA_LOJA_PRINCIPAL,
          tem_os_emitida: Boolean(meta.osNumero),
          os_status_original: null,
          etapa_conferencia: "pendente",
          etapa_separacao: "pendente",
          etapa_carregamento: "pendente",
          etapa_transito: "pendente",
          etapa_entrega: "pendente",
          etapa_instalacao: "pendente",
          servico_out: false,
          motivo_out: null,
        });
      }

      // Ordenar por data_execucao e hora_inicio
      cards.sort((a, b) => {
        const cmpData = a.data_execucao.localeCompare(b.data_execucao);
        if (cmpData !== 0) return cmpData;
        return a.hora_inicio.localeCompare(b.hora_inicio);
      });

      return {
        cards,
        ordensEmitidas,
        emailsEquipeAtiva,
      };
    },
  });

  const cards = dadosFlightBoard?.cards ?? [];
  const ordensEmitidas = dadosFlightBoard?.ordensEmitidas ?? [];
  const emailsEquipeAtiva = dadosFlightBoard?.emailsEquipeAtiva ?? [EMAIL_AGENDA_LOJA_PRINCIPAL];

  // ============================================================================
  // SINCRONIZAÇÃO BIDIRECIONAL COM GOOGLE CALENDAR
  // ============================================================================
  const syncGoogleMutation = useMutation({
    mutationFn: async (silencioso?: boolean) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) {
        if (!silencioso) {
          toast.error("Sessão expirada. Faça login novamente para sincronizar.");
        }
        return null;
      }

      const resultado = await sincronizarFlightBoardBidirecionalGoogle({
        data: {
          userId,
          calendarIds: emailsEquipeAtiva,
        },
      });
      return { resultado, silencioso };
    },
    onSuccess: (payload) => {
      const agora = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setUltimaSyncGoogle(agora);
      queryClient.invalidateQueries({ queryKey: ["logistics_flight_board_v2"] });

      if (payload && !payload.silencioso) {
        const res = payload.resultado;
        if (res?.sucesso) {
          toast.success(
            `Google Agenda sincronizado (${EMAIL_AGENDA_LOJA_PRINCIPAL})! ${res.importadosDoGoogle} puxado(s) do Google e ${res.enviadosParaGoogle} enviado(s).`
          );
        } else {
          toast.warning(
            res?.mensagem ||
              "Sincronização local concluída. Verifique as credenciais Google se desejar espelhamento externo em tempo real."
          );
        }
      }
    },
    onError: (err: any) => {
      console.error("Erro na sincronização com Google Calendar:", err);
      toast.error(
        `Falha ao comunicar com Google Calendar: ${err?.message || "Erro inesperado"}`
      );
    },
  });

  // Sincronização automática ao abrir a tela e a cada 3 minutos
  useEffect(() => {
    const timeoutInicial = setTimeout(() => {
      syncGoogleMutation.mutate(true);
    }, 1200);

    const intervalo = setInterval(() => {
      syncGoogleMutation.mutate(true);
    }, 180_000);

    return () => {
      clearTimeout(timeoutInicial);
      clearInterval(intervalo);
    };
  }, []);

  // ============================================================================
  // HELPER PARA SINCRONIZAR UM CARD INDIVIDUAL COM O GOOGLE CALENDAR
  // ============================================================================
  const dispararSyncIndividualGoogle = useCallback(
    async (params: {
      operacao: "upsert" | "delete";
      osNumero?: string | null;
      clienteNome: string;
      etapaExecucao: string;
      dataExecucao: string;
      horaInicio?: string | null;
      horaFim?: string | null;
      modalidadeExecucao: ModalidadeExecucao;
      statusVoo?: string | null;
      equipeResponsavel?: string | null;
      observacoes?: string | null;
      emailsVinculados?: string[];
      googleEventId?: string | null;
      flightBoardId?: string | null;
      agendaEventoId?: string | null;
    }) => {
      try {
        const listaEmails = Array.from(
          new Set([
            EMAIL_AGENDA_LOJA_PRINCIPAL,
            ...emailsEquipeAtiva,
            ...(params.emailsVinculados || []),
          ])
        );

        await sincronizarItemFlightBoardGoogle({
          data: {
            operacao: params.operacao,
            osNumero: params.osNumero,
            clienteNome: params.clienteNome,
            etapaExecucao: params.etapaExecucao,
            dataExecucao: params.dataExecucao,
            horaInicio: params.horaInicio || "08:00",
            horaFim: params.horaFim || "17:00",
            modalidadeExecucao: params.modalidadeExecucao,
            statusVoo: params.statusVoo,
            equipeResponsavel: params.equipeResponsavel,
            observacoes: params.observacoes,
            emailsVinculados: listaEmails,
            googleEventId: params.googleEventId,
            flightBoardId: params.flightBoardId,
            agendaEventoId: params.agendaEventoId,
          },
        });
      } catch (e) {
        console.warn("Aviso ao sincronizar item individual com Google Calendar:", e);
      }
    },
    [emailsEquipeAtiva]
  );

  // ============================================================================
  // MUTATION: SALVAR (INCLUIR OU EDITAR) CARD NO FLIGHT BOARD + GOOGLE AGENDA
  // ============================================================================
  const salvarCardMutation = useMutation({
    mutationFn: async () => {
      const emailsArray = formEmailsVinculados
        .split(/[,;\s]+/)
        .map((e) => e.trim())
        .filter((e) => e.includes("@"));

      if (!emailsArray.includes(EMAIL_AGENDA_LOJA_PRINCIPAL)) {
        emailsArray.unshift(EMAIL_AGENDA_LOJA_PRINCIPAL);
      }
      const emailsFormatados = Array.from(new Set(emailsArray)).join(", ");

      const statusFinal: FlightStatus = formServicoOut ? "OUT" : formStatus;
      const statusBanco = statusParaBancoFlight(statusFinal);

      // Caso 1: Compromisso de Agenda / Google Calendar (sem vínculo direto a uma OS ou evento avulso)
      if (
        formTipoVinculo === "COMPROMISSO_AGENDA" &&
        (!cardEditando || cardEditando.origem === "agenda_google")
      ) {
        if (!formTituloEvento.trim()) {
          throw new Error("Informe o título do compromisso ou evento.");
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user?.id;
        if (!userId) throw new Error("Usuário não autenticado.");

        const descricaoEmpacotada = empacotarMetadadosTexto({
          modalidade: formModalidade,
          osNumero: cardEditando?.os_numero || null,
          etapaExecucao: formEtapaExecucao,
          horaInicio: formHoraInicio,
          horaFim: formHoraFim,
          emailsVinculados: emailsFormatados,
          equipe: formEquipe,
          statusFlight: statusFinal,
          observacoesLimpa: formObservacoes,
        });

        let agendaId = cardEditando?.agenda_evento_id || null;

        if (agendaId) {
          const { error } = await supabase
            .from("agenda_eventos")
            .update({
              titulo: formTituloEvento.trim(),
              descricao: descricaoEmpacotada,
              data: formDataExecucao,
              hora: formHoraInicio || "09:00",
              tipo: formModalidade === "com_execucao" ? "trabalho" : "pessoal",
              status: statusFinal === "CONCLUIDO" ? "concluido" : "agendado",
            })
            .eq("id", agendaId);
          if (error) throw error;
        } else {
          const { data: inserido, error } = await supabase
            .from("agenda_eventos")
            .insert({
              user_id: userId,
              titulo: formTituloEvento.trim(),
              descricao: descricaoEmpacotada,
              data: formDataExecucao,
              hora: formHoraInicio || "09:00",
              tipo: formModalidade === "com_execucao" ? "trabalho" : "pessoal",
              status: statusFinal === "CONCLUIDO" ? "concluido" : "agendado",
              google_calendar_id: EMAIL_AGENDA_LOJA_PRINCIPAL,
            })
            .select("id")
            .single();
          if (error) throw error;
          agendaId = inserido?.id || null;
        }

        await dispararSyncIndividualGoogle({
          operacao: "upsert",
          osNumero: cardEditando?.os_numero || null,
          clienteNome: formTituloEvento.trim(),
          etapaExecucao: formEtapaExecucao,
          dataExecucao: formDataExecucao,
          horaInicio: formHoraInicio,
          horaFim: formHoraFim,
          modalidadeExecucao: formModalidade,
          statusVoo: statusBanco,
          equipeResponsavel: formEquipe,
          observacoes: formObservacoes,
          emailsVinculados: emailsArray,
          googleEventId: cardEditando?.google_event_id || null,
          agendaEventoId: agendaId,
        });

        return;
      }

      // Caso 2: Card vinculado a uma Ordem de Serviço (OS) formalmente emitida
      const osSelecionada = ordensEmitidas.find((o: any) => o.id === formOrdemId);
      if (!osSelecionada) {
        throw new Error(
          "Regra do Flight Board: Selecione uma Ordem de Serviço (OS) formalmente emitida."
        );
      }

      const numeroOs =
        osSelecionada.numero || osSelecionada.id.slice(0, 8).toUpperCase();
      const nomeCliente =
        osSelecionada.clientes?.nome ||
        cardEditando?.cliente_nome ||
        formTituloEvento.trim() ||
        "Cliente OS";

      const observacoesEmpacotadas = empacotarMetadadosTexto({
        modalidade: formModalidade,
        osNumero: numeroOs,
        etapaExecucao: formEtapaExecucao,
        horaInicio: formHoraInicio,
        horaFim: formHoraFim,
        emailsVinculados: emailsFormatados,
        equipe: formEquipe,
        statusFlight: statusFinal,
        observacoesLimpa: formObservacoes,
      });

      // Atualizar também a data prevista e responsável na própria OS emitida
      await supabase
        .from("ordens_servico")
        .update({
          data_previsao: formDataExecucao,
          responsavel: formEquipe.trim() || osSelecionada.responsavel || null,
          status:
            statusFinal === "CONCLUIDO"
              ? "concluido"
              : statusFinal === "EM_ANDAMENTO"
                ? "em_andamento"
                : osSelecionada.status,
        })
        .eq("id", osSelecionada.id);

      const payloadCompleto: Record<string, any> = {
        voo_codigo: cardEditando?.voo_codigo || `OS-${numeroOs}`,
        ordem_id: osSelecionada.id,
        os_numero: numeroOs,
        cliente_id: osSelecionada.cliente_id || null,
        cliente_nome: nomeCliente,
        kit_titulo:
          osSelecionada.descricao || cardEditando?.kit_titulo || `OS #${numeroOs}`,
        etapa_execucao: formEtapaExecucao.trim() || "Execução Técnica",
        data_execucao: formDataExecucao,
        previsao_entrega: formDataExecucao,
        hora_inicio: formHoraInicio || "08:00",
        hora_fim: formHoraFim || "17:00",
        status_voo: statusBanco,
        modalidade_execucao: formModalidade,
        equipe_responsavel: formEquipe.trim() || "Equipe Técnica",
        emails_vinculados: emailsFormatados,
        servico_out: formServicoOut,
        motivo_out: formServicoOut ? formMotivoOut.trim() : null,
        observacoes: observacoesEmpacotadas,
        updated_at: new Date().toISOString(),
      };

      const payloadBasicoFallback: Record<string, any> = {
        voo_codigo: cardEditando?.voo_codigo || `OS-${numeroOs}`,
        cliente_id: osSelecionada.cliente_id || null,
        cliente_nome: nomeCliente,
        kit_titulo:
          osSelecionada.descricao || cardEditando?.kit_titulo || `OS #${numeroOs}`,
        previsao_entrega: formDataExecucao,
        status_voo: statusBanco,
        equipe_responsavel: formEquipe.trim() || "Equipe Técnica",
        servico_out: formServicoOut,
        motivo_out: formServicoOut ? formMotivoOut.trim() : null,
        observacoes: observacoesEmpacotadas,
        updated_at: new Date().toISOString(),
      };

      let flightBoardId = cardEditando?.flight_board_id || null;

      if (flightBoardId) {
        const { error } = await supabase
          .from("logistics_flight_board")
          .update(payloadCompleto)
          .eq("id", flightBoardId);

        if (error) {
          const { error: errFallback } = await supabase
            .from("logistics_flight_board")
            .update(payloadBasicoFallback)
            .eq("id", flightBoardId);
          if (errFallback) throw errFallback;
        }
      } else {
        const { data: inserido, error } = await supabase
          .from("logistics_flight_board")
          .insert(payloadCompleto)
          .select("id")
          .single();

        if (error) {
          const { data: inseridoFb, error: errFallback } = await supabase
            .from("logistics_flight_board")
            .insert(payloadBasicoFallback)
            .select("id")
            .single();
          if (errFallback) throw errFallback;
          flightBoardId = inseridoFb?.id || null;
        } else {
          flightBoardId = inserido?.id || null;
        }
      }

      // Sincronizar imediatamente com Google Calendar (incluindo obrigatoriamente campinasjardimdotrevo@splashpiscinas.com)
      await dispararSyncIndividualGoogle({
        operacao: "upsert",
        osNumero: numeroOs,
        clienteNome: nomeCliente,
        etapaExecucao: formEtapaExecucao.trim() || "Execução Técnica",
        dataExecucao: formDataExecucao,
        horaInicio: formHoraInicio,
        horaFim: formHoraFim,
        modalidadeExecucao: formModalidade,
        statusVoo: statusBanco,
        equipeResponsavel: formEquipe.trim(),
        observacoes: formObservacoes.trim(),
        emailsVinculados: emailsArray,
        googleEventId: cardEditando?.google_event_id || null,
        flightBoardId,
      });
    },
    onSuccess: () => {
      toast.success(
        `Agendamento salvo e sincronizado com ${EMAIL_AGENDA_LOJA_PRINCIPAL}!`
      );
      setEditorModalAberto(false);
      setCardEditando(null);
      queryClient.invalidateQueries({ queryKey: ["logistics_flight_board_v2"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Erro ao salvar agendamento no Flight Board.");
    },
  });

  // ============================================================================
  // MUTATION: ALTERNAR TAG "COM EXECUÇÃO" / "SEM EXECUÇÃO" DIRETAMENTE NO CARD
  // ============================================================================
  const alternarModalidadeMutation = useMutation({
    mutationFn: async (card: FlightBoardCardItem) => {
      const novaModalidade: ModalidadeExecucao =
        card.modalidade_execucao === "com_execucao" ? "sem_execucao" : "com_execucao";

      const novaObs = empacotarMetadadosTexto({
        modalidade: novaModalidade,
        osNumero: card.os_numero,
        etapaExecucao: card.etapa_execucao,
        horaInicio: card.hora_inicio,
        horaFim: card.hora_fim,
        emailsVinculados: card.emails_vinculados,
        equipe: card.equipe_responsavel,
        statusFlight: card.status,
        observacoesLimpa: card.observacoes,
      });

      if (card.origem === "agenda_google" && card.agenda_evento_id) {
        const { error } = await supabase
          .from("agenda_eventos")
          .update({
            tipo: novaModalidade === "com_execucao" ? "trabalho" : "pessoal",
            descricao: novaObs,
          })
          .eq("id", card.agenda_evento_id);
        if (error) throw error;
      } else if (card.flight_board_id) {
        const { error } = await supabase
          .from("logistics_flight_board")
          .update({
            modalidade_execucao: novaModalidade,
            observacoes: novaObs,
          })
          .eq("id", card.flight_board_id);

        if (error) {
          await supabase
            .from("logistics_flight_board")
            .update({ observacoes: novaObs })
            .eq("id", card.flight_board_id);
        }
      } else if (card.ordem_id) {
        await supabase
          .from("ordens_servico")
          .update({ observacoes: novaObs })
          .eq("id", card.ordem_id);
      }

      await dispararSyncIndividualGoogle({
        operacao: "upsert",
        osNumero: card.os_numero,
        clienteNome: card.cliente_nome,
        etapaExecucao: card.etapa_execucao,
        dataExecucao: card.data_execucao,
        horaInicio: card.hora_inicio,
        horaFim: card.hora_fim,
        modalidadeExecucao: novaModalidade,
        statusVoo: statusParaBancoFlight(card.status),
        equipeResponsavel: card.equipe_responsavel,
        observacoes: card.observacoes,
        emailsVinculados: card.emails_vinculados
          .split(/[,;\s]+/)
          .filter((e) => e.includes("@")),
        googleEventId: card.google_event_id,
        flightBoardId: card.flight_board_id,
        agendaEventoId: card.agenda_evento_id,
      });

      return novaModalidade;
    },
    onSuccess: (novaModalidade) => {
      toast.success(
        `Etiqueta alterada para "${novaModalidade === "com_execucao" ? "Com Execução" : "Sem Execução"}"!`
      );
      queryClient.invalidateQueries({ queryKey: ["logistics_flight_board_v2"] });
    },
    onError: (err: any) => {
      toast.error(`Erro ao atualizar etiqueta: ${err?.message || "Falha"}`);
    },
  });

  // ============================================================================
  // MUTATION: EXCLUIR AGENDAMENTO DO FLIGHT BOARD COM CONFIRMAÇÃO PRÉVIA
  // ============================================================================
  const excluirCardMutation = useMutation({
    mutationFn: async (card: FlightBoardCardItem) => {
      if (card.flight_board_id) {
        const { error } = await supabase
          .from("logistics_flight_board")
          .delete()
          .eq("id", card.flight_board_id);
        if (error) throw error;
      }

      if (card.agenda_evento_id) {
        const { error } = await supabase
          .from("agenda_eventos")
          .delete()
          .eq("id", card.agenda_evento_id);
        if (error) throw error;
      }

      // Se era uma OS emitida direta sem linha em logistics_flight_board, limpamos a data_previsao ou marcamos cancelado se desejado
      if (card.origem === "os_emitida" && card.ordem_id && !card.flight_board_id) {
        await supabase
          .from("ordens_servico")
          .update({ status: "cancelado" })
          .eq("id", card.ordem_id);
      }

      // Remover também do Google Calendar se houver google_event_id
      if (card.google_event_id) {
        await dispararSyncIndividualGoogle({
          operacao: "delete",
          osNumero: card.os_numero,
          clienteNome: card.cliente_nome,
          etapaExecucao: card.etapa_execucao,
          dataExecucao: card.data_execucao,
          modalidadeExecucao: card.modalidade_execucao,
          googleEventId: card.google_event_id,
          emailsVinculados: card.emails_vinculados
            .split(/[,;\s]+/)
            .filter((e) => e.includes("@")),
        });
      }
    },
    onSuccess: () => {
      toast.success("Agendamento removido do Flight Board e do Google Agenda.");
      setCardParaExcluir(null);
      queryClient.invalidateQueries({ queryKey: ["logistics_flight_board_v2"] });
    },
    onError: (err: any) => {
      toast.error(`Erro ao excluir agendamento: ${err?.message || "Falha"}`);
    },
  });

  // ============================================================================
  // ABERTURA DOS MODAIS DE INCLUIR E EDITAR
  // ============================================================================
  const abrirModalIncluir = (opcoes?: {
    dataPadrao?: string;
    statusPadrao?: FlightStatus;
  }) => {
    setModoEditor("INCLUIR");
    setCardEditando(null);
    setFormTipoVinculo(ordensEmitidas.length > 0 ? "OS_EMITIDA" : "COMPROMISSO_AGENDA");
    const primeiraOs = ordensEmitidas[0];
    setFormOrdemId(primeiraOs?.id || "");
    setFormTituloEvento("");
    setFormEtapaExecucao(
      primeiraOs?.descricao || "Instalação e Execução Técnica de Piscina"
    );
    setFormDataExecucao(opcoes?.dataPadrao || hojeISO());
    setFormHoraInicio("08:00");
    setFormHoraFim("17:00");
    setFormStatus(opcoes?.statusPadrao || "AGENDADO");
    setFormModalidade("com_execucao");
    setFormEquipe(primeiraOs?.responsavel || "");
    const emailCliente = primeiraOs?.clientes?.email;
    setFormEmailsVinculados(
      [EMAIL_AGENDA_LOJA_PRINCIPAL, emailCliente].filter(Boolean).join(", ")
    );
    setFormObservacoes("");
    setFormServicoOut(opcoes?.statusPadrao === "OUT");
    setFormMotivoOut("");
    setEditorModalAberto(true);
  };

  const abrirModalEditar = (card: FlightBoardCardItem) => {
    setModoEditor("EDITAR");
    setCardEditando(card);
    setFormTipoVinculo(
      card.origem === "agenda_google" && !card.ordem_id
        ? "COMPROMISSO_AGENDA"
        : "OS_EMITIDA"
    );
    setFormOrdemId(card.ordem_id || ordensEmitidas[0]?.id || "");
    setFormTituloEvento(card.cliente_nome);
    setFormEtapaExecucao(card.etapa_execucao);
    setFormDataExecucao(card.data_execucao || hojeISO());
    setFormHoraInicio(card.hora_inicio || "08:00");
    setFormHoraFim(card.hora_fim || "17:00");
    setFormStatus(card.status);
    setFormModalidade(card.modalidade_execucao);
    setFormEquipe(card.equipe_responsavel || "");
    setFormEmailsVinculados(
      card.emails_vinculados || EMAIL_AGENDA_LOJA_PRINCIPAL
    );
    setFormObservacoes(card.observacoes || "");
    setFormServicoOut(card.servico_out || card.status === "OUT");
    setFormMotivoOut(card.motivo_out || "");
    setEditorModalAberto(true);
  };

  // Quando o usuário troca a OS selecionada no modal de Incluir
  const handleSelectOrdemEmitida = (osId: string) => {
    setFormOrdemId(osId);
    const os = ordensEmitidas.find((o: any) => o.id === osId);
    if (os) {
      setFormEtapaExecucao(os.descricao || "Execução Técnica de OS");
      if (os.responsavel) setFormEquipe(os.responsavel);
      const emailCli = os.clientes?.email;
      setFormEmailsVinculados(
        Array.from(
          new Set([EMAIL_AGENDA_LOJA_PRINCIPAL, emailCli].filter(Boolean))
        ).join(", ")
      );
    }
  };

  // ============================================================================
  // FILTROS E ESTATÍSTICAS
  // ============================================================================
  const cardsFiltrados = useMemo(() => {
    return cards.filter((c) => {
      if (filtroStatus !== "TODOS" && c.status !== filtroStatus) {
        return false;
      }
      if (
        filtroModalidade !== "TODAS" &&
        c.modalidade_execucao !== filtroModalidade
      ) {
        return false;
      }
      if (busca.trim()) {
        const q = busca.toLowerCase();
        const match =
          c.cliente_nome.toLowerCase().includes(q) ||
          (c.os_numero || "").toLowerCase().includes(q) ||
          c.voo_codigo.toLowerCase().includes(q) ||
          c.etapa_execucao.toLowerCase().includes(q) ||
          c.equipe_responsavel.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [cards, filtroStatus, filtroModalidade, busca]);

  const estatisticas = useMemo(() => {
    return {
      total: cards.length,
      emAndamento: cards.filter((c) => c.status === "EM_ANDAMENTO").length,
      agendados: cards.filter((c) => c.status === "AGENDADO").length,
      concluidos: cards.filter((c) => c.status === "CONCLUIDO").length,
      comExecucao: cards.filter((c) => c.modalidade_execucao === "com_execucao")
        .length,
      semExecucao: cards.filter((c) => c.modalidade_execucao === "sem_execucao")
        .length,
      servicosOut: cards.filter((c) => c.status === "OUT" || c.servico_out).length,
    };
  }, [cards]);

  const imprimirOrdemCarga = (card: FlightBoardCardItem) => {
    const win = window.open("", "_blank", "width=850,height=900");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Ordem de Execução - ${card.os_numero ? `OS #${card.os_numero}` : card.voo_codigo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; }
            .header { border-bottom: 3px solid #0f172a; padding-bottom: 14px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
            .badge { background: #0f172a; color: #ffffff; padding: 6px 12px; font-weight: bold; border-radius: 6px; font-size: 13px; }
            .box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: #f8fafc; }
            .label { font-size: 11px; text-transform: uppercase; color: #475569; font-weight: bold; }
            .val { font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin:0; font-size: 22px;">CRONOGRAMA FLIGHT BOARD — ORDEM DE EXECUÇÃO</h1>
              <p style="margin:4px 0 0; font-size: 13px; color:#334155;">Agenda Principal: ${EMAIL_AGENDA_LOJA_PRINCIPAL}</p>
            </div>
            <div class="badge">${card.os_numero ? `OS #${card.os_numero}` : card.voo_codigo}</div>
          </div>
          <div class="box">
            <div class="label">Cliente / Compromisso</div>
            <div class="val">${card.cliente_nome}</div>
            <p style="margin: 6px 0 0; font-size: 13px;">Etapa: <strong>${card.etapa_execucao}</strong></p>
            <p style="margin: 4px 0 0; font-size: 13px;">Modalidade: <strong>${card.modalidade_execucao === "com_execucao" ? "COM EXECUÇÃO (Campo / Instalação)" : "SEM EXECUÇÃO (Reunião / Compromisso)"}</strong></p>
          </div>
          <div class="box">
            <div class="label">Agendamento e Equipe</div>
            <p style="margin: 6px 0; font-size: 14px;">Data de Execução: <strong>${dataBR(card.data_execucao)}</strong> das <strong>${card.hora_inicio}</strong> às <strong>${card.hora_fim}</strong></p>
            <p style="margin: 6px 0; font-size: 14px;">Equipe / Responsável: <strong>${card.equipe_responsavel}</strong></p>
            <p style="margin: 6px 0; font-size: 13px;">E-mails Sincronizados: ${card.emails_vinculados}</p>
          </div>
          ${card.observacoes ? `<div class="box"><div class="label">Observações</div><p style="margin-top:6px; font-size:13px;">${card.observacoes}</p></div>` : ""}
          <script>window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // ============================================================================
  // COMPONENTE INTERNO DE CARD DE ALTO CONTRASTE
  // ============================================================================
  const renderFlightCard = (card: FlightBoardCardItem) => {
    const statusCfg = getStatusBadgeConfig(card.status);
    const modCfg = getModalidadeBadgeConfig(card.modalidade_execucao);
    const ModIcon = modCfg.icon;

    return (
      <div
        key={card.id}
        className="group relative rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col"
      >
        {/* Faixa superior de alto contraste por status */}
        <div className={`h-1.5 w-full ${statusCfg.stripeClass}`} />

        <div className="p-3.5 flex flex-col gap-2.5 flex-1">
          {/* Topo do card: Número da OS + Status Badge */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {card.os_numero ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-extrabold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 tracking-tight">
                  <FileText className="h-3 w-3" />
                  OS #{card.os_numero}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-700 text-white dark:bg-indigo-400 dark:text-slate-950">
                  <Calendar className="h-3 w-3" />
                  Google Agenda
                </span>
              )}

              {/* Tag clicável: "Com Execução" ou "Sem Execução" */}
              <button
                type="button"
                onClick={() => alternarModalidadeMutation.mutate(card)}
                title="Clique para alternar entre 'Com Execução' e 'Sem Execução'"
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] border transition-colors cursor-pointer ${modCfg.badgeClass}`}
              >
                <ModIcon className="h-3 w-3" />
                {modCfg.label}
              </button>
            </div>

            <Badge
              variant="outline"
              className={`text-[11px] px-2 py-0.5 rounded-md border ${statusCfg.badgeClass}`}
            >
              {statusCfg.label}
            </Badge>
          </div>

          {/* Nome do Cliente e Etapa de Execução com alto contraste */}
          <div>
            <h4 className="text-sm font-bold text-slate-950 dark:text-white leading-snug">
              {card.cliente_nome}
            </h4>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5 line-clamp-2">
              {card.etapa_execucao}
            </p>
          </div>

          {/* Alerta se estiver em OUT */}
          {(card.servico_out || card.status === "OUT") && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/70 border border-red-300 dark:border-red-800 px-2.5 py-1.5 text-xs text-red-900 dark:text-red-200 font-medium flex items-start gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span>{card.motivo_out || "Impedimento operacional sinalizado (OUT)."}</span>
            </div>
          )}

          {/* Metadados: Data, Horário, Equipe e Agenda */}
          <div className="rounded-lg bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 p-2 space-y-1 text-xs text-slate-800 dark:text-slate-200">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 font-semibold">
                <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                {dataBR(card.data_execucao)}
              </span>
              <span className="inline-flex items-center gap-1 font-mono font-semibold text-slate-900 dark:text-slate-100">
                <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                {card.hora_inicio} - {card.hora_fim}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 truncate">
              <Users className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400 shrink-0" />
              <span className="truncate font-medium">{card.equipe_responsavel}</span>
            </div>

            <div
              className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 truncate"
              title={`Sincronizado com: ${card.emails_vinculados}`}
            >
              <Mail className="h-3 w-3 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="truncate">{EMAIL_AGENDA_LOJA_PRINCIPAL}</span>
            </div>
          </div>

          {/* Rodapé do Card: Botões Diretos de Editar e Excluir + Visualizar OS */}
          <div className="pt-2 mt-auto border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1.5 flex-wrap">
            <div className="flex items-center gap-1">
              {card.ordem_id && (
                <BotaoVisualizarDocumento
                  tipo="os"
                  id={card.ordem_id}
                  label="Ver OS"
                  className="h-7 px-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 border-slate-300 dark:border-slate-700"
                />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => imprimirOrdemCarga(card)}
                title="Imprimir Ordem de Execução"
                className="h-7 px-2 text-xs bg-white hover:bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
              >
                <Printer className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => abrirModalEditar(card)}
                className="h-7 px-2.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/80 dark:hover:bg-blue-900 dark:text-blue-100 dark:border-blue-800"
              >
                <Pencil className="h-3 w-3 mr-1" />
                Editar
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCardParaExcluir(card)}
                className="h-7 px-2.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-900 border-red-300 dark:bg-red-950/80 dark:hover:bg-red-900 dark:text-red-100 dark:border-red-800"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      {/* ===================================================================== */}
      {/* CABEÇALHO DE ALTO CONTRASTE DO FLIGHT BOARD                           */}
      {/* ===================================================================== */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Identidade + Regra de OS Emitida + E-mail da Loja */}
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <Plane className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                    FLIGHT BOARD — QUADRO DE EXECUÇÃO
                  </h1>
                  <Badge className="bg-emerald-700 hover:bg-emerald-700 text-white font-bold text-xs px-2.5 py-0.5">
                    <CheckCheck className="h-3.5 w-3.5 mr-1" />
                    Regra Ativa: Somente OS Emitida
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <CalendarCheck2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    Agenda Principal Sincronizada:{" "}
                    <strong className="text-slate-950 dark:text-white underline decoration-blue-500">
                      {EMAIL_AGENDA_LOJA_PRINCIPAL}
                    </strong>
                  </span>
                  {ultimaSyncGoogle && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                      Última sync: {ultimaSyncGoogle}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Botões Principais de Ação e Sincronização com Google Agenda */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  {relogio || "--:--:--"}
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => syncGoogleMutation.mutate(false)}
                disabled={syncGoogleMutation.isPending}
                className="bg-white hover:bg-blue-50 text-blue-900 border-blue-400 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-blue-200 dark:border-blue-700 font-bold shadow-xs"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 text-blue-600 dark:text-blue-400 ${
                    syncGoogleMutation.isPending ? "animate-spin" : ""
                  }`}
                />
                {syncGoogleMutation.isPending
                  ? "Sincronizando Agenda..."
                  : "Sincronizar com Google Agenda"}
              </Button>

              <Button
                type="button"
                onClick={() => abrirModalIncluir({ dataPadrao: hojeISO() })}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Incluir no Quadro
              </Button>
            </div>
          </div>

          {/* KPIs de Alto Contraste */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-4">
            <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 px-3.5 py-2.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300">
                  Total no Quadro
                </p>
                <p className="text-xl font-extrabold text-slate-950 dark:text-white">
                  {estatisticas.total}
                </p>
              </div>
              <Plane className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            </div>

            <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-2.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-emerald-900 dark:text-emerald-200">
                  Em Andamento
                </p>
                <p className="text-xl font-extrabold text-emerald-950 dark:text-white">
                  {estatisticas.emAndamento}
                </p>
              </div>
              <Flame className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
            </div>

            <div className="rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-2.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-blue-900 dark:text-blue-200">
                  Agendados
                </p>
                <p className="text-xl font-extrabold text-blue-950 dark:text-white">
                  {estatisticas.agendados}
                </p>
              </div>
              <Calendar className="h-6 w-6 text-blue-700 dark:text-blue-400" />
            </div>

            <div className="rounded-xl border border-violet-300 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/60 px-3.5 py-2.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-violet-900 dark:text-violet-200">
                  Concluídos
                </p>
                <p className="text-xl font-extrabold text-violet-950 dark:text-white">
                  {estatisticas.concluidos}
                </p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-violet-700 dark:text-violet-400" />
            </div>

            <div className="rounded-xl border border-teal-300 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/60 px-3.5 py-2.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-teal-900 dark:text-teal-200">
                  Com Execução
                </p>
                <p className="text-xl font-extrabold text-teal-950 dark:text-white">
                  {estatisticas.comExecucao}
                </p>
              </div>
              <Wrench className="h-6 w-6 text-teal-700 dark:text-teal-400" />
            </div>

            <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3.5 py-2.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-slate-800 dark:text-slate-200">
                  Sem Execução
                </p>
                <p className="text-xl font-extrabold text-slate-950 dark:text-white">
                  {estatisticas.semExecucao}
                </p>
              </div>
              <Briefcase className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* BARRA DE FILTROS, NAVEGAÇÃO DE SEMANA E ALTERNÂNCIA DE VISÃO          */}
      {/* ===================================================================== */}
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 pt-5">
        <div className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Busca e filtros de Status / Modalidade */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por OS, cliente, etapa ou equipe..."
                className="pl-9 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-full sm:w-44 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os Status</SelectItem>
                <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                <SelectItem value="AGENDADO">Agendado</SelectItem>
                <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                <SelectItem value="AGUARDANDO">Aguardando</SelectItem>
                <SelectItem value="OUT">OUT / Impedido</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroModalidade} onValueChange={setFiltroModalidade}>
              <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold">
                <SelectValue placeholder="Modalidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas as Etiquetas</SelectItem>
                <SelectItem value="com_execucao">🔧 Com Execução</SelectItem>
                <SelectItem value="sem_execucao">📅 Sem Execução</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Controles de Semana (quando em visão de Cronograma por Dias) + Seletor de Visão */}
          <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
            {modoVisao === "CRONOGRAMA_DIAS" && (
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-300 dark:border-slate-700">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSemanaBaseISO((prev) => adicionarDiasISO(prev, -7))}
                  className="h-7 px-2 text-xs font-bold text-slate-900 dark:text-slate-100"
                >
                  <ChevronLeft className="h-4 w-4 mr-0.5" />
                  Semana Ant.
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSemanaBaseISO(obterInicioSemanaSegundaISO(hojeISO()))
                  }
                  className="h-7 px-2.5 text-xs font-bold bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 border-slate-300 dark:border-slate-700"
                >
                  Hoje ({dataBR(hojeISO()).slice(0, 5)})
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSemanaBaseISO((prev) => adicionarDiasISO(prev, 7))}
                  className="h-7 px-2 text-xs font-bold text-slate-900 dark:text-slate-100"
                >
                  Próx. Semana
                  <ChevronRight className="h-4 w-4 ml-0.5" />
                </Button>
              </div>
            )}

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-300 dark:border-slate-700">
              <Button
                type="button"
                size="sm"
                variant={modoVisao === "CRONOGRAMA_DIAS" ? "default" : "ghost"}
                onClick={() => setModoVisao("CRONOGRAMA_DIAS")}
                className={
                  modoVisao === "CRONOGRAMA_DIAS"
                    ? "h-7 px-2.5 text-xs font-bold bg-blue-600 text-white"
                    : "h-7 px-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200"
                }
              >
                <Columns3 className="h-3.5 w-3.5 mr-1" />
                Por Dia
              </Button>
              <Button
                type="button"
                size="sm"
                variant={modoVisao === "COLUNAS_STATUS" ? "default" : "ghost"}
                onClick={() => setModoVisao("COLUNAS_STATUS")}
                className={
                  modoVisao === "COLUNAS_STATUS"
                    ? "h-7 px-2.5 text-xs font-bold bg-blue-600 text-white"
                    : "h-7 px-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200"
                }
              >
                <LayoutGrid className="h-3.5 w-3.5 mr-1" />
                Por Status
              </Button>
              <Button
                type="button"
                size="sm"
                variant={modoVisao === "LISTA" ? "default" : "ghost"}
                onClick={() => setModoVisao("LISTA")}
                className={
                  modoVisao === "LISTA"
                    ? "h-7 px-2.5 text-xs font-bold bg-blue-600 text-white"
                    : "h-7 px-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200"
                }
              >
                <ListFilter className="h-3.5 w-3.5 mr-1" />
                Tabela
              </Button>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* VISÃO 1: CRONOGRAMA EM COLUNAS POR DIA DA SEMANA (COM BOTÃO INCLUIR)*/}
        {/* =================================================================== */}
        {isLoading ? (
          <div className="mt-6 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-900 dark:text-white">
              Carregando Quadro de Execução e OS Emitidas...
            </p>
          </div>
        ) : modoVisao === "CRONOGRAMA_DIAS" ? (
          <div className="mt-5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {diasDaSemanaISO.map((diaISO) => {
                const infoDia = formatarDiaColuna(diaISO);
                const cardsDoDia = cardsFiltrados.filter(
                  (c) => c.data_execucao === diaISO
                );

                return (
                  <div
                    key={diaISO}
                    className={`rounded-xl border flex flex-col min-h-[420px] ${
                      infoDia.ehHoje
                        ? "border-blue-500 dark:border-blue-500 bg-blue-50/40 dark:bg-slate-900 ring-2 ring-blue-500/20"
                        : "border-slate-300 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60"
                    }`}
                  >
                    {/* Topo da Coluna do Dia + Botão Direto "+ Incluir" */}
                    <div
                      className={`p-3 border-b rounded-t-xl flex items-center justify-between gap-2 ${
                        infoDia.ehHoje
                          ? "bg-blue-600 text-white border-blue-700"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold uppercase tracking-wider">
                            {infoDia.diaSemanaCurto}
                          </span>
                          <span
                            className={`text-xs font-mono font-bold px-1.5 py-0.2 rounded ${
                              infoDia.ehHoje
                                ? "bg-white text-blue-700"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-200"
                            }`}
                          >
                            {infoDia.diaMes}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] mt-0.5 font-medium ${
                            infoDia.ehHoje
                              ? "text-blue-100"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {cardsDoDia.length} agendamento(s)
                        </p>
                      </div>

                      {/* Requisito 3: Botão Incluir visível no topo de cada coluna/dia */}
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => abrirModalIncluir({ dataPadrao: diaISO })}
                        className={`h-7 px-2.5 text-xs font-bold shadow-xs ${
                          infoDia.ehHoje
                            ? "bg-white hover:bg-blue-50 text-blue-900"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Incluir
                      </Button>
                    </div>

                    {/* Lista de Cards do Dia */}
                    <div className="p-2.5 space-y-2.5 flex-1">
                      {cardsDoDia.length === 0 ? (
                        <div className="h-44 rounded-lg border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center p-4 text-center">
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Sem execuções ou eventos neste dia.
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => abrirModalIncluir({ dataPadrao: diaISO })}
                            className="mt-2 h-7 text-xs font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800"
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Agendar em {infoDia.diaMes}
                          </Button>
                        </div>
                      ) : (
                        cardsDoDia.map((card) => renderFlightCard(card))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Seção de OS Emitidas / Eventos agendados fora da semana visível */}
            {(() => {
              const inicioSemana = diasDaSemanaISO[0];
              const fimSemana = diasDaSemanaISO[diasDaSemanaISO.length - 1];
              const cardsForaDaSemana = cardsFiltrados.filter(
                (c) =>
                  c.data_execucao < inicioSemana || c.data_execucao > fimSemana
              );
              if (cardsForaDaSemana.length === 0) return null;

              return (
                <div className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                  <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                    <div>
                      <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        Outras Datas Agendadas ({cardsForaDaSemana.length})
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Ordens de Serviço emitidas e compromissos do Google Agenda programados para outras semanas.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => abrirModalIncluir({ dataPadrao: hojeISO() })}
                      className="h-8 text-xs font-bold border-blue-400 text-blue-800 dark:text-blue-200"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Incluir Novo Agendamento
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {cardsForaDaSemana.map((card) => renderFlightCard(card))}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : modoVisao === "COLUNAS_STATUS" ? (
          /* ================================================================= */
          /* VISÃO 2: QUADRO KANBAN EM COLUNAS POR STATUS (COM BOTÃO INCLUIR)  */
          /* ================================================================= */
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {(
              [
                "AGENDADO",
                "EM_ANDAMENTO",
                "AGUARDANDO",
                "CONCLUIDO",
                "OUT",
              ] as FlightStatus[]
            ).map((statusCol) => {
              const cfg = getStatusBadgeConfig(statusCol);
              const cardsColuna = cardsFiltrados.filter(
                (c) => c.status === statusCol
              );

              return (
                <div
                  key={statusCol}
                  className="rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/60 flex flex-col min-h-[480px]"
                >
                  <div
                    className={`p-3 border-b rounded-t-xl flex items-center justify-between gap-2 ${cfg.headerBg}`}
                  >
                    <div>
                      <span
                        className={`text-xs font-extrabold uppercase tracking-wide ${cfg.headerText}`}
                      >
                        {cfg.label}
                      </span>
                      <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {cardsColuna.length} item(ns)
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        abrirModalIncluir({
                          dataPadrao: hojeISO(),
                          statusPadrao: statusCol,
                        })
                      }
                      className="h-7 px-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Incluir
                    </Button>
                  </div>

                  <div className="p-2.5 space-y-2.5 flex-1">
                    {cardsColuna.length === 0 ? (
                      <div className="h-40 rounded-lg border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center p-4 text-center">
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          Nenhum item em {cfg.label}.
                        </p>
                      </div>
                    ) : (
                      cardsColuna.map((card) => renderFlightCard(card))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ================================================================= */
          /* VISÃO 3: TABELA CONSOLIDADA DE ALTO CONTRASTE                     */
          /* ================================================================= */
          <div className="mt-5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100 dark:bg-slate-800/90">
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100">
                    OS / Origem
                  </TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100">
                    Cliente / Compromisso
                  </TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100">
                    Etapa de Execução
                  </TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100">
                    Modalidade
                  </TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100">
                    Data & Horário
                  </TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100">
                    Equipe
                  </TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100">
                    Status
                  </TableHead>
                  <TableHead className="text-right font-bold text-slate-900 dark:text-slate-100">
                    Ações Diretas
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cardsFiltrados.map((card) => {
                  const stCfg = getStatusBadgeConfig(card.status);
                  const modCfg = getModalidadeBadgeConfig(card.modalidade_execucao);
                  return (
                    <TableRow
                      key={card.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <TableCell className="font-mono font-bold text-slate-950 dark:text-white">
                        {card.os_numero ? `OS #${card.os_numero}` : card.voo_codigo}
                      </TableCell>
                      <TableCell className="font-bold text-slate-900 dark:text-slate-100">
                        {card.cliente_nome}
                      </TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300 max-w-xs truncate">
                        {card.etapa_execucao}
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => alternarModalidadeMutation.mutate(card)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs border cursor-pointer ${modCfg.badgeClass}`}
                        >
                          {modCfg.label}
                        </button>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                        {dataBR(card.data_execucao)} • {card.hora_inicio}-{card.hora_fim}
                      </TableCell>
                      <TableCell className="text-slate-800 dark:text-slate-200">
                        {card.equipe_responsavel}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${stCfg.badgeClass}`}
                        >
                          {stCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {card.ordem_id && (
                            <BotaoVisualizarDocumento
                              tipo="os"
                              id={card.ordem_id}
                              label="OS"
                              className="h-7 px-2 text-xs"
                            />
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => abrirModalEditar(card)}
                            className="h-7 px-2.5 text-xs font-semibold text-blue-800 border-blue-300 bg-blue-50 hover:bg-blue-100"
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setCardParaExcluir(card)}
                            className="h-7 px-2.5 text-xs font-semibold text-red-800 border-red-300 bg-red-50 hover:bg-red-100"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* MODAL DE INCLUIR / EDITAR AGENDAMENTO NO FLIGHT BOARD                 */}
      {/* ===================================================================== */}
      <Dialog open={editorModalAberto} onOpenChange={setEditorModalAberto}>
        <DialogContent className="sm:max-w-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              <Plane className="h-5 w-5 text-blue-600" />
              {modoEditor === "INCLUIR"
                ? "Incluir Agendamento no Flight Board"
                : `Editar Agendamento — ${
                    cardEditando?.os_numero
                      ? `OS #${cardEditando.os_numero}`
                      : cardEditando?.cliente_nome
                  }`}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 dark:text-slate-300">
              Qualquer inclusão ou alteração sincroniza automaticamente com{" "}
              <strong>{EMAIL_AGENDA_LOJA_PRINCIPAL}</strong> e os e-mails vinculados.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Seletor do Tipo de Registro */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setFormTipoVinculo("OS_EMITIDA")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  formTipoVinculo === "OS_EMITIDA"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <FileText className="h-4 w-4" />
                Ordem de Serviço (OS Emitida)
              </button>
              <button
                type="button"
                onClick={() => setFormTipoVinculo("COMPROMISSO_AGENDA")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  formTipoVinculo === "COMPROMISSO_AGENDA"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <Calendar className="h-4 w-4" />
                Compromisso / Evento Google Agenda
              </button>
            </div>

            {formTipoVinculo === "OS_EMITIDA" ? (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Ordem de Serviço (Somente OS Formalmente Emitida) *
                </Label>
                <Select
                  value={formOrdemId}
                  onValueChange={handleSelectOrdemEmitida}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold">
                    <SelectValue placeholder="Selecione uma Ordem de Serviço emitida..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ordensEmitidas.length === 0 ? (
                      <SelectItem value="__none" disabled>
                        Nenhuma OS emitida encontrada
                      </SelectItem>
                    ) : (
                      ordensEmitidas.map((os: any) => (
                        <SelectItem key={os.id} value={os.id}>
                          OS #{os.numero || os.id.slice(0, 6)} —{" "}
                          {os.clientes?.nome || "Cliente"} ({os.descricao})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  ✓ Pedidos em orçamento ou sem OS emitida são bloqueados automaticamente.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Título do Compromisso / Evento (Google Agenda) *
                </Label>
                <Input
                  value={formTituloEvento}
                  onChange={(e) => setFormTituloEvento(e.target.value)}
                  placeholder="Ex.: Reunião Técnica, Vistoria, Alinhamento de Equipe..."
                  className="bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
            )}

            {/* Etiqueta Obrigatória: Com Execução vs Sem Execução */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Etiqueta de Execução no Flight Board *
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormModalidade("com_execucao")}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                    formModalidade === "com_execucao"
                      ? "border-teal-600 bg-teal-50 dark:bg-teal-950/70 text-teal-950 dark:text-teal-100 ring-2 ring-teal-500/30"
                      : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <Wrench className="h-5 w-5 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-extrabold">Com Execução</div>
                    <div className="text-[11px] opacity-85">
                      Trabalho de campo, instalação de piscina, entrega ou montagem técnica.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormModalidade("sem_execucao")}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                    formModalidade === "sem_execucao"
                      ? "border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white ring-2 ring-slate-500/30"
                      : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <Briefcase className="h-5 w-5 text-slate-700 dark:text-slate-300 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-extrabold">Sem Execução</div>
                    <div className="text-[11px] opacity-85">
                      Reuniões, compromissos avulsos, avisos administrativos ou pessoais.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Detalhes da Etapa de Execução */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Detalhes da Etapa de Execução / Atividade *
              </Label>
              <Input
                value={formEtapaExecucao}
                onChange={(e) => setFormEtapaExecucao(e.target.value)}
                placeholder="Ex.: Escavação + Entrega do Casco + Casa de Máquinas"
                className="bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Data, Horário Inicial, Horário Final e Status */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Data de Execução *
                </Label>
                <Input
                  type="date"
                  value={formDataExecucao}
                  onChange={(e) => setFormDataExecucao(e.target.value)}
                  className="bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Hora Início
                </Label>
                <Input
                  type="time"
                  value={formHoraInicio}
                  onChange={(e) => setFormHoraInicio(e.target.value)}
                  className="bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Hora Término
                </Label>
                <Input
                  type="time"
                  value={formHoraFim}
                  onChange={(e) => setFormHoraFim(e.target.value)}
                  className="bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Status no Quadro
                </Label>
                <Select
                  value={formStatus}
                  onValueChange={(v) => setFormStatus(v as FlightStatus)}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AGENDADO">Agendado</SelectItem>
                    <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                    <SelectItem value="AGUARDANDO">Aguardando</SelectItem>
                    <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                    <SelectItem value="OUT">OUT / Impedido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Equipe e E-mails do Google Calendar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Equipe / Técnico Responsável
                </Label>
                <Input
                  value={formEquipe}
                  onChange={(e) => setFormEquipe(e.target.value)}
                  placeholder="Ex.: Equipe Alfa / João Técnico"
                  className="bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  E-mails Vinculados (Google Calendar)
                </Label>
                <Input
                  value={formEmailsVinculados}
                  onChange={(e) => setFormEmailsVinculados(e.target.value)}
                  placeholder={EMAIL_AGENDA_LOJA_PRINCIPAL}
                  className="bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
                <p className="text-[10px] text-slate-600 dark:text-slate-400">
                  A agenda principal <strong>{EMAIL_AGENDA_LOJA_PRINCIPAL}</strong> é incluída obrigatoriamente.
                </p>
              </div>
            </div>

            {/* Impedimento Operacional (OUT) */}
            <div className="rounded-xl border border-slate-300 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Sinalizar Impedimento Operacional (OUT)
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Marque caso haja chuva, pendência no terreno ou bloqueio de execução.
                  </p>
                </div>
                <Switch
                  checked={formServicoOut}
                  onCheckedChange={setFormServicoOut}
                />
              </div>
              {formServicoOut && (
                <Input
                  value={formMotivoOut}
                  onChange={(e) => setFormMotivoOut(e.target.value)}
                  placeholder="Descreva o motivo do impedimento..."
                  className="bg-white dark:bg-slate-950 border-red-300 dark:border-red-800 text-slate-900 dark:text-slate-100"
                />
              )}
            </div>

            {/* Observações Adicionais */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Observações Adicionais
              </Label>
              <Textarea
                rows={2}
                value={formObservacoes}
                onChange={(e) => setFormObservacoes(e.target.value)}
                placeholder="Instruções de acesso ao condomínio, materiais extras..."
                className="bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditorModalAberto(false)}
              className="border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => salvarCardMutation.mutate()}
              disabled={salvarCardMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {salvarCardMutation.isPending
                ? "Salvando e Sincronizando..."
                : "Salvar e Sincronizar Agenda"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================================================================== */}
      {/* MODAL DE CONFIRMAÇÃO PRÉVIA PARA EXCLUIR DO FLIGHT BOARD              */}
      {/* ===================================================================== */}
      <Dialog
        open={Boolean(cardParaExcluir)}
        onOpenChange={(open) => {
          if (!open) setCardParaExcluir(null);
        }}
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-red-700 dark:text-red-400 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Confirmar Exclusão do Agendamento
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-700 dark:text-slate-300 pt-1">
              Tem certeza que deseja remover{" "}
              <strong>
                {cardParaExcluir?.os_numero
                  ? `OS #${cardParaExcluir.os_numero} — ${cardParaExcluir.cliente_nome}`
                  : cardParaExcluir?.cliente_nome}
              </strong>{" "}
              do Flight Board e da agenda Google ({EMAIL_AGENDA_LOJA_PRINCIPAL})?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCardParaExcluir(null)}
              className="border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() =>
                cardParaExcluir && excluirCardMutation.mutate(cardParaExcluir)
              }
              disabled={excluirCardMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {excluirCardMutation.isPending
                ? "Excluindo..."
                : "Sim, Excluir Agendamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================================================================== */}
      {/* MODAL OFICIAL: VISUALIZADOR DE DOCUMENTOS (OS / VENDA)                */}
      {/* ===================================================================== */}
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
