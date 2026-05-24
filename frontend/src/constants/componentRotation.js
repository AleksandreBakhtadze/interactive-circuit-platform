import { COMPONENT_ART_SNAPS } from './componentArt';
import { BOARD_COLS, BOARD_ROWS } from './circuitGrid';
import {
    getFootprint,
    getSnapOffsets,
    getTriangleBodyOffsets,
    getTriangleBodyRotationFootprint,
    isTransistorType,
    usesSnapOnlyCells,
} from './componentCatalog';

export function normalizeRotation(degrees) {
    const n = ((degrees % 360) + 360) % 360;
    return Math.round(n / 90) * 90 % 360;
}

export function rotationSteps(degrees) {
    return normalizeRotation(degrees) / 90;
}

export function getRotatedFootprint(type, rotation = 0) {
    const { w, h } = getFootprint(type);
    return rotationSteps(rotation) % 2 === 1 ? { w: h, h: w } : { w, h };
}

/** 90° clockwise per step within a w×col × h×row footprint (anchor stays top-left). */
export function rotateGridPoint(dr, dc, baseW, baseH, steps) {
    let r = dr;
    let c = dc;
    let w = baseW;
    let h = baseH;

    for (let i = 0; i < steps % 4; i++) {
        const nr = c;
        const nc = h - 1 - r;
        r = nr;
        c = nc;
        const nextW = h;
        h = w;
        w = nextW;
    }

    return { dr: r, dc: c };
}

export function getRotatedSnapOffsets(type, rotation = 0) {
    const base = getSnapOffsets(type);
    const { w, h } = getFootprint(type);
    const steps = rotationSteps(rotation);
    return base.map(({ dr, dc }) => rotateGridPoint(dr, dc, w, h, steps));
}

/** Pin terminals + body edge dot(s) for triangle collision (not used for placement). */
export function getTriangleCollisionOffsets(type, rotation = 0) {
    if (!usesSnapOnlyCells(type)) {
        return [];
    }

    const { w, h } = getFootprint(type);
    const steps = rotationSteps(rotation);
    const snapKeys = new Set();
    const offsets = [];

    for (const o of getRotatedSnapOffsets(type, rotation)) {
        const key = `${o.dr},${o.dc}`;
        if (!snapKeys.has(key)) {
            snapKeys.add(key);
            offsets.push(o);
        }
    }

    const bodyFp = getTriangleBodyRotationFootprint(type);
    for (const { dr, dc } of getTriangleBodyOffsets(type)) {
        const g = rotateGridPoint(dr, dc, bodyFp.w, bodyFp.h, steps);
        const key = `${g.dr},${g.dc}`;
        if (!snapKeys.has(key)) {
            snapKeys.add(key);
            offsets.push(g);
        }
    }

    if (isTransistorType(type)) {
        const fp = getRotatedFootprint(type, rotation);
        const interior = [];
        for (let dr = 0; dr < fp.h; dr++) {
            for (let dc = 0; dc < fp.w; dc++) {
                const key = `${dr},${dc}`;
                if (!snapKeys.has(key)) {
                    interior.push({ dr, dc });
                }
            }
        }
        if (interior.length === 1) {
            offsets.push(interior[0]);
        }
    }

    return offsets;
}

/**
 * True when (row,col) is a blocked body dot for this triangle at any valid anchor
 * (e.g. varistor centre of bottom edge — not pin A/B/C).
 */
export function isTriangleBodyAt(type, row, col, rotation = 0) {
    if (!usesSnapOnlyCells(type)) {
        return false;
    }

    const offsets = getRotatedSnapOffsets(type, rotation);
    const { w, h } = getFootprint(type);

    for (const { dr, dc } of offsets) {
        const anchorRow = row - dr;
        const anchorCol = col - dc;
        if (anchorRow < 0 || anchorCol < 0) {
            continue;
        }
        if (anchorRow + h > BOARD_ROWS.length || anchorCol + w > BOARD_COLS.length) {
            continue;
        }
        if (isTriangleBodyCell(type, row, col, anchorRow, anchorCol, rotation)) {
            return true;
        }
    }

    return false;
}

/** True when (row,col) is blocked triangle body — not an electrical terminal. */
export function isTriangleBodyCell(type, row, col, anchorRow, anchorCol, rotation = 0) {
    if (!usesSnapOnlyCells(type)) {
        return false;
    }

    const snaps = new Set(
        getRotatedSnapOffsets(type, rotation).map((o) => `${o.dr},${o.dc}`)
    );

    for (const { dr, dc } of getTriangleCollisionOffsets(type, rotation)) {
        if (snaps.has(`${dr},${dc}`)) {
            continue;
        }
        if (anchorRow + dr === row && anchorCol + dc === col) {
            return true;
        }
    }

    return false;
}

/** Rotate board snap offsets (dr, dc) for layout; u/v stay in unrotated SVG space. */
export function getRotatedArtSnapPoints(type, rotation = 0) {
    const art = COMPONENT_ART_SNAPS[type];
    if (!art?.points) return null;

    const { w, h } = getFootprint(type);
    const steps = rotationSteps(rotation);
    const points = art.points.map(({ u, v, dr, dc }) => {
        const grid = rotateGridPoint(dr, dc, w, h, steps);
        return { u, v, dr: grid.dr, dc: grid.dc };
    });

    return { ...art, points };
}
