// Mock + real adapter para o relatório DRPS premium.
import type { NR1Record } from "./nr1Assessments";

export interface ReportPayload {
  organization: string;
  respondent: string;
  sector: string;
  emission_date: string;
  global_score: number;
  global_risk: "baixo" | "moderado" | "alto" | "critico";
  subscales: Array<{ key: string; label: string; dimension: string; score: number; zone: "verde" | "amarela" | "vermelha" }>;
  recommendations: Array<{ subscale: string; action: string; horizon: string; priority: string }>;
  summary: string;
  auto_print?: boolean;
}

export const MOCK_NR1: ReportPayload = {
  organization: "Instituto Felicidade para Todos · Demo",
  respondent: "Amostra agregada (n=42)",
  sector: "Operações & Lideranças",
  emission_date: new Date().toLocaleDateString("pt-BR"),
  global_score: 3.1,
  global_risk: "moderado",
  summary: "O ciclo evidencia um quadro de risco moderado com pontos de tensão concentrados em ritmo, exigências cognitivas e previsibilidade. A liderança tem boa avaliação técnica, mas há gargalo de comunicação antecipada de mudanças. Recomenda-se um sprint de 90 dias focado em previsibilidade e redesenho de carga, monitorando burnout e conflito trabalho-família.",
  subscales: [
    { key: "ritmo", label: "Ritmo de trabalho", dimension: "Exigências", score: 1.8, zone: "vermelha" },
    { key: "previsibilidade", label: "Previsibilidade", dimension: "Liderança", score: 2.0, zone: "vermelha" },
    { key: "exig_cog", label: "Exigências cognitivas", dimension: "Exigências", score: 2.2, zone: "vermelha" },
    { key: "burnout", label: "Burnout", dimension: "Saúde", score: 2.3, zone: "vermelha" },
    { key: "conflito_tf", label: "Conflito trabalho-família", dimension: "Saúde", score: 2.4, zone: "vermelha" },
    { key: "exig_quant", label: "Exigências quantitativas", dimension: "Exigências", score: 2.7, zone: "amarela" },
    { key: "recompensas", label: "Recompensas/Reconhecimento", dimension: "Liderança", score: 2.8, zone: "amarela" },
    { key: "stress", label: "Stress", dimension: "Saúde", score: 2.9, zone: "amarela" },
    { key: "exig_emo", label: "Exigências emocionais", dimension: "Exigências", score: 3.0, zone: "amarela" },
    { key: "sono", label: "Problemas de sono", dimension: "Saúde", score: 3.1, zone: "amarela" },
    { key: "apoio_sup", label: "Apoio social do superior", dimension: "Liderança", score: 3.3, zone: "amarela" },
    { key: "depress", label: "Sintomas depressivos", dimension: "Saúde", score: 3.4, zone: "amarela" },
    { key: "influencia", label: "Influência no trabalho", dimension: "Organização", score: 3.5, zone: "verde" },
    { key: "desenvolv", label: "Possibilidades de desenvolvimento", dimension: "Organização", score: 3.6, zone: "verde" },
    { key: "clareza", label: "Clareza do papel", dimension: "Liderança", score: 3.7, zone: "verde" },
    { key: "qual_lider", label: "Qualidade da liderança", dimension: "Liderança", score: 3.8, zone: "verde" },
    { key: "comunidade", label: "Comunidade social no trabalho", dimension: "Relações", score: 3.9, zone: "verde" },
    { key: "justica", label: "Justiça e respeito", dimension: "Valores", score: 3.9, zone: "verde" },
    { key: "autoeficacia", label: "Autoeficácia", dimension: "Indivíduo", score: 4.0, zone: "verde" },
    { key: "confianca", label: "Confiança vertical", dimension: "Liderança", score: 4.1, zone: "verde" },
    { key: "compromisso", label: "Compromisso com o local", dimension: "Valores", score: 4.2, zone: "verde" },
    { key: "satisf", label: "Satisfação no trabalho", dimension: "Valores", score: 4.2, zone: "verde" },
    { key: "saude_geral", label: "Saúde geral", dimension: "Saúde", score: 4.3, zone: "verde" },
    { key: "significado", label: "Significado do trabalho", dimension: "Valores", score: 4.5, zone: "verde" },
    { key: "inseguranca", label: "Insegurança laboral (inv.)", dimension: "Indivíduo", score: 4.6, zone: "verde" },
  ],
  recommendations: [
    { subscale: "Ritmo de trabalho", action: "Mapear picos sazonais e redistribuir backlog; implantar 'no-meeting fridays' por 90 dias.", horizon: "30 dias", priority: "Alta" },
    { subscale: "Previsibilidade", action: "Instituir comunicado quinzenal de mudanças e roadmap visível para todas as equipes.", horizon: "45 dias", priority: "Alta" },
    { subscale: "Exigências cognitivas", action: "Auditoria de tarefas duplicadas e adoção de protocolo de foco profundo (deep work).", horizon: "60 dias", priority: "Alta" },
    { subscale: "Burnout", action: "Programa de recuperação assistida com check-ins semanais e EAP ampliado.", horizon: "30 dias", priority: "Crítica" },
    { subscale: "Conflito trabalho-família", action: "Política de desconexão pós-expediente e revisão de SLAs internos.", horizon: "60 dias", priority: "Média" },
    { subscale: "Recompensas/Reconhecimento", action: "Ritual mensal de reconhecimento público pelos pares e revisão do PCCS.", horizon: "90 dias", priority: "Média" },
  ],
};

export function nr1ToPayload(rec: NR1Record, profileName?: string, org?: string): ReportPayload {
  const sub = (rec.subscales as any[]).map((s) => ({
    key: s.key || s.subscale || s.label,
    label: s.label || s.key,
    dimension: s.dimension || "—",
    score: Number(s.score ?? 0),
    zone: (s.zone || (Number(s.score) >= 3.5 ? "verde" : Number(s.score) >= 2.5 ? "amarela" : "vermelha")) as any,
  }));
  return {
    organization: org || "Avaliação NR-1",
    respondent: profileName || "Auto-aplicação",
    sector: "Geral",
    emission_date: new Date(rec.created_at).toLocaleDateString("pt-BR"),
    global_score: Number(rec.global_score),
    global_risk: (rec.global_risk as any) || "moderado",
    subscales: sub,
    recommendations: (rec.recommendations as any[]) || [],
    summary: rec.summary || "",
  };
}
