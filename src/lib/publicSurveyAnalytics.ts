import { supabase } from "@/integrations/supabase/client";
import { copsoqItems, copsoqSubscales, toRiskScore, classifyRisk, type SubscaleResult } from "@/data/copsoq";

export const K_ANON = 7;

export interface SectorAggregate {
  sector: string;
  n: number;
  eligible: boolean;
  global_score: number;
  global_risk: "verde" | "amarelo" | "vermelho";
  subscales: SubscaleResult[];
}

export interface SurveyAggregate {
  totalResponses: number;
  totalSectors: number;
  globalScore: number;
  globalRisk: "verde" | "amarelo" | "vermelho";
  subscales: SubscaleResult[]; // company-wide
  sectors: SectorAggregate[];
  lastUpdated: string | null;
}

type Row = {
  id: string;
  sector: string | null;
  answers: Record<string, number> | Record<number, number>;
  global_score: number | null;
  created_at: string;
};

function aggregateAnswers(rows: Row[]): SubscaleResult[] {
  const bucket: Record<string, number[]> = {};
  for (const r of rows) {
    const ans = r.answers as Record<string, number>;
    if (!ans) continue;
    for (const item of copsoqItems) {
      const raw = ans[String(item.id)] ?? ans[item.id as unknown as string];
      if (raw === undefined || raw === null) continue;
      const risk = toRiskScore(item, Number(raw));
      (bucket[item.subscale] ??= []).push(risk);
    }
  }
  return Object.entries(bucket).map(([key, vals]) => {
    const score = Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1));
    const meta = copsoqSubscales[key];
    return {
      key,
      label: meta?.label ?? key,
      dimension: meta?.dimension ?? "—",
      score,
      classification: classifyRisk(score),
    };
  }).sort((a, b) => b.score - a.score);
}

export async function fetchSurveyAggregate(companyId: string): Promise<SurveyAggregate> {
  const { data, error } = await supabase
    .from("public_survey_responses")
    .select("id, sector, answers, global_score, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) throw error;
  const rows = (data ?? []) as Row[];

  const companyWide = aggregateAnswers(rows);
  const globalScore = companyWide.length
    ? Number((companyWide.reduce((a, s) => a + s.score, 0) / companyWide.length).toFixed(1))
    : 0;

  const bySector = new Map<string, Row[]>();
  for (const r of rows) {
    const k = r.sector ?? "Não informado";
    (bySector.get(k) ?? bySector.set(k, []).get(k)!).push(r);
  }
  const sectors: SectorAggregate[] = Array.from(bySector.entries()).map(([sector, sRows]) => {
    const subs = aggregateAnswers(sRows);
    const score = subs.length ? Number((subs.reduce((a, s) => a + s.score, 0) / subs.length).toFixed(1)) : 0;
    return {
      sector,
      n: sRows.length,
      eligible: sRows.length >= K_ANON,
      global_score: score,
      global_risk: classifyRisk(score),
      subscales: subs,
    };
  }).sort((a, b) => b.n - a.n);

  return {
    totalResponses: rows.length,
    totalSectors: sectors.length,
    globalScore,
    globalRisk: classifyRisk(globalScore),
    subscales: companyWide,
    sectors,
    lastUpdated: rows[0]?.created_at ?? null,
  };
}
