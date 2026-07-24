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

/** Free two-pin cable wires (rubber-band place: pin → drag → pin). */
export const WIRE_COLOR_SPECS = [
    {
        key: 'red',
        file: 'wire-pin-red.svg',
        cable: '#c62828',
        pickerLabel: 'R',
        labelEn: 'Red',
        labelKa: 'წითელი',
    },
    {
        key: 'lightRed',
        file: 'wire-pin-light-red.svg',
        cable: '#d98989',
        pickerLabel: 'L',
        labelEn: 'Light red',
        labelKa: 'ღია წითელი',
    },
    {
        key: 'black',
        file: 'wire-pin-black.svg',
        cable: '#616161',
        pickerLabel: 'B',
        labelEn: 'Black',
        labelKa: 'შავი',
    },
];

export const WIRE_COLOR_KEYS = WIRE_COLOR_SPECS.map((s) => s.key);

export function getWireColorSpec(colorKey) {
    return (
        WIRE_COLOR_SPECS.find((s) => s.key === colorKey) ?? WIRE_COLOR_SPECS[0]
    );
}

export function getWirePinImage(colorKey) {
    return `/components/${getWireColorSpec(colorKey).file}`;
}

export function getWireCableColor(colorKey) {
    return getWireColorSpec(colorKey).cable;
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
        // Approx. forward (turn-on) voltage. Red < green < blue.
        forwardVoltage: 1.8,
        vfEn: '≈1.8 V',
        vfKa: '≈1.8 ვ',
    },
    {
        key: 'green',
        file: 'led-green.svg',
        pickerLabel: 'G',
        labelEn: 'LED Green',
        labelKa: 'LED მწვანე',
        spiceColor: 'green',
        forwardVoltage: 2.1,
        vfEn: '≈2.1 V',
        vfKa: '≈2.1 ვ',
    },
    {
        key: 'blue',
        file: 'led-blue.svg',
        pickerLabel: 'B',
        labelEn: 'LED Blue',
        labelKa: 'LED ლურჯი',
        spiceColor: 'blue',
        forwardVoltage: 3.0,
        vfEn: '≈3.0 V',
        vfKa: '≈3.0 ვ',
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

/** Vertical transistor (npn/pnp): shared footprint — top/bottom holes.
 * NPN art: collector top, emitter bottom. PNP art: emitter arrow on top pin;
 * circuitNetlist swaps C/E for PNP so SPICE matches the symbol. */
export const TRANSISTOR_TRIANGLE_FOOTPRINT = { w: 2, h: 3 };

/** Order matches SpiceGenerator: nodes[0]=base, [1]=collector, [2]=emitter
 * (after PNP C/E swap in circuitNetlist). */
export const THREE_PIN_SNAP_VERTICAL = [
    { dr: 1, dc: 0 }, // base (middle left)
    { dr: 0, dc: 1 }, // NPN collector / PNP emitter hole (top right)
    { dr: 2, dc: 1 }, // NPN emitter / PNP collector hole (bottom right)
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
        labelEn: 'NPN Q3 (Darlington)',
        labelKa: 'NPN Q3 (დარლინგტონი)',
        orientation: 'vertical',
    },
    {
        key: 'q4',
        file: 'pnp-q4.svg',
        pickerLabel: 'Q4',
        labelEn: 'PNP Q4 (Darlington)',
        labelKa: 'PNP Q4 (დარლინგტონი)',
        orientation: 'vertical',
    },
    /** @deprecated Prefer q3 — kept so older drafts with transistor_qd still load. */
    {
        key: 'qd',
        file: 'npn-q3.svg',
        pickerLabel: 'Q3',
        labelEn: 'NPN Q3 (Darlington)',
        labelKa: 'NPN Q3 (დარლინგტონი)',
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
    PHOTO_RESISTOR: 'photo_resistor',
    TORCH: 'torch',
    COVER: 'cover',
    WIRE: 'wire',
};

export function isWireType(type) {
    return type === COMPONENT_TYPES.WIRE;
}

const FOOTPRINTS = {
    [COMPONENT_TYPES.POWER_SUPPLY]: { w: 2, h: 3 },
    [COMPONENT_TYPES.BUTTON]: { w: 3, h: 1 },
    [COMPONENT_TYPES.LAMP]: { w: 3, h: 1 },
    [COMPONENT_TYPES.RESISTOR]: { w: 3, h: 1 },
    [COMPONENT_TYPES.SWITCH]: { w: 3, h: 1 },
    [COMPONENT_TYPES.MOTOR]: { w: 3, h: 1 },
    [COMPONENT_TYPES.PHOTO_RESISTOR]: { w: 3, h: 1 },
    [COMPONENT_TYPES.TORCH]: { w: 1, h: 1 },
    [COMPONENT_TYPES.COVER]: { w: 1, h: 1 },
};

function isTwoPinWideType(type) {
    return (
        isResistorType(type) ||
        isLedType(type) ||
        isCapacitorType(type) ||
        type === COMPONENT_TYPES.SWITCH ||
        type === COMPONENT_TYPES.MOTOR ||
        type === COMPONENT_TYPES.DIODE ||
        type === COMPONENT_TYPES.PHOTO_RESISTOR
    );
}

export function isPhotoResistorType(type) {
    return type === COMPONENT_TYPES.PHOTO_RESISTOR;
}

export function isTorchType(type) {
    return type === COMPONENT_TYPES.TORCH;
}

export function isCoverType(type) {
    return type === COMPONENT_TYPES.COVER;
}

/** Torch / cover — placed on board but not wired into the circuit. */
export function isPhotoAccessoryType(type) {
    return isTorchType(type) || isCoverType(type);
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

/**
 * Collision uses pin (+ optional body) dots only — not the full footprint box.
 * Lets a resistor / wire sit on the transistor base tip (left pin) while the
 * empty corners of the 2×3 stay free for that part’s middle segment.
 */
export function usesSnapOnlyCells(type) {
    return isThreePinTriangleType(type);
}

/**
 * Extra grid dot blocked under triangle body (not a terminal).
 * Apex-up: centre of bottom edge between B and C pins.
 * Transistors: no extra body block — tip/base pin must stay shareable.
 */
export function getTriangleBodyOffsets(type) {
    if (isApexUpTriangleType(type)) {
        return [{ dr: 1, dc: 1 }];
    }
    return [];
}

/** Footprint used when rotating triangle body cells (may differ from placement footprint). */
export function getTriangleBodyRotationFootprint(type) {
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
    if (isWireType(type)) {
        return { w: 1, h: 1 };
    }
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
    [COMPONENT_TYPES.PHOTO_RESISTOR]: TWO_PIN_SNAP,
};

export function getSnapOffsets(type) {
    if (isWireType(type)) {
        return [{ dr: 0, dc: 0 }];
    }
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
    // Vertical transistor: span collector to emitter (same column, full height).
    if (points.length >= 2 && isTransistorType(type)) {
        return [points[0], points[1]];
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

export const WIRE_GROUP_ID = 'wires';

export const WIRE_GROUP_PALETTE_ITEM = {
    type: COMPONENT_TYPES.WIRE,
    paletteDisplay: 'wireGroup',
    labelKa: 'მავთულები',
    labelEn: 'Wires',
    maxCount: 20,
    colors: WIRE_COLOR_KEYS,
};

export function isWireGroupItem(item) {
    return item?.paletteDisplay === 'wireGroup';
}

export function getWireMaxCount(palette) {
    const group = palette?.find(isWireGroupItem);
    if (!group) return 0;
    return group.maxCount ?? 20;
}

export function getWireGroupItem(palette = []) {
    return palette.find(isWireGroupItem) ?? null;
}

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
    // Prefer explicit total cap (e.g. DI.L1.4 / SW.L2.3: only one resistor).
    if (group.maxCount != null) return group.maxCount;
    return group.maxCountPerValue ?? 10;
}

/** True when palette caps total resistors across all values (not per-value). */
export function usesResistorTotalCap(palette) {
    const group = palette?.find(isResistorGroupItem);
    return group?.maxCount != null;
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

/** Per-variant limit; uses palette entry maxCount when transistor is listed directly. */
export function getTransistorMaxCount(palette, type = null) {
    if (type) {
        const direct = palette?.find((p) => p.type === type);
        if (direct?.maxCount != null) {
            return direct.maxCount;
        }
    }
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
            !isWireGroupItem(p) &&
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
    WIRE_GROUP_PALETTE_ITEM,
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

/**
 * Inventory for DM.L1.1 — series switch + button + motor.
 * One supply required for Submit; second allowed for post-task voltage comparison.
 */
export const DM_L1_1_PALETTE = [
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
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for DM.L2.2 — motor; SPDT selects mid-tap vs full supply for slow/fast.
 */
export const DM_L2_2_PALETTE = [
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
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for DM.L2.3 — motor; SPDT series R/lamp vs bypass (no mid-tap).
 */
export const DM_L2_3_PALETTE = [
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
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for DM.L2.6 — dual-rail center tap + SPDT reverses motor spin direction. */
export const DM_L2_6_PALETTE = [
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
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for DM.L2.7 — reverse spin via SPDT + equal-R voltage divider (no battery mid-tap).
 */
export const DM_L2_7_PALETTE = [
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
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 4,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for DM.L2.8 — two-SPDT H-bridge reverse / stop motor.
 */
export const DM_L2_8_PALETTE = [
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
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for DM.L3.9 — reverse motor + anti-parallel red/green LED indicators.
 */
export const DM_L3_9_PALETTE = [
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
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
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
        maxCount: 4,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for DM.L2.10 — stall indicator: sense R/lamp ‖ (LED+R) in series with motor.
 * Wide kit (like L4.4); click motor in sim to stall/release.
 */
export const DM_L2_10_PALETTE = [
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
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
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
        maxCount: 2,
    },
    {
        type: ledType('blue'),
        labelKa: 'LED ლურჯი',
        labelEn: 'LED Blue',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 6,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for DM.L3.11 — run (green) + stall (red) indicators across motor / sense R.
 * Sense ≈100 Ω so stalled V_motor stays below green Vf; click motor to stall.
 */
export const DM_L3_11_PALETTE = [
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
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
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
        maxCount: 6,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for DM.L2.13 — mid-tap voltage SPDT + lamp/motor select SPDT + master SPST.
 */
export const DM_L2_13_PALETTE = [
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
        type: COMPONENT_TYPES.SLIDE_SWITCH,
        labelKa: 'გადამრთველი',
        labelEn: 'Slide Switch',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for DM.L3.14 — motor-as-generator practice (inertia / LED indication).
 * Practice only: SPICE motor is resistive (no coasting back-EMF).
 */
export const DM_L3_14_PALETTE = [
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
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
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
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 6,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for DM.L2.5 — motor runs with switch; parallel button bypass stops it.
 * Series lamp or resistor(s) required so the button does not short the supply.
 */
export const DM_L2_5_PALETTE = [
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
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 4,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for DM.L4.4 — open measurement lab (motor Ri via voltage compare).
 * Practice/sim only: spinning vs stalled Ri is not modeled in SPICE.
 */
export const DM_L4_4_PALETTE = [
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
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
        maxCount: 2,
    },
    {
        type: ledType('green'),
        labelKa: 'LED მწვანე',
        labelEn: 'LED Green',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 6,
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

/** Inventory for VR.L1.1 — pot + red LED + series R + switch, two 3 V supplies. */
export const VR_L1_1_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
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
        maxCountPerValue: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for PR.L1.1 — photoresistor + red LED + series R + switch, two supplies. */
export const PR_L1_1_PALETTE = [
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
        type: COMPONENT_TYPES.PHOTO_RESISTOR,
        labelKa: 'ფოტორეზისტორი',
        labelEn: 'Photoresistor',
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
        maxCountPerValue: 1,
    },
    {
        type: COMPONENT_TYPES.TORCH,
        labelKa: 'ფანრი',
        labelEn: 'Torch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.COVER,
        labelKa: 'დამფარავი',
        labelEn: 'Cover',
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for PR.L1.2 — same parts as L1.1 (parallel PR ∥ LED). */
export const PR_L1_2_PALETTE = PR_L1_1_PALETTE;

/** Inventory for PR.L2.3 — parallel LED ∥ (PR + series R); two 1 kΩ resistors. */
export const PR_L2_3_PALETTE = [
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
        type: COMPONENT_TYPES.PHOTO_RESISTOR,
        labelKa: 'ფოტორეზისტორი',
        labelEn: 'Photoresistor',
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
        maxCountPerValue: 2,
    },
    {
        type: COMPONENT_TYPES.TORCH,
        labelKa: 'ფანრი',
        labelEn: 'Torch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.COVER,
        labelKa: 'დამფარავი',
        labelEn: 'Cover',
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for PR.L2.4 — SPDT mode switch + 1k/5.1k + blue LED (combined PR modes). */
export const PR_L2_4_PALETTE = [
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
        type: COMPONENT_TYPES.SLIDE_SWITCH,
        labelKa: 'გადამრთველი',
        labelEn: 'Slide Switch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.PHOTO_RESISTOR,
        labelKa: 'ფოტორეზისტორი',
        labelEn: 'Photoresistor',
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
        maxCountPerValue: 1,
    },
    {
        type: COMPONENT_TYPES.TORCH,
        labelKa: 'ფანრი',
        labelEn: 'Torch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.COVER,
        labelKa: 'დამფარავი',
        labelEn: 'Cover',
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for PR.L1.5 — PR + button + two red LEDs; sync via parallel link. */
export const PR_L1_5_PALETTE = [
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
        type: COMPONENT_TYPES.PHOTO_RESISTOR,
        labelKa: 'ფოტორეზისტორი',
        labelEn: 'Photoresistor',
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
    {
        type: COMPONENT_TYPES.TORCH,
        labelKa: 'ფანრი',
        labelEn: 'Torch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.COVER,
        labelKa: 'დამფარავი',
        labelEn: 'Cover',
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for PR.L2.9 — unequal series R + PR bridge equalizes two red LEDs. */
export const PR_L2_9_PALETTE = [
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
        type: COMPONENT_TYPES.PHOTO_RESISTOR,
        labelKa: 'ფოტორეზისტორი',
        labelEn: 'Photoresistor',
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
    {
        type: COMPONENT_TYPES.TORCH,
        labelKa: 'ფანრი',
        labelEn: 'Torch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.COVER,
        labelKa: 'დამფარავი',
        labelEn: 'Cover',
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for PR.L3.10 — antiparallel red/green + PR–R divider vs supply mid-rail. */
export const PR_L3_10_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.PHOTO_RESISTOR,
        labelKa: 'ფოტორეზისტორი',
        labelEn: 'Photoresistor',
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
    {
        type: COMPONENT_TYPES.TORCH,
        labelKa: 'ფანრი',
        labelEn: 'Torch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.COVER,
        labelKa: 'დამფარავი',
        labelEn: 'Cover',
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for PR.L3.11 — series red/green + PR–R divider tap at LED midpoint. */
export const PR_L3_11_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.PHOTO_RESISTOR,
        labelKa: 'ფოტორეზისტორი',
        labelEn: 'Photoresistor',
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
        maxCountPerValue: 3,
    },
    {
        type: COMPONENT_TYPES.TORCH,
        labelKa: 'ფანრი',
        labelEn: 'Torch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.COVER,
        labelKa: 'დამფარავი',
        labelEn: 'Cover',
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for PR.L2.12 — quiz: equal R networks + PR + red/green (practice/sim, no validation).
 */
export const PR_L2_12_PALETTE = [
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
        type: COMPONENT_TYPES.PHOTO_RESISTOR,
        labelKa: 'ფოტორეზისტორი',
        labelEn: 'Photoresistor',
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
        maxCountPerValue: 2,
    },
    {
        type: COMPONENT_TYPES.TORCH,
        labelKa: 'ფანრი',
        labelEn: 'Torch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.COVER,
        labelKa: 'დამფარავი',
        labelEn: 'Cover',
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for PR.L3.6 — ambient PR resistance measurement lab (practice/sim only).
 * Free choice of parts; hint uses two matched LEDs + known resistors.
 */
export const PR_L3_6_PALETTE = [
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
        type: COMPONENT_TYPES.PHOTO_RESISTOR,
        labelKa: 'ფოტორეზისტორი',
        labelEn: 'Photoresistor',
        maxCount: 1,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
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
        maxCountPerValue: 3,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for VR.L1.2 — pot voltage divider + LED/series R + parallel R, two 3 V supplies. */
export const VR_L1_2_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
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
        maxCountPerValue: 2,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for VR.L1.3 — series R into pot wiper; red/green on B and C. */
export const VR_L1_3_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
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

/** Inventory for VR.L1.20 — two resistors form voltage divider mid-rail; anti-parallel red+green LEDs. */
export const VR_L1_20_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
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
        maxCountPerValue: 2,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for VR.L3.22 — pot feeds RGB branches (10k/5.1k/1k); bottom track via 1k to GND. */
export const VR_L3_22_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
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
        type: ledType('blue'),
        labelKa: 'LED ლურჯი',
        labelEn: 'LED Blue',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 2,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for VR.L4.23 — BGR sequence; pot + per-color divider branches (extra R allowed). */
export const VR_L4_23_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
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
        type: ledType('blue'),
        labelKa: 'LED ლურჯი',
        labelEn: 'LED Blue',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 3,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for VR.L3.19 — pot as voltage divider; anti-parallel red+green LEDs. */
export const VR_L3_19_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
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

/** Inventory for VR.L1.4 — button enables pot wiper; series R + red LED. */
export const VR_L1_4_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
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
        maxCountPerValue: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for VR.L1.5 — button bypasses (parallels) the pot; series R + red LED. */
export const VR_L1_5_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
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
        maxCountPerValue: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for VR.L2.6 — series R into wiper; B–C shorted; red LED. */
export const VR_L2_6_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
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
        maxCountPerValue: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for VR.L2.7 — series R, LED || pot (B–C shorted); red LED. */
export const VR_L2_7_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
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
        maxCountPerValue: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for VR.L2.8 — like L2.7 + series R in shunt so LED dims but stays lit. */
export const VR_L2_8_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
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
        maxCountPerValue: 2,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for VR.L2.9 — SPST + SPDT selects pot end; wiper → LED + series R. */
export const VR_L2_9_PALETTE = [
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
        type: COMPONENT_TYPES.SLIDE_SWITCH,
        labelKa: 'გადამრთველი',
        labelEn: 'Slide Switch',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
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
        maxCountPerValue: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for VR.L2.12 — two pots as series rheostats + red LED + series R. */
export const VR_L2_12_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
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

/** Inventory for VR.L2.13 — complementary series rheostats (sync keeps brightness). */
export const VR_L2_13_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
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

/** Inventory for VR.L2.15 — RV1 master brightness + RV2 balance between two red LEDs. */
export const VR_L2_15_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
        maxCount: 2,
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

/** Inventory for VR.L1.10 — quiz: pot as rheostat + 6 V lamp (practice/sim, no validation). */
export const VR_L1_10_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** Inventory for VR.L2.11 — quiz: pot divider + green LED || (red LED + lamp on wiper). */
export const VR_L2_11_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
        maxCount: 1,
    },
    {
        type: ledType('green'),
        labelKa: 'LED მწვანე',
        labelEn: 'LED Green',
        maxCount: 1,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 3,
    },
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

/** LR.L3.6 — normally-on LED with a parallel button bypass; one supply. */
export const LR_L3_6_PALETTE = [
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

/** LR.L2.7 / LR.L3.8 — button changes LED brightness; two supplies. */
export const LR_L2_7_PALETTE = [
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
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 10,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

export const LR_L3_8_PALETTE = LR_L2_7_PALETTE;

/** LR.L3.9 — separate brighten/dim buttons. */
export const LR_L3_9_PALETTE = [
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

/** LR.L3.10 — one red LED brightens while the other dims. */
export const LR_L3_10_PALETTE = [
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
        maxCountPerValue: 10,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** LR.L1.11 — red + green LEDs in series; one resistor and two supplies. */
export const LR_L1_11_PALETTE = [
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

/** LR.L2.12 — independent red/green LED branches; one supply and two resistors. */
export const LR_L2_12_PALETTE = [
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
        maxCountPerValue: 10,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** LR.L2.13 — current-flow quiz with two supplies feeding one red LED. */
export const LR_L2_13_PALETTE = [
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
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 2,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** LR.L2.14 — two series red LEDs; button subtracts current (both dim). */
export const LR_L2_14_PALETTE = [
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
        maxCountPerValue: 2,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** LR.L2.15 — two series red LEDs; button feeds the midpoint (top dims, bottom brightens). */
export const LR_L2_15_PALETTE = [
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
        maxCountPerValue: 2,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** LR.L2.16 — sequential turn-on: two buttons, two red LEDs, two supplies. */
export const LR_L2_16_PALETTE = [
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
        maxCount: 2,
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

/** LR.L2.17 — sequential turn-off: two buttons, two red LEDs, two supplies. */
export const LR_L2_17_PALETTE = LR_L2_16_PALETTE;

/** LR.L2.18 — green beaten by red: switch, button, red + green LED, two supplies. */
export const LR_L2_18_PALETTE = [
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
        maxCountPerValue: 10,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** LR.L4.19 — mutually exclusive LEDs: switch, two buttons, two red LEDs, one supply. */
export const LR_L4_19_PALETTE = [
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
        maxCount: 2,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 10,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** LR.L4.20 — mutually exclusive LEDs with two supplies (mid-point); two buttons. */
export const LR_L4_20_PALETTE = [
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
        maxCount: 2,
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

/** LR.L4.21 — red beaten by green via divider: switch, button, red + green, two supplies. */
export const LR_L4_21_PALETTE = LR_L2_18_PALETTE;

/** LR.L4.22 — two red+button branches; green lights only when both pressed. One supply. */
export const LR_L4_22_PALETTE = [
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
        maxCount: 2,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
        maxCount: 2,
    },
    {
        type: ledType('green'),
        labelKa: 'LED მწვანე',
        labelEn: 'LED Green',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 10,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** LR.L4.23 — like L4.22 scaled up: two red, two green, two blue LEDs, two buttons, two supplies. */
export const LR_L4_23_PALETTE = [
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
        maxCount: 2,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
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

/** Inventory for CP.L2.5 — single cap charge (green) / discharge (red) via SPDT. */
export const CP_L2_5_PALETTE = [
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
        maxCountPerValue: 1,
    },
    RESISTOR_GROUP_PALETTE_ITEM,
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for CP.L2.6 — anti-parallel LEDs, polarity reversal via SPDT.
 * Master SPST + slide SPDT; practice/sim + quiz only (no circuit validation).
 */
export const CP_L2_6_PALETTE = [
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
        maxCountPerValue: 1,
    },
    RESISTOR_GROUP_PALETTE_ITEM,
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for CP.L2.7 — anti-parallel LEDs with parallel capacitor, polarity via SPDT.
 * Master SPST + slide SPDT; practice/sim + quiz only (no circuit validation).
 */
export const CP_L2_7_PALETTE = [
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
        maxCountPerValue: 1,
    },
    RESISTOR_GROUP_PALETTE_ITEM,
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for CP.L2.8 — series motor + capacitor, polarity via SPDT.
 * Build-circuit task (validation / special sim to follow).
 */
export const CP_L2_8_PALETTE = [
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
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for CP.L2.9 — full-voltage H-bridge with two SPDTs + series motor/C.
 */
export const CP_L2_9_PALETTE = [
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
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for CP.L2.12 — series dual caps + anti-parallel LEDs, polarity via SPDT.
 * Master SPST + slide; practice/sim + quiz only (no circuit validation).
 */
export const CP_L2_12_PALETTE = [
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
 * Inventory for CP.L2.13 — soft-charge 470 µF; RGB LEDs light by Vf order.
 * Button + charge R + three LED branches (build + validate).
 */
export const CP_L2_13_PALETTE = [
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
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 1,
    },
    RESISTOR_GROUP_PALETTE_ITEM,
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for CP.L2.14 — master SPST; dim LED + button soft-charge C for gradual brighten/fade.
 */
export const CP_L2_14_PALETTE = [
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
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 1,
    },
    RESISTOR_GROUP_PALETTE_ITEM,
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for CP.L2.15 — dual RC-LED branches; green faster than red (different C).
 */
export const CP_L2_15_PALETTE = [
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
 * Inventory for CP.L2.16 — SPDT half/full voltage; RC softens LED brighten/fade.
 */
export const CP_L2_16_PALETTE = [
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
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 1,
    },
    RESISTOR_GROUP_PALETTE_ITEM,
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for CP.L4.19 — dual SPDT capacitor voltage doubler; series 2×green + 2×blue.
 * Optional resistors for surge / LED limiting (methodology).
 */
export const CP_L4_19_PALETTE = [
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
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 1,
    },
    RESISTOR_GROUP_PALETTE_ITEM,
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for SW.L1.1 — SPDT selects between two red LEDs (DC).
 */
export const SW_L1_1_PALETTE = [
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
        maxCount: 2,
    },
    RESISTOR_GROUP_PALETTE_ITEM,
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for SW.L1.2 — SPDT selects dim vs bright path (different R) for one red LED.
 */
export const SW_L1_2_PALETTE = [
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
    RESISTOR_GROUP_PALETTE_ITEM,
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for SW.L1.13 — lamp ‖ (R+red LED); SPDT mid-tap vs full rail.
 */
export const SW_L1_13_PALETTE = [
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
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
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
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for SW.L4.14 — lamp vs LED inverse brightness (LED across full→common).
 */
export const SW_L4_14_PALETTE = [
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
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
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
        maxCount: 2,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for SW.L2.3 — one R; SPDT selects mid-tap vs full supply for dim/bright LED.
 */
export const SW_L2_3_PALETTE = [
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
        ...RESISTOR_GROUP_PALETTE_ITEM,
        // Only one resistor allowed for this task.
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for SW.L2.4 — lamp; SPDT selects mid-tap vs full supply for dim/bright.
 */
export const SW_L2_4_PALETTE = [
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
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for SW.L2.5 — lamp + one low-R; SPDT series vs bypass (no mid-tap).
 */
export const SW_L2_5_PALETTE = [
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
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for SW.L2.9 — master SPST; baseline dim R; button + SPDT selects weak/strong boost R.
 */
export const SW_L2_9_PALETTE = [
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
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 3,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for SW.L2.10 — master SPST; button R-bypass boost; SPDT selects green vs blue LED.
 */
export const SW_L2_10_PALETTE = [
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
        type: COMPONENT_TYPES.SLIDE_SWITCH,
        labelKa: 'გადამრთველი',
        labelEn: 'Slide Switch',
        maxCount: 1,
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
        maxCount: 2,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for SW.L3.11 — SPDT green↔blue; button parallels red (Vf clamp exclusive).
 */
export const SW_L3_11_PALETTE = [
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
        type: ledType('blue'),
        labelKa: 'LED ლურჯი',
        labelEn: 'LED Blue',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for SW.L3.6 — two SPDTs (3-way / reversible) controlling one lamp.
 */
export const SW_L3_6_PALETTE = [
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
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * Inventory for SW.L3.7 — 3-way path + always-on green; red parallel (Vf clamp swap).
 */
export const SW_L3_7_PALETTE = [
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
        maxCount: 2,
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
    RESISTOR_GROUP_PALETTE_ITEM,
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** DI.L1.1 — mid-rail diode path with full-rail button bypass. */
export const DI_L1_1_PALETTE = [
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
        type: COMPONENT_TYPES.DIODE,
        labelKa: 'დიოდი',
        labelEn: 'Diode',
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

/** DI.L2.2 — series diodes dim lamp; button bypass brightens. */
export const DI_L2_2_PALETTE = [
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
        type: COMPONENT_TYPES.DIODE,
        labelKa: 'დიოდი',
        labelEn: 'Diode',
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

/** DI.L1.4 — unequal red LEDs via series diodes; button equalizes. */
export const DI_L1_4_PALETTE = [
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
        type: COMPONENT_TYPES.DIODE,
        labelKa: 'დიოდი',
        labelEn: 'Diode',
        maxCount: 2,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
        maxCount: 2,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        // Challenge text: მხოლოდ ერთი რეზისტორი — one resistor total, any value.
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** DI.L3.5 — motor-generation practice with one button and a steering diode. */
export const DI_L3_5_PALETTE = [
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
        type: COMPONENT_TYPES.DIODE,
        labelKa: 'დიოდი',
        labelEn: 'Diode',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
        maxCount: 2,
    },
    {
        type: ledType('green'),
        labelKa: 'LED მწვანე',
        labelEn: 'LED Green',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 6,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * DI.L3.6 — pot divider; sync brighten / async extinguish via diode+C hold branch.
 * Pot UI/behavior matches the VR module (mid default + live A–B slider).
 */
export const DI_L3_6_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.DIODE,
        labelKa: 'დიოდი',
        labelEn: 'Diode',
        maxCount: 1,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
        maxCount: 2,
    },
    {
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 1,
    },
    RESISTOR_GROUP_PALETTE_ITEM,
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * DI.L3.7 — unidirectional motor via diode steering + low-R mid-rail (no pack center tap).
 * Two soft wires (red/black) connect the supply; familiar kit parts allowed.
 */
export const DI_L3_7_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.DIODE,
        labelKa: 'დიოდი',
        labelEn: 'Diode',
        maxCount: 4,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 6,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
        maxCount: 2,
    },
    {
        type: ledType('green'),
        labelKa: 'LED მწვანე',
        labelEn: 'LED Green',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
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
    CONNECTOR_GROUP_PALETTE_ITEM,
    {
        ...WIRE_GROUP_PALETTE_ITEM,
        maxCount: 2,
        colors: ['red', 'lightRed', 'black'],
    },
];

/**
 * DI.L4.8 — diode bridge (2 diodes + 2 red LEDs as diodes); green stays lit
 * for either soft-wire polarity. One resistor only.
 */
export const DI_L4_8_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.DIODE,
        labelKa: 'დიოდი',
        labelEn: 'Diode',
        maxCount: 2,
    },
    {
        type: ledType('green'),
        labelKa: 'LED მწვანე',
        labelEn: 'LED Green',
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
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
    {
        ...WIRE_GROUP_PALETTE_ITEM,
        maxCount: 2,
        colors: ['red', 'lightRed', 'black'],
    },
];

/** TR.L2.9 — quiz: compare CE vs emitter-follower LED brightness with two pots. */
export const TR_L2_9_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
        maxCount: 2,
    },
    {
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 1,
    },
    {
        type: transistorType('q3'),
        labelKa: 'NPN Q3 (დარლინგტონი)',
        labelEn: 'NPN Q3 (Darlington)',
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
        maxCount: 4,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
    WIRE_GROUP_PALETTE_ITEM,
];

/** TR.L2.10 — NPN collector load; pot abruptly switches the motor. */
export const TR_L2_10_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
        maxCount: 1,
    },
    {
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    RESISTOR_GROUP_PALETTE_ITEM,
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** TR.L2.11 — NPN emitter follower; pot gradually spins the motor. */
export const TR_L2_11_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
        maxCount: 1,
    },
    {
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    RESISTOR_GROUP_PALETTE_ITEM,
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** TR.L2.12 — NPN collector load; button parallels base R to brighten lamp. */
export const TR_L2_12_PALETTE = [
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
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 4,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** TR.L2.13 — NPN emitter follower; button closes divider to dim lamp. */
export const TR_L2_13_PALETTE = [
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
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 4,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** TR.L2.14 — collector-load lamp biased by R + motor; stall extinguishes lamp. */
export const TR_L2_14_PALETTE = [
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
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
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
        maxCount: 4,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** TR.L2.16 — antagonistic motor/lamp via two CE NPNs + pot. */
export const TR_L2_16_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
        maxCount: 1,
    },
    {
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 1,
    },
    {
        type: transistorType('q3'),
        labelKa: 'NPN Q3 (დარლინგტონი)',
        labelEn: 'NPN Q3 (Darlington)',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        type: ledType('blue'),
        labelKa: 'LED ლურჯი',
        labelEn: 'LED Blue',
        maxCount: 2,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 4,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** TR.L2.17 — AND gate: lamp only with both buttons (series NPNs or series buttons). */
export const TR_L2_17_PALETTE = [
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
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 1,
    },
    {
        type: transistorType('q3'),
        labelKa: 'NPN Q3 (დარლინგტონი)',
        labelEn: 'NPN Q3 (Darlington)',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
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
        maxCount: 4,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** TCP.L1.1 — transistor + capacitor: long LED hold after button release. */
export const TCP_L1_1_PALETTE = [
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
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
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
        maxCountPerValue: 2,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 4,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** TCP.L1.2 — LED shunted by transistor for long off-hold after press. */
export const TCP_L1_2_PALETTE = [
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
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 1,
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
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 2,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 4,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** TCP.L1.3 — lamp long hold after press (dual 470 µF, CE preferred). */
export const TCP_L1_3_PALETTE = [
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
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 2,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 4,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/** TCP.L1.4 — slow lamp brighten on press; faster fade on release. */
export const TCP_L1_4_PALETTE = [
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
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 2,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 4,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * TCP.L3.5 — series-C into BJT base; lamp lights only while button is tapped rapidly.
 * Diode optional (DC restore); familiar kit parts allowed.
 */
export const TCP_L3_5_PALETTE = [
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
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.DIODE,
        labelKa: 'დიოდი',
        labelEn: 'Diode',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 2,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 6,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * DTR.L2.4 — Darlington EF + 1 µF motor hold (~10 s); no resistors.
 */
export const DTR_L2_4_PALETTE = [
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
        type: transistorType('q3'),
        labelKa: 'NPN Q3 (დარლინგტონი)',
        labelEn: 'NPN Q3 (Darlington)',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 1,
        keys: ['1uf'],
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * DTR.L2.5 — CE slow idle via high-R bias; button + 10 µF boost.
 */
export const DTR_L2_5_PALETTE = [
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
        type: transistorType('q3'),
        labelKa: 'NPN Q3 (დარლინგტონი)',
        labelEn: 'NPN Q3 (Darlington)',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი',
        labelEn: 'Variable Resistor',
        maxCount: 1,
    },
    {
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 1,
        keys: ['10uf'],
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 4,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * DTR.L2.6 — CE + 10 µF + high base R (2×510 kΩ ≈ 1 MΩ); ≥15 s hold then stop.
 */
export const DTR_L2_6_PALETTE = [
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
        type: transistorType('q3'),
        labelKa: 'NPN Q3 (დარლინგტონი)',
        labelEn: 'NPN Q3 (Darlington)',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 1,
        keys: ['10uf'],
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 4,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * DTR.L2.11 — CE lamp; C+button ‖ B–E; 2×100 kΩ charge delay ~2 s on release.
 */
export const DTR_L2_11_PALETTE = [
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
        type: transistorType('q3'),
        labelKa: 'NPN Q3 (დარლინგტონი)',
        labelEn: 'NPN Q3 (Darlington)',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 1,
        keys: ['100uf'],
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 2,
        keys: ['100ko'],
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * DTR.L2.12 — CE delayed-on (button→100k→C mid→100k→base); hold/fade on release.
 */
export const DTR_L2_12_PALETTE = [
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
        type: transistorType('q3'),
        labelKa: 'NPN Q3 (დარლინგტონი)',
        labelEn: 'NPN Q3 (Darlington)',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 1,
        keys: ['100uf'],
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 2,
        keys: ['100ko'],
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * TFB.L1.1 — CE Darlington lamp; pot divider → 1 kΩ → base.
 */
export const TFB_L1_1_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
        maxCount: 1,
    },
    {
        type: transistorType('q3'),
        labelKa: 'NPN Q3 (დარლინგტონი)',
        labelEn: 'NPN Q3 (Darlington)',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 1,
        keys: ['1ko'],
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * TFB.L1.2 — NPN CE drives PNP high-side lamp; pot divider; 2×1 kΩ.
 */
export const TFB_L1_2_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
        maxCount: 1,
    },
    {
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 1,
    },
    {
        type: transistorType('q2'),
        labelKa: 'PNP Q2',
        labelEn: 'PNP Q2',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 2,
        keys: ['1ko'],
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * TFB.L2.5 — two NPN inverting pair; intrinsic supply-sag snap (reverse of L1.2).
 */
export const TFB_L2_5_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
        maxCount: 1,
    },
    {
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 2,
        keys: ['1ko'],
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * TFB.L3.3 — L1.2 topology + 1 kΩ positive feedback (NPN base ↔ PNP collector).
 */
export const TFB_L3_3_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
        maxCount: 1,
    },
    {
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 1,
    },
    {
        type: transistorType('q2'),
        labelKa: 'PNP Q2',
        labelEn: 'PNP Q2',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 3,
        keys: ['1ko'],
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
    {
        ...WIRE_GROUP_PALETTE_ITEM,
        maxCount: 3,
        colors: ['red', 'lightRed', 'black'],
    },
];

/**
 * TFB.L3.4 — TFB.L3.3 latch plus two buttons for set/reset.
 */
export const TFB_L3_4_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
        maxCount: 1,
    },
    {
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 1,
    },
    {
        type: transistorType('q2'),
        labelKa: 'PNP Q2',
        labelEn: 'PNP Q2',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 3,
        keys: ['1ko'],
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
    {
        ...WIRE_GROUP_PALETTE_ITEM,
        maxCount: 3,
        colors: ['red', 'lightRed', 'black'],
    },
];

/**
 * TDM.L1.7 — pot-driven complementary NPN+PNP emitter follower (half-bridge);
 * dual-rail mid tap; no master switch.
 */
export const TDM_L1_7_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
        maxCount: 1,
    },
    {
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 1,
    },
    {
        type: transistorType('q2'),
        labelKa: 'PNP Q2',
        labelEn: 'PNP Q2',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * TDM.L2.8 — L1.7 half-bridge + CE NPN and 1 kΩ for abrupt pot reverse.
 */
export const TDM_L2_8_PALETTE = [
    {
        type: COMPONENT_TYPES.POWER_SUPPLY,
        labelKa: 'კვების წყარო',
        labelEn: 'Power Supply',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
        maxCount: 1,
    },
    {
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 2,
    },
    {
        type: transistorType('q2'),
        labelKa: 'PNP Q2',
        labelEn: 'PNP Q2',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 1,
        keys: ['1ko'],
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
];

/**
 * TDM.L2.3 — reverse DC motor with NPN–PNP pair (2×NPN + PNP) + SPDT; 2×1 kΩ.
 */
export const TDM_L2_3_PALETTE = [
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
        type: COMPONENT_TYPES.SLIDE_SWITCH,
        labelKa: 'გადამრთველი',
        labelEn: 'Slide Switch',
        maxCount: 1,
    },
    {
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 2,
    },
    {
        type: transistorType('q2'),
        labelKa: 'PNP Q2',
        labelEn: 'PNP Q2',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 2,
        keys: ['1ko'],
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
    {
        ...WIRE_GROUP_PALETTE_ITEM,
        maxCount: 3,
        colors: ['red', 'lightRed', 'black'],
    },
];

/**
 * TDM.L2.4 — two-button H-bridge reverse (2×NPN + 2×PNP); 2×1 kΩ; soft wires optional.
 */
export const TDM_L2_4_PALETTE = [
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
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 2,
    },
    {
        type: transistorType('q2'),
        labelKa: 'PNP Q2',
        labelEn: 'PNP Q2',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 2,
        keys: ['1ko'],
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
    {
        ...WIRE_GROUP_PALETTE_ITEM,
        maxCount: 3,
        colors: ['red', 'lightRed', 'black'],
    },
];

/**
 * TDM.L3.5 — one-button H-bridge reverse (2×NPN + 2×PNP + NPN Darlington);
 * 3×1 kΩ (base series R for Darlington); soft wires optional.
 */
export const TDM_L3_5_PALETTE = [
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
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 2,
    },
    {
        type: transistorType('q2'),
        labelKa: 'PNP Q2',
        labelEn: 'PNP Q2',
        maxCount: 2,
    },
    {
        type: transistorType('q3'),
        labelKa: 'NPN Q3 (დარლინგტონი)',
        labelEn: 'NPN Q3 (Darlington)',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 3,
        keys: ['1ko'],
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
    {
        ...WIRE_GROUP_PALETTE_ITEM,
        maxCount: 3,
        colors: ['red', 'lightRed', 'black'],
    },
];

/** GEN.L2.1 — free-run blinker with NPN + PNP, capacitor feedback, optional pot. */
export const GEN_L2_1_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
        maxCount: 1,
    },
    {
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 1,
    },
    {
        type: transistorType('q2'),
        labelKa: 'PNP Q2',
        labelEn: 'PNP Q2',
        maxCount: 1,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 2,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 6,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
    {
        ...WIRE_GROUP_PALETTE_ITEM,
        maxCount: 4,
        colors: ['red', 'lightRed', 'black'],
    },
];

/** GEN.L2.2 — free-run blinker with two NPNs; slower period (~10 s). */
export const GEN_L2_2_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
        maxCount: 1,
    },
    {
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.LAMP,
        labelKa: 'ნათურა',
        labelEn: 'Lamp',
        maxCount: 1,
    },
    {
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 2,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 6,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
    {
        ...WIRE_GROUP_PALETTE_ITEM,
        maxCount: 4,
        colors: ['red', 'lightRed', 'black'],
    },
];

/** GEN.L2.3 — two-NPN anti-parallel LED flasher; 10 µF only. */
export const GEN_L2_3_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
        maxCount: 1,
    },
    {
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 2,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
        maxCount: 2,
    },
    {
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        keys: ['10uf'],
        maxCountPerValue: 2,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        maxCount: 8,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
    {
        ...WIRE_GROUP_PALETTE_ITEM,
        maxCount: 4,
        colors: ['red', 'lightRed', 'black'],
    },
];

/** GEN.L2.4 — symmetric two-NPN LED multivibrator; fixed paired parts. */
export const GEN_L2_4_PALETTE = [
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
        type: COMPONENT_TYPES.VAR_RESISTOR,
        labelKa: 'ცვლადი რეზისტორი 10k',
        labelEn: 'Var. Resistor 10k',
        maxCount: 2,
    },
    {
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 2,
    },
    {
        type: ledType('red'),
        labelKa: 'LED წითელი',
        labelEn: 'LED Red',
        maxCount: 2,
    },
    {
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        keys: ['100uf'],
        maxCountPerValue: 2,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        keys: ['100o', '1ko', '5ko1'],
        maxCount: 6,
        maxCountPerValue: 2,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
    {
        ...WIRE_GROUP_PALETTE_ITEM,
        maxCount: 4,
        colors: ['red', 'lightRed', 'black'],
    },
];

/** GEN.L2.5 — two-NPN motor reverse oscillator; no pots. */
export const GEN_L2_5_PALETTE = [
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
        type: transistorType('q1'),
        labelKa: 'NPN Q1',
        labelEn: 'NPN Q1',
        maxCount: 2,
    },
    {
        type: COMPONENT_TYPES.MOTOR,
        labelKa: 'ძრავი',
        labelEn: 'Motor',
        maxCount: 1,
    },
    {
        ...CAPACITOR_GROUP_PALETTE_ITEM,
        maxCountPerValue: 2,
    },
    {
        ...RESISTOR_GROUP_PALETTE_ITEM,
        keys: ['20o', '100o', '1ko', '5ko1', '10ko', '100ko'],
        maxCount: 8,
    },
    CONNECTOR_GROUP_PALETTE_ITEM,
    {
        ...WIRE_GROUP_PALETTE_ITEM,
        maxCount: 4,
        colors: ['red', 'lightRed', 'black'],
    },
];

/**
 * Inventory for SW.L3.8 — two green LEDs; resistor divider + 3-way swap (same-color).
 */
export const SW_L3_8_PALETTE = [
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
        maxCount: 2,
    },
    {
        type: ledType('green'),
        labelKa: 'LED მწვანე',
        labelEn: 'LED Green',
        maxCount: 2,
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
    if (problemCode === 'VR.L1.1') {
        return VR_L1_1_PALETTE;
    }
    if (problemCode === 'PR.L1.1') {
        return PR_L1_1_PALETTE;
    }
    if (problemCode === 'PR.L1.2') {
        return PR_L1_2_PALETTE;
    }
    if (problemCode === 'PR.L2.3') {
        return PR_L2_3_PALETTE;
    }
    if (problemCode === 'PR.L2.4') {
        return PR_L2_4_PALETTE;
    }
    if (problemCode === 'PR.L1.5') {
        return PR_L1_5_PALETTE;
    }
    if (problemCode === 'PR.L2.9') {
        return PR_L2_9_PALETTE;
    }
    if (problemCode === 'PR.L3.10') {
        return PR_L3_10_PALETTE;
    }
    if (problemCode === 'PR.L3.11') {
        return PR_L3_11_PALETTE;
    }
    if (problemCode === 'PR.L2.12') {
        return PR_L2_12_PALETTE;
    }
    if (problemCode === 'PR.L3.6') {
        return PR_L3_6_PALETTE;
    }
    if (problemCode === 'VR.L1.2') {
        return VR_L1_2_PALETTE;
    }
    if (problemCode === 'VR.L1.3') {
        return VR_L1_3_PALETTE;
    }
    if (problemCode === 'VR.L1.4') {
        return VR_L1_4_PALETTE;
    }
    if (problemCode === 'VR.L1.5') {
        return VR_L1_5_PALETTE;
    }
    if (problemCode === 'VR.L2.6') {
        return VR_L2_6_PALETTE;
    }
    if (problemCode === 'VR.L2.7') {
        return VR_L2_7_PALETTE;
    }
    if (problemCode === 'VR.L2.8') {
        return VR_L2_8_PALETTE;
    }
    if (problemCode === 'VR.L2.9') {
        return VR_L2_9_PALETTE;
    }
    if (problemCode === 'VR.L1.10') {
        return VR_L1_10_PALETTE;
    }
    if (problemCode === 'VR.L2.11') {
        return VR_L2_11_PALETTE;
    }
    if (problemCode === 'VR.L2.12') {
        return VR_L2_12_PALETTE;
    }
    if (problemCode === 'VR.L2.13') {
        return VR_L2_13_PALETTE;
    }
    if (problemCode === 'VR.L2.15') {
        return VR_L2_15_PALETTE;
    }
    if (problemCode === 'VR.L3.19') {
        return VR_L3_19_PALETTE;
    }
    if (problemCode === 'VR.L1.20') {
        return VR_L1_20_PALETTE;
    }
    if (problemCode === 'VR.L3.22') {
        return VR_L3_22_PALETTE;
    }
    if (problemCode === 'VR.L4.23') {
        return VR_L4_23_PALETTE;
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
    if (problemCode === 'LR.L3.6') {
        return LR_L3_6_PALETTE;
    }
    if (problemCode === 'LR.L2.7') {
        return LR_L2_7_PALETTE;
    }
    if (problemCode === 'LR.L3.8') {
        return LR_L3_8_PALETTE;
    }
    if (problemCode === 'LR.L3.9') {
        return LR_L3_9_PALETTE;
    }
    if (problemCode === 'LR.L3.10') {
        return LR_L3_10_PALETTE;
    }
    if (problemCode === 'LR.L1.11') {
        return LR_L1_11_PALETTE;
    }
    if (problemCode === 'LR.L2.12') {
        return LR_L2_12_PALETTE;
    }
    if (problemCode === 'LR.L2.13') {
        return LR_L2_13_PALETTE;
    }
    if (problemCode === 'LR.L2.14') {
        return LR_L2_14_PALETTE;
    }
    if (problemCode === 'LR.L2.15') {
        return LR_L2_15_PALETTE;
    }
    if (problemCode === 'LR.L2.16') {
        return LR_L2_16_PALETTE;
    }
    if (problemCode === 'LR.L2.17') {
        return LR_L2_17_PALETTE;
    }
    if (problemCode === 'LR.L2.18') {
        return LR_L2_18_PALETTE;
    }
    if (problemCode === 'LR.L4.19') {
        return LR_L4_19_PALETTE;
    }
    if (problemCode === 'LR.L4.20') {
        return LR_L4_20_PALETTE;
    }
    if (problemCode === 'LR.L4.21') {
        return LR_L4_21_PALETTE;
    }
    if (problemCode === 'LR.L4.22') {
        return LR_L4_22_PALETTE;
    }
    if (problemCode === 'LR.L4.23') {
        return LR_L4_23_PALETTE;
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
    if (problemCode === 'CP.L2.5') {
        return CP_L2_5_PALETTE;
    }
    if (problemCode === 'CP.L2.6') {
        return CP_L2_6_PALETTE;
    }
    if (problemCode === 'CP.L2.7') {
        return CP_L2_7_PALETTE;
    }
    if (problemCode === 'CP.L2.8') {
        return CP_L2_8_PALETTE;
    }
    if (problemCode === 'CP.L2.9') {
        return CP_L2_9_PALETTE;
    }
    if (problemCode === 'CP.L2.12') {
        return CP_L2_12_PALETTE;
    }
    if (problemCode === 'CP.L2.13') {
        return CP_L2_13_PALETTE;
    }
    if (problemCode === 'CP.L2.14') {
        return CP_L2_14_PALETTE;
    }
    if (problemCode === 'CP.L2.15') {
        return CP_L2_15_PALETTE;
    }
    if (problemCode === 'CP.L2.16') {
        return CP_L2_16_PALETTE;
    }
    if (problemCode === 'CP.L4.19') {
        return CP_L4_19_PALETTE;
    }
    if (problemCode === 'SW.L1.1') {
        return SW_L1_1_PALETTE;
    }
    if (problemCode === 'SW.L1.2') {
        return SW_L1_2_PALETTE;
    }
    if (problemCode === 'SW.L1.13') {
        return SW_L1_13_PALETTE;
    }
    if (problemCode === 'SW.L4.14') {
        return SW_L4_14_PALETTE;
    }
    if (problemCode === 'SW.L2.3') {
        return SW_L2_3_PALETTE;
    }
    if (problemCode === 'SW.L2.4') {
        return SW_L2_4_PALETTE;
    }
    if (problemCode === 'SW.L2.5') {
        return SW_L2_5_PALETTE;
    }
    if (problemCode === 'SW.L2.9') {
        return SW_L2_9_PALETTE;
    }
    if (problemCode === 'SW.L2.10') {
        return SW_L2_10_PALETTE;
    }
    if (problemCode === 'SW.L3.11') {
        return SW_L3_11_PALETTE;
    }
    if (problemCode === 'SW.L3.6') {
        return SW_L3_6_PALETTE;
    }
    if (problemCode === 'SW.L3.7') {
        return SW_L3_7_PALETTE;
    }
    if (problemCode === 'SW.L3.8') {
        return SW_L3_8_PALETTE;
    }
    if (problemCode === 'DM.L1.1') {
        return DM_L1_1_PALETTE;
    }
    if (problemCode === 'DM.L2.2') {
        return DM_L2_2_PALETTE;
    }
    if (problemCode === 'DM.L2.3') {
        return DM_L2_3_PALETTE;
    }
    if (problemCode === 'DM.L2.5') {
        return DM_L2_5_PALETTE;
    }
    if (problemCode === 'DM.L2.6') {
        return DM_L2_6_PALETTE;
    }
    if (problemCode === 'DM.L2.7') {
        return DM_L2_7_PALETTE;
    }
    if (problemCode === 'DM.L2.8') {
        return DM_L2_8_PALETTE;
    }
    if (problemCode === 'DM.L3.9') {
        return DM_L3_9_PALETTE;
    }
    if (problemCode === 'DM.L2.10') {
        return DM_L2_10_PALETTE;
    }
    if (problemCode === 'DM.L3.11') {
        return DM_L3_11_PALETTE;
    }
    if (problemCode === 'DM.L2.13') {
        return DM_L2_13_PALETTE;
    }
    if (problemCode === 'DM.L3.14') {
        return DM_L3_14_PALETTE;
    }
    if (problemCode === 'DM.L4.4') {
        return DM_L4_4_PALETTE;
    }
    if (problemCode === 'DI.L1.1') {
        return DI_L1_1_PALETTE;
    }
    if (problemCode === 'DI.L2.2') {
        return DI_L2_2_PALETTE;
    }
    if (problemCode === 'DI.L1.4') {
        return DI_L1_4_PALETTE;
    }
    if (problemCode === 'DI.L3.5') {
        return DI_L3_5_PALETTE;
    }
    if (problemCode === 'DI.L3.6') {
        return DI_L3_6_PALETTE;
    }
    if (problemCode === 'DI.L3.7') {
        return DI_L3_7_PALETTE;
    }
    if (problemCode === 'DI.L4.8') {
        return DI_L4_8_PALETTE;
    }
    if (problemCode === 'TR.L2.9') {
        return TR_L2_9_PALETTE;
    }
    if (problemCode === 'TR.L2.10') {
        return TR_L2_10_PALETTE;
    }
    if (problemCode === 'TR.L2.11') {
        return TR_L2_11_PALETTE;
    }
    if (problemCode === 'TR.L2.12') {
        return TR_L2_12_PALETTE;
    }
    if (problemCode === 'TR.L2.13') {
        return TR_L2_13_PALETTE;
    }
    if (problemCode === 'TR.L2.14') {
        return TR_L2_14_PALETTE;
    }
    if (problemCode === 'TR.L2.16') {
        return TR_L2_16_PALETTE;
    }
    if (problemCode === 'TR.L2.17') {
        return TR_L2_17_PALETTE;
    }
    if (problemCode === 'TCP.L1.1') {
        return TCP_L1_1_PALETTE;
    }
    if (problemCode === 'TCP.L1.2') {
        return TCP_L1_2_PALETTE;
    }
    if (problemCode === 'TCP.L1.3') {
        return TCP_L1_3_PALETTE;
    }
    if (problemCode === 'TCP.L1.4') {
        return TCP_L1_4_PALETTE;
    }
    if (problemCode === 'TCP.L3.5') {
        return TCP_L3_5_PALETTE;
    }
    if (problemCode === 'DTR.L2.4') {
        return DTR_L2_4_PALETTE;
    }
    if (problemCode === 'DTR.L2.5') {
        return DTR_L2_5_PALETTE;
    }
    if (problemCode === 'DTR.L2.6') {
        return DTR_L2_6_PALETTE;
    }
    if (problemCode === 'DTR.L2.11') {
        return DTR_L2_11_PALETTE;
    }
    if (problemCode === 'DTR.L2.12') {
        return DTR_L2_12_PALETTE;
    }
    if (problemCode === 'TFB.L1.1') {
        return TFB_L1_1_PALETTE;
    }
    if (problemCode === 'TFB.L1.2') {
        return TFB_L1_2_PALETTE;
    }
    if (problemCode === 'TFB.L2.5') {
        return TFB_L2_5_PALETTE;
    }
    if (problemCode === 'TFB.L3.3') {
        return TFB_L3_3_PALETTE;
    }
    if (problemCode === 'TFB.L3.4') {
        return TFB_L3_4_PALETTE;
    }
    if (problemCode === 'TDM.L1.7') {
        return TDM_L1_7_PALETTE;
    }
    if (problemCode === 'TDM.L2.8') {
        return TDM_L2_8_PALETTE;
    }
    if (problemCode === 'TDM.L2.3') {
        return TDM_L2_3_PALETTE;
    }
    if (problemCode === 'TDM.L2.4') {
        return TDM_L2_4_PALETTE;
    }
    if (problemCode === 'TDM.L3.5') {
        return TDM_L3_5_PALETTE;
    }
    if (problemCode === 'GEN.L2.1') {
        return GEN_L2_1_PALETTE;
    }
    if (problemCode === 'GEN.L2.2') {
        return GEN_L2_2_PALETTE;
    }
    if (problemCode === 'GEN.L2.3') {
        return GEN_L2_3_PALETTE;
    }
    if (problemCode === 'GEN.L2.4') {
        return GEN_L2_4_PALETTE;
    }
    if (problemCode === 'GEN.L2.5') {
        return GEN_L2_5_PALETTE;
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
        problemCode === 'VR.L1.1' ||
        problemCode === 'PR.L1.1' ||
        problemCode === 'PR.L1.2' ||
        problemCode === 'PR.L2.3' ||
        problemCode === 'PR.L2.4' ||
        problemCode === 'PR.L1.5' ||
        problemCode === 'PR.L2.9' ||
        problemCode === 'PR.L3.10' ||
        problemCode === 'PR.L3.11' ||
        problemCode === 'PR.L2.12' ||
        problemCode === 'PR.L3.6' ||
        problemCode === 'VR.L1.2' ||
        problemCode === 'VR.L1.3' ||
        problemCode === 'VR.L1.4' ||
        problemCode === 'VR.L1.5' ||
        problemCode === 'VR.L2.6' ||
        problemCode === 'VR.L2.7' ||
        problemCode === 'VR.L2.8' ||
        problemCode === 'VR.L2.9' ||
        problemCode === 'VR.L1.10' ||
        problemCode === 'VR.L2.11' ||
        problemCode === 'VR.L2.12' ||
        problemCode === 'VR.L2.13' ||
        problemCode === 'VR.L2.15' ||
        problemCode === 'VR.L3.19' ||
        problemCode === 'VR.L1.20' ||
        problemCode === 'VR.L3.22' ||
        problemCode === 'VR.L4.23' ||
        problemCode === 'ST.L2.4' ||
        problemCode === 'ST.L2.9' ||
        problemCode === 'LR.L1.1' ||
        problemCode === 'LR.L1.2' ||
        problemCode === 'LR.L1.3' ||
        problemCode === 'LR.L2.4' ||
        problemCode === 'LR.L2.5' ||
        problemCode === 'LR.L3.6' ||
        problemCode === 'LR.L2.7' ||
        problemCode === 'LR.L3.8' ||
        problemCode === 'LR.L3.9' ||
        problemCode === 'LR.L3.10' ||
        problemCode === 'LR.L1.11' ||
        problemCode === 'LR.L2.12' ||
        problemCode === 'LR.L2.13' ||
        problemCode === 'LR.L2.14' ||
        problemCode === 'LR.L2.15' ||
        problemCode === 'LR.L2.16' ||
        problemCode === 'LR.L2.17' ||
        problemCode === 'LR.L2.18' ||
        problemCode === 'LR.L4.19' ||
        problemCode === 'LR.L4.20' ||
        problemCode === 'LR.L4.21' ||
        problemCode === 'LR.L4.22' ||
        problemCode === 'LR.L4.23' ||
        problemCode === 'ST.L2.10' ||
        problemCode === 'ST.L2.11' ||
        problemCode === 'ST.L2.12' ||
        problemCode === 'ST.L2.13' ||
        problemCode === 'ST.L2.14' ||
        problemCode === 'CP.L1.1' ||
        problemCode === 'CP.L1.2' ||
        problemCode === 'CP.L2.3' ||
        problemCode === 'CP.L2.4' ||
        problemCode === 'CP.L2.5' ||
        problemCode === 'CP.L2.6' ||
        problemCode === 'CP.L2.7' ||
        problemCode === 'CP.L2.8' ||
        problemCode === 'CP.L2.9' ||
        problemCode === 'CP.L2.12' ||
        problemCode === 'CP.L2.13' ||
        problemCode === 'CP.L2.14' ||
        problemCode === 'CP.L2.15' ||
        problemCode === 'CP.L2.16' ||
        problemCode === 'CP.L4.19' ||
        problemCode === 'SW.L1.1' ||
        problemCode === 'SW.L1.2' ||
        problemCode === 'SW.L1.13' ||
        problemCode === 'SW.L4.14' ||
        problemCode === 'SW.L2.3' ||
        problemCode === 'SW.L2.4' ||
        problemCode === 'SW.L2.5' ||
        problemCode === 'SW.L2.9' ||
        problemCode === 'SW.L2.10' ||
        problemCode === 'SW.L3.6' ||
        problemCode === 'SW.L3.7' ||
        problemCode === 'SW.L3.8' ||
        problemCode === 'SW.L3.11' ||
        problemCode === 'DM.L1.1' ||
        problemCode === 'DM.L2.2' ||
        problemCode === 'DM.L2.3' ||
        problemCode === 'DM.L2.5' ||
        problemCode === 'DM.L2.6' ||
        problemCode === 'DM.L2.7' ||
        problemCode === 'DM.L2.8' ||
        problemCode === 'DM.L3.9' ||
        problemCode === 'DM.L2.10' ||
        problemCode === 'DM.L3.11' ||
        problemCode === 'DM.L2.13' ||
        problemCode === 'DM.L3.14' ||
        problemCode === 'DM.L4.4' ||
        problemCode === 'DI.L1.1' ||
        problemCode === 'DI.L2.2' ||
        problemCode === 'DI.L1.4' ||
        problemCode === 'DI.L3.5' ||
        problemCode === 'DI.L3.6' ||
        problemCode === 'DI.L3.7' ||
        problemCode === 'DI.L4.8' ||
        problemCode === 'TR.L2.9' ||
        problemCode === 'TR.L2.10' ||
        problemCode === 'TR.L2.11' ||
        problemCode === 'TR.L2.12' ||
        problemCode === 'TR.L2.13' ||
        problemCode === 'TR.L2.14' ||
        problemCode === 'TR.L2.16' ||
        problemCode === 'TR.L2.17' ||
        problemCode === 'TCP.L1.1' ||
        problemCode === 'TCP.L1.2' ||
        problemCode === 'TCP.L1.3' ||
        problemCode === 'TCP.L1.4' ||
        problemCode === 'TCP.L3.5' ||
        problemCode === 'DTR.L2.4' ||
        problemCode === 'DTR.L2.5' ||
        problemCode === 'DTR.L2.6' ||
        problemCode === 'DTR.L2.11' ||
        problemCode === 'DTR.L2.12' ||
        problemCode === 'TFB.L1.1' ||
        problemCode === 'TFB.L1.2' ||
        problemCode === 'TFB.L2.5' ||
        problemCode === 'TFB.L3.3' ||
        problemCode === 'TFB.L3.4' ||
        problemCode === 'TDM.L1.7' ||
        problemCode === 'TDM.L2.3' ||
        problemCode === 'TDM.L2.4' ||
        problemCode === 'TDM.L2.8' ||
        problemCode === 'TDM.L3.5' ||
        problemCode === 'GEN.L2.1' ||
        problemCode === 'GEN.L2.2' ||
        problemCode === 'GEN.L2.3' ||
        problemCode === 'GEN.L2.4' ||
        problemCode === 'GEN.L2.5'
    );
}

export function usesTransientSimulation(problemCode) {
    return (
        problemCode === 'CP.L1.1' ||
        problemCode === 'CP.L1.2' ||
        problemCode === 'CP.L2.3' ||
        problemCode === 'CP.L2.4' ||
        problemCode === 'CP.L2.5' ||
        problemCode === 'CP.L2.6' ||
        problemCode === 'CP.L2.7' ||
        problemCode === 'CP.L2.8' ||
        problemCode === 'CP.L2.9' ||
        problemCode === 'CP.L2.12' ||
        problemCode === 'CP.L2.13' ||
        problemCode === 'CP.L2.14' ||
        problemCode === 'CP.L2.15' ||
        problemCode === 'CP.L2.16' ||
        problemCode === 'CP.L4.19' ||
        problemCode === 'DI.L3.6' ||
        problemCode === 'TCP.L1.1' ||
        problemCode === 'TCP.L1.2' ||
        problemCode === 'TCP.L1.3' ||
        problemCode === 'TCP.L1.4' ||
        problemCode === 'TCP.L3.5' ||
        problemCode === 'DTR.L2.4' ||
        problemCode === 'DTR.L2.5' ||
        problemCode === 'DTR.L2.6' ||
        problemCode === 'DTR.L2.11' ||
        problemCode === 'DTR.L2.12' ||
        problemCode === 'GEN.L2.1' ||
        problemCode === 'GEN.L2.2' ||
        problemCode === 'GEN.L2.3' ||
        problemCode === 'GEN.L2.4' ||
        problemCode === 'GEN.L2.5'
    );
}

/** CP.L1.2 / CP.L2.4 / CP.L2.13–L2.15 / TCP.L1.4: charge .tran on button press. */
export function usesSlowChargeSimulation(problemCode) {
    return (
        problemCode === 'CP.L1.2' ||
        problemCode === 'CP.L2.4' ||
        problemCode === 'CP.L2.13' ||
        problemCode === 'CP.L2.14' ||
        problemCode === 'CP.L2.15' ||
        problemCode === 'TCP.L1.4' ||
        problemCode === 'DTR.L2.12'
    );
}

/**
 * CP.L2.3 dual-RC crossfade; CP.L2.5–L2.8 polarity pulses via SPDT.
 */
export function usesSwitchCrossfadeSimulation(problemCode) {
    return (
        problemCode === 'CP.L2.3' ||
        problemCode === 'CP.L2.5' ||
        problemCode === 'CP.L2.6' ||
        problemCode === 'CP.L2.7' ||
        problemCode === 'CP.L2.8' ||
        problemCode === 'CP.L2.9' ||
        problemCode === 'CP.L2.12' ||
        problemCode === 'CP.L2.16' ||
        problemCode === 'CP.L4.19'
    );
}

/**
 * CP.L2.4: press dips LED then slow reclaim — stretch settle window like crossfade.
 */
export function usesParallelCapDipSimulation(problemCode) {
    return problemCode === 'CP.L2.4';
}

/** CP.L2.5–L2.7 / L2.12 / L2.14: master SPST must be ON before charge/discharge transients. */
export function usesMasterSwitchSimulation(problemCode) {
    return (
        problemCode === 'CP.L2.5' ||
        problemCode === 'CP.L2.6' ||
        problemCode === 'CP.L2.7' ||
        problemCode === 'CP.L2.12' ||
        problemCode === 'CP.L2.14' ||
        problemCode === 'TCP.L1.1' ||
        problemCode === 'TCP.L1.2' ||
        problemCode === 'TCP.L1.3' ||
        problemCode === 'TCP.L1.4' ||
        problemCode === 'TCP.L3.5' ||
        problemCode === 'DTR.L2.4' ||
        problemCode === 'DTR.L2.5' ||
        problemCode === 'DTR.L2.6' ||
        problemCode === 'DTR.L2.11' ||
        problemCode === 'DTR.L2.12' ||
        problemCode === 'GEN.L2.1' ||
        problemCode === 'GEN.L2.2' ||
        problemCode === 'GEN.L2.3' ||
        problemCode === 'GEN.L2.4' ||
        problemCode === 'GEN.L2.5'
    );
}

/**
 * CP.L2.7: opening master discharges parallel C through the LED (slow fade).
 */
export function usesMasterOffDischargeSimulation(problemCode) {
    return problemCode === 'CP.L2.7';
}

/**
 * CP.L2.7: parallel-cap polarity crossfade (slow LED fade then opposite rise).
 */
export function usesParallelCapPolaritySimulation(problemCode) {
    return problemCode === 'CP.L2.7';
}

/** Circuit Submit / ngspice validation (practice-only problems return false). */
export function usesCircuitValidation(problemCode) {
    if (!supportsSimulator(problemCode)) {
        return false;
    }
    return (
        problemCode !== 'CP.L2.5' &&
        problemCode !== 'CP.L2.6' &&
        problemCode !== 'CP.L2.7' &&
        problemCode !== 'LR.L2.13' &&
        problemCode !== 'LR.L2.14' &&
        problemCode !== 'LR.L2.15' &&
        problemCode !== 'CP.L2.12' &&
        problemCode !== 'VR.L1.10' &&
        problemCode !== 'VR.L2.11' &&
        problemCode !== 'TR.L2.9' &&
        problemCode !== 'DM.L4.4' &&
        problemCode !== 'DM.L3.14' &&
        problemCode !== 'DI.L3.5' &&
        problemCode !== 'PR.L3.6' &&
        problemCode !== 'PR.L2.12'
    );
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
    'VR.L1.1': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'PR.L1.1': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.PHOTO_RESISTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'PR.L1.2': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.PHOTO_RESISTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'PR.L2.3': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.PHOTO_RESISTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'PR.L2.4': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.PHOTO_RESISTOR, maxCount: 1 },
        { type: ledType('blue'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'PR.L1.5': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: COMPONENT_TYPES.PHOTO_RESISTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'PR.L2.9': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.PHOTO_RESISTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'PR.L3.10': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.PHOTO_RESISTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'PR.L3.11': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.PHOTO_RESISTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 3 },
    ],
    'PR.L2.12': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.PHOTO_RESISTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 4 },
    ],
    'PR.L3.6': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.PHOTO_RESISTOR, maxCount: 1 },
    ],
    'VR.L1.2': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'VR.L1.3': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'VR.L1.4': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'VR.L1.5': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'VR.L2.6': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'VR.L2.7': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'VR.L2.8': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'VR.L2.9': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'VR.L1.10': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
    ],
    'VR.L2.11': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 3 },
    ],
    'VR.L2.12': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 2 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'VR.L2.13': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 2 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'VR.L2.15': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 2 },
        { type: ledType('red'), maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'VR.L3.19': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'VR.L1.20': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'VR.L3.22': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: ledType('blue'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 4 },
    ],
    'VR.L4.23': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: ledType('blue'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 5 },
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
    'LR.L3.6': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'LR.L2.7': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'LR.L3.8': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'LR.L3.9': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 2 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'LR.L3.10': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: ledType('red'), maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'LR.L1.11': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'LR.L2.12': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 1 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'LR.L2.13': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'LR.L2.14': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: ledType('red'), maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'LR.L2.15': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: ledType('red'), maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'LR.L2.16': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 2 },
        { type: ledType('red'), maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'LR.L2.17': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 2 },
        { type: ledType('red'), maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'LR.L2.18': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'LR.L4.19': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 1 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 2 },
        { type: ledType('red'), maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'LR.L4.20': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 2 },
        { type: ledType('red'), maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'LR.L4.21': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'LR.L4.22': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 2 },
        { type: ledType('red'), maxCount: 2 },
        { type: ledType('green'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'LR.L4.23': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 2 },
        { type: ledType('red'), maxCount: 2 },
        { type: ledType('green'), maxCount: 2 },
        { type: ledType('blue'), maxCount: 2 },
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
    'CP.L2.5': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: 'capacitor', maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'CP.L2.6': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: 'capacitor', maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'CP.L2.7': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: 'capacitor', maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'CP.L2.8': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
        { type: 'capacitor', maxCount: 1 },
    ],
    'CP.L2.9': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 2 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
        { type: 'capacitor', maxCount: 1 },
    ],
    'CP.L2.12': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: 'capacitor', maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'CP.L2.13': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: ledType('blue'), maxCount: 1 },
        { type: 'capacitor', maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 4 },
    ],
    'CP.L2.14': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: 'capacitor', maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 3 },
    ],
    'CP.L2.15': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: 'capacitor', maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 4 },
    ],
    'CP.L2.16': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: 'capacitor', maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'CP.L4.19': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 2 },
        { type: ledType('green'), maxCount: 2 },
        { type: ledType('blue'), maxCount: 2 },
        { type: 'capacitor', maxCount: 1 },
    ],
    'SW.L1.1': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: ledType('red'), maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'SW.L1.2': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'SW.L1.13': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'SW.L4.14': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'SW.L2.3': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'SW.L2.4': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
    ],
    'SW.L2.5': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'SW.L2.9': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 3 },
    ],
    'SW.L2.10': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: ledType('blue'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'SW.L3.11': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: ledType('blue'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'SW.L3.6': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 2 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
    ],
    'SW.L3.7': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 2 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'SW.L3.8': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 2 },
        { type: ledType('green'), maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'DM.L1.1': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 1 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
    ],
    'DM.L2.2': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
    ],
    'DM.L2.3': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
        {
            anyOf: [COMPONENT_TYPES.LAMP, COMPONENT_TYPES.RESISTOR],
            maxCount: 1,
        },
    ],
    'DM.L2.5': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
        {
            anyOf: [COMPONENT_TYPES.LAMP, COMPONENT_TYPES.RESISTOR],
            maxCount: 1,
        },
    ],
    'DM.L2.6': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
    ],
    'DM.L2.7': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'DM.L2.8': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 2 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
    ],
    'DM.L3.9': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'DM.L2.10': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
        {
            anyOf: [COMPONENT_TYPES.LAMP, COMPONENT_TYPES.RESISTOR],
            maxCount: 1,
        },
    ],
    'DM.L3.11': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: ledType('green'), maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 3 },
    ],
    'DM.L2.13': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 2 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
    ],
    'DM.L3.14': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
    ],
    'DM.L4.4': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
    ],
    'DI.L1.1': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: COMPONENT_TYPES.DIODE, maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
    ],
    'DI.L2.2': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: COMPONENT_TYPES.DIODE, maxCount: 2 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
    ],
    'DI.L1.4': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: COMPONENT_TYPES.DIODE, maxCount: 2 },
        { type: ledType('red'), maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'DI.L3.5': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: COMPONENT_TYPES.DIODE, maxCount: 1 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
    ],
    'DI.L3.6': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: COMPONENT_TYPES.DIODE, maxCount: 1 },
        { type: ledType('red'), maxCount: 2 },
        { type: 'capacitor', maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'DI.L3.7': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
        { type: COMPONENT_TYPES.DIODE, maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
        { type: COMPONENT_TYPES.WIRE, maxCount: 2 },
    ],
    'DI.L4.8': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.DIODE, maxCount: 2 },
        { type: ledType('green'), maxCount: 1 },
        { type: ledType('red'), maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
        { type: COMPONENT_TYPES.WIRE, maxCount: 2 },
    ],
    'TR.L2.10': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: transistorType('q1'), maxCount: 1 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'TR.L2.11': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: transistorType('q1'), maxCount: 1 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'TR.L2.12': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: transistorType('q1'), maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'TR.L2.13': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: transistorType('q1'), maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'TR.L2.14': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: transistorType('q1'), maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'TR.L2.16': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: transistorType('q1'), maxCount: 1 },
        { type: transistorType('q3'), maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'TR.L2.17': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 2 },
        {
            anyOf: [transistorType('q1'), transistorType('q3')],
            maxCount: 1,
        },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'TCP.L1.1': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: transistorType('q1'), maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: 'capacitor', maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 3 },
    ],
    'TCP.L1.2': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: transistorType('q1'), maxCount: 1 },
        { type: ledType('red'), maxCount: 1 },
        { type: 'capacitor', maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 3 },
    ],
    'TCP.L1.3': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: transistorType('q1'), maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: 'capacitor', maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 3 },
    ],
    'TCP.L1.4': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: transistorType('q1'), maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: 'capacitor', maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 3 },
    ],
    'TCP.L3.5': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: transistorType('q1'), maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: 'capacitor', maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'DTR.L2.4': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: transistorType('q3'), maxCount: 1 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
        { type: 'capacitor', maxCount: 1 },
    ],
    'DTR.L2.5': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: transistorType('q3'), maxCount: 1 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
        { type: 'capacitor', maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'DTR.L2.6': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: transistorType('q3'), maxCount: 1 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
        { type: 'capacitor', maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'DTR.L2.11': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: transistorType('q3'), maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: 'capacitor', maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'DTR.L2.12': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: transistorType('q3'), maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: 'capacitor', maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'TFB.L1.1': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: transistorType('q3'), maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'TFB.L1.2': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: transistorType('q1'), maxCount: 1 },
        { type: transistorType('q2'), maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'TFB.L2.5': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: transistorType('q1'), maxCount: 2 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'TFB.L3.3': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: transistorType('q1'), maxCount: 1 },
        { type: transistorType('q2'), maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 3 },
    ],
    'TFB.L3.4': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 2 },
        { type: transistorType('q1'), maxCount: 1 },
        { type: transistorType('q2'), maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 3 },
    ],
    'TDM.L1.7': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: transistorType('q1'), maxCount: 1 },
        { type: transistorType('q2'), maxCount: 1 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
    ],
    'TDM.L2.8': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 1 },
        { type: transistorType('q1'), maxCount: 2 },
        { type: transistorType('q2'), maxCount: 1 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 1 },
    ],
    'TDM.L2.3': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.SLIDE_SWITCH, maxCount: 1 },
        { type: transistorType('q1'), maxCount: 2 },
        { type: transistorType('q2'), maxCount: 1 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'TDM.L2.4': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 2 },
        { type: transistorType('q1'), maxCount: 2 },
        { type: transistorType('q2'), maxCount: 2 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'TDM.L3.5': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.BUTTON, maxCount: 1 },
        { type: transistorType('q1'), maxCount: 2 },
        { type: transistorType('q2'), maxCount: 2 },
        { type: transistorType('q3'), maxCount: 1 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 3 },
    ],
    'GEN.L2.1': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: transistorType('q1'), maxCount: 1 },
        { type: transistorType('q2'), maxCount: 1 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: 'capacitor', maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'GEN.L2.2': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: transistorType('q1'), maxCount: 2 },
        { type: COMPONENT_TYPES.LAMP, maxCount: 1 },
        { type: 'capacitor', maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 2 },
    ],
    'GEN.L2.3': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: transistorType('q1'), maxCount: 2 },
        { type: ledType('red'), maxCount: 2 },
        { type: 'capacitor', maxCount: 1 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 3 },
    ],
    'GEN.L2.4': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: COMPONENT_TYPES.VAR_RESISTOR, maxCount: 2 },
        { type: transistorType('q1'), maxCount: 2 },
        { type: ledType('red'), maxCount: 2 },
        { type: 'capacitor', maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 6 },
    ],
    'GEN.L2.5': [
        { type: COMPONENT_TYPES.POWER_SUPPLY, maxCount: 2 },
        { type: COMPONENT_TYPES.SWITCH, maxCount: 1 },
        { type: transistorType('q1'), maxCount: 2 },
        { type: COMPONENT_TYPES.MOTOR, maxCount: 1 },
        { type: 'capacitor', maxCount: 2 },
        { type: COMPONENT_TYPES.RESISTOR, maxCount: 4 },
    ],
};

export function getRequiredPartsForProblem(problemCode) {
    return PROBLEM_REQUIRED_PARTS[problemCode] ?? null;
}
