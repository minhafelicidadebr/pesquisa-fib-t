-- ============================================================
-- ONDA 2 — MIGRATION A: Fundação organizacional
-- FIB-T Banco organizacional, submissão transacional, privacidade
-- ============================================================
-- NÃO APLICAR EM PRODUÇÃO SEM AUTORIZAÇÃO FORMAL.
-- Esta migration é local e revisável.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. company_sectors — fonte canônica de setores para FIB-T
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.company_sectors (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id     uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name          text NOT NULL,
  normalized_name text NOT NULL GENERATED ALWAYS AS (lower(trim(name))) STORED,
  status        text NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'archived')),
  is_demo       boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  -- Unicidade: mesmo nome normalizado não pode repetir na mesma empresa ativa
  CONSTRAINT uq_company_sector_name
    UNIQUE (company_id, normalized_name)
);

CREATE INDEX IF NOT EXISTS idx_company_sectors_company
  ON public.company_sectors(company_id);

CREATE INDEX IF NOT EXISTS idx_company_sectors_public_id
  ON public.company_sectors(public_id);

COMMENT ON TABLE public.company_sectors IS
  'Fonte canônica de setores por organização para o fluxo FIB-T organizacional (ONDA 2).';

-- ────────────────────────────────────────────────────────────
-- 2. fibt_campaigns — ciclos de pesquisa FIB-T
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.fibt_campaigns (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title               text NOT NULL,
  instrument_id       text NOT NULL DEFAULT 'FIB-T',
  instrument_version  text NOT NULL DEFAULT '1.1.0',
  status              text NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'open', 'paused', 'closed')),
  privacy_threshold   integer NOT NULL DEFAULT 7
                        CHECK (privacy_threshold >= 7),
  raw_retention_days  integer NOT NULL DEFAULT 180
                        CHECK (raw_retention_days > 0),
  is_demo             boolean NOT NULL DEFAULT false,
  opened_at           timestamptz,
  closed_at           timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Constraint: somente uma campanha FIB-T pública ativa (status='open') por organização
CREATE UNIQUE INDEX IF NOT EXISTS uq_fibt_campaign_one_open_per_company
  ON public.fibt_campaigns(company_id)
  WHERE status = 'open';

CREATE INDEX IF NOT EXISTS idx_fibt_campaigns_company
  ON public.fibt_campaigns(company_id);

COMMENT ON TABLE public.fibt_campaigns IS
  'Campanhas FIB-T organizacionais. Máximo uma aberta por empresa (índice parcial).';

-- ────────────────────────────────────────────────────────────
-- 3. fibt_campaign_sectors — setores vinculados a uma campanha
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.fibt_campaign_sectors (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   uuid NOT NULL REFERENCES public.fibt_campaigns(id) ON DELETE CASCADE,
  sector_id     uuid NOT NULL REFERENCES public.company_sectors(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT uq_campaign_sector UNIQUE (campaign_id, sector_id)
);

CREATE INDEX IF NOT EXISTS idx_fibt_campaign_sectors_campaign
  ON public.fibt_campaign_sectors(campaign_id);

COMMENT ON TABLE public.fibt_campaign_sectors IS
  'Vincula setores habilitados em cada campanha FIB-T.';

-- ────────────────────────────────────────────────────────────
-- 4. fibt_public_sessions — sessões anônimas de coleta
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.fibt_public_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Token armazenado como hash SHA-256 (nunca em texto puro)
  token_hash      text NOT NULL,
  company_id      uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  campaign_id     uuid NOT NULL REFERENCES public.fibt_campaigns(id) ON DELETE CASCADE,
  sector_id       uuid NOT NULL REFERENCES public.company_sectors(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'issued'
                    CHECK (status IN ('issued', 'active', 'submitted', 'expired', 'revoked')),
  idempotency_key uuid UNIQUE,
  expires_at      timestamptz NOT NULL,
  submitted_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_session_not_submitted_twice
    CHECK (
      (status = 'submitted' AND submitted_at IS NOT NULL) OR
      (status != 'submitted')
    )
);

CREATE INDEX IF NOT EXISTS idx_fibt_sessions_campaign
  ON public.fibt_public_sessions(campaign_id);

CREATE INDEX IF NOT EXISTS idx_fibt_sessions_token_hash
  ON public.fibt_public_sessions(token_hash);

CREATE INDEX IF NOT EXISTS idx_fibt_sessions_status
  ON public.fibt_public_sessions(status)
  WHERE status IN ('issued', 'active');

COMMENT ON TABLE public.fibt_public_sessions IS
  'Sessões anônimas do FIB-T. Token armazenado como hash. Sem identidade do participante.';

-- ────────────────────────────────────────────────────────────
-- 5. fibt_organizational_responses — respostas anônimas
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.fibt_organizational_responses (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id              uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  campaign_id             uuid NOT NULL REFERENCES public.fibt_campaigns(id) ON DELETE CASCADE,
  sector_id               uuid NOT NULL REFERENCES public.company_sectors(id) ON DELETE CASCADE,
  session_id              uuid NOT NULL UNIQUE
                            REFERENCES public.fibt_public_sessions(id) ON DELETE CASCADE,
  instrument_id           text NOT NULL DEFAULT 'FIB-T'
                            CHECK (instrument_id = 'FIB-T'),
  instrument_version      text NOT NULL
                            CHECK (instrument_version = '1.1.0'),
  scoring_engine_version  text NOT NULL
                            CHECK (scoring_engine_version = '1.0.0'),
  manifest_hash           text NOT NULL
                            CHECK (manifest_hash = '114b70bd9b5d495657704c04546110d390c5b267c4fb31d40901bed7b7b401ed'),
  idempotency_key_hash    text,
  request_payload_hash    text,
  raw_answers             jsonb,
  global_score            numeric(4,1) NOT NULL
                            CHECK (global_score >= 0 AND global_score <= 100),
  factor_scores           jsonb NOT NULL,
  domain_scores           jsonb NOT NULL,
  calculated_by           text NOT NULL DEFAULT 'server'
                            CHECK (calculated_by = 'server'),
  raw_purge_after         timestamptz,
  submitted_at            timestamptz NOT NULL DEFAULT now(),
  created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fibt_org_responses_campaign
  ON public.fibt_organizational_responses(campaign_id);

CREATE INDEX IF NOT EXISTS idx_fibt_org_responses_sector
  ON public.fibt_organizational_responses(sector_id);

CREATE INDEX IF NOT EXISTS idx_fibt_org_responses_company
  ON public.fibt_organizational_responses(company_id);

CREATE INDEX IF NOT EXISTS idx_fibt_org_responses_purge
  ON public.fibt_organizational_responses(raw_purge_after)
  WHERE raw_answers IS NOT NULL;

COMMENT ON TABLE public.fibt_organizational_responses IS
  'Respostas FIB-T organizacionais anônimas. SEM user_id, sem e-mail, sem nome, sem CPF. '
  'Acessível apenas via service_role para INSERT e via RPC agregadora para leitura.';

-- ────────────────────────────────────────────────────────────
-- 6. Backfill: companies.sectors[] → company_sectors
--    Idempotente: usa ON CONFLICT DO NOTHING
-- ────────────────────────────────────────────────────────────

INSERT INTO public.company_sectors (company_id, name, status, is_demo, display_order)
SELECT
  c.id AS company_id,
  trim(sector_name) AS name,
  'active' AS status,
  false AS is_demo,
  row_number() OVER (PARTITION BY c.id ORDER BY ordinality) - 1 AS display_order
FROM
  public.companies c,
  unnest(c.sectors) WITH ORDINALITY AS t(sector_name, ordinality)
WHERE
  trim(sector_name) != ''
ON CONFLICT (company_id, normalized_name) DO NOTHING;
