CREATE TABLE IF NOT EXISTS public.credito_fabricante (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fornecedor_nome text NOT NULL DEFAULT 'Geral',
  saldo numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.credito_fabricante TO authenticated;
GRANT ALL ON public.credito_fabricante TO service_role;
ALTER TABLE public.credito_fabricante ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Autenticados gerenciam credito fabricante" ON public.credito_fabricante;
CREATE POLICY "Autenticados gerenciam credito fabricante" ON public.credito_fabricante FOR ALL TO authenticated USING (true) WITH CHECK (true);
INSERT INTO public.credito_fabricante (fornecedor_nome, saldo)
SELECT 'Geral', 0
WHERE NOT EXISTS (SELECT 1 FROM public.credito_fabricante);