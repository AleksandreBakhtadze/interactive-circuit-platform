/** Board rows A–G and columns 1–10; each intersection is one pin. */
export const BOARD_ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
export const BOARD_COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function pinId(row, col) {
    return `${BOARD_ROWS[row]}${BOARD_COLS[col]}`;
}

export function isInsideBoard(row, col) {
    return row >= 0 && row < BOARD_ROWS.length && col >= 0 && col < BOARD_COLS.length;
}
