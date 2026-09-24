-- OC-002: valor correto do pagamento é 2.840,00 (não 2.288,00)
update public.ordem_compra_pagamentos
set valor = 2840, updated_at = now()
where id = 'ed757a87-e475-4c21-9ac0-380a74464488';

update public.ordens_compra
set valor_total = 2840, valor_produtos = 2840, updated_at = now()
where id = '998484a9-6cb7-4424-9054-3be891219758';

-- Garante o título espelhado com o valor correto (sem tocar em status/data)
update public.contas
set valor = 2840, updated_at = now()
where id = '2338869c-ece0-4478-88cc-035bccae7b5c' and valor <> 2840;