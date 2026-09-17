ALTER TABLE public.obras
  ADD COLUMN IF NOT EXISTS escavacao_inicio date,
  ADD COLUMN IF NOT EXISTS escavacao_fim date,
  ADD COLUMN IF NOT EXISTS instalacao_inicio date,
  ADD COLUMN IF NOT EXISTS instalacao_fim date;

UPDATE public.obras
SET escavacao_inicio = COALESCE(escavacao_inicio, data_inicio),
    instalacao_fim = COALESCE(instalacao_fim, data_termino)
WHERE escavacao_inicio IS NULL OR instalacao_fim IS NULL;

CREATE OR REPLACE FUNCTION public.sincronizar_etapas_obra()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.escavacao_fim IS NOT NULL THEN
    NEW.etapa_escavacao := 'concluido';
  ELSIF NEW.escavacao_inicio IS NOT NULL AND NEW.etapa_escavacao = 'pendente' THEN
    NEW.etapa_escavacao := 'em_andamento';
  END IF;

  IF NEW.instalacao_fim IS NOT NULL THEN
    NEW.etapa_motor := 'concluido';
  ELSIF NEW.instalacao_inicio IS NOT NULL AND NEW.etapa_motor = 'pendente' THEN
    NEW.etapa_motor := 'em_andamento';
  END IF;

  NEW.data_inicio := COALESCE(NEW.escavacao_inicio, NEW.instalacao_inicio, NEW.data_inicio);
  NEW.data_termino := COALESCE(NEW.instalacao_fim, NEW.data_termino);

  IF NEW.instalacao_fim IS NOT NULL THEN
    NEW.status_geral := 'Concluído';
  ELSIF (NEW.escavacao_inicio IS NOT NULL OR NEW.instalacao_inicio IS NOT NULL)
        AND NEW.status_geral = 'Agendado' THEN
    NEW.status_geral := 'Em Execução';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sincronizar_etapas_obra ON public.obras;
CREATE TRIGGER trg_sincronizar_etapas_obra
BEFORE INSERT OR UPDATE ON public.obras
FOR EACH ROW EXECUTE FUNCTION public.sincronizar_etapas_obra();

INSERT INTO public.contas (
  tipo, descricao, parceiro, cliente_id, venda_id, categoria,
  valor, vencimento, status, observacoes, created_by
)
SELECT
  'receber',
  'Pedido ' || COALESCE(v.numero, '') || ' — saldo a receber',
  v.cliente_nome,
  v.cliente_id,
  v.id,
  'Vendas',
  s.pendente,
  COALESCE(v.data, CURRENT_DATE),
  'aberto',
  'Gerado automaticamente: saldo em aberto do pedido (regularização).',
  v.created_by
FROM public.vendas v
CROSS JOIN LATERAL (
  SELECT ROUND(
    v.valor_total
    - COALESCE((SELECT SUM(p.valor) FROM public.venda_pagamentos p WHERE p.venda_id = v.id), 0)
    - COALESCE((SELECT SUM(c.valor) FROM public.contas c WHERE c.venda_id = v.id AND c.tipo = 'receber'), 0)
  , 2) AS pendente
) s
WHERE COALESCE(v.status_pedido, '') NOT IN ('orcamento', 'cancelado')
  AND v.valor_total > 0
  AND s.pendente > 0.01;