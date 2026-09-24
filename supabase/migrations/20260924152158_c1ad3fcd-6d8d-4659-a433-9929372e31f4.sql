ALTER TABLE public.venda_pagamentos ADD COLUMN IF NOT EXISTS comprovante_path text;
ALTER TABLE public.ordem_compra_pagamentos ADD COLUMN IF NOT EXISTS comprovante_path text;
ALTER TABLE public.contas ADD COLUMN IF NOT EXISTS comprovante_path text;
ALTER TABLE public.lancamentos_financeiros ADD COLUMN IF NOT EXISTS comprovante_path text;

-- Acesso ao bucket privado de comprovantes (somente autenticados)
CREATE POLICY "Autenticados veem comprovantes"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'comprovantes');

CREATE POLICY "Autenticados anexam comprovantes"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'comprovantes');

CREATE POLICY "Autenticados atualizam comprovantes"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'comprovantes')
WITH CHECK (bucket_id = 'comprovantes');

CREATE POLICY "Autenticados excluem comprovantes"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'comprovantes');