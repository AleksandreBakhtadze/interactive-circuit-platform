/**
 * COMPONENT_ART_SNAPS
 *
 * Describes where the electrical terminals (white snap circles) sit inside
 * each component's SVG art, in normalised (0–1) coordinates.
 *
 * Fields per entry:
 *   svgWidth / svgHeight  — the SVG canvas size in px (used for aspect ratio)
 *   points[]              — the two reference snap circles
 *     u, v   — normalised x, y within the SVG (0 = left/top, 1 = right/bottom)
 *     dr, dc — offset from the anchor board pin in (rows, cols)
 *
 * getPartStyle() uses the first two points to solve for the image's
 * pixel position and size so the circles land exactly on the board's dark pins.
 */

import { COMPONENT_TYPES } from './componentCatalog';

export const COMPONENT_ART_SNAPS = {
    // -----------------------------------------------------------------------
    // POWER SUPPLY  (SVG canvas: 271 × 326 px)
    //
    // Both pins are on the LEFT edge of the art.
    // Top pin centre:    x ≈ 54.5 / 271,  y ≈  54.67 / 326
    // Bottom pin centre: x ≈ 54.5 / 271,  y ≈ 271.33 / 326
    //
    // Footprint is 2 cols × 3 rows; both pins live in column 0 (dc:0).
    // -----------------------------------------------------------------------
    [COMPONENT_TYPES.POWER_SUPPLY]: {
        svgWidth:  271,
        svgHeight: 326,
        points: [
            { u: 54.5  / 271, v:  54.67 / 326, dr: 0, dc: 0 }, // +  (top)
            { u: 54.5  / 271, v: 271.33 / 326, dr: 2, dc: 0 }, // −  (bottom)
        ],
    },

    // -----------------------------------------------------------------------
    // BUTTON  (SVG canvas: 325 × 109 px)
    //
    // Left pin:  x ≈ 54 / 325,  y ≈ 54 / 109
    // Right pin: x ≈ 270 / 325, y ≈ 54 / 109
    //
    // Footprint is 3 cols × 1 row; pins at dc:0 and dc:2.
    // -----------------------------------------------------------------------
    [COMPONENT_TYPES.BUTTON]: {
        svgWidth:  325,
        svgHeight: 109,
        points: [
            { u:  54 / 325, v: 54 / 109, dr: 0, dc: 0 }, // left terminal
            { u: 270 / 325, v: 54 / 109, dr: 0, dc: 2 }, // right terminal
        ],
    },

    // -----------------------------------------------------------------------
    // LAMP  (SVG canvas: 325 × 109 px  — same layout as BUTTON)
    // -----------------------------------------------------------------------
    [COMPONENT_TYPES.LAMP]: {
        svgWidth:  325,
        svgHeight: 109,
        points: [
            { u:  54 / 325, v: 54 / 109, dr: 0, dc: 0 },
            { u: 270 / 325, v: 54 / 109, dr: 0, dc: 2 },
        ],
    },

    // -----------------------------------------------------------------------
    // WIRE 3  (SVG canvas: 325 × 109 px — spans 3 pin columns, ends at dc 0 & 2)
    // -----------------------------------------------------------------------
    [COMPONENT_TYPES.WIRE3]: {
        svgWidth:  325,
        svgHeight: 109,
        points: [
            { u:  54 / 325, v: 54 / 109, dr: 0, dc: 0 },
            { u: 270 / 325, v: 54 / 109, dr: 0, dc: 2 },
        ],
    },
};