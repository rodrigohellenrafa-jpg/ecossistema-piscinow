/**
 * Automação do fechamento de venda do Piscinow ERP.
 *
 * Gatilho: venda confirmada em /vendas/novo.
 * 1) Financeiro: entrada vira título recebido e o saldo vira parcelas a receber.
 * 2) Estoque: item com saldo -> baixa; item sem saldo -> ordem de compra
 *    automática no fornecedor padrão, marcada como "sob encomenda".
 */
import { supabase } from "@/integrations/supabase/client";
import { proximoCodigo } from "@/lib/erp";

export interface ItemVenda {
  produto_id: string | null;
  sku: string;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  custo_unitario: number;
}

export interface ContextoVenda {
  numero: string;
  data: string;
  clienteId: string;
  clienteNome: string | null;
  userId: string | null;
}

export interface ResultadoEstoque {
  baixados: number;
  encomendados: number;
  ordensCriadas: string[];
}

/** Lança entrada (à vista) e parcelas do saldo devedor em Contas a Receber. */
export async function provisionarFinanceiro(
  ctx: ContextoVenda,
  opts: { valorEntrada: number; saldoDevedor: number; parcelas: number; valorParcela: number },
) {
  const linhas: Record<string, unknown>[] = [];

  if (opts.valorEntrada > 0) {
    linhas.push({
      tipo: "receber",
      descricao: `Pedido ${ctx.numero} - Entrada`,
      valor: opts.valorEntrada,
      vencimento: ctx.data,
      status: "pago",
      data_pagamento: ctx.data,
      cliente_id: ctx.clienteId,
      categoria: "Vendas",
      parceiro: ctx.clienteNome,
      created_by: ctx.userId,
    });
  }

  if (opts.parcelas > 0 && opts.saldoDevedor > 0) {
    const base = new Date(`${ctx.data}T12:00:00`);
    for (let idx = 0; idx < opts.parcelas; idx++) {
      const venc = new Date(base);
      venc.setMonth(venc.getMonth() + idx + 1);
      linhas.push({
        tipo: "receber",
        descricao: `Pedido ${ctx.numero} - Parcela ${idx + 1}/${opts.parcelas}`,
        valor: opts.valorParcela,
        vencimento: venc.toISOString().slice(0, 10),
        status: "pendente",
        cliente_id: ctx.clienteId,
        categoria: "Vendas",
        parceiro: ctx.clienteNome,
        created_by: ctx.userId,
      });
    }
  }

  if (linhas.length === 0) return;
  const { error } = await supabase.from("contas").insert(linhas as never);
  if (error) throw error;
}

/**
 * Roteia cada item: baixa o que existe em estoque e encomenda o que falta.
 * Nunca bloqueia a venda.
 */
export async function rotearEstoque(
  ctx: ContextoVenda,
  itens: ItemVenda[],
): Promise<ResultadoEstoque> {
  const resultado: ResultadoEstoque = { baixados: 0, encomendados: 0, ordensCriadas: [] };
  const comProduto = itens.filter((i) => i.produto_id && i.quantidade > 0);
  if (comProduto.length === 0) return resultado;

  const ids = Array.from(new Set(comProduto.map((i) => i.produto_id as string)));
  const { data: produtos, error: erroProdutos } = await supabase
    .from("produtos")
    .select("id, nome, codigo, unidade, ncm, cst, estoque_atual, preco_custo, fornecedor_id")
    .in("id", ids);
  if (erroProdutos) throw erroProdutos;

  const saldo = new Map<string, number>();
  for (const p of produtos ?? []) saldo.set(p.id, Number(p.estoque_atual ?? 0));

  const movimentos: Record<string, unknown>[] = [];
  const faltas: { item: ItemVenda; falta: number }[] = [];

  for (const item of comProduto) {
    const pid = item.produto_id as string;
    const disponivel = Math.max(saldo.get(pid) ?? 0, 0);
    const baixa = Math.min(disponivel, item.quantidade);
    const falta = item.quantidade - baixa;

    if (baixa > 0) {
      saldo.set(pid, disponivel - baixa);
      movimentos.push({
        produto_id: pid,
        tipo: "saida",
        quantidade: baixa,
        origem: "venda",
        documento: ctx.numero,
        observacoes: falta > 0 ? "Baixa parcial - saldo restante sob encomenda" : null,
        created_by: ctx.userId,
      });
      resultado.baixados++;
    }
    if (falta > 0) {
      faltas.push({ item, falta });
      resultado.encomendados++;
    }
  }

  if (movimentos.length > 0) {
    const { error } = await supabase.from("estoque_movimentos").insert(movimentos as never);
    if (error) throw error;
  }

  // Itens sem saldo NÃO geram ordem de compra automática.
  // A falta aparece como demanda em "Ordem de compra", e a O.C. só é criada
  // quando o usuário seleciona os itens e clica em "Executar ordem".
  return resultado;
}
