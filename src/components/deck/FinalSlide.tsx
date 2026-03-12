import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Instagram, Globe, MapPin, Phone, TrendingUp, TrendingDown } from "lucide-react";
import fibiaAvatar from "@/assets/fibia-avatar.png";

interface FinalSlideProps {
  colorClass: "gold" | "cyan" | "magenta";
}

const impactStats = [
  { value: "+21%", label: "Produtividade", direction: "up" as const, color: "text-emerald-400" },
  { value: "+45%", label: "Adaptabilidade", direction: "up" as const, color: "text-emerald-400" },
  { value: "+300%", label: "Inovação", direction: "up" as const, color: "text-brand-cyan" },
  { value: "-37%", label: "Absenteísmo", direction: "down" as const, color: "text-brand-gold" },
  { value: "-48%", label: "Menos Acidentes", direction: "down" as const, color: "text-brand-gold" },
  { value: "-59%", label: "Desligamento", direction: "down" as const, color: "text-amber-400" },
  { value: "-400%", label: "Burnout", direction: "down" as const, color: "text-brand-magenta" },
];

const impactPhrases = [
  "Colaboradores felizes são 21% mais produtivos",
  "Equipes engajadas inovam 300% mais",
  "Bem-estar reduz absenteísmo em 37%",
  "Felicidade no trabalho diminui burnout em 400%",
  "Organizações saudáveis retêm 59% mais talentos",
];

export function FinalSlide({ colorClass }: FinalSlideProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [visibleStats, setVisibleStats] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((p) => (p + 1) % impactPhrases.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (visibleStats < impactStats.length) {
      const timer = setTimeout(() => setVisibleStats((v) => v + 1), 200);
      return () => clearTimeout(timer);
    }
  }, [visibleStats]);

  return (
    <div className="space-y-10">
      {/* Rotating impact phrase */}
      <div className="text-center min-h-[3rem]">
        <AnimatePresence mode="wait">
          <motion.p
            key={phraseIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="font-display text-lg md:text-2xl font-bold text-foreground"
          >
            {impactPhrases[phraseIndex]}
          </motion.p>
        </AnimatePresence>
        <p className="text-xs text-muted-foreground mt-2">Fonte: Gallup, Achor & Seligman — Delivering Happiness</p>
      </div>

      {/* Impact stats grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {impactStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={i < visibleStats ? { opacity: 1, scale: 1 } : {}}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="glass-card rounded-xl p-3 text-center group hover:border-brand-gold/20 transition-all"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              {stat.direction === "up" ? (
                <TrendingUp className={`w-3 h-3 ${stat.color}`} />
              ) : (
                <TrendingDown className={`w-3 h-3 ${stat.color}`} />
              )}
              <span className={`font-display text-lg md:text-xl font-bold ${stat.color}`}>{stat.value}</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-heading leading-tight block">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* FIBia CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="glass-card-strong rounded-2xl p-6 md:p-8 border-brand-cyan/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-gold/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/4" />

        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-brand-cyan/20 rounded-full blur-xl animate-pulse-glow" />
            <img src={fibiaAvatar} alt="FIBia" className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-brand-cyan/30 relative z-10 object-cover" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background animate-pulse" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">
              Quer ir <span className="text-gradient-cyan">mais fundo</span>?
            </h3>
            <p className="text-muted-foreground text-sm mb-3 max-w-xl">
              Teste a <strong className="text-brand-cyan">FIBia</strong>, nossa IA de Felicidade Interna Bruta.
              Diagnóstico com 32 questões científicas, dashboard personalizado e trilhas de desenvolvimento.
            </p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="text-[10px] bg-brand-cyan/15 text-brand-cyan px-2 py-1 rounded-full font-heading">9 Domínios</span>
              <span className="text-[10px] bg-brand-gold/15 text-brand-gold px-2 py-1 rounded-full font-heading">IA + Ciência</span>
              <span className="text-[10px] bg-brand-magenta/15 text-brand-magenta px-2 py-1 rounded-full font-heading">Trilhas Personalizadas</span>
            </div>
          </div>

          <a
            href="/fibia"
            className="shrink-0 gradient-cyan text-primary-foreground font-heading font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all hover:scale-105 glow-cyan"
          >
            Testar Demo da FIBia
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </motion.div>

      {/* Institutional footer inline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="glass-card rounded-2xl p-6 md:p-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img
              src="https://static.wixstatic.com/media/575677_386e5f9273d14adf9b36d5a87a5207b8~mv2.png/v1/crop/x_0,y_758,w_2400,h_884/fill/w_248,h_91,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/2.png"
              alt="Instituto Felicidade para Todos"
              className="h-10 mb-3"
            />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Programa Felicidade e Crescimento para Todos — ciência, tecnologia e impacto a serviço do bem-estar organizacional.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-bold text-foreground text-xs uppercase tracking-wider">Contato</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-brand-gold shrink-0" />
                <span>Impact HUB Brasília - SGAN 601, Lote H, Edifício Íon, Asa Norte, Brasília/DF</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-brand-gold" />
                <span>(61) 3550-8779</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-4">
            <div className="space-y-2">
              <h4 className="font-heading font-bold text-foreground text-xs uppercase tracking-wider">Canais</h4>
              <div className="flex gap-3">
                <a href="https://www.felicidadeparatodos.com.br" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand-gold transition-colors">
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
                <a href="https://www.instagram.com/felicidadeparatodosbr" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand-magenta transition-colors">
                  <Instagram className="w-3.5 h-3.5" /> Instagram
                </a>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-1.5">WhatsApp Institucional</p>
              <img
                src="https://static.wixstatic.com/media/575677_a847e9799fef4ac19fadf79d6cb85b88~mv2.png/v1/fill/w_838,h_838,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/qrcode%20whatsapp%20instituto.png"
                alt="QR Code WhatsApp"
                className="w-20 h-20 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-foreground/10 mt-6 pt-4 text-center">
          <p className="text-[10px] text-muted-foreground">© 2025 - Instituto Felicidade para Todos. Todos os direitos reservados.</p>
        </div>
      </motion.div>
    </div>
  );
}
