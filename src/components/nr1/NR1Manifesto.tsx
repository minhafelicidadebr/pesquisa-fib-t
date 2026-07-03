import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, MapPin, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const UF_LIST = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const HEADCOUNT_RANGES = [
  "1-49",
  "50-249",
  "250-999",
  "1.000-4.999",
  "5.000+",
];

interface Stats {
  total: number;
  companies: number;
  states: { uf: string; n: number }[];
  recent: { first_name: string; company_masked: string; state_uf: string | null; created_at: string }[];
}

async function hashUA(): Promise<string> {
  try {
    const enc = new TextEncoder().encode(navigator.userAgent + "|" + (navigator.language || ""));
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf)).slice(0, 8).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return "na";
  }
}

export function NR1Manifesto() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    role: "",
    company_name: "",
    email: "",
    state_uf: "",
    headcount_range: "",
  });

  async function loadStats() {
    const { data, error } = await supabase.rpc("nr1_manifest_stats" as never);
    if (!error && data) setStats(data as unknown as Stats);
  }

  useEffect(() => {
    loadStats();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name || !form.company_name || !form.email) {
      toast.error("Preencha nome, empresa e e-mail.");
      return;
    }
    setLoading(true);
    const ua = await hashUA();
    const { data, error } = await supabase.rpc("sign_nr1_manifest" as never, {
      p_full_name: form.full_name,
      p_role: form.role || "SST",
      p_company_name: form.company_name,
      p_email: form.email,
      p_state_uf: form.state_uf || null,
      p_headcount_range: form.headcount_range || null,
      p_ua_hash: ua,
    } as never);
    setLoading(false);
    const res = data as { ok?: boolean; duplicate?: boolean; error?: string } | null;
    if (error || !res?.ok) {
      toast.error("Não conseguimos registrar sua assinatura. Tente novamente.");
      return;
    }
    if (res.duplicate) {
      toast.success("Sua empresa já está no Manifesto NR-1. Obrigado!");
    } else {
      toast.success("Assinatura registrada. Bem-vindo(a) ao Movimento NR-1 Brasil.");
    }
    setDone(true);
    loadStats();
  }

  const topStates = stats?.states.slice(0, 6) ?? [];

  return (
    <section id="manifesto" className="px-4 sm:px-6 max-w-6xl mx-auto mt-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-widest text-brand-magenta mb-3">
          <ShieldCheck className="w-4 h-4" /> Movimento Nacional
        </div>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
          Manifesto <span className="text-gradient-magenta">NR-1 Brasil</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Assine publicamente o compromisso da sua empresa com a saúde mental no trabalho. Sua empresa entra na lista pública do movimento — sem expor dados sensíveis.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6">
        {/* Formulário */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-brand-magenta/25 bg-card/60 backdrop-blur p-6 md:p-8"
        >
          {done ? (
            <div className="min-h-[420px] flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-magenta flex items-center justify-center mb-6 glow-magenta">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-2">Assinatura registrada</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Sua empresa agora faz parte do Movimento NR-1 Brasil. Enviamos os próximos passos por e-mail e você pode ativar o ciclo COPSOQ II a qualquer momento.
              </p>
              <a
                href="/auth"
                className="inline-flex items-center gap-2 bg-brand-gold text-brand-charcoal font-heading font-bold px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform"
              >
                Criar conta e começar o diagnóstico
              </a>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Seu nome completo *">
                  <input
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className={inputCls}
                    placeholder="Ex.: Ana Souza"
                  />
                </Field>
                <Field label="Cargo">
                  <input
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className={inputCls}
                    placeholder="Ex.: Coord. SST, RH, CEO"
                  />
                </Field>
              </div>
              <Field label="Empresa *">
                <input
                  required
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  className={inputCls}
                  placeholder="Razão social"
                />
              </Field>
              <Field label="E-mail corporativo *">
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputCls}
                  placeholder="voce@empresa.com.br"
                />
              </Field>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Estado (UF)">
                  <select
                    value={form.state_uf}
                    onChange={(e) => setForm({ ...form, state_uf: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">Selecione</option>
                    {UF_LIST.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Nº de colaboradores">
                  <select
                    value={form.headcount_range}
                    onChange={(e) => setForm({ ...form, headcount_range: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">Selecione</option>
                    {HEADCOUNT_RANGES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="rounded-xl border border-brand-gold/20 bg-brand-gold/5 p-4 text-sm text-muted-foreground leading-relaxed">
                Ao assinar, você declara que sua empresa está comprometida em <strong className="text-foreground">identificar, avaliar e mitigar riscos psicossociais</strong> conforme a NR-1. Seus dados de contato ficam privados; apenas nome e empresa (mascarados) aparecem no mural público.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-brand-magenta text-white font-heading font-bold px-6 py-4 rounded-xl glow-magenta hover:scale-[1.01] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                Assinar o Manifesto NR-1
              </button>
            </form>
          )}
        </motion.div>

        {/* Contador + Mural */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="rounded-3xl border border-brand-gold/30 bg-gradient-to-br from-brand-charcoal via-card to-brand-charcoal p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-gold opacity-5" />
            <div className="relative">
              <div className="text-xs font-heading uppercase tracking-widest text-brand-gold mb-2">Assinaturas em tempo real</div>
              <div className="font-display text-6xl md:text-7xl font-bold text-gradient-gold leading-none">
                {stats?.total ?? "—"}
              </div>
              <div className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                {stats?.companies ?? 0} empresas comprometidas
              </div>
            </div>
          </div>

          {topStates.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-card/40 p-5">
              <div className="text-xs font-heading uppercase tracking-widest text-brand-cyan mb-3 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Estados que já aderiram
              </div>
              <div className="flex flex-wrap gap-2">
                {topStates.map((s) => (
                  <div key={s.uf} className="px-3 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/25 text-sm">
                    <span className="font-heading font-bold text-brand-cyan">{s.uf}</span>
                    <span className="text-muted-foreground ml-1.5">· {s.n}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats && stats.recent.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-card/40 p-5">
              <div className="text-xs font-heading uppercase tracking-widest text-brand-magenta mb-3">Mural do movimento</div>
              <ul className="space-y-2.5">
                {stats.recent.map((r, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-foreground font-medium">{r.first_name}</span>
                      <span className="text-muted-foreground"> · {r.company_masked}</span>
                    </div>
                    {r.state_uf && (
                      <span className="text-xs text-brand-cyan font-heading">{r.state_uf}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.aside>
      </div>
    </section>
  );
}

const inputCls =
  "w-full bg-background/60 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-brand-magenta/50 transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</span>
      {children}
    </label>
  );
}
