CREATE TABLE public.conta_rateios (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conta_id uuid NOT NULL REFERENCES public.contas(id) ON DELETE CASCADE,
  categoria text NOT NULL,
  valor numeric NOT NULL DEFAULT 0,
  observacoes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.conta_rateios TO authenticated;
GRANT ALL ON public.conta_rateios TO service_role;

ALTER TABLE public.conta_rateios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados gerenciam rateios" ON public.conta_rateios
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_conta_rateios_conta ON public.conta_rateios(conta_id);
CREATE INDEX idx_conta_rateios_categoria ON public.conta_rateios(categoria);

CREATE TRIGGER trg_conta_rateios_updated
  BEFORE UPDATE ON public.conta_rateios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();