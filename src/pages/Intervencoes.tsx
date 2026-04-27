import { Activity } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export default function Intervencoes() {
  return (
    <PlaceholderPage
      eyebrow="Transformar"
      accent="magenta"
      icon={Activity}
      title={
        <>
          Intervenções <span className="text-gradient-magenta">baseadas em evidência</span>
        </>
      }
      subtitle="Catálogo curado de práticas validadas em meta-análises Oxford, com instruções claras, métricas de adesão e medição de impacto antes/depois."
      roadmap={[
        { title: "Catálogo de práticas", description: "Mais de 60 intervenções organizacionais e individuais com evidência sistematizada." },
        { title: "Prescrição inteligente", description: "Recomendações personalizadas a partir do diagnóstico FIB-T e do contexto setorial." },
        { title: "Protocolos prontos para usar", description: "Roteiros, scripts, materiais e KPIs para cada intervenção, do piloto à escala." },
        { title: "Medição de impacto", description: "Comparativo antes/depois com significância estatística e narrativa executiva." },
        { title: "Comunidade de prática", description: "Casos reais, lições aprendidas e adaptações por setor, anônimas e curadas." },
        { title: "Integração com Academy", description: "Cada intervenção conectada a trilhas formativas para sustentar a mudança no tempo." },
      ]}
    />
  );
}
