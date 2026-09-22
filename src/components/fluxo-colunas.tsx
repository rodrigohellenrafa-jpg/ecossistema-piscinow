import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { ExpandableCard } from "@/components/expandable-card";
import { ExtratoImportar } from "@/components/extrato-importar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR } from "@/lib/erp";

type Lancamento = {
  id: string;
  descricao: string;
  categoria: string | null;
  valor: number;
  tipo_fluxo: string;
  status: string;
  data_competencia: string;
  data_pagamento: string | null;
};

type Conta = {
  id: string;
  tipo: string;
  descricao: string;
  parceiro: string | null;
  categoria: string | null;
  valor: number;
  valor_juros: number | null;
  vencimento: string;
  status: string;
  data_pagamento: string | null;
};

type Extrato = {
  id: string;
  conta: string;
  banco: string | null;
  data_movimento: string;
  descricao: string;
  valor: number;
  tipo: string;
  conciliado: boolean;
};

/** Três colunas do fluxo de caixa: lançamentos, contas a pagar e extrato bancário. */
export function FluxoColunas() {
  const qc = useQueryClient();

  const { data: lancamentos = [] } = useQuery({
    queryKey: ["fluxo-coluna-lancamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lancamentos_financeiros")
        .select("id, descricao, categoria, valor, tipo_fluxo, status, data_competencia, data_pagamento")
        .order("data_competencia", { ascending: false })
        .limit(60);
      if (error) throw error;
      return data as Lancamento[];
    },
  });

  const { data: contas = [] } = useQuery({
    queryKey: ["fluxo-coluna-contas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas")
        .select(
          "id, tipo, descricao, parceiro, categoria, valor, valor_juros, vencimento, status, data_pagamento",
        )
        .order("vencimento", { ascending: false })
        .limit(80);
      if (error) throw error;
      return data as Conta[];
    },
  });

  const { data: extrato = [] } = useQuery({
    queryKey: ["extratos-bancarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extratos_bancarios")
        .select("id, conta, banco, data_movimento, descricao, valor, tipo, conciliado")
        .order("data_movimento", { ascending: false })
        .limit(80);
      if (error) throw error;
      return data as Extrato[];
    },
  });

  const invalidarExtrato = () => qc.invalidateQueries({ queryKey: ["extratos-bancarios"] });

  const conciliar = useMutation({
    mutationFn: async (m: Extrato) => {
      const { error } = await supabase
        .from("extratos_bancarios")
        .update({ conciliado: !m.conciliado })
        .eq("id", m.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidarExtrato();
      toast.success("Movimento atualizado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const excluir = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("extratos_bancarios").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidarExtrato();
      toast.success("Movimento removido do extrato.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const naoConciliados = extrato.filter((m) => !m.conciliado).length;

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <ExpandableCard>
        <CardHeader className="pr-12">
          <CardTitle className="text-base">Lançamentos financeiros ({lancamentos.length})</CardTitle>
          <p className="text-xs text-muted-foreground">Livro-caixa direto: receitas e despesas registradas.</p>
          <Button asChild size="sm" variant="outline" className="mt-2 w-fit">
            <Link to="/financeiro">
              <ArrowUpRight /> Abrir e editar
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="max-h-[28rem] space-y-2 overflow-y-auto">
          {lancamentos.map((l) => (
            <div key={l.id} className="rounded-lg border p-2 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium leading-tight">{l.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    {dataBR(l.data_pagamento ?? l.data_competencia)} · {l.categoria || "—"} ·{" "}
                    {l.status}
                  </p>
                </div>
                <span
                  className={`tabular-nums ${l.tipo_fluxo === "receita" ? "text-success" : "text-destructive"}`}
                >
                  {l.tipo_fluxo === "receita" ? "+" : "−"}
                  {brl(l.valor)}
                </span>
              </div>
            </div>
          ))}
          {lancamentos.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum lançamento ainda.</p>
          )}
        </CardContent>
      </ExpandableCard>

      <ExpandableCard>
        <CardHeader className="pr-12">
          <CardTitle className="text-base">Contas a pagar ({contas.length})</CardTitle>
          <p className="text-xs text-muted-foreground">Títulos com vencimento, pagos e em aberto.</p>
          <Button asChild size="sm" variant="outline" className="mt-2 w-fit">
            <Link to="/contas" search={{ periodo: undefined, tipo: undefined }}>
              <ArrowUpRight /> Abrir e editar
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="max-h-[28rem] space-y-2 overflow-y-auto">
          {contas.map((c) => (
            <div key={c.id} className="rounded-lg border p-2 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium leading-tight">{c.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    venc. {dataBR(c.vencimento)} · {c.parceiro || c.categoria || "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="tabular-nums text-destructive">
                    {brl(Number(c.valor ?? 0) + Number(c.valor_juros ?? 0))}
                  </p>
                  <Badge variant={c.status === "pago" ? "outline" : "secondary"} className="mt-1">
                    {c.status === "pago" ? "Pago" : "Em aberto"}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
          {contas.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma conta a pagar.</p>
          )}
        </CardContent>
      </ExpandableCard>

      <ExpandableCard>
        <CardHeader className="pr-12">
          <CardTitle className="text-base">Extrato bancário ({extrato.length})</CardTitle>
          <p className="text-xs text-muted-foreground">
            {naoConciliados} movimentos ainda sem conciliar.
          </p>
          <div className="mt-2">
            <ExtratoImportar />
          </div>
        </CardHeader>
        <CardContent className="max-h-[28rem] space-y-2 overflow-y-auto">
          {extrato.map((m) => (
            <div key={m.id} className="rounded-lg border p-2 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium leading-tight">{m.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    {dataBR(m.data_movimento)} · {m.conta}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`tabular-nums ${m.tipo === "entrada" ? "text-success" : "text-destructive"}`}
                  >
                    {m.tipo === "entrada" ? "+" : "−"}
                    {brl(m.valor)}
                  </p>
                  <div className="mt-1 flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7"
                      title={m.conciliado ? "Desfazer conciliação" : "Marcar como conciliado"}
                      onClick={() => conciliar.mutate(m)}
                    >
                      {m.conciliado ? <Undo2 className="size-4" /> : <Check className="size-4" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 text-destructive"
                      title="Excluir movimento"
                      onClick={() => excluir.mutate(m.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
              {m.conciliado && (
                <Badge variant="outline" className="mt-1">
                  Conciliado
                </Badge>
              )}
            </div>
          ))}
          {extrato.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum extrato importado ainda. Use o botão acima para enviar o arquivo do banco.
            </p>
          )}
        </CardContent>
      </ExpandableCard>
    </div>
  );
}
