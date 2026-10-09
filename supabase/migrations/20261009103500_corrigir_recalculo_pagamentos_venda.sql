-- Migration: Ajuste de recálculo de status e valores de venda considerando retenção de concessionária/maquininha
-- e correção de duplicidade na venda 27.

CREATE OR REPLACE FUNCTION public.recalcular_status_venda()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_total numeric;
  v_pago numeric;
  v_status text;
BEGIN
  v_id := COALESCE(NEW.venda_id, OLD.venda_id);

  SELECT valor_total INTO v_total FROM public.vendas WHERE id = v_id;
  IF v_total IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

  -- O valor que abate a dívida da venda é o valor de origem (bruto pago pelo cliente).
  -- O valor líquido após retenção vai para o caixa (lancamentos_financeiros).
  SELECT COALESCE(SUM(COALESCE(valor_origem, valor)), 0) INTO v_pago
    FROM public.venda_pagamentos
   WHERE venda_id = v_id;

  IF v_pago <= 0 THEN
    v_status := 'pendente';
  ELSIF v_pago + 0.005 >= v_total THEN
    v_status := 'pago';
  ELSE
    v_status := 'parcial';
  END IF;

  UPDATE public.vendas
     SET valor_entrada = v_pago,
         saldo_devedor = GREATEST(v_total - v_pago, 0),
         status_pagamento = v_status,
         updated_at = now()
   WHERE id = v_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Correção pontual da Venda 27 (ajusta o valor de R$ 910 duplicado para R$ 460 no débito com R$ 450,85 líquido no caixa)
DO $$
DECLARE
  v_venda_id uuid;
  v_primeiro_id uuid;
BEGIN
  SELECT id INTO v_venda_id
    FROM public.vendas
   WHERE numero IN ('27', '0027')
   LIMIT 1;

  IF v_venda_id IS NOT NULL THEN
    SELECT id INTO v_primeiro_id
      FROM public.venda_pagamentos
     WHERE venda_id = v_venda_id
     ORDER BY created_at ASC, id ASC
     LIMIT 1;

    IF v_primeiro_id IS NOT NULL THEN
      -- Atualiza o pagamento para R$ 460,00 de origem e R$ 450,85 líquido da concessionária
      UPDATE public.venda_pagamentos
         SET valor_origem = 460.00,
             valor = 450.85,
             retencao_financeira = 9.15,
             forma_pagamento = 'Cartão de Débito',
             observacoes = 'Pagamento no débito R$ 460,00 (líquido concessionária R$ 450,85)',
             updated_at = now()
       WHERE id = v_primeiro_id;

      -- Remove pagamentos em duplicidade da mesma venda que geraram a soma de R$ 910
      DELETE FROM public.venda_pagamentos
       WHERE venda_id = v_venda_id
         AND id <> v_primeiro_id;

      -- Quita a venda 27 no pedido
      UPDATE public.vendas
         SET valor_total = 460.00,
             valor_entrada = 460.00,
             saldo_devedor = 0.00,
             status_pagamento = 'pago',
             updated_at = now()
       WHERE id = v_venda_id;

      -- Atualiza o fluxo financeiro para R$ 450,85
      UPDATE public.lancamentos_financeiros
         SET valor = 450.85,
             forma_pagamento = 'Cartão de Débito',
             updated_at = now()
       WHERE venda_id = v_venda_id
         AND observacoes = 'pagamento:' || v_primeiro_id::text;

      -- Baixa títulos a receber pendentes da venda
      UPDATE public.contas
         SET status = 'pago',
             valor_pago = valor,
             data_pagamento = COALESCE(data_pagamento, CURRENT_DATE),
             saldo_gerenciado_externamente = true,
             observacoes = concat_ws(' | ', observacoes, 'Quitado pelo débito da venda 27')
       WHERE venda_id = v_venda_id
         AND tipo = 'receber'
         AND lower(status) NOT IN ('pago', 'cancelado');
    END IF;
  END IF;
END $$;
