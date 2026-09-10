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
  .inputValidator(
    (input: { email: string; nome: string; perfil?: Perfil; perfis?: Perfil[]; senha?: string }) => {
      const email = String(input?.email ?? "").trim().toLowerCase();
      const nome = String(input?.nome ?? "").trim();
      const senha = String(input?.senha ?? "").trim();
      const brutos = input?.perfis?.length ? input.perfis : input?.perfil ? [input.perfil] : [];
      const perfis = Array.from(new Set(brutos.map((p) => String(p).trim() as Perfil)));

      if (!email || !email.includes("@")) throw new Error("Informe um e-mail válido.");
      if (!nome) throw new Error("Informe o nome do usuário.");
      if (perfis.length === 0) throw new Error("Selecione ao menos uma função.");
      if (perfis.some((p) => !PERFIS.includes(p))) throw new Error("Perfil inválido.");
      if (senha && senha.length < 6) throw new Error("A senha deve ter ao menos 6 caracteres.");

      return { email, nome, perfis, senha };
    },
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const db = await admin();

    const tempPassword = data.senha || senhaTemporaria();

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

    const { error: roleError } = await db
      .from("user_roles")
      .insert(data.perfis.map((role) => ({ user_id: userId, role })));
    if (roleError) throw new Error(roleError.message);

    const { error: importError } = await db.from("usuarios_importados").upsert(
      {
        id: userId,
        nome: data.nome,
        email: data.email,
        perfil: data.perfis.join(", "),
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
      perfis: data.perfis,
      senhaTemporaria: tempPassword,
    };
  });

export const definirPapeis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; perfis: Perfil[] }) => {
    const userId = String(input?.userId ?? "").trim();
    const perfis = Array.from(new Set((input?.perfis ?? []).map((p) => String(p).trim() as Perfil)));
    if (!userId) throw new Error("Usuário inválido.");
    if (perfis.length === 0) throw new Error("Selecione ao menos uma função.");
    if (perfis.some((p) => !PERFIS.includes(p))) throw new Error("Perfil inválido.");
    return { userId, perfis };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const db = await admin();

    if (data.userId === context.userId && !data.perfis.includes("admin")) {
      throw new Error("Você não pode remover o seu próprio acesso de administrador.");
    }

    const { data: atuais, error: readError } = await db
      .from("user_roles")
      .select("id, role")
      .eq("user_id", data.userId);
    if (readError) throw new Error(readError.message);

    const existentes = new Set((atuais ?? []).map((r: { role: Perfil }) => r.role));
    const remover = (atuais ?? []).filter((r: { role: Perfil }) => !data.perfis.includes(r.role));
    const inserir = data.perfis.filter((p) => !existentes.has(p));

    if (remover.length > 0) {
      const { error } = await db
        .from("user_roles")
        .delete()
        .in("id", remover.map((r: { id: string }) => r.id));
      if (error) throw new Error(error.message);
    }

    if (inserir.length > 0) {
      const { error } = await db
        .from("user_roles")
        .insert(inserir.map((role) => ({ user_id: data.userId, role })));
      if (error) throw new Error(error.message);
    }

    await db
      .from("usuarios_importados")
      .update({ perfil: data.perfis.join(", ") })
      .eq("id", data.userId);

    return { ok: true, perfis: data.perfis };
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
