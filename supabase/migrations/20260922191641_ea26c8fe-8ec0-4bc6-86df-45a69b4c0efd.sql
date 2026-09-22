ALTER TABLE public.contas ADD COLUMN IF NOT EXISTS ordem_pagamento_id uuid;
CREATE UNIQUE INDEX IF NOT EXISTS idx_contas_ordem_pagamento ON public.contas(ordem_pagamento_id) WHERE ordem_pagamento_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.sincronizar_saldo_pagamento_compra()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_num text;
  v_forn text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.contas WHERE ordem_pagamento_id = OLD.id;
    RETURN OLD;
  END IF;

  SELECT numero, fornecedor_nome INTO v_num, v_forn FROM public.ordens_compra WHERE id = NEW.ordem_id;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.contas (
      tipo, descricao, parceiro, categoria, valor, vencimento, status,
      data_pagamento, valor_pago, conta_bancaria, ordem_compra_id,
      numero_documento, ordem_pagamento_id, created_by, observacoes
    ) VALUES (
      'pagar',
      'Pagamento ' || coalesce(v_num, 'O.C.') || ' - ' || coalesce(v_forn, 'Fornecedor'),
      v_forn, 'Compras', NEW.valor, NEW.data_pagamento, 'pago',
      NEW.data_pagamento, NEW.valor, NEW.conta_bancaria, NEW.ordem_id,
      v_num, NEW.id, NEW.created_by, NEW.observacoes
    );
    RETURN NEW;
  END IF;

  UPDATE public.contas SET
    valor = NEW.valor,
    valor_pago = NEW.valor,
    vencimento = NEW.data_pagamento,
    data_pagamento = NEW.data_pagamento,
    conta_bancaria = NEW.conta_bancaria,
    observacoes = NEW.observacoes,
    updated_at = now()
  WHERE ordem_pagamento_id = NEW.id;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.sincronizar_saldo_pagamento_compra() FROM PUBLIC, anon, authenticated;

-- espelhar o pagamento ja existente sem mexer no saldo atual
ALTER TABLE public.contas DISABLE TRIGGER trg_saldo_movimento;
INSERT INTO public.contas (
  tipo, descricao, parceiro, categoria, valor, vencimento, status,
  data_pagamento, valor_pago, conta_bancaria, ordem_compra_id,
  numero_documento, ordem_pagamento_id, created_by, observacoes
)
SELECT 'pagar',
       'Pagamento ' || coalesce(o.numero,'O.C.') || ' - ' || coalesce(o.fornecedor_nome,'Fornecedor'),
       o.fornecedor_nome, 'Compras', p.valor, p.data_pagamento, 'pago',
       p.data_pagamento, p.valor, p.conta_bancaria, p.ordem_id,
       o.numero, p.id, p.created_by, p.observacoes
FROM public.ordem_compra_pagamentos p
JOIN public.ordens_compra o ON o.id = p.ordem_id
WHERE NOT EXISTS (SELECT 1 FROM public.contas c WHERE c.ordem_pagamento_id = p.id);
ALTER TABLE public.contas ENABLE TRIGGER trg_saldo_movimento;