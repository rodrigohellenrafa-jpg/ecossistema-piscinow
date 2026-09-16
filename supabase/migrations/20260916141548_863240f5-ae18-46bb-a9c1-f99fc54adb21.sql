ALTER TABLE public.extratos_bancarios
  ADD COLUMN IF NOT EXISTS lancamento_id uuid REFERENCES public.lancamentos_financeiros(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS conta_id uuid REFERENCES public.contas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS conciliado_em timestamptz,
  ADD COLUMN IF NOT EXISTS conciliado_por uuid;

CREATE INDEX IF NOT EXISTS idx_extratos_lancamento ON public.extratos_bancarios(lancamento_id);
CREATE INDEX IF NOT EXISTS idx_extratos_conta_data ON public.extratos_bancarios(conta, data_movimento);