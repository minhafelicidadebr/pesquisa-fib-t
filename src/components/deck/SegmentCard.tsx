import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SegmentCardProps {
  segment: string;
  headline: string;
  tags: string[];
  route: string;
  ctaLabel: string;
  ctaSecondaryLabel: string;
  colorClass: "gold" | "cyan" | "magenta";
  onOpenForm: () => void;
  index: number;
}

const colorMap = {
  gold: {
    glow: "glow-gold",
    gradient: "text-gradient-gold",
    border: "hover:border-brand-gold/30",
    badge: "bg-brand-gold/15 text-brand-gold",
    btn: "gradient-gold text-primary-foreground",
  },
  cyan: {
    glow: "glow-cyan",
    gradient: "text-gradient-cyan",
    border: "hover:border-brand-cyan/30",
    badge: "bg-brand-cyan/15 text-brand-cyan",
    btn: "gradient-cyan text-secondary-foreground",
  },
  magenta: {
    glow: "glow-magenta",
    gradient: "text-gradient-magenta",
    border: "hover:border-brand-magenta/30",
    badge: "bg-brand-magenta/15 text-brand-magenta",
    btn: "gradient-magenta text-foreground",
  },
};

export function SegmentCard({
  segment,
  headline,
  tags,
  route,
  ctaLabel,
  ctaSecondaryLabel,
  colorClass,
  onOpenForm,
  index,
}: SegmentCardProps) {
  const navigate = useNavigate();
  const colors = colorMap[colorClass];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-card rounded-2xl p-8 flex flex-col gap-5 group cursor-pointer transition-all duration-300 ${colors.border} hover:shadow-lg`}
      onClick={() => navigate(route)}
    >
      <h3 className={`font-heading text-2xl font-bold ${colors.gradient}`}>
        {segment}
      </h3>
      <p className="text-foreground/80 font-body text-base leading-relaxed flex-1">
        {headline}
      </p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`text-xs font-heading font-semibold px-3 py-1 rounded-full ${colors.badge}`}
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(route);
          }}
          className={`${colors.btn} font-heading font-bold text-sm px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]`}
        >
          {ctaLabel}
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenForm();
          }}
          className="border border-foreground/20 text-foreground/80 font-heading text-sm px-5 py-2.5 rounded-lg hover:bg-foreground/5 transition-colors"
        >
          {ctaSecondaryLabel}
        </button>
      </div>
    </motion.div>
  );
}
