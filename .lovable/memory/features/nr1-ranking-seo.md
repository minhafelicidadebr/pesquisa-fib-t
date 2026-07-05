---
name: Ranking Nacional NR-1 + SEO do Selo (Sprint 18)
description: Widget de ranking Top 10 UFs no diretório /nr1-brasil/signatarios e metadados dinâmicos (title/OG/Twitter) no /selo/:id para preview rico em compartilhamento
type: feature
---

Sprint 18 — Amplificação viral do Movimento NR-1.

**Ranking por UF (diretório):**
- Widget premium no topo de `/nr1-brasil/signatarios`: Top 10 estados com barras proporcionais (gradient gold→magenta), counter total de empresas.
- Cada UF é um botão que filtra o diretório em 1 clique (toggle: clicar de novo limpa). Estado ativo destacado com borda gold.
- Alimentado pela RPC `nr1_manifest_stats()` (já existente, aggregates por UF com `group by state_uf`). Zero backend novo.

**SEO dinâmico do Selo:**
- `src/pages/SeloNR1.tsx` injeta em runtime: `<title>` = "{Empresa} · Selo NR-1 Brasil", `meta[name=description]`, `og:title/description/type`, `twitter:card/title/description`.
- Isso não gera OG image (SPA sem SSR não pode), mas garante preview textual rico em WhatsApp/LinkedIn/Slack quando o link do selo é colado.
- Título do diretório também dedicado para SEO orgânico.

**Arquivos:** `src/pages/NR1Signatarios.tsx`, `src/pages/SeloNR1.tsx`.
