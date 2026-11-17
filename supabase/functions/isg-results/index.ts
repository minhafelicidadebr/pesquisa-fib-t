/**
 * ISG — Painel Executivo FIB-T (agregado).
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ SEGURANÇA                                                               │
 * │ 1. As credenciais ficam apenas em secrets do servidor:                  │
 * │    admin para /resultados e IFT para /apresentacao.                     │
 * │    Nenhuma delas é devolvida ao navegador.                              │
 * │ 2. Login devolve um token de sessão curto assinado por HMAC-SHA256      │
 * │    com o próprio secret. A senha não é reenviada em cada requisição.    │
 * │ 3. Nenhuma linha individual, resposta crua ou identificador sai daqui.  │
 * │    O corpo da resposta contém EXCLUSIVAMENTE agregados.                 │
 * │ 4. k-anonimato aplicado no SERVIDOR: abaixo do limiar nada é calculado. │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { safeEqual, issueToken, sessionRole, verifyToken, type IsgResultsRole } from "./session.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/** Limiar de privacidade único e explícito do piloto. */
const K_THRESHOLD = 7;

const GENERIC_DENY = { ok: false, error: "Não foi possível validar o acesso." };

function secretForRole(role: IsgResultsRole | null): string | undefined {
  if (role === "admin") return Deno.env.get("ISG_RESULTS_ADMIN_PASSWORD");
  if (role !== "ift") return undefined;
  const adminSecret = Deno.env.get("ISG_RESULTS_ADMIN_PASSWORD");
  const iftSecret = Deno.env.get("ISG_RESULTS_IFT_PASSWORD");
  if (
    !adminSecret?.trim() ||
    !iftSecret?.trim() ||
    safeEqual(adminSecret.trim(), iftSecret.trim())
  ) return undefined;
  return iftSecret;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store", "Pragma": "no-cache" },
  });
}

const round1 = (n: number) => Math.round(n * 10) / 10;

interface Row {
  answers: Record<string, number> | Array<{ id: number; answer: number }>;
  global_score: number;
  factors: Record<string, { label: string; score: number }>;
  domains: Record<string, { label: string; score: number }>;
  created_at: string;
}

function normalizeAnswers(raw: Row["answers"]): Record<number, number> {
  const out: Record<number, number> = {};
  if (Array.isArray(raw)) {
    for (const a of raw) {
      if (typeof a?.id === "number" && typeof a?.answer === "number") out[a.id] = a.answer;
    }
  } else if (raw && typeof raw === "object") {
    for (const [k, v] of Object.entries(raw)) {
      const id = Number(k);
      if (Number.isFinite(id) && typeof v === "number") out[id] = v;
    }
  }
  return out;
}

/** Agrega as linhas. Nenhum score é recalculado: usamos o que o engine gravou. */
function aggregate(rows: Row[]) {
  const n = rows.length;
  const cellMean = (
    pick: (r: Row) => Record<string, { label: string; score: number }>,
  ) => {
    const acc = new Map<string, { label: string; sum: number; count: number }>();
    for (const r of rows) {
      for (const [key, cell] of Object.entries(pick(r) ?? {})) {
        if (!cell || typeof cell.score !== "number") continue;
        const cur = acc.get(key) ?? { label: cell.label ?? key, sum: 0, count: 0 };
        cur.sum += cell.score;
        cur.count += 1;
        acc.set(key, cur);
      }
    }
    return [...acc.entries()].map(([key, v]) => ({
      key,
      label: v.label,
      mean: round1(v.sum / v.count),
    }));
  };

  const counts = new Map<number, number[]>();
  for (const r of rows) {
    for (const [id, value] of Object.entries(normalizeAnswers(r.answers))) {
      const qid = Number(id);
      if (!Number.isInteger(value) || value < 0 || value > 4) continue;
      const arr = counts.get(qid) ?? [0, 0, 0, 0, 0];
      arr[value] += 1;
      counts.set(qid, arr);
    }
  }
  const questions = [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([id, c]) => {
      const total = c.reduce((s, x) => s + x, 0);
      const sum = c.reduce((s, x, i) => s + x * i, 0);
      return {
        id,
        responses: total,
        mean: total > 0 ? round1(sum / total) : null,
        counts: c,
        percentages: c.map((x) => (total > 0 ? round1((x / total) * 100) : 0)),
      };
    });

  const lastUpdatedAt = rows
    .map((r) => r.created_at)
    .sort()
    .at(-1) ?? null;

  return {
    n,
    globalScore: round1(rows.reduce((s, r) => s + Number(r.global_score || 0), 0) / n),
    factors: cellMean((r) => r.factors),
    domains: cellMean((r) => r.domains),
    questions,
    lastUpdatedAt,
  };
}

export async function handleIsgResultsRequest(req: Request) {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(GENERIC_DENY, 405);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return json(GENERIC_DENY, 200);
  }

  // ─── Login administrativo ───
  if (body.action === "login") {
    const role: IsgResultsRole | null =
      body.scope === "results" ? "admin" :
      body.scope === "presentation" ? "ift" : null;
    const secret = secretForRole(role);
    const candidate = typeof body.password === "string" && body.password.length <= 256
      ? body.password
      : "";
    // Custo fixo: uniformiza latência e reduz utilidade de força bruta.
    // Ponto de extensão para rate limiting persistente.
    await new Promise((r) => setTimeout(r, 300));
    if (!role || !secret || !candidate || !safeEqual(candidate.trim(), secret.trim())) {
      return json(GENERIC_DENY, 200);
    }
    const session = await issueToken(secret, role);
    return json({ ok: true, ...session });
  }

  // Valida o acesso à apresentação histórica sem consultar respostas ou agregados.
  if (body.action === "validate-session") {
    const role = sessionRole(body.token);
    const secret = role === "ift" ? secretForRole(role) : undefined;
    if (!secret) return json(GENERIC_DENY, 401);
    if (!(await verifyToken(body.token, secret))) return json(GENERIC_DENY, 401);
    const expiresAt = Number(String(body.token).split(".")[1]);
    if (!Number.isFinite(expiresAt)) return json(GENERIC_DENY, 401);
    return json({ ok: true, authorized: true, role, expiresAt });
  }

  // ─── Agregados (exige sessão válida) ───
  if (body.action === "aggregates") {
    const role = sessionRole(body.token);
    const secret = secretForRole(role);
    if (!secret) return json(GENERIC_DENY, 401);
    if (!(await verifyToken(body.token, secret))) return json(GENERIC_DENY, 401);

    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return json({ ok: false, error: "Backend indisponível." }, 500);

    const res = await fetch(
      `${url}/rest/v1/isg_pilot_responses?cohort=eq.isg&select=answers,global_score,factors,domains,created_at`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) {
      console.error("Falha ao ler agregados:", res.status);
      return json({ ok: false, error: "Backend indisponível." }, 502);
    }
    const rows = (await res.json()) as Row[];

    if (rows.length < K_THRESHOLD) {
      return json({
        ok: true,
        threshold: K_THRESHOLD,
        suppressed: true,
        nLabel: rows.length === 0 ? "0" : `< ${K_THRESHOLD}`,
        status: "Pesquisa oficial",
      });
    }

    return json({
      ok: true,
      threshold: K_THRESHOLD,
      suppressed: false,
      status: "Pesquisa oficial",
      ...aggregate(rows),
    });
  }

  return json(GENERIC_DENY, 400);
}

serve(handleIsgResultsRequest);
