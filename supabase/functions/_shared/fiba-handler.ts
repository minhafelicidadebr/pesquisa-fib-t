import { FIBA_ID, FIBA_VERSION, FibaValidationError, scoreFiba } from "./fiba.ts";

/** Public, stateless calculation. No credentials, outbound calls, persistence or payload logging. */
export function createFibaHandler(allowedOrigins: readonly string[]) {
  // Best-effort per-isolate burst control, not a distributed rate limit. Stores no identifiers.
  let budget = 120;
  let lastRefill = Date.now();
  return async (req: Request): Promise<Response> => {
    const origin = req.headers.get("origin");
    const permitted = !origin || allowedOrigins.includes(origin);
    const headers: Record<string, string> = {
      "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff", "Vary": "Origin",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    };
    if (origin && permitted) headers["Access-Control-Allow-Origin"] = origin;
    const reply = (status: number, data: unknown) => new Response(JSON.stringify(data), { status, headers });
    if (!permitted) return reply(403, { error: "origin_not_allowed" });
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (req.method !== "POST") return reply(405, { error: "method_not_allowed" });
    if (!/^application\/json(?:;|$)/i.test(req.headers.get("content-type") ?? "")) return reply(415, { error: "json_required" });
    const now = Date.now();
    budget = Math.min(120, budget + (now - lastRefill) / 500);
    lastRefill = now;
    if (budget < 1) return reply(429, { error: "try_later" });
    budget -= 1;
    try {
      if (Number(req.headers.get("content-length")) > 8192) return reply(413, { error: "payload_too_large" });
      const reader = req.body?.getReader();
      if (!reader) return reply(400, { error: "invalid_payload" });
      const chunks: Uint8Array[] = [];
      let size = 0;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 8192) { await reader.cancel(); return reply(413, { error: "payload_too_large" }); }
          chunks.push(value);
        }
      } finally { reader.releaseLock(); }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      const body = JSON.parse(new TextDecoder().decode(bytes));
      if (!body || typeof body !== "object" || Array.isArray(body) ||
          Object.keys(body).some(k => !["instrumentId", "instrumentVersion", "answers"].includes(k))) return reply(400, { error: "invalid_payload" });
      if (body.instrumentId !== FIBA_ID || body.instrumentVersion !== FIBA_VERSION) return reply(422, { error: "instrument_mismatch" });
      const result = scoreFiba(body.answers, "server");
      return reply(200, { ...result, completedAt: new Date().toISOString() });
    } catch (error) {
      if (error instanceof FibaValidationError) return reply(422, { error: error.code, itemId: error.itemId });
      return reply(400, { error: "invalid_payload" });
    }
  };
}
