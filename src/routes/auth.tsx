import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Waves } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Entrar | Piscinow ERP" },
      { name: "description", content: "Acesse o ERP Piscinow com a conta da sua equipe." },
      { property: "og:title", content: "Entrar | Piscinow ERP" },
      { property: "og:description", content: "Login da equipe Piscinow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [esqueci, setEsqueci] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/" });
  }

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Conta criada! Verifique seu e-mail se for solicitado.");
  }

  async function recuperar() {
    if (!email) return toast.error("Digite seu e-mail para receber o link.");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setEsqueci(false);
    toast.success("Enviamos um link de recuperação para o seu e-mail.");
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) return toast.error("Não foi possível entrar com o Google.");
    if (result.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
      <Card className="w-full">
        <CardHeader className="items-center text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Waves className="size-5" />
          </div>
          <h1 className="text-lg font-semibold leading-none tracking-tight">
            Entrar no Piscinow ERP
          </h1>
          <CardDescription>Acesso da equipe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" onClick={google}>
            Continuar com Google
          </Button>
          <div className="text-center text-xs text-muted-foreground">ou com e-mail</div>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form className="space-y-3 pt-3" onSubmit={entrar}>
                <Campos
                  email={email}
                  senha={senha}
                  setEmail={setEmail}
                  setSenha={setSenha}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  Entrar
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form className="space-y-3 pt-3" onSubmit={cadastrar}>
                <Campos
                  email={email}
                  senha={senha}
                  setEmail={setEmail}
                  setSenha={setSenha}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  Criar conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function Campos({
  email,
  senha,
  setEmail,
  setSenha,
}: {
  email: string;
  senha: string;
  setEmail: (v: string) => void;
  setSenha: (v: string) => void;
}) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@empresa.com"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          type="password"
          required
          minLength={6}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="••••••••"
        />
      </div>
    </>
  );
}
