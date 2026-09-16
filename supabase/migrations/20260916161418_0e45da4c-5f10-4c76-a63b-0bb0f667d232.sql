REVOKE EXECUTE ON FUNCTION public.espelhar_condicao_conta() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.espelhar_condicao_conta() TO service_role;