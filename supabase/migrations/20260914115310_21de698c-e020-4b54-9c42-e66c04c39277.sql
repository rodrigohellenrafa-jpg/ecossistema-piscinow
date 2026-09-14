CREATE TABLE public.saldos_bancarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conta text NOT NULL,
  banco text,
  saldo numeric NOT NULL DEFAULT 0,
  data_saldo date NOT NULL DEFAULT CURRENT_DATE,
  observacoes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saldos_bancarios TO authenticated;
GRANT ALL ON public.saldos_bancarios TO service_role;

ALTER TABLE public.saldos_bancarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados gerenciam saldos bancarios"
ON public.saldos_bancarios FOR ALL TO authenticated
USING (true) WITH CHECK (true);

CREATE TRIGGER trg_saldos_bancarios_updated
BEFORE UPDATE ON public.saldos_bancarios
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();