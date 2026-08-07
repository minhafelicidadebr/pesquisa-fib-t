import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FIBT_ITEMS } from "@/domain/fibt";
import { LIKERT_LABELS } from "@/lib/isgCsv";
import { IsgLogo, IsgPilotBadge } from "./IsgBrand";

interface Props {
  answers: Record<number, number>;
  submitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export function IsgReview({ answers, submitting, onBack, onSubmit }: Props) {
  const missing = FIBT_ITEMS.filter((i) => answers[i.id] === undefined);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <IsgLogo className="h-7" />
        <IsgPilotBadge />
      </div>

      <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
        Revisão antes do envio
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Confira suas respostas. Depois do envio, seu resultado individual é apresentado.
      </p>

      <ol className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
        {FIBT_ITEMS.map((item, i) => (
          <li key={item.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-start sm:gap-4">
            <span className="text-xs font-medium text-muted-foreground sm:w-8">{i + 1}</span>
            <span className="flex-1 text-sm leading-snug text-foreground">{item.text}</span>
            <span
              className={`text-xs font-medium sm:w-44 sm:text-right ${
                answers[item.id] === undefined ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {answers[item.id] === undefined ? "Sem resposta" : LIKERT_LABELS[answers[item.id]]}
            </span>
          </li>
        ))}
      </ol>

      <div aria-live="polite" className="mt-4 min-h-5 text-sm text-destructive">
        {missing.length > 0 && `Faltam ${missing.length} questões para concluir.`}
      </div>

      <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" className="h-11" onClick={onBack} disabled={submitting}>
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Voltar às questões
        </Button>
        <Button
          className="h-11"
          onClick={onSubmit}
          disabled={submitting || missing.length > 0}
          aria-disabled={submitting || missing.length > 0}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Enviando…
            </>
          ) : (
            <>
              Enviar respostas
              <Send className="ml-2 h-4 w-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </main>
  );
}
