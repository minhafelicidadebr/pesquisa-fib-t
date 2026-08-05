-- pgTAP: Privacidade e k-anonimato FIB-T ONDA 2
-- Testa get_fibt_organization_dashboard com diferentes contagens
BEGIN;
SELECT plan(8);

-- Setup: empresa com owner autenticado
INSERT INTO public.companies (id, legal_name, invite_code, owner_id, plan, sectors)
VALUES (
  'aaaaaaaa-1111-0000-0000-000000000001',
  'Empresa Teste Privacy',
  'TEST-PRIV-001',
  'bbbbbbbb-1111-0000-0000-000000000001',
  'free',
  ARRAY[]::text[]
);

-- Setores
INSERT INTO public.company_sectors (id, company_id, name, status, is_demo)
VALUES
  ('cccccccc-1111-0000-0000-000000000001', 'aaaaaaaa-1111-0000-0000-000000000001', 'Visível 8', 'active', false),
  ('cccccccc-1111-0000-0000-000000000002', 'aaaaaaaa-1111-0000-0000-000000000001', 'Visível 7', 'active', false),
  ('cccccccc-1111-0000-0000-000000000003', 'aaaaaaaa-1111-0000-0000-000000000001', 'Suprimido 6', 'active', false),
  ('cccccccc-1111-0000-0000-000000000004', 'aaaaaaaa-1111-0000-0000-000000000001', 'Visível 12', 'active', false);

-- Campanha
INSERT INTO public.fibt_campaigns (id, company_id, title, status, privacy_threshold, opened_at)
VALUES (
  'dddddddd-1111-0000-0000-000000000001',
  'aaaaaaaa-1111-0000-0000-000000000001',
  'Campanha Privacy Test',
  'open',
  7,
  now()
);

INSERT INTO public.fibt_campaign_sectors (campaign_id, sector_id)
VALUES
  ('dddddddd-1111-0000-0000-000000000001', 'cccccccc-1111-0000-0000-000000000001'),
  ('dddddddd-1111-0000-0000-000000000001', 'cccccccc-1111-0000-0000-000000000002'),
  ('dddddddd-1111-0000-0000-000000000001', 'cccccccc-1111-0000-0000-000000000003'),
  ('dddddddd-1111-0000-0000-000000000001', 'cccccccc-1111-0000-0000-000000000004');

-- Inserir respostas: 8, 7, 6, 12
DO $$
DECLARE
  v_i integer;
  v_sid uuid;
  v_sectors uuid[] := ARRAY[
    'cccccccc-1111-0000-0000-000000000001'::uuid,
    'cccccccc-1111-0000-0000-000000000002'::uuid,
    'cccccccc-1111-0000-0000-000000000003'::uuid,
    'cccccccc-1111-0000-0000-000000000004'::uuid
  ];
  v_counts integer[] := ARRAY[8, 7, 6, 12];
  v_s integer;
BEGIN
  FOR v_s IN 1..4 LOOP
    FOR v_i IN 1..v_counts[v_s] LOOP
      v_sid := gen_random_uuid();
      INSERT INTO public.fibt_public_sessions (id, token_hash, company_id, campaign_id, sector_id, status, expires_at, submitted_at)
      VALUES (v_sid, encode(sha256(('priv-' || v_s || '-' || v_i)::bytea), 'hex'),
        'aaaaaaaa-1111-0000-0000-000000000001', 'dddddddd-1111-0000-0000-000000000001',
        v_sectors[v_s], 'submitted', now() + interval '7 days', now());
      INSERT INTO public.fibt_organizational_responses (
        company_id, campaign_id, sector_id, session_id,
        instrument_id, instrument_version, scoring_engine_version, manifest_hash,
        raw_answers, global_score, factor_scores, domain_scores, calculated_by
      ) VALUES (
        'aaaaaaaa-1111-0000-0000-000000000001', 'dddddddd-1111-0000-0000-000000000001',
        v_sectors[v_s], v_sid,
        'FIB-T', '1.1.0', '1.0.0',
        '114b70bd9b5d495657704c04546110d390c5b267c4fb31d40901bed7b7b401ed',
        '{"1":2}'::jsonb, 50.0,
        '{"padrao_vida":2.0,"bem_estar":2.0,"satisfacao":2.0}'::jsonb,
        '{"padrao_vida":2.0,"educacao":2.0,"cultura":2.0,"bem_estar":2.0,"saude":2.0,"uso_tempo":2.0,"vitalidade":2.0,"meio_ambiente":2.0,"governanca":2.0}'::jsonb,
        'server'
      );
    END LOOP;
  END LOOP;
END;
$$;

-- Simular auth.uid() como owner para a chamada
-- Em pgTAP com Supabase local, set role e jwt claims
SET LOCAL role TO 'authenticated';
SET LOCAL request.jwt.claims TO '{"sub":"bbbbbbbb-1111-0000-0000-000000000001"}';

-- Executar dashboard
CREATE OR REPLACE FUNCTION pg_temp._run_privacy_tests() RETURNS SETOF text LANGUAGE plpgsql AS $$
DECLARE
  v_result jsonb;
  v_sectors jsonb;
  v_sector jsonb;
BEGIN
  v_result := public.get_fibt_organization_dashboard('dddddddd-1111-0000-0000-000000000001');
  v_sectors := v_result->'sectors';

  -- Setor "Visível 8" (n=8): visible=true
  v_sector := (SELECT s FROM jsonb_array_elements(v_sectors) s WHERE s->>'sector_name' = 'Visível 8');
  RETURN NEXT is((v_sector->>'visible')::boolean, true, 'Setor n=8 is visible');
  RETURN NEXT is((v_sector->>'response_count')::integer, 8, 'Setor n=8 response_count=8');

  -- Setor "Visível 7" (n=7): visible=true (threshold exact)
  v_sector := (SELECT s FROM jsonb_array_elements(v_sectors) s WHERE s->>'sector_name' = 'Visível 7');
  RETURN NEXT is((v_sector->>'visible')::boolean, true, 'Setor n=7 is visible');
  RETURN NEXT is((v_sector->>'response_count')::integer, 7, 'Setor n=7 response_count=7');

  -- Setor "Suprimido 6" (n=6): visible=false
  v_sector := (SELECT s FROM jsonb_array_elements(v_sectors) s WHERE s->>'sector_name' = 'Suprimido 6');
  RETURN NEXT is((v_sector->>'visible')::boolean, false, 'Setor n=6 is suppressed');
  RETURN NEXT is(v_sector->>'response_count', NULL, 'Setor n=6 response_count is null');
  RETURN NEXT is(v_sector->>'suppression_reason', 'privacy_threshold', 'Setor n=6 has suppression_reason');

  -- Setor "Visível 12" (n=12): visible=true
  v_sector := (SELECT s FROM jsonb_array_elements(v_sectors) s WHERE s->>'sector_name' = 'Visível 12');
  RETURN NEXT is((v_sector->>'visible')::boolean, true, 'Setor n=12 is visible');
END;
$$;
SELECT * FROM pg_temp._run_privacy_tests();

SELECT * FROM finish();
ROLLBACK;
