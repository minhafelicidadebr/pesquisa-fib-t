/**
 * Resolver de código de acesso à pesquisa (multi-instituição).
 *
 * A home pública envia apenas o código digitado. Os valores reais vivem em
 * secrets do servidor — nunca no bundle. A resposta é mínima:
 *   { authorized: true, destination: "/isg" }  ou  { authorized: false }
 *
 * Para adicionar uma nova instituição basta acrescentar uma entrada abaixo
 * (com o nome do secret que guarda o código) — a home não muda.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SurveyEnv = {
  organization_key: string;
  survey_key: string;
  /** Secret que guarda o código de acesso do participante. */
  secret_env: string;
  destination: string;
  enabled: boolean;
};

const REGISTRY: SurveyEnv[] = [
  {
    organization_key: "isg",
    survey_key: "fibt-isg-pilot",
    secret_env: "ISG_ACCESS_CODE",
    destination: "/isg",
    enabled: true,
  },
];

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
  for (let i = 0; i < len; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ authorized: false }, 405);

  let candidate = "";
  try {
    const body = await req.json();
    if (typeof body?.access_code === "string" && body.access_code.length <= 128) {
      candidate = body.access_code;
    } else if (typeof body?.code === "string" && body.code.length <= 128) {
      candidate = body.code;
    }
  } catch {
    candidate = "";
  }

  // Custo fixo mínimo: uniformiza latência e reduz utilidade de força bruta.
  await new Promise((r) => setTimeout(r, 250));

  if (!candidate) return json({ authorized: false });

  const normalized = normalize(candidate);
  let match: SurveyEnv | null = null;

  for (const entry of REGISTRY) {
    if (!entry.enabled) continue;
    const expected = Deno.env.get(entry.secret_env);
    if (!expected) continue;
    if (safeEqual(normalized, normalize(expected))) {
      match = entry;
      // Sem break: mantém o custo do loop constante entre acertos e erros.
    }
  }

  if (!match) return json({ authorized: false });

  return json({
    authorized: true,
    destination: match.destination,
    organization_key: match.organization_key,
    survey_key: match.survey_key,
  });
});
