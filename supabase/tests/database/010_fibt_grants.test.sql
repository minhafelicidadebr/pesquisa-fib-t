-- pgTAP: Grants e segurança FIB-T ONDA 2
BEGIN;
SELECT plan(14);

-- RLS habilitada em tabelas sensíveis
SELECT is(
  (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'company_sectors'),
  true, 'company_sectors has RLS enabled');
SELECT is(
  (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fibt_campaigns'),
  true, 'fibt_campaigns has RLS enabled');
SELECT is(
  (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fibt_public_sessions'),
  true, 'fibt_public_sessions has RLS enabled');
SELECT is(
  (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fibt_organizational_responses'),
  true, 'fibt_organizational_responses has RLS enabled');
SELECT is(
  (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fibt_campaign_sectors'),
  true, 'fibt_campaign_sectors has RLS enabled');

-- anon NÃO tem permissão nas tabelas sensíveis
SELECT is(
  has_table_privilege('anon', 'public.fibt_public_sessions', 'SELECT'),
  false, 'anon cannot SELECT fibt_public_sessions');
SELECT is(
  has_table_privilege('anon', 'public.fibt_organizational_responses', 'SELECT'),
  false, 'anon cannot SELECT fibt_organizational_responses');
SELECT is(
  has_table_privilege('anon', 'public.fibt_organizational_responses', 'INSERT'),
  false, 'anon cannot INSERT fibt_organizational_responses');

-- authenticated NÃO tem INSERT direto
SELECT is(
  has_table_privilege('authenticated', 'public.fibt_organizational_responses', 'INSERT'),
  false, 'authenticated cannot INSERT fibt_organizational_responses directly');
SELECT is(
  has_table_privilege('authenticated', 'public.fibt_public_sessions', 'INSERT'),
  false, 'authenticated cannot INSERT fibt_public_sessions directly');

-- authenticated TEM SELECT em company_sectors e fibt_campaigns
SELECT is(
  has_table_privilege('authenticated', 'public.company_sectors', 'SELECT'),
  true, 'authenticated can SELECT company_sectors');
SELECT is(
  has_table_privilege('authenticated', 'public.fibt_campaigns', 'SELECT'),
  true, 'authenticated can SELECT fibt_campaigns');

-- Funções: anon não pode executar submit ou purge
SELECT is(
  has_function_privilege('anon', 'public.submit_fibt_organizational_response(uuid,text,text,text,text,jsonb,numeric,jsonb,jsonb,text,text)', 'EXECUTE'),
  false, 'anon cannot EXECUTE submit_fibt_organizational_response');
SELECT is(
  has_function_privilege('anon', 'public.purge_fibt_raw_answers()', 'EXECUTE'),
  false, 'anon cannot EXECUTE purge_fibt_raw_answers');

SELECT * FROM finish();
ROLLBACK;
