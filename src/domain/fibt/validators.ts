/**
 * FIB-T — Validação fail-closed das respostas.
 *
 * Política de missing data: FAIL-CLOSED.
 * 32 itens válidos → calcula. Qualquer desvio → rejeita.
 * Não há imputação nem tolerância: isso exigiria regra metodológica
 * formalmente aprovada, que não existe no projeto.
 */

import {
  FIBT_ITEMS,
  FIBT_ITEM_COUNT,
  INSTRUMENT_ID,
  INSTRUMENT_VERSION,
  getItem,
} from "./instrument";
import {
  LIKERT_MAX,
  LIKERT_MIN,
  type FibtValidationIssue,
  type FibtValidationResult,
  type LikertValue,
  type RawAnswers,
} from "./types";

export interface ValidateOptions {
  /** Instrumento declarado pelo cliente. Deve ser exatamente "FIB-T". */
  instrumentId?: string;
  /** Versão declarada pelo cliente. Deve ser exatamente a versão vigente. */
  instrumentVersion?: string;
}

/**
 * Aceita tanto o formato `Record<itemId, value>` quanto a lista
 * `[{ id, answer }]` usada pelo fluxo atual, e normaliza para um mapa.
 * Duplicidades são detectadas — nunca sobrescritas em silêncio.
 */
export interface AnswerEntry {
  id: number;
  answer: number;
}

function normalizeToEntries(
  input: RawAnswers | AnswerEntry[],
): { entries: AnswerEntry[]; duplicates: number[] } {
  if (Array.isArray(input)) {
    const seen = new Set<number>();
    const duplicates: number[] = [];
    for (const e of input) {
      if (seen.has(e.id)) duplicates.push(e.id);
      seen.add(e.id);
    }
    return { entries: input.map((e) => ({ id: Number(e.id), answer: e.answer })), duplicates };
  }
  // Um Record não pode conter chaves repetidas, logo duplicidade é impossível aqui.
  return {
    entries: Object.entries(input).map(([id, answer]) => ({
      id: Number(id),
      answer: answer as number,
    })),
    duplicates: [],
  };
}

export function validateFibtAnswers(
  input: RawAnswers | AnswerEntry[],
  options: ValidateOptions = {},
): FibtValidationResult {
  const issues: FibtValidationIssue[] = [];

  if (options.instrumentId !== undefined && options.instrumentId !== INSTRUMENT_ID) {
    issues.push({
      code: "instrument_mismatch",
      message: `Instrumento incompatível: esperado "${INSTRUMENT_ID}", recebido "${options.instrumentId}".`,
    });
  }

  if (
    options.instrumentVersion !== undefined &&
    options.instrumentVersion !== INSTRUMENT_VERSION
  ) {
    issues.push({
      code: "version_mismatch",
      message: `Versão do instrumento incompatível: esperado "${INSTRUMENT_VERSION}", recebido "${options.instrumentVersion}".`,
    });
  }

  const { entries, duplicates } = normalizeToEntries(input);

  for (const id of duplicates) {
    issues.push({
      code: "duplicate_item",
      message: `Item ${id} foi respondido mais de uma vez.`,
      itemId: id,
    });
  }

  const answers: Record<number, LikertValue> = {};

  for (const { id, answer } of entries) {
    if (!getItem(id)) {
      issues.push({
        code: "unknown_item",
        message: `Item ${id} não pertence ao instrumento ${INSTRUMENT_ID} ${INSTRUMENT_VERSION}.`,
        itemId: id,
      });
      continue;
    }
    if (typeof answer !== "number" || !Number.isFinite(answer)) {
      issues.push({
        code: "value_not_integer",
        message: `Item ${id}: valor não numérico.`,
        itemId: id,
      });
      continue;
    }
    if (!Number.isInteger(answer)) {
      issues.push({
        code: "value_not_integer",
        message: `Item ${id}: a escala aceita apenas inteiros, recebido ${answer}.`,
        itemId: id,
      });
      continue;
    }
    if (answer < LIKERT_MIN || answer > LIKERT_MAX) {
      issues.push({
        code: "value_out_of_scale",
        message: `Item ${id}: valor ${answer} fora da escala ${LIKERT_MIN}–${LIKERT_MAX}.`,
        itemId: id,
      });
      continue;
    }
    answers[id] = answer as LikertValue;
  }

  for (const item of FIBT_ITEMS) {
    if (answers[item.id] === undefined) {
      issues.push({
        code: "missing_item",
        message: `Item ${item.id} não respondido.`,
        itemId: item.id,
      });
    }
  }

  const answeredCount = Object.keys(answers).length;
  if (answeredCount !== FIBT_ITEM_COUNT) {
    issues.push({
      code: "item_count_mismatch",
      message: `Esperados ${FIBT_ITEM_COUNT} itens válidos, obtidos ${answeredCount}.`,
    });
  }

  if (issues.length > 0) return { valid: false, issues };
  return { valid: true, issues: [], answers };
}
