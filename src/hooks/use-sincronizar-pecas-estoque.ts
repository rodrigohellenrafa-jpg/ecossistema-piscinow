import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TABELA_PECAS_ESTOQUE_2026 } from "@/data/tabela-pecas-estoque";

let syncEmAndamentoGlobal = false;
let syncConcluidoGlobal = false;

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

  // Garante fornecedor Splash / iGUi
  const { data: fornList } = await supabase
    .from("fornecedores")
    .select("id, nome")
    .ilike("nome", "%Splash%");

  let splashFornecedorId = fornList?.[0]?.id ?? null;
  if (!splashFornecedorId) {
    const { data: novoForn } = await supabase
      .from("fornecedores")
      .insert({
        nome: "Splash Piscinas by iGUI",
        contato: "Fábrica Splash / iGUi",
        observacoes: "Fornecedor oficial de piscinas e peças Splash by iGUI",
        ativo: true,
        created_by: uid,
      })
      .select("id")
      .single();
    splashFornecedorId = novoForn?.id ?? null;
  }

  // Busca códigos e nomes existentes para evitar duplicidade
  const { data: existentesData, error: existErr } = await supabase
    .from("produtos")
    .select("id, codigo, nome");
  if (existErr) throw existErr;

  const porCodigo = new Map<string, string>();
  const porNome = new Map<string, string>();
  for (const p of existentesData ?? []) {
    if (p.codigo) porCodigo.set(p.codigo.trim().toUpperCase(), p.id);
    if (p.nome) porNome.set(p.nome.trim().toUpperCase(), p.id);
  }

  const novos = [];
  let atualizados = 0;

  for (const item of TABELA_PECAS_ESTOQUE_2026) {
    const idExistente =
      porCodigo.get(item.codigo.toUpperCase()) ??
      porNome.get(item.nome.trim().toUpperCase());

    if (!idExistente) {
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
        fornecedor_id: splashFornecedorId,
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
 * Hook que verifica automaticamente se os 529 itens da tabela de peças/estoque
 * já estão cadastrados no banco e, caso faltem, sincroniza automaticamente em background.
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
        const { count, error } = await supabase
          .from("produtos")
          .select("id", { count: "exact", head: true })
          .ilike("codigo", "PEC-%");

        if (error) return;
        if ((count ?? 0) >= TABELA_PECAS_ESTOQUE_2026.length) {
          syncConcluidoGlobal = true;
          return;
        }

        syncEmAndamentoGlobal = true;
        if (!cancelado) setSincronizando(true);

        const { inseridos } = await sincronizarPecasEstoqueNoBanco({ silencioso: true });
        syncConcluidoGlobal = true;

        if (inseridos > 0) {
          toast.success(`${inseridos} peças e acessórios incluídos automaticamente no estoque!`);
          qc.invalidateQueries({ queryKey: ["produtos"] });
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
