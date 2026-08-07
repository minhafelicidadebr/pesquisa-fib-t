import { lazy, Suspense, useState } from "react";
import { FileDown, Loader2, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackIsg } from "@/config/isg";
import { formatIsgDate, type IsgResult } from "@/lib/isgResult";
import { IsgLogo, IsgPilotBadge } from "./IsgBrand";

const IsgAnswersTable = lazy(() =>
  import("./IsgAnswersTable").then((m) => ({ default: m.IsgAnswersTable })),
);

function ScoreBar({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = Math.round((score / max) * 100);
  return (
    <li className="py-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-foreground">{label}</span>
        <span className="text-xs font-medium text-muted-foreground">
          {score.toFixed(2)} <span className="opacity-60">/ {max}</span>
        </span>
      </div>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`${label}: ${score.toFixed(2)} de ${max}`}
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </li>
  );
}

interface Props {
  result: IsgResult;
  answers: Record<number, number>;
}

export function IsgResultDashboard({ result, answers }: Props) {
  const [showTable, setShowTable] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const downloadPdf = async () => {
    if (pdfBusy) return;
    setPdfBusy(true);
    setPdfError(null);
    try {
      const { generateIsgPdf } = await import("@/lib/isgPdf");
      await generateIsgPdf(result);
      trackIsg("isg_pdf_downloaded");
    } catch {
      setPdfError("Não foi possível gerar o relatório agora. Tente novamente.");
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <IsgLogo className="h-8" />
          <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-foreground">
            Pesquisa FIB-T · Resultado Individual
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Uma leitura individual para reflexão sobre sua experiência no trabalho.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Realizada em {formatIsgDate(result.completedAt)}
          </p>
        </div>
        <IsgPilotBadge />
      </header>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Resultado global</p>
        <p className="mt-1 font-heading text-5xl font-semibold text-foreground">
          {result.globalScore.toFixed(1)}
          <span className="ml-2 align-middle text-sm font-normal text-muted-foreground">de 100</span>
        </p>
        {result.summary && (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{result.summary}</p>
        )}
      </section>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <section aria-labelledby="isg-factors" className="rounded-2xl border border-border bg-card p-5">
          <h2 id="isg-factors" className="font-heading text-base font-semibold text-foreground">
            Fatores
          </h2>
          <ul className="mt-2 divide-y divide-border">
            {Object.entries(result.factors).map(([key, cell]) => (
              <ScoreBar key={key} label={cell.label} score={cell.score} max={cell.max} />
            ))}
          </ul>
        </section>

        <section aria-labelledby="isg-domains" className="rounded-2xl border border-border bg-card p-5">
          <h2 id="isg-domains" className="font-heading text-base font-semibold text-foreground">
            Domínios
          </h2>
          <ul className="mt-2 divide-y divide-border">
            {Object.entries(result.domains).map(([key, cell]) => (
              <ScoreBar key={key} label={cell.label} score={cell.score} max={cell.max} />
            ))}
          </ul>
        </section>
      </div>

      {(result.strengths.length > 0 || result.vulnerabilities.length > 0) && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {result.strengths.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-heading text-base font-semibold text-foreground">
                Dimensões mais favoráveis
              </h2>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {result.strengths.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </section>
          )}
          {result.vulnerabilities.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-heading text-base font-semibold text-foreground">
                Pontos de atenção
              </h2>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {result.vulnerabilities.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </section>
          )}
        </div>
      )}

      {result.recommendations.length > 0 && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-heading text-base font-semibold text-foreground">Recomendações</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {result.recommendations.map((r, i) => (
              <li key={i}>{[r.domain, r.action].filter(Boolean).join(" — ")}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="outline" className="h-11" onClick={() => setShowTable((v) => !v)}
          aria-expanded={showTable} aria-controls="isg-answers-panel">
          <Table2 className="mr-2 h-4 w-4" aria-hidden="true" />
          {showTable ? "Ocultar minhas respostas" : "Ver minhas respostas"}
        </Button>
        <Button className="h-11" onClick={downloadPdf} disabled={pdfBusy}>
          {pdfBusy ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          Baixar meu relatório em PDF
        </Button>
      </div>
      <div aria-live="polite" className="min-h-5 text-sm text-destructive">{pdfError}</div>

      <div id="isg-answers-panel">
        {showTable && (
          <Suspense
            fallback={
              <p className="mt-6 text-sm text-muted-foreground">Carregando suas respostas…</p>
            }
          >
            <IsgAnswersTable answers={answers} />
          </Suspense>
        )}
      </div>

      <p className="mt-10 text-xs leading-relaxed text-muted-foreground">
        {result.limitations ??
          "Resultado de autopercepção em um único momento no tempo. Instrumento de pesquisa e autoconhecimento: não é diagnóstico clínico nem avaliação de desempenho."}
      </p>
    </main>
  );
}
