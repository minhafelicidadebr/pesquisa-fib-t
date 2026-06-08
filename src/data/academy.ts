// Academy IFT — 9 trilhas que cruzam PERMA+V (Seligman) com VIA Character Strengths.
// Cada driver tem micro-missões de 5 minutos com recompensa IFT Coin.

export type DriverSlug =
  | "emocoes-positivas"
  | "engajamento"
  | "relacionamentos"
  | "significado"
  | "realizacao"
  | "vitalidade"
  | "sabedoria"
  | "coragem"
  | "transcendencia";

export type DriverLevel = "iniciante" | "intermediario" | "avancado";

export interface Mission {
  id: string;
  title: string;
  duration: string; // "5 min"
  reward: number; // IFT Coin
  protocol: string;
}

export interface Driver {
  slug: DriverSlug;
  title: string;
  perma: string; // mapping PERMA+V
  via: string[]; // VIA strengths cluster
  pillar: "P" | "E" | "R" | "M" | "A" | "V"; // PERMA+V pillar
  accent: "gold" | "cyan" | "magenta";
  shortPitch: string;
  why: string;
  level: DriverLevel;
  evidence: string;
  missions: Mission[];
  // Constelação: drivers que reforçam este
  resonates: DriverSlug[];
}

export const DRIVERS: Driver[] = [
  {
    slug: "emocoes-positivas",
    title: "Emoções Positivas",
    perma: "P · Positive Emotions",
    pillar: "P",
    via: ["Gratidão", "Esperança", "Apreciação do belo"],
    accent: "gold",
    shortPitch: "Cultivar o repertório de emoções que ampliam recursos cognitivos e sociais.",
    why: "A teoria broaden-and-build (Fredrickson, 2001) mostra que emoções positivas frequentes ampliam atenção, criatividade e laços — formando recursos psicológicos duradouros.",
    level: "iniciante",
    evidence: "Fredrickson (2001) · Lyubomirsky et al. (2005) · meta-análise k=51, d=0.31",
    resonates: ["relacionamentos", "vitalidade", "transcendencia"],
    missions: [
      { id: "p1", title: "Três coisas boas", duration: "5 min", reward: 10, protocol: "Escreva 3 acontecimentos positivos do dia e por que aconteceram. Repetir por 7 dias." },
      { id: "p2", title: "Carta de gratidão", duration: "12 min", reward: 25, protocol: "Escreva uma carta detalhada a alguém que nunca agradeceu apropriadamente. Entregue (ou leia em voz alta)." },
      { id: "p3", title: "Saboreio sensorial", duration: "5 min", reward: 10, protocol: "Escolha uma atividade rotineira (café, banho, caminhada) e descreva 5 sensações conscientemente." },
    ],
  },
  {
    slug: "engajamento",
    title: "Engajamento & Flow",
    perma: "E · Engagement",
    pillar: "E",
    via: ["Curiosidade", "Amor pelo aprender", "Perspectiva"],
    accent: "cyan",
    shortPitch: "Reconfigurar tarefas para entrar em estado de flow — desafio ótimo e absorção plena.",
    why: "Csikszentmihalyi (1990) demonstra que flow correlaciona com performance, sentido e bem-estar. Job crafting (Wrzesniewski & Dutton) é o principal acionador no trabalho.",
    level: "intermediario",
    evidence: "Csikszentmihalyi (1990) · Wrzesniewski & Dutton (2001) · Tims et al. (2013), d=0.45",
    resonates: ["realizacao", "significado", "sabedoria"],
    missions: [
      { id: "e1", title: "Mapa de forças aplicadas", duration: "8 min", reward: 15, protocol: "Liste 3 atividades da semana onde usou suas top forças VIA. Identifique padrão." },
      { id: "e2", title: "Job crafting micro-experimento", duration: "15 min", reward: 30, protocol: "Reformule uma tarefa repetitiva: mude meio, escopo ou propósito. Teste por 5 dias." },
      { id: "e3", title: "Bloco de flow protegido", duration: "5 min", reward: 10, protocol: "Agende 90 min sem interrupções para tarefa de desafio ótimo. Sem celular, sem chat." },
    ],
  },
  {
    slug: "relacionamentos",
    title: "Relacionamentos Florescentes",
    perma: "R · Relationships",
    pillar: "R",
    via: ["Bondade", "Inteligência social", "Trabalho em equipe"],
    accent: "magenta",
    shortPitch: "Construir conexões de alta qualidade que sustentam saúde mental e performance coletiva.",
    why: "Estudo de Harvard de 85 anos (Waldinger) identifica qualidade dos relacionamentos como melhor preditor de saúde e felicidade ao longo da vida.",
    level: "iniciante",
    evidence: "Waldinger (2023) · Dutton & Heaphy (2003) · meta-análise Holt-Lunstad, d=0.50",
    resonates: ["emocoes-positivas", "coragem", "transcendencia"],
    missions: [
      { id: "r1", title: "Resposta ativa-construtiva", duration: "5 min", reward: 10, protocol: "Quando alguém compartilhar boa notícia, responda com entusiasmo, perguntas e celebração genuína." },
      { id: "r2", title: "Check-in de 1 pergunta", duration: "5 min", reward: 10, protocol: "Pergunte a um colega: 'O que está pesando essa semana?' Escute sem oferecer solução." },
      { id: "r3", title: "Reconhecimento específico", duration: "8 min", reward: 15, protocol: "Envie reconhecimento detalhado a 1 pessoa: comportamento + impacto + força VIA observada." },
    ],
  },
  {
    slug: "significado",
    title: "Significado & Propósito",
    perma: "M · Meaning",
    pillar: "M",
    via: ["Espiritualidade", "Esperança", "Apreciação do belo"],
    accent: "gold",
    shortPitch: "Conectar trabalho diário a um propósito que transcende a tarefa imediata.",
    why: "Steger (2009) mostra que sentido no trabalho prediz engajamento, redução de burnout e turnover. Reflexão sobre 'por que' aumenta resiliência.",
    level: "avancado",
    evidence: "Steger et al. (2012) · Hill et al. (2014) · d=0.42 em redução de burnout",
    resonates: ["engajamento", "transcendencia", "realizacao"],
    missions: [
      { id: "m1", title: "Carta do eu de 80 anos", duration: "20 min", reward: 40, protocol: "Escreva uma carta do seu eu aos 80 anos refletindo sobre o que importou. Releia mensalmente." },
      { id: "m2", title: "Por trás do 'por quê'", duration: "10 min", reward: 20, protocol: "Pergunte 5 vezes 'por que isso importa?' sobre seu projeto atual. Chegue à camada-raiz." },
      { id: "m3", title: "Beneficiário invisível", duration: "8 min", reward: 15, protocol: "Identifique alguém impactado pelo seu trabalho que você nunca encontrou. Visualize-o em detalhe." },
    ],
  },
  {
    slug: "realizacao",
    title: "Realização & Maestria",
    perma: "A · Accomplishment",
    pillar: "A",
    via: ["Perseverança", "Autorregulação", "Prudência"],
    accent: "cyan",
    shortPitch: "Construir maestria através de objetivos significativos e progresso visível.",
    why: "Duckworth (2016) sobre grit e Dweck sobre mindset de crescimento mostram que progresso percebido — não a conquista — é o que sustenta motivação e bem-estar.",
    level: "intermediario",
    evidence: "Duckworth (2016) · Amabile & Kramer 'Progress Principle' (2011), d=0.38",
    resonates: ["engajamento", "coragem", "sabedoria"],
    missions: [
      { id: "a1", title: "Diário do micro-progresso", duration: "5 min", reward: 10, protocol: "Ao fim do dia, registre 1 pequeno avanço — por menor que seja. 14 dias seguidos." },
      { id: "a2", title: "Objetivo SMART de 21 dias", duration: "15 min", reward: 30, protocol: "Defina 1 objetivo específico, mensurável, com check-in semanal e recompensa simbólica." },
      { id: "a3", title: "Pós-mortem positivo", duration: "10 min", reward: 20, protocol: "Após um entregável: o que funcionou? O que aprendi? O que repetirei?" },
    ],
  },
  {
    slug: "vitalidade",
    title: "Vitalidade & Energia",
    perma: "V · Vitality (saúde física)",
    pillar: "V",
    via: ["Zelo", "Autorregulação", "Prudência"],
    accent: "magenta",
    shortPitch: "Sono, movimento e nutrição como base biológica do florescimento.",
    why: "Walker (2017) sobre sono, Ratey (2008) sobre exercício e meta-análises de Conn (2011) mostram impacto causal direto em humor, cognição e resiliência ao estresse.",
    level: "iniciante",
    evidence: "Walker (2017) · Ratey (2008) · Conn (2011) k=70 estudos, d=0.55",
    resonates: ["emocoes-positivas", "realizacao", "coragem"],
    missions: [
      { id: "v1", title: "Janela de sono fixa", duration: "5 min", reward: 10, protocol: "Defina hora fixa de dormir e acordar, ±30 min, por 7 dias. Sem tela 60 min antes." },
      { id: "v2", title: "Movimento de 7 min", duration: "7 min", reward: 15, protocol: "Sequência de 12 exercícios de alta intensidade (jumping jacks, agachamentos, etc.) 3×/semana." },
      { id: "v3", title: "Hidratação consciente", duration: "5 min", reward: 10, protocol: "Beba 1 copo de água ao acordar, antes de cada refeição e ao iniciar reuniões. Track 7 dias." },
    ],
  },
  {
    slug: "sabedoria",
    title: "Sabedoria Aplicada",
    perma: "Virtude cognitiva (VIA)",
    pillar: "E",
    via: ["Criatividade", "Curiosidade", "Discernimento", "Perspectiva"],
    accent: "cyan",
    shortPitch: "Pensar bem sob incerteza: discernimento, perspectiva e abertura intelectual.",
    why: "Peterson & Seligman (2004) identificam sabedoria como virtude transcultural. Pesquisas de Grossmann mostram que sabedoria pratica reduz ruminação e melhora decisão.",
    level: "avancado",
    evidence: "Peterson & Seligman (2004) · Grossmann (2017) d=0.39 em tomada de decisão",
    resonates: ["engajamento", "significado", "realizacao"],
    missions: [
      { id: "s1", title: "Pré-mortem", duration: "10 min", reward: 20, protocol: "Antes de decidir: imagine que falhou 6 meses depois. Liste 3 motivos. Aja sobre eles agora." },
      { id: "s2", title: "Trocar de lente", duration: "8 min", reward: 15, protocol: "Sobre um problema atual, descreva como 3 pessoas diferentes o veriam (CEO, criança, antropólogo)." },
      { id: "s3", title: "Pergunta da semana", duration: "5 min", reward: 10, protocol: "Faça uma pergunta poderosa em vez de dar uma resposta na próxima reunião." },
    ],
  },
  {
    slug: "coragem",
    title: "Coragem & Autenticidade",
    perma: "Virtude motivacional (VIA)",
    pillar: "A",
    via: ["Bravura", "Perseverança", "Honestidade", "Zelo"],
    accent: "magenta",
    shortPitch: "Falar a verdade, agir alinhado a valores e perseverar diante de obstáculos.",
    why: "Edmondson (2018) sobre segurança psicológica + Brown (2012) sobre vulnerabilidade mostram que coragem relacional é multiplicador de inovação e confiança.",
    level: "intermediario",
    evidence: "Edmondson (2018) · Brown (2012) · Google Project Aristotle (2016)",
    resonates: ["relacionamentos", "realizacao", "sabedoria"],
    missions: [
      { id: "c1", title: "Conversa difícil agendada", duration: "20 min", reward: 40, protocol: "Identifique 1 conversa que está adiando há +14 dias. Agende. Use modelo SBI (situação-comportamento-impacto)." },
      { id: "c2", title: "Pedido claro", duration: "5 min", reward: 10, protocol: "Substitua 1 reclamação por 1 pedido específico esta semana." },
      { id: "c3", title: "Não público", duration: "5 min", reward: 10, protocol: "Diga 'não' a 1 demanda desalinhada com prioridades. Sem justificativa elaborada." },
    ],
  },
  {
    slug: "transcendencia",
    title: "Transcendência & Conexão",
    perma: "Virtude espiritual (VIA)",
    pillar: "M",
    via: ["Apreciação do belo", "Gratidão", "Esperança", "Humor", "Espiritualidade"],
    accent: "gold",
    shortPitch: "Conectar-se a algo maior — natureza, arte, comunidade, propósito coletivo.",
    why: "Keltner (2023) sobre awe (admiração) mostra redução de inflamação, aumento de generosidade e percepção de propósito. Yaden (2017) sobre experiências auto-transcendentes.",
    level: "avancado",
    evidence: "Keltner (2023) 'Awe' · Yaden et al. (2017) d=0.34 em sentido",
    resonates: ["emocoes-positivas", "significado", "relacionamentos"],
    missions: [
      { id: "t1", title: "Caminhada de admiração", duration: "15 min", reward: 30, protocol: "Caminhe ao ar livre buscando ativamente algo que provoque awe (céu, árvore, arquitetura). Fotografe." },
      { id: "t2", title: "Ato anônimo", duration: "10 min", reward: 20, protocol: "Faça uma gentileza sem identificação. Observe efeito interno por 24h." },
      { id: "t3", title: "Beleza diária", duration: "5 min", reward: 10, protocol: "Capture 1 imagem por dia de algo belo no entorno. Compartilhe ao final da semana." },
    ],
  },
];

export const PILLAR_LABEL: Record<Driver["pillar"], string> = {
  P: "Emoções Positivas",
  E: "Engajamento",
  R: "Relacionamentos",
  M: "Significado",
  A: "Realização",
  V: "Vitalidade",
};

export function getDriver(slug: string): Driver | undefined {
  return DRIVERS.find((d) => d.slug === slug);
}
