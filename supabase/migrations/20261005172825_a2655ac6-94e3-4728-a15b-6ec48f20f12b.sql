CREATE TABLE public.ordem_compra_notas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_id uuid NOT NULL REFERENCES public.ordens_compra(id) ON DELETE CASCADE,
  numero_nf text,
  valor numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ordem_compra_notas TO authenticated;
GRANT ALL ON public.ordem_compra_notas TO service_role;

ALTER TABLE public.ordem_compra_notas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados gerenciam notas de ordens" ON public.ordem_compra_notas FOR ALL TO authenticated USING (true) WITH CHECK (true);
