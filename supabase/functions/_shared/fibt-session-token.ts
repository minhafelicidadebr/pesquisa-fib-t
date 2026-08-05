/**
 * FIB-T — Session token management (shared module).
 *
 * Contrato de segurança:
 * - Token criado SOMENTE pelo backend (create-fibt-session)
 * - Gerado com crypto.getRandomValues (128 bits = 16 bytes)
 * - Codificado em hex (32 caracteres)
 * - Devolvido em texto puro APENAS uma vez, na emissão
 * - Persistido no banco SOMENTE como SHA-256 do token
 * - O cliente NÃO pode escolher, informar ou alterar o token de emissão
 * - O token NÃO aparece em logs
 *
 * Este módulo NÃO é importado por submit-fibt-response para geração.
 * submit-fibt-response usa APENAS hashSessionToken e validateSessionTokenFormat.
 */

/**
 * Gera um token de sessão criptograficamente seguro.
 * 128 bits (16 bytes) via crypto.getRandomValues, codificado como hex.
 * Usado SOMENTE pela Edge Function de emissão (create-fibt-session).
 */
export function generateSessionToken(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * Calcula SHA-256 hex de um token de sessão.
 * Usado para persistência (emissão) e lookup (submissão).
 */
export async function hashSessionToken(token: string): Promise<string> {
    const buf = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(token),
    );
    return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * Valida formato do token de sessão recebido do cliente.
 * Rejeita tokens que não correspondem ao formato de emissão (32 hex chars).
 * NÃO valida se o token existe — apenas formato.
 *
 * Retorna true se o formato é válido, false caso contrário.
 */
export function validateSessionTokenFormat(token: unknown): token is string {
    if (typeof token !== "string") return false;
    // Mínimo 32 hex chars (128 bits), máximo 64 (256 bits para futuras expansões)
    if (token.length < 32 || token.length > 64) return false;
    return /^[0-9a-f]+$/i.test(token);
}
