import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity, BookOpen, FileBarChart, Layers, LayoutDashboard, MessageCircle,
  Microscope, PresentationIcon, ShieldAlert, Sparkles, Stethoscope, Building2,
  Settings, FileText, Brain, Users, Target, GraduationCap, ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "gold" | "cyan" | "magenta" | "green";

interface HubItem {
  label: string;
  to: string;
  icon: React.ElementType;
  description: string;
  accent: Accent;
  badge?: string;
}

interface HubGroup {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  accent: Accent;
  items: HubItem[];
}

/**
 * Ecossistema & Dashboards — hub central inspirado em:
 * - plataforma-nr1: navegação por verbos (Mensurar/Governar/Educar/Transformar)
 * - game-da-felicidade: dashboard multinível com cards de funcionalidade ricos
 * Mantém a narrativa IFT: Ciência da Felicidade aplicada ao trabalho + NR-1.
 */
const GROUPS: HubGroup[] = [
  {
    id: "mensurar",
    title: "Diagnosticar & Mensurar",
    subtitle: "Escutar a organização e o indivíduo com instrumentos validados",
    icon: Stethoscope,
    accent: "gold",
    items: [
      { label: "Diagnóstico FIB-T", to: "/diagnostico", icon: Stethoscope, description: "Avaliação conversacional · 9 dimensões", accent: "gold" },
      { label: "FIBia (chat)", to: "/fibia", icon: MessageCircle, description: "IA mentora · trilhas personalizadas", accent: "gold", badge: "IA" },
      { label: "NORA · NR-1", to: "/nr1/avaliacao", icon: ShieldAlert, description: "COPSOQ II · 41 itens · 12 min", accent: "magenta", badge: "IA" },
      { label: "Hub NR-1", to: "/nr1", icon: ShieldAlert, description: "Visão geral do programa NR-1", accent: "magenta" },
    ],
  },
  {
    id: "governar",
    title: "Governar & Decidir",
    subtitle: "Painéis, matrizes e relatórios para a tomada de decisão",
    icon: Layers,
    accent: "cyan",
    items: [
      { label: "Matriz integrativa", to: "/matriz", icon: Layers, description: "COPSOQ × Playbook 2.0 × NR-1", accent: "cyan" },
      { label: "Relatórios DRPS", to: "/relatorios", icon: FileBarChart, description: "PDF premium · pronto p/ PGR", accent: "gold" },
      { label: "Empresa & convites", to: "/empresa/configurar", icon: Building2, description: "Configurar SaaS · gestor SST", accent: "cyan", badge: "SaaS" },
      { label: "Perfil & dados", to: "/perfil", icon: Settings, description: "Identidade · LGPD · preferências", accent: "cyan" },
    ],
  },
  {
    id: "educar",
    title: "Educar & Transformar",
    subtitle: "Trilhas gamificadas e intervenções baseadas em evidência",
    icon: GraduationCap,
    accent: "magenta",
    items: [
      { label: "Academy IFT", to: "/academy", icon: BookOpen, description: "Trilhas + IFT Coin · gamificação", accent: "gold" },
      { label: "Intervenções", to: "/intervencoes", icon: Activity, description: "Práticas validadas · ILI score", accent: "magenta" },
      { label: "Apresentações", to: "/apresentacoes", icon: PresentationIcon, description: "Decks setoriais imersivos", accent: "gold" },
      { label: "FIBia Demo", to: "/fibia-demo", icon: Sparkles, description: "Tour guiado · 5 min", accent: "cyan" },
    ],
  },
  {
    id: "evidencias",
    title: "Ciência & Evidências",
    subtitle: "Fundamento científico aberto · 3.000+ artigos curados",
    icon: Microscope,
    accent: "cyan",
    items: [
      { label: "Banco de Evidências", to: "/evidencias", icon: Microscope, description: "3.000+ artigos · busca avançada", accent: "cyan" },
      { label: "Evidência Científica", to: "/evidencia-cientifica", icon: FileText, description: "COPSOQ × Oxford × NR-1", accent: "cyan" },
      { label: "Painel detalhado", to: "/dashboard", icon: LayoutDashboard, description: "Voltar à visão geral", accent: "gold" },
    ],
  },
];

const accentChip: Record<Accent, string> = {
  gold: "bg-brand-gold/15 text-brand-gold border-brand-gold/30",
  cyan: "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30",
  magenta: "bg-brand-magenta/15 text-brand-magenta border-brand-magenta/30",
  green: "bg-brand-green/15 text-brand-green border-brand-green/30",
};

const accentBorder: Record<Accent, string> = {
  gold: "hover:border-brand-gold/50 hover:bg-brand-gold/[0.04]",
  cyan: "hover:border-brand-cyan/50 hover:bg-brand-cyan/[0.04]",
  magenta: "hover:border-brand-magenta/50 hover:bg-brand-magenta/[0.04]",
  green: "hover:border-brand-green/50 hover:bg-brand-green/[0.04]",
};

export function EcosystemHub({ companyName }: { companyName?: string | null }) {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-brand-gold/30 bg-gradient-to-br from-brand-gold/[0.08] via-brand-cyan/[0.04] to-brand-magenta/[0.06] p-6 md:p-8 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/5 border border-foreground/10 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-foreground/70">
                Ecossistema & Dashboards
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight text-foreground">
              Tudo do Programa FIB <span className="text-gradient-gold">em um único lugar</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-2">
              {companyName
                ? <>Painel SaaS de <strong className="text-foreground">{companyName}</strong> · diagnóstico, governança, educação e ciência integrados em uma jornada única.</>
                : <>Diagnóstico, governança, educação e ciência integrados em uma única jornada premium — pronto para personalização por empresa.</>}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {GROUPS.map((g) => (
              <a
                key={g.id}
                href={`#hub-${g.id}`}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-heading font-bold uppercase tracking-wider border transition-all",
                  accentChip[g.accent]
                )}
              >
                <g.icon className="w-3 h-3" /> {g.title.split(" ")[0]}
              </a>
            ))}
          </div>
        </div>
      </div>

      {GROUPS.map((group, gi) => {
        const GroupIcon = group.icon;
        return (
          <motion.section
            key={group.id}
            id={`hub-${group.id}`}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: gi * 0.05 }}
            className="space-y-4 scroll-mt-24"
          >
            <header className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", accentChip[group.accent])}>
                <GroupIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
                  {group.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">{group.subtitle}</p>
              </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to + item.label}
                    to={item.to}
                    className={cn(
                      "group relative rounded-2xl p-4 md:p-5 border border-foreground/10 bg-card/40 backdrop-blur-sm transition-all duration-300",
                      accentBorder[item.accent]
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110", accentChip[item.accent])}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {item.badge && (
                        <span className={cn("text-[9px] font-heading font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border", accentChip[item.accent])}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="font-heading font-bold text-sm text-foreground mb-1 flex items-center gap-1">
                      {item.label}
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all" />
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{item.description}</p>
                  </Link>
                );
              })}
            </div>
          </motion.section>
        );
      })}

      <div className="rounded-2xl border border-dashed border-foreground/15 p-5 text-xs text-muted-foreground flex items-start gap-3">
        <Brain className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
        <p>
          <strong className="text-foreground">Personalização SaaS:</strong> este hub adapta-se à empresa
          contratante — exibe apenas módulos liberados no plano, métricas reais do COPSOQ II coletado e
          recomendações cruzando NR-1 × Wellbeing Playbook 2.0 (Oxford).
        </p>
      </div>
    </div>
  );
}
