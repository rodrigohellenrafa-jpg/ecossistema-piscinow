CREATE OR REPLACE FUNCTION public.validar_conta_movimento_realizado() RETURNS trigger AS $$
DECLARE
  v_realizado boolean := false;
  v_conta text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.saldos_bancarios LIMIT 1) THEN
    RETURN NEW;
  END IF;

  v_conta := NEW.conta_bancaria;

  IF TG_TABLE_NAME IN ('venda_pagamentos', 'ordem_compra_pagamentos') THEN
    v_realizado := true;
  ELSIF TG_TABLE_NAME = 'contas' THEN
    v_realizado := lower(coalesce(NEW.status, '')) IN ('pago', 'pago_parcial');
  ELSIF TG_TABLE_NAME = 'lancamentos_financeiros' THEN
    v_realizado := lower(coalesce(NEW.status, '')) IN ('pago', 'pago_parcial');
  END IF;

  -- Financiamento bancário pago direto ao fabricante não passa pelo caixa: não exige conta
  IF v_realizado AND TG_TABLE_NAME = 'ordem_compra_pagamentos' THEN
    IF lower(coalesce(NEW.forma_pagamento, '')) LIKE 'financiamento%' THEN
      RETURN NEW;
    END IF;
  END IF;

  IF v_realizado AND nullif(trim(v_conta), '') IS NULL THEN
    RAISE EXCEPTION 'Escolha a conta bancária onde o dinheiro entrou ou saiu.';
  END IF;

  IF v_realizado AND NOT EXISTS (
    SELECT 1
    FROM public.saldos_bancarios
    WHERE lower(trim(conta)) = lower(trim(v_conta))
  ) THEN
    RAISE EXCEPTION 'Conta bancária não cadastrada: %.', v_conta;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;