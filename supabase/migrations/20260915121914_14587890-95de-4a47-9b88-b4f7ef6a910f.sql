CREATE TABLE IF NOT EXISTS public.extratos_bancarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conta text NOT NULL,
  banco text,
  data_movimento date NOT NULL,
  descricao text NOT NULL,
  documento text,
  valor numeric NOT NULL DEFAULT 0,
  tipo text NOT NULL DEFAULT 'saida',
  saldo numeric,
  conciliado boolean NOT NULL DEFAULT false,
  origem text NOT NULL DEFAULT 'importado',
  observacoes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.extratos_bancarios TO authenticated;
GRANT ALL ON public.extratos_bancarios TO service_role;

ALTER TABLE public.extratos_bancarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Autenticados gerenciam extratos bancarios" ON public.extratos_bancarios;
CREATE POLICY "Autenticados gerenciam extratos bancarios"
  ON public.extratos_bancarios FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_extratos_conta_data ON public.extratos_bancarios(conta, data_movimento DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_extratos_linha
  ON public.extratos_bancarios(conta, data_movimento, valor, descricao);

DROP TRIGGER IF EXISTS trg_extratos_bancarios_updated ON public.extratos_bancarios;
CREATE TRIGGER trg_extratos_bancarios_updated
  BEFORE UPDATE ON public.extratos_bancarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.extratos_bancarios REPLICA IDENTITY FULL;