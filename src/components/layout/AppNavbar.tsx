import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  BookOpen,
  ChevronDown,
  FileBarChart,
  Layers,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Microscope,
  PresentationIcon,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";
import { AuthMenu } from "@/components/auth/AuthMenu";
import { cn } from "@/lib/utils";
import hubData from "@/data/hub.json";

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  description?: string;
  accent?: "gold" | "cyan" | "magenta";
}

const PRIMARY_NAV: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, description: "Painel pessoal e organizacional", accent: "cyan" },
  { label: "Diagnóstico", to: "/diagnostico", icon: Stethoscope, description: "Avaliação FIB-T conversacional", accent: "gold" },
  { label: "NR-1", to: "/nr1", icon: ShieldAlert, description: "COPSOQ II · Saúde mental no trabalho", accent: "magenta" },
  { label: "Matriz", to: "/matriz", icon: Layers, description: "COPSOQ × Playbook 2.0 × NR-1", accent: "cyan" },
  { label: "Relatórios", to: "/relatorios", icon: FileBarChart, description: "DRPS PDF · ESG · NR-1", accent: "gold" },
];

const SECONDARY_NAV: NavItem[] = [
  { label: "FIBia", to: "/fibia", icon: MessageCircle, description: "Chatbot diagnóstico FIB-T", accent: "gold" },
  { label: "NORA (NR-1)", to: "/nr1/avaliacao", icon: ShieldAlert, description: "Chatbot COPSOQ II", accent: "magenta" },
  { label: "Apresentações", to: "/apresentacoes", icon: PresentationIcon, description: "Decks setoriais", accent: "gold" },
  { label: "Academy", to: "/academy", icon: BookOpen, description: "Trilhas gamificadas IFT Coin", accent: "gold" },
  { label: "Intervenções", to: "/intervencoes", icon: Activity, description: "Práticas baseadas em evidência", accent: "magenta" },
  { label: "Evidências (banco)", to: "/evidencias", icon: Microscope, description: "3.000+ artigos", accent: "cyan" },
  { label: "Evidência Científica", to: "/evidencia-cientifica", icon: Microscope, description: "Página premium COPSOQ × Oxford × NR-1", accent: "cyan" },
];

const accentRing = {
  gold: "group-hover:text-brand-gold",
  cyan: "group-hover:text-brand-cyan",
  magenta: "group-hover:text-brand-magenta",
} as const;

export function AppNavbar({ onCtaClick }: { onCtaClick?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ecosystemOpen, setEcosystemOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setEcosystemOpen(false);
  }, [location.pathname]);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          scrolled
            ? "backdrop-blur-xl bg-background/70 border-b border-foreground/10 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.4)]"
            : "bg-transparent"
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group" aria-label="Início">
            <img
              src={hubData.brand.logos.icon}
              alt=""
              className="w-8 h-8 transition-transform duration-500 group-hover:rotate-12"
            />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-display text-sm font-bold text-foreground">
                Felicidade <span className="text-gradient-gold">para Todos</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-heading">
                Programa FIB
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {PRIMARY_NAV.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "group relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-heading font-medium transition-all duration-300",
                    isActive
                      ? "text-foreground bg-foreground/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  )}
                >
                  <Icon className={cn("w-4 h-4 transition-colors", accentRing[item.accent ?? "gold"])} />
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-transparent via-brand-gold to-transparent"
                    />
                  )}
                </Link>
              );
            })}

            {/* Ecossistema & Dashboards — atalho premium para o hub central */}
            <div
              className="relative"
              onMouseEnter={() => setEcosystemOpen(true)}
              onMouseLeave={() => setEcosystemOpen(false)}
            >
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-heading font-bold text-foreground bg-gradient-to-r from-brand-gold/10 via-brand-cyan/10 to-brand-magenta/10 border border-brand-gold/30 hover:border-brand-gold/60 transition-all"
                aria-haspopup="true"
                aria-expanded={ecosystemOpen}
              >
                <Sparkles className="w-4 h-4 text-brand-gold" />
                Ecossistema & Dashboards
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", ecosystemOpen && "rotate-180")} />
              </Link>
              <AnimatePresence>
                {ecosystemOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 top-full pt-2 w-80"
                  >
                    <div className="glass-card-strong rounded-2xl p-2 shadow-2xl">
                      <Link
                        to="/dashboard"
                        className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-brand-gold/10 to-brand-cyan/5 border border-brand-gold/20 mb-1"
                      >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-brand-gold/20 text-brand-gold shrink-0">
                          <LayoutDashboard className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-heading text-sm font-bold text-foreground">Abrir hub completo</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">Todas as funcionalidades em um só lugar</p>
                        </div>
                      </Link>
                      {SECONDARY_NAV.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-foreground/5 transition-colors group"
                          >
                            <div
                              className={cn(
                                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                item.accent === "gold" && "bg-brand-gold/15 text-brand-gold",
                                item.accent === "cyan" && "bg-brand-cyan/15 text-brand-cyan",
                                item.accent === "magenta" && "bg-brand-magenta/15 text-brand-magenta"
                              )}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-heading text-sm font-semibold text-foreground">{item.label}</p>
                              <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: auth + CTA */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:block">
              <AuthMenu />
            </div>
            <button
              onClick={onCtaClick}
              className="hidden md:inline-flex gradient-gold text-primary-foreground font-heading font-bold text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity glow-gold"
            >
              Agendar reunião
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 rounded-lg hover:bg-foreground/5 transition-colors"
              aria-label="Menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="absolute right-0 top-16 bottom-0 w-[85vw] max-w-sm bg-card border-l border-foreground/10 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 space-y-1">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-heading px-3 mb-2">
                  Plataforma
                </p>
                {PRIMARY_NAV.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl transition-colors",
                        isActive ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:bg-foreground/5"
                      )}
                    >
                      <Icon className="w-5 h-5 text-brand-gold" />
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-semibold text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </Link>
                  );
                })}

                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-heading px-3 mb-2 mt-6">
                  Ecossistema
                </p>
                {SECONDARY_NAV.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-foreground/5 transition-colors"
                    >
                      <Icon className="w-5 h-5 text-brand-cyan" />
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-semibold text-sm text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </Link>
                  );
                })}

                <div className="pt-6 space-y-3 border-t border-foreground/10 mt-4">
                  <AuthMenu />
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      onCtaClick?.();
                    }}
                    className="w-full gradient-gold text-primary-foreground font-heading font-bold text-sm px-4 py-3 rounded-xl"
                  >
                    Agendar reunião
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
