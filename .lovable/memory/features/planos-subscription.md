---
name: Planos & Subscription Gate (Sprint 7)
description: Tabela de planos (Free/Pro/Enterprise), SubscriptionGate HOC e flag companies.plan para gate de features
type: feature
---
Sprint 7 — Planos & Subscription Gate.

**Schema:**
- Enum `public.company_plan` ('free','pro','enterprise')
- Coluna `companies.plan` (NOT NULL, default 'free')

**Arquivos:**
- `src/pages/Planos.tsx` — Página `/planos` com 3 cards premium, ativa plano via update mock em `companies.plan`. Enterprise → mailto.
- `src/components/subscription/SubscriptionGate.tsx` — HOC que lê `getMyCompany().plan` e bloqueia children abaixo do tier; CTA → `/planos`.
- `src/App.tsx` — rota pública `/planos`.
- `src/components/layout/AppNavbar.tsx` — link "Planos & Assinatura" em SECONDARY_NAV.

**Uso:** envolver rotas Pro com `<SubscriptionGate required="pro" feature="Catálogo Oxford">...</SubscriptionGate>`.

**Próximo:** Stripe real via connector (quando o usuário pedir); por enquanto, mock-flag.
