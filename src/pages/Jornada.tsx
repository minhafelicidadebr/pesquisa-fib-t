import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Coins,
  Compass,
  Flame,
  Heart,
  Lock,
  Sparkles,
  Stethoscope,
  Trophy,
  UserCircle2,
} from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { LeadFormModal } from "@/components/deck/LeadFormModal";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { getMyCompany } from "@/lib/companies";
import { listAssessments } from "@/lib/fibAssessments";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type StepStatus = "done" | "current" | "locked";

interface JourneyStep {
  id: string;
  title: string;
  subtitle: string;
  ift: number; // IFT Coin earned when complete
  icon: React.ElementType;
  accent: "gold" | "cyan" | "magenta";
  cta: { label: string; to: string };
  status: StepStatus;
}

const accentBg = {
  gold: "bg-brand-gold/15 text-brand-gold border-brand-gold/30",
  cyan: "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30",
  magenta: "bg-brand-magenta/15 text-brand-magenta border-brand-magenta/30",
} as const;

const accentGlow = {
  gold: "shadow-[0_0_40px_-12px_hsl(var(--brand-gold)/0.6)]",
  cyan: "shadow-[0_0_40px_-12px_hsl(var(--brand-cyan)/0.6)]",
  magenta: "shadow-[0_0_40px_-12px_hsl(var(--brand-magenta)/0.6)]",
} as const;

export default function Jornada() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [leadOpen, setLeadOpen] = useState(false);
  const [hasCompany, setHasCompany] = useState<boolean | null>(null);
  const [fibCount, setFibCount] = useState(0);
  const [lastFib, setLastFib] = useState<number | null>(null);
  const [nr1Count, setNr1Count] = useState(0);
  const [streak] = useState(1);

  useEffect(() => {
    if (!loading && !user) navigate("/auth?next=/jornada");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [company, fibs, nr1] = await Promise.all([
        getMyCompany(),
        listAssessments(),
        supabase.from("nr1_assessments").select("id, global_score").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setHasCompany(!!company);
      setFibCount(fibs.length);
      setLastFib(fibs[0]?.fib_score ?? null);
      setNr1Count(nr1.data?.length ?? 0);
    })();
  }, [user]);

  const profileComplete = !!(profile?.full_name && profile?.segment && profile.segment !== "nao_informado");

  const steps: JourneyStep[] = useMemo(() => {
    const raw: Array<Omit<JourneyStep, "status"> & { done: boolean }> = [
      {
        id: "perfil",
        title: "Quem sou eu",
        subtitle: "Complete seu perfil — nome, segmento e função. Base para personalizar sua jornada.",
        ift: 10,
        icon: UserCircle2,
        accent: "cyan",
        cta: { label: "Editar perfil", to: "/perfil" },
        done: profileComplete,
      },
      {
        id: "empresa",
        title: "Onde eu pertenço",
        subtitle: "Vincule-se à sua organização (ou crie a sua). Sem isso, suas respostas não viram inteligência coletiva.",
        ift: 15,
        icon: Compass,
        accent: "gold",
        cta: { label: "Vincular organização", to: "/onboarding" },
        done: hasCompany === true,
      },
      {
        id: "fib",
        title: "Como eu floresço",
        subtitle: "Diagnóstico FIB-T conversacional. 7 minutos para descobrir suas forças VIA e domínios PERMA+V.",
        ift: 40,
        icon: Stethoscope,
        accent: "gold",
        cta: { label: fibCount ? "Refazer FIB-T" : "Iniciar FIB-T", to: "/diagnostico" },
        done: fibCount > 0,
      },
      {
        id: "nr1",
        title: "Como meu trabalho me afeta",
        subtitle: "Avaliação COPSOQ II com a NORA — fatores psicossociais em pauta, dentro da NR-1.",
        ift: 40,
        icon: Heart,
        accent: "magenta",
        cta: { label: nr1Count ? "Refazer NR-1" : "Iniciar NR-1", to: "/nr1/avaliacao" },
        done: nr1Count > 0,
      },
      {
        id: "academy",
        title: "Como eu evoluo",
        subtitle: "Comece uma trilha Academy. Microaprendizagem de 5 minutos com IFT Coin.",
        ift: 25,
        icon: BookOpen,
        accent: "gold",
        cta: { label: "Explorar Academy", to: "/academy" },
        done: false,
      },
      {
        id: "praticar",
        title: "Como eu transformo",
        subtitle: "Escolha uma intervenção Oxford baseada em evidência e aplique no seu cotidiano.",
        ift: 30,
        icon: Activity,
        accent: "magenta",
        cta: { label: "Ver intervenções", to: "/intervencoes" },
        done: false,
      },
    ];

    // first non-done is "current", rest after it are "locked"
    let currentSet = false;
    return raw.map((s) => {
      if (s.done) return { ...s, status: "done" as StepStatus };
      if (!currentSet) {
        currentSet = true;
        return { ...s, status: "current" as StepStatus };
      }
      return { ...s, status: "locked" as StepStatus };
    });
  }, [profileComplete, hasCompany, fibCount, nr1Count]);

  const doneCount = steps.filter((s) => s.status === "done").length;
  const totalSteps = steps.length;
  const progress = Math.round((doneCount / totalSteps) * 100);
  const iftEarned = steps.filter((s) => s.status === "done").reduce((sum, s) => sum + s.ift, 0);
  const iftMax = steps.reduce((sum, s) => sum + s.ift, 0);

  const greetingName = profile?.full_name?.split(" ")[0] ?? "você";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-gold/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-magenta/10 rounded-full blur-[120px]" />
      </div>

      <AppNavbar onCtaClick={() => setLeadOpen(true)} />

      <main className="relative pt-28 pb-24 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-brand-gold font-heading">
            <Sparkles className="w-3.5 h-3.5" /> Jornada do colaborador
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3 leading-tight">
            Olá, {greetingName}. Esta é{" "}
            <span className="text-gradient-gold">a sua jornada</span> de florescimento.
          </h1>
          <p className="text-muted-foreground text-lg mt-3 max-w-2xl">
            Pequenos passos, escolhidos por você, conectados pela ciência. Cada etapa concluída
            fortalece seu bem-estar — e contribui anonimamente para o panorama coletivo da organização.
          </p>
        </motion.div>

        {/* Stat strip */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <Card className="glass-card-strong p-5 border-brand-gold/20">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 text-brand-gold" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-heading">Progresso</span>
            </div>
            <div className="font-display text-3xl font-bold">{progress}%</div>
            <Progress value={progress} className="h-2 mt-3" />
            <p className="text-xs text-muted-foreground mt-2">{doneCount} de {totalSteps} marcos</p>
          </Card>
          <Card className="glass-card-strong p-5 border-brand-cyan/20">
            <div className="flex items-center gap-3 mb-2">
              <Coins className="w-5 h-5 text-brand-cyan" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-heading">IFT Coin</span>
            </div>
            <div className="font-display text-3xl font-bold">
              {iftEarned}<span className="text-muted-foreground text-base font-normal"> / {iftMax}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Reconhecimento privado · sem ranking público</p>
          </Card>
          <Card className="glass-card-strong p-5 border-brand-magenta/20">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-5 h-5 text-brand-magenta" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-heading">FIB-T atual</span>
            </div>
            <div className="font-display text-3xl font-bold">
              {lastFib !== null ? lastFib.toFixed(0) : "—"}
              {lastFib !== null && <span className="text-muted-foreground text-base font-normal">/100</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {lastFib !== null ? `Sequência ${streak} semana${streak > 1 ? "s" : ""}` : "Faça seu primeiro diagnóstico"}
            </p>
          </Card>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-6 sm:left-8 top-4 bottom-4 w-px bg-gradient-to-b from-brand-gold/40 via-brand-cyan/30 to-brand-magenta/40" aria-hidden />
          <ul className="space-y-5">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isDone = step.status === "done";
              const isCurrent = step.status === "current";
              const isLocked = step.status === "locked";
              return (
                <motion.li
                  key={step.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                  className="relative pl-16 sm:pl-20"
                >
                  {/* Node */}
                  <div
                    className={cn(
                      "absolute left-0 top-1 w-12 sm:w-16 h-12 sm:h-16 rounded-2xl border flex items-center justify-center transition-all",
                      accentBg[step.accent],
                      isCurrent && accentGlow[step.accent],
                      isLocked && "opacity-50 grayscale"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : isLocked ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>

                  <Card
                    className={cn(
                      "glass-card p-5 sm:p-6 border transition-all",
                      isCurrent && "border-brand-gold/40 bg-gradient-to-br from-brand-gold/[0.04] to-transparent",
                      isDone && "opacity-90",
                      isLocked && "opacity-60"
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-heading">
                            Etapa {idx + 1}
                          </span>
                          {isDone && (
                            <span className="text-[10px] uppercase tracking-widest text-brand-gold font-heading">
                              · Concluída
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] uppercase tracking-widest text-brand-gold font-heading flex items-center gap-1">
                              · <Sparkles className="w-3 h-3" /> Próximo passo
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-xl sm:text-2xl font-semibold leading-tight">
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2 max-w-xl leading-relaxed">
                          {step.subtitle}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <span className="inline-flex items-center gap-1.5 text-xs font-heading font-semibold text-brand-cyan">
                          <Coins className="w-3.5 h-3.5" /> +{step.ift} IFT
                        </span>
                        {!isLocked && (
                          <Link
                            to={step.cta.to}
                            className={cn(
                              "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-heading font-bold transition-all",
                              isCurrent
                                ? "gradient-gold text-primary-foreground hover:opacity-90 glow-gold"
                                : "bg-foreground/5 text-foreground hover:bg-foreground/10"
                            )}
                          >
                            {isDone ? "Revisar" : step.cta.label}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        {isLocked && (
                          <span className="text-[11px] text-muted-foreground italic">Conclua a etapa anterior</span>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.li>
              );
            })}
          </ul>
        </div>

        {/* Completion / encouragement */}
        {progress === 100 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 p-8 rounded-3xl glass-card-strong border-brand-gold/30 text-center"
          >
            <Trophy className="w-10 h-10 text-brand-gold mx-auto mb-3" />
            <h3 className="font-display text-2xl font-bold">Sua primeira volta está completa.</h3>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              Florescer é cíclico. Volte ao FIB-T daqui a 30 dias para medir sua evolução, e explore novas trilhas Academy.
            </p>
          </motion.div>
        ) : (
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl border border-foreground/10 bg-card/40">
            <div className="flex items-center gap-3">
              <Circle className="w-5 h-5 text-brand-gold animate-pulse" />
              <p className="text-sm text-muted-foreground">
                Você está a <span className="text-foreground font-semibold">{totalSteps - doneCount} passos</span> de fechar seu primeiro ciclo.
              </p>
            </div>
            <Link
              to={steps.find((s) => s.status === "current")?.cta.to ?? "/dashboard"}
              className="inline-flex items-center gap-2 text-sm font-heading font-bold text-brand-gold hover:underline"
            >
              Continuar de onde parei <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>

      <LeadFormModal open={leadOpen} onOpenChange={setLeadOpen} segmentLabel="Jornada" />
    </div>
  );
}
