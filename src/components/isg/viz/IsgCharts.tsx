/**
 * Camada de VISUALIZAÇÃO de dados do piloto ISG.
 *
 * REGRA: nada aqui calcula, arredonda ou reinterpreta escore. Todos os
 * componentes recebem números já produzidos pelo motor canônico e apenas os
 * apresentam. Cores vêm exclusivamente de tokens semânticos do tema `.isg-theme`.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

/* ─────────────────────────── contagem animada ─────────────────────────── */

export function useCountUp(target: number, decimals = 1, duration = 1100) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? target : 0);

  useEffect(() => {
    if (reduce) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic — desacelera no fim, leitura confortável do número
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduce]);

  return value.toFixed(decimals);
}

/** Revela o bloco quando ele entra na viewport (uma única vez). */
export function IsgReveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? undefined : { opacity: 0, y: 18 }}
      animate={reduce ? undefined : inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ───────────────────────────── medidor radial ───────────────────────────── */

interface GaugeProps {
  /** Valor observado. */
  value: number;
  /** Máximo da escala apresentada. */
  max: number;
  label: string;
  caption?: string;
  decimals?: number;
  size?: number;
}

/**
 * Medidor radial de 270° para o resultado global.
 * Sem faixas qualitativas: o instrumento é descritivo, não classificatório.
 */
export function IsgScoreGauge({
  value,
  max,
  label,
  caption,
  decimals = 1,
  size = 232,
}: GaugeProps) {
  const reduce = useReducedMotion();
  const shown = useCountUp(value, decimals);
  const stroke = 14;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const sweep = 270;
  const circumference = 2 * Math.PI * r;
  const arcLen = (sweep / 360) * circumference;
  const ratio = Math.max(0, Math.min(1, value / max));

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`${label}: ${value.toFixed(decimals)} de ${max}`}
          className="-rotate-[225deg]"
        >
          <defs>
            <linearGradient id="isg-gauge-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(var(--accent))" />
              <stop offset="100%" stopColor="hsl(var(--primary))" />
            </linearGradient>
          </defs>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLen} ${circumference}`}
          />
          <motion.circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="url(#isg-gauge-grad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLen} ${circumference}`}
            initial={reduce ? undefined : { strokeDashoffset: arcLen }}
            animate={{ strokeDashoffset: arcLen * (1 - ratio) }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-5xl font-semibold tabular-nums text-foreground">
            {shown}
          </span>
          <span className="mt-1 text-xs text-muted-foreground">de {max}</span>
        </div>
      </div>
      <p className="mt-3 text-center text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      {caption && (
        <p className="mt-1 max-w-xs text-center text-xs leading-relaxed text-muted-foreground">
          {caption}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────── barra animada 0–4 ─────────────────────────── */

export function IsgMeterRow({
  label,
  value,
  max,
  hint,
  delay = 0,
  decimals = 2,
}: {
  label: string;
  value: number;
  max: number;
  hint?: string;
  delay?: number;
  decimals?: number;
}) {
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-foreground">{label}</span>
        <span className="text-sm font-medium tabular-nums text-foreground">
          {value.toFixed(decimals)}
          <span className="ml-1 text-xs font-normal text-muted-foreground">/ {max}</span>
        </span>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`${label}: ${value.toFixed(decimals)} de ${max}`}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
          initial={reduce ? undefined : { width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      {hint && <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ───────────────────────── radar dos 9 domínios ───────────────────────── */

export interface RadarDatum {
  label: string;
  value: number;
}

/** Radar dos domínios FIB na escala 0–4 (Furtado, 2020). */
export function IsgDomainRadar({
  data,
  height = 330,
  ariaLabel = "Radar dos domínios FIB na escala 0 a 4",
}: {
  data: RadarDatum[];
  height?: number;
  ariaLabel?: string;
}) {
  const chartData = useMemo(
    () => data.map((d) => ({ ...d, value: Number(d.value.toFixed(2)) })),
    [data],
  );

  return (
    <figure className="m-0" role="img" aria-label={ariaLabel}>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} outerRadius="72%">
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="label"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            />
            <PolarRadiusAxis
              domain={[0, 4]}
              tickCount={5}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              axisLine={false}
            />
            <Radar
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.22}
              strokeWidth={2}
              isAnimationActive
              animationDuration={1100}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

/* ───────────────────── distribuição Likert empilhada ───────────────────── */

/** Tons sequenciais de uma única matiz — evita leitura de “bom/ruim”. */
export const LIKERT_TONES = [
  "hsl(var(--primary) / 0.18)",
  "hsl(var(--primary) / 0.36)",
  "hsl(var(--primary) / 0.54)",
  "hsl(var(--primary) / 0.74)",
  "hsl(var(--primary))",
] as const;

export function IsgLikertStack({
  percentages,
  labels,
  counts,
  height = 10,
}: {
  percentages: number[];
  labels: readonly string[];
  counts?: number[];
  height?: number;
}) {
  const reduce = useReducedMotion();
  const describe = labels
    .map((l, i) => `${l}: ${percentages[i] ?? 0}%${counts ? ` (${counts[i] ?? 0})` : ""}`)
    .join(", ");
  return (
    <div
      className="flex w-full overflow-hidden rounded-full bg-muted"
      style={{ height }}
      role="img"
      title={describe}
      aria-label={describe}
    >

      {percentages.map((p, i) => (
        <motion.span
          key={i}
          className="h-full first:rounded-l-full last:rounded-r-full"
          style={{ background: LIKERT_TONES[i] }}
          initial={reduce ? undefined : { width: 0 }}
          whileInView={{ width: `${p}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: i * 0.05, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export function IsgLikertLegend({ labels }: { labels: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
      {labels.map((l, i) => (
        <li key={l} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: LIKERT_TONES[i] }}
          />
          {l}
        </li>
      ))}
    </ul>
  );
}
