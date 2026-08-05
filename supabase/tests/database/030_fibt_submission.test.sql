-- pgTAP: Submissão transacional FIB-T ONDA 2
-- Testa a RPC submit_fibt_organizational_response como service_role
BEGIN;
SELECT plan(10);

-- Setup: criar empresa, setor, campanha, sessão de teste
INSERT INTO public.companies (id, legal_name, invite_code, owner_id, plan, sectors)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Empresa Teste Submissão',
  'TEST-SUBMIT-001',
  'bbbbbbbb-0000-0000-0000-000000000001',
  'free',
  ARRAY['Setor Teste']
);

INSERT INTO public.company_sectors (id, company_id, name, status, is_demo)
VALUES (
  'cccccccc-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Setor Teste',
  'active',
  false
);

INSERT INTO public.fibt_campaigns (id, company_id, title, status, opened_at)
VALUES (
  'dddddddd-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Campanha Teste',
  'open',
  now()
);

INSERT INTO public.fibt_campaign_sectors (campaign_id, sector_id)
VALUES (
  'dddddddd-0000-0000-0000-000000000001',
  'cccccccc-0000-0000-0000-000000000001'
);

-- Sessão válida
INSERT INTO public.fibt_public_sessions (id, token_hash, company_id, campaign_id, sector_id, status, expires_at)
VALUES (
  'eeeeeeee-0000-0000-0000-000000000001',
  encode(sha256('test-token-1'::bytea), 'hex'),
  'aaaaaaaa-0000-0000-0000-000000000001',
  'dddddddd-0000-0000-0000-000000000001',
  'cccccccc-0000-0000-0000-000000000001',
  'active',
  now() + interval '1 hour'
);

-- Sessão expirada
INSERT INTO public.fibt_public_sessions (id, token_hash, company_id, campaign_id, sector_id, status, expires_at)
VALUES (
  'eeeeeeee-0000-0000-0000-000000000002',
  encode(sha256('test-token-expired'::bytea), 'hex'),
  'aaaaaaaa-0000-0000-0000-000000000001',
  'dddddddd-0000-0000-0000-000000000001',
  'cccccccc-0000-0000-0000-000000000001',
  'active',
  now() - interval '1 hour'
);

-- Sessão já submetida
INSERT INTO public.fibt_public_sessions (id, token_hash, company_id, campaign_id, sector_id, status, expires_at, submitted_at)
VALUES (
  'eeeeeeee-0000-0000-0000-000000000003',
  encode(sha256('test-token-submitted'::bytea), 'hex'),
  'aaaaaaaa-0000-0000-0000-000000000001',
  'dddddddd-0000-0000-0000-000000000001',
  'cccccccc-0000-0000-0000-000000000001',
  'submitted',
  now() + interval '1 hour',
  now() - interval '30 minutes'
);

-- ── Testes ──

-- 1. Sessão inválida
SELECT is(
  (SELECT (public.submit_fibt_organizational_response(
    'ffffffff-0000-0000-0000-000000000099',
    'invalid-hash',
    '1.1.0', '1.0.0',
    '114b70bd9b5d495657704c04546110d390c5b267c4fb31d40901bed7b7b401ed',
    '{"1":2}'::jsonb, 50.0, '{}'::jsonb, '{}'::jsonb
  ))->>'error'),
  'session_not_found',
  'invalid session returns session_not_found');

-- 2. Sessão expirada
SELECT is(
  (SELECT (public.submit_fibt_organizational_response(
    'eeeeeeee-0000-0000-0000-000000000002',
    encode(sha256('test-token-expired'::bytea), 'hex'),
    '1.1.0', '1.0.0',
    '114b70bd9b5d495657704c04546110d390c5b267c4fb31d40901bed7b7b401ed',
    '{"1":2}'::jsonb, 50.0, '{}'::jsonb, '{}'::jsonb
  ))->>'error'),
  'session_expired',
  'expired session returns session_expired');

-- 3. Replay (sessão já submetida)
SELECT is(
  (SELECT (public.submit_fibt_organizational_response(
    'eeeeeeee-0000-0000-0000-000000000003',
    encode(sha256('test-token-submitted'::bytea), 'hex'),
    '1.1.0', '1.0.0',
    '114b70bd9b5d495657704c04546110d390c5b267c4fb31d40901bed7b7b401ed',
    '{"1":2}'::jsonb, 50.0, '{}'::jsonb, '{}'::jsonb
  ))->>'error'),
  'session_already_submitted',
  'already submitted session returns session_already_submitted');

-- 4. manifest_hash divergente
SELECT is(
  (SELECT (public.submit_fibt_organizational_response(
    'eeeeeeee-0000-0000-0000-000000000001',
    encode(sha256('test-token-1'::bytea), 'hex'),
    '1.1.0', '1.0.0',
    'aaaa_wrong_hash',
    '{"1":2}'::jsonb, 50.0, '{}'::jsonb, '{}'::jsonb
  ))->>'error'),
  'manifest_hash_mismatch',
  'wrong manifest_hash returns manifest_hash_mismatch');

-- 5. instrument_version incompatível
SELECT is(
  (SELECT (public.submit_fibt_organizational_response(
    'eeeeeeee-0000-0000-0000-000000000001',
    encode(sha256('test-token-1'::bytea), 'hex'),
    '2.0.0', '1.0.0',
    '114b70bd9b5d495657704c04546110d390c5b267c4fb31d40901bed7b7b401ed',
    '{"1":2}'::jsonb, 50.0, '{}'::jsonb, '{}'::jsonb
  ))->>'error'),
  'instrument_version_mismatch',
  'wrong instrument_version returns instrument_version_mismatch');

-- 6. Submissão válida
SELECT is(
  (SELECT (public.submit_fibt_organizational_response(
    'eeeeeeee-0000-0000-0000-000000000001',
    encode(sha256('test-token-1'::bytea), 'hex'),
    '1.1.0', '1.0.0',
    '114b70bd9b5d495657704c04546110d390c5b267c4fb31d40901bed7b7b401ed',
    '{"1":2,"2":3,"3":1,"4":4,"5":0,"6":2,"7":3,"8":1,"9":4,"10":0,"11":2,"12":3,"13":1,"14":4,"15":0,"16":2,"17":3,"18":1,"19":4,"20":0,"21":2,"22":3,"23":1,"24":4,"25":0,"26":2,"27":3,"28":1,"29":4,"30":0,"31":2,"32":3}'::jsonb,
    48.1, '{"padrao_vida":1.75,"bem_estar":2.08,"satisfacao":2.13}'::jsonb,
    '{"padrao_vida":1.75,"educacao":1.67,"cultura":1.5,"bem_estar":1.75,"saude":2.2,"uso_tempo":2.5,"vitalidade":1.5,"meio_ambiente":2.0,"governanca":2.43}'::jsonb
  ))->>'ok'),
  'true',
  'valid submission returns ok=true');

-- 7. Sessão atualizada para submitted
SELECT is(
  (SELECT status FROM public.fibt_public_sessions WHERE id = 'eeeeeeee-0000-0000-0000-000000000001'),
  'submitted',
  'session status updated to submitted');

-- 8. Resposta inserida com calculated_by = server
SELECT is(
  (SELECT calculated_by FROM public.fibt_organizational_responses WHERE session_id = 'eeeeeeee-0000-0000-0000-000000000001'),
  'server',
  'response has calculated_by = server');

-- 9. raw_purge_after é NULL (campanha aberta)
SELECT is(
  (SELECT raw_purge_after FROM public.fibt_organizational_responses WHERE session_id = 'eeeeeeee-0000-0000-0000-000000000001'),
  NULL::timestamptz,
  'raw_purge_after is NULL while campaign is open');

-- 10. Retry idempotente (mesma sessão)
SELECT is(
  (SELECT (public.submit_fibt_organizational_response(
    'eeeeeeee-0000-0000-0000-000000000001',
    encode(sha256('test-token-1'::bytea), 'hex'),
    '1.1.0', '1.0.0',
    '114b70bd9b5d495657704c04546110d390c5b267c4fb31d40901bed7b7b401ed',
    '{"1":2}'::jsonb, 50.0, '{}'::jsonb, '{}'::jsonb
  ))->>'error'),
  'replay_conflict',
  'retry with divergent payload returns replay_conflict');

SELECT * FROM finish();
ROLLBACK;
