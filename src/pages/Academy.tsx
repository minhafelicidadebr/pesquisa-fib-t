import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Coins, Sparkles, ArrowRight, Network } from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { InstitutionalFooter } from "@/components/deck/InstitutionalFooter";
import { DRIVERS, PILLAR_LABEL, type Driver } from "@/data/academy";
import { useIftCoins } from "@/hooks/useIftCoins";

const accentClasses: Record<Driver["accent"], { ring: string; bg: string; text: string; glow: string }> = {
  gold: { ring: "ring-brand-gold/30", bg: "bg-brand-gold/10", text: "text-brand-gold", glow: "group-hover:shadow-[0_0_40px_-10px_hsl(var(--brand-gold)/0.6)]" },
  cyan: { ring: "ring-brand-cyan/30", bg: "bg-brand-cyan/10", text: "text-brand-cyan", glow: "group-hover:shadow-[0_0_40px_-10px_hsl(var(--brand-cyan)/0.6)]" },
  magenta: { ring: "ring-brand-magenta/30", bg: "bg-brand-magenta/10", text: "text-brand-magenta", glow: "group-hover:shadow-[0_0_40px_-10px_hsl(var(--brand-magenta)/0.6)]" },
};

export default function Academy() {
  const { totalCoins, completedMissionsCount } = useIftCoins();

  const totalMissions = useMemo(
    () => DRIVERS.reduce((acc, d) => acc + d.missions.length, 0),
    []
  );

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs uppercase tracking-[0.18em] font-heading mb-4">
              <BookOpen className="w-3.5 h-3.5" /> Educar · Academy IFT
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] mb-4">
              9 trilhas científicas <span className="text-gradient-gold">para florescer</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Microlearning de 5 minutos cruzando <strong className="text-foreground">PERMA+V</strong> (Seligman) e
              <strong className="text-foreground"> VIA Character Strengths</strong>. Cada missão validada por evidência
              gera <span className="text-brand-gold font-semibold">IFT Coin</span> — progresso pessoal, sem ranking público.
            </p>
          </motion.div>

          {/* Stat strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            <StatCard label="Trilhas" value={DRIVERS.length.toString()} accent="cyan" />
            <StatCard label="Missões totais" value={totalMissions.toString()} accent="gold" />
            <StatCard
              label="Concluídas"
              value={`${completedMissionsCount}/${totalMissions}`}
              accent="magenta"
            />
            <StatCard label="IFT Coin acumulado" value={`${totalCoins}`} accent="gold" icon={<Coins className="w-4 h-4" />} />
          </div>

          {/* Constelação CTA */}
          <Link
            to="/academy/constelacao"
            className="block mb-12 group"
          >
            <div className="glass-card-strong rounded-2xl p-6 border border-foreground/10 hover:border-brand-cyan/40 transition-all flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-cyan/20 to-brand-magenta/10 flex items-center justify-center text-brand-cyan shrink-0">
                <Network className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-heading mb-1">Visualização sistêmica</p>
                <h3 className="font-heading text-lg font-bold text-foreground">Constelação dos drivers</h3>
                <p className="text-sm text-muted-foreground">Veja como cada trilha ressoa com as outras e onde estão suas alavancas de florescimento.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-cyan group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          {/* Grid de trilhas */}
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-6">
            Escolha sua próxima <span className="text-gradient-gold">missão</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DRIVERS.map((d, idx) => {
              const a = accentClasses[d.accent];
              return (
                <motion.div
                  key={d.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.4 }}
                >
                  <Link
                    to={`/academy/${d.slug}`}
                    className={`group block h-full glass-card rounded-2xl p-5 border border-foreground/10 ring-1 ${a.ring} hover:border-foreground/20 transition-all ${a.glow}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`text-[10px] uppercase tracking-[0.18em] font-heading px-2 py-1 rounded-md ${a.bg} ${a.text}`}>
                        {PILLAR_LABEL[d.pillar]}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{d.level}</span>
                    </div>
                    <h3 className="font-heading text-lg font-bold text-foreground mb-2 leading-tight">{d.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">{d.shortPitch}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {d.missions.length} missões · {d.missions.reduce((s, m) => s + m.reward, 0)} IFT
                      </span>
                      <span className={`inline-flex items-center gap-1 ${a.text} font-heading font-semibold group-hover:gap-2 transition-all`}>
                        Iniciar <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Note */}
          <div className="mt-12 glass-card rounded-2xl p-6 border border-foreground/10 flex items-start gap-4">
            <Sparkles className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Privacy-first.</strong> Suas missões concluídas e IFT Coins ficam apenas no seu
              dispositivo (localStorage). Nenhum dado individual é enviado ao gestor — agregações futuras só ocorrerão com{" "}
              <span className="text-foreground font-semibold">k ≥ 7</span> respondentes.
            </p>
          </div>
        </div>
      </main>
      <InstitutionalFooter />
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent: "gold" | "cyan" | "magenta";
  icon?: React.ReactNode;
}) {
  const a = accentClasses[accent];
  return (
    <div className={`glass-card rounded-xl p-4 border border-foreground/10 ring-1 ${a.ring}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className={a.text}>{icon}</span>}
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-heading">{label}</p>
      </div>
      <p className={`font-display text-2xl font-bold ${a.text}`}>{value}</p>
    </div>
  );
}
