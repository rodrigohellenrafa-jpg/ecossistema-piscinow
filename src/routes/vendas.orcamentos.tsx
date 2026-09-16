import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

import { Kpi, PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpandableCard } from "@/components/expandable-card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR, diasAte, ETIQUETAS_ORCAMENTO, etiquetaInfo } from "@/lib/erp";

export const Route = createFileRoute("/vendas/orcamentos")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Orçamentos | Piscinow ERP" },
      {
        name: "description",
        content:
          "Acompanhe os orçamentos em aberto, valores propostos e converta em pedidos aprovados.",
      },
      { property: "og:title", content: "Orçamentos | Piscinow ERP" },
      {
        property: "og:description",
        content: "Lista de orçamentos da Piscinow com valores, cliente e conversão em pedido.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Orcamentos />
    </RequireAuth>
  ),
});

function Orcamentos() {
  const [q, setQ] = useState("");
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: orcamentos = [] } = useQuery({
    queryKey: ["vendas", "orcamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendas")
        .select("*")
        .eq("status_pedido", "orcamento")
        .order("data", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const atualizarEtiqueta = useMutation({
    mutationFn: async ({ id, etiqueta }: { id: string; etiqueta: string }) => {
      const { error } = await supabase
        .from("vendas")
        .update({ etiqueta: etiqueta === "sem" ? null : etiqueta } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendas"] });
      toast.success("Etiqueta atualizada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const atualizarStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("vendas")
        .update({ status_pedido: status })
        .eq("id", id);
      if (error) throw error;
      return { id, status };
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["vendas"] });
      toast.success(
        v.status === "aprovado"
          ? "Orçamento convertido em pedido de venda."
          : "Orçamento cancelado.",
      );
      if (v.status === "aprovado") navigate({ to: "/vendas/$id", params: { id: v.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const lista = useMemo(
    () =>
      orcamentos.filter((v) =>
        `${v.numero ?? ""} ${v.cliente_nome ?? ""} ${v.vendedor ?? ""}`
          .toLowerCase()
          .includes(q.toLowerCase()),
      ),
    [orcamentos, q],
  );

  const total = lista.reduce((s, v) => s + Number(v.valor_total), 0);
  const ticket = lista.length ? total / lista.length : 0;
  const antigos = lista.filter((v) => (diasAte(v.data) ?? 0) <= -15).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orçamentos"
        subtitle="Propostas em aberto aguardando aprovação do cliente."
        actions={
          <Button asChild>
            <Link to="/vendas/novo">
              <Plus /> Novo orçamento
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Orçamentos abertos" value={String(lista.length)} to="/vendas" />
        <Kpi label="Valor em negociação" value={brl(total)} to="/vendas" />
        <Kpi label="Ticket médio" value={brl(ticket)} to="/vendas" />
        <Kpi
          label="Parados há 15+ dias"
          value={String(antigos)}
          tone={antigos > 0 ? "warning" : "default"}
          to="/clientes"
        />
      </div>

      <ExpandableCard>
        <CardHeader className="gap-3">
          <CardTitle>Propostas</CardTitle>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por número, cliente ou vendedor"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Orçamento</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Etiqueta</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">
                    <Link
                      to="/vendas/$id"
                      params={{ id: v.id }}
                      className="text-primary hover:underline"
                    >
                      {v.numero}
                    </Link>
                  </TableCell>
                  <TableCell>{dataBR(v.data)}</TableCell>
                  <TableCell>
                    <Badge variant={v.tipo_atendimento === "out" ? "default" : "outline"}>
                      {v.tipo_atendimento === "out" ? "OUT · Serviço externo" : "IN · Balcão"}
                    </Badge>
                  </TableCell>
                  <TableCell>{v.cliente_nome ?? "—"}</TableCell>
                  <TableCell>{v.vendedor ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {etiquetaInfo(v.etiqueta) && (
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${etiquetaInfo(v.etiqueta)!.cor}`}
                        >
                          {etiquetaInfo(v.etiqueta)!.label}
                        </span>
                      )}
                      <Select
                        value={v.etiqueta ?? "sem"}
                        onValueChange={(etiqueta) => atualizarEtiqueta.mutate({ id: v.id, etiqueta })}
                      >
                        <SelectTrigger className="h-8 w-36 text-xs">
                          <SelectValue placeholder="Classificar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sem">Sem etiqueta</SelectItem>
                          {ETIQUETAS_ORCAMENTO.map((e) => (
                            <SelectItem key={e.valor} value={e.valor}>
                              {e.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{brl(v.valor_total)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => atualizarStatus.mutate({ id: v.id, status: "aprovado" })}
                      >
                        <Check /> Converter em venda
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => atualizarStatus.mutate({ id: v.id, status: "cancelado" })}
                      >
                        <X /> Recusar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {lista.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    Nenhum orçamento em aberto.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </ExpandableCard>
    </div>
  );
}
