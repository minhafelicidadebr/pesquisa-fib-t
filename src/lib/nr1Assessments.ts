import { supabase } from "@/integrations/supabase/client";
import { CopsoqAnalysis, SubscaleResult } from "@/data/copsoq";

export interface NR1Record {
  id: string;
  global_risk: string;
  global_score: number;
  subscales: SubscaleResult[];
  red_flags: SubscaleResult[];
  green_flags: SubscaleResult[];
  recommendations: Array<{ subscale: string; action: string; horizon: string; priority: string }>;
  summary: string | null;
  created_at: string;
}

export async function saveNR1(payload: {
  analysis: CopsoqAnalysis;
  recommendations: any[];
  summary: string;
  raw_answers: Record<number, number>;
}): Promise<NR1Record | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { analysis } = payload;
  const { data, error } = await supabase
    .from("nr1_assessments")
    .insert({
      user_id: auth.user.id,
      global_risk: analysis.global_risk,
      global_score: analysis.global_score,
      subscales: analysis.subscales,
      red_flags: analysis.red_flags,
      green_flags: analysis.green_flags,
      recommendations: payload.recommendations,
      summary: payload.summary,
      raw_answers: payload.raw_answers,
    })
    .select()
    .single();
  if (error) {
    console.error("saveNR1 error", error);
    return null;
  }
  return data as unknown as NR1Record;
}

export async function listNR1(): Promise<NR1Record[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase
    .from("nr1_assessments")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listNR1 error", error);
    return [];
  }
  return (data || []) as unknown as NR1Record[];
}
