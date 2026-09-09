CREATE TABLE public.venda_pagamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id uuid NOT NULL REFERENCES public.vendas(id) ON DELETE CASCADE,
  data_pagamento date NOT NULL DEFAULT current_date,
  forma_pagamento text NOT NULL,
  valor numeric NOT NULL CHECK (valor > 0),
  conta_bancaria text,
  observacoes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.venda_pagamentos TO authenticated;
GRANT ALL ON public.venda_pagamentos TO service_role;

ALTER TABLE public.venda_pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados gerenciam pagamentos"
ON public.venda_pagamentos FOR ALL TO authenticated
USING (true) WITH CHECK (true);

CREATE TRIGGER trg_venda_pagamentos_updated
BEFORE UPDATE ON public.venda_pagamentos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_venda_pagamentos_venda ON public.venda_pagamentos(venda_id);

-- Recalcula saldo e status da venda a partir da soma das transacoes
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

  SELECT COALESCE(SUM(valor), 0) INTO v_pago FROM public.venda_pagamentos WHERE venda_id = v_id;

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

CREATE TRIGGER trg_venda_pagamentos_status
AFTER INSERT OR UPDATE OR DELETE ON public.venda_pagamentos
FOR EACH ROW EXECUTE FUNCTION public.recalcular_status_venda();

-- Espelha cada pagamento no fluxo de caixa (lancamentos_financeiros)
CREATE OR REPLACE FUNCTION public.espelhar_pagamento_fluxo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_numero text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.lancamentos_financeiros
     WHERE venda_id = OLD.venda_id
       AND observacoes = 'pagamento:' || OLD.id::text;
    RETURN OLD;
  END IF;

  SELECT numero INTO v_numero FROM public.vendas WHERE id = NEW.venda_id;

  IF TG_OP = 'UPDATE' THEN
    UPDATE public.lancamentos_financeiros
       SET valor = NEW.valor,
           data_competencia = NEW.data_pagamento,
           data_pagamento = NEW.data_pagamento,
           forma_pagamento = NEW.forma_pagamento,
           conta_bancaria = NEW.conta_bancaria,
           updated_at = now()
     WHERE venda_id = NEW.venda_id
       AND observacoes = 'pagamento:' || NEW.id::text;
    IF FOUND THEN RETURN NEW; END IF;
  END IF;

  INSERT INTO public.lancamentos_financeiros (
    tipo_fluxo, categoria, descricao, valor, data_competencia, vencimento,
    data_pagamento, venda_id, conta_bancaria, forma_pagamento, status,
    conciliado, observacoes, created_by
  ) VALUES (
    'entrada', 'Vendas',
    'Recebimento pedido ' || COALESCE(v_numero, '') || ' - ' || NEW.forma_pagamento,
    NEW.valor, NEW.data_pagamento, NEW.data_pagamento, NEW.data_pagamento,
    NEW.venda_id, NEW.conta_bancaria, NEW.forma_pagamento, 'pago',
    false, 'pagamento:' || NEW.id::text, NEW.created_by
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_venda_pagamentos_fluxo
AFTER INSERT OR UPDATE OR DELETE ON public.venda_pagamentos
FOR EACH ROW EXECUTE FUNCTION public.espelhar_pagamento_fluxo();