import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Maximize2 } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequireAuth } from "@/components/require-auth";

export const Route = createFileRoute("/atalhos")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Atalhos de formulários — Splash Jardim do Trevo" },
      { name: "description", content: "Links diretos para todos os formulários e janelas do ERP: cadastros, vendas, compras, financeiro, fiscal e agenda." },
      { property: "og:title", content: "Atalhos de formulários — Splash Jardim do Trevo" },
      { property: "og:description", content: "Links diretos para todos os formulários e janelas do ERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <AtalhosPage />
    </RequireAuth>
  ),
});

type Atalho = { titulo: string; to: string; abrir?: string; nota?: string };

const grupos: { grupo: string; itens: Atalho[] }[] = [
  {
    grupo: "Cadastros",
    itens: [
      { titulo: "Novo cliente", to: "/clientes", abrir: "novo" },
      { titulo: "Novo produto ou serviço", to: "/produtos", abrir: "novo" },
      { titulo: "Novo fornecedor", to: "/fornecedores", abrir: "novo" },
      { titulo: "Novo colaborador", to: "/funcionarios", abrir: "novo" },
    ],
  },
  {
    grupo: "Vendas",
    itens: [
      { titulo: "Novo pedido (PDV)", to: "/vendas/novo" },
      { titulo: "Orçamentos", to: "/vendas/orcamentos" },
      { titulo: "Histórico de pedidos", to: "/vendas" },
      { titulo: "Formulário de Ordem de Serviço (impressão)", to: "/os/formulario" },
    ],
  },
  {
    grupo: "Logística & Obras",
    itens: [
      { titulo: "Novo compromisso na agenda", to: "/agenda", abrir: "novo" },
      { titulo: "Nova obra", to: "/logistica", abrir: "novo" },
      { titulo: "Nova ordem de serviço", to: "/ordens", abrir: "novo" },
      { titulo: "Registro de execução (materiais e horas)", to: "/ordens", nota: "Abra pelo botão da ordem desejada" },
    ],
  },
  {
    grupo: "Compras & Estoque",
    itens: [
      { titulo: "Criar ordem de compra", to: "/ordens-compra", abrir: "novo" },
      { titulo: "Condições de pagamento do fornecedor", to: "/ordens-compra", nota: "Abra na ordem ao faturar" },
      { titulo: "Lançar nota de compra", to: "/notas-compra", abrir: "novo" },
      { titulo: "Lançar entrada de estoque", to: "/estoque/entradas", abrir: "novo" },
      { titulo: "Inventário físico", to: "/estoque/inventario" },
      { titulo: "Central de reposição", to: "/compras" },
    ],
  },
  {
    grupo: "Financeiro",
    itens: [
      { titulo: "Novo lançamento financeiro", to: "/financeiro", abrir: "novo" },
      { titulo: "Despesas recorrentes", to: "/financeiro", nota: "Botão no topo da página" },
      { titulo: "Nova conta a pagar/receber", to: "/contas", abrir: "novo" },
      { titulo: "Nova categoria financeira", to: "/contas", abrir: "categoria" },
      { titulo: "Fluxo de caixa", to: "/fluxo-caixa" },
      { titulo: "Relatório de contas", to: "/relatorio-contas" },
      { titulo: "DRE", to: "/dre" },
    ],
  },
  {
    grupo: "Fiscal",
    itens: [
      { titulo: "Emitir nota (NF-e / NFS-e)", to: "/fiscal", abrir: "novo" },
      { titulo: "Configuração fiscal", to: "/fiscal/config" },
    ],
  },
  {
    grupo: "RH & Administração",
    itens: [
      { titulo: "Holerite e comissões", to: "/holerite" },
      { titulo: "Controle de acesso", to: "/acessos", nota: "Editar usuário e definir senha pela lista" },
      { titulo: "Importação de dados em lote", to: "/importacao" },
    ],
  },
];

function AtalhosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Atalhos de formulários"
        subtitle="Links diretos para abrir cada janela do sistema sem precisar procurar o botão."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Maximize2 className="size-4" /> Onde fica o botão de expansão
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Toda janela do sistema tem, no canto superior direito, dois ícones: o de expandir (quadrado com setas
          para fora), à esquerda do X de fechar. Clicando nele o formulário ocupa a tela inteira; clicando de novo
          ele volta ao tamanho normal.
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {grupos.map((g) => (
          <Card key={g.grupo}>
            <CardHeader>
              <CardTitle className="text-base">{g.grupo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {g.itens.map((item) => (
                <Link
                  key={item.titulo}
                  to={item.to}
                  search={item.abrir ? ({ abrir: item.abrir } as never) : undefined}
                  className="flex items-start justify-between gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted"
                >
                  <span>
                    {item.titulo}
                    {item.nota && (
                      <span className="block text-xs text-muted-foreground">{item.nota}</span>
                    )}
                  </span>
                  <ExternalLink className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
