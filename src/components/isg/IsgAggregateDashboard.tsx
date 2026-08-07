import { useEffect, useState } from "react";
import { Download, FileText, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IsgLogo, IsgPilotBadge } from "@/components/isg/IsgBrand";
import { IsgQuestionsTable } from "@/components/isg/IsgQuestionsTable";
import {
  buildAggregateCsv,
  clearSession,
  downloadFile,
  extremes,
  fetchAggregates,
  type IsgAggregate,
} from "@/lib/isgAggregate";

function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-2xl font-semibold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Barra 0–4, sem rótulo qualitativo — apenas leitura comparativa interna. */
function ScoreBar({ label, mean }: { label: string; mean: number }) {
  const pct = Math.max(0, Math.min(100, (mean / 4) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-foreground">{label}</span>
        <span className="font-medium tabular-nums text-foreground">{mean.toFixed(1)}</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`${label}: média ${mean.toFixed(1)} de 4`}
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function IsgAggregateDashboard({ onLogout }: { onLogout: () => void }) {
  const [agg, setAgg] = useState<IsgAggregate | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "denied">("loading");
  const [pdfBusy, setPdfBusy] = useState(false);

  const load = async () => {
    setState("loading");
    try {
      setAgg(await fetchAggregates());
      setState("ready");
    } catch {
      setState("denied");
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    clearSession();
    onLogout();
  };

  if (state === "loading") {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-sm text-muted-foreground">Carregando leitura agregada…</p>
      </main>
    );
  }

  if (state === "denied" || !agg) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-heading text-lg font-semibold text-foreground">
          Sessão encerrada
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Não foi possível validar o acesso. Autentique-se novamente.
        </p>
        <Button className="mt-6 h-11" onClick={logout}>
          Voltar ao acesso
        </Button>
      </main>
    );
  }

  const ef = extremes(agg.factors);
  const ed = extremes(agg.domains);

  const downloadPdf = async () => {
    setPdfBusy(true);
    try {
      const { generateIsgAggregatePdf } = await import("@/lib/isgAggregatePdf");
      await generateIsgAggregatePdf(agg);
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl space-y-12 px-4 py-10">
      {/* HERO EXECUTIVO */}
      <header className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <IsgLogo className="h-9" />
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Atualizar
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Sair
            </Button>
          </div>
        </div>
        <IsgPilotBadge />
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Painel Executivo FIB-T
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Visão agregada do pré-teste organizacional ISG
          </p>
        </div>
      </header>

      {agg.suppressed ? (
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Amostra insuficiente para apresentação deste resultado.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Participações registradas: {agg.nLabel}. Para proteger a privacidade dos
            participantes, médias, distribuições, fatores e domínios só são apresentados a
            partir de {agg.threshold} participações.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Status da coleta: {agg.status}
          </p>
        </section>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Participações" value={String(agg.n)} hint="Respostas válidas" />
            <Metric
              label="Resultado global agregado"
              value={String(agg.globalScore)}
              hint="Escala 0 a 100"
            />
            <Metric label="Status da coleta" value={agg.status} />
            <Metric label="Última atualização" value={formatDateTime(agg.lastUpdatedAt)} />
          </section>

          <section aria-labelledby="isg-factors" className="space-y-4">
            <h2 id="isg-factors" className="font-heading text-lg font-semibold text-foreground">
              Fatores FIB-T
            </h2>
            <p className="text-sm text-muted-foreground">Médias agregadas na escala 0 a 4.</p>
            <div className="grid gap-5 rounded-xl border border-border bg-card p-6 sm:grid-cols-3">
              {(agg.factors ?? []).map((f) => (
                <ScoreBar key={f.key} label={f.label} mean={f.mean} />
              ))}
            </div>
          </section>

          <section aria-labelledby="isg-domains" className="space-y-4">
            <h2 id="isg-domains" className="font-heading text-lg font-semibold text-foreground">
              Domínios FIB-T
            </h2>
            <p className="text-sm text-muted-foreground">Médias agregadas na escala 0 a 4.</p>
            <div className="grid gap-5 rounded-xl border border-border bg-card p-6 sm:grid-cols-2 lg:grid-cols-3">
              {(agg.domains ?? []).map((d) => (
                <ScoreBar key={d.key} label={d.label} mean={d.mean} />
              ))}
            </div>
          </section>

          <section aria-labelledby="isg-insights" className="space-y-3">
            <h2 id="isg-insights" className="font-heading text-lg font-semibold text-foreground">
              Leituras do Grupo
            </h2>
            <ul className="space-y-2 rounded-xl border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground">
              {ef && (
                <li>
                  Entre os fatores observados, <strong className="text-foreground">{ef.highest.label}</strong>{" "}
                  apresentou a maior média do grupo ({ef.highest.mean.toFixed(1)}) e{" "}
                  <strong className="text-foreground">{ef.lowest.label}</strong> a menor média
                  observada ({ef.lowest.mean.toFixed(1)}).
                </li>
              )}
              {ed && (
                <li>
                  Entre os domínios, <strong className="text-foreground">{ed.highest.label}</strong>{" "}
                  apresentou a maior média observada ({ed.highest.mean.toFixed(1)}) e{" "}
                  <strong className="text-foreground">{ed.lowest.label}</strong> a menor média
                  observada ({ed.lowest.mean.toFixed(1)}).
                </li>
              )}
              <li>
                A amostra apresentou resultado global agregado de {agg.globalScore} na escala 0 a 100.
              </li>
              <li className="pt-2 text-xs">
                Leitura descritiva. Os resultados observados indicam médias de autopercepção em um
                momento no tempo e não sustentam conclusão causal nem interpretação clínica.
              </li>
            </ul>
          </section>

          <IsgQuestionsTable questions={agg.questions ?? []} />

          <section className="flex flex-wrap gap-3 border-t border-border pt-8">
            <Button className="h-11" onClick={() => void downloadPdf()} disabled={pdfBusy}>
              <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
              {pdfBusy ? "Gerando…" : "Baixar Relatório Executivo em PDF"}
            </Button>
            <Button
              variant="outline"
              className="h-11"
              onClick={() =>
                downloadFile(
                  "dados-agregados-fibt-isg.csv",
                  buildAggregateCsv(agg),
                  "text/csv;charset=utf-8",
                )
              }
            >
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Baixar Dados Agregados
            </Button>
          </section>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Este painel apresenta exclusivamente resultados agregados. Nenhum dado pessoal é
            coletado e nenhuma resposta individual pode ser aberta ou exportada. Resultados são
            apresentados apenas a partir de {agg.threshold} participações.
          </p>
        </>
      )}
    </main>
  );
}
