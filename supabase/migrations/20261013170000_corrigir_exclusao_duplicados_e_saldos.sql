-- Migration: Correção da exclusão permanente de lançamentos e títulos duplicados com atualização imediata de saldo
-- 1. Remove restrição de chave estrangeira rígida em venda_historico para permitir exclusão limpa
ALTER TABLE public.venda_historico
  DROP CONSTRAINT IF EXISTS venda_historico_lancamento_id_fkey,
  DROP CONSTRAINT IF EXISTS venda_historico_conta_id_fkey;

ALTER TABLE public.venda_historico
  ADD CONSTRAINT venda_historico_lancamento_id_fkey
    FOREIGN KEY (lancamento_id) REFERENCES public.lancamentos_financeiros(id) ON DELETE SET NULL,
  ADD CONSTRAINT venda_historico_conta_id_fkey
    FOREIGN KEY (conta_id) REFERENCES public.contas(id) ON DELETE SET NULL;

-- 2. Atualiza aplicar_delta_bancario para não abortar exclusões caso a conta bancária tenha variação de nome ou não esteja cadastrada
CREATE OR REPLACE FUNCTION public.aplicar_delta_bancario(p_conta text, p_delta numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alvo uuid;
  conta_limpa text;
BEGIN
  conta_limpa := nullif(trim(p_conta), '');
  IF p_delta = 0 OR conta_limpa IS NULL THEN
    RETURN;
  END IF;

  -- 1. Busca exata (ignorando maiúsculas e espaços nas pontas)
  SELECT id INTO alvo FROM public.saldos_bancarios
   WHERE lower(trim(conta)) = lower(conta_limpa)
   ORDER BY data_saldo DESC, updated_at DESC, id LIMIT 1 FOR UPDATE;

  -- 2. Busca aproximada (ex: "C6" vs "RS C6")
  IF alvo IS NULL THEN
    SELECT id INTO alvo FROM public.saldos_bancarios
     WHERE lower(conta) ILIKE '%' || lower(conta_limpa) || '%'
        OR lower(conta_limpa) ILIKE '%' || lower(conta) || '%'
     ORDER BY data_saldo DESC, updated_at DESC, id LIMIT 1 FOR UPDATE;
  END IF;

  -- 3. Se a conta não existir em saldos_bancarios, cria o registro automaticamente para atualizar o saldo
  IF alvo IS NULL THEN
    INSERT INTO public.saldos_bancarios(conta, saldo, data_saldo)
    VALUES (conta_limpa, p_delta, (now() AT TIME ZONE 'America/Sao_Paulo')::date)
    RETURNING id INTO alvo;
    RETURN;
  END IF;

  -- 4. Atualiza o saldo existente
  UPDATE public.saldos_bancarios
     SET saldo = saldo + p_delta,
         data_saldo = (now() AT TIME ZONE 'America/Sao_Paulo')::date,
         updated_at = now()
   WHERE id = alvo;
END;
$$;

-- 3. Função RPC para exclusão permanente de movimentação (seja conta ou lançamento do livro caixa)
CREATE OR REPLACE FUNCTION public.excluir_movimentacao_permanentemente(p_tabela text, p_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_venda_id uuid;
  v_pagamento_id uuid;
  v_observacoes text;
  v_removidos int := 0;
BEGIN
  IF lower(trim(p_tabela)) IN ('lancamentos_financeiros', 'lancamento', 'lancamentos') THEN
    -- 1. Captura dados do lançamento antes de excluir
    SELECT venda_id, observacoes
      INTO v_venda_id, v_observacoes
      FROM public.lancamentos_financeiros
     WHERE id = p_id;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'message', 'Lançamento não encontrado.');
    END IF;

    -- 2. Se possuir vínculo com venda_pagamentos (ex: 'pagamento:<uuid>'), remove o pagamento correspondente
    IF v_observacoes LIKE 'pagamento:%' THEN
      BEGIN
        v_pagamento_id := substring(v_observacoes from 'pagamento:([a-f0-9\-]+)')::uuid;
        IF v_pagamento_id IS NOT NULL THEN
          DELETE FROM public.venda_pagamentos WHERE id = v_pagamento_id;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END IF;
    END IF;

    -- 3. Remove vínculos em venda_historico
    DELETE FROM public.venda_historico WHERE lancamento_id = p_id;

    -- 4. Exclui permanentemente o lançamento (o trigger trg_saldo_movimento cuida do saldo bancário automaticamente)
    DELETE FROM public.lancamentos_financeiros WHERE id = p_id;
    v_removidos := 1;

    RETURN jsonb_build_object('success', true, 'removidos', v_removidos, 'tabela', 'lancamentos_financeiros');

  ELSIF lower(trim(p_tabela)) IN ('contas', 'conta') THEN
    -- 1. Captura dados da conta antes de excluir
    SELECT venda_id
      INTO v_venda_id
      FROM public.contas
     WHERE id = p_id;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'message', 'Conta não encontrada.');
    END IF;

    -- 2. Remove vínculos e históricos correspondentes
    DELETE FROM public.venda_historico
     WHERE conta_id = p_id OR observacoes ILIKE '%[conta_id:' || p_id::text || ']%';

    -- 3. Se houver pagamentos em venda_pagamentos gerados por essa conta, remove
    IF v_venda_id IS NOT NULL THEN
      DELETE FROM public.venda_pagamentos
       WHERE venda_id = v_venda_id AND observacoes ILIKE '%[conta_id:' || p_id::text || ']%';
    END IF;

    -- 4. Exclui permanentemente a conta (o trigger trg_saldo_movimento cuida do saldo bancário automaticamente)
    DELETE FROM public.contas WHERE id = p_id;
    v_removidos := 1;

    RETURN jsonb_build_object('success', true, 'removidos', v_removidos, 'tabela', 'contas');
  ELSE
    RAISE EXCEPTION 'Tabela desconhecida: %', p_tabela;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.excluir_movimentacao_permanentemente(text, uuid) TO authenticated, service_role;
