CREATE OR REPLACE FUNCTION public.sincronizar_saldo_pagamento_compra()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.conta_bancaria IS NOT NULL AND NEW.conta_bancaria <> '' THEN
      PERFORM public.aplicar_delta_bancario(NEW.conta_bancaria, -COALESCE(NEW.valor, 0));
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.conta_bancaria IS NOT NULL AND OLD.conta_bancaria <> '' THEN
      PERFORM public.aplicar_delta_bancario(OLD.conta_bancaria, COALESCE(OLD.valor, 0));
    END IF;
    IF NEW.conta_bancaria IS NOT NULL AND NEW.conta_bancaria <> '' THEN
      PERFORM public.aplicar_delta_bancario(NEW.conta_bancaria, -COALESCE(NEW.valor, 0));
    END IF;
    RETURN NEW;
  ELSE
    IF OLD.conta_bancaria IS NOT NULL AND OLD.conta_bancaria <> '' THEN
      PERFORM public.aplicar_delta_bancario(OLD.conta_bancaria, COALESCE(OLD.valor, 0));
    END IF;
    RETURN OLD;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_saldo_pagamento_compra ON public.ordem_compra_pagamentos;
CREATE TRIGGER trg_saldo_pagamento_compra
AFTER INSERT OR UPDATE OR DELETE ON public.ordem_compra_pagamentos
FOR EACH ROW EXECUTE FUNCTION public.sincronizar_saldo_pagamento_compra();