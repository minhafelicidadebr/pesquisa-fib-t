DO $$ BEGIN
  CREATE TYPE public.company_plan AS ENUM ('free','pro','enterprise');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS plan public.company_plan NOT NULL DEFAULT 'free';