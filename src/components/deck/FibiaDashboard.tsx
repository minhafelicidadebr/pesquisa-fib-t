import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie, Sector
} from "recharts";
import {
  BarChart3, ChevronRight, RotateCcw, Download, Home,
  TrendingUp, TrendingDown, Award, AlertTriangle, BookOpen,
  Zap, Target, ArrowRight, Sparkles
} from "lucide-react";
import fibiaAvatar from "@/assets/fibia-avatar.png";
import { FibiaPdfExport } from "@/components/deck/FibiaPdfExport";

interface AnalysisResult {
  summary: string;
  domains: Record<string, { score: number; max: number; label: string }>;
  factors: Record<string, { score: number; label: string }>;
  strengths: string[];
  vulnerabilities: string[];
  recommendations: Array<{ domain: string; action: string; timeframe: string; driver_category: string }>;
  learning_trails: Array<{ title: string; description: string; priority: string }>;
  encouragement: string;
}

interface FibiaDashboardProps {
  analysis: AnalysisResult;
  onRestart: () => void;
}

const domainEmojis: Record<string, string> = {
  "Padrão de Vida": "🏠",
  "Educação": "📚",
  "Cultura": "🎭",
  "Bem-Estar Psicológico": "🧠",
  "Saúde": "💚",
  "Uso do Tempo": "⏰",
  "Vitalidade Comunitária": "🤝",
  "Meio Ambiente": "🌿",
  "Governança": "⚖️",
};

const domainColors: Record<string, string> = {
  "Padrão de Vida": "hsl(43 100% 52%)",
  "Educação": "hsl(217 91% 60%)",
  "Cultura": "hsl(340 82% 60%)",
  "Bem-Estar Psicológico": "hsl(280 67% 60%)",
  "Saúde": "hsl(142 71% 45%)",
  "Uso do Tempo": "hsl(262 83% 58%)",
  "Vitalidade Comunitária": "hsl(181 100% 40%)",
  "Meio Ambiente": "hsl(142 53% 45%)",
  "Governança": "hsl(38 91% 50%)",
};

// Benchmark data (sector averages)
const benchmarkScores: Record<string, number> = {
  "Padrão de Vida": 2.5,
  "Educação": 2.2,
  "Cultura": 1.9,
  "Bem-Estar Psicológico": 2.4,
  "Saúde": 2.6,
  "Uso do Tempo": 2.1,
  "Vitalidade Comunitária": 2.3,
  "Meio Ambiente": 2.0,
  "Governança": 2.3,
};

function getScoreColor(score: number): string {
  if (score >= 3.5) return "hsl(142 71% 45%)";
  if (score >= 2.5) return "hsl(43 100% 52%)";
  if (score >= 1.5) return "hsl(38 91% 50%)";
  return "hsl(0 84% 60%)";
}

function getScoreLabel(score: number): string {
  if (score >= 3.5) return "Excelente";
  if (score >= 2.5) return "Bom";
  if (score >= 1.5) return "Atenção";
  return "Crítico";
}

function getScoreColorClass(score: number): string {
  if (score >= 3.5) return "text-green-400";
  if (score >= 2.5) return "text-brand-gold";
  if (score >= 1.5) return "text-brand-orange";
  return "text-red-400";
}

function getScoreBgClass(score: number): string {
  if (score >= 3.5) return "bg-green-500/15 border-green-500/20";
  if (score >= 2.5) return "bg-brand-gold/15 border-brand-gold/20";
  if (score >= 1.5) return "bg-brand-orange/15 border-brand-orange/20";
  return "bg-red-500/15 border-red-500/20";
}

// Animated circular gauge component
function ScoreGauge({ score, size = 160, delay = 0 }: { score: number; size?: number; delay?: number }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const percentage = (score / 4) * 100;
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = animated ? circumference * (1 - percentage / 100) : circumference;
  const color = getScoreColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(222 15% 18%)" strokeWidth={8} />
        {/* Score arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
        {/* Glow effect */}
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={3} strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          opacity={0.3} filter="url(#glow)"
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay / 1000 + 0.5, duration: 0.5 }}
          className="font-display text-4xl font-bold"
          style={{ color }}
        >
          {score.toFixed(1)}
        </motion.span>
        <span className="text-xs text-muted-foreground mt-0.5">/4.0</span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay / 1000 + 0.8 }}
          className={`text-xs font-heading font-bold mt-1 ${getScoreColorClass(score)}`}
        >
          {getScoreLabel(score)}
        </motion.span>
      </div>
    </div>
  );
}

// Domain heatmap card
function DomainCard({ label, score, index, onClick }: { label: string; score: number; index: number; onClick: () => void }) {
  const diff = score - (benchmarkScores[label] || 2.3);
  const isAbove = diff >= 0;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 + index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className={`glass-card rounded-xl p-4 text-left hover:scale-[1.02] transition-all duration-300 group cursor-pointer border ${getScoreBgClass(score)}`}
    >
      {/* Top bar indicator */}
      <div className="h-1 rounded-full mb-3 bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(score / 4) * 100}%` }}
          transition={{ delay: 1 + index * 0.1, duration: 0.8 }}
          className="h-full rounded-full"
          style={{ backgroundColor: getScoreColor(score) }}
        />
      </div>
      <div className="flex items-start justify-between mb-2">
        <span className="text-lg">{domainEmojis[label] || "📌"}</span>
        <span className="font-display text-xl font-bold" style={{ color: getScoreColor(score) }}>
          {score.toFixed(1)}
        </span>
      </div>
      <p className="font-heading font-bold text-xs text-foreground mb-1 leading-tight">{label}</p>
      <div className="flex items-center gap-1">
        {isAbove ? (
          <TrendingUp className="w-3 h-3 text-green-400" />
        ) : (
          <TrendingDown className="w-3 h-3 text-amber-400" />
        )}
        <span className={`text-[10px] font-heading font-semibold ${isAbove ? "text-green-400" : "text-amber-400"}`}>
          {isAbove ? "+" : ""}{diff.toFixed(1)} vs média
        </span>
      </div>
    </motion.button>
  );
}

// Custom active shape for pie chart
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#F9FAFB" fontSize={13} fontWeight={700} fontFamily="Manrope">
        {payload.name}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill={fill} fontSize={20} fontWeight={800} fontFamily="Fraunces">
        {value.toFixed(1)}
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 10} outerRadius={outerRadius + 14} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.3} />
    </g>
  );
};

export function FibiaDashboard({ analysis, onRestart }: FibiaDashboardProps) {
  const [activeFactorIndex, setActiveFactorIndex] = useState(0);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "details" | "plan">("overview");

  const overallScore = Object.values(analysis.domains).reduce((a, d) => a + d.score, 0) / Object.values(analysis.domains).length;
  const sortedDomains = Object.entries(analysis.domains).sort((a, b) => b[1].score - a[1].score);

  const radarData = Object.entries(analysis.domains).map(([, val]) => ({
    domain: val.label,
    score: val.score,
    benchmark: benchmarkScores[val.label] || 2.3,
    fullMark: 4,
  }));

  const factorColors = ["hsl(43 100% 52%)", "hsl(181 100% 40%)", "hsl(340 82% 47%)"];
  const factorData = Object.values(analysis.factors).map((f, i) => ({
    name: f.label,
    score: f.score,
    fill: factorColors[i],
  }));

  const tabs = [
    { id: "overview" as const, label: "Visão Geral", icon: BarChart3 },
    { id: "details" as const, label: "9 Domínios", icon: Target },
    { id: "plan" as const, label: "Plano de Ação", icon: Zap },
  ];

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-4 pb-16 space-y-6"
    >
      {/* Hero Score Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 via-transparent to-brand-cyan/5" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/8 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-cyan/6 rounded-full blur-[60px]" />

        <div className="relative glass-card-strong rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            {/* Left: Avatar + Title */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
              <div className="flex items-center gap-3 mb-3">
                <img src={fibiaAvatar} alt="FIBia" className="w-12 h-12 rounded-full border-2 border-brand-gold/40" />
                <div>
                  <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">
                    Seu Índice de <span className="text-gradient-gold">Felicidade</span>
                  </h1>
                  <p className="text-xs text-muted-foreground">Diagnóstico FIB-T • Análise por IA</p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3 w-full mt-4">
                <div className="glass-card rounded-lg p-3 text-center">
                  <Award className="w-4 h-4 text-green-400 mx-auto mb-1" />
                  <p className="text-[10px] text-muted-foreground">Potências</p>
                  <p className="font-heading font-bold text-sm text-green-400">{analysis.strengths.length}</p>
                </div>
                <div className="glass-card rounded-lg p-3 text-center">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <p className="text-[10px] text-muted-foreground">Atenção</p>
                  <p className="font-heading font-bold text-sm text-amber-400">{analysis.vulnerabilities.length}</p>
                </div>
                <div className="glass-card rounded-lg p-3 text-center">
                  <BookOpen className="w-4 h-4 text-brand-cyan mx-auto mb-1" />
                  <p className="text-[10px] text-muted-foreground">Trilhas</p>
                  <p className="font-heading font-bold text-sm text-brand-cyan">{analysis.learning_trails.length}</p>
                </div>
              </div>
            </div>

            {/* Right: Score Gauge */}
            <div className="flex flex-col items-center">
              <ScoreGauge score={overallScore} size={160} delay={300} />
              <p className="text-xs text-muted-foreground mt-2 text-center max-w-[180px]">
                Índice geral calculado a partir dos 9 domínios
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 glass-card rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-heading font-bold text-sm transition-all ${
                activeTab === tab.id
                  ? "gradient-gold text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* TAB: OVERVIEW */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Summary */}
            <div className="glass-card-strong rounded-2xl p-6">
              <h3 className="font-heading font-bold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-gold" />
                Análise Narrativa
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{analysis.summary}</p>
            </div>

            {/* Radar Chart with Benchmark */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-brand-gold" />
                  Mapa dos 9 Domínios
                </h3>
                <div className="flex items-center gap-4 text-[10px]">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 bg-brand-gold rounded" /> Seu score
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 bg-brand-cyan/50 rounded" /> Média setorial
                  </span>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(222 15% 22%)" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="domain" tick={{ fill: "hsl(220 10% 65%)", fontSize: 10, fontFamily: "Manrope" }} />
                    <PolarRadiusAxis angle={90} domain={[0, 4]} tick={{ fill: "hsl(220 10% 45%)", fontSize: 9 }} tickCount={5} />
                    <Radar name="Benchmark" dataKey="benchmark" stroke="hsl(181 100% 40%)" fill="hsl(181 100% 40%)" fillOpacity={0.08} strokeWidth={1} strokeDasharray="4 4" />
                    <Radar name="Seu Score" dataKey="score" stroke="hsl(43 100% 52%)" fill="hsl(43 100% 52%)" fillOpacity={0.25} strokeWidth={2.5} dot={{ r: 4, fill: "hsl(43 100% 52%)" }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Factors Pie Chart */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-heading font-bold text-foreground mb-4">3 Fatores FIB-T</h3>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="h-56 w-full md:w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        activeIndex={activeFactorIndex}
                        activeShape={renderActiveShape}
                        data={factorData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        dataKey="score"
                        onMouseEnter={(_, index) => setActiveFactorIndex(index)}
                      >
                        {factorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3 w-full">
                  {factorData.map((f, i) => (
                    <motion.div
                      key={f.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.15 }}
                      className={`glass-card rounded-xl p-4 cursor-pointer transition-all ${activeFactorIndex === i ? "border-foreground/20 scale-[1.02]" : ""}`}
                      onMouseEnter={() => setActiveFactorIndex(i)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: f.fill }} />
                          <span className="font-heading font-bold text-sm text-foreground">{f.name}</span>
                        </div>
                        <span className="font-display text-lg font-bold" style={{ color: f.fill }}>{f.score.toFixed(1)}</span>
                      </div>
                      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(f.score / 4) * 100}%` }}
                          transition={{ delay: 0.8 + i * 0.2, duration: 1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: f.fill }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strengths & Vulnerabilities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-2xl p-6 bg-green-500/5 border border-green-500/15"
              >
                <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-400" />
                  Suas Potências
                </h3>
                <div className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className="flex items-center gap-3 bg-green-500/10 rounded-lg px-4 py-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                      </div>
                      <span className="text-sm text-foreground/90 font-heading">{s}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="rounded-2xl p-6 bg-amber-500/5 border border-amber-500/15"
              >
                <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  Oportunidades de Crescimento
                </h3>
                <div className="space-y-2">
                  {analysis.vulnerabilities.map((v, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + i * 0.1 }}
                      className="flex items-center gap-3 bg-amber-500/10 rounded-lg px-4 py-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                        <TrendingDown className="w-3 h-3 text-amber-400" />
                      </div>
                      <span className="text-sm text-foreground/90 font-heading">{v}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* TAB: 9 DOMAINS DETAIL */}
        {activeTab === "details" && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Domain Heatmap Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sortedDomains.map(([key, val], i) => (
                <DomainCard
                  key={key}
                  label={val.label}
                  score={val.score}
                  index={i}
                  onClick={() => setSelectedDomain(selectedDomain === key ? null : key)}
                />
              ))}
            </div>

            {/* Selected Domain Detail */}
            <AnimatePresence>
              {selectedDomain && analysis.domains[selectedDomain] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="glass-card-strong rounded-2xl p-6 border border-brand-gold/15">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{domainEmojis[analysis.domains[selectedDomain].label]}</span>
                        <div>
                          <h3 className="font-heading font-bold text-foreground">{analysis.domains[selectedDomain].label}</h3>
                          <p className="text-xs text-muted-foreground">Score: {analysis.domains[selectedDomain].score.toFixed(2)} / 4.0</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-heading font-bold ${getScoreBgClass(analysis.domains[selectedDomain].score)} ${getScoreColorClass(analysis.domains[selectedDomain].score)}`}>
                        {getScoreLabel(analysis.domains[selectedDomain].score)}
                      </div>
                    </div>

                    {/* Domain bar comparison */}
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Seu score</span>
                          <span className="font-bold" style={{ color: getScoreColor(analysis.domains[selectedDomain].score) }}>
                            {analysis.domains[selectedDomain].score.toFixed(1)}
                          </span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(analysis.domains[selectedDomain].score / 4) * 100}%` }}
                            transition={{ duration: 0.8 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: getScoreColor(analysis.domains[selectedDomain].score) }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Média setorial</span>
                          <span className="text-brand-cyan font-bold">
                            {(benchmarkScores[analysis.domains[selectedDomain].label] || 2.3).toFixed(1)}
                          </span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((benchmarkScores[analysis.domains[selectedDomain].label] || 2.3) / 4) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="h-full rounded-full bg-brand-cyan/60"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Relevant recommendations for this domain */}
                    {analysis.recommendations.filter(r => r.domain.toLowerCase().includes(analysis.domains[selectedDomain].label.toLowerCase().split(" ")[0])).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-foreground/5">
                        <p className="text-xs font-heading font-bold text-muted-foreground mb-2">Recomendações para este domínio:</p>
                        {analysis.recommendations
                          .filter(r => r.domain.toLowerCase().includes(analysis.domains[selectedDomain].label.toLowerCase().split(" ")[0]))
                          .slice(0, 2)
                          .map((rec, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-foreground/80 mb-1">
                              <ChevronRight className="w-3 h-3 text-brand-gold mt-0.5 shrink-0" />
                              <span>{rec.action}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Horizontal bar comparison */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-gold" />
                Ranking dos Domínios
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedDomains.map(([, v]) => ({ name: v.label, score: v.score, benchmark: benchmarkScores[v.label] || 2.3 }))} layout="vertical">
                    <XAxis type="number" domain={[0, 4]} tick={{ fill: "hsl(220 10% 55%)", fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" width={130} tick={{ fill: "hsl(220 10% 70%)", fontSize: 10, fontFamily: "Manrope" }} />
                    <Tooltip
                      contentStyle={{ background: "hsl(222 30% 12%)", border: "1px solid hsl(222 15% 22%)", borderRadius: 10, color: "#fff", fontSize: 12 }}
                      formatter={(value: number) => [value.toFixed(2), ""]}
                    />
                    <Bar dataKey="benchmark" name="Média" fill="hsl(181 100% 40%)" fillOpacity={0.2} radius={[0, 4, 4, 0]} barSize={12} />
                    <Bar dataKey="score" name="Seu Score" radius={[0, 6, 6, 0]} barSize={16}>
                      {sortedDomains.map(([, v], i) => (
                        <Cell key={i} fill={domainColors[v.label] || "hsl(43 100% 52%)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB: ACTION PLAN */}
        {activeTab === "plan" && (
          <motion.div
            key="plan"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Recommendations Timeline */}
            {analysis.recommendations.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-heading font-bold text-foreground mb-6 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-brand-gold" />
                  Plano de Ação Personalizado
                </h3>

                {["7d", "30d", "90d"].map((timeframe) => {
                  const items = analysis.recommendations.filter(r => r.timeframe === timeframe);
                  if (items.length === 0) return null;
                  const config = {
                    "7d": { label: "Próximos 7 dias", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", icon: "🚀" },
                    "30d": { label: "Próximos 30 dias", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: "📈" },
                    "90d": { label: "Próximos 90 dias", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", icon: "🎯" },
                  }[timeframe]!;

                  return (
                    <div key={timeframe} className="mb-6 last:mb-0">
                      <div className="flex items-center gap-2 mb-3">
                        <span>{config.icon}</span>
                        <h4 className={`font-heading font-bold text-sm ${config.color}`}>{config.label}</h4>
                      </div>
                      <div className="space-y-2 pl-4 border-l-2 border-foreground/10">
                        {items.map((rec, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`${config.bg} ${config.border} border rounded-xl p-4`}
                          >
                            <p className="text-sm text-foreground/90 mb-1">{rec.action}</p>
                            <p className="text-[10px] text-muted-foreground">{rec.domain} • {rec.driver_category}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Learning Trails */}
            {analysis.learning_trails.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brand-cyan" />
                  Trilhas de Aprendizagem
                </h3>
                <div className="space-y-3">
                  {analysis.learning_trails.map((trail, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-card rounded-xl p-5 border-l-4"
                      style={{ borderColor: trail.priority === "high" ? "hsl(0 84% 60%)" : trail.priority === "medium" ? "hsl(43 100% 52%)" : "hsl(142 71% 45%)" }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-heading font-bold text-sm text-foreground">{trail.title}</h4>
                        <span className={`text-[9px] font-heading font-bold px-2 py-0.5 rounded-full ${
                          trail.priority === "high" ? "bg-red-500/15 text-red-400" :
                          trail.priority === "medium" ? "bg-brand-gold/15 text-brand-gold" :
                          "bg-green-500/15 text-green-400"
                        }`}>
                          {trail.priority === "high" ? "Prioridade Alta" : trail.priority === "medium" ? "Média" : "Exploratória"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{trail.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Evidence Bank */}
            <motion.a
              href="/evidencias"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card rounded-2xl p-6 flex items-center gap-4 hover:border-brand-gold/20 transition-all group cursor-pointer block"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-brand-gold" />
              </div>
              <div className="flex-1">
                <h4 className="font-heading font-bold text-sm text-foreground group-hover:text-brand-gold transition-colors">
                  Aprofunde no Banco de Evidências
                </h4>
                <p className="text-xs text-muted-foreground">3.000+ artigos científicos organizados por domínio e tema</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-gold transition-colors" />
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Encouragement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="glass-card-strong rounded-2xl p-6 text-center border border-brand-gold/20 glow-gold"
      >
        <img src={fibiaAvatar} alt="FIBia" className="w-12 h-12 rounded-full mx-auto mb-3 border-2 border-brand-gold/30" />
        <p className="text-foreground/90 text-sm leading-relaxed italic max-w-lg mx-auto">
          "{analysis.encouragement}"
        </p>
        <p className="text-xs text-muted-foreground mt-2">— FIBia, sua assistente de bem-estar 🌻</p>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <FibiaPdfExport analysis={analysis} />
        <button onClick={onRestart} className="border border-foreground/20 text-foreground/80 font-heading text-sm px-6 py-3 rounded-lg hover:bg-foreground/5 transition-colors flex items-center justify-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Refazer diagnóstico
        </button>
        <a href="/" className="gradient-gold text-primary-foreground font-heading font-bold text-sm px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
          <Home className="w-4 h-4" />
          Voltar ao início
        </a>
      </div>
    </motion.div>
  );
}
