import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowDownToLine, ArrowRight, BookOpen, Check, ChevronLeft, Copy, Heart, Leaf, LoaderCircle, QrCode, Share2, ShieldCheck, X } from "lucide-react";
import { FIBA_DOMAINS, FIBA_ITEMS, FIBA_LIKERT, FIBA_VERSION, scoreFiba, type FibaResult } from "@/domain/fiba";
import { submitFibaAnswers } from "@/lib/fibaResult";
import { FIBA_FORMAT as fmt, FIBA_METHOD_NOTE, FIBA_ROUTE } from "./content";
import "./turma-do-bem.css";

type Step = "welcome" | "participation" | "question" | "review" | "result";
const sampleAnswers = FIBA_ITEMS.map((item, index) => ({ id: item.id, answer: [3, 2, 4, 3, 2, 3, 1][index % 7] }));

function CareIllustration() {
  return <svg className="tdb-art" viewBox="0 0 440 340" fill="none" aria-hidden="true">
    <circle cx="227" cy="165" r="123" fill="#DFEACF" />
    <circle cx="309" cy="72" r="22" fill="#EBC3A9" />
    <path d="M133 182C98 153 73 159 78 185l39 79c8 16 29 23 48 20l39-6" fill="#EBC3A9" stroke="#214C3B" strokeWidth="2" />
    <path d="M311 185c34-29 61-24 56 3l-40 77c-9 16-29 24-49 19l-39-8" fill="#EBC3A9" stroke="#214C3B" strokeWidth="2" />
    <path d="M173 134c-27-37-77-10-56 27 13 25 57 45 57 45s46-23 55-48c13-38-36-57-56-24Z" fill="#327252" transform="translate(49 -10)" />
    <path d="M225 221v-65m0 39c-32 0-43-20-43-20 26-5 43 20 43 20Zm0-19c30-2 41-23 41-23-27-2-41 23-41 23Z" stroke="#F4F6EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m136 213 49 24c12 6 33 5 39 21m86-45-49 24c-12 6-33 5-39 21" stroke="#214C3B" strokeWidth="2" strokeLinecap="round" />
    <path d="M97 108c-14-11-12-25-12-25 18 1 29 12 26 30m231 10c13-10 15-25 15-25-18 1-28 11-25 28" stroke="#327252" strokeWidth="2" strokeLinecap="round" />
    <path d="m132 76 5-12m-22 18-12-4m219 156 8 10m5-24 13 2" stroke="#327252" strokeWidth="2" strokeLinecap="round" />
    <circle cx="147" cy="310" r="3" fill="#327252" /><circle cx="295" cy="315" r="3" fill="#327252" />
  </svg>;
}

export default function TurmaDoBem() {
  const [step, setStep] = useState<Step>("welcome");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [consent, setConsent] = useState(false);
  const [editing, setEditing] = useState(false);
  const [result, setResult] = useState<FibaResult | null>(null);
  const [demo, setDemo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [exitOpen, setExitOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qr, setQr] = useState({ png: "", svg: "" });
  const [qrError, setQrError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const inFlight = useRef(false);
  const pdfCache = useRef<Blob | null>(null);
  const item = FIBA_ITEMS[index];
  const count = Object.keys(answers).length;
  const url = `${window.location.origin}${FIBA_ROUTE}`;
  const active = ["question", "review"].includes(step) && count > 0;

  useEffect(() => {
    const title = document.title;
    document.title = "FIB-A · Turma do Bem | Um olhar para você";
    return () => { document.title = title; };
  }, []);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
    setError(""); setMessage("");
  }, [step, index]);
  useEffect(() => {
    if (!active) return;
    const protect = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [active]);
  useEffect(() => {
    if (!qrOpen || qr.png) return;
    let cancelled = false;
    import("qrcode").then(async ({ default: QRCode }) => {
      const options = { margin: 4, errorCorrectionLevel: "M" as const, color: { dark: "#163E30", light: "#FFFFFF" } };
      const [png, svg] = await Promise.all([QRCode.toDataURL(url, { ...options, width: 1200 }), QRCode.toString(url, { ...options, type: "svg" })]);
      if (!cancelled) setQr({ png, svg });
    }).catch(() => { if (!cancelled) setQrError("Não foi possível gerar o QR Code. Você pode copiar o link abaixo."); });
    return () => { cancelled = true; };
  }, [qrOpen, qr.png, url]);

  function reset() {
    setAnswers({}); setConsent(false); setResult(null); setDemo(false); setIndex(0);
    setEditing(false); setStep("welcome"); setExitOpen(false); pdfCache.current = null;
  }
  function showDemo() {
    pdfCache.current = null;
    setResult({ ...scoreFiba(sampleAnswers), completedAt: new Date().toISOString() });
    setDemo(true); setStep("result");
  }
  async function submit() {
    if (inFlight.current || count !== 29) return;
    inFlight.current = true; setBusy(true); setError("");
    try {
      const scored = await submitFibaAnswers(answers);
      pdfCache.current = null; setDemo(false); setResult(scored); setAnswers({}); setStep("result");
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível concluir agora. Tente novamente."); }
    finally { inFlight.current = false; setBusy(false); }
  }
  function saveBlob(blob: Blob, filename: string) {
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = objectUrl; a.download = filename;
    document.body.append(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
  }
  async function pdf(share = false) {
    if (!result || pdfBusy) return;
    setPdfBusy(true); setError(""); setMessage("");
    try {
      const { buildFibaPdf } = await import("@/lib/fibaPdf");
      const blob = pdfCache.current ?? await buildFibaPdf(result, demo);
      pdfCache.current = blob;
      const name = `${demo ? "demonstracao" : "relatorio"}-fib-a-turma-do-bem.pdf`;
      const file = new File([blob], name, { type: "application/pdf" });
      if (share && navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: "Meu relatório FIB-A" }); }
        catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") return;
          saveBlob(blob, name); setMessage("O compartilhamento não está disponível agora. O PDF foi preparado para download.");
        }
      } else {
        saveBlob(blob, name);
        setMessage(share ? "Este navegador não compartilha arquivos. O PDF foi preparado para download." : "Seu PDF foi preparado. Confira os downloads do navegador.");
      }
    } catch { setError("Não foi possível preparar o PDF. Seu resultado continua disponível nesta página. Tente novamente."); }
    finally { setPdfBusy(false); }
  }
  function next() {
    if (answers[item.id] === undefined) { setError("Escolha uma das cinco respostas para continuar."); return; }
    if (editing || index === 28) { setEditing(false); setStep("review"); } else setIndex(index + 1);
  }
  const endButton = <button className="tdb-text-button" disabled={busy || pdfBusy} onClick={() => active ? setExitOpen(true) : reset()}>{step === "result" ? "Encerrar" : "Sair"}<X size={16} /></button>;

  return <div className="tdb-root">
    <a className="tdb-skip" href="#tdb-content">Ir para o conteúdo</a>
    <header className="tdb-header">
      <div className="tdb-wordmark"><span className="tdb-brand-dot" aria-hidden="true" />Turma do Bem<span className="tdb-wordmark-divider" /> <span className="tdb-product">FIB-A</span></div>
      {step === "welcome" ? <button className="tdb-text-button" onClick={() => setQrOpen(true)}><QrCode size={18} />Compartilhar acesso</button> : endButton}
    </header>

    <main id="tdb-content" className={`tdb-main tdb-${step}`}>
      {step === "welcome" && <>
        <section className="tdb-hero">
          <div className="tdb-hero-copy">
            <p className="tdb-eyebrow"><span /> BEM-ESTAR NA VIDA ESTUDANTIL</p>
            <h1 ref={heading} tabIndex={-1}>Cuidar do outro<br />começa com um<br /><em>olhar para si.</em></h1>
            <p className="tdb-lead">Entre os estudos e os planos para o futuro, existe você. Reserve um momento para refletir sobre sua vida e o que faz parte do seu bem-estar.</p>
            <button className="tdb-button" onClick={() => setStep("participation")}>Começar minha reflexão<ArrowRight size={19} /></button>
            <p className="tdb-small tdb-hero-note"><ShieldCheck size={16} /> Sem cadastro. Sem nome ou e-mail.</p>
            <button className="tdb-demo-link" onClick={showDemo}>Conhecer um resultado de demonstração <ArrowRight size={15} /></button>
          </div>
          <div className="tdb-hero-card">
            <div className="tdb-card-kicker"><span>UM MOMENTO SÓ SEU</span><Heart size={19} /></div>
            <CareIllustration />
            <div className="tdb-art-caption"><span className="tdb-label">VIDA ESTUDANTIL · NOVAS PERSPECTIVAS</span><h2>Você também<br />merece cuidado.</h2><p>Uma pausa para perceber<br />como você está.</p></div>
            <span className="tdb-art-stamp" aria-hidden="true">29<br /><small>PERGUNTAS</small></span>
          </div>
        </section>
        <section className="tdb-how" aria-labelledby="tdb-how-title">
          <div className="tdb-how-intro"><p className="tdb-eyebrow">SIMPLES, DO COMEÇO AO FIM</p><h2 id="tdb-how-title">Uma pausa.<br />Três passos.</h2></div>
          {[
            ["01", "Responda com calma", "29 perguntas sobre sua percepção da vida e dos estudos. Uma resposta por pergunta."],
            ["02", "Conheça seu resultado", "Uma leitura descritiva de três fatores e nove domínios do seu bem-estar."],
            ["03", "Leve sua reflexão", "Baixe seu relatório em PDF e consulte quando quiser, inclusive no celular."],
          ].map(([n, title, text]) => <article key={n}><span className="tdb-step-number">{n}</span><h3>{title}</h3><p>{text}</p></article>)}
        </section>
        <section className="tdb-method-strip"><BookOpen size={22} /><p><strong>Uma leitura para reflexão.</strong> FIB-A é um formulário para alunos inspirado na FIB-T. Os resultados descrevem suas respostas e não constituem diagnóstico clínico.</p></section>
      </>}

      {step === "participation" && <section className="tdb-flow tdb-participation-card">
        <p className="tdb-eyebrow">ANTES DE COMEÇAR</p><h1 ref={heading} tabIndex={-1}>Este espaço é seu.</h1>
        <p className="tdb-lead">Não existem respostas certas ou erradas. Escolha a alternativa que melhor representa sua realidade.</p>
        <div className="tdb-info-grid">
          <article><Heart size={22} /><h2>Sua escolha, sempre</h2><p>A participação é voluntária. Você pode sair a qualquer momento, sem relação com notas, benefícios ou tratamentos.</p></article>
          <article><ShieldCheck size={22} /><h2>Sem identificação no formulário</h2><p>Não pedimos nome, e-mail ou matrícula. As respostas são processadas para gerar seu resultado, sem gravação no banco desta pesquisa. A infraestrutura pode manter registros técnicos de acesso.</p></article>
          <article><BookOpen size={22} /><h2>Pense na sua instituição</h2><p>Quando uma pergunta mencionar “escola”, considere a instituição de ensino em que você estuda. Essas perguntas não avaliam o evento ou a Turma do Bem.</p></article>
          <article><Leaf size={22} /><h2>Uma leitura descritiva</h2><p>São 29 perguntas, com respostas de 0 a 4. Seu resultado global vai de 0 a 100 e serve à reflexão, sem diagnóstico ou classificação clínica.</p></article>
        </div>
        <div className="tdb-session-note">Suas respostas ficam temporariamente na memória desta página. Ao atualizar ou fechar, você pode perder o progresso. Depois de concluir, baixe o PDF para guardar seu resultado.</div>
        <label className="tdb-consent"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /><span>Li as informações e quero participar voluntariamente.</span></label>
        <div className="tdb-actions"><button className="tdb-text-button" onClick={() => setStep("welcome")}><ChevronLeft size={17} />Voltar</button><button className="tdb-button" disabled={!consent} onClick={() => { setIndex(0); setStep("question"); }}>Ir para as perguntas<ArrowRight size={18} /></button></div>
      </section>}

      {step === "question" && <section className="tdb-flow tdb-question-card">
        <div className="tdb-progress-meta"><span>Pergunta {index + 1} de 29</span><span>{count} respondida{count === 1 ? "" : "s"}</span></div>
        <div className="tdb-progress" role="progressbar" aria-valuemin={0} aria-valuemax={29} aria-valuenow={count} aria-label="Perguntas respondidas"><span style={{ width: `${count / 29 * 100}%` }} /></div>
        <p className="tdb-eyebrow">FATOR {item.factor} · {FIBA_DOMAINS[item.domain]}</p>
        <h1 ref={heading} tabIndex={-1} className="tdb-question-title">{item.text}</h1>
        <fieldset className="tdb-options"><legend>Quanto você concorda com esta afirmação?</legend>
          {FIBA_LIKERT.map((label, value) => <label key={`${item.id}-${value}`} className={`tdb-option ${answers[item.id] === value ? "tdb-selected" : ""}`}><input type="radio" name={`item-${item.id}`} value={value} checked={answers[item.id] === value} onChange={() => { setAnswers(prev => ({ ...prev, [item.id]: value })); setError(""); }} /><span className="tdb-option-value" aria-hidden="true">{value}</span><span>{label}</span><span className="tdb-option-check" aria-hidden="true">{answers[item.id] === value && <Check size={16} />}</span></label>)}
        </fieldset>
        {error && <p className="tdb-error" role="alert">{error}</p>}
        <div className="tdb-actions"><button className="tdb-text-button" onClick={() => editing ? (setEditing(false), setStep("review")) : index ? setIndex(index - 1) : setStep("participation")}><ChevronLeft size={17} />{editing ? "Voltar à revisão" : "Voltar"}</button><button className="tdb-button" onClick={next}>{editing ? "Salvar resposta" : index === 28 ? "Revisar respostas" : "Continuar"}<ArrowRight size={18} /></button></div>
      </section>}

      {step === "review" && <section className="tdb-flow tdb-review-card" aria-busy={busy}>
        <p className="tdb-eyebrow">QUASE LÁ · {count} DE 29 RESPONDIDAS</p><h1 ref={heading} tabIndex={-1}>Um último olhar.</h1><p className="tdb-lead">Confira suas respostas. Você pode ajustar qualquer uma antes de gerar seu resultado.</p>
        <div className="tdb-review-list">{FIBA_ITEMS.map((q, i) => <article key={q.id}><span className="tdb-review-n">{String(q.id).padStart(2, "0")}</span><div><p>{q.text}</p><strong>{answers[q.id] === undefined ? "Ainda não respondida" : `${answers[q.id]} · ${FIBA_LIKERT[answers[q.id]]}`}</strong></div><button disabled={busy} className="tdb-text-button" aria-label={`Editar resposta da pergunta ${q.id}`} onClick={() => { setIndex(i); setEditing(true); setStep("question"); }}>Editar</button></article>)}</div>
        {error && <p role="alert" className="tdb-error">{error}</p>}
        <div className="tdb-review-submit"><p className="tdb-small">Ao concluir, as 29 respostas serão processadas para gerar seu relatório individual.</p><button className="tdb-button" disabled={count !== 29 || busy} onClick={submit}>{busy ? <><LoaderCircle className="tdb-spin" size={19} />Preparando seu resultado…</> : <>Confirmar e ver meu resultado<ArrowRight size={18} /></>}</button></div>
      </section>}

      {step === "result" && result && <section className="tdb-result-content">
        {demo && <div className="tdb-demo-banner" role="status"><strong>Demonstração com dados sintéticos.</strong> Estes valores são ilustrativos e não representam um participante.</div>}
        <div className="tdb-result-heading"><div><p className="tdb-eyebrow">FIB-A · SUA LEITURA INDIVIDUAL</p><h1 ref={heading} tabIndex={-1}>Um olhar para<br /><em>o seu momento.</em></h1><p>Uma fotografia das suas respostas, para refletir com calma.</p></div><div className="tdb-download-actions"><button className="tdb-button" disabled={pdfBusy} onClick={() => pdf()}>{pdfBusy ? <LoaderCircle size={18} className="tdb-spin" /> : <ArrowDownToLine size={18} />}Baixar meu PDF</button><button className="tdb-button tdb-button-secondary" disabled={pdfBusy} onClick={() => pdf(true)}><Share2 size={17} />Compartilhar PDF</button></div></div>
        <div aria-live="polite">{message && <p className="tdb-success">{message}</p>}</div>{error && <p role="alert" className="tdb-error">{error}</p>}
        <div className="tdb-result-overview"><div className="tdb-score-panel"><p className="tdb-label">RESULTADO GLOBAL</p><div className="tdb-score-ring"><svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="76" /><circle cx="90" cy="90" r="76" strokeDasharray={`${result.globalScore / 100 * 477.52} 477.52`} /></svg><div><strong>{fmt(result.globalScore, 1)}</strong><span>de 100</span></div></div><p>Leitura descritiva das suas respostas.<br />Sem classificação clínica.</p></div><div className="tdb-factors"><p className="tdb-eyebrow">TRÊS PERSPECTIVAS DA SUA EXPERIÊNCIA</p>{Object.entries(result.factors).map(([key, cell]) => <article key={key}><div><span>0{key} · {cell.itemCount} perguntas</span><h2>{cell.label}</h2></div><strong>{fmt(cell.score)}<small> de 4</small></strong><div className="tdb-meter" aria-hidden="true"><span style={{ width: `${cell.score / 4 * 100}%` }} /></div></article>)}</div></div>
        <div className="tdb-section-heading"><div><p className="tdb-eyebrow">SEU RESULTADO EM DETALHES</p><h2>Nove domínios.<br />Um olhar mais amplo.</h2></div><p>Cada valor é a média das respostas daquele domínio, na escala de 0 a 4.</p></div>
        <div className="tdb-domain-grid">{Object.entries(result.domains).map(([key, cell], i) => <article key={key}><span className="tdb-domain-n">{String(i + 1).padStart(2, "0")}</span><h3>{cell.label}</h3><strong>{fmt(cell.score)}<small> de 4</small></strong><div className="tdb-meter" aria-hidden="true"><span style={{ width: `${cell.score / 4 * 100}%` }} /></div><p>{cell.itemCount} perguntas · média das respostas</p></article>)}</div>
        <div className="tdb-reflection"><Leaf size={28} /><div><p className="tdb-eyebrow">PARA LEVAR COM VOCÊ</p><h2>O que suas respostas<br />convidam você a perceber?</h2><p>O que já faz sentido na sua rotina? Sobre o que você gostaria de refletir com mais calma? Guarde seu relatório e volte a essas perguntas quando quiser.</p></div></div>
        <details className="tdb-method-details"><summary>Como este resultado foi calculado</summary><p>{FIBA_METHOD_NOTE}</p><p>Os três fatores usam a média de seus próprios itens (9, 15 e 5). Os nove domínios têm o mesmo peso no global; suas médias são arredondadas para duas casas antes da normalização. O global é arredondado para uma casa. A governança se refere à instituição de ensino, e não ao evento.</p><p>Fonte: formulário “FIB - Alunos - Formulario Inspirado no FIB-T - 2026”. Instrumento FIB-A {FIBA_VERSION}. {demo ? "Prévia local com dados sintéticos." : `Concluído em ${new Date(result.completedAt).toLocaleDateString("pt-BR")}. Cálculo realizado no servidor.`}</p></details>
        <div className="tdb-result-end"><p>Seu resultado fica disponível apenas nesta sessão.<br />Baixe o PDF antes de encerrar.</p>{demo ? <button className="tdb-button" onClick={() => { reset(); setStep("participation"); }}>Responder o questionário<ArrowRight size={18} /></button> : <button className="tdb-button tdb-button-secondary" disabled={pdfBusy} onClick={reset}>Encerrar e limpar minha sessão<Check size={18} /></button>}</div>
      </section>}
    </main>
    <footer className="tdb-footer"><span>Turma do Bem <span aria-hidden="true">/</span> FIB-A</span><p>Um espaço para perceber. Um convite para refletir.</p><span>29 perguntas · 9 domínios</span></footer>

    <Dialog.Root open={exitOpen} onOpenChange={setExitOpen}><Dialog.Portal><Dialog.Overlay className="tdb-dialog-overlay" /><Dialog.Content className="tdb-dialog"><Dialog.Title>Encerrar esta reflexão?</Dialog.Title><Dialog.Description>Suas respostas não foram salvas. Ao sair, o progresso desta sessão será apagado.</Dialog.Description><div className="tdb-dialog-actions"><Dialog.Close className="tdb-button tdb-button-secondary">Continuar respondendo</Dialog.Close><button className="tdb-button" onClick={reset}>Sair e limpar</button></div></Dialog.Content></Dialog.Portal></Dialog.Root>
    <Dialog.Root open={qrOpen} onOpenChange={setQrOpen}><Dialog.Portal><Dialog.Overlay className="tdb-dialog-overlay" /><Dialog.Content className="tdb-dialog tdb-qr-dialog"><Dialog.Close className="tdb-dialog-close" aria-label="Fechar"><X size={22} /></Dialog.Close><Dialog.Title>Um convite à reflexão.</Dialog.Title><Dialog.Description>Leia o QR Code com a câmera do celular ou compartilhe o link de acesso ao questionário.</Dialog.Description>{qr.png ? <img className="tdb-qr-image" src={qr.png} alt="QR Code de acesso ao formulário FIB-A da Turma do Bem" /> : <p role="status">{qrError || "Preparando QR Code…"}</p>}<a className="tdb-qr-url" href={url}>{url}</a><div className="tdb-dialog-actions"><button className="tdb-button" onClick={async () => { try { await navigator.clipboard.writeText(url); setMessage("Link copiado."); } catch { setMessage("Selecione e copie o endereço acima."); } }}><Copy size={16} />Copiar link</button>{qr.png && <button className="tdb-button tdb-button-secondary" onClick={() => saveBlob(new Blob([qr.svg], { type: "image/svg+xml" }), "acesso-fib-a-turma-do-bem.svg")}>Baixar QR SVG</button>}{qr.png && <a className="tdb-text-button" href={qr.png} download="acesso-fib-a-turma-do-bem.png">Baixar PNG</a>}</div><p className="tdb-small" role="status">{message || "O QR Code usa o endereço deste ambiente. Para divulgação, use a versão publicada."}</p></Dialog.Content></Dialog.Portal></Dialog.Root>
  </div>;
}
