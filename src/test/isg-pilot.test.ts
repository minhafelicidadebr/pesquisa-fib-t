import { describe, expect, it } from "vitest";
import { FIBT_ITEMS } from "@/domain/fibt";
import { buildAnswerRows, buildAnswersCsv } from "@/lib/isgCsv";

/** Respostas sintéticas — nunca dados reais de participantes. */
const syntheticAnswers = Object.fromEntries(
  FIBT_ITEMS.map((i, idx) => [i.id, idx % 5]),
) as Record<number, number>;

describe("ISG — tabela e exportação de respostas", () => {
  it("cobre exatamente as 32 questões canônicas na ordem do instrumento", () => {
    const rows = buildAnswerRows(syntheticAnswers);
    expect(rows).toHaveLength(32);
    expect(rows[0].question).toBe(FIBT_ITEMS[0].text);
    expect(rows.map((r) => r.number)).toEqual(
      Array.from({ length: 32 }, (_, i) => i + 1),
    );
  });

  it("rotula a escala Likert sem inventar interpretação por item", () => {
    const rows = buildAnswerRows(syntheticAnswers);
    expect(rows[0].answerLabel).toBe("Discordo totalmente");
    expect(rows[4].answerLabel).toBe("Concordo totalmente");
    expect(Object.keys(rows[0])).not.toContain("classification");
  });

  it("gera CSV com cabeçalho, 32 linhas e sem metadados técnicos", () => {
    const csv = buildAnswersCsv(buildAnswerRows(syntheticAnswers));
    const lines = csv.replace(/^\uFEFF/, "").split("\r\n");
    expect(lines).toHaveLength(33);
    expect(lines[0]).toBe("Nº;Questão;Resposta;Escala (0-4);Fator;Domínio");
    for (const forbidden of [
      "session_token",
      "user_id",
      "company_id",
      "campaign_id",
      "sector_id",
    ]) {
      expect(csv).not.toContain(forbidden);
    }
  });

  it("escapa separadores e aspas nos textos das questões", () => {
    const csv = buildAnswersCsv([
      {
        number: 1,
        question: 'Texto com ; e "aspas"',
        answerValue: 2,
        answerLabel: "Neutro",
        factor: "F",
        domain: "D",
      },
    ]);
    expect(csv).toContain('"Texto com ; e ""aspas"""');
  });
});
