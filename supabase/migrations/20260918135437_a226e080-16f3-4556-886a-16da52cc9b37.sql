UPDATE public.lancamentos_financeiros
SET data_pagamento = DATE '2026-09-18',
    updated_at = now()
WHERE id = 'f0ce8eab-9e6a-49ff-9602-562dae8920e6'
  AND valor = 2500.00
  AND lower(status) = 'pago';