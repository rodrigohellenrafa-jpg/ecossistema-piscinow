-- Migration: Adicionar/Atualizar Tabela Oficial de Porcelanas & Pastilhas Atlas por Modelo de Piscina
DO $$
DECLARE
  v_splash_fornecedor_id uuid;
BEGIN
  -- 1. Obtém fornecedor Splash Piscinas
  SELECT id INTO v_splash_fornecedor_id
  FROM public.fornecedores
  WHERE nome ILIKE '%Splash%'
  LIMIT 1;

  -- 2. Upsert de cada um dos 31 modelos de Porcelanas Atlas
  INSERT INTO public.produtos (
    codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, 
    estoque_atual, estoque_minimo, sob_encomenda, fornecedor_id, 
    modelo_pastilha, descricao, ativo
  ) VALUES
    ('PAS-SPL-TRAD-350', 'Porcelana / Pastilha Atlas - Piscina Tradicional 3,50m', 'Acabamento', 'produto', 'UN', 0, 1100, 0, 0, true, v_splash_fornecedor_id, 'TRAD 3,5', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Tradicional 3,50m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-TRAD-400', 'Porcelana / Pastilha Atlas - Piscina Tradicional 4,00m', 'Acabamento', 'produto', 'UN', 0, 1228, 0, 0, true, v_splash_fornecedor_id, 'TRAD 4', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Tradicional 4,00m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-TRAD-400-140', 'Porcelana / Pastilha Atlas - Piscina Tradicional 4,00m c/ 1,40m', 'Acabamento', 'produto', 'UN', 0, 1228, 0, 0, true, v_splash_fornecedor_id, 'TRAD 4 1,40', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Tradicional 4,00m c/ 1,40m profundidade. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-TRAD-450', 'Porcelana / Pastilha Atlas - Piscina Tradicional 4,50m', 'Acabamento', 'produto', 'UN', 0, 1434, 0, 0, true, v_splash_fornecedor_id, 'TRAD 4,5', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Tradicional 4,50m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-TRAD-500-140', 'Porcelana / Pastilha Atlas - Piscina Tradicional 5,00m c/ 1,40m', 'Acabamento', 'produto', 'UN', 0, 1470, 0, 0, true, v_splash_fornecedor_id, 'TRAD 5 1,40', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Tradicional 5,00m c/ 1,40m profundidade. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-TRAD-500', 'Porcelana / Pastilha Atlas - Piscina Tradicional 5,00m', 'Acabamento', 'produto', 'UN', 0, 1470, 0, 0, true, v_splash_fornecedor_id, 'TRAD 5', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Tradicional 5,00m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-BON-300', 'Porcelana / Pastilha Atlas - Piscina Bonaire 3,00m', 'Acabamento', 'produto', 'UN', 0, 1576, 0, 0, true, v_splash_fornecedor_id, 'BONAIRE 3', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Bonaire 3,00m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-TRAD-550', 'Porcelana / Pastilha Atlas - Piscina Tradicional 5,50m', 'Acabamento', 'produto', 'UN', 0, 1711, 0, 0, true, v_splash_fornecedor_id, 'TRAD 5,5', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Tradicional 5,50m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-TRAD-600', 'Porcelana / Pastilha Atlas - Piscina Tradicional 6,00m', 'Acabamento', 'produto', 'UN', 0, 1732, 0, 0, true, v_splash_fornecedor_id, 'TRAD 6', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Tradicional 6,00m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-PRA-600', 'Porcelana / Pastilha Atlas - Piscina Prainha 6,00m', 'Acabamento', 'produto', 'UN', 0, 1732, 0, 0, true, v_splash_fornecedor_id, 'PRAINHA 6', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Prainha 6,00m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-TRAD-700', 'Porcelana / Pastilha Atlas - Piscina Tradicional 7,00m', 'Acabamento', 'produto', 'UN', 0, 1967, 0, 0, true, v_splash_fornecedor_id, 'TRAD 7', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Tradicional 7,00m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-TRAD-650', 'Porcelana / Pastilha Atlas - Piscina Tradicional 6,50m', 'Acabamento', 'produto', 'UN', 0, 1988, 0, 0, true, v_splash_fornecedor_id, 'TRAD 6,5', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Tradicional 6,50m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-BON-400', 'Porcelana / Pastilha Atlas - Piscina Bonaire 4,00m', 'Acabamento', 'produto', 'UN', 0, 1988, 0, 0, true, v_splash_fornecedor_id, 'BONAIRE 4', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Bonaire 4,00m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-TRAD-600-SPA', 'Porcelana / Pastilha Atlas - Piscina Tradicional 6,00m c/ SPA', 'Acabamento', 'produto', 'UN', 0, 2073, 0, 0, true, v_splash_fornecedor_id, 'TRAD 6 SPA', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Tradicional 6,00m c/ SPA. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-NAS-400', 'Porcelana / Pastilha Atlas - Piscina Nassau 4,00m', 'Acabamento', 'produto', 'UN', 0, 2158, 0, 0, true, v_splash_fornecedor_id, 'NASSAU', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Nassau 4,00m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-TRAD-750', 'Porcelana / Pastilha Atlas - Piscina Tradicional 7,50m', 'Acabamento', 'produto', 'UN', 0, 2173, 0, 0, true, v_splash_fornecedor_id, '1 TRAD 7,5', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Tradicional 7,50m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-PRA-700', 'Porcelana / Pastilha Atlas - Piscina Prainha 7,00m', 'Acabamento', 'produto', 'UN', 0, 2180, 0, 0, true, v_splash_fornecedor_id, 'PRAINHA 7', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Prainha 7,00m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-TRAD-800', 'Porcelana / Pastilha Atlas - Piscina Tradicional 8,00m', 'Acabamento', 'produto', 'UN', 0, 2237, 0, 0, true, v_splash_fornecedor_id, 'TRAD 8', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Tradicional 8,00m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-PRA-800', 'Porcelana / Pastilha Atlas - Piscina Prainha 8,00m', 'Acabamento', 'produto', 'UN', 0, 2237, 0, 0, true, v_splash_fornecedor_id, 'PRAINHA 8', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Prainha 8,00m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-TOR-500', 'Porcelana / Pastilha Atlas - Piscina Tortuga 5,00m', 'Acabamento', 'produto', 'UN', 0, 2272, 0, 0, true, v_splash_fornecedor_id, 'TORTUGA 5', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Tortuga 5,00m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-BON-500', 'Porcelana / Pastilha Atlas - Piscina Bonaire 5,00m', 'Acabamento', 'produto', 'UN', 0, 2449, 0, 0, true, v_splash_fornecedor_id, 'BONAIRE 5', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Bonaire 5,00m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-TRAD-700-SPA', 'Porcelana / Pastilha Atlas - Piscina Tradicional 7,00m c/ SPA', 'Acabamento', 'produto', 'UN', 0, 2471, 0, 0, true, v_splash_fornecedor_id, 'TRAD 7 SPA', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Tradicional 7,00m c/ SPA. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-TRAD-850', 'Porcelana / Pastilha Atlas - Piscina Tradicional 8,50m', 'Acabamento', 'produto', 'UN', 0, 2499, 0, 0, true, v_splash_fornecedor_id, 'TRAD 8.5', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Tradicional 8,50m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-TRAD-800-SPA', 'Porcelana / Pastilha Atlas - Piscina Tradicional 8,00m c/ SPA', 'Acabamento', 'produto', 'UN', 0, 2648, 0, 0, true, v_splash_fornecedor_id, 'TRAD 8 SPA', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Tradicional 8,00m c/ SPA. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-TRAD-900', 'Porcelana / Pastilha Atlas - Piscina Tradicional 9,00m', 'Acabamento', 'produto', 'UN', 0, 2698, 0, 0, true, v_splash_fornecedor_id, 'TRAD 9', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Tradicional 9,00m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-BON-600', 'Porcelana / Pastilha Atlas - Piscina Bonaire 6,00m', 'Acabamento', 'produto', 'UN', 0, 3266, 0, 0, true, v_splash_fornecedor_id, 'BONAIRE 6', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Bonaire 6,00m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-TOR-700', 'Porcelana / Pastilha Atlas - Piscina Tortuga 7,00m', 'Acabamento', 'produto', 'UN', 0, 3266, 0, 0, true, v_splash_fornecedor_id, 'TORTUGA 7', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Tortuga 7,00m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-BON-700', 'Porcelana / Pastilha Atlas - Piscina Bonaire 7,00m', 'Acabamento', 'produto', 'UN', 0, 3443, 0, 0, true, v_splash_fornecedor_id, 'BONAIRE 7', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Bonaire 7,00m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-BON-800', 'Porcelana / Pastilha Atlas - Piscina Bonaire 8,00m', 'Acabamento', 'produto', 'UN', 0, 3905, 0, 0, true, v_splash_fornecedor_id, 'BONAIRE 8', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Bonaire 8,00m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-TOR-1000', 'Porcelana / Pastilha Atlas - Piscina Tortuga 10,00m', 'Acabamento', 'produto', 'UN', 0, 4906, 0, 0, true, v_splash_fornecedor_id, 'TORTUGA 10', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Tortuga 10,00m. Tabela Oficial de Porcelanas Splash 2026.', true),
    ('PAS-SPL-ATA-900', 'Porcelana / Pastilha Atlas - Piscina Atalaia', 'Acabamento', 'produto', 'UN', 0, 5538, 0, 0, true, v_splash_fornecedor_id, 'ATALAIA', 'Revestimento em Pastilha de Porcelana Atlas para piscina Splash Atalaia. Tabela Oficial de Porcelanas Splash 2026.', true)
  ON CONFLICT (codigo) DO UPDATE
  SET
    nome = EXCLUDED.nome,
    categoria = EXCLUDED.categoria,
    tipo = EXCLUDED.tipo,
    unidade = EXCLUDED.unidade,
    preco_venda = EXCLUDED.preco_venda,
    modelo_pastilha = EXCLUDED.modelo_pastilha,
    descricao = EXCLUDED.descricao,
    sob_encomenda = true,
    ativo = true;
END $$;
