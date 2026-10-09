-- Migration: Garantir que transações sancionadas por débito/crédito não lancem o valor bruto da venda no fluxo de caixa nem em contas a receber, registrando somente o valor recebido líquido.
-- O valor da venda entra apenas como informação no DRE.
-- Não cria entrada automática no fluxo de caixa até que a baixa seja processada manualmente.
-- Ao processar o recebimento, o valor cobrado substitui ou consolide o registro anterior sem gerar duplicidade.

CREATE OR REPLACE FUNCTION public.espelhar_pagamento_fluxo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_numero text;
  v_eh_cartao boolean;
  v_existente_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.lancamentos_financeiros
     WHERE venda_id = OLD.venda_id
       AND observacoes = 'pagamento:' || OLD.id::text;
    RETURN OLD;
  END IF;

  SELECT numero INTO v_numero FROM public.vendas WHERE id = NEW.venda_id;

  v_eh_cartao := (
    lower(COALESCE(NEW.forma_pagamento, '')) LIKE '%débito%' OR
    lower(COALESCE(NEW.forma_pagamento, '')) LIKE '%debito%' OR
    lower(COALESCE(NEW.forma_pagamento, '')) LIKE '%crédito%' OR
    lower(COALESCE(NEW.forma_pagamento, '')) LIKE '%credito%'
  );

  -- Se for débito ou crédito e estiver explicitamente marcado como aguardando baixa manual:
  -- Não cria entrada automática no fluxo de caixa até que a baixa seja processada manualmente!
  IF v_eh_cartao AND lower(COALESCE(NEW.observacoes, '')) LIKE '%aguardando baixa%' THEN
    RETURN NEW;
  END IF;

  -- 1. Se for UPDATE pelo mesmo pagamento:
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

  -- 2. Ao processar o recebimento, substitui ou consolida o registro anterior sem gerar duplicidade:
  SELECT id INTO v_existente_id
    FROM public.lancamentos_financeiros
   WHERE venda_id = NEW.venda_id
     AND categoria = 'Vendas'
   ORDER BY created_at ASC
   LIMIT 1;

  IF v_existente_id IS NOT NULL THEN
    UPDATE public.lancamentos_financeiros
       SET valor = NEW.valor,
           data_competencia = NEW.data_pagamento,
           data_pagamento = NEW.data_pagamento,
           forma_pagamento = NEW.forma_pagamento,
           conta_bancaria = COALESCE(NEW.conta_bancaria, conta_bancaria),
           status = 'Pago',
           observacoes = 'pagamento:' || NEW.id::text,
           updated_at = now()
     WHERE id = v_existente_id;

    -- Remove duplicidades extras para a mesma venda
    DELETE FROM public.lancamentos_financeiros
     WHERE venda_id = NEW.venda_id
       AND categoria = 'Vendas'
       AND id <> v_existente_id;

    RETURN NEW;
  END IF;

  -- 3. Inserção normal quando não existe lançamento prévio
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

CREATE OR REPLACE FUNCTION public.baixar_titulos_venda_quitada()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid := COALESCE(NEW.venda_id, OLD.venda_id);
  v_saldo numeric;
  v_data date;
  v_conta text;
  v_forma text;
  v_valor_liq numeric;
BEGIN
  SELECT saldo_devedor INTO v_saldo FROM public.vendas WHERE id = v_id;
  IF v_saldo IS NULL OR v_saldo > 0.005 THEN RETURN COALESCE(NEW, OLD); END IF;

  SELECT data_pagamento, conta_bancaria, forma_pagamento, valor
    INTO v_data, v_conta, v_forma, v_valor_liq
    FROM public.venda_pagamentos
   WHERE venda_id = v_id
   ORDER BY data_pagamento DESC, created_at DESC
   LIMIT 1;

  -- Se a transação foi sancionada por débito ou crédito:
  -- O valor bruto de venda NÃO entra em contas a receber nem no fluxo de caixa: entra somente o valor recebido líquido!
  IF lower(COALESCE(v_forma, '')) LIKE '%débito%' OR lower(COALESCE(v_forma, '')) LIKE '%debito%'
     OR lower(COALESCE(v_forma, '')) LIKE '%crédito%' OR lower(COALESCE(v_forma, '')) LIKE '%credito%' THEN
    -- Atualiza qualquer título em contas a receber da venda para refletir SOMENTE o valor recebido líquido
    UPDATE public.contas
       SET valor = COALESCE(v_valor_liq, valor),
           valor_pago = COALESCE(v_valor_liq, valor),
           status = 'pago',
           data_pagamento = COALESCE(v_data, CURRENT_DATE),
           conta_bancaria = COALESCE(conta_bancaria, v_conta),
           saldo_gerenciado_externamente = true,
           observacoes = concat_ws(' | ', observacoes, 'Liquidado no débito/crédito - somente valor recebido entra no caixa')
     WHERE venda_id = v_id AND tipo = 'receber';
  ELSE
    UPDATE public.contas
       SET status = 'pago',
           valor_pago = valor,
           data_pagamento = COALESCE(v_data, CURRENT_DATE),
           conta_bancaria = COALESCE(conta_bancaria, v_conta),
           saldo_gerenciado_externamente = true,
           observacoes = concat_ws(' | ', observacoes, 'Baixado pelo pagamento registrado na venda')
     WHERE venda_id = v_id AND tipo = 'receber'
       AND lower(status) NOT IN ('pago', 'cancelado');
  END IF;

  RETURN COALESCE(NEW, OLD);
END $$;

-- Ajuste pontual da Venda 27:
-- Valor de venda = R$ 460,00 (para DRE)
-- Valor recebido = R$ 450,85 (para Fluxo de Caixa e Contas a Receber)
-- O valor de venda (R$ 460,00) não entra em contas a receber/fluxo de caixa, somente o valor recebido (R$ 450,85).
DO $$
DECLARE
  v_venda_id uuid;
  v_primeiro_pag_id uuid;
  v_primeira_conta_id uuid;
BEGIN
  SELECT id INTO v_venda_id
    FROM public.vendas
   WHERE numero IN ('27', '0027')
   LIMIT 1;

  IF v_venda_id IS NOT NULL THEN
    -- 1. Garante os valores no cabeçalho da Venda 27
    UPDATE public.vendas
       SET valor_total = 460.00,
           valor_entrada = 460.00,
           saldo_devedor = 0.00,
           status_pagamento = 'pago',
           updated_at = now()
     WHERE id = v_venda_id;

    -- 2. Seleciona o pagamento principal
    SELECT id INTO v_primeiro_pag_id
      FROM public.venda_pagamentos
     WHERE venda_id = v_venda_id
     ORDER BY created_at ASC, id ASC
     LIMIT 1;

    IF v_primeiro_pag_id IS NOT NULL THEN
      -- Atualiza o pagamento: origem R$ 460,00 (venda) e valor R$ 450,85 (recebido líquido no caixa)
      UPDATE public.venda_pagamentos
         SET valor_origem = 460.00,
             valor = 450.85,
             retencao_financeira = 9.15,
             forma_pagamento = 'Cartão de Débito',
             observacoes = 'Venda de peças: R$ 460,00 débito (líquido concessionária R$ 450,85)',
             updated_at = now()
       WHERE id = v_primeiro_pag_id;

      -- Remove qualquer pagamento duplicado adicional
      DELETE FROM public.venda_pagamentos
       WHERE venda_id = v_venda_id
         AND id <> v_primeiro_pag_id;
    END IF;

    -- 3. Fluxo de Caixa (lancamentos_financeiros): SOMENTE o valor recebido R$ 450,85 consolidado
    IF v_primeiro_pag_id IS NOT NULL THEN
      UPDATE public.lancamentos_financeiros
         SET valor = 450.85,
             forma_pagamento = 'Cartão de Débito',
             updated_at = now()
       WHERE venda_id = v_venda_id
         AND observacoes = 'pagamento:' || v_primeiro_pag_id::text;

      -- Remove qualquer lançamento financeiro duplicado para a venda 27
      DELETE FROM public.lancamentos_financeiros
       WHERE venda_id = v_venda_id
         AND observacoes <> 'pagamento:' || v_primeiro_pag_id::text;
    END IF;

    -- 4. Contas a Receber (contas): SOMENTE o valor recebido R$ 450,85 (o valor de venda R$ 460 não duplica)
    SELECT id INTO v_primeira_conta_id
      FROM public.contas
     WHERE venda_id = v_venda_id AND tipo = 'receber'
     ORDER BY created_at ASC, id ASC
     LIMIT 1;

    IF v_primeira_conta_id IS NOT NULL THEN
      UPDATE public.contas
         SET valor = 450.85,
             valor_pago = 450.85,
             status = 'pago',
             data_pagamento = COALESCE(data_pagamento, CURRENT_DATE),
             saldo_gerenciado_externamente = true,
             observacoes = 'Venda 27 peças: liquidado no débito. Valor de venda R$ 460 (DRE), valor recebido R$ 450,85 (caixa)'
       WHERE id = v_primeira_conta_id;

      -- Remove títulos excedentes em contas a receber vinculados à venda 27
      DELETE FROM public.contas
       WHERE venda_id = v_venda_id AND tipo = 'receber'
         AND id <> v_primeira_conta_id;
    END IF;
  END IF;
END $$;
