/**
 * Configuração da experiência piloto ISG.
 *
 * Esta camada é APENAS de configuração/apresentação. Não redefine metodologia,
 * não recalcula escore e não contém o código de acesso (que vive no servidor).
 */

/**
 * Feature flag de UI. `VITE_ISG_PILOT_ENABLED="false"` desativa a rota /isg.
 * Observação de entrega: o `.env` deste projeto é gerado automaticamente e não
 * pode ser editado pelo agente, então o piloto vem habilitado por padrão e é
 * desligável pela variável. A flag controla somente a UI — o Access Gate
 * server-side continua sendo a barreira real.
 */
export const ISG_PILOT_ENABLED =
  String(import.meta.env.VITE_ISG_PILOT_ENABLED ?? "true").toLowerCase() !== "false";

/** Enquanto true, o ambiente piloto ISG fica habilitado. */
export const ISG_PILOT_MODE = true;

export const ISG_LOGO_SVG =
  "https://www.isgsa.com.br/wp-content/uploads/2025/03/logo-isgsa-svg-2025.svg";

export const ISG_LOGO_FALLBACK =
  "https://i0.wp.com/www.isgsa.com.br/wp-content/uploads/2026/06/2026_BR_Centro_Oeste_c.logo_-scaled.png?resize=1024%2C348&ssl=1";

export const ISG_CONTACT = {
  name: "ISG",
  phone: "+55 61 3327-3777",
  email: "comercial@isgsa.com.br",
  addressLines: [
    "SCN, Quadra 4, Edifício Empresarial Varig",
    "Bloco B, Sala 1004",
    "Asa Norte — Brasília — DF",
    "CEP 70.714-900",
  ],
} as const;

/**
 * Referência obrigatória do instrumento. Deve aparecer na pesquisa, nos
 * dashboards e em todos os PDFs gerados.
 */
export const FIBT_CITATION =
  "REFERÊNCIA PARA CITAÇÃO: FURTADO, C. A. (2020)" as const;

/** Escala Likert oficial do instrumento (0 a 4), conforme documento-fonte. */
export const FIBT_SCALE_MAX = 4 as const;


/** Eventos de analytics permitidos — sempre sem payload sensível. */
export type IsgAnalyticsEvent =
  | "isg_pilot_opened"
  | "isg_survey_started"
  | "isg_survey_completed"
  | "isg_pdf_downloaded";

/**
 * Emite evento apenas se já existir plataforma de analytics no runtime.
 * Nunca envia respostas, escores, código de acesso ou dados pessoais.
 */
export function trackIsg(event: IsgAnalyticsEvent) {
  const w = window as unknown as { dataLayer?: unknown[] };
  if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event });
}
