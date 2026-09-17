ALTER TABLE public.obras ADD COLUMN selecionada boolean NOT NULL DEFAULT true;
ALTER TABLE public.obras ADD COLUMN board_os_id uuid REFERENCES public.ordens_servico(id) ON DELETE SET NULL;
CREATE OR REPLACE FUNCTION public.selecionar_obra_board(p_venda uuid, p_obra uuid, p_selecionada boolean) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.obras%ROWTYPE; v public.vendas%ROWTYPE; osid uuid; osnum text; seq integer;
BEGIN
IF auth.uid() IS NULL OR NOT public.tem_area(auth.uid(),'logistica') THEN RAISE EXCEPTION 'Sem permissão para gerir obras'; END IF;
PERFORM pg_advisory_xact_lock(718293);
IF p_obra IS NOT NULL THEN SELECT * INTO o FROM public.obras WHERE id=p_obra FOR UPDATE;
ELSE SELECT * INTO o FROM public.obras WHERE venda_id=p_venda ORDER BY created_at LIMIT 1 FOR UPDATE; END IF;
IF o.id IS NULL THEN
IF NOT p_selecionada THEN RETURN NULL; END IF;
SELECT * INTO v FROM public.vendas WHERE id=p_venda;
IF v.id IS NULL THEN RAISE EXCEPTION 'Pedido não encontrado'; END IF;
SELECT COALESCE(MAX(substring(numero from '^OBRA-([0-9]+)$')::integer),0)+1 INTO seq FROM public.obras;
INSERT INTO public.obras(numero,venda_id,cliente_id,cliente_nome,tipo_servico,data_pedido,prazo_dias,data_limite,status_geral,created_by) VALUES ('OBRA-'||lpad(seq::text,3,'0'),v.id,v.cliente_id,v.cliente_nome,'Serviço externo',CURRENT_DATE,30,CURRENT_DATE+30,'Agendado',auth.uid()) RETURNING * INTO o;
END IF;
IF p_selecionada THEN
SELECT id,numero INTO osid,osnum FROM public.ordens_servico WHERE id=o.board_os_id OR (o.venda_id IS NOT NULL AND venda_id=o.venda_id) ORDER BY created_at LIMIT 1;
IF osid IS NULL THEN
osnum := 'OS-'||o.numero;
INSERT INTO public.ordens_servico(numero,venda_id,cliente_id,cliente_nome,tipo_servico,descricao,status,prioridade,data_agendada,created_by) VALUES(osnum,o.venda_id,o.cliente_id,o.cliente_nome,o.tipo_servico,'Flight Board '||o.numero,'aprovado','media',COALESCE(o.instalacao_inicio,o.escavacao_inicio,o.data_limite),auth.uid()) RETURNING id INTO osid;
END IF;
UPDATE public.obras SET selecionada=true, board_os_id=osid, os_instalacao=osnum WHERE id=o.id;
ELSE
UPDATE public.obras SET selecionada=false WHERE id=o.id;
END IF;
RETURN o.id;
END $$;
REVOKE ALL ON FUNCTION public.selecionar_obra_board(uuid,uuid,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.selecionar_obra_board(uuid,uuid,boolean) TO authenticated;