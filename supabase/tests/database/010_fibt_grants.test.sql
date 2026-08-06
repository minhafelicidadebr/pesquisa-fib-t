-- pgTAP: Grants e segurança FIB-T ONDA 2
BEGIN;
SELECT plan(30);

-- ════════════════════════════════════════════════════════════
-- RLS habilitada em tabelas sensíveis
-- ════════════════════════════════════════════════════════════
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

-- ════════════════════════════════════════════════════════════
-- anon NÃO tem permissão nas tabelas sensíveis
-- ════════════════════════════════════════════════════════════
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

-- ════════════════════════════════════════════════════════════
-- service_role: SELECT nas tabelas consultadas diretamente pelas Edge Functions
-- (create-fibt-session e submit-fibt-response via PostgREST)
-- ════════════════════════════════════════════════════════════
SELECT is(
  has_table_privilege('service_role', 'public.companies', 'SELECT'),
  true, 'service_role can SELECT companies (invite_code lookup)');
SELECT is(
  has_table_privilege('service_role', 'public.fibt_campaigns', 'SELECT'),
  true, 'service_role can SELECT fibt_campaigns (campaign lookup)');
SELECT is(
  has_table_privilege('service_role', 'public.fibt_campaign_sectors', 'SELECT'),
  true, 'service_role can SELECT fibt_campaign_sectors (sector link check)');
SELECT is(
  has_table_privilege('service_role', 'public.company_sectors', 'SELECT'),
  true, 'service_role can SELECT company_sectors (sector validation)');
SELECT is(
  has_table_privilege('service_role', 'public.fibt_public_sessions', 'SELECT'),
  true, 'service_role can SELECT fibt_public_sessions (token lookup)');

-- service_role: INSERT em fibt_public_sessions (create-fibt-session)
SELECT is(
  has_table_privilege('service_role', 'public.fibt_public_sessions', 'INSERT'),
  true, 'service_role can INSERT fibt_public_sessions (session creation)');

-- ════════════════════════════════════════════════════════════
-- service_role: NÃO tem UPDATE/DELETE desnecessários
-- (UPDATE/DELETE em sessions e responses são feitos pela RPC SECURITY DEFINER)
-- ════════════════════════════════════════════════════════════
SELECT is(
  has_table_privilege('service_role', 'public.fibt_public_sessions', 'UPDATE'),
  false, 'service_role cannot UPDATE fibt_public_sessions (done by RPC)');
SELECT is(
  has_table_privilege('service_role', 'public.fibt_public_sessions', 'DELETE'),
  false, 'service_role cannot DELETE fibt_public_sessions');
SELECT is(
  has_table_privilege('service_role', 'public.fibt_organizational_responses', 'SELECT'),
  false, 'service_role cannot SELECT fibt_organizational_responses directly');
SELECT is(
  has_table_privilege('service_role', 'public.fibt_organizational_responses', 'INSERT'),
  false, 'service_role cannot INSERT fibt_organizational_responses directly');
SELECT is(
  has_table_privilege('service_role', 'public.fibt_organizational_responses', 'UPDATE'),
  false, 'service_role cannot UPDATE fibt_organizational_responses');
SELECT is(
  has_table_privilege('service_role', 'public.fibt_organizational_responses', 'DELETE'),
  false, 'service_role cannot DELETE fibt_organizational_responses');

-- ════════════════════════════════════════════════════════════
-- PUBLIC não tem acesso
-- ════════════════════════════════════════════════════════════
SELECT is(
  has_table_privilege('public', 'public.fibt_public_sessions', 'SELECT'),
  false, 'PUBLIC cannot SELECT fibt_public_sessions');
SELECT is(
  has_table_privilege('public', 'public.fibt_organizational_responses', 'SELECT'),
  false, 'PUBLIC cannot SELECT fibt_organizational_responses');

-- ════════════════════════════════════════════════════════════
-- service_role: EXECUTE nas funções de submissão e purga
-- ════════════════════════════════════════════════════════════
SELECT is(
  has_function_privilege('service_role', 'public.submit_fibt_organizational_response(uuid,text,text,text,text,jsonb,numeric,jsonb,jsonb,text,text)', 'EXECUTE'),
  true, 'service_role can EXECUTE submit_fibt_organizational_response');
SELECT is(
  has_function_privilege('service_role', 'public.purge_fibt_raw_answers()', 'EXECUTE'),
  true, 'service_role can EXECUTE purge_fibt_raw_answers');

SELECT * FROM finish();
ROLLBACK;
