-- Migration para garantir execução e permissões de recorrências completas para usuários autenticados
-- Amplia o horizonte de geração de despesas recorrentes para os próximos 12 meses

CREATE OR REPLACE FUNCTION public.gerar_despesas_recorrentes() 
RETURNS integer 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$ 
DECLARE 
  qtd integer; 
BEGIN 
  INSERT INTO public.contas(tipo,descricao,parceiro,categoria,valor,vencimento,status,obra_id,recorrencia_id,competencia_recorrencia,created_by) 
  SELECT 'pagar', r.descricao, r.parceiro, r.categoria, r.valor, 
         least((m + (r.dia_vencimento-1)*interval '1 day')::date, (m + interval '1 month - 1 day')::date),
         'aberto', r.obra_id, r.id, m::date, r.created_by 
  FROM public.despesas_recorrentes r 
  CROSS JOIN LATERAL generate_series(
    date_trunc('month', r.inicio::timestamp),
    date_trunc('month', least(coalesce(r.fim, (current_date + interval '12 months')::date), (current_date + interval '12 months')::date)::timestamp),
    interval '1 month'
  ) m 
  WHERE r.ativo 
    AND least((m + (r.dia_vencimento-1)*interval '1 day')::date, (m + interval '1 month - 1 day')::date) >= r.inicio 
    AND (r.fim IS NULL OR least((m + (r.dia_vencimento-1)*interval '1 day')::date, (m + interval '1 month - 1 day')::date) <= r.fim) 
  ON CONFLICT DO NOTHING; 
  GET DIAGNOSTICS qtd = ROW_COUNT; 
  RETURN qtd; 
END $$;

-- Concede permissão para authenticated e service_role
GRANT EXECUTE ON FUNCTION public.gerar_despesas_recorrentes() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.executar_recorrencias_todas()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  qtd_desp integer := 0;
BEGIN
  SELECT public.gerar_despesas_recorrentes() INTO qtd_desp;
  RETURN qtd_desp;
END $$;

GRANT EXECUTE ON FUNCTION public.executar_recorrencias_todas() TO authenticated, service_role;
