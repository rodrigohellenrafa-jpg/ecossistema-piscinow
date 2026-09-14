CREATE OR REPLACE FUNCTION public.espelhar_pagamento_fluxo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
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
    'receita', 'Vendas',
    'Recebimento pedido ' || COALESCE(v_numero, '') || ' - ' || NEW.forma_pagamento,
    NEW.valor, NEW.data_pagamento, NEW.data_pagamento, NEW.data_pagamento,
    NEW.venda_id, NEW.conta_bancaria, NEW.forma_pagamento, 'Pago',
    false, 'pagamento:' || NEW.id::text, NEW.created_by
  );

  RETURN NEW;
END;
$fn$;

UPDATE public.lancamentos_financeiros SET tipo_fluxo = 'receita' WHERE tipo_fluxo IN ('entrada', 'Entrada', 'Receita');
UPDATE public.lancamentos_financeiros SET tipo_fluxo = 'despesa' WHERE tipo_fluxo IN ('saida', 'Saída', 'Despesa');
UPDATE public.lancamentos_financeiros SET status = 'Pago' WHERE status = 'pago';
UPDATE public.lancamentos_financeiros SET status = 'Pendente' WHERE status IN ('pendente', 'aberto');