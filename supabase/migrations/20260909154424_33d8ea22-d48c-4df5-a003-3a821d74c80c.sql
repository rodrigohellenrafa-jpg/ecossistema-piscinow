ALTER TABLE public.vendas
  ADD COLUMN IF NOT EXISTS etiqueta text,
  ADD COLUMN IF NOT EXISTS assinatura_imagem text,
  ADD COLUMN IF NOT EXISTS assinatura_nome text,
  ADD COLUMN IF NOT EXISTS assinatura_documento text,
  ADD COLUMN IF NOT EXISTS assinatura_metodo text NOT NULL DEFAULT 'tela',
  ADD COLUMN IF NOT EXISTS assinatura_codigo text,
  ADD COLUMN IF NOT EXISTS assinatura_em timestamptz;

ALTER TABLE public.ordens_servico
  ADD COLUMN IF NOT EXISTS assinatura_imagem text,
  ADD COLUMN IF NOT EXISTS assinatura_nome text,
  ADD COLUMN IF NOT EXISTS assinatura_documento text,
  ADD COLUMN IF NOT EXISTS assinatura_metodo text NOT NULL DEFAULT 'tela',
  ADD COLUMN IF NOT EXISTS assinatura_codigo text,
  ADD COLUMN IF NOT EXISTS assinatura_em timestamptz;

CREATE INDEX IF NOT EXISTS idx_vendas_etiqueta ON public.vendas (etiqueta);