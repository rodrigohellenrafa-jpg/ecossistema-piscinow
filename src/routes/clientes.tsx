import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brl, clientes, ordensServico, vendas } from "@/lib/mock-data";

export const Route = createFileRoute("/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes | Piscinow ERP" },
      {
        name: "description",
        content: "Base de clientes Piscinow com histórico de compras e obras em andamento.",
      },
      { property: "og:title", content: "Clientes | Piscinow ERP" },
      {
        property: "og:description",
        content: "Cadastro completo de clientes, contatos e valor total comprado.",
      },
    ],
  }),
  component: Clientes,
});

function Clientes() {
  const [q, setQ] = useState("");
  const lista = clientes.filter((c) =>
    `${c.nome} ${c.cidade} ${c.contato}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
        <p className="text-sm text-muted-foreground">Cadastro e histórico por cliente.</p>
      </div>

      <Card>
        <CardHeader className="gap-3">
          <CardTitle>Base de clientes</CardTitle>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar cliente, cidade ou telefone"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead className="text-right">Total comprado</TableHead>
                <TableHead>Obras ativas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((c) => {
                const total = vendas
                  .filter((v) => v.cliente === c.nome)
                  .reduce((s, v) => s + v.totalLiquido, 0);
                const obras = ordensServico.filter(
                  (o) => o.cliente === c.nome && o.status !== "Concluído",
                ).length;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nome}</TableCell>
                    <TableCell>{c.contato}</TableCell>
                    <TableCell>{c.cidade}</TableCell>
                    <TableCell className="text-right">{brl(total)}</TableCell>
                    <TableCell>
                      <Badge variant={obras > 0 ? "default" : "secondary"}>{obras}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {lista.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    Nenhum cliente encontrado.
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
