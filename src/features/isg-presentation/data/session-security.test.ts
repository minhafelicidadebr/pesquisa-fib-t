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
  sessionRole,
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
    const session = await issueToken("segredo-sintetico-de-teste", "ift");
    expect(await verifyToken(session.token, "segredo-sintetico-de-teste")).toBe(
      true,
    );
    expect(session.role).toBe("ift");
    expect(sessionRole(session.token)).toBe("ift");
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
  it("assina e separa os papéis de resultados e apresentação", async () => {
    const admin = await issueToken("senha-admin-sintetica", "admin");
    const ift = await issueToken("senha-ift-sintetica", "ift");

    expect(sessionRole(admin.token)).toBe("admin");
    expect(sessionRole(ift.token)).toBe("ift");
    expect(await verifyToken(admin.token, "senha-admin-sintetica")).toBe(true);
    expect(await verifyToken(ift.token, "senha-ift-sintetica")).toBe(true);
    expect(await verifyToken(admin.token, "senha-ift-sintetica")).toBe(false);
    expect(await verifyToken(ift.token, "senha-admin-sintetica")).toBe(false);
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
