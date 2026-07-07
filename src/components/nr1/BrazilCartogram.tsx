import { useMemo } from "react";

interface UFStat {
  uf: string;
  n: number;
}

interface BrazilCartogramProps {
  states: UFStat[];
  selected?: string;
  onSelect: (uf: string) => void;
}

/**
 * Sprint 24 — Cartograma Brasil.
 * Grid 7×9 posicionando as 27 UFs em layout geográfico aproximado.
 * Intensidade da cor (gold→magenta) reflete a densidade de signatários.
 * Zero deps de mapas, zero SVG pesado — hexes CSS puros, mobile-first.
 */
const UF_POSITIONS: Record<string, { col: number; row: number; name: string }> = {
  RR: { col: 3, row: 1, name: "Roraima" },
  AP: { col: 5, row: 1, name: "Amapá" },
  AM: { col: 2, row: 2, name: "Amazonas" },
  PA: { col: 4, row: 2, name: "Pará" },
  MA: { col: 5, row: 2, name: "Maranhão" },
  CE: { col: 6, row: 2, name: "Ceará" },
  RN: { col: 7, row: 2, name: "Rio Grande do Norte" },
  AC: { col: 1, row: 3, name: "Acre" },
  TO: { col: 4, row: 3, name: "Tocantins" },
  PI: { col: 5, row: 3, name: "Piauí" },
  PB: { col: 6, row: 3, name: "Paraíba" },
  PE: { col: 7, row: 3, name: "Pernambuco" },
  RO: { col: 1, row: 4, name: "Rondônia" },
  MT: { col: 3, row: 4, name: "Mato Grosso" },
  DF: { col: 4, row: 4, name: "Distrito Federal" },
  BA: { col: 5, row: 4, name: "Bahia" },
  AL: { col: 6, row: 4, name: "Alagoas" },
  SE: { col: 7, row: 4, name: "Sergipe" },
  MS: { col: 2, row: 5, name: "Mato Grosso do Sul" },
  GO: { col: 3, row: 5, name: "Goiás" },
  MG: { col: 4, row: 5, name: "Minas Gerais" },
  ES: { col: 5, row: 5, name: "Espírito Santo" },
  SP: { col: 3, row: 6, name: "São Paulo" },
  RJ: { col: 4, row: 6, name: "Rio de Janeiro" },
  PR: { col: 2, row: 7, name: "Paraná" },
  SC: { col: 1, row: 8, name: "Santa Catarina" },
  RS: { col: 1, row: 9, name: "Rio Grande do Sul" },
};

export function BrazilCartogram({ states, selected, onSelect }: BrazilCartogramProps) {
  const { map, max, total } = useMemo(() => {
    const m: Record<string, number> = {};
    let mx = 0;
    let tot = 0;
    for (const s of states) {
      m[s.uf] = s.n;
      tot += s.n;
      if (s.n > mx) mx = s.n;
    }
    return { map: m, max: mx, total: tot };
  }, [states]);

  const ufs = Object.keys(UF_POSITIONS);

  return (
    <div className="rounded-3xl border border-brand-cyan/25 bg-gradient-to-br from-brand-cyan/[0.05] via-card/60 to-brand-gold/[0.05] backdrop-blur p-6 md:p-8">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <div>
          <div className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-cyan mb-1">
            Mapa Nacional
          </div>
          <h2 className="font-display text-xl md:text-2xl font-bold">
            Adesões por estado
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Clique em um estado para filtrar o diretório abaixo.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-mono text-lg font-bold text-brand-cyan leading-none">
              {Object.keys(map).length}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              UFs ativas
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-lg font-bold text-brand-gold leading-none">
              {total.toLocaleString("pt-BR")}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              assinaturas
            </div>
          </div>
        </div>
      </div>

      <div
        className="grid gap-1.5 mx-auto"
        style={{
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gridTemplateRows: "repeat(9, minmax(0, 1fr))",
          maxWidth: 520,
          aspectRatio: "7 / 9",
        }}
      >
        {ufs.map((uf) => {
          const pos = UF_POSITIONS[uf];
          const n = map[uf] ?? 0;
          const intensity = max ? n / max : 0;
          const isSelected = selected === uf;
          const active = n > 0;
          return (
            <button
              key={uf}
              onClick={() => active && onSelect(isSelected ? "" : uf)}
              disabled={!active}
              title={`${pos.name} · ${n} signatário${n === 1 ? "" : "s"}`}
              aria-label={`${pos.name}, ${n} signatários`}
              className={`relative rounded-lg border font-heading font-bold text-[11px] transition-all flex flex-col items-center justify-center ${
                isSelected
                  ? "border-brand-gold ring-2 ring-brand-gold/60 z-10 scale-110"
                  : active
                  ? "border-brand-gold/30 hover:border-brand-gold/70 hover:scale-105 cursor-pointer"
                  : "border-white/5 opacity-40 cursor-default"
              }`}
              style={{
                gridColumn: pos.col,
                gridRow: pos.row,
                background: active
                  ? `linear-gradient(135deg, hsl(var(--brand-gold) / ${0.15 +
                      intensity * 0.55}), hsl(var(--brand-magenta) / ${0.1 +
                      intensity * 0.45}))`
                  : "hsl(var(--card) / 0.4)",
                boxShadow: active
                  ? `0 0 ${8 + intensity * 20}px hsl(var(--brand-gold) / ${0.15 +
                      intensity * 0.4})`
                  : "none",
              }}
            >
              <span
                className={`text-[10px] leading-none ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {uf}
              </span>
              {active && (
                <span className="text-[9px] font-mono text-brand-gold leading-none mt-0.5">
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* legenda */}
      <div className="flex items-center justify-center gap-3 mt-6 text-[10px] uppercase tracking-widest font-heading font-bold text-muted-foreground">
        <span>Menos</span>
        <div
          className="h-2 w-40 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, hsl(var(--brand-gold) / 0.15), hsl(var(--brand-gold) / 0.7), hsl(var(--brand-magenta) / 0.55))",
          }}
        />
        <span>Mais</span>
      </div>
    </div>
  );
}
