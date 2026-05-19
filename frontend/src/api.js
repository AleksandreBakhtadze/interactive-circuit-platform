/** Dev: Vite proxies /api → http://localhost:8080. Prod: set VITE_API_BASE or same-origin /api. */
export const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

/**
 * @param {{ components: object[] }} circuitJson — from buildCircuitJson(placed)
 * @returns {Promise<{ nodes?: object, components?: object, error?: string }>}
 */
export async function simulateCircuit(circuitJson) {
    const res = await fetch(`${API_BASE}/circuits/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            circuitData: JSON.stringify(circuitJson),
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
 */
export async function validateCircuit(problemCode, circuitJson) {
    const res = await fetch(`${API_BASE}/circuits/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            problemCode,
            circuitData: JSON.stringify(circuitJson),
        }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const msg = data?.message ?? `Validation failed (${res.status})`;
        throw new Error(msg);
    }

    return data;
}
