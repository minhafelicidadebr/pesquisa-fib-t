import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Network } from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { InstitutionalFooter } from "@/components/deck/InstitutionalFooter";
import { DRIVERS, PILLAR_LABEL, type Driver } from "@/data/academy";
import { useIftCoins } from "@/hooks/useIftCoins";

const accentHsl: Record<Driver["accent"], string> = {
  gold: "hsl(var(--brand-gold))",
  cyan: "hsl(var(--brand-cyan))",
  magenta: "hsl(var(--brand-magenta))",
};

const SIZE = 720;
const CENTER = SIZE / 2;
const RADIUS = 270;

export default function AcademyConstelacao() {
  const { completedMissions } = useIftCoins();
  const [hovered, setHovered] = useState<string | null>(null);

  const nodes = useMemo(() => {
    return DRIVERS.map((d, i) => {
      const angle = (i / DRIVERS.length) * Math.PI * 2 - Math.PI / 2;
      const x = CENTER + Math.cos(angle) * RADIUS;
      const y = CENTER + Math.sin(angle) * RADIUS;
      const completedHere = d.missions.filter((m) => completedMissions.includes(m.id)).length;
      const progress = completedHere / d.missions.length;
      return { driver: d, x, y, progress, completedHere };
    });
  }, [completedMissions]);

  const links = useMemo(() => {
    const out: { from: string; to: string; fx: number; fy: number; tx: number; ty: number; color: string }[] = [];
    nodes.forEach((n) => {
      n.driver.resonates.forEach((slug) => {
        const target = nodes.find((m) => m.driver.slug === slug);
        if (!target) return;
        // dedupe undirected pair
        if (out.find((l) => (l.from === target.driver.slug && l.to === n.driver.slug))) return;
        out.push({
          from: n.driver.slug,
          to: target.driver.slug,
          fx: n.x,
          fy: n.y,
          tx: target.x,
          ty: target.y,
          color: accentHsl[n.driver.accent],
        });
      });
    });
    return out;
  }, [nodes]);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Link
            to="/academy"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Academy
          </Link>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs uppercase tracking-[0.18em] font-heading mb-4">
              <Network className="w-3.5 h-3.5" /> Constelação dos drivers
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-[1.05] mb-3">
              Florescimento <span className="text-gradient-cyan">como sistema</span>
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Cada driver ressoa com outros — fortalecer um irradia para os vizinhos. O anel preenchido mostra sua progressão real.
            </p>
          </motion.div>

          <div className="glass-card-strong rounded-3xl p-4 sm:p-6 border border-foreground/10">
            <div className="aspect-square w-full max-w-[720px] mx-auto">
              <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full" role="img" aria-label="Constelação dos 9 drivers de bem-estar">
                {/* Background rings */}
                <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="hsl(var(--foreground) / 0.05)" strokeDasharray="4 6" />
                <circle cx={CENTER} cy={CENTER} r={RADIUS * 0.6} fill="none" stroke="hsl(var(--foreground) / 0.04)" />
                <circle cx={CENTER} cy={CENTER} r={RADIUS * 0.3} fill="none" stroke="hsl(var(--foreground) / 0.03)" />

                {/* Links */}
                {links.map((l, i) => {
                  const isActive = hovered && (hovered === l.from || hovered === l.to);
                  return (
                    <line
                      key={i}
                      x1={l.fx}
                      y1={l.fy}
                      x2={l.tx}
                      y2={l.ty}
                      stroke={l.color}
                      strokeOpacity={isActive ? 0.7 : 0.18}
                      strokeWidth={isActive ? 2 : 1}
                      style={{ transition: "all 0.3s" }}
                    />
                  );
                })}

                {/* Center label */}
                <text x={CENTER} y={CENTER - 8} textAnchor="middle" className="fill-foreground" fontSize="20" fontFamily="Fraunces, serif" fontWeight="700">
                  Florescer
                </text>
                <text x={CENTER} y={CENTER + 16} textAnchor="middle" className="fill-muted-foreground" fontSize="11" fontFamily="Manrope, sans-serif" letterSpacing="2">
                  PERMA+V · VIA
                </text>

                {/* Nodes */}
                {nodes.map((n) => {
                  const color = accentHsl[n.driver.accent];
                  const isHovered = hovered === n.driver.slug;
                  const r = isHovered ? 38 : 32;
                  const ringR = r + 6;
                  const ringCirc = 2 * Math.PI * ringR;
                  return (
                    <g
                      key={n.driver.slug}
                      onMouseEnter={() => setHovered(n.driver.slug)}
                      onMouseLeave={() => setHovered(null)}
                      style={{ cursor: "pointer", transition: "transform 0.3s" }}
                    >
                      <a href={`/academy/${n.driver.slug}`} aria-label={n.driver.title}>
                        {/* Progress ring */}
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r={ringR}
                          fill="none"
                          stroke="hsl(var(--foreground) / 0.08)"
                          strokeWidth={3}
                        />
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r={ringR}
                          fill="none"
                          stroke={color}
                          strokeWidth={3}
                          strokeDasharray={`${ringCirc * n.progress} ${ringCirc}`}
                          strokeLinecap="round"
                          transform={`rotate(-90 ${n.x} ${n.y})`}
                          style={{ transition: "stroke-dasharray 0.6s" }}
                        />
                        {/* Node body */}
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r={r}
                          fill={color}
                          fillOpacity={0.12}
                          stroke={color}
                          strokeOpacity={isHovered ? 1 : 0.6}
                          strokeWidth={1.5}
                          style={{ transition: "all 0.3s" }}
                        />
                        <text
                          x={n.x}
                          y={n.y + 4}
                          textAnchor="middle"
                          className="fill-foreground select-none"
                          fontSize="13"
                          fontFamily="Fraunces, serif"
                          fontWeight="700"
                        >
                          {n.driver.pillar}
                        </text>
                        {/* Label outside */}
                        <text
                          x={n.x}
                          y={n.y > CENTER ? n.y + ringR + 22 : n.y - ringR - 12}
                          textAnchor="middle"
                          className="fill-foreground select-none"
                          fontSize="13"
                          fontFamily="Manrope, sans-serif"
                          fontWeight="600"
                        >
                          {n.driver.title}
                        </text>
                      </a>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Legend / details */}
            <div className="mt-6 grid sm:grid-cols-3 gap-3 text-xs">
              <LegendItem color={accentHsl.gold} label="Pilares emocionais (P · M · V)" />
              <LegendItem color={accentHsl.cyan} label="Pilares cognitivos (E · A)" />
              <LegendItem color={accentHsl.magenta} label="Pilares relacionais (R · Coragem)" />
            </div>
          </div>

          {/* Hovered detail */}
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 glass-card rounded-2xl p-5 border border-foreground/10"
            >
              {(() => {
                const d = DRIVERS.find((x) => x.slug === hovered)!;
                return (
                  <>
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-heading mb-1">
                      {PILLAR_LABEL[d.pillar]} · {d.perma}
                    </p>
                    <p className="font-heading text-lg font-bold text-foreground mb-1">{d.title}</p>
                    <p className="text-sm text-muted-foreground">{d.shortPitch}</p>
                  </>
                );
              })()}
            </motion.div>
          )}
        </div>
      </main>
      <InstitutionalFooter />
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-full" style={{ background: color }} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
