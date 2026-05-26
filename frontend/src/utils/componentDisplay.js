import {
    COMPONENT_TYPES,
    parseLedKey,
} from '../constants/componentCatalog';
import { getComponentImage } from '../constants/componentAssets';

/** Minimum |V| across a two-terminal part to show lit artwork. */
const LIT_VOLTAGE_THRESHOLD = 0.01;

const ON_IMAGES = {
    [COMPONENT_TYPES.POWER_SUPPLY]: '/components/power-supply-on.svg',
    [COMPONENT_TYPES.BUTTON]: '/components/pressedbutton.svg',
    [COMPONENT_TYPES.SWITCH]: '/components/turnedswitch.svg',
    [COMPONENT_TYPES.LAMP]: '/components/lightninglamp.svg',
};

const LED_ON_IMAGES = {
    red: '/components/lightningled-red.svg',
    green: '/components/lightningled-green.svg',
    blue: '/components/lightningled-blue.svg',
};

const LIT_CURRENT_THRESHOLD = 0.01;

function isLitVoltage(voltage) {
    return typeof voltage === 'number' && voltage > LIT_VOLTAGE_THRESHOLD;
}

function isLitCurrent(current) {
    return typeof current === 'number' && current > LIT_CURRENT_THRESHOLD;
}

/**
 * ngspice device current.
 * - Resistors: @r_<id>[i]
 * - Diodes / LEDs: @d_<id>[id] (ngspice uses [id] for diode current)
 * @param {{ signed?: boolean }} [opts] — when true, keep sign (forward bias = positive for LEDs)
 */
export function getComponentCurrent(results, spiceComponentId, opts = {}) {
    const nodes = results?.nodes;
    if (!nodes) return undefined;

    const rKey = `@r_${spiceComponentId}[i]`;
    const rVal = nodes[rKey];
    if (typeof rVal === 'number') {
        return opts.signed ? rVal : Math.abs(rVal);
    }

    const dKey = `@d_${spiceComponentId}[id]`;
    const dVal = nodes[dKey];
    if (typeof dVal === 'number') {
        return opts.signed ? dVal : Math.abs(dVal);
    }

    return undefined;
}

function isLampLit(results, spiceComponentId, voltage) {
    const current = getComponentCurrent(results, spiceComponentId);
    if (isLitCurrent(current)) return true;
    return isLitVoltage(voltage);
}

/**
 * Image URL for a part on the board (palette / drag preview use getComponentImage).
 * @param {string} type
 * @param {{
 *   liveSimMode?: boolean,
 *   switchClosed?: boolean,
 *   voltage?: number,
 *   simOk?: boolean,
 *   simResults?: object,
 *   spiceId?: string,
 * }} opts
 */
export function getPlacedComponentImage(type, opts = {}) {
    const base = getComponentImage(type);
    if (!base) return null;

    const { liveSimMode, switchClosed, voltage, simOk, simResults, spiceId } =
        opts;

    if (type === COMPONENT_TYPES.BUTTON || type === COMPONENT_TYPES.SWITCH) {
        if (switchClosed) {
            return ON_IMAGES[type] ?? base;
        }
        return base;
    }

    if (type === COMPONENT_TYPES.POWER_SUPPLY) {
        if (liveSimMode && simOk) {
            return ON_IMAGES[type] ?? base;
        }
        return base;
    }

    if (type === COMPONENT_TYPES.LAMP) {
        if (liveSimMode && simOk && isLampLit(simResults, spiceId, voltage)) {
            return ON_IMAGES[type] ?? base;
        }
        return base;
    }

    const ledKey = parseLedKey(type);
    if (ledKey) {
        const forwardCurrent = getComponentCurrent(simResults, spiceId, { signed: true });
        if (
            liveSimMode &&
            simOk &&
            (isLitCurrent(forwardCurrent) || isLitVoltage(voltage))
        ) {
            return LED_ON_IMAGES[ledKey] ?? base;
        }
        return base;
    }

    return base;
}

/** Normalize simulate API payload (handles nested simulationResults). */
export function normalizeSimulationResults(raw) {
    if (!raw || typeof raw !== 'object') return null;
    if (raw.error) return raw;
    if (raw.components || raw.nodes) return raw;
    if (raw.simulationResults && typeof raw.simulationResults === 'object') {
        return normalizeSimulationResults(raw.simulationResults);
    }
    return raw;
}

export function simulationHasError(results) {
    return Boolean(results?.error);
}

export function getComponentVoltage(results, spiceComponentId) {
    const value = results?.components?.[spiceComponentId];
    return typeof value === 'number' ? value : undefined;
}
