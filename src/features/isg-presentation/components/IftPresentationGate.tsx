import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
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
    setShowPassword(false);
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
          do IFT para acessar a apresentação dos resultados agregados da pesquisa
          da ISG.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <Label htmlFor="ift-presentation-password" className="text-sm">
            Credencial administrativa do IFT
          </Label>
          <div className="relative">
            <Input
              id="ift-presentation-password"
              type={showPassword ? "text" : "password"}
              autoComplete="off"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 pr-12"
              aria-invalid={!!error}
              aria-describedby={error ? "ift-presentation-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute inset-y-0 right-1 flex w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              aria-label={showPassword ? "Ocultar credencial" : "Mostrar credencial"}
              aria-pressed={showPassword}
              aria-controls="ift-presentation-password"
              title={showPassword ? "Ocultar credencial" : "Mostrar credencial"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
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
