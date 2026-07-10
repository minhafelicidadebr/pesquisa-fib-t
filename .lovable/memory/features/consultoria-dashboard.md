---
name: Dashboard Executivo Multi-Empresa (Sprint 26)
description: Rota /consultoria — painel consolidado para consultorias/holdings verem várias empresas NR-1 num só lugar
type: feature
---

Sprint 26 — Dashboard Executivo Multi-Empresa.

**Rota:** `/consultoria` (ProtectedRoute). Consolida todas as empresas onde o usuário é `owner` ou `company_member`.

**Arquivos:**
- `src/lib/consultoria.ts` — `getConsultingPortfolio()` agrega companies + members + nr1_assessments (via `company_id` direto ou fallback `user_id → company_members`). Calcula: score médio/atual/risco, top-3 subescalas vermelhas recorrentes, trend das últimas 12 avaliações.
- `src/pages/ConsultoriaDashboard.tsx` — layout 1/3 (ranking clicável) + 2/3 (detalhe): header, evolução (LineChart), focos vermelhos (BarChart horizontal), card recomendação contextual (varia por risco).
- KPI strip: Empresas, Colaboradores, Diagnósticos, Score médio, Alertas vermelhos.

**Data flow:**
- `saveNR1()` agora anexa `company_id` (owner primeiro, senão primeira empresa em `company_members`) — historicamente as linhas ficaram com company_id NULL, então o fallback via user_id garante retrocompatibilidade.

**Empty state:** CTA duplo → cadastrar empresa (`/empresa/configurar`) ou entrar por convite (`/onboarding`).

**Racional:** consultorias SST e holdings ganham visão macro sem trocar de contexto. Cada card é clicável e revela evolução + focos recorrentes para priorização do PGR.
