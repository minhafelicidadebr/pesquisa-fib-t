/**
 * Relatório Executivo agregado ISG em PDF.
 *
 * Consome EXATAMENTE o mesmo objeto agregado exibido no dashboard — nenhum
 * número é recalculado aqui (dashboard = PDF). `jspdf` é carregado sob demanda.
 * Nenhuma resposta individual entra no documento.
 */

import { FIBT_CITATION, ISG_CONTACT } from "@/config/isg";
import {
  buildQuestionRows,
  extremes,
  LIKERT_COLUMNS,
  type IsgAggregate,
} from "@/lib/isgAggregate";
import {
  drawFooter,
  drawGauge,
  drawLikertLegend,
  drawLikertStack,
  drawMeterRow,
  drawParagraph,
  drawRadar,
  drawSectionTitle,
  formatLongDate,
  GRAY,
  GUTTER,
  layoutOf,
  loadIsgLogo,
  NAVY,
  RULE,
} from "@/lib/isgPdfKit";

const FOOTER_NOTE = "ISG — Brasília — DF · Documento agregado, sem dados individuais";

export async function generateIsgAggregatePdf(agg: IsgAggregate): Promise<void> {
  const { default: JsPDF } = await import("jspdf");
  const doc = new JsPDF({ unit: "pt", format: "a4" });
  const L = layoutOf(doc);
  const logo = await loadIsgLogo();
  const half = (L.CW - GUTTER) / 2;
  const rightX = L.M + half + GUTTER;

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
  doc.setFontSize(28);
  doc.text("Painel Executivo FIB-T", L.M, 248);
  doc.setFontSize(14);
  doc.setTextColor(...GRAY);
  doc.text("Visão agregada do pré-teste organizacional ISG", L.M, 274);

  if (!agg.suppressed && typeof agg.globalScore === "number") {
    drawGauge(
      doc,
      L.W - L.M - 90,
      300,
      74,
      agg.globalScore / 100,
      String(agg.globalScore),
      "de 100",
      "Resultado global agregado",
    );
  }

  let y = 340;
  doc.setFontSize(10);
  doc.setTextColor(...GRAY);
  [
    `Data de emissão: ${formatLongDate()}`,
    `Status da coleta: ${agg.status}`,
    `Última atualização: ${formatLongDate(agg.lastUpdatedAt)}`,
    agg.suppressed
      ? `Participações registradas: ${agg.nLabel ?? "—"}`
      : `Participações consideradas: ${agg.n}`,
  ].forEach((line) => {
    doc.text(line, L.M, y);
    y += 16;
  });
  newPage();

  /* ───────────────── Amostra insuficiente: encerra aqui ───────────────── */
  if (agg.suppressed) {
    y = drawSectionTitle(doc, L, L.M + 6, "Amostra insuficiente");
    drawParagraph(
      doc,
      L,
      y,
      `Para proteger a privacidade dos participantes, médias, distribuições, fatores e domínios ` +
        `só são apresentados a partir de ${agg.threshold} participações.`,
    );
    drawFooter(doc, L, FOOTER_NOTE);
    doc.save("painel-executivo-fibt-isg.pdf");
    return;
  }

  /* ──────────────── Página 2 — Fatores, Domínios, Radar ──────────────── */
  y = drawSectionTitle(doc, L, L.M + 6, "Fatores FIB-T", "Médias agregadas · escala 0 a 4");
  (agg.factors ?? []).forEach((f) => {
    y = drawMeterRow(doc, L.M, y, L.CW, f.label, f.mean, 4, 2);
  });

  y += 14;
  y = drawSectionTitle(doc, L, y, "Domínios FIB", "9 domínios agrupados nos 3 fatores");
  const radarCy = y + 118;
  drawRadar(
    doc,
    L.M + half / 2,
    radarCy,
    88,
    (agg.domains ?? []).map((d) => ({ label: d.label, value: d.mean })),
  );
  let yRight = y + 8;
  (agg.domains ?? []).forEach((d) => {
    yRight = drawMeterRow(doc, rightX, yRight, half, d.label, d.mean, 4, 2);
  });
  y = Math.max(radarCy + 118, yRight) + 16;

  if (y > L.H - 190) {
    newPage();
    y = L.M + 6;
  }
  y = drawSectionTitle(doc, L, y, "Leituras do grupo");
  const ef = extremes(agg.factors);
  const ed = extremes(agg.domains);
  if (ef) {
    y =
      drawParagraph(
        doc,
        L,
        y,
        `Entre os fatores observados, ${ef.highest.label} apresentou a maior média do grupo (${ef.highest.mean}) e ${ef.lowest.label} a menor média observada (${ef.lowest.mean}).`,
      ) + 8;
  }
  if (ed) {
    y =
      drawParagraph(
        doc,
        L,
        y,
        `Entre os domínios, ${ed.highest.label} apresentou a maior média observada (${ed.highest.mean}) e ${ed.lowest.label} a menor média observada (${ed.lowest.mean}).`,
      ) + 8;
  }
  drawParagraph(
    doc,
    L,
    y,
    `A amostra apresentou resultado global agregado de ${agg.globalScore} na escala 0 a 100, com ${agg.n} participações.`,
  );
  newPage();

  /* ───────────────── Página 3+ — Questões com distribuição ───────────────── */
  y = drawSectionTitle(doc, L, L.M + 6, "Resultados por questão", "Média agregada e distribuição");
  drawLikertLegend(doc, L.M, y, LIKERT_COLUMNS);
  y += 22;

  const rows = buildQuestionRows(agg.questions ?? []);
  rows.forEach((r) => {
    if (y > L.H - 110) {
      newPage();
      y = drawSectionTitle(doc, L, L.M + 6, "Resultados por questão", "continuação");
    }
    doc.setFontSize(8.5);
    doc.setTextColor(...NAVY);
    const label = doc.splitTextToSize(`${r.number}. ${r.text}`, L.CW - 56) as string[];
    label.forEach((line, i) => doc.text(line, L.M, y + i * 11));
    doc.setFontSize(9);
    doc.text(r.mean === null ? "—" : r.mean.toFixed(2), L.W - L.M, y, { align: "right" });
    y += label.length * 11 + 4;
    drawLikertStack(doc, L.M, y, L.CW, r.percentages);
    y += 18;
  });

  /* ───────────────────────────── Notas ───────────────────────────── */
  if (y > L.H - 200) {
    newPage();
    y = L.M + 6;
  } else {
    y += 10;
  }
  y = drawSectionTitle(doc, L, y, "Nota metodológica");
  y =
    drawParagraph(
      doc,
      L,
      y,
      "O FIB-T é instrumento de pesquisa e autoconhecimento. Não é diagnóstico, laudo ou avaliação clínica. " +
        "Os valores apresentados são médias descritivas de autopercepção em um único momento no tempo e não " +
        "sustentam conclusão causal. Uma questão isolada não deve ser interpretada como diagnóstico.",
    ) + 10;
  y = drawParagraph(doc, L, y, FIBT_CITATION, { size: 8.5 }) + 20;

  if (y > L.H - 170) {
    newPage();
    y = L.M + 6;
  }
  y = drawSectionTitle(doc, L, y, "Nota de privacidade");
  y =
    drawParagraph(
      doc,
      L,
      y,
      `Este relatório apresenta exclusivamente resultados agregados. Nenhum dado pessoal é coletado ou ` +
        `armazenado e nenhuma resposta individual pode ser recuperada. Resultados só são apresentados ` +
        `quando a amostra atinge o limiar mínimo de ${agg.threshold} participações.`,
    ) + 20;

  if (y > L.H - 140) {
    newPage();
    y = L.M + 6;
  }
  y = drawSectionTitle(doc, L, y, "Contatos ISG");
  y = drawParagraph(doc, L, y, `${ISG_CONTACT.phone} · ${ISG_CONTACT.email}`);
  drawParagraph(doc, L, y + 6, ISG_CONTACT.addressLines.join(" · "));

  drawFooter(doc, L, FOOTER_NOTE);
  doc.save("painel-executivo-fibt-isg.pdf");
}
