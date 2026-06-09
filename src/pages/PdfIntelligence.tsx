import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain, FileUp, Loader2, ShieldAlert, AlertTriangle, CheckCircle2,
  Sparkles, ArrowRight, Target, FileText,
} from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { InstitutionalFooter } from "@/components/deck/InstitutionalFooter";
import { copsoqSubscales } from "@/data/copsoq";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const FN_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/pdf-intelligence`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface Finding {
  topic: string;
  evidence: string;
  severity: "baixa" | "moderada" | "alta" | "crítica";
  copsoq_subscales: string[];
  nr1_clause: string;
}
interface Gap { requirement: string; nr1_clause: string; recommendation: string; }
interface Analysis {
  doc_type?: string;
  summary?: string;
  compliance_score?: number;
  findings?: Finding[];
  gaps?: Gap[];
  next_actions?: string[];
}

const SEVERITY_STYLE: Record<string, string> = {
  "baixa": "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30",
  "moderada": "bg-brand-gold/10 text-brand-gold border-brand-gold/30",
  "alta": "bg-orange-500/10 text-orange-400 border-orange-500/30",
  "crítica": "bg-brand-magenta/15 text-brand-magenta border-brand-magenta/40",
};

async function readPdfAsText(file: File): Promise<string> {
  // Heurística leve: lê bytes e extrai strings ASCII/UTF-8 entre operadores de texto PDF.
  // Para PDFs nativos com texto, costuma bastar; PDFs escaneados pedem OCR (roadmap futuro).
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let raw = "";
  for (let i = 0; i < bytes.length; i++) {
    const c = bytes[i];
    raw += (c >= 32 && c < 127) || c === 10 || c === 13 ? String.fromCharCode(c) : " ";
  }
  // Extrai conteúdo dentro de parênteses (operador Tj/TJ do PDF)
  const matches = raw.match(/\(([^()\\]{2,})\)/g) || [];
  const text = matches.map((m) => m.slice(1, -1)).join(" ");
  return text.length > 200 ? text : raw.replace(/[^\x20-\x7E\n]+/g, " ").replace(/\s+/g, " ");
}

export default function PdfIntelligence() {
  const [filename, setFilename] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  async function handleFile(file: File) {
    setFilename(file.name);
    try {
      const extracted = await readPdfAsText(file);
      setText(extracted.slice(0, 30000));
      toast.success(`Texto extraído (${extracted.length.toLocaleString("pt-BR")} caracteres)`);
    } catch {
      toast.error("Falha ao extrair texto. Cole manualmente abaixo.");
    }
  }

  async function analyze() {
    if (text.trim().length < 50) {
      toast.error("Forneça pelo menos 50 caracteres de texto.");
      return;
    }
    setLoading(true);
    setAnalysis(null);
    try {
      const r = await fetch(FN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
        body: JSON.stringify({ text, filename }),
      });
      const data = await r.json();
      if (!r.ok || data.error) throw new Error(data.error || "Falha");
      setAnalysis(data.analysis as Analysis);
      toast.success("Análise concluída");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <AppNavbar />
      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Link to="/relatorios" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3">
              ← Relatórios
            </Link>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-magenta/10 border border-brand-magenta/30 mb-4">
              <Brain className="w-3.5 h-3.5 text-brand-magenta" />
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-brand-magenta">PDF Intelligence · IA</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3 leading-tight">
              Cruze seus <span className="text-gradient-magenta">PDFs de compliance</span> com a NR-1
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Suba um PGR, DRPS, ASO ou política interna. A IA extrai achados, mapeia para
              subescalas COPSOQ II, identifica lacunas frente à NR-1 e propõe próximas ações.
            </p>
          </motion.div>

          {/* Upload */}
          <div className="glass-card-strong rounded-2xl p-6 md:p-8 mb-8 border border-brand-magenta/20">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block">
                  <span className="text-sm font-heading font-bold text-foreground flex items-center gap-2 mb-3">
                    <FileUp className="w-4 h-4 text-brand-magenta" /> Upload de PDF
                  </span>
                  <div className="border-2 border-dashed border-foreground/15 rounded-xl p-6 text-center hover:border-brand-magenta/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="application/pdf,.pdf,.txt"
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                      className="hidden"
                      id="pdf-input"
                    />
                    <label htmlFor="pdf-input" className="cursor-pointer">
                      <p className="text-sm text-foreground font-heading font-semibold mb-1">
                        {filename || "Clique para selecionar"}
                      </p>
                      <p className="text-xs text-muted-foreground">PDF nativo (com texto) ou .txt · até ~30k caracteres</p>
                    </label>
                  </div>
                </label>
                <p className="text-[11px] text-muted-foreground mt-3">
                  💡 Para PDFs escaneados (imagem), cole o texto manualmente ao lado — OCR está no roadmap.
                </p>
              </div>

              <div>
                <span className="text-sm font-heading font-bold text-foreground flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-brand-magenta" /> Ou cole o texto
                </span>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                  className="w-full bg-background/50 border border-foreground/10 rounded-xl p-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/60 focus:border-brand-magenta/50 focus:outline-none resize-none"
                  placeholder="Cole aqui o conteúdo do PGR, DRPS, política interna…"
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {text.length.toLocaleString("pt-BR")} caracteres prontos para análise
              </p>
              <button
                onClick={analyze}
                disabled={loading || text.trim().length < 50}
                className="inline-flex items-center justify-center gap-2 gradient-magenta text-primary-foreground font-heading font-bold px-6 py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed glow-magenta"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? "Analisando com IA…" : "Analisar com IA"}
              </button>
            </div>
          </div>

          {/* Resultados */}
          {analysis && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Score header */}
              <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-brand-magenta font-heading font-bold mb-1">
                    {analysis.doc_type || "Documento"}
                  </p>
                  <h2 className="font-display text-2xl text-foreground mb-2">Resumo da análise</h2>
                  <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">{analysis.summary}</p>
                </div>
                {typeof analysis.compliance_score === "number" && (
                  <div className="shrink-0 text-center">
                    <div className="text-5xl font-display font-bold text-gradient-gold">
                      {analysis.compliance_score}
                    </div>
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-heading mt-1">
                      Compliance NR-1
                    </p>
                  </div>
                )}
              </div>

              {/* Findings */}
              {analysis.findings && analysis.findings.length > 0 && (
                <section className="glass-card rounded-2xl p-6">
                  <h3 className="font-heading font-bold text-foreground text-lg mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-brand-magenta" />
                    Achados ({analysis.findings.length})
                  </h3>
                  <ul className="space-y-3">
                    {analysis.findings.map((f, i) => (
                      <li key={i} className="rounded-xl border border-foreground/8 p-4 bg-background/30">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <p className="font-heading font-semibold text-foreground text-sm">{f.topic}</p>
                          <span className={`shrink-0 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-heading font-bold ${SEVERITY_STYLE[f.severity] || ""}`}>
                            {f.severity}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground italic mb-3">"{f.evidence}"</p>
                        <div className="flex flex-wrap gap-1.5">
                          {f.nr1_clause && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-magenta/10 text-brand-magenta">NR-1 {f.nr1_clause}</span>
                          )}
                          {(f.copsoq_subscales || []).map((s) => (
                            <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-brand-cyan/10 text-brand-cyan">
                              {copsoqSubscales[s]?.label || s}
                            </span>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Gaps */}
              {analysis.gaps && analysis.gaps.length > 0 && (
                <section className="glass-card rounded-2xl p-6">
                  <h3 className="font-heading font-bold text-foreground text-lg mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-brand-gold" />
                    Lacunas frente à NR-1 ({analysis.gaps.length})
                  </h3>
                  <ul className="space-y-3">
                    {analysis.gaps.map((g, i) => (
                      <li key={i} className="rounded-xl border border-brand-gold/20 bg-brand-gold/5 p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-heading font-semibold text-foreground text-sm">{g.requirement}</p>
                          {g.nr1_clause && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-gold/15 text-brand-gold">NR-1 {g.nr1_clause}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{g.recommendation}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Next actions */}
              {analysis.next_actions && analysis.next_actions.length > 0 && (
                <section className="glass-card rounded-2xl p-6">
                  <h3 className="font-heading font-bold text-foreground text-lg mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-brand-cyan" />
                    Próximas ações recomendadas
                  </h3>
                  <ul className="space-y-2">
                    {analysis.next_actions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                        <CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link to="/intervencoes" className="inline-flex items-center gap-1.5 text-xs font-heading font-bold px-3 py-2 rounded-lg bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan/20 transition-colors">
                      Ver intervenções <ArrowRight className="w-3 h-3" />
                    </Link>
                    <Link to="/nr1/avaliacao" className="inline-flex items-center gap-1.5 text-xs font-heading font-bold px-3 py-2 rounded-lg bg-brand-magenta/10 text-brand-magenta hover:bg-brand-magenta/20 transition-colors">
                      Iniciar NORA <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </section>
              )}
            </motion.div>
          )}
        </div>
      </main>
      <InstitutionalFooter />
    </div>
  );
}
