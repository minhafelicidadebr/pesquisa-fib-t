import { FIBA_DOMAINS, type FibaDomain, type FibaResult } from "@/domain/fiba";
import { FIBA_FORMAT as fmt } from "./content";

const reflectionByDomain: Record<FibaDomain, string> = {
  padrao_vida: "Que condições do seu cotidiano ajudam você a viver com dignidade e planejar seus próximos passos?",
  educacao: "Em que momentos aprender desperta curiosidade e realização para você?",
  cultura: "Que experiências culturais você gostaria de ter mais presentes na sua vida?",
  bem_estar: "Quais situações ajudam você a perceber propósito e emoções positivas na rotina?",
  saude: "Como você percebe o espaço do sono, do movimento e do cuidado consigo na sua rotina?",
  uso_tempo: "Como o tempo para estudar, descansar e estar com outras pessoas aparece no seu cotidiano?",
  vitalidade: "Quais vínculos fazem você se sentir acolhido e parte de uma comunidade?",
  meio_ambiente: "Que relação você reconhece entre seus hábitos cotidianos e o ambiente em que vive?",
  governanca: "Como a comunicação, a liberdade de expressão e a confiança aparecem na sua experiência na instituição de ensino?",
};

function joinLabels(keys: FibaDomain[]) {
  const labels = keys.map(key => FIBA_DOMAINS[key]);
  return labels.length < 2 ? labels[0] : `${labels.slice(0, -1).join(", ")} e ${labels[labels.length - 1]}`;
}

/** Describes supplied scores only. No new scoring, thresholds, AI or clinical claims. */
export function buildFibaNarrative(result: Pick<FibaResult, "globalScore" | "domains">) {
  const keys = Object.keys(FIBA_DOMAINS) as FibaDomain[];
  const values = keys.map(key => result.domains[key].score);
  const maximum = Math.max(...values), minimum = Math.min(...values);
  const equal = maximum === minimum;
  const higher = keys.filter(key => result.domains[key].score === maximum);
  const lower = keys.filter(key => result.domains[key].score === minimum);
  const summary = `Seu resultado global é ${fmt(result.globalScore, 1)} de 100. Ele reúne os nove domínios com o mesmo peso e descreve este preenchimento. Os valores não representam comparação com outras pessoas nem um percentual de felicidade.`;
  const domainPerspective = equal
    ? `Os nove domínios apresentam a mesma média: ${fmt(minimum)} de 4. Não há diferença entre os escores de domínio neste preenchimento. Você pode explorar o significado de cada dimensão na sua própria experiência.`
    : `A maior média entre seus domínios é ${fmt(maximum)} de 4, em ${joinLabels(higher)}. A menor é ${fmt(minimum)} de 4, em ${joinLabels(lower)}. Essa comparação é apenas entre suas próprias respostas; ela não define faixas de bem-estar ou diagnóstico.`;
  const reflectionQuestions = equal
    ? ["O que você reconhece nas suas respostas quando pensa na sua rotina atual?", "Que experiências você gostaria de compreender melhor?", "O que você deseja levar desta reflexão para os próximos dias?"]
    : [reflectionByDomain[lower[0]], "O que você reconhece nos domínios que receberam suas maiores médias?", "Sobre o que você gostaria de conversar ou refletir com mais calma?"];
  return { summary, domainPerspective, reflectionQuestions };
}

export function fibaCalculationOriginLabel(origin: string) {
  if (origin === "server") return "Cálculo no servidor";
  if (origin === "client_local") return "Cálculo neste dispositivo";
  if (origin === "client_preview") return "Prévia local sintética";
  return "Origem do cálculo não reconhecida";
}
