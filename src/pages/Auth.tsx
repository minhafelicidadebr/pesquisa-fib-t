import { useState, useEffect, FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, User as UserIcon, Building2, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth, UserSegment } from "@/hooks/useAuth";
import hubData from "@/data/hub.json";

export default function Auth() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/perfil";

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [submitting, setSubmitting] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup fields
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupSegment, setSignupSegment] = useState<UserSegment>("nao_informado");

  // If already signed in, bounce to /perfil
  useEffect(() => {
    if (user) navigate(redirectTo, { replace: true });
  }, [user, navigate, redirectTo]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setSubmitting(false);
    if (error) {
      toast.error("Não foi possível entrar", {
        description:
          error.message === "Invalid login credentials"
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
    if (signupPassword.length < 6) {
      toast.error("Senha muito curta", { description: "Use pelo menos 6 caracteres." });
      return;
    }
    setSubmitting(true);
    const { error } = await signUp(signupEmail, signupPassword, {
      full_name: signupName,
      segment: signupSegment,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Não foi possível criar a conta", {
        description:
          error.message.includes("already registered") || error.message.includes("already")
            ? "Este e-mail já está cadastrado. Tente entrar."
            : error.message,
      });
      return;
    }
    toast.success("Conta criada!", { description: "Você já pode acessar a plataforma." });
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Ambient halos */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-brand-gold/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-brand-cyan/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-brand-magenta/8 rounded-full blur-[100px]" />
      </div>

      {/* Back link */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-heading"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao site
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Brand header */}
        <div className="text-center mb-8">
          <img
            src={hubData.brand.logos.icon}
            alt="FIB"
            className="w-16 h-16 mx-auto mb-4 animate-float"
          />
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-xs font-heading text-brand-gold font-semibold uppercase tracking-widest">
              Ecossistema FIB
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            {tab === "login" ? "Bem-vindo(a) de volta" : "Crie sua conta"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-body">
            Mensurar · Educar · Transformar · Evoluir
          </p>
        </div>

        {/* Glass card */}
        <div className="glass-card rounded-2xl p-6 md:p-8 shadow-elevated">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/30">
              <TabsTrigger value="login" className="font-heading">Entrar</TabsTrigger>
              <TabsTrigger value="signup" className="font-heading">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-0">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
                    E-mail
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10 bg-background/40 border-border/40 focus-visible:ring-brand-gold"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10 bg-background/40 border-border/40 focus-visible:ring-brand-gold"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full gradient-gold text-primary-foreground font-heading font-bold h-11 hover:opacity-90 transition-opacity"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-0">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
                    Nome completo
                  </Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      autoComplete="name"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="pl-10 bg-background/40 border-border/40 focus-visible:ring-brand-gold"
                      placeholder="Seu nome"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
                    E-mail
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="pl-10 bg-background/40 border-border/40 focus-visible:ring-brand-gold"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-segment" className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
                    Segmento
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                    <Select value={signupSegment} onValueChange={(v) => setSignupSegment(v as UserSegment)}>
                      <SelectTrigger id="signup-segment" className="pl-10 bg-background/40 border-border/40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nao_informado">Prefiro não informar</SelectItem>
                        <SelectItem value="setor_publico">Setor Público</SelectItem>
                        <SelectItem value="setor_privado">Setor Privado</SelectItem>
                        <SelectItem value="sociedade_civil">Sociedade Civil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="pl-10 bg-background/40 border-border/40 focus-visible:ring-brand-gold"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full gradient-gold text-primary-foreground font-heading font-bold h-11 hover:opacity-90 transition-opacity"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar conta gratuita"}
                </Button>

                <p className="text-[11px] text-muted-foreground text-center font-body leading-relaxed">
                  Ao criar uma conta você concorda com nossa política de privacidade.
                  Seus dados são protegidos pela LGPD.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}
