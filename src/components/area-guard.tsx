import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useRoles } from "@/hooks/use-role";


/** Bloqueia a página quando o perfil do usuário não tem acesso à área. */
export function AreaGuard({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { session, loading: authLoading } = useAuth();
  const { podeRota, loading } = useRoles();

  if (["/auth", "/reset-password", "/sitemap.xml"].includes(pathname)) return <>{children}</>;

  if (authLoading || loading) {
    return <p className="p-6 text-sm text-muted-foreground">Carregando permissões…</p>;
  }

  // A autenticação precisa ser oferecida antes da verificação de telas.
  // Cada rota privada renderiza RequireAuth, que exibe o botão Entrar.
  if (!session) return <>{children}</>;

  if (!podeRota(pathname)) {
    return (
      <div className="mx-auto max-w-md py-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-destructive" /> Acesso restrito
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Seu perfil não tem permissão para abrir esta página.</p>
            <p>Peça ao administrador para liberar o acesso em Controle de Acesso.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
