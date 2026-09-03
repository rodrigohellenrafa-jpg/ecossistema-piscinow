/** Helpers compartilhados do Piscinow ERP. */

export const brl = (n: number | null | undefined) =>
  Number(n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const num = (v: unknown) => {
  if (typeof v === "number") return v;
  const s = String(v ?? "").trim();
  if (!s) return 0;
  const limpo = s.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const n = Number(limpo);
  return Number.isFinite(n) ? n : 0;
};

export const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export const dataBR = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
};

export const hojeISO = () => new Date().toISOString().slice(0, 10);

export const addDiasUteis = (inicioISO: string, dias: number) => {
  const d = new Date(`${inicioISO}T12:00:00`);
  let restantes = dias;
  while (restantes > 0) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) restantes--;
  }
  return d.toISOString().slice(0, 10);
};

export const diasAte = (iso: string | null | undefined) => {
  if (!iso) return null;
  const alvo = new Date(`${iso.slice(0, 10)}T12:00:00`).getTime();
  const hoje = new Date(`${hojeISO()}T12:00:00`).getTime();
  return Math.round((alvo - hoje) / 86_400_000);
};

export const mesLabel = (iso: string) =>
  new Date(`${iso.slice(0, 7)}-01T12:00:00`).toLocaleDateString("pt-BR", {
    month: "short",
    year: "2-digit",
  });

/** Margem bruta a partir de preço e custo. */
export const margem = (preco: number, custo: number) =>
  preco > 0 ? (preco - custo) / preco : 0;

export const CATEGORIAS_PRODUTO = [
  "Piscinas",
  "Filtros",
  "Bombas",
  "Aquecedores",
  "Químicos",
  "Dispositivos",
  "Iluminação",
  "Acabamento",
  "Serviços",
] as const;

export const ETAPAS_FUNIL = ["Lead", "Orçamento", "Aprovado", "Pós-venda"] as const;

export const STATUS_PEDIDO = [
  "orcamento",
  "aprovado",
  "em_producao",
  "concluido",
  "cancelado",
] as const;

export const STATUS_OBRA = ["Agendado", "Em Execução", "Pausado", "Concluído"] as const;

export const ETAPAS_OBRA = [
  { key: "etapa_escavacao", label: "Escavação" },
  { key: "etapa_base", label: "Nivelamento da base" },
  { key: "etapa_nivel", label: "Nível e prumo" },
  { key: "etapa_esquadro", label: "Esquadro" },
  { key: "etapa_furacao", label: "Furação de dispositivos" },
  { key: "etapa_tubulacao", label: "Tubulação / duto" },
  { key: "etapa_casa_maquinas", label: "Casa de máquinas" },
  { key: "etapa_motor", label: "Instalação e teste do motor" },
  { key: "etapa_aquecimento", label: "Aquecimento" },
  { key: "etapa_cascata", label: "Cascata / acessórios" },
] as const;

export type EtapaKey = (typeof ETAPAS_OBRA)[number]["key"];

export const FORMAS_PAGAMENTO = [
  "Pix",
  "Dinheiro",
  "Cartão de Crédito",
  "Boleto",
  "Financiamento bancário",
  "Transferência",
] as const;

/** Gera o próximo código sequencial no formato PREFIXO-000. */
export const proximoCodigo = (prefixo: string, existentes: (string | null)[]) => {
  const max = existentes.reduce((acc, c) => {
    const m = c?.match(new RegExp(`^${prefixo}-(\\d+)$`));
    return m ? Math.max(acc, Number(m[1])) : acc;
  }, 0);
  return `${prefixo}-${String(max + 1).padStart(3, "0")}`;
};
