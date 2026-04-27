import { motion } from "framer-motion";
import { ArrowRight, Calendar, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface FinalCTAProps {
  onScheduleClick: () => void;
}

export function FinalCTASection({ onScheduleClick }: FinalCTAProps) {
  return (
    <section className="relative py-32 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-gold/10 rounded-full blur-[160px] animate-pulse-glow" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-magenta/8 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-4xl mx-auto text-center"
      >
        <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-gold mb-6">
          Próximo passo
        </p>

        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-[1.05]">
          Bem-estar não é benefício.
          <br />
          É <span className="text-gradient-gold">infraestrutura</span> de performance sustentável.
        </h2>

        <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
          Comece com um diagnóstico em 12 minutos ou agende uma conversa de 30 minutos com nosso time de cientistas e estrategistas.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link
            to="/fibia"
            className="group inline-flex items-center justify-center gap-2 gradient-gold text-primary-foreground font-heading font-bold px-8 py-4 rounded-xl text-lg glow-gold hover:scale-[1.02] transition-transform"
          >
            <MessageCircle className="w-5 h-5" />
            Diagnóstico gratuito com a FIBia
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button
            onClick={onScheduleClick}
            className="group inline-flex items-center justify-center gap-2 glass-card border border-foreground/20 text-foreground font-heading font-semibold px-8 py-4 rounded-xl text-lg hover:bg-foreground/10 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Agendar conversa estratégica
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
            Resposta em até 24h úteis
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
            LGPD por design
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
            Sem cartão de crédito
          </span>
        </div>
      </motion.div>
    </section>
  );
}
