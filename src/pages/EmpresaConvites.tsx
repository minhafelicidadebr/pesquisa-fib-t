import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Copy, Check, Download, QrCode, Sparkles, Loader2, Users,
  Activity, ShieldCheck, Share2, RefreshCcw, AlertTriangle,
} from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { getMyCompany, type Company } from "@/lib/companies";
import { supabase } from "@/integrations/supabase/client";

interface ResponseRow {
  id: string;
  sector: string | null;
  global_score: number | null;
  global_risk: string | null;
  created_at: string;
}

const K_ANON = 7;

const RISK_TONE: Record<string, string> = {
  baixo: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10",
  medio: "text-brand-gold border-brand-gold/40 bg-brand-gold/10",
  alto: "text-brand-magenta border-brand-magenta/40 bg-brand-magenta/10",
  critico: "text-red-300 border-red-400/40 bg-red-400/10",
};

export default function EmpresaConvites() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const surveyUrl = useMemo(
    () => (company ? `${window.location.origin}/pesquisa?code=${company.invite_code}` : ""),
    [company],
  );

  // Fetch company + responses
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    (async () => {
      const res = await getMyCompany();
      if (!res?.company) { toast.info("Cadastre sua empresa primeiro."); navigate("/empresa/configurar"); return; }
      setCompany(res.company);
      await loadResponses(res.company.id);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const loadResponses = async (companyId: string) => {
    const { data, error } = await supabase
      .from("public_survey_responses")
      .select("id, sector, global_score, global_risk, created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      toast.error("Não foi possível carregar respostas", { description: error.message });
      return;
    }
    setResponses((data ?? []) as ResponseRow[]);
  };

  // Generate QR (high-res PNG data URL) whenever url changes
  useEffect(() => {
    if (!surveyUrl) return;
    QRCode.toDataURL(surveyUrl, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 720,
      color: { dark: "#0a0a0f", light: "#ffffff" },
    }).then(setQrDataUrl).catch(() => setQrDataUrl(null));
  }, [surveyUrl]);

  // Realtime subscription
  useEffect(() => {
    if (!company) return;
    const channel = supabase
      .channel(`survey-${company.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "public_survey_responses", filter: `company_id=eq.${company.id}` },
        (payload) => {
          setResponses((prev) => [payload.new as ResponseRow, ...prev].slice(0, 500));
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [company]);

  const stats = useMemo(() => {
    const total = responses.length;
    const bySector = new Map<string, ResponseRow[]>();
    for (const r of responses) {
      const key = r.sector ?? "Não informado";
      const arr = bySector.get(key) ?? [];
      arr.push(r);
      bySector.set(key, arr);
    }
    const sectorRows = Array.from(bySector.entries()).map(([sector, rows]) => {
      const n = rows.length;
      const avg = n ? rows.reduce((s, r) => s + (r.global_score ?? 0), 0) / n : 0;
      const eligible = n >= K_ANON;
      const riskTally: Record<string, number> = {};
      for (const r of rows) {
        const k = r.global_risk ?? "—";
        riskTally[k] = (riskTally[k] ?? 0) + 1;
      }
      const dominantRisk = Object.entries(riskTally).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
      return { sector, n, avg, eligible, dominantRisk };
    }).sort((a, b) => b.n - a.n);

    const avg = total ? responses.reduce((s, r) => s + (r.global_score ?? 0), 0) / total : 0;
    const employees = company?.estimated_employees ?? 0;
    const coverage = employees ? Math.min(100, (total / employees) * 100) : 0;
    const last24h = responses.filter((r) => Date.now() - new Date(r.created_at).getTime() < 86_400_000).length;

    return { total, avg, coverage, last24h, sectorRows, employees };
  }, [responses, company]);

  const copy = async (text: string, which: "code" | "link") => {
    await navigator.clipboard.writeText(text);
    if (which === "code") { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 1800); }
    else { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 1800); }
    toast.success(which === "code" ? "Código copiado" : "Link copiado");
  };

  const downloadQR = () => {
    if (!qrDataUrl || !company) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `convite-${company.invite_code}.png`;
    a.click();
  };

  const refresh = async () => {
    if (!company) return;
    setRefreshing(true);
    await loadResponses(company.id);
    setRefreshing(false);
    toast.success("Atualizado");
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-brand-magenta/8 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-brand-cyan/8 rounded-full blur-[140px]" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-12 pt-28">
        <Link to="/empresa/configurar" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-heading mb-6">
          <ArrowLeft className="w-4 h-4" /> Configurar empresa
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-brand-magenta" />
            <span className="text-xs font-heading font-semibold uppercase tracking-widest text-brand-magenta">
              Convites & Pesquisa Anônima
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">
            Distribua, escute, agregue com privacidade
          </h1>
          <p className="text-muted-foreground font-body max-w-2xl">
            Compartilhe o link/QR da pesquisa COPSOQ II anônima e acompanhe o volume de respostas em tempo real, sempre respeitando k ≥ {K_ANON} por agregação.
          </p>
        </motion.div>

        {/* STAT STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
          {[
            { label: "Respostas totais", value: stats.total, icon: Activity, accent: "text-brand-cyan" },
            { label: "Últimas 24h", value: stats.last24h, icon: RefreshCcw, accent: "text-brand-gold" },
            { label: "Cobertura", value: `${stats.coverage.toFixed(0)}%`, icon: Users, accent: "text-brand-magenta" },
            { label: "Score médio", value: stats.total ? stats.avg.toFixed(1) : "—", icon: ShieldCheck, accent: "text-emerald-300" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="glass-card rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-widest font-heading text-muted-foreground">{s.label}</p>
                  <Icon className={`w-4 h-4 ${s.accent}`} />
                </div>
                <p className="font-display text-3xl font-bold text-foreground">{s.value}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          {/* QR / LINK PANEL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card-strong rounded-2xl p-6 border border-brand-magenta/25 bg-gradient-to-br from-brand-magenta/5 to-transparent"
          >
            <div className="flex items-center gap-2 mb-4">
              <QrCode className="w-4 h-4 text-brand-magenta" />
              <p className="text-xs uppercase tracking-widest font-heading text-brand-magenta/90">
                QR Code da pesquisa
              </p>
            </div>

            <div className="bg-white rounded-xl p-3 mb-4 grid place-items-center">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code da pesquisa anônima" className="w-full max-w-[260px] h-auto rounded" />
              ) : (
                <div className="w-[220px] h-[220px] grid place-items-center text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
            </div>

            <Button onClick={downloadQR} variant="outline" size="sm" className="w-full font-heading mb-3">
              <Download className="w-4 h-4 mr-1.5" /> Baixar PNG (alta resolução)
            </Button>

            <div className="space-y-2 pt-3 border-t border-border/30">
              <p className="text-[10px] uppercase tracking-widest font-heading text-muted-foreground">Código</p>
              <div className="flex items-center gap-2">
                <code className="font-mono text-lg font-bold tracking-[0.25em] flex-1 text-center bg-background/50 rounded-lg py-2">
                  {company?.invite_code}
                </code>
                <Button onClick={() => copy(company!.invite_code, "code")} size="icon" variant="ghost">
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              <p className="text-[10px] uppercase tracking-widest font-heading text-muted-foreground pt-2">Link público</p>
              <div className="flex items-center gap-2">
                <div className="font-mono text-[11px] truncate flex-1 bg-background/50 rounded-lg px-2 py-2">
                  {surveyUrl}
                </div>
                <Button onClick={() => copy(surveyUrl, "link")} size="icon" variant="ghost">
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </motion.div>

          {/* SECTOR RESPONSE BREAKDOWN */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2 glass-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-heading font-bold text-foreground">Respostas por setor</h2>
                <p className="text-xs text-muted-foreground">
                  k-anonimato: setores com n &lt; {K_ANON} não exibem score (apenas contagem).
                </p>
              </div>
              <Button onClick={refresh} size="sm" variant="outline" className="font-heading" disabled={refreshing}>
                {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <RefreshCcw className="w-3.5 h-3.5 mr-1.5" />}
                Atualizar
              </Button>
            </div>

            {stats.sectorRows.length === 0 ? (
              <div className="text-center py-16">
                <Activity className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="font-heading font-bold text-foreground">Nenhuma resposta ainda</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Compartilhe o QR ou o link em reuniões, e-mails, murais e canais internos. As respostas aparecerão aqui em tempo real.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.sectorRows.map((row) => {
                  const employees = stats.employees && stats.sectorRows.length > 0
                    ? Math.max(1, Math.round(stats.employees / stats.sectorRows.length))
                    : 0;
                  const pct = employees ? Math.min(100, (row.n / employees) * 100) : 0;
                  return (
                    <div key={row.sector} className="rounded-xl border border-border/40 p-4 bg-background/30">
                      <div className="flex items-center justify-between mb-2 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <p className="font-heading font-bold text-foreground truncate">{row.sector}</p>
                          {!row.eligible && (
                            <Badge variant="outline" className="gap-1 text-[10px] border-brand-gold/40 text-brand-gold">
                              <AlertTriangle className="w-3 h-3" /> k &lt; {K_ANON}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="font-mono text-[11px]">n = {row.n}</Badge>
                          {row.eligible && (
                            <Badge variant="outline" className={`capitalize text-[11px] ${RISK_TONE[row.dominantRisk] ?? ""}`}>
                              {row.dominantRisk}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="relative h-1.5 bg-background/60 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-cyan via-brand-magenta to-brand-gold"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {row.eligible && (
                        <p className="text-[11px] text-muted-foreground mt-2 font-mono">
                          Score médio: <span className="text-foreground font-bold">{row.avg.toFixed(1)}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-5 pt-5 border-t border-border/30 grid sm:grid-cols-2 gap-3">
              <Link
                to="/dashboard"
                className="rounded-xl border border-border/40 p-3 hover:border-brand-cyan/40 transition-colors group"
              >
                <p className="font-heading font-bold text-sm text-foreground group-hover:text-brand-cyan">
                  Ver dashboard executivo →
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Heatmaps e ações priorizadas
                </p>
              </Link>
              <Link
                to="/intervencoes"
                className="rounded-xl border border-border/40 p-3 hover:border-brand-magenta/40 transition-colors group"
              >
                <p className="font-heading font-bold text-sm text-foreground group-hover:text-brand-magenta">
                  Recomendar intervenções →
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  ILI score baseado nas respostas
                </p>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
