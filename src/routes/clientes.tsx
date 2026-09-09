import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/field";
import { PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { ETAPAS_FUNIL, proximoCodigo } from "@/lib/erp";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes | Piscinow ERP" },
      {
        name: "description",
        content: "Cadastro completo de clientes Piscinow com contatos, endereço e documentos.",
      },
      { property: "og:title", content: "Clientes | Piscinow ERP" },
      {
        property: "og:description",
        content: "Cadastre e gerencie a base de clientes da Piscinow.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Clientes />
    </RequireAuth>
  ),
});

type Cliente = Tables<"clientes">;

const TODAS_ETAPAS = "__todas__";

const vazio = {
  codigo: "",
  nome: "",
  tipo: "PF",
  documento: "",
  email: "",
  telefone: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  endereco_obra: "",
  etapa: "Lead" as (typeof ETAPAS_FUNIL)[number],
  observacoes: "",
  inscricao_estadual: "",
  indicador_ie: "nao_contribuinte" as "contribuinte" | "isento" | "nao_contribuinte",
  inscricao_municipal: "",
  codigo_municipio: "",
  regime_tributario: "",
};

const INDICADORES_IE = [
  { value: "contribuinte", label: "Contribuinte" },
  { value: "isento", label: "Isento" },
  { value: "nao_contribuinte", label: "Não contribuinte" },
] as const;

const REGIMES_TRIBUTARIOS = [
  "Simples Nacional",
  "Lucro Presumido",
  "Lucro Real",
  "MEI",
] as const;

type EnderecoCep = {
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
  ibge: string;
};

async function buscarCep(cep: string): Promise<EnderecoCep | null> {
  const limpo = cep.replace(/\D/g, "");
  if (limpo.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      erro?: boolean | string;
      logradouro?: string;
      bairro?: string;
      localidade?: string;
      uf?: string;
      ibge?: string;
    };
    if (json.erro) return null;
    return {
      logradouro: json.logradouro ?? "",
      bairro: json.bairro ?? "",
      cidade: json.localidade ?? "",
      estado: json.uf ?? "",
      ibge: json.ibge ?? "",
    };
  } catch {
    return null;
  }
}

function Clientes() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [filtroEtapa, setFiltroEtapa] = useState<string>(TODAS_ETAPAS);
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [form, setForm] = useState(vazio);
  const [mostrarInstalacao, setMostrarInstalacao] = useState(false);
  const [cepObra, setCepObra] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [buscandoCepObra, setBuscandoCepObra] = useState(false);

  async function preencherPorCep(cep: string) {
    setBuscandoCep(true);
    const endereco = await buscarCep(cep);
    setBuscandoCep(false);
    if (!endereco) {
      toast.error("CEP não encontrado.");
      return;
    }
    setForm((f) => ({
      ...f,
      logradouro: endereco.logradouro || f.logradouro,
      bairro: endereco.bairro || f.bairro,
      cidade: endereco.cidade || f.cidade,
      estado: endereco.estado || f.estado,
      codigo_municipio: endereco.ibge || f.codigo_municipio,
    }));
    toast.success("Endereço preenchido pelo CEP.");
  }

  async function preencherObraPorCep(cep: string) {
    setBuscandoCepObra(true);
    const endereco = await buscarCep(cep);
    setBuscandoCepObra(false);
    if (!endereco) {
      toast.error("CEP da instalação não encontrado.");
      return;
    }
    const composto = [
      endereco.logradouro,
      endereco.bairro,
      [endereco.cidade, endereco.estado].filter(Boolean).join("/"),
    ]
      .filter(Boolean)
      .join(" - ");
    setForm((f) => ({ ...f, endereco_obra: composto }));
    toast.success("Endereço de instalação preenchido.");
  }

  const { data = [], isLoading } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const abrirNovo = () => {
    setEditando(null);
    setForm({ ...vazio, codigo: proximoCodigo("CLI", data.map((c) => c.codigo)) });
    setOpen(true);
  };

  const abrirEdicao = (c: Cliente) => {
    setEditando(c);
    setForm({
      codigo: c.codigo ?? "",
      nome: c.nome,
      tipo: c.tipo,
      documento: c.documento ?? "",
      email: c.email ?? "",
      telefone: c.telefone ?? "",
      cep: c.cep ?? "",
      logradouro: c.logradouro ?? "",
      numero: c.numero ?? "",
      complemento: c.complemento ?? "",
      bairro: c.bairro ?? "",
      cidade: c.cidade ?? "",
      estado: c.estado ?? "",
      endereco_obra: c.endereco_obra ?? "",
      etapa: (c.etapa as (typeof ETAPAS_FUNIL)[number]) ?? "Lead",
      observacoes: c.observacoes ?? "",
      inscricao_estadual: c.inscricao_estadual ?? "",
      indicador_ie:
        (c.indicador_ie as "contribuinte" | "isento" | "nao_contribuinte") ?? "nao_contribuinte",
      inscricao_municipal: c.inscricao_municipal ?? "",
      codigo_municipio: c.codigo_municipio ?? "",
      regime_tributario: c.regime_tributario ?? "",
    });
    setOpen(true);
  };

  const salvar = useMutation({
    mutationFn: async () => {
      if (!form.nome.trim()) throw new Error("Informe o nome do cliente.");
      const payload = {
        ...form,
        nome: form.nome.trim(),
        codigo: form.codigo || null,
        inscricao_estadual: form.inscricao_estadual || null,
        inscricao_municipal: form.inscricao_municipal || null,
        codigo_municipio: form.codigo_municipio || null,
        regime_tributario: form.regime_tributario || null,
      };
      if (editando) {
        const { error } = await supabase.from("clientes").update(payload).eq("id", editando.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("clientes").insert({
          ...payload,
          created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editando ? "Cliente atualizado!" : "Cliente cadastrado!");
      setForm(vazio);
      setEditando(null);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["clientes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const excluir = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cliente excluído.");
      qc.invalidateQueries({ queryKey: ["clientes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const lista = data
    .filter((c) => filtroEtapa === TODAS_ETAPAS || c.etapa === filtroEtapa)
    .filter((c) =>
      `${c.nome} ${c.codigo ?? ""} ${c.cidade ?? ""} ${c.telefone ?? ""} ${c.documento ?? ""}`
        .toLowerCase()
        .includes(q.toLowerCase()),
    );

  const set = (k: keyof typeof vazio) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        subtitle="Cadastro salvo no banco de dados da equipe."
        actions={
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) setEditando(null);
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={abrirNovo}>
                <Plus /> Novo cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editando ? "Editar cliente" : "Novo cliente"}</DialogTitle>
                <DialogDescription>Preencha os dados cadastrais.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Código">
                  <Input value={form.codigo} onChange={(e) => set("codigo")(e.target.value)} />
                </Field>
                <Field label="Etapa no funil">
                  <Select value={form.etapa} onValueChange={(v) => set("etapa")(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ETAPAS_FUNIL.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Nome / Razão social" className="sm:col-span-2">
                  <Input value={form.nome} onChange={(e) => set("nome")(e.target.value)} />
                </Field>
                <Field label="Tipo">
                  <Select value={form.tipo} onValueChange={set("tipo")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PF">Pessoa física</SelectItem>
                      <SelectItem value="PJ">Pessoa jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="CPF / CNPJ">
                  <Input value={form.documento} onChange={(e) => set("documento")(e.target.value)} />
                </Field>
                <Field label="E-mail">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email")(e.target.value)}
                  />
                </Field>
                <Field label="Telefone">
                  <Input value={form.telefone} onChange={(e) => set("telefone")(e.target.value)} />
                </Field>
                <Field label="CEP">
                  <Input value={form.cep} onChange={(e) => set("cep")(e.target.value)} />
                </Field>
                <Field label="Logradouro">
                  <Input
                    value={form.logradouro}
                    onChange={(e) => set("logradouro")(e.target.value)}
                  />
                </Field>
                <Field label="Número">
                  <Input value={form.numero} onChange={(e) => set("numero")(e.target.value)} />
                </Field>
                <Field label="Complemento">
                  <Input
                    value={form.complemento}
                    onChange={(e) => set("complemento")(e.target.value)}
                  />
                </Field>
                <Field label="Bairro">
                  <Input value={form.bairro} onChange={(e) => set("bairro")(e.target.value)} />
                </Field>
                <Field label="Cidade">
                  <Input value={form.cidade} onChange={(e) => set("cidade")(e.target.value)} />
                </Field>
                <Field label="Estado">
                  <Input
                    maxLength={2}
                    value={form.estado}
                    onChange={(e) => set("estado")(e.target.value.toUpperCase())}
                  />
                </Field>
                <Field label="Endereço da obra" className="sm:col-span-2">
                  <Input
                    value={form.endereco_obra}
                    onChange={(e) => set("endereco_obra")(e.target.value)}
                  />
                </Field>
                <Field label="Observações" className="sm:col-span-2">
                  <Textarea
                    rows={3}
                    value={form.observacoes}
                    onChange={(e) => set("observacoes")(e.target.value)}
                  />
                </Field>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="fiscal">
                  <AccordionTrigger>Dados fiscais</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 pt-1 sm:grid-cols-2">
                      <Field label="Inscrição estadual">
                        <Input
                          value={form.inscricao_estadual}
                          onChange={(e) => set("inscricao_estadual")(e.target.value)}
                        />
                      </Field>
                      <Field label="Indicador de IE">
                        <Select
                          value={form.indicador_ie}
                          onValueChange={(v) => set("indicador_ie")(v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {INDICADORES_IE.map((i) => (
                              <SelectItem key={i.value} value={i.value}>
                                {i.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Inscrição municipal">
                        <Input
                          value={form.inscricao_municipal}
                          onChange={(e) => set("inscricao_municipal")(e.target.value)}
                        />
                      </Field>
                      <Field label="Código do município (IBGE)">
                        <Input
                          value={form.codigo_municipio}
                          onChange={(e) => set("codigo_municipio")(e.target.value)}
                        />
                      </Field>
                      <Field label="Regime tributário" className="sm:col-span-2">
                        <Select
                          value={form.regime_tributario || undefined}
                          onValueChange={set("regime_tributario")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione (opcional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {REGIMES_TRIBUTARIOS.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <DialogFooter>
                <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
                  {editando ? "Salvar alterações" : "Salvar cliente"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader className="gap-3">
          <CardTitle>Base de clientes ({lista.length})</CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar por nome, código, cidade, telefone ou documento"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Select value={filtroEtapa} onValueChange={setFiltroEtapa}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODAS_ETAPAS}>Todas as etapas</SelectItem>
                {ETAPAS_FUNIL.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Badge variant="secondary">{c.codigo ?? "—"}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{c.nome}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{c.tipo}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge>{c.etapa}</Badge>
                  </TableCell>
                  <TableCell>{c.telefone || c.email || "—"}</TableCell>
                  <TableCell>
                    {c.cidade ? `${c.cidade}${c.estado ? `/${c.estado}` : ""}` : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => abrirEdicao(c)}
                        aria-label={`Editar ${c.nome}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => excluir.mutate(c.id)}
                        aria-label={`Excluir ${c.nome}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && lista.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    Nenhum cliente cadastrado ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
