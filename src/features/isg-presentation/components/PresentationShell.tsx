import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  Expand,
  Library,
  List,
  LogOut,
  Monitor,
  Printer,
  Settings2,
} from "lucide-react";
import { IsgResultsGate } from "@/components/isg/IsgResultsGate";
import { IsgSessionExpired } from "@/lib/isgAggregate";
import { SLIDES, getSlide } from "../content/slides";
import { ACTIONS, type ActionKey } from "../content/explanations";
import {
  adaptCurrentAggregate,
  createSyntheticDemo,
} from "../data/presentation-adapter";
import { fetchPresentationAggregate } from "../data/presentation-access";
import {
  formatDate,
  parseHistoricalFile,
  SOURCE_LABELS,
  type PresentationSnapshot,
} from "../data/presentation-schema";
import { channelName, syncMessageSchema } from "../data/presentation-sync";
import { usePresentationAccess } from "../hooks/usePresentationAccess";
import { usePresentationMetadata } from "../hooks/usePresentationMetadata";
import { BrandPair } from "./BrandPair";
import { PrintPresentation } from "./PrintPresentation";
import { CommitmentBoard } from "./CommitmentBoard";
import { newCommitment, type Commitment } from "../data/commitments";
import { ExplanationBody, InsightDialog } from "./InsightDialog";
import { SpeakerNotes } from "./PresenterConsole";
import { SlideView } from "./SlideView";

function freezeSnapshot(snapshot: PresentationSnapshot): PresentationSnapshot {
  const freeze = (value: unknown) => {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      for (const child of Object.values(value)) freeze(child);
      Object.freeze(value);
    }
  };
  freeze(snapshot);
  return snapshot;
}

export function PresentationShell() {
  usePresentationMetadata();
  const [params, setParams] = useSearchParams();
  const slide = getSlide(params.get("slide"));
  const index = SLIDES.indexOf(slide);
  const [mode, setMode] = useState<"slides" | "reading">(() =>
    window.matchMedia("(max-width: 760px)").matches ? "reading" : "slides",
  );
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [snapshot, setSnapshot] = useState<PresentationSnapshot | null>(null);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [items, setItems] = useState<Commitment[]>([]);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [channelId] = useState(() => crypto.randomUUID());
  const sourceAttempt = useRef(0);
  const opener = useRef<HTMLElement | null>(null);
  const pdfRef = useRef<string | null>(null);
  const popup = useRef<Window | null>(null);
  const channel = useRef<BroadcastChannel | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const previousNavigation = useRef<{
    id: string;
    mode: string;
    snapshot: PresentationSnapshot | null;
  } | null>(null);
  const syncState = useRef({
    slideId: slide.id,
    mode,
    sourceKind: snapshot?.sourceKind ?? null,
  });
  syncState.current = {
    slideId: slide.id,
    mode,
    sourceKind: snapshot?.sourceKind ?? null,
  };
  const clear = useCallback(() => {
    sourceAttempt.current++;
    setSnapshot(null);
    setItems([]);
    setDirty(false);
    setActiveDialog(null);
    setMessage("");
    setBusy(false);
    if (pdfRef.current) URL.revokeObjectURL(pdfRef.current);
    pdfRef.current = null;
    setPdfUrl(null);
  }, []);
  const access = usePresentationAccess(clear);
  const go = useCallback(
    (id: string) => {
      if (SLIDES.some((s) => s.id === id)) setParams({ slide: id });
    },
    [setParams],
  );
  const open = (id: string) => {
    if (!activeDialog)
      opener.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    setActiveDialog(id);
  };
  useEffect(() => {
    if (
      params.has("slide") &&
      !SLIDES.some((s) => s.id === params.get("slide"))
    )
      setParams({}, { replace: true });
  }, [params, setParams]);
  useEffect(() => {
    if (!snapshot || activeDialog) return;
    const previous = previousNavigation.current;
    if (
      previous?.id === slide.id &&
      previous.mode === mode &&
      previous.snapshot === snapshot
    )
      return;
    previousNavigation.current = { id: slide.id, mode, snapshot };
    const title = document.getElementById(`title-${slide.id}`);
    title?.focus({ preventScroll: true });
    if (mode === "slides") {
      window.scrollTo({ top: 0, behavior: "instant" });
      root.current
        ?.querySelector(".p-deck-region")
        ?.scrollTo({ top: 0, behavior: "instant" });
    }
    if (mode === "reading")
      document
        .getElementById(`leitura-${slide.id}`)
        ?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [slide.id, mode, snapshot, activeDialog]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    if (access.status !== "ready" || typeof BroadcastChannel === "undefined")
      return;
    const bc = new BroadcastChannel(channelName(channelId));
    channel.current = bc;
    const send = () =>
      bc.postMessage({ v: 1, type: "state", ...syncState.current });
    bc.onmessage = (event) => {
      const parsed = syncMessageSchema.safeParse(event.data);
      if (!parsed.success) return;
      if (parsed.data.type === "hello") send();
      if (parsed.data.type === "navigate") go(parsed.data.slideId);
    };
    send();
    return () => {
      bc.close();
      channel.current = null;
    };
  }, [access.status, channelId, go]);
  useEffect(() => {
    channel.current?.postMessage({ v: 1, type: "state", ...syncState.current });
  }, [slide.id, mode, snapshot?.sourceKind]);

  const accept = (value: PresentationSnapshot) => {
    setSnapshot(freezeSnapshot(value));
    setItems([]);
    setDirty(false);
    setActiveDialog(null);
    setMessage("");
    if (pdfRef.current) URL.revokeObjectURL(pdfRef.current);
    pdfRef.current = null;
    setPdfUrl(null);
  };
  const loadSource = async (
    kind: "synthetic_demo" | "current_aggregate",
    file?: File,
  ) => {
    if (busy) return;
    const attempt = ++sourceAttempt.current;
    setBusy(true);
    setMessage("");
    try {
      if (!(await access.check())) return;
      const next = file
        ? await parseHistoricalFile(file)
        : kind === "synthetic_demo"
          ? createSyntheticDemo()
          : adaptCurrentAggregate(await fetchPresentationAggregate());
      if (sourceAttempt.current !== attempt) return;
      accept(next);
    } catch (error) {
      if (error instanceof IsgSessionExpired) access.logout();
      else if (sourceAttempt.current === attempt)
        setMessage(
          file
            ? "Arquivo incompatível. Confira schema, enunciados, distribuições e regras de supressão. O retrato anterior foi preservado."
            : "Não foi possível carregar a fonte. O retrato anterior foi preservado; verifique a conexão e o contrato do servidor.",
        );
    } finally {
      if (sourceAttempt.current === attempt) setBusy(false);
    }
  };
  const addPriority = (key: ActionKey) => {
    setItems((current) =>
      current.some((c) => c.key === key)
        ? current
        : [...current, newCommitment(key)].slice(0, 3),
    );
    setDirty(true);
    setActiveDialog("pactuacao");
  };
  const selectPdf = async (file?: File) => {
    if (!file) return;
    const attempt = ++sourceAttempt.current;
    setMessage("");
    if (file.size > 20 * 1024 * 1024) {
      setMessage("Selecione um PDF de até 20 MB.");
      return;
    }
    if (!(await access.check())) return;
    if (
      new TextDecoder().decode(await file.slice(0, 5).arrayBuffer()) !== "%PDF-"
    ) {
      setMessage("Selecione um PDF compatível de até 20 MB.");
      return;
    }
    if (sourceAttempt.current !== attempt) return;
    if (pdfRef.current) URL.revokeObjectURL(pdfRef.current);
    pdfRef.current = URL.createObjectURL(file);
    setPdfUrl(pdfRef.current);
  };
  const openConsole = () => {
    if (typeof BroadcastChannel === "undefined") {
      open("notas");
      return;
    }
    if (popup.current && !popup.current.closed) {
      popup.current.focus();
      return;
    }
    popup.current = window.open(
      `/isg/apresentacao/console?canal=${channelId}`,
      "isg-representante",
      "popup,width=1160,height=850",
    );
    if (!popup.current) open("notas");
  };
  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen)
        await document.documentElement.requestFullscreen();
      else
        setMessage(
          "Tela cheia indisponível neste navegador. Use a maximização da janela.",
        );
    } catch {
      setMessage(
        "Não foi possível entrar em tela cheia. Use a maximização da janela.",
      );
    }
  };

  const sourcePanel = (
    <section className="p-source-picker">
      <p>
        Selecione uma fonte para esta sessão. Cada troca substitui o retrato e
        limpa o rascunho de pactuação.
      </p>
      {dirty && (
        <p className="p-callout">
          Há um rascunho não exportado. Volte ao quadro para revisá-lo antes de
          trocar a fonte.
        </p>
      )}
      <div className="p-source-option">
        <span className="p-type-label">Histórico privado</span>
        <h3>Carregar retrato documental</h3>
        <p>
          Selecione o JSON agregado preparado fora do Git. O arquivo fica em
          memória e não é enviado ao servidor. Sua estrutura será validada; a
          origem não é autenticada por essa conferência.
        </p>
        <label className="p-file-label">
          Selecionar arquivo histórico
          <input
            type="file"
            accept=".json,application/json"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void loadSource("synthetic_demo", file);
            }}
          />
        </label>
      </div>
      <div className="p-source-option">
        <span className="p-type-label">Ensaio</span>
        <h3>Demonstração fictícia</h3>
        <p>
          Dados sintéticos para conhecer os controles. Não representam
          resultados da ISG.
        </p>
        <button
          disabled={busy}
          onClick={() => void loadSource("synthetic_demo")}
        >
          Usar dados fictícios
        </button>
      </div>
      <div className="p-source-option">
        <span className="p-type-label">Leitura autorizada da API</span>
        <h3>Carregar agregado atual</h3>
        <p>
          Consulta explícita ao contrato administrativo. A resposta ficará
          congelada em memória. Não é identificada como a mesma rodada do
          relatório.
        </p>
        <button
          disabled={busy}
          onClick={() => void loadSource("current_aggregate")}
        >
          Consultar agregado atual
        </button>
      </div>
      {busy && <p role="status">Validando acesso e carregando fonte…</p>}
      {message && <p role="alert">{message}</p>}
    </section>
  );
  const commitmentPanel = (
    <CommitmentBoard
      items={items}
      onChange={(next) => {
        setItems(next);
        setDirty(true);
      }}
      onExport={() => setDirty(false)}
    />
  );
  const pdfPanel = (
    <section>
      <p>
        O PDF institucional é distinto da impressão desta apresentação.
        Selecione o documento localmente após confirmar sua origem. Nenhum
        arquivo é enviado à aplicação.
      </p>
      <label className="p-file-label">
        Selecionar PDF local · até 20 MB
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => {
            void selectPdf(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      {message && <p role="alert">{message}</p>}
      {pdfUrl && (
        <iframe
          className="p-pdf-frame"
          src={pdfUrl}
          title="PDF institucional selecionado localmente"
        />
      )}
    </section>
  );

  if (access.status === "checking")
    return (
      <div className="isg-presentation p-access-screen">
        <p role="status">Confirmando acesso administrativo no servidor…</p>
      </div>
    );
  if (access.status === "denied")
    return (
      <div className="isg-theme isg-presentation">
        <IsgResultsGate onAuthorized={() => void access.check()} />
      </div>
    );
  if (access.status === "unavailable")
    return (
      <main className="isg-presentation p-access-screen">
        <span className="p-eyebrow">Acesso protegido</span>
        <h1>A confirmação de acesso está indisponível</h1>
        <p>
          A função isg-results precisa oferecer a operação validate-session, sem
          consultar a base. Confira a conexão e a implantação com a equipe
          técnica.
        </p>
        <div className="p-button-row">
          <button onClick={() => void access.check()}>Tentar novamente</button>
          <button onClick={access.logout}>Voltar ao acesso</button>
        </div>
      </main>
    );
  return (
    <div
      ref={root}
      className={`isg-presentation p-shell ${reducedMotion ? "p-reduced-motion" : ""}`}
    >
      <header className="p-masthead p-no-print">
        <BrandPair />
        <div className="p-masthead-right">
          <span>
            Pesquisa FIB-T
            <br />
            <small>Devolutiva institucional</small>
          </span>
          <button
            className="p-icon-button"
            aria-label="Encerrar sessão administrativa"
            onClick={access.logout}
          >
            <LogOut size={19} aria-hidden="true" />
          </button>
        </div>
      </header>
      <div className="p-source-bar p-no-print">
        <button className="p-source-switch" onClick={() => open("fonte")}>
          <span
            className={`p-source-dot ${snapshot?.sourceKind === "synthetic_demo" ? "p-demo-dot" : ""}`}
            aria-hidden="true"
          />
          {snapshot ? SOURCE_LABELS[snapshot.sourceKind] : "Selecionar fonte"}
          <ChevronDown size={14} aria-hidden="true" />
        </button>
        <span className="p-source-status">
          {snapshot?.sourceKind === "historical_report"
            ? `Retrato do relatório de ${formatDate(snapshot.issuedAt)} · transcrição documental`
            : snapshot?.sourceKind === "synthetic_demo"
              ? "DADOS FICTÍCIOS · sem vínculo com resultados institucionais"
              : snapshot
                ? "Resposta da API congelada nesta sessão"
                : "Acesso confirmado · histórico carregado apenas em memória"}
        </span>
        <button className="p-text-button" onClick={() => open("biblioteca")}>
          <Library size={16} aria-hidden="true" />
          Biblioteca de apoio
        </button>
      </div>
      {access.notice && (
        <p className="p-runtime-notice" role="status">
          {access.notice}
        </p>
      )}
      {message && activeDialog !== "fonte" && activeDialog !== "pdf" && (
        <p className="p-runtime-notice" role="alert">
          {message}
        </p>
      )}
      {!snapshot ? (
        <main className="p-welcome">
          <span className="p-eyebrow">Preparar a devolutiva</span>
          <h1>
            Uma conversa que
            <br />
            começa pela <em>escuta.</em>
          </h1>
          <p>Escolha a fonte, confira seu contexto e prepare o encontro.</p>
          {sourcePanel}
        </main>
      ) : snapshot.suppressed ? (
        <main className="p-welcome">
          <h1>
            {snapshot.n === 0
              ? "Nenhuma participação disponível"
              : "Resultados suprimidos nesta fonte"}
          </h1>
          <p>
            O limiar informado é {snapshot.threshold ?? "desconhecido"}. Médias
            e distribuições não são apresentadas. O limiar isolado não garante
            anonimato.
          </p>
          <button onClick={() => open("fonte")}>Escolher outra fonte</button>
        </main>
      ) : (
        <>
          <main
            className={`p-deck-region p-mode-${mode}`}
            aria-label="Conteúdo da apresentação"
            tabIndex={0}
            onKeyDown={(event) => {
              if (
                mode !== "slides" ||
                activeDialog ||
                event.altKey ||
                event.ctrlKey ||
                event.metaKey ||
                (event.target as HTMLElement).closest(
                  "input,textarea,select,button,a,summary,[contenteditable=true],[role=dialog]",
                )
              )
                return;
              if (["ArrowRight", "PageDown"].includes(event.key)) {
                event.preventDefault();
                if (index < SLIDES.length - 1) go(SLIDES[index + 1].id);
              }
              if (["ArrowLeft", "PageUp"].includes(event.key)) {
                event.preventDefault();
                if (index > 0) go(SLIDES[index - 1].id);
              }
            }}
          >
            <h1 className="sr-only">
              Apresentação institucional ISG × Instituto Felicidade para Todos
            </h1>
            <div
              className="p-slide-announcer sr-only"
              aria-live="polite"
              aria-atomic="true"
            >
              {index + 1} de {SLIDES.length}: {slide.title}
            </div>
            {mode === "slides" ? (
              <div className="p-slide-transition" key={slide.id}>
                <SlideView
                  slide={slide}
                  snapshot={snapshot}
                  onOpen={open}
                  onNext={() => go(SLIDES[1].id)}
                />
              </div>
            ) : (
              <div className="p-reading">
                <nav
                  className="p-reading-index p-no-print"
                  aria-label="Capítulos do modo leitura"
                >
                  {["Compreender", "Dialogar", "Comprometer"].map((chapter) => (
                    <button
                      key={chapter}
                      onClick={() =>
                        go(SLIDES.find((s) => s.chapter === chapter)!.id)
                      }
                    >
                      {chapter}
                    </button>
                  ))}
                </nav>
                {SLIDES.map((s) => (
                  <section key={s.id}>
                    <SlideView
                      slide={s}
                      snapshot={snapshot}
                      reading
                      onOpen={open}
                      onNext={() => go(SLIDES[1].id)}
                    />
                    <details className="p-reading-details">
                      <summary>Aprofundar: {s.cta}</summary>
                      {s.detail === "pactuacao" ? (
                        commitmentPanel
                      ) : (
                        <ExplanationBody
                          topic={s.detail}
                          snapshot={snapshot}
                          onPriority={addPriority}
                        />
                      )}
                    </details>
                  </section>
                ))}
              </div>
            )}
          </main>
          <footer className="p-controls p-no-print">
            <div className="p-progress">
              <span>{slide.chapter}</span>
              <div
                role="progressbar"
                aria-label="Progresso da apresentação"
                aria-valuemin={1}
                aria-valuemax={SLIDES.length}
                aria-valuenow={index + 1}
              >
                <span
                  style={{ width: `${((index + 1) / SLIDES.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="p-mode-controls">
              <button
                className="p-icon-button"
                title="Índice"
                aria-label="Abrir índice de capítulos"
                onClick={() => open("indice")}
              >
                <List size={20} aria-hidden="true" />
              </button>
              <button
                className="p-icon-button"
                title="Alternar slides e leitura"
                aria-label={
                  mode === "slides"
                    ? "Ativar modo leitura"
                    : "Ativar modo slides"
                }
                onClick={() =>
                  setMode(mode === "slides" ? "reading" : "slides")
                }
              >
                <BookOpen size={19} aria-hidden="true" />
              </button>
              <button
                className="p-icon-button"
                title="Console do representante"
                aria-label="Abrir console do representante em outra janela"
                onClick={openConsole}
              >
                <Monitor size={19} aria-hidden="true" />
              </button>
              <button
                className="p-icon-button"
                title="Tela cheia"
                aria-label="Alternar tela cheia"
                onClick={() => void fullscreen()}
              >
                <Expand size={18} aria-hidden="true" />
              </button>
              <button
                className="p-icon-button"
                title="Imprimir leitura"
                aria-label="Imprimir apresentação em modo leitura"
                onClick={() => window.print()}
              >
                <Printer size={18} aria-hidden="true" />
              </button>
              <details className="p-preferences">
                <summary aria-label="Preferências de movimento">
                  <Settings2 size={18} aria-hidden="true" />
                </summary>
                <label>
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={(e) => setReducedMotion(e.target.checked)}
                  />
                  Reduzir movimento
                </label>
                <span>
                  Teclado: setas e PageUp/PageDown no conteúdo do deck.
                </span>
                <Link to="/isg/resultados">
                  Voltar ao painel administrativo
                </Link>
              </details>
            </div>
            <div className="p-slide-navigation">
              <button
                className="p-icon-button"
                aria-label="Slide anterior"
                disabled={index === 0}
                onClick={() => go(SLIDES[index - 1].id)}
              >
                <ArrowLeft size={21} aria-hidden="true" />
              </button>
              <span>
                <strong>{String(index + 1).padStart(2, "0")}</strong> /{" "}
                {SLIDES.length}
              </span>
              {index === SLIDES.length - 1 ? (
                <button onClick={() => go(SLIDES[0].id)}>Reiniciar</button>
              ) : (
                <button
                  className="p-next-button"
                  aria-label="Próximo slide"
                  onClick={() => go(SLIDES[index + 1].id)}
                >
                  <ArrowRight size={21} aria-hidden="true" />
                </button>
              )}
            </div>
          </footer>
          <PrintPresentation snapshot={snapshot} items={items} />
        </>
      )}
      <InsightDialog
        active={activeDialog}
        onClose={() => setActiveDialog(null)}
        snapshot={snapshot}
        trigger={opener.current}
        onTopic={setActiveDialog}
        onGo={(id) => {
          go(id);
          setActiveDialog(null);
        }}
        slideId={slide.id}
        onPriority={addPriority}
        sourcePanel={sourcePanel}
        pdfPanel={pdfPanel}
        commitmentPanel={commitmentPanel}
        notesPanel={
          <>
            <p className="p-callout">
              Notas locais visíveis nesta janela. Um pop-up bloqueado ou
              sincronização indisponível pode ter impedido o console.
              Compartilhe somente a janela de projeção.
            </p>
            <SpeakerNotes slide={slide} />
          </>
        }
        reducedMotion={reducedMotion}
      />
    </div>
  );
}
