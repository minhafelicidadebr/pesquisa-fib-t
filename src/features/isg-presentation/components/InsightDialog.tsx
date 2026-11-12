import { useEffect, useRef, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ExternalLink, ArrowRight } from "lucide-react";
import { INSTRUMENT_VERSION, SCORING_ENGINE_VERSION } from "@/domain/fibt";
import {
  ACTIONS,
  EXPLANATIONS,
  GOVERNANCE,
  REFERENCES,
  TIMELINE,
  type ActionKey,
} from "../content/explanations";
import { MEETING_AGENDA, SLIDES } from "../content/slides";
import {
  formatDate,
  type PresentationSnapshot,
} from "../data/presentation-schema";
import { AccessibleBarChart } from "./AccessibleBarChart";
import { QuestionsTable } from "./QuestionsTable";
import { ITEM_SETS } from "../content/items";

export const LIBRARY = [
  ["questoes", "As 32 questões"],
  ["metodologia", "Metodologia e limites"],
  ["fontes", "Fontes e referências"],
  ["roteiro", "Roteiro de reunião"],
  ["aplicacao", "Aplicação online"],
  ["pdf", "PDF institucional local"],
] as const;
const TITLES: Record<string, string> = {
  indice: "O percurso completo",
  biblioteca: "Biblioteca de apoio",
  fonte: "Escolher a fonte",
  questoes: "As 32 questões",
  metodologia: "Metodologia e limites",
  fontes: "Fontes para conferir",
  roteiro: "Roteiro de 60 minutos",
  aplicacao: "Aplicação e continuidade",
  compreensao: "Uma média conta toda a história?",
  recursos: "Itens e limites de leitura",
  cronograma: "O ciclo de 90 dias",
  governanca: "Quem faz o quê?",
  pactuacao: "Rascunho de pactuação",
  pdf: "PDF institucional · seleção local",
  notas: "Notas locais do representante",
};

function Comprehension() {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="p-comprehension">
      <h3>Uma média 2,00 significa que todos responderam “neutro”?</h3>
      <p>
        Faça uma pausa para pensar. Não há pontuação ou registro de respostas.
      </p>
      <button onClick={() => setRevealed(true)} disabled={revealed}>
        Mostrar explicação
      </button>
      {revealed && (
        <div role="status" className="p-callout">
          <strong>Não.</strong> Uma média pode resultar de respostas diferentes.
          Sem contagens válidas, não sabemos como as respostas se distribuíram.
          O global na escala de 0 a 100 também não representa a proporção de
          pessoas felizes.
        </div>
      )}
    </div>
  );
}
export function ExplanationBody({
  topic,
  snapshot,
  onPriority,
}: {
  topic: string;
  snapshot: PresentationSnapshot;
  onPriority?: (key: ActionKey) => void;
}) {
  const action = ACTIONS.find((a) => a.key === topic);
  if (action)
    return (
      <>
        <span className="p-type-label">Recomendação · ainda não pactuada</span>
        <h3>{action.title}</h3>
        <p>{action.description}</p>
        <dl className="p-detail-list">
          {[
            ["Objetivo", action.goal],
            ["Responsabilidade sugerida", action.role],
            ["Recursos a confirmar", action.resources],
            ["Primeira entrega possível", action.delivery],
            ["Indicador operacional", action.indicator],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p className="p-callout">
          Escolher esta frente apenas a leva ao rascunho. Ação, função, recursos
          e prazos precisam ser revisados e confirmados com a equipe.
        </p>
        {onPriority && (
          <button onClick={() => onPriority(action.key)}>
            Levar ao quadro de pactuação{" "}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        )}
        <p className="p-small">
          {action.source} Sem protocolo clínico ou promessa de eficácia.
        </p>
      </>
    );
  if (topic === "compreensao") return <Comprehension />;
  if (topic === "questoes") return <QuestionsTable snapshot={snapshot} />;
  if (topic === "recursos")
    return (
      <>
        <p>
          Itens selecionados por relevância temática para a conversa. Não
          pressupõem as maiores médias na fonte atual.
        </p>
        <QuestionsTable snapshot={snapshot} ids={ITEM_SETS.recursos} />
        <p className="p-callout">
          Q31 trata de propósito maior na vida, sem equivalência com alinhamento
          à missão da ISG. Recursos percebidos não demonstram acesso igual para
          todos.
        </p>
      </>
    );
  if (topic === "metodologia")
    return (
      <>
        <h3>Fonte ativa e rastreabilidade</h3>
        <p>
          Emissão: {formatDate(snapshot.issuedAt)}. Atualização informada:{" "}
          {formatDate(snapshot.dataUpdatedAt)}. Versão do instrumento desta
          coleta: {snapshot.instrumentVersion ?? "não confirmada"}. Algoritmo
          desta coleta: {snapshot.engineVersion ?? "não confirmado"}.
        </p>
        <p>
          O código atual declara instrumento {INSTRUMENT_VERSION}, algoritmo{" "}
          {SCORING_ENGINE_VERSION} e fatores com 12 / 12 / 8 itens. O global
          implementado usa a média não ponderada dos nove domínios reescalada.
          Isso não comprova a versão usada na coleta histórica nem homologa
          agrupamentos cientificamente.
        </p>
        <p>
          O levantamento é descritivo e transversal: não estabelece causalidade,
          evolução ou efeito de intervenção. Não é diagnóstico clínico, laudo ou
          avaliação individual de desempenho. Fatores e domínios são
          agrupamentos distintos; nove domínios não equivalem automaticamente a
          nove escalas validadas.
        </p>
        <p>
          O relatório registra divergência de composição de domínios entre a
          matriz digital e o questionário de 2020. É necessário reconciliar
          versão, precisão e denominadores com a fonte responsável. Os valores
          publicados são preservados. A apresentação não produz um recálculo
          oficial.
        </p>
        {snapshot.methodNotes.map((note, i) => (
          <section key={i} className="p-method-note">
            <h3>{note.title}</h3>
            <p>{note.detail}</p>
          </section>
        ))}
        <h3>O que falta documentar</h3>
        <p>
          População elegível, convites, janela integral, participação única,
          cobertura, contagens por item e versão efetivamente executada.
          Solicitar exportação agregada de origem e precisão anterior à
          formatação, sem respostas identificáveis.
        </p>
        <p className="p-callout">
          Transcrição documental e validação de estrutura não autenticam a
          origem do arquivo. Não há homologação científica emitida por esta
          interface.
        </p>
      </>
    );
  if (topic === "fontes")
    return (
      <>
        <h3>Fonte dos números nesta sessão</h3>
        <ul>
          {snapshot.sourceRefs.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
        <p>
          Hierarquia editorial: painel original da rodada; relatório
          institucional; código e manifesto com vínculo a confirmar;
          documentação primária; referências externas de comunicação e desenho.
        </p>
        <p className="p-callout">
          O painel versionado na raiz do repositório retrata agosto. Ele diverge
          do histórico de outubro e não o substitui. O painel original de
          outubro não foi fornecido separadamente nesta sessão.
        </p>
        <div className="p-references">
          {REFERENCES.map((r) => (
            <div key={r.href}>
              <a
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
              >
                {r.label}
                <ExternalLink size={14} aria-hidden="true" />
                <span className="sr-only"> (abre em nova aba)</span>
              </a>
              <p>{r.status}</p>
            </div>
          ))}
        </div>
        <p className="p-small">
          Links de referência transcritos do material. Disponibilidade externa
          pode mudar; não há endosso, ranking de empresas ou benchmark de
          escores.
        </p>
      </>
    );
  if (topic === "roteiro" || topic === "percurso")
    return (
      <>
        <p>
          Exposição inicial em aproximadamente 20 minutos; reunião completa
          sugerida em 60 minutos. Tempos são orientações e não acionam avanço
          automático.
        </p>
        <ol className="p-agenda">
          {MEETING_AGENDA.map(([time, title]) => (
            <li key={time}>
              <strong>{time}</strong>
              <span>{title}</span>
            </li>
          ))}
        </ol>
        <p>
          Combine finalidade, leitura descritiva e respeito à participação. Não
          peça que as pessoas revelem respostas individuais. Durante a escuta,
          pergunte o que os dados ajudam a ver e quais barreiras podem ser
          modificadas.
        </p>
        <p>
          Na pactuação, examine importância, capacidade de ação, alcance,
          equidade e recursos. Escolha até três frentes, defina função
          responsável, primeira entrega e próxima devolutiva. No encerramento,
          cada responsável pode resumir o acordo com suas palavras.
        </p>
        <p>
          O roteiro é uma proposta de facilitação. A adaptação pedagógica das
          orientações do IES/WWC não foi avaliada experimentalmente na ISG.
          Ajuste a condução ao grupo e mantenha espaço para discordâncias sem
          constrangimento.
        </p>
      </>
    );
  if (topic === "aplicacao")
    return (
      <>
        <h3>Antes, durante e depois</h3>
        <p>
          O fluxo consultado no código apresenta uma questão por vez, preserva
          os 32 itens e permite revisão antes do envio. Antes de uma próxima
          aplicação, informar finalidade, público, voluntariedade, janela de
          coleta, uso dos resultados e suporte acessível.
        </p>
        <p>
          Depois da participação, distinguir autoconhecimento individual de
          devolutiva organizacional agregada. A apresentação trabalha com
          agregados; não dá acesso a respostas individuais. Essa constatação
          sobre a interface não permite afirmar que nenhum dado pessoal seja
          armazenado em toda a operação.
        </p>
        <p>
          Confirmar versão, regras de participação única, denominadores e
          política de ausência. Não tratar ausência como zero. O limiar
          informado na fonte é {snapshot.threshold ?? "desconhecido"}; um limiar
          isolado não garante anonimato. Evitar recortes identificáveis e
          verificar acesso, registros técnicos e retenção antes de prometer
          proteção absoluta.
        </p>
        <p className="p-callout">
          Operação e implantação precisam de confirmação pela equipe técnica.
          Nenhuma base de produção ou resposta individual foi acessada para
          desenvolver esta apresentação.
        </p>
      </>
    );
  if (topic === "cronograma")
    return (
      <>
        <p>
          Proposta de 90 dias a contar da pactuação, sem datas reais ou
          designações presumidas.
        </p>
        {TIMELINE.map((t) => (
          <section key={t.period} className="p-method-note">
            <span className="p-type-label">{t.period}</span>
            <h3>{t.title}</h3>
            <p>{t.detail}</p>
          </section>
        ))}
        <p className="p-callout">
          Check-ins de processo podem ser frequentes. Reaplicar itens com janela
          de 12 meses exige planejamento próprio; não é uma medida automática de
          efeito em 90 dias.
        </p>
      </>
    );
  if (topic === "governanca")
    return (
      <>
        <p>Papéis sugeridos para confirmação na reunião.</p>
        <dl className="p-detail-list">
          {GOVERNANCE.map(([role, task]) => (
            <div key={role}>
              <dt>{role}</dt>
              <dd>{task}</dd>
            </div>
          ))}
        </dl>
        <p className="p-callout">
          Função responsável precisa de recursos e autonomia. Acesso ao agregado
          não autoriza cobrança de respostas ou exposição individual.
        </p>
      </>
    );
  const explanation = EXPLANATIONS[topic];
  if (!explanation) return null;
  return (
    <>
      {explanation.paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      <dl className="p-conclusion">
        <div>
          <dt>O que podemos concluir</dt>
          <dd>{explanation.can}</dd>
        </div>
        <div>
          <dt>O que não podemos concluir</dt>
          <dd>{explanation.cannot}</dd>
        </div>
      </dl>
      {topic === "dominios" && (
        <AccessibleBarChart
          title="Domínios da fonte"
          rows={snapshot.domains}
          ordered
        />
      )}
      {ITEM_SETS[topic] && (
        <QuestionsTable snapshot={snapshot} ids={ITEM_SETS[topic]} />
      )}
      <p className="p-callout">{explanation.question}</p>
    </>
  );
}

export function InsightDialog({
  active,
  onClose,
  snapshot,
  trigger,
  onTopic,
  onGo,
  slideId,
  onPriority,
  sourcePanel,
  pdfPanel,
  commitmentPanel,
  notesPanel,
  reducedMotion,
}: {
  active: string | null;
  onClose: () => void;
  snapshot: PresentationSnapshot | null;
  trigger: HTMLElement | null;
  onTopic: (id: string) => void;
  onGo: (id: string) => void;
  slideId: string;
  onPriority: (key: ActionKey) => void;
  sourcePanel: ReactNode;
  pdfPanel: ReactNode;
  commitmentPanel: ReactNode;
  notesPanel: ReactNode;
  reducedMotion: boolean;
}) {
  const title = active
    ? (TITLES[active] ??
      EXPLANATIONS[active]?.title ??
      ACTIONS.find((a) => a.key === active)?.title ??
      "Aprofundamento")
    : "Aprofundamento";
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (active) heading.current?.focus();
  }, [active]);
  return (
    <Dialog.Root
      open={active !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="p-dialog-overlay" />
        <Dialog.Content
          className={`isg-presentation p-dialog ${reducedMotion ? "p-reduced-motion" : ""}`}
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            heading.current?.focus();
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            trigger?.focus({ preventScroll: true });
          }}
        >
          <header className="p-dialog-header">
            <div>
              <span className="p-eyebrow">Aprofundar a conversa</span>
              <Dialog.Title ref={heading} tabIndex={-1}>
                {title}
              </Dialog.Title>
            </div>
            <Dialog.Close
              className="p-icon-button"
              aria-label="Fechar aprofundamento"
            >
              <X size={22} aria-hidden="true" />
            </Dialog.Close>
          </header>
          <div className="p-dialog-body">
            {active === "indice" ? (
              <nav aria-label="Índice dos slides" className="p-chapter-list">
                {SLIDES.map((s, i) => (
                  <button
                    key={s.id}
                    aria-current={s.id === slideId ? "step" : undefined}
                    onClick={() => onGo(s.id)}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <small>{s.chapter}</small>
                      {s.title}
                    </span>
                  </button>
                ))}
              </nav>
            ) : active === "biblioteca" ? (
              <div className="p-library-list">
                {LIBRARY.map(([id, label]) => (
                  <button key={id} onClick={() => onTopic(id)}>
                    {label}
                    <ArrowRight size={17} aria-hidden="true" />
                  </button>
                ))}
              </div>
            ) : active === "fonte" ? (
              sourcePanel
            ) : active === "pdf" ? (
              pdfPanel
            ) : active === "pactuacao" ? (
              commitmentPanel
            ) : active === "notas" ? (
              notesPanel
            ) : snapshot && active ? (
              <ExplanationBody
                key={active}
                topic={active}
                snapshot={snapshot}
                onPriority={onPriority}
              />
            ) : (
              <p>Escolha uma fonte autorizada para continuar.</p>
            )}
          </div>
          <footer className="p-dialog-footer">
            <span>
              {snapshot?.sourceKind === "synthetic_demo"
                ? "Demonstração · dados fictícios"
                : "Uso administrativo restrito · sem registro de relatos pessoais"}
            </span>
            <Dialog.Close>Voltar à apresentação</Dialog.Close>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
