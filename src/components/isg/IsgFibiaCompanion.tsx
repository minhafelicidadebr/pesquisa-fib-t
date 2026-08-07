import { useEffect, useState } from "react";
import fibiaAvatar from "@/assets/fibia-avatar.png";

/** 32 itens divididos em 4 blocos de 8 — apenas ritmo de percurso, sem valor metodológico. */
export const ISG_BLOCK_SIZE = 8;
export const ISG_BLOCK_COUNT = 4;

/**
 * Rótulos neutros de percurso: os itens do FIB-T não são agrupados por tema
 * nos blocos, então nomear temas aqui seria falso. Blocos servem só de ritmo.
 */
export const ISG_BLOCKS = [
  { label: "Primeira parte", opening: "Vamos começar com calma. Não existe resposta certa aqui — só a sua." },
  { label: "Segunda parte", opening: "Seguimos. Responda pensando em como as coisas têm estado para você." },
  { label: "Terceira parte", opening: "Você já passou da metade. Siga no seu ritmo, sem pressa." },
  { label: "Última parte", opening: "Última parte. Obrigado por chegar até aqui com atenção." },
] as const;


export function blockIndexOf(questionIndex: number): number {
  return Math.min(ISG_BLOCK_COUNT - 1, Math.floor(questionIndex / ISG_BLOCK_SIZE));
}

/**
 * FIBia como companhia de percurso: acolhe e orienta o ritmo.
 * Nunca interpreta respostas, não cita escores e não gera diagnóstico.
 */
export function IsgFibiaCompanion({
  questionIndex,
  answeredInBlock,
}: {
  questionIndex: number;
  answeredInBlock: number;
}) {
  const block = blockIndexOf(questionIndex);
  const [visible, setVisible] = useState(true);

  // Reaparece a cada troca de bloco e some após alguns segundos de leitura.
  useEffect(() => {
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 7000);
    return () => window.clearTimeout(t);
  }, [block]);

  const message = visible
    ? ISG_BLOCKS[block].opening
    : answeredInBlock >= ISG_BLOCK_SIZE
      ? "Bloco concluído. Vamos seguir."
      : "Estou aqui com você.";

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/40 p-3.5">
      <img
        src={fibiaAvatar}
        alt=""
        aria-hidden="true"
        className="h-10 w-10 shrink-0 rounded-full border border-border object-cover motion-safe:transition-transform motion-safe:duration-500"
        style={{ transform: visible ? "scale(1.04)" : "scale(1)" }}
      />
      <div className="min-w-0">
        <p className="text-xs font-medium text-foreground">FIBia</p>
        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

/** Trilha dos 4 blocos: orienta esforço restante sem expor cálculo algum. */
export function IsgBlockTrail({ questionIndex }: { questionIndex: number }) {
  const active = blockIndexOf(questionIndex);
  return (
    <ol className="flex items-stretch gap-2" aria-label="Blocos da pesquisa">
      {ISG_BLOCKS.map((b, i) => {
        const state = i < active ? "done" : i === active ? "current" : "todo";
        return (
          <li key={b.label} className="min-w-0 flex-1">
            <div
              aria-hidden="true"
              className={`h-1.5 rounded-full motion-safe:transition-colors ${
                state === "todo" ? "bg-muted" : "bg-primary"
              } ${state === "current" ? "opacity-100" : state === "done" ? "opacity-60" : ""}`}
            />
            <p
              className={`mt-1.5 hidden truncate text-[11px] sm:block ${
                state === "current" ? "font-medium text-foreground" : "text-muted-foreground"
              }`}
            >
              {b.label}
            </p>
            <span className="sr-only">
              Bloco {i + 1}: {b.label} —{" "}
              {state === "done" ? "concluído" : state === "current" ? "em andamento" : "a seguir"}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
