import { createServerFn } from "@tanstack/react-start";
import { createHash, timingSafeEqual } from "node:crypto";

/** Compara sem vazar tempo, hasheando os dois lados para o mesmo tamanho. */
function confere(informada: string, esperada: string) {
  const a = createHash("sha256").update(informada, "utf8").digest();
  const b = createHash("sha256").update(esperada, "utf8").digest();
  return timingSafeEqual(a, b);
}

/** Valida a senha mestra. Nunca devolve a senha, só o resultado. */
export const validarSenhaMestra = createServerFn({ method: "POST" })
  .inputValidator((input: { senha: string }) => ({ senha: String(input?.senha ?? "") }))
  .handler(async ({ data }) => {
    const esperada = process.env["MASTER_PASSWORD"];
    if (!esperada) return { ok: false as const, motivo: "nao_configurada" as const };
    if (!data.senha) return { ok: false as const, motivo: "invalida" as const };
    return confere(data.senha, esperada)
      ? { ok: true as const }
      : { ok: false as const, motivo: "invalida" as const };
  });
