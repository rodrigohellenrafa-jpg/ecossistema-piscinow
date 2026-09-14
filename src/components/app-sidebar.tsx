import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  ShoppingCart,
  Wallet,
  KanbanSquare,
  Waves,
  ClipboardList,
  Receipt,
  BarChart3,
  Upload,
  FileText,
  Factory,
  Contact,
  Boxes,
  ClipboardCheck,
  PiggyBank,
  BadgeDollarSign,
  ShieldCheck,
  CalendarDays,
  MessageCircle,
  Link2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRoles, type ACESSO } from "@/hooks/use-role";

type Area = keyof typeof ACESSO;

const groups: {
  label: string;
  area: Area;
  items: { title: string; url: string; icon: typeof Users }[];
}[] = [
  {
    label: "Principal",
    area: "cadastros",
    items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
  },
  {
    label: "Cadastros",
    area: "cadastros",
    items: [
      { title: "Clientes", url: "/clientes", icon: Users },
      { title: "Produtos & Estoque", url: "/produtos", icon: Package },
      { title: "Fornecedores", url: "/fornecedores", icon: Factory },
      { title: "Colaboradores", url: "/funcionarios", icon: Contact },
    ],
  },
  {
    label: "Vendas",
    area: "vendas",
    items: [
      { title: "Novo Pedido (PDV)", url: "/vendas/novo", icon: ShoppingCart },
      { title: "Orçamentos", url: "/vendas/orcamentos", icon: FileText },
      { title: "Histórico de Pedidos", url: "/vendas", icon: ClipboardList },
      { title: "Reativação de Clientes", url: "/reativacao", icon: MessageCircle },
    ],
  },
  {
    label: "Logística & Obras",
    area: "logistica",
    items: [
      { title: "Agenda da Equipe", url: "/agenda", icon: CalendarDays },
      { title: "Flight Board", url: "/logistica", icon: KanbanSquare },
      { title: "Ordens de Serviço", url: "/ordens", icon: ClipboardCheck },
    ],
  },
  {
    label: "Compras & Estoque",
    area: "compras",
    items: [
      { title: "Central de Reposição", url: "/compras", icon: Truck },
      { title: "Ordens de Compra", url: "/ordens-compra", icon: FileText },
      { title: "Entradas de Estoque", url: "/estoque/entradas", icon: Boxes },
      { title: "Inventário Físico", url: "/estoque/inventario", icon: ClipboardList },
      { title: "Relatório de Estoque", url: "/estoque/relatorio", icon: Boxes },
      { title: "Notas de Compra", url: "/notas-compra", icon: Receipt },
    ],
  },
  {
    label: "Financeiro",
    area: "financeiro",
    items: [
      { title: "Fluxo de Caixa", url: "/fluxo-caixa", icon: Wallet },
      { title: "Lançamentos Financeiros", url: "/financeiro", icon: BadgeDollarSign },
      { title: "Contas a Pagar/Receber", url: "/contas", icon: Receipt },
      { title: "Relatório de Contas", url: "/relatorio-contas", icon: BarChart3 },
      { title: "DRE", url: "/dre", icon: PiggyBank },
    ],
  },
  {
    label: "Fiscal",
    area: "financeiro",
    items: [
      { title: "Emissão de Notas", url: "/fiscal", icon: FileText },
      { title: "Configuração Fiscal", url: "/fiscal/config", icon: ShieldCheck },
    ],
  },
  {
    label: "RH & Comissões",
    area: "rh",
    items: [{ title: "Holerite & Comissões", url: "/holerite", icon: BadgeDollarSign }],
  },
  {
    label: "Administração",
    area: "admin",
    items: [
      { title: "Importação de Dados", url: "/importacao", icon: Upload },
      { title: "Controle de Acesso", url: "/acessos", icon: ShieldCheck },
      { title: "Atalhos de Formulários", url: "/atalhos", icon: Link2 },
    ],
  },

];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const { pode } = useRoles();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Waves className="size-4" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold tracking-tight">Splash Jardim do Trevo</p>
            <p className="truncate text-xs text-muted-foreground">ERP &amp; CRM</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups
          .filter((g) => pode(g.area))
          .map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={currentPath === item.url}
                      >
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
      </SidebarContent>
    </Sidebar>
  );
}
