import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  Check,
  Copy,
  Download,
  Hash,
  Linkedin,
  MessageCircle,
  Sparkles,
  X,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  companyName: string;
  firstName: string;
  role: string | null;
  stateUf: string | null;
  publicUrl: string;
  shortId: string;
}

const HASHTAGS =
  "#ManifestoNR1 #NR1Brasil #SaúdeMentalNoTrabalho #RiscosPsicossociais #FIB #FelicidadeParaTodos #ESG #GestãoDePessoas";

export function SocialShareKit({
  open,
  onClose,
  companyName,
  firstName,
  role,
  stateUf,
  publicUrl,
  shortId,
}: Props) {
  const linkedInDefault = useMemo(
    () =>
      `🛡️ Assumimos publicamente um compromisso que não pode mais esperar.\n\nA ${companyName} é signatária do Manifesto NR-1 Brasil — o movimento que coloca a saúde mental no trabalho como prioridade estratégica, em conformidade com a Norma Regulamentadora nº 1 do Ministério do Trabalho e Emprego.\n\nRiscos psicossociais não são "coisa de RH". São risco de negócio, risco jurídico e, acima de tudo, risco humano.\n\nNosso selo público e verificável:\n${publicUrl}\n\nSe a sua organização também acredita que floresça humano é o novo indicador de performance, some ao movimento.\n\n${HASHTAGS}`,
    [companyName, publicUrl]
  );

  const whatsAppDefault = useMemo(
    () =>
      `*${companyName} agora é signatária do Manifesto NR-1 Brasil* 🛡️\n\nAssumimos publicamente o compromisso com a saúde mental no trabalho e a gestão de riscos psicossociais exigida pela NR-1.\n\nVerifique nosso selo público:\n${publicUrl}\n\nJunte-se ao movimento pela Ciência da Felicidade no Trabalho.`,
    [companyName, publicUrl]
  );

  const [tab, setTab] = useState<"linkedin" | "whatsapp">("linkedin");
  const [linkedInText, setLinkedInText] = useState(linkedInDefault);
  const [whatsAppText, setWhatsAppText] = useState(whatsAppDefault);
  const [copied, setCopied] = useState(false);

  const currentText = tab === "linkedin" ? linkedInText : whatsAppText;

  async function copyText() {
    await navigator.clipboard.writeText(currentText);
    setCopied(true);
    toast.success("Post copiado. Cole na plataforma escolhida.");
    setTimeout(() => setCopied(false), 2000);
  }

  function openLinkedIn() {
    // LinkedIn não aceita text via query — abrimos o composer com URL e o usuário cola o texto (já copiado).
    navigator.clipboard.writeText(linkedInText);
    toast.success("Texto copiado. Cole no LinkedIn (Ctrl+V).");
    window.open(
      `https://www.linkedin.com/feed/?shareActive=true&shareUrl=${encodeURIComponent(publicUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function openWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(whatsAppText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function copyHashtags() {
    navigator.clipboard.writeText(HASHTAGS);
    toast.success("Hashtags copiadas.");
  }

  async function downloadSocialCard() {
    // Gera um card social 1200x630 (proporção OG) client-side via SVG→PNG.
    const svg = buildSocialCardSVG({ companyName, firstName, role, stateUf, shortId });
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 1200, 630);
      canvas.toBlob((png) => {
        if (!png) return;
        const dl = document.createElement("a");
        dl.href = URL.createObjectURL(png);
        dl.download = `card-social-nr1-${shortId}.png`;
        dl.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    };
    img.src = url;
    toast.success("Card social gerado — pronto para postar.");
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-background border border-brand-gold/30 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
          >
            {/* header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-brand-gold/10 via-transparent to-brand-magenta/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-gold to-amber-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-brand-charcoal" />
                </div>
                <div>
                  <div className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-gold">
                    Kit de compartilhamento
                  </div>
                  <div className="font-display text-lg font-bold text-foreground">
                    Post pronto do Manifesto
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* tabs */}
            <div className="flex border-b border-white/10">
              <TabBtn
                active={tab === "linkedin"}
                onClick={() => setTab("linkedin")}
                icon={<Linkedin className="w-4 h-4" />}
                label="LinkedIn"
              />
              <TabBtn
                active={tab === "whatsapp"}
                onClick={() => setTab("whatsapp")}
                icon={<MessageCircle className="w-4 h-4" />}
                label="WhatsApp"
              />
            </div>

            {/* body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              <textarea
                value={currentText}
                onChange={(e) =>
                  tab === "linkedin"
                    ? setLinkedInText(e.target.value)
                    : setWhatsAppText(e.target.value)
                }
                rows={tab === "linkedin" ? 12 : 8}
                className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-sm text-foreground font-mono leading-relaxed focus:outline-none focus:border-brand-gold/50 resize-none"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copyText}
                  className="inline-flex items-center gap-2 text-sm font-heading font-bold text-brand-charcoal bg-brand-gold hover:bg-brand-gold/90 px-4 py-2.5 rounded-xl transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copiado" : "Copiar post"}
                </button>
                {tab === "linkedin" ? (
                  <button
                    onClick={openLinkedIn}
                    className="inline-flex items-center gap-2 text-sm font-heading font-bold text-foreground bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <Linkedin className="w-4 h-4" /> Abrir LinkedIn
                  </button>
                ) : (
                  <button
                    onClick={openWhatsApp}
                    className="inline-flex items-center gap-2 text-sm font-heading font-bold text-foreground bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> Abrir WhatsApp
                  </button>
                )}
                <button
                  onClick={copyHashtags}
                  className="inline-flex items-center gap-2 text-sm font-heading font-bold text-foreground bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Hash className="w-4 h-4" /> Hashtags
                </button>
                <button
                  onClick={downloadSocialCard}
                  className="inline-flex items-center gap-2 text-sm font-heading font-bold text-foreground bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Download className="w-4 h-4" /> Card social (PNG)
                </button>
              </div>

              <div className="text-[11px] text-muted-foreground leading-relaxed">
                Dica: edite livremente antes de postar. O card social 1200×630 é ideal para o preview
                do LinkedIn e Twitter/X. O texto já inclui as hashtags oficiais do movimento.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-heading font-bold transition-colors border-b-2 ${
        active
          ? "text-brand-gold border-brand-gold"
          : "text-muted-foreground border-transparent hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// Escapa entidades XML para uso seguro dentro de <text>
function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSocialCardSVG({
  companyName,
  firstName,
  role,
  stateUf,
  shortId,
}: {
  companyName: string;
  firstName: string;
  role: string | null;
  stateUf: string | null;
  shortId: string;
}) {
  // Quebra o nome da empresa em até 2 linhas de ~22 chars
  const clean = companyName.trim();
  const lines: string[] = [];
  if (clean.length <= 24) {
    lines.push(clean);
  } else {
    const words = clean.split(/\s+/);
    let cur = "";
    for (const w of words) {
      if ((cur + " " + w).trim().length > 24 && lines.length === 0) {
        lines.push(cur.trim());
        cur = w;
      } else {
        cur = (cur + " " + w).trim();
      }
    }
    lines.push(cur);
  }
  const line1 = esc(lines[0] ?? "");
  const line2 = esc(lines[1] ?? "");

  const meta = [firstName && role ? `${firstName} · ${role}` : firstName, stateUf ? `Brasil · ${stateUf}` : "Brasil"]
    .filter(Boolean)
    .join("   ·   ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a0f"/>
      <stop offset="100%" stop-color="#12121a"/>
    </linearGradient>
    <radialGradient id="glowA" cx="15%" cy="10%" r="60%">
      <stop offset="0%" stop-color="#F5C842" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#F5C842" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB" cx="90%" cy="95%" r="60%">
      <stop offset="0%" stop-color="#DC267F" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#DC267F" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F5C842"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glowA)"/>
  <rect width="1200" height="630" fill="url(#glowB)"/>
  <rect x="16" y="16" width="1168" height="598" rx="28" fill="none" stroke="#F5C842" stroke-opacity="0.35" stroke-width="2"/>

  <!-- shield badge -->
  <g transform="translate(80,90)">
    <rect width="88" height="88" rx="22" fill="url(#gold)"/>
    <path d="M44 22 L66 30 V50 C66 60 55 66 44 70 C33 66 22 60 22 50 V30 Z" fill="#0a0a0f"/>
    <path d="M35 46 L42 53 L56 39" stroke="#F5C842" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <text x="190" y="128" font-family="'Manrope', system-ui, sans-serif" font-size="18" font-weight="800" letter-spacing="4" fill="#F5C842">SIGNATÁRIA · MANIFESTO NR-1 BRASIL</text>
  <text x="190" y="158" font-family="'Manrope', system-ui, sans-serif" font-size="16" fill="#9aa0a6">Compromisso público com a saúde mental no trabalho</text>

  <text x="80" y="290" font-family="'Fraunces', Georgia, serif" font-size="72" font-weight="700" fill="#ffffff">${line1}</text>
  ${line2 ? `<text x="80" y="370" font-family="'Fraunces', Georgia, serif" font-size="72" font-weight="700" fill="#ffffff">${line2}</text>` : ""}

  <line x1="80" y1="${line2 ? 410 : 330}" x2="380" y2="${line2 ? 410 : 330}" stroke="#F5C842" stroke-width="3"/>

  <text x="80" y="${line2 ? 460 : 380}" font-family="'Manrope', system-ui, sans-serif" font-size="22" fill="#e5e7eb">assumiu publicamente o compromisso com a</text>
  <text x="80" y="${line2 ? 492 : 412}" font-family="'Manrope', system-ui, sans-serif" font-size="22" font-weight="700" fill="#ffffff">Norma Regulamentadora nº 1 · Riscos Psicossociais</text>

  <text x="80" y="560" font-family="'Manrope', system-ui, sans-serif" font-size="16" fill="#9aa0a6">${esc(meta)}</text>
  <text x="80" y="588" font-family="'Manrope', system-ui, sans-serif" font-size="14" font-weight="700" letter-spacing="2" fill="#F5C842">SELO Nº ${esc(shortId)}   ·   INSTITUTO FELICIDADE PARA TODOS</text>
</svg>`;
}
