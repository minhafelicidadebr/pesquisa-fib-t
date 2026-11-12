/** Sessão HMAC administrativa; nenhuma consulta a dados ou persistência. */
const SESSION_TTL_MS = 45 * 60 * 1000;

export function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  const len = Math.max(x.length, y.length);
  let diff = x.length ^ y.length;
  for (let i = 0; i < len; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function issueToken(
  secret: string,
): Promise<{ token: string; expiresAt: number }> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `isg-results.${expiresAt}`;
  return { token: `${expiresAt}.${await hmac(payload, secret)}`, expiresAt };
}

export async function verifyToken(
  token: unknown,
  secret: string,
): Promise<boolean> {
  if (typeof token !== "string" || token.length > 256) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [expStr, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || !sig) return false;
  if (Date.now() >= exp) return false;
  return safeEqual(sig, await hmac(`isg-results.${exp}`, secret));
}
