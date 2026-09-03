import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Lock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/field";
import { PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useRoles, type Perfil } from "@/hooks/use-role";

export const Route = createFileRoute("/acessos")({
  head: () => ({
    meta: [
      { title: "Controle de Acesso | Piscinow ERP" },
      {
        name: "description",
        content: "Gestão de papéis de usuários (RBAC) e matriz de permissões do ERP.",
      },
      { property: "og:title", content: "Controle de Acesso | Piscinow ERP" },
      {
        property: "og:description",
        content: "Atribua e remova papéis de usuários e consulte a matriz de permissões.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Acessos />
    </RequireAuth>
  ),
});

const PERFIS: Perfil[] = ["admin", "gerente", "vendedor", "financeiro", "tecnico", "usuario"];

const LABEL_PERFIL: Record<Perfil, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  vendedor: "Vendedor",
  financeiro: "Financeiro",
  tecnico: "Técnico / Logística",
  usuario: "Usuário",
};

function Acessos() {
  const { isAdmin, loading } = useRoles();

  if (loading) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }

  if (!isAdmin) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Lock className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Acesso restrito</p>
            <p className="text-sm text-muted-foreground">
              Somente administradores podem gerenciar papéis de usuários.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <AcessosAdmin />;
}

function AcessosAdmin() {
  const qc = useQueryClient();
  const [novoPapel, setNovoPapel] = useState<Record<string, Perfil>>({});

  const { data: roles = [] } = useQuery({
    queryKey: ["all-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("id, user_id, role");
      if (error) throw error;
      return data;
    },
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ["usuarios-importados"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("usuarios_importados")
        .select("id, nome, email, perfil, ativo")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const adicionar = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Perfil }) => {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Papel adicionado.");
      qc.invalidateQueries({ queryKey: ["all-user-roles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Papel removido.");
      qc.invalidateQueries({ queryKey: ["all-user-roles"] });
    },
  });

  const usuariosComPapeis = useMemo(() => {
    const porUserId = new Map<string, typeof roles>();
    for (const r of roles) {
      const lista = porUserId.get(r.user_id) ?? [];
      lista.push(r);
      porUserId.set(r.user_id, lista);
    }
    const userIds = Array.from(porUserId.keys());
    return userIds.map((userId) => {
      const papeis = porUserId.get(userId) ?? [];
      const usuario = usuarios.find((u) => u.id === userId);
      return { userId, papeis, usuario };
    });
  }, [roles, usuarios]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Controle de Acesso"
        subtitle="Gestão de papéis (RBAC) e matriz de permissões por perfil."
      />

      <Card>
        <CardHeader>
          <CardTitle>Usuários e papéis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Papéis atuais</TableHead>
                <TableHead>Adicionar papel</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuariosComPapeis.map(({ userId, papeis, usuario }) => (
                <TableRow key={userId}>
                  <TableCell>{usuario?.nome ?? userId.slice(0, 8)}</TableCell>
                  <TableCell>{usuario?.email ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {papeis.map((p) => (
                        <Badge key={p.id} variant="secondary" className="gap-1">
                          {LABEL_PERFIL[p.role]}
                          <button
                            type="button"
                            onClick={() => remover.mutate(p.id)}
                            className="ml-1 text-muted-foreground hover:text-destructive"
                            aria-label="Remover papel"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </Badge>
                      ))}
                      {papeis.length === 0 && (
                        <span className="text-xs text-muted-foreground">Nenhum papel</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={novoPapel[userId] ?? PERFIS[0]}
                      onValueChange={(v) => setNovoPapel((n) => ({ ...n, [userId]: v as Perfil }))}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PERFIS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {LABEL_PERFIL[p]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adicionar.mutate({ userId, role: novoPapel[userId] ?? PERFIS[0] })}
                    >
                      <Plus className="size-3.5" /> Adicionar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {usuariosComPapeis.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    Nenhum usuário com papel atribuído ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuários importados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil sugerido</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.nome ?? "—"}</TableCell>
                  <TableCell>{u.email ?? "—"}</TableCell>
                  <TableCell>{u.perfil ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={u.ativo ? "secondary" : "outline"}>{u.ativo ? "Ativo" : "Inativo"}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matriz de permissões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <MatrizItem
            perfil="Administrador"
            descricao="Acesso total a todos os módulos: cadastros, vendas, logística, compras, financeiro, RH e controle de acesso."
          />
          <MatrizItem
            perfil="Vendedor"
            descricao="Clientes, novo pedido, consulta de pedidos, estoque em modo leitura e visualização das próprias comissões."
          />
          <MatrizItem
            perfil="Logística"
            descricao="Flight board, ordens de serviço, entradas de estoque e inventário."
          />
          <MatrizItem
            perfil="Financeiro"
            descricao="Fluxo de caixa, contas a pagar/receber, central de compras, DRE e folha de pagamento."
          />
        </CardContent>
      </Card>
    </div>
  );
}

function MatrizItem({ perfil, descricao }: { perfil: string; descricao: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="font-medium">{perfil}</p>
      <p className="mt-1 text-muted-foreground">{descricao}</p>
    </div>
  );
}
