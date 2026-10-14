-- Migration: Configuração completa do vetor de escuta em tempo real para lançamentos financeiros
-- Garante REPLICA IDENTITY FULL e inclusão na publicação supabase_realtime para todas as tabelas financeiras

DO $$
DECLARE
  tbl text;
  tabelas_financeiras text[] := ARRAY[
    'lancamentos_financeiros',
    'contas',
    'saldos_bancarios',
    'venda_pagamentos',
    'venda_historico',
    'vendas'
  ];
BEGIN
  FOREACH tbl IN ARRAY tabelas_financeiras LOOP
    -- Garante que a tabela tenha REPLICA IDENTITY FULL para que o Realtime envie payloads completos em UPDATE e DELETE
    EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', tbl);

    -- Registra na publication do Supabase Realtime se ainda não estiver
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = tbl
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
    END IF;
  END LOOP;
END $$;
