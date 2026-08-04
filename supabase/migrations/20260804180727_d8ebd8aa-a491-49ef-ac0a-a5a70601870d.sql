CREATE TABLE public.survey_sector_aggregates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  sector text NOT NULL,
  response_count integer NOT NULL DEFAULT 0,
  global_score numeric,
  global_risk text,
  green_count integer NOT NULL DEFAULT 0,
  yellow_count integer NOT NULL DEFAULT 0,
  red_count integer NOT NULL DEFAULT 0,
  first_response_at timestamptz,
  last_response_at timestamptz,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, sector)
);

GRANT SELECT ON public.survey_sector_aggregates TO authenticated;
GRANT ALL ON public.survey_sector_aggregates TO service_role;

ALTER TABLE public.survey_sector_aggregates ENABLE ROW LEVEL SECURITY;

-- LGPD: k-anonymity (k >= 7) enforced at the policy level; members only.
CREATE POLICY "Members read k-anonymous sector aggregates"
ON public.survey_sector_aggregates
FOR SELECT
TO authenticated
USING (
  public.is_company_member(company_id, auth.uid())
  AND response_count >= 7
);

CREATE TRIGGER trg_survey_sector_aggregates_updated_at
BEFORE UPDATE ON public.survey_sector_aggregates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_ssa_company ON public.survey_sector_aggregates(company_id);

-- Recompute aggregates for a company (members/owner only)
CREATE OR REPLACE FUNCTION public.refresh_sector_aggregates(_company_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid := auth.uid();
  _n int;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF NOT public.is_company_member(_company_id, _uid) THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  DELETE FROM public.survey_sector_aggregates WHERE company_id = _company_id;

  INSERT INTO public.survey_sector_aggregates AS a (
    company_id, sector, response_count, global_score, global_risk,
    green_count, yellow_count, red_count, first_response_at, last_response_at, computed_at
  )
  SELECT
    r.company_id,
    COALESCE(NULLIF(trim(r.sector), ''), 'Não informado') AS sector,
    count(*)::int,
    round(avg(r.global_score)::numeric, 1),
    CASE
      WHEN avg(r.global_score) IS NULL THEN NULL
      WHEN avg(r.global_score) < 33.33 THEN 'verde'
      WHEN avg(r.global_score) < 66.66 THEN 'amarelo'
      ELSE 'vermelho'
    END,
    count(*) FILTER (WHERE r.global_risk = 'verde')::int,
    count(*) FILTER (WHERE r.global_risk = 'amarelo')::int,
    count(*) FILTER (WHERE r.global_risk = 'vermelho')::int,
    min(r.created_at),
    max(r.created_at),
    now()
  FROM public.public_survey_responses r
  WHERE r.company_id = _company_id
  GROUP BY r.company_id, COALESCE(NULLIF(trim(r.sector), ''), 'Não informado');

  GET DIAGNOSTICS _n = ROW_COUNT;
  RETURN _n;
END;
$$;

-- Read helper: returns ONLY sectors above the k-anonymity threshold
CREATE OR REPLACE FUNCTION public.get_sector_aggregates(_company_id uuid)
RETURNS TABLE(
  sector text,
  response_count integer,
  global_score numeric,
  global_risk text,
  green_count integer,
  yellow_count integer,
  red_count integer,
  last_response_at timestamptz,
  computed_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT a.sector, a.response_count, a.global_score, a.global_risk,
         a.green_count, a.yellow_count, a.red_count, a.last_response_at, a.computed_at
  FROM public.survey_sector_aggregates a
  WHERE a.company_id = _company_id
    AND a.response_count >= 7
    AND public.is_company_member(_company_id, auth.uid())
  ORDER BY a.global_score DESC NULLS LAST;
$$;