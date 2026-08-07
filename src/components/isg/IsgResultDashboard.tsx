import { lazy, Suspense, useMemo, useState } from "react";
import { FileDown, Loader2, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FIBT_SCALE_MAX, trackIsg } from "@/config/isg";
import { formatIsgDate, type IsgResult } from "@/lib/isgResult";
import { IsgCitation, IsgLogo, IsgPilotBadge } from "./IsgBrand";
import {
  IsgDomainRadar,
  IsgMeterRow,
  IsgReveal,
  IsgScoreGauge,
} from "./viz/IsgCharts";

const IsgAnswersTable = lazy(() =>
  import("./IsgAnswersTable").then((m) => ({ default: m.IsgAnswersTable })),
);

interface Props {
  result: IsgResult;
  answers: Record<number, number>;
}

function Panel({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-border bg-card p-6 sm:p-7 ${className}`}>
      <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
      {description && (
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
      )}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function IsgResultDashboard({ result, answers }: Props) {
  const [showTable, setShowTable] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const factors = useMemo(() => Object.values(result.factors ?? {}), [result.factors]);
  const domains = useMemo(() => Object.values(result.domains ?? {}), [result.domains]);
  const radarData = useMemo(
    () => domains.map((d) => ({ label: d.label, value: d.score })),
    [domains],
  );

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
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <IsgLogo className="h-8" />
          <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
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

      {/* HERO — medidor global + fatores */}
      <IsgReveal className="mt-8">
        <section className="grid gap-8 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:grid-cols-[minmax(0,300px)_1fr]">
          <div className="flex flex-col items-center justify-center border-border lg:border-r lg:pr-8">
            <IsgScoreGauge
              value={result.globalScore}
              max={100}
              label="Resultado global"
              caption="Leitura descritiva de autopercepção em um momento no tempo."
            />
          </div>
          <div className="flex flex-col justify-center gap-6">
            <div>
              <h2 className="font-heading text-base font-semibold text-foreground">
                Fatores FIB-T
              </h2>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Escala {0} a {FIBT_SCALE_MAX} · Padrão de Vida, Bem-Estar e Satisfação
                Organizacional.
              </p>
            </div>
            <div className="space-y-5">
              {factors.map((f, i) => (
                <IsgMeterRow
                  key={f.label}
                  label={f.label}
                  value={f.score}
                  max={f.max}
                  delay={0.1 + i * 0.12}
                />
              ))}
            </div>
            {result.summary && (
              <p className="border-t border-border pt-5 text-sm leading-relaxed text-muted-foreground">
                {result.summary}
              </p>
            )}
          </div>
        </section>
      </IsgReveal>

      {/* DOMÍNIOS — radar + medidores */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <IsgReveal delay={0.05}>
          <Panel
            title="Domínios FIB"
            description={`Os 9 Domínios FIB agrupados nos 3 Fatores da Escala FIB-T. Escala 0 a ${FIBT_SCALE_MAX}.`}
            className="h-full"
          >
            <IsgDomainRadar data={radarData} />
          </Panel>
        </IsgReveal>
        <IsgReveal delay={0.12}>
          <Panel title="Leitura por domínio" className="h-full">
            <div className="space-y-5">
              {domains.map((d, i) => (
                <IsgMeterRow
                  key={d.label}
                  label={d.label}
                  value={d.score}
                  max={d.max}
                  delay={i * 0.06}
                />
              ))}
            </div>
          </Panel>
        </IsgReveal>
      </div>

      {(result.strengths.length > 0 || result.vulnerabilities.length > 0) && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {result.strengths.length > 0 && (
            <IsgReveal>
              <Panel title="Dimensões mais favoráveis" className="h-full">
                <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {result.strengths.map((s) => (
                    <li key={s} className="flex gap-2.5">
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {s}
                    </li>
                  ))}
                </ul>
              </Panel>
            </IsgReveal>
          )}
          {result.vulnerabilities.length > 0 && (
            <IsgReveal delay={0.08}>
              <Panel title="Pontos de atenção" className="h-full">
                <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {result.vulnerabilities.map((s) => (
                    <li key={s} className="flex gap-2.5">
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {s}
                    </li>
                  ))}
                </ul>
              </Panel>
            </IsgReveal>
          )}
        </div>
      )}

      {result.recommendations.length > 0 && (
        <IsgReveal className="mt-6">
          <Panel title="Caminhos de reflexão">
            <ol className="grid gap-3 sm:grid-cols-2">
              {result.recommendations.map((r, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-border bg-background p-4 text-sm leading-relaxed text-muted-foreground"
                >
                  {r.domain && (
                    <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-foreground">
                      {r.domain}
                    </span>
                  )}
                  {r.action}
                </li>
              ))}
            </ol>
          </Panel>
        </IsgReveal>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          variant="outline"
          className="h-11"
          onClick={() => setShowTable((v) => !v)}
          aria-expanded={showTable}
          aria-controls="isg-answers-panel"
        >
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

      <div className="mt-10 space-y-3 border-t border-border pt-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {result.limitations ??
            "Resultado de autopercepção em um único momento no tempo. Instrumento de pesquisa e autoconhecimento: não é diagnóstico clínico nem avaliação de desempenho."}
        </p>
        <IsgCitation />
      </div>
    </main>
  );
}
