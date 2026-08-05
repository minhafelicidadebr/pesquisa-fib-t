/**
 * Edge Function: submit-fibt-response
 *
 * Ponto de entrada público para submissão de respostas FIB-T organizacionais.
 *
 * Fluxo:
 *   cliente → esta Edge Function → validação + engine canônico → RPC service_role → persistência
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ O score é SEMPRE calculado aqui, no servidor. Nunca aceito do cliente.  │
 * │ company_id, campaign_id e sector_id são derivados da sessão validada.   │
 * │ raw_answers NUNCA são logados nem enviados a nenhum LLM.                │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * CORS:
 * - FIBT_ENV=local → wildcard
 * - FIBT_ENV=staging|production → FIBT_ALLOWED_ORIGIN obrigatório
 *   - Ausente → 403 antes de processar
 *   - Origem desconhecida → 403 antes de processar
 *
 * RATE LIMITING:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ P0 DE PRODUÇÃO — NÃO IMPLEMENTADO                                      │
 * │ Implementar via API Gateway antes de exposição pública em produção.     │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
    FibtScoringError,
    INSTRUMENT_VERSION,
    ITEM_MAP_HASH,
    SCORING_ENGINE_VERSION,
    scoreFibt,
} from "../_shared/fibt-engine.ts";
import { hashSessionToken, validateSessionTokenFormat } from "../_shared/fibt-session-token.ts";
import {
    computeCanonicalPayloadHash,
    validateIdempotencyKey,
    CanonicalHashError,
} from "../_shared/fibt-canonical-hash.ts";

// ── CORS ──
const FIBT_ENV = Deno.env.get("FIBT_ENV") || "local";
const FIBT_ALLOWED_ORIGIN = Deno.env.get("FIBT_ALLOWED_ORIGIN");

function buildCorsHeaders(requestOrigin: string | null): Record<string, string> | null {
    if (FIBT_ENV === "local") {
        return {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers":
                "authorization, x-client-info, apikey, content-type, x-idempotency-key",
            "Access-Control-Max-Age": "86400",
        };
    }
    if (!FIBT_ALLOWED_ORIGIN) return null;
    const allowed = FIBT_ALLOWED_ORIGIN.split(",").map((o) => o.trim());
    if (!requestOrigin || !allowed.includes(requestOrigin)) return null;
    return {
        "Access-Control-Allow-Origin": requestOrigin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
            "authorization, x-client-info, apikey, content-type, x-idempotency-key",
        "Access-Control-Max-Age": "86400",
        Vary: "Origin",
    };
}

function jsonResponse(body: unknown, status: number, cors: Record<string, string> | null) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...(cors || {}) },
    });
}

const MAX_BODY_BYTES = 8192;

serve(async (req) => {
    const requestOrigin = req.headers.get("origin");
    const cors = buildCorsHeaders(requestOrigin);

    // ── OPTIONS ──
    if (req.method === "OPTIONS") {
        if (!cors) return new Response(null, { status: 403 });
        return new Response(null, { status: 204, headers: cors });
    }

    // ── Somente POST ──
    if (req.method !== "POST") {
        return jsonResponse({ error: "method_not_allowed" }, 405, cors);
    }

    // ── CORS fail-closed em staging/production ──
    if (FIBT_ENV !== "local" && !cors) {
        return new Response(JSON.stringify({ error: "origin_not_allowed" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
        });
    }

    // ── Rejeição antecipada por Content-Length ──
    const declaredLength = parseInt(req.headers.get("content-length") || "0", 10);
    if (declaredLength > MAX_BODY_BYTES) {
        return jsonResponse({ error: "payload_too_large" }, 413, cors);
    }

    // ── Ler body com limite real de bytes ──
    let rawBody: string;
    try {
        const reader = req.body?.getReader();
        if (!reader) return jsonResponse({ error: "empty_body" }, 400, cors);
        const chunks: Uint8Array[] = [];
        let totalBytes = 0;
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            totalBytes += value.byteLength;
            if (totalBytes > MAX_BODY_BYTES) {
                reader.cancel();
                return jsonResponse({ error: "payload_too_large" }, 413, cors);
            }
            chunks.push(value);
        }
        const merged = new Uint8Array(totalBytes);
        let offset = 0;
        for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.byteLength; }
        rawBody = new TextDecoder().decode(merged);
    } catch {
        return jsonResponse({ error: "invalid_body" }, 400, cors);
    }

    if (!rawBody || rawBody.trim().length === 0) {
        return jsonResponse({ error: "empty_body" }, 400, cors);
    }

    // ── Parse JSON ──
    let body: Record<string, unknown>;
    try {
        body = JSON.parse(rawBody);
        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return jsonResponse({ error: "invalid_json" }, 400, cors);
        }
    } catch {
        return jsonResponse({ error: "invalid_json" }, 400, cors);
    }

    try {
        const { session_token, answers, idempotency_key } = body as {
            session_token?: unknown;
            answers?: unknown[];
            idempotency_key?: unknown;
        };

        // ── Validar session_token ──
        if (!validateSessionTokenFormat(session_token)) {
            return jsonResponse({ error: "invalid_session" }, 403, cors);
        }

        if (!answers || !Array.isArray(answers)) {
            return jsonResponse({ error: "answers_required" }, 400, cors);
        }

        // ── Validar e calcular idempotency_key ──
        let idempotencyKeyHash: string | null = null;
        if (idempotency_key !== undefined && idempotency_key !== null) {
            try {
                const validKey = validateIdempotencyKey(idempotency_key);
                const buf = await crypto.subtle.digest(
                    "SHA-256",
                    new TextEncoder().encode(validKey),
                );
                idempotencyKeyHash = Array.from(new Uint8Array(buf))
                    .map((b) => b.toString(16).padStart(2, "0"))
                    .join("");
            } catch (e) {
                if (e instanceof CanonicalHashError) {
                    return jsonResponse({ error: "invalid_idempotency_key" }, 400, cors);
                }
                throw e;
            }
        }

        // ── Hash do token ──
        const tokenHash = await hashSessionToken(session_token);

        // ── Calcular canonical payload hash ──
        let requestPayloadHash: string;
        try {
            requestPayloadHash = await computeCanonicalPayloadHash(answers);
        } catch (e) {
            if (e instanceof CanonicalHashError) {
                return jsonResponse({ error: "invalid_answers", detail: e.message }, 422, cors);
            }
            throw e;
        }

        // ── Validar e calcular com engine canônico ──
        let result;
        try {
            result = scoreFibt(answers as { id: number; answer: number }[], {
                instrumentId: "FIB-T",
                instrumentVersion: INSTRUMENT_VERSION,
            });
        } catch (err) {
            if (err instanceof FibtScoringError) {
                return jsonResponse(
                    { error: "invalid_answers", issues: err.issues.map((i) => i.code) },
                    422,
                    cors,
                );
            }
            throw err;
        }

        // ── Supabase client (service_role) ──
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        if (!supabaseUrl || !serviceRoleKey) {
            return jsonResponse({ error: "server_configuration_error" }, 500, cors);
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        // ── Lookup session ──
        const { data: session, error: sessionError } = await supabase
            .from("fibt_public_sessions")
            .select("id")
            .eq("token_hash", tokenHash)
            .maybeSingle();

        if (sessionError || !session) {
            return jsonResponse({ error: "invalid_session" }, 403, cors);
        }

        // ── Preparar scores ──
        const factorScores: Record<string, number> = {};
        for (const [key, cell] of Object.entries(result.factors)) {
            factorScores[key] = cell.score;
        }
        const domainScores: Record<string, number> = {};
        for (const [key, cell] of Object.entries(result.domains)) {
            domainScores[key] = cell.score;
        }

        // ── RPC (service_role) ──
        const { data: rpcResult, error: rpcError } = await supabase.rpc(
            "submit_fibt_organizational_response",
            {
                _session_id: session.id,
                _token_hash: tokenHash,
                _instrument_version: INSTRUMENT_VERSION,
                _scoring_engine_version: SCORING_ENGINE_VERSION,
                _manifest_hash: ITEM_MAP_HASH,
                _raw_answers: answers,
                _global_score: result.globalScore,
                _factor_scores: factorScores,
                _domain_scores: domainScores,
                _idempotency_key_hash: idempotencyKeyHash,
                _request_payload_hash: requestPayloadHash,
            },
        );

        if (rpcError) {
            return jsonResponse({ error: "submission_failed" }, 500, cors);
        }

        const rpcData = rpcResult as {
            ok: boolean; error?: string; idempotent?: boolean; response_id?: string;
        };

        if (!rpcData.ok) {
            const errorMap: Record<string, number> = {
                session_not_found: 403, replay_conflict: 409,
                session_already_submitted: 409, session_expired: 410,
                session_revoked: 403, campaign_not_found: 404,
                campaign_not_open: 409, company_mismatch: 403,
                sector_invalid: 422, sector_not_in_campaign: 422,
                instrument_version_mismatch: 422, manifest_hash_mismatch: 422,
            };
            return jsonResponse({ error: rpcData.error }, errorMap[rpcData.error || ""] || 400, cors);
        }

        // ── Resultado (nunca retorna raw_answers) ──
        return jsonResponse({
            ok: true,
            idempotent: rpcData.idempotent || false,
            result: {
                globalScore: result.globalScore,
                factors: result.factors,
                domains: result.domains,
                manifest: result.manifest,
            },
        }, 200, cors);
    } catch {
        return jsonResponse({ error: "internal_error" }, 500, cors);
    }
});
