-- Migration: Criar tabela e suporte para o Flight Board de Logística & Operações
CREATE TABLE IF NOT EXISTS public.logistics_flight_board (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voo_codigo text NOT NULL,
  obra_id uuid REFERENCES public.obras(id) ON DELETE SET NULL,
  venda_id uuid REFERENCES public.vendas(id) ON DELETE SET NULL,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  cliente_nome text NOT NULL,
  servico_natureza text NOT NULL,
  data_pedido date NOT NULL DEFAULT CURRENT_DATE,
  prazo_dias integer NOT NULL DEFAULT 30,
  prazo_limite date,
  escavacao_data date,
  escavacao_status text NOT NULL DEFAULT 'pendente',
  instalacao_data date,
  instalacao_status text NOT NULL DEFAULT 'pendente',
  os_instalacao text,
  os_instalacao_status text NOT NULL DEFAULT 'pendente',
  os_logistica text,
  os_logistica_status text NOT NULL DEFAULT 'pendente',
  os_acabamento text,
  os_acabamento_status text NOT NULL DEFAULT 'pendente',
  status text NOT NULL DEFAULT 'AGENDADO',
  is_out boolean NOT NULL DEFAULT false,
  responsavel text,
  endereco_obra text,
  observacoes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.logistics_flight_board TO authenticated;
GRANT ALL ON public.logistics_flight_board TO service_role;

ALTER TABLE public.logistics_flight_board ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'logistics_flight_board' AND policyname = 'flight_board_auth_all'
  ) THEN
    CREATE POLICY "flight_board_auth_all" ON public.logistics_flight_board FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Triggers de atualização
CREATE OR REPLACE FUNCTION public.set_flight_board_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_flight_board_updated_at ON public.logistics_flight_board;
CREATE TRIGGER trg_flight_board_updated_at
BEFORE UPDATE ON public.logistics_flight_board
FOR EACH ROW EXECUTE FUNCTION public.set_flight_board_updated_at();

-- Popula o Flight Board a partir das obras existentes caso esteja vazio
INSERT INTO public.logistics_flight_board (
  voo_codigo,
  obra_id,
  venda_id,
  cliente_id,
  cliente_nome,
  servico_natureza,
  data_pedido,
  prazo_dias,
  prazo_limite,
  escavacao_data,
  escavacao_status,
  instalacao_data,
  instalacao_status,
  os_instalacao,
  os_instalacao_status,
  os_logistica,
  os_logistica_status,
  os_acabamento,
  os_acabamento_status,
  status,
  is_out,
  responsavel,
  endereco_obra,
  observacoes
)
SELECT
  coalesce(o.numero, 'OBRA-' || substring(o.id::text, 1, 4)),
  o.id,
  o.venda_id,
  o.cliente_id,
  coalesce(o.cliente_nome, 'Cliente'),
  coalesce(o.tipo_servico, 'Instalação de Piscina'),
  coalesce(o.data_pedido, CURRENT_DATE),
  coalesce(o.prazo_dias, 30),
  coalesce(o.data_limite, CURRENT_DATE + interval '30 days'),
  o.escavacao_inicio,
  coalesce(o.etapa_escavacao, 'pendente'),
  o.instalacao_inicio,
  coalesce(o.etapa_base, 'pendente'),
  o.os_instalacao,
  CASE WHEN o.etapa_tubulacao = 'concluido' THEN 'concluido' ELSE 'pendente' END,
  o.os_logistica,
  CASE WHEN o.etapa_furacao = 'concluido' THEN 'concluido' ELSE 'pendente' END,
  o.os_acabamento,
  CASE WHEN o.etapa_cascata = 'concluido' THEN 'concluido' ELSE 'pendente' END,
  CASE
    WHEN upper(coalesce(o.status_geral, '')) LIKE '%OUT%' THEN 'OUT'
    WHEN upper(coalesce(o.status_geral, '')) LIKE '%CONCLU%' THEN 'CONCLUÍDO'
    WHEN upper(coalesce(o.status_geral, '')) LIKE '%ANDAMENTO%' THEN 'CONFIRMADO'
    WHEN upper(coalesce(o.status_geral, '')) LIKE '%AGENDADO%' THEN 'AGENDADO'
    ELSE 'AGUARDANDO'
  END,
  (upper(coalesce(o.status_geral, '')) LIKE '%OUT%' OR upper(coalesce(o.tipo_servico, '')) LIKE '%OUT%'),
  o.responsavel,
  o.endereco_obra,
  o.observacoes
FROM public.obras o
WHERE NOT EXISTS (SELECT 1 FROM public.logistics_flight_board lfb WHERE lfb.obra_id = o.id);

-- Habilita Realtime no canal da tabela se suportado
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.logistics_flight_board;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
