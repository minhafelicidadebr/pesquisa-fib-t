# Roadmap — Arquitetura SaaS NR-1 Multi-Perfil

Comitê interdisciplinar (Opus 4.7 + Claude Design) recomenda **3 ondas incrementais** para evitar gasto desnecessário de créditos e garantir cada camada validada antes da próxima.

---

## 🌳 Tree of Thoughts — decisões-chave

**T1. Modelo de tenancy** → escolhemos **company-based multi-tenant** com `companies` + `company_members` (vs. workspace genérico ou flat). Razão: alinha 1:1 com NR-1 (cada CNPJ = um PGR).

**T2. Onboarding** → **código de convite alfanumérico de 8 chars** (ex. `ABB7E790`) gerado por trigger no `INSERT` da company. SST cria → compartilha → Gestor/Colab usam no signup.

**T3. Persona** → adicionamos enum `app_role` `sst | gestor | colaborador | admin` (mantém compatibilidade). Dashboard renderiza widgets por role.

**T4. COPSOQ versões** → `copsoq_version` enum `curto|medio|longo|brasil` armazenado em `companies.copsoq_version`. Pesquisa lê do contexto da empresa.

**T5. Celebração** → `canvas-confetti` (5KB), modal final + CTAs externos.

---

## 🌊 Onda 1 — Backend SaaS (esta entrega)

### Migration
- Enum `app_role` adiciona `'sst'`, `'gestor'` (mantém `colaborador`, `admin`)
- Enum `copsoq_version` (`curto`, `medio`, `longo`, `brasil`)
- Tabela `companies`: `id`, `owner_id`, `legal_name`, `cnpj`, `sector`, `estimated_employees`, `invite_code` (UNIQUE), `copsoq_version`, `sectors text[]`, timestamps
- Tabela `company_members`: `company_id`, `user_id`, `role`, `sector`, joined_at — **UNIQUE(company_id,user_id)**
- Função `generate_invite_code()` + trigger `BEFORE INSERT`
- Função `join_company_by_code(code text, sector text)` SECURITY DEFINER
- RLS: SST/owner gerencia sua company; membros leem própria company; colaboradores só leem dados agregados
- Adicionar `company_id` em `nr1_assessments` (nullable p/ retrocompat)

### Frontend (Onda 1)
- `useAuth` expande p/ expor `companyId`, `companyRole`
- `src/lib/companies.ts` — CRUD + joinByCode

---

## 🌊 Onda 2 — Auth multi-perfil + Onboarding

- `/auth` vira **seletor de persona** (cards: SST · Gestor · Colaborador) → roteia a 3 forms dedicados:
  - **SST**: nome, empresa, CNPJ, setor, escolha COPSOQ → cria company + gera invite code → mostra código pós-cadastro
  - **Gestor / Colaborador**: nome, **código da empresa**, setor, email, senha → join automático
- `/empresa/configurar` (SST/admin only) — replica o print: invite code copiável, setores tags, versão COPSOQ
- Pesquisa NR-1 lê `company.copsoq_version` para escolher banco de itens (placeholder p/ médio/longo/brasil)

---

## 🌊 Onda 3 — Dashboard unificado + Celebração

- Dashboard com **3 layouts por role**:
  - **SST/Gestor**: KPIs agregados da empresa (n respondentes, risco médio, heatmap setores, alertas vermelhos)
  - **Colaborador**: progresso pessoal + acesso a Academy/EdTech
- Tela final do COPSOQ (`NR1Chat` conclusão) — **modal premium** com:
  - 🎉 Confete (`canvas-confetti`)
  - Card "Você desbloqueou acesso exclusivo"
  - 2 CTAs externos:
    - https://edtech-da-felicidade.lovable.app/
    - https://curso-felicidade-adolescentes-yale.lovable.app/
- Chatbot flutuante global (FIBia já existe) — habilitado em todas rotas autenticadas como copiloto

---

## Tech notes
- Sem novas deps além de `canvas-confetti` (~5KB)
- Reaproveita: `Dashboard.tsx`, `NR1Chat.tsx`, `useAuth`, glass-card tokens, brand-magenta/gold
- Tudo i18n pt-BR, A11y AA, responsivo (já temos breakpoints)
- Edge functions existentes intactos

---

## Entrega desta resposta
Vou executar **Onda 1 (migration) + Onda 3 (celebração com confete + CTAs)** agora — são as de maior impacto visível e menor risco. Aguardo sua aprovação da migration; depois executo Onda 2 (forms multi-perfil) em mensagem seguinte para manter qualidade e economia de créditos.

Confirma esta sequência?