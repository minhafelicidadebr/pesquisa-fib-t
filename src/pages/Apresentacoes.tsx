import { useState } from "react";
import { motion } from "framer-motion";
import hubData from "@/data/hub.json";
import { SegmentCard } from "@/components/deck/SegmentCard";
import { LeadFormModal } from "@/components/deck/LeadFormModal";
import { InstitutionalFooter } from "@/components/deck/InstitutionalFooter";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { PresentationIcon } from "lucide-react";

const Apresentacoes = () => {
  const [formOpen, setFormOpen] = useState(false);

  const segmentColors: Record<string, "gold" | "cyan" | "magenta"> = {
    "Setor Público": "gold",
    "Setor Privado": "cyan",
    "Sociedade Civil": "magenta",
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar onCtaClick={() => setFormOpen(true)} />

      <section className="relative pt-32 pb-16 px-4 sm:px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-brand-magenta/8 rounded-full blur-[140px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-gold/6 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border-brand-magenta/20 mb-6"
          >
            <PresentationIcon className="w-3.5 h-3.5 text-brand-magenta" />
            <span className="text-xs font-heading font-semibold text-foreground">
              Apresentações executivas
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight"
          >
            Cada setor tem sua <span className="text-gradient-magenta">linguagem</span>.
            <br />Falamos todas elas.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Decks premium desenhados para o contexto, vocabulário e prioridades do seu setor — com dados reais, casos e ROI mensurável.
          </motion.p>
        </div>
      </section>

      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </section>

      <InstitutionalFooter />
      <LeadFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
};

export default Apresentacoes;
