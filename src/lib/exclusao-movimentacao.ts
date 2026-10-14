import type { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MovimentoExclusaoInfo {
  id: string; // UUID real do registro
  tipo: "conta" | "lancamento";
  descricao?: string;
  valor?: number;
  contaBancaria?: string | null;
  sentido?: "entrada" | "saida";
  realizado?: boolean;
  vendaId?: string | null;
}

export interface LinhaMovimentacao {
  id: string; // `conta-${c.id}` ou `lanc-${l.id}`
  rawId: string;
  tipoRegistro: "conta" | "lancamento";
  data: string;
  descricao: string;
  parceiro: string;
  origem: string;
  categoria: string;
  conta: string;
  sentido: "entrada" | "saida";
  valor: number;
  realizado: boolean;
  link?: string;
  vendaId?: string | null;
  ehDuplicado?: boolean;
}

export interface GrupoDuplicidade<T> {
  id: string;
  criterio: string;
  principal: T;
  duplicados: T[];
  totalDuplicado: number;
}

const norm = (s?: string | null) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

/**
 * Invalida todas as consultas de saldo, fluxo de caixa e movimentações financeiras
 * para garantir que os cards, KPIs e tabelas atualizem imediatamente.
 */
export async function invalidarConsultasFinanceiras(qc: QueryClient) {
  await Promise.all([
    qc.invalidateQueries({ queryKey: ["contas"] }),
    qc.invalidateQueries({ queryKey: ["lancamentos_financeiros"] }),
    qc.invalidateQueries({ queryKey: ["saldos-bancarios"] }),
    qc.invalidateQueries({ queryKey: ["saldos-bancarios", "completo"] }),
    qc.invalidateQueries({ queryKey: ["saldos-contas-hoje"] }),
    qc.invalidateQueries({ queryKey: ["saldos-lancamentos-hoje"] }),
    qc.invalidateQueries({ queryKey: ["fluxo-caixa"] }),
    qc.invalidateQueries({ queryKey: ["resumo-periodo-base"] }),
    qc.invalidateQueries({ queryKey: ["venda"] }),
    qc.invalidateQueries({ queryKey: ["vendas"] }),
    qc.invalidateQueries({ queryKey: ["venda-pagamentos"] }),
    qc.invalidateQueries({ queryKey: ["historico-venda"] }),
  ]);
}

/**
 * Remove permanentemente um lançamento financeiro ou título de conta do banco de dados,
 * desfaz vínculos com histórico e pagamentos, e garante a atualização imediata dos saldos.
 */
export async function excluirMovimentacaoPermanente(
  movimento: MovimentoExclusaoInfo,
  qc?: QueryClient,
): Promise<{ success: boolean; message?: string }> {
  const { id, tipo } = movimento;

  try {
    // 1. Tenta executar via RPC dedicado no Supabase
    const { data: rpcData, error: rpcError } = await (supabase.rpc as any)(
      "excluir_movimentacao_permanentemente",
      {
        p_tabela: tipo === "conta" ? "contas" : "lancamentos_financeiros",
        p_id: id,
      },
    );

    if (!rpcError && rpcData?.success) {
      if (qc) await invalidarConsultasFinanceiras(qc);
      return { success: true };
    }

    // 2. Fallback resiliente: exclusão direta via tabelas com limpeza de dependências
    if (tipo === "lancamento") {
      // 2a. Desvincula histórico
      await supabase.from("venda_historico").delete().eq("lancamento_id", id);

      // 2b. Verifica observacoes para limpar venda_pagamentos se originado de pagamento
      const { data: lanc } = await supabase
        .from("lancamentos_financeiros")
        .select("venda_id, observacoes")
        .eq("id", id)
        .maybeSingle();

      if (lanc?.observacoes?.startsWith("pagamento:")) {
        const pagId = lanc.observacoes.replace("pagamento:", "").trim();
        if (pagId) {
          await supabase.from("venda_pagamentos").delete().eq("id", pagId);
        }
      }

      // 2c. Exclui o lançamento
      const { error: errDel } = await supabase
        .from("lancamentos_financeiros")
        .delete()
        .eq("id", id);
      if (errDel) throw errDel;
    } else {
      // tipo === "conta"
      const tag = `[conta_id:${id}]`;
      await supabase
        .from("venda_historico")
        .delete()
        .or(`conta_id.eq.${id},observacoes.ilike.%${tag}%`);

      const { data: conta } = await supabase
        .from("contas")
        .select("venda_id")
        .eq("id", id)
        .maybeSingle();

      if (conta?.venda_id) {
        await supabase
          .from("venda_pagamentos")
          .delete()
          .eq("venda_id", conta.venda_id)
          .ilike("observacoes", `%${tag}%`);
      }

      const { error: errDel } = await supabase.from("contas").delete().eq("id", id);
      if (errDel) throw errDel;
    }

    if (qc) await invalidarConsultasFinanceiras(qc);
    return { success: true };
  } catch (err) {
    console.error("Falha ao excluir movimentação permanentemente:", err);
    throw err instanceof Error ? err : new Error("Erro desconhecido ao excluir registro.");
  }
}

/**
 * Agrupa itens do painel de movimentações que representam o mesmo fato contábil ou venda repetida.
 */
export function agruparDuplicidadesMovimentacoes<
  T extends {
    id: string;
    rawId: string;
    tipoRegistro: "conta" | "lancamento";
    data: string;
    descricao: string;
    parceiro: string;
    sentido: "entrada" | "saida";
    valor: number;
    conta: string;
    realizado: boolean;
    vendaId?: string | null;
  },
>(itens: T[]): GrupoDuplicidade<T>[] {
  const grupos: GrupoDuplicidade<T>[] = [];
  const processados = new Set<string>();

  for (let i = 0; i < itens.length; i++) {
    const a = itens[i];
    if (processados.has(a.id)) continue;

    const duplicados: T[] = [];
    let criterio = "";

    for (let j = i + 1; j < itens.length; j++) {
      const b = itens[j];
      if (processados.has(b.id)) continue;
      if (a.id === b.id) continue;

      // 1. Mesmo Voo / Pedido / Venda com mesmo sentido e valor idêntico
      const mesmaVenda = Boolean(
        a.vendaId && b.vendaId && a.vendaId === b.vendaId && a.sentido === b.sentido,
      );
      const mesmoValor = Math.abs(a.valor - b.valor) < 0.01;
      const mesmaData = a.data.slice(0, 10) === b.data.slice(0, 10);
      const mesmaDescricao =
        norm(a.descricao).length > 3 && norm(a.descricao) === norm(b.descricao);
      const mesmoParceiro =
        norm(a.parceiro).length > 2 && norm(a.parceiro) === norm(b.parceiro);
      const mesmaConta =
        a.conta && b.conta && a.conta !== "—" && norm(a.conta) === norm(b.conta);

      // Critérios de Duplicidade:
      // A) Mesma venda, mesmo sentido e mesmo valor (duplicidade entre contas a receber e livro caixa)
      // B) Mesma data, mesmo sentido, mesmo valor e mesma conta bancária
      // C) Mesma data, mesmo sentido, mesmo valor e mesma descrição/parceiro
      if (mesmaVenda && mesmoValor) {
        criterio = "Mesmo pedido de venda e valor repetido";
        duplicados.push(b);
        processados.add(b.id);
      } else if (mesmoValor && mesmaData && a.sentido === b.sentido && (mesmaConta || mesmaDescricao || mesmoParceiro)) {
        criterio = mesmaConta
          ? "Mesma data, conta bancária, valor e sentido"
          : "Mesma data, descrição, valor e sentido";
        duplicados.push(b);
        processados.add(b.id);
      }
    }

    if (duplicados.length > 0) {
      processados.add(a.id);
      // Decide qual é o principal: prefere o que está marcado como "realizado"
      // ou o que tem link/origem mais completo (ex: lancamentos_financeiros com conta confirmada)
      let principal = a;
      const listaTodos = [a, ...duplicados];
      const candidatoRealizado = listaTodos.find(
        (item) => item.realizado && item.conta && item.conta !== "—",
      );
      if (candidatoRealizado) {
        principal = candidatoRealizado;
      }

      const sobramDuplicados = listaTodos.filter((item) => item.id !== principal.id);
      const totalDuplicado = sobramDuplicados.reduce((acc, d) => acc + d.valor, 0);

      grupos.push({
        id: `grupo-${principal.id}`,
        criterio,
        principal,
        duplicados: sobramDuplicados,
        totalDuplicado,
      });
    }
  }

  return grupos;
}

/**
 * Exclui múltiplos lançamentos duplicados em lote e atualiza os saldos.
 */
export async function excluirDuplicidadesEmLote<
  T extends {
    rawId: string;
    tipoRegistro: "conta" | "lancamento";
    descricao?: string;
    valor?: number;
    conta?: string;
    sentido?: "entrada" | "saida";
    realizado?: boolean;
    vendaId?: string | null;
  },
>(duplicados: T[], qc: QueryClient): Promise<{ removidos: number; valorTotal: number }> {
  let removidos = 0;
  let valorTotal = 0;

  for (const item of duplicados) {
    try {
      await excluirMovimentacaoPermanente(
        {
          id: item.rawId,
          tipo: item.tipoRegistro,
          descricao: item.descricao,
          valor: item.valor,
          contaBancaria: item.conta,
          sentido: item.sentido,
          realizado: item.realizado,
          vendaId: item.vendaId,
        },
        undefined, // Não invalida a cada item individual do lote para performance
      );
      removidos++;
      valorTotal += Number(item.valor || 0);
    } catch (e) {
      console.error(`Erro ao excluir duplicado ${item.rawId}:`, e);
    }
  }

  // Invalidação final única para atualizar todos os saldos e painéis de uma vez
  await invalidarConsultasFinanceiras(qc);

  return { removidos, valorTotal };
}
