import { useEffect, useState, useCallback, useRef } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FinancialMutationMessage {
  origem: "financeiro" | "contas" | "vendas" | "fluxo-caixa" | "banco";
  tipo: "insert" | "update" | "delete" | "baixa" | "estorno";
  tabela: "lancamentos_financeiros" | "contas" | "saldos_bancarios" | "venda_pagamentos" | "venda_historico";
  id?: string;
  timestamp: number;
}

const BROADCAST_CHANNEL_NAME = "piscinow_financial_realtime_v1";

/**
 * Dispara notificação imediata entre abas/janelas locais via BroadcastChannel,
 * garantindo sincronização com latência zero mesmo antes do evento WebSocket do Supabase.
 */
export function broadcastFinancialMutation(msg: Omit<FinancialMutationMessage, "timestamp">) {
  try {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.postMessage({ ...msg, timestamp: Date.now() });
      channel.close();
    }
  } catch (e) {
    console.debug("BroadcastChannel não suportado ou falhou:", e);
  }
}

/**
 * Invalida e força o refetch imediato de todas as consultas financeiras ativas no cliente TanStack Query.
 */
export async function sincronizarConsultasFinanceiras(qc: QueryClient) {
  const queryKeys = [
    ["lancamentos_financeiros"],
    ["contas"],
    ["saldos-bancarios"],
    ["saldos-bancarios", "completo"],
    ["saldos-bancarios-select"],
    ["saldos-contas-hoje"],
    ["saldos-lancamentos-hoje"],
    ["fluxo-caixa"],
    ["movimentacoes"],
    ["resumo-periodo-base"],
    ["dre"],
    ["vendas-dre"],
    ["lancamentos-dre"],
    ["contas-dre"],
    ["venda"],
    ["vendas"],
    ["venda-pagamentos"],
    ["historico-venda"],
  ];

  await Promise.all(
    queryKeys.map((key) =>
      qc.invalidateQueries({
        queryKey: key,
        refetchType: "active",
      }),
    ),
  );
}

/**
 * Hook centralizado que cria o vetor de escuta em tempo real do Supabase Realtime
 * e do canal Broadcast local para todas as alterações em lançamentos financeiros,
 * contas a pagar/receber e saldos bancários.
 */
export function useFinancialRealtimeSync(options?: {
  canalNome?: string;
  onUpdate?: (payload?: any) => void;
}) {
  const qc = useQueryClient();
  const [isConnected, setIsConnected] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const onUpdateRef = useRef(options?.onUpdate);
  onUpdateRef.current = options?.onUpdate;

  const triggerAtualizacao = useCallback(
    async (payload?: any) => {
      setLastSyncTime(new Date());
      await sincronizarConsultasFinanceiras(qc);
      if (onUpdateRef.current) {
        onUpdateRef.current(payload);
      }
    },
    [qc],
  );

  useEffect(() => {
    // 1. Ouvinte BroadcastChannel entre abas locais
    let localChannel: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        localChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        localChannel.onmessage = (event) => {
          void triggerAtualizacao(event.data);
        };
      }
    } catch (e) {
      console.debug("Falha ao inicializar BroadcastChannel local:", e);
    }

    // 2. Canal Supabase Realtime dedicado para as tabelas financeiras
    const canalNome = options?.canalNome || `financeiro-realtime-${Math.random().toString(36).slice(2, 9)}`;
    const supabaseChannel = supabase
      .channel(canalNome)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lancamentos_financeiros" },
        (p) => void triggerAtualizacao(p),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contas" },
        (p) => void triggerAtualizacao(p),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "saldos_bancarios" },
        (p) => void triggerAtualizacao(p),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "venda_pagamentos" },
        (p) => void triggerAtualizacao(p),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "venda_historico" },
        (p) => void triggerAtualizacao(p),
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    // 3. Atualização ao retornar o foco na janela
    const aoFocar = () => {
      if (document.visibilityState === "visible") {
        void triggerAtualizacao();
      }
    };
    document.addEventListener("visibilitychange", aoFocar);
    window.addEventListener("focus", aoFocar);
    window.addEventListener("online", aoFocar);

    return () => {
      document.removeEventListener("visibilitychange", aoFocar);
      window.removeEventListener("focus", aoFocar);
      window.removeEventListener("online", aoFocar);
      if (localChannel) localChannel.close();
      void supabase.removeChannel(supabaseChannel);
    };
  }, [options?.canalNome, triggerAtualizacao]);

  return {
    isConnected,
    lastSyncTime,
    forcarSincronizacao: triggerAtualizacao,
  };
}
