
CREATE OR REPLACE FUNCTION public.list_nr1_signatories(
  _search text DEFAULT NULL,
  _uf text DEFAULT NULL,
  _headcount text DEFAULT NULL,
  _limit int DEFAULT 60,
  _offset int DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_items jsonb;
  v_total int;
  v_search text := nullif(trim(coalesce(_search,'')),'');
  v_uf text := nullif(trim(coalesce(_uf,'')),'');
  v_hc text := nullif(trim(coalesce(_headcount,'')),'');
  v_lim int := least(greatest(coalesce(_limit,60), 1), 120);
  v_off int := greatest(coalesce(_offset,0), 0);
BEGIN
  SELECT count(*)::int INTO v_total
  FROM public.nr1_manifest_signatures s
  WHERE (v_uf IS NULL OR s.state_uf = upper(v_uf))
    AND (v_hc IS NULL OR s.headcount_range = v_hc)
    AND (v_search IS NULL OR s.company_name ILIKE '%' || v_search || '%');

  SELECT coalesce(jsonb_agg(row_to_json(r) ORDER BY r.created_at DESC), '[]'::jsonb)
    INTO v_items
  FROM (
    SELECT
      s.id,
      s.company_name,
      split_part(s.full_name, ' ', 1) AS first_name,
      s.role,
      s.state_uf,
      s.headcount_range,
      s.created_at
    FROM public.nr1_manifest_signatures s
    WHERE (v_uf IS NULL OR s.state_uf = upper(v_uf))
      AND (v_hc IS NULL OR s.headcount_range = v_hc)
      AND (v_search IS NULL OR s.company_name ILIKE '%' || v_search || '%')
    ORDER BY s.created_at DESC
    LIMIT v_lim OFFSET v_off
  ) r;

  RETURN jsonb_build_object('total', v_total, 'items', v_items, 'limit', v_lim, 'offset', v_off);
END;
$$;

GRANT EXECUTE ON FUNCTION public.list_nr1_signatories(text, text, text, int, int) TO anon, authenticated;
