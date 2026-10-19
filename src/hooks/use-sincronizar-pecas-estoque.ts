import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TABELA_PECAS_ESTOQUE_2026 } from "@/data/tabela-pecas-estoque";
import {
  TABELA_PORCELANAS_ATLAS_2026,
  TABELA_SPLASH_PISCINAS_2026,
} from "@/data/tabela-splash-piscinas";

let syncEmAndamentoGlobal = false;
let syncConcluidoGlobal = false;
let migracaoFornecedorConcluidaGlobal = false;

const NOME_FORNECEDOR_ANALANDIA = "Analandia Ind Piscinas";

const normalizarTexto = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/**
 * Garante o cadastro do fornecedor "Analandia Ind Piscinas" e migra automaticamente:
 * 1) Todos os produtos que estavam vinculados a "Splash Piscinas by iGUI";
 * 2) Todos os cadastros de piscinas (categoria "Piscinas" ou código "SPL-%").
 */
export async function garantirFornecedorAnalandiaEMigrarProdutos(
  uid?: string | null,
): Promise<{ analandiaId: string | null; migrou: boolean }> {
  const { data: fornList, error: fornErr } = await supabase
    .from("fornecedores")
    .select("id, nome");
  if (fornErr) throw fornErr;

  const lista = fornList ?? [];
  const fornAnalandia = lista.find((f) => normalizarTexto(f.nome).includes("analandia"));
  const fornSplashList = lista.filter((f) => {
    const n = normalizarTexto(f.nome);
    return n.includes("splash piscinas") || n.includes("by igui") || n === "splash";
  });

  let analandiaId: string | null = null;
  let migrou = false;

  if (fornAnalandia) {
    analandiaId = fornAnalandia.id;
    if (fornAnalandia.nome !== NOME_FORNECEDOR_ANALANDIA) {
      await supabase
        .from("fornecedores")
        .update({
          nome: NOME_FORNECEDOR_ANALANDIA,
          contato: "Fábrica Analândia",
          observacoes: "Fornecedor oficial de piscinas Analandia Ind Piscinas",
        } as never)
        .eq("id", analandiaId);
      migrou = true;
    }
  } else if (fornSplashList.length > 0) {
    // Se não havia Analândia cadastrado ainda, converte o registro Splash Piscinas by iGUI diretamente
    analandiaId = fornSplashList[0].id;
    await supabase
      .from("fornecedores")
      .update({
        nome: NOME_FORNECEDOR_ANALANDIA,
        contato: "Fábrica Analândia",
        observacoes: "Fornecedor oficial de piscinas Analandia Ind Piscinas",
      } as never)
      .eq("id", analandiaId);
    migrou = true;
  } else {
    const { data: novoForn } = await supabase
      .from("fornecedores")
      .insert({
        nome: NOME_FORNECEDOR_ANALANDIA,
        contato: "Fábrica Analândia",
        observacoes: "Fornecedor oficial de piscinas Analandia Ind Piscinas",
        ativo: true,
        ...(uid ? { created_by: uid } : {}),
      })
      .select("id")
      .single();
    analandiaId = novoForn?.id ?? null;
    migrou = true;
  }

  if (!analandiaId) {
    return { analandiaId: null, migrou };
  }

  // Migra todos os produtos vinculados a registros "Splash Piscinas by iGUI" para "Analandia Ind Piscinas"
  const splashIdsRestantes = fornSplashList
    .map((f) => f.id)
    .filter((id) => id !== analandiaId);

  if (splashIdsRestantes.length > 0) {
    const { data: prodSplash } = await supabase
      .from("produtos")
      .select("id")
      .in("fornecedor_id", splashIdsRestantes)
      .limit(1);

    if ((prodSplash ?? []).length > 0) {
      await supabase
        .from("produtos")
        .update({ fornecedor_id: analandiaId } as never)
        .in("fornecedor_id", splashIdsRestantes);
      migrou = true;
    }

    await supabase
      .from("ordens_compra")
      .update({
        fornecedor_id: analandiaId,
        fornecedor_nome: NOME_FORNECEDOR_ANALANDIA,
      } as never)
      .in("fornecedor_id", splashIdsRestantes);
  }

  // Garante que todos os cadastros de piscinas (categoria Piscinas ou SPL-%) apontem para Analandia Ind Piscinas
  const { data: piscinasDesatualizadas } = await supabase
    .from("produtos")
    .select("id")
    .or("categoria.eq.Piscinas,codigo.ilike.SPL-%")
    .neq("fornecedor_id", analandiaId)
    .limit(1);

  const { data: piscinasSemFornecedor } = await supabase
    .from("produtos")
    .select("id")
    .or("categoria.eq.Piscinas,codigo.ilike.SPL-%")
    .is("fornecedor_id", null)
    .limit(1);

  if (
    (piscinasDesatualizadas ?? []).length > 0 ||
    (piscinasSemFornecedor ?? []).length > 0
  ) {
    await supabase
      .from("produtos")
      .update({ fornecedor_id: analandiaId } as never)
      .or("categoria.eq.Piscinas,codigo.ilike.SPL-%");
    migrou = true;
  }

  return { analandiaId, migrou };
}

export async function sincronizarPecasEstoqueNoBanco(options?: {
  silencioso?: boolean;
}): Promise<{ inseridos: number; atualizados: number }> {
  const { data: userData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !userData.user) {
    if (!options?.silencioso) {
      throw new Error("Faça login novamente para sincronizar os itens de estoque.");
    }
    return { inseridos: 0, atualizados: 0 };
  }
  const uid = userData.user.id;

  // Garante fornecedor Analandia Ind Piscinas e migra itens antigos de Splash Piscinas by iGUI
  const { analandiaId: analandiaFornecedorId, migrou } =
    await garantirFornecedorAnalandiaEMigrarProdutos(uid);

  // Busca códigos e nomes existentes para evitar duplicidade e garantir que todos estejam ativos
  const { data: existentesData, error: existErr } = await supabase
    .from("produtos")
    .select("id, codigo, nome, ativo");
  if (existErr) throw existErr;

  const porCodigo = new Map<string, string>();
  const porNome = new Map<string, string>();
  const inativosIds: string[] = [];
  for (const p of existentesData ?? []) {
    if (p.codigo) porCodigo.set(p.codigo.trim().toUpperCase(), p.id);
    if (p.nome) porNome.set(p.nome.trim().toUpperCase(), p.id);
    if (p.ativo === false || p.ativo === null) {
      inativosIds.push(p.id);
    }
  }

  if (inativosIds.length > 0) {
    for (let i = 0; i < inativosIds.length; i += 100) {
      await supabase
        .from("produtos")
        .update({ ativo: true } as never)
        .in("id", inativosIds.slice(i, i + 100));
    }
  }

  const novos: Record<string, unknown>[] = [];
  let atualizados = inativosIds.length + (migrou ? 1 : 0);

  // 1. Piscinas (Analandia Ind Piscinas)
  for (const item of TABELA_SPLASH_PISCINAS_2026) {
    const chaveCod = item.codigo.trim().toUpperCase();
    const chaveNome = item.nome.trim().toUpperCase();
    const idExistente = porCodigo.get(chaveCod) ?? porNome.get(chaveNome);
    if (!idExistente) {
      porCodigo.set(chaveCod, "novo");
      porNome.set(chaveNome, "novo");
      novos.push({
        codigo: item.codigo,
        nome: item.nome,
        categoria: item.categoria,
        tipo: item.tipo,
        unidade: item.unidade,
        preco_custo: item.preco_custo,
        preco_venda: item.preco_venda,
        custo_fabricacao: item.custoFabricacao ?? 0,
        custo_logistico: item.custoLogistico ?? 0,
        estoque_atual: 0,
        estoque_minimo: 0,
        sob_encomenda: true,
        fornecedor_id: analandiaFornecedorId,
        descricao: item.descricao,
        ativo: true,
        created_by: uid,
      });
    } else if (!options?.silencioso) {
      atualizados++;
    }
  }

  // 2. Porcelanas / Pastilhas Atlas 2026
  for (const item of TABELA_PORCELANAS_ATLAS_2026) {
    const chaveCod = item.codigo.trim().toUpperCase();
    const chaveNome = item.nome.trim().toUpperCase();
    const idExistente = porCodigo.get(chaveCod) ?? porNome.get(chaveNome);
    if (!idExistente) {
      porCodigo.set(chaveCod, "novo");
      porNome.set(chaveNome, "novo");
      novos.push({
        codigo: item.codigo,
        nome: item.nome,
        categoria: item.categoria,
        tipo: item.tipo,
        unidade: item.unidade,
        preco_custo: item.preco_custo,
        preco_venda: item.preco_venda,
        estoque_atual: 0,
        estoque_minimo: 0,
        sob_encomenda: true,
        fornecedor_id: analandiaFornecedorId,
        modelo_pastilha: item.modeloOriginal,
        descricao: item.descricao,
        ativo: true,
        created_by: uid,
      });
    } else if (!options?.silencioso) {
      atualizados++;
    }
  }

  // 3. Peças e Acessórios de Estoque 2026
  for (const item of TABELA_PECAS_ESTOQUE_2026) {
    const chaveCod = item.codigo.trim().toUpperCase();
    const chaveNome = item.nome.trim().toUpperCase();
    const idExistente = porCodigo.get(chaveCod) ?? porNome.get(chaveNome);

    if (!idExistente) {
      porCodigo.set(chaveCod, "novo");
      porNome.set(chaveNome, "novo");
      novos.push({
        codigo: item.codigo,
        nome: item.nome,
        categoria: item.categoria,
        tipo: item.tipo,
        unidade: item.unidade,
        ncm: item.ncm,
        preco_custo: item.preco_custo,
        preco_venda: item.preco_venda,
        unidades_por_compra: item.unidadesPorCompra,
        estoque_atual: 0,
        estoque_minimo: 0,
        sob_encomenda: false,
        fornecedor_id: analandiaFornecedorId,
        descricao: item.descricao,
        ativo: true,
        created_by: uid,
      });
    } else if (!options?.silencioso) {
      atualizados++;
    }
  }

  let inseridos = 0;
  for (let i = 0; i < novos.length; i += 100) {
    const lote = novos.slice(i, i + 100);
    const { error: insertErr } = await supabase.from("produtos").insert(lote as never);
    if (insertErr) {
      // Fallback item a item caso algum código já tenha constraint
      for (const reg of lote) {
        const { error: singleErr } = await supabase.from("produtos").insert(reg as never);
        if (!singleErr) inseridos++;
      }
    } else {
      inseridos += lote.length;
    }
  }

  return { inseridos, atualizados };
}

/**
 * Hook que verifica automaticamente se todos os itens do catálogo unificado
 * já estão cadastrados e ativos no banco, além de garantir a migração do fornecedor
 * "Splash Piscinas by iGUI" para "Analandia Ind Piscinas".
 */
export function useSincronizarPecasEstoque() {
  const qc = useQueryClient();
  const [sincronizando, setSincronizando] = useState(false);
  const disparouRef = useRef(false);

  useEffect(() => {
    if (disparouRef.current || syncEmAndamentoGlobal || syncConcluidoGlobal) return;
    disparouRef.current = true;

    let cancelado = false;
    (async () => {
      try {
        if (!migracaoFornecedorConcluidaGlobal) {
          const { data: authData } = await supabase.auth.getUser();
          const { migrou } = await garantirFornecedorAnalandiaEMigrarProdutos(
            authData.user?.id ?? null,
          );
          migracaoFornecedorConcluidaGlobal = true;
          if (migrou) {
            qc.invalidateQueries({ queryKey: ["produtos"] });
            qc.invalidateQueries({ queryKey: ["produtos-select"] });
            qc.invalidateQueries({ queryKey: ["fornecedores"] });
            qc.invalidateQueries({ queryKey: ["fornecedores-select"] });
            qc.invalidateQueries({ queryKey: ["ordens_compra"] });
          }
        }

        const totalEsperado =
          TABELA_PECAS_ESTOQUE_2026.length +
          TABELA_SPLASH_PISCINAS_2026.length +
          TABELA_PORCELANAS_ATLAS_2026.length;

        const { count, error } = await supabase
          .from("produtos")
          .select("id", { count: "exact", head: true })
          .eq("ativo", true);

        if (error) return;
        if ((count ?? 0) >= totalEsperado) {
          syncConcluidoGlobal = true;
          return;
        }

        syncEmAndamentoGlobal = true;
        if (!cancelado) setSincronizando(true);

        const { inseridos, atualizados } = await sincronizarPecasEstoqueNoBanco({
          silencioso: true,
        });
        syncConcluidoGlobal = true;

        if (inseridos > 0 || atualizados > 0) {
          if (inseridos > 0) {
            toast.success(
              `${inseridos} item(ns) sincronizados automaticamente no catálogo global!`,
            );
          }
          qc.invalidateQueries({ queryKey: ["produtos"] });
          qc.invalidateQueries({ queryKey: ["produtos-select"] });
          qc.invalidateQueries({ queryKey: ["fornecedores"] });
          qc.invalidateQueries({ queryKey: ["fornecedores-select"] });
        }
      } catch {
        // Falha silenciosa em background
      } finally {
        syncEmAndamentoGlobal = false;
        if (!cancelado) setSincronizando(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [qc]);

  return { sincronizando };
}
