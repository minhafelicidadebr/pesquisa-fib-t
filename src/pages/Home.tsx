import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Lock, ShieldCheck, Sparkles } from "lucide-react";
import hubData from "@/data/hub.json";
import { FibiaChat } from "@/components/deck/FibiaChat";
import { InstitutionalFooter } from "@/components/deck/InstitutionalFooter";

const brand = hubData.brand;

/**
 * Home institucional do Instituto Felicidade para Todos.
 * A FIBia é a protagonista: a camada institucional apenas a enquadra.
 * A área restrita não expõe código algum — a validação é sempre server-side.
 */
export default function Home() {
  useEffect(() => {
    document.title = "Instituto Felicidade para Todos · Ciência da felicidade no trabalho";
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      {/* Barra institucional */}
      <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img src={brand.logos.icon} alt="" aria-hidden="true" className="h-8 w-8" />
            <span className="font-heading text-sm font-semibold leading-tight text-foreground">
              Instituto Felicidade
              <span className="block text-xs font-normal text-muted-foreground">para Todos</span>
            </span>
          </Link>
          <nav aria-label="Institucional" className="flex items-center gap-1 text-sm">
            <Link
              to="/institucional"
              className="hidden rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
            >
              O programa
            </Link>
            <Link
              to="/evidencia-cientifica"
              className="hidden rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:text-foreground md:inline-block"
            >
              Ciência
            </Link>
            <a
              href="#acesso-restrito"
              className="inline-flex items-center gap-1.5 rounded-lg border border-foreground/15 px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Acesso restrito
            </a>
          </nav>
        </div>
      </header>

      {/* Enquadramento institucional curto — a FIBia vem logo abaixo */}
      <section className="relative px-4 pb-6 pt-12 sm:pt-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-0 h-[420px] w-[420px] rounded-full bg-brand-gold/8 blur-[140px]" />
          <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-brand-cyan/6 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full glass-card border-brand-gold/20 px-4 py-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-brand-gold" aria-hidden="true" />
            <span className="font-heading text-xs font-semibold text-foreground">
              {brand.program_name}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-3xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-4xl md:text-5xl"
          >
            Comece pela conversa que
            <br />
            <span className="text-gradient-gold">mede o que importa</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mx-auto mt-4 max-w-xl font-body text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            A FIBia conduz a Pesquisa FIB-T de felicidade e bem-estar no trabalho e devolve uma
            leitura estruturada dos seus resultados — com cálculo determinístico, sem interpretação
            clínica.
          </motion.p>
        </div>
      </section>

      {/* FIBia protagonista */}
      <main id="fibia" className="relative">
        <h2 className="sr-only">Pesquisa FIB-T com a FIBia</h2>
        <FibiaChat />
      </main>

      {/* Área restrita — leva ao pré-teste e ao painel; nenhum código no cliente */}
      <section
        id="acesso-restrito"
        aria-labelledby="acesso-restrito-title"
        className="border-t border-foreground/10 px-4 py-16"
      >
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-brand-gold" aria-hidden="true" />
            <p className="font-heading text-xs font-semibold uppercase tracking-wide text-brand-gold">
              Acesso restrito
            </p>
          </div>
          <h2
            id="acesso-restrito-title"
            className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl"
          >
            Ambientes de pesquisa por convite
          </h2>
          <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-muted-foreground">
            Cada ambiente exige o código fornecido pela organização participante. A validação é
            feita no servidor e nenhum dado pessoal é coletado nas pesquisas.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link
              to="/isg"
              className="group glass-card rounded-2xl border-foreground/10 p-6 transition-colors hover:border-brand-gold/30"
            >
              <Sparkles className="h-5 w-5 text-brand-gold" aria-hidden="true" />
              <h3 className="mt-4 font-heading text-base font-semibold text-foreground">
                Pré-teste organizacional
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Para participantes convidados: 32 questões e resultado individual imediato.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-gold">
                Entrar com código
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>

            <Link
              to="/isg/resultados"
              className="group glass-card rounded-2xl border-foreground/10 p-6 transition-colors hover:border-brand-gold/30"
            >
              <ShieldCheck className="h-5 w-5 text-brand-cyan" aria-hidden="true" />
              <h3 className="mt-4 font-heading text-base font-semibold text-foreground">
                Painel executivo
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Para gestão: leitura agregada do grupo, sem qualquer resposta individual.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-cyan">
                Acessar painel
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <InstitutionalFooter />
    </div>
  );
}
