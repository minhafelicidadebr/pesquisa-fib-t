import { useState } from "react";
import { ACTIONS } from "../content/explanations";
import {
  commitmentMarkdown,
  newCommitment,
  type Commitment,
} from "../data/commitments";

function download(content: string, extension: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `rascunho-pactuacao.${extension}`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function CommitmentBoard({
  items,
  onChange,
  onExport,
}: {
  items: Commitment[];
  onChange: (items: Commitment[]) => void;
  onExport: () => void;
}) {
  const [reviewed, setReviewed] = useState(false);
  const update = (next: Commitment[]) => {
    onChange(next);
    setReviewed(false);
  };
  const fields: [keyof Omit<Commitment, "key">, string, string][] = [
    ["action", "Ação", "Qual problema e qual ajuste serão pactuados?"],
    [
      "role",
      "Responsável por função",
      "Função ou equipe; evite nomes pessoais",
    ],
    ["deadline", "Prazo", "Prazo relativo ou data a pactuar"],
    [
      "resource",
      "Recurso necessário",
      "Tempo, autonomia ou recurso a confirmar",
    ],
    ["firstDelivery", "Primeira entrega", "O que será apresentado primeiro?"],
    [
      "evidence",
      "Evidência de acompanhamento",
      "Como saberemos que a ação aconteceu?",
    ],
    ["nextReview", "Próxima devolutiva", "Quando e por qual canal?"],
  ];
  return (
    <section className="p-commitments">
      <p>
        Selecione até três frentes. Os campos começam vazios: nenhuma ação foi
        acordada automaticamente.
      </p>
      <p className="p-callout">
        Rascunho apenas em memória. Sair ou recarregar apaga o conteúdo.
        Registre funções e decisões; evite relatos pessoais ou informações de
        saúde.
      </p>
      <div className="p-priority-choices p-no-print">
        {ACTIONS.map((a) => (
          <label key={a.key}>
            <input
              type="checkbox"
              checked={items.some((c) => c.key === a.key)}
              onChange={(e) =>
                update(
                  e.target.checked
                    ? [...items, newCommitment(a.key)].slice(0, 3)
                    : items.filter((c) => c.key !== a.key),
                )
              }
            />
            {a.label}
          </label>
        ))}
      </div>
      {items.map((c) => (
        <fieldset key={c.key}>
          <legend>{ACTIONS.find((a) => a.key === c.key)!.label}</legend>
          <div className="p-commitment-fields">
            {fields.map(([key, label, hint]) => (
              <label key={key} className="p-field">
                {label}
                <input
                  maxLength={500}
                  value={c[key]}
                  placeholder={hint}
                  onChange={(e) =>
                    update(
                      items.map((item) =>
                        item.key === c.key
                          ? { ...item, [key]: e.target.value }
                          : item,
                      ),
                    )
                  }
                />
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      {items.length > 0 && (
        <>
          <details className="p-export-preview" open>
            <summary>Revisar rascunho antes de exportar</summary>
            <pre>{commitmentMarkdown(items)}</pre>
          </details>
          <label className="p-review-check p-no-print">
            <input
              type="checkbox"
              checked={reviewed}
              onChange={(e) => setReviewed(e.target.checked)}
            />
            Revisei o rascunho e reconheço os campos ainda a pactuar.
          </label>
          <div className="p-button-row p-no-print">
            <button
              disabled={!reviewed}
              onClick={() => {
                download(
                  commitmentMarkdown(items),
                  "md",
                  "text/markdown;charset=utf-8",
                );
                onExport();
              }}
            >
              Baixar Markdown
            </button>
            <button
              disabled={!reviewed}
              onClick={() => {
                download(
                  JSON.stringify(
                    { status: "rascunho", commitments: items },
                    null,
                    2,
                  ),
                  "json",
                  "application/json",
                );
                onExport();
              }}
            >
              Baixar JSON
            </button>
            <button
              disabled={!reviewed}
              onClick={() => {
                document.body.classList.add("p-print-commitments");
                window.print();
                document.body.classList.remove("p-print-commitments");
              }}
            >
              Imprimir rascunho
            </button>
          </div>
        </>
      )}
    </section>
  );
}
