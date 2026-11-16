import { describe, expect, it } from "vitest";
import { FIBA_ITEMS, scoreFiba } from "@/domain/fiba";
import { buildFibaNarrative, fibaCalculationOriginLabel } from "./narrative";
const entries = (value: number) => FIBA_ITEMS.map(q => ({ id: q.id, answer: value }));

describe("FIB-A descriptive narrative", () => {
  it.each([0, 2, 4])("describes tied domains at %s without inventing a weaker domain", value => {
    const result = scoreFiba(entries(value));
    const narrative = buildFibaNarrative(result);
    expect(narrative.domainPerspective).toContain("a mesma média");
    expect(narrative.domainPerspective).toContain(`${value},00 de 4`);
    expect(narrative.domainPerspective).not.toContain("A menor");
    expect(narrative.reflectionQuestions).toHaveLength(3);
  });
  it("describes all tied extremes from the supplied scores and selects reflection in instrument order", () => {
    const result = scoreFiba(entries(2));
    result.domains.saude.score = 4;
    result.domains.meio_ambiente.score = 4;
    result.domains.uso_tempo.score = 0;
    const narrative = buildFibaNarrative(result);
    expect(narrative.domainPerspective).toContain("Saúde e Meio Ambiente");
    expect(narrative.domainPerspective).toContain("4,00 de 4");
    expect(narrative.domainPerspective).toContain("0,00 de 4, em Uso do Tempo");
    expect(narrative.reflectionQuestions[0]).toContain("tempo para estudar");
    // The writer consumes the confirmed result and does not recalculate its global.
    expect(narrative.summary).toContain("50,0 de 100");
  });
  it("uses the same source order when the lowest mean is tied", () => {
    const result = scoreFiba(entries(2));
    result.domains.cultura.score = 1;
    result.domains.padrao_vida.score = 1;
    const narrative = buildFibaNarrative(result);
    expect(narrative.domainPerspective).toContain("Padrão de Vida e Cultura");
    expect(narrative.reflectionQuestions[0]).toContain("dignidade");
  });
  it("identifies local, server and synthetic calculations without pretending one is another", () => {
    expect(fibaCalculationOriginLabel("client_local")).toBe("Cálculo neste dispositivo");
    expect(fibaCalculationOriginLabel("server")).toBe("Cálculo no servidor");
    expect(fibaCalculationOriginLabel("client_preview")).toBe("Prévia local sintética");
    expect(fibaCalculationOriginLabel("unexpected")).toContain("não reconhecida");
  });
});
