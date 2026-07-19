const DRAFT_VERSION = 1;
const DRAFT_PREFIX = 'circuitlab:draft:v1:';

function storageKey(userId, problemCode) {
    const user = userId != null && userId !== '' ? String(userId) : 'guest';
    return `${DRAFT_PREFIX}${user}:${problemCode}`;
}

function isValidPlacedItem(item) {
    return (
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.type === 'string' &&
        Number.isFinite(item.row) &&
        Number.isFinite(item.col)
    );
}

/**
 * Load a saved board layout for a challenge, or null if none / invalid.
 * @returns {{ placed: object[], potPositions: Record<string, number>, switchStates: Record<string, string> } | null}
 */
export function loadCircuitDraft(userId, problemCode) {
    if (!problemCode || typeof localStorage === 'undefined') return null;
    try {
        const raw = localStorage.getItem(storageKey(userId, problemCode));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || parsed.v !== DRAFT_VERSION) return null;
        if (!Array.isArray(parsed.placed)) return null;
        const placed = parsed.placed.filter(isValidPlacedItem).map((item) => ({
            id: item.id,
            type: item.type,
            row: item.row,
            col: item.col,
            rotation: Number.isFinite(item.rotation) ? item.rotation : 0,
        }));
        const potPositions =
            parsed.potPositions && typeof parsed.potPositions === 'object'
                ? parsed.potPositions
                : {};
        const switchStates =
            parsed.switchStates && typeof parsed.switchStates === 'object'
                ? parsed.switchStates
                : {};
        return { placed, potPositions, switchStates };
    } catch {
        return null;
    }
}

/** Persist board layout for a challenge. Empty boards remove the draft. */
export function saveCircuitDraft(userId, problemCode, draft) {
    if (!problemCode || typeof localStorage === 'undefined') return;
    const key = storageKey(userId, problemCode);
    const placed = Array.isArray(draft?.placed) ? draft.placed : [];
    if (placed.length === 0) {
        localStorage.removeItem(key);
        return;
    }
    try {
        localStorage.setItem(
            key,
            JSON.stringify({
                v: DRAFT_VERSION,
                placed,
                potPositions: draft?.potPositions ?? {},
                switchStates: draft?.switchStates ?? {},
                updatedAt: Date.now(),
            })
        );
    } catch {
        // Quota / private mode — ignore; drafting is best-effort.
    }
}

export function clearCircuitDraft(userId, problemCode) {
    if (!problemCode || typeof localStorage === 'undefined') return;
    try {
        localStorage.removeItem(storageKey(userId, problemCode));
    } catch {
        // ignore
    }
}
