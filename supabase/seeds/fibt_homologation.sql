-- ============================================================
-- SEED DE HOMOLOGAÇÃO — FIB-T ONDA 2
-- ============================================================
-- DADOS SINTÉTICOS — EXECUÇÃO MANUAL E DELIBERADA
-- Não é executado automaticamente por `supabase db reset`.
-- Executar com: psql -f supabase/seeds/fibt_homologation.sql
-- ============================================================
-- Sem credenciais reais, sem usuários reais, sem código real ISG.
-- Marcado como is_demo=true em todas as entidades.
-- Idempotente: usa ON CONFLICT ou WHERE NOT EXISTS.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- NOTA: owner_id será preenchido com um usuário sintético criado
-- pelo ambiente local (`supabase db reset` cria auth.users).
-- Para execução em staging isolado, criar previamente um usuário
-- de teste via Supabase Dashboard ou usar o UUID do primeiro
-- usuário existente. NÃO usar UUID zero.
--
-- A variável abaixo deve ser substituída antes da execução:
-- ────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_owner_id    uuid;
  v_company_id  uuid;
  v_campaign_id uuid;
  v_sector_a_id uuid;
  v_sector_b_id uuid;
  v_sector_c_id uuid;
  v_sector_d_id uuid;
  v_session_id  uuid;
  v_i           integer;
  v_answers     jsonb;
  v_score       numeric(4,1);
  v_factor_scores jsonb;
  v_domain_scores jsonb;
BEGIN

  -- ── Determinar owner_id ──
  -- Usar usuário sintético exato criado para homologação.
  -- Fail-closed: se não existir exatamente 1 match, abortar.
  SELECT id INTO v_owner_id FROM auth.users
  WHERE email = 'fibt-demo-owner@example.invalid';

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Usuário sintético fibt-demo-owner@example.invalid não encontrado em auth.users. '
      'Crie-o antes de executar este seed (via Supabase Dashboard ou supabase auth signup).';
  END IF;

  -- Garantir unicidade (fail-closed para mais de um match)
  IF (SELECT count(*) FROM auth.users WHERE email = 'fibt-demo-owner@example.invalid') > 1 THEN
    RAISE EXCEPTION 'Mais de um usuário com email fibt-demo-owner@example.invalid. Abortar.';
  END IF;

  -- ── 1. Organização ISG (demonstrativa) ──
  SELECT id INTO v_company_id
  FROM public.companies
  WHERE legal_name = 'ISG — Instituto Demonstrativo (Homologação)'
  LIMIT 1;

  IF v_company_id IS NULL THEN
    INSERT INTO public.companies (
      legal_name, invite_code, owner_id, plan, sectors, sector
    ) VALUES (
      'ISG — Instituto Demonstrativo (Homologação)',
      'FIBT-DEMO-ISG-2026',
      v_owner_id,
      'enterprise',
      ARRAY['Setor Demonstrativo A', 'Setor Demonstrativo B', 'Setor Demonstrativo C', 'Setor Demonstrativo D'],
      'Tecnologia e Inovação'
    )
    RETURNING id INTO v_company_id;
  END IF;

  -- ── 2. Setores canônicos ──
  INSERT INTO public.company_sectors (company_id, name, status, is_demo, display_order)
  VALUES
    (v_company_id, 'Setor Demonstrativo A', 'active', true, 0),
    (v_company_id, 'Setor Demonstrativo B', 'active', true, 1),
    (v_company_id, 'Setor Demonstrativo C', 'active', true, 2),
    (v_company_id, 'Setor Demonstrativo D', 'active', true, 3)
  ON CONFLICT (company_id, normalized_name) DO NOTHING;

  SELECT id INTO v_sector_a_id FROM public.company_sectors
  WHERE company_id = v_company_id AND normalized_name = 'setor demonstrativo a';
  SELECT id INTO v_sector_b_id FROM public.company_sectors
  WHERE company_id = v_company_id AND normalized_name = 'setor demonstrativo b';
  SELECT id INTO v_sector_c_id FROM public.company_sectors
  WHERE company_id = v_company_id AND normalized_name = 'setor demonstrativo c';
  SELECT id INTO v_sector_d_id FROM public.company_sectors
  WHERE company_id = v_company_id AND normalized_name = 'setor demonstrativo d';

  -- ── 3. Campanha demonstrativa ──
  SELECT id INTO v_campaign_id
  FROM public.fibt_campaigns
  WHERE company_id = v_company_id AND title = 'FIB-T ISG — Homologação 2026'
  LIMIT 1;

  IF v_campaign_id IS NULL THEN
    INSERT INTO public.fibt_campaigns (
      company_id, title, instrument_id, instrument_version,
      status, privacy_threshold, raw_retention_days, is_demo, opened_at
    ) VALUES (
      v_company_id,
      'FIB-T ISG — Homologação 2026',
      'FIB-T',
      '1.1.0',
      'open',
      7,
      180,
      true,
      now()
    )
    RETURNING id INTO v_campaign_id;
  END IF;

  -- Vincular setores à campanha
  INSERT INTO public.fibt_campaign_sectors (campaign_id, sector_id)
  VALUES
    (v_campaign_id, v_sector_a_id),
    (v_campaign_id, v_sector_b_id),
    (v_campaign_id, v_sector_c_id),
    (v_campaign_id, v_sector_d_id)
  ON CONFLICT (campaign_id, sector_id) DO NOTHING;

  -- ── 4. Respostas sintéticas ──
  -- Distribuição: A=8, B=7, C=6, D=12
  -- Resultado esperado: A visível, B visível, C suprimido (n<7), D visível

  -- Setor A: 8 respostas
  FOR v_i IN 1..8 LOOP
    v_session_id := gen_random_uuid();
    v_answers := (
      SELECT jsonb_object_agg(item_id::text, ((item_id + v_i) % 5))
      FROM generate_series(1, 32) AS item_id
    );
    v_score := round(((SELECT avg(((item_id + v_i) % 5)) FROM generate_series(1, 32) AS item_id) / 4.0 * 100)::numeric, 1);
    v_factor_scores := jsonb_build_object('padrao_vida', 2.0, 'bem_estar', 2.0, 'satisfacao', 2.0);
    v_domain_scores := jsonb_build_object(
      'padrao_vida', 2.0, 'educacao', 2.0, 'cultura', 2.0,
      'bem_estar', 2.0, 'saude', 2.0, 'uso_tempo', 2.0,
      'vitalidade', 2.0, 'meio_ambiente', 2.0, 'governanca', 2.0
    );

    INSERT INTO public.fibt_public_sessions (
      id, token_hash, company_id, campaign_id, sector_id,
      status, expires_at, submitted_at
    ) VALUES (
      v_session_id,
      encode(sha256(('seed-a-' || v_i)::bytea), 'hex'),
      v_company_id, v_campaign_id, v_sector_a_id,
      'submitted', now() + interval '7 days', now()
    ) ON CONFLICT DO NOTHING;

    INSERT INTO public.fibt_organizational_responses (
      company_id, campaign_id, sector_id, session_id,
      instrument_id, instrument_version, scoring_engine_version, manifest_hash,
      raw_answers, global_score, factor_scores, domain_scores,
      calculated_by, submitted_at
    ) VALUES (
      v_company_id, v_campaign_id, v_sector_a_id, v_session_id,
      'FIB-T', '1.1.0', '1.0.0',
      '114b70bd9b5d495657704c04546110d390c5b267c4fb31d40901bed7b7b401ed',
      v_answers, v_score, v_factor_scores, v_domain_scores,
      'server', now()
    ) ON CONFLICT (session_id) DO NOTHING;
  END LOOP;

  -- Setor B: 7 respostas
  FOR v_i IN 1..7 LOOP
    v_session_id := gen_random_uuid();
    v_answers := (
      SELECT jsonb_object_agg(item_id::text, ((item_id + v_i + 10) % 5))
      FROM generate_series(1, 32) AS item_id
    );
    v_score := round(((SELECT avg(((item_id + v_i + 10) % 5)) FROM generate_series(1, 32) AS item_id) / 4.0 * 100)::numeric, 1);
    v_factor_scores := jsonb_build_object('padrao_vida', 2.1, 'bem_estar', 2.1, 'satisfacao', 2.1);
    v_domain_scores := jsonb_build_object(
      'padrao_vida', 2.1, 'educacao', 2.1, 'cultura', 2.1,
      'bem_estar', 2.1, 'saude', 2.1, 'uso_tempo', 2.1,
      'vitalidade', 2.1, 'meio_ambiente', 2.1, 'governanca', 2.1
    );

    INSERT INTO public.fibt_public_sessions (
      id, token_hash, company_id, campaign_id, sector_id,
      status, expires_at, submitted_at
    ) VALUES (
      v_session_id,
      encode(sha256(('seed-b-' || v_i)::bytea), 'hex'),
      v_company_id, v_campaign_id, v_sector_b_id,
      'submitted', now() + interval '7 days', now()
    ) ON CONFLICT DO NOTHING;

    INSERT INTO public.fibt_organizational_responses (
      company_id, campaign_id, sector_id, session_id,
      instrument_id, instrument_version, scoring_engine_version, manifest_hash,
      raw_answers, global_score, factor_scores, domain_scores,
      calculated_by, submitted_at
    ) VALUES (
      v_company_id, v_campaign_id, v_sector_b_id, v_session_id,
      'FIB-T', '1.1.0', '1.0.0',
      '114b70bd9b5d495657704c04546110d390c5b267c4fb31d40901bed7b7b401ed',
      v_answers, v_score, v_factor_scores, v_domain_scores,
      'server', now()
    ) ON CONFLICT (session_id) DO NOTHING;
  END LOOP;

  -- Setor C: 6 respostas (DEVE SER SUPRIMIDO)
  FOR v_i IN 1..6 LOOP
    v_session_id := gen_random_uuid();
    v_answers := (
      SELECT jsonb_object_agg(item_id::text, ((item_id + v_i + 20) % 5))
      FROM generate_series(1, 32) AS item_id
    );
    v_score := round(((SELECT avg(((item_id + v_i + 20) % 5)) FROM generate_series(1, 32) AS item_id) / 4.0 * 100)::numeric, 1);
    v_factor_scores := jsonb_build_object('padrao_vida', 1.9, 'bem_estar', 1.9, 'satisfacao', 1.9);
    v_domain_scores := jsonb_build_object(
      'padrao_vida', 1.9, 'educacao', 1.9, 'cultura', 1.9,
      'bem_estar', 1.9, 'saude', 1.9, 'uso_tempo', 1.9,
      'vitalidade', 1.9, 'meio_ambiente', 1.9, 'governanca', 1.9
    );

    INSERT INTO public.fibt_public_sessions (
      id, token_hash, company_id, campaign_id, sector_id,
      status, expires_at, submitted_at
    ) VALUES (
      v_session_id,
      encode(sha256(('seed-c-' || v_i)::bytea), 'hex'),
      v_company_id, v_campaign_id, v_sector_c_id,
      'submitted', now() + interval '7 days', now()
    ) ON CONFLICT DO NOTHING;

    INSERT INTO public.fibt_organizational_responses (
      company_id, campaign_id, sector_id, session_id,
      instrument_id, instrument_version, scoring_engine_version, manifest_hash,
      raw_answers, global_score, factor_scores, domain_scores,
      calculated_by, submitted_at
    ) VALUES (
      v_company_id, v_campaign_id, v_sector_c_id, v_session_id,
      'FIB-T', '1.1.0', '1.0.0',
      '114b70bd9b5d495657704c04546110d390c5b267c4fb31d40901bed7b7b401ed',
      v_answers, v_score, v_factor_scores, v_domain_scores,
      'server', now()
    ) ON CONFLICT (session_id) DO NOTHING;
  END LOOP;

  -- Setor D: 12 respostas
  FOR v_i IN 1..12 LOOP
    v_session_id := gen_random_uuid();
    v_answers := (
      SELECT jsonb_object_agg(item_id::text, ((item_id + v_i + 5) % 5))
      FROM generate_series(1, 32) AS item_id
    );
    v_score := round(((SELECT avg(((item_id + v_i + 5) % 5)) FROM generate_series(1, 32) AS item_id) / 4.0 * 100)::numeric, 1);
    v_factor_scores := jsonb_build_object('padrao_vida', 2.2, 'bem_estar', 2.2, 'satisfacao', 2.2);
    v_domain_scores := jsonb_build_object(
      'padrao_vida', 2.2, 'educacao', 2.2, 'cultura', 2.2,
      'bem_estar', 2.2, 'saude', 2.2, 'uso_tempo', 2.2,
      'vitalidade', 2.2, 'meio_ambiente', 2.2, 'governanca', 2.2
    );

    INSERT INTO public.fibt_public_sessions (
      id, token_hash, company_id, campaign_id, sector_id,
      status, expires_at, submitted_at
    ) VALUES (
      v_session_id,
      encode(sha256(('seed-d-' || v_i)::bytea), 'hex'),
      v_company_id, v_campaign_id, v_sector_d_id,
      'submitted', now() + interval '7 days', now()
    ) ON CONFLICT DO NOTHING;

    INSERT INTO public.fibt_organizational_responses (
      company_id, campaign_id, sector_id, session_id,
      instrument_id, instrument_version, scoring_engine_version, manifest_hash,
      raw_answers, global_score, factor_scores, domain_scores,
      calculated_by, submitted_at
    ) VALUES (
      v_company_id, v_campaign_id, v_sector_d_id, v_session_id,
      'FIB-T', '1.1.0', '1.0.0',
      '114b70bd9b5d495657704c04546110d390c5b267c4fb31d40901bed7b7b401ed',
      v_answers, v_score, v_factor_scores, v_domain_scores,
      'server', now()
    ) ON CONFLICT (session_id) DO NOTHING;
  END LOOP;

  RAISE NOTICE 'Seed FIB-T ISG homologação concluído: empresa=%, campanha=%, setores A/B/C/D = 8/7/6/12',
    v_company_id, v_campaign_id;
END;
$$;
