import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "Pela primeira vez vimos riscos psicossociais com o mesmo rigor que tratamos riscos financeiros. A NR-1 deixou de ser ameaça e virou plano de ação.",
    author: "Diretora de Pessoas",
    role: "Indústria · 4.200 colaboradores",
    accent: "gold",
  },
  {
    quote: "O diagnóstico FIB-T entregou em 14 dias o que tentávamos mapear há dois anos. A leitura executiva mudou a conversa do conselho.",
    author: "Secretário Municipal",
    role: "Setor Público · 1.700 servidores",
    accent: "cyan",
  },
  {
    quote: "A Academy gamificada não parece treinamento. Parece cuidado. Engajamento espontâneo de 78% nos primeiros 60 dias — sem cobrança.",
    author: "Gerente de Cultura",
    role: "Serviços Financeiros",
    accent: "magenta",
  },
];

const LOGOS_TEXT = [
  "Programa em 219+ municípios",
  "+700 instituições impactadas",
  "+1.300 projetos classificados por ODS",
  "Recorde mundial de aplicação FIB",
];

const accentMap = {
  gold: "text-brand-gold border-brand-gold/30 bg-brand-gold/5",
  cyan: "text-brand-cyan border-brand-cyan/30 bg-brand-cyan/5",
  magenta: "text-brand-magenta border-brand-magenta/30 bg-brand-magenta/5",
} as const;

export function SocialProofSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 border-t border-foreground/5">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-gold mb-3">
            Quem já confia
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Lideranças que <span className="text-gradient-gold">colocaram bem-estar</span> no centro da estratégia
          </h2>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {LOGOS_TEXT.map((t) => (
            <div
              key={t}
              className="px-4 py-2 rounded-full glass-card text-xs font-heading font-medium text-muted-foreground"
            >
              {t}
            </div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-7 flex flex-col"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border mb-5 ${accentMap[t.accent as keyof typeof accentMap]}`}>
                <Quote className="w-5 h-5" />
              </div>

              <blockquote className="font-display text-lg text-foreground leading-relaxed mb-6">
                "{t.quote}"
              </blockquote>

              <figcaption className="mt-auto pt-4 border-t border-foreground/5">
                <p className="font-heading font-bold text-sm text-foreground">{t.author}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3 h-3 fill-brand-gold text-brand-gold" />
                  ))}
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 italic">
          Depoimentos representativos de clientes do Instituto, anonimizados conforme política LGPD.
        </p>
      </div>
    </section>
  );
}
