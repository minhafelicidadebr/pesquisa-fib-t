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
 * TOKEN DE SESSÃO — Contrato de segurança:
 * - Criado SOMENTE pelo backend (RPC/Edge Function de emissão)
 * - Gerado com crypto.getRandomValues (>= 128 bits = 16 bytes)
 * - Codificado em hex (32 chars) para transmissão
 * - Devolvido em texto puro APENAS uma vez, na emissão
 * - Persistido no banco SOMENTE como SHA-256 do token
 * - O cliente NÃO pode escolher, informar ou alterar o token de emissão
 * - O token NÃO aparece em logs
 *
 * CORS:
 * - FIBT_ENV=local → wildcard permitido
 * - FIBT_ENV=staging|production → FIBT_ALLOWED_ORIGIN obrigatório
 *   - Variável ausente → resposta sem headers CORS (browser rejeita)
 *   - Origem desconhecida → resposta sem headers CORS
 *
 * RATE LIMITING:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ P0 DE PRODUÇÃO — NÃO IMPLEMENTADO NESTA EDGE FUNCTION                  │
 * │ Implementar via API Gateway ou Supabase Edge Rate Limiting antes de     │
 * │ expor publicamente em produção. Contrato: max 60 req/min por IP.        │
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

// ── CORS Policy ──
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

    // Staging/production: fail-closed
    if (!FIBT_ALLOWED_ORIGIN) {
        return null; // Configuração ausente → sem CORS → browser rejeita
    }

    const allowedOrigins = FIBT_ALLOWED_ORIGIN.split(",").map((o) => o.trim());
    if (!requestOrigin || !allowedOrigins.includes(requestOrigin)) {
        return null; // Origem não autorizada
    }

    return {
        "Access-Control-Allow-Origin": requestOrigin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
            "authorization, x-client-info, apikey, content-type, x-idempotency-key",
        "Access-Control-Max-Age": "86400",
        Vary: "Origin",
    };
}

function jsonResponse(
    body: unknown,
    status: number,
    cors: Record<string, string> | null,
) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(cors || {}),
    };
    return new Response(JSON.stringify(body), { status, headers });
}

const MAX_BODY_BYTES = 8192;

async function sha256Hex(input: string): Promise<string> {
    const buf = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(input),
    );
    return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * Geração de token de sessão criptograficamente seguro.
 * 128 bits (16 bytes) de entropia via crypto.getRandomValues.
 * Codificado como hex (32 caracteres).
 * Usado APENAS pela função de emissão de sessão (não por esta função).
 */
export function generateSessionToken(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

serve(async (req) => {
    const requestOrigin = req.headers.get("origin");
    const cors = buildCorsHeaders(requestOrigin);

    // ── OPTIONS ──
    if (req.method === "OPTIONS") {
        if (!cors) {
            return new Response(null, { status: 204 });
        }
        return new Response(null, { status: 204, headers: cors });
    }

    // ── Somente POST ──
    if (req.method !== "POST") {
        return jsonResponse({ error: "method_not_allowed" }, 405, cors);
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
        for (const chunk of chunks) {
            merged.set(chunk, offset);
            offset += chunk.byteLength;
        }
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
            session_token?: string;
            answers?: unknown[];
            idempotency_key?: string;
        };

        // ── Validação de entrada ──
        if (!session_token || typeof session_token !== "string") {
            return jsonResponse({ error: "session_token_required" }, 400, cors);
        }

        // Token deve ser hex de 128+ bits (32+ hex chars)
        // Rejeita tokens curtos ou não-hex (indica token fabricado pelo cliente)
        if (session_token.length < 32 || !/^[0-9a-f]+$/i.test(session_token)) {
            return jsonResponse({ error: "invalid_session" }, 403, cors);
        }

        if (!answers || !Array.isArray(answers)) {
            return jsonResponse({ error: "answers_required" }, 400, cors);
        }

        // ── Hash do token (nunca armazena em texto puro, nunca loga) ──
        const tokenHash = await sha256Hex(session_token);

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

        // ── Lookup session by token_hash ──
        const { data: session, error: sessionError } = await supabase
            .from("fibt_public_sessions")
            .select("id")
            .eq("token_hash", tokenHash)
            .maybeSingle();

        if (sessionError || !session) {
            return jsonResponse({ error: "invalid_session" }, 403, cors);
        }

        // ── Hashes de idempotência ──
        let idempotencyKeyHash: string | null = null;
        if (idempotency_key && typeof idempotency_key === "string") {
            idempotencyKeyHash = await sha256Hex(idempotency_key);
        }

        const requestPayloadHash = await sha256Hex(JSON.stringify(answers));

        // ── Preparar scores ──
        const factorScores: Record<string, number> = {};
        for (const [key, cell] of Object.entries(result.factors)) {
            factorScores[key] = cell.score;
        }

        const domainScores: Record<string, number> = {};
        for (const [key, cell] of Object.entries(result.domains)) {
            domainScores[key] = cell.score;
        }

        // ── Invocar RPC privada (service_role) ──
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
            ok: boolean;
            error?: string;
            idempotent?: boolean;
            response_id?: string;
        };

        if (!rpcData.ok) {
            const errorMap: Record<string, number> = {
                session_not_found: 403,
                session_already_submitted: 409,
                replay_conflict: 409,
                session_expired: 410,
                session_revoked: 403,
                campaign_not_found: 404,
                campaign_not_open: 409,
                company_mismatch: 403,
                sector_invalid: 422,
                sector_not_in_campaign: 422,
                instrument_version_mismatch: 422,
                manifest_hash_mismatch: 422,
            };
            const status = errorMap[rpcData.error || ""] || 400;
            return jsonResponse({ error: rpcData.error }, status, cors);
        }

        // ── Resultado individual (nunca retorna raw_answers) ──
        return jsonResponse(
            {
                ok: true,
                idempotent: rpcData.idempotent || false,
                result: {
                    globalScore: result.globalScore,
                    factors: result.factors,
                    domains: result.domains,
                    manifest: result.manifest,
                },
            },
            200,
            cors,
        );
    } catch {
        return jsonResponse({ error: "internal_error" }, 500, cors);
    }
});
