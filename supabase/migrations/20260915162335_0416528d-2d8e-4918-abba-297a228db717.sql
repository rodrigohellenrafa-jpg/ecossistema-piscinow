CREATE TABLE public.tabela_fabricante (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modelo text NOT NULL UNIQUE,
  linha text,
  custo_casco numeric NOT NULL DEFAULT 0,
  custo_filtro numeric NOT NULL DEFAULT 0,
  frete numeric NOT NULL DEFAULT 0,
  instalacao numeric NOT NULL DEFAULT 0,
  imposto numeric NOT NULL DEFAULT 0,
  lucro numeric NOT NULL DEFAULT 0,
  preco_venda numeric NOT NULL DEFAULT 0,
  observacoes text,
  ativo boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tabela_fabricante TO authenticated;
GRANT ALL ON public.tabela_fabricante TO service_role;

ALTER TABLE public.tabela_fabricante ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados gerenciam tabela do fabricante"
ON public.tabela_fabricante FOR ALL TO authenticated
USING (true) WITH CHECK (true);

CREATE TRIGGER trg_tabela_fabricante_updated
BEFORE UPDATE ON public.tabela_fabricante
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();