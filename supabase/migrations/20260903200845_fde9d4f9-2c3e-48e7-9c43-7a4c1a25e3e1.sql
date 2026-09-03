-- ============ FORNECEDORES ============
CREATE TABLE public.fornecedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE,
  nome text NOT NULL,
  cnpj text,
  contato text,
  telefone text,
  email text,
  prazo_entrega_dias integer NOT NULL DEFAULT 7,
  observacoes text,
  ativo boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fornecedores TO authenticated;
GRANT ALL ON public.fornecedores TO service_role;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fornecedores_auth_all" ON public.fornecedores FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ FUNCIONARIOS (RH) ============
CREATE TABLE public.funcionarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  codigo text UNIQUE,
  nome text NOT NULL,
  cargo text NOT NULL DEFAULT 'vendedor',
  perfil public.app_role NOT NULL DEFAULT 'vendedor',
  email text,
  telefone text,
  data_admissao date,
  salario_base numeric(12,2) NOT NULL DEFAULT 0,
  vt numeric(12,2) NOT NULL DEFAULT 0,
  vr numeric(12,2) NOT NULL DEFAULT 0,
  inss_perc numeric(5,2) NOT NULL DEFAULT 0,
  irrf_perc numeric(5,2) NOT NULL DEFAULT 0,
  sindicato numeric(12,2) NOT NULL DEFAULT 0,
  bonificacao numeric(12,2) NOT NULL DEFAULT 0,
  comissao_piscinas numeric(5,2) NOT NULL DEFAULT 0,
  comissao_acessorios numeric(5,2) NOT NULL DEFAULT 0,
  comissao_quimicos numeric(5,2) NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.funcionarios TO authenticated;
GRANT ALL ON public.funcionarios TO service_role;
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "funcionarios_rh_read" ON public.funcionarios FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'gerente')
    OR public.has_role(auth.uid(), 'financeiro')
    OR user_id = auth.uid()
  );
CREATE POLICY "funcionarios_rh_write" ON public.funcionarios FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gerente'));
CREATE POLICY "funcionarios_rh_update" ON public.funcionarios FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gerente'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gerente'));
CREATE POLICY "funcionarios_rh_delete" ON public.funcionarios FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ EXTENSOES: PRODUTOS / CLIENTES ============
ALTER TABLE public.produtos
  ADD COLUMN IF NOT EXISTS custo_fabricacao numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS custo_logistico numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fornecedor_id uuid REFERENCES public.fornecedores(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS ncm text,
  ADD COLUMN IF NOT EXISTS cst text,
  ADD COLUMN IF NOT EXISTS cfop text,
  ADD COLUMN IF NOT EXISTS localizacao text;

ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS codigo text,
  ADD COLUMN IF NOT EXISTS endereco_obra text,
  ADD COLUMN IF NOT EXISTS etapa text NOT NULL DEFAULT 'Lead';

-- ============ EXTENSOES: VENDAS ============
ALTER TABLE public.vendas
  ADD COLUMN IF NOT EXISTS vendedor_id uuid REFERENCES public.funcionarios(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subtotal_produtos numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_frete numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_mao_obra numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_impostos numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS custo_total numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_entrada numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS saldo_devedor numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS parcelas integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS valor_parcela numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status_pedido text NOT NULL DEFAULT 'orcamento',
  ADD COLUMN IF NOT EXISTS pdf_link text;

-- ============ ITENS DE VENDA ============
CREATE TABLE public.venda_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id uuid NOT NULL REFERENCES public.vendas(id) ON DELETE CASCADE,
  produto_id uuid REFERENCES public.produtos(id) ON DELETE SET NULL,
  sku text,
  descricao text NOT NULL,
  quantidade numeric(12,3) NOT NULL DEFAULT 1,
  preco_unitario numeric(12,2) NOT NULL DEFAULT 0,
  desconto_perc numeric(5,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  custo_unitario numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.venda_itens TO authenticated;
GRANT ALL ON public.venda_itens TO service_role;
ALTER TABLE public.venda_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "venda_itens_auth_all" ON public.venda_itens FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ KIT MULTIPARTIDO ============
CREATE TABLE public.venda_kit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id uuid NOT NULL REFERENCES public.vendas(id) ON DELETE CASCADE,
  casco_id uuid REFERENCES public.produtos(id) ON DELETE SET NULL,
  filtro_id uuid REFERENCES public.produtos(id) ON DELETE SET NULL,
  acessorios jsonb NOT NULL DEFAULT '[]'::jsonb,
  custo_frete numeric(12,2) NOT NULL DEFAULT 0,
  custo_mao_obra numeric(12,2) NOT NULL DEFAULT 0,
  impostos numeric(12,2) NOT NULL DEFAULT 0,
  custo_total_kit numeric(12,2) NOT NULL DEFAULT 0,
  preco_venda_kit numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.venda_kit TO authenticated;
GRANT ALL ON public.venda_kit TO service_role;
ALTER TABLE public.venda_kit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "venda_kit_auth_all" ON public.venda_kit FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ OBRAS / FLIGHT BOARD ============
CREATE TABLE public.obras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id uuid REFERENCES public.vendas(id) ON DELETE SET NULL,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  cliente_nome text,
  numero text,
  tipo_servico text NOT NULL DEFAULT 'Instalação Nova',
  data_pedido date NOT NULL DEFAULT CURRENT_DATE,
  prazo_dias integer NOT NULL DEFAULT 15,
  data_limite date,
  responsavel text,
  endereco_obra text,
  os_instalacao text,
  os_logistica text,
  os_acabamento text,
  status_geral text NOT NULL DEFAULT 'Agendado',
  etapa_escavacao text NOT NULL DEFAULT 'pendente',
  etapa_base text NOT NULL DEFAULT 'pendente',
  etapa_nivel text NOT NULL DEFAULT 'pendente',
  etapa_esquadro text NOT NULL DEFAULT 'pendente',
  etapa_furacao text NOT NULL DEFAULT 'pendente',
  etapa_tubulacao text NOT NULL DEFAULT 'pendente',
  etapa_casa_maquinas text NOT NULL DEFAULT 'pendente',
  etapa_motor text NOT NULL DEFAULT 'pendente',
  etapa_aquecimento text NOT NULL DEFAULT 'pendente',
  etapa_cascata text NOT NULL DEFAULT 'pendente',
  observacoes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.obras TO authenticated;
GRANT ALL ON public.obras TO service_role;
ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "obras_auth_all" ON public.obras FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ ORDENS DE COMPRA ============
CREATE TABLE public.ordens_compra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text UNIQUE,
  fornecedor_id uuid REFERENCES public.fornecedores(id) ON DELETE SET NULL,
  fornecedor_nome text,
  data_pedido date NOT NULL DEFAULT CURRENT_DATE,
  previsao_entrega date,
  condicoes text,
  valor_produtos numeric(12,2) NOT NULL DEFAULT 0,
  desconto numeric(12,2) NOT NULL DEFAULT 0,
  icms_base numeric(12,2) NOT NULL DEFAULT 0,
  icms_valor numeric(12,2) NOT NULL DEFAULT 0,
  icms_st_base numeric(12,2) NOT NULL DEFAULT 0,
  icms_st_valor numeric(12,2) NOT NULL DEFAULT 0,
  valor_total numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Pendente',
  observacoes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ordens_compra TO authenticated;
GRANT ALL ON public.ordens_compra TO service_role;
ALTER TABLE public.ordens_compra ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ordens_compra_auth_all" ON public.ordens_compra FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.ordem_compra_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_id uuid NOT NULL REFERENCES public.ordens_compra(id) ON DELETE CASCADE,
  produto_id uuid REFERENCES public.produtos(id) ON DELETE SET NULL,
  codigo text,
  descricao text NOT NULL,
  ncm text,
  cst text,
  unidade text NOT NULL DEFAULT 'UN',
  quantidade numeric(12,3) NOT NULL DEFAULT 1,
  valor_unitario numeric(12,2) NOT NULL DEFAULT 0,
  desconto numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ordem_compra_itens TO authenticated;
GRANT ALL ON public.ordem_compra_itens TO service_role;
ALTER TABLE public.ordem_compra_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ordem_compra_itens_auth_all" ON public.ordem_compra_itens FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ LANCAMENTOS FINANCEIROS ============
CREATE TABLE public.lancamentos_financeiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_fluxo text NOT NULL DEFAULT 'receita',
  categoria text NOT NULL DEFAULT 'Operacional',
  descricao text NOT NULL,
  valor numeric(12,2) NOT NULL DEFAULT 0,
  data_competencia date NOT NULL DEFAULT CURRENT_DATE,
  vencimento date,
  data_pagamento date,
  venda_id uuid REFERENCES public.vendas(id) ON DELETE SET NULL,
  fornecedor_id uuid REFERENCES public.fornecedores(id) ON DELETE SET NULL,
  funcionario_id uuid REFERENCES public.funcionarios(id) ON DELETE SET NULL,
  conta_bancaria text,
  forma_pagamento text,
  status text NOT NULL DEFAULT 'Pendente',
  conciliado boolean NOT NULL DEFAULT false,
  observacoes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lancamentos_financeiros TO authenticated;
GRANT ALL ON public.lancamentos_financeiros TO service_role;
ALTER TABLE public.lancamentos_financeiros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lancamentos_auth_all" ON public.lancamentos_financeiros FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ MOVIMENTACOES DE ESTOQUE ============
CREATE TABLE public.estoque_movimentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id uuid NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'entrada',
  quantidade numeric(12,3) NOT NULL DEFAULT 0,
  origem text,
  documento text,
  observacoes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estoque_movimentos TO authenticated;
GRANT ALL ON public.estoque_movimentos TO service_role;
ALTER TABLE public.estoque_movimentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "estoque_movimentos_auth_all" ON public.estoque_movimentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ FUNCOES / TRIGGERS ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_fornecedores_updated BEFORE UPDATE ON public.fornecedores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_funcionarios_updated BEFORE UPDATE ON public.funcionarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_venda_kit_updated BEFORE UPDATE ON public.venda_kit FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_obras_updated BEFORE UPDATE ON public.obras FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ordens_compra_updated BEFORE UPDATE ON public.ordens_compra FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_lancamentos_updated BEFORE UPDATE ON public.lancamentos_financeiros FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.aplicar_movimento_estoque()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo = 'entrada' THEN
    UPDATE public.produtos SET estoque_atual = estoque_atual + NEW.quantidade, updated_at = now() WHERE id = NEW.produto_id;
  ELSE
    UPDATE public.produtos SET estoque_atual = estoque_atual - NEW.quantidade, updated_at = now() WHERE id = NEW.produto_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_estoque_movimento AFTER INSERT ON public.estoque_movimentos
FOR EACH ROW EXECUTE FUNCTION public.aplicar_movimento_estoque();

CREATE INDEX idx_venda_itens_venda ON public.venda_itens(venda_id);
CREATE INDEX idx_obras_status ON public.obras(status_geral);
CREATE INDEX idx_lanc_venc ON public.lancamentos_financeiros(vencimento);
CREATE INDEX idx_oc_itens_ordem ON public.ordem_compra_itens(ordem_id);