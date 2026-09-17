CREATE OR REPLACE FUNCTION public.tem_area(_uid uuid, _area text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _uid AND (
      ur.role = 'admin'
      OR (_area = 'cadastros'  AND ur.role IN ('gerente','vendedor','financeiro'))
      OR (_area = 'vendas'     AND ur.role IN ('gerente','vendedor'))
      OR (_area = 'logistica'  AND ur.role IN ('gerente','tecnico'))
      OR (_area = 'compras'    AND ur.role IN ('gerente','financeiro','tecnico'))
      OR (_area = 'financeiro' AND ur.role IN ('gerente','financeiro'))
      OR (_area = 'rh'         AND ur.role IN ('gerente','financeiro'))
    )
  )
$$;

CREATE OR REPLACE FUNCTION public.tem_area_any(_uid uuid, _areas text[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM unnest(_areas) a WHERE public.tem_area(_uid, a))
$$;

REVOKE ALL ON FUNCTION public.tem_area(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.tem_area_any(uuid, text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.tem_area(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.tem_area_any(uuid, text[]) TO authenticated, service_role;

DO $$
DECLARE
  m text[] := ARRAY[
    'clientes|cadastros|cadastros,vendas,logistica,compras,financeiro',
    'produtos|cadastros|cadastros,vendas,logistica,compras,financeiro',
    'tabela_fabricante|cadastros|cadastros,vendas',
    'fornecedores|compras|cadastros,vendas,compras,financeiro',
    'funcionarios|rh|cadastros,vendas,logistica,compras,financeiro,rh',
    'usuarios_importados|admin|admin',
    'vendas|vendas|vendas,logistica,financeiro',
    'venda_itens|vendas|vendas,logistica,financeiro',
    'venda_condicoes|vendas|vendas,financeiro',
    'venda_pagamentos|vendas|vendas,financeiro',
    'venda_kit|vendas|vendas,financeiro',
    'venda_historico|vendas|vendas,logistica,financeiro',
    'obras|logistica|vendas,logistica,financeiro',
    'ordens_servico|logistica|vendas,logistica,financeiro',
    'agenda_eventos|logistica|cadastros,vendas,logistica,compras,financeiro,rh',
    'ordens_compra|compras|compras,financeiro',
    'ordem_compra_itens|compras|compras,financeiro',
    'notas_compra|compras|compras,financeiro',
    'estoque_movimentos|compras|cadastros,vendas,logistica,compras',
    'contas|financeiro|financeiro',
    'conta_rateios|financeiro|financeiro',
    'lancamentos_financeiros|financeiro|financeiro',
    'lancamento_rateios|financeiro|financeiro',
    'extratos_bancarios|financeiro|financeiro',
    'saldos_bancarios|financeiro|financeiro',
    'despesas_recorrentes|financeiro|financeiro',
    'categorias_financeiras|financeiro|financeiro,compras',
    'notas_fiscais|financeiro|financeiro,vendas',
    'configuracao_fiscal|admin|financeiro,vendas',
    'fiscal_credenciais|admin|financeiro'
  ];
  linha text;
  tbl text;
  escrita text;
  leitura text;
  pol record;
BEGIN
  FOREACH linha IN ARRAY m LOOP
    tbl := split_part(linha, '|', 1);
    escrita := split_part(linha, '|', 2);
    leitura := split_part(linha, '|', 3);

    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl);
    END LOOP;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.tem_area_any(auth.uid(), string_to_array(%L, '','')))',
      tbl || '_ler', tbl, leitura);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.tem_area(auth.uid(), %L)) WITH CHECK (public.tem_area(auth.uid(), %L))',
      tbl || '_gerir', tbl, escrita, escrita);
  END LOOP;
END $$;