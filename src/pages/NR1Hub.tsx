import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowRight, Sparkles, Calendar, FileCheck2, AlertTriangle, ShieldCheck } from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { InstitutionalFooter } from "@/components/deck/InstitutionalFooter";
import { useAuth } from "@/hooks/useAuth";
import { listNR1, NR1Record } from "@/lib/nr1Assessments";

const riskColor: Record<string, string> = {
  vermelho: "hsl(0 84% 60%)",
  amarelo: "hsl(43 100% 52%)",
  verde: "hsl(142 71% 45%)",
};
const riskLabel: Record<string, string> = {
  vermelho: "Risco alto",
  amarelo: "Atenção",
  verde: "Risco baixo",
};

export default function NR1Hub() {
  const { user } = useAuth();
  const [items, setItems] = useState<NR1Record[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    listNR1().then((d) => { setItems(d); setLoading(false); });
  }, [user]);

  const latest = items[0];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <AppNavbar />
      <main className="pt-24 pb-16 px-4 sm:px-6">
        {/* Hero */}
        <section className="relative max-w-5xl mx-auto text-center pt-12 pb-16">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-magenta/15 rounded-full blur-[140px] animate-pulse-glow" />
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-magenta/10 border border-brand-magenta/30 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-brand-magenta" />
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-brand-magenta">NR-1 · Saúde Mental no Trabalho</span>
            </div>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-magenta/10 border border-brand-magenta/30 mb-8 glow-magenta">
              <ShieldAlert className="w-10 h-10 text-brand-magenta" />
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 leading-[1.1]">
              Avaliação <span className="text-gradient-magenta">COPSOQ II</span> conduzida pela NORA
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              41 itens, 26 subescalas, classificação semafórica oficial. Diagnóstico psicossocial validado internacionalmente, traduzido para o vocabulário e a urgência da <strong className="text-foreground">NR-1 brasileira</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
              <Link to="/nr1/avaliacao" className="inline-flex items-center justify-center gap-2 bg-brand-magenta text-white font-heading font-bold px-8 py-4 rounded-xl glow-magenta">
                {latest ? "Refazer avaliação" : "Iniciar com a NORA"} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/diagnostico" className="inline-flex items-center justify-center gap-2 border border-foreground/20 text-foreground font-heading font-semibold px-8 py-4 rounded-xl hover:bg-foreground/5 transition-colors">
                Ver também o FIB-T (FIBia)
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-6">🔒 Confidencial · 8-10 min · Referência: Kristensen, T. (2001) / Silva et al., 2011</p>
          </motion.div>
        </section>

        {/* Pilares NR-1 */}
        <section className="max-w-5xl mx-auto mb-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-10">O que entregamos para o seu PGR</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: ShieldCheck, title: "Identificação científica", desc: "26 fatores psicossociais COPSOQ II classificados por semáforo oficial (verde/amarelo/vermelho)." },
              { icon: AlertTriangle, title: "Avaliação e priorização", desc: "Red flags e green flags por dimensão (Exigências, Liderança, Valores, Saúde, Indivíduo)." },
              { icon: FileCheck2, title: "Plano de controle", desc: "Recomendações priorizadas (alta/média/baixa) com horizontes de 7, 30 e 90 dias para o PGR." },
            ].map((c, i) => (
              <motion.div key={c.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="glass-card rounded-2xl p-6">
                <c.icon className="w-6 h-6 text-brand-magenta mb-3" />
                <h3 className="font-heading font-bold text-foreground mb-1.5">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Histórico */}
        {user && !loading && (
          <section className="max-w-5xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">Seu histórico NR-1</h2>
            {items.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">
                Você ainda não realizou nenhuma avaliação COPSOQ II. Comece agora — leva cerca de 8 minutos.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="glass-card rounded-2xl p-5 flex items-center justify-between hover:border-brand-magenta/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${riskColor[a.global_risk]}22`, border: `1px solid ${riskColor[a.global_risk]}55` }}>
                        <Calendar className="w-5 h-5" style={{ color: riskColor[a.global_risk] }} />
                      </div>
                      <div>
                        <p className="font-heading font-bold text-foreground text-sm">{new Date(a.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
                        <p className="text-xs" style={{ color: riskColor[a.global_risk] }}>{riskLabel[a.global_risk]}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl font-bold tabular-nums-data" style={{ color: riskColor[a.global_risk] }}>{Number(a.global_score).toFixed(1)}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Risco global</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        )}

        {!user && (
          <section className="max-w-3xl mx-auto mt-12">
            <div className="glass-card-strong rounded-2xl p-8 text-center">
              <p className="text-foreground mb-4">
                <strong>Faça login</strong> para que suas avaliações fiquem salvas e formem trilha auditável para o PGR.
              </p>
              <Link to="/auth" className="inline-flex items-center gap-2 bg-brand-magenta text-white font-heading font-bold px-6 py-3 rounded-xl glow-magenta">
                Entrar / Criar conta <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}
      </main>
      <InstitutionalFooter />
    </div>
  );
}
