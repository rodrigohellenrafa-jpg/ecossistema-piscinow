CREATE OR REPLACE FUNCTION public.sincronizar_saldo_pagamento_compra() RETURNS trigger AS $$
DECLARE
  v_ordem_id uuid;
  v_total numeric := 0;
  v_valor_ordem numeric := 0;
  v_ultima_conta text;
  v_ultima_data date;
  v_status_atual text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.aplicar_delta_bancario(NEW.conta_bancaria, -coalesce(NEW.valor, 0));
    v_ordem_id := NEW.ordem_id;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.aplicar_delta_bancario(OLD.conta_bancaria, coalesce(OLD.valor, 0));
    PERFORM public.aplicar_delta_bancario(NEW.conta_bancaria, -coalesce(NEW.valor, 0));
    v_ordem_id := NEW.ordem_id;
  ELSE
    PERFORM public.aplicar_delta_bancario(OLD.conta_bancaria, coalesce(OLD.valor, 0));
    v_ordem_id := OLD.ordem_id;
  END IF;

  SELECT coalesce(sum(valor), 0) INTO v_total
  FROM public.ordem_compra_pagamentos
  WHERE ordem_id = v_ordem_id;

  SELECT data_pagamento INTO v_ultima_data
  FROM public.ordem_compra_pagamentos
  WHERE ordem_id = v_ordem_id
  ORDER BY data_pagamento DESC, created_at DESC
  LIMIT 1;

  -- última conta que realmente movimentou dinheiro (ignora financiamento direto ao fabricante)
  SELECT conta_bancaria INTO v_ultima_conta
  FROM public.ordem_compra_pagamentos
  WHERE ordem_id = v_ordem_id
    AND nullif(trim(coalesce(conta_bancaria, '')), '') IS NOT NULL
  ORDER BY data_pagamento DESC, created_at DESC
  LIMIT 1;

  SELECT valor_total, status INTO v_valor_ordem, v_status_atual
  FROM public.ordens_compra
  WHERE id = v_ordem_id;

  UPDATE public.ordens_compra
  SET valor_pago = v_total,
      status = CASE
        WHEN v_total > 0 AND status IN ('pendente', 'sob_encomenda', 'comprado') THEN 'comprado'
        WHEN v_total = 0 AND status = 'comprado' THEN 'pendente'
        ELSE status
      END
  WHERE id = v_ordem_id;

  UPDATE public.contas
  SET status = CASE
        WHEN v_total >= v_valor_ordem AND v_valor_ordem > 0 THEN 'pago'
        WHEN v_total > 0 THEN 'pago_parcial'
        ELSE 'aberto'
      END,
      valor_pago = v_total,
      valor_desconto = 0,
      data_pagamento = CASE WHEN v_total > 0 THEN v_ultima_data ELSE NULL END,
      conta_bancaria = CASE WHEN v_total > 0 THEN v_ultima_conta ELSE NULL END,
      saldo_gerenciado_externamente = true,
      updated_at = now()
  WHERE ordem_compra_id = v_ordem_id
    AND ordem_pagamento_id IS NULL;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;