import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, ArrowRight, Sparkles, TrendingUp, Award, AlertTriangle, History } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { InstitutionalFooter } from "@/components/deck/InstitutionalFooter";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { listAssessments, AssessmentRecord } from "@/lib/fibAssessments";
import { useAuth } from "@/hooks/useAuth";

function EmptyState() {
  return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 mb-8 glow-cyan">
        <LayoutDashboard className="w-10 h-10 text-brand-cyan" />
      </div>
      <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
        Seu painel <span className="text-gradient-cyan">FIB</span> está esperando
      </h1>
      <p className="text-lg text-muted-foreground mb-10">
        Faça seu primeiro diagnóstico FIB-T conversacional com a FIBia para ativar seu painel pessoal com radar, evolução, pontos fortes e plano de ação.
      </p>
      <Link
        to="/fibia"
        className="inline-flex items-center gap-2 gradient-gold text-primary-foreground font-heading font-bold px-8 py-4 rounded-xl glow-gold"
      >
        Iniciar diagnóstico agora <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function DashboardContent() {
  const { profile } = useAuth();
  const [items, setItems] = useState<AssessmentRecord[] | null>(null);

  useEffect(() => {
    listAssessments().then(setItems);
  }, []);

  if (items === null) {
    return <div className="py-32 text-center text-muted-foreground">Carregando seu painel…</div>;
  }
  if (items.length === 0) return <EmptyState />;

  const latest = items[0];
  const radarData = Object.values(latest.domains).map((d) => ({
    domain: d.label,
    score: Number(d.score),
    benchmark: 2.4,
  }));

  const evolution = [...items].reverse().map((a) => ({
    date: new Date(a.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    fib: Number(a.fib_score),
  }));

  return (
    <div className="max-w-6xl mx-auto py-10">
      {/* Hero */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
          <span className="text-xs font-heading font-bold uppercase tracking-wider text-brand-cyan">Painel Pessoal</span>
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-2 leading-tight">
          Olá, {profile?.full_name?.split(" ")[0] || "viajante do bem-estar"} 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          Seu FIB Score atual é <span className="text-brand-gold font-bold tabular-nums-data">{latest.fib_score}</span>/100 ·
          última medição em {new Date(latest.created_at).toLocaleDateString("pt-BR")}
        </p>
      </div>

      {/* Hero metric + radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card-strong rounded-2xl p-6 lg:col-span-1 flex flex-col justify-center text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-heading">FIB Score</p>
          <p className="font-display text-7xl font-bold text-gradient-gold tabular-nums-data my-3">{latest.fib_score}</p>
          <p className="text-xs text-muted-foreground">de 100 pontos · multidimensional</p>
          <div className="mt-6 grid grid-cols-3 gap-2 text-xs">
            {Object.values(latest.factors).map((f) => (
              <div key={f.label} className="glass-card rounded-lg p-2">
                <p className="text-muted-foreground text-[10px] truncate">{f.label}</p>
                <p className="font-bold text-foreground tabular-nums-data">{Number(f.score).toFixed(1)}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-strong rounded-2xl p-6 lg:col-span-2">
          <h2 className="font-heading font-bold text-foreground mb-4">Radar das 9 dimensões FIB-T</h2>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="domain" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 4]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <Radar name="Benchmark" dataKey="benchmark" stroke="hsl(181 100% 40%)" fill="hsl(181 100% 40%)" fillOpacity={0.08} strokeWidth={1} strokeDasharray="4 4" />
              <Radar name="Você" dataKey="score" stroke="hsl(43 100% 52%)" fill="hsl(43 100% 52%)" fillOpacity={0.25} strokeWidth={2.5} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Strengths / Vulnerabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-brand-gold" />
            <h3 className="font-heading font-bold text-foreground">Suas potências</h3>
          </div>
          <ul className="space-y-2">
            {latest.strengths.slice(0, 3).map((s) => (
              <li key={s} className="text-sm text-foreground/90 flex items-start gap-2">
                <span className="text-brand-gold mt-0.5">●</span>{s}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-brand-magenta" />
            <h3 className="font-heading font-bold text-foreground">Pontos de atenção</h3>
          </div>
          <ul className="space-y-2">
            {latest.vulnerabilities.slice(0, 3).map((s) => (
              <li key={s} className="text-sm text-foreground/90 flex items-start gap-2">
                <span className="text-brand-magenta mt-0.5">●</span>{s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Evolution */}
      {items.length > 1 && (
        <div className="glass-card-strong rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-brand-cyan" />
            <h3 className="font-heading font-bold text-foreground">Evolução do seu FIB Score</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={evolution}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
              <Line type="monotone" dataKey="fib" stroke="hsl(43 100% 52%)" strokeWidth={3} dot={{ r: 4, fill: "hsl(43 100% 52%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History + CTA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-heading font-bold text-foreground">Histórico ({items.length})</h3>
          </div>
          <ul className="divide-y divide-border">
            {items.map((a) => (
              <li key={a.id} className="py-2.5 flex items-center justify-between">
                <span className="text-sm text-foreground/90">{new Date(a.created_at).toLocaleString("pt-BR")}</span>
                <span className="font-bold text-brand-gold tabular-nums-data">{Number(a.fib_score).toFixed(1)}</span>
              </li>
            ))}
          </ul>
        </div>
        <Link to="/fibia" className="glass-card-strong rounded-2xl p-6 flex flex-col justify-center items-start hover:border-brand-gold/40 transition-colors group">
          <Sparkles className="w-6 h-6 text-brand-gold mb-3" />
          <h3 className="font-heading font-bold text-foreground mb-2">Refazer com a FIBia</h3>
          <p className="text-sm text-muted-foreground mb-4">Reavalie a cada 30-90 dias para ver evolução real.</p>
          <span className="inline-flex items-center gap-1.5 text-sm font-heading font-bold text-brand-gold group-hover:gap-3 transition-all">
            Iniciar nova jornada <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>
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
