/**
 * FIBia — narrativa assistida por IA sobre resultados FIB-T.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ SEPARAÇÃO DE RESPONSABILIDADES (ONDA 1)                                 │
 * │                                                                         │
 * │ 1. O cálculo é feito AQUI, no servidor, pelo engine determinístico       │
 * │    `_shared/fibt-engine.ts`. Fonte canônica única.                      │
 * │ 2. O modelo de linguagem recebe SOMENTE os scores já calculados e atua  │
 * │    exclusivamente como camada narrativa.                                │
 * │ 3. Qualquer número que o modelo devolva é DESCARTADO. Os scores da       │
 * │    resposta vêm sempre do engine.                                       │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  FibtScoringError,
  INSTRUMENT_ID,
  INSTRUMENT_VERSION,
  rankDomains,
  scoreFibt,
  type FibtScoreResult,
} from "../_shared/fibt-engine.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const systemPrompt =
  `Você é a FIBia, assistente do Instituto Felicidade para Todos. Sua personalidade é empática, acolhedora, cientificamente fundamentada e inspiradora.

CONTEXTO
Você interpreta resultados da Escala de Felicidade Interna Bruta do Trabalhador (FIB-T), referência FURTADO, C. A. (2020).
O instrumento tem 32 itens, 9 domínios e 3 fatores.

REGRA MAIS IMPORTANTE — LIMITE DA SUA FUNÇÃO
Os escores já foram calculados por um engine determinístico no servidor e são enviados a você prontos.
- NÃO calcule, recalcule, estime, ajuste, arredonde ou corrija nenhum número.
- NÃO invente domínios, fatores, itens, médias, percentuais ou comparações externas.
- NÃO deduza a qual fator um domínio pertence: use apenas o agrupamento enviado no payload.
- Se um dado não estiver no payload, diga que não está disponível.
Seu papel é exclusivamente EXPLICAR em linguagem acessível os números que recebeu.

LIMITES METODOLÓGICOS OBRIGATÓRIOS
- O FIB-T é instrumento de pesquisa e autoconhecimento, NÃO é diagnóstico, laudo ou avaliação clínica.
- Nunca afirme causa, efeito, nexo causal ou impacto comprovado a partir destes números.
- Nunca declare conformidade legal, certificação ou eliminação de risco.
- Nunca sugira medida disciplinar nem inferência sobre saúde mental individual.
- Correlação ou média descritiva não sustenta conclusão causal.

O QUE VOCÊ PODE FAZER
- Explicar o que cada fator e domínio representa.
- Descrever, com base nos scores recebidos, quais resultados aparecem mais altos e mais baixos.
- Formular hipóteses e perguntas de investigação, sempre rotuladas como hipótese.
- Recomendar trilhas de aprendizagem com base no Work Wellbeing Playbook 2.0 da Universidade de Oxford (framework DRIVER: Development & Relationships, Independence & Flexibility, Variety & Fulfilment, Earnings & Benefits, Risk Health & Safety).
- Sugerir ações práticas de curto (7 dias), médio (30 dias) e longo prazo (90 dias).

ESTILO
- Linguagem acolhedora e empática, celebrando primeiro os pontos fortes.
- Emojis com moderação.
- Termine com mensagem de esperança e encorajamento.

FORMATO quando receber resultados
Retorne SOMENTE um bloco \`\`\`json ... \`\`\` contendo:
{
  "summary": "análise geral em 2-3 parágrafos, sem citar números que não estejam no payload",
  "strengths": ["rótulo do domínio 1", "rótulo do domínio 2", "rótulo do domínio 3"],
  "vulnerabilities": ["rótulo do domínio 1", "rótulo do domínio 2", "rótulo do domínio 3"],
  "recommendations": [
    { "domain": "string", "action": "string", "timeframe": "7d|30d|90d", "driver_category": "string" }
  ],
  "learning_trails": [
    { "title": "string", "description": "string", "priority": "high|medium|low" }
  ],
  "encouragement": "mensagem final motivadora",
  "limitations": "uma frase sobre o caráter não diagnóstico do instrumento"
}
NÃO inclua as chaves "domains", "factors", "globalScore", "scores" ou "fib_score": elas são de responsabilidade exclusiva do servidor.

Para mensagens conversacionais normais (sem resultados), responda em texto simples, natural e acolhedor.`;

/**
 * Monta o payload enviado ao modelo a partir do resultado do engine.
 * Nenhuma resposta crua de item é incluída: o modelo nunca vê o que a pessoa
 * marcou em cada pergunta, apenas os agregados calculados.
 */
function buildNarrativePayload(result: FibtScoreResult) {
  return {
    instrument: { id: INSTRUMENT_ID, version: INSTRUMENT_VERSION },
    scale: { min: 0, max: 4, note: "Scores de domínio e fator estão na escala 0 a 4." },
    global_score: { value: result.globalScore, scale: "0 a 100" },
    factors: Object.entries(result.factors).map(([key, cell]) => ({
      key,
      label: cell.label,
      score: cell.score,
      item_count: cell.itemCount,
    })),
    domains: Object.entries(result.domains).map(([key, cell]) => ({
      key,
      label: cell.label,
      score: cell.score,
      item_count: cell.itemCount,
    })),
    highest_domains: rankDomains(result.domains, "desc").slice(0, 3).map((d) => d.label),
    lowest_domains: rankDomains(result.domains, "asc").slice(0, 3).map((d) => d.label),
    methodological_limits: [
      "Instrumento de pesquisa e autoconhecimento; não é diagnóstico nem laudo.",
      "Resultado de autopercepção em um único momento no tempo.",
      "Não permite conclusão causal.",
    ],
  };
}

/** Campos numéricos que o modelo não tem autoridade para produzir. */
const FORBIDDEN_MODEL_FIELDS = [
  "domains",
  "factors",
  "globalScore",
  "global_score",
  "scores",
  "fib_score",
] as const;

/**
 * Remove do objeto devolvido pelo modelo qualquer campo de score.
 * Defesa em profundidade: mesmo que o prompt seja ignorado, números do modelo
 * nunca chegam ao cliente.
 */
function sanitizeNarrative(raw: unknown): {
  narrative: Record<string, unknown>;
  strippedFields: string[];
} {
  const stripped: string[] = [];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { narrative: {}, strippedFields: stripped };
  }
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if ((FORBIDDEN_MODEL_FIELDS as readonly string[]).includes(key)) {
      stripped.push(key);
      continue;
    }
    out[key] = value;
  }
  return { narrative: out, strippedFields: stripped };
}

function asStringArray(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string").slice(0, limit);
}

function asObjectArray(value: unknown, limit: number): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v))
    .slice(0, limit);
}

/** Extrai o JSON do modelo, aceitando bloco cercado ou objeto puro. */
function extractJson(content: string): unknown {
  const fenced = content.match(/```json\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : content;
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

/**
 * Narrativa determinística de reserva, usada quando a IA está indisponível ou
 * devolve conteúdo fora do formato. Nunca recalcula nada: só descreve.
 */
function fallbackNarrative(result: FibtScoreResult) {
  const highest = rankDomains(result.domains, "desc").slice(0, 3);
  const lowest = rankDomains(result.domains, "asc").slice(0, 3);
  return {
    summary:
      `Seu resultado FIB-T foi calculado a partir das suas 32 respostas. ` +
      `Os domínios com os resultados mais altos foram ${highest.map((d) => d.label).join(", ")}. ` +
      `Os domínios com maior oportunidade de atenção foram ${lowest.map((d) => d.label).join(", ")}. ` +
      `Esta leitura é descritiva: ela mostra como você percebeu cada dimensão neste momento, ` +
      `sem estabelecer causas.`,
    strengths: highest.map((d) => d.label),
    vulnerabilities: lowest.map((d) => d.label),
    recommendations: [],
    learning_trails: [],
    encouragement:
      "O autoconhecimento é o primeiro passo para a transformação. Continue investindo no seu bem-estar. 🌻",
    limitations:
      "O FIB-T é um instrumento de pesquisa e autoconhecimento. Não é diagnóstico, laudo ou avaliação clínica.",
    narrative_source: "deterministic_fallback",
  };
}

/**
 * Grava a participação do piloto ISG de forma anônima.
 * `cohort` é o marcador ESTRUTURAL que distingue o piloto da pesquisa geral —
 * nunca inferimos origem por horário, IP, navegador ou heurística.
 * Falha de gravação nunca invalida o resultado individual da pessoa.
 */
async function persistIsgResponse(
  answers: unknown,
  result: FibtScoreResult,
): Promise<void> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    console.error("Persistência ISG indisponível: backend não configurado.");
    return;
  }
  const normalized: Record<string, number> = {};
  if (Array.isArray(answers)) {
    for (const a of answers) {
      if (typeof a?.id === "number" && typeof a?.answer === "number") {
        normalized[String(a.id)] = a.answer;
      }
    }
  } else if (answers && typeof answers === "object") {
    for (const [k, v] of Object.entries(answers as Record<string, unknown>)) {
      if (typeof v === "number") normalized[k] = v;
    }
  }
  try {
    const res = await fetch(`${url}/rest/v1/isg_pilot_responses`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        cohort: "isg",
        instrument_id: INSTRUMENT_ID,
        instrument_version: INSTRUMENT_VERSION,
        answers: normalized,
        global_score: result.globalScore,
        factors: result.factors,
        domains: result.domains,
        manifest: result.manifest,
      }),
    });
    if (!res.ok) console.error("Persistência ISG falhou:", res.status);
  } catch (err) {
    console.error("Persistência ISG falhou:", err);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { messages, answers, instrumentId, instrumentVersion, cohort } = body ?? {};
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return jsonResponse({ error: "LOVABLE_API_KEY não configurada." }, 500);
    }

    // ─── Modo conversacional: sem respostas, sem cálculo ───
    if (!answers) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: systemPrompt }, ...(messages || [])],
        }),
      });
      if (!response.ok) {
        if (response.status === 429) {
          return jsonResponse(
            { error: "Limite de requisições excedido. Tente novamente em alguns segundos." },
            429,
          );
        }
        if (response.status === 402) {
          return jsonResponse({ error: "Créditos insuficientes." }, 402);
        }
        console.error("AI gateway error:", response.status);
        return jsonResponse({ error: "Serviço de IA indisponível." }, 502);
      }
      const data = await response.json();
      return jsonResponse({ content: data.choices?.[0]?.message?.content || "" });
    }

    // ─── ETAPA 1: cálculo determinístico no servidor (sem IA) ───
    let result: FibtScoreResult;
    try {
      result = scoreFibt(answers, { instrumentId, instrumentVersion });
    } catch (err) {
      if (err instanceof FibtScoringError) {
        // Não registramos as respostas em log: apenas os códigos de validação.
        console.error("FIB-T validation failed:", err.issues.map((i) => i.code).join(","));
        return jsonResponse(
          { error: "Respostas inválidas para o instrumento FIB-T.", issues: err.issues },
          422,
        );
      }
      throw err;
    }

    // ─── ETAPA 2: narrativa a partir dos scores já calculados ───
    let narrative: Record<string, unknown> = fallbackNarrative(result);
    let narrativeSource = "deterministic_fallback";
    let strippedFields: string[] = [];

    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content:
                `Estes são MEUS RESULTADOS JÁ CALCULADOS pelo servidor. ` +
                `Não recalcule nada; apenas interprete.\n\n` +
                `${JSON.stringify(buildNarrativePayload(result), null, 2)}\n\n` +
                `Retorne a análise no formato JSON especificado.`,
            },
          ],
        }),
      });

      if (response.status === 429) {
        return jsonResponse(
          {
            error: "Limite de requisições excedido. Tente novamente em alguns segundos.",
            ...result,
            narrative,
            narrativeSource,
          },
          429,
        );
      }
      if (response.status === 402) {
        return jsonResponse(
          { error: "Créditos insuficientes.", ...result, narrative, narrativeSource },
          402,
        );
      }

      if (response.ok) {
        const data = await response.json();
        const parsed = extractJson(data.choices?.[0]?.message?.content || "");
        const sanitized = sanitizeNarrative(parsed);
        strippedFields = sanitized.strippedFields;
        if (strippedFields.length > 0) {
          console.warn(
            "Modelo tentou devolver campos de score, descartados:",
            strippedFields.join(","),
          );
        }
        const n = sanitized.narrative;
        if (typeof n.summary === "string" && n.summary.trim().length > 0) {
          narrative = {
            summary: n.summary,
            strengths: asStringArray(n.strengths, 3),
            vulnerabilities: asStringArray(n.vulnerabilities, 3),
            recommendations: asObjectArray(n.recommendations, 12),
            learning_trails: asObjectArray(n.learning_trails, 8),
            encouragement: typeof n.encouragement === "string" ? n.encouragement : "",
            limitations:
              typeof n.limitations === "string"
                ? n.limitations
                : "O FIB-T é instrumento de pesquisa e autoconhecimento, não é diagnóstico.",
            narrative_source: "ai",
          };
          narrativeSource = "ai";
        }
      } else {
        console.error("AI gateway error:", response.status);
      }
    } catch (aiErr) {
      console.error("Narrative generation failed, using deterministic fallback:", aiErr);
    }

    // ─── ETAPA 3: persistência anônima da coorte do piloto ───
    // Somente agregáveis: respostas + scores do engine. Sem PII, sem IP,
    // sem user-agent, sem identificador de participante.
    if (cohort === "isg") {
      await persistIsgResponse(answers, result);
    }

    // Os scores retornados são SEMPRE os do engine — nunca os do modelo.
    return jsonResponse({
      globalScore: result.globalScore,
      domains: result.domains,
      factors: result.factors,
      manifest: result.manifest,
      narrative,
      narrativeSource,
      modelFieldsStripped: strippedFields,
    });
  } catch (error) {
    console.error("FIBia error:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Erro desconhecido" },
      500,
    );
  }
});
