import { ArrowRight, ClipboardList, ShieldCheck, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FIBT_ITEMS } from "@/domain/fibt";
import { IsgCitation, IsgLogo, IsgPilotBadge } from "./IsgBrand";

export function IsgIntro({ onStart }: { onStart: () => void }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-14">
      <div className="mb-10 flex flex-col items-start gap-4">
        <IsgLogo className="h-10" />
        <IsgPilotBadge />
      </div>

      <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
        Pesquisa FIB-T
      </h1>
      <p className="mt-1 text-sm font-medium text-primary">{FIBT_ITEMS.length} questões</p>
      <IsgCitation className="mt-3" />

      <p className="mt-6 text-base leading-relaxed text-muted-foreground">
        Esta pesquisa foi desenvolvida para apoiar um diagnóstico baseado em método científico
        sobre os fatores de felicidade e bem-estar no trabalho.
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { icon: ShieldCheck, title: "Confidencial", text: "Não coletamos nome, e-mail, CPF ou matrícula." },
          { icon: ClipboardList, title: "Passo a passo", text: "Uma questão por vez, com navegação livre." },
          { icon: UserCheck, title: "Resultado individual", text: "Disponível ao final da sua participação." },
        ].map(({ icon: Icon, title, text }) => (
          <li key={title} className="rounded-xl border border-border bg-card p-4">
            <Icon className="mb-2 h-4 w-4 text-primary" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        Suas respostas são utilizadas conforme o modelo de privacidade já vigente na
        plataforma. O FIB-T é um instrumento de pesquisa e autoconhecimento: não é
        diagnóstico clínico nem avaliação de desempenho.
      </p>

      <Button size="lg" className="mt-8 h-12 w-full sm:w-auto" onClick={onStart}>
        Iniciar Pesquisa
        <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
      </Button>
    </main>
  );
}
