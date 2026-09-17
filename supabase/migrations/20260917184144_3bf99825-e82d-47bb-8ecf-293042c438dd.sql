CREATE UNIQUE INDEX IF NOT EXISTS uq_vh_conta ON public.venda_historico(conta_id) WHERE conta_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_vh_lancamento ON public.venda_historico(lancamento_id) WHERE lancamento_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.espelhar_conta_historico()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cliente uuid;
BEGIN
  v_cliente := NEW.cliente_id;
  IF v_cliente IS NULL AND NEW.venda_id IS NOT NULL THEN
    SELECT cliente_id INTO v_cliente FROM public.vendas WHERE id = NEW.venda_id;
  END IF;

  IF v_cliente IS NULL AND NEW.venda_id IS NULL AND NEW.obra_id IS NULL THEN
    DELETE FROM public.venda_historico WHERE conta_id = NEW.id;
    RETURN NEW;
  END IF;

  INSERT INTO public.venda_historico (
    conta_id, venda_id, cliente_id, obra_id, data, tipo, descricao, natureza, valor,
    recorrencia, observacoes, created_by
  ) VALUES (
    NEW.id, NEW.venda_id, v_cliente, NEW.obra_id,
    COALESCE(NEW.data_pagamento, NEW.vencimento),
    CASE WHEN NEW.tipo = 'receber' THEN 'recebimento' ELSE 'custo' END,
    NEW.descricao,
    CASE WHEN NEW.tipo = 'receber' THEN 'entrada' ELSE 'saida' END,
    COALESCE(NEW.valor, 0),
    COALESCE(NEW.recorrencia, 'nenhuma'),
    NULLIF(concat_ws(' | ', 'Contas a ' || NEW.tipo, 'status: ' || NEW.status, NEW.observacoes), ''),
    NEW.created_by
  )
  ON CONFLICT (conta_id) WHERE conta_id IS NOT NULL DO UPDATE SET
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
$$;

REVOKE ALL ON FUNCTION public.espelhar_conta_historico() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.espelhar_conta_historico() TO service_role;

DROP TRIGGER IF EXISTS trg_espelhar_conta_historico ON public.contas;
CREATE TRIGGER trg_espelhar_conta_historico
AFTER INSERT OR UPDATE ON public.contas
FOR EACH ROW EXECUTE FUNCTION public.espelhar_conta_historico();

CREATE OR REPLACE FUNCTION public.espelhar_lancamento_historico()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cliente uuid;
BEGIN
  v_cliente := NEW.cliente_id;
  IF v_cliente IS NULL AND NEW.venda_id IS NOT NULL THEN
    SELECT cliente_id INTO v_cliente FROM public.vendas WHERE id = NEW.venda_id;
  END IF;

  IF v_cliente IS NULL AND NEW.venda_id IS NULL AND NEW.obra_id IS NULL THEN
    DELETE FROM public.venda_historico WHERE lancamento_id = NEW.id;
    RETURN NEW;
  END IF;

  INSERT INTO public.venda_historico (
    lancamento_id, venda_id, cliente_id, obra_id, data, tipo, descricao, natureza, valor,
    recorrencia, observacoes, created_by
  ) VALUES (
    NEW.id, NEW.venda_id, v_cliente, NEW.obra_id,
    COALESCE(NEW.data_pagamento, NEW.vencimento, NEW.data_competencia),
    CASE WHEN NEW.tipo_fluxo = 'entrada' THEN 'recebimento' ELSE 'custo' END,
    NEW.descricao,
    CASE WHEN NEW.tipo_fluxo = 'entrada' THEN 'entrada' ELSE 'saida' END,
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
$$;

REVOKE ALL ON FUNCTION public.espelhar_lancamento_historico() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.espelhar_lancamento_historico() TO service_role;

DROP TRIGGER IF EXISTS trg_espelhar_lancamento_historico ON public.lancamentos_financeiros;
CREATE TRIGGER trg_espelhar_lancamento_historico
AFTER INSERT OR UPDATE ON public.lancamentos_financeiros
FOR EACH ROW EXECUTE FUNCTION public.espelhar_lancamento_historico();

-- Backfill dos vínculos já existentes
UPDATE public.contas SET updated_at = now()
WHERE cliente_id IS NOT NULL OR venda_id IS NOT NULL OR obra_id IS NOT NULL;

UPDATE public.lancamentos_financeiros SET updated_at = now()
WHERE cliente_id IS NOT NULL OR venda_id IS NOT NULL OR obra_id IS NOT NULL;