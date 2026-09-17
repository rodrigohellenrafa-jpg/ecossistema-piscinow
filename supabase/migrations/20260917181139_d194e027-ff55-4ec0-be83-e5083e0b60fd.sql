ALTER FUNCTION public.selecionar_obra_board(uuid,uuid,boolean) RENAME TO selecionar_obra_board_interno;
CREATE FUNCTION public.selecionar_obra_board(p_venda uuid DEFAULT NULL,p_obra uuid DEFAULT NULL,p_selecionada boolean DEFAULT true) RETURNS uuid LANGUAGE sql SECURITY INVOKER SET search_path=public AS $$ SELECT public.selecionar_obra_board_interno(p_venda,p_obra,p_selecionada) $$;
REVOKE ALL ON FUNCTION public.selecionar_obra_board(uuid,uuid,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.selecionar_obra_board(uuid,uuid,boolean) TO authenticated;