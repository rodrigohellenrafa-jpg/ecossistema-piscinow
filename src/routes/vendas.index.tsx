import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brl, vendas } from "@/lib/mock-data";

export const Route = createFileRoute("/vendas/")({
  head: () => ({
    meta: [
      { title: "Histórico de Vendas | Piscinow ERP" },
      {
        name: "description",
        content: "Consulte pedidos, status de pagamento e comissões dos vendedores Piscinow.",
      },
      { property: "og:title", content: "Histórico de Vendas | Piscinow ERP" },
      {
        property: "og:description",
        content: "Todos os pedidos da Piscinow com status de pagamento e comissões.",
      },
    ],
  }),
  component: HistoricoVendas,
});

function HistoricoVendas() {
  const [q, setQ] = useState("");
  const lista = vendas.filter((v) =>
    `${v.id} ${v.cliente} ${v.vendedor}`.toLowerCase().includes(q.toLowerCase()),
  );

  const comissoes = Object.entries(
    vendas.reduce<Record<string, number>>((acc, v) => {
      acc[v.vendedor] = (acc[v.vendedor] ?? 0) + v.totalLiquido * 0.03;
      return acc;
    }, {}),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Histórico &amp; Consulta</h1>
          <p className="text-sm text-muted-foreground">Todos os pedidos registrados.</p>
        </div>
        <Button asChild>
          <Link to="/vendas/novo"><Plus /> Novo pedido</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="gap-3">
          <CardTitle>Pedidos</CardTitle>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por pedido, cliente ou vendedor"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.id}</TableCell>
                  <TableCell>{new Date(v.data).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{v.cliente}</TableCell>
                  <TableCell>{v.vendedor}</TableCell>
                  <TableCell>{v.formaPagamento}</TableCell>
                  <TableCell className="text-right font-medium">{brl(v.totalLiquido)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        v.statusPagamento === "Pago"
                          ? "default"
                          : v.statusPagamento === "Atrasado"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {v.statusPagamento}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {lista.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comissões (3%)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {comissoes.map(([nome, valor]) => (
            <div key={nome} className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">{nome}</p>
              <p className="text-lg font-semibold text-primary">{brl(valor)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
