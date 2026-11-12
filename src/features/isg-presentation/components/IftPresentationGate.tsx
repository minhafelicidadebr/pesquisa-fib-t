import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IftLogo, IsgPilotBadge } from "@/components/isg/IsgBrand";
import { GENERIC_ERROR, loginPresentation } from "@/lib/isgAggregate";

/** Credencial IFT para /isg/apresentacao, separada do painel de resultados. */
export function IftPresentationGate({
  onAuthorized,
}: {
  onAuthorized: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading || password.length === 0) return;
    setLoading(true);
    setError(null);
    const ok = await loginPresentation(password);
    setLoading(false);
    setPassword("");
    if (ok) onAuthorized();
    else setError(GENERIC_ERROR);
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4">
      <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
        <IftLogo className="h-8" />
        <div className="mt-5">
          <IsgPilotBadge label="Acesso restrito à equipe do IFT" />
        </div>
        <h1 className="mt-4 font-heading text-xl font-semibold text-foreground">
          Apresentação institucional FIB-T — IFT
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Área exclusiva do Instituto Felicidade para Todos. Informe a credencial
          do IFT para acessar a apresentação dos resultados agregados do pré-teste
          da ISG.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <Label htmlFor="ift-presentation-password" className="text-sm">
            Credencial administrativa do IFT
          </Label>
          <Input
            id="ift-presentation-password"
            type="password"
            autoComplete="off"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11"
            aria-invalid={!!error}
            aria-describedby={error ? "ift-presentation-error" : undefined}
          />
          {error && (
            <p
              id="ift-presentation-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? "Validando…" : "Acessar apresentação"}
          </Button>
        </form>

        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          Esta área apresenta apenas resultados agregados. Não é possível abrir,
          consultar ou baixar respostas de participantes individualmente.
        </p>
      </div>
    </main>
  );
}
