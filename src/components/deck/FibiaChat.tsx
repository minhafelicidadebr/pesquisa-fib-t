import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, ChevronRight, BarChart3, ArrowRight, Home, RotateCcw, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import fibiaAvatar from "@/assets/fibia-avatar.png";
import { FibiaDashboard } from "@/components/deck/FibiaDashboard";
import { saveAssessment } from "@/lib/fibAssessments";

// FIB-T Questions (32 total)
const questions = [
  { id: 1, text: "A casa em que moro é própria.", domain: "padrao_vida", factor: 1 },
  { id: 2, text: "Nos últimos 12 meses experimentei realização pessoal.", domain: "cultura", factor: 1 },
  { id: 3, text: "A organização valoriza a conduta ética de seus colaboradores.", domain: "governanca", factor: 3 },
  { id: 4, text: "Confio nos gestores da organização.", domain: "governanca", factor: 3 },
  { id: 5, text: "Considero que tenho uma rede de apoio social e afetivo caso enfrente um problema.", domain: "vitalidade", factor: 2 },
  { id: 6, text: "Nos últimos 12 meses assisti a filmes e/ou documentários.", domain: "cultura", factor: 1 },
  { id: 7, text: "Considero-me uma pessoa feliz.", domain: "bem_estar", factor: 2 },
  { id: 8, text: "Consigo realizar projetos de longo prazo que envolvem algum investimento financeiro.", domain: "padrao_vida", factor: 1 },
  { id: 9, text: "Em geral, minhas horas de sono são suficientes para meu repouso.", domain: "saude", factor: 2 },
  { id: 10, text: "Em minha rotina atual, experimento mais emoções positivas que negativas.", domain: "bem_estar", factor: 2 },
  { id: 11, text: "Considero que sei administrar meu tempo, mantendo uma rotina equilibrada.", domain: "uso_tempo", factor: 2 },
  { id: 12, text: "Estou satisfeito com as oportunidades de treinamento oferecidas pela organização.", domain: "governanca", factor: 3 },
  { id: 13, text: "Meu horário de trabalho é flexível caso enfrente situações emergenciais.", domain: "governanca", factor: 3 },
  { id: 14, text: "Estou satisfeito com minha saúde emocional.", domain: "bem_estar", factor: 2 },
  { id: 15, text: "Meu peso é considerado saudável.", domain: "saude", factor: 2 },
  { id: 16, text: "Nos últimos 12 meses fiz ao menos uma viagem de lazer.", domain: "padrao_vida", factor: 1 },
  { id: 17, text: "Meu rendimento atual me permite viver com dignidade.", domain: "padrao_vida", factor: 1 },
  { id: 18, text: "Nos últimos 12 meses realizei atividades voluntárias de cunho social.", domain: "vitalidade", factor: 1 },
  { id: 19, text: "Minha rotina prevê tempo para estar com os amigos.", domain: "uso_tempo", factor: 2 },
  { id: 20, text: "Considero a comunicação interna da organização eficaz.", domain: "governanca", factor: 3 },
  { id: 21, text: "Nos últimos 12 meses adquiri e/ou li livros.", domain: "educacao", factor: 1 },
  { id: 22, text: "Tenho práticas diárias de responsabilidade ambiental.", domain: "meio_ambiente", factor: 2 },
  { id: 23, text: "Nos últimos 12 meses desfrutei de festas populares, como Carnaval e São João.", domain: "cultura", factor: 1 },
  { id: 24, text: "O estresse não compromete meu bem-estar.", domain: "saude", factor: 2 },
  { id: 25, text: "Nos últimos 12 meses fui a exposições de arte.", domain: "cultura", factor: 1 },
  { id: 26, text: "Os gestores da organização compartilham estratégias, metas e realizações.", domain: "governanca", factor: 3 },
  { id: 27, text: "Nos últimos 12 meses participei de treinamento voltado ao meu desenvolvimento pessoal.", domain: "educacao", factor: 1 },
  { id: 28, text: "Realizo exercícios físicos regularmente.", domain: "saude", factor: 2 },
  { id: 29, text: "Tenho direito de liberdade de expressão e opinião na organização.", domain: "governanca", factor: 3 },
  { id: 30, text: "Nos últimos 12 meses estive saudável.", domain: "saude", factor: 2 },
  { id: 31, text: "Tenho um propósito maior em minha vida.", domain: "bem_estar", factor: 2 },
  { id: 32, text: "Nos últimos 12 meses estive engajado em algum tipo de treinamento formal.", domain: "educacao", factor: 1 },
];

const likertOptions = [
  { value: 0, label: "Discordo totalmente", short: "DT", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  { value: 1, label: "Discordo parcialmente", short: "DP", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { value: 2, label: "Neutro", short: "N", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { value: 3, label: "Concordo parcialmente", short: "CP", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { value: 4, label: "Concordo totalmente", short: "CT", color: "bg-green-500/20 text-green-400 border-green-500/30" },
];

const domainLabels: Record<string, string> = {
  padrao_vida: "Padrão de Vida",
  educacao: "Educação",
  cultura: "Cultura",
  bem_estar: "Bem-Estar Psicológico",
  saude: "Saúde",
  uso_tempo: "Uso do Tempo",
  vitalidade: "Vitalidade Comunitária",
  meio_ambiente: "Meio Ambiente",
  governanca: "Governança",
};

type Phase = "intro" | "survey" | "analyzing" | "dashboard";

interface AnalysisResult {
  summary: string;
  domains: Record<string, { score: number; max: number; label: string }>;
  factors: Record<string, { score: number; label: string }>;
  strengths: string[];
  vulnerabilities: string[];
  recommendations: Array<{ domain: string; action: string; timeframe: string; driver_category: string }>;
  learning_trails: Array<{ title: string; description: string; priority: string }>;
  encouragement: string;
}

export function FibiaChat() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const progress = (Object.keys(answers).length / questions.length) * 100;
  const currentQuestion = questions[currentQ];

  const handleAnswer = (value: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    }
  };

  const canFinish = Object.keys(answers).length === questions.length;

  const persist = async (result: AnalysisResult) => {
    try {
      await saveAssessment({
        domains: result.domains,
        factors: result.factors,
        strengths: result.strengths,
        vulnerabilities: result.vulnerabilities,
        recommendations: result.recommendations,
        learning_trails: result.learning_trails,
        summary: result.summary,
        encouragement: result.encouragement,
        raw_answers: answers,
      });
    } catch (e) {
      console.warn("persist skipped", e);
    }
  };

  const submitForAnalysis = async () => {
    setPhase("analyzing");
    setAnalyzing(true);
    let result: AnalysisResult | null = null;
    try {
      const formattedAnswers = questions.map((q) => ({
        id: q.id,
        text: q.text,
        domain: q.domain,
        factor: q.factor,
        answer: answers[q.id] ?? 0,
      }));

      const { data, error } = await supabase.functions.invoke("fibia-chat", {
        body: { answers: formattedAnswers },
      });

      if (error) throw error;

      const content = data?.content || "";
      const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1]);
      } else {
        try {
          result = JSON.parse(content);
        } catch {
          const domainScores = calculateDomainScores();
          result = {
            summary: content || "Análise concluída com sucesso.",
            domains: domainScores,
            factors: calculateFactorScores(),
            strengths: getTopDomains(domainScores, true),
            vulnerabilities: getTopDomains(domainScores, false),
            recommendations: [],
            learning_trails: [],
            encouragement: "Continue investindo no seu bem-estar! 🌟",
          };
        }
      }
    } catch (err) {
      console.error("Analysis error:", err);
      toast.error("Análise local gerada (IA indisponível).");
      const domainScores = calculateDomainScores();
      result = {
        summary: "Sua Felicidade Interna Bruta foi calculada com base nas suas respostas.",
        domains: domainScores,
        factors: calculateFactorScores(),
        strengths: getTopDomains(domainScores, true),
        vulnerabilities: getTopDomains(domainScores, false),
        recommendations: [],
        learning_trails: [],
        encouragement: "O autoconhecimento é o primeiro passo para a transformação. 🌟",
      };
    } finally {
      if (result) {
        setAnalysis(result);
        await persist(result);
      }
      setPhase("dashboard");
      setAnalyzing(false);
    }
  };

  const calculateDomainScores = () => {
    const domainItems: Record<string, number[]> = {};
    questions.forEach((q) => {
      if (!domainItems[q.domain]) domainItems[q.domain] = [];
      domainItems[q.domain].push(answers[q.id] ?? 0);
    });
    const result: Record<string, { score: number; max: number; label: string }> = {};
    Object.entries(domainItems).forEach(([domain, items]) => {
      result[domain] = {
        score: Number((items.reduce((a, b) => a + b, 0) / items.length).toFixed(2)),
        max: 4,
        label: domainLabels[domain] || domain,
      };
    });
    return result;
  };

  const calculateFactorScores = () => {
    const factorItems: Record<number, number[]> = { 1: [], 2: [], 3: [] };
    questions.forEach((q) => {
      factorItems[q.factor].push(answers[q.id] ?? 0);
    });
    return {
      padrao_vida: { score: Number((factorItems[1].reduce((a, b) => a + b, 0) / factorItems[1].length).toFixed(2)), label: "Padrão de Vida" },
      bem_estar: { score: Number((factorItems[2].reduce((a, b) => a + b, 0) / factorItems[2].length).toFixed(2)), label: "Bem-Estar" },
      satisfacao: { score: Number((factorItems[3].reduce((a, b) => a + b, 0) / factorItems[3].length).toFixed(2)), label: "Satisfação Organizacional" },
    };
  };

  const getTopDomains = (domains: Record<string, { score: number; max: number; label: string }>, top: boolean) => {
    const sorted = Object.entries(domains).sort((a, b) => top ? b[1].score - a[1].score : a[1].score - b[1].score);
    return sorted.slice(0, 3).map(([key]) => domainLabels[key] || key);
  };

  const restart = () => {
    setPhase("intro");
    setCurrentQ(0);
    setAnswers({});
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-foreground/5">
        {phase === "survey" && (
          <div className="h-1 bg-muted">
            <motion.div className="h-full gradient-gold" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        )}
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={fibiaAvatar} alt="FIBia" className="w-8 h-8 rounded-full border-2 border-brand-gold/30" />
            <div>
              <span className="font-heading font-bold text-sm text-foreground">FIBia</span>
              <span className="text-xs text-muted-foreground ml-2">Assistente de Bem-Estar</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {phase === "survey" && (
              <span className="text-xs text-muted-foreground tabular-nums-data">{Object.keys(answers).length}/{questions.length}</span>
            )}
            <a href="/" className="text-muted-foreground hover:text-foreground p-1.5 transition-colors">
              <Home className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <main className="pt-20 pb-8 px-4 max-w-4xl mx-auto" ref={scrollRef}>
        <AnimatePresence mode="wait">
          {/* INTRO */}
          {phase === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center text-center pt-12 md:pt-20">
              <motion.img
                src={fibiaAvatar}
                alt="FIBia"
                className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-brand-gold/30 mb-8 glow-gold"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15 }}
              />
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Olá! Eu sou a <span className="text-gradient-gold">FIBia</span> 🌻
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mb-3 leading-relaxed">
                Sua assistente de Felicidade Interna Bruta no Trabalho. Vou te guiar por uma jornada de autoconhecimento com base em ciência.
              </p>
              <p className="text-muted-foreground text-sm max-w-lg mb-8">
                São <strong className="text-foreground">32 perguntas</strong> rápidas sobre como você vive, trabalha e se sente. Ao final, você receberá um <strong className="text-foreground">dashboard personalizado</strong> com análise científica e trilhas de desenvolvimento.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-10 max-w-md w-full">
                {[
                  { icon: "📊", label: "9 Domínios", desc: "Análise multidimensional" },
                  { icon: "🧠", label: "IA + Ciência", desc: "Análise com inteligência artificial" },
                  { icon: "🗺️", label: "Trilhas", desc: "Recomendações personalizadas" },
                ].map((item) => (
                  <div key={item.label} className="glass-card rounded-lg p-3 text-center">
                    <span className="text-2xl">{item.icon}</span>
                    <p className="font-heading font-bold text-xs text-foreground mt-1">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setPhase("survey")}
                className="gradient-gold text-primary-foreground font-heading font-bold text-lg px-10 py-4 rounded-xl flex items-center gap-3 hover:opacity-90 transition-opacity glow-gold"
              >
                Começar minha jornada
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-xs text-muted-foreground mt-6">🔒 Anônimo e confidencial • Referência: FURTADO, C. A. (2020)</p>
            </motion.div>
          )}

          {/* SURVEY */}
          {phase === "survey" && (
            <motion.div key="survey" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pt-8 md:pt-16">
              {/* Avatar message */}
              <div className="flex items-start gap-3 mb-8">
                <img src={fibiaAvatar} alt="FIBia" className="w-10 h-10 rounded-full border-2 border-brand-gold/20 shrink-0" />
                <div className="glass-card rounded-2xl rounded-tl-sm px-5 py-4 max-w-lg">
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {currentQ === 0
                      ? "Ótimo! Vamos começar. Para cada afirmação, escolha o quanto você concorda. Não existe resposta certa ou errada 💛"
                      : currentQ < 10
                      ? "Continue assim! Suas respostas são muito valiosas ✨"
                      : currentQ < 20
                      ? "Você está indo muito bem! Mais da metade já foi 🎯"
                      : currentQ < 30
                      ? "Quase lá! Cada resposta conta para um diagnóstico mais preciso 📊"
                      : "Últimas perguntas! Estou animada para analisar seus resultados 🌟"}
                  </p>
                </div>
              </div>

              {/* Question card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQ}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card-strong rounded-2xl p-6 md:p-8 mb-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-heading font-bold bg-brand-gold/15 text-brand-gold px-3 py-1 rounded-full tabular-nums-data">
                      {currentQ + 1}/{questions.length}
                    </span>
                    <span className="text-xs text-muted-foreground">{domainLabels[currentQuestion.domain]}</span>
                  </div>
                  <h2 className="font-heading text-lg md:text-xl font-bold text-foreground mb-6 leading-relaxed">
                    {currentQuestion.text}
                  </h2>

                  {/* Likert scale */}
                  <div className="space-y-2">
                    {likertOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleAnswer(opt.value)}
                        className={`w-full text-left rounded-xl px-4 py-3 border transition-all flex items-center gap-3 ${
                          answers[currentQuestion.id] === opt.value
                            ? `${opt.color} border-current scale-[1.02]`
                            : "border-foreground/10 hover:border-foreground/20 hover:bg-foreground/3"
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                          answers[currentQuestion.id] === opt.value ? "border-current bg-current/20" : "border-foreground/20"
                        }`}>
                          {opt.value}
                        </span>
                        <span className="text-sm font-heading">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => currentQ > 0 && setCurrentQ(currentQ - 1)}
                  disabled={currentQ === 0}
                  className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 font-heading"
                >
                  ← Anterior
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.ceil(questions.length / 8) }).map((_, i) => {
                    const sectionStart = i * 8;
                    const sectionEnd = Math.min((i + 1) * 8, questions.length);
                    const sectionAnswered = questions.slice(sectionStart, sectionEnd).filter((q) => answers[q.id] !== undefined).length;
                    const sectionTotal = sectionEnd - sectionStart;
                    return (
                      <div
                        key={i}
                        className={`w-6 h-1.5 rounded-full transition-all ${
                          sectionAnswered === sectionTotal ? "gradient-gold" : sectionAnswered > 0 ? "bg-brand-gold/30" : "bg-muted"
                        }`}
                      />
                    );
                  })}
                </div>
                {canFinish ? (
                  <button
                    onClick={submitForAnalysis}
                    className="gradient-gold text-primary-foreground font-heading font-bold text-sm px-5 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    Ver resultados
                    <BarChart3 className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => currentQ < questions.length - 1 && setCurrentQ(currentQ + 1)}
                    disabled={currentQ === questions.length - 1}
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
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center text-center pt-32">
              <motion.img
                src={fibiaAvatar}
                alt="FIBia analisando"
                className="w-24 h-24 rounded-full border-4 border-brand-gold/30 mb-8"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Loader2 className="w-8 h-8 text-brand-gold animate-spin mb-4" />
              <h2 className="font-heading text-xl font-bold text-foreground mb-2">Analisando suas respostas...</h2>
              <p className="text-muted-foreground text-sm">A FIBia está processando seus dados com inteligência artificial 🧠</p>
            </motion.div>
          )}

          {/* DASHBOARD */}
          {phase === "dashboard" && analysis && (
            <FibiaDashboard analysis={analysis} onRestart={restart} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
