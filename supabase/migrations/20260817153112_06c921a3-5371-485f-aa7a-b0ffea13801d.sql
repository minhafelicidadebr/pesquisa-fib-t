-- 1. Fix mutable search_path on remaining functions
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text LANGUAGE plpgsql SET search_path = public AS $function$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, (floor(random() * length(chars)) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_invite_code()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $function$
DECLARE
  new_code text;
  attempts int := 0;
BEGIN
  IF NEW.invite_code IS NULL OR NEW.invite_code = '' THEN
    LOOP
      new_code := public.generate_invite_code();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.companies WHERE invite_code = new_code);
      attempts := attempts + 1;
      IF attempts > 10 THEN RAISE EXCEPTION 'Could not generate unique invite code'; END IF;
    END LOOP;
    NEW.invite_code := new_code;
  END IF;
  RETURN NEW;
END;
$function$;

-- 2. Lock down EXECUTE on SECURITY DEFINER / internal functions
-- Trigger + internal helper functions: never callable from the API
REVOKE ALL ON FUNCTION public.generate_invite_code() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.set_invite_code() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- Authenticated-only functions: revoke anonymous access
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION public.is_company_member(uuid, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.join_company_by_code(text, text, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION public.refresh_sector_aggregates(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.get_sector_aggregates(uuid) FROM anon;

-- Public-by-design endpoints keep anon EXECUTE (they mask/aggregate data internally)
GRANT EXECUTE ON FUNCTION public.sign_nr1_manifest(text, text, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.nr1_manifest_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_nr1_signatories(text, text, text, integer, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_nr1_seal(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_company_by_invite(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_public_survey(text, text, jsonb, numeric, text, text) TO anon, authenticated;

-- 3. Explicit access policies for tables that had RLS enabled but no policies
-- Pilot survey responses: written by the server only, read only by admins
CREATE POLICY "Admins can view pilot responses"
ON public.isg_pilot_responses FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
GRANT SELECT ON public.isg_pilot_responses TO authenticated;
GRANT ALL ON public.isg_pilot_responses TO service_role;

-- Manifest signatures (PII): public signing happens only through sign_nr1_manifest;
-- direct reads restricted to admins so emails are never exposed publicly
CREATE POLICY "Admins can view manifest signatures"
ON public.nr1_manifest_signatures FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
GRANT SELECT ON public.nr1_manifest_signatures TO authenticated;
GRANT ALL ON public.nr1_manifest_signatures TO service_role;

-- Public survey responses: submissions only via submit_public_survey (definer),
-- so no direct client INSERT is granted; ensure service role can maintain data
GRANT ALL ON public.public_survey_responses TO service_role;

-- Sector aggregates: computed only by refresh_sector_aggregates (definer)
GRANT ALL ON public.survey_sector_aggregates TO service_role;