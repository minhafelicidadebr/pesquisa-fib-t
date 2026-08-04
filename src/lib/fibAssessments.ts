import { supabase } from "@/integrations/supabase/client";
import { isCanonicalManifest, type FibtScoreManifest } from "@/domain/fibt";

export interface AssessmentRecord {
  id: string;
  fib_score: number;
  domains: Record<string, { score: number; max: number; label: string }>;
  factors: Record<string, { score: number; label: string }>;
  strengths: string[];
  vulnerabilities: string[];
  recommendations: Array<{ domain: string; action: string; timeframe: string; driver_category: string }>;
  learning_trails: Array<{ title: string; description: string; priority: string }>;
  summary: string | null;
  encouragement: string | null;
  created_at: string;
}

/**
 * @deprecated Mantido apenas para leitura de registros históricos.
 * O escore global agora vem do engine determinístico do servidor
 * (`supabase/functions/_shared/fibt-engine.ts`). Nunca calcule no cliente para
 * persistir.
 */
export function computeFibScore(
  domains: Record<string, { score: number; max: number }>
): number {
  const vals = Object.values(domains);
  if (!vals.length) return 0;
  const avg = vals.reduce((sum, d) => sum + d.score / (d.max || 4), 0) / vals.length;
  return Number((avg * 100).toFixed(1));
}

export class NonCanonicalResultError extends Error {
  constructor() {
    super(
      "Resultado não canônico: apenas escores calculados pelo servidor podem ser persistidos.",
    );
    this.name = "NonCanonicalResultError";
  }
}

export async function saveAssessment(payload: {
  globalScore: number;
  manifest: FibtScoreManifest;
  domains: Record<string, { score: number; max: number; label: string }>;
  factors: Record<string, { score: number; label: string }>;
  strengths: string[];
  vulnerabilities: string[];
  recommendations: any[];
  learning_trails: any[];
  summary: string;
  encouragement: string;
  raw_answers: any;
}): Promise<AssessmentRecord | null> {
  // Guarda de integridade: pré-visualizações do cliente e resultados de versões
  // antigas da matriz são recusados antes de tocar o banco.
  if (!isCanonicalManifest(payload.manifest)) {
    throw new NonCanonicalResultError();
  }

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data, error } = await supabase
    .from("fib_assessments")
    .insert({
      user_id: auth.user.id,
      fib_score: payload.globalScore,
      domains: payload.domains,
      factors: payload.factors,
      strengths: payload.strengths,
      vulnerabilities: payload.vulnerabilities,
      recommendations: payload.recommendations,
      learning_trails: payload.learning_trails,
      summary: payload.summary,
      encouragement: payload.encouragement,
      raw_answers: payload.raw_answers,
    })
    .select()
    .single();

  if (error) {
    console.error("saveAssessment error", error);
    return null;
  }
  return data as unknown as AssessmentRecord;
}


export async function listAssessments(): Promise<AssessmentRecord[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase
    .from("fib_assessments")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listAssessments error", error);
    return [];
  }
  return (data || []) as unknown as AssessmentRecord[];
}
