/**
 * Relatório Executivo agregado ISG em PDF.
 *
 * Consome EXATAMENTE o mesmo objeto agregado exibido no dashboard — nenhum
 * número é recalculado aqui (dashboard = PDF). `jspdf` é carregado sob demanda.
 * Nenhuma resposta individual entra no documento.
 */

import { ISG_CONTACT, ISG_LOGO_FALLBACK } from "@/config/isg";
import {
  buildQuestionRows,
  extremes,
  LIKERT_COLUMNS,
  type IsgAggregate,
} from "@/lib/isgAggregate";

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

function formatDate(iso?: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export async function generateIsgAggregatePdf(agg: IsgAggregate): Promise<void> {
  const { default: JsPDF } = await import("jspdf");
  const doc = new JsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 56;
  const logo = await loadLogo();
  let y = M;

  const footer = () => {
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text("ISG — Brasília — DF · Documento agregado, sem dados individuais", M, H - 32);
  };

  const ensure = (needed: number) => {
    if (y + needed > H - 64) {
      footer();
      doc.addPage();
      y = M;
    }
  };

  const heading = (text: string) => {
    ensure(46);
    doc.setTextColor(...NAVY);
    doc.setFontSize(14);
    doc.text(text, M, y);
    y += 8;
    doc.setDrawColor(220, 224, 230);
    doc.line(M, y, W - M, y);
    y += 18;
  };

  const body = (text: string, size = 10) => {
    doc.setFontSize(size);
    doc.setTextColor(...GRAY);
    const lines = doc.splitTextToSize(text, W - M * 2) as string[];
    for (const line of lines) {
      ensure(16);
      doc.text(line, M, y);
      y += 14;
    }
    y += 6;
  };

  // ---------- Capa ----------
  if (logo) {
    try {
      doc.addImage(logo, "PNG", M, M, 150, 51);
    } catch { /* segue sem logo */ }
  }
  doc.setTextColor(...NAVY);
  doc.setFontSize(28);
  doc.text("Painel Executivo FIB-T", M, 230);
  doc.setFontSize(14);
  doc.setTextColor(...GRAY);
  doc.text("Visão agregada do pré-teste organizacional ISG", M, 256);
  doc.setFontSize(11);
  doc.text(`Data de emissão: ${formatDate()}`, M, 292);
  doc.text(`Status da coleta: ${agg.status}`, M, 310);
  doc.text(`Última atualização: ${formatDate(agg.lastUpdatedAt)}`, M, 328);
  footer();
  doc.addPage();
  y = M;

  // ---------- Panorama ----------
  heading("Panorama");
  body(`Participações consideradas: ${agg.n}`);
  body(`Resultado global agregado: ${agg.globalScore} (escala 0 a 100)`);

  // ---------- Fatores ----------
  heading("Fatores FIB-T (escala 0 a 4)");
  for (const f of agg.factors ?? []) {
    ensure(16);
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    doc.text(f.label, M, y);
    doc.text(String(f.mean), W - M, y, { align: "right" });
    y += 15;
  }
  y += 8;

  // ---------- Domínios ----------
  heading("Domínios FIB-T (escala 0 a 4)");
  for (const d of agg.domains ?? []) {
    ensure(16);
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    doc.text(d.label, M, y);
    doc.text(String(d.mean), W - M, y, { align: "right" });
    y += 15;
  }
  y += 8;

  // ---------- Leituras do grupo ----------
  heading("Leituras do grupo");
  const ef = extremes(agg.factors);
  const ed = extremes(agg.domains);
  if (ef) {
    body(
      `Entre os fatores observados, ${ef.highest.label} apresentou a maior média do grupo (${ef.highest.mean}) e ${ef.lowest.label} a menor média observada (${ef.lowest.mean}).`,
    );
  }
  if (ed) {
    body(
      `Entre os domínios, ${ed.highest.label} apresentou a maior média observada (${ed.highest.mean}) e ${ed.lowest.label} a menor média observada (${ed.lowest.mean}).`,
    );
  }

  // ---------- Questões ----------
  heading("Resultados por questão (média agregada)");
  const rows = buildQuestionRows(agg.questions ?? []);
  doc.setFontSize(8);
  for (const r of rows) {
    ensure(26);
    doc.setTextColor(...NAVY);
    const label = doc.splitTextToSize(`${r.number}. ${r.text}`, W - M * 2 - 60) as string[];
    doc.text(label, M, y);
    doc.text(r.mean === null ? "—" : String(r.mean), W - M, y, { align: "right" });
    y += label.length * 10;
    doc.setTextColor(...GRAY);
    doc.text(
      LIKERT_COLUMNS.map((l, i) => `${l}: ${r.percentages[i]}%`).join("  ·  "),
      M,
      y,
    );
    y += 16;
  }
  y += 10;

  // ---------- Notas ----------
  heading("Nota metodológica");
  body(
    "O FIB-T é instrumento de pesquisa e autoconhecimento, referência FURTADO, C. A. (2020). " +
      "Não é diagnóstico, laudo ou avaliação clínica. Os valores apresentados são médias descritivas " +
      "de autopercepção em um único momento no tempo e não sustentam conclusão causal. " +
      "Uma questão isolada não deve ser interpretada como diagnóstico.",
  );

  heading("Nota de privacidade");
  body(
    `Este relatório apresenta exclusivamente resultados agregados. Nenhum dado pessoal é coletado ou ` +
      `armazenado e nenhuma resposta individual pode ser recuperada. Resultados só são apresentados ` +
      `quando a amostra atinge o limiar mínimo de ${agg.threshold} participações.`,
  );

  heading("Contatos ISG");
  body(`${ISG_CONTACT.phone} · ${ISG_CONTACT.email}`);
  body(ISG_CONTACT.addressLines.join(" · "));

  footer();
  doc.save("painel-executivo-fibt-isg.pdf");
}
