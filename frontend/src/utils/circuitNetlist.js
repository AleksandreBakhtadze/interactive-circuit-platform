import {
    COMPONENT_TYPES,
    getCapacitorSpec,
    getRequiredPartsForProblem,
    isCapacitorType,
    isConnectorType,
    isLedType,
    isResistorType,
    isTransistorType,
    getLedSpec,
    parseConnectorLength,
    parseTransistorKey,
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

/** Max track resistance for the 10k potentiometer part. */
export const VAR_RESISTOR_MAX_OHMS = 10000;

/** Default wiper position (mid-track). */
export const DEFAULT_POT_POSITION = 0.5;

const BOARD_TYPE_TO_ROLE = {
    [COMPONENT_TYPES.POWER_SUPPLY]: 'power_supply',
    [COMPONENT_TYPES.BUTTON]: 'button',
    [COMPONENT_TYPES.SWITCH]: 'switch',
    [COMPONENT_TYPES.SLIDE_SWITCH]: 'slide_switch',
    [COMPONENT_TYPES.LAMP]: 'lamp',
    [COMPONENT_TYPES.RESISTOR]: 'resistor',
    [COMPONENT_TYPES.DIODE]: 'diode',
    [COMPONENT_TYPES.MOTOR]: 'motor',
    [COMPONENT_TYPES.VAR_RESISTOR]: 'variable_resistor',
};

function transistorSubtype(type) {
    const key = parseTransistorKey(type);
    if (key === 'q2' || key === 'q4') return 'pnp';
    return 'npn';
}

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

/** DM.L2.10 / DM.L3.11: click motor to stall / release (finger-stop). */
export function supportsMotorStallToggle(problemCode) {
    return (
        problemCode === 'DM.L2.10' ||
        problemCode === 'DM.L3.11' ||
        problemCode === 'TR.L2.14'
    );
}

/** Parts the student can operate during live simulation. */
export function isInteractivePart(type, problemCode = null) {
    if (isMomentaryInteractive(type) || isToggleInteractive(type)) {
        return true;
    }
    if (isVarResistorType(type)) {
        return true;
    }
    return (
        type === COMPONENT_TYPES.MOTOR && supportsMotorStallToggle(problemCode)
    );
}

export function isSlideSwitchType(type) {
    return type === COMPONENT_TYPES.SLIDE_SWITCH;
}

export function isVarResistorType(type) {
    return type === COMPONENT_TYPES.VAR_RESISTOR;
}

/** Clamp potentiometer wiper position to [0, 1]. */
export function clampPotPosition(position) {
    const n = Number(position);
    if (!Number.isFinite(n)) return DEFAULT_POT_POSITION;
    return Math.min(1, Math.max(0, n));
}

function formatOhms(ohms) {
    const n = Math.max(0, Math.round(ohms));
    if (n >= 1000) {
        const k = n / 1000;
        return Number.isInteger(k) ? `${k} kΩ` : `${k.toFixed(1)} kΩ`;
    }
    return `${n} Ω`;
}

/**
 * Pot track split: position 0 → A–B ≈ 0 / A–C ≈ max; position 1 → opposite.
 * Compact label for the on-body dial.
 */
export function formatPotResistanceLabel(
    position,
    maxOhms = VAR_RESISTOR_MAX_OHMS
) {
    const pos = clampPotPosition(position);
    const ab = pos * maxOhms;
    const ac = (1 - pos) * maxOhms;
    return `B ${formatOhms(ab)} · C ${formatOhms(ac)}`;
}

/** Default interactive states for live simulation. */
export function createInitialSwitchStates(placed, problemCode = null) {
    const states = {};
    for (const comp of placed) {
        if (!isInteractivePart(comp.type, problemCode)) continue;
        if (isVarResistorType(comp.type)) continue;
        if (comp.type === COMPONENT_TYPES.MOTOR) {
            states[comp.id] = 'running';
        } else {
            states[comp.id] = isSlideSwitchType(comp.type) ? 'left' : 'open';
        }
    }
    return states;
}

/**
 * Build ngspice-ready circuit JSON from workbench placement state.
 * @param {object[]} placed
 * @param {Record<string, string>} [switchStatesById] — per placed component id
 *   (open/closed for SPST; left/right for slide switch)
 * @param {string|null} [problemCode] — optional; some tasks use non-default supply V
 * @param {Record<string, number>} [potPositionsById] — pot wiper 0..1 (A–B share)
 */
export function buildCircuitJson(
    placed,
    switchStatesById = {},
    problemCode = null,
    potPositionsById = {}
) {
    const uf = new UnionFind();
    const supplyVolts =
        problemCode === 'CP.L4.19' ||
        (typeof problemCode === 'string' &&
            (problemCode.startsWith('LR.') || problemCode.startsWith('VR.')))
            ? '3'
            : '6';

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
        // Series stacks: true ground is a supply negative that is not another
        // supply's positive (bottom of the chain). First-placed-PS heuristic
        // wrongly treats the mid-rail as 0 when the top pack was placed first.
        const psPins = powerSupplies.map((ps) => getComponentTerminalPins(ps));
        const positiveNets = new Set(
            psPins.map((pins) => (pins.length >= 1 ? uf.find(pins[0]) : null))
        );
        let groundPin = null;
        for (let i = 0; i < powerSupplies.length; i += 1) {
            const pins = psPins[i];
            if (pins.length < 2) continue;
            const negNet = uf.find(pins[1]);
            if (!positiveNets.has(negNet)) {
                groundPin = pins[1];
                break;
            }
        }
        if (!groundPin) {
            groundPin = psPins[0].length >= 2 ? psPins[0][1] : null;
        }
        if (groundPin) {
            groundRoot = uf.find(groundPin);
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
    let motorIndex = 0;
    let diodeIndex = 0;
    let transistorIndex = 0;
    let slideSwitchIndex = 0;
    const slideSwitchCount = placed.filter(
        (c) => c.type === COMPONENT_TYPES.SLIDE_SWITCH
    ).length;
    let varResistorIndex = 0;
    const varResistorCount = placed.filter(
        (c) => c.type === COMPONENT_TYPES.VAR_RESISTOR
    ).length;

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
        if (comp.type === COMPONENT_TYPES.MOTOR) {
            motorIndex += 1;
            role = `motor_${motorIndex}`;
        }
        if (comp.type === COMPONENT_TYPES.DIODE) {
            diodeIndex += 1;
            role = `diode_${diodeIndex}`;
        }
        if (isTransistorType(comp.type)) {
            transistorIndex += 1;
            role = `transistor_${transistorIndex}`;
        }
        if (comp.type === COMPONENT_TYPES.SLIDE_SWITCH) {
            if (slideSwitchCount > 1) {
                slideSwitchIndex += 1;
                role = `slide_switch_${slideSwitchIndex}`;
            } else {
                role = 'slide_switch';
            }
        }
        if (comp.type === COMPONENT_TYPES.VAR_RESISTOR) {
            if (varResistorCount > 1) {
                varResistorIndex += 1;
                role = `variable_resistor_${varResistorIndex}`;
            } else {
                role = 'variable_resistor';
            }
        }

        switch (comp.type) {
            case COMPONENT_TYPES.POWER_SUPPLY:
                components.push({
                    id,
                    role,
                    type: 'voltage',
                    nodes,
                    // Default packs are 6 V (CP/SW); LR.* and CP.L4.19 use 3 V packs.
                    value: supplyVolts,
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

            case COMPONENT_TYPES.MOTOR: {
                const motor = {
                    id,
                    role,
                    type: 'motor',
                    nodes,
                };
                // Only when live-sim / validation sets running|stalled (default SPICE R=50).
                if (switchStatesById[comp.id]) {
                    motor.state = switchStatesById[comp.id];
                }
                components.push(motor);
                break;
            }

            case COMPONENT_TYPES.VAR_RESISTOR:
                components.push({
                    id,
                    role,
                    type: 'variable_resistor',
                    nodes,
                    value: String(VAR_RESISTOR_MAX_OHMS),
                    position: clampPotPosition(
                        potPositionsById[comp.id] ?? DEFAULT_POT_POSITION
                    ),
                });
                break;

            case COMPONENT_TYPES.DIODE:
                // Board diode → plain LED model (generic silicon diode in SPICE).
                components.push({
                    id,
                    role,
                    type: 'led',
                    nodes,
                    color: 'plain',
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
                if (isTransistorType(comp.type)) {
                    // Pin order matches THREE_PIN_SNAP_VERTICAL / SpiceGenerator.
                    components.push({
                        id,
                        role,
                        type: 'transistor',
                        subtype: transistorSubtype(comp.type),
                        nodes,
                    });
                } else if (isResistorType(comp.type)) {
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

    // When two packs share a rail with the same polarity end on that rail
    // (+/+ or −/−), ngspice sees opposing equal sources and reports ~0 A.
    // Snap-kit series stacks always mean + of one to − of the other — normalize.
    normalizeSeriesSupplyPolarity(components);

    return { components };
}

/** Flip the second pack when two voltage sources share a node on the same end. */
export function normalizeSeriesSupplyPolarity(components) {
    if (!Array.isArray(components)) return components;
    const supplies = components.filter((comp) => comp.type === 'voltage');
    if (supplies.length !== 2) return components;
    const [first, second] = supplies;
    if (!Array.isArray(first.nodes) || !Array.isArray(second.nodes)) {
        return components;
    }
    const sharedNodes = first.nodes.filter((node) => second.nodes.includes(node));
    if (sharedNodes.length !== 1) return components;
    const [shared] = sharedNodes;
    const firstSharedIndex = first.nodes.indexOf(shared);
    const secondSharedIndex = second.nodes.indexOf(shared);
    if (firstSharedIndex === secondSharedIndex && second.nodes.length >= 2) {
        second.nodes = [second.nodes[1], second.nodes[0]];
    }
    return components;
}

/** Required task parts are on the board (for submit). */
export function isBoardComplete(placed, problemCode) {
    const required = getRequiredPartsForProblem(problemCode);
    if (!required) return false;
    for (const item of required) {
        if (Array.isArray(item.anyOf)) {
            const total = item.anyOf.reduce(
                (sum, type) => sum + countPlacedByType(placed, type),
                0
            );
            if (total < (item.maxCount ?? 1)) {
                return false;
            }
            continue;
        }
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
