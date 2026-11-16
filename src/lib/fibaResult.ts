import { FibaValidationError, isReportableFiba, scoreFiba, type FibaResult } from "@/domain/fiba";

/**
 * Individual report calculated on this device, using the SAME shared FIB-A engine.
 * No network, database, session, external AI or deployment dependency.
 * Origin is client_local: never masquerades as a server result or a synthetic preview.
 */
export async function submitFibaAnswers(answers: Record<number, number>): Promise<FibaResult> {
  try {
    const entries = Object.entries(answers).map(([id, answer]) => ({ id: Number(id), answer }));
    const result: FibaResult = {
      ...scoreFiba(entries, "client_local"),
      completedAt: new Date().toISOString(),
    };
    if (!isReportableFiba(result)) throw new Error("invalid_local_result");
    return result;
  } catch (error) {
    if (error instanceof FibaValidationError) {
      throw new Error("Confira as 29 respostas antes de concluir. Cada pergunta precisa de uma resposta de 0 a 4. Suas escolhas continuam nesta página.");
    }
    throw new Error("Não foi possível calcular o resultado nesta página. Suas respostas continuam disponíveis. Tente novamente.");
  }
}
