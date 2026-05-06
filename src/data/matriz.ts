// Matriz Inteligente COPSOQ II × Work Wellbeing Playbook 2.0 × NR-1/GRO/PGR
// Base: COPSOQ Manual Portugal 2013 + Oxford Work Wellbeing Playbook 2.0 + Guia MTE 2026 (NR-1)
// Toda associação é classificada por nível de evidência e Índice de Associação Integrada (IAI)

export type EvidenceTag =
  | "DOCUMENTAL_DIRETA"
  | "DOCUMENTAL_INDIRETA"
  | "EVIDENCIA_CIENTIFICA"
  | "INFERENCIA_TECNICA"
  | "HIPOTESE_VALIDAR";

export type AssociationLevel = "critica" | "forte" | "moderada" | "fraca" | "nao_recomendada";

export interface CopsoqDimension {
  id: string;
  name: string;
  cluster: string; // cluster id
  type: "exposicao" | "recurso" | "efeito" | "comportamento";
  direction: "alto_favoravel" | "alto_desfavoravel";
  versions: ("curta" | "media" | "longa")[];
  cautela: string;
  fatorPsicossocial: string; // NR-1/GRO mapping
}

export interface PlaybookDriver {
  id: string;
  name: string;
  category: "D" | "R" | "I" | "V" | "E" | "H"; // DRIVER acronym (H = Risk/Health/Safety)
  categoryLabel: string;
  definition: string;
  mechanism: string;
  level: ("organizacional" | "lideranca" | "equipe" | "individual" | "politica")[];
  evidenceStrength: "alta" | "media" | "emergente";
  intervention: string;
}

export interface MatrixCell {
  copsoqId: string;
  driverId: string;
  level: AssociationLevel;
  iai: number; // 0–5
  evidence: EvidenceTag;
  mechanism: string;
}

export interface Cluster {
  id: string;
  name: string;
  copsoqIds: string[];
  priorityDrivers: string[];
  nr1Risk: string;
  intervention: string;
  indicator: string;
  urgency: "alta" | "media" | "baixa";
}

// ─────────────────────────── DIMENSÕES COPSOQ II ───────────────────────────
export const COPSOQ_DIMENSIONS: CopsoqDimension[] = [
  { id: "exig_quant", name: "Exigências quantitativas", cluster: "demandas", type: "exposicao", direction: "alto_desfavoravel", versions: ["curta","media","longa"], cautela: "Não confundir com produtividade — mede sobrecarga percebida.", fatorPsicossocial: "Sobrecarga de trabalho · ritmo · prazos" },
  { id: "ritmo", name: "Ritmo de trabalho", cluster: "demandas", type: "exposicao", direction: "alto_desfavoravel", versions: ["media","longa"], cautela: "Avaliar junto com pausas e recuperação.", fatorPsicossocial: "Intensificação do trabalho · NR-17" },
  { id: "exig_cog", name: "Exigências cognitivas", cluster: "cognitivas", type: "exposicao", direction: "alto_desfavoravel", versions: ["media","longa"], cautela: "Pode ser recurso se acompanhada de autonomia e aprendizagem.", fatorPsicossocial: "Carga mental · atenção sustentada" },
  { id: "exig_emoc", name: "Exigências emocionais", cluster: "cognitivas", type: "exposicao", direction: "alto_desfavoravel", versions: ["curta","media","longa"], cautela: "Crítica em saúde, atendimento, educação, segurança pública.", fatorPsicossocial: "Trabalho emocional · contato com sofrimento" },
  { id: "influencia", name: "Influência no trabalho", cluster: "autonomia", type: "recurso", direction: "alto_favoravel", versions: ["curta","media","longa"], cautela: "Distinguir de autonomia técnica vs decisória.", fatorPsicossocial: "Baixo controle (Karasek) · NR-1" },
  { id: "desenv", name: "Possibilidades de desenvolvimento", cluster: "desenvolvimento", type: "recurso", direction: "alto_favoravel", versions: ["curta","media","longa"], cautela: "Considerar acesso real à formação, não apenas oferta formal.", fatorPsicossocial: "Estagnação · subutilização de competências" },
  { id: "significado", name: "Significado do trabalho", cluster: "desenvolvimento", type: "recurso", direction: "alto_favoravel", versions: ["curta","media","longa"], cautela: "Não confundir com missão organizacional declarada.", fatorPsicossocial: "Perda de propósito · alienação" },
  { id: "compromisso", name: "Compromisso com o local de trabalho", cluster: "desenvolvimento", type: "recurso", direction: "alto_favoravel", versions: ["media","longa"], cautela: "Pode mascarar presenteísmo se isolado.", fatorPsicossocial: "Engajamento organizacional" },
  { id: "previsibilidade", name: "Previsibilidade", cluster: "papel", type: "recurso", direction: "alto_favoravel", versions: ["curta","media","longa"], cautela: "Crítica em mudanças e reestruturações.", fatorPsicossocial: "Mudança organizacional não comunicada" },
  { id: "recompensas", name: "Recompensas / Reconhecimento", cluster: "reconhecimento", type: "recurso", direction: "alto_favoravel", versions: ["curta","media","longa"], cautela: "Inclui reconhecimento simbólico, não só salarial.", fatorPsicossocial: "Desequilíbrio esforço-recompensa (Siegrist)" },
  { id: "transp_papel", name: "Transparência de papel", cluster: "papel", type: "recurso", direction: "alto_favoravel", versions: ["curta","media","longa"], cautela: "Mede clareza, não conteúdo do papel.", fatorPsicossocial: "Ambiguidade de papel" },
  { id: "conflito_papel", name: "Conflitos de papéis", cluster: "papel", type: "exposicao", direction: "alto_desfavoravel", versions: ["media","longa"], cautela: "Comum em matriciais e gestão de múltiplos chefes.", fatorPsicossocial: "Conflito de papel · demandas contraditórias" },
  { id: "qual_lid", name: "Qualidade da liderança", cluster: "lideranca", type: "recurso", direction: "alto_favoravel", versions: ["curta","media","longa"], cautela: "Avaliar por equipe, não global.", fatorPsicossocial: "Liderança disfuncional · NR-1" },
  { id: "apoio_sup", name: "Apoio social de superiores", cluster: "lideranca", type: "recurso", direction: "alto_favoravel", versions: ["curta","media","longa"], cautela: "Diferenciar de microgestão.", fatorPsicossocial: "Falta de suporte instrumental" },
  { id: "apoio_col", name: "Apoio social de colegas", cluster: "comunidade", type: "recurso", direction: "alto_favoravel", versions: ["curta","media","longa"], cautela: "Sensível a trabalho remoto/híbrido.", fatorPsicossocial: "Isolamento social no trabalho" },
  { id: "comunidade", name: "Comunidade social no trabalho", cluster: "comunidade", type: "recurso", direction: "alto_favoravel", versions: ["curta","media","longa"], cautela: "Não confundir com clima superficial.", fatorPsicossocial: "Coesão de equipe" },
  { id: "conf_vert", name: "Confiança vertical", cluster: "confianca", type: "recurso", direction: "alto_favoravel", versions: ["media","longa"], cautela: "Crítica em períodos de crise.", fatorPsicossocial: "Erosão de confiança institucional" },
  { id: "conf_hor", name: "Confiança horizontal", cluster: "confianca", type: "recurso", direction: "alto_favoravel", versions: ["media","longa"], cautela: "Avaliar contexto competitivo.", fatorPsicossocial: "Cooperação intra-equipe" },
  { id: "justica", name: "Justiça e respeito", cluster: "confianca", type: "recurso", direction: "alto_favoravel", versions: ["curta","media","longa"], cautela: "Inclui justiça procedural, distributiva e interacional.", fatorPsicossocial: "Injustiça organizacional" },
  { id: "inseguranca", name: "Insegurança laboral", cluster: "inseguranca", type: "exposicao", direction: "alto_desfavoravel", versions: ["curta","media","longa"], cautela: "Sensível a contratos atípicos.", fatorPsicossocial: "Precarização · medo de demissão" },
  { id: "trab_familia", name: "Conflito trabalho-família", cluster: "interface", type: "exposicao", direction: "alto_desfavoravel", versions: ["media","longa"], cautela: "Inclui cuidados não-remunerados (recorte de gênero).", fatorPsicossocial: "Direito à desconexão · NR-17" },
  { id: "saude_geral", name: "Saúde geral", cluster: "saude", type: "efeito", direction: "alto_favoravel", versions: ["curta","media","longa"], cautela: "Auto-percebida — não substitui exames.", fatorPsicossocial: "Indicador de efeito" },
  { id: "stress", name: "Stress", cluster: "saude", type: "efeito", direction: "alto_desfavoravel", versions: ["curta","media","longa"], cautela: "Não medicalizar — é resposta organizacional.", fatorPsicossocial: "Estresse ocupacional crônico" },
  { id: "burnout", name: "Burnout", cluster: "saude", type: "efeito", direction: "alto_desfavoravel", versions: ["curta","media","longa"], cautela: "CID-11 QD85 — exige resposta organizacional.", fatorPsicossocial: "Esgotamento profissional · NR-1" },
  { id: "sono", name: "Problemas de sono", cluster: "saude", type: "efeito", direction: "alto_desfavoravel", versions: ["media","longa"], cautela: "Sentinela precoce de risco psicossocial.", fatorPsicossocial: "Distúrbio relacionado ao trabalho" },
  { id: "depressao", name: "Sintomas depressivos", cluster: "saude", type: "efeito", direction: "alto_desfavoravel", versions: ["media","longa"], cautela: "Acionar acolhimento, não diagnóstico clínico no PGR.", fatorPsicossocial: "Sofrimento psíquico relacionado ao trabalho" },
  { id: "ofensivos", name: "Comportamentos ofensivos", cluster: "ofensivos", type: "comportamento", direction: "alto_desfavoravel", versions: ["curta","media","longa"], cautela: "Inclui assédio moral, sexual, discriminação, violência.", fatorPsicossocial: "Assédio · violência no trabalho · NR-1" },
];

// ─────────────────────────── DRIVERS PLAYBOOK 2.0 ───────────────────────────
export const PLAYBOOK_DRIVERS: PlaybookDriver[] = [
  // D — Development & Security
  { id: "achievement", name: "Achievement", category: "D", categoryLabel: "Development & Security", definition: "Sentimento de realização e progresso visível.", mechanism: "Ciclos curtos de feedback e reconhecimento de entregas.", level: ["lideranca","equipe"], evidenceStrength: "alta", intervention: "OKRs claros, 1:1 estruturados, celebração de marcos." },
  { id: "learning", name: "Learning", category: "D", categoryLabel: "Development & Security", definition: "Oportunidades reais de aprender no trabalho.", mechanism: "Stretch assignments e tempo protegido para aprendizagem.", level: ["organizacional","lideranca"], evidenceStrength: "alta", intervention: "Trilhas formais + L&D embarcado no fluxo." },
  { id: "job_security", name: "Job Security", category: "D", categoryLabel: "Development & Security", definition: "Percepção de continuidade e estabilidade.", mechanism: "Comunicação transparente sobre futuro e mudanças.", level: ["organizacional","politica"], evidenceStrength: "alta", intervention: "Roadmap institucional + canais formais de comunicação." },
  // R — Relationships
  { id: "appreciation", name: "Appreciation", category: "R", categoryLabel: "Relationships", definition: "Reconhecimento genuíno e oportuno.", mechanism: "Reciprocidade simbólica reduz exaustão emocional.", level: ["lideranca","equipe"], evidenceStrength: "alta", intervention: "Rituais de reconhecimento peer-to-peer e top-down." },
  { id: "inclusion", name: "Inclusion & Belonging", category: "R", categoryLabel: "Relationships", definition: "Sentimento de pertencimento e aceitação.", mechanism: "Segurança psicológica → contribuição plena.", level: ["organizacional","lideranca","equipe"], evidenceStrength: "alta", intervention: "Políticas D&I + treinamento de viés + grupos de afinidade." },
  { id: "support", name: "Support", category: "R", categoryLabel: "Relationships", definition: "Apoio instrumental e emocional disponível.", mechanism: "Buffer contra estresse via recursos sociais.", level: ["lideranca","equipe"], evidenceStrength: "alta", intervention: "Mentoria, EAP, escuta ativa em 1:1." },
  { id: "trust", name: "Trust", category: "R", categoryLabel: "Relationships", definition: "Confiança vertical e horizontal.", mechanism: "Coerência entre discurso e prática institucional.", level: ["organizacional","lideranca","politica"], evidenceStrength: "alta", intervention: "Transparência de decisões + accountability visível." },
  { id: "management", name: "Management", category: "R", categoryLabel: "Relationships", definition: "Qualidade da gestão imediata.", mechanism: "Liderança próxima é o maior preditor isolado de bem-estar.", level: ["lideranca"], evidenceStrength: "alta", intervention: "Capacitação de gestores em escuta, feedback e priorização." },
  { id: "leadership", name: "Leadership", category: "R", categoryLabel: "Relationships", definition: "Liderança institucional e visão.", mechanism: "Coerência estratégica reduz ambiguidade.", level: ["organizacional","politica"], evidenceStrength: "media", intervention: "Comunicação executiva regular + town halls." },
  // I — Independence & Flexibility
  { id: "flexibility", name: "Flexibility", category: "I", categoryLabel: "Independence & Flexibility", definition: "Controle sobre quando, onde e como trabalhar.", mechanism: "Adaptação à vida pessoal reduz conflito trabalho-família.", level: ["organizacional","politica"], evidenceStrength: "alta", intervention: "Política de trabalho híbrido + horários flexíveis." },
  { id: "voice", name: "Employee Voice", category: "I", categoryLabel: "Independence & Flexibility", definition: "Canais reais de expressão e escuta.", mechanism: "Voz percebida → confiança e accountability.", level: ["organizacional","lideranca"], evidenceStrength: "alta", intervention: "Pesquisas de pulso + comitês paritários (CIPA)." },
  { id: "operational", name: "Operational Design", category: "I", categoryLabel: "Independence & Flexibility", definition: "Desenho do trabalho e dos processos.", mechanism: "Redução de fricção e retrabalho libera energia.", level: ["organizacional"], evidenceStrength: "alta", intervention: "Job redesign + lean + revisão de carga." },
  { id: "autonomy", name: "Autonomy", category: "I", categoryLabel: "Independence & Flexibility", definition: "Margem decisória sobre o próprio trabalho.", mechanism: "Controle reduz tensão (modelo Demanda-Controle).", level: ["lideranca","equipe"], evidenceStrength: "alta", intervention: "Delegação clara + remoção de aprovações desnecessárias." },
  // V — Variety & Fulfilment
  { id: "energy", name: "Energy", category: "V", categoryLabel: "Variety & Fulfilment", definition: "Vitalidade física e mental no trabalho.", mechanism: "Recuperação ativa entre demandas previne burnout.", level: ["organizacional","individual"], evidenceStrength: "alta", intervention: "Pausas protegidas, microbreaks, gestão de calendário." },
  { id: "purpose", name: "Purpose", category: "V", categoryLabel: "Variety & Fulfilment", definition: "Sentido e propósito no que se faz.", mechanism: "Conexão obra-impacto sustenta engajamento.", level: ["organizacional","lideranca"], evidenceStrength: "alta", intervention: "Storytelling de impacto + line-of-sight para missão." },
  // E — Earnings
  { id: "compensation", name: "Compensation", category: "E", categoryLabel: "Earnings & Benefits", definition: "Justiça e suficiência da remuneração.", mechanism: "Equidade percebida reduz tensão e turnover.", level: ["organizacional","politica"], evidenceStrength: "alta", intervention: "Política de remuneração transparente + benchmark." },
  // H — Risk, Health & Safety
  { id: "stress_d", name: "Stress", category: "H", categoryLabel: "Risk, Health & Safety", definition: "Nível de estresse percebido.", mechanism: "Medida-resultado a ser reduzida via demais drivers.", level: ["organizacional","politica"], evidenceStrength: "alta", intervention: "Programa integrado de saúde mental + PGR psicossocial." },
  { id: "workload", name: "Workload Pressures", category: "H", categoryLabel: "Risk, Health & Safety", definition: "Pressão de carga e prazos.", mechanism: "Excesso crônico → burnout, erros, acidentes.", level: ["organizacional","lideranca"], evidenceStrength: "alta", intervention: "Capacity planning + priorização + revisão de metas." },
];

// ─────────────────────────── MATRIZ DE ASSOCIAÇÃO ───────────────────────────
// IAI calculado conforme super prompt (afinidade × evidência × intervenção × GRO × impacto × viabilidade)
export const MATRIX: MatrixCell[] = [
  // Exigências quantitativas
  { copsoqId: "exig_quant", driverId: "workload", level: "critica", iai: 4.85, evidence: "DOCUMENTAL_DIRETA", mechanism: "Sobreposição conceitual direta (carga × pressão)." },
  { copsoqId: "exig_quant", driverId: "stress_d", level: "critica", iai: 4.70, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Modelo Demanda-Controle (Karasek)." },
  { copsoqId: "exig_quant", driverId: "operational", level: "forte", iai: 4.30, evidence: "DOCUMENTAL_INDIRETA", mechanism: "Redesign reduz exposição." },
  { copsoqId: "exig_quant", driverId: "support", level: "forte", iai: 4.10, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Suporte modera carga." },
  // Ritmo
  { copsoqId: "ritmo", driverId: "workload", level: "critica", iai: 4.60, evidence: "DOCUMENTAL_DIRETA", mechanism: "Intensificação direta." },
  { copsoqId: "ritmo", driverId: "energy", level: "forte", iai: 4.25, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Recuperação insuficiente." },
  { copsoqId: "ritmo", driverId: "operational", level: "forte", iai: 4.10, evidence: "INFERENCIA_TECNICA", mechanism: "Redesign de fluxo." },
  // Exigências cognitivas
  { copsoqId: "exig_cog", driverId: "learning", level: "forte", iai: 4.00, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Aprender amortece carga cognitiva." },
  { copsoqId: "exig_cog", driverId: "autonomy", level: "forte", iai: 4.15, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Controle modera demanda." },
  { copsoqId: "exig_cog", driverId: "operational", level: "moderada", iai: 3.60, evidence: "INFERENCIA_TECNICA", mechanism: "Simplificação de tarefas." },
  // Exigências emocionais
  { copsoqId: "exig_emoc", driverId: "support", level: "critica", iai: 4.65, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Suporte é principal buffer emocional." },
  { copsoqId: "exig_emoc", driverId: "stress_d", level: "forte", iai: 4.20, evidence: "DOCUMENTAL_DIRETA", mechanism: "Trabalho emocional → estresse." },
  { copsoqId: "exig_emoc", driverId: "management", level: "forte", iai: 4.05, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Liderança valida emoções." },
  // Influência
  { copsoqId: "influencia", driverId: "autonomy", level: "critica", iai: 4.80, evidence: "DOCUMENTAL_DIRETA", mechanism: "Equivalência conceitual." },
  { copsoqId: "influencia", driverId: "voice", level: "forte", iai: 4.35, evidence: "DOCUMENTAL_INDIRETA", mechanism: "Voz operacionaliza influência." },
  { copsoqId: "influencia", driverId: "operational", level: "forte", iai: 4.00, evidence: "INFERENCIA_TECNICA", mechanism: "Desenho permite influência." },
  // Desenvolvimento
  { copsoqId: "desenv", driverId: "learning", level: "critica", iai: 4.85, evidence: "DOCUMENTAL_DIRETA", mechanism: "Mesma construção." },
  { copsoqId: "desenv", driverId: "achievement", level: "forte", iai: 4.20, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Crescer alimenta realização." },
  { copsoqId: "desenv", driverId: "purpose", level: "moderada", iai: 3.70, evidence: "INFERENCIA_TECNICA", mechanism: "Desenvolvimento dá sentido." },
  // Significado
  { copsoqId: "significado", driverId: "purpose", level: "critica", iai: 4.90, evidence: "DOCUMENTAL_DIRETA", mechanism: "Equivalência semântica." },
  { copsoqId: "significado", driverId: "achievement", level: "forte", iai: 4.10, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Sentido sustenta esforço." },
  { copsoqId: "significado", driverId: "appreciation", level: "moderada", iai: 3.65, evidence: "INFERENCIA_TECNICA", mechanism: "Reconhecimento ativa significado." },
  // Compromisso
  { copsoqId: "compromisso", driverId: "purpose", level: "forte", iai: 4.30, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Sentido → compromisso afetivo." },
  { copsoqId: "compromisso", driverId: "trust", level: "forte", iai: 4.20, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Confiança gera compromisso." },
  { copsoqId: "compromisso", driverId: "job_security", level: "moderada", iai: 3.55, evidence: "INFERENCIA_TECNICA", mechanism: "Estabilidade ancora compromisso." },
  // Previsibilidade
  { copsoqId: "previsibilidade", driverId: "trust", level: "forte", iai: 4.40, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Comunicação → confiança." },
  { copsoqId: "previsibilidade", driverId: "job_security", level: "forte", iai: 4.10, evidence: "INFERENCIA_TECNICA", mechanism: "Saber o futuro reduz ansiedade." },
  { copsoqId: "previsibilidade", driverId: "leadership", level: "moderada", iai: 3.70, evidence: "DOCUMENTAL_INDIRETA", mechanism: "Liderança institucional comunica." },
  // Recompensas
  { copsoqId: "recompensas", driverId: "appreciation", level: "critica", iai: 4.75, evidence: "DOCUMENTAL_DIRETA", mechanism: "Reconhecimento simbólico direto." },
  { copsoqId: "recompensas", driverId: "compensation", level: "forte", iai: 4.25, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Equilíbrio esforço-recompensa (Siegrist)." },
  { copsoqId: "recompensas", driverId: "trust", level: "moderada", iai: 3.60, evidence: "INFERENCIA_TECNICA", mechanism: "Justiça percebida." },
  // Transparência de papel
  { copsoqId: "transp_papel", driverId: "management", level: "critica", iai: 4.55, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Gestor define clareza de papel." },
  { copsoqId: "transp_papel", driverId: "operational", level: "forte", iai: 4.00, evidence: "INFERENCIA_TECNICA", mechanism: "Desenho clarifica responsabilidades." },
  // Conflitos de papéis
  { copsoqId: "conflito_papel", driverId: "management", level: "critica", iai: 4.50, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Gestão resolve demandas contraditórias." },
  { copsoqId: "conflito_papel", driverId: "operational", level: "forte", iai: 4.20, evidence: "INFERENCIA_TECNICA", mechanism: "Estrutura matricial = fonte." },
  { copsoqId: "conflito_papel", driverId: "stress_d", level: "forte", iai: 4.05, evidence: "DOCUMENTAL_DIRETA", mechanism: "Conflito → tensão." },
  // Qualidade da liderança
  { copsoqId: "qual_lid", driverId: "management", level: "critica", iai: 4.95, evidence: "DOCUMENTAL_DIRETA", mechanism: "Mesma construção operacional." },
  { copsoqId: "qual_lid", driverId: "leadership", level: "forte", iai: 4.30, evidence: "DOCUMENTAL_INDIRETA", mechanism: "Liderança institucional." },
  { copsoqId: "qual_lid", driverId: "trust", level: "forte", iai: 4.40, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Liderança gera confiança." },
  // Apoio superiores
  { copsoqId: "apoio_sup", driverId: "support", level: "critica", iai: 4.85, evidence: "DOCUMENTAL_DIRETA", mechanism: "Equivalência direta." },
  { copsoqId: "apoio_sup", driverId: "management", level: "forte", iai: 4.45, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Suporte é prática gerencial." },
  // Apoio colegas
  { copsoqId: "apoio_col", driverId: "support", level: "critica", iai: 4.70, evidence: "DOCUMENTAL_DIRETA", mechanism: "Suporte horizontal." },
  { copsoqId: "apoio_col", driverId: "inclusion", level: "forte", iai: 4.30, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Pertencer → ajudar." },
  // Comunidade
  { copsoqId: "comunidade", driverId: "inclusion", level: "critica", iai: 4.75, evidence: "DOCUMENTAL_DIRETA", mechanism: "Coesão = pertencimento." },
  { copsoqId: "comunidade", driverId: "support", level: "forte", iai: 4.20, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Comunidade fornece suporte." },
  // Confiança vertical
  { copsoqId: "conf_vert", driverId: "trust", level: "critica", iai: 4.90, evidence: "DOCUMENTAL_DIRETA", mechanism: "Equivalência semântica." },
  { copsoqId: "conf_vert", driverId: "leadership", level: "forte", iai: 4.20, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Liderança institucional." },
  { copsoqId: "conf_vert", driverId: "voice", level: "forte", iai: 4.15, evidence: "INFERENCIA_TECNICA", mechanism: "Voz reforça confiança." },
  // Confiança horizontal
  { copsoqId: "conf_hor", driverId: "trust", level: "critica", iai: 4.80, evidence: "DOCUMENTAL_DIRETA", mechanism: "Mesma construção." },
  { copsoqId: "conf_hor", driverId: "inclusion", level: "forte", iai: 4.25, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Inclusão gera confiança." },
  // Justiça
  { copsoqId: "justica", driverId: "trust", level: "critica", iai: 4.65, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Justiça organizacional → confiança." },
  { copsoqId: "justica", driverId: "appreciation", level: "forte", iai: 4.10, evidence: "INFERENCIA_TECNICA", mechanism: "Reconhecimento justo." },
  { copsoqId: "justica", driverId: "inclusion", level: "forte", iai: 4.20, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Equidade procedural." },
  // Insegurança
  { copsoqId: "inseguranca", driverId: "job_security", level: "critica", iai: 4.95, evidence: "DOCUMENTAL_DIRETA", mechanism: "Equivalência direta." },
  { copsoqId: "inseguranca", driverId: "trust", level: "forte", iai: 4.30, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Confiança modera medo." },
  { copsoqId: "inseguranca", driverId: "leadership", level: "moderada", iai: 3.80, evidence: "INFERENCIA_TECNICA", mechanism: "Comunicação institucional." },
  // Trabalho-família
  { copsoqId: "trab_familia", driverId: "flexibility", level: "critica", iai: 4.85, evidence: "DOCUMENTAL_DIRETA", mechanism: "Flexibilidade resolve conflito." },
  { copsoqId: "trab_familia", driverId: "operational", level: "forte", iai: 4.10, evidence: "INFERENCIA_TECNICA", mechanism: "Desenho de jornada." },
  { copsoqId: "trab_familia", driverId: "support", level: "forte", iai: 4.05, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Suporte alivia conflito." },
  // Saúde geral
  { copsoqId: "saude_geral", driverId: "stress_d", level: "critica", iai: 4.50, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Estresse → saúde percebida." },
  { copsoqId: "saude_geral", driverId: "energy", level: "forte", iai: 4.20, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Vitalidade → saúde." },
  // Stress
  { copsoqId: "stress", driverId: "stress_d", level: "critica", iai: 5.00, evidence: "DOCUMENTAL_DIRETA", mechanism: "Equivalência total." },
  { copsoqId: "stress", driverId: "workload", level: "critica", iai: 4.60, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Carga é principal preditor." },
  { copsoqId: "stress", driverId: "support", level: "forte", iai: 4.30, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Buffer social." },
  // Burnout
  { copsoqId: "burnout", driverId: "workload", level: "critica", iai: 4.85, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Maslach: exaustão emocional." },
  { copsoqId: "burnout", driverId: "energy", level: "critica", iai: 4.55, evidence: "DOCUMENTAL_DIRETA", mechanism: "Recuperação previne." },
  { copsoqId: "burnout", driverId: "management", level: "forte", iai: 4.30, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Liderança modera." },
  { copsoqId: "burnout", driverId: "support", level: "forte", iai: 4.20, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Suporte protege." },
  // Sono
  { copsoqId: "sono", driverId: "stress_d", level: "critica", iai: 4.50, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Estresse → insônia." },
  { copsoqId: "sono", driverId: "flexibility", level: "forte", iai: 4.00, evidence: "INFERENCIA_TECNICA", mechanism: "Jornada permite higiene do sono." },
  // Depressão
  { copsoqId: "depressao", driverId: "support", level: "critica", iai: 4.65, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Apoio social protege." },
  { copsoqId: "depressao", driverId: "stress_d", level: "critica", iai: 4.55, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Estresse crônico → sintomas." },
  { copsoqId: "depressao", driverId: "trust", level: "forte", iai: 4.10, evidence: "INFERENCIA_TECNICA", mechanism: "Confiança institucional." },
  // Ofensivos
  { copsoqId: "ofensivos", driverId: "inclusion", level: "critica", iai: 4.80, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Cultura inclusiva previne." },
  { copsoqId: "ofensivos", driverId: "trust", level: "critica", iai: 4.60, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Canais de denúncia confiáveis." },
  { copsoqId: "ofensivos", driverId: "management", level: "forte", iai: 4.40, evidence: "EVIDENCIA_CIENTIFICA", mechanism: "Liderança ativa contra assédio." },
  { copsoqId: "ofensivos", driverId: "leadership", level: "forte", iai: 4.20, evidence: "DOCUMENTAL_INDIRETA", mechanism: "Política institucional." },
];

// ─────────────────────────── CLUSTERS DE RISCO ───────────────────────────
export const CLUSTERS: Cluster[] = [
  { id: "demandas", name: "Demandas, carga e ritmo", copsoqIds: ["exig_quant","ritmo"], priorityDrivers: ["workload","stress_d","operational","support"], nr1Risk: "Sobrecarga · intensificação · NR-17", intervention: "Capacity planning, revisão de metas, pausas protegidas, redesign de tarefas.", indicator: "Horas extras, absenteísmo, % entregas em prazo, % pausas.", urgency: "alta" },
  { id: "cognitivas", name: "Exigências cognitivas e emocionais", copsoqIds: ["exig_cog","exig_emoc"], priorityDrivers: ["support","autonomy","management","learning"], nr1Risk: "Carga mental · trabalho emocional", intervention: "Suporte gerencial, debriefing emocional, autonomia técnica.", indicator: "Pesquisa de pulso, uso de EAP, rotação em postos críticos.", urgency: "alta" },
  { id: "autonomia", name: "Autonomia, influência e controle", copsoqIds: ["influencia"], priorityDrivers: ["autonomy","voice","operational","trust"], nr1Risk: "Baixo controle (Karasek)", intervention: "Delegação, comitês paritários, redesign decisório.", indicator: "Tempo de aprovação, % decisões na ponta.", urgency: "media" },
  { id: "desenvolvimento", name: "Desenvolvimento, aprendizagem e significado", copsoqIds: ["desenv","significado","compromisso"], priorityDrivers: ["learning","purpose","achievement","appreciation"], nr1Risk: "Estagnação · perda de propósito", intervention: "Trilhas de aprendizagem, line-of-sight para missão, OKRs.", indicator: "Horas de L&D, NPS interno, eNPS.", urgency: "media" },
  { id: "papel", name: "Clareza e conflito de papéis", copsoqIds: ["transp_papel","conflito_papel","previsibilidade"], priorityDrivers: ["management","operational","trust","leadership"], nr1Risk: "Ambiguidade · demandas contraditórias", intervention: "RACI, comunicação executiva regular, capacitação gerencial.", indicator: "% colaboradores com clareza de papel (pulso).", urgency: "alta" },
  { id: "lideranca", name: "Liderança e gestão", copsoqIds: ["qual_lid","apoio_sup"], priorityDrivers: ["management","leadership","trust","support"], nr1Risk: "Liderança disfuncional", intervention: "Programa de capacitação de gestores, 360º, mentoria.", indicator: "Score de liderança por equipe, turnover voluntário por gestor.", urgency: "alta" },
  { id: "reconhecimento", name: "Reconhecimento, recompensas e justiça", copsoqIds: ["recompensas","justica"], priorityDrivers: ["appreciation","compensation","trust","inclusion"], nr1Risk: "Desequilíbrio esforço-recompensa", intervention: "Política transparente de remuneração, rituais de reconhecimento.", indicator: "Equidade salarial, índice de reconhecimento.", urgency: "media" },
  { id: "comunidade", name: "Comunidade, suporte e pertencimento", copsoqIds: ["apoio_col","comunidade"], priorityDrivers: ["support","inclusion","trust"], nr1Risk: "Isolamento social", intervention: "Rituais de equipe, espaços de conexão, mentoria peer.", indicator: "% colaboradores com mentor, pulso de pertencimento.", urgency: "media" },
  { id: "confianca", name: "Confiança e segurança psicológica", copsoqIds: ["conf_vert","conf_hor"], priorityDrivers: ["trust","leadership","voice","inclusion"], nr1Risk: "Erosão de confiança institucional", intervention: "Transparência de decisões, town halls, accountability visível.", indicator: "Score de confiança vertical/horizontal.", urgency: "alta" },
  { id: "inseguranca", name: "Insegurança laboral e mudança", copsoqIds: ["inseguranca"], priorityDrivers: ["job_security","trust","leadership"], nr1Risk: "Precarização · medo de demissão", intervention: "Roadmap institucional, comunicação de mudanças.", indicator: "Pulso de segurança percebida.", urgency: "alta" },
  { id: "interface", name: "Interface trabalho-família", copsoqIds: ["trab_familia"], priorityDrivers: ["flexibility","operational","support"], nr1Risk: "Direito à desconexão · NR-17", intervention: "Política híbrida, jornada flexível, desconexão.", indicator: "Conexões fora do horário, uso de licenças.", urgency: "media" },
  { id: "saude", name: "Saúde, stress, burnout e sono", copsoqIds: ["saude_geral","stress","burnout","sono","depressao"], priorityDrivers: ["stress_d","workload","support","energy","management"], nr1Risk: "Estresse crônico · burnout (CID-11)", intervention: "PGR psicossocial integrado, EAP, programa de saúde mental.", indicator: "Afastamentos por CID F/Z, uso de EAP, pulso de bem-estar.", urgency: "alta" },
  { id: "ofensivos", name: "Comportamentos ofensivos, assédio e violência", copsoqIds: ["ofensivos"], priorityDrivers: ["inclusion","trust","management","leadership"], nr1Risk: "Assédio · violência no trabalho", intervention: "Canal de denúncia confiável, treinamento, accountability.", indicator: "Denúncias recebidas/concluídas, treinamento de prevenção.", urgency: "alta" },
];

export const LEVEL_META: Record<AssociationLevel, { color: string; symbol: string; label: string }> = {
  critica: { color: "bg-brand-magenta", symbol: "🔴", label: "Crítica" },
  forte: { color: "bg-brand-orange", symbol: "🟠", label: "Forte" },
  moderada: { color: "bg-brand-gold", symbol: "🟡", label: "Moderada" },
  fraca: { color: "bg-muted", symbol: "⚪", label: "Fraca" },
  nao_recomendada: { color: "bg-foreground/10", symbol: "❌", label: "Não recomendada" },
};

export const EVIDENCE_LABEL: Record<EvidenceTag, string> = {
  DOCUMENTAL_DIRETA: "Documental direta",
  DOCUMENTAL_INDIRETA: "Documental indireta",
  EVIDENCIA_CIENTIFICA: "Evidência científica",
  INFERENCIA_TECNICA: "Inferência técnica robusta",
  HIPOTESE_VALIDAR: "Hipótese a validar",
};

export function getCellsFor(copsoqId: string): MatrixCell[] {
  return MATRIX.filter(c => c.copsoqId === copsoqId).sort((a,b) => b.iai - a.iai);
}

export function getCell(copsoqId: string, driverId: string): MatrixCell | undefined {
  return MATRIX.find(c => c.copsoqId === copsoqId && c.driverId === driverId);
}
