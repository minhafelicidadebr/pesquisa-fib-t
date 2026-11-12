import { useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Slide } from "../content/slides";
import { ACTIONS, GOVERNANCE, TIMELINE } from "../content/explanations";
import {
  type PresentationSnapshot,
  formatDate,
  formatNumber,
  tiedExtremes,
} from "../data/presentation-schema";
import { AccessibleBarChart } from "./AccessibleBarChart";

import { ITEM_LABELS, ITEM_SETS } from "../content/items";

function Photo({ closing = false }: { closing?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className={`p-photo ${closing ? "p-photo-closing" : ""}`}>
      {failed ? (
        <div className="p-photo-fallback">
          <span>Escuta que abre caminhos.</span>
          <p>Imagem indisponível. A conversa continua.</p>
        </div>
      ) : (
        <picture>
          <source
            type="image/webp"
            srcSet="/isg-presentation/listening-640.webp 640w, /isg-presentation/listening-960.webp 960w, /isg-presentation/listening-1440.webp 1440w"
            sizes="(max-width: 760px) 100vw, 50vw"
          />
          <img
            src="/isg-presentation/listening-960.webp"
            alt="Profissionais fictícios em uma conversa atenta, ilustrando a escuta compartilhada."
            width="1440"
            height="810"
            loading={closing ? "lazy" : "eager"}
            decoding="async"
            onError={() => setFailed(true)}
          />
        </picture>
      )}
      <figcaption>
        Imagem ilustrativa gerada por IA. Não retrata pessoas ou instalações da
        ISG.
      </figcaption>
    </figure>
  );
}
function ItemBars({
  snapshot,
  ids,
}: {
  snapshot: PresentationSnapshot;
  ids: number[];
}) {
  return (
    <AccessibleBarChart
      title="Itens para a conversa"
      rows={ids.map((id) => ({
        key: String(id),
        label: `Q${id} · ${ITEM_LABELS[id]}`,
        mean: snapshot.questions.find((q) => q.id === id)?.mean ?? null,
      }))}
    />
  );
}
function Timeline() {
  const [selected, setSelected] = useState(0);
  return (
    <div className="p-timeline">
      <div className="p-timeline-steps">
        {TIMELINE.map((t, i) => (
          <button
            key={t.period}
            aria-pressed={selected === i}
            onClick={() => setSelected(i)}
          >
            <span className="p-timeline-dot" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <small>{t.period}</small>
            <strong>{t.title}</strong>
            <span>{t.detail}</span>
          </button>
        ))}
      </div>
      <p className="p-callout" role="status">
        Etapa selecionada: {TIMELINE[selected].period}. Prazos contados da
        pactuação; datas reais ainda a confirmar.
      </p>
    </div>
  );
}
export function SlideData({
  slide,
  snapshot,
}: {
  slide: Slide;
  snapshot: PresentationSnapshot;
}) {
  const extremes = tiedExtremes(snapshot.domains);
  switch (slide.id) {
    case "percurso":
      return (
        <div className="p-journey">
          {[
            [
              "01",
              "Compreender",
              "O que foi observado e como ler os resultados.",
            ],
            [
              "02",
              "Dialogar",
              "Reconhecer recursos e investigar necessidades.",
            ],
            [
              "03",
              "Comprometer",
              "Definir responsabilidades, recursos e devolutivas.",
            ],
          ].map(([number, title, description]) => (
            <div key={number}>
              <span className="p-step-number">{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      );
    case "sintese":
      return (
        <div className="p-synthesis">
          <div>
            <span className="p-type-label">Resultado observado</span>
            <h3>Um retrato, muitas dimensões</h3>
            <p className="p-mini-score">
              {formatNumber(snapshot.globalScore, 1)}
              <small> / 100</small>
            </p>
            <p>
              Global informado pela fonte. {snapshot.n ?? "Não informado"}{" "}
              participações consideradas.
            </p>
          </div>
          <div>
            <span className="p-type-label">Interpretação delimitada</span>
            <h3>Contexto antes de prioridade</h3>
            <p>
              {extremes ? (
                <>
                  Menor média entre domínios:{" "}
                  {extremes.lowest.map((c) => c.label).join(" e ")} ·{" "}
                  {formatNumber(extremes.lowest[0].mean)} / 4.
                </>
              ) : (
                "Domínios não informados nesta fonte."
              )}
            </p>
            <p>Empates preservados. A ordem não determina uma intervenção.</p>
          </div>
          <div>
            <span className="p-type-label">Recomendação</span>
            <h3>Poucas ações, verificáveis</h3>
            <p>
              Escolher até três frentes com a equipe, definir recursos e
              combinar a próxima devolutiva.
            </p>
          </div>
        </div>
      );
    case "contexto":
      return (
        <div className="p-context">
          <div className="p-context-numbers">
            <div>
              <strong>{snapshot.n ?? "—"}</strong>
              <span>participações consideradas</span>
            </div>
            <div>
              <strong>{snapshot.questions.length || "—"}</strong>
              <span>questões recebidas</span>
            </div>
            <div>
              <strong className="p-status-value">{snapshot.status}</strong>
              <span>status da fonte</span>
            </div>
          </div>
          <dl className="p-metadata">
            <div>
              <dt>Emissão</dt>
              <dd>{formatDate(snapshot.issuedAt)}</dd>
            </div>
            <div>
              <dt>Atualização informada</dt>
              <dd>{formatDate(snapshot.dataUpdatedAt)}</dd>
            </div>
            <div>
              <dt>Período completo</dt>
              <dd>
                {snapshot.collectionPeriod
                  ? `${formatDate(snapshot.collectionPeriod.start)} a ${formatDate(snapshot.collectionPeriod.end)}`
                  : "Não informado"}
              </dd>
            </div>
            <div>
              <dt>Total elegível</dt>
              <dd>{snapshot.eligiblePopulation ?? "Não informado"}</dd>
            </div>
          </dl>
          <p className="p-callout">
            Emissão e atualização não definem a janela da coleta. Participações
            não confirmam pessoas únicas.
          </p>
        </div>
      );
    case "leitura":
      return (
        <div className="p-scales">
          <div>
            <span className="p-type-label">Questões, fatores e domínios</span>
            <h3>Médias de 0 a 4</h3>
            <ol start={0}>
              {[
                "Discordo totalmente",
                "Discordo parcialmente",
                "Neutro",
                "Concordo parcialmente",
                "Concordo totalmente",
              ].map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ol>
          </div>
          <div className="p-dark-block">
            <span className="p-type-label">Indicador global</span>
            <h3>Escala de 0 a 100</h3>
            <p>Um escore agregado.</p>
            <p>O número não é uma proporção de pessoas felizes.</p>
            <p className="p-scale-question">
              Uma média igual a 2,00 significa que todos responderam neutro?
            </p>
          </div>
        </div>
      );
    case "global":
      return (
        <div className="p-global-layout">
          <div
            className={`p-global-number ${snapshot.globalScore === null ? "p-global-missing" : ""}`}
          >
            <span className="p-type-label">Resultado observado</span>
            <p>
              {formatNumber(snapshot.globalScore, 1)}
              <small>/100</small>
            </p>
            <div className="p-global-track" aria-hidden="true">
              <span style={{ width: `${snapshot.globalScore ?? 0}%` }} />
            </div>
            <div className="p-global-scale">
              <span>0</span>
              <span>100</span>
            </div>
            <span className="p-small">
              {snapshot.n ?? "Não informado"} participações · {snapshot.status}
            </span>
          </div>
          <div className="p-number-explanation">
            {[
              [
                "01",
                "Descreve esta base",
                "Não compara empresas nem define uma meta clínica.",
              ],
              [
                "02",
                "Abre perguntas",
                "Um único retrato não demonstra evolução ou causalidade.",
              ],
              [
                "03",
                "Orienta o diálogo",
                "Sem classificação individual ou faixas arbitrárias.",
              ],
            ].map(([n, title, body]) => (
              <div key={n}>
                <span>{n}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "fatores": {
      const ext = tiedExtremes(snapshot.factors);
      return (
        <div className="p-data-layout">
          <AccessibleBarChart title="Três fatores" rows={snapshot.factors} />
          <aside className="p-reading-note">
            <span className="p-type-label">Leitura descritiva</span>
            <h3>
              {ext?.highest.map((c) => c.label).join(" e ") ?? "Não informado"}
            </h3>
            <p>
              {ext
                ? `${formatNumber(ext.highest[0].mean)} / 4 · maior média entre os fatores recebidos.`
                : "Sem fatores disponíveis."}
            </p>
            <p>
              Uma média maior não elimina dificuldades em itens específicos.
            </p>
          </aside>
        </div>
      );
    }
    case "dominios":
      return (
        <div className="p-data-layout p-domain-layout">
          <AccessibleBarChart
            title="Nove domínios"
            rows={snapshot.domains}
            ordered
          />
          <aside className="p-reading-note">
            <span className="p-type-label">Empates preservados</span>
            <h3>Contexto antes de escolher</h3>
            <p>
              {extremes ? (
                <>
                  Menor média: {extremes.lowest.map((c) => c.label).join(" e ")}{" "}
                  · {formatNumber(extremes.lowest[0].mean)} / 4.
                </>
              ) : (
                "Sem domínios disponíveis."
              )}
            </p>
            <p>Considere importância, equidade e capacidade de resposta.</p>
            <p className="p-small">
              Correspondência entre versões da matriz requer conferência
              documental.
            </p>
          </aside>
        </div>
      );
    case "recursos":
      return (
        <div className="p-data-layout">
          <ItemBars snapshot={snapshot} ids={ITEM_SETS.recursos} />
          <aside className="p-reading-note">
            <span className="p-type-label">Pergunta de escuta</span>
            <h3>O que sustenta essas percepções?</h3>
            <p>Quem ainda pode não ter o mesmo acesso a esses recursos?</p>
            <p className="p-small">
              Seleção temática de itens; não é ranking automático da fonte
              atual.
            </p>
          </aside>
        </div>
      );
    case "recuperacao":
      return (
        <div className="p-item-pair">
          {[24, 9].map((id) => {
            const q = snapshot.questions.find((q) => q.id === id);
            return (
              <div key={id}>
                <span className="p-type-label">
                  Q{id} · resultado observado · escala 0–4
                </span>
                <strong>{formatNumber(q?.mean)}</strong>
                <blockquote>
                  “{q?.text ?? "Enunciado não recebido nesta fonte."}”
                </blockquote>
              </div>
            );
          })}
          <p className="p-callout">
            Investigar previsibilidade, demandas, pausas e condições mencionadas
            voluntariamente. Sem estimar prevalências ou atribuir causas.
          </p>
        </div>
      );
    case "vida":
      return (
        <div className="p-data-layout">
          <ItemBars snapshot={snapshot} ids={ITEM_SETS.vida} />
          <aside className="p-reading-note">
            <span className="p-type-label">Antes de agir</span>
            <h3>Conhecer barreiras de acesso</h3>
            <p>Ofertas opcionais, inclusivas e livres de exposição pessoal.</p>
            <p>
              Moradia própria e visitas a exposições não são metas de
              desempenho.
            </p>
          </aside>
        </div>
      );
    case "comunicacao":
      return (
        <div className="p-data-layout">
          <ItemBars snapshot={snapshot} ids={ITEM_SETS.comunicacao} />
          <aside className="p-reading-note">
            <span className="p-type-label">Pergunta prática</span>
            <h3>O que está sendo decidido?</h3>
            <p>Por quê? Onde contribuir? Quando receber uma resposta?</p>
            <p className="p-small">
              Os itens não demonstram isoladamente assédio ou ausência de
              segurança psicológica.
            </p>
          </aside>
        </div>
      );
    case "prioridades":
      return (
        <div className="p-action-map">
          {ACTIONS.map((a, i) => (
            <div key={a.key}>
              <span className="p-step-number">0{i + 1}</span>
              <span className="p-type-label">{a.short}</span>
              <h3>{a.label}</h3>
              <p>{a.goal}</p>
            </div>
          ))}
        </div>
      );
    case "frente-trabalho":
    case "frente-relacoes":
    case "frente-apoio": {
      const action = ACTIONS.find((a) => a.key === slide.detail)!;
      return (
        <div className="p-action-sheet">
          <div className="p-dark-block">
            <span className="p-type-label">Ação proposta</span>
            <h3>{action.goal}</h3>
            <p>{action.description}</p>
          </div>
          <dl>
            <div>
              <dt>Responsabilidade sugerida</dt>
              <dd>{action.role}</dd>
            </div>
            <div>
              <dt>Primeira entrega possível</dt>
              <dd>{action.delivery}</dd>
            </div>
            <div>
              <dt>O que observar</dt>
              <dd>{action.indicator}</dd>
            </div>
          </dl>
        </div>
      );
    }
    case "noventa-dias":
      return <Timeline />;
    case "governanca":
      return (
        <div className="p-governance">
          {GOVERNANCE.map(([role, task], i) => (
            <div key={role}>
              <span className="p-step-number">0{i + 1}</span>
              <h3>{role}</h3>
              <p>{task}</p>
            </div>
          ))}
        </div>
      );
    case "acompanhamento":
      return (
        <div className="p-monitoring">
          {[
            [
              "Execução",
              "O compromisso aconteceu?",
              "Ações concluídas / pactuadas. Devolutivas realizadas / previstas. Função responsável e prazo documentados.",
            ],
            [
              "Experiência",
              "Foi útil e acessível?",
              "Avaliação voluntária, barreiras relatadas, cobertura das oportunidades e ajustes realizados.",
            ],
            [
              "Resultados",
              "O que mudou?",
              "Nova coleta comparável no momento adequado. Mesma versão e regras, sem atribuição causal automática.",
            ],
          ].map(([label, title, body]) => (
            <div key={label}>
              <span className="p-type-label">{label}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}
export function SlideView({
  slide,
  snapshot,
  onOpen,
  onNext,
  reading = false,
}: {
  slide: Slide;
  snapshot: PresentationSnapshot;
  onOpen: (id: string) => void;
  onNext: () => void;
  reading?: boolean;
}) {
  const special = slide.id === "abertura" || slide.id === "pactuacao";
  return (
    <article
      className={`p-slide p-slide-${slide.id} ${special ? "p-cover" : ""}`}
      id={reading ? `leitura-${slide.id}` : "slide-current"}
      aria-labelledby={`title-${slide.id}`}
    >
      <div className="p-slide-main">
        <p className="p-eyebrow">
          <span className="p-accent-line" aria-hidden="true" />
          {slide.eyebrow}
        </p>
        <h2 id={`title-${slide.id}`} tabIndex={-1}>
          {slide.id === "abertura" ? (
            <>
              Escutar.
              <br />
              Compreender.
              <br />
              <em>Agir.</em>
            </>
          ) : (
            slide.title
          )}
        </h2>
        <p className="p-slide-description">{slide.description}</p>
        {special && (
          <div className="p-cover-meta">
            <span>Instituto Felicidade para Todos × ISG</span>
            <p>
              {slide.id === "abertura"
                ? "Devolutiva conduzida pelo Instituto. Fonte identificada no topo da apresentação."
                : "Quem responde? Com quais recursos? Quando será a próxima devolutiva?"}
            </p>
          </div>
        )}
      </div>
      {special ? (
        <Photo closing={slide.id === "pactuacao"} />
      ) : (
        <SlideData slide={slide} snapshot={snapshot} />
      )}
      <div className="p-slide-end">
        <p className="p-slide-limit">
          <span>
            {slide.chapter === "Comprometer"
              ? "Proposta para pactuação"
              : "Limite de leitura"}
          </span>
          {slide.limit}
        </p>
        <button
          type="button"
          className="p-cta p-no-print"
          onClick={() =>
            slide.id === "abertura" ? onNext() : onOpen(slide.detail)
          }
        >
          {slide.cta}
          {slide.id === "abertura" ? (
            <ArrowRight aria-hidden="true" size={18} />
          ) : (
            <ArrowUpRight aria-hidden="true" size={18} />
          )}
        </button>
        <p className="p-source-foot">
          {snapshot.sourceKind === "synthetic_demo"
            ? "Ensaio · dados fictícios"
            : snapshot.sourceKind === "historical_report"
              ? `Retrato documental · emissão ${formatDate(snapshot.issuedAt)}`
              : "API administrativa · resposta congelada em memória"}{" "}
          · Base editorial: relatório institucional, p. {slide.page}.{" "}
          {slide.chapter === "Comprometer"
            ? "Recomendações sujeitas a decisão."
            : "Resultados descritivos, sem recálculo."}
        </p>
      </div>
    </article>
  );
}
