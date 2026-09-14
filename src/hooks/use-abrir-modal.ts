import { useEffect } from "react";

/**
 * Abre um modal automaticamente quando a rota é acessada com ?abrir=<chave>.
 * Usado pela página /atalhos para criar links diretos para cada formulário.
 */
export function useAbrirModal(chave: string, abrir: () => void) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("abrir") === chave) abrir();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);
}
