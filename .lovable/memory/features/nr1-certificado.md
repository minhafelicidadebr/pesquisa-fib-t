---
name: Certificado Imprimível A4 do Selo NR-1 (Sprint 22)
description: Rota /selo/:id/certificado — layout A4 paisagem print-first com QR de verificação, gerado via diálogo nativo do navegador (window.print)
type: feature
---

Sprint 22 — Certificado Imprimível A4 do Selo NR-1.

**Arquivo:** `src/pages/SeloCertificado.tsx` (rota pública `/selo/:id/certificado`).

**Abordagem premium sem dependências:**
- CSS `@page { size: A4 landscape; margin: 0 }` + `@media print { .no-print { display:none } }` — o próprio diálogo "Imprimir → Salvar como PDF" do navegador gera o arquivo final. Zero jsPDF/html2canvas, zero bundle extra.
- Folha 297mm × 210mm com dupla borda gold, quatro cantoneiras SVG floreadas (gradient gold), tipografia serif (Fraunces) para nome da empresa e título, sans (Manrope) para metadados. Paleta clara (papel bege `#fbfaf5`, tinta `#1a1a1a`, gold `#b8912e`) otimizada para tinta e leitura.
- Estrutura: header (brasão IFT + selo nº) → título "Certificado de Adesão · Manifesto NR-1 Brasil" → nome da empresa em display 34pt sublinhado gold → parágrafo formal citando NR-1 e MTE → grid de metadados (signatário, UF, porte) → QR à direita apontando para `/selo/:id` (verificação) → footer com quote em itálico + data por extenso.
- Reaproveita RPC `get_nr1_seal` — nenhum backend novo.

**Integração:** `SeloNR1.tsx` ganhou botão "Certificado imprimível (A4)" no painel de ações (ícone Award, secondary style) antes do CTA magenta.

**Racional:** signatários pedem artefato físico para pendurar/anexar em relatórios ESG e comunicados internos. O certificado transforma um selo digital em prova institucional imprimível, ampliando a percepção de valor sem custo de infraestrutura.
