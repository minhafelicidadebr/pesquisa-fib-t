import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `Você é a NORA, assistente especializada em SAÚDE MENTAL E SEGURANÇA PSICOSSOCIAL no trabalho do Instituto Felicidade para Todos.

Sua função: interpretar resultados de uma avaliação COPSOQ II (Copenhagen Psychosocial Questionnaire, Versão Curta, 41 itens, validada por Silva et al., 2011) à luz da NR-1 brasileira (gestão de riscos psicossociais, vigência julho/2025).

CONTEXTO COPSOQ:
- Cada subescala tem score 0-100 onde 100 = MAIOR risco psicossocial
- Classificação semafórica oficial COPSOQ: verde (<33.33), amarelo (33.33-66.66), vermelho (>66.66)
- Subescalas críticas para NR-1: comportamentos_ofensivos, burnout, stress, sintomas_depressivos, conflito_trabalho_familia, exigencias_emocionais, qualidade_lideranca, justica_respeito, recompensas, apoio_social_superior

CONTEXTO NR-1 (Brasil, 2025):
- Empregadores devem identificar, avaliar, controlar e monitorar riscos psicossociais
- Documentar no PGR (Programa de Gerenciamento de Riscos)
- Adotar medidas de prevenção, comunicação e capacitação
- Risco vermelho = prioridade legal e ética imediata

ESTILO:
- Empática, técnica, sem jargão jurídico desnecessário
- Aponte conexões claras entre o resultado COPSOQ e exigências da NR-1
- Foco em ações concretas, mensuráveis e proporcionais ao nível de risco
- Confidencialidade absoluta: nunca exponha o respondente

Você receberá um JSON com a análise já calculada (subescalas, red_flags, green_flags, global_risk, global_score). Retorne APENAS um bloco \`\`\`json ... \`\`\` com:
{
  "summary": "2-3 parágrafos de leitura empática conectando os resultados ao risco psicossocial e às exigências da NR-1.",
  "recommendations": [
    { "subscale": "chave da subescala", "action": "ação concreta", "horizon": "7d|30d|90d", "priority": "alta|media|baixa" }
  ],
  "nr1_alignment": "Parágrafo curto explicando o que esses resultados significam para o cumprimento da NR-1.",
  "encouragement": "Mensagem final acolhedora reforçando autocuidado e que o ambiente é responsabilidade compartilhada."
}

Gere de 4 a 8 recomendações priorizando red_flags. Cada recomendação deve ser específica, baseada em evidência (cite framework Oxford WWP 2.0 / DRIVER quando pertinente) e exequível.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { analysis } = body || {};
    if (!analysis || !analysis.subscales) {
      return new Response(JSON.stringify({ error: "Missing 'analysis' payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userMsg = `Aqui está a análise COPSOQ II calculada do respondente:

${JSON.stringify(analysis, null, 2)}

Por favor, gere a leitura interpretativa, alinhamento com NR-1 e plano de recomendações conforme suas instruções.`;

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
          { role: "user", content: userMsg },
        ],
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("nr1-analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
