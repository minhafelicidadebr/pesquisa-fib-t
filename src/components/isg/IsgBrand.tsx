import { useState } from "react";
import {
  FIBT_CITATION,
  ISG_CONTACT,
  ISG_LOGO_FALLBACK,
  ISG_LOGO_SVG,
  ISG_PILOT_MODE,
} from "@/config/isg";

/** Referência obrigatória de citação do instrumento FIB-T. */
export function IsgCitation({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[11px] uppercase tracking-[0.12em] text-muted-foreground ${className}`}>
      {FIBT_CITATION}
    </p>
  );
}


/** Logo institucional com fallback e proporção preservada (object-contain). */
export function IsgLogo({ className = "h-9" }: { className?: string }) {
  const [src, setSrc] = useState(ISG_LOGO_SVG);
  return (
    <img
      src={src}
      onError={() => src !== ISG_LOGO_FALLBACK && setSrc(ISG_LOGO_FALLBACK)}
      alt="ISG"
      className={`${className} w-auto object-contain`}
      loading="lazy"
      decoding="async"
    />
  );
}

export function IsgPilotBadge() {
  if (!ISG_PILOT_MODE) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
      Ambiente de pré-teste ISG
    </span>
  );
}

export function IsgFooter() {
  return (
    <footer className="mt-16 border-t border-border pt-8 text-sm text-muted-foreground">
      <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:grid-cols-3">
        <div>
          <IsgLogo className="h-7" />
          <p className="mt-3 text-xs leading-relaxed">
            Pesquisa FIB-T — experiência institucional de reflexão sobre felicidade e
            bem-estar no contexto de trabalho.
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">Contato</p>
          <p>{ISG_CONTACT.phone}</p>
          <a className="underline-offset-4 hover:underline" href={`mailto:${ISG_CONTACT.email}`}>
            {ISG_CONTACT.email}
          </a>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">Matriz</p>
          <address className="not-italic text-xs leading-relaxed">
            {ISG_CONTACT.addressLines.map((l) => (
              <span key={l} className="block">{l}</span>
            ))}
          </address>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-5xl space-y-1.5 px-4 pb-8">
        <p className="text-xs">ISG — Brasília — DF</p>
        <IsgCitation />
      </div>

    </footer>
  );
}
