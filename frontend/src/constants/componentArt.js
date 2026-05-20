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

import {
    CAPACITOR_SPECS,
    capacitorType,
    COMPONENT_TYPES,
    CONNECTOR_LENGTHS,
    connectorType,
    LED_SPECS,
    ledType,
    RESISTOR_SPECS,
    resistorType,
    TRANSISTOR_SPECS,
    transistorType,
} from './componentCatalog';

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

const RESISTOR_ART_SNAP = {
    svgWidth: 325,
    svgHeight: 109,
    points: [
        { u: 54 / 325, v: 54 / 109, dr: 0, dc: 0 },
        { u: 270 / 325, v: 54 / 109, dr: 0, dc: 2 },
    ],
};

const RESISTOR_ART_SNAPS = Object.fromEntries(
    RESISTOR_SPECS.map((s) => [resistorType(s.key), RESISTOR_ART_SNAP])
);

const LED_ART_SNAPS = Object.fromEntries(
    LED_SPECS.map((s) => [ledType(s.key), RESISTOR_ART_SNAP])
);

const CAPACITOR_ART_SNAPS = Object.fromEntries(
    CAPACITOR_SPECS.map((s) => [capacitorType(s.key), RESISTOR_ART_SNAP])
);

/** Vertical transistor (217×326): collector top, base left, emitter bottom. */
const TRIANGLE_ART_VERTICAL = {
    svgWidth: 217,
    svgHeight: 326,
    points: [
        { u: 162 / 217, v: 54.17 / 326, dr: 0, dc: 1 },
        { u: 162 / 217, v: 270.83 / 326, dr: 1, dc: 1 },
        { u: 54 / 217, v: 162.5 / 326, dr: 1, dc: 0 },
    ],
};

/** Horizontal triangle (326×217): ends on the right column, base on the left. */
const TRIANGLE_ART_HORIZONTAL = {
    svgWidth: 326,
    svgHeight: 217,
    points: [
        { u: 217 / 326, v: 0.17 / 217, dr: 0, dc: 2 },
        { u: 217 / 326, v: 216.83 / 217, dr: 2, dc: 2 },
        { u: 109 / 326, v: 108.5 / 217, dr: 1, dc: 0 },
    ],
};

/**
 * slide-switch.svg / var-resistor SVGs apply rotate(90°) inside the file.
 * Pin centres in the rendered 326×217 viewBox (apex A up, B/C on bottom row).
 */
const APEX_UP_TRIANGLE_ART = {
    svgWidth: 326,
    svgHeight: 217,
    points: [
        { u: 163 / 326, v: 54.5 / 217, dr: 0, dc: 1 },
        { u: 54.67 / 326, v: 162.5 / 217, dr: 1, dc: 0 },
        { u: 271.33 / 326, v: 162.5 / 217, dr: 1, dc: 2 },
    ],
};

const TRANSISTOR_ART_SNAPS = Object.fromEntries(
    TRANSISTOR_SPECS.map((s) => [transistorType(s.key), TRIANGLE_ART_VERTICAL])
);

const RELAY_ART_SNAP = {
    svgWidth: 217,
    svgHeight: 326,
    points: [
        { u: 54 / 217, v: 54.17 / 326, dr: 0, dc: 0 },
        { u: 162 / 217, v: 54.17 / 326, dr: 0, dc: 1 },
        { u: 162 / 217, v: 162.5 / 326, dr: 1, dc: 1 },
        { u: 54 / 217, v: 270.83 / 326, dr: 2, dc: 0 },
        { u: 162 / 217, v: 270.83 / 326, dr: 2, dc: 1 },
    ],
};

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

    [COMPONENT_TYPES.SWITCH]: {
        svgWidth:  325,
        svgHeight: 109,
        points: [
            { u:  54 / 325, v: 54 / 109, dr: 0, dc: 0 },
            { u: 270 / 325, v: 54 / 109, dr: 0, dc: 2 },
        ],
    },

    [COMPONENT_TYPES.MOTOR]: {
        svgWidth:  325,
        svgHeight: 109,
        points: [
            { u:  54 / 325, v: 54 / 109, dr: 0, dc: 0 },
            { u: 270 / 325, v: 54 / 109, dr: 0, dc: 2 },
        ],
    },

    [COMPONENT_TYPES.DIODE]: RESISTOR_ART_SNAP,

    [COMPONENT_TYPES.RELAY]: RELAY_ART_SNAP,

    [COMPONENT_TYPES.SLIDE_SWITCH]: APEX_UP_TRIANGLE_ART,

    [COMPONENT_TYPES.VAR_RESISTOR]: APEX_UP_TRIANGLE_ART,

    ...CONNECTOR_ART_SNAPS,
    ...RESISTOR_ART_SNAPS,
    ...CAPACITOR_ART_SNAPS,
    ...TRANSISTOR_ART_SNAPS,
    ...LED_ART_SNAPS,
};
