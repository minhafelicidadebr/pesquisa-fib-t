/**
 * Painel Executivo FIB-T — acesso IFT e agregados do pré-teste ISG.
 *
 * O cliente NUNCA conhece a senha administrativa. Ele envia o candidato para a
 * edge function `isg-results`, recebe um token de sessão curto assinado no
 * servidor e usa esse token nas leituras. Os agregados chegam prontos:
 * o frontend não recalcula escore, apenas apresenta.
 */

import { supabase } from "@/integrations/supabase/client";
import { DOMAIN_LABELS, FACTOR_LABELS, FIBT_ITEMS } from "@/domain/fibt";
import { LIKERT_LABELS } from "@/lib/isgCsv";

const SESSION_KEY = "isg_results_session";
export const GENERIC_ERROR = "Não foi possível validar o acesso.";

export interface AggregateCell {
  key: string;
  label: string;
  mean: number;
}

export interface AggregateQuestion {
  id: number;
  responses: number;
  mean: number | null;
  counts: number[];
  percentages: number[];
}

export interface IsgAggregate {
  threshold: number;
  suppressed: boolean;
  status: string;
  nLabel?: string;
  n?: number;
  globalScore?: number;
  factors?: AggregateCell[];
  domains?: AggregateCell[];
  questions?: AggregateQuestion[];
  lastUpdatedAt?: string | null;
}

interface StoredSession {
  token: string;
  expiresAt: number;
  role: "ift";
}

export function readSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as StoredSession;
    if (
      !s?.token ||
      s.role !== "ift" ||
      typeof s.expiresAt !== "number" ||
      Date.now() >= s.expiresAt
    ) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function clearSession(notify = true) {
  sessionStorage.removeItem(SESSION_KEY);
  if (notify) {
    window.dispatchEvent(new Event("isg-results-session-ended"));
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel("isg-results-lifecycle");
      channel.postMessage({ type: "session-ended" });
      channel.close();
    }
  }
}

/** Troca a senha por uma sessão administrativa temporária. */
export async function loginResults(password: string): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke("isg-results", {
    body: { action: "login", password },
  });
  if (error || !data?.ok || !data?.token || data.role !== "ift") return false;
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ token: data.token, expiresAt: data.expiresAt, role: data.role }),
  );
  return true;
}

export class IsgSessionExpired extends Error {}

export async function fetchAggregates(): Promise<IsgAggregate> {
  const session = readSession();
  if (!session) throw new IsgSessionExpired(GENERIC_ERROR);
  const { data, error } = await supabase.functions.invoke("isg-results", {
    body: { action: "aggregates", token: session.token },
  });
  if (error || !data?.ok) {
    clearSession();
    throw new IsgSessionExpired(GENERIC_ERROR);
  }
  return data as IsgAggregate;
}

/* ─────────── Derivações determinísticas (sem recálculo de escore) ─────────── */

const ITEM_ORDER = new Map(FIBT_ITEMS.map((item, index) => [item.id, index + 1]));

export interface QuestionRow extends AggregateQuestion {
  number: number;
  text: string;
  factor: string;
  domain: string;
}

export function buildQuestionRows(questions: AggregateQuestion[]): QuestionRow[] {
  return questions
    .map((q) => {
      const item = FIBT_ITEMS.find((i) => i.id === q.id);
      if (!item) return null;
      return {
        ...q,
        number: ITEM_ORDER.get(q.id) ?? q.id,
        text: item.text,
        factor: FACTOR_LABELS[item.factor],
        domain: DOMAIN_LABELS[item.domain],
      } satisfies QuestionRow;
    })
    .filter((r): r is QuestionRow => r !== null)
    .sort((a, b) => a.number - b.number);
}

export function extremes(cells: AggregateCell[] | undefined) {
  if (!cells?.length) return null;
  const sorted = [...cells].sort((a, b) => b.mean - a.mean);
  return { highest: sorted[0], lowest: sorted[sorted.length - 1] };
}

export const LIKERT_ORDER = [0, 1, 2, 3, 4] as const;
export const LIKERT_COLUMNS = LIKERT_ORDER.map((v) => LIKERT_LABELS[v]);

/* ─────────────────────────── CSV agregado ─────────────────────────── */

function cell(value: string | number | null): string {
  const s = value === null ? "—" : String(value);
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Sem ids internos, tokens, setores, respostas individuais ou metadados técnicos. */
export function buildAggregateCsv(agg: IsgAggregate): string {
  const rows = buildQuestionRows(agg.questions ?? []);
  const header = [
    "question_number",
    "question_text",
    "factor",
    "domain",
    "mean",
    "aggregate_count",
    ...LIKERT_COLUMNS.map((l) => `pct_${l}`),
  ];
  const lines = [
    header.map(cell).join(";"),
    ...rows.map((r) =>
      [
        r.number,
        r.text,
        r.factor,
        r.domain,
        r.mean,
        r.responses,
        ...r.percentages,
      ]
        .map(cell)
        .join(";"),
    ),
  ];
  return "\uFEFF" + lines.join("\r\n");
}

export function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
