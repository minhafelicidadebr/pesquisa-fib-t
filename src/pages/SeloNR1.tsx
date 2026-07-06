import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  Download,
  Linkedin,
  Loader2,
  MapPin,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SocialShareKit } from "@/components/nr1/SocialShareKit";

interface Seal {
  id: string;
  first_name: string;
  role: string | null;
  company_name: string;
  state_uf: string | null;
  headcount_range: string | null;
  created_at: string;
}

const HEADCOUNT_LABEL: Record<string, string> = {
  "1-49": "Até 49 pessoas",
  "50-249": "50 a 249 pessoas",
  "250-999": "250 a 999 pessoas",
  "1.000-4.999": "1 mil a 5 mil pessoas",
  "5.000+": "Mais de 5 mil pessoas",
};

export default function SeloNR1() {
  const { id } = useParams();
  const [seal, setSeal] = useState<Seal | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "notfound">("loading");
  const [qr, setQr] = useState<string>("");
  const [kitOpen, setKitOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const publicUrl = useMemo(
    () => (typeof window !== "undefined" ? `${window.location.origin}/selo/${id}` : ""),
    [id]
  );

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.rpc("get_nr1_seal" as never, { _id: id } as never);
      if (error || !data) {
        setStatus("notfound");
        return;
      }
      setSeal(data as unknown as Seal);
      setStatus("ok");
    })();
  }, [id]);

  useEffect(() => {
    if (!publicUrl) return;
    QRCode.toDataURL(publicUrl, {
      errorCorrectionLevel: "H",
      width: 512,
      margin: 1,
      color: { dark: "#0a0a0f", light: "#ffffff" },
    }).then(setQr);
  }, [publicUrl]);

  // SEO dinâmico para compartilhamento
  useEffect(() => {
    if (!seal) return;
    const title = `${seal.company_name} · Selo NR-1 Brasil`;
    const description = `${seal.company_name} assinou publicamente o Manifesto NR-1 Brasil, assumindo compromisso com saúde mental no trabalho e a Norma Regulamentadora nº 1.`;
    document.title = title;
    const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
      let tag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };
    setMeta("description", description);
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", "website", "property");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
  }, [seal]);

  const issuedAt = seal ? new Date(seal.created_at) : null;
  const shortId = id?.slice(0, 8).toUpperCase();

  const shareText = seal
    ? `${seal.company_name} assinou o Manifesto NR-1 Brasil — compromisso público com a saúde mental no trabalho. Verifique o selo:`
    : "";

  function copyLink() {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link do selo copiado.");
  }

  function shareNative() {
    if (navigator.share) {
      navigator.share({ title: "Selo NR-1 Brasil", text: shareText, url: publicUrl }).catch(() => {});
    } else {
      copyLink();
    }
  }

  function shareLinkedIn() {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function copyEmbed() {
    const src = `${window.location.origin}/selo/${id}/embed`;
    const embed = `<iframe src="${src}" title="Selo NR-1 Brasil" width="320" height="86" style="border:0;background:transparent;overflow:hidden" loading="lazy" scrolling="no"></iframe>`;
    navigator.clipboard.writeText(embed);
    toast.success("Iframe embed copiado — cole no site da empresa.");
  }

  async function downloadPng() {
    if (!qr) return;
    // Download the QR PNG for now — html-to-image adds bundle weight
    const link = document.createElement("a");
    link.href = qr;
    link.download = `selo-nr1-${shortId}.png`;
    link.click();
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  if (status === "notfound" || !seal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-6">
        <ShieldCheck className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="font-display text-3xl font-bold mb-2">Selo não encontrado</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          Este selo não existe ou o link está incorreto. Verifique o endereço ou entre no Movimento.
        </p>
        <Link
          to="/nr1-brasil#manifesto"
          className="inline-flex items-center gap-2 bg-brand-gold text-brand-charcoal font-heading font-bold px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform"
        >
          Ir para o Manifesto
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-24">
        <Link
          to="/nr1-brasil"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Movimento NR-1 Brasil
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-widest text-brand-gold mb-3">
            <Sparkles className="w-4 h-4" /> Selo Público Verificável
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-2">
            Empresa signatária do <span className="text-gradient-gold">Manifesto NR-1</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Este selo é público e verificável. Comprova o compromisso assumido com saúde mental no trabalho e a NR-1 do Ministério do Trabalho e Emprego.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-6">
          {/* Certificate card */}
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-3xl border border-brand-gold/40 bg-gradient-to-br from-brand-charcoal via-background to-brand-charcoal p-8 md:p-10 overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none opacity-40" style={{ background: "radial-gradient(600px circle at 20% 0%, rgba(245,200,66,0.18), transparent 60%), radial-gradient(500px circle at 100% 100%, rgba(220,38,127,0.15), transparent 60%)" }} />
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-gold to-amber-500 flex items-center justify-center glow-gold">
                  <ShieldCheck className="w-7 h-7 text-brand-charcoal" />
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-heading font-bold uppercase tracking-widest text-muted-foreground">Selo Nº</div>
                  <div className="font-mono text-sm text-brand-gold">{shortId}</div>
                </div>
              </div>

              <div className="text-[11px] font-heading font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Certifica-se que
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
                {seal.company_name}
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
                assinou publicamente o <strong className="text-foreground">Manifesto NR-1 Brasil</strong>, comprometendo-se com a gestão ativa dos riscos psicossociais no trabalho, em conformidade com a Norma Regulamentadora nº 1 do Ministério do Trabalho e Emprego.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-brand-gold/20">
                <Meta label="Signatário(a)" value={`${seal.first_name}${seal.role ? " · " + seal.role : ""}`} />
                <Meta
                  label="Localidade"
                  icon={<MapPin className="w-3.5 h-3.5" />}
                  value={seal.state_uf ? `Brasil · ${seal.state_uf}` : "Brasil"}
                />
                <Meta
                  label="Porte"
                  icon={<Users className="w-3.5 h-3.5" />}
                  value={seal.headcount_range ? HEADCOUNT_LABEL[seal.headcount_range] ?? seal.headcount_range : "—"}
                />
              </div>

              <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Emitido em{" "}
                  {issuedAt?.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                </span>
                <span className="font-heading font-bold text-brand-gold/80">Instituto Felicidade para Todos</span>
              </div>
            </div>
          </motion.div>

          {/* Actions panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-3xl border border-white/10 bg-card/60 backdrop-blur p-6 md:p-8 space-y-6"
          >
            <div>
              <div className="text-xs font-heading font-bold uppercase tracking-widest text-muted-foreground mb-3">
                QR Code de verificação
              </div>
              <div className="rounded-2xl bg-white p-4 flex items-center justify-center">
                {qr ? (
                  <img src={qr} alt="QR do Selo NR-1" className="w-48 h-48" />
                ) : (
                  <Loader2 className="w-8 h-8 animate-spin text-brand-charcoal" />
                )}
              </div>
              <button
                onClick={downloadPng}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 text-sm font-heading font-bold text-foreground bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 transition-colors"
              >
                <Download className="w-4 h-4" /> Baixar QR (PNG)
              </button>
            </div>

            <div>
              <div className="text-xs font-heading font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Compartilhar o selo
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ActionBtn icon={<Sparkles className="w-4 h-4" />} label="Post pronto" onClick={() => setKitOpen(true)} highlight />
                <ActionBtn icon={<Share2 className="w-4 h-4" />} label="Compartilhar" onClick={shareNative} />
                <ActionBtn icon={<Linkedin className="w-4 h-4" />} label="LinkedIn" onClick={shareLinkedIn} />
                <ActionBtn icon={<Copy className="w-4 h-4" />} label="Copiar link" onClick={copyLink} />
                <ActionBtn icon={<Copy className="w-4 h-4" />} label="Copiar embed" onClick={copyEmbed} />
              </div>
              <div className="mt-3 text-[11px] text-muted-foreground break-all bg-black/20 rounded-lg p-2.5 border border-white/5">
                {publicUrl}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Link
                to="/nr1-brasil#manifesto"
                className="block text-center bg-gradient-magenta text-white font-heading font-bold px-5 py-3 rounded-xl hover:scale-[1.02] transition-transform"
              >
                Sua empresa também quer o selo
              </Link>
              <p className="mt-2 text-[11px] text-muted-foreground text-center">
                Grátis. Sem exposição de dados sensíveis.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <SocialShareKit
        open={kitOpen}
        onClose={() => setKitOpen(false)}
        companyName={seal.company_name}
        firstName={seal.first_name}
        role={seal.role}
        stateUf={seal.state_uf}
        publicUrl={publicUrl}
        shortId={shortId ?? ""}
      />
    </div>
  );
}

function Meta({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] font-heading font-bold uppercase tracking-widest text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      <div className="text-sm text-foreground font-medium">{value}</div>
    </div>
  );
}

function ActionBtn({
  icon,
  label,
  onClick,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={
        highlight
          ? "inline-flex items-center justify-center gap-2 text-sm font-heading font-bold text-brand-charcoal bg-brand-gold hover:bg-brand-gold/90 border border-brand-gold rounded-xl py-2.5 transition-colors"
          : "inline-flex items-center justify-center gap-2 text-sm font-heading font-bold text-foreground bg-white/5 hover:bg-brand-gold/10 hover:text-brand-gold border border-white/10 hover:border-brand-gold/40 rounded-xl py-2.5 transition-colors"
      }
    >
      {icon}
      {label}
    </button>
  );
}
