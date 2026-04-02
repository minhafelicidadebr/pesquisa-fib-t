import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Calculator, TrendingUp, TrendingDown, DollarSign, Users, AlertTriangle,
  ArrowRight, ChevronDown, ChevronUp, Zap, Shield, BarChart3, Info, X
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from "recharts";

/* ─── Benchmark data anchored in OMS, Gallup, Oxford ─── */
const BENCHMARKS = {
  turnoverCostMultiplier: 0.5, // 50% do salário anual (Gallup median)
  absenteeismRate: 0.05,       // 5% benchmark IBGE/OMS
  presenteeismFactor: 0.10,    // 10% perda presenteísmo (Oxford/Harvard)
  productivityLoss: 0.08,      // 8% perda produtividade (Gallup)
  roiWellbeing: 4.0,           // 4:1 ROI (OMS, 2019)
  absenteeismReduction: 0.41,  // -41% (Gallup Meta-Analysis)
  turnoverReduction: 0.24,     // -24% (Gallup Meta-Analysis)
  productivityGain: 0.13,      // +13% (Oxford, 2019)
  accidentReduction: 0.48,     // -48% (Gallup)
};

interface CalcParams {
  employees: number;
  avgSalary: number;
  turnoverRate: number;
  absenteeismRate: number;
  presenteeismFactor: number;
  productivityLoss: number;
}

const defaultParams: CalcParams = {
  employees: 500,
  avgSalary: 8000,
  turnoverRate: 0.15,
  absenteeismRate: 0.05,
  presenteeismFactor: 0.10,
  productivityLoss: 0.08,
};

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function SliderInput({ label, value, onChange, min, max, step, suffix, formula, source }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; suffix: string;
  formula?: string; source?: string;
}) {
  const [showInfo, setShowInfo] = useState(false);
  const displayVal = suffix === "%" ? (value * 100).toFixed(0) + "%" 
    : suffix === "R$" ? formatBRL(value) 
    : value.toLocaleString("pt-BR");

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-heading font-semibold text-foreground flex items-center gap-1.5">
          {label}
          {(formula || source) && (
            <button onClick={() => setShowInfo(!showInfo)} className="text-muted-foreground hover:text-brand-gold transition-colors">
              <Info className="w-3 h-3" />
            </button>
          )}
        </label>
        <span className="text-xs font-heading font-bold text-brand-gold tabular-nums-data">{displayVal}</span>
      </div>
      {showInfo && (formula || source) && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-2">
          {formula && <p className="text-[10px] text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">{formula}</p>}
          {source && <p className="text-[10px] text-brand-gold/70 mt-1">Fonte: {source}</p>}
        </motion.div>
      )}
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-brand-gold
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-gold [&::-webkit-slider-thumb]:shadow-lg
          [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background"
      />
    </div>
  );
}

export function ImpactCalculator() {
  const [params, setParams] = useState<CalcParams>(defaultParams);
  const [activeTab, setActiveTab] = useState<"cost" | "roi">("cost");
  const [showMethodology, setShowMethodology] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const update = (key: keyof CalcParams, val: number) => setParams(p => ({ ...p, [key]: val }));

  const costs = useMemo(() => {
    const annualPayroll = params.employees * params.avgSalary * 13; // 13 salários
    const turnoverCost = params.employees * params.turnoverRate * (params.avgSalary * 12 * BENCHMARKS.turnoverCostMultiplier);
    const absenteeismCost = annualPayroll * params.absenteeismRate;
    const presenteeismCost = annualPayroll * params.presenteeismFactor;
    const productivityCost = annualPayroll * params.productivityLoss;
    const total = turnoverCost + absenteeismCost + presenteeismCost + productivityCost;
    return { turnoverCost, absenteeismCost, presenteeismCost, productivityCost, total, annualPayroll };
  }, [params]);

  const roi = useMemo(() => {
    const investmentPercent = 0.02; // 2% da folha
    const investment = costs.annualPayroll * investmentPercent;
    const turnoverSaving = costs.turnoverCost * BENCHMARKS.turnoverReduction;
    const absenteeismSaving = costs.absenteeismCost * BENCHMARKS.absenteeismReduction;
    const productivityGain = costs.annualPayroll * BENCHMARKS.productivityGain;
    const accidentSaving = costs.annualPayroll * 0.005 * BENCHMARKS.accidentReduction;
    const totalSaving = turnoverSaving + absenteeismSaving + productivityGain + accidentSaving;
    const roiRatio = investment > 0 ? totalSaving / investment : 0;
    return { investment, turnoverSaving, absenteeismSaving, productivityGain, accidentSaving, totalSaving, roiRatio };
  }, [costs]);

  const costBreakdown = [
    { name: "Turnover", value: costs.turnoverCost, color: "hsl(340, 82%, 47%)" },
    { name: "Absenteísmo", value: costs.absenteeismCost, color: "hsl(43, 100%, 52%)" },
    { name: "Presenteísmo", value: costs.presenteeismCost, color: "hsl(181, 100%, 40%)" },
    { name: "Produtividade", value: costs.productivityCost, color: "hsl(38, 91%, 50%)" },
  ];

  const roiRadarData = [
    { driver: "Turnover", saving: Math.round(roi.turnoverSaving / 1000), full: Math.round(costs.turnoverCost / 1000) },
    { driver: "Absenteísmo", saving: Math.round(roi.absenteeismSaving / 1000), full: Math.round(costs.absenteeismCost / 1000) },
    { driver: "Produtividade", saving: Math.round(roi.productivityGain / 1000), full: Math.round(costs.productivityCost / 1000) },
    { driver: "Acidentes", saving: Math.round(roi.accidentSaving / 1000), full: Math.round(costs.annualPayroll * 0.005 / 1000) },
  ];

  const tabs = [
    { id: "cost" as const, label: "Custo da Inação", icon: TrendingDown, color: "brand-magenta" },
    { id: "roi" as const, label: "ROI Potencial", icon: TrendingUp, color: "brand-green" },
  ];

  return (
    <section ref={ref} className="py-24 px-6 border-t border-foreground/5 relative overflow-hidden">
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-brand-gold/3 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-brand-cyan/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calculator className="w-4 h-4 text-brand-gold" />
            <span className="text-xs font-heading text-brand-gold font-semibold uppercase tracking-widest">
              CALCULADORA DE IMPACTO
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Quantifique o custo da <span className="text-gradient-magenta">inação</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            Projete o impacto financeiro e o ROI de investir em bem-estar com base em benchmarks de OMS, Gallup e Oxford.
          </p>
        </motion.div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-8">
          <div className="glass-card rounded-xl p-1 inline-flex">
            {tabs.map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2.5 rounded-lg font-heading font-bold text-sm flex items-center gap-2 transition-all duration-300 ${
                    activeTab === tab.id
                      ? tab.id === "cost"
                        ? "gradient-magenta text-foreground"
                        : "bg-brand-green text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Parameters Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 glass-card rounded-2xl p-6"
          >
            <h3 className="font-heading font-bold text-foreground text-sm mb-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-gold" />
              Parâmetros da organização
            </h3>
            <p className="text-[10px] text-muted-foreground mb-5">
              Ajuste os valores ao seu contexto. Defaults = benchmarks de referência.
            </p>

            <SliderInput label="Colaboradores" value={params.employees} onChange={v => update("employees", v)}
              min={50} max={10000} step={50} suffix="" />
            <SliderInput label="Salário médio (R$/mês)" value={params.avgSalary} onChange={v => update("avgSalary", v)}
              min={2000} max={30000} step={500} suffix="R$" />
            <SliderInput label="Turnover anual" value={params.turnoverRate} onChange={v => update("turnoverRate", v)}
              min={0.02} max={0.50} step={0.01} suffix="%"
              formula="colaboradores × taxa × custo_desligamento" source="Gallup, 2020" />
            <SliderInput label="Taxa de absenteísmo" value={params.absenteeismRate} onChange={v => update("absenteeismRate", v)}
              min={0.01} max={0.15} step={0.01} suffix="%"
              formula="folha_anual × taxa" source="IBGE / OMS" />
            <SliderInput label="Fator de presenteísmo" value={params.presenteeismFactor} onChange={v => update("presenteeismFactor", v)}
              min={0.03} max={0.25} step={0.01} suffix="%"
              formula="folha_anual × fator" source="Oxford/Harvard" />
            <SliderInput label="Perda de produtividade" value={params.productivityLoss} onChange={v => update("productivityLoss", v)}
              min={0.02} max={0.20} step={0.01} suffix="%"
              formula="folha_anual × %_perda" source="Gallup, 2023" />
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
              {activeTab === "cost" ? (
                <motion.div key="cost" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  {/* Cost breakdown cards */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {costBreakdown.map((item, i) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-card rounded-xl p-4"
                      >
                        <div className="w-2 h-2 rounded-full mb-2" style={{ background: item.color }} />
                        <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider mb-1">{item.name}</p>
                        <p className="font-display text-lg font-bold text-foreground tabular-nums-data">{formatBRL(item.value)}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="glass-card-strong rounded-2xl p-6 border border-brand-magenta/20 mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-magenta/5 to-transparent pointer-events-none" />
                    <div className="relative z-10">
                      <p className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-1">Custo Total Anual Estimado</p>
                      <p className="font-display text-3xl md:text-4xl font-bold text-gradient-magenta tabular-nums-data mb-1">
                        {formatBRL(costs.total)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatBRL(costs.total / 12)}/mês · {formatBRL(costs.total / params.employees)}/colaborador
                      </p>
                    </div>
                  </div>

                  {/* Bar chart */}
                  <div className="glass-card rounded-xl p-4">
                    <p className="text-xs font-heading font-semibold text-foreground mb-3">Composição do custo</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={costBreakdown} layout="vertical" barCategoryGap="20%">
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={90}
                          tick={{ fontSize: 11, fill: "hsl(220, 10%, 60%)" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(v: number) => [formatBRL(v), ""]}
                          contentStyle={{ background: "hsl(222, 30%, 12%)", border: "1px solid hsl(222, 15%, 20%)", borderRadius: 8, fontSize: 12 }}
                          labelStyle={{ color: "hsl(210, 20%, 98%)" }}
                          itemStyle={{ color: "hsl(210, 20%, 98%)" }}
                          cursor={{ fill: "hsl(222, 15%, 20%, 0.3)" }}
                        />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                          {costBreakdown.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="roi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  {/* ROI highlights */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="glass-card rounded-xl p-4">
                      <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider mb-1">Investimento (2% folha)</p>
                      <p className="font-display text-lg font-bold text-brand-cyan tabular-nums-data">{formatBRL(roi.investment)}</p>
                    </div>
                    <div className="glass-card rounded-xl p-4">
                      <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider mb-1">Retorno projetado</p>
                      <p className="font-display text-lg font-bold text-brand-green tabular-nums-data">{formatBRL(roi.totalSaving)}</p>
                    </div>
                  </div>

                  {/* ROI ratio */}
                  <div className="glass-card-strong rounded-2xl p-6 border border-brand-green/20 mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-green/5 to-transparent pointer-events-none" />
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-1">ROI Projetado</p>
                        <p className="font-display text-4xl font-bold text-brand-green tabular-nums-data">
                          {roi.roiRatio.toFixed(1)}:1
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Benchmark OMS: 4:1 · Deloitte: 1.6–6.3:1</p>
                      </div>
                      <div className="w-16 h-16 rounded-full border-4 border-brand-green/30 flex items-center justify-center">
                        <TrendingUp className="w-7 h-7 text-brand-green" />
                      </div>
                    </div>
                  </div>

                  {/* Savings breakdown */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: "Redução turnover", value: roi.turnoverSaving, pct: "-24%", src: "Gallup" },
                      { label: "Redução absenteísmo", value: roi.absenteeismSaving, pct: "-41%", src: "Gallup" },
                      { label: "Ganho produtividade", value: roi.productivityGain, pct: "+13%", src: "Oxford" },
                      { label: "Redução acidentes", value: roi.accidentSaving, pct: "-48%", src: "Gallup" },
                    ].map((item, i) => (
                      <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="glass-card rounded-xl p-3">
                        <p className="text-[10px] text-muted-foreground font-heading mb-1">{item.label}</p>
                        <p className="font-heading font-bold text-sm text-foreground tabular-nums-data">{formatBRL(item.value)}</p>
                        <p className="text-[10px] text-brand-green">{item.pct} · {item.src}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Radar */}
                  <div className="glass-card rounded-xl p-4">
                    <p className="text-xs font-heading font-semibold text-foreground mb-2">Radar de economia (R$ mil)</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={roiRadarData}>
                        <PolarGrid stroke="hsl(222, 15%, 25%)" />
                        <PolarAngleAxis dataKey="driver" tick={{ fontSize: 10, fill: "hsl(220, 10%, 60%)" }} />
                        <PolarRadiusAxis tick={false} axisLine={false} />
                        <Radar name="Custo atual" dataKey="full" stroke="hsl(340, 82%, 47%)" fill="hsl(340, 82%, 47%)" fillOpacity={0.15} />
                        <Radar name="Economia" dataKey="saving" stroke="hsl(105, 58%, 42%)" fill="hsl(105, 58%, 42%)" fillOpacity={0.3} />
                        <Tooltip contentStyle={{ background: "hsl(222, 30%, 12%)", border: "1px solid hsl(222, 15%, 20%)", borderRadius: 8, fontSize: 11 }} />
                      </RadarChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-center gap-4 mt-1">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-brand-magenta" /> Custo atual
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-brand-green" /> Economia projetada
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Methodology toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8"
        >
          <button
            onClick={() => setShowMethodology(!showMethodology)}
            className="mx-auto flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors font-heading"
          >
            <Shield className="w-3 h-3" />
            Metodologia transparente · Fontes rastreáveis
            {showMethodology ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <AnimatePresence>
            {showMethodology && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="glass-card rounded-xl p-6 mt-4 max-w-4xl mx-auto">
                  <h4 className="font-heading font-bold text-sm text-foreground mb-3">Bases científicas dos cálculos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-foreground/80">
                    <div>
                      <p className="font-heading font-bold text-brand-gold mb-1">Custo de Turnover</p>
                      <p className="font-mono bg-muted/30 px-2 py-1 rounded mb-1">colaboradores × taxa × (salário_anual × 0.5)</p>
                      <p className="text-muted-foreground">Gallup estima 50–200% do salário anual por desligamento. Usamos 50% como conservador.</p>
                    </div>
                    <div>
                      <p className="font-heading font-bold text-brand-gold mb-1">ROI 4:1</p>
                      <p className="font-mono bg-muted/30 px-2 py-1 rounded mb-1">retorno_total / investimento</p>
                      <p className="text-muted-foreground">Meta-análise OMS (2019): retorno médio de US$ 4 por US$ 1 investido. Variação: 1.6:1 a 6.3:1.</p>
                    </div>
                    <div>
                      <p className="font-heading font-bold text-brand-cyan mb-1">Redução de absenteísmo: -41%</p>
                      <p className="text-muted-foreground">Gallup Meta-Analysis (2020): unidades no quartil superior de engajamento vs inferior.</p>
                    </div>
                    <div>
                      <p className="font-heading font-bold text-brand-cyan mb-1">Produtividade: +13%</p>
                      <p className="text-muted-foreground">University of Oxford / Saïd Business School (2019): colaboradores com alto bem-estar.</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-4 border-t border-foreground/5 pt-3">
                    ⚠ Valores estimados com base nos parâmetros informados e benchmarks de referência. Não constituem auditoria financeira.
                    Resultados reais variam por setor, porte, cultura e maturidade organizacional.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
