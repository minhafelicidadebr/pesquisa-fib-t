import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2, Users, ShieldAlert, TrendingUp, AlertTriangle, ArrowUpRight,
  ChevronRight, Sparkles, RefreshCw, Loader2, Briefcase,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Cell,
} from "recharts";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { InstitutionalFooter } from "@/components/deck/InstitutionalFooter";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { getConsultingPortfolio, Portfolio, CompanyPortfolioItem } from "@/lib/consultoria";

const riskColor = (r: string | null) =>
  r === "vermelho" ? "hsl(0 84% 60%)" : r === "amarelo" ? "hsl(43 100% 52%)" : r === "verde" ? "hsl(142 71% 45%)" : "hsl(var(--muted-foreground))";
const riskLabel = (r: string | null) =>
  r === "vermelho" ? "Crítico" : r === "amarelo" ? "Atenção" : r === "verde" ? "Saudável" : "Sem dados";

function Inner() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CompanyPortfolioItem | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const p = await getConsultingPortfolio();
      setPortfolio(p);
      if (p.companies[0]) setSelected(p.companies[0]);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-brand-gold" />
              <span className="text-xs font-heading font-bold uppercase tracking-widest text-brand-gold">Dashboard Executivo</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Portfólio <span className="text-gradient-gold">multi-empresa</span>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Visão consolidada de todas as empresas sob sua consultoria: risco psicossocial, alertas NR-1 e evolução ao longo do tempo.
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="glass-card hover:bg-foreground/5 rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-heading font-semibold transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Atualizar
          </button>
        </div>

        {loading && !portfolio && (
          <div className="flex items-center justify-center py-32 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-3" /> Carregando portfólio...
          </div>
        )}

        {portfolio && portfolio.companies.length === 0 && (
          <div className="glass-card-strong rounded-2xl p-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-heading text-xl font-bold text-foreground mb-2">Nenhuma empresa vinculada</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Cadastre sua primeira empresa ou entre em uma via código de convite para começar a consolidar diagnósticos.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/empresa/configurar" className="bg-brand-gold text-black font-heading font-bold px-5 py-2.5 rounded-lg">Cadastrar empresa</Link>
              <Link to="/onboarding" className="border border-foreground/20 text-foreground font-heading font-bold px-5 py-2.5 rounded-lg hover:bg-foreground/5">Entrar por convite</Link>
            </div>
          </div>
        )}

        {portfolio && portfolio.companies.length > 0 && (
          <>
            {/* KPI strip */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              <Kpi icon={<Building2 className="w-4 h-4" />} label="Empresas" value={portfolio.totals.companies} />
              <Kpi icon={<Users className="w-4 h-4" />} label="Colaboradores" value={portfolio.totals.members} />
              <Kpi icon={<Sparkles className="w-4 h-4" />} label="Diagnósticos" value={portfolio.totals.assessments} />
              <Kpi icon={<TrendingUp className="w-4 h-4" />} label="Score médio" value={portfolio.totals.avg_score ?? "—"} />
              <Kpi icon={<AlertTriangle className="w-4 h-4" />} label="Alertas vermelhos" value={portfolio.totals.red_alerts} accent="destructive" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Companies list */}
              <section className="lg:col-span-1 space-y-3">
                <h2 className="font-heading font-bold text-foreground mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-brand-magenta" /> Ranking de risco
                </h2>
                {portfolio.companies.map((c) => (
                  <button
                    key={c.company_id}
                    onClick={() => setSelected(c)}
                    className={`w-full text-left glass-card rounded-xl p-4 transition-all border-2 ${
                      selected?.company_id === c.company_id ? "border-brand-gold" : "border-transparent hover:border-foreground/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="font-heading font-bold text-sm text-foreground truncate">{c.legal_name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{c.sector || "Setor não informado"} · {c.member_count} membros</p>
                      </div>
                      <span
                        className="text-[10px] font-heading font-bold px-2 py-1 rounded-full whitespace-nowrap"
                        style={{ background: `${riskColor(c.last_risk)}22`, color: riskColor(c.last_risk), border: `1px solid ${riskColor(c.last_risk)}55` }}
                      >
                        {riskLabel(c.last_risk)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-2xl font-bold tabular-nums-data" style={{ color: riskColor(c.last_risk) }}>
                          {c.last_score ?? "—"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">/100</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground tabular-nums-data">
                        {c.assessment_count} diag · {c.red_flags_total} 🚩
                      </span>
                    </div>
                  </button>
                ))}
              </section>

              {/* Detail panel */}
              <section className="lg:col-span-2 space-y-6">
                {selected && (
                  <motion.div key={selected.company_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    {/* Header card */}
                    <div className="glass-card-strong rounded-2xl p-6">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">Empresa selecionada</p>
                          <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">{selected.legal_name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selected.sector || "Setor não informado"} · ~{selected.estimated_employees ?? "?"} colaboradores · Plano <span className="text-foreground font-semibold">{selected.plan || "free"}</span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link to="/empresa/convites" className="text-xs bg-foreground/5 hover:bg-foreground/10 px-3 py-2 rounded-lg font-heading font-semibold flex items-center gap-1.5">
                            Convite <span className="tabular-nums-data text-brand-gold">{selected.invite_code}</span>
                          </Link>
                          <Link to="/dashboard" className="text-xs bg-brand-magenta text-white px-3 py-2 rounded-lg font-heading font-bold flex items-center gap-1.5">
                            Ver painel <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-6">
                        <MiniStat label="Score atual" value={selected.last_score ?? "—"} color={riskColor(selected.last_risk)} />
                        <MiniStat label="Score médio" value={selected.avg_score ?? "—"} />
                        <MiniStat label="Diagnósticos" value={selected.assessment_count} />
                      </div>
                    </div>

                    {/* Trend chart */}
                    <div className="glass-card-strong rounded-2xl p-6">
                      <h4 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-brand-cyan" /> Evolução do risco global
                      </h4>
                      {selected.trend.length < 2 ? (
                        <p className="text-sm text-muted-foreground text-center py-10">
                          Ainda são necessários pelo menos 2 diagnósticos para desenhar a evolução.
                        </p>
                      ) : (
                        <ResponsiveContainer width="100%" height={220}>
                          <LineChart data={selected.trend.map((p) => ({ ...p, label: new Date(p.t).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) }))}>
                            <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                            <Line type="monotone" dataKey="score" stroke="hsl(var(--brand-magenta))" strokeWidth={2.5} dot={{ r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    {/* Top red flags */}
                    <div className="glass-card-strong rounded-2xl p-6">
                      <h4 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" /> Focos recorrentes de risco
                      </h4>
                      {selected.top_red_subscales.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">
                          Sem sinalizações vermelhas recorrentes. Excelente indicador.
                        </p>
                      ) : (
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart layout="vertical" data={selected.top_red_subscales} margin={{ left: 20 }}>
                            <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} allowDecimals={false} />
                            <YAxis type="category" dataKey="label" width={150} tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                              {selected.top_red_subscales.map((_, i) => (<Cell key={i} fill="hsl(0 84% 60%)" />))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    {/* Recommendation card */}
                    <div className="glass-card rounded-2xl p-5 border border-brand-gold/30">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-gold/15 flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4 text-brand-gold" />
                        </div>
                        <div>
                          <p className="font-heading font-bold text-sm text-foreground mb-1">Próximo passo recomendado</p>
                          <p className="text-sm text-muted-foreground">
                            {selected.last_risk === "vermelho"
                              ? "Convocar comitê NR-1 desta empresa em até 15 dias. Priorizar plano de ação para as 3 subescalas críticas destacadas acima."
                              : selected.assessment_count === 0
                              ? "Nenhum diagnóstico ainda. Compartilhe o código de convite com a liderança para iniciar as avaliações COPSOQ II."
                              : "Manter cadência trimestral de diagnósticos e observar tendência da linha acima. Sem alertas críticos no momento."}
                          </p>
                          <Link to="/nr1/avaliacao" className="inline-flex items-center gap-1 text-xs font-heading font-bold text-brand-gold mt-2 hover:underline">
                            Iniciar novo diagnóstico <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </section>
            </div>
          </>
        )}
      </main>
      <InstitutionalFooter />
    </div>
  );
}

function Kpi({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent?: "destructive" }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}<span className="text-[11px] uppercase tracking-wider font-heading font-bold">{label}</span>
      </div>
      <p className={`font-display text-2xl font-bold tabular-nums-data ${accent === "destructive" ? "text-destructive" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: React.ReactNode; color?: string }) {
  return (
    <div className="glass-card rounded-lg p-3 text-center">
      <p className="font-display text-2xl font-bold tabular-nums-data" style={{ color: color || "hsl(var(--foreground))" }}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export default function ConsultoriaDashboard() {
  return (
    <ProtectedRoute>
      <Inner />
    </ProtectedRoute>
  );
}
