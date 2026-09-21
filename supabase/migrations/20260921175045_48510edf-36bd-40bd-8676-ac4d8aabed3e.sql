UPDATE public.saldos_bancarios
   SET saldo = 23395.44,
       data_saldo = (now() AT TIME ZONE 'America/Sao_Paulo')::date,
       updated_at = now()
 WHERE lower(trim(conta)) = 'rs comercio de piscinas';