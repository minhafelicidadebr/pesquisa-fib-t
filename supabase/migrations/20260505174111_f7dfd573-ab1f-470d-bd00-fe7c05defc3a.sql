CREATE TABLE public.nr1_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  global_risk text NOT NULL,
  global_score numeric NOT NULL,
  subscales jsonb NOT NULL,
  red_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  green_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary text,
  raw_answers jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_nr1_assessments_user_created ON public.nr1_assessments(user_id, created_at DESC);

ALTER TABLE public.nr1_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own nr1" ON public.nr1_assessments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own nr1" ON public.nr1_assessments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own nr1" ON public.nr1_assessments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins view all nr1" ON public.nr1_assessments
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));