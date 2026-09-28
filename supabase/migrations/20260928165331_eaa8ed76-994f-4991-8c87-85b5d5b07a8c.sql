CREATE OR REPLACE FUNCTION public.baixar_titulos_venda_quitada()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_id uuid := COALESCE(NEW.venda_id, OLD.venda_id);
  v_saldo numeric;
  v_data date;
  v_conta text;
BEGIN
  SELECT saldo_devedor INTO v_saldo FROM public.vendas WHERE id = v_id;
  IF v_saldo IS NULL OR v_saldo > 0.005 THEN RETURN COALESCE(NEW, OLD); END IF;
  SELECT data_pagamento, conta_bancaria INTO v_data, v_conta
    FROM public.venda_pagamentos WHERE venda_id = v_id
    ORDER BY data_pagamento DESC, created_at DESC LIMIT 1;
  -- Venda quitada: títulos a receber em aberto são baixados sem mexer no saldo
  -- (o dinheiro já entrou pelo pagamento da venda).
  UPDATE public.contas
     SET status = 'pago', valor_pago = valor,
         data_pagamento = COALESCE(v_data, CURRENT_DATE),
         conta_bancaria = COALESCE(conta_bancaria, v_conta),
         saldo_gerenciado_externamente = true,
         observacoes = concat_ws(' | ', observacoes, 'Baixado pelo pagamento registrado na venda')
   WHERE venda_id = v_id AND tipo = 'receber'
     AND lower(status) NOT IN ('pago','cancelado');
  RETURN COALESCE(NEW, OLD);
END $$;

CREATE TRIGGER trg_venda_pagamentos_zbaixa_titulos
AFTER INSERT OR UPDATE OR DELETE ON public.venda_pagamentos
FOR EACH ROW EXECUTE FUNCTION public.baixar_titulos_venda_quitada();

CREATE OR REPLACE FUNCTION public.bloquear_baixa_venda_quitada()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_saldo numeric;
BEGIN
  IF NEW.tipo = 'receber' AND NEW.venda_id IS NOT NULL
     AND NOT COALESCE(NEW.saldo_gerenciado_externamente, false)
     AND lower(NEW.status) IN ('pago','pago_parcial')
     AND (TG_OP = 'INSERT' OR lower(COALESCE(OLD.status,'')) NOT IN ('pago','pago_parcial')) THEN
    SELECT saldo_devedor INTO v_saldo FROM public.vendas WHERE id = NEW.venda_id;
    IF v_saldo IS NOT NULL AND v_saldo <= 0.005
       AND EXISTS (SELECT 1 FROM public.venda_pagamentos WHERE venda_id = NEW.venda_id) THEN
      RAISE EXCEPTION 'Esta venda já está quitada pelos pagamentos registrados no pedido. A baixa não foi feita para não duplicar o recebimento.';
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_bloquear_baixa_venda_quitada
BEFORE INSERT OR UPDATE ON public.contas
FOR EACH ROW EXECUTE FUNCTION public.bloquear_baixa_venda_quitada();