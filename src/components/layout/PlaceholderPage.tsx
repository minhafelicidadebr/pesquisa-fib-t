import { motion } from "framer-motion";
import { ArrowRight, Construction, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { InstitutionalFooter } from "@/components/deck/InstitutionalFooter";
import { LeadFormModal } from "@/components/deck/LeadFormModal";

interface RoadmapItem {
  title: string;
  description: string;
}

interface PlaceholderPageProps {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  accent: "gold" | "cyan" | "magenta";
  icon: React.ElementType;
  roadmap: RoadmapItem[];
  ctaLabel?: string;
  ctaTo?: string;
}

const accentMap = {
  gold: {
    text: "text-brand-gold",
    bg: "bg-brand-gold/10",
    border: "border-brand-gold/30",
    glow: "glow-gold",
    grad: "text-gradient-gold",
    halo: "bg-brand-gold/15",
  },
  cyan: {
    text: "text-brand-cyan",
    bg: "bg-brand-cyan/10",
    border: "border-brand-cyan/30",
    glow: "glow-cyan",
    grad: "text-gradient-cyan",
    halo: "bg-brand-cyan/15",
  },
  magenta: {
    text: "text-brand-magenta",
    bg: "bg-brand-magenta/10",
    border: "border-brand-magenta/30",
    glow: "glow-magenta",
    grad: "text-gradient-magenta",
    halo: "bg-brand-magenta/15",
  },
};

export function PlaceholderPage({
  eyebrow,
  title,
  subtitle,
  accent,
  icon: Icon,
  roadmap,
  ctaLabel = "Quero ser avisado quando lançar",
  ctaTo,
}: PlaceholderPageProps) {
  const [formOpen, setFormOpen] = useState(false);
  const a = accentMap[accent];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <AppNavbar onCtaClick={() => setFormOpen(true)} />

      <main className="pt-24 pb-16 px-4 sm:px-6">
        {/* Hero */}
        <section className="relative max-w-5xl mx-auto text-center pt-12 pb-20">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] ${a.halo} rounded-full blur-[140px] animate-pulse-glow`} />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${a.bg} ${a.border} border mb-6`}>
              <Sparkles className={`w-3.5 h-3.5 ${a.text}`} />
              <span className={`text-xs font-heading font-bold uppercase tracking-wider ${a.text}`}>{eyebrow}</span>
            </div>

            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${a.bg} ${a.border} border mb-8 ${a.glow}`}>
              <Icon className={`w-10 h-10 ${a.text}`} />
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-[1.1]">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
              {ctaTo ? (
                <Link
                  to={ctaTo}
                  className={`inline-flex items-center justify-center gap-2 gradient-gold text-primary-foreground font-heading font-bold px-8 py-4 rounded-xl text-base ${a.glow}`}
                >
                  {ctaLabel} <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  onClick={() => setFormOpen(true)}
                  className={`inline-flex items-center justify-center gap-2 gradient-gold text-primary-foreground font-heading font-bold px-8 py-4 rounded-xl text-base ${a.glow}`}
                >
                  {ctaLabel} <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <Link
                to="/fibia"
                className="inline-flex items-center justify-center gap-2 border border-foreground/20 text-foreground font-heading font-semibold px-8 py-4 rounded-xl text-base hover:bg-foreground/5 transition-colors"
              >
                Conversar com a FIBia agora
              </Link>
            </div>

            <div className="inline-flex items-center gap-2 mt-8 text-xs text-muted-foreground">
              <Construction className="w-3.5 h-3.5" />
              <span>Módulo em construção · Roadmap público abaixo</span>
            </div>
          </motion.div>
        </section>

        {/* Roadmap */}
        <section className="max-w-5xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-3">
            O que está sendo construído
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Cada bloco é uma capacidade real do programa, fundamentada em ciência e desenhada para gerar impacto mensurável.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roadmap.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`glass-card rounded-2xl p-6 hover:border-foreground/20 transition-all duration-300 group`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${a.bg} ${a.border} border flex items-center justify-center shrink-0 font-display font-bold ${a.text}`}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-foreground mb-1.5">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <InstitutionalFooter />
      <LeadFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
