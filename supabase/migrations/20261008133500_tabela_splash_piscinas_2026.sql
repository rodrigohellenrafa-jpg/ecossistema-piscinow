-- Migration: Cadastro da Tabela de Preços Splash Piscinas by iGUI 2026
-- Garante fornecedor Splash Piscinas
DO $$
DECLARE
  v_fornecedor_id uuid;
BEGIN
  SELECT id INTO v_fornecedor_id FROM public.fornecedores WHERE nome ILIKE '%Splash%' LIMIT 1;
  IF v_fornecedor_id IS NULL THEN
    INSERT INTO public.fornecedores (nome, contato, observacoes, ativo)
    VALUES ('Splash Piscinas by iGUI', 'Fábrica Splash', 'Fornecedor oficial de piscinas em fibra Splash by iGUI', true)
    RETURNING id INTO v_fornecedor_id;
  END IF;

  -- SPL-ITA-250
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-ITA-250' OR nome = 'Piscina Splash Italiana 2,50m x 1,50m x 0,30m') THEN
    UPDATE public.produtos
    SET preco_venda = 4165,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Italiana. Medidas: 2,50m x 1,50m x 0,30m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-ITA-250' OR nome = 'Piscina Splash Italiana 2,50m x 1,50m x 0,30m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-ITA-250', 'Piscina Splash Italiana 2,50m x 1,50m x 0,30m', 'Piscinas', 'produto', 'UN', 0, 4165, 0, 0, true, true, 'Piscina em fibra de vidro modelo Italiana. Medidas: 2,50m x 1,50m x 0,30m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-ITA-300
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-ITA-300' OR nome = 'Piscina Splash Italiana 3,00m x 2,00m x 0,60m') THEN
    UPDATE public.produtos
    SET preco_venda = 10526,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Italiana. Medidas: 3,00m x 2,00m x 0,60m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-ITA-300' OR nome = 'Piscina Splash Italiana 3,00m x 2,00m x 0,60m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-ITA-300', 'Piscina Splash Italiana 3,00m x 2,00m x 0,60m', 'Piscinas', 'produto', 'UN', 0, 10526, 0, 0, true, true, 'Piscina em fibra de vidro modelo Italiana. Medidas: 3,00m x 2,00m x 0,60m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-ITA-320
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-ITA-320' OR nome = 'Piscina Splash Italiana 3,20m x 2,00m x 1,30m') THEN
    UPDATE public.produtos
    SET preco_venda = 13720,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Italiana. Medidas: 3,20m x 2,00m x 1,30m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-ITA-320' OR nome = 'Piscina Splash Italiana 3,20m x 2,00m x 1,30m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-ITA-320', 'Piscina Splash Italiana 3,20m x 2,00m x 1,30m', 'Piscinas', 'produto', 'UN', 0, 13720, 0, 0, true, true, 'Piscina em fibra de vidro modelo Italiana. Medidas: 3,20m x 2,00m x 1,30m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-ITA-350
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-ITA-350' OR nome = 'Piscina Splash Italiana 3,50m x 2,00m x 0,80m') THEN
    UPDATE public.produtos
    SET preco_venda = 12735,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Italiana. Medidas: 3,50m x 2,00m x 0,80m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-ITA-350' OR nome = 'Piscina Splash Italiana 3,50m x 2,00m x 0,80m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-ITA-350', 'Piscina Splash Italiana 3,50m x 2,00m x 0,80m', 'Piscinas', 'produto', 'UN', 0, 12735, 0, 0, true, true, 'Piscina em fibra de vidro modelo Italiana. Medidas: 3,50m x 2,00m x 0,80m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-ITA-400
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-ITA-400' OR nome = 'Piscina Splash Italiana 4,00m x 2,40m x 1,30m') THEN
    UPDATE public.produtos
    SET preco_venda = 15977,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Italiana. Medidas: 4,00m x 2,40m x 1,30m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-ITA-400' OR nome = 'Piscina Splash Italiana 4,00m x 2,40m x 1,30m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-ITA-400', 'Piscina Splash Italiana 4,00m x 2,40m x 1,30m', 'Piscinas', 'produto', 'UN', 0, 15977, 0, 0, true, true, 'Piscina em fibra de vidro modelo Italiana. Medidas: 4,00m x 2,40m x 1,30m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-ITA-500
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-ITA-500' OR nome = 'Piscina Splash Italiana 5,00m x 2,80m x 1,30m') THEN
    UPDATE public.produtos
    SET preco_venda = 19604,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Italiana. Medidas: 5,00m x 2,80m x 1,30m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-ITA-500' OR nome = 'Piscina Splash Italiana 5,00m x 2,80m x 1,30m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-ITA-500', 'Piscina Splash Italiana 5,00m x 2,80m x 1,30m', 'Piscinas', 'produto', 'UN', 0, 19604, 0, 0, true, true, 'Piscina em fibra de vidro modelo Italiana. Medidas: 5,00m x 2,80m x 1,30m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-ITA-600
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-ITA-600' OR nome = 'Piscina Splash Italiana 6,00m x 3,00m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 23354,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Italiana. Medidas: 6,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-ITA-600' OR nome = 'Piscina Splash Italiana 6,00m x 3,00m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-ITA-600', 'Piscina Splash Italiana 6,00m x 3,00m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 23354, 0, 0, true, true, 'Piscina em fibra de vidro modelo Italiana. Medidas: 6,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-ITA-700
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-ITA-700' OR nome = 'Piscina Splash Italiana 7,00m x 3,50m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 28909,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Italiana. Medidas: 7,00m x 3,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-ITA-700' OR nome = 'Piscina Splash Italiana 7,00m x 3,50m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-ITA-700', 'Piscina Splash Italiana 7,00m x 3,50m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 28909, 0, 0, true, true, 'Piscina em fibra de vidro modelo Italiana. Medidas: 7,00m x 3,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-ITA-800
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-ITA-800' OR nome = 'Piscina Splash Italiana 8,00m x 4,00m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 33856,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Italiana. Medidas: 8,00m x 4,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-ITA-800' OR nome = 'Piscina Splash Italiana 8,00m x 4,00m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-ITA-800', 'Piscina Splash Italiana 8,00m x 4,00m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 33856, 0, 0, true, true, 'Piscina em fibra de vidro modelo Italiana. Medidas: 8,00m x 4,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRO-350
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRO-350' OR nome = 'Piscina Splash Tropical 3,50m x 1,80m x 0,80m') THEN
    UPDATE public.produtos
    SET preco_venda = 12362,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tropical. Medidas: 3,50m x 1,80m x 0,80m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRO-350' OR nome = 'Piscina Splash Tropical 3,50m x 1,80m x 0,80m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRO-350', 'Piscina Splash Tropical 3,50m x 1,80m x 0,80m', 'Piscinas', 'produto', 'UN', 0, 12362, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tropical. Medidas: 3,50m x 1,80m x 0,80m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRO-400-100
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRO-400-100' OR nome = 'Piscina Splash Tropical 4,00m x 2,00m x 1,00m') THEN
    UPDATE public.produtos
    SET preco_venda = 13861,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tropical. Medidas: 4,00m x 2,00m x 1,00m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRO-400-100' OR nome = 'Piscina Splash Tropical 4,00m x 2,00m x 1,00m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRO-400-100', 'Piscina Splash Tropical 4,00m x 2,00m x 1,00m', 'Piscinas', 'produto', 'UN', 0, 13861, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tropical. Medidas: 4,00m x 2,00m x 1,00m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRO-400-140
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRO-400-140' OR nome = 'Piscina Splash Tropical 4,00m x 2,00m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 15477,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tropical. Medidas: 4,00m x 2,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRO-400-140' OR nome = 'Piscina Splash Tropical 4,00m x 2,00m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRO-400-140', 'Piscina Splash Tropical 4,00m x 2,00m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 15477, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tropical. Medidas: 4,00m x 2,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRO-500
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRO-500' OR nome = 'Piscina Splash Tropical 5,00m x 2,40m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 18309,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tropical. Medidas: 5,00m x 2,40m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRO-500' OR nome = 'Piscina Splash Tropical 5,00m x 2,40m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRO-500', 'Piscina Splash Tropical 5,00m x 2,40m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 18309, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tropical. Medidas: 5,00m x 2,40m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRO-600-130
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRO-600-130' OR nome = 'Piscina Splash Tropical 6,00m x 2,60m x 1,30m') THEN
    UPDATE public.produtos
    SET preco_venda = 21494,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tropical. Medidas: 6,00m x 2,60m x 1,30m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRO-600-130' OR nome = 'Piscina Splash Tropical 6,00m x 2,60m x 1,30m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRO-600-130', 'Piscina Splash Tropical 6,00m x 2,60m x 1,30m', 'Piscinas', 'produto', 'UN', 0, 21494, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tropical. Medidas: 6,00m x 2,60m x 1,30m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRO-600-140
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRO-600-140' OR nome = 'Piscina Splash Tropical 6,00m x 2,60m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 21867,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tropical. Medidas: 6,00m x 2,60m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRO-600-140' OR nome = 'Piscina Splash Tropical 6,00m x 2,60m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRO-600-140', 'Piscina Splash Tropical 6,00m x 2,60m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 21867, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tropical. Medidas: 6,00m x 2,60m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRO-700
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRO-700' OR nome = 'Piscina Splash Tropical 7,00m x 2,80m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 26730,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tropical. Medidas: 7,00m x 2,80m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRO-700' OR nome = 'Piscina Splash Tropical 7,00m x 2,80m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRO-700', 'Piscina Splash Tropical 7,00m x 2,80m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 26730, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tropical. Medidas: 7,00m x 2,80m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRO-800
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRO-800' OR nome = 'Piscina Splash Tropical 8,00m x 3,00m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 31665,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tropical. Medidas: 8,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRO-800' OR nome = 'Piscina Splash Tropical 8,00m x 3,00m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRO-800', 'Piscina Splash Tropical 8,00m x 3,00m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 31665, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tropical. Medidas: 8,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRO-900
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRO-900' OR nome = 'Piscina Splash Tropical 9,00m x 3,50m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 36075,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tropical. Medidas: 9,00m x 3,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRO-900' OR nome = 'Piscina Splash Tropical 9,00m x 3,50m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRO-900', 'Piscina Splash Tropical 9,00m x 3,50m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 36075, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tropical. Medidas: 9,00m x 3,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRO-1000
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRO-1000' OR nome = 'Piscina Splash Tropical 10,00m x 4,00m x 1,30m') THEN
    UPDATE public.produtos
    SET preco_venda = 42299,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tropical. Medidas: 10,00m x 4,00m x 1,30m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRO-1000' OR nome = 'Piscina Splash Tropical 10,00m x 4,00m x 1,30m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRO-1000', 'Piscina Splash Tropical 10,00m x 4,00m x 1,30m', 'Piscinas', 'produto', 'UN', 0, 42299, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tropical. Medidas: 10,00m x 4,00m x 1,30m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-FDB-400
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-FDB-400' OR nome = 'Piscina Splash Farol da Barra 4,00m x 2,00m x 1,20m') THEN
    UPDATE public.produtos
    SET preco_venda = 15850,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Farol da Barra. Medidas: 4,00m x 2,00m x 1,20m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-FDB-400' OR nome = 'Piscina Splash Farol da Barra 4,00m x 2,00m x 1,20m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-FDB-400', 'Piscina Splash Farol da Barra 4,00m x 2,00m x 1,20m', 'Piscinas', 'produto', 'UN', 0, 15850, 0, 0, true, true, 'Piscina em fibra de vidro modelo Farol da Barra. Medidas: 4,00m x 2,00m x 1,20m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-FDB-500
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-FDB-500' OR nome = 'Piscina Splash Farol da Barra 5,00m x 2,50m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 19852,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Farol da Barra. Medidas: 5,00m x 2,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-FDB-500' OR nome = 'Piscina Splash Farol da Barra 5,00m x 2,50m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-FDB-500', 'Piscina Splash Farol da Barra 5,00m x 2,50m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 19852, 0, 0, true, true, 'Piscina em fibra de vidro modelo Farol da Barra. Medidas: 5,00m x 2,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-FDB-600
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-FDB-600' OR nome = 'Piscina Splash Farol da Barra 6,00m x 3,00m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 23728,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Farol da Barra. Medidas: 6,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-FDB-600' OR nome = 'Piscina Splash Farol da Barra 6,00m x 3,00m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-FDB-600', 'Piscina Splash Farol da Barra 6,00m x 3,00m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 23728, 0, 0, true, true, 'Piscina em fibra de vidro modelo Farol da Barra. Medidas: 6,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-FDB-700
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-FDB-700' OR nome = 'Piscina Splash Farol da Barra 7,00m x 3,50m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 30526,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Farol da Barra. Medidas: 7,00m x 3,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-FDB-700' OR nome = 'Piscina Splash Farol da Barra 7,00m x 3,50m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-FDB-700', 'Piscina Splash Farol da Barra 7,00m x 3,50m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 30526, 0, 0, true, true, 'Piscina em fibra de vidro modelo Farol da Barra. Medidas: 7,00m x 3,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-FDB-800
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-FDB-800' OR nome = 'Piscina Splash Farol da Barra 8,00m x 4,00m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 35964,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Farol da Barra. Medidas: 8,00m x 4,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-FDB-800' OR nome = 'Piscina Splash Farol da Barra 8,00m x 4,00m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-FDB-800', 'Piscina Splash Farol da Barra 8,00m x 4,00m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 35964, 0, 0, true, true, 'Piscina em fibra de vidro modelo Farol da Barra. Medidas: 8,00m x 4,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-FDB-900
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-FDB-900' OR nome = 'Piscina Splash Farol da Barra 9,00m x 4,25m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 40263,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Farol da Barra. Medidas: 9,00m x 4,25m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-FDB-900' OR nome = 'Piscina Splash Farol da Barra 9,00m x 4,25m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-FDB-900', 'Piscina Splash Farol da Barra 9,00m x 4,25m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 40263, 0, 0, true, true, 'Piscina em fibra de vidro modelo Farol da Barra. Medidas: 9,00m x 4,25m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-FDB-1000
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-FDB-1000' OR nome = 'Piscina Splash Farol da Barra 10,00m x 4,30m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 48852,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Farol da Barra. Medidas: 10,00m x 4,30m x 1,40m (largura 4,50m em algumas regiões). Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-FDB-1000' OR nome = 'Piscina Splash Farol da Barra 10,00m x 4,30m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-FDB-1000', 'Piscina Splash Farol da Barra 10,00m x 4,30m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 48852, 0, 0, true, true, 'Piscina em fibra de vidro modelo Farol da Barra. Medidas: 10,00m x 4,30m x 1,40m (largura 4,50m em algumas regiões). Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-350-100
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-350-100' OR nome = 'Piscina Splash Tradicional 3,50m x 1,80m x 1,00m') THEN
    UPDATE public.produtos
    SET preco_venda = 13730,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional. Medidas: 3,50m x 1,80m x 1,00m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-350-100' OR nome = 'Piscina Splash Tradicional 3,50m x 1,80m x 1,00m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-350-100', 'Piscina Splash Tradicional 3,50m x 1,80m x 1,00m', 'Piscinas', 'produto', 'UN', 0, 13730, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional. Medidas: 3,50m x 1,80m x 1,00m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-350-140
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-350-140' OR nome = 'Piscina Splash Tradicional 3,50m x 1,80m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 14485,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional. Medidas: 3,50m x 1,80m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-350-140' OR nome = 'Piscina Splash Tradicional 3,50m x 1,80m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-350-140', 'Piscina Splash Tradicional 3,50m x 1,80m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 14485, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional. Medidas: 3,50m x 1,80m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-400-100
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-400-100' OR nome = 'Piscina Splash Tradicional 4,00m x 2,00m x 1,00m') THEN
    UPDATE public.produtos
    SET preco_venda = 14862,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional. Medidas: 4,00m x 2,00m x 1,00m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-400-100' OR nome = 'Piscina Splash Tradicional 4,00m x 2,00m x 1,00m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-400-100', 'Piscina Splash Tradicional 4,00m x 2,00m x 1,00m', 'Piscinas', 'produto', 'UN', 0, 14862, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional. Medidas: 4,00m x 2,00m x 1,00m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-400-140
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-400-140' OR nome = 'Piscina Splash Tradicional 4,00m x 2,00m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 16104,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional. Medidas: 4,00m x 2,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-400-140' OR nome = 'Piscina Splash Tradicional 4,00m x 2,00m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-400-140', 'Piscina Splash Tradicional 4,00m x 2,00m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 16104, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional. Medidas: 4,00m x 2,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-450-100
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-450-100' OR nome = 'Piscina Splash Tradicional 4,50m x 2,15m x 1,00m') THEN
    UPDATE public.produtos
    SET preco_venda = 16291,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional. Medidas: 4,50m x 2,15m x 1,00m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-450-100' OR nome = 'Piscina Splash Tradicional 4,50m x 2,15m x 1,00m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-450-100', 'Piscina Splash Tradicional 4,50m x 2,15m x 1,00m', 'Piscinas', 'produto', 'UN', 0, 16291, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional. Medidas: 4,50m x 2,15m x 1,00m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-500-120
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-500-120' OR nome = 'Piscina Splash Tradicional 5,00m x 2,25m x 1,20m') THEN
    UPDATE public.produtos
    SET preco_venda = 19233,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional. Medidas: 5,00m x 2,25m x 1,20m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-500-120' OR nome = 'Piscina Splash Tradicional 5,00m x 2,25m x 1,20m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-500-120', 'Piscina Splash Tradicional 5,00m x 2,25m x 1,20m', 'Piscinas', 'produto', 'UN', 0, 19233, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional. Medidas: 5,00m x 2,25m x 1,20m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-500-140
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-500-140' OR nome = 'Piscina Splash Tradicional 5,00m x 2,25m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 20228,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional. Medidas: 5,00m x 2,25m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-500-140' OR nome = 'Piscina Splash Tradicional 5,00m x 2,25m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-500-140', 'Piscina Splash Tradicional 5,00m x 2,25m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 20228, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional. Medidas: 5,00m x 2,25m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-550-120
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-550-120' OR nome = 'Piscina Splash Tradicional 5,50m x 2,40m x 1,20m') THEN
    UPDATE public.produtos
    SET preco_venda = 21157,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional. Medidas: 5,50m x 2,40m x 1,20m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-550-120' OR nome = 'Piscina Splash Tradicional 5,50m x 2,40m x 1,20m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-550-120', 'Piscina Splash Tradicional 5,50m x 2,40m x 1,20m', 'Piscinas', 'produto', 'UN', 0, 21157, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional. Medidas: 5,50m x 2,40m x 1,20m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-600
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-600' OR nome = 'Piscina Splash Tradicional 6,00m x 2,50m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 23732,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional. Medidas: 6,00m x 2,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-600' OR nome = 'Piscina Splash Tradicional 6,00m x 2,50m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-600', 'Piscina Splash Tradicional 6,00m x 2,50m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 23732, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional. Medidas: 6,00m x 2,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-600-PRA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-600-PRA' OR nome = 'Piscina Splash Tradicional 6,00m x 2,50m x 1,40m - com Prainha') THEN
    UPDATE public.produtos
    SET preco_venda = 23109,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional com Prainha. Medidas: 6,00m x 2,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-600-PRA' OR nome = 'Piscina Splash Tradicional 6,00m x 2,50m x 1,40m - com Prainha';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-600-PRA', 'Piscina Splash Tradicional 6,00m x 2,50m x 1,40m - com Prainha', 'Piscinas', 'produto', 'UN', 0, 23109, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional com Prainha. Medidas: 6,00m x 2,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-600-SPA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-600-SPA' OR nome = 'Piscina Splash Tradicional 6,00m x 2,50m x 1,40m - com SPA') THEN
    UPDATE public.produtos
    SET preco_venda = 25092,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional com SPA. Medidas: 6,00m x 2,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-600-SPA' OR nome = 'Piscina Splash Tradicional 6,00m x 2,50m x 1,40m - com SPA';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-600-SPA', 'Piscina Splash Tradicional 6,00m x 2,50m x 1,40m - com SPA', 'Piscinas', 'produto', 'UN', 0, 25092, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional com SPA. Medidas: 6,00m x 2,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-650
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-650' OR nome = 'Piscina Splash Tradicional 6,50m x 2,70m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 25533,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional. Medidas: 6,50m x 2,70m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-650' OR nome = 'Piscina Splash Tradicional 6,50m x 2,70m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-650', 'Piscina Splash Tradicional 6,50m x 2,70m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 25533, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional. Medidas: 6,50m x 2,70m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-700
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-700' OR nome = 'Piscina Splash Tradicional 7,00m x 2,75m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 28423,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional. Medidas: 7,00m x 2,75m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-700' OR nome = 'Piscina Splash Tradicional 7,00m x 2,75m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-700', 'Piscina Splash Tradicional 7,00m x 2,75m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 28423, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional. Medidas: 7,00m x 2,75m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-700-PRA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-700-PRA' OR nome = 'Piscina Splash Tradicional 7,00m x 2,90m x 1,40m - com Prainha') THEN
    UPDATE public.produtos
    SET preco_venda = 27920,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional com Prainha. Medidas: 7,00m x 2,90m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-700-PRA' OR nome = 'Piscina Splash Tradicional 7,00m x 2,90m x 1,40m - com Prainha';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-700-PRA', 'Piscina Splash Tradicional 7,00m x 2,90m x 1,40m - com Prainha', 'Piscinas', 'produto', 'UN', 0, 27920, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional com Prainha. Medidas: 7,00m x 2,90m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-700-SPA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-700-SPA' OR nome = 'Piscina Splash Tradicional 7,00m x 2,90m x 1,40m - com SPA') THEN
    UPDATE public.produtos
    SET preco_venda = 30904,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional com SPA. Medidas: 7,00m x 2,90m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-700-SPA' OR nome = 'Piscina Splash Tradicional 7,00m x 2,90m x 1,40m - com SPA';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-700-SPA', 'Piscina Splash Tradicional 7,00m x 2,90m x 1,40m - com SPA', 'Piscinas', 'produto', 'UN', 0, 30904, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional com SPA. Medidas: 7,00m x 2,90m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-750
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-750' OR nome = 'Piscina Splash Tradicional 7,50m x 2,90m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 30472,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional. Medidas: 7,50m x 2,90m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-750' OR nome = 'Piscina Splash Tradicional 7,50m x 2,90m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-750', 'Piscina Splash Tradicional 7,50m x 2,90m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 30472, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional. Medidas: 7,50m x 2,90m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-800
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-800' OR nome = 'Piscina Splash Tradicional 8,00m x 3,00m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 33731,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional. Medidas: 8,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-800' OR nome = 'Piscina Splash Tradicional 8,00m x 3,00m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-800', 'Piscina Splash Tradicional 8,00m x 3,00m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 33731, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional. Medidas: 8,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-800-PRA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-800-PRA' OR nome = 'Piscina Splash Tradicional 8,00m x 3,00m x 1,40m - com Prainha') THEN
    UPDATE public.produtos
    SET preco_venda = 32739,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional com Prainha. Medidas: 8,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-800-PRA' OR nome = 'Piscina Splash Tradicional 8,00m x 3,00m x 1,40m - com Prainha';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-800-PRA', 'Piscina Splash Tradicional 8,00m x 3,00m x 1,40m - com Prainha', 'Piscinas', 'produto', 'UN', 0, 32739, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional com Prainha. Medidas: 8,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-800-SPA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-800-SPA' OR nome = 'Piscina Splash Tradicional 8,00m x 3,00m x 1,40m - com SPA') THEN
    UPDATE public.produtos
    SET preco_venda = 36712,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional com SPA. Medidas: 8,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-800-SPA' OR nome = 'Piscina Splash Tradicional 8,00m x 3,00m x 1,40m - com SPA';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-800-SPA', 'Piscina Splash Tradicional 8,00m x 3,00m x 1,40m - com SPA', 'Piscinas', 'produto', 'UN', 0, 36712, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional com SPA. Medidas: 8,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-850
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-850' OR nome = 'Piscina Splash Tradicional 8,50m x 3,50m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 36282,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional. Medidas: 8,50m x 3,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-850' OR nome = 'Piscina Splash Tradicional 8,50m x 3,50m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-850', 'Piscina Splash Tradicional 8,50m x 3,50m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 36282, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional. Medidas: 8,50m x 3,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-900
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-900' OR nome = 'Piscina Splash Tradicional 9,00m x 4,00m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 39891,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional. Medidas: 9,00m x 4,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-900' OR nome = 'Piscina Splash Tradicional 9,00m x 4,00m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-900', 'Piscina Splash Tradicional 9,00m x 4,00m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 39891, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional. Medidas: 9,00m x 4,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-ATL-350-100
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-ATL-350-100' OR nome = 'Piscina Splash Tradicional 3,50m x 1,80m x 1,00m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 15487,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 3,50m x 1,80m x 1,00m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-ATL-350-100' OR nome = 'Piscina Splash Tradicional 3,50m x 1,80m x 1,00m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-ATL-350-100', 'Piscina Splash Tradicional 3,50m x 1,80m x 1,00m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 15487, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 3,50m x 1,80m x 1,00m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-ATL-350-140
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-ATL-350-140' OR nome = 'Piscina Splash Tradicional 3,50m x 1,80m x 1,40m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 16235,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 3,50m x 1,80m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-ATL-350-140' OR nome = 'Piscina Splash Tradicional 3,50m x 1,80m x 1,40m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-ATL-350-140', 'Piscina Splash Tradicional 3,50m x 1,80m x 1,40m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 16235, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 3,50m x 1,80m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-ATL-400-100
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-ATL-400-100' OR nome = 'Piscina Splash Tradicional 4,00m x 2,00m x 1,00m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 16783,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 4,00m x 2,00m x 1,00m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-ATL-400-100' OR nome = 'Piscina Splash Tradicional 4,00m x 2,00m x 1,00m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-ATL-400-100', 'Piscina Splash Tradicional 4,00m x 2,00m x 1,00m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 16783, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 4,00m x 2,00m x 1,00m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-ATL-400-140
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-ATL-400-140' OR nome = 'Piscina Splash Tradicional 4,00m x 2,00m x 1,40m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 18020,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 4,00m x 2,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-ATL-400-140' OR nome = 'Piscina Splash Tradicional 4,00m x 2,00m x 1,40m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-ATL-400-140', 'Piscina Splash Tradicional 4,00m x 2,00m x 1,40m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 18020, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 4,00m x 2,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-ATL-450-100
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-ATL-450-100' OR nome = 'Piscina Splash Tradicional 4,50m x 2,15m x 1,00m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 18475,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 4,50m x 2,15m x 1,00m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-ATL-450-100' OR nome = 'Piscina Splash Tradicional 4,50m x 2,15m x 1,00m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-ATL-450-100', 'Piscina Splash Tradicional 4,50m x 2,15m x 1,00m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 18475, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 4,50m x 2,15m x 1,00m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-ATL-500-120
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-ATL-500-120' OR nome = 'Piscina Splash Tradicional 5,00m x 2,25m x 1,20m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 21573,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 5,00m x 2,25m x 1,20m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-ATL-500-120' OR nome = 'Piscina Splash Tradicional 5,00m x 2,25m x 1,20m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-ATL-500-120', 'Piscina Splash Tradicional 5,00m x 2,25m x 1,20m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 21573, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 5,00m x 2,25m x 1,20m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-ATL-500-140
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-ATL-500-140' OR nome = 'Piscina Splash Tradicional 5,00m x 2,25m x 1,40m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 22568,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 5,00m x 2,25m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-ATL-500-140' OR nome = 'Piscina Splash Tradicional 5,00m x 2,25m x 1,40m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-ATL-500-140', 'Piscina Splash Tradicional 5,00m x 2,25m x 1,40m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 22568, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 5,00m x 2,25m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-ATL-550-120
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-ATL-550-120' OR nome = 'Piscina Splash Tradicional 5,50m x 2,40m x 1,20m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 23812,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 5,50m x 2,40m x 1,20m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-ATL-550-120' OR nome = 'Piscina Splash Tradicional 5,50m x 2,40m x 1,20m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-ATL-550-120', 'Piscina Splash Tradicional 5,50m x 2,40m x 1,20m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 23812, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 5,50m x 2,40m x 1,20m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-ATL-600
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-ATL-600' OR nome = 'Piscina Splash Tradicional 6,00m x 2,50m x 1,40m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 26518,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 6,00m x 2,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-ATL-600' OR nome = 'Piscina Splash Tradicional 6,00m x 2,50m x 1,40m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-ATL-600', 'Piscina Splash Tradicional 6,00m x 2,50m x 1,40m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 26518, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 6,00m x 2,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-ATL-600-PRA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-ATL-600-PRA' OR nome = 'Piscina Splash Tradicional 6,00m x 2,50m x 1,40m - Prainha / Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 25897,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional com Prainha revestida com Porcelana Atlas. Medidas: 6,00m x 2,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-ATL-600-PRA' OR nome = 'Piscina Splash Tradicional 6,00m x 2,50m x 1,40m - Prainha / Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-ATL-600-PRA', 'Piscina Splash Tradicional 6,00m x 2,50m x 1,40m - Prainha / Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 25897, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional com Prainha revestida com Porcelana Atlas. Medidas: 6,00m x 2,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-ATL-600-SPA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-ATL-600-SPA' OR nome = 'Piscina Splash Tradicional 6,00m x 2,50m x 1,40m - SPA / Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 28287,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional com SPA revestida com Porcelana Atlas. Medidas: 6,00m x 2,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-ATL-600-SPA' OR nome = 'Piscina Splash Tradicional 6,00m x 2,50m x 1,40m - SPA / Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-ATL-600-SPA', 'Piscina Splash Tradicional 6,00m x 2,50m x 1,40m - SPA / Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 28287, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional com SPA revestida com Porcelana Atlas. Medidas: 6,00m x 2,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-ATL-650
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-ATL-650' OR nome = 'Piscina Splash Tradicional 6,50m x 2,70m x 1,40m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 28654,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 6,50m x 2,70m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-ATL-650' OR nome = 'Piscina Splash Tradicional 6,50m x 2,70m x 1,40m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-ATL-650', 'Piscina Splash Tradicional 6,50m x 2,70m x 1,40m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 28654, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 6,50m x 2,70m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-ATL-700
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-ATL-700' OR nome = 'Piscina Splash Tradicional 7,00m x 2,75m x 1,40m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 31517,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 7,00m x 2,75m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-ATL-700' OR nome = 'Piscina Splash Tradicional 7,00m x 2,75m x 1,40m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-ATL-700', 'Piscina Splash Tradicional 7,00m x 2,75m x 1,40m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 31517, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 7,00m x 2,75m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-ATL-700-PRA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-ATL-700-PRA' OR nome = 'Piscina Splash Tradicional 7,00m x 2,90m x 1,40m - Prainha / Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 31294,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional com Prainha revestida com Porcelana Atlas. Medidas: 7,00m x 2,90m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-ATL-700-PRA' OR nome = 'Piscina Splash Tradicional 7,00m x 2,90m x 1,40m - Prainha / Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-ATL-700-PRA', 'Piscina Splash Tradicional 7,00m x 2,90m x 1,40m - Prainha / Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 31294, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional com Prainha revestida com Porcelana Atlas. Medidas: 7,00m x 2,90m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-ATL-700-SPA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-ATL-700-SPA' OR nome = 'Piscina Splash Tradicional 7,00m x 2,90m x 1,40m - SPA / Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 34643,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional com SPA revestida com Porcelana Atlas. Medidas: 7,00m x 2,90m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-ATL-700-SPA' OR nome = 'Piscina Splash Tradicional 7,00m x 2,90m x 1,40m - SPA / Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-ATL-700-SPA', 'Piscina Splash Tradicional 7,00m x 2,90m x 1,40m - SPA / Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 34643, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional com SPA revestida com Porcelana Atlas. Medidas: 7,00m x 2,90m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-ATL-750
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-ATL-750' OR nome = 'Piscina Splash Tradicional 7,50m x 2,90m x 1,40m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 33887,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 7,50m x 2,90m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-ATL-750' OR nome = 'Piscina Splash Tradicional 7,50m x 2,90m x 1,40m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-ATL-750', 'Piscina Splash Tradicional 7,50m x 2,90m x 1,40m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 33887, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 7,50m x 2,90m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-ATL-800
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-ATL-800' OR nome = 'Piscina Splash Tradicional 8,00m x 3,00m x 1,40m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 37270,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 8,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-ATL-800' OR nome = 'Piscina Splash Tradicional 8,00m x 3,00m x 1,40m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-ATL-800', 'Piscina Splash Tradicional 8,00m x 3,00m x 1,40m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 37270, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 8,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-ATL-800-PRA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-ATL-800-PRA' OR nome = 'Piscina Splash Tradicional 8,00m x 3,00m x 1,40m - Prainha / Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 36279,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional com Prainha revestida com Porcelana Atlas. Medidas: 8,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-ATL-800-PRA' OR nome = 'Piscina Splash Tradicional 8,00m x 3,00m x 1,40m - Prainha / Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-ATL-800-PRA', 'Piscina Splash Tradicional 8,00m x 3,00m x 1,40m - Prainha / Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 36279, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional com Prainha revestida com Porcelana Atlas. Medidas: 8,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-ATL-800-SPA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-ATL-800-SPA' OR nome = 'Piscina Splash Tradicional 8,00m x 3,00m x 1,40m - SPA / Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 40791,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional com SPA revestida com Porcelana Atlas. Medidas: 8,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-ATL-800-SPA' OR nome = 'Piscina Splash Tradicional 8,00m x 3,00m x 1,40m - SPA / Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-ATL-800-SPA', 'Piscina Splash Tradicional 8,00m x 3,00m x 1,40m - SPA / Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 40791, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional com SPA revestida com Porcelana Atlas. Medidas: 8,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-ATL-850
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-ATL-850' OR nome = 'Piscina Splash Tradicional 8,50m x 3,50m x 1,40m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 40283,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 8,50m x 3,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-ATL-850' OR nome = 'Piscina Splash Tradicional 8,50m x 3,50m x 1,40m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-ATL-850', 'Piscina Splash Tradicional 8,50m x 3,50m x 1,40m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 40283, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 8,50m x 3,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TRA-ATL-900
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TRA-ATL-900' OR nome = 'Piscina Splash Tradicional 9,00m x 4,00m x 1,40m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 44156,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 9,00m x 4,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TRA-ATL-900' OR nome = 'Piscina Splash Tradicional 9,00m x 4,00m x 1,40m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TRA-ATL-900', 'Piscina Splash Tradicional 9,00m x 4,00m x 1,40m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 44156, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tradicional revestida com Porcelana Atlas. Medidas: 9,00m x 4,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-CAN-300
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-CAN-300' OR nome = 'Piscina Splash Cancún 3,00m x 1,80m x 0,80m') THEN
    UPDATE public.produtos
    SET preco_venda = 12951,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Cancún. Medidas: 3,00m x 1,80m x 0,80m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-CAN-300' OR nome = 'Piscina Splash Cancún 3,00m x 1,80m x 0,80m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-CAN-300', 'Piscina Splash Cancún 3,00m x 1,80m x 0,80m', 'Piscinas', 'produto', 'UN', 0, 12951, 0, 0, true, true, 'Piscina em fibra de vidro modelo Cancún. Medidas: 3,00m x 1,80m x 0,80m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-CAN-400
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-CAN-400' OR nome = 'Piscina Splash Cancún 4,00m x 2,00m x 1,20m') THEN
    UPDATE public.produtos
    SET preco_venda = 15730,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Cancún. Medidas: 4,00m x 2,00m x 1,20m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-CAN-400' OR nome = 'Piscina Splash Cancún 4,00m x 2,00m x 1,20m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-CAN-400', 'Piscina Splash Cancún 4,00m x 2,00m x 1,20m', 'Piscinas', 'produto', 'UN', 0, 15730, 0, 0, true, true, 'Piscina em fibra de vidro modelo Cancún. Medidas: 4,00m x 2,00m x 1,20m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-CAN-500
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-CAN-500' OR nome = 'Piscina Splash Cancún 5,00m x 2,50m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 21339,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Cancún. Medidas: 5,00m x 2,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-CAN-500' OR nome = 'Piscina Splash Cancún 5,00m x 2,50m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-CAN-500', 'Piscina Splash Cancún 5,00m x 2,50m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 21339, 0, 0, true, true, 'Piscina em fibra de vidro modelo Cancún. Medidas: 5,00m x 2,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-CAN-600
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-CAN-600' OR nome = 'Piscina Splash Cancún 6,00m x 3,00m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 25461,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Cancún. Medidas: 6,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-CAN-600' OR nome = 'Piscina Splash Cancún 6,00m x 3,00m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-CAN-600', 'Piscina Splash Cancún 6,00m x 3,00m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 25461, 0, 0, true, true, 'Piscina em fibra de vidro modelo Cancún. Medidas: 6,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-CAN-700
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-CAN-700' OR nome = 'Piscina Splash Cancún 7,00m x 3,50m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 33132,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Cancún. Medidas: 7,00m x 3,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-CAN-700' OR nome = 'Piscina Splash Cancún 7,00m x 3,50m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-CAN-700', 'Piscina Splash Cancún 7,00m x 3,50m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 33132, 0, 0, true, true, 'Piscina em fibra de vidro modelo Cancún. Medidas: 7,00m x 3,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-CAN-800
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-CAN-800' OR nome = 'Piscina Splash Cancún 8,00m x 4,00m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 39684,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Cancún. Medidas: 8,00m x 4,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-CAN-800' OR nome = 'Piscina Splash Cancún 8,00m x 4,00m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-CAN-800', 'Piscina Splash Cancún 8,00m x 4,00m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 39684, 0, 0, true, true, 'Piscina em fibra de vidro modelo Cancún. Medidas: 8,00m x 4,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-CAN-1000
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-CAN-1000' OR nome = 'Piscina Splash Cancún 10,00m x 4,30m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 50090,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Cancún. Medidas: 10,00m x 4,30m x 1,40m. Suporta Kit Power 3/4CV opcional. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-CAN-1000' OR nome = 'Piscina Splash Cancún 10,00m x 4,30m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-CAN-1000', 'Piscina Splash Cancún 10,00m x 4,30m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 50090, 0, 0, true, true, 'Piscina em fibra de vidro modelo Cancún. Medidas: 10,00m x 4,30m x 1,40m. Suporta Kit Power 3/4CV opcional. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-BON-300
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-BON-300' OR nome = 'Piscina Splash Bonaire 3,00m x 2,00m x 0,90m') THEN
    UPDATE public.produtos
    SET preco_venda = 14070,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Bonaire. Medidas: 3,00m x 2,00m x 0,90m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-BON-300' OR nome = 'Piscina Splash Bonaire 3,00m x 2,00m x 0,90m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-BON-300', 'Piscina Splash Bonaire 3,00m x 2,00m x 0,90m', 'Piscinas', 'produto', 'UN', 0, 14070, 0, 0, true, true, 'Piscina em fibra de vidro modelo Bonaire. Medidas: 3,00m x 2,00m x 0,90m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-BON-400
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-BON-400' OR nome = 'Piscina Splash Bonaire 4,00m x 2,00m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 16723,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Bonaire. Medidas: 4,00m x 2,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-BON-400' OR nome = 'Piscina Splash Bonaire 4,00m x 2,00m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-BON-400', 'Piscina Splash Bonaire 4,00m x 2,00m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 16723, 0, 0, true, true, 'Piscina em fibra de vidro modelo Bonaire. Medidas: 4,00m x 2,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-BON-500
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-BON-500' OR nome = 'Piscina Splash Bonaire 5,00m x 2,50m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 21712,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Bonaire. Medidas: 5,00m x 2,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-BON-500' OR nome = 'Piscina Splash Bonaire 5,00m x 2,50m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-BON-500', 'Piscina Splash Bonaire 5,00m x 2,50m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 21712, 0, 0, true, true, 'Piscina em fibra de vidro modelo Bonaire. Medidas: 5,00m x 2,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-BON-600
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-BON-600' OR nome = 'Piscina Splash Bonaire 6,00m x 3,00m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 25961,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Bonaire. Medidas: 6,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-BON-600' OR nome = 'Piscina Splash Bonaire 6,00m x 3,00m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-BON-600', 'Piscina Splash Bonaire 6,00m x 3,00m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 25961, 0, 0, true, true, 'Piscina em fibra de vidro modelo Bonaire. Medidas: 6,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-BON-700
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-BON-700' OR nome = 'Piscina Splash Bonaire 7,00m x 3,50m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 33998,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Bonaire. Medidas: 7,00m x 3,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-BON-700' OR nome = 'Piscina Splash Bonaire 7,00m x 3,50m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-BON-700', 'Piscina Splash Bonaire 7,00m x 3,50m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 33998, 0, 0, true, true, 'Piscina em fibra de vidro modelo Bonaire. Medidas: 7,00m x 3,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-BON-800
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-BON-800' OR nome = 'Piscina Splash Bonaire 8,00m x 4,00m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 40183,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Bonaire. Medidas: 8,00m x 4,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-BON-800' OR nome = 'Piscina Splash Bonaire 8,00m x 4,00m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-BON-800', 'Piscina Splash Bonaire 8,00m x 4,00m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 40183, 0, 0, true, true, 'Piscina em fibra de vidro modelo Bonaire. Medidas: 8,00m x 4,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-BON-ATL-300
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-BON-ATL-300' OR nome = 'Piscina Splash Bonaire 3,00m x 2,00m x 0,90m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 16435,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Bonaire revestida com Porcelana Atlas. Medidas: 3,00m x 2,00m x 0,90m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-BON-ATL-300' OR nome = 'Piscina Splash Bonaire 3,00m x 2,00m x 0,90m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-BON-ATL-300', 'Piscina Splash Bonaire 3,00m x 2,00m x 0,90m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 16435, 0, 0, true, true, 'Piscina em fibra de vidro modelo Bonaire revestida com Porcelana Atlas. Medidas: 3,00m x 2,00m x 0,90m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-BON-ATL-400
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-BON-ATL-400' OR nome = 'Piscina Splash Bonaire 4,00m x 2,00m x 1,40m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 19620,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Bonaire revestida com Porcelana Atlas. Medidas: 4,00m x 2,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-BON-ATL-400' OR nome = 'Piscina Splash Bonaire 4,00m x 2,00m x 1,40m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-BON-ATL-400', 'Piscina Splash Bonaire 4,00m x 2,00m x 1,40m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 19620, 0, 0, true, true, 'Piscina em fibra de vidro modelo Bonaire revestida com Porcelana Atlas. Medidas: 4,00m x 2,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-BON-ATL-500
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-BON-ATL-500' OR nome = 'Piscina Splash Bonaire 5,00m x 2,50m x 1,40m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 25318,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Bonaire revestida com Porcelana Atlas. Medidas: 5,00m x 2,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-BON-ATL-500' OR nome = 'Piscina Splash Bonaire 5,00m x 2,50m x 1,40m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-BON-ATL-500', 'Piscina Splash Bonaire 5,00m x 2,50m x 1,40m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 25318, 0, 0, true, true, 'Piscina em fibra de vidro modelo Bonaire revestida com Porcelana Atlas. Medidas: 5,00m x 2,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-BON-ATL-600
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-BON-ATL-600' OR nome = 'Piscina Splash Bonaire 6,00m x 3,00m x 1,40m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 30725,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Bonaire revestida com Porcelana Atlas. Medidas: 6,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-BON-ATL-600' OR nome = 'Piscina Splash Bonaire 6,00m x 3,00m x 1,40m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-BON-ATL-600', 'Piscina Splash Bonaire 6,00m x 3,00m x 1,40m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 30725, 0, 0, true, true, 'Piscina em fibra de vidro modelo Bonaire revestida com Porcelana Atlas. Medidas: 6,00m x 3,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-BON-ATL-700
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-BON-ATL-700' OR nome = 'Piscina Splash Bonaire 7,00m x 3,50m x 1,40m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 38997,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Bonaire revestida com Porcelana Atlas. Medidas: 7,00m x 3,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-BON-ATL-700' OR nome = 'Piscina Splash Bonaire 7,00m x 3,50m x 1,40m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-BON-ATL-700', 'Piscina Splash Bonaire 7,00m x 3,50m x 1,40m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 38997, 0, 0, true, true, 'Piscina em fibra de vidro modelo Bonaire revestida com Porcelana Atlas. Medidas: 7,00m x 3,50m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-BON-ATL-800
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-BON-ATL-800' OR nome = 'Piscina Splash Bonaire 8,00m x 4,00m x 1,40m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 45885,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Bonaire revestida com Porcelana Atlas. Medidas: 8,00m x 4,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-BON-ATL-800' OR nome = 'Piscina Splash Bonaire 8,00m x 4,00m x 1,40m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-BON-ATL-800', 'Piscina Splash Bonaire 8,00m x 4,00m x 1,40m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 45885, 0, 0, true, true, 'Piscina em fibra de vidro modelo Bonaire revestida com Porcelana Atlas. Medidas: 8,00m x 4,00m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-ATA-700
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-ATA-700' OR nome = 'Piscina Splash Atalaia 7,00m x 3,30m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 37106,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Atalaia. Medidas: 7,00m x 3,30m x 1,40m. Suporta Kit Power 3/4CV opcional. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-ATA-700' OR nome = 'Piscina Splash Atalaia 7,00m x 3,30m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-ATA-700', 'Piscina Splash Atalaia 7,00m x 3,30m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 37106, 0, 0, true, true, 'Piscina em fibra de vidro modelo Atalaia. Medidas: 7,00m x 3,30m x 1,40m. Suporta Kit Power 3/4CV opcional. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-ATA-900
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-ATA-900' OR nome = 'Piscina Splash Atalaia 9,00m x 4,00m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 48577,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Atalaia. Medidas: 9,00m x 4,00m x 1,40m. Suporta Kit Power 2CV opcional. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-ATA-900' OR nome = 'Piscina Splash Atalaia 9,00m x 4,00m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-ATA-900', 'Piscina Splash Atalaia 9,00m x 4,00m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 48577, 0, 0, true, true, 'Piscina em fibra de vidro modelo Atalaia. Medidas: 9,00m x 4,00m x 1,40m. Suporta Kit Power 2CV opcional. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-ATA-ATL-900
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-ATA-ATL-900' OR nome = 'Piscina Splash Atalaia 9,00m x 4,00m x 1,40m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 56493,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Atalaia revestida com Porcelana Atlas. Medidas: 9,00m x 4,00m x 1,40m. Suporta Kit Power 2CV opcional. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-ATA-ATL-900' OR nome = 'Piscina Splash Atalaia 9,00m x 4,00m x 1,40m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-ATA-ATL-900', 'Piscina Splash Atalaia 9,00m x 4,00m x 1,40m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 56493, 0, 0, true, true, 'Piscina em fibra de vidro modelo Atalaia revestida com Porcelana Atlas. Medidas: 9,00m x 4,00m x 1,40m. Suporta Kit Power 2CV opcional. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TOR-500
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TOR-500' OR nome = 'Piscina Splash Tortuga 5,00m x 2,30m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 19726,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tortuga. Medidas: 5,00m x 2,30m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TOR-500' OR nome = 'Piscina Splash Tortuga 5,00m x 2,30m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TOR-500', 'Piscina Splash Tortuga 5,00m x 2,30m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 19726, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tortuga. Medidas: 5,00m x 2,30m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TOR-700
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TOR-700' OR nome = 'Piscina Splash Tortuga 7,00m x 3,30m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 31398,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tortuga. Medidas: 7,00m x 3,30m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TOR-700' OR nome = 'Piscina Splash Tortuga 7,00m x 3,30m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TOR-700', 'Piscina Splash Tortuga 7,00m x 3,30m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 31398, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tortuga. Medidas: 7,00m x 3,30m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TOR-900
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TOR-900' OR nome = 'Piscina Splash Tortuga 9,00m x 3,50m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 37530,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tortuga. Medidas: 9,00m x 3,50m x 1,40m. Suporta Kit Power 3/4CV opcional. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TOR-900' OR nome = 'Piscina Splash Tortuga 9,00m x 3,50m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TOR-900', 'Piscina Splash Tortuga 9,00m x 3,50m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 37530, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tortuga. Medidas: 9,00m x 3,50m x 1,40m. Suporta Kit Power 3/4CV opcional. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TOR-1000
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TOR-1000' OR nome = 'Piscina Splash Tortuga 10,00m x 4,30m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 46371,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tortuga. Medidas: 10,00m x 4,30m x 1,40m. Suporta Kit Power 3/4CV opcional. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TOR-1000' OR nome = 'Piscina Splash Tortuga 10,00m x 4,30m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TOR-1000', 'Piscina Splash Tortuga 10,00m x 4,30m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 46371, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tortuga. Medidas: 10,00m x 4,30m x 1,40m. Suporta Kit Power 3/4CV opcional. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TOR-ATL-500
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TOR-ATL-500' OR nome = 'Piscina Splash Tortuga 5,00m x 2,30m x 1,40m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 23103,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tortuga revestida com Porcelana Atlas. Medidas: 5,00m x 2,30m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TOR-ATL-500' OR nome = 'Piscina Splash Tortuga 5,00m x 2,30m x 1,40m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TOR-ATL-500', 'Piscina Splash Tortuga 5,00m x 2,30m x 1,40m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 23103, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tortuga revestida com Porcelana Atlas. Medidas: 5,00m x 2,30m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TOR-ATL-700
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TOR-ATL-700' OR nome = 'Piscina Splash Tortuga 7,00m x 3,30m x 1,40m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 36163,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tortuga revestida com Porcelana Atlas. Medidas: 7,00m x 3,30m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TOR-ATL-700' OR nome = 'Piscina Splash Tortuga 7,00m x 3,30m x 1,40m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TOR-ATL-700', 'Piscina Splash Tortuga 7,00m x 3,30m x 1,40m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 36163, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tortuga revestida com Porcelana Atlas. Medidas: 7,00m x 3,30m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-TOR-ATL-1000
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-TOR-ATL-1000' OR nome = 'Piscina Splash Tortuga 10,00m x 4,30m x 1,40m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 53585,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Tortuga revestida com Porcelana Atlas. Medidas: 10,00m x 4,30m x 1,40m. Suporta Kit Power 3/4CV opcional. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-TOR-ATL-1000' OR nome = 'Piscina Splash Tortuga 10,00m x 4,30m x 1,40m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-TOR-ATL-1000', 'Piscina Splash Tortuga 10,00m x 4,30m x 1,40m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 53585, 0, 0, true, true, 'Piscina em fibra de vidro modelo Tortuga revestida com Porcelana Atlas. Medidas: 10,00m x 4,30m x 1,40m. Suporta Kit Power 3/4CV opcional. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-NAS-400
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-NAS-400' OR nome = 'Piscina Splash Nassau 4,00m x 3,00m x 1,00m') THEN
    UPDATE public.produtos
    SET preco_venda = 19698,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Nassau. Medidas: 4,00m x 3,00m x 1,00m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-NAS-400' OR nome = 'Piscina Splash Nassau 4,00m x 3,00m x 1,00m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-NAS-400', 'Piscina Splash Nassau 4,00m x 3,00m x 1,00m', 'Piscinas', 'produto', 'UN', 0, 19698, 0, 0, true, true, 'Piscina em fibra de vidro modelo Nassau. Medidas: 4,00m x 3,00m x 1,00m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-NAS-ATL-400
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-NAS-ATL-400' OR nome = 'Piscina Splash Nassau 4,00m x 3,00m x 1,00m - Porcelana Atlas') THEN
    UPDATE public.produtos
    SET preco_venda = 22812,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina em fibra de vidro modelo Nassau revestida com Porcelana Atlas. Medidas: 4,00m x 3,00m x 1,00m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-NAS-ATL-400' OR nome = 'Piscina Splash Nassau 4,00m x 3,00m x 1,00m - Porcelana Atlas';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-NAS-ATL-400', 'Piscina Splash Nassau 4,00m x 3,00m x 1,00m - Porcelana Atlas', 'Piscinas', 'produto', 'UN', 0, 22812, 0, 0, true, true, 'Piscina em fibra de vidro modelo Nassau revestida com Porcelana Atlas. Medidas: 4,00m x 3,00m x 1,00m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-NAV-ORIG-01
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-NAV-ORIG-01' OR nome = 'Piscina Splash Navagio 3,25m x 2,25m x 0,86m') THEN
    UPDATE public.produtos
    SET preco_venda = 15995,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina modelo Navagio Original sem visor acrílico. Medidas: 3,25m x 2,25m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-NAV-ORIG-01' OR nome = 'Piscina Splash Navagio 3,25m x 2,25m x 0,86m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-NAV-ORIG-01', 'Piscina Splash Navagio 3,25m x 2,25m x 0,86m', 'Piscinas', 'produto', 'UN', 0, 15995, 0, 0, true, true, 'Piscina modelo Navagio Original sem visor acrílico. Medidas: 3,25m x 2,25m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-NAV-ORIG-02
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-NAV-ORIG-02' OR nome = 'Piscina Splash Navagio 3,25m x 2,25m x 0,86m - Acrílico Reto 1,5m') THEN
    UPDATE public.produtos
    SET preco_venda = 21095,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina modelo Navagio Original com visor em Acrílico Reto 1,5m. Medidas: 3,25m x 2,25m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-NAV-ORIG-02' OR nome = 'Piscina Splash Navagio 3,25m x 2,25m x 0,86m - Acrílico Reto 1,5m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-NAV-ORIG-02', 'Piscina Splash Navagio 3,25m x 2,25m x 0,86m - Acrílico Reto 1,5m', 'Piscinas', 'produto', 'UN', 0, 21095, 0, 0, true, true, 'Piscina modelo Navagio Original com visor em Acrílico Reto 1,5m. Medidas: 3,25m x 2,25m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-NAV-ORIG-03
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-NAV-ORIG-03' OR nome = 'Piscina Splash Navagio 3,25m x 2,25m x 0,86m - Acrílico L 1,5m') THEN
    UPDATE public.produtos
    SET preco_venda = 22866,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina modelo Navagio Original com visor em Acrílico L 1,5m. Medidas: 3,25m x 2,25m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-NAV-ORIG-03' OR nome = 'Piscina Splash Navagio 3,25m x 2,25m x 0,86m - Acrílico L 1,5m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-NAV-ORIG-03', 'Piscina Splash Navagio 3,25m x 2,25m x 0,86m - Acrílico L 1,5m', 'Piscinas', 'produto', 'UN', 0, 22866, 0, 0, true, true, 'Piscina modelo Navagio Original com visor em Acrílico L 1,5m. Medidas: 3,25m x 2,25m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-NAV-ORIG-04
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-NAV-ORIG-04' OR nome = 'Piscina Splash Navagio 3,25m x 2,25m x 1,40m') THEN
    UPDATE public.produtos
    SET preco_venda = 17822,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina modelo Navagio Original sem visor acrílico. Medidas: 3,25m x 2,25m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-NAV-ORIG-04' OR nome = 'Piscina Splash Navagio 3,25m x 2,25m x 1,40m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-NAV-ORIG-04', 'Piscina Splash Navagio 3,25m x 2,25m x 1,40m', 'Piscinas', 'produto', 'UN', 0, 17822, 0, 0, true, true, 'Piscina modelo Navagio Original sem visor acrílico. Medidas: 3,25m x 2,25m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-NAV-ORIG-05
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-NAV-ORIG-05' OR nome = 'Piscina Splash Navagio 3,25m x 2,25m x 1,40m - Acrílico Reto 1,5m') THEN
    UPDATE public.produtos
    SET preco_venda = 22921,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina modelo Navagio Original com visor em Acrílico Reto 1,5m. Medidas: 3,25m x 2,25m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-NAV-ORIG-05' OR nome = 'Piscina Splash Navagio 3,25m x 2,25m x 1,40m - Acrílico Reto 1,5m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-NAV-ORIG-05', 'Piscina Splash Navagio 3,25m x 2,25m x 1,40m - Acrílico Reto 1,5m', 'Piscinas', 'produto', 'UN', 0, 22921, 0, 0, true, true, 'Piscina modelo Navagio Original com visor em Acrílico Reto 1,5m. Medidas: 3,25m x 2,25m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-NAV-ORIG-06
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-NAV-ORIG-06' OR nome = 'Piscina Splash Navagio 3,25m x 2,25m x 1,40m - Acrílico L 1,5m') THEN
    UPDATE public.produtos
    SET preco_venda = 24698,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina modelo Navagio Original com visor em Acrílico L 1,5m. Medidas: 3,25m x 2,25m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-NAV-ORIG-06' OR nome = 'Piscina Splash Navagio 3,25m x 2,25m x 1,40m - Acrílico L 1,5m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-NAV-ORIG-06', 'Piscina Splash Navagio 3,25m x 2,25m x 1,40m - Acrílico L 1,5m', 'Piscinas', 'produto', 'UN', 0, 24698, 0, 0, true, true, 'Piscina modelo Navagio Original com visor em Acrílico L 1,5m. Medidas: 3,25m x 2,25m x 1,40m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-NAV-LANC-01
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-NAV-LANC-01' OR nome = 'Piscina Splash Navagio I 2,00m x 1,80m x 0,86m') THEN
    UPDATE public.produtos
    SET preco_venda = 14292,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina modelo Navagio Lançamento I sem visor acrílico. Medidas: 2,00m x 1,80m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-NAV-LANC-01' OR nome = 'Piscina Splash Navagio I 2,00m x 1,80m x 0,86m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-NAV-LANC-01', 'Piscina Splash Navagio I 2,00m x 1,80m x 0,86m', 'Piscinas', 'produto', 'UN', 0, 14292, 0, 0, true, true, 'Piscina modelo Navagio Lançamento I sem visor acrílico. Medidas: 2,00m x 1,80m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-NAV-LANC-02
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-NAV-LANC-02' OR nome = 'Piscina Splash Navagio I 2,00m x 1,80m x 0,86m - Acrílico Reto 1,5m') THEN
    UPDATE public.produtos
    SET preco_venda = 17832,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina modelo Navagio Lançamento I com visor em Acrílico Reto 1,5m. Medidas: 2,00m x 1,80m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-NAV-LANC-02' OR nome = 'Piscina Splash Navagio I 2,00m x 1,80m x 0,86m - Acrílico Reto 1,5m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-NAV-LANC-02', 'Piscina Splash Navagio I 2,00m x 1,80m x 0,86m - Acrílico Reto 1,5m', 'Piscinas', 'produto', 'UN', 0, 17832, 0, 0, true, true, 'Piscina modelo Navagio Lançamento I com visor em Acrílico Reto 1,5m. Medidas: 2,00m x 1,80m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-NAV-LANC-03
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-NAV-LANC-03' OR nome = 'Piscina Splash Navagio II 2,50m x 1,70m x 0,86m') THEN
    UPDATE public.produtos
    SET preco_venda = 13428,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina modelo Navagio Lançamento II sem visor acrílico. Medidas: 2,50m x 1,70m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-NAV-LANC-03' OR nome = 'Piscina Splash Navagio II 2,50m x 1,70m x 0,86m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-NAV-LANC-03', 'Piscina Splash Navagio II 2,50m x 1,70m x 0,86m', 'Piscinas', 'produto', 'UN', 0, 13428, 0, 0, true, true, 'Piscina modelo Navagio Lançamento II sem visor acrílico. Medidas: 2,50m x 1,70m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-NAV-LANC-04
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-NAV-LANC-04' OR nome = 'Piscina Splash Navagio II 2,50m x 1,70m x 0,86m - Acrílico Reto 1,5m') THEN
    UPDATE public.produtos
    SET preco_venda = 18508,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina modelo Navagio Lançamento II com visor em Acrílico Reto 1,5m. Medidas: 2,50m x 1,70m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-NAV-LANC-04' OR nome = 'Piscina Splash Navagio II 2,50m x 1,70m x 0,86m - Acrílico Reto 1,5m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-NAV-LANC-04', 'Piscina Splash Navagio II 2,50m x 1,70m x 0,86m - Acrílico Reto 1,5m', 'Piscinas', 'produto', 'UN', 0, 18508, 0, 0, true, true, 'Piscina modelo Navagio Lançamento II com visor em Acrílico Reto 1,5m. Medidas: 2,50m x 1,70m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-NAV-LANC-05
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-NAV-LANC-05' OR nome = 'Piscina Splash Navagio III 2,50m x 1,80m x 0,86m') THEN
    UPDATE public.produtos
    SET preco_venda = 13444,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina modelo Navagio Lançamento III sem visor acrílico. Medidas: 2,50m x 1,80m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-NAV-LANC-05' OR nome = 'Piscina Splash Navagio III 2,50m x 1,80m x 0,86m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-NAV-LANC-05', 'Piscina Splash Navagio III 2,50m x 1,80m x 0,86m', 'Piscinas', 'produto', 'UN', 0, 13444, 0, 0, true, true, 'Piscina modelo Navagio Lançamento III sem visor acrílico. Medidas: 2,50m x 1,80m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-NAV-LANC-06
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-NAV-LANC-06' OR nome = 'Piscina Splash Navagio III 2,50m x 1,80m x 0,86m - Acrílico Reto 1,5m') THEN
    UPDATE public.produtos
    SET preco_venda = 18524,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina modelo Navagio Lançamento III com visor em Acrílico Reto 1,5m. Medidas: 2,50m x 1,80m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-NAV-LANC-06' OR nome = 'Piscina Splash Navagio III 2,50m x 1,80m x 0,86m - Acrílico Reto 1,5m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-NAV-LANC-06', 'Piscina Splash Navagio III 2,50m x 1,80m x 0,86m - Acrílico Reto 1,5m', 'Piscinas', 'produto', 'UN', 0, 18524, 0, 0, true, true, 'Piscina modelo Navagio Lançamento III com visor em Acrílico Reto 1,5m. Medidas: 2,50m x 1,80m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-NAV-LANC-07
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-NAV-LANC-07' OR nome = 'Piscina Splash Navagio IV 3,00m x 2,00m x 0,86m') THEN
    UPDATE public.produtos
    SET preco_venda = 14720,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina modelo Navagio Lançamento IV sem visor acrílico. Medidas: 3,00m x 2,00m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-NAV-LANC-07' OR nome = 'Piscina Splash Navagio IV 3,00m x 2,00m x 0,86m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-NAV-LANC-07', 'Piscina Splash Navagio IV 3,00m x 2,00m x 0,86m', 'Piscinas', 'produto', 'UN', 0, 14720, 0, 0, true, true, 'Piscina modelo Navagio Lançamento IV sem visor acrílico. Medidas: 3,00m x 2,00m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-NAV-LANC-08
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-NAV-LANC-08' OR nome = 'Piscina Splash Navagio IV 3,00m x 2,00m x 0,86m - Acrílico Reto 1,5m') THEN
    UPDATE public.produtos
    SET preco_venda = 19805,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina modelo Navagio Lançamento IV com visor em Acrílico Reto 1,5m. Medidas: 3,00m x 2,00m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-NAV-LANC-08' OR nome = 'Piscina Splash Navagio IV 3,00m x 2,00m x 0,86m - Acrílico Reto 1,5m';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-NAV-LANC-08', 'Piscina Splash Navagio IV 3,00m x 2,00m x 0,86m - Acrílico Reto 1,5m', 'Piscinas', 'produto', 'UN', 0, 19805, 0, 0, true, true, 'Piscina modelo Navagio Lançamento IV com visor em Acrílico Reto 1,5m. Medidas: 3,00m x 2,00m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-NAV-LANC-09
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-NAV-LANC-09' OR nome = 'Piscina Splash Navagio V 2,00m x 2,00m x 0,86m - Acrílico Curvo') THEN
    UPDATE public.produtos
    SET preco_venda = 19218,
        categoria = 'Piscinas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Piscina modelo Navagio Lançamento V com visor em Acrílico Curvo. Medidas: 2,00m x 2,00m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.',
        ativo = true
    WHERE codigo = 'SPL-NAV-LANC-09' OR nome = 'Piscina Splash Navagio V 2,00m x 2,00m x 0,86m - Acrílico Curvo';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-NAV-LANC-09', 'Piscina Splash Navagio V 2,00m x 2,00m x 0,86m - Acrílico Curvo', 'Piscinas', 'produto', 'UN', 0, 19218, 0, 0, true, true, 'Piscina modelo Navagio Lançamento V com visor em Acrílico Curvo. Medidas: 2,00m x 2,00m x 0,86m. Tabela Oficial Splash Piscinas by iGUI 2026.', v_fornecedor_id);
  END IF;

  -- SPL-ACC-KP-34
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-ACC-KP-34' OR nome = 'Kit Power 3/4CV (Acessório Splash)') THEN
    UPDATE public.produtos
    SET preco_venda = 6000,
        categoria = 'Bombas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Kit Power 3/4CV - Acessório opcional oficial para piscinas Splash (Tortuga, Cancún, Atalaia). Tabela Splash 2026.',
        ativo = true
    WHERE codigo = 'SPL-ACC-KP-34' OR nome = 'Kit Power 3/4CV (Acessório Splash)';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-ACC-KP-34', 'Kit Power 3/4CV (Acessório Splash)', 'Bombas', 'produto', 'UN', 0, 6000, 0, 0, true, true, 'Kit Power 3/4CV - Acessório opcional oficial para piscinas Splash (Tortuga, Cancún, Atalaia). Tabela Splash 2026.', v_fornecedor_id);
  END IF;

  -- SPL-ACC-KP-20
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'SPL-ACC-KP-20' OR nome = 'Kit Power 2CV (Acessório Splash)') THEN
    UPDATE public.produtos
    SET preco_venda = 10200,
        categoria = 'Bombas',
        tipo = 'produto',
        unidade = 'UN',
        sob_encomenda = true,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Kit Power 2CV - Acessório opcional oficial para piscinas Splash (Atalaia). Tabela Splash 2026.',
        ativo = true
    WHERE codigo = 'SPL-ACC-KP-20' OR nome = 'Kit Power 2CV (Acessório Splash)';
  ELSE
    INSERT INTO public.produtos (codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, estoque_atual, estoque_minimo, sob_encomenda, ativo, descricao, fornecedor_id)
    VALUES ('SPL-ACC-KP-20', 'Kit Power 2CV (Acessório Splash)', 'Bombas', 'produto', 'UN', 0, 10200, 0, 0, true, true, 'Kit Power 2CV - Acessório opcional oficial para piscinas Splash (Atalaia). Tabela Splash 2026.', v_fornecedor_id);
  END IF;

END $$;
