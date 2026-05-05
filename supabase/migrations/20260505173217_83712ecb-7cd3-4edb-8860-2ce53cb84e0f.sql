CREATE TABLE public.fib_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  fib_score numeric NOT NULL,
  domains jsonb NOT NULL,
  factors jsonb NOT NULL,
  strengths jsonb NOT NULL DEFAULT '[]'::jsonb,
  vulnerabilities jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  learning_trails jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary text,
  encouragement text,
  raw_answers jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fib_assessments_user_created ON public.fib_assessments(user_id, created_at DESC);

ALTER TABLE public.fib_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own assessments" ON public.fib_assessments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own assessments" ON public.fib_assessments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own assessments" ON public.fib_assessments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins view all assessments" ON public.fib_assessments
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));