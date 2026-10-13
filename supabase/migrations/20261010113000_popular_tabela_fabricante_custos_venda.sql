-- Migration: Popular tabela_fabricante com os 67 modelos da tabela oficial de Custo x Venda de Piscinas
INSERT INTO public.tabela_fabricante (modelo, linha, custo_casco, custo_filtro, frete, instalacao, imposto, lucro, preco_venda, observacoes, ativo)
VALUES
  -- Italiana
  ('Italiana 3', 'Italiana', 2491, 2600, 275, 900, 215, 3500, 9981, NULL, true),
  ('Italiana 3,2', 'Italiana', 4484, 2600, 330, 960, 275, 4000, 12649, NULL, true),
  ('Italiana 3,5', 'Italiana', 3487, 2600, 440, 1050, 260, 4000, 11837, NULL, true),
  ('Italiana 4', 'Italiana', 5875, 2600, 495, 1200, 325, 4000, 14495, NULL, true),
  ('Italiana 5', 'Italiana', 7969, 2600, 550, 1500, 400, 4500, 17519, NULL, true),
  ('Italiana 6', 'Italiana', 10160, 2600, 605, 1800, 475, 5000, 20640, NULL, true),
  ('Italiana 7', 'Italiana', 13345, 2600, 660, 2100, 595, 6000, 25300, NULL, true),
  ('Italiana 8', 'Italiana', 16037, 2600, 715, 2400, 685, 7000, 29437, NULL, true),

  -- Trad (* não incluso a porcelana)
  ('Trad 3,5', 'Trad', 4284, 2600, 440, 1050, 280, 4000, 12654, '* não incluso a porcelana', true),
  ('Trad 3,5 c/ 1,40', 'Trad', 4982, 2600, 440, 1050, 280, 4000, 13352, '* não incluso a porcelana', true),
  ('Trad 4', 'Trad', 4983, 2600, 495, 1200, 300, 4000, 13578, '* não incluso a porcelana', true),
  ('Trad 4 c/ 1,40', 'Trad', 5977, 2600, 495, 1200, 325, 4000, 14597, '* não incluso a porcelana', true),
  ('Trad 4,5', 'Trad', 5977, 2600, 495, 1350, 330, 4000, 14752, '* não incluso a porcelana', true),
  ('Trad 5', 'Trad', 7671, 2600, 550, 1500, 390, 4500, 17211, '* não incluso a porcelana', true),
  ('Trad 5 c/ 1,40', 'Trad', 8468, 2600, 550, 1500, 410, 4500, 18028, '* não incluso a porcelana', true),
  ('Trad 5,5', 'Trad', 9066, 2600, 550, 1650, 425, 4500, 18791, '* não incluso a porcelana', true),
  ('Trad 6', 'Trad', 10461, 2600, 605, 1800, 480, 5000, 20946, '* não incluso a porcelana', true),
  ('Trad 6 Prainha', 'Trad', 9962, 2600, 605, 1800, 470, 5000, 20437, '* não incluso a porcelana', true),
  ('Trad 6 Spa', 'Trad', 11556, 2600, 605, 1800, 505, 5000, 22066, '* não incluso a porcelana', true),
  ('Trad 6,5', 'Trad', 11754, 2600, 605, 1950, 515, 5000, 22424, '* não incluso a porcelana', true),
  ('Trad 7', 'Trad', 12953, 2600, 660, 2100, 575, 6000, 24888, '* não incluso a porcelana', true),
  ('Trad 7 Prainha', 'Trad', 12553, 2600, 660, 2100, 565, 6000, 24478, '* não incluso a porcelana', true),
  ('Trad 7 Spa', 'Trad', 14944, 2600, 660, 2100, 625, 6000, 26929, '* não incluso a porcelana', true),
  ('Trad 7,5', 'Trad', 14447, 2600, 660, 2250, 615, 6000, 26572, '* não incluso a porcelana', true),
  ('Trad 8', 'Trad', 15938, 2600, 715, 2400, 685, 7000, 29338, '* não incluso a porcelana', true),
  ('Trad 8 Prainha', 'Trad', 15143, 2600, 715, 2400, 665, 7000, 28523, '* não incluso a porcelana', true),
  ('Trad 8 Spa', 'Trad', 18331, 2600, 715, 2400, 745, 7000, 31791, '* não incluso a porcelana', true),
  ('Trad 8,5', 'Trad', 17831, 2600, 715, 2550, 735, 7000, 31431, '* não incluso a porcelana', true),
  ('Trad 9', 'Trad', 20523, 2600, 770, 2700, 805, 7000, 34398, '* não incluso a porcelana', true),

  -- Tropical
  ('Tropical 3,5', 'Tropical', 3186, 2600, 440, 1050, 255, 4000, 11531, NULL, true),
  ('Tropical 4', 'Tropical', 4181, 2600, 495, 1200, 280, 4000, 12756, NULL, true),
  ('Tropical 4 c/ 1,40', 'Tropical', 5478, 2600, 495, 1200, 315, 4000, 14088, NULL, true),
  ('Tropical 5', 'Tropical', 6972, 2600, 550, 1500, 360, 4500, 16482, NULL, true),
  ('Tropical 6', 'Tropical', 8667, 2600, 605, 1800, 435, 5000, 19107, NULL, true),
  ('Tropical 6 c/ 1,40', 'Tropical', 8965, 2600, 605, 1800, 445, 5000, 19415, NULL, true),
  ('Tropical 7', 'Tropical', 11655, 2600, 660, 2100, 525, 6000, 23540, NULL, true),
  ('Tropical 8', 'Tropical', 14345, 2600, 715, 2400, 625, 7000, 27685, NULL, true),
  ('Tropical 9', 'Tropical', 17533, 2600, 770, 2700, 710, 7000, 31313, NULL, true),
  ('Tropical 10', 'Tropical', 21716, 2600, 825, 3000, 830, 7500, 36471, NULL, true),

  -- Farol
  ('Farol 4', 'Farol', 5777, 2600, 495, 1200, 320, 4000, 14392, NULL, true),
  ('Farol 5', 'Farol', 8168, 2600, 550, 1500, 400, 4500, 17718, NULL, true),
  ('Farol 6', 'Farol', 10460, 2600, 605, 1800, 480, 5000, 20945, NULL, true),
  ('Farol 7', 'Farol', 14644, 2600, 660, 2100, 615, 6000, 26619, NULL, true),
  ('Farol 8', 'Farol', 17732, 2600, 715, 2400, 730, 7000, 31177, NULL, true),
  ('Farol 9', 'Farol', 20820, 2600, 770, 2700, 815, 7000, 34705, NULL, true),
  ('Farol 10', 'Farol', 26896, 2600, 825, 3000, 985, 7500, 41806, NULL, true),

  -- Cancún
  ('Cancún 3', 'Cancún', 3984, 2600, 275, 900, 265, 4000, 12024, NULL, true),
  ('Cancún 8', 'Cancún', 20721, 2600, 715, 2400, 805, 7000, 34241, NULL, true),
  ('Cancún 10', 'Cancún', 27893, 2600, 825, 3000, 995, 7500, 42813, NULL, true),

  -- Bonaire (* não incluso a porcelana)
  ('Bonaire 3', 'Bonaire', 4881, 2600, 275, 900, 285, 4000, 12941, '* não incluso a porcelana', true),
  ('Bonaire 4', 'Bonaire', 6475, 2600, 495, 1200, 340, 4000, 15110, '* não incluso a porcelana', true),
  ('Bonaire 5', 'Bonaire', 9662, 2600, 550, 1500, 440, 4500, 19252, '* não incluso a porcelana', true),
  ('Bonaire 6', 'Bonaire', 12253, 2600, 605, 1800, 525, 5000, 22783, '* não incluso a porcelana', true),
  ('Bonaire 7', 'Bonaire', 17432, 2600, 660, 2100, 685, 6000, 29477, '* não incluso a porcelana', true),
  ('Bonaire 8', 'Bonaire', 21119, 2600, 715, 2400, 810, 7000, 34644, '* não incluso a porcelana', true),

  -- Tortuga (* não incluso a porcelana)
  ('Tortuga 5', 'Tortuga', 8068, 2600, 550, 1500, 400, 4500, 17618, '* não incluso a porcelana', true),
  ('Tortuga 7', 'Tortuga', 15340, 2600, 660, 2100, 635, 6000, 27335, '* não incluso a porcelana', true),
  ('Tortuga 9', 'Tortuga', 18628, 2600, 770, 2700, 760, 7000, 32458, '* não incluso a porcelana', true),
  ('Tortuga 10', 'Tortuga', 24904, 2600, 825, 3000, 935, 7500, 39764, '* não incluso a porcelana', true),

  -- Atalaia (* não incluso a porcelana)
  ('Atalaia 7', 'Atalaia', 19923, 2600, 660, 2100, 750, 6000, 32033, '* não incluso a porcelana', true),
  ('Atalaia 9', 'Atalaia', 27495, 2600, 770, 2700, 980, 7000, 41545, '* não incluso a porcelana', true),

  -- Nassau (* não incluso a porcelana)
  ('Nassau 4', 'Nassau', 8866, 2600, 495, 1200, 400, 4000, 17561, '* não incluso a porcelana', true),

  -- Modelo / Porcelana (Navagio) (* incluso a porcelana)
  ('Navagio 3', 'Navagio / Porcelana', 6468, 2600, 440, 960, 340, 4000, 14808, '* incluso a porcelana', true),
  ('Navagio 3 acrílico 1,5m', 'Navagio / Porcelana', 9573, 2600, 440, 960, 420, 5500, 19493, '* incluso a porcelana', true),
  ('Navagio 3 acrílico L 1,5m', 'Navagio / Porcelana', 11126, 2600, 440, 960, 455, 5500, 21081, '* incluso a porcelana', true),
  ('Navagio 3 c/ 1,4', 'Navagio / Porcelana', 8066, 2600, 440, 960, 375, 4000, 16441, '* incluso a porcelana', true),
  ('Navagio 3 c/ 1,4 acrílico 1,5m', 'Navagio / Porcelana', 11171, 2600, 440, 960, 490, 5500, 21161, '* incluso a porcelana', true),
  ('Navagio 3 c/ 1,4 acrílico L 1,5m', 'Navagio / Porcelana', 12723, 2600, 440, 960, 525, 5500, 22748, '* incluso a porcelana', true),
  ('NI 2 x 1,80 c/ 0,86', 'Navagio / Porcelana', 4565, 2600, 440, 960, 335, 4500, 13400, '* incluso a porcelana', true),
  ('NI 2 x 1,80 c/ 0,86 / acrílico', 'Navagio / Porcelana', 7670, 2600, 440, 960, 415, 4500, 16585, '* incluso a porcelana', true),
  ('NII 2,50 x 1,70 c/ 0,86', 'Navagio / Porcelana', 5160, 2600, 440, 960, 315, 3000, 12475, '* incluso a porcelana', true),
  ('NII 2,50 x 1,70 c/ 0,86 / acrílico', 'Navagio / Porcelana', 8265, 2600, 440, 960, 430, 4500, 17195, '* incluso a porcelana', true),
  ('NIII 2,50 x 1,80 c/ 0,86', 'Navagio / Porcelana', 5174, 2600, 440, 960, 315, 3000, 12489, '* incluso a porcelana', true),
  ('NIII 2,50 x 1,80 c/ 0,86 / acrílico', 'Navagio / Porcelana', 8279, 2600, 440, 960, 430, 4500, 17209, '* incluso a porcelana', true),
  ('NIV 3 x 2 c/ 0,86', 'Navagio / Porcelana', 5841, 2600, 440, 960, 345, 3500, 13686, '* incluso a porcelana', true),
  ('NIV 3 x 2 c/ 0,86 / acrílico', 'Navagio / Porcelana', 8946, 2600, 440, 960, 460, 5000, 18406, '* incluso a porcelana', true),
  ('NV 2 x 2 c/ 0,86 / acrílico curva', 'Navagio / Porcelana', 9588, 2600, 440, 960, 450, 4500, 18538, '* incluso a porcelana', true)
ON CONFLICT (modelo) DO UPDATE SET
  linha = EXCLUDED.linha,
  custo_casco = EXCLUDED.custo_casco,
  custo_filtro = EXCLUDED.custo_filtro,
  frete = EXCLUDED.frete,
  instalacao = EXCLUDED.instalacao,
  imposto = EXCLUDED.imposto,
  lucro = EXCLUDED.lucro,
  preco_venda = EXCLUDED.preco_venda,
  observacoes = EXCLUDED.observacoes,
  ativo = true;

UPDATE public.produtos
SET preco_custo = 14038,
    preco_venda = 18538,
    custo_fabricacao = 12188,
    custo_logistico = 1850,
    descricao = 'Composição de Custos da Loja: Casco 10% (R$ 9588.00) + Filtro (R$ 2600.00) + Frete (R$ 440.00) + Instalação (R$ 960.00) + Imposto (R$ 450.00). Custo s/ margem: R$ 14038.00. Lucro projetado: R$ 4500.00. Venda final: R$ 18538.00.'
WHERE codigo = 'SPL-NAV-LANC-09';
