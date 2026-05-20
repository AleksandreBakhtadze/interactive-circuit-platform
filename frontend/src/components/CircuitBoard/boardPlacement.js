import { COMPONENT_ART_SNAPS } from '../../constants/componentArt';
import {
    COMPONENT_TYPES,
    getArtLayoutPair,
    getFootprint,
} from '../../constants/componentCatalog';
import {
    getRotatedArtSnapPoints,
    normalizeRotation,
    rotationSteps,
} from '../../constants/componentRotation';
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

function clampCellIndex(index, maxIndex) {
    return Math.max(0, Math.min(index, maxIndex));
}

/** Pin position in stage pixels; extrapolates past board edges (no clamp shrink). */
function getDotPx(col, row, rect) {
    const stepX =
        DOT_COL_X.length > 1 ? DOT_COL_X[1] - DOT_COL_X[0] : 0.108;
    const stepY =
        DOT_ROW_Y.length > 1 ? DOT_ROW_Y[1] - DOT_ROW_Y[0] : 0.143;

    let nx;
    if (col < 0) {
        nx = DOT_COL_X[0] + col * stepX;
    } else if (col >= DOT_COL_X.length) {
        nx =
            DOT_COL_X[DOT_COL_X.length - 1] +
            (col - (DOT_COL_X.length - 1)) * stepX;
    } else {
        nx = DOT_COL_X[col];
    }

    let ny;
    if (row < 0) {
        ny = DOT_ROW_Y[0] + row * stepY;
    } else if (row >= DOT_ROW_Y.length) {
        ny =
            DOT_ROW_Y[DOT_ROW_Y.length - 1] +
            (row - (DOT_ROW_Y.length - 1)) * stepY;
    } else {
        ny = DOT_ROW_Y[row];
    }

    return { x: nx * rect.width, y: ny * rect.height };
}

/** Bounding box for w×h small-dot cells */
function getDotCellBounds(rect, row, col, w, h) {
    const { pitchX, pitchY } = getDotPitch();
    const padX = pitchX * rect.width;
    const padY = pitchY * rect.height;

    const col0 = clampCellIndex(col, DOT_COL_X.length - 1);
    const col1 = clampCellIndex(col + Math.max(w, 1) - 1, DOT_COL_X.length - 1);
    const row0 = clampCellIndex(row, DOT_ROW_Y.length - 1);
    const row1 = clampCellIndex(row + Math.max(h, 1) - 1, DOT_ROW_Y.length - 1);

    const left = DOT_COL_X[col0] * rect.width - padX;
    const right = DOT_COL_X[col1] * rect.width + padX;
    const top = DOT_ROW_Y[row0] * rect.height - padY;
    const bottom = DOT_ROW_Y[row1] * rect.height + padY;

    return {
        left,
        top,
        width: Math.max(right - left, 1),
        height: Math.max(bottom - top, 1),
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
function layoutPowerSupply(rect, row, col, s0, s1, rotation = 0) {
    const p0 = getDotPx(col + s0.dc, row + s0.dr, rect);
    const p1 = getDotPx(col + s1.dc, row + s1.dr, rect);

    const imgDu = s1.u - s0.u;
    const imgDv = s1.v - s0.v;
    const boardDx = p1.x - p0.x;
    const boardDy = p1.y - p0.y;

    const art = COMPONENT_ART_SNAPS[COMPONENT_TYPES.POWER_SUPPLY];
    const aspectRatio = (art.svgWidth ?? 271) / (art.svgHeight ?? 326);

    const boardSpan =
        Math.abs(boardDy) >= Math.abs(boardDx)
            ? Math.abs(boardDy)
            : Math.abs(boardDx);

    const imgSpan =
        Math.abs(imgDv) >= Math.abs(imgDu)
            ? Math.abs(imgDv)
            : Math.abs(imgDu);

    const height = imgSpan > 0.02 ? boardSpan / imgSpan : boardSpan || 1;
    const width = height * aspectRatio;

    const anchor = layoutAnchorPin(s0, s1, rotation);
    const anchorPx = anchor === s1 ? p1 : p0;
    const left = anchorPx.x - anchor.u * width;
    let top = anchorPx.y - anchor.v * height;

    if (imgDv > 0.02 && anchor === s0) {
        const topFrom1 = p1.y - s1.v * height;
        top = (top + topFrom1) / 2;
    }

    return { left, top, width, height };
}

function toPxStyle(box) {
    return {
        left: `${box.left}px`,
        top: `${box.top}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
        rotation: box.rotation ?? 0,
        transformOrigin: box.transformOrigin,
    };
}

/**
 * Pin that stays fixed under CSS rotate — must match left/top anchoring below.
 * 180°/270° pivot on s1; 0°/90° on s0.
 */
function layoutAnchorPin(s0, s1, rotation) {
    const steps = rotationSteps(rotation) % 4;
    return steps === 2 || steps === 3 ? s1 : s0;
}

function snapTransformOrigin(s0, s1, rotation) {
    const pin = layoutAnchorPin(s0, s1, rotation);
    return `${pin.u * 100}% ${pin.v * 100}%`;
}

/**
 * Pin-aligned layout; at 90°/270° maps board vertical span → art width so
 * a horizontal SVG spans the correct number of rows when rotated.
 */
function layoutPartFromSnaps(
    rect,
    row,
    col,
    footprintW,
    footprintH,
    s0,
    s1,
    rotation,
    type
) {
    const rot = normalizeRotation(rotation);
    const baseFp = getFootprint(type);
    const baseBounds = getDotCellBounds(rect, row, col, baseFp.w, baseFp.h);

    const p0 = getDotPx(col + s0.dc, row + s0.dr, rect);
    const p1 = getDotPx(col + s1.dc, row + s1.dr, rect);
    const boardX0 = p0.x;
    const boardY0 = p0.y;
    const boardX1 = p1.x;
    const boardY1 = p1.y;

    const imgDx = Math.abs(s1.u - s0.u);
    const imgDy = Math.abs(s1.v - s0.v);
    const boardDx = Math.abs(boardX1 - boardX0);
    const boardDy = Math.abs(boardY1 - boardY0);

    // Unrotated art box (CSS rotate applied afterward).
    let width = baseBounds.width;
    let height = baseBounds.height;

    if (imgDx > 0.02) {
        if (boardDx > 0.5) width = boardDx / imgDx;
        else if (boardDy > 0.5) width = boardDy / imgDx;
    }

    if (imgDy > 0.02) {
        if (boardDy > 0.5) height = boardDy / imgDy;
        else if (boardDx > 0.5) height = boardDx / imgDy;
    }

    const art = COMPONENT_ART_SNAPS[type];
    const solvedBothAxes = imgDx > 0.02 && imgDy > 0.02;
    if (
        !solvedBothAxes &&
        height <= baseBounds.height &&
        art?.svgWidth &&
        art?.svgHeight
    ) {
        height = width * (art.svgHeight / art.svgWidth);
    }

    width = Math.max(width, 1);
    height = Math.max(height, 1);

    const anchor = layoutAnchorPin(s0, s1, rot);
    const anchorX = anchor === s1 ? boardX1 : boardX0;
    const anchorY = anchor === s1 ? boardY1 : boardY0;
    const left = anchorX - anchor.u * width;
    let top = anchorY - anchor.v * height;

    if (imgDy > 0.02 && anchor === s0) {
        const topFromEnd = boardY1 - s1.v * height;
        top = (top + topFromEnd) / 2;
    }

    return {
        left,
        top,
        width,
        height,
        rotation: rot,
        transformOrigin: snapTransformOrigin(s0, s1, rot),
    };
}

function getRotatedPartStyle(stageEl, row, col, footprintW, footprintH, type, rotation) {
    const rot = normalizeRotation(rotation);
    const art = getRotatedArtSnapPoints(type, rot);
    const rect = stageEl.getBoundingClientRect();

    if (!art?.points || art.points.length < 2) {
        const bounds = getDotCellBounds(rect, row, col, footprintW, footprintH);
        return toPxStyle({
            left: bounds.left,
            top: bounds.top,
            width: bounds.width,
            height: bounds.height,
            rotation: rot,
            transformOrigin: '50% 50%',
        });
    }

    const [s0, s1] = getArtLayoutPair(type, art.points);

    if (type === COMPONENT_TYPES.POWER_SUPPLY) {
        const box = layoutPowerSupply(rect, row, col, s0, s1, rot);
        return toPxStyle({
            ...box,
            rotation: rot,
            transformOrigin: snapTransformOrigin(s0, s1, rot),
        });
    }

    return toPxStyle(
        layoutPartFromSnaps(
            rect,
            row,
            col,
            footprintW,
            footprintH,
            s0,
            s1,
            rot,
            type
        )
    );
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
            rotation: 0,
        };
    }

    const [s0, s1] = getArtLayoutPair(type, art.points);

    if (type === COMPONENT_TYPES.POWER_SUPPLY) {
        const box = layoutPowerSupply(rect, row, col, s0, s1);
        return {
            left: `${box.left}px`,
            top: `${box.top}px`,
            width: `${box.width}px`,
            height: `${box.height}px`,
            rotation: 0,
        };
    }

    // General case: solve width from horizontal snap span, height from vertical
    const p0 = getDotPx(col + s0.dc, row + s0.dr, rect);
    const p1 = getDotPx(col + s1.dc, row + s1.dr, rect);
    const boardX0 = p0.x;
    const boardY0 = p0.y;
    const boardX1 = p1.x;
    const boardY1 = p1.y;

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

    return toPxStyle({
        left,
        top,
        width,
        height,
        rotation: 0,
        transformOrigin: `${s0.u * 100}% ${s0.v * 100}%`,
    });
}

export function getPartStyle(gridEl, row, col, w, h, type, rotation = 0) {
    const rot = normalizeRotation(rotation);
    const stage = getBoardStage(gridEl);
    if (stage) {
        if (rot !== 0) {
            return getRotatedPartStyle(stage, row, col, w, h, type, rot);
        }
        const base = getFootprint(type);
        return getPartStyleFromLayout(stage, row, col, base.w, base.h, type);
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
        rotation: rot,
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

/** CSS box for a placed or preview part (includes rotation transform). */
export function partStyleToCss(partStyle) {
    if (!partStyle) return null;

    const rotDeg = partStyle.rotation ?? 0;
    return {
        position: 'absolute',
        left: partStyle.left,
        top: partStyle.top,
        width: partStyle.width,
        height: partStyle.height,
        boxSizing: 'border-box',
        ...(rotDeg
            ? {
                  transform: `rotate(${rotDeg}deg)`,
                  transformOrigin:
                      partStyle.transformOrigin ?? 'center center',
              }
            : {}),
    };
}

/** Hide the browser’s default unrotated drag snapshot; use on-board preview instead. */
export function setTransparentDragGhost(dataTransfer) {
    const blank = new Image();
    blank.src =
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    dataTransfer.setDragImage(blank, 0, 0);
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