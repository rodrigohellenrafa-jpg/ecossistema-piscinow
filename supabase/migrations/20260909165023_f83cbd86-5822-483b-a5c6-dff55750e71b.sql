ALTER TABLE public.venda_itens
  ADD COLUMN IF NOT EXISTS desconto_valor numeric(12,2) NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.venda_itens.desconto_valor IS 'Desconto absoluto em moeda (R$) concedido no item.';