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
    if (nodes) {
        const idVariants = [spiceComponentId];
        const lower = String(spiceComponentId).toLowerCase();
        if (lower !== spiceComponentId) {
            idVariants.push(lower);
        }
        for (const id of idVariants) {
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
        }
    }

    // DC motor: components[id] is current. For LEDs/resistors it is voltage (~Vf / IR drop)
    // — never treat that as amperes (would clamp LED glow to full brightness).
    const bare = results?.components?.[spiceComponentId];
    if (typeof bare === 'number' && Math.abs(bare) < 0.5) {
        return opts.signed ? bare : Math.abs(bare);
    }

    return undefined;
}

/** Below this |I|/peak fraction the motor fan is considered stopped. */
const MOTOR_OFF_RATIO = 0.05;
/**
 * Absolute DC full-speed reference (~12 V / 50 Ω motor model).
 * One 6 V pack ≈ 0.12 A → half speed; two packs in series ≈ 0.24 A → full.
 * Do not fold live |I| into the peak — that made every current look 100%.
 * Stall-indicator tasks (DM.L2.10 / L3.11) use higher Rm when “running”
 * (~700 Ω) so |I|≈15–20 mA — still above MOTOR_OFF_RATIO × this reference.
 */
const MOTOR_REF_CURRENT = 0.24;
const MOTOR_PERIOD_SLOW_SEC = 1.15;
const MOTOR_PERIOD_FAST_SEC = 0.16;
/** Period floor when |I| exceeds the absolute reference (e.g. >12 V). */
const MOTOR_PERIOD_MAX_FAST_SEC = 0.08;

/**
 * Map signed motor current to fan spin visuals.
 * @returns {{ spinning: boolean, direction: 1|-1, speedRatio: number, periodSec: number }}
 */
export function getMotorSpinState(
    results,
    spiceComponentId,
    frameIndex = 0,
    peakCurrent
) {
    const current =
        getComponentCurrent(results, spiceComponentId, { signed: true }, frameIndex) ??
        0;
    const abs = Math.abs(current);
    // Transient callers pass peakCurrent so pulses scale to that run's max.
    // DC uses a fixed absolute reference so 6 V vs 12 V look different.
    const peak =
        typeof peakCurrent === 'number' && peakCurrent > 0
            ? Math.max(peakCurrent, MOTOR_REF_CURRENT * 0.25)
            : MOTOR_REF_CURRENT;
    const speedRatio = peak > 0 ? abs / peak : 0;
    if (speedRatio < MOTOR_OFF_RATIO) {
        return {
            spinning: false,
            direction: 1,
            speedRatio: 0,
            periodSec: MOTOR_PERIOD_SLOW_SEC,
        };
    }
    const t =
        (speedRatio - MOTOR_OFF_RATIO) / Math.max(1e-9, 1 - MOTOR_OFF_RATIO);
    const periodSec =
        t <= 1
            ? MOTOR_PERIOD_SLOW_SEC -
              t * (MOTOR_PERIOD_SLOW_SEC - MOTOR_PERIOD_FAST_SEC)
            : MOTOR_PERIOD_FAST_SEC -
              Math.min(1, t - 1) *
                  (MOTOR_PERIOD_FAST_SEC - MOTOR_PERIOD_MAX_FAST_SEC);
    return {
        spinning: true,
        direction: current >= 0 ? 1 : -1,
        speedRatio,
        periodSec,
    };
}

function isLampLit(results, spiceComponentId, voltage) {
    const current = getComponentCurrent(results, spiceComponentId);
    const v =
        typeof voltage === 'number'
            ? Math.abs(voltage)
            : Math.abs(getComponentVoltage(results, spiceComponentId) ?? 0);
    // Match getLampDcBrightnessRatio: tiny IR drop (~mV) must not flip the ON image.
    if (typeof current === 'number' && current > 0.005) return true;
    if (typeof current === 'number') return false;
    return v > 0.8;
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
 * Map LED current onto [0,1] for fade overlays (peak-relative pulse fades).
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
 * Steady-state lamp glow. Prefer current when available — voltage saturates
 * above ~6 V so diode / small-R drops on a 12 V rail look identical.
 * Falls back to voltage when current cannot be read.
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
    if (typeof current === 'number' && current > 0.005) {
        // Near full-rail lamp current: stretch so ~105 mA (two Vf) vs 120 mA
        // (bypass) and similar subtle drops stay visible.
        if (current >= 0.085) {
            return getAbsoluteLampBrightness(current, { fineContrast: true });
        }
        return getAbsoluteLampBrightness(current);
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

/**
 * Absolute DC lamp glow from current (SW.L2.4 mid vs full; SW.L2.5 R-bypass).
 * 100 Ω model: ~60 mA @ 6 V, ~100 mA with 20 Ω series @ 12 V, ~120 mA @ 12 V.
 * @param {{ fineContrast?: boolean }} [opts] — stretch upper range for small drops
 */
export function getAbsoluteLampBrightness(current, opts = {}) {
    // ~45 mA: pot end-stop (~50 Ω) + 100 Ω lamp @ 6 V stays dark; bare lamp (~60 mA) still lit.
    const litMin = 0.045;
    const fullCurrent = 0.12;
    if (typeof current !== 'number' || current < litMin) {
        return 0;
    }
    if (opts.fineContrast) {
        // SW.L2.5 / diode bypass: ~100 mA → ~0.7, ~120 mA → 1
        const lo = 0.08;
        const hi = 0.12;
        const u = Math.max(0, Math.min(1, (current - lo) / (hi - lo)));
        return 0.4 + 0.6 * u;
    }
    const t = Math.max(
        0,
        Math.min(1, (current - litMin) / (fullCurrent - litMin))
    );
    // ~60 mA → ~0.72; ~120 mA → 1.
    return 0.5 + 0.5 * Math.pow(t, 0.65);
}

/**
 * Absolute DC LED glow from forward current (SW dim/bright, etc.).
 * Below ~0.5 mA → off (100 kΩ / 500 kΩ stay dark on 12 V).
 * ~2 mA (5.1 kΩ) → clearly lit but dimmer than ~10 mA (1 kΩ).
 * @param {{ fineContrast?: boolean, seriesBypass?: boolean }} [opts]
 */
export function getAbsoluteLedBrightness(current, opts = {}) {
    const abs =
        typeof current === 'number' ? Math.abs(current) : Number.NaN;
    const litMin = 0.0005;
    const fullCurrent = 0.01;
    if (typeof abs !== 'number' || Number.isNaN(abs) || abs < litMin) {
        return 0;
    }
    if (opts.seriesBypass) {
        // SW.L2.10: ~1 mA (two series R) → dim, ~2 mA (one R bypassed) → clearly brighter
        const lo = 0.0006;
        const hi = 0.0025;
        const u = Math.max(0, Math.min(1, (abs - lo) / (hi - lo)));
        return 0.4 + 0.6 * Math.pow(u, 0.75);
    }
    if (opts.fineContrast) {
        // SW.L2.9: baseline (~2 mA, 5.1k) and weak ‖10k (~3 mA) look the same;
        // only strong ‖1k (~12 mA) raises glow clearly.
        const weakTop = 0.004;
        const strong = 0.012;
        if (abs <= weakTop) {
            // Flat dim glow across 5.1k alone and 5.1k‖10k
            return 0.62;
        }
        const u = Math.max(
            0,
            Math.min(1, (abs - weakTop) / (strong - weakTop))
        );
        return 0.62 + 0.38 * Math.pow(u, 0.55);
    }
    const t = Math.max(
        0,
        Math.min(1, (abs - litMin) / (fullCurrent - litMin))
    );
    // ~2 mA → ~0.68; ~10 mA → 1 (still a clear step between 5.1 kΩ and 1 kΩ).
    return 0.42 + 0.58 * Math.pow(t, 0.55);
}

/**
 * CP.L2.14-style gradual brighten/fade.
 * - Below ~0.35 mA → off (e.g. 100 kΩ branches look dark).
 * - Only use baseline→peak mapping when press actually increases current.
 * - Otherwise use a soft absolute scale (no fake 3 mA “full” peak).
 */
export function getBaselineRelativeLedBrightness(
    current,
    baselineCurrent,
    peakCurrent
) {
    const litMin = 0.00035;
    if (typeof current !== 'number' || current < litMin) {
        return 0;
    }

    const baseline =
        typeof baselineCurrent === 'number' && baselineCurrent > 0
            ? baselineCurrent
            : current;
    const peak =
        typeof peakCurrent === 'number' && peakCurrent > 0
            ? peakCurrent
            : current;

    const rise = peak - baseline;
    const hasContrast = peak > baseline * 1.2 && rise > 0.00015;

    if (hasContrast) {
        const t = Math.max(0, Math.min(1, (current - baseline) / rise));
        // Dim baseline ~0.58, full peak ~1.
        return 0.58 + 0.42 * t;
    }

    // High-R / no real brighten: absolute glow, stays dark near litMin.
    // ~0.35 mA → 0, ~1 mA → ~0.32, ~2 mA → ~0.58, ≥3 mA → ~0.72.
    const absT = Math.max(0, Math.min(1, (current - litMin) / 0.0027));
    return Math.pow(absT, 0.85) * 0.72;
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
