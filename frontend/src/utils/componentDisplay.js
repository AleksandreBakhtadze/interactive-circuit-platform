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

/** SPDT slide switch: left = A–B, right = A–C. */
const SLIDE_SWITCH_IMAGES = {
    left: '/components/slide-switch-ab.svg',
    right: '/components/slide-switch.svg',
};

const LED_ON_IMAGES = {
    red: '/components/lightningled-red.svg',
    green: '/components/lightningled-green.svg',
    blue: '/components/lightningled-blue.svg',
};

const LIT_CURRENT_THRESHOLD = 0.01;

/** LEDs can conduct visibly below 10 mA (e.g. ~1 mA with a larger series resistor). */
const LED_LIT_CURRENT_THRESHOLD = 0.00015;

/**
 * Current that maps to full LED glow opacity.
 * ~5 mA is “bright”; ~1 mA (e.g. 1k at 3 V) must still show a clear glow.
 */
export const LED_FULL_BRIGHT_CURRENT = 0.005;

/**
 * Rated 6 V lamp ≈ 0.25 A → ~24 Ω (used in spice). Visual dimming uses
 * voltage across the lamp so a small series R (which steals voltage) dims a lot,
 * while a single 3 V pack still looks clearly lit.
 */
export const LAMP_RATED_VOLTAGE = 6;

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

    // ngspice / backend normalize device ids to lowercase in @r_/@d_ keys.
    const id = String(spiceComponentId ?? '').toLowerCase();

    const rKey = `@r_${id}[i]`;
    const rVal = nodes[rKey];
    if (typeof rVal === 'number') {
        return opts.signed ? rVal : Math.abs(rVal);
    }

    const dKey = `@d_${id}[id]`;
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

/**
 * Earliest sim time after which every LED forward_current series is within
 * 5% of its final value (crossfade / dip-reclaim "interesting" window).
 * Falls back to stop. Handles dip-then-rise (settle from valley to end).
 */
export function getTransientSettleTime(results) {
    const times = results?.time;
    if (!Array.isArray(times) || times.length < 2) return undefined;
    const stop = times[times.length - 1];
    let settle = 0;
    let found = false;

    const components = results?.components;
    if (!components || typeof components !== 'object') return stop;

    for (const metrics of Object.values(components)) {
        if (!metrics || typeof metrics !== 'object') continue;
        const series = metrics.forward_current ?? metrics.current;
        if (!Array.isArray(series) || series.length < 2) continue;

        const start = series[0];
        const end = series[series.length - 1];
        if (typeof start !== 'number' || typeof end !== 'number') continue;

        let min = start;
        let minIdx = 0;
        for (let i = 0; i < series.length; i += 1) {
            const v = series[i];
            if (typeof v === 'number' && v < min) {
                min = v;
                minIdx = i;
            }
        }

        // Dip then reclaim: measure rise from valley to end.
        const dipThenRise =
            minIdx > 0 &&
            minIdx < series.length - 1 &&
            end - min > Math.abs(end - start) + 5e-5 &&
            end - min > 5e-5;

        const from = dipThenRise ? min : start;
        const span = Math.abs(end - from);
        if (span < 5e-5) continue;

        const rising = end > from;
        const threshold = rising ? from + 0.95 * span : from - 0.95 * span;
        const searchFrom = dipThenRise ? minIdx : 0;

        let idx = series.length - 1;
        for (let i = searchFrom; i < series.length; i += 1) {
            const v = series[i];
            if (typeof v !== 'number') continue;
            if (rising ? v >= threshold : v <= threshold) {
                idx = i;
                break;
            }
        }
        settle = Math.max(settle, times[Math.min(idx, times.length - 1)]);
        found = true;
    }

    if (!found) return stop;
    // Pad slightly past settle; never exceed the run stop.
    return Math.min(stop, Math.max(settle * 1.25, 0.2));
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
 *   slideState?: 'left'|'right',
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
        slideState,
        voltage,
        simOk,
        simResults,
        spiceId,
        tranFrameIndex = 0,
        dischargeFading = false,
    } = opts;

    if (type === COMPONENT_TYPES.SLIDE_SWITCH) {
        const throwSide =
            slideState === 'right' || slideState === 'left'
                ? slideState
                : switchClosed
                  ? 'right'
                  : 'left';
        return SLIDE_SWITCH_IMAGES[throwSide] ?? SLIDE_SWITCH_IMAGES.left;
    }

    if (type === COMPONENT_TYPES.BUTTON || type === COMPONENT_TYPES.SWITCH) {
        if (switchClosed) {
            return ON_IMAGES[type] ?? base;
        }
        return base;
    }

    if (type === COMPONENT_TYPES.LAMP) {
        // Overlay path forces the lit artwork; otherwise binary on/off for non-overlay callers.
        if (dischargeFading) {
            return ON_IMAGES[type] ?? base;
        }
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

/** Below this fraction of the reference current, treat glow as fully off. */
const BRIGHTNESS_OFF_RATIO_FLOOR = 0.12;

/**
 * Map a device current to glow opacity (0–1).
 * @param {number} current
 * @param {number} fullCurrent — current that should look fully bright
 * @param {{ gamma?: number, floor?: number }} [opts]
 */
export function getCurrentBrightnessRatio(
    current,
    fullCurrent,
    { gamma = 0.7, floor = BRIGHTNESS_OFF_RATIO_FLOOR } = {}
) {
    if (!fullCurrent || fullCurrent <= 0) {
        return 0;
    }
    if (typeof current !== 'number' || current <= 0) {
        return 0;
    }
    const linear = Math.min(1, current / fullCurrent);
    if (linear <= floor) {
        return 0;
    }
    const remapped = (linear - floor) / (1 - floor);
    return Math.max(0, Math.min(1, Math.pow(remapped, gamma)));
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
    const current = getComponentCurrent(
        results,
        spiceComponentId,
        { signed: true },
        frameIndex
    );
    // Scale relative to the known peak — do not apply the absolute lit threshold here,
    // or LEDs near ~1 mA (e.g. CP.L2.5 red branch with 5k1) never glow.
    const gamma = direction === 'charge' ? 2.2 : 0.55;
    return getCurrentBrightnessRatio(current, maxCurrent, { gamma });
}

/**
 * Steady-state LED glow from absolute forward current (different resistors → different brightness).
 */
export function getLedDcBrightnessRatio(results, spiceComponentId, frameIndex = 0) {
    const current = getComponentCurrent(
        results,
        spiceComponentId,
        { signed: true },
        frameIndex
    );
    if (!isLedLitCurrent(current)) {
        return 0;
    }
    // Boost the low end so ~1 mA (≈1k at 3 V) still glows; keep headroom so
    // 100 Ω vs 1k (or 1k vs 5.1k) stay visibly different.
    const ratio = getCurrentBrightnessRatio(current, LED_FULL_BRIGHT_CURRENT, {
        gamma: 0.5,
        floor: 0.008,
    });
    // Never show a “lit” LED as fully dark.
    return Math.max(0.28, ratio);
}

/**
 * Steady-state lamp glow from voltage across the bulb.
 * Two 3 V packs (≈6 V) → full glow; one pack (≈3 V) → clearly lit but dimmer.
 * Extra series R drops V_lamp further and dims more.
 */
export function getLampDcBrightnessRatio(results, spiceComponentId, frameIndex = 0) {
    const current = getComponentCurrent(results, spiceComponentId, {}, frameIndex);
    const voltage = Math.abs(
        getComponentVoltage(results, spiceComponentId, frameIndex) ?? 0
    );
    const conducting =
        (typeof current === 'number' && current > 0.005) || voltage > 0.8;
    if (!conducting) {
        return 0;
    }
    // Soft curve: 6 V → 1.0, 3 V → ~0.6 (visible, still less than two packs).
    const ratio = getCurrentBrightnessRatio(voltage, LAMP_RATED_VOLTAGE, {
        gamma: 0.7,
        floor: 0.05,
    });
    if (voltage >= 2.4) {
        return Math.max(0.55, Math.min(1, ratio));
    }
    return ratio;
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
