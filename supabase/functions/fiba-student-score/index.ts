import { createFibaHandler } from "../_shared/fiba-handler.ts";

const origins = (Deno.env.get("FIBA_ALLOWED_ORIGINS") ?? [
  "https://pesquisadefelicidade.com.br",
  "https://www.pesquisadefelicidade.com.br",
  "https://id-preview--d9387b69-66a4-423a-814e-9744580de58e.lovable.app",
  "https://d9387b69-66a4-423a-814e-9744580de58e.lovableproject.com",
].join(",")).split(",").map(v => v.trim()).filter(Boolean);

Deno.serve(createFibaHandler(origins));
