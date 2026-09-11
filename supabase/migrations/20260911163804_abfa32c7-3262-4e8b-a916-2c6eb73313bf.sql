ALTER TABLE public.ordens_compra
  ADD COLUMN IF NOT EXISTS valor_nota numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_pago numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS obs_pagamento text;