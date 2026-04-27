import { Stethoscope } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export default function Diagnostico() {
  return (
    <PlaceholderPage
      eyebrow="Mensurar"
      accent="gold"
      icon={Stethoscope}
      title={
        <>
          Diagnóstico <span className="text-gradient-gold">FIB-T</span> conversacional
        </>
      }
      subtitle="32 questões científicas das 4 lentes (COPSOQ III, FIB-T, PERMA+V, VIA) em formato de conversa, com radar interativo, leitura executiva e plano 90-365 dias."
      ctaLabel="Testar agora com a FIBia"
      ctaTo="/fibia"
      roadmap={[
        { title: "Avaliação conversacional", description: "Questões adaptativas conduzidas pela FIBia, sem fadiga de formulário, com economia comportamental embutida." },
        { title: "Radar das 4 lentes", description: "Visualização premium dos índices COPSOQ, FIB-T, PERMA+V e VIA com benchmarks setoriais." },
        { title: "Leitura executiva automática", description: "Síntese narrativa para liderança em até 90 segundos: pontos fortes, riscos, prioridades, ROI estimado." },
        { title: "Plano 90-365 dias", description: "Roadmap acionável com intervenções priorizadas, responsáveis sugeridos e métricas de evolução." },
        { title: "Persistência por usuário", description: "Histórico salvo em conta autenticada para comparar diagnósticos no tempo e medir evolução real." },
        { title: "Exportação institucional", description: "Relatório PDF premium com a marca da organização para conselhos, comitês e ESG." },
      ]}
    />
  );
}
