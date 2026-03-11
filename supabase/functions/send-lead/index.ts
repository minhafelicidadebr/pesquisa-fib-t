import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      nome,
      email,
      telefone,
      organizacao,
      cargo,
      segmento,
      porte,
      prioridade,
      janela,
      mensagem,
    } = body;

    // Build email HTML
    const html = `
      <h2>Novo Lead — ${segmento || "Sem segmento"}</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px;font-family:sans-serif;">
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Nome</td><td style="padding:8px;border:1px solid #ddd;">${nome}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">E-mail</td><td style="padding:8px;border:1px solid #ddd;">${email}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Telefone</td><td style="padding:8px;border:1px solid #ddd;">${telefone || "—"}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Organização</td><td style="padding:8px;border:1px solid #ddd;">${organizacao || "—"}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Cargo</td><td style="padding:8px;border:1px solid #ddd;">${cargo || "—"}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Segmento</td><td style="padding:8px;border:1px solid #ddd;">${segmento || "—"}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Porte</td><td style="padding:8px;border:1px solid #ddd;">${porte || "—"}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Prioridade</td><td style="padding:8px;border:1px solid #ddd;">${prioridade || "—"}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Janela</td><td style="padding:8px;border:1px solid #ddd;">${janela || "—"}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Mensagem</td><td style="padding:8px;border:1px solid #ddd;">${mensagem || "—"}</td></tr>
      </table>
      <p style="margin-top:16px;color:#888;font-size:12px;">Enviado via Plataforma IFT WebDeck</p>
    `;

    // Use Supabase's built-in email via the auth admin or a simple SMTP approach
    // For now, we'll use Resend-compatible fetch if RESEND_API_KEY is set,
    // otherwise log and return success for testing
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "IFT WebDeck <noreply@felicidadeparatodos.com.br>",
          to: ["admin@felicidadeparatodos.com.br"],
          subject: `Novo Lead: ${nome} — ${segmento || "Geral"}`,
          html,
          reply_to: email,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error("Resend error:", errBody);
        throw new Error(`Email service error: ${res.status}`);
      }
    } else {
      // Log the lead data when no email service is configured
      console.log("LEAD RECEIVED (no email service configured):", JSON.stringify(body, null, 2));
    }

    return new Response(
      JSON.stringify({ success: true, message: "Lead recebido com sucesso" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing lead:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
