-- pgTAP: RLS policies FIB-T ONDA 2
BEGIN;
SELECT plan(8);

-- Policies existem para tabelas com SELECT
SELECT policies_are('public', 'company_sectors',
  ARRAY['company_sectors_select_member'],
  'company_sectors has expected policies');

SELECT policies_are('public', 'fibt_campaigns',
  ARRAY['fibt_campaigns_select_member'],
  'fibt_campaigns has expected policies');

SELECT policies_are('public', 'fibt_campaign_sectors',
  ARRAY['fibt_campaign_sectors_select'],
  'fibt_campaign_sectors has expected policies');

-- Tabelas bloqueadas: nenhuma policy (service_role only)
SELECT policies_are('public', 'fibt_public_sessions',
  ARRAY[]::text[],
  'fibt_public_sessions has NO policies (blocked)');

SELECT policies_are('public', 'fibt_organizational_responses',
  ARRAY[]::text[],
  'fibt_organizational_responses has NO policies (blocked)');

-- Funções são SECURITY DEFINER
SELECT is(
  (SELECT prosecdef FROM pg_proc WHERE proname = 'submit_fibt_organizational_response'),
  true, 'submit_fibt_organizational_response is SECURITY DEFINER');

SELECT is(
  (SELECT prosecdef FROM pg_proc WHERE proname = 'get_fibt_organization_dashboard'),
  true, 'get_fibt_organization_dashboard is SECURITY DEFINER');

SELECT is(
  (SELECT prosecdef FROM pg_proc WHERE proname = 'can_manage_fibt'),
  true, 'can_manage_fibt is SECURITY DEFINER');

SELECT * FROM finish();
ROLLBACK;
