import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Stethoscope, Activity, BookOpen, FileBarChart,
  ShieldAlert, Layers, Sparkles, Crown, Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RailItem {
  to: string;
  label: string;
  icon: React.ElementType;
  verb?: "mensurar" | "transformar" | "educar" | "governar";
  accent: "gold" | "cyan" | "magenta";
}

const RAIL: RailItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, accent: "cyan" },
  { to: "/jornada", label: "Minha Jornada", icon: Compass, accent: "gold" },
  { to: "/diagnostico", label: "Mensurar · FIB-T", icon: Stethoscope, verb: "mensurar", accent: "gold" },
  { to: "/nr1", label: "Mensurar · NR-1", icon: ShieldAlert, verb: "mensurar", accent: "magenta" },
  { to: "/intervencoes", label: "Transformar", icon: Activity, verb: "transformar", accent: "magenta" },
  { to: "/academy", label: "Educar · Academy", icon: BookOpen, verb: "educar", accent: "gold" },
  { to: "/relatorios", label: "Governar · Relatórios", icon: FileBarChart, verb: "governar", accent: "cyan" },
  { to: "/matriz", label: "Matriz NR-1", icon: Layers, accent: "cyan" },
  { to: "/planos", label: "Planos", icon: Crown, accent: "gold" },
];

// Rotas em que o trilho SaaS é exibido
const APP_ROUTE_PREFIXES = [
  "/dashboard", "/jornada", "/diagnostico", "/nr1",
  "/intervencoes", "/academy", "/relatorios", "/matriz", "/planos",
  "/empresa", "/perfil",
];

const ACCENT: Record<RailItem["accent"], string> = {
  gold: "text-brand-gold",
  cyan: "text-brand-cyan",
  magenta: "text-brand-magenta",
};

export function AppSidebarRail() {
  const { pathname } = useLocation();
  const visible = APP_ROUTE_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex fixed left-3 top-20 bottom-4 z-40 w-14 flex-col items-center py-3 gap-1 rounded-2xl backdrop-blur-xl bg-background/60 border border-foreground/10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)]"
          aria-label="Workspace SaaS"
        >
          <div className="w-8 h-8 rounded-lg grid place-items-center bg-gradient-to-br from-brand-gold/20 via-brand-cyan/15 to-brand-magenta/20 mb-2">
            <Sparkles className="w-4 h-4 text-brand-gold" />
          </div>
          <div className="w-8 h-px bg-foreground/10 mb-1" />
          {RAIL.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group relative w-10 h-10 rounded-xl grid place-items-center transition-all",
                  active
                    ? "bg-foreground/10"
                    : "hover:bg-foreground/5"
                )}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={cn(
                  "w-[18px] h-[18px] transition-colors",
                  active ? ACCENT[item.accent] : "text-muted-foreground group-hover:text-foreground"
                )} />
                {active && (
                  <motion.span
                    layoutId="rail-active"
                    className={cn(
                      "absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full",
                      item.accent === "gold" && "bg-brand-gold",
                      item.accent === "cyan" && "bg-brand-cyan",
                      item.accent === "magenta" && "bg-brand-magenta",
                    )}
                  />
                )}
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap px-2.5 py-1.5 rounded-lg bg-foreground text-background text-[11px] font-heading font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
