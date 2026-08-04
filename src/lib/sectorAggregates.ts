import { supabase } from "@/integrations/supabase/client";

/** Limiar de k-anonimato (LGPD) — replicado no banco via RLS e RPC. */
export const K_ANON_SECTOR = 7;

export interface SectorAggregateRow {
  sector: string;
  response_count: number;
  global_score: number | null;
  global_risk: "verde" | "amarelo" | "vermelho" | null;
  green_count: number;
  yellow_count: number;
  red_count: number;
  last_response_at: string | null;
  computed_at: string | null;
}

/**
 * Recalcula os agregados por setor da empresa a partir das respostas anônimas.
 * Executa via SECURITY DEFINER: apenas membros/owner da empresa são autorizados.
 */
export async function refreshSectorAggregates(companyId: string): Promise<number> {
  const { data, error } = await (supabase.rpc as any)("refresh_sector_aggregates", {
    _company_id: companyId,
  });
  if (error) throw error;
  return Number(data ?? 0);
}

/**
 * Lê apenas setores com n >= 7 (k-anonimato). Setores menores nunca são retornados.
 */
export async function getSectorAggregates(companyId: string): Promise<SectorAggregateRow[]> {
  const { data, error } = await (supabase.rpc as any)("get_sector_aggregates", {
    _company_id: companyId,
  });
  if (error) throw error;
  return (data ?? []) as SectorAggregateRow[];
}
