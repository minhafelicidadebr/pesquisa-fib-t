REVOKE EXECUTE ON FUNCTION public.sign_nr1_manifest(text, text, text, text, text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.nr1_manifest_stats() FROM anon;
REVOKE EXECUTE ON FUNCTION public.list_nr1_signatories(text, text, text, integer, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_nr1_seal(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.lookup_company_by_invite(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.submit_public_survey(text, text, jsonb, numeric, text, text) FROM anon;