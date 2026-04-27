---
name: Landing Premium SaaS (Sprint 3)
description: Premium SaaS landing page architecture with neuromarketing hero, 4 axes journey, social proof, science authority, ROI calculator, final CTA
type: feature
---
Landing reorganizada em arquitetura SaaS premium. Componentes:

**Seções (ordem):**
1. **Hero neuromarketing** (`Index.tsx`) — Trust pill, halo icon, headline com promessa+prova+futuro, dois CTAs (FIBia gratuito + segmentos), 4 impact counters.
2. **4 Eixos** (`FourAxesSection.tsx`) — Mensurar/Educar/Transformar/Evoluir como cards clicáveis para /diagnostico, /academy, /intervencoes, /dashboard.
3. **Prova Social** (`SocialProofSection.tsx`) — Trust strip + 3 depoimentos representativos por segmento (anonimizados LGPD).
4. **Segmentos** — Cards de apresentações setor público/privado/sociedade civil.
5. **Crisis Dashboard** — Reutilizado.
6. **Impact Calculator** — Reutilizado.
7. **Ciência** (`ScienceSection.tsx`) — Oxford WWP 2.0, COPSOQ III, PERMA+V, VIA com link para /evidencias.
8. **Knowledge Section** — Reutilizado.
9. **Final CTA** (`FinalCTASection.tsx`) — Headline forte + 2 CTAs (FIBia + agendar) + trust signals.

**Princípios aplicados:**
- Neuromarketing: prova primeiro (+110k FIB), promessa clara, fricção mínima.
- Hierarquia visual: hero → ROI → ciência → conversão.
- Microcopy: tempo (12 min, 24h, 90 dias), garantias (LGPD, sem cartão, 24h).
- Preservação total dos componentes premium existentes (CrisisDashboard, ImpactCalculator, KnowledgeSection).
