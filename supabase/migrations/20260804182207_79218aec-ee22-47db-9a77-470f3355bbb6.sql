CREATE TABLE public.notas_compra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chave_acesso text UNIQUE,
  numero text,
  serie text,
  fornecedor text NOT NULL,
  fornecedor_cnpj text,
  natureza_operacao text,
  data_emissao date,
  data_entrada date NOT NULL DEFAULT CURRENT_DATE,
  valor_produtos numeric NOT NULL DEFAULT 0,
  valor_frete numeric NOT NULL DEFAULT 0,
  valor_total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pendente',
  xml text,
  observacoes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notas_compra TO authenticated;
GRANT ALL ON public.notas_compra TO service_role;

ALTER TABLE public.notas_compra ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipe gerencia notas de compra"
ON public.notas_compra FOR ALL TO authenticated
USING (true) WITH CHECK (true);

CREATE TRIGGER trg_notas_compra_updated
BEFORE UPDATE ON public.notas_compra
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();