-- pgTAP: Schema FIB-T ONDA 2
BEGIN;
SELECT plan(25);

-- Tabelas existem
SELECT has_table('public', 'company_sectors', 'company_sectors exists');
SELECT has_table('public', 'fibt_campaigns', 'fibt_campaigns exists');
SELECT has_table('public', 'fibt_campaign_sectors', 'fibt_campaign_sectors exists');
SELECT has_table('public', 'fibt_public_sessions', 'fibt_public_sessions exists');
SELECT has_table('public', 'fibt_organizational_responses', 'fibt_organizational_responses exists');

-- Colunas críticas
SELECT has_column('public', 'company_sectors', 'normalized_name', 'normalized_name column');
SELECT has_column('public', 'company_sectors', 'is_demo', 'is_demo column');
SELECT has_column('public', 'fibt_campaigns', 'privacy_threshold', 'privacy_threshold column');
SELECT has_column('public', 'fibt_campaigns', 'raw_retention_days', 'raw_retention_days column');
SELECT has_column('public', 'fibt_public_sessions', 'token_hash', 'token_hash column');
SELECT has_column('public', 'fibt_public_sessions', 'idempotency_key', 'idempotency_key column');
SELECT has_column('public', 'fibt_organizational_responses', 'manifest_hash', 'manifest_hash column');
SELECT has_column('public', 'fibt_organizational_responses', 'raw_purge_after', 'raw_purge_after column');
SELECT has_column('public', 'fibt_organizational_responses', 'calculated_by', 'calculated_by column');

-- NÃO possui user_id
SELECT hasnt_column('public', 'fibt_organizational_responses', 'user_id',
  'fibt_organizational_responses must NOT have user_id');
SELECT hasnt_column('public', 'fibt_organizational_responses', 'email',
  'fibt_organizational_responses must NOT have email');
SELECT hasnt_column('public', 'fibt_organizational_responses', 'profile_id',
  'fibt_organizational_responses must NOT have profile_id');

-- Constraints CHECK
SELECT col_has_check('public', 'fibt_campaigns', 'privacy_threshold',
  'privacy_threshold has CHECK');
SELECT col_has_check('public', 'fibt_organizational_responses', 'calculated_by',
  'calculated_by has CHECK');
SELECT col_has_check('public', 'fibt_organizational_responses', 'manifest_hash',
  'manifest_hash has CHECK');

-- Índices
SELECT has_index('public', 'company_sectors', 'idx_company_sectors_company',
  'company_sectors company index');
SELECT has_index('public', 'fibt_campaigns', 'idx_fibt_campaigns_company',
  'campaigns company index');
SELECT has_index('public', 'fibt_organizational_responses', 'idx_fibt_org_responses_campaign',
  'responses campaign index');
SELECT has_index('public', 'fibt_organizational_responses', 'idx_fibt_org_responses_purge',
  'responses purge index');

-- Unique constraint on session_id
SELECT col_is_unique('public', 'fibt_organizational_responses', 'session_id',
  'session_id is UNIQUE (1:1 with session)');

SELECT * FROM finish();
ROLLBACK;
