CREATE TABLE public.isg_pilot_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cohort text NOT NULL DEFAULT 'isg',
  instrument_id text NOT NULL,
  instrument_version text NOT NULL,
  answers jsonb NOT NULL,
  global_score numeric NOT NULL,
  factors jsonb NOT NULL,
  domains jsonb NOT NULL,
  manifest jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.isg_pilot_responses TO service_role;

ALTER TABLE public.isg_pilot_responses ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_isg_pilot_responses_cohort_created
  ON public.isg_pilot_responses (cohort, created_at DESC);