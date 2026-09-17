ALTER TABLE public.contas
  ADD COLUMN IF NOT EXISTS valor_pago numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_desconto numeric NOT NULL DEFAULT 0;

UPDATE public.contas SET valor_pago = valor + COALESCE(valor_juros,0)
WHERE status = 'pago' AND valor_pago = 0;