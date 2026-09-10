DROP INDEX IF EXISTS public.agenda_eventos_google_event_uidx;
CREATE UNIQUE INDEX agenda_eventos_google_event_uidx ON public.agenda_eventos (google_event_id);