import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Layers,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import hubData from "@/data/hub.json";
import fibiaAvatar from "@/assets/fibia-avatar.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resolveSurveyAccess } from "@/lib/surveyAccess";

const brand = hubData.brand;
const contact = hubData.brand.contact;

const NAV = [
  { href: "#o-que-e", label: "O que é a FIB-T" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#privacidade", label: "Privacidade" },
];

const PRINCIPLES = [
  {
    icon: ClipboardList,
    title: "32 questões",
    text: "Uma jornada objetiva e progressiva.",
  },
  {
    icon: Layers,
    title: "Visão multidimensional",
    text: "Diferentes dimensões da experiência no trabalho.",
  },
  {
    icon: Sparkles,
    title: "Resultado estruturado",
    text: "Ao final, você recebe uma leitura organizada das suas respostas.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Acesse",
    text: "Digite o código fornecido pela sua organização.",
  },
  {
    n: "02",
    title: "Responda",
    text: "Percorra as 32 questões com acompanhamento da FIBia.",
  },
  {
    n: "03",
    title: "Conclua",
    text: "Revise suas respostas e finalize a pesquisa.",
  },
];

/**
 * Portal institucional de acesso à Pesquisa FIB-T.
 * Função única: explicar, gerar confiança e receber o código de acesso —
 * resolvido sempre no servidor (a home não conhece clientes nem códigos).
 */
export default function Home() {
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "Pesquisa FIB-T | Instituto Felicidade para Todos";
  }, []);

  const focusAccess = () => {
    document.getElementById("acesso")?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => inputRef.current?.focus(), 420);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checking || !code.trim()) return;
    setChecking(true);
    setError(null);
    const { authorized, destination } = await resolveSurveyAccess(code);
    if (authorized && destination) {
      setCode("");
      window.location.assign(destination);
      return;
    }
    setError(
      "Não foi possível localizar uma pesquisa para este código. Confira o código recebido e tente novamente.",
    );
    setChecking(false);
  };

  return (
    <div className="ift-portal min-h-dvh bg-background font-body text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="flex items-center gap-3" aria-label="Instituto Felicidade para Todos">
            <img src={brand.logos.icon} alt="" aria-hidden="true" className="h-9 w-auto" />
            <span className="font-heading text-sm font-semibold leading-tight">
              Instituto Felicidade
              <span className="block text-xs font-normal text-muted-foreground">para Todos</span>
            </span>
          </Link>

          <nav aria-label="Seções" className="hidden items-center gap-1 text-sm md:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <Button onClick={focusAccess} className="min-h-11 md:hidden" size="sm">
            Acessar
          </Button>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="px-5 pb-4 pt-14 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Pesquisa FIB-T
            </p>
            <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.12] tracking-tight sm:text-4xl md:text-[2.9rem]">
              Sua voz faz parte da construção de um ambiente de trabalho mais saudável e humano.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Por meio de 32 questões, a Pesquisa FIB-T reúne informações sobre diferentes
              dimensões da experiência no trabalho. Os resultados ajudam as organizações a
              compreender o cenário coletivo e planejar ações voltadas ao bem-estar dos
              colaboradores.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Se sua organização convidou você para participar, utilize o código de acesso recebido
              para iniciar sua pesquisa.
            </p>

            <Button onClick={focusAccess} size="lg" className="mt-8 min-h-12 px-7">
              Ir para o código de acesso
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </section>

        {/* ACCESS CARD + FIBia */}
        <section id="acesso" aria-labelledby="acesso-title" className="scroll-mt-24 px-5 py-12">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[minmax(0,1fr)_18rem] md:items-start">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-2 text-primary">
                <Lock className="h-4 w-4" aria-hidden="true" />
                <span className="font-heading text-xs font-semibold uppercase tracking-wide">
                  Acesso à pesquisa
                </span>
              </div>
              <h2 id="acesso-title" className="mt-3 font-display text-2xl font-semibold">
                Acesse sua pesquisa
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Digite o código fornecido pela sua organização.
              </p>

              <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="access-code">Código de acesso</Label>
                  <Input
                    id="access-code"
                    ref={inputRef}
                    name="access-code"
                    type="text"
                    inputMode="text"
                    autoComplete="one-time-code"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={128}
                    placeholder="Ex.: código recebido no convite"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    aria-invalid={!!error}
                    aria-describedby={error ? "access-error" : "access-hint"}
                    className="h-12 text-base"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="min-h-12 w-full"
                  disabled={checking || !code.trim()}
                >
                  {checking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Verificando seu acesso…
                    </>
                  ) : (
                    "Acessar minha pesquisa"
                  )}
                </Button>

                <div aria-live="polite" className="min-h-5">
                  {error && (
                    <p id="access-error" className="text-sm leading-relaxed text-destructive">
                      {error}
                    </p>
                  )}
                </div>

                <p id="access-hint" className="text-xs leading-relaxed text-muted-foreground">
                  Seu código identifica apenas o ambiente de pesquisa para o qual você foi
                  convidado.
                </p>
              </form>
            </div>

            {/* FIBia — presença leve */}
            <aside className="rounded-2xl border border-border bg-secondary/40 p-6">
              <img
                src={fibiaAvatar}
                alt="FIBia, assistente virtual da Pesquisa FIB-T"
                className="h-16 w-16 rounded-full border border-border object-cover"
                loading="lazy"
              />
              <p className="mt-4 font-heading text-sm font-semibold">FIBia</p>
              <p className="text-xs text-muted-foreground">Assistente virtual da Pesquisa FIB-T</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                “Olá, eu sou a FIBia. Vou acompanhar você durante a pesquisa, explicar cada etapa e
                ajudar a tornar a experiência simples e acolhedora.”
              </p>
            </aside>
          </div>
        </section>

        {/* O QUE É */}
        <section id="o-que-e" aria-labelledby="o-que-e-title" className="scroll-mt-24 px-5 py-14">
          <div className="mx-auto max-w-3xl">
            <h2 id="o-que-e-title" className="font-display text-2xl font-semibold sm:text-3xl">
              O que é a Pesquisa FIB-T?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              A FIB-T é uma pesquisa estruturada sobre felicidade e bem-estar no contexto do
              trabalho. Por meio de 32 questões, ela organiza diferentes aspectos da experiência
              profissional em fatores e domínios que permitem uma leitura integrada dos resultados.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Os resultados apoiam reflexão e desenvolvimento e não constituem diagnóstico clínico.
            </p>

            <ul className="mt-8 grid gap-4 sm:grid-cols-3">
              {PRINCIPLES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="rounded-xl border border-border bg-card p-5">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="mt-3 font-heading text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section
          id="como-funciona"
          aria-labelledby="como-funciona-title"
          className="scroll-mt-24 border-y border-border bg-secondary/30 px-5 py-14"
        >
          <div className="mx-auto max-w-3xl">
            <h2 id="como-funciona-title" className="font-display text-2xl font-semibold sm:text-3xl">
              Como funciona
            </h2>
            <ol className="mt-8 grid gap-4 sm:grid-cols-3">
              {STEPS.map((step) => (
                <li key={step.n} className="rounded-xl border border-border bg-card p-5">
                  <span className="font-display text-2xl font-semibold text-primary">{step.n}</span>
                  <h3 className="mt-2 font-heading text-sm font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* PARTICIPAÇÃO */}
        <section aria-labelledby="participacao-title" className="px-5 py-14">
          <div className="mx-auto max-w-3xl">
            <h2 id="participacao-title" className="font-display text-2xl font-semibold sm:text-3xl">
              Sua participação importa
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Cada participação contribui para ampliar a compreensão sobre a experiência das pessoas
              no ambiente de trabalho. Responder com atenção ajuda a produzir uma leitura mais
              consistente do grupo.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Responda de acordo com sua percepção atual.",
                "Não existem respostas certas ou erradas.",
                "Participe no seu ritmo.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* PRIVACIDADE */}
        <section
          id="privacidade"
          aria-labelledby="privacidade-title"
          className="scroll-mt-24 px-5 pb-16"
        >
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span className="font-heading text-xs font-semibold uppercase tracking-wide">
                Confidencialidade
              </span>
            </div>
            <h2 id="privacidade-title" className="mt-3 font-display text-2xl font-semibold">
              Privacidade desde o início
            </h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>O código apenas direciona você para o ambiente de pesquisa correto.</li>
              <li>A pesquisa não solicita dados pessoais desnecessários.</li>
              <li>
                Resultados organizacionais são apresentados de forma agregada, conforme as regras do
                ambiente.
              </li>
              <li>Nenhuma resposta individual é exposta a gestores.</li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              A participação é confidencial e a leitura organizacional é sempre agregada.
            </p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-secondary/30 px-5 py-12">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2">
          <div>
            <img
              src={brand.logos.light_bg}
              alt="Instituto Felicidade para Todos"
              className="h-11 w-auto"
              loading="lazy"
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Instituto Felicidade para Todos — ciência e cuidado humano aplicados ao bem-estar no
              trabalho.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="font-heading text-xs font-semibold uppercase tracking-wide text-foreground">
              Contato
            </p>
            <address className="mt-3 not-italic leading-relaxed">
              Impact HUB Brasília
              <br />
              SGAN 601, Lote H — Edifício Íon, Ala Amarela
              <br />
              Asa Norte — Brasília/DF — Brasil
            </address>
            <p className="mt-3">
              <a href="tel:+556135508779" className="hover:text-foreground">
                (61) 3550-8779
              </a>
            </p>
            <p className="mt-1">
              <a
                href={contact?.website ?? "https://www.felicidadeparatodos.com.br"}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                felicidadeparatodos.com.br
              </a>
            </p>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-5xl text-xs text-muted-foreground">
          © {new Date().getFullYear()} Instituto Felicidade para Todos. Todos os direitos
          reservados.
        </p>
      </footer>
    </div>
  );
}
