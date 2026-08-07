import { supabase } from "@/integrations/supabase/client";
import {
  INSTRUMENT_ID,
  INSTRUMENT_VERSION,
  FIBT_ITEMS,
  type FibtScoreManifest,
  type ScoreCell,
} from "@/domain/fibt";

/**
 * Resultado canônico consumido pelo dashboard, pela tabela e pelo PDF.
 * Sempre produzido pelo servidor — o frontend nunca recalcula escore.
 */
export interface IsgResult {
  globalScore: number;
  manifest: FibtScoreManifest;
  domains: Record<string, ScoreCell>;
  factors: Record<string, ScoreCell>;
  summary: string;
  strengths: string[];
  vulnerabilities: string[];
  recommendations: Array<{ domain?: string; action?: string; timeframe?: string }>;
  limitations?: string;
  completedAt: string;
}

export class IsgSubmitError extends Error {}

/** Envia as respostas ao engine canônico existente (edge function `fibia-chat`). */
export async function submitIsgAnswers(
  answers: Record<number, number>,
): Promise<IsgResult> {
  const payloadAnswers = FIBT_ITEMS.map((q) => ({ id: q.id, answer: answers[q.id] }));

  const { data, error } = await supabase.functions.invoke("fibia-chat", {
    body: {
      answers: payloadAnswers,
      instrumentId: INSTRUMENT_ID,
      instrumentVersion: INSTRUMENT_VERSION,
      // Marcador estrutural da coorte do piloto — base do painel agregado.
      cohort: "isg",
    },
  });

  if (error) throw new IsgSubmitError("submit_failed");
  if (!data?.manifest || !data?.domains || typeof data?.globalScore !== "number") {
    throw new IsgSubmitError("non_canonical_result");
  }

  const narrative = data.narrative ?? {};
  return {
    globalScore: data.globalScore,
    manifest: data.manifest,
    domains: data.domains,
    factors: data.factors,
    summary: narrative.summary ?? "",
    strengths: Array.isArray(narrative.strengths) ? narrative.strengths : [],
    vulnerabilities: Array.isArray(narrative.vulnerabilities) ? narrative.vulnerabilities : [],
    recommendations: Array.isArray(narrative.recommendations) ? narrative.recommendations : [],
    limitations: narrative.limitations,
    completedAt: new Date().toISOString(),
  };
}

export function formatIsgDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
