import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  total: number;
  companies: number;
  states: { uf: string; n: number }[];
}

/**
 * Sprint 25 — Widget embed do Contador Nacional NR-1.
 * Rota /nr1-brasil/contador/embed — iframe-friendly, background transparente.
 * Uso: parceiros, imprensa, sites institucionais embedam para provar o movimento.
 */
export default function NR1Contador() {
  const [stats, setStats] = useState<Stats | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    document.body.style.margin = "0";
    (async () => {
      const { data } = await supabase.rpc("nr1_manifest_stats" as never);
      if (data) setStats(data as unknown as Stats);
    })();
    const int = setInterval(async () => {
      const { data } = await supabase.rpc("nr1_manifest_stats" as never);
      if (data) setStats(data as unknown as Stats);
    }, 30_000);
    return () => clearInterval(int);
  }, []);

  const n = stats?.companies ?? stats?.total ?? 0;
  const ufs = stats?.states?.length ?? 0;

  return (
    <a
      href={`${origin}/nr1-brasil`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        textDecoration: "none",
        fontFamily:
          "'Manrope', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        padding: "16px 20px",
        borderRadius: 16,
        background:
          "linear-gradient(135deg, rgba(20,10,30,0.92), rgba(45,20,60,0.92))",
        border: "1px solid rgba(245,200,66,0.35)",
        boxShadow:
          "0 8px 32px rgba(184,145,46,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
        color: "#fff",
        maxWidth: 380,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: "linear-gradient(135deg,#f5c842,#b8912e)",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <ShieldCheck size={24} color="#1a1a1a" strokeWidth={2.5} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#f5c842",
              marginBottom: 2,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#34d399",
                boxShadow: "0 0 8px #34d399",
                display: "inline-block",
              }}
            />
            Movimento ao vivo
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              fontFamily: "'Fraunces', Georgia, serif",
            }}
          >
            <span
              style={{
                fontSize: 30,
                fontWeight: 700,
                background: "linear-gradient(135deg,#f5c842,#e94560)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {n.toLocaleString("pt-BR")}
            </span>
            <span style={{ fontSize: 12, color: "#e5e5e5", fontWeight: 600 }}>
              signatários
            </span>
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#c9c4d4",
              marginTop: 2,
              lineHeight: 1.35,
            }}
          >
            Manifesto NR-1 · {ufs} UF{ufs === 1 ? "" : "s"} · IFT Brasil
          </div>
        </div>
      </div>
    </a>
  );
}
