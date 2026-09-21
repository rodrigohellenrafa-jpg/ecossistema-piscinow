ALTER TABLE public.ordem_compra_itens
  ADD COLUMN IF NOT EXISTS numero_nf text;

COMMENT ON COLUMN public.ordem_compra_itens.numero_nf IS
  'Número da nota fiscal do fornecedor correspondente ao produto comprado.';