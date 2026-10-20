CREATE TABLE public.logistics_flight_board (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voo_codigo TEXT,
  ordem_id UUID REFERENCES public.ordens_servico(id) ON DELETE SET NULL,
  os_numero TEXT,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  cliente_nome TEXT,
  obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  venda_id UUID REFERENCES public.vendas(id) ON DELETE SET NULL,
  kit_titulo TEXT,
  etapa_execucao TEXT,
  data_execucao DATE,
  previsao_entrega DATE,
  hora_inicio TEXT,
  hora_fim TEXT,
  status_voo TEXT NOT NULL DEFAULT 'AGENDADO',
  modalidade_execucao TEXT NOT NULL DEFAULT 'com_execucao',
  equipe_responsavel TEXT,
  emails_vinculados TEXT,
  observacoes TEXT,
  google_event_id TEXT,
  google_calendar_id TEXT,
  etapa_conferencia TEXT NOT NULL DEFAULT 'pendente',
  etapa_separacao TEXT NOT NULL DEFAULT 'pendente',
  etapa_carregamento TEXT NOT NULL DEFAULT 'pendente',
  etapa_transito TEXT NOT NULL DEFAULT 'pendente',
  etapa_entrega TEXT NOT NULL DEFAULT 'pendente',
  etapa_instalacao TEXT NOT NULL DEFAULT 'pendente',
  servico_out BOOLEAN NOT NULL DEFAULT false,
  motivo_out TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.logistics_flight_board TO authenticated;
GRANT ALL ON public.logistics_flight_board TO service_role;
ALTER TABLE public.logistics_flight_board ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios autenticados gerenciam flight board" ON public.logistics_flight_board FOR ALL TO authenticated USING (true) WITH CHECK (true);