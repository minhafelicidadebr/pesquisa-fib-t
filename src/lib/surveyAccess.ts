/**
 * Concessão de acesso à pesquisa, resolvida SEMPRE no servidor.
 *
 * O cliente nunca conhece códigos: envia o candidato ao resolver e recebe
 * apenas `{ authorized, destination }`. Quando autorizado, guardamos um
 * marcador de sessão (sem o código) para que a rota de destino não peça o
 * código novamente na mesma sessão.
 */
import { supabase } from "@/integrations/supabase/client";

const GRANT_KEY = "fibt:survey-access-grant";
/** Validade curta do marcador de sessão. */
const GRANT_TTL_MS = 60 * 60 * 1000;

export interface SurveyAccessGrant {
  destination: string;
  grantedAt: number;
}

export async function resolveSurveyAccess(
  accessCode: string,
): Promise<{ authorized: boolean; destination?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("resolve-survey-access", {
      body: { access_code: accessCode },
    });
    if (error || !data?.authorized || typeof data?.destination !== "string") {
      return { authorized: false };
    }
    const destination: string = data.destination;
    // Aceita apenas caminhos internos — nunca redireciona para fora.
    if (!destination.startsWith("/") || destination.startsWith("//")) {
      return { authorized: false };
    }
    storeGrant(destination);
    return { authorized: true, destination };
  } catch {
    return { authorized: false };
  }
}

function storeGrant(destination: string) {
  try {
    const grant: SurveyAccessGrant = { destination, grantedAt: Date.now() };
    sessionStorage.setItem(GRANT_KEY, JSON.stringify(grant));
  } catch {
    /* sessão indisponível: a rota simplesmente pedirá o código */
  }
}

/** Retorna true se houve autorização server-side recente para este destino. */
export function hasSurveyAccessGrant(destination: string): boolean {
  try {
    const raw = sessionStorage.getItem(GRANT_KEY);
    if (!raw) return false;
    const grant = JSON.parse(raw) as SurveyAccessGrant;
    if (grant.destination !== destination) return false;
    return Date.now() - grant.grantedAt < GRANT_TTL_MS;
  } catch {
    return false;
  }
}

export function clearSurveyAccessGrant() {
  try {
    sessionStorage.removeItem(GRANT_KEY);
  } catch {
    /* noop */
  }
}
