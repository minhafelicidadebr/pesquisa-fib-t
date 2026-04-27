import { BookOpen } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export default function Academy() {
  return (
    <PlaceholderPage
      eyebrow="Educar"
      accent="gold"
      icon={BookOpen}
      title={
        <>
          Academy <span className="text-gradient-gold">gamificada</span> da Felicidade
        </>
      }
      subtitle="Trilhas conduzidas pela ciência do bem-estar, com missões de 5 minutos, IFT Coin, badges e níveis. Aprendizagem que acontece no fluxo do trabalho."
      roadmap={[
        { title: "9 trilhas científicas", description: "Forças VIA, PERMA+V, atenção plena, gratidão, autocompaixão, propósito, conexões, sono e energia." },
        { title: "Missões de 5 minutos", description: "Microaprendizagem aplicada com prática imediata. Spaced repetition para retenção real." },
        { title: "IFT Coin & economia interna", description: "Moeda simbólica privacy-first que reconhece progresso pessoal, sem ranking público nem comparações tóxicas." },
        { title: "Badges e jornadas", description: "Conquistas ancoradas em comportamento sustentado (não em cliques), validadas por evidência científica." },
        { title: "Trilhas para gestores", description: "Faixa específica para liderança consciente, NR-1 prática e construção de cultura de bem-estar." },
        { title: "Certificação institucional", description: "Certificado IFT chancelado para portfólio profissional e ESG corporativo." },
      ]}
    />
  );
}
