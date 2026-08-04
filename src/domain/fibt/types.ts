/**
 * FIB-T — Tipos canônicos do domínio metodológico.
 *
 * Este módulo é PURO: não importa React, Supabase, gráficos, PDF ou IA.
 * Nenhum componente visual deve redefinir estes tipos localmente.
 */

/** Escala Likert do instrumento: 0 = Discordo totalmente ... 4 = Concordo totalmente. */
export const LIKERT_MIN = 0;
export const LIKERT_MAX = 4;

export type LikertValue = 0 | 1 | 2 | 3 | 4;

/** Os 3 fatores do FIB-T. */
export type FactorId = 1 | 2 | 3;

/** Os 9 domínios do FIB-T. */
export type DomainId =
  | "padrao_vida"
  | "educacao"
  | "cultura"
  | "bem_estar"
  | "saude"
  | "uso_tempo"
  | "vitalidade"
  | "meio_ambiente"
  | "governanca";

export interface FibtItem {
  readonly id: number;
  readonly text: string;
  readonly domain: DomainId;
  readonly factor: FactorId;
}

/** Respostas cruas indexadas por id do item. */
export type RawAnswers = Record<number, number>;

export interface ScoreCell {
  /** Média dos itens do agrupamento, na escala 0–4. */
  score: number;
  /** Teto da escala, sempre 4. Mantido no contrato por compatibilidade visual. */
  max: number;
  label: string;
  /** Quantidade de itens que compõem o agrupamento — rastreabilidade. */
  itemCount: number;
}

export interface FibtScoreManifest {
  instrument_id: string;
  instrument_version: string;
  scoring_engine_version: string;
  item_map_hash: string;
  missing_data_policy: "fail_closed";
  rounding_policy: string;
  calculated_by: "server" | "client_preview";
}

export interface FibtScoreResult {
  /** Score global 0–100, uma casa decimal. */
  globalScore: number;
  /** Domínios indexados por DomainId. */
  domains: Record<string, ScoreCell>;
  /**
   * Fatores indexados pelas chaves de contrato legadas
   * (`padrao_vida` | `bem_estar` | `satisfacao`), preservadas para não quebrar
   * o dashboard individual e o PDF já existentes.
   */
  factors: Record<string, ScoreCell>;
  manifest: FibtScoreManifest;
}

export type FibtValidationCode =
  | "instrument_mismatch"
  | "version_mismatch"
  | "item_count_mismatch"
  | "unknown_item"
  | "duplicate_item"
  | "missing_item"
  | "value_out_of_scale"
  | "value_not_integer";

export interface FibtValidationIssue {
  code: FibtValidationCode;
  message: string;
  itemId?: number;
}

export interface FibtValidationResult {
  valid: boolean;
  issues: FibtValidationIssue[];
  /** Respostas normalizadas — presente apenas quando `valid` é true. */
  answers?: Record<number, LikertValue>;
}
