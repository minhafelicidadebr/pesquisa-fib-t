import { useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import fibiaAvatar from "@/assets/fibia-avatar.png";

interface AnalysisResult {
  summary: string;
  domains: Record<string, { score: number; max: number; label: string }>;
  factors: Record<string, { score: number; label: string }>;
  strengths: string[];
  vulnerabilities: string[];
  recommendations: Array<{ domain: string; action: string; timeframe: string; driver_category: string }>;
  learning_trails: Array<{ title: string; description: string; priority: string }>;
  encouragement: string;
}

interface FibiaPdfExportProps {
  analysis: AnalysisResult;
}

const domainEmojis: Record<string, string> = {
  "Padrão de Vida": "🏠",
  "Educação": "📚",
  "Cultura": "🎭",
  "Bem-Estar Psicológico": "🧠",
  "Saúde": "💚",
  "Uso do Tempo": "⏰",
  "Vitalidade Comunitária": "🤝",
  "Meio Ambiente": "🌿",
  "Governança": "⚖️",
};

function getScoreColor(score: number): string {
  if (score >= 3) return "#22c55e";
  if (score >= 2) return "#FFBD0C";
  return "#ef4444";
}

function getScoreLabel(score: number): string {
  if (score >= 3.5) return "Excelente";
  if (score >= 3) return "Bom";
  if (score >= 2) return "Atenção";
  return "Crítico";
}

export function FibiaPdfExport({ analysis }: FibiaPdfExportProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const overallScore = Object.values(analysis.domains).reduce((acc, d) => acc + d.score, 0) / Object.values(analysis.domains).length;
  const dateStr = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const generatePdf = async () => {
    if (!printRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0B1220",
        logging: false,
        width: 794,
        windowWidth: 794,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 297;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Diagnostico-FIBia-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  const sortedDomains = Object.entries(analysis.domains).sort((a, b) => b[1].score - a[1].score);

  return (
    <>
      <button
        onClick={generatePdf}
        disabled={generating}
        className="border border-foreground/20 text-foreground/80 font-heading text-sm px-6 py-3 rounded-lg hover:bg-foreground/5 transition-colors flex items-center justify-center gap-2"
      >
        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {generating ? "Gerando PDF..." : "Baixar relatório PDF"}
      </button>

      {/* Hidden PDF Template */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <div
          ref={printRef}
          style={{
            width: "794px",
            fontFamily: "'Inter', 'Manrope', sans-serif",
            background: "linear-gradient(180deg, #0B1220 0%, #111827 100%)",
            color: "#F9FAFB",
            padding: "0",
          }}
        >
          {/* Cover Header */}
          <div style={{
            background: "linear-gradient(135deg, #0B1220 0%, #1F2430 50%, #0B1220 100%)",
            padding: "48px 48px 32px",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Decorative halos */}
            <div style={{
              position: "absolute",
              top: "-60px",
              right: "-40px",
              width: "200px",
              height: "200px",
              background: "radial-gradient(circle, rgba(255,189,12,0.15) 0%, transparent 70%)",
              borderRadius: "50%",
            }} />
            <div style={{
              position: "absolute",
              bottom: "-40px",
              left: "20%",
              width: "160px",
              height: "160px",
              background: "radial-gradient(circle, rgba(0,194,203,0.1) 0%, transparent 70%)",
              borderRadius: "50%",
            }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
              <div>
                <div style={{
                  fontSize: "10px",
                  letterSpacing: "3px",
                  color: "#FFBD0C",
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  marginBottom: "8px",
                }}>
                  INSTITUTO FELICIDADE PARA TODOS
                </div>
                <h1 style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #FFBD0C, #F59E0B)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  margin: "0 0 6px",
                  lineHeight: 1.2,
                }}>
                  Relatório de Felicidade
                </h1>
                <h2 style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#d1d5db",
                  margin: "0 0 4px",
                }}>
                  Diagnóstico FIB-T Personalizado
                </h2>
                <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
                  Gerado em {dateStr} • Análise por Inteligência Artificial
                </p>
              </div>
              <div style={{ textAlign: "center" as const }}>
                <img
                  src={fibiaAvatar}
                  alt="FIBia"
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    border: "3px solid rgba(255,189,12,0.4)",
                    boxShadow: "0 0 30px rgba(255,189,12,0.2)",
                  }}
                  crossOrigin="anonymous"
                />
                <p style={{ fontSize: "10px", color: "#FFBD0C", fontWeight: 700, marginTop: "4px" }}>FIBia</p>
              </div>
            </div>

            {/* Overall Score */}
            <div style={{
              marginTop: "24px",
              display: "flex",
              alignItems: "center",
              gap: "20px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "16px",
              padding: "20px 24px",
              border: "1px solid rgba(255,255,255,0.08)",
              position: "relative",
              zIndex: 1,
            }}>
              <div style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: `conic-gradient(${getScoreColor(overallScore)} ${(overallScore / 4) * 360}deg, rgba(255,255,255,0.08) 0deg)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "#111827",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column" as const,
                }}>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: getScoreColor(overallScore) }}>
                    {overallScore.toFixed(1)}
                  </span>
                  <span style={{ fontSize: "8px", color: "#9ca3af" }}>/4.0</span>
                </div>
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#F9FAFB", margin: "0 0 4px" }}>
                  Índice Geral de Felicidade: <span style={{ color: getScoreColor(overallScore) }}>{getScoreLabel(overallScore)}</span>
                </p>
                <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0, lineHeight: 1.5 }}>
                  Sua jornada de autoconhecimento é um ato de coragem. Este relatório foi gerado
                  com carinho pela FIBia para te ajudar a enxergar suas forças e encontrar caminhos
                  de crescimento com base em ciência.
                </p>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div style={{ padding: "32px 48px" }}>
            <div style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid rgba(255,255,255,0.06)",
              marginBottom: "32px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "linear-gradient(135deg, #FFBD0C, #F59E0B)" }} />
                <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>Sua Narrativa de Bem-Estar</h3>
              </div>
              <p style={{ fontSize: "12px", color: "#d1d5db", lineHeight: 1.8, margin: 0, fontStyle: "italic" as const }}>
                "{analysis.summary}"
              </p>
            </div>

            {/* 9 Domains Grid */}
            <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#FFBD0C" }}>📊</span> Meus 9 Domínios de Felicidade
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "12px",
              marginBottom: "32px",
            }}>
              {sortedDomains.map(([, val]) => (
                <div key={val.label} style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "12px",
                  padding: "16px",
                  border: `1px solid ${getScoreColor(val.score)}22`,
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "3px",
                    width: `${(val.score / 4) * 100}%`,
                    background: getScoreColor(val.score),
                    borderRadius: "3px",
                  }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <span style={{ fontSize: "20px" }}>{domainEmojis[val.label] || "📌"}</span>
                    <span style={{
                      fontSize: "18px",
                      fontWeight: 800,
                      color: getScoreColor(val.score),
                    }}>
                      {val.score.toFixed(1)}
                    </span>
                  </div>
                  <p style={{ fontSize: "11px", fontWeight: 600, margin: "0 0 2px", color: "#F9FAFB" }}>
                    {val.label}
                  </p>
                  <p style={{ fontSize: "9px", color: "#9ca3af", margin: 0 }}>
                    {getScoreLabel(val.score)}
                  </p>
                </div>
              ))}
            </div>

            {/* Strengths & Vulnerabilities */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
              <div style={{
                background: "rgba(34,197,94,0.06)",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid rgba(34,197,94,0.15)",
              }}>
                <h4 style={{ fontSize: "13px", fontWeight: 700, margin: "0 0 12px", color: "#22c55e" }}>
                  ✦ Minhas Potências
                </h4>
                <p style={{ fontSize: "10px", color: "#9ca3af", margin: "0 0 12px", lineHeight: 1.5 }}>
                  Estes são os pilares onde eu demonstro maior equilíbrio e satisfação — minha base sólida para construir mudanças:
                </p>
                {analysis.strengths.map((s, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    marginBottom: "6px",
                    background: "rgba(34,197,94,0.08)",
                    borderRadius: "8px",
                  }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                    <span style={{ fontSize: "11px", color: "#d1d5db" }}>{s}</span>
                  </div>
                ))}
              </div>

              <div style={{
                background: "rgba(245,158,11,0.06)",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid rgba(245,158,11,0.15)",
              }}>
                <h4 style={{ fontSize: "13px", fontWeight: 700, margin: "0 0 12px", color: "#f59e0b" }}>
                  ⚡ Onde Posso Crescer
                </h4>
                <p style={{ fontSize: "10px", color: "#9ca3af", margin: "0 0 12px", lineHeight: 1.5 }}>
                  Reconhecer vulnerabilidades é sinal de inteligência emocional. Aqui estão oportunidades de evolução:
                </p>
                {analysis.vulnerabilities.map((v, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    marginBottom: "6px",
                    background: "rgba(245,158,11,0.08)",
                    borderRadius: "8px",
                  }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />
                    <span style={{ fontSize: "11px", color: "#d1d5db" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div style={{ marginBottom: "32px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#00C2CB" }}>🗺️</span> Meu Plano de Ação Personalizado
                </h3>
                <p style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "12px", lineHeight: 1.5 }}>
                  A ciência do bem-estar mostra que pequenas ações consistentes geram grandes transformações.
                  Aqui estão recomendações personalizadas para a minha jornada:
                </p>
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                    padding: "14px 16px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "10px",
                    marginBottom: "8px",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <span style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: rec.timeframe === "7d" ? "rgba(34,197,94,0.15)" : rec.timeframe === "30d" ? "rgba(59,130,246,0.15)" : "rgba(168,85,247,0.15)",
                      color: rec.timeframe === "7d" ? "#22c55e" : rec.timeframe === "30d" ? "#3b82f6" : "#a855f7",
                      flexShrink: 0,
                      whiteSpace: "nowrap" as const,
                    }}>
                      {rec.timeframe === "7d" ? "7 dias" : rec.timeframe === "30d" ? "30 dias" : "90 dias"}
                    </span>
                    <div>
                      <p style={{ fontSize: "11px", color: "#d1d5db", margin: "0 0 3px", lineHeight: 1.5 }}>{rec.action}</p>
                      <p style={{ fontSize: "9px", color: "#6b7280", margin: 0 }}>{rec.domain} • {rec.driver_category}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Learning Trails */}
            {analysis.learning_trails.length > 0 && (
              <div style={{ marginBottom: "32px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  📚 Minhas Trilhas de Aprendizagem
                </h3>
                {analysis.learning_trails.map((trail, i) => (
                  <div key={i} style={{
                    padding: "14px 16px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "10px",
                    borderLeft: "3px solid #FFBD0C",
                    marginBottom: "8px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#F9FAFB" }}>{trail.title}</span>
                      <span style={{
                        fontSize: "8px",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: trail.priority === "high" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                        color: trail.priority === "high" ? "#ef4444" : "#f59e0b",
                      }}>
                        {trail.priority === "high" ? "Alta" : trail.priority === "medium" ? "Média" : "Baixa"}
                      </span>
                    </div>
                    <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0, lineHeight: 1.5 }}>{trail.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Encouragement */}
            <div style={{
              background: "linear-gradient(135deg, rgba(255,189,12,0.08), rgba(0,194,203,0.05))",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid rgba(255,189,12,0.15)",
              textAlign: "center" as const,
              marginBottom: "32px",
            }}>
              <p style={{ fontSize: "13px", color: "#d1d5db", lineHeight: 1.8, fontStyle: "italic" as const, margin: "0 0 8px" }}>
                "{analysis.encouragement}"
              </p>
              <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0 }}>— FIBia, sua assistente de bem-estar 🌻</p>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            background: "rgba(0,0,0,0.3)",
            padding: "24px 48px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#FFBD0C", margin: "0 0 2px" }}>
                  Instituto Felicidade para Todos
                </p>
                <p style={{ fontSize: "9px", color: "#6b7280", margin: 0 }}>
                  Programa Felicidade e Crescimento para Todos
                </p>
              </div>
              <div style={{ textAlign: "right" as const }}>
                <p style={{ fontSize: "9px", color: "#6b7280", margin: "0 0 2px" }}>
                  Impact HUB Brasília — SGAN 601, Asa Norte, Brasília/DF
                </p>
                <p style={{ fontSize: "9px", color: "#6b7280", margin: 0 }}>
                  (61) 3550-8779 • felicidadeparatodos.com.br
                </p>
              </div>
            </div>
            <div style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <p style={{ fontSize: "8px", color: "#4b5563", margin: 0 }}>
                © 2025 — Instituto Felicidade para Todos. Todos os direitos reservados.
              </p>
              <p style={{ fontSize: "8px", color: "#4b5563", margin: 0 }}>
                Referência: FURTADO, C. A. (2020) • Work-Wellbeing-Playbook 2.0 (Oxford/Indeed)
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
