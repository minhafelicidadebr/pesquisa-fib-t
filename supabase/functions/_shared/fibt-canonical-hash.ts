/**
 * FIB-T — Canonical payload hash para idempotência.
 *
 * Garante que a mesma resposta produz o mesmo hash independentemente de:
 * - ordem dos itens no array;
 * - ordem das propriedades no objeto;
 * - campos extras não permitidos.
 *
 * Formato canônico:
 * {
 *   "instrument_id": "FIB-T",
 *   "instrument_version": "1.1.0",
 *   "answers": [{ "item_id": 1, "value": 2 }, ..., { "item_id": 32, "value": 3 }]
 * }
 *
 * Serialização: JSON com chaves em ordem fixa, sem espaços extras.
 */

import { INSTRUMENT_ID, INSTRUMENT_VERSION, FIBT_ITEM_COUNT, FIBT_ITEMS } from "./fibt-engine.ts";

export interface CanonicalAnswer {
    item_id: number;
    value: number;
}

export interface CanonicalPayload {
    instrument_id: string;
    instrument_version: string;
    answers: CanonicalAnswer[];
}

const VALID_ITEM_IDS = new Set(FIBT_ITEMS.map((i) => i.id));

export class CanonicalHashError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CanonicalHashError";
    }
}

/**
 * Normaliza e valida respostas para formato canônico.
 * Rejeita: itens duplicados, desconhecidos, campos extras, tipos inválidos.
 */
export function buildCanonicalPayload(
    answers: unknown[],
    instrumentId: string = INSTRUMENT_ID,
    instrumentVersion: string = INSTRUMENT_VERSION,
): CanonicalPayload {
    if (!Array.isArray(answers)) {
        throw new CanonicalHashError("answers must be an array");
    }

    const seen = new Set<number>();
    const canonical: CanonicalAnswer[] = [];

    for (const entry of answers) {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
            throw new CanonicalHashError("each answer must be an object with id and answer");
        }

        const obj = entry as Record<string, unknown>;
        const id = Number(obj.id);
        const value = Number(obj.answer ?? obj.value);

        if (!Number.isInteger(id) || !VALID_ITEM_IDS.has(id)) {
            throw new CanonicalHashError(`invalid or unknown item_id: ${id}`);
        }

        if (!Number.isInteger(value) || value < 0 || value > 4) {
            throw new CanonicalHashError(`invalid value for item ${id}: ${value}`);
        }

        if (seen.has(id)) {
            throw new CanonicalHashError(`duplicate item_id: ${id}`);
        }

        seen.add(id);
        canonical.push({ item_id: id, value });
    }

    if (canonical.length !== FIBT_ITEM_COUNT) {
        throw new CanonicalHashError(
            `expected ${FIBT_ITEM_COUNT} answers, got ${canonical.length}`,
        );
    }

    // Ordenar por item_id para determinismo
    canonical.sort((a, b) => a.item_id - b.item_id);

    return {
        instrument_id: instrumentId,
        instrument_version: instrumentVersion,
        answers: canonical,
    };
}

/**
 * Serializa o payload canônico de forma determinística.
 * Chaves em ordem fixa, sem espaços.
 */
export function serializeCanonicalPayload(payload: CanonicalPayload): string {
    const answers = payload.answers.map(
        (a) => `{"item_id":${a.item_id},"value":${a.value}}`,
    );
    return `{"instrument_id":"${payload.instrument_id}","instrument_version":"${payload.instrument_version}","answers":[${answers.join(",")}]}`;
}

/**
 * Calcula SHA-256 hex do payload canônico.
 * Mesma resposta → mesmo hash, independente da ordem de envio.
 */
export async function computeCanonicalPayloadHash(
    answers: unknown[],
    instrumentId?: string,
    instrumentVersion?: string,
): Promise<string> {
    const payload = buildCanonicalPayload(answers, instrumentId, instrumentVersion);
    const serialized = serializeCanonicalPayload(payload);
    const buf = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(serialized),
    );
    return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * Valida formato de idempotency_key como UUID v4.
 * Rejeita formato inválido e tamanho inesperado.
 */
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateIdempotencyKey(key: unknown): string {
    if (typeof key !== "string") {
        throw new CanonicalHashError("idempotency_key must be a string");
    }
    if (key.length > 40) {
        throw new CanonicalHashError("idempotency_key too long");
    }
    if (!UUID_V4_REGEX.test(key)) {
        throw new CanonicalHashError("idempotency_key must be a valid UUID v4");
    }
    return key;
}
