import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  OS_STATUSES,
  ordensServico as seed,
  type OrdemServico,
  type OSStatus,
} from "@/lib/mock-data";

const statusTone: Record<OSStatus, string> = {
  Pendente: "bg-muted text-muted-foreground",
  Escavação: "bg-warning/20 text-warning",
  Base: "bg-chart-4/20 text-chart-4",
  Instalação: "bg-primary/20 text-primary",
  Acabamento: "bg-chart-5/20 text-chart-5",
  Concluído: "bg-success/20 text-success",
};

export const Route = createFileRoute("/logistica")({
  head: () => ({
    meta: [
      { title: "Flight Board | Piscinow ERP" },
      {
        name: "description",
        content:
          "Quadro Kanban das ordens de serviço: escavação, base, instalação, acabamento e conclusão.",
      },
      { property: "og:title", content: "Flight Board | Piscinow ERP" },
      {
        property: "og:description",
        content: "Acompanhe cada obra de piscina por etapa em tempo real.",
      },
    ],
  }),
  component: FlightBoard,
});

function FlightBoard() {
  const [ordens, setOrdens] = useState<OrdemServico[]>(seed);
  const [dragId, setDragId] = useState<string | null>(null);

  const porStatus = useMemo(
    () =>
      OS_STATUSES.map((status) => ({
        status,
        itens: ordens.filter((o) => o.status === status),
      })),
    [ordens],
  );

  const mover = (id: string, status: OSStatus) => {
    setOrdens((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o)),
    );
    toast.success(`${id} movida para ${status}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Flight Board</h1>
        <p className="text-sm text-muted-foreground">
          Arraste as ordens de serviço entre as etapas da obra.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {porStatus.map((col) => (
          <div
            key={col.status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragId) mover(dragId, col.status);
              setDragId(null);
            }}
            className="flex min-h-40 flex-col gap-3 rounded-xl border border-border bg-card/50 p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{col.status}</span>
              <Badge variant="secondary">{col.itens.length}</Badge>
            </div>

            {col.itens.length === 0 && (
              <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                Sem ordens nesta etapa
              </p>
            )}

            {col.itens.map((os) => (
              <Card
                key={os.id}
                draggable
                onDragStart={() => setDragId(os.id)}
                onDragEnd={() => setDragId(null)}
                className="cursor-grab gap-2 py-3 active:cursor-grabbing"
              >
                <CardHeader className="px-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>{os.id}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusTone[os.status]}`}
                    >
                      {os.prazoDias}d
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 px-3">
                  <p className="text-sm font-medium">{os.cliente}</p>
                  <p className="text-xs text-muted-foreground">{os.servicoTipo}</p>
                  <p className="text-xs text-muted-foreground">{os.responsavel}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
