import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR, hojeISO } from "@/lib/erp";

type Saldo = {
  id: string;
  conta: string;
  banco: string | null;
  saldo: number;
  data_saldo: string;
  observacoes: string | null;
};

/** Saldos informados manualmente enquanto a conciliação automática não está ativa. */
export function SaldosBancarios() {
  const qc = useQueryClient();
  const [novo, setNovo] = useState({ conta: "", banco: "", saldo: "" });
  const [edits, setEdits] = useState<Record<string, { saldo: string; data_saldo: string }>>({});

  const { data: saldos = [] } = useQuery({
    queryKey: ["saldos-bancarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saldos_bancarios")
        .select("*")
        .order("conta", { ascending: true });
      if (error) throw error;
      return data as Saldo[];
    },
  });

  const invalidar = () => qc.invalidateQueries({ queryKey: ["saldos-bancarios"] });

  const criar = useMutation({
    mutationFn: async () => {
      if (!novo.conta.trim()) throw new Error("Informe o nome da conta.");
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("saldos_bancarios").insert({
        conta: novo.conta.trim(),
        banco: novo.banco.trim() || null,
        saldo: Number(novo.saldo) || 0,
        data_saldo: hojeISO(),
        created_by: auth.user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNovo({ conta: "", banco: "", saldo: "" });
      invalidar();
      toast.success("Conta adicionada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const atualizar = useMutation({
    mutationFn: async (s: Saldo) => {
      const e = edits[s.id];
      const { error } = await supabase
        .from("saldos_bancarios")
        .update({
          saldo: Number(e?.saldo ?? s.saldo) || 0,
          data_saldo: e?.data_saldo || s.data_saldo,
        })
        .eq("id", s.id);
      if (error) throw error;
    },
    onSuccess: (_d, s) => {
      setEdits((a) => {
        const c = { ...a };
        delete c[s.id];
        return c;
      });
      invalidar();
      toast.success("Saldo atualizado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("saldos_bancarios").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidar();
      toast.success("Conta removida.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const total = saldos.reduce((s, c) => s + Number(c.saldo ?? 0), 0);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Saldo das contas (informado manualmente)</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Digite o saldo que o banco mostra hoje. Serve enquanto a conciliação automática não está ligada.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total em conta</p>
          <p className="text-xl font-semibold tabular-nums">{brl(total)}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {saldos.map((s) => {
            const e = edits[s.id];
            const alterado = !!e;
            return (
              <div key={s.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{s.conta}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.banco || "—"} · atualizado em {dataBR(s.data_saldo)}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remover.mutate(s.id)}
                    aria-label={`Remover ${s.conta}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Saldo (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={e?.saldo ?? String(s.saldo ?? 0)}
                      onChange={(ev) =>
                        setEdits((a) => ({
                          ...a,
                          [s.id]: {
                            saldo: ev.target.value,
                            data_saldo: a[s.id]?.data_saldo ?? s.data_saldo,
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Data do saldo</Label>
                    <Input
                      type="date"
                      value={e?.data_saldo ?? s.data_saldo}
                      onChange={(ev) =>
                        setEdits((a) => ({
                          ...a,
                          [s.id]: {
                            saldo: a[s.id]?.saldo ?? String(s.saldo ?? 0),
                            data_saldo: ev.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
                <Button
                  className="mt-3 w-full"
                  size="sm"
                  disabled={!alterado || atualizar.isPending}
                  onClick={() => atualizar.mutate(s)}
                >
                  Salvar saldo
                </Button>
              </div>
            );
          })}
          {saldos.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma conta cadastrada ainda. Adicione as contas que você usa abaixo.
            </p>
          )}
        </div>

        <div className="grid items-end gap-3 rounded-lg border border-dashed p-3 md:grid-cols-[1fr_1fr_160px_auto]">
          <div>
            <Label className="text-xs">Nome da conta</Label>
            <Input
              value={novo.conta}
              onChange={(e) => setNovo((n) => ({ ...n, conta: e.target.value }))}
              placeholder="Ex.: C6 PJ - Movimento"
            />
          </div>
          <div>
            <Label className="text-xs">Banco (opcional)</Label>
            <Input
              value={novo.banco}
              onChange={(e) => setNovo((n) => ({ ...n, banco: e.target.value }))}
              placeholder="Ex.: C6 Bank"
            />
          </div>
          <div>
            <Label className="text-xs">Saldo inicial (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={novo.saldo}
              onChange={(e) => setNovo((n) => ({ ...n, saldo: e.target.value }))}
            />
          </div>
          <Button onClick={() => criar.mutate()} disabled={criar.isPending}>
            <Plus /> Adicionar conta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
