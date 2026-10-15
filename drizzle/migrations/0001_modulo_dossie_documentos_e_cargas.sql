CREATE TABLE IF NOT EXISTS public.cargas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text NOT NULL,
  fornecedor_id uuid REFERENCES public.fornecedores(id) ON DELETE SET NULL,
  fornecedor_nome text NOT NULL,
  data_solicitacao date NOT NULL DEFAULT CURRENT_DATE,
  previsao_entrega date,
  status text NOT NULL DEFAULT 'solicitada',
  total_itens integer NOT NULL DEFAULT 0,
  total_valor numeric NOT NULL DEFAULT 0,
  volume_cubagem text,
  placa_veiculo text,
  motorista_contato text,
  observacoes text,
  itens_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ordens_compra ADD COLUMN IF NOT EXISTS cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL;
ALTER TABLE public.ordens_compra ADD COLUMN IF NOT EXISTS cliente_nome text;
ALTER TABLE public.ordens_compra ADD COLUMN IF NOT EXISTS carga_id uuid REFERENCES public.cargas(id) ON DELETE SET NULL;
ALTER TABLE public.ordens_compra ADD COLUMN IF NOT EXISTS status_carga text DEFAULT 'pendente_carga';
ALTER TABLE public.ordem_compra_itens ADD COLUMN IF NOT EXISTS carga_id uuid REFERENCES public.cargas(id) ON DELETE SET NULL;
ALTER TABLE public.ordem_compra_itens ADD COLUMN IF NOT EXISTS status_carga text DEFAULT 'pendente_carga';
CREATE TABLE IF NOT EXISTS public.cargas_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carga_id uuid NOT NULL REFERENCES public.cargas(id) ON DELETE CASCADE,
  ordem_id uuid REFERENCES public.ordens_compra(id) ON DELETE SET NULL,
  item_ordem_id uuid REFERENCES public.ordem_compra_itens(id) ON DELETE SET NULL,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  cliente_nome text,
  produto_id uuid REFERENCES public.produtos(id) ON DELETE SET NULL,
  produto_nome text NOT NULL,
  quantidade numeric NOT NULL DEFAULT 1,
  valor_unitario numeric NOT NULL DEFAULT 0,
  valor_total numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cargas TO authenticated;
GRANT ALL ON public.cargas TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cargas_itens TO authenticated;
GRANT ALL ON public.cargas_itens TO service_role;
ALTER TABLE public.cargas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cargas_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cargas_auth_all" ON public.cargas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cargas_itens_auth_all" ON public.cargas_itens FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_cargas_updated_at BEFORE UPDATE ON public.cargas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER PUBLICATION supabase_realtime ADD TABLE public.cargas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cargas_itens;