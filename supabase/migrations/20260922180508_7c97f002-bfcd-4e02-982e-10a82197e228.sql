CREATE TABLE public.ordem_compra_pagamentos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ordem_id uuid NOT NULL REFERENCES public.ordens_compra(id) ON DELETE CASCADE,
  data_pagamento date NOT NULL DEFAULT current_date,
  forma_pagamento text NOT NULL DEFAULT 'Pix',
  conta_bancaria text,
  valor numeric NOT NULL DEFAULT 0,
  observacoes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ordem_compra_pagamentos TO authenticated;
GRANT ALL ON public.ordem_compra_pagamentos TO service_role;
ALTER TABLE public.ordem_compra_pagamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Autenticados gerenciam pagamentos de ordens" ON public.ordem_compra_pagamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX idx_ocp_ordem ON public.ordem_compra_pagamentos(ordem_id);
CREATE TRIGGER update_ocp_updated_at BEFORE UPDATE ON public.ordem_compra_pagamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();