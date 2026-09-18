import { supabase } from "@/integrations/supabase/client";

/**
 * Soma (valor positivo) ou subtrai (valor negativo) do saldo da conta bancária
 * informada pelo nome. Usa o registro de saldo mais recente da conta.
 * Retorna true quando o saldo foi atualizado.
 */
export async function ajustarSaldoConta(conta: string | null | undefined, delta: number) {
  const nome = (conta ?? "").trim();
  if (!nome || !Number.isFinite(delta) || Math.abs(delta) < 0.005) return false;

  const { data: linha } = await supabase
    .from("saldos_bancarios")
    .select("id, saldo")
    .eq("conta", nome)
    .order("data_saldo", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!linha) return false;

  const novo = Number((Number(linha.saldo ?? 0) + delta).toFixed(2));
  const { error } = await supabase
    .from("saldos_bancarios")
    .update({ saldo: novo })
    .eq("id", linha.id);
  if (error) throw error;
  return true;
}

/** Entrada soma, saída subtrai. */
export function sinalFluxo(tipoFluxo: string) {
  return tipoFluxo === "receita" || tipoFluxo === "entrada" ? 1 : -1;
}
