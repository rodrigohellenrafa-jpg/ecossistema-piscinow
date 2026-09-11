ALTER TABLE public.ordens_compra
  ADD COLUMN IF NOT EXISTS enviada_em timestamptz,
  ADD COLUMN IF NOT EXISTS faturada_em timestamptz;

ALTER TABLE public.contas
  ADD COLUMN IF NOT EXISTS ordem_compra_id uuid REFERENCES public.ordens_compra(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_contas_ordem_compra ON public.contas(ordem_compra_id);