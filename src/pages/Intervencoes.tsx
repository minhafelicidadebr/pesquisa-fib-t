import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Filter,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { listNR1 } from "@/lib/nr1Assessments";
import {
  rankInterventions,
  type Intervention,
  type InterventionLevel,
  type RankedIntervention,
  type SubscaleRisk,
} from "@/data/interventions";
import { toast } from "sonner";

const LEVEL_META: Record<InterventionLevel, { label: string; icon: typeof Users; color: string }> = {
  individual: { label: "Individual", icon: Sparkles, color: "text-gold-400" },
  equipe: { label: "Equipe", icon: Users, color: "text-cyan-400" },
  organizacional: { label: "Organizacional", icon: TrendingUp, color: "text-magenta-400" },
};

function iliBand(ili: number): { label: string; tone: string } {
  if (ili >= 55) return { label: "Prioridade alta", tone: "bg-rose-500/15 text-rose-300 border-rose-500/40" };
  if (ili >= 35) return { label: "Prioridade média", tone: "bg-amber-500/15 text-amber-300 border-amber-500/40" };
  return { label: "Manutenção", tone: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" };
}

export default function Intervencoes() {
  const { user } = useAuth();
  const [risks, setRisks] = useState<SubscaleRisk[]>([]);
  const [latestDate, setLatestDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | InterventionLevel>("all");
  const [planned, setPlanned] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      const list = await listNR1();
      if (list.length > 0) {
        const latest = list[0];
        setRisks(
          (latest.subscales || []).map((s: any) => ({ key: s.key, score: Number(s.score) }))
        );
        setLatestDate(latest.created_at);
      }
      setLoading(false);
    })();
  }, [user]);

  const ranked = useMemo<RankedIntervention[]>(() => {
    // Se não houver COPSOQ, usa baseline neutro (50) para todas subescalas conhecidas
    if (risks.length === 0) {
      const fallback: SubscaleRisk[] = [
        "exigencias_quantitativas", "ritmo_trabalho", "exigencias_emocionais",
        "qualidade_lideranca", "apoio_social_superior", "previsibilidade",
        "clareza_papel", "recompensas", "comunidade_social", "burnout",
        "stress", "significado_trabalho", "satisfacao_trabalho",
        "problemas_sono", "comportamentos_ofensivos", "justica_respeito",
        "confianca_vertical", "influencia_trabalho", "possibilidades_desenvolvimento",
      ].map((key) => ({ key, score: 50 }));
      return rankInterventions(fallback);
    }
    return rankInterventions(risks);
  }, [risks]);

  const filtered = useMemo(
    () => (filter === "all" ? ranked : ranked.filter((i) => i.level === filter)),
    [ranked, filter]
  );

  const top3 = ranked.slice(0, 3);
  const hasRealData = risks.length > 0;

  const togglePlan = (id: string, title: string) => {
    setPlanned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast(`"${title}" removida do plano`);
      } else {
        next.add(id);
        toast.success(`"${title}" adicionada ao plano de ação`);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNavbar />

      {/* Hero */}
      <section className="relative pt-32 pb-12 px-4 overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(var(--magenta-500) / 0.25), transparent 70%)",
          }}
        />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-magenta-500/40 bg-magenta-500/10 text-magenta-300 text-xs font-medium mb-4">
              <Activity className="h-3.5 w-3.5" />
              Transformar · ILI Score
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-light leading-tight mb-4">
              Intervenções <span className="text-gradient-magenta">priorizadas pela sua realidade</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Cada prática do catálogo Oxford é cruzada com o seu COPSOQ II. O{" "}
              <strong className="text-foreground">ILI (Intervention Likelihood Index)</strong>{" "}
              estima o impacto esperado: risco coberto × abrangência × tamanho do efeito.
            </p>
          </motion.div>

          {/* Status banner */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-5 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className={`h-2.5 w-2.5 rounded-full ${hasRealData ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`} />
              <div>
                <div className="text-sm font-medium">
                  {hasRealData
                    ? "ILI calibrado com seu último diagnóstico"
                    : "Sem diagnóstico — mostrando ranking baseline"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {hasRealData && latestDate
                    ? `Última avaliação: ${new Date(latestDate).toLocaleDateString("pt-BR")} · ${risks.length} subescalas COPSOQ`
                    : "Responda a NR-1 / COPSOQ para personalizar este ranking."}
                </div>
              </div>
            </div>
            {!hasRealData && (
              <Button asChild size="sm" className="bg-magenta-500 hover:bg-magenta-600 text-white">
                <Link to="/nr1/avaliacao">
                  Fazer NR-1 agora <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Top 3 picks */}
      <section className="px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-magenta-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Top 3 — maior ILI esperado
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-card/40 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {top3.map((iv, idx) => (
                <TopCard
                  key={iv.id}
                  iv={iv}
                  rank={idx + 1}
                  planned={planned.has(iv.id)}
                  onPlan={() => togglePlan(iv.id, iv.title)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Catálogo completo */}
      <section className="px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif text-2xl font-light">Catálogo completo</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {ranked.length} intervenções com evidência. Filtre por nível de atuação.
              </p>
            </div>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
              <TabsList>
                <TabsTrigger value="all" className="text-xs">
                  <Filter className="h-3 w-3 mr-1" /> Todas
                </TabsTrigger>
                <TabsTrigger value="individual" className="text-xs">Individual</TabsTrigger>
                <TabsTrigger value="equipe" className="text-xs">Equipe</TabsTrigger>
                <TabsTrigger value="organizacional" className="text-xs">Organizacional</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Tabs value={filter}>
            <TabsContent value={filter} className="mt-0">
              <div className="space-y-3">
                {filtered.map((iv, idx) => (
                  <CatalogRow
                    key={iv.id}
                    iv={iv}
                    rank={ranked.indexOf(iv) + 1}
                    planned={planned.has(iv.id)}
                    onPlan={() => togglePlan(iv.id, iv.title)}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {planned.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 rounded-2xl border border-magenta-500/40 bg-magenta-500/10 p-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-magenta-300" />
                <span className="text-sm font-semibold text-magenta-200">
                  {planned.size} intervenç{planned.size > 1 ? "ões" : "ão"} no seu plano
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Quando ativar Lovable Cloud com a tabela <code className="text-xs">company_interventions</code>,
                este plano será persistido por empresa com status (planejada/ativa/concluída) e KPI.
              </p>
              <Button asChild size="sm" variant="outline" className="border-magenta-500/40">
                <Link to="/dashboard">Ver no Dashboard</Link>
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

function TopCard({
  iv,
  rank,
  planned,
  onPlan,
}: {
  iv: RankedIntervention;
  rank: number;
  planned: boolean;
  onPlan: () => void;
}) {
  const band = iliBand(iv.ili);
  const LevelIcon = LEVEL_META[iv.level].icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: rank * 0.05 }}
    >
      <Card className="h-full border-magenta-500/30 bg-gradient-to-br from-card via-card to-magenta-500/5 hover:border-magenta-500/50 transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge variant="outline" className="text-[10px] font-mono">
              #{rank}
            </Badge>
            <Badge className={band.tone + " text-[10px] border"}>{band.label}</Badge>
          </div>
          <CardTitle className="text-lg leading-tight font-serif font-light">
            {iv.title}
          </CardTitle>
          <CardDescription className="text-xs">{iv.summary}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">ILI score</span>
              <span className="font-mono font-semibold text-magenta-300">{iv.ili}</span>
            </div>
            <Progress value={iv.ili} className="h-1.5" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>risco coberto {iv.matchedRisk}</span>
              <span>cobertura {(iv.coverage * 100).toFixed(0)}%</span>
              <span>d={iv.effectSize}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className={`inline-flex items-center gap-1 ${LEVEL_META[iv.level].color}`}>
              <LevelIcon className="h-3 w-3" /> {LEVEL_META[iv.level].label}
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" /> {iv.horizon}
            </span>
            <span className="text-muted-foreground">esforço {iv.effort}</span>
          </div>

          <Button
            size="sm"
            onClick={onPlan}
            variant={planned ? "outline" : "default"}
            className={`w-full ${planned ? "" : "bg-magenta-500 hover:bg-magenta-600 text-white"}`}
          >
            {planned ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> No plano
              </>
            ) : (
              <>Adicionar ao plano</>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CatalogRow({
  iv,
  rank,
  planned,
  onPlan,
}: {
  iv: RankedIntervention;
  rank: number;
  planned: boolean;
  onPlan: () => void;
}) {
  const [open, setOpen] = useState(false);
  const band = iliBand(iv.ili);
  const LevelIcon = LEVEL_META[iv.level].icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border/60 bg-card/40 hover:bg-card/70 transition-colors overflow-hidden"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left p-4 md:p-5 grid grid-cols-12 gap-4 items-center"
      >
        <div className="col-span-1 text-center">
          <div className="text-xl font-mono text-magenta-300">#{rank}</div>
        </div>
        <div className="col-span-12 md:col-span-5">
          <div className="font-medium text-sm leading-tight">{iv.title}</div>
          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{iv.summary}</div>
        </div>
        <div className="col-span-6 md:col-span-3">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-muted-foreground">ILI</span>
            <span className="font-mono font-semibold text-magenta-300">{iv.ili}</span>
          </div>
          <Progress value={iv.ili} className="h-1" />
        </div>
        <div className="col-span-6 md:col-span-3 flex items-center justify-end gap-2 flex-wrap">
          <Badge className={band.tone + " text-[10px] border"}>{band.label}</Badge>
          <span className={`inline-flex items-center gap-1 text-[11px] ${LEVEL_META[iv.level].color}`}>
            <LevelIcon className="h-3 w-3" />
          </span>
        </div>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-5 pb-5 border-t border-border/40 grid md:grid-cols-3 gap-6 pt-4"
        >
          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Protocolo</h4>
            <ol className="space-y-1.5 text-xs text-foreground/80">
              {iv.protocol.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-magenta-300 font-mono">{i + 1}.</span>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Subescalas alvo
            </h4>
            <div className="space-y-1.5">
              {iv.targets.map((t) => (
                <div key={t.subscale} className="flex items-center justify-between text-xs">
                  <span className="text-foreground/80">{t.subscale.replace(/_/g, " ")}</span>
                  <span className="font-mono text-muted-foreground">
                    {(t.weight * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                KPI de sucesso
              </h4>
              <p className="text-xs text-foreground/90">{iv.kpi}</p>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Evidência
              </h4>
              <p className="text-[11px] text-muted-foreground italic">{iv.evidence}</p>
            </div>
            <Button
              size="sm"
              onClick={onPlan}
              variant={planned ? "outline" : "default"}
              className={`w-full ${planned ? "" : "bg-magenta-500 hover:bg-magenta-600 text-white"}`}
            >
              {planned ? "No plano ✓" : "Adicionar ao plano"}
            </Button>
          </div>
        </motion.div>
      )}
    </motion.article>
  );
}
