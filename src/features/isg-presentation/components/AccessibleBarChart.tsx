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
  const [focus, setFocus] = useState<string | null>(null);
  const id = useId();
  const shown = ordered
    ? [...rows].sort(
        (a, b) =>
          (b.mean ?? -1) - (a.mean ?? -1) ||
          a.label.localeCompare(b.label, "pt-BR"),
      )
    : rows;
  const valid = rows.filter((r) => r.mean !== null);
  const avg = valid.length
    ? valid.reduce((a, r) => a + (r.mean ?? 0), 0) / valid.length
    : null;
  const focused = shown.find((r) => r.key === focus) ?? null;
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
        <ul className={`p-bars p-bars-kinetic ${focus ? "p-bars-spot" : ""}`}>
          {shown.map((r, i) => (
            <li
              key={r.key}
              className={focus === r.key ? "is-focus" : undefined}
              style={{ ["--i" as string]: i, ["--hue" as string]: i % 4 }}
              onClick={() => setFocus(focus === r.key ? null : r.key)}
            >
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
        {focused && (
          <p className="p-spot-card" role="status">
            <strong>{focused.label}</strong>
            <span>
              {formatNumber(focused.mean)} / 4
              {avg !== null && focused.mean !== null
                ? ` · ${focused.mean >= avg ? "acima" : "abaixo"} da média do conjunto (${formatNumber(avg)})`
                : ""}
            </span>
            <em>O que sustenta essa percepção? Quem vive isso de forma diferente?</em>
          </p>
        )}
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
