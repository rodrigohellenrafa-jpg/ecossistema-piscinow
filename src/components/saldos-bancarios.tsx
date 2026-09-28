import { TelaPermitida } from "@/components/tela-permitida";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpandableCard } from "@/components/expandable-card";
import { ExtratoImportar } from "@/components/extrato-importar";
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
    queryKey: ["saldos-bancarios", "completo"],
    refetchInterval: 5000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saldos_bancarios")
        .select("*")
        .order("data_saldo", { ascending: false }).order("updated_at", { ascending: false });
      if (error) throw error;
      return [...new Map<string, Saldo>((data as Saldo[]).map((s): [string, Saldo] => [s.conta.trim().toLowerCase(), s]).reverse()).values()];
    },
  });

  useEffect(() => {
    const refresh = () => {
      qc.invalidateQueries({ queryKey: ["saldos-bancarios"] });
      qc.invalidateQueries({ queryKey: ["saldos-contas-hoje"] });
      qc.invalidateQueries({ queryKey: ["saldos-lancamentos-hoje"] });
    };
    const channel = supabase.channel("painel-saldos")
      .on("postgres_changes", { event: "*", schema: "public", table: "saldos_bancarios" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "contas" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "lancamentos_financeiros" }, refresh).subscribe();
    const unsubscribe = qc.getQueryCache().subscribe((event) => {
      if (event.type === "updated" && event.action.type === "invalidate" && ["contas", "lancamentos_financeiros", "saldos-bancarios"].includes(String(event.query.queryKey[0]))) {
        qc.invalidateQueries({ queryKey: ["saldos-contas-hoje"] });
        qc.invalidateQueries({ queryKey: ["saldos-lancamentos-hoje"] });
      }
    });
    return () => { unsubscribe(); void supabase.removeChannel(channel); };
  }, [qc]);
  const hoje = hojeISO();

  /** Títulos baixados hoje em Contas a pagar/receber. */
  const { data: contasHoje = [] } = useQuery({
    queryKey: ["saldos-contas-hoje", hoje],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas")
        .select("tipo, descricao, valor, valor_pago, valor_desconto, valor_juros, conta_bancaria, status, data_pagamento")
        .eq("data_pagamento", hoje);
      if (error) throw error;
      return (data as { tipo: string; descricao: string; valor: number; valor_juros: number | null; valor_pago: number; valor_desconto: number; conta_bancaria: string | null; status: string }[])
        .filter((c) => ["pago", "pago_parcial"].includes(c.status.toLowerCase()));
    },
    refetchInterval: 5000,
  });

  /** Lançamentos financeiros quitados hoje. */
  const { data: lancHoje = [] } = useQuery({
    queryKey: ["saldos-lancamentos-hoje", hoje],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lancamentos_financeiros")
        .select("tipo_fluxo, descricao, valor, conta_bancaria, status, data_pagamento")
        .eq("data_pagamento", hoje);
      if (error) throw error;
      return (data as { tipo_fluxo: string; descricao: string; valor: number; conta_bancaria: string | null; status: string }[])
        .filter((l) => ["pago", "pago_parcial"].includes(l.status.toLowerCase()));
    },
    refetchInterval: 5000,
  });

  const valorBaixado = (c: typeof contasHoje[number]) => Number(c.valor_pago) || Math.max(0, Number(c.valor) + Number(c.valor_juros) - Number(c.valor_desconto));
  const ehEntrada = (t: string) => ["receber", "entrada", "receita"].includes(t.toLowerCase());

  /** Movimentos de hoje, um a um, para exibir os valores separados. */
  const movimentosHoje = [
    ...contasHoje.map((c) => ({
      descricao: c.descricao,
      valor: valorBaixado(c),
      entrada: ehEntrada(c.tipo),
    })),
    ...lancHoje.map((l) => ({
      descricao: l.descricao,
      valor: Number(l.valor ?? 0),
      entrada: ehEntrada(l.tipo_fluxo),
    })),
  ];
  const entradasLista = movimentosHoje.filter((m) => m.entrada);
  const saidasLista = movimentosHoje.filter((m) => !m.entrada);
  const entradasHoje = entradasLista.reduce((s, m) => s + m.valor, 0);
  const saidasHoje = saidasLista.reduce((s, m) => s + m.valor, 0);
  const saldoDia = entradasHoje - saidasHoje;

  /** Movimento do dia já identificado com a conta bancária informada. */
  const movimentoConta = (conta: string) =>
    contasHoje.filter((c) => (c.conta_bancaria ?? "").trim().toLowerCase() === conta.trim().toLowerCase())
      .reduce((s, c) => s + (ehEntrada(c.tipo) ? 1 : -1) * valorBaixado(c), 0) + lancHoje
      .filter((l) => (l.conta_bancaria ?? "").trim().toLowerCase() === conta.trim().toLowerCase())
      .reduce((s, l) => s + (ehEntrada(l.tipo_fluxo) ? Number(l.valor ?? 0) : -Number(l.valor ?? 0)), 0);

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
      const bruto = e?.saldo ?? s.saldo;
      const saldo = Number(bruto);
      if (bruto === "" || bruto === null || bruto === undefined || !Number.isFinite(saldo)) {
        throw new Error("Informe um saldo válido antes de salvar.");
      }
      const patch: { saldo: number; data_saldo?: string } = { saldo };
      const data = e?.data_saldo || s.data_saldo;
      if (data) patch.data_saldo = data;
      const { error } = await supabase.from("saldos_bancarios").update(patch).eq("id", s.id);
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
  const contasMovimentadasHoje = new Set(
    [...contasHoje, ...lancHoje]
      .map((m) => (m.conta_bancaria ?? "").trim().toLowerCase())
      .filter(Boolean),
  );
  const saldosComMovimentoHoje = saldos.filter((s) =>
    contasMovimentadasHoje.has(s.conta.trim().toLowerCase()),
  );
  const totalAtual = (saldosComMovimentoHoje.length > 0 ? saldosComMovimentoHoje : saldos)
    .reduce((s, c) => s + Number(c.saldo ?? 0), 0);
  const contextoSaldo = saldosComMovimentoHoje.length === 1
    ? saldosComMovimentoHoje[0]?.conta
    : saldosComMovimentoHoje.length > 1
      ? `${saldosComMovimentoHoje.length} contas movimentadas hoje`
      : "todas as contas";

  return (
    <ExpandableCard>
      <CardHeader className="flex-row items-start justify-between space-y-0 pr-12">
        <div>
          <CardTitle>Saldo das contas</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Saldo registrado por conta bancária.
          </p>
          <div className="mt-2">
            <TelaPermitida tela="extrato.importar"><ExtratoImportar /></TelaPermitida>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Saldo atual · {contextoSaldo}</p>
          <p className="text-xl font-semibold tabular-nums">{brl(totalAtual)}</p>
          <p className="mt-1 text-xs text-muted-foreground tabular-nums">
            Todas as contas {brl(total)} · recebido hoje <span className="text-emerald-500">+{brl(entradasHoje)}</span> · pago
            hoje <span className="text-destructive">−{brl(saidasHoje)}</span>
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {movimentosHoje.length > 0 && (
          <div className="space-y-3 rounded-lg border p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Movimentos de hoje
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-emerald-500">
                  Entradas · {entradasLista.length} · {brl(entradasHoje)}
                </p>
                {entradasLista.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhuma entrada hoje.</p>
                ) : (
                  entradasLista.map((m, i) => (
                    <div key={`e-${i}`} className="flex items-center justify-between gap-2 text-xs">
                      <span className="min-w-0 truncate">{m.descricao}</span>
                      <span className="shrink-0 font-medium tabular-nums text-emerald-500">
                        +{brl(m.valor)}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-destructive">
                  Saídas · {saidasLista.length} · {brl(saidasHoje)}
                </p>
                {saidasLista.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhuma saída hoje.</p>
                ) : (
                  saidasLista.map((m, i) => (
                    <div key={`s-${i}`} className="flex items-center justify-between gap-2 text-xs">
                      <span className="min-w-0 truncate">{m.descricao}</span>
                      <span className="shrink-0 font-medium tabular-nums text-destructive">
                        −{brl(m.valor)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="flex items-center justify-between border-t pt-2 text-xs font-semibold">
              <span>Saldo do dia (entradas − saídas)</span>
              <span className={`tabular-nums ${saldoDia >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                {saldoDia >= 0 ? "+" : "−"}{brl(Math.abs(saldoDia))}
              </span>
            </div>
          </div>
        )}
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
                    <p className="mt-1 text-lg font-semibold tabular-nums">
                      {brl(Number(s.saldo ?? 0))}
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
    </ExpandableCard>
  );
}
