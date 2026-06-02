import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HardHat, Shield, Users, Building2, KeyRound, ArrowRight, ArrowLeft,
  Sparkles, Loader2, Check, Copy, Compass, Target,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  createCompany, joinCompanyByCode, getMyCompany, type CopsoqVersion,
} from "@/lib/companies";

type Persona = "sst" | "gestor" | "colaborador";

const PERSONAS: Array<{ id: Persona; title: string; sub: string; icon: typeof Shield; tone: string; }> = [
  { id: "sst", title: "SST · Saúde Ocupacional", sub: "Vou cadastrar a empresa e liderar o PGR", icon: HardHat, tone: "gold" },
  { id: "gestor", title: "Gestor · Liderança", sub: "Vou acompanhar minha equipe pelo código", icon: Shield, tone: "cyan" },
  { id: "colaborador", title: "Colaborador", sub: "Quero participar das pesquisas e trilhas", icon: Users, tone: "magenta" },
];

const COPSOQ: Array<{ v: CopsoqVersion; label: string }> = [
  { v: "curto", label: "Curto · 25 itens (triagem)" },
  { v: "medio", label: "Médio · 41 itens (recomendado MTE)" },
  { v: "longo", label: "Longo · 87 itens" },
  { v: "brasil", label: "COPSOQ III Brasil · FIOCRUZ" },
];

const MISSIONS: Record<Persona, { title: string; cta: string; to: string; desc: string }> = {
  sst: {
    title: "Configurar a empresa",
    desc: "Defina setores, COPSOQ e compartilhe o código com sua equipe.",
    cta: "Abrir painel da empresa",
    to: "/empresa/configurar",
  },
  gestor: {
    title: "Conhecer o dashboard NR-1",
    desc: "Veja o risco psicossocial agregado e os próximos passos.",
    cta: "Ir para o dashboard",
    to: "/dashboard",
  },
  colaborador: {
    title: "Responder seu primeiro FIB-T",
    desc: "Diagnóstico anônimo de bem-estar em ~5 minutos.",
    cta: "Começar diagnóstico",
    to: "/diagnostico",
  },
};

const toneMap: Record<string, { wrap: string; text: string; border: string }> = {
  gold:    { wrap: "bg-brand-gold/15",    text: "text-brand-gold",    border: "border-brand-gold/40" },
  cyan:    { wrap: "bg-brand-cyan/15",    text: "text-brand-cyan",    border: "border-brand-cyan/40" },
  magenta: { wrap: "bg-brand-magenta/15", text: "text-brand-magenta", border: "border-brand-magenta/40" },
};

export default function Onboarding() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [mode, setMode] = useState<"create" | "join">("create");

  // Create company
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [employees, setEmployees] = useState("");
  const [copsoq, setCopsoq] = useState<CopsoqVersion>("curto");

  // Join company
  const [code, setCode] = useState("");
  const [sector, setSector] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // If user already has a company, skip onboarding.
  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth", { replace: true }); return; }
    getMyCompany().then((res) => {
      if (res?.company) navigate("/dashboard", { replace: true });
    });
  }, [user, loading, navigate]);

  // Pre-select mode by persona
  useEffect(() => {
    if (persona === "sst") setMode("create");
    if (persona === "gestor" || persona === "colaborador") setMode("join");
  }, [persona]);

  const total = 4;
  const progress = (step / total) * 100;

  const canNext = useMemo(() => {
    if (step === 1) return persona !== null;
    if (step === 2) {
      return mode === "create"
        ? companyName.trim().length >= 2
        : code.trim().length >= 4;
    }
    if (step === 3) return sector.trim().length >= 1;
    return true;
  }, [step, persona, mode, companyName, code, sector]);

  const handleFinish = async () => {
    if (!persona || !user) return;
    setSubmitting(true);
    try {
      // Update profile segment based on persona (SST defaults to private sector)
      await supabase.from("profiles").update({
        segment: persona === "sst" ? "setor_privado" : "nao_informado",
        organization: mode === "create" ? companyName : null,
      }).eq("user_id", user.id);

      if (mode === "create") {
        const company = await createCompany({
          legal_name: companyName,
          cnpj: cnpj || null,
          sector,
          sectors: sector ? [sector] : [],
          estimated_employees: employees ? Number(employees) : 0,
          copsoq_version: copsoq,
        });
        setInviteCode(company.invite_code);
      } else {
        await joinCompanyByCode(code.trim().toUpperCase(), sector || null, persona === "gestor" ? "gestor" : "colaborador");
      }

      await refreshProfile();
      setStep(4);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro inesperado";
      toast.error("Não foi possível concluir", {
        description: msg.includes("Invalid invite") ? "Código de empresa inválido." : msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyInvite = async () => {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    toast.success("Código copiado");
  };

  const goToMission = () => {
    if (!persona) return;
    navigate(MISSIONS[persona].to, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4 py-12">
      {/* aurora */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-brand-gold/12 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] bg-brand-cyan/12 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-1/3 w-[320px] h-[320px] bg-brand-magenta/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-xs font-heading font-semibold uppercase tracking-widest text-brand-gold">
              Boas-vindas, {profile?.full_name?.split(" ")[0] ?? "colega"}
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            {step < 4 ? "Vamos configurar sua jornada" : "Tudo pronto!"}
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            {step < 4 ? "4 passos rápidos para você começar a mensurar e evoluir." : "Sua primeira missão te espera."}
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 md:p-8 shadow-elevated">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-[11px] font-heading uppercase tracking-widest text-muted-foreground mb-2">
              <span>Passo {Math.min(step, total)} de {total}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-foreground/5" />
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1 — Persona */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-3">
                <p className="text-sm text-muted-foreground font-body mb-2">Como você vai usar a plataforma?</p>
                {PERSONAS.map((p) => {
                  const Icon = p.icon;
                  const t = toneMap[p.tone];
                  const active = persona === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPersona(p.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${
                        active ? `${t.border} ${t.wrap}` : "border-border/40 bg-background/40 hover:bg-foreground/5"
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl ${t.wrap} ${t.border} border flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${t.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-bold text-sm text-foreground">{p.title}</p>
                        <p className="text-xs text-muted-foreground font-body">{p.sub}</p>
                      </div>
                      {active && <Check className={`w-5 h-5 ${t.text}`} />}
                    </button>
                  );
                })}
              </motion.div>
            )}

            {/* STEP 2 — Empresa */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-5">
                {persona === "sst" ? (
                  <>
                    <p className="text-sm text-muted-foreground font-body">Cadastre sua organização. Em seguida você recebe um código para sua equipe.</p>
                    <div className="space-y-3">
                      <FieldLabel icon={Building2} label="Razão social" />
                      <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Empresa LTDA" className="bg-background/40" />
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <FieldLabel icon={Building2} label="CNPJ (opcional)" />
                          <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" className="bg-background/40" />
                        </div>
                        <div>
                          <FieldLabel icon={Users} label="Nº de colaboradores" />
                          <Input type="number" min={1} value={employees} onChange={(e) => setEmployees(e.target.value)} placeholder="50" className="bg-background/40" />
                        </div>
                      </div>
                      <div>
                        <FieldLabel icon={Compass} label="Versão do COPSOQ II" />
                        <Select value={copsoq} onValueChange={(v) => setCopsoq(v as CopsoqVersion)}>
                          <SelectTrigger className="bg-background/40"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {COPSOQ.map((o) => <SelectItem key={o.v} value={o.v}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground font-body">Digite o código que você recebeu da sua organização.</p>
                    <div>
                      <FieldLabel icon={KeyRound} label="Código de convite" />
                      <Input
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="ABCD1234"
                        className="bg-background/40 font-mono text-lg tracking-[0.3em] text-center uppercase"
                        maxLength={8}
                      />
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* STEP 3 — Setor */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                <p className="text-sm text-muted-foreground font-body">
                  Em qual setor/departamento você atua? {persona !== "sst" && "Isso garante anonimato com agregação k ≥ 7."}
                </p>
                <FieldLabel icon={Target} label="Setor principal" />
                <Input
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  placeholder="Ex.: Operações, RH, Tecnologia..."
                  className="bg-background/40"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {["Operações", "RH", "Tecnologia", "Comercial", "Financeiro", "Saúde"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSector(s)}
                      className="text-xs font-heading px-3 py-1.5 rounded-full border border-border/40 bg-background/40 hover:bg-foreground/5 transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 4 — 1ª missão */}
            {step === 4 && persona && (
              <motion.div key="s4" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5">
                <div className="w-16 h-16 mx-auto rounded-2xl gradient-gold flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary-foreground" />
                </div>
                {inviteCode && (
                  <div className="bg-gradient-to-br from-brand-gold/15 to-brand-cyan/10 border border-brand-gold/30 rounded-2xl p-5">
                    <p className="text-[11px] uppercase tracking-widest font-heading text-brand-gold/80 mb-2">
                      Seu código de convite
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <code className="font-mono text-2xl md:text-3xl font-bold tracking-[0.3em]">{inviteCode}</code>
                      <button onClick={copyInvite} className="p-2 rounded-lg bg-foreground/5 hover:bg-foreground/10" aria-label="Copiar">
                        {copied ? <Check className="w-4 h-4 text-brand-cyan" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest font-heading text-muted-foreground">Sua primeira missão</p>
                  <h3 className="font-display text-2xl font-bold text-foreground">{MISSIONS[persona].title}</h3>
                  <p className="text-sm text-muted-foreground font-body max-w-md mx-auto">{MISSIONS[persona].desc}</p>
                </div>
                <Button onClick={goToMission} className="gradient-gold text-primary-foreground font-heading font-bold h-11 px-6">
                  {MISSIONS[persona].cta} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav */}
          {step < 4 && (
            <div className="flex justify-between items-center mt-8 pt-5 border-t border-border/30">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="font-heading"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Voltar
              </Button>
              {step < 3 ? (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canNext}
                  className="gradient-gold text-primary-foreground font-heading font-bold"
                >
                  Continuar <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  disabled={!canNext || submitting}
                  className="gradient-gold text-primary-foreground font-heading font-bold"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Concluir <Check className="w-4 h-4 ml-1.5" /></>}
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function FieldLabel({ icon: Icon, label }: { icon: typeof Building2; label: string }) {
  return (
    <Label className="font-heading text-[11px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-1.5">
      <Icon className="w-3.5 h-3.5" /> {label}
    </Label>
  );
}
