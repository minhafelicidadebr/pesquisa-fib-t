import { FIBA_VERSION, isReportableFiba, type FibaResult } from "@/domain/fiba";
import { FIBA_FORMAT as fmt, FIBA_METHOD_NOTE } from "@/features/turma-do-bem/content";
import { buildFibaNarrative, fibaCalculationOriginLabel } from "@/features/turma-do-bem/narrative";

import sansRegular from "@/features/turma-do-bem/fonts/LiberationSans-Regular.ttf?url";
import sansBold from "@/features/turma-do-bem/fonts/LiberationSans-Bold.ttf?url";
import serifRegular from "@/features/turma-do-bem/fonts/LiberationSerif-Regular.ttf?url";
import serifItalic from "@/features/turma-do-bem/fonts/LiberationSerif-Italic.ttf?url";

const fontSpecs = [
  [sansRegular, "sans-regular.ttf", "FibaSans", "normal"],
  [sansBold, "sans-bold.ttf", "FibaSans", "bold"],
  [serifRegular, "serif-regular.ttf", "FibaSerif", "normal"],
  [serifItalic, "serif-italic.ttf", "FibaSerif", "italic"],
] as const;
let fontData: Promise<string[]> | null = null;
function loadFonts() {
  if (!fontData) fontData = Promise.all(fontSpecs.map(async ([url]) => {
    const response = await fetch(url, { credentials: "omit" });
    if (!response.ok) throw new Error("pdf_font_unavailable");
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
    return btoa(binary);
  })).catch(error => { fontData = null; throw error; });
  return fontData;
}

/** Editorial, text-based PDF. Only renders the result object; never scores answers. */
export async function buildFibaPdf(result: FibaResult, demo = false): Promise<Blob> {
  if (!demo && !isReportableFiba(result)) throw new Error("valid_result_required");
  if (demo && result.manifest.calculated_by !== "client_preview") throw new Error("preview_result_required");
  const narrative = buildFibaNarrative(result);
  const originLabel = fibaCalculationOriginLabel(result.manifest.calculated_by);
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const fonts = await loadFonts();
  fontSpecs.forEach(([, file, family, style], i) => {
    doc.addFileToVFS(file, fonts[i]); doc.addFont(file, family, style);
  });
  const W = 595.28, H = 841.89, M = 47, CW = W - M * 2;
  const ink = "#183D30", green = "#32664B", muted = "#586650", rule = "#D9E0D3", paper = "#F7F7F0";
  doc.setProperties({ title: `${demo ? "Demonstração" : "Relatório individual"} FIB-A | Turma do Bem`, subject: "Leitura descritiva de autopercepção estudantil", creator: "FIB-A · Turma do Bem" });
  function text(value: string, x: number, y: number, size = 10, color = ink, font = "helvetica", style = "normal") {
    doc.setFont(font === "times" ? "FibaSerif" : "FibaSans", style); doc.setFontSize(size); doc.setTextColor(color); doc.text(value, x, y);
  }
  function paragraph(value: string, x: number, y: number, width = CW, size = 10, color = muted, leading = 16) {
    doc.setFont("FibaSans", "normal"); doc.setFontSize(size); doc.setTextColor(color);
    const lines: string[] = doc.splitTextToSize(value, width);
    for (const line of lines) { doc.text(line, x, y); y += leading; }
    return y;
  }
  function line(y: number) { doc.setDrawColor(rule); doc.setLineWidth(.7); doc.line(M, y, W - M, y); }
  function page(number: number, kicker: string) {
    if (number > 1) doc.addPage();
    doc.setFillColor(paper); doc.rect(0, 0, W, H, "F");
    text("Turma do Bem", M, 49, 14, ink, "helvetica", "bold");
    text("FIB-A / VIDA ESTUDANTIL", W - M - 144, 49, 8, muted);
    line(68);
    text(kicker, M, 102, 8, green, "helvetica", "bold");
    line(H - 63);
    text(demo ? "DEMONSTRAÇÃO · DADOS SINTÉTICOS" : "RELATÓRIO INDIVIDUAL DE AUTOPERCEPÇÃO", M, H - 43, 7, muted);
    text(`${number} / 3`, W - M - 23, H - 43, 8, muted);
    if (demo) {
      doc.setFillColor("#EEE3C5"); doc.roundedRect(M, H - 106, CW, 26, 4, 4, "F");
      text("Valores ilustrativos. Este relatório não representa um participante.", M + 12, H - 89, 8, "#654E22");
    }
  }
  function bar(x: number, y: number, width: number, score: number, max: number, height = 5) {
    doc.setFillColor("#E4EAD9"); doc.roundedRect(x, y, width, height, height / 2, height / 2, "F");
    if (score > 0) { doc.setFillColor(green); doc.roundedRect(x, y, Math.max(height, width * score / max), height, height / 2, height / 2, "F"); }
  }
  page(1, demo ? "UMA PRÉVIA PARA CONHECER A EXPERIÊNCIA" : "UM OLHAR PARA O SEU MOMENTO");
  text("Seu bem-estar,", M, 160, 37, ink, "times");
  text("por novas perspectivas.", M, 201, 37, green, "times", "italic");
  paragraph("Uma leitura das suas respostas para refletir sobre a vida, os estudos e aquilo que faz parte do seu bem-estar.", M, 239, 400, 11, muted, 18);
  doc.setFillColor("#E8EEDB"); doc.roundedRect(M, 310, CW, 199, 11, 11, "F");
  text("RESULTADO GLOBAL", M + 27, 345, 9, green, "helvetica", "bold");
  text(fmt(result.globalScore, 1), M + 27, 416, 61, ink, "times");
  text("de 100", M + 29, 442, 12, muted);
  bar(M + 28, 471, CW - 56, result.globalScore, 100, 6);
  paragraph("Uma visão do conjunto", M + 235, 377, CW - 260, 11, green, 17);
  paragraph("Os nove domínios têm o mesmo peso no global. Esta leitura descreve suas respostas, sem classificação clínica.", M + 235, 408, CW - 260, 9, muted, 15);
  const date = new Date(result.completedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  text(`${demo ? "Data da demonstração" : "Data da conclusão"}: ${date}`, M, 549, 9, muted);
  line(572);
  text("Sua leitura, em palavras.", M, 609, 23, ink, "times");
  paragraph(narrative.domainPerspective, M, 640, CW, 10, muted, 17);

  page(2, "TRÊS FATORES · NOVE DOMÍNIOS");
  text("O que suas respostas mostram.", M, 146, 28, ink, "times");
  paragraph("Os valores a seguir são médias das suas respostas, na escala de 0 a 4. Não representam percentis, diagnósticos ou comparação com outras pessoas.", M, 177, CW, 9, muted, 15);
  text("FATORES", M, 237, 8, green, "helvetica", "bold");
  let y = 267;
  for (const [id, cell] of Object.entries(result.factors)) {
    text(`0${id}  ${cell.label}`, M, y, 10, ink);
    text(`${fmt(cell.score)} de 4`, W - M - 62, y, 10, green, "helvetica", "bold");
    text(`${cell.itemCount} perguntas`, M, y + 17, 8, muted);
    bar(M + 95, y + 11, CW - 95, cell.score, 4);
    y += 59;
  }
  line(433); text("DOMÍNIOS", M, 460, 8, green, "helvetica", "bold");
  const gap = 27, col = (CW - gap) / 2;
  Object.values(result.domains).forEach((cell, i) => {
    const x = M + i % 2 * (col + gap), rowY = 491 + Math.floor(i / 2) * 44;
    text(cell.label, x, rowY, 9, ink);
    text(fmt(cell.score), x + col - 28, rowY, 10, green, "helvetica", "bold");
    bar(x, rowY + 11, col, cell.score, 4, 4);
  });
  text("Escala: 0 a 4 em todos os fatores e domínios.", M, 721, 8, muted);

  page(3, "PARA LER E LEVAR COM VOCÊ");
  text("Perceber é um começo.", M, 150, 32, ink, "times");
  let y3 = paragraph(narrative.summary, M, 185, CW, 10, muted, 17);
  y3 += 15;
  text("PERGUNTAS PARA SUA REFLEXÃO", M, y3, 8, green, "helvetica", "bold");
  y3 += 25;
  narrative.reflectionQuestions.forEach((question, i) => {
    text(`0${i + 1}`, M, y3, 9, green, "helvetica", "bold");
    y3 = paragraph(question, M + 27, y3, CW - 27, 9.5, ink, 16) + 12;
  });
  line(y3 + 2); y3 += 29;
  text("MÉTODO E LIMITAÇÕES", M, y3, 8, green, "helvetica", "bold"); y3 += 23;
  y3 = paragraph(FIBA_METHOD_NOTE, M, y3, CW, 9, muted, 15);
  y3 += 8;
  y3 = paragraph("Cada fator usa a média de seus próprios itens (9, 15 e 5). Domínios e fatores são arredondados para duas casas; o global, para uma. O cálculo global usa as médias de domínio já arredondadas.", M, y3, CW, 9, muted, 15);
  y3 += 8;
  y3 = paragraph("Governança refere-se à instituição de ensino. As respostas não medem tratamentos odontológicos, impacto da Turma do Bem ou o PERMA.", M, y3, CW, 9, muted, 15);
  y3 += 19;
  text("FONTE E VERSÃO", M, y3, 8, green, "helvetica", "bold"); y3 += 21;
  y3 = paragraph("Fonte: formulário FIB - Alunos - Formulario Inspirado no FIB-T - 2026. O documento fornecido não apresenta evidências de validação específicas desta adaptação.", M, y3, CW, 8, muted, 13);
  paragraph(`FIB-A ${FIBA_VERSION} · Cálculo ${result.manifest.scoring_engine_version} · ${originLabel}. A versão identifica o software, sem certificar validade psicométrica.`, M, y3 + 7, CW, 8, muted, 13);
  return doc.output("blob");
}
