import { LayoutDashboard } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export default function Dashboard() {
  return (
    <PlaceholderPage
      eyebrow="Evoluir"
      accent="cyan"
      icon={LayoutDashboard}
      title={
        <>
          Painel pessoal & <span className="text-gradient-cyan">organizacional</span>
        </>
      }
      subtitle="Visualize sua jornada FIB e a saúde da organização em tempo real, com privacidade-by-design, agregação k-anônima e benchmarks setoriais auditáveis."
      roadmap={[
        { title: "Visão pessoal protegida", description: "Cada colaborador vê apenas seus indicadores, evolução e conquistas. Privacidade absoluta, alinhada à LGPD." },
        { title: "Visão organizacional agregada", description: "Gestores acessam apenas grupos com k≥7 respondentes, sem qualquer identificação individual." },
        { title: "FIB Score em tempo real", description: "Composto a partir das 4 lentes, com decomposição por domínio (psicossocial, propósito, forças, conexões)." },
        { title: "Heatmap NR-1 de risco psicossocial", description: "Mapa visual dos fatores COPSOQ III por área, com semáforo de criticidade e tendência temporal." },
        { title: "Comparativos setoriais", description: "Benchmarks anônimos com universo Oxford WWP 2.0 e dados consolidados do Instituto." },
        { title: "Alertas inteligentes", description: "Sinais antecipados de burnout, queda de engajamento e oportunidades de intervenção dirigidas." },
      ]}
    />
  );
}
