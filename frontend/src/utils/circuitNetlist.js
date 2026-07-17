import {
    COMPONENT_TYPES,
    getCapacitorSpec,
    getRequiredPartsForProblem,
    isCapacitorType,
    isConnectorType,
    isLedType,
    isResistorType,
    getLedSpec,
    parseConnectorLength,
    getResistorSpec,
} from '../constants/componentCatalog';
import {
    getRotatedFootprint,
    getRotatedSnapOffsets,
} from '../constants/componentRotation';
import { pinName } from '../components/CircuitBoard/boardPlacement';

/** Union-find over breadboard pin ids (e.g. A3, C7). */
class UnionFind {
    constructor() {
        this.parent = new Map();
    }

    add(pin) {
        if (!this.parent.has(pin)) {
            this.parent.set(pin, pin);
        }
    }

    find(pin) {
        this.add(pin);
        let root = pin;
        while (this.parent.get(root) !== root) {
            root = this.parent.get(root);
        }
        let current = pin;
        while (this.parent.get(current) !== root) {
            const next = this.parent.get(current);
            this.parent.set(current, root);
            current = next;
        }
        return root;
    }

    union(a, b) {
        const ra = this.find(a);
        const rb = this.find(b);
        if (ra !== rb) {
            this.parent.set(rb, ra);
        }
    }
}

/** Terminal pin ids for a placed part (dark dots). */
export function getComponentTerminalPins(component) {
    const rotation = component.rotation ?? 0;
    const offsets = getRotatedSnapOffsets(component.type, rotation);
    return offsets.map((o) => pinName(component.row + o.dr, component.col + o.dc));
}

/**
 * Every board pin under a connector footprint (including middle segments).
 * Placement only treats endpoints as terminals, but electrically a wire/bus
 * must short every hole it covers — otherwise a long ground rail leaves
 * middle cathodes floating.
 */
export function getConnectorSpanPins(component) {
    const len = parseConnectorLength(component.type);
    if (len === null) {
        return getComponentTerminalPins(component);
    }
    const rotation = component.rotation ?? 0;
    const { w, h } = getRotatedFootprint(component.type, rotation);
    const pins = [];
    for (let dr = 0; dr < h; dr += 1) {
        for (let dc = 0; dc < w; dc += 1) {
            pins.push(pinName(component.row + dr, component.col + dc));
        }
    }
    return pins;
}

/** Same id normalization as ngspice netlist / simulation result keys. */
export function toSpiceId(id) {
    return String(id).replace(/[^a-zA-Z0-9_]/g, '_');
}

const BOARD_TYPE_TO_ROLE = {
    [COMPONENT_TYPES.POWER_SUPPLY]: 'power_supply',
    [COMPONENT_TYPES.BUTTON]: 'button',
    [COMPONENT_TYPES.SWITCH]: 'switch',
    [COMPONENT_TYPES.SLIDE_SWITCH]: 'slide_switch',
    [COMPONENT_TYPES.LAMP]: 'lamp',
    [COMPONENT_TYPES.RESISTOR]: 'resistor',
};

function boardTypeToRole(boardType) {
    return BOARD_TYPE_TO_ROLE[boardType] ?? boardType;
}

/** ngspice capacitance suffix (e.g. 10 µF → "10u"). */
function formatCapacitorSpiceValue(spec) {
    if (!spec) return '10u';
    const micro = spec.farads * 1e6;
    return `${micro}u`;
}

/** Momentary parts (press and hold). */
export function isMomentaryInteractive(type) {
    return type === COMPONENT_TYPES.BUTTON;
}

/** Latching parts (click to toggle). SPST open/closed or SPDT left/right. */
export function isToggleInteractive(type) {
    return (
        type === COMPONENT_TYPES.SWITCH ||
        type === COMPONENT_TYPES.SLIDE_SWITCH
    );
}

/** Parts the student can operate during live simulation. */
export function isInteractivePart(type) {
    return isMomentaryInteractive(type) || isToggleInteractive(type);
}

export function isSlideSwitchType(type) {
    return type === COMPONENT_TYPES.SLIDE_SWITCH;
}

/** Default interactive states for live simulation. */
export function createInitialSwitchStates(placed) {
    const states = {};
    for (const comp of placed) {
        if (!isInteractivePart(comp.type)) continue;
        states[comp.id] = isSlideSwitchType(comp.type) ? 'left' : 'open';
    }
    return states;
}

/**
 * Build ngspice-ready circuit JSON from workbench placement state.
 * @param {object[]} placed
 * @param {Record<string, string>} [switchStatesById] — per placed component id
 *   (open/closed for SPST; left/right for slide switch)
 */
export function buildCircuitJson(placed, switchStatesById = {}) {
    const uf = new UnionFind();

    for (const comp of placed) {
        if (isConnectorType(comp.type)) {
            const spanPins = getConnectorSpanPins(comp);
            for (const pin of spanPins) {
                uf.add(pin);
            }
            for (let i = 1; i < spanPins.length; i += 1) {
                uf.union(spanPins[0], spanPins[i]);
            }
            continue;
        }

        const pins = getComponentTerminalPins(comp);
        for (const pin of pins) {
            uf.add(pin);
        }
    }

    let groundRoot = null;
    const powerSupplies = placed.filter(
        (c) => c.type === COMPONENT_TYPES.POWER_SUPPLY
    );
    if (powerSupplies.length > 0) {
        const psPins = getComponentTerminalPins(powerSupplies[0]);
        if (psPins.length >= 2) {
            groundRoot = uf.find(psPins[1]);
        }
    }

    const resolve = (pin) => {
        const net = uf.find(pin);
        return groundRoot !== null && net === groundRoot ? '0' : net;
    };

    const components = [];
    let powerSupplyIndex = 0;
    let buttonIndex = 0;
    let resistorIndex = 0;
    let ledIndex = 0;
    let capacitorIndex = 0;

    for (const comp of placed) {
        if (isConnectorType(comp.type)) {
            continue;
        }

        const pins = getComponentTerminalPins(comp);
        const nodes = pins.map(resolve);
        const id = toSpiceId(comp.id);

        let role = boardTypeToRole(comp.type);
        if (comp.type === COMPONENT_TYPES.POWER_SUPPLY) {
            powerSupplyIndex += 1;
            role = `power_supply_${powerSupplyIndex}`;
        }
        if (comp.type === COMPONENT_TYPES.BUTTON) {
            buttonIndex += 1;
            role = `button_${buttonIndex}`;
        }
        if (isResistorType(comp.type) || comp.type === COMPONENT_TYPES.RESISTOR) {
            resistorIndex += 1;
            role = `resistor_${resistorIndex}`;
        }
        if (isLedType(comp.type)) {
            ledIndex += 1;
            role = `led_${ledIndex}`;
        }
        if (isCapacitorType(comp.type)) {
            capacitorIndex += 1;
            role = `capacitor_${capacitorIndex}`;
        }

        switch (comp.type) {
            case COMPONENT_TYPES.POWER_SUPPLY:
                components.push({
                    id,
                    role,
                    type: 'voltage',
                    nodes,
                    value: '6',
                });
                break;

            case COMPONENT_TYPES.BUTTON:
                components.push({
                    id,
                    role,
                    type: 'switch',
                    nodes,
                    state: switchStatesById[comp.id] ?? 'open',
                });
                break;

            case COMPONENT_TYPES.SWITCH:
                components.push({
                    id,
                    role,
                    type: 'switch',
                    nodes,
                    state: switchStatesById[comp.id] ?? 'open',
                });
                break;

            case COMPONENT_TYPES.SLIDE_SWITCH:
                components.push({
                    id,
                    role,
                    type: 'slide_switch',
                    nodes,
                    state: switchStatesById[comp.id] ?? 'left',
                });
                break;

            case COMPONENT_TYPES.LAMP:
                components.push({
                    id,
                    role,
                    type: 'lamp',
                    nodes,
                });
                break;

            case COMPONENT_TYPES.RESISTOR:
                components.push({
                    id,
                    role,
                    type: 'resistor',
                    nodes,
                    value: '1000',
                });
                break;

            default:
                if (isResistorType(comp.type)) {
                    const spec = getResistorSpec(comp.type);
                    if (spec) {
                        components.push({
                            id,
                            role,
                            type: 'resistor',
                            nodes,
                            value: String(spec.ohms),
                        });
                    }
                } else if (isLedType(comp.type)) {
                    const spec = getLedSpec(comp.type);
                    components.push({
                        id,
                        role,
                        type: 'led',
                        nodes,
                        color: spec?.spiceColor ?? 'red',
                    });
                } else if (isCapacitorType(comp.type)) {
                    const spec = getCapacitorSpec(comp.type);
                    components.push({
                        id,
                        role,
                        type: 'capacitor',
                        nodes,
                        value: formatCapacitorSpiceValue(spec),
                    });
                }
                break;
        }
    }

    return { components };
}

/** Required task parts are on the board (for submit). */
export function isBoardComplete(placed, problemCode) {
    const required = getRequiredPartsForProblem(problemCode);
    if (!required) return false;
    for (const item of required) {
        if (countPlacedByType(placed, item.type) < item.maxCount) {
            return false;
        }
    }
    return true;
}

function countPlacedByType(placed, type) {
    if (type === COMPONENT_TYPES.RESISTOR) {
        return placed.filter((p) => p.type === COMPONENT_TYPES.RESISTOR || isResistorType(p.type))
            .length;
    }
    if (type === 'capacitor') {
        return placed.filter((p) => isCapacitorType(p.type)).length;
    }
    return placed.filter((p) => p.type === type).length;
}

export function describeCircuit(placed) {
    const parts = placed.filter((c) => !isConnectorType(c.type));
    const wires = placed.filter((c) => isConnectorType(c.type));
    return {
        partCount: parts.length,
        wireCount: wires.length,
        wireLengths: wires.map((w) => parseConnectorLength(w.type)),
    };
}
