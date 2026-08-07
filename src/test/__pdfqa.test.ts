import { describe, it, expect } from "vitest";
import fs from "node:fs";
import JsPDF from "jspdf";
import { generateIsgAggregatePdf } from "@/lib/isgAggregatePdf";
import { generateIsgPdf } from "@/lib/isgPdf";
import type { IsgAggregate } from "@/lib/isgAggregate";
import { FIBT_ITEMS } from "@/domain/fibt/instrument";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(JsPDF as any).API.save = function (this: any, name: string) {
  fs.writeFileSync(`/tmp/pdfqa/${name}`, Buffer.from(this.output("arraybuffer")));
  return this;
};

const domains = [
  "Saúde", "Equilíbrio", "Vitalidade", "Padrão de Vida", "Governança",
  "Cultura", "Aprendizagem", "Comunidade", "Meio Ambiente",
];

const agg: IsgAggregate = {
  suppressed: false,
  threshold: 7,
  n: 24,
  nLabel: "24",
  status: "Coleta em andamento",
  lastUpdatedAt: new Date().toISOString(),
  globalScore: 62.4,
  factors: [
    { key: "f1", label: "Padrão de Vida", mean: 2.71 },
    { key: "f2", label: "Bem-Estar", mean: 2.44 },
    { key: "f3", label: "Satisfação com a Empresa", mean: 3.02 },
  ],
  domains: domains.map((d, i) => ({ key: `d${i}`, label: d, mean: 1.8 + (i % 5) * 0.4 })),
  questions: FIBT_ITEMS.map((it, i) => ({
    id: it.id,
    number: i + 1,
    text: it.text,
    factor: it.factor,
    domain: it.domain,
    mean: 1.5 + (i % 6) * 0.4,
    counts: [3, 5, 6, 6, 4],
    percentages: [12, 21, 25, 25, 17],
  })),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

describe("ISG PDF QA", () => {
  it("gera os dois relatórios", async () => {
    fs.mkdirSync("/tmp/pdfqa", { recursive: true });
    await generateIsgAggregatePdf(agg);
    await generateIsgPdf({
      globalScore: 62.4,
      completedAt: new Date().toISOString(),
      summary:
        "Sua autopercepção indica equilíbrio entre os fatores, com maior expressão em Satisfação com a Empresa.",
      factors: {
        f1: { label: "Padrão de Vida", score: 2.71, max: 4 },
        f2: { label: "Bem-Estar", score: 2.44, max: 4 },
        f3: { label: "Satisfação com a Empresa", score: 3.02, max: 4 },
      },
      domains: Object.fromEntries(
        domains.map((d, i) => [`d${i}`, { label: d, score: 1.8 + (i % 5) * 0.4, max: 4 }]),
      ),
      strengths: ["Vitalidade", "Cultura organizacional"],
      vulnerabilities: ["Equilíbrio entre trabalho e vida", "Aprendizagem"],
      recommendations: [
        { domain: "Equilíbrio", action: "Observar como os limites de jornada aparecem na sua rotina." },
        { domain: "Aprendizagem", action: "Registrar oportunidades de desenvolvimento percebidas." },
      ],
      limitations: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(fs.existsSync("/tmp/pdfqa/painel-executivo-fibt-isg.pdf")).toBe(true);
    expect(fs.existsSync("/tmp/pdfqa/relatorio-fibt-isg.pdf")).toBe(true);
  });
});
