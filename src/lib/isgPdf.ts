/**
 * Relatório individual ISG em PDF.
 *
 * Consome EXATAMENTE o mesmo objeto de resultado exibido na tela — nenhum
 * número é recalculado aqui. `jspdf` é carregado sob demanda (lazy) para não
 * pesar na home nem nas demais rotas.
 */

import { ISG_CONTACT, ISG_LOGO_FALLBACK } from "@/config/isg";
import { formatIsgDate, type IsgResult } from "@/lib/isgResult";

const NAVY = [16, 42, 67] as const;
const GRAY = [110, 120, 132] as const;

async function loadLogo(): Promise<string | null> {
  try {
    const res = await fetch(ISG_LOGO_FALLBACK, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateIsgPdf(result: IsgResult): Promise<void> {
  const { default: JsPDF } = await import("jspdf");
  const doc = new JsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 56;
  const date = formatIsgDate(result.completedAt);
  const logo = await loadLogo();

  const footer = () => {
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text("ISG — Brasília — DF", M, H - 32);
  };

  // ---------- Capa ----------
  if (logo) {
    try {
      doc.addImage(logo, "PNG", M, M, 150, 51); // proporção 1024x348 preservada
    } catch { /* segue sem logo */ }
  }
  doc.setTextColor(...NAVY);
  doc.setFontSize(30);
  doc.text("Pesquisa FIB-T", M, 230);
  doc.setFontSize(15);
  doc.setTextColor(...GRAY);
  doc.text("Relatório Individual", M, 258);
  doc.setFontSize(11);
  doc.text(`Data da realização: ${date}`, M, 292);
  doc.setDrawColor(220, 224, 230);
  doc.line(M, 320, W - M, 320);
  doc.setFontSize(10);
  doc.text(
    doc.splitTextToSize(
      "Leitura individual para reflexão sobre sua experiência no trabalho. Instrumento de pesquisa e autoconhecimento — não constitui diagnóstico clínico.",
      W - M * 2,
    ),
    M,
    346,
  );
  footer();

  // ---------- Resultado ----------
  doc.addPage();
  let y = M;
  doc.setTextColor(...NAVY);
  doc.setFontSize(18);
  doc.text("Resultado global", M, y);
  y += 30;
  doc.setFontSize(40);
  doc.text(`${result.globalScore.toFixed(1)}`, M, y);
  doc.setFontSize(11);
  doc.setTextColor(...GRAY);
  doc.text("de 100", M + 90, y);
  y += 34;

  const block = (title: string, cells: Record<string, { score: number; max: number; label: string }>) => {
    doc.setFontSize(14);
    doc.setTextColor(...NAVY);
    doc.text(title, M, y);
    y += 18;
    doc.setFontSize(10);
    Object.values(cells).forEach((cell) => {
      if (y > H - 80) { footer(); doc.addPage(); y = M; }
      doc.setTextColor(...GRAY);
      doc.text(cell.label, M, y);
      doc.text(`${cell.score.toFixed(2)} / ${cell.max}`, W - M, y, { align: "right" });
      const barW = (W - M * 2) * (cell.score / cell.max);
      doc.setFillColor(232, 236, 241);
      doc.rect(M, y + 4, W - M * 2, 4, "F");
      doc.setFillColor(...NAVY);
      if (barW > 0) doc.rect(M, y + 4, barW, 4, "F");
      y += 22;
    });
    y += 12;
  };

  block("Fatores", result.factors);
  block("Domínios", result.domains);

  // ---------- Explicação / recomendações ----------
  if (y > H - 200) { footer(); doc.addPage(); y = M; }
  const para = (title: string, text: string) => {
    if (!text) return;
    if (y > H - 120) { footer(); doc.addPage(); y = M; }
    doc.setFontSize(14);
    doc.setTextColor(...NAVY);
    doc.text(title, M, y);
    y += 18;
    doc.setFontSize(10);
    doc.setTextColor(...GRAY);
    const lines = doc.splitTextToSize(text, W - M * 2);
    doc.text(lines, M, y);
    y += lines.length * 13 + 14;
  };

  para("Explicação", result.summary);
  if (result.recommendations.length) {
    para(
      "Recomendações",
      result.recommendations
        .map((r) => `• ${[r.domain, r.action].filter(Boolean).join(" — ")}`)
        .join("\n"),
    );
  }
  para(
    "Nota metodológica",
    result.limitations ??
      "Resultado de autopercepção em um único momento no tempo, calculado pelo motor determinístico do FIB-T. Não permite conclusão causal e não substitui avaliação profissional.",
  );
  para(
    "Contatos ISG",
    `${ISG_CONTACT.name}\n${ISG_CONTACT.phone}\n${ISG_CONTACT.email}\n${ISG_CONTACT.addressLines.join(" · ")}`,
  );
  footer();

  doc.save("relatorio-fibt-isg.pdf");
}
