/**
 * FIB-T — VETORES DOURADOS.
 *
 * Os valores esperados foram derivados INDEPENDENTEMENTE do código TypeScript
 * (script Python separado durante a ONDA 1) e estão embutidos como literais.
 * Nunca substitua um literal esperado pela saída do engine para "fazer passar":
 * uma divergência aqui significa que o cálculo ou a matriz mudou.
 */

import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  DOMAIN_LABELS,
  EXPECTED_FACTOR_ITEM_COUNTS,
  FIBT_ITEMS,
  FIBT_ITEM_COUNT,
  INSTRUMENT_ID,
  INSTRUMENT_VERSION,
  ITEM_MAP_HASH,
  canonicalItemMapString,
  getItem,
  itemsByFactor,
} from "../instrument";
import { isCanonicalManifest } from "../manifest";
import { FibtScoringError, previewFibt, rankDomains, scoreFibt } from "../scoring-engine";
import { validateFibtAnswers } from "../validators";
import type { DomainId, FactorId } from "../types";
import legacyMatrix from "../__fixtures__/matrix-v0-legacy.json";

/** Respostas uniformes para todos os 32 itens. */
const uniform = (value: number): Record<number, number> =>
  Object.fromEntries(FIBT_ITEMS.map((i) => [i.id, value]));

/** Vetor controlado determinístico: resposta = id % 5. */
const controlled = (): Record<number, number> =>
  Object.fromEntries(FIBT_ITEMS.map((i) => [i.id, i.id % 5]));

/** Vetor crescente: resposta = floor((id - 1) / 8). */
const ascending = (): Record<number, number> =>
  Object.fromEntries(FIBT_ITEMS.map((i) => [i.id, Math.floor((i.id - 1) / 8)]));

describe("FIB-T — integridade da matriz", () => {
  it("contém exatamente 32 itens", () => {
    expect(FIBT_ITEMS).toHaveLength(FIBT_ITEM_COUNT);
  });

  it("não contém ids duplicados e cobre 1..32", () => {
    const ids = FIBT_ITEMS.map((i) => i.id).sort((a, b) => a - b);
    expect(new Set(ids).size).toBe(32);
    expect(ids).toEqual(Array.from({ length: 32 }, (_, n) => n + 1));
  });

  it("distribui os itens como F1=12, F2=12, F3=8", () => {
    expect(itemsByFactor(1)).toHaveLength(12);
    expect(itemsByFactor(2)).toHaveLength(12);
    expect(itemsByFactor(3)).toHaveLength(8);
    expect(EXPECTED_FACTOR_ITEM_COUNTS).toEqual({ 1: 12, 2: 12, 3: 8 });
  });

  it("REGRESSÃO CRÍTICA: item 5 pertence ao Fator 3 e nunca ao Fator 2", () => {
    const item5 = getItem(5);
    expect(item5).toBeDefined();
    expect(item5!.factor).toBe(3);
    expect(item5!.factor).not.toBe(2);
    expect(item5!.domain).toBe("vitalidade");
  });

  it("questão aberta registrada: item 18 permanece no Fator 1", () => {
    // Pendente de validação com a fonte primária Furtado (2020).
    // Este teste documenta o estado decidido — não o endossa metodologicamente.
    expect(getItem(18)!.factor).toBe(1);
    expect(getItem(18)!.domain).toBe("vitalidade");
  });

  it("cobre os 9 domínios, todos com ao menos um item", () => {
    const domains = new Set(FIBT_ITEMS.map((i) => i.domain));
    expect(domains.size).toBe(9);
    for (const key of Object.keys(DOMAIN_LABELS) as DomainId[]) {
      expect(domains.has(key)).toBe(true);
    }
  });

  it("todo item aponta para um fator válido", () => {
    for (const item of FIBT_ITEMS) {
      expect([1, 2, 3]).toContain(item.factor);
    }
  });

  it("o hash publicado corresponde ao SHA-256 recalculado de forma independente", () => {
    const recomputed = createHash("sha256")
      .update(canonicalItemMapString())
      .digest("hex");
    expect(recomputed).toBe(ITEM_MAP_HASH);
  });
});

describe("FIB-T — diff contra a matriz legada v0", () => {
  it("difere da matriz legada em exatamente um item: o item 5", () => {
    const legacy = new Map(
      legacyMatrix.items.map((i) => [i.id, i as { id: number; domain: string; factor: number }]),
    );
    const diffs = FIBT_ITEMS.filter((i) => {
      const old = legacy.get(i.id)!;
      return old.factor !== i.factor || old.domain !== i.domain;
    }).map((i) => i.id);
    expect(diffs).toEqual([5]);
  });

  it("a matriz legada tinha as contagens divergentes F2=13 e F3=7", () => {
    const count = (f: number) => legacyMatrix.items.filter((i) => i.factor === f).length;
    expect(count(1)).toBe(12);
    expect(count(2)).toBe(13);
    expect(count(3)).toBe(7);
  });

  it("preserva integralmente o texto de todos os 32 itens", () => {
    const legacy = new Map(legacyMatrix.items.map((i) => [i.id, i.text]));
    for (const item of FIBT_ITEMS) {
      expect(item.text).toBe(legacy.get(item.id));
    }
  });
});

describe("FIB-T — vetores dourados de cálculo", () => {
  it("todas as respostas no mínimo (0) ⇒ tudo zero", () => {
    const r = scoreFibt(uniform(0));
    expect(r.globalScore).toBe(0);
    for (const cell of Object.values(r.domains)) expect(cell.score).toBe(0);
    for (const cell of Object.values(r.factors)) expect(cell.score).toBe(0);
  });

  it("todas as respostas no máximo (4) ⇒ score global 100", () => {
    const r = scoreFibt(uniform(4));
    expect(r.globalScore).toBe(100);
    for (const cell of Object.values(r.domains)) expect(cell.score).toBe(4);
    for (const cell of Object.values(r.factors)) expect(cell.score).toBe(4);
  });

  it("todas neutras (2) ⇒ score global 50", () => {
    const r = scoreFibt(uniform(2));
    expect(r.globalScore).toBe(50);
    for (const cell of Object.values(r.domains)) expect(cell.score).toBe(2);
    for (const cell of Object.values(r.factors)) expect(cell.score).toBe(2);
  });

  it("vetor controlado (resposta = id % 5) reproduz os valores derivados externamente", () => {
    const r = scoreFibt(controlled());
    expect(r.globalScore).toBe(48.1);
    expect(Object.fromEntries(Object.entries(r.domains).map(([k, v]) => [k, v.score]))).toEqual({
      padrao_vida: 1.75,
      educacao: 1.67,
      cultura: 1.5,
      bem_estar: 1.75,
      saude: 2.2,
      uso_tempo: 2.5,
      vitalidade: 1.5,
      meio_ambiente: 2.0,
      governanca: 2.43,
    });
    expect(Object.fromEntries(Object.entries(r.factors).map(([k, v]) => [k, v.score]))).toEqual({
      padrao_vida: 1.75,
      bem_estar: 2.08,
      satisfacao: 2.13,
    });
  });

  it("vetor crescente reproduz os valores derivados externamente", () => {
    const r = scoreFibt(ascending());
    expect(r.globalScore).toBe(38.5);
    expect(r.factors.padrao_vida.score).toBe(1.5);
    expect(r.factors.bem_estar.score).toBe(1.67);
    expect(r.factors.satisfacao.score).toBe(1.25);
  });

  it("é determinístico: 50 execuções produzem resultado idêntico", () => {
    const first = JSON.stringify(scoreFibt(controlled()));
    for (let n = 0; n < 50; n++) {
      expect(JSON.stringify(scoreFibt(controlled()))).toBe(first);
    }
  });

  it("registra a contagem de itens de cada fator no resultado", () => {
    const r = scoreFibt(uniform(2));
    expect(r.factors.padrao_vida.itemCount).toBe(12);
    expect(r.factors.bem_estar.itemCount).toBe(12);
    expect(r.factors.satisfacao.itemCount).toBe(8);
  });

  it("o item 5 influencia o Fator 3 e não o Fator 2", () => {
    const base = uniform(0);
    const withItem5 = { ...base, 5: 4 };
    const r = scoreFibt(withItem5);
    // Fator 3 tem 8 itens: 4/8 = 0.5
    expect(r.factors.satisfacao.score).toBe(0.5);
    expect(r.factors.bem_estar.score).toBe(0);
  });

  it("aceita o formato de lista [{ id, answer }] usado pelo fluxo atual", () => {
    const entries = FIBT_ITEMS.map((i) => ({ id: i.id, answer: 2 }));
    expect(scoreFibt(entries).globalScore).toBe(50);
  });
});

describe("FIB-T — validação fail-closed", () => {
  it("rejeita 31 itens (item ausente)", () => {
    const answers = uniform(2);
    delete answers[5];
    const v = validateFibtAnswers(answers);
    expect(v.valid).toBe(false);
    expect(v.issues.map((i) => i.code)).toContain("missing_item");
    expect(v.issues.map((i) => i.code)).toContain("item_count_mismatch");
    expect(() => scoreFibt(answers)).toThrow(FibtScoringError);
  });

  it("rejeita item desconhecido (33 itens)", () => {
    const entries = [...FIBT_ITEMS.map((i) => ({ id: i.id, answer: 2 })), { id: 99, answer: 2 }];
    const v = validateFibtAnswers(entries);
    expect(v.valid).toBe(false);
    expect(v.issues.map((i) => i.code)).toContain("unknown_item");
  });

  it("rejeita item duplicado", () => {
    const entries = [...FIBT_ITEMS.map((i) => ({ id: i.id, answer: 2 })), { id: 7, answer: 4 }];
    const v = validateFibtAnswers(entries);
    expect(v.valid).toBe(false);
    expect(v.issues.map((i) => i.code)).toContain("duplicate_item");
  });

  it("rejeita valor abaixo da escala", () => {
    const v = validateFibtAnswers({ ...uniform(2), 3: -1 });
    expect(v.valid).toBe(false);
    expect(v.issues.find((i) => i.code === "value_out_of_scale")?.itemId).toBe(3);
  });

  it("rejeita valor acima da escala", () => {
    const v = validateFibtAnswers({ ...uniform(2), 3: 5 });
    expect(v.valid).toBe(false);
    expect(v.issues.find((i) => i.code === "value_out_of_scale")?.itemId).toBe(3);
  });

  it("rejeita valor não inteiro", () => {
    const v = validateFibtAnswers({ ...uniform(2), 3: 2.5 });
    expect(v.valid).toBe(false);
    expect(v.issues.map((i) => i.code)).toContain("value_not_integer");
  });

  it("rejeita instrumento incompatível", () => {
    const v = validateFibtAnswers(uniform(2), { instrumentId: "COPSOQ" });
    expect(v.valid).toBe(false);
    expect(v.issues.map((i) => i.code)).toContain("instrument_mismatch");
  });

  it("rejeita versão divergente da matriz", () => {
    const v = validateFibtAnswers(uniform(2), { instrumentVersion: "1.0.0-legacy" });
    expect(v.valid).toBe(false);
    expect(v.issues.map((i) => i.code)).toContain("version_mismatch");
  });

  it("aceita instrumento e versão vigentes", () => {
    const v = validateFibtAnswers(uniform(2), {
      instrumentId: INSTRUMENT_ID,
      instrumentVersion: INSTRUMENT_VERSION,
    });
    expect(v.valid).toBe(true);
  });

  it("previewFibt retorna null em entrada inválida, sem lançar", () => {
    expect(previewFibt({ 1: 2 })).toBeNull();
  });
});

describe("FIB-T — manifesto e proveniência", () => {
  it("o manifesto carrega instrumento, versões, hash e política", () => {
    const { manifest } = scoreFibt(uniform(2));
    expect(manifest).toEqual({
      instrument_id: "FIB-T",
      instrument_version: INSTRUMENT_VERSION,
      scoring_engine_version: "1.0.0",
      item_map_hash: ITEM_MAP_HASH,
      missing_data_policy: "fail_closed",
      rounding_policy: "domains_factors:mean_2dp;global:mean_of_domain_ratios_x100_1dp",
      calculated_by: "server",
    });
  });

  it("resultado do servidor é canônico", () => {
    expect(isCanonicalManifest(scoreFibt(uniform(2)).manifest)).toBe(true);
  });

  it("pré-visualização no cliente NÃO é canônica e não pode ser persistida", () => {
    const preview = previewFibt(uniform(2))!;
    expect(preview.manifest.calculated_by).toBe("client_preview");
    expect(isCanonicalManifest(preview.manifest)).toBe(false);
  });

  it("manifesto de versão antiga não é aceito como canônico", () => {
    const stale = { ...scoreFibt(uniform(2)).manifest, instrument_version: "1.0.0-legacy" };
    expect(isCanonicalManifest(stale)).toBe(false);
  });
});

describe("FIB-T — ordenação de domínios", () => {
  it("ordena de forma estável, com empate resolvido pela chave", () => {
    const { domains } = scoreFibt(uniform(2));
    const desc = rankDomains(domains, "desc");
    const asc = rankDomains(domains, "asc");
    expect(desc.map((d) => d.key)).toEqual(asc.map((d) => d.key));
    expect(desc[0].key).toBe("bem_estar");
  });

  it("identifica o maior e o menor resultado no vetor controlado", () => {
    const { domains } = scoreFibt(controlled());
    expect(rankDomains(domains, "desc")[0].key).toBe("uso_tempo");
    expect(rankDomains(domains, "asc")[0].key).toBe("cultura");
  });
});
