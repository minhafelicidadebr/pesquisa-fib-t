/**
 * ISG PDF KIT — primitivas de composição e visualização vetorial para os
 * relatórios FIB-T.
 *
 * REGRA: nada aqui calcula escore. Recebe números prontos e desenha.
 * Toda a diagramação usa uma grade única com margens simétricas, para que
 * capa, seções, gráficos e rodapé compartilhem o mesmo eixo óptico.
 */

import type jsPDF from "jspdf";
import { FIBT_CITATION, ISG_LOGO_FALLBACK } from "@/config/isg";

export const NAVY = [16, 42, 67] as const;
export const NAVY_SOFT = [46, 96, 148] as const;
export const TEAL = [38, 132, 160] as const;
export const GRAY = [110, 120, 132] as const;
export const RULE = [223, 228, 234] as const;
export const TRACK = [235, 239, 244] as const;

/** Grade base — margens simétricas em todos os lados. */
export const M = 56;
export const GUTTER = 20;

export interface IsgPdfLayout {
  W: number;
  H: number;
  M: number;
  CW: number;
  colW: (cols: number, of?: number) => number;
}

export function layoutOf(doc: jsPDF): IsgPdfLayout {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const CW = W - M * 2;
  return {
    W,
    H,
    M,
    CW,
    colW: (cols, of = 2) => (CW - GUTTER * (of - 1)) * (cols / of) + GUTTER * (cols - 1),
  };
}

export async function loadIsgLogo(): Promise<string | null> {
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

export function formatLongDate(iso?: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

/* ───────────────────────────── moldura da página ───────────────────────────── */

export function drawFooter(doc: jsPDF, L: IsgPdfLayout, note: string) {
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.6);
  doc.line(L.M, L.H - M + 10, L.W - L.M, L.H - M + 10);
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text(note, L.M, L.H - M + 26);
  doc.text(FIBT_CITATION, L.W - L.M, L.H - M + 26, { align: "right" });
}

export function drawSectionTitle(doc: jsPDF, L: IsgPdfLayout, y: number, title: string, kicker?: string): number {
  if (kicker) {
    doc.setFontSize(7.5);
    doc.setTextColor(...TEAL);
    doc.text(kicker.toUpperCase(), L.M, y);
    y += 13;
  }
  doc.setFontSize(14);
  doc.setTextColor(...NAVY);
  doc.text(title, L.M, y);
  y += 9;
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.8);
  doc.line(L.M, y, L.W - L.M, y);
  return y + 20;
}

export function drawParagraph(
  doc: jsPDF,
  L: IsgPdfLayout,
  y: number,
  text: string,
  opts: { size?: number; width?: number; x?: number; leading?: number } = {},
): number {
  const size = opts.size ?? 9.5;
  const width = opts.width ?? L.CW;
  const x = opts.x ?? L.M;
  const leading = opts.leading ?? size * 1.45;
  doc.setFontSize(size);
  doc.setTextColor(...GRAY);
  const lines = doc.splitTextToSize(text, width) as string[];
  lines.forEach((line, i) => doc.text(line, x, y + i * leading));
  return y + lines.length * leading;
}

/* ─────────────────────────────── medidor radial ─────────────────────────────── */

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function strokeArc(
  doc: jsPDF,
  cx: number,
  cy: number,
  r: number,
  from: number,
  to: number,
  width: number,
  color: readonly [number, number, number],
) {
  if (to <= from) return;
  const steps = Math.max(2, Math.ceil((to - from) / 3));
  doc.setDrawColor(...color);
  doc.setLineWidth(width);
  doc.setLineCap("round");
  for (let i = 0; i < steps; i += 1) {
    const a = from + ((to - from) * i) / steps;
    const b = from + ((to - from) * (i + 1)) / steps;
    const p1 = polar(cx, cy, r, a);
    const p2 = polar(cx, cy, r, b);
    doc.line(p1.x, p1.y, p2.x, p2.y);
  }
  doc.setLineCap("butt");
}

/** Medidor radial de 270°, idêntico em leitura ao componente da tela. */
export function drawGauge(
  doc: jsPDF,
  cx: number,
  cy: number,
  r: number,
  ratio: number,
  valueText: string,
  scaleText: string,
  label: string,
) {
  const start = 135;
  const sweep = 270;
  const clamped = Math.max(0, Math.min(1, ratio));
  strokeArc(doc, cx, cy, r, start, start + sweep, 12, TRACK);
  strokeArc(doc, cx, cy, r, start, start + sweep * clamped, 12, NAVY_SOFT);

  doc.setTextColor(...NAVY);
  doc.setFontSize(30);
  doc.text(valueText, cx, cy + 4, { align: "center" });
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text(scaleText, cx, cy + 20, { align: "center" });
  doc.setFontSize(8);
  doc.text(label.toUpperCase(), cx, cy + r + 26, { align: "center" });
}

/* ───────────────────────────── radar de domínios ───────────────────────────── */

export interface RadarPoint {
  label: string;
  value: number;
}

/** Radar dos domínios na escala 0–max. Rótulos abreviados para não colidir. */
export function drawRadar(
  doc: jsPDF,
  cx: number,
  cy: number,
  r: number,
  points: RadarPoint[],
  max = 4,
) {
  const n = points.length;
  if (n < 3) return;
  const angleAt = (i: number) => -90 + (360 * i) / n;

  // anéis da grade
  doc.setLineWidth(0.5);
  doc.setDrawColor(...RULE);
  for (const frac of [0.25, 0.5, 0.75, 1]) {
    const ring = points.map((_, i) => polar(cx, cy, r * frac, angleAt(i)));
    for (let i = 0; i < n; i += 1) {
      const a = ring[i];
      const b = ring[(i + 1) % n];
      doc.line(a.x, a.y, b.x, b.y);
    }
  }
  // eixos
  points.forEach((_, i) => {
    const p = polar(cx, cy, r, angleAt(i));
    doc.line(cx, cy, p.x, p.y);
  });

  // polígono do resultado
  const vertices = points.map((p, i) =>
    polar(cx, cy, r * Math.max(0, Math.min(1, p.value / max)), angleAt(i)),
  );
  const deltas: [number, number][] = [];
  for (let i = 1; i < vertices.length; i += 1) {
    deltas.push([vertices[i].x - vertices[i - 1].x, vertices[i].y - vertices[i - 1].y]);
  }
  doc.setFillColor(46, 96, 148);
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(1.2);
  doc.setGState(doc.GState({ opacity: 0.22 }));
  doc.lines(deltas, vertices[0].x, vertices[0].y, [1, 1], "F", true);
  doc.setGState(doc.GState({ opacity: 1 }));
  doc.lines(deltas, vertices[0].x, vertices[0].y, [1, 1], "S", true);

  // vértices + rótulos
  doc.setFontSize(7);
  points.forEach((p, i) => {
    const v = vertices[i];
    doc.setFillColor(...NAVY);
    doc.circle(v.x, v.y, 1.8, "F");
    const lp = polar(cx, cy, r + 16, angleAt(i));
    doc.setTextColor(...GRAY);
    const align = Math.abs(lp.x - cx) < 6 ? "center" : lp.x > cx ? "left" : "right";
    const lines = doc.splitTextToSize(p.label, 78) as string[];
    lines.forEach((line, k) =>
      doc.text(line, lp.x, lp.y + k * 8.5, { align: align as "left" | "right" | "center" }),
    );
  });
}

/* ──────────────────────────── barras horizontais ──────────────────────────── */

export function drawMeterRow(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  label: string,
  value: number,
  max: number,
  decimals = 2,
): number {
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text(label, x, y);
  doc.setTextColor(...GRAY);
  doc.text(`${value.toFixed(decimals)} / ${max}`, x + width, y, { align: "right" });
  const barY = y + 6;
  doc.setFillColor(...TRACK);
  doc.roundedRect(x, barY, width, 5, 2.5, 2.5, "F");
  const w = width * Math.max(0, Math.min(1, value / max));
  if (w > 1) {
    doc.setFillColor(...NAVY_SOFT);
    doc.roundedRect(x, barY, w, 5, 2.5, 2.5, "F");
  }
  return barY + 20;
}

/** Barra empilhada da distribuição Likert (tons sequenciais de uma matiz). */
export function drawLikertStack(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  percentages: number[],
  height = 5,
) {
  const tones: Array<readonly [number, number, number]> = [
    [216, 226, 236],
    [176, 197, 217],
    [124, 158, 191],
    [72, 116, 158],
    [16, 42, 67],
  ];
  doc.setFillColor(...TRACK);
  doc.roundedRect(x, y, width, height, height / 2, height / 2, "F");
  let cursor = x;
  percentages.forEach((p, i) => {
    const w = (width * Math.max(0, p)) / 100;
    if (w <= 0) return;
    doc.setFillColor(...tones[i]);
    doc.rect(cursor, y, w, height, "F");
    cursor += w;
  });
}

export function drawLikertLegend(
  doc: jsPDF,
  x: number,
  y: number,
  labels: readonly string[],
) {
  const tones: Array<readonly [number, number, number]> = [
    [216, 226, 236],
    [176, 197, 217],
    [124, 158, 191],
    [72, 116, 158],
    [16, 42, 67],
  ];
  doc.setFontSize(7);
  let cursor = x;
  labels.forEach((l, i) => {
    doc.setFillColor(...tones[i]);
    doc.rect(cursor, y - 4.5, 5.5, 5.5, "F");
    doc.setTextColor(...GRAY);
    doc.text(l, cursor + 8.5, y);
    cursor += 8.5 + doc.getTextWidth(l) + 12;
  });
}
