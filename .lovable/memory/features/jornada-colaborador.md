---
name: Jornada do Colaborador
description: Sprint 6 — /jornada timeline com 6 etapas, IFT Coin, progresso real (perfil, empresa, FIB-T, NR-1, Academy, Intervenções)
type: feature
---

Rota `/jornada` (protegida). Timeline vertical de 6 etapas em primeira pessoa:
1. **Quem sou eu** — `profiles.full_name` + `segment` ≠ `nao_informado` (10 IFT)
2. **Onde eu pertenço** — `getMyCompany()` retorna empresa (15 IFT)
3. **Como eu floresço** — `fib_assessments` ≥ 1 (40 IFT)
4. **Como meu trabalho me afeta** — `nr1_assessments` ≥ 1 (40 IFT)
5. **Como eu evoluo** — Academy (placeholder, 25 IFT)
6. **Como eu transformo** — Intervenções (placeholder, 30 IFT)

Cada etapa = `done | current | locked`. Primeira não-done vira `current`, demais ficam `locked` (CTA escondido).

Stat strip: Progresso %, IFT Coin acumulado, último FIB-T. Sequência semanal (placeholder = 1).
Sem ranking público — alinhado a `mem://features/gamification-principles`.

Arquivos: `src/pages/Jornada.tsx`, rota em `src/App.tsx`, link "Minha Jornada" em `AppNavbar` (SECONDARY_NAV).
