---
name: Cartograma Brasil NR-1 (Sprint 24)
description: Mapa cartograma 7×9 das 27 UFs em /nr1-brasil/signatarios com heatmap gold→magenta e filtro click-to-select
type: feature
---

Sprint 24 — Cartograma Nacional NR-1.

**Arquivo:** `src/components/nr1/BrazilCartogram.tsx` — grid CSS 7×9 com 27 UFs posicionadas em layout geográfico aproximado do Brasil. Zero SVG de mapa, zero dependência de biblioteca geo — tiles arredondados puros.

**Visualização:** intensidade do gradient `brand-gold → brand-magenta` cresce com densidade de signatários (0.15 base → 0.7 no máximo). Glow proporcional via `box-shadow`. UFs sem adesão ficam opacas e desabilitadas.

**Interação:** click no tile ativa/desativa filtro por UF (integrado ao `setUf` do diretório). Selecionado ganha ring gold, scale-110 e z-index elevado. Legenda com barra de gradiente inferior.

**Dados:** reusa `nr1_manifest_stats` (RPC existente). Zero backend novo.

**Integração:** injetado em `NR1Signatarios.tsx` acima do ranking Top 10 UFs — os dois widgets são complementares (mapa = visão geográfica, ranking = visão comparativa por magnitude).

**Racional:** transforma dado tabular ("SP: 42, RJ: 18…") em prova visual imediata da expansão nacional do Movimento NR-1. Reforça engajamento regional (visitante identifica seu estado no mapa) e cria FOMO territorial (estados vazios convidam à liderança regional).
