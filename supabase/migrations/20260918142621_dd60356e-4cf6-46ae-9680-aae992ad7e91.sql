DO $$ DECLARE r record; p record; leitura text; escrita text; BEGIN
FOR r IN SELECT * FROM (VALUES
('clientes','clientes,reativacao,vendas.novo,vendas.detalhe,vendas.lista,vendas.orcamentos,contas.pagar,contas.receber,financeiro.lancamentos,logistica,agenda,ordens,fiscal.nfe,fiscal.nfse','clientes,reativacao,importacao.clientes'),
('produtos','produtos,precificacao,vendas.novo,vendas.detalhe,compras,ordens-compra,notas-compra,estoque.entradas,estoque.inventario,estoque.relatorio','produtos,precificacao,estoque.inventario,importacao.produtos'),
('tabela_fabricante','precificacao,vendas.novo,vendas.detalhe','precificacao'),('fornecedores','fornecedores,compras,ordens-compra,notas-compra,contas.pagar,financeiro.lancamentos','fornecedores'),
('funcionarios','funcionarios,holerite,vendas.novo,vendas.detalhe,contas.pagar,financeiro.lancamentos,agenda,ordens,logistica','funcionarios'),
('vendas','vendas.lista,vendas.orcamentos,vendas.detalhe,vendas.novo,logistica,obras.detalhe,ordens,agenda,contas.receber,financeiro.lancamentos,fiscal.nfe,fiscal.nfse,reativacao,holerite,dashboard,indicadores','vendas.novo,vendas.detalhe,vendas.lista,vendas.orcamentos,importacao.vendas'),
('venda_itens','vendas.lista,vendas.orcamentos,vendas.detalhe,vendas.novo,ordens,obras.detalhe,fiscal.nfe,fiscal.nfse','vendas.novo,vendas.detalhe,vendas.orcamentos'),
('venda_kit','vendas.novo,vendas.detalhe','vendas.novo,vendas.detalhe'),
('venda_condicoes','vendas.novo,vendas.pagamentos','vendas.novo,vendas.pagamentos'),
('venda_pagamentos','vendas.novo,vendas.pagamentos','vendas.novo,vendas.pagamentos'),
('venda_historico','vendas.historico','vendas.historico'),
('obras','logistica,obras.detalhe,agenda,vendas.detalhe,vendas.historico,contas.pagar,contas.receber,financeiro.lancamentos','logistica,obras.detalhe'),
('ordens_servico','ordens,os.formulario,logistica,obras.detalhe,agenda,vendas.detalhe','ordens,os.formulario,logistica'),
('ordens_compra','ordens-compra,compras,contas.pagar,vendas.novo','ordens-compra,compras'),
('ordem_compra_itens','ordens-compra,compras,vendas.novo','ordens-compra,compras'),
('notas_compra','notas-compra','notas-compra'),
('estoque_movimentos','estoque.entradas,estoque.inventario,estoque.relatorio,produtos','estoque.entradas,estoque.inventario'),
('lancamentos_financeiros','financeiro.lancamentos,financeiro.conciliacao,fluxo.agenda,fluxo.extrato,fluxo.mensal,saldos,dre,indicadores,dashboard','financeiro.lancamentos,financeiro.conciliacao,importacao.lancamentos'),
('lancamento_rateios','financeiro.lancamentos,dre','financeiro.lancamentos'),
('saldos_bancarios','saldos,dashboard,financeiro.lancamentos,financeiro.conciliacao,contas.pagar,contas.receber,vendas.novo,vendas.pagamentos,extrato.importar,fluxo.agenda,fluxo.extrato,fluxo.mensal,indicadores','saldos,extrato.importar'),
('extratos_bancarios','financeiro.conciliacao,extrato.importar','financeiro.conciliacao,extrato.importar'),
('categorias_financeiras','contas.pagar,contas.receber,financeiro.lancamentos,dre','financeiro.lancamentos'),
('despesas_recorrentes','contas.pagar,financeiro.lancamentos','contas.pagar,financeiro.lancamentos'),
('configuracao_fiscal','fiscal.config,fiscal.nfe,fiscal.nfse','fiscal.config'),
('fiscal_credenciais','fiscal.config','fiscal.config'),
('agenda_eventos','agenda','agenda')
) AS x(tabela,ler,gerir) LOOP
FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=r.tabela LOOP EXECUTE format('DROP POLICY %I ON public.%I',p.policyname,r.tabela); END LOOP;
leitura:=format('public.tem_telas(auth.uid(),string_to_array(%L,'',''))',r.ler); escrita:=format('public.tem_telas(auth.uid(),string_to_array(%L,'',''))',r.gerir);
EXECUTE format('CREATE POLICY tela_ler ON public.%I FOR SELECT TO authenticated USING (%s)',r.tabela,leitura);
EXECUTE format('CREATE POLICY tela_gerir ON public.%I FOR ALL TO authenticated USING (%s) WITH CHECK (%s)',r.tabela,escrita,escrita);
END LOOP;
FOR p IN SELECT tablename,policyname FROM pg_policies WHERE schemaname='public' AND tablename IN ('contas','conta_rateios','notas_fiscais') LOOP EXECUTE format('DROP POLICY %I ON public.%I',p.policyname,p.tablename); END LOOP;
END $$;
CREATE POLICY contas_tela_ler ON public.contas FOR SELECT TO authenticated USING(public.tem_tela(auth.uid(),'contas.'||tipo) OR public.tem_telas(auth.uid(),ARRAY['relatorio-contas','fluxo.agenda','fluxo.extrato','fluxo.mensal','dre','indicadores','saldos','dashboard','financeiro.conciliacao']) OR (tipo='receber' AND venda_id IS NOT NULL AND public.tem_telas(auth.uid(),ARRAY['vendas.novo','vendas.pagamentos','vendas.detalhe'])));
CREATE POLICY contas_tela_gerir ON public.contas FOR ALL TO authenticated USING(public.tem_tela(auth.uid(),'contas.'||tipo) OR public.tem_tela(auth.uid(),'importacao.financeiro') OR (tipo='receber' AND venda_id IS NOT NULL AND public.tem_telas(auth.uid(),ARRAY['vendas.novo','vendas.pagamentos','vendas.detalhe']))) WITH CHECK(public.tem_tela(auth.uid(),'contas.'||tipo) OR public.tem_tela(auth.uid(),'importacao.financeiro') OR (tipo='receber' AND venda_id IS NOT NULL AND public.tem_telas(auth.uid(),ARRAY['vendas.novo','vendas.pagamentos','vendas.detalhe'])));
CREATE POLICY rateios_tela ON public.conta_rateios FOR ALL TO authenticated USING(EXISTS(SELECT 1 FROM public.contas c WHERE c.id=conta_id AND public.tem_tela(auth.uid(),'contas.'||c.tipo))) WITH CHECK(EXISTS(SELECT 1 FROM public.contas c WHERE c.id=conta_id AND public.tem_tela(auth.uid(),'contas.'||c.tipo)));
CREATE POLICY fiscal_tela ON public.notas_fiscais FOR ALL TO authenticated USING(public.tem_tela(auth.uid(),CASE WHEN lower(modelo) IN ('nfse','nfs-e') THEN 'fiscal.nfse' ELSE 'fiscal.nfe' END)) WITH CHECK(public.tem_tela(auth.uid(),CASE WHEN lower(modelo) IN ('nfse','nfs-e') THEN 'fiscal.nfse' ELSE 'fiscal.nfe' END));
CREATE POLICY venda_estoque_inserir ON public.estoque_movimentos FOR INSERT TO authenticated WITH CHECK(public.tem_tela(auth.uid(),'vendas.novo'));
CREATE POLICY venda_compra_inserir ON public.ordens_compra FOR INSERT TO authenticated WITH CHECK(public.tem_tela(auth.uid(),'vendas.novo'));
CREATE POLICY venda_compra_item_inserir ON public.ordem_compra_itens FOR INSERT TO authenticated WITH CHECK(public.tem_tela(auth.uid(),'vendas.novo'));
CREATE OR REPLACE FUNCTION public.tem_area(_uid uuid,_area text) RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$ SELECT public.tem_telas(_uid,CASE _area WHEN 'logistica' THEN ARRAY['logistica','ordens','obras.detalhe'] WHEN 'vendas' THEN ARRAY['vendas.novo','vendas.detalhe'] WHEN 'financeiro' THEN ARRAY['financeiro.lancamentos','contas.pagar','contas.receber'] WHEN 'compras' THEN ARRAY['compras','ordens-compra'] WHEN 'cadastros' THEN ARRAY['clientes','produtos'] WHEN 'rh' THEN ARRAY['funcionarios','holerite'] ELSE ARRAY['acessos'] END) $$;