-- Migration: Inclusão de 529 itens de Peças e Acessórios no Estoque (Linhas 4 a 534)
DO $$
DECLARE
  v_fornecedor_id uuid;
BEGIN
  SELECT id INTO v_fornecedor_id FROM public.fornecedores WHERE nome ILIKE '%Splash%' OR nome ILIKE '%iGUI%' LIMIT 1;
  IF v_fornecedor_id IS NULL THEN
    INSERT INTO public.fornecedores (nome, contato, observacoes, ativo)
    VALUES ('Splash Piscinas by iGUI', 'Fábrica Splash / iGUi', 'Fornecedor oficial de piscinas e peças Splash by iGUI', true)
    RETURNING id INTO v_fornecedor_id;
  END IF;

  -- Linha 4: PEC-0004 - ABRAÇADEIRA DUTO ECOLOGICO (CX C/ 50 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0004' OR UPPER(TRIM(nome)) = UPPER('ABRAÇADEIRA DUTO ECOLOGICO (CX C/ 50 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0004'),
        nome = 'ABRAÇADEIRA DUTO ECOLOGICO (CX C/ 50 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 90,
        preco_venda = 112.91,
        unidades_por_compra = 50,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 4) | NCM: 39269090 | Preço Unit.: R$ 90,00 | Valor ST: R$ 22,91 | Preço c/ ST: R$ 112,91',
        ativo = true
    WHERE codigo = 'PEC-0004' OR UPPER(TRIM(nome)) = UPPER('ABRAÇADEIRA DUTO ECOLOGICO (CX C/ 50 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0004', 'ABRAÇADEIRA DUTO ECOLOGICO (CX C/ 50 UN)', 'Peças', 'produto', 'UN', '39269090',
      90, 112.91, 0, 0,
      50, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 4) | NCM: 39269090 | Preço Unit.: R$ 90,00 | Valor ST: R$ 22,91 | Preço c/ ST: R$ 112,91', v_fornecedor_id
    );
  END IF;

  -- Linha 5: PEC-0005 - ABRAÇADEIRA PAR
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0005' OR UPPER(TRIM(nome)) = UPPER('ABRAÇADEIRA PAR')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0005'),
        nome = 'ABRAÇADEIRA PAR',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 15,
        preco_venda = 18.82,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 5) | NCM: 39269090 | Preço Unit.: R$ 15,00 | Valor ST: R$ 3,82 | Preço c/ ST: R$ 18,82',
        ativo = true
    WHERE codigo = 'PEC-0005' OR UPPER(TRIM(nome)) = UPPER('ABRAÇADEIRA PAR');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0005', 'ABRAÇADEIRA PAR', 'Peças', 'produto', 'UN', '39269090',
      15, 18.82, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 5) | NCM: 39269090 | Preço Unit.: R$ 15,00 | Valor ST: R$ 3,82 | Preço c/ ST: R$ 18,82', v_fornecedor_id
    );
  END IF;

  -- Linha 6: PEC-0006 - ACABAMENTO SAIDA VAPOR DA SAUNA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0006' OR UPPER(TRIM(nome)) = UPPER('ACABAMENTO SAIDA VAPOR DA SAUNA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0006'),
        nome = 'ACABAMENTO SAIDA VAPOR DA SAUNA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '69131000',
        preco_custo = 35,
        preco_venda = 35,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 6) | NCM: 69131000 | Preço Unit.: R$ 35,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 35,00',
        ativo = true
    WHERE codigo = 'PEC-0006' OR UPPER(TRIM(nome)) = UPPER('ACABAMENTO SAIDA VAPOR DA SAUNA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0006', 'ACABAMENTO SAIDA VAPOR DA SAUNA', 'Peças', 'produto', 'UN', '69131000',
      35, 35, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 6) | NCM: 69131000 | Preço Unit.: R$ 35,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 35,00', v_fornecedor_id
    );
  END IF;

  -- Linha 7: PEC-0007 - ACOPLADOR REGISTRO ELETRONIC
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0007' OR UPPER(TRIM(nome)) = UPPER('ACOPLADOR REGISTRO ELETRONIC')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0007'),
        nome = 'ACOPLADOR REGISTRO ELETRONIC',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 9,
        preco_venda = 10.17,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 7) | NCM: 39174090 | Preço Unit.: R$ 9,00 | Valor ST: R$ 1,17 | Preço c/ ST: R$ 10,17',
        ativo = true
    WHERE codigo = 'PEC-0007' OR UPPER(TRIM(nome)) = UPPER('ACOPLADOR REGISTRO ELETRONIC');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0007', 'ACOPLADOR REGISTRO ELETRONIC', 'Peças', 'produto', 'UN', '39174090',
      9, 10.17, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 7) | NCM: 39174090 | Preço Unit.: R$ 9,00 | Valor ST: R$ 1,17 | Preço c/ ST: R$ 10,17', v_fornecedor_id
    );
  END IF;

  -- Linha 8: PEC-0008 - ADAPTADOR CANO 40 SPLASH/G4 (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0008' OR UPPER(TRIM(nome)) = UPPER('ADAPTADOR CANO 40 SPLASH/G4 (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0008'),
        nome = 'ADAPTADOR CANO 40 SPLASH/G4 (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 65,
        preco_venda = 73.42,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 8) | NCM: 39174090 | Preço Unit.: R$ 65,00 | Valor ST: R$ 8,42 | Preço c/ ST: R$ 73,42',
        ativo = true
    WHERE codigo = 'PEC-0008' OR UPPER(TRIM(nome)) = UPPER('ADAPTADOR CANO 40 SPLASH/G4 (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0008', 'ADAPTADOR CANO 40 SPLASH/G4 (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      65, 73.42, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 8) | NCM: 39174090 | Preço Unit.: R$ 65,00 | Valor ST: R$ 8,42 | Preço c/ ST: R$ 73,42', v_fornecedor_id
    );
  END IF;

  -- Linha 9: PEC-0009 - ADAPTADOR CANO 50 (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0009' OR UPPER(TRIM(nome)) = UPPER('ADAPTADOR CANO 50 (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0009'),
        nome = 'ADAPTADOR CANO 50 (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 70,
        preco_venda = 79.07,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 9) | NCM: 39174090 | Preço Unit.: R$ 70,00 | Valor ST: R$ 9,07 | Preço c/ ST: R$ 79,07',
        ativo = true
    WHERE codigo = 'PEC-0009' OR UPPER(TRIM(nome)) = UPPER('ADAPTADOR CANO 50 (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0009', 'ADAPTADOR CANO 50 (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      70, 79.07, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 9) | NCM: 39174090 | Preço Unit.: R$ 70,00 | Valor ST: R$ 9,07 | Preço c/ ST: R$ 79,07', v_fornecedor_id
    );
  END IF;

  -- Linha 10: PEC-0010 - ADAPTADOR JOELHO 25 (CX C/ 25 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0010' OR UPPER(TRIM(nome)) = UPPER('ADAPTADOR JOELHO 25 (CX C/ 25 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0010'),
        nome = 'ADAPTADOR JOELHO 25 (CX C/ 25 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 50,
        preco_venda = 56.48,
        unidades_por_compra = 25,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 10) | NCM: 39172900 | Preço Unit.: R$ 50,00 | Valor ST: R$ 6,48 | Preço c/ ST: R$ 56,48',
        ativo = true
    WHERE codigo = 'PEC-0010' OR UPPER(TRIM(nome)) = UPPER('ADAPTADOR JOELHO 25 (CX C/ 25 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0010', 'ADAPTADOR JOELHO 25 (CX C/ 25 UN)', 'Peças', 'produto', 'UN', '39172900',
      50, 56.48, 0, 0,
      25, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 10) | NCM: 39172900 | Preço Unit.: R$ 50,00 | Valor ST: R$ 6,48 | Preço c/ ST: R$ 56,48', v_fornecedor_id
    );
  END IF;

  -- Linha 11: PEC-0011 - ADAPTADOR PROGEU (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0011' OR UPPER(TRIM(nome)) = UPPER('ADAPTADOR PROGEU (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0011'),
        nome = 'ADAPTADOR PROGEU (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 115,
        preco_venda = 129.9,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 11) | NCM: 39172900 | Preço Unit.: R$ 115,00 | Valor ST: R$ 14,90 | Preço c/ ST: R$ 129,90',
        ativo = true
    WHERE codigo = 'PEC-0011' OR UPPER(TRIM(nome)) = UPPER('ADAPTADOR PROGEU (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0011', 'ADAPTADOR PROGEU (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39172900',
      115, 129.9, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 11) | NCM: 39172900 | Preço Unit.: R$ 115,00 | Valor ST: R$ 14,90 | Preço c/ ST: R$ 129,90', v_fornecedor_id
    );
  END IF;

  -- Linha 12: PEC-0012 - ADAPTADOR REGISTRO 25 MM (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0012' OR UPPER(TRIM(nome)) = UPPER('ADAPTADOR REGISTRO 25 MM (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0012'),
        nome = 'ADAPTADOR REGISTRO 25 MM (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 55,
        preco_venda = 62.13,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 12) | NCM: 39172900 | Preço Unit.: R$ 55,00 | Valor ST: R$ 7,13 | Preço c/ ST: R$ 62,13',
        ativo = true
    WHERE codigo = 'PEC-0012' OR UPPER(TRIM(nome)) = UPPER('ADAPTADOR REGISTRO 25 MM (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0012', 'ADAPTADOR REGISTRO 25 MM (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39172900',
      55, 62.13, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 12) | NCM: 39172900 | Preço Unit.: R$ 55,00 | Valor ST: R$ 7,13 | Preço c/ ST: R$ 62,13', v_fornecedor_id
    );
  END IF;

  -- Linha 13: PEC-0013 - ADAPTADOR REGISTRO 32 MM (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0013' OR UPPER(TRIM(nome)) = UPPER('ADAPTADOR REGISTRO 32 MM (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0013'),
        nome = 'ADAPTADOR REGISTRO 32 MM (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 75,
        preco_venda = 84.72,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 13) | NCM: 39172900 | Preço Unit.: R$ 75,00 | Valor ST: R$ 9,72 | Preço c/ ST: R$ 84,72',
        ativo = true
    WHERE codigo = 'PEC-0013' OR UPPER(TRIM(nome)) = UPPER('ADAPTADOR REGISTRO 32 MM (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0013', 'ADAPTADOR REGISTRO 32 MM (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39172900',
      75, 84.72, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 13) | NCM: 39172900 | Preço Unit.: R$ 75,00 | Valor ST: R$ 9,72 | Preço c/ ST: R$ 84,72', v_fornecedor_id
    );
  END IF;

  -- Linha 14: PEC-0014 - ADAPTADOR UNIÃO (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0014' OR UPPER(TRIM(nome)) = UPPER('ADAPTADOR UNIÃO (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0014'),
        nome = 'ADAPTADOR UNIÃO (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 60,
        preco_venda = 67.78,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 14) | NCM: 39174090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 7,78 | Preço c/ ST: R$ 67,78',
        ativo = true
    WHERE codigo = 'PEC-0014' OR UPPER(TRIM(nome)) = UPPER('ADAPTADOR UNIÃO (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0014', 'ADAPTADOR UNIÃO (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      60, 67.78, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 14) | NCM: 39174090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 7,78 | Preço c/ ST: R$ 67,78', v_fornecedor_id
    );
  END IF;

  -- Linha 15: PEC-0015 - ADESIVO VISOR ELET. SYSTEM G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0015' OR UPPER(TRIM(nome)) = UPPER('ADESIVO VISOR ELET. SYSTEM G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0015'),
        nome = 'ADESIVO VISOR ELET. SYSTEM G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '35069120',
        preco_custo = 20,
        preco_venda = 20,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 15) | NCM: 35069120 | Preço Unit.: R$ 20,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 20,00',
        ativo = true
    WHERE codigo = 'PEC-0015' OR UPPER(TRIM(nome)) = UPPER('ADESIVO VISOR ELET. SYSTEM G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0015', 'ADESIVO VISOR ELET. SYSTEM G4', 'Peças', 'produto', 'UN', '35069120',
      20, 20, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 15) | NCM: 35069120 | Preço Unit.: R$ 20,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 20,00', v_fornecedor_id
    );
  END IF;

  -- Linha 16: PEC-0016 - ADESIVO VISOR IHM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0016' OR UPPER(TRIM(nome)) = UPPER('ADESIVO VISOR IHM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0016'),
        nome = 'ADESIVO VISOR IHM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '35069120',
        preco_custo = 6,
        preco_venda = 6,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 16) | NCM: 35069120 | Preço Unit.: R$ 6,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 6,00',
        ativo = true
    WHERE codigo = 'PEC-0016' OR UPPER(TRIM(nome)) = UPPER('ADESIVO VISOR IHM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0016', 'ADESIVO VISOR IHM', 'Peças', 'produto', 'UN', '35069120',
      6, 6, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 16) | NCM: 35069120 | Preço Unit.: R$ 6,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 6,00', v_fornecedor_id
    );
  END IF;

  -- Linha 17: PEC-0017 - ALTO FALANTE CANADÁ
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0017' OR UPPER(TRIM(nome)) = UPPER('ALTO FALANTE CANADÁ')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0017'),
        nome = 'ALTO FALANTE CANADÁ',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85182100',
        preco_custo = 30,
        preco_venda = 30,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 17) | NCM: 85182100 | Preço Unit.: R$ 30,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 30,00',
        ativo = true
    WHERE codigo = 'PEC-0017' OR UPPER(TRIM(nome)) = UPPER('ALTO FALANTE CANADÁ');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0017', 'ALTO FALANTE CANADÁ', 'Peças', 'produto', 'UN', '85182100',
      30, 30, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 17) | NCM: 85182100 | Preço Unit.: R$ 30,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 30,00', v_fornecedor_id
    );
  END IF;

  -- Linha 18: PEC-0018 - ALTO FALANTE DO SPA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0018' OR UPPER(TRIM(nome)) = UPPER('ALTO FALANTE DO SPA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0018'),
        nome = 'ALTO FALANTE DO SPA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85182100',
        preco_custo = 30,
        preco_venda = 30,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 18) | NCM: 85182100 | Preço Unit.: R$ 30,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 30,00',
        ativo = true
    WHERE codigo = 'PEC-0018' OR UPPER(TRIM(nome)) = UPPER('ALTO FALANTE DO SPA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0018', 'ALTO FALANTE DO SPA', 'Peças', 'produto', 'UN', '85182100',
      30, 30, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 18) | NCM: 85182100 | Preço Unit.: R$ 30,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 30,00', v_fornecedor_id
    );
  END IF;

  -- Linha 19: PEC-0019 - ALTO FALANTE SAUNA CLUB
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0019' OR UPPER(TRIM(nome)) = UPPER('ALTO FALANTE SAUNA CLUB')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0019'),
        nome = 'ALTO FALANTE SAUNA CLUB',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85182100',
        preco_custo = 30,
        preco_venda = 30,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 19) | NCM: 85182100 | Preço Unit.: R$ 30,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 30,00',
        ativo = true
    WHERE codigo = 'PEC-0019' OR UPPER(TRIM(nome)) = UPPER('ALTO FALANTE SAUNA CLUB');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0019', 'ALTO FALANTE SAUNA CLUB', 'Peças', 'produto', 'UN', '85182100',
      30, 30, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 19) | NCM: 85182100 | Preço Unit.: R$ 30,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 30,00', v_fornecedor_id
    );
  END IF;

  -- Linha 20: PEC-0020 - ANEL VEDAÇÃO UNIÃO DOS REGISTROS
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0020' OR UPPER(TRIM(nome)) = UPPER('ANEL VEDAÇÃO UNIÃO DOS REGISTROS')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0020'),
        nome = 'ANEL VEDAÇÃO UNIÃO DOS REGISTROS',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 1,
        preco_venda = 1.13,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 20) | NCM: 39174090 | Preço Unit.: R$ 1,00 | Valor ST: R$ 0,13 | Preço c/ ST: R$ 1,13',
        ativo = true
    WHERE codigo = 'PEC-0020' OR UPPER(TRIM(nome)) = UPPER('ANEL VEDAÇÃO UNIÃO DOS REGISTROS');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0020', 'ANEL VEDAÇÃO UNIÃO DOS REGISTROS', 'Peças', 'produto', 'UN', '39174090',
      1, 1.13, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 20) | NCM: 39174090 | Preço Unit.: R$ 1,00 | Valor ST: R$ 0,13 | Preço c/ ST: R$ 1,13', v_fornecedor_id
    );
  END IF;

  -- Linha 21: PEC-0021 - AQUANIVEL G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0021' OR UPPER(TRIM(nome)) = UPPER('AQUANIVEL G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0021'),
        nome = 'AQUANIVEL G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 6,
        preco_venda = 6.78,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 21) | NCM: 39174090 | Preço Unit.: R$ 6,00 | Valor ST: R$ 0,78 | Preço c/ ST: R$ 6,78',
        ativo = true
    WHERE codigo = 'PEC-0021' OR UPPER(TRIM(nome)) = UPPER('AQUANIVEL G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0021', 'AQUANIVEL G4', 'Peças', 'produto', 'UN', '39174090',
      6, 6.78, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 21) | NCM: 39174090 | Preço Unit.: R$ 6,00 | Valor ST: R$ 0,78 | Preço c/ ST: R$ 6,78', v_fornecedor_id
    );
  END IF;

  -- Linha 22: PEC-0022 - AQUECEDOR SPA LUXO/DUO SPA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0022' OR UPPER(TRIM(nome)) = UPPER('AQUECEDOR SPA LUXO/DUO SPA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0022'),
        nome = 'AQUECEDOR SPA LUXO/DUO SPA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '94054900',
        preco_custo = 2700,
        preco_venda = 2700,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 22) | NCM: 94054900 | Preço Unit.: R$ 2.700,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2.700,00',
        ativo = true
    WHERE codigo = 'PEC-0022' OR UPPER(TRIM(nome)) = UPPER('AQUECEDOR SPA LUXO/DUO SPA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0022', 'AQUECEDOR SPA LUXO/DUO SPA', 'Peças', 'produto', 'UN', '94054900',
      2700, 2700, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 22) | NCM: 94054900 | Preço Unit.: R$ 2.700,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2.700,00', v_fornecedor_id
    );
  END IF;

  -- Linha 23: PEC-0023 - ARRUELA 1/4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0023' OR UPPER(TRIM(nome)) = UPPER('ARRUELA 1/4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0023'),
        nome = 'ARRUELA 1/4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '73182200',
        preco_custo = 0.5,
        preco_venda = 0.5,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 23) | NCM: 73182200 | Preço Unit.: R$ 0,50 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 0,50',
        ativo = true
    WHERE codigo = 'PEC-0023' OR UPPER(TRIM(nome)) = UPPER('ARRUELA 1/4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0023', 'ARRUELA 1/4', 'Peças', 'produto', 'UN', '73182200',
      0.5, 0.5, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 23) | NCM: 73182200 | Preço Unit.: R$ 0,50 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 0,50', v_fornecedor_id
    );
  END IF;

  -- Linha 24: PEC-0024 - BARRAMENTO NEUTRO 8 POLOS
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0024' OR UPPER(TRIM(nome)) = UPPER('BARRAMENTO NEUTRO 8 POLOS')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0024'),
        nome = 'BARRAMENTO NEUTRO 8 POLOS',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85369090',
        preco_custo = 50,
        preco_venda = 55.82,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 24) | NCM: 85369090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 5,82 | Preço c/ ST: R$ 55,82',
        ativo = true
    WHERE codigo = 'PEC-0024' OR UPPER(TRIM(nome)) = UPPER('BARRAMENTO NEUTRO 8 POLOS');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0024', 'BARRAMENTO NEUTRO 8 POLOS', 'Peças', 'produto', 'UN', '85369090',
      50, 55.82, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 24) | NCM: 85369090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 5,82 | Preço c/ ST: R$ 55,82', v_fornecedor_id
    );
  END IF;

  -- Linha 25: PEC-0025 - BARRAMENTO PENTE MONOPOLAR 63A
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0025' OR UPPER(TRIM(nome)) = UPPER('BARRAMENTO PENTE MONOPOLAR 63A')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0025'),
        nome = 'BARRAMENTO PENTE MONOPOLAR 63A',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85369090',
        preco_custo = 50,
        preco_venda = 55.82,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 25) | NCM: 85369090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 5,82 | Preço c/ ST: R$ 55,82',
        ativo = true
    WHERE codigo = 'PEC-0025' OR UPPER(TRIM(nome)) = UPPER('BARRAMENTO PENTE MONOPOLAR 63A');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0025', 'BARRAMENTO PENTE MONOPOLAR 63A', 'Peças', 'produto', 'UN', '85369090',
      50, 55.82, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 25) | NCM: 85369090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 5,82 | Preço c/ ST: R$ 55,82', v_fornecedor_id
    );
  END IF;

  -- Linha 26: PEC-0026 - BASE DRY PUMP
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0026' OR UPPER(TRIM(nome)) = UPPER('BASE DRY PUMP')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0026'),
        nome = 'BASE DRY PUMP',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 190,
        preco_venda = 214.62,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 26) | NCM: 39174090 | Preço Unit.: R$ 190,00 | Valor ST: R$ 24,62 | Preço c/ ST: R$ 214,62',
        ativo = true
    WHERE codigo = 'PEC-0026' OR UPPER(TRIM(nome)) = UPPER('BASE DRY PUMP');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0026', 'BASE DRY PUMP', 'Peças', 'produto', 'UN', '39174090',
      190, 214.62, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 26) | NCM: 39174090 | Preço Unit.: R$ 190,00 | Valor ST: R$ 24,62 | Preço c/ ST: R$ 214,62', v_fornecedor_id
    );
  END IF;

  -- Linha 27: PEC-0027 - BASE DRY PUMP 2
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0027' OR UPPER(TRIM(nome)) = UPPER('BASE DRY PUMP 2')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0027'),
        nome = 'BASE DRY PUMP 2',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 290,
        preco_venda = 327.58,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 27) | NCM: 39174090 | Preço Unit.: R$ 290,00 | Valor ST: R$ 37,58 | Preço c/ ST: R$ 327,58',
        ativo = true
    WHERE codigo = 'PEC-0027' OR UPPER(TRIM(nome)) = UPPER('BASE DRY PUMP 2');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0027', 'BASE DRY PUMP 2', 'Peças', 'produto', 'UN', '39174090',
      290, 327.58, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 27) | NCM: 39174090 | Preço Unit.: R$ 290,00 | Valor ST: R$ 37,58 | Preço c/ ST: R$ 327,58', v_fornecedor_id
    );
  END IF;

  -- Linha 28: PEC-0028 - BASE G5
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0028' OR UPPER(TRIM(nome)) = UPPER('BASE G5')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0028'),
        nome = 'BASE G5',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 320,
        preco_venda = 361.47,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 28) | NCM: 39174090 | Preço Unit.: R$ 320,00 | Valor ST: R$ 41,47 | Preço c/ ST: R$ 361,47',
        ativo = true
    WHERE codigo = 'PEC-0028' OR UPPER(TRIM(nome)) = UPPER('BASE G5');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0028', 'BASE G5', 'Peças', 'produto', 'UN', '39174090',
      320, 361.47, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 28) | NCM: 39174090 | Preço Unit.: R$ 320,00 | Valor ST: R$ 41,47 | Preço c/ ST: R$ 361,47', v_fornecedor_id
    );
  END IF;

  -- Linha 29: PEC-0029 - BASE G6
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0029' OR UPPER(TRIM(nome)) = UPPER('BASE G6')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0029'),
        nome = 'BASE G6',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 290,
        preco_venda = 327.58,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 29) | NCM: 39174090 | Preço Unit.: R$ 290,00 | Valor ST: R$ 37,58 | Preço c/ ST: R$ 327,58',
        ativo = true
    WHERE codigo = 'PEC-0029' OR UPPER(TRIM(nome)) = UPPER('BASE G6');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0029', 'BASE G6', 'Peças', 'produto', 'UN', '39174090',
      290, 327.58, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 29) | NCM: 39174090 | Preço Unit.: R$ 290,00 | Valor ST: R$ 37,58 | Preço c/ ST: R$ 327,58', v_fornecedor_id
    );
  END IF;

  -- Linha 30: PEC-0030 - BASE G7
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0030' OR UPPER(TRIM(nome)) = UPPER('BASE G7')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0030'),
        nome = 'BASE G7',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 290,
        preco_venda = 327.58,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 30) | NCM: 39174090 | Preço Unit.: R$ 290,00 | Valor ST: R$ 37,58 | Preço c/ ST: R$ 327,58',
        ativo = true
    WHERE codigo = 'PEC-0030' OR UPPER(TRIM(nome)) = UPPER('BASE G7');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0030', 'BASE G7', 'Peças', 'produto', 'UN', '39174090',
      290, 327.58, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 30) | NCM: 39174090 | Preço Unit.: R$ 290,00 | Valor ST: R$ 37,58 | Preço c/ ST: R$ 327,58', v_fornecedor_id
    );
  END IF;

  -- Linha 31: PEC-0031 - BLOCO ECO SYSTEM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0031' OR UPPER(TRIM(nome)) = UPPER('BLOCO ECO SYSTEM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0031'),
        nome = 'BLOCO ECO SYSTEM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 250,
        preco_venda = 282.4,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 31) | NCM: 39172900 | Preço Unit.: R$ 250,00 | Valor ST: R$ 32,40 | Preço c/ ST: R$ 282,40',
        ativo = true
    WHERE codigo = 'PEC-0031' OR UPPER(TRIM(nome)) = UPPER('BLOCO ECO SYSTEM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0031', 'BLOCO ECO SYSTEM', 'Peças', 'produto', 'UN', '39172900',
      250, 282.4, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 31) | NCM: 39172900 | Preço Unit.: R$ 250,00 | Valor ST: R$ 32,40 | Preço c/ ST: R$ 282,40', v_fornecedor_id
    );
  END IF;

  -- Linha 32: PEC-0032 - BLOCO PROGEU G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0032' OR UPPER(TRIM(nome)) = UPPER('BLOCO PROGEU G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0032'),
        nome = 'BLOCO PROGEU G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 830,
        preco_venda = 937.57,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 32) | NCM: 39172900 | Preço Unit.: R$ 830,00 | Valor ST: R$ 107,57 | Preço c/ ST: R$ 937,57',
        ativo = true
    WHERE codigo = 'PEC-0032' OR UPPER(TRIM(nome)) = UPPER('BLOCO PROGEU G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0032', 'BLOCO PROGEU G4', 'Peças', 'produto', 'UN', '39172900',
      830, 937.57, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 32) | NCM: 39172900 | Preço Unit.: R$ 830,00 | Valor ST: R$ 107,57 | Preço c/ ST: R$ 937,57', v_fornecedor_id
    );
  END IF;

  -- Linha 33: PEC-0033 - BLOCO SPLASH
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0033' OR UPPER(TRIM(nome)) = UPPER('BLOCO SPLASH')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0033'),
        nome = 'BLOCO SPLASH',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 250,
        preco_venda = 282.4,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 33) | NCM: 39172900 | Preço Unit.: R$ 250,00 | Valor ST: R$ 32,40 | Preço c/ ST: R$ 282,40',
        ativo = true
    WHERE codigo = 'PEC-0033' OR UPPER(TRIM(nome)) = UPPER('BLOCO SPLASH');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0033', 'BLOCO SPLASH', 'Peças', 'produto', 'UN', '39172900',
      250, 282.4, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 33) | NCM: 39172900 | Preço Unit.: R$ 250,00 | Valor ST: R$ 32,40 | Preço c/ ST: R$ 282,40', v_fornecedor_id
    );
  END IF;

  -- Linha 34: PEC-0034 - BOCAL MANGUEIRA (CX C/ 30 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0034' OR UPPER(TRIM(nome)) = UPPER('BOCAL MANGUEIRA (CX C/ 30 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0034'),
        nome = 'BOCAL MANGUEIRA (CX C/ 30 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39173900',
        preco_custo = 185,
        preco_venda = 210.84,
        unidades_por_compra = 30,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 34) | NCM: 39173900 | Preço Unit.: R$ 185,00 | Valor ST: R$ 25,84 | Preço c/ ST: R$ 210,84',
        ativo = true
    WHERE codigo = 'PEC-0034' OR UPPER(TRIM(nome)) = UPPER('BOCAL MANGUEIRA (CX C/ 30 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0034', 'BOCAL MANGUEIRA (CX C/ 30 UN)', 'Peças', 'produto', 'UN', '39173900',
      185, 210.84, 0, 0,
      30, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 34) | NCM: 39173900 | Preço Unit.: R$ 185,00 | Valor ST: R$ 25,84 | Preço c/ ST: R$ 210,84', v_fornecedor_id
    );
  END IF;

  -- Linha 35: PEC-0035 - BOIA C/ ADAPTADOR PLUS (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0035' OR UPPER(TRIM(nome)) = UPPER('BOIA C/ ADAPTADOR PLUS (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0035'),
        nome = 'BOIA C/ ADAPTADOR PLUS (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84818019',
        preco_custo = 130,
        preco_venda = 149.89,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 35) | NCM: 84818019 | Preço Unit.: R$ 130,00 | Valor ST: R$ 19,89 | Preço c/ ST: R$ 149,89',
        ativo = true
    WHERE codigo = 'PEC-0035' OR UPPER(TRIM(nome)) = UPPER('BOIA C/ ADAPTADOR PLUS (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0035', 'BOIA C/ ADAPTADOR PLUS (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '84818019',
      130, 149.89, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 35) | NCM: 84818019 | Preço Unit.: R$ 130,00 | Valor ST: R$ 19,89 | Preço c/ ST: R$ 149,89', v_fornecedor_id
    );
  END IF;

  -- Linha 36: PEC-0036 - BOIA PAPATERRA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0036' OR UPPER(TRIM(nome)) = UPPER('BOIA PAPATERRA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0036'),
        nome = 'BOIA PAPATERRA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84818019',
        preco_custo = 29,
        preco_venda = 33.44,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 36) | NCM: 84818019 | Preço Unit.: R$ 29,00 | Valor ST: R$ 4,44 | Preço c/ ST: R$ 33,44',
        ativo = true
    WHERE codigo = 'PEC-0036' OR UPPER(TRIM(nome)) = UPPER('BOIA PAPATERRA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0036', 'BOIA PAPATERRA', 'Peças', 'produto', 'UN', '84818019',
      29, 33.44, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 36) | NCM: 84818019 | Preço Unit.: R$ 29,00 | Valor ST: R$ 4,44 | Preço c/ ST: R$ 33,44', v_fornecedor_id
    );
  END IF;

  -- Linha 37: PEC-0037 - BOLACHA - PAPATERRA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0037' OR UPPER(TRIM(nome)) = UPPER('BOLACHA - PAPATERRA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0037'),
        nome = 'BOLACHA - PAPATERRA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 129,
        preco_venda = 145.72,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 37) | NCM: 39174090 | Preço Unit.: R$ 129,00 | Valor ST: R$ 16,72 | Preço c/ ST: R$ 145,72',
        ativo = true
    WHERE codigo = 'PEC-0037' OR UPPER(TRIM(nome)) = UPPER('BOLACHA - PAPATERRA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0037', 'BOLACHA - PAPATERRA', 'Peças', 'produto', 'UN', '39174090',
      129, 145.72, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 37) | NCM: 39174090 | Preço Unit.: R$ 129,00 | Valor ST: R$ 16,72 | Preço c/ ST: R$ 145,72', v_fornecedor_id
    );
  END IF;

  -- Linha 38: PEC-0038 - BOMBA 1/2 CV
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0038' OR UPPER(TRIM(nome)) = UPPER('BOMBA 1/2 CV')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0038'),
        nome = 'BOMBA 1/2 CV',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84139200',
        preco_custo = 220,
        preco_venda = 220,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 38) | NCM: 84139200 | Preço Unit.: R$ 220,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 220,00',
        ativo = true
    WHERE codigo = 'PEC-0038' OR UPPER(TRIM(nome)) = UPPER('BOMBA 1/2 CV');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0038', 'BOMBA 1/2 CV', 'Peças', 'produto', 'UN', '84139200',
      220, 220, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 38) | NCM: 84139200 | Preço Unit.: R$ 220,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 220,00', v_fornecedor_id
    );
  END IF;

  -- Linha 39: PEC-0039 - BOMBA 2 CV
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0039' OR UPPER(TRIM(nome)) = UPPER('BOMBA 2 CV')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0039'),
        nome = 'BOMBA 2 CV',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84139200',
        preco_custo = 950,
        preco_venda = 950,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 39) | NCM: 84139200 | Preço Unit.: R$ 950,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 950,00',
        ativo = true
    WHERE codigo = 'PEC-0039' OR UPPER(TRIM(nome)) = UPPER('BOMBA 2 CV');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0039', 'BOMBA 2 CV', 'Peças', 'produto', 'UN', '84139200',
      950, 950, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 39) | NCM: 84139200 | Preço Unit.: R$ 950,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 950,00', v_fornecedor_id
    );
  END IF;

  -- Linha 40: PEC-0040 - BOMBA 3/4 CV
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0040' OR UPPER(TRIM(nome)) = UPPER('BOMBA 3/4 CV')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0040'),
        nome = 'BOMBA 3/4 CV',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84139200',
        preco_custo = 250,
        preco_venda = 250,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 40) | NCM: 84139200 | Preço Unit.: R$ 250,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 250,00',
        ativo = true
    WHERE codigo = 'PEC-0040' OR UPPER(TRIM(nome)) = UPPER('BOMBA 3/4 CV');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0040', 'BOMBA 3/4 CV', 'Peças', 'produto', 'UN', '84139200',
      250, 250, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 40) | NCM: 84139200 | Preço Unit.: R$ 250,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 250,00', v_fornecedor_id
    );
  END IF;

  -- Linha 41: PEC-0041 - BOMBA DOSADOR SOLO G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0041' OR UPPER(TRIM(nome)) = UPPER('BOMBA DOSADOR SOLO G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0041'),
        nome = 'BOMBA DOSADOR SOLO G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84138100',
        preco_custo = 55,
        preco_venda = 55,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 41) | NCM: 84138100 | Preço Unit.: R$ 55,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 55,00',
        ativo = true
    WHERE codigo = 'PEC-0041' OR UPPER(TRIM(nome)) = UPPER('BOMBA DOSADOR SOLO G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0041', 'BOMBA DOSADOR SOLO G4', 'Peças', 'produto', 'UN', '84138100',
      55, 55, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 41) | NCM: 84138100 | Preço Unit.: R$ 55,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 55,00', v_fornecedor_id
    );
  END IF;

  -- Linha 42: PEC-0042 - BONECO IGUI LEGAL
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0042' OR UPPER(TRIM(nome)) = UPPER('BONECO IGUI LEGAL')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0042'),
        nome = 'BONECO IGUI LEGAL',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '95030099',
        preco_custo = 14,
        preco_venda = 14,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 42) | NCM: 95030099 | Preço Unit.: R$ 14,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 14,00',
        ativo = true
    WHERE codigo = 'PEC-0042' OR UPPER(TRIM(nome)) = UPPER('BONECO IGUI LEGAL');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0042', 'BONECO IGUI LEGAL', 'Peças', 'produto', 'UN', '95030099',
      14, 14, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 42) | NCM: 95030099 | Preço Unit.: R$ 14,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 14,00', v_fornecedor_id
    );
  END IF;

  -- Linha 43: PEC-0043 - BORN CONECTOR ALIMENTAÇÃO THERMAS
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0043' OR UPPER(TRIM(nome)) = UPPER('BORN CONECTOR ALIMENTAÇÃO THERMAS')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0043'),
        nome = 'BORN CONECTOR ALIMENTAÇÃO THERMAS',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 7.5,
        preco_venda = 7.5,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 43) | NCM: 84189900 | Preço Unit.: R$ 7,50 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 7,50',
        ativo = true
    WHERE codigo = 'PEC-0043' OR UPPER(TRIM(nome)) = UPPER('BORN CONECTOR ALIMENTAÇÃO THERMAS');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0043', 'BORN CONECTOR ALIMENTAÇÃO THERMAS', 'Peças', 'produto', 'UN', '84189900',
      7.5, 7.5, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 43) | NCM: 84189900 | Preço Unit.: R$ 7,50 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 7,50', v_fornecedor_id
    );
  END IF;

  -- Linha 44: PEC-0044 - BRAQUETE (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0044' OR UPPER(TRIM(nome)) = UPPER('BRAQUETE (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0044'),
        nome = 'BRAQUETE (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84139200',
        preco_custo = 245,
        preco_venda = 245,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 44) | NCM: 84139200 | Preço Unit.: R$ 245,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 245,00',
        ativo = true
    WHERE codigo = 'PEC-0044' OR UPPER(TRIM(nome)) = UPPER('BRAQUETE (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0044', 'BRAQUETE (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '84139200',
      245, 245, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 44) | NCM: 84139200 | Preço Unit.: R$ 245,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 245,00', v_fornecedor_id
    );
  END IF;

  -- Linha 45: PEC-0045 - CABO PP ASPIRADOR (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0045' OR UPPER(TRIM(nome)) = UPPER('CABO PP ASPIRADOR (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0045'),
        nome = 'CABO PP ASPIRADOR (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 90,
        preco_venda = 101.66,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 45) | NCM: 39172900 | Preço Unit.: R$ 90,00 | Valor ST: R$ 11,66 | Preço c/ ST: R$ 101,66',
        ativo = true
    WHERE codigo = 'PEC-0045' OR UPPER(TRIM(nome)) = UPPER('CABO PP ASPIRADOR (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0045', 'CABO PP ASPIRADOR (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39172900',
      90, 101.66, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 45) | NCM: 39172900 | Preço Unit.: R$ 90,00 | Valor ST: R$ 11,66 | Preço c/ ST: R$ 101,66', v_fornecedor_id
    );
  END IF;

  -- Linha 46: PEC-0046 - CAIXA COMANDO 120W FIBRA OPTICA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0046' OR UPPER(TRIM(nome)) = UPPER('CAIXA COMANDO 120W FIBRA OPTICA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0046'),
        nome = 'CAIXA COMANDO 120W FIBRA OPTICA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85437099',
        preco_custo = 6000,
        preco_venda = 6000,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 46) | NCM: 85437099 | Preço Unit.: R$ 6.000,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 6.000,00',
        ativo = true
    WHERE codigo = 'PEC-0046' OR UPPER(TRIM(nome)) = UPPER('CAIXA COMANDO 120W FIBRA OPTICA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0046', 'CAIXA COMANDO 120W FIBRA OPTICA', 'Peças', 'produto', 'UN', '85437099',
      6000, 6000, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 46) | NCM: 85437099 | Preço Unit.: R$ 6.000,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 6.000,00', v_fornecedor_id
    );
  END IF;

  -- Linha 47: PEC-0047 - CAIXA COMANDO 45W FIBRA OPTICA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0047' OR UPPER(TRIM(nome)) = UPPER('CAIXA COMANDO 45W FIBRA OPTICA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0047'),
        nome = 'CAIXA COMANDO 45W FIBRA OPTICA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85437099',
        preco_custo = 6000,
        preco_venda = 6000,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 47) | NCM: 85437099 | Preço Unit.: R$ 6.000,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 6.000,00',
        ativo = true
    WHERE codigo = 'PEC-0047' OR UPPER(TRIM(nome)) = UPPER('CAIXA COMANDO 45W FIBRA OPTICA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0047', 'CAIXA COMANDO 45W FIBRA OPTICA', 'Peças', 'produto', 'UN', '85437099',
      6000, 6000, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 47) | NCM: 85437099 | Preço Unit.: R$ 6.000,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 6.000,00', v_fornecedor_id
    );
  END IF;

  -- Linha 48: PEC-0048 - CAIXA DE COMANDO DUO COMPACT SPA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0048' OR UPPER(TRIM(nome)) = UPPER('CAIXA DE COMANDO DUO COMPACT SPA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0048'),
        nome = 'CAIXA DE COMANDO DUO COMPACT SPA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85371090',
        preco_custo = 750,
        preco_venda = 750,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 48) | NCM: 85371090 | Preço Unit.: R$ 750,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 750,00',
        ativo = true
    WHERE codigo = 'PEC-0048' OR UPPER(TRIM(nome)) = UPPER('CAIXA DE COMANDO DUO COMPACT SPA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0048', 'CAIXA DE COMANDO DUO COMPACT SPA', 'Peças', 'produto', 'UN', '85371090',
      750, 750, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 48) | NCM: 85371090 | Preço Unit.: R$ 750,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 750,00', v_fornecedor_id
    );
  END IF;

  -- Linha 49: PEC-0049 - CAIXA DE COMANDO SAUNA CLUB
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0049' OR UPPER(TRIM(nome)) = UPPER('CAIXA DE COMANDO SAUNA CLUB')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0049'),
        nome = 'CAIXA DE COMANDO SAUNA CLUB',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '91070010',
        preco_custo = 1050,
        preco_venda = 1050,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 49) | NCM: 91070010 | Preço Unit.: R$ 1.050,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.050,00',
        ativo = true
    WHERE codigo = 'PEC-0049' OR UPPER(TRIM(nome)) = UPPER('CAIXA DE COMANDO SAUNA CLUB');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0049', 'CAIXA DE COMANDO SAUNA CLUB', 'Peças', 'produto', 'UN', '91070010',
      1050, 1050, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 49) | NCM: 91070010 | Preço Unit.: R$ 1.050,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.050,00', v_fornecedor_id
    );
  END IF;

  -- Linha 50: PEC-0050 - CAIXA DE COMANDO SPA LUXO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0050' OR UPPER(TRIM(nome)) = UPPER('CAIXA DE COMANDO SPA LUXO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0050'),
        nome = 'CAIXA DE COMANDO SPA LUXO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85371090',
        preco_custo = 7000,
        preco_venda = 7000,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 50) | NCM: 85371090 | Preço Unit.: R$ 7.000,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 7.000,00',
        ativo = true
    WHERE codigo = 'PEC-0050' OR UPPER(TRIM(nome)) = UPPER('CAIXA DE COMANDO SPA LUXO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0050', 'CAIXA DE COMANDO SPA LUXO', 'Peças', 'produto', 'UN', '85371090',
      7000, 7000, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 50) | NCM: 85371090 | Preço Unit.: R$ 7.000,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 7.000,00', v_fornecedor_id
    );
  END IF;

  -- Linha 51: PEC-0051 - CAIXA DO REATOR LAMPADA UV
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0051' OR UPPER(TRIM(nome)) = UPPER('CAIXA DO REATOR LAMPADA UV')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0051'),
        nome = 'CAIXA DO REATOR LAMPADA UV',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 20,
        preco_venda = 22.59,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 51) | NCM: 39174090 | Preço Unit.: R$ 20,00 | Valor ST: R$ 2,59 | Preço c/ ST: R$ 22,59',
        ativo = true
    WHERE codigo = 'PEC-0051' OR UPPER(TRIM(nome)) = UPPER('CAIXA DO REATOR LAMPADA UV');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0051', 'CAIXA DO REATOR LAMPADA UV', 'Peças', 'produto', 'UN', '39174090',
      20, 22.59, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 51) | NCM: 39174090 | Preço Unit.: R$ 20,00 | Valor ST: R$ 2,59 | Preço c/ ST: R$ 22,59', v_fornecedor_id
    );
  END IF;

  -- Linha 52: PEC-0052 - CAIXA DOS REGISTROS ELETRONIC SYSTEM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0052' OR UPPER(TRIM(nome)) = UPPER('CAIXA DOS REGISTROS ELETRONIC SYSTEM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0052'),
        nome = 'CAIXA DOS REGISTROS ELETRONIC SYSTEM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 1025,
        preco_venda = 1157.84,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 52) | NCM: 39174090 | Preço Unit.: R$ 1.025,00 | Valor ST: R$ 132,84 | Preço c/ ST: R$ 1.157,84',
        ativo = true
    WHERE codigo = 'PEC-0052' OR UPPER(TRIM(nome)) = UPPER('CAIXA DOS REGISTROS ELETRONIC SYSTEM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0052', 'CAIXA DOS REGISTROS ELETRONIC SYSTEM', 'Peças', 'produto', 'UN', '39174090',
      1025, 1157.84, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 52) | NCM: 39174090 | Preço Unit.: R$ 1.025,00 | Valor ST: R$ 132,84 | Preço c/ ST: R$ 1.157,84', v_fornecedor_id
    );
  END IF;

  -- Linha 53: PEC-0053 - CANO CASCATA (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0053' OR UPPER(TRIM(nome)) = UPPER('CANO CASCATA (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0053'),
        nome = 'CANO CASCATA (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 25,
        preco_venda = 28.24,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 53) | NCM: 39174090 | Preço Unit.: R$ 25,00 | Valor ST: R$ 3,24 | Preço c/ ST: R$ 28,24',
        ativo = true
    WHERE codigo = 'PEC-0053' OR UPPER(TRIM(nome)) = UPPER('CANO CASCATA (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0053', 'CANO CASCATA (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39174090',
      25, 28.24, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 53) | NCM: 39174090 | Preço Unit.: R$ 25,00 | Valor ST: R$ 3,24 | Preço c/ ST: R$ 28,24', v_fornecedor_id
    );
  END IF;

  -- Linha 54: PEC-0054 - CANO EDEM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0054' OR UPPER(TRIM(nome)) = UPPER('CANO EDEM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0054'),
        nome = 'CANO EDEM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 6,
        preco_venda = 6.78,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 54) | NCM: 39174090 | Preço Unit.: R$ 6,00 | Valor ST: R$ 0,78 | Preço c/ ST: R$ 6,78',
        ativo = true
    WHERE codigo = 'PEC-0054' OR UPPER(TRIM(nome)) = UPPER('CANO EDEM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0054', 'CANO EDEM', 'Peças', 'produto', 'UN', '39174090',
      6, 6.78, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 54) | NCM: 39174090 | Preço Unit.: R$ 6,00 | Valor ST: R$ 0,78 | Preço c/ ST: R$ 6,78', v_fornecedor_id
    );
  END IF;

  -- Linha 55: PEC-0055 - CANO ESPERA U.V. G3
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0055' OR UPPER(TRIM(nome)) = UPPER('CANO ESPERA U.V. G3')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0055'),
        nome = 'CANO ESPERA U.V. G3',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172100',
        preco_custo = 50,
        preco_venda = 56.48,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 55) | NCM: 39172100 | Preço Unit.: R$ 50,00 | Valor ST: R$ 6,48 | Preço c/ ST: R$ 56,48',
        ativo = true
    WHERE codigo = 'PEC-0055' OR UPPER(TRIM(nome)) = UPPER('CANO ESPERA U.V. G3');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0055', 'CANO ESPERA U.V. G3', 'Peças', 'produto', 'UN', '39172100',
      50, 56.48, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 55) | NCM: 39172100 | Preço Unit.: R$ 50,00 | Valor ST: R$ 6,48 | Preço c/ ST: R$ 56,48', v_fornecedor_id
    );
  END IF;

  -- Linha 56: PEC-0056 - CAP 50MM (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0056' OR UPPER(TRIM(nome)) = UPPER('CAP 50MM (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0056'),
        nome = 'CAP 50MM (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 120,
        preco_venda = 150.55,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 56) | NCM: 39269090 | Preço Unit.: R$ 120,00 | Valor ST: R$ 30,55 | Preço c/ ST: R$ 150,55',
        ativo = true
    WHERE codigo = 'PEC-0056' OR UPPER(TRIM(nome)) = UPPER('CAP 50MM (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0056', 'CAP 50MM (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39269090',
      120, 150.55, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 56) | NCM: 39269090 | Preço Unit.: R$ 120,00 | Valor ST: R$ 30,55 | Preço c/ ST: R$ 150,55', v_fornecedor_id
    );
  END IF;

  -- Linha 57: PEC-0057 - CAP CASULO UV G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0057' OR UPPER(TRIM(nome)) = UPPER('CAP CASULO UV G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0057'),
        nome = 'CAP CASULO UV G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 5,
        preco_venda = 6.27,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 57) | NCM: 39269090 | Preço Unit.: R$ 5,00 | Valor ST: R$ 1,27 | Preço c/ ST: R$ 6,27',
        ativo = true
    WHERE codigo = 'PEC-0057' OR UPPER(TRIM(nome)) = UPPER('CAP CASULO UV G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0057', 'CAP CASULO UV G4', 'Peças', 'produto', 'UN', '39269090',
      5, 6.27, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 57) | NCM: 39269090 | Preço Unit.: R$ 5,00 | Valor ST: R$ 1,27 | Preço c/ ST: R$ 6,27', v_fornecedor_id
    );
  END IF;

  -- Linha 58: PEC-0058 - CAP TRANSPARENTE ESPERA AQUECIMENTO G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0058' OR UPPER(TRIM(nome)) = UPPER('CAP TRANSPARENTE ESPERA AQUECIMENTO G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0058'),
        nome = 'CAP TRANSPARENTE ESPERA AQUECIMENTO G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 2,
        preco_venda = 2.51,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 58) | NCM: 39269090 | Preço Unit.: R$ 2,00 | Valor ST: R$ 0,51 | Preço c/ ST: R$ 2,51',
        ativo = true
    WHERE codigo = 'PEC-0058' OR UPPER(TRIM(nome)) = UPPER('CAP TRANSPARENTE ESPERA AQUECIMENTO G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0058', 'CAP TRANSPARENTE ESPERA AQUECIMENTO G4', 'Peças', 'produto', 'UN', '39269090',
      2, 2.51, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 58) | NCM: 39269090 | Preço Unit.: R$ 2,00 | Valor ST: R$ 0,51 | Preço c/ ST: R$ 2,51', v_fornecedor_id
    );
  END IF;

  -- Linha 59: PEC-0059 - CAPA MOTOR ESTRUTURA LEVITA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0059' OR UPPER(TRIM(nome)) = UPPER('CAPA MOTOR ESTRUTURA LEVITA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0059'),
        nome = 'CAPA MOTOR ESTRUTURA LEVITA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39201099',
        preco_custo = 375,
        preco_venda = 375,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 59) | NCM: 39201099 | Preço Unit.: R$ 375,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 375,00',
        ativo = true
    WHERE codigo = 'PEC-0059' OR UPPER(TRIM(nome)) = UPPER('CAPA MOTOR ESTRUTURA LEVITA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0059', 'CAPA MOTOR ESTRUTURA LEVITA', 'Peças', 'produto', 'UN', '39201099',
      375, 375, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 59) | NCM: 39201099 | Preço Unit.: R$ 375,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 375,00', v_fornecedor_id
    );
  END IF;

  -- Linha 60: PEC-0060 - CAPACITOR 30UF
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0060' OR UPPER(TRIM(nome)) = UPPER('CAPACITOR 30UF')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0060'),
        nome = 'CAPACITOR 30UF',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85322200',
        preco_custo = 170,
        preco_venda = 170,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 60) | NCM: 85322200 | Preço Unit.: R$ 170,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 170,00',
        ativo = true
    WHERE codigo = 'PEC-0060' OR UPPER(TRIM(nome)) = UPPER('CAPACITOR 30UF');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0060', 'CAPACITOR 30UF', 'Peças', 'produto', 'UN', '85322200',
      170, 170, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 60) | NCM: 85322200 | Preço Unit.: R$ 170,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 170,00', v_fornecedor_id
    );
  END IF;

  -- Linha 61: PEC-0061 - CAPACITOR 40UF
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0061' OR UPPER(TRIM(nome)) = UPPER('CAPACITOR 40UF')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0061'),
        nome = 'CAPACITOR 40UF',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85322200',
        preco_custo = 180,
        preco_venda = 180,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 61) | NCM: 85322200 | Preço Unit.: R$ 180,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 180,00',
        ativo = true
    WHERE codigo = 'PEC-0061' OR UPPER(TRIM(nome)) = UPPER('CAPACITOR 40UF');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0061', 'CAPACITOR 40UF', 'Peças', 'produto', 'UN', '85322200',
      180, 180, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 61) | NCM: 85322200 | Preço Unit.: R$ 180,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 180,00', v_fornecedor_id
    );
  END IF;

  -- Linha 62: PEC-0062 - CAPACITOR 55UF
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0062' OR UPPER(TRIM(nome)) = UPPER('CAPACITOR 55UF')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0062'),
        nome = 'CAPACITOR 55UF',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85322200',
        preco_custo = 230,
        preco_venda = 230,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 62) | NCM: 85322200 | Preço Unit.: R$ 230,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 230,00',
        ativo = true
    WHERE codigo = 'PEC-0062' OR UPPER(TRIM(nome)) = UPPER('CAPACITOR 55UF');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0062', 'CAPACITOR 55UF', 'Peças', 'produto', 'UN', '85322200',
      230, 230, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 62) | NCM: 85322200 | Preço Unit.: R$ 230,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 230,00', v_fornecedor_id
    );
  END IF;

  -- Linha 63: PEC-0063 - CAPACITOR DO MOTOR DA VENTOINHA 2UF
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0063' OR UPPER(TRIM(nome)) = UPPER('CAPACITOR DO MOTOR DA VENTOINHA 2UF')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0063'),
        nome = 'CAPACITOR DO MOTOR DA VENTOINHA 2UF',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85322590',
        preco_custo = 50,
        preco_venda = 50,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 63) | NCM: 85322590 | Preço Unit.: R$ 50,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 50,00',
        ativo = true
    WHERE codigo = 'PEC-0063' OR UPPER(TRIM(nome)) = UPPER('CAPACITOR DO MOTOR DA VENTOINHA 2UF');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0063', 'CAPACITOR DO MOTOR DA VENTOINHA 2UF', 'Peças', 'produto', 'UN', '85322590',
      50, 50, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 63) | NCM: 85322590 | Preço Unit.: R$ 50,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 50,00', v_fornecedor_id
    );
  END IF;

  -- Linha 64: PEC-0064 - CAPACITOR DO MOTOR DA VENTOINHA 4 UF
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0064' OR UPPER(TRIM(nome)) = UPPER('CAPACITOR DO MOTOR DA VENTOINHA 4 UF')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0064'),
        nome = 'CAPACITOR DO MOTOR DA VENTOINHA 4 UF',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85322590',
        preco_custo = 50,
        preco_venda = 50,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 64) | NCM: 85322590 | Preço Unit.: R$ 50,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 50,00',
        ativo = true
    WHERE codigo = 'PEC-0064' OR UPPER(TRIM(nome)) = UPPER('CAPACITOR DO MOTOR DA VENTOINHA 4 UF');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0064', 'CAPACITOR DO MOTOR DA VENTOINHA 4 UF', 'Peças', 'produto', 'UN', '85322590',
      50, 50, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 64) | NCM: 85322590 | Preço Unit.: R$ 50,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 50,00', v_fornecedor_id
    );
  END IF;

  -- Linha 65: PEC-0065 - CASULO U.V G3 / FULL
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0065' OR UPPER(TRIM(nome)) = UPPER('CASULO U.V G3 / FULL')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0065'),
        nome = 'CASULO U.V G3 / FULL',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 200,
        preco_venda = 225.92,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 65) | NCM: 39174090 | Preço Unit.: R$ 200,00 | Valor ST: R$ 25,92 | Preço c/ ST: R$ 225,92',
        ativo = true
    WHERE codigo = 'PEC-0065' OR UPPER(TRIM(nome)) = UPPER('CASULO U.V G3 / FULL');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0065', 'CASULO U.V G3 / FULL', 'Peças', 'produto', 'UN', '39174090',
      200, 225.92, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 65) | NCM: 39174090 | Preço Unit.: R$ 200,00 | Valor ST: R$ 25,92 | Preço c/ ST: R$ 225,92', v_fornecedor_id
    );
  END IF;

  -- Linha 66: PEC-0066 - CASULO U.V. G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0066' OR UPPER(TRIM(nome)) = UPPER('CASULO U.V. G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0066'),
        nome = 'CASULO U.V. G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 250,
        preco_venda = 282.4,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 66) | NCM: 39174090 | Preço Unit.: R$ 250,00 | Valor ST: R$ 32,40 | Preço c/ ST: R$ 282,40',
        ativo = true
    WHERE codigo = 'PEC-0066' OR UPPER(TRIM(nome)) = UPPER('CASULO U.V. G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0066', 'CASULO U.V. G4', 'Peças', 'produto', 'UN', '39174090',
      250, 282.4, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 66) | NCM: 39174090 | Preço Unit.: R$ 250,00 | Valor ST: R$ 32,40 | Preço c/ ST: R$ 282,40', v_fornecedor_id
    );
  END IF;

  -- Linha 67: PEC-0067 - CHAVE DE SEGURANCA G4/G5
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0067' OR UPPER(TRIM(nome)) = UPPER('CHAVE DE SEGURANCA G4/G5')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0067'),
        nome = 'CHAVE DE SEGURANCA G4/G5',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 5,
        preco_venda = 6.27,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 67) | NCM: 39269090 | Preço Unit.: R$ 5,00 | Valor ST: R$ 1,27 | Preço c/ ST: R$ 6,27',
        ativo = true
    WHERE codigo = 'PEC-0067' OR UPPER(TRIM(nome)) = UPPER('CHAVE DE SEGURANCA G4/G5');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0067', 'CHAVE DE SEGURANCA G4/G5', 'Peças', 'produto', 'UN', '39269090',
      5, 6.27, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 67) | NCM: 39269090 | Preço Unit.: R$ 5,00 | Valor ST: R$ 1,27 | Preço c/ ST: R$ 6,27', v_fornecedor_id
    );
  END IF;

  -- Linha 68: PEC-0068 - CHAVE DO SKIMMER
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0068' OR UPPER(TRIM(nome)) = UPPER('CHAVE DO SKIMMER')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0068'),
        nome = 'CHAVE DO SKIMMER',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '82079000',
        preco_custo = 295,
        preco_venda = 332.4,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 68) | NCM: 82079000 | Preço Unit.: R$ 295,00 | Valor ST: R$ 37,40 | Preço c/ ST: R$ 332,40',
        ativo = true
    WHERE codigo = 'PEC-0068' OR UPPER(TRIM(nome)) = UPPER('CHAVE DO SKIMMER');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0068', 'CHAVE DO SKIMMER', 'Peças', 'produto', 'UN', '82079000',
      295, 332.4, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 68) | NCM: 82079000 | Preço Unit.: R$ 295,00 | Valor ST: R$ 37,40 | Preço c/ ST: R$ 332,40', v_fornecedor_id
    );
  END IF;

  -- Linha 69: PEC-0069 - CHAVE ESPECIAL ABRAÇADEIRA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0069' OR UPPER(TRIM(nome)) = UPPER('CHAVE ESPECIAL ABRAÇADEIRA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0069'),
        nome = 'CHAVE ESPECIAL ABRAÇADEIRA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '82079000',
        preco_custo = 260,
        preco_venda = 292.96,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 69) | NCM: 82079000 | Preço Unit.: R$ 260,00 | Valor ST: R$ 32,96 | Preço c/ ST: R$ 292,96',
        ativo = true
    WHERE codigo = 'PEC-0069' OR UPPER(TRIM(nome)) = UPPER('CHAVE ESPECIAL ABRAÇADEIRA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0069', 'CHAVE ESPECIAL ABRAÇADEIRA', 'Peças', 'produto', 'UN', '82079000',
      260, 292.96, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 69) | NCM: 82079000 | Preço Unit.: R$ 260,00 | Valor ST: R$ 32,96 | Preço c/ ST: R$ 292,96', v_fornecedor_id
    );
  END IF;

  -- Linha 70: PEC-0070 - CHAVE G4 ROSCA CASULO/REGISTRO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0070' OR UPPER(TRIM(nome)) = UPPER('CHAVE G4 ROSCA CASULO/REGISTRO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0070'),
        nome = 'CHAVE G4 ROSCA CASULO/REGISTRO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '82079000',
        preco_custo = 260,
        preco_venda = 292.96,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 70) | NCM: 82079000 | Preço Unit.: R$ 260,00 | Valor ST: R$ 32,96 | Preço c/ ST: R$ 292,96',
        ativo = true
    WHERE codigo = 'PEC-0070' OR UPPER(TRIM(nome)) = UPPER('CHAVE G4 ROSCA CASULO/REGISTRO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0070', 'CHAVE G4 ROSCA CASULO/REGISTRO', 'Peças', 'produto', 'UN', '82079000',
      260, 292.96, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 70) | NCM: 82079000 | Preço Unit.: R$ 260,00 | Valor ST: R$ 32,96 | Preço c/ ST: R$ 292,96', v_fornecedor_id
    );
  END IF;

  -- Linha 71: PEC-0071 - CHAVE UNIÃO E CASULO UV
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0071' OR UPPER(TRIM(nome)) = UPPER('CHAVE UNIÃO E CASULO UV')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0071'),
        nome = 'CHAVE UNIÃO E CASULO UV',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '82079000',
        preco_custo = 260,
        preco_venda = 292.96,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 71) | NCM: 82079000 | Preço Unit.: R$ 260,00 | Valor ST: R$ 32,96 | Preço c/ ST: R$ 292,96',
        ativo = true
    WHERE codigo = 'PEC-0071' OR UPPER(TRIM(nome)) = UPPER('CHAVE UNIÃO E CASULO UV');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0071', 'CHAVE UNIÃO E CASULO UV', 'Peças', 'produto', 'UN', '82079000',
      260, 292.96, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 71) | NCM: 82079000 | Preço Unit.: R$ 260,00 | Valor ST: R$ 32,96 | Preço c/ ST: R$ 292,96', v_fornecedor_id
    );
  END IF;

  -- Linha 72: PEC-0072 - CHAVE UNIÃO E ROSCA DO REGISTRO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0072' OR UPPER(TRIM(nome)) = UPPER('CHAVE UNIÃO E ROSCA DO REGISTRO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0072'),
        nome = 'CHAVE UNIÃO E ROSCA DO REGISTRO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '82079000',
        preco_custo = 260,
        preco_venda = 292.96,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 72) | NCM: 82079000 | Preço Unit.: R$ 260,00 | Valor ST: R$ 32,96 | Preço c/ ST: R$ 292,96',
        ativo = true
    WHERE codigo = 'PEC-0072' OR UPPER(TRIM(nome)) = UPPER('CHAVE UNIÃO E ROSCA DO REGISTRO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0072', 'CHAVE UNIÃO E ROSCA DO REGISTRO', 'Peças', 'produto', 'UN', '82079000',
      260, 292.96, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 72) | NCM: 82079000 | Preço Unit.: R$ 260,00 | Valor ST: R$ 32,96 | Preço c/ ST: R$ 292,96', v_fornecedor_id
    );
  END IF;

  -- Linha 73: PEC-0073 - CHAVEIRO IGUI
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0073' OR UPPER(TRIM(nome)) = UPPER('CHAVEIRO IGUI')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0073'),
        nome = 'CHAVEIRO IGUI',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39261000',
        preco_custo = 5,
        preco_venda = 5,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 73) | NCM: 39261000 | Preço Unit.: R$ 5,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 5,00',
        ativo = true
    WHERE codigo = 'PEC-0073' OR UPPER(TRIM(nome)) = UPPER('CHAVEIRO IGUI');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0073', 'CHAVEIRO IGUI', 'Peças', 'produto', 'UN', '39261000',
      5, 5, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 73) | NCM: 39261000 | Preço Unit.: R$ 5,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 5,00', v_fornecedor_id
    );
  END IF;

  -- Linha 74: PEC-0074 - CHUMBADOR RAIA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0074' OR UPPER(TRIM(nome)) = UPPER('CHUMBADOR RAIA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0074'),
        nome = 'CHUMBADOR RAIA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 7,
        preco_venda = 8.78,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 74) | NCM: 39269090 | Preço Unit.: R$ 7,00 | Valor ST: R$ 1,78 | Preço c/ ST: R$ 8,78',
        ativo = true
    WHERE codigo = 'PEC-0074' OR UPPER(TRIM(nome)) = UPPER('CHUMBADOR RAIA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0074', 'CHUMBADOR RAIA', 'Peças', 'produto', 'UN', '39269090',
      7, 8.78, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 74) | NCM: 39269090 | Preço Unit.: R$ 7,00 | Valor ST: R$ 1,78 | Preço c/ ST: R$ 8,78', v_fornecedor_id
    );
  END IF;

  -- Linha 75: PEC-0075 - CINTA DA RAIA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0075' OR UPPER(TRIM(nome)) = UPPER('CINTA DA RAIA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0075'),
        nome = 'CINTA DA RAIA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 165,
        preco_venda = 186.38,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 75) | NCM: 39172900 | Preço Unit.: R$ 165,00 | Valor ST: R$ 21,38 | Preço c/ ST: R$ 186,38',
        ativo = true
    WHERE codigo = 'PEC-0075' OR UPPER(TRIM(nome)) = UPPER('CINTA DA RAIA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0075', 'CINTA DA RAIA', 'Peças', 'produto', 'UN', '39172900',
      165, 186.38, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 75) | NCM: 39172900 | Preço Unit.: R$ 165,00 | Valor ST: R$ 21,38 | Preço c/ ST: R$ 186,38', v_fornecedor_id
    );
  END IF;

  -- Linha 76: PEC-0076 - CINTA DE FIXACAO LEVITA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0076' OR UPPER(TRIM(nome)) = UPPER('CINTA DE FIXACAO LEVITA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0076'),
        nome = 'CINTA DE FIXACAO LEVITA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 125,
        preco_venda = 141.2,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 76) | NCM: 39172900 | Preço Unit.: R$ 125,00 | Valor ST: R$ 16,20 | Preço c/ ST: R$ 141,20',
        ativo = true
    WHERE codigo = 'PEC-0076' OR UPPER(TRIM(nome)) = UPPER('CINTA DE FIXACAO LEVITA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0076', 'CINTA DE FIXACAO LEVITA', 'Peças', 'produto', 'UN', '39172900',
      125, 141.2, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 76) | NCM: 39172900 | Preço Unit.: R$ 125,00 | Valor ST: R$ 16,20 | Preço c/ ST: R$ 141,20', v_fornecedor_id
    );
  END IF;

  -- Linha 77: PEC-0077 - CJ HIDROTERAPIA (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0077' OR UPPER(TRIM(nome)) = UPPER('CJ HIDROTERAPIA (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0077'),
        nome = 'CJ HIDROTERAPIA (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 340,
        preco_venda = 384.06,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 77) | NCM: 39172900 | Preço Unit.: R$ 340,00 | Valor ST: R$ 44,06 | Preço c/ ST: R$ 384,06',
        ativo = true
    WHERE codigo = 'PEC-0077' OR UPPER(TRIM(nome)) = UPPER('CJ HIDROTERAPIA (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0077', 'CJ HIDROTERAPIA (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39172900',
      340, 384.06, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 77) | NCM: 39172900 | Preço Unit.: R$ 340,00 | Valor ST: R$ 44,06 | Preço c/ ST: R$ 384,06', v_fornecedor_id
    );
  END IF;

  -- Linha 78: PEC-0078 - CJ. AROS ELEM. PRATIC (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0078' OR UPPER(TRIM(nome)) = UPPER('CJ. AROS ELEM. PRATIC (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0078'),
        nome = 'CJ. AROS ELEM. PRATIC (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 150,
        preco_venda = 188.19,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 78) | NCM: 39269090 | Preço Unit.: R$ 150,00 | Valor ST: R$ 38,19 | Preço c/ ST: R$ 188,19',
        ativo = true
    WHERE codigo = 'PEC-0078' OR UPPER(TRIM(nome)) = UPPER('CJ. AROS ELEM. PRATIC (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0078', 'CJ. AROS ELEM. PRATIC (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39269090',
      150, 188.19, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 78) | NCM: 39269090 | Preço Unit.: R$ 150,00 | Valor ST: R$ 38,19 | Preço c/ ST: R$ 188,19', v_fornecedor_id
    );
  END IF;

  -- Linha 79: PEC-0079 - CJ. PRATO SUP. E INF. DE PLASTICO OMBRELONE FIXO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0079' OR UPPER(TRIM(nome)) = UPPER('CJ. PRATO SUP. E INF. DE PLASTICO OMBRELONE FIXO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0079'),
        nome = 'CJ. PRATO SUP. E INF. DE PLASTICO OMBRELONE FIXO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 180,
        preco_venda = 203.33,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 79) | NCM: 39172900 | Preço Unit.: R$ 180,00 | Valor ST: R$ 23,33 | Preço c/ ST: R$ 203,33',
        ativo = true
    WHERE codigo = 'PEC-0079' OR UPPER(TRIM(nome)) = UPPER('CJ. PRATO SUP. E INF. DE PLASTICO OMBRELONE FIXO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0079', 'CJ. PRATO SUP. E INF. DE PLASTICO OMBRELONE FIXO', 'Peças', 'produto', 'UN', '39172900',
      180, 203.33, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 79) | NCM: 39172900 | Preço Unit.: R$ 180,00 | Valor ST: R$ 23,33 | Preço c/ ST: R$ 203,33', v_fornecedor_id
    );
  END IF;

  -- Linha 80: PEC-0080 - CJ. TRAVA Q.C G7
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0080' OR UPPER(TRIM(nome)) = UPPER('CJ. TRAVA Q.C G7')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0080'),
        nome = 'CJ. TRAVA Q.C G7',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 50,
        preco_venda = 56.48,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 80) | NCM: 39174090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 6,48 | Preço c/ ST: R$ 56,48',
        ativo = true
    WHERE codigo = 'PEC-0080' OR UPPER(TRIM(nome)) = UPPER('CJ. TRAVA Q.C G7');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0080', 'CJ. TRAVA Q.C G7', 'Peças', 'produto', 'UN', '39174090',
      50, 56.48, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 80) | NCM: 39174090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 6,48 | Preço c/ ST: R$ 56,48', v_fornecedor_id
    );
  END IF;

  -- Linha 81: PEC-0081 - COLARINHO G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0081' OR UPPER(TRIM(nome)) = UPPER('COLARINHO G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0081'),
        nome = 'COLARINHO G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 230,
        preco_venda = 288.56,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 81) | NCM: 39269090 | Preço Unit.: R$ 230,00 | Valor ST: R$ 58,56 | Preço c/ ST: R$ 288,56',
        ativo = true
    WHERE codigo = 'PEC-0081' OR UPPER(TRIM(nome)) = UPPER('COLARINHO G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0081', 'COLARINHO G4', 'Peças', 'produto', 'UN', '39269090',
      230, 288.56, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 81) | NCM: 39269090 | Preço Unit.: R$ 230,00 | Valor ST: R$ 58,56 | Preço c/ ST: R$ 288,56', v_fornecedor_id
    );
  END IF;

  -- Linha 82: PEC-0082 - COLARINHO SKIMMER G5/G6 BRANCO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0082' OR UPPER(TRIM(nome)) = UPPER('COLARINHO SKIMMER G5/G6 BRANCO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0082'),
        nome = 'COLARINHO SKIMMER G5/G6 BRANCO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 90,
        preco_venda = 112.91,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 82) | NCM: 39269090 | Preço Unit.: R$ 90,00 | Valor ST: R$ 22,91 | Preço c/ ST: R$ 112,91',
        ativo = true
    WHERE codigo = 'PEC-0082' OR UPPER(TRIM(nome)) = UPPER('COLARINHO SKIMMER G5/G6 BRANCO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0082', 'COLARINHO SKIMMER G5/G6 BRANCO', 'Peças', 'produto', 'UN', '39269090',
      90, 112.91, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 82) | NCM: 39269090 | Preço Unit.: R$ 90,00 | Valor ST: R$ 22,91 | Preço c/ ST: R$ 112,91', v_fornecedor_id
    );
  END IF;

  -- Linha 83: PEC-0083 - COLARINHO SKIMMER G5/G6 CARVALHO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0083' OR UPPER(TRIM(nome)) = UPPER('COLARINHO SKIMMER G5/G6 CARVALHO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0083'),
        nome = 'COLARINHO SKIMMER G5/G6 CARVALHO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 90,
        preco_venda = 112.91,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 83) | NCM: 39269090 | Preço Unit.: R$ 90,00 | Valor ST: R$ 22,91 | Preço c/ ST: R$ 112,91',
        ativo = true
    WHERE codigo = 'PEC-0083' OR UPPER(TRIM(nome)) = UPPER('COLARINHO SKIMMER G5/G6 CARVALHO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0083', 'COLARINHO SKIMMER G5/G6 CARVALHO', 'Peças', 'produto', 'UN', '39269090',
      90, 112.91, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 83) | NCM: 39269090 | Preço Unit.: R$ 90,00 | Valor ST: R$ 22,91 | Preço c/ ST: R$ 112,91', v_fornecedor_id
    );
  END IF;

  -- Linha 84: PEC-0084 - COLARINHO SKIMMER G5/G6 CINZA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0084' OR UPPER(TRIM(nome)) = UPPER('COLARINHO SKIMMER G5/G6 CINZA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0084'),
        nome = 'COLARINHO SKIMMER G5/G6 CINZA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 90,
        preco_venda = 112.91,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 84) | NCM: 39269090 | Preço Unit.: R$ 90,00 | Valor ST: R$ 22,91 | Preço c/ ST: R$ 112,91',
        ativo = true
    WHERE codigo = 'PEC-0084' OR UPPER(TRIM(nome)) = UPPER('COLARINHO SKIMMER G5/G6 CINZA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0084', 'COLARINHO SKIMMER G5/G6 CINZA', 'Peças', 'produto', 'UN', '39269090',
      90, 112.91, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 84) | NCM: 39269090 | Preço Unit.: R$ 90,00 | Valor ST: R$ 22,91 | Preço c/ ST: R$ 112,91', v_fornecedor_id
    );
  END IF;

  -- Linha 85: PEC-0085 - COLARINHO SKIMMER G5/G6 IMBUIA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0085' OR UPPER(TRIM(nome)) = UPPER('COLARINHO SKIMMER G5/G6 IMBUIA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0085'),
        nome = 'COLARINHO SKIMMER G5/G6 IMBUIA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 90,
        preco_venda = 112.91,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 85) | NCM: 39269090 | Preço Unit.: R$ 90,00 | Valor ST: R$ 22,91 | Preço c/ ST: R$ 112,91',
        ativo = true
    WHERE codigo = 'PEC-0085' OR UPPER(TRIM(nome)) = UPPER('COLARINHO SKIMMER G5/G6 IMBUIA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0085', 'COLARINHO SKIMMER G5/G6 IMBUIA', 'Peças', 'produto', 'UN', '39269090',
      90, 112.91, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 85) | NCM: 39269090 | Preço Unit.: R$ 90,00 | Valor ST: R$ 22,91 | Preço c/ ST: R$ 112,91', v_fornecedor_id
    );
  END IF;

  -- Linha 86: PEC-0086 - COLARINHO SKIMMER G5/G6 MARFIM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0086' OR UPPER(TRIM(nome)) = UPPER('COLARINHO SKIMMER G5/G6 MARFIM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0086'),
        nome = 'COLARINHO SKIMMER G5/G6 MARFIM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 90,
        preco_venda = 112.91,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 86) | NCM: 39269090 | Preço Unit.: R$ 90,00 | Valor ST: R$ 22,91 | Preço c/ ST: R$ 112,91',
        ativo = true
    WHERE codigo = 'PEC-0086' OR UPPER(TRIM(nome)) = UPPER('COLARINHO SKIMMER G5/G6 MARFIM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0086', 'COLARINHO SKIMMER G5/G6 MARFIM', 'Peças', 'produto', 'UN', '39269090',
      90, 112.91, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 86) | NCM: 39269090 | Preço Unit.: R$ 90,00 | Valor ST: R$ 22,91 | Preço c/ ST: R$ 112,91', v_fornecedor_id
    );
  END IF;

  -- Linha 87: PEC-0087 - COLARINHO SKIMMER G5/G6 PRETO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0087' OR UPPER(TRIM(nome)) = UPPER('COLARINHO SKIMMER G5/G6 PRETO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0087'),
        nome = 'COLARINHO SKIMMER G5/G6 PRETO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 90,
        preco_venda = 112.91,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 87) | NCM: 39269090 | Preço Unit.: R$ 90,00 | Valor ST: R$ 22,91 | Preço c/ ST: R$ 112,91',
        ativo = true
    WHERE codigo = 'PEC-0087' OR UPPER(TRIM(nome)) = UPPER('COLARINHO SKIMMER G5/G6 PRETO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0087', 'COLARINHO SKIMMER G5/G6 PRETO', 'Peças', 'produto', 'UN', '39269090',
      90, 112.91, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 87) | NCM: 39269090 | Preço Unit.: R$ 90,00 | Valor ST: R$ 22,91 | Preço c/ ST: R$ 112,91', v_fornecedor_id
    );
  END IF;

  -- Linha 88: PEC-0088 - COLARINHO SKIMMER G7 BRANCO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0088' OR UPPER(TRIM(nome)) = UPPER('COLARINHO SKIMMER G7 BRANCO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0088'),
        nome = 'COLARINHO SKIMMER G7 BRANCO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 90,
        preco_venda = 112.91,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 88) | NCM: 39269090 | Preço Unit.: R$ 90,00 | Valor ST: R$ 22,91 | Preço c/ ST: R$ 112,91',
        ativo = true
    WHERE codigo = 'PEC-0088' OR UPPER(TRIM(nome)) = UPPER('COLARINHO SKIMMER G7 BRANCO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0088', 'COLARINHO SKIMMER G7 BRANCO', 'Peças', 'produto', 'UN', '39269090',
      90, 112.91, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 88) | NCM: 39269090 | Preço Unit.: R$ 90,00 | Valor ST: R$ 22,91 | Preço c/ ST: R$ 112,91', v_fornecedor_id
    );
  END IF;

  -- Linha 89: PEC-0089 - COLARINHO SKIMMER G7 CINZA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0089' OR UPPER(TRIM(nome)) = UPPER('COLARINHO SKIMMER G7 CINZA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0089'),
        nome = 'COLARINHO SKIMMER G7 CINZA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 90,
        preco_venda = 112.91,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 89) | NCM: 39269090 | Preço Unit.: R$ 90,00 | Valor ST: R$ 22,91 | Preço c/ ST: R$ 112,91',
        ativo = true
    WHERE codigo = 'PEC-0089' OR UPPER(TRIM(nome)) = UPPER('COLARINHO SKIMMER G7 CINZA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0089', 'COLARINHO SKIMMER G7 CINZA', 'Peças', 'produto', 'UN', '39269090',
      90, 112.91, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 89) | NCM: 39269090 | Preço Unit.: R$ 90,00 | Valor ST: R$ 22,91 | Preço c/ ST: R$ 112,91', v_fornecedor_id
    );
  END IF;

  -- Linha 90: PEC-0090 - COLARINHO SKIMMER G7 PRETO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0090' OR UPPER(TRIM(nome)) = UPPER('COLARINHO SKIMMER G7 PRETO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0090'),
        nome = 'COLARINHO SKIMMER G7 PRETO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 90,
        preco_venda = 112.91,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 90) | NCM: 39269090 | Preço Unit.: R$ 90,00 | Valor ST: R$ 22,91 | Preço c/ ST: R$ 112,91',
        ativo = true
    WHERE codigo = 'PEC-0090' OR UPPER(TRIM(nome)) = UPPER('COLARINHO SKIMMER G7 PRETO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0090', 'COLARINHO SKIMMER G7 PRETO', 'Peças', 'produto', 'UN', '39269090',
      90, 112.91, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 90) | NCM: 39269090 | Preço Unit.: R$ 90,00 | Valor ST: R$ 22,91 | Preço c/ ST: R$ 112,91', v_fornecedor_id
    );
  END IF;

  -- Linha 91: PEC-0091 - COLARINHO SPLASH
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0091' OR UPPER(TRIM(nome)) = UPPER('COLARINHO SPLASH')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0091'),
        nome = 'COLARINHO SPLASH',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 130,
        preco_venda = 163.1,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 91) | NCM: 39269090 | Preço Unit.: R$ 130,00 | Valor ST: R$ 33,10 | Preço c/ ST: R$ 163,10',
        ativo = true
    WHERE codigo = 'PEC-0091' OR UPPER(TRIM(nome)) = UPPER('COLARINHO SPLASH');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0091', 'COLARINHO SPLASH', 'Peças', 'produto', 'UN', '39269090',
      130, 163.1, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 91) | NCM: 39269090 | Preço Unit.: R$ 130,00 | Valor ST: R$ 33,10 | Preço c/ ST: R$ 163,10', v_fornecedor_id
    );
  END IF;

  -- Linha 92: PEC-0092 - COLARINHO SPLASH DRY PUMP
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0092' OR UPPER(TRIM(nome)) = UPPER('COLARINHO SPLASH DRY PUMP')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0092'),
        nome = 'COLARINHO SPLASH DRY PUMP',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 30,
        preco_venda = 37.64,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 92) | NCM: 39269090 | Preço Unit.: R$ 30,00 | Valor ST: R$ 7,64 | Preço c/ ST: R$ 37,64',
        ativo = true
    WHERE codigo = 'PEC-0092' OR UPPER(TRIM(nome)) = UPPER('COLARINHO SPLASH DRY PUMP');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0092', 'COLARINHO SPLASH DRY PUMP', 'Peças', 'produto', 'UN', '39269090',
      30, 37.64, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 92) | NCM: 39269090 | Preço Unit.: R$ 30,00 | Valor ST: R$ 7,64 | Preço c/ ST: R$ 37,64', v_fornecedor_id
    );
  END IF;

  -- Linha 93: PEC-0093 - COLUNA ESTRUTURAL THERMAS M
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0093' OR UPPER(TRIM(nome)) = UPPER('COLUNA ESTRUTURAL THERMAS M')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0093'),
        nome = 'COLUNA ESTRUTURAL THERMAS M',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 350,
        preco_venda = 439.11,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 93) | NCM: 39269090 | Preço Unit.: R$ 350,00 | Valor ST: R$ 89,11 | Preço c/ ST: R$ 439,11',
        ativo = true
    WHERE codigo = 'PEC-0093' OR UPPER(TRIM(nome)) = UPPER('COLUNA ESTRUTURAL THERMAS M');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0093', 'COLUNA ESTRUTURAL THERMAS M', 'Peças', 'produto', 'UN', '39269090',
      350, 439.11, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 93) | NCM: 39269090 | Preço Unit.: R$ 350,00 | Valor ST: R$ 89,11 | Preço c/ ST: R$ 439,11', v_fornecedor_id
    );
  END IF;

  -- Linha 94: PEC-0094 - COMPORTA G3
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0094' OR UPPER(TRIM(nome)) = UPPER('COMPORTA G3')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0094'),
        nome = 'COMPORTA G3',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 9,
        preco_venda = 10.17,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 94) | NCM: 39174090 | Preço Unit.: R$ 9,00 | Valor ST: R$ 1,17 | Preço c/ ST: R$ 10,17',
        ativo = true
    WHERE codigo = 'PEC-0094' OR UPPER(TRIM(nome)) = UPPER('COMPORTA G3');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0094', 'COMPORTA G3', 'Peças', 'produto', 'UN', '39174090',
      9, 10.17, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 94) | NCM: 39174090 | Preço Unit.: R$ 9,00 | Valor ST: R$ 1,17 | Preço c/ ST: R$ 10,17', v_fornecedor_id
    );
  END IF;

  -- Linha 95: PEC-0095 - COMPRESSOR 15300 BTUS
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0095' OR UPPER(TRIM(nome)) = UPPER('COMPRESSOR 15300 BTUS')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0095'),
        nome = 'COMPRESSOR 15300 BTUS',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84143019',
        preco_custo = 2600,
        preco_venda = 2600,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 95) | NCM: 84143019 | Preço Unit.: R$ 2.600,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2.600,00',
        ativo = true
    WHERE codigo = 'PEC-0095' OR UPPER(TRIM(nome)) = UPPER('COMPRESSOR 15300 BTUS');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0095', 'COMPRESSOR 15300 BTUS', 'Peças', 'produto', 'UN', '84143019',
      2600, 2600, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 95) | NCM: 84143019 | Preço Unit.: R$ 2.600,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2.600,00', v_fornecedor_id
    );
  END IF;

  -- Linha 96: PEC-0096 - COMPRESSOR 26600 BTUS
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0096' OR UPPER(TRIM(nome)) = UPPER('COMPRESSOR 26600 BTUS')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0096'),
        nome = 'COMPRESSOR 26600 BTUS',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84143019',
        preco_custo = 4600,
        preco_venda = 4600,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 96) | NCM: 84143019 | Preço Unit.: R$ 4.600,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 4.600,00',
        ativo = true
    WHERE codigo = 'PEC-0096' OR UPPER(TRIM(nome)) = UPPER('COMPRESSOR 26600 BTUS');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0096', 'COMPRESSOR 26600 BTUS', 'Peças', 'produto', 'UN', '84143019',
      4600, 4600, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 96) | NCM: 84143019 | Preço Unit.: R$ 4.600,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 4.600,00', v_fornecedor_id
    );
  END IF;

  -- Linha 97: PEC-0097 - COMPRESSOR 42600 BTUS
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0097' OR UPPER(TRIM(nome)) = UPPER('COMPRESSOR 42600 BTUS')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0097'),
        nome = 'COMPRESSOR 42600 BTUS',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84143019',
        preco_custo = 4900,
        preco_venda = 4900,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 97) | NCM: 84143019 | Preço Unit.: R$ 4.900,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 4.900,00',
        ativo = true
    WHERE codigo = 'PEC-0097' OR UPPER(TRIM(nome)) = UPPER('COMPRESSOR 42600 BTUS');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0097', 'COMPRESSOR 42600 BTUS', 'Peças', 'produto', 'UN', '84143019',
      4900, 4900, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 97) | NCM: 84143019 | Preço Unit.: R$ 4.900,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 4.900,00', v_fornecedor_id
    );
  END IF;

  -- Linha 98: PEC-0098 - CONDENSADOR WBR12.5-A3
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0098' OR UPPER(TRIM(nome)) = UPPER('CONDENSADOR WBR12.5-A3')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0098'),
        nome = 'CONDENSADOR WBR12.5-A3',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 3800,
        preco_venda = 3800,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 98) | NCM: 84189900 | Preço Unit.: R$ 3.800,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 3.800,00',
        ativo = true
    WHERE codigo = 'PEC-0098' OR UPPER(TRIM(nome)) = UPPER('CONDENSADOR WBR12.5-A3');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0098', 'CONDENSADOR WBR12.5-A3', 'Peças', 'produto', 'UN', '84189900',
      3800, 3800, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 98) | NCM: 84189900 | Preço Unit.: R$ 3.800,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 3.800,00', v_fornecedor_id
    );
  END IF;

  -- Linha 99: PEC-0099 - CONDENSADOR WBR4.5-A3
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0099' OR UPPER(TRIM(nome)) = UPPER('CONDENSADOR WBR4.5-A3')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0099'),
        nome = 'CONDENSADOR WBR4.5-A3',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 2350,
        preco_venda = 2350,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 99) | NCM: 84189900 | Preço Unit.: R$ 2.350,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2.350,00',
        ativo = true
    WHERE codigo = 'PEC-0099' OR UPPER(TRIM(nome)) = UPPER('CONDENSADOR WBR4.5-A3');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0099', 'CONDENSADOR WBR4.5-A3', 'Peças', 'produto', 'UN', '84189900',
      2350, 2350, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 99) | NCM: 84189900 | Preço Unit.: R$ 2.350,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2.350,00', v_fornecedor_id
    );
  END IF;

  -- Linha 100: PEC-0100 - CONDENSADOR WBR7.8-A3
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0100' OR UPPER(TRIM(nome)) = UPPER('CONDENSADOR WBR7.8-A3')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0100'),
        nome = 'CONDENSADOR WBR7.8-A3',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 3100,
        preco_venda = 3100,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 100) | NCM: 84189900 | Preço Unit.: R$ 3.100,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 3.100,00',
        ativo = true
    WHERE codigo = 'PEC-0100' OR UPPER(TRIM(nome)) = UPPER('CONDENSADOR WBR7.8-A3');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0100', 'CONDENSADOR WBR7.8-A3', 'Peças', 'produto', 'UN', '84189900',
      3100, 3100, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 100) | NCM: 84189900 | Preço Unit.: R$ 3.100,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 3.100,00', v_fornecedor_id
    );
  END IF;

  -- Linha 101: PEC-0101 - CONECTOR PRINCIPAL ALAVANCA OMB. COPA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0101' OR UPPER(TRIM(nome)) = UPPER('CONECTOR PRINCIPAL ALAVANCA OMB. COPA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0101'),
        nome = 'CONECTOR PRINCIPAL ALAVANCA OMB. COPA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 115,
        preco_venda = 129.9,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 101) | NCM: 39172900 | Preço Unit.: R$ 115,00 | Valor ST: R$ 14,90 | Preço c/ ST: R$ 129,90',
        ativo = true
    WHERE codigo = 'PEC-0101' OR UPPER(TRIM(nome)) = UPPER('CONECTOR PRINCIPAL ALAVANCA OMB. COPA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0101', 'CONECTOR PRINCIPAL ALAVANCA OMB. COPA', 'Peças', 'produto', 'UN', '39172900',
      115, 129.9, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 101) | NCM: 39172900 | Preço Unit.: R$ 115,00 | Valor ST: R$ 14,90 | Preço c/ ST: R$ 129,90', v_fornecedor_id
    );
  END IF;

  -- Linha 102: PEC-0102 - CONECTOR SINDAL
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0102' OR UPPER(TRIM(nome)) = UPPER('CONECTOR SINDAL')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0102'),
        nome = 'CONECTOR SINDAL',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85369010',
        preco_custo = 10,
        preco_venda = 11.16,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 102) | NCM: 85369010 | Preço Unit.: R$ 10,00 | Valor ST: R$ 1,16 | Preço c/ ST: R$ 11,16',
        ativo = true
    WHERE codigo = 'PEC-0102' OR UPPER(TRIM(nome)) = UPPER('CONECTOR SINDAL');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0102', 'CONECTOR SINDAL', 'Peças', 'produto', 'UN', '85369010',
      10, 11.16, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 102) | NCM: 85369010 | Preço Unit.: R$ 10,00 | Valor ST: R$ 1,16 | Preço c/ ST: R$ 11,16', v_fornecedor_id
    );
  END IF;

  -- Linha 103: PEC-0103 - CONEXÃO ENTRADA E SAIDA DE AGUA PARA BOMBA DE CALOR
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0103' OR UPPER(TRIM(nome)) = UPPER('CONEXÃO ENTRADA E SAIDA DE AGUA PARA BOMBA DE CALOR')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0103'),
        nome = 'CONEXÃO ENTRADA E SAIDA DE AGUA PARA BOMBA DE CALOR',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 120,
        preco_venda = 120,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 103) | NCM: 84189900 | Preço Unit.: R$ 120,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 120,00',
        ativo = true
    WHERE codigo = 'PEC-0103' OR UPPER(TRIM(nome)) = UPPER('CONEXÃO ENTRADA E SAIDA DE AGUA PARA BOMBA DE CALOR');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0103', 'CONEXÃO ENTRADA E SAIDA DE AGUA PARA BOMBA DE CALOR', 'Peças', 'produto', 'UN', '84189900',
      120, 120, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 103) | NCM: 84189900 | Preço Unit.: R$ 120,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 120,00', v_fornecedor_id
    );
  END IF;

  -- Linha 104: PEC-0104 - CONJ. ESPELHO F TRADICIONAL SPLASH (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0104' OR UPPER(TRIM(nome)) = UPPER('CONJ. ESPELHO F TRADICIONAL SPLASH (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0104'),
        nome = 'CONJ. ESPELHO F TRADICIONAL SPLASH (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 79,
        preco_venda = 89.24,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 104) | NCM: 39172900 | Preço Unit.: R$ 79,00 | Valor ST: R$ 10,24 | Preço c/ ST: R$ 89,24',
        ativo = true
    WHERE codigo = 'PEC-0104' OR UPPER(TRIM(nome)) = UPPER('CONJ. ESPELHO F TRADICIONAL SPLASH (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0104', 'CONJ. ESPELHO F TRADICIONAL SPLASH (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39172900',
      79, 89.24, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 104) | NCM: 39172900 | Preço Unit.: R$ 79,00 | Valor ST: R$ 10,24 | Preço c/ ST: R$ 89,24', v_fornecedor_id
    );
  END IF;

  -- Linha 105: PEC-0105 - CONJUNTO DE DRENAGEM FUNDO BANHEIRA SAUNA CLUB
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0105' OR UPPER(TRIM(nome)) = UPPER('CONJUNTO DE DRENAGEM FUNDO BANHEIRA SAUNA CLUB')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0105'),
        nome = 'CONJUNTO DE DRENAGEM FUNDO BANHEIRA SAUNA CLUB',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39229000',
        preco_custo = 90,
        preco_venda = 104.74,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 105) | NCM: 39229000 | Preço Unit.: R$ 90,00 | Valor ST: R$ 14,74 | Preço c/ ST: R$ 104,74',
        ativo = true
    WHERE codigo = 'PEC-0105' OR UPPER(TRIM(nome)) = UPPER('CONJUNTO DE DRENAGEM FUNDO BANHEIRA SAUNA CLUB');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0105', 'CONJUNTO DE DRENAGEM FUNDO BANHEIRA SAUNA CLUB', 'Peças', 'produto', 'UN', '39229000',
      90, 104.74, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 105) | NCM: 39229000 | Preço Unit.: R$ 90,00 | Valor ST: R$ 14,74 | Preço c/ ST: R$ 104,74', v_fornecedor_id
    );
  END IF;

  -- Linha 106: PEC-0106 - CONJUNTO DE PINÇA BASE EDEM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0106' OR UPPER(TRIM(nome)) = UPPER('CONJUNTO DE PINÇA BASE EDEM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0106'),
        nome = 'CONJUNTO DE PINÇA BASE EDEM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 5,
        preco_venda = 5.65,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 106) | NCM: 39174090 | Preço Unit.: R$ 5,00 | Valor ST: R$ 0,65 | Preço c/ ST: R$ 5,65',
        ativo = true
    WHERE codigo = 'PEC-0106' OR UPPER(TRIM(nome)) = UPPER('CONJUNTO DE PINÇA BASE EDEM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0106', 'CONJUNTO DE PINÇA BASE EDEM', 'Peças', 'produto', 'UN', '39174090',
      5, 5.65, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 106) | NCM: 39174090 | Preço Unit.: R$ 5,00 | Valor ST: R$ 0,65 | Preço c/ ST: R$ 5,65', v_fornecedor_id
    );
  END IF;

  -- Linha 107: PEC-0107 - CONTACTOR 110/220V - LEVITA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0107' OR UPPER(TRIM(nome)) = UPPER('CONTACTOR 110/220V - LEVITA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0107'),
        nome = 'CONTACTOR 110/220V - LEVITA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85044050',
        preco_custo = 275,
        preco_venda = 275,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 107) | NCM: 85044050 | Preço Unit.: R$ 275,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 275,00',
        ativo = true
    WHERE codigo = 'PEC-0107' OR UPPER(TRIM(nome)) = UPPER('CONTACTOR 110/220V - LEVITA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0107', 'CONTACTOR 110/220V - LEVITA', 'Peças', 'produto', 'UN', '85044050',
      275, 275, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 107) | NCM: 85044050 | Preço Unit.: R$ 275,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 275,00', v_fornecedor_id
    );
  END IF;

  -- Linha 108: PEC-0108 - CONTACTORA 110V/220V
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0108' OR UPPER(TRIM(nome)) = UPPER('CONTACTORA 110V/220V')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0108'),
        nome = 'CONTACTORA 110V/220V',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85044050',
        preco_custo = 275,
        preco_venda = 275,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 108) | NCM: 85044050 | Preço Unit.: R$ 275,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 275,00',
        ativo = true
    WHERE codigo = 'PEC-0108' OR UPPER(TRIM(nome)) = UPPER('CONTACTORA 110V/220V');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0108', 'CONTACTORA 110V/220V', 'Peças', 'produto', 'UN', '85044050',
      275, 275, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 108) | NCM: 85044050 | Preço Unit.: R$ 275,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 275,00', v_fornecedor_id
    );
  END IF;

  -- Linha 109: PEC-0109 - CONTACTORA MODULAR C/CHAVE 127V
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0109' OR UPPER(TRIM(nome)) = UPPER('CONTACTORA MODULAR C/CHAVE 127V')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0109'),
        nome = 'CONTACTORA MODULAR C/CHAVE 127V',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85362000',
        preco_custo = 150,
        preco_venda = 166.13,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 109) | NCM: 85362000 | Preço Unit.: R$ 150,00 | Valor ST: R$ 16,13 | Preço c/ ST: R$ 166,13',
        ativo = true
    WHERE codigo = 'PEC-0109' OR UPPER(TRIM(nome)) = UPPER('CONTACTORA MODULAR C/CHAVE 127V');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0109', 'CONTACTORA MODULAR C/CHAVE 127V', 'Peças', 'produto', 'UN', '85362000',
      150, 166.13, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 109) | NCM: 85362000 | Preço Unit.: R$ 150,00 | Valor ST: R$ 16,13 | Preço c/ ST: R$ 166,13', v_fornecedor_id
    );
  END IF;

  -- Linha 110: PEC-0110 - CONTACTORA MODULAR C/CHAVE 220V
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0110' OR UPPER(TRIM(nome)) = UPPER('CONTACTORA MODULAR C/CHAVE 220V')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0110'),
        nome = 'CONTACTORA MODULAR C/CHAVE 220V',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85362000',
        preco_custo = 150,
        preco_venda = 166.13,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 110) | NCM: 85362000 | Preço Unit.: R$ 150,00 | Valor ST: R$ 16,13 | Preço c/ ST: R$ 166,13',
        ativo = true
    WHERE codigo = 'PEC-0110' OR UPPER(TRIM(nome)) = UPPER('CONTACTORA MODULAR C/CHAVE 220V');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0110', 'CONTACTORA MODULAR C/CHAVE 220V', 'Peças', 'produto', 'UN', '85362000',
      150, 166.13, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 110) | NCM: 85362000 | Preço Unit.: R$ 150,00 | Valor ST: R$ 16,13 | Preço c/ ST: R$ 166,13', v_fornecedor_id
    );
  END IF;

  -- Linha 111: PEC-0111 - CONTACTORA MODULAR S/CHAVE 127V
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0111' OR UPPER(TRIM(nome)) = UPPER('CONTACTORA MODULAR S/CHAVE 127V')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0111'),
        nome = 'CONTACTORA MODULAR S/CHAVE 127V',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85362000',
        preco_custo = 150,
        preco_venda = 166.13,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 111) | NCM: 85362000 | Preço Unit.: R$ 150,00 | Valor ST: R$ 16,13 | Preço c/ ST: R$ 166,13',
        ativo = true
    WHERE codigo = 'PEC-0111' OR UPPER(TRIM(nome)) = UPPER('CONTACTORA MODULAR S/CHAVE 127V');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0111', 'CONTACTORA MODULAR S/CHAVE 127V', 'Peças', 'produto', 'UN', '85362000',
      150, 166.13, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 111) | NCM: 85362000 | Preço Unit.: R$ 150,00 | Valor ST: R$ 16,13 | Preço c/ ST: R$ 166,13', v_fornecedor_id
    );
  END IF;

  -- Linha 112: PEC-0112 - CONTACTORA MODULAR S/CHAVE 220V
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0112' OR UPPER(TRIM(nome)) = UPPER('CONTACTORA MODULAR S/CHAVE 220V')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0112'),
        nome = 'CONTACTORA MODULAR S/CHAVE 220V',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85362000',
        preco_custo = 150,
        preco_venda = 166.13,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 112) | NCM: 85362000 | Preço Unit.: R$ 150,00 | Valor ST: R$ 16,13 | Preço c/ ST: R$ 166,13',
        ativo = true
    WHERE codigo = 'PEC-0112' OR UPPER(TRIM(nome)) = UPPER('CONTACTORA MODULAR S/CHAVE 220V');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0112', 'CONTACTORA MODULAR S/CHAVE 220V', 'Peças', 'produto', 'UN', '85362000',
      150, 166.13, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 112) | NCM: 85362000 | Preço Unit.: R$ 150,00 | Valor ST: R$ 16,13 | Preço c/ ST: R$ 166,13', v_fornecedor_id
    );
  END IF;

  -- Linha 113: PEC-0113 - CONTATOR AC 32A THERMAS
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0113' OR UPPER(TRIM(nome)) = UPPER('CONTATOR AC 32A THERMAS')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0113'),
        nome = 'CONTATOR AC 32A THERMAS',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 260,
        preco_venda = 260,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 113) | NCM: 84189900 | Preço Unit.: R$ 260,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 260,00',
        ativo = true
    WHERE codigo = 'PEC-0113' OR UPPER(TRIM(nome)) = UPPER('CONTATOR AC 32A THERMAS');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0113', 'CONTATOR AC 32A THERMAS', 'Peças', 'produto', 'UN', '84189900',
      260, 260, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 113) | NCM: 84189900 | Preço Unit.: R$ 260,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 260,00', v_fornecedor_id
    );
  END IF;

  -- Linha 114: PEC-0114 - CONTROLADOR SAL DISPLAY IHM CLORADOR
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0114' OR UPPER(TRIM(nome)) = UPPER('CONTROLADOR SAL DISPLAY IHM CLORADOR')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0114'),
        nome = 'CONTROLADOR SAL DISPLAY IHM CLORADOR',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85371090',
        preco_custo = 430,
        preco_venda = 430,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 114) | NCM: 85371090 | Preço Unit.: R$ 430,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 430,00',
        ativo = true
    WHERE codigo = 'PEC-0114' OR UPPER(TRIM(nome)) = UPPER('CONTROLADOR SAL DISPLAY IHM CLORADOR');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0114', 'CONTROLADOR SAL DISPLAY IHM CLORADOR', 'Peças', 'produto', 'UN', '85371090',
      430, 430, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 114) | NCM: 85371090 | Preço Unit.: R$ 430,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 430,00', v_fornecedor_id
    );
  END IF;

  -- Linha 115: PEC-0115 - CONTROLE REMOTO IGUILUX COLOR
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0115' OR UPPER(TRIM(nome)) = UPPER('CONTROLE REMOTO IGUILUX COLOR')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0115'),
        nome = 'CONTROLE REMOTO IGUILUX COLOR',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 95,
        preco_venda = 107.31,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 115) | NCM: 39174090 | Preço Unit.: R$ 95,00 | Valor ST: R$ 12,31 | Preço c/ ST: R$ 107,31',
        ativo = true
    WHERE codigo = 'PEC-0115' OR UPPER(TRIM(nome)) = UPPER('CONTROLE REMOTO IGUILUX COLOR');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0115', 'CONTROLE REMOTO IGUILUX COLOR', 'Peças', 'produto', 'UN', '39174090',
      95, 107.31, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 115) | NCM: 39174090 | Preço Unit.: R$ 95,00 | Valor ST: R$ 12,31 | Preço c/ ST: R$ 107,31', v_fornecedor_id
    );
  END IF;

  -- Linha 116: PEC-0116 - CORPO PAPATERRA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0116' OR UPPER(TRIM(nome)) = UPPER('CORPO PAPATERRA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0116'),
        nome = 'CORPO PAPATERRA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 220,
        preco_venda = 248.51,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 116) | NCM: 39174090 | Preço Unit.: R$ 220,00 | Valor ST: R$ 28,51 | Preço c/ ST: R$ 248,51',
        ativo = true
    WHERE codigo = 'PEC-0116' OR UPPER(TRIM(nome)) = UPPER('CORPO PAPATERRA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0116', 'CORPO PAPATERRA', 'Peças', 'produto', 'UN', '39174090',
      220, 248.51, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 116) | NCM: 39174090 | Preço Unit.: R$ 220,00 | Valor ST: R$ 28,51 | Preço c/ ST: R$ 248,51', v_fornecedor_id
    );
  END IF;

  -- Linha 117: PEC-0117 - CORPO REGISTRO 25MM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0117' OR UPPER(TRIM(nome)) = UPPER('CORPO REGISTRO 25MM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0117'),
        nome = 'CORPO REGISTRO 25MM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 6,
        preco_venda = 6.78,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 117) | NCM: 39174090 | Preço Unit.: R$ 6,00 | Valor ST: R$ 0,78 | Preço c/ ST: R$ 6,78',
        ativo = true
    WHERE codigo = 'PEC-0117' OR UPPER(TRIM(nome)) = UPPER('CORPO REGISTRO 25MM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0117', 'CORPO REGISTRO 25MM', 'Peças', 'produto', 'UN', '39174090',
      6, 6.78, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 117) | NCM: 39174090 | Preço Unit.: R$ 6,00 | Valor ST: R$ 0,78 | Preço c/ ST: R$ 6,78', v_fornecedor_id
    );
  END IF;

  -- Linha 118: PEC-0118 - CORPO REGISTRO 32MM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0118' OR UPPER(TRIM(nome)) = UPPER('CORPO REGISTRO 32MM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0118'),
        nome = 'CORPO REGISTRO 32MM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 10,
        preco_venda = 11.3,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 118) | NCM: 39174090 | Preço Unit.: R$ 10,00 | Valor ST: R$ 1,30 | Preço c/ ST: R$ 11,30',
        ativo = true
    WHERE codigo = 'PEC-0118' OR UPPER(TRIM(nome)) = UPPER('CORPO REGISTRO 32MM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0118', 'CORPO REGISTRO 32MM', 'Peças', 'produto', 'UN', '39174090',
      10, 11.3, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 118) | NCM: 39174090 | Preço Unit.: R$ 10,00 | Valor ST: R$ 1,30 | Preço c/ ST: R$ 11,30', v_fornecedor_id
    );
  END IF;

  -- Linha 119: PEC-0119 - CORREDIÇAS DE PORTA EM PLASTICO SAUNA CLUB
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0119' OR UPPER(TRIM(nome)) = UPPER('CORREDIÇAS DE PORTA EM PLASTICO SAUNA CLUB')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0119'),
        nome = 'CORREDIÇAS DE PORTA EM PLASTICO SAUNA CLUB',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 100,
        preco_venda = 112.96,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 119) | NCM: 39174090 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96',
        ativo = true
    WHERE codigo = 'PEC-0119' OR UPPER(TRIM(nome)) = UPPER('CORREDIÇAS DE PORTA EM PLASTICO SAUNA CLUB');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0119', 'CORREDIÇAS DE PORTA EM PLASTICO SAUNA CLUB', 'Peças', 'produto', 'UN', '39174090',
      100, 112.96, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 119) | NCM: 39174090 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96', v_fornecedor_id
    );
  END IF;

  -- Linha 120: PEC-0120 - COTOVELO DO OMBRELONE COPA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0120' OR UPPER(TRIM(nome)) = UPPER('COTOVELO DO OMBRELONE COPA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0120'),
        nome = 'COTOVELO DO OMBRELONE COPA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 90,
        preco_venda = 101.66,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 120) | NCM: 39172900 | Preço Unit.: R$ 90,00 | Valor ST: R$ 11,66 | Preço c/ ST: R$ 101,66',
        ativo = true
    WHERE codigo = 'PEC-0120' OR UPPER(TRIM(nome)) = UPPER('COTOVELO DO OMBRELONE COPA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0120', 'COTOVELO DO OMBRELONE COPA', 'Peças', 'produto', 'UN', '39172900',
      90, 101.66, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 120) | NCM: 39172900 | Preço Unit.: R$ 90,00 | Valor ST: R$ 11,66 | Preço c/ ST: R$ 101,66', v_fornecedor_id
    );
  END IF;

  -- Linha 121: PEC-0121 - DIRECIONADOR JATOS SPA LUXO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0121' OR UPPER(TRIM(nome)) = UPPER('DIRECIONADOR JATOS SPA LUXO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0121'),
        nome = 'DIRECIONADOR JATOS SPA LUXO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 190,
        preco_venda = 238.38,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 121) | NCM: 39269090 | Preço Unit.: R$ 190,00 | Valor ST: R$ 48,38 | Preço c/ ST: R$ 238,38',
        ativo = true
    WHERE codigo = 'PEC-0121' OR UPPER(TRIM(nome)) = UPPER('DIRECIONADOR JATOS SPA LUXO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0121', 'DIRECIONADOR JATOS SPA LUXO', 'Peças', 'produto', 'UN', '39269090',
      190, 238.38, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 121) | NCM: 39269090 | Preço Unit.: R$ 190,00 | Valor ST: R$ 48,38 | Preço c/ ST: R$ 238,38', v_fornecedor_id
    );
  END IF;

  -- Linha 122: PEC-0122 - DISJUNTOR 10A BIFÁSICO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0122' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR 10A BIFÁSICO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0122'),
        nome = 'DISJUNTOR 10A BIFÁSICO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85365090',
        preco_custo = 50,
        preco_venda = 55.82,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 122) | NCM: 85365090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 5,82 | Preço c/ ST: R$ 55,82',
        ativo = true
    WHERE codigo = 'PEC-0122' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR 10A BIFÁSICO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0122', 'DISJUNTOR 10A BIFÁSICO', 'Peças', 'produto', 'UN', '85365090',
      50, 55.82, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 122) | NCM: 85365090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 5,82 | Preço c/ ST: R$ 55,82', v_fornecedor_id
    );
  END IF;

  -- Linha 123: PEC-0123 - DISJUNTOR 10A MONOFASICO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0123' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR 10A MONOFASICO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0123'),
        nome = 'DISJUNTOR 10A MONOFASICO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85362000',
        preco_custo = 25,
        preco_venda = 27.69,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 123) | NCM: 85362000 | Preço Unit.: R$ 25,00 | Valor ST: R$ 2,69 | Preço c/ ST: R$ 27,69',
        ativo = true
    WHERE codigo = 'PEC-0123' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR 10A MONOFASICO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0123', 'DISJUNTOR 10A MONOFASICO', 'Peças', 'produto', 'UN', '85362000',
      25, 27.69, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 123) | NCM: 85362000 | Preço Unit.: R$ 25,00 | Valor ST: R$ 2,69 | Preço c/ ST: R$ 27,69', v_fornecedor_id
    );
  END IF;

  -- Linha 124: PEC-0124 - DISJUNTOR 13A MONOFÁSICO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0124' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR 13A MONOFÁSICO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0124'),
        nome = 'DISJUNTOR 13A MONOFÁSICO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85362000',
        preco_custo = 25,
        preco_venda = 27.69,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 124) | NCM: 85362000 | Preço Unit.: R$ 25,00 | Valor ST: R$ 2,69 | Preço c/ ST: R$ 27,69',
        ativo = true
    WHERE codigo = 'PEC-0124' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR 13A MONOFÁSICO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0124', 'DISJUNTOR 13A MONOFÁSICO', 'Peças', 'produto', 'UN', '85362000',
      25, 27.69, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 124) | NCM: 85362000 | Preço Unit.: R$ 25,00 | Valor ST: R$ 2,69 | Preço c/ ST: R$ 27,69', v_fornecedor_id
    );
  END IF;

  -- Linha 125: PEC-0125 - DISJUNTOR 16A BIFÁSICO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0125' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR 16A BIFÁSICO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0125'),
        nome = 'DISJUNTOR 16A BIFÁSICO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85365090',
        preco_custo = 50,
        preco_venda = 55.82,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 125) | NCM: 85365090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 5,82 | Preço c/ ST: R$ 55,82',
        ativo = true
    WHERE codigo = 'PEC-0125' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR 16A BIFÁSICO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0125', 'DISJUNTOR 16A BIFÁSICO', 'Peças', 'produto', 'UN', '85365090',
      50, 55.82, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 125) | NCM: 85365090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 5,82 | Preço c/ ST: R$ 55,82', v_fornecedor_id
    );
  END IF;

  -- Linha 126: PEC-0126 - DISJUNTOR 16A MONOFÁSICO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0126' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR 16A MONOFÁSICO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0126'),
        nome = 'DISJUNTOR 16A MONOFÁSICO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85362000',
        preco_custo = 30,
        preco_venda = 33.23,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 126) | NCM: 85362000 | Preço Unit.: R$ 30,00 | Valor ST: R$ 3,23 | Preço c/ ST: R$ 33,23',
        ativo = true
    WHERE codigo = 'PEC-0126' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR 16A MONOFÁSICO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0126', 'DISJUNTOR 16A MONOFÁSICO', 'Peças', 'produto', 'UN', '85362000',
      30, 33.23, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 126) | NCM: 85362000 | Preço Unit.: R$ 30,00 | Valor ST: R$ 3,23 | Preço c/ ST: R$ 33,23', v_fornecedor_id
    );
  END IF;

  -- Linha 127: PEC-0127 - DISJUNTOR 3A MONOFÁSICO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0127' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR 3A MONOFÁSICO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0127'),
        nome = 'DISJUNTOR 3A MONOFÁSICO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85362000',
        preco_custo = 25,
        preco_venda = 27.69,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 127) | NCM: 85362000 | Preço Unit.: R$ 25,00 | Valor ST: R$ 2,69 | Preço c/ ST: R$ 27,69',
        ativo = true
    WHERE codigo = 'PEC-0127' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR 3A MONOFÁSICO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0127', 'DISJUNTOR 3A MONOFÁSICO', 'Peças', 'produto', 'UN', '85362000',
      25, 27.69, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 127) | NCM: 85362000 | Preço Unit.: R$ 25,00 | Valor ST: R$ 2,69 | Preço c/ ST: R$ 27,69', v_fornecedor_id
    );
  END IF;

  -- Linha 128: PEC-0128 - DISJUNTOR 6A BIFÁSICO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0128' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR 6A BIFÁSICO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0128'),
        nome = 'DISJUNTOR 6A BIFÁSICO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85365090',
        preco_custo = 50,
        preco_venda = 55.82,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 128) | NCM: 85365090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 5,82 | Preço c/ ST: R$ 55,82',
        ativo = true
    WHERE codigo = 'PEC-0128' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR 6A BIFÁSICO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0128', 'DISJUNTOR 6A BIFÁSICO', 'Peças', 'produto', 'UN', '85365090',
      50, 55.82, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 128) | NCM: 85365090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 5,82 | Preço c/ ST: R$ 55,82', v_fornecedor_id
    );
  END IF;

  -- Linha 129: PEC-0129 - DISJUNTOR 6A CP
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0129' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR 6A CP')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0129'),
        nome = 'DISJUNTOR 6A CP',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85362000',
        preco_custo = 12.45,
        preco_venda = 13.79,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 129) | NCM: 85362000 | Preço Unit.: R$ 12,45 | Valor ST: R$ 1,34 | Preço c/ ST: R$ 13,79',
        ativo = true
    WHERE codigo = 'PEC-0129' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR 6A CP');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0129', 'DISJUNTOR 6A CP', 'Peças', 'produto', 'UN', '85362000',
      12.45, 13.79, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 129) | NCM: 85362000 | Preço Unit.: R$ 12,45 | Valor ST: R$ 1,34 | Preço c/ ST: R$ 13,79', v_fornecedor_id
    );
  END IF;

  -- Linha 130: PEC-0130 - DISJUNTOR 6A MONOFASICO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0130' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR 6A MONOFASICO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0130'),
        nome = 'DISJUNTOR 6A MONOFASICO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85362000',
        preco_custo = 25,
        preco_venda = 27.69,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 130) | NCM: 85362000 | Preço Unit.: R$ 25,00 | Valor ST: R$ 2,69 | Preço c/ ST: R$ 27,69',
        ativo = true
    WHERE codigo = 'PEC-0130' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR 6A MONOFASICO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0130', 'DISJUNTOR 6A MONOFASICO', 'Peças', 'produto', 'UN', '85362000',
      25, 27.69, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 130) | NCM: 85362000 | Preço Unit.: R$ 25,00 | Valor ST: R$ 2,69 | Preço c/ ST: R$ 27,69', v_fornecedor_id
    );
  END IF;

  -- Linha 131: PEC-0131 - DISJUNTOR C20
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0131' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR C20')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0131'),
        nome = 'DISJUNTOR C20',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85362000',
        preco_custo = 5.06,
        preco_venda = 5.6,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 131) | NCM: 85362000 | Preço Unit.: R$ 5,06 | Valor ST: R$ 0,54 | Preço c/ ST: R$ 5,60',
        ativo = true
    WHERE codigo = 'PEC-0131' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR C20');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0131', 'DISJUNTOR C20', 'Peças', 'produto', 'UN', '85362000',
      5.06, 5.6, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 131) | NCM: 85362000 | Preço Unit.: R$ 5,06 | Valor ST: R$ 0,54 | Preço c/ ST: R$ 5,60', v_fornecedor_id
    );
  END IF;

  -- Linha 132: PEC-0132 - DISJUNTOR C20 BIPOLAR
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0132' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR C20 BIPOLAR')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0132'),
        nome = 'DISJUNTOR C20 BIPOLAR',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85362000',
        preco_custo = 20.49,
        preco_venda = 22.69,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 132) | NCM: 85362000 | Preço Unit.: R$ 20,49 | Valor ST: R$ 2,20 | Preço c/ ST: R$ 22,69',
        ativo = true
    WHERE codigo = 'PEC-0132' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR C20 BIPOLAR');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0132', 'DISJUNTOR C20 BIPOLAR', 'Peças', 'produto', 'UN', '85362000',
      20.49, 22.69, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 132) | NCM: 85362000 | Preço Unit.: R$ 20,49 | Valor ST: R$ 2,20 | Preço c/ ST: R$ 22,69', v_fornecedor_id
    );
  END IF;

  -- Linha 133: PEC-0133 - DISJUNTOR DR40
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0133' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR DR40')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0133'),
        nome = 'DISJUNTOR DR40',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85362000',
        preco_custo = 175,
        preco_venda = 193.82,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 133) | NCM: 85362000 | Preço Unit.: R$ 175,00 | Valor ST: R$ 18,82 | Preço c/ ST: R$ 193,82',
        ativo = true
    WHERE codigo = 'PEC-0133' OR UPPER(TRIM(nome)) = UPPER('DISJUNTOR DR40');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0133', 'DISJUNTOR DR40', 'Peças', 'produto', 'UN', '85362000',
      175, 193.82, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 133) | NCM: 85362000 | Preço Unit.: R$ 175,00 | Valor ST: R$ 18,82 | Preço c/ ST: R$ 193,82', v_fornecedor_id
    );
  END IF;

  -- Linha 134: PEC-0134 - DISPOSITIVO DE HIDRO SAUNA CLUB
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0134' OR UPPER(TRIM(nome)) = UPPER('DISPOSITIVO DE HIDRO SAUNA CLUB')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0134'),
        nome = 'DISPOSITIVO DE HIDRO SAUNA CLUB',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '73249000',
        preco_custo = 29,
        preco_venda = 39.29,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 134) | NCM: 73249000 | Preço Unit.: R$ 29,00 | Valor ST: R$ 10,29 | Preço c/ ST: R$ 39,29',
        ativo = true
    WHERE codigo = 'PEC-0134' OR UPPER(TRIM(nome)) = UPPER('DISPOSITIVO DE HIDRO SAUNA CLUB');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0134', 'DISPOSITIVO DE HIDRO SAUNA CLUB', 'Peças', 'produto', 'UN', '73249000',
      29, 39.29, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 134) | NCM: 73249000 | Preço Unit.: R$ 29,00 | Valor ST: R$ 10,29 | Preço c/ ST: R$ 39,29', v_fornecedor_id
    );
  END IF;

  -- Linha 135: PEC-0135 - DISPOSITIVO DE HIDRO SPA LUXO GRANDE
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0135' OR UPPER(TRIM(nome)) = UPPER('DISPOSITIVO DE HIDRO SPA LUXO GRANDE')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0135'),
        nome = 'DISPOSITIVO DE HIDRO SPA LUXO GRANDE',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '73249000',
        preco_custo = 65,
        preco_venda = 88.06,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 135) | NCM: 73249000 | Preço Unit.: R$ 65,00 | Valor ST: R$ 23,06 | Preço c/ ST: R$ 88,06',
        ativo = true
    WHERE codigo = 'PEC-0135' OR UPPER(TRIM(nome)) = UPPER('DISPOSITIVO DE HIDRO SPA LUXO GRANDE');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0135', 'DISPOSITIVO DE HIDRO SPA LUXO GRANDE', 'Peças', 'produto', 'UN', '73249000',
      65, 88.06, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 135) | NCM: 73249000 | Preço Unit.: R$ 65,00 | Valor ST: R$ 23,06 | Preço c/ ST: R$ 88,06', v_fornecedor_id
    );
  END IF;

  -- Linha 136: PEC-0136 - DISPOSITIVO DE HIDRO SPA LUXO PEQUENO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0136' OR UPPER(TRIM(nome)) = UPPER('DISPOSITIVO DE HIDRO SPA LUXO PEQUENO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0136'),
        nome = 'DISPOSITIVO DE HIDRO SPA LUXO PEQUENO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '73249000',
        preco_custo = 45,
        preco_venda = 60.97,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 136) | NCM: 73249000 | Preço Unit.: R$ 45,00 | Valor ST: R$ 15,97 | Preço c/ ST: R$ 60,97',
        ativo = true
    WHERE codigo = 'PEC-0136' OR UPPER(TRIM(nome)) = UPPER('DISPOSITIVO DE HIDRO SPA LUXO PEQUENO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0136', 'DISPOSITIVO DE HIDRO SPA LUXO PEQUENO', 'Peças', 'produto', 'UN', '73249000',
      45, 60.97, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 136) | NCM: 73249000 | Preço Unit.: R$ 45,00 | Valor ST: R$ 15,97 | Preço c/ ST: R$ 60,97', v_fornecedor_id
    );
  END IF;

  -- Linha 137: PEC-0137 - DISPOSITIVO DE RETORNO (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0137' OR UPPER(TRIM(nome)) = UPPER('DISPOSITIVO DE RETORNO (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0137'),
        nome = 'DISPOSITIVO DE RETORNO (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 160,
        preco_venda = 180.74,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 137) | NCM: 39172900 | Preço Unit.: R$ 160,00 | Valor ST: R$ 20,74 | Preço c/ ST: R$ 180,74',
        ativo = true
    WHERE codigo = 'PEC-0137' OR UPPER(TRIM(nome)) = UPPER('DISPOSITIVO DE RETORNO (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0137', 'DISPOSITIVO DE RETORNO (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39172900',
      160, 180.74, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 137) | NCM: 39172900 | Preço Unit.: R$ 160,00 | Valor ST: R$ 20,74 | Preço c/ ST: R$ 180,74', v_fornecedor_id
    );
  END IF;

  -- Linha 138: PEC-0138 - DISPOSITIVO DE RETORNO AQUECIMENTO (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0138' OR UPPER(TRIM(nome)) = UPPER('DISPOSITIVO DE RETORNO AQUECIMENTO (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0138'),
        nome = 'DISPOSITIVO DE RETORNO AQUECIMENTO (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 160,
        preco_venda = 180.74,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 138) | NCM: 39172900 | Preço Unit.: R$ 160,00 | Valor ST: R$ 20,74 | Preço c/ ST: R$ 180,74',
        ativo = true
    WHERE codigo = 'PEC-0138' OR UPPER(TRIM(nome)) = UPPER('DISPOSITIVO DE RETORNO AQUECIMENTO (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0138', 'DISPOSITIVO DE RETORNO AQUECIMENTO (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39172900',
      160, 180.74, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 138) | NCM: 39172900 | Preço Unit.: R$ 160,00 | Valor ST: R$ 20,74 | Preço c/ ST: R$ 180,74', v_fornecedor_id
    );
  END IF;

  -- Linha 139: PEC-0139 - DISPOSITIVO ENTRADA DE ENERGIA (CX C/10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0139' OR UPPER(TRIM(nome)) = UPPER('DISPOSITIVO ENTRADA DE ENERGIA (CX C/10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0139'),
        nome = 'DISPOSITIVO ENTRADA DE ENERGIA (CX C/10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 35,
        preco_venda = 39.54,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 139) | NCM: 39174090 | Preço Unit.: R$ 35,00 | Valor ST: R$ 4,54 | Preço c/ ST: R$ 39,54',
        ativo = true
    WHERE codigo = 'PEC-0139' OR UPPER(TRIM(nome)) = UPPER('DISPOSITIVO ENTRADA DE ENERGIA (CX C/10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0139', 'DISPOSITIVO ENTRADA DE ENERGIA (CX C/10 UN)', 'Peças', 'produto', 'UN', '39174090',
      35, 39.54, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 139) | NCM: 39174090 | Preço Unit.: R$ 35,00 | Valor ST: R$ 4,54 | Preço c/ ST: R$ 39,54', v_fornecedor_id
    );
  END IF;

  -- Linha 140: PEC-0140 - DISPOSITIVO HIDROTERAPIA (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0140' OR UPPER(TRIM(nome)) = UPPER('DISPOSITIVO HIDROTERAPIA (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0140'),
        nome = 'DISPOSITIVO HIDROTERAPIA (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 160,
        preco_venda = 180.74,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 140) | NCM: 39172900 | Preço Unit.: R$ 160,00 | Valor ST: R$ 20,74 | Preço c/ ST: R$ 180,74',
        ativo = true
    WHERE codigo = 'PEC-0140' OR UPPER(TRIM(nome)) = UPPER('DISPOSITIVO HIDROTERAPIA (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0140', 'DISPOSITIVO HIDROTERAPIA (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39172900',
      160, 180.74, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 140) | NCM: 39172900 | Preço Unit.: R$ 160,00 | Valor ST: R$ 20,74 | Preço c/ ST: R$ 180,74', v_fornecedor_id
    );
  END IF;

  -- Linha 141: PEC-0141 - DISPOSITIVO RETORNO (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0141' OR UPPER(TRIM(nome)) = UPPER('DISPOSITIVO RETORNO (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0141'),
        nome = 'DISPOSITIVO RETORNO (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 160,
        preco_venda = 180.74,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 141) | NCM: 39172900 | Preço Unit.: R$ 160,00 | Valor ST: R$ 20,74 | Preço c/ ST: R$ 180,74',
        ativo = true
    WHERE codigo = 'PEC-0141' OR UPPER(TRIM(nome)) = UPPER('DISPOSITIVO RETORNO (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0141', 'DISPOSITIVO RETORNO (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39172900',
      160, 180.74, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 141) | NCM: 39172900 | Preço Unit.: R$ 160,00 | Valor ST: R$ 20,74 | Preço c/ ST: R$ 180,74', v_fornecedor_id
    );
  END IF;

  -- Linha 142: PEC-0142 - DISTR. HIDRAULICO G3 REGISTROS 25MM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0142' OR UPPER(TRIM(nome)) = UPPER('DISTR. HIDRAULICO G3 REGISTROS 25MM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0142'),
        nome = 'DISTR. HIDRAULICO G3 REGISTROS 25MM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 110,
        preco_venda = 124.26,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 142) | NCM: 39172900 | Preço Unit.: R$ 110,00 | Valor ST: R$ 14,26 | Preço c/ ST: R$ 124,26',
        ativo = true
    WHERE codigo = 'PEC-0142' OR UPPER(TRIM(nome)) = UPPER('DISTR. HIDRAULICO G3 REGISTROS 25MM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0142', 'DISTR. HIDRAULICO G3 REGISTROS 25MM', 'Peças', 'produto', 'UN', '39172900',
      110, 124.26, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 142) | NCM: 39172900 | Preço Unit.: R$ 110,00 | Valor ST: R$ 14,26 | Preço c/ ST: R$ 124,26', v_fornecedor_id
    );
  END IF;

  -- Linha 143: PEC-0143 - DISTR. HIDRAULICO G3 REGISTROS 32MM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0143' OR UPPER(TRIM(nome)) = UPPER('DISTR. HIDRAULICO G3 REGISTROS 32MM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0143'),
        nome = 'DISTR. HIDRAULICO G3 REGISTROS 32MM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 110,
        preco_venda = 124.26,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 143) | NCM: 39172900 | Preço Unit.: R$ 110,00 | Valor ST: R$ 14,26 | Preço c/ ST: R$ 124,26',
        ativo = true
    WHERE codigo = 'PEC-0143' OR UPPER(TRIM(nome)) = UPPER('DISTR. HIDRAULICO G3 REGISTROS 32MM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0143', 'DISTR. HIDRAULICO G3 REGISTROS 32MM', 'Peças', 'produto', 'UN', '39172900',
      110, 124.26, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 143) | NCM: 39172900 | Preço Unit.: R$ 110,00 | Valor ST: R$ 14,26 | Preço c/ ST: R$ 124,26', v_fornecedor_id
    );
  END IF;

  -- Linha 144: PEC-0144 - DISTRIBUIDOR HIDRAULICO ECO SYSTEM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0144' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO ECO SYSTEM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0144'),
        nome = 'DISTRIBUIDOR HIDRAULICO ECO SYSTEM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 100,
        preco_venda = 112.96,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 144) | NCM: 39172900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96',
        ativo = true
    WHERE codigo = 'PEC-0144' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO ECO SYSTEM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0144', 'DISTRIBUIDOR HIDRAULICO ECO SYSTEM', 'Peças', 'produto', 'UN', '39172900',
      100, 112.96, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 144) | NCM: 39172900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96', v_fornecedor_id
    );
  END IF;

  -- Linha 145: PEC-0145 - DISTRIBUIDOR HIDRAULICO ELETRONIC SYSTEM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0145' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO ELETRONIC SYSTEM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0145'),
        nome = 'DISTRIBUIDOR HIDRAULICO ELETRONIC SYSTEM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 160,
        preco_venda = 180.74,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 145) | NCM: 39172900 | Preço Unit.: R$ 160,00 | Valor ST: R$ 20,74 | Preço c/ ST: R$ 180,74',
        ativo = true
    WHERE codigo = 'PEC-0145' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO ELETRONIC SYSTEM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0145', 'DISTRIBUIDOR HIDRAULICO ELETRONIC SYSTEM', 'Peças', 'produto', 'UN', '39172900',
      160, 180.74, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 145) | NCM: 39172900 | Preço Unit.: R$ 160,00 | Valor ST: R$ 20,74 | Preço c/ ST: R$ 180,74', v_fornecedor_id
    );
  END IF;

  -- Linha 146: PEC-0146 - DISTRIBUIDOR HIDRAULICO ELETRONIC SYSTEM C/ATUADORES
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0146' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO ELETRONIC SYSTEM C/ATUADORES')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0146'),
        nome = 'DISTRIBUIDOR HIDRAULICO ELETRONIC SYSTEM C/ATUADORES',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 900,
        preco_venda = 1016.64,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 146) | NCM: 39172900 | Preço Unit.: R$ 900,00 | Valor ST: R$ 116,64 | Preço c/ ST: R$ 1.016,64',
        ativo = true
    WHERE codigo = 'PEC-0146' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO ELETRONIC SYSTEM C/ATUADORES');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0146', 'DISTRIBUIDOR HIDRAULICO ELETRONIC SYSTEM C/ATUADORES', 'Peças', 'produto', 'UN', '39172900',
      900, 1016.64, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 146) | NCM: 39172900 | Preço Unit.: R$ 900,00 | Valor ST: R$ 116,64 | Preço c/ ST: R$ 1.016,64', v_fornecedor_id
    );
  END IF;

  -- Linha 147: PEC-0147 - DISTRIBUIDOR HIDRAULICO FIBRA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0147' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO FIBRA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0147'),
        nome = 'DISTRIBUIDOR HIDRAULICO FIBRA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 80,
        preco_venda = 90.37,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 147) | NCM: 39172900 | Preço Unit.: R$ 80,00 | Valor ST: R$ 10,37 | Preço c/ ST: R$ 90,37',
        ativo = true
    WHERE codigo = 'PEC-0147' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO FIBRA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0147', 'DISTRIBUIDOR HIDRAULICO FIBRA', 'Peças', 'produto', 'UN', '39172900',
      80, 90.37, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 147) | NCM: 39172900 | Preço Unit.: R$ 80,00 | Valor ST: R$ 10,37 | Preço c/ ST: R$ 90,37', v_fornecedor_id
    );
  END IF;

  -- Linha 148: PEC-0148 - DISTRIBUIDOR HIDRAULICO FULL
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0148' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO FULL')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0148'),
        nome = 'DISTRIBUIDOR HIDRAULICO FULL',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 50,
        preco_venda = 56.48,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 148) | NCM: 39172900 | Preço Unit.: R$ 50,00 | Valor ST: R$ 6,48 | Preço c/ ST: R$ 56,48',
        ativo = true
    WHERE codigo = 'PEC-0148' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO FULL');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0148', 'DISTRIBUIDOR HIDRAULICO FULL', 'Peças', 'produto', 'UN', '39172900',
      50, 56.48, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 148) | NCM: 39172900 | Preço Unit.: R$ 50,00 | Valor ST: R$ 6,48 | Preço c/ ST: R$ 56,48', v_fornecedor_id
    );
  END IF;

  -- Linha 149: PEC-0149 - DISTRIBUIDOR HIDRAULICO G2
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0149' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO G2')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0149'),
        nome = 'DISTRIBUIDOR HIDRAULICO G2',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 75,
        preco_venda = 84.72,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 149) | NCM: 39172900 | Preço Unit.: R$ 75,00 | Valor ST: R$ 9,72 | Preço c/ ST: R$ 84,72',
        ativo = true
    WHERE codigo = 'PEC-0149' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO G2');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0149', 'DISTRIBUIDOR HIDRAULICO G2', 'Peças', 'produto', 'UN', '39172900',
      75, 84.72, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 149) | NCM: 39172900 | Preço Unit.: R$ 75,00 | Valor ST: R$ 9,72 | Preço c/ ST: R$ 84,72', v_fornecedor_id
    );
  END IF;

  -- Linha 150: PEC-0150 - DISTRIBUIDOR HIDRAULICO G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0150' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0150'),
        nome = 'DISTRIBUIDOR HIDRAULICO G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 100,
        preco_venda = 112.96,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 150) | NCM: 39172900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96',
        ativo = true
    WHERE codigo = 'PEC-0150' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0150', 'DISTRIBUIDOR HIDRAULICO G4', 'Peças', 'produto', 'UN', '39172900',
      100, 112.96, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 150) | NCM: 39172900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96', v_fornecedor_id
    );
  END IF;

  -- Linha 151: PEC-0151 - DISTRIBUIDOR HIDRAULICO G5
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0151' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO G5')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0151'),
        nome = 'DISTRIBUIDOR HIDRAULICO G5',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 100,
        preco_venda = 112.96,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 151) | NCM: 39172900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96',
        ativo = true
    WHERE codigo = 'PEC-0151' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO G5');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0151', 'DISTRIBUIDOR HIDRAULICO G5', 'Peças', 'produto', 'UN', '39172900',
      100, 112.96, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 151) | NCM: 39172900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96', v_fornecedor_id
    );
  END IF;

  -- Linha 152: PEC-0152 - DISTRIBUIDOR HIDRAULICO G6
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0152' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO G6')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0152'),
        nome = 'DISTRIBUIDOR HIDRAULICO G6',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 100,
        preco_venda = 112.96,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 152) | NCM: 39172900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96',
        ativo = true
    WHERE codigo = 'PEC-0152' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO G6');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0152', 'DISTRIBUIDOR HIDRAULICO G6', 'Peças', 'produto', 'UN', '39172900',
      100, 112.96, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 152) | NCM: 39172900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96', v_fornecedor_id
    );
  END IF;

  -- Linha 153: PEC-0153 - DISTRIBUIDOR HIDRAULICO G7
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0153' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO G7')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0153'),
        nome = 'DISTRIBUIDOR HIDRAULICO G7',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 100,
        preco_venda = 112.96,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 153) | NCM: 39172900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96',
        ativo = true
    WHERE codigo = 'PEC-0153' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO G7');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0153', 'DISTRIBUIDOR HIDRAULICO G7', 'Peças', 'produto', 'UN', '39172900',
      100, 112.96, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 153) | NCM: 39172900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96', v_fornecedor_id
    );
  END IF;

  -- Linha 154: PEC-0154 - DISTRIBUIDOR HIDRAULICO SPLASH 25MM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0154' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO SPLASH 25MM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0154'),
        nome = 'DISTRIBUIDOR HIDRAULICO SPLASH 25MM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 100,
        preco_venda = 112.96,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 154) | NCM: 39172900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96',
        ativo = true
    WHERE codigo = 'PEC-0154' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO SPLASH 25MM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0154', 'DISTRIBUIDOR HIDRAULICO SPLASH 25MM', 'Peças', 'produto', 'UN', '39172900',
      100, 112.96, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 154) | NCM: 39172900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96', v_fornecedor_id
    );
  END IF;

  -- Linha 155: PEC-0155 - DISTRIBUIDOR HIDRAULICO SPLASH 4 REG 32MM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0155' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO SPLASH 4 REG 32MM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0155'),
        nome = 'DISTRIBUIDOR HIDRAULICO SPLASH 4 REG 32MM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 100,
        preco_venda = 112.96,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 155) | NCM: 39172900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96',
        ativo = true
    WHERE codigo = 'PEC-0155' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO SPLASH 4 REG 32MM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0155', 'DISTRIBUIDOR HIDRAULICO SPLASH 4 REG 32MM', 'Peças', 'produto', 'UN', '39172900',
      100, 112.96, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 155) | NCM: 39172900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96', v_fornecedor_id
    );
  END IF;

  -- Linha 156: PEC-0156 - DISTRIBUIDOR HIDRAULICO SPLASH DRY PUMP
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0156' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO SPLASH DRY PUMP')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0156'),
        nome = 'DISTRIBUIDOR HIDRAULICO SPLASH DRY PUMP',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 110,
        preco_venda = 124.26,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 156) | NCM: 39172900 | Preço Unit.: R$ 110,00 | Valor ST: R$ 14,26 | Preço c/ ST: R$ 124,26',
        ativo = true
    WHERE codigo = 'PEC-0156' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO SPLASH DRY PUMP');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0156', 'DISTRIBUIDOR HIDRAULICO SPLASH DRY PUMP', 'Peças', 'produto', 'UN', '39172900',
      110, 124.26, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 156) | NCM: 39172900 | Preço Unit.: R$ 110,00 | Valor ST: R$ 14,26 | Preço c/ ST: R$ 124,26', v_fornecedor_id
    );
  END IF;

  -- Linha 157: PEC-0157 - DISTRIBUIDOR HIDRAULICO THERMAS KELVIN G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0157' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO THERMAS KELVIN G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0157'),
        nome = 'DISTRIBUIDOR HIDRAULICO THERMAS KELVIN G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 120,
        preco_venda = 135.55,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 157) | NCM: 39172900 | Preço Unit.: R$ 120,00 | Valor ST: R$ 15,55 | Preço c/ ST: R$ 135,55',
        ativo = true
    WHERE codigo = 'PEC-0157' OR UPPER(TRIM(nome)) = UPPER('DISTRIBUIDOR HIDRAULICO THERMAS KELVIN G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0157', 'DISTRIBUIDOR HIDRAULICO THERMAS KELVIN G4', 'Peças', 'produto', 'UN', '39172900',
      120, 135.55, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 157) | NCM: 39172900 | Preço Unit.: R$ 120,00 | Valor ST: R$ 15,55 | Preço c/ ST: R$ 135,55', v_fornecedor_id
    );
  END IF;

  -- Linha 158: PEC-0158 - DRENO COM ESTRELA (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0158' OR UPPER(TRIM(nome)) = UPPER('DRENO COM ESTRELA (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0158'),
        nome = 'DRENO COM ESTRELA (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 37,
        preco_venda = 41.8,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 158) | NCM: 39174090 | Preço Unit.: R$ 37,00 | Valor ST: R$ 4,80 | Preço c/ ST: R$ 41,80',
        ativo = true
    WHERE codigo = 'PEC-0158' OR UPPER(TRIM(nome)) = UPPER('DRENO COM ESTRELA (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0158', 'DRENO COM ESTRELA (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39174090',
      37, 41.8, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 158) | NCM: 39174090 | Preço Unit.: R$ 37,00 | Valor ST: R$ 4,80 | Preço c/ ST: R$ 41,80', v_fornecedor_id
    );
  END IF;

  -- Linha 159: PEC-0159 - DRENO DE NÍVEL CX C/ 10
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0159' OR UPPER(TRIM(nome)) = UPPER('DRENO DE NÍVEL CX C/ 10')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0159'),
        nome = 'DRENO DE NÍVEL CX C/ 10',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 30,
        preco_venda = 33.89,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 159) | NCM: 39174090 | Preço Unit.: R$ 30,00 | Valor ST: R$ 3,89 | Preço c/ ST: R$ 33,89',
        ativo = true
    WHERE codigo = 'PEC-0159' OR UPPER(TRIM(nome)) = UPPER('DRENO DE NÍVEL CX C/ 10');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0159', 'DRENO DE NÍVEL CX C/ 10', 'Peças', 'produto', 'UN', '39174090',
      30, 33.89, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 159) | NCM: 39174090 | Preço Unit.: R$ 30,00 | Valor ST: R$ 3,89 | Preço c/ ST: R$ 33,89', v_fornecedor_id
    );
  END IF;

  -- Linha 160: PEC-0160 - DRENO DE SUCÇAO SPA DUO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0160' OR UPPER(TRIM(nome)) = UPPER('DRENO DE SUCÇAO SPA DUO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0160'),
        nome = 'DRENO DE SUCÇAO SPA DUO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '90191000',
        preco_custo = 55,
        preco_venda = 55,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 160) | NCM: 90191000 | Preço Unit.: R$ 55,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 55,00',
        ativo = true
    WHERE codigo = 'PEC-0160' OR UPPER(TRIM(nome)) = UPPER('DRENO DE SUCÇAO SPA DUO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0160', 'DRENO DE SUCÇAO SPA DUO', 'Peças', 'produto', 'UN', '90191000',
      55, 55, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 160) | NCM: 90191000 | Preço Unit.: R$ 55,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 55,00', v_fornecedor_id
    );
  END IF;

  -- Linha 161: PEC-0161 - DRENO DE SUCÇAO SPA LUXO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0161' OR UPPER(TRIM(nome)) = UPPER('DRENO DE SUCÇAO SPA LUXO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0161'),
        nome = 'DRENO DE SUCÇAO SPA LUXO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '90191000',
        preco_custo = 55,
        preco_venda = 55,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 161) | NCM: 90191000 | Preço Unit.: R$ 55,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 55,00',
        ativo = true
    WHERE codigo = 'PEC-0161' OR UPPER(TRIM(nome)) = UPPER('DRENO DE SUCÇAO SPA LUXO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0161', 'DRENO DE SUCÇAO SPA LUXO', 'Peças', 'produto', 'UN', '90191000',
      55, 55, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 161) | NCM: 90191000 | Preço Unit.: R$ 55,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 55,00', v_fornecedor_id
    );
  END IF;

  -- Linha 162: PEC-0162 - DUCHA DE MÃO EM PLÁSTICO SAUNA CLUB
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0162' OR UPPER(TRIM(nome)) = UPPER('DUCHA DE MÃO EM PLÁSTICO SAUNA CLUB')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0162'),
        nome = 'DUCHA DE MÃO EM PLÁSTICO SAUNA CLUB',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39229000',
        preco_custo = 180,
        preco_venda = 209.48,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 162) | NCM: 39229000 | Preço Unit.: R$ 180,00 | Valor ST: R$ 29,48 | Preço c/ ST: R$ 209,48',
        ativo = true
    WHERE codigo = 'PEC-0162' OR UPPER(TRIM(nome)) = UPPER('DUCHA DE MÃO EM PLÁSTICO SAUNA CLUB');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0162', 'DUCHA DE MÃO EM PLÁSTICO SAUNA CLUB', 'Peças', 'produto', 'UN', '39229000',
      180, 209.48, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 162) | NCM: 39229000 | Preço Unit.: R$ 180,00 | Valor ST: R$ 29,48 | Preço c/ ST: R$ 209,48', v_fornecedor_id
    );
  END IF;

  -- Linha 163: PEC-0163 - DUTO ECOLOGICO 50 M
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0163' OR UPPER(TRIM(nome)) = UPPER('DUTO ECOLOGICO 50 M')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0163'),
        nome = 'DUTO ECOLOGICO 50 M',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39173290',
        preco_custo = 765,
        preco_venda = 871.84,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 163) | NCM: 39173290 | Preço Unit.: R$ 765,00 | Valor ST: R$ 106,84 | Preço c/ ST: R$ 871,84',
        ativo = true
    WHERE codigo = 'PEC-0163' OR UPPER(TRIM(nome)) = UPPER('DUTO ECOLOGICO 50 M');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0163', 'DUTO ECOLOGICO 50 M', 'Peças', 'produto', 'UN', '39173290',
      765, 871.84, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 163) | NCM: 39173290 | Preço Unit.: R$ 765,00 | Valor ST: R$ 106,84 | Preço c/ ST: R$ 871,84', v_fornecedor_id
    );
  END IF;

  -- Linha 164: PEC-0164 - ELETRO CALHA (57 CM)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0164' OR UPPER(TRIM(nome)) = UPPER('ELETRO CALHA (57 CM)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0164'),
        nome = 'ELETRO CALHA (57 CM)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 11,
        preco_venda = 12.43,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 164) | NCM: 39174090 | Preço Unit.: R$ 11,00 | Valor ST: R$ 1,43 | Preço c/ ST: R$ 12,43',
        ativo = true
    WHERE codigo = 'PEC-0164' OR UPPER(TRIM(nome)) = UPPER('ELETRO CALHA (57 CM)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0164', 'ELETRO CALHA (57 CM)', 'Peças', 'produto', 'UN', '39174090',
      11, 12.43, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 164) | NCM: 39174090 | Preço Unit.: R$ 11,00 | Valor ST: R$ 1,43 | Preço c/ ST: R$ 12,43', v_fornecedor_id
    );
  END IF;

  -- Linha 165: PEC-0165 - ENCOSTO DE CABEÇA SPA LUXO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0165' OR UPPER(TRIM(nome)) = UPPER('ENCOSTO DE CABEÇA SPA LUXO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0165'),
        nome = 'ENCOSTO DE CABEÇA SPA LUXO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39211390',
        preco_custo = 315,
        preco_venda = 315,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 165) | NCM: 39211390 | Preço Unit.: R$ 315,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 315,00',
        ativo = true
    WHERE codigo = 'PEC-0165' OR UPPER(TRIM(nome)) = UPPER('ENCOSTO DE CABEÇA SPA LUXO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0165', 'ENCOSTO DE CABEÇA SPA LUXO', 'Peças', 'produto', 'UN', '39211390',
      315, 315, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 165) | NCM: 39211390 | Preço Unit.: R$ 315,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 315,00', v_fornecedor_id
    );
  END IF;

  -- Linha 166: PEC-0166 - ESPELHO ADAPTADOR NOVO LED (CX C/10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0166' OR UPPER(TRIM(nome)) = UPPER('ESPELHO ADAPTADOR NOVO LED (CX C/10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0166'),
        nome = 'ESPELHO ADAPTADOR NOVO LED (CX C/10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 100,
        preco_venda = 112.96,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 166) | NCM: 39174090 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96',
        ativo = true
    WHERE codigo = 'PEC-0166' OR UPPER(TRIM(nome)) = UPPER('ESPELHO ADAPTADOR NOVO LED (CX C/10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0166', 'ESPELHO ADAPTADOR NOVO LED (CX C/10 UN)', 'Peças', 'produto', 'UN', '39174090',
      100, 112.96, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 166) | NCM: 39174090 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96', v_fornecedor_id
    );
  END IF;

  -- Linha 167: PEC-0167 - ESPELHO DO NICHO LED ANTIGO (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0167' OR UPPER(TRIM(nome)) = UPPER('ESPELHO DO NICHO LED ANTIGO (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0167'),
        nome = 'ESPELHO DO NICHO LED ANTIGO (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 100,
        preco_venda = 112.96,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 167) | NCM: 39174090 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96',
        ativo = true
    WHERE codigo = 'PEC-0167' OR UPPER(TRIM(nome)) = UPPER('ESPELHO DO NICHO LED ANTIGO (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0167', 'ESPELHO DO NICHO LED ANTIGO (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39174090',
      100, 112.96, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 167) | NCM: 39174090 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96', v_fornecedor_id
    );
  END IF;

  -- Linha 168: PEC-0168 - ESPELHO FLANGE 150MM (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0168' OR UPPER(TRIM(nome)) = UPPER('ESPELHO FLANGE 150MM (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0168'),
        nome = 'ESPELHO FLANGE 150MM (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 100,
        preco_venda = 112.96,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 168) | NCM: 39172900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96',
        ativo = true
    WHERE codigo = 'PEC-0168' OR UPPER(TRIM(nome)) = UPPER('ESPELHO FLANGE 150MM (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0168', 'ESPELHO FLANGE 150MM (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39172900',
      100, 112.96, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 168) | NCM: 39172900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96', v_fornecedor_id
    );
  END IF;

  -- Linha 169: PEC-0169 - ESPERA AQUECIMENTO G6
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0169' OR UPPER(TRIM(nome)) = UPPER('ESPERA AQUECIMENTO G6')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0169'),
        nome = 'ESPERA AQUECIMENTO G6',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172100',
        preco_custo = 300,
        preco_venda = 338.88,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 169) | NCM: 39172100 | Preço Unit.: R$ 300,00 | Valor ST: R$ 38,88 | Preço c/ ST: R$ 338,88',
        ativo = true
    WHERE codigo = 'PEC-0169' OR UPPER(TRIM(nome)) = UPPER('ESPERA AQUECIMENTO G6');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0169', 'ESPERA AQUECIMENTO G6', 'Peças', 'produto', 'UN', '39172100',
      300, 338.88, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 169) | NCM: 39172100 | Preço Unit.: R$ 300,00 | Valor ST: R$ 38,88 | Preço c/ ST: R$ 338,88', v_fornecedor_id
    );
  END IF;

  -- Linha 170: PEC-0170 - ESPERA AQUECIMENTO SPLASH DRY PUMP
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0170' OR UPPER(TRIM(nome)) = UPPER('ESPERA AQUECIMENTO SPLASH DRY PUMP')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0170'),
        nome = 'ESPERA AQUECIMENTO SPLASH DRY PUMP',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172100',
        preco_custo = 230,
        preco_venda = 259.81,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 170) | NCM: 39172100 | Preço Unit.: R$ 230,00 | Valor ST: R$ 29,81 | Preço c/ ST: R$ 259,81',
        ativo = true
    WHERE codigo = 'PEC-0170' OR UPPER(TRIM(nome)) = UPPER('ESPERA AQUECIMENTO SPLASH DRY PUMP');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0170', 'ESPERA AQUECIMENTO SPLASH DRY PUMP', 'Peças', 'produto', 'UN', '39172100',
      230, 259.81, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 170) | NCM: 39172100 | Preço Unit.: R$ 230,00 | Valor ST: R$ 29,81 | Preço c/ ST: R$ 259,81', v_fornecedor_id
    );
  END IF;

  -- Linha 171: PEC-0171 - ESPERA CLORADOR DRY PUMP (CX C/ 03 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0171' OR UPPER(TRIM(nome)) = UPPER('ESPERA CLORADOR DRY PUMP (CX C/ 03 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0171'),
        nome = 'ESPERA CLORADOR DRY PUMP (CX C/ 03 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172100',
        preco_custo = 235,
        preco_venda = 265.46,
        unidades_por_compra = 3,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 171) | NCM: 39172100 | Preço Unit.: R$ 235,00 | Valor ST: R$ 30,46 | Preço c/ ST: R$ 265,46',
        ativo = true
    WHERE codigo = 'PEC-0171' OR UPPER(TRIM(nome)) = UPPER('ESPERA CLORADOR DRY PUMP (CX C/ 03 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0171', 'ESPERA CLORADOR DRY PUMP (CX C/ 03 UN)', 'Peças', 'produto', 'UN', '39172100',
      235, 265.46, 0, 0,
      3, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 171) | NCM: 39172100 | Preço Unit.: R$ 235,00 | Valor ST: R$ 30,46 | Preço c/ ST: R$ 265,46', v_fornecedor_id
    );
  END IF;

  -- Linha 172: PEC-0172 - ESPERA CLORADOR G5/G6 (CX C/ 03 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0172' OR UPPER(TRIM(nome)) = UPPER('ESPERA CLORADOR G5/G6 (CX C/ 03 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0172'),
        nome = 'ESPERA CLORADOR G5/G6 (CX C/ 03 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172100',
        preco_custo = 235,
        preco_venda = 265.46,
        unidades_por_compra = 3,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 172) | NCM: 39172100 | Preço Unit.: R$ 235,00 | Valor ST: R$ 30,46 | Preço c/ ST: R$ 265,46',
        ativo = true
    WHERE codigo = 'PEC-0172' OR UPPER(TRIM(nome)) = UPPER('ESPERA CLORADOR G5/G6 (CX C/ 03 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0172', 'ESPERA CLORADOR G5/G6 (CX C/ 03 UN)', 'Peças', 'produto', 'UN', '39172100',
      235, 265.46, 0, 0,
      3, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 172) | NCM: 39172100 | Preço Unit.: R$ 235,00 | Valor ST: R$ 30,46 | Preço c/ ST: R$ 265,46', v_fornecedor_id
    );
  END IF;

  -- Linha 173: PEC-0173 - ESPERA U.V. G3 / FULL
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0173' OR UPPER(TRIM(nome)) = UPPER('ESPERA U.V. G3 / FULL')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0173'),
        nome = 'ESPERA U.V. G3 / FULL',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172100',
        preco_custo = 45,
        preco_venda = 50.83,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 173) | NCM: 39172100 | Preço Unit.: R$ 45,00 | Valor ST: R$ 5,83 | Preço c/ ST: R$ 50,83',
        ativo = true
    WHERE codigo = 'PEC-0173' OR UPPER(TRIM(nome)) = UPPER('ESPERA U.V. G3 / FULL');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0173', 'ESPERA U.V. G3 / FULL', 'Peças', 'produto', 'UN', '39172100',
      45, 50.83, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 173) | NCM: 39172100 | Preço Unit.: R$ 45,00 | Valor ST: R$ 5,83 | Preço c/ ST: R$ 50,83', v_fornecedor_id
    );
  END IF;

  -- Linha 174: PEC-0174 - ESPERA U.V. G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0174' OR UPPER(TRIM(nome)) = UPPER('ESPERA U.V. G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0174'),
        nome = 'ESPERA U.V. G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172100',
        preco_custo = 65,
        preco_venda = 73.42,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 174) | NCM: 39172100 | Preço Unit.: R$ 65,00 | Valor ST: R$ 8,42 | Preço c/ ST: R$ 73,42',
        ativo = true
    WHERE codigo = 'PEC-0174' OR UPPER(TRIM(nome)) = UPPER('ESPERA U.V. G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0174', 'ESPERA U.V. G4', 'Peças', 'produto', 'UN', '39172100',
      65, 73.42, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 174) | NCM: 39172100 | Preço Unit.: R$ 65,00 | Valor ST: R$ 8,42 | Preço c/ ST: R$ 73,42', v_fornecedor_id
    );
  END IF;

  -- Linha 175: PEC-0175 - ESPIGÃO IGUI 50MM (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0175' OR UPPER(TRIM(nome)) = UPPER('ESPIGÃO IGUI 50MM (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0175'),
        nome = 'ESPIGÃO IGUI 50MM (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 70,
        preco_venda = 79.07,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 175) | NCM: 39172900 | Preço Unit.: R$ 70,00 | Valor ST: R$ 9,07 | Preço c/ ST: R$ 79,07',
        ativo = true
    WHERE codigo = 'PEC-0175' OR UPPER(TRIM(nome)) = UPPER('ESPIGÃO IGUI 50MM (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0175', 'ESPIGÃO IGUI 50MM (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39172900',
      70, 79.07, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 175) | NCM: 39172900 | Preço Unit.: R$ 70,00 | Valor ST: R$ 9,07 | Preço c/ ST: R$ 79,07', v_fornecedor_id
    );
  END IF;

  -- Linha 176: PEC-0176 - ESPIGÃO SPLASH 40MM (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0176' OR UPPER(TRIM(nome)) = UPPER('ESPIGÃO SPLASH 40MM (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0176'),
        nome = 'ESPIGÃO SPLASH 40MM (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 50,
        preco_venda = 56.48,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 176) | NCM: 39172900 | Preço Unit.: R$ 50,00 | Valor ST: R$ 6,48 | Preço c/ ST: R$ 56,48',
        ativo = true
    WHERE codigo = 'PEC-0176' OR UPPER(TRIM(nome)) = UPPER('ESPIGÃO SPLASH 40MM (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0176', 'ESPIGÃO SPLASH 40MM (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39172900',
      50, 56.48, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 176) | NCM: 39172900 | Preço Unit.: R$ 50,00 | Valor ST: R$ 6,48 | Preço c/ ST: R$ 56,48', v_fornecedor_id
    );
  END IF;

  -- Linha 177: PEC-0177 - ETIQUETA QC
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0177' OR UPPER(TRIM(nome)) = UPPER('ETIQUETA QC')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0177'),
        nome = 'ETIQUETA QC',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '35069120',
        preco_custo = 2,
        preco_venda = 2,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 177) | NCM: 35069120 | Preço Unit.: R$ 2,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2,00',
        ativo = true
    WHERE codigo = 'PEC-0177' OR UPPER(TRIM(nome)) = UPPER('ETIQUETA QC');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0177', 'ETIQUETA QC', 'Peças', 'produto', 'UN', '35069120',
      2, 2, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 177) | NCM: 35069120 | Preço Unit.: R$ 2,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2,00', v_fornecedor_id
    );
  END IF;

  -- Linha 178: PEC-0178 - FAIXA DE LED C/ 4 LEDS PAINEL SAUNA CLUB
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0178' OR UPPER(TRIM(nome)) = UPPER('FAIXA DE LED C/ 4 LEDS PAINEL SAUNA CLUB')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0178'),
        nome = 'FAIXA DE LED C/ 4 LEDS PAINEL SAUNA CLUB',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '94054900',
        preco_custo = 120,
        preco_venda = 120,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 178) | NCM: 94054900 | Preço Unit.: R$ 120,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 120,00',
        ativo = true
    WHERE codigo = 'PEC-0178' OR UPPER(TRIM(nome)) = UPPER('FAIXA DE LED C/ 4 LEDS PAINEL SAUNA CLUB');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0178', 'FAIXA DE LED C/ 4 LEDS PAINEL SAUNA CLUB', 'Peças', 'produto', 'UN', '94054900',
      120, 120, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 178) | NCM: 94054900 | Preço Unit.: R$ 120,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 120,00', v_fornecedor_id
    );
  END IF;

  -- Linha 179: PEC-0179 - FILTRO CARTUCHO SPA DUO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0179' OR UPPER(TRIM(nome)) = UPPER('FILTRO CARTUCHO SPA DUO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0179'),
        nome = 'FILTRO CARTUCHO SPA DUO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 490,
        preco_venda = 614.76,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 179) | NCM: 39269090 | Preço Unit.: R$ 490,00 | Valor ST: R$ 124,76 | Preço c/ ST: R$ 614,76',
        ativo = true
    WHERE codigo = 'PEC-0179' OR UPPER(TRIM(nome)) = UPPER('FILTRO CARTUCHO SPA DUO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0179', 'FILTRO CARTUCHO SPA DUO', 'Peças', 'produto', 'UN', '39269090',
      490, 614.76, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 179) | NCM: 39269090 | Preço Unit.: R$ 490,00 | Valor ST: R$ 124,76 | Preço c/ ST: R$ 614,76', v_fornecedor_id
    );
  END IF;

  -- Linha 180: PEC-0180 - FILTRO CARTUCHO SPA LUXO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0180' OR UPPER(TRIM(nome)) = UPPER('FILTRO CARTUCHO SPA LUXO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0180'),
        nome = 'FILTRO CARTUCHO SPA LUXO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 999,
        preco_venda = 1253.36,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 180) | NCM: 39269090 | Preço Unit.: R$ 999,00 | Valor ST: R$ 254,36 | Preço c/ ST: R$ 1.253,36',
        ativo = true
    WHERE codigo = 'PEC-0180' OR UPPER(TRIM(nome)) = UPPER('FILTRO CARTUCHO SPA LUXO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0180', 'FILTRO CARTUCHO SPA LUXO', 'Peças', 'produto', 'UN', '39269090',
      999, 1253.36, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 180) | NCM: 39269090 | Preço Unit.: R$ 999,00 | Valor ST: R$ 254,36 | Preço c/ ST: R$ 1.253,36', v_fornecedor_id
    );
  END IF;

  -- Linha 181: PEC-0181 - FIM DE CURSO LEVITÁ
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0181' OR UPPER(TRIM(nome)) = UPPER('FIM DE CURSO LEVITÁ')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0181'),
        nome = 'FIM DE CURSO LEVITÁ',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 60,
        preco_venda = 67.78,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 181) | NCM: 39174090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 7,78 | Preço c/ ST: R$ 67,78',
        ativo = true
    WHERE codigo = 'PEC-0181' OR UPPER(TRIM(nome)) = UPPER('FIM DE CURSO LEVITÁ');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0181', 'FIM DE CURSO LEVITÁ', 'Peças', 'produto', 'UN', '39174090',
      60, 67.78, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 181) | NCM: 39174090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 7,78 | Preço c/ ST: R$ 67,78', v_fornecedor_id
    );
  END IF;

  -- Linha 182: PEC-0182 - FLANGE 150 C/ROSCA (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0182' OR UPPER(TRIM(nome)) = UPPER('FLANGE 150 C/ROSCA (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0182'),
        nome = 'FLANGE 150 C/ROSCA (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 315,
        preco_venda = 355.82,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 182) | NCM: 39174090 | Preço Unit.: R$ 315,00 | Valor ST: R$ 40,82 | Preço c/ ST: R$ 355,82',
        ativo = true
    WHERE codigo = 'PEC-0182' OR UPPER(TRIM(nome)) = UPPER('FLANGE 150 C/ROSCA (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0182', 'FLANGE 150 C/ROSCA (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      315, 355.82, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 182) | NCM: 39174090 | Preço Unit.: R$ 315,00 | Valor ST: R$ 40,82 | Preço c/ ST: R$ 355,82', v_fornecedor_id
    );
  END IF;

  -- Linha 183: PEC-0183 - FLANGE 150MM (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0183' OR UPPER(TRIM(nome)) = UPPER('FLANGE 150MM (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0183'),
        nome = 'FLANGE 150MM (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 220,
        preco_venda = 248.51,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 183) | NCM: 39174090 | Preço Unit.: R$ 220,00 | Valor ST: R$ 28,51 | Preço c/ ST: R$ 248,51',
        ativo = true
    WHERE codigo = 'PEC-0183' OR UPPER(TRIM(nome)) = UPPER('FLANGE 150MM (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0183', 'FLANGE 150MM (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      220, 248.51, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 183) | NCM: 39174090 | Preço Unit.: R$ 220,00 | Valor ST: R$ 28,51 | Preço c/ ST: R$ 248,51', v_fornecedor_id
    );
  END IF;

  -- Linha 184: PEC-0184 - FLANGE ADAPTADOR REGISTRO 32MM (CX C/10UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0184' OR UPPER(TRIM(nome)) = UPPER('FLANGE ADAPTADOR REGISTRO 32MM (CX C/10UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0184'),
        nome = 'FLANGE ADAPTADOR REGISTRO 32MM (CX C/10UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 70,
        preco_venda = 79.07,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 184) | NCM: 39174090 | Preço Unit.: R$ 70,00 | Valor ST: R$ 9,07 | Preço c/ ST: R$ 79,07',
        ativo = true
    WHERE codigo = 'PEC-0184' OR UPPER(TRIM(nome)) = UPPER('FLANGE ADAPTADOR REGISTRO 32MM (CX C/10UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0184', 'FLANGE ADAPTADOR REGISTRO 32MM (CX C/10UN)', 'Peças', 'produto', 'UN', '39174090',
      70, 79.07, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 184) | NCM: 39174090 | Preço Unit.: R$ 70,00 | Valor ST: R$ 9,07 | Preço c/ ST: R$ 79,07', v_fornecedor_id
    );
  END IF;

  -- Linha 185: PEC-0185 - FLANGE DA UNIAO 40 (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0185' OR UPPER(TRIM(nome)) = UPPER('FLANGE DA UNIAO 40 (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0185'),
        nome = 'FLANGE DA UNIAO 40 (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 55,
        preco_venda = 62.13,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 185) | NCM: 39174090 | Preço Unit.: R$ 55,00 | Valor ST: R$ 7,13 | Preço c/ ST: R$ 62,13',
        ativo = true
    WHERE codigo = 'PEC-0185' OR UPPER(TRIM(nome)) = UPPER('FLANGE DA UNIAO 40 (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0185', 'FLANGE DA UNIAO 40 (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      55, 62.13, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 185) | NCM: 39174090 | Preço Unit.: R$ 55,00 | Valor ST: R$ 7,13 | Preço c/ ST: R$ 62,13', v_fornecedor_id
    );
  END IF;

  -- Linha 186: PEC-0186 - FLANGE DA UNIAO 50 (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0186' OR UPPER(TRIM(nome)) = UPPER('FLANGE DA UNIAO 50 (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0186'),
        nome = 'FLANGE DA UNIAO 50 (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 50,
        preco_venda = 56.48,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 186) | NCM: 39174090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 6,48 | Preço c/ ST: R$ 56,48',
        ativo = true
    WHERE codigo = 'PEC-0186' OR UPPER(TRIM(nome)) = UPPER('FLANGE DA UNIAO 50 (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0186', 'FLANGE DA UNIAO 50 (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      50, 56.48, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 186) | NCM: 39174090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 6,48 | Preço c/ ST: R$ 56,48', v_fornecedor_id
    );
  END IF;

  -- Linha 187: PEC-0187 - FLANGE DO LED NOVO (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0187' OR UPPER(TRIM(nome)) = UPPER('FLANGE DO LED NOVO (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0187'),
        nome = 'FLANGE DO LED NOVO (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 200,
        preco_venda = 225.92,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 187) | NCM: 39172900 | Preço Unit.: R$ 200,00 | Valor ST: R$ 25,92 | Preço c/ ST: R$ 225,92',
        ativo = true
    WHERE codigo = 'PEC-0187' OR UPPER(TRIM(nome)) = UPPER('FLANGE DO LED NOVO (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0187', 'FLANGE DO LED NOVO (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39172900',
      200, 225.92, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 187) | NCM: 39172900 | Preço Unit.: R$ 200,00 | Valor ST: R$ 25,92 | Preço c/ ST: R$ 225,92', v_fornecedor_id
    );
  END IF;

  -- Linha 188: PEC-0188 - FONTE C/ LED
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0188' OR UPPER(TRIM(nome)) = UPPER('FONTE C/ LED')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0188'),
        nome = 'FONTE C/ LED',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '91070010',
        preco_custo = 24,
        preco_venda = 24,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 188) | NCM: 91070010 | Preço Unit.: R$ 24,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 24,00',
        ativo = true
    WHERE codigo = 'PEC-0188' OR UPPER(TRIM(nome)) = UPPER('FONTE C/ LED');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0188', 'FONTE C/ LED', 'Peças', 'produto', 'UN', '91070010',
      24, 24, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 188) | NCM: 91070010 | Preço Unit.: R$ 24,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 24,00', v_fornecedor_id
    );
  END IF;

  -- Linha 189: PEC-0189 - FONTE CHAVEADA 10A
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0189' OR UPPER(TRIM(nome)) = UPPER('FONTE CHAVEADA 10A')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0189'),
        nome = 'FONTE CHAVEADA 10A',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85044029',
        preco_custo = 300,
        preco_venda = 300,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 189) | NCM: 85044029 | Preço Unit.: R$ 300,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 300,00',
        ativo = true
    WHERE codigo = 'PEC-0189' OR UPPER(TRIM(nome)) = UPPER('FONTE CHAVEADA 10A');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0189', 'FONTE CHAVEADA 10A', 'Peças', 'produto', 'UN', '85044029',
      300, 300, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 189) | NCM: 85044029 | Preço Unit.: R$ 300,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 300,00', v_fornecedor_id
    );
  END IF;

  -- Linha 190: PEC-0190 - FONTE CHAVEADA 11,5V 5A
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0190' OR UPPER(TRIM(nome)) = UPPER('FONTE CHAVEADA 11,5V 5A')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0190'),
        nome = 'FONTE CHAVEADA 11,5V 5A',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85044029',
        preco_custo = 200,
        preco_venda = 200,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 190) | NCM: 85044029 | Preço Unit.: R$ 200,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 200,00',
        ativo = true
    WHERE codigo = 'PEC-0190' OR UPPER(TRIM(nome)) = UPPER('FONTE CHAVEADA 11,5V 5A');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0190', 'FONTE CHAVEADA 11,5V 5A', 'Peças', 'produto', 'UN', '85044029',
      200, 200, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 190) | NCM: 85044029 | Preço Unit.: R$ 200,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 200,00', v_fornecedor_id
    );
  END IF;

  -- Linha 191: PEC-0191 - FONTE CHAVEADA 12V 15A
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0191' OR UPPER(TRIM(nome)) = UPPER('FONTE CHAVEADA 12V 15A')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0191'),
        nome = 'FONTE CHAVEADA 12V 15A',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85044029',
        preco_custo = 200,
        preco_venda = 200,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 191) | NCM: 85044029 | Preço Unit.: R$ 200,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 200,00',
        ativo = true
    WHERE codigo = 'PEC-0191' OR UPPER(TRIM(nome)) = UPPER('FONTE CHAVEADA 12V 15A');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0191', 'FONTE CHAVEADA 12V 15A', 'Peças', 'produto', 'UN', '85044029',
      200, 200, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 191) | NCM: 85044029 | Preço Unit.: R$ 200,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 200,00', v_fornecedor_id
    );
  END IF;

  -- Linha 192: PEC-0192 - FONTE CHAVEADA 12V 1A
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0192' OR UPPER(TRIM(nome)) = UPPER('FONTE CHAVEADA 12V 1A')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0192'),
        nome = 'FONTE CHAVEADA 12V 1A',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85044029',
        preco_custo = 75,
        preco_venda = 75,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 192) | NCM: 85044029 | Preço Unit.: R$ 75,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 75,00',
        ativo = true
    WHERE codigo = 'PEC-0192' OR UPPER(TRIM(nome)) = UPPER('FONTE CHAVEADA 12V 1A');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0192', 'FONTE CHAVEADA 12V 1A', 'Peças', 'produto', 'UN', '85044029',
      75, 75, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 192) | NCM: 85044029 | Preço Unit.: R$ 75,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 75,00', v_fornecedor_id
    );
  END IF;

  -- Linha 193: PEC-0193 - FONTE CHAVEADA 12V 30A
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0193' OR UPPER(TRIM(nome)) = UPPER('FONTE CHAVEADA 12V 30A')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0193'),
        nome = 'FONTE CHAVEADA 12V 30A',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85044029',
        preco_custo = 350,
        preco_venda = 350,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 193) | NCM: 85044029 | Preço Unit.: R$ 350,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 350,00',
        ativo = true
    WHERE codigo = 'PEC-0193' OR UPPER(TRIM(nome)) = UPPER('FONTE CHAVEADA 12V 30A');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0193', 'FONTE CHAVEADA 12V 30A', 'Peças', 'produto', 'UN', '85044029',
      350, 350, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 193) | NCM: 85044029 | Preço Unit.: R$ 350,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 350,00', v_fornecedor_id
    );
  END IF;

  -- Linha 194: PEC-0194 - FONTE CHAVEADA 24V 10A
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0194' OR UPPER(TRIM(nome)) = UPPER('FONTE CHAVEADA 24V 10A')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0194'),
        nome = 'FONTE CHAVEADA 24V 10A',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85044029',
        preco_custo = 300,
        preco_venda = 300,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 194) | NCM: 85044029 | Preço Unit.: R$ 300,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 300,00',
        ativo = true
    WHERE codigo = 'PEC-0194' OR UPPER(TRIM(nome)) = UPPER('FONTE CHAVEADA 24V 10A');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0194', 'FONTE CHAVEADA 24V 10A', 'Peças', 'produto', 'UN', '85044029',
      300, 300, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 194) | NCM: 85044029 | Preço Unit.: R$ 300,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 300,00', v_fornecedor_id
    );
  END IF;

  -- Linha 195: PEC-0195 - FONTE CHAVEADA 24VA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0195' OR UPPER(TRIM(nome)) = UPPER('FONTE CHAVEADA 24VA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0195'),
        nome = 'FONTE CHAVEADA 24VA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85044029',
        preco_custo = 300,
        preco_venda = 300,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 195) | NCM: 85044029 | Preço Unit.: R$ 300,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 300,00',
        ativo = true
    WHERE codigo = 'PEC-0195' OR UPPER(TRIM(nome)) = UPPER('FONTE CHAVEADA 24VA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0195', 'FONTE CHAVEADA 24VA', 'Peças', 'produto', 'UN', '85044029',
      300, 300, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 195) | NCM: 85044029 | Preço Unit.: R$ 300,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 300,00', v_fornecedor_id
    );
  END IF;

  -- Linha 196: PEC-0196 - FONTE CHAVEADA 24VA - CP
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0196' OR UPPER(TRIM(nome)) = UPPER('FONTE CHAVEADA 24VA - CP')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0196'),
        nome = 'FONTE CHAVEADA 24VA - CP',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85044029',
        preco_custo = 73.2,
        preco_venda = 73.2,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 196) | NCM: 85044029 | Preço Unit.: R$ 73,20 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 73,20',
        ativo = true
    WHERE codigo = 'PEC-0196' OR UPPER(TRIM(nome)) = UPPER('FONTE CHAVEADA 24VA - CP');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0196', 'FONTE CHAVEADA 24VA - CP', 'Peças', 'produto', 'UN', '85044029',
      73.2, 73.2, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 196) | NCM: 85044029 | Preço Unit.: R$ 73,20 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 73,20', v_fornecedor_id
    );
  END IF;

  -- Linha 197: PEC-0197 - FONTE S/ LED
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0197' OR UPPER(TRIM(nome)) = UPPER('FONTE S/ LED')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0197'),
        nome = 'FONTE S/ LED',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '94054900',
        preco_custo = 24,
        preco_venda = 24,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 197) | NCM: 94054900 | Preço Unit.: R$ 24,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 24,00',
        ativo = true
    WHERE codigo = 'PEC-0197' OR UPPER(TRIM(nome)) = UPPER('FONTE S/ LED');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0197', 'FONTE S/ LED', 'Peças', 'produto', 'UN', '94054900',
      24, 24, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 197) | NCM: 94054900 | Preço Unit.: R$ 24,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 24,00', v_fornecedor_id
    );
  END IF;

  -- Linha 198: PEC-0198 - FRENTE BOMBA 2CV C/ PRE FILTRO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0198' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA 2CV C/ PRE FILTRO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0198'),
        nome = 'FRENTE BOMBA 2CV C/ PRE FILTRO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84139200',
        preco_custo = 1280,
        preco_venda = 1280,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 198) | NCM: 84139200 | Preço Unit.: R$ 1.280,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.280,00',
        ativo = true
    WHERE codigo = 'PEC-0198' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA 2CV C/ PRE FILTRO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0198', 'FRENTE BOMBA 2CV C/ PRE FILTRO', 'Peças', 'produto', 'UN', '84139200',
      1280, 1280, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 198) | NCM: 84139200 | Preço Unit.: R$ 1.280,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.280,00', v_fornecedor_id
    );
  END IF;

  -- Linha 199: PEC-0199 - FRENTE BOMBA C/ GALHADA G2
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0199' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA C/ GALHADA G2')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0199'),
        nome = 'FRENTE BOMBA C/ GALHADA G2',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84139200',
        preco_custo = 80,
        preco_venda = 80,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 199) | NCM: 84139200 | Preço Unit.: R$ 80,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 80,00',
        ativo = true
    WHERE codigo = 'PEC-0199' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA C/ GALHADA G2');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0199', 'FRENTE BOMBA C/ GALHADA G2', 'Peças', 'produto', 'UN', '84139200',
      80, 80, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 199) | NCM: 84139200 | Preço Unit.: R$ 80,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 80,00', v_fornecedor_id
    );
  END IF;

  -- Linha 200: PEC-0200 - FRENTE BOMBA C/2
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0200' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA C/2')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0200'),
        nome = 'FRENTE BOMBA C/2',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84139200',
        preco_custo = 37.02,
        preco_venda = 37.02,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 200) | NCM: 84139200 | Preço Unit.: R$ 37,02 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 37,02',
        ativo = true
    WHERE codigo = 'PEC-0200' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA C/2');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0200', 'FRENTE BOMBA C/2', 'Peças', 'produto', 'UN', '84139200',
      37.02, 37.02, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 200) | NCM: 84139200 | Preço Unit.: R$ 37,02 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 37,02', v_fornecedor_id
    );
  END IF;

  -- Linha 201: PEC-0201 - FRENTE BOMBA DRY PUMP C/ PRÉ FILTRO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0201' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA DRY PUMP C/ PRÉ FILTRO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0201'),
        nome = 'FRENTE BOMBA DRY PUMP C/ PRÉ FILTRO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84139200',
        preco_custo = 340,
        preco_venda = 340,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 201) | NCM: 84139200 | Preço Unit.: R$ 340,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 340,00',
        ativo = true
    WHERE codigo = 'PEC-0201' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA DRY PUMP C/ PRÉ FILTRO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0201', 'FRENTE BOMBA DRY PUMP C/ PRÉ FILTRO', 'Peças', 'produto', 'UN', '84139200',
      340, 340, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 201) | NCM: 84139200 | Preço Unit.: R$ 340,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 340,00', v_fornecedor_id
    );
  END IF;

  -- Linha 202: PEC-0202 - FRENTE BOMBA DRY PUMP C/ PRÉ FILTRO AQUECIMENTO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0202' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA DRY PUMP C/ PRÉ FILTRO AQUECIMENTO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0202'),
        nome = 'FRENTE BOMBA DRY PUMP C/ PRÉ FILTRO AQUECIMENTO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84139200',
        preco_custo = 340,
        preco_venda = 340,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 202) | NCM: 84139200 | Preço Unit.: R$ 340,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 340,00',
        ativo = true
    WHERE codigo = 'PEC-0202' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA DRY PUMP C/ PRÉ FILTRO AQUECIMENTO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0202', 'FRENTE BOMBA DRY PUMP C/ PRÉ FILTRO AQUECIMENTO', 'Peças', 'produto', 'UN', '84139200',
      340, 340, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 202) | NCM: 84139200 | Preço Unit.: R$ 340,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 340,00', v_fornecedor_id
    );
  END IF;

  -- Linha 203: PEC-0203 - FRENTE BOMBA ECO SYSTEM 3 REGISTROS
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0203' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA ECO SYSTEM 3 REGISTROS')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0203'),
        nome = 'FRENTE BOMBA ECO SYSTEM 3 REGISTROS',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84139200',
        preco_custo = 105,
        preco_venda = 105,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 203) | NCM: 84139200 | Preço Unit.: R$ 105,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 105,00',
        ativo = true
    WHERE codigo = 'PEC-0203' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA ECO SYSTEM 3 REGISTROS');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0203', 'FRENTE BOMBA ECO SYSTEM 3 REGISTROS', 'Peças', 'produto', 'UN', '84139200',
      105, 105, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 203) | NCM: 84139200 | Preço Unit.: R$ 105,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 105,00', v_fornecedor_id
    );
  END IF;

  -- Linha 204: PEC-0204 - FRENTE BOMBA ECO SYSTEM 4 REGISTROS
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0204' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA ECO SYSTEM 4 REGISTROS')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0204'),
        nome = 'FRENTE BOMBA ECO SYSTEM 4 REGISTROS',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84139200',
        preco_custo = 110,
        preco_venda = 110,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 204) | NCM: 84139200 | Preço Unit.: R$ 110,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 110,00',
        ativo = true
    WHERE codigo = 'PEC-0204' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA ECO SYSTEM 4 REGISTROS');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0204', 'FRENTE BOMBA ECO SYSTEM 4 REGISTROS', 'Peças', 'produto', 'UN', '84139200',
      110, 110, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 204) | NCM: 84139200 | Preço Unit.: R$ 110,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 110,00', v_fornecedor_id
    );
  END IF;

  -- Linha 205: PEC-0205 - FRENTE BOMBA G3/FULL (CX C/2 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0205' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA G3/FULL (CX C/2 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0205'),
        nome = 'FRENTE BOMBA G3/FULL (CX C/2 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84139200',
        preco_custo = 110,
        preco_venda = 110,
        unidades_por_compra = 2,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 205) | NCM: 84139200 | Preço Unit.: R$ 110,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 110,00',
        ativo = true
    WHERE codigo = 'PEC-0205' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA G3/FULL (CX C/2 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0205', 'FRENTE BOMBA G3/FULL (CX C/2 UN)', 'Peças', 'produto', 'UN', '84139200',
      110, 110, 0, 0,
      2, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 205) | NCM: 84139200 | Preço Unit.: R$ 110,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 110,00', v_fornecedor_id
    );
  END IF;

  -- Linha 206: PEC-0206 - FRENTE BOMBA G4 (CX C/ 02 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0206' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA G4 (CX C/ 02 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0206'),
        nome = 'FRENTE BOMBA G4 (CX C/ 02 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84139200',
        preco_custo = 110,
        preco_venda = 110,
        unidades_por_compra = 2,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 206) | NCM: 84139200 | Preço Unit.: R$ 110,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 110,00',
        ativo = true
    WHERE codigo = 'PEC-0206' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA G4 (CX C/ 02 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0206', 'FRENTE BOMBA G4 (CX C/ 02 UN)', 'Peças', 'produto', 'UN', '84139200',
      110, 110, 0, 0,
      2, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 206) | NCM: 84139200 | Preço Unit.: R$ 110,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 110,00', v_fornecedor_id
    );
  END IF;

  -- Linha 207: PEC-0207 - FRENTE BOMBA G5 C/ PRÉ FILTRO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0207' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA G5 C/ PRÉ FILTRO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0207'),
        nome = 'FRENTE BOMBA G5 C/ PRÉ FILTRO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84139200',
        preco_custo = 370,
        preco_venda = 370,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 207) | NCM: 84139200 | Preço Unit.: R$ 370,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 370,00',
        ativo = true
    WHERE codigo = 'PEC-0207' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA G5 C/ PRÉ FILTRO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0207', 'FRENTE BOMBA G5 C/ PRÉ FILTRO', 'Peças', 'produto', 'UN', '84139200',
      370, 370, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 207) | NCM: 84139200 | Preço Unit.: R$ 370,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 370,00', v_fornecedor_id
    );
  END IF;

  -- Linha 208: PEC-0208 - FRENTE BOMBA G6 C/ PRÉ FILTRO (CX C/ 02 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0208' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA G6 C/ PRÉ FILTRO (CX C/ 02 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0208'),
        nome = 'FRENTE BOMBA G6 C/ PRÉ FILTRO (CX C/ 02 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84139200',
        preco_custo = 760,
        preco_venda = 760,
        unidades_por_compra = 2,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 208) | NCM: 84139200 | Preço Unit.: R$ 760,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 760,00',
        ativo = true
    WHERE codigo = 'PEC-0208' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA G6 C/ PRÉ FILTRO (CX C/ 02 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0208', 'FRENTE BOMBA G6 C/ PRÉ FILTRO (CX C/ 02 UN)', 'Peças', 'produto', 'UN', '84139200',
      760, 760, 0, 0,
      2, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 208) | NCM: 84139200 | Preço Unit.: R$ 760,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 760,00', v_fornecedor_id
    );
  END IF;

  -- Linha 209: PEC-0209 - FRENTE BOMBA SPLASH C/GALHADA 2 REGISTROS
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0209' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA SPLASH C/GALHADA 2 REGISTROS')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0209'),
        nome = 'FRENTE BOMBA SPLASH C/GALHADA 2 REGISTROS',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84139200',
        preco_custo = 100,
        preco_venda = 100,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 209) | NCM: 84139200 | Preço Unit.: R$ 100,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 100,00',
        ativo = true
    WHERE codigo = 'PEC-0209' OR UPPER(TRIM(nome)) = UPPER('FRENTE BOMBA SPLASH C/GALHADA 2 REGISTROS');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0209', 'FRENTE BOMBA SPLASH C/GALHADA 2 REGISTROS', 'Peças', 'produto', 'UN', '84139200',
      100, 100, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 209) | NCM: 84139200 | Preço Unit.: R$ 100,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 100,00', v_fornecedor_id
    );
  END IF;

  -- Linha 210: PEC-0210 - FRENTE DA BOMBA PROGEU CX C/ 2
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0210' OR UPPER(TRIM(nome)) = UPPER('FRENTE DA BOMBA PROGEU CX C/ 2')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0210'),
        nome = 'FRENTE DA BOMBA PROGEU CX C/ 2',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84139200',
        preco_custo = 110,
        preco_venda = 110,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 210) | NCM: 84139200 | Preço Unit.: R$ 110,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 110,00',
        ativo = true
    WHERE codigo = 'PEC-0210' OR UPPER(TRIM(nome)) = UPPER('FRENTE DA BOMBA PROGEU CX C/ 2');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0210', 'FRENTE DA BOMBA PROGEU CX C/ 2', 'Peças', 'produto', 'UN', '84139200',
      110, 110, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 210) | NCM: 84139200 | Preço Unit.: R$ 110,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 110,00', v_fornecedor_id
    );
  END IF;

  -- Linha 211: PEC-0211 - FRENTE Q.C G7
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0211' OR UPPER(TRIM(nome)) = UPPER('FRENTE Q.C G7')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0211'),
        nome = 'FRENTE Q.C G7',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 300,
        preco_venda = 338.88,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 211) | NCM: 39174090 | Preço Unit.: R$ 300,00 | Valor ST: R$ 38,88 | Preço c/ ST: R$ 338,88',
        ativo = true
    WHERE codigo = 'PEC-0211' OR UPPER(TRIM(nome)) = UPPER('FRENTE Q.C G7');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0211', 'FRENTE Q.C G7', 'Peças', 'produto', 'UN', '39174090',
      300, 338.88, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 211) | NCM: 39174090 | Preço Unit.: R$ 300,00 | Valor ST: R$ 38,88 | Preço c/ ST: R$ 338,88', v_fornecedor_id
    );
  END IF;

  -- Linha 212: PEC-0212 - FRENTE Q.C MAX
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0212' OR UPPER(TRIM(nome)) = UPPER('FRENTE Q.C MAX')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0212'),
        nome = 'FRENTE Q.C MAX',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 200,
        preco_venda = 225.92,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 212) | NCM: 39174090 | Preço Unit.: R$ 200,00 | Valor ST: R$ 25,92 | Preço c/ ST: R$ 225,92',
        ativo = true
    WHERE codigo = 'PEC-0212' OR UPPER(TRIM(nome)) = UPPER('FRENTE Q.C MAX');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0212', 'FRENTE Q.C MAX', 'Peças', 'produto', 'UN', '39174090',
      200, 225.92, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 212) | NCM: 39174090 | Preço Unit.: R$ 200,00 | Valor ST: R$ 25,92 | Preço c/ ST: R$ 225,92', v_fornecedor_id
    );
  END IF;

  -- Linha 213: PEC-0213 - FRENTE Q.C SPLASH
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0213' OR UPPER(TRIM(nome)) = UPPER('FRENTE Q.C SPLASH')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0213'),
        nome = 'FRENTE Q.C SPLASH',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 150,
        preco_venda = 169.44,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 213) | NCM: 39174090 | Preço Unit.: R$ 150,00 | Valor ST: R$ 19,44 | Preço c/ ST: R$ 169,44',
        ativo = true
    WHERE codigo = 'PEC-0213' OR UPPER(TRIM(nome)) = UPPER('FRENTE Q.C SPLASH');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0213', 'FRENTE Q.C SPLASH', 'Peças', 'produto', 'UN', '39174090',
      150, 169.44, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 213) | NCM: 39174090 | Preço Unit.: R$ 150,00 | Valor ST: R$ 19,44 | Preço c/ ST: R$ 169,44', v_fornecedor_id
    );
  END IF;

  -- Linha 214: PEC-0214 - FUSÍVEL 10A
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0214' OR UPPER(TRIM(nome)) = UPPER('FUSÍVEL 10A')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0214'),
        nome = 'FUSÍVEL 10A',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85351000',
        preco_custo = 2,
        preco_venda = 2,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 214) | NCM: 85351000 | Preço Unit.: R$ 2,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2,00',
        ativo = true
    WHERE codigo = 'PEC-0214' OR UPPER(TRIM(nome)) = UPPER('FUSÍVEL 10A');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0214', 'FUSÍVEL 10A', 'Peças', 'produto', 'UN', '85351000',
      2, 2, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 214) | NCM: 85351000 | Preço Unit.: R$ 2,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2,00', v_fornecedor_id
    );
  END IF;

  -- Linha 215: PEC-0215 - FUSÍVEL 1A
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0215' OR UPPER(TRIM(nome)) = UPPER('FUSÍVEL 1A')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0215'),
        nome = 'FUSÍVEL 1A',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85351000',
        preco_custo = 2,
        preco_venda = 2,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 215) | NCM: 85351000 | Preço Unit.: R$ 2,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2,00',
        ativo = true
    WHERE codigo = 'PEC-0215' OR UPPER(TRIM(nome)) = UPPER('FUSÍVEL 1A');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0215', 'FUSÍVEL 1A', 'Peças', 'produto', 'UN', '85351000',
      2, 2, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 215) | NCM: 85351000 | Preço Unit.: R$ 2,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2,00', v_fornecedor_id
    );
  END IF;

  -- Linha 216: PEC-0216 - FUSÍVEL 5A
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0216' OR UPPER(TRIM(nome)) = UPPER('FUSÍVEL 5A')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0216'),
        nome = 'FUSÍVEL 5A',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85351000',
        preco_custo = 2,
        preco_venda = 2,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 216) | NCM: 85351000 | Preço Unit.: R$ 2,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2,00',
        ativo = true
    WHERE codigo = 'PEC-0216' OR UPPER(TRIM(nome)) = UPPER('FUSÍVEL 5A');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0216', 'FUSÍVEL 5A', 'Peças', 'produto', 'UN', '85351000',
      2, 2, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 216) | NCM: 85351000 | Preço Unit.: R$ 2,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2,00', v_fornecedor_id
    );
  END IF;

  -- Linha 217: PEC-0217 - GABARITO G5
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0217' OR UPPER(TRIM(nome)) = UPPER('GABARITO G5')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0217'),
        nome = 'GABARITO G5',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 30,
        preco_venda = 33.89,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 217) | NCM: 39174090 | Preço Unit.: R$ 30,00 | Valor ST: R$ 3,89 | Preço c/ ST: R$ 33,89',
        ativo = true
    WHERE codigo = 'PEC-0217' OR UPPER(TRIM(nome)) = UPPER('GABARITO G5');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0217', 'GABARITO G5', 'Peças', 'produto', 'UN', '39174090',
      30, 33.89, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 217) | NCM: 39174090 | Preço Unit.: R$ 30,00 | Valor ST: R$ 3,89 | Preço c/ ST: R$ 33,89', v_fornecedor_id
    );
  END IF;

  -- Linha 218: PEC-0218 - GANCHO TO KEEP
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0218' OR UPPER(TRIM(nome)) = UPPER('GANCHO TO KEEP')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0218'),
        nome = 'GANCHO TO KEEP',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '73259990',
        preco_custo = 2,
        preco_venda = 2.71,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 218) | NCM: 73259990 | Preço Unit.: R$ 2,00 | Valor ST: R$ 0,71 | Preço c/ ST: R$ 2,71',
        ativo = true
    WHERE codigo = 'PEC-0218' OR UPPER(TRIM(nome)) = UPPER('GANCHO TO KEEP');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0218', 'GANCHO TO KEEP', 'Peças', 'produto', 'UN', '73259990',
      2, 2.71, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 218) | NCM: 73259990 | Preço Unit.: R$ 2,00 | Valor ST: R$ 0,71 | Preço c/ ST: R$ 2,71', v_fornecedor_id
    );
  END IF;

  -- Linha 219: PEC-0219 - GERADOR DE VAPOR COM COMANDO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0219' OR UPPER(TRIM(nome)) = UPPER('GERADOR DE VAPOR COM COMANDO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0219'),
        nome = 'GERADOR DE VAPOR COM COMANDO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84798999',
        preco_custo = 3350,
        preco_venda = 3350,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 219) | NCM: 84798999 | Preço Unit.: R$ 3.350,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 3.350,00',
        ativo = true
    WHERE codigo = 'PEC-0219' OR UPPER(TRIM(nome)) = UPPER('GERADOR DE VAPOR COM COMANDO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0219', 'GERADOR DE VAPOR COM COMANDO', 'Peças', 'produto', 'UN', '84798999',
      3350, 3350, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 219) | NCM: 84798999 | Preço Unit.: R$ 3.350,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 3.350,00', v_fornecedor_id
    );
  END IF;

  -- Linha 220: PEC-0220 - GRADE SUPERIOR EM AÇO CARB Q235A B. AQ. WBR4.5HA3
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0220' OR UPPER(TRIM(nome)) = UPPER('GRADE SUPERIOR EM AÇO CARB Q235A B. AQ. WBR4.5HA3')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0220'),
        nome = 'GRADE SUPERIOR EM AÇO CARB Q235A B. AQ. WBR4.5HA3',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 435,
        preco_venda = 435,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 220) | NCM: 84189900 | Preço Unit.: R$ 435,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 435,00',
        ativo = true
    WHERE codigo = 'PEC-0220' OR UPPER(TRIM(nome)) = UPPER('GRADE SUPERIOR EM AÇO CARB Q235A B. AQ. WBR4.5HA3');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0220', 'GRADE SUPERIOR EM AÇO CARB Q235A B. AQ. WBR4.5HA3', 'Peças', 'produto', 'UN', '84189900',
      435, 435, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 220) | NCM: 84189900 | Preço Unit.: R$ 435,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 435,00', v_fornecedor_id
    );
  END IF;

  -- Linha 221: PEC-0221 - GRADE SUPERIOR EM AÇO CARB Q235A B. AQ. WBR12.5HA3
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0221' OR UPPER(TRIM(nome)) = UPPER('GRADE SUPERIOR EM AÇO CARB Q235A B. AQ. WBR12.5HA3')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0221'),
        nome = 'GRADE SUPERIOR EM AÇO CARB Q235A B. AQ. WBR12.5HA3',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 665,
        preco_venda = 665,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 221) | NCM: 84189900 | Preço Unit.: R$ 665,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 665,00',
        ativo = true
    WHERE codigo = 'PEC-0221' OR UPPER(TRIM(nome)) = UPPER('GRADE SUPERIOR EM AÇO CARB Q235A B. AQ. WBR12.5HA3');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0221', 'GRADE SUPERIOR EM AÇO CARB Q235A B. AQ. WBR12.5HA3', 'Peças', 'produto', 'UN', '84189900',
      665, 665, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 221) | NCM: 84189900 | Preço Unit.: R$ 665,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 665,00', v_fornecedor_id
    );
  END IF;

  -- Linha 222: PEC-0222 - GRADE SUPERIOR EM AÇO CARB Q235A B. AQ. WBR7.8HA3
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0222' OR UPPER(TRIM(nome)) = UPPER('GRADE SUPERIOR EM AÇO CARB Q235A B. AQ. WBR7.8HA3')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0222'),
        nome = 'GRADE SUPERIOR EM AÇO CARB Q235A B. AQ. WBR7.8HA3',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 595,
        preco_venda = 595,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 222) | NCM: 84189900 | Preço Unit.: R$ 595,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 595,00',
        ativo = true
    WHERE codigo = 'PEC-0222' OR UPPER(TRIM(nome)) = UPPER('GRADE SUPERIOR EM AÇO CARB Q235A B. AQ. WBR7.8HA3');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0222', 'GRADE SUPERIOR EM AÇO CARB Q235A B. AQ. WBR7.8HA3', 'Peças', 'produto', 'UN', '84189900',
      595, 595, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 222) | NCM: 84189900 | Preço Unit.: R$ 595,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 595,00', v_fornecedor_id
    );
  END IF;

  -- Linha 223: PEC-0223 - GUIA QUARTZO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0223' OR UPPER(TRIM(nome)) = UPPER('GUIA QUARTZO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0223'),
        nome = 'GUIA QUARTZO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 15,
        preco_venda = 16.94,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 223) | NCM: 39174090 | Preço Unit.: R$ 15,00 | Valor ST: R$ 1,94 | Preço c/ ST: R$ 16,94',
        ativo = true
    WHERE codigo = 'PEC-0223' OR UPPER(TRIM(nome)) = UPPER('GUIA QUARTZO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0223', 'GUIA QUARTZO', 'Peças', 'produto', 'UN', '39174090',
      15, 16.94, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 223) | NCM: 39174090 | Preço Unit.: R$ 15,00 | Valor ST: R$ 1,94 | Preço c/ ST: R$ 16,94', v_fornecedor_id
    );
  END IF;

  -- Linha 224: PEC-0224 - HASTE DE APOIO - PAPATERRA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0224' OR UPPER(TRIM(nome)) = UPPER('HASTE DE APOIO - PAPATERRA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0224'),
        nome = 'HASTE DE APOIO - PAPATERRA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 70,
        preco_venda = 79.07,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 224) | NCM: 39174090 | Preço Unit.: R$ 70,00 | Valor ST: R$ 9,07 | Preço c/ ST: R$ 79,07',
        ativo = true
    WHERE codigo = 'PEC-0224' OR UPPER(TRIM(nome)) = UPPER('HASTE DE APOIO - PAPATERRA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0224', 'HASTE DE APOIO - PAPATERRA', 'Peças', 'produto', 'UN', '39174090',
      70, 79.07, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 224) | NCM: 39174090 | Preço Unit.: R$ 70,00 | Valor ST: R$ 9,07 | Preço c/ ST: R$ 79,07', v_fornecedor_id
    );
  END IF;

  -- Linha 225: PEC-0225 - INSERTO M6 BLOCO G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0225' OR UPPER(TRIM(nome)) = UPPER('INSERTO M6 BLOCO G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0225'),
        nome = 'INSERTO M6 BLOCO G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '74072110',
        preco_custo = 3,
        preco_venda = 3,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 225) | NCM: 74072110 | Preço Unit.: R$ 3,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 3,00',
        ativo = true
    WHERE codigo = 'PEC-0225' OR UPPER(TRIM(nome)) = UPPER('INSERTO M6 BLOCO G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0225', 'INSERTO M6 BLOCO G4', 'Peças', 'produto', 'UN', '74072110',
      3, 3, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 225) | NCM: 74072110 | Preço Unit.: R$ 3,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 3,00', v_fornecedor_id
    );
  END IF;

  -- Linha 226: PEC-0226 - INSERTO M8
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0226' OR UPPER(TRIM(nome)) = UPPER('INSERTO M8')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0226'),
        nome = 'INSERTO M8',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '74072110',
        preco_custo = 3,
        preco_venda = 3,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 226) | NCM: 74072110 | Preço Unit.: R$ 3,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 3,00',
        ativo = true
    WHERE codigo = 'PEC-0226' OR UPPER(TRIM(nome)) = UPPER('INSERTO M8');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0226', 'INSERTO M8', 'Peças', 'produto', 'UN', '74072110',
      3, 3, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 226) | NCM: 74072110 | Preço Unit.: R$ 3,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 3,00', v_fornecedor_id
    );
  END IF;

  -- Linha 227: PEC-0227 - INTERRUPTOR BIPOLAR PRETO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0227' OR UPPER(TRIM(nome)) = UPPER('INTERRUPTOR BIPOLAR PRETO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0227'),
        nome = 'INTERRUPTOR BIPOLAR PRETO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85365090',
        preco_custo = 15,
        preco_venda = 16.72,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 227) | NCM: 85365090 | Preço Unit.: R$ 15,00 | Valor ST: R$ 1,72 | Preço c/ ST: R$ 16,72',
        ativo = true
    WHERE codigo = 'PEC-0227' OR UPPER(TRIM(nome)) = UPPER('INTERRUPTOR BIPOLAR PRETO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0227', 'INTERRUPTOR BIPOLAR PRETO', 'Peças', 'produto', 'UN', '85365090',
      15, 16.72, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 227) | NCM: 85365090 | Preço Unit.: R$ 15,00 | Valor ST: R$ 1,72 | Preço c/ ST: R$ 16,72', v_fornecedor_id
    );
  END IF;

  -- Linha 228: PEC-0228 - INTERRUPTOR INTELIGENTE
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0228' OR UPPER(TRIM(nome)) = UPPER('INTERRUPTOR INTELIGENTE')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0228'),
        nome = 'INTERRUPTOR INTELIGENTE',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85365090',
        preco_custo = 350,
        preco_venda = 390.02,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 228) | NCM: 85365090 | Preço Unit.: R$ 350,00 | Valor ST: R$ 40,02 | Preço c/ ST: R$ 390,02',
        ativo = true
    WHERE codigo = 'PEC-0228' OR UPPER(TRIM(nome)) = UPPER('INTERRUPTOR INTELIGENTE');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0228', 'INTERRUPTOR INTELIGENTE', 'Peças', 'produto', 'UN', '85365090',
      350, 390.02, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 228) | NCM: 85365090 | Preço Unit.: R$ 350,00 | Valor ST: R$ 40,02 | Preço c/ ST: R$ 390,02', v_fornecedor_id
    );
  END IF;

  -- Linha 229: PEC-0229 - INTERRUPTOR MONOPOLAR AZUL
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0229' OR UPPER(TRIM(nome)) = UPPER('INTERRUPTOR MONOPOLAR AZUL')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0229'),
        nome = 'INTERRUPTOR MONOPOLAR AZUL',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85365090',
        preco_custo = 15,
        preco_venda = 16.72,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 229) | NCM: 85365090 | Preço Unit.: R$ 15,00 | Valor ST: R$ 1,72 | Preço c/ ST: R$ 16,72',
        ativo = true
    WHERE codigo = 'PEC-0229' OR UPPER(TRIM(nome)) = UPPER('INTERRUPTOR MONOPOLAR AZUL');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0229', 'INTERRUPTOR MONOPOLAR AZUL', 'Peças', 'produto', 'UN', '85365090',
      15, 16.72, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 229) | NCM: 85365090 | Preço Unit.: R$ 15,00 | Valor ST: R$ 1,72 | Preço c/ ST: R$ 16,72', v_fornecedor_id
    );
  END IF;

  -- Linha 230: PEC-0230 - JOELHO 25MM (CX C/ 50 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0230' OR UPPER(TRIM(nome)) = UPPER('JOELHO 25MM (CX C/ 50 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0230'),
        nome = 'JOELHO 25MM (CX C/ 50 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 215,
        preco_venda = 242.86,
        unidades_por_compra = 50,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 230) | NCM: 39172900 | Preço Unit.: R$ 215,00 | Valor ST: R$ 27,86 | Preço c/ ST: R$ 242,86',
        ativo = true
    WHERE codigo = 'PEC-0230' OR UPPER(TRIM(nome)) = UPPER('JOELHO 25MM (CX C/ 50 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0230', 'JOELHO 25MM (CX C/ 50 UN)', 'Peças', 'produto', 'UN', '39172900',
      215, 242.86, 0, 0,
      50, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 230) | NCM: 39172900 | Preço Unit.: R$ 215,00 | Valor ST: R$ 27,86 | Preço c/ ST: R$ 242,86', v_fornecedor_id
    );
  END IF;

  -- Linha 231: PEC-0231 - JOELHO 25MM C/ADAPTADOR (CX C/ 50 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0231' OR UPPER(TRIM(nome)) = UPPER('JOELHO 25MM C/ADAPTADOR (CX C/ 50 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0231'),
        nome = 'JOELHO 25MM C/ADAPTADOR (CX C/ 50 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 250,
        preco_venda = 282.4,
        unidades_por_compra = 50,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 231) | NCM: 39172900 | Preço Unit.: R$ 250,00 | Valor ST: R$ 32,40 | Preço c/ ST: R$ 282,40',
        ativo = true
    WHERE codigo = 'PEC-0231' OR UPPER(TRIM(nome)) = UPPER('JOELHO 25MM C/ADAPTADOR (CX C/ 50 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0231', 'JOELHO 25MM C/ADAPTADOR (CX C/ 50 UN)', 'Peças', 'produto', 'UN', '39172900',
      250, 282.4, 0, 0,
      50, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 231) | NCM: 39172900 | Preço Unit.: R$ 250,00 | Valor ST: R$ 32,40 | Preço c/ ST: R$ 282,40', v_fornecedor_id
    );
  END IF;

  -- Linha 232: PEC-0232 - JOELHO 40MM (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0232' OR UPPER(TRIM(nome)) = UPPER('JOELHO 40MM (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0232'),
        nome = 'JOELHO 40MM (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 50,
        preco_venda = 56.48,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 232) | NCM: 39174090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 6,48 | Preço c/ ST: R$ 56,48',
        ativo = true
    WHERE codigo = 'PEC-0232' OR UPPER(TRIM(nome)) = UPPER('JOELHO 40MM (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0232', 'JOELHO 40MM (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      50, 56.48, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 232) | NCM: 39174090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 6,48 | Preço c/ ST: R$ 56,48', v_fornecedor_id
    );
  END IF;

  -- Linha 233: PEC-0233 - JOELHO 50MM (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0233' OR UPPER(TRIM(nome)) = UPPER('JOELHO 50MM (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0233'),
        nome = 'JOELHO 50MM (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 55,
        preco_venda = 62.13,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 233) | NCM: 39174090 | Preço Unit.: R$ 55,00 | Valor ST: R$ 7,13 | Preço c/ ST: R$ 62,13',
        ativo = true
    WHERE codigo = 'PEC-0233' OR UPPER(TRIM(nome)) = UPPER('JOELHO 50MM (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0233', 'JOELHO 50MM (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      55, 62.13, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 233) | NCM: 39174090 | Preço Unit.: R$ 55,00 | Valor ST: R$ 7,13 | Preço c/ ST: R$ 62,13', v_fornecedor_id
    );
  END IF;

  -- Linha 234: PEC-0234 - JOELHO 50X40MM (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0234' OR UPPER(TRIM(nome)) = UPPER('JOELHO 50X40MM (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0234'),
        nome = 'JOELHO 50X40MM (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 50,
        preco_venda = 56.48,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 234) | NCM: 39174090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 6,48 | Preço c/ ST: R$ 56,48',
        ativo = true
    WHERE codigo = 'PEC-0234' OR UPPER(TRIM(nome)) = UPPER('JOELHO 50X40MM (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0234', 'JOELHO 50X40MM (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      50, 56.48, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 234) | NCM: 39174090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 6,48 | Preço c/ ST: R$ 56,48', v_fornecedor_id
    );
  END IF;

  -- Linha 235: PEC-0235 - JOELHO DO DRENO CX C/10
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0235' OR UPPER(TRIM(nome)) = UPPER('JOELHO DO DRENO CX C/10')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0235'),
        nome = 'JOELHO DO DRENO CX C/10',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 200,
        preco_venda = 225.92,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 235) | NCM: 39174090 | Preço Unit.: R$ 200,00 | Valor ST: R$ 25,92 | Preço c/ ST: R$ 225,92',
        ativo = true
    WHERE codigo = 'PEC-0235' OR UPPER(TRIM(nome)) = UPPER('JOELHO DO DRENO CX C/10');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0235', 'JOELHO DO DRENO CX C/10', 'Peças', 'produto', 'UN', '39174090',
      200, 225.92, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 235) | NCM: 39174090 | Preço Unit.: R$ 200,00 | Valor ST: R$ 25,92 | Preço c/ ST: R$ 225,92', v_fornecedor_id
    );
  END IF;

  -- Linha 236: PEC-0236 - KIT AQUECIMENTO G5
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0236' OR UPPER(TRIM(nome)) = UPPER('KIT AQUECIMENTO G5')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0236'),
        nome = 'KIT AQUECIMENTO G5',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84139200',
        preco_custo = 1890,
        preco_venda = 1890,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 236) | NCM: 84139200 | Preço Unit.: R$ 1.890,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.890,00',
        ativo = true
    WHERE codigo = 'PEC-0236' OR UPPER(TRIM(nome)) = UPPER('KIT AQUECIMENTO G5');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0236', 'KIT AQUECIMENTO G5', 'Peças', 'produto', 'UN', '84139200',
      1890, 1890, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 236) | NCM: 84139200 | Preço Unit.: R$ 1.890,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.890,00', v_fornecedor_id
    );
  END IF;

  -- Linha 237: PEC-0237 - KIT REPARO DO REGISTRO 25MM (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0237' OR UPPER(TRIM(nome)) = UPPER('KIT REPARO DO REGISTRO 25MM (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0237'),
        nome = 'KIT REPARO DO REGISTRO 25MM (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 45,
        preco_venda = 50.83,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 237) | NCM: 39174090 | Preço Unit.: R$ 45,00 | Valor ST: R$ 5,83 | Preço c/ ST: R$ 50,83',
        ativo = true
    WHERE codigo = 'PEC-0237' OR UPPER(TRIM(nome)) = UPPER('KIT REPARO DO REGISTRO 25MM (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0237', 'KIT REPARO DO REGISTRO 25MM (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39174090',
      45, 50.83, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 237) | NCM: 39174090 | Preço Unit.: R$ 45,00 | Valor ST: R$ 5,83 | Preço c/ ST: R$ 50,83', v_fornecedor_id
    );
  END IF;

  -- Linha 238: PEC-0238 - KIT REPARO DO REGISTRO 32MM (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0238' OR UPPER(TRIM(nome)) = UPPER('KIT REPARO DO REGISTRO 32MM (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0238'),
        nome = 'KIT REPARO DO REGISTRO 32MM (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 87,
        preco_venda = 98.28,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 238) | NCM: 39174090 | Preço Unit.: R$ 87,00 | Valor ST: R$ 11,28 | Preço c/ ST: R$ 98,28',
        ativo = true
    WHERE codigo = 'PEC-0238' OR UPPER(TRIM(nome)) = UPPER('KIT REPARO DO REGISTRO 32MM (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0238', 'KIT REPARO DO REGISTRO 32MM (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39174090',
      87, 98.28, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 238) | NCM: 39174090 | Preço Unit.: R$ 87,00 | Valor ST: R$ 11,28 | Preço c/ ST: R$ 98,28', v_fornecedor_id
    );
  END IF;

  -- Linha 239: PEC-0239 - KIT SPLASH AQUECIMENTO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0239' OR UPPER(TRIM(nome)) = UPPER('KIT SPLASH AQUECIMENTO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0239'),
        nome = 'KIT SPLASH AQUECIMENTO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84139200',
        preco_custo = 1650,
        preco_venda = 1650,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 239) | NCM: 84139200 | Preço Unit.: R$ 1.650,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.650,00',
        ativo = true
    WHERE codigo = 'PEC-0239' OR UPPER(TRIM(nome)) = UPPER('KIT SPLASH AQUECIMENTO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0239', 'KIT SPLASH AQUECIMENTO', 'Peças', 'produto', 'UN', '84139200',
      1650, 1650, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 239) | NCM: 84139200 | Preço Unit.: R$ 1.650,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.650,00', v_fornecedor_id
    );
  END IF;

  -- Linha 240: PEC-0240 - KIT U.V. G3
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0240' OR UPPER(TRIM(nome)) = UPPER('KIT U.V. G3')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0240'),
        nome = 'KIT U.V. G3',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85408990',
        preco_custo = 550,
        preco_venda = 550,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 240) | NCM: 85408990 | Preço Unit.: R$ 550,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 550,00',
        ativo = true
    WHERE codigo = 'PEC-0240' OR UPPER(TRIM(nome)) = UPPER('KIT U.V. G3');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0240', 'KIT U.V. G3', 'Peças', 'produto', 'UN', '85408990',
      550, 550, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 240) | NCM: 85408990 | Preço Unit.: R$ 550,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 550,00', v_fornecedor_id
    );
  END IF;

  -- Linha 241: PEC-0241 - KIT U.V. G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0241' OR UPPER(TRIM(nome)) = UPPER('KIT U.V. G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0241'),
        nome = 'KIT U.V. G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85408990',
        preco_custo = 850,
        preco_venda = 850,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 241) | NCM: 85408990 | Preço Unit.: R$ 850,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 850,00',
        ativo = true
    WHERE codigo = 'PEC-0241' OR UPPER(TRIM(nome)) = UPPER('KIT U.V. G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0241', 'KIT U.V. G4', 'Peças', 'produto', 'UN', '85408990',
      850, 850, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 241) | NCM: 85408990 | Preço Unit.: R$ 850,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 850,00', v_fornecedor_id
    );
  END IF;

  -- Linha 242: PEC-0242 - LAMPADA DE TETO SAUNA CLUB
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0242' OR UPPER(TRIM(nome)) = UPPER('LAMPADA DE TETO SAUNA CLUB')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0242'),
        nome = 'LAMPADA DE TETO SAUNA CLUB',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '94054900',
        preco_custo = 120,
        preco_venda = 120,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 242) | NCM: 94054900 | Preço Unit.: R$ 120,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 120,00',
        ativo = true
    WHERE codigo = 'PEC-0242' OR UPPER(TRIM(nome)) = UPPER('LAMPADA DE TETO SAUNA CLUB');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0242', 'LAMPADA DE TETO SAUNA CLUB', 'Peças', 'produto', 'UN', '94054900',
      120, 120, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 242) | NCM: 94054900 | Preço Unit.: R$ 120,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 120,00', v_fornecedor_id
    );
  END IF;

  -- Linha 243: PEC-0243 - LAMPADA UV 75W
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0243' OR UPPER(TRIM(nome)) = UPPER('LAMPADA UV 75W')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0243'),
        nome = 'LAMPADA UV 75W',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85394900',
        preco_custo = 160,
        preco_venda = 160,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 243) | NCM: 85394900 | Preço Unit.: R$ 160,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 160,00',
        ativo = true
    WHERE codigo = 'PEC-0243' OR UPPER(TRIM(nome)) = UPPER('LAMPADA UV 75W');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0243', 'LAMPADA UV 75W', 'Peças', 'produto', 'UN', '85394900',
      160, 160, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 243) | NCM: 85394900 | Preço Unit.: R$ 160,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 160,00', v_fornecedor_id
    );
  END IF;

  -- Linha 244: PEC-0244 - LED COLORIDO SPA LUXO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0244' OR UPPER(TRIM(nome)) = UPPER('LED COLORIDO SPA LUXO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0244'),
        nome = 'LED COLORIDO SPA LUXO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '94054900',
        preco_custo = 80,
        preco_venda = 80,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 244) | NCM: 94054900 | Preço Unit.: R$ 80,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 80,00',
        ativo = true
    WHERE codigo = 'PEC-0244' OR UPPER(TRIM(nome)) = UPPER('LED COLORIDO SPA LUXO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0244', 'LED COLORIDO SPA LUXO', 'Peças', 'produto', 'UN', '94054900',
      80, 80, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 244) | NCM: 94054900 | Preço Unit.: R$ 80,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 80,00', v_fornecedor_id
    );
  END IF;

  -- Linha 245: PEC-0245 - LED IGUILUX COLOR 18W
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0245' OR UPPER(TRIM(nome)) = UPPER('LED IGUILUX COLOR 18W')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0245'),
        nome = 'LED IGUILUX COLOR 18W',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '94054900',
        preco_custo = 990,
        preco_venda = 990,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 245) | NCM: 94054900 | Preço Unit.: R$ 990,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 990,00',
        ativo = true
    WHERE codigo = 'PEC-0245' OR UPPER(TRIM(nome)) = UPPER('LED IGUILUX COLOR 18W');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0245', 'LED IGUILUX COLOR 18W', 'Peças', 'produto', 'UN', '94054900',
      990, 990, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 245) | NCM: 94054900 | Preço Unit.: R$ 990,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 990,00', v_fornecedor_id
    );
  END IF;

  -- Linha 246: PEC-0246 - LED IGUILUX COLOR 18W TITANIO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0246' OR UPPER(TRIM(nome)) = UPPER('LED IGUILUX COLOR 18W TITANIO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0246'),
        nome = 'LED IGUILUX COLOR 18W TITANIO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '94054200',
        preco_custo = 1160,
        preco_venda = 1160,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 246) | NCM: 94054200 | Preço Unit.: R$ 1.160,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.160,00',
        ativo = true
    WHERE codigo = 'PEC-0246' OR UPPER(TRIM(nome)) = UPPER('LED IGUILUX COLOR 18W TITANIO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0246', 'LED IGUILUX COLOR 18W TITANIO', 'Peças', 'produto', 'UN', '94054200',
      1160, 1160, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 246) | NCM: 94054200 | Preço Unit.: R$ 1.160,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.160,00', v_fornecedor_id
    );
  END IF;

  -- Linha 247: PEC-0247 - LED IGUILUX POWER 5W (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0247' OR UPPER(TRIM(nome)) = UPPER('LED IGUILUX POWER 5W (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0247'),
        nome = 'LED IGUILUX POWER 5W (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '94054900',
        preco_custo = 875,
        preco_venda = 875,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 247) | NCM: 94054900 | Preço Unit.: R$ 875,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 875,00',
        ativo = true
    WHERE codigo = 'PEC-0247' OR UPPER(TRIM(nome)) = UPPER('LED IGUILUX POWER 5W (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0247', 'LED IGUILUX POWER 5W (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '94054900',
      875, 875, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 247) | NCM: 94054900 | Preço Unit.: R$ 875,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 875,00', v_fornecedor_id
    );
  END IF;

  -- Linha 248: PEC-0248 - LED IGUILUX POWER 5W TITANIO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0248' OR UPPER(TRIM(nome)) = UPPER('LED IGUILUX POWER 5W TITANIO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0248'),
        nome = 'LED IGUILUX POWER 5W TITANIO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '94054200',
        preco_custo = 293,
        preco_venda = 293,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 248) | NCM: 94054200 | Preço Unit.: R$ 293,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 293,00',
        ativo = true
    WHERE codigo = 'PEC-0248' OR UPPER(TRIM(nome)) = UPPER('LED IGUILUX POWER 5W TITANIO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0248', 'LED IGUILUX POWER 5W TITANIO', 'Peças', 'produto', 'UN', '94054200',
      293, 293, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 248) | NCM: 94054200 | Preço Unit.: R$ 293,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 293,00', v_fornecedor_id
    );
  END IF;

  -- Linha 249: PEC-0249 - LED IGUILUX WHITE 5W (CX C/05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0249' OR UPPER(TRIM(nome)) = UPPER('LED IGUILUX WHITE 5W (CX C/05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0249'),
        nome = 'LED IGUILUX WHITE 5W (CX C/05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '94054900',
        preco_custo = 875,
        preco_venda = 875,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 249) | NCM: 94054900 | Preço Unit.: R$ 875,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 875,00',
        ativo = true
    WHERE codigo = 'PEC-0249' OR UPPER(TRIM(nome)) = UPPER('LED IGUILUX WHITE 5W (CX C/05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0249', 'LED IGUILUX WHITE 5W (CX C/05 UN)', 'Peças', 'produto', 'UN', '94054900',
      875, 875, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 249) | NCM: 94054900 | Preço Unit.: R$ 875,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 875,00', v_fornecedor_id
    );
  END IF;

  -- Linha 250: PEC-0250 - LED IGUILUX WHITE 5W TITANIO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0250' OR UPPER(TRIM(nome)) = UPPER('LED IGUILUX WHITE 5W TITANIO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0250'),
        nome = 'LED IGUILUX WHITE 5W TITANIO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '94054200',
        preco_custo = 293,
        preco_venda = 293,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 250) | NCM: 94054200 | Preço Unit.: R$ 293,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 293,00',
        ativo = true
    WHERE codigo = 'PEC-0250' OR UPPER(TRIM(nome)) = UPPER('LED IGUILUX WHITE 5W TITANIO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0250', 'LED IGUILUX WHITE 5W TITANIO', 'Peças', 'produto', 'UN', '94054200',
      293, 293, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 250) | NCM: 94054200 | Preço Unit.: R$ 293,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 293,00', v_fornecedor_id
    );
  END IF;

  -- Linha 251: PEC-0251 - LED Q.C. MAX/BLOCO G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0251' OR UPPER(TRIM(nome)) = UPPER('LED Q.C. MAX/BLOCO G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0251'),
        nome = 'LED Q.C. MAX/BLOCO G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '94054900',
        preco_custo = 5,
        preco_venda = 5,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 251) | NCM: 94054900 | Preço Unit.: R$ 5,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 5,00',
        ativo = true
    WHERE codigo = 'PEC-0251' OR UPPER(TRIM(nome)) = UPPER('LED Q.C. MAX/BLOCO G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0251', 'LED Q.C. MAX/BLOCO G4', 'Peças', 'produto', 'UN', '94054900',
      5, 5, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 251) | NCM: 94054900 | Preço Unit.: R$ 5,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 5,00', v_fornecedor_id
    );
  END IF;

  -- Linha 252: PEC-0252 - LUVA DA UNIAO 40 (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0252' OR UPPER(TRIM(nome)) = UPPER('LUVA DA UNIAO 40 (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0252'),
        nome = 'LUVA DA UNIAO 40 (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 35,
        preco_venda = 39.54,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 252) | NCM: 39172900 | Preço Unit.: R$ 35,00 | Valor ST: R$ 4,54 | Preço c/ ST: R$ 39,54',
        ativo = true
    WHERE codigo = 'PEC-0252' OR UPPER(TRIM(nome)) = UPPER('LUVA DA UNIAO 40 (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0252', 'LUVA DA UNIAO 40 (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39172900',
      35, 39.54, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 252) | NCM: 39172900 | Preço Unit.: R$ 35,00 | Valor ST: R$ 4,54 | Preço c/ ST: R$ 39,54', v_fornecedor_id
    );
  END IF;

  -- Linha 253: PEC-0253 - LUVA DA UNIAO 50 (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0253' OR UPPER(TRIM(nome)) = UPPER('LUVA DA UNIAO 50 (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0253'),
        nome = 'LUVA DA UNIAO 50 (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 45,
        preco_venda = 50.83,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 253) | NCM: 39172900 | Preço Unit.: R$ 45,00 | Valor ST: R$ 5,83 | Preço c/ ST: R$ 50,83',
        ativo = true
    WHERE codigo = 'PEC-0253' OR UPPER(TRIM(nome)) = UPPER('LUVA DA UNIAO 50 (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0253', 'LUVA DA UNIAO 50 (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39172900',
      45, 50.83, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 253) | NCM: 39172900 | Preço Unit.: R$ 45,00 | Valor ST: R$ 5,83 | Preço c/ ST: R$ 50,83', v_fornecedor_id
    );
  END IF;

  -- Linha 254: PEC-0254 - LUVA FLANGE 150MM MODELO ANTIGO (PVC)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0254' OR UPPER(TRIM(nome)) = UPPER('LUVA FLANGE 150MM MODELO ANTIGO (PVC)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0254'),
        nome = 'LUVA FLANGE 150MM MODELO ANTIGO (PVC)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 40,
        preco_venda = 45.18,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 254) | NCM: 39172900 | Preço Unit.: R$ 40,00 | Valor ST: R$ 5,18 | Preço c/ ST: R$ 45,18',
        ativo = true
    WHERE codigo = 'PEC-0254' OR UPPER(TRIM(nome)) = UPPER('LUVA FLANGE 150MM MODELO ANTIGO (PVC)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0254', 'LUVA FLANGE 150MM MODELO ANTIGO (PVC)', 'Peças', 'produto', 'UN', '39172900',
      40, 45.18, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 254) | NCM: 39172900 | Preço Unit.: R$ 40,00 | Valor ST: R$ 5,18 | Preço c/ ST: R$ 45,18', v_fornecedor_id
    );
  END IF;

  -- Linha 255: PEC-0255 - LUVA PRATIC 150 (CX C/ 02 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0255' OR UPPER(TRIM(nome)) = UPPER('LUVA PRATIC 150 (CX C/ 02 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0255'),
        nome = 'LUVA PRATIC 150 (CX C/ 02 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 280,
        preco_venda = 316.29,
        unidades_por_compra = 2,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 255) | NCM: 39172900 | Preço Unit.: R$ 280,00 | Valor ST: R$ 36,29 | Preço c/ ST: R$ 316,29',
        ativo = true
    WHERE codigo = 'PEC-0255' OR UPPER(TRIM(nome)) = UPPER('LUVA PRATIC 150 (CX C/ 02 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0255', 'LUVA PRATIC 150 (CX C/ 02 UN)', 'Peças', 'produto', 'UN', '39172900',
      280, 316.29, 0, 0,
      2, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 255) | NCM: 39172900 | Preço Unit.: R$ 280,00 | Valor ST: R$ 36,29 | Preço c/ ST: R$ 316,29', v_fornecedor_id
    );
  END IF;

  -- Linha 256: PEC-0256 - MAÇANETA DA PORTA EM AÇO INOX SAUNA CLUB
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0256' OR UPPER(TRIM(nome)) = UPPER('MAÇANETA DA PORTA EM AÇO INOX SAUNA CLUB')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0256'),
        nome = 'MAÇANETA DA PORTA EM AÇO INOX SAUNA CLUB',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '73249000',
        preco_custo = 25,
        preco_venda = 33.87,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 256) | NCM: 73249000 | Preço Unit.: R$ 25,00 | Valor ST: R$ 8,87 | Preço c/ ST: R$ 33,87',
        ativo = true
    WHERE codigo = 'PEC-0256' OR UPPER(TRIM(nome)) = UPPER('MAÇANETA DA PORTA EM AÇO INOX SAUNA CLUB');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0256', 'MAÇANETA DA PORTA EM AÇO INOX SAUNA CLUB', 'Peças', 'produto', 'UN', '73249000',
      25, 33.87, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 256) | NCM: 73249000 | Preço Unit.: R$ 25,00 | Valor ST: R$ 8,87 | Preço c/ ST: R$ 33,87', v_fornecedor_id
    );
  END IF;

  -- Linha 257: PEC-0257 - MANGUEIRA 50MM - SUCÇAO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0257' OR UPPER(TRIM(nome)) = UPPER('MANGUEIRA 50MM - SUCÇAO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0257'),
        nome = 'MANGUEIRA 50MM - SUCÇAO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39173900',
        preco_custo = 45,
        preco_venda = 51.28,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 257) | NCM: 39173900 | Preço Unit.: R$ 45,00 | Valor ST: R$ 6,28 | Preço c/ ST: R$ 51,28',
        ativo = true
    WHERE codigo = 'PEC-0257' OR UPPER(TRIM(nome)) = UPPER('MANGUEIRA 50MM - SUCÇAO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0257', 'MANGUEIRA 50MM - SUCÇAO', 'Peças', 'produto', 'UN', '39173900',
      45, 51.28, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 257) | NCM: 39173900 | Preço Unit.: R$ 45,00 | Valor ST: R$ 6,28 | Preço c/ ST: R$ 51,28', v_fornecedor_id
    );
  END IF;

  -- Linha 258: PEC-0258 - MANGUEIRA 40MM - SUCÇÃO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0258' OR UPPER(TRIM(nome)) = UPPER('MANGUEIRA 40MM - SUCÇÃO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0258'),
        nome = 'MANGUEIRA 40MM - SUCÇÃO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39173900',
        preco_custo = 45,
        preco_venda = 51.28,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 258) | NCM: 39173900 | Preço Unit.: R$ 45,00 | Valor ST: R$ 6,28 | Preço c/ ST: R$ 51,28',
        ativo = true
    WHERE codigo = 'PEC-0258' OR UPPER(TRIM(nome)) = UPPER('MANGUEIRA 40MM - SUCÇÃO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0258', 'MANGUEIRA 40MM - SUCÇÃO', 'Peças', 'produto', 'UN', '39173900',
      45, 51.28, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 258) | NCM: 39173900 | Preço Unit.: R$ 45,00 | Valor ST: R$ 6,28 | Preço c/ ST: R$ 51,28', v_fornecedor_id
    );
  END IF;

  -- Linha 259: PEC-0259 - MANGUEIRA DO MASSAGEADOR DE PE EM ACO INOX
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0259' OR UPPER(TRIM(nome)) = UPPER('MANGUEIRA DO MASSAGEADOR DE PE EM ACO INOX')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0259'),
        nome = 'MANGUEIRA DO MASSAGEADOR DE PE EM ACO INOX',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '83071090',
        preco_custo = 130,
        preco_venda = 130,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 259) | NCM: 83071090 | Preço Unit.: R$ 130,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 130,00',
        ativo = true
    WHERE codigo = 'PEC-0259' OR UPPER(TRIM(nome)) = UPPER('MANGUEIRA DO MASSAGEADOR DE PE EM ACO INOX');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0259', 'MANGUEIRA DO MASSAGEADOR DE PE EM ACO INOX', 'Peças', 'produto', 'UN', '83071090',
      130, 130, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 259) | NCM: 83071090 | Preço Unit.: R$ 130,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 130,00', v_fornecedor_id
    );
  END IF;

  -- Linha 260: PEC-0260 - MANGUEIRA DUCHA DE MAO EM ACO INOX
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0260' OR UPPER(TRIM(nome)) = UPPER('MANGUEIRA DUCHA DE MAO EM ACO INOX')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0260'),
        nome = 'MANGUEIRA DUCHA DE MAO EM ACO INOX',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '83071090',
        preco_custo = 130,
        preco_venda = 130,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 260) | NCM: 83071090 | Preço Unit.: R$ 130,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 130,00',
        ativo = true
    WHERE codigo = 'PEC-0260' OR UPPER(TRIM(nome)) = UPPER('MANGUEIRA DUCHA DE MAO EM ACO INOX');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0260', 'MANGUEIRA DUCHA DE MAO EM ACO INOX', 'Peças', 'produto', 'UN', '83071090',
      130, 130, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 260) | NCM: 83071090 | Preço Unit.: R$ 130,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 130,00', v_fornecedor_id
    );
  END IF;

  -- Linha 261: PEC-0261 - MANGUEIRA EM ACO INOX(SAIDA E ENT. P/GER VAPOR)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0261' OR UPPER(TRIM(nome)) = UPPER('MANGUEIRA EM ACO INOX(SAIDA E ENT. P/GER VAPOR)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0261'),
        nome = 'MANGUEIRA EM ACO INOX(SAIDA E ENT. P/GER VAPOR)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '83071090',
        preco_custo = 130,
        preco_venda = 130,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 261) | NCM: 83071090 | Preço Unit.: R$ 130,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 130,00',
        ativo = true
    WHERE codigo = 'PEC-0261' OR UPPER(TRIM(nome)) = UPPER('MANGUEIRA EM ACO INOX(SAIDA E ENT. P/GER VAPOR)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0261', 'MANGUEIRA EM ACO INOX(SAIDA E ENT. P/GER VAPOR)', 'Peças', 'produto', 'UN', '83071090',
      130, 130, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 261) | NCM: 83071090 | Preço Unit.: R$ 130,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 130,00', v_fornecedor_id
    );
  END IF;

  -- Linha 262: PEC-0262 - MANGUEIRA VERDE DUCHA ESCOCESA - M
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0262' OR UPPER(TRIM(nome)) = UPPER('MANGUEIRA VERDE DUCHA ESCOCESA - M')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0262'),
        nome = 'MANGUEIRA VERDE DUCHA ESCOCESA - M',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39173290',
        preco_custo = 4,
        preco_venda = 4.56,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 262) | NCM: 39173290 | Preço Unit.: R$ 4,00 | Valor ST: R$ 0,56 | Preço c/ ST: R$ 4,56',
        ativo = true
    WHERE codigo = 'PEC-0262' OR UPPER(TRIM(nome)) = UPPER('MANGUEIRA VERDE DUCHA ESCOCESA - M');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0262', 'MANGUEIRA VERDE DUCHA ESCOCESA - M', 'Peças', 'produto', 'UN', '39173290',
      4, 4.56, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 262) | NCM: 39173290 | Preço Unit.: R$ 4,00 | Valor ST: R$ 0,56 | Preço c/ ST: R$ 4,56', v_fornecedor_id
    );
  END IF;

  -- Linha 263: PEC-0263 - MANIVELA OMBRELONE COPA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0263' OR UPPER(TRIM(nome)) = UPPER('MANIVELA OMBRELONE COPA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0263'),
        nome = 'MANIVELA OMBRELONE COPA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 300,
        preco_venda = 338.88,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 263) | NCM: 39172900 | Preço Unit.: R$ 300,00 | Valor ST: R$ 38,88 | Preço c/ ST: R$ 338,88',
        ativo = true
    WHERE codigo = 'PEC-0263' OR UPPER(TRIM(nome)) = UPPER('MANIVELA OMBRELONE COPA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0263', 'MANIVELA OMBRELONE COPA', 'Peças', 'produto', 'UN', '39172900',
      300, 338.88, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 263) | NCM: 39172900 | Preço Unit.: R$ 300,00 | Valor ST: R$ 38,88 | Preço c/ ST: R$ 338,88', v_fornecedor_id
    );
  END IF;

  -- Linha 264: PEC-0264 - MANIVELA OMBRELONE FIXO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0264' OR UPPER(TRIM(nome)) = UPPER('MANIVELA OMBRELONE FIXO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0264'),
        nome = 'MANIVELA OMBRELONE FIXO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 299,
        preco_venda = 337.75,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 264) | NCM: 39172900 | Preço Unit.: R$ 299,00 | Valor ST: R$ 38,75 | Preço c/ ST: R$ 337,75',
        ativo = true
    WHERE codigo = 'PEC-0264' OR UPPER(TRIM(nome)) = UPPER('MANIVELA OMBRELONE FIXO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0264', 'MANIVELA OMBRELONE FIXO', 'Peças', 'produto', 'UN', '39172900',
      299, 337.75, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 264) | NCM: 39172900 | Preço Unit.: R$ 299,00 | Valor ST: R$ 38,75 | Preço c/ ST: R$ 337,75', v_fornecedor_id
    );
  END IF;

  -- Linha 265: PEC-0265 - MANOPLA REGISTRO G4 (CX C/ 08 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0265' OR UPPER(TRIM(nome)) = UPPER('MANOPLA REGISTRO G4 (CX C/ 08 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0265'),
        nome = 'MANOPLA REGISTRO G4 (CX C/ 08 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 55,
        preco_venda = 62.13,
        unidades_por_compra = 8,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 265) | NCM: 39174090 | Preço Unit.: R$ 55,00 | Valor ST: R$ 7,13 | Preço c/ ST: R$ 62,13',
        ativo = true
    WHERE codigo = 'PEC-0265' OR UPPER(TRIM(nome)) = UPPER('MANOPLA REGISTRO G4 (CX C/ 08 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0265', 'MANOPLA REGISTRO G4 (CX C/ 08 UN)', 'Peças', 'produto', 'UN', '39174090',
      55, 62.13, 0, 0,
      8, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 265) | NCM: 39174090 | Preço Unit.: R$ 55,00 | Valor ST: R$ 7,13 | Preço c/ ST: R$ 62,13', v_fornecedor_id
    );
  END IF;

  -- Linha 266: PEC-0266 - MANOPLA CHAVE DE SEGURANÇA G4/G5
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0266' OR UPPER(TRIM(nome)) = UPPER('MANOPLA CHAVE DE SEGURANÇA G4/G5')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0266'),
        nome = 'MANOPLA CHAVE DE SEGURANÇA G4/G5',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 0.75,
        preco_venda = 0.94,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 266) | NCM: 39269090 | Preço Unit.: R$ 0,75 | Valor ST: R$ 0,19 | Preço c/ ST: R$ 0,94',
        ativo = true
    WHERE codigo = 'PEC-0266' OR UPPER(TRIM(nome)) = UPPER('MANOPLA CHAVE DE SEGURANÇA G4/G5');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0266', 'MANOPLA CHAVE DE SEGURANÇA G4/G5', 'Peças', 'produto', 'UN', '39269090',
      0.75, 0.94, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 266) | NCM: 39269090 | Preço Unit.: R$ 0,75 | Valor ST: R$ 0,19 | Preço c/ ST: R$ 0,94', v_fornecedor_id
    );
  END IF;

  -- Linha 267: PEC-0267 - MANOPLA IGUI (CX C/ 08 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0267' OR UPPER(TRIM(nome)) = UPPER('MANOPLA IGUI (CX C/ 08 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0267'),
        nome = 'MANOPLA IGUI (CX C/ 08 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 55,
        preco_venda = 62.13,
        unidades_por_compra = 8,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 267) | NCM: 39174090 | Preço Unit.: R$ 55,00 | Valor ST: R$ 7,13 | Preço c/ ST: R$ 62,13',
        ativo = true
    WHERE codigo = 'PEC-0267' OR UPPER(TRIM(nome)) = UPPER('MANOPLA IGUI (CX C/ 08 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0267', 'MANOPLA IGUI (CX C/ 08 UN)', 'Peças', 'produto', 'UN', '39174090',
      55, 62.13, 0, 0,
      8, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 267) | NCM: 39174090 | Preço Unit.: R$ 55,00 | Valor ST: R$ 7,13 | Preço c/ ST: R$ 62,13', v_fornecedor_id
    );
  END IF;

  -- Linha 268: PEC-0268 - MANOPLA REGISTRO 25MM (CX C/ 08 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0268' OR UPPER(TRIM(nome)) = UPPER('MANOPLA REGISTRO 25MM (CX C/ 08 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0268'),
        nome = 'MANOPLA REGISTRO 25MM (CX C/ 08 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 30,
        preco_venda = 33.89,
        unidades_por_compra = 8,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 268) | NCM: 39174090 | Preço Unit.: R$ 30,00 | Valor ST: R$ 3,89 | Preço c/ ST: R$ 33,89',
        ativo = true
    WHERE codigo = 'PEC-0268' OR UPPER(TRIM(nome)) = UPPER('MANOPLA REGISTRO 25MM (CX C/ 08 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0268', 'MANOPLA REGISTRO 25MM (CX C/ 08 UN)', 'Peças', 'produto', 'UN', '39174090',
      30, 33.89, 0, 0,
      8, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 268) | NCM: 39174090 | Preço Unit.: R$ 30,00 | Valor ST: R$ 3,89 | Preço c/ ST: R$ 33,89', v_fornecedor_id
    );
  END IF;

  -- Linha 269: PEC-0269 - MANOPLA REGISTRO 32MM (CX C/ 08 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0269' OR UPPER(TRIM(nome)) = UPPER('MANOPLA REGISTRO 32MM (CX C/ 08 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0269'),
        nome = 'MANOPLA REGISTRO 32MM (CX C/ 08 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 55,
        preco_venda = 62.13,
        unidades_por_compra = 8,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 269) | NCM: 39174090 | Preço Unit.: R$ 55,00 | Valor ST: R$ 7,13 | Preço c/ ST: R$ 62,13',
        ativo = true
    WHERE codigo = 'PEC-0269' OR UPPER(TRIM(nome)) = UPPER('MANOPLA REGISTRO 32MM (CX C/ 08 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0269', 'MANOPLA REGISTRO 32MM (CX C/ 08 UN)', 'Peças', 'produto', 'UN', '39174090',
      55, 62.13, 0, 0,
      8, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 269) | NCM: 39174090 | Preço Unit.: R$ 55,00 | Valor ST: R$ 7,13 | Preço c/ ST: R$ 62,13', v_fornecedor_id
    );
  END IF;

  -- Linha 270: PEC-0270 - MANOPLA SPLASH (CX C/ 08 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0270' OR UPPER(TRIM(nome)) = UPPER('MANOPLA SPLASH (CX C/ 08 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0270'),
        nome = 'MANOPLA SPLASH (CX C/ 08 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 55,
        preco_venda = 62.13,
        unidades_por_compra = 8,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 270) | NCM: 39174090 | Preço Unit.: R$ 55,00 | Valor ST: R$ 7,13 | Preço c/ ST: R$ 62,13',
        ativo = true
    WHERE codigo = 'PEC-0270' OR UPPER(TRIM(nome)) = UPPER('MANOPLA SPLASH (CX C/ 08 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0270', 'MANOPLA SPLASH (CX C/ 08 UN)', 'Peças', 'produto', 'UN', '39174090',
      55, 62.13, 0, 0,
      8, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 270) | NCM: 39174090 | Preço Unit.: R$ 55,00 | Valor ST: R$ 7,13 | Preço c/ ST: R$ 62,13', v_fornecedor_id
    );
  END IF;

  -- Linha 271: PEC-0271 - MASSAGEADOR PES SAUNA CLUB
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0271' OR UPPER(TRIM(nome)) = UPPER('MASSAGEADOR PES SAUNA CLUB')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0271'),
        nome = 'MASSAGEADOR PES SAUNA CLUB',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '95030099',
        preco_custo = 150,
        preco_venda = 150,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 271) | NCM: 95030099 | Preço Unit.: R$ 150,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 150,00',
        ativo = true
    WHERE codigo = 'PEC-0271' OR UPPER(TRIM(nome)) = UPPER('MASSAGEADOR PES SAUNA CLUB');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0271', 'MASSAGEADOR PES SAUNA CLUB', 'Peças', 'produto', 'UN', '95030099',
      150, 150, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 271) | NCM: 95030099 | Preço Unit.: R$ 150,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 150,00', v_fornecedor_id
    );
  END IF;

  -- Linha 272: PEC-0272 - MICROVENTILADOR PARA SAIDA DO VAPOR DA SAUNA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0272' OR UPPER(TRIM(nome)) = UPPER('MICROVENTILADOR PARA SAIDA DO VAPOR DA SAUNA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0272'),
        nome = 'MICROVENTILADOR PARA SAIDA DO VAPOR DA SAUNA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84145910',
        preco_custo = 30,
        preco_venda = 30,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 272) | NCM: 84145910 | Preço Unit.: R$ 30,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 30,00',
        ativo = true
    WHERE codigo = 'PEC-0272' OR UPPER(TRIM(nome)) = UPPER('MICROVENTILADOR PARA SAIDA DO VAPOR DA SAUNA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0272', 'MICROVENTILADOR PARA SAIDA DO VAPOR DA SAUNA', 'Peças', 'produto', 'UN', '84145910',
      30, 30, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 272) | NCM: 84145910 | Preço Unit.: R$ 30,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 30,00', v_fornecedor_id
    );
  END IF;

  -- Linha 274: PEC-0274 - MOLA APOIO LAMPADA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0274' OR UPPER(TRIM(nome)) = UPPER('MOLA APOIO LAMPADA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0274'),
        nome = 'MOLA APOIO LAMPADA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '73202090',
        preco_custo = 5,
        preco_venda = 5,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 274) | NCM: 73202090 | Preço Unit.: R$ 5,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 5,00',
        ativo = true
    WHERE codigo = 'PEC-0274' OR UPPER(TRIM(nome)) = UPPER('MOLA APOIO LAMPADA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0274', 'MOLA APOIO LAMPADA', 'Peças', 'produto', 'UN', '73202090',
      5, 5, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 274) | NCM: 73202090 | Preço Unit.: R$ 5,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 5,00', v_fornecedor_id
    );
  END IF;

  -- Linha 275: PEC-0275 - MOLA TRAVA ASPIRADOR (CX C/10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0275' OR UPPER(TRIM(nome)) = UPPER('MOLA TRAVA ASPIRADOR (CX C/10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0275'),
        nome = 'MOLA TRAVA ASPIRADOR (CX C/10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39229000',
        preco_custo = 10,
        preco_venda = 11.64,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 275) | NCM: 39229000 | Preço Unit.: R$ 10,00 | Valor ST: R$ 1,64 | Preço c/ ST: R$ 11,64',
        ativo = true
    WHERE codigo = 'PEC-0275' OR UPPER(TRIM(nome)) = UPPER('MOLA TRAVA ASPIRADOR (CX C/10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0275', 'MOLA TRAVA ASPIRADOR (CX C/10 UN)', 'Peças', 'produto', 'UN', '39229000',
      10, 11.64, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 275) | NCM: 39229000 | Preço Unit.: R$ 10,00 | Valor ST: R$ 1,64 | Preço c/ ST: R$ 11,64', v_fornecedor_id
    );
  END IF;

  -- Linha 276: PEC-0276 - MOTOBOMBA 1/2 CV G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0276' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 1/2 CV G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0276'),
        nome = 'MOTOBOMBA 1/2 CV G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014011',
        preco_custo = 1020,
        preco_venda = 1020,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 276) | NCM: 85014011 | Preço Unit.: R$ 1.020,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.020,00',
        ativo = true
    WHERE codigo = 'PEC-0276' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 1/2 CV G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0276', 'MOTOBOMBA 1/2 CV G4', 'Peças', 'produto', 'UN', '85014011',
      1020, 1020, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 276) | NCM: 85014011 | Preço Unit.: R$ 1.020,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.020,00', v_fornecedor_id
    );
  END IF;

  -- Linha 277: PEC-0277 - MOTOBOMBA 1/2 CV C/ DIST. G2
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0277' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 1/2 CV C/ DIST. G2')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0277'),
        nome = 'MOTOBOMBA 1/2 CV C/ DIST. G2',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014011',
        preco_custo = 1110,
        preco_venda = 1110,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 277) | NCM: 85014011 | Preço Unit.: R$ 1.110,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.110,00',
        ativo = true
    WHERE codigo = 'PEC-0277' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 1/2 CV C/ DIST. G2');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0277', 'MOTOBOMBA 1/2 CV C/ DIST. G2', 'Peças', 'produto', 'UN', '85014011',
      1110, 1110, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 277) | NCM: 85014011 | Preço Unit.: R$ 1.110,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.110,00', v_fornecedor_id
    );
  END IF;

  -- Linha 278: PEC-0278 - MOTOBOMBA 1/2 CV DRY PUMP
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0278' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 1/2 CV DRY PUMP')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0278'),
        nome = 'MOTOBOMBA 1/2 CV DRY PUMP',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014011',
        preco_custo = 1300,
        preco_venda = 1300,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 278) | NCM: 85014011 | Preço Unit.: R$ 1.300,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.300,00',
        ativo = true
    WHERE codigo = 'PEC-0278' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 1/2 CV DRY PUMP');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0278', 'MOTOBOMBA 1/2 CV DRY PUMP', 'Peças', 'produto', 'UN', '85014011',
      1300, 1300, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 278) | NCM: 85014011 | Preço Unit.: R$ 1.300,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.300,00', v_fornecedor_id
    );
  END IF;

  -- Linha 279: PEC-0279 - MOTOBOMBA 1/2 CV ECOSYSTEM C/ DISTRIBUIDOR
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0279' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 1/2 CV ECOSYSTEM C/ DISTRIBUIDOR')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0279'),
        nome = 'MOTOBOMBA 1/2 CV ECOSYSTEM C/ DISTRIBUIDOR',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014011',
        preco_custo = 1110,
        preco_venda = 1110,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 279) | NCM: 85014011 | Preço Unit.: R$ 1.110,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.110,00',
        ativo = true
    WHERE codigo = 'PEC-0279' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 1/2 CV ECOSYSTEM C/ DISTRIBUIDOR');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0279', 'MOTOBOMBA 1/2 CV ECOSYSTEM C/ DISTRIBUIDOR', 'Peças', 'produto', 'UN', '85014011',
      1110, 1110, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 279) | NCM: 85014011 | Preço Unit.: R$ 1.110,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.110,00', v_fornecedor_id
    );
  END IF;

  -- Linha 280: PEC-0280 - MOTOBOMBA 1/2 CV FIBRA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0280' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 1/2 CV FIBRA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0280'),
        nome = 'MOTOBOMBA 1/2 CV FIBRA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014011',
        preco_custo = 1060,
        preco_venda = 1060,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 280) | NCM: 85014011 | Preço Unit.: R$ 1.060,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.060,00',
        ativo = true
    WHERE codigo = 'PEC-0280' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 1/2 CV FIBRA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0280', 'MOTOBOMBA 1/2 CV FIBRA', 'Peças', 'produto', 'UN', '85014011',
      1060, 1060, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 280) | NCM: 85014011 | Preço Unit.: R$ 1.060,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.060,00', v_fornecedor_id
    );
  END IF;

  -- Linha 281: PEC-0281 - MOTOBOMBA 1/2 CV FULL
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0281' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 1/2 CV FULL')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0281'),
        nome = 'MOTOBOMBA 1/2 CV FULL',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014011',
        preco_custo = 1060,
        preco_venda = 1060,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 281) | NCM: 85014011 | Preço Unit.: R$ 1.060,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.060,00',
        ativo = true
    WHERE codigo = 'PEC-0281' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 1/2 CV FULL');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0281', 'MOTOBOMBA 1/2 CV FULL', 'Peças', 'produto', 'UN', '85014011',
      1060, 1060, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 281) | NCM: 85014011 | Preço Unit.: R$ 1.060,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.060,00', v_fornecedor_id
    );
  END IF;

  -- Linha 282: PEC-0282 - MOTOBOMBA 1/2 CV G3
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0282' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 1/2 CV G3')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0282'),
        nome = 'MOTOBOMBA 1/2 CV G3',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014011',
        preco_custo = 1020,
        preco_venda = 1020,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 282) | NCM: 85014011 | Preço Unit.: R$ 1.020,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.020,00',
        ativo = true
    WHERE codigo = 'PEC-0282' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 1/2 CV G3');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0282', 'MOTOBOMBA 1/2 CV G3', 'Peças', 'produto', 'UN', '85014011',
      1020, 1020, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 282) | NCM: 85014011 | Preço Unit.: R$ 1.020,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.020,00', v_fornecedor_id
    );
  END IF;

  -- Linha 283: PEC-0283 - MOTOBOMBA 1/2 CV G5
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0283' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 1/2 CV G5')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0283'),
        nome = 'MOTOBOMBA 1/2 CV G5',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014011',
        preco_custo = 1300,
        preco_venda = 1300,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 283) | NCM: 85014011 | Preço Unit.: R$ 1.300,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.300,00',
        ativo = true
    WHERE codigo = 'PEC-0283' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 1/2 CV G5');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0283', 'MOTOBOMBA 1/2 CV G5', 'Peças', 'produto', 'UN', '85014011',
      1300, 1300, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 283) | NCM: 85014011 | Preço Unit.: R$ 1.300,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.300,00', v_fornecedor_id
    );
  END IF;

  -- Linha 284: PEC-0284 - MOTOBOMBA 1/2 CV INOX
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0284' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 1/2 CV INOX')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0284'),
        nome = 'MOTOBOMBA 1/2 CV INOX',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014011',
        preco_custo = 1300,
        preco_venda = 1300,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 284) | NCM: 85014011 | Preço Unit.: R$ 1.300,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.300,00',
        ativo = true
    WHERE codigo = 'PEC-0284' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 1/2 CV INOX');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0284', 'MOTOBOMBA 1/2 CV INOX', 'Peças', 'produto', 'UN', '85014011',
      1300, 1300, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 284) | NCM: 85014011 | Preço Unit.: R$ 1.300,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.300,00', v_fornecedor_id
    );
  END IF;

  -- Linha 285: PEC-0285 - MOTOBOMBA 2 CV
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0285' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 2 CV')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0285'),
        nome = 'MOTOBOMBA 2 CV',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014011',
        preco_custo = 3600,
        preco_venda = 3600,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 285) | NCM: 85014011 | Preço Unit.: R$ 3.600,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 3.600,00',
        ativo = true
    WHERE codigo = 'PEC-0285' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 2 CV');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0285', 'MOTOBOMBA 2 CV', 'Peças', 'produto', 'UN', '85014011',
      3600, 3600, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 285) | NCM: 85014011 | Preço Unit.: R$ 3.600,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 3.600,00', v_fornecedor_id
    );
  END IF;

  -- Linha 286: PEC-0286 - MOTOBOMBA 3/4 CV DRY PUMP
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0286' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 3/4 CV DRY PUMP')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0286'),
        nome = 'MOTOBOMBA 3/4 CV DRY PUMP',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014011',
        preco_custo = 1580,
        preco_venda = 1580,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 286) | NCM: 85014011 | Preço Unit.: R$ 1.580,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.580,00',
        ativo = true
    WHERE codigo = 'PEC-0286' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 3/4 CV DRY PUMP');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0286', 'MOTOBOMBA 3/4 CV DRY PUMP', 'Peças', 'produto', 'UN', '85014011',
      1580, 1580, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 286) | NCM: 85014011 | Preço Unit.: R$ 1.580,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.580,00', v_fornecedor_id
    );
  END IF;

  -- Linha 287: PEC-0287 - MOTOBOMBA 3/4 CV G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0287' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 3/4 CV G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0287'),
        nome = 'MOTOBOMBA 3/4 CV G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014011',
        preco_custo = 1300,
        preco_venda = 1300,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 287) | NCM: 85014011 | Preço Unit.: R$ 1.300,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.300,00',
        ativo = true
    WHERE codigo = 'PEC-0287' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 3/4 CV G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0287', 'MOTOBOMBA 3/4 CV G4', 'Peças', 'produto', 'UN', '85014011',
      1300, 1300, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 287) | NCM: 85014011 | Preço Unit.: R$ 1.300,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.300,00', v_fornecedor_id
    );
  END IF;

  -- Linha 288: PEC-0288 - MOTOBOMBA 3/4 CV G5
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0288' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 3/4 CV G5')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0288'),
        nome = 'MOTOBOMBA 3/4 CV G5',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014011',
        preco_custo = 1580,
        preco_venda = 1580,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 288) | NCM: 85014011 | Preço Unit.: R$ 1.580,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.580,00',
        ativo = true
    WHERE codigo = 'PEC-0288' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 3/4 CV G5');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0288', 'MOTOBOMBA 3/4 CV G5', 'Peças', 'produto', 'UN', '85014011',
      1580, 1580, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 288) | NCM: 85014011 | Preço Unit.: R$ 1.580,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.580,00', v_fornecedor_id
    );
  END IF;

  -- Linha 289: PEC-0289 - MOTOBOMBA 3/4 CV G6
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0289' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 3/4 CV G6')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0289'),
        nome = 'MOTOBOMBA 3/4 CV G6',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014011',
        preco_custo = 1580,
        preco_venda = 1580,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 289) | NCM: 85014011 | Preço Unit.: R$ 1.580,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.580,00',
        ativo = true
    WHERE codigo = 'PEC-0289' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 3/4 CV G6');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0289', 'MOTOBOMBA 3/4 CV G6', 'Peças', 'produto', 'UN', '85014011',
      1580, 1580, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 289) | NCM: 85014011 | Preço Unit.: R$ 1.580,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.580,00', v_fornecedor_id
    );
  END IF;

  -- Linha 290: PEC-0290 - MOTOBOMBA 3/4 CV G7
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0290' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 3/4 CV G7')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0290'),
        nome = 'MOTOBOMBA 3/4 CV G7',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014011',
        preco_custo = 1580,
        preco_venda = 1580,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 290) | NCM: 85014011 | Preço Unit.: R$ 1.580,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.580,00',
        ativo = true
    WHERE codigo = 'PEC-0290' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA 3/4 CV G7');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0290', 'MOTOBOMBA 3/4 CV G7', 'Peças', 'produto', 'UN', '85014011',
      1580, 1580, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 290) | NCM: 85014011 | Preço Unit.: R$ 1.580,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.580,00', v_fornecedor_id
    );
  END IF;

  -- Linha 291: PEC-0291 - MOTOBOMBA AX.THERMAS DRY PUMP
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0291' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA AX.THERMAS DRY PUMP')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0291'),
        nome = 'MOTOBOMBA AX.THERMAS DRY PUMP',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014011',
        preco_custo = 1390,
        preco_venda = 1390,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 291) | NCM: 85014011 | Preço Unit.: R$ 1.390,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.390,00',
        ativo = true
    WHERE codigo = 'PEC-0291' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA AX.THERMAS DRY PUMP');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0291', 'MOTOBOMBA AX.THERMAS DRY PUMP', 'Peças', 'produto', 'UN', '85014011',
      1390, 1390, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 291) | NCM: 85014011 | Preço Unit.: R$ 1.390,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.390,00', v_fornecedor_id
    );
  END IF;

  -- Linha 292: PEC-0292 - MOTOBOMBA AX.THERMAS G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0292' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA AX.THERMAS G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0292'),
        nome = 'MOTOBOMBA AX.THERMAS G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014011',
        preco_custo = 1020,
        preco_venda = 1020,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 292) | NCM: 85014011 | Preço Unit.: R$ 1.020,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.020,00',
        ativo = true
    WHERE codigo = 'PEC-0292' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA AX.THERMAS G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0292', 'MOTOBOMBA AX.THERMAS G4', 'Peças', 'produto', 'UN', '85014011',
      1020, 1020, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 292) | NCM: 85014011 | Preço Unit.: R$ 1.020,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.020,00', v_fornecedor_id
    );
  END IF;

  -- Linha 293: PEC-0293 - MOTOBOMBA AX.THERMAS G5
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0293' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA AX.THERMAS G5')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0293'),
        nome = 'MOTOBOMBA AX.THERMAS G5',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014011',
        preco_custo = 1390,
        preco_venda = 1390,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 293) | NCM: 85014011 | Preço Unit.: R$ 1.390,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.390,00',
        ativo = true
    WHERE codigo = 'PEC-0293' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA AX.THERMAS G5');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0293', 'MOTOBOMBA AX.THERMAS G5', 'Peças', 'produto', 'UN', '85014011',
      1390, 1390, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 293) | NCM: 85014011 | Preço Unit.: R$ 1.390,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.390,00', v_fornecedor_id
    );
  END IF;

  -- Linha 294: PEC-0294 - MOTOBOMBA AX.THERMAS G6
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0294' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA AX.THERMAS G6')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0294'),
        nome = 'MOTOBOMBA AX.THERMAS G6',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014011',
        preco_custo = 1390,
        preco_venda = 1390,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 294) | NCM: 85014011 | Preço Unit.: R$ 1.390,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.390,00',
        ativo = true
    WHERE codigo = 'PEC-0294' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA AX.THERMAS G6');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0294', 'MOTOBOMBA AX.THERMAS G6', 'Peças', 'produto', 'UN', '85014011',
      1390, 1390, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 294) | NCM: 85014011 | Preço Unit.: R$ 1.390,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.390,00', v_fornecedor_id
    );
  END IF;

  -- Linha 295: PEC-0295 - MOTOBOMBA AX.THERMAS G6 3/4 CV
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0295' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA AX.THERMAS G6 3/4 CV')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0295'),
        nome = 'MOTOBOMBA AX.THERMAS G6 3/4 CV',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014011',
        preco_custo = 1670,
        preco_venda = 1670,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 295) | NCM: 85014011 | Preço Unit.: R$ 1.670,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.670,00',
        ativo = true
    WHERE codigo = 'PEC-0295' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA AX.THERMAS G6 3/4 CV');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0295', 'MOTOBOMBA AX.THERMAS G6 3/4 CV', 'Peças', 'produto', 'UN', '85014011',
      1670, 1670, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 295) | NCM: 85014011 | Preço Unit.: R$ 1.670,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.670,00', v_fornecedor_id
    );
  END IF;

  -- Linha 296: PEC-0296 - MOTOBOMBA AX.THERMAS G7
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0296' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA AX.THERMAS G7')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0296'),
        nome = 'MOTOBOMBA AX.THERMAS G7',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014011',
        preco_custo = 1390,
        preco_venda = 1390,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 296) | NCM: 85014011 | Preço Unit.: R$ 1.390,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.390,00',
        ativo = true
    WHERE codigo = 'PEC-0296' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA AX.THERMAS G7');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0296', 'MOTOBOMBA AX.THERMAS G7', 'Peças', 'produto', 'UN', '85014011',
      1390, 1390, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 296) | NCM: 85014011 | Preço Unit.: R$ 1.390,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.390,00', v_fornecedor_id
    );
  END IF;

  -- Linha 297: PEC-0297 - MOTOBOMBA AX.THERMAS G7 3/4 CV
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0297' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA AX.THERMAS G7 3/4 CV')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0297'),
        nome = 'MOTOBOMBA AX.THERMAS G7 3/4 CV',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014011',
        preco_custo = 1670,
        preco_venda = 1670,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 297) | NCM: 85014011 | Preço Unit.: R$ 1.670,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.670,00',
        ativo = true
    WHERE codigo = 'PEC-0297' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA AX.THERMAS G7 3/4 CV');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0297', 'MOTOBOMBA AX.THERMAS G7 3/4 CV', 'Peças', 'produto', 'UN', '85014011',
      1670, 1670, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 297) | NCM: 85014011 | Preço Unit.: R$ 1.670,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.670,00', v_fornecedor_id
    );
  END IF;

  -- Linha 298: PEC-0298 - MOTOBOMBA DE AR SPA LUXO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0298' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA DE AR SPA LUXO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0298'),
        nome = 'MOTOBOMBA DE AR SPA LUXO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84148090',
        preco_custo = 6150,
        preco_venda = 6150,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 298) | NCM: 84148090 | Preço Unit.: R$ 6.150,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 6.150,00',
        ativo = true
    WHERE codigo = 'PEC-0298' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA DE AR SPA LUXO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0298', 'MOTOBOMBA DE AR SPA LUXO', 'Peças', 'produto', 'UN', '84148090',
      6150, 6150, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 298) | NCM: 84148090 | Preço Unit.: R$ 6.150,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 6.150,00', v_fornecedor_id
    );
  END IF;

  -- Linha 299: PEC-0299 - MOTOBOMBA DE FILTRAGEM SPA LUXO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0299' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA DE FILTRAGEM SPA LUXO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0299'),
        nome = 'MOTOBOMBA DE FILTRAGEM SPA LUXO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84137090',
        preco_custo = 6150,
        preco_venda = 6150,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 299) | NCM: 84137090 | Preço Unit.: R$ 6.150,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 6.150,00',
        ativo = true
    WHERE codigo = 'PEC-0299' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA DE FILTRAGEM SPA LUXO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0299', 'MOTOBOMBA DE FILTRAGEM SPA LUXO', 'Peças', 'produto', 'UN', '84137090',
      6150, 6150, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 299) | NCM: 84137090 | Preço Unit.: R$ 6.150,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 6.150,00', v_fornecedor_id
    );
  END IF;

  -- Linha 300: PEC-0300 - MOTOBOMBA DE MASSAGEM 2CV SPA LUXO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0300' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA DE MASSAGEM 2CV SPA LUXO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0300'),
        nome = 'MOTOBOMBA DE MASSAGEM 2CV SPA LUXO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84137090',
        preco_custo = 7100,
        preco_venda = 7100,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 300) | NCM: 84137090 | Preço Unit.: R$ 7.100,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 7.100,00',
        ativo = true
    WHERE codigo = 'PEC-0300' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA DE MASSAGEM 2CV SPA LUXO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0300', 'MOTOBOMBA DE MASSAGEM 2CV SPA LUXO', 'Peças', 'produto', 'UN', '84137090',
      7100, 7100, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 300) | NCM: 84137090 | Preço Unit.: R$ 7.100,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 7.100,00', v_fornecedor_id
    );
  END IF;

  -- Linha 301: PEC-0301 - MOTOBOMBA DE MASSAGEM SPA DUO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0301' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA DE MASSAGEM SPA DUO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0301'),
        nome = 'MOTOBOMBA DE MASSAGEM SPA DUO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84137090',
        preco_custo = 2000,
        preco_venda = 2000,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 301) | NCM: 84137090 | Preço Unit.: R$ 2.000,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2.000,00',
        ativo = true
    WHERE codigo = 'PEC-0301' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA DE MASSAGEM SPA DUO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0301', 'MOTOBOMBA DE MASSAGEM SPA DUO', 'Peças', 'produto', 'UN', '84137090',
      2000, 2000, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 301) | NCM: 84137090 | Preço Unit.: R$ 2.000,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2.000,00', v_fornecedor_id
    );
  END IF;

  -- Linha 302: PEC-0302 - MOTOBOMBA SPLASH C/ GALHADA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0302' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA SPLASH C/ GALHADA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0302'),
        nome = 'MOTOBOMBA SPLASH C/ GALHADA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014011',
        preco_custo = 1060,
        preco_venda = 1060,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 302) | NCM: 85014011 | Preço Unit.: R$ 1.060,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.060,00',
        ativo = true
    WHERE codigo = 'PEC-0302' OR UPPER(TRIM(nome)) = UPPER('MOTOBOMBA SPLASH C/ GALHADA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0302', 'MOTOBOMBA SPLASH C/ GALHADA', 'Peças', 'produto', 'UN', '85014011',
      1060, 1060, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 302) | NCM: 85014011 | Preço Unit.: R$ 1.060,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.060,00', v_fornecedor_id
    );
  END IF;

  -- Linha 303: PEC-0303 - MOTOR 1/2
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0303' OR UPPER(TRIM(nome)) = UPPER('MOTOR 1/2')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0303'),
        nome = 'MOTOR 1/2',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014019',
        preco_custo = 870,
        preco_venda = 870,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 303) | NCM: 85014019 | Preço Unit.: R$ 870,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 870,00',
        ativo = true
    WHERE codigo = 'PEC-0303' OR UPPER(TRIM(nome)) = UPPER('MOTOR 1/2');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0303', 'MOTOR 1/2', 'Peças', 'produto', 'UN', '85014019',
      870, 870, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 303) | NCM: 85014019 | Preço Unit.: R$ 870,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 870,00', v_fornecedor_id
    );
  END IF;

  -- Linha 304: PEC-0304 - MOTOR 1/2 CV INOX
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0304' OR UPPER(TRIM(nome)) = UPPER('MOTOR 1/2 CV INOX')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0304'),
        nome = 'MOTOR 1/2 CV INOX',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014019',
        preco_custo = 1060,
        preco_venda = 1060,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 304) | NCM: 85014019 | Preço Unit.: R$ 1.060,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.060,00',
        ativo = true
    WHERE codigo = 'PEC-0304' OR UPPER(TRIM(nome)) = UPPER('MOTOR 1/2 CV INOX');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0304', 'MOTOR 1/2 CV INOX', 'Peças', 'produto', 'UN', '85014019',
      1060, 1060, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 304) | NCM: 85014019 | Preço Unit.: R$ 1.060,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.060,00', v_fornecedor_id
    );
  END IF;

  -- Linha 305: PEC-0305 - MOTOR 3/4 CV
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0305' OR UPPER(TRIM(nome)) = UPPER('MOTOR 3/4 CV')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0305'),
        nome = 'MOTOR 3/4 CV',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014019',
        preco_custo = 1140,
        preco_venda = 1140,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 305) | NCM: 85014019 | Preço Unit.: R$ 1.140,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.140,00',
        ativo = true
    WHERE codigo = 'PEC-0305' OR UPPER(TRIM(nome)) = UPPER('MOTOR 3/4 CV');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0305', 'MOTOR 3/4 CV', 'Peças', 'produto', 'UN', '85014019',
      1140, 1140, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 305) | NCM: 85014019 | Preço Unit.: R$ 1.140,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.140,00', v_fornecedor_id
    );
  END IF;

  -- Linha 306: PEC-0306 - MOTOR DA VENTOINHA P/ BOMBA DE AQUEC. WBR 7.8/12.5
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0306' OR UPPER(TRIM(nome)) = UPPER('MOTOR DA VENTOINHA P/ BOMBA DE AQUEC. WBR 7.8/12.5')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0306'),
        nome = 'MOTOR DA VENTOINHA P/ BOMBA DE AQUEC. WBR 7.8/12.5',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85011029',
        preco_custo = 1250,
        preco_venda = 1250,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 306) | NCM: 85011029 | Preço Unit.: R$ 1.250,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.250,00',
        ativo = true
    WHERE codigo = 'PEC-0306' OR UPPER(TRIM(nome)) = UPPER('MOTOR DA VENTOINHA P/ BOMBA DE AQUEC. WBR 7.8/12.5');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0306', 'MOTOR DA VENTOINHA P/ BOMBA DE AQUEC. WBR 7.8/12.5', 'Peças', 'produto', 'UN', '85011029',
      1250, 1250, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 306) | NCM: 85011029 | Preço Unit.: R$ 1.250,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.250,00', v_fornecedor_id
    );
  END IF;

  -- Linha 307: PEC-0307 - MOTOR DA VENTOINHA P/BOMBA DE AQUEC. WBR4.5H-A3
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0307' OR UPPER(TRIM(nome)) = UPPER('MOTOR DA VENTOINHA P/BOMBA DE AQUEC. WBR4.5H-A3')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0307'),
        nome = 'MOTOR DA VENTOINHA P/BOMBA DE AQUEC. WBR4.5H-A3',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85011029',
        preco_custo = 1200,
        preco_venda = 1200,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 307) | NCM: 85011029 | Preço Unit.: R$ 1.200,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.200,00',
        ativo = true
    WHERE codigo = 'PEC-0307' OR UPPER(TRIM(nome)) = UPPER('MOTOR DA VENTOINHA P/BOMBA DE AQUEC. WBR4.5H-A3');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0307', 'MOTOR DA VENTOINHA P/BOMBA DE AQUEC. WBR4.5H-A3', 'Peças', 'produto', 'UN', '85011029',
      1200, 1200, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 307) | NCM: 85011029 | Preço Unit.: R$ 1.200,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.200,00', v_fornecedor_id
    );
  END IF;

  -- Linha 308: PEC-0308 - MOTOR DO REGISTRO ELETRONIC
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0308' OR UPPER(TRIM(nome)) = UPPER('MOTOR DO REGISTRO ELETRONIC')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0308'),
        nome = 'MOTOR DO REGISTRO ELETRONIC',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85011019',
        preco_custo = 150,
        preco_venda = 150,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 308) | NCM: 85011019 | Preço Unit.: R$ 150,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 150,00',
        ativo = true
    WHERE codigo = 'PEC-0308' OR UPPER(TRIM(nome)) = UPPER('MOTOR DO REGISTRO ELETRONIC');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0308', 'MOTOR DO REGISTRO ELETRONIC', 'Peças', 'produto', 'UN', '85011019',
      150, 150, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 308) | NCM: 85011019 | Preço Unit.: R$ 150,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 150,00', v_fornecedor_id
    );
  END IF;

  -- Linha 309: PEC-0309 - MOTOR WEG 2 CV
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0309' OR UPPER(TRIM(nome)) = UPPER('MOTOR WEG 2 CV')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0309'),
        nome = 'MOTOR WEG 2 CV',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85014019',
        preco_custo = 2000,
        preco_venda = 2000,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 309) | NCM: 85014019 | Preço Unit.: R$ 2.000,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2.000,00',
        ativo = true
    WHERE codigo = 'PEC-0309' OR UPPER(TRIM(nome)) = UPPER('MOTOR WEG 2 CV');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0309', 'MOTOR WEG 2 CV', 'Peças', 'produto', 'UN', '85014019',
      2000, 2000, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 309) | NCM: 85014019 | Preço Unit.: R$ 2.000,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2.000,00', v_fornecedor_id
    );
  END IF;

  -- Linha 310: PEC-0310 - NIPPLE (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0310' OR UPPER(TRIM(nome)) = UPPER('NIPPLE (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0310'),
        nome = 'NIPPLE (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 25,
        preco_venda = 28.24,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 310) | NCM: 39174090 | Preço Unit.: R$ 25,00 | Valor ST: R$ 3,24 | Preço c/ ST: R$ 28,24',
        ativo = true
    WHERE codigo = 'PEC-0310' OR UPPER(TRIM(nome)) = UPPER('NIPPLE (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0310', 'NIPPLE (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39174090',
      25, 28.24, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 310) | NCM: 39174090 | Preço Unit.: R$ 25,00 | Valor ST: R$ 3,24 | Preço c/ ST: R$ 28,24', v_fornecedor_id
    );
  END IF;

  -- Linha 311: PEC-0311 - ORING BOMBA ESCORVANTE (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0311' OR UPPER(TRIM(nome)) = UPPER('ORING BOMBA ESCORVANTE (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0311'),
        nome = 'ORING BOMBA ESCORVANTE (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '40169300',
        preco_custo = 55,
        preco_venda = 55,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 311) | NCM: 40169300 | Preço Unit.: R$ 55,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 55,00',
        ativo = true
    WHERE codigo = 'PEC-0311' OR UPPER(TRIM(nome)) = UPPER('ORING BOMBA ESCORVANTE (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0311', 'ORING BOMBA ESCORVANTE (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '40169300',
      55, 55, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 311) | NCM: 40169300 | Preço Unit.: R$ 55,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 55,00', v_fornecedor_id
    );
  END IF;

  -- Linha 312: PEC-0312 - ORING BOMBA/BRAQUETE (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0312' OR UPPER(TRIM(nome)) = UPPER('ORING BOMBA/BRAQUETE (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0312'),
        nome = 'ORING BOMBA/BRAQUETE (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '40169300',
        preco_custo = 55,
        preco_venda = 55,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 312) | NCM: 40169300 | Preço Unit.: R$ 55,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 55,00',
        ativo = true
    WHERE codigo = 'PEC-0312' OR UPPER(TRIM(nome)) = UPPER('ORING BOMBA/BRAQUETE (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0312', 'ORING BOMBA/BRAQUETE (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '40169300',
      55, 55, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 312) | NCM: 40169300 | Preço Unit.: R$ 55,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 55,00', v_fornecedor_id
    );
  END IF;

  -- Linha 313: PEC-0313 - ORING DA UNIAO (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0313' OR UPPER(TRIM(nome)) = UPPER('ORING DA UNIAO (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0313'),
        nome = 'ORING DA UNIAO (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '40169300',
        preco_custo = 25,
        preco_venda = 25,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 313) | NCM: 40169300 | Preço Unit.: R$ 25,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 25,00',
        ativo = true
    WHERE codigo = 'PEC-0313' OR UPPER(TRIM(nome)) = UPPER('ORING DA UNIAO (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0313', 'ORING DA UNIAO (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '40169300',
      25, 25, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 313) | NCM: 40169300 | Preço Unit.: R$ 25,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 25,00', v_fornecedor_id
    );
  END IF;

  -- Linha 314: PEC-0314 - ORING DO Q.C. MAX
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0314' OR UPPER(TRIM(nome)) = UPPER('ORING DO Q.C. MAX')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0314'),
        nome = 'ORING DO Q.C. MAX',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '40169300',
        preco_custo = 5,
        preco_venda = 5,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 314) | NCM: 40169300 | Preço Unit.: R$ 5,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 5,00',
        ativo = true
    WHERE codigo = 'PEC-0314' OR UPPER(TRIM(nome)) = UPPER('ORING DO Q.C. MAX');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0314', 'ORING DO Q.C. MAX', 'Peças', 'produto', 'UN', '40169300',
      5, 5, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 314) | NCM: 40169300 | Preço Unit.: R$ 5,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 5,00', v_fornecedor_id
    );
  END IF;

  -- Linha 315: PEC-0315 - ORING DRENO DE NIVEL CX C/10
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0315' OR UPPER(TRIM(nome)) = UPPER('ORING DRENO DE NIVEL CX C/10')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0315'),
        nome = 'ORING DRENO DE NIVEL CX C/10',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '40169300',
        preco_custo = 20,
        preco_venda = 20,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 315) | NCM: 40169300 | Preço Unit.: R$ 20,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 20,00',
        ativo = true
    WHERE codigo = 'PEC-0315' OR UPPER(TRIM(nome)) = UPPER('ORING DRENO DE NIVEL CX C/10');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0315', 'ORING DRENO DE NIVEL CX C/10', 'Peças', 'produto', 'UN', '40169300',
      20, 20, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 315) | NCM: 40169300 | Preço Unit.: R$ 20,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 20,00', v_fornecedor_id
    );
  END IF;

  -- Linha 316: PEC-0316 - PAINEL CONTROLE DUO SPA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0316' OR UPPER(TRIM(nome)) = UPPER('PAINEL CONTROLE DUO SPA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0316'),
        nome = 'PAINEL CONTROLE DUO SPA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 900,
        preco_venda = 900,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 316) | NCM: 84189900 | Preço Unit.: R$ 900,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 900,00',
        ativo = true
    WHERE codigo = 'PEC-0316' OR UPPER(TRIM(nome)) = UPPER('PAINEL CONTROLE DUO SPA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0316', 'PAINEL CONTROLE DUO SPA', 'Peças', 'produto', 'UN', '84189900',
      900, 900, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 316) | NCM: 84189900 | Preço Unit.: R$ 900,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 900,00', v_fornecedor_id
    );
  END IF;

  -- Linha 317: PEC-0317 - PAINEL CONTROLE SPA LUXO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0317' OR UPPER(TRIM(nome)) = UPPER('PAINEL CONTROLE SPA LUXO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0317'),
        nome = 'PAINEL CONTROLE SPA LUXO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 2000,
        preco_venda = 2000,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 317) | NCM: 84189900 | Preço Unit.: R$ 2.000,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2.000,00',
        ativo = true
    WHERE codigo = 'PEC-0317' OR UPPER(TRIM(nome)) = UPPER('PAINEL CONTROLE SPA LUXO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0317', 'PAINEL CONTROLE SPA LUXO', 'Peças', 'produto', 'UN', '84189900',
      2000, 2000, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 317) | NCM: 84189900 | Preço Unit.: R$ 2.000,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2.000,00', v_fornecedor_id
    );
  END IF;

  -- Linha 318: PEC-0318 - PAINEL DE CONTROLE - SAUNA CLUB
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0318' OR UPPER(TRIM(nome)) = UPPER('PAINEL DE CONTROLE - SAUNA CLUB')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0318'),
        nome = 'PAINEL DE CONTROLE - SAUNA CLUB',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '90328990',
        preco_custo = 630,
        preco_venda = 630,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 318) | NCM: 90328990 | Preço Unit.: R$ 630,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 630,00',
        ativo = true
    WHERE codigo = 'PEC-0318' OR UPPER(TRIM(nome)) = UPPER('PAINEL DE CONTROLE - SAUNA CLUB');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0318', 'PAINEL DE CONTROLE - SAUNA CLUB', 'Peças', 'produto', 'UN', '90328990',
      630, 630, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 318) | NCM: 90328990 | Preço Unit.: R$ 630,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 630,00', v_fornecedor_id
    );
  END IF;

  -- Linha 319: PEC-0319 - PAINEL DE CONTROLE DO THERMAS KELVIN
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0319' OR UPPER(TRIM(nome)) = UPPER('PAINEL DE CONTROLE DO THERMAS KELVIN')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0319'),
        nome = 'PAINEL DE CONTROLE DO THERMAS KELVIN',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '90328990',
        preco_custo = 950,
        preco_venda = 950,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 319) | NCM: 90328990 | Preço Unit.: R$ 950,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 950,00',
        ativo = true
    WHERE codigo = 'PEC-0319' OR UPPER(TRIM(nome)) = UPPER('PAINEL DE CONTROLE DO THERMAS KELVIN');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0319', 'PAINEL DE CONTROLE DO THERMAS KELVIN', 'Peças', 'produto', 'UN', '90328990',
      950, 950, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 319) | NCM: 90328990 | Preço Unit.: R$ 950,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 950,00', v_fornecedor_id
    );
  END IF;

  -- Linha 320: PEC-0320 - PAINEL DE CONTROLE DO THERMAS MINI
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0320' OR UPPER(TRIM(nome)) = UPPER('PAINEL DE CONTROLE DO THERMAS MINI')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0320'),
        nome = 'PAINEL DE CONTROLE DO THERMAS MINI',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '90328990',
        preco_custo = 500,
        preco_venda = 500,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 320) | NCM: 90328990 | Preço Unit.: R$ 500,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 500,00',
        ativo = true
    WHERE codigo = 'PEC-0320' OR UPPER(TRIM(nome)) = UPPER('PAINEL DE CONTROLE DO THERMAS MINI');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0320', 'PAINEL DE CONTROLE DO THERMAS MINI', 'Peças', 'produto', 'UN', '90328990',
      500, 500, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 320) | NCM: 90328990 | Preço Unit.: R$ 500,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 500,00', v_fornecedor_id
    );
  END IF;

  -- Linha 321: PEC-0321 - PARAFUSO 1/4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0321' OR UPPER(TRIM(nome)) = UPPER('PARAFUSO 1/4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0321'),
        nome = 'PARAFUSO 1/4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '73181400',
        preco_custo = 1,
        preco_venda = 1,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 321) | NCM: 73181400 | Preço Unit.: R$ 1,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1,00',
        ativo = true
    WHERE codigo = 'PEC-0321' OR UPPER(TRIM(nome)) = UPPER('PARAFUSO 1/4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0321', 'PARAFUSO 1/4', 'Peças', 'produto', 'UN', '73181400',
      1, 1, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 321) | NCM: 73181400 | Preço Unit.: R$ 1,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1,00', v_fornecedor_id
    );
  END IF;

  -- Linha 322: PEC-0322 - PARAFUSO 3.0 X 10 PHILIPS AUTOTARRACHANTE
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0322' OR UPPER(TRIM(nome)) = UPPER('PARAFUSO 3.0 X 10 PHILIPS AUTOTARRACHANTE')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0322'),
        nome = 'PARAFUSO 3.0 X 10 PHILIPS AUTOTARRACHANTE',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '73181400',
        preco_custo = 0.1,
        preco_venda = 0.1,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 322) | NCM: 73181400 | Preço Unit.: R$ 0,10 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 0,10',
        ativo = true
    WHERE codigo = 'PEC-0322' OR UPPER(TRIM(nome)) = UPPER('PARAFUSO 3.0 X 10 PHILIPS AUTOTARRACHANTE');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0322', 'PARAFUSO 3.0 X 10 PHILIPS AUTOTARRACHANTE', 'Peças', 'produto', 'UN', '73181400',
      0.1, 0.1, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 322) | NCM: 73181400 | Preço Unit.: R$ 0,10 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 0,10', v_fornecedor_id
    );
  END IF;

  -- Linha 323: PEC-0323 - PARAFUSO 3.0 X 13 AUTO ATARRACHANTE
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0323' OR UPPER(TRIM(nome)) = UPPER('PARAFUSO 3.0 X 13 AUTO ATARRACHANTE')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0323'),
        nome = 'PARAFUSO 3.0 X 13 AUTO ATARRACHANTE',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '73181400',
        preco_custo = 1.2,
        preco_venda = 1.2,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 323) | NCM: 73181400 | Preço Unit.: R$ 1,20 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1,20',
        ativo = true
    WHERE codigo = 'PEC-0323' OR UPPER(TRIM(nome)) = UPPER('PARAFUSO 3.0 X 13 AUTO ATARRACHANTE');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0323', 'PARAFUSO 3.0 X 13 AUTO ATARRACHANTE', 'Peças', 'produto', 'UN', '73181400',
      1.2, 1.2, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 323) | NCM: 73181400 | Preço Unit.: R$ 1,20 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1,20', v_fornecedor_id
    );
  END IF;

  -- Linha 324: PEC-0324 - PARAFUSO 3/8
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0324' OR UPPER(TRIM(nome)) = UPPER('PARAFUSO 3/8')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0324'),
        nome = 'PARAFUSO 3/8',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '73181500',
        preco_custo = 2,
        preco_venda = 2,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 324) | NCM: 73181500 | Preço Unit.: R$ 2,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2,00',
        ativo = true
    WHERE codigo = 'PEC-0324' OR UPPER(TRIM(nome)) = UPPER('PARAFUSO 3/8');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0324', 'PARAFUSO 3/8', 'Peças', 'produto', 'UN', '73181500',
      2, 2, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 324) | NCM: 73181500 | Preço Unit.: R$ 2,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2,00', v_fornecedor_id
    );
  END IF;

  -- Linha 325: PEC-0325 - PARAFUSO DA UNIAO 40MM (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0325' OR UPPER(TRIM(nome)) = UPPER('PARAFUSO DA UNIAO 40MM (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0325'),
        nome = 'PARAFUSO DA UNIAO 40MM (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 45,
        preco_venda = 50.83,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 325) | NCM: 39174090 | Preço Unit.: R$ 45,00 | Valor ST: R$ 5,83 | Preço c/ ST: R$ 50,83',
        ativo = true
    WHERE codigo = 'PEC-0325' OR UPPER(TRIM(nome)) = UPPER('PARAFUSO DA UNIAO 40MM (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0325', 'PARAFUSO DA UNIAO 40MM (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      45, 50.83, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 325) | NCM: 39174090 | Preço Unit.: R$ 45,00 | Valor ST: R$ 5,83 | Preço c/ ST: R$ 50,83', v_fornecedor_id
    );
  END IF;

  -- Linha 326: PEC-0326 - PARAFUSO DA UNIAO 50MM (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0326' OR UPPER(TRIM(nome)) = UPPER('PARAFUSO DA UNIAO 50MM (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0326'),
        nome = 'PARAFUSO DA UNIAO 50MM (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 45,
        preco_venda = 50.83,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 326) | NCM: 39174090 | Preço Unit.: R$ 45,00 | Valor ST: R$ 5,83 | Preço c/ ST: R$ 50,83',
        ativo = true
    WHERE codigo = 'PEC-0326' OR UPPER(TRIM(nome)) = UPPER('PARAFUSO DA UNIAO 50MM (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0326', 'PARAFUSO DA UNIAO 50MM (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      45, 50.83, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 326) | NCM: 39174090 | Preço Unit.: R$ 45,00 | Valor ST: R$ 5,83 | Preço c/ ST: R$ 50,83', v_fornecedor_id
    );
  END IF;

  -- Linha 327: PEC-0327 - PARAFUSO DE POLIACETAL
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0327' OR UPPER(TRIM(nome)) = UPPER('PARAFUSO DE POLIACETAL')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0327'),
        nome = 'PARAFUSO DE POLIACETAL',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 1,
        preco_venda = 1.13,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 327) | NCM: 39174090 | Preço Unit.: R$ 1,00 | Valor ST: R$ 0,13 | Preço c/ ST: R$ 1,13',
        ativo = true
    WHERE codigo = 'PEC-0327' OR UPPER(TRIM(nome)) = UPPER('PARAFUSO DE POLIACETAL');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0327', 'PARAFUSO DE POLIACETAL', 'Peças', 'produto', 'UN', '39174090',
      1, 1.13, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 327) | NCM: 39174090 | Preço Unit.: R$ 1,00 | Valor ST: R$ 0,13 | Preço c/ ST: R$ 1,13', v_fornecedor_id
    );
  END IF;

  -- Linha 328: PEC-0328 - PARAFUSO DO Q.C
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0328' OR UPPER(TRIM(nome)) = UPPER('PARAFUSO DO Q.C')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0328'),
        nome = 'PARAFUSO DO Q.C',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 5,
        preco_venda = 5.65,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 328) | NCM: 39174090 | Preço Unit.: R$ 5,00 | Valor ST: R$ 0,65 | Preço c/ ST: R$ 5,65',
        ativo = true
    WHERE codigo = 'PEC-0328' OR UPPER(TRIM(nome)) = UPPER('PARAFUSO DO Q.C');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0328', 'PARAFUSO DO Q.C', 'Peças', 'produto', 'UN', '39174090',
      5, 5.65, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 328) | NCM: 39174090 | Preço Unit.: R$ 5,00 | Valor ST: R$ 0,65 | Preço c/ ST: R$ 5,65', v_fornecedor_id
    );
  END IF;

  -- Linha 329: PEC-0329 - PARAFUSO E BUCHA 8MM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0329' OR UPPER(TRIM(nome)) = UPPER('PARAFUSO E BUCHA 8MM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0329'),
        nome = 'PARAFUSO E BUCHA 8MM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '73181500',
        preco_custo = 3,
        preco_venda = 3,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 329) | NCM: 73181500 | Preço Unit.: R$ 3,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 3,00',
        ativo = true
    WHERE codigo = 'PEC-0329' OR UPPER(TRIM(nome)) = UPPER('PARAFUSO E BUCHA 8MM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0329', 'PARAFUSO E BUCHA 8MM', 'Peças', 'produto', 'UN', '73181500',
      3, 3, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 329) | NCM: 73181500 | Preço Unit.: R$ 3,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 3,00', v_fornecedor_id
    );
  END IF;

  -- Linha 330: PEC-0330 - PARAFUSO TO KEEP 4.8X50 CH
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0330' OR UPPER(TRIM(nome)) = UPPER('PARAFUSO TO KEEP 4.8X50 CH')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0330'),
        nome = 'PARAFUSO TO KEEP 4.8X50 CH',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '73181500',
        preco_custo = 0.5,
        preco_venda = 0.5,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 330) | NCM: 73181500 | Preço Unit.: R$ 0,50 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 0,50',
        ativo = true
    WHERE codigo = 'PEC-0330' OR UPPER(TRIM(nome)) = UPPER('PARAFUSO TO KEEP 4.8X50 CH');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0330', 'PARAFUSO TO KEEP 4.8X50 CH', 'Peças', 'produto', 'UN', '73181500',
      0.5, 0.5, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 330) | NCM: 73181500 | Preço Unit.: R$ 0,50 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 0,50', v_fornecedor_id
    );
  END IF;

  -- Linha 331: PEC-0331 - PARAFUSO UNIÃO BLOCO G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0331' OR UPPER(TRIM(nome)) = UPPER('PARAFUSO UNIÃO BLOCO G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0331'),
        nome = 'PARAFUSO UNIÃO BLOCO G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '73181400',
        preco_custo = 6,
        preco_venda = 6,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 331) | NCM: 73181400 | Preço Unit.: R$ 6,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 6,00',
        ativo = true
    WHERE codigo = 'PEC-0331' OR UPPER(TRIM(nome)) = UPPER('PARAFUSO UNIÃO BLOCO G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0331', 'PARAFUSO UNIÃO BLOCO G4', 'Peças', 'produto', 'UN', '73181400',
      6, 6, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 331) | NCM: 73181400 | Preço Unit.: R$ 6,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 6,00', v_fornecedor_id
    );
  END IF;

  -- Linha 332: PEC-0332 - PARTE DE TRAS BOMBA (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0332' OR UPPER(TRIM(nome)) = UPPER('PARTE DE TRAS BOMBA (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0332'),
        nome = 'PARTE DE TRAS BOMBA (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84139200',
        preco_custo = 150,
        preco_venda = 150,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 332) | NCM: 84139200 | Preço Unit.: R$ 150,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 150,00',
        ativo = true
    WHERE codigo = 'PEC-0332' OR UPPER(TRIM(nome)) = UPPER('PARTE DE TRAS BOMBA (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0332', 'PARTE DE TRAS BOMBA (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '84139200',
      150, 150, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 332) | NCM: 84139200 | Preço Unit.: R$ 150,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 150,00', v_fornecedor_id
    );
  END IF;

  -- Linha 333: PEC-0333 - PERFIL COBERTURA LEVITA M2
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0333' OR UPPER(TRIM(nome)) = UPPER('PERFIL COBERTURA LEVITA M2')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0333'),
        nome = 'PERFIL COBERTURA LEVITA M2',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39201099',
        preco_custo = 200,
        preco_venda = 200,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 333) | NCM: 39201099 | Preço Unit.: R$ 200,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 200,00',
        ativo = true
    WHERE codigo = 'PEC-0333' OR UPPER(TRIM(nome)) = UPPER('PERFIL COBERTURA LEVITA M2');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0333', 'PERFIL COBERTURA LEVITA M2', 'Peças', 'produto', 'UN', '39201099',
      200, 200, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 333) | NCM: 39201099 | Preço Unit.: R$ 200,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 200,00', v_fornecedor_id
    );
  END IF;

  -- Linha 334: PEC-0334 - PLACA AQUECEDOR THERMAS KELVIN
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0334' OR UPPER(TRIM(nome)) = UPPER('PLACA AQUECEDOR THERMAS KELVIN')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0334'),
        nome = 'PLACA AQUECEDOR THERMAS KELVIN',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '94054900',
        preco_custo = 770,
        preco_venda = 770,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 334) | NCM: 94054900 | Preço Unit.: R$ 770,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 770,00',
        ativo = true
    WHERE codigo = 'PEC-0334' OR UPPER(TRIM(nome)) = UPPER('PLACA AQUECEDOR THERMAS KELVIN');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0334', 'PLACA AQUECEDOR THERMAS KELVIN', 'Peças', 'produto', 'UN', '94054900',
      770, 770, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 334) | NCM: 94054900 | Preço Unit.: R$ 770,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 770,00', v_fornecedor_id
    );
  END IF;

  -- Linha 335: PEC-0335 - PLACA CIRCUITO IGUILUX COLOR
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0335' OR UPPER(TRIM(nome)) = UPPER('PLACA CIRCUITO IGUILUX COLOR')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0335'),
        nome = 'PLACA CIRCUITO IGUILUX COLOR',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '94054200',
        preco_custo = 330,
        preco_venda = 330,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 335) | NCM: 94054200 | Preço Unit.: R$ 330,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 330,00',
        ativo = true
    WHERE codigo = 'PEC-0335' OR UPPER(TRIM(nome)) = UPPER('PLACA CIRCUITO IGUILUX COLOR');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0335', 'PLACA CIRCUITO IGUILUX COLOR', 'Peças', 'produto', 'UN', '94054200',
      330, 330, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 335) | NCM: 94054200 | Preço Unit.: R$ 330,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 330,00', v_fornecedor_id
    );
  END IF;

  -- Linha 336: PEC-0336 - PLACA CPU ELECTRONIC G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0336' OR UPPER(TRIM(nome)) = UPPER('PLACA CPU ELECTRONIC G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0336'),
        nome = 'PLACA CPU ELECTRONIC G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85389010',
        preco_custo = 1600,
        preco_venda = 1808.25,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 336) | NCM: 85389010 | Preço Unit.: R$ 1.600,00 | Valor ST: R$ 208,25 | Preço c/ ST: R$ 1.808,25',
        ativo = true
    WHERE codigo = 'PEC-0336' OR UPPER(TRIM(nome)) = UPPER('PLACA CPU ELECTRONIC G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0336', 'PLACA CPU ELECTRONIC G4', 'Peças', 'produto', 'UN', '85389010',
      1600, 1808.25, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 336) | NCM: 85389010 | Preço Unit.: R$ 1.600,00 | Valor ST: R$ 208,25 | Preço c/ ST: R$ 1.808,25', v_fornecedor_id
    );
  END IF;

  -- Linha 337: PEC-0337 - PLACA CPU ELECTRONIC G6
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0337' OR UPPER(TRIM(nome)) = UPPER('PLACA CPU ELECTRONIC G6')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0337'),
        nome = 'PLACA CPU ELECTRONIC G6',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85389010',
        preco_custo = 1600,
        preco_venda = 1808.25,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 337) | NCM: 85389010 | Preço Unit.: R$ 1.600,00 | Valor ST: R$ 208,25 | Preço c/ ST: R$ 1.808,25',
        ativo = true
    WHERE codigo = 'PEC-0337' OR UPPER(TRIM(nome)) = UPPER('PLACA CPU ELECTRONIC G6');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0337', 'PLACA CPU ELECTRONIC G6', 'Peças', 'produto', 'UN', '85389010',
      1600, 1808.25, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 337) | NCM: 85389010 | Preço Unit.: R$ 1.600,00 | Valor ST: R$ 208,25 | Preço c/ ST: R$ 1.808,25', v_fornecedor_id
    );
  END IF;

  -- Linha 338: PEC-0338 - PLACA CPU ELECTRONIC G6 COM VISOR IHM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0338' OR UPPER(TRIM(nome)) = UPPER('PLACA CPU ELECTRONIC G6 COM VISOR IHM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0338'),
        nome = 'PLACA CPU ELECTRONIC G6 COM VISOR IHM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85389010',
        preco_custo = 4000,
        preco_venda = 4520.61,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 338) | NCM: 85389010 | Preço Unit.: R$ 4.000,00 | Valor ST: R$ 520,61 | Preço c/ ST: R$ 4.520,61',
        ativo = true
    WHERE codigo = 'PEC-0338' OR UPPER(TRIM(nome)) = UPPER('PLACA CPU ELECTRONIC G6 COM VISOR IHM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0338', 'PLACA CPU ELECTRONIC G6 COM VISOR IHM', 'Peças', 'produto', 'UN', '85389010',
      4000, 4520.61, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 338) | NCM: 85389010 | Preço Unit.: R$ 4.000,00 | Valor ST: R$ 520,61 | Preço c/ ST: R$ 4.520,61', v_fornecedor_id
    );
  END IF;

  -- Linha 339: PEC-0339 - PLACA DO CLORADOR
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0339' OR UPPER(TRIM(nome)) = UPPER('PLACA DO CLORADOR')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0339'),
        nome = 'PLACA DO CLORADOR',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85389010',
        preco_custo = 925,
        preco_venda = 1045.39,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 339) | NCM: 85389010 | Preço Unit.: R$ 925,00 | Valor ST: R$ 120,39 | Preço c/ ST: R$ 1.045,39',
        ativo = true
    WHERE codigo = 'PEC-0339' OR UPPER(TRIM(nome)) = UPPER('PLACA DO CLORADOR');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0339', 'PLACA DO CLORADOR', 'Peças', 'produto', 'UN', '85389010',
      925, 1045.39, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 339) | NCM: 85389010 | Preço Unit.: R$ 925,00 | Valor ST: R$ 120,39 | Preço c/ ST: R$ 1.045,39', v_fornecedor_id
    );
  END IF;

  -- Linha 340: PEC-0340 - PLACA DO CLORADOR HIDRAULICO G6
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0340' OR UPPER(TRIM(nome)) = UPPER('PLACA DO CLORADOR HIDRAULICO G6')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0340'),
        nome = 'PLACA DO CLORADOR HIDRAULICO G6',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85389010',
        preco_custo = 2200,
        preco_venda = 2486.34,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 340) | NCM: 85389010 | Preço Unit.: R$ 2.200,00 | Valor ST: R$ 286,34 | Preço c/ ST: R$ 2.486,34',
        ativo = true
    WHERE codigo = 'PEC-0340' OR UPPER(TRIM(nome)) = UPPER('PLACA DO CLORADOR HIDRAULICO G6');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0340', 'PLACA DO CLORADOR HIDRAULICO G6', 'Peças', 'produto', 'UN', '85389010',
      2200, 2486.34, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 340) | NCM: 85389010 | Preço Unit.: R$ 2.200,00 | Valor ST: R$ 286,34 | Preço c/ ST: R$ 2.486,34', v_fornecedor_id
    );
  END IF;

  -- Linha 341: PEC-0341 - PLACA DO VISOR IHM ELETRONIC G6
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0341' OR UPPER(TRIM(nome)) = UPPER('PLACA DO VISOR IHM ELETRONIC G6')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0341'),
        nome = 'PLACA DO VISOR IHM ELETRONIC G6',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85389010',
        preco_custo = 910,
        preco_venda = 1028.44,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 341) | NCM: 85389010 | Preço Unit.: R$ 910,00 | Valor ST: R$ 118,44 | Preço c/ ST: R$ 1.028,44',
        ativo = true
    WHERE codigo = 'PEC-0341' OR UPPER(TRIM(nome)) = UPPER('PLACA DO VISOR IHM ELETRONIC G6');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0341', 'PLACA DO VISOR IHM ELETRONIC G6', 'Peças', 'produto', 'UN', '85389010',
      910, 1028.44, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 341) | NCM: 85389010 | Preço Unit.: R$ 910,00 | Valor ST: R$ 118,44 | Preço c/ ST: R$ 1.028,44', v_fornecedor_id
    );
  END IF;

  -- Linha 342: PEC-0342 - PLACA DOSADOR G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0342' OR UPPER(TRIM(nome)) = UPPER('PLACA DOSADOR G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0342'),
        nome = 'PLACA DOSADOR G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85389010',
        preco_custo = 200,
        preco_venda = 226.03,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 342) | NCM: 85389010 | Preço Unit.: R$ 200,00 | Valor ST: R$ 26,03 | Preço c/ ST: R$ 226,03',
        ativo = true
    WHERE codigo = 'PEC-0342' OR UPPER(TRIM(nome)) = UPPER('PLACA DOSADOR G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0342', 'PLACA DOSADOR G4', 'Peças', 'produto', 'UN', '85389010',
      200, 226.03, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 342) | NCM: 85389010 | Preço Unit.: R$ 200,00 | Valor ST: R$ 26,03 | Preço c/ ST: R$ 226,03', v_fornecedor_id
    );
  END IF;

  -- Linha 343: PEC-0343 - PLACA FILTRO ELETRONIC G6
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0343' OR UPPER(TRIM(nome)) = UPPER('PLACA FILTRO ELETRONIC G6')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0343'),
        nome = 'PLACA FILTRO ELETRONIC G6',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85389010',
        preco_custo = 3300,
        preco_venda = 3729.51,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 343) | NCM: 85389010 | Preço Unit.: R$ 3.300,00 | Valor ST: R$ 429,51 | Preço c/ ST: R$ 3.729,51',
        ativo = true
    WHERE codigo = 'PEC-0343' OR UPPER(TRIM(nome)) = UPPER('PLACA FILTRO ELETRONIC G6');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0343', 'PLACA FILTRO ELETRONIC G6', 'Peças', 'produto', 'UN', '85389010',
      3300, 3729.51, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 343) | NCM: 85389010 | Preço Unit.: R$ 3.300,00 | Valor ST: R$ 429,51 | Preço c/ ST: R$ 3.729,51', v_fornecedor_id
    );
  END IF;

  -- Linha 344: PEC-0344 - PONTE RETIFICADORA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0344' OR UPPER(TRIM(nome)) = UPPER('PONTE RETIFICADORA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0344'),
        nome = 'PONTE RETIFICADORA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85411029',
        preco_custo = 30,
        preco_venda = 30,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 344) | NCM: 85411029 | Preço Unit.: R$ 30,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 30,00',
        ativo = true
    WHERE codigo = 'PEC-0344' OR UPPER(TRIM(nome)) = UPPER('PONTE RETIFICADORA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0344', 'PONTE RETIFICADORA', 'Peças', 'produto', 'UN', '85411029',
      30, 30, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 344) | NCM: 85411029 | Preço Unit.: R$ 30,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 30,00', v_fornecedor_id
    );
  END IF;

  -- Linha 345: PEC-0345 - PORCA 1/4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0345' OR UPPER(TRIM(nome)) = UPPER('PORCA 1/4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0345'),
        nome = 'PORCA 1/4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '73181600',
        preco_custo = 0.5,
        preco_venda = 0.57,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 345) | NCM: 73181600 | Preço Unit.: R$ 0,50 | Valor ST: R$ 0,07 | Preço c/ ST: R$ 0,57',
        ativo = true
    WHERE codigo = 'PEC-0345' OR UPPER(TRIM(nome)) = UPPER('PORCA 1/4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0345', 'PORCA 1/4', 'Peças', 'produto', 'UN', '73181600',
      0.5, 0.57, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 345) | NCM: 73181600 | Preço Unit.: R$ 0,50 | Valor ST: R$ 0,07 | Preço c/ ST: R$ 0,57', v_fornecedor_id
    );
  END IF;

  -- Linha 346: PEC-0346 - PORTA ESSENCIA SPA LUXO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0346' OR UPPER(TRIM(nome)) = UPPER('PORTA ESSENCIA SPA LUXO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0346'),
        nome = 'PORTA ESSENCIA SPA LUXO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 170,
        preco_venda = 213.28,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 346) | NCM: 39269090 | Preço Unit.: R$ 170,00 | Valor ST: R$ 43,28 | Preço c/ ST: R$ 213,28',
        ativo = true
    WHERE codigo = 'PEC-0346' OR UPPER(TRIM(nome)) = UPPER('PORTA ESSENCIA SPA LUXO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0346', 'PORTA ESSENCIA SPA LUXO', 'Peças', 'produto', 'UN', '39269090',
      170, 213.28, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 346) | NCM: 39269090 | Preço Unit.: R$ 170,00 | Valor ST: R$ 43,28 | Preço c/ ST: R$ 213,28', v_fornecedor_id
    );
  END IF;

  -- Linha 347: PEC-0347 - PORTA FUSÍVEL
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0347' OR UPPER(TRIM(nome)) = UPPER('PORTA FUSÍVEL')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0347'),
        nome = 'PORTA FUSÍVEL',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 15,
        preco_venda = 16.94,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 347) | NCM: 39174090 | Preço Unit.: R$ 15,00 | Valor ST: R$ 1,94 | Preço c/ ST: R$ 16,94',
        ativo = true
    WHERE codigo = 'PEC-0347' OR UPPER(TRIM(nome)) = UPPER('PORTA FUSÍVEL');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0347', 'PORTA FUSÍVEL', 'Peças', 'produto', 'UN', '39174090',
      15, 16.94, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 347) | NCM: 39174090 | Preço Unit.: R$ 15,00 | Valor ST: R$ 1,94 | Preço c/ ST: R$ 16,94', v_fornecedor_id
    );
  END IF;

  -- Linha 348: PEC-0348 - PORTA SABONETE P/ SAUNA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0348' OR UPPER(TRIM(nome)) = UPPER('PORTA SABONETE P/ SAUNA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0348'),
        nome = 'PORTA SABONETE P/ SAUNA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85167990',
        preco_custo = 240,
        preco_venda = 240,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 348) | NCM: 85167990 | Preço Unit.: R$ 240,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 240,00',
        ativo = true
    WHERE codigo = 'PEC-0348' OR UPPER(TRIM(nome)) = UPPER('PORTA SABONETE P/ SAUNA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0348', 'PORTA SABONETE P/ SAUNA', 'Peças', 'produto', 'UN', '85167990',
      240, 240, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 348) | NCM: 85167990 | Preço Unit.: R$ 240,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 240,00', v_fornecedor_id
    );
  END IF;

  -- Linha 349: PEC-0349 - PORTA TOALHA EM AÇO INOX.
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0349' OR UPPER(TRIM(nome)) = UPPER('PORTA TOALHA EM AÇO INOX.')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0349'),
        nome = 'PORTA TOALHA EM AÇO INOX.',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '73249000',
        preco_custo = 15,
        preco_venda = 20.32,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 349) | NCM: 73249000 | Preço Unit.: R$ 15,00 | Valor ST: R$ 5,32 | Preço c/ ST: R$ 20,32',
        ativo = true
    WHERE codigo = 'PEC-0349' OR UPPER(TRIM(nome)) = UPPER('PORTA TOALHA EM AÇO INOX.');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0349', 'PORTA TOALHA EM AÇO INOX.', 'Peças', 'produto', 'UN', '73249000',
      15, 20.32, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 349) | NCM: 73249000 | Preço Unit.: R$ 15,00 | Valor ST: R$ 5,32 | Preço c/ ST: R$ 20,32', v_fornecedor_id
    );
  END IF;

  -- Linha 350: PEC-0350 - PRATELEIRA DA SAUNA CLUB
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0350' OR UPPER(TRIM(nome)) = UPPER('PRATELEIRA DA SAUNA CLUB')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0350'),
        nome = 'PRATELEIRA DA SAUNA CLUB',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '73249000',
        preco_custo = 150,
        preco_venda = 203.23,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 350) | NCM: 73249000 | Preço Unit.: R$ 150,00 | Valor ST: R$ 53,23 | Preço c/ ST: R$ 203,23',
        ativo = true
    WHERE codigo = 'PEC-0350' OR UPPER(TRIM(nome)) = UPPER('PRATELEIRA DA SAUNA CLUB');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0350', 'PRATELEIRA DA SAUNA CLUB', 'Peças', 'produto', 'UN', '73249000',
      150, 203.23, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 350) | NCM: 73249000 | Preço Unit.: R$ 150,00 | Valor ST: R$ 53,23 | Preço c/ ST: R$ 203,23', v_fornecedor_id
    );
  END IF;

  -- Linha 351: PEC-0351 - PRATELEIRA IGUI
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0351' OR UPPER(TRIM(nome)) = UPPER('PRATELEIRA IGUI')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0351'),
        nome = 'PRATELEIRA IGUI',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '94037000',
        preco_custo = 899,
        preco_venda = 899,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 351) | NCM: 94037000 | Preço Unit.: R$ 899,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 899,00',
        ativo = true
    WHERE codigo = 'PEC-0351' OR UPPER(TRIM(nome)) = UPPER('PRATELEIRA IGUI');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0351', 'PRATELEIRA IGUI', 'Peças', 'produto', 'UN', '94037000',
      899, 899, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 351) | NCM: 94037000 | Preço Unit.: R$ 899,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 899,00', v_fornecedor_id
    );
  END IF;

  -- Linha 352: PEC-0352 - PRATELEIRA SPLASH
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0352' OR UPPER(TRIM(nome)) = UPPER('PRATELEIRA SPLASH')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0352'),
        nome = 'PRATELEIRA SPLASH',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '94037000',
        preco_custo = 899,
        preco_venda = 899,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 352) | NCM: 94037000 | Preço Unit.: R$ 899,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 899,00',
        ativo = true
    WHERE codigo = 'PEC-0352' OR UPPER(TRIM(nome)) = UPPER('PRATELEIRA SPLASH');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0352', 'PRATELEIRA SPLASH', 'Peças', 'produto', 'UN', '94037000',
      899, 899, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 352) | NCM: 94037000 | Preço Unit.: R$ 899,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 899,00', v_fornecedor_id
    );
  END IF;

  -- Linha 353: PEC-0353 - PRE FILTRO ASPIRAÇÃO SPLASH (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0353' OR UPPER(TRIM(nome)) = UPPER('PRE FILTRO ASPIRAÇÃO SPLASH (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0353'),
        nome = 'PRE FILTRO ASPIRAÇÃO SPLASH (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 100,
        preco_venda = 112.96,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 353) | NCM: 39172900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96',
        ativo = true
    WHERE codigo = 'PEC-0353' OR UPPER(TRIM(nome)) = UPPER('PRE FILTRO ASPIRAÇÃO SPLASH (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0353', 'PRE FILTRO ASPIRAÇÃO SPLASH (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39172900',
      100, 112.96, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 353) | NCM: 39172900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96', v_fornecedor_id
    );
  END IF;

  -- Linha 354: PEC-0354 - PRE FILTRO G4/G5 (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0354' OR UPPER(TRIM(nome)) = UPPER('PRE FILTRO G4/G5 (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0354'),
        nome = 'PRE FILTRO G4/G5 (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 100,
        preco_venda = 112.96,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 354) | NCM: 39172900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96',
        ativo = true
    WHERE codigo = 'PEC-0354' OR UPPER(TRIM(nome)) = UPPER('PRE FILTRO G4/G5 (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0354', 'PRE FILTRO G4/G5 (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39172900',
      100, 112.96, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 354) | NCM: 39172900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96', v_fornecedor_id
    );
  END IF;

  -- Linha 355: PEC-0355 - PRE FILTRO MOTOBOMBA ESCORVANTE (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0355' OR UPPER(TRIM(nome)) = UPPER('PRE FILTRO MOTOBOMBA ESCORVANTE (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0355'),
        nome = 'PRE FILTRO MOTOBOMBA ESCORVANTE (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 75,
        preco_venda = 84.72,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 355) | NCM: 39172900 | Preço Unit.: R$ 75,00 | Valor ST: R$ 9,72 | Preço c/ ST: R$ 84,72',
        ativo = true
    WHERE codigo = 'PEC-0355' OR UPPER(TRIM(nome)) = UPPER('PRE FILTRO MOTOBOMBA ESCORVANTE (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0355', 'PRE FILTRO MOTOBOMBA ESCORVANTE (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39172900',
      75, 84.72, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 355) | NCM: 39172900 | Preço Unit.: R$ 75,00 | Valor ST: R$ 9,72 | Preço c/ ST: R$ 84,72', v_fornecedor_id
    );
  END IF;

  -- Linha 356: PEC-0356 - PRE FILTRO SEGURANÇA G3/G4/SPLASH (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0356' OR UPPER(TRIM(nome)) = UPPER('PRE FILTRO SEGURANÇA G3/G4/SPLASH (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0356'),
        nome = 'PRE FILTRO SEGURANÇA G3/G4/SPLASH (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 70,
        preco_venda = 79.07,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 356) | NCM: 39174090 | Preço Unit.: R$ 70,00 | Valor ST: R$ 9,07 | Preço c/ ST: R$ 79,07',
        ativo = true
    WHERE codigo = 'PEC-0356' OR UPPER(TRIM(nome)) = UPPER('PRE FILTRO SEGURANÇA G3/G4/SPLASH (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0356', 'PRE FILTRO SEGURANÇA G3/G4/SPLASH (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39174090',
      70, 79.07, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 356) | NCM: 39174090 | Preço Unit.: R$ 70,00 | Valor ST: R$ 9,07 | Preço c/ ST: R$ 79,07', v_fornecedor_id
    );
  END IF;

  -- Linha 357: PEC-0357 - PRE FILTRO SEGURANÇA G5 (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0357' OR UPPER(TRIM(nome)) = UPPER('PRE FILTRO SEGURANÇA G5 (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0357'),
        nome = 'PRE FILTRO SEGURANÇA G5 (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 60,
        preco_venda = 67.78,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 357) | NCM: 39174090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 7,78 | Preço c/ ST: R$ 67,78',
        ativo = true
    WHERE codigo = 'PEC-0357' OR UPPER(TRIM(nome)) = UPPER('PRE FILTRO SEGURANÇA G5 (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0357', 'PRE FILTRO SEGURANÇA G5 (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39174090',
      60, 67.78, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 357) | NCM: 39174090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 7,78 | Preço c/ ST: R$ 67,78', v_fornecedor_id
    );
  END IF;

  -- Linha 358: PEC-0358 - PRENSA CABO FRONTAL THERMAS
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0358' OR UPPER(TRIM(nome)) = UPPER('PRENSA CABO FRONTAL THERMAS')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0358'),
        nome = 'PRENSA CABO FRONTAL THERMAS',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 50,
        preco_venda = 56.48,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 358) | NCM: 39174090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 6,48 | Preço c/ ST: R$ 56,48',
        ativo = true
    WHERE codigo = 'PEC-0358' OR UPPER(TRIM(nome)) = UPPER('PRENSA CABO FRONTAL THERMAS');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0358', 'PRENSA CABO FRONTAL THERMAS', 'Peças', 'produto', 'UN', '39174090',
      50, 56.48, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 358) | NCM: 39174090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 6,48 | Preço c/ ST: R$ 56,48', v_fornecedor_id
    );
  END IF;

  -- Linha 359: PEC-0359 - PRENSA CABO PG 11
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0359' OR UPPER(TRIM(nome)) = UPPER('PRENSA CABO PG 11')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0359'),
        nome = 'PRENSA CABO PG 11',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 10,
        preco_venda = 11.3,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 359) | NCM: 39174090 | Preço Unit.: R$ 10,00 | Valor ST: R$ 1,30 | Preço c/ ST: R$ 11,30',
        ativo = true
    WHERE codigo = 'PEC-0359' OR UPPER(TRIM(nome)) = UPPER('PRENSA CABO PG 11');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0359', 'PRENSA CABO PG 11', 'Peças', 'produto', 'UN', '39174090',
      10, 11.3, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 359) | NCM: 39174090 | Preço Unit.: R$ 10,00 | Valor ST: R$ 1,30 | Preço c/ ST: R$ 11,30', v_fornecedor_id
    );
  END IF;

  -- Linha 360: PEC-0360 - PRENSA CABO PG 21
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0360' OR UPPER(TRIM(nome)) = UPPER('PRENSA CABO PG 21')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0360'),
        nome = 'PRENSA CABO PG 21',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 7,
        preco_venda = 7.91,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 360) | NCM: 39174090 | Preço Unit.: R$ 7,00 | Valor ST: R$ 0,91 | Preço c/ ST: R$ 7,91',
        ativo = true
    WHERE codigo = 'PEC-0360' OR UPPER(TRIM(nome)) = UPPER('PRENSA CABO PG 21');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0360', 'PRENSA CABO PG 21', 'Peças', 'produto', 'UN', '39174090',
      7, 7.91, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 360) | NCM: 39174090 | Preço Unit.: R$ 7,00 | Valor ST: R$ 0,91 | Preço c/ ST: R$ 7,91', v_fornecedor_id
    );
  END IF;

  -- Linha 361: PEC-0361 - PRENSA CABO PG 7
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0361' OR UPPER(TRIM(nome)) = UPPER('PRENSA CABO PG 7')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0361'),
        nome = 'PRENSA CABO PG 7',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 5,
        preco_venda = 5.65,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 361) | NCM: 39174090 | Preço Unit.: R$ 5,00 | Valor ST: R$ 0,65 | Preço c/ ST: R$ 5,65',
        ativo = true
    WHERE codigo = 'PEC-0361' OR UPPER(TRIM(nome)) = UPPER('PRENSA CABO PG 7');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0361', 'PRENSA CABO PG 7', 'Peças', 'produto', 'UN', '39174090',
      5, 5.65, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 361) | NCM: 39174090 | Preço Unit.: R$ 5,00 | Valor ST: R$ 0,65 | Preço c/ ST: R$ 5,65', v_fornecedor_id
    );
  END IF;

  -- Linha 362: PEC-0362 - PRESILHA DO VISOR G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0362' OR UPPER(TRIM(nome)) = UPPER('PRESILHA DO VISOR G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0362'),
        nome = 'PRESILHA DO VISOR G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 5,
        preco_venda = 6.27,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 362) | NCM: 39269090 | Preço Unit.: R$ 5,00 | Valor ST: R$ 1,27 | Preço c/ ST: R$ 6,27',
        ativo = true
    WHERE codigo = 'PEC-0362' OR UPPER(TRIM(nome)) = UPPER('PRESILHA DO VISOR G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0362', 'PRESILHA DO VISOR G4', 'Peças', 'produto', 'UN', '39269090',
      5, 6.27, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 362) | NCM: 39269090 | Preço Unit.: R$ 5,00 | Valor ST: R$ 1,27 | Preço c/ ST: R$ 6,27', v_fornecedor_id
    );
  END IF;

  -- Linha 363: PEC-0363 - PRESILHA DO VISOR G7
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0363' OR UPPER(TRIM(nome)) = UPPER('PRESILHA DO VISOR G7')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0363'),
        nome = 'PRESILHA DO VISOR G7',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 5,
        preco_venda = 6.27,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 363) | NCM: 39269090 | Preço Unit.: R$ 5,00 | Valor ST: R$ 1,27 | Preço c/ ST: R$ 6,27',
        ativo = true
    WHERE codigo = 'PEC-0363' OR UPPER(TRIM(nome)) = UPPER('PRESILHA DO VISOR G7');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0363', 'PRESILHA DO VISOR G7', 'Peças', 'produto', 'UN', '39269090',
      5, 6.27, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 363) | NCM: 39269090 | Preço Unit.: R$ 5,00 | Valor ST: R$ 1,27 | Preço c/ ST: R$ 6,27', v_fornecedor_id
    );
  END IF;

  -- Linha 364: PEC-0364 - PRISIONEIRO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0364' OR UPPER(TRIM(nome)) = UPPER('PRISIONEIRO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0364'),
        nome = 'PRISIONEIRO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '73181500',
        preco_custo = 9,
        preco_venda = 9,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 364) | NCM: 73181500 | Preço Unit.: R$ 9,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 9,00',
        ativo = true
    WHERE codigo = 'PEC-0364' OR UPPER(TRIM(nome)) = UPPER('PRISIONEIRO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0364', 'PRISIONEIRO', 'Peças', 'produto', 'UN', '73181500',
      9, 9, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 364) | NCM: 73181500 | Preço Unit.: R$ 9,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 9,00', v_fornecedor_id
    );
  END IF;

  -- Linha 365: PEC-0365 - PROTETOR DE SURTO 110 V
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0365' OR UPPER(TRIM(nome)) = UPPER('PROTETOR DE SURTO 110 V')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0365'),
        nome = 'PROTETOR DE SURTO 110 V',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85369090',
        preco_custo = 100,
        preco_venda = 111.63,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 365) | NCM: 85369090 | Preço Unit.: R$ 100,00 | Valor ST: R$ 11,63 | Preço c/ ST: R$ 111,63',
        ativo = true
    WHERE codigo = 'PEC-0365' OR UPPER(TRIM(nome)) = UPPER('PROTETOR DE SURTO 110 V');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0365', 'PROTETOR DE SURTO 110 V', 'Peças', 'produto', 'UN', '85369090',
      100, 111.63, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 365) | NCM: 85369090 | Preço Unit.: R$ 100,00 | Valor ST: R$ 11,63 | Preço c/ ST: R$ 111,63', v_fornecedor_id
    );
  END IF;

  -- Linha 366: PEC-0366 - PROTETOR DE SURTO 220V
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0366' OR UPPER(TRIM(nome)) = UPPER('PROTETOR DE SURTO 220V')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0366'),
        nome = 'PROTETOR DE SURTO 220V',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85369090',
        preco_custo = 100,
        preco_venda = 111.63,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 366) | NCM: 85369090 | Preço Unit.: R$ 100,00 | Valor ST: R$ 11,63 | Preço c/ ST: R$ 111,63',
        ativo = true
    WHERE codigo = 'PEC-0366' OR UPPER(TRIM(nome)) = UPPER('PROTETOR DE SURTO 220V');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0366', 'PROTETOR DE SURTO 220V', 'Peças', 'produto', 'UN', '85369090',
      100, 111.63, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 366) | NCM: 85369090 | Preço Unit.: R$ 100,00 | Valor ST: R$ 11,63 | Preço c/ ST: R$ 111,63', v_fornecedor_id
    );
  END IF;

  -- Linha 367: PEC-0367 - PUXADOR DE INOX
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0367' OR UPPER(TRIM(nome)) = UPPER('PUXADOR DE INOX')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0367'),
        nome = 'PUXADOR DE INOX',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '83024100',
        preco_custo = 125,
        preco_venda = 151.75,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 367) | NCM: 83024100 | Preço Unit.: R$ 125,00 | Valor ST: R$ 26,75 | Preço c/ ST: R$ 151,75',
        ativo = true
    WHERE codigo = 'PEC-0367' OR UPPER(TRIM(nome)) = UPPER('PUXADOR DE INOX');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0367', 'PUXADOR DE INOX', 'Peças', 'produto', 'UN', '83024100',
      125, 151.75, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 367) | NCM: 83024100 | Preço Unit.: R$ 125,00 | Valor ST: R$ 26,75 | Preço c/ ST: R$ 151,75', v_fornecedor_id
    );
  END IF;

  -- Linha 368: PEC-0368 - Q. C. G7 - CONFORT
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0368' OR UPPER(TRIM(nome)) = UPPER('Q. C. G7 - CONFORT')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0368'),
        nome = 'Q. C. G7 - CONFORT',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '91070010',
        preco_custo = 2115,
        preco_venda = 2115,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 368) | NCM: 91070010 | Preço Unit.: R$ 2.115,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2.115,00',
        ativo = true
    WHERE codigo = 'PEC-0368' OR UPPER(TRIM(nome)) = UPPER('Q. C. G7 - CONFORT');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0368', 'Q. C. G7 - CONFORT', 'Peças', 'produto', 'UN', '91070010',
      2115, 2115, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 368) | NCM: 91070010 | Preço Unit.: R$ 2.115,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2.115,00', v_fornecedor_id
    );
  END IF;

  -- Linha 369: PEC-0369 - Q. C. MAX 1 - STANDARD
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0369' OR UPPER(TRIM(nome)) = UPPER('Q. C. MAX 1 - STANDARD')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0369'),
        nome = 'Q. C. MAX 1 - STANDARD',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '91070010',
        preco_custo = 1000,
        preco_venda = 1000,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 369) | NCM: 91070010 | Preço Unit.: R$ 1.000,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.000,00',
        ativo = true
    WHERE codigo = 'PEC-0369' OR UPPER(TRIM(nome)) = UPPER('Q. C. MAX 1 - STANDARD');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0369', 'Q. C. MAX 1 - STANDARD', 'Peças', 'produto', 'UN', '91070010',
      1000, 1000, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 369) | NCM: 91070010 | Preço Unit.: R$ 1.000,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.000,00', v_fornecedor_id
    );
  END IF;

  -- Linha 370: PEC-0370 - Q. C. MAX 2 - CLORADOR
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0370' OR UPPER(TRIM(nome)) = UPPER('Q. C. MAX 2 - CLORADOR')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0370'),
        nome = 'Q. C. MAX 2 - CLORADOR',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '91070010',
        preco_custo = 1750,
        preco_venda = 1750,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 370) | NCM: 91070010 | Preço Unit.: R$ 1.750,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.750,00',
        ativo = true
    WHERE codigo = 'PEC-0370' OR UPPER(TRIM(nome)) = UPPER('Q. C. MAX 2 - CLORADOR');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0370', 'Q. C. MAX 2 - CLORADOR', 'Peças', 'produto', 'UN', '91070010',
      1750, 1750, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 370) | NCM: 91070010 | Preço Unit.: R$ 1.750,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.750,00', v_fornecedor_id
    );
  END IF;

  -- Linha 371: PEC-0371 - Q. C. MAX 2 - PLUS
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0371' OR UPPER(TRIM(nome)) = UPPER('Q. C. MAX 2 - PLUS')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0371'),
        nome = 'Q. C. MAX 2 - PLUS',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '91070010',
        preco_custo = 1200,
        preco_venda = 1200,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 371) | NCM: 91070010 | Preço Unit.: R$ 1.200,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.200,00',
        ativo = true
    WHERE codigo = 'PEC-0371' OR UPPER(TRIM(nome)) = UPPER('Q. C. MAX 2 - PLUS');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0371', 'Q. C. MAX 2 - PLUS', 'Peças', 'produto', 'UN', '91070010',
      1200, 1200, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 371) | NCM: 91070010 | Preço Unit.: R$ 1.200,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.200,00', v_fornecedor_id
    );
  END IF;

  -- Linha 372: PEC-0372 - Q. C. MAX 4 - CONFORT
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0372' OR UPPER(TRIM(nome)) = UPPER('Q. C. MAX 4 - CONFORT')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0372'),
        nome = 'Q. C. MAX 4 - CONFORT',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '91070010',
        preco_custo = 2115,
        preco_venda = 2115,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 372) | NCM: 91070010 | Preço Unit.: R$ 2.115,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2.115,00',
        ativo = true
    WHERE codigo = 'PEC-0372' OR UPPER(TRIM(nome)) = UPPER('Q. C. MAX 4 - CONFORT');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0372', 'Q. C. MAX 4 - CONFORT', 'Peças', 'produto', 'UN', '91070010',
      2115, 2115, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 372) | NCM: 91070010 | Preço Unit.: R$ 2.115,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2.115,00', v_fornecedor_id
    );
  END IF;

  -- Linha 373: PEC-0373 - Q. C. MAX 4 - CONFORT UV
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0373' OR UPPER(TRIM(nome)) = UPPER('Q. C. MAX 4 - CONFORT UV')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0373'),
        nome = 'Q. C. MAX 4 - CONFORT UV',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '91070010',
        preco_custo = 2145,
        preco_venda = 2145,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 373) | NCM: 91070010 | Preço Unit.: R$ 2.145,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2.145,00',
        ativo = true
    WHERE codigo = 'PEC-0373' OR UPPER(TRIM(nome)) = UPPER('Q. C. MAX 4 - CONFORT UV');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0373', 'Q. C. MAX 4 - CONFORT UV', 'Peças', 'produto', 'UN', '91070010',
      2145, 2145, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 373) | NCM: 91070010 | Preço Unit.: R$ 2.145,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2.145,00', v_fornecedor_id
    );
  END IF;

  -- Linha 374: PEC-0374 - Q. C. MAX ELETRONIC SYSTEM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0374' OR UPPER(TRIM(nome)) = UPPER('Q. C. MAX ELETRONIC SYSTEM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0374'),
        nome = 'Q. C. MAX ELETRONIC SYSTEM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '91070010',
        preco_custo = 4500,
        preco_venda = 4500,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 374) | NCM: 91070010 | Preço Unit.: R$ 4.500,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 4.500,00',
        ativo = true
    WHERE codigo = 'PEC-0374' OR UPPER(TRIM(nome)) = UPPER('Q. C. MAX ELETRONIC SYSTEM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0374', 'Q. C. MAX ELETRONIC SYSTEM', 'Peças', 'produto', 'UN', '91070010',
      4500, 4500, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 374) | NCM: 91070010 | Preço Unit.: R$ 4.500,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 4.500,00', v_fornecedor_id
    );
  END IF;

  -- Linha 375: PEC-0375 - Q. C. MAX ELETRONIC SYSTEM NOVO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0375' OR UPPER(TRIM(nome)) = UPPER('Q. C. MAX ELETRONIC SYSTEM NOVO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0375'),
        nome = 'Q. C. MAX ELETRONIC SYSTEM NOVO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '91070010',
        preco_custo = 7000,
        preco_venda = 7000,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 375) | NCM: 91070010 | Preço Unit.: R$ 7.000,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 7.000,00',
        ativo = true
    WHERE codigo = 'PEC-0375' OR UPPER(TRIM(nome)) = UPPER('Q. C. MAX ELETRONIC SYSTEM NOVO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0375', 'Q. C. MAX ELETRONIC SYSTEM NOVO', 'Peças', 'produto', 'UN', '91070010',
      7000, 7000, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 375) | NCM: 91070010 | Preço Unit.: R$ 7.000,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 7.000,00', v_fornecedor_id
    );
  END IF;

  -- Linha 376: PEC-0376 - Q. C. SPLASH
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0376' OR UPPER(TRIM(nome)) = UPPER('Q. C. SPLASH')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0376'),
        nome = 'Q. C. SPLASH',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '91070010',
        preco_custo = 495,
        preco_venda = 495,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 376) | NCM: 91070010 | Preço Unit.: R$ 495,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 495,00',
        ativo = true
    WHERE codigo = 'PEC-0376' OR UPPER(TRIM(nome)) = UPPER('Q. C. SPLASH');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0376', 'Q. C. SPLASH', 'Peças', 'produto', 'UN', '91070010',
      495, 495, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 376) | NCM: 91070010 | Preço Unit.: R$ 495,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 495,00', v_fornecedor_id
    );
  END IF;

  -- Linha 377: PEC-0377 - Q. C. SPLASH PLUS C/ LED
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0377' OR UPPER(TRIM(nome)) = UPPER('Q. C. SPLASH PLUS C/ LED')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0377'),
        nome = 'Q. C. SPLASH PLUS C/ LED',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '91070010',
        preco_custo = 710,
        preco_venda = 710,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 377) | NCM: 91070010 | Preço Unit.: R$ 710,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 710,00',
        ativo = true
    WHERE codigo = 'PEC-0377' OR UPPER(TRIM(nome)) = UPPER('Q. C. SPLASH PLUS C/ LED');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0377', 'Q. C. SPLASH PLUS C/ LED', 'Peças', 'produto', 'UN', '91070010',
      710, 710, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 377) | NCM: 91070010 | Preço Unit.: R$ 710,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 710,00', v_fornecedor_id
    );
  END IF;

  -- Linha 378: PEC-0378 - Q.C. 1 CONNECT SYSTEM 127V
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0378' OR UPPER(TRIM(nome)) = UPPER('Q.C. 1 CONNECT SYSTEM 127V')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0378'),
        nome = 'Q.C. 1 CONNECT SYSTEM 127V',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '91070010',
        preco_custo = 1200,
        preco_venda = 1200,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 378) | NCM: 91070010 | Preço Unit.: R$ 1.200,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.200,00',
        ativo = true
    WHERE codigo = 'PEC-0378' OR UPPER(TRIM(nome)) = UPPER('Q.C. 1 CONNECT SYSTEM 127V');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0378', 'Q.C. 1 CONNECT SYSTEM 127V', 'Peças', 'produto', 'UN', '91070010',
      1200, 1200, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 378) | NCM: 91070010 | Preço Unit.: R$ 1.200,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.200,00', v_fornecedor_id
    );
  END IF;

  -- Linha 379: PEC-0379 - Q.C. 1 CONNECT SYSTEM 220V
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0379' OR UPPER(TRIM(nome)) = UPPER('Q.C. 1 CONNECT SYSTEM 220V')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0379'),
        nome = 'Q.C. 1 CONNECT SYSTEM 220V',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '91070010',
        preco_custo = 1200,
        preco_venda = 1200,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 379) | NCM: 91070010 | Preço Unit.: R$ 1.200,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.200,00',
        ativo = true
    WHERE codigo = 'PEC-0379' OR UPPER(TRIM(nome)) = UPPER('Q.C. 1 CONNECT SYSTEM 220V');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0379', 'Q.C. 1 CONNECT SYSTEM 220V', 'Peças', 'produto', 'UN', '91070010',
      1200, 1200, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 379) | NCM: 91070010 | Preço Unit.: R$ 1.200,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.200,00', v_fornecedor_id
    );
  END IF;

  -- Linha 380: PEC-0380 - Q.C. CLORADOR CONNECT SYSTEM 127V
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0380' OR UPPER(TRIM(nome)) = UPPER('Q.C. CLORADOR CONNECT SYSTEM 127V')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0380'),
        nome = 'Q.C. CLORADOR CONNECT SYSTEM 127V',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '91070010',
        preco_custo = 1950,
        preco_venda = 1950,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 380) | NCM: 91070010 | Preço Unit.: R$ 1.950,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.950,00',
        ativo = true
    WHERE codigo = 'PEC-0380' OR UPPER(TRIM(nome)) = UPPER('Q.C. CLORADOR CONNECT SYSTEM 127V');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0380', 'Q.C. CLORADOR CONNECT SYSTEM 127V', 'Peças', 'produto', 'UN', '91070010',
      1950, 1950, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 380) | NCM: 91070010 | Preço Unit.: R$ 1.950,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.950,00', v_fornecedor_id
    );
  END IF;

  -- Linha 381: PEC-0381 - Q.C. CLORADOR CONNECT SYSTEM 220V
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0381' OR UPPER(TRIM(nome)) = UPPER('Q.C. CLORADOR CONNECT SYSTEM 220V')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0381'),
        nome = 'Q.C. CLORADOR CONNECT SYSTEM 220V',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '91070010',
        preco_custo = 1950,
        preco_venda = 1950,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 381) | NCM: 91070010 | Preço Unit.: R$ 1.950,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.950,00',
        ativo = true
    WHERE codigo = 'PEC-0381' OR UPPER(TRIM(nome)) = UPPER('Q.C. CLORADOR CONNECT SYSTEM 220V');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0381', 'Q.C. CLORADOR CONNECT SYSTEM 220V', 'Peças', 'produto', 'UN', '91070010',
      1950, 1950, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 381) | NCM: 91070010 | Preço Unit.: R$ 1.950,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.950,00', v_fornecedor_id
    );
  END IF;

  -- Linha 382: PEC-0382 - Q.C. CONFORT CONNECT SYSTEM 220V
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0382' OR UPPER(TRIM(nome)) = UPPER('Q.C. CONFORT CONNECT SYSTEM 220V')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0382'),
        nome = 'Q.C. CONFORT CONNECT SYSTEM 220V',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '91070010',
        preco_custo = 2350,
        preco_venda = 2350,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 382) | NCM: 91070010 | Preço Unit.: R$ 2.350,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2.350,00',
        ativo = true
    WHERE codigo = 'PEC-0382' OR UPPER(TRIM(nome)) = UPPER('Q.C. CONFORT CONNECT SYSTEM 220V');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0382', 'Q.C. CONFORT CONNECT SYSTEM 220V', 'Peças', 'produto', 'UN', '91070010',
      2350, 2350, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 382) | NCM: 91070010 | Preço Unit.: R$ 2.350,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2.350,00', v_fornecedor_id
    );
  END IF;

  -- Linha 383: PEC-0383 - REATOR U.V. 75W
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0383' OR UPPER(TRIM(nome)) = UPPER('REATOR U.V. 75W')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0383'),
        nome = 'REATOR U.V. 75W',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85041000',
        preco_custo = 375,
        preco_venda = 375,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 383) | NCM: 85041000 | Preço Unit.: R$ 375,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 375,00',
        ativo = true
    WHERE codigo = 'PEC-0383' OR UPPER(TRIM(nome)) = UPPER('REATOR U.V. 75W');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0383', 'REATOR U.V. 75W', 'Peças', 'produto', 'UN', '85041000',
      375, 375, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 383) | NCM: 85041000 | Preço Unit.: R$ 375,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 375,00', v_fornecedor_id
    );
  END IF;

  -- Linha 384: PEC-0384 - REATOR UV 60W
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0384' OR UPPER(TRIM(nome)) = UPPER('REATOR UV 60W')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0384'),
        nome = 'REATOR UV 60W',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85041000',
        preco_custo = 240,
        preco_venda = 240,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 384) | NCM: 85041000 | Preço Unit.: R$ 240,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 240,00',
        ativo = true
    WHERE codigo = 'PEC-0384' OR UPPER(TRIM(nome)) = UPPER('REATOR UV 60W');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0384', 'REATOR UV 60W', 'Peças', 'produto', 'UN', '85041000',
      240, 240, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 384) | NCM: 85041000 | Preço Unit.: R$ 240,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 240,00', v_fornecedor_id
    );
  END IF;

  -- Linha 385: PEC-0385 - REDUÇÃO 40X25 ALTA (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0385' OR UPPER(TRIM(nome)) = UPPER('REDUÇÃO 40X25 ALTA (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0385'),
        nome = 'REDUÇÃO 40X25 ALTA (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 37,
        preco_venda = 41.8,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 385) | NCM: 39174090 | Preço Unit.: R$ 37,00 | Valor ST: R$ 4,80 | Preço c/ ST: R$ 41,80',
        ativo = true
    WHERE codigo = 'PEC-0385' OR UPPER(TRIM(nome)) = UPPER('REDUÇÃO 40X25 ALTA (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0385', 'REDUÇÃO 40X25 ALTA (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39174090',
      37, 41.8, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 385) | NCM: 39174090 | Preço Unit.: R$ 37,00 | Valor ST: R$ 4,80 | Preço c/ ST: R$ 41,80', v_fornecedor_id
    );
  END IF;

  -- Linha 386: PEC-0386 - REDUÇÃO 40X25 BAIXA (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0386' OR UPPER(TRIM(nome)) = UPPER('REDUÇÃO 40X25 BAIXA (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0386'),
        nome = 'REDUÇÃO 40X25 BAIXA (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 47,
        preco_venda = 53.09,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 386) | NCM: 39174090 | Preço Unit.: R$ 47,00 | Valor ST: R$ 6,09 | Preço c/ ST: R$ 53,09',
        ativo = true
    WHERE codigo = 'PEC-0386' OR UPPER(TRIM(nome)) = UPPER('REDUÇÃO 40X25 BAIXA (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0386', 'REDUÇÃO 40X25 BAIXA (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39174090',
      47, 53.09, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 386) | NCM: 39174090 | Preço Unit.: R$ 47,00 | Valor ST: R$ 6,09 | Preço c/ ST: R$ 53,09', v_fornecedor_id
    );
  END IF;

  -- Linha 387: PEC-0387 - REGISTRO 32MM CH - NOVO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0387' OR UPPER(TRIM(nome)) = UPPER('REGISTRO 32MM CH - NOVO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0387'),
        nome = 'REGISTRO 32MM CH - NOVO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84818095',
        preco_custo = 15,
        preco_venda = 16.12,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 387) | NCM: 84818095 | Preço Unit.: R$ 15,00 | Valor ST: R$ 1,12 | Preço c/ ST: R$ 16,12',
        ativo = true
    WHERE codigo = 'PEC-0387' OR UPPER(TRIM(nome)) = UPPER('REGISTRO 32MM CH - NOVO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0387', 'REGISTRO 32MM CH - NOVO', 'Peças', 'produto', 'UN', '84818095',
      15, 16.12, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 387) | NCM: 84818095 | Preço Unit.: R$ 15,00 | Valor ST: R$ 1,12 | Preço c/ ST: R$ 16,12', v_fornecedor_id
    );
  END IF;

  -- Linha 388: PEC-0388 - REGISTRO 32MM CH (CX C/ 5 UN) - NOVO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0388' OR UPPER(TRIM(nome)) = UPPER('REGISTRO 32MM CH (CX C/ 5 UN) - NOVO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0388'),
        nome = 'REGISTRO 32MM CH (CX C/ 5 UN) - NOVO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84818095',
        preco_custo = 75,
        preco_venda = 80.61,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 388) | NCM: 84818095 | Preço Unit.: R$ 75,00 | Valor ST: R$ 5,61 | Preço c/ ST: R$ 80,61',
        ativo = true
    WHERE codigo = 'PEC-0388' OR UPPER(TRIM(nome)) = UPPER('REGISTRO 32MM CH (CX C/ 5 UN) - NOVO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0388', 'REGISTRO 32MM CH (CX C/ 5 UN) - NOVO', 'Peças', 'produto', 'UN', '84818095',
      75, 80.61, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 388) | NCM: 84818095 | Preço Unit.: R$ 75,00 | Valor ST: R$ 5,61 | Preço c/ ST: R$ 80,61', v_fornecedor_id
    );
  END IF;

  -- Linha 389: PEC-0389 - REGISTRO 32MM CH (CX C/ 50 UN) - NOVO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0389' OR UPPER(TRIM(nome)) = UPPER('REGISTRO 32MM CH (CX C/ 50 UN) - NOVO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0389'),
        nome = 'REGISTRO 32MM CH (CX C/ 50 UN) - NOVO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84818095',
        preco_custo = 750,
        preco_venda = 806.1,
        unidades_por_compra = 50,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 389) | NCM: 84818095 | Preço Unit.: R$ 750,00 | Valor ST: R$ 56,10 | Preço c/ ST: R$ 806,10',
        ativo = true
    WHERE codigo = 'PEC-0389' OR UPPER(TRIM(nome)) = UPPER('REGISTRO 32MM CH (CX C/ 50 UN) - NOVO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0389', 'REGISTRO 32MM CH (CX C/ 50 UN) - NOVO', 'Peças', 'produto', 'UN', '84818095',
      750, 806.1, 0, 0,
      50, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 389) | NCM: 84818095 | Preço Unit.: R$ 750,00 | Valor ST: R$ 56,10 | Preço c/ ST: R$ 806,10', v_fornecedor_id
    );
  END IF;

  -- Linha 390: PEC-0390 - REGISTRO CASCATA SPA LUXO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0390' OR UPPER(TRIM(nome)) = UPPER('REGISTRO CASCATA SPA LUXO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0390'),
        nome = 'REGISTRO CASCATA SPA LUXO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 170,
        preco_venda = 213.28,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 390) | NCM: 39269090 | Preço Unit.: R$ 170,00 | Valor ST: R$ 43,28 | Preço c/ ST: R$ 213,28',
        ativo = true
    WHERE codigo = 'PEC-0390' OR UPPER(TRIM(nome)) = UPPER('REGISTRO CASCATA SPA LUXO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0390', 'REGISTRO CASCATA SPA LUXO', 'Peças', 'produto', 'UN', '39269090',
      170, 213.28, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 390) | NCM: 39269090 | Preço Unit.: R$ 170,00 | Valor ST: R$ 43,28 | Preço c/ ST: R$ 213,28', v_fornecedor_id
    );
  END IF;

  -- Linha 391: PEC-0391 - REGISTRO DO DRENO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0391' OR UPPER(TRIM(nome)) = UPPER('REGISTRO DO DRENO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0391'),
        nome = 'REGISTRO DO DRENO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 50,
        preco_venda = 56.48,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 391) | NCM: 39174090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 6,48 | Preço c/ ST: R$ 56,48',
        ativo = true
    WHERE codigo = 'PEC-0391' OR UPPER(TRIM(nome)) = UPPER('REGISTRO DO DRENO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0391', 'REGISTRO DO DRENO', 'Peças', 'produto', 'UN', '39174090',
      50, 56.48, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 391) | NCM: 39174090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 6,48 | Preço c/ ST: R$ 56,48', v_fornecedor_id
    );
  END IF;

  -- Linha 392: PEC-0392 - REGISTRO ECO/G2/FULL 25MM (CX C/ 03 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0392' OR UPPER(TRIM(nome)) = UPPER('REGISTRO ECO/G2/FULL 25MM (CX C/ 03 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0392'),
        nome = 'REGISTRO ECO/G2/FULL 25MM (CX C/ 03 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 111,
        preco_venda = 125.39,
        unidades_por_compra = 3,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 392) | NCM: 39174090 | Preço Unit.: R$ 111,00 | Valor ST: R$ 14,39 | Preço c/ ST: R$ 125,39',
        ativo = true
    WHERE codigo = 'PEC-0392' OR UPPER(TRIM(nome)) = UPPER('REGISTRO ECO/G2/FULL 25MM (CX C/ 03 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0392', 'REGISTRO ECO/G2/FULL 25MM (CX C/ 03 UN)', 'Peças', 'produto', 'UN', '39174090',
      111, 125.39, 0, 0,
      3, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 392) | NCM: 39174090 | Preço Unit.: R$ 111,00 | Valor ST: R$ 14,39 | Preço c/ ST: R$ 125,39', v_fornecedor_id
    );
  END IF;

  -- Linha 393: PEC-0393 - REGISTRO G3 25MM (CX C/ 03 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0393' OR UPPER(TRIM(nome)) = UPPER('REGISTRO G3 25MM (CX C/ 03 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0393'),
        nome = 'REGISTRO G3 25MM (CX C/ 03 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 111,
        preco_venda = 125.39,
        unidades_por_compra = 3,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 393) | NCM: 39174090 | Preço Unit.: R$ 111,00 | Valor ST: R$ 14,39 | Preço c/ ST: R$ 125,39',
        ativo = true
    WHERE codigo = 'PEC-0393' OR UPPER(TRIM(nome)) = UPPER('REGISTRO G3 25MM (CX C/ 03 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0393', 'REGISTRO G3 25MM (CX C/ 03 UN)', 'Peças', 'produto', 'UN', '39174090',
      111, 125.39, 0, 0,
      3, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 393) | NCM: 39174090 | Preço Unit.: R$ 111,00 | Valor ST: R$ 14,39 | Preço c/ ST: R$ 125,39', v_fornecedor_id
    );
  END IF;

  -- Linha 394: PEC-0394 - REGISTRO G4 (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0394' OR UPPER(TRIM(nome)) = UPPER('REGISTRO G4 (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0394'),
        nome = 'REGISTRO G4 (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 225,
        preco_venda = 254.16,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 394) | NCM: 39174090 | Preço Unit.: R$ 225,00 | Valor ST: R$ 29,16 | Preço c/ ST: R$ 254,16',
        ativo = true
    WHERE codigo = 'PEC-0394' OR UPPER(TRIM(nome)) = UPPER('REGISTRO G4 (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0394', 'REGISTRO G4 (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      225, 254.16, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 394) | NCM: 39174090 | Preço Unit.: R$ 225,00 | Valor ST: R$ 29,16 | Preço c/ ST: R$ 254,16', v_fornecedor_id
    );
  END IF;

  -- Linha 395: PEC-0395 - REGISTRO G5 (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0395' OR UPPER(TRIM(nome)) = UPPER('REGISTRO G5 (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0395'),
        nome = 'REGISTRO G5 (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 225,
        preco_venda = 254.16,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 395) | NCM: 39174090 | Preço Unit.: R$ 225,00 | Valor ST: R$ 29,16 | Preço c/ ST: R$ 254,16',
        ativo = true
    WHERE codigo = 'PEC-0395' OR UPPER(TRIM(nome)) = UPPER('REGISTRO G5 (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0395', 'REGISTRO G5 (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      225, 254.16, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 395) | NCM: 39174090 | Preço Unit.: R$ 225,00 | Valor ST: R$ 29,16 | Preço c/ ST: R$ 254,16', v_fornecedor_id
    );
  END IF;

  -- Linha 396: PEC-0396 - REGISTRO G6 (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0396' OR UPPER(TRIM(nome)) = UPPER('REGISTRO G6 (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0396'),
        nome = 'REGISTRO G6 (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 225,
        preco_venda = 254.16,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 396) | NCM: 39174090 | Preço Unit.: R$ 225,00 | Valor ST: R$ 29,16 | Preço c/ ST: R$ 254,16',
        ativo = true
    WHERE codigo = 'PEC-0396' OR UPPER(TRIM(nome)) = UPPER('REGISTRO G6 (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0396', 'REGISTRO G6 (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      225, 254.16, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 396) | NCM: 39174090 | Preço Unit.: R$ 225,00 | Valor ST: R$ 29,16 | Preço c/ ST: R$ 254,16', v_fornecedor_id
    );
  END IF;

  -- Linha 397: PEC-0397 - REGISTRO G7 (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0397' OR UPPER(TRIM(nome)) = UPPER('REGISTRO G7 (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0397'),
        nome = 'REGISTRO G7 (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 225,
        preco_venda = 254.16,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 397) | NCM: 39174090 | Preço Unit.: R$ 225,00 | Valor ST: R$ 29,16 | Preço c/ ST: R$ 254,16',
        ativo = true
    WHERE codigo = 'PEC-0397' OR UPPER(TRIM(nome)) = UPPER('REGISTRO G7 (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0397', 'REGISTRO G7 (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      225, 254.16, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 397) | NCM: 39174090 | Preço Unit.: R$ 225,00 | Valor ST: R$ 29,16 | Preço c/ ST: R$ 254,16', v_fornecedor_id
    );
  END IF;

  -- Linha 398: PEC-0398 - REGISTRO KELVIN (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0398' OR UPPER(TRIM(nome)) = UPPER('REGISTRO KELVIN (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0398'),
        nome = 'REGISTRO KELVIN (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 195,
        preco_venda = 220.27,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 398) | NCM: 39174090 | Preço Unit.: R$ 195,00 | Valor ST: R$ 25,27 | Preço c/ ST: R$ 220,27',
        ativo = true
    WHERE codigo = 'PEC-0398' OR UPPER(TRIM(nome)) = UPPER('REGISTRO KELVIN (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0398', 'REGISTRO KELVIN (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      195, 220.27, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 398) | NCM: 39174090 | Preço Unit.: R$ 195,00 | Valor ST: R$ 25,27 | Preço c/ ST: R$ 220,27', v_fornecedor_id
    );
  END IF;

  -- Linha 399: PEC-0399 - REGISTRO SPLASH (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0399' OR UPPER(TRIM(nome)) = UPPER('REGISTRO SPLASH (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0399'),
        nome = 'REGISTRO SPLASH (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 225,
        preco_venda = 254.16,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 399) | NCM: 39174090 | Preço Unit.: R$ 225,00 | Valor ST: R$ 29,16 | Preço c/ ST: R$ 254,16',
        ativo = true
    WHERE codigo = 'PEC-0399' OR UPPER(TRIM(nome)) = UPPER('REGISTRO SPLASH (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0399', 'REGISTRO SPLASH (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      225, 254.16, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 399) | NCM: 39174090 | Preço Unit.: R$ 225,00 | Valor ST: R$ 29,16 | Preço c/ ST: R$ 254,16', v_fornecedor_id
    );
  END IF;

  -- Linha 400: PEC-0400 - REGISTRO SPLASH (CX C/ 05 UN) - NOVO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0400' OR UPPER(TRIM(nome)) = UPPER('REGISTRO SPLASH (CX C/ 05 UN) - NOVO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0400'),
        nome = 'REGISTRO SPLASH (CX C/ 05 UN) - NOVO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 225,
        preco_venda = 254.16,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 400) | NCM: 39174090 | Preço Unit.: R$ 225,00 | Valor ST: R$ 29,16 | Preço c/ ST: R$ 254,16',
        ativo = true
    WHERE codigo = 'PEC-0400' OR UPPER(TRIM(nome)) = UPPER('REGISTRO SPLASH (CX C/ 05 UN) - NOVO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0400', 'REGISTRO SPLASH (CX C/ 05 UN) - NOVO', 'Peças', 'produto', 'UN', '39174090',
      225, 254.16, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 400) | NCM: 39174090 | Preço Unit.: R$ 225,00 | Valor ST: R$ 29,16 | Preço c/ ST: R$ 254,16', v_fornecedor_id
    );
  END IF;

  -- Linha 401: PEC-0401 - REGUA ADESIVA CLORADOR
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0401' OR UPPER(TRIM(nome)) = UPPER('REGUA ADESIVA CLORADOR')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0401'),
        nome = 'REGUA ADESIVA CLORADOR',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '49111090',
        preco_custo = 0.46,
        preco_venda = 0.46,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 401) | NCM: 49111090 | Preço Unit.: R$ 0,46 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 0,46',
        ativo = true
    WHERE codigo = 'PEC-0401' OR UPPER(TRIM(nome)) = UPPER('REGUA ADESIVA CLORADOR');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0401', 'REGUA ADESIVA CLORADOR', 'Peças', 'produto', 'UN', '49111090',
      0.46, 0.46, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 401) | NCM: 49111090 | Preço Unit.: R$ 0,46 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 0,46', v_fornecedor_id
    );
  END IF;

  -- Linha 402: PEC-0402 - REGUA ADESIVA LIGACAO BLOCO ELETRONIC SY
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0402' OR UPPER(TRIM(nome)) = UPPER('REGUA ADESIVA LIGACAO BLOCO ELETRONIC SY')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0402'),
        nome = 'REGUA ADESIVA LIGACAO BLOCO ELETRONIC SY',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '49111090',
        preco_custo = 4,
        preco_venda = 4,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 402) | NCM: 49111090 | Preço Unit.: R$ 4,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 4,00',
        ativo = true
    WHERE codigo = 'PEC-0402' OR UPPER(TRIM(nome)) = UPPER('REGUA ADESIVA LIGACAO BLOCO ELETRONIC SY');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0402', 'REGUA ADESIVA LIGACAO BLOCO ELETRONIC SY', 'Peças', 'produto', 'UN', '49111090',
      4, 4, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 402) | NCM: 49111090 | Preço Unit.: R$ 4,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 4,00', v_fornecedor_id
    );
  END IF;

  -- Linha 403: PEC-0403 - REGUA DE LIGACAO FILTRO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0403' OR UPPER(TRIM(nome)) = UPPER('REGUA DE LIGACAO FILTRO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0403'),
        nome = 'REGUA DE LIGACAO FILTRO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '35069120',
        preco_custo = 2,
        preco_venda = 2,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 403) | NCM: 35069120 | Preço Unit.: R$ 2,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2,00',
        ativo = true
    WHERE codigo = 'PEC-0403' OR UPPER(TRIM(nome)) = UPPER('REGUA DE LIGACAO FILTRO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0403', 'REGUA DE LIGACAO FILTRO', 'Peças', 'produto', 'UN', '35069120',
      2, 2, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 403) | NCM: 35069120 | Preço Unit.: R$ 2,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2,00', v_fornecedor_id
    );
  END IF;

  -- Linha 404: PEC-0404 - REGUA DE LIGACAO FILTRO COMFORT CLORADOR
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0404' OR UPPER(TRIM(nome)) = UPPER('REGUA DE LIGACAO FILTRO COMFORT CLORADOR')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0404'),
        nome = 'REGUA DE LIGACAO FILTRO COMFORT CLORADOR',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '35069120',
        preco_custo = 2,
        preco_venda = 2,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 404) | NCM: 35069120 | Preço Unit.: R$ 2,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2,00',
        ativo = true
    WHERE codigo = 'PEC-0404' OR UPPER(TRIM(nome)) = UPPER('REGUA DE LIGACAO FILTRO COMFORT CLORADOR');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0404', 'REGUA DE LIGACAO FILTRO COMFORT CLORADOR', 'Peças', 'produto', 'UN', '35069120',
      2, 2, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 404) | NCM: 35069120 | Preço Unit.: R$ 2,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 2,00', v_fornecedor_id
    );
  END IF;

  -- Linha 405: PEC-0405 - RESERVATORIO DOSADOR SOLO G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0405' OR UPPER(TRIM(nome)) = UPPER('RESERVATORIO DOSADOR SOLO G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0405'),
        nome = 'RESERVATORIO DOSADOR SOLO G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 100,
        preco_venda = 125.46,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 405) | NCM: 39269090 | Preço Unit.: R$ 100,00 | Valor ST: R$ 25,46 | Preço c/ ST: R$ 125,46',
        ativo = true
    WHERE codigo = 'PEC-0405' OR UPPER(TRIM(nome)) = UPPER('RESERVATORIO DOSADOR SOLO G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0405', 'RESERVATORIO DOSADOR SOLO G4', 'Peças', 'produto', 'UN', '39269090',
      100, 125.46, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 405) | NCM: 39269090 | Preço Unit.: R$ 100,00 | Valor ST: R$ 25,46 | Preço c/ ST: R$ 125,46', v_fornecedor_id
    );
  END IF;

  -- Linha 406: PEC-0406 - ROSCA BASE EDEM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0406' OR UPPER(TRIM(nome)) = UPPER('ROSCA BASE EDEM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0406'),
        nome = 'ROSCA BASE EDEM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 2,
        preco_venda = 2.26,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 406) | NCM: 39174090 | Preço Unit.: R$ 2,00 | Valor ST: R$ 0,26 | Preço c/ ST: R$ 2,26',
        ativo = true
    WHERE codigo = 'PEC-0406' OR UPPER(TRIM(nome)) = UPPER('ROSCA BASE EDEM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0406', 'ROSCA BASE EDEM', 'Peças', 'produto', 'UN', '39174090',
      2, 2.26, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 406) | NCM: 39174090 | Preço Unit.: R$ 2,00 | Valor ST: R$ 0,26 | Preço c/ ST: R$ 2,26', v_fornecedor_id
    );
  END IF;

  -- Linha 407: PEC-0407 - ROSCA DA UNIAO 40MM (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0407' OR UPPER(TRIM(nome)) = UPPER('ROSCA DA UNIAO 40MM (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0407'),
        nome = 'ROSCA DA UNIAO 40MM (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 55,
        preco_venda = 62.13,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 407) | NCM: 39174090 | Preço Unit.: R$ 55,00 | Valor ST: R$ 7,13 | Preço c/ ST: R$ 62,13',
        ativo = true
    WHERE codigo = 'PEC-0407' OR UPPER(TRIM(nome)) = UPPER('ROSCA DA UNIAO 40MM (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0407', 'ROSCA DA UNIAO 40MM (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      55, 62.13, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 407) | NCM: 39174090 | Preço Unit.: R$ 55,00 | Valor ST: R$ 7,13 | Preço c/ ST: R$ 62,13', v_fornecedor_id
    );
  END IF;

  -- Linha 408: PEC-0408 - ROSCA DO ADAPTADOR DO REG (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0408' OR UPPER(TRIM(nome)) = UPPER('ROSCA DO ADAPTADOR DO REG (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0408'),
        nome = 'ROSCA DO ADAPTADOR DO REG (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 39,
        preco_venda = 44.05,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 408) | NCM: 39174090 | Preço Unit.: R$ 39,00 | Valor ST: R$ 5,05 | Preço c/ ST: R$ 44,05',
        ativo = true
    WHERE codigo = 'PEC-0408' OR UPPER(TRIM(nome)) = UPPER('ROSCA DO ADAPTADOR DO REG (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0408', 'ROSCA DO ADAPTADOR DO REG (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39174090',
      39, 44.05, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 408) | NCM: 39174090 | Preço Unit.: R$ 39,00 | Valor ST: R$ 5,05 | Preço c/ ST: R$ 44,05', v_fornecedor_id
    );
  END IF;

  -- Linha 409: PEC-0409 - ROSCA DO DISPOSITIVO (CX C/10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0409' OR UPPER(TRIM(nome)) = UPPER('ROSCA DO DISPOSITIVO (CX C/10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0409'),
        nome = 'ROSCA DO DISPOSITIVO (CX C/10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 30,
        preco_venda = 33.89,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 409) | NCM: 39174090 | Preço Unit.: R$ 30,00 | Valor ST: R$ 3,89 | Preço c/ ST: R$ 33,89',
        ativo = true
    WHERE codigo = 'PEC-0409' OR UPPER(TRIM(nome)) = UPPER('ROSCA DO DISPOSITIVO (CX C/10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0409', 'ROSCA DO DISPOSITIVO (CX C/10 UN)', 'Peças', 'produto', 'UN', '39174090',
      30, 33.89, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 409) | NCM: 39174090 | Preço Unit.: R$ 30,00 | Valor ST: R$ 3,89 | Preço c/ ST: R$ 33,89', v_fornecedor_id
    );
  END IF;

  -- Linha 410: PEC-0410 - ROSCA DO REG DE 25 MM (CX C/10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0410' OR UPPER(TRIM(nome)) = UPPER('ROSCA DO REG DE 25 MM (CX C/10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0410'),
        nome = 'ROSCA DO REG DE 25 MM (CX C/10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 35,
        preco_venda = 39.54,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 410) | NCM: 39174090 | Preço Unit.: R$ 35,00 | Valor ST: R$ 4,54 | Preço c/ ST: R$ 39,54',
        ativo = true
    WHERE codigo = 'PEC-0410' OR UPPER(TRIM(nome)) = UPPER('ROSCA DO REG DE 25 MM (CX C/10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0410', 'ROSCA DO REG DE 25 MM (CX C/10 UN)', 'Peças', 'produto', 'UN', '39174090',
      35, 39.54, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 410) | NCM: 39174090 | Preço Unit.: R$ 35,00 | Valor ST: R$ 4,54 | Preço c/ ST: R$ 39,54', v_fornecedor_id
    );
  END IF;

  -- Linha 411: PEC-0411 - ROSCA DO REGISTRO G3/ECO CX C/10
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0411' OR UPPER(TRIM(nome)) = UPPER('ROSCA DO REGISTRO G3/ECO CX C/10')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0411'),
        nome = 'ROSCA DO REGISTRO G3/ECO CX C/10',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 35,
        preco_venda = 39.54,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 411) | NCM: 39174090 | Preço Unit.: R$ 35,00 | Valor ST: R$ 4,54 | Preço c/ ST: R$ 39,54',
        ativo = true
    WHERE codigo = 'PEC-0411' OR UPPER(TRIM(nome)) = UPPER('ROSCA DO REGISTRO G3/ECO CX C/10');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0411', 'ROSCA DO REGISTRO G3/ECO CX C/10', 'Peças', 'produto', 'UN', '39174090',
      35, 39.54, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 411) | NCM: 39174090 | Preço Unit.: R$ 35,00 | Valor ST: R$ 4,54 | Preço c/ ST: R$ 39,54', v_fornecedor_id
    );
  END IF;

  -- Linha 412: PEC-0412 - ROSCA DO VISOR MOTOBOMBA/ESCORVANTE (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0412' OR UPPER(TRIM(nome)) = UPPER('ROSCA DO VISOR MOTOBOMBA/ESCORVANTE (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0412'),
        nome = 'ROSCA DO VISOR MOTOBOMBA/ESCORVANTE (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 110,
        preco_venda = 124.26,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 412) | NCM: 39174090 | Preço Unit.: R$ 110,00 | Valor ST: R$ 14,26 | Preço c/ ST: R$ 124,26',
        ativo = true
    WHERE codigo = 'PEC-0412' OR UPPER(TRIM(nome)) = UPPER('ROSCA DO VISOR MOTOBOMBA/ESCORVANTE (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0412', 'ROSCA DO VISOR MOTOBOMBA/ESCORVANTE (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      110, 124.26, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 412) | NCM: 39174090 | Preço Unit.: R$ 110,00 | Valor ST: R$ 14,26 | Preço c/ ST: R$ 124,26', v_fornecedor_id
    );
  END IF;

  -- Linha 413: PEC-0413 - ROSCA FLANGE 150 (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0413' OR UPPER(TRIM(nome)) = UPPER('ROSCA FLANGE 150 (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0413'),
        nome = 'ROSCA FLANGE 150 (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 95,
        preco_venda = 107.31,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 413) | NCM: 39174090 | Preço Unit.: R$ 95,00 | Valor ST: R$ 12,31 | Preço c/ ST: R$ 107,31',
        ativo = true
    WHERE codigo = 'PEC-0413' OR UPPER(TRIM(nome)) = UPPER('ROSCA FLANGE 150 (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0413', 'ROSCA FLANGE 150 (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      95, 107.31, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 413) | NCM: 39174090 | Preço Unit.: R$ 95,00 | Valor ST: R$ 12,31 | Preço c/ ST: R$ 107,31', v_fornecedor_id
    );
  END IF;

  -- Linha 414: PEC-0414 - ROSCA TRASEIRA DO REG 32 CX C/10
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0414' OR UPPER(TRIM(nome)) = UPPER('ROSCA TRASEIRA DO REG 32 CX C/10')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0414'),
        nome = 'ROSCA TRASEIRA DO REG 32 CX C/10',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 40,
        preco_venda = 45.18,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 414) | NCM: 39174090 | Preço Unit.: R$ 40,00 | Valor ST: R$ 5,18 | Preço c/ ST: R$ 45,18',
        ativo = true
    WHERE codigo = 'PEC-0414' OR UPPER(TRIM(nome)) = UPPER('ROSCA TRASEIRA DO REG 32 CX C/10');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0414', 'ROSCA TRASEIRA DO REG 32 CX C/10', 'Peças', 'produto', 'UN', '39174090',
      40, 45.18, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 414) | NCM: 39174090 | Preço Unit.: R$ 40,00 | Valor ST: R$ 5,18 | Preço c/ ST: R$ 45,18', v_fornecedor_id
    );
  END IF;

  -- Linha 415: PEC-0415 - ROTOR 1/2 CV (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0415' OR UPPER(TRIM(nome)) = UPPER('ROTOR 1/2 CV (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0415'),
        nome = 'ROTOR 1/2 CV (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84139200',
        preco_custo = 175,
        preco_venda = 175,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 415) | NCM: 84139200 | Preço Unit.: R$ 175,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 175,00',
        ativo = true
    WHERE codigo = 'PEC-0415' OR UPPER(TRIM(nome)) = UPPER('ROTOR 1/2 CV (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0415', 'ROTOR 1/2 CV (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '84139200',
      175, 175, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 415) | NCM: 84139200 | Preço Unit.: R$ 175,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 175,00', v_fornecedor_id
    );
  END IF;

  -- Linha 416: PEC-0416 - ROTOR 1/2 CV EIXO FINO (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0416' OR UPPER(TRIM(nome)) = UPPER('ROTOR 1/2 CV EIXO FINO (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0416'),
        nome = 'ROTOR 1/2 CV EIXO FINO (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84139200',
        preco_custo = 140,
        preco_venda = 140,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 416) | NCM: 84139200 | Preço Unit.: R$ 140,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 140,00',
        ativo = true
    WHERE codigo = 'PEC-0416' OR UPPER(TRIM(nome)) = UPPER('ROTOR 1/2 CV EIXO FINO (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0416', 'ROTOR 1/2 CV EIXO FINO (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '84139200',
      140, 140, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 416) | NCM: 84139200 | Preço Unit.: R$ 140,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 140,00', v_fornecedor_id
    );
  END IF;

  -- Linha 417: PEC-0417 - ROTOR 3/4 CV (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0417' OR UPPER(TRIM(nome)) = UPPER('ROTOR 3/4 CV (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0417'),
        nome = 'ROTOR 3/4 CV (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84139200',
        preco_custo = 175,
        preco_venda = 175,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 417) | NCM: 84139200 | Preço Unit.: R$ 175,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 175,00',
        ativo = true
    WHERE codigo = 'PEC-0417' OR UPPER(TRIM(nome)) = UPPER('ROTOR 3/4 CV (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0417', 'ROTOR 3/4 CV (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '84139200',
      175, 175, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 417) | NCM: 84139200 | Preço Unit.: R$ 175,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 175,00', v_fornecedor_id
    );
  END IF;

  -- Linha 418: PEC-0418 - SELO MECANICO (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0418' OR UPPER(TRIM(nome)) = UPPER('SELO MECANICO (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0418'),
        nome = 'SELO MECANICO (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84842000',
        preco_custo = 130,
        preco_venda = 130,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 418) | NCM: 84842000 | Preço Unit.: R$ 130,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 130,00',
        ativo = true
    WHERE codigo = 'PEC-0418' OR UPPER(TRIM(nome)) = UPPER('SELO MECANICO (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0418', 'SELO MECANICO (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '84842000',
      130, 130, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 418) | NCM: 84842000 | Preço Unit.: R$ 130,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 130,00', v_fornecedor_id
    );
  END IF;

  -- Linha 419: PEC-0419 - SENSOR ALTA PRESSÃO THERMAS
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0419' OR UPPER(TRIM(nome)) = UPPER('SENSOR ALTA PRESSÃO THERMAS')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0419'),
        nome = 'SENSOR ALTA PRESSÃO THERMAS',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 150,
        preco_venda = 150,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 419) | NCM: 84189900 | Preço Unit.: R$ 150,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 150,00',
        ativo = true
    WHERE codigo = 'PEC-0419' OR UPPER(TRIM(nome)) = UPPER('SENSOR ALTA PRESSÃO THERMAS');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0419', 'SENSOR ALTA PRESSÃO THERMAS', 'Peças', 'produto', 'UN', '84189900',
      150, 150, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 419) | NCM: 84189900 | Preço Unit.: R$ 150,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 150,00', v_fornecedor_id
    );
  END IF;

  -- Linha 420: PEC-0420 - SENSOR BAIXA PRESSÃO THERMAS
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0420' OR UPPER(TRIM(nome)) = UPPER('SENSOR BAIXA PRESSÃO THERMAS')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0420'),
        nome = 'SENSOR BAIXA PRESSÃO THERMAS',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 150,
        preco_venda = 150,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 420) | NCM: 84189900 | Preço Unit.: R$ 150,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 150,00',
        ativo = true
    WHERE codigo = 'PEC-0420' OR UPPER(TRIM(nome)) = UPPER('SENSOR BAIXA PRESSÃO THERMAS');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0420', 'SENSOR BAIXA PRESSÃO THERMAS', 'Peças', 'produto', 'UN', '84189900',
      150, 150, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 420) | NCM: 84189900 | Preço Unit.: R$ 150,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 150,00', v_fornecedor_id
    );
  END IF;

  -- Linha 421: PEC-0421 - SENSOR DE AGUA ENTRADA E SAIDA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0421' OR UPPER(TRIM(nome)) = UPPER('SENSOR DE AGUA ENTRADA E SAIDA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0421'),
        nome = 'SENSOR DE AGUA ENTRADA E SAIDA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 100,
        preco_venda = 100,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 421) | NCM: 84189900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 100,00',
        ativo = true
    WHERE codigo = 'PEC-0421' OR UPPER(TRIM(nome)) = UPPER('SENSOR DE AGUA ENTRADA E SAIDA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0421', 'SENSOR DE AGUA ENTRADA E SAIDA', 'Peças', 'produto', 'UN', '84189900',
      100, 100, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 421) | NCM: 84189900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 100,00', v_fornecedor_id
    );
  END IF;

  -- Linha 422: PEC-0422 - SENSOR DE FLUXO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0422' OR UPPER(TRIM(nome)) = UPPER('SENSOR DE FLUXO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0422'),
        nome = 'SENSOR DE FLUXO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 210,
        preco_venda = 210,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 422) | NCM: 84189900 | Preço Unit.: R$ 210,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 210,00',
        ativo = true
    WHERE codigo = 'PEC-0422' OR UPPER(TRIM(nome)) = UPPER('SENSOR DE FLUXO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0422', 'SENSOR DE FLUXO', 'Peças', 'produto', 'UN', '84189900',
      210, 210, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 422) | NCM: 84189900 | Preço Unit.: R$ 210,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 210,00', v_fornecedor_id
    );
  END IF;

  -- Linha 423: PEC-0423 - SENSOR DE NIVEL GERADOR VAPOR SAUNA CLUB
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0423' OR UPPER(TRIM(nome)) = UPPER('SENSOR DE NIVEL GERADOR VAPOR SAUNA CLUB')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0423'),
        nome = 'SENSOR DE NIVEL GERADOR VAPOR SAUNA CLUB',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '90261011',
        preco_custo = 55,
        preco_venda = 55,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 423) | NCM: 90261011 | Preço Unit.: R$ 55,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 55,00',
        ativo = true
    WHERE codigo = 'PEC-0423' OR UPPER(TRIM(nome)) = UPPER('SENSOR DE NIVEL GERADOR VAPOR SAUNA CLUB');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0423', 'SENSOR DE NIVEL GERADOR VAPOR SAUNA CLUB', 'Peças', 'produto', 'UN', '90261011',
      55, 55, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 423) | NCM: 90261011 | Preço Unit.: R$ 55,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 55,00', v_fornecedor_id
    );
  END IF;

  -- Linha 424: PEC-0424 - SENSOR DE TEMP. PARA BOMBA DE AQUECIMENTO WBR12.5H-A3
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0424' OR UPPER(TRIM(nome)) = UPPER('SENSOR DE TEMP. PARA BOMBA DE AQUECIMENTO WBR12.5H-A3')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0424'),
        nome = 'SENSOR DE TEMP. PARA BOMBA DE AQUECIMENTO WBR12.5H-A3',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 60,
        preco_venda = 60,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 424) | NCM: 84189900 | Preço Unit.: R$ 60,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 60,00',
        ativo = true
    WHERE codigo = 'PEC-0424' OR UPPER(TRIM(nome)) = UPPER('SENSOR DE TEMP. PARA BOMBA DE AQUECIMENTO WBR12.5H-A3');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0424', 'SENSOR DE TEMP. PARA BOMBA DE AQUECIMENTO WBR12.5H-A3', 'Peças', 'produto', 'UN', '84189900',
      60, 60, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 424) | NCM: 84189900 | Preço Unit.: R$ 60,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 60,00', v_fornecedor_id
    );
  END IF;

  -- Linha 425: PEC-0425 - SENSOR DE TEMP. PARA BOMBA DE AQUECIMENTO WBR4.5H-A3
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0425' OR UPPER(TRIM(nome)) = UPPER('SENSOR DE TEMP. PARA BOMBA DE AQUECIMENTO WBR4.5H-A3')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0425'),
        nome = 'SENSOR DE TEMP. PARA BOMBA DE AQUECIMENTO WBR4.5H-A3',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 60,
        preco_venda = 60,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 425) | NCM: 84189900 | Preço Unit.: R$ 60,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 60,00',
        ativo = true
    WHERE codigo = 'PEC-0425' OR UPPER(TRIM(nome)) = UPPER('SENSOR DE TEMP. PARA BOMBA DE AQUECIMENTO WBR4.5H-A3');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0425', 'SENSOR DE TEMP. PARA BOMBA DE AQUECIMENTO WBR4.5H-A3', 'Peças', 'produto', 'UN', '84189900',
      60, 60, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 425) | NCM: 84189900 | Preço Unit.: R$ 60,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 60,00', v_fornecedor_id
    );
  END IF;

  -- Linha 426: PEC-0426 - SENSOR DE TEMP. PARA BOMBA DE AQUECIMENTO WBR7.8H-A3
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0426' OR UPPER(TRIM(nome)) = UPPER('SENSOR DE TEMP. PARA BOMBA DE AQUECIMENTO WBR7.8H-A3')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0426'),
        nome = 'SENSOR DE TEMP. PARA BOMBA DE AQUECIMENTO WBR7.8H-A3',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 60,
        preco_venda = 60,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 426) | NCM: 84189900 | Preço Unit.: R$ 60,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 60,00',
        ativo = true
    WHERE codigo = 'PEC-0426' OR UPPER(TRIM(nome)) = UPPER('SENSOR DE TEMP. PARA BOMBA DE AQUECIMENTO WBR7.8H-A3');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0426', 'SENSOR DE TEMP. PARA BOMBA DE AQUECIMENTO WBR7.8H-A3', 'Peças', 'produto', 'UN', '84189900',
      60, 60, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 426) | NCM: 84189900 | Preço Unit.: R$ 60,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 60,00', v_fornecedor_id
    );
  END IF;

  -- Linha 427: PEC-0427 - SERRA COPO PROGEU 150MM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0427' OR UPPER(TRIM(nome)) = UPPER('SERRA COPO PROGEU 150MM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0427'),
        nome = 'SERRA COPO PROGEU 150MM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '82079000',
        preco_custo = 1100,
        preco_venda = 1239.44,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 427) | NCM: 82079000 | Preço Unit.: R$ 1.100,00 | Valor ST: R$ 139,44 | Preço c/ ST: R$ 1.239,44',
        ativo = true
    WHERE codigo = 'PEC-0427' OR UPPER(TRIM(nome)) = UPPER('SERRA COPO PROGEU 150MM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0427', 'SERRA COPO PROGEU 150MM', 'Peças', 'produto', 'UN', '82079000',
      1100, 1239.44, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 427) | NCM: 82079000 | Preço Unit.: R$ 1.100,00 | Valor ST: R$ 139,44 | Preço c/ ST: R$ 1.239,44', v_fornecedor_id
    );
  END IF;

  -- Linha 428: PEC-0428 - SKIMMER DO SPA LUXO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0428' OR UPPER(TRIM(nome)) = UPPER('SKIMMER DO SPA LUXO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0428'),
        nome = 'SKIMMER DO SPA LUXO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 890,
        preco_venda = 1116.6,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 428) | NCM: 39269090 | Preço Unit.: R$ 890,00 | Valor ST: R$ 226,60 | Preço c/ ST: R$ 1.116,60',
        ativo = true
    WHERE codigo = 'PEC-0428' OR UPPER(TRIM(nome)) = UPPER('SKIMMER DO SPA LUXO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0428', 'SKIMMER DO SPA LUXO', 'Peças', 'produto', 'UN', '39269090',
      890, 1116.6, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 428) | NCM: 39269090 | Preço Unit.: R$ 890,00 | Valor ST: R$ 226,60 | Preço c/ ST: R$ 1.116,60', v_fornecedor_id
    );
  END IF;

  -- Linha 429: PEC-0429 - SKIMMER FILTRANTE G5/G6
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0429' OR UPPER(TRIM(nome)) = UPPER('SKIMMER FILTRANTE G5/G6')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0429'),
        nome = 'SKIMMER FILTRANTE G5/G6',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 400,
        preco_venda = 501.84,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 429) | NCM: 39269090 | Preço Unit.: R$ 400,00 | Valor ST: R$ 101,84 | Preço c/ ST: R$ 501,84',
        ativo = true
    WHERE codigo = 'PEC-0429' OR UPPER(TRIM(nome)) = UPPER('SKIMMER FILTRANTE G5/G6');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0429', 'SKIMMER FILTRANTE G5/G6', 'Peças', 'produto', 'UN', '39269090',
      400, 501.84, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 429) | NCM: 39269090 | Preço Unit.: R$ 400,00 | Valor ST: R$ 101,84 | Preço c/ ST: R$ 501,84', v_fornecedor_id
    );
  END IF;

  -- Linha 430: PEC-0430 - SKIMMER FILTRANTE G7
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0430' OR UPPER(TRIM(nome)) = UPPER('SKIMMER FILTRANTE G7')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0430'),
        nome = 'SKIMMER FILTRANTE G7',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 400,
        preco_venda = 501.84,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 430) | NCM: 39269090 | Preço Unit.: R$ 400,00 | Valor ST: R$ 101,84 | Preço c/ ST: R$ 501,84',
        ativo = true
    WHERE codigo = 'PEC-0430' OR UPPER(TRIM(nome)) = UPPER('SKIMMER FILTRANTE G7');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0430', 'SKIMMER FILTRANTE G7', 'Peças', 'produto', 'UN', '39269090',
      400, 501.84, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 430) | NCM: 39269090 | Preço Unit.: R$ 400,00 | Valor ST: R$ 101,84 | Preço c/ ST: R$ 501,84', v_fornecedor_id
    );
  END IF;

  -- Linha 431: PEC-0431 - SKIMMER FILTRANTE SPLASH DRY PUMP
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0431' OR UPPER(TRIM(nome)) = UPPER('SKIMMER FILTRANTE SPLASH DRY PUMP')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0431'),
        nome = 'SKIMMER FILTRANTE SPLASH DRY PUMP',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 390,
        preco_venda = 489.3,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 431) | NCM: 39269090 | Preço Unit.: R$ 390,00 | Valor ST: R$ 99,30 | Preço c/ ST: R$ 489,30',
        ativo = true
    WHERE codigo = 'PEC-0431' OR UPPER(TRIM(nome)) = UPPER('SKIMMER FILTRANTE SPLASH DRY PUMP');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0431', 'SKIMMER FILTRANTE SPLASH DRY PUMP', 'Peças', 'produto', 'UN', '39269090',
      390, 489.3, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 431) | NCM: 39269090 | Preço Unit.: R$ 390,00 | Valor ST: R$ 99,30 | Preço c/ ST: R$ 489,30', v_fornecedor_id
    );
  END IF;

  -- Linha 432: PEC-0432 - SOBRE TAMPA ELETRONIC SISTEM COM ETIQUETA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0432' OR UPPER(TRIM(nome)) = UPPER('SOBRE TAMPA ELETRONIC SISTEM COM ETIQUETA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0432'),
        nome = 'SOBRE TAMPA ELETRONIC SISTEM COM ETIQUETA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 55,
        preco_venda = 62.13,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 432) | NCM: 39172900 | Preço Unit.: R$ 55,00 | Valor ST: R$ 7,13 | Preço c/ ST: R$ 62,13',
        ativo = true
    WHERE codigo = 'PEC-0432' OR UPPER(TRIM(nome)) = UPPER('SOBRE TAMPA ELETRONIC SISTEM COM ETIQUETA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0432', 'SOBRE TAMPA ELETRONIC SISTEM COM ETIQUETA', 'Peças', 'produto', 'UN', '39172900',
      55, 62.13, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 432) | NCM: 39172900 | Preço Unit.: R$ 55,00 | Valor ST: R$ 7,13 | Preço c/ ST: R$ 62,13', v_fornecedor_id
    );
  END IF;

  -- Linha 433: PEC-0433 - SOQUETE LAMPADA U.V.
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0433' OR UPPER(TRIM(nome)) = UPPER('SOQUETE LAMPADA U.V.')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0433'),
        nome = 'SOQUETE LAMPADA U.V.',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85366100',
        preco_custo = 18,
        preco_venda = 20.09,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 433) | NCM: 85366100 | Preço Unit.: R$ 18,00 | Valor ST: R$ 2,09 | Preço c/ ST: R$ 20,09',
        ativo = true
    WHERE codigo = 'PEC-0433' OR UPPER(TRIM(nome)) = UPPER('SOQUETE LAMPADA U.V.');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0433', 'SOQUETE LAMPADA U.V.', 'Peças', 'produto', 'UN', '85366100',
      18, 20.09, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 433) | NCM: 85366100 | Preço Unit.: R$ 18,00 | Valor ST: R$ 2,09 | Preço c/ ST: R$ 20,09', v_fornecedor_id
    );
  END IF;

  -- Linha 434: PEC-0434 - SUPORTE DO MOTOR
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0434' OR UPPER(TRIM(nome)) = UPPER('SUPORTE DO MOTOR')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0434'),
        nome = 'SUPORTE DO MOTOR',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 3,
        preco_venda = 3.39,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 434) | NCM: 39174090 | Preço Unit.: R$ 3,00 | Valor ST: R$ 0,39 | Preço c/ ST: R$ 3,39',
        ativo = true
    WHERE codigo = 'PEC-0434' OR UPPER(TRIM(nome)) = UPPER('SUPORTE DO MOTOR');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0434', 'SUPORTE DO MOTOR', 'Peças', 'produto', 'UN', '39174090',
      3, 3.39, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 434) | NCM: 39174090 | Preço Unit.: R$ 3,00 | Valor ST: R$ 0,39 | Preço c/ ST: R$ 3,39', v_fornecedor_id
    );
  END IF;

  -- Linha 435: PEC-0435 - SUPORTE GRADE THERMAS KELVIN WBR 12.5H
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0435' OR UPPER(TRIM(nome)) = UPPER('SUPORTE GRADE THERMAS KELVIN WBR 12.5H')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0435'),
        nome = 'SUPORTE GRADE THERMAS KELVIN WBR 12.5H',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 1000,
        preco_venda = 1000,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 435) | NCM: 84189900 | Preço Unit.: R$ 1.000,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.000,00',
        ativo = true
    WHERE codigo = 'PEC-0435' OR UPPER(TRIM(nome)) = UPPER('SUPORTE GRADE THERMAS KELVIN WBR 12.5H');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0435', 'SUPORTE GRADE THERMAS KELVIN WBR 12.5H', 'Peças', 'produto', 'UN', '84189900',
      1000, 1000, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 435) | NCM: 84189900 | Preço Unit.: R$ 1.000,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 1.000,00', v_fornecedor_id
    );
  END IF;

  -- Linha 436: PEC-0436 - SUPORTE GRADE THERMAS KELVIN WBR4.5H-A
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0436' OR UPPER(TRIM(nome)) = UPPER('SUPORTE GRADE THERMAS KELVIN WBR4.5H-A')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0436'),
        nome = 'SUPORTE GRADE THERMAS KELVIN WBR4.5H-A',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 560,
        preco_venda = 560,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 436) | NCM: 84189900 | Preço Unit.: R$ 560,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 560,00',
        ativo = true
    WHERE codigo = 'PEC-0436' OR UPPER(TRIM(nome)) = UPPER('SUPORTE GRADE THERMAS KELVIN WBR4.5H-A');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0436', 'SUPORTE GRADE THERMAS KELVIN WBR4.5H-A', 'Peças', 'produto', 'UN', '84189900',
      560, 560, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 436) | NCM: 84189900 | Preço Unit.: R$ 560,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 560,00', v_fornecedor_id
    );
  END IF;

  -- Linha 437: PEC-0437 - SUPORTE GRADE THERMAS KELVIN WBR7.8H-A
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0437' OR UPPER(TRIM(nome)) = UPPER('SUPORTE GRADE THERMAS KELVIN WBR7.8H-A')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0437'),
        nome = 'SUPORTE GRADE THERMAS KELVIN WBR7.8H-A',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 815,
        preco_venda = 815,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 437) | NCM: 84189900 | Preço Unit.: R$ 815,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 815,00',
        ativo = true
    WHERE codigo = 'PEC-0437' OR UPPER(TRIM(nome)) = UPPER('SUPORTE GRADE THERMAS KELVIN WBR7.8H-A');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0437', 'SUPORTE GRADE THERMAS KELVIN WBR7.8H-A', 'Peças', 'produto', 'UN', '84189900',
      815, 815, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 437) | NCM: 84189900 | Preço Unit.: R$ 815,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 815,00', v_fornecedor_id
    );
  END IF;

  -- Linha 438: PEC-0438 - SUSPIRO DA HIDRO (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0438' OR UPPER(TRIM(nome)) = UPPER('SUSPIRO DA HIDRO (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0438'),
        nome = 'SUSPIRO DA HIDRO (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 40,
        preco_venda = 45.18,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 438) | NCM: 39174090 | Preço Unit.: R$ 40,00 | Valor ST: R$ 5,18 | Preço c/ ST: R$ 45,18',
        ativo = true
    WHERE codigo = 'PEC-0438' OR UPPER(TRIM(nome)) = UPPER('SUSPIRO DA HIDRO (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0438', 'SUSPIRO DA HIDRO (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39174090',
      40, 45.18, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 438) | NCM: 39174090 | Preço Unit.: R$ 40,00 | Valor ST: R$ 5,18 | Preço c/ ST: R$ 45,18', v_fornecedor_id
    );
  END IF;

  -- Linha 439: PEC-0439 - SWITH INTELIGENTE LED
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0439' OR UPPER(TRIM(nome)) = UPPER('SWITH INTELIGENTE LED')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0439'),
        nome = 'SWITH INTELIGENTE LED',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85365090',
        preco_custo = 300,
        preco_venda = 334.3,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 439) | NCM: 85365090 | Preço Unit.: R$ 300,00 | Valor ST: R$ 34,30 | Preço c/ ST: R$ 334,30',
        ativo = true
    WHERE codigo = 'PEC-0439' OR UPPER(TRIM(nome)) = UPPER('SWITH INTELIGENTE LED');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0439', 'SWITH INTELIGENTE LED', 'Peças', 'produto', 'UN', '85365090',
      300, 334.3, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 439) | NCM: 85365090 | Preço Unit.: R$ 300,00 | Valor ST: R$ 34,30 | Preço c/ ST: R$ 334,30', v_fornecedor_id
    );
  END IF;

  -- Linha 440: PEC-0440 - TAMPA AQUANIVEL DRY PUMP
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0440' OR UPPER(TRIM(nome)) = UPPER('TAMPA AQUANIVEL DRY PUMP')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0440'),
        nome = 'TAMPA AQUANIVEL DRY PUMP',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 6,
        preco_venda = 6.78,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 440) | NCM: 39174090 | Preço Unit.: R$ 6,00 | Valor ST: R$ 0,78 | Preço c/ ST: R$ 6,78',
        ativo = true
    WHERE codigo = 'PEC-0440' OR UPPER(TRIM(nome)) = UPPER('TAMPA AQUANIVEL DRY PUMP');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0440', 'TAMPA AQUANIVEL DRY PUMP', 'Peças', 'produto', 'UN', '39174090',
      6, 6.78, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 440) | NCM: 39174090 | Preço Unit.: R$ 6,00 | Valor ST: R$ 0,78 | Preço c/ ST: R$ 6,78', v_fornecedor_id
    );
  END IF;

  -- Linha 441: PEC-0441 - TAMPA AQUANIVEL ECO/SPLASH
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0441' OR UPPER(TRIM(nome)) = UPPER('TAMPA AQUANIVEL ECO/SPLASH')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0441'),
        nome = 'TAMPA AQUANIVEL ECO/SPLASH',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 6,
        preco_venda = 6.78,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 441) | NCM: 39174090 | Preço Unit.: R$ 6,00 | Valor ST: R$ 0,78 | Preço c/ ST: R$ 6,78',
        ativo = true
    WHERE codigo = 'PEC-0441' OR UPPER(TRIM(nome)) = UPPER('TAMPA AQUANIVEL ECO/SPLASH');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0441', 'TAMPA AQUANIVEL ECO/SPLASH', 'Peças', 'produto', 'UN', '39174090',
      6, 6.78, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 441) | NCM: 39174090 | Preço Unit.: R$ 6,00 | Valor ST: R$ 0,78 | Preço c/ ST: R$ 6,78', v_fornecedor_id
    );
  END IF;

  -- Linha 442: PEC-0442 - TAMPA AQUANIVEL G5/G6
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0442' OR UPPER(TRIM(nome)) = UPPER('TAMPA AQUANIVEL G5/G6')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0442'),
        nome = 'TAMPA AQUANIVEL G5/G6',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 15,
        preco_venda = 16.94,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 442) | NCM: 39174090 | Preço Unit.: R$ 15,00 | Valor ST: R$ 1,94 | Preço c/ ST: R$ 16,94',
        ativo = true
    WHERE codigo = 'PEC-0442' OR UPPER(TRIM(nome)) = UPPER('TAMPA AQUANIVEL G5/G6');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0442', 'TAMPA AQUANIVEL G5/G6', 'Peças', 'produto', 'UN', '39174090',
      15, 16.94, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 442) | NCM: 39174090 | Preço Unit.: R$ 15,00 | Valor ST: R$ 1,94 | Preço c/ ST: R$ 16,94', v_fornecedor_id
    );
  END IF;

  -- Linha 443: PEC-0443 - TAMPA CAIXA DE LIGACAO G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0443' OR UPPER(TRIM(nome)) = UPPER('TAMPA CAIXA DE LIGACAO G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0443'),
        nome = 'TAMPA CAIXA DE LIGACAO G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 4,
        preco_venda = 4.52,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 443) | NCM: 39174090 | Preço Unit.: R$ 4,00 | Valor ST: R$ 0,52 | Preço c/ ST: R$ 4,52',
        ativo = true
    WHERE codigo = 'PEC-0443' OR UPPER(TRIM(nome)) = UPPER('TAMPA CAIXA DE LIGACAO G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0443', 'TAMPA CAIXA DE LIGACAO G4', 'Peças', 'produto', 'UN', '39174090',
      4, 4.52, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 443) | NCM: 39174090 | Preço Unit.: R$ 4,00 | Valor ST: R$ 0,52 | Preço c/ ST: R$ 4,52', v_fornecedor_id
    );
  END IF;

  -- Linha 444: PEC-0444 - TAMPA COMPLETA G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0444' OR UPPER(TRIM(nome)) = UPPER('TAMPA COMPLETA G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0444'),
        nome = 'TAMPA COMPLETA G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 350,
        preco_venda = 395.36,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 444) | NCM: 39172900 | Preço Unit.: R$ 350,00 | Valor ST: R$ 45,36 | Preço c/ ST: R$ 395,36',
        ativo = true
    WHERE codigo = 'PEC-0444' OR UPPER(TRIM(nome)) = UPPER('TAMPA COMPLETA G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0444', 'TAMPA COMPLETA G4', 'Peças', 'produto', 'UN', '39172900',
      350, 395.36, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 444) | NCM: 39172900 | Preço Unit.: R$ 350,00 | Valor ST: R$ 45,36 | Preço c/ ST: R$ 395,36', v_fornecedor_id
    );
  END IF;

  -- Linha 445: PEC-0445 - TAMPA COMPLETA G4 CARVALHO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0445' OR UPPER(TRIM(nome)) = UPPER('TAMPA COMPLETA G4 CARVALHO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0445'),
        nome = 'TAMPA COMPLETA G4 CARVALHO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 350,
        preco_venda = 395.36,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 445) | NCM: 39172900 | Preço Unit.: R$ 350,00 | Valor ST: R$ 45,36 | Preço c/ ST: R$ 395,36',
        ativo = true
    WHERE codigo = 'PEC-0445' OR UPPER(TRIM(nome)) = UPPER('TAMPA COMPLETA G4 CARVALHO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0445', 'TAMPA COMPLETA G4 CARVALHO', 'Peças', 'produto', 'UN', '39172900',
      350, 395.36, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 445) | NCM: 39172900 | Preço Unit.: R$ 350,00 | Valor ST: R$ 45,36 | Preço c/ ST: R$ 395,36', v_fornecedor_id
    );
  END IF;

  -- Linha 446: PEC-0446 - TAMPA COMPLETA G4 CINZA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0446' OR UPPER(TRIM(nome)) = UPPER('TAMPA COMPLETA G4 CINZA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0446'),
        nome = 'TAMPA COMPLETA G4 CINZA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 350,
        preco_venda = 395.36,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 446) | NCM: 39172900 | Preço Unit.: R$ 350,00 | Valor ST: R$ 45,36 | Preço c/ ST: R$ 395,36',
        ativo = true
    WHERE codigo = 'PEC-0446' OR UPPER(TRIM(nome)) = UPPER('TAMPA COMPLETA G4 CINZA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0446', 'TAMPA COMPLETA G4 CINZA', 'Peças', 'produto', 'UN', '39172900',
      350, 395.36, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 446) | NCM: 39172900 | Preço Unit.: R$ 350,00 | Valor ST: R$ 45,36 | Preço c/ ST: R$ 395,36', v_fornecedor_id
    );
  END IF;

  -- Linha 447: PEC-0447 - TAMPA COMPLETA G4 IMBUIA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0447' OR UPPER(TRIM(nome)) = UPPER('TAMPA COMPLETA G4 IMBUIA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0447'),
        nome = 'TAMPA COMPLETA G4 IMBUIA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 350,
        preco_venda = 395.36,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 447) | NCM: 39172900 | Preço Unit.: R$ 350,00 | Valor ST: R$ 45,36 | Preço c/ ST: R$ 395,36',
        ativo = true
    WHERE codigo = 'PEC-0447' OR UPPER(TRIM(nome)) = UPPER('TAMPA COMPLETA G4 IMBUIA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0447', 'TAMPA COMPLETA G4 IMBUIA', 'Peças', 'produto', 'UN', '39172900',
      350, 395.36, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 447) | NCM: 39172900 | Preço Unit.: R$ 350,00 | Valor ST: R$ 45,36 | Preço c/ ST: R$ 395,36', v_fornecedor_id
    );
  END IF;

  -- Linha 448: PEC-0448 - TAMPA COMPLETA G4 MARFIM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0448' OR UPPER(TRIM(nome)) = UPPER('TAMPA COMPLETA G4 MARFIM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0448'),
        nome = 'TAMPA COMPLETA G4 MARFIM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 350,
        preco_venda = 395.36,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 448) | NCM: 39172900 | Preço Unit.: R$ 350,00 | Valor ST: R$ 45,36 | Preço c/ ST: R$ 395,36',
        ativo = true
    WHERE codigo = 'PEC-0448' OR UPPER(TRIM(nome)) = UPPER('TAMPA COMPLETA G4 MARFIM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0448', 'TAMPA COMPLETA G4 MARFIM', 'Peças', 'produto', 'UN', '39172900',
      350, 395.36, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 448) | NCM: 39172900 | Preço Unit.: R$ 350,00 | Valor ST: R$ 45,36 | Preço c/ ST: R$ 395,36', v_fornecedor_id
    );
  END IF;

  -- Linha 449: PEC-0449 - TAMPA COMPLETA G4 PRETA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0449' OR UPPER(TRIM(nome)) = UPPER('TAMPA COMPLETA G4 PRETA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0449'),
        nome = 'TAMPA COMPLETA G4 PRETA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 350,
        preco_venda = 395.36,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 449) | NCM: 39172900 | Preço Unit.: R$ 350,00 | Valor ST: R$ 45,36 | Preço c/ ST: R$ 395,36',
        ativo = true
    WHERE codigo = 'PEC-0449' OR UPPER(TRIM(nome)) = UPPER('TAMPA COMPLETA G4 PRETA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0449', 'TAMPA COMPLETA G4 PRETA', 'Peças', 'produto', 'UN', '39172900',
      350, 395.36, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 449) | NCM: 39172900 | Preço Unit.: R$ 350,00 | Valor ST: R$ 45,36 | Preço c/ ST: R$ 395,36', v_fornecedor_id
    );
  END IF;

  -- Linha 450: PEC-0450 - TAMPA DA BASE SPLASH DRY PUMP
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0450' OR UPPER(TRIM(nome)) = UPPER('TAMPA DA BASE SPLASH DRY PUMP')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0450'),
        nome = 'TAMPA DA BASE SPLASH DRY PUMP',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 190,
        preco_venda = 214.62,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 450) | NCM: 39172900 | Preço Unit.: R$ 190,00 | Valor ST: R$ 24,62 | Preço c/ ST: R$ 214,62',
        ativo = true
    WHERE codigo = 'PEC-0450' OR UPPER(TRIM(nome)) = UPPER('TAMPA DA BASE SPLASH DRY PUMP');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0450', 'TAMPA DA BASE SPLASH DRY PUMP', 'Peças', 'produto', 'UN', '39172900',
      190, 214.62, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 450) | NCM: 39172900 | Preço Unit.: R$ 190,00 | Valor ST: R$ 24,62 | Preço c/ ST: R$ 214,62', v_fornecedor_id
    );
  END IF;

  -- Linha 451: PEC-0451 - TAMPA DO SKIMMER DRY PUMP
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0451' OR UPPER(TRIM(nome)) = UPPER('TAMPA DO SKIMMER DRY PUMP')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0451'),
        nome = 'TAMPA DO SKIMMER DRY PUMP',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 15,
        preco_venda = 18.82,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 451) | NCM: 39269090 | Preço Unit.: R$ 15,00 | Valor ST: R$ 3,82 | Preço c/ ST: R$ 18,82',
        ativo = true
    WHERE codigo = 'PEC-0451' OR UPPER(TRIM(nome)) = UPPER('TAMPA DO SKIMMER DRY PUMP');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0451', 'TAMPA DO SKIMMER DRY PUMP', 'Peças', 'produto', 'UN', '39269090',
      15, 18.82, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 451) | NCM: 39269090 | Preço Unit.: R$ 15,00 | Valor ST: R$ 3,82 | Preço c/ ST: R$ 18,82', v_fornecedor_id
    );
  END IF;

  -- Linha 452: PEC-0452 - TAMPA DO SKIMMER G5/G6 BRANCO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0452' OR UPPER(TRIM(nome)) = UPPER('TAMPA DO SKIMMER G5/G6 BRANCO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0452'),
        nome = 'TAMPA DO SKIMMER G5/G6 BRANCO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 60,
        preco_venda = 75.28,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 452) | NCM: 39269090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 15,28 | Preço c/ ST: R$ 75,28',
        ativo = true
    WHERE codigo = 'PEC-0452' OR UPPER(TRIM(nome)) = UPPER('TAMPA DO SKIMMER G5/G6 BRANCO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0452', 'TAMPA DO SKIMMER G5/G6 BRANCO', 'Peças', 'produto', 'UN', '39269090',
      60, 75.28, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 452) | NCM: 39269090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 15,28 | Preço c/ ST: R$ 75,28', v_fornecedor_id
    );
  END IF;

  -- Linha 453: PEC-0453 - TAMPA DO SKIMMER G5/G6 CARVALHO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0453' OR UPPER(TRIM(nome)) = UPPER('TAMPA DO SKIMMER G5/G6 CARVALHO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0453'),
        nome = 'TAMPA DO SKIMMER G5/G6 CARVALHO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 60,
        preco_venda = 75.28,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 453) | NCM: 39269090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 15,28 | Preço c/ ST: R$ 75,28',
        ativo = true
    WHERE codigo = 'PEC-0453' OR UPPER(TRIM(nome)) = UPPER('TAMPA DO SKIMMER G5/G6 CARVALHO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0453', 'TAMPA DO SKIMMER G5/G6 CARVALHO', 'Peças', 'produto', 'UN', '39269090',
      60, 75.28, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 453) | NCM: 39269090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 15,28 | Preço c/ ST: R$ 75,28', v_fornecedor_id
    );
  END IF;

  -- Linha 454: PEC-0454 - TAMPA DO SKIMMER G5/G6 CINZA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0454' OR UPPER(TRIM(nome)) = UPPER('TAMPA DO SKIMMER G5/G6 CINZA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0454'),
        nome = 'TAMPA DO SKIMMER G5/G6 CINZA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 60,
        preco_venda = 75.28,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 454) | NCM: 39269090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 15,28 | Preço c/ ST: R$ 75,28',
        ativo = true
    WHERE codigo = 'PEC-0454' OR UPPER(TRIM(nome)) = UPPER('TAMPA DO SKIMMER G5/G6 CINZA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0454', 'TAMPA DO SKIMMER G5/G6 CINZA', 'Peças', 'produto', 'UN', '39269090',
      60, 75.28, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 454) | NCM: 39269090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 15,28 | Preço c/ ST: R$ 75,28', v_fornecedor_id
    );
  END IF;

  -- Linha 455: PEC-0455 - TAMPA DO SKIMMER G5/G6 IMBUIA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0455' OR UPPER(TRIM(nome)) = UPPER('TAMPA DO SKIMMER G5/G6 IMBUIA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0455'),
        nome = 'TAMPA DO SKIMMER G5/G6 IMBUIA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 60,
        preco_venda = 75.28,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 455) | NCM: 39269090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 15,28 | Preço c/ ST: R$ 75,28',
        ativo = true
    WHERE codigo = 'PEC-0455' OR UPPER(TRIM(nome)) = UPPER('TAMPA DO SKIMMER G5/G6 IMBUIA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0455', 'TAMPA DO SKIMMER G5/G6 IMBUIA', 'Peças', 'produto', 'UN', '39269090',
      60, 75.28, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 455) | NCM: 39269090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 15,28 | Preço c/ ST: R$ 75,28', v_fornecedor_id
    );
  END IF;

  -- Linha 456: PEC-0456 - TAMPA DO SKIMMER G5/G6 MARFIM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0456' OR UPPER(TRIM(nome)) = UPPER('TAMPA DO SKIMMER G5/G6 MARFIM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0456'),
        nome = 'TAMPA DO SKIMMER G5/G6 MARFIM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 60,
        preco_venda = 75.28,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 456) | NCM: 39269090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 15,28 | Preço c/ ST: R$ 75,28',
        ativo = true
    WHERE codigo = 'PEC-0456' OR UPPER(TRIM(nome)) = UPPER('TAMPA DO SKIMMER G5/G6 MARFIM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0456', 'TAMPA DO SKIMMER G5/G6 MARFIM', 'Peças', 'produto', 'UN', '39269090',
      60, 75.28, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 456) | NCM: 39269090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 15,28 | Preço c/ ST: R$ 75,28', v_fornecedor_id
    );
  END IF;

  -- Linha 457: PEC-0457 - TAMPA DO SKIMMER G5/G6 PRETO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0457' OR UPPER(TRIM(nome)) = UPPER('TAMPA DO SKIMMER G5/G6 PRETO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0457'),
        nome = 'TAMPA DO SKIMMER G5/G6 PRETO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 60,
        preco_venda = 75.28,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 457) | NCM: 39269090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 15,28 | Preço c/ ST: R$ 75,28',
        ativo = true
    WHERE codigo = 'PEC-0457' OR UPPER(TRIM(nome)) = UPPER('TAMPA DO SKIMMER G5/G6 PRETO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0457', 'TAMPA DO SKIMMER G5/G6 PRETO', 'Peças', 'produto', 'UN', '39269090',
      60, 75.28, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 457) | NCM: 39269090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 15,28 | Preço c/ ST: R$ 75,28', v_fornecedor_id
    );
  END IF;

  -- Linha 458: PEC-0458 - TAMPA DO SKIMMER G7 BRANCO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0458' OR UPPER(TRIM(nome)) = UPPER('TAMPA DO SKIMMER G7 BRANCO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0458'),
        nome = 'TAMPA DO SKIMMER G7 BRANCO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 60,
        preco_venda = 75.28,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 458) | NCM: 39269090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 15,28 | Preço c/ ST: R$ 75,28',
        ativo = true
    WHERE codigo = 'PEC-0458' OR UPPER(TRIM(nome)) = UPPER('TAMPA DO SKIMMER G7 BRANCO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0458', 'TAMPA DO SKIMMER G7 BRANCO', 'Peças', 'produto', 'UN', '39269090',
      60, 75.28, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 458) | NCM: 39269090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 15,28 | Preço c/ ST: R$ 75,28', v_fornecedor_id
    );
  END IF;

  -- Linha 459: PEC-0459 - TAMPA DO SKIMMER G7 CINZA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0459' OR UPPER(TRIM(nome)) = UPPER('TAMPA DO SKIMMER G7 CINZA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0459'),
        nome = 'TAMPA DO SKIMMER G7 CINZA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 60,
        preco_venda = 75.28,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 459) | NCM: 39269090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 15,28 | Preço c/ ST: R$ 75,28',
        ativo = true
    WHERE codigo = 'PEC-0459' OR UPPER(TRIM(nome)) = UPPER('TAMPA DO SKIMMER G7 CINZA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0459', 'TAMPA DO SKIMMER G7 CINZA', 'Peças', 'produto', 'UN', '39269090',
      60, 75.28, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 459) | NCM: 39269090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 15,28 | Preço c/ ST: R$ 75,28', v_fornecedor_id
    );
  END IF;

  -- Linha 460: PEC-0460 - TAMPA DO SKIMMER G7 PRETO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0460' OR UPPER(TRIM(nome)) = UPPER('TAMPA DO SKIMMER G7 PRETO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0460'),
        nome = 'TAMPA DO SKIMMER G7 PRETO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 60,
        preco_venda = 75.28,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 460) | NCM: 39269090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 15,28 | Preço c/ ST: R$ 75,28',
        ativo = true
    WHERE codigo = 'PEC-0460' OR UPPER(TRIM(nome)) = UPPER('TAMPA DO SKIMMER G7 PRETO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0460', 'TAMPA DO SKIMMER G7 PRETO', 'Peças', 'produto', 'UN', '39269090',
      60, 75.28, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 460) | NCM: 39269090 | Preço Unit.: R$ 60,00 | Valor ST: R$ 15,28 | Preço c/ ST: R$ 75,28', v_fornecedor_id
    );
  END IF;

  -- Linha 461: PEC-0461 - TAMPA DOSADOR SOLO G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0461' OR UPPER(TRIM(nome)) = UPPER('TAMPA DOSADOR SOLO G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0461'),
        nome = 'TAMPA DOSADOR SOLO G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 2,
        preco_venda = 2.26,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 461) | NCM: 39172900 | Preço Unit.: R$ 2,00 | Valor ST: R$ 0,26 | Preço c/ ST: R$ 2,26',
        ativo = true
    WHERE codigo = 'PEC-0461' OR UPPER(TRIM(nome)) = UPPER('TAMPA DOSADOR SOLO G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0461', 'TAMPA DOSADOR SOLO G4', 'Peças', 'produto', 'UN', '39172900',
      2, 2.26, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 461) | NCM: 39172900 | Preço Unit.: R$ 2,00 | Valor ST: R$ 0,26 | Preço c/ ST: R$ 2,26', v_fornecedor_id
    );
  END IF;

  -- Linha 462: PEC-0462 - TAMPA DRY PUMP 2
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0462' OR UPPER(TRIM(nome)) = UPPER('TAMPA DRY PUMP 2')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0462'),
        nome = 'TAMPA DRY PUMP 2',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 500,
        preco_venda = 564.8,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 462) | NCM: 39172900 | Preço Unit.: R$ 500,00 | Valor ST: R$ 64,80 | Preço c/ ST: R$ 564,80',
        ativo = true
    WHERE codigo = 'PEC-0462' OR UPPER(TRIM(nome)) = UPPER('TAMPA DRY PUMP 2');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0462', 'TAMPA DRY PUMP 2', 'Peças', 'produto', 'UN', '39172900',
      500, 564.8, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 462) | NCM: 39172900 | Preço Unit.: R$ 500,00 | Valor ST: R$ 64,80 | Preço c/ ST: R$ 564,80', v_fornecedor_id
    );
  END IF;

  -- Linha 463: PEC-0463 - TAMPA ECO SYSTEM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0463' OR UPPER(TRIM(nome)) = UPPER('TAMPA ECO SYSTEM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0463'),
        nome = 'TAMPA ECO SYSTEM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 150,
        preco_venda = 169.44,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 463) | NCM: 39174090 | Preço Unit.: R$ 150,00 | Valor ST: R$ 19,44 | Preço c/ ST: R$ 169,44',
        ativo = true
    WHERE codigo = 'PEC-0463' OR UPPER(TRIM(nome)) = UPPER('TAMPA ECO SYSTEM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0463', 'TAMPA ECO SYSTEM', 'Peças', 'produto', 'UN', '39174090',
      150, 169.44, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 463) | NCM: 39174090 | Preço Unit.: R$ 150,00 | Valor ST: R$ 19,44 | Preço c/ ST: R$ 169,44', v_fornecedor_id
    );
  END IF;

  -- Linha 464: PEC-0464 - TAMPA FRONTAL PRETA P/ BOMBA DE AQUEC WBR12.5H-A3
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0464' OR UPPER(TRIM(nome)) = UPPER('TAMPA FRONTAL PRETA P/ BOMBA DE AQUEC WBR12.5H-A3')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0464'),
        nome = 'TAMPA FRONTAL PRETA P/ BOMBA DE AQUEC WBR12.5H-A3',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 140,
        preco_venda = 140,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 464) | NCM: 84189900 | Preço Unit.: R$ 140,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 140,00',
        ativo = true
    WHERE codigo = 'PEC-0464' OR UPPER(TRIM(nome)) = UPPER('TAMPA FRONTAL PRETA P/ BOMBA DE AQUEC WBR12.5H-A3');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0464', 'TAMPA FRONTAL PRETA P/ BOMBA DE AQUEC WBR12.5H-A3', 'Peças', 'produto', 'UN', '84189900',
      140, 140, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 464) | NCM: 84189900 | Preço Unit.: R$ 140,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 140,00', v_fornecedor_id
    );
  END IF;

  -- Linha 465: PEC-0465 - TAMPA FRONTAL PRETA P/ BOMBA DE AQUEC WBR4.5H-A3
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0465' OR UPPER(TRIM(nome)) = UPPER('TAMPA FRONTAL PRETA P/ BOMBA DE AQUEC WBR4.5H-A3')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0465'),
        nome = 'TAMPA FRONTAL PRETA P/ BOMBA DE AQUEC WBR4.5H-A3',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 40,
        preco_venda = 40,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 465) | NCM: 84189900 | Preço Unit.: R$ 40,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 40,00',
        ativo = true
    WHERE codigo = 'PEC-0465' OR UPPER(TRIM(nome)) = UPPER('TAMPA FRONTAL PRETA P/ BOMBA DE AQUEC WBR4.5H-A3');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0465', 'TAMPA FRONTAL PRETA P/ BOMBA DE AQUEC WBR4.5H-A3', 'Peças', 'produto', 'UN', '84189900',
      40, 40, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 465) | NCM: 84189900 | Preço Unit.: R$ 40,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 40,00', v_fornecedor_id
    );
  END IF;

  -- Linha 466: PEC-0466 - TAMPA FRONTAL PRETA P/ BOMBA DE AQUEC WBR7.8H-A3
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0466' OR UPPER(TRIM(nome)) = UPPER('TAMPA FRONTAL PRETA P/ BOMBA DE AQUEC WBR7.8H-A3')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0466'),
        nome = 'TAMPA FRONTAL PRETA P/ BOMBA DE AQUEC WBR7.8H-A3',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 70,
        preco_venda = 70,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 466) | NCM: 84189900 | Preço Unit.: R$ 70,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 70,00',
        ativo = true
    WHERE codigo = 'PEC-0466' OR UPPER(TRIM(nome)) = UPPER('TAMPA FRONTAL PRETA P/ BOMBA DE AQUEC WBR7.8H-A3');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0466', 'TAMPA FRONTAL PRETA P/ BOMBA DE AQUEC WBR7.8H-A3', 'Peças', 'produto', 'UN', '84189900',
      70, 70, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 466) | NCM: 84189900 | Preço Unit.: R$ 70,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 70,00', v_fornecedor_id
    );
  END IF;

  -- Linha 467: PEC-0467 - TAMPA G2
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0467' OR UPPER(TRIM(nome)) = UPPER('TAMPA G2')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0467'),
        nome = 'TAMPA G2',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 550,
        preco_venda = 621.28,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 467) | NCM: 39172900 | Preço Unit.: R$ 550,00 | Valor ST: R$ 71,28 | Preço c/ ST: R$ 621,28',
        ativo = true
    WHERE codigo = 'PEC-0467' OR UPPER(TRIM(nome)) = UPPER('TAMPA G2');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0467', 'TAMPA G2', 'Peças', 'produto', 'UN', '39172900',
      550, 621.28, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 467) | NCM: 39172900 | Preço Unit.: R$ 550,00 | Valor ST: R$ 71,28 | Preço c/ ST: R$ 621,28', v_fornecedor_id
    );
  END IF;

  -- Linha 468: PEC-0468 - TAMPA G3
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0468' OR UPPER(TRIM(nome)) = UPPER('TAMPA G3')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0468'),
        nome = 'TAMPA G3',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 690,
        preco_venda = 779.42,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 468) | NCM: 39172900 | Preço Unit.: R$ 690,00 | Valor ST: R$ 89,42 | Preço c/ ST: R$ 779,42',
        ativo = true
    WHERE codigo = 'PEC-0468' OR UPPER(TRIM(nome)) = UPPER('TAMPA G3');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0468', 'TAMPA G3', 'Peças', 'produto', 'UN', '39172900',
      690, 779.42, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 468) | NCM: 39172900 | Preço Unit.: R$ 690,00 | Valor ST: R$ 89,42 | Preço c/ ST: R$ 779,42', v_fornecedor_id
    );
  END IF;

  -- Linha 469: PEC-0469 - TAMPA G4 SEM VISOR
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0469' OR UPPER(TRIM(nome)) = UPPER('TAMPA G4 SEM VISOR')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0469'),
        nome = 'TAMPA G4 SEM VISOR',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 250,
        preco_venda = 282.4,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 469) | NCM: 39172900 | Preço Unit.: R$ 250,00 | Valor ST: R$ 32,40 | Preço c/ ST: R$ 282,40',
        ativo = true
    WHERE codigo = 'PEC-0469' OR UPPER(TRIM(nome)) = UPPER('TAMPA G4 SEM VISOR');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0469', 'TAMPA G4 SEM VISOR', 'Peças', 'produto', 'UN', '39172900',
      250, 282.4, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 469) | NCM: 39172900 | Preço Unit.: R$ 250,00 | Valor ST: R$ 32,40 | Preço c/ ST: R$ 282,40', v_fornecedor_id
    );
  END IF;

  -- Linha 470: PEC-0470 - TAMPA G5 BRANCA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0470' OR UPPER(TRIM(nome)) = UPPER('TAMPA G5 BRANCA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0470'),
        nome = 'TAMPA G5 BRANCA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 290,
        preco_venda = 327.58,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 470) | NCM: 39172900 | Preço Unit.: R$ 290,00 | Valor ST: R$ 37,58 | Preço c/ ST: R$ 327,58',
        ativo = true
    WHERE codigo = 'PEC-0470' OR UPPER(TRIM(nome)) = UPPER('TAMPA G5 BRANCA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0470', 'TAMPA G5 BRANCA', 'Peças', 'produto', 'UN', '39172900',
      290, 327.58, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 470) | NCM: 39172900 | Preço Unit.: R$ 290,00 | Valor ST: R$ 37,58 | Preço c/ ST: R$ 327,58', v_fornecedor_id
    );
  END IF;

  -- Linha 471: PEC-0471 - TAMPA G5 CARVALHO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0471' OR UPPER(TRIM(nome)) = UPPER('TAMPA G5 CARVALHO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0471'),
        nome = 'TAMPA G5 CARVALHO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 290,
        preco_venda = 327.58,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 471) | NCM: 39172900 | Preço Unit.: R$ 290,00 | Valor ST: R$ 37,58 | Preço c/ ST: R$ 327,58',
        ativo = true
    WHERE codigo = 'PEC-0471' OR UPPER(TRIM(nome)) = UPPER('TAMPA G5 CARVALHO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0471', 'TAMPA G5 CARVALHO', 'Peças', 'produto', 'UN', '39172900',
      290, 327.58, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 471) | NCM: 39172900 | Preço Unit.: R$ 290,00 | Valor ST: R$ 37,58 | Preço c/ ST: R$ 327,58', v_fornecedor_id
    );
  END IF;

  -- Linha 472: PEC-0472 - TAMPA G5 CINZA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0472' OR UPPER(TRIM(nome)) = UPPER('TAMPA G5 CINZA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0472'),
        nome = 'TAMPA G5 CINZA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 290,
        preco_venda = 327.58,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 472) | NCM: 39172900 | Preço Unit.: R$ 290,00 | Valor ST: R$ 37,58 | Preço c/ ST: R$ 327,58',
        ativo = true
    WHERE codigo = 'PEC-0472' OR UPPER(TRIM(nome)) = UPPER('TAMPA G5 CINZA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0472', 'TAMPA G5 CINZA', 'Peças', 'produto', 'UN', '39172900',
      290, 327.58, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 472) | NCM: 39172900 | Preço Unit.: R$ 290,00 | Valor ST: R$ 37,58 | Preço c/ ST: R$ 327,58', v_fornecedor_id
    );
  END IF;

  -- Linha 473: PEC-0473 - TAMPA G5 IMBUIA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0473' OR UPPER(TRIM(nome)) = UPPER('TAMPA G5 IMBUIA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0473'),
        nome = 'TAMPA G5 IMBUIA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 290,
        preco_venda = 327.58,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 473) | NCM: 39172900 | Preço Unit.: R$ 290,00 | Valor ST: R$ 37,58 | Preço c/ ST: R$ 327,58',
        ativo = true
    WHERE codigo = 'PEC-0473' OR UPPER(TRIM(nome)) = UPPER('TAMPA G5 IMBUIA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0473', 'TAMPA G5 IMBUIA', 'Peças', 'produto', 'UN', '39172900',
      290, 327.58, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 473) | NCM: 39172900 | Preço Unit.: R$ 290,00 | Valor ST: R$ 37,58 | Preço c/ ST: R$ 327,58', v_fornecedor_id
    );
  END IF;

  -- Linha 474: PEC-0474 - TAMPA G5 MARFIM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0474' OR UPPER(TRIM(nome)) = UPPER('TAMPA G5 MARFIM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0474'),
        nome = 'TAMPA G5 MARFIM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 290,
        preco_venda = 327.58,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 474) | NCM: 39172900 | Preço Unit.: R$ 290,00 | Valor ST: R$ 37,58 | Preço c/ ST: R$ 327,58',
        ativo = true
    WHERE codigo = 'PEC-0474' OR UPPER(TRIM(nome)) = UPPER('TAMPA G5 MARFIM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0474', 'TAMPA G5 MARFIM', 'Peças', 'produto', 'UN', '39172900',
      290, 327.58, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 474) | NCM: 39172900 | Preço Unit.: R$ 290,00 | Valor ST: R$ 37,58 | Preço c/ ST: R$ 327,58', v_fornecedor_id
    );
  END IF;

  -- Linha 475: PEC-0475 - TAMPA G5 PRETA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0475' OR UPPER(TRIM(nome)) = UPPER('TAMPA G5 PRETA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0475'),
        nome = 'TAMPA G5 PRETA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 290,
        preco_venda = 327.58,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 475) | NCM: 39172900 | Preço Unit.: R$ 290,00 | Valor ST: R$ 37,58 | Preço c/ ST: R$ 327,58',
        ativo = true
    WHERE codigo = 'PEC-0475' OR UPPER(TRIM(nome)) = UPPER('TAMPA G5 PRETA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0475', 'TAMPA G5 PRETA', 'Peças', 'produto', 'UN', '39172900',
      290, 327.58, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 475) | NCM: 39172900 | Preço Unit.: R$ 290,00 | Valor ST: R$ 37,58 | Preço c/ ST: R$ 327,58', v_fornecedor_id
    );
  END IF;

  -- Linha 476: PEC-0476 - TAMPA G6 CINZA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0476' OR UPPER(TRIM(nome)) = UPPER('TAMPA G6 CINZA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0476'),
        nome = 'TAMPA G6 CINZA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 500,
        preco_venda = 564.8,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 476) | NCM: 39172900 | Preço Unit.: R$ 500,00 | Valor ST: R$ 64,80 | Preço c/ ST: R$ 564,80',
        ativo = true
    WHERE codigo = 'PEC-0476' OR UPPER(TRIM(nome)) = UPPER('TAMPA G6 CINZA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0476', 'TAMPA G6 CINZA', 'Peças', 'produto', 'UN', '39172900',
      500, 564.8, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 476) | NCM: 39172900 | Preço Unit.: R$ 500,00 | Valor ST: R$ 64,80 | Preço c/ ST: R$ 564,80', v_fornecedor_id
    );
  END IF;

  -- Linha 477: PEC-0477 - TAMPA G6 BRANCA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0477' OR UPPER(TRIM(nome)) = UPPER('TAMPA G6 BRANCA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0477'),
        nome = 'TAMPA G6 BRANCA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 500,
        preco_venda = 564.8,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 477) | NCM: 39172900 | Preço Unit.: R$ 500,00 | Valor ST: R$ 64,80 | Preço c/ ST: R$ 564,80',
        ativo = true
    WHERE codigo = 'PEC-0477' OR UPPER(TRIM(nome)) = UPPER('TAMPA G6 BRANCA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0477', 'TAMPA G6 BRANCA', 'Peças', 'produto', 'UN', '39172900',
      500, 564.8, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 477) | NCM: 39172900 | Preço Unit.: R$ 500,00 | Valor ST: R$ 64,80 | Preço c/ ST: R$ 564,80', v_fornecedor_id
    );
  END IF;

  -- Linha 478: PEC-0478 - TAMPA G6 CARVALHO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0478' OR UPPER(TRIM(nome)) = UPPER('TAMPA G6 CARVALHO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0478'),
        nome = 'TAMPA G6 CARVALHO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 500,
        preco_venda = 564.8,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 478) | NCM: 39172900 | Preço Unit.: R$ 500,00 | Valor ST: R$ 64,80 | Preço c/ ST: R$ 564,80',
        ativo = true
    WHERE codigo = 'PEC-0478' OR UPPER(TRIM(nome)) = UPPER('TAMPA G6 CARVALHO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0478', 'TAMPA G6 CARVALHO', 'Peças', 'produto', 'UN', '39172900',
      500, 564.8, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 478) | NCM: 39172900 | Preço Unit.: R$ 500,00 | Valor ST: R$ 64,80 | Preço c/ ST: R$ 564,80', v_fornecedor_id
    );
  END IF;

  -- Linha 479: PEC-0479 - TAMPA G6 IMBUIA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0479' OR UPPER(TRIM(nome)) = UPPER('TAMPA G6 IMBUIA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0479'),
        nome = 'TAMPA G6 IMBUIA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 500,
        preco_venda = 564.8,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 479) | NCM: 39172900 | Preço Unit.: R$ 500,00 | Valor ST: R$ 64,80 | Preço c/ ST: R$ 564,80',
        ativo = true
    WHERE codigo = 'PEC-0479' OR UPPER(TRIM(nome)) = UPPER('TAMPA G6 IMBUIA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0479', 'TAMPA G6 IMBUIA', 'Peças', 'produto', 'UN', '39172900',
      500, 564.8, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 479) | NCM: 39172900 | Preço Unit.: R$ 500,00 | Valor ST: R$ 64,80 | Preço c/ ST: R$ 564,80', v_fornecedor_id
    );
  END IF;

  -- Linha 480: PEC-0480 - TAMPA G6 MARFIM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0480' OR UPPER(TRIM(nome)) = UPPER('TAMPA G6 MARFIM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0480'),
        nome = 'TAMPA G6 MARFIM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 500,
        preco_venda = 564.8,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 480) | NCM: 39172900 | Preço Unit.: R$ 500,00 | Valor ST: R$ 64,80 | Preço c/ ST: R$ 564,80',
        ativo = true
    WHERE codigo = 'PEC-0480' OR UPPER(TRIM(nome)) = UPPER('TAMPA G6 MARFIM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0480', 'TAMPA G6 MARFIM', 'Peças', 'produto', 'UN', '39172900',
      500, 564.8, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 480) | NCM: 39172900 | Preço Unit.: R$ 500,00 | Valor ST: R$ 64,80 | Preço c/ ST: R$ 564,80', v_fornecedor_id
    );
  END IF;

  -- Linha 481: PEC-0481 - TAMPA G6 PRETO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0481' OR UPPER(TRIM(nome)) = UPPER('TAMPA G6 PRETO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0481'),
        nome = 'TAMPA G6 PRETO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 500,
        preco_venda = 564.8,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 481) | NCM: 39172900 | Preço Unit.: R$ 500,00 | Valor ST: R$ 64,80 | Preço c/ ST: R$ 564,80',
        ativo = true
    WHERE codigo = 'PEC-0481' OR UPPER(TRIM(nome)) = UPPER('TAMPA G6 PRETO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0481', 'TAMPA G6 PRETO', 'Peças', 'produto', 'UN', '39172900',
      500, 564.8, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 481) | NCM: 39172900 | Preço Unit.: R$ 500,00 | Valor ST: R$ 64,80 | Preço c/ ST: R$ 564,80', v_fornecedor_id
    );
  END IF;

  -- Linha 482: PEC-0482 - TAMPA G7 CINZA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0482' OR UPPER(TRIM(nome)) = UPPER('TAMPA G7 CINZA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0482'),
        nome = 'TAMPA G7 CINZA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 500,
        preco_venda = 564.8,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 482) | NCM: 39172900 | Preço Unit.: R$ 500,00 | Valor ST: R$ 64,80 | Preço c/ ST: R$ 564,80',
        ativo = true
    WHERE codigo = 'PEC-0482' OR UPPER(TRIM(nome)) = UPPER('TAMPA G7 CINZA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0482', 'TAMPA G7 CINZA', 'Peças', 'produto', 'UN', '39172900',
      500, 564.8, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 482) | NCM: 39172900 | Preço Unit.: R$ 500,00 | Valor ST: R$ 64,80 | Preço c/ ST: R$ 564,80', v_fornecedor_id
    );
  END IF;

  -- Linha 483: PEC-0483 - TAMPA G7 PRETA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0483' OR UPPER(TRIM(nome)) = UPPER('TAMPA G7 PRETA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0483'),
        nome = 'TAMPA G7 PRETA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 500,
        preco_venda = 564.8,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 483) | NCM: 39172900 | Preço Unit.: R$ 500,00 | Valor ST: R$ 64,80 | Preço c/ ST: R$ 564,80',
        ativo = true
    WHERE codigo = 'PEC-0483' OR UPPER(TRIM(nome)) = UPPER('TAMPA G7 PRETA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0483', 'TAMPA G7 PRETA', 'Peças', 'produto', 'UN', '39172900',
      500, 564.8, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 483) | NCM: 39172900 | Preço Unit.: R$ 500,00 | Valor ST: R$ 64,80 | Preço c/ ST: R$ 564,80', v_fornecedor_id
    );
  END IF;

  -- Linha 484: PEC-0484 - TAMPA PRETA PEQUENA BASE EDEM
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0484' OR UPPER(TRIM(nome)) = UPPER('TAMPA PRETA PEQUENA BASE EDEM')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0484'),
        nome = 'TAMPA PRETA PEQUENA BASE EDEM',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 3,
        preco_venda = 3.39,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 484) | NCM: 39174090 | Preço Unit.: R$ 3,00 | Valor ST: R$ 0,39 | Preço c/ ST: R$ 3,39',
        ativo = true
    WHERE codigo = 'PEC-0484' OR UPPER(TRIM(nome)) = UPPER('TAMPA PRETA PEQUENA BASE EDEM');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0484', 'TAMPA PRETA PEQUENA BASE EDEM', 'Peças', 'produto', 'UN', '39174090',
      3, 3.39, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 484) | NCM: 39174090 | Preço Unit.: R$ 3,00 | Valor ST: R$ 0,39 | Preço c/ ST: R$ 3,39', v_fornecedor_id
    );
  END IF;

  -- Linha 485: PEC-0485 - TAMPA Q. C SPLASH
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0485' OR UPPER(TRIM(nome)) = UPPER('TAMPA Q. C SPLASH')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0485'),
        nome = 'TAMPA Q. C SPLASH',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 150,
        preco_venda = 169.44,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 485) | NCM: 39174090 | Preço Unit.: R$ 150,00 | Valor ST: R$ 19,44 | Preço c/ ST: R$ 169,44',
        ativo = true
    WHERE codigo = 'PEC-0485' OR UPPER(TRIM(nome)) = UPPER('TAMPA Q. C SPLASH');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0485', 'TAMPA Q. C SPLASH', 'Peças', 'produto', 'UN', '39174090',
      150, 169.44, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 485) | NCM: 39174090 | Preço Unit.: R$ 150,00 | Valor ST: R$ 19,44 | Preço c/ ST: R$ 169,44', v_fornecedor_id
    );
  END IF;

  -- Linha 486: PEC-0486 - TAMPA SPA SPLASH
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0486' OR UPPER(TRIM(nome)) = UPPER('TAMPA SPA SPLASH')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0486'),
        nome = 'TAMPA SPA SPLASH',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 80,
        preco_venda = 90.37,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 486) | NCM: 39174090 | Preço Unit.: R$ 80,00 | Valor ST: R$ 10,37 | Preço c/ ST: R$ 90,37',
        ativo = true
    WHERE codigo = 'PEC-0486' OR UPPER(TRIM(nome)) = UPPER('TAMPA SPA SPLASH');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0486', 'TAMPA SPA SPLASH', 'Peças', 'produto', 'UN', '39174090',
      80, 90.37, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 486) | NCM: 39174090 | Preço Unit.: R$ 80,00 | Valor ST: R$ 10,37 | Preço c/ ST: R$ 90,37', v_fornecedor_id
    );
  END IF;

  -- Linha 487: PEC-0487 - TAMPA SPLASH
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0487' OR UPPER(TRIM(nome)) = UPPER('TAMPA SPLASH')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0487'),
        nome = 'TAMPA SPLASH',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 150,
        preco_venda = 169.44,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 487) | NCM: 39174090 | Preço Unit.: R$ 150,00 | Valor ST: R$ 19,44 | Preço c/ ST: R$ 169,44',
        ativo = true
    WHERE codigo = 'PEC-0487' OR UPPER(TRIM(nome)) = UPPER('TAMPA SPLASH');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0487', 'TAMPA SPLASH', 'Peças', 'produto', 'UN', '39174090',
      150, 169.44, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 487) | NCM: 39174090 | Preço Unit.: R$ 150,00 | Valor ST: R$ 19,44 | Preço c/ ST: R$ 169,44', v_fornecedor_id
    );
  END IF;

  -- Linha 488: PEC-0488 - TEE 25MM (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0488' OR UPPER(TRIM(nome)) = UPPER('TEE 25MM (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0488'),
        nome = 'TEE 25MM (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 48,
        preco_venda = 54.22,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 488) | NCM: 39174090 | Preço Unit.: R$ 48,00 | Valor ST: R$ 6,22 | Preço c/ ST: R$ 54,22',
        ativo = true
    WHERE codigo = 'PEC-0488' OR UPPER(TRIM(nome)) = UPPER('TEE 25MM (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0488', 'TEE 25MM (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39174090',
      48, 54.22, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 488) | NCM: 39174090 | Preço Unit.: R$ 48,00 | Valor ST: R$ 6,22 | Preço c/ ST: R$ 54,22', v_fornecedor_id
    );
  END IF;

  -- Linha 489: PEC-0489 - TEE 40 MM (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0489' OR UPPER(TRIM(nome)) = UPPER('TEE 40 MM (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0489'),
        nome = 'TEE 40 MM (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 185,
        preco_venda = 208.98,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 489) | NCM: 39174090 | Preço Unit.: R$ 185,00 | Valor ST: R$ 23,98 | Preço c/ ST: R$ 208,98',
        ativo = true
    WHERE codigo = 'PEC-0489' OR UPPER(TRIM(nome)) = UPPER('TEE 40 MM (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0489', 'TEE 40 MM (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39174090',
      185, 208.98, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 489) | NCM: 39174090 | Preço Unit.: R$ 185,00 | Valor ST: R$ 23,98 | Preço c/ ST: R$ 208,98', v_fornecedor_id
    );
  END IF;

  -- Linha 490: PEC-0490 - TEE 50MM (CX C/10)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0490' OR UPPER(TRIM(nome)) = UPPER('TEE 50MM (CX C/10)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0490'),
        nome = 'TEE 50MM (CX C/10)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 200,
        preco_venda = 225.92,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 490) | NCM: 39174090 | Preço Unit.: R$ 200,00 | Valor ST: R$ 25,92 | Preço c/ ST: R$ 225,92',
        ativo = true
    WHERE codigo = 'PEC-0490' OR UPPER(TRIM(nome)) = UPPER('TEE 50MM (CX C/10)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0490', 'TEE 50MM (CX C/10)', 'Peças', 'produto', 'UN', '39174090',
      200, 225.92, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 490) | NCM: 39174090 | Preço Unit.: R$ 200,00 | Valor ST: R$ 25,92 | Preço c/ ST: R$ 225,92', v_fornecedor_id
    );
  END IF;

  -- Linha 491: PEC-0491 - TEE 50X25 DA HIDROTERAPIA (CX C/10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0491' OR UPPER(TRIM(nome)) = UPPER('TEE 50X25 DA HIDROTERAPIA (CX C/10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0491'),
        nome = 'TEE 50X25 DA HIDROTERAPIA (CX C/10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 85,
        preco_venda = 96.02,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 491) | NCM: 39174090 | Preço Unit.: R$ 85,00 | Valor ST: R$ 11,02 | Preço c/ ST: R$ 96,02',
        ativo = true
    WHERE codigo = 'PEC-0491' OR UPPER(TRIM(nome)) = UPPER('TEE 50X25 DA HIDROTERAPIA (CX C/10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0491', 'TEE 50X25 DA HIDROTERAPIA (CX C/10 UN)', 'Peças', 'produto', 'UN', '39174090',
      85, 96.02, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 491) | NCM: 39174090 | Preço Unit.: R$ 85,00 | Valor ST: R$ 11,02 | Preço c/ ST: R$ 96,02', v_fornecedor_id
    );
  END IF;

  -- Linha 492: PEC-0492 - TEE DISTRIBUIDOR HIDRAULICO G4 (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0492' OR UPPER(TRIM(nome)) = UPPER('TEE DISTRIBUIDOR HIDRAULICO G4 (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0492'),
        nome = 'TEE DISTRIBUIDOR HIDRAULICO G4 (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 65,
        preco_venda = 73.42,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 492) | NCM: 39174090 | Preço Unit.: R$ 65,00 | Valor ST: R$ 8,42 | Preço c/ ST: R$ 73,42',
        ativo = true
    WHERE codigo = 'PEC-0492' OR UPPER(TRIM(nome)) = UPPER('TEE DISTRIBUIDOR HIDRAULICO G4 (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0492', 'TEE DISTRIBUIDOR HIDRAULICO G4 (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39174090',
      65, 73.42, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 492) | NCM: 39174090 | Preço Unit.: R$ 65,00 | Valor ST: R$ 8,42 | Preço c/ ST: R$ 73,42', v_fornecedor_id
    );
  END IF;

  -- Linha 493: PEC-0493 - TEE DO OMBRELONE COPA (SUPORTE LATERAL)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0493' OR UPPER(TRIM(nome)) = UPPER('TEE DO OMBRELONE COPA (SUPORTE LATERAL)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0493'),
        nome = 'TEE DO OMBRELONE COPA (SUPORTE LATERAL)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 110,
        preco_venda = 124.26,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 493) | NCM: 39172900 | Preço Unit.: R$ 110,00 | Valor ST: R$ 14,26 | Preço c/ ST: R$ 124,26',
        ativo = true
    WHERE codigo = 'PEC-0493' OR UPPER(TRIM(nome)) = UPPER('TEE DO OMBRELONE COPA (SUPORTE LATERAL)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0493', 'TEE DO OMBRELONE COPA (SUPORTE LATERAL)', 'Peças', 'produto', 'UN', '39172900',
      110, 124.26, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 493) | NCM: 39172900 | Preço Unit.: R$ 110,00 | Valor ST: R$ 14,26 | Preço c/ ST: R$ 124,26', v_fornecedor_id
    );
  END IF;

  -- Linha 494: PEC-0494 - TEE HIDRO (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0494' OR UPPER(TRIM(nome)) = UPPER('TEE HIDRO (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0494'),
        nome = 'TEE HIDRO (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 55,
        preco_venda = 62.13,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 494) | NCM: 39174090 | Preço Unit.: R$ 55,00 | Valor ST: R$ 7,13 | Preço c/ ST: R$ 62,13',
        ativo = true
    WHERE codigo = 'PEC-0494' OR UPPER(TRIM(nome)) = UPPER('TEE HIDRO (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0494', 'TEE HIDRO (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39174090',
      55, 62.13, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 494) | NCM: 39174090 | Preço Unit.: R$ 55,00 | Valor ST: R$ 7,13 | Preço c/ ST: R$ 62,13', v_fornecedor_id
    );
  END IF;

  -- Linha 495: PEC-0495 - TEE SENSOR FLUXO (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0495' OR UPPER(TRIM(nome)) = UPPER('TEE SENSOR FLUXO (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0495'),
        nome = 'TEE SENSOR FLUXO (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 50,
        preco_venda = 56.48,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 495) | NCM: 39174090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 6,48 | Preço c/ ST: R$ 56,48',
        ativo = true
    WHERE codigo = 'PEC-0495' OR UPPER(TRIM(nome)) = UPPER('TEE SENSOR FLUXO (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0495', 'TEE SENSOR FLUXO (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      50, 56.48, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 495) | NCM: 39174090 | Preço Unit.: R$ 50,00 | Valor ST: R$ 6,48 | Preço c/ ST: R$ 56,48', v_fornecedor_id
    );
  END IF;

  -- Linha 496: PEC-0496 - TERMINAL LEVITA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0496' OR UPPER(TRIM(nome)) = UPPER('TERMINAL LEVITA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0496'),
        nome = 'TERMINAL LEVITA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 5,
        preco_venda = 5.65,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 496) | NCM: 39172900 | Preço Unit.: R$ 5,00 | Valor ST: R$ 0,65 | Preço c/ ST: R$ 5,65',
        ativo = true
    WHERE codigo = 'PEC-0496' OR UPPER(TRIM(nome)) = UPPER('TERMINAL LEVITA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0496', 'TERMINAL LEVITA', 'Peças', 'produto', 'UN', '39172900',
      5, 5.65, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 496) | NCM: 39172900 | Preço Unit.: R$ 5,00 | Valor ST: R$ 0,65 | Preço c/ ST: R$ 5,65', v_fornecedor_id
    );
  END IF;

  -- Linha 498: PEC-0498 - TIMER - INTERRUPTOR MECANICO DE TEMPO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0498' OR UPPER(TRIM(nome)) = UPPER('TIMER - INTERRUPTOR MECANICO DE TEMPO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0498'),
        nome = 'TIMER - INTERRUPTOR MECANICO DE TEMPO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '91070010',
        preco_custo = 215,
        preco_venda = 215,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 498) | NCM: 91070010 | Preço Unit.: R$ 215,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 215,00',
        ativo = true
    WHERE codigo = 'PEC-0498' OR UPPER(TRIM(nome)) = UPPER('TIMER - INTERRUPTOR MECANICO DE TEMPO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0498', 'TIMER - INTERRUPTOR MECANICO DE TEMPO', 'Peças', 'produto', 'UN', '91070010',
      215, 215, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 498) | NCM: 91070010 | Preço Unit.: R$ 215,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 215,00', v_fornecedor_id
    );
  END IF;

  -- Linha 499: PEC-0499 - TRANSFORMADOR TOROIDAL 12V
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0499' OR UPPER(TRIM(nome)) = UPPER('TRANSFORMADOR TOROIDAL 12V')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0499'),
        nome = 'TRANSFORMADOR TOROIDAL 12V',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85043111',
        preco_custo = 380,
        preco_venda = 380,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 499) | NCM: 85043111 | Preço Unit.: R$ 380,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 380,00',
        ativo = true
    WHERE codigo = 'PEC-0499' OR UPPER(TRIM(nome)) = UPPER('TRANSFORMADOR TOROIDAL 12V');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0499', 'TRANSFORMADOR TOROIDAL 12V', 'Peças', 'produto', 'UN', '85043111',
      380, 380, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 499) | NCM: 85043111 | Preço Unit.: R$ 380,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 380,00', v_fornecedor_id
    );
  END IF;

  -- Linha 500: PEC-0500 - TRANSFORMADOR TOROIDAL 24V
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0500' OR UPPER(TRIM(nome)) = UPPER('TRANSFORMADOR TOROIDAL 24V')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0500'),
        nome = 'TRANSFORMADOR TOROIDAL 24V',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85043111',
        preco_custo = 445,
        preco_venda = 445,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 500) | NCM: 85043111 | Preço Unit.: R$ 445,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 445,00',
        ativo = true
    WHERE codigo = 'PEC-0500' OR UPPER(TRIM(nome)) = UPPER('TRANSFORMADOR TOROIDAL 24V');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0500', 'TRANSFORMADOR TOROIDAL 24V', 'Peças', 'produto', 'UN', '85043111',
      445, 445, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 500) | NCM: 85043111 | Preço Unit.: R$ 445,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 445,00', v_fornecedor_id
    );
  END IF;

  -- Linha 501: PEC-0501 - TRASEIRA Q.C MAX
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0501' OR UPPER(TRIM(nome)) = UPPER('TRASEIRA Q.C MAX')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0501'),
        nome = 'TRASEIRA Q.C MAX',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 300,
        preco_venda = 338.88,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 501) | NCM: 39174090 | Preço Unit.: R$ 300,00 | Valor ST: R$ 38,88 | Preço c/ ST: R$ 338,88',
        ativo = true
    WHERE codigo = 'PEC-0501' OR UPPER(TRIM(nome)) = UPPER('TRASEIRA Q.C MAX');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0501', 'TRASEIRA Q.C MAX', 'Peças', 'produto', 'UN', '39174090',
      300, 338.88, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 501) | NCM: 39174090 | Preço Unit.: R$ 300,00 | Valor ST: R$ 38,88 | Preço c/ ST: R$ 338,88', v_fornecedor_id
    );
  END IF;

  -- Linha 502: PEC-0502 - TRASEIRA Q.C MAX ELETRONIC
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0502' OR UPPER(TRIM(nome)) = UPPER('TRASEIRA Q.C MAX ELETRONIC')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0502'),
        nome = 'TRASEIRA Q.C MAX ELETRONIC',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 350,
        preco_venda = 395.36,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 502) | NCM: 39174090 | Preço Unit.: R$ 350,00 | Valor ST: R$ 45,36 | Preço c/ ST: R$ 395,36',
        ativo = true
    WHERE codigo = 'PEC-0502' OR UPPER(TRIM(nome)) = UPPER('TRASEIRA Q.C MAX ELETRONIC');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0502', 'TRASEIRA Q.C MAX ELETRONIC', 'Peças', 'produto', 'UN', '39174090',
      350, 395.36, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 502) | NCM: 39174090 | Preço Unit.: R$ 350,00 | Valor ST: R$ 45,36 | Preço c/ ST: R$ 395,36', v_fornecedor_id
    );
  END IF;

  -- Linha 503: PEC-0503 - TRAVA DO CARTUCHO G5
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0503' OR UPPER(TRIM(nome)) = UPPER('TRAVA DO CARTUCHO G5')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0503'),
        nome = 'TRAVA DO CARTUCHO G5',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 7,
        preco_venda = 7.91,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 503) | NCM: 39174090 | Preço Unit.: R$ 7,00 | Valor ST: R$ 0,91 | Preço c/ ST: R$ 7,91',
        ativo = true
    WHERE codigo = 'PEC-0503' OR UPPER(TRIM(nome)) = UPPER('TRAVA DO CARTUCHO G5');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0503', 'TRAVA DO CARTUCHO G5', 'Peças', 'produto', 'UN', '39174090',
      7, 7.91, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 503) | NCM: 39174090 | Preço Unit.: R$ 7,00 | Valor ST: R$ 0,91 | Preço c/ ST: R$ 7,91', v_fornecedor_id
    );
  END IF;

  -- Linha 504: PEC-0504 - TRAVA PAINEL
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0504' OR UPPER(TRIM(nome)) = UPPER('TRAVA PAINEL')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0504'),
        nome = 'TRAVA PAINEL',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85389010',
        preco_custo = 4,
        preco_venda = 4.52,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 504) | NCM: 85389010 | Preço Unit.: R$ 4,00 | Valor ST: R$ 0,52 | Preço c/ ST: R$ 4,52',
        ativo = true
    WHERE codigo = 'PEC-0504' OR UPPER(TRIM(nome)) = UPPER('TRAVA PAINEL');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0504', 'TRAVA PAINEL', 'Peças', 'produto', 'UN', '85389010',
      4, 4.52, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 504) | NCM: 85389010 | Preço Unit.: R$ 4,00 | Valor ST: R$ 0,52 | Preço c/ ST: R$ 4,52', v_fornecedor_id
    );
  END IF;

  -- Linha 505: PEC-0505 - TRAVA PAINEL IHM NOVO CLORADOR
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0505' OR UPPER(TRIM(nome)) = UPPER('TRAVA PAINEL IHM NOVO CLORADOR')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0505'),
        nome = 'TRAVA PAINEL IHM NOVO CLORADOR',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85389010',
        preco_custo = 4,
        preco_venda = 4.52,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 505) | NCM: 85389010 | Preço Unit.: R$ 4,00 | Valor ST: R$ 0,52 | Preço c/ ST: R$ 4,52',
        ativo = true
    WHERE codigo = 'PEC-0505' OR UPPER(TRIM(nome)) = UPPER('TRAVA PAINEL IHM NOVO CLORADOR');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0505', 'TRAVA PAINEL IHM NOVO CLORADOR', 'Peças', 'produto', 'UN', '85389010',
      4, 4.52, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 505) | NCM: 85389010 | Preço Unit.: R$ 4,00 | Valor ST: R$ 0,52 | Preço c/ ST: R$ 4,52', v_fornecedor_id
    );
  END IF;

  -- Linha 506: PEC-0506 - TRILHO DA CONTACTORA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0506' OR UPPER(TRIM(nome)) = UPPER('TRILHO DA CONTACTORA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0506'),
        nome = 'TRILHO DA CONTACTORA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 5,
        preco_venda = 5.65,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 506) | NCM: 39174090 | Preço Unit.: R$ 5,00 | Valor ST: R$ 0,65 | Preço c/ ST: R$ 5,65',
        ativo = true
    WHERE codigo = 'PEC-0506' OR UPPER(TRIM(nome)) = UPPER('TRILHO DA CONTACTORA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0506', 'TRILHO DA CONTACTORA', 'Peças', 'produto', 'UN', '39174090',
      5, 5.65, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 506) | NCM: 39174090 | Preço Unit.: R$ 5,00 | Valor ST: R$ 0,65 | Preço c/ ST: R$ 5,65', v_fornecedor_id
    );
  END IF;

  -- Linha 507: PEC-0507 - TRILHO DISJUNTORES
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0507' OR UPPER(TRIM(nome)) = UPPER('TRILHO DISJUNTORES')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0507'),
        nome = 'TRILHO DISJUNTORES',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 5,
        preco_venda = 5.65,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 507) | NCM: 39174090 | Preço Unit.: R$ 5,00 | Valor ST: R$ 0,65 | Preço c/ ST: R$ 5,65',
        ativo = true
    WHERE codigo = 'PEC-0507' OR UPPER(TRIM(nome)) = UPPER('TRILHO DISJUNTORES');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0507', 'TRILHO DISJUNTORES', 'Peças', 'produto', 'UN', '39174090',
      5, 5.65, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 507) | NCM: 39174090 | Preço Unit.: R$ 5,00 | Valor ST: R$ 0,65 | Preço c/ ST: R$ 5,65', v_fornecedor_id
    );
  END IF;

  -- Linha 508: PEC-0508 - TUBO DE QUARTZO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0508' OR UPPER(TRIM(nome)) = UPPER('TUBO DE QUARTZO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0508'),
        nome = 'TUBO DE QUARTZO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '70023900',
        preco_custo = 130,
        preco_venda = 130,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 508) | NCM: 70023900 | Preço Unit.: R$ 130,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 130,00',
        ativo = true
    WHERE codigo = 'PEC-0508' OR UPPER(TRIM(nome)) = UPPER('TUBO DE QUARTZO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0508', 'TUBO DE QUARTZO', 'Peças', 'produto', 'UN', '70023900',
      130, 130, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 508) | NCM: 70023900 | Preço Unit.: R$ 130,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 130,00', v_fornecedor_id
    );
  END IF;

  -- Linha 509: PEC-0509 - UNIAO 40 X 40 (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0509' OR UPPER(TRIM(nome)) = UPPER('UNIAO 40 X 40 (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0509'),
        nome = 'UNIAO 40 X 40 (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 115,
        preco_venda = 129.9,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 509) | NCM: 39174090 | Preço Unit.: R$ 115,00 | Valor ST: R$ 14,90 | Preço c/ ST: R$ 129,90',
        ativo = true
    WHERE codigo = 'PEC-0509' OR UPPER(TRIM(nome)) = UPPER('UNIAO 40 X 40 (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0509', 'UNIAO 40 X 40 (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      115, 129.9, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 509) | NCM: 39174090 | Preço Unit.: R$ 115,00 | Valor ST: R$ 14,90 | Preço c/ ST: R$ 129,90', v_fornecedor_id
    );
  END IF;

  -- Linha 510: PEC-0510 - UNIAO 40 X 50 (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0510' OR UPPER(TRIM(nome)) = UPPER('UNIAO 40 X 50 (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0510'),
        nome = 'UNIAO 40 X 50 (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 115,
        preco_venda = 129.9,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 510) | NCM: 39174090 | Preço Unit.: R$ 115,00 | Valor ST: R$ 14,90 | Preço c/ ST: R$ 129,90',
        ativo = true
    WHERE codigo = 'PEC-0510' OR UPPER(TRIM(nome)) = UPPER('UNIAO 40 X 50 (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0510', 'UNIAO 40 X 50 (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      115, 129.9, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 510) | NCM: 39174090 | Preço Unit.: R$ 115,00 | Valor ST: R$ 14,90 | Preço c/ ST: R$ 129,90', v_fornecedor_id
    );
  END IF;

  -- Linha 511: PEC-0511 - UNIAO 50 C/ ADAPTADOR (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0511' OR UPPER(TRIM(nome)) = UPPER('UNIAO 50 C/ ADAPTADOR (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0511'),
        nome = 'UNIAO 50 C/ ADAPTADOR (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 165,
        preco_venda = 186.38,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 511) | NCM: 39174090 | Preço Unit.: R$ 165,00 | Valor ST: R$ 21,38 | Preço c/ ST: R$ 186,38',
        ativo = true
    WHERE codigo = 'PEC-0511' OR UPPER(TRIM(nome)) = UPPER('UNIAO 50 C/ ADAPTADOR (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0511', 'UNIAO 50 C/ ADAPTADOR (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      165, 186.38, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 511) | NCM: 39174090 | Preço Unit.: R$ 165,00 | Valor ST: R$ 21,38 | Preço c/ ST: R$ 186,38', v_fornecedor_id
    );
  END IF;

  -- Linha 512: PEC-0512 - UNIAO 50 X 40 (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0512' OR UPPER(TRIM(nome)) = UPPER('UNIAO 50 X 40 (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0512'),
        nome = 'UNIAO 50 X 40 (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 115,
        preco_venda = 129.9,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 512) | NCM: 39174090 | Preço Unit.: R$ 115,00 | Valor ST: R$ 14,90 | Preço c/ ST: R$ 129,90',
        ativo = true
    WHERE codigo = 'PEC-0512' OR UPPER(TRIM(nome)) = UPPER('UNIAO 50 X 40 (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0512', 'UNIAO 50 X 40 (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      115, 129.9, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 512) | NCM: 39174090 | Preço Unit.: R$ 115,00 | Valor ST: R$ 14,90 | Preço c/ ST: R$ 129,90', v_fornecedor_id
    );
  END IF;

  -- Linha 513: PEC-0513 - UNIAO 50 X 50 (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0513' OR UPPER(TRIM(nome)) = UPPER('UNIAO 50 X 50 (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0513'),
        nome = 'UNIAO 50 X 50 (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 115,
        preco_venda = 129.9,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 513) | NCM: 39174090 | Preço Unit.: R$ 115,00 | Valor ST: R$ 14,90 | Preço c/ ST: R$ 129,90',
        ativo = true
    WHERE codigo = 'PEC-0513' OR UPPER(TRIM(nome)) = UPPER('UNIAO 50 X 50 (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0513', 'UNIAO 50 X 50 (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      115, 129.9, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 513) | NCM: 39174090 | Preço Unit.: R$ 115,00 | Valor ST: R$ 14,90 | Preço c/ ST: R$ 129,90', v_fornecedor_id
    );
  END IF;

  -- Linha 514: PEC-0514 - VALVULA DE CONTROLE SAUNA - MISTURADOR
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0514' OR UPPER(TRIM(nome)) = UPPER('VALVULA DE CONTROLE SAUNA - MISTURADOR')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0514'),
        nome = 'VALVULA DE CONTROLE SAUNA - MISTURADOR',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '90191000',
        preco_custo = 99,
        preco_venda = 99,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 514) | NCM: 90191000 | Preço Unit.: R$ 99,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 99,00',
        ativo = true
    WHERE codigo = 'PEC-0514' OR UPPER(TRIM(nome)) = UPPER('VALVULA DE CONTROLE SAUNA - MISTURADOR');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0514', 'VALVULA DE CONTROLE SAUNA - MISTURADOR', 'Peças', 'produto', 'UN', '90191000',
      99, 99, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 514) | NCM: 90191000 | Preço Unit.: R$ 99,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 99,00', v_fornecedor_id
    );
  END IF;

  -- Linha 515: PEC-0515 - VALVULA DE DRENAGEM SPA LUXO
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0515' OR UPPER(TRIM(nome)) = UPPER('VALVULA DE DRENAGEM SPA LUXO')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0515'),
        nome = 'VALVULA DE DRENAGEM SPA LUXO',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 225,
        preco_venda = 254.16,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 515) | NCM: 39174090 | Preço Unit.: R$ 225,00 | Valor ST: R$ 29,16 | Preço c/ ST: R$ 254,16',
        ativo = true
    WHERE codigo = 'PEC-0515' OR UPPER(TRIM(nome)) = UPPER('VALVULA DE DRENAGEM SPA LUXO');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0515', 'VALVULA DE DRENAGEM SPA LUXO', 'Peças', 'produto', 'UN', '39174090',
      225, 254.16, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 515) | NCM: 39174090 | Preço Unit.: R$ 225,00 | Valor ST: R$ 29,16 | Preço c/ ST: R$ 254,16', v_fornecedor_id
    );
  END IF;

  -- Linha 516: PEC-0516 - VALVULA DE RETENCAO 40MM TRANSLUCIDA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0516' OR UPPER(TRIM(nome)) = UPPER('VALVULA DE RETENCAO 40MM TRANSLUCIDA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0516'),
        nome = 'VALVULA DE RETENCAO 40MM TRANSLUCIDA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84813000',
        preco_custo = 500,
        preco_venda = 576.5,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 516) | NCM: 84813000 | Preço Unit.: R$ 500,00 | Valor ST: R$ 76,50 | Preço c/ ST: R$ 576,50',
        ativo = true
    WHERE codigo = 'PEC-0516' OR UPPER(TRIM(nome)) = UPPER('VALVULA DE RETENCAO 40MM TRANSLUCIDA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0516', 'VALVULA DE RETENCAO 40MM TRANSLUCIDA', 'Peças', 'produto', 'UN', '84813000',
      500, 576.5, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 516) | NCM: 84813000 | Preço Unit.: R$ 500,00 | Valor ST: R$ 76,50 | Preço c/ ST: R$ 576,50', v_fornecedor_id
    );
  END IF;

  -- Linha 517: PEC-0517 - VALVULA DE RETENCAO 50MM TRANSLUCIDA
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0517' OR UPPER(TRIM(nome)) = UPPER('VALVULA DE RETENCAO 50MM TRANSLUCIDA')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0517'),
        nome = 'VALVULA DE RETENCAO 50MM TRANSLUCIDA',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84813000',
        preco_custo = 600,
        preco_venda = 691.8,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 517) | NCM: 84813000 | Preço Unit.: R$ 600,00 | Valor ST: R$ 91,80 | Preço c/ ST: R$ 691,80',
        ativo = true
    WHERE codigo = 'PEC-0517' OR UPPER(TRIM(nome)) = UPPER('VALVULA DE RETENCAO 50MM TRANSLUCIDA');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0517', 'VALVULA DE RETENCAO 50MM TRANSLUCIDA', 'Peças', 'produto', 'UN', '84813000',
      600, 691.8, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 517) | NCM: 84813000 | Preço Unit.: R$ 600,00 | Valor ST: R$ 91,80 | Preço c/ ST: R$ 691,80', v_fornecedor_id
    );
  END IF;

  -- Linha 518: PEC-0518 - VALVULA PARA CONTROLE DE PRESSÃO COM ATUADOR
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0518' OR UPPER(TRIM(nome)) = UPPER('VALVULA PARA CONTROLE DE PRESSÃO COM ATUADOR')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0518'),
        nome = 'VALVULA PARA CONTROLE DE PRESSÃO COM ATUADOR',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84818029',
        preco_custo = 1999,
        preco_venda = 2304.85,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 518) | NCM: 84818029 | Preço Unit.: R$ 1.999,00 | Valor ST: R$ 305,85 | Preço c/ ST: R$ 2.304,85',
        ativo = true
    WHERE codigo = 'PEC-0518' OR UPPER(TRIM(nome)) = UPPER('VALVULA PARA CONTROLE DE PRESSÃO COM ATUADOR');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0518', 'VALVULA PARA CONTROLE DE PRESSÃO COM ATUADOR', 'Peças', 'produto', 'UN', '84818029',
      1999, 2304.85, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 518) | NCM: 84818029 | Preço Unit.: R$ 1.999,00 | Valor ST: R$ 305,85 | Preço c/ ST: R$ 2.304,85', v_fornecedor_id
    );
  END IF;

  -- Linha 519: PEC-0519 - VEDAÇÃO DO ADAPTADOR REGISTRO (CX C/10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0519' OR UPPER(TRIM(nome)) = UPPER('VEDAÇÃO DO ADAPTADOR REGISTRO (CX C/10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0519'),
        nome = 'VEDAÇÃO DO ADAPTADOR REGISTRO (CX C/10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 20,
        preco_venda = 22.59,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 519) | NCM: 39172900 | Preço Unit.: R$ 20,00 | Valor ST: R$ 2,59 | Preço c/ ST: R$ 22,59',
        ativo = true
    WHERE codigo = 'PEC-0519' OR UPPER(TRIM(nome)) = UPPER('VEDAÇÃO DO ADAPTADOR REGISTRO (CX C/10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0519', 'VEDAÇÃO DO ADAPTADOR REGISTRO (CX C/10 UN)', 'Peças', 'produto', 'UN', '39172900',
      20, 22.59, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 519) | NCM: 39172900 | Preço Unit.: R$ 20,00 | Valor ST: R$ 2,59 | Preço c/ ST: R$ 22,59', v_fornecedor_id
    );
  END IF;

  -- Linha 520: PEC-0520 - VEDAÇÃO DO FLANGE 150 (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0520' OR UPPER(TRIM(nome)) = UPPER('VEDAÇÃO DO FLANGE 150 (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0520'),
        nome = 'VEDAÇÃO DO FLANGE 150 (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 55,
        preco_venda = 62.13,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 520) | NCM: 39174090 | Preço Unit.: R$ 55,00 | Valor ST: R$ 7,13 | Preço c/ ST: R$ 62,13',
        ativo = true
    WHERE codigo = 'PEC-0520' OR UPPER(TRIM(nome)) = UPPER('VEDAÇÃO DO FLANGE 150 (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0520', 'VEDAÇÃO DO FLANGE 150 (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39174090',
      55, 62.13, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 520) | NCM: 39174090 | Preço Unit.: R$ 55,00 | Valor ST: R$ 7,13 | Preço c/ ST: R$ 62,13', v_fornecedor_id
    );
  END IF;

  -- Linha 521: PEC-0521 - VENTOINHA THERMAS 15300 BTUS
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0521' OR UPPER(TRIM(nome)) = UPPER('VENTOINHA THERMAS 15300 BTUS')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0521'),
        nome = 'VENTOINHA THERMAS 15300 BTUS',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 170,
        preco_venda = 213.28,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 521) | NCM: 39269090 | Preço Unit.: R$ 170,00 | Valor ST: R$ 43,28 | Preço c/ ST: R$ 213,28',
        ativo = true
    WHERE codigo = 'PEC-0521' OR UPPER(TRIM(nome)) = UPPER('VENTOINHA THERMAS 15300 BTUS');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0521', 'VENTOINHA THERMAS 15300 BTUS', 'Peças', 'produto', 'UN', '39269090',
      170, 213.28, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 521) | NCM: 39269090 | Preço Unit.: R$ 170,00 | Valor ST: R$ 43,28 | Preço c/ ST: R$ 213,28', v_fornecedor_id
    );
  END IF;

  -- Linha 522: PEC-0522 - VENTOINHA THERMAS 26000/42600 BTUS
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0522' OR UPPER(TRIM(nome)) = UPPER('VENTOINHA THERMAS 26000/42600 BTUS')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0522'),
        nome = 'VENTOINHA THERMAS 26000/42600 BTUS',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 230,
        preco_venda = 288.56,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 522) | NCM: 39269090 | Preço Unit.: R$ 230,00 | Valor ST: R$ 58,56 | Preço c/ ST: R$ 288,56',
        ativo = true
    WHERE codigo = 'PEC-0522' OR UPPER(TRIM(nome)) = UPPER('VENTOINHA THERMAS 26000/42600 BTUS');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0522', 'VENTOINHA THERMAS 26000/42600 BTUS', 'Peças', 'produto', 'UN', '39269090',
      230, 288.56, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 522) | NCM: 39269090 | Preço Unit.: R$ 230,00 | Valor ST: R$ 58,56 | Preço c/ ST: R$ 288,56', v_fornecedor_id
    );
  END IF;

  -- Linha 523: PEC-0523 - VENTOINHA THERMAS 9800 BTUS
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0523' OR UPPER(TRIM(nome)) = UPPER('VENTOINHA THERMAS 9800 BTUS')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0523'),
        nome = 'VENTOINHA THERMAS 9800 BTUS',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 170,
        preco_venda = 213.28,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 523) | NCM: 39269090 | Preço Unit.: R$ 170,00 | Valor ST: R$ 43,28 | Preço c/ ST: R$ 213,28',
        ativo = true
    WHERE codigo = 'PEC-0523' OR UPPER(TRIM(nome)) = UPPER('VENTOINHA THERMAS 9800 BTUS');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0523', 'VENTOINHA THERMAS 9800 BTUS', 'Peças', 'produto', 'UN', '39269090',
      170, 213.28, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 523) | NCM: 39269090 | Preço Unit.: R$ 170,00 | Valor ST: R$ 43,28 | Preço c/ ST: R$ 213,28', v_fornecedor_id
    );
  END IF;

  -- Linha 524: PEC-0524 - VISOR DA TAMPA G2/G3
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0524' OR UPPER(TRIM(nome)) = UPPER('VISOR DA TAMPA G2/G3')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0524'),
        nome = 'VISOR DA TAMPA G2/G3',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 25,
        preco_venda = 28.24,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 524) | NCM: 39174090 | Preço Unit.: R$ 25,00 | Valor ST: R$ 3,24 | Preço c/ ST: R$ 28,24',
        ativo = true
    WHERE codigo = 'PEC-0524' OR UPPER(TRIM(nome)) = UPPER('VISOR DA TAMPA G2/G3');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0524', 'VISOR DA TAMPA G2/G3', 'Peças', 'produto', 'UN', '39174090',
      25, 28.24, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 524) | NCM: 39174090 | Preço Unit.: R$ 25,00 | Valor ST: R$ 3,24 | Preço c/ ST: R$ 28,24', v_fornecedor_id
    );
  END IF;

  -- Linha 525: PEC-0525 - VISOR DA TAMPA G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0525' OR UPPER(TRIM(nome)) = UPPER('VISOR DA TAMPA G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0525'),
        nome = 'VISOR DA TAMPA G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 100,
        preco_venda = 112.96,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 525) | NCM: 39172900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96',
        ativo = true
    WHERE codigo = 'PEC-0525' OR UPPER(TRIM(nome)) = UPPER('VISOR DA TAMPA G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0525', 'VISOR DA TAMPA G4', 'Peças', 'produto', 'UN', '39172900',
      100, 112.96, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 525) | NCM: 39172900 | Preço Unit.: R$ 100,00 | Valor ST: R$ 12,96 | Preço c/ ST: R$ 112,96', v_fornecedor_id
    );
  END IF;

  -- Linha 526: PEC-0526 - VISOR DA TAMPA G6
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0526' OR UPPER(TRIM(nome)) = UPPER('VISOR DA TAMPA G6')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0526'),
        nome = 'VISOR DA TAMPA G6',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 195,
        preco_venda = 220.27,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 526) | NCM: 39172900 | Preço Unit.: R$ 195,00 | Valor ST: R$ 25,27 | Preço c/ ST: R$ 220,27',
        ativo = true
    WHERE codigo = 'PEC-0526' OR UPPER(TRIM(nome)) = UPPER('VISOR DA TAMPA G6');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0526', 'VISOR DA TAMPA G6', 'Peças', 'produto', 'UN', '39172900',
      195, 220.27, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 526) | NCM: 39172900 | Preço Unit.: R$ 195,00 | Valor ST: R$ 25,27 | Preço c/ ST: R$ 220,27', v_fornecedor_id
    );
  END IF;

  -- Linha 527: PEC-0527 - VISOR DA TAMPA G7
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0527' OR UPPER(TRIM(nome)) = UPPER('VISOR DA TAMPA G7')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0527'),
        nome = 'VISOR DA TAMPA G7',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 195,
        preco_venda = 220.27,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 527) | NCM: 39172900 | Preço Unit.: R$ 195,00 | Valor ST: R$ 25,27 | Preço c/ ST: R$ 220,27',
        ativo = true
    WHERE codigo = 'PEC-0527' OR UPPER(TRIM(nome)) = UPPER('VISOR DA TAMPA G7');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0527', 'VISOR DA TAMPA G7', 'Peças', 'produto', 'UN', '39172900',
      195, 220.27, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 527) | NCM: 39172900 | Preço Unit.: R$ 195,00 | Valor ST: R$ 25,27 | Preço c/ ST: R$ 220,27', v_fornecedor_id
    );
  END IF;

  -- Linha 528: PEC-0528 - VISOR DO PAINEL DE CONTR. ACRIL. P/ BOMBA AQUEC.
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0528' OR UPPER(TRIM(nome)) = UPPER('VISOR DO PAINEL DE CONTR. ACRIL. P/ BOMBA AQUEC.')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0528'),
        nome = 'VISOR DO PAINEL DE CONTR. ACRIL. P/ BOMBA AQUEC.',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '84189900',
        preco_custo = 145,
        preco_venda = 145,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 528) | NCM: 84189900 | Preço Unit.: R$ 145,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 145,00',
        ativo = true
    WHERE codigo = 'PEC-0528' OR UPPER(TRIM(nome)) = UPPER('VISOR DO PAINEL DE CONTR. ACRIL. P/ BOMBA AQUEC.');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0528', 'VISOR DO PAINEL DE CONTR. ACRIL. P/ BOMBA AQUEC.', 'Peças', 'produto', 'UN', '84189900',
      145, 145, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 528) | NCM: 84189900 | Preço Unit.: R$ 145,00 | Valor ST: R$ 0,00 | Preço c/ ST: R$ 145,00', v_fornecedor_id
    );
  END IF;

  -- Linha 529: PEC-0529 - VISOR IHM COMPLETO ELETRONIC
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0529' OR UPPER(TRIM(nome)) = UPPER('VISOR IHM COMPLETO ELETRONIC')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0529'),
        nome = 'VISOR IHM COMPLETO ELETRONIC',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '85389010',
        preco_custo = 950,
        preco_venda = 1073.65,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 529) | NCM: 85389010 | Preço Unit.: R$ 950,00 | Valor ST: R$ 123,65 | Preço c/ ST: R$ 1.073,65',
        ativo = true
    WHERE codigo = 'PEC-0529' OR UPPER(TRIM(nome)) = UPPER('VISOR IHM COMPLETO ELETRONIC');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0529', 'VISOR IHM COMPLETO ELETRONIC', 'Peças', 'produto', 'UN', '85389010',
      950, 1073.65, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 529) | NCM: 85389010 | Preço Unit.: R$ 950,00 | Valor ST: R$ 123,65 | Preço c/ ST: R$ 1.073,65', v_fornecedor_id
    );
  END IF;

  -- Linha 530: PEC-0530 - VISOR MAIOR Q.C. MAX
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0530' OR UPPER(TRIM(nome)) = UPPER('VISOR MAIOR Q.C. MAX')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0530'),
        nome = 'VISOR MAIOR Q.C. MAX',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 40,
        preco_venda = 50.18,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 530) | NCM: 39269090 | Preço Unit.: R$ 40,00 | Valor ST: R$ 10,18 | Preço c/ ST: R$ 50,18',
        ativo = true
    WHERE codigo = 'PEC-0530' OR UPPER(TRIM(nome)) = UPPER('VISOR MAIOR Q.C. MAX');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0530', 'VISOR MAIOR Q.C. MAX', 'Peças', 'produto', 'UN', '39269090',
      40, 50.18, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 530) | NCM: 39269090 | Preço Unit.: R$ 40,00 | Valor ST: R$ 10,18 | Preço c/ ST: R$ 50,18', v_fornecedor_id
    );
  END IF;

  -- Linha 531: PEC-0531 - VISOR MENOR Q.C. MAX
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0531' OR UPPER(TRIM(nome)) = UPPER('VISOR MENOR Q.C. MAX')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0531'),
        nome = 'VISOR MENOR Q.C. MAX',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39269090',
        preco_custo = 40,
        preco_venda = 50.18,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 531) | NCM: 39269090 | Preço Unit.: R$ 40,00 | Valor ST: R$ 10,18 | Preço c/ ST: R$ 50,18',
        ativo = true
    WHERE codigo = 'PEC-0531' OR UPPER(TRIM(nome)) = UPPER('VISOR MENOR Q.C. MAX');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0531', 'VISOR MENOR Q.C. MAX', 'Peças', 'produto', 'UN', '39269090',
      40, 50.18, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 531) | NCM: 39269090 | Preço Unit.: R$ 40,00 | Valor ST: R$ 10,18 | Preço c/ ST: R$ 50,18', v_fornecedor_id
    );
  END IF;

  -- Linha 532: PEC-0532 - VISOR MOTOBOMBA/ESCORVANTE (CX C/ 05 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0532' OR UPPER(TRIM(nome)) = UPPER('VISOR MOTOBOMBA/ESCORVANTE (CX C/ 05 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0532'),
        nome = 'VISOR MOTOBOMBA/ESCORVANTE (CX C/ 05 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39172900',
        preco_custo = 85,
        preco_venda = 96.02,
        unidades_por_compra = 5,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 532) | NCM: 39172900 | Preço Unit.: R$ 85,00 | Valor ST: R$ 11,02 | Preço c/ ST: R$ 96,02',
        ativo = true
    WHERE codigo = 'PEC-0532' OR UPPER(TRIM(nome)) = UPPER('VISOR MOTOBOMBA/ESCORVANTE (CX C/ 05 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0532', 'VISOR MOTOBOMBA/ESCORVANTE (CX C/ 05 UN)', 'Peças', 'produto', 'UN', '39172900',
      85, 96.02, 0, 0,
      5, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 532) | NCM: 39172900 | Preço Unit.: R$ 85,00 | Valor ST: R$ 11,02 | Preço c/ ST: R$ 96,02', v_fornecedor_id
    );
  END IF;

  -- Linha 533: PEC-0533 - VISOR TAMPA UV G4
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0533' OR UPPER(TRIM(nome)) = UPPER('VISOR TAMPA UV G4')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0533'),
        nome = 'VISOR TAMPA UV G4',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 5,
        preco_venda = 5.65,
        unidades_por_compra = 1,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 533) | NCM: 39174090 | Preço Unit.: R$ 5,00 | Valor ST: R$ 0,65 | Preço c/ ST: R$ 5,65',
        ativo = true
    WHERE codigo = 'PEC-0533' OR UPPER(TRIM(nome)) = UPPER('VISOR TAMPA UV G4');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0533', 'VISOR TAMPA UV G4', 'Peças', 'produto', 'UN', '39174090',
      5, 5.65, 0, 0,
      1, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 533) | NCM: 39174090 | Preço Unit.: R$ 5,00 | Valor ST: R$ 0,65 | Preço c/ ST: R$ 5,65', v_fornecedor_id
    );
  END IF;

  -- Linha 534: PEC-0534 - Y 25MM (CX C/ 10 UN)
  IF EXISTS (SELECT 1 FROM public.produtos WHERE codigo = 'PEC-0534' OR UPPER(TRIM(nome)) = UPPER('Y 25MM (CX C/ 10 UN)')) THEN
    UPDATE public.produtos
    SET codigo = COALESCE(codigo, 'PEC-0534'),
        nome = 'Y 25MM (CX C/ 10 UN)',
        categoria = 'Peças',
        tipo = 'produto',
        unidade = 'UN',
        ncm = '39174090',
        preco_custo = 80,
        preco_venda = 90.37,
        unidades_por_compra = 10,
        sob_encomenda = false,
        fornecedor_id = COALESCE(fornecedor_id, v_fornecedor_id),
        descricao = 'Tabela de Peças e Acessórios iGUi / Splash (Linha 534) | NCM: 39174090 | Preço Unit.: R$ 80,00 | Valor ST: R$ 10,37 | Preço c/ ST: R$ 90,37',
        ativo = true
    WHERE codigo = 'PEC-0534' OR UPPER(TRIM(nome)) = UPPER('Y 25MM (CX C/ 10 UN)');
  ELSE
    INSERT INTO public.produtos (
      codigo, nome, categoria, tipo, unidade, ncm,
      preco_custo, preco_venda, estoque_atual, estoque_minimo,
      unidades_por_compra, sob_encomenda, ativo, descricao, fornecedor_id
    ) VALUES (
      'PEC-0534', 'Y 25MM (CX C/ 10 UN)', 'Peças', 'produto', 'UN', '39174090',
      80, 90.37, 0, 0,
      10, false, true, 'Tabela de Peças e Acessórios iGUi / Splash (Linha 534) | NCM: 39174090 | Preço Unit.: R$ 80,00 | Valor ST: R$ 10,37 | Preço c/ ST: R$ 90,37', v_fornecedor_id
    );
  END IF;

END $$;
