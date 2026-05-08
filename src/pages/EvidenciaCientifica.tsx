import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Compass,
  Eye,
  FileText,
  Gauge,
  Globe2,
  Heart,
  Layers,
  Lightbulb,
  Microscope,
  Quote,
  Scale,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Workflow,
  X,
  ChevronDown,
} from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

/* ==============================================================
   DATA — Modal & Drawer Registry (enriched with learning science)
   ============================================================== */

type EvidenceLevel = "Fonte primária" | "Fonte secundária" | "Regulatório";
type Confidence = "Alta" | "Média";

interface DeepDive {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  whatItMeans: string[];
  reflection?: string;
  microAction?: string;
  type?: EvidenceLevel;
  confidence?: Confidence;
  source?: string;
  caution?: string;
}

const DEEP_DIVES: Record<string, DeepDive> = {
  drawer_us1tri: {
    id: "drawer_us1tri",
    title: "US$ 1 trilhão / ano",
    subtitle: "O preço silencioso da inação em saúde mental",
    body:
      "Quando organizações negligenciam o sofrimento psíquico relacionado ao trabalho, o impacto não desaparece — ele se converte em produtividade perdida, rotatividade, presenteísmo e custos previdenciários. A OMS e a OIT estimam que essa fricção sistêmica custa cerca de US$ 1 trilhão anuais à economia global.",
    whatItMeans: [
      "Saúde mental deixa de ser pauta periférica e entra na contabilidade estratégica.",
      "O custo da inação supera, em ordem de grandeza, qualquer programa estruturado de prevenção.",
      "O tema migra de campanha pontual para governança contínua.",
    ],
    reflection:
      "Se sua organização tem 1.000 colaboradores, mesmo uma fração desse impacto pode representar milhões em produtividade evaporada — sem aparecer em nenhum DRE.",
    microAction: "Mapeie hoje os indicadores invisíveis: presenteísmo, retrabalho e turnover regretado.",
    type: "Fonte primária",
    confidence: "Alta",
    source: "OMS / OIT, 2022",
  },
  drawer_12bi: {
    id: "drawer_12bi",
    title: "12 bilhões de dias perdidos",
    subtitle: "A escala global da depressão e ansiedade no trabalho",
    body:
      "12 bilhões de dias produtivos desaparecem anualmente por depressão e ansiedade. É como se cada trabalhador do planeta perdesse, em média, 4 dias inteiros por ano — só que concentrados em quem mais sofre.",
    whatItMeans: [
      "Afastamentos e perda funcional têm peso macroeconômico.",
      "O desenho do trabalho — cargas, ritmo, autonomia — modula essa estatística.",
      "Prevenção organizacional é o vetor de maior alavancagem.",
    ],
    reflection:
      "A pergunta correta não é 'quem está adoecendo?' — é 'que condições de trabalho estão produzindo adoecimento sistemático?'.",
    microAction: "Comece pela leitura fator a fator do COPSOQ antes de sugerir intervenções individuais.",
    type: "Fonte primária",
    confidence: "Alta",
    source: "OMS, 2022",
  },
  drawer_23engaged: {
    id: "drawer_23engaged",
    title: "23% engajados",
    subtitle: "O engajamento como exceção global",
    body:
      "Apenas 23% dos trabalhadores no mundo se reportam engajados. A maioria opera em modo de sobrevivência: presente fisicamente, ausente psicologicamente.",
    whatItMeans: [
      "Engajamento não é fruto de motivação individual — é fruto de desenho organizacional.",
      "Liderança, autonomia, reconhecimento e propósito explicam a maior parte da variância.",
      "Experiência do colaborador precisa ser tratada como sistema, não como benefício.",
    ],
    reflection: "Imagine uma orquestra onde 77% dos músicos tocam por obrigação. Esse é o som da sua organização hoje.",
    type: "Fonte primária",
    confidence: "Alta",
    source: "Gallup State of the Global Workplace, 2023",
  },
  drawer_77disengaged: {
    id: "drawer_77disengaged",
    title: "77% desengajados",
    subtitle: "Ou ativamente desengajados",
    body:
      "Desengajamento em massa é sintoma de sistemas frágeis — não de pessoas frágeis. Significa menos energia, menos retenção, menos adaptação e mais risco silencioso.",
    whatItMeans: [
      "Desengajamento sinaliza falha estrutural, não falha individual.",
      "Benefícios e comunicação interna não revertem o quadro sozinhos.",
      "É preciso agir sobre os drivers — autonomia, reconhecimento, propósito, liderança.",
    ],
    microAction: "Mapeie quais drivers do Playbook 2.0 estão mais frágeis na sua organização.",
    type: "Fonte primária",
    confidence: "Alta",
    source: "Gallup State of the Global Workplace, 2023",
  },
  drawer_nr1: {
    id: "drawer_nr1",
    title: "NR-1 e riscos psicossociais",
    subtitle: "Da sensibilização à gestão estruturada",
    body:
      "A atualização da NR-1 desloca os riscos psicossociais do campo cultural para o campo da gestão ocupacional. Eles passam a integrar formalmente o GRO/PGR, exigindo identificação, avaliação, controle, registro e melhoria contínua.",
    whatItMeans: [
      "O tema entra no escopo da auditoria, do compliance e da governança.",
      "Exige linguagem técnica, documentação rastreável e indicadores.",
      "Muda o ônus: já não basta dizer que 'cuida de pessoas' — é preciso demonstrar como.",
    ],
    reflection: "A NR-1 transforma sensibilidade em obrigação legal — e obrigação em oportunidade competitiva.",
    type: "Regulatório",
    confidence: "Alta",
    source: "MTE / Gov.br, 2024",
  },
  drawer_roi: {
    id: "drawer_roi",
    title: "4:1",
    subtitle: "Retorno estimado por US$ 1 investido em saúde mental",
    body:
      "A OMS estima retorno médio de US$ 4 para cada US$ 1 investido em saúde mental no trabalho. É um número poderoso — e por isso mesmo deve ser comunicado com cuidado: contexto, qualidade da intervenção e maturidade organizacional modulam o resultado.",
    whatItMeans: [
      "Investimento em saúde mental tem racional econômico defensável.",
      "Promessas simplistas comprometem credibilidade técnica.",
      "Use o dado como referência contextualizada — não como garantia comercial.",
    ],
    type: "Fonte primária",
    confidence: "Alta",
    source: "OMS, 2019",
    caution: "Aplicar de forma contextualizada e auditável.",
  },
  drawer_76symptoms: {
    id: "drawer_76symptoms",
    title: "76% relatam ao menos 1 sintoma",
    subtitle: "Sinalização de magnitude — fonte secundária",
    body:
      "Em pesquisa Mind Share Partners / Qualtrics, 76% dos respondentes relataram ao menos um sintoma de problema de saúde mental no último ano. Útil para sensibilizar — desde que comunicado com transparência sobre seu nível de evidência.",
    whatItMeans: [
      "Útil como sinalização do problema.",
      "Menor robustez metodológica do que fontes primárias globais.",
      "Deve ser apresentado com badge de confiança média.",
    ],
    type: "Fonte secundária",
    confidence: "Média",
    source: "Mind Share Partners / Qualtrics, 2021",
  },
  popout_copsoq: {
    id: "popout_copsoq",
    title: "COPSOQ — Copenhagen Psychosocial Questionnaire",
    subtitle: "Base psicométrica e multidimensional",
    body:
      "O COPSOQ é um dos instrumentos psicométricos mais consolidados internacionalmente para mapear fatores psicossociais do trabalho. Sua filosofia central é a leitura fator a fator — em vez de reduzir tudo a um único índice agregado.",
    whatItMeans: [
      "Permite interpretação fina e prevenção orientada a causas.",
      "Distingue dimensões como exigências, autonomia, apoio, reconhecimento, insegurança.",
      "Favorece diálogo técnico responsável entre RH, SST e liderança.",
    ],
    reflection:
      "Reduzir saúde psicossocial a uma nota única é como medir a saúde de um paciente apenas pela temperatura. O COPSOQ entrega o exame completo.",
  },
  popout_playbook: {
    id: "popout_playbook",
    title: "Work Wellbeing Playbook 2.0",
    subtitle: "Oxford × World Wellbeing Movement — 3.000+ estudos sintetizados",
    body:
      "Desenvolvido pelo Wellbeing Research Centre da Universidade de Oxford em parceria com o World Wellbeing Movement, o Playbook 2.0 é resultado de uma revisão sistemática de mais de 3.000 estudos científicos sobre intervenções de bem-estar no trabalho. Sua contribuição não é apenas teórica: é tornar a ciência acionável para gestores reais.",
    whatItMeans: [
      "Condensa décadas de literatura em 18 drivers organizacionais.",
      "Cada driver vem com intervenções priorizadas por força de evidência.",
      "Adota a lógica Measure → Understand → Act como espinha dorsal de decisão.",
    ],
    reflection:
      "É a diferença entre 'achar que sabe' e 'saber por que funciona'. Cada driver é um vetor de mudança baseado em evidência cumulativa.",
  },
  popout_nr1: {
    id: "popout_nr1",
    title: "NR-1 / GRO / PGR",
    subtitle: "Base regulatória e operacional brasileira",
    body:
      "A NR-1 articula os riscos psicossociais à lógica do Gerenciamento de Riscos Ocupacionais (GRO) e ao Programa de Gerenciamento de Riscos (PGR). Não é apenas uma exigência — é uma arquitetura que conecta identificação, avaliação, classificação, controle, registro, acompanhamento e melhoria contínua.",
    whatItMeans: [
      "Desloca o tema da agenda cultural para a agenda de gestão de riscos.",
      "Exige rastreabilidade documental e indicadores objetivos.",
      "Converte 'cuidar de pessoas' em 'demonstrar como cuidamos de pessoas'.",
    ],
  },
};

/* ==============================================================
   DATA — Drivers do Playbook (com narrativa)
   ============================================================== */

const PLAYBOOK_DRIVERS: { name: string; cluster: string; icon: any; insight: string }[] = [
  { name: "Achievement", cluster: "Sentido", icon: Award, insight: "Sentir que o esforço produz resultado visível" },
  { name: "Learning", cluster: "Crescimento", icon: BookOpen, insight: "Crescer continuamente no papel" },
  { name: "Job Security", cluster: "Estabilidade", icon: Shield, insight: "Previsibilidade reduz cortisol crônico" },
  { name: "Appreciation", cluster: "Reconhecimento", icon: Heart, insight: "Reconhecimento genuíno > bônus pontual" },
  { name: "Inclusion & Belonging", cluster: "Pertencimento", icon: Users, insight: "Pertencer protege saúde mental" },
  { name: "Support", cluster: "Apoio", icon: Heart, insight: "Apoio prático supera empatia retórica" },
  { name: "Trust", cluster: "Confiança", icon: ShieldCheck, insight: "Confiança é o multiplicador de tudo" },
  { name: "Management", cluster: "Gestão", icon: Compass, insight: "Gestão direta impacta mais que CEO" },
  { name: "Leadership", cluster: "Liderança", icon: Sparkles, insight: "Liderança modela cultura por imitação" },
  { name: "Flexibility", cluster: "Autonomia", icon: Workflow, insight: "Flexibilidade reduz conflito vida-trabalho" },
  { name: "Employee Voice", cluster: "Voz", icon: Quote, insight: "Ser ouvido é mais raro do que falar" },
  { name: "Operational Design", cluster: "Desenho", icon: Layers, insight: "Processos confusos geram exaustão" },
  { name: "Autonomy", cluster: "Autonomia", icon: Target, insight: "Autonomia + suporte = aprendizado" },
  { name: "Energy", cluster: "Vitalidade", icon: Activity, insight: "Energia coletiva é recurso renovável" },
  { name: "Purpose", cluster: "Propósito", icon: Compass, insight: "Propósito amortece estresse agudo" },
  { name: "Compensation", cluster: "Justiça", icon: Scale, insight: "Justiça percebida importa mais que valor absoluto" },
  { name: "Stress", cluster: "Risco", icon: Gauge, insight: "Estresse crônico erode todos os outros drivers" },
  { name: "Workload Pressures", cluster: "Risco", icon: TrendingUp, insight: "Sobrecarga é o risco mais subestimado" },
];

/* ==============================================================
   DATA — Heatmap demo
   ============================================================== */

type Intensity = 4 | 3 | 2 | 1 | 0;
const intensityLabel: Record<Intensity, string> = {
  4: "Crítico",
  3: "Forte",
  2: "Moderado",
  1: "Fraco",
  0: "Hipótese",
};
const intensityClass: Record<Intensity, string> = {
  4: "bg-destructive/80 text-destructive-foreground",
  3: "bg-brand-orange/70 text-background",
  2: "bg-brand-gold/60 text-background",
  1: "bg-brand-cyan/40 text-foreground",
  0: "bg-foreground/10 text-muted-foreground",
};

const HEATMAP_ROWS = [
  "Exigências quantitativas",
  "Ritmo de trabalho",
  "Apoio da liderança",
  "Reconhecimento",
  "Autonomia",
  "Insegurança laboral",
  "Stress",
  "Burnout",
];
const HEATMAP_COLS = ["Workload", "Stress", "Support", "Management", "Autonomy", "Trust", "Purpose"];

// matriz de intensidades demo
const HEATMAP: Intensity[][] = [
  [4, 4, 2, 3, 1, 1, 1],
  [4, 4, 2, 2, 2, 1, 1],
  [2, 3, 4, 4, 2, 4, 3],
  [1, 2, 3, 3, 2, 3, 4],
  [2, 2, 3, 3, 4, 3, 3],
  [3, 4, 3, 3, 2, 4, 2],
  [4, 4, 3, 2, 2, 2, 2],
  [4, 4, 4, 3, 3, 3, 3],
];

/* ==============================================================
   Helpers
   ============================================================== */

function CountUp({ to, suffix = "", duration = 1400 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  const display = to >= 100 ? Math.round(val).toLocaleString("pt-BR") : val.toFixed(1).replace(".0", "");
  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

function GlassCard({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-foreground/10 bg-foreground/[0.03] backdrop-blur-xl",
        "transition-all duration-300 hover:border-brand-gold/30 hover:bg-foreground/[0.05]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-3xl mb-12", align === "center" && "mx-auto text-center")}>
      {eyebrow && (
        <p className="text-[11px] uppercase tracking-[0.22em] text-brand-gold font-heading font-semibold mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl md:text-5xl font-semibold leading-tight text-foreground">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{subtitle}</p>}
    </div>
  );
}

/* ==============================================================
   Sticky Side Nav
   ============================================================== */

const SECTIONS = [
  { id: "hero", label: "Visão Geral" },
  { id: "painel", label: "Painel da Crise" },
  { id: "ciencia", label: "A Ciência" },
  { id: "playbook", label: "Playbook 2.0" },
  { id: "metodo", label: "Método" },
  { id: "heatmap", label: "Heatmap" },
  { id: "governanca", label: "Governança" },
  { id: "faq", label: "FAQ" },
  { id: "cta", label: "Falar conosco" },
];

function SideNav() {
  const [active, setActive] = useState("hero");
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);
  return (
    <nav className="hidden xl:block fixed top-1/2 left-6 -translate-y-1/2 z-30">
      <ul className="flex flex-col gap-2">
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={cn(
                "group flex items-center gap-3 transition-all",
                active === s.id ? "text-brand-gold" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "h-px transition-all",
                  active === s.id ? "w-10 bg-brand-gold" : "w-5 bg-foreground/20 group-hover:w-8",
                )}
              />
              <span className="text-xs font-heading uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                {s.label}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ==============================================================
   Page
   ============================================================== */

export default function EvidenciaCientifica() {
  const [diveId, setDiveId] = useState<string | null>(null);
  const dive = diveId ? DEEP_DIVES[diveId] : null;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <AppNavbar />
      <SideNav />

      {/* ============= HERO ============= */}
      <section
        id="hero"
        className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-4 sm:px-6 overflow-hidden"
      >
        {/* background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full bg-brand-gold/10 blur-[120px]" />
          <div className="absolute -top-20 -left-32 w-[500px] h-[500px] rounded-full bg-brand-cyan/10 blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Badge className="bg-brand-gold/10 text-brand-gold border border-brand-gold/30 hover:bg-brand-gold/15 font-heading uppercase tracking-wider text-[10px] mb-6">
              Rigor técnico-científico · NR-1 · Oxford · GRO/PGR
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
              A <span className="text-gradient-gold">ciência</span> por trás da gestão psicossocial mais{" "}
              <em className="not-italic text-brand-cyan">rastreável</em> e{" "}
              <em className="not-italic text-brand-magenta">estratégica</em> do mercado.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
              Uma arquitetura de decisão que conecta <strong className="text-foreground">COPSOQ</strong>,{" "}
              <strong className="text-foreground">Work Wellbeing Playbook 2.0</strong> (Oxford) e{" "}
              <strong className="text-foreground">NR-1 / GRO / PGR</strong> — transformando risco psicossocial e bem-estar
              em decisões auditáveis, defensáveis e acionáveis.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                "Baseada em evidências científicas e marcos regulatórios",
                "Organiza drivers, riscos, intervenções e governança",
                "Traduz complexidade em clareza para RH, SST, liderança e C-level",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="gradient-gold text-primary-foreground font-heading font-bold glow-gold hover:opacity-90"
                asChild
              >
                <Link to="/diagnostico">
                  Solicitar demonstração técnica <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-foreground/20 hover:border-brand-cyan/50 hover:bg-brand-cyan/5"
                asChild
              >
                <a href="#metodo">Explorar a metodologia</a>
              </Button>
              <Button size="lg" variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
                <a href="#heatmap">
                  Ver matriz de evidências <ChevronRight className="w-4 h-4" />
                </a>
              </Button>
            </div>
            <p className="mt-5 text-xs text-muted-foreground italic">
              Sem medicalização indevida. Sem promessas infladas. Com rastreabilidade e explicabilidade.
            </p>
          </motion.div>

          {/* Triad orbit visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-square max-w-[520px] mx-auto w-full"
          >
            <div className="absolute inset-0 rounded-full border border-foreground/10 animate-[spin_60s_linear_infinite]" />
            <div className="absolute inset-8 rounded-full border border-brand-gold/15 animate-[spin_90s_linear_infinite_reverse]" />
            <div className="absolute inset-16 rounded-full border border-brand-cyan/15" />

            {/* core */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="relative w-32 h-32 rounded-full gradient-gold flex items-center justify-center mx-auto glow-gold">
                  <Brain className="w-12 h-12 text-primary-foreground" />
                </div>
                <p className="mt-4 font-display text-sm text-foreground">
                  Matriz Psicossocial
                  <br />
                  <span className="text-brand-gold">Integrada</span>
                </p>
              </div>
            </div>

            {/* orbit nodes */}
            {[
              { label: "COPSOQ", angle: 0, color: "brand-cyan", icon: Microscope },
              { label: "Playbook 2.0", angle: 72, color: "brand-gold", icon: BookOpen },
              { label: "NR-1 / GRO / PGR", angle: 144, color: "brand-magenta", icon: ShieldCheck },
              { label: "Risco × Driver", angle: 216, color: "brand-cyan", icon: Layers },
              { label: "Governança", angle: 288, color: "brand-gold", icon: Scale },
            ].map((n) => {
              const r = 44;
              const x = 50 + r * Math.cos((n.angle - 90) * (Math.PI / 180));
              const y = 50 + r * Math.sin((n.angle - 90) * (Math.PI / 180));
              const Icon = n.icon;
              return (
                <div
                  key={n.label}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-full border backdrop-blur-md whitespace-nowrap",
                      "bg-background/70 border-foreground/10 text-xs font-heading",
                    )}
                  >
                    <Icon className={cn("w-3.5 h-3.5", `text-${n.color}`)} />
                    {n.label}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* trust bar */}
        <div className="relative max-w-7xl mx-auto mt-16">
          <GlassCard className="px-6 py-4 flex flex-wrap items-center justify-around gap-x-8 gap-y-3 text-xs font-heading text-muted-foreground">
            <span className="flex items-center gap-2">
              <Microscope className="w-4 h-4 text-brand-cyan" /> 3.000+ estudos revisados
            </span>
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-gold" /> Oxford · World Wellbeing Movement
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-magenta" /> NR-1 e GRO/PGR
            </span>
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-brand-cyan" /> Painel de evidências verificadas
            </span>
          </GlassCard>
        </div>
      </section>

      {/* ============= COMPACT VALUE STRIP ============= */}
      <section className="px-4 sm:px-6 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { value: 3000, suffix: "+", label: "artigos científicos revisados", sub: "base do Playbook 2.0", badge: "Oxford", color: "brand-gold" },
            { value: 12, suffix: " bi", label: "dias perdidos por depressão e ansiedade", sub: "estimativa global anual", badge: "OMS", color: "brand-magenta" },
            { value: 1, suffix: " tri", label: "USD em produtividade perdida", sub: "custo econômico da inação", badge: "OMS / OIT", color: "brand-cyan" },
            { value: 23, suffix: "%", label: "trabalhadores engajados globalmente", sub: "77% desengajados", badge: "Gallup", color: "brand-gold" },
          ].map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <GlassCard className="p-5 h-full">
                <Badge className={cn("text-[10px] mb-3", `bg-${m.color}/15 text-${m.color} border border-${m.color}/30`)}>
                  {m.badge}
                </Badge>
                <p className="font-display text-4xl font-semibold text-foreground">
                  <CountUp to={m.value} suffix={m.suffix} />
                </p>
                <p className="mt-2 text-sm text-foreground/90 font-heading">{m.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{m.sub}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============= PAINEL DA CRISE ============= */}
      <section id="painel" className="px-4 sm:px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Painel da Crise"
            title="O custo invisível da inação"
            subtitle="Quando o sofrimento não é medido, ele vira custo silencioso. Dados verificados e contextualizados para líderes que precisam decidir com responsabilidade — clique em qualquer cartão para aprofundar."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[1fr]">
            {[
              { id: "drawer_us1tri", t: "US$ 1 tri/ano", l: "Perda global de produtividade", cat: "Fonte primária", c: "Alta", src: "OMS / OIT, 2022", color: "brand-magenta", span: "lg:col-span-2 lg:row-span-2" },
              { id: "drawer_12bi", t: "12 bi dias", l: "Perdidos por depressão e ansiedade", cat: "Fonte primária", c: "Alta", src: "OMS, 2022", color: "brand-cyan" },
              { id: "drawer_23engaged", t: "23%", l: "Trabalhadores engajados globalmente", cat: "Fonte primária", c: "Alta", src: "Gallup, 2023", color: "brand-gold" },
              { id: "drawer_77disengaged", t: "77%", l: "Desengajados ou ativamente desengajados", cat: "Fonte primária", c: "Alta", src: "Gallup, 2023", color: "brand-magenta" },
              { id: "drawer_nr1", t: "NR-1", l: "Riscos psicossociais obrigatórios no PGR", cat: "Regulatório", c: "Alta", src: "MTE, 2024", color: "brand-cyan" },
              { id: "drawer_roi", t: "4 : 1", l: "Retorno por US$ 1 investido em saúde mental", cat: "Fonte primária", c: "Alta", src: "OMS, 2019", color: "brand-gold", caution: true },
              { id: "drawer_76symptoms", t: "76%", l: "Relatam ao menos 1 sintoma de saúde mental", cat: "Fonte secundária", c: "Média", src: "Mind Share Partners, 2021", color: "brand-cyan" },
            ].map((c, i) => (
              <motion.button
                key={c.id}
                onClick={() => setDiveId(c.id)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={cn("text-left group", c.span)}
              >
                <GlassCard className="p-6 h-full flex flex-col cursor-pointer group-hover:border-brand-gold/40 group-hover:-translate-y-0.5">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <Badge className={cn("text-[10px]", `bg-${c.color}/15 text-${c.color} border border-${c.color}/30`)}>
                      {c.cat}
                    </Badge>
                    <span className={cn("text-[10px] font-heading uppercase tracking-wider", c.c === "Alta" ? "text-brand-cyan" : "text-brand-gold")}>
                      Confiança {c.c}
                    </span>
                  </div>
                  <p className="font-display text-3xl md:text-4xl font-semibold text-foreground leading-none">{c.t}</p>
                  <p className="mt-3 text-sm text-foreground/85 font-heading">{c.l}</p>
                  <div className="mt-auto pt-4 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{c.src}</span>
                    <span className="flex items-center gap-1 text-brand-gold group-hover:translate-x-1 transition-transform">
                      Ver mais <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                  {c.caution && (
                    <p className="mt-2 text-[10px] text-brand-orange italic">⚠ Aplicação contextualizada</p>
                  )}
                </GlassCard>
              </motion.button>
            ))}
          </div>

          <p className="mt-10 text-center font-display text-xl italic text-muted-foreground">
            "Cuidar de saúde mental deixou de ser opcional."
          </p>
        </div>
      </section>

      {/* ============= WHY THIS MATTERS ============= */}
      <section className="px-4 sm:px-6 py-20 bg-surface-dark/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="Por que agora" title="Por que isso importa — e por que importa hoje" />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Lightbulb, t: "Porque o risco já existe", txt: "Excesso de demanda, ambiguidade, baixo apoio, insegurança e conflitos não são apenas percepções — são condições de trabalho com impacto humano e organizacional mensurável." },
              { icon: Scale, t: "Porque a regulação amadureceu", txt: "A NR-1, articulada ao GRO/PGR, desloca o tema do campo reputacional para o campo da gestão preventiva e da governança auditável." },
              { icon: Brain, t: "Porque líderes precisam agir com inteligência", txt: "Apps, campanhas e benefícios isolados não bastam. A literatura reforça a centralidade de intervenções estruturais e organizacionais." },
            ].map((c, i) => (
              <GlassCard key={i} className="p-6">
                <div className="w-11 h-11 rounded-xl bg-brand-gold/15 flex items-center justify-center mb-4">
                  <c.icon className="w-5 h-5 text-brand-gold" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{c.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.txt}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ============= SCIENCE FOUNDATION ============= */}
      <section id="ciencia" className="px-4 sm:px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Fundação científica"
            title="Três camadas científicas. Uma única arquitetura de decisão."
            subtitle="Não escolhemos entre psicometria, evidência internacional e regulação brasileira. Integramos as três — e cada decisão da matriz pode ser explicada por sua origem."
          />

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { id: "popout_copsoq", icon: Microscope, t: "COPSOQ", st: "Base psicométrica", s: "Organiza dimensões psicossociais do trabalho em leitura fator a fator.", color: "brand-cyan" },
              { id: "popout_playbook", icon: BookOpen, t: "Work Wellbeing Playbook 2.0", st: "Oxford × World Wellbeing Movement", s: "Condensa 3.000+ estudos em 18 drivers organizacionais aplicáveis.", color: "brand-gold" },
              { id: "popout_nr1", icon: ShieldCheck, t: "NR-1 / GRO / PGR", st: "Base regulatória brasileira", s: "Identificação, avaliação, controle, registro e melhoria contínua de riscos psicossociais.", color: "brand-magenta" },
            ].map((c) => (
              <button key={c.id} onClick={() => setDiveId(c.id)} className="text-left group">
                <GlassCard className="p-7 h-full group-hover:-translate-y-1">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-5", `bg-${c.color}/15`)}>
                    <c.icon className={cn("w-6 h-6", `text-${c.color}`)} />
                  </div>
                  <p className={cn("text-[11px] uppercase tracking-wider font-heading mb-2", `text-${c.color}`)}>{c.st}</p>
                  <h3 className="font-display text-2xl font-semibold mb-3">{c.t}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{c.s}</p>
                  <span className={cn("inline-flex items-center gap-1.5 text-sm font-heading group-hover:translate-x-1 transition-transform", `text-${c.color}`)}>
                    Aprofundar <ArrowRight className="w-4 h-4" />
                  </span>
                </GlassCard>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============= PLAYBOOK SECTION ============= */}
      <section id="playbook" className="px-4 sm:px-6 py-20 bg-surface-dark/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Work Wellbeing Playbook 2.0"
            title="3.000+ estudos. 18 drivers. Uma linguagem comum para liderança."
            subtitle="Quando Oxford e o World Wellbeing Movement decidiram fazer a maior síntese científica sobre bem-estar no trabalho, o objetivo não foi acadêmico — foi tornar a ciência operável por gestores reais."
          />

          <Tabs defaultValue="o-que" className="mb-12">
            <TabsList className="bg-foreground/5 border border-foreground/10">
              <TabsTrigger value="o-que">O que é</TabsTrigger>
              <TabsTrigger value="como">Como foi construído</TabsTrigger>
              <TabsTrigger value="entrega">O que entrega</TabsTrigger>
            </TabsList>
            <TabsContent value="o-que" className="mt-6">
              <GlassCard className="p-7 md:p-9">
                <p className="text-base md:text-lg leading-relaxed text-foreground/90">
                  Um <strong className="text-brand-gold">guia prático-científico</strong> desenvolvido pela World
                  Wellbeing Movement em parceria com o <strong>Wellbeing Research Centre da Universidade de Oxford</strong>.
                  Nasceu da pergunta certa: <em>o que, de fato, funciona para melhorar o bem-estar no trabalho?</em>
                </p>
              </GlassCard>
            </TabsContent>
            <TabsContent value="como" className="mt-6">
              <GlassCard className="p-7 md:p-9">
                <p className="text-base md:text-lg leading-relaxed text-foreground/90">
                  Revisão sistemática de <strong className="text-brand-cyan">mais de 3.000 estudos acadêmicos</strong> sobre
                  intervenções de bem-estar — com filtros de qualidade metodológica, validade ecológica e risco de viés.
                  O resultado: a evidência mais densa e curada disponível hoje no mundo corporativo.
                </p>
              </GlassCard>
            </TabsContent>
            <TabsContent value="entrega" className="mt-6">
              <GlassCard className="p-7 md:p-9">
                <p className="text-base md:text-lg leading-relaxed text-foreground/90">
                  <strong className="text-brand-magenta">18 drivers organizacionais</strong>, intervenções priorizadas por
                  força de evidência, e a lógica <em>Measure → Understand → Act</em> que transforma bem-estar em
                  estratégia de negócio — não em campanha de RH.
                </p>
              </GlassCard>
            </TabsContent>
          </Tabs>

          {/* Driver grid */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-display text-2xl font-semibold">Os 18 drivers do Playbook</h3>
            <Badge className="bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
              Hover para insight científico
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {PLAYBOOK_DRIVERS.map((d, i) => (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="group relative"
              >
                <div className="relative rounded-xl border border-foreground/10 bg-foreground/[0.03] p-4 h-full transition-all hover:border-brand-gold/40 hover:bg-brand-gold/5 cursor-default">
                  <d.icon className="w-5 h-5 text-brand-gold mb-2" />
                  <p className="font-heading font-semibold text-sm">{d.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{d.cluster}</p>
                  <div className="absolute inset-x-0 bottom-full mb-2 px-3 py-2 rounded-lg bg-background border border-brand-gold/30 text-xs text-foreground opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-xl">
                    {d.insight}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <GlassCard className="mt-10 p-7 border-brand-gold/20 bg-brand-gold/[0.04]">
            <div className="flex gap-4">
              <Quote className="w-8 h-8 text-brand-gold shrink-0" />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-brand-gold font-heading mb-2">
                  Lição central da literatura
                </p>
                <p className="font-display text-lg md:text-xl leading-relaxed text-foreground">
                  Bem-estar sustentável <strong>não depende apenas do indivíduo</strong>. Ele depende, sobretudo, do{" "}
                  <em className="text-brand-gold not-italic">desenho do trabalho</em>, da{" "}
                  <em className="text-brand-cyan not-italic">liderança</em>, da{" "}
                  <em className="text-brand-magenta not-italic">comunicação</em>, da autonomia, do reconhecimento e das
                  condições organizacionais.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ============= INTERVENTION EXAMPLES ============= */}
      <section className="px-4 sm:px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Intervenções"
            title="Exemplos apoiados pela ciência"
            subtitle="Da evidência ao ato gerencial — exemplos práticos extraídos da literatura."
          />
          <Accordion type="single" collapsible className="space-y-3">
            {[
              { v: "autonomia", t: "Autonomia", s: "Dar maior controle sobre como o trabalho é realizado", b: "A literatura indica que autonomia melhora confiança, aprendizado, adaptação e experiência de trabalho — quando sustentada por relações de confiança e suporte gerencial. Sem suporte, autonomia vira abandono." },
              { v: "reconhecimento", t: "Reconhecimento", s: "Valorização genuína e feedback justo", b: "Ações de reconhecimento reduzem exaustão e elevam satisfação, pertencimento e energia. O que importa não é a frequência, mas a especificidade e a sinceridade percebida." },
              { v: "equilibrio", t: "Equilíbrio trabalho-vida", s: "Políticas de desconexão e prevenção de esgotamento", b: "Intervenções organizacionais que reduzem hiperconectividade e excesso de pressão protegem saúde mental e capacidade de recuperação. Política sem exemplo de liderança não funciona." },
              { v: "comunicacao", t: "Comunicação", s: "Reduzir ambiguidade e ruído relacional", b: "Melhorar comunicação, clareza e previsibilidade reduz estresse, insegurança e conflito relacional. Ambiguidade é uma das maiores fontes de carga cognitiva oculta." },
            ].map((it) => (
              <AccordionItem
                key={it.v}
                value={it.v}
                className="border border-foreground/10 rounded-xl px-5 bg-foreground/[0.03]"
              >
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-lg bg-brand-gold/15 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-brand-gold" />
                    </div>
                    <div>
                      <p className="font-display text-lg font-semibold">{it.t}</p>
                      <p className="text-sm text-muted-foreground font-normal">{it.s}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pl-14 pb-5">
                  {it.b}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ============= MATRIX METHOD ============= */}
      <section id="metodo" className="px-4 sm:px-6 py-20 bg-surface-dark/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Método"
            title="Como a matriz transforma evidência em decisão"
            subtitle="Cinco passos rastreáveis. Cada passo, uma decisão explicável."
          />
          <div className="relative">
            <div className="hidden md:block absolute left-0 right-0 top-12 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
              {[
                { n: "1", t: "Medir", x: "Coleta dimensões psicossociais e organiza resultados por fator." },
                { n: "2", t: "Entender", x: "Associa resultados aos drivers e mecanismos organizacionais relevantes." },
                { n: "3", t: "Priorizar", x: "Classifica criticidade, força da associação e relevância preventiva." },
                { n: "4", t: "Agir", x: "Converte achados em intervenções, governança, indicadores e plano." },
                { n: "5", t: "Acompanhar", x: "Inventário, rastreabilidade, PGR e melhoria contínua." },
              ].map((s, i) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="text-center relative"
                >
                  <div className="relative w-24 h-24 mx-auto mb-4 rounded-full gradient-gold flex items-center justify-center glow-gold">
                    <span className="font-display text-3xl font-bold text-primary-foreground">{s.n}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{s.t}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.x}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <p className="mt-12 text-center text-sm text-muted-foreground italic max-w-2xl mx-auto">
            A matriz <strong>não faz diagnóstico clínico individual</strong>. Ela organiza sinais de risco, drivers e
            medidas organizacionais — com rastreabilidade documental do início ao fim.
          </p>
        </div>
      </section>

      {/* ============= HEATMAP ============= */}
      <section id="heatmap" className="px-4 sm:px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Heatmap demonstrativo"
            title="Como a matriz se enxerga em uma tela"
            subtitle="Exemplo de leitura visual entre dimensões COPSOQ (linhas) e drivers do Playbook (colunas). Clique em qualquer célula para abrir a interpretação técnica."
          />
          <GlassCard className="p-5 md:p-7 overflow-x-auto">
            <div className="min-w-[640px]">
              {/* legend */}
              <div className="flex flex-wrap items-center gap-3 mb-5 text-[11px] font-heading">
                {([4, 3, 2, 1, 0] as Intensity[]).map((i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className={cn("w-3 h-3 rounded-sm", intensityClass[i])} />
                    {intensityLabel[i]}
                  </span>
                ))}
              </div>

              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `200px repeat(${HEATMAP_COLS.length}, 1fr)` }}
              >
                <div />
                {HEATMAP_COLS.map((c) => (
                  <div
                    key={c}
                    className="text-[10px] font-heading uppercase tracking-wider text-muted-foreground text-center pb-2"
                  >
                    {c}
                  </div>
                ))}
                {HEATMAP_ROWS.map((row, ri) => (
                  <Fragment key={`row-${ri}`}>
                    <div className="text-xs font-heading text-foreground/90 py-2 pr-3 self-center">
                      {row}
                    </div>
                    {HEATMAP[ri].map((val, ci) => (
                      <button
                        key={`c-${ri}-${ci}`}
                        onClick={() => setDiveId("popout_copsoq")}
                        className={cn(
                          "h-12 rounded-md text-[10px] font-bold flex items-center justify-center transition-all hover:scale-105 hover:ring-2 hover:ring-brand-gold/60",
                          intensityClass[val],
                        )}
                        title={`${row} × ${HEATMAP_COLS[ci]}: ${intensityLabel[val]}`}
                      >
                        {intensityLabel[val][0]}
                      </button>
                    ))}
                  </Fragment>
                ))}
              </div>
            </div>
            <p className="mt-5 text-xs text-muted-foreground italic">
              Modelo demonstrativo. A classificação final depende dos dados reais, do contexto organizacional e da
              validação técnica.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* ============= EVIDENCE LAYERS ============= */}
      <section className="px-4 sm:px-6 py-20 bg-surface-dark/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="Camadas de evidência" title="Cada afirmação, com seu nível de confiança" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { l: "Fonte primária", d: "Documento oficial ou dado institucional original.", c: "brand-cyan" },
              { l: "Fonte secundária", d: "Estudo ou síntese contextual, usado com cautela.", c: "brand-gold" },
              { l: "Regulatório", d: "Norma, guia ou marco formal aplicável.", c: "brand-magenta" },
              { l: "Confiança alta", d: "Afirmação robusta e bem sustentada.", c: "brand-cyan" },
              { l: "Confiança média", d: "Útil, mas dependente de contexto.", c: "brand-gold" },
            ].map((b) => (
              <GlassCard key={b.l} className="p-5">
                <Badge className={cn("text-[10px] mb-3", `bg-${b.c}/15 text-${b.c} border border-${b.c}/30`)}>
                  {b.l}
                </Badge>
                <p className="text-xs text-muted-foreground leading-relaxed">{b.d}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ============= CAN / CANNOT CLAIM ============= */}
      <section className="px-4 sm:px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Honestidade científica"
            title="O que podemos afirmar — e o que não devemos exagerar"
            subtitle="Em ciência aplicada, o que não se diz é tão importante quanto o que se diz."
          />
          <div className="grid md:grid-cols-2 gap-6">
            <GlassCard className="p-7 border-brand-cyan/20">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-brand-cyan/15 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-brand-cyan" />
                </div>
                <h3 className="font-display text-xl font-semibold">Podemos afirmar</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "O Work Wellbeing Playbook 2.0 condensa uma base ampla de literatura científica.",
                  "A NR-1/GRO/PGR reforça a importância de gerenciar riscos psicossociais relacionados ao trabalho.",
                  "Bem-estar exige mais do que ações superficiais.",
                  "A matriz apoia leitura estruturada, priorização e ação organizacional.",
                  "Há relação documentada entre condições de trabalho, saúde mental e desempenho organizacional.",
                ].map((t) => (
                  <li key={t} className="flex gap-2.5 text-sm text-foreground/85">
                    <CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="p-7 border-brand-orange/20">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-brand-orange/15 flex items-center justify-center">
                  <X className="w-5 h-5 text-brand-orange" />
                </div>
                <h3 className="font-display text-xl font-semibold">Não devemos exagerar</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Que qualquer ação isolada gera ROI garantido.",
                  "Que toda associação observada é causal.",
                  "Que esta página substitui laudo, perícia ou parecer jurídico.",
                  "Que bem-estar é apenas benefício individual.",
                  "Que a matriz faz diagnóstico clínico individual.",
                ].map((t) => (
                  <li key={t} className="flex gap-2.5 text-sm text-foreground/85">
                    <X className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ============= GOVERNANCE ============= */}
      <section id="governanca" className="px-4 sm:px-6 py-20 bg-surface-dark/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Governança"
            title="Arquitetura de confiança e governança"
            subtitle="Os quatro pilares que tornam a matriz defensável — técnica, ética e juridicamente."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { i: FileText, t: "Rastreabilidade", x: "Cada recomendação é explicável por fonte, lógica e contexto.", c: "brand-gold" },
              { i: Eye, t: "Privacidade", x: "Agregação, k-anonimato e proteção contra exposição individual.", c: "brand-cyan" },
              { i: Lightbulb, t: "Explicabilidade", x: "Drivers, riscos e intervenções compreensíveis para líderes e técnicos.", c: "brand-magenta" },
              { i: TrendingUp, t: "Melhoria contínua", x: "Avança do diagnóstico ao monitoramento e à aprendizagem organizacional.", c: "brand-gold" },
            ].map((c) => (
              <GlassCard key={c.t} className="p-6">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-4", `bg-${c.c}/15`)}>
                  <c.i className={cn("w-5 h-5", `text-${c.c}`)} />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{c.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.x}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ============= FAQ ============= */}
      <section id="faq" className="px-4 sm:px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <SectionHeader eyebrow="FAQ" title="Perguntas frequentes" align="center" />
          <Accordion type="single" collapsible className="space-y-3">
            {[
              { q: "O que significa dizer que o Playbook usa 3.000+ artigos científicos?", a: "Significa que sua base foi construída a partir de uma revisão sistemática ampla da literatura sobre intervenções de bem-estar no trabalho, com filtragem rigorosa de qualidade metodológica e validade." },
              { q: "O foco é individual ou organizacional?", a: "O foco principal é organizacional. A evidência cumulativa reforça que mudanças estruturais e de desenho do trabalho são centrais — sem que isso negue a importância de apoio individual quando necessário." },
              { q: "Isso substitui instrumentos e avaliações formais?", a: "Não. A página e a matriz ajudam a organizar, interpretar e comunicar evidências e decisões. Avaliações clínicas, periciais e jurídicas continuam sendo da competência de profissionais habilitados." },
              { q: "Por que a NR-1 importa nesta conversa?", a: "Porque ela fortalece a necessidade de gestão estruturada dos fatores psicossociais relacionados ao trabalho dentro da lógica do GRO/PGR — com identificação, avaliação, controle, registro e melhoria contínua." },
            ].map((it, i) => (
              <AccordionItem
                key={i}
                value={`q-${i}`}
                className="border border-foreground/10 rounded-xl px-5 bg-foreground/[0.03]"
              >
                <AccordionTrigger className="hover:no-underline text-left font-heading font-semibold">
                  {it.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {it.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ============= FINAL CTA ============= */}
      <section id="cta" className="px-4 sm:px-6 py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-brand-gold/10 blur-[140px]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <Badge className="bg-brand-gold/15 text-brand-gold border border-brand-gold/30 mb-6">
            Próximo passo
          </Badge>
          <h2 className="font-display text-4xl md:text-6xl font-semibold leading-tight">
            Transforme sofrimento invisível em{" "}
            <span className="text-gradient-gold">inteligência institucional.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Conheça a arquitetura que conecta ciência, bem-estar, risco psicossocial e governança em uma experiência
            preparada para líderes contemporâneos.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <Button size="lg" className="gradient-gold text-primary-foreground font-heading font-bold glow-gold" asChild>
              <Link to="/diagnostico">
                Solicitar demonstração técnica <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-foreground/20" asChild>
              <Link to="/fibia">Falar com um especialista</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link to="/matriz">Ver a matriz de evidências</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground italic">
            Com base em evidências verificadas, contexto regulatório e design de decisão.
          </p>
        </div>
      </section>

      {/* ============= DEEP-DIVE MODAL ============= */}
      <Dialog open={!!dive} onOpenChange={(o) => !o && setDiveId(null)}>
        <DialogContent className="max-w-2xl bg-card border-foreground/10 max-h-[85vh] overflow-y-auto">
          {dive && (
            <>
              <DialogHeader>
                {dive.type && (
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      className={cn(
                        "text-[10px]",
                        dive.type === "Regulatório"
                          ? "bg-brand-magenta/15 text-brand-magenta border border-brand-magenta/30"
                          : dive.type === "Fonte primária"
                            ? "bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30"
                            : "bg-brand-gold/15 text-brand-gold border border-brand-gold/30",
                      )}
                    >
                      {dive.type}
                    </Badge>
                    {dive.confidence && (
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-heading">
                        Confiança {dive.confidence}
                      </span>
                    )}
                  </div>
                )}
                <DialogTitle className="font-display text-2xl md:text-3xl">{dive.title}</DialogTitle>
                <DialogDescription className="text-base text-brand-gold font-heading">
                  {dive.subtitle}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-2">
                <p className="text-foreground/85 leading-relaxed">{dive.body}</p>

                <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-5">
                  <p className="text-[11px] uppercase tracking-wider text-brand-gold font-heading font-semibold mb-3">
                    O que isso significa
                  </p>
                  <ul className="space-y-2">
                    {dive.whatItMeans.map((t) => (
                      <li key={t} className="flex gap-2.5 text-sm text-foreground/85">
                        <ChevronRight className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {dive.reflection && (
                  <div className="rounded-xl border border-brand-cyan/20 bg-brand-cyan/[0.04] p-5">
                    <p className="text-[11px] uppercase tracking-wider text-brand-cyan font-heading font-semibold mb-2 flex items-center gap-2">
                      <Lightbulb className="w-3.5 h-3.5" /> Reflexão
                    </p>
                    <p className="text-sm text-foreground/90 italic leading-relaxed">{dive.reflection}</p>
                  </div>
                )}

                {dive.microAction && (
                  <div className="rounded-xl border border-brand-magenta/20 bg-brand-magenta/[0.04] p-5">
                    <p className="text-[11px] uppercase tracking-wider text-brand-magenta font-heading font-semibold mb-2 flex items-center gap-2">
                      <Target className="w-3.5 h-3.5" /> Micro-ação
                    </p>
                    <p className="text-sm text-foreground/90 leading-relaxed">{dive.microAction}</p>
                  </div>
                )}

                {dive.caution && (
                  <div className="rounded-xl border border-brand-orange/30 bg-brand-orange/[0.05] p-4">
                    <p className="text-xs text-brand-orange italic">⚠ {dive.caution}</p>
                  </div>
                )}

                {dive.source && (
                  <div className="flex items-center justify-between pt-4 border-t border-foreground/10 text-xs text-muted-foreground">
                    <span>Fonte: {dive.source}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
