-- Migration: Refatoração do Flight Board (Filtro obrigatório de OS emitida, suporte a tags Com/Sem Execução e sincronização Google Calendar)

-- 1. Adiciona colunas complementares em logistics_flight_board (retrocompatível)
ALTER TABLE public.logistics_flight_board
  ADD COLUMN IF NOT EXISTS ordem_id uuid REFERENCES public.ordens_servico(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS os_numero text,
  ADD COLUMN IF NOT EXISTS data_execucao date,
  ADD COLUMN IF NOT EXISTS hora_inicio text,
  ADD COLUMN IF NOT EXISTS hora_fim text,
  ADD COLUMN IF NOT EXISTS etapa_execucao text,
  ADD COLUMN IF NOT EXISTS modalidade_execucao text NOT NULL DEFAULT 'com_execucao',
  ADD COLUMN IF NOT EXISTS emails_vinculados text[] NOT NULL DEFAULT ARRAY['campinasjardimdotrevo@splashpiscinas.com']::text[],
  ADD COLUMN IF NOT EXISTS google_event_id text,
  ADD COLUMN IF NOT EXISTS google_calendar_id text DEFAULT 'campinasjardimdotrevo@splashpiscinas.com';

-- 2. Vincula registros existentes do logistics_flight_board às Ordens de Serviço (OS) formalmente emitidas
UPDATE public.logistics_flight_board lfb
SET
  ordem_id = os.id,
  os_numero = os.numero,
  data_execucao = COALESCE(lfb.instalacao_data, lfb.escavacao_data, os.data_agendada, lfb.data_pedido)
FROM public.ordens_servico os
WHERE lfb.ordem_id IS NULL
  AND os.status NOT IN ('orcamento', 'cancelado', 'cancelada')
  AND (
    (lfb.venda_id IS NOT NULL AND (os.venda_id = lfb.venda_id OR lfb.venda_id = ANY(os.vendas_ids)))
    OR (lfb.cliente_id IS NOT NULL AND os.cliente_id = lfb.cliente_id)
  );

-- 3. Remove do logistics_flight_board os pedidos/obras que NÃO possuem Ordem de Serviço (OS) formalmente emitida
DELETE FROM public.logistics_flight_board lfb
WHERE lfb.ordem_id IS NULL
  AND lfb.google_event_id IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.ordens_servico os
    WHERE os.status NOT IN ('orcamento', 'cancelado', 'cancelada')
      AND (
        os.id = lfb.ordem_id
        OR (lfb.venda_id IS NOT NULL AND (os.venda_id = lfb.venda_id OR lfb.venda_id = ANY(os.vendas_ids)))
        OR (lfb.obra_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.obras ob
          WHERE ob.id = lfb.obra_id
            AND (ob.board_os_id = os.id OR (ob.venda_id IS NOT NULL AND ob.venda_id = os.venda_id))
        ))
      )
  );

-- 4. Garante que qualquer membro autenticado da equipe possa gerenciar eventos da agenda/Flight Board
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agenda_eventos' AND policyname = 'Equipe gerencia agenda e flight board'
  ) THEN
    CREATE POLICY "Equipe gerencia agenda e flight board"
      ON public.agenda_eventos
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
