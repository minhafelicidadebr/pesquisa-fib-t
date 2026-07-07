---
name: Mural Vivo de Signatários NR-1 (Sprint 23)
description: Marquee premium em /nr1-brasil com últimas empresas signatárias e realtime via Supabase channel
type: feature
---

Sprint 23 — Mural Vivo de Signatários no /nr1-brasil.

**Arquivo:** `src/components/nr1/LiveSignatoryWall.tsx` — marquee CSS puro (@keyframes wallScroll, 60s linear infinite, pausa no hover) com máscara linear-gradient nas bordas.

**Realtime:** subscription no channel Supabase `postgres_changes` INSERT em `nr1_manifest_signatures`. Ao entrar novo signatário: recarrega lista + destaca chip com pulse verde (`shadow-[0_0_24px_brand-green]` + badge "novo") por 4s.

**Dados:** reusa RPC `list_nr1_signatories` (limit 24) — zero backend novo. Total exibido via `total` do retorno.

**UX:** chips arredondados com escudo gold + nome + UF, cada um linka pro `/selo/:id`. Lista duplicada em memo para loop infinito sem gap. Header com CTA "Ver diretório" → `/nr1-brasil/signatarios`.

**Integração:** injetado no `NR1Brasil.tsx` entre a seção STATS e os 6 PILARES.

**Racional:** transforma o Manifesto de página institucional em prova social viva. Cada visitante vê que empresas reais estão aderindo em tempo real — dispara FOMO institucional e valida credibilidade do movimento sem custo adicional de infraestrutura.
