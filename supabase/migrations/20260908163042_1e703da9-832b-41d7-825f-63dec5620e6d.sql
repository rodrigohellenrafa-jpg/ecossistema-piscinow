CREATE TABLE public.fiscal_credenciais (
  id uuid primary key default gen_random_uuid(),
  ambiente text not null unique check (ambiente in ('homologacao','producao')),
  token text not null,
  valido boolean not null default false,
  validado_em timestamptz,
  mensagem text,
  atualizado_por uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

GRANT ALL ON public.fiscal_credenciais TO service_role;

ALTER TABLE public.fiscal_credenciais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "somente servidor" ON public.fiscal_credenciais
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER trg_fiscal_credenciais_updated
  BEFORE UPDATE ON public.fiscal_credenciais
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();