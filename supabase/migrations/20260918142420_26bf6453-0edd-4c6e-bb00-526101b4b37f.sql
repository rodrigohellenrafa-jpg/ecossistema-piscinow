CREATE TABLE public.permissoes_telas (user_id uuid PRIMARY KEY, telas text[] NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.permissoes_telas TO authenticated; GRANT ALL ON public.permissoes_telas TO service_role;
ALTER TABLE public.permissoes_telas ENABLE ROW LEVEL SECURITY;
CREATE POLICY permissoes_ler ON public.permissoes_telas FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY permissoes_admin ON public.permissoes_telas FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE TRIGGER permissoes_updated BEFORE UPDATE ON public.permissoes_telas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TABLE public.configuracao_mestra (id boolean PRIMARY KEY DEFAULT true CHECK(id), senha_hash text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.configuracao_mestra TO service_role;
ALTER TABLE public.configuracao_mestra ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER mestra_updated BEFORE UPDATE ON public.configuracao_mestra FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE FUNCTION public.tem_tela(_uid uuid, _tela text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT public.has_role(_uid,'admin') OR EXISTS(SELECT 1 FROM public.permissoes_telas WHERE user_id=_uid AND _tela=ANY(telas)) $$;
REVOKE ALL ON FUNCTION public.tem_tela(uuid,text) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.tem_tela(uuid,text) TO authenticated,service_role;
CREATE FUNCTION public.tem_telas(_uid uuid, _telas text[]) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM unnest(_telas) t WHERE public.tem_tela(_uid,t)) $$;
REVOKE ALL ON FUNCTION public.tem_telas(uuid,text[]) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.tem_telas(uuid,text[]) TO authenticated,service_role;
INSERT INTO public.permissoes_telas(user_id,telas)
SELECT u.user_id, array_agg(DISTINCT c.tela) FROM (SELECT DISTINCT user_id FROM public.user_roles) u CROSS JOIN (VALUES
('dashboard',''),('agenda',''),('clientes','cadastros'),('produtos','cadastros'),('precificacao','cadastros'),('fornecedores','compras'),('funcionarios','rh'),
('vendas.novo','vendas'),('vendas.lista','vendas'),('vendas.orcamentos','vendas'),('vendas.detalhe','vendas'),('vendas.pagamentos','vendas'),('vendas.historico','vendas'),('reativacao','vendas'),
('logistica','logistica'),('obras.detalhe','logistica'),('ordens','logistica'),('os.formulario','logistica'),('compras','compras'),('ordens-compra','compras'),('notas-compra','compras'),('estoque.entradas','compras'),('estoque.inventario','compras'),('estoque.relatorio','compras'),
('contas.pagar','financeiro'),('contas.receber','financeiro'),('financeiro.lancamentos','financeiro'),('financeiro.conciliacao','financeiro'),('saldos','financeiro'),('extrato.importar','financeiro'),('fluxo.agenda','financeiro'),('fluxo.extrato','financeiro'),('fluxo.mensal','financeiro'),('relatorio-contas','financeiro'),('dre','financeiro'),('indicadores','financeiro'),('fiscal.nfe','financeiro'),('fiscal.nfse','financeiro'),('fiscal.config','financeiro'),('holerite','rh'),('acessos','admin'),('atalhos','admin'),('importacao.usuarios','admin'),('importacao.clientes','admin'),('importacao.produtos','admin'),('importacao.vendas','admin'),('importacao.financeiro','admin'),('importacao.lancamentos','admin')) c(tela,area)
WHERE c.area='' OR public.tem_area(u.user_id,c.area) GROUP BY u.user_id;