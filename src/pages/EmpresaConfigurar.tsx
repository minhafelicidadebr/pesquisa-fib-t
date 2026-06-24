import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2, Copy, Check, Loader2, Save, Users, Sparkles, ArrowLeft, X, Plus, Share2,
} from "lucide-react";
import { toast } from "sonner";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { getMyCompany, updateCompany, type Company, type CopsoqVersion } from "@/lib/companies";

const COPSOQ_LABELS: Record<CopsoqVersion, string> = {
  curto: "Curto · 25 itens (Triagem rápida)",
  medio: "Médio · 41 itens (Recomendado MTE)",
  longo: "Longo · 87 itens (Pesquisa profunda)",
  brasil: "COPSOQ III Brasil · validado FIOCRUZ",
};

export default function EmpresaConfigurar() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [copied, setCopied] = useState(false);

  // editable fields
  const [legalName, setLegalName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [employees, setEmployees] = useState("");
  const [copsoq, setCopsoq] = useState<CopsoqVersion>("curto");
  const [sectors, setSectors] = useState<string[]>([]);
  const [sectorInput, setSectorInput] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    getMyCompany().then((res) => {
      if (!res || !res.company) {
        toast.info("Você ainda não tem uma empresa cadastrada.");
        navigate("/auth");
        return;
      }
      const c = res.company;
      setCompany(c);
      setLegalName(c.legal_name);
      setCnpj(c.cnpj ?? "");
      setEmployees(String(c.estimated_employees ?? 0));
      setCopsoq(c.copsoq_version);
      setSectors(c.sectors ?? []);
    }).finally(() => setLoading(false));
  }, [user, authLoading, navigate]);

  const addSector = () => {
    const v = sectorInput.trim();
    if (!v || sectors.includes(v)) return;
    setSectors([...sectors, v]);
    setSectorInput("");
  };

  const removeSector = (s: string) => setSectors(sectors.filter((x) => x !== s));

  const copyCode = async () => {
    if (!company) return;
    await navigator.clipboard.writeText(company.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Código copiado");
  };

  const shareLink = async () => {
    if (!company) return;
    const url = `${window.location.origin}/auth?code=${company.invite_code}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link de convite copiado");
  };

  const save = async () => {
    if (!company) return;
    setSaving(true);
    try {
      await updateCompany(company.id, {
        legal_name: legalName,
        cnpj: cnpj || null,
        estimated_employees: employees ? Number(employees) : 0,
        copsoq_version: copsoq,
        sectors,
      });
      toast.success("Configurações salvas");
    } catch (e) {
      toast.error("Erro ao salvar", { description: e instanceof Error ? e.message : "" });
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-brand-gold/8 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-brand-cyan/8 rounded-full blur-[140px]" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-12 pt-28">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-heading mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar ao dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-brand-gold" />
            <span className="text-xs font-heading font-semibold uppercase tracking-widest text-brand-gold">
              Painel da Empresa · SST
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">
            Configurar empresa
          </h1>
          <p className="text-muted-foreground font-body max-w-2xl">
            Defina identidade, setores e a versão do COPSOQ II. Gerencie o código de convite que dá acesso a gestores e colaboradores.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mt-10">
          {/* INVITE CODE PANEL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="glass-card-strong rounded-2xl p-6 border border-brand-gold/30 bg-gradient-to-br from-brand-gold/5 to-transparent">
              <p className="text-xs uppercase tracking-widest font-heading text-brand-gold/80 mb-2">
                Código de convite
              </p>
              <div className="bg-background/40 border border-border/40 rounded-xl p-5 mb-4">
                <code className="font-mono text-2xl md:text-3xl font-bold text-foreground tracking-[0.3em] block text-center">
                  {company?.invite_code}
                </code>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={copyCode} variant="outline" size="sm" className="font-heading">
                  {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                  Código
                </Button>
                <Button onClick={shareLink} variant="outline" size="sm" className="font-heading">
                  <Share2 className="w-4 h-4 mr-1.5" /> Link
                </Button>
              </div>
              <Link to="/empresa/convites" className="block mt-3">
                <Button variant="default" size="sm" className="w-full font-heading bg-brand-magenta/90 hover:bg-brand-magenta text-white">
                  Convites & QR Code da pesquisa →
                </Button>
              </Link>
              <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
                Compartilhe com sua equipe. Cada pessoa usa o código no cadastro para se vincular automaticamente.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-brand-cyan" />
                <p className="font-heading font-bold text-sm">Conformidade LGPD</p>
              </div>
              <ul className="text-xs text-muted-foreground space-y-2 font-body">
                <li>• Respostas individuais nunca são exibidas</li>
                <li>• Agregação mínima k ≥ 7 por setor</li>
                <li>• Critérios COPSOQ II / FIOCRUZ</li>
                <li>• Dados criptografados em repouso</li>
              </ul>
            </div>
          </motion.div>

          {/* MAIN FORM */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2 glass-card rounded-2xl p-6 md:p-8 space-y-6"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-border/30">
              <div className="w-11 h-11 rounded-xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-brand-gold" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-foreground">Identidade da empresa</h2>
                <p className="text-xs text-muted-foreground">Dados aparecem nos relatórios oficiais NR-1</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label className="font-heading text-xs uppercase tracking-wider text-muted-foreground">Razão social</Label>
                <Input value={legalName} onChange={(e) => setLegalName(e.target.value)} className="bg-background/40" />
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-xs uppercase tracking-wider text-muted-foreground">CNPJ</Label>
                <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} className="bg-background/40" placeholder="00.000.000/0000-00" />
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-xs uppercase tracking-wider text-muted-foreground">Nº de colaboradores</Label>
                <Input type="number" min={1} value={employees} onChange={(e) => setEmployees(e.target.value)} className="bg-background/40" />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
                Setores / departamentos
              </Label>
              <div className="flex gap-2">
                <Input
                  value={sectorInput}
                  onChange={(e) => setSectorInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSector(); } }}
                  className="bg-background/40"
                  placeholder="Ex.: Operações, RH, Comercial..."
                />
                <Button type="button" onClick={addSector} variant="outline" className="font-heading shrink-0">
                  <Plus className="w-4 h-4 mr-1.5" /> Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {sectors.map((s) => (
                  <Badge key={s} variant="secondary" className="font-heading bg-brand-cyan/15 text-foreground border border-brand-cyan/30 pl-3 pr-1.5 py-1.5 gap-2">
                    {s}
                    <button onClick={() => removeSector(s)} className="hover:bg-foreground/10 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {sectors.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">Adicione ao menos um setor para segmentar dashboards.</p>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
                Versão do questionário COPSOQ II
              </Label>
              <Select value={copsoq} onValueChange={(v) => setCopsoq(v as CopsoqVersion)}>
                <SelectTrigger className="bg-background/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(COPSOQ_LABELS) as CopsoqVersion[]).map((v) => (
                    <SelectItem key={v} value={v}>{COPSOQ_LABELS[v]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Esta versão será aplicada a todas as novas campanhas de pesquisa lançadas para sua empresa.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
              <Button onClick={() => navigate("/dashboard")} variant="ghost" className="font-heading">
                Cancelar
              </Button>
              <Button onClick={save} disabled={saving} className="gradient-gold text-primary-foreground font-heading font-bold">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Salvar alterações</>}
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
