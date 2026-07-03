---
name: Manifesto NR-1 Brasil (Sprint 15)
description: Movimento nacional público de assinatura NR-1 na landing /nr1-brasil (tabela nr1_manifest_signatures + RPCs sign_nr1_manifest e nr1_manifest_stats)
type: feature
---

Sprint 15 — Movimento Nacional NR-1 Brasil.

**Objetivo:** converter tráfego da landing `/nr1-brasil` em compromisso público (SST/RH/CEOs assinam o Manifesto). Cria efeito rede + base de leads qualificada para NR-1.

**Backend:**
- Tabela `public.nr1_manifest_signatures` (full_name, role, company_name, email, state_uf, headcount_range, commitment_level, user_agent_hash). RLS ligada, **sem policies** e sem grants para anon/authenticated — linhas cruas são privadas.
- RPC `sign_nr1_manifest(...)` SECURITY DEFINER: valida e-mail, faz dedupe por (email, company_name), retorna `{ ok, duplicate, id }`. Executável por anon+authenticated.
- RPC `nr1_manifest_stats()` SECURITY DEFINER STABLE: retorna `{ total, companies, states[], recent[] }`. Nomes de empresa mascarados (`ABC*****`), apenas primeiro nome. Zero PII exposta.

**Frontend:**
- `src/components/nr1/NR1Manifesto.tsx` — formulário premium (glass + gold/magenta) + counter ao vivo + mural mascarado + estados aderentes. Hash SHA-256 do user-agent (privacy-friendly).
- Injetado em `src/pages/NR1Brasil.tsx` entre a seção do Selo e o CTA final, ancorado em `#manifesto`.

**Privacy-by-design:** e-mail e razão social completa nunca vazam via API pública; agregados só por UF; nomes mascarados após 3 caracteres.
