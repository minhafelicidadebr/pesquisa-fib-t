import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildAnswerRows, buildAnswersCsv, downloadCsv } from "@/lib/isgCsv";

/**
 * Tabela das 32 questões — SOMENTE do próprio participante.
 * Não há consulta a respostas de terceiros nesta tela.
 */
export function IsgAnswersTable({ answers }: { answers: Record<number, number> }) {
  const rows = buildAnswerRows(answers);

  return (
    <section aria-labelledby="isg-answers-heading" className="mt-6">
      <h3 id="isg-answers-heading" className="font-heading text-lg font-semibold text-foreground">
        Suas respostas
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Esta tabela organiza suas respostas às 32 questões da Pesquisa FIB-T. Ela permite
        revisar de forma transparente as informações utilizadas para compor o seu resultado.
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Uma resposta isolada não representa diagnóstico. A interpretação considera o conjunto
        das respostas, e os resultados são apresentados para reflexão e desenvolvimento.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          variant="outline"
          className="h-10"
          onClick={() =>
            downloadCsv("resultado-fibt-isg-respostas.csv", buildAnswersCsv(rows))
          }
        >
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          Baixar tabela (CSV)
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <caption className="sr-only">
            Suas respostas às 32 questões da Pesquisa FIB-T, com fator e domínio de cada questão.
          </caption>
          <thead>
            <tr className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="px-3 py-2.5">Nº</th>
              <th scope="col" className="px-3 py-2.5">Questão</th>
              <th scope="col" className="px-3 py-2.5">Resposta</th>
              <th scope="col" className="px-3 py-2.5">Fator</th>
              <th scope="col" className="px-3 py-2.5">Domínio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.number} className="align-top">
                <th scope="row" className="px-3 py-3 text-left font-medium text-muted-foreground">
                  {r.number}
                </th>
                <td className="px-3 py-3 leading-snug text-foreground">{r.question}</td>
                <td className="px-3 py-3 text-muted-foreground">
                  {r.answerLabel}
                  <span className="ml-1 text-xs opacity-70">({r.answerValue})</span>
                </td>
                <td className="px-3 py-3 text-muted-foreground">{r.factor}</td>
                <td className="px-3 py-3 text-muted-foreground">{r.domain}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
