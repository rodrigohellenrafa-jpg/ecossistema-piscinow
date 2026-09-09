import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import { useMestre } from "@/hooks/use-mestre";
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
  const { mestre } = useMestre();

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
  const base: Perfil[] = roles.length ? roles : ["admin"];
  // Modo mestre destravado neste aparelho: enxerga e opera tudo.
  const efetivos: Perfil[] = mestre ? ["admin", ...base.filter((r) => r !== "admin")] : base;

  return {
    roles: efetivos,
    mestre,
    loading: loading || isLoading,
    isAdmin: mestre || efetivos.includes("admin"),
    pode: (area: keyof typeof ACESSO) =>
      mestre || efetivos.some((r) => ACESSO[area]?.includes(r)),
  };
}
