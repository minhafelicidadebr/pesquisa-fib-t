---
name: Widget Contador Nacional NR-1 (Sprint 25)
description: Rota /nr1-brasil/contador/embed — iframe-friendly com total de signatários ao vivo, para parceiros embedarem
type: feature
---

Sprint 25 — Widget Embed do Contador Nacional NR-1.

**Rota:** `/nr1-brasil/contador/embed` — página iframe-friendly com background transparente, sem AppNavbar, sem InstitutionalFooter. Renderiza como um card compacto (380×110px) com escudo gold, contador tabular gigante, badge "movimento ao vivo" (pulse verde) e link para `/nr1-brasil`.

**Arquivo:** `src/pages/NR1Contador.tsx` — usa estilos inline (não Tailwind) para funcionar em iframes sem herdar CSS do host. Fontes: Fraunces (número) + Manrope (labels).

**Auto-refresh:** consulta `nr1_manifest_stats` RPC ao montar + a cada 30s via `setInterval`. Zero backend novo.

**Uso pelo signatário/parceiro:** seção "Embed do Contador Nacional" na `/nr1-brasil` (após NR1Manifesto) exibe preview real via iframe + botão "Copiar código iframe" que gera:
```html
<iframe src="…/nr1-brasil/contador/embed" width="400" height="110" style="border:0;background:transparent;overflow:hidden" loading="lazy" scrolling="no"></iframe>
```

**Racional:** transforma o movimento em prova social distribuível. Imprensa, governo, sindicatos e parceiros podem embedar o contador em suas páginas — cada embed é um vetor viral que traz visitantes ao Manifesto sem custo de mídia.
