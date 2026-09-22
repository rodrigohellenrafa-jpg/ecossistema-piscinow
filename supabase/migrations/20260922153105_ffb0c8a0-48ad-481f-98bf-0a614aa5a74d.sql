ALTER TABLE public.venda_pagamentos
  ADD COLUMN IF NOT EXISTS valor_origem numeric(12,2),
  ADD COLUMN IF NOT EXISTS retencao_financeira numeric(12,2) NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.espelhar_lancamento_historico()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_cliente uuid;
  v_entrada boolean;
BEGIN
  v_cliente := NEW.cliente_id;
  IF v_cliente IS NULL AND NEW.venda_id IS NOT NULL THEN
    SELECT cliente_id INTO v_cliente FROM public.vendas WHERE id = NEW.venda_id;
  END IF;

  IF v_cliente IS NULL AND NEW.venda_id IS NULL AND NEW.obra_id IS NULL THEN
    DELETE FROM public.venda_historico WHERE lancamento_id = NEW.id;
    RETURN NEW;
  END IF;

  v_entrada := lower(COALESCE(NEW.tipo_fluxo, '')) IN ('entrada', 'receita');

  INSERT INTO public.venda_historico (
    lancamento_id, venda_id, cliente_id, obra_id, data, tipo, descricao, natureza, valor,
    recorrencia, observacoes, created_by
  ) VALUES (
    NEW.id, NEW.venda_id, v_cliente, NEW.obra_id,
    COALESCE(NEW.data_pagamento, NEW.vencimento, NEW.data_competencia),
    CASE WHEN v_entrada THEN 'recebimento' ELSE 'custo' END,
    NEW.descricao,
    CASE WHEN v_entrada THEN 'entrada' ELSE 'saida' END,
    COALESCE(NEW.valor, 0),
    COALESCE(NEW.recorrencia, 'nenhuma'),
    NULLIF(concat_ws(' | ', 'Lançamento financeiro', 'status: ' || NEW.status, NEW.observacoes), ''),
    NEW.created_by
  )
  ON CONFLICT (lancamento_id) WHERE lancamento_id IS NOT NULL DO UPDATE SET
    venda_id = EXCLUDED.venda_id,
    cliente_id = EXCLUDED.cliente_id,
    obra_id = EXCLUDED.obra_id,
    data = EXCLUDED.data,
    tipo = EXCLUDED.tipo,
    descricao = EXCLUDED.descricao,
    natureza = EXCLUDED.natureza,
    valor = EXCLUDED.valor,
    recorrencia = EXCLUDED.recorrencia,
    observacoes = EXCLUDED.observacoes,
    updated_at = now();

  RETURN NEW;
END;
$function$;

UPDATE public.venda_historico h
SET tipo = 'recebimento', natureza = 'entrada', updated_at = now()
FROM public.lancamentos_financeiros l
WHERE h.lancamento_id = l.id
  AND lower(COALESCE(l.tipo_fluxo, '')) IN ('entrada', 'receita')
  AND (h.tipo IS DISTINCT FROM 'recebimento' OR h.natureza IS DISTINCT FROM 'entrada');

UPDATE public.venda_pagamentos
SET valor_origem = 8298.00,
    retencao_financeira = 742.00,
    updated_at = now()
WHERE id = 'e28d5a31-dd7e-41f9-96f6-c232b1321097'
  AND venda_id = '6d8cc8da-9a12-4db3-8bb3-ea2476cbb963';

UPDATE public.venda_condicoes
SET acrescimo = 0,
    valor_cobrado = 8298.00,
    valor_parcela = 8298.00 / GREATEST(parcelas, 1),
    updated_at = now()
WHERE id = '26df765c-d97f-4bb6-85e7-9246cbdc60ed'
  AND venda_id = '6d8cc8da-9a12-4db3-8bb3-ea2476cbb963';