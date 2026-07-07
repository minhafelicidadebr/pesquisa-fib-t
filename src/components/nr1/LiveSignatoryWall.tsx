import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Signatory {
  id: string;
  company_name: string;
  first_name: string;
  role: string | null;
  state_uf: string | null;
  headcount_range: string | null;
  created_at: string;
}

interface DirectoryResp {
  total: number;
  items: Signatory[];
}

/**
 * Sprint 23 — Mural Vivo de Signatários.
 * Marquee premium com as últimas empresas signatárias do Manifesto NR-1.
 * Realtime via Supabase subscription. Zero backend novo (usa RPC existente).
 */
export function LiveSignatoryWall() {
  const [items, setItems] = useState<Signatory[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [pulse, setPulse] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.rpc("list_nr1_signatories" as never, {
      _search: null,
      _uf: null,
      _headcount: null,
      _limit: 24,
      _offset: 0,
    } as never);
    if (data) {
      const d = data as unknown as DirectoryResp;
      setItems(d.items || []);
      setTotal(d.total || 0);
    }
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("nr1-wall")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "nr1_manifest_signatures" },
        (payload) => {
          const row = payload.new as { id?: string };
          if (row?.id) setPulse(row.id);
          load();
          setTimeout(() => setPulse(null), 4000);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  // Duplicamos a lista para loop infinito suave
  const loop = useMemo(() => [...items, ...items], [items]);

  if (items.length === 0) return null;

  return (
    <section className="px-4 sm:px-6 max-w-6xl mx-auto mt-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-gold/10 via-card/60 to-brand-magenta/10 backdrop-blur border border-white/10 shadow-elevated">
        {/* header */}
        <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-green shadow-[0_0_12px_hsl(var(--brand-green))]" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-brand-green animate-ping opacity-60" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] font-heading font-bold text-brand-gold">
                Movimento ao vivo
              </div>
              <div className="font-display text-lg md:text-xl font-bold text-foreground">
                <span className="tabular-nums text-gradient-gold">{total}</span>{" "}
                <span className="text-muted-foreground text-sm font-heading font-semibold">
                  signatários do Manifesto NR-1
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/nr1-brasil/signatarios"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-heading font-bold text-brand-gold hover:text-brand-magenta transition-colors"
          >
            Ver diretório <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* marquee */}
        <div
          className="relative py-5"
          style={{
            maskImage:
              "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)",
          }}
        >
          <div
            className="flex gap-3 w-max animate-[wallScroll_60s_linear_infinite] hover:[animation-play-state:paused]"
          >
            {loop.map((s, idx) => (
              <Link
                key={`${s.id}-${idx}`}
                to={`/selo/${s.id}`}
                className={`group shrink-0 flex items-center gap-3 pl-3 pr-4 py-2.5 rounded-full border transition-all ${
                  pulse === s.id
                    ? "bg-brand-green/15 border-brand-green/60 shadow-[0_0_24px_hsl(var(--brand-green)/0.4)]"
                    : "bg-card/60 border-white/10 hover:border-brand-gold/40 hover:bg-brand-gold/5"
                }`}
                aria-label={`Selo NR-1 de ${s.company_name}`}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-gold/30 to-brand-magenta/30 border border-brand-gold/40 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
                </div>
                <span className="font-heading font-bold text-sm text-foreground whitespace-nowrap max-w-[220px] truncate">
                  {s.company_name}
                </span>
                {s.state_uf && (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-heading font-bold text-muted-foreground border-l border-white/10 pl-2">
                    <MapPin className="w-2.5 h-2.5" />
                    {s.state_uf}
                  </span>
                )}
                {pulse === s.id && (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-heading font-bold text-brand-green">
                    <Sparkles className="w-2.5 h-2.5" /> novo
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="sm:hidden px-6 pb-4">
          <Link
            to="/nr1-brasil/signatarios"
            className="inline-flex items-center gap-1.5 text-sm font-heading font-bold text-brand-gold"
          >
            Ver diretório completo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes wallScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
