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

/**
 * Resistor SVGs in frontend/public/components/
 * Naming: …o = Ω, …ko = kΩ (e.g. 5ko1 → 5.1 kΩ).
 */
export const RESISTOR_SPECS = [
    { key: '20o', file: 'resistor-20o.svg', ohms: 20, pickerLabel: '20Ω', labelEn: '20 Ω', labelKa: '20 Ω' },
    { key: '100o', file: 'resistor-100o.svg', ohms: 100, pickerLabel: '100Ω', labelEn: '100 Ω', labelKa: '100 Ω' },
    { key: '1ko', file: 'resistor-1ko.svg', ohms: 1000, pickerLabel: '1k', labelEn: '1 kΩ', labelKa: '1 kΩ' },
    { key: '5ko1', file: 'resistor-5ko1.svg', ohms: 5100, pickerLabel: '5k1', labelEn: '5.1 kΩ', labelKa: '5.1 kΩ' },
    { key: '10ko', file: 'resistor-10ko.svg', ohms: 10000, pickerLabel: '10k', labelEn: '10 kΩ', labelKa: '10 kΩ' },
    { key: '100ko', file: 'resistor-100ko.svg', ohms: 100000, pickerLabel: '100k', labelEn: '100 kΩ', labelKa: '100 kΩ' },
    { key: '510ko', file: 'resistor-510ko.svg', ohms: 510000, pickerLabel: '510k', labelEn: '510 kΩ', labelKa: '510 kΩ' },
];

export const RESISTOR_KEYS = RESISTOR_SPECS.map((s) => s.key);

export function resistorType(key) {
    return `resistor_${key}`;
}

export function parseResistorKey(type) {
    const match = /^resistor_(.+)$/.exec(type ?? '');
    if (!match) return null;
    return RESISTOR_KEYS.includes(match[1]) ? match[1] : null;
}

export function isResistorType(type) {
    return parseResistorKey(type) !== null;
}

export function getResistorSpec(typeOrKey) {
    const key = parseResistorKey(typeOrKey) ?? typeOrKey;
    return RESISTOR_SPECS.find((s) => s.key === key) ?? null;
}

/** LED SVGs: led-red.svg, led-green.svg, led-blue.svg */
export const LED_SPECS = [
    {
        key: 'red',
        file: 'led-red.svg',
        pickerLabel: 'R',
        labelEn: 'LED Red',
        labelKa: 'LED წითელი',
        spiceColor: 'red',
    },
    {
        key: 'green',
        file: 'led-green.svg',
        pickerLabel: 'G',
        labelEn: 'LED Green',
        labelKa: 'LED მწვანე',
        spiceColor: 'green',
    },
    {
        key: 'blue',
        file: 'led-blue.svg',
        pickerLabel: 'B',
        labelEn: 'LED Blue',
        labelKa: 'LED ლურჯი',
        spiceColor: 'blue',
    },
];

export const LED_KEYS = LED_SPECS.map((s) => s.key);

export function ledType(key) {
    return `led_${key}`;
}

export function parseLedKey(type) {
    const match = /^led_(.+)$/.exec(type ?? '');
    if (!match) return null;
    return LED_KEYS.includes(match[1]) ? match[1] : null;
}

export function isLedType(type) {
    return parseLedKey(type) !== null;
}

export function getLedSpec(typeOrKey) {
    const key = parseLedKey(typeOrKey) ?? typeOrKey;
    return LED_SPECS.find((s) => s.key === key) ?? null;
}

/** Capacitor SVGs: capacitor-1uf.svg, … (uf = µF). */
export const CAPACITOR_SPECS = [
    {
        key: '1uf',
        file: 'capacitor-1uf.svg',
        pickerLabel: '1µ',
        labelEn: 'Capacitor 1 µF',
        labelKa: 'კონდენსატორი 1 µF',
        farads: 1e-6,
    },
    {
        key: '10uf',
        file: 'capacitor-10uf.svg',
        pickerLabel: '10µ',
        labelEn: 'Capacitor 10 µF',
        labelKa: 'კონდენსატორი 10 µF',
        farads: 10e-6,
    },
    {
        key: '100uf',
        file: 'capacitor-100uf.svg',
        pickerLabel: '100µ',
        labelEn: 'Capacitor 100 µF',
        labelKa: 'კონდენსატორი 100 µF',
        farads: 100e-6,
    },
    {
        key: '470uf',
        file: 'capacitor-470uf.svg',
        pickerLabel: '470µ',
        labelEn: 'Capacitor 470 µF',
        labelKa: 'კონდენსატორი 470 µF',
        farads: 470e-6,
    },
];

export const CAPACITOR_KEYS = CAPACITOR_SPECS.map((s) => s.key);

export function capacitorType(key) {
    return `capacitor_${key}`;
}

export function parseCapacitorKey(type) {
    const match = /^capacitor_(.+)$/.exec(type ?? '');
    if (!match) return null;
    return CAPACITOR_KEYS.includes(match[1]) ? match[1] : null;
}

export function isCapacitorType(type) {
    return parseCapacitorKey(type) !== null;
}

export function getCapacitorSpec(typeOrKey) {
    const key = parseCapacitorKey(typeOrKey) ?? typeOrKey;
    return CAPACITOR_SPECS.find((s) => s.key === key) ?? null;
}

/** 3×3 — top/bottom on one column, third pin from the middle row. */
export const THREE_PIN_FOOTPRINT = { w: 3, h: 3 };

/** Vertical transistor (npn/pnp): collector top, base left, emitter bottom (2×2). */
export const TRANSISTOR_TRIANGLE_FOOTPRINT = { w: 2, h: 2 };

/** Order matches SpiceGenerator: nodes[0]=base, [1]=collector, [2]=emitter. */
export const THREE_PIN_SNAP_VERTICAL = [
    { dr: 1, dc: 0 },
    { dr: 0, dc: 1 },
    { dr: 1, dc: 1 },
];

/** Horizontal triangle SVG (326×217): top/bottom at dc=2, base at dc=0. */
export const THREE_PIN_SNAP_HORIZONTAL = [
    { dr: 0, dc: 2 },
    { dr: 2, dc: 2 },
    { dr: 1, dc: 0 },
];

/** Apex-up triangle (slide switch): A top centre, B/C one row below (3×2 footprint). */
export const APEX_UP_TRIANGLE_FOOTPRINT = { w: 3, h: 2 };

export const THREE_PIN_SNAP_APEX_UP = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 2 },
];

export const RELAY_SNAP_OFFSETS = [
    { dr: 0, dc: 0 },
    { dr: 0, dc: 1 },
    { dr: 1, dc: 1 },
    { dr: 2, dc: 0 },
    { dr: 2, dc: 1 },
];

/** Transistor SVGs: npn-q1.svg, pnp-q2.svg, … */
export const TRANSISTOR_SPECS = [
    {
        key: 'q1',
        file: 'npn-q1.svg',
        pickerLabel: 'Q1',
        labelEn: 'NPN Q1',
        labelKa: 'NPN Q1',
        orientation: 'vertical',
    },
    {
        key: 'q2',
        file: 'pnp-q2.svg',
        pickerLabel: 'Q2',
        labelEn: 'PNP Q2',
        labelKa: 'PNP Q2',
        orientation: 'vertical',
    },
    {
        key: 'q3',
        file: 'npn-q3.svg',
        pickerLabel: 'Q3',
        labelEn: 'NPN Q3',
        labelKa: 'NPN Q3',
        orientation: 'vertical',
    },
    {
        key: 'q4',
        file: 'pnp-q4.svg',
        pickerLabel: 'Q4',
        labelEn: 'PNP Q4',
        labelKa: 'PNP Q4',
        orientation: 'vertical',
    },
];

export const TRANSISTOR_KEYS = TRANSISTOR_SPECS.map((s) => s.key);

export function transistorType(key) {
    return `transistor_${key}`;
}

export function parseTransistorKey(type) {
    const match = /^transistor_(.+)$/.exec(type ?? '');
    if (!match) return null;
    return TRANSISTOR_KEYS.includes(match[1]) ? match[1] : null;
}

export function isTransistorType(type) {
    return parseTransistorKey(type) !== null;
}

export function getTransistorSpec(typeOrKey) {
    const key = parseTransistorKey(typeOrKey) ?? typeOrKey;
    return TRANSISTOR_SPECS.find((s) => s.key === key) ?? null;
}

export const COMPONENT_TYPES = {
    POWER_SUPPLY: 'power_supply',
    BUTTON: 'button',
    LAMP: 'lamp',
    RESISTOR: 'resistor',
    SWITCH: 'switch',
    MOTOR: 'motor',
    DIODE: 'diode',
    RELAY: 'relay',
    SLIDE_SWITCH: 'slide_switch',
    VAR_RESISTOR: 'var_resistor',
};

const FOOTPRINTS = {
    [COMPONENT_TYPES.POWER_SUPPLY]: { w: 2, h: 3 },
    [COMPONENT_TYPES.BUTTON]: { w: 3, h: 1 },
    [COMPONENT_TYPES.LAMP]: { w: 3, h: 1 },
    [COMPONENT_TYPES.RESISTOR]: { w: 3, h: 1 },
    [COMPONENT_TYPES.SWITCH]: { w: 3, h: 1 },
    [COMPONENT_TYPES.MOTOR]: { w: 3, h: 1 },
};

function isTwoPinWideType(type) {
    return (
        isResistorType(type) ||
        isLedType(type) ||
        isCapacitorType(type) ||
        type === COMPONENT_TYPES.SWITCH ||
        type === COMPONENT_TYPES.MOTOR ||
        type === COMPONENT_TYPES.DIODE
    );
}

export function isThreePinTriangleType(type) {
    return (
        isTransistorType(type) ||
        type === COMPONENT_TYPES.SLIDE_SWITCH ||
        type === COMPONENT_TYPES.VAR_RESISTOR
    );
}

export function isApexUpTriangleType(type) {
    return (
        type === COMPONENT_TYPES.SLIDE_SWITCH ||
        type === COMPONENT_TYPES.VAR_RESISTOR
    );
}

export function isRelayType(type) {
    return type === COMPONENT_TYPES.RELAY;
}

/** Collision uses pin cells only — footprint is unchanged for layout/anchor. */
export function usesSnapOnlyCells(type) {
    return isThreePinTriangleType(type);
}

/**
 * Extra grid dot blocked under triangle body (not a terminal).
 * Apex-up: centre of bottom edge between B and C pins.
 * Transistor: centre of right edge on 3×3 triangle grid (outside 2×2 footprint).
 */
export function getTriangleBodyOffsets(type) {
    if (isApexUpTriangleType(type)) {
        return [{ dr: 1, dc: 1 }];
    }
    if (isTransistorType(type)) {
        return [{ dr: 1, dc: 2 }];
    }
    return [];
}

/** Footprint used when rotating triangle body cells (may differ from placement footprint). */
export function getTriangleBodyRotationFootprint(type) {
    if (isTransistorType(type)) {
        return THREE_PIN_FOOTPRINT;
    }
    return getFootprint(type);
}

export function getThreePinSnapOffsets(type) {
    if (isTransistorType(type)) {
        return THREE_PIN_SNAP_VERTICAL;
    }
    if (isApexUpTriangleType(type)) {
        return THREE_PIN_SNAP_APEX_UP;
    }
    return THREE_PIN_SNAP_VERTICAL;
}

export function getFootprint(type) {
    const connectorLen = parseConnectorLength(type);
    if (connectorLen !== null) {
        return { w: connectorLen, h: 1 };
    }
    if (isTwoPinWideType(type)) {
        return { w: 3, h: 1 };
    }
    if (isApexUpTriangleType(type)) {
        return APEX_UP_TRIANGLE_FOOTPRINT;
    }
    if (isTransistorType(type)) {
        return TRANSISTOR_TRIANGLE_FOOTPRINT;
    }
    if (isThreePinTriangleType(type)) {
        return THREE_PIN_FOOTPRINT;
    }
    if (isRelayType(type)) {
        return { w: 2, h: 3 };
    }
    return FOOTPRINTS[type] ?? { w: 1, h: 1 };
}

const TWO_PIN_SNAP = [
    { dr: 0, dc: 0 },
    { dr: 0, dc: 2 },
];

/** Snap terminals (dr, dc) relative to anchor — overlap allowed at these cells. */
const SNAP_OFFSETS = {
    [COMPONENT_TYPES.POWER_SUPPLY]: [
        { dr: 0, dc: 0 },
        { dr: 2, dc: 0 },
    ],
    [COMPONENT_TYPES.BUTTON]: TWO_PIN_SNAP,
    [COMPONENT_TYPES.LAMP]: TWO_PIN_SNAP,
    [COMPONENT_TYPES.SWITCH]: TWO_PIN_SNAP,
    [COMPONENT_TYPES.MOTOR]: TWO_PIN_SNAP,
};

export function getSnapOffsets(type) {
    const connectorLen = parseConnectorLength(type);
    if (connectorLen !== null) {
        return [
            { dr: 0, dc: 0 },
            { dr: 0, dc: connectorLen - 1 },
        ];
    }
    if (isTwoPinWideType(type)) {
        return TWO_PIN_SNAP;
    }
    if (isThreePinTriangleType(type)) {
        return getThreePinSnapOffsets(type);
    }
    if (isRelayType(type)) {
        return RELAY_SNAP_OFFSETS;
    }
    return SNAP_OFFSETS[type] ?? [];
}

/** First two art points used for span-based layout (see boardPlacement). */
export function getArtLayoutPair(type, points) {
    if (!points?.length) return [null, null];
    if (isRelayType(type) && points.length >= 4) {
        return [points[0], points[3]];
    }
    // Apex-up slide switch / var resistor: span top pin to bottom-right pin.
    if (points.length >= 3 && isApexUpTriangleType(type)) {
        return [points[0], points[2]];
    }
    // Vertical transistor: span collector to base (not collector–emitter column only).
    if (points.length >= 3 && isTransistorType(type)) {
        return [points[0], points[2]];
    }
    return [points[0], points[1]];
}

/** Top/bottom pins share a column — use vertical span layout. */
export function usesVerticalSpanLayout(s0, s1) {
    return s0.dc === s1.dc && Math.abs(s1.dr - s0.dr) >= 1;
}

export { getComponentImage };

export const CONNECTOR_GROUP_ID = 'connectors';

export const CONNECTOR_GROUP_PALETTE_ITEM = {
    type: CONNECTOR_GROUP_ID,
    paletteDisplay: 'connectorGroup',
    labelKa: 'გამტარები',
    labelEn: 'Connectors',
    maxCountPerLength: 10,
    lengths: CONNECTOR_LENGTHS,
};

export function isConnectorGroupItem(item) {
    return item?.paletteDisplay === 'connectorGroup';
}

export function getConnectorMaxCount(palette) {
    const group = palette?.find(isConnectorGroupItem);
    if (!group) return 0;
    return group.maxCountPerLength ?? 10;
}

export function getConnectorGroupItem(palette = []) {
    return palette.find(isConnectorGroupItem) ?? null;
}

export const RESISTOR_GROUP_ID = 'resistors';

export const RESISTOR_GROUP_PALETTE_ITEM = {
    type: RESISTOR_GROUP_ID,
    paletteDisplay: 'resistorGroup',
    labelKa: 'რეზისტორები',
    labelEn: 'Resistors',
    maxCountPerValue: 10,
    keys: RESISTOR_KEYS,
};

export function isResistorGroupItem(item) {
    return item?.paletteDisplay === 'resistorGroup';
}

export function getResistorMaxCount(palette) {
    const group = palette?.find(isResistorGroupItem);
    if (!group) return 0;
    return group.maxCountPerValue ?? 10;
}

export function getResistorGroupItem(palette = []) {
    return palette.find(isResistorGroupItem) ?? null;
}

export const LED_GROUP_ID = 'leds';

export const LED_GROUP_PALETTE_ITEM = {
    type: LED_GROUP_ID,
    paletteDisplay: 'ledGroup',
    labelKa: 'LED',
    labelEn: 'LEDs',
    maxCountPerColor: 10,
    keys: LED_KEYS,
};

export function isLedGroupItem(item) {
    return item?.paletteDisplay === 'ledGroup';
}

export function getLedMaxCount(palette) {
    const group = palette?.find(isLedGroupItem);
    if (!group) return 0;
    return group.maxCountPerColor ?? 10;
}

/** Per-color limit; uses palette entry maxCount when LED is listed directly (e.g. ST.L1.8). */
export function getLedMaxCountForType(palette, type) {
    const direct = palette?.find((p) => p.type === type);
    if (direct?.maxCount != null) {
        return direct.maxCount;
    }
    return getLedMaxCount(palette);
}

export function getLedGroupItem(palette = []) {
    return palette.find(isLedGroupItem) ?? null;
}

export const CAPACITOR_GROUP_ID = 'capacitors';

export const CAPACITOR_GROUP_PALETTE_ITEM = {
    type: CAPACITOR_GROUP_ID,
    paletteDisplay: 'capacitorGroup',
    labelKa: 'კონდენსატორები',
    labelEn: 'Capacitors',
    maxCountPerValue: 10,
    keys: CAPACITOR_KEYS,
};

export function isCapacitorGroupItem(item) {
    return item?.paletteDisplay === 'capacitorGroup';
}

export function getCapacitorMaxCount(palette) {
    const group = palette?.find(isCapacitorGroupItem);
    if (!group) return 0;
    return group.maxCountPerValue ?? 10;
}

export function getCapacitorGroupItem(palette = []) {
    return palette.find(isCapacitorGroupItem) ?? null;
}

export const TRANSISTOR_GROUP_ID = 'transistors';

export const TRANSISTOR_GROUP_PALETTE_ITEM = {
    type: TRANSISTOR_GROUP_ID,
    paletteDisplay: 'transistorGroup',
    labelKa: 'ტრანზისტორები',
    labelEn: 'Transistors',
    maxCountPerVariant: 10,
    keys: TRANSISTOR_KEYS,
};

export function isTransistorGroupItem(item) {
    return item?.paletteDisplay === 'transistorGroup';
}

export function getTransistorMaxCount(palette) {
    const group = palette?.find(isTransistorGroupItem);
    if (!group) return 0;
    return group.maxCountPerVariant ?? 10;
}

export function getTransistorGroupItem(palette = []) {
    return palette.find(isTransistorGroupItem) ?? null;
}

export function getStandardPaletteItems(palette = []) {
    return palette.filter(
        (p) =>
            !isConnectorGroupItem(p) &&
            !isResistorGroupItem(p) &&
            !isLedGroupItem(p) &&
            !isCapacitorGroupItem(p) &&
            !isTransistorGroupItem(p)
    );
}

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
        type: COMPONENT_TYPES.SWITCH,
        labelKa: 'გადამრთველი',
        labelEn: 'Switch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'მოტორი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.DIODE,
        labelKa: 'დიოდი',
        labelEn: 'Diode',
        maxCount: 10,
    },
    {
        type: COMPONENT_TYPES.RELAY,
        labelKa: 'რელე',
        labelEn: 'Relay',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.SLIDE_SWITCH,
        labelKa: 'სლაიდერი',
        labelEn: 'Slide Switch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
    RESISTOR_GROUP_PALETTE_ITEM,
    CAPACITOR_GROUP_PALETTE_ITEM,
    TRANSISTOR_GROUP_PALETTE_ITEM,
    LED_GROUP_PALETTE_ITEM,
];

/** Inventory for ST.L1.2 — two power supplies in series, button, lamp, connectors only. */
export const ST_L1_2_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 2,
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
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for ST.L1.3 — button, lamp, series switch, one supply, connectors only. */
export const ST_L1_3_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.SWITCH,
        labelKa: 'ჩამრთველი',
        labelEn: 'Switch',
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
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for ST.L2.4 — two supplies, switch, two buttons, lamp, connectors. */
export const ST_L2_4_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.SWITCH,
        labelKa: 'ჩამრთველი',
        labelEn: 'Switch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.BUTTON,
        labelKa: 'ღილაკი',
        labelEn: 'Button',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა 6V',
        labelEn: 'Lamp 6V',
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for ST.L1.5 — lamp, resistor, switch, two supplies, connectors only. */
export const ST_L1_5_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.SWITCH,
        labelKa: 'ჩამრთველი',
        labelEn: 'Switch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა 6V',
        labelEn: 'Lamp 6V',
        maxCount: 1,
    },
    RESISTOR_GROUP_PALETTE_ITEM,
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for CP.L1.x — RC LED: cap, button, red LED, resistors, two supplies. */
export const CP_L1_1_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.BUTTON,
        labelKa: 'ღილაკი',
        labelEn: 'Button',
        maxCount: 1,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
        maxCount: 1,
    },
    {
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 1,
    },
    RESISTOR_GROUP_PALETTE_ITEM,
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for ST.L1.8 — red LED with series resistor + button + switch, one supply. */
export const ST_L1_8_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.SWITCH,
        labelKa: 'ჩამრთველი',
        labelEn: 'Switch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.BUTTON,
        labelKa: 'ღილაკი',
        labelEn: 'Button',
        maxCount: 1,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
        maxCount: 1,
    },
    RESISTOR_GROUP_PALETTE_ITEM,
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for ST.L2.9 — red + green LEDs in series, switch, button, two supplies. */
export const ST_L2_9_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.SWITCH,
        labelKa: 'ჩამრთველი',
        labelEn: 'Switch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.BUTTON,
        labelKa: 'ღილაკი',
        labelEn: 'Button',
        maxCount: 1,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
        maxCount: 1,
    },
    {
        type: ledType('green'),
        labelKa: 'LED მწვანე',
        labelEn: 'LED Green',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for LR.L1.1 — two red LEDs (series or parallel), switch, button, two supplies. */
export const LR_L1_1_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.SWITCH,
        labelKa: 'ჩამრთველი',
        labelEn: 'Switch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.BUTTON,
        labelKa: 'ღილაკი',
        labelEn: 'Button',
        maxCount: 1,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
        maxCount: 2,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** LR.L1.2 — same as L1.1 but one supply (parallel LEDs). */
export const LR_L1_2_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.SWITCH,
        labelKa: 'ჩამრთველი',
        labelEn: 'Switch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.BUTTON,
        labelKa: 'ღილაკი',
        labelEn: 'Button',
        maxCount: 1,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
        maxCount: 2,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** LR.L1.3 — unequal brightness: two resistors of different values. */
export const LR_L1_3_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.SWITCH,
        labelKa: 'ჩამრთველი',
        labelEn: 'Switch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.BUTTON,
        labelKa: 'ღილაკი',
        labelEn: 'Button',
        maxCount: 1,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
        maxCount: 2,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 10,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** LR.L2.4 — lamp || (R+LED), switch + button, two supplies. */
export const LR_L2_4_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.SWITCH,
        labelKa: 'ჩამრთველი',
        labelEn: 'Switch',
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
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 10,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** LR.L2.5 — independent button→lamp / button→LED branches. */
export const LR_L2_5_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.SWITCH,
        labelKa: 'ჩამრთველი',
        labelEn: 'Switch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.BUTTON,
        labelKa: 'ღილაკი',
        labelEn: 'Button',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა 6V',
        labelEn: 'Lamp 6V',
        maxCount: 1,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 10,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for ST.L2.10 — two buttons + red LED; both buttons required (AND). */
export const ST_L2_10_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.SWITCH,
        labelKa: 'ჩამრთველი',
        labelEn: 'Switch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.BUTTON,
        labelKa: 'ღილაკი',
        labelEn: 'Button',
        maxCount: 2,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for ST.L2.11 — two buttons in parallel (OR); either lights the LED. */
export const ST_L2_11_PALETTE = ST_L2_10_PALETTE;

/** ST.L2.12 — OR buttons; green + blue LEDs in series; two supplies. */
export const ST_L2_12_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.SWITCH,
        labelKa: 'ჩამრთველი',
        labelEn: 'Switch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.BUTTON,
        labelKa: 'ღილაკი',
        labelEn: 'Button',
        maxCount: 2,
    },
    {
        type: ledType('green'),
        labelKa: 'LED მწვანე',
        labelEn: 'LED Green',
        maxCount: 1,
    },
    {
        type: ledType('blue'),
        labelKa: 'LED ლურჯი',
        labelEn: 'LED Blue',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 10,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** ST.L2.13 — independent branches: red / blue, one supply. */
export const ST_L2_13_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.SWITCH,
        labelKa: 'ჩამრთველი',
        labelEn: 'Switch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.BUTTON,
        labelKa: 'ღილაკი',
        labelEn: 'Button',
        maxCount: 2,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
        maxCount: 1,
    },
    {
        type: ledType('blue'),
        labelKa: 'LED ლურჯი',
        labelEn: 'LED Blue',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 10,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** ST.L2.14 — independent branches: 2×green / 2×blue; two supplies. */
export const ST_L2_14_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.SWITCH,
        labelKa: 'ჩამრთველი',
        labelEn: 'Switch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.BUTTON,
        labelKa: 'ღილაკი',
        labelEn: 'Button',
        maxCount: 2,
    },
    {
        type: ledType('green'),
        labelKa: 'LED მწვანე',
        labelEn: 'LED Green',
        maxCount: 2,
    },
    {
        type: ledType('blue'),
        labelKa: 'LED ლურჯი',
        labelEn: 'LED Blue',
        maxCount: 2,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 10,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** CP.L1.2 — same parts as CP.L1.1 (charge resistor + discharge resistor). */
export const CP_L1_2_PALETTE = CP_L1_1_PALETTE;

/** Inventory for CP.L2.3 — dual-cap RC LEDs with SPDT slide switch. */
export const CP_L2_3_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.SLIDE_SWITCH,
        labelKa: 'გადამრთველი',
        labelEn: 'Slide Switch',
        maxCount: 1,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
        maxCount: 1,
    },
    {
        type: ledType('green'),
        labelKa: 'LED მწვანე',
        labelEn: 'LED Green',
        maxCount: 1,
    },
    {
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 2,
    },
    RESISTOR_GROUP_PALETTE_ITEM,
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for CP.L2.4 — button paralleling cap across LED (instant off, slow on).
 * Needs series LED resistor + parallel discharge resistor.
 */
export const CP_L2_4_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.BUTTON,
        labelKa: 'ღილაკი',
        labelEn: 'Button',
        maxCount: 1,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
        maxCount: 1,
    },
    {
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 1,
    },
    RESISTOR_GROUP_PALETTE_ITEM,
    CONNECTOR_GROUP_PALETTE_ITEM,
];

export function getPaletteForProblem(problemCode) {
    if (problemCode === 'ST.L1.1') {
        return ST_L1_1_PALETTE;
    }
    if (problemCode === 'ST.L1.2') {
        return ST_L1_2_PALETTE;
    }
    if (problemCode === 'ST.L1.3') {
        return ST_L1_3_PALETTE;
    }
    if (problemCode === 'ST.L1.5') {
        return ST_L1_5_PALETTE;
    }
    if (problemCode === 'ST.L1.8') {
        return ST_L1_8_PALETTE;
    }
    if (problemCode === 'ST.L2.4') {
        return ST_L2_4_PALETTE;
    }
    if (problemCode === 'ST.L2.9') {
        return ST_L2_9_PALETTE;
    }
    if (problemCode === 'LR.L1.1') {
        return LR_L1_1_PALETTE;
    }
    if (problemCode === 'LR.L1.2') {
        return LR_L1_2_PALETTE;
    }
    if (problemCode === 'LR.L1.3') {
        return LR_L1_3_PALETTE;
    }
    if (problemCode === 'LR.L2.4') {
        return LR_L2_4_PALETTE;
    }
    if (problemCode === 'LR.L2.5') {
        return LR_L2_5_PALETTE;
    }
    if (problemCode === 'ST.L2.10') {
        return ST_L2_10_PALETTE;
    }
    if (problemCode === 'ST.L2.11') {
        return ST_L2_11_PALETTE;
    }
    if (problemCode === 'ST.L2.12') {
        return ST_L2_12_PALETTE;
    }
    if (problemCode === 'ST.L2.13') {
        return ST_L2_13_PALETTE;
    }
    if (problemCode === 'ST.L2.14') {
        return ST_L2_14_PALETTE;
    }
    if (problemCode === 'CP.L1.1') {
        return CP_L1_1_PALETTE;
    }
    if (problemCode === 'CP.L1.2') {
        return CP_L1_2_PALETTE;
    }
    if (problemCode === 'CP.L2.3') {
        return CP_L2_3_PALETTE;
    }
    if (problemCode === 'CP.L2.4') {
        return CP_L2_4_PALETTE;
    }
    return null;
}

export function supportsSimulator(problemCode) {
    return (
        problemCode === 'ST.L1.1' ||
        problemCode === 'ST.L1.2' ||
        problemCode === 'ST.L1.3' ||
        problemCode === 'ST.L1.5' ||
        problemCode === 'ST.L1.8' ||
        problemCode === 'ST.L2.4' ||
        problemCode === 'ST.L2.9' ||
        problemCode === 'LR.L1.1' ||
        problemCode === 'LR.L1.2' ||
        problemCode === 'LR.L1.3' ||
        problemCode === 'LR.L2.4' ||
        problemCode === 'LR.L2.5' ||
        problemCode === 'ST.L2.10' ||
        problemCode === 'ST.L2.11' ||
        problemCode === 'ST.L2.12' ||
        problemCode === 'ST.L2.13' ||
        problemCode === 'ST.L2.14' ||
        problemCode === 'CP.L1.1' ||
        problemCode === 'CP.L1.2' ||
        problemCode === 'CP.L2.3' ||
        problemCode === 'CP.L2.4'
    );
}

export function usesTransientSimulation(problemCode) {
    return (
        problemCode === 'CP.L1.1' ||
        problemCode === 'CP.L1.2' ||
        problemCode === 'CP.L2.3' ||
        problemCode === 'CP.L2.4'
    );
}

/** CP.L1.2 / CP.L2.4: charge .tran on button press. */
export function usesSlowChargeSimulation(problemCode) {
    return problemCode === 'CP.L1.2' || problemCode === 'CP.L2.4';
}

/** CP.L2.3: SPDT slide switch toggles dual-LED RC crossfade. */
export function usesSwitchCrossfadeSimulation(problemCode) {
    return problemCode === 'CP.L2.3';
}

/**
 * CP.L2.4: press dips LED then slow reclaim — stretch settle window like crossfade.
 */
export function usesParallelCapDipSimulation(problemCode) {
    return problemCode === 'CP.L2.4';
}

/** Parts that must be on the board before Submit (per problem). */
const PROBLEM_REQUIRED_PARTS = {
    'ST.L1.1': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
    ],
    'ST.L1.2': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
    ],
    'ST.L1.3': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 1 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
    ],
    'ST.L1.5': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'ST.L1.8': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 1 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'ST.L2.4': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 2 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
    ],
    'ST.L2.9': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'LR.L1.1': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: ledType('red'), maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'LR.L1.2': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 1 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: ledType('red'), maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'LR.L1.3': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 1 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: ledType('red'), maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'LR.L2.4': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'LR.L2.5': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 2 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'ST.L2.10': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 1 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 2 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'ST.L2.11': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 1 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 2 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'ST.L2.12': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 2 },
        { type: ledType('green'), maxCount: 1 },
        { type: ledType('blue'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'ST.L2.13': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 1 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 2 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('blue'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'ST.L2.14': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 2 },
        { type: ledType('green'), maxCount: 2 },
        { type: ledType('blue'), maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'CP.L1.1': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: 'capacitor', maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'CP.L1.2': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: 'capacitor', maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'CP.L2.3': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: 'capacitor', maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'CP.L2.4': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: 'capacitor', maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
};

export function getRequiredPartsForProblem(problemCode) {
    return PROBLEM_REQUIRED_PARTS[problemCode] ?? null;
}
