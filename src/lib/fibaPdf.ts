import { FIBA_VERSION, isReportableFiba, type FibaResult } from "@/domain/fiba";
import { FIBA_FORMAT as fmt, FIBA_METHOD_NOTE } from "@/features/turma-do-bem/content";
import { buildFibaNarrative, fibaCalculationOriginLabel } from "@/features/turma-do-bem/narrative";
import { FIBA_PDF_BRAND as brand } from "@/features/turma-do-bem/pdfBrand";

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
type LogoName = keyof typeof brand.assets;
let fontData: Promise<string[]> | null = null;
let logoData: Promise<Record<LogoName, Uint8Array>> | null = null;
async function readLocalAsset(url: string) {
  const response = await fetch(url, { credentials: "omit" });
  if (!response.ok) throw new Error("pdf_asset_unavailable");
  return new Uint8Array(await response.arrayBuffer());
}
function loadFonts() {
  if (!fontData) fontData = Promise.all(fontSpecs.map(async ([url]) => {
    const bytes = await readLocalAsset(url);
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
    return btoa(binary);
  })).catch(error => { fontData = null; throw error; });
  return fontData;
}
function loadLogos() {
  if (!logoData) logoData = Promise.all(Object.entries(brand.assets).map(async ([key, url]) =>
    [key, await readLocalAsset(url)] as const,
  )).then(entries => Object.fromEntries(entries) as Record<LogoName, Uint8Array>)
    .catch(error => { logoData = null; throw error; });
  return logoData;
}

/** Four editorial pages. Receives the UI result; never calculates participant scores. */
export async function buildFibaPdf(result: FibaResult, demo = false): Promise<Blob> {
  if (!demo && !isReportableFiba(result)) throw new Error("valid_result_required");
  if (demo && result.manifest.calculated_by !== "client_preview") throw new Error("preview_result_required");
  const narrative = buildFibaNarrative(result);
  const originLabel = fibaCalculationOriginLabel(result.manifest.calculated_by);
  const [{ jsPDF }, fonts, logos] = await Promise.all([import("jspdf"), loadFonts(), loadLogos()]);
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  fontSpecs.forEach(([, file, family, style], i) => {
    doc.addFileToVFS(file, fonts[i]); doc.addFont(file, family, style);
  });
  const W = 595.28, H = 841.89, M = 47, CW = W - M * 2;
  const ink = "#222222", teal = "#006E73", muted = "#59605F", rule = "#DFE2DC";
  const paper = "#FFFDF7", gold = "#FFBD0C", cyan = "#00C2CB", magenta = "#D71765", green = "#4EAD2B";
  doc.setProperties({
    title: `${demo ? "Demonstração" : "Relatório individual"} FIB-A | ${brand.instituteName}`,
    subject: "Leitura descritiva de autopercepção estudantil · contexto Turma do Bem",
    author: brand.instituteName, creator: `${brand.instituteName} · FIB-A`,
  });
  function text(value: string, x: number, y: number, size = 10, color = ink, font = "helvetica", style = "normal", align: "left" | "right" = "left") {
    doc.setFont(font === "times" ? "FibaSerif" : "FibaSans", style);
    doc.setFontSize(size); doc.setTextColor(color); doc.text(value, x, y, { align });
  }
  function paragraph(value: string, x: number, y: number, width = CW, size = 10, color = muted, leading = 16) {
    doc.setFont("FibaSans", "normal"); doc.setFontSize(size); doc.setTextColor(color);
    const lines: string[] = doc.splitTextToSize(value, width);
    for (const line of lines) { doc.text(line, x, y); y += leading; }
    return y;
  }
  function line(y: number) { doc.setDrawColor(rule); doc.setLineWidth(.7); doc.line(M, y, W - M, y); }
  function image(name: LogoName, x: number, y: number, maxW: number, maxH: number) {
    const props = doc.getImageProperties(logos[name]);
    const scale = Math.min(maxW / props.width, maxH / props.height);
    const width = props.width * scale, height = props.height * scale;
    doc.addImage(logos[name], "PNG", x, y, width, height, name, "FAST");
    return { width, height };
  }
  function linkedText(value: string, url: string, x: number, y: number, size = 10, color = teal, style = "normal") {
    text(value, x, y, size, color, "helvetica", style);
    const width = doc.getTextWidth(value);
    doc.link(x, y - size, width, size + 5, { url });
  }
  function page(number: number, kicker: string) {
    if (number > 1) doc.addPage();
    doc.setFillColor(paper); doc.rect(0, 0, W, H, "F");
    // Actual artwork is preserved; the full logo has dark lettering for a light background.
    const ift = image("iftFull", M, 25, 147, 59);
    doc.link(M, 25, ift.width, ift.height, { url: brand.website });
    text("FIB-A / VIDA ESTUDANTIL", W - M - 83, 46, 8, ink, "helvetica", "bold", "right");
    text("CONTEXTO TURMA DO BEM", W - M - 83, 61, 6.5, muted, "helvetica", "normal", "right");
    const tdb = image("turmaDoBem", W - M - 62, 28, 62, 36);
    doc.link(W - M - 62, 28, tdb.width, tdb.height, { url: brand.project });
    line(94);
    [gold, cyan, magenta, green].forEach((color, i) => {
      doc.setFillColor(color); doc.rect(M + i * 12, 92.5, 12, 3, "F");
    });
    text(kicker, M, 121, 8, teal, "helvetica", "bold");
    line(H - 63);
    text(brand.instituteName, M, H - 43, 7.5, ink);
    text("FIB-A · LEITURA INDIVIDUAL", M + 228, H - 43, 6.5, muted);
    text(`${number} / 4`, W - M, H - 43, 8, muted, "helvetica", "normal", "right");
    if (demo) {
      doc.setFillColor("#FFF1C6"); doc.roundedRect(M, H - 106, CW, 26, 4, 4, "F");
      text("DEMONSTRAÇÃO · DADOS SINTÉTICOS · Valores ilustrativos, sem participante real.", M + 12, H - 89, 7.7, "#614B16");
    }
  }
  function bar(x: number, y: number, width: number, score: number, max: number, height = 5) {
    doc.setFillColor("#E6ECEA"); doc.roundedRect(x, y, width, height, height / 2, height / 2, "F");
    if (score > 0) { doc.setFillColor(teal); doc.roundedRect(x, y, Math.max(height, width * score / max), height, height / 2, height / 2, "F"); }
  }

  // 1. Individual result: a quiet editorial hierarchy with institutional colour accents.
  page(1, demo ? "UMA PRÉVIA PARA CONHECER A EXPERIÊNCIA" : "UM OLHAR PARA O SEU MOMENTO");
  text("Seu bem-estar,", M, 174, 36, ink, "times");
  text("por novas perspectivas.", M, 214, 36, teal, "times", "italic");
  paragraph("Uma leitura das suas respostas para refletir sobre a vida, os estudos e aquilo que faz parte do seu bem-estar.", M, 248, 420, 10.5, muted, 17);
  doc.setFillColor("#F0F6F3"); doc.roundedRect(M, 306, CW, 193, 10, 10, "F");
  doc.setFillColor(gold); doc.roundedRect(M + 24, 328, 4, 22, 2, 2, "F");
  text("RESULTADO GLOBAL", M + 38, 343, 8.5, teal, "helvetica", "bold");
  text(fmt(result.globalScore, 1), M + 28, 418, 62, ink, "times");
  text("de 100", M + 30, 443, 12, muted);
  paragraph("Uma visão do conjunto", M + 237, 372, CW - 263, 11, teal, 17);
  paragraph("Os nove domínios têm o mesmo peso no global. Esta leitura descreve suas respostas, sem classificação clínica.", M + 237, 402, CW - 263, 9.5, muted, 16);
  bar(M + 28, 470, CW - 56, result.globalScore, 100, 6);
  const date = new Date(result.completedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  text(`${demo ? "Data da demonstração" : "Data da conclusão"}: ${date}`, M, 530, 9, muted);
  line(551);
  text("Sua leitura, em palavras.", M, 585, 23, ink, "times");
  paragraph(narrative.domainPerspective, M, 613, CW, 10, muted, 16);

  // 2. All factors and domains retain the exact result values and fixed ordering.
  page(2, "TRÊS FATORES · NOVE DOMÍNIOS");
  text("O que suas respostas mostram.", M, 164, 28, ink, "times");
  paragraph("Os valores a seguir são médias das suas respostas, na escala de 0 a 4. Não representam percentis, diagnósticos ou comparação com outras pessoas.", M, 193, CW, 9, muted, 15);
  text("FATORES", M, 244, 8, teal, "helvetica", "bold");
  let y = 275;
  for (const [id, cell] of Object.entries(result.factors)) {
    doc.setFillColor("#FFF1C6"); doc.roundedRect(M, y - 14, 25, 25, 4, 4, "F");
    text(`0${id}`, M + 6, y + 2, 9, ink, "helvetica", "bold");
    text(cell.label, M + 39, y, 10, ink);
    text(`${fmt(cell.score)} de 4`, W - M, y, 10, teal, "helvetica", "bold", "right");
    text(`${cell.itemCount} perguntas`, M + 39, y + 18, 8, muted);
    bar(M + 126, y + 12, CW - 126, cell.score, 4);
    y += 57;
  }
  line(432); text("DOMÍNIOS", M, 458, 8, teal, "helvetica", "bold");
  const gap = 27, col = (CW - gap) / 2;
  Object.values(result.domains).forEach((cell, i) => {
    const x = M + i % 2 * (col + gap), rowY = 490 + Math.floor(i / 2) * 44;
    text(cell.label, x, rowY, 9, ink);
    text(fmt(cell.score), x + col, rowY, 10, teal, "helvetica", "bold", "right");
    bar(x, rowY + 11, col, cell.score, 4, 4);
  });
  text("Escala: 0 a 4 em todos os fatores e domínios.", M, 721, 8, muted);

  // 3. Reflection remains distinct from both the measurement and the institutional invitation.
  page(3, "PARA LER E LEVAR COM VOCÊ");
  text("Perceber é um começo.", M, 164, 32, ink, "times");
  let y3 = paragraph(narrative.summary, M, 197, CW, 10, muted, 17);
  y3 += 15;
  text("PERGUNTAS PARA SUA REFLEXÃO", M, y3, 8, teal, "helvetica", "bold");
  y3 += 25;
  narrative.reflectionQuestions.forEach((question, i) => {
    text(`0${i + 1}`, M, y3, 9, teal, "helvetica", "bold");
    y3 = paragraph(question, M + 27, y3, CW - 27, 9.5, ink, 16) + 12;
  });
  line(y3 + 2); y3 += 29;
  text("MÉTODO E LIMITAÇÕES", M, y3, 8, teal, "helvetica", "bold"); y3 += 23;
  y3 = paragraph(FIBA_METHOD_NOTE, M, y3, CW, 9, muted, 15);
  y3 += 8;
  y3 = paragraph("Cada fator usa a média de seus próprios itens (9, 15 e 5). Domínios e fatores são arredondados para duas casas; o global, para uma. O cálculo global usa as médias de domínio já arredondadas.", M, y3, CW, 9, muted, 15);
  y3 += 8;
  y3 = paragraph("Governança refere-se à instituição de ensino. As respostas não medem tratamentos odontológicos, impacto da Turma do Bem ou o PERMA.", M, y3, CW, 9, muted, 15);
  y3 += 19;
  text("FONTE E VERSÃO", M, y3, 8, teal, "helvetica", "bold"); y3 += 21;
  y3 = paragraph("Fonte: formulário FIB - Alunos - Formulario Inspirado no FIB-T - 2026. O documento fornecido não apresenta evidências de validação específicas desta adaptação.", M, y3, CW, 8, muted, 13);
  paragraph(`FIB-A ${FIBA_VERSION} · Cálculo ${result.manifest.scoring_engine_version} · ${originLabel}. A versão identifica o software, sem certificar validade psicométrica.`, M, y3 + 7, CW, 8, muted, 13);

  // 4. An institutional continuation, addressed to the student with readable destinations.
  page(4, "MAIS CAMINHOS PARA O SEU BEM-ESTAR");
  image("iftFull", M, 151, 229, 92);
  text("Sua reflexão", M, 290, 36, ink, "times");
  text("pode continuar.", M, 330, 36, teal, "times", "italic");
  paragraph(brand.studentInvitation, M, 363, CW, 10.5, muted, 17);
  text("NOSSA MISSÃO", M, 432, 8, teal, "helvetica", "bold");
  paragraph(brand.mission, M, 451, CW, 10, muted, 16);

  doc.setFillColor(ink); doc.roundedRect(M, 498, CW, 110, 9, 9, "F");
  image("iftHorizontal", M + 20, 513, 96, 25);
  paragraph(brand.closingInvitation, M + 20, 558, CW - 40, 10, "#FFFFFF", 15);
  linkedText(brand.websiteLabel, brand.website, M + 20, 591, 10.5, gold, "bold");

  doc.setFillColor(gold); doc.roundedRect(M, 625, 253, 35, 5, 5, "F");
  text(brand.contactLabel, M + 16, 647, 10, ink, "helvetica", "bold");
  doc.link(M, 625, 253, 35, { url: brand.contact });
  linkedText(brand.instagramLabel, brand.instagram, M + 278, 647, 9, teal);

  text("ENCONTRE O INSTITUTO", M, 683, 7.5, teal, "helvetica", "bold");
  paragraph(brand.address, M, 701, 316, 8.5, muted, 12);
  image("turmaDoBem", W - M - 62, 672, 62, 35);
  text("Conheça o projeto", W - M - 145, 716, 8, muted);
  linkedText("Dentista do Bem", brand.project, W - M - 78, 729, 8, teal, "bold");
  doc.link(W - M - 62, 672, 62, 35, { url: brand.project });
  return doc.output("blob");
}
