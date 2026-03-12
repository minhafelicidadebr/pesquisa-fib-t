import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronLeft, Menu, X, Home, Shield, Globe, Zap, Star } from "lucide-react";
import setorPublicoData from "@/data/setor-publico.json";
import setorPrivadoData from "@/data/setor-privado.json";
import sociedadeCivilData from "@/data/sociedade-civil.json";
import fibiaAvatar from "@/assets/fibia-avatar.png";
import { LeadFormModal } from "@/components/deck/LeadFormModal";
import { ImpactCounter } from "@/components/deck/ImpactCounter";
import { PasswordGate } from "@/components/deck/PasswordGate";
import { DiagnosticLensModal } from "@/components/deck/DiagnosticLensModal";
import { ScienceSlide } from "@/components/deck/ScienceSlide";
import { FinalSlide } from "@/components/deck/FinalSlide";

const segmentDataMap: Record<string, any> = {
  "setor-publico": setorPublicoData,
  "setor-privado": setorPrivadoData,
  "sociedade-civil": sociedadeCivilData,
};

const segmentColorMap: Record<string, { gradient: string; glow: string; textGradient: string; badge: string; colorClass: "gold" | "cyan" | "magenta" }> = {
  "setor-publico": { gradient: "gradient-gold", glow: "glow-gold", textGradient: "text-gradient-gold", badge: "bg-brand-gold/15 text-brand-gold", colorClass: "gold" },
  "setor-privado": { gradient: "gradient-cyan", glow: "glow-cyan", textGradient: "text-gradient-cyan", badge: "bg-brand-cyan/15 text-brand-cyan", colorClass: "cyan" },
  "sociedade-civil": { gradient: "gradient-magenta", glow: "glow-magenta", textGradient: "text-gradient-magenta", badge: "bg-brand-magenta/15 text-brand-magenta", colorClass: "magenta" },
};

const lensIcons: Record<string, any> = { "COPSOQ": Shield, "FIB": Globe, "PERMA+V": Zap, "VIA": Star };

export default function SegmentDeck() {
  const { segment } = useParams<{ segment: string }>();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);
  const [lensOpen, setLensOpen] = useState(false);
  const [lensInitial, setLensInitial] = useState<string | undefined>();
  const [direction, setDirection] = useState(0);
  const [unlocked, setUnlocked] = useState(false);

  const data = segmentDataMap[segment || ""];
  const colors = segmentColorMap[segment || ""] || segmentColorMap["setor-publico"];
  const dataSlides = (data?.slides || []) as any[];
  // Append a virtual final slide
  const slides = [...dataSlides, { id: "FINAL_SLIDE", title: "Impacto & Próximos Passos", layout: "final" }];
  const total = slides.length;
  const slide = slides[currentSlide];

  const isScienceSlide = slide?.id === "S01B_CIENCIA";
  const is4LensSlide = slide?.id?.includes("4LENTES");
  const isFinalSlide = slide?.id === "FINAL_SLIDE";

  useEffect(() => {
    const key = `deck_unlocked_${segment}`;
    if (sessionStorage.getItem(key) === "true") setUnlocked(true);
  }, [segment]);

  const handleUnlock = () => {
    setUnlocked(true);
    sessionStorage.setItem(`deck_unlocked_${segment}`, "true");
  };

  const goTo = useCallback((index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(Math.max(0, Math.min(index, total - 1)));
    setIndexOpen(false);
  }, [currentSlide, total]);

  const next = useCallback(() => { if (currentSlide < total - 1) goTo(currentSlide + 1); }, [currentSlide, total, goTo]);
  const prev = useCallback(() => { if (currentSlide > 0) goTo(currentSlide - 1); }, [currentSlide, goTo]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (formOpen || indexOpen || lensOpen || !unlocked) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") next();
      if (e.key === "ArrowLeft" || e.key === "PageUp") prev();
      if (e.key === "Home") goTo(0);
      if (e.key === "End") goTo(total - 1);
      if (e.key === "Escape") navigate("/");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev, goTo, total, formOpen, indexOpen, lensOpen, navigate, unlocked]);

  const openLens = (lensId?: string) => {
    setLensInitial(lensId);
    setLensOpen(true);
  };

  const handleCta = (action: string, target?: string) => {
    if (action === "nextSlide") next();
    else if (action === "openLeadForm") setFormOpen(true);
    else if (action === "goToSlide") {
      const idx = slides.findIndex((s: any) => s.id === target);
      if (idx >= 0) goTo(idx);
    } else if (action === "openModal" && target?.includes("4lentes")) {
      openLens();
    } else if (action === "openModal") setFormOpen(true);
    else if (action === "goToRoute" && target) {
      if (target.startsWith("/demos")) setFormOpen(true);
      else navigate(target);
    } else setFormOpen(true);
  };

  const progress = total > 0 ? ((currentSlide + 1) / total) * 100 : 0;

  if (!data) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Segmento não encontrado.</p></div>;
  if (!unlocked) return <PasswordGate segmentLabel={data.segment_label} onUnlock={handleUnlock} colorClass={colors.colorClass} />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-foreground/5">
        <div className="h-0.5 bg-muted">
          <motion.div className={`h-full ${colors.gradient}`} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors p-1.5" aria-label="Voltar ao hub">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className={`font-heading font-bold text-sm ${colors.textGradient}`}>{data.segment_label}</span>
            <span className="text-xs text-muted-foreground tabular-nums-data">{currentSlide + 1} / {total}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground p-1.5 transition-colors" aria-label="Página inicial">
              <Home className="w-4 h-4" />
            </button>
            <button onClick={() => setIndexOpen(!indexOpen)} className="text-muted-foreground hover:text-foreground p-1.5 transition-colors" aria-label="Índice">
              <Menu className="w-5 h-5" />
            </button>
            <button onClick={() => setFormOpen(true)} className={`${colors.gradient} text-primary-foreground font-heading font-bold text-xs px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity hidden sm:block`}>
              Agendar reunião
            </button>
          </div>
        </div>
      </div>

      {/* Index overlay */}
      <AnimatePresence>
        {indexOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm overflow-y-auto pt-20 pb-8 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-heading text-xl font-bold text-foreground">Índice — {data.segment_label}</h2>
                <button onClick={() => setIndexOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {slides.map((s: any, i: number) => (
                  <button key={s.id} onClick={() => goTo(i)} className={`text-left glass-card rounded-lg p-4 hover:border-brand-gold/20 transition-all ${i === currentSlide ? "border-brand-gold/40 glow-gold" : ""}`}>
                    <h3 className="font-heading font-semibold text-sm text-foreground line-clamp-2">{s.title}</h3>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 pt-16 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-6 py-12 md:py-20">
          <div className="w-full max-w-5xl">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={slide.id}
                custom={direction}
                initial={{ opacity: 0, y: direction >= 0 ? 40 : -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: direction >= 0 ? -40 : 40 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Science slide override */}
                {isScienceSlide ? (
                  <ScienceSlide colorClass={colors.colorClass} onCtaClick={() => setFormOpen(true)} onNextSlide={next} />
                ) : (
                  <>
                    <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-[1.15] tracking-tight">{slide.title}</h1>
                    {slide.subtitle && <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-3xl">{slide.subtitle}</p>}

                    {/* 4 Lenses interactive cards */}
                    {is4LensSlide && slide.bullets ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
                        {slide.bullets.map((bullet: string, i: number) => {
                          const lensKey = ["copsoq", "fib", "perma", "via"][i];
                          const lensName = bullet.split(":")[0]?.trim() || "";
                          const IconComp = lensIcons[lensName] || Shield;
                          return (
                            <motion.button
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + i * 0.08 }}
                              onClick={() => openLens(lensKey)}
                              className="glass-card rounded-lg px-5 py-4 flex items-start gap-3 text-left hover:border-brand-gold/30 transition-all group cursor-pointer"
                            >
                              <IconComp className="w-5 h-5 text-brand-gold mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                              <div>
                                <span className="text-foreground/90 text-sm leading-relaxed">{bullet}</span>
                                <p className="text-xs text-brand-gold mt-1.5 font-heading font-semibold">Clique para explorar →</p>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    ) : slide.bullets && slide.bullets.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
                        {slide.bullets.map((bullet: string, i: number) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }} className="glass-card rounded-lg px-5 py-4 flex items-start gap-3">
                            <span className={`w-2 h-2 rounded-full ${colors.gradient} mt-2 shrink-0`} />
                            <span className="text-foreground/90 text-sm leading-relaxed">{bullet}</span>
                          </motion.div>
                        ))}
                      </div>
                    ) : null}

                    {slide.data_points && slide.data_points.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        {slide.data_points.map((dp: any, i: number) => (
                          <ImpactCounter key={dp.label} value={dp.value} label={dp.label} badge={dp.badge} delay={i * 150} />
                        ))}
                      </div>
                    )}

                    {slide.service_cards && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
                        {slide.service_cards.map((sc: any, i: number) => (
                          <motion.div key={sc.pillar} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }} className="glass-card rounded-lg p-4 hover:border-brand-gold/20 transition-all cursor-pointer group">
                            <span className={`text-[10px] font-heading font-bold uppercase tracking-wider ${colors.textGradient}`}>{sc.pillar}</span>
                            <h4 className="font-heading font-bold text-xs text-foreground mt-1 mb-2 line-clamp-2">{sc.title}</h4>
                            <ul className="space-y-1">{sc.items.map((item: string) => <li key={item} className="text-[11px] text-muted-foreground">• {item}</li>)}</ul>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      {slide.cta_primary && (
                        <button onClick={() => handleCta(slide.cta_primary.action, slide.cta_primary.target)} className={`${colors.gradient} text-primary-foreground font-heading font-bold text-sm px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity`}>
                          {slide.cta_primary.label}<ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                      {slide.cta_secondary && (
                        <button onClick={() => handleCta(slide.cta_secondary.action, slide.cta_secondary.target)} className="border border-foreground/20 text-foreground/80 font-heading text-sm px-6 py-3 rounded-lg hover:bg-foreground/5 transition-colors">
                          {slide.cta_secondary.label}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="sticky bottom-0 glass-card border-t border-foreground/5 px-6 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button onClick={prev} disabled={currentSlide === 0} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all font-heading">
              <ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Anterior</span>
            </button>
            <div className="flex gap-1.5 max-w-xs overflow-hidden">
              {slides.map((_: any, i: number) => (
                <button key={i} onClick={() => goTo(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? `${colors.gradient} w-6` : "bg-muted hover:bg-muted-foreground/30"}`} aria-label={`Slide ${i + 1}`} />
              ))}
            </div>
            <button onClick={next} disabled={currentSlide === total - 1} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all font-heading">
              <span className="hidden sm:inline">Próximo</span><ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {currentSlide === total - 1 && (
        <div className="max-w-5xl mx-auto px-6 pb-12 -mt-4">
          <FinalSlide colorClass={colors.colorClass} />
        </div>
      )}
      <LeadFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} segment={data.segment_label} />
      <DiagnosticLensModal isOpen={lensOpen} onClose={() => setLensOpen(false)} initialLens={lensInitial} colorClass={colors.colorClass} />
    </div>
  );
}
