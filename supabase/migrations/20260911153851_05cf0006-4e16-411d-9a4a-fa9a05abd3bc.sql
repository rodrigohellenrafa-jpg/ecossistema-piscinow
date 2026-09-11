CREATE TABLE public.categorias_financeiras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'ambas' CHECK (tipo IN ('ambas','pagar','receber')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (nome, tipo)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categorias_financeiras TO authenticated;
GRANT ALL ON public.categorias_financeiras TO service_role;
ALTER TABLE public.categorias_financeiras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios autenticados gerenciam categorias" ON public.categorias_financeiras FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_categorias_financeiras_updated_at BEFORE UPDATE ON public.categorias_financeiras FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.categorias_financeiras (nome, tipo) VALUES
  ('Fornecedores','pagar'),('Materiais','pagar'),('Mão de obra','pagar'),('Frete/Logística','pagar'),
  ('Impostos/Taxas','pagar'),('Aluguel','pagar'),('Energia/Água/Internet','pagar'),('Salários/Comissões','pagar'),
  ('Marketing','pagar'),('Vendas de produtos','receber'),('Serviços de piscina','receber'),('Outros','ambas');