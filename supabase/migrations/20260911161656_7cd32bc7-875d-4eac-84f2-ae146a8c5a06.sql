ALTER TABLE public.ordem_compra_itens
  ADD COLUMN IF NOT EXISTS cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cliente_nome text,
  ADD COLUMN IF NOT EXISTS venda_id uuid REFERENCES public.vendas(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ordem_compra_itens_cliente ON public.ordem_compra_itens (cliente_id);