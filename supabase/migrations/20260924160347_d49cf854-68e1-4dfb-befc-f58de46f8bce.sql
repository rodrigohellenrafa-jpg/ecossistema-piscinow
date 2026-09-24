
ALTER TABLE public.contas DISABLE TRIGGER USER;
ALTER TABLE public.lancamentos_financeiros DISABLE TRIGGER USER;
ALTER TABLE public.venda_pagamentos DISABLE TRIGGER USER;
ALTER TABLE public.ordem_compra_pagamentos DISABLE TRIGGER USER;
ALTER TABLE public.extratos_bancarios DISABLE TRIGGER USER;
ALTER TABLE public.saldos_bancarios DISABLE TRIGGER USER;

UPDATE public.saldos_bancarios SET conta = 'RS C6' WHERE conta = 'RS COMERCIO DE PISCINAS';
UPDATE public.saldos_bancarios SET conta = 'RS SANTANDER' WHERE conta = 'RS COMERCIO DE PISCINAS 2';
UPDATE public.saldos_bancarios SET conta = 'RS BRADESCO' WHERE conta = 'RS COMERCIO DE PISCINAS 3';

UPDATE public.contas SET conta_bancaria = 'RS C6' WHERE conta_bancaria = 'RS COMERCIO DE PISCINAS';
UPDATE public.contas SET conta_bancaria = 'RS SANTANDER' WHERE conta_bancaria = 'RS COMERCIO DE PISCINAS 2';
UPDATE public.contas SET conta_bancaria = 'RS BRADESCO' WHERE conta_bancaria = 'RS COMERCIO DE PISCINAS 3';

UPDATE public.lancamentos_financeiros SET conta_bancaria = 'RS C6' WHERE conta_bancaria = 'RS COMERCIO DE PISCINAS';
UPDATE public.lancamentos_financeiros SET conta_bancaria = 'RS SANTANDER' WHERE conta_bancaria = 'RS COMERCIO DE PISCINAS 2';
UPDATE public.lancamentos_financeiros SET conta_bancaria = 'RS BRADESCO' WHERE conta_bancaria = 'RS COMERCIO DE PISCINAS 3';

UPDATE public.venda_pagamentos SET conta_bancaria = 'RS C6' WHERE conta_bancaria = 'RS COMERCIO DE PISCINAS';
UPDATE public.venda_pagamentos SET conta_bancaria = 'RS SANTANDER' WHERE conta_bancaria = 'RS COMERCIO DE PISCINAS 2';
UPDATE public.venda_pagamentos SET conta_bancaria = 'RS BRADESCO' WHERE conta_bancaria = 'RS COMERCIO DE PISCINAS 3';

UPDATE public.ordem_compra_pagamentos SET conta_bancaria = 'RS C6' WHERE conta_bancaria = 'RS COMERCIO DE PISCINAS';
UPDATE public.ordem_compra_pagamentos SET conta_bancaria = 'RS SANTANDER' WHERE conta_bancaria = 'RS COMERCIO DE PISCINAS 2';
UPDATE public.ordem_compra_pagamentos SET conta_bancaria = 'RS BRADESCO' WHERE conta_bancaria = 'RS COMERCIO DE PISCINAS 3';

UPDATE public.extratos_bancarios SET conta = 'RS C6' WHERE conta = 'RS COMERCIO DE PISCINAS';
UPDATE public.extratos_bancarios SET conta = 'RS SANTANDER' WHERE conta = 'RS COMERCIO DE PISCINAS 2';
UPDATE public.extratos_bancarios SET conta = 'RS BRADESCO' WHERE conta = 'RS COMERCIO DE PISCINAS 3';

ALTER TABLE public.contas ENABLE TRIGGER USER;
ALTER TABLE public.lancamentos_financeiros ENABLE TRIGGER USER;
ALTER TABLE public.venda_pagamentos ENABLE TRIGGER USER;
ALTER TABLE public.ordem_compra_pagamentos ENABLE TRIGGER USER;
ALTER TABLE public.extratos_bancarios ENABLE TRIGGER USER;
ALTER TABLE public.saldos_bancarios ENABLE TRIGGER USER;
