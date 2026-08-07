/**
 * ISG — Access Gate server-side.
 *
 * O código de acesso do piloto vive APENAS no secret `ISG_ACCESS_CODE`.
 * O cliente envia um candidato e recebe somente `{ authorized: boolean }`.
 * Nunca devolvemos o segredo, dicas parciais ou motivo detalhado da falha.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Comparação de tempo constante — evita oráculo por timing. */
function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  const len = Math.max(x.length, y.length);
  let diff = x.length ^ y.length;
  for (let i = 0; i < len; i++) {
    diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  }
  return diff === 0;
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ authorized: false }, 405);
  }

  const expected = Deno.env.get("ISG_ACCESS_CODE");
  if (!expected) {
    console.error("ISG_ACCESS_CODE não configurado.");
    return json({ authorized: false }, 200);
  }

  let candidate = "";
  try {
    const body = await req.json();
    if (typeof body?.code === "string" && body.code.length <= 128) {
      candidate = body.code;
    }
  } catch {
    candidate = "";
  }

  // Custo fixo mínimo: reduz utilidade de força bruta e uniformiza latência.
  // Ponto de extensão para rate limiting quando houver primitiva no backend.
  await new Promise((r) => setTimeout(r, 250));

  const authorized =
    candidate.length > 0 && safeEqual(normalize(candidate), normalize(expected));

  return json({ authorized });
});
