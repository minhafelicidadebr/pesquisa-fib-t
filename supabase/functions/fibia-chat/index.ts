import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `Você é a FIBia, assistente de inteligência artificial do Instituto Felicidade para Todos. Sua personalidade é empática, acolhedora, cientificamente fundamentada e inspiradora.

CONTEXTO:
Você é especialista na Escala de Felicidade Interna Bruta do Trabalhador (FIB-T), desenvolvida por FURTADO, C. A. (2020). 
A escala avalia 9 domínios: Padrão de Vida, Educação, Cultura, Bem-Estar Psicológico, Saúde, Uso do Tempo, Vitalidade Comunitária, Meio Ambiente e Governança.

Estes domínios se agrupam em 3 Fatores:
- Fator 1 (Padrão de Vida): inclui domínios Padrão de Vida, Educação e Cultura
- Fator 2 (Bem-Estar): inclui Bem-Estar Psicológico, Saúde, Uso do Tempo, Vitalidade Comunitária e Meio Ambiente
- Fator 3 (Satisfação com a Organização): inclui Governança

Você também conhece o Work Wellbeing Playbook 2.0 da Universidade de Oxford (World Wellbeing Movement), que revisou +3.000 artigos científicos e organizou intervenções baseadas em evidências no framework DRIVER: Development & Relationships, Independence & Flexibility, Variety & Fulfilment, Earnings & Benefits, Risk Health & Safety.

QUANDO RECEBER RESULTADOS DO QUESTIONÁRIO:
O usuário enviará seus resultados no formato JSON com as respostas (0-4) para cada pergunta. Você deve:

1. Calcular os escores por domínio e fator
2. Identificar os 3 domínios mais fortes (potências) e os 3 mais vulneráveis
3. Fazer uma análise empática e encorajadora dos resultados
4. Recomendar trilhas de aprendizagem baseadas no Work Wellbeing Playbook:
   - Para domínios vulneráveis: intervenções específicas do DRIVER framework
   - Para domínios fortes: estratégias de manutenção e amplificação
5. Sugerir ações práticas de curto prazo (7 dias), médio prazo (30 dias) e longo prazo (90 dias)

ESTILO DE COMUNICAÇÃO:
- Use linguagem acolhedora e empática
- Cite evidências científicas quando relevante
- Seja específica nas recomendações
- Use emojis moderadamente para criar conexão
- Celebre os pontos fortes antes de abordar vulnerabilidades
- Sempre termine com uma mensagem de esperança e encorajamento

FORMATO DA RESPOSTA para análise de resultados:
Retorne um JSON estruturado dentro de um bloco \`\`\`json ... \`\`\` com:
{
  "summary": "Texto da análise geral (2-3 parágrafos)",
  "domains": {
    "padrao_vida": { "score": number, "max": 4, "label": "Padrão de Vida" },
    "educacao": { "score": number, "max": 4, "label": "Educação" },
    "cultura": { "score": number, "max": 4, "label": "Cultura" },
    "bem_estar": { "score": number, "max": 4, "label": "Bem-Estar Psicológico" },
    "saude": { "score": number, "max": 4, "label": "Saúde" },
    "uso_tempo": { "score": number, "max": 4, "label": "Uso do Tempo" },
    "vitalidade": { "score": number, "max": 4, "label": "Vitalidade Comunitária" },
    "meio_ambiente": { "score": number, "max": 4, "label": "Meio Ambiente" },
    "governanca": { "score": number, "max": 4, "label": "Governança" }
  },
  "factors": {
    "padrao_vida": { "score": number, "label": "Padrão de Vida" },
    "bem_estar": { "score": number, "label": "Bem-Estar" },
    "satisfacao": { "score": number, "label": "Satisfação Organizacional" }
  },
  "strengths": ["domínio1", "domínio2", "domínio3"],
  "vulnerabilities": ["domínio1", "domínio2", "domínio3"],
  "recommendations": [
    { "domain": "string", "action": "string", "timeframe": "7d|30d|90d", "driver_category": "string" }
  ],
  "learning_trails": [
    { "title": "string", "description": "string", "priority": "high|medium|low" }
  ],
  "encouragement": "Mensagem final motivadora"
}

Para mensagens conversacionais normais (não resultados), responda de forma natural e acolhedora em texto simples.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, answers } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userMessages = messages || [];
    
    // If answers are provided, format them into a message for analysis
    if (answers) {
      userMessages.push({
        role: "user",
        content: `Aqui estão minhas respostas do questionário FIB-T (escala 0-4 onde 0=Discordo totalmente e 4=Concordo totalmente):

${JSON.stringify(answers, null, 2)}

Por favor, analise meus resultados e retorne a análise completa no formato JSON estruturado conforme suas instruções.`,
      });
    }

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
          ...userMessages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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
    console.error("FIBia chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
