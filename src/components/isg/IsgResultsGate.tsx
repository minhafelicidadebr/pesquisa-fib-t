import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IftLogo, IsgPilotBadge } from "@/components/isg/IsgBrand";
import { GENERIC_ERROR, loginResults } from "@/lib/isgAggregate";

/**
 * Gate administrativo. A senha é validada exclusivamente no servidor e nunca
 * fica no bundle, na URL, em localStorage ou em log.
 */
export function IsgResultsGate({ onAuthorized }: { onAuthorized: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || password.length === 0) return;
    setLoading(true);
    setError(null);
    const ok = await loginResults(password);
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
          Painel Executivo FIB-T — IFT
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Área administrativa restrita à equipe do Instituto Felicidade para Todos.
          Informe a credencial administrativa para visualizar a leitura agregada do
          pré-teste da ISG.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <Label htmlFor="isg-admin" className="text-sm">
            Credencial administrativa
          </Label>
          <Input
            id="isg-admin"
            type="password"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11"
            aria-invalid={!!error}
            aria-describedby={error ? "isg-admin-error" : undefined}
          />
          {error && (
            <p id="isg-admin-error" role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? "Validando…" : "Acessar painel"}
          </Button>
        </form>

        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          Este painel apresenta apenas resultados agregados. Não é possível abrir,
          consultar ou baixar respostas de participantes individualmente.
        </p>
      </div>
    </main>
  );
}
