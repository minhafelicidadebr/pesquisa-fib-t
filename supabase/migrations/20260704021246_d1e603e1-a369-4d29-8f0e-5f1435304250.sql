
CREATE OR REPLACE FUNCTION public.get_nr1_seal(_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', id,
    'first_name', split_part(full_name, ' ', 1),
    'role', role,
    'company_name', company_name,
    'state_uf', state_uf,
    'headcount_range', headcount_range,
    'created_at', created_at
  ) INTO v
  FROM public.nr1_manifest_signatures
  WHERE id = _id
  LIMIT 1;
  RETURN v;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_nr1_seal(uuid) TO anon, authenticated;
