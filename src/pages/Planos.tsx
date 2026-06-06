import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Sparkles, Crown, Rocket, Loader2 } from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { supabase } from "@/integrations/supabase/client";
import { getMyCompany } from "@/lib/companies";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PlanTier = "free" | "pro" | "enterprise";

interface PlanDef {
  id: PlanTier;
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  icon: typeof Sparkles;
  accent: "cyan" | "gold" | "magenta";
  features: string[];
  highlight?: boolean;
}

const PLANS: PlanDef[] = [
  {
    id: "free",
    name: "Essencial",
    price: "R$ 0",
    cadence: "para sempre",
    tagline: "Comece a escutar sua organização sem fricção.",
    icon: Sparkles,
    accent: "cyan",
    features: [
      "Até 1 diagnóstico COPSOQ II curto/mês",
      "Dashboard pessoal (FIB-T)",
      "Academy: 1 trilha demonstrativa",
      "Privacidade by design (k ≥ 7)",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 1.890",
    cadence: "/mês por unidade",
    tagline: "Mensure, transforme e governe com inteligência.",
    icon: Rocket,
    accent: "gold",
    highlight: true,
    features: [
      "COPSOQ II longo + NR-1 ilimitado",
      "Catálogo Oxford com ILI score",
      "Academy completa + IFT Coin",
      "Relatórios PGR/DRPS em PDF",
      "Chatbots FIBia + NORA",
      "Suporte humano em até 24h",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Sob consulta",
    cadence: "multi-unidade",
    tagline: "Para conglomerados, holdings e setor público.",
    icon: Crown,
    accent: "magenta",
    features: [
      "Tudo do Pro, multi-empresa",
      "PDF Intelligence (ingestão de docs)",
      "API & SSO corporativo",
      "Consultoria científica dedicada",
      "SLA 99,9% + DPO compartilhado",
      "Onboarding white-glove",
    ],
  },
];

const accentMap = {
  cyan: { border: "border-brand-cyan/30", text: "text-brand-cyan", bg: "bg-brand-cyan/10" },
  gold: { border: "border-brand-gold/50", text: "text-brand-gold", bg: "bg-brand-gold/10" },
  magenta: { border: "border-brand-magenta/30", text: "text-brand-magenta", bg: "bg-brand-magenta/10" },
} as const;

export default function Planos() {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<PlanTier>("free");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<PlanTier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyCompany()
      .then((res) => {
        if (res?.company) {
          setCompanyId(res.company.id);
          // @ts-expect-error plan exists post-migration
          setCurrentPlan(((res.company.plan ?? "free") as PlanTier));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSelect(plan: PlanTier) {
    if (!user) {
      toast.error("Entre para escolher um plano.");
      return;
    }
    if (!companyId) {
      toast.error("Vincule-se a uma empresa antes de assinar.", {
        description: "Conclua o onboarding ou peça o código de convite ao SST.",
      });
      return;
    }
    if (plan === "enterprise") {
      window.location.href = "mailto:contato@felicidadeparatodos.org?subject=Plano%20Enterprise%20FIB";
      return;
    }
    setUpdating(plan);
    // Mock activation: real Stripe gateway entra na próxima sprint.
    // @ts-expect-error plan column exists post-migration
    const { error } = await supabase.from("companies").update({ plan }).eq("id", companyId);
    setUpdating(null);
    if (error) {
      toast.error("Não foi possível atualizar o plano.", { description: error.message });
      return;
    }
    setCurrentPlan(plan);
    toast.success(`Plano ${plan === "free" ? "Essencial" : "Pro"} ativado.`, {
      description: "Em produção, o checkout Stripe substituirá este mock.",
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNavbar />
      <main className="pt-28 pb-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <p className="text-[11px] uppercase tracking-widest text-brand-gold font-heading mb-3">
            Planos & Assinatura
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-4 leading-tight">
            Escolha o plano que <span className="text-gradient-gold">acompanha sua jornada</span>
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Ciência, gamificação e compliance NR-1 — em um único ecossistema. Mude de plano a
            qualquer momento; seus dados e progresso permanecem.
          </p>
          {!loading && companyId && (
            <p className="mt-4 text-xs text-muted-foreground">
              Plano atual:{" "}
              <span className="text-foreground font-semibold uppercase tracking-wider">
                {currentPlan}
              </span>
            </p>
          )}
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => {
            const a = accentMap[plan.accent];
            const Icon = plan.icon;
            const isCurrent = currentPlan === plan.id;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "relative glass-card rounded-3xl p-7 flex flex-col border transition-all",
                  a.border,
                  plan.highlight && "md:-translate-y-3 shadow-[0_20px_60px_-20px_hsl(var(--brand-gold)/0.4)]"
                )}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-gold text-primary-foreground text-[10px] font-bold uppercase tracking-widest">
                    Recomendado
                  </span>
                )}
                <div className={cn("w-12 h-12 rounded-2xl grid place-items-center mb-4", a.bg, a.text)}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-2xl text-foreground mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-5 min-h-[2.5rem]">{plan.tagline}</p>
                <div className="mb-6">
                  <span className="font-display text-4xl text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">{plan.cadence}</span>
                </div>
                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/90">
                      <Check className={cn("w-4 h-4 mt-0.5 shrink-0", a.text)} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSelect(plan.id)}
                  disabled={isCurrent || updating !== null}
                  className={cn(
                    "w-full inline-flex items-center justify-center gap-2 font-heading font-bold text-sm px-4 py-3 rounded-xl transition-all",
                    isCurrent
                      ? "bg-foreground/10 text-muted-foreground cursor-default"
                      : plan.highlight
                      ? "gradient-gold text-primary-foreground glow-gold hover:opacity-90"
                      : "border border-foreground/15 text-foreground hover:bg-foreground/5",
                    updating === plan.id && "opacity-70"
                  )}
                >
                  {updating === plan.id && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isCurrent
                    ? "Plano atual"
                    : plan.id === "enterprise"
                    ? "Falar com vendas"
                    : `Ativar ${plan.name}`}
                </button>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-14 text-center text-xs text-muted-foreground max-w-xl mx-auto">
          Pagamentos processados via Stripe em produção. Hoje, a ativação é via mock-flag para
          desenvolvimento interno. Cancele a qualquer momento — sem retenção, sem multa.{" "}
          <Link to="/empresa/configurar" className="text-brand-gold hover:underline">
            Configurar empresa
          </Link>
          .
        </div>
      </main>
    </div>
  );
}
