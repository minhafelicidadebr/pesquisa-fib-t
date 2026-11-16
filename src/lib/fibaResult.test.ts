import { afterEach, describe, expect, it, vi } from "vitest";
import { FIBA_ITEMS, isCanonicalFiba, isReportableFiba, scoreFiba } from "@/domain/fiba";
import { submitFibaAnswers } from "./fibaResult";

const answers = (value: number) => Object.fromEntries(FIBA_ITEMS.map(item => [item.id, value]));
afterEach(() => vi.unstubAllGlobals());

describe("participant result without an external scoring dependency", () => {
  it("works with the network unavailable and honestly identifies local calculation", async () => {
    const fetch = vi.fn().mockRejectedValue(new Error("network unavailable"));
    vi.stubGlobal("fetch", fetch);
    const result = await submitFibaAnswers(answers(2));
    expect(fetch).not.toHaveBeenCalled();
    expect(result.globalScore).toBe(50);
    expect(Object.values(result.domains).every(d => d.score === 2)).toBe(true);
    expect(result.manifest.calculated_by).toBe("client_local");
    expect(isReportableFiba(result)).toBe(true);
    expect(isCanonicalFiba(result)).toBe(false);
    expect(Number.isFinite(Date.parse(result.completedAt))).toBe(true);
  });
  it("matches the shared server engine, including nonuniform values and domain rounding", async () => {
    const values = [3, 1, 3, 1, 4, 4, 0, 3, 4, 4, 0, 0, 3, 1, 3, 1, 0, 2, 3, 2, 1, 3, 2, 2, 3, 2, 3, 2, 0];
    const input = Object.fromEntries(FIBA_ITEMS.map((q, i) => [q.id, values[i]]));
    const local = await submitFibaAnswers(input);
    const server = scoreFiba(FIBA_ITEMS.map(q => ({ id: q.id, answer: input[q.id] })), "server");
    expect(local.globalScore).toBe(53);
    expect(local.globalScore).toBe(server.globalScore);
    expect(local.domains).toEqual(server.domains);
    expect(local.factors).toEqual(server.factors);
    expect(local.manifest).toEqual({ ...server.manifest, calculated_by: "client_local" });
  });
  it.each([0, 4])("accepts complete boundary answers %s", async value => {
    expect((await submitFibaAnswers(answers(value))).globalScore).toBe(value * 25);
  });
  it("rejects partial or invalid answers rather than generating a misleading report", async () => {
    const partial = answers(2); delete partial[29];
    await expect(submitFibaAnswers(partial)).rejects.toThrow("Confira as 29 respostas");
    await expect(submitFibaAnswers({ ...answers(2), 29: 5 })).rejects.toThrow("Confira as 29 respostas");
    await expect(submitFibaAnswers({ ...answers(2), 30: 2 })).rejects.toThrow("Confira as 29 respostas");
  });
  it("does not accept synthetic previews or a forged origin as participant results", () => {
    const completedAt = "2026-11-16T12:00:00Z";
    const preview = { ...scoreFiba(FIBA_ITEMS.map(q => ({ id: q.id, answer: 2 }))), completedAt };
    expect(isReportableFiba(preview)).toBe(false);
    expect(isReportableFiba({ ...preview, manifest: { ...preview.manifest, calculated_by: "unknown" } })).toBe(false);
    expect(isReportableFiba({ ...preview, manifest: { ...preview.manifest, calculated_by: "client_local", item_map_hash: "wrong" } })).toBe(false);
  });
});
