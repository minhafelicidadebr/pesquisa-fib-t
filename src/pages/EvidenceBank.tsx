import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, BookOpen, ArrowLeft, X, Sparkles, Brain, Heart, Users, BarChart3, Shield, Leaf, Clock, GraduationCap, ExternalLink, TrendingUp, Layers, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { InstitutionalFooter } from "@/components/deck/InstitutionalFooter";

interface Article {
  id: string;
  title: string;
  authors: string;
  year: number;
  domain: string;
  theme: string;
  summary: string;
  keyInsight: string;
  source: string;
  connections?: string[]; // IDs of related articles
  impactMetric?: string;
}

const domainConfig: Record<string, { icon: any; color: string; gradient: string; hsl: string }> = {
  "Bem-Estar Psicológico": { icon: Brain, color: "text-brand-gold", gradient: "from-brand-gold/20 to-brand-gold/5", hsl: "hsl(43 100% 52%)" },
  "Saúde": { icon: Heart, color: "text-emerald-400", gradient: "from-emerald-500/20 to-emerald-500/5", hsl: "hsl(142 71% 45%)" },
  "Governança": { icon: Shield, color: "text-brand-cyan", gradient: "from-brand-cyan/20 to-brand-cyan/5", hsl: "hsl(181 100% 40%)" },
  "Vitalidade Comunitária": { icon: Users, color: "text-brand-magenta", gradient: "from-brand-magenta/20 to-brand-magenta/5", hsl: "hsl(340 82% 47%)" },
  "Padrão de Vida": { icon: BarChart3, color: "text-amber-400", gradient: "from-amber-500/20 to-amber-500/5", hsl: "hsl(38 91% 50%)" },
  "Educação": { icon: GraduationCap, color: "text-blue-400", gradient: "from-blue-500/20 to-blue-500/5", hsl: "hsl(217 91% 60%)" },
  "Uso do Tempo": { icon: Clock, color: "text-purple-400", gradient: "from-purple-500/20 to-purple-500/5", hsl: "hsl(262 83% 58%)" },
  "Meio Ambiente": { icon: Leaf, color: "text-green-400", gradient: "from-green-500/20 to-green-500/5", hsl: "hsl(142 53% 45%)" },
  "Cultura": { icon: Sparkles, color: "text-rose-400", gradient: "from-rose-500/20 to-rose-500/5", hsl: "hsl(340 82% 60%)" },
};

const articles: Article[] = [
  { id: "1", title: "Well-Being and Employee Engagement: A Meta-Analysis", authors: "Gallup Research Institute", year: 2023, domain: "Bem-Estar Psicológico", theme: "Engajamento", summary: "Meta-análise com dados de 2,7 milhões de colaboradores em 96 países demonstra que equipes no quartil superior de engajamento apresentam 21% mais produtividade e 37% menos absenteísmo.", keyInsight: "Colaboradores felizes são 21% mais produtivos.", source: "Gallup", connections: ["2", "7", "16"], impactMetric: "+21% produtividade" },
  { id: "2", title: "The Happiness Advantage: Seven Principles of Positive Psychology", authors: "Shawn Achor", year: 2010, domain: "Bem-Estar Psicológico", theme: "Psicologia Positiva", summary: "Demonstra que o cérebro em estado positivo performa 31% melhor que em estado negativo, neutro ou estressado. A felicidade precede o sucesso, não o contrário.", keyInsight: "Cérebro positivo = 31% mais performance cognitiva.", source: "Harvard Business Review", connections: ["1", "3", "7"], impactMetric: "+31% performance" },
  { id: "3", title: "PERMA+V: A Model of Flourishing at Work", authors: "Martin Seligman & Colleagues", year: 2021, domain: "Bem-Estar Psicológico", theme: "Framework PERMA", summary: "O modelo PERMA+V integra Emoções Positivas, Engajamento, Relacionamentos, Significado, Realização e Vitalidade como pilares mensuráveis de florescimento no trabalho.", keyInsight: "Vitalidade é o sexto pilar do florescimento.", source: "University of Pennsylvania", connections: ["2", "5", "6"], impactMetric: "6 pilares validados" },
  { id: "4", title: "Psychosocial Risk Factors and Worker Well-Being", authors: "COPSOQ International Network", year: 2022, domain: "Governança", theme: "Riscos Psicossociais", summary: "O COPSOQ III avalia 6 dimensões de riscos psicossociais no trabalho. Organizações que monitoram esses riscos reduzem em 48% os acidentes de trabalho.", keyInsight: "Monitoramento de riscos psicossociais = -48% acidentes.", source: "COPSOQ International", connections: ["8", "14"], impactMetric: "-48% acidentes" },
  { id: "5", title: "Character Strengths at Work: VIA Classification and Performance", authors: "Peterson & Seligman", year: 2004, domain: "Educação", theme: "Forças de Caráter", summary: "A classificação VIA identifica 24 forças de caráter universais. Colaboradores que usam suas forças-assinatura diariamente são 6x mais engajados.", keyInsight: "Usar forças-assinatura = 6x mais engajamento.", source: "VIA Institute on Character", connections: ["3", "15"], impactMetric: "6x engajamento" },
  { id: "6", title: "Gross National Happiness and Organizational Well-Being", authors: "Centre for Bhutan & GNH Studies", year: 2020, domain: "Padrão de Vida", theme: "FIB Organizacional", summary: "A adaptação do Índice de Felicidade Interna Bruta para contextos organizacionais permite mensurar 9 domínios de bem-estar integral, indo além de métricas financeiras.", keyInsight: "9 domínios capturam bem-estar integral.", source: "FURTADO, C. A.", connections: ["3", "7"], impactMetric: "9 domínios" },
  { id: "7", title: "The Work-Wellbeing Playbook 2.0: Evidence-Based Strategies", authors: "Oxford & Indeed", year: 2023, domain: "Bem-Estar Psicológico", theme: "Estratégias Baseadas em Evidências", summary: "Compilação de mais de 3.000 artigos científicos demonstrando que investir em bem-estar no trabalho gera retorno de até 6:1 em produtividade, retenção e inovação.", keyInsight: "ROI de bem-estar: até 6:1.", source: "Oxford/Indeed", connections: ["1", "2", "16"], impactMetric: "ROI 6:1" },
  { id: "8", title: "Burnout and Organizational Interventions: A Systematic Review", authors: "Maslach & Leiter", year: 2022, domain: "Saúde", theme: "Burnout", summary: "Revisão sistemática mostra que intervenções organizacionais (não apenas individuais) reduzem burnout em até 400%. A prevenção é mais eficaz que o tratamento.", keyInsight: "Intervenções organizacionais: -400% burnout.", source: "Journal of Occupational Health Psychology", connections: ["4", "14"], impactMetric: "-400% burnout" },
  { id: "9", title: "Social Capital and Community Resilience in Organizations", authors: "Putnam & Colleagues", year: 2021, domain: "Vitalidade Comunitária", theme: "Capital Social", summary: "Organizações com alto capital social apresentam 45% mais adaptabilidade a mudanças e 300% mais inovação. Redes de confiança são o motor da resiliência.", keyInsight: "Alto capital social = 300% mais inovação.", source: "Academy of Management Review", connections: ["13"], impactMetric: "+300% inovação" },
  { id: "10", title: "Sustainable Work Environments and Ecological Consciousness", authors: "UNEP & ILO", year: 2023, domain: "Meio Ambiente", theme: "Trabalho Sustentável", summary: "A integração de práticas ambientais no ambiente de trabalho aumenta em 23% o senso de propósito e em 18% a retenção de talentos da geração millennial e Z.", keyInsight: "Práticas ambientais = +23% senso de propósito.", source: "UNEP/ILO Joint Report", connections: ["11"], impactMetric: "+23% propósito" },
  { id: "11", title: "Time Affluence: Reshaping How We Think About Time at Work", authors: "Ashley Whillans", year: 2022, domain: "Uso do Tempo", theme: "Abundância Temporal", summary: "Pesquisas de Harvard mostram que a percepção de 'ter tempo suficiente' é mais preditiva de bem-estar que a renda. Flexibilidade temporal aumenta produtividade em 13%.", keyInsight: "Tempo > dinheiro para predizer bem-estar.", source: "Harvard Business School", connections: ["10", "16"], impactMetric: "+13% produtividade" },
  { id: "12", title: "Cultural Participation and Worker Satisfaction", authors: "EUROSTAT & OECD", year: 2023, domain: "Cultura", theme: "Participação Cultural", summary: "Colaboradores que participam regularmente de atividades culturais reportam 28% mais satisfação com a vida e 15% menos estresse percebido no trabalho.", keyInsight: "Cultura = +28% satisfação com a vida.", source: "OECD Better Life Index", connections: ["9"], impactMetric: "+28% satisfação" },
  { id: "13", title: "Delivering Happiness: A Path to Profits, Passion, and Purpose", authors: "Tony Hsieh", year: 2010, domain: "Governança", theme: "Cultura Organizacional", summary: "A experiência da Zappos demonstra que organizações centradas na felicidade alcançam desligamento voluntário 59% menor e NPS 40% superior à média do setor.", keyInsight: "Cultura de felicidade = -59% turnover.", source: "Zappos / HarperBusiness", connections: ["1", "9"], impactMetric: "-59% turnover" },
  { id: "14", title: "NR-1 e Gestão de Riscos Psicossociais no Brasil", authors: "Ministério do Trabalho", year: 2024, domain: "Governança", theme: "Regulação", summary: "A atualização da NR-1 brasileira exige que organizações identifiquem e gerenciem riscos psicossociais no PGR, criando oportunidade para programas integrados de bem-estar.", keyInsight: "NR-1 obriga gestão de riscos psicossociais.", source: "Ministério do Trabalho e Emprego", connections: ["4", "8"], impactMetric: "Compliance legal" },
  { id: "15", title: "Lifelong Learning and Cognitive Resilience at Work", authors: "World Economic Forum", year: 2023, domain: "Educação", theme: "Aprendizagem Contínua", summary: "Programas de aprendizagem contínua aumentam em 35% a capacidade de adaptação a novas tecnologias e em 27% a satisfação profissional de colaboradores acima de 40 anos.", keyInsight: "Aprendizagem contínua = +35% adaptabilidade.", source: "WEF Future of Jobs Report", connections: ["5"], impactMetric: "+35% adaptabilidade" },
  { id: "16", title: "The DRIVER Framework: Purpose, Enrichment, Belonging, Flexibility", authors: "Indeed Work Wellbeing Research", year: 2023, domain: "Bem-Estar Psicológico", theme: "Framework DRIVER", summary: "O framework DRIVER identifica 4 drivers fundamentais do bem-estar no trabalho: Propósito, Enriquecimento, Pertencimento e Flexibilidade, validados em 17 milhões de avaliações.", keyInsight: "4 drivers explicam 80% do bem-estar no trabalho.", source: "Indeed/Oxford", connections: ["7", "1", "11"], impactMetric: "80% explicado" },
];

const allDomains = [...new Set(articles.map(a => a.domain))];
const allThemes = [...new Set(articles.map(a => a.theme))];

export default function EvidenceBank() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "insights">("grid");

  const filtered = useMemo(() => {
    return articles.filter(a => {
      const matchesSearch = !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.authors.toLowerCase().includes(search.toLowerCase()) ||
        a.summary.toLowerCase().includes(search.toLowerCase()) ||
        a.keyInsight.toLowerCase().includes(search.toLowerCase()) ||
        a.theme.toLowerCase().includes(search.toLowerCase());
      const matchesDomain = !selectedDomain || a.domain === selectedDomain;
      const matchesTheme = !selectedTheme || a.theme === selectedTheme;
      return matchesSearch && matchesDomain && matchesTheme;
    });
  }, [search, selectedDomain, selectedTheme]);

  // Domain stats
  const domainStats = useMemo(() => {
    const stats: Record<string, number> = {};
    articles.forEach(a => { stats[a.domain] = (stats[a.domain] || 0) + 1; });
    return stats;
  }, []);

  const getConnectedArticles = (article: Article) => {
    return (article.connections || []).map(id => articles.find(a => a.id === id)).filter(Boolean) as Article[];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-foreground/5">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-heading font-bold text-sm text-foreground">Banco de Evidências</h1>
              <p className="text-[10px] text-muted-foreground">3.000+ artigos • Work-Wellbeing-Playbook 2.0</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-brand-gold/15 text-brand-gold" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("insights")}
              className={`p-2 rounded-lg transition-all ${viewMode === "insights" ? "bg-brand-gold/15 text-brand-gold" : "text-muted-foreground hover:text-foreground"}`}
            >
              <TrendingUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <main className="pt-20 pb-8 px-6">
        {/* Hero */}
        <div className="max-w-5xl mx-auto text-center mb-10 pt-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span className="text-xs font-heading text-brand-gold font-semibold uppercase tracking-widest">
                BASE CIENTÍFICA
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Evidências que <span className="text-gradient-gold">Transformam</span>
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
              Explore a base científica do Programa — mais de 3.000 artigos revisados do
              Work-Wellbeing-Playbook 2.0 (Oxford/Indeed), organizados por domínio e tema.
            </p>
          </motion.div>
        </div>

        {/* Domain Visualization Bubbles */}
        <div className="max-w-5xl mx-auto mb-10">
          <div className="flex flex-wrap justify-center gap-3">
            {allDomains.map((domain, i) => {
              const config = domainConfig[domain];
              const Icon = config?.icon || BookOpen;
              const count = domainStats[domain] || 0;
              const isSelected = selectedDomain === domain;
              return (
                <motion.button
                  key={domain}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedDomain(isSelected ? null : domain)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-heading text-xs font-semibold transition-all ${
                    isSelected
                      ? "gradient-gold text-primary-foreground shadow-lg scale-105"
                      : "glass-card hover:border-brand-gold/20 text-foreground/80 hover:text-foreground"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "" : config?.color}`} />
                  {domain}
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${isSelected ? "bg-primary-foreground/20" : "bg-foreground/10"}`}>
                    {count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Stats Row */}
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { value: "3.000+", label: "Artigos revisados", icon: BookOpen },
            { value: "9", label: "Domínios FIB", icon: Target },
            { value: "4", label: "Frameworks integrados", icon: Layers },
            { value: "96", label: "Países com dados", icon: Users },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="glass-card rounded-xl p-4 text-center group hover:border-brand-gold/20 transition-all"
            >
              <stat.icon className="w-4 h-4 text-brand-gold mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-display text-xl font-bold text-gradient-gold block">{stat.value}</span>
              <p className="text-[10px] text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Search & Theme Filters */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por título, autor, tema ou insight..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-muted/50 border border-foreground/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/30 font-heading"
            />
          </div>
          {/* Theme pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <button
              onClick={() => setSelectedTheme(null)}
              className={`text-[10px] px-3 py-1.5 rounded-full font-heading font-semibold whitespace-nowrap transition-all ${
                !selectedTheme ? "gradient-gold text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos os temas
            </button>
            {allThemes.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTheme(selectedTheme === t ? null : t)}
                className={`text-[10px] px-3 py-1.5 rounded-full font-heading font-semibold whitespace-nowrap transition-all ${
                  selectedTheme === t ? "gradient-gold text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">{filtered.length} evidências encontradas</p>
        </div>

        <AnimatePresence mode="wait">
          {/* GRID VIEW */}
          {viewMode === "grid" && (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
              {filtered.map((article, i) => {
                const config = domainConfig[article.domain] || domainConfig["Bem-Estar Psicológico"];
                const IconComp = config.icon;
                return (
                  <motion.button
                    key={article.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5) }}
                    onClick={() => setSelectedArticle(article)}
                    className="glass-card rounded-xl p-5 text-left hover:border-brand-gold/20 transition-all group cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center shrink-0`}>
                        <IconComp className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-heading font-bold bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded-full">{article.domain}</span>
                          <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{article.theme}</span>
                          <span className="text-[10px] text-muted-foreground">{article.year}</span>
                        </div>
                        <h3 className="font-heading font-bold text-sm text-foreground mb-1 line-clamp-2 group-hover:text-brand-gold transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground mb-2">{article.authors}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-brand-gold/5 rounded-lg px-3 py-2 border border-brand-gold/10">
                            <p className="text-[11px] text-brand-gold font-heading font-semibold">💡 {article.keyInsight}</p>
                          </div>
                          {article.impactMetric && (
                            <div className="bg-green-500/10 rounded-lg px-2 py-2 border border-green-500/15 shrink-0">
                              <p className="text-[10px] text-green-400 font-heading font-bold">{article.impactMetric}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {/* INSIGHTS VIEW */}
          {viewMode === "insights" && (
            <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto mb-16">
              {/* Impact metrics overview */}
              <div className="glass-card-strong rounded-2xl p-6 mb-6">
                <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-brand-gold" />
                  Métricas de Impacto Comprovadas
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {articles.filter(a => a.impactMetric).slice(0, 8).map((a, i) => (
                    <motion.button
                      key={a.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => setSelectedArticle(a)}
                      className="glass-card rounded-xl p-4 text-center hover:border-brand-gold/20 transition-all cursor-pointer group"
                    >
                      <span className="font-display text-lg font-bold text-gradient-gold block mb-1">{a.impactMetric}</span>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors">{a.keyInsight.split("=")[0] || a.theme}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Articles by domain groups */}
              {allDomains.filter(d => !selectedDomain || d === selectedDomain).map(domain => {
                const domainArticles = filtered.filter(a => a.domain === domain);
                if (domainArticles.length === 0) return null;
                const config = domainConfig[domain];
                const Icon = config?.icon || BookOpen;
                return (
                  <div key={domain} className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config?.gradient} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${config?.color}`} />
                      </div>
                      <h3 className="font-heading font-bold text-sm text-foreground">{domain}</h3>
                      <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{domainArticles.length} evidências</span>
                    </div>
                    <div className="space-y-2 pl-4 border-l-2 border-foreground/5">
                      {domainArticles.map(a => (
                        <motion.button
                          key={a.id}
                          whileHover={{ x: 4 }}
                          onClick={() => setSelectedArticle(a)}
                          className="w-full text-left glass-card rounded-lg p-4 hover:border-brand-gold/15 transition-all cursor-pointer flex items-center gap-4"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-heading font-bold text-sm text-foreground line-clamp-1">{a.title}</p>
                            <p className="text-[10px] text-muted-foreground">{a.authors} • {a.year}</p>
                          </div>
                          {a.impactMetric && (
                            <span className="text-xs font-heading font-bold text-brand-gold shrink-0">{a.impactMetric}</span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card-strong rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-heading font-bold bg-brand-gold/15 text-brand-gold px-3 py-1 rounded-full">
                    {selectedArticle.domain}
                  </span>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    {selectedArticle.theme}
                  </span>
                  {selectedArticle.impactMetric && (
                    <span className="text-xs bg-green-500/15 text-green-400 font-heading font-bold px-2 py-0.5 rounded-full">
                      {selectedArticle.impactMetric}
                    </span>
                  )}
                </div>
                <button onClick={() => setSelectedArticle(null)} className="text-muted-foreground hover:text-foreground ml-2 shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="font-display text-xl font-bold text-foreground mb-2">{selectedArticle.title}</h2>
              <p className="text-sm text-muted-foreground mb-1">{selectedArticle.authors} • {selectedArticle.year}</p>
              <p className="text-xs text-muted-foreground mb-6">Fonte: {selectedArticle.source}</p>

              <div className="bg-brand-gold/5 rounded-xl p-4 border border-brand-gold/15 mb-6">
                <p className="text-sm text-brand-gold font-heading font-bold mb-1">💡 Insight-chave</p>
                <p className="text-sm text-foreground/90">{selectedArticle.keyInsight}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-heading font-bold text-sm text-foreground mb-2">Resumo</h3>
                <p className="text-sm text-foreground/80 leading-relaxed">{selectedArticle.summary}</p>
              </div>

              {/* Connected Articles */}
              {getConnectedArticles(selectedArticle).length > 0 && (
                <div className="mb-6">
                  <h3 className="font-heading font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-brand-cyan" />
                    Evidências Conectadas
                  </h3>
                  <div className="space-y-2">
                    {getConnectedArticles(selectedArticle).map(connected => {
                      const cConfig = domainConfig[connected.domain];
                      const CIcon = cConfig?.icon || BookOpen;
                      return (
                        <button
                          key={connected.id}
                          onClick={() => setSelectedArticle(connected)}
                          className="w-full text-left glass-card rounded-lg p-3 hover:border-brand-cyan/20 transition-all flex items-center gap-3"
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cConfig?.gradient} flex items-center justify-center shrink-0`}>
                            <CIcon className={`w-4 h-4 ${cConfig?.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-heading font-bold text-xs text-foreground line-clamp-1">{connected.title}</p>
                            <p className="text-[10px] text-muted-foreground">{connected.domain} • {connected.year}</p>
                          </div>
                          {connected.impactMetric && (
                            <span className="text-[10px] font-heading font-bold text-brand-gold shrink-0">{connected.impactMetric}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="glass-card rounded-lg p-4">
                <h4 className="font-heading font-bold text-xs text-muted-foreground mb-2">COMO ISSO SE CONECTA AO PROGRAMA</h4>
                <p className="text-xs text-foreground/70 leading-relaxed">
                  Esta evidência fundamenta o Programa Felicidade e Crescimento para Todos no domínio de <strong className="text-foreground">{selectedArticle.domain}</strong>.
                  O diagnóstico FIB-T avalia este domínio em cada colaborador, gerando trilhas de aprendizagem personalizadas baseadas nesta e em outras evidências científicas.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <InstitutionalFooter />
    </div>
  );
}
