CREATE UNIQUE INDEX IF NOT EXISTS uq_extratos_linha
  ON public.extratos_bancarios (conta, data_movimento, valor, descricao);