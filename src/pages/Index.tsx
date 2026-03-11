import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
import hubData from "@/data/hub.json";
import { ImpactCounter } from "@/components/deck/ImpactCounter";
import { SegmentCard } from "@/components/deck/SegmentCard";
import { LeadFormModal } from "@/components/deck/LeadFormModal";
import { InstitutionalFooter } from "@/components/deck/InstitutionalFooter";

const Index = () => {
  const [formOpen, setFormOpen] = useState(false);

  const segmentColors: Record<string, "gold" | "cyan" | "magenta"> = {
    "Setor Público": "gold",
    "Setor Privado": "cyan",
    "Sociedade Civil": "magenta",
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Top navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-40 glass-card border-b border-foreground/5"
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <img
            src={hubData.brand.logos.dark_bg}
            alt="Instituto Felicidade para Todos"
            className="h-8 md:h-10"
          />
          <button
            onClick={() => setFormOpen(true)}
            className="gradient-gold text-primary-foreground font-heading font-bold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Agendar reunião
          </button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">
        {/* Background halos */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-gold/5 rounded-full blur-[120px] animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-cyan/5 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-brand-magenta/4 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Icon with halo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative inline-block mb-8"
          >
            <div className="absolute inset-0 w-24 h-24 mx-auto bg-brand-gold/20 rounded-full blur-xl animate-pulse-glow" />
            <img
              src={hubData.brand.logos.icon}
              alt="Ícone"
              className="w-20 h-20 mx-auto relative z-10 animate-float"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span className="text-sm font-heading text-brand-gold font-semibold uppercase tracking-widest">
                {hubData.brand.institution}
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
              {hubData.hero.title.split(" ").map((word, i) => {
                if (word === "Felicidade") return <span key={i} className="text-gradient-gold">{word} </span>;
                if (word === "Crescimento") return <span key={i} className="text-gradient-cyan">{word} </span>;
                return <span key={i}>{word} </span>;
              })}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-body mb-10">
              {hubData.hero.subtitle}
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <a
              href="#segmentos"
              className="gradient-gold text-primary-foreground font-heading font-bold px-8 py-4 rounded-xl text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity glow-gold"
            >
              {hubData.hero.primary_cta.label}
              <ArrowDown className="w-5 h-5" />
            </a>
            <button
              onClick={() => setFormOpen(true)}
              className="border border-foreground/20 text-foreground font-heading font-semibold px-8 py-4 rounded-xl text-lg hover:bg-foreground/5 transition-colors"
            >
              Agendar reunião
            </button>
          </motion.div>

          {/* Impact numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {hubData.brand.impact_numbers.map((item, i) => (
              <ImpactCounter
                key={item.label}
                value={item.value}
                label={item.label}
                badge={item.badge}
                delay={i * 150}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Segment cards */}
      <section id="segmentos" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Escolha o seu <span className="text-gradient-gold">segmento</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Cada apresentação foi desenhada para o contexto, a linguagem e as prioridades do seu setor.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hubData.segment_cards.map((card, i) => (
              <SegmentCard
                key={card.id}
                segment={card.segment}
                headline={card.headline}
                tags={card.quick_tags}
                route={card.route}
                ctaLabel={card.cta_primary.label}
                ctaSecondaryLabel={card.cta_secondary.label}
                colorClass={segmentColors[card.segment]}
                onOpenForm={() => setFormOpen(true)}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Demo chooser section */}
      <section className="py-24 px-6 border-t border-foreground/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Demos do <span className="text-gradient-cyan">Programa</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {hubData.modal_demo_chooser.description}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hubData.modal_demo_chooser.demo_cards.map((demo, i) => (
              <motion.div
                key={demo.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-6 hover:border-brand-cyan/20 transition-all duration-300 group cursor-pointer"
              >
                <h3 className="font-heading font-bold text-foreground mb-2 group-hover:text-brand-cyan transition-colors">
                  {demo.label}
                </h3>
                <p className="text-sm text-muted-foreground">{demo.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <InstitutionalFooter />
      <LeadFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
};

export default Index;
