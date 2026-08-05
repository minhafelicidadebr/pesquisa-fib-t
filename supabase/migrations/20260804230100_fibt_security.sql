-- ============================================================
-- ONDA 2 — MIGRATION B: Segurança e operações
-- Funções, RLS, grants, autorização, submissão, agregação, purga
-- ============================================================
-- NÃO APLICAR EM PRODUÇÃO SEM AUTORIZAÇÃO FORMAL.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Função de autorização: can_manage_fibt
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.can_manage_fibt(
  _company_id uuid,
  _user_id uuid
) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    -- É owner da empresa
    SELECT 1 FROM public.companies
    WHERE id = _company_id AND owner_id = _user_id
  ) OR EXISTS (
    -- É gestor (administrador operacional) da empresa
    SELECT 1 FROM public.company_members
    WHERE company_id = _company_id
      AND user_id = _user_id
      AND role = 'gestor'
  );
$$;

COMMENT ON FUNCTION public.can_manage_fibt IS
  'Verifica se o usuário pode administrar o FIB-T da empresa (owner ou gestor).';

-- ────────────────────────────────────────────────────────────
-- 2. RPC de submissão privada (service_role only)
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.submit_fibt_organizational_response(
  _session_id             uuid,
  _token_hash             text,
  _instrument_version     text,
  _scoring_engine_version text,
  _manifest_hash          text,
  _raw_answers            jsonb,
  _global_score           numeric(4,1),
  _factor_scores          jsonb,
  _domain_scores          jsonb,
  _idempotency_key_hash   text DEFAULT NULL,
  _request_payload_hash   text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_session     public.fibt_public_sessions%ROWTYPE;
  v_campaign    public.fibt_campaigns%ROWTYPE;
  v_response_id uuid;
  v_purge_after timestamptz;
  v_existing    public.fibt_organizational_responses%ROWTYPE;
BEGIN
  -- ── 1. Validar sessão ──
  SELECT * INTO v_session
  FROM public.fibt_public_sessions
  WHERE id = _session_id AND token_hash = _token_hash
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'session_not_found');
  END IF;

  -- Verificar se já existe resposta para esta sessão (retry idempotente)
  SELECT * INTO v_existing
  FROM public.fibt_organizational_responses
  WHERE session_id = _session_id;

  IF FOUND THEN
    -- Retry legítimo: mesma idempotency_key_hash E mesmo payload_hash
    IF _idempotency_key_hash IS NOT NULL
       AND v_existing.idempotency_key_hash = _idempotency_key_hash
       AND v_existing.request_payload_hash = _request_payload_hash THEN
      RETURN jsonb_build_object('ok', true, 'idempotent', true, 'response_id', v_existing.id, 'error', null);
    END IF;
    -- Replay com payload diferente: conflito
    RETURN jsonb_build_object('ok', false, 'error', 'replay_conflict');
  END IF;

  -- Sessão expirada
  IF v_session.status = 'expired' OR v_session.expires_at < now() THEN
    UPDATE public.fibt_public_sessions
    SET status = 'expired'
    WHERE id = _session_id AND status != 'expired';
    RETURN jsonb_build_object('ok', false, 'error', 'session_expired');
  END IF;

  -- Sessão revogada
  IF v_session.status = 'revoked' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'session_revoked');
  END IF;

  -- Sessão já marcada submitted mas sem resposta (estado inconsistente)
  IF v_session.status = 'submitted' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'session_already_submitted');
  END IF;

  -- ── 2. Validar campanha ──
  SELECT * INTO v_campaign
  FROM public.fibt_campaigns
  WHERE id = v_session.campaign_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'campaign_not_found');
  END IF;

  IF v_campaign.status != 'open' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'campaign_not_open');
  END IF;

  -- ── 3. Validar empresa coerente ──
  IF v_campaign.company_id != v_session.company_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'company_mismatch');
  END IF;

  -- ── 3b. Validar setor pertence à empresa e está habilitado na campanha ──
  IF NOT EXISTS (
    SELECT 1 FROM public.company_sectors
    WHERE id = v_session.sector_id
      AND company_id = v_session.company_id
      AND status = 'active'
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'sector_invalid');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.fibt_campaign_sectors
    WHERE campaign_id = v_session.campaign_id
      AND sector_id = v_session.sector_id
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'sector_not_in_campaign');
  END IF;

  -- ── 4. Validar instrument_version ──
  IF _instrument_version != v_campaign.instrument_version THEN
    RETURN jsonb_build_object('ok', false, 'error', 'instrument_version_mismatch');
  END IF;

  -- ── 5. Validar manifest_hash ──
  IF _manifest_hash != '114b70bd9b5d495657704c04546110d390c5b267c4fb31d40901bed7b7b401ed' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'manifest_hash_mismatch');
  END IF;

  -- ── 6. raw_purge_after: NULL enquanto campanha aberta, calculado ao fechar ──
  -- A retenção conta a partir de closed_at, não de submitted_at.
  v_purge_after := NULL;

  -- ── 7. Inserir resposta ──
  INSERT INTO public.fibt_organizational_responses (
    company_id,
    campaign_id,
    sector_id,
    session_id,
    instrument_id,
    instrument_version,
    scoring_engine_version,
    manifest_hash,
    idempotency_key_hash,
    request_payload_hash,
    raw_answers,
    global_score,
    factor_scores,
    domain_scores,
    calculated_by,
    raw_purge_after,
    submitted_at
  ) VALUES (
    v_session.company_id,
    v_session.campaign_id,
    v_session.sector_id,
    _session_id,
    'FIB-T',
    _instrument_version,
    _scoring_engine_version,
    _manifest_hash,
    _idempotency_key_hash,
    _request_payload_hash,
    _raw_answers,
    _global_score,
    _factor_scores,
    _domain_scores,
    'server',
    v_purge_after,
    now()
  )
  RETURNING id INTO v_response_id;

  -- ── 8. Concluir sessão atomicamente ──
  UPDATE public.fibt_public_sessions
  SET status = 'submitted', submitted_at = now()
  WHERE id = _session_id;

  RETURN jsonb_build_object('ok', true, 'response_id', v_response_id, 'error', null);
END;
$$;

COMMENT ON FUNCTION public.submit_fibt_organizational_response IS
  'Submissão transacional FIB-T. Service_role only. Valida sessão, campanha, versão, hash. '
  'Idempotente por session_id UNIQUE. Impede replay.';

-- ────────────────────────────────────────────────────────────
-- 3. RPC de agregação com k-anonimato
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_fibt_organization_dashboard(
  _campaign_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_campaign    public.fibt_campaigns%ROWTYPE;
  v_user_id     uuid;
  v_k_min       integer;
  v_result      jsonb := '[]'::jsonb;
  v_sector      record;
  v_total_n     integer := 0;
BEGIN
  -- Identidade do chamador
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- Buscar campanha
  SELECT * INTO v_campaign
  FROM public.fibt_campaigns
  WHERE id = _campaign_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'campaign_not_found';
  END IF;

  -- Autorização: owner ou gestor da empresa
  IF NOT public.can_manage_fibt(v_campaign.company_id, v_user_id) THEN
    RAISE EXCEPTION 'access_denied';
  END IF;

  v_k_min := v_campaign.privacy_threshold;

  -- Agregar por setor
  FOR v_sector IN
    SELECT
      cs.id AS sector_id,
      cs.name AS sector_name,
      count(r.id) AS n,
      CASE WHEN count(r.id) >= v_k_min THEN
        round(avg(r.global_score), 1)
      END AS avg_global_score,
      CASE WHEN count(r.id) >= v_k_min THEN
        jsonb_build_object(
          'padrao_vida', round(avg((r.factor_scores->>'padrao_vida')::numeric), 2),
          'bem_estar', round(avg((r.factor_scores->>'bem_estar')::numeric), 2),
          'satisfacao', round(avg((r.factor_scores->>'satisfacao')::numeric), 2)
        )
      END AS avg_factor_scores,
      CASE WHEN count(r.id) >= v_k_min THEN
        (SELECT jsonb_object_agg(
          d.key,
          round(avg_val, 2)
        )
        FROM (
          SELECT key, avg(value::numeric) AS avg_val
          FROM public.fibt_organizational_responses r2,
               jsonb_each_text(r2.domain_scores) AS kv(key, value)
          WHERE r2.campaign_id = _campaign_id
            AND r2.sector_id = cs.id
          GROUP BY key
        ) d)
      END AS avg_domain_scores
    FROM public.company_sectors cs
    LEFT JOIN public.fibt_organizational_responses r
      ON r.sector_id = cs.id AND r.campaign_id = _campaign_id
    WHERE cs.company_id = v_campaign.company_id
      AND cs.status = 'active'
    GROUP BY cs.id, cs.name, cs.display_order
    ORDER BY cs.display_order, cs.name
  LOOP
    v_total_n := v_total_n + v_sector.n;

    IF v_sector.n >= v_k_min THEN
      v_result := v_result || jsonb_build_object(
        'sector_id', v_sector.sector_id,
        'sector_name', v_sector.sector_name,
        'visible', true,
        'response_count', v_sector.n,
        'global_score_avg', v_sector.avg_global_score,
        'factor_scores_avg', v_sector.avg_factor_scores,
        'domain_scores_avg', v_sector.avg_domain_scores
      );
    ELSE
      v_result := v_result || jsonb_build_object(
        'sector_id', v_sector.sector_id,
        'sector_name', v_sector.sector_name,
        'visible', false,
        'response_count', null,
        'response_count_label', '<7',
        'factor_scores', null,
        'domain_scores', null,
        'distributions', null,
        'suppression_reason', 'privacy_threshold'
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'campaign_id', _campaign_id,
    'company_id', v_campaign.company_id,
    'campaign_title', v_campaign.title,
    'privacy_threshold', v_k_min,
    'total_responses', CASE WHEN v_total_n >= v_k_min THEN v_total_n ELSE null END,
    'sectors', v_result
  );
END;
$$;

COMMENT ON FUNCTION public.get_fibt_organization_dashboard IS
  'Dashboard FIB-T organizacional com k-anonimato. Retorna agregados por setor. '
  'Suprime setores com n < privacy_threshold. Nunca retorna microdados.';

-- ────────────────────────────────────────────────────────────
-- 4. Função de purga de raw_answers
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.purge_fibt_raw_answers()
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.fibt_organizational_responses
  SET raw_answers = NULL
  WHERE raw_answers IS NOT NULL
    AND raw_purge_after IS NOT NULL
    AND raw_purge_after <= now();

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'purged_count', v_count,
    'executed_at', now()
  );
END;
$$;

COMMENT ON FUNCTION public.purge_fibt_raw_answers IS
  'Nulifica raw_answers vencidos (raw_purge_after <= now()). Preserva scores e manifesto. '
  'Idempotente. Executável apenas por service_role. NÃO registra conteúdo eliminado.';

-- ────────────────────────────────────────────────────────────
-- 5. RLS — Bloqueio total para tabelas sensíveis
-- ────────────────────────────────────────────────────────────

-- company_sectors: leitura para membros da empresa
ALTER TABLE public.company_sectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_sectors_select_member" ON public.company_sectors
  FOR SELECT
  TO authenticated
  USING (
    public.is_company_member(company_id, auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid()
    )
  );

-- fibt_campaigns: leitura para membros da empresa
ALTER TABLE public.fibt_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fibt_campaigns_select_member" ON public.fibt_campaigns
  FOR SELECT
  TO authenticated
  USING (
    public.is_company_member(company_id, auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid()
    )
  );

-- fibt_campaign_sectors: leitura herdada via campaigns
ALTER TABLE public.fibt_campaign_sectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fibt_campaign_sectors_select" ON public.fibt_campaign_sectors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.fibt_campaigns c
      WHERE c.id = campaign_id
        AND (
          public.is_company_member(c.company_id, auth.uid())
          OR EXISTS (SELECT 1 FROM public.companies WHERE id = c.company_id AND owner_id = auth.uid())
        )
    )
  );

-- fibt_public_sessions: bloqueio total para anon e authenticated
-- Acesso SOMENTE via service_role (Edge Functions)
ALTER TABLE public.fibt_public_sessions ENABLE ROW LEVEL SECURITY;
-- Nenhuma policy = nenhum acesso direto para authenticated/anon

-- fibt_organizational_responses: bloqueio total
-- Acesso SOMENTE via service_role (INSERT) e RPC agregadora (leitura interna SECURITY DEFINER)
ALTER TABLE public.fibt_organizational_responses ENABLE ROW LEVEL SECURITY;
-- Nenhuma policy = nenhum acesso direto

-- ────────────────────────────────────────────────────────────
-- 6. GRANTS — princípio do menor privilégio
-- ────────────────────────────────────────────────────────────

-- Revogar padrões perigosos
REVOKE ALL ON public.fibt_public_sessions FROM anon, authenticated;
REVOKE ALL ON public.fibt_organizational_responses FROM anon, authenticated;

-- company_sectors: SELECT para authenticated (RLS filtra)
GRANT SELECT ON public.company_sectors TO authenticated;

-- fibt_campaigns: SELECT para authenticated (RLS filtra)
GRANT SELECT ON public.fibt_campaigns TO authenticated;

-- fibt_campaign_sectors: SELECT para authenticated (RLS filtra)
GRANT SELECT ON public.fibt_campaign_sectors TO authenticated;

-- Funções: revogar de anon/authenticated, depois conceder seletivamente
REVOKE ALL ON FUNCTION public.submit_fibt_organizational_response(uuid,text,text,text,text,jsonb,numeric,jsonb,jsonb,text,text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.purge_fibt_raw_answers() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_fibt_organizational_response(uuid,text,text,text,text,jsonb,numeric,jsonb,jsonb,text,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.purge_fibt_raw_answers() TO service_role;

-- get_fibt_organization_dashboard: apenas authenticated (guard interno via auth.uid())
GRANT EXECUTE ON FUNCTION public.get_fibt_organization_dashboard TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_fibt_organization_dashboard FROM anon;

-- can_manage_fibt: apenas authenticated
GRANT EXECUTE ON FUNCTION public.can_manage_fibt TO authenticated;
REVOKE EXECUTE ON FUNCTION public.can_manage_fibt FROM anon;


-- ────────────────────────────────────────────────────────────
-- 7. Função de fechamento de campanha (calcula raw_purge_after)
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.close_fibt_campaign(
  _campaign_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_campaign  public.fibt_campaigns%ROWTYPE;
  v_user_id   uuid;
  v_updated   integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT * INTO v_campaign
  FROM public.fibt_campaigns
  WHERE id = _campaign_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'campaign_not_found');
  END IF;

  IF NOT public.can_manage_fibt(v_campaign.company_id, v_user_id) THEN
    RAISE EXCEPTION 'access_denied';
  END IF;

  IF v_campaign.status != 'open' AND v_campaign.status != 'paused' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'campaign_not_closeable');
  END IF;

  -- Fechar campanha
  UPDATE public.fibt_campaigns
  SET status = 'closed', closed_at = now(), updated_at = now()
  WHERE id = _campaign_id;

  -- Calcular raw_purge_after para todas as respostas desta campanha
  UPDATE public.fibt_organizational_responses
  SET raw_purge_after = now() + (v_campaign.raw_retention_days || ' days')::interval
  WHERE campaign_id = _campaign_id
    AND raw_purge_after IS NULL;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  -- Expirar sessões abertas
  UPDATE public.fibt_public_sessions
  SET status = 'expired'
  WHERE campaign_id = _campaign_id
    AND status IN ('issued', 'active');

  RETURN jsonb_build_object(
    'ok', true,
    'closed_at', now(),
    'responses_with_purge_set', v_updated
  );
END;
$$;

COMMENT ON FUNCTION public.close_fibt_campaign IS
  'Fecha uma campanha FIB-T e calcula raw_purge_after (closed_at + retention_days). '
  'Expira sessões abertas. Executável apenas por owner/gestor da empresa.';

-- Grants para close_fibt_campaign
GRANT EXECUTE ON FUNCTION public.close_fibt_campaign TO authenticated;
REVOKE EXECUTE ON FUNCTION public.close_fibt_campaign FROM anon;
