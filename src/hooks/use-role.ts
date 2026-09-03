import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export type Perfil = "admin" | "gerente" | "vendedor" | "financeiro" | "tecnico" | "usuario";

/** Perfis que enxergam cada pólo do ERP. */
export const ACESSO: Record<string, Perfil[]> = {
  cadastros: ["admin", "gerente", "vendedor", "financeiro"],
  vendas: ["admin", "gerente", "vendedor"],
  logistica: ["admin", "gerente", "tecnico"],
  compras: ["admin", "gerente", "financeiro", "tecnico"],
  financeiro: ["admin", "gerente", "financeiro"],
  rh: ["admin", "gerente", "financeiro"],
  admin: ["admin"],
};

export function useRoles() {
  const { user, loading } = useAuth();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["user-roles", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data.map((r) => r.role as Perfil);
    },
  });

  // Sem papel atribuído o usuário opera como administrador (setup inicial).
  const efetivos: Perfil[] = roles.length ? roles : ["admin"];

  return {
    roles: efetivos,
    loading: loading || isLoading,
    isAdmin: efetivos.includes("admin"),
    pode: (area: keyof typeof ACESSO) =>
      efetivos.some((r) => ACESSO[area]?.includes(r)),
  };
}
