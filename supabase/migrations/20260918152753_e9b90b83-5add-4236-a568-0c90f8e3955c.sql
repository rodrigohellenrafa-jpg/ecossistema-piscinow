
-- Renumera as vendas em sequência por data de criação
CREATE TEMP TABLE _renum AS
SELECT id, numero AS antigo,
       'VEN-' || lpad((row_number() over (order by created_at, numero))::text, 3, '0') AS novo
FROM public.vendas;

-- evita colisão temporária
UPDATE public.vendas v SET numero = 'TMP-' || v.id::text FROM _renum r WHERE v.id = r.id AND r.antigo <> r.novo;
UPDATE public.vendas v SET numero = r.novo FROM _renum r WHERE v.id = r.id;

-- atualiza textos que citam o número antigo
UPDATE public.contas c SET descricao = replace(c.descricao, r.antigo, r.novo)
FROM _renum r WHERE r.antigo <> r.novo AND c.descricao LIKE '%' || r.antigo || '%';

UPDATE public.venda_historico h SET descricao = replace(h.descricao, r.antigo, r.novo)
FROM _renum r WHERE r.antigo <> r.novo AND h.descricao LIKE '%' || r.antigo || '%';

UPDATE public.ordens_servico o SET descricao = replace(o.descricao, r.antigo, r.novo)
FROM _renum r WHERE r.antigo <> r.novo AND o.descricao LIKE '%' || r.antigo || '%';

UPDATE public.agenda_eventos a SET titulo = replace(a.titulo, r.antigo, r.novo)
FROM _renum r WHERE r.antigo <> r.novo AND a.titulo LIKE '%' || r.antigo || '%';

-- numeração sequencial confiável, calculada no banco
CREATE OR REPLACE FUNCTION public.proximo_numero_venda()
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT 'VEN-' || lpad((COALESCE(MAX(NULLIF(regexp_replace(numero, '^VEN-', ''), '')::int), 0) + 1)::text, 3, '0')
  FROM public.vendas
  WHERE numero ~ '^VEN-[0-9]+$';
$$;

REVOKE ALL ON FUNCTION public.proximo_numero_venda() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.proximo_numero_venda() TO authenticated, service_role;
