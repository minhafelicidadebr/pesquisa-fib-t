import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Seal {
  id: string;
  company_name: string;
  state_uf: string | null;
  created_at: string;
}

/**
 * Embed público minimalista do Selo NR-1.
 * Renderizado dentro de <iframe> em sites de empresas signatárias.
 * Sem nav, sem chrome, transparente, clicável (abre o selo completo em nova aba).
 */
export default function SeloEmbed() {
  const { id } = useParams();
  const [seal, setSeal] = useState<Seal | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "notfound">("loading");

  useEffect(() => {
    // remove qualquer background da página host — iframe deve parecer flutuante
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    document.body.style.margin = "0";
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.rpc("get_nr1_seal" as never, { _id: id } as never);
      if (error || !data) return setStatus("notfound");
      setSeal(data as unknown as Seal);
      setStatus("ok");
    })();
  }, [id]);

  if (status !== "ok" || !seal) {
    return (
      <div style={{ padding: 12, fontFamily: "system-ui", fontSize: 12, color: "#888" }}>
        {status === "loading" ? "Carregando selo..." : "Selo não encontrado"}
      </div>
    );
  }

  const year = new Date(seal.created_at).getFullYear();
  const href = `${window.location.origin}/selo/${seal.id}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderRadius: 14,
        background: "linear-gradient(135deg, #0a0a0f 0%, #12121a 100%)",
        border: "1px solid rgba(245,200,66,0.35)",
        boxShadow: "0 10px 30px -12px rgba(245,200,66,0.25)",
        textDecoration: "none",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        width: "fit-content",
        maxWidth: "100%",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "linear-gradient(135deg, #F5C842, #D97706)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <ShieldCheck size={22} color="#0a0a0f" strokeWidth={2.5} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "#F5C842",
            textTransform: "uppercase",
            marginBottom: 2,
          }}
        >
          Signatária · Manifesto NR-1 Brasil
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 240,
          }}
          title={seal.company_name}
        >
          {seal.company_name}
        </div>
        <div style={{ fontSize: 10, color: "#9aa0a6", marginTop: 2 }}>
          {seal.state_uf ? `${seal.state_uf} · ` : ""}Selo verificável · {year}
        </div>
      </div>
    </a>
  );
}
