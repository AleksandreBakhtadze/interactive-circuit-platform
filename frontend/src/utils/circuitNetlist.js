import {
    COMPONENT_TYPES,
    isConnectorType,
    parseConnectorLength,
} from '../constants/componentCatalog';
import { getRotatedSnapOffsets } from '../constants/componentRotation';
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

function spiceId(id) {
    return String(id).replace(/[^a-zA-Z0-9_]/g, '_');
}

const BOARD_TYPE_TO_ROLE = {
    [COMPONENT_TYPES.POWER_SUPPLY]: 'power_supply',
    [COMPONENT_TYPES.BUTTON]: 'button',
    [COMPONENT_TYPES.LAMP]: 'lamp',
    [COMPONENT_TYPES.RESISTOR]: 'resistor',
};

function boardTypeToRole(boardType) {
    return BOARD_TYPE_TO_ROLE[boardType] ?? boardType;
}

/** Parts the student can toggle during live simulation (button, slide switch, …). */
export function isInteractivePart(type) {
    return type === COMPONENT_TYPES.BUTTON;
}

/** Default switch states for live simulation (all open / not pressed). */
export function createInitialSwitchStates(placed) {
    const states = {};
    for (const comp of placed) {
        if (isInteractivePart(comp.type)) {
            states[comp.id] = 'open';
        }
    }
    return states;
}

/**
 * Build ngspice-ready circuit JSON from workbench placement state.
 * @param {object[]} placed
 * @param {Record<string, 'open'|'closed'>} [switchStatesById] — per placed component id
 */
export function buildCircuitJson(placed, switchStatesById = {}) {
    const uf = new UnionFind();

    for (const comp of placed) {
        const pins = getComponentTerminalPins(comp);
        for (const pin of pins) {
            uf.add(pin);
        }
        if (isConnectorType(comp.type) && pins.length >= 2) {
            uf.union(pins[0], pins[1]);
        }
    }

    let groundRoot = null;
    const powerSupply = placed.find((c) => c.type === COMPONENT_TYPES.POWER_SUPPLY);
    if (powerSupply) {
        const psPins = getComponentTerminalPins(powerSupply);
        if (psPins.length >= 2) {
            groundRoot = uf.find(psPins[1]);
        }
    }

    const resolve = (pin) => {
        const net = uf.find(pin);
        return groundRoot !== null && net === groundRoot ? '0' : net;
    };

    const components = [];

    for (const comp of placed) {
        if (isConnectorType(comp.type)) {
            continue;
        }

        const pins = getComponentTerminalPins(comp);
        const nodes = pins.map(resolve);
        const id = spiceId(comp.id);

        const role = boardTypeToRole(comp.type);

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
                break;
        }
    }

    return { components };
}

/** All non-wire palette parts are placed (for submit). */
export function isBoardComplete(placed, palette) {
    if (!palette) return false;
    for (const item of palette) {
        if (parseConnectorLength(item.type) !== null) continue;
        if (countPlacedByType(placed, item.type) < item.maxCount) {
            return false;
        }
    }
    return true;
}

function countPlacedByType(placed, type) {
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
