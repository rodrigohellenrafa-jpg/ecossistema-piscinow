DO $$
DECLARE
  c record;
  v_data date;
  v_i int;
  v_step interval;
BEGIN
  FOR c IN
    SELECT DISTINCT ON (descricao, tipo, recorrencia) *
      FROM public.contas
     WHERE recorrencia IS NOT NULL AND recorrencia <> 'nenhuma'
     ORDER BY descricao, tipo, recorrencia, vencimento DESC
  LOOP
    v_step := CASE c.recorrencia
      WHEN 'diaria' THEN interval '1 day'
      WHEN 'semanal' THEN interval '7 days'
      WHEN 'quinzenal' THEN interval '15 days'
      WHEN 'mensal' THEN interval '1 month'
      WHEN 'bimestral' THEN interval '2 months'
      WHEN 'trimestral' THEN interval '3 months'
      WHEN 'semestral' THEN interval '6 months'
      WHEN 'anual' THEN interval '1 year'
      ELSE NULL END;
    CONTINUE WHEN v_step IS NULL;

    v_data := c.vencimento;
    FOR v_i IN 1..12 LOOP
      v_data := (v_data + v_step)::date;
      EXIT WHEN v_data > (c.vencimento + interval '12 months')::date;
      EXIT WHEN c.recorrencia_fim IS NOT NULL AND v_data > c.recorrencia_fim;

      IF NOT EXISTS (
        SELECT 1 FROM public.contas x
         WHERE x.descricao = c.descricao AND x.tipo = c.tipo AND x.vencimento = v_data
      ) THEN
        INSERT INTO public.contas (
          tipo, descricao, parceiro, cliente_id, funcionario_id, categoria, valor,
          valor_juros, vencimento, status, observacoes, obra_id, numero_documento,
          venda_id, recorrencia, recorrencia_fim, tipo_despesa, created_by
        ) VALUES (
          c.tipo, c.descricao, c.parceiro, c.cliente_id, c.funcionario_id, c.categoria, c.valor,
          COALESCE(c.valor_juros, 0), v_data, 'aberto', c.observacoes, c.obra_id, c.numero_documento,
          c.venda_id, c.recorrencia, c.recorrencia_fim, c.tipo_despesa, c.created_by
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;