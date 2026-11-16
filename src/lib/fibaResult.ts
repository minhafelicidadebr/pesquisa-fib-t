import { FIBA_ID, FIBA_VERSION, isCanonicalFiba, type FibaResult } from "@/domain/fiba";

/** Direct, anonymous request: never forwards an existing ISG/IFT/user session. */
export async function submitFibaAnswers(answers: Record<number, number>): Promise<FibaResult> {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!baseUrl || !key) throw new Error("O serviço de resultados ainda não está configurado. Suas respostas continuam nesta página.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`${baseUrl}/functions/v1/fiba-student-score`, {
      method: "POST", cache: "no-store", credentials: "omit", signal: controller.signal,
      headers: { "Content-Type": "application/json", apikey: key },
      body: JSON.stringify({ instrumentId: FIBA_ID, instrumentVersion: FIBA_VERSION,
        answers: Object.entries(answers).map(([id, answer]) => ({ id: Number(id), answer })) }),
    });
    if (!response.ok) throw new Error("service_unavailable");
    const result: unknown = await response.json();
    if (!isCanonicalFiba(result)) throw new Error("invalid_result");
    return result;
  } catch {
    throw new Error("Não foi possível gerar seu resultado agora. Suas respostas continuam nesta página. Aguarde um momento e tente novamente.");
  } finally { clearTimeout(timeout); }
}
