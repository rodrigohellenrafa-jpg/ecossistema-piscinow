import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

/**
 * Mantém todas as telas sincronizadas entre computadores.
 * Escuta qualquer alteração no banco e recarrega os dados abertos na tela.
 */
export function RealtimeSync() {
  const qc = useQueryClient();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const agendarAtualizacao = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        qc.invalidateQueries();
      }, 400);
    };

    const canal = supabase
      .channel("erp-sync")
      .on("postgres_changes", { event: "*", schema: "public" }, agendarAtualizacao)
      .subscribe();

    const aoVoltar = () => {
      if (document.visibilityState === "visible") qc.invalidateQueries();
    };
    document.addEventListener("visibilitychange", aoVoltar);
    window.addEventListener("online", aoVoltar);

    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", aoVoltar);
      window.removeEventListener("online", aoVoltar);
      supabase.removeChannel(canal);
    };
  }, [qc]);

  return null;
}
