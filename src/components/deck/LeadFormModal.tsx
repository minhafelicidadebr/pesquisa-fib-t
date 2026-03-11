import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, CheckCircle, Clock, Shield, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  segment?: string;
}

// Segment-specific cargo options
const cargosBySegment: Record<string, string[]> = {
  "Setor Público": [
    "Secretário(a) Municipal/Estadual",
    "Diretor(a) de RH / Gestão de Pessoas",
    "Coordenador(a) de Programa",
    "Assessor(a) Técnico(a)",
    "Superintendente",
    "Gestor(a) de Políticas Públicas",
    "Prefeito(a) / Vice-prefeito(a)",
    "Vereador(a) / Deputado(a)",
    "Analista de Gestão",
    "Outro",
  ],
  "Setor Privado": [
    "CEO / Presidente",
    "CHRO / VP de RH",
    "Diretor(a) de Pessoas & Cultura",
    "Gerente de RH / DHO",
    "Head de Bem-Estar / Saúde Ocupacional",
    "Gerente de ESG / Sustentabilidade",
    "Coordenador(a) de T&D",
    "Business Partner de RH",
    "Analista de Clima / Engajamento",
    "Outro",
  ],
  "Sociedade Civil": [
    "Diretor(a) Executivo(a)",
    "Coordenador(a) de Projetos",
    "Gerente de Programas",
    "Gestor(a) de Impacto Social",
    "Assessor(a) Institucional",
    "Analista de Captação / Fundraising",
    "Líder Comunitário(a)",
    "Pesquisador(a) / Consultor(a)",
    "Voluntário(a) Estratégico(a)",
    "Outro",
  ],
};

const porteOptions = [
  "Até 50 colaboradores",
  "50–100 colaboradores",
  "100–500 colaboradores",
  "500–2.000 colaboradores",
  "2.000–10.000 colaboradores",
  "Acima de 10.000 colaboradores",
];

const prioridadeOptions = [
  "Cultura Organizacional",
  "NR-1 / Risco Psicossocial",
  "Educação para Felicidade",
  "Clima e Engajamento",
  "Saúde Mental e Bem-estar",
  "Integridade / Prevenção ao Assédio",
  "ESG / Impacto Social",
  "Liderança Positiva",
  "Aprendizagem e Desenvolvimento",
  "Diversidade e Inclusão",
];

export function LeadFormModal({ isOpen, onClose, segment }: LeadFormModalProps) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    organizacao: "",
    cargo: "",
    segmento: segment || "",
    porte: "",
    prioridade: "",
    janela: "",
    mensagem: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.nome.trim() || !form.email.trim()) {
      toast.error("Preencha pelo menos nome e e-mail.");
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-lead", {
        body: form,
      });

      if (error) throw error;
      setSubmitted(true);
      toast.success("Formulário enviado com sucesso!");
    } catch (err) {
      console.error("Error sending lead:", err);
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSubmitted(false);
    setForm({
      nome: "", email: "", telefone: "", organizacao: "", cargo: "",
      segmento: segment || "", porte: "", prioridade: "", janela: "", mensagem: "",
    });
    onClose();
  };

  const currentCargos = cargosBySegment[form.segmento] || cargosBySegment["Setor Privado"];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg z-50 glass-card-strong border-l border-foreground/10 overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-heading text-xl font-bold text-foreground">
                  {submitted ? "Obrigado!" : "Agendar reunião"}
                </h2>
                <button onClick={reset} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {submitted ? (
                <SuccessState onClose={reset} />
              ) : (
                <>
                  <TrustBadges />
                  <StepIndicator step={step} />

                  <AnimatePresence mode="wait">
                    {step === 1 ? (
                      <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <InputField label="Nome completo *" value={form.nome} onChange={(v) => update("nome", v)} />
                        <InputField label="E-mail corporativo *" value={form.email} onChange={(v) => update("email", v)} type="email" />
                        <InputField label="Telefone / WhatsApp" value={form.telefone} onChange={(v) => update("telefone", v)} />
                        <InputField label="Organização" value={form.organizacao} onChange={(v) => update("organizacao", v)} />
                        <SelectField
                          label="Segmento"
                          value={form.segmento}
                          onChange={(v) => { update("segmento", v); update("cargo", ""); }}
                          options={["Setor Público", "Setor Privado", "Sociedade Civil"]}
                        />
                        <SelectField
                          label="Cargo"
                          value={form.cargo}
                          onChange={(v) => update("cargo", v)}
                          options={currentCargos}
                        />
                        <button
                          onClick={() => setStep(2)}
                          className="w-full gradient-gold text-primary-foreground font-heading font-bold py-3 rounded-lg mt-4 hover:opacity-90 transition-opacity"
                        >
                          Próximo
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <SelectField
                          label="Porte da organização"
                          value={form.porte}
                          onChange={(v) => update("porte", v)}
                          options={porteOptions}
                        />
                        <SelectField
                          label="Principal prioridade"
                          value={form.prioridade}
                          onChange={(v) => update("prioridade", v)}
                          options={prioridadeOptions}
                        />
                        <SelectField
                          label="Janela de implantação"
                          value={form.janela}
                          onChange={(v) => update("janela", v)}
                          options={["0–90 dias", "90–180 dias", "180–365 dias", "Exploratório"]}
                        />
                        <div>
                          <label className="block text-sm font-heading text-muted-foreground mb-1.5">Mensagem (opcional)</label>
                          <textarea
                            value={form.mensagem}
                            onChange={(e) => update("mensagem", e.target.value)}
                            rows={3}
                            className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground font-body text-sm focus:border-primary focus:ring-1 focus:ring-ring outline-none resize-none transition-colors"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Ao enviar, autorizo contato do Instituto Felicidade para Todos para apresentação de proposta, demo e roadmap.
                        </p>
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => setStep(1)}
                            className="flex-1 border border-foreground/20 text-foreground/80 font-heading py-3 rounded-lg hover:bg-foreground/5 transition-colors"
                          >
                            Voltar
                          </button>
                          <button
                            onClick={handleSubmit}
                            disabled={sending}
                            className="flex-1 gradient-gold text-primary-foreground font-heading font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {sending ? "Enviando..." : "Enviar"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SuccessState({ onClose }: { onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
      <CheckCircle className="w-16 h-16 text-brand-gold mx-auto mb-6" />
      <h3 className="font-heading text-2xl font-bold text-foreground mb-3">Recebemos seu contato!</h3>
      <p className="text-muted-foreground mb-8">Nossa equipe retornará em até 24h com uma proposta e demo personalizada.</p>
      <button onClick={onClose} className="gradient-gold text-primary-foreground font-heading font-bold px-6 py-3 rounded-lg">Fechar</button>
    </motion.div>
  );
}

function TrustBadges() {
  return (
    <div className="flex gap-4 mb-8">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3.5 h-3.5 text-brand-gold" />
        <span>Retorno em 24h</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="w-3.5 h-3.5 text-brand-cyan" />
        <span>LGPD Compliant</span>
      </div>
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex gap-2 mb-8">
      {[1, 2].map((s) => (
        <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "gradient-gold" : "bg-muted"}`} />
      ))}
    </div>
  );
}

function InputField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-heading text-muted-foreground mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground font-body text-sm focus:border-primary focus:ring-1 focus:ring-ring outline-none transition-colors"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="block text-sm font-heading text-muted-foreground mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground font-body text-sm focus:border-primary focus:ring-1 focus:ring-ring outline-none transition-colors appearance-none"
      >
        <option value="">Selecione...</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
