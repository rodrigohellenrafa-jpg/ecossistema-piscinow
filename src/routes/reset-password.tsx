import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Criar nova senha | Piscinow ERP" },
      {
        name: "description",
        content: "Defina uma nova senha de acesso ao Piscinow ERP.",
      },
      { property: "og:title", content: "Criar nova senha | Piscinow ERP" },
      { property: "og:description", content: "Redefinição de senha da equipe Piscinow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [loading, setLoading] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    // O link do e-mail traz o token no hash; o cliente cria a sessão de
    // recuperação sozinho. Só liberamos o formulário quando ela existir.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setPronto(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setPronto(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 6) return toast.error("A senha precisa ter ao menos 6 caracteres.");
    if (senha !== confirma) return toast.error("As senhas não conferem.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Senha atualizada! Você já está conectado.");
    navigate({ to: "/" });
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
      <Card className="w-full">
        <CardHeader className="items-center text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <KeyRound className="size-5" />
          </div>
          <h1 className="text-lg font-semibold leading-none tracking-tight">
            Criar nova senha
          </h1>
          <CardDescription>
            {pronto
              ? "Escolha uma nova senha para sua conta."
              : "Abra esta página pelo link enviado ao seu e-mail."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={salvar}>
            <div className="space-y-1.5">
              <Label htmlFor="nova-senha">Nova senha</Label>
              <Input
                id="nova-senha"
                type="password"
                required
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                disabled={!pronto}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirma-senha">Confirmar nova senha</Label>
              <Input
                id="confirma-senha"
                type="password"
                required
                minLength={6}
                value={confirma}
                onChange={(e) => setConfirma(e.target.value)}
                placeholder="••••••••"
                disabled={!pronto}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !pronto}>
              Salvar nova senha
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
