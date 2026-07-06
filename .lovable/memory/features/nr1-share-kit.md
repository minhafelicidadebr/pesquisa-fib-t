---
name: Kit de Compartilhamento Social do Selo NR-1 (Sprint 21)
description: Modal "Post pronto" no /selo/:id com textos editáveis LinkedIn/WhatsApp, hashtags oficiais e card social 1200x630 gerado client-side via SVG→PNG
type: feature
---

Sprint 21 — Kit de Compartilhamento Premium do Selo NR-1.

**Componente:** `src/components/nr1/SocialShareKit.tsx`
- Modal com tabs LinkedIn / WhatsApp; textarea editável pré-preenchida com post autoral em 1ª pessoa citando a empresa signatária, o selo verificável e as hashtags oficiais do movimento (`#ManifestoNR1 #NR1Brasil #SaúdeMentalNoTrabalho ...`).
- Ações: copiar post, abrir LinkedIn composer (`?shareActive=true&shareUrl=`) com texto já copiado, abrir WhatsApp (`wa.me/?text=`), copiar hashtags separadamente, baixar card social PNG.

**Card social (1200×630):**
- Gerado client-side em runtime via SVG string → Blob → Image → Canvas → PNG. Zero backend, zero dependência nova.
- Layout premium: gradient charcoal + glows gold/magenta, badge escudo, nome da empresa em Fraunces 72pt (2 linhas se necessário), linha "Norma Regulamentadora nº 1 · Riscos Psicossociais", metadados (signatário, UF), selo nº e assinatura IFT.
- Ideal para preview OG do LinkedIn/Twitter quando o texto do post não inclui o preview automático.

**Integração:** `SeloNR1.tsx` ganhou botão primary "Post pronto" (destaque gold) na grid de ações; abre o modal. Renomeado ícone do embed para `Copy` para liberar `Sparkles` como identidade visual do kit.

**Racional viral:** cada assinatura vira 1 potencial post orgânico. O atrito reduz de "escrever um post" para "ajustar 3 palavras e clicar copiar" — multiplica o coeficiente de propagação do Manifesto.
