import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { FIBA_ITEMS, FIBA_MAP_HASH, FIBA_CONTENT_HASH, FIBA_ID, FIBA_VERSION, FibaValidationError, isCanonicalFiba, scoreFiba, validateFiba } from "./index";
import { createFibaHandler } from "../../../supabase/functions/_shared/fiba-handler";
import { FIBT_ITEMS, INSTRUMENT_ID } from "../fibt";

const entries = (value: number) => FIBA_ITEMS.map(q => ({ id: q.id, answer: value }));
const digest = (s: string) => createHash("sha256").update(s).digest("hex");

describe("FIB-A source and scoring", () => {
  it("keeps a distinct 29-item matrix without changing the 32-item occupational instrument", () => {
    expect(INSTRUMENT_ID).toBe("FIB-T"); expect(FIBT_ITEMS).toHaveLength(32);
    expect(FIBA_ID).toBe("FIB-A"); expect(FIBA_ITEMS).toHaveLength(29);
    expect(FIBA_ITEMS.map(q => q.id)).toEqual(Array.from({ length: 29 }, (_, i) => i + 1));
    expect([1, 2, 3].map(f => FIBA_ITEMS.filter(q => q.factor === f).length)).toEqual([9, 15, 5]);
    expect(digest(FIBA_ITEMS.map(i => `${i.id}:${i.domain}:${i.factor}`).join("|"))).toBe(FIBA_MAP_HASH);
    expect(digest(JSON.stringify(FIBA_ITEMS))).toBe(FIBA_CONTENT_HASH);
  });
  it.each([[0, 0], [2, 50], [4, 100]])("all %s produces global %s", (answer, global) => {
    const result = scoreFiba(entries(answer));
    expect(result.globalScore).toBe(global);
    expect(Object.values(result.domains).every(d => d.score === answer)).toBe(true);
    expect(Object.values(result.factors).every(f => f.score === answer)).toBe(true);
    expect(result.manifest.calculated_by).toBe("client_preview");
  });
  it("weights domains equally and averages factor items, rather than averaging domain means", () => {
    const data = entries(0).map(e => ({ ...e, answer: e.id <= 9 ? 4 : 0 }));
    expect(scoreFiba(data).globalScore).toBe(33.3);
    const one = entries(0); one[9].answer = 4;
    const result = scoreFiba(one);
    expect(result.domains.bem_estar.score).toBe(.8);
    expect(result.factors["2"].score).toBe(.27);
    expect(result.globalScore).toBe(2.2);
  });
  it("uses rounded domain means in global, matching the app operation order", () => {
    const one = entries(0); one[0].answer = 4;
    expect(scoreFiba(one).domains.padrao_vida.score).toBe(1.33);
    expect(scoreFiba(one).globalScore).toBe(3.7);
    const vector = [3, 1, 3, 1, 4, 4, 0, 3, 4, 4, 0, 0, 3, 1, 3, 1, 0, 2, 3, 2, 1, 3, 2, 2, 3, 2, 3, 2, 0];
    // Without domain rounding this vector yields 53.1; the app rule yields 53.0.
    expect(scoreFiba(entries(0).map((e, i) => ({ ...e, answer: vector[i] }))).globalScore).toBe(53);
  });
  it("does not reverse positively phrased item 14", () => {
    const data = entries(0); data[13].answer = 4;
    expect(scoreFiba(data).domains.bem_estar.score).toBe(.8);
  });
  it.each([undefined, null, "2", true, NaN, Infinity, -1, 5, 1.5])("rejects invalid answer %s without coercion", value => {
    const data = entries(2); data[0].answer = value as number;
    expect(() => validateFiba(data)).toThrow(FibaValidationError);
  });
  it("rejects missing, duplicate and unknown items", () => {
    expect(() => validateFiba(entries(2).slice(1))).toThrow();
    const duplicate = entries(2); duplicate[28].id = 1;
    expect(() => validateFiba(duplicate)).toThrow("duplicate_item");
    const unknown = entries(2); unknown[28].id = 30;
    expect(() => validateFiba(unknown)).toThrow("unknown_item");
  });
  it("requires the complete current server manifest and valid result cells", () => {
    const data = { ...scoreFiba(entries(2), "server"), completedAt: "2026-11-16T12:00:00Z" };
    expect(isCanonicalFiba(data)).toBe(true);
    expect(isCanonicalFiba({ ...data, manifest: { ...data.manifest, calculated_by: "client_preview" } })).toBe(false);
    expect(isCanonicalFiba({ ...data, manifest: { ...data.manifest, item_content_hash: "changed" } })).toBe(false);
    expect(isCanonicalFiba({ ...data, domains: {} })).toBe(false);
    expect(isCanonicalFiba({ ...data, globalScore: NaN })).toBe(false);
  });
});

describe("public student endpoint", () => {
  const origin = "https://pesquisadefelicidade.com.br";
  const handler = createFibaHandler([origin]);
  function request(body: unknown, extraHeaders = {}) {
    return new Request("https://example.test/fiba-student-score", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json", ...extraHeaders }, body: JSON.stringify(body) });
  }
  const payload = () => ({ instrumentId: FIBA_ID, instrumentVersion: FIBA_VERSION, answers: entries(2) });
  it("calculates a canonical no-store result without authentication or a database", async () => {
    const response = await handler(request(payload()));
    expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("access-control-allow-origin")).toBe(origin);
    const result = await response.json(); expect(isCanonicalFiba(result)).toBe(true); expect(result.globalScore).toBe(50);
    expect(result).not.toHaveProperty("answers");
  });
  it("handles CORS preflight and rejects unapproved browser origins", async () => {
    expect((await handler(new Request("https://example.test", { method: "OPTIONS", headers: { Origin: origin } }))).status).toBe(204);
    expect((await handler(request(payload(), { Origin: "https://unrelated.test" }))).status).toBe(403);
  });
  it("rejects occupational instrument, additional identifiers and oversized payloads", async () => {
    expect((await handler(request({ ...payload(), instrumentId: "FIB-T" }))).status).toBe(422);
    expect((await handler(request({ ...payload(), email: "synthetic@example.test" }))).status).toBe(400);
    expect((await handler(request({ ...payload(), extra: "x".repeat(9000) }))).status).toBe(413);
    const invalid = payload(); invalid.answers[0].answer = 5;
    const response = await handler(request(invalid)); expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ error: "value_out_of_scale", itemId: 1 });
  });
});
