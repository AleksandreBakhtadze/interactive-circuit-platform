/** Dev: Vite proxies /api → http://localhost:8080. Prod: set VITE_API_BASE or same-origin /api. */
export const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

/**
 * @param {{ components: object[] }} circuitJson — from buildCircuitJson(placed)
 * @param {string} [problemCode] — selects DC vs transient analysis (e.g. CP.L1.1, CP.L1.2, CP.L2.3)
 * @param {'idle'|'pressed'|'discharge'} [simPhase] — live interaction phase (CP chapter:
 *   button for L1.x; switch toggle for L2.3)
 * @param {Record<string, number>} [priorPotPositions] — DI.L3.6: pot roles before the step
 * @returns {Promise<{ nodes?: object, components?: object, error?: string }>}
 */
export async function simulateCircuit(
    circuitJson,
    problemCode,
    simPhase,
    priorPotPositions
) {
    const res = await fetch(`${API_BASE}/circuits/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            circuitData: JSON.stringify(circuitJson),
            problemCode: problemCode ?? undefined,
            simPhase: simPhase ?? undefined,
            priorPotPositions: priorPotPositions ?? undefined,
        }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const msg = data?.message ?? `Simulation failed (${res.status})`;
        throw new Error(msg);
    }

    return data.simulationResults ?? data;
}

/**
 * @param {string} problemCode
 * @param {{ components: object[] }} circuitJson
 * @param {number|null} [userId] — when set and validation passes, marks challenge solved
 */
export async function validateCircuit(problemCode, circuitJson, userId) {
    const res = await fetch(`${API_BASE}/circuits/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            problemCode,
            circuitData: JSON.stringify(circuitJson),
            userId: userId ?? undefined,
        }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const msg = data?.message ?? `Validation failed (${res.status})`;
        throw new Error(msg);
    }

    return data;
}
