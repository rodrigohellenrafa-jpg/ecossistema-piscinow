-- Migration: Limpeza de lançamentos duplicados de contas a receber para pedidos com receita já lançada
-- Equivalente ao comando:
-- DELETE FROM lancamentos WHERE origem = 'contas-a-receber' AND data >= '2026-10-01' AND pedido_id IN (SELECT pedido_id FROM lancamentos WHERE origem = 'receita-lançada')

-- 1. Remove duplicidades em public.lancamentos_financeiros onde a venda já possui a receita lançada
DELETE FROM public.lancamentos_financeiros
WHERE venda_id IS NOT NULL
  AND (COALESCE(data_competencia, data_pagamento) >= '2026-10-01')
  AND (
    categoria = 'Contas a Receber'
    OR observacoes ILIKE '%contas-a-receber%'
    OR observacoes ILIKE '%baixa%'
    OR descricao ILIKE '%baixa de título%'
    OR observacoes NOT LIKE 'pagamento:%'
  )
  AND venda_id IN (
    SELECT venda_id
    FROM public.lancamentos_financeiros
    WHERE tipo_fluxo IN ('receita', 'entrada')
      AND (observacoes LIKE 'pagamento:%' OR categoria = 'Vendas' OR descricao ILIKE 'Recebimento pedido%')
      AND venda_id IS NOT NULL
  );

-- 2. Remove títulos concorrentes em public.contas (contas a receber) com vencimento a partir de 2026-10-01
-- cujos pedidos já possuem receita devidamente lançada e quitada no fluxo de caixa
DELETE FROM public.contas
WHERE tipo = 'receber'
  AND (COALESCE(vencimento, data_pagamento) >= '2026-10-01')
  AND venda_id IS NOT NULL
  AND venda_id IN (
    SELECT venda_id
    FROM public.lancamentos_financeiros
    WHERE tipo_fluxo IN ('receita', 'entrada')
      AND status = 'Pago'
      AND venda_id IS NOT NULL
  );
