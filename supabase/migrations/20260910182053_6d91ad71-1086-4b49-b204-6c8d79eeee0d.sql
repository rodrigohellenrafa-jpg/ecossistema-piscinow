ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS perfis app_role[] NOT NULL DEFAULT '{}';
UPDATE public.funcionarios SET perfis = ARRAY[perfil]::app_role[] WHERE cardinality(perfis) = 0;
COMMENT ON COLUMN public.funcionarios.perfis IS 'Todas as funções de acesso do colaborador. A coluna perfil mantém a função principal.';