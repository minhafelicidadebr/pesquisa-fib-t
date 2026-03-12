import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Brain, Shield, Users, ArrowRight, X, Sparkles, Lightbulb, Target, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface KnowledgeCard {
  id: string;
  icon: any;
  title: string;
  subtitle: string;
  color: string;
  gradient: string;
  keyFact: string;
  details: string;
  source: string;
}

const knowledgeCards: KnowledgeCard[] = [
  {
    id: "driver",
    icon: Target,
    title: "Framework DRIVER",
    subtitle: "Os 4 motores do bem-estar no trabalho",
    color: "text-brand-gold",
    gradient: "from-brand-gold/20 to-brand-gold/5",
    keyFact: "Propósito, Enriquecimento, Pertencimento e Flexibilidade explicam 80% do bem-estar ocupacional.",
    details: "O Framework DRIVER, validado pelo Indeed e pela Universidade de Oxford com mais de 17 milhões de avaliações, identifica quatro drivers fundamentais: Propósito (sentir que o trabalho importa), Enriquecimento (aprender e crescer continuamente), Pertencimento (sentir-se parte de algo maior) e Flexibilidade (ter autonomia sobre como e quando trabalhar). Organizações que atuam nesses 4 eixos reportam ROI de até 6:1 em programas de bem-estar.",
    source: "Indeed/Oxford Work Wellbeing Research, 2023",
  },
  {
    id: "perma",
    icon: Sparkles,
    title: "Modelo PERMA+V",
    subtitle: "A ciência do florescimento humano",
    color: "text-brand-cyan",
    gradient: "from-brand-cyan/20 to-brand-cyan/5",
    keyFact: "6 pilares mensuráveis: Emoções Positivas, Engajamento, Relacionamentos, Significado, Realização e Vitalidade.",
    details: "Desenvolvido por Martin Seligman na Universidade da Pensilvânia, o PERMA+V é o modelo mais validado da psicologia positiva para florescimento humano. A adição de Vitalidade (V) reconhece que saúde física e energia são fundamentos inegociáveis do bem-estar. No Programa Felicidade e Crescimento para Todos, o PERMA+V é integrado ao diagnóstico FIB-T para capturar dimensões subjetivas que métricas tradicionais de RH não alcançam.",
    source: "Seligman, M. (2021) — University of Pennsylvania",
  },
  {
    id: "copsoq",
    icon: Shield,
    title: "COPSOQ III",
    subtitle: "Gestão de riscos psicossociais",
    color: "text-emerald-400",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    keyFact: "Organizações que monitoram riscos psicossociais reduzem acidentes em 48% e afastamentos em 35%.",
    details: "O Copenhagen Psychosocial Questionnaire (COPSOQ) é o instrumento mais utilizado mundialmente para avaliação de riscos psicossociais no trabalho. Em sua terceira versão, avalia 6 dimensões críticas: Demandas, Organização do Trabalho, Relações Interpessoais, Interface Trabalho-Indivíduo, Valores e Saúde/Bem-estar. No Brasil, a atualização da NR-1 (2024) exige que organizações incluam riscos psicossociais no PGR, tornando o COPSOQ ferramenta essencial de compliance.",
    source: "COPSOQ International Network & MTE/Brasil (NR-1, 2024)",
  },
  {
    id: "via",
    icon: Lightbulb,
    title: "Forças VIA",
    subtitle: "24 forças de caráter universais",
    color: "text-brand-magenta",
    gradient: "from-brand-magenta/20 to-brand-magenta/5",
    keyFact: "Colaboradores que usam suas forças-assinatura diariamente são 6x mais engajados.",
    details: "A Classificação VIA (Values in Action), criada por Peterson e Seligman, identifica 24 forças de caráter organizadas em 6 virtudes universais: Sabedoria, Coragem, Humanidade, Justiça, Temperança e Transcendência. A pesquisa mostra que quando líderes identificam e amplificam as forças-assinatura de seus colaboradores — ao invés de focar em fraquezas — o engajamento multiplica por 6 e a criatividade por 3. O diagnóstico FIB-T mapeia essas forças para gerar trilhas de desenvolvimento personalizadas.",
    source: "Peterson & Seligman (2004) — VIA Institute on Character",
  },
  {
    id: "fib",
    icon: Layers,
    title: "FIB-T: 9 Domínios",
    subtitle: "Felicidade Interna Bruta no Trabalho",
    color: "text-amber-400",
    gradient: "from-amber-500/20 to-amber-500/5",
    keyFact: "9 domínios integram dimensões objetivas e subjetivas do bem-estar organizacional.",
    details: "Adaptado do índice de Felicidade Interna Bruta do Butão por FURTADO (2020), o FIB-T avalia 9 domínios interdependentes: Padrão de Vida, Educação, Cultura, Bem-Estar Psicológico, Saúde, Uso do Tempo, Vitalidade Comunitária, Meio Ambiente e Governança. A genialidade do modelo está em reconhecer que felicidade no trabalho não se reduz a satisfação salarial ou clima — ela é multidimensional. O Instituto já aplicou o FIB-T a mais de 110.000 colaboradores em 700+ organizações.",
    source: "FURTADO, C. A. (2020) — Instituto Felicidade para Todos",
  },
];

export function KnowledgeSection() {
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const selectedCard = knowledgeCards.find(c => c.id === expandedCard);

  return (
    <section className="py-24 px-6 border-t border-foreground/5 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/3 left-0 w-72 h-72 bg-brand-gold/3 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-brand-cyan/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-brand-gold" />
            <span className="text-xs font-heading text-brand-gold font-semibold uppercase tracking-widest">
              BASE CIENTÍFICA
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ciência do <span className="text-gradient-gold">Bem-Estar</span> no Trabalho
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            Fundamentado no Work-Wellbeing-Playbook 2.0 (Oxford/Indeed) com mais de 3.000 artigos, 
            nosso programa integra os principais frameworks mundiais em um diagnóstico único.
          </p>
        </motion.div>

        {/* Knowledge Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {knowledgeCards.map((card, i) => {
            const IconComp = card.icon;
            return (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setExpandedCard(card.id)}
                className="glass-card rounded-xl p-6 text-left hover:border-brand-gold/20 transition-all group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4`}>
                  <IconComp className={`w-6 h-6 ${card.color}`} />
                </div>
                <h3 className="font-heading font-bold text-foreground mb-1 group-hover:text-brand-gold transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">{card.subtitle}</p>
                <div className="bg-brand-gold/5 rounded-lg px-3 py-2 border border-brand-gold/10 mb-3">
                  <p className="text-[11px] text-brand-gold font-heading font-semibold leading-relaxed">
                    💡 {card.keyFact}
                  </p>
                </div>
                <span className="text-[10px] text-brand-gold font-heading font-semibold group-hover:underline">
                  Explorar framework →
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* CTA to Evidence Bank */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <button
            onClick={() => navigate("/evidencias")}
            className="gradient-gold text-primary-foreground font-heading font-bold px-8 py-4 rounded-xl text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity glow-gold mx-auto"
          >
            <BookOpen className="w-5 h-5" />
            Explorar banco de evidências
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-muted-foreground mt-3">3.000+ artigos organizados por domínio e tema</p>
        </motion.div>
      </div>

      {/* Detail Pop-out Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setExpandedCard(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="glass-card-strong rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setExpandedCard(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${selectedCard.gradient} flex items-center justify-center shrink-0`}>
                  <selectedCard.icon className={`w-7 h-7 ${selectedCard.color}`} />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">{selectedCard.title}</h2>
                  <p className="text-sm text-muted-foreground">{selectedCard.subtitle}</p>
                </div>
              </div>

              {/* Key fact */}
              <div className="bg-brand-gold/5 rounded-xl p-5 border border-brand-gold/15 mb-6">
                <p className="text-sm text-brand-gold font-heading font-bold mb-1">💡 Insight-chave</p>
                <p className="text-sm text-foreground/90 leading-relaxed">{selectedCard.keyFact}</p>
              </div>

              {/* Details */}
              <div className="mb-6">
                <h3 className="font-heading font-bold text-sm text-foreground mb-3">Entenda em profundidade</h3>
                <p className="text-sm text-foreground/80 leading-[1.8]">{selectedCard.details}</p>
              </div>

              {/* Source */}
              <div className="glass-card rounded-lg p-4 mb-6">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Referência:</strong> {selectedCard.source}
                </p>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => { setExpandedCard(null); navigate("/evidencias"); }}
                  className="gradient-gold text-primary-foreground font-heading font-bold text-sm px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <BookOpen className="w-4 h-4" />
                  Ver mais evidências
                </button>
                <button
                  onClick={() => setExpandedCard(null)}
                  className="border border-foreground/20 text-foreground/80 font-heading text-sm px-6 py-3 rounded-lg hover:bg-foreground/5 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
