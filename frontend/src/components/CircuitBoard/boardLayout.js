/**
 * Small dark dot positions from board.svg (viewBox 1082×757).
 * These are the edge/corner dots — NOT the large white socket circles.
 */
export const DOT_COL_X = [
    54.05, 162.15, 270.25, 378.35, 486.45, 594.55, 702.65, 810.75, 918.85, 1026.95,
].map((x) => x / 1082);

export const DOT_ROW_Y = [54, 162, 270, 378, 486, 594, 702].map((y) => y / 757);

export const DOT_COLS = DOT_COL_X.length;
export const DOT_ROWS = DOT_ROW_Y.length;

/** Half-spacing between dots — used to expand parts over socket cells */
export function getDotPitch() {
    return {
        pitchX: (DOT_COL_X[1] - DOT_COL_X[0]) / 2,
        pitchY: (DOT_ROW_Y[1] - DOT_ROW_Y[0]) / 2,
    };
}

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/** Nearest small dark dot on the board stage */
export function pointerToNearestDot(clientX, clientY, stageEl) {
    const rect = stageEl.getBoundingClientRect();
    let best = null;
    let bestDist = Infinity;

    for (let row = 0; row < DOT_ROWS; row++) {
        for (let col = 0; col < DOT_COLS; col++) {
            const cx = rect.left + DOT_COL_X[col] * rect.width;
            const cy = rect.top + DOT_ROW_Y[row] * rect.height;
            const dist = (clientX - cx) ** 2 + (clientY - cy) ** 2;
            if (dist < bestDist) {
                bestDist = dist;
                best = { row, col };
            }
        }
    }

    return best;
}

export function dotPinId(row, col) {
    return `${ROWS[row]}${COLS[col]}`;
}
