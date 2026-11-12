import { webcrypto } from "node:crypto";
import {
  afterAll,
  beforeAll,
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  issueToken,
  verifyToken,
} from "../../../../supabase/functions/isg-results/session";

describe("sessão administrativa — credencial exclusivamente sintética", () => {
  beforeAll(() => vi.stubGlobal("crypto", webcrypto));
  afterAll(() => vi.unstubAllGlobals());
  afterEach(() => vi.useRealTimers());
  it("valida assinatura e expiração sem qualquer leitura de rede", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
    const fetch = vi.spyOn(globalThis, "fetch");
    const session = await issueToken("segredo-sintetico-de-teste");
    expect(await verifyToken(session.token, "segredo-sintetico-de-teste")).toBe(
      true,
    );
    expect(await verifyToken(session.token, "outro-segredo-ficticio")).toBe(
      false,
    );
    expect(
      await verifyToken(`${session.token}.extra`, "segredo-sintetico-de-teste"),
    ).toBe(false);
    vi.setSystemTime(session.expiresAt);
    expect(await verifyToken(session.token, "segredo-sintetico-de-teste")).toBe(
      false,
    );
    expect(fetch).not.toHaveBeenCalled();
    fetch.mockRestore();
  });
  it.each([null, {}, "", "NaN.signature", "1.signature", "x".repeat(300)])(
    "recusa token malformado",
    async (token) => {
      expect(await verifyToken(token, "segredo-sintetico-de-teste")).toBe(
        false,
      );
    },
  );
});
