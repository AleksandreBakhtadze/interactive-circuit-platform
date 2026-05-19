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

/** Vertical triangle SVG (217×326): top/bottom at dc=1, base at dc=0. */
export const THREE_PIN_SNAP_VERTICAL = [
    { dr: 0, dc: 1 },
    { dr: 2, dc: 1 },
    { dr: 1, dc: 0 },
];

/** Horizontal triangle SVG (326×217): top/bottom at dc=2, base at dc=0. */
export const THREE_PIN_SNAP_HORIZONTAL = [
    { dr: 0, dc: 2 },
    { dr: 2, dc: 2 },
    { dr: 1, dc: 0 },
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

export function isRelayType(type) {
    return type === COMPONENT_TYPES.RELAY;
}

export function getThreePinSnapOffsets(type) {
    if (isTransistorType(type)) {
        return THREE_PIN_SNAP_VERTICAL;
    }
    if (
        type === COMPONENT_TYPES.SLIDE_SWITCH ||
        type === COMPONENT_TYPES.VAR_RESISTOR
    ) {
        return THREE_PIN_SNAP_HORIZONTAL;
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

export function getPaletteForProblem(problemCode) {
    if (problemCode === 'ST.L1.1') {
        return ST_L1_1_PALETTE;
    }
    return null;
}

export function supportsSimulator(problemCode) {
    return problemCode === 'ST.L1.1';
}
