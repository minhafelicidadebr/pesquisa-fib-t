---
name: Ecosystem Routes (Sprint 2)
description: Five placeholder routes for the FIB ecosystem (/diagnostico, /dashboard, /academy, /intervencoes, /relatorios) using shared PlaceholderPage component
type: feature
---
Sprint 2 — Navbar premium + 5 rotas placeholder do ecossistema FIB.

**Arquivos chave:**
- `src/components/layout/AppNavbar.tsx` — Navbar global premium com menu Plataforma (5 itens) + Ecossistema (dropdown), mobile drawer, scroll-aware glass effect, AuthMenu integrado.
- `src/components/layout/PlaceholderPage.tsx` — Componente reutilizável para páginas em construção, com hero, accent color, ícone, roadmap em grid 2-col.
- `src/pages/Diagnostico.tsx` (gold) — Diagnóstico FIB-T conversacional, redireciona para /fibia.
- `src/pages/Dashboard.tsx` (cyan) — Painel pessoal/organizacional com privacy-by-design (k≥7).
- `src/pages/Academy.tsx` (gold) — Trilhas gamificadas com IFT Coin.
- `src/pages/Intervencoes.tsx` (magenta) — Catálogo de práticas baseadas em evidência Oxford.
- `src/pages/Relatorios.tsx` (cyan) — ESG (GRI/SASB), NR-1, ODS 3/8/10, WELL.

**Padrão de cores por accent:** gold/cyan/magenta/green via map em `accentMap`, sempre usando design tokens HSL.
