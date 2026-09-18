import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import { telasDaRota } from "@/lib/telas";
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
        .eq("user_id", user?.id ?? "");
      if (error) throw error;
      return data.map((r) => r.role as Perfil);
    },
  });

  const { data: telas = [], isLoading: carregandoTelas } = useQuery({
    queryKey: ["permissoes-telas", user?.id], enabled: !!user?.id, refetchInterval: 5000,
    queryFn: async () => {
      const {data,error}=await supabase.from("permissoes_telas").select("telas").eq("user_id",user?.id ?? "").maybeSingle();
      if(error) throw error;
      return data?.telas ?? [];
    },
  });
  const isAdmin=roles.includes("admin");
  const podeTela=(tela:string)=>isAdmin || telas.includes(tela);
  return { roles, mestre:false, loading:loading || isLoading || carregandoTelas, isAdmin, telas, podeTela,
    podeRota:(path:string)=>telasDaRota(path).some(podeTela),
    pode:(area:keyof typeof ACESSO)=>roles.some(r=>ACESSO[area]?.includes(r)),
  };
}
