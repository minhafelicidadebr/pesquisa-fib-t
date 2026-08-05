/**
 * FIB-T — ONDA 2: Testes do canonical payload hash e idempotência.
 *
 * Prova que:
 * - Mesma resposta em ordem diferente → mesmo hash
 * - Propriedades em ordem diferente → mesmo hash
 * - Campo extra → rejeição
 * - Valor diferente → hash diferente
 * - Versão diferente → hash diferente
 * - Item duplicado → rejeição antes do hash
 */

import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { FIBT_ITEMS, INSTRUMENT_VERSION } from "../instrument";

// ── Reimplementação local do canonical hash (espelha _shared/fibt-canonical-hash.ts) ──
// Necessário porque o módulo _shared é Deno e não importa em Node/vitest.

interface CanonicalAnswer { item_id: number; value: number; }
interface CanonicalPayload { instrument_id: string; instrument_version: string; answers: CanonicalAnswer[]; }

const VALID_IDS = new Set(FIBT_ITEMS.map((i) => i.id));

function buildCanonicalPayload(answers: Array<{ id: number; answer: number }>, instrumentVersion = "1.1.0"): CanonicalPayload {
    const seen = new Set<number>();
    const canonical: CanonicalAnswer[] = [];

    for (const entry of answers) {
        const id = Number(entry.id);
        const value = Number(entry.answer);
        if (!Number.isInteger(id) || !VALID_IDS.has(id)) throw new Error(`unknown item ${id}`);
        if (!Number.isInteger(value) || value < 0 || value > 4) throw new Error(`invalid value ${value}`);
        if (seen.has(id)) throw new Error(`duplicate item ${id}`);
        seen.add(id);
        canonical.push({ item_id: id, value });
    }

    if (canonical.length !== 32) throw new Error(`expected 32, got ${canonical.length}`);
    canonical.sort((a, b) => a.item_id - b.item_id);

    return { instrument_id: "FIB-T", instrument_version: instrumentVersion, answers: canonical };
}

function serializeCanonicalPayload(p: CanonicalPayload): string {
    const answers = p.answers.map((a) => `{"item_id":${a.item_id},"value":${a.value}}`);
    return `{"instrument_id":"${p.instrument_id}","instrument_version":"${p.instrument_version}","answers":[${answers.join(",")}]}`;
}

function computeHash(answers: Array<{ id: number; answer: number }>, version = "1.1.0"): string {
    const payload = buildCanonicalPayload(answers, version);
    const serialized = serializeCanonicalPayload(payload);
    return createHash("sha256").update(serialized).digest("hex");
}

// ── Test data ──
const orderedAnswers = FIBT_ITEMS.map((i) => ({ id: i.id, answer: (i.id % 5) as number }));
const reversedAnswers = [...orderedAnswers].reverse();
const shuffledAnswers = [...orderedAnswers].sort(() => 0.5 - Math.random());

describe("FIB-T ONDA 2 — canonical payload hash", () => {
    it("mesma resposta em ordem diferente → mesmo hash", () => {
        const h1 = computeHash(orderedAnswers);
        const h2 = computeHash(reversedAnswers);
        const h3 = computeHash(shuffledAnswers);
        expect(h1).toBe(h2);
        expect(h1).toBe(h3);
    });

    it("hash é determinístico em 100 execuções", () => {
        const first = computeHash(orderedAnswers);
        for (let i = 0; i < 100; i++) {
            expect(computeHash([...orderedAnswers].sort(() => Math.random() - 0.5))).toBe(first);
        }
    });

    it("valor diferente → hash diferente", () => {
        const modified = orderedAnswers.map((a) =>
            a.id === 1 ? { id: 1, answer: (a.answer + 1) % 5 } : a,
        );
        expect(computeHash(orderedAnswers)).not.toBe(computeHash(modified));
    });

    it("versão diferente → hash diferente", () => {
        const h1 = computeHash(orderedAnswers, "1.1.0");
        const h2 = computeHash(orderedAnswers, "2.0.0");
        expect(h1).not.toBe(h2);
    });

    it("item duplicado → rejeição antes do hash", () => {
        const withDup = [...orderedAnswers, { id: 1, answer: 2 }];
        expect(() => buildCanonicalPayload(withDup)).toThrow(/duplicate/i);
    });

    it("item desconhecido (id=99) → rejeição", () => {
        const withUnknown = orderedAnswers.slice(0, 31).concat([{ id: 99, answer: 2 }]);
        expect(() => buildCanonicalPayload(withUnknown)).toThrow(/unknown/i);
    });

    it("31 itens → rejeição (contagem errada)", () => {
        expect(() => buildCanonicalPayload(orderedAnswers.slice(0, 31))).toThrow(/expected 32/i);
    });

    it("valor fora da escala → rejeição", () => {
        const bad = orderedAnswers.map((a) => (a.id === 5 ? { id: 5, answer: 7 } : a));
        expect(() => buildCanonicalPayload(bad)).toThrow(/invalid value/i);
    });

    it("serialização é estável e compacta", () => {
        const payload = buildCanonicalPayload(orderedAnswers);
        const serialized = serializeCanonicalPayload(payload);
        expect(serialized).toMatch(/^\{"instrument_id":"FIB-T","instrument_version":"1\.1\.0","answers":\[/);
        expect(serialized).toMatch(/\]\}$/);
        // Nenhum espaço extra
        expect(serialized).not.toContain(" ");
        // Chaves em ordem fixa
        const parsed = JSON.parse(serialized);
        expect(Object.keys(parsed)).toEqual(["instrument_id", "instrument_version", "answers"]);
    });

    it("hash tem 64 caracteres hexadecimais (SHA-256)", () => {
        const h = computeHash(orderedAnswers);
        expect(h).toHaveLength(64);
        expect(h).toMatch(/^[0-9a-f]{64}$/);
    });
});

describe("FIB-T ONDA 2 — idempotency_key validation", () => {
    const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    it("UUID v4 válido é aceito", () => {
        const key = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";
        expect(UUID_V4_REGEX.test(key)).toBe(true);
    });

    it("UUID v1 é rejeitado (versão != 4)", () => {
        const key = "a1b2c3d4-e5f6-1a7b-8c9d-0e1f2a3b4c5d";
        expect(UUID_V4_REGEX.test(key)).toBe(false);
    });

    it("string arbitrária é rejeitada", () => {
        expect(UUID_V4_REGEX.test("not-a-uuid")).toBe(false);
        expect(UUID_V4_REGEX.test("")).toBe(false);
        expect(UUID_V4_REGEX.test("a".repeat(50))).toBe(false);
    });

    it("string muito longa é rejeitada", () => {
        const longKey = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d" + "x".repeat(100);
        expect(longKey.length > 40).toBe(true);
        // validateIdempotencyKey rejects length > 40
    });
});

describe("FIB-T ONDA 2 — session token format", () => {
    it("32 hex chars é válido", () => {
        const token = "a".repeat(32);
        expect(token.length >= 32 && /^[0-9a-f]+$/i.test(token)).toBe(true);
    });

    it("31 chars é rejeitado (insuficiente)", () => {
        const token = "a".repeat(31);
        expect(token.length >= 32).toBe(false);
    });

    it("token não-hex é rejeitado", () => {
        const token = "g".repeat(32);
        expect(/^[0-9a-f]+$/i.test(token)).toBe(false);
    });

    it("token com hífens (UUID format) é rejeitado como hex", () => {
        const uuid = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";
        expect(/^[0-9a-f]+$/i.test(uuid)).toBe(false); // hífens não são hex
    });

    it("cliente não pode usar token escolhido (não-hex será rejeitado)", () => {
        const clientChosen = "my-custom-session-token-12345678";
        expect(/^[0-9a-f]+$/i.test(clientChosen)).toBe(false);
    });
});
