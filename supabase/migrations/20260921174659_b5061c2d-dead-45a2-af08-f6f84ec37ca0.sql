DO $$
DECLARE
  alvo text := 'RS COMERCIO DE PISCINAS';
  delta numeric := 0;
BEGIN
  CREATE TEMP TABLE _ajuste_contas ON COMMIT DROP AS
  SELECT id,
         CASE WHEN tipo = 'receber' THEN 1 ELSE -1 END *
         CASE WHEN coalesce(valor_pago,0) <> 0 THEN valor_pago
              ELSE greatest(0, valor + coalesce(valor_juros,0) - coalesce(valor_desconto,0)) END AS d
  FROM public.contas
  WHERE lower(status) IN ('pago','pago_parcial')
    AND (coalesce(trim(conta_bancaria),'') = ''
         OR lower(trim(conta_bancaria)) IN ('c6','c6 bank','c6 pj','banco c6'));

  CREATE TEMP TABLE _ajuste_lanc ON COMMIT DROP AS
  SELECT id,
         CASE WHEN lower(tipo_fluxo) IN ('receita','entrada') THEN 1 ELSE -1 END * valor AS d
  FROM public.lancamentos_financeiros
  WHERE lower(status) IN ('pago','pago_parcial')
    AND (coalesce(trim(conta_bancaria),'') = ''
         OR lower(trim(conta_bancaria)) IN ('c6','c6 bank','c6 pj','banco c6'));

  SELECT coalesce((SELECT sum(d) FROM _ajuste_contas),0) + coalesce((SELECT sum(d) FROM _ajuste_lanc),0)
    INTO delta;

  ALTER TABLE public.contas DISABLE TRIGGER trg_saldo_movimento;
  ALTER TABLE public.lancamentos_financeiros DISABLE TRIGGER trg_saldo_movimento;

  UPDATE public.contas SET conta_bancaria = alvo
   WHERE id IN (SELECT id FROM _ajuste_contas);
  UPDATE public.lancamentos_financeiros SET conta_bancaria = alvo
   WHERE id IN (SELECT id FROM _ajuste_lanc);

  -- normaliza também os que não estavam pagos
  UPDATE public.contas SET conta_bancaria = alvo
   WHERE lower(trim(conta_bancaria)) IN ('c6','c6 bank','c6 pj','banco c6');
  UPDATE public.lancamentos_financeiros SET conta_bancaria = alvo
   WHERE lower(trim(conta_bancaria)) IN ('c6','c6 bank','c6 pj','banco c6');

  ALTER TABLE public.contas ENABLE TRIGGER trg_saldo_movimento;
  ALTER TABLE public.lancamentos_financeiros ENABLE TRIGGER trg_saldo_movimento;

  IF delta <> 0 THEN
    UPDATE public.saldos_bancarios
       SET saldo = saldo + delta,
           data_saldo = (now() AT TIME ZONE 'America/Sao_Paulo')::date,
           updated_at = now()
     WHERE lower(trim(conta)) = lower(trim(alvo));
  END IF;
END $$;