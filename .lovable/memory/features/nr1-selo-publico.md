---
name: Selo Público NR-1 Verificável (Sprint 16)
description: Página pública /selo/:id que exibe o Selo NR-1 verificável de uma empresa signatária, com QR, share LinkedIn/WhatsApp e código embed
type: feature
---

Sprint 16 — Selo Público Verificável do Manifesto NR-1.

**Objetivo:** amplificar o efeito rede do Manifesto (Sprint 15). Cada assinatura gera um selo público verificável em `/selo/:id`, compartilhável no LinkedIn, WhatsApp e embutível no site institucional.

**Backend:**
- RPC `public.get_nr1_seal(_id uuid)` SECURITY DEFINER STABLE, executável por anon+authenticated. Retorna JSON com `id`, `first_name` (split_part), `role`, `company_name`, `state_uf`, `headcount_range`, `created_at`. **Nunca expõe o e-mail.**
- Reaproveita o `id` já retornado pelo RPC `sign_nr1_manifest`.

**Frontend:**
- `src/pages/SeloNR1.tsx` — layout premium (certificado gradient charcoal→gold→magenta) com QR code (lib `qrcode`, EC High, 512px), share nativo (Web Share API), LinkedIn share, copy link, copy embed HTML (badge dourado), download PNG do QR. Fallback elegante para selo inexistente.
- `NR1Manifesto.tsx` atualizado: captura `id` do RPC e a tela de sucesso agora oferece CTA "Ver meu Selo Público" (primary gold) + "Ativar diagnóstico COPSOQ II" (secondary).
- Rota `/selo/:id` pública em `App.tsx`.

**Privacy-by-design:** apenas primeiro nome + razão social (o signatário aceitou tornar público ao assinar) + UF + faixa de porte. E-mail e nome completo permanecem privados no banco.

**Viralidade:** embed code copia HTML pronto para colar em rodapé/página institucional (link dourado com escudo). LinkedIn share usa `sharing/share-offsite` — sem dependência de app.
