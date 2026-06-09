// PDF Intelligence — analisa texto extraído de PDFs de compliance (PGR, DRPS, ASO, NRs)
// e cruza com subescalas COPSOQ II + NR-1 + Oxford Wellbeing Playbook.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUBSCALES = [
  "exigencias_quantitativas", "ritmo_trabalho", "exigencias_cognitivas", "exigencias_emocionais",
  "influencia_trabalho", "possibilidades_desenvolvimento", "previsibilidade", "clareza_papel",
  "recompensas", "apoio_social_superior", "comunidade_social", "qualidade_lideranca",
  "confianca_vertical", "justica_respeito", "significado_trabalho", "compromisso_local",
  "satisfacao_trabalho", "inseguranca_laboral", "conflito_trabalho_familia", "burnout", "stress",
];

const SYSTEM = `Você é uma analista sênior em saúde ocupacional, NR-1 (MTE 2024) e COPSOQ II.
Recebe trechos de documentos PDF de compliance da empresa (PGR, DRPS, laudos, ASO, políticas internas).
Sua missão: extrair de forma rigorosa o que está presente, identificar lacunas frente à NR-1 e mapear
cada achado às subescalas COPSOQ II.

Responda APENAS um JSON válido no formato:
{
  "doc_type": "PGR|DRPS|ASO|Política|Outro",
  "summary": "2-3 frases em português, 1ª pessoa institucional",
  "compliance_score": 0-100,
  "findings": [
    { "topic": string, "evidence": string (trecho ou paráfrase curta),
      "severity": "baixa|moderada|alta|crítica",
      "copsoq_subscales": [string] (use APENAS chaves de: ${SUBSCALES.join(", ")}),
      "nr1_clause": string (ex: "1.5.3.2.1") }
  ],
  "gaps": [
    { "requirement": string, "nr1_clause": string, "recommendation": string }
  ],
  "next_actions": [string]
}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { text, filename } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length < 50) {
      return new Response(JSON.stringify({ error: "Texto insuficiente (mín. 50 caracteres)." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY não configurada." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const truncated = text.slice(0, 18000);

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: `Arquivo: ${filename || "documento.pdf"}\n\n--- CONTEÚDO ---\n${truncated}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(JSON.stringify({ error: "Falha na IA", detail: errText }), {
        status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try { parsed = JSON.parse(content); } catch { parsed = { raw: content }; }

    return new Response(JSON.stringify({ ok: true, analysis: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
