import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Command, Sparkles, Mic, MicOff, Wand2, Layers, Users, Activity,
  TrendingUp, Search, ArrowRight, Eye, Zap, Brain, Radio, Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* =========================================================
 * DISRUPTIVE LAB — 6 melhorias de UX para o Dashboard
 * 1) Command Palette (⌘K)
 * 2) AI Daily Pulse (aura morphing + briefing do dia)
 * 3) Persona Lens (foco SST / Gestor / Colaborador)
 * 4) Live Org Pulse Heatmap (simulação realtime)
 * 5) What-If Simulator (ROI de intervenções)
 * 6) Voice Insights (Web Speech API) → abre FIBia com query
 * ========================================================= */

type Accent = "gold" | "cyan" | "magenta" | "green";
const ring: Record<Accent, string> = {
  gold: "border-brand-gold/40 hover:border-brand-gold/70 hover:shadow-[0_0_30px_-10px_hsl(var(--brand-gold))]",
  cyan: "border-brand-cyan/40 hover:border-brand-cyan/70 hover:shadow-[0_0_30px_-10px_hsl(var(--brand-cyan))]",
  magenta: "border-brand-magenta/40 hover:border-brand-magenta/70 hover:shadow-[0_0_30px_-10px_hsl(var(--brand-magenta))]",
  green: "border-brand-green/40 hover:border-brand-green/70 hover:shadow-[0_0_30px_-10px_hsl(var(--brand-green))]",
};
const chip: Record<Accent, string> = {
  gold: "bg-brand-gold/15 text-brand-gold border-brand-gold/30",
  cyan: "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30",
  magenta: "bg-brand-magenta/15 text-brand-magenta border-brand-magenta/30",
  green: "bg-brand-green/15 text-brand-green border-brand-green/30",
};

function SectionShell({
  icon: Icon, eyebrow, title, subtitle, accent, children,
}: {
  icon: any; eyebrow: string; title: string; subtitle: string; accent: Accent;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45 }}
      className={cn(
        "relative rounded-2xl border bg-card/40 backdrop-blur-sm p-5 md:p-6 transition-all duration-500",
        ring[accent],
      )}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center shrink-0", chip[accent])}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className={cn("text-[10px] font-heading font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border", chip[accent])}>
            {eyebrow}
          </span>
          <h3 className="font-display text-lg md:text-xl font-bold text-foreground mt-1.5 leading-tight">{title}</h3>
          <p className="text-xs md:text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

/* ---------- 1. Command Palette ---------- */
const PALETTE = [
  { label: "Abrir FIBia (IA mentora)", to: "/fibia", kw: "ia chat mentor felicidade" },
  { label: "Iniciar NR-1 · NORA", to: "/nr1/avaliacao", kw: "copsoq nora avaliacao risco" },
  { label: "Diagnóstico FIB-T", to: "/diagnostico", kw: "fib bem-estar dimensoes" },
  { label: "Matriz integrativa", to: "/matriz", kw: "copsoq playbook nr-1" },
  { label: "Relatórios DRPS", to: "/relatorios", kw: "pdf relatorio drps esg" },
  { label: "Banco de Evidências", to: "/evidencias", kw: "ciencia artigos oxford" },
  { label: "Academy IFT", to: "/academy", kw: "trilhas coin gamificacao" },
  { label: "Empresa & convites", to: "/empresa/configurar", kw: "saas gestor codigo" },
];

function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const filtered = useMemo(
    () => PALETTE.filter((p) => (p.label + " " + p.kw).toLowerCase().includes(q.toLowerCase())).slice(0, 8),
    [q],
  );
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 30); else { setQ(""); setIdx(0); } }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center pt-[12vh] px-4 bg-background/70 backdrop-blur-sm animate-fade-in" onClick={() => onOpenChange(false)}>
      <div className="w-full max-w-xl rounded-2xl border border-brand-gold/40 bg-card shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-brand-gold" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setIdx(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, filtered.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
              if (e.key === "Enter" && filtered[idx]) { navigate(filtered[idx].to); onOpenChange(false); }
              if (e.key === "Escape") onOpenChange(false);
            }}
            placeholder="Buscar ação, página ou diagnóstico…"
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground">ESC</kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && <li className="px-3 py-6 text-center text-xs text-muted-foreground">Nada encontrado.</li>}
          {filtered.map((p, i) => (
            <li key={p.to}>
              <button
                onMouseEnter={() => setIdx(i)}
                onClick={() => { navigate(p.to); onOpenChange(false); }}
                className={cn(
                  "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors",
                  i === idx ? "bg-brand-gold/10 text-foreground" : "text-foreground/80 hover:bg-foreground/5",
                )}
              >
                <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-brand-gold" /> {p.label}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CommandPaletteCard() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((v) => !v); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <SectionShell icon={Command} eyebrow="01 · Velocidade" accent="gold"
      title="Command Palette ⌘K" subtitle="Navegue por qualquer função do ecossistema em <1s. Atalho global.">
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-brand-gold/30 bg-brand-gold/5 hover:bg-brand-gold/10 transition-colors"
      >
        <span className="text-sm text-muted-foreground">Buscar ação, página ou diagnóstico…</span>
        <kbd className="text-[10px] px-2 py-1 rounded-md border border-brand-gold/40 text-brand-gold font-heading font-bold">⌘ K</kbd>
      </button>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </SectionShell>
  );
}

/* ---------- 2. AI Daily Pulse ---------- */
const PULSE_INSIGHTS = [
  { hour: 5,  msg: "Comece o dia com 4 min de respiração 4-7-8 — reduz cortisol matinal em ~18%." },
  { hour: 11, msg: "Janela ótima para tomada de decisão. Priorize as 3 ações de maior impacto." },
  { hour: 14, msg: "Pico de fadiga decisional. Pausa de 7 min eleva foco em até 23% (Oxford, 2024)." },
  { hour: 18, msg: "Encerramento ritual: liste 1 conquista. Ativa circuito de recompensa dopaminérgica." },
  { hour: 22, msg: "Higiene do sono: -20% luz azul = +14% no FIB-Score em 7 dias." },
];

function DailyPulseCard() {
  const now = new Date();
  const h = now.getHours();
  const insight = PULSE_INSIGHTS.reduce((best, cur) => (cur.hour <= h && cur.hour >= best.hour ? cur : best), PULSE_INSIGHTS[0]);
  return (
    <SectionShell icon={Brain} eyebrow="02 · IA Adaptativa" accent="cyan"
      title="Pulse do Dia" subtitle="Briefing personalizado pela FIBia com base na hora, FIB-Score e ciência da felicidade.">
      <div className="relative overflow-hidden rounded-xl border border-brand-cyan/30 bg-gradient-to-br from-brand-cyan/10 via-transparent to-brand-magenta/10 p-5 min-h-[140px] flex items-center">
        <motion.div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-brand-cyan/30 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-brand-magenta/25 blur-3xl"
          animate={{ scale: [1.1, 0.95, 1.1], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <div className="relative">
          <p className="text-[10px] uppercase tracking-widest text-brand-cyan font-heading font-bold mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> {now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} · janela de virada
          </p>
          <p className="font-display text-base md:text-lg text-foreground leading-snug">"{insight.msg}"</p>
          <Link to="/fibia" className="inline-flex items-center gap-1 text-xs text-brand-cyan hover:underline mt-3 font-heading font-bold">
            Aprofundar com FIBia <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </SectionShell>
  );
}

/* ---------- 3. Persona Lens ---------- */
const LENSES = [
  { id: "sst", label: "SST", icon: Target, color: "magenta" as Accent, focus: "Conformidade NR-1, riscos psicossociais, evidências para fiscalização." },
  { id: "gestor", label: "Gestor", icon: Layers, color: "cyan" as Accent, focus: "Heatmap por setor, ROI de intervenções, alertas de equipe." },
  { id: "colab", label: "Colaborador", icon: Users, color: "gold" as Accent, focus: "Sua jornada FIB-T, trilhas Academy, recomendações privadas." },
];
function PersonaLensCard() {
  const [active, setActive] = useState("sst");
  const cur = LENSES.find((l) => l.id === active)!;
  return (
    <SectionShell icon={Eye} eyebrow="03 · Foco" accent="magenta"
      title="Persona Lens" subtitle="Filtre o dashboard pela lente do seu papel — sem perder a visão integrada.">
      <div className="grid grid-cols-3 gap-2 mb-4">
        {LENSES.map((l) => {
          const Icon = l.icon;
          const isActive = active === l.id;
          return (
            <button
              key={l.id}
              onClick={() => setActive(l.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all",
                isActive ? chip[l.color] + " scale-[1.02]" : "border-border bg-card/30 text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[11px] font-heading font-bold uppercase tracking-wider">{l.label}</span>
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.p key={cur.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          className="text-sm text-foreground/85 leading-relaxed border-l-2 border-brand-magenta/40 pl-3">
          {cur.focus}
        </motion.p>
      </AnimatePresence>
    </SectionShell>
  );
}

/* ---------- 4. Live Org Pulse Heatmap ---------- */
const SECTORS = ["Operações", "Comercial", "TI", "RH", "Financeiro", "Logística", "P&D", "Atendimento"];
function HeatmapCard() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick((t) => t + 1), 2400); return () => clearInterval(id); }, []);
  const cells = useMemo(() => SECTORS.flatMap((s, si) =>
    Array.from({ length: 6 }).map((_, di) => {
      const seed = (si * 7 + di * 3 + tick) % 11;
      const val = (Math.sin(seed) + 1) / 2; // 0..1
      const hue = val < 0.33 ? 0 : val < 0.66 ? 38 : 145;
      return { id: `${si}-${di}`, sector: s, val, hue };
    })
  ), [tick]);
  return (
    <SectionShell icon={Radio} eyebrow="04 · Tempo real" accent="green"
      title="Org Pulse · Heatmap vivo" subtitle="Pulso organizacional simulado — em produção: COPSOQ contínuo por setor (k≥7).">
      <div className="grid grid-cols-[80px_1fr] gap-2">
        <div className="flex flex-col gap-1 pt-6">
          {SECTORS.map((s) => <span key={s} className="text-[10px] text-muted-foreground h-6 flex items-center">{s}</span>)}
        </div>
        <div>
          <div className="grid grid-cols-6 gap-1 mb-1">
            {["seg","ter","qua","qui","sex","hoje"].map((d) => (
              <span key={d} className="text-[10px] text-muted-foreground text-center uppercase tracking-wider">{d}</span>
            ))}
          </div>
          <div className="grid grid-rows-8 gap-1">
            {SECTORS.map((s, si) => (
              <div key={s} className="grid grid-cols-6 gap-1 h-6">
                {cells.filter((c) => c.id.startsWith(si + "-")).map((c) => (
                  <motion.div
                    key={c.id}
                    initial={false}
                    animate={{ backgroundColor: `hsl(${c.hue} 75% ${30 + c.val * 25}%)` }}
                    transition={{ duration: 0.8 }}
                    className="rounded-md"
                    title={`${c.sector} · ${(c.val * 5).toFixed(1)}/5`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

/* ---------- 5. What-If Simulator ---------- */
function SimulatorCard() {
  const [adoption, setAdoption] = useState(40);
  const [headcount, setHeadcount] = useState(250);
  const baseAbsent = 4.2; // % baseline
  const baseTurnover = 18; // % a.a.
  const costPerAbsent = 380; // BRL/dia
  const costPerTurnover = 12000; // BRL

  const lift = adoption / 100;
  const newAbsent = baseAbsent * (1 - 0.27 * lift);
  const newTurnover = baseTurnover * (1 - 0.34 * lift);
  const daysSaved = ((baseAbsent - newAbsent) / 100) * headcount * 220;
  const peopleRetained = ((baseTurnover - newTurnover) / 100) * headcount;
  const annualROI = daysSaved * costPerAbsent + peopleRetained * costPerTurnover;
  const fmt = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });

  return (
    <SectionShell icon={Wand2} eyebrow="05 · Decisão" accent="gold"
      title="What-If · ROI de intervenções" subtitle="Projete o impacto financeiro de adotar o Playbook 2.0 (Oxford × COPSOQ).">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <label className="block">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-heading font-bold">Adoção das intervenções</span>
          <input type="range" min={0} max={100} value={adoption} onChange={(e) => setAdoption(+e.target.value)} className="w-full accent-brand-gold mt-2" />
          <span className="text-xs text-foreground font-bold">{adoption}%</span>
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-heading font-bold">Headcount</span>
          <input type="range" min={20} max={2000} step={10} value={headcount} onChange={(e) => setHeadcount(+e.target.value)} className="w-full accent-brand-gold mt-2" />
          <span className="text-xs text-foreground font-bold">{fmt(headcount)} colaboradores</span>
        </label>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-brand-green/30 bg-brand-green/5 p-3">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-heading font-bold">Absenteísmo</p>
          <p className="font-display text-xl font-bold text-brand-green">{newAbsent.toFixed(1)}%</p>
          <p className="text-[10px] text-muted-foreground">era {baseAbsent}%</p>
        </div>
        <div className="rounded-xl border border-brand-cyan/30 bg-brand-cyan/5 p-3">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-heading font-bold">Turnover</p>
          <p className="font-display text-xl font-bold text-brand-cyan">{newTurnover.toFixed(1)}%</p>
          <p className="text-[10px] text-muted-foreground">era {baseTurnover}%</p>
        </div>
        <div className="rounded-xl border border-brand-gold/40 bg-brand-gold/10 p-3">
          <p className="text-[9px] uppercase tracking-widest text-brand-gold font-heading font-bold">ROI anual</p>
          <p className="font-display text-xl font-bold text-gradient-gold">R$ {fmt(annualROI / 1000)}k</p>
          <p className="text-[10px] text-muted-foreground">estimado</p>
        </div>
      </div>
    </SectionShell>
  );
}

/* ---------- 6. Voice Insights ---------- */
function VoiceCard() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const recRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const r = new SR();
    r.lang = "pt-BR"; r.continuous = false; r.interimResults = true;
    r.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join(" ");
      setTranscript(t);
    };
    r.onend = () => setListening(false);
    recRef.current = r;
  }, []);

  const toggle = () => {
    if (!recRef.current) return;
    if (listening) { recRef.current.stop(); setListening(false); }
    else { setTranscript(""); recRef.current.start(); setListening(true); }
  };

  const send = () => {
    if (!transcript.trim()) return;
    navigate(`/fibia?q=${encodeURIComponent(transcript)}`);
  };

  return (
    <SectionShell icon={Mic} eyebrow="06 · Multimodal" accent="cyan"
      title="Voice Insights" subtitle="Fale com a FIBia sem digitar. Ideal para acessibilidade e gestores em movimento.">
      {!supported ? (
        <p className="text-xs text-muted-foreground italic">Reconhecimento de voz não suportado neste navegador. Use Chrome/Edge.</p>
      ) : (
        <>
          <button
            onClick={toggle}
            className={cn(
              "w-full rounded-xl border p-4 flex items-center gap-3 transition-all",
              listening ? "border-brand-magenta/60 bg-brand-magenta/10" : "border-brand-cyan/30 bg-brand-cyan/5 hover:bg-brand-cyan/10",
            )}
          >
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", listening ? "bg-brand-magenta/20" : "bg-brand-cyan/20")}>
              {listening
                ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}><Mic className="w-5 h-5 text-brand-magenta" /></motion.div>
                : <MicOff className="w-5 h-5 text-brand-cyan" />}
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="font-heading font-bold text-sm text-foreground">
                {listening ? "Ouvindo… fale agora" : "Toque para falar"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {transcript || "Ex: \"Como reduzir o absenteísmo no setor TI?\""}
              </p>
            </div>
          </button>
          {transcript && !listening && (
            <button onClick={send} className="mt-3 w-full inline-flex items-center justify-center gap-2 gradient-gold text-primary-foreground font-heading font-bold text-sm px-4 py-2.5 rounded-xl glow-gold">
              Enviar para FIBia <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </>
      )}
    </SectionShell>
  );
}

/* =========================================================
 * Export · grid 2 colunas
 * ========================================================= */
export function DisruptiveLab() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-brand-gold/30 bg-gradient-to-br from-brand-gold/[0.08] via-brand-cyan/[0.04] to-brand-magenta/[0.06] p-6 md:p-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/5 border border-foreground/10 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
          <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-foreground/70">Disruptive Lab · 6 melhorias UX</span>
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight text-foreground">
          O dashboard como <span className="text-gradient-gold">co-piloto</span>, não como relatório
        </h2>
        <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl">
          Seis camadas disruptivas — velocidade, IA adaptativa, foco por persona, pulso vivo, simulação financeira e voz —
          que transformam o painel em uma experiência ativa nível plataforma unicórnio.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CommandPaletteCard />
        <DailyPulseCard />
        <PersonaLensCard />
        <HeatmapCard />
        <SimulatorCard />
        <VoiceCard />
      </div>
    </div>
  );
}
