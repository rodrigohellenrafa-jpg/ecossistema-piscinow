import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";

import { Kpi, PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
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
import { brl, dataBR, margem, STATUS_PEDIDO } from "@/lib/erp";

export const Route = createFileRoute("/vendas/")({
  head: () => ({
    meta: [
      { title: "Histórico de Vendas | Piscinow ERP" },
      {
        name: "description",
        content: "Consulte pedidos, faturamento, ticket médio e margem das vendas Piscinow.",
      },
      { property: "og:title", content: "Histórico de Vendas | Piscinow ERP" },
      {
        property: "og:description",
        content: "Acompanhe todos os pedidos, filtre por período, cliente e status.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <HistoricoVendas />
    </RequireAuth>
  ),
});

const STATUS_LABEL: Record<string, string> = {
  orcamento: "Orçamento",
  aprovado: "Aprovado",
  em_producao: "Em produção",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  orcamento: "secondary",
  aprovado: "default",
  em_producao: "outline",
  concluido: "default",
  cancelado: "destructive",
};

function HistoricoVendas() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("todos");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  const { data: vendas = [] } = useQuery({
    queryKey: ["vendas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendas")
        .select("*")
        .order("data", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const lista = useMemo(
    () =>
      vendas.filter((v) => {
        const buscaOk = `${v.numero ?? ""} ${v.cliente_nome ?? ""} ${v.vendedor ?? ""}`
          .toLowerCase()
          .includes(q.toLowerCase());
        const statusOk = status === "todos" || v.status_pedido === status;
        const inicioOk = !inicio || v.data >= inicio;
        const fimOk = !fim || v.data <= fim;
        return buscaOk && statusOk && inicioOk && fimOk;
      }),
    [vendas, q, status, inicio, fim],
  );

  const faturamento = lista.reduce((s, v) => s + Number(v.valor_total), 0);
  const ticketMedio = lista.length ? faturamento / lista.length : 0;
  const custoTotal = lista.reduce((s, v) => s + Number(v.custo_total), 0);
  const margemMedia = margem(faturamento, custoTotal);
  const emAberto = lista.filter((v) =>
    ["orcamento", "aprovado", "em_producao"].includes(v.status_pedido),
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Histórico & Consulta"
        subtitle="Todos os pedidos registrados no sistema."
        actions={
          <Button asChild>
            <Link to="/vendas/novo">
              <Plus /> Novo pedido
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Faturamento" value={brl(faturamento)} />
        <Kpi label="Ticket médio" value={brl(ticketMedio)} />
        <Kpi
          label="Margem média"
          value={`${(margemMedia * 100).toFixed(1)}%`}
          tone={margemMedia >= 0.25 ? "positive" : margemMedia < 0.1 ? "negative" : "warning"}
        />
        <Kpi label="Pedidos em aberto" value={String(emAberto)} />
      </div>

      <Card>
        <CardHeader className="gap-3">
          <CardTitle>Pedidos</CardTitle>
          <div className="flex flex-wrap items-end gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar por pedido, cliente ou vendedor"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className="w-40" />
            <Input type="date" value={fim} onChange={(e) => setFim(e.target.value)} className="w-40" />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                {STATUS_PEDIDO.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL[s]}
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
                <TableHead>Pedido</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">
                    <Link to="/vendas/$id" params={{ id: v.id }} className="text-primary hover:underline">
                      {v.numero}
                    </Link>
                  </TableCell>
                  <TableCell>{dataBR(v.data)}</TableCell>
                  <TableCell>{v.cliente_nome ?? "—"}</TableCell>
                  <TableCell>{v.vendedor ?? "—"}</TableCell>
                  <TableCell className="text-right font-medium">{brl(v.valor_total)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[v.status_pedido] ?? "secondary"}>
                      {STATUS_LABEL[v.status_pedido] ?? v.status_pedido}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {lista.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Nenhum pedido encontrado.
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
