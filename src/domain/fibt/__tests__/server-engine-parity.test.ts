/**
 * FIB-T — PARIDADE ENTRE A FONTE CANÔNICA E A CÓPIA DO SERVIDOR.
 *
 * A Edge Function não pode importar de `src/`, então existe uma cópia do engine
 * em `supabase/functions/_shared/fibt-engine.ts`. Este teste lê o arquivo do
 * servidor como TEXTO e compara a matriz e o hash com a fonte canônica.
 * Qualquer drift entre as duas cópias quebra a suíte de propósito.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { FIBT_ITEMS, ITEM_MAP_HASH, INSTRUMENT_VERSION, SCORING_ENGINE_VERSION } from "../instrument";

const SERVER_ENGINE_PATH = resolve(
  __dirname,
  "../../../../supabase/functions/_shared/fibt-engine.ts",
);
const source = readFileSync(SERVER_ENGINE_PATH, "utf8");

function parseServerItems(): Array<{ id: number; domain: string; factor: number }> {
  const re = /\{ id: (\d+), text: "(?:[^"\\]|\\.)*", domain: "(\w+)", factor: (\d) \}/g;
  const out: Array<{ id: number; domain: string; factor: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    out.push({ id: Number(m[1]), domain: m[2], factor: Number(m[3]) });
  }
  return out;
}

describe("FIB-T — paridade engine servidor × fonte canônica", () => {
  const serverItems = parseServerItems();

  it("a cópia do servidor declara os mesmos 32 itens", () => {
    expect(serverItems).toHaveLength(32);
  });

  it("cada item tem domínio e fator idênticos nas duas cópias", () => {
    const canonical = new Map(FIBT_ITEMS.map((i) => [i.id, i]));
    for (const item of serverItems) {
      const ref = canonical.get(item.id);
      expect(ref, `item ${item.id} ausente na fonte canônica`).toBeDefined();
      expect(item.domain, `domínio divergente no item ${item.id}`).toBe(ref!.domain);
      expect(item.factor, `fator divergente no item ${item.id}`).toBe(ref!.factor);
    }
  });

  it("item 5 está no Fator 3 também no servidor", () => {
    expect(serverItems.find((i) => i.id === 5)!.factor).toBe(3);
  });

  it("as contagens por fator batem no servidor", () => {
    const count = (f: number) => serverItems.filter((i) => i.factor === f).length;
    expect([count(1), count(2), count(3)]).toEqual([12, 12, 8]);
  });

  it("o ITEM_MAP_HASH é idêntico nas duas cópias", () => {
    expect(source).toContain(ITEM_MAP_HASH);
  });

  it("as versões declaradas são idênticas", () => {
    expect(source).toContain(`INSTRUMENT_VERSION = "${INSTRUMENT_VERSION}"`);
    expect(source).toContain(`SCORING_ENGINE_VERSION = "${SCORING_ENGINE_VERSION}"`);
  });

  it("a política de missing data do servidor é fail_closed", () => {
    expect(source).toContain('missing_data_policy: "fail_closed"');
  });

  it("o engine do servidor não faz chamadas de rede nem usa aleatoriedade", () => {
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/Math\.random/);
    expect(source).not.toMatch(/Date\.now/);
  });
});

describe("FIB-T — o LLM não participa do cálculo", () => {
  const edgeFn = readFileSync(
    resolve(__dirname, "../../../../supabase/functions/fibia-chat/index.ts"),
    "utf8",
  );

  it("a edge function importa o engine determinístico", () => {
    expect(edgeFn).toMatch(/from ["']\.\.\/_shared\/fibt-engine\.ts["']/);
    expect(edgeFn).toMatch(/scoreFibt\(/);
  });

  it("o prompt não instrui o modelo a calcular escores, fatores ou domínios", () => {
    const promptRegion = edgeFn.toLowerCase();
    expect(promptRegion).not.toMatch(/calcular os escores/);
    expect(promptRegion).not.toMatch(/calcule (o|os|a|as) (score|escore|fator|domínio)/);
  });

  it("o prompt proíbe explicitamente recalcular ou alterar números", () => {
    expect(edgeFn).toMatch(/NÃO calcule/i);
  });

  it("a edge function não envia respostas cruas ao modelo", () => {
    // O payload do modelo é montado a partir dos scores já calculados.
    expect(edgeFn).toMatch(/sanitizeNarrative|stripScoreFields|buildNarrativePayload/);
  });
});
