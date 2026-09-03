-- Emitente / configuração fiscal
CREATE TABLE public.configuracao_fiscal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social text NOT NULL DEFAULT '',
  nome_fantasia text,
  cnpj text NOT NULL DEFAULT '26108962000152',
  inscricao_estadual text,
  inscricao_municipal text,
  regime_tributario text NOT NULL DEFAULT 'simples_nacional',
  cnae text,
  cep text,
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  municipio text,
  codigo_municipio text,
  uf text,
  telefone text,
  email text,
  provedor text NOT NULL DEFAULT 'focus_nfe',
  ambiente text NOT NULL DEFAULT 'homologacao',
  token_configurado boolean NOT NULL DEFAULT false,
  certificado_valido_ate date,
  serie_nfe text NOT NULL DEFAULT '1',
  proximo_numero_nfe integer NOT NULL DEFAULT 1,
  serie_nfse text NOT NULL DEFAULT '1',
  proximo_numero_nfse integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.configuracao_fiscal TO authenticated;
GRANT ALL ON public.configuracao_fiscal TO service_role;
ALTER TABLE public.configuracao_fiscal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Autenticados leem config fiscal" ON public.configuracao_fiscal FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin e financeiro gerenciam config fiscal" ON public.configuracao_fiscal FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'financeiro') OR public.has_role(auth.uid(),'gerente'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'financeiro') OR public.has_role(auth.uid(),'gerente'));
CREATE TRIGGER trg_config_fiscal_updated BEFORE UPDATE ON public.configuracao_fiscal FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Notas fiscais emitidas (saída): NF-e e NFS-e
CREATE TABLE public.notas_fiscais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modelo text NOT NULL DEFAULT 'nfe',
  numero text,
  serie text,
  referencia text UNIQUE,
  venda_id uuid REFERENCES public.vendas(id) ON DELETE SET NULL,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  cliente_nome text,
  cliente_documento text,
  natureza_operacao text NOT NULL DEFAULT 'Venda de mercadoria',
  tipo_documento text NOT NULL DEFAULT 'saida',
  finalidade text NOT NULL DEFAULT 'normal',
  consumidor_final boolean NOT NULL DEFAULT true,
  presenca_comprador text NOT NULL DEFAULT 'presencial',
  modalidade_frete text NOT NULL DEFAULT 'sem_frete',
  data_emissao date NOT NULL DEFAULT CURRENT_DATE,
  itens jsonb NOT NULL DEFAULT '[]'::jsonb,
  valor_produtos numeric NOT NULL DEFAULT 0,
  valor_servicos numeric NOT NULL DEFAULT 0,
  valor_frete numeric NOT NULL DEFAULT 0,
  valor_desconto numeric NOT NULL DEFAULT 0,
  base_icms numeric NOT NULL DEFAULT 0,
  valor_icms numeric NOT NULL DEFAULT 0,
  valor_ipi numeric NOT NULL DEFAULT 0,
  valor_pis numeric NOT NULL DEFAULT 0,
  valor_cofins numeric NOT NULL DEFAULT 0,
  valor_iss numeric NOT NULL DEFAULT 0,
  aliquota_iss numeric NOT NULL DEFAULT 0,
  iss_retido boolean NOT NULL DEFAULT false,
  codigo_servico text,
  discriminacao text,
  valor_total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'rascunho',
  chave_acesso text,
  protocolo text,
  url_danfe text,
  url_xml text,
  mensagem_sefaz text,
  motivo_cancelamento text,
  observacoes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notas_fiscais TO authenticated;
GRANT ALL ON public.notas_fiscais TO service_role;
ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Autenticados gerenciam notas fiscais" ON public.notas_fiscais FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_notas_fiscais_updated BEFORE UPDATE ON public.notas_fiscais FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_notas_fiscais_data ON public.notas_fiscais(data_emissao);
CREATE INDEX idx_notas_fiscais_status ON public.notas_fiscais(status);

-- Campos fiscais nos cadastros
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS inscricao_estadual text,
  ADD COLUMN IF NOT EXISTS indicador_ie text NOT NULL DEFAULT 'nao_contribuinte',
  ADD COLUMN IF NOT EXISTS inscricao_municipal text,
  ADD COLUMN IF NOT EXISTS codigo_municipio text,
  ADD COLUMN IF NOT EXISTS regime_tributario text;

ALTER TABLE public.produtos
  ADD COLUMN IF NOT EXISTS cest text,
  ADD COLUMN IF NOT EXISTS origem_mercadoria text NOT NULL DEFAULT '0',
  ADD COLUMN IF NOT EXISTS aliquota_icms numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS aliquota_ipi numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS aliquota_pis numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS aliquota_cofins numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS aliquota_iss numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS codigo_servico_municipal text;

ALTER TABLE public.fornecedores
  ADD COLUMN IF NOT EXISTS inscricao_estadual text;

INSERT INTO public.configuracao_fiscal (razao_social, cnpj, regime_tributario, ambiente)
VALUES ('Piscinow', '26108962000152', 'simples_nacional', 'homologacao');