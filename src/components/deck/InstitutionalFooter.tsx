import { Instagram, Globe, MapPin, Phone } from "lucide-react";

export function InstitutionalFooter() {
  return (
    <footer className="border-t border-foreground/10 bg-surface-dark">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Logo & mission */}
          <div>
            <img
              src="https://static.wixstatic.com/media/575677_386e5f9273d14adf9b36d5a87a5207b8~mv2.png/v1/crop/x_0,y_758,w_2400,h_884/fill/w_248,h_91,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/2.png"
              alt="Instituto Felicidade para Todos"
              className="h-12 mb-4"
            />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Programa Felicidade e Crescimento para Todos — ciência, tecnologia e impacto a serviço do bem-estar organizacional.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-foreground text-sm uppercase tracking-wider">Contato</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-brand-gold shrink-0" />
                <span>Impact HUB Brasília - SGAN 601, Lote H Edifício Íon, Ala Amarela, Asa Norte, Brasília/DF</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-gold" />
                <span>(61) 3550-8779</span>
              </div>
            </div>
          </div>

          {/* Links & QR */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-foreground text-sm uppercase tracking-wider">Canais</h4>
            <div className="flex gap-4">
              <a
                href="https://www.felicidadeparatodos.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-gold transition-colors"
              >
                <Globe className="w-4 h-4" />
                Website
              </a>
              <a
                href="https://www.instagram.com/felicidadeparatodosbr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-magenta transition-colors"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </a>
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">WhatsApp Institucional</p>
              <img
                src="https://static.wixstatic.com/media/575677_a847e9799fef4ac19fadf79d6cb85b88~mv2.png/v1/fill/w_838,h_838,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/qrcode%20whatsapp%20instituto.png"
                alt="QR Code WhatsApp"
                className="w-24 h-24 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-foreground/10 mt-12 pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 - Instituto Felicidade para Todos. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
