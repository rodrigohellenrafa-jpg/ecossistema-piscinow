import { useCallback, useEffect, useState } from "react";

const CHAVE = "piscinow:mestre";
const EVENTO = "piscinow:mestre-mudou";

function lerFlag() {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(CHAVE) === "1";
}

/** Modo mestre: libera todos os módulos no aparelho até fechar o navegador. */
export function useMestre() {
  const [mestre, setMestre] = useState(false);

  useEffect(() => {
    setMestre(lerFlag());
    const sync = () => setMestre(lerFlag());
    window.addEventListener(EVENTO, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENTO, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const ativar = useCallback(() => {
    window.sessionStorage.setItem(CHAVE, "1");
    window.dispatchEvent(new Event(EVENTO));
  }, []);

  const desativar = useCallback(() => {
    window.sessionStorage.removeItem(CHAVE);
    window.dispatchEvent(new Event(EVENTO));
  }, []);

  return { mestre, ativar, desativar };
}
