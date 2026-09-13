export type CampoTipo = "texto" | "numero" | "moeda" | "data" | "booleano";

export interface CampoImport {
  coluna: string;
  rotulo: string;
  tipo: CampoTipo;
  aliases: string[];
  obrigatorio?: boolean;
}

export interface EntidadeImport {
  id: string;
  titulo: string;
  descricao: string;
  /** Coluna usada para detectar duplicidades (no arquivo e no banco). */
  chave?: string;
  tabela:
    | "usuarios_importados"
    | "clientes"
    | "produtos"
    | "vendas"
    | "contas"
    | "lancamentos_financeiros";
  campos: CampoImport[];
}

const norm = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

/** Encontra o cabeçalho do CSV que corresponde a um campo da tabela. */
export function acharCabecalho(campo: CampoImport, cabecalhos: string[]) {
  const alvos = [campo.coluna, campo.rotulo, ...campo.aliases].map(norm);
  return cabecalhos.find((h) => alvos.includes(norm(h))) ?? null;
}

/** "R$ 1.500,00" -> 1500 */
export function paraNumero(valor: unknown): number | null {
  if (valor === null || valor === undefined) return null;
  const bruto = String(valor).trim();
  if (!bruto) return null;
  let s = bruto.replace(/[^\d,.-]/g, "");
  if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "").replace(",", ".");
  else if (s.includes(",")) s = s.replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** "31/12/2025" -> "2025-12-31" (aceita também ISO e 31-12-25) */
export function paraDataISO(valor: unknown): string | null {
  if (valor === null || valor === undefined) return null;
  const s = String(valor).trim();
  if (!s) return null;
  let iso = s;
  const m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/);
  if (m) {
    const [, d = "", mes = "", a = ""] = m;
    iso = `${a.length === 2 ? `20${a}` : a}-${mes.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const dt = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(dt.getTime()) || dt.toISOString().slice(0, 10) !== iso ? null : iso;
}

export function paraBooleano(valor: unknown): boolean {
  const s = norm(String(valor ?? ""));
  return !["nao", "n", "false", "0", "inativo", "off", ""].includes(s);
}

export function converter(tipo: CampoTipo, valor: unknown) {
  switch (tipo) {
    case "numero":
    case "moeda":
      return paraNumero(valor);
    case "data":
      return paraDataISO(valor);
    case "booleano":
      return paraBooleano(valor);
    default: {
      const s = String(valor ?? "").trim();
      return s === "" ? null : s;
    }
  }
}

export const ENTIDADES: EntidadeImport[] = [
  {
    id: "usuarios",
    titulo: "Usuários / Controle de Acesso",
    descricao: "Aba de Controle de Acesso: nome, e-mail e perfil de cada pessoa da equipe.",
    tabela: "usuarios_importados",
    chave: "email",
    campos: [
      { coluna: "nome", rotulo: "Nome", tipo: "texto", aliases: ["usuario", "colaborador", "funcionario"], obrigatorio: true },
      { coluna: "email", rotulo: "E-mail", tipo: "texto", aliases: ["e-mail", "login", "gmail"] },
      { coluna: "perfil", rotulo: "Perfil", tipo: "texto", aliases: ["nivel", "nivel de acesso", "cargo", "funcao", "permissao", "role"] },
      { coluna: "ativo", rotulo: "Ativo", tipo: "booleano", aliases: ["status", "situacao"] },
      { coluna: "observacoes", rotulo: "Observações", tipo: "texto", aliases: ["obs", "notas"] },
    ],
  },
  {
    id: "clientes",
    titulo: "Cadastro de Clientes",
    descricao: "Clientes PF/PJ com contato e endereço.",
    tabela: "clientes",
    chave: "documento",
    campos: [
      { coluna: "nome", rotulo: "Nome", tipo: "texto", aliases: ["cliente", "razao social", "nome fantasia"], obrigatorio: true },
      { coluna: "tipo", rotulo: "Tipo", tipo: "texto", aliases: ["pf pj", "pessoa"] },
      { coluna: "documento", rotulo: "Documento", tipo: "texto", aliases: ["cpf", "cnpj", "cpf cnpj"] },
      { coluna: "email", rotulo: "E-mail", tipo: "texto", aliases: ["e-mail"] },
      { coluna: "telefone", rotulo: "Telefone", tipo: "texto", aliases: ["celular", "contato", "whatsapp", "fone"] },
      { coluna: "cep", rotulo: "CEP", tipo: "texto", aliases: [] },
      { coluna: "logradouro", rotulo: "Logradouro", tipo: "texto", aliases: ["endereco", "rua"] },
      { coluna: "numero", rotulo: "Número", tipo: "texto", aliases: ["nº", "num"] },
      { coluna: "complemento", rotulo: "Complemento", tipo: "texto", aliases: [] },
      { coluna: "bairro", rotulo: "Bairro", tipo: "texto", aliases: [] },
      { coluna: "cidade", rotulo: "Cidade", tipo: "texto", aliases: ["municipio"] },
      { coluna: "estado", rotulo: "Estado", tipo: "texto", aliases: ["uf"] },
      { coluna: "observacoes", rotulo: "Observações", tipo: "texto", aliases: ["obs"] },
    ],
  },
  {
    id: "produtos",
    titulo: "Cadastro de Produtos (Estoque)",
    descricao: "Catálogo com preços, estoque atual e estoque mínimo.",
    tabela: "produtos",
    chave: "codigo",
    campos: [
      { coluna: "nome", rotulo: "Nome", tipo: "texto", aliases: ["produto", "descricao", "item"], obrigatorio: true },
      { coluna: "codigo", rotulo: "Código", tipo: "texto", aliases: ["sku", "ref", "referencia"] },
      { coluna: "categoria", rotulo: "Categoria", tipo: "texto", aliases: ["grupo", "linha"] },
      { coluna: "tipo", rotulo: "Tipo", tipo: "texto", aliases: ["produto servico"] },
      { coluna: "unidade", rotulo: "Unidade", tipo: "texto", aliases: ["un", "medida"] },
      { coluna: "preco_custo", rotulo: "Preço de custo", tipo: "moeda", aliases: ["custo", "preco custo", "valor custo"] },
      { coluna: "preco_venda", rotulo: "Preço de venda", tipo: "moeda", aliases: ["venda", "preco venda", "preco", "valor venda"] },
      { coluna: "estoque_atual", rotulo: "Estoque atual", tipo: "numero", aliases: ["estoque", "qtd", "quantidade", "saldo"] },
      { coluna: "estoque_minimo", rotulo: "Estoque mínimo", tipo: "numero", aliases: ["minimo", "estoque min"] },
      { coluna: "descricao", rotulo: "Descrição", tipo: "texto", aliases: ["detalhes"] },
    ],
  },
  {
    id: "vendas",
    titulo: "Histórico de Vendas",
    descricao: "Pedidos já realizados, com vendedor, valor e forma de pagamento.",
    tabela: "vendas",
    chave: "numero",
    campos: [
      { coluna: "numero", rotulo: "Número", tipo: "texto", aliases: ["pedido", "n pedido", "id", "os"] },
      { coluna: "cliente_nome", rotulo: "Cliente", tipo: "texto", aliases: ["nome cliente", "comprador"], obrigatorio: true },
      { coluna: "vendedor", rotulo: "Vendedor", tipo: "texto", aliases: ["responsavel", "consultor"] },
      { coluna: "data", rotulo: "Data", tipo: "data", aliases: ["data venda", "emissao", "data pedido"] },
      { coluna: "forma_pagamento", rotulo: "Forma de pagamento", tipo: "texto", aliases: ["pagamento", "condicao"] },
      { coluna: "status_pagamento", rotulo: "Status", tipo: "texto", aliases: ["situacao", "status pagamento"] },
      { coluna: "valor_total", rotulo: "Valor total", tipo: "moeda", aliases: ["total", "valor", "total liquido", "valor liquido"] },
      { coluna: "observacoes", rotulo: "Observações", tipo: "texto", aliases: ["obs"] },
    ],
  },
  {
    id: "financeiro",
    titulo: "Contas a Pagar e Receber em Lote",
    descricao: "Contas a pagar e a receber com vencimento e baixa.",
    tabela: "contas",
    chave: "descricao",
    campos: [
      { coluna: "tipo", rotulo: "Tipo", tipo: "texto", aliases: ["pagar receber", "natureza"], obrigatorio: true },
      { coluna: "descricao", rotulo: "Descrição", tipo: "texto", aliases: ["historico", "titulo", "lancamento"], obrigatorio: true },
      { coluna: "valor_juros", rotulo: "Juros", tipo: "moeda", aliases: ["juros"] },
      { coluna: "parceiro", rotulo: "Fornecedor / Cliente", tipo: "texto", aliases: ["fornecedor", "cliente", "favorecido"] },
      { coluna: "categoria", rotulo: "Categoria", tipo: "texto", aliases: ["plano de contas", "grupo"] },
      { coluna: "valor", rotulo: "Valor", tipo: "moeda", aliases: ["total", "montante"], obrigatorio: true },
      { coluna: "vencimento", rotulo: "Vencimento", tipo: "data", aliases: ["data vencimento", "venc"], obrigatorio: true },
      { coluna: "status", rotulo: "Status", tipo: "texto", aliases: ["situacao"] },
      { coluna: "data_pagamento", rotulo: "Data de pagamento", tipo: "data", aliases: ["pagamento", "baixa", "data baixa"] },
      { coluna: "observacoes", rotulo: "Observações", tipo: "texto", aliases: ["obs"] },
    ],
  },
  {
    id: "lancamentos",
    titulo: "Lançamentos Financeiros em Lote",
    descricao: "Receitas e despesas do fluxo de caixa.",
    tabela: "lancamentos_financeiros",
    campos: [
      { coluna: "tipo_fluxo", rotulo: "Tipo (receita/despesa)", tipo: "texto", aliases: ["tipo", "natureza"], obrigatorio: true },
      { coluna: "descricao", rotulo: "Descrição", tipo: "texto", aliases: ["historico", "titulo"], obrigatorio: true },
      { coluna: "categoria", rotulo: "Categoria", tipo: "texto", aliases: ["plano de contas"], obrigatorio: true },
      { coluna: "valor", rotulo: "Valor", tipo: "moeda", aliases: ["total"], obrigatorio: true },
      { coluna: "data_competencia", rotulo: "Competência", tipo: "data", aliases: ["data", "competencia"], obrigatorio: true },
      { coluna: "vencimento", rotulo: "Vencimento", tipo: "data", aliases: ["data vencimento"] },
      { coluna: "data_pagamento", rotulo: "Data de pagamento", tipo: "data", aliases: ["baixa"] },
      { coluna: "status", rotulo: "Status", tipo: "texto", aliases: ["situacao"] },
      { coluna: "conta_bancaria", rotulo: "Conta bancária", tipo: "texto", aliases: ["banco"] },
      { coluna: "forma_pagamento", rotulo: "Forma de pagamento", tipo: "texto", aliases: ["forma"] },
      { coluna: "observacoes", rotulo: "Observações", tipo: "texto", aliases: ["obs"] },
    ],
  },
];

export function normalizarFinanceiro(tabela: string, reg: Record<string, unknown>) {
  if (!["contas", "lancamentos_financeiros"].includes(tabela)) return reg;
  const contas = tabela === "contas";
  const campo = contas ? "tipo" : "tipo_fluxo";
  const tipo = norm(String(reg[campo] ?? ""));
  reg[campo] = ["pagar", "contasapagar", "apagar", "despesa", "saida"].includes(tipo)
    ? (contas ? "pagar" : "despesa")
    : ["receber", "contasareceber", "areceber", "receita", "entrada"].includes(tipo)
      ? (contas ? "receber" : "receita") : tipo;
  const status = norm(String(reg.status ?? ""));
  reg.status = ["pago", "recebido", "baixado", "realizado"].includes(status)
    ? (contas ? "pago" : "Pago")
    : ["", "aberto", "pendente", "previsto"].includes(status)
      ? (contas ? "aberto" : "Pendente") : status;
  return reg;
}

