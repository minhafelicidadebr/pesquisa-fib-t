import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { IftPresentationGate } from "./IftPresentationGate";
import { usePresentationAccess } from "../hooks/usePresentationAccess";
import { usePresentationMetadata } from "../hooks/usePresentationMetadata";
import {
  channelName,
  isChannelId,
  syncMessageSchema,
} from "../data/presentation-sync";
import { SOURCE_LABELS, type SourceKind } from "../data/presentation-schema";
import {
  MEETING_AGENDA,
  SLIDES,
  getSlide,
  type Slide,
} from "../content/slides";
import { BrandPair } from "./BrandPair";

export function SpeakerNotes({ slide }: { slide: Slide }) {
  return (
    <div className="p-speaker-notes">
      <p className="p-note-objective">
        <strong>Objetivo de compreensão:</strong> {slide.objective}
      </p>
      <dl>
        {(
          [
            ["observed", "Dado observado"],
            ["interpretation", "Interpretação delimitada"],
            ["question", "Pergunta de escuta"],
            ["proposal", "Ação proposta"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>{slide.notes[key]}</dd>
          </div>
        ))}
      </dl>
      <p className="p-small">
        Fonte editorial: relatório institucional, p. {slide.page}. Limite
        indispensável: {slide.limit}
      </p>
    </div>
  );
}
function Timer() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const started = useRef(0);
  const previous = useRef(0);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(
      () =>
        setElapsed(
          previous.current + Math.floor((Date.now() - started.current) / 1000),
        ),
      250,
    );
    return () => clearInterval(timer);
  }, [running]);
  return (
    <section className="p-timer" aria-label="Cronômetro manual">
      <span>Tempo de reunião</span>
      <output>
        {String(Math.floor(elapsed / 60)).padStart(2, "0")}:
        {String(elapsed % 60).padStart(2, "0")}
      </output>
      <div className="p-button-row">
        <button
          onClick={() => {
            if (running) previous.current = elapsed;
            else started.current = Date.now();
            setRunning(!running);
          }}
        >
          {running ? "Pausar" : "Iniciar"}
        </button>
        <button
          onClick={() => {
            setRunning(false);
            setElapsed(0);
            previous.current = 0;
          }}
        >
          Zerar
        </button>
      </div>
    </section>
  );
}
export function PresenterConsole() {
  usePresentationMetadata(true);
  const [params] = useSearchParams();
  const id = params.get("canal");
  const [slideId, setSlideId] = useState(SLIDES[0].id);
  const [sourceKind, setSourceKind] = useState<SourceKind | null>(null);
  const [connected, setConnected] = useState(false);
  const channel = useRef<BroadcastChannel | null>(null);
  const lastSeen = useRef(0);
  const clear = () => {
    setSourceKind(null);
    setConnected(false);
    setSlideId(SLIDES[0].id);
  };
  const access = usePresentationAccess(clear);
  useEffect(() => {
    if (
      access.status !== "ready" ||
      !isChannelId(id) ||
      typeof BroadcastChannel === "undefined"
    )
      return;
    const bc = new BroadcastChannel(channelName(id));
    channel.current = bc;
    bc.onmessage = (event) => {
      const message = syncMessageSchema.safeParse(event.data);
      if (!message.success || message.data.type !== "state") return;
      lastSeen.current = Date.now();
      setConnected(true);
      setSlideId(message.data.slideId);
      setSourceKind(message.data.sourceKind);
    };
    bc.postMessage({ v: 1, type: "hello" });
    const ping = setInterval(() => {
      bc.postMessage({ v: 1, type: "hello" });
      if (Date.now() - lastSeen.current > 20000) setConnected(false);
    }, 10000);
    return () => {
      clearInterval(ping);
      bc.close();
      channel.current = null;
    };
  }, [access.status, id]);
  const slide = getSlide(slideId);
  const index = SLIDES.indexOf(slide);
  const go = (next: number) =>
    channel.current?.postMessage({
      v: 1,
      type: "navigate",
      slideId: SLIDES[next].id,
    });
  if (access.status === "checking")
    return (
      <div className="isg-presentation p-access-screen">
        <p role="status">Confirmando acesso no servidor…</p>
      </div>
    );
  if (access.status === "denied")
    return (
      <div className="isg-theme isg-presentation">
        <IftPresentationGate onAuthorized={() => void access.check()} />
      </div>
    );
  if (access.status === "unavailable")
    return (
      <div className="isg-presentation p-access-screen">
        <h1>Não foi possível confirmar o acesso</h1>
        <p>
          Verifique a conexão e a implantação de validate-session na função
          isg-results.
        </p>
        <button onClick={() => void access.check()}>Tentar novamente</button>
      </div>
    );
  return (
    <div className="isg-presentation p-console">
      <header className="p-masthead">
        <BrandPair />
        <button onClick={access.logout}>Encerrar sessão</button>
      </header>
      <main>
        <div className="p-console-heading">
          <span className="p-eyebrow">Console do representante</span>
          <h1>Conduzir com clareza.</h1>
          <p className="p-callout">
            Compartilhe somente a janela da apresentação. Compartilhar a tela
            inteira também expõe estas notas.
          </p>
          <p role="status">
            {connected
              ? "Conectado à janela de apresentação"
              : "Aguardando a janela de apresentação"}{" "}
            ·{" "}
            {sourceKind
              ? SOURCE_LABELS[sourceKind]
              : "Nenhuma fonte selecionada"}
          </p>
          {access.notice && <p role="status">{access.notice}</p>}
        </div>
        <div className="p-console-grid">
          <div>
            <section className="p-console-current">
              <span className="p-type-label">
                Slide atual · {index + 1} de {SLIDES.length}
              </span>
              <h2>{slide.title}</h2>
              <p>{slide.description}</p>
              <div className="p-button-row">
                <button
                  disabled={!connected || index === 0}
                  onClick={() => go(index - 1)}
                >
                  Anterior
                </button>
                <button
                  disabled={!connected || index === SLIDES.length - 1}
                  onClick={() => go(index + 1)}
                >
                  Próximo
                </button>
              </div>
            </section>
            <SpeakerNotes slide={slide} />
          </div>
          <aside>
            <Timer />
            <section className="p-console-next">
              <span className="p-type-label">Próximo slide</span>
              <h3>
                {SLIDES[index + 1]?.title ??
                  "Encerramento · reinício apenas por ação explícita"}
              </h3>
            </section>
            <section>
              <h2>Roteiro de 60 minutos</h2>
              <ol className="p-agenda">
                {MEETING_AGENDA.map(([time, title]) => (
                  <li key={time}>
                    <strong>{time}</strong>
                    <span>{title}</span>
                  </li>
                ))}
              </ol>
            </section>
            <p className="p-small">
              Sincronização envia apenas navegação e tipo da fonte. Valores e
              arquivos permanecem na janela em que foram carregados. O acesso é
              confirmado independentemente no servidor.
            </p>
            <Link to="/isg/apresentacao">Abrir apresentação nesta janela</Link>
          </aside>
        </div>
      </main>
    </div>
  );
}
