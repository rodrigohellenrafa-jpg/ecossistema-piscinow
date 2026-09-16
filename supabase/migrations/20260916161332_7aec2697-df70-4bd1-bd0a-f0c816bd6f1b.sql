CREATE OR REPLACE FUNCTION public.espelhar_condicao_conta()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_numero text;
  v_cliente_id uuid;
  v_cliente_nome text;
  v_data date;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.contas WHERE condicao_id = OLD.id;
    RETURN OLD;
  END IF;

  SELECT numero, cliente_id, cliente_nome, data
    INTO v_numero, v_cliente_id, v_cliente_nome, v_data
    FROM public.vendas WHERE id = NEW.venda_id;

  IF NEW.pago OR COALESCE(NEW.valor, 0) <= 0 THEN
    DELETE FROM public.contas WHERE condicao_id = NEW.id;
    RETURN NEW;
  END IF;

  INSERT INTO public.contas (
    tipo, descricao, parceiro, cliente_id, categoria, valor, vencimento,
    status, observacoes, venda_id, condicao_id, created_by
  ) VALUES (
    'receber',
    'Pedido ' || COALESCE(v_numero, '') || ' - ' || COALESCE(NEW.forma_pagamento, 'A definir'),
    v_cliente_nome,
    v_cliente_id,
    'Vendas',
    NEW.valor,
    COALESCE(NEW.data_prevista, v_data, CURRENT_DATE),
    'pendente',
    CASE WHEN COALESCE(NEW.parcelas, 1) > 1
      THEN COALESCE(NEW.parcelas, 1)::text || 'x de ' || to_char(COALESCE(NEW.valor_parcela, 0), 'FM999999990.00')
      ELSE NEW.observacoes END,
    NEW.venda_id,
    NEW.id,
    NEW.created_by
  )
  ON CONFLICT (condicao_id) WHERE condicao_id IS NOT NULL DO UPDATE SET
    descricao = EXCLUDED.descricao,
    parceiro = EXCLUDED.parceiro,
    cliente_id = EXCLUDED.cliente_id,
    valor = EXCLUDED.valor,
    vencimento = EXCLUDED.vencimento,
    observacoes = EXCLUDED.observacoes,
    updated_at = now();

  RETURN NEW;
END;
$function$;