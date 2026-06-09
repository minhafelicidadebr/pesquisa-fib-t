---
name: PDF Intelligence
description: Edge function pdf-intelligence + página /relatorios/pdf-intelligence que cruza PDFs de compliance com COPSOQ II e NR-1 via Lovable AI
type: feature
---
- Edge function: `supabase/functions/pdf-intelligence/index.ts` — modelo `google/gemini-2.5-flash`, `response_format: json_object`, trunca em 18k caracteres.
- Output JSON: `{ doc_type, summary, compliance_score (0-100), findings[{topic, evidence, severity, copsoq_subscales[], nr1_clause}], gaps[], next_actions[] }`.
- Subescalas COPSOQ aceitas: subset de `src/data/copsoq.ts` (21 chaves) — enviadas no system prompt para constrain output.
- Página: `src/pages/PdfIntelligence.tsx`. Extração client-side via regex `\(...\)` (operador Tj/TJ do PDF) — funciona em PDFs nativos. Fallback: paste manual de texto.
- Severidade: baixa/moderada/alta/crítica → cores cyan/gold/orange/magenta.
- CTAs cruzadas para `/intervencoes` (Sprint 8) e `/nr1/avaliacao` (NORA).
- Acesso: público (verify_jwt default do Lovable Cloud), usa anon key.
