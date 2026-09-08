import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Perfil = "admin" | "gerente" | "vendedor" | "financeiro" | "tecnico" | "usuario";

const PERFIS: Perfil[] = ["admin", "gerente", "vendedor", "financeiro", "tecnico", "usuario"];

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Somente administradores podem gerenciar usuários.");
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function senhaTemporaria() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
  let pwd = "";
  for (let i = 0; i < 12; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

export const listarUsuarios = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const db = await admin();

    const {
      data: { users },
      error: authError,
    } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (authError) throw new Error(authError.message);

    const { data: papeis, error: rolesError } = await db.from("user_roles").select("id, user_id, role");
    if (rolesError) throw new Error(rolesError.message);

    const { data: importados, error: importError } = await db
      .from("usuarios_importados")
      .select("id, nome, email, perfil, ativo");
    if (importError) throw new Error(importError.message);

    const papeisPorUser = new Map<string, { id: string; role: Perfil }[]>();
    for (const p of papeis ?? []) {
      const lista = papeisPorUser.get(p.user_id) ?? [];
      lista.push({ id: p.id, role: p.role as Perfil });
      papeisPorUser.set(p.user_id, lista);
    }

    const importadosPorId = new Map((importados ?? []).map((u) => [u.id, u]));

    return (users ?? []).map((u) => {
      const imp = importadosPorId.get(u.id);
      return {
        id: u.id,
        email: u.email ?? imp?.email ?? "—",
        nome: imp?.nome ?? u.user_metadata?.nome ?? u.email?.split("@")[0] ?? "—",
        ativo: imp?.ativo ?? true,
        papeis: papeisPorUser.get(u.id) ?? [],
      };
    });
  });

export const criarUsuario = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string; nome: string; perfil: Perfil }) => {
    const email = String(input?.email ?? "").trim().toLowerCase();
    const nome = String(input?.nome ?? "").trim();
    const perfil = String(input?.perfil ?? "").trim() as Perfil;

    if (!email || !email.includes("@")) throw new Error("Informe um e-mail válido.");
    if (!nome) throw new Error("Informe o nome do usuário.");
    if (!PERFIS.includes(perfil)) throw new Error("Perfil inválido.");

    return { email, nome, perfil };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const db = await admin();

    const tempPassword = senhaTemporaria();

    const { data: created, error: createError } = await db.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { nome: data.nome },
    });

    if (createError) {
      if (createError.message?.toLowerCase().includes("already registered")) {
        throw new Error("Já existe um usuário com este e-mail.");
      }
      throw new Error(createError.message);
    }

    if (!created?.user) throw new Error("Não foi possível criar o usuário.");

    const userId = created.user.id;

    const { error: roleError } = await db.from("user_roles").insert({
      user_id: userId,
      role: data.perfil,
    });
    if (roleError) throw new Error(roleError.message);

    const { error: importError } = await db.from("usuarios_importados").upsert(
      {
        id: userId,
        nome: data.nome,
        email: data.email,
        perfil: data.perfil,
        ativo: true,
        created_by: context.userId,
      },
      { onConflict: "id" },
    );
    if (importError) throw new Error(importError.message);

    return {
      id: userId,
      email: data.email,
      nome: data.nome,
      perfil: data.perfil,
      senhaTemporaria: tempPassword,
    };
  });

export const removerUsuario = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) => {
    if (!input?.userId) throw new Error("Usuário inválido.");
    return input;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const db = await admin();

    if (data.userId === context.userId) {
      throw new Error("Você não pode remover a si mesmo.");
    }

    const { error: deleteError } = await db.auth.admin.deleteUser(data.userId);
    if (deleteError) throw new Error(deleteError.message);

    return { ok: true };
  });
