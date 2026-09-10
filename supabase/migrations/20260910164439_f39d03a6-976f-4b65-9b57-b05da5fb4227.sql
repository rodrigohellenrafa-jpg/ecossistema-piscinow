ALTER TABLE public.agenda_eventos
  ADD COLUMN IF NOT EXISTS google_event_id text,
  ADD COLUMN IF NOT EXISTS google_calendar_id text;

CREATE UNIQUE INDEX IF NOT EXISTS agenda_eventos_google_event_uidx
  ON public.agenda_eventos (google_event_id)
  WHERE google_event_id IS NOT NULL;