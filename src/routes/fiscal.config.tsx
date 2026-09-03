import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/field";
import { PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/fiscal/config")({
  head: () => ({
    meta: [
      { title: "Configuração Fiscal | Piscinow ERP" },
      {
        name: "description",
        content:
          "Dados do emitente, provedor Focus NFe, ambiente e numeração para emissão de NF-e e NFS-e.",
      },
      { property: "og:title", content: "Configuração Fiscal | Piscinow ERP" },
      {
        property: "og:description",
        content: "Cadastre razão social, endereço, séries e ambiente de emissão fiscal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <FiscalConfig />
    </RequireAuth>
  ),
});

const REGIMES = [
  { value: "simples_nacional", label: "Simples Nacional" },
  { value: "lucro_presumido", label: "Lucro Presumido" },
  { value: "lucro_real", label: "Lucro Real" },
];

const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ",
  "RN","RS","RO","RR","SC","SP","SE","TO",
];

const vazio = {
  id: "",
  razao_social: "",
  nome_fantasia: "",
  cnpj: "26108962000152",
  inscricao_estadual: "",
  inscricao_municipal: "",
  regime_tributario: "simples_nacional",
  cnae: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  municipio: "",
  codigo_municipio: "",
  uf: "",
  telefone: "",
  email: "",
  provedor: "focus_nfe",
  ambiente: "homologacao",
  token_configurado: false,
  certificado_valido_ate: "",
  serie_nfe: "1",
  proximo_numero_nfe: "1",
  serie_nfse: "1",
  proximo_numero_nfse: "1",
};

function FiscalConfig() {
  const qc = useQueryClient();
  const [form, setForm] = useState(vazio);

  const set = (campo: keyof typeof vazio, valor: string | boolean) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  const { data, isLoading } = useQuery({
    queryKey: ["configuracao_fiscal"],
    queryFn: async () => {
      const { data, error } = await supabase.from("configuracao_fiscal").select("*").maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      id: data.id,
      razao_social: data.razao_social ?? "",
      nome_fantasia: data.nome_fantasia ?? "",
      cnpj: data.cnpj ?? "26108962000152",
      inscricao_estadual: data.inscricao_estadual ?? "",
      inscricao_municipal: data.inscricao_municipal ?? "",
      regime_tributario: data.regime_tributario ?? "simples_nacional",
      cnae: data.cnae ?? "",
      cep: data.cep ?? "",
      logradouro: data.logradouro ?? "",
      numero: data.numero ?? "",
      complemento: data.complemento ?? "",
      bairro: data.bairro ?? "",
      municipio: data.municipio ?? "",
      codigo_municipio: data.codigo_municipio ?? "",
      uf: data.uf ?? "",
      telefone: data.telefone ?? "",
      email: data.email ?? "",
      provedor: data.provedor ?? "focus_nfe",
      ambiente: data.ambiente ?? "homologacao",
      token_configurado: !!data.token_configurado,
      certificado_valido_ate: data.certificado_valido_ate ?? "",
      serie_nfe: String(data.serie_nfe ?? "1"),
      proximo_numero_nfe: String(data.proximo_numero_nfe ?? "1"),
      serie_nfse: String(data.serie_nfse ?? "1"),
      proximo_numero_nfse: String(data.proximo_numero_nfse ?? "1"),
    });
  }, [data]);

  const salvar = useMutation({
    mutationFn: async () => {
      if (!form.razao_social.trim()) throw new Error("Informe a razão social");
      if (!form.cnpj.trim()) throw new Error("Informe o CNPJ");
      const payload = {
        razao_social: form.razao_social.trim(),
        nome_fantasia: form.nome_fantasia || null,
        cnpj: form.cnpj.trim(),
        inscricao_estadual: form.inscricao_estadual || null,
        inscricao_municipal: form.inscricao_municipal || null,
        regime_tributario: form.regime_tributario,
        cnae: form.cnae || null,
        cep: form.cep || null,
        logradouro: form.logradouro || null,
        numero: form.numero || null,
        complemento: form.complemento || null,
        bairro: form.bairro || null,
        municipio: form.municipio || null,
        codigo_municipio: form.codigo_municipio || null,
        uf: form.uf || null,
        telefone: form.telefone || null,
        email: form.email || null,
        provedor: form.provedor,
        ambiente: form.ambiente,
        certificado_valido_ate: form.certificado_valido_ate || null,
        serie_nfe: form.serie_nfe || "1",
        proximo_numero_nfe: Number(form.proximo_numero_nfe) || 1,
        serie_nfse: form.serie_nfse || "1",
        proximo_numero_nfse: Number(form.proximo_numero_nfse) || 1,
      };
      if (form.id) {
        const { error } = await supabase
          .from("configuracao_fiscal")
          .update(payload)
          .eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("configuracao_fiscal").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Configuração fiscal salva");
      qc.invalidateQueries({ queryKey: ["configuracao_fiscal"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuração Fiscal"
        subtitle="Dados do emitente, provedor Focus NFe, ambiente de emissão e numeração das notas."
        actions={
          <Button asChild variant="outline">
            <Link to="/fiscal">Voltar para Emissão de Notas</Link>
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Dados do emitente</CardTitle>
                <CardDescription>Informações usadas na emissão de NF-e e NFS-e.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field label="Razão social *" className="sm:col-span-2">
                  <Input
                    value={form.razao_social}
                    onChange={(e) => set("razao_social", e.target.value)}
                  />
                </Field>
                <Field label="Nome fantasia">
                  <Input
                    value={form.nome_fantasia}
                    onChange={(e) => set("nome_fantasia", e.target.value)}
                  />
                </Field>
                <Field label="CNPJ *">
                  <Input value={form.cnpj} onChange={(e) => set("cnpj", e.target.value)} />
                </Field>
                <Field label="Inscrição estadual">
                  <Input
                    value={form.inscricao_estadual}
                    onChange={(e) => set("inscricao_estadual", e.target.value)}
                  />
                </Field>
                <Field label="Inscrição municipal">
                  <Input
                    value={form.inscricao_municipal}
                    onChange={(e) => set("inscricao_municipal", e.target.value)}
                  />
                </Field>
                <Field label="Regime tributário">
                  <Select
                    value={form.regime_tributario}
                    onValueChange={(v) => set("regime_tributario", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIMES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="CNAE">
                  <Input value={form.cnae} onChange={(e) => set("cnae", e.target.value)} />
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <Field label="CEP">
                  <Input value={form.cep} onChange={(e) => set("cep", e.target.value)} />
                </Field>
                <Field label="Logradouro" className="sm:col-span-2">
                  <Input
                    value={form.logradouro}
                    onChange={(e) => set("logradouro", e.target.value)}
                  />
                </Field>
                <Field label="Número">
                  <Input value={form.numero} onChange={(e) => set("numero", e.target.value)} />
                </Field>
                <Field label="Complemento">
                  <Input
                    value={form.complemento}
                    onChange={(e) => set("complemento", e.target.value)}
                  />
                </Field>
                <Field label="Bairro">
                  <Input value={form.bairro} onChange={(e) => set("bairro", e.target.value)} />
                </Field>
                <Field label="Município">
                  <Input
                    value={form.municipio}
                    onChange={(e) => set("municipio", e.target.value)}
                  />
                </Field>
                <Field label="Código do município (IBGE)">
                  <Input
                    value={form.codigo_municipio}
                    onChange={(e) => set("codigo_municipio", e.target.value)}
                  />
                </Field>
                <Field label="UF">
                  <Select value={form.uf} onValueChange={(v) => set("uf", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {UFS.map((uf) => (
                        <SelectItem key={uf} value={uf}>
                          {uf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Telefone">
                  <Input
                    value={form.telefone}
                    onChange={(e) => set("telefone", e.target.value)}
                  />
                </Field>
                <Field label="E-mail">
                  <Input value={form.email} onChange={(e) => set("email", e.target.value)} />
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Séries e numeração</CardTitle>
                <CardDescription>
                  O próximo número é incrementado automaticamente a cada nota salva.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field label="Série NF-e">
                  <Input
                    value={form.serie_nfe}
                    onChange={(e) => set("serie_nfe", e.target.value)}
                  />
                </Field>
                <Field label="Próximo número NF-e">
                  <Input
                    type="number"
                    value={form.proximo_numero_nfe}
                    onChange={(e) => set("proximo_numero_nfe", e.target.value)}
                  />
                </Field>
                <Field label="Série NFS-e">
                  <Input
                    value={form.serie_nfse}
                    onChange={(e) => set("serie_nfse", e.target.value)}
                  />
                </Field>
                <Field label="Próximo número NFS-e">
                  <Input
                    type="number"
                    value={form.proximo_numero_nfse}
                    onChange={(e) => set("proximo_numero_nfse", e.target.value)}
                  />
                </Field>
                <Field label="Certificado digital válido até">
                  <Input
                    type="date"
                    value={form.certificado_valido_ate}
                    onChange={(e) => set("certificado_valido_ate", e.target.value)}
                  />
                </Field>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Provedor de emissão</CardTitle>
                <CardDescription>Integração com a Focus NFe.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="Provedor">
                  <Select value={form.provedor} onValueChange={(v) => set("provedor", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="focus_nfe">Focus NFe</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Ambiente">
                  <Select value={form.ambiente} onValueChange={(v) => set("ambiente", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homologacao">Homologação</SelectItem>
                      <SelectItem value="producao">Produção</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </CardContent>
            </Card>

            <Card className="border-warning/40 bg-warning/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="size-4" /> Token da Focus NFe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={form.token_configurado} disabled />
                  Token configurado
                </label>
                <p className="flex gap-2 text-xs text-muted-foreground">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  O token de homologação/produção da Focus NFe é um segredo e ainda não foi
                  cadastrado. Para habilitá-lo com segurança, informe o token no chat com a equipe
                  responsável — ele será guardado fora do banco de dados, nunca digitado
                  diretamente neste formulário.
                </p>
              </CardContent>
            </Card>

            <Button onClick={() => salvar.mutate()} disabled={salvar.isPending} className="w-full">
              Salvar configuração
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
