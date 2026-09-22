CREATE OR REPLACE FUNCTION public.validar_conta_movimento_realizado()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

REVOKE ALL ON FUNCTION public.validar_conta_movimento_realizado() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_validar_conta_realizada ON public.venda_pagamentos;
CREATE TRIGGER trg_validar_conta_realizada
BEFORE INSERT OR UPDATE ON public.venda_pagamentos
FOR EACH ROW EXECUTE FUNCTION public.validar_conta_movimento_realizado();

DROP TRIGGER IF EXISTS trg_validar_conta_realizada ON public.ordem_compra_pagamentos;
CREATE TRIGGER trg_validar_conta_realizada
BEFORE INSERT OR UPDATE ON public.ordem_compra_pagamentos
FOR EACH ROW EXECUTE FUNCTION public.validar_conta_movimento_realizado();

DROP TRIGGER IF EXISTS trg_validar_conta_realizada ON public.contas;
CREATE TRIGGER trg_validar_conta_realizada
BEFORE INSERT OR UPDATE ON public.contas
FOR EACH ROW EXECUTE FUNCTION public.validar_conta_movimento_realizado();

DROP TRIGGER IF EXISTS trg_validar_conta_realizada ON public.lancamentos_financeiros;
CREATE TRIGGER trg_validar_conta_realizada
BEFORE INSERT OR UPDATE ON public.lancamentos_financeiros
FOR EACH ROW EXECUTE FUNCTION public.validar_conta_movimento_realizado();

UPDATE public.venda_pagamentos
SET conta_bancaria = 'RS COMERCIO DE PISCINAS'
WHERE id = 'e28d5a31-dd7e-41f9-96f6-c232b1321097'
  AND nullif(trim(conta_bancaria), '') IS NULL;