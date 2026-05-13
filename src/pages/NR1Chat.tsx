import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { CelebrationModal } from "@/components/nr1/CelebrationModal";
import { Loader2, Home, ArrowRight, ShieldAlert, ShieldCheck, Sparkles, RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  copsoqItems, copsoqSubscales, likertFreq, likertIntensity, likertHealth,
  computeCopsoqAnalysis, CopsoqAnalysis,
} from "@/data/copsoq";
import { saveNR1 } from "@/lib/nr1Assessments";

type Phase = "intro" | "survey" | "analyzing" | "dashboard";

interface AIResponse {
  summary: string;
  recommendations: Array<{ subscale: string; action: string; horizon: string; priority: string }>;
  nr1_alignment: string;
  encouragement: string;
}

const riskColor = (cls: string) =>
  cls === "vermelho" ? "hsl(0 84% 60%)" : cls === "amarelo" ? "hsl(43 100% 52%)" : "hsl(142 71% 45%)";

const riskLabel = (cls: string) =>
  cls === "vermelho" ? "Risco alto" : cls === "amarelo" ? "Atenção" : "Risco baixo";

export default function NR1Chat() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [analysis, setAnalysis] = useState<CopsoqAnalysis | null>(null);
  const [ai, setAi] = useState<AIResponse | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (phase === "dashboard") {
      const t = setTimeout(() => setShowCelebration(true), 600);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const total = copsoqItems.length;
  const progress = (Object.keys(answers).length / total) * 100;
  const currentQuestion = copsoqItems[currentQ];
  const canFinish = Object.keys(answers).length === total;

  const scaleOptions =
    currentQuestion?.scale === "intensity" ? likertIntensity :
    currentQuestion?.scale === "health" ? likertHealth :
    likertFreq;

  const handleAnswer = (value: number) => {
    setAnswers((p) => ({ ...p, [currentQuestion.id]: value }));
    if (currentQ < total - 1) setTimeout(() => setCurrentQ(currentQ + 1), 250);
  };

  const submit = async () => {
    setPhase("analyzing");
    const computed = computeCopsoqAnalysis(answers);
    setAnalysis(computed);
    let aiResult: AIResponse | null = null;
    try {
      const { data, error } = await supabase.functions.invoke("nr1-analysis", {
        body: { analysis: computed },
      });
      if (error) throw error;
      const content = data?.content || "";
      const m = content.match(/```json\s*([\s\S]*?)```/);
      const parsed = m ? JSON.parse(m[1]) : JSON.parse(content);
      aiResult = parsed;
    } catch (err) {
      console.error("NR1 AI error", err);
      toast.message("Análise local gerada (IA indisponível).");
      aiResult = {
        summary: "Sua avaliação COPSOQ II foi processada localmente. Os escores semafóricos abaixo seguem os pontos de corte oficiais.",
        recommendations: computed.red_flags.slice(0, 5).map((s) => ({
          subscale: s.key,
          action: `Implementar plano de ação dirigido para "${s.label}" envolvendo gestor direto, RH e comitê NR-1.`,
          horizon: "30d",
          priority: "alta",
        })),
        nr1_alignment: "As subescalas em vermelho devem entrar no PGR (Programa de Gerenciamento de Riscos) com plano documentado, conforme NR-1.",
        encouragement: "Sua escuta importa. Cuidar do ambiente psicossocial é responsabilidade compartilhada. 💛",
      };
    }
    setAi(aiResult);
    if (aiResult) {
      try {
        await saveNR1({
          analysis: computed,
          recommendations: aiResult.recommendations,
          summary: aiResult.summary,
          raw_answers: answers,
        });
      } catch (e) {
        console.warn("nr1 persist skipped", e);
      }
    }
    setPhase("dashboard");
  };

  const restart = () => {
    setPhase("intro");
    setCurrentQ(0);
    setAnswers({});
    setAnalysis(null);
    setAi(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-foreground/5">
        {phase === "survey" && (
          <div className="h-1 bg-muted">
            <motion.div className="h-full bg-brand-magenta" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        )}
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-magenta/15 border-2 border-brand-magenta/40 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-brand-magenta" />
            </div>
            <div>
              <span className="font-heading font-bold text-sm text-foreground">NORA</span>
              <span className="text-xs text-muted-foreground ml-2">Saúde mental no trabalho · NR-1</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {phase === "survey" && (
              <span className="text-xs text-muted-foreground tabular-nums-data">{Object.keys(answers).length}/{total}</span>
            )}
            <Link to="/" className="text-muted-foreground hover:text-foreground p-1.5 transition-colors">
              <Home className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <main className="pt-20 pb-12 px-4 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {/* INTRO */}
          {phase === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center text-center pt-10 md:pt-16">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-brand-magenta/10 border-4 border-brand-magenta/40 flex items-center justify-center mb-8 glow-magenta">
                <ShieldAlert className="w-10 h-10 text-brand-magenta" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Olá, sou a <span className="text-gradient-magenta">NORA</span> 🛡️
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mb-3 leading-relaxed">
                Sua aliada para mapear riscos psicossociais no trabalho com base no <strong className="text-foreground">COPSOQ II</strong> (Kristensen, validação portuguesa Silva et al., 2011) e ancorar o cumprimento da <strong className="text-foreground">NR-1</strong>.
              </p>
              <p className="text-muted-foreground text-sm max-w-lg mb-8">
                São <strong className="text-foreground">{total} perguntas</strong> sobre exigências, liderança, recompensas, conflito trabalho-família, sono, burnout, stress e comportamentos ofensivos. Tempo estimado: <strong className="text-foreground">8-10 minutos</strong>. 100% confidencial.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-10 max-w-md w-full">
                {[
                  { icon: "📊", label: "26 subescalas", desc: "Padrão internacional" },
                  { icon: "🚦", label: "Semáforo COPSOQ", desc: "Pontos de corte oficiais" },
                  { icon: "⚖️", label: "NR-1 ready", desc: "Plano para o PGR" },
                ].map((it) => (
                  <div key={it.label} className="glass-card rounded-lg p-3 text-center">
                    <span className="text-2xl">{it.icon}</span>
                    <p className="font-heading font-bold text-xs text-foreground mt-1">{it.label}</p>
                    <p className="text-[10px] text-muted-foreground">{it.desc}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setPhase("survey")}
                className="bg-brand-magenta text-white font-heading font-bold text-lg px-10 py-4 rounded-xl flex items-center gap-3 hover:opacity-90 transition-opacity glow-magenta"
              >
                Iniciar diagnóstico NR-1 <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-xs text-muted-foreground mt-6">🔒 Confidencial · Referência: Kristensen, T. (2001) · COPSOQ II Versão Curta</p>
            </motion.div>
          )}

          {/* SURVEY */}
          {phase === "survey" && currentQuestion && (
            <motion.div key="survey" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pt-8 md:pt-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQ}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card-strong rounded-2xl p-6 md:p-8 mb-6"
                >
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="text-xs font-heading font-bold bg-brand-magenta/15 text-brand-magenta px-3 py-1 rounded-full tabular-nums-data">
                      {currentQ + 1}/{total}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {copsoqSubscales[currentQuestion.subscale]?.dimension} · {copsoqSubscales[currentQuestion.subscale]?.label}
                    </span>
                  </div>
                  <h2 className="font-heading text-lg md:text-xl font-bold text-foreground mb-6 leading-relaxed">
                    {currentQuestion.text}
                  </h2>
                  <div className="space-y-2">
                    {scaleOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleAnswer(opt.value)}
                        className={`w-full text-left rounded-xl px-4 py-3 border transition-all flex items-center gap-3 ${
                          answers[currentQuestion.id] === opt.value
                            ? "bg-brand-magenta/15 border-brand-magenta text-foreground scale-[1.02]"
                            : "border-foreground/10 hover:border-foreground/20 hover:bg-foreground/5"
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                          answers[currentQuestion.id] === opt.value ? "border-brand-magenta bg-brand-magenta/20 text-brand-magenta" : "border-foreground/20"
                        }`}>
                          {opt.value}
                        </span>
                        <span className="text-sm font-heading">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => currentQ > 0 && setCurrentQ(currentQ - 1)}
                  disabled={currentQ === 0}
                  className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 font-heading"
                >
                  ← Anterior
                </button>
                {canFinish ? (
                  <button
                    onClick={submit}
                    className="bg-brand-magenta text-white font-heading font-bold text-sm px-5 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    Ver resultados <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => currentQ < total - 1 && setCurrentQ(currentQ + 1)}
                    disabled={currentQ === total - 1}
                    className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 font-heading"
                  >
                    Próxima →
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ANALYZING */}
          {phase === "analyzing" && (
            <motion.div key="ana" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center text-center pt-32">
              <Loader2 className="w-10 h-10 text-brand-magenta animate-spin mb-4" />
              <h2 className="font-heading text-xl font-bold text-foreground mb-2">Cruzando suas respostas com COPSOQ II e NR-1…</h2>
              <p className="text-muted-foreground text-sm">Estou identificando riscos, potências e o plano de ação 🛡️</p>
            </motion.div>
          )}

          {/* DASHBOARD */}
          {phase === "dashboard" && analysis && ai && (
            <motion.div key="dash" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-6 space-y-8">
              {/* Hero score */}
              <section className="glass-card-strong rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-brand-magenta" />
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-brand-magenta">Diagnóstico NR-1 · COPSOQ II</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
                  <div>
                    <p className="font-display text-6xl font-bold tabular-nums-data" style={{ color: riskColor(analysis.global_risk) }}>
                      {analysis.global_score}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Risco global · 0-100</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-heading font-bold"
                    style={{ background: `${riskColor(analysis.global_risk)}22`, color: riskColor(analysis.global_risk), border: `1px solid ${riskColor(analysis.global_risk)}55` }}
                  >
                    {analysis.global_risk === "vermelho" ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    {riskLabel(analysis.global_risk)}
                  </div>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{ai.summary}</p>
              </section>

              {/* Bar chart por subescala */}
              <section className="glass-card-strong rounded-2xl p-6">
                <h3 className="font-heading font-bold text-foreground mb-4">Mapa de risco por subescala</h3>
                <ResponsiveContainer width="100%" height={Math.max(360, analysis.subscales.length * 18)}>
                  <BarChart layout="vertical" data={[...analysis.subscales].sort((a, b) => b.score - a.score)} margin={{ left: 60 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis type="category" dataKey="label" width={200} tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }} />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                      contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }}
                      formatter={(v: any) => [`${v} / 100`, "Risco"]}
                    />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                      {analysis.subscales.map((s) => (
                        <Cell key={s.key} fill={riskColor(s.classification)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "hsl(142 71% 45%)" }} /> Verde: &lt; 33,3</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "hsl(43 100% 52%)" }} /> Amarelo: 33,3-66,6</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "hsl(0 84% 60%)" }} /> Vermelho: &gt; 66,6</span>
                </div>
              </section>

              {/* Red flags / Green flags */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <h3 className="font-heading font-bold text-foreground">Pontos críticos ({analysis.red_flags.length})</h3>
                  </div>
                  {analysis.red_flags.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma subescala em vermelho. Excelente sinal.</p>
                  ) : (
                    <ul className="space-y-2">
                      {analysis.red_flags.slice(0, 6).map((s) => (
                        <li key={s.key} className="flex items-center justify-between text-sm">
                          <span className="text-foreground/90">{s.label}</span>
                          <span className="font-bold text-destructive tabular-nums-data">{s.score}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-brand-green" />
                    <h3 className="font-heading font-bold text-foreground">Potências ({analysis.green_flags.length})</h3>
                  </div>
                  {analysis.green_flags.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma subescala em verde ainda. Tudo é oportunidade.</p>
                  ) : (
                    <ul className="space-y-2">
                      {analysis.green_flags.slice(0, 6).map((s) => (
                        <li key={s.key} className="flex items-center justify-between text-sm">
                          <span className="text-foreground/90">{s.label}</span>
                          <span className="font-bold text-brand-green tabular-nums-data">{s.score}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>

              {/* Plano NR-1 */}
              <section className="glass-card-strong rounded-2xl p-6">
                <h3 className="font-heading font-bold text-foreground mb-1">Plano de ação NR-1</h3>
                <p className="text-xs text-muted-foreground mb-4">{ai.nr1_alignment}</p>
                <ul className="space-y-3">
                  {ai.recommendations.map((r, i) => (
                    <li key={i} className="border border-foreground/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`text-[10px] uppercase font-heading font-bold px-2 py-0.5 rounded-full ${
                          r.priority === "alta" ? "bg-destructive/15 text-destructive" :
                          r.priority === "media" ? "bg-brand-gold/15 text-brand-gold" :
                          "bg-brand-green/15 text-brand-green"
                        }`}>
                          {r.priority}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-heading font-bold">{r.horizon}</span>
                        <span className="text-[10px] text-muted-foreground">· {copsoqSubscales[r.subscale]?.label || r.subscale}</span>
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed">{r.action}</p>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-foreground/80 mt-6 italic border-l-2 border-brand-magenta/40 pl-4">{ai.encouragement}</p>
              </section>

              {/* Actions */}
              <section className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={restart} className="inline-flex items-center justify-center gap-2 border border-foreground/20 text-foreground font-heading font-semibold px-6 py-3 rounded-xl hover:bg-foreground/5 transition-colors">
                  <RotateCcw className="w-4 h-4" /> Refazer
                </button>
                <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 bg-brand-magenta text-white font-heading font-bold px-6 py-3 rounded-xl glow-magenta">
                  Ver no painel <ArrowRight className="w-4 h-4" />
                </Link>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
