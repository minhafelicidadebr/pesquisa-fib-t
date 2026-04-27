import { FileBarChart } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export default function Relatorios() {
  return (
    <PlaceholderPage
      eyebrow="Comprovar"
      accent="cyan"
      icon={FileBarChart}
      title={
        <>
          Relatórios <span className="text-gradient-cyan">ESG, NR-1 & Impacto</span>
        </>
      }
      subtitle="Geração automatizada de relatórios com narrativa executiva, indicadores auditáveis e linkagem direta com GRI, SASB, ODS e a NR-1 brasileira."
      roadmap={[
        { title: "Relatório NR-1 pronto para auditoria", description: "Estrutura de identificação, avaliação e controle de riscos psicossociais conforme atualização 2024." },
        { title: "ESG Social com rastreabilidade", description: "Indicadores GRI 401-403, SASB Human Capital e métricas WELL Building Standard." },
        { title: "Mapa ODS de impacto", description: "Conexão dos resultados com ODS 3 (saúde), 8 (trabalho decente), 10 (redução das desigualdades)." },
        { title: "Relatórios para conselho", description: "Layouts premium para C-level com leitura em 5 minutos e drill-down sob demanda." },
        { title: "Exportação multi-formato", description: "PDF executivo, Excel auditável, dashboard ao vivo e API para integração com BI corporativo." },
        { title: "Versionamento e histórico", description: "Comparativos entre períodos com explicação automática das variações relevantes." },
      ]}
    />
  );
}
