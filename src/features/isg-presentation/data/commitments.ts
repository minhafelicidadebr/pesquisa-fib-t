import { ACTIONS, type ActionKey } from "../content/explanations";

export interface Commitment {
  key: ActionKey;
  action: string;
  role: string;
  deadline: string;
  resource: string;
  firstDelivery: string;
  evidence: string;
  nextReview: string;
}
export function newCommitment(key: ActionKey): Commitment {
  return {
    key,
    action: "",
    role: "",
    deadline: "",
    resource: "",
    firstDelivery: "",
    evidence: "",
    nextReview: "",
  };
}
export function commitmentMarkdown(items: Commitment[]) {
  const value = (s: string) => s.trim() || "A pactuar";
  return (
    "# Rascunho de pactuação\n\nPropostas sujeitas a revisão e aprovação institucional. Prazos relativos começam na pactuação.\n\n" +
    items
      .map(
        (c, i) =>
          `## ${i + 1}. ${ACTIONS.find((a) => a.key === c.key)!.label}\n\nAção: ${value(c.action)}\n\nResponsável por função: ${value(c.role)}\n\nPrazo: ${value(c.deadline)}\n\nRecurso necessário: ${value(c.resource)}\n\nPrimeira entrega: ${value(c.firstDelivery)}\n\nEvidência de acompanhamento: ${value(c.evidence)}\n\nPróxima devolutiva: ${value(c.nextReview)}\n`,
      )
      .join("\n")
  );
}
