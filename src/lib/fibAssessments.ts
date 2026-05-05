import { supabase } from "@/integrations/supabase/client";

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

export function computeFibScore(
  domains: Record<string, { score: number; max: number }>
): number {
  const vals = Object.values(domains);
  if (!vals.length) return 0;
  const avg = vals.reduce((sum, d) => sum + d.score / (d.max || 4), 0) / vals.length;
  return Number((avg * 100).toFixed(1));
}

export async function saveAssessment(payload: {
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
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const fib_score = computeFibScore(payload.domains);

  const { data, error } = await supabase
    .from("fib_assessments")
    .insert({
      user_id: auth.user.id,
      fib_score,
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
