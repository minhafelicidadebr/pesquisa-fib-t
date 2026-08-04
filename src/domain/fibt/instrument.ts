/**
 * FIB-T — FONTE CANÔNICA DO INSTRUMENTO.
 *
 * Referência: FURTADO, C. A. (2020) — Escala de Felicidade Interna Bruta do
 * Trabalhador (FIB-T).
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ REGRA ABSOLUTA                                                          │
 * │ Nenhum componente visual, edge function, prompt de IA ou gerador de PDF │
 * │ pode redefinir a matriz item → fator / item → domínio.                  │
 * │ Esta é a única fonte da verdade. Alterações exigem nova versão + hash.  │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * HISTÓRICO DE VERSÕES
 *
 * 1.0.0-legacy — matriz que vivia embutida em `FibiaChat.tsx`.
 *   Contagens: F1 = 12, F2 = 13, F3 = 7. Item 5 → Fator 2.
 *   Congelada em `__fixtures__/matrix-v0-legacy.json`. NÃO usar em cálculos.
 *
 * 1.1.0 — correção metodológica autorizada (ONDA 1).
 *   Única alteração: item 5 ("rede de apoio social e afetivo") passa de
 *   Fator 2 para Fator 3. Isso reconcilia exatamente a parametrização
 *   esperada: F1 = 12, F2 = 12, F3 = 8, total = 32.
 *
 * QUESTÃO METODOLÓGICA ABERTA (não bloqueante)
 *   O item 18 ("atividades voluntárias de cunho social", domínio
 *   `vitalidade`) permanece no Fator 1, enquanto o item 5 — do mesmo domínio —
 *   está no Fator 3. Fatores e domínios são dimensões metodológicas distintas,
 *   portanto coincidência de domínio não é evidência suficiente para
 *   reagrupar. Pendente de comparação com a fonte primária Furtado (2020).
 *   Decisão: NÃO alterar sem validação documental.
 */

import type { DomainId, FactorId, FibtItem } from "./types";

export const INSTRUMENT_ID = "FIB-T" as const;

/** Versão vigente da matriz. Novos cálculos usam exclusivamente esta versão. */
export const INSTRUMENT_VERSION = "1.1.0" as const;

/** Versão da matriz legada, preservada apenas para leitura de registros históricos. */
export const INSTRUMENT_VERSION_LEGACY = "1.0.0-legacy" as const;

/** Versão do algoritmo de cálculo. Independe da versão da matriz. */
export const SCORING_ENGINE_VERSION = "1.0.0" as const;

/**
 * Política de arredondamento documentada:
 *  - domínios e fatores: média aritmética simples dos itens, 2 casas decimais;
 *  - score global: média das razões domínio/4, multiplicada por 100, 1 casa.
 * O score global usa média não ponderada dos 9 domínios — comportamento
 * preservado da implementação anterior para não alterar resultados silenciosamente.
 */
export const ROUNDING_POLICY =
  "domains_factors:mean_2dp;global:mean_of_domain_ratios_x100_1dp" as const;

export const FIBT_ITEMS: readonly FibtItem[] = Object.freeze([
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
]);

export const FIBT_ITEM_COUNT = 32 as const;

/** Contagem esperada de itens por fator. Validada por teste dourado. */
export const EXPECTED_FACTOR_ITEM_COUNTS: Readonly<Record<FactorId, number>> =
  Object.freeze({ 1: 12, 2: 12, 3: 8 });

export const DOMAIN_LABELS: Readonly<Record<DomainId, string>> = Object.freeze({
  padrao_vida: "Padrão de Vida",
  educacao: "Educação",
  cultura: "Cultura",
  bem_estar: "Bem-Estar Psicológico",
  saude: "Saúde",
  uso_tempo: "Uso do Tempo",
  vitalidade: "Vitalidade Comunitária",
  meio_ambiente: "Meio Ambiente",
  governanca: "Governança",
});

/**
 * Chaves de contrato dos fatores. Preservadas exatamente como o dashboard
 * individual e o PDF já consomem, para que a correção da matriz não quebre
 * a camada visual existente.
 */
export const FACTOR_CONTRACT_KEYS: Readonly<Record<FactorId, string>> =
  Object.freeze({ 1: "padrao_vida", 2: "bem_estar", 3: "satisfacao" });

export const FACTOR_LABELS: Readonly<Record<FactorId, string>> = Object.freeze({
  1: "Padrão de Vida",
  2: "Bem-Estar",
  3: "Satisfação Organizacional",
});

/** Descrições responsáveis, sem linguagem diagnóstica. */
export const FACTOR_DESCRIPTIONS: Readonly<Record<FactorId, string>> =
  Object.freeze({
    1: "Percepções relacionadas a condições materiais de vida, acesso à educação e participação cultural.",
    2: "Percepções relacionadas a bem-estar psicológico, saúde, uso do tempo e relação com o ambiente.",
    3: "Percepções relacionadas ao contexto organizacional, governança e rede de apoio.",
  });

/**
 * Serialização canônica da matriz — base do hash.
 * Formato estável: `id:domain:factor` ordenado por id, unido por `|`.
 * O texto do item NÃO entra no hash: correções de redação não invalidam
 * a rastreabilidade do cálculo.
 */
export function canonicalItemMapString(
  items: readonly FibtItem[] = FIBT_ITEMS,
): string {
  return [...items]
    .sort((a, b) => a.id - b.id)
    .map((i) => `${i.id}:${i.domain}:${i.factor}`)
    .join("|");
}

/**
 * SHA-256 da serialização canônica da matriz 1.1.0.
 * Verificado por teste dourado que recalcula o hash de forma independente.
 * Qualquer alteração na matriz quebra este teste de propósito.
 */
export const ITEM_MAP_HASH =
  "114b70bd9b5d495657704c04546110d390c5b267c4fb31d40901bed7b7b401ed" as const;

const ITEM_INDEX: ReadonlyMap<number, FibtItem> = new Map(
  FIBT_ITEMS.map((i) => [i.id, i]),
);

export function getItem(id: number): FibtItem | undefined {
  return ITEM_INDEX.get(id);
}

export function itemsByFactor(factor: FactorId): FibtItem[] {
  return FIBT_ITEMS.filter((i) => i.factor === factor);
}

export function itemsByDomain(domain: DomainId): FibtItem[] {
  return FIBT_ITEMS.filter((i) => i.domain === domain);
}
