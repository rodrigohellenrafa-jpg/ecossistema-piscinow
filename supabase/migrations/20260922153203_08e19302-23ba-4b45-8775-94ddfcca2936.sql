CREATE OR REPLACE FUNCTION public.recalcular_status_venda()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_total numeric;
  v_liquidado numeric;
  v_recebido numeric;
  v_status text;
BEGIN
  v_id := COALESCE(NEW.venda_id, OLD.venda_id);

  SELECT valor_total INTO v_total FROM public.vendas WHERE id = v_id;
  IF v_total IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

  SELECT
    COALESCE(SUM(valor + COALESCE(retencao_financeira, 0)), 0),
    COALESCE(SUM(valor), 0)
  INTO v_liquidado, v_recebido
  FROM public.venda_pagamentos
  WHERE venda_id = v_id;

  IF v_liquidado <= 0 THEN
    v_status := 'pendente';
  ELSIF v_liquidado + 0.005 >= v_total THEN
    v_status := 'pago';
  ELSE
    v_status := 'parcial';
  END IF;

  UPDATE public.vendas
     SET valor_entrada = v_recebido,
         saldo_devedor = GREATEST(v_total - v_liquidado, 0),
         status_pagamento = v_status,
         updated_at = now()
   WHERE id = v_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DELETE FROM public.venda_historico
WHERE conta_id IN (
  SELECT id FROM public.contas
  WHERE condicao_id = '26df765c-d97f-4bb6-85e7-9246cbdc60ed'
);

UPDATE public.venda_condicoes
SET pago = true,
    updated_at = now()
WHERE id = '26df765c-d97f-4bb6-85e7-9246cbdc60ed'
  AND venda_id = '6d8cc8da-9a12-4db3-8bb3-ea2476cbb963';

UPDATE public.vendas
SET valor_entrada = 10056.00,
    saldo_devedor = 0,
    status_pagamento = 'pago',
    updated_at = now()
WHERE id = '6d8cc8da-9a12-4db3-8bb3-ea2476cbb963';