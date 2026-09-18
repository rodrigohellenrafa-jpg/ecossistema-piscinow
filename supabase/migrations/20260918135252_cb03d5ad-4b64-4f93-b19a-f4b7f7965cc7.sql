UPDATE public.lancamentos_financeiros
SET conta_bancaria = 'RS COMERCIO DE PISCINAS',
    data_pagamento = DATE '2026-09-18',
    updated_at = now()
WHERE id = 'f1129ac5-f858-49b0-9eaa-4c8c13fadb80'
  AND valor = 116.00
  AND lower(status) = 'pago';

UPDATE public.contas
SET conta_bancaria = 'RS COMERCIO DE PISCINAS',
    data_pagamento = DATE '2026-09-18',
    updated_at = now()
WHERE id = 'c7e312f7-9095-4c71-b905-64252b0f8351'
  AND valor = 178.31
  AND lower(status) IN ('pago', 'pago_parcial');

UPDATE public.saldos_bancarios
SET saldo = 29307.27,
    data_saldo = DATE '2026-09-18',
    updated_at = now()
WHERE id = (
  SELECT id
  FROM public.saldos_bancarios
  WHERE lower(trim(conta)) = lower(trim('RS COMERCIO DE PISCINAS'))
  ORDER BY data_saldo DESC, updated_at DESC, id
  LIMIT 1
);