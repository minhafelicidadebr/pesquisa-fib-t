/**
 * Edge Function: create-fibt-session
 *
 * Emissão de sessões públicas FIB-T para pesquisa organizacional.
 *
 * Fluxo:
 *   participante → código organizacional → esta função → sessão + token
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ O token é gerado aqui com crypto.getRandomValues (128 bits).            │
 * │ Apenas o SHA-256 é persistido. O texto puro é retornado uma única vez.  │
 * │ O cliente NÃO escolhe o token.                                          │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * CORS: mesma política de submit-fibt-response.
 * Rate limiting: P0 DE PRODUÇÃO — NÃO IMPLEMENTADO.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { generateSessionToken, hashSessionToken } from "../_shared/fibt-session-token.ts";

// ── CORS ──
const FIBT_ENV = Deno.env.get("FIBT_ENV") || "local";
const FIBT_ALLOWED_ORIGIN = Deno.env.get("FIBT_ALLOWED_ORIGIN");

function buildCorsHeaders(requestOrigin: string | null): Record<string, string> | null {
    if (FIBT_ENV === "local") {
        return {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
            "Access-Control-Max-Age": "86400",
        };
    }
    if (!FIBT_ALLOWED_ORIGIN) return null;
    const allowed = FIBT_ALLOWED_ORIGIN.split(",").map((o) => o.trim());
    if (!requestOrigin || !allowed.includes(requestOrigin)) return null;
    return {
        "Access-Control-Allow-Origin": requestOrigin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

const MAX_BODY_BYTES = 1024;
const SESSION_EXPIRY_HOURS = 4;

serve(async (req) => {
    const requestOrigin = req.headers.get("origin");
    const cors = buildCorsHeaders(requestOrigin);

    if (req.method === "OPTIONS") {
        if (!cors) return new Response(null, { status: 403 });
        return new Response(null, { status: 204, headers: cors });
    }

    if (req.method !== "POST") {
        return jsonResponse({ error: "method_not_allowed" }, 405, cors);
    }

    if (FIBT_ENV !== "local" && !cors) {
        return new Response(JSON.stringify({ error: "origin_not_allowed" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
        });
    }

    const declaredLength = parseInt(req.headers.get("content-length") || "0", 10);
    if (declaredLength > MAX_BODY_BYTES) {
        return jsonResponse({ error: "payload_too_large" }, 413, cors);
    }

    let body: Record<string, unknown>;
    try {
        const text = await req.text();
        if (!text || text.trim().length === 0) {
            return jsonResponse({ error: "empty_body" }, 400, cors);
        }
        body = JSON.parse(text);
        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return jsonResponse({ error: "invalid_json" }, 400, cors);
        }
    } catch {
        return jsonResponse({ error: "invalid_json" }, 400, cors);
    }

    try {
        const { org_code, sector_id } = body as {
            org_code?: string;
            sector_id?: string;
        };

        // ── Validação de entrada ──
        if (!org_code || typeof org_code !== "string" || org_code.length > 50) {
            return jsonResponse({ error: "invalid_request" }, 400, cors);
        }

        if (!sector_id || typeof sector_id !== "string" || sector_id.length > 40) {
            return jsonResponse({ error: "invalid_request" }, 400, cors);
        }

        // ── Supabase (service_role) ──
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        if (!supabaseUrl || !serviceRoleKey) {
            return jsonResponse({ error: "server_configuration_error" }, 500, cors);
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        // ── Resolver organização pelo código ──
        const { data: company, error: companyError } = await supabase
            .from("companies")
            .select("id")
            .eq("invite_code", org_code)
            .maybeSingle();

        if (companyError || !company) {
            // Resposta genérica: não revelar se o código existe
            return jsonResponse({ error: "invalid_request" }, 400, cors);
        }

        // ── Localizar campanha FIB-T pública ativa (exatamente 1) ──
        const { data: campaigns, error: campError } = await supabase
            .from("fibt_campaigns")
            .select("id, instrument_version")
            .eq("company_id", company.id)
            .eq("status", "open")
            .eq("instrument_id", "FIB-T");

        if (campError || !campaigns || campaigns.length === 0) {
            // Nenhuma campanha ativa → fail-closed
            return jsonResponse({ error: "invalid_request" }, 400, cors);
        }

        if (campaigns.length > 1) {
            // Mais de uma campanha ativa → fail-closed (inconsistência)
            // Não deveria acontecer com o UNIQUE INDEX parcial, mas defesa em profundidade
            return jsonResponse({ error: "invalid_request" }, 400, cors);
        }

        const campaign = campaigns[0];

        // ── Validar setor habilitado na campanha ──
        const { data: sectorLink, error: sectorError } = await supabase
            .from("fibt_campaign_sectors")
            .select("sector_id")
            .eq("campaign_id", campaign.id)
            .eq("sector_id", sector_id)
            .maybeSingle();

        if (sectorError || !sectorLink) {
            return jsonResponse({ error: "invalid_request" }, 400, cors);
        }

        // ── Verificar que o setor pertence à empresa ──
        const { data: sector, error: secVerifyErr } = await supabase
            .from("company_sectors")
            .select("id")
            .eq("id", sector_id)
            .eq("company_id", company.id)
            .eq("status", "active")
            .maybeSingle();

        if (secVerifyErr || !sector) {
            return jsonResponse({ error: "invalid_request" }, 400, cors);
        }

        // ── Gerar token (backend only, crypto.getRandomValues) ──
        const token = generateSessionToken();
        const tokenHash = await hashSessionToken(token);

        // ── Persistir sessão ──
        const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

        const { error: insertError } = await supabase
            .from("fibt_public_sessions")
            .insert({
                token_hash: tokenHash,
                company_id: company.id,
                campaign_id: campaign.id,
                sector_id: sector_id,
                status: "active",
                expires_at: expiresAt,
            });

        if (insertError) {
            return jsonResponse({ error: "session_creation_failed" }, 500, cors);
        }

        // ── Retornar token puro (uma única vez) ──
        // Não revelar: IDs internos, contagens, nomes de empresa
        return jsonResponse({
            session_token: token,
            expires_at: expiresAt,
            instrument_version: campaign.instrument_version,
        }, 201, cors);
    } catch {
        return jsonResponse({ error: "internal_error" }, 500, cors);
    }
});
