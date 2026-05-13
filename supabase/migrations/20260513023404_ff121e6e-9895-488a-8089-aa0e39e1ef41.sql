
-- 1. Extend app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sst';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'gestor';

-- 2. COPSOQ version enum
DO $$ BEGIN
  CREATE TYPE public.copsoq_version AS ENUM ('curto', 'medio', 'longo', 'brasil');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Invite code generator
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
AS $$
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
$$;

-- 4. companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  legal_name text NOT NULL,
  cnpj text,
  sector text,
  estimated_employees int DEFAULT 0,
  invite_code text NOT NULL UNIQUE,
  copsoq_version public.copsoq_version NOT NULL DEFAULT 'curto',
  sectors text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Trigger to auto-generate invite_code
CREATE OR REPLACE FUNCTION public.set_invite_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
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
$$;

DROP TRIGGER IF EXISTS trg_companies_invite_code ON public.companies;
CREATE TRIGGER trg_companies_invite_code
BEFORE INSERT ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.set_invite_code();

DROP TRIGGER IF EXISTS trg_companies_updated_at ON public.companies;
CREATE TRIGGER trg_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. company_members table
CREATE TABLE IF NOT EXISTS public.company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'colaborador',
  sector text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_company_members_user ON public.company_members(user_id);
CREATE INDEX IF NOT EXISTS idx_company_members_company ON public.company_members(company_id);

-- 7. Helper: is user a member of a company?
CREATE OR REPLACE FUNCTION public.is_company_member(_company_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = _company_id AND user_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.companies WHERE id = _company_id AND owner_id = _user_id
  );
$$;

-- 8. Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

-- companies policies
CREATE POLICY "Owner can insert company"
  ON public.companies FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owner or admin can update company"
  ON public.companies FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Owner or admin can delete company"
  ON public.companies FOR DELETE TO authenticated
  USING (auth.uid() = owner_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Members can view own company"
  ON public.companies FOR SELECT TO authenticated
  USING (
    auth.uid() = owner_id
    OR has_role(auth.uid(), 'admin')
    OR public.is_company_member(id, auth.uid())
  );

-- company_members policies
CREATE POLICY "Members can view their own memberships"
  ON public.company_members FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.owner_id = auth.uid())
  );

CREATE POLICY "Users can insert own membership"
  ON public.company_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owner or admin can manage memberships"
  ON public.company_members FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.owner_id = auth.uid())
  );

-- 9. Join by invite code (SECURITY DEFINER so user can find company without SELECT on all)
CREATE OR REPLACE FUNCTION public.join_company_by_code(_code text, _sector text DEFAULT NULL, _role public.app_role DEFAULT 'colaborador')
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _company_id uuid;
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT id INTO _company_id FROM public.companies WHERE invite_code = upper(trim(_code));
  IF _company_id IS NULL THEN RAISE EXCEPTION 'Invalid invite code'; END IF;

  INSERT INTO public.company_members (company_id, user_id, role, sector)
  VALUES (_company_id, _uid, _role, _sector)
  ON CONFLICT (company_id, user_id) DO UPDATE SET sector = EXCLUDED.sector, role = EXCLUDED.role;

  -- Also reflect role on user_roles for app-wide checks
  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, _role)
  ON CONFLICT DO NOTHING;

  RETURN _company_id;
END;
$$;

-- 10. Add company link to nr1_assessments
ALTER TABLE public.nr1_assessments ADD COLUMN IF NOT EXISTS company_id uuid;
CREATE INDEX IF NOT EXISTS idx_nr1_company ON public.nr1_assessments(company_id);

-- Allow company owner/admin to view aggregate results from their company
CREATE POLICY "Company owner can view company nr1"
  ON public.nr1_assessments FOR SELECT TO authenticated
  USING (
    company_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.owner_id = auth.uid())
  );
