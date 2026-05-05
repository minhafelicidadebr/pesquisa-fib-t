import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Stethoscope, Sparkles, ArrowRight, Calendar, BarChart3, MessageCircle } from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { InstitutionalFooter } from "@/components/deck/InstitutionalFooter";
import { useAuth } from "@/hooks/useAuth";
import { listAssessments, AssessmentRecord } from "@/lib/fibAssessments";

export default function Diagnostico() {
  const { user } = useAuth();
  const [items, setItems] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    listAssessments().then((d) => { setItems(d); setLoading(false); });
  }, [user]);

  const latest = items[0];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <AppNavbar />
      <main className="pt-24 pb-16 px-4 sm:px-6">
        {/* Hero */}
        <section className="relative max-w-5xl mx-auto text-center pt-12 pb-16">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-gold/15 rounded-full blur-[140px] animate-pulse-glow" />
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 border border-brand-gold/30 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-brand-gold">Mensurar</span>
            </div>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-gold/10 border border-brand-gold/30 mb-8 glow-gold">
              <Stethoscope className="w-10 h-10 text-brand-gold" />
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 leading-[1.1]">
              Diagnóstico <span className="text-gradient-gold">FIB-T</span> conversacional
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              32 questões científicas das 4 lentes (COPSOQ III, FIB-T, PERMA+V, VIA) conduzidas pela FIBia. Radar interativo, leitura executiva e plano 90-365 dias salvos no seu painel.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
              <Link to="/fibia" className="inline-flex items-center justify-center gap-2 gradient-gold text-primary-foreground font-heading font-bold px-8 py-4 rounded-xl glow-gold">
                {latest ? "Refazer diagnóstico" : "Iniciar agora com a FIBia"} <ArrowRight className="w-4 h-4" />
              </Link>
              {user && latest && (
                <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 border border-foreground/20 text-foreground font-heading font-semibold px-8 py-4 rounded-xl hover:bg-foreground/5 transition-colors">
                  Ver meu painel
                </Link>
              )}
            </div>
          </motion.div>
        </section>

        {/* Histórico do usuário */}
        {user && !loading && (
          <section className="max-w-5xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">Seu histórico</h2>
            {items.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">
                Você ainda não realizou nenhum diagnóstico. Comece agora — leva cerca de 7 minutos.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="glass-card rounded-2xl p-5 flex items-center justify-between hover:border-brand-gold/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-brand-gold" />
                      </div>
                      <div>
                        <p className="font-heading font-bold text-foreground text-sm">{new Date(a.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
                        <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl font-bold text-gradient-gold tabular-nums-data">{Number(a.fib_score).toFixed(1)}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">FIB Score</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* CTA secundário se não logado */}
        {!user && (
          <section className="max-w-3xl mx-auto mt-12">
            <div className="glass-card-strong rounded-2xl p-8 text-center">
              <p className="text-foreground mb-4">
                <strong>Faça login</strong> para que seus diagnósticos fiquem salvos e você possa acompanhar sua evolução ao longo do tempo.
              </p>
              <Link to="/auth" className="inline-flex items-center gap-2 gradient-gold text-primary-foreground font-heading font-bold px-6 py-3 rounded-xl">
                Entrar / Criar conta <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}

        {/* Capacidades */}
        <section className="max-w-5xl mx-auto mt-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-10">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: MessageCircle, title: "Conversa, não formulário", desc: "A FIBia conduz cada pergunta de forma adaptativa, com economia comportamental embutida." },
              { icon: BarChart3, title: "Radar das 4 lentes", desc: "Visualização premium dos índices COPSOQ, FIB-T, PERMA+V e VIA com benchmarks." },
              { icon: Sparkles, title: "Plano 90-365 dias", desc: "Recomendações priorizadas pelo framework Oxford WWP 2.0 (DRIVER), ancoradas em evidência." },
            ].map((c, i) => (
              <motion.div key={c.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="glass-card rounded-2xl p-6">
                <c.icon className="w-6 h-6 text-brand-gold mb-3" />
                <h3 className="font-heading font-bold text-foreground mb-1.5">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <InstitutionalFooter />
    </div>
  );
}
