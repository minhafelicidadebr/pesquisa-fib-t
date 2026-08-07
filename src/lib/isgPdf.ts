/**
 * Relatório individual ISG em PDF — composição premium.
 *
 * Consome EXATAMENTE o mesmo objeto de resultado exibido na tela — nenhum
 * número é recalculado aqui. `jspdf` é carregado sob demanda (lazy).
 * A diagramação usa a grade simétrica de `isgPdfKit`.
 */

import { FIBT_CITATION, ISG_CONTACT } from "@/config/isg";
import { formatIsgDate, type IsgResult } from "@/lib/isgResult";
import {
  drawFooter,
  drawGauge,
  drawMeterRow,
  drawParagraph,
  drawRadar,
  drawSectionTitle,
  GRAY,
  GUTTER,
  layoutOf,
  loadIsgLogo,
  NAVY,
  RULE,
} from "@/lib/isgPdfKit";

const FOOTER_NOTE = "ISG — Brasília — DF · Relatório individual de autopercepção";

export async function generateIsgPdf(result: IsgResult): Promise<void> {
  const { default: JsPDF } = await import("jspdf");
  const doc = new JsPDF({ unit: "pt", format: "a4" });
  const L = layoutOf(doc);
  const logo = await loadIsgLogo();
  const date = formatIsgDate(result.completedAt);
  const factors = Object.values(result.factors ?? {});
  const domains = Object.values(result.domains ?? {});
  const half = (L.CW - GUTTER) / 2;

  const newPage = () => {
    drawFooter(doc, L, FOOTER_NOTE);
    doc.addPage();
  };

  /* ───────────────────────────── Capa ───────────────────────────── */
  if (logo) {
    try {
      doc.addImage(logo, "PNG", L.M, L.M, 150, 51);
    } catch { /* segue sem logo */ }
  }
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.8);
  doc.line(L.M, L.M + 78, L.W - L.M, L.M + 78);

  doc.setTextColor(...NAVY);
  doc.setFontSize(30);
  doc.text("Pesquisa FIB-T", L.M, 248);
  doc.setFontSize(15);
  doc.setTextColor(...GRAY);
  doc.text("Relatório Individual", L.M, 274);

  drawGauge(doc, L.W - L.M - 90, 300, 74, result.globalScore / 100, result.globalScore.toFixed(1), "de 100", "Resultado global");

  let y = 340;
  doc.setFontSize(10);
  doc.setTextColor(...GRAY);
  doc.text(`Data da realização: ${date}`, L.M, y);
  y += 16;
  doc.text(`Escala do instrumento: 0 a 4 · 32 itens · 3 fatores · 9 domínios`, L.M, y);
  y += 30;
  doc.setDrawColor(...RULE);
  doc.line(L.M, y, L.W - L.M, y);
  y += 24;
  y = drawParagraph(
    doc,
    L,
    y,
    "Leitura individual para reflexão sobre sua experiência no trabalho. Instrumento de pesquisa e autoconhecimento — não constitui diagnóstico clínico nem avaliação de desempenho.",
    { width: half * 1.6 },
  );
  newPage();

  /* ──────────────────── Página 2 — Fatores e Domínios ──────────────────── */
  y = drawSectionTitle(doc, L, L.M + 6, "Fatores FIB-T", "Escala 0 a 4");
  y = drawParagraph(
    doc,
    L,
    y,
    "O escore FIB-T é obtido a partir das médias dos três Fatores avaliados: Padrão de Vida, Bem-Estar e Satisfação com a Empresa.",
  );
  y += 18;
  factors.forEach((f) => {
    y = drawMeterRow(doc, L.M, y, L.CW, f.label, f.score, f.max);
  });

  y += 14;
  y = drawSectionTitle(doc, L, y, "Domínios FIB", "9 domínios agrupados nos 3 fatores");

  const radarCx = L.M + half / 2 - 16;
  const radarCy = y + 118;
  drawRadar(
    doc,
    radarCx,
    radarCy,
    74,
    domains.map((d) => ({ label: d.label, value: d.score })),
    domains[0]?.max ?? 4,
  );

  let yRight = y + 8;
  const rightX = L.M + half + GUTTER;
  domains.forEach((d) => {
    yRight = drawMeterRow(doc, rightX, yRight, half, d.label, d.score, d.max);
  });

  y = Math.max(radarCy + 118, yRight) + 10;
  newPage();

  /* ──────────────────── Página 3 — Leituras e notas ──────────────────── */
  y = L.M + 6;

  if (result.summary) {
    y = drawSectionTitle(doc, L, y, "Leitura do resultado");
    y = drawParagraph(doc, L, y, result.summary);
    y += 22;
  }

  if (result.strengths.length || result.vulnerabilities.length) {
    y = drawSectionTitle(doc, L, y, "Dimensões observadas");
    const colTop = y;
    let yA = colTop;
    let yB = colTop;
    const listCol = (
      x: number,
      startY: number,
      title: string,
      items: string[],
    ): number => {
      let cursor = startY;
      doc.setFontSize(9.5);
      doc.setTextColor(...NAVY);
      doc.text(title, x, cursor);
      cursor += 16;
      items.forEach((item) => {
        doc.setFillColor(...NAVY);
        doc.circle(x + 2, cursor - 3, 1.6, "F");
        cursor = drawParagraph(doc, L, cursor, item, { x: x + 10, width: half - 10, size: 9 }) + 8;
      });
      return cursor;
    };
    if (result.strengths.length) yA = listCol(L.M, colTop, "Mais favoráveis", result.strengths);
    if (result.vulnerabilities.length)
      yB = listCol(rightX, colTop, "Pontos de atenção", result.vulnerabilities);
    y = Math.max(yA, yB) + 18;
  }

  if (result.recommendations.length) {
    y = drawSectionTitle(doc, L, y, "Caminhos de reflexão");
    result.recommendations.forEach((r) => {
      if (y > L.H - 140) {
        newPage();
        y = L.M + 6;
      }
      const text = [r.domain, r.action].filter(Boolean).join(" — ");
      doc.setFillColor(...NAVY);
      doc.circle(L.M + 2, y - 3, 1.6, "F");
      y = drawParagraph(doc, L, y, text, { x: L.M + 12, width: L.CW - 12 }) + 10;
    });
    y += 12;
  }

  if (y > L.H - 190) {
    newPage();
    y = L.M + 6;
  }
  y = drawSectionTitle(doc, L, y, "Nota metodológica");
  y = drawParagraph(
    doc,
    L,
    y,
    result.limitations ??
      "Resultado de autopercepção em um único momento no tempo, calculado pelo motor determinístico do FIB-T. Não permite conclusão causal e não substitui avaliação profissional.",
  );
  y += 12;
  y = drawParagraph(doc, L, y, FIBT_CITATION, { size: 8.5 });
  y += 22;

  if (y > L.H - 150) {
    newPage();
    y = L.M + 6;
  }
  y = drawSectionTitle(doc, L, y, "Contatos ISG");
  y = drawParagraph(
    doc,
    L,
    y,
    `${ISG_CONTACT.name} · ${ISG_CONTACT.phone} · ${ISG_CONTACT.email}`,
    { width: half * 1.7 },
  );
  drawParagraph(doc, L, y + 6, ISG_CONTACT.addressLines.join(" · "), { width: half * 1.7 });

  drawFooter(doc, L, FOOTER_NOTE);
  doc.save("relatorio-fibt-isg.pdf");
}
