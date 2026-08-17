-- Default EXECUTE comes from the PUBLIC role; revoke there and grant explicitly.
REVOKE ALL ON FUNCTION public.generate_invite_code() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_invite_code() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_company_member(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.join_company_by_code(text, text, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.refresh_sector_aggregates(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_sector_aggregates(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sign_nr1_manifest(text, text, text, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.nr1_manifest_stats() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.list_nr1_signatories(text, text, text, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_nr1_seal(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lookup_company_by_invite(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_public_survey(text, text, jsonb, numeric, text, text) FROM PUBLIC;

-- Signed-in only helpers used by the app
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_company_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_company_by_code(text, text, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_sector_aggregates(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sector_aggregates(uuid) TO authenticated;

-- Public-by-design endpoints
GRANT EXECUTE ON FUNCTION public.sign_nr1_manifest(text, text, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.nr1_manifest_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_nr1_signatories(text, text, text, integer, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_nr1_seal(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_company_by_invite(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_public_survey(text, text, jsonb, numeric, text, text) TO anon, authenticated;

-- Internal routines: server/trigger use only
GRANT EXECUTE ON FUNCTION public.generate_invite_code() TO service_role;
GRANT EXECUTE ON FUNCTION public.set_invite_code() TO service_role;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;