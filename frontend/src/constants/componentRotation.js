import { COMPONENT_ART_SNAPS } from './componentArt';
import { getFootprint, getSnapOffsets } from './componentCatalog';

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

/** 90° clockwise per step; base footprint is w×h at rotation 0. */
export function rotateGridPoint(dr, dc, baseW, baseH, steps) {
    let r = dr;
    let c = dc;

    for (let i = 0; i < steps % 4; i++) {
        const nr = c;
        const nc = r;
        r = nr;
        c = nc;
    }

    return { dr: r, dc: c };
}

export function getRotatedSnapOffsets(type, rotation = 0) {
    const base = getSnapOffsets(type);
    const { w, h } = getFootprint(type);
    const steps = rotationSteps(rotation);
    return base.map(({ dr, dc }) => rotateGridPoint(dr, dc, w, h, steps));
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
