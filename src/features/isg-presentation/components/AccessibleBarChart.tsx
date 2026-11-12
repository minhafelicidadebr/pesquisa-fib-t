import { useId, useState } from "react";
import { formatNumber } from "../data/presentation-schema";

export interface ChartRow {
  key: string;
  label: string;
  mean: number | null;
}
export function AccessibleBarChart({
  rows,
  title,
  ordered = false,
}: {
  rows: ChartRow[];
  title: string;
  ordered?: boolean;
}) {
  const [table, setTable] = useState(false);
  const id = useId();
  const shown = ordered
    ? [...rows].sort(
        (a, b) =>
          (b.mean ?? -1) - (a.mean ?? -1) ||
          a.label.localeCompare(b.label, "pt-BR"),
      )
    : rows;
  return (
    <section className="p-chart" aria-label={title}>
      <div className="p-chart-heading">
        <span>
          {ordered
            ? "Médias em ordem decrescente · empates preservados"
            : "Médias da fonte selecionada"}
        </span>
        <button
          type="button"
          className="p-text-button p-no-print"
          aria-controls={id}
          aria-expanded={table}
          onClick={() => setTable(!table)}
        >
          {table ? "Ver gráfico" : "Ver tabela"}
        </button>
      </div>
      <div
        className={table ? "p-chart-visual p-screen-hidden" : "p-chart-visual"}
        aria-hidden={table || undefined}
      >
        <div className="p-axis" aria-hidden="true">
          <span>0</span>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
        </div>
        <ul className="p-bars">
          {shown.map((r) => (
            <li key={r.key}>
              <div className="p-bar-label">{r.label}</div>
              <div className="p-bar-track" aria-hidden="true">
                <span
                  style={{
                    width: `${r.mean === null ? 0 : (r.mean / 4) * 100}%`,
                  }}
                />
              </div>
              <span className="p-bar-value">{formatNumber(r.mean)}</span>
            </li>
          ))}
        </ul>
        <p className="p-chart-caption">
          Escala de 0 a 4 · ausência não é zero.
        </p>
      </div>
      <div
        id={id}
        className={table ? "p-chart-table" : "p-chart-table p-screen-hidden"}
      >
        <table>
          <caption>{title} · média na escala de 0 a 4</caption>
          <thead>
            <tr>
              <th scope="col">Indicador</th>
              <th scope="col">Média</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.key}>
                <th scope="row">{r.label}</th>
                <td>{formatNumber(r.mean)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
