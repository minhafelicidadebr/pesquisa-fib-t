import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, ArrowRight, Sparkles, TrendingUp, Award, AlertTriangle, History,
  ShieldAlert, Activity, FileText, Stethoscope, Download,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell,
} from "recharts";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { InstitutionalFooter } from "@/components/deck/InstitutionalFooter";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listAssessments, AssessmentRecord } from "@/lib/fibAssessments";
import { listNR1, NR1Record } from "@/lib/nr1Assessments";
import { useAuth } from "@/hooks/useAuth";
import { MOCK_NR1, nr1ToPayload, ReportPayload } from "@/lib/nr1Mock";
import { EcosystemHub } from "@/components/dashboard/EcosystemHub";
import { DisruptiveLab } from "@/components/dashboard/DisruptiveLab";

const FN_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/nr1-pdf-report`;

function openReport(payload: ReportPayload) {
  const win = window.open("", "_blank");
  if (!win) return;
  fetch(FN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((r) => r.text()).then((html) => {
    win.document.open(); win.document.write(html); win.document.close();
  }).catch(() => win.close());
}

const ZONE_COLORS: Record<string, string> = {
  verde: "hsl(120 60% 40%)",
  amarela: "hsl(38 92% 50%)",
  vermelha: "hsl(0 75% 55%)",
};

function KpiCard({ label, value, sub, accent = "gold", icon: Icon }: { label: string; value: string | number; sub?: string; accent?: "gold" | "cyan" | "magenta" | "green"; icon?: any }) {
  const colorMap: Record<string, string> = {
    gold: "text-brand-gold border-brand-gold/30 bg-brand-gold/5",
    cyan: "text-brand-cyan border-brand-cyan/30 bg-brand-cyan/5",
    magenta: "text-brand-magenta border-brand-magenta/30 bg-brand-magenta/5",
    green: "text-brand-green border-brand-green/30 bg-brand-green/5",
  };
  return (
    <div className={`rounded-2xl p-5 border ${colorMap[accent]} backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest font-heading font-bold text-muted-foreground">{label}</span>
        {Icon && <Icon className="w-4 h-4 opacity-60" />}
      </div>
      <p className="font-display text-3xl md:text-4xl font-bold tabular-nums-data leading-none">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>}
    </div>
  );
}

function OverviewTab({ fib, nr1 }: { fib: AssessmentRecord[]; nr1: NR1Record[] }) {
  const fibLatest = fib[0];
  const nr1Latest = nr1[0];
  const usingMock = !nr1Latest;
  const mockSubs = MOCK_NR1.subscales;
  const subsForChart = nr1Latest ? (nr1Latest.subscales as any[]).slice(0, 8) : mockSubs.slice(0, 8);

  return (
    <div className="space-y-6">
      {usingMock && (
        <div className="rounded-xl border border-brand-cyan/30 bg-brand-cyan/5 px-4 py-3 text-sm text-foreground/90 flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-brand-cyan shrink-0" />
          <span>Você está vendo dados <strong>demonstrativos</strong>. Conclua um diagnóstico para popular com seus dados reais.</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="FIB Score" value={fibLatest ? Number(fibLatest.fib_score).toFixed(0) : "—"} sub="de 100 · multidimensional" accent="gold" icon={Award} />
        <KpiCard label="Risco NR-1" value={(nr1Latest?.global_risk || MOCK_NR1.global_risk).toUpperCase()} sub={`Score ${(nr1Latest?.global_score ?? MOCK_NR1.global_score).toFixed(1)}/5`} accent="magenta" icon={ShieldAlert} />
        <KpiCard label="Diagnósticos" value={fib.length + nr1.length} sub={`${fib.length} FIB · ${nr1.length} NR-1`} accent="cyan" icon={Stethoscope} />
        <KpiCard label="Em zona crítica" value={(nr1Latest?.red_flags as any[] || mockSubs.filter((s) => s.zone === "vermelha")).length} sub="Subescalas em alerta" accent="green" icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card-strong rounded-2xl p-6">
          <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-gold" /> Top subescalas COPSOQ II
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={subsForChart} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 5]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis type="category" dataKey="label" width={130} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                {subsForChart.map((s: any, i: number) => <Cell key={i} fill={ZONE_COLORS[s.zone] || "hsl(43 100% 52%)"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card-strong rounded-2xl p-6 flex flex-col">
          <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-cyan" /> Ações rápidas
          </h3>
          <div className="space-y-3 flex-1">
            <Link to="/fibia" className="block p-4 rounded-xl border border-brand-gold/30 hover:bg-brand-gold/5 transition-colors group">
              <p className="font-heading font-bold text-sm text-foreground flex items-center justify-between">FIB-T com FIBia <ArrowRight className="w-4 h-4 text-brand-gold group-hover:translate-x-1 transition-transform" /></p>
              <p className="text-xs text-muted-foreground mt-1">Diagnóstico de bem-estar pessoal</p>
            </Link>
            <Link to="/nr1/avaliacao" className="block p-4 rounded-xl border border-brand-magenta/30 hover:bg-brand-magenta/5 transition-colors group">
              <p className="font-heading font-bold text-sm text-foreground flex items-center justify-between">NR-1 com NORA <ArrowRight className="w-4 h-4 text-brand-magenta group-hover:translate-x-1 transition-transform" /></p>
              <p className="text-xs text-muted-foreground mt-1">COPSOQ II · 41 itens</p>
            </Link>
            <button onClick={() => openReport(nr1Latest ? nr1ToPayload(nr1Latest) : MOCK_NR1)} className="w-full text-left block p-4 rounded-xl border border-brand-cyan/30 hover:bg-brand-cyan/5 transition-colors group">
              <p className="font-heading font-bold text-sm text-foreground flex items-center justify-between">Gerar relatório PDF <Download className="w-4 h-4 text-brand-cyan" /></p>
              <p className="text-xs text-muted-foreground mt-1">DRPS premium · A4 imprimível</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FibTab({ items }: { items: AssessmentRecord[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <Award className="w-12 h-12 mx-auto text-brand-gold mb-4 opacity-60" />
        <p className="text-muted-foreground mb-4">Nenhum diagnóstico FIB-T salvo ainda.</p>
        <Link to="/fibia" className="inline-flex items-center gap-2 gradient-gold text-primary-foreground font-heading font-bold px-6 py-3 rounded-xl glow-gold">
          Iniciar com a FIBia <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }
  const latest = items[0];
  const radarData = Object.values(latest.domains).map((d) => ({ domain: d.label, score: Number(d.score), benchmark: 2.4 }));
  const evolution = [...items].reverse().map((a) => ({ date: new Date(a.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }), fib: Number(a.fib_score) }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card-strong rounded-2xl p-6 lg:col-span-1 text-center flex flex-col justify-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-heading">FIB Score atual</p>
          <p className="font-display text-7xl font-bold text-gradient-gold tabular-nums-data my-3">{latest.fib_score}</p>
          <p className="text-xs text-muted-foreground">de 100 · {new Date(latest.created_at).toLocaleDateString("pt-BR")}</p>
        </div>
        <div className="glass-card-strong rounded-2xl p-6 lg:col-span-2">
          <h3 className="font-heading font-bold text-foreground mb-4">Radar das 9 dimensões FIB-T</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="domain" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 4]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <Radar name="Benchmark" dataKey="benchmark" stroke="hsl(181 100% 40%)" fill="hsl(181 100% 40%)" fillOpacity={0.08} strokeWidth={1} strokeDasharray="4 4" />
              <Radar name="Você" dataKey="score" stroke="hsl(43 100% 52%)" fill="hsl(43 100% 52%)" fillOpacity={0.25} strokeWidth={2.5} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {items.length > 1 && (
        <div className="glass-card-strong rounded-2xl p-6">
          <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-brand-cyan" /> Evolução</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={evolution}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="fib" stroke="hsl(43 100% 52%)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function Nr1Tab({ items }: { items: NR1Record[] }) {
  const usingMock = items.length === 0;
  const latest = items[0];
  const subs = (latest?.subscales as any[]) || MOCK_NR1.subscales;
  const sortedRisk = [...subs].sort((a: any, b: any) => a.score - b.score).slice(0, 5);

  return (
    <div className="space-y-6">
      {usingMock && (
        <div className="rounded-xl border border-brand-magenta/30 bg-brand-magenta/5 px-4 py-3 text-sm text-foreground/90 flex items-center justify-between gap-3">
          <span><strong>Dados demonstrativos.</strong> Conclua a avaliação NR-1 com a NORA para ver seus dados reais.</span>
          <Link to="/nr1/avaliacao" className="shrink-0 text-brand-magenta font-heading font-bold text-xs hover:underline">Iniciar →</Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Risco global" value={(latest?.global_risk || MOCK_NR1.global_risk).toUpperCase()} accent="magenta" icon={ShieldAlert} />
        <KpiCard label="Score" value={(latest?.global_score ?? MOCK_NR1.global_score).toFixed(1)} sub="de 5 · maior = melhor" accent="gold" />
        <KpiCard label="Zona vermelha" value={subs.filter((s: any) => s.zone === "vermelha").length} sub="Intervenção imediata" accent="magenta" />
        <KpiCard label="Zona verde" value={subs.filter((s: any) => s.zone === "verde").length} sub="Potências" accent="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card-strong rounded-2xl p-6">
          <h3 className="font-heading font-bold text-foreground mb-4">Top 5 riscos prioritários</h3>
          <ul className="space-y-2">
            {sortedRisk.map((s: any) => (
              <li key={s.key || s.label} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-brand-magenta/5 border border-brand-magenta/20">
                <div className="min-w-0">
                  <p className="font-heading font-semibold text-sm text-foreground truncate">{s.label}</p>
                  <p className="text-[11px] text-muted-foreground">{s.dimension}</p>
                </div>
                <span className="font-bold tabular-nums-data text-brand-magenta">{Number(s.score).toFixed(1)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-card-strong rounded-2xl p-6 flex flex-col">
          <h3 className="font-heading font-bold text-foreground mb-2">Relatório DRPS premium</h3>
          <p className="text-sm text-muted-foreground mb-5 flex-1">8 páginas A4 com radar, semáforo, matriz AIHA 5×5, plano de ação e ficha técnica. Pronto para juntar ao PGR.</p>
          <button onClick={() => openReport(latest ? nr1ToPayload(latest) : MOCK_NR1)} className="inline-flex items-center justify-center gap-2 gradient-gold text-primary-foreground font-heading font-bold px-5 py-3 rounded-xl glow-gold">
            <Download className="w-4 h-4" /> Abrir relatório PDF
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2"><History className="w-4 h-4 text-muted-foreground" /> Histórico</h3>
          <ul className="divide-y divide-border">
            {items.map((a) => (
              <li key={a.id} className="py-2.5 flex items-center justify-between text-sm">
                <span>{new Date(a.created_at).toLocaleString("pt-BR")}</span>
                <span className="text-muted-foreground">Risco <strong className="uppercase text-foreground">{a.global_risk}</strong> · {Number(a.global_score).toFixed(1)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function DashboardContent() {
  const { profile } = useAuth();
  const [fib, setFib] = useState<AssessmentRecord[] | null>(null);
  const [nr1, setNr1] = useState<NR1Record[] | null>(null);

  useEffect(() => {
    listAssessments().then(setFib);
    listNR1().then(setNr1);
  }, []);

  if (fib === null || nr1 === null) {
    return <div className="py-32 text-center text-muted-foreground">Carregando seu painel…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 mb-4">
          <LayoutDashboard className="w-3.5 h-3.5 text-brand-cyan" />
          <span className="text-xs font-heading font-bold uppercase tracking-wider text-brand-cyan">Painel SaaS NR-1 · FIB</span>
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-2 leading-tight">
          Olá, {profile?.full_name?.split(" ")[0] || "viajante do bem-estar"} <span className="inline-block">👋</span>
        </h1>
        <p className="text-muted-foreground text-base md:text-lg">
          Visão integrada do seu bem-estar (FIB-T) e da saúde organizacional (NR-1 / COPSOQ II).
        </p>
      </div>

      <Tabs defaultValue="lab" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="lab" className="gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Disruptive Lab
          </TabsTrigger>
          <TabsTrigger value="ecosystem" className="gap-1.5">
            <LayoutDashboard className="w-3.5 h-3.5" /> Ecossistema
          </TabsTrigger>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="nr1">NR-1 · COPSOQ</TabsTrigger>
          <TabsTrigger value="fib">FIB-T</TabsTrigger>
        </TabsList>
        <TabsContent value="lab"><DisruptiveLab /></TabsContent>
        <TabsContent value="ecosystem"><EcosystemHub companyName={profile?.organization} /></TabsContent>
        <TabsContent value="overview"><OverviewTab fib={fib} nr1={nr1} /></TabsContent>
        <TabsContent value="nr1"><Nr1Tab items={nr1} /></TabsContent>
        <TabsContent value="fib"><FibTab items={fib} /></TabsContent>
      </Tabs>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background overflow-x-hidden">
        <AppNavbar />
        <main className="pt-24 pb-16 px-4 sm:px-6">
          <DashboardContent />
        </main>
        <InstitutionalFooter />
      </div>
    </ProtectedRoute>
  );
}
