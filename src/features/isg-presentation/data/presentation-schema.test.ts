import { describe, expect, it } from "vitest";
import {
  adaptCurrentAggregate,
  createSyntheticDemo,
} from "./presentation-adapter";
import { presentationSchema, tiedExtremes } from "./presentation-schema";
import { syncMessageSchema } from "./presentation-sync";

describe("contrato privado da apresentação — dados exclusivamente sintéticos", () => {
  it("preserva ausência sem substituir por zero", () => {
    const result = adaptCurrentAggregate({
      threshold: 7,
      suppressed: false,
      status: "Fictício",
      n: 18,
      questions: [
        {
          id: 1,
          responses: 0,
          mean: null,
          counts: [0, 0, 0, 0, 0],
          percentages: [0, 0, 0, 0, 0],
        },
      ],
    });
    expect(result.globalScore).toBeNull();
    expect(result.issuedAt).toBeNull();
    expect(result.instrumentVersion).toBeNull();
    expect(result.questions[0].mean).toBeNull();
  });
  it.each([
    [
      "campo inesperado",
      (s: ReturnType<typeof createSyntheticDemo>) => ({
        ...s,
        token: "fictício",
      }),
    ],
    [
      "ID duplicado",
      (s: ReturnType<typeof createSyntheticDemo>) => ({
        ...s,
        questions: [s.questions[0], s.questions[0]],
      }),
    ],
    [
      "valor infinito",
      (s: ReturnType<typeof createSyntheticDemo>) => ({
        ...s,
        globalScore: Infinity,
      }),
    ],
    [
      "valor fora de escala",
      (s: ReturnType<typeof createSyntheticDemo>) => ({
        ...s,
        domains: [{ ...s.domains[0], mean: -1 }],
      }),
    ],
    [
      "domínio desconhecido",
      (s: ReturnType<typeof createSyntheticDemo>) => ({
        ...s,
        domains: [{ ...s.domains[0], key: "inventado" }],
      }),
    ],
    [
      "base abaixo do limiar",
      (s: ReturnType<typeof createSyntheticDemo>) => ({ ...s, n: 2 }),
    ],
    [
      "dados com supressão",
      (s: ReturnType<typeof createSyntheticDemo>) => ({
        ...s,
        suppressed: true,
      }),
    ],
    [
      "enunciado alterado",
      (s: ReturnType<typeof createSyntheticDemo>) => ({
        ...s,
        questions: [{ ...s.questions[0], text: "Texto modificado" }],
      }),
    ],
    [
      "data impossível",
      (s: ReturnType<typeof createSyntheticDemo>) => ({
        ...s,
        issuedAt: "2026-02-31",
      }),
    ],
  ])("rejeita %s", (_, change) =>
    expect(
      presentationSchema.safeParse(change(createSyntheticDemo())).success,
    ).toBe(false),
  );
  it("confere contagens, denominadores e arredondamento explícito", () => {
    const s = createSyntheticDemo();
    s.questions[0] = {
      ...s.questions[0],
      mean: 2,
      responses: 3,
      counts: [1, 0, 1, 0, 1],
      percentages: [33.3, 0, 33.3, 0, 33.3],
    };
    expect(presentationSchema.safeParse(s).success).toBe(true);
    s.questions[0].percentages[0] = 34;
    expect(presentationSchema.safeParse(s).success).toBe(false);
    s.questions[0].percentages = undefined;
    s.questions[0].counts = [2, 0, 1, 0, 1];
    expect(presentationSchema.safeParse(s).success).toBe(false);
  });
  it("suprime todo resultado ainda que uma resposta da API inclua valores indevidos", () => {
    const result = adaptCurrentAggregate({
      threshold: 7,
      suppressed: true,
      status: "Fictício",
      n: 2,
      globalScore: 88,
      domains: [{ key: "saude", label: "Saúde", mean: 3 }],
    });
    expect(result.n).toBeNull();
    expect(result.globalScore).toBeNull();
    expect(result.domains).toEqual([]);
  });
  it("preserva todos os empates nos extremos", () => {
    const result = tiedExtremes([
      { key: "a", label: "A", mean: 2.2 },
      { key: "b", label: "B", mean: 2.2 },
      { key: "c", label: "C", mean: null },
      { key: "d", label: "D", mean: 3.2 },
    ]);
    expect(result.lowest.map((c) => c.key)).toEqual(["a", "b"]);
  });
  it("não aceita dados, notas ou tokens no canal de sincronização", () => {
    expect(
      syncMessageSchema.safeParse({ v: 1, type: "navigate", slideId: "global" })
        .success,
    ).toBe(true);
    expect(
      syncMessageSchema.safeParse({
        v: 1,
        type: "navigate",
        slideId: "desconhecido",
      }).success,
    ).toBe(false);
    for (const field of ["token", "snapshot", "notes"])
      expect(
        syncMessageSchema.safeParse({
          v: 1,
          type: "state",
          slideId: "global",
          mode: "slides",
          sourceKind: "synthetic_demo",
          [field]: "não permitido",
        }).success,
      ).toBe(false);
  });
});
