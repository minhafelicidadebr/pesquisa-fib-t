# FIB · COP · NR-1 — Roadmap Operacional (v4.8)

> **Inspiração arquitetural:** `plataforma-nr1` — ecossistema por **verbos de ação**, multi-tenant SaaS, gate de assinatura, jornada do colaborador desacoplada do dashboard executivo.
> **Diferencial nosso:** Ciência da Felicidade (FIB-T + PERMA+V + VIA) + COPSOQ II + Oxford Wellbeing Playbook 2.0, narrados em 1ª pessoa.

---

## 🌳 Tree of Thoughts — 4 Ramos Estratégicos

```text
                     ECOSSISTEMA FIB·NR-1
                            │
        ┌───────────┬───────┴───────┬───────────┐
        ▼           ▼               ▼           ▼
    MENSURAR    TRANSFORMAR     EDUCAR      GOVERNAR
   (escutar)    (agir)          (evoluir)   (decidir)
        │           │               │           │
   COPSOQ II   Intervenções    Academy IFT  Matriz NR-1
   FIB-T       (ILI score)     Trilhas      PGR/DRPS
   FIBia IA    Playbooks       Constelação  PDF Compliance
   NORA bot    Job Crafting    IFT Coin     Heatmap setor
```

Cada verbo = um espaço dedicado no app, com KPIs próprios, agentes IA e relatórios.

---

## 🧭 Mapeamento: referência → nosso app

| Referência (plataforma-nr1) | Nosso equivalente | Status |
|---|---|---|
| `/mensurar` | `/diagnostico` + `/nr1/avaliacao` (NORA) | ✅ existe, falta consolidar hub |
| `/transformar` | `/intervencoes` | 🟡 placeholder, falta ILI score |
| `/educar` + `/educar/:slug` + `/educar/constelacao` | `/academy` | 🟡 placeholder |
| `/governar` + `/governar/pdf-intelligence` | `/relatorios` + `/matriz` | 🟡 parcial |
| `/matriz-nr1` | `/matriz` | ✅ |
| `/gestao-nr1` | `/nr1` (NR1Hub) | ✅ |
| `/empresa` (CompanySetup) | `/empresa/configurar` | ✅ |
| `/onboarding` | falta | 🔴 criar (Sprint 5) |
| `/planos` (SubscriptionGate) | falta | 🔴 criar (Sprint 7) |
| `/jornada` (jornada do colaborador) | falta | 🔴 criar (Sprint 6) |
| `DashboardLayout` (sidebar persistente) | `Dashboard` (tabs) | 🟡 evoluir p/ layout SaaS |

---

## 🚀 Sprints (ordem de execução assertiva, baixo custo de crédito)

### ✅ Sprint 1 — Auth & Profiles (concluído)
### ✅ Sprint 2 — Navbar + 5 rotas placeholder
### ✅ Sprint 3 — Landing Premium
### ✅ Sprint 4 — Multi-tenant SaaS (companies + invite + EcosystemHub + DisruptiveLab)

### ✅ Sprint 5 — **Onboarding Wizard pós-signup** (concluído)
- Rota `/onboarding` em 4 passos: persona → empresa (criar ou entrar c/ código) → setor → 1ª missão.
- Pula automaticamente para `/dashboard` se o usuário já tiver empresa vinculada.
- Atualiza `profiles.segment` + `profiles.organization` e cria/vincula `companies` via `createCompany`/`joinCompanyByCode`.
- **Arquivos:** `src/pages/Onboarding.tsx` + rota protegida em `src/App.tsx`.

### Sprint 6 — **Jornada do Colaborador (`/jornada`)**
- Página pública/autenticada com timeline pessoal: missões diárias, IFT Coin, próximo módulo Academy, FIB-T evolutivo.
- Substitui o "Dashboard Colaborador" — colaborador vê **jornada**, gestor vê **dashboard**.
- **Inspirado em:** `JornadaPage.tsx`.

### ✅ Sprint 7 — **Planos & Subscription Gate (`/planos`)** (concluído)
- Enum `company_plan` + coluna `companies.plan` (default 'free').
- Página `/planos` com 3 cards (Essencial, Pro, Enterprise) e ativação mock via update direto.
- `SubscriptionGate` HOC pronto para envolver rotas/features premium → CTA para `/planos`.
- Link "Planos & Assinatura" em SECONDARY_NAV.
- **Próximo:** Stripe connector real quando o usuário pedir.

### ✅ Sprint 8 — **Transformar com ILI score real** (concluído)
- `/intervencoes` agora é um catálogo vivo de 12 práticas Oxford/Cochrane/WHO com **ILI (Intervention Likelihood Index)** calculado em runtime a partir do último `nr1_assessment` (subscale × peso × effect size).
- Top 3 picks + catálogo completo expansível com protocolo, subescalas alvo, KPI e evidência.
- Filtros por nível (individual/equipe/organizacional) e plano local de ação (UI-only por enquanto, pronto para tabela `company_interventions` futura — evitando gasto de crédito agora).
- **Arquivos:** `src/data/interventions.ts` (catálogo + função `rankInterventions`), `src/pages/Intervencoes.tsx`.

### Sprint 9 — **Educar (Academy + Constelação + Driver Detail)**
- `/academy` → grid de 9 trilhas (PERMA+V × VIA).
- `/academy/:slug` → driver detail com micro-missões + IFT Coin.
- `/academy/constelacao` → visualização interativa SVG da relação entre drivers.
- **Inspirado em:** `EducarPage`, `DriverDetailPage`, `ConstelacaoPage`.

### Sprint 10 — **Governar (PDF Intelligence + Relatórios)**
- `/relatorios` real: gera PGR/DRPS via edge function (`nr1-pdf-report` já existe, expandir).
- `/relatorios/pdf-intelligence` → upload de PDFs antigos da empresa, IA extrai pontos e cruza com COPSOQ atual.
- **Inspirado em:** `PDFCompliancePage`.

### Sprint 11 — **DashboardLayout SaaS persistente**
- Migrar `/dashboard`, `/mensurar`, `/transformar`, `/educar`, `/governar` para um `DashboardLayout` com sidebar fixa + breadcrumb + user-menu.
- Mantém `AppNavbar` apenas no público (landing, apresentações, evidências).

### Sprint 12 — **Pesquisa pública anônima (`/pesquisa?code=...`)**
- Link compartilhável que o gestor envia aos colaboradores; responde COPSOQ II sem login.
- Vincula respostas a `companies.invite_code` com `k≥7` para anonimato.
- **Inspirado em:** `SurveyPage.tsx` (rota pública sem auth).

---

## 🔧 Decisões técnicas (não-negociáveis)

1. **Verbos de ação** viram primeira camada de navegação no `DashboardLayout` (sidebar).
2. **Multi-tenant**: toda query operacional filtra por `company_id` via RLS já existente.
3. **Privacy-by-design**: agregações sempre com `k ≥ 7` respondentes; nunca expor resposta individual ao gestor.
4. **IA**: Lovable AI Gateway (`google/gemini-2.5-flash` default, `gpt-5` para PDF intelligence).
5. **Gamificação**: IFT Coin é progresso pessoal — sem ranking público, sem comparação tóxica.
6. **Acessibilidade**: todos os componentes novos com `aria-*`, foco visível, contraste AAA em texto principal.

---

## 📊 Definição de "pronto" por sprint

- Rota navegável + dados reais (não-mock) quando há tabela.
- RLS testada (owner vê tudo da empresa, colaborador vê só o próprio).
- Mobile-first responsivo (≤ 360 px ok).
- Memória `mem://features/<sprint>.md` atualizada.
- Plan.md marcado ✅.

---

## 🎯 Próximo passo recomendado
**Sprint 5 — Onboarding Wizard.** Desbloqueia toda a jornada SaaS (sem ele, usuário cria conta e cai num dashboard vazio). É a maior alavanca de ativação com o menor custo de crédito.
