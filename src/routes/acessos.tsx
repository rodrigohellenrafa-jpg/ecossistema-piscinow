import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, KeyRound, Lock, Pencil, Plus, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";


import { PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRoles, type Perfil } from "@/hooks/use-role";
import {
  criarUsuario,
  definirPapeis,
  listarUsuarios,
  redefinirSenha,
  removerUsuario,
} from "@/lib/usuarios.functions";


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
  const fetchUsuarios = useServerFn(listarUsuarios);
  const doCriar = useServerFn(criarUsuario);
  const doRemover = useServerFn(removerUsuario);
  const doDefinirPapeis = useServerFn(definirPapeis);
  const doRedefinirSenha = useServerFn(redefinirSenha);


  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [perfis, setPerfis] = useState<Perfil[]>(["usuario"]);
  const [senhaGerada, setSenhaGerada] = useState<string | null>(null);
  const [senhaDefinida, setSenhaDefinida] = useState(false);
  const [editando, setEditando] = useState<{ id: string; nome: string; perfis: Perfil[] } | null>(
    null,
  );
  const [trocandoSenha, setTrocandoSenha] = useState<{ id: string; nome: string } | null>(null);
  const [novaSenha, setNovaSenha] = useState("");

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ["usuarios-sistema"],
    queryFn: () => fetchUsuarios(),
  });

  const criar = useMutation({
    mutationFn: doCriar,
    onSuccess: (res) => {
      toast.success("Usuário criado com sucesso.");
      setSenhaGerada(res.senhaTemporaria);
      setSenhaDefinida(Boolean(senha.trim()));
      setEmail("");
      setNome("");
      setSenha("");
      setPerfis(["usuario"]);
      qc.invalidateQueries({ queryKey: ["usuarios-sistema"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: doRemover,
    onSuccess: () => {
      toast.success("Usuário removido.");
      qc.invalidateQueries({ queryKey: ["usuarios-sistema"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const salvarPapeis = useMutation({
    mutationFn: doDefinirPapeis,
    onSuccess: () => {
      toast.success("Funções atualizadas.");
      setEditando(null);
      qc.invalidateQueries({ queryKey: ["usuarios-sistema"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const trocarSenha = useMutation({
    mutationFn: doRedefinirSenha,
    onSuccess: () => {
      toast.success("Senha atualizada.");
      setTrocandoSenha(null);
      setNovaSenha("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const alternarPerfil = (lista: Perfil[], p: Perfil) =>
    lista.includes(p) ? lista.filter((x) => x !== p) : [...lista, p];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (perfis.length === 0) {
      toast.error("Selecione ao menos uma função.");
      return;
    }
    setSenhaGerada(null);
    criar.mutate({ data: { email, nome, perfis, senha: senha.trim() } });
  };


  const copiarSenha = () => {
    if (!senhaGerada) return;
    navigator.clipboard.writeText(senhaGerada);
    toast.success("Senha temporária copiada.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Controle de Acesso"
        subtitle="Adicione usuários, gerencie papéis (RBAC) e consulte a matriz de permissões por perfil."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="size-5" /> Adicionar novo usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  placeholder="Ex: João da Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="joao@splashpiscinas.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha-nova">Senha pessoal</Label>
                <Input
                  id="senha-nova"
                  type="text"
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres (deixe vazio para gerar automática)"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Funções (pode marcar mais de uma)</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {PERFIS.map((p) => (
                  <label
                    key={p}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3 text-sm"
                  >
                    <Checkbox
                      checked={perfis.includes(p)}
                      onCheckedChange={() => setPerfis((atual) => alternarPerfil(atual, p))}
                    />
                    {LABEL_PERFIL[p]}
                  </label>
                ))}
              </div>
            </div>


            <div className="flex items-center gap-3">
              <Button type="submit" disabled={criar.isPending}>
                <Plus className="size-4" />
                {criar.isPending ? "Criando…" : "Criar usuário"}
              </Button>
            </div>

            {senhaGerada && (
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                <p className="text-sm font-medium text-yellow-400">
                  {senhaDefinida
                    ? "Senha cadastrada para este usuário:"
                    : "Senha temporária gerada (mostre uma única vez ao usuário):"}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="rounded bg-background px-2 py-1 text-sm">{senhaGerada}</code>
                  <Button type="button" size="icon" variant="ghost" onClick={copiarSenha}>
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuários do sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Papéis atuais</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    Carregando usuários…
                  </TableCell>
                </TableRow>
              ) : usuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                usuarios.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.nome}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {u.papeis.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Nenhum papel</span>
                        ) : (
                          u.papeis.map((p) => (
                            <Badge key={p.id} variant="secondary">
                              {LABEL_PERFIL[p.role]}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.ativo ? "secondary" : "outline"}>
                        {u.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          setEditando({
                            id: u.id,
                            nome: u.nome,
                            perfis: u.papeis.map((p) => p.role as Perfil),
                          })
                        }
                        aria-label="Editar funções"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setNovaSenha("");
                          setTrocandoSenha({ id: u.id, nome: u.nome });
                        }}
                        aria-label="Definir senha"
                      >
                        <KeyRound className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => remover.mutate({ data: { userId: u.id } })}
                        disabled={remover.isPending}
                        aria-label="Remover usuário"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>

                  </TableRow>
                ))
              )}
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
            perfil="Gerente"
            descricao="Mesmo acesso do administrador, exceto a exclusão de usuários e configurações críticas de integração."
          />
          <MatrizItem
            perfil="Vendedor"
            descricao="Clientes, novo pedido, consulta de pedidos, estoque em modo leitura e visualização das próprias comissões."
          />
          <MatrizItem
            perfil="Técnico / Logística"
            descricao="Flight board, ordens de serviço, entradas de estoque e inventário."
          />
          <MatrizItem
            perfil="Financeiro"
            descricao="Fluxo de caixa, contas a pagar/receber, central de compras, DRE e folha de pagamento."
          />
          <MatrizItem
            perfil="Usuário"
            descricao="Acesso somente leitura aos cadastros e consultas liberadas pelo administrador."
          />
        </CardContent>
      </Card>

      <Dialog open={editando !== null} onOpenChange={(open) => !open && setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar funções</DialogTitle>
            <DialogDescription>
              {editando?.nome} — marque todas as funções que este usuário deve ter.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 sm:grid-cols-2">
            {PERFIS.map((p) => (
              <label
                key={p}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3 text-sm"
              >
                <Checkbox
                  checked={editando?.perfis.includes(p) ?? false}
                  onCheckedChange={() =>
                    setEditando((atual) =>
                      atual ? { ...atual, perfis: alternarPerfil(atual.perfis, p) } : atual,
                    )
                  }
                />
                {LABEL_PERFIL[p]}
              </label>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditando(null)}>
              Cancelar
            </Button>
            <Button
              disabled={salvarPapeis.isPending || (editando?.perfis.length ?? 0) === 0}
              onClick={() =>
                editando &&
                salvarPapeis.mutate({ data: { userId: editando.id, perfis: editando.perfis } })
              }
            >
              {salvarPapeis.isPending ? "Salvando…" : "Salvar funções"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
