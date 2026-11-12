import { ACTIONS } from "../content/explanations";
import { SLIDES } from "../content/slides";
import type { Commitment } from "../data/commitments";
import {
  formatDate,
  SOURCE_LABELS,
  type PresentationSnapshot,
} from "../data/presentation-schema";
import { ExplanationBody } from "./InsightDialog";
import { QuestionsTable } from "./QuestionsTable";
import { SlideData } from "./SlideView";

export function PrintPresentation({
  snapshot,
  items,
}: {
  snapshot: PresentationSnapshot;
  items: Commitment[];
}) {
  return (
    <div className="p-print-only">
      <h1>Escutar. Compreender. Agir.</h1>
      <p>Instituto Felicidade para Todos · ISG</p>
      <p>
        {SOURCE_LABELS[snapshot.sourceKind]} · {snapshot.status} · emissão{" "}
        {formatDate(snapshot.issuedAt)} · atualização{" "}
        {formatDate(snapshot.dataUpdatedAt)}
      </p>
      {snapshot.sourceRefs.map((source, i) => (
        <p key={i}>{source}</p>
      ))}
      {SLIDES.map((slide, i) => (
        <section key={slide.id}>
          <span>
            {String(i + 1).padStart(2, "0")} · {slide.chapter}
          </span>
          <h2>{slide.title}</h2>
          <p>{slide.description}</p>
          <SlideData slide={slide} snapshot={snapshot} />
          <p>
            <strong>Limite:</strong> {slide.limit}
          </p>
          <p>
            Base editorial: relatório institucional, p. {slide.page}.{" "}
            {slide.chapter === "Comprometer"
              ? "Proposta sujeita a pactuação."
              : "Leitura descritiva da fonte selecionada."}
          </p>
        </section>
      ))}
      <section>
        <h2>As questões da fonte selecionada</h2>
        <QuestionsTable snapshot={snapshot} />
      </section>
      <section>
        <h2>Metodologia e limites</h2>
        <ExplanationBody topic="metodologia" snapshot={snapshot} />
      </section>
      <section>
        <h2>Fontes e referências</h2>
        <ExplanationBody topic="fontes" snapshot={snapshot} />
      </section>
      <section className="p-print-commitment-sheet">
        <h2>Rascunho de pactuação</h2>
        <p>
          Propostas sujeitas a revisão e aprovação institucional. Prazos
          relativos começam na pactuação.
        </p>
        {items.length ? (
          items.map((c) => (
            <section key={c.key}>
              <h3>{ACTIONS.find((a) => a.key === c.key)!.label}</h3>
              <dl>
                {Object.entries(c)
                  .filter(([key]) => key !== "key")
                  .map(([key, value]) => (
                    <div key={key}>
                      <dt>
                        {
                          {
                            action: "Ação",
                            role: "Responsável por função",
                            deadline: "Prazo",
                            resource: "Recurso",
                            firstDelivery: "Primeira entrega",
                            evidence: "Evidência",
                            nextReview: "Próxima devolutiva",
                          }[key]
                        }
                      </dt>
                      <dd>{value || "A pactuar"}</dd>
                    </div>
                  ))}
              </dl>
            </section>
          ))
        ) : (
          <p>Nenhuma frente selecionada.</p>
        )}
      </section>
    </div>
  );
}
