import { useState, useEffect, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, LogOut, Save, Sparkles, Shield } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth, UserSegment } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const segmentLabels: Record<UserSegment, string> = {
  nao_informado: "Prefiro não informar",
  setor_publico: "Setor Público",
  setor_privado: "Setor Privado",
  sociedade_civil: "Sociedade Civil",
};

export default function Profile() {
  const { user, profile, roles, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [segment, setSegment] = useState<UserSegment>("nao_informado");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setOrganization(profile.organization ?? "");
      setJobTitle(profile.job_title ?? "");
      setSegment(profile.segment);
    }
  }, [profile]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName || null,
        organization: organization || null,
        job_title: jobTitle || null,
        segment,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar", { description: error.message });
      return;
    }
    await refreshProfile();
    toast.success("Perfil atualizado");
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Sessão encerrada");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-brand-gold/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-cyan/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-heading"
          >
            <ArrowLeft className="w-4 h-4" />
            Início
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="font-heading text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-xs font-heading text-brand-gold font-semibold uppercase tracking-widest">
              Seu perfil
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Olá, <span className="text-gradient-gold">{(profile?.full_name ?? user?.email ?? "").split(" ")[0]}</span>
          </h1>
          <p className="text-muted-foreground font-body">
            Mantenha seus dados atualizados para uma experiência personalizada no ecossistema FIB.
          </p>
        </motion.div>

        {/* Profile card */}
        <motion.form
          onSubmit={handleSave}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card rounded-2xl p-6 md:p-8 shadow-elevated space-y-6"
        >
          {/* Account info */}
          <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-border/40">
            <span className="text-xs font-heading uppercase tracking-wider text-muted-foreground">Conta:</span>
            <span className="text-sm font-body text-foreground">{user?.email}</span>
            {roles.map((r) => (
              <Badge
                key={r}
                variant="outline"
                className="font-heading text-[10px] uppercase tracking-wider border-brand-gold/30 text-brand-gold"
              >
                <Shield className="w-3 h-3 mr-1" />
                {r}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="full-name" className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
                Nome completo
              </Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-background/40 border-border/40 focus-visible:ring-brand-gold"
                placeholder="Seu nome"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization" className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
                Organização
              </Label>
              <Input
                id="organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="bg-background/40 border-border/40 focus-visible:ring-brand-gold"
                placeholder="Empresa, prefeitura, ONG..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-title" className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
                Cargo
              </Label>
              <Input
                id="job-title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="bg-background/40 border-border/40 focus-visible:ring-brand-gold"
                placeholder="Ex.: Diretor(a) de RH"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="segment" className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
                Segmento
              </Label>
              <Select value={segment} onValueChange={(v) => setSegment(v as UserSegment)}>
                <SelectTrigger id="segment" className="bg-background/40 border-border/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(segmentLabels) as UserSegment[]).map((k) => (
                    <SelectItem key={k} value={k}>{segmentLabels[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="gradient-gold text-primary-foreground font-heading font-bold h-11 px-6 hover:opacity-90 transition-opacity"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar alterações
              </>
            )}
          </Button>
        </motion.form>

        {/* Coming-soon strip — sets expectation of next sprints */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {[
            { label: "Diagnóstico FIB", desc: "Em breve nos próximos sprints" },
            { label: "Academy gamificada", desc: "Trilhas + IFT Coins" },
            { label: "Relatório ESG", desc: "Impacto pessoal + coletivo" },
          ].map((item) => (
            <div
              key={item.label}
              className="glass-card rounded-xl p-4 opacity-60 hover:opacity-100 transition-opacity"
            >
              <p className="font-heading font-bold text-sm text-foreground mb-1">{item.label}</p>
              <p className="text-[11px] text-muted-foreground font-body">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
