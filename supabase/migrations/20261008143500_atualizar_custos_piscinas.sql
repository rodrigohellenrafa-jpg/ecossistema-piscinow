-- Migration: Atualização dos custos e preços de venda das piscinas Splash conforme tabela real da loja
DO $$
BEGIN
  UPDATE public.produtos
  SET preco_custo = 6481,
      preco_venda = 9981,
      custo_fabricacao = 5091,
      custo_logistico = 1390,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 2491.00) + Filtro (R$ 2600.00) + Frete (R$ 275.00) + Instalação (R$ 900.00) + Imposto (R$ 215.00). Custo s/ margem: R$ 6481.00. Lucro projetado: R$ 3500.00. Venda final: R$ 9981.00.'
  WHERE codigo = 'SPL-ITA-300';
  UPDATE public.produtos
  SET preco_custo = 8649,
      preco_venda = 12649,
      custo_fabricacao = 7084,
      custo_logistico = 1565,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 4484.00) + Filtro (R$ 2600.00) + Frete (R$ 330.00) + Instalação (R$ 960.00) + Imposto (R$ 275.00). Custo s/ margem: R$ 8649.00. Lucro projetado: R$ 4000.00. Venda final: R$ 12649.00.'
  WHERE codigo = 'SPL-ITA-320';
  UPDATE public.produtos
  SET preco_custo = 7837,
      preco_venda = 11837,
      custo_fabricacao = 6087,
      custo_logistico = 1750,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 3487.00) + Filtro (R$ 2600.00) + Frete (R$ 440.00) + Instalação (R$ 1050.00) + Imposto (R$ 260.00). Custo s/ margem: R$ 7837.00. Lucro projetado: R$ 4000.00. Venda final: R$ 11837.00.'
  WHERE codigo = 'SPL-ITA-350';
  UPDATE public.produtos
  SET preco_custo = 10495,
      preco_venda = 14495,
      custo_fabricacao = 8475,
      custo_logistico = 2020,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 5875.00) + Filtro (R$ 2600.00) + Frete (R$ 495.00) + Instalação (R$ 1200.00) + Imposto (R$ 325.00). Custo s/ margem: R$ 10495.00. Lucro projetado: R$ 4000.00. Venda final: R$ 14495.00.'
  WHERE codigo = 'SPL-ITA-400';
  UPDATE public.produtos
  SET preco_custo = 13019,
      preco_venda = 17519,
      custo_fabricacao = 10569,
      custo_logistico = 2450,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 7969.00) + Filtro (R$ 2600.00) + Frete (R$ 550.00) + Instalação (R$ 1500.00) + Imposto (R$ 400.00). Custo s/ margem: R$ 13019.00. Lucro projetado: R$ 4500.00. Venda final: R$ 17519.00.'
  WHERE codigo = 'SPL-ITA-500';
  UPDATE public.produtos
  SET preco_custo = 15640,
      preco_venda = 20640,
      custo_fabricacao = 12760,
      custo_logistico = 2880,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 10160.00) + Filtro (R$ 2600.00) + Frete (R$ 605.00) + Instalação (R$ 1800.00) + Imposto (R$ 475.00). Custo s/ margem: R$ 15640.00. Lucro projetado: R$ 5000.00. Venda final: R$ 20640.00.'
  WHERE codigo = 'SPL-ITA-600';
  UPDATE public.produtos
  SET preco_custo = 19300,
      preco_venda = 25300,
      custo_fabricacao = 15945,
      custo_logistico = 3355,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 13345.00) + Filtro (R$ 2600.00) + Frete (R$ 660.00) + Instalação (R$ 2100.00) + Imposto (R$ 595.00). Custo s/ margem: R$ 19300.00. Lucro projetado: R$ 6000.00. Venda final: R$ 25300.00.'
  WHERE codigo = 'SPL-ITA-700';
  UPDATE public.produtos
  SET preco_custo = 22437,
      preco_venda = 29437,
      custo_fabricacao = 18637,
      custo_logistico = 3800,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 16037.00) + Filtro (R$ 2600.00) + Frete (R$ 715.00) + Instalação (R$ 2400.00) + Imposto (R$ 685.00). Custo s/ margem: R$ 22437.00. Lucro projetado: R$ 7000.00. Venda final: R$ 29437.00.'
  WHERE codigo = 'SPL-ITA-800';
  UPDATE public.produtos
  SET preco_custo = 7531,
      preco_venda = 11531,
      custo_fabricacao = 5786,
      custo_logistico = 1745,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 3186.00) + Filtro (R$ 2600.00) + Frete (R$ 440.00) + Instalação (R$ 1050.00) + Imposto (R$ 255.00). Custo s/ margem: R$ 7531.00. Lucro projetado: R$ 4000.00. Venda final: R$ 11531.00.'
  WHERE codigo = 'SPL-TRO-350';
  UPDATE public.produtos
  SET preco_custo = 8756,
      preco_venda = 12756,
      custo_fabricacao = 6781,
      custo_logistico = 1975,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 4181.00) + Filtro (R$ 2600.00) + Frete (R$ 495.00) + Instalação (R$ 1200.00) + Imposto (R$ 280.00). Custo s/ margem: R$ 8756.00. Lucro projetado: R$ 4000.00. Venda final: R$ 12756.00.'
  WHERE codigo = 'SPL-TRO-400-100';
  UPDATE public.produtos
  SET preco_custo = 10088,
      preco_venda = 14088,
      custo_fabricacao = 8078,
      custo_logistico = 2010,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 5478.00) + Filtro (R$ 2600.00) + Frete (R$ 495.00) + Instalação (R$ 1200.00) + Imposto (R$ 315.00). Custo s/ margem: R$ 10088.00. Lucro projetado: R$ 4000.00. Venda final: R$ 14088.00.'
  WHERE codigo = 'SPL-TRO-400-140';
  UPDATE public.produtos
  SET preco_custo = 11982,
      preco_venda = 16482,
      custo_fabricacao = 9572,
      custo_logistico = 2410,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 6972.00) + Filtro (R$ 2600.00) + Frete (R$ 550.00) + Instalação (R$ 1500.00) + Imposto (R$ 360.00). Custo s/ margem: R$ 11982.00. Lucro projetado: R$ 4500.00. Venda final: R$ 16482.00.'
  WHERE codigo = 'SPL-TRO-500';
  UPDATE public.produtos
  SET preco_custo = 14107,
      preco_venda = 19107,
      custo_fabricacao = 11267,
      custo_logistico = 2840,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 8667.00) + Filtro (R$ 2600.00) + Frete (R$ 605.00) + Instalação (R$ 1800.00) + Imposto (R$ 435.00). Custo s/ margem: R$ 14107.00. Lucro projetado: R$ 5000.00. Venda final: R$ 19107.00.'
  WHERE codigo = 'SPL-TRO-600-130';
  UPDATE public.produtos
  SET preco_custo = 14415,
      preco_venda = 19415,
      custo_fabricacao = 11565,
      custo_logistico = 2850,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 8965.00) + Filtro (R$ 2600.00) + Frete (R$ 605.00) + Instalação (R$ 1800.00) + Imposto (R$ 445.00). Custo s/ margem: R$ 14415.00. Lucro projetado: R$ 5000.00. Venda final: R$ 19415.00.'
  WHERE codigo = 'SPL-TRO-600-140';
  UPDATE public.produtos
  SET preco_custo = 17540,
      preco_venda = 23540,
      custo_fabricacao = 14255,
      custo_logistico = 3285,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 11655.00) + Filtro (R$ 2600.00) + Frete (R$ 660.00) + Instalação (R$ 2100.00) + Imposto (R$ 525.00). Custo s/ margem: R$ 17540.00. Lucro projetado: R$ 6000.00. Venda final: R$ 23540.00.'
  WHERE codigo = 'SPL-TRO-700';
  UPDATE public.produtos
  SET preco_custo = 20685,
      preco_venda = 27685,
      custo_fabricacao = 16945,
      custo_logistico = 3740,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 14345.00) + Filtro (R$ 2600.00) + Frete (R$ 715.00) + Instalação (R$ 2400.00) + Imposto (R$ 625.00). Custo s/ margem: R$ 20685.00. Lucro projetado: R$ 7000.00. Venda final: R$ 27685.00.'
  WHERE codigo = 'SPL-TRO-800';
  UPDATE public.produtos
  SET preco_custo = 24313,
      preco_venda = 31313,
      custo_fabricacao = 20133,
      custo_logistico = 4180,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 17533.00) + Filtro (R$ 2600.00) + Frete (R$ 770.00) + Instalação (R$ 2700.00) + Imposto (R$ 710.00). Custo s/ margem: R$ 24313.00. Lucro projetado: R$ 7000.00. Venda final: R$ 31313.00.'
  WHERE codigo = 'SPL-TRO-900';
  UPDATE public.produtos
  SET preco_custo = 28971,
      preco_venda = 36471,
      custo_fabricacao = 24316,
      custo_logistico = 4655,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 21716.00) + Filtro (R$ 2600.00) + Frete (R$ 825.00) + Instalação (R$ 3000.00) + Imposto (R$ 830.00). Custo s/ margem: R$ 28971.00. Lucro projetado: R$ 7500.00. Venda final: R$ 36471.00.'
  WHERE codigo = 'SPL-TRO-1000';
  UPDATE public.produtos
  SET preco_custo = 10392,
      preco_venda = 14392,
      custo_fabricacao = 8377,
      custo_logistico = 2015,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 5777.00) + Filtro (R$ 2600.00) + Frete (R$ 495.00) + Instalação (R$ 1200.00) + Imposto (R$ 320.00). Custo s/ margem: R$ 10392.00. Lucro projetado: R$ 4000.00. Venda final: R$ 14392.00.'
  WHERE codigo = 'SPL-FDB-400';
  UPDATE public.produtos
  SET preco_custo = 13218,
      preco_venda = 17718,
      custo_fabricacao = 10768,
      custo_logistico = 2450,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 8168.00) + Filtro (R$ 2600.00) + Frete (R$ 550.00) + Instalação (R$ 1500.00) + Imposto (R$ 400.00). Custo s/ margem: R$ 13218.00. Lucro projetado: R$ 4500.00. Venda final: R$ 17718.00.'
  WHERE codigo = 'SPL-FDB-500';
  UPDATE public.produtos
  SET preco_custo = 15945,
      preco_venda = 20945,
      custo_fabricacao = 13060,
      custo_logistico = 2885,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 10460.00) + Filtro (R$ 2600.00) + Frete (R$ 605.00) + Instalação (R$ 1800.00) + Imposto (R$ 480.00). Custo s/ margem: R$ 15945.00. Lucro projetado: R$ 5000.00. Venda final: R$ 20945.00.'
  WHERE codigo = 'SPL-FDB-600';
  UPDATE public.produtos
  SET preco_custo = 20619,
      preco_venda = 26619,
      custo_fabricacao = 17244,
      custo_logistico = 3375,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 14644.00) + Filtro (R$ 2600.00) + Frete (R$ 660.00) + Instalação (R$ 2100.00) + Imposto (R$ 615.00). Custo s/ margem: R$ 20619.00. Lucro projetado: R$ 6000.00. Venda final: R$ 26619.00.'
  WHERE codigo = 'SPL-FDB-700';
  UPDATE public.produtos
  SET preco_custo = 24177,
      preco_venda = 31177,
      custo_fabricacao = 20332,
      custo_logistico = 3845,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 17732.00) + Filtro (R$ 2600.00) + Frete (R$ 715.00) + Instalação (R$ 2400.00) + Imposto (R$ 730.00). Custo s/ margem: R$ 24177.00. Lucro projetado: R$ 7000.00. Venda final: R$ 31177.00.'
  WHERE codigo = 'SPL-FDB-800';
  UPDATE public.produtos
  SET preco_custo = 27705,
      preco_venda = 34705,
      custo_fabricacao = 23420,
      custo_logistico = 4285,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 20820.00) + Filtro (R$ 2600.00) + Frete (R$ 770.00) + Instalação (R$ 2700.00) + Imposto (R$ 815.00). Custo s/ margem: R$ 27705.00. Lucro projetado: R$ 7000.00. Venda final: R$ 34705.00.'
  WHERE codigo = 'SPL-FDB-900';
  UPDATE public.produtos
  SET preco_custo = 34306,
      preco_venda = 41806,
      custo_fabricacao = 29496,
      custo_logistico = 4810,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 26896.00) + Filtro (R$ 2600.00) + Frete (R$ 825.00) + Instalação (R$ 3000.00) + Imposto (R$ 985.00). Custo s/ margem: R$ 34306.00. Lucro projetado: R$ 7500.00. Venda final: R$ 41806.00.'
  WHERE codigo = 'SPL-FDB-1000';
  UPDATE public.produtos
  SET preco_custo = 8024,
      preco_venda = 12024,
      custo_fabricacao = 6584,
      custo_logistico = 1440,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 3984.00) + Filtro (R$ 2600.00) + Frete (R$ 275.00) + Instalação (R$ 900.00) + Imposto (R$ 265.00). Custo s/ margem: R$ 8024.00. Lucro projetado: R$ 4000.00. Venda final: R$ 12024.00.'
  WHERE codigo = 'SPL-CAN-300';
  UPDATE public.produtos
  SET preco_custo = 10293,
      preco_venda = 14293,
      custo_fabricacao = 8278,
      custo_logistico = 2015,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 5678.00) + Filtro (R$ 2600.00) + Frete (R$ 495.00) + Instalação (R$ 1200.00) + Imposto (R$ 320.00). Custo s/ margem: R$ 10293.00. Lucro projetado: R$ 4000.00. Venda final: R$ 14293.00.'
  WHERE codigo = 'SPL-CAN-400';
  UPDATE public.produtos
  SET preco_custo = 14444,
      preco_venda = 18944,
      custo_fabricacao = 11964,
      custo_logistico = 2480,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 9364.00) + Filtro (R$ 2600.00) + Frete (R$ 550.00) + Instalação (R$ 1500.00) + Imposto (R$ 430.00). Custo s/ margem: R$ 14444.00. Lucro projetado: R$ 4500.00. Venda final: R$ 18944.00.'
  WHERE codigo = 'SPL-CAN-500';
  UPDATE public.produtos
  SET preco_custo = 17374,
      preco_venda = 22374,
      custo_fabricacao = 14454,
      custo_logistico = 2920,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 11854.00) + Filtro (R$ 2600.00) + Frete (R$ 605.00) + Instalação (R$ 1800.00) + Imposto (R$ 515.00). Custo s/ margem: R$ 17374.00. Lucro projetado: R$ 5000.00. Venda final: R$ 22374.00.'
  WHERE codigo = 'SPL-CAN-600';
  UPDATE public.produtos
  SET preco_custo = 22765,
      preco_venda = 28765,
      custo_fabricacao = 19335,
      custo_logistico = 3430,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 16735.00) + Filtro (R$ 2600.00) + Frete (R$ 660.00) + Instalação (R$ 2100.00) + Imposto (R$ 670.00). Custo s/ margem: R$ 22765.00. Lucro projetado: R$ 6000.00. Venda final: R$ 28765.00.'
  WHERE codigo = 'SPL-CAN-700';
  UPDATE public.produtos
  SET preco_custo = 27241,
      preco_venda = 34241,
      custo_fabricacao = 23321,
      custo_logistico = 3920,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 20721.00) + Filtro (R$ 2600.00) + Frete (R$ 715.00) + Instalação (R$ 2400.00) + Imposto (R$ 805.00). Custo s/ margem: R$ 27241.00. Lucro projetado: R$ 7000.00. Venda final: R$ 34241.00.'
  WHERE codigo = 'SPL-CAN-800';
  UPDATE public.produtos
  SET preco_custo = 35313,
      preco_venda = 42813,
      custo_fabricacao = 30493,
      custo_logistico = 4820,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 27893.00) + Filtro (R$ 2600.00) + Frete (R$ 825.00) + Instalação (R$ 3000.00) + Imposto (R$ 995.00). Custo s/ margem: R$ 35313.00. Lucro projetado: R$ 7500.00. Venda final: R$ 42813.00.'
  WHERE codigo = 'SPL-CAN-1000';
  UPDATE public.produtos
  SET preco_custo = 8941,
      preco_venda = 12941,
      custo_fabricacao = 7481,
      custo_logistico = 1460,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 4881.00) + Filtro (R$ 2600.00) + Frete (R$ 275.00) + Instalação (R$ 900.00) + Imposto (R$ 285.00). Custo s/ margem: R$ 8941.00. Lucro projetado: R$ 4000.00. Venda final: R$ 12941.00.'
  WHERE codigo = 'SPL-BON-300';
  UPDATE public.produtos
  SET preco_custo = 11110,
      preco_venda = 15110,
      custo_fabricacao = 9075,
      custo_logistico = 2035,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 6475.00) + Filtro (R$ 2600.00) + Frete (R$ 495.00) + Instalação (R$ 1200.00) + Imposto (R$ 340.00). Custo s/ margem: R$ 11110.00. Lucro projetado: R$ 4000.00. Venda final: R$ 15110.00.'
  WHERE codigo = 'SPL-BON-400';
  UPDATE public.produtos
  SET preco_custo = 14752,
      preco_venda = 19252,
      custo_fabricacao = 12262,
      custo_logistico = 2490,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 9662.00) + Filtro (R$ 2600.00) + Frete (R$ 550.00) + Instalação (R$ 1500.00) + Imposto (R$ 440.00). Custo s/ margem: R$ 14752.00. Lucro projetado: R$ 4500.00. Venda final: R$ 19252.00.'
  WHERE codigo = 'SPL-BON-500';
  UPDATE public.produtos
  SET preco_custo = 17783,
      preco_venda = 22783,
      custo_fabricacao = 14853,
      custo_logistico = 2930,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 12253.00) + Filtro (R$ 2600.00) + Frete (R$ 605.00) + Instalação (R$ 1800.00) + Imposto (R$ 525.00). Custo s/ margem: R$ 17783.00. Lucro projetado: R$ 5000.00. Venda final: R$ 22783.00.'
  WHERE codigo = 'SPL-BON-600';
  UPDATE public.produtos
  SET preco_custo = 23477,
      preco_venda = 29477,
      custo_fabricacao = 20032,
      custo_logistico = 3445,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 17432.00) + Filtro (R$ 2600.00) + Frete (R$ 660.00) + Instalação (R$ 2100.00) + Imposto (R$ 685.00). Custo s/ margem: R$ 23477.00. Lucro projetado: R$ 6000.00. Venda final: R$ 29477.00.'
  WHERE codigo = 'SPL-BON-700';
  UPDATE public.produtos
  SET preco_custo = 27644,
      preco_venda = 34644,
      custo_fabricacao = 23719,
      custo_logistico = 3925,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 21119.00) + Filtro (R$ 2600.00) + Frete (R$ 715.00) + Instalação (R$ 2400.00) + Imposto (R$ 810.00). Custo s/ margem: R$ 27644.00. Lucro projetado: R$ 7000.00. Venda final: R$ 34644.00.'
  WHERE codigo = 'SPL-BON-800';
  UPDATE public.produtos
  SET preco_custo = 13118,
      preco_venda = 17618,
      custo_fabricacao = 10668,
      custo_logistico = 2450,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 8068.00) + Filtro (R$ 2600.00) + Frete (R$ 550.00) + Instalação (R$ 1500.00) + Imposto (R$ 400.00). Custo s/ margem: R$ 13118.00. Lucro projetado: R$ 4500.00. Venda final: R$ 17618.00.'
  WHERE codigo = 'SPL-TOR-500';
  UPDATE public.produtos
  SET preco_custo = 21335,
      preco_venda = 27335,
      custo_fabricacao = 17940,
      custo_logistico = 3395,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 15340.00) + Filtro (R$ 2600.00) + Frete (R$ 660.00) + Instalação (R$ 2100.00) + Imposto (R$ 635.00). Custo s/ margem: R$ 21335.00. Lucro projetado: R$ 6000.00. Venda final: R$ 27335.00.'
  WHERE codigo = 'SPL-TOR-700';
  UPDATE public.produtos
  SET preco_custo = 25458,
      preco_venda = 32458,
      custo_fabricacao = 21228,
      custo_logistico = 4230,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 18628.00) + Filtro (R$ 2600.00) + Frete (R$ 770.00) + Instalação (R$ 2700.00) + Imposto (R$ 760.00). Custo s/ margem: R$ 25458.00. Lucro projetado: R$ 7000.00. Venda final: R$ 32458.00.'
  WHERE codigo = 'SPL-TOR-900';
  UPDATE public.produtos
  SET preco_custo = 32264,
      preco_venda = 39764,
      custo_fabricacao = 27504,
      custo_logistico = 4760,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 24904.00) + Filtro (R$ 2600.00) + Frete (R$ 825.00) + Instalação (R$ 3000.00) + Imposto (R$ 935.00). Custo s/ margem: R$ 32264.00. Lucro projetado: R$ 7500.00. Venda final: R$ 39764.00.'
  WHERE codigo = 'SPL-TOR-1000';
  UPDATE public.produtos
  SET preco_custo = 26033,
      preco_venda = 32033,
      custo_fabricacao = 22523,
      custo_logistico = 3510,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 19923.00) + Filtro (R$ 2600.00) + Frete (R$ 660.00) + Instalação (R$ 2100.00) + Imposto (R$ 750.00). Custo s/ margem: R$ 26033.00. Lucro projetado: R$ 6000.00. Venda final: R$ 32033.00.'
  WHERE codigo = 'SPL-ATA-700';
  UPDATE public.produtos
  SET preco_custo = 34545,
      preco_venda = 41545,
      custo_fabricacao = 30095,
      custo_logistico = 4450,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 27495.00) + Filtro (R$ 2600.00) + Frete (R$ 770.00) + Instalação (R$ 2700.00) + Imposto (R$ 980.00). Custo s/ margem: R$ 34545.00. Lucro projetado: R$ 7000.00. Venda final: R$ 41545.00.'
  WHERE codigo = 'SPL-ATA-900';
  UPDATE public.produtos
  SET preco_custo = 13561,
      preco_venda = 17561,
      custo_fabricacao = 11466,
      custo_logistico = 2095,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 8866.00) + Filtro (R$ 2600.00) + Frete (R$ 495.00) + Instalação (R$ 1200.00) + Imposto (R$ 400.00). Custo s/ margem: R$ 13561.00. Lucro projetado: R$ 4000.00. Venda final: R$ 17561.00.'
  WHERE codigo = 'SPL-NAS-400';
  UPDATE public.produtos
  SET preco_custo = 10808,
      preco_venda = 14808,
      custo_fabricacao = 9068,
      custo_logistico = 1740,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 6468.00) + Filtro (R$ 2600.00) + Frete (R$ 440.00) + Instalação (R$ 960.00) + Imposto (R$ 340.00). Custo s/ margem: R$ 10808.00. Lucro projetado: R$ 4000.00. Venda final: R$ 14808.00.'
  WHERE codigo = 'SPL-NAV-ORIG-01';
  UPDATE public.produtos
  SET preco_custo = 13993,
      preco_venda = 19493,
      custo_fabricacao = 12173,
      custo_logistico = 1820,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 9573.00) + Filtro (R$ 2600.00) + Frete (R$ 440.00) + Instalação (R$ 960.00) + Imposto (R$ 420.00). Custo s/ margem: R$ 13993.00. Lucro projetado: R$ 5500.00. Venda final: R$ 19493.00.'
  WHERE codigo = 'SPL-NAV-ORIG-02';
  UPDATE public.produtos
  SET preco_custo = 15581,
      preco_venda = 21081,
      custo_fabricacao = 13726,
      custo_logistico = 1855,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 11126.00) + Filtro (R$ 2600.00) + Frete (R$ 440.00) + Instalação (R$ 960.00) + Imposto (R$ 455.00). Custo s/ margem: R$ 15581.00. Lucro projetado: R$ 5500.00. Venda final: R$ 21081.00.'
  WHERE codigo = 'SPL-NAV-ORIG-03';
  UPDATE public.produtos
  SET preco_custo = 12441,
      preco_venda = 16441,
      custo_fabricacao = 10666,
      custo_logistico = 1775,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 8066.00) + Filtro (R$ 2600.00) + Frete (R$ 440.00) + Instalação (R$ 960.00) + Imposto (R$ 375.00). Custo s/ margem: R$ 12441.00. Lucro projetado: R$ 4000.00. Venda final: R$ 16441.00.'
  WHERE codigo = 'SPL-NAV-ORIG-04';
  UPDATE public.produtos
  SET preco_custo = 15661,
      preco_venda = 21161,
      custo_fabricacao = 13771,
      custo_logistico = 1890,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 11171.00) + Filtro (R$ 2600.00) + Frete (R$ 440.00) + Instalação (R$ 960.00) + Imposto (R$ 490.00). Custo s/ margem: R$ 15661.00. Lucro projetado: R$ 5500.00. Venda final: R$ 21161.00.'
  WHERE codigo = 'SPL-NAV-ORIG-05';
  UPDATE public.produtos
  SET preco_custo = 17248,
      preco_venda = 22748,
      custo_fabricacao = 15323,
      custo_logistico = 1925,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 12723.00) + Filtro (R$ 2600.00) + Frete (R$ 440.00) + Instalação (R$ 960.00) + Imposto (R$ 525.00). Custo s/ margem: R$ 17248.00. Lucro projetado: R$ 5500.00. Venda final: R$ 22748.00.'
  WHERE codigo = 'SPL-NAV-ORIG-06';
  UPDATE public.produtos
  SET preco_custo = 8900,
      preco_venda = 13400,
      custo_fabricacao = 7165,
      custo_logistico = 1735,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 4565.00) + Filtro (R$ 2600.00) + Frete (R$ 440.00) + Instalação (R$ 960.00) + Imposto (R$ 335.00). Custo s/ margem: R$ 8900.00. Lucro projetado: R$ 4500.00. Venda final: R$ 13400.00.'
  WHERE codigo = 'SPL-NAV-LANC-01';
  UPDATE public.produtos
  SET preco_custo = 12085,
      preco_venda = 16585,
      custo_fabricacao = 10270,
      custo_logistico = 1815,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 7670.00) + Filtro (R$ 2600.00) + Frete (R$ 440.00) + Instalação (R$ 960.00) + Imposto (R$ 415.00). Custo s/ margem: R$ 12085.00. Lucro projetado: R$ 4500.00. Venda final: R$ 16585.00.'
  WHERE codigo = 'SPL-NAV-LANC-02';
  UPDATE public.produtos
  SET preco_custo = 9475,
      preco_venda = 12475,
      custo_fabricacao = 7760,
      custo_logistico = 1715,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 5160.00) + Filtro (R$ 2600.00) + Frete (R$ 440.00) + Instalação (R$ 960.00) + Imposto (R$ 315.00). Custo s/ margem: R$ 9475.00. Lucro projetado: R$ 3000.00. Venda final: R$ 12475.00.'
  WHERE codigo = 'SPL-NAV-LANC-03';
  UPDATE public.produtos
  SET preco_custo = 12695,
      preco_venda = 17195,
      custo_fabricacao = 10865,
      custo_logistico = 1830,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 8265.00) + Filtro (R$ 2600.00) + Frete (R$ 440.00) + Instalação (R$ 960.00) + Imposto (R$ 430.00). Custo s/ margem: R$ 12695.00. Lucro projetado: R$ 4500.00. Venda final: R$ 17195.00.'
  WHERE codigo = 'SPL-NAV-LANC-04';
  UPDATE public.produtos
  SET preco_custo = 9489,
      preco_venda = 12489,
      custo_fabricacao = 7774,
      custo_logistico = 1715,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 5174.00) + Filtro (R$ 2600.00) + Frete (R$ 440.00) + Instalação (R$ 960.00) + Imposto (R$ 315.00). Custo s/ margem: R$ 9489.00. Lucro projetado: R$ 3000.00. Venda final: R$ 12489.00.'
  WHERE codigo = 'SPL-NAV-LANC-05';
  UPDATE public.produtos
  SET preco_custo = 12709,
      preco_venda = 17209,
      custo_fabricacao = 10879,
      custo_logistico = 1830,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 8279.00) + Filtro (R$ 2600.00) + Frete (R$ 440.00) + Instalação (R$ 960.00) + Imposto (R$ 430.00). Custo s/ margem: R$ 12709.00. Lucro projetado: R$ 4500.00. Venda final: R$ 17209.00.'
  WHERE codigo = 'SPL-NAV-LANC-06';
  UPDATE public.produtos
  SET preco_custo = 10186,
      preco_venda = 13686,
      custo_fabricacao = 8441,
      custo_logistico = 1745,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 5841.00) + Filtro (R$ 2600.00) + Frete (R$ 440.00) + Instalação (R$ 960.00) + Imposto (R$ 345.00). Custo s/ margem: R$ 10186.00. Lucro projetado: R$ 3500.00. Venda final: R$ 13686.00.'
  WHERE codigo = 'SPL-NAV-LANC-07';
  UPDATE public.produtos
  SET preco_custo = 13406,
      preco_venda = 18406,
      custo_fabricacao = 11546,
      custo_logistico = 1860,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 8946.00) + Filtro (R$ 2600.00) + Frete (R$ 440.00) + Instalação (R$ 960.00) + Imposto (R$ 460.00). Custo s/ margem: R$ 13406.00. Lucro projetado: R$ 5000.00. Venda final: R$ 18406.00.'
  WHERE codigo = 'SPL-NAV-LANC-08';
  UPDATE public.produtos
  SET preco_custo = 13340,
      preco_venda = 17840,
      custo_fabricacao = 11490,
      custo_logistico = 1850,
      descricao = 'Composição de Custos da Loja: Casco 10% (R$ 8890.00) + Filtro (R$ 2600.00) + Frete (R$ 440.00) + Instalação (R$ 960.00) + Imposto (R$ 450.00). Custo s/ margem: R$ 13340.00. Lucro projetado: R$ 4500.00. Venda final: R$ 17840.00.'
  WHERE codigo = 'SPL-NAV-LANC-09';
END $$;
