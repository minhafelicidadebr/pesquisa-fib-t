/** FIB-A: student adaptation. Independent from the occupational FIB-T instrument.
 * Questions: supplied student form; scoring: existing app FIB-T algorithm.
 * One shared source for browser and Deno; no database, network, UI or AI dependencies.
 */
export const FIBA_ID = "FIB-A";
export const FIBA_VERSION = "0.1.0";
export const FIBA_ENGINE_VERSION = "1.0.0";
export const FIBA_ROUNDING = "domains_factors:mean_2dp;global:mean_of_domain_ratios_x100_1dp";
export const FIBA_SOURCE_HASH = "4978e3992af3d8a4ea605f71637dc719150f0d68b66436376e1087f8b05cc637";
export const FIBA_MAP_HASH = "b71f364084a6c66414015e627032484c78ccc831b34248902edb4dfa67a3c8c0";
export const FIBA_CONTENT_HASH = "607691b2e283f9d7d550b9e0cb5a3c18a5102a877f3aa15249f516c991ebe3ba";
export const FIBA_DOMAINS = {
  padrao_vida: "Padrão de Vida", educacao: "Educação", cultura: "Cultura",
  bem_estar: "Bem-Estar Psicológico", saude: "Saúde", uso_tempo: "Uso do Tempo",
  vitalidade: "Vitalidade Comunitária", meio_ambiente: "Meio Ambiente", governanca: "Governança",
} as const;
export type FibaDomain = keyof typeof FIBA_DOMAINS;
export const FIBA_FACTORS = {
  1: "Padrão de Vida, Educação e Cultura", 2: "Bem-Estar", 3: "Governança (Satisfação com a Escola)",
} as const;
export const FIBA_FACTOR_COUNTS = { 1: 9, 2: 15, 3: 5 } as const;
export const FIBA_LIKERT = [
  "Discordo totalmente", "Discordo parcialmente", "Não concordo e nem discordo (Neutro)",
  "Concordo parcialmente", "Concordo totalmente",
] as const;
export interface FibaItem { readonly id: number; readonly text: string; readonly domain: FibaDomain; readonly factor: 1 | 2 | 3 }
export const FIBA_ITEMS: readonly FibaItem[] = [
  {
    "id": 1,
    "text": "Minha situação atual (ou familiar) me permite ter uma vida com dignidade.",
    "domain": "padrao_vida",
    "factor": 1
  },
  {
    "id": 2,
    "text": "Consigo realizar projetos de longo prazo que envolvem algum investimento (como curso, viagem ou aquisição de um bem).",
    "domain": "padrao_vida",
    "factor": 1
  },
  {
    "id": 3,
    "text": "Nos últimos 12 meses fiz ao menos uma viagem de lazer.",
    "domain": "padrao_vida",
    "factor": 1
  },
  {
    "id": 4,
    "text": "Nos últimos 12 meses experimentei realização pessoal (nos estudos ou vida).",
    "domain": "educacao",
    "factor": 1
  },
  {
    "id": 5,
    "text": "Nos últimos 12 meses estive engajado em algum tipo de treinamento formal (como a própria escola, cursos técnicos, idiomas, etc.).",
    "domain": "educacao",
    "factor": 1
  },
  {
    "id": 6,
    "text": "Me sinto incentivado(a) a aprender e aplicar novos conhecimentos na escola.",
    "domain": "educacao",
    "factor": 1
  },
  {
    "id": 7,
    "text": "Nos últimos 12 meses adquiri e/ou li livros (não obrigatórios pela escola).",
    "domain": "cultura",
    "factor": 1
  },
  {
    "id": 8,
    "text": "Nos últimos 12 meses assisti a filmes e/ou documentários (culturais, educativos).",
    "domain": "cultura",
    "factor": 1
  },
  {
    "id": 9,
    "text": "Nos últimos 12 meses fui a exposições de arte ou eventos culturais.",
    "domain": "cultura",
    "factor": 1
  },
  {
    "id": 10,
    "text": "Sinto que minha vida (ou meus estudos) tem propósito e valor.",
    "domain": "bem_estar",
    "factor": 2
  },
  {
    "id": 11,
    "text": "Em minha rotina atual, experimento mais emoções positivas que negativas.",
    "domain": "bem_estar",
    "factor": 2
  },
  {
    "id": 12,
    "text": "Considero-me uma pessoa feliz.",
    "domain": "bem_estar",
    "factor": 2
  },
  {
    "id": 13,
    "text": "Estou satisfeito com minha saúde emocional.",
    "domain": "bem_estar",
    "factor": 2
  },
  {
    "id": 14,
    "text": "O estresse (escolar, social) não compromete meu bem-estar.",
    "domain": "bem_estar",
    "factor": 2
  },
  {
    "id": 15,
    "text": "Em geral, minhas horas de sono são suficientes para meu repouso.",
    "domain": "saude",
    "factor": 2
  },
  {
    "id": 16,
    "text": "Realizo exercícios físicos regularmente.",
    "domain": "saude",
    "factor": 2
  },
  {
    "id": 17,
    "text": "Meu peso é considerado saudável.",
    "domain": "saude",
    "factor": 2
  },
  {
    "id": 18,
    "text": "Consigo administrar meu tempo, mantendo uma rotina equilibrada entre estudos e lazer.",
    "domain": "uso_tempo",
    "factor": 2
  },
  {
    "id": 19,
    "text": "Tenho tempo suficiente para descansar e me recuperar.",
    "domain": "uso_tempo",
    "factor": 2
  },
  {
    "id": 20,
    "text": "Considero que tenho uma rede de apoio social e afetivo caso enfrente um problema.",
    "domain": "vitalidade",
    "factor": 2
  },
  {
    "id": 21,
    "text": "Minha rotina prevê tempo para estar com os amigos.",
    "domain": "vitalidade",
    "factor": 2
  },
  {
    "id": 22,
    "text": "Me sinto parte integrante da equipe/turma em que estudo.",
    "domain": "vitalidade",
    "factor": 2
  },
  {
    "id": 23,
    "text": "Tenho práticas diárias de responsabilidade ambiental, como uso racional de água e energia e separação do lixo.",
    "domain": "meio_ambiente",
    "factor": 2
  },
  {
    "id": 24,
    "text": "Sinto-me engajado(a) em iniciativas de responsabilidade socioambiental.",
    "domain": "meio_ambiente",
    "factor": 2
  },
  {
    "id": 25,
    "text": "Confio nos gestores/diretores da escola.",
    "domain": "governanca",
    "factor": 3
  },
  {
    "id": 26,
    "text": "A escola valoriza a conduta ética dos alunos e professores.",
    "domain": "governanca",
    "factor": 3
  },
  {
    "id": 27,
    "text": "Tenho direito de liberdade de expressão e opinião na escola.",
    "domain": "governanca",
    "factor": 3
  },
  {
    "id": 28,
    "text": "Considero a comunicação interna da escola (entre alunos e coordenação) eficaz.",
    "domain": "governanca",
    "factor": 3
  },
  {
    "id": 29,
    "text": "Acredito que as decisões da escola são tomadas com ética e transparência.",
    "domain": "governanca",
    "factor": 3
  }
].map(item => Object.freeze(item as FibaItem));
Object.freeze(FIBA_ITEMS);
export interface FibaEntry { id: number; answer: number }
export interface FibaCell { score: number; max: 4; label: string; itemCount: number }
export interface FibaManifest {
  instrument_id: typeof FIBA_ID; instrument_version: string; scoring_engine_version: string;
  item_map_hash: string; item_content_hash: string; source_hash: string;
  item_count: 29; scale: "0-4"; missing_data_policy: "fail_closed"; rounding_policy: string;
  calculated_by: "server" | "client_preview";
}
export interface FibaResult {
  globalScore: number; factors: Record<string, FibaCell>; domains: Record<FibaDomain, FibaCell>;
  manifest: FibaManifest; completedAt: string;
}
export class FibaValidationError extends Error {
  constructor(readonly code: string, readonly itemId?: number) { super(code); this.name = "FibaValidationError"; }
}
const round = (value: number, dp: number) => Math.round((value + Number.EPSILON) * 10 ** dp) / 10 ** dp;
export function validateFiba(input: unknown): FibaEntry[] {
  if (!Array.isArray(input) || input.length !== 29) throw new FibaValidationError("item_count_mismatch");
  const seen = new Set<number>();
  return input.map(raw => {
    if (!raw || typeof raw !== "object") throw new FibaValidationError("invalid_item");
    if (Object.keys(raw).some(key => !["id", "answer"].includes(key))) throw new FibaValidationError("invalid_item");
    const { id, answer } = raw;
    if (!Number.isInteger(id) || id < 1 || id > 29) throw new FibaValidationError("unknown_item");
    if (seen.has(id)) throw new FibaValidationError("duplicate_item", id);
    seen.add(id);
    if (typeof answer !== "number" || !Number.isFinite(answer) || !Number.isInteger(answer)) throw new FibaValidationError("value_not_integer", id);
    if (answer < 0 || answer > 4) throw new FibaValidationError("value_out_of_scale", id);
    return { id, answer };
  });
}
/** Same operation order and rounding as the app FIB-T engine, with the FIB-A matrix. */
export function scoreFiba(input: unknown, calculatedBy: FibaManifest["calculated_by"] = "client_preview") {
  const answers = new Map(validateFiba(input).map(e => [e.id, e.answer]));
  const cell = (items: readonly FibaItem[], label: string): FibaCell => ({
    score: round(items.reduce((sum, item) => sum + answers.get(item.id)!, 0) / items.length, 2),
    max: 4, label, itemCount: items.length,
  });
  const domains = Object.fromEntries(Object.entries(FIBA_DOMAINS).map(([key, label]) => [key, cell(FIBA_ITEMS.filter(i => i.domain === key), label)])) as Record<FibaDomain, FibaCell>;
  const factors = Object.fromEntries(Object.entries(FIBA_FACTORS).map(([id, label]) => [id, cell(FIBA_ITEMS.filter(i => i.factor === Number(id)), label)]));
  const globalScore = round(Object.values(domains).reduce((sum, d) => sum + d.score / 4, 0) / 9 * 100, 1);
  const manifest: FibaManifest = {
    instrument_id: FIBA_ID, instrument_version: FIBA_VERSION, scoring_engine_version: FIBA_ENGINE_VERSION,
    item_map_hash: FIBA_MAP_HASH, item_content_hash: FIBA_CONTENT_HASH, source_hash: FIBA_SOURCE_HASH,
    item_count: 29, scale: "0-4", missing_data_policy: "fail_closed", rounding_policy: FIBA_ROUNDING,
    calculated_by: calculatedBy,
  };
  return { globalScore, domains, factors, manifest };
}
export function isCanonicalFiba(value: unknown): value is FibaResult {
  if (!value || typeof value !== "object") return false;
  const r = value as FibaResult;
  const m = r.manifest;
  if (!m || m.instrument_id !== FIBA_ID || m.instrument_version !== FIBA_VERSION ||
      m.scoring_engine_version !== FIBA_ENGINE_VERSION || m.item_map_hash !== FIBA_MAP_HASH ||
      m.item_content_hash !== FIBA_CONTENT_HASH || m.source_hash !== FIBA_SOURCE_HASH ||
      m.calculated_by !== "server" || m.item_count !== 29 || m.scale !== "0-4" ||
      m.missing_data_policy !== "fail_closed" || m.rounding_policy !== FIBA_ROUNDING ||
      !Number.isFinite(r.globalScore) || r.globalScore < 0 || r.globalScore > 100 ||
      typeof r.completedAt !== "string" || !Number.isFinite(Date.parse(r.completedAt))) return false;
  const validCells = (cells: Record<string, FibaCell>, expected: Record<string, string>, factor: boolean) =>
    cells && Object.keys(cells).length === Object.keys(expected).length && Object.entries(expected).every(([key, label]) => {
      const c = cells[key];
      const count = FIBA_ITEMS.filter(i => factor ? i.factor === Number(key) : i.domain === key).length;
      return c && c.label === label && c.max === 4 && c.itemCount === count && Number.isFinite(c.score) && c.score >= 0 && c.score <= 4;
    });
  return !!validCells(r.domains, FIBA_DOMAINS, false) && !!validCells(r.factors, FIBA_FACTORS, true);
}
