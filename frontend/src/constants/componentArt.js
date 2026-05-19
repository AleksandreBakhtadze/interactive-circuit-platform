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

import { COMPONENT_TYPES, CONNECTOR_LENGTHS, connectorType } from './componentCatalog';

const PIN_X_START = 54;
const PIN_X_STEP = 108;
const SVG_HEIGHT = 109;

function buildConnectorArtSnap(length) {
    const svgWidth = SVG_HEIGHT + PIN_X_STEP * (length - 1);
    const rightX = PIN_X_START + PIN_X_STEP * (length - 1);
    return {
        svgWidth,
        svgHeight: SVG_HEIGHT,
        points: [
            { u: PIN_X_START / svgWidth, v: 54 / SVG_HEIGHT, dr: 0, dc: 0 },
            { u: rightX / svgWidth, v: 54 / SVG_HEIGHT, dr: 0, dc: length - 1 },
        ],
    };
}

const CONNECTOR_ART_SNAPS = Object.fromEntries(
    CONNECTOR_LENGTHS.map((n) => [connectorType(n), buildConnectorArtSnap(n)])
);

export const COMPONENT_ART_SNAPS = {
    [COMPONENT_TYPES.POWER_SUPPLY]: {
        svgWidth:  271,
        svgHeight: 326,
        points: [
            { u: 54.5  / 271, v:  54.67 / 326, dr: 0, dc: 0 },
            { u: 54.5  / 271, v: 271.33 / 326, dr: 2, dc: 0 },
        ],
    },

    [COMPONENT_TYPES.BUTTON]: {
        svgWidth:  325,
        svgHeight: 109,
        points: [
            { u:  54 / 325, v: 54 / 109, dr: 0, dc: 0 },
            { u: 270 / 325, v: 54 / 109, dr: 0, dc: 2 },
        ],
    },

    [COMPONENT_TYPES.LAMP]: {
        svgWidth:  325,
        svgHeight: 109,
        points: [
            { u:  54 / 325, v: 54 / 109, dr: 0, dc: 0 },
            { u: 270 / 325, v: 54 / 109, dr: 0, dc: 2 },
        ],
    },

    ...CONNECTOR_ART_SNAPS,
};
