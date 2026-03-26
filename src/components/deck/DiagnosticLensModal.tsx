import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Globe, Zap, Star, ChevronRight, Target, BookOpen, Scale, Users } from "lucide-react";

interface DiagnosticLensModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLens?: string;
  colorClass: "gold" | "cyan" | "magenta";
}

const lensData = [
  {
    id: "copsoq",
    acronym: "COPSOQ",
    title: "Riscos Psicossociais",
    icon: Shield,
    color: "from-red-500 to-orange-500",
    glowColor: "shadow-red-500/20",
    impactLabel: "Blindagem de Passivo",
    methodology: "Compliance & Blindagem",
    description: "O padrão ouro internacional para riscos psicossociais. Identifica as causas organizacionais do estresse e burnout.",
    specs: [
      { label: "Standard", value: "COPSOQ III (Copenhagen)" },
      { label: "Alvo", value: "Fatores de Risco (Não sintomas)" },
      { label: "Foco", value: "Jurídico (Nexo Causal)" },
      { label: "Compliance", value: "NR-1 (GRO) Integral" },
    ],
    strategicValue: [
      "Mapeamento de fatores organizacionais de risco — não apenas sintomas individuais",
      "Produção de evidências para nexo causal em processos trabalhistas",
      "Base técnica para o Programa de Gerenciamento de Riscos (PGR)",
      "Identificação de hotspots por unidade, equipe e função",
      "Fundamentação para políticas de prevenção ao assédio e violência",
    ],
    businessCase: "Organizações que implementam o COPSOQ reduzem em até 40% as reclamações trabalhistas ligadas a fatores psicossociais e constroem blindagem jurídica documentada.",
  },
  {
    id: "fib",
    acronym: "FIB-T",
    title: "Felicidade Interna Bruta",
    icon: Globe,
    color: "from-emerald-500 to-teal-500",
    glowColor: "shadow-emerald-500/20",
    impactLabel: "Redução de Atrito Sistêmico",
    methodology: "Prosperidade Sistêmica & Governança",
    description: "A saúde do colaborador é inseparável da saúde do sistema. Avaliamos a organização como um ecossistema vivo, mapeando 9 domínios vitais.",
    specs: [
      { label: "Domínios", value: "9 Dimensões (Bem-estar, Tempo, Vitalidade...)" },
      { label: "Origem", value: "ONU / Butão / Oxford" },
      { label: "Foco", value: "Sistêmico (Cultura & Ambiente)" },
      { label: "Compliance", value: "ESG (G) + ODS 3" },
    ],
    strategicValue: [
      "Leitura de 9 domínios vitais: Padrão de Vida, Bem-Estar, Saúde, Educação, Cultura, Uso do Tempo, Vitalidade Comunitária, Meio Ambiente e Governança",
      "Diagnóstico que conecta condições sistêmicas a resultados humanos",
      "Recorde mundial de aplicação: +110.000 respondentes",
      "Base para relatórios ESG e alinhamento com ODS",
      "Ferramenta validada para cultura organizacional e clima",
    ],
    businessCase: "A abordagem sistêmica do FIB reduz atrito organizacional ao identificar disfunções invisíveis no ecossistema de trabalho — não apenas no indivíduo.",
  },
  {
    id: "perma",
    acronym: "PERMA+V",
    title: "Performance & Florescimento",
    icon: Zap,
    color: "from-blue-500 to-violet-500",
    glowColor: "shadow-blue-500/20",
    impactLabel: "+21% Produtividade",
    methodology: "Psicologia Positiva Aplicada",
    description: "Sair da zona de 'não-doença' para a zona de alta performance. Gestão estratégica de energia emocional e engajamento.",
    specs: [
      { label: "Modelo", value: "Martin Seligman (UPenn)" },
      { label: "Pilares", value: "5+1 (Emoções, Flow, Relações, Sentido...)" },
      { label: "Foco", value: "Indivíduo (Energia & Motivação)" },
      { label: "Compliance", value: "Lei 14.831 (Saúde Mental)" },
    ],
    strategicValue: [
      "Mensuração de Emoções Positivas, Engajamento, Relacionamentos, Sentido, Realização + Vitalidade",
      "Modelo validado pela Universidade da Pensilvânia (Martin Seligman)",
      "Correlação direta com produtividade, retenção e criatividade",
      "Gestão de energia emocional como alavanca de performance",
      "Base para programas de florescimento e liderança positiva",
    ],
    businessCase: "Equipes com altos índices PERMA apresentam +21% de produtividade, -37% de absenteísmo e 3x mais engajamento (Gallup/Oxford).",
  },
  {
    id: "via",
    acronym: "VIA",
    title: "Values in Action",
    icon: Star,
    color: "from-amber-500 to-yellow-500",
    glowColor: "shadow-amber-500/20",
    impactLabel: "Eficiência & Retenção",
    methodology: "Forças de Caráter & Virtudes",
    description: "Gestão baseada em potências. Mapeamos a diversidade cognitiva para alocar o talento certo no desafio certo (Flow).",
    specs: [
      { label: "Base", value: "24 Forças Universais" },
      { label: "Aplicação", value: "Job Crafting & Liderança" },
      { label: "Foco", value: "Potencial (Otimização)" },
      { label: "Compliance", value: "Diversidade & Inclusão" },
    ],
    strategicValue: [
      "Mapeamento de 24 forças de caráter validadas transculturalmente",
      "Job Crafting: alocação estratégica de talento com base em potências",
      "Otimização de equipes por diversidade cognitiva e complementaridade",
      "Liderança baseada em forças — não apenas em competências técnicas",
      "Base para programas de diversidade, inclusão e pertencimento",
    ],
    businessCase: "Colaboradores que usam suas forças-assinatura diariamente são 6x mais engajados e 3x mais propensos a reportar excelente qualidade de vida (VIA Institute).",
  },
];

const colorMap = {
  gold: { gradient: "gradient-gold", badge: "bg-brand-gold/15 text-brand-gold" },
  cyan: { gradient: "gradient-cyan", badge: "bg-brand-cyan/15 text-brand-cyan" },
  magenta: { gradient: "gradient-magenta", badge: "bg-brand-magenta/15 text-brand-magenta" },
};

export function DiagnosticLensModal({ isOpen, onClose, initialLens, colorClass }: DiagnosticLensModalProps) {
  const [activeLens, setActiveLens] = useState(initialLens || "copsoq");

  // Sync active lens when modal opens with a different lens
  React.useEffect(() => {
    if (isOpen && initialLens) {
      setActiveLens(initialLens);
    }
  }, [isOpen, initialLens]);
  const colors = colorMap[colorClass];
  const lens = lensData.find((l) => l.id === activeLens) || lensData[0];
  const Icon = lens.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 lg:inset-12 z-50 glass-card-strong rounded-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/10">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-brand-gold" />
                <h2 className="font-heading text-lg font-bold text-foreground">Diagnóstico com 4 Lentes Científicas</h2>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-foreground/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-foreground/5 overflow-x-auto">
              {lensData.map((l) => {
                const LIcon = l.icon;
                return (
                  <button
                    key={l.id}
                    onClick={() => setActiveLens(l.id)}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-heading font-semibold whitespace-nowrap transition-all border-b-2 ${
                      activeLens === l.id
                        ? "border-brand-gold text-foreground bg-foreground/5"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-foreground/3"
                    }`}
                  >
                    <LIcon className="w-4 h-4" />
                    {l.acronym}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={lens.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Hero card */}
                  <div className={`rounded-xl p-6 md:p-8 mb-8 bg-gradient-to-br ${lens.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-background/60" />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <Icon className="w-8 h-8 text-foreground" />
                            <div>
                              <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">{lens.acronym}</h3>
                              <p className="text-sm text-foreground/70 font-heading">{lens.title}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs font-heading font-bold bg-foreground/10 text-foreground/80 px-3 py-1 rounded-full">
                            {lens.impactLabel}
                          </span>
                          <span className="text-xs font-heading text-foreground/60">
                            {lens.methodology}
                          </span>
                        </div>
                      </div>
                      <p className="text-foreground/90 text-sm md:text-base leading-relaxed max-w-3xl">
                        {lens.description}
                      </p>
                    </div>
                  </div>

                  {/* Specs grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    {lens.specs.map((spec) => (
                      <div key={spec.label} className="glass-card rounded-lg p-4">
                        <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-muted-foreground">{spec.label}</span>
                        <p className="font-heading font-bold text-sm text-foreground mt-1">{spec.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Strategic value */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-4 h-4 text-brand-gold" />
                      <h4 className="font-heading font-bold text-foreground">Proposta de Valor Estratégica</h4>
                    </div>
                    <div className="space-y-2">
                      {lens.strategicValue.map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.05 }}
                          className="glass-card rounded-lg px-4 py-3 flex items-start gap-3"
                        >
                          <ChevronRight className="w-4 h-4 text-brand-gold mt-0.5 shrink-0" />
                          <span className="text-sm text-foreground/90 leading-relaxed">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Business case */}
                  <div className="glass-card-strong rounded-xl p-6 border-l-4 border-brand-gold">
                    <div className="flex items-center gap-2 mb-3">
                      <Scale className="w-4 h-4 text-brand-gold" />
                      <span className="font-heading font-bold text-sm text-foreground">Impacto de Negócio</span>
                    </div>
                    <p className="text-foreground/80 text-sm leading-relaxed italic">
                      "{lens.businessCase}"
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-foreground/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span>Metodologias validadas internacionalmente</span>
              </div>
              <div className="flex gap-2">
                {lensData.map((l, i) => (
                  <button
                    key={l.id}
                    onClick={() => setActiveLens(l.id)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      activeLens === l.id ? `bg-gradient-to-r ${l.color} w-6` : "bg-muted hover:bg-muted-foreground/30"
                    }`}
                    aria-label={l.acronym}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export { lensData };
