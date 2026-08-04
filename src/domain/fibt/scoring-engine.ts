/**
 * FIB-T — Engine de cálculo determinístico.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ Este módulo é a ÚNICA autoridade de cálculo do FIB-T.                   │
 * │ Não usa IA. Não usa rede. Não usa data/hora. Não usa aleatoriedade.     │
 * │ Mesma entrada ⇒ mesma saída, sempre.                                    │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

import {
  DOMAIN_LABELS,
  EXPECTED_FACTOR_ITEM_COUNTS,
  FACTOR_CONTRACT_KEYS,
  FACTOR_LABELS,
  FIBT_ITEMS,
} from "./instrument";
import { buildManifest } from "./manifest";
import { validateFibtAnswers, type AnswerEntry, type ValidateOptions } from "./validators";
import {
  LIKERT_MAX,
  type DomainId,
  type FactorId,
  type FibtScoreManifest,
  type FibtScoreResult,
  type LikertValue,
  type RawAnswers,
  type ScoreCell,
} from "./types";

/** Arredondamento half-up estável, independente de erro de ponto flutuante. */
function round(value: number, decimals: number): number {
  const f = 10 ** decimals;
  // Number.EPSILON compensa casos como 2.675 representado como 2.67499...
  return Math.round((value + Number.EPSILON) * f) / f;
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export class FibtScoringError extends Error {
  readonly issues: ReturnType<typeof validateFibtAnswers>["issues"];
  constructor(issues: ReturnType<typeof validateFibtAnswers>["issues"]) {
    super(`FIB-T: respostas inválidas (${issues.map((i) => i.code).join(", ")}).`);
    this.name = "FibtScoringError";
    this.issues = issues;
  }
}

/**
 * Calcula domínios, fatores e score global a partir de respostas JÁ VALIDADAS.
 * Prefira `scoreFibt`, que valida antes de calcular.
 */
export function scoreValidatedFibt(
  answers: Record<number, LikertValue>,
  calculatedBy: FibtScoreManifest["calculated_by"],
): FibtScoreResult {
  const domainBuckets = new Map<DomainId, number[]>();
  const factorBuckets = new Map<FactorId, number[]>();

  for (const item of FIBT_ITEMS) {
    const value = answers[item.id];
    if (!domainBuckets.has(item.domain)) domainBuckets.set(item.domain, []);
    if (!factorBuckets.has(item.factor)) factorBuckets.set(item.factor, []);
    domainBuckets.get(item.domain)!.push(value);
    factorBuckets.get(item.factor)!.push(value);
  }

  const domains: Record<string, ScoreCell> = {};
  // Itera sobre DOMAIN_LABELS para garantir ordem de chaves estável e determinística.
  for (const key of Object.keys(DOMAIN_LABELS) as DomainId[]) {
    const values = domainBuckets.get(key)!;
    domains[key] = {
      score: round(mean(values), 2),
      max: LIKERT_MAX,
      label: DOMAIN_LABELS[key],
      itemCount: values.length,
    };
  }

  const factors: Record<string, ScoreCell> = {};
  for (const factor of [1, 2, 3] as FactorId[]) {
    const values = factorBuckets.get(factor)!;
    if (values.length !== EXPECTED_FACTOR_ITEM_COUNTS[factor]) {
      // Guarda de integridade: a matriz foi alterada sem revisar as contagens.
      throw new Error(
        `FIB-T: matriz inconsistente — Fator ${factor} tem ${values.length} itens, esperados ${EXPECTED_FACTOR_ITEM_COUNTS[factor]}.`,
      );
    }
    factors[FACTOR_CONTRACT_KEYS[factor]] = {
      score: round(mean(values), 2),
      max: LIKERT_MAX,
      label: FACTOR_LABELS[factor],
      itemCount: values.length,
    };
  }

  // Score global: média não ponderada das razões domínio/4, em escala 0–100.
  // Comportamento preservado da implementação anterior (computeFibScore).
  const globalScore = round(
    mean(Object.values(domains).map((d) => d.score / d.max)) * 100,
    1,
  );

  return { globalScore, domains, factors, manifest: buildManifest(calculatedBy) };
}

/**
 * Ponto de entrada canônico: valida (fail-closed) e calcula.
 * Lança `FibtScoringError` quando as respostas não formam um conjunto válido.
 */
export function scoreFibt(
  input: RawAnswers | AnswerEntry[],
  options: ValidateOptions & {
    calculatedBy?: FibtScoreManifest["calculated_by"];
  } = {},
): FibtScoreResult {
  const { calculatedBy = "server", ...validateOptions } = options;
  const validation = validateFibtAnswers(input, validateOptions);
  if (!validation.valid || !validation.answers) {
    throw new FibtScoringError(validation.issues);
  }
  return scoreValidatedFibt(validation.answers, calculatedBy);
}

/**
 * Pré-visualização no cliente. Marca o manifesto como `client_preview`,
 * o que impede que o resultado seja tratado como canônico ou persistido.
 * Retorna null em vez de lançar, para não quebrar a UX.
 */
export function previewFibt(input: RawAnswers | AnswerEntry[]): FibtScoreResult | null {
  try {
    return scoreFibt(input, { calculatedBy: "client_preview" });
  } catch {
    return null;
  }
}

/** Domínios ordenados por score. Determinístico: empate resolvido pela chave. */
export function rankDomains(
  domains: Record<string, ScoreCell>,
  direction: "desc" | "asc",
): Array<{ key: string; label: string; score: number }> {
  return Object.entries(domains)
    .map(([key, cell]) => ({ key, label: cell.label, score: cell.score }))
    .sort((a, b) =>
      a.score === b.score
        ? a.key.localeCompare(b.key)
        : direction === "desc"
          ? b.score - a.score
          : a.score - b.score,
    );
}
