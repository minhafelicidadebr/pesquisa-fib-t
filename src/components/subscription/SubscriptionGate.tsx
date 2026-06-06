import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { getMyCompany } from "@/lib/companies";

export type PlanTier = "free" | "pro" | "enterprise";
const RANK: Record<PlanTier, number> = { free: 0, pro: 1, enterprise: 2 };

interface Props {
  required: PlanTier;
  feature: string;
  children: ReactNode;
}

/** Blocks children if the active company plan rank is below `required`. */
export function SubscriptionGate({ required, feature, children }: Props) {
  const [plan, setPlan] = useState<PlanTier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getMyCompany()
      .then((res) => {
        if (!mounted) return;
        setPlan(((res?.company?.plan ?? "free") as PlanTier));
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[40vh] grid place-items-center">
        <div className="w-6 h-6 rounded-full border-2 border-brand-gold/40 border-t-brand-gold animate-spin" />
      </div>
    );
  }

  if (plan && RANK[plan] >= RANK[required]) return <>{children}</>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="glass-card-strong rounded-3xl p-8 sm:p-10 text-center border border-brand-gold/20">
        <div className="w-14 h-14 rounded-2xl bg-brand-gold/15 text-brand-gold grid place-items-center mx-auto mb-5">
          <Lock className="w-6 h-6" />
        </div>
        <p className="text-[11px] uppercase tracking-widest text-brand-gold font-heading mb-2">
          Plano {required === "pro" ? "Pro" : "Enterprise"} requerido
        </p>
        <h2 className="font-display text-2xl sm:text-3xl text-foreground mb-3">
          {feature} está bloqueado neste plano
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Faça upgrade para desbloquear esta capacidade e ampliar o ecossistema FIB · COP · NR-1
          na sua organização.
        </p>
        <Link
          to="/planos"
          className="inline-flex items-center gap-2 gradient-gold text-primary-foreground font-heading font-bold text-sm px-5 py-3 rounded-xl glow-gold hover:opacity-90 transition-opacity"
        >
          <Sparkles className="w-4 h-4" />
          Ver planos
        </Link>
      </div>
    </div>
  );
}
