import {
  DOMAIN_LABELS,
  FACTOR_LABELS,
  FACTOR_CONTRACT_KEYS,
  FIBT_ITEMS,
} from "@/domain/fibt";
import type { IsgAggregate } from "@/lib/isgAggregate";
import {
  presentationSchema,
  type PresentationSnapshot,
} from "./presentation-schema";

/** Apenas adapta o agregado recebido. Nenhum score é calculado aqui. */
export function adaptCurrentAggregate(
  aggregate: IsgAggregate,
): PresentationSnapshot {
  return presentationSchema.parse({
    schemaVersion: "1",
    sourceKind: "current_aggregate",
    organization: "ISG",
    status: aggregate.status,
    issuedAt: null,
    dataUpdatedAt: aggregate.lastUpdatedAt ?? null,
    collectionPeriod: null,
    n: aggregate.suppressed ? null : (aggregate.n ?? null),
    eligiblePopulation: null,
    suppressed: aggregate.suppressed,
    threshold: aggregate.threshold,
    globalScore: aggregate.suppressed ? null : (aggregate.globalScore ?? null),
    factors: aggregate.suppressed ? [] : (aggregate.factors ?? []),
    domains: aggregate.suppressed ? [] : (aggregate.domains ?? []),
    questions: aggregate.suppressed
      ? []
      : (aggregate.questions ?? []).map((q) => ({
          ...q,
          text:
            FIBT_ITEMS.find((i) => i.id === q.id)?.text ?? "Item desconhecido",
        })),
    sourceRefs: [
      "API administrativa isg-results; resposta congelada nesta sessão",
    ],
    instrumentVersion: null,
    engineVersion: null,
    reviewState: "pending",
    methodNotes: [],
  }) as PresentationSnapshot;
}

/** Fixture exclusivamente fictícia. Não representa resultados institucionais. */
export function createSyntheticDemo(): PresentationSnapshot {
  return presentationSchema.parse({
    schemaVersion: "1",
    sourceKind: "synthetic_demo",
    organization: "ISG",
    status: "Ensaio com dados fictícios",
    issuedAt: null,
    dataUpdatedAt: null,
    collectionPeriod: null,
    n: 18,
    eligiblePopulation: null,
    suppressed: false,
    threshold: 7,
    globalScore: 61.2,
    factors: ([1, 2, 3] as const).map((f, i) => ({
      key: FACTOR_CONTRACT_KEYS[f],
      label: FACTOR_LABELS[f],
      mean: [2.1, 2.8, 2.4][i],
    })),
    domains: Object.entries(DOMAIN_LABELS).map(([key, label], i) => ({
      key,
      label,
      mean: [2.2, 2.6, 2.2, 2.8, 2.4, 3.2, 2.6, 3.2, 2.4][i],
    })),
    questions: FIBT_ITEMS.map((q) => ({
      id: q.id,
      text: q.text,
      mean: Math.round((1.4 + (q.id % 7) * 0.3) * 10) / 10,
      responses: null,
    })),
    sourceRefs: [
      "Dados sintéticos para ensaio de interface. Sem vínculo com uma coleta real.",
    ],
    instrumentVersion: null,
    engineVersion: null,
    reviewState: "pending",
    methodNotes: [],
  }) as PresentationSnapshot;
}
