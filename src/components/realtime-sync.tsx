import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useFinancialRealtimeSync } from "@/lib/financial-realtime-sync";

/**
 * Mantém todas as telas sincronizadas entre computadores.
 * Escuta qualquer alteração no banco e recarrega os dados abertos na tela.
 */
export function RealtimeSync() {
  const qc = useQueryClient();

  // Vetor de escuta em tempo real dedicado aos dados financeiros
  useFinancialRealtimeSync({ canalNome: "erp-financial-global-sync" });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const agendarAtualizacao = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void qc.invalidateQueries();
      }, 300);
    };

    const canal = supabase
      .channel("erp-sync-geral")
      .on("postgres_changes", { event: "*", schema: "public", table: "vendas" }, agendarAtualizacao)
      .on("postgres_changes", { event: "*", schema: "public", table: "obras" }, agendarAtualizacao)
      .on("postgres_changes", { event: "*", schema: "public", table: "ordens_servico" }, agendarAtualizacao)
      .on("postgres_changes", { event: "*", schema: "public", table: "ordens_compra" }, agendarAtualizacao)
      .subscribe();

    const aoVoltar = () => {
      if (document.visibilityState === "visible") void qc.invalidateQueries();
    };
    document.addEventListener("visibilitychange", aoVoltar);
    window.addEventListener("online", aoVoltar);

    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", aoVoltar);
      window.removeEventListener("online", aoVoltar);
      void supabase.removeChannel(canal);
    };
  }, [qc]);

  return null;
}
