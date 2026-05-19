import { getComponentImage } from './componentAssets';

/** Footprint sizes: width × height in pin cells (columns × rows). */

export const COMPONENT_TYPES = {
    POWER_SUPPLY: 'power_supply',
    BUTTON: 'button',
    LAMP: 'lamp',
    RESISTOR: 'resistor',
    WIRE: 'wire',
    WIRE3: 'wire3',
};

const FOOTPRINTS = {
    [COMPONENT_TYPES.POWER_SUPPLY]: { w: 2, h: 3 },
    [COMPONENT_TYPES.BUTTON]: { w: 3, h: 1 },
    [COMPONENT_TYPES.LAMP]: { w: 3, h: 1 },
    [COMPONENT_TYPES.RESISTOR]: { w: 3, h: 1 },
    [COMPONENT_TYPES.WIRE3]: { w: 3, h: 1 },
};

export function getFootprint(type, wireLength) {
    if (type === COMPONENT_TYPES.WIRE) {
        const len = wireLength ?? 2;
        return { w: len, h: 1 };
    }
    return FOOTPRINTS[type] ?? { w: 1, h: 1 };
}

/** Snap terminals (dr, dc) relative to anchor — overlap allowed at these cells. */
const SNAP_OFFSETS = {
    [COMPONENT_TYPES.POWER_SUPPLY]: [
        { dr: 0, dc: 0 },
        { dr: 2, dc: 0 },
    ],
    [COMPONENT_TYPES.BUTTON]: [
        { dr: 0, dc: 0 },
        { dr: 0, dc: 2 },
    ],
    [COMPONENT_TYPES.LAMP]: [
        { dr: 0, dc: 0 },
        { dr: 0, dc: 2 },
    ],
    [COMPONENT_TYPES.WIRE3]: [
        { dr: 0, dc: 0 },
        { dr: 0, dc: 2 },
    ],
};

export function getSnapOffsets(type) {
    return SNAP_OFFSETS[type] ?? [];
}

export { getComponentImage };

/** Inventory for ST.L1.1 — first problem only for now. */
export const ST_L1_1_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.BUTTON,
        labelKa: 'ღილაკი',
        labelEn: 'Button',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა 6V',
        labelEn: 'Lamp 6V',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.WIRE3,
        labelKa: 'გამტარი 3',
        labelEn: 'Wire 3',
        maxCount: 10,
    },
];

export const WIRE_LENGTHS = [2, 3, 4, 5, 6, 7];

export function getPaletteForProblem(problemCode) {
    if (problemCode === 'ST.L1.1') {
        return ST_L1_1_PALETTE;
    }
    return null;
}

export function supportsSimulator(problemCode) {
    return problemCode === 'ST.L1.1';
}
