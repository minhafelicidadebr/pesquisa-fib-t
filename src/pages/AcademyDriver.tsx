import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Coins, Lightbulb, BookOpenCheck, RotateCcw } from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { InstitutionalFooter } from "@/components/deck/InstitutionalFooter";
import { getDriver, DRIVERS, PILLAR_LABEL, type Driver } from "@/data/academy";
import { useIftCoins } from "@/hooks/useIftCoins";

const accentClasses: Record<Driver["accent"], { text: string; bg: string; border: string; grad: string; ring: string }> = {
  gold: { text: "text-brand-gold", bg: "bg-brand-gold/10", border: "border-brand-gold/40", grad: "text-gradient-gold", ring: "ring-brand-gold/30" },
  cyan: { text: "text-brand-cyan", bg: "bg-brand-cyan/10", border: "border-brand-cyan/40", grad: "text-gradient-cyan", ring: "ring-brand-cyan/30" },
  magenta: { text: "text-brand-magenta", bg: "bg-brand-magenta/10", border: "border-brand-magenta/40", grad: "text-gradient-magenta", ring: "ring-brand-magenta/30" },
};

export default function DriverDetail() {
  const { slug } = useParams<{ slug: string }>();
  const driver = slug ? getDriver(slug) : undefined;
  const { totalCoins, completeMission, resetMission, isCompleted } = useIftCoins();

  if (!driver) return <Navigate to="/academy" replace />;

  const a = accentClasses[driver.accent];
  const completedHere = driver.missions.filter((m) => isCompleted(m.id)).length;
  const totalReward = driver.missions.reduce((s, m) => s + m.reward, 0);
  const earnedReward = driver.missions.filter((m) => isCompleted(m.id)).reduce((s, m) => s + m.reward, 0);
  const progress = Math.round((completedHere / driver.missions.length) * 100);

  const resonates = driver.resonates
    .map((s) => DRIVERS.find((d) => d.slug === s))
    .filter(Boolean) as Driver[];

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link
            to="/academy"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Academy
          </Link>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[10px] uppercase tracking-[0.18em] font-heading px-2 py-1 rounded-md ${a.bg} ${a.text}`}>
                {PILLAR_LABEL[driver.pillar]} · {driver.perma}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{driver.level}</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-[1.05] mb-3">
              {driver.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">{driver.shortPitch}</p>
          </motion.div>

          {/* Progress + Coin strip */}
          <div className="glass-card-strong rounded-2xl p-5 border border-foreground/10 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-heading">Progresso desta trilha</p>
                <p className="font-display text-2xl font-bold">{completedHere}/{driver.missions.length}<span className="text-sm text-muted-foreground font-heading ml-2">missões</span></p>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-heading">IFT desta trilha</p>
                <p className={`font-display text-2xl font-bold ${a.text} inline-flex items-center gap-1.5`}>
                  <Coins className="w-5 h-5" /> {earnedReward}<span className="text-sm text-muted-foreground font-heading ml-1">/{totalReward}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-heading">Saldo global</p>
                <p className="font-display text-2xl font-bold text-brand-gold inline-flex items-center gap-1.5">
                  <Coins className="w-5 h-5" /> {totalCoins}
                </p>
              </div>
            </div>
            <div className="h-2 rounded-full bg-foreground/5 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-brand-gold via-brand-cyan to-brand-magenta transition-all duration-700`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Por que importa + Evidência */}
          <div className="grid md:grid-cols-2 gap-5 mb-10">
            <div className={`glass-card rounded-2xl p-5 border ${a.border}`}>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className={`w-4 h-4 ${a.text}`} />
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-heading">Por que importa</p>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">{driver.why}</p>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-foreground/10">
              <div className="flex items-center gap-2 mb-2">
                <BookOpenCheck className="w-4 h-4 text-brand-cyan" />
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-heading">Evidência científica</p>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">{driver.evidence}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {driver.via.map((v) => (
                  <span key={v} className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-md bg-foreground/5 text-muted-foreground">
                    VIA · {v}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Missões */}
          <h2 className="font-display text-2xl font-bold mb-4">
            Micro-missões <span className={a.grad}>de 5 a 20 minutos</span>
          </h2>
          <div className="space-y-3 mb-10">
            {driver.missions.map((m, idx) => {
              const done = isCompleted(m.id);
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`glass-card rounded-xl p-5 border transition-all ${
                    done ? `${a.border} ${a.bg}` : "border-foreground/10"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        done ? `${a.bg} ${a.text}` : "bg-foreground/5 text-muted-foreground"
                      }`}
                    >
                      {done ? <Check className="w-5 h-5" /> : <span className="font-heading font-bold">{idx + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-heading text-base font-bold text-foreground">{m.title}</h3>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{m.duration}</span>
                        <span className={`text-[10px] uppercase tracking-widest ${a.text} inline-flex items-center gap-1`}>
                          <Coins className="w-3 h-3" /> +{m.reward} IFT
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{m.protocol}</p>
                    </div>
                    <div className="shrink-0">
                      {done ? (
                        <button
                          onClick={() => resetMission(m.id, m.reward)}
                          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-foreground/5 transition-colors"
                          aria-label="Refazer missão"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Refazer
                        </button>
                      ) : (
                        <button
                          onClick={() => completeMission(m.id, m.reward)}
                          className={`inline-flex items-center gap-1.5 text-sm font-heading font-bold px-4 py-2 rounded-lg ${a.bg} ${a.text} hover:opacity-90 transition-opacity`}
                        >
                          <Check className="w-4 h-4" /> Concluir
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Drivers que ressoam */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-4">
              Ressoa com <span className={a.grad}>estas trilhas</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {resonates.map((r) => {
                const ra = accentClasses[r.accent];
                return (
                  <Link
                    key={r.slug}
                    to={`/academy/${r.slug}`}
                    className={`glass-card rounded-xl p-4 border border-foreground/10 ring-1 ${ra.ring} hover:border-foreground/20 transition-all`}
                  >
                    <span className={`text-[10px] uppercase tracking-[0.18em] font-heading ${ra.text}`}>
                      {PILLAR_LABEL[r.pillar]}
                    </span>
                    <p className="font-heading text-base font-bold text-foreground mt-1">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.shortPitch}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <InstitutionalFooter />
    </div>
  );
}
