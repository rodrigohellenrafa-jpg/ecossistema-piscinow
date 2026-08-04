-- VENDAS
CREATE TABLE public.vendas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  cliente_nome text,
  vendedor text,
  data date NOT NULL DEFAULT CURRENT_DATE,
  forma_pagamento text,
  status_pagamento text NOT NULL DEFAULT 'pendente',
  valor_total numeric NOT NULL DEFAULT 0,
  observacoes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendas TO authenticated;
GRANT ALL ON public.vendas TO service_role;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipe gerencia vendas" ON public.vendas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_vendas_updated BEFORE UPDATE ON public.vendas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PERFIS DE ACESSO
CREATE TYPE public.app_role AS ENUM ('admin','gerente','vendedor','financeiro','tecnico','usuario');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Usuarios leem perfis" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins gerenciam perfis" ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- USUARIOS IMPORTADOS (aba Controle de Acesso da planilha)
CREATE TABLE public.usuarios_importados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text,
  email text,
  perfil text,
  ativo boolean NOT NULL DEFAULT true,
  observacoes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.usuarios_importados TO authenticated;
GRANT ALL ON public.usuarios_importados TO service_role;
ALTER TABLE public.usuarios_importados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipe gerencia usuarios importados" ON public.usuarios_importados FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_usuarios_importados_updated BEFORE UPDATE ON public.usuarios_importados
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();