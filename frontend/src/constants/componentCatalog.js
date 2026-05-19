import { getComponentImage } from './componentAssets';

/** Footprint sizes: width × height in pin cells (columns × rows). */

export const CONNECTOR_LENGTHS = [2, 3, 4, 5, 6, 7];

export function connectorType(length) {
    return `connector${length}`;
}

export function parseConnectorLength(type) {
    const match = /^connector(\d)$/.exec(type ?? '');
    if (!match) return null;
    const n = Number(match[1]);
    return CONNECTOR_LENGTHS.includes(n) ? n : null;
}

export function isConnectorType(type) {
    return parseConnectorLength(type) !== null;
}

export const COMPONENT_TYPES = {
    POWER_SUPPLY: 'power_supply',
    BUTTON: 'button',
    LAMP: 'lamp',
    RESISTOR: 'resistor',
};

const FOOTPRINTS = {
    [COMPONENT_TYPES.POWER_SUPPLY]: { w: 2, h: 3 },
    [COMPONENT_TYPES.BUTTON]: { w: 3, h: 1 },
    [COMPONENT_TYPES.LAMP]: { w: 3, h: 1 },
    [COMPONENT_TYPES.RESISTOR]: { w: 3, h: 1 },
};

export function getFootprint(type) {
    const connectorLen = parseConnectorLength(type);
    if (connectorLen !== null) {
        return { w: connectorLen, h: 1 };
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
};

export function getSnapOffsets(type) {
    const connectorLen = parseConnectorLength(type);
    if (connectorLen !== null) {
        return [
            { dr: 0, dc: 0 },
            { dr: 0, dc: connectorLen - 1 },
        ];
    }
    return SNAP_OFFSETS[type] ?? [];
}

export { getComponentImage };

const CONNECTOR_PALETTE_ITEMS = CONNECTOR_LENGTHS.map((n) => ({
    type: connectorType(n),
    labelKa: `გამტარი ${n}`,
    labelEn: `Connector ${n}`,
    maxCount: 10,
}));

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
    ...CONNECTOR_PALETTE_ITEMS,
];

export function getPaletteForProblem(problemCode) {
    if (problemCode === 'ST.L1.1') {
        return ST_L1_1_PALETTE;
    }
    return null;
}

export function supportsSimulator(problemCode) {
    return problemCode === 'ST.L1.1';
}
