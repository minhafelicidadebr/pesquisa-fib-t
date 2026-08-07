import { useMemo, useState } from "react";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { IsgLikertLegend, IsgLikertStack } from "@/components/isg/viz/IsgCharts";
import {
  buildQuestionRows,
  LIKERT_COLUMNS,
  type AggregateQuestion,
} from "@/lib/isgAggregate";


type SortKey = "number" | "mean";

/** Tabela agregada das 32 questões. Nenhuma linha individual é exibida. */
export function IsgQuestionsTable({ questions }: { questions: AggregateQuestion[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("number");
  const [asc, setAsc] = useState(true);
  const [open, setOpen] = useState<number | null>(null);

  const rows = useMemo(() => {
    const base = buildQuestionRows(questions);
    const q = query.trim().toLowerCase();
    const filtered = q
      ? base.filter(
          (r) =>
            r.text.toLowerCase().includes(q) ||
            r.factor.toLowerCase().includes(q) ||
            r.domain.toLowerCase().includes(q),
        )
      : base;
    return [...filtered].sort((a, b) => {
      const va = sort === "mean" ? (a.mean ?? -1) : a.number;
      const vb = sort === "mean" ? (b.mean ?? -1) : b.number;
      return asc ? va - vb : vb - va;
    });
  }, [questions, query, sort, asc]);

  const toggle = (key: SortKey) => {
    if (sort === key) setAsc((v) => !v);
    else {
      setSort(key);
      setAsc(key === "number");
    }
  };

  return (
    <section aria-labelledby="isg-questions-title" className="space-y-4">
      <div>
        <h2 id="isg-questions-title" className="font-heading text-lg font-semibold text-foreground">
          Resultados por Questão
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Esta tabela apresenta, de forma agregada, como o grupo respondeu às 32 questões
          da Pesquisa FIB-T. Uma questão isolada não deve ser interpretada como diagnóstico.
          A leitura deve considerar o conjunto dos fatores e domínios.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por questão, fator ou domínio"
          className="h-10 max-w-sm"
          aria-label="Buscar questões"
        />
        <button
          type="button"
          onClick={() => toggle("mean")}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
          Ordenar por média
        </button>
        <button
          type="button"
          onClick={() => toggle("number")}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
          Ordenar por número
        </button>
      </div>

      <IsgLikertLegend labels={LIKERT_COLUMNS} />

      {/* Desktop */}
      <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-muted">
            <tr className="text-left">
              <th scope="col" className="px-3 py-2.5 font-medium">Nº</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Questão</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Fator</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Domínio</th>
              <th scope="col" className="px-3 py-2.5 text-right font-medium">Média</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Distribuição</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border align-top transition-colors hover:bg-muted/40">
                <td className="px-3 py-3 text-muted-foreground tabular-nums">{r.number}</td>
                <td className="max-w-[22rem] px-3 py-3 text-foreground">{r.text}</td>
                <td className="px-3 py-3 text-muted-foreground">{r.factor}</td>
                <td className="px-3 py-3 text-muted-foreground">{r.domain}</td>
                <td className="px-3 py-3 text-right font-medium tabular-nums text-foreground">
                  {r.mean === null ? "—" : r.mean.toFixed(2)}
                </td>
                <td className="min-w-[15rem] px-3 py-3">
                  <IsgLikertStack
                    percentages={r.percentages}
                    counts={r.counts}
                    labels={LIKERT_COLUMNS}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* Mobile — expansão por questão */}
      <ul className="space-y-2 md:hidden">
        {rows.map((r) => (
          <li key={r.id} className="rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setOpen(open === r.id ? null : r.id)}
              aria-expanded={open === r.id}
              className="flex w-full items-start gap-3 px-3 py-3 text-left"
            >
              <span className="mt-0.5 text-xs text-muted-foreground">{r.number}</span>
              <span className="flex-1 text-sm text-foreground">{r.text}</span>
              <span className="text-sm font-medium text-foreground">
                {r.mean === null ? "—" : r.mean.toFixed(1)}
              </span>
              <ChevronDown
                aria-hidden="true"
                className={`mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                  open === r.id ? "rotate-180" : ""
                }`}
              />
            </button>
            {open === r.id && (
              <dl className="space-y-1.5 border-t border-border px-3 py-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Fator</dt>
                  <dd className="text-right text-foreground">{r.factor}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Domínio</dt>
                  <dd className="text-right text-foreground">{r.domain}</dd>
                </div>
                {LIKERT_COLUMNS.map((c, i) => (
                  <div key={c} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{c}</dt>
                    <dd className="text-right text-foreground">
                      {r.percentages[i]}% ({r.counts[i]})
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
