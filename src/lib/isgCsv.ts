/**
 * Exportação CSV das respostas do PRÓPRIO participante.
 * Não inclui tokens, ids internos, company/campaign/sector ou metadados técnicos.
 */

import { FIBT_ITEMS, DOMAIN_LABELS, FACTOR_LABELS } from "@/domain/fibt";

export const LIKERT_LABELS: Record<number, string> = {
  0: "Discordo totalmente",
  1: "Discordo parcialmente",
  2: "Neutro",
  3: "Concordo parcialmente",
  4: "Concordo totalmente",
};

export interface AnswerRow {
  number: number;
  question: string;
  answerValue: number;
  answerLabel: string;
  factor: string;
  domain: string;
}

export function buildAnswerRows(answers: Record<number, number>): AnswerRow[] {
  return FIBT_ITEMS.map((item, index) => ({
    number: index + 1,
    question: item.text,
    answerValue: answers[item.id],
    answerLabel: LIKERT_LABELS[answers[item.id]] ?? "—",
    factor: FACTOR_LABELS[item.factor],
    domain: DOMAIN_LABELS[item.domain],
  }));
}

function csvCell(value: string | number): string {
  const s = String(value ?? "");
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildAnswersCsv(rows: AnswerRow[]): string {
  const header = ["Nº", "Questão", "Resposta", "Escala (0-4)", "Fator", "Domínio"];
  const lines = [
    header.map(csvCell).join(";"),
    ...rows.map((r) =>
      [r.number, r.question, r.answerLabel, r.answerValue, r.factor, r.domain]
        .map(csvCell)
        .join(";"),
    ),
  ];
  // BOM garante acentuação correta no Excel pt-BR.
  return "\uFEFF" + lines.join("\r\n");
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
