import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Database, RefreshCcw, Lock } from "lucide-react";
import {
  getSectorAggregates,
  refreshSectorAggregates,
  K_ANON_SECTOR,
  type SectorAggregateRow,
} from "@/lib/sectorAggregates";

const RISK_STYLE: Record<string, string> = {
  verde: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  amarelo: "bg-brand-gold/15 text-brand-gold border-brand-gold/30",
  vermelho: "bg-brand-magenta/15 text-brand-magenta border-brand-magenta/30",
};

export function SectorAggregatesPanel({ companyId }: { companyId: string }) {
  const [rows, setRows] = useState<SectorAggregateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setRows(await getSectorAggregates(companyId));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar agregados");
    }
  };

  useEffect(() => {
    (async () => { await load(); setLoading(false); })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const consolidate = async () => {
    setBusy(true);
    try {
      await refreshSectorAggregates(companyId);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao consolidar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass-card-strong rounded-2xl p-6">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h3 className="font-heading font-bold text-foreground flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-cyan" /> Resultados consolidados por setor
          </h3>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-emerald-300" />
            LGPD: apenas totais por setor com n ≥ {K_ANON_SECTOR}. Respostas individuais nunca são gravadas nesta tabela.
          </p>
        </div>
        <button
          onClick={consolidate}
          disabled={busy}
          className="text-xs font-heading font-bold uppercase tracking-wider inline-flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-2 hover:border-brand-cyan/50 transition-colors disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCcw className="w-3 h-3" />} Consolidar agora
        </button>
      </div>

      {error && <p className="text-xs text-brand-magenta mb-3">{error}</p>}

      {loading ? (
        <div className="py-10 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-brand-cyan" /></div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-border/40 p-6 text-center">
          <Lock className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="font-heading font-bold text-sm text-foreground">Nenhum setor liberado ainda</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            Clique em “Consolidar agora” após coletar respostas. Setores com menos de {K_ANON_SECTOR} respostas
            permanecem ocultos por anonimato — inclusive para administradores.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-muted-foreground font-heading">
                <th className="text-left py-2">Setor</th>
                <th className="text-right py-2">n</th>
                <th className="text-right py-2">Score</th>
                <th className="text-center py-2">Risco</th>
                <th className="text-right py-2">🟢 / 🟡 / 🔴</th>
                <th className="text-right py-2">Atualizado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.sector} className="border-t border-border/30">
                  <td className="py-2.5 font-heading font-bold text-foreground">{r.sector}</td>
                  <td className="py-2.5 text-right font-mono tabular-nums-data text-muted-foreground">{r.response_count}</td>
                  <td className="py-2.5 text-right font-mono tabular-nums-data text-foreground">
                    {r.global_score != null ? Number(r.global_score).toFixed(1) : "—"}
                  </td>
                  <td className="py-2.5 text-center">
                    <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-heading font-bold uppercase ${RISK_STYLE[r.global_risk ?? ""] ?? "border-border/40 text-muted-foreground"}`}>
                      {r.global_risk ?? "—"}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums-data text-muted-foreground">
                    {r.green_count} / {r.yellow_count} / {r.red_count}
                  </td>
                  <td className="py-2.5 text-right text-[11px] text-muted-foreground">
                    {r.computed_at ? new Date(r.computed_at).toLocaleString("pt-BR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
