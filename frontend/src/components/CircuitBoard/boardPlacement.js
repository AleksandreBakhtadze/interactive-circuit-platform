import { COMPONENT_ART_SNAPS } from '../../constants/componentArt';
import { COMPONENT_TYPES } from '../../constants/componentCatalog';
import { DOT_COL_X, DOT_ROW_Y, getDotPitch, pointerToNearestDot } from './boardLayout';

export const BOARD_ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
export const BOARD_COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function pinName(row, col) {
    return `${BOARD_ROWS[row]}${BOARD_COLS[col]}`;
}

function getBoardStage(gridEl) {
    return gridEl?.closest('[data-board-stage]') ?? null;
}

/** Snap to small dark dots only */
export function pointerToPin(clientX, clientY, gridEl) {
    const stage = getBoardStage(gridEl);
    if (stage) {
        return pointerToNearestDot(clientX, clientY, stage);
    }

    const pins = gridEl?.querySelectorAll('[data-pin]');
    if (!pins?.length) return null;

    let best = null;
    let bestDist = Infinity;

    pins.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = (clientX - cx) ** 2 + (clientY - cy) ** 2;
        if (dist < bestDist) {
            bestDist = dist;
            const id = el.dataset.pin;
            const row = BOARD_ROWS.indexOf(id[0]);
            const col = BOARD_COLS.indexOf(Number(id.slice(1)));
            if (row >= 0 && col >= 0) best = { row, col };
        }
    });

    return best;
}

/** Bounding box for w×h small-dot cells */
function getDotCellBounds(rect, row, col, w, h) {
    const { pitchX, pitchY } = getDotPitch();
    const padX = pitchX * rect.width;
    const padY = pitchY * rect.height;

    const left = DOT_COL_X[col] * rect.width - padX;
    const right = DOT_COL_X[col + w - 1] * rect.width + padX;
    const top = DOT_ROW_Y[row] * rect.height - padY;
    const bottom = DOT_ROW_Y[row + h - 1] * rect.height + padY;

    return {
        left,
        top,
        width: right - left,
        height: bottom - top,
    };
}

/**
 * Power supply: both pins share the same column (same dc, same u).
 * Strategy:
 *   1. Solve `height` from vertical board distance / art v-distance.
 *   2. Derive `width` from the SVG aspect ratio (no distortion).
 *   3. Pin the left edge so u0 * width lands on the anchor column x.
 *   4. Average top from both pin constraints for sub-pixel accuracy.
 */
function layoutPowerSupply(rect, row, col, s0, s1) {
    const boardY0 = DOT_ROW_Y[row + s0.dr] * rect.height;
    const boardY1 = DOT_ROW_Y[row + s1.dr] * rect.height;
    const boardX0 = DOT_COL_X[col + s0.dc] * rect.width;

    const imgDv = s1.v - s0.v;
    const boardDy = boardY1 - boardY0;

    // Height: scale so the two v-fractions span the real pin distance
    const height = boardDy / imgDv;

    // Width: preserve SVG aspect ratio (svgWidth/svgHeight in COMPONENT_ART_SNAPS)
    const art = COMPONENT_ART_SNAPS[COMPONENT_TYPES.POWER_SUPPLY];
    const aspectRatio = (art.svgWidth ?? 271) / (art.svgHeight ?? 326);
    const width = height * aspectRatio;

    // Left: u0 fraction of width must align with the anchor pin x
    const left = boardX0 - s0.u * width;

    // Top: average of both pin constraints for best accuracy
    const topFromTop    = boardY0 - s0.v * height;
    const topFromBottom = boardY1 - s1.v * height;
    const top = (topFromTop + topFromBottom) / 2;

    return { left, top, width, height };
}

function getPartStyleFromLayout(stageEl, row, col, w, h, type) {
    const rect = stageEl.getBoundingClientRect();
    const art = COMPONENT_ART_SNAPS[type];
    const bounds = getDotCellBounds(rect, row, col, w, h);

    if (!art?.points || art.points.length < 2) {
        return {
            left: `${bounds.left}px`,
            top: `${bounds.top}px`,
            width: `${bounds.width}px`,
            height: `${bounds.height}px`,
        };
    }

    const [s0, s1] = art.points;

    if (type === COMPONENT_TYPES.POWER_SUPPLY) {
        const box = layoutPowerSupply(rect, row, col, s0, s1);
        return {
            left: `${box.left}px`,
            top: `${box.top}px`,
            width: `${box.width}px`,
            height: `${box.height}px`,
        };
    }

    // General case: solve width from horizontal snap span, height from vertical
    const boardX0 = DOT_COL_X[col + s0.dc] * rect.width;
    const boardY0 = DOT_ROW_Y[row + s0.dr] * rect.height;
    const boardX1 = DOT_COL_X[col + s1.dc] * rect.width;
    const boardY1 = DOT_ROW_Y[row + s1.dr] * rect.height;

    const imgDx = s1.u - s0.u;
    const imgDy = s1.v - s0.v;
    const boardDx = boardX1 - boardX0;
    const boardDy = boardY1 - boardY0;

    let width = bounds.width;
    let height = bounds.height;

    if (Math.abs(imgDx) > 0.02) {
        width = boardDx / imgDx;
    }

    if (Math.abs(imgDy) > 0.02) {
        height = boardDy / imgDy;
    }

    const left = boardX0 - s0.u * width;
    let top = boardY0 - s0.v * height;

    if (Math.abs(imgDy) > 0.02) {
        const topFromBottom = boardY1 - s1.v * height;
        top = (top + topFromBottom) / 2;
    }

    return {
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
    };
}

export function getPartStyle(gridEl, row, col, w, h, type) {
    const stage = getBoardStage(gridEl);
    if (stage) {
        return getPartStyleFromLayout(stage, row, col, w, h, type);
    }

    const start = gridEl.querySelector(`[data-pin="${pinName(row, col)}"]`);
    const end = gridEl.querySelector(
        `[data-pin="${pinName(row + h - 1, col + w - 1)}"]`
    );
    if (!start || !end) return null;

    const rootRect = gridEl.getBoundingClientRect();
    const r0 = start.getBoundingClientRect();
    const r1 = end.getBoundingClientRect();
    const { pitchX, pitchY } = getDotPitch();
    const padX = pitchX * rootRect.width;
    const padY = pitchY * rootRect.height;

    const left = r0.left - rootRect.left + r0.width / 2 - padX;
    const top = r0.top - rootRect.top + r0.height / 2 - padY;
    const width = r1.right - r0.left + padX * 2;
    const height = r1.bottom - r0.top + padY * 2;

    return {
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
    };
}

/**
 * Returns the bounding box of the pin footprint (w×h dark dots) as a CSS
 * style object. Use this for drop previews so the dashed outline shows exactly
 * which pins will be occupied, regardless of how large the component art is.
 */
export function getFootprintStyle(gridEl, row, col, w, h) {
    const stage = getBoardStage(gridEl);
    const el = stage ?? gridEl;
    if (!el) return null;

    const rect = el.getBoundingClientRect();
    const { pitchX, pitchY } = getDotPitch();
    const padX = pitchX * rect.width;
    const padY = pitchY * rect.height;

    const left   = DOT_COL_X[col] * rect.width - padX;
    const right  = DOT_COL_X[col + w - 1] * rect.width + padX;
    const top    = DOT_ROW_Y[row] * rect.height - padY;
    const bottom = DOT_ROW_Y[row + h - 1] * rect.height + padY;

    return {
        position: 'absolute',
        left:   `${left}px`,
        top:    `${top}px`,
        width:  `${right - left}px`,
        height: `${bottom - top}px`,
    };
}

export function parseDragPayload(dataTransfer) {
    try {
        const raw = dataTransfer.getData('application/circuit-part');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function setDragPayload(dataTransfer, payload) {
    dataTransfer.setData('application/circuit-part', JSON.stringify(payload));
    dataTransfer.effectAllowed = 'move';
}