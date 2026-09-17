CREATE TABLE public.venda_historico (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venda_id uuid REFERENCES public.vendas(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id),
  obra_id uuid REFERENCES public.obras(id),
  ordem_id uuid REFERENCES public.ordens_servico(id),
  conta_id uuid REFERENCES public.contas(id),
  lancamento_id uuid REFERENCES public.lancamentos_financeiros(id),
  data date NOT NULL DEFAULT CURRENT_DATE,
  tipo text NOT NULL DEFAULT 'anotacao',
  descricao text NOT NULL,
  natureza text NOT NULL DEFAULT 'neutro',
  valor numeric NOT NULL DEFAULT 0,
  recorrencia text NOT NULL DEFAULT 'nenhuma',
  proxima_data date,
  observacoes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.venda_historico TO authenticated;
GRANT ALL ON public.venda_historico TO service_role;

ALTER TABLE public.venda_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados gerenciam historico da venda"
ON public.venda_historico FOR ALL TO authenticated
USING (true) WITH CHECK (true);

CREATE INDEX idx_venda_historico_venda ON public.venda_historico(venda_id, data);
CREATE INDEX idx_venda_historico_cliente ON public.venda_historico(cliente_id, data);
CREATE INDEX idx_venda_historico_obra ON public.venda_historico(obra_id, data);

CREATE TRIGGER update_venda_historico_updated_at
BEFORE UPDATE ON public.venda_historico
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();