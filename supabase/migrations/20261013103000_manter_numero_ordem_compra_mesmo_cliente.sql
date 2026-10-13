-- Migration: Manter o mesmo número de ordem de compra quando o pedido for vinculado ao mesmo cliente
-- Remove restrição de unicidade global de número na tabela de ordens de compra para permitir
-- que múltiplas ordens (por fornecedor) pertencentes ao mesmo cliente compartilhem o mesmo número identificador.

ALTER TABLE public.ordens_compra DROP CONSTRAINT IF EXISTS ordens_compra_numero_key;
DROP INDEX IF EXISTS public.ordens_compra_numero_key;

CREATE OR REPLACE FUNCTION public.processar_compra_estoque_venda(p_venda_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE
  v public.vendas%ROWTYPE;
  r record;
  f record;
  o uuid;
  numero_oc text;
  numero_oc_cliente text := NULL;
  total_oc numeric;
  disponivel numeric;
  baixa numeric;
  falta numeric;
  coberto numeric;
  comprado numeric;
  n integer;
  resultado jsonb := '[]'::jsonb;
  qtd_baixas integer := 0;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Entre no sistema para confirmar a venda.'; END IF;
  SELECT * INTO v FROM public.vendas WHERE id=p_venda_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pedido não encontrado ou sem permissão.'; END IF;
  IF v.status_pedido NOT IN ('aprovado','em_producao','concluido') THEN RAISE EXCEPTION 'Confirme a venda antes de gerar a compra.'; END IF;
  IF v.compra_estoque_processado_em IS NOT NULL THEN RETURN jsonb_build_object('baixados',0,'ordensCriadas','[]'::jsonb); END IF;
  IF NOT EXISTS (SELECT 1 FROM public.venda_itens WHERE venda_id=v.id) THEN RAISE EXCEPTION 'Adicione ao menos um produto antes de vender.'; END IF;
  PERFORM pg_advisory_xact_lock(73918261);

  -- 1) Baixa no estoque para produtos com disponibilidade
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

  -- 2) Busca se este cliente já possui algum número de ordem de compra emitido no sistema
  SELECT oc.numero INTO numero_oc_cliente
  FROM public.ordens_compra oc
  JOIN public.ordem_compra_itens oci ON oci.ordem_id = oc.id
  WHERE (
    (v.cliente_id IS NOT NULL AND oci.cliente_id = v.cliente_id)
    OR (v.cliente_nome IS NOT NULL AND oci.cliente_nome = v.cliente_nome)
    OR oci.venda_id = v.id
  )
  AND oc.status <> 'cancelada'
  AND oc.numero IS NOT NULL
  ORDER BY oc.created_at DESC
  LIMIT 1;

  -- 3) Gera ou complementa as ordens de compra por fornecedor
  FOR f IN SELECT DISTINCT p.fornecedor_id FROM public.venda_itens i JOIN public.produtos p ON p.id=i.produto_id WHERE i.venda_id=v.id AND p.fornecedor_id IS NOT NULL AND concat(p.tipo,' ',p.categoria) !~* 'servi' LOOP
    total_oc := 0;
    o := NULL;
    numero_oc := NULL;

    FOR r IN SELECT p.id,p.nome,p.codigo,p.unidade,p.ncm,p.cst,p.cor_pastilha,p.modelo_pastilha,p.preco_custo,sum(i.quantidade) qtd FROM public.venda_itens i JOIN public.produtos p ON p.id=i.produto_id WHERE i.venda_id=v.id AND p.fornecedor_id=f.fornecedor_id AND concat(p.tipo,' ',p.categoria) !~* 'servi' GROUP BY p.id ORDER BY p.id LOOP
      SELECT coalesce(sum(quantidade),0) INTO coberto FROM public.estoque_movimentos WHERE produto_id=r.id AND origem='venda' AND documento=v.numero AND tipo='saida';
      SELECT coalesce(sum(i.quantidade),0) INTO comprado FROM public.ordem_compra_itens i JOIN public.ordens_compra oc ON oc.id=i.ordem_id WHERE i.venda_id=v.id AND i.produto_id=r.id AND oc.status <> 'cancelada';
      falta := greatest(r.qtd-coberto-comprado,0);
      IF falta<=0 THEN CONTINUE; END IF;

      -- Verifica se já existe ordem ativa deste cliente com este fornecedor
      IF o IS NULL THEN
        SELECT oc.id, oc.numero INTO o, numero_oc
        FROM public.ordens_compra oc
        JOIN public.ordem_compra_itens oci ON oci.ordem_id = oc.id
        WHERE oc.fornecedor_id = f.fornecedor_id
          AND oc.status <> 'cancelada'
          AND (
            (v.cliente_id IS NOT NULL AND oci.cliente_id = v.cliente_id)
            OR (v.cliente_nome IS NOT NULL AND oci.cliente_nome = v.cliente_nome)
            OR oci.venda_id = v.id
          )
        ORDER BY oc.created_at DESC
        LIMIT 1;

        -- Se não existe ordem deste fornecedor para o cliente, cria nova
        IF o IS NULL THEN
          -- Mantém o mesmo número se o cliente já tiver ordem emitida; senão gera o próximo
          IF numero_oc_cliente IS NOT NULL THEN
            numero_oc := numero_oc_cliente;
          ELSE
            SELECT 'OC-'||lpad((coalesce(max(substring(numero from '[0-9]+$')::integer),0)+1)::text,3,'0') INTO numero_oc FROM public.ordens_compra;
            numero_oc_cliente := numero_oc; -- Garante que os demais fornecedores deste cliente na mesma venda tenham o mesmo número
          END IF;

          INSERT INTO public.ordens_compra(numero,fornecedor_id,fornecedor_nome,data_pedido,status,observacoes,created_by)
          SELECT numero_oc,f.fornecedor_id,nome,v.data,'pendente','Gerada na confirmação do pedido '||v.numero,auth.uid()
          FROM public.fornecedores WHERE id=f.fornecedor_id
          RETURNING id INTO o;

          IF o IS NULL THEN RAISE EXCEPTION 'Fornecedor não disponível para compra.'; END IF;
        END IF;

        IF NOT resultado ? numero_oc THEN
          resultado := resultado || jsonb_build_array(numero_oc);
        END IF;
      END IF;

      FOR n IN 1..ceil(falta)::integer LOOP
        baixa := least(1,falta-(n-1));
        INSERT INTO public.ordem_compra_itens(ordem_id,produto_id,codigo,descricao,ncm,cst,unidade,quantidade,valor_unitario,total,cliente_id,cliente_nome,venda_id,cor,pastilha)
        VALUES(o,r.id,r.codigo,r.nome,r.ncm,r.cst,coalesce(r.unidade,'UN'),baixa,coalesce(r.preco_custo,0),baixa*coalesce(r.preco_custo,0),v.cliente_id,v.cliente_nome,v.id,r.cor_pastilha,r.modelo_pastilha);
      END LOOP;
    END LOOP;

    -- Recalcula e atualiza o total da ordem de compra
    IF o IS NOT NULL THEN
      SELECT coalesce(sum(total),0) INTO total_oc FROM public.ordem_compra_itens WHERE ordem_id = o;
      UPDATE public.ordens_compra SET valor_produtos=total_oc, valor_total=total_oc, icms_base=total_oc, icms_valor=total_oc*0.18 WHERE id=o;
    END IF;
  END LOOP;

  UPDATE public.vendas SET compra_estoque_processado_em=now() WHERE id=v.id;
  RETURN jsonb_build_object('baixados',qtd_baixas,'ordensCriadas',resultado);
END $$;
