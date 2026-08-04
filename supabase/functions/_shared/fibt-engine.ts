/**
 * FIB-T — ENGINE DETERMINÍSTICO (cópia servidor / Deno).
 *
 * Espelho fiel de `src/domain/fibt/` para execução em Edge Functions, onde não
 * é possível importar do bundle do frontend.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ Esta cópia é verificada contra a fonte canônica pelo teste              │
 * │ `src/domain/fibt/__tests__/server-engine-parity.test.ts`, que compara   │
 * │ item por item e o ITEM_MAP_HASH. Divergência quebra a suíte de propósito.│
 * │ Ao alterar a matriz, altere OS DOIS arquivos.                            │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * O LLM NÃO participa deste cálculo em nenhuma etapa.
 */

export const INSTRUMENT_ID = "FIB-T";
export const INSTRUMENT_VERSION = "1.1.0";
export const SCORING_ENGINE_VERSION = "1.0.0";
export const ITEM_MAP_HASH =
  "114b70bd9b5d495657704c04546110d390c5b267c4fb31d40901bed7b7b401ed";
export const ROUNDING_POLICY =
  "domains_factors:mean_2dp;global:mean_of_domain_ratios_x100_1dp";
export const LIKERT_MIN = 0;
export const LIKERT_MAX = 4;
export const FIBT_ITEM_COUNT = 32;

export interface FibtItem {
  id: number;
  text: string;
  domain: string;
  factor: 1 | 2 | 3;
}

export const FIBT_ITEMS: FibtItem[] = [
  { id: 1, text: "A casa em que moro é própria.", domain: "padrao_vida", factor: 1 },
  { id: 2, text: "Nos últimos 12 meses experimentei realização pessoal.", domain: "cultura", factor: 1 },
  { id: 3, text: "A organização valoriza a conduta ética de seus colaboradores.", domain: "governanca", factor: 3 },
  { id: 4, text: "Confio nos gestores da organização.", domain: "governanca", factor: 3 },
  { id: 5, text: "Considero que tenho uma rede de apoio social e afetivo caso enfrente um problema.", domain: "vitalidade", factor: 3 },
  { id: 6, text: "Nos últimos 12 meses assisti a filmes e/ou documentários.", domain: "cultura", factor: 1 },
  { id: 7, text: "Considero-me uma pessoa feliz.", domain: "bem_estar", factor: 2 },
  { id: 8, text: "Consigo realizar projetos de longo prazo que envolvem algum investimento financeiro.", domain: "padrao_vida", factor: 1 },
  { id: 9, text: "Em geral, minhas horas de sono são suficientes para meu repouso.", domain: "saude", factor: 2 },
  { id: 10, text: "Em minha rotina atual, experimento mais emoções positivas que negativas.", domain: "bem_estar", factor: 2 },
  { id: 11, text: "Considero que sei administrar meu tempo, mantendo uma rotina equilibrada.", domain: "uso_tempo", factor: 2 },
  { id: 12, text: "Estou satisfeito com as oportunidades de treinamento oferecidas pela organização.", domain: "governanca", factor: 3 },
  { id: 13, text: "Meu horário de trabalho é flexível caso enfrente situações emergenciais.", domain: "governanca", factor: 3 },
  { id: 14, text: "Estou satisfeito com minha saúde emocional.", domain: "bem_estar", factor: 2 },
  { id: 15, text: "Meu peso é considerado saudável.", domain: "saude", factor: 2 },
  { id: 16, text: "Nos últimos 12 meses fiz ao menos uma viagem de lazer.", domain: "padrao_vida", factor: 1 },
  { id: 17, text: "Meu rendimento atual me permite viver com dignidade.", domain: "padrao_vida", factor: 1 },
  { id: 18, text: "Nos últimos 12 meses realizei atividades voluntárias de cunho social.", domain: "vitalidade", factor: 1 },
  { id: 19, text: "Minha rotina prevê tempo para estar com os amigos.", domain: "uso_tempo", factor: 2 },
  { id: 20, text: "Considero a comunicação interna da organização eficaz.", domain: "governanca", factor: 3 },
  { id: 21, text: "Nos últimos 12 meses adquiri e/ou li livros.", domain: "educacao", factor: 1 },
  { id: 22, text: "Tenho práticas diárias de responsabilidade ambiental.", domain: "meio_ambiente", factor: 2 },
  { id: 23, text: "Nos últimos 12 meses desfrutei de festas populares, como Carnaval e São João.", domain: "cultura", factor: 1 },
  { id: 24, text: "O estresse não compromete meu bem-estar.", domain: "saude", factor: 2 },
  { id: 25, text: "Nos últimos 12 meses fui a exposições de arte.", domain: "cultura", factor: 1 },
  { id: 26, text: "Os gestores da organização compartilham estratégias, metas e realizações.", domain: "governanca", factor: 3 },
  { id: 27, text: "Nos últimos 12 meses participei de treinamento voltado ao meu desenvolvimento pessoal.", domain: "educacao", factor: 1 },
  { id: 28, text: "Realizo exercícios físicos regularmente.", domain: "saude", factor: 2 },
  { id: 29, text: "Tenho direito de liberdade de expressão e opinião na organização.", domain: "governanca", factor: 3 },
  { id: 30, text: "Nos últimos 12 meses estive saudável.", domain: "saude", factor: 2 },
  { id: 31, text: "Tenho um propósito maior em minha vida.", domain: "bem_estar", factor: 2 },
  { id: 32, text: "Nos últimos 12 meses estive engajado em algum tipo de treinamento formal.", domain: "educacao", factor: 1 },
];

export const EXPECTED_FACTOR_ITEM_COUNTS: Record<number, number> = { 1: 12, 2: 12, 3: 8 };

export const DOMAIN_LABELS: Record<string, string> = {
  padrao_vida: "Padrão de Vida",
  educacao: "Educação",
  cultura: "Cultura",
  bem_estar: "Bem-Estar Psicológico",
  saude: "Saúde",
  uso_tempo: "Uso do Tempo",
  vitalidade: "Vitalidade Comunitária",
  meio_ambiente: "Meio Ambiente",
  governanca: "Governança",
};

const DOMAIN_ORDER = Object.keys(DOMAIN_LABELS);

export const FACTOR_CONTRACT_KEYS: Record<number, string> = {
  1: "padrao_vida",
  2: "bem_estar",
  3: "satisfacao",
};

export const FACTOR_LABELS: Record<number, string> = {
  1: "Padrão de Vida",
  2: "Bem-Estar",
  3: "Satisfação Organizacional",
};

export interface ScoreCell {
  score: number;
  max: number;
  label: string;
  itemCount: number;
}

export interface FibtScoreManifest {
  instrument_id: string;
  instrument_version: string;
  scoring_engine_version: string;
  item_map_hash: string;
  missing_data_policy: "fail_closed";
  rounding_policy: string;
  calculated_by: "server";
}

export interface FibtScoreResult {
  globalScore: number;
  domains: Record<string, ScoreCell>;
  factors: Record<string, ScoreCell>;
  manifest: FibtScoreManifest;
}

export interface ValidationIssue {
  code: string;
  message: string;
  itemId?: number;
}

const ITEM_INDEX = new Map<number, FibtItem>(FIBT_ITEMS.map((i) => [i.id, i]));

function round(value: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * f) / f;
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export interface AnswerEntry {
  id: number;
  answer: number;
}

/** Validação fail-closed: 32 itens válidos ou nada é calculado. */
export function validateFibtAnswers(
  input: Record<number, number> | AnswerEntry[],
  options: { instrumentId?: string; instrumentVersion?: string } = {},
): { valid: boolean; issues: ValidationIssue[]; answers?: Record<number, number> } {
  const issues: ValidationIssue[] = [];

  if (options.instrumentId !== undefined && options.instrumentId !== INSTRUMENT_ID) {
    issues.push({
      code: "instrument_mismatch",
      message: `Instrumento incompatível: esperado "${INSTRUMENT_ID}".`,
    });
  }
  if (
    options.instrumentVersion !== undefined &&
    options.instrumentVersion !== INSTRUMENT_VERSION
  ) {
    issues.push({
      code: "version_mismatch",
      message: `Versão incompatível: esperado "${INSTRUMENT_VERSION}".`,
    });
  }

  let entries: AnswerEntry[];
  if (Array.isArray(input)) {
    const seen = new Set<number>();
    for (const e of input) {
      const id = Number(e.id);
      if (seen.has(id)) {
        issues.push({ code: "duplicate_item", message: `Item ${id} duplicado.`, itemId: id });
      }
      seen.add(id);
    }
    entries = input.map((e) => ({ id: Number(e.id), answer: e.answer }));
  } else {
    entries = Object.entries(input).map(([id, answer]) => ({
      id: Number(id),
      answer: answer as number,
    }));
  }

  const answers: Record<number, number> = {};
  for (const { id, answer } of entries) {
    if (!ITEM_INDEX.has(id)) {
      issues.push({ code: "unknown_item", message: `Item ${id} desconhecido.`, itemId: id });
      continue;
    }
    if (typeof answer !== "number" || !Number.isInteger(answer)) {
      issues.push({
        code: "value_not_integer",
        message: `Item ${id}: a escala aceita apenas inteiros.`,
        itemId: id,
      });
      continue;
    }
    if (answer < LIKERT_MIN || answer > LIKERT_MAX) {
      issues.push({
        code: "value_out_of_scale",
        message: `Item ${id}: valor fora da escala ${LIKERT_MIN}–${LIKERT_MAX}.`,
        itemId: id,
      });
      continue;
    }
    answers[id] = answer;
  }

  for (const item of FIBT_ITEMS) {
    if (answers[item.id] === undefined) {
      issues.push({
        code: "missing_item",
        message: `Item ${item.id} não respondido.`,
        itemId: item.id,
      });
    }
  }

  if (Object.keys(answers).length !== FIBT_ITEM_COUNT) {
    issues.push({
      code: "item_count_mismatch",
      message: `Esperados ${FIBT_ITEM_COUNT} itens válidos.`,
    });
  }

  if (issues.length > 0) return { valid: false, issues };
  return { valid: true, issues: [], answers };
}

export class FibtScoringError extends Error {
  issues: ValidationIssue[];
  constructor(issues: ValidationIssue[]) {
    super("FIB-T: respostas inválidas.");
    this.name = "FibtScoringError";
    this.issues = issues;
  }
}

/** Fonte canônica de cálculo do servidor. Determinístico, sem IA e sem rede. */
export function scoreFibt(
  input: Record<number, number> | AnswerEntry[],
  options: { instrumentId?: string; instrumentVersion?: string } = {},
): FibtScoreResult {
  const validation = validateFibtAnswers(input, options);
  if (!validation.valid || !validation.answers) {
    throw new FibtScoringError(validation.issues);
  }
  const answers = validation.answers;

  const domainBuckets: Record<string, number[]> = {};
  const factorBuckets: Record<number, number[]> = { 1: [], 2: [], 3: [] };
  for (const item of FIBT_ITEMS) {
    if (!domainBuckets[item.domain]) domainBuckets[item.domain] = [];
    domainBuckets[item.domain].push(answers[item.id]);
    factorBuckets[item.factor].push(answers[item.id]);
  }

  const domains: Record<string, ScoreCell> = {};
  for (const key of DOMAIN_ORDER) {
    const values = domainBuckets[key];
    domains[key] = {
      score: round(mean(values), 2),
      max: LIKERT_MAX,
      label: DOMAIN_LABELS[key],
      itemCount: values.length,
    };
  }

  const factors: Record<string, ScoreCell> = {};
  for (const factor of [1, 2, 3]) {
    const values = factorBuckets[factor];
    if (values.length !== EXPECTED_FACTOR_ITEM_COUNTS[factor]) {
      throw new Error(
        `FIB-T: matriz inconsistente — Fator ${factor} tem ${values.length} itens.`,
      );
    }
    factors[FACTOR_CONTRACT_KEYS[factor]] = {
      score: round(mean(values), 2),
      max: LIKERT_MAX,
      label: FACTOR_LABELS[factor],
      itemCount: values.length,
    };
  }

  const globalScore = round(
    mean(DOMAIN_ORDER.map((k) => domains[k].score / domains[k].max)) * 100,
    1,
  );

  return {
    globalScore,
    domains,
    factors,
    manifest: {
      instrument_id: INSTRUMENT_ID,
      instrument_version: INSTRUMENT_VERSION,
      scoring_engine_version: SCORING_ENGINE_VERSION,
      item_map_hash: ITEM_MAP_HASH,
      missing_data_policy: "fail_closed",
      rounding_policy: ROUNDING_POLICY,
      calculated_by: "server",
    },
  };
}

/** Domínios ordenados por score, com desempate estável pela chave. */
export function rankDomains(
  domains: Record<string, ScoreCell>,
  direction: "desc" | "asc",
): Array<{ key: string; label: string; score: number }> {
  return Object.entries(domains)
    .map(([key, cell]) => ({ key, label: cell.label, score: cell.score }))
    .sort((a, b) =>
      a.score === b.score
        ? a.key.localeCompare(b.key)
        : direction === "desc"
          ? b.score - a.score
          : a.score - b.score,
    );
}
