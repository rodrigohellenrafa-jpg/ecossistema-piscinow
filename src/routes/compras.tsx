import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brl, produtos } from "@/lib/mock-data";

export const Route = createFileRoute("/compras")({
  head: () => ({
    meta: [
      { title: "Sugestão de Compras | Piscinow ERP" },
      {
        name: "description",
        content: "Reposição automática de itens abaixo do estoque mínimo com custo estimado.",
      },
      { property: "og:title", content: "Sugestão de Compras | Piscinow ERP" },
      {
        property: "og:description",
        content: "Lista de reposição gerada a partir do estoque mínimo de cada produto.",
      },
    ],
  }),
  component: Compras,
});

function Compras() {
  const sugestoes = produtos
    .filter((p) => p.estoqueAtual < p.estoqueMinimo)
    .map((p) => {
      const qtde = p.estoqueMinimo * 2 - p.estoqueAtual;
      return { ...p, qtde, custoTotal: qtde * p.custo };
    });

  const total = sugestoes.reduce((s, i) => s + i.custoTotal, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Compras</h1>
          <p className="text-sm text-muted-foreground">
            Reposição sugerida com base no estoque mínimo.
          </p>
        </div>
        <Button
          disabled={sugestoes.length === 0}
          onClick={() => toast.success(`Pedido de compra de ${brl(total)} gerado`)}
        >
          <ShoppingBag /> Gerar pedido de compra
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Itens a repor <Badge variant="secondary">{sugestoes.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sugestoes.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhum item abaixo do estoque mínimo.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Atual</TableHead>
                  <TableHead className="text-right">Mínimo</TableHead>
                  <TableHead className="text-right">Comprar</TableHead>
                  <TableHead className="text-right">Custo estimado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sugestoes.map((i) => (
                  <TableRow key={i.sku}>
                    <TableCell className="font-mono text-xs">{i.sku}</TableCell>
                    <TableCell className="font-medium">{i.descricao}</TableCell>
                    <TableCell className="text-right text-destructive">{i.estoqueAtual}</TableCell>
                    <TableCell className="text-right">{i.estoqueMinimo}</TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {i.qtde}
                    </TableCell>
                    <TableCell className="text-right">{brl(i.custoTotal)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={5} className="text-right font-medium">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-semibold">{brl(total)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
