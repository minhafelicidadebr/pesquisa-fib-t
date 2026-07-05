import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const UF_LIST = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const HEADCOUNT_RANGES = ["1-49","50-249","250-999","1.000-4.999","5.000+"];

const HEADCOUNT_LABEL: Record<string, string> = {
  "1-49": "Até 49",
  "50-249": "50–249",
  "250-999": "250–999",
  "1.000-4.999": "1k–5k",
  "5.000+": "5k+",
};

interface Signatory {
  id: string;
  company_name: string;
  first_name: string;
  role: string | null;
  state_uf: string | null;
  headcount_range: string | null;
  created_at: string;
}

interface Directory {
  total: number;
  items: Signatory[];
  limit: number;
  offset: number;
}

const PAGE_SIZE = 24;

interface Stats {
  total: number;
  companies: number;
  states: { uf: string; n: number }[];
}

export default function NR1Signatarios() {
  const [dir, setDir] = useState<Directory | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uf, setUf] = useState<string>("");
  const [hc, setHc] = useState<string>("");
  const [page, setPage] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("nr1_manifest_stats" as never);
      if (data) setStats(data as unknown as Stats);
    })();
    document.title = "Diretório Nacional NR-1 · Empresas Signatárias | FIB Brasil";
  }, []);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const { data } = await supabase.rpc("list_nr1_signatories" as never, {
        _search: search || null,
        _uf: uf || null,
        _headcount: hc || null,
        _limit: PAGE_SIZE,
        _offset: page * PAGE_SIZE,
      } as never);
      if (!cancel) {
        setDir((data as unknown as Directory) ?? { total: 0, items: [], limit: PAGE_SIZE, offset: 0 });
        setLoading(false);
      }
    }, search ? 220 : 0);
    return () => {
      cancel = true;
      clearTimeout(t);
    };
  }, [search, uf, hc, page]);

  useEffect(() => {
    setPage(0);
  }, [search, uf, hc]);

  const totalPages = useMemo(() => (dir ? Math.max(1, Math.ceil(dir.total / PAGE_SIZE)) : 1), [dir]);
  const topStates = useMemo(() => {
    if (!stats?.states?.length) return [];
    const max = Math.max(...stats.states.map((s) => s.n));
    return stats.states.slice(0, 10).map((s) => ({ ...s, pct: max ? (s.n / max) * 100 : 0 }));
  }, [stats]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-24">
        <Link
          to="/nr1-brasil"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Movimento NR-1 Brasil
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-widest text-brand-gold mb-3">
            <ShieldCheck className="w-4 h-4" /> Diretório Nacional
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">
            Empresas signatárias do <span className="text-gradient-gold">Manifesto NR-1</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Organizações que assumiram publicamente o compromisso com a saúde mental no trabalho e a NR-1.
          </p>
        </motion.div>

        {/* Ranking Nacional por UF */}
        {topStates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-8 rounded-3xl border border-brand-gold/25 bg-gradient-to-br from-brand-gold/[0.06] via-card/60 to-brand-magenta/[0.05] backdrop-blur p-6 md:p-7"
          >
            <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
              <div>
                <div className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-gold mb-1">
                  Ranking Nacional
                </div>
                <h2 className="font-display text-xl md:text-2xl font-bold">
                  Top 10 estados que mais aderiram
                </h2>
              </div>
              <div className="text-right">
                <div className="font-mono text-2xl font-bold text-brand-gold leading-none">
                  {stats?.companies?.toLocaleString("pt-BR") ?? "—"}
                </div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider">
                  empresas signatárias
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
              {topStates.map((s, i) => {
                const isActive = uf === s.uf;
                return (
                  <button
                    key={s.uf}
                    onClick={() => setUf(isActive ? "" : s.uf)}
                    className={`group relative overflow-hidden rounded-xl border p-3 text-left transition-all ${
                      isActive
                        ? "border-brand-gold/60 bg-brand-gold/10"
                        : "border-white/10 bg-background/40 hover:border-brand-gold/40"
                    }`}
                    aria-label={`Filtrar por ${s.uf} · ${s.n} empresas`}
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-gold/25 to-brand-magenta/15 transition-all"
                      style={{ width: `${s.pct}%` }}
                    />
                    <div className="relative flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground">#{i + 1}</span>
                        <span className="font-heading font-bold text-base text-foreground">
                          {s.uf}
                        </span>
                      </div>
                      <span className="font-mono text-sm font-bold text-brand-gold">
                        {s.n}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            {uf && (
              <div className="mt-4 text-xs text-muted-foreground">
                Filtrando por <span className="text-brand-gold font-heading font-bold">{uf}</span> —{" "}
                <button onClick={() => setUf("")} className="underline hover:text-foreground">
                  limpar
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Filtros */}
        <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur p-4 md:p-5 mb-6 grid md:grid-cols-[1fr_auto_auto_auto] gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar empresa..."
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-background border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-gold/60"
            />
          </div>
          <select
            value={uf}
            onChange={(e) => setUf(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-background border border-white/10 text-foreground focus:outline-none focus:border-brand-gold/60"
          >
            <option value="">Todos estados</option>
            {UF_LIST.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          <select
            value={hc}
            onChange={(e) => setHc(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-background border border-white/10 text-foreground focus:outline-none focus:border-brand-gold/60"
          >
            <option value="">Todos portes</option>
            {HEADCOUNT_RANGES.map((h) => (
              <option key={h} value={h}>{HEADCOUNT_LABEL[h]}</option>
            ))}
          </select>
          {(search || uf || hc) && (
            <button
              onClick={() => { setSearch(""); setUf(""); setHc(""); }}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-heading font-bold transition-colors"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Stat */}
        <div className="flex items-center justify-between mb-6 text-sm">
          <div className="text-muted-foreground">
            {loading ? "Carregando..." : (
              <>
                <span className="font-heading font-bold text-brand-gold">{dir?.total.toLocaleString("pt-BR") ?? 0}</span>{" "}
                {dir?.total === 1 ? "empresa encontrada" : "empresas encontradas"}
              </>
            )}
          </div>
          {dir && totalPages > 1 && (
            <div className="text-muted-foreground text-xs">
              Página {page + 1} de {totalPages}
            </div>
          )}
        </div>

        {/* Grid */}
        {loading && !dir ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
          </div>
        ) : dir && dir.items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-card/40 p-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold mb-1">Nenhuma empresa encontrada</h3>
            <p className="text-muted-foreground text-sm">Ajuste os filtros ou seja a primeira do seu estado a assinar.</p>
            <Link
              to="/nr1-brasil#manifesto"
              className="inline-flex items-center gap-2 mt-5 bg-brand-gold text-brand-charcoal font-heading font-bold px-5 py-2.5 rounded-xl hover:scale-[1.02] transition-transform"
            >
              Assinar o Manifesto
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dir?.items.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.02, 0.3) }}
              >
                <Link
                  to={`/selo/${s.id}`}
                  className="group block rounded-2xl border border-white/10 hover:border-brand-gold/50 bg-card/60 hover:bg-card/80 backdrop-blur p-5 transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-gold/30 to-brand-magenta/20 flex items-center justify-center border border-brand-gold/30">
                      <ShieldCheck className="w-5 h-5 text-brand-gold" />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground group-hover:text-brand-gold transition-colors mb-1 line-clamp-2">
                    {s.company_name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    {s.first_name}{s.role ? ` · ${s.role}` : ""}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-3 border-t border-white/5">
                    {s.state_uf && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {s.state_uf}
                      </span>
                    )}
                    {s.headcount_range && (
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3 h-3" /> {HEADCOUNT_LABEL[s.headcount_range] ?? s.headcount_range}
                      </span>
                    )}
                    <span className="ml-auto inline-flex items-center gap-1 text-brand-gold/80 group-hover:text-brand-gold">
                      Selo <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {dir && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-heading font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="text-sm text-muted-foreground px-3">
              {page + 1} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-heading font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
            </button>
          </div>
        )}

        {/* CTA final */}
        <div className="mt-16 rounded-3xl border border-brand-magenta/25 bg-gradient-to-br from-brand-magenta/10 to-brand-gold/5 p-8 md:p-10 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Sua empresa ainda não está aqui?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Assine o Manifesto NR-1 gratuitamente e receba o selo público verificável em segundos.
          </p>
          <Link
            to="/nr1-brasil#manifesto"
            className="inline-flex items-center gap-2 bg-brand-gold text-brand-charcoal font-heading font-bold px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform"
          >
            Assinar agora <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
