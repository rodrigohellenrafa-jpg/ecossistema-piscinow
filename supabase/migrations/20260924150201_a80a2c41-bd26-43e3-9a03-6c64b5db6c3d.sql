ALTER TABLE public.contas
ADD COLUMN IF NOT EXISTS saldo_gerenciado_externamente boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS idx_contas_ordem_principal
ON public.contas(ordem_compra_id)
WHERE ordem_compra_id IS NOT NULL AND ordem_pagamento_id IS NULL;

CREATE OR REPLACE FUNCTION public.sincronizar_saldo_movimento()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  anterior jsonb;
  atual jsonb;
  va numeric := 0;
  vn numeric := 0;
  ca text;
  cn text;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    anterior := to_jsonb(OLD);
    ca := anterior->>'conta_bancaria';
    IF NOT coalesce((anterior->>'saldo_gerenciado_externamente')::boolean, false)
       AND lower(anterior->>'status') IN ('pago','pago_parcial') THEN
      IF TG_TABLE_NAME = 'contas' THEN
        va := coalesce((anterior->>'valor_pago')::numeric, 0);
        IF va = 0 THEN
          va := greatest(0, (anterior->>'valor')::numeric
            + coalesce((anterior->>'valor_juros')::numeric, 0)
            - coalesce((anterior->>'valor_desconto')::numeric, 0));
        END IF;
        IF anterior->>'tipo' <> 'receber' THEN va := -va; END IF;
      ELSE
        va := (anterior->>'valor')::numeric;
        IF lower(anterior->>'tipo_fluxo') NOT IN ('receita','entrada') THEN va := -va; END IF;
      END IF;
    END IF;
  END IF;

  IF TG_OP <> 'DELETE' THEN
    atual := to_jsonb(NEW);
    cn := atual->>'conta_bancaria';
    IF NOT coalesce((atual->>'saldo_gerenciado_externamente')::boolean, false)
       AND lower(atual->>'status') IN ('pago','pago_parcial') THEN
      IF TG_TABLE_NAME = 'contas' THEN
        vn := coalesce((atual->>'valor_pago')::numeric, 0);
        IF vn = 0 THEN
          vn := greatest(0, (atual->>'valor')::numeric
            + coalesce((atual->>'valor_juros')::numeric, 0)
            - coalesce((atual->>'valor_desconto')::numeric, 0));
        END IF;
        IF atual->>'tipo' <> 'receber' THEN vn := -vn; END IF;
      ELSE
        vn := (atual->>'valor')::numeric;
        IF lower(atual->>'tipo_fluxo') NOT IN ('receita','entrada') THEN vn := -vn; END IF;
      END IF;
    END IF;
    IF lower(atual->>'status') IN ('pago','pago_parcial') AND NEW.data_pagamento IS NULL THEN
      NEW.data_pagamento := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
    END IF;
  END IF;

  IF lower(trim(coalesce(ca,''))) = lower(trim(coalesce(cn,''))) THEN
    PERFORM public.aplicar_delta_bancario(cn, vn - va);
  ELSE
    PERFORM public.aplicar_delta_bancario(ca, -va);
    PERFORM public.aplicar_delta_bancario(cn, vn);
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sincronizar_saldo_movimento() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.criar_titulo_ordem_compra()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.contas (
    tipo, descricao, parceiro, categoria, valor, vencimento, status,
    valor_pago, valor_desconto, ordem_compra_id, numero_documento,
    created_by, observacoes, saldo_gerenciado_externamente
  ) VALUES (
    'pagar',
    'Ordem de compra ' || coalesce(NEW.numero, '') || ' - ' || coalesce(NEW.fornecedor_nome, 'Fornecedor'),
    NEW.fornecedor_nome, 'Compras', NEW.valor_total, NEW.data_pedido, 'aberto',
    0, 0, NEW.id, NEW.numero, NEW.created_by,
    'Despesa criada automaticamente ao executar a ordem de compra', true
  )
  ON CONFLICT (ordem_compra_id) WHERE ordem_compra_id IS NOT NULL AND ordem_pagamento_id IS NULL
  DO UPDATE SET
    descricao = EXCLUDED.descricao,
    parceiro = EXCLUDED.parceiro,
    valor = EXCLUDED.valor,
    numero_documento = EXCLUDED.numero_documento,
    saldo_gerenciado_externamente = true,
    updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.criar_titulo_ordem_compra() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_criar_titulo_ordem_compra ON public.ordens_compra;
CREATE TRIGGER trg_criar_titulo_ordem_compra
AFTER INSERT ON public.ordens_compra
FOR EACH ROW EXECUTE FUNCTION public.criar_titulo_ordem_compra();

CREATE OR REPLACE FUNCTION public.atualizar_titulo_ordem_compra()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.contas
  SET descricao = 'Ordem de compra ' || coalesce(NEW.numero, '') || ' - ' || coalesce(NEW.fornecedor_nome, 'Fornecedor'),
      parceiro = NEW.fornecedor_nome,
      valor = NEW.valor_total,
      numero_documento = NEW.numero,
      saldo_gerenciado_externamente = true,
      updated_at = now()
  WHERE ordem_compra_id = NEW.id
    AND ordem_pagamento_id IS NULL;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.atualizar_titulo_ordem_compra() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_atualizar_titulo_ordem_compra ON public.ordens_compra;
CREATE TRIGGER trg_atualizar_titulo_ordem_compra
AFTER UPDATE OF numero, fornecedor_nome, valor_total ON public.ordens_compra
FOR EACH ROW EXECUTE FUNCTION public.atualizar_titulo_ordem_compra();

CREATE OR REPLACE FUNCTION public.sincronizar_saldo_pagamento_compra()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ordem_id uuid;
  v_total numeric := 0;
  v_valor_ordem numeric := 0;
  v_ultima_conta text;
  v_ultima_data date;
  v_status_atual text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.aplicar_delta_bancario(NEW.conta_bancaria, -coalesce(NEW.valor, 0));
    v_ordem_id := NEW.ordem_id;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.aplicar_delta_bancario(OLD.conta_bancaria, coalesce(OLD.valor, 0));
    PERFORM public.aplicar_delta_bancario(NEW.conta_bancaria, -coalesce(NEW.valor, 0));
    v_ordem_id := NEW.ordem_id;
  ELSE
    PERFORM public.aplicar_delta_bancario(OLD.conta_bancaria, coalesce(OLD.valor, 0));
    v_ordem_id := OLD.ordem_id;
  END IF;

  SELECT coalesce(sum(valor), 0) INTO v_total
  FROM public.ordem_compra_pagamentos
  WHERE ordem_id = v_ordem_id;

  SELECT conta_bancaria, data_pagamento
  INTO v_ultima_conta, v_ultima_data
  FROM public.ordem_compra_pagamentos
  WHERE ordem_id = v_ordem_id
  ORDER BY data_pagamento DESC, created_at DESC
  LIMIT 1;

  SELECT valor_total, status INTO v_valor_ordem, v_status_atual
  FROM public.ordens_compra
  WHERE id = v_ordem_id;

  UPDATE public.ordens_compra
  SET valor_pago = v_total,
      status = CASE
        WHEN v_total > 0 AND status IN ('pendente', 'sob_encomenda', 'comprado') THEN 'comprado'
        WHEN v_total = 0 AND status = 'comprado' THEN 'pendente'
        ELSE status
      END
  WHERE id = v_ordem_id;

  UPDATE public.contas
  SET status = CASE
        WHEN v_total >= v_valor_ordem AND v_valor_ordem > 0 THEN 'pago'
        WHEN v_total > 0 THEN 'pago_parcial'
        ELSE 'aberto'
      END,
      valor_pago = v_total,
      valor_desconto = 0,
      data_pagamento = CASE WHEN v_total > 0 THEN v_ultima_data ELSE NULL END,
      conta_bancaria = CASE WHEN v_total > 0 THEN v_ultima_conta ELSE NULL END,
      saldo_gerenciado_externamente = true,
      updated_at = now()
  WHERE ordem_compra_id = v_ordem_id
    AND ordem_pagamento_id IS NULL;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sincronizar_saldo_pagamento_compra() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.sincronizar_baixa_conta_ordem()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existente numeric := 0;
  v_diferenca numeric := 0;
BEGIN
  IF pg_trigger_depth() > 1
     OR NEW.ordem_compra_id IS NULL
     OR NEW.ordem_pagamento_id IS NOT NULL
     OR NOT NEW.saldo_gerenciado_externamente THEN
    RETURN NEW;
  END IF;

  SELECT coalesce(sum(valor), 0) INTO v_existente
  FROM public.ordem_compra_pagamentos
  WHERE ordem_id = NEW.ordem_compra_id;

  IF NEW.status = 'aberto' AND coalesce(NEW.valor_pago, 0) = 0 AND v_existente > 0 THEN
    DELETE FROM public.ordem_compra_pagamentos WHERE ordem_id = NEW.ordem_compra_id;
    RETURN NEW;
  END IF;

  v_diferenca := coalesce(NEW.valor_pago, 0) - v_existente;
  IF NEW.status = 'pago' AND coalesce(NEW.valor_pago, 0) = 0 THEN
    v_diferenca := greatest(0, NEW.valor + coalesce(NEW.valor_juros, 0) - coalesce(NEW.valor_desconto, 0)) - v_existente;
  END IF;

  IF v_diferenca > 0.009 THEN
    IF nullif(trim(NEW.conta_bancaria), '') IS NULL THEN
      RAISE EXCEPTION 'Escolha a conta de onde o dinheiro saiu.';
    END IF;
    INSERT INTO public.ordem_compra_pagamentos (
      ordem_id, data_pagamento, forma_pagamento, conta_bancaria,
      valor, observacoes, created_by
    ) VALUES (
      NEW.ordem_compra_id, coalesce(NEW.data_pagamento, current_date),
      'Baixa em Contas a Pagar', NEW.conta_bancaria,
      v_diferenca, 'Pagamento registrado por Contas a Pagar', NEW.created_by
    );
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sincronizar_baixa_conta_ordem() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_sincronizar_baixa_conta_ordem ON public.contas;
CREATE TRIGGER trg_sincronizar_baixa_conta_ordem
AFTER UPDATE OF status, valor_pago, data_pagamento, conta_bancaria ON public.contas
FOR EACH ROW EXECUTE FUNCTION public.sincronizar_baixa_conta_ordem();

ALTER TABLE public.contas DISABLE TRIGGER trg_saldo_movimento;

INSERT INTO public.contas (
  tipo, descricao, parceiro, categoria, valor, vencimento, status,
  data_pagamento, valor_pago, valor_desconto, conta_bancaria,
  ordem_compra_id, numero_documento, created_by, observacoes,
  saldo_gerenciado_externamente
)
SELECT
  'pagar',
  'Ordem de compra ' || coalesce(o.numero, '') || ' - ' || coalesce(o.fornecedor_nome, 'Fornecedor'),
  o.fornecedor_nome, 'Compras', o.valor_total, o.data_pedido,
  CASE
    WHEN coalesce(p.total_pago, 0) >= o.valor_total AND o.valor_total > 0 THEN 'pago'
    WHEN coalesce(p.total_pago, 0) > 0 THEN 'pago_parcial'
    ELSE 'aberto'
  END,
  p.ultima_data, coalesce(p.total_pago, 0), 0, p.ultima_conta,
  o.id, o.numero, o.created_by,
  'Despesa criada automaticamente pela ordem de compra', true
FROM public.ordens_compra o
LEFT JOIN LATERAL (
  SELECT sum(op.valor) AS total_pago,
         (array_agg(op.data_pagamento ORDER BY op.data_pagamento DESC, op.created_at DESC))[1] AS ultima_data,
         (array_agg(op.conta_bancaria ORDER BY op.data_pagamento DESC, op.created_at DESC))[1] AS ultima_conta
  FROM public.ordem_compra_pagamentos op
  WHERE op.ordem_id = o.id
) p ON true
WHERE NOT EXISTS (
  SELECT 1 FROM public.contas c
  WHERE c.ordem_compra_id = o.id AND c.ordem_pagamento_id IS NULL
);

UPDATE public.contas c
SET saldo_gerenciado_externamente = true,
    valor = o.valor_total,
    valor_pago = coalesce(p.total_pago, 0),
    status = CASE
      WHEN coalesce(p.total_pago, 0) >= o.valor_total AND o.valor_total > 0 THEN 'pago'
      WHEN coalesce(p.total_pago, 0) > 0 THEN 'pago_parcial'
      ELSE 'aberto'
    END,
    data_pagamento = p.ultima_data,
    conta_bancaria = p.ultima_conta,
    updated_at = now()
FROM public.ordens_compra o
LEFT JOIN LATERAL (
  SELECT sum(op.valor) AS total_pago,
         (array_agg(op.data_pagamento ORDER BY op.data_pagamento DESC, op.created_at DESC))[1] AS ultima_data,
         (array_agg(op.conta_bancaria ORDER BY op.data_pagamento DESC, op.created_at DESC))[1] AS ultima_conta
  FROM public.ordem_compra_pagamentos op
  WHERE op.ordem_id = o.id
) p ON true
WHERE c.ordem_compra_id = o.id
  AND c.ordem_pagamento_id IS NULL;

DELETE FROM public.contas WHERE ordem_pagamento_id IS NOT NULL;

ALTER TABLE public.contas ENABLE TRIGGER trg_saldo_movimento;