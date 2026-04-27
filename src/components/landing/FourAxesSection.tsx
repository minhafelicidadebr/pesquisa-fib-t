import { motion } from "framer-motion";
import { ArrowRight, Eye, Lightbulb, Repeat, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface Axis {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  accent: "gold" | "cyan" | "magenta" | "green";
  to: string;
  proof: string;
}

const AXES: Axis[] = [
  {
    step: "01",
    title: "Mensurar",
    subtitle: "O que não é medido vira opinião.",
    description:
      "Diagnóstico FIB-T conversacional com 4 lentes científicas (COPSOQ III · FIB-T · PERMA+V · VIA) gera um mapa preciso da saúde organizacional em minutos.",
    icon: Eye,
    accent: "gold",
    to: "/diagnostico",
    proof: "Validado em +110.000 aplicações · Recorde mundial",
  },
  {
    step: "02",
    title: "Educar",
    subtitle: "Conhecimento que vira hábito.",
    description:
      "Academy gamificada com microaprendizagem de 5 minutos, IFT Coin privacy-first e trilhas curadas por evidência (Oxford WWP 2.0, Seligman, Peterson).",
    icon: Lightbulb,
    accent: "cyan",
    to: "/academy",
    proof: "9 trilhas · 60+ práticas · Spaced repetition aplicado",
  },
  {
    step: "03",
    title: "Transformar",
    subtitle: "Da intenção à mudança real.",
    description:
      "Catálogo de intervenções organizacionais e individuais com prescrição inteligente, protocolos prontos e medição antes/depois com significância estatística.",
    icon: Sparkles,
    accent: "magenta",
    to: "/intervencoes",
    proof: "Meta-análises Oxford · Protocolos auditáveis",
  },
  {
    step: "04",
    title: "Evoluir",
    subtitle: "Impacto comprovado, não narrado.",
    description:
      "Dashboards em tempo real, relatórios NR-1 e ESG prontos para auditoria, com narrativa executiva e drill-down de impacto por área e período.",
    icon: Repeat,
    accent: "green",
    to: "/dashboard",
    proof: "GRI · SASB · ODS 3, 8 e 10 · WELL aligned",
  },
];

const accentMap = {
  gold: { text: "text-brand-gold", bg: "bg-brand-gold/10", border: "border-brand-gold/30", grad: "from-brand-gold/20 to-transparent" },
  cyan: { text: "text-brand-cyan", bg: "bg-brand-cyan/10", border: "border-brand-cyan/30", grad: "from-brand-cyan/20 to-transparent" },
  magenta: { text: "text-brand-magenta", bg: "bg-brand-magenta/10", border: "border-brand-magenta/30", grad: "from-brand-magenta/20 to-transparent" },
  green: { text: "text-brand-green", bg: "bg-brand-green/10", border: "border-brand-green/30", grad: "from-brand-green/20 to-transparent" },
} as const;

export function FourAxesSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-brand-gold/5 to-transparent blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 border border-foreground/10 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-foreground">
              A jornada do programa
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Quatro eixos. <span className="text-gradient-gold">Um sistema vivo</span> de transformação.
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Não é uma pesquisa. Não é um treinamento. É a integração do que a ciência do bem-estar provou que funciona — em fluxo contínuo.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {AXES.map((axis, i) => {
            const a = accentMap[axis.accent];
            const Icon = axis.icon;
            return (
              <motion.div
                key={axis.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group relative"
              >
                <Link
                  to={axis.to}
                  className={`relative flex flex-col h-full glass-card rounded-2xl p-6 hover:scale-[1.02] transition-all duration-500 overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${a.grad} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-12 h-12 rounded-xl ${a.bg} ${a.border} border flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${a.text}`} />
                      </div>
                      <span className={`font-display text-3xl font-bold ${a.text} opacity-30`}>{axis.step}</span>
                    </div>

                    <h3 className="font-display text-2xl font-bold text-foreground mb-1.5">{axis.title}</h3>
                    <p className={`text-sm font-heading font-semibold ${a.text} mb-3`}>{axis.subtitle}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">{axis.description}</p>

                    <div className="mt-auto pt-4 border-t border-foreground/5">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 font-heading">Prova</p>
                      <p className={`text-xs ${a.text} font-medium mb-4`}>{axis.proof}</p>
                      <div className="flex items-center gap-1.5 text-sm font-heading font-semibold text-foreground group-hover:translate-x-1 transition-transform">
                        Explorar
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
