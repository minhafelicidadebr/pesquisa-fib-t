// Catálogo curado de intervenções baseadas em evidência (Oxford Wellbeing Playbook 2.0,
// WHO Guidelines 2022, Cochrane, NICE). Cada intervenção declara as subescalas COPSOQ II
// que mais impacta, com peso (0-1) e effect size base (Cohen's d agregado de meta-análises).
// O ILI (Intervention Likelihood Index) é calculado em runtime cruzando esses pesos com o
// score de risco real da empresa.

export type InterventionLevel = "individual" | "equipe" | "organizacional";
export type InterventionHorizon = "30d" | "90d" | "180d";
export type InterventionEffort = "baixo" | "medio" | "alto";

export interface InterventionTarget {
  subscale: string; // chave em copsoqSubscales
  weight: number;   // 0-1, contribuição relativa
}

export interface Intervention {
  id: string;
  title: string;
  summary: string;
  level: InterventionLevel;
  horizon: InterventionHorizon;
  effort: InterventionEffort;
  evidence: string;       // citação curta
  effectSize: number;     // Cohen's d médio
  targets: InterventionTarget[];
  protocol: string[];     // passos práticos
  kpi: string;            // métrica de sucesso
}

export const interventions: Intervention[] = [
  {
    id: "job-crafting",
    title: "Job Crafting estruturado",
    summary: "Oficinas guiadas onde o colaborador redesenha tarefas, relações e percepções do próprio trabalho.",
    level: "individual",
    horizon: "90d",
    effort: "medio",
    evidence: "Oprea et al. 2019, meta-análise k=33",
    effectSize: 0.42,
    targets: [
      { subscale: "significado_trabalho", weight: 1.0 },
      { subscale: "influencia_trabalho", weight: 0.8 },
      { subscale: "possibilidades_desenvolvimento", weight: 0.7 },
      { subscale: "satisfacao_trabalho", weight: 0.6 },
      { subscale: "burnout", weight: 0.4 },
    ],
    protocol: [
      "Workshop inicial (2h) com framework Wrzesniewski & Dutton",
      "Plano individual de 3 mudanças (tarefa, relacional, cognitiva)",
      "Check-in quinzenal com gestor por 90 dias",
      "Mensuração antes/depois via FIB-T",
    ],
    kpi: "Redução ≥15% no score de burnout em 90 dias",
  },
  {
    id: "lideranca-compassiva",
    title: "Programa de Liderança Compassiva",
    summary: "Trilha de 8 encontros para gestores com práticas baseadas em Compassionate Leadership (West, 2021).",
    level: "organizacional",
    horizon: "180d",
    effort: "alto",
    evidence: "West & Chowla 2017; King's Fund 2021",
    effectSize: 0.55,
    targets: [
      { subscale: "qualidade_lideranca", weight: 1.0 },
      { subscale: "apoio_social_superior", weight: 0.9 },
      { subscale: "confianca_vertical", weight: 0.8 },
      { subscale: "justica_respeito", weight: 0.6 },
      { subscale: "recompensas", weight: 0.5 },
    ],
    protocol: [
      "Diagnóstico 360° por liderança",
      "8 encontros quinzenais (escuta ativa, feedback, NVC)",
      "Shadowing entre pares de gestores",
      "Reavaliação COPSOQ subescala liderança em 6 meses",
    ],
    kpi: "+20 pts em qualidade da liderança e apoio do superior",
  },
  {
    id: "previsibilidade-rituais",
    title: "Rituais de Previsibilidade",
    summary: "Cadência semanal/mensal de comunicação executiva com formato e horário fixos sobre rumo e mudanças.",
    level: "organizacional",
    horizon: "30d",
    effort: "baixo",
    evidence: "Bordia et al. 2004; Allen 2017",
    effectSize: 0.31,
    targets: [
      { subscale: "previsibilidade", weight: 1.0 },
      { subscale: "clareza_papel", weight: 0.7 },
      { subscale: "inseguranca_laboral", weight: 0.6 },
      { subscale: "confianca_vertical", weight: 0.5 },
    ],
    protocol: [
      "All-hands mensal de 30min (CEO + Q&A)",
      "Boletim semanal com decisões e racional",
      "Janela quinzenal de perguntas anônimas",
      "Mensuração via pulse trimestral",
    ],
    kpi: "+15 pts em previsibilidade no próximo pulse",
  },
  {
    id: "carga-trabalho-redesign",
    title: "Redesenho de Carga e Ritmo",
    summary: "Auditoria de processos com mapeamento de gargalos, sprints protegidas e revisão de OKRs.",
    level: "equipe",
    horizon: "90d",
    effort: "medio",
    evidence: "Nielsen et al. 2017; HSE Stress MS",
    effectSize: 0.38,
    targets: [
      { subscale: "exigencias_quantitativas", weight: 1.0 },
      { subscale: "ritmo_trabalho", weight: 1.0 },
      { subscale: "conflito_trabalho_familia", weight: 0.6 },
      { subscale: "burnout", weight: 0.7 },
      { subscale: "stress", weight: 0.5 },
    ],
    protocol: [
      "Time tracking de 2 semanas por equipe",
      "Workshop de priorização (MoSCoW + RICE)",
      "Limite de WIP e horários protegidos para deep work",
      "Revisão trimestral de OKRs por capacidade real",
    ],
    kpi: "Redução ≥20% em exigências quantitativas",
  },
  {
    id: "mbsr-mindfulness",
    title: "MBSR — Mindfulness 8 semanas",
    summary: "Programa Mindfulness-Based Stress Reduction adaptado ao contexto corporativo.",
    level: "individual",
    horizon: "90d",
    effort: "medio",
    evidence: "Kabat-Zinn 1990; Janssen 2018 meta k=23",
    effectSize: 0.48,
    targets: [
      { subscale: "stress", weight: 1.0 },
      { subscale: "burnout", weight: 0.8 },
      { subscale: "problemas_sono", weight: 0.7 },
      { subscale: "sintomas_depressivos", weight: 0.6 },
      { subscale: "exigencias_emocionais", weight: 0.5 },
    ],
    protocol: [
      "8 sessões semanais de 2h com instrutor certificado",
      "Prática diária de 20min (app + áudios)",
      "Retiro de meio-dia na semana 6",
      "Avaliação PSS-10 antes/depois",
    ],
    kpi: "Redução ≥1 desvio-padrão em PSS-10",
  },
  {
    id: "feedback-reconhecimento",
    title: "Sistema de Reconhecimento Frequente",
    summary: "Cadência estruturada de feedback positivo, peer-recognition e celebração de progressos.",
    level: "equipe",
    horizon: "30d",
    effort: "baixo",
    evidence: "Brun & Dugas 2008; Gallup Q12",
    effectSize: 0.34,
    targets: [
      { subscale: "recompensas", weight: 1.0 },
      { subscale: "satisfacao_trabalho", weight: 0.7 },
      { subscale: "comunidade_social", weight: 0.6 },
      { subscale: "compromisso_local", weight: 0.5 },
    ],
    protocol: [
      "1:1 quinzenal com pelo menos um reconhecimento específico",
      "Canal #kudos com peer-recognition",
      "Ritual mensal de celebração de marcos",
      "Treinamento de gestores em feedback SBI",
    ],
    kpi: "+15 pts em recompensas/reconhecimento",
  },
  {
    id: "psychological-safety",
    title: "Sprints de Segurança Psicológica",
    summary: "Intervenção de equipe baseada em Edmondson para construir voz, escuta e tolerância ao erro.",
    level: "equipe",
    horizon: "90d",
    effort: "medio",
    evidence: "Edmondson 1999; Frazier 2017 meta k=136",
    effectSize: 0.51,
    targets: [
      { subscale: "comunidade_social", weight: 1.0 },
      { subscale: "justica_respeito", weight: 0.8 },
      { subscale: "comportamentos_ofensivos", weight: 0.7 },
      { subscale: "confianca_vertical", weight: 0.6 },
      { subscale: "qualidade_lideranca", weight: 0.4 },
    ],
    protocol: [
      "Diagnóstico baseline (Team Diagnostic Survey)",
      "4 oficinas: voz, escuta, erro, conflito construtivo",
      "Retro quinzenal com pergunta de segurança psicológica",
      "Reavaliação em 90 dias",
    ],
    kpi: "+1 ponto em escala de segurança psicológica (1-7)",
  },
  {
    id: "sono-recuperacao",
    title: "Higiene do Sono e Recuperação",
    summary: "Programa multimodal: educação, limites de jornada digital e desativação de notificações fora do horário.",
    level: "organizacional",
    horizon: "90d",
    effort: "baixo",
    evidence: "Sonnentag 2018; Belkin 2016 (right-to-disconnect)",
    effectSize: 0.36,
    targets: [
      { subscale: "problemas_sono", weight: 1.0 },
      { subscale: "conflito_trabalho_familia", weight: 0.8 },
      { subscale: "burnout", weight: 0.6 },
      { subscale: "saude_geral", weight: 0.5 },
    ],
    protocol: [
      "Política formal de desconexão (19h–7h, fim de semana)",
      "Trilha de 4 módulos sobre sono e recuperação",
      "Pausa obrigatória entre reuniões (Microsoft style)",
      "Pulse mensal de sono e energia",
    ],
    kpi: "Redução ≥20% em problemas de sono autorreportados",
  },
  {
    id: "anti-assedio",
    title: "Protocolo Anti-Assédio e Canal Seguro",
    summary: "Canal independente, comitê com paridade, treinamentos obrigatórios e investigação com prazo.",
    level: "organizacional",
    horizon: "180d",
    effort: "alto",
    evidence: "EU-OSHA 2021; NR-1 (2025); ISO 45003",
    effectSize: 0.60,
    targets: [
      { subscale: "comportamentos_ofensivos", weight: 1.0 },
      { subscale: "justica_respeito", weight: 0.9 },
      { subscale: "comunidade_social", weight: 0.6 },
      { subscale: "confianca_vertical", weight: 0.5 },
    ],
    protocol: [
      "Canal externo confidencial (ouvidoria independente)",
      "Treinamento anual obrigatório para 100% do quadro",
      "Comitê com paridade de gênero, raça e nível hierárquico",
      "SLA máximo de 30 dias para investigação",
    ],
    kpi: "Redução ≥30% em comportamentos ofensivos reportados",
  },
  {
    id: "clareza-papel-raci",
    title: "Clareza de Papel com RACI vivo",
    summary: "Mapeamento RACI por processo crítico, revisado trimestralmente em ritual de equipe.",
    level: "equipe",
    horizon: "30d",
    effort: "baixo",
    evidence: "Cohen et al. 1995; Karasek demand-control",
    effectSize: 0.29,
    targets: [
      { subscale: "clareza_papel", weight: 1.0 },
      { subscale: "previsibilidade", weight: 0.6 },
      { subscale: "exigencias_cognitivas", weight: 0.4 },
      { subscale: "stress", weight: 0.3 },
    ],
    protocol: [
      "Workshop de 90min por equipe para mapear RACI",
      "Documento vivo em Notion/Confluence",
      "Revisão trimestral em retrospectiva",
      "Pulse de clareza após 60 dias",
    ],
    kpi: "+12 pts em clareza de papel",
  },
  {
    id: "permav-trilhas",
    title: "Trilhas PERMA+V no Academy",
    summary: "5 trilhas formativas baseadas em PERMA+V de Seligman, com micro-missões e IFT Coin.",
    level: "individual",
    horizon: "90d",
    effort: "baixo",
    evidence: "Seligman 2011; Donaldson 2019 meta",
    effectSize: 0.33,
    targets: [
      { subscale: "significado_trabalho", weight: 0.9 },
      { subscale: "satisfacao_trabalho", weight: 0.8 },
      { subscale: "possibilidades_desenvolvimento", weight: 0.7 },
      { subscale: "compromisso_local", weight: 0.5 },
      { subscale: "autoeficacia", weight: 0.5 },
    ],
    protocol: [
      "Auto-inscrição em 1 trilha por trimestre",
      "Micro-missões diárias de 5min",
      "IFT Coin por adesão (privado, sem ranking)",
      "Reavaliação FIB-T após cada trilha",
    ],
    kpi: "+10 pts no índice FIB-T pessoal",
  },
  {
    id: "via-strengths",
    title: "VIA Character Strengths no time",
    summary: "Identificação de top-5 forças VIA + redesenho de papéis e missões em torno delas.",
    level: "equipe",
    horizon: "90d",
    effort: "medio",
    evidence: "Peterson & Seligman 2004; Harzer 2018",
    effectSize: 0.40,
    targets: [
      { subscale: "significado_trabalho", weight: 1.0 },
      { subscale: "satisfacao_trabalho", weight: 0.8 },
      { subscale: "autoeficacia", weight: 0.7 },
      { subscale: "possibilidades_desenvolvimento", weight: 0.6 },
    ],
    protocol: [
      "Aplicação do VIA-IS gratuito para todo o time",
      "Workshop de 3h para mapear forças × tarefas",
      "Plano de uso semanal das 'signature strengths'",
      "Reavaliação após 90 dias",
    ],
    kpi: "+15 pts em significado e autoeficácia",
  },
];

export interface RankedIntervention extends Intervention {
  ili: number;          // 0-100
  matchedRisk: number;  // 0-100 média ponderada do risco coberto
  coverage: number;     // 0-1 fração do peso coberto pelo COPSOQ
}

export interface SubscaleRisk {
  key: string;
  score: number; // 0-100
}

// ILI = (matchedRisk × coverage × effectSize) normalizado
// matchedRisk: média ponderada (peso da intervenção) dos scores de risco das subescalas alvo
// coverage: fração do peso total da intervenção coberta pelo COPSOQ disponível
// effectSize: Cohen's d, normalizado por 1.0
export function rankInterventions(risks: SubscaleRisk[]): RankedIntervention[] {
  const riskMap = new Map(risks.map((r) => [r.key, r.score]));

  return interventions
    .map<RankedIntervention>((iv) => {
      const totalWeight = iv.targets.reduce((s, t) => s + t.weight, 0);
      let weightedRisk = 0;
      let coveredWeight = 0;
      iv.targets.forEach((t) => {
        const score = riskMap.get(t.subscale);
        if (score !== undefined) {
          weightedRisk += score * t.weight;
          coveredWeight += t.weight;
        }
      });
      const matchedRisk = coveredWeight > 0 ? weightedRisk / coveredWeight : 0;
      const coverage = totalWeight > 0 ? coveredWeight / totalWeight : 0;
      const effectNorm = Math.min(iv.effectSize / 0.8, 1); // d=0.8 = grande
      const ili = Number((matchedRisk * coverage * (0.5 + 0.5 * effectNorm)).toFixed(1));
      return { ...iv, ili, matchedRisk: Number(matchedRisk.toFixed(1)), coverage };
    })
    .sort((a, b) => b.ili - a.ili);
}
