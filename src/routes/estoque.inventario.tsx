import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck, Printer } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, Kpi } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { brl } from "@/lib/erp";
import logoSplash from "@/assets/logo-splash.png.asset.json";

export const Route = createFileRoute("/estoque/inventario")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Inventário Físico | Piscinow ERP" },
      {
        name: "description",
        content:
          "Contagem física de estoque com comparação ao sistema, cálculo de diferenças e ajustes automáticos.",
      },
      { property: "og:title", content: "Inventário Físico | Piscinow ERP" },
      {
        property: "og:description",
        content: "Registre a contagem física e aplique ajustes de estoque com um clique.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <EstoqueInventario />
    </RequireAuth>
  ),
});

type Produto = {
  id: string;
  codigo: string | null;
  nome: string;
  categoria: string | null;
  localizacao: string | null;
  unidade: string;
  estoque_atual: number;
  preco_custo: number;
};

function EstoqueInventario() {
  const qc = useQueryClient();
  const [contagens, setContagens] = useState<Record<string, string>>({});
  const [categoria, setCategoria] = useState("todas");
  const [localizacao, setLocalizacao] = useState("todas");

  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos", "inventario"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("id, codigo, nome, categoria, localizacao, unidade, estoque_atual, preco_custo")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data as Produto[];
    },
  });

  const categorias = useMemo(
    () => Array.from(new Set(produtos.map((p) => p.categoria).filter(Boolean))) as string[],
    [produtos],
  );
  const localizacoes = useMemo(
    () => Array.from(new Set(produtos.map((p) => p.localizacao).filter(Boolean))) as string[],
    [produtos],
  );

  const filtrados = produtos.filter(
    (p) =>
      (categoria === "todas" || p.categoria === categoria) &&
      (localizacao === "todas" || p.localizacao === localizacao),
  );

  const contadoFor = (id: string) => contagens[id];

  const linhas = filtrados.map((p) => {
    const contadoStr = contadoFor(p.id);
    const contado = contadoStr === undefined || contadoStr === "" ? null : Number(contadoStr);
    const diferenca = contado === null ? 0 : contado - Number(p.estoque_atual);
    return { produto: p, contado, diferenca };
  });

  const divergentes = linhas.filter((l) => l.contado !== null && l.diferenca !== 0);
  const valorDivergencia = divergentes.reduce(
    (s, l) => s + l.diferenca * Number(l.produto.preco_custo),
    0,
  );

  const aplicarAjustes = useMutation({
    mutationFn: async () => {
      if (divergentes.length === 0) throw new Error("Nenhuma diferença de contagem a aplicar");
      const { data: auth } = await supabase.auth.getUser();
      const payload = divergentes.map((l) => ({
        produto_id: l.produto.id,
        tipo: l.diferenca > 0 ? "entrada" : "saida",
        quantidade: Math.abs(l.diferenca),
        origem: "Inventário",
        documento: null,
        observacoes: `Ajuste de inventário: sistema ${l.produto.estoque_atual}, contado ${l.contado}`,
        created_by: auth.user?.id ?? null,
      }));
      const { error } = await supabase.from("estoque_movimentos").insert(payload);
      if (error) throw error;
      return payload.length;
    },
    onSuccess: (qtd) => {
      toast.success(`${qtd} ajuste(s) de inventário aplicado(s)`);
      setContagens({});
      qc.invalidateQueries({ queryKey: ["produtos"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="hidden print:flex print:items-center print:gap-3">
        <img src={logoSplash.url} alt="Splash Jardim do Trevo" className="h-20 w-auto" />
        <p className="text-lg font-semibold">Splash Jardim do Trevo — Inventário Físico</p>
      </div>
      <PageHeader
        title="Inventário Físico"
        subtitle="Compare a contagem física com o estoque do sistema e aplique os ajustes necessários."
        actions={
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer /> Imprimir folha de contagem
            </Button>
            <Button
              disabled={divergentes.length === 0 || aplicarAjustes.isPending}
              onClick={() => aplicarAjustes.mutate()}
            >
              <ClipboardCheck /> Aplicar ajustes
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3 print:hidden">
        <Kpi label="Produtos no filtro" value={String(filtrados.length)} />
        <Kpi label="Itens com diferença" value={String(divergentes.length)} tone="warning" />
        <Kpi
          label="Valor da diferença"
          value={brl(valorDivergencia)}
          tone={valorDivergencia < 0 ? "negative" : valorDivergencia > 0 ? "positive" : "default"}
        />
      </div>

      <div className="flex flex-wrap gap-3 print:hidden">
        <Select value={categoria} onValueChange={setCategoria}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={localizacao} onValueChange={setLocalizacao}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Localização" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as localizações</SelectItem>
            {localizacoes.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="print:hidden">
          <CardTitle>Contagem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Unid.</TableHead>
                  <TableHead className="text-right">Estoque sistema</TableHead>
                  <TableHead className="text-right print:hidden">Estoque contado</TableHead>
                  <TableHead className="hidden text-right print:table-cell">Contagem manual</TableHead>
                  <TableHead className="text-right print:hidden">Diferença</TableHead>
                  <TableHead className="text-right print:hidden">Valor da diferença</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {linhas.map(({ produto, contado, diferenca }) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-mono text-xs">{produto.codigo ?? "—"}</TableCell>
                    <TableCell className="font-medium">{produto.nome}</TableCell>
                    <TableCell>{produto.localizacao ?? "—"}</TableCell>
                    <TableCell>{produto.unidade}</TableCell>
                    <TableCell className="text-right">{produto.estoque_atual}</TableCell>
                    <TableCell className="text-right print:hidden">
                      <Input
                        type="number"
                        className="w-24 text-right"
                        value={contagens[produto.id] ?? ""}
                        onChange={(e) =>
                          setContagens((c) => ({ ...c, [produto.id]: e.target.value }))
                        }
                      />
                    </TableCell>
                    <TableCell className="hidden print:table-cell" />
                    <TableCell
                      className={`text-right font-semibold print:hidden ${
                        contado === null
                          ? "text-muted-foreground"
                          : diferenca === 0
                            ? "text-muted-foreground"
                            : diferenca > 0
                              ? "text-success"
                              : "text-destructive"
                      }`}
                    >
                      {contado === null ? "—" : diferenca > 0 ? `+${diferenca}` : diferenca}
                    </TableCell>
                    <TableCell className="text-right print:hidden">
                      {contado === null ? "—" : brl(diferenca * Number(produto.preco_custo))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
