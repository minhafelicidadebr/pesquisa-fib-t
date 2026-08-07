import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FIBT_ITEMS } from "@/domain/fibt";
import { LIKERT_LABELS } from "@/lib/isgCsv";
import { IsgLogo, IsgPilotBadge } from "./IsgBrand";

const OPTIONS = [0, 1, 2, 3, 4] as const;

interface Props {
  answers: Record<number, number>;
  onAnswer: (itemId: number, value: number) => void;
  onComplete: () => void;
}

/**
 * Questionário com progressive disclosure: uma questão por vez.
 * Reutiliza o instrumento canônico — nenhum texto, id, escala ou fator é
 * redefinido aqui.
 */
export function IsgSurvey({ answers, onAnswer, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const total = FIBT_ITEMS.length;
  const item = FIBT_ITEMS[index];
  const answered = Object.keys(answers).length;
  const current = answers[item.id];

  useEffect(() => {
    headingRef.current?.focus();
  }, [index]);

  const goNext = () => {
    if (index < total - 1) setIndex(index + 1);
    else onComplete();
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <IsgLogo className="h-7" />
        <IsgPilotBadge />
      </div>

      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-sm font-medium text-foreground">
          Questão {index + 1} de {total}
        </p>
        <p className="text-xs text-muted-foreground">{answered} respondidas</p>
      </div>
      <Progress
        value={(answered / total) * 100}
        aria-label={`Progresso: ${answered} de ${total} questões respondidas`}
        className="h-1.5"
      />

      <fieldset className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-7">
        <legend className="sr-only">
          Questão {index + 1} de {total}
        </legend>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-heading text-lg font-semibold leading-snug text-foreground outline-none sm:text-xl"
        >
          {item.text}
        </h2>

        <div role="radiogroup" aria-label={item.text} className="mt-6 space-y-2.5">
          {OPTIONS.map((value) => {
            const selected = current === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onAnswer(item.id, value)}
                className={`flex min-h-12 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  selected
                    ? "border-primary bg-primary/10 font-medium text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                    selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  }`}
                >
                  {selected && <Check className="h-3 w-3" />}
                </span>
                {LIKERT_LABELS[value]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div aria-live="polite" className="sr-only">
        {current !== undefined
          ? `Resposta registrada: ${LIKERT_LABELS[current]}.`
          : "Nenhuma resposta selecionada para esta questão."}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          className="h-11"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Anterior
        </Button>
        <Button className="h-11" onClick={goNext} disabled={current === undefined}>
          {index < total - 1 ? "Próxima" : "Revisar"}
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Não há tempo cronometrado. Você pode voltar e ajustar suas respostas antes de enviar.
      </p>
    </main>
  );
}
