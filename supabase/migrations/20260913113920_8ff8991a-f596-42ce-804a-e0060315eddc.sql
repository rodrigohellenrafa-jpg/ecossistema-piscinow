CREATE TABLE public.lancamento_rateios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lancamento_id UUID NOT NULL REFERENCES public.lancamentos_financeiros(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  observacoes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lancamento_rateios TO authenticated;
GRANT ALL ON public.lancamento_rateios TO service_role;
ALTER TABLE public.lancamento_rateios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Autenticados gerenciam rateios de lancamentos" ON public.lancamento_rateios FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX idx_lancamento_rateios_lancamento ON public.lancamento_rateios(lancamento_id);
CREATE INDEX idx_lancamento_rateios_categoria ON public.lancamento_rateios(categoria);
CREATE TRIGGER trg_lancamento_rateios_updated BEFORE UPDATE ON public.lancamento_rateios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();