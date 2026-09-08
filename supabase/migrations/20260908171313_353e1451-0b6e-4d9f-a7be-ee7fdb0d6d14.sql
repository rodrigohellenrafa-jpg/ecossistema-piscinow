ALTER TABLE public.vendas
  ADD COLUMN IF NOT EXISTS tipo_atendimento text NOT NULL DEFAULT 'in';

ALTER TABLE public.vendas
  ADD CONSTRAINT vendas_tipo_atendimento_check CHECK (tipo_atendimento IN ('in','out'));

ALTER TABLE public.ordens_servico
  ADD COLUMN IF NOT EXISTS venda_id uuid REFERENCES public.vendas(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ordens_servico_venda_id ON public.ordens_servico(venda_id);