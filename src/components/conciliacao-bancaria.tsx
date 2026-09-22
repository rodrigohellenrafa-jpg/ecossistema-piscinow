import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Link2, Link2Off, PlusCircle, SkipForward } from "lucide-react";
import { toast } from "sonner";

import { ExtratoImportar } from "@/components/extrato-importar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR } from "@/lib/erp";

const MAX_CONTAS = 5;

type Extrato = {
  id: string;
  conta: string;
  banco: string | null;
  data_movimento: string;
  descricao: string;
  valor: number;
  tipo: string;
  conciliado: boolean;
  lancamento_id: string | null;
  conta_id: string | null;
};

type TituloConta = {
  id: string;
  tipo: string;
  descricao: string;
  categoria: string | null;
  valor: number;
  valor_pago: number | null;
  status: string;
  data_pagamento: string | null;
  vencimento: string;
  conta_bancaria: string | null;
};

type Lanc = {
  id: string;
  descricao: string;
  categoria: string | null;
  valor: number;
  tipo_fluxo: string;
  status: string;
  data_competencia: string;
  data_pagamento: string | null;
  conta_bancaria: string | null;
  conciliado: boolean;
};

const dias = (a: string, b: string) =>
  Math.abs((new Date(`${a}T12:00:00`).getTime() - new Date(`${b}T12:00:00`).getTime()) / 86_400_000);

/** Conciliação bancária: casa os movimentos do extrato com os lançamentos do sistema. */
export function ConciliacaoBancaria() {
  const qc = useQueryClient();
  const [conta, setConta] = useState<string>("");

  const { data: contas = [] } = useQuery({
    queryKey: ["saldos-bancarios", "conciliacao"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saldos_bancarios")
        .select("id, conta, banco")
        .order("conta");
      if (error) throw error;
      return data as { id: string; conta: string; banco: string | null }[];
    },
  });

  const { data: extrato = [] } = useQuery({
    queryKey: ["extratos-bancarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extratos_bancarios")
        .select(
          "id, conta, banco, data_movimento, descricao, valor, tipo, conciliado, lancamento_id, conta_id",
        )
        .order("data_movimento", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as unknown as Extrato[];
    },
  });

  const { data: lancamentos = [] } = useQuery({
    queryKey: ["conciliacao-lancamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lancamentos_financeiros")
        .select(
          "id, descricao, categoria, valor, tipo_fluxo, status, data_competencia, data_pagamento, conta_bancaria, conciliado",
        )
        .order("data_competencia", { ascending: false })
        .limit(600);
      if (error) throw error;
      return data as Lanc[];
    },
  });

  /** Títulos de contas a pagar/receber já baixados também entram na conciliação. */
  const { data: titulos = [] } = useQuery({
    queryKey: ["conciliacao-titulos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas")
        .select(
          "id, tipo, descricao, categoria, valor, valor_pago, status, data_pagamento, vencimento, conta_bancaria",
        )
        .eq("status", "pago")
        .order("data_pagamento", { ascending: false })
        .limit(600);
      if (error) throw error;
      return data as TituloConta[];
    },
  });

  const usadas = contas.slice(0, MAX_CONTAS);
  const ativa = conta || usadas[0]?.conta || "";

  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ["extratos-bancarios"] });
    qc.invalidateQueries({ queryKey: ["conciliacao-lancamentos"] });
    qc.invalidateQueries({ queryKey: ["conciliacao-titulos"] });
    qc.invalidateQueries({ queryKey: ["lancamentos_financeiros"] });
    qc.invalidateQueries({ queryKey: ["contas"] });
  };

  /** Registro do sistema que pode casar com um movimento do extrato. */
  type Candidato = {
    origem: "lancamento" | "titulo";
    id: string;
    descricao: string;
    categoria: string | null;
    data: string;
  };

  const casar = async (mov: Extrato, alvo: Candidato | null) => {
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("extratos_bancarios")
      .update({
        conciliado: true,
        lancamento_id: alvo?.origem === "lancamento" ? alvo.id : null,
        conta_id: alvo?.origem === "titulo" ? alvo.id : null,
        conciliado_em: new Date().toISOString(),
        conciliado_por: auth.user?.id ?? null,
      } as never)
      .eq("id", mov.id);
    if (error) throw error;
    if (alvo?.origem === "lancamento") {
      const { error: e2 } = await supabase
        .from("lancamentos_financeiros")
        .update({ conciliado: true, conta_bancaria: mov.conta })
        .eq("id", alvo.id);
      if (e2) throw e2;
    }
    if (alvo?.origem === "titulo") {
      const { error: e3 } = await supabase
        .from("contas")
        .update({ conta_bancaria: mov.conta })
        .eq("id", alvo.id);
      if (e3) throw e3;
    }
  };

  const conciliar = useMutation({
    mutationFn: ({ mov, alvo }: { mov: Extrato; alvo: Candidato | null }) => casar(mov, alvo),
    onSuccess: () => {
      invalidar();
      toast.success("Movimento conciliado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const desfazer = useMutation({
    mutationFn: async (mov: Extrato) => {
      const { error } = await supabase
        .from("extratos_bancarios")
        .update({ conciliado: false, lancamento_id: null, conciliado_em: null } as never)
        .eq("id", mov.id);
      if (error) throw error;
      if (mov.lancamento_id) {
        await supabase
          .from("lancamentos_financeiros")
          .update({ conciliado: false })
          .eq("id", mov.lancamento_id);
      }
    },
    onSuccess: () => {
      invalidar();
      toast.success("Conciliação desfeita.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const lancarECconciliar = useMutation({
    mutationFn: async (mov: Extrato) => {
      const { data: auth } = await supabase.auth.getUser();
      const { data: novo, error } = await supabase
        .from("lancamentos_financeiros")
        .insert({
          tipo_fluxo: mov.tipo === "entrada" ? "receita" : "despesa",
          categoria: "Conciliação bancária",
          descricao: mov.descricao,
          valor: Number(mov.valor ?? 0),
          data_competencia: mov.data_movimento,
          data_pagamento: mov.data_movimento,
          conta_bancaria: mov.conta,
          status: "Pago",
          conciliado: true,
          created_by: auth.user?.id ?? null,
        })
        .select("id")
        .single();
      if (error) throw error;
      const { error: e2 } = await supabase
        .from("extratos_bancarios")
        .update({
          conciliado: true,
          lancamento_id: novo.id,
          conciliado_em: new Date().toISOString(),
          conciliado_por: auth.user?.id ?? null,
        } as never)
        .eq("id", mov.id);
      if (e2) throw e2;
    },
    onSuccess: () => {
      invalidar();
      toast.success("Lançamento criado e conciliado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const daConta = useMemo(() => extrato.filter((m) => m.conta === ativa), [extrato, ativa]);
  const pendentes = daConta.filter((m) => !m.conciliado);
  const conciliados = daConta.filter((m) => m.conciliado).slice(0, 30);

  /** Lançamentos ainda livres que podem casar com um movimento do extrato. */
  const sugestoes = (m: Extrato) => {
    const alvo = Number(m.valor ?? 0);
    const esperado = m.tipo === "entrada" ? "receita" : "despesa";
    return lancamentos
      .filter((l) => !l.conciliado && l.status !== "Cancelado" && l.tipo_fluxo === esperado)
      .filter((l) => Math.abs(Number(l.valor ?? 0) - alvo) <= 0.02)
      .filter((l) => dias(l.data_pagamento ?? l.data_competencia, m.data_movimento) <= 7)
      .sort(
        (a, b) =>
          dias(a.data_pagamento ?? a.data_competencia, m.data_movimento) -
          dias(b.data_pagamento ?? b.data_competencia, m.data_movimento),
      )
      .slice(0, 3);
  };

  const somaPendentes = pendentes.reduce(
    (s, m) => s + (m.tipo === "entrada" ? Number(m.valor ?? 0) : -Number(m.valor ?? 0)),
    0,
  );

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle>Conciliação bancária (até {MAX_CONTAS} contas)</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Importe o extrato do banco e confirme quais movimentos já estão registrados no sistema.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExtratoImportar contaInicial={ativa} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {usadas.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Cadastre suas contas no quadro de saldos acima para começar a conciliar.
          </p>
        ) : (
          <Tabs value={ativa} onValueChange={setConta}>
            <TabsList className="flex-wrap">
              {usadas.map((c) => {
                const n = extrato.filter((m) => m.conta === c.conta && !m.conciliado).length;
                return (
                  <TabsTrigger key={c.id} value={c.conta}>
                    {c.conta}
                    {n > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {n}
                      </Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {usadas.map((c) => (
              <TabsContent key={c.id} value={c.conta} className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3 text-sm">
                  <span className="text-muted-foreground">
                    {pendentes.length} movimentos a conciliar
                  </span>
                  <span className="tabular-nums">
                    Diferença pendente:{" "}
                    <strong className={somaPendentes < 0 ? "text-destructive" : "text-success"}>
                      {brl(somaPendentes)}
                    </strong>
                  </span>
                </div>

                <div className="space-y-2">
                  {pendentes.map((m) => {
                    const cands = sugestoes(m);
                    return (
                      <div key={m.id} className="rounded-lg border p-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-medium leading-tight">{m.descricao}</p>
                            <p className="text-xs text-muted-foreground">
                              {dataBR(m.data_movimento)} · {m.conta}
                            </p>
                          </div>
                          <span
                            className={`tabular-nums ${m.tipo === "entrada" ? "text-success" : "text-destructive"}`}
                          >
                            {m.tipo === "entrada" ? "+" : "−"}
                            {brl(m.valor)}
                          </span>
                        </div>

                        {cands.length > 0 ? (
                          <div className="mt-2 space-y-1">
                            {cands.map((l) => (
                              <div
                                key={l.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/50 px-2 py-1 text-sm"
                              >
                                <span>
                                  {l.descricao}{" "}
                                  <span className="text-xs text-muted-foreground">
                                    {dataBR(l.data_pagamento ?? l.data_competencia)} ·{" "}
                                    {l.categoria || "—"}
                                  </span>
                                </span>
                                <Button
                                  size="sm"
                                  onClick={() => conciliar.mutate({ mov: m, lanc: l })}
                                  disabled={conciliar.isPending}
                                >
                                  <Link2 /> Conciliar
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Nenhum lançamento parecido encontrado.
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => lancarECconciliar.mutate(m)}
                            disabled={lancarECconciliar.isPending}
                          >
                            <PlusCircle /> Criar lançamento
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => conciliar.mutate({ mov: m, lanc: null })}
                            disabled={conciliar.isPending}
                          >
                            <SkipForward /> Marcar como conferido
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {pendentes.length === 0 && (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Tudo conciliado nesta conta.
                    </p>
                  )}
                </div>

                {conciliados.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Já conciliados
                    </p>
                    {conciliados.map((m) => (
                      <div
                        key={m.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-2 py-1 text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <Check className="size-4 text-success" />
                          {m.descricao}
                          <span className="text-xs text-muted-foreground">
                            {dataBR(m.data_movimento)}
                          </span>
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="tabular-nums">{brl(m.valor)}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => desfazer.mutate(m)}
                            disabled={desfazer.isPending}
                          >
                            <Link2Off /> Desfazer
                          </Button>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}

        {contas.length > MAX_CONTAS && (
          <p className="text-xs text-muted-foreground">
            A conciliação trabalha com as {MAX_CONTAS} primeiras contas cadastradas.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
