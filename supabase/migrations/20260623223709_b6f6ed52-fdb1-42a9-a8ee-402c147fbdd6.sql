
-- Public anonymous survey responses (Sprint 12)
CREATE TABLE public.public_survey_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  sector text,
  answers jsonb NOT NULL,
  global_score numeric,
  global_risk text,
  user_agent_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_public_survey_company ON public.public_survey_responses(company_id, created_at DESC);

GRANT SELECT ON public.public_survey_responses TO authenticated;
GRANT ALL ON public.public_survey_responses TO service_role;

ALTER TABLE public.public_survey_responses ENABLE ROW LEVEL SECURITY;

-- Only company owners/members can read aggregated responses
CREATE POLICY "company members read public responses"
ON public.public_survey_responses FOR SELECT
TO authenticated
USING (public.is_company_member(company_id, auth.uid()));

-- No direct insert/update/delete from clients — go through RPC

-- Public lookup by invite code (returns minimal, non-sensitive metadata)
CREATE OR REPLACE FUNCTION public.lookup_company_by_invite(_code text)
RETURNS TABLE(id uuid, legal_name text, sectors text[], copsoq_version public.copsoq_version)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, legal_name, sectors, copsoq_version
  FROM public.companies
  WHERE invite_code = upper(trim(_code))
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_company_by_invite(text) TO anon, authenticated;

-- Anonymous survey submission
CREATE OR REPLACE FUNCTION public.submit_public_survey(
  _code text,
  _sector text,
  _answers jsonb,
  _global_score numeric,
  _global_risk text,
  _ua_hash text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _company_id uuid;
  _new_id uuid;
BEGIN
  SELECT id INTO _company_id FROM public.companies WHERE invite_code = upper(trim(_code));
  IF _company_id IS NULL THEN RAISE EXCEPTION 'invalid_code'; END IF;
  IF _answers IS NULL OR jsonb_typeof(_answers) <> 'object' THEN
    RAISE EXCEPTION 'invalid_answers';
  END IF;

  INSERT INTO public.public_survey_responses
    (company_id, sector, answers, global_score, global_risk, user_agent_hash)
  VALUES
    (_company_id, NULLIF(trim(_sector),''), _answers, _global_score, _global_risk, _ua_hash)
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_public_survey(text, text, jsonb, numeric, text, text) TO anon, authenticated;
