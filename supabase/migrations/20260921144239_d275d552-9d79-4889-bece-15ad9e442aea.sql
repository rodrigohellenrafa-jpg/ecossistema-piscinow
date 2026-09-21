ALTER TABLE public.produtos
  ADD COLUMN quantidade_compra numeric NOT NULL DEFAULT 1,
  ADD COLUMN desconto_compra numeric NOT NULL DEFAULT 0,
  ADD COLUMN status_compra text NOT NULL DEFAULT 'a_comprar';