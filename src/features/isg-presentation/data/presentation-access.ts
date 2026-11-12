import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  clearSession,
  IsgSessionExpired,
  readSession,
  type IsgAggregate,
} from "@/lib/isgAggregate";

export class PresentationUnavailable extends Error {}

async function request(action: "validate-session" | "aggregates") {
  const session = readSession();
  if (!session) throw new IsgSessionExpired();
  const { data, error } = await supabase.functions.invoke("isg-results", {
    body: { action, token: session.token },
  });
  if (
    (error instanceof FunctionsHttpError &&
      [401, 403].includes(error.context.status)) ||
    (!error && data?.ok === false && action === "aggregates")
  ) {
    clearSession();
    throw new IsgSessionExpired();
  }
  if (error || !data?.ok)
    throw new PresentationUnavailable(
      "Não foi possível confirmar o acesso. Verifique a conexão e a implantação de validate-session.",
    );
  // Recusa respostas iniciadas antes de logout, substituição ou expiração.
  if (readSession()?.token !== session.token) throw new IsgSessionExpired();
  return data;
}
export async function validatePresentationAccess() {
  const data = await request("validate-session");
  if (
    data.authorized !== true ||
    !Number.isFinite(data.expiresAt) ||
    data.expiresAt <= Date.now()
  )
    throw new IsgSessionExpired();
  return Math.min(data.expiresAt, readSession()!.expiresAt);
}
export async function fetchPresentationAggregate(): Promise<IsgAggregate> {
  return request("aggregates");
}
