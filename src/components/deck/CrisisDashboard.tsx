import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  AlertTriangle, TrendingDown, Brain, Users, Shield, DollarSign,
  ArrowRight, X, BarChart3, Globe, BookOpen, Zap, ExternalLink
} from "lucide-react";

/* ─── data anchored in real science ─── */
const crisisMetrics = [
  {
    id: "produtividade",
    value: "US$ 1 tri",
    suffix: "/ano",
    label: "Perda global de produtividade",
    detail: "Depressão e ansiedade no trabalho custam US$ 1 trilhão por ano em produtividade perdida globalmente.",
    source: "OMS / OIT, 2022",
    sourceType: "FONTE PRIMÁRIA",
    confidence: "Alta",
    icon: TrendingDown,
    color: "brand-magenta",
    tags: ["saúde mental", "produtividade"],
    deepDive: "A Organização Mundial da Saúde e a Organização Internacional do Trabalho publicaram em 2022 diretrizes conjuntas sobre saúde mental no trabalho, documentando que depressão e ansiedade custam à economia global US$ 1 trilhão anuais. Este custo inclui absenteísmo, presenteísmo, turnover e redução de performance cognitiva. O relatório recomenda intervenções organizacionais — não apenas individuais — como resposta baseada em evidências.",
  },
  {
    id: "engajamento",
    value: "77%",
    label: "Desengajados ou ativamente desengajados",
    detail: "Apenas 23% dos trabalhadores globais estão engajados — 77% estão desengajados.",
    source: "Gallup State of the Global Workplace, 2023",
    sourceType: "FONTE PRIMÁRIA",
    confidence: "Alta",
    icon: Users,
    color: "brand-gold",
    tags: ["engajamento", "turnover"],
    deepDive: "O relatório anual da Gallup sobre o estado do trabalho global revela que o baixo engajamento custa US$ 8.8 trilhões à economia mundial — equivalente a 9% do PIB global. Os dados mostram que engajamento está fortemente correlacionado com a qualidade da gestão imediata, autonomia percebida e senso de propósito no trabalho.",
  },
  {
    id: "dias-perdidos",
    value: "12 bi",
    suffix: " dias",
    label: "Perdidos anualmente por depressão e ansiedade",
    detail: "12 bilhões de dias de trabalho são perdidos por ano por depressão e ansiedade globalmente.",
    source: "OMS, 2022",
    sourceType: "FONTE PRIMÁRIA",
    confidence: "Alta",
    icon: Brain,
    color: "brand-cyan",
    tags: ["absenteísmo", "saúde mental"],
    deepDive: "O relatório da OMS de 2022 'Mental Health at Work' documenta que 12 bilhões de dias de trabalho são perdidos anualmente — o equivalente a toda a força de trabalho de um país como o Brasil parando por mais de 2 meses. A OMS recomenda treinamento de gestores, intervenções organizacionais e políticas de retorno ao trabalho como as três frentes mais eficazes.",
  },
  {
    id: "nr1",
    value: "NR-01",
    label: "Riscos psicossociais obrigatórios no PGR",
    detail: "A partir de 2025, riscos psicossociais devem ser incluídos no Programa de Gerenciamento de Riscos.",
    source: "MTE / Gov.br, 2024",
    sourceType: "REGULATÓRIO",
    confidence: "Alta",
    icon: Shield,
    color: "brand-green",
    tags: ["NR-01", "compliance"],
    deepDive: "A atualização da NR-01 pelo Ministério do Trabalho e Emprego em 2024 torna obrigatória a inclusão de riscos psicossociais no Programa de Gerenciamento de Riscos (PGR). Organizações que não cumprirem estão sujeitas a autuações, embargo e responsabilização por nexo causal em processos trabalhistas. O COPSOQ III é o instrumento mais validado para esse mapeamento.",
  },
  {
    id: "roi",
    value: "4:1",
    label: "Retorno por US$ 1 investido em saúde mental",
    detail: "Meta-análise demonstra retorno médio de 4:1 em programas de saúde mental no trabalho.",
    source: "OMS, 2019",
    sourceType: "FONTE PRIMÁRIA",
    confidence: "Alta",
    icon: DollarSign,
    color: "brand-gold",
    tags: ["ROI", "investimento"],
    deepDive: "A meta-análise da OMS (2019) avaliou programas de intervenção em saúde mental no trabalho em países de renda diversa e encontrou um ROI médio de 4:1 — variando de 1.6:1 a 6.3:1 dependendo do tipo de intervenção e maturidade organizacional. Programas que combinam intervenção individual + organizacional apresentam os maiores retornos.",
  },
  {
    id: "saude-mental",
    value: "76%",
    label: "Relatam ao menos 1 sintoma de saúde mental",
    detail: "76% dos trabalhadores relatam pelo menos um sintoma de condição de saúde mental.",
    source: "Mind Share Partners / Qualtrics, 2021",
    sourceType: "FONTE SECUNDÁRIA",
    confidence: "Média",
    icon: AlertTriangle,
    color: "brand-magenta",
    tags: ["saúde mental", "burnout"],
    deepDive: "O estudo da Mind Share Partners em parceria com Qualtrics e SAP (2021) revela que 76% dos trabalhadores experimentaram pelo menos um sintoma de saúde mental no último ano — incluindo ansiedade, depressão, burnout e insônia. O pós-pandemia intensificou esses números, especialmente entre jovens profissionais e líderes intermediários.",
  },
];

function AnimatedValue({ value, isInView }: { value: string; isInView: boolean }) {
  const [displayed, setDisplayed] = useState(value);
  
  useEffect(() => {
    if (!isInView) return;
    const hasNum = /\d/.test(value);
    if (!hasNum) { setDisplayed(value); return; }
    
    const numMatch = value.match(/(\d+)/);
    if (!numMatch) { setDisplayed(value); return; }
    
    const target = parseInt(numMatch[1]);
    const pre = value.slice(0, numMatch.index);
    const post = value.slice((numMatch.index || 0) + numMatch[1].length);
    
    let frame = 0;
    const totalFrames = 40;
    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      setDisplayed(`${pre}${current}${post}`);
      if (frame >= totalFrames) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [isInView, value]);

  return <span>{displayed}</span>;
}

export function CrisisDashboard() {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const selected = crisisMetrics.find(m => m.id === selectedMetric);

  return (
    <section ref={ref} className="py-24 px-6 border-t border-foreground/5 relative overflow-hidden">
      {/* Background halos */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-magenta/4 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-brand-gold/4 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-brand-magenta" />
            <span className="text-xs font-heading text-brand-magenta font-semibold uppercase tracking-widest">
              PAINEL DA CRISE
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            O custo invisível da <span className="text-gradient-magenta">inação</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            Quando o sofrimento não é medido, ele vira custo silencioso. Dados verificados de OMS, OIT, Gallup e Oxford.
          </p>
        </motion.div>

        {/* Highlight banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card-strong rounded-2xl p-6 mb-10 text-center border border-brand-magenta/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-magenta/5 via-transparent to-brand-gold/5 pointer-events-none" />
          <p className="text-sm text-muted-foreground mb-1 relative z-10">A cada ano,</p>
          <p className="font-display text-2xl md:text-3xl font-bold text-foreground relative z-10">
            Apenas <span className="text-gradient-gold">23%</span> dos trabalhadores globais estão engajados — <span className="text-gradient-magenta">77%</span> estão desengajados.
          </p>
          <p className="text-xs text-muted-foreground mt-2 relative z-10">
            Fonte: Gallup State of the Global Workplace, 2023 · <span className="text-brand-gold">VERIFICADO</span>
          </p>
        </motion.div>

        {/* Crisis Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {crisisMetrics.map((metric, i) => {
            const IconComp = metric.icon;
            return (
              <motion.button
                key={metric.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setSelectedMetric(metric.id)}
                className="glass-card rounded-xl p-6 text-left group cursor-pointer hover:border-brand-gold/20 transition-all duration-300 relative overflow-hidden"
              >
                {/* Subtle glow on hover */}
                <div className={`absolute inset-0 bg-${metric.color}/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                
                <div className="relative z-10">
                  {/* Source badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      metric.sourceType === "REGULATÓRIO" 
                        ? "bg-brand-green/10 text-brand-green border border-brand-green/20" 
                        : metric.sourceType === "FONTE PRIMÁRIA"
                        ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/20"
                        : "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20"
                    }`}>
                      {metric.sourceType}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Confiança: {metric.confidence}
                    </span>
                  </div>

                  {/* Value */}
                  <div className={`font-display text-3xl md:text-4xl font-bold text-${metric.color} mb-1 tabular-nums-data`}>
                    <AnimatedValue value={metric.value} isInView={isInView} />
                    {metric.suffix && <span className="text-lg text-muted-foreground">{metric.suffix}</span>}
                  </div>

                  <p className="text-sm text-foreground/90 font-heading font-semibold mb-2">{metric.label}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {metric.tags.map(tag => (
                      <span key={tag} className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Source */}
                  <p className="text-[10px] text-muted-foreground mb-3">{metric.source}</p>

                  {/* CTA */}
                  <div className="flex items-center gap-1 text-brand-gold text-xs font-heading font-bold group-hover:gap-2 transition-all">
                    <BarChart3 className="w-3 h-3" />
                    Aprofundar análise
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground mb-4 font-heading">
            "Cuidar de saúde mental deixou de ser opcional." — Com base em evidências verificadas e contextualizadas.
          </p>
        </motion.div>
      </div>

      {/* Deep Dive Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setSelectedMetric(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="glass-card-strong rounded-2xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedMetric(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-14 h-14 rounded-xl bg-${selected.color}/10 flex items-center justify-center shrink-0 border border-${selected.color}/20`}>
                  <selected.icon className={`w-7 h-7 text-${selected.color}`} />
                </div>
                <div>
                  <span className={`text-[10px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    selected.sourceType === "REGULATÓRIO" 
                      ? "bg-brand-green/10 text-brand-green" 
                      : "bg-brand-gold/10 text-brand-gold"
                  }`}>
                    {selected.sourceType} · Confiança: {selected.confidence}
                  </span>
                  <h2 className="font-display text-2xl font-bold text-foreground mt-2">
                    <span className={`text-${selected.color}`}>{selected.value}</span>
                    {selected.suffix && <span className="text-muted-foreground text-lg">{selected.suffix}</span>}
                  </h2>
                  <p className="text-sm text-muted-foreground">{selected.label}</p>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-brand-gold/5 rounded-xl p-5 border border-brand-gold/15 mb-6">
                <p className="text-sm text-foreground/90 leading-relaxed">{selected.detail}</p>
              </div>

              {/* Deep analysis */}
              <div className="mb-6">
                <h3 className="font-heading font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-gold" />
                  Análise aprofundada
                </h3>
                <p className="text-sm text-foreground/80 leading-[1.8]">{selected.deepDive}</p>
              </div>

              {/* Source card */}
              <div className="glass-card rounded-lg p-4 mb-6 flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs font-heading font-bold text-foreground">{selected.source}</p>
                  <p className="text-[10px] text-muted-foreground">{selected.sourceType} · Confiança: {selected.confidence}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto shrink-0" />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {selected.tags.map(tag => (
                  <span key={tag} className="text-xs text-brand-gold bg-brand-gold/5 px-3 py-1 rounded-full border border-brand-gold/10">
                    #{tag}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setSelectedMetric(null)}
                className="border border-foreground/20 text-foreground/80 font-heading text-sm px-6 py-3 rounded-lg hover:bg-foreground/5 transition-colors w-full"
              >
                Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
