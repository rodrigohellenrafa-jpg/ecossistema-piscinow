import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brl, produtos } from "@/lib/mock-data";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos e Estoque | Piscinow ERP" },
      {
        name: "description",
        content: "Catálogo de piscinas, equipamentos e químicos com margem e nível de estoque.",
      },
      { property: "og:title", content: "Produtos e Estoque | Piscinow ERP" },
      {
        property: "og:description",
        content: "Controle de estoque mínimo, custo e margem de cada item Piscinow.",
      },
    ],
  }),
  component: Produtos,
});

function Produtos() {
  const [q, setQ] = useState("");
  const lista = produtos.filter((p) =>
    `${p.sku} ${p.descricao} ${p.categoria}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Produtos &amp; Estoque</h1>
        <p className="text-sm text-muted-foreground">
          Margem, custo e nível de reposição por item.
        </p>
      </div>

      <Card>
        <CardHeader className="gap-3">
          <CardTitle>Catálogo</CardTitle>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar SKU, descrição ou categoria"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Venda</TableHead>
                <TableHead className="text-right">Margem</TableHead>
                <TableHead className="w-40">Estoque</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((p) => {
                const margem = ((p.precoVenda - p.custo) / p.precoVenda) * 100;
                const nivel = Math.min(
                  100,
                  (p.estoqueAtual / Math.max(1, p.estoqueMinimo * 2)) * 100,
                );
                const baixo = p.estoqueAtual < p.estoqueMinimo;
                return (
                  <TableRow key={p.sku}>
                    <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                    <TableCell className="font-medium">{p.descricao}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{p.categoria}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{brl(p.custo)}</TableCell>
                    <TableCell className="text-right">{brl(p.precoVenda)}</TableCell>
                    <TableCell className="text-right text-success">
                      {margem.toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className={baixo ? "text-destructive" : ""}>
                            {p.estoqueAtual} un
                          </span>
                          <span className="text-muted-foreground">mín {p.estoqueMinimo}</span>
                        </div>
                        <Progress value={nivel} />
                      </div>
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
