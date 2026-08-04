import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Users, AlertTriangle, ShieldCheck, MessageSquare, ExternalLink, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { getMyCompany } from "@/lib/companies";
import { fetchSurveyAggregate, K_ANON, type SurveyAggregate } from "@/lib/publicSurveyAnalytics";
import { supabase } from "@/integrations/supabase/client";
import { SectorAggregatesPanel } from "@/components/dashboard/SectorAggregatesPanel";

const RISK_BG: Record<string, string> = {
  verde: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  amarelo: "bg-brand-gold/15 text-brand-gold border-brand-gold/30",
  vermelho: "bg-brand-magenta/15 text-brand-magenta border-brand-magenta/30",
};

function heatCell(score: number): string {
  // 0 (green) → 100 (red)
  if (score < 33.33) return "bg-emerald-500/70 text-white";
  if (score < 50) return "bg-emerald-500/40 text-foreground";
  if (score < 66.66) return "bg-brand-gold/60 text-foreground";
  if (score < 80) return "bg-brand-magenta/60 text-white";
  return "bg-brand-magenta/90 text-white";
}

export function SurveyTab() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [agg, setAgg] = useState<SurveyAggregate | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async (id: string) => {
    try {
      const a = await fetchSurveyAggregate(id);
      setAgg(a);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    }
  };

  useEffect(() => {
    (async () => {
      const res = await getMyCompany();
      if (!res?.company) { setLoading(false); setError("no_company"); return; }
      setCompanyId(res.company.id);
      await load(res.company.id);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!companyId) return;
    const ch = supabase
      .channel(`survey-dash-${companyId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "public_survey_responses", filter: `company_id=eq.${companyId}` },
        () => { load(companyId); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [companyId]);

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-magenta" /></div>;

  if (error === "no_company") return (
    <div className="glass-card rounded-2xl p-8 text-center">
      <p className="font-heading font-bold text-foreground">Cadastre sua empresa primeiro</p>
      <Link to="/empresa/configurar" className="text-brand-cyan font-heading text-sm hover:underline mt-2 inline-block">Ir para configuração →</Link>
    </div>
  );

  if (!agg || agg.totalResponses === 0) return (
    <div className="glass-card rounded-2xl p-10 text-center">
      <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
      <p className="font-heading font-bold text-foreground">Nenhuma resposta ainda</p>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
        Compartilhe o QR/link da pesquisa anônima COPSOQ II com sua equipe — as agregações aparecem aqui em tempo real.
      </p>
      <Link to="/empresa/convites" className="inline-flex items-center gap-2 mt-5 gradient-gold text-primary-foreground font-heading font-bold px-5 py-2.5 rounded-xl">
        Gerar QR & link <ExternalLink className="w-4 h-4" />
      </Link>
    </div>
  );

  const eligibleSectors = agg.sectors.filter((s) => s.eligible);
  const hiddenCount = agg.sectors.length - eligibleSectors.length;

  // Heatmap subscale columns: top 10 critical (highest avg score across company)
  const topSubs = agg.subscales.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KStat label="Respostas" value={agg.totalResponses} icon={Users} accent="text-brand-cyan" />
        <KStat label="Setores válidos" value={`${eligibleSectors.length}/${agg.sectors.length}`} sub={hiddenCount ? `${hiddenCount} ocultos (k<${K_ANON})` : ""} icon={ShieldCheck} accent="text-emerald-300" />
        <KStat label="Score global" value={agg.globalScore.toFixed(1)} sub="0 ótimo · 100 crítico" icon={AlertTriangle} accent="text-brand-magenta" />
        <KStat label="Risco global" value={agg.globalRisk.toUpperCase()} sub={agg.lastUpdated ? new Date(agg.lastUpdated).toLocaleString("pt-BR") : ""} icon={RefreshCcw} accent="text-brand-gold" />
      </div>

      {/* Top critical subscales (company-wide) */}
      <div className="glass-card-strong rounded-2xl p-6">
        <h3 className="font-heading font-bold text-foreground mb-4">Subescalas mais críticas (toda a empresa)</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {topSubs.map((s, i) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`flex items-center justify-between rounded-xl border p-3 ${RISK_BG[s.classification]}`}
            >
              <div className="min-w-0">
                <p className="font-heading font-bold text-sm truncate">{s.label}</p>
                <p className="text-[11px] opacity-70">{s.dimension}</p>
              </div>
              <span className="font-mono font-bold text-base tabular-nums-data">{s.score.toFixed(0)}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Heatmap sector × subscale */}
      {eligibleSectors.length > 0 ? (
        <div className="glass-card-strong rounded-2xl p-6 overflow-x-auto">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div>
              <h3 className="font-heading font-bold text-foreground">Heatmap setor × subescala</h3>
              <p className="text-xs text-muted-foreground">Verde = baixo risco · vermelho = intervenção urgente. Apenas setores com n ≥ {K_ANON}.</p>
            </div>
            <button
              onClick={async () => { if (!companyId) return; setRefreshing(true); await load(companyId); setRefreshing(false); }}
              className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
            >
              {refreshing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCcw className="w-3 h-3" />} Atualizar
            </button>
          </div>
          <table className="w-full text-xs border-separate border-spacing-1 min-w-[640px]">
            <thead>
              <tr>
                <th className="text-left font-heading font-bold text-muted-foreground sticky left-0 bg-background pr-2">Setor</th>
                {topSubs.map((s) => (
                  <th key={s.key} className="text-left font-heading text-[10px] text-muted-foreground font-semibold whitespace-nowrap px-1 max-w-[80px] truncate" title={s.label}>
                    {s.label}
                  </th>
                ))}
                <th className="text-right font-heading text-[10px] text-muted-foreground">n</th>
              </tr>
            </thead>
            <tbody>
              {eligibleSectors.map((sec) => {
                const map = new Map(sec.subscales.map((s) => [s.key, s.score]));
                return (
                  <tr key={sec.sector}>
                    <td className="font-heading font-bold text-foreground py-1.5 pr-2 truncate max-w-[160px]">{sec.sector}</td>
                    {topSubs.map((col) => {
                      const v = map.get(col.key);
                      return (
                        <td key={col.key} className={`text-center font-mono font-bold rounded-md ${v !== undefined ? heatCell(v) : "bg-muted/30 text-muted-foreground"}`} title={`${col.label}: ${v?.toFixed(1) ?? "—"}`}>
                          {v !== undefined ? v.toFixed(0) : "—"}
                        </td>
                      );
                    })}
                    <td className="text-right font-mono text-muted-foreground">{sec.n}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-6 border border-brand-gold/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-brand-gold mt-0.5 shrink-0" />
            <div>
              <p className="font-heading font-bold text-foreground">Heatmap por setor bloqueado por privacidade</p>
              <p className="text-xs text-muted-foreground mt-1">
                Nenhum setor atingiu o limiar k ≥ {K_ANON}. Continue coletando respostas para destravar a análise segmentada. Os indicadores globais acima já estão disponíveis.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-3">
        <Link to="/empresa/convites" className="rounded-xl border border-border/40 p-4 hover:border-brand-magenta/40 transition-colors group">
          <p className="font-heading font-bold text-sm text-foreground group-hover:text-brand-magenta">Ampliar alcance →</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">QR & link da pesquisa</p>
        </Link>
        <Link to="/intervencoes" className="rounded-xl border border-border/40 p-4 hover:border-brand-cyan/40 transition-colors group">
          <p className="font-heading font-bold text-sm text-foreground group-hover:text-brand-cyan">Recomendar intervenções →</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">ILI score sobre estes dados</p>
        </Link>
        <Link to="/relatorios/pdf-intelligence" className="rounded-xl border border-border/40 p-4 hover:border-brand-gold/40 transition-colors group">
          <p className="font-heading font-bold text-sm text-foreground group-hover:text-brand-gold">Análise documental →</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">PGR · DRPS · ASO via IA</p>
        </Link>
      </div>
    </div>
  );
}

function KStat({ label, value, sub, icon: Icon, accent }: { label: string; value: string | number; sub?: string; icon: React.ElementType; accent: string }) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-widest font-heading text-muted-foreground">{label}</p>
        <Icon className={`w-4 h-4 ${accent}`} />
      </div>
      <p className="font-display text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-1 truncate">{sub}</p>}
    </div>
  );
}
