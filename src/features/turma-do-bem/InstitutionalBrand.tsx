import type { ReactNode } from "react";
import { ArrowUpRight, Instagram, MapPin, MessageCircle } from "lucide-react";
import { FIBA_BRAND as brand } from "./brand";

type LinkProps = { href: string; className?: string; label?: string; children: ReactNode };

function InstitutionalLink({ href, className, label, children }: LinkProps) {
  return <a href={href} className={className} target="_blank" rel="noopener noreferrer" aria-label={label ? `${label} (abre em nova aba)` : undefined}>
    {children}<span className="sr-only"> (abre em nova aba)</span>
  </a>;
}

export function FibaInstitutionalHeader({ action }: { action: ReactNode }) {
  return <header className="tdb-header">
    <div className="tdb-header-inner">
      <div className="tdb-brand-lockup">
        <InstitutionalLink href={brand.website} className="tdb-institute-link" label={`Site do ${brand.instituteName}`}>
          <img className="tdb-institute-logo" src={brand.assets.iftFull} width={1198} height={481} alt={brand.instituteName} decoding="async" />
        </InstitutionalLink>
        <span className="tdb-brand-divider" aria-hidden="true" />
        <InstitutionalLink href={brand.project} className="tdb-project-link" label="Conheça o projeto Dentista do Bem da Turma do Bem">
          <span className="tdb-brand-label">CONTEXTO DO PROJETO</span>
          <img className="tdb-project-logo" src={brand.assets.turmaDoBem} width={159} height={90} alt="Turma do Bem" decoding="async" />
        </InstitutionalLink>
      </div>
      <div className="tdb-header-actions"><span className="tdb-product-tag">FIB-A</span>{action}</div>
    </div>
  </header>;
}

export function FibaInstitutionalFooter() {
  return <footer className="tdb-institutional-footer" aria-label="Instituto e projeto">
    <div className="tdb-footer-inner">
      <div className="tdb-footer-about">
        <InstitutionalLink href={brand.website} className="tdb-footer-institute-link" label={brand.instituteName}>
          <img className="tdb-footer-logo" src={brand.assets.iftHorizontal} width={223} height={55} alt={brand.instituteName} loading="lazy" decoding="async" />
        </InstitutionalLink>
        <p>{brand.mission}</p>
        <InstitutionalLink href={brand.contact} className="tdb-button tdb-button-gold"><MessageCircle size={18} aria-hidden="true" />{brand.contactLabel}<ArrowUpRight size={16} aria-hidden="true" /></InstitutionalLink>
      </div>
      <div className="tdb-footer-contact">
        <h2>Vamos conversar.</h2>
        <address><MapPin size={19} aria-hidden="true" /><span>{brand.address}</span></address>
        <InstitutionalLink href={brand.instagram} className="tdb-footer-link"><Instagram size={18} aria-hidden="true" />{brand.instagramLabel}<ArrowUpRight size={15} aria-hidden="true" /></InstitutionalLink>
        <InstitutionalLink href={brand.website} className="tdb-footer-link">{brand.websiteLabel}<ArrowUpRight size={15} aria-hidden="true" /></InstitutionalLink>
      </div>
      <div className="tdb-footer-project">
        <span className="tdb-brand-label">CONTEXTO DESTA EXPERIÊNCIA</span>
        <InstitutionalLink href={brand.project} className="tdb-footer-project-mark" label="Projeto Dentista do Bem da Turma do Bem">
          <img className="tdb-footer-project-logo" src={brand.assets.turmaDoBem} width={159} height={90} alt="Turma do Bem" loading="lazy" decoding="async" />
        </InstitutionalLink>
        <p>Um olhar para o bem-estar na vida estudantil.</p>
        <InstitutionalLink href={brand.project} className="tdb-footer-link">{brand.projectLabel}<ArrowUpRight size={16} aria-hidden="true" /></InstitutionalLink>
      </div>
      <div className="tdb-footer-bottom">
        <span>FIB-A · 29 perguntas · 9 domínios</span>
        <p>{brand.closingInvitation}</p>
        <span>Links externos abrem em uma nova aba.</span>
      </div>
    </div>
  </footer>;
}
