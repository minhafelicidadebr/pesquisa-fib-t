/**
 * FIB-T — Manifesto metodológico.
 *
 * Todo resultado calculado carrega um manifesto que permite reproduzir
 * exatamente o cálculo no futuro, mesmo após novas versões da matriz.
 */

import {
  INSTRUMENT_ID,
  INSTRUMENT_VERSION,
  ITEM_MAP_HASH,
  ROUNDING_POLICY,
  SCORING_ENGINE_VERSION,
} from "./instrument";
import type { FibtScoreManifest } from "./types";

export function buildManifest(
  calculatedBy: FibtScoreManifest["calculated_by"],
): FibtScoreManifest {
  return {
    instrument_id: INSTRUMENT_ID,
    instrument_version: INSTRUMENT_VERSION,
    scoring_engine_version: SCORING_ENGINE_VERSION,
    item_map_hash: ITEM_MAP_HASH,
    missing_data_policy: "fail_closed",
    rounding_policy: ROUNDING_POLICY,
    calculated_by: calculatedBy,
  };
}

/**
 * Um resultado é canônico apenas quando foi calculado pelo servidor com a
 * versão vigente da matriz. Resultados de pré-visualização no cliente NUNCA
 * devem ser persistidos como verdade.
 */
export function isCanonicalManifest(m: FibtScoreManifest | null | undefined): boolean {
  if (!m) return false;
  return (
    m.calculated_by === "server" &&
    m.instrument_id === INSTRUMENT_ID &&
    m.instrument_version === INSTRUMENT_VERSION &&
    m.item_map_hash === ITEM_MAP_HASH
  );
}
