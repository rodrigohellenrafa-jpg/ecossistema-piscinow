ALTER TABLE public.produtos
  ADD COLUMN IF NOT EXISTS unidades_por_compra numeric NOT NULL DEFAULT 1;

COMMENT ON COLUMN public.produtos.unidades_por_compra IS 'Quantas unidades de venda vêm em cada embalagem/caixa comprada do fornecedor.';