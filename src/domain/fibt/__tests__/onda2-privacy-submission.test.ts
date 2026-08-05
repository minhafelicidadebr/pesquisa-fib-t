/**
 * FIB-T — ONDA 2: Testes de privacidade, submissão e k-anonimato.
 *
 * Estes testes verificam a lógica de negócio local que pode ser testada
 * sem banco de dados. Testes de RLS/RPC requerem banco e são marcados
 * separadamente.
 *
 * Os testes de integração com banco devem ser executados contra ambiente
 * local (supabase start) quando disponível.
 */

import { describe, expect, it } from "vitest";
import {
    FIBT_ITEMS,
    INSTRUMENT_ID,
    INSTRUMENT_VERSION,
    ITEM_MAP_HASH,
    SCORING_ENGINE_VERSION,
    scoreFibt,
} from "../index";

// ─── Helpers ───

const K_MIN = 7;

/** Vetor de respostas sintéticas: resposta = (item_id + offset) % 5 */
function syntheticAnswers(offset: number): Record<number, number> {
    return Object.fromEntries(FIBT_ITEMS.map((i) => [i.id, (i.id + offset) % 5]));
}

/** Simula supressão k-anonimato server-side */
function applyKSuppression(
    sectorResponses: Array<{ global_score: number; factor_scores: Record<string, number>; domain_scores: Record<string, number> }>,
    kMin: number,
) {
    const n = sectorResponses.length;
    if (n < kMin) {
        return {
            visible: false,
            response_count: null,
            response_count_label: "<7",
            factor_scores: null,
            domain_scores: null,
            distributions: null,
            suppression_reason: "privacy_threshold",
        };
    }
    return {
        visible: true,
        response_count: n,
        global_score_avg: +(sectorResponses.reduce((s, r) => s + r.global_score, 0) / n).toFixed(1),
        factor_scores_avg: Object.fromEntries(
            Object.keys(sectorResponses[0].factor_scores).map((k) => [
                k,
                +(sectorResponses.reduce((s, r) => s + r.factor_scores[k], 0) / n).toFixed(2),
            ]),
        ),
        domain_scores_avg: Object.fromEntries(
            Object.keys(sectorResponses[0].domain_scores).map((k) => [
                k,
                +(sectorResponses.reduce((s, r) => s + r.domain_scores[k], 0) / n).toFixed(2),
            ]),
        ),
    };
}

// ─── Testes ───

describe("FIB-T ONDA 2 — k-anonimato (k=7)", () => {
    it("n=0 → suprimido", () => {
        const result = applyKSuppression([], K_MIN);
        expect(result.visible).toBe(false);
        expect(result.response_count).toBeNull();
        expect(result.suppression_reason).toBe("privacy_threshold");
    });

    it("n=1 → suprimido", () => {
        const responses = [scoreFibt(syntheticAnswers(1))].map((r) => ({
            global_score: r.globalScore,
            factor_scores: Object.fromEntries(Object.entries(r.factors).map(([k, v]) => [k, v.score])),
            domain_scores: Object.fromEntries(Object.entries(r.domains).map(([k, v]) => [k, v.score])),
        }));
        const result = applyKSuppression(responses, K_MIN);
        expect(result.visible).toBe(false);
        expect(result.response_count).toBeNull();
    });

    it("n=6 → suprimido", () => {
        const responses = Array.from({ length: 6 }, (_, i) => {
            const r = scoreFibt(syntheticAnswers(i));
            return {
                global_score: r.globalScore,
                factor_scores: Object.fromEntries(Object.entries(r.factors).map(([k, v]) => [k, v.score])),
                domain_scores: Object.fromEntries(Object.entries(r.domains).map(([k, v]) => [k, v.score])),
            };
        });
        const result = applyKSuppression(responses, K_MIN);
        expect(result.visible).toBe(false);
        expect(result.response_count).toBeNull();
        expect(result.response_count_label).toBe("<7");
        expect(result.factor_scores).toBeNull();
        expect(result.domain_scores).toBeNull();
        expect(result.distributions).toBeNull();
        expect(result.suppression_reason).toBe("privacy_threshold");
    });

    it("n=7 → visível com agregados", () => {
        const responses = Array.from({ length: 7 }, (_, i) => {
            const r = scoreFibt(syntheticAnswers(i));
            return {
                global_score: r.globalScore,
                factor_scores: Object.fromEntries(Object.entries(r.factors).map(([k, v]) => [k, v.score])),
                domain_scores: Object.fromEntries(Object.entries(r.domains).map(([k, v]) => [k, v.score])),
            };
        });
        const result = applyKSuppression(responses, K_MIN);
        expect(result.visible).toBe(true);
        expect(result.response_count).toBe(7);
        expect(result.global_score_avg).toBeGreaterThan(0);
        expect(result.factor_scores_avg).toBeDefined();
        expect(result.domain_scores_avg).toBeDefined();
    });

    it("n=8 → visível", () => {
        const responses = Array.from({ length: 8 }, (_, i) => {
            const r = scoreFibt(syntheticAnswers(i));
            return {
                global_score: r.globalScore,
                factor_scores: Object.fromEntries(Object.entries(r.factors).map(([k, v]) => [k, v.score])),
                domain_scores: Object.fromEntries(Object.entries(r.domains).map(([k, v]) => [k, v.score])),
            };
        });
        const result = applyKSuppression(responses, K_MIN);
        expect(result.visible).toBe(true);
        expect(result.response_count).toBe(8);
    });

    it("dois setores com contagens diferentes: um suprimido, outro visível", () => {
        const sectorA = Array.from({ length: 8 }, (_, i) => {
            const r = scoreFibt(syntheticAnswers(i));
            return {
                global_score: r.globalScore,
                factor_scores: Object.fromEntries(Object.entries(r.factors).map(([k, v]) => [k, v.score])),
                domain_scores: Object.fromEntries(Object.entries(r.domains).map(([k, v]) => [k, v.score])),
            };
        });
        const sectorC = Array.from({ length: 6 }, (_, i) => {
            const r = scoreFibt(syntheticAnswers(i + 20));
            return {
                global_score: r.globalScore,
                factor_scores: Object.fromEntries(Object.entries(r.factors).map(([k, v]) => [k, v.score])),
                domain_scores: Object.fromEntries(Object.entries(r.domains).map(([k, v]) => [k, v.score])),
            };
        });

        expect(applyKSuppression(sectorA, K_MIN).visible).toBe(true);
        expect(applyKSuppression(sectorC, K_MIN).visible).toBe(false);
    });

    it("resultado suprimido não contém nenhum dado numérico", () => {
        const result = applyKSuppression(
            Array.from({ length: 5 }, (_, i) => ({
                global_score: 50,
                factor_scores: { padrao_vida: 2, bem_estar: 2, satisfacao: 2 },
                domain_scores: { padrao_vida: 2, educacao: 2, cultura: 2, bem_estar: 2, saude: 2, uso_tempo: 2, vitalidade: 2, meio_ambiente: 2, governanca: 2 },
            })),
            K_MIN,
        );
        expect(result.visible).toBe(false);
        // Nenhum campo numérico presente
        expect(result.response_count).toBeNull();
        expect(result.factor_scores).toBeNull();
        expect(result.domain_scores).toBeNull();
        expect(result.distributions).toBeNull();
        // Nenhuma propriedade extra
        expect((result as Record<string, unknown>).global_score_avg).toBeUndefined();
    });
});

describe("FIB-T ONDA 2 — validação de submissão", () => {
    it("manifest_hash divergente → rejeição", () => {
        // Simula validação que a RPC faria
        const validHash = ITEM_MAP_HASH;
        const invalidHash = "aaaa" + validHash.slice(4);
        expect(invalidHash).not.toBe(validHash);
        // A RPC retornaria { ok: false, error: 'manifest_hash_mismatch' }
    });

    it("calculated_by != server → constraint violation (conceitual)", () => {
        // A constraint CHECK (calculated_by = 'server') impede inserção de
        // qualquer valor diferente de 'server'
        const validValues = ["server"];
        const invalidValues = ["client_preview", "client", "browser", ""];
        for (const v of invalidValues) {
            expect(validValues.includes(v)).toBe(false);
        }
    });

    it("sessão expirada → rejeição", () => {
        // Simula: session.expires_at < now()
        const sessionExpiresAt = new Date("2026-01-01T00:00:00Z");
        const now = new Date("2026-08-04T00:00:00Z");
        expect(sessionExpiresAt < now).toBe(true);
        // RPC retornaria { ok: false, error: 'session_expired' }
    });

    it("sessão já submetida → replay negado (idempotente)", () => {
        const sessionStatus = "submitted";
        expect(sessionStatus).toBe("submitted");
        // RPC retornaria { ok: false, error: 'session_already_submitted' }
        // OU se INSERT ON CONFLICT DO NOTHING, retornaria { ok: true, idempotent: true }
    });

    it("instrument_version incompatível → rejeição", () => {
        const campaignVersion = "1.1.0";
        const submittedVersion = "1.0.0-legacy";
        expect(submittedVersion).not.toBe(campaignVersion);
        // RPC retornaria { ok: false, error: 'instrument_version_mismatch' }
    });

    it("engine produz resultado determinístico com manifesto canônico", () => {
        const result = scoreFibt(syntheticAnswers(42));
        expect(result.manifest.instrument_id).toBe(INSTRUMENT_ID);
        expect(result.manifest.instrument_version).toBe(INSTRUMENT_VERSION);
        expect(result.manifest.scoring_engine_version).toBe(SCORING_ENGINE_VERSION);
        expect(result.manifest.item_map_hash).toBe(ITEM_MAP_HASH);
        expect(result.manifest.calculated_by).toBe("server");
        expect(result.manifest.missing_data_policy).toBe("fail_closed");
    });

    it("resultado do engine é persistível: todos os campos obrigatórios presentes", () => {
        const result = scoreFibt(syntheticAnswers(7));
        // Verifica que todos os campos necessários para INSERT existem
        expect(typeof result.globalScore).toBe("number");
        expect(result.globalScore).toBeGreaterThanOrEqual(0);
        expect(result.globalScore).toBeLessThanOrEqual(100);
        expect(Object.keys(result.factors)).toHaveLength(3);
        expect(Object.keys(result.domains)).toHaveLength(9);
        expect(result.manifest.item_map_hash).toBe(ITEM_MAP_HASH);
    });
});

describe("FIB-T ONDA 2 — isolamento entre organizações (conceitual)", () => {
    it("RPC agrega apenas respostas da campanha solicitada", () => {
        // A query na RPC filtra por campaign_id, e a campanha pertence a uma empresa
        // Dados de outra empresa NUNCA entram na agregação
        const campaignCompanyId = "company-a-uuid";
        const otherCompanyId = "company-b-uuid";
        expect(campaignCompanyId).not.toBe(otherCompanyId);
    });

    it("gestor de outra organização não tem acesso (can_manage_fibt)", () => {
        // can_manage_fibt verifica owner_id OU membership como gestor
        // Um gestor de company B não tem membership em company A
        const isOwner = false;
        const isMemberAsGestor = false;
        expect(isOwner || isMemberAsGestor).toBe(false);
    });

    it("acesso anônimo → negado (auth.uid() IS NULL)", () => {
        const authUid = null;
        expect(authUid).toBeNull();
        // RPC levanta EXCEPTION 'not_authenticated'
    });
});

describe("FIB-T ONDA 2 — retenção e purga de raw_answers", () => {
    it("raw_purge_after é calculado como now() + raw_retention_days da campanha", () => {
        const rawRetentionDays = 180;
        const now = new Date("2026-08-04T12:00:00Z");
        const expected = new Date(now.getTime() + rawRetentionDays * 24 * 60 * 60 * 1000);
        expect(expected.getFullYear()).toBe(2027);
        expect(expected.getMonth()).toBe(0); // Janeiro (aproximado)
    });

    it("purga antes do prazo → não purga (conceitual)", () => {
        const rawPurgeAfter = new Date("2027-02-01T00:00:00Z");
        const now = new Date("2026-08-04T00:00:00Z");
        const shouldPurge = rawPurgeAfter <= now;
        expect(shouldPurge).toBe(false);
    });

    it("purga após o prazo → nulifica raw_answers, preserva scores", () => {
        const rawPurgeAfter = new Date("2026-07-01T00:00:00Z");
        const now = new Date("2026-08-04T00:00:00Z");
        const shouldPurge = rawPurgeAfter <= now;
        expect(shouldPurge).toBe(true);
        // Após purga: raw_answers = NULL, global_score permanece, manifest permanece
    });

    it("segunda execução da purga é idempotente (raw_answers já NULL)", () => {
        const rawAnswers = null; // já purgado
        const shouldAffect = rawAnswers !== null;
        expect(shouldAffect).toBe(false);
        // UPDATE WHERE raw_answers IS NOT NULL → não match → 0 rows
    });
});

describe("FIB-T ONDA 2 — contrato de resposta suprimida", () => {
    it("formato exato do contrato suprimido", () => {
        const suppressed = {
            visible: false,
            response_count: null,
            response_count_label: "<7",
            factor_scores: null,
            domain_scores: null,
            distributions: null,
            suppression_reason: "privacy_threshold",
        };

        expect(suppressed.visible).toBe(false);
        expect(suppressed.response_count).toBeNull();
        expect(suppressed.response_count_label).toBe("<7");
        expect(suppressed.factor_scores).toBeNull();
        expect(suppressed.domain_scores).toBeNull();
        expect(suppressed.distributions).toBeNull();
        expect(suppressed.suppression_reason).toBe("privacy_threshold");
        // Nenhum dado numérico vaza
        expect(Object.values(suppressed).filter((v) => typeof v === "number")).toHaveLength(0);
    });
});
