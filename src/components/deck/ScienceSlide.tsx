import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Globe, BarChart3, Award, ArrowRight } from "lucide-react";

interface ScienceSlideProps {
  colorClass: "gold" | "cyan" | "magenta";
  onCtaClick: () => void;
  onNextSlide: () => void;
}

const driverCategories = [
  { name: "Development & Relationships", items: ["Achievement", "Learning", "Trust", "Management", "Leadership"], icon: GraduationCap },
  { name: "Independence & Flexibility", items: ["Appreciation", "Inclusion", "Employee Voice", "Autonomy"], icon: Globe },
  { name: "Variety & Fulfilment", items: ["Flexibility", "Operational Design", "Purpose", "Energy"], icon: BarChart3 },
  { name: "Risk, Health & Safety", items: ["Compensation", "Stress", "Workload Pressures"], icon: Award },
];

const colorMap = {
  gold: { gradient: "gradient-gold", textGradient: "text-gradient-gold", badge: "bg-brand-gold/15 text-brand-gold" },
  cyan: { gradient: "gradient-cyan", textGradient: "text-gradient-cyan", badge: "bg-brand-cyan/15 text-brand-cyan" },
  magenta: { gradient: "gradient-magenta", textGradient: "text-gradient-magenta", badge: "bg-brand-magenta/15 text-brand-magenta" },
};

export function ScienceSlide({ colorClass, onCtaClick, onNextSlide }: ScienceSlideProps) {
  const colors = colorMap[colorClass];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className={`text-xs font-heading font-bold ${colors.badge} px-3 py-1 rounded-full flex items-center gap-1.5`}>
          <BookOpen className="w-3 h-3" />
          Base Científica
        </span>
        <span className="text-xs text-muted-foreground">Oxford • Indeed • World Wellbeing Movement</span>
      </div>

      <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-[1.15] tracking-tight">
        +3.000 artigos científicos.<br />
        <span className={colors.textGradient}>Uma metodologia validada.</span>
      </h1>

      <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        O <strong className="text-foreground">Work Wellbeing Playbook 2.0</strong> da Universidade de Oxford é a maior revisão sistemática de intervenções baseadas em evidências para bem-estar no trabalho — e é a base da nossa arquitetura de programa.
      </p>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { value: "+3.000", label: "Artigos Científicos Revisados", icon: BookOpen },
          { value: "Oxford", label: "Wellbeing Research Centre", icon: GraduationCap },
          { value: "20+", label: "Drivers de Bem-Estar Mapeados", icon: BarChart3 },
          { value: "DRIVER", label: "Framework de Intervenções", icon: Award },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            className="glass-card rounded-lg p-4 text-center"
          >
            <metric.icon className="w-5 h-5 text-brand-gold mx-auto mb-2" />
            <span className={`font-display text-xl md:text-2xl font-bold ${colors.textGradient}`}>{metric.value}</span>
            <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      {/* DRIVER framework */}
      <div className="mb-8">
        <h3 className="font-heading font-bold text-sm text-foreground mb-3 flex items-center gap-2">
          <span className={`w-8 h-0.5 ${colors.gradient} rounded-full`} />
          Framework DRIVER — Categorias de Intervenção
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {driverCategories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.06 }}
              className="glass-card rounded-lg p-4 hover:border-brand-gold/20 transition-all"
            >
              <cat.icon className="w-4 h-4 text-brand-gold mb-2" />
              <h4 className="font-heading font-bold text-xs text-foreground mb-2">{cat.name}</h4>
              <div className="flex flex-wrap gap-1">
                {cat.items.map((item) => (
                  <span key={item} className="text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-full">{item}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Methodology note */}
      <div className="glass-card-strong rounded-xl p-5 mb-8 border-l-4 border-brand-gold">
        <p className="text-sm text-foreground/80 leading-relaxed">
          <strong className="text-foreground">Metodologia:</strong> Measure → Understand → Act. O Playbook orienta organizações a mensurar 4 dimensões centrais (satisfação, felicidade, estresse e propósito), identificar os drivers mais impactantes em seu contexto e implementar intervenções baseadas em evidências com planos de avaliação integrados.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onNextSlide}
          className={`${colors.gradient} text-primary-foreground font-heading font-bold text-sm px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity`}
        >
          Continuar apresentação
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={onCtaClick}
          className="border border-foreground/20 text-foreground/80 font-heading text-sm px-6 py-3 rounded-lg hover:bg-foreground/5 transition-colors"
        >
          Agendar reunião científica
        </button>
      </div>
    </div>
  );
}
