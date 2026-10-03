ALTER TABLE public.vendas ADD COLUMN IF NOT EXISTS compra_estoque_processado_em timestamptz;
ALTER TABLE public.venda_kit ADD COLUMN IF NOT EXISTS comparativo jsonb NOT NULL DEFAULT '{}'::jsonb;
CREATE OR REPLACE FUNCTION public.processar_compra_estoque_venda(p_venda_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE v public.vendas%ROWTYPE; r record; f record; o uuid; numero_oc text; total_oc numeric; disponivel numeric; baixa numeric; falta numeric; coberto numeric; comprado numeric; n integer; resultado jsonb := '[]'::jsonb; qtd_baixas integer := 0;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Entre no sistema para confirmar a venda.'; END IF;
 SELECT * INTO v FROM public.vendas WHERE id=p_venda_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Pedido não encontrado ou sem permissão.'; END IF;
 IF v.status_pedido NOT IN ('aprovado','em_producao','concluido') THEN RAISE EXCEPTION 'Confirme a venda antes de gerar a compra.'; END IF;
 IF v.compra_estoque_processado_em IS NOT NULL THEN RETURN jsonb_build_object('baixados',0,'ordensCriadas','[]'::jsonb); END IF;
 IF NOT EXISTS (SELECT 1 FROM public.venda_itens WHERE venda_id=v.id) THEN RAISE EXCEPTION 'Adicione ao menos um produto antes de vender.'; END IF;
 PERFORM pg_advisory_xact_lock(73918261);
 FOR r IN SELECT p.id, p.nome, p.tipo, p.categoria, p.fornecedor_id, sum(i.quantidade) qtd FROM public.venda_itens i JOIN public.produtos p ON p.id=i.produto_id WHERE i.venda_id=v.id GROUP BY p.id ORDER BY p.id LOOP
  IF concat(r.tipo,' ',r.categoria) ~* 'servi' THEN CONTINUE; END IF;
  SELECT greatest(coalesce(estoque_atual,0),0) INTO disponivel FROM public.produtos WHERE id=r.id FOR UPDATE;
  SELECT coalesce(sum(quantidade),0) INTO coberto FROM public.estoque_movimentos WHERE produto_id=r.id AND origem='venda' AND documento=v.numero AND tipo='saida';
  SELECT coalesce(sum(i.quantidade),0) INTO comprado FROM public.ordem_compra_itens i JOIN public.ordens_compra oc ON oc.id=i.ordem_id WHERE i.venda_id=v.id AND i.produto_id=r.id AND oc.status <> 'cancelada';
  baixa := least(disponivel,greatest(r.qtd-coberto-comprado,0));
  falta := greatest(r.qtd-coberto-comprado-baixa,0);
  IF falta>0 AND r.fornecedor_id IS NULL THEN RAISE EXCEPTION 'Cadastre o fornecedor do produto % para gerar a compra.',r.nome; END IF;
  IF baixa>0 THEN
   INSERT INTO public.estoque_movimentos(produto_id,tipo,quantidade,origem,documento,observacoes,created_by) VALUES(r.id,'saida',baixa,'venda',v.numero,'Baixa na confirmação do pedido',auth.uid());
   qtd_baixas := qtd_baixas+1;
  END IF;
 END LOOP;
 FOR f IN SELECT DISTINCT p.fornecedor_id FROM public.venda_itens i JOIN public.produtos p ON p.id=i.produto_id WHERE i.venda_id=v.id AND p.fornecedor_id IS NOT NULL AND concat(p.tipo,' ',p.categoria) !~* 'servi' LOOP
  total_oc := 0; o := NULL;
  FOR r IN SELECT p.id,p.nome,p.codigo,p.unidade,p.ncm,p.cst,p.cor_pastilha,p.modelo_pastilha,p.preco_custo,sum(i.quantidade) qtd FROM public.venda_itens i JOIN public.produtos p ON p.id=i.produto_id WHERE i.venda_id=v.id AND p.fornecedor_id=f.fornecedor_id AND concat(p.tipo,' ',p.categoria) !~* 'servi' GROUP BY p.id ORDER BY p.id LOOP
   SELECT coalesce(sum(quantidade),0) INTO coberto FROM public.estoque_movimentos WHERE produto_id=r.id AND origem='venda' AND documento=v.numero AND tipo='saida';
   SELECT coalesce(sum(i.quantidade),0) INTO comprado FROM public.ordem_compra_itens i JOIN public.ordens_compra oc ON oc.id=i.ordem_id WHERE i.venda_id=v.id AND i.produto_id=r.id AND oc.status <> 'cancelada';
   falta := greatest(r.qtd-coberto-comprado,0);
   IF falta<=0 THEN CONTINUE; END IF;
   IF o IS NULL THEN
    SELECT 'OC-'||lpad((coalesce(max(substring(numero from '[0-9]+$')::integer),0)+1)::text,3,'0') INTO numero_oc FROM public.ordens_compra;
    INSERT INTO public.ordens_compra(numero,fornecedor_id,fornecedor_nome,data_pedido,status,observacoes,created_by) SELECT numero_oc,f.fornecedor_id,nome,v.data,'pendente','Gerada na confirmação do pedido '||v.numero,auth.uid() FROM public.fornecedores WHERE id=f.fornecedor_id RETURNING id INTO o;
    IF o IS NULL THEN RAISE EXCEPTION 'Fornecedor não disponível para compra.'; END IF;
    resultado := resultado || jsonb_build_array(numero_oc);
   END IF;
   FOR n IN 1..ceil(falta)::integer LOOP
    baixa := least(1,falta-(n-1));
    INSERT INTO public.ordem_compra_itens(ordem_id,produto_id,codigo,descricao,ncm,cst,unidade,quantidade,valor_unitario,total,cliente_id,cliente_nome,venda_id,cor,pastilha) VALUES(o,r.id,r.codigo,r.nome,r.ncm,r.cst,coalesce(r.unidade,'UN'),baixa,coalesce(r.preco_custo,0),baixa*coalesce(r.preco_custo,0),v.cliente_id,v.cliente_nome,v.id,r.cor_pastilha,r.modelo_pastilha);
   END LOOP;
   total_oc := total_oc + falta*coalesce(r.preco_custo,0);
  END LOOP;
  IF o IS NOT NULL THEN UPDATE public.ordens_compra SET valor_produtos=total_oc,valor_total=total_oc,icms_base=total_oc,icms_valor=total_oc*0.18 WHERE id=o; END IF;
 END LOOP;
 UPDATE public.vendas SET compra_estoque_processado_em=now() WHERE id=v.id;
 RETURN jsonb_build_object('baixados',qtd_baixas,'ordensCriadas',resultado);
END $$;
REVOKE ALL ON FUNCTION public.processar_compra_estoque_venda(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.processar_compra_estoque_venda(uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.confirmar_compra_estoque_venda() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
BEGIN
 IF OLD.status_pedido='orcamento' AND NEW.status_pedido IN ('aprovado','em_producao','concluido') THEN PERFORM public.processar_compra_estoque_venda(NEW.id); END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER trg_confirmar_compra_estoque_venda AFTER UPDATE OF status_pedido ON public.vendas FOR EACH ROW EXECUTE FUNCTION public.confirmar_compra_estoque_venda();