import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import hubData from "@/data/hub.json";
import { ImpactCounter } from "@/components/deck/ImpactCounter";
import { SegmentCard } from "@/components/deck/SegmentCard";
import { LeadFormModal } from "@/components/deck/LeadFormModal";
import { InstitutionalFooter } from "@/components/deck/InstitutionalFooter";
import { KnowledgeSection } from "@/components/deck/KnowledgeSection";
import { CrisisDashboard } from "@/components/deck/CrisisDashboard";
import { ImpactCalculator } from "@/components/deck/ImpactCalculator";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { FourAxesSection } from "@/components/landing/FourAxesSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { ScienceSection } from "@/components/landing/ScienceSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import fibiaAvatar from "@/assets/fibia-avatar.png";

const Index = () => {
  const [formOpen, setFormOpen] = useState(false);

  const segmentColors: Record<string, "gold" | "cyan" | "magenta"> = {
    "Setor Público": "gold",
    "Setor Privado": "cyan",
    "Sociedade Civil": "magenta",
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <AppNavbar onCtaClick={() => setFormOpen(true)} />

      {/* HERO — neuromarketing premium */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-4 sm:px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-gold/8 rounded-full blur-[140px] animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-cyan/6 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-brand-magenta/5 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "2s" }} />

          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Top trust pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border-brand-gold/20 mb-8"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-xs font-heading font-semibold text-foreground">
              Recorde mundial · +110.000 aplicações FIB
            </span>
          </motion.div>

          {/* Floating icon halo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative inline-block mb-8"
          >
            <div className="absolute inset-0 w-24 h-24 mx-auto bg-brand-gold/20 rounded-full blur-2xl animate-pulse-glow" />
            <img
              src={hubData.brand.logos.icon}
              alt=""
              className="w-20 h-20 mx-auto relative z-10 animate-float"
            />
          </motion.div>

          {/* Headline neuromarketing — promessa, prova, futuro */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[1.05] tracking-tight"
          >
            Transforme bem-estar em
            <br />
            <span className="text-gradient-gold">vantagem competitiva</span> mensurável.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-body mb-3"
          >
            A primeira plataforma brasileira que une <strong className="text-foreground">ciência da felicidade</strong>, <strong className="text-foreground">conformidade NR-1</strong> e <strong className="text-foreground">impacto ESG</strong> em um único sistema vivo.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="text-sm md:text-base text-muted-foreground/80 max-w-2xl mx-auto mb-10"
          >
            Diagnóstico em 12 minutos · Plano de ação em 24h · Resultado em 90 dias.
          </motion.p>

          {/* Primary + secondary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-16"
          >
            <Link
              to="/fibia"
              className="group inline-flex items-center justify-center gap-2 gradient-gold text-primary-foreground font-heading font-bold px-8 py-4 rounded-xl text-base sm:text-lg glow-gold hover:scale-[1.02] transition-transform"
            >
              <MessageCircle className="w-5 h-5" />
              Diagnóstico gratuito agora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#segmentos"
              className="inline-flex items-center justify-center gap-2 glass-card border-foreground/20 text-foreground font-heading font-semibold px-8 py-4 rounded-xl text-base sm:text-lg hover:bg-foreground/10 transition-colors"
            >
              <Sparkles className="w-5 h-5 text-brand-gold" />
              Ver para o meu segmento
            </a>
          </motion.div>

          {/* Impact numbers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {hubData.brand.impact_numbers.map((item, i) => (
              <ImpactCounter
                key={item.label}
                value={item.value}
                label={item.label}
                badge={item.badge}
                delay={i * 150}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4 EIXOS — jornada do programa */}
      <FourAxesSection />

      {/* PROVA SOCIAL */}
      <SocialProofSection />

      {/* SEGMENTOS — apresentações */}
      <section id="segmentos" className="py-24 px-4 sm:px-6 border-t border-foreground/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-magenta mb-3">
              Apresentações executivas
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Cada setor tem sua <span className="text-gradient-magenta">linguagem</span>.
              <br />
              Falamos todas elas.
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Decks premium desenhados para o contexto, vocabulário e prioridades do seu setor — com dados reais, casos e ROI mensurável.
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

      {/* CRISE — urgência baseada em dados */}
      <CrisisDashboard />

      {/* CALCULADORA DE ROI */}
      <ImpactCalculator />

      {/* CIÊNCIA — autoridade */}
      <ScienceSection />

      {/* CONHECIMENTO */}
      <KnowledgeSection />

      {/* CTA FINAL */}
      <FinalCTASection onScheduleClick={() => setFormOpen(true)} />

      <InstitutionalFooter />
      <LeadFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} />

      {/* FIBia floating CTA */}
      <motion.a
        href="/fibia"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5, type: "spring", damping: 15 }}
        className="fixed bottom-6 right-6 z-40 group"
        aria-label="Conversar com a FIBia"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-brand-gold/30 rounded-full blur-xl animate-ping" style={{ animationDuration: "3s" }} />
          <div className="absolute -inset-2 bg-gradient-to-r from-brand-gold via-brand-cyan to-brand-magenta rounded-full blur-lg opacity-60 group-hover:opacity-80 transition-opacity animate-pulse-glow" />

          <div className="relative flex items-center gap-3 bg-card border border-brand-gold/30 rounded-full pl-2 pr-5 py-2 shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="relative">
              <img
                src={fibiaAvatar}
                alt=""
                className="w-12 h-12 rounded-full border-2 border-brand-gold/50 object-cover"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-brand-green rounded-full border-2 border-card animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-sm text-foreground group-hover:text-brand-gold transition-colors">
                Converse com a FIBia
              </span>
              <span className="text-[10px] text-muted-foreground">
                Diagnóstico gratuito · 12 min
              </span>
            </div>
            <MessageCircle className="w-4 h-4 text-brand-gold group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </motion.a>
    </div>
  );
};

export default Index;
