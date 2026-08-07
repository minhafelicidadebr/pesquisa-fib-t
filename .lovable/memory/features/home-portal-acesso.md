---
name: Portal de acesso FIB-T (home /)
description: Home institucional de propósito único com código de acesso resolvido no servidor, tema claro e sem links administrativos
type: feature
---

- `/` é o portal institucional do Instituto Felicidade para Todos: explica a Pesquisa FIB-T e recebe o código de acesso. Nada de dashboards, painéis ou rotas internas de clientes linkados na home.
- O código NUNCA existe no cliente. `src/lib/surveyAccess.ts` chama a edge function `resolve-survey-access`, que compara em tempo constante contra secrets e devolve apenas `{authorized, destination, organization_key, survey_key}`.
- Autorização concedida grava um grant em `sessionStorage`; `src/pages/ISG.tsx` usa `hasSurveyAccessGrant("/isg")` para pular o segundo gate.
- Erro de código é sempre genérico (sem dizer se o código existe).
- Tema claro escopado em `.ift-portal` no `src/index.css` — não altera `:root` (demais rotas seguem escuras).
- Comunicação: "participação confidencial", "leitura organizacional agregada". Proibido "100% anônimo" e qualquer promessa de diagnóstico clínico.
- FIBia aparece como guia/acolhimento na home, sem chat generativo e sem interpretar respostas.
- `/isg/resultados` é noindex e está em `public/robots.txt`.
