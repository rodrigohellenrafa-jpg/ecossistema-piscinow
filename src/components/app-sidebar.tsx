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

const groups = [
  {
    label: "Principal",
    items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
  },
  {
    label: "Cadastros",
    items: [
      { title: "Clientes", url: "/clientes", icon: Users },
      { title: "Produtos", url: "/produtos", icon: Package },
    ],
  },
  {
    label: "Vendas",
    items: [
      { title: "Novo Pedido (PDV)", url: "/vendas/novo", icon: ShoppingCart },
      { title: "Histórico", url: "/vendas", icon: ClipboardList },
    ],
  },
  {
    label: "Logística",
    items: [
      { title: "Ordens de Serviço", url: "/ordens", icon: ClipboardList },
      { title: "Flight Board", url: "/logistica", icon: KanbanSquare },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { title: "Fluxo de Caixa", url: "/financeiro", icon: Wallet },
      { title: "Contas a Pagar/Receber", url: "/contas", icon: Receipt },
      { title: "Relatório de Contas", url: "/relatorio-contas", icon: BarChart3 },
      { title: "Compras", url: "/compras", icon: Truck },
      { title: "Notas de Compra", url: "/notas-compra", icon: FileText },


    ],
  },
  {
    label: "Administrativo",
    items: [{ title: "Importação de Dados", url: "/importacao", icon: Upload }],
  },
] as const;

export function AppSidebar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Waves className="size-4" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold tracking-tight">Piscinow</p>
            <p className="truncate text-xs text-muted-foreground">ERP &amp; CRM</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
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
