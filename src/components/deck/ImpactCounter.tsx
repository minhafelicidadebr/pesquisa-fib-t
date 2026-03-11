import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface CounterProps {
  value: string;
  label: string;
  badge?: string;
  delay?: number;
}

export function ImpactCounter({ value, label, badge, delay = 0 }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
  const prefix = value.startsWith("+") ? "+" : "";
  const suffix = value.includes(".") ? "." + value.split(".")[1]?.replace(/[^0-9]/g, "") : "";

  useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => {
      const duration = 2000;
      const steps = 60;
      const increment = numericValue / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setCount(numericValue);
          clearInterval(interval);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [isInView, numericValue, delay]);

  const formatNumber = (n: number) => {
    if (suffix) {
      const str = n.toString();
      if (str.length > 3) {
        return str.slice(0, -3) + "." + str.slice(-3);
      }
      return str;
    }
    return n.toLocaleString("pt-BR");
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-xl p-5 text-center relative group hover:border-brand-gold/20 transition-colors duration-300"
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-gold text-primary-foreground text-xs font-heading font-bold px-3 py-1 rounded-full whitespace-nowrap">
          {badge}
        </span>
      )}
      <div className="tabular-nums-data font-display text-3xl md:text-4xl font-bold text-gradient-gold mb-2">
        {prefix}{formatNumber(count)}{suffix && !formatNumber(count).includes(".") ? "" : ""}
      </div>
      <div className="text-sm text-muted-foreground font-body leading-snug">
        {label}
      </div>
    </motion.div>
  );
}
