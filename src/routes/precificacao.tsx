import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Search, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { brl, CATEGORIAS_PRODUTO, margem, pct } from "@/lib/erp";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/precificacao")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Precificação em Massa | Piscinow ERP" },
      {
        name: "description",
        content:
          "Compare custo, preço atual, margem e preço sugerido pela tabela do fabricante e ajuste vários preços de uma só vez.",
      },
      { property: "og:title", content: "Precificação em Massa | Piscinow ERP" },
      {
        property: "og:description",
        content: "Ajuste preços e margens de vários produtos em uma única tela.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Precificacao />
    </RequireAuth>
  ),
});

type Produto = Tables<"produtos">;
type Fabricante = Tables<"tabela_fabricante">;

const TODAS = "__todas__";

const normalizar = (v: string) =>
  v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function custoTotal(p: Produto) {
  return (
    Number(p.preco_custo ?? 0) +
    Number(p.custo_fabricacao ?? 0) +
    Number(p.custo_logistico ?? 0)
  );
}

function sugestaoFabricante(p: Produto, tabela: Fabricante[]) {
  const nome = normalizar(p.nome ?? "");
  if (!nome) return null;
  let melhor: { linha: Fabricante; score: number } | null = null;
  for (const linha of tabela) {
    const modelo = normalizar(linha.modelo ?? "");
    if (!modelo) continue;
    let score = 0;
    if (nome === modelo) score = 100;
    else if (nome.includes(modelo) || modelo.includes(nome)) score = 60 + modelo.length;
    if (score > 0 && (!melhor || score > melhor.score)) melhor = { linha, score };
  }
  return melhor?.linha ?? null;
}

function Precificacao() {
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState(TODAS);
  const [precos, setPrecos] = useState<Record<string, string>>({});
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const [margemAlvo, setMargemAlvo] = useState("35");

  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ["precificacao-produtos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data as Produto[];
    },
  });

  const { data: tabela = [] } = useQuery({
    queryKey: ["precificacao-fabricante"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tabela_fabricante")
        .select("*")
        .eq("ativo", true);
      if (error) throw error;
      return data as Fabricante[];
    },
  });

  const linhas = useMemo(() => {
    const termo = normalizar(busca);
    return produtos
      .filter((p) => (categoria === TODAS ? true : p.categoria === categoria))
      .filter((p) =>
        termo
          ? normalizar(`${p.codigo ?? ""} ${p.nome ?? ""}`).includes(termo)
          : true,
      )
      .map((p) => {
        const custo = custoTotal(p);
        const fab = sugestaoFabricante(p, tabela);
        const atual = Number(p.preco_venda ?? 0);
        const novoTexto = precos[p.id];
        const novo = novoTexto === undefined ? atual : Number(novoTexto || 0);
        return { produto: p, custo, fab, atual, novo, alterado: novo !== atual };
      });
  }, [produtos, tabela, busca, categoria, precos]);

  const selecionados = linhas.filter((l) => sel[l.produto.id]);
  const alvo = linhas.filter((l) => l.alterado);

  const definir = (id: string, valor: number) =>
    setPrecos((atual) => ({ ...atual, [id]: valor.toFixed(2) }));

  const aplicarMargem = () => {
    const m = Number(margemAlvo) / 100;
    if (!(m > 0 && m < 1)) {
      toast.error("Informe uma margem entre 1% e 99%.");
      return;
    }
    const base = selecionados.length ? selecionados : linhas;
    base.forEach((l) => {
      if (l.custo > 0) definir(l.produto.id, l.custo / (1 - m));
    });
    toast.success(`Margem de ${margemAlvo}% aplicada em ${base.length} produto(s).`);
  };

  const alinharFabricante = () => {
    const base = (selecionados.length ? selecionados : linhas).filter((l) => l.fab);
    if (!base.length) {
      toast.error("Nenhum produto com correspondência na tabela do fabricante.");
      return;
    }
    base.forEach((l) => definir(l.produto.id, Number(l.fab!.preco_venda ?? 0)));
    toast.success(`${base.length} produto(s) alinhado(s) à tabela do fabricante.`);
  };

  const salvar = useMutation({
    mutationFn: async () => {
      for (const l of alvo) {
        const { error } = await supabase
          .from("produtos")
          .update({ preco_venda: l.novo })
          .eq("id", l.produto.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(`${alvo.length} preço(s) atualizado(s).`);
      setPrecos({});
      qc.invalidateQueries({ queryKey: ["precificacao-produtos"] });
      qc.invalidateQueries({ queryKey: ["produtos"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Precificação em Massa"
        subtitle="Custo, preço atual, margem e preço sugerido pelo fabricante lado a lado."
        actions={
          <Button
            onClick={() => salvar.mutate()}
            disabled={!alvo.length || salvar.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar {alvo.length ? `(${alvo.length})` : ""}
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros e ações em lote</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1">
            <Label>Buscar</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Código ou nome"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Categoria</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODAS}>Todas as categorias</SelectItem>
                {CATEGORIAS_PRODUTO.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Margem desejada (%)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={margemAlvo}
                onChange={(e) => setMargemAlvo(e.target.value)}
              />
              <Button variant="secondary" onClick={aplicarMargem}>
                <Wand2 className="mr-2 h-4 w-4" />
                Aplicar
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Tabela do fabricante</Label>
            <Button variant="secondary" className="w-full" onClick={alinharFabricante}>
              Alinhar preços à tabela
            </Button>
          </div>
          <p className="text-xs text-muted-foreground md:col-span-4">
            As ações valem para os produtos marcados; sem marcação, valem para todos os
            produtos filtrados. Nada é gravado até clicar em Salvar.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {linhas.length} produto(s) {selecionados.length ? `· ${selecionados.length} marcado(s)` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={linhas.length > 0 && selecionados.length === linhas.length}
                    onCheckedChange={(v) =>
                      setSel(
                        v
                          ? Object.fromEntries(linhas.map((l) => [l.produto.id, true]))
                          : {},
                      )
                    }
                  />
                </TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Custo total</TableHead>
                <TableHead className="text-right">Preço atual</TableHead>
                <TableHead className="text-right">Margem atual</TableHead>
                <TableHead className="text-right">Sugerido fabricante</TableHead>
                <TableHead className="text-right">Novo preço</TableHead>
                <TableHead className="text-right">Nova margem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8}>Carregando...</TableCell>
                </TableRow>
              )}
              {!isLoading && !linhas.length && (
                <TableRow>
                  <TableCell colSpan={8}>Nenhum produto encontrado.</TableCell>
                </TableRow>
              )}
              {linhas.map((l) => {
                const novaMargem = margem(l.novo, l.custo);
                return (
                  <TableRow key={l.produto.id} className={l.alterado ? "bg-muted/40" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={!!sel[l.produto.id]}
                        onCheckedChange={(v) =>
                          setSel((s) => ({ ...s, [l.produto.id]: !!v }))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{l.produto.nome}</div>
                      <div className="text-xs text-muted-foreground">
                        {l.produto.codigo ?? "sem código"} · {l.produto.categoria ?? "sem categoria"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{brl(l.custo)}</TableCell>
                    <TableCell className="text-right">{brl(l.atual)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={margem(l.atual, l.custo) < 0.15 ? "destructive" : "secondary"}>
                        {pct(margem(l.atual, l.custo))}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {l.fab ? (
                        <button
                          type="button"
                          className="text-primary underline-offset-2 hover:underline"
                          onClick={() => definir(l.produto.id, Number(l.fab!.preco_venda ?? 0))}
                        >
                          {brl(Number(l.fab.preco_venda ?? 0))}
                        </button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        step="0.01"
                        className="ml-auto w-32 text-right"
                        value={precos[l.produto.id] ?? String(l.atual)}
                        onChange={(e) =>
                          setPrecos((s) => ({ ...s, [l.produto.id]: e.target.value }))
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={novaMargem < 0.15 ? "destructive" : "default"}>
                        {pct(novaMargem)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
