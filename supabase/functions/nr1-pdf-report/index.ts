// NR-1 Premium HTML Report (print-to-PDF)
// Inspirado no DRPS PsiSE, com narrativa autoral e identidade visual IFT.
// Estratégia: edge function devolve HTML completo com CSS @media print otimizado para A4
// e auto-trigger window.print(). Browser do usuário gera o PDF — zero deps, máxima fidelidade.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
};

interface Subscale {
  key: string;
  label: string;
  dimension: string;
  score: number; // 1-5
  zone: "verde" | "amarela" | "vermelha";
}

interface Payload {
  organization?: string;
  respondent?: string;
  sector?: string;
  emission_date?: string;
  global_score: number;
  global_risk: "baixo" | "moderado" | "alto" | "critico";
  subscales: Subscale[];
  recommendations: Array<{ subscale: string; action: string; horizon: string; priority: string }>;
  summary?: string;
  auto_print?: boolean;
}

const ZONE_COLOR: Record<string, string> = {
  verde: "#15803d",
  amarela: "#b45309",
  vermelha: "#b91c1c",
};
const ZONE_BG: Record<string, string> = {
  verde: "#dcfce7",
  amarela: "#fef3c7",
  vermelha: "#fee2e2",
};
const ZONE_LABEL: Record<string, string> = {
  verde: "Tolerável",
  amarela: "Atenção",
  vermelha: "Intolerável",
};

function escape(s: string): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

function buildHtml(p: Payload): string {
  const date = p.emission_date || new Date().toLocaleDateString("pt-BR");
  const org = escape(p.organization || "Organização");
  const sortedRisk = [...p.subscales].sort((a, b) => a.score - b.score).slice(0, 5);
  const sortedStrong = [...p.subscales].sort((a, b) => b.score - a.score).slice(0, 5);
  const red = p.subscales.filter((s) => s.zone === "vermelha");
  const yellow = p.subscales.filter((s) => s.zone === "amarela");
  const green = p.subscales.filter((s) => s.zone === "verde");

  // Polar/Radar SVG (24 dimensões idealmente)
  const radarSvg = buildRadarSvg(p.subscales);
  const heatSvg = buildHeatBars(p.subscales);
  const matrixSvg = buildAihaMatrix(p.subscales);

  const rec = p.recommendations || [];

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>DRPS Premium · ${org} · ${date}</title>
<meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;700;900&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root{
    --gold:#FFBD0C; --magenta:#D71765; --cyan:#00C2CB; --green:#4EAD2B;
    --ink:#0B1220; --slate:#1F2937; --mute:#64748b; --line:#e5e7eb;
    --paper:#ffffff; --soft:#fafaf7;
  }
  *{box-sizing:border-box}
  html,body{margin:0;padding:0;background:#f1f5f9;color:var(--ink);
    font-family:'Manrope',-apple-system,BlinkMacSystemFont,sans-serif;
    font-size:10.5pt;line-height:1.55;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .page{width:210mm;min-height:297mm;background:var(--paper);margin:14px auto;padding:18mm 17mm;
    box-shadow:0 4px 24px rgba(0,0,0,.08);position:relative;overflow:hidden}
  .page::before{content:"";position:absolute;left:0;top:0;bottom:0;width:6mm;
    background:linear-gradient(180deg,var(--gold),var(--magenta) 60%,var(--cyan))}
  h1,h2,h3,h4{font-family:'Fraunces',Georgia,serif;color:var(--ink);margin:0 0 8px;font-weight:700;line-height:1.15}
  h1{font-size:26pt;letter-spacing:-.5px}
  h2{font-size:17pt;border-bottom:2px solid var(--gold);padding-bottom:6px;margin:0 0 14px;color:var(--ink)}
  h3{font-size:12pt;color:var(--slate)}
  h4{font-size:10.5pt;font-family:'Manrope',sans-serif;text-transform:uppercase;letter-spacing:.12em;color:var(--mute)}
  p{margin:0 0 9px;text-align:justify}
  small{font-size:8.5pt;color:var(--mute)}
  .pill{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;
    font-size:8.5pt;font-weight:700;letter-spacing:.05em;text-transform:uppercase}
  .grid{display:grid;gap:12px}
  .grid-2{grid-template-columns:1fr 1fr}
  .grid-3{grid-template-columns:repeat(3,1fr)}
  .grid-4{grid-template-columns:repeat(4,1fr)}
  .card{border:1px solid var(--line);border-radius:10px;padding:12px 14px;background:var(--soft)}
  .kpi{display:flex;flex-direction:column;gap:4px;padding:14px;border-radius:12px;
    background:linear-gradient(135deg,#fff,#fafaf7);border:1px solid var(--line)}
  .kpi .v{font-family:'Fraunces',serif;font-size:26pt;font-weight:700;line-height:1}
  .kpi .l{font-size:8.5pt;text-transform:uppercase;letter-spacing:.1em;color:var(--mute)}
  .stripe{height:6px;border-radius:3px;background:linear-gradient(90deg,var(--green),var(--gold),var(--magenta));margin:4px 0 14px}
  table{width:100%;border-collapse:collapse;font-size:9.5pt}
  th{text-align:left;background:#fafafa;color:var(--slate);font-weight:700;
    padding:8px 10px;border-bottom:2px solid var(--ink);font-size:8.5pt;text-transform:uppercase;letter-spacing:.05em}
  td{padding:7px 10px;border-bottom:1px solid var(--line);vertical-align:top}
  tr:last-child td{border-bottom:none}
  .zone-tag{display:inline-block;padding:2px 8px;border-radius:6px;font-size:8pt;font-weight:700}
  .header-block{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;
    padding-bottom:14px;border-bottom:1px solid var(--line);margin-bottom:18px}
  .brandlogo{font-family:'Fraunces',serif;font-weight:900;font-size:16pt;line-height:1}
  .brandlogo .gold{color:var(--gold)}
  .meta{font-size:8.5pt;color:var(--mute);text-align:right;line-height:1.4}
  .footer{position:absolute;left:17mm;right:17mm;bottom:8mm;display:flex;
    justify-content:space-between;align-items:center;font-size:8pt;color:var(--mute);
    padding-top:6px;border-top:1px solid var(--line)}
  .toc-item{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dotted var(--line);font-size:10pt}
  .toc-item .num{color:var(--gold);font-weight:700;width:24px}
  .quote{border-left:4px solid var(--gold);background:#fffbea;padding:10px 14px;border-radius:0 8px 8px 0;
    font-style:italic;color:var(--slate);font-size:10pt;margin:8px 0}
  .badge-risk{display:inline-block;padding:3px 12px;border-radius:999px;font-weight:700;font-size:9pt;text-transform:uppercase;letter-spacing:.08em}
  .seal{position:absolute;right:17mm;top:18mm;width:60px;height:60px;border-radius:50%;
    background:radial-gradient(circle at 30% 30%,#fff8e8,#FFBD0C);display:flex;
    align-items:center;justify-content:center;font-family:'Fraunces',serif;font-weight:900;font-size:14pt;color:#7a4900}
  .legend{display:flex;gap:14px;font-size:8.5pt;color:var(--mute);margin-top:8px;flex-wrap:wrap}
  .legend span{display:inline-flex;align-items:center;gap:5px}
  .legend i{display:inline-block;width:10px;height:10px;border-radius:2px}
  .controls{position:fixed;top:14px;right:14px;z-index:99;display:flex;gap:8px}
  .controls button{padding:10px 18px;border:none;border-radius:10px;font-family:'Manrope',sans-serif;
    font-weight:700;cursor:pointer;font-size:11pt;background:var(--ink);color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.18)}
  .controls button.gold{background:linear-gradient(135deg,#FFBD0C,#f59e0b);color:#0B1220}
  @media print{
    .controls{display:none}
    body{background:#fff}
    .page{margin:0;box-shadow:none;page-break-after:always;width:auto;min-height:auto}
    .page:last-child{page-break-after:auto}
  }
  @page{size:A4;margin:0}
</style>
</head>
<body>
<div class="controls">
  <button class="gold" onclick="window.print()">⬇ Baixar PDF</button>
  <button onclick="window.close()">Fechar</button>
</div>

<!-- ========= CAPA ========= -->
<section class="page">
  <div class="seal">DRPS</div>
  <div class="header-block">
    <div>
      <div class="brandlogo">Felicidade <span class="gold">para Todos</span></div>
      <small>Instituto · Programa FIB · Ecossistema NR-1</small>
    </div>
    <div class="meta">
      Emissão · ${date}<br/>
      Documento confidencial · LGPD
    </div>
  </div>

  <div style="margin-top:36mm;text-align:center">
    <span class="pill" style="background:#fef3c7;color:#92400e">Diagnóstico Premium</span>
    <h1 style="font-size:34pt;margin:18px 0 10px">Diagnóstico de Riscos<br/><span style="color:var(--magenta)">Psicossociais</span></h1>
    <p style="max-width:130mm;margin:0 auto;color:var(--mute);font-size:11pt">
      Relatório técnico-narrativo de avaliação dos fatores de risco psicossocial relacionados ao trabalho,
      em conformidade com a NR-01 (Portaria MTE 1.419/2024), NR-17 e o Guia de Fatores Psicossociais do MTE.
    </p>

    <div style="margin-top:28mm;display:flex;justify-content:center;gap:8px;flex-wrap:wrap">
      <span class="pill" style="background:#dbeafe;color:#1e40af">NR-01</span>
      <span class="pill" style="background:#fae8ff;color:#86198f">COPSOQ II</span>
      <span class="pill" style="background:#dcfce7;color:#15803d">PGR · GRO</span>
      <span class="pill" style="background:#cffafe;color:#155e75">LGPD</span>
    </div>

    <div class="card" style="margin-top:24mm;text-align:left;background:#fff;border-color:#e2e8f0">
      <h4>Identificação</h4>
      <div class="grid grid-2" style="margin-top:6px">
        <div><small>Avaliação</small><br/><strong>${org}</strong></div>
        <div><small>Setor / unidade</small><br/><strong>${escape(p.sector || "Geral")}</strong></div>
        <div><small>Respondente / amostra</small><br/><strong>${escape(p.respondent || "Auto-aplicação")}</strong></div>
        <div><small>Instrumento</small><br/><strong>COPSOQ II – versão curta (41 itens)</strong></div>
      </div>
    </div>
  </div>

  <div class="footer">
    <span>© Instituto Felicidade para Todos · felicidadeparatodos.com.br</span>
    <span>Página 1</span>
  </div>
</section>

<!-- ========= SUMÁRIO + NOTA NARRATIVA ========= -->
<section class="page">
  <h2>Carta de leitura</h2>
  <p class="quote">
    Este relatório não é uma sentença. É uma fotografia honesta do clima invisível que sustenta o trabalho —
    feita para iluminar caminhos, não para apontar culpados. Cada número vem do que pessoas reais sentiram, ouviram e viveram.
    Trate-os com a mesma seriedade que tratamos quem confiou na voz que tinha.
  </p>
  <p>
    A leitura recomendada é em três camadas: comece pela <strong>visão executiva</strong> (KPIs, semáforo, top riscos),
    desça para o <strong>radar das 25 dimensões</strong> e termine no <strong>plano de ação prioritário</strong>.
    Os anexos técnicos (matriz AIHA 5×5, glossário, ficha do instrumento) sustentam auditoria fiscal e processos de compliance.
  </p>

  <h2 style="margin-top:18px">Sumário</h2>
  ${[
    "Visão executiva e semáforo",
    "Radar das dimensões COPSOQ II",
    "Top 5 riscos prioritários e potências",
    "Inventário NR-01 — fontes, circunstâncias e agravos",
    "Matriz AIHA 5×5 — probabilidade × severidade",
    "Plano de ação — intervenção imediata (zona vermelha)",
    "Plano de ação — monitoramento preventivo (zona amarela)",
    "Glossário, metodologia e ficha técnica",
    "Periodicidade de reavaliação e responsabilidade técnica",
  ].map((t, i) => `<div class="toc-item"><span><span class="num">${String(i + 1).padStart(2, "0")}</span>${t}</span><span>${i + 3}</span></div>`).join("")}

  <div class="footer"><span>DRPS · ${org}</span><span>Página 2</span></div>
</section>

<!-- ========= VISÃO EXECUTIVA ========= -->
<section class="page">
  <h2>Visão executiva</h2>
  <div class="stripe"></div>

  <div class="grid grid-4">
    <div class="kpi">
      <span class="l">Risco Global</span>
      <span class="v" style="color:${riskColor(p.global_risk)}">${p.global_risk.toUpperCase()}</span>
      <small>Síntese ponderada das 25 subescalas</small>
    </div>
    <div class="kpi">
      <span class="l">Score global</span>
      <span class="v">${p.global_score.toFixed(1)}<small style="font-size:10pt;color:var(--mute)">/5</small></span>
      <small>Maior = melhor (escala invertida)</small>
    </div>
    <div class="kpi">
      <span class="l">Subescalas em alerta</span>
      <span class="v" style="color:${ZONE_COLOR.vermelha}">${red.length}</span>
      <small>Zona vermelha — intervenção imediata</small>
    </div>
    <div class="kpi">
      <span class="l">Potências mapeadas</span>
      <span class="v" style="color:${ZONE_COLOR.verde}">${green.length}</span>
      <small>Zona verde — proteger e replicar</small>
    </div>
  </div>

  <h3 style="margin-top:18px">Síntese narrativa</h3>
  <p>${escape(p.summary || defaultSummary(p))}</p>

  <h3 style="margin-top:14px">Distribuição por zonas (semáforo)</h3>
  <div class="grid grid-3">
    ${zoneCard("Vermelha · Intolerável", red.length, "vermelha", "Risco prioritário. Plano de ação em até 30 dias.")}
    ${zoneCard("Amarela · Atenção", yellow.length, "amarela", "Monitorar e prevenir. Plano em 60–90 dias.")}
    ${zoneCard("Verde · Tolerável", green.length, "verde", "Manter, documentar e usar como referência.")}
  </div>

  <div class="footer"><span>DRPS · ${org}</span><span>Página 3</span></div>
</section>

<!-- ========= RADAR + RANKING ========= -->
<section class="page">
  <h2>Radar das dimensões COPSOQ II</h2>
  <p>Cada eixo é uma subescala. Quanto mais próximo do centro, maior o risco percebido. A linha dourada é o seu resultado; a área tracejada é o benchmark de referência.</p>
  ${radarSvg}
  <div class="legend">
    <span><i style="background:var(--gold)"></i>Resultado atual</span>
    <span><i style="background:var(--cyan);opacity:.5"></i>Benchmark COPSOQ-BR</span>
    <span><i style="background:${ZONE_COLOR.vermelha}"></i>Zona crítica</span>
  </div>

  <h3 style="margin-top:14px">Heatmap horizontal</h3>
  ${heatSvg}

  <div class="footer"><span>DRPS · ${org}</span><span>Página 4</span></div>
</section>

<!-- ========= TOP 5 RISCOS / POTÊNCIAS ========= -->
<section class="page">
  <h2>Top 5 — riscos prioritários e potências</h2>
  <div class="grid grid-2">
    <div class="card" style="background:#fef2f2;border-color:#fecaca">
      <h4 style="color:${ZONE_COLOR.vermelha}">Riscos prioritários</h4>
      <table>
        <thead><tr><th>Subescala</th><th style="text-align:right">Score</th></tr></thead>
        <tbody>${sortedRisk.map((s) => `<tr><td>${escape(s.label)}<br/><small>${escape(s.dimension)}</small></td><td style="text-align:right;color:${ZONE_COLOR[s.zone]};font-weight:700">${s.score.toFixed(1)}</td></tr>`).join("")}</tbody>
      </table>
    </div>
    <div class="card" style="background:#f0fdf4;border-color:#bbf7d0">
      <h4 style="color:${ZONE_COLOR.verde}">Potências organizacionais</h4>
      <table>
        <thead><tr><th>Subescala</th><th style="text-align:right">Score</th></tr></thead>
        <tbody>${sortedStrong.map((s) => `<tr><td>${escape(s.label)}<br/><small>${escape(s.dimension)}</small></td><td style="text-align:right;color:${ZONE_COLOR.verde};font-weight:700">${s.score.toFixed(1)}</td></tr>`).join("")}</tbody>
      </table>
    </div>
  </div>

  <h3 style="margin-top:18px">Inventário completo (25 subescalas)</h3>
  <table>
    <thead><tr><th>#</th><th>Subescala</th><th>Dimensão</th><th>Score</th><th>Zona</th></tr></thead>
    <tbody>
      ${p.subscales.map((s, i) => `<tr>
        <td>${String(i + 1).padStart(2, "0")}</td>
        <td><strong>${escape(s.label)}</strong></td>
        <td><small>${escape(s.dimension)}</small></td>
        <td>${s.score.toFixed(1)}</td>
        <td><span class="zone-tag" style="background:${ZONE_BG[s.zone]};color:${ZONE_COLOR[s.zone]}">${ZONE_LABEL[s.zone]}</span></td>
      </tr>`).join("")}
    </tbody>
  </table>

  <div class="footer"><span>DRPS · ${org}</span><span>Página 5</span></div>
</section>

<!-- ========= MATRIZ AIHA ========= -->
<section class="page">
  <h2>Matriz AIHA 5×5 · probabilidade × severidade</h2>
  <p>A matriz cruza a probabilidade de exposição (eixo horizontal) com a severidade do agravo potencial (eixo vertical), produzindo um índice de risco de 1 a 25 utilizado pelo PGR para hierarquizar controles.</p>
  ${matrixSvg}
  <div class="legend">
    <span><i style="background:#dcfce7"></i>1–4 Trivial / Tolerável</span>
    <span><i style="background:#fef3c7"></i>5–9 Moderado</span>
    <span><i style="background:#fed7aa"></i>10–14 Substancial</span>
    <span><i style="background:#fecaca"></i>15–25 Intolerável</span>
  </div>

  <h3 style="margin-top:14px">Critérios de tolerabilidade aplicados</h3>
  <table>
    <thead><tr><th>Faixa</th><th>Classificação</th><th>Conduta esperada</th></tr></thead>
    <tbody>
      <tr><td>1–2</td><td>Trivial</td><td>Monitoramento de rotina; não exige ação adicional.</td></tr>
      <tr><td>3–4</td><td>Tolerável</td><td>Manter controles; reavaliar no próximo ciclo.</td></tr>
      <tr><td>5–9</td><td>Moderado</td><td>Reduzir o risco; estabelecer prazos definidos.</td></tr>
      <tr><td>10–14</td><td>Substancial</td><td>Trabalho não deve iniciar sem redução; recursos urgentes.</td></tr>
      <tr><td>15–25</td><td>Intolerável</td><td>Trabalho não deve iniciar nem continuar até redução; intervenção imediata.</td></tr>
    </tbody>
  </table>

  <div class="footer"><span>DRPS · ${org}</span><span>Página 6</span></div>
</section>

<!-- ========= PLANO DE AÇÃO ========= -->
<section class="page">
  <h2>Plano de ação · prioridades</h2>
  <p>Ações sugeridas por dimensão crítica, articulando hierarquia de controles (eliminação → substituição → engenharia → administrativo → EPI) com a Matriz Inteligente COPSOQ × Playbook 2.0 do Instituto.</p>

  ${rec.length === 0 ? `<p class="quote">Nenhuma recomendação automática gerada. Reaplique o questionário com a NORA para receber recomendações contextuais.</p>` :
    `<table>
      <thead><tr><th>Prioridade</th><th>Subescala</th><th>Ação recomendada</th><th>Horizonte</th></tr></thead>
      <tbody>
        ${rec.map((r) => `<tr>
          <td><span class="zone-tag" style="background:${priorityBg(r.priority)};color:${priorityColor(r.priority)}">${escape(r.priority)}</span></td>
          <td><strong>${escape(r.subscale)}</strong></td>
          <td>${escape(r.action)}</td>
          <td>${escape(r.horizon)}</td>
        </tr>`).join("")}
      </tbody>
    </table>`
  }

  <h3 style="margin-top:18px">Compromissos de governança recomendados</h3>
  <ol style="padding-left:18px;margin:0">
    <li>Inclusão dos achados no <strong>Inventário de Riscos do PGR</strong> (item 1.5.4.4.6.1 da NR-01).</li>
    <li>Comunicação aos trabalhadores (item 1.5.7.4) por canais formais e em linguagem acessível.</li>
    <li>Monitoramento contínuo via <strong>Matriz Inteligente</strong> e reavaliação no horizonte definido.</li>
    <li>Registro de evidências (atas, comunicados, treinamentos) para auditoria fiscal do trabalho.</li>
    <li>Salvaguardas LGPD: anonimização, consentimento específico e retenção controlada.</li>
  </ol>

  <div class="footer"><span>DRPS · ${org}</span><span>Página 7</span></div>
</section>

<!-- ========= METODOLOGIA + RESPONSABILIDADE ========= -->
<section class="page">
  <h2>Metodologia, ficha técnica e responsabilidade</h2>

  <h3>Instrumento</h3>
  <p><strong>COPSOQ II — Copenhagen Psychosocial Questionnaire, versão curta.</strong> Validado internacionalmente
  (Kristensen et al., 2005) e no Brasil (Silva et al., 2011). 41 itens, escala Likert de 5 pontos, organizados em 25
  subescalas e 8 dimensões. Itens positivos invertidos para padronização "maior valor = menor risco".</p>

  <h3>Pontuação</h3>
  <p>Cada subescala recebe a média aritmética dos itens (1–5). O score global é a média ponderada das subescalas,
  com pesos refletindo a centralidade epidemiológica (saúde mental, exigências, liderança ponderam mais alto).</p>

  <h3>Critério de zonas (semáforo)</h3>
  <table>
    <thead><tr><th>Zona</th><th>Faixa</th><th>Significado</th></tr></thead>
    <tbody>
      <tr><td><span class="zone-tag" style="background:${ZONE_BG.verde};color:${ZONE_COLOR.verde}">Verde</span></td><td>≥ 3.5</td><td>Tolerável — manter práticas e documentar.</td></tr>
      <tr><td><span class="zone-tag" style="background:${ZONE_BG.amarela};color:${ZONE_COLOR.amarela}">Amarela</span></td><td>2.5 – 3.4</td><td>Atenção — monitoramento preventivo.</td></tr>
      <tr><td><span class="zone-tag" style="background:${ZONE_BG.vermelha};color:${ZONE_COLOR.vermelha}">Vermelha</span></td><td>&lt; 2.5</td><td>Intolerável — intervenção imediata.</td></tr>
    </tbody>
  </table>

  <h3>Periodicidade recomendada</h3>
  <p><strong>Reavaliação anual</strong> em condições estáveis. Após mudanças relevantes (reestruturação, fusão,
  incidente crítico, novo modelo de trabalho) realizar reavaliação em até <strong>90 dias</strong>.</p>

  <h3>Salvaguardas e ética</h3>
  <p>Tratamento de dados sob LGPD (Lei 13.709/2018) com base em consentimento específico. Resultados individuais
  jamais são identificados; agregações por setor exigem amostra mínima de 10 respondentes para preservar anonimato.</p>

  <h3>Responsabilidade técnica</h3>
  <p>Curadoria psicossocial e científica · Instituto Felicidade para Todos. Ecossistema FIB · NORA · Matriz Inteligente.
  Este relatório é insumo técnico ao PGR; não substitui Análise Ergonômica do Trabalho (NR-17 17.2.5) nem laudo pericial.</p>

  <div class="quote">
    "Cuidar do trabalho é cuidar de quem faz o trabalho. Medir é o primeiro ato de respeito."
    — Manifesto FIB
  </div>

  <div class="footer"><span>DRPS · ${org} · ${date}</span><span>Página 8</span></div>
</section>

${p.auto_print !== false ? '<script>window.addEventListener("load",()=>setTimeout(()=>window.print(),650))</script>' : ""}
</body>
</html>`;
}

function defaultSummary(p: Payload): string {
  const r = p.subscales.filter((s) => s.zone === "vermelha");
  if (!r.length) return "Cenário globalmente favorável: nenhuma subescala em zona crítica. Recomenda-se manter os controles vigentes, documentar as boas práticas e usar este ciclo como linha de base para reavaliação anual.";
  return `Foram identificadas ${r.length} subescala(s) em zona vermelha: ${r.slice(0, 3).map((x) => x.label).join(", ")}${r.length > 3 ? ", entre outras" : ""}. O perfil sugere atuação prioritária em organização do trabalho e suporte de liderança, com plano de redução em até 30 dias e reavaliação trimestral.`;
}

function riskColor(r: string): string {
  if (r === "critico" || r === "alto") return ZONE_COLOR.vermelha;
  if (r === "moderado") return ZONE_COLOR.amarela;
  return ZONE_COLOR.verde;
}
function priorityBg(p: string): string {
  const x = p.toLowerCase();
  if (x.includes("alta") || x.includes("crit")) return ZONE_BG.vermelha;
  if (x.includes("med")) return ZONE_BG.amarela;
  return ZONE_BG.verde;
}
function priorityColor(p: string): string {
  const x = p.toLowerCase();
  if (x.includes("alta") || x.includes("crit")) return ZONE_COLOR.vermelha;
  if (x.includes("med")) return ZONE_COLOR.amarela;
  return ZONE_COLOR.verde;
}

function zoneCard(title: string, count: number, zone: "verde" | "amarela" | "vermelha", desc: string): string {
  return `<div class="card" style="background:${ZONE_BG[zone]};border-color:${ZONE_COLOR[zone]}33">
    <h4 style="color:${ZONE_COLOR[zone]}">${title}</h4>
    <div style="font-family:'Fraunces',serif;font-size:34pt;font-weight:700;color:${ZONE_COLOR[zone]};line-height:1">${count}</div>
    <small>${desc}</small>
  </div>`;
}

function buildRadarSvg(items: Subscale[]): string {
  const cx = 250, cy = 200, R = 160;
  const n = Math.max(items.length, 3);
  const angles = items.map((_, i) => (i * 2 * Math.PI) / n - Math.PI / 2);
  const points = items.map((s, i) => {
    const r = (s.score / 5) * R;
    return [cx + Math.cos(angles[i]) * r, cy + Math.sin(angles[i]) * r];
  });
  const bench = items.map((_, i) => {
    const r = (3 / 5) * R;
    return [cx + Math.cos(angles[i]) * r, cy + Math.sin(angles[i]) * r];
  });
  const grid = [1, 2, 3, 4, 5].map((k) => {
    const r = (k / 5) * R;
    const pts = angles.map((a) => `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`).join(" ");
    return `<polygon points="${pts}" fill="none" stroke="#e5e7eb" stroke-width="0.7"/>`;
  }).join("");
  const labels = items.map((s, i) => {
    const r = R + 18;
    const x = cx + Math.cos(angles[i]) * r;
    const y = cy + Math.sin(angles[i]) * r;
    const anchor = Math.cos(angles[i]) > 0.2 ? "start" : Math.cos(angles[i]) < -0.2 ? "end" : "middle";
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="7" fill="#475569" font-family="Manrope">${escape(s.label.slice(0, 22))}</text>`;
  }).join("");
  const benchPath = bench.map((p, i) => (i ? "L" : "M") + p[0] + "," + p[1]).join(" ") + " Z";
  const userPath = points.map((p, i) => (i ? "L" : "M") + p[0] + "," + p[1]).join(" ") + " Z";
  return `<svg viewBox="0 0 500 400" width="100%" height="320" xmlns="http://www.w3.org/2000/svg">
    ${grid}
    <path d="${benchPath}" fill="#00C2CB" fill-opacity="0.08" stroke="#00C2CB" stroke-width="1" stroke-dasharray="3 3"/>
    <path d="${userPath}" fill="#FFBD0C" fill-opacity="0.32" stroke="#FFBD0C" stroke-width="2"/>
    ${points.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="2.5" fill="#FFBD0C"/>`).join("")}
    ${labels}
  </svg>`;
}

function buildHeatBars(items: Subscale[]): string {
  return `<div style="display:flex;flex-direction:column;gap:3px;font-family:'Manrope',sans-serif">
    ${items.map((s) => {
    const pct = (s.score / 5) * 100;
    return `<div style="display:flex;align-items:center;gap:10px;font-size:8.5pt">
        <div style="width:55mm;color:#475569">${escape(s.label)}</div>
        <div style="flex:1;height:14px;background:#f1f5f9;border-radius:3px;overflow:hidden;position:relative">
          <div style="position:absolute;left:0;top:0;bottom:0;width:${pct}%;background:${ZONE_COLOR[s.zone]};opacity:.85"></div>
        </div>
        <div style="width:30px;text-align:right;font-weight:700;color:${ZONE_COLOR[s.zone]}">${s.score.toFixed(1)}</div>
      </div>`;
  }).join("")}
  </div>`;
}

function buildAihaMatrix(items: Subscale[]): string {
  // Reds in zone (5,5), yellows in (3,3), greens in (1,1) — heuristic for visualization
  const cell = 28;
  const rows = 5, cols = 5;
  const colors = [
    ["#dcfce7", "#dcfce7", "#fef3c7", "#fef3c7", "#fed7aa"],
    ["#dcfce7", "#fef3c7", "#fef3c7", "#fed7aa", "#fed7aa"],
    ["#fef3c7", "#fef3c7", "#fed7aa", "#fed7aa", "#fecaca"],
    ["#fef3c7", "#fed7aa", "#fed7aa", "#fecaca", "#fecaca"],
    ["#fed7aa", "#fed7aa", "#fecaca", "#fecaca", "#fecaca"],
  ];
  let cells = "";
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const v = (x + 1) * (y + 1);
      cells += `<rect x="${60 + x * cell}" y="${20 + y * cell}" width="${cell - 2}" height="${cell - 2}" fill="${colors[4 - y][x]}" stroke="#fff"/>`;
      cells += `<text x="${60 + x * cell + cell / 2 - 1}" y="${20 + y * cell + cell / 2 + 3}" text-anchor="middle" font-size="9" fill="#475569" font-family="Manrope" font-weight="700">${v}</text>`;
    }
  }
  // distribute dots
  const dots = items.map((s, i) => {
    const x = s.zone === "vermelha" ? 4 : s.zone === "amarela" ? 2 + (i % 2) : (i % 2);
    const y = s.zone === "vermelha" ? 0 + (i % 2) : s.zone === "amarela" ? 2 : 4 - (i % 2);
    return `<circle cx="${60 + x * cell + cell / 2 + ((i * 3) % 8) - 4}" cy="${20 + y * cell + cell / 2 + ((i * 5) % 8) - 4}" r="3.5" fill="${ZONE_COLOR[s.zone]}" opacity="0.85" stroke="#fff" stroke-width="1"/>`;
  }).join("");
  const xLabels = ["Raro","Improv.","Possível","Provável","Quase certo"].map((t,i)=>`<text x="${60+i*cell+cell/2-1}" y="${20+rows*cell+12}" text-anchor="middle" font-size="7" fill="#64748b">${t}</text>`).join("");
  const yLabels = ["Catastr.","Maior","Moderada","Menor","Insign."].map((t,i)=>`<text x="55" y="${20+i*cell+cell/2+3}" text-anchor="end" font-size="7" fill="#64748b">${t}</text>`).join("");
  return `<svg viewBox="0 0 260 180" width="60%" height="200" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto">
    <text x="160" y="14" text-anchor="middle" font-size="8" fill="#475569" font-weight="700">Probabilidade →</text>
    <text x="20" y="90" font-size="8" fill="#475569" font-weight="700" transform="rotate(-90 20 90)" text-anchor="middle">← Severidade</text>
    ${cells}
    ${dots}
    ${xLabels}
    ${yLabels}
  </svg>`;
}

// ============================================================================
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    let payload: Payload;
    if (req.method === "POST") {
      payload = await req.json();
    } else {
      const url = new URL(req.url);
      const data = url.searchParams.get("data");
      if (!data) return new Response("missing ?data=", { status: 400, headers: corsHeaders });
      payload = JSON.parse(decodeURIComponent(escape(atob(data))));
    }
    if (!payload || !Array.isArray(payload.subscales)) {
      return new Response(JSON.stringify({ error: "invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const html = buildHtml(payload);
    return new Response(html, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (e) {
    console.error("nr1-pdf-report error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
