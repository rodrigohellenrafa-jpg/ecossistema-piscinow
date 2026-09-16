ALTER TABLE public.vendas
  ADD COLUMN IF NOT EXISTS prazo_entrega text,
  ADD COLUMN IF NOT EXISTS endereco_instalacao text,
  ADD COLUMN IF NOT EXISTS materiais jsonb NOT NULL DEFAULT '{}'::jsonb;