import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Instagram, Globe, MapPin, Phone, TrendingUp, TrendingDown } from "lucide-react";
import fibiaAvatar from "@/assets/fibia-avatar.png";

interface FinalSlideProps {
  colorClass: "gold" | "cyan" | "magenta";
}

const impactStats = [
  { value: "+21%", label: "Produtividade", direction: "up" as const },
  { value: "+45%", label: "Adaptabilidade", direction: "up" as const },
  { value: "+300%", label: "Inovação", direction: "up" as const },
  { value: "-37%", label: "Absenteísmo", direction: "down" as const },
  { value: "-48%", label: "Menos Acidentes", direction: "down" as const },
  { value: "-59%", label: "Desligamento", direction: "down" as const },
  { value: "-400%", label: "Burnout", direction: "down" as const },
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
      const timer = setTimeout(() => setVisibleStats((v) => v + 1), 150);
      return () => clearTimeout(timer);
    }
  }, [visibleStats]);

  return (
    <div className="flex flex-col gap-5 max-h-[calc(100vh-10rem)] justify-center">
      {/* Rotating phrase */}
      <div className="text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={phraseIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
            className="font-display text-lg md:text-2xl font-bold text-foreground"
          >
            {impactPhrases[phraseIndex]}
          </motion.p>
        </AnimatePresence>
        <p className="text-[10px] text-muted-foreground mt-1">Fonte: Gallup, Achor & Seligman — Delivering Happiness</p>
      </div>

      {/* Stats grid — compact */}
      <div className="grid grid-cols-7 gap-2">
        {impactStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={i < visibleStats ? { opacity: 1, scale: 1 } : {}}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="glass-card rounded-xl p-2.5 text-center"
          >
            <div className="flex items-center justify-center gap-0.5 mb-0.5">
              {stat.direction === "up" ? (
                <TrendingUp className="w-3 h-3 text-emerald-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-brand-gold" />
              )}
              <span className={`font-display text-base md:text-lg font-bold ${stat.direction === "up" ? "text-emerald-400" : "text-brand-gold"}`}>
                {stat.value}
              </span>
            </div>
            <span className="text-[9px] text-muted-foreground font-heading leading-tight block">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* FIBia CTA + Institutional — side by side */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* FIBia CTA — 3 cols */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="md:col-span-3 glass-card-strong rounded-2xl p-5 border-brand-cyan/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-brand-cyan/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4" />

          <div className="relative flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-brand-cyan/20 rounded-full blur-lg animate-pulse" />
              <img src={fibiaAvatar} alt="FIBia" className="w-14 h-14 rounded-full border-2 border-brand-cyan/30 relative z-10 object-cover" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-display text-base md:text-lg font-bold text-foreground mb-1">
                Quer ir <span className="text-gradient-cyan">mais fundo</span>?
              </h3>
              <p className="text-muted-foreground text-xs mb-2 line-clamp-2">
                Teste a <strong className="text-brand-cyan">FIBia</strong>, nossa IA — diagnóstico com 32 questões, dashboard personalizado e trilhas.
              </p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className="text-[9px] bg-brand-cyan/15 text-brand-cyan px-2 py-0.5 rounded-full font-heading">9 Domínios</span>
                <span className="text-[9px] bg-brand-gold/15 text-brand-gold px-2 py-0.5 rounded-full font-heading">IA + Ciência</span>
                <span className="text-[9px] bg-brand-magenta/15 text-brand-magenta px-2 py-0.5 rounded-full font-heading">Trilhas Personalizadas</span>
              </div>
            </div>

            <a
              href="/fibia"
              className="shrink-0 gradient-cyan text-primary-foreground font-heading font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 hover:opacity-90 transition-all hover:scale-105 glow-cyan"
            >
              Testar FIBia
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>

        {/* Institutional — 2 cols */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="md:col-span-2 glass-card rounded-2xl p-4 flex flex-col justify-between"
        >
          <div className="flex items-start gap-3 mb-3">
            <img
              src="https://static.wixstatic.com/media/575677_386e5f9273d14adf9b36d5a87a5207b8~mv2.png/v1/crop/x_0,y_758,w_2400,h_884/fill/w_248,h_91,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/2.png"
              alt="Instituto Felicidade para Todos"
              className="h-7 shrink-0"
            />
          </div>
          <div className="flex gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                <MapPin className="w-3 h-3 mt-0.5 text-brand-gold shrink-0" />
                <span className="line-clamp-2">Impact HUB Brasília — SGAN 601, Asa Norte, Brasília/DF</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Phone className="w-3 h-3 text-brand-gold" />
                <span>(61) 3550-8779</span>
              </div>
              <div className="flex gap-2 mt-1">
                <a href="https://www.felicidadeparatodos.com.br" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-brand-gold transition-colors">
                  <Globe className="w-3 h-3" /> Site
                </a>
                <a href="https://www.instagram.com/felicidadeparatodosbr" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-brand-magenta transition-colors">
                  <Instagram className="w-3 h-3" /> Instagram
                </a>
              </div>
            </div>
            <img
              src="https://static.wixstatic.com/media/575677_a847e9799fef4ac19fadf79d6cb85b88~mv2.png/v1/fill/w_838,h_838,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/qrcode%20whatsapp%20instituto.png"
              alt="QR Code WhatsApp"
              className="w-14 h-14 rounded-lg shrink-0"
            />
          </div>
          <p className="text-[8px] text-muted-foreground mt-2 text-center border-t border-foreground/5 pt-1.5">© 2025 - Instituto Felicidade para Todos</p>
        </motion.div>
      </div>
    </div>
  );
}
