import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Trophy, Heart, Star, ExternalLink, ShieldCheck, Sparkles, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  open: boolean;
  onClose: () => void;
  onPrimary?: () => void;
}

const fireConfetti = () => {
  const duration = 2500;
  const end = Date.now() + duration;
  const colors = ["#FFB703", "#FB5607", "#FF006E", "#8338EC", "#3A86FF"];
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 65, origin: { x: 0 }, colors });
    confetti({ particleCount: 4, angle: 120, spread: 65, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  setTimeout(() => {
    confetti({ particleCount: 140, spread: 90, origin: { y: 0.45 }, colors });
  }, 200);
};

export function CelebrationModal({ open, onClose, onPrimary }: Props) {
  const { profile } = useAuth();
  const name = profile?.full_name?.split(" ")[0] || "Colaborador";

  useEffect(() => {
    if (open) fireConfetti();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 220 }}
            className="relative w-full max-w-2xl glass-card-strong rounded-3xl p-6 md:p-10 my-8"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-lg transition-colors" aria-label="Fechar">
              <X className="w-5 h-5" />
            </button>

            {/* Trofeu */}
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.15 }}
                className="w-24 h-24 rounded-full bg-brand-gold/15 border-4 border-brand-gold/40 flex items-center justify-center mb-6 glow-gold"
              >
                <Trophy className="w-12 h-12 text-brand-gold" />
              </motion.div>

              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Parabéns, <span className="text-gradient-gold">{name}</span>! 🎉
              </h2>
              <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
                Sua participação é fundamental para construir um ambiente de trabalho mais saudável e humano.
              </p>

              {/* Mensagem IFT */}
              <div className="w-full glass-card rounded-2xl p-5 mb-6 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-magenta/15 border border-brand-magenta/30 flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5 text-brand-magenta" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-brand-gold text-sm mb-1">Uma mensagem de Felicidade para Todos</p>
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      Cada resposta nos ajuda a entender melhor como podemos cuidar de você. <strong className="text-foreground">Felicidade para Todos</strong> acredita que o florescimento humano é o verdadeiro motor da excelência organizacional.
                    </p>
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-brand-cyan">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Suas respostas são 100% anônimas e protegidas por LGPD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reward header */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-brand-gold" />
                <p className="font-heading font-bold text-sm text-foreground">🎁 Você desbloqueou acesso exclusivo</p>
                <Sparkles className="w-4 h-4 text-brand-gold" />
              </div>

              {/* CTAs */}
              <div className="w-full grid gap-3 mb-6">
                <a
                  href="https://edtech-da-felicidade.lovable.app/"
                  target="_blank" rel="noopener noreferrer"
                  className="group glass-card rounded-2xl p-4 hover:border-brand-magenta/40 transition-all flex items-center gap-4 text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-magenta/15 border border-brand-magenta/30 flex items-center justify-center shrink-0">
                    <Heart className="w-6 h-6 text-brand-magenta" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[10px] font-heading font-bold uppercase tracking-wider text-brand-magenta bg-brand-magenta/10 px-2 py-0.5 rounded-full mb-1">Para Você</span>
                    <h4 className="font-heading font-bold text-foreground text-sm">A Ciência da Felicidade</h4>
                    <p className="text-xs text-brand-gold mb-1">Ferramenta do Florescimento Humano</p>
                    <p className="text-xs text-muted-foreground">Fundamentos históricos, frameworks científicos e os grandes arquitetos do bem-estar humano.</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-brand-magenta transition-colors shrink-0" />
                </a>

                <a
                  href="https://curso-felicidade-adolescentes-yale.lovable.app/"
                  target="_blank" rel="noopener noreferrer"
                  className="group glass-card rounded-2xl p-4 hover:border-brand-green/40 transition-all flex items-center gap-4 text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-green/15 border border-brand-green/30 flex items-center justify-center shrink-0">
                    <Star className="w-6 h-6 text-brand-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[10px] font-heading font-bold uppercase tracking-wider text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full mb-1">Para Sua Família</span>
                    <h4 className="font-heading font-bold text-foreground text-sm">Bem-Estar para Adolescentes</h4>
                    <p className="text-xs text-brand-gold mb-1">Baseado no curso de Yale</p>
                    <p className="text-xs text-muted-foreground">A aula mais popular de Yale. Gratuita, gamificada e com tutoria de IA. Para você e sua família.</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-brand-green transition-colors shrink-0" />
                </a>
              </div>

              {/* Footer actions */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={onPrimary || onClose}
                  className="flex-1 bg-brand-gold text-background font-heading font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity glow-gold"
                >
                  Voltar à Página Principal →
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 border border-foreground/20 text-foreground font-heading font-semibold px-6 py-3 rounded-xl hover:bg-foreground/5 transition-colors"
                >
                  Explorar depois
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
