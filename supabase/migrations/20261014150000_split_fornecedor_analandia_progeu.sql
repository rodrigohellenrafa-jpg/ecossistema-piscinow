-- Migration: Split automático por Fornecedor (Analândia para piscinas, Progeu para filtros/acessórios)
-- e suporte a venda_kit no processar_compra_estoque_venda

-- 1. Garante fornecedor Analândia
INSERT INTO public.fornecedores (nome, contato, observacoes, ativo)
SELECT 'Analândia', 'Fábrica Analândia', 'Fornecedor oficial de cascos de piscina', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.fornecedores WHERE nome ILIKE '%analandia%' OR nome ILIKE '%analândia%'
);

-- 2. Garante fornecedor Progeu
INSERT INTO public.fornecedores (nome, contato, observacoes, ativo)
SELECT 'Progeu', 'Fábrica Progeu', 'Fornecedor oficial de filtros, bombas e acessórios', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.fornecedores WHERE nome ILIKE '%progeu%'
);

-- 3. Atualiza RPC atômica processar_compra_estoque_venda com desmembramento inteligente
CREATE OR REPLACE FUNCTION public.processar_compra_estoque_venda(p_venda_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE
  v public.vendas%ROWTYPE;
  vk public.venda_kit%ROWTYPE;
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
  id_analandia uuid;
  id_progeu uuid;
  acessorio_item jsonb;
  ac_prod_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Entre no sistema para confirmar a venda.'; END IF;
  SELECT * INTO v FROM public.vendas WHERE id=p_venda_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pedido não encontrado ou sem permissão.'; END IF;
  IF v.status_pedido NOT IN ('aprovado','em_producao','concluido') THEN RAISE EXCEPTION 'Confirme a venda antes de gerar a compra.'; END IF;
  IF v.compra_estoque_processado_em IS NOT NULL THEN RETURN jsonb_build_object('baixados',0,'ordensCriadas','[]'::jsonb); END IF;
  
  -- Localiza os IDs padrão de Analândia e Progeu
  SELECT id INTO id_analandia FROM public.fornecedores WHERE nome ILIKE '%analandia%' OR nome ILIKE '%analândia%' LIMIT 1;
  SELECT id INTO id_progeu FROM public.fornecedores WHERE nome ILIKE '%progeu%' LIMIT 1;

  -- Se existirem itens em venda_kit que não estão em venda_itens, complementa venda_itens para garantir fluxo unificado
  SELECT * INTO vk FROM public.venda_kit WHERE venda_id=v.id LIMIT 1;
  IF FOUND THEN
    -- Casco da piscina -> Analândia
    IF vk.casco_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.venda_itens WHERE venda_id=v.id AND produto_id=vk.casco_id) THEN
      INSERT INTO public.venda_itens (venda_id, produto_id, quantidade, preco_unitario, total)
      SELECT v.id, p.id, 1, coalesce(p.preco_venda, 0), coalesce(p.preco_venda, 0)
      FROM public.produtos p WHERE p.id = vk.casco_id;
    END IF;

    -- Filtro / bomba -> Progeu
    IF vk.filtro_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.venda_itens WHERE venda_id=v.id AND produto_id=vk.filtro_id) THEN
      INSERT INTO public.venda_itens (venda_id, produto_id, quantidade, preco_unitario, total)
      SELECT v.id, p.id, 1, coalesce(p.preco_venda, 0), coalesce(p.preco_venda, 0)
      FROM public.produtos p WHERE p.id = vk.filtro_id;
    END IF;

    -- Acessórios do kit -> Progeu
    IF vk.acessorios IS NOT NULL AND jsonb_typeof(vk.acessorios) = 'array' THEN
      FOR acessorio_item IN SELECT * FROM jsonb_array_elements(vk.acessorios) LOOP
        ac_prod_id := NULL;
        IF acessorio_item ? 'produto_id' AND (acessorio_item->>'produto_id') IS NOT NULL AND (acessorio_item->>'produto_id') <> '' THEN
          BEGIN
            ac_prod_id := (acessorio_item->>'produto_id')::uuid;
          EXCEPTION WHEN OTHERS THEN
            ac_prod_id := NULL;
          END;
        END IF;

        IF ac_prod_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.venda_itens WHERE venda_id=v.id AND produto_id=ac_prod_id) THEN
          INSERT INTO public.venda_itens (venda_id, produto_id, quantidade, preco_unitario, total)
          SELECT v.id, p.id, 1, coalesce((acessorio_item->>'valor')::numeric, p.preco_venda, 0), coalesce((acessorio_item->>'valor')::numeric, p.preco_venda, 0)
          FROM public.produtos p WHERE p.id = ac_prod_id;
        END IF;
      END LOOP;
    END IF;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.venda_itens WHERE venda_id=v.id) THEN
    RAISE EXCEPTION 'Adicione ao menos um produto antes de vender.';
  END IF;

  PERFORM pg_advisory_xact_lock(73918261);

  -- 1) Baixa no estoque para produtos com disponibilidade
  FOR r IN SELECT p.id, p.nome, p.tipo, p.categoria, p.fornecedor_id, sum(i.quantidade) qtd FROM public.venda_itens i JOIN public.produtos p ON p.id=i.produto_id WHERE i.venda_id=v.id GROUP BY p.id ORDER BY p.id LOOP
    IF concat(r.tipo,' ',r.categoria) ~* 'servi' THEN CONTINUE; END IF;
    SELECT greatest(coalesce(estoque_atual,0),0) INTO disponivel FROM public.produtos WHERE id=r.id FOR UPDATE;
    SELECT coalesce(sum(quantidade),0) INTO coberto FROM public.estoque_movimentos WHERE produto_id=r.id AND origem='venda' AND documento=v.numero AND tipo='saida';
    SELECT coalesce(sum(i.quantidade),0) INTO comprado FROM public.ordem_compra_itens i JOIN public.ordens_compra oc ON oc.id=i.ordem_id WHERE i.venda_id=v.id AND i.produto_id=r.id AND oc.status <> 'cancelada';
    baixa := least(disponivel,greatest(r.qtd-coberto-comprado,0));
    falta := greatest(r.qtd-coberto-comprado-baixa,0);
    
    -- Se falta e fornecedor não está explicitamente setado, aplica split inteligente
    IF falta > 0 AND r.fornecedor_id IS NULL THEN
      IF (r.categoria ILIKE '%piscina%' OR r.nome ILIKE '%piscina%') AND id_analandia IS NOT NULL THEN
        UPDATE public.produtos SET fornecedor_id = id_analandia WHERE id = r.id;
      ELSIF id_progeu IS NOT NULL THEN
        UPDATE public.produtos SET fornecedor_id = id_progeu WHERE id = r.id;
      END IF;
    END IF;

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
  FOR f IN
    SELECT DISTINCT
      COALESCE(
        p.fornecedor_id,
        CASE
          WHEN p.categoria ILIKE '%piscina%' OR p.nome ILIKE '%piscina%' THEN id_analandia
          ELSE id_progeu
        END
      ) AS fornecedor_id
    FROM public.venda_itens i
    JOIN public.produtos p ON p.id=i.produto_id
    WHERE i.venda_id=v.id AND concat(p.tipo,' ',p.categoria) !~* 'servi'
      AND COALESCE(
        p.fornecedor_id,
        CASE
          WHEN p.categoria ILIKE '%piscina%' OR p.nome ILIKE '%piscina%' THEN id_analandia
          ELSE id_progeu
        END
      ) IS NOT NULL
  LOOP
    total_oc := 0;
    o := NULL;
    numero_oc := NULL;

    FOR r IN
      SELECT
        p.id, p.nome, p.codigo, p.unidade, p.ncm, p.cst, p.cor_pastilha, p.modelo_pastilha, p.preco_custo,
        sum(i.quantidade) qtd
      FROM public.venda_itens i
      JOIN public.produtos p ON p.id=i.produto_id
      WHERE i.venda_id=v.id
        AND COALESCE(
          p.fornecedor_id,
          CASE
            WHEN p.categoria ILIKE '%piscina%' OR p.nome ILIKE '%piscina%' THEN id_analandia
            ELSE id_progeu
          END
        ) = f.fornecedor_id
        AND concat(p.tipo,' ',p.categoria) !~* 'servi'
      GROUP BY p.id, p.nome, p.codigo, p.unidade, p.ncm, p.cst, p.cor_pastilha, p.modelo_pastilha, p.preco_custo
      ORDER BY p.id
    LOOP
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
          IF numero_oc_cliente IS NOT NULL THEN
            numero_oc := numero_oc_cliente;
          ELSE
            SELECT 'OC-'||lpad((coalesce(max(substring(numero from '[0-9]+$')::integer),0)+1)::text,3,'0') INTO numero_oc FROM public.ordens_compra;
            numero_oc_cliente := numero_oc;
          END IF;

          INSERT INTO public.ordens_compra(numero,fornecedor_id,fornecedor_nome,data_pedido,status,status_carga,observacoes,created_by)
          SELECT numero_oc,f.fornecedor_id,nome,v.data,'pendente','pendente_carga','Gerada na confirmação do pedido '||v.numero,auth.uid()
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
        INSERT INTO public.ordem_compra_itens(ordem_id,produto_id,codigo,descricao,ncm,cst,unidade,quantidade,valor_unitario,total,cliente_id,cliente_nome,venda_id,cor,pastilha,status_carga)
        VALUES(o,r.id,r.codigo,r.nome,r.ncm,r.cst,coalesce(r.unidade,'UN'),baixa,coalesce(r.preco_custo,0),baixa*coalesce(r.preco_custo,0),v.cliente_id,v.cliente_nome,v.id,r.cor_pastilha,r.modelo_pastilha,'pendente_carga');
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
