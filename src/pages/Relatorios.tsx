import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileBarChart, Download, ShieldAlert, Sparkles, ArrowRight, Eye, FileText, Brain } from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { InstitutionalFooter } from "@/components/deck/InstitutionalFooter";
import { listNR1, NR1Record } from "@/lib/nr1Assessments";
import { listAssessments, AssessmentRecord } from "@/lib/fibAssessments";
import { useAuth } from "@/hooks/useAuth";
import { MOCK_NR1, nr1ToPayload, ReportPayload } from "@/lib/nr1Mock";

const FN_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/nr1-pdf-report`;

function openReport(payload: ReportPayload) {
  const win = window.open("", "_blank");
  if (!win) return;
  fetch(FN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((r) => r.text())
    .then((html) => {
      win.document.open();
      win.document.write(html);
      win.document.close();
    })
    .catch(() => win.close());
}

export default function Relatorios() {
  const { user, profile } = useAuth();
  const [nr1, setNr1] = useState<NR1Record[] | null>(null);
  const [fib, setFib] = useState<AssessmentRecord[] | null>(null);

  useEffect(() => {
    if (user) {
      listNR1().then(setNr1);
      listAssessments().then(setFib);
    } else {
      setNr1([]);
      setFib([]);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <AppNavbar />
      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 mb-4">
              <FileBarChart className="w-3.5 h-3.5 text-brand-cyan" />
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-brand-cyan">Relatórios premium</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3 leading-tight">
              Relatórios <span className="text-gradient-cyan">NR-1, FIB & ESG</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Documentos auditáveis, prontos para juntar ao PGR, apresentar ao C-level e arquivar como evidência regulatória.
            </p>
          </motion.div>

          {/* CTA: relatório DEMO */}
          <div className="glass-card-strong rounded-2xl p-6 md:p-8 mb-10 border border-brand-gold/30 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-brand-gold" />
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-brand-gold">Demonstração</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Veja agora um relatório DRPS premium completo
                </h2>
                <p className="text-sm text-muted-foreground">
                  8 páginas em layout A4 · capa · sumário · radar · semáforo · matriz AIHA 5×5 · plano de ação ·
                  metodologia. Pronto para imprimir ou salvar como PDF.
                </p>
              </div>
              <button
                onClick={() => openReport(MOCK_NR1)}
                className="inline-flex items-center justify-center gap-2 gradient-gold text-primary-foreground font-heading font-bold px-6 py-3 rounded-xl glow-gold whitespace-nowrap"
              >
                <Download className="w-4 h-4" /> Abrir relatório demo
              </button>
            </div>
          </div>

          {/* PDF Intelligence CTA */}
          <Link
            to="/relatorios/pdf-intelligence"
            className="block glass-card rounded-2xl p-6 mb-10 border border-brand-magenta/25 hover:border-brand-magenta/50 transition-all group"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-magenta/15 text-brand-magenta grid place-items-center shrink-0">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-brand-magenta font-heading font-bold mb-1">Novo · IA</p>
                  <h3 className="font-display text-xl text-foreground mb-1">PDF Intelligence</h3>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    Suba seu PGR, DRPS ou política. A IA extrai achados, mapeia subescalas COPSOQ II
                    e identifica lacunas frente à NR-1.
                  </p>
                </div>
              </div>
              <span className="text-brand-magenta font-heading font-bold text-sm inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                Abrir <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          {/* Grid Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* NR-1 reports */}
            <section className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-brand-magenta" />
                <h3 className="font-heading font-bold text-foreground text-lg">Diagnósticos NR-1 / COPSOQ II</h3>
              </div>
              {nr1 === null ? (
                <p className="text-sm text-muted-foreground">Carregando…</p>
              ) : nr1.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  <p className="mb-3">Nenhum diagnóstico NR-1 salvo ainda.</p>
                  <Link to="/nr1/avaliacao" className="inline-flex items-center gap-1.5 text-brand-magenta font-heading font-bold hover:gap-2.5 transition-all">
                    Iniciar com a NORA <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <ul className="space-y-2">
                  {nr1.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-foreground/5 hover:border-brand-magenta/30 transition-colors">
                      <div className="min-w-0">
                        <p className="font-heading font-semibold text-sm text-foreground truncate">
                          {new Date(r.created_at).toLocaleString("pt-BR")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Risco <span className="font-bold uppercase">{r.global_risk}</span> · score {Number(r.global_score).toFixed(1)}
                        </p>
                      </div>
                      <button
                        onClick={() => openReport(nr1ToPayload(r, profile?.full_name || undefined, profile?.organization || undefined))}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-magenta/10 hover:bg-brand-magenta/20 text-brand-magenta text-xs font-heading font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> PDF
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* FIB-T reports */}
            <section className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-brand-gold" />
                <h3 className="font-heading font-bold text-foreground text-lg">Diagnósticos FIB-T</h3>
              </div>
              {fib === null ? (
                <p className="text-sm text-muted-foreground">Carregando…</p>
              ) : fib.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  <p className="mb-3">Nenhum diagnóstico FIB salvo ainda.</p>
                  <Link to="/fibia" className="inline-flex items-center gap-1.5 text-brand-gold font-heading font-bold hover:gap-2.5 transition-all">
                    Iniciar com a FIBia <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <ul className="space-y-2">
                  {fib.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-foreground/5 hover:border-brand-gold/30 transition-colors">
                      <div className="min-w-0">
                        <p className="font-heading font-semibold text-sm text-foreground truncate">
                          {new Date(r.created_at).toLocaleString("pt-BR")}
                        </p>
                        <p className="text-xs text-muted-foreground">FIB Score <span className="font-bold">{Number(r.fib_score).toFixed(1)}</span>/100</p>
                      </div>
                      <Link to="/dashboard" className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-gold/15 hover:bg-brand-gold/25 text-brand-gold text-xs font-heading font-bold transition-colors">
                        <Eye className="w-3.5 h-3.5" /> Ver
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Roadmap futuro */}
          <div className="mt-10 glass-card rounded-2xl p-6">
            <h3 className="font-heading font-bold text-foreground mb-4">Em breve</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div><strong className="text-foreground block mb-1">ESG Social GRI 401-403</strong>Indicadores Human Capital alinhados a SASB e WELL.</div>
              <div><strong className="text-foreground block mb-1">Mapa ODS de impacto</strong>Vínculo automático com ODS 3, 8 e 10.</div>
              <div><strong className="text-foreground block mb-1">Versionamento</strong>Comparativo entre ciclos com explicação automática de variações.</div>
            </div>
          </div>
        </div>
      </main>
      <InstitutionalFooter />
    </div>
  );
}
