-- Migration: Módulo de Gestão de Documentos (Dossiê do Cliente) e Consolidação de Cargas/Compras
-- 1. Criação da tabela de Cargas (Loads)
CREATE TABLE IF NOT EXISTS public.cargas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text NOT NULL,
  fornecedor_id uuid REFERENCES public.fornecedores(id) ON DELETE SET NULL,
  fornecedor_nome text NOT NULL,
  data_solicitacao date NOT NULL DEFAULT CURRENT_DATE,
  previsao_entrega date,
  status text NOT NULL DEFAULT 'solicitada', -- 'solicitada', 'em_transito', 'entregue', 'cancelada'
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

-- 2. Atualização de ordens_compra para suporte a cliente e vinculação a carga
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'ordens_compra' AND column_name = 'cliente_id'
  ) THEN
    ALTER TABLE public.ordens_compra ADD COLUMN cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'ordens_compra' AND column_name = 'cliente_nome'
  ) THEN
    ALTER TABLE public.ordens_compra ADD COLUMN cliente_nome text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'ordens_compra' AND column_name = 'carga_id'
  ) THEN
    ALTER TABLE public.ordens_compra ADD COLUMN carga_id uuid REFERENCES public.cargas(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'ordens_compra' AND column_name = 'status_carga'
  ) THEN
    ALTER TABLE public.ordens_compra ADD COLUMN status_carga text DEFAULT 'pendente_carga';
  END IF;
END $$;

-- 3. Atualização de ordem_compra_itens para vincular cada item à carga
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'ordem_compra_itens' AND column_name = 'carga_id'
  ) THEN
    ALTER TABLE public.ordem_compra_itens ADD COLUMN carga_id uuid REFERENCES public.cargas(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'ordem_compra_itens' AND column_name = 'status_carga'
  ) THEN
    ALTER TABLE public.ordem_compra_itens ADD COLUMN status_carga text DEFAULT 'pendente_carga';
  END IF;
END $$;

-- 4. Tabela de itens da carga (Cargas_Itens)
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

-- Permissões e RLS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cargas TO authenticated;
GRANT ALL ON public.cargas TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cargas_itens TO authenticated;
GRANT ALL ON public.cargas_itens TO service_role;

ALTER TABLE public.cargas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cargas_itens ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cargas' AND policyname = 'cargas_auth_all'
  ) THEN
    CREATE POLICY "cargas_auth_all" ON public.cargas FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cargas_itens' AND policyname = 'cargas_itens_auth_all'
  ) THEN
    CREATE POLICY "cargas_itens_auth_all" ON public.cargas_itens FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Triggers de atualização automática de updated_at para cargas
CREATE OR REPLACE FUNCTION public.set_cargas_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cargas_updated_at ON public.cargas;
CREATE TRIGGER trg_cargas_updated_at
BEFORE UPDATE ON public.cargas
FOR EACH ROW EXECUTE FUNCTION public.set_cargas_updated_at();

-- Habilitar Supabase Realtime nas cargas e ordens
ALTER PUBLICATION supabase_realtime ADD TABLE public.cargas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cargas_itens;
