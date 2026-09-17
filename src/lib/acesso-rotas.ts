import type { ACESSO } from "@/hooks/use-role";

export type Area = keyof typeof ACESSO;

/** Área exigida por cada endereço do sistema (o prefixo mais longo vence). */
const MAPA: { prefixo: string; area: Area }[] = [
  { prefixo: "/clientes", area: "cadastros" },
  { prefixo: "/produtos", area: "cadastros" },
  { prefixo: "/precificacao", area: "cadastros" },
  { prefixo: "/fornecedores", area: "compras" },
  { prefixo: "/funcionarios", area: "rh" },
  { prefixo: "/vendas", area: "vendas" },
  { prefixo: "/reativacao", area: "vendas" },
  { prefixo: "/logistica", area: "logistica" },
  { prefixo: "/ordens-compra", area: "compras" },
  { prefixo: "/ordens", area: "logistica" },
  { prefixo: "/obras", area: "logistica" },
  { prefixo: "/os", area: "logistica" },
  { prefixo: "/compras", area: "compras" },
  { prefixo: "/estoque", area: "compras" },
  { prefixo: "/notas-compra", area: "compras" },
  { prefixo: "/fluxo-caixa", area: "financeiro" },
  { prefixo: "/financeiro", area: "financeiro" },
  { prefixo: "/contas", area: "financeiro" },
  { prefixo: "/relatorio-contas", area: "financeiro" },
  { prefixo: "/dre", area: "financeiro" },
  { prefixo: "/indicadores", area: "financeiro" },
  { prefixo: "/fiscal", area: "financeiro" },
  { prefixo: "/holerite", area: "rh" },
  { prefixo: "/importacao", area: "admin" },
  { prefixo: "/acessos", area: "admin" },
  { prefixo: "/atalhos", area: "admin" },
];

/** Endereços abertos a qualquer pessoa autenticada (ou sem login). */
export const ROTAS_LIVRES = ["/auth", "/reset-password", "/", "/sitemap.xml"];

export function areaDaRota(pathname: string): Area | null {
  const achados = MAPA.filter(
    (m) => pathname === m.prefixo || pathname.startsWith(`${m.prefixo}/`),
  ).sort((a, b) => b.prefixo.length - a.prefixo.length);
  return achados[0]?.area ?? null;
}
