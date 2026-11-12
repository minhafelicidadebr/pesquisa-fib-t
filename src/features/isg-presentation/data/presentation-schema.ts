import { z } from "zod";
import { DOMAIN_LABELS, FACTOR_CONTRACT_KEYS, FIBT_ITEMS } from "@/domain/fibt";

const mean = z.number().finite().min(0).max(4).nullable();
const count = z
  .number()
  .int()
  .nonnegative()
  .max(Number.MAX_SAFE_INTEGER)
  .nullable();
const text = z.string().trim().min(1).max(2000);
const date = z
  .union([z.string().date(), z.string().datetime({ offset: true })])
  .nullable();
const cell = z.object({ key: text, label: text, mean }).strict();
const question = z
  .object({
    id: z.number().int().min(1).max(32),
    text,
    mean,
    responses: count,
    counts: z.array(z.number().int().nonnegative()).length(5).optional(),
    percentages: z
      .array(z.number().finite().min(0).max(100))
      .length(5)
      .optional(),
  })
  .strict();
const base = z.object({
  schemaVersion: z.literal("1"),
  organization: z.literal("ISG"),
  status: text,
  issuedAt: date,
  dataUpdatedAt: date,
  collectionPeriod: z
    .object({ start: z.string().date(), end: z.string().date() })
    .strict()
    .nullable(),
  n: count,
  eligiblePopulation: count,
  suppressed: z.boolean(),
  threshold: count,
  globalScore: z.number().finite().min(0).max(100).nullable(),
  factors: z.array(cell).max(3),
  domains: z.array(cell).max(9),
  questions: z.array(question).max(32),
  sourceRefs: z.array(text).min(1).max(20),
  instrumentVersion: text.nullable(),
  engineVersion: text.nullable(),
  reviewState: z.enum(["document_transcription", "reconciled", "pending"]),
  methodNotes: z
    .array(z.object({ title: text, detail: text }).strict())
    .max(20),
});

export const presentationSchema = z
  .discriminatedUnion("sourceKind", [
    base.extend({ sourceKind: z.literal("historical_report") }).strict(),
    base.extend({ sourceKind: z.literal("current_aggregate") }).strict(),
    base.extend({ sourceKind: z.literal("synthetic_demo") }).strict(),
  ])
  .superRefine((s, ctx) => {
    const fail = (message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, message });
    for (const entries of [s.factors, s.domains]) {
      if (new Set(entries.map((c) => c.key)).size !== entries.length)
        fail("Agrupamento duplicado");
    }
    if (s.domains.some((c) => !(c.key in DOMAIN_LABELS)))
      fail("Domínio desconhecido");
    if (
      s.factors.some(
        (c) => !Object.values(FACTOR_CONTRACT_KEYS).includes(c.key),
      )
    )
      fail("Fator desconhecido");
    if (new Set(s.questions.map((q) => q.id)).size !== s.questions.length)
      fail("Questão duplicada");
    if (s.threshold !== null && s.threshold < 1) fail("Limiar inválido");
    if (
      !s.suppressed &&
      s.n !== null &&
      s.threshold !== null &&
      s.n < s.threshold
    )
      fail("Base abaixo do limiar: resultados devem ser suprimidos");
    if (
      s.suppressed &&
      (s.globalScore !== null ||
        s.n !== null ||
        s.factors.length ||
        s.domains.length ||
        s.questions.length)
    )
      fail("Fonte suprimida não pode conter resultados");
    if (s.collectionPeriod && s.collectionPeriod.start > s.collectionPeriod.end)
      fail("Período invertido");
    for (const q of s.questions) {
      if (FIBT_ITEMS.find((i) => i.id === q.id)?.text !== q.text)
        fail(
          "Enunciado diverge da matriz consultada; conferir a versão antes de importar",
        );
      if (q.responses !== null && s.n !== null && q.responses > s.n)
        fail("Denominador por item excede a base");
      if (q.responses === 0 && q.mean !== null) fail("Média sem respostas");
      if (q.counts) {
        if (
          q.responses === null ||
          q.counts.reduce((a, b) => a + b, 0) !== q.responses
        )
          fail("Contagens não correspondem ao denominador");
      }
      if (q.percentages) {
        if (!q.counts || q.responses === null)
          fail("Distribuição exige contagens e denominador positivo");
        else if (q.responses === 0) {
          if (q.percentages.some((p) => p !== 0))
            fail("Percentuais sem respostas");
        } else {
          // A API arredonda cada percentual a uma casa: erro máximo de 0,05 pp por categoria.
          if (
            q.percentages.some(
              (p, i) => Math.abs(p - (q.counts[i] / q.responses) * 100) > 0.051,
            )
          )
            fail("Percentuais incompatíveis com as contagens");
          if (Math.abs(q.percentages.reduce((a, b) => a + b, 0) - 100) > 0.251)
            fail("Distribuição incompatível");
        }
      }
    }
  });
// Sem strictNullChecks no projeto, Required restaura os campos que o Zod
// efetivamente exige em tempo de execução.
type ParsedSnapshot = z.infer<typeof presentationSchema>;
export type SnapshotCell = Required<z.infer<typeof cell>>;
type SnapshotQuestion = Required<
  Omit<z.infer<typeof question>, "counts" | "percentages">
> &
  Pick<z.infer<typeof question>, "counts" | "percentages">;
export type PresentationSnapshot = Required<
  Omit<ParsedSnapshot, "factors" | "domains" | "questions" | "methodNotes">
> & {
  factors: SnapshotCell[];
  domains: SnapshotCell[];
  questions: SnapshotQuestion[];
  methodNotes: Array<{ title: string; detail: string }>;
};
export type SourceKind = PresentationSnapshot["sourceKind"];
export const MAX_IMPORT_BYTES = 256 * 1024;

export async function parseHistoricalFile(
  file: File,
): Promise<PresentationSnapshot> {
  if (file.size > MAX_IMPORT_BYTES)
    throw new Error("Arquivo maior que 256 KB.");
  const parsed = presentationSchema.safeParse(JSON.parse(await file.text()));
  if (!parsed.success || parsed.data.sourceKind !== "historical_report")
    throw new Error(
      "Arquivo histórico incompatível. Confira o contrato, a versão dos enunciados e as regras de supressão.",
    );
  return parsed.data as PresentationSnapshot;
}

export const formatNumber = (value: number | null | undefined, digits = 2) =>
  value == null
    ? "Não informado"
    : value.toLocaleString("pt-BR", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
export const formatDate = (value: string | null | undefined) =>
  value
    ? new Date(
        value.length === 10 ? `${value}T12:00:00` : value,
      ).toLocaleDateString("pt-BR")
    : "Não informado";
export const SOURCE_LABELS: Record<SourceKind, string> = {
  historical_report: "Retrato histórico",
  current_aggregate: "Agregado atual",
  synthetic_demo: "Demonstração fictícia",
};

export function tiedExtremes(cells: PresentationSnapshot["domains"]) {
  const available = cells.filter((c) => c.mean !== null);
  if (!available.length) return null;
  const values = available.map((c) => c.mean!);
  return {
    highest: available.filter((c) => c.mean === Math.max(...values)),
    lowest: available.filter((c) => c.mean === Math.min(...values)),
  };
}
