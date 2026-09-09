CREATE TABLE public.agenda_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  tipo text NOT NULL DEFAULT 'trabalho',
  inicio timestamptz NOT NULL,
  fim timestamptz,
  dia_inteiro boolean NOT NULL DEFAULT false,
  local text,
  status text NOT NULL DEFAULT 'agendado',
  responsavel_id uuid,
  responsavel_nome text,
  cliente_nome text,
  obra_id uuid REFERENCES public.obras(id) ON DELETE SET NULL,
  ordem_id uuid REFERENCES public.ordens_servico(id) ON DELETE SET NULL,
  venda_id uuid REFERENCES public.vendas(id) ON DELETE SET NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT agenda_eventos_tipo_check CHECK (tipo IN ('trabalho','pessoal')),
  CONSTRAINT agenda_eventos_status_check CHECK (status IN ('agendado','concluido','cancelado'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agenda_eventos TO authenticated;
GRANT ALL ON public.agenda_eventos TO service_role;
ALTER TABLE public.agenda_eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipe visualiza a agenda" ON public.agenda_eventos
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Equipe cria compromissos" ON public.agenda_eventos
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Dono ou admin edita" ON public.agenda_eventos
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR auth.uid() = responsavel_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = created_by OR auth.uid() = responsavel_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Dono ou admin remove" ON public.agenda_eventos
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR auth.uid() = responsavel_id OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_agenda_eventos_updated
  BEFORE UPDATE ON public.agenda_eventos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_agenda_eventos_inicio ON public.agenda_eventos (inicio);
CREATE INDEX idx_agenda_eventos_responsavel ON public.agenda_eventos (responsavel_id);

CREATE TABLE public.agenda_assinaturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agenda_assinaturas TO authenticated;
GRANT ALL ON public.agenda_assinaturas TO service_role;
ALTER TABLE public.agenda_assinaturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cada um gerencia seu link" ON public.agenda_assinaturas
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_agenda_assinaturas_updated
  BEFORE UPDATE ON public.agenda_assinaturas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();