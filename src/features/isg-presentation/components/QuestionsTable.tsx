import { useState } from "react";
import type { PresentationSnapshot } from "../data/presentation-schema";
import { formatNumber } from "../data/presentation-schema";

export function QuestionsTable({
  snapshot,
  ids,
}: {
  snapshot: PresentationSnapshot;
  ids?: number[];
}) {
  const [search, setSearch] = useState("");
  const rows = snapshot.questions.filter(
    (q) =>
      (!ids || ids.includes(q.id)) &&
      (`Q${q.id} ${q.text}`
        .toLocaleLowerCase("pt-BR")
        .includes(search.toLocaleLowerCase("pt-BR")) ||
        String(q.id) === search.trim()),
  );
  return (
    <section>
      <label className="p-field p-no-print">
        Buscar por enunciado ou ID
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ex.: Q24 ou tempo"
        />
      </label>
      <p className="p-small">
        Enunciados integrais da fonte · escala de 0 a 4. Contagens ausentes não
        são inferidas do total global.
      </p>
      <div
        className="p-table-wrap"
        tabIndex={0}
        role="region"
        aria-label="Tabela de questões; use as setas para rolar quando necessário"
      >
        <table>
          <caption>
            {ids ? "Itens selecionados" : "Questões da fonte selecionada"} ·{" "}
            {rows.length} itens exibidos
          </caption>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Enunciado integral</th>
              <th scope="col">Média</th>
              <th scope="col">Respostas válidas</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((q) => (
              <tr key={q.id}>
                <th scope="row">Q{q.id}</th>
                <td>
                  {q.text}
                  {q.percentages && q.counts && q.responses !== null && (
                    <details className="p-distribution">
                      <summary>
                        Distribuição recebida · n = {q.responses}
                      </summary>
                      <ol start={0}>
                        {q.counts.map((n, i) => (
                          <li key={i}>
                            Resposta {i}: {n} ·{" "}
                            {formatNumber(q.percentages![i], 1)}%
                          </li>
                        ))}
                      </ol>
                    </details>
                  )}
                </td>
                <td>{formatNumber(q.mean)}</td>
                <td>{q.responses ?? "Não informado"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p role="status">Nenhum item corresponde à busca.</p>
      )}
    </section>
  );
}
