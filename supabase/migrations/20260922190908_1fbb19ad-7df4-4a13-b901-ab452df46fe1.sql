DELETE FROM public.ordem_compra_itens
WHERE ordem_id IN (SELECT id FROM public.ordens_compra WHERE numero IS DISTINCT FROM 'OC-012');

DELETE FROM public.ordens_compra WHERE numero IS DISTINCT FROM 'OC-012';

UPDATE public.ordens_compra SET numero = 'OC-001' WHERE numero = 'OC-012';