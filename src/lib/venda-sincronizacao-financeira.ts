import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/erp";

export interface SincronizarBaixaParams {
  contaId: string;
  valorPago: number;
  dataPagamento: string;
  modo: "quitar" | "saldo";
  contaBancaria: string;
  comprovantePath: string | null;
  uid?: string | null;
}

/**
 * Identifica a forma de pagamento com base na descrição e campos do título.
 */
function identificarFormaPagamento(descricao: string = ""): string {
  const d = descricao.toLowerCase();
  if (d.includes("crédito") || d.includes("credito")) return "Cartão de Crédito";
  if (d.includes("débito") || d.includes("debito")) return "Cartão de Débito";
  if (d.includes("concessionária") || d.includes("concessionaria")) return "Concessionária";
  if (d.includes("antecipação") || d.includes("antecipacao")) return "Antecipação";
  if (d.includes("boleto")) return "Boleto Bancário";
  if (d.includes("pix")) return "Pix";
  if (d.includes("cheque")) return "Cheque";
  if (d.includes("transferência") || d.includes("ted") || d.includes("doc")) return "Transferência";
  return "Baixa de Título";
}

/**
 * Localiza a venda associada a uma conta (por venda_id, obra_id ou descrição).
 */
async function localizarVendaId(conta: {
  id: string;
  venda_id?: string | null;
  obra_id?: string | null;
  descricao?: string | null;
}): Promise<string | null> {
  if (conta.venda_id) return conta.venda_id;

  // 1. Tenta buscar por obra_id
  if (conta.obra_id) {
    const { data: obra } = await supabase
      .from("obras")
      .select("venda_id")
      .eq("id", conta.obra_id)
      .maybeSingle();
    if (obra?.venda_id) return obra.venda_id;
  }

  // 2. Tenta extrair número do pedido da descrição (ex: "Pedido VEN-027" ou "Pedido 27")
  if (conta.descricao) {
    const matchVen = conta.descricao.match(/Pedido\s+(VEN-?\d+|\d+)/i);
    if (matchVen && matchVen[1]) {
      const numBuscado = matchVen[1].trim();
      const { data: v } = await supabase
        .from("vendas")
        .select("id")
        .or(`numero.eq.${numBuscado},numero.eq.VEN-${numBuscado}`)
        .limit(1)
        .maybeSingle();
      if (v?.id) return v.id;
    }
  }

  return null;
}

/**
 * Baixa bidirecional: Ao quitar ou baixar um título em Contas a Pagar/Receber,
 * atualiza atomicamente o pedido de venda correspondente, o extrato da obra/projeto
 * e o saldo devedor com as retenções financeiras.
 */
export async function sincronizarBaixaContaNaVenda({
  contaId,
  valorPago,
  dataPagamento,
  modo,
  contaBancaria,
  comprovantePath,
  uid,
}: SincronizarBaixaParams) {
  const { data: conta, error: errConta } = await supabase
    .from("contas")
    .select("*")
    .eq("id", contaId)
    .single();

  if (errConta || !conta) return;

  const totalTitulo = Number(conta.valor) + Number(conta.valor_juros ?? 0);
  const diferenca = Number((totalTitulo - valorPago).toFixed(2));

  // =========================================================================
  // CASO 1: CONTA A RECEBER (TÍTULO DE VENDA / CLIENTE)
  // =========================================================================
  if (conta.tipo === "receber") {
    const vendaId = await localizarVendaId(conta);

    if (vendaId) {
      // Valor cobrado do cliente x valor líquido entrado na empresa
      let valorOrigem = totalTitulo;
      let retencao = 0;

      if (modo === "quitar") {
        valorOrigem = totalTitulo;
        retencao = Math.max(diferenca, 0);
      } else {
        // modo === "saldo" (pagamento parcial, resto vira novo título)
        valorOrigem = valorPago;
        retencao = 0;
      }

      const forma = identificarFormaPagamento(conta.descricao);
      const tagOrigemConta = `[conta_id:${conta.id}]`;
      const obsPag = `Baixa do título: ${conta.descricao ?? ""}${
        retencao > 0 ? ` | Retenção/Taxa: ${brl(retencao)}` : ""
      } ${tagOrigemConta}`;

      // 1. Registra o pagamento na tabela venda_pagamentos
      const { error: errPag } = await supabase.from("venda_pagamentos").insert({
        venda_id: vendaId,
        data_pagamento: dataPagamento,
        forma_pagamento: forma,
        valor: valorPago, // Entrada líquida no caixa/banco da empresa
        valor_origem: valorOrigem, // Valor bruto original que abate do saldo do cliente
        retencao_financeira: retencao, // Taxa ou desconto de antecipação/concessionária
        conta_bancaria: contaBancaria || null,
        observacoes: obsPag,
        comprovante_path: comprovantePath,
        created_by: uid ?? null,
      } as never);

      if (errPag) console.error("Erro ao registrar venda_pagamentos na baixa:", errPag);

      // 2. Busca obra vinculada para atualizar o extrato do projeto
      let obraId = conta.obra_id;
      if (!obraId) {
        const { data: ob } = await supabase
          .from("obras")
          .select("id")
          .eq("venda_id", vendaId)
          .limit(1)
          .maybeSingle();
        obraId = ob?.id ?? null;
      }

      // 3. Atualiza o Extrato da Obra / Projeto (tabela venda_historico)
      // 3a. Entrada Líquida
      await supabase.from("venda_historico").insert({
        venda_id: vendaId,
        cliente_id: conta.cliente_id ?? null,
        obra_id: obraId,
        data: dataPagamento,
        tipo: "financeiro",
        descricao: `Recebimento: ${conta.descricao ?? "Título a receber"} (Líquido: ${brl(
          valorPago,
        )}${retencao > 0 ? ` + Taxa: ${brl(retencao)}` : ""})`,
        natureza: "entrada",
        valor: valorPago,
        observacoes: `Baixa via Contas a Receber${
          contaBancaria ? ` na conta ${contaBancaria}` : ""
        } ${tagOrigemConta}`,
        created_by: uid ?? null,
      });

      // 3b. Despesa Financeira / Retenção (se houver desconto de taxa de cartão/antecipação)
      if (retencao > 0.009) {
        await supabase.from("venda_historico").insert({
          venda_id: vendaId,
          cliente_id: conta.cliente_id ?? null,
          obra_id: obraId,
          data: dataPagamento,
          tipo: "financeiro",
          descricao: `Despesa Financeira / Retenção: ${conta.descricao ?? "Taxa"}`,
          natureza: "saida",
          valor: retencao,
          observacoes: `Taxa ou desconto retido na baixa (${brl(retencao)}) ${tagOrigemConta}`,
          created_by: uid ?? null,
        });
      }

      // 4. Recalcula os totais do pedido de venda
      const { data: todosPags } = await supabase
        .from("venda_pagamentos")
        .select("valor, valor_origem")
        .eq("venda_id", vendaId);

      const totalPagoCliente = (todosPags ?? []).reduce(
        (s, p) => s + Number(p.valor_origem ?? p.valor ?? 0),
        0,
      );

      const { data: vInfo } = await supabase
        .from("vendas")
        .select("valor_total")
        .eq("id", vendaId)
        .maybeSingle();

      const totalVenda = Number(vInfo?.valor_total ?? 0);
      const novoSaldo = Math.max(Number((totalVenda - totalPagoCliente).toFixed(2)), 0);
      const novoStatus =
        totalPagoCliente <= 0 ? "pendente" : novoSaldo <= 0.005 ? "pago" : "parcial";

      await supabase
        .from("vendas")
        .update({
          valor_entrada: totalPagoCliente,
          saldo_devedor: novoSaldo,
          status_pagamento: novoStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", vendaId);

      // 5. Reconciliação dos títulos de saldo devedor em aberto
      const { data: titulosAbertos } = await supabase
        .from("contas")
        .select("id, descricao, valor")
        .eq("venda_id", vendaId)
        .eq("tipo", "receber")
        .eq("status", "aberto");

      for (const t of titulosAbertos ?? []) {
        if (t.id === contaId) continue;
        const d = (t.descricao ?? "").toLowerCase();
        if (d.includes("saldo a receber") || d.includes("saldo devedor")) {
          if (novoSaldo <= 0.005) {
            // Se o pedido foi totalmente quitado, encerra o título de saldo restante
            await supabase.from("contas").delete().eq("id", t.id);
          } else {
            // Atualiza o título de saldo restante com o valor real recalculado
            await supabase.from("contas").update({ valor: novoSaldo }).eq("id", t.id);
          }
        }
      }
    }
  }

  // =========================================================================
  // CASO 2: CONTA A PAGAR (DESPESA VINCULADA À OBRA OU VENDA)
  // =========================================================================
  if (conta.tipo === "pagar" && (conta.obra_id || conta.venda_id)) {
    const tagOrigemConta = `[conta_id:${conta.id}]`;
    await supabase.from("venda_historico").insert({
      venda_id: conta.venda_id ?? null,
      cliente_id: conta.cliente_id ?? null,
      obra_id: conta.obra_id ?? null,
      data: dataPagamento,
      tipo: "financeiro",
      descricao: `Pagamento: ${conta.descricao} (${conta.categoria ?? "Despesa"})`,
      natureza: "saida",
      valor: valorPago,
      observacoes: `Baixa realizada no Contas a Pagar${
        contaBancaria ? ` na conta ${contaBancaria}` : ""
      } ${tagOrigemConta}`,
      created_by: uid ?? null,
    });
  }
}

/**
 * Reversão bidirecional: Ao desfazer a baixa de um título no Contas a Pagar/Receber,
 * estorna os lançamentos correspondentes em venda_pagamentos, venda_historico
 * e recalcula o saldo devedor da venda.
 */
export async function reverterBaixaContaNaVenda({ contaId }: { contaId: string }) {
  const { data: conta } = await supabase
    .from("contas")
    .select("*")
    .eq("id", contaId)
    .single();

  if (!conta) return;

  const tagOrigemConta = `[conta_id:${conta.id}]`;

  // 1. Remove registros em venda_historico gerados por esta baixa
  await supabase
    .from("venda_historico")
    .delete()
    .ilike("observacoes", `%${tagOrigemConta}%`);

  // Se a conta for a receber e tiver venda associada
  const vendaId = await localizarVendaId(conta);
  if (vendaId) {
    // 2. Remove o pagamento correspondente em venda_pagamentos
    await supabase
      .from("venda_pagamentos")
      .delete()
      .eq("venda_id", vendaId)
      .ilike("observacoes", `%${tagOrigemConta}%`);

    // 3. Recalcula os totais do pedido de venda
    const { data: todosPags } = await supabase
      .from("venda_pagamentos")
      .select("valor, valor_origem")
      .eq("venda_id", vendaId);

    const totalPagoCliente = (todosPags ?? []).reduce(
      (s, p) => s + Number(p.valor_origem ?? p.valor ?? 0),
      0,
    );

    const { data: vInfo } = await supabase
      .from("vendas")
      .select("valor_total")
      .eq("id", vendaId)
      .maybeSingle();

    const totalVenda = Number(vInfo?.valor_total ?? 0);
    const novoSaldo = Math.max(Number((totalVenda - totalPagoCliente).toFixed(2)), 0);
    const novoStatus =
      totalPagoCliente <= 0 ? "pendente" : novoSaldo <= 0.005 ? "pago" : "parcial";

    await supabase
      .from("vendas")
      .update({
        valor_entrada: totalPagoCliente,
        saldo_devedor: novoSaldo,
        status_pagamento: novoStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", vendaId);
  }
}
