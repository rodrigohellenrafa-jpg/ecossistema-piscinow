-- Migration: Corrigir cadastros das piscinas e migrar fornecedor "Splash Piscinas by iGUI" para "Analandia Ind Piscinas"
DO $$
DECLARE
  v_analandia_id uuid;
  v_splash_id uuid;
BEGIN
  -- 1. Procura se já existe um fornecedor Analândia cadastrado
  SELECT id INTO v_analandia_id
  FROM public.fornecedores
  WHERE nome ILIKE '%analandia%' OR nome ILIKE '%analândia%'
  ORDER BY created_at ASC
  LIMIT 1;

  -- 2. Se existir Analândia, padroniza o nome para "Analandia Ind Piscinas"
  IF v_analandia_id IS NOT NULL THEN
    UPDATE public.fornecedores
    SET nome = 'Analandia Ind Piscinas',
        contato = COALESCE(NULLIF(contato, ''), 'Fábrica Analândia'),
        observacoes = 'Fornecedor oficial de piscinas Analandia Ind Piscinas',
        ativo = true
    WHERE id = v_analandia_id;
  ELSE
    -- Se não existir Analândia, verifica se existe "Splash Piscinas by iGUI" para convertê-lo diretamente
    SELECT id INTO v_splash_id
    FROM public.fornecedores
    WHERE nome ILIKE '%Splash%iGUI%'
       OR nome ILIKE '%Splash Piscinas%'
       OR LOWER(TRIM(nome)) = 'splash'
    ORDER BY created_at ASC
    LIMIT 1;

    IF v_splash_id IS NOT NULL THEN
      UPDATE public.fornecedores
      SET nome = 'Analandia Ind Piscinas',
          contato = 'Fábrica Analândia',
          observacoes = 'Fornecedor oficial de piscinas Analandia Ind Piscinas',
          ativo = true
      WHERE id = v_splash_id;
      v_analandia_id := v_splash_id;
    ELSE
      INSERT INTO public.fornecedores (nome, contato, observacoes, ativo)
      VALUES (
        'Analandia Ind Piscinas',
        'Fábrica Analândia',
        'Fornecedor oficial de piscinas Analandia Ind Piscinas',
        true
      )
      RETURNING id INTO v_analandia_id;
    END IF;
  END IF;

  -- 3. Atualiza todos os produtos que tinham como fornecedor "Splash Piscinas by iGUI" (ou variações) para "Analandia Ind Piscinas"
  UPDATE public.produtos
  SET fornecedor_id = v_analandia_id
  WHERE fornecedor_id IN (
    SELECT id
    FROM public.fornecedores
    WHERE (
      nome ILIKE '%Splash%iGUI%'
      OR nome ILIKE '%Splash Piscinas%'
      OR LOWER(TRIM(nome)) = 'splash'
      OR nome ILIKE '%analandia%'
      OR nome ILIKE '%analândia%'
    )
    AND id <> v_analandia_id
  );

  -- 4. Garante que todos os cadastros de piscinas apontem para "Analandia Ind Piscinas"
  UPDATE public.produtos
  SET fornecedor_id = v_analandia_id
  WHERE categoria ILIKE '%piscina%'
     OR codigo ILIKE 'SPL-%'
     OR nome ILIKE 'Piscina Splash%';

  -- 5. Atualiza também eventuais ordens de compra vinculadas ao fornecedor antigo
  UPDATE public.ordens_compra
  SET fornecedor_id = v_analandia_id,
      fornecedor_nome = 'Analandia Ind Piscinas'
  WHERE fornecedor_id IN (
    SELECT id
    FROM public.fornecedores
    WHERE (
      nome ILIKE '%Splash%iGUI%'
      OR nome ILIKE '%Splash Piscinas%'
      OR LOWER(TRIM(nome)) = 'splash'
    )
    AND id <> v_analandia_id
  )
  OR fornecedor_nome ILIKE '%Splash%iGUI%'
  OR fornecedor_nome ILIKE '%Splash Piscinas%';
END $$;
