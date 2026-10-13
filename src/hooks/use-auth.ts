import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { brokeredPreviewStorage } from "@/integrations/supabase/previewAuthStorage";

const CHAVES_CICLO_VENDA = [
  "piscinow:pdv-rascunho",
  "piscinow:pdv-rascunho-venda-id",
  "piscinow:conversao-lead",
];

/**
 * Encerra completamente a sessão atual no Supabase e limpa qualquer persistência
 * de login (localStorage, sessionStorage e broker do preview), além de encerrar
 * o ciclo de vendas em andamento para permitir alternar de conta com segurança.
 */
export async function encerrarSessaoCompleta(opcoes?: { manterRascunho?: boolean }) {
  try {
    if (!opcoes?.manterRascunho && typeof window !== "undefined") {
      const rascunhoVendaId = window.localStorage.getItem("piscinow:pdv-rascunho-venda-id");
      if (rascunhoVendaId) {
        try {
          await supabase.from("venda_itens").delete().eq("venda_id", rascunhoVendaId);
          await supabase
            .from("vendas")
            .delete()
            .eq("id", rascunhoVendaId)
            .eq("status_pedido", "orcamento")
            .eq("etiqueta", "Rascunho não concluído");
        } catch {
          /* limpeza best-effort do rascunho temporário */
        }
      }
      for (const k of CHAVES_CICLO_VENDA) {
        try {
          window.localStorage.removeItem(k);
          window.sessionStorage.removeItem(k);
        } catch {
          /* ignore */
        }
      }
    }

    // Coleta todas as chaves de autenticação antes do signOut para gravar tombstone no broker
    const authKeys = new Set<string>();
    if (typeof window !== "undefined") {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && (k.startsWith("sb-") || k.includes("supabase.auth"))) {
          authKeys.add(k);
        }
      }
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const k = window.sessionStorage.key(i);
        if (k && (k.startsWith("sb-") || k.includes("supabase.auth"))) {
          authKeys.add(k);
        }
      }
    }

    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch {
      /* prossegue com signOut local mesmo se falhar na rede */
    }
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      /* ignore */
    }

    if (typeof window !== "undefined") {
      const broker = brokeredPreviewStorage();
      for (const k of authKeys) {
        try {
          // Grava tombstone vazio ('') e remove no broker para impedir ressurreição da sessão
          await broker?.setItem?.(k, "");
          await broker?.removeItem?.(k);
        } catch {
          /* ignore */
        }
        try {
          window.localStorage.removeItem(k);
          window.sessionStorage.removeItem(k);
        } catch {
          /* ignore */
        }
      }
      window.dispatchEvent(new Event("piscinow:logout"));
    }
  } catch {
    /* garante que nunca trava o fluxo de saída */
  }
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "SIGNED_OUT") {
        setSession(null);
      } else {
        setSession(s);
      }
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const onLogout = () => {
      setSession(null);
      setLoading(false);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("piscinow:logout", onLogout);
    }
    return () => {
      sub.subscription.unsubscribe();
      if (typeof window !== "undefined") {
        window.removeEventListener("piscinow:logout", onLogout);
      }
    };
  }, []);

  return { session, user: (session?.user ?? null) as User | null, loading };
}
