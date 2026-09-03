import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Printer } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { dataBR, ETAPAS_OBRA, type EtapaKey } from "@/lib/erp";

export const Route = createFileRoute("/obras/$id")({
  head: () => ({
    meta: [
      { title: "Detalhe da Obra | Piscinow ERP" },
      {
        name: "description",
        content: "Checklist técnico de execução e ordem de serviço impressa da obra.",
      },
      { property: "og:title", content: "Detalhe da Obra | Piscinow ERP" },
      {
        property: "og:description",
        content: "Acompanhe as 10 etapas técnicas de execução da obra de piscina.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <DetalheObra />
    </RequireAuth>
  ),
});

const STATUS_ETAPA = [
  { value: "pendente", label: "Pendente" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluido", label: "Concluído" },
] as const;

function toneEtapa(status: string) {
  if (status === "concluido") return "bg-success/20 text-success";
  if (status === "em_andamento") return "bg-warning/20 text-warning";
  return "bg-muted text-muted-foreground";
}

function DetalheObra() {
  const { id } = useParams({ from: "/obras/$id" });
  const qc = useQueryClient();

  const { data: obra, isLoading } = useQuery({
    queryKey: ["obra", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("obras").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const atualizarEtapa = useMutation({
    mutationFn: async ({ key, status }: { key: EtapaKey; status: string }) => {
      const { error } = await supabase
        .from("obras")
        .update({ [key]: status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["obra", id] });
      qc.invalidateQueries({ queryKey: ["obras"] });
      toast.success("Etapa atualizada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!obra) {
    return <p className="text-sm text-muted-foreground">Obra não encontrada.</p>;
  }

  const concluidas = ETAPAS_OBRA.filter((e) => obra[e.key] === "concluido").length;

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <PageHeader
          title={`Obra ${obra.numero ?? ""}`}
          subtitle={obra.cliente_nome ?? "Cliente não informado"}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/logistica">
                  <ArrowLeft /> Voltar ao Flight Board
                </Link>
              </Button>
              <Button onClick={() => window.print()}>
                <Printer /> Imprimir OS
              </Button>
            </div>
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 print:hidden">
        <Card>
          <CardHeader>
            <CardTitle>Dados da obra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Cliente:</span> {obra.cliente_nome ?? "—"}</p>
            <p><span className="text-muted-foreground">Endereço:</span> {obra.endereco_obra ?? "—"}</p>
            <p><span className="text-muted-foreground">Tipo de serviço:</span> {obra.tipo_servico}</p>
            <p><span className="text-muted-foreground">Responsável:</span> {obra.responsavel ?? "—"}</p>
            <p><span className="text-muted-foreground">Status:</span> {obra.status_geral}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Prazos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Data do pedido:</span> {dataBR(obra.data_pedido)}</p>
            <p><span className="text-muted-foreground">Prazo:</span> {obra.prazo_dias} dias úteis</p>
            <p><span className="text-muted-foreground">Data limite:</span> {dataBR(obra.data_limite)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ordens de campo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex flex-wrap gap-1">
              {obra.os_instalacao && <Badge variant="outline">{obra.os_instalacao}</Badge>}
              {obra.os_logistica && <Badge variant="outline">{obra.os_logistica}</Badge>}
              {obra.os_acabamento && <Badge variant="outline">{obra.os_acabamento}</Badge>}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Checklist</span>
                <span>{concluidas}/10</span>
              </div>
              <Progress value={(concluidas / 10) * 100} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Checklist de execução</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {ETAPAS_OBRA.map((etapa) => {
            const status = String(obra[etapa.key] ?? "pendente");
            return (
              <div
                key={etapa.key}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{etapa.label}</p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${toneEtapa(status)}`}>
                    {STATUS_ETAPA.find((s) => s.value === status)?.label ?? status}
                  </span>
                </div>
                <Select
                  value={status}
                  onValueChange={(v) => atualizarEtapa.mutate({ key: etapa.key, status: v })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_ETAPA.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="hidden rounded-lg border border-border p-8 print:block">
        <h1 className="text-xl font-semibold">Ordem de Serviço — Obra {obra.numero}</h1>
        <p className="mt-1 text-sm">Data: {dataBR(obra.data_pedido)}</p>
        <hr className="my-4" />
        <div className="grid grid-cols-2 gap-4 text-sm">
          <p><strong>Cliente:</strong> {obra.cliente_nome ?? "—"}</p>
          <p><strong>Endereço da obra:</strong> {obra.endereco_obra ?? "—"}</p>
          <p><strong>Tipo de serviço:</strong> {obra.tipo_servico}</p>
          <p><strong>Responsável:</strong> {obra.responsavel ?? "—"}</p>
          <p><strong>Prazo:</strong> {obra.prazo_dias} dias úteis</p>
          <p><strong>Data limite:</strong> {dataBR(obra.data_limite)}</p>
        </div>
        <h2 className="mt-6 text-sm font-semibold">Checklist técnico</h2>
        <table className="mt-2 w-full border-collapse text-sm">
          <tbody>
            {ETAPAS_OBRA.map((etapa) => (
              <tr key={etapa.key} className="border-b border-border">
                <td className="py-1">{etapa.label}</td>
                <td className="py-1 text-right">
                  {STATUS_ETAPA.find((s) => s.value === String(obra[etapa.key]))?.label ?? "Pendente"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-6 text-sm">Horas estimadas: ______________</p>
        <p className="mt-10 text-sm">Assinatura do cliente: _______________________________________</p>
      </div>
    </div>
  );
}
