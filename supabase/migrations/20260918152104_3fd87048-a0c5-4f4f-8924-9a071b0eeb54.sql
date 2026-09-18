CREATE OR REPLACE FUNCTION public.sincronizar_etapas_obra()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  status_manual boolean := (TG_OP = 'UPDATE' AND NEW.status_geral IS DISTINCT FROM OLD.status_geral);
BEGIN
  IF NEW.escavacao_fim IS NOT NULL THEN
    NEW.etapa_escavacao := 'concluido';
  ELSIF NEW.escavacao_inicio IS NOT NULL AND NEW.etapa_escavacao = 'pendente' THEN
    NEW.etapa_escavacao := 'em_andamento';
  END IF;

  IF NEW.instalacao_fim IS NOT NULL THEN
    NEW.etapa_motor := 'concluido';
  ELSIF NEW.instalacao_inicio IS NOT NULL AND NEW.etapa_motor = 'pendente' THEN
    NEW.etapa_motor := 'em_andamento';
  END IF;

  NEW.data_inicio := COALESCE(NEW.escavacao_inicio, NEW.instalacao_inicio, NEW.data_inicio);
  NEW.data_termino := COALESCE(NEW.instalacao_fim, NEW.data_termino);

  -- Quando o usuário escolhe o status na tela, a escolha dele prevalece.
  IF NOT status_manual THEN
    IF NEW.instalacao_fim IS NOT NULL THEN
      NEW.status_geral := 'Concluído';
    ELSIF (NEW.escavacao_inicio IS NOT NULL OR NEW.instalacao_inicio IS NOT NULL)
          AND NEW.status_geral IN ('Agendado', 'Aguardando data') THEN
      NEW.status_geral := 'Em Execução';
    ELSIF NEW.escavacao_inicio IS NULL AND NEW.instalacao_inicio IS NULL
          AND NEW.data_limite IS NULL AND TG_OP = 'INSERT' THEN
      NEW.status_geral := 'Aguardando data';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;