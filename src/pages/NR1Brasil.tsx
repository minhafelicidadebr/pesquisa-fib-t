import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Building2,
  Users,
  QrCode,
  FileBarChart,
  Activity,
  BookOpen,
  Layers,
  CheckCircle2,
  Clock,
  Copy,
  Share2,
  Scale,
  HeartPulse,
  Flame,
} from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { InstitutionalFooter } from "@/components/deck/InstitutionalFooter";
import { toast } from "sonner";

/**
 * /nr1-brasil — Campanha nacional de promoção da NR-1 (Saúde Mental no Trabalho)
 * Página pública, compartilhável, sem auth. Objetivo: converter empresas → cadastro SST.
 * Vigência plena da NR-1 (riscos psicossociais): 26/05/2025.
 */

const NR1_START = new Date("2025-05-26T00:00:00-03:00");

const PILLARS = [
  {
    icon: Scale,
    title: "Inventário de riscos psicossociais",
    desc: "Mapear exigências, controle, apoio, recompensa, ambiente ético e conflito trabalho-vida — com instrumento validado (COPSOQ II).",
    tag: "GRO/PGR",
  },
  {
    icon: HeartPulse,
    title: "Ação sobre causas, não sintomas",
    desc: "Intervenções organizacionais (job crafting, autonomia, clareza de papéis) antes de intervenções individuais.",
    tag: "Oxford Playbook 2.0",
  },
  {
    icon: Users,
    title: "Participação dos trabalhadores",
    desc: "Coleta anônima, agregação com k ≥ 7 e devolutiva pedagógica — sem exposição individual.",
    tag: "Privacy-by-design",
  },
  {
    icon: Flame,
    title: "Prevenção de adoecimento",
    desc: "Reduzir burnout, depressão, ansiedade e absenteísmo — indicadores auditáveis por fiscalização.",
    tag: "CID Z73 · F32 · F41",
  },
  {
    icon: FileBarChart,
    title: "Registro e rastreabilidade",
    desc: "DRPS (Diagnóstico de Riscos Psicossociais) emitido, versionado e vinculado ao PGR da empresa.",
    tag: "Compliance auditável",
  },
  {
    icon: ShieldCheck,
    title: "Reavaliação contínua",
    desc: "Ciclos de medir → intervir → reavaliar, com evolução visível no dashboard executivo.",
    tag: "Melhoria contínua",
  },
];

const STATS = [
  { value: "38 mi", label: "trabalhadores impactados no Brasil", accent: "text-brand-magenta" },
  { value: "R$ 68 bi", label: "custo anual estimado do adoecimento mental", accent: "text-brand-gold" },
  { value: "26 subescalas", label: "COPSOQ II mapeadas na plataforma", accent: "text-brand-cyan" },
  { value: "k ≥ 7", label: "agregação mínima para proteger o anonimato", accent: "text-brand-green" },
];

const JOURNEY = [
  { icon: Building2, title: "Cadastro da empresa", desc: "SST cria a organização e recebe o código de convite premium.", to: "/auth" },
  { icon: QrCode, title: "Convite anônimo aos colaboradores", desc: "QR code + link público. Sem login, sem coleta de identidade.", to: "/empresa/convites" },
  { icon: Activity, title: "Coleta COPSOQ II em tempo real", desc: "41 itens conversacionais. Dashboard atualiza ao vivo.", to: "/nr1/avaliacao" },
  { icon: Layers, title: "Matriz COPSOQ × Playbook × NR-1", desc: "Cruzamento científico entre risco, evidência e cláusula normativa.", to: "/matriz" },
  { icon: BookOpen, title: "Intervenções priorizadas por ILI", desc: "Ranking baseado em risco coberto, cobertura e effect size Oxford.", to: "/intervencoes" },
  { icon: FileBarChart, title: "DRPS pronto para fiscalização", desc: "Relatório PDF premium, versionado, auditável e integrável ao PGR.", to: "/relatorios" },
];

function useElapsed() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = now.getTime() - NR1_START.getTime();
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds, isPast: diff > 0 };
}

export default function NR1Brasil() {
  const t = useElapsed();
  const shareUrl = useMemo(() => (typeof window !== "undefined" ? `${window.location.origin}/nr1-brasil` : ""), []);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "NR-1 Brasil · Saúde Mental no Trabalho", url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copiado. Compartilhe com sua rede.");
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <AppNavbar />
      <main className="pt-24 pb-16">
        {/* HERO */}
        <section className="relative px-4 sm:px-6 pt-10 pb-20">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-brand-magenta/15 rounded-full blur-[160px] animate-pulse-glow" />
            <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-brand-cyan/10 rounded-full blur-[120px]" />
          </div>
          <div className="relative max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-magenta/10 border border-brand-magenta/30 mb-6"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-brand-magenta" />
              <span className="text-xs font-heading font-bold uppercase tracking-[0.18em] text-brand-magenta">
                NR-1 · Campanha Nacional · Saúde Mental no Trabalho
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-foreground leading-[1.05] mb-6"
            >
              A NR-1 já é lei.<br />
              <span className="text-gradient-magenta">Sua empresa já mediu?</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              A obrigatoriedade de identificar, avaliar e controlar <strong className="text-foreground">riscos psicossociais</strong> está em vigor no Brasil. A plataforma <strong className="text-foreground">Felicidade para Todos</strong> entrega o ciclo completo — do questionário anônimo COPSOQ II ao DRPS auditável — em uma jornada premium, científica e humana.
            </motion.p>

            {/* Contador de vigência */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-10 inline-flex items-center gap-4 px-6 py-4 rounded-2xl bg-card/60 backdrop-blur-md border border-white/10 shadow-elevated"
            >
              <Clock className="w-5 h-5 text-brand-magenta" />
              <div className="text-left">
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-heading font-bold">
                  {t.isPast ? "Em vigor há" : "Entra em vigor em"}
                </div>
                <div className="font-display text-2xl md:text-3xl font-bold tabular-nums text-foreground">
                  {Math.abs(t.days)}d <span className="text-muted-foreground">·</span> {String(Math.abs(t.hours)).padStart(2, "0")}h{" "}
                  <span className="text-muted-foreground">·</span> {String(Math.abs(t.minutes)).padStart(2, "0")}m{" "}
                  <span className="text-brand-magenta">{String(Math.abs(t.seconds)).padStart(2, "0")}s</span>
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 bg-brand-magenta text-white font-heading font-bold px-8 py-4 rounded-xl glow-magenta hover:scale-[1.02] transition-transform"
              >
                Cadastrar minha empresa <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/nr1/avaliacao"
                className="inline-flex items-center justify-center gap-2 border border-foreground/20 text-foreground font-heading font-semibold px-8 py-4 rounded-xl hover:bg-foreground/5 transition-colors"
              >
                Fazer avaliação agora <Sparkles className="w-4 h-4 text-brand-gold" />
              </Link>
              <button
                onClick={share}
                className="inline-flex items-center justify-center gap-2 border border-brand-cyan/40 text-brand-cyan font-heading font-semibold px-6 py-4 rounded-xl hover:bg-brand-cyan/10 transition-colors"
              >
                <Share2 className="w-4 h-4" /> Compartilhar
              </button>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="p-5 rounded-2xl bg-card/50 backdrop-blur border border-white/10 text-center"
              >
                <div className={`font-display text-3xl md:text-4xl font-bold ${s.accent}`}>{s.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-2 leading-snug">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 6 PILARES */}
        <section className="px-4 sm:px-6 max-w-6xl mx-auto mt-24">
          <div className="text-center mb-12">
            <div className="text-xs font-heading font-bold uppercase tracking-widest text-brand-cyan mb-3">
              O que a NR-1 exige, na prática
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
              Seis pilares que sua empresa precisa cumprir
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PILLARS.map((p, i) => (
              <motion.article
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group p-6 rounded-2xl bg-card/50 backdrop-blur border border-white/10 hover:border-brand-magenta/40 hover:shadow-elevated transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-magenta/10 border border-brand-magenta/30 flex items-center justify-center mb-4 group-hover:glow-magenta">
                  <p.icon className="w-5 h-5 text-brand-magenta" />
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                  <CheckCircle2 className="w-3 h-3 text-brand-green" />
                  <span className="text-[10px] uppercase tracking-widest font-heading font-bold text-muted-foreground">{p.tag}</span>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* JORNADA SaaS */}
        <section className="px-4 sm:px-6 max-w-6xl mx-auto mt-24">
          <div className="text-center mb-12">
            <div className="text-xs font-heading font-bold uppercase tracking-widest text-brand-gold mb-3">
              Como a plataforma entrega
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
              Da coleta anônima ao <span className="text-gradient-gold">DRPS auditável</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Fluxo SaaS multi-tenant. Cada empresa opera em seu próprio espaço, com RLS, privacidade por design e ciclo completo Medir → Intervir → Reavaliar.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {JOURNEY.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="relative p-6 rounded-2xl bg-gradient-to-br from-card/70 to-card/30 border border-white/10 backdrop-blur hover:border-brand-cyan/40 transition-all"
              >
                <div className="absolute top-4 right-5 font-display text-4xl font-bold text-white/5 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="w-11 h-11 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center mb-4">
                  <step.icon className="w-5 h-5 text-brand-cyan" />
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.desc}</p>
                <Link
                  to={step.to}
                  className="inline-flex items-center gap-1.5 text-sm font-heading font-bold text-brand-cyan hover:gap-2.5 transition-all"
                >
                  Explorar <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SELO */}
        <section className="px-4 sm:px-6 max-w-4xl mx-auto mt-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-brand-gold/30 bg-gradient-to-br from-brand-charcoal via-card to-brand-charcoal p-8 md:p-12"
          >
            <div className="absolute inset-0 bg-gradient-gold opacity-10" />
            <div className="relative grid md:grid-cols-[auto_1fr] gap-8 items-center">
              <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full bg-gradient-gold flex items-center justify-center shadow-glow-gold">
                <ShieldCheck className="w-16 h-16 md:w-20 md:h-20 text-brand-charcoal" />
              </div>
              <div className="text-center md:text-left">
                <div className="text-xs font-heading font-bold uppercase tracking-widest text-brand-gold mb-3">Selo institucional</div>
                <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                  Empresa em Conformidade NR-1
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Ao completar o ciclo COPSOQ II + intervenções ILI + DRPS, sua empresa recebe o <strong className="text-foreground">selo digital compartilhável</strong> — reconhecimento de compromisso público com saúde mental no trabalho.
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-2 bg-brand-gold text-brand-charcoal font-heading font-bold px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform"
                  >
                    Quero o selo <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      toast.success("Link da campanha copiado.");
                    }}
                    className="inline-flex items-center gap-2 border border-brand-gold/40 text-brand-gold font-heading font-semibold px-6 py-3 rounded-xl hover:bg-brand-gold/10 transition-colors"
                  >
                    <Copy className="w-4 h-4" /> Copiar link
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* CTA FINAL */}
        <section className="px-4 sm:px-6 max-w-4xl mx-auto mt-24 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            A hora é <span className="text-gradient-magenta">agora</span>.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            A cada dia sem diagnóstico psicossocial, sua empresa acumula risco jurídico, financeiro e humano. Comece o ciclo em 3 minutos.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-brand-magenta text-white font-heading font-bold px-10 py-5 rounded-xl glow-magenta text-lg hover:scale-[1.02] transition-transform"
          >
            Cadastrar empresa gratuitamente <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </main>
      <InstitutionalFooter />
    </div>
  );
}
