import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, CheckCircle2, Lock, Sparkles, ArrowRight, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  copsoqItems,
  likertFreq,
  likertIntensity,
  likertHealth,
  computeCopsoqAnalysis,
} from "@/data/copsoq";

type Company = { id: string; legal_name: string; sectors: string[] | null };
type Stage = "code" | "intro" | "survey" | "done";

const BATCH_SIZE = 6;

async function hashString(str: string): Promise<string> {
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
  } catch {
    return "anon";
  }
}

export default function Pesquisa() {
  const [params, setParams] = useSearchParams();
  const initialCode = (params.get("code") || "").toUpperCase();

  const [stage, setStage] = useState<Stage>(initialCode ? "intro" : "code");
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [sector, setSector] = useState<string>("");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (initialCode) void validateCode(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pages = useMemo(() => {
    const out: typeof copsoqItems[] = [];
    for (let i = 0; i < copsoqItems.length; i += BATCH_SIZE) {
      out.push(copsoqItems.slice(i, i + BATCH_SIZE));
    }
    return out;
  }, []);

  const totalAnswered = Object.keys(answers).length;
  const progress = Math.round((totalAnswered / copsoqItems.length) * 100);

  async function validateCode(rawCode: string) {
    const trimmed = rawCode.trim().toUpperCase();
    if (!trimmed) {
      toast({ title: "Código obrigatório", description: "Cole o código fornecido pela sua organização.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.rpc("lookup_company_by_invite", { _code: trimmed });
    setLoading(false);
    if (error || !data || (Array.isArray(data) && data.length === 0)) {
      toast({ title: "Código inválido", description: "Confirme com sua organização e tente novamente.", variant: "destructive" });
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    setCompany({ id: row.id, legal_name: row.legal_name, sectors: row.sectors });
    setCode(trimmed);
    setParams({ code: trimmed }, { replace: true });
    setStage("intro");
  }

  function getLikert(scale: string) {
    if (scale === "freq") return likertFreq;
    if (scale === "intensity") return likertIntensity;
    return likertHealth;
  }

  function setAnswer(id: number, value: number) {
    setAnswers((p) => ({ ...p, [id]: value }));
  }

  const currentBatch = pages[page] || [];
  const batchComplete = currentBatch.every((i) => answers[i.id] !== undefined);

  async function submit() {
    if (!company) return;
    if (Object.keys(answers).length < copsoqItems.length) {
      toast({ title: "Faltam respostas", description: "Responda todas as perguntas para concluir.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const analysis = computeCopsoqAnalysis(answers);
    const uaHash = await hashString(navigator.userAgent + "|" + new Date().toDateString());
    const { error } = await supabase.rpc("submit_public_survey", {
      _code: code,
      _sector: sector || null,
      _answers: answers as never,
      _global_score: analysis.global_score,
      _global_risk: analysis.global_risk,
      _ua_hash: uaHash,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Não foi possível enviar", description: error.message, variant: "destructive" });
      return;
    }
    setStage("done");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-brand-cyan/5">
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-16">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg grid place-items-center bg-gradient-to-br from-brand-gold/30 via-brand-cyan/20 to-brand-magenta/30">
              <Sparkles className="w-4 h-4 text-brand-gold" />
            </div>
            <span className="font-heading font-black tracking-tight">IFT · FIB·NR-1</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            <span>100% anônimo · k ≥ 7</span>
          </div>
        </header>

        {stage === "code" && (
          <Card className="p-6 md:p-10 backdrop-blur-xl bg-card/60 border-foreground/10">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-brand-cyan" />
              <h1 className="font-heading text-2xl md:text-3xl font-black">Pesquisa anônima de bem-estar</h1>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Cole o código que sua organização compartilhou. Suas respostas são tratadas em <b>agregação anônima</b> (mínimo
              7 respondentes por setor) — ninguém vê respostas individuais.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); void validateCode(code); }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="EX: AB23CDEF"
                className="font-mono tracking-widest text-center sm:text-left text-base"
                maxLength={12}
                aria-label="Código de convite"
              />
              <Button type="submit" disabled={loading || !code.trim()} className="bg-brand-cyan hover:bg-brand-cyan/90 text-background">
                {loading ? "Validando..." : "Entrar"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          </Card>
        )}

        {stage === "intro" && company && (
          <Card className="p-6 md:p-10 backdrop-blur-xl bg-card/60 border-foreground/10">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-cyan mb-2">Você está respondendo para</p>
            <h1 className="font-heading text-3xl md:text-4xl font-black mb-2">{company.legal_name}</h1>
            <p className="text-muted-foreground leading-relaxed mb-6">
              São <b>{copsoqItems.length} questões</b> baseadas no <b>COPSOQ II</b> — protocolo científico internacional
              de avaliação de riscos psicossociais (NR-1). Leva cerca de <b>7 minutos</b>.
            </p>

            <div className="grid sm:grid-cols-3 gap-3 mb-6">
              {[
                { i: Lock, l: "Anônimo", d: "Sem login. Sem IP." },
                { i: Shield, l: "k ≥ 7", d: "Agregado por setor." },
                { i: CheckCircle2, l: "Científico", d: "COPSOQ II validado." },
              ].map(({ i: Icon, l, d }) => (
                <div key={l} className="rounded-xl border border-foreground/10 bg-background/40 p-3">
                  <Icon className="w-4 h-4 text-brand-gold mb-1.5" />
                  <p className="text-sm font-heading font-bold">{l}</p>
                  <p className="text-xs text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <Label className="text-sm mb-2 block">
                Seu setor / área <span className="text-brand-magenta">*</span>
              </Label>
              {company.sectors && company.sectors.length > 0 ? (
                <Select value={sector} onValueChange={setSector}>
                  <SelectTrigger><SelectValue placeholder="Selecione seu setor..." /></SelectTrigger>
                  <SelectContent>
                    {company.sectors.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                    <SelectItem value="Não informado">Prefiro não informar</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  placeholder="Ex: Operações, RH, Comercial..."
                  maxLength={60}
                />
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Usamos o setor apenas para agregação estatística: resultados só aparecem quando há
                pelo menos 7 respostas no mesmo setor (k ≥ 7). Sua resposta individual nunca é exibida.
              </p>
            </div>

            <Button
              size="lg"
              disabled={!sector.trim()}
              className="w-full bg-gradient-to-r from-brand-cyan via-brand-gold to-brand-magenta text-background font-heading font-black disabled:opacity-50"
              onClick={() => setStage("survey")}
            >
              Começar pesquisa
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>

          </Card>
        )}

        {stage === "survey" && (
          <div>
            <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Bloco {page + 1} de {pages.length}</span>
              <span>{totalAnswered} / {copsoqItems.length} respondidas</span>
            </div>
            <Progress value={progress} className="mb-6 h-1.5" />

            <motion.div
              key={page}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {currentBatch.map((item) => {
                const opts = getLikert(item.scale);
                return (
                  <Card key={item.id} className="p-5 backdrop-blur-xl bg-card/60 border-foreground/10">
                    <p className="font-heading font-bold text-sm md:text-base mb-4 leading-snug">
                      <span className="text-brand-gold mr-2">{item.id}.</span>{item.text}
                    </p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {opts.map((o) => {
                        const sel = answers[item.id] === o.value;
                        return (
                          <button
                            key={o.value}
                            type="button"
                            onClick={() => setAnswer(item.id, o.value)}
                            className={`p-2 rounded-lg border text-[11px] leading-tight font-medium transition-all ${
                              sel
                                ? "border-brand-cyan bg-brand-cyan/15 text-foreground shadow-[0_0_0_2px_rgba(0,200,255,0.15)]"
                                : "border-foreground/10 hover:border-foreground/30 text-muted-foreground hover:text-foreground"
                            }`}
                            aria-pressed={sel}
                          >
                            <span className="block font-heading font-black text-base mb-0.5">{o.value}</span>
                            <span className="block">{o.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </motion.div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
              </Button>
              {page < pages.length - 1 ? (
                <Button
                  disabled={!batchComplete}
                  onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="bg-brand-cyan text-background hover:bg-brand-cyan/90"
                >
                  Próximo bloco <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  disabled={loading || totalAnswered < copsoqItems.length}
                  onClick={submit}
                  className="bg-gradient-to-r from-brand-gold to-brand-magenta text-background font-heading font-black"
                >
                  {loading ? "Enviando..." : <>Enviar resposta <Send className="w-4 h-4 ml-1.5" /></>}
                </Button>
              )}
            </div>
          </div>
        )}

        {stage === "done" && (
          <Card className="p-8 md:p-12 text-center backdrop-blur-xl bg-card/60 border-foreground/10">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.6 }}
              className="w-16 h-16 mx-auto mb-5 rounded-full grid place-items-center bg-gradient-to-br from-brand-gold/30 to-brand-cyan/30"
            >
              <CheckCircle2 className="w-8 h-8 text-brand-gold" />
            </motion.div>
            <h2 className="font-heading text-3xl font-black mb-3">Resposta registrada</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
              Obrigado por contribuir com o bem-estar coletivo. Sua resposta entra no agregado anônimo (k ≥ 7)
              e ajudará sua organização a agir onde mais importa.
            </p>
            <Link to="/">
              <Button variant="outline">Voltar ao início</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
