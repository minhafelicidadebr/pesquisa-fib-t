import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ISG_PILOT_ENABLED, trackIsg } from "@/config/isg";
import { submitIsgAnswers, type IsgResult } from "@/lib/isgResult";
import { hasSurveyAccessGrant } from "@/lib/surveyAccess";
import { IsgAccessGate } from "@/components/isg/IsgAccessGate";
import { IsgIntro } from "@/components/isg/IsgIntro";
import { IsgSurvey } from "@/components/isg/IsgSurvey";
import { IsgReview } from "@/components/isg/IsgReview";
import { IsgResultDashboard } from "@/components/isg/IsgResultDashboard";
import { IsgFooter } from "@/components/isg/IsgBrand";

type Stage = "ACCESS" | "INTRO" | "ANSWERING" | "REVIEW" | "SUBMITTING" | "RESULT" | "ERROR";

export default function ISG() {
  /** Se o portal já autorizou no servidor nesta sessão, não pedimos o código de novo. */
  const [stage, setStage] = useState<Stage>(() =>
    hasSurveyAccessGrant("/isg") ? "INTRO" : "ACCESS",
  );
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<IsgResult | null>(null);
  /** Guard de double-submit no cliente, independente de idempotência no servidor. */
  const submitLock = useRef(false);

  useEffect(() => {
    document.title = "Pesquisa FIB-T — ISG";
    if (ISG_PILOT_ENABLED) trackIsg("isg_pilot_opened");
  }, []);

  if (!ISG_PILOT_ENABLED) {
    return (
      <div className="isg-theme flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center font-body">
        <h1 className="font-heading text-xl font-semibold text-foreground">
          Experiência indisponível
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Esta experiência não está disponível neste momento.
        </p>
        <Link to="/" className="mt-6 text-sm underline underline-offset-4">
          Voltar ao início
        </Link>
      </div>
    );
  }

  const submit = async () => {
    if (submitLock.current) return;
    submitLock.current = true;
    setStage("SUBMITTING");
    try {
      const r = await submitIsgAnswers(answers);
      setResult(r);
      setStage("RESULT");
      trackIsg("isg_survey_completed");
    } catch {
      setStage("ERROR");
    } finally {
      submitLock.current = false;
    }
  };

  return (
    <div className="isg-theme min-h-dvh bg-background font-body text-foreground">
      {stage === "ACCESS" && <IsgAccessGate onAuthorized={() => setStage("INTRO")} />}

      {stage === "INTRO" && (
        <>
          <IsgIntro
            onStart={() => {
              trackIsg("isg_survey_started");
              setStage("ANSWERING");
            }}
          />
          <IsgFooter />
        </>
      )}

      {stage === "ANSWERING" && (
        <IsgSurvey
          answers={answers}
          onAnswer={(id, value) => setAnswers((p) => ({ ...p, [id]: value }))}
          onComplete={() => setStage("REVIEW")}
        />
      )}

      {(stage === "REVIEW" || stage === "SUBMITTING") && (
        <IsgReview
          answers={answers}
          submitting={stage === "SUBMITTING"}
          onBack={() => setStage("ANSWERING")}
          onSubmit={submit}
        />
      )}

      {stage === "RESULT" && result && (
        <>
          <IsgResultDashboard result={result} answers={answers} />
          <IsgFooter />
        </>
      )}

      {stage === "ERROR" && (
        <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 text-center">
          <h1 className="font-heading text-xl font-semibold text-foreground">
            Não foi possível concluir o envio
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Suas respostas foram preservadas nesta sessão. Tente enviar novamente.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" className="h-11" onClick={() => setStage("ANSWERING")}>
              Revisar respostas
            </Button>
            <Button className="h-11" onClick={() => setStage("REVIEW")}>
              Tentar novamente
            </Button>
          </div>
        </main>
      )}
    </div>
  );
}
