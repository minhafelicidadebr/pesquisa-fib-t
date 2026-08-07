---
name: Painel Executivo FIB-T (ISG agregado)
description: Rota /isg/resultados — dashboard agregado do piloto ISG, gate administrativo server-side, k-anonimato e exportações
type: feature
---

# /isg/resultados — Painel Executivo FIB-T

Superfície **administrativa**, nunca linkada na experiência do participante (`/isg`) e marcada `noindex, nofollow`.

## Acesso
- Senha validada apenas no servidor (`isg-results` edge function) via secret `ISG_RESULTS_ADMIN_PASSWORD`; nunca no bundle, URL ou localStorage.
- Login devolve token HMAC assinado, validade 45 minutos. Erro sempre genérico: "Não foi possível validar o acesso."

## Privacidade
- Somente resultados agregados. Nenhuma resposta individual pode ser aberta ou exportada.
- Limiar k = 7 participações; abaixo disso o painel mostra apenas "Amostra insuficiente para apresentação deste resultado." com o número de participações.

## Dados
- Persistência em `isg_pilot_responses` (marcador estrutural `cohort='isg'`), gravada pelo servidor em `fibia-chat`.
- Cálculo determinístico pela matriz canônica FIB-T (`src/domain/fibt`), nunca por LLM.

## Conteúdo
Participações, resultado global agregado (0–100), status da coleta, última atualização, fatores e domínios (médias 0–4), leituras descritivas do grupo, tabela agregada das 32 questões (média + distribuição Likert), PDF executivo e CSV agregado.

## Linguagem
Descritiva e não clínica: "resultados observados", "médias de autopercepção", sem causalidade, sem rótulo de risco individual.
