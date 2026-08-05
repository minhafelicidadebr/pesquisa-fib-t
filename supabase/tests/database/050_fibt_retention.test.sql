-- pgTAP: Retenção e purga de raw_answers FIB-T ONDA 2
BEGIN;
SELECT plan(6);

-- Setup: resposta com raw_purge_after vencido
INSERT INTO public.companies (id, legal_name, invite_code, owner_id, plan, sectors)
VALUES (
  'aaaaaaaa-2222-0000-0000-000000000001',
  'Empresa Teste Purga',
  'TEST-PURGE-001',
  'bbbbbbbb-2222-0000-0000-000000000001',
  'free',
  ARRAY[]::text[]
);

INSERT INTO public.company_sectors (id, company_id, name, status, is_demo)
VALUES (
  'cccccccc-2222-0000-0000-000000000001',
  'aaaaaaaa-2222-0000-0000-000000000001',
  'Setor Purga',
  'active',
  false
);

INSERT INTO public.fibt_campaigns (id, company_id, title, status, raw_retention_days, opened_at, closed_at)
VALUES (
  'dddddddd-2222-0000-0000-000000000001',
  'aaaaaaaa-2222-0000-0000-000000000001',
  'Campanha Purga Test',
  'closed',
  180,
  now() - interval '200 days',
  now() - interval '190 days'
);

INSERT INTO public.fibt_campaign_sectors (campaign_id, sector_id)
VALUES ('dddddddd-2222-0000-0000-000000000001', 'cccccccc-2222-0000-0000-000000000001');

-- Resposta com purge_after VENCIDO
INSERT INTO public.fibt_public_sessions (id, token_hash, company_id, campaign_id, sector_id, status, expires_at, submitted_at)
VALUES (
  'eeeeeeee-2222-0000-0000-000000000001',
  encode(sha256('purge-test-1'::bytea), 'hex'),
  'aaaaaaaa-2222-0000-0000-000000000001',
  'dddddddd-2222-0000-0000-000000000001',
  'cccccccc-2222-0000-0000-000000000001',
  'submitted', now(), now() - interval '185 days'
);

INSERT INTO public.fibt_organizational_responses (
  id, company_id, campaign_id, sector_id, session_id,
  instrument_id, instrument_version, scoring_engine_version, manifest_hash,
  raw_answers, global_score, factor_scores, domain_scores, calculated_by,
  raw_purge_after
) VALUES (
  'ffffffff-2222-0000-0000-000000000001',
  'aaaaaaaa-2222-0000-0000-000000000001',
  'dddddddd-2222-0000-0000-000000000001',
  'cccccccc-2222-0000-0000-000000000001',
  'eeeeeeee-2222-0000-0000-000000000001',
  'FIB-T', '1.1.0', '1.0.0',
  '114b70bd9b5d495657704c04546110d390c5b267c4fb31d40901bed7b7b401ed',
  '{"1":2,"2":3}'::jsonb, 50.0,
  '{"padrao_vida":2.0,"bem_estar":2.0,"satisfacao":2.0}'::jsonb,
  '{"padrao_vida":2.0}'::jsonb, 'server',
  now() - interval '10 days'  -- vencido
);

-- Resposta com purge_after FUTURO
INSERT INTO public.fibt_public_sessions (id, token_hash, company_id, campaign_id, sector_id, status, expires_at, submitted_at)
VALUES (
  'eeeeeeee-2222-0000-0000-000000000002',
  encode(sha256('purge-test-2'::bytea), 'hex'),
  'aaaaaaaa-2222-0000-0000-000000000001',
  'dddddddd-2222-0000-0000-000000000001',
  'cccccccc-2222-0000-0000-000000000001',
  'submitted', now(), now() - interval '100 days'
);

INSERT INTO public.fibt_organizational_responses (
  id, company_id, campaign_id, sector_id, session_id,
  instrument_id, instrument_version, scoring_engine_version, manifest_hash,
  raw_answers, global_score, factor_scores, domain_scores, calculated_by,
  raw_purge_after
) VALUES (
  'ffffffff-2222-0000-0000-000000000002',
  'aaaaaaaa-2222-0000-0000-000000000001',
  'dddddddd-2222-0000-0000-000000000001',
  'cccccccc-2222-0000-0000-000000000001',
  'eeeeeeee-2222-0000-0000-000000000002',
  'FIB-T', '1.1.0', '1.0.0',
  '114b70bd9b5d495657704c04546110d390c5b267c4fb31d40901bed7b7b401ed',
  '{"1":2,"2":3}'::jsonb, 55.0,
  '{"padrao_vida":2.0,"bem_estar":2.0,"satisfacao":2.0}'::jsonb,
  '{"padrao_vida":2.0}'::jsonb, 'server',
  now() + interval '90 days'  -- futuro
);

-- ── Testes ──

-- 1. Antes da purga: ambas possuem raw_answers
SELECT is(
  (SELECT count(*) FROM public.fibt_organizational_responses
   WHERE raw_answers IS NOT NULL AND company_id = 'aaaaaaaa-2222-0000-0000-000000000001')::integer,
  2, 'Before purge: 2 responses have raw_answers');

-- 2. Executar purga
SELECT is(
  (SELECT (public.purge_fibt_raw_answers())->>'purged_count')::integer,
  1, 'Purge removes exactly 1 expired record');

-- 3. Resposta vencida: raw_answers = NULL
SELECT is(
  (SELECT raw_answers FROM public.fibt_organizational_responses WHERE id = 'ffffffff-2222-0000-0000-000000000001'),
  NULL::jsonb, 'Expired response raw_answers is NULL after purge');

-- 4. Resposta futura: raw_answers preservado
SELECT isnt(
  (SELECT raw_answers FROM public.fibt_organizational_responses WHERE id = 'ffffffff-2222-0000-0000-000000000002'),
  NULL::jsonb, 'Future response raw_answers is preserved');

-- 5. Scores preservados após purga
SELECT is(
  (SELECT global_score FROM public.fibt_organizational_responses WHERE id = 'ffffffff-2222-0000-0000-000000000001'),
  50.0::numeric(4,1), 'global_score preserved after purge');

-- 6. Segunda purga: idempotente (0 rows)
SELECT is(
  (SELECT (public.purge_fibt_raw_answers())->>'purged_count')::integer,
  0, 'Second purge is idempotent (0 rows)');

SELECT * FROM finish();
ROLLBACK;
