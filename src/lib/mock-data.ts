export type OSStatus =
  | "Pendente"
  | "Escavação"
  | "Base"
  | "Instalação"
  | "Acabamento"
  | "Concluído";

export const OS_STATUSES: OSStatus[] = [
  "Pendente",
  "Escavação",
  "Base",
  "Instalação",
  "Acabamento",
  "Concluído",
];

export interface Cliente {
  id: string;
  nome: string;
  contato: string;
  cidade: string;
}

export interface Produto {
  sku: string;
  descricao: string;
  categoria: string;
  precoVenda: number;
  custo: number;
  estoqueAtual: number;
  estoqueMinimo: number;
}

export interface OrdemServico {
  id: string;
  clienteId: string;
  cliente: string;
  servicoTipo: string;
  prazoDias: number;
  data: string;
  status: OSStatus;
  responsavel: string;
}

export interface Venda {
  id: string;
  data: string;
  cliente: string;
  vendedor: string;
  totalLiquido: number;
  formaPagamento: string;
  statusPagamento: "Pago" | "Pendente" | "Atrasado";
}

export const clientes: Cliente[] = [
  { id: "c1", nome: "Condomínio Vale Azul", contato: "(11) 98811-2233", cidade: "Campinas" },
  { id: "c2", nome: "Marcos Andrade", contato: "(11) 99742-1180", cidade: "Valinhos" },
  { id: "c3", nome: "Hotel Cascata", contato: "(19) 3232-4410", cidade: "Indaiatuba" },
  { id: "c4", nome: "Juliana Prado", contato: "(19) 99120-7788", cidade: "Vinhedo" },
  { id: "c5", nome: "Clube Náutico Sol", contato: "(19) 3777-2020", cidade: "Americana" },
];

export const produtos: Produto[] = [
  { sku: "PIS-8X4", descricao: "Piscina Fibra 8x4m", categoria: "Piscinas", precoVenda: 42900, custo: 27500, estoqueAtual: 4, estoqueMinimo: 2 },
  { sku: "PIS-6X3", descricao: "Piscina Fibra 6x3m", categoria: "Piscinas", precoVenda: 28900, custo: 18200, estoqueAtual: 1, estoqueMinimo: 3 },
  { sku: "BMB-075", descricao: "Bomba 3/4 CV", categoria: "Equipamentos", precoVenda: 1290, custo: 780, estoqueAtual: 12, estoqueMinimo: 5 },
  { sku: "FLT-500", descricao: "Filtro 500mm", categoria: "Equipamentos", precoVenda: 1890, custo: 1120, estoqueAtual: 2, estoqueMinimo: 4 },
  { sku: "ILU-LED", descricao: "Refletor LED RGB", categoria: "Iluminação", precoVenda: 640, custo: 310, estoqueAtual: 24, estoqueMinimo: 8 },
  { sku: "QUI-CLO", descricao: "Cloro Granulado 10kg", categoria: "Químicos", precoVenda: 320, custo: 175, estoqueAtual: 3, estoqueMinimo: 10 },
  { sku: "ACB-DEK", descricao: "Deck Madeira m²", categoria: "Acabamento", precoVenda: 480, custo: 260, estoqueAtual: 65, estoqueMinimo: 20 },
];

export const ordensServico: OrdemServico[] = [
  { id: "OS-1042", clienteId: "c1", cliente: "Condomínio Vale Azul", servicoTipo: "Instalação 8x4", prazoDias: 21, data: "2026-07-12", status: "Escavação", responsavel: "Equipe A" },
  { id: "OS-1043", clienteId: "c2", cliente: "Marcos Andrade", servicoTipo: "Instalação 6x3", prazoDias: 15, data: "2026-07-18", status: "Pendente", responsavel: "Equipe B" },
  { id: "OS-1044", clienteId: "c3", cliente: "Hotel Cascata", servicoTipo: "Reforma + Deck", prazoDias: 30, data: "2026-07-02", status: "Instalação", responsavel: "Equipe A" },
  { id: "OS-1045", clienteId: "c4", cliente: "Juliana Prado", servicoTipo: "Instalação 6x3", prazoDias: 18, data: "2026-06-28", status: "Acabamento", responsavel: "Equipe C" },
  { id: "OS-1046", clienteId: "c5", cliente: "Clube Náutico Sol", servicoTipo: "Manutenção anual", prazoDias: 7, data: "2026-07-22", status: "Base", responsavel: "Equipe B" },
  { id: "OS-1039", clienteId: "c2", cliente: "Marcos Andrade", servicoTipo: "Troca de bomba", prazoDias: 3, data: "2026-06-10", status: "Concluído", responsavel: "Equipe C" },
];

export const vendas: Venda[] = [
  { id: "PED-2051", data: "2026-07-22", cliente: "Clube Náutico Sol", vendedor: "Ana Lima", totalLiquido: 18400, formaPagamento: "PIX", statusPagamento: "Pago" },
  { id: "PED-2050", data: "2026-07-18", cliente: "Marcos Andrade", vendedor: "Bruno Souza", totalLiquido: 31200, formaPagamento: "Cartão 6x", statusPagamento: "Pendente" },
  { id: "PED-2049", data: "2026-07-12", cliente: "Condomínio Vale Azul", vendedor: "Ana Lima", totalLiquido: 48750, formaPagamento: "Boleto 3x", statusPagamento: "Pago" },
  { id: "PED-2048", data: "2026-07-02", cliente: "Hotel Cascata", vendedor: "Carla Reis", totalLiquido: 62300, formaPagamento: "Transferência", statusPagamento: "Atrasado" },
];

export const fluxoMensal = [
  { mes: "Fev", receita: 128000, despesa: 94000 },
  { mes: "Mar", receita: 156000, despesa: 101000 },
  { mes: "Abr", receita: 142000, despesa: 98500 },
  { mes: "Mai", receita: 189000, despesa: 121000 },
  { mes: "Jun", receita: 174000, despesa: 112000 },
  { mes: "Jul", receita: 210500, despesa: 128400 },
];

export const vendedores = ["Ana Lima", "Bruno Souza", "Carla Reis"];

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
