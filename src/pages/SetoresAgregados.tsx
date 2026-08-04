import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { getMyCompany, type Company } from "@/lib/companies";
import { SectorAggregatesPanel } from "@/components/dashboard/SectorAggregatesPanel";
import { useAuth } from "@/hooks/useAuth";

const ACCESS_PASSWORD = "luzpazeamor";
const STORAGE_KEY = "ift_setores_unlocked";

export default function SetoresAgregados() {
  const { user, loading: authLoading } = useAuth();
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(STORAGE_KEY) === "1");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);

  const [company, setCompany] = useState<Company | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  useEffect(() => {
    if (!unlocked || !user) { setLoadingCompany(false); return; }
    (async () => {
      const res = await getMyCompany();
      setCompany(res?.company ?? null);
      setLoadingCompany(false);
    })();
  }, [unlocked, user]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim().toLowerCase() === ACCESS_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md glass-card-strong rounded-2xl p-10 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-cyan flex items-center justify-center glow-cyan">
            <Lock className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2 text-gradient-cyan">Resultados por setor</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Área restrita — insira a senha de acesso aos agregados da pesquisa.
          </p>
          <form onSubmit={submit} className="space-y-4">
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha de acesso"
                autoFocus
                className={`w-full bg-muted/50 border rounded-lg px-4 py-3 pr-12 text-foreground font-body text-sm outline-none transition-colors ${
                  error ? "border-destructive" : "border-border focus:border-primary"
                }`}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-destructive text-xs font-heading">Senha incorreta.</p>}
            <button
              type="submit"
              className="w-full gradient-cyan text-primary-foreground font-heading font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90"
            >
              Acessar <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-brand-cyan/5">
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-16 space-y-6">
        <header>
          <p className="text-xs uppercase tracking-[0.2em] text-brand-cyan mb-2">Pesquisa COPSOQ II</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Resultados agregados por setor
          </h1>
          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Conformidade LGPD: apenas setores com 7 ou mais respostas são exibidos.
          </p>
        </header>

        {authLoading || loadingCompany ? (
          <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-cyan" /></div>
        ) : !user ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="font-heading font-bold text-foreground">Entre na sua conta</p>
            <p className="text-sm text-muted-foreground mt-1">
              Os dados agregados são protegidos por vínculo com a empresa — a senha libera a página,
              o login garante que você só veja a sua organização.
            </p>
            <Link to="/auth" className="text-brand-cyan font-heading text-sm hover:underline mt-3 inline-block">
              Ir para login →
            </Link>
          </div>
        ) : !company ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="font-heading font-bold text-foreground">Nenhuma empresa vinculada</p>
            <Link to="/empresa/configurar" className="text-brand-cyan font-heading text-sm hover:underline mt-2 inline-block">
              Configurar empresa →
            </Link>
          </div>
        ) : (
          <>
            <p className="font-heading text-sm text-muted-foreground">
              Empresa: <span className="text-foreground font-bold">{company.legal_name}</span>
            </p>
            <SectorAggregatesPanel companyId={company.id} />
          </>
        )}
      </div>
    </div>
  );
}
