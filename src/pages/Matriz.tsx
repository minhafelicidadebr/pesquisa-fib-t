import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity, AlertTriangle, BookOpen, Brain, ChevronRight, FileText, Filter,
  GraduationCap, Layers, Microscope, Network, ShieldCheck, Sparkles, Zap,
} from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { InstitutionalFooter } from "@/components/deck/InstitutionalFooter";
import {
  COPSOQ_DIMENSIONS, PLAYBOOK_DRIVERS, CLUSTERS, MATRIX,
  LEVEL_META, EVIDENCE_LABEL, getCell, getCellsFor,
  type AssociationLevel, type CopsoqDimension, type PlaybookDriver, type Cluster, type MatrixCell,
} from "@/data/matriz";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type PopoutKey = "what" | "how" | "rag" | "stats" | "decision" | "gro";

const POPOUTS: Record<PopoutKey, { icon: React.ElementType; title: string; subtitle: string; body: React.ReactNode }> = {
  what: {
    icon: Sparkles, title: "O que é a Matriz Inteligente?",
    subtitle: "Conexão entre psicometria, ciência do bem-estar e norma regulamentadora",
    body: (
      <div className="space-y-3 text-sm leading-relaxed">
        <p>A <strong>Matriz COPSOQ II × Work Wellbeing Playbook 2.0 × NR-1/GRO/PGR</strong> traduz resultados psicossociais em <strong>recomendações acionáveis e auditáveis</strong>.</p>
        <p>Cada associação responde: <em>quando uma dimensão COPSOQ acende em vermelho, quais drivers do Playbook devem ser ativados e quais medidas registrar no PGR?</em></p>
        <ul className="space-y-1.5 pl-4 list-disc text-muted-foreground">
          <li><strong>27 dimensões COPSOQ II</strong> (Manual Português 2013, versões curta/média/longa).</li>
          <li><strong>18 drivers Oxford</strong> organizados pelo acrônimo DRIVER.</li>
          <li><strong>13 clusters de risco psicossocial</strong> alinhados ao Guia MTE 2026.</li>
        </ul>
      </div>
    ),
  },
  how: {
    icon: GraduationCap, title: "Como ler a matriz",
    subtitle: "Pedagogia visual baseada em ciência do aprendizado",
    body: (
      <div className="space-y-3 text-sm">
        <p>Cada célula representa o <strong>Índice de Associação Integrada (IAI 0–5)</strong>, ponderando:</p>
        <ol className="space-y-1.5 pl-5 list-decimal text-muted-foreground">
          <li>Afinidade psicométrica (20%)</li>
          <li>Evidência documental (20%)</li>
          <li>Força da intervenção (20%)</li>
          <li>Aderência ao GRO/PGR (15%)</li>
          <li>Impacto comum (15%)</li>
          <li>Viabilidade (10%)</li>
        </ol>
        <div className="grid grid-cols-2 gap-2 pt-2">
          {(Object.entries(LEVEL_META) as [AssociationLevel, typeof LEVEL_META[AssociationLevel]][]).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2 text-xs"><span>{v.symbol}</span><span>{v.label}</span></div>
          ))}
        </div>
      </div>
    ),
  },
  rag: {
    icon: Microscope, title: "RAG científico — Fontes",
    subtitle: "Toda associação é rastreável até o documento de origem",
    body: (
      <div className="space-y-3 text-sm">
        <ul className="space-y-2">
          <li className="flex gap-2"><FileText className="w-4 h-4 mt-0.5 text-brand-cyan shrink-0" /><span><strong>COPSOQ II — Manual Portugal 2013</strong>: instrumento multidimensional, escala Likert 5 pontos, classificação em tercis (verde/amarelo/vermelho).</span></li>
          <li className="flex gap-2"><FileText className="w-4 h-4 mt-0.5 text-brand-gold shrink-0" /><span><strong>Work Wellbeing Playbook 2.0 — Oxford WRC</strong>: 18 drivers (DRIVER), evidência por mecanismo e força.</span></li>
          <li className="flex gap-2"><FileText className="w-4 h-4 mt-0.5 text-brand-magenta shrink-0" /><span><strong>Guia Oficial MTE 2026 — NR-1/GRO/PGR</strong>: identificar → avaliar → classificar → controlar → registrar.</span></li>
        </ul>
        <p className="text-xs text-muted-foreground italic">Cada célula traz a etiqueta de evidência: documental direta/indireta, científica, inferência técnica ou hipótese a validar.</p>
      </div>
    ),
  },
  stats: {
    icon: Brain, title: "Modelo estatístico",
    subtitle: "Tratamento técnico-defensável dos dados COPSOQ",
    body: (
      <div className="space-y-2 text-sm">
        <p>O motor calcula <strong>fator a fator</strong>, nunca um índice único:</p>
        <ul className="space-y-1 pl-4 list-disc text-muted-foreground">
          <li>Inversão de itens, padronização 0–100, classificação por tercis.</li>
          <li>Alfa de Cronbach quando subescala suficiente.</li>
          <li>Correlação · regressão · clusterização de perfis de risco.</li>
          <li>k-anonimato (mín. 7) — sem leitura individual.</li>
          <li>Alerta de baixa confiança quando amostra é pequena.</li>
        </ul>
      </div>
    ),
  },
  decision: {
    icon: Network, title: "Protocolo de decisão",
    subtitle: "De score psicométrico → plano de ação registrável",
    body: (
      <div className="space-y-2 text-sm">
        <pre className="bg-foreground/5 rounded-lg p-3 text-xs overflow-x-auto font-mono">{`SE dimensão COPSOQ = vermelho
E driver Playbook = associação crítica
E fator psicossocial = relacionado ao trabalho
ENTÃO:
 → registrar no inventário de riscos
 → propor medida no plano de ação
 → acionar responsável
 → definir indicador
 → monitorar eficácia
 → reavaliar em prazo definido`}</pre>
      </div>
    ),
  },
  gro: {
    icon: ShieldCheck, title: "Integração GRO/PGR · NR-1",
    subtitle: "Da matriz ao inventário de riscos",
    body: (
      <div className="space-y-2 text-sm">
        <p>A matriz alimenta diretamente:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {["Levantamento preliminar","Identificação de perigos","Avaliação de riscos","Classificação","Inventário de riscos","Plano de ação","Acompanhamento","Reavaliação"].map(s => (
            <div key={s} className="flex items-center gap-1.5 p-2 rounded-md bg-foreground/5"><ChevronRight className="w-3 h-3 text-brand-magenta" />{s}</div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground italic pt-1">Sem medicalização individual · linguagem organizacional · evidências documentais.</p>
      </div>
    ),
  },
};

const Matriz = () => {
  const [popout, setPopout] = useState<PopoutKey | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ d: CopsoqDimension; p: PlaybookDriver; cell: MatrixCell } | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [filterLevel, setFilterLevel] = useState<AssociationLevel | "all">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const dimensions = COPSOQ_DIMENSIONS;
  const drivers = useMemo(() =>
    filterCategory === "all" ? PLAYBOOK_DRIVERS : PLAYBOOK_DRIVERS.filter(d => d.category === filterCategory),
    [filterCategory]
  );

  const stats = useMemo(() => ({
    associations: MATRIX.length,
    critical: MATRIX.filter(c => c.level === "critica").length,
    avgIAI: (MATRIX.reduce((a,c) => a+c.iai, 0) / MATRIX.length).toFixed(2),
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      {/* HERO */}
      <section className="relative pt-32 pb-12 px-4 sm:px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-cyan/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-magenta/8 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border-brand-cyan/30 mb-6">
            <Layers className="w-3.5 h-3.5 text-brand-cyan" />
            <span className="text-xs font-heading font-semibold">Matriz Inteligente · Estado da Arte</span>
          </motion.div>
          <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="font-display text-4xl md:text-6xl font-bold mb-5 leading-tight max-w-4xl">
            COPSOQ II × <span className="text-gradient-gold">Playbook 2.0</span> × <span className="text-gradient-magenta">NR-1/GRO/PGR</span>
          </motion.h1>
          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
            className="text-base md:text-lg text-muted-foreground max-w-3xl mb-8">
            Sistema de decisão técnico-científico que conecta <strong className="text-foreground">psicometria ocupacional</strong>, <strong className="text-foreground">ciência do bem-estar</strong> e <strong className="text-foreground">norma regulamentadora</strong> — em recomendações auditáveis, explicáveis e implementáveis.
          </motion.p>

          {/* Métricas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { v: dimensions.length, l: "Dimensões COPSOQ", c: "text-brand-cyan" },
              { v: PLAYBOOK_DRIVERS.length, l: "Drivers Oxford", c: "text-brand-gold" },
              { v: stats.associations, l: "Associações", c: "text-brand-magenta" },
              { v: stats.avgIAI, l: "IAI médio", c: "text-brand-green" },
            ].map((s, i) => (
              <motion.div key={s.l} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.3 + i*0.05 }}
                className="glass-card rounded-xl p-4">
                <p className={cn("font-display text-3xl font-bold", s.c)}>{s.v}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.l}</p>
              </motion.div>
            ))}
          </div>

          {/* CTAs pedagógicos */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(POPOUTS) as PopoutKey[]).map(k => {
              const P = POPOUTS[k]; const Icon = P.icon;
              return (
                <button key={k} onClick={() => setPopout(k)}
                  className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-full glass-card border-foreground/10 hover:border-brand-gold/40 hover:bg-foreground/5 transition-all text-xs font-heading font-medium">
                  <Icon className="w-3.5 h-3.5 text-brand-gold group-hover:scale-110 transition-transform" />
                  {P.title}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTEÚDO */}
      <section className="px-4 sm:px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="heatmap" className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl mb-8">
              <TabsTrigger value="heatmap"><Activity className="w-3.5 h-3.5 mr-1.5" />Heatmap</TabsTrigger>
              <TabsTrigger value="clusters"><Layers className="w-3.5 h-3.5 mr-1.5" />Clusters</TabsTrigger>
              <TabsTrigger value="drivers"><Zap className="w-3.5 h-3.5 mr-1.5" />Drivers</TabsTrigger>
              <TabsTrigger value="protocol"><Network className="w-3.5 h-3.5 mr-1.5" />Protocolo</TabsTrigger>
            </TabsList>

            {/* HEATMAP */}
            <TabsContent value="heatmap" className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-card border border-foreground/10 rounded-lg px-3 py-1.5 text-xs font-heading">
                  <option value="all">Todas as categorias DRIVER</option>
                  <option value="D">D — Development & Security</option>
                  <option value="R">R — Relationships</option>
                  <option value="I">I — Independence & Flexibility</option>
                  <option value="V">V — Variety & Fulfilment</option>
                  <option value="E">E — Earnings</option>
                  <option value="H">H — Risk, Health & Safety</option>
                </select>
                <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value as any)}
                  className="bg-card border border-foreground/10 rounded-lg px-3 py-1.5 text-xs font-heading">
                  <option value="all">Toda associação</option>
                  <option value="critica">🔴 Crítica</option>
                  <option value="forte">🟠 Forte</option>
                  <option value="moderada">🟡 Moderada</option>
                </select>
                <span className="ml-auto text-xs text-muted-foreground">Clique uma célula para detalhes</span>
              </div>

              <div className="glass-card rounded-2xl p-3 overflow-x-auto">
                <table className="w-full border-separate border-spacing-1 text-xs">
                  <thead>
                    <tr>
                      <th className="sticky left-0 bg-card z-10 text-left p-2 font-heading font-semibold text-muted-foreground min-w-[200px]">
                        Dimensão COPSOQ
                      </th>
                      {drivers.map(d => (
                        <th key={d.id} className="p-1 align-bottom">
                          <button onClick={() => setSelectedCell(null)}
                            className="writing-mode-vertical text-[10px] font-heading font-semibold text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                            {d.name}
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dimensions.map(dim => (
                      <tr key={dim.id} className="group">
                        <td className="sticky left-0 bg-card z-10 p-2 text-xs font-heading font-medium border-r border-foreground/10">
                          <button onClick={() => {
                            const top = getCellsFor(dim.id)[0];
                            if (top) {
                              const drv = PLAYBOOK_DRIVERS.find(p => p.id === top.driverId)!;
                              setSelectedCell({ d: dim, p: drv, cell: top });
                            }
                          }}
                            className="text-left hover:text-brand-gold transition-colors">
                            {dim.name}
                          </button>
                        </td>
                        {drivers.map(drv => {
                          const cell = getCell(dim.id, drv.id);
                          const visible = cell && (filterLevel === "all" || cell.level === filterLevel);
                          return (
                            <td key={drv.id} className="p-0.5">
                              {visible ? (
                                <button onClick={() => setSelectedCell({ d: dim, p: drv, cell })}
                                  className={cn(
                                    "w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-bold transition-all hover:scale-125 hover:z-20 hover:shadow-lg relative",
                                    LEVEL_META[cell.level].color,
                                    cell.level === "critica" || cell.level === "forte" ? "text-white" : "text-foreground"
                                  )}
                                  title={`${dim.name} × ${drv.name} · IAI ${cell.iai}`}>
                                  {cell.iai.toFixed(1)}
                                </button>
                              ) : (
                                <div className="w-8 h-8 rounded-md bg-foreground/[0.02]" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legenda */}
              <div className="flex flex-wrap gap-3 px-2 text-xs text-muted-foreground">
                {(Object.entries(LEVEL_META) as [AssociationLevel, typeof LEVEL_META[AssociationLevel]][])
                  .filter(([k]) => k !== "fraca" && k !== "nao_recomendada")
                  .map(([k, v]) => (
                    <div key={k} className="flex items-center gap-1.5">
                      <div className={cn("w-3 h-3 rounded", v.color)} />{v.label}
                    </div>
                  ))}
                <div className="flex items-center gap-1.5"><span>🔢</span>Valor = IAI (0–5)</div>
              </div>
            </TabsContent>

            {/* CLUSTERS */}
            <TabsContent value="clusters" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CLUSTERS.map((c, i) => (
                <motion.button key={c.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.03 }}
                  onClick={() => setSelectedCluster(c)}
                  className="text-left glass-card rounded-2xl p-5 hover:border-brand-gold/40 hover:scale-[1.02] transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <span className={cn(
                      "text-[10px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                      c.urgency === "alta" && "bg-brand-magenta/15 text-brand-magenta",
                      c.urgency === "media" && "bg-brand-gold/15 text-brand-gold",
                      c.urgency === "baixa" && "bg-brand-cyan/15 text-brand-cyan",
                    )}>
                      {c.urgency === "alta" && <AlertTriangle className="w-2.5 h-2.5 inline mr-1" />}
                      Urgência {c.urgency}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-gold group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-heading font-bold text-base mb-2 group-hover:text-brand-gold transition-colors">{c.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{c.nr1Risk}</p>
                  <div className="flex flex-wrap gap-1">
                    {c.priorityDrivers.slice(0,3).map(did => {
                      const d = PLAYBOOK_DRIVERS.find(p => p.id === did);
                      return d && (
                        <span key={did} className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/5 text-muted-foreground">{d.name}</span>
                      );
                    })}
                  </div>
                </motion.button>
              ))}
            </TabsContent>

            {/* DRIVERS */}
            <TabsContent value="drivers" className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(["D","R","I","V","E","H"] as const).map(cat => {
                const list = PLAYBOOK_DRIVERS.filter(d => d.category === cat);
                if (!list.length) return null;
                return (
                  <div key={cat} className="glass-card rounded-2xl p-5">
                    <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-gold mb-3">
                      {cat} — {list[0].categoryLabel}
                    </p>
                    <div className="space-y-3">
                      {list.map(d => (
                        <div key={d.id} className="border-l-2 border-brand-gold/30 pl-3">
                          <p className="font-heading font-semibold text-sm">{d.name}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{d.definition}</p>
                          <p className="text-[10px] text-brand-cyan mt-1 italic">Mecanismo: {d.mechanism}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            {/* PROTOCOLO */}
            <TabsContent value="protocol">
              <div className="glass-card rounded-2xl p-6 max-w-3xl mx-auto">
                <h3 className="font-display text-2xl font-bold mb-4">Da matriz ao plano de ação</h3>
                <div className="space-y-3">
                  {[
                    { t: "1. Medir", d: "Aplicar COPSOQ II (curta/média/longa) com k-anonimato.", i: BookOpen, bg: "bg-brand-cyan/15", fg: "text-brand-cyan" },
                    { t: "2. Classificar", d: "Tercis verde/amarelo/vermelho fator a fator.", i: Activity, bg: "bg-brand-gold/15", fg: "text-brand-gold" },
                    { t: "3. Associar", d: "Matriz aciona drivers com IAI ≥ 4,5 (críticos).", i: Network, bg: "bg-brand-magenta/15", fg: "text-brand-magenta" },
                    { t: "4. Intervir", d: "Aplicar intervenção Playbook no nível adequado.", i: Zap, bg: "bg-brand-green/15", fg: "text-brand-green" },
                    { t: "5. Registrar", d: "Inventário de riscos + plano de ação no PGR (NR-1).", i: ShieldCheck, bg: "bg-brand-cyan/15", fg: "text-brand-cyan" },
                    { t: "6. Reavaliar", d: "Indicadores + nova rodada COPSOQ em prazo definido.", i: GraduationCap, bg: "bg-brand-gold/15", fg: "text-brand-gold" },
                  ].map((s) => {
                    const Icon = s.i;
                    return (
                      <div key={s.t} className="flex gap-4 items-start">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", s.bg)}>
                          <Icon className={cn("w-5 h-5", s.fg)} />
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="font-heading font-bold text-sm">{s.t}</p>
                          <p className="text-xs text-muted-foreground">{s.d}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* POP-OUT pedagógico */}
      <Dialog open={!!popout} onOpenChange={(o) => !o && setPopout(null)}>
        <DialogContent className="max-w-xl glass-card-strong border-brand-gold/20">
          {popout && (() => {
            const P = POPOUTS[popout]; const Icon = P.icon;
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-brand-gold/15 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <DialogTitle className="font-display text-xl">{P.title}</DialogTitle>
                      <p className="text-xs text-muted-foreground">{P.subtitle}</p>
                    </div>
                  </div>
                </DialogHeader>
                {P.body}
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* CELL DETAIL */}
      <Dialog open={!!selectedCell} onOpenChange={(o) => !o && setSelectedCell(null)}>
        <DialogContent className="max-w-lg glass-card-strong">
          {selectedCell && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-lg leading-tight">
                  {selectedCell.d.name} <span className="text-muted-foreground">×</span> {selectedCell.p.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className={cn("px-3 py-1 rounded-full text-xs font-bold", LEVEL_META[selectedCell.cell.level].color,
                    selectedCell.cell.level === "critica" || selectedCell.cell.level === "forte" ? "text-white" : "text-foreground")}>
                    {LEVEL_META[selectedCell.cell.level].symbol} {LEVEL_META[selectedCell.cell.level].label}
                  </div>
                  <div className="text-xs"><span className="text-muted-foreground">IAI:</span> <strong>{selectedCell.cell.iai.toFixed(2)} / 5</strong></div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-gold font-heading font-bold mb-1">Mecanismo</p>
                  <p className="text-sm">{selectedCell.cell.mechanism}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-cyan font-heading font-bold mb-1">Evidência</p>
                  <p className="text-sm">{EVIDENCE_LABEL[selectedCell.cell.evidence]}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-magenta font-heading font-bold mb-1">Fator psicossocial (NR-1)</p>
                  <p className="text-sm">{selectedCell.d.fatorPsicossocial}</p>
                </div>
                <div className="bg-foreground/5 rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-widest text-foreground font-heading font-bold mb-1">Intervenção Playbook 2.0</p>
                  <p className="text-sm">{selectedCell.p.intervention}</p>
                  <p className="text-[10px] text-muted-foreground italic mt-1">Cautela: {selectedCell.d.cautela}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* CLUSTER DETAIL */}
      <Dialog open={!!selectedCluster} onOpenChange={(o) => !o && setSelectedCluster(null)}>
        <DialogContent className="max-w-2xl glass-card-strong">
          {selectedCluster && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">{selectedCluster.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-foreground/5 rounded-lg p-3">
                    <p className="text-[10px] uppercase tracking-widest text-brand-magenta font-heading font-bold mb-1">Risco NR-1</p>
                    <p className="text-sm">{selectedCluster.nr1Risk}</p>
                  </div>
                  <div className="bg-foreground/5 rounded-lg p-3">
                    <p className="text-[10px] uppercase tracking-widest text-brand-cyan font-heading font-bold mb-1">Indicador</p>
                    <p className="text-sm">{selectedCluster.indicator}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-gold font-heading font-bold mb-2">Dimensões COPSOQ envolvidas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCluster.copsoqIds.map(id => {
                      const d = COPSOQ_DIMENSIONS.find(x => x.id === id);
                      return d && <span key={id} className="text-xs px-2.5 py-1 rounded-full bg-brand-cyan/10 text-brand-cyan">{d.name}</span>;
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-gold font-heading font-bold mb-2">Drivers prioritários (Playbook 2.0)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCluster.priorityDrivers.map(id => {
                      const d = PLAYBOOK_DRIVERS.find(x => x.id === id);
                      return d && <span key={id} className="text-xs px-2.5 py-1 rounded-full bg-brand-gold/10 text-brand-gold">{d.name}</span>;
                    })}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-brand-gold/10 to-brand-magenta/10 rounded-lg p-4">
                  <p className="text-[10px] uppercase tracking-widest text-foreground font-heading font-bold mb-1">Intervenção recomendada</p>
                  <p className="text-sm">{selectedCluster.intervention}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <InstitutionalFooter />
    </div>
  );
};

export default Matriz;
