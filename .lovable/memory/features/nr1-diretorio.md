---
name: Diretório Nacional NR-1 (Sprint 17)
description: Página pública /nr1-brasil/signatarios com busca, filtros por UF/porte e cards clicáveis para o Selo de cada empresa signatária
type: feature
---

Sprint 17 — Diretório Nacional Público de Signatários.

**Objetivo:** completar o funil de descoberta do Manifesto NR-1. Assinar → gerar selo público → aparecer no mural pesquisável nacional.

**Backend:**
- RPC `public.list_nr1_signatories(_search, _uf, _headcount, _limit, _offset)` SECURITY DEFINER STABLE — retorna `{ total, items[], limit, offset }` com paginação (limite máximo 120, default 60). Executável por anon+authenticated. Nunca expõe e-mail nem sobrenome. Filtros: busca case-insensitive por `company_name`, UF exato (upper), porte exato.

**Frontend:**
- `src/pages/NR1Signatarios.tsx` — grid responsivo 3 col, cards com escudo dourado, hover elevado + link para `/selo/:id`. Filtros persistidos em state (search debounced 220 ms, UF, porte). Paginação client-side com 24 por página. Empty state com CTA "Assinar o Manifesto". Auto-reset de página ao mudar filtros.
- Rota pública `/nr1-brasil/signatarios` em `App.tsx`.
- `NR1Manifesto.tsx` ganhou link "Ver diretório nacional completo →" no fim do mural.

**Fluxo completo:** `/nr1-brasil` (landing) → `#manifesto` (form) → `/selo/:id` (certificado) ↔ `/nr1-brasil/signatarios` (mural pesquisável).
