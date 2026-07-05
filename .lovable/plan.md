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

### ✅ Sprint 9 — **Educar (Academy + Constelação + Driver Detail)** (concluído)
- `/academy` → grid de 9 trilhas PERMA+V × VIA com stat strip (trilhas, missões, concluídas, IFT Coin).
- `/academy/:slug` → driver detail com "por que importa" + evidência científica + 3 micro-missões marcáveis (IFT Coin reward) + drivers que ressoam.
- `/academy/constelacao` → SVG interativo (9 nós em anel, arestas de ressonância, anel de progresso por driver, hover detail).
- **IFT Coin**: persistido em localStorage via `useIftCoins` (privacy-first, sem ranking público). Pronto para migrar a tabela `user_missions` quando o usuário pedir.
- **Arquivos:** `src/data/academy.ts`, `src/hooks/useIftCoins.ts`, `src/pages/Academy.tsx`, `src/pages/AcademyDriver.tsx`, `src/pages/AcademyConstelacao.tsx`.

### ✅ Sprint 10 — **Governar (PDF Intelligence + Relatórios)** (concluído)
- Edge function `pdf-intelligence` (Lovable AI · `google/gemini-2.5-flash`, JSON mode) analisa texto extraído de PDFs de compliance (PGR/DRPS/ASO) e devolve: tipo, resumo, compliance_score (0-100), achados (severidade + subescalas COPSOQ + cláusula NR-1), lacunas e próximas ações.
- Página `/relatorios/pdf-intelligence`: upload de PDF (extração client-side de texto via heurística Tj/TJ — zero servidor para tokenização) **ou** colagem manual; UI premium com badges de severidade, tags COPSOQ traduzidas via `copsoqSubscales`, CTAs para `/intervencoes` e `/nr1/avaliacao`.
- Card de entrada destacado em `/relatorios`; rota adicionada em `App.tsx`.
- Roadmap futuro: OCR para PDFs escaneados, persistência em `company_pdf_analyses` (evitado agora para não consumir crédito sem demanda).

### ✅ Sprint 11 — **DashboardLayout SaaS persistente** (concluído via *workspace rail*)
- Abordagem não-invasiva premium: `AppSidebarRail` (trilho lateral fixo `w-14`) montado globalmente em `App.tsx` dentro do `AuthProvider`. Auto-detecta rotas SaaS (`/dashboard`, `/jornada`, `/diagnostico`, `/nr1*`, `/intervencoes`, `/academy*`, `/relatorios*`, `/matriz`, `/planos`, `/empresa*`, `/perfil`) e some no público (landing, apresentações, evidências, FIBia, auth).
- Layout flutuante (backdrop-blur + border + glow) — não desloca conteúdo das páginas, preserva trabalho prévio e zero edição por página.
- Itens organizados pelos 4 verbos (Mensurar / Transformar / Educar / Governar) + Dashboard, Jornada, Matriz e Planos. Tooltips on-hover, indicador de rota ativa com `layoutId` Framer Motion.
- Trade-off consciente: o `AppNavbar` superior permanece em todas as páginas; o trilho é um **atalho de navegação cross-route**, não substitui o navbar. Migração para shell completo (com breadcrumb + user-menu integrado) fica como Sprint futura quando justificar custo de refator.

### ✅ Sprint 12 — **Pesquisa pública anônima (`/pesquisa?code=...`)** (concluído)
- Rota pública **sem auth**: colaborador acessa via QR/link com `?code=INVITE`, valida via RPC `lookup_company_by_invite` (SECURITY DEFINER, exposta a anon/authenticated — devolve apenas nome legal + setores + versão COPSOQ).
- Fluxo em 4 estágios (code → intro → survey → done): coleta opcional de setor, 41 itens COPSOQ II paginados em blocos de 6, validação por bloco, progress bar global.
- Envio via RPC `submit_public_survey` (SECURITY DEFINER) que valida o invite_code server-side e grava em `public_survey_responses` com `global_score`/`global_risk` pré-computados + hash leve de user-agent (não-identificável).
- RLS: tabela bloqueada para escrita direta; leitura apenas para `is_company_member`. Privacy-by-design: agregação k ≥ 7 reforçada na UI; sem coleta de IP/email/login.
- **Arquivos:** `src/pages/Pesquisa.tsx`, migration `public_survey_responses` + 2 RPCs, rota em `src/App.tsx`.

### ✅ Sprint 13 — **Gestão de Convites & QR Code (`/empresa/convites`)** (concluído)
- Página premium para SST/gestor: QR code de alta resolução (lib `qrcode`, error correction H, 720px) gerado client-side para o link `/pesquisa?code=INVITE`, com download PNG, código copy/share, link público copy/share.
- Stat strip ao vivo: respostas totais, últimas 24h, cobertura vs. headcount estimado, score médio.
- Breakdown por setor com k-anonimato (k ≥ 7): setores abaixo do limiar mostram apenas n, sem score nem risco; acima exibem score médio e risco dominante (baixo/médio/alto/crítico colorido).
- **Realtime**: subscription Supabase `postgres_changes` em `public_survey_responses` filtrada por `company_id` — novas respostas anônimas aparecem instantaneamente sem refresh. Migration ativa `supabase_realtime` + `REPLICA IDENTITY FULL`.
- CTA cruzados para `/dashboard` (heatmap) e `/intervencoes` (ILI), botão de atalho em `/empresa/configurar`, item dedicado no `AppSidebarRail` (ícone QR, accent magenta).
- Arquivos: `src/pages/EmpresaConvites.tsx`, rota protegida em `App.tsx`, atalho em `EmpresaConfigurar.tsx`, item em `AppSidebarRail.tsx`, migration realtime.

### ✅ Sprint 18 — **Ranking Nacional NR-1 + SEO viral do Selo** (concluído)
- Widget "Top 10 estados que mais aderiram" no topo de `/nr1-brasil/signatarios`: barras proporcionais por UF (gradient gold→magenta), badges clicáveis que filtram o diretório em 1 clique, counter total de empresas em destaque. Alimentado pela RPC `nr1_manifest_stats` já existente (zero custo de backend).
- SEO dinâmico no `/selo/:id`: injeção runtime de `<title>`, `meta description`, Open Graph (`og:title/description/type`) e Twitter Card com o nome real da empresa signatária → link do selo agora renderiza preview rico ao ser colado em WhatsApp, LinkedIn, Slack, etc.
- Title dedicado também no diretório para SEO orgânico ("Diretório Nacional NR-1 · Empresas Signatárias").
- Arquivos: `src/pages/NR1Signatarios.tsx`, `src/pages/SeloNR1.tsx`.

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
