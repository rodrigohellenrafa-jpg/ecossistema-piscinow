import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function novoToken() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let t = "";
  for (let i = 0; i < 40; i++) t += chars.charAt(Math.floor(Math.random() * chars.length));
  return t;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Devolve (criando se necessário) o token pessoal de assinatura da agenda. */
export const meuTokenAgenda = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await admin();

    const { data: existente, error } = await db
      .from("agenda_assinaturas")
      .select("token")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (existente?.token) return { token: existente.token };

    const token = novoToken();
    const { error: insertError } = await db
      .from("agenda_assinaturas")
      .insert({ user_id: context.userId, token });
    if (insertError) throw new Error(insertError.message);
    return { token };
  });

/** Gera um novo token, invalidando o link antigo. */
export const regenerarTokenAgenda = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await admin();
    const token = novoToken();
    const { error } = await db
      .from("agenda_assinaturas")
      .upsert(
        { user_id: context.userId, token, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
    if (error) throw new Error(error.message);
    return { token };
  });
