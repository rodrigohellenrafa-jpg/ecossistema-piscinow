CREATE TABLE public.venda_condicoes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venda_id uuid NOT NULL REFERENCES public.vendas(id) ON DELETE CASCADE,
  ordem integer NOT NULL DEFAULT 1,
  forma_pagamento text NOT NULL,
  valor numeric(12,2) NOT NULL DEFAULT 0,
  parcelas integer NOT NULL DEFAULT 1,
  acrescimo numeric(12,2) NOT NULL DEFAULT 0,
  valor_cobrado numeric(12,2) NOT NULL DEFAULT 0,
  valor_parcela numeric(12,2) NOT NULL DEFAULT 0,
  data_prevista date,
  pago boolean NOT NULL DEFAULT false,
  bandeira text,
  observacoes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.venda_condicoes TO authenticated;
GRANT ALL ON public.venda_condicoes TO service_role;

ALTER TABLE public.venda_condicoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "venda_condicoes_auth_all" ON public.venda_condicoes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_venda_condicoes_venda ON public.venda_condicoes(venda_id);

CREATE TRIGGER trg_venda_condicoes_updated
  BEFORE UPDATE ON public.venda_condicoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();