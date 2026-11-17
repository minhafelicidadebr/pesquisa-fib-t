import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { IsgFooter, IsgLogo, IsgPilotBadge } from "./IsgBrand";

interface Props {
  onAuthorized: () => void;
}

/**
 * Access Gate. O código autorizado NÃO existe no bundle: a validação acontece
 * na edge function `isg-access`, que só devolve `{ authorized }`.
 */
export function IsgAccessGate({ onAuthorized }: Props) {
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checking || !code.trim()) return;
    setChecking(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("isg-access", {
        body: { code },
      });
      if (fnError || !data?.authorized) {
        setError("Não foi possível validar o acesso.");
        return;
      }
      setCode("");
      onAuthorized();
    } catch {
      setError("Não foi possível validar o acesso.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
        <div className="mb-8 flex flex-col items-start gap-4">
          <IsgLogo className="h-10" />
          <IsgPilotBadge />
        </div>

        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Pesquisa FIB-T — ISG
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Experiência de avaliação de felicidade e bem-estar no trabalho.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="isg-code">Código de acesso</Label>
            <Input
              id="isg-code"
              type="password"
              autoComplete="off"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={128}
              aria-invalid={!!error}
              aria-describedby={error ? "isg-code-error" : "isg-code-hint"}
              className="h-11"
            />
            <p id="isg-code-hint" className="text-xs text-muted-foreground">
              O código é fornecido pela ISG aos participantes da pesquisa.
            </p>
          </div>

          <div aria-live="polite" className="min-h-5">
            {error && (
              <p id="isg-code-error" className="flex items-center gap-2 text-sm text-destructive">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                {error}
              </p>
            )}
          </div>

          <Button type="submit" className="h-11 w-full" disabled={checking || !code.trim()}>
            {checking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Validando…
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </main>
      <IsgFooter />
    </div>
  );
}
