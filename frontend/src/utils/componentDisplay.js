import {
    COMPONENT_TYPES,
    parseLedKey,
} from '../constants/componentCatalog';
import { getComponentImage } from '../constants/componentAssets';

/** Minimum |V| across a two-terminal part to show lit artwork. */
const LIT_VOLTAGE_THRESHOLD = 0.01;

const ON_IMAGES = {
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

/** LEDs can conduct visibly below 10 mA (e.g. ~8 mA with series resistor). */
const LED_LIT_CURRENT_THRESHOLD = 0.001;

function isLitVoltage(voltage) {
    return typeof voltage === 'number' && voltage > LIT_VOLTAGE_THRESHOLD;
}

function isLitCurrent(current) {
    return typeof current === 'number' && current > LIT_CURRENT_THRESHOLD;
}

function isLedLitCurrent(current) {
    return typeof current === 'number' && current > LED_LIT_CURRENT_THRESHOLD;
}

/**
 * ngspice device current.
 * - Resistors: @r_<id>[i]
 * - Diodes / LEDs: @d_<id>[id] (ngspice uses [id] for diode current)
 * @param {{ signed?: boolean }} [opts] — when true, keep sign (forward bias = positive for LEDs)
 */
export function getComponentCurrent(
    results,
    spiceComponentId,
    opts = {},
    frameIndex = 0
) {
    if (isTransientResult(results)) {
        const fromSeries =
            getTransientMetric(
                results,
                spiceComponentId,
                'forward_current',
                frameIndex
            ) ??
            getTransientMetric(results, spiceComponentId, 'current', frameIndex);
        if (typeof fromSeries === 'number') {
            return opts.signed ? fromSeries : Math.abs(fromSeries);
        }
    }

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

export function isTransientResult(results) {
    return results?.analysis === 'tran' && Array.isArray(results?.time);
}

/** Peak value of a transient metric series (e.g. charge reference current). */
export function getTransientSeriesMax(
    results,
    spiceComponentId,
    metric,
    { forwardOnly = false } = {}
) {
    const metrics = results?.components?.[spiceComponentId];
    if (!metrics || typeof metrics !== 'object') return undefined;
    const series = metrics[metric];
    if (!Array.isArray(series) || series.length === 0) return undefined;
    let max = 0;
    for (const value of series) {
        if (typeof value !== 'number') continue;
        if (forwardOnly) {
            if (value > max) max = value;
        } else {
            max = Math.max(max, Math.abs(value));
        }
    }
    return max > 0 ? max : undefined;
}

/** Sample one metric from a transient component series at a frame index. */
export function getTransientMetric(results, spiceComponentId, metric, frameIndex = 0) {
    const metrics = results?.components?.[spiceComponentId];
    if (!metrics || typeof metrics !== 'object') return undefined;
    const series = metrics[metric];
    if (!Array.isArray(series) || series.length === 0) return undefined;
    const idx = Math.max(0, Math.min(frameIndex, series.length - 1));
    return series[idx];
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
 *   tranFrameIndex?: number,
 *   ledBrightnessRatio?: number,
 *   dischargeFading?: boolean,
 * }} opts
 */
export function getPlacedComponentImage(type, opts = {}) {
    const base = getComponentImage(type);
    if (!base) return null;

    const {
        liveSimMode,
        switchClosed,
        voltage,
        simOk,
        simResults,
        spiceId,
        tranFrameIndex = 0,
        ledBrightnessRatio,
        dischargeFading = false,
    } = opts;

    if (type === COMPONENT_TYPES.BUTTON || type === COMPONENT_TYPES.SWITCH) {
        if (switchClosed) {
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
        const forwardCurrent = getComponentCurrent(
            simResults,
            spiceId,
            { signed: true },
            tranFrameIndex
        );

        const lit =
            dischargeFading ||
            isLedLitCurrent(forwardCurrent);

        if (liveSimMode && simOk && lit) {
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
    if (raw.analysis === 'tran' || raw.time) return raw;
    if (raw.components || raw.nodes) return raw;
    if (raw.simulationResults && typeof raw.simulationResults === 'object') {
        return normalizeSimulationResults(raw.simulationResults);
    }
    return raw;
}

export function simulationHasError(results) {
    return Boolean(results?.error);
}

export function getComponentVoltage(results, spiceComponentId, frameIndex) {
    const value = results?.components?.[spiceComponentId];
    if (typeof value === 'number') return value;
    const metrics = value && typeof value === 'object' ? value : null;
    if (isTransientResult(results) && metrics) {
        return getTransientMetric(results, spiceComponentId, 'voltage', frameIndex ?? 0);
    }
    const series = metrics?.voltage;
    if (Array.isArray(series) && series.length > 0) {
        return series[series.length - 1];
    }
    return undefined;
}

/**
 * LED brightness ratio for transient charge/discharge (0–1).
 * @param {number} maxCurrent — reference current (peak of charge or pressed DC).
 * @param {'charge'|'discharge'} [direction]
 */
export function getLedBrightnessRatio(
    results,
    spiceComponentId,
    frameIndex,
    maxCurrent,
    direction = 'discharge'
) {
    if (!maxCurrent || maxCurrent <= 0) {
        return 0;
    }
    const current = getComponentCurrent(
        results,
        spiceComponentId,
        { signed: true },
        frameIndex
    );
    if (typeof current !== 'number' || current <= LED_LIT_CURRENT_THRESHOLD) {
        return 0;
    }
    const linear = current / maxCurrent;
    const gamma = direction === 'charge' ? 2.2 : 0.35;
    const perceptual = Math.pow(linear, gamma);
    return Math.max(0, Math.min(1, perceptual));
}

/** Last forward-current sample from a transient run (for LEDs). */
export function getComponentForwardCurrent(results, spiceComponentId, frameIndex) {
    if (isTransientResult(results)) {
        return getTransientMetric(
            results,
            spiceComponentId,
            'forward_current',
            frameIndex ?? 0
        );
    }
    const metrics = results?.components?.[spiceComponentId];
    if (!metrics || typeof metrics !== 'object') return undefined;
    const series = metrics.forward_current ?? metrics.current;
    if (Array.isArray(series) && series.length > 0) {
        return series[series.length - 1];
    }
    return undefined;
}
