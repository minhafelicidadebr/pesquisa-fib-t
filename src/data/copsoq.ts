// COPSOQ II – Versão Curta (Kristensen, 2001 / Silva et al., 2011)
// 41 itens, escala Likert 1-5. Itens marcados como `inverse: true` devem ser invertidos
// na pontuação (item positivo: maior valor = menor risco).

export type CopsoqScale = "freq" | "intensity" | "health";

export interface CopsoqItem {
  id: number;
  text: string;
  subscale: string;
  scale: CopsoqScale;
  inverse?: boolean; // true = item positivo (alta resposta = baixo risco)
}

export const copsoqSubscales: Record<string, { label: string; dimension: string; description: string }> = {
  exigencias_quantitativas: { label: "Exigências quantitativas", dimension: "Exigências no trabalho", description: "Volume e ritmo de trabalho." },
  ritmo_trabalho: { label: "Ritmo de trabalho", dimension: "Exigências no trabalho", description: "Velocidade exigida nas tarefas." },
  exigencias_cognitivas: { label: "Exigências cognitivas", dimension: "Exigências no trabalho", description: "Atenção, decisões complexas." },
  exigencias_emocionais: { label: "Exigências emocionais", dimension: "Exigências no trabalho", description: "Carga emocional do trabalho." },
  influencia_trabalho: { label: "Influência no trabalho", dimension: "Organização e conteúdo", inverse: true, description: "Margem de decisão." } as any,
  possibilidades_desenvolvimento: { label: "Possibilidades de desenvolvimento", dimension: "Organização e conteúdo", description: "Iniciativa e aprendizado." },
  previsibilidade: { label: "Previsibilidade", dimension: "Relações sociais e liderança", description: "Informação antecipada sobre mudanças." },
  clareza_papel: { label: "Clareza do papel", dimension: "Relações sociais e liderança", description: "Clareza de responsabilidades." },
  recompensas: { label: "Recompensas/Reconhecimento", dimension: "Relações sociais e liderança", description: "Reconhecimento e tratamento justo." },
  apoio_social_superior: { label: "Apoio social do superior", dimension: "Relações sociais e liderança", description: "Suporte da chefia." },
  comunidade_social: { label: "Comunidade social no trabalho", dimension: "Relações sociais e liderança", description: "Ambiente entre colegas." },
  qualidade_lideranca: { label: "Qualidade da liderança", dimension: "Relações sociais e liderança", description: "Competência da chefia." },
  confianca_vertical: { label: "Confiança vertical", dimension: "Relações sociais e liderança", description: "Confiança gerência ↔ funcionários." },
  justica_respeito: { label: "Justiça e respeito", dimension: "Relações sociais e liderança", description: "Conflitos resolvidos com justiça." },
  autoeficacia: { label: "Autoeficácia", dimension: "Indivíduo", description: "Crença na própria capacidade." },
  significado_trabalho: { label: "Significado do trabalho", dimension: "Valores no trabalho", description: "Sentido e propósito." },
  compromisso_local: { label: "Compromisso com o local", dimension: "Valores no trabalho", description: "Engajamento com a organização." },
  satisfacao_trabalho: { label: "Satisfação com o trabalho", dimension: "Valores no trabalho", description: "Satisfação global." },
  inseguranca_laboral: { label: "Insegurança laboral", dimension: "Indivíduo", description: "Medo de perder o emprego." },
  saude_geral: { label: "Saúde geral", dimension: "Saúde e bem-estar", description: "Percepção da própria saúde." },
  conflito_trabalho_familia: { label: "Conflito trabalho-família", dimension: "Saúde e bem-estar", description: "Interferência negativa na vida privada." },
  problemas_sono: { label: "Problemas de sono", dimension: "Saúde e bem-estar", description: "Qualidade do sono." },
  burnout: { label: "Burnout", dimension: "Saúde e bem-estar", description: "Exaustão física e emocional." },
  stress: { label: "Stress", dimension: "Saúde e bem-estar", description: "Tensão e ansiedade." },
  sintomas_depressivos: { label: "Sintomas depressivos", dimension: "Saúde e bem-estar", description: "Tristeza e desânimo." },
  comportamentos_ofensivos: { label: "Comportamentos ofensivos", dimension: "Saúde e bem-estar", description: "Assédio, violência, ameaças." },
};

export const copsoqItems: CopsoqItem[] = [
  // Exigências
  { id: 1, text: "A sua carga de trabalho acumula-se por ser mal distribuída?", subscale: "exigencias_quantitativas", scale: "freq" },
  { id: 2, text: "Com que frequência não tem tempo para completar todas as tarefas do seu trabalho?", subscale: "exigencias_quantitativas", scale: "freq" },
  { id: 3, text: "Precisa trabalhar muito rapidamente?", subscale: "ritmo_trabalho", scale: "freq" },
  { id: 4, text: "O seu trabalho exige a sua atenção constante?", subscale: "exigencias_cognitivas", scale: "freq" },
  { id: 5, text: "O seu trabalho exige que tome decisões difíceis?", subscale: "exigencias_cognitivas", scale: "freq" },
  { id: 6, text: "O seu trabalho exige emocionalmente de si?", subscale: "exigencias_emocionais", scale: "freq" },
  // Influência / desenvolvimento (positivos)
  { id: 7, text: "Tem um elevado grau de influência no seu trabalho?", subscale: "influencia_trabalho", scale: "freq", inverse: true },
  { id: 8, text: "O seu trabalho exige que tenha iniciativa?", subscale: "possibilidades_desenvolvimento", scale: "freq", inverse: true },
  { id: 9, text: "O seu trabalho permite-lhe aprender coisas novas?", subscale: "possibilidades_desenvolvimento", scale: "freq", inverse: true },
  // Previsibilidade / clareza / recompensas (positivos)
  { id: 10, text: "No seu local de trabalho, é informado com antecedência sobre decisões importantes, mudanças ou planos para o futuro?", subscale: "previsibilidade", scale: "freq", inverse: true },
  { id: 11, text: "Recebe toda a informação de que necessita para fazer bem o seu trabalho?", subscale: "previsibilidade", scale: "freq", inverse: true },
  { id: 12, text: "Sabe exatamente quais as suas responsabilidades?", subscale: "clareza_papel", scale: "freq", inverse: true },
  { id: 13, text: "O seu trabalho é reconhecido e apreciado pela gerência?", subscale: "recompensas", scale: "freq", inverse: true },
  { id: 14, text: "É tratado de forma justa no seu local de trabalho?", subscale: "recompensas", scale: "freq", inverse: true },
  // Apoio social
  { id: 15, text: "Com que frequência tem ajuda e apoio do seu superior imediato?", subscale: "apoio_social_superior", scale: "freq", inverse: true },
  { id: 16, text: "Existe um bom ambiente de trabalho entre si e os seus colegas?", subscale: "comunidade_social", scale: "freq", inverse: true },
  // Liderança
  { id: 17, text: "Oferece aos indivíduos e ao grupo boas oportunidades de desenvolvimento?", subscale: "qualidade_lideranca", scale: "freq", inverse: true },
  { id: 18, text: "É bom no planeamento do trabalho?", subscale: "qualidade_lideranca", scale: "freq", inverse: true },
  // Confiança vertical
  { id: 19, text: "A gerência confia nos seus funcionários para fazerem o seu trabalho bem?", subscale: "confianca_vertical", scale: "freq", inverse: true },
  { id: 20, text: "Confia na informação que lhe é transmitida pela gerência?", subscale: "confianca_vertical", scale: "freq", inverse: true },
  // Justiça
  { id: 21, text: "Os conflitos são resolvidos de uma forma justa?", subscale: "justica_respeito", scale: "freq", inverse: true },
  { id: 22, text: "O trabalho é igualmente distribuído pelos funcionários?", subscale: "justica_respeito", scale: "freq", inverse: true },
  // Autoeficácia (positivo)
  { id: 23, text: "Sou sempre capaz de resolver problemas, se tentar o suficiente.", subscale: "autoeficacia", scale: "freq", inverse: true },
  // Significado / compromisso / satisfação (positivos, escala intensidade)
  { id: 24, text: "O seu trabalho tem algum significado para si?", subscale: "significado_trabalho", scale: "intensity", inverse: true },
  { id: 25, text: "Sente que o seu trabalho é importante?", subscale: "significado_trabalho", scale: "intensity", inverse: true },
  { id: 26, text: "Sente que os problemas do seu local de trabalho são seus também?", subscale: "compromisso_local", scale: "intensity", inverse: true },
  { id: 27, text: "Quão satisfeito está com o seu trabalho de uma forma global?", subscale: "satisfacao_trabalho", scale: "intensity", inverse: true },
  // Insegurança (negativo)
  { id: 28, text: "Sente-se preocupado em ficar desempregado?", subscale: "inseguranca_laboral", scale: "intensity" },
  // Saúde geral (escala invertida — Excelente=1)
  { id: 29, text: "Em geral, sente que a sua saúde é:", subscale: "saude_geral", scale: "health" },
  // Conflito trabalho-família
  { id: 30, text: "Sente que o seu trabalho lhe exige muita energia que acaba por afetar a sua vida privada negativamente?", subscale: "conflito_trabalho_familia", scale: "intensity" },
  { id: 31, text: "Sente que o seu trabalho lhe exige muito tempo que acaba por afetar a sua vida privada negativamente?", subscale: "conflito_trabalho_familia", scale: "intensity" },
  // Sono
  { id: 32, text: "Acordou várias vezes durante a noite e depois não conseguia adormecer novamente?", subscale: "problemas_sono", scale: "freq" },
  // Burnout
  { id: 33, text: "Fisicamente exausto?", subscale: "burnout", scale: "freq" },
  { id: 34, text: "Emocionalmente exausto?", subscale: "burnout", scale: "freq" },
  // Stress
  { id: 35, text: "Irritado?", subscale: "stress", scale: "freq" },
  { id: 36, text: "Ansioso?", subscale: "stress", scale: "freq" },
  // Sintomas depressivos
  { id: 37, text: "Triste?", subscale: "sintomas_depressivos", scale: "freq" },
  // Comportamentos ofensivos (últimos 12 meses)
  { id: 38, text: "Tem sido alvo de insultos ou provocações verbais?", subscale: "comportamentos_ofensivos", scale: "freq" },
  { id: 39, text: "Tem sido exposto a assédio sexual indesejado?", subscale: "comportamentos_ofensivos", scale: "freq" },
  { id: 40, text: "Tem sido exposto a ameaças de violência?", subscale: "comportamentos_ofensivos", scale: "freq" },
  { id: 41, text: "Tem sido exposto a violência física?", subscale: "comportamentos_ofensivos", scale: "freq" },
];

export const likertFreq = [
  { value: 1, label: "Nunca / quase nunca" },
  { value: 2, label: "Raramente" },
  { value: 3, label: "Às vezes" },
  { value: 4, label: "Frequentemente" },
  { value: 5, label: "Sempre" },
];

export const likertIntensity = [
  { value: 1, label: "Nada / quase nada" },
  { value: 2, label: "Um pouco" },
  { value: 3, label: "Moderadamente" },
  { value: 4, label: "Muito" },
  { value: 5, label: "Extremamente" },
];

export const likertHealth = [
  { value: 1, label: "Excelente" },
  { value: 2, label: "Muito boa" },
  { value: 3, label: "Boa" },
  { value: 4, label: "Razoável" },
  { value: 5, label: "Deficitária" },
];

// Converte item bruto (1-5) para "score de risco" 0-100, onde 100 = pior risco.
export function toRiskScore(item: CopsoqItem, raw: number): number {
  // Itens positivos invertidos: alta resposta = baixo risco → invertemos
  const value = item.inverse ? 6 - raw : raw;
  // saúde geral: Excelente=1 → menor risco; Deficitária=5 → maior risco. Já alinhado.
  return ((value - 1) / 4) * 100;
}

// Classificação semafórica COPSOQ (verde / amarelo / vermelho)
export function classifyRisk(score0to100: number): "verde" | "amarelo" | "vermelho" {
  if (score0to100 < 33.33) return "verde";
  if (score0to100 < 66.66) return "amarelo";
  return "vermelho";
}

export interface SubscaleResult {
  key: string;
  label: string;
  dimension: string;
  score: number; // 0-100 (100 = pior)
  classification: "verde" | "amarelo" | "vermelho";
}

export interface CopsoqAnalysis {
  global_score: number;
  global_risk: "verde" | "amarelo" | "vermelho";
  subscales: SubscaleResult[];
  red_flags: SubscaleResult[];
  green_flags: SubscaleResult[];
}

export function computeCopsoqAnalysis(answers: Record<number, number>): CopsoqAnalysis {
  const grouped: Record<string, number[]> = {};
  copsoqItems.forEach((item) => {
    const raw = answers[item.id];
    if (raw === undefined) return;
    if (!grouped[item.subscale]) grouped[item.subscale] = [];
    grouped[item.subscale].push(toRiskScore(item, raw));
  });

  const subscales: SubscaleResult[] = Object.entries(grouped).map(([key, vals]) => {
    const score = Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1));
    const meta = copsoqSubscales[key];
    return {
      key,
      label: meta?.label || key,
      dimension: meta?.dimension || "—",
      score,
      classification: classifyRisk(score),
    };
  });

  const global_score = Number(
    (subscales.reduce((a, s) => a + s.score, 0) / subscales.length).toFixed(1)
  );
  const global_risk = classifyRisk(global_score);

  const red_flags = subscales.filter((s) => s.classification === "vermelho").sort((a, b) => b.score - a.score);
  const green_flags = subscales.filter((s) => s.classification === "verde").sort((a, b) => a.score - b.score);

  return { global_score, global_risk, subscales, red_flags, green_flags };
}
