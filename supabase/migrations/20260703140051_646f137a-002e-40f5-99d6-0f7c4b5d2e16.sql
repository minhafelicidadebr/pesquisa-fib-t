
-- Manifesto NR-1 Brasil: public signature ledger with privacy-first aggregation
CREATE TABLE public.nr1_manifest_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  state_uf TEXT,
  headcount_range TEXT,
  commitment_level TEXT NOT NULL DEFAULT 'compromissado',
  user_agent_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.nr1_manifest_signatures TO service_role;
-- No anon/authenticated grants: only reachable via SECURITY DEFINER RPCs below.

ALTER TABLE public.nr1_manifest_signatures ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated on purpose: raw rows are private.

-- Public sign function (anti-spam: normalize email, dedupe by (email, company_name))
CREATE OR REPLACE FUNCTION public.sign_nr1_manifest(
  p_full_name TEXT,
  p_role TEXT,
  p_company_name TEXT,
  p_email TEXT,
  p_state_uf TEXT,
  p_headcount_range TEXT,
  p_ua_hash TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT := lower(trim(p_email));
  v_existing UUID;
BEGIN
  IF v_email IS NULL OR v_email = '' OR position('@' in v_email) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_email');
  END IF;
  IF coalesce(trim(p_full_name),'') = '' OR coalesce(trim(p_company_name),'') = '' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'missing_fields');
  END IF;

  SELECT id INTO v_existing
  FROM public.nr1_manifest_signatures
  WHERE lower(email) = v_email AND lower(company_name) = lower(trim(p_company_name))
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('ok', true, 'duplicate', true, 'id', v_existing);
  END IF;

  INSERT INTO public.nr1_manifest_signatures
    (full_name, role, company_name, email, state_uf, headcount_range, user_agent_hash)
  VALUES
    (trim(p_full_name), trim(p_role), trim(p_company_name), v_email,
     nullif(trim(p_state_uf),''), nullif(trim(p_headcount_range),''), p_ua_hash)
  RETURNING id INTO v_existing;

  RETURN jsonb_build_object('ok', true, 'duplicate', false, 'id', v_existing);
END;
$$;

REVOKE ALL ON FUNCTION public.sign_nr1_manifest(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sign_nr1_manifest(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT) TO anon, authenticated;

-- Public aggregate: safe counts only, no PII
CREATE OR REPLACE FUNCTION public.nr1_manifest_stats()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total INT;
  v_companies INT;
  v_states JSONB;
  v_recent JSONB;
BEGIN
  SELECT count(*)::INT, count(DISTINCT lower(company_name))::INT
    INTO v_total, v_companies
  FROM public.nr1_manifest_signatures;

  SELECT coalesce(jsonb_agg(row_to_json(t) ORDER BY t.n DESC), '[]'::jsonb)
    INTO v_states
  FROM (
    SELECT state_uf AS uf, count(*)::INT AS n
    FROM public.nr1_manifest_signatures
    WHERE state_uf IS NOT NULL
    GROUP BY state_uf
  ) t;

  SELECT coalesce(jsonb_agg(row_to_json(r) ORDER BY r.created_at DESC), '[]'::jsonb)
    INTO v_recent
  FROM (
    SELECT
      -- Show first name + initial only, city-safe
      split_part(full_name,' ',1) AS first_name,
      -- Mask company: keep first 3 chars + ***
      CASE WHEN length(company_name) > 3
           THEN substr(company_name,1,3) || repeat('*', greatest(length(company_name)-3, 3))
           ELSE company_name END AS company_masked,
      state_uf,
      created_at
    FROM public.nr1_manifest_signatures
    ORDER BY created_at DESC
    LIMIT 8
  ) r;

  RETURN jsonb_build_object(
    'total', v_total,
    'companies', v_companies,
    'states', v_states,
    'recent', v_recent
  );
END;
$$;

REVOKE ALL ON FUNCTION public.nr1_manifest_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.nr1_manifest_stats() TO anon, authenticated;
