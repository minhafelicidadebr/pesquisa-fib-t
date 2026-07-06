import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import QRCode from "qrcode";
import { ArrowLeft, Loader2, Printer, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

/**
 * Certificado A4 paisagem imprimível — o navegador gera o PDF via diálogo nativo.
 * Zero dependência extra; layout puro CSS com @media print.
 */
export default function SeloCertificado() {
  const { id } = useParams();
  const [seal, setSeal] = useState<Seal | null>(null);
  const [qr, setQr] = useState<string>("");
  const [status, setStatus] = useState<"loading" | "ok" | "notfound">("loading");

  const publicUrl = useMemo(
    () => (typeof window !== "undefined" ? `${window.location.origin}/selo/${id}` : ""),
    [id]
  );

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.rpc("get_nr1_seal" as never, { _id: id } as never);
      if (error || !data) return setStatus("notfound");
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
      color: { dark: "#111111", light: "#ffffff" },
    }).then(setQr);
  }, [publicUrl]);

  useEffect(() => {
    if (seal) document.title = `Certificado · ${seal.company_name} · Manifesto NR-1`;
  }, [seal]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
      </div>
    );
  }

  if (status === "notfound" || !seal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-100 text-center px-6">
        <ShieldCheck className="w-16 h-16 text-neutral-400 mb-4" />
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Certificado não encontrado</h1>
        <Link to="/nr1-brasil" className="text-amber-700 underline mt-4">
          Voltar ao Movimento
        </Link>
      </div>
    );
  }

  const issued = new Date(seal.created_at);
  const shortId = id?.slice(0, 8).toUpperCase();

  return (
    <>
      {/* Print-only CSS + light mode override (o certificado é sempre claro para impressão) */}
      <style>{`
        @page { size: A4 landscape; margin: 0; }
        @media print {
          html, body { background: #ffffff !important; margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .cert-page { box-shadow: none !important; margin: 0 !important; page-break-after: always; }
        }
        .cert-page {
          width: 297mm;
          height: 210mm;
          background: #fbfaf5;
          color: #1a1a1a;
          position: relative;
          overflow: hidden;
        }
        .cert-serif { font-family: 'Fraunces', Georgia, 'Times New Roman', serif; }
        .cert-sans { font-family: 'Manrope', system-ui, sans-serif; }
      `}</style>

      <div className="min-h-screen bg-neutral-200 py-8 px-4 flex flex-col items-center gap-6">
        {/* Toolbar */}
        <div className="no-print w-full max-w-[297mm] flex items-center justify-between">
          <Link
            to={`/selo/${id}`}
            className="inline-flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao selo
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 text-sm font-bold text-white bg-neutral-900 hover:bg-neutral-800 px-5 py-2.5 rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir / Salvar PDF
          </button>
        </div>

        {/* A4 landscape sheet */}
        <div className="cert-page shadow-2xl">
          {/* decorative border */}
          <div
            style={{
              position: "absolute",
              inset: "10mm",
              border: "1.5px solid #b8912e",
              borderRadius: "6mm",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "13mm",
              border: "0.5px solid #d4b46a",
              borderRadius: "5mm",
              pointerEvents: "none",
            }}
          />

          {/* corner accents */}
          <CornerFlourish top left />
          <CornerFlourish top />
          <CornerFlourish left />
          <CornerFlourish />

          {/* content */}
          <div
            style={{
              position: "absolute",
              inset: "22mm 24mm",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: "linear-gradient(135deg,#f5c842,#b8912e)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <ShieldCheck className="w-7 h-7" style={{ color: "#1a1a1a" }} strokeWidth={2.5} />
                </div>
                <div>
                  <div
                    className="cert-sans"
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.22em",
                      color: "#8a6d1a",
                      textTransform: "uppercase",
                    }}
                  >
                    Instituto Felicidade para Todos
                  </div>
                  <div
                    className="cert-sans"
                    style={{
                      fontSize: 13,
                      color: "#555",
                      marginTop: 2,
                    }}
                  >
                    Ciência da Felicidade no Trabalho · Brasil
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  className="cert-sans"
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: "0.2em",
                    color: "#8a6d1a",
                    textTransform: "uppercase",
                  }}
                >
                  Selo Nº
                </div>
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 14, color: "#1a1a1a" }}>
                  {shortId}
                </div>
              </div>
            </div>

            {/* title */}
            <div style={{ marginTop: "8mm", textAlign: "center" }}>
              <div
                className="cert-sans"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.35em",
                  color: "#8a6d1a",
                  textTransform: "uppercase",
                }}
              >
                Certificado de Adesão
              </div>
              <h1
                className="cert-serif"
                style={{
                  fontSize: 46,
                  fontWeight: 700,
                  color: "#1a1a1a",
                  margin: "3mm 0 0",
                  lineHeight: 1.1,
                }}
              >
                Manifesto NR-1 Brasil
              </h1>
              <div
                style={{
                  width: 60,
                  height: 2,
                  background: "linear-gradient(90deg,#b8912e,#f5c842,#b8912e)",
                  margin: "4mm auto 0",
                }}
              />
            </div>

            {/* body */}
            <div
              style={{
                flex: 1,
                display: "flex",
                gap: "10mm",
                alignItems: "center",
                marginTop: "6mm",
              }}
            >
              <div style={{ flex: 1 }}>
                <p
                  className="cert-sans"
                  style={{ fontSize: 12, color: "#555", marginBottom: "3mm" }}
                >
                  Certifica-se que
                </p>
                <div
                  className="cert-serif"
                  style={{
                    fontSize: 34,
                    fontWeight: 700,
                    color: "#1a1a1a",
                    lineHeight: 1.15,
                    marginBottom: "5mm",
                    borderBottom: "1px solid #d4b46a",
                    paddingBottom: "3mm",
                  }}
                >
                  {seal.company_name}
                </div>
                <p
                  className="cert-sans"
                  style={{
                    fontSize: 13,
                    color: "#333",
                    lineHeight: 1.55,
                    marginBottom: "5mm",
                  }}
                >
                  assumiu publicamente o compromisso com a{" "}
                  <strong>gestão ativa dos riscos psicossociais no trabalho</strong>, em conformidade
                  com a <strong>Norma Regulamentadora nº 1</strong> do Ministério do Trabalho e
                  Emprego, integrando saúde mental, escuta científica e ação transformadora à sua
                  estratégia organizacional.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "4mm",
                    marginTop: "4mm",
                    borderTop: "1px solid #d4b46a",
                    paddingTop: "3mm",
                  }}
                >
                  <MetaItem
                    label="Signatário(a)"
                    value={`${seal.first_name}${seal.role ? " · " + seal.role : ""}`}
                  />
                  <MetaItem label="Localidade" value={seal.state_uf ? `Brasil · ${seal.state_uf}` : "Brasil"} />
                  <MetaItem
                    label="Porte"
                    value={
                      seal.headcount_range
                        ? HEADCOUNT_LABEL[seal.headcount_range] ?? seal.headcount_range
                        : "—"
                    }
                  />
                </div>
              </div>

              {/* QR */}
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    padding: "3mm",
                    background: "#ffffff",
                    borderRadius: "3mm",
                    border: "1px solid #d4b46a",
                  }}
                >
                  {qr ? (
                    <img src={qr} alt="QR verificação" style={{ width: 42 * 3, height: 42 * 3, display: "block" }} />
                  ) : (
                    <div style={{ width: 126, height: 126 }} />
                  )}
                </div>
                <div
                  className="cert-sans"
                  style={{
                    fontSize: 8,
                    letterSpacing: "0.15em",
                    color: "#8a6d1a",
                    textTransform: "uppercase",
                    marginTop: "2mm",
                    fontWeight: 700,
                  }}
                >
                  Verifique este selo
                </div>
                <div className="cert-sans" style={{ fontSize: 8, color: "#555", marginTop: "1mm" }}>
                  {publicUrl.replace(/^https?:\/\//, "")}
                </div>
              </div>
            </div>

            {/* footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginTop: "6mm",
                paddingTop: "4mm",
                borderTop: "1px solid #d4b46a",
              }}
            >
              <div>
                <div
                  className="cert-serif"
                  style={{ fontStyle: "italic", fontSize: 14, color: "#1a1a1a", lineHeight: 1.3 }}
                >
                  "Floresça humano é o novo indicador de performance."
                </div>
                <div
                  className="cert-sans"
                  style={{ fontSize: 9, color: "#8a6d1a", marginTop: "2mm", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}
                >
                  Manifesto NR-1 Brasil · IFT
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="cert-sans" style={{ fontSize: 10, color: "#555" }}>
                  Emitido em
                </div>
                <div className="cert-serif" style={{ fontSize: 16, color: "#1a1a1a", fontWeight: 700 }}>
                  {issued.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        className="cert-sans"
        style={{
          fontSize: 8,
          fontWeight: 800,
          letterSpacing: "0.18em",
          color: "#8a6d1a",
          textTransform: "uppercase",
          marginBottom: "1mm",
        }}
      >
        {label}
      </div>
      <div className="cert-sans" style={{ fontSize: 11, color: "#1a1a1a", fontWeight: 600 }}>
        {value}
      </div>
    </div>
  );
}

function CornerFlourish({ top, left }: { top?: boolean; left?: boolean }) {
  const style: React.CSSProperties = {
    position: "absolute",
    width: "24mm",
    height: "24mm",
    [top ? "top" : "bottom"]: "10mm",
    [left ? "left" : "right"]: "10mm",
    pointerEvents: "none",
  };
  const rotate = `rotate(${(top ? 0 : 180) + (left ? 0 : (top ? 90 : -90))}deg)`;
  return (
    <svg viewBox="0 0 100 100" style={{ ...style, transform: rotate }}>
      <defs>
        <linearGradient id="cornerGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5c842" />
          <stop offset="100%" stopColor="#8a6d1a" />
        </linearGradient>
      </defs>
      <path
        d="M4 4 L28 4 M4 4 L4 28 M4 4 Q40 12 60 40 M4 4 Q12 40 40 60"
        fill="none"
        stroke="url(#cornerGold)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="4" cy="4" r="2" fill="#b8912e" />
    </svg>
  );
}
