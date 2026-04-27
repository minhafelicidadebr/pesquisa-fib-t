import { motion } from "framer-motion";
import { Atom, BookMarked, FlaskConical, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const FRAMEWORKS = [
  {
    name: "Oxford Work-Wellbeing Playbook 2.0",
    description: "Meta-análise de +1.800 estudos sobre bem-estar no trabalho.",
    icon: GraduationCap,
    accent: "gold",
  },
  {
    name: "COPSOQ III",
    description: "Padrão internacional de avaliação de riscos psicossociais.",
    icon: FlaskConical,
    accent: "cyan",
  },
  {
    name: "PERMA+V (Seligman)",
    description: "Modelo da psicologia positiva para florescimento humano.",
    icon: Atom,
    accent: "magenta",
  },
  {
    name: "VIA Character Strengths",
    description: "Classificação científica das 24 forças de caráter universais.",
    icon: BookMarked,
    accent: "gold",
  },
];

const accentMap = {
  gold: { text: "text-brand-gold", bg: "bg-brand-gold/10", border: "border-brand-gold/30" },
  cyan: { text: "text-brand-cyan", bg: "bg-brand-cyan/10", border: "border-brand-cyan/30" },
  magenta: { text: "text-brand-magenta", bg: "bg-brand-magenta/10", border: "border-brand-magenta/30" },
} as const;

export function ScienceSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 border-t border-foreground/5">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand-cyan/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-magenta/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: narrative */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-cyan mb-4">
              Ciência por trás
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Uma plataforma <span className="text-gradient-cyan">cientificamente ancorada</span>, não inspirada.
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
              Cada métrica, intervenção e recomendação parte de instrumentos validados por décadas de pesquisa.
              Sem achismo, sem moda corporativa — só evidência traduzida em ação.
            </p>

            <Link
              to="/evidencias"
              className="inline-flex items-center gap-2 text-sm font-heading font-bold text-foreground px-5 py-3 rounded-xl glass-card hover:bg-foreground/10 transition-colors"
            >
              Explorar o banco de 3.000+ evidências
              <BookMarked className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Right: frameworks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FRAMEWORKS.map((f, i) => {
              const a = accentMap[f.accent as keyof typeof accentMap];
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card rounded-2xl p-5 hover:scale-[1.03] transition-transform duration-300"
                >
                  <div className={`w-10 h-10 rounded-lg ${a.bg} ${a.border} border flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${a.text}`} />
                  </div>
                  <h3 className="font-heading font-bold text-sm text-foreground mb-1.5 leading-tight">
                    {f.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
