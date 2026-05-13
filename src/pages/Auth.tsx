import { useState, useEffect, FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Mail, Lock, User as UserIcon, Building2, ArrowLeft, Sparkles,
  Shield, Users, HardHat, KeyRound, ArrowRight, Copy, Check,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { createCompany, joinCompanyByCode, type CopsoqVersion } from "@/lib/companies";
import hubData from "@/data/hub.json";

type Persona = "sst" | "gestor" | "colaborador";

const personas: Array<{
  id: Persona;
  title: string;
  subtitle: string;
  icon: typeof Shield;
  iconWrap: string;
  iconColor: string;
  hover: string;
  description: string;
}> = [
  {
    id: "sst",
    title: "SST · Saúde Ocupacional",
    subtitle: "Crio a empresa e gerencio o PGR",
    icon: HardHat,
    iconWrap: "bg-brand-gold/15 border-brand-gold/30",
    iconColor: "text-brand-gold",
    hover: "hover:border-brand-gold/50 hover:bg-brand-gold/5",
    description: "Cadastro a organização, configuro a versão do COPSOQ II e compartilho o código de acesso.",
  },
  {
    id: "gestor",
    title: "Gestor · Liderança",
    subtitle: "Acesso aos dashboards de equipe",
    icon: Shield,
    iconWrap: "bg-brand-cyan/15 border-brand-cyan/30",
    iconColor: "text-brand-cyan",
    hover: "hover:border-brand-cyan/50 hover:bg-brand-cyan/5",
    description: "Recebo o código da empresa, respondo a pesquisa e acompanho indicadores agregados.",
  },
  {
    id: "colaborador",
    title: "Colaborador",
    subtitle: "Participo das pesquisas anônimas",
    icon: Users,
    iconWrap: "bg-brand-magenta/15 border-brand-magenta/30",
    iconColor: "text-brand-magenta",
    hover: "hover:border-brand-magenta/50 hover:bg-brand-magenta/5",
    description: "Uso o código da empresa para responder o COPSOQ II e acessar trilhas da Academy.",
  },
];

const COPSOQ_LABELS: Record<CopsoqVersion, string> = {
  curto: "Curto · 25 itens (Triagem)",
  medio: "Médio · 41 itens (Recomendado MTE)",
  longo: "Longo · 87 itens (Pesquisa profunda)",
  brasil: "COPSOQ III Brasil · validado FIOCRUZ",
};

export default function Auth() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const [tab, setTab] = useState<"login" | "signup">("signup");
  const [persona, setPersona] = useState<Persona | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdInviteCode, setCreatedInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Common signup
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // SST fields
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [estimatedEmployees, setEstimatedEmployees] = useState("");
  const [copsoqVersion, setCopsoqVersion] = useState<CopsoqVersion>("curto");
  const [sector, setSector] = useState("");

  // Gestor / Colaborador
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    if (user && !createdInviteCode) navigate(redirectTo, { replace: true });
  }, [user, navigate, redirectTo, createdInviteCode]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setSubmitting(false);
    if (error) {
      toast.error("Não foi possível entrar", {
        description: error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : error.message,
      });
      return;
    }
    toast.success("Bem-vindo(a) de volta!");
    navigate(redirectTo, { replace: true });
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!persona) return;
    if (password.length < 6) {
      toast.error("Senha muito curta", { description: "Use pelo menos 6 caracteres." });
      return;
    }
    setSubmitting(true);
    try {
      const { error: signUpErr } = await signUp(email, password, {
        full_name: name,
        segment: persona === "sst" ? "setor_privado" : "nao_informado",
      });
      if (signUpErr) throw signUpErr;

      // Wait briefly for session to attach
      await new Promise((r) => setTimeout(r, 400));

      if (persona === "sst") {
        const company = await createCompany({
          legal_name: companyName,
          cnpj: cnpj || null,
          sector: sector || null,
          estimated_employees: estimatedEmployees ? Number(estimatedEmployees) : 0,
          sectors: sector ? [sector] : [],
          copsoq_version: copsoqVersion,
        });
        setCreatedInviteCode(company.invite_code);
        toast.success("Empresa criada!", { description: "Compartilhe o código com sua equipe." });
        return;
      }

      await joinCompanyByCode(inviteCode.trim().toUpperCase(), sector || null, persona);
      toast.success("Vinculado à empresa!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro inesperado";
      toast.error("Não foi possível concluir o cadastro", {
        description: msg.includes("already") ? "Este e-mail já está cadastrado."
          : msg.includes("Invalid invite") ? "Código de empresa inválido."
          : msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = async () => {
    if (!createdInviteCode) return;
    await navigator.clipboard.writeText(createdInviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Código copiado");
  };

  // ===== Post-creation success state for SST =====
  if (createdInviteCode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-brand-gold/15 rounded-full blur-[140px]" />
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-brand-cyan/15 rounded-full blur-[140px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-lg glass-card-strong rounded-3xl p-8 md:p-10 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-gold flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">
            Empresa cadastrada
          </h1>
          <p className="text-sm text-muted-foreground font-body mb-8">
            Compartilhe este código com gestores e colaboradores. Cada pessoa usará no próprio cadastro para se vincular automaticamente à sua organização.
          </p>

          <div className="bg-gradient-to-br from-brand-gold/15 to-brand-cyan/10 border border-brand-gold/30 rounded-2xl p-6 mb-6">
            <p className="text-xs uppercase tracking-widest font-heading text-brand-gold/80 mb-3">
              Código de convite
            </p>
            <div className="flex items-center justify-center gap-3">
              <code className="font-mono text-3xl md:text-4xl font-bold text-foreground tracking-[0.3em]">
                {createdInviteCode}
              </code>
              <button
                onClick={copyCode}
                className="p-2.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors"
                aria-label="Copiar código"
              >
                {copied ? <Check className="w-5 h-5 text-brand-cyan" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate("/empresa/configurar")}
              variant="outline"
              className="flex-1 font-heading"
            >
              Configurar empresa
            </Button>
            <Button
              onClick={() => navigate("/dashboard")}
              className="flex-1 gradient-gold text-primary-foreground font-heading font-bold"
            >
              Ir ao dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-brand-gold/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-brand-cyan/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-brand-magenta/8 rounded-full blur-[100px]" />
      </div>

      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-heading"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao site
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <img src={hubData.brand.logos.icon} alt="FIB" className="w-16 h-16 mx-auto mb-4 animate-float" />
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-xs font-heading text-brand-gold font-semibold uppercase tracking-widest">
              Plataforma NR-1 · Ecossistema FIB
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            {tab === "login" ? "Bem-vindo(a) de volta" : persona ? "Crie sua conta" : "Como você vai usar a plataforma?"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-body">
            Mensurar · Educar · Transformar · Evoluir
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 md:p-8 shadow-elevated">
          <Tabs value={tab} onValueChange={(v) => { setTab(v as "login" | "signup"); setPersona(null); }}>
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/30">
              <TabsTrigger value="login" className="font-heading">Entrar</TabsTrigger>
              <TabsTrigger value="signup" className="font-heading">Criar conta</TabsTrigger>
            </TabsList>

            {/* LOGIN */}
            <TabsContent value="login" className="space-y-4 mt-0">
              <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto">
                <Field id="login-email" label="E-mail" icon={Mail}>
                  <Input id="login-email" type="email" autoComplete="email" required
                    value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-10 bg-background/40 border-border/40" placeholder="seu@email.com" />
                </Field>
                <Field id="login-password" label="Senha" icon={Lock}>
                  <Input id="login-password" type="password" autoComplete="current-password" required
                    value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-10 bg-background/40 border-border/40" placeholder="••••••••" />
                </Field>
                <Button type="submit" disabled={submitting}
                  className="w-full gradient-gold text-primary-foreground font-heading font-bold h-11">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            {/* SIGNUP */}
            <TabsContent value="signup" className="mt-0">
              <AnimatePresence mode="wait">
                {!persona ? (
                  <motion.div
                    key="picker"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="grid gap-3"
                  >
                    {personas.map((p) => {
                      const Icon = p.icon;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPersona(p.id)}
                          className={`group text-left p-5 rounded-xl border border-border/40 bg-background/40 hover:border-${p.accent}/50 hover:bg-${p.accent}/5 transition-all flex items-start gap-4`}
                        >
                          <div className={`w-12 h-12 rounded-xl bg-${p.accent}/15 border border-${p.accent}/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                            <Icon className={`w-6 h-6 text-${p.accent}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-heading font-bold text-foreground">{p.title}</p>
                            <p className="text-xs text-muted-foreground font-body mb-1">{p.subtitle}</p>
                            <p className="text-xs text-muted-foreground/80 font-body">{p.description}</p>
                          </div>
                          <ArrowRight className={`w-5 h-5 text-${p.accent} opacity-0 group-hover:opacity-100 transition-opacity self-center`} />
                        </button>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.form
                    key={persona}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    onSubmit={handleSignup}
                    className="space-y-4"
                  >
                    <button
                      type="button"
                      onClick={() => setPersona(null)}
                      className="text-xs font-heading text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Trocar perfil
                    </button>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Field id="su-name" label="Nome completo" icon={UserIcon}>
                        <Input id="su-name" required value={name} onChange={(e) => setName(e.target.value)}
                          className="pl-10 bg-background/40 border-border/40" placeholder="Seu nome" />
                      </Field>
                      <Field id="su-email" label="E-mail" icon={Mail}>
                        <Input id="su-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-background/40 border-border/40" placeholder="seu@email.com" />
                      </Field>
                    </div>

                    {persona === "sst" ? (
                      <>
                        <div className="grid md:grid-cols-2 gap-4">
                          <Field id="su-company" label="Razão social" icon={Building2}>
                            <Input id="su-company" required value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                              className="pl-10 bg-background/40 border-border/40" placeholder="Empresa LTDA" />
                          </Field>
                          <Field id="su-cnpj" label="CNPJ (opcional)" icon={Building2}>
                            <Input id="su-cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)}
                              className="pl-10 bg-background/40 border-border/40" placeholder="00.000.000/0000-00" />
                          </Field>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <Field id="su-sector" label="Setor principal" icon={Building2}>
                            <Input id="su-sector" value={sector} onChange={(e) => setSector(e.target.value)}
                              className="pl-10 bg-background/40 border-border/40" placeholder="Ex.: Indústria" />
                          </Field>
                          <Field id="su-emp" label="Nº estimado de colaboradores" icon={Users}>
                            <Input id="su-emp" type="number" min={1} value={estimatedEmployees}
                              onChange={(e) => setEstimatedEmployees(e.target.value)}
                              className="pl-10 bg-background/40 border-border/40" placeholder="50" />
                          </Field>
                        </div>
                        <Field id="su-copsoq" label="Versão COPSOQ II" icon={Sparkles}>
                          <div className="pl-10">
                            <Select value={copsoqVersion} onValueChange={(v) => setCopsoqVersion(v as CopsoqVersion)}>
                              <SelectTrigger className="bg-background/40 border-border/40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(Object.keys(COPSOQ_LABELS) as CopsoqVersion[]).map((v) => (
                                  <SelectItem key={v} value={v}>{COPSOQ_LABELS[v]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </Field>
                      </>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        <Field id="su-code" label="Código da empresa" icon={KeyRound}>
                          <Input id="su-code" required value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            maxLength={8} className="pl-10 bg-background/40 border-border/40 font-mono tracking-widest uppercase"
                            placeholder="ABCD1234" />
                        </Field>
                        <Field id="su-sector" label="Seu setor" icon={Building2}>
                          <Input id="su-sector" value={sector} onChange={(e) => setSector(e.target.value)}
                            className="pl-10 bg-background/40 border-border/40" placeholder="Ex.: Operações" />
                        </Field>
                      </div>
                    )}

                    <Field id="su-pass" label="Senha" icon={Lock}>
                      <Input id="su-pass" type="password" required minLength={6}
                        autoComplete="new-password" value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-background/40 border-border/40" placeholder="Mínimo 6 caracteres" />
                    </Field>

                    <Button type="submit" disabled={submitting}
                      className="w-full gradient-gold text-primary-foreground font-heading font-bold h-11">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" />
                        : persona === "sst" ? "Criar empresa e gerar código"
                        : "Vincular à empresa"}
                    </Button>

                    <p className="text-[11px] text-muted-foreground text-center font-body leading-relaxed">
                      Conformidade LGPD · respostas anônimas com k≥7 · base científica COPSOQ II / FIOCRUZ.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}

// ----- helpers -----
function Field({
  id, label, icon: Icon, children,
}: { id: string; label: string; icon: typeof Mail; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        {children}
      </div>
    </div>
  );
}
