import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { simulateCircuit, validateCircuit } from '../../api';
import { useLang } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';
import { getComponentImage } from '../../constants/componentAssets';
import {
    CAPACITOR_SPECS,
    capacitorType,
    CONNECTOR_LENGTHS,
    connectorType,
    COMPONENT_TYPES,
    getCapacitorGroupItem,
    getCapacitorMaxCount,
    getCapacitorSpec,
    getConnectorGroupItem,
    getConnectorMaxCount,
    getFootprint,
    getLedGroupItem,
    getLedMaxCount,
    getLedMaxCountForType,
    getLedSpec,
    getPaletteForProblem,
    usesTransientSimulation,
    usesSwitchCrossfadeSimulation,
    usesParallelCapDipSimulation,
    usesMasterSwitchSimulation,
    usesMasterOffDischargeSimulation,
    usesParallelCapPolaritySimulation,
    usesCircuitValidation,
    getResistorGroupItem,
    getResistorMaxCount,
    getResistorSpec,
    getStandardPaletteItems,
    getTransistorGroupItem,
    getTransistorMaxCount,
    getTransistorSpec,
    getWireCableColor,
    getWireGroupItem,
    getWireMaxCount,
    getWirePinImage,
    isResistorType,
    isPhotoAccessoryType,
    isWireType,
    LED_SPECS,
    ledType,
    parseCapacitorKey,
    parseConnectorLength,
    isLedType,
    parseLedKey,
    parseResistorKey,
    parseTransistorKey,
    RESISTOR_SPECS,
    resistorType,
    TRANSISTOR_SPECS,
    transistorType,
    usesResistorTotalCap,
    WIRE_COLOR_SPECS,
} from '../../constants/componentCatalog';
import {
    getRotatedFootprint,
    normalizeRotation,
    rotationSteps,
} from '../../constants/componentRotation';
import {
    getComponentCurrent,
    getComponentVoltage,
    getLedBrightnessRatio,
    getLedDcBrightnessRatio,
    getAntiparallelLedDcBrightnessRatio,
    getRgbSequenceLedDcBrightnessRatio,
    getLampDcBrightnessRatio,
    getBaselineRelativeLedBrightness,
    getPhotoModuleLedDimBrightness,
    getPhotoModuleLedBrightBrightness,
    getPhotoModuleLedContrastBrightness,
    getPrL311SeriesLedBrightness,
    getPrL212LedBrightness,
    getAbsoluteLedBrightness,
    getAbsoluteLampBrightness,
    getMotorSpinState,
    getTransientSeriesMax,
    getTransientSettleTime,
    getPlacedComponentImage,
    isTransientResult,
    normalizeSimulationResults,
    simulationHasError,
} from '../../utils/componentDisplay';
import {
    clearCircuitDraft,
    loadCircuitDraft,
    saveCircuitDraft,
} from '../../utils/circuitDraftStorage';
import {
    buildCircuitJson,
    clampPotPosition,
    createInitialSwitchStates,
    DEFAULT_POT_POSITION,
    formatPotResistanceLabel,
    isBoardComplete,
    isInteractivePart,
    isMomentaryInteractive,
    isToggleInteractive,
    isSlideSwitchType,
    isVarResistorType,
    lightLevelForPhotoResistor,
    PHOTO_AMBIENT_LIGHT_LEVEL,
    supportsMotorStallToggle,
    toSpiceId,
} from '../../utils/circuitNetlist';
import {
    alignPlacementAnchor,
    canPlaceAt,
    countPlacedByType,
    createComponentId,
    getWireEndpoints,
} from '../CircuitSimulator/circuitUtils';
import CircuitBoard from './CircuitBoard';
import {
    getAccessoryStyleAtGridPoint,
    getPartStyle,
    parseDragPayload,
    partStyleToCss,
    pointerToGridPoint,
    pointerToPin,
    getBoardStage,
} from './boardPlacement';
import { DOT_COL_X, DOT_ROW_Y } from './boardLayout';
import styles from './CircuitWorkbench.module.css';

const MOVE_DRAG_THRESHOLD_PX = 4;
/**
 * Max one live sim per this interval while dragging torch / cover.
 * (Throttle — not trailing debounce, which still fires once per pause/cell.)
 */
const ACCESSORY_SIM_MIN_INTERVAL_MS = 480;
/** Quantize drag grid so tiny moves do not each schedule a sim. */
const ACCESSORY_SIM_GRID_STEP = 0.5;
/** Ignore accessory moves that change effective light by less than this. */
const ACCESSORY_LIGHT_EPSILON = 0.08;

function pinToPercent(row, col) {
    return {
        x: (DOT_COL_X[col] ?? 0) * 100,
        y: (DOT_ROW_Y[row] ?? 0) * 100,
    };
}

function clientToStagePercent(clientX, clientY, stageEl) {
    if (!stageEl) return null;
    const rect = stageEl.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return {
        x: ((clientX - rect.left) / rect.width) * 100,
        y: ((clientY - rect.top) / rect.height) * 100,
    };
}

function wireAngleDeg(from, to) {
    return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
}

/**
 * Keep the rotate handle at the screen top-right of a CSS-rotated part,
 * and counter-rotate the icon so it stays upright.
 */
function rotateHandleScreenStyle(rotation = 0) {
    const r = normalizeRotation(rotation);
    const upright = { transform: `rotate(${-r}deg)` };
    if (r === 90) {
        return { ...upright, top: -10, left: -10, right: 'auto', bottom: 'auto' };
    }
    if (r === 180) {
        return { ...upright, bottom: -10, left: -10, top: 'auto', right: 'auto' };
    }
    if (r === 270) {
        return { ...upright, bottom: -10, right: -10, top: 'auto', left: 'auto' };
    }
    return { ...upright, top: -10, right: -10, left: 'auto', bottom: 'auto' };
}

/** Topmost placed part under the cursor (ignores drop preview). */
function findPlacedPartIdAt(clientX, clientY) {
    if (typeof document.elementsFromPoint !== 'function') {
        return null;
    }

    for (const el of document.elementsFromPoint(clientX, clientY)) {
        const part = el.closest('[data-placed-part]');
        if (part?.dataset.placedPart) {
            return part.dataset.placedPart;
        }
    }

    return null;
}

function isWidePalettePart(type) {
    const { w, h } = getFootprint(type);
    return w > h;
}

function incompleteBoardMessage(problemCode, lang) {
    if (lang === 'ka') {
        if (problemCode === 'ST.L1.2') {
            return 'განათავსეთ: 2 კვების წყარო, ღილაკი, ნათურა';
        }
        if (problemCode === 'ST.L1.3') {
            return 'განათავსეთ: კვების წყარო, ჩამრთველი, ღილაკი, ნათურა';
        }
        if (problemCode === 'ST.L1.8') {
            return 'განათავსეთ: კვების წყარო, ჩამრთველი, ღილაკი, წითელი LED, რეზისტორი';
        }
        if (problemCode === 'VR.L1.1') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ცვლადი რეზისტორი, წითელი LED, რეზისტორი';
        }
        if (problemCode === 'PR.L1.1' || problemCode === 'PR.L1.2') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ფოტორეზისტორი, წითელი LED, რეზისტორი';
        }
        if (problemCode === 'PR.L2.3') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ფოტორეზისტორი, წითელი LED, 2 რეზისტორი';
        }
        if (problemCode === 'PR.L2.4') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, გადამრთველი, ფოტორეზისტორი, ლურჯი LED, 2 რეზისტორი';
        }
        if (problemCode === 'PR.L1.5') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, ფოტორეზისტორი, 2 წითელი LED, რეზისტორი (10k)';
        }
        if (problemCode === 'PR.L2.9') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ფოტორეზისტორი, 2 წითელი LED, 2 განსხვავებული რეზისტორი';
        }
        if (problemCode === 'PR.L3.10') {
            return 'განათავსეთ: 2 კვების წყარო, ფოტორეზისტორი, წითელი და მწვანე LED, რეზისტორი';
        }
        if (problemCode === 'PR.L3.11') {
            return 'განათავსეთ: 2 კვების წყარო, ფოტორეზისტორი, წითელი და მწვანე LED, რეზისტორები';
        }
        if (problemCode === 'PR.L2.12') {
            return 'განათავსეთ სურათის მიხედვით: 2 კვების წყარო, ფოტორეზისტორი, წითელი და მწვანე LED, 1k და 5.1k რეზისტორები';
        }
        if (problemCode === 'PR.L3.6') {
            return 'განათავსეთ: 2 კვების წყარო, ფოტორეზისტორი (+ ნებისმიერი ნაცნობი დეტალები გაზომვისთვის)';
        }
        if (problemCode === 'VR.L1.2') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ცვლადი რეზისტორი, წითელი LED, 2 რეზისტორი';
        }
        if (problemCode === 'VR.L1.3') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ცვლადი რეზისტორი, წითელი და მწვანე LED, რეზისტორი';
        }
        if (problemCode === 'VR.L1.4') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, ცვლადი რეზისტორი, წითელი LED, რეზისტორი';
        }
        if (problemCode === 'VR.L1.5') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, ცვლადი რეზისტორი, წითელი LED, რეზისტორი';
        }
        if (problemCode === 'VR.L2.6') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ცვლადი რეზისტორი, წითელი LED, რეზისტორი (B და C შეაერთეთ)';
        }
        if (problemCode === 'VR.L2.7') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ცვლადი რეზისტორი, წითელი LED, რეზისტორი (B და C შეაერთეთ; პოტი LED-ის პარალელურად)';
        }
        if (problemCode === 'VR.L2.8') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ცვლადი რეზისტორი, წითელი LED, 2 რეზისტორი (B და C შეაერთეთ; დამატებითი R პოტის მიმდევრობით)';
        }
        if (problemCode === 'VR.L2.9') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, გადამრთველი, ცვლადი რეზისტორი, წითელი LED, რეზისტორი';
        }
        if (problemCode === 'VR.L1.10') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ცვლადი რეზისტორი, ნათურა (სურათის მიხედვით)';
        }
        if (problemCode === 'VR.L2.11') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ცვლადი რეზისტორი, მწვანე და წითელი LED, ნათურა, 3 რეზისტორი';
        }
        if (problemCode === 'VR.L2.12') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, 2 ცვლადი რეზისტორი, წითელი LED, რეზისტორი';
        }
        if (problemCode === 'VR.L2.13') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, 2 ცვლადი რეზისტორი, წითელი LED, რეზისტორი (საპირისპირო ბოლოები)';
        }
        if (problemCode === 'VR.L2.15') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, 2 ცვლადი რეზისტორი, 2 წითელი LED, რეზისტორი';
        }
        if (problemCode === 'VR.L3.19') {
            return 'განათავსეთ: 2 კვების წყარო, ცვლადი რეზისტორი, წითელი LED, მწვანე LED, რეზისტორი';
        }
        if (problemCode === 'VR.L1.20') {
            return 'განათავსეთ: 2 კვების წყარო, ცვლადი რეზისტორი, წითელი LED, მწვანე LED, 2 ერთნაირი რეზისტორი';
        }
        if (problemCode === 'VR.L3.22') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ცვლადი რეზისტორი, წითელი, მწვანე და ლურჯი LED, რეზისტორები (1k×2, 5.1k, 10k)';
        }
        if (problemCode === 'VR.L4.23') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ცვლადი რეზისტორი, წითელი, მწვანე და ლურჯი LED, რეზისტორები';
        }
        if (problemCode === 'ST.L2.9') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, წითელი და მწვანე LED, რეზისტორი';
        }
        if (problemCode === 'LR.L1.1') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, 2 წითელი LED, რეზისტორი';
        }
        if (problemCode === 'LR.L1.2') {
            return 'განათავსეთ: კვების წყარო, ჩამრთველი, ღილაკი, 2 წითელი LED, რეზისტორი';
        }
        if (problemCode === 'LR.L1.3') {
            return 'განათავსეთ: კვების წყარო, ჩამრთველი, ღილაკი, 2 წითელი LED, 2 რეზისტორი';
        }
        if (problemCode === 'LR.L2.4') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, ნათურა, წითელი LED, რეზისტორი';
        }
        if (problemCode === 'LR.L2.5') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, 2 ღილაკი, ნათურა, წითელი LED, რეზისტორი';
        }
        if (problemCode === 'LR.L3.6') {
            return 'განათავსეთ: კვების წყარო, ღილაკი, წითელი LED, რეზისტორი';
        }
        if (problemCode === 'LR.L2.7' || problemCode === 'LR.L3.8') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, წითელი LED, რეზისტორი';
        }
        if (problemCode === 'LR.L3.9') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, 2 ღილაკი, წითელი LED, მინიმუმ 2 რეზისტორი';
        }
        if (problemCode === 'LR.L3.10') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, 2 წითელი LED, მინიმუმ 2 რეზისტორი';
        }
        if (problemCode === 'LR.L1.11') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, წითელი და მწვანე LED, რეზისტორი';
        }
        if (problemCode === 'LR.L2.12') {
            return 'განათავსეთ: კვების წყარო, ჩამრთველი, წითელი და მწვანე LED, 2 რეზისტორი';
        }
        if (problemCode === 'LR.L2.13') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, წითელი LED, 2×1 kΩ რეზისტორი';
        }
        if (problemCode === 'LR.L2.14' || problemCode === 'LR.L2.15') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, 2 წითელი LED, 2×1 kΩ რეზისტორი';
        }
        if (problemCode === 'LR.L2.16' || problemCode === 'LR.L2.17') {
            return 'განათავსეთ: 2 კვების წყარო, 2 ღილაკი, 2 წითელი LED, რეზისტორ(ებ)ი';
        }
        if (problemCode === 'LR.L2.18') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, წითელი და მწვანე LED, რეზისტორ(ებ)ი';
        }
        if (problemCode === 'LR.L4.19') {
            return 'განათავსეთ: კვების წყარო, ჩამრთველი, 2 ღილაკი, 2 წითელი LED, რეზისტორი';
        }
        if (problemCode === 'LR.L4.20') {
            return 'განათავსეთ: 2 კვების წყარო, 2 ღილაკი, 2 წითელი LED, რეზისტორ(ებ)ი';
        }
        if (problemCode === 'LR.L4.21') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, წითელი და მწვანე LED, 2 რეზისტორი';
        }
        if (problemCode === 'LR.L4.22') {
            return 'განათავსეთ: კვების წყარო, 2 ღილაკი, 2 წითელი და მწვანე LED, რეზისტორ(ებ)ი';
        }
        if (problemCode === 'LR.L4.23') {
            return 'განათავსეთ: 2 კვების წყარო, 2 ღილაკი, 2 წითელი, 2 მწვანე, 2 ლურჯი LED, რეზისტორ(ებ)ი';
        }
        if (problemCode === 'ST.L2.10') {
            return 'განათავსეთ: კვების წყარო, ჩამრთველი, 2 ღილაკი, წითელი LED, რეზისტორი';
        }
        if (problemCode === 'ST.L2.11') {
            return 'განათავსეთ: კვების წყარო, ჩამრთველი, 2 ღილაკი, წითელი LED, რეზისტორი';
        }
        if (problemCode === 'ST.L2.12') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, 2 ღილაკი, მწვანე და ლურჯი LED, რეზისტორი';
        }
        if (problemCode === 'ST.L2.13') {
            return 'განათავსეთ: კვების წყარო, ჩამრთველი, 2 ღილაკი, წითელი და ლურჯი LED, 2 რეზისტორი';
        }
        if (problemCode === 'ST.L2.14') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, 2 ღილაკი, 2 მწვანე და 2 ლურჯი LED, 2 რეზისტორი';
        }
        if (problemCode === 'CP.L1.1') {
            return 'განათავსეთ: 2 კვების წყარო, ღილაკი, წითელი LED, კონდენსატორი, რეზისტორი';
        }
        if (problemCode === 'CP.L1.2') {
            return 'განათავსეთ: 2 კვების წყარო, ღილაკი, წითელი LED, კონდენსატორი, 2 რეზისტორი';
        }
        if (problemCode === 'CP.L2.3') {
            return 'განათავსეთ: 2 კვების წყარო, გადამრთველი (სლაიდერი), წითელი და მწვანე LED, 2 კონდენსატორი, რეზისტორები';
        }
        if (problemCode === 'CP.L2.4') {
            return 'განათავსეთ: 2 კვების წყარო, ღილაკი, წითელი LED, კონდენსატორი, 2 რეზისტორი';
        }
        if (problemCode === 'CP.L2.5') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, გადამრთველი, წითელი და მწვანე LED, კონდენსატორი, 2 რეზისტორი';
        }
        if (problemCode === 'CP.L2.6') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, გადამრთველი, წითელი და მწვანე LED (ანტიპარ.), კონდესატორი, 1 kΩ რეზისტორი';
        }
        if (problemCode === 'CP.L2.7') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, გადამრთველი, ანტიპარ. LED-ები, პარალელური კონდესატორი, 2×1 kΩ';
        }
        if (problemCode === 'CP.L2.8') {
            return 'განათავსეთ: 2 კვების წყარო, გადამრთველი, ძრავი, კონდესატორი';
        }
        if (problemCode === 'CP.L2.9') {
            return 'განათავსეთ: 2 კვების წყარო (სერიულად 12 ვ), 2 გადამრთველი, ძრავი, კონდესატორი';
        }
        if (problemCode === 'CP.L2.12') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, გადამრთველი, ანტიპარ. LED-ები, 2×470 µF (მიმდევრობით), 1 kΩ';
        }
        if (problemCode === 'CP.L2.13') {
            return 'განათავსეთ: 2 კვების წყარო, ღილაკი, წითელი/მწვანე/ლურჯი LED, კონდესატორი, რეზისტორები';
        }
        if (problemCode === 'CP.L2.14') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, წითელი LED, კონდესატორი, რეზისტორები';
        }
        if (problemCode === 'CP.L2.15') {
            return 'განათავსეთ: 2 კვების წყარო, ღილაკი, წითელი და მწვანე LED, 2 კონდესატორი (მწვანესთან უფრო მცირე C), რეზისტორები';
        }
        if (problemCode === 'CP.L2.16') {
            return 'განათავსეთ: 2 კვების წყარო (სერიულად), გადამრთველი, წითელი LED, კონდესატორი, 2 რეზისტორი';
        }
        if (problemCode === 'CP.L4.19') {
            return 'განათავსეთ: 2×3 ვ კვება, 2 გადამრთველი, 2 მწვანე + 2 ლურჯი LED (მიმდევრობით), კონდესატორი';
        }
        if (problemCode === 'SW.L1.1') {
            return 'განათავსეთ: 2 კვების წყარო, გადამრთველი, 2 წითელი LED, რეზისტორი(ები)';
        }
        if (problemCode === 'SW.L1.2') {
            return 'განათავსეთ: 2 კვების წყარო, გადამრთველი, წითელი LED, 2 განსხვავებული რეზისტორი (მაგ. 5.1k და 1k)';
        }
        if (problemCode === 'SW.L1.13') {
            return 'განათავსეთ: 2 კვების წყარო, გადამრთველი, ნათურა, წითელი LED, 1 რეზისტორი (მაგ. 1 kΩ)';
        }
        if (problemCode === 'SW.L4.14') {
            return 'განათავსეთ: 2 კვების წყარო, გადამრთველი, ნათურა, წითელი LED, 2 რეზისტორი (მაგ. 1 kΩ)';
        }
        if (problemCode === 'SW.L2.3') {
            return 'განათავსეთ: 2 კვების წყარო, გადამრთველი, წითელი LED, მხოლოდ 1 რეზისტორი';
        }
        if (problemCode === 'SW.L2.4') {
            return 'განათავსეთ: 2 კვების წყარო, გადამრთველი, ნათურა';
        }
        if (problemCode === 'SW.L2.5') {
            return 'განათავსეთ: 2 კვების წყარო, გადამრთველი, ნათურა, 1 რეზისტორი (მაგ. 20 Ω)';
        }
        if (problemCode === 'SW.L2.9') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, გადამრთველი, წითელი LED, 3 რეზისტორი (5.1k მუდმივი; 1k და 10k — ღილაკის მომატება)';
        }
        if (problemCode === 'SW.L2.10') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, გადამრთველი, მწვანე და ლურჯი LED, 2 რეზისტორი (სერიულად; ღილაკი ერთს შემოავლებს)';
        }
        if (problemCode === 'SW.L3.11') {
            return 'განათავსეთ: 2 კვების წყარო, ღილაკი, გადამრთველი, წითელი/მწვანე/ლურჯი LED, 1 რეზისტორი (მაგ. 1 kΩ)';
        }
        if (problemCode === 'SW.L3.6') {
            return 'განათავსეთ: 2 კვების წყარო, 2 გადამრთველი, ნათურა';
        }
        if (problemCode === 'SW.L3.7') {
            return 'განათავსეთ: 2 კვების წყარო, 2 გადამრთველი, წითელი და მწვანე LED, რეზისტორი';
        }
        if (problemCode === 'SW.L3.8') {
            return 'განათავსეთ: 2 კვების წყარო, 2 გადამრთველი, 2 მწვანე LED, რეზისტორები (ძაბვის გამყოფი)';
        }
        if (problemCode === 'DM.L1.1') {
            return 'განათავსეთ: კვების წყარო, ჩამრთველი, ღილაკი, ძრავი';
        }
        if (problemCode === 'DM.L2.2') {
            return 'განათავსეთ: 2 კვების წყარო, გადამრთველი, ძრავი';
        }
        if (problemCode === 'DM.L2.3') {
            return 'განათავსეთ: 2 კვების წყარო, გადამრთველი, ძრავი, რეზისტორი ან ნათურა';
        }
        if (problemCode === 'DM.L2.5') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, ძრავი, რეზისტორი ან ნათურა';
        }
        if (problemCode === 'DM.L2.6') {
            return 'განათავსეთ: 2 კვების წყარო, გადამრთველი, ძრავი';
        }
        if (problemCode === 'DM.L2.7') {
            return 'განათავსეთ: 2 კვების წყარო, გადამრთველი, ძრავი, 2 რეზისტორი (დაბალი R, მაგ. 20 Ω)';
        }
        if (problemCode === 'DM.L2.8') {
            return 'განათავსეთ: 2 კვების წყარო, 2 გადამრთველი, ძრავი';
        }
        if (problemCode === 'DM.L3.9') {
            return 'განათავსეთ: 2 კვების წყარო, გადამრთველი, ძრავი, წითელი და მწვანე LED, რეზისტორი (მაგ. 1 kΩ)';
        }
        if (problemCode === 'DM.L2.10') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ძრავი, წითელი LED, რეზისტორი (1 kΩ) და 20 Ω ან ნათურა';
        }
        if (problemCode === 'DM.L3.11') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ძრავი, წითელი და მწვანე LED, 3 რეზისტორი (მაგ. 100 Ω + 2×1 kΩ)';
        }
        if (problemCode === 'DM.L2.13') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, 2 გადამრთველი, ძრავი, ნათურა';
        }
        if (problemCode === 'DM.L3.14') {
            return 'განათავსეთ: 2 კვების წყარო, ძრავი (და ნაცნობი დეტალები — ჩამრთველი, ღილაკები, LED…)';
        }
        if (problemCode === 'DM.L4.4') {
            return 'განათავსეთ: 2 კვების წყარო, ძრავი (და საზომი დეტალები სურვილისამებრ)';
        }
        if (problemCode === 'DI.L1.1') {
            return 'განათავსეთ: 2 კვების წყარო, ღილაკი, დიოდი, ნათურა';
        }
        if (problemCode === 'DI.L2.2') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, 2 დიოდი, ნათურა';
        }
        if (problemCode === 'DI.L1.4') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, 2 დიოდი, 2 წითელი LED, 1 რეზისტორი';
        }
        if (problemCode === 'DI.L3.5') {
            return 'განათავსეთ: 2 კვების წყარო, ღილაკი, დიოდი, ძრავი (და ნაცნობი დეტალები სურვილისამებრ)';
        }
        if (problemCode === 'DI.L3.6') {
            return 'განათავსეთ: 2 კვების წყარო, ცვლადი რეზისტორი, დიოდი, 2 წითელი LED, კონდენსატორი, 2 რეზისტორი';
        }
        if (problemCode === 'DI.L3.7') {
            return 'განათავსეთ: 2 კვების წყარო, ძრავი, დიოდები, 2 რბილი გამტარი (წითელი/შავი), დაბალი წინაღობის რეზისტორები';
        }
        if (problemCode === 'DI.L4.8') {
            return 'განათავსეთ: 2 კვების წყარო, 2 დიოდი, 1 მწვანე და 2 წითელი LED, 1 რეზისტორი, 2 რბილი გამტარი';
        }
        if (problemCode === 'TR.L2.10' || problemCode === 'TR.L2.11') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ცვლადი რეზისტორი, NPN Q1, ძრავი, რეზისტორი';
        }
        if (problemCode === 'TR.L2.12' || problemCode === 'TR.L2.13') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, NPN Q1, ნათურა, 2 რეზისტორი (≥1k)';
        }
        if (problemCode === 'TR.L2.14') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, NPN Q1, ნათურა, ძრავი, რეზისტორი';
        }
        if (problemCode === 'TR.L2.16') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ცვლადი რეზისტორი, 2 NPN, ნათურა, ძრავი, რეზისტორები';
        }
        if (problemCode === 'TR.L2.17') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, 2 ღილაკი, 2 NPN, ნათურა, 1k რეზისტორები';
        }
        if (problemCode === 'TCP.L1.1' || problemCode === 'TCP.L1.2') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, NPN Q1, წითელი LED, კონდენსატორი, რეზისტორები';
        }
        if (problemCode === 'TCP.L1.3' || problemCode === 'TCP.L1.4') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, NPN Q1, ნათურა, 2×470µF კონდენსატორი, რეზისტორები';
        }
        if (problemCode === 'TCP.L3.5') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, NPN Q1, ნათურა, კონდენსატორი (სერიულად ბაზაზე), რეზისტორი (დიოდი სურვილისამებრ)';
        }
        if (problemCode === 'DTR.L2.4') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, NPN Q3 (დარლინგტონი), ძრავი, 1 µF კონდენსატორი';
        }
        if (problemCode === 'DTR.L2.5') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, NPN Q3 (დარლინგტონი), ძრავი, 10 µF, მინიმუმ 1 რეზისტორი (მაგ. 510k; 10k ან ცვლადი სურვილისამებრ)';
        }
        if (problemCode === 'DTR.L2.6') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, NPN Q3 (დარლინგტონი), ძრავი, 10 µF, 2×510k (≈1 MΩ ბაზაზე)';
        }
        if (problemCode === 'DTR.L2.11' || problemCode === 'DTR.L2.12') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, NPN Q3 (დარლინგტონი), ნათურა, 100 µF, 2×100k';
        }
        if (problemCode === 'TFB.L1.1') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ცვლადი რეზისტორი, NPN Q3 (დარლინგტონი), ნათურა, 1k';
        }
        if (problemCode === 'TFB.L1.2') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ცვლადი რეზისტორი, NPN, PNP, ნათურა, 2×1k';
        }
        if (problemCode === 'TFB.L2.5') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ცვლადი რეზისტორი, 2×NPN, ნათურა, 2×1k';
        }
        if (problemCode === 'TFB.L3.3') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ცვლადი რეზისტორი, NPN, PNP, ნათურა, 3×1k (რბილი გამტარები სურვილისამებრ)';
        }
        if (problemCode === 'TFB.L3.4') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, 2 ღილაკი, NPN, PNP, ნათურა, 3×1k (ცვლადი რეზისტორი და რბილი გამტარები სურვილისამებრ)';
        }
        if (problemCode === 'TDM.L1.7') {
            return 'განათავსეთ: 2 კვების წყარო, ცვლადი რეზისტორი, NPN, PNP, ძრავი';
        }
        if (problemCode === 'TDM.L2.8') {
            return 'განათავსეთ: 2 კვების წყარო, ცვლადი რეზისტორი, 2×NPN, PNP, ძრავი, 1×1k';
        }
        if (problemCode === 'TDM.L2.3') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, გადამრთველი, 2×NPN, PNP, ძრავი, 2×1k (რბილი გამტარები სურვილისამებრ)';
        }
        if (problemCode === 'TDM.L2.4') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, 2 ღილაკი, 2×NPN, 2×PNP, ძრავი, 2×1k (რბილი გამტარები სურვილისამებრ)';
        }
        if (problemCode === 'TDM.L3.5') {
            return 'განათავსეთ: 2 კვების წყარო, ჩამრთველი, ღილაკი, 2×NPN, 2×PNP, NPN Q3 (დარლინგტონი), ძრავი, 3×1k (რბილი გამტარები სურვილისამებრ)';
        }
        return 'განათავსეთ: კვების წყარო, ღილაკი, ნათურა';
    }
    if (problemCode === 'ST.L1.2') {
        return 'Place: 2 power supplies, button, lamp';
    }
    if (problemCode === 'ST.L1.3') {
        return 'Place: power supply, switch, button, lamp';
    }
    if (problemCode === 'ST.L1.8') {
        return 'Place: power supply, switch, button, red LED, resistor';
    }
    if (problemCode === 'VR.L1.1') {
        return 'Place: 2 power supplies, switch, variable resistor, red LED, resistor';
    }
    if (problemCode === 'PR.L1.1' || problemCode === 'PR.L1.2') {
        return 'Place: 2 power supplies, switch, photoresistor, red LED, resistor';
    }
    if (problemCode === 'PR.L2.3') {
        return 'Place: 2 power supplies, switch, photoresistor, red LED, 2 resistors';
    }
    if (problemCode === 'PR.L2.4') {
        return 'Place: 2 power supplies, switch, slide switch, photoresistor, blue LED, 2 resistors';
    }
    if (problemCode === 'PR.L1.5') {
        return 'Place: 2 power supplies, switch, button, photoresistor, 2 red LEDs, resistor (10k)';
    }
    if (problemCode === 'PR.L2.9') {
        return 'Place: 2 power supplies, switch, photoresistor, 2 red LEDs, 2 different resistors';
    }
    if (problemCode === 'PR.L3.10') {
        return 'Place: 2 power supplies, photoresistor, red and green LED, resistor';
    }
    if (problemCode === 'PR.L3.11') {
        return 'Place: 2 power supplies, photoresistor, red and green LED, resistors';
    }
    if (problemCode === 'PR.L2.12') {
        return 'Place per figure: 2 power supplies, photoresistor, red and green LED, 1k and 5.1k resistors';
    }
    if (problemCode === 'PR.L3.6') {
        return 'Place: 2 power supplies, photoresistor (+ any familiar parts for the measurement)';
    }
    if (problemCode === 'VR.L1.2') {
        return 'Place: 2 power supplies, switch, variable resistor, red LED, 2 resistors';
    }
    if (problemCode === 'VR.L1.3') {
        return 'Place: 2 power supplies, switch, variable resistor, red and green LED, resistor';
    }
    if (problemCode === 'VR.L1.4') {
        return 'Place: 2 power supplies, switch, button, variable resistor, red LED, resistor';
    }
    if (problemCode === 'VR.L1.5') {
        return 'Place: 2 power supplies, switch, button, variable resistor, red LED, resistor';
    }
    if (problemCode === 'VR.L2.6') {
        return 'Place: 2 power supplies, switch, variable resistor, red LED, resistor (short B to C)';
    }
    if (problemCode === 'VR.L2.7') {
        return 'Place: 2 power supplies, switch, variable resistor, red LED, resistor (short B–C; pot || LED)';
    }
    if (problemCode === 'VR.L2.8') {
        return 'Place: 2 power supplies, switch, variable resistor, red LED, 2 resistors (short B–C; series R in shunt)';
    }
    if (problemCode === 'VR.L2.9') {
        return 'Place: 2 power supplies, switch, slide switch, variable resistor, red LED, resistor';
    }
    if (problemCode === 'VR.L1.10') {
        return 'Place: 2 power supplies, switch, variable resistor, lamp (follow the figure)';
    }
    if (problemCode === 'VR.L2.11') {
        return 'Place: 2 power supplies, switch, variable resistor, green and red LED, lamp, 3 resistors';
    }
    if (problemCode === 'VR.L2.12') {
        return 'Place: 2 power supplies, switch, 2 variable resistors, red LED, resistor';
    }
    if (problemCode === 'VR.L2.13') {
        return 'Place: 2 power supplies, switch, 2 variable resistors, red LED, resistor (opposite ends)';
    }
    if (problemCode === 'VR.L2.15') {
        return 'Place: 2 power supplies, switch, 2 variable resistors, 2 red LEDs, resistor';
    }
    if (problemCode === 'VR.L3.19') {
        return 'Place: 2 power supplies, variable resistor, red LED, green LED, resistor';
    }
    if (problemCode === 'VR.L1.20') {
        return 'Place: 2 power supplies, variable resistor, red LED, green LED, 2 equal resistors';
    }
    if (problemCode === 'VR.L3.22') {
        return 'Place: 2 power supplies, switch, variable resistor, red, green and blue LED, resistors (1k×2, 5.1k, 10k)';
    }
    if (problemCode === 'VR.L4.23') {
        return 'Place: 2 power supplies, switch, variable resistor, red, green and blue LED, resistors';
    }
    if (problemCode === 'ST.L2.9') {
        return 'Place: 2 power supplies, switch, button, red and green LED, resistor';
    }
    if (problemCode === 'LR.L1.1') {
        return 'Place: 2 power supplies, switch, button, 2 red LEDs, resistor';
    }
    if (problemCode === 'LR.L1.2') {
        return 'Place: power supply, switch, button, 2 red LEDs, resistor';
    }
    if (problemCode === 'LR.L1.3') {
        return 'Place: power supply, switch, button, 2 red LEDs, 2 resistors';
    }
    if (problemCode === 'LR.L2.4') {
        return 'Place: 2 power supplies, switch, button, lamp, red LED, resistor';
    }
    if (problemCode === 'LR.L2.5') {
        return 'Place: 2 power supplies, switch, 2 buttons, lamp, red LED, resistor';
    }
    if (problemCode === 'LR.L3.6') {
        return 'Place: power supply, button, red LED, resistor';
    }
    if (problemCode === 'LR.L2.7' || problemCode === 'LR.L3.8') {
        return 'Place: 2 power supplies, switch, button, red LED, resistor';
    }
    if (problemCode === 'LR.L3.9') {
        return 'Place: 2 power supplies, switch, 2 buttons, red LED, at least 2 resistors';
    }
    if (problemCode === 'LR.L3.10') {
        return 'Place: 2 power supplies, switch, button, 2 red LEDs, at least 2 resistors';
    }
    if (problemCode === 'LR.L1.11') {
        return 'Place: 2 power supplies, switch, red and green LEDs, resistor';
    }
    if (problemCode === 'LR.L2.12') {
        return 'Place: power supply, switch, red and green LEDs, 2 resistors';
    }
    if (problemCode === 'LR.L2.13') {
        return 'Place: 2 power supplies, switch, button, red LED, 2×1 kΩ resistors';
    }
    if (problemCode === 'LR.L2.14' || problemCode === 'LR.L2.15') {
        return 'Place: 2 power supplies, switch, button, 2 red LEDs, 2×1 kΩ resistors';
    }
    if (problemCode === 'LR.L2.16' || problemCode === 'LR.L2.17') {
        return 'Place: 2 power supplies, 2 buttons, 2 red LEDs, resistor(s)';
    }
    if (problemCode === 'LR.L2.18') {
        return 'Place: 2 power supplies, switch, button, red and green LED, resistor(s)';
    }
    if (problemCode === 'LR.L4.19') {
        return 'Place: power supply, switch, 2 buttons, 2 red LEDs, resistor';
    }
    if (problemCode === 'LR.L4.20') {
        return 'Place: 2 power supplies, 2 buttons, 2 red LEDs, resistor(s)';
    }
    if (problemCode === 'LR.L4.21') {
        return 'Place: 2 power supplies, switch, button, red and green LED, 2 resistors';
    }
    if (problemCode === 'LR.L4.22') {
        return 'Place: power supply, 2 buttons, 2 red and green LED, resistor(s)';
    }
    if (problemCode === 'LR.L4.23') {
        return 'Place: 2 power supplies, 2 buttons, 2 red, 2 green, 2 blue LED, resistor(s)';
    }
    if (problemCode === 'ST.L2.10') {
        return 'Place: power supply, switch, 2 buttons, red LED, resistor';
    }
    if (problemCode === 'ST.L2.11') {
        return 'Place: power supply, switch, 2 buttons, red LED, resistor';
    }
    if (problemCode === 'ST.L2.12') {
        return 'Place: 2 power supplies, switch, 2 buttons, green and blue LED, resistor';
    }
    if (problemCode === 'ST.L2.13') {
        return 'Place: power supply, switch, 2 buttons, red and blue LED, 2 resistors';
    }
    if (problemCode === 'ST.L2.14') {
        return 'Place: 2 power supplies, switch, 2 buttons, 2 green and 2 blue LEDs, 2 resistors';
    }
    if (problemCode === 'CP.L1.1') {
        return 'Place: 2 power supplies, button, red LED, capacitor, resistor';
    }
    if (problemCode === 'CP.L1.2') {
        return 'Place: 2 power supplies, button, red LED, capacitor, 2 resistors';
    }
    if (problemCode === 'CP.L2.3') {
        return 'Place: 2 power supplies, slide switch, red and green LEDs, 2 capacitors, resistors';
    }
    if (problemCode === 'CP.L2.4') {
        return 'Place: 2 power supplies, button, red LED, capacitor, 2 resistors';
    }
    if (problemCode === 'CP.L2.5') {
        return 'Place: 2 power supplies, switch, slide switch, red and green LEDs, capacitor, 2 resistors';
    }
    if (problemCode === 'CP.L2.6') {
        return 'Place: 2 power supplies, switch, slide switch, anti-parallel red/green LEDs, capacitor, 1 kΩ resistor';
    }
    if (problemCode === 'CP.L2.7') {
        return 'Place: 2 power supplies, switch, slide switch, anti-parallel LEDs, parallel capacitor, 2×1 kΩ';
    }
    if (problemCode === 'CP.L2.8') {
        return 'Place: 2 power supplies, slide switch, motor, capacitor';
    }
    if (problemCode === 'CP.L2.9') {
        return 'Place: 2 series power supplies (12 V), 2 slide switches, motor, capacitor';
    }
    if (problemCode === 'CP.L2.12') {
        return 'Place: 2 power supplies, switch, slide switch, anti-parallel LEDs, 2×470 µF series, 1 kΩ';
    }
    if (problemCode === 'CP.L2.13') {
        return 'Place: 2 power supplies, button, red/green/blue LEDs, capacitor, resistors';
    }
    if (problemCode === 'CP.L2.14') {
        return 'Place: 2 power supplies, switch, button, red LED, capacitor, resistors';
    }
    if (problemCode === 'CP.L2.15') {
        return 'Place: 2 power supplies, button, red and green LED, 2 capacitors (smaller C on green), resistors';
    }
    if (problemCode === 'CP.L2.16') {
        return 'Place: 2 series power supplies, slide switch, red LED, capacitor, 2 resistors';
    }
    if (problemCode === 'CP.L4.19') {
        return 'Place: 2×3 V supplies, 2 slide switches, 2 green + 2 blue LEDs (series), capacitor';
    }
    if (problemCode === 'SW.L1.1') {
        return 'Place: 2 power supplies, slide switch, 2 red LEDs, resistor(s)';
    }
    if (problemCode === 'SW.L1.2') {
        return 'Place: 2 power supplies, slide switch, red LED, 2 different resistors (e.g. 5.1k and 1k)';
    }
    if (problemCode === 'SW.L1.13') {
        return 'Place: 2 power supplies, slide switch, lamp, red LED, 1 resistor (e.g. 1 kΩ)';
    }
    if (problemCode === 'SW.L4.14') {
        return 'Place: 2 power supplies, slide switch, lamp, red LED, 2 resistors (e.g. 1 kΩ)';
    }
    if (problemCode === 'SW.L2.3') {
        return 'Place: 2 power supplies, slide switch, red LED, only 1 resistor';
    }
    if (problemCode === 'SW.L2.4') {
        return 'Place: 2 power supplies, slide switch, lamp';
    }
    if (problemCode === 'SW.L2.5') {
        return 'Place: 2 power supplies, slide switch, lamp, 1 resistor (e.g. 20 Ω)';
    }
    if (problemCode === 'SW.L2.9') {
        return 'Place: 2 power supplies, switch, button, slide switch, red LED, 3 resistors (5.1k always-on; 1k and 10k for button boost)';
    }
    if (problemCode === 'SW.L2.10') {
        return 'Place: 2 power supplies, switch, button, slide switch, green and blue LED, 2 resistors (series; button bypasses one)';
    }
    if (problemCode === 'SW.L3.11') {
        return 'Place: 2 power supplies, button, slide switch, red/green/blue LEDs, 1 resistor (e.g. 1 kΩ)';
    }
    if (problemCode === 'SW.L3.6') {
        return 'Place: 2 power supplies, 2 slide switches, lamp';
    }
    if (problemCode === 'SW.L3.7') {
        return 'Place: 2 power supplies, 2 slide switches, red and green LED, resistor';
    }
    if (problemCode === 'SW.L3.8') {
        return 'Place: 2 power supplies, 2 slide switches, 2 green LEDs, resistors (voltage divider)';
    }
    if (problemCode === 'DM.L1.1') {
        return 'Place: power supply, switch, button, motor';
    }
    if (problemCode === 'DM.L2.2') {
        return 'Place: 2 power supplies, slide switch, motor';
    }
    if (problemCode === 'DM.L2.3') {
        return 'Place: 2 power supplies, slide switch, motor, resistor or lamp';
    }
    if (problemCode === 'DM.L2.5') {
        return 'Place: 2 power supplies, switch, button, motor, resistor or lamp';
    }
    if (problemCode === 'DM.L2.6') {
        return 'Place: 2 power supplies, slide switch, motor';
    }
    if (problemCode === 'DM.L2.7') {
        return 'Place: 2 power supplies, slide switch, motor, 2 resistors (low R, e.g. 20 Ω)';
    }
    if (problemCode === 'DM.L2.8') {
        return 'Place: 2 power supplies, 2 slide switches, motor';
    }
    if (problemCode === 'DM.L3.9') {
        return 'Place: 2 power supplies, slide switch, motor, red and green LED, resistor (e.g. 1 kΩ)';
    }
    if (problemCode === 'DM.L2.10') {
        return 'Place: 2 power supplies, switch, motor, red LED, resistor (1 kΩ) and 20 Ω or lamp';
    }
    if (problemCode === 'DM.L3.11') {
        return 'Place: 2 power supplies, switch, motor, red and green LED, 3 resistors (e.g. 100 Ω + 2×1 kΩ)';
    }
    if (problemCode === 'DM.L2.13') {
        return 'Place: 2 power supplies, switch, 2 slide switches, motor, lamp';
    }
    if (problemCode === 'DM.L3.14') {
        return 'Place: 2 power supplies, motor (plus familiar parts — switch, buttons, LEDs…)';
    }
    if (problemCode === 'DM.L4.4') {
        return 'Place: 2 power supplies, motor (plus measurement parts as needed)';
    }
    if (problemCode === 'DI.L1.1') {
        return 'Place: 2 power supplies, button, diode, lamp';
    }
    if (problemCode === 'DI.L2.2') {
        return 'Place: 2 power supplies, switch, button, 2 diodes, lamp';
    }
    if (problemCode === 'DI.L1.4') {
        return 'Place: 2 power supplies, switch, button, 2 diodes, 2 red LEDs, 1 resistor';
    }
    if (problemCode === 'DI.L3.5') {
        return 'Place: 2 power supplies, button, diode, motor (plus familiar parts as needed)';
    }
    if (problemCode === 'DI.L3.6') {
        return 'Place: 2 power supplies, variable resistor, diode, 2 red LEDs, capacitor, 2 resistors';
    }
    if (problemCode === 'DI.L3.7') {
        return 'Place: 2 power supplies, motor, diodes, 2 soft wires (red/black), low-value resistors';
    }
    if (problemCode === 'DI.L4.8') {
        return 'Place: 2 power supplies, 2 diodes, 1 green and 2 red LEDs, 1 resistor, 2 soft wires';
    }
    if (problemCode === 'TR.L2.10' || problemCode === 'TR.L2.11') {
        return 'Place: 2 power supplies, switch, variable resistor, NPN Q1, motor, resistor';
    }
    if (problemCode === 'TR.L2.12' || problemCode === 'TR.L2.13') {
        return 'Place: 2 power supplies, switch, button, NPN Q1, lamp, 2 resistors (≥1k)';
    }
    if (problemCode === 'TR.L2.14') {
        return 'Place: 2 power supplies, switch, NPN Q1, lamp, motor, resistor';
    }
    if (problemCode === 'TR.L2.16') {
        return 'Place: 2 power supplies, switch, variable resistor, 2 NPN, lamp, motor, resistors';
    }
    if (problemCode === 'TR.L2.17') {
        return 'Place: 2 power supplies, switch, 2 buttons, 2 NPN, lamp, 1k resistors';
    }
    if (problemCode === 'TCP.L1.1' || problemCode === 'TCP.L1.2') {
        return 'Place: 2 power supplies, switch, button, NPN Q1, red LED, capacitor, resistors';
    }
    if (problemCode === 'TCP.L1.3' || problemCode === 'TCP.L1.4') {
        return 'Place: 2 power supplies, switch, button, NPN Q1, lamp, 2×470µF capacitors, resistors';
    }
    if (problemCode === 'TCP.L3.5') {
        return 'Place: 2 power supplies, switch, button, NPN Q1, lamp, series base capacitor, resistor (diode optional)';
    }
    if (problemCode === 'DTR.L2.4') {
        return 'Place: 2 power supplies, switch, button, NPN Q3 (Darlington), motor, 1 µF capacitor';
    }
    if (problemCode === 'DTR.L2.5') {
        return 'Place: 2 power supplies, switch, button, NPN Q3 (Darlington), motor, 10 µF, at least 1 resistor (e.g. 510k; 10k or pot optional)';
    }
    if (problemCode === 'DTR.L2.6') {
        return 'Place: 2 power supplies, switch, button, NPN Q3 (Darlington), motor, 10 µF, 2×510k (≈1 MΩ to base)';
    }
    if (problemCode === 'DTR.L2.11' || problemCode === 'DTR.L2.12') {
        return 'Place: 2 power supplies, switch, button, NPN Q3 (Darlington), lamp, 100 µF, 2×100k';
    }
    if (problemCode === 'TFB.L1.1') {
        return 'Place: 2 power supplies, switch, variable resistor, NPN Q3 (Darlington), lamp, 1k';
    }
    if (problemCode === 'TFB.L1.2') {
        return 'Place: 2 power supplies, switch, variable resistor, NPN, PNP, lamp, 2×1k';
    }
    if (problemCode === 'TFB.L2.5') {
        return 'Place: 2 power supplies, switch, variable resistor, 2×NPN, lamp, 2×1k';
    }
    if (problemCode === 'TFB.L3.3') {
        return 'Place: 2 power supplies, switch, variable resistor, NPN, PNP, lamp, 3×1k (soft wires optional)';
    }
    if (problemCode === 'TFB.L3.4') {
        return 'Place: 2 power supplies, switch, 2 buttons, NPN, PNP, lamp, 3×1k (variable resistor and soft wires optional)';
    }
    if (problemCode === 'TDM.L1.7') {
        return 'Place: 2 power supplies, variable resistor, NPN, PNP, motor';
    }
    if (problemCode === 'TDM.L2.8') {
        return 'Place: 2 power supplies, variable resistor, 2×NPN, PNP, motor, 1×1k';
    }
    if (problemCode === 'TDM.L2.3') {
        return 'Place: 2 power supplies, switch, slide switch, 2×NPN, PNP, motor, 2×1k (soft wires optional)';
    }
    if (problemCode === 'TDM.L2.4') {
        return 'Place: 2 power supplies, switch, 2 buttons, 2×NPN, 2×PNP, motor, 2×1k (soft wires optional)';
    }
    if (problemCode === 'TDM.L3.5') {
        return 'Place: 2 power supplies, switch, button, 2×NPN, 2×PNP, NPN Q3 (Darlington), motor, 3×1k (soft wires optional)';
    }
    return 'Place: power supply, button, lamp';
}

export default function CircuitWorkbench({ problemCode }) {
    const { lang } = useLang();
    const { user } = useAuth();
    const userId = user?.id ?? null;
    const palette = getPaletteForProblem(problemCode);
    const initialDraftRef = useRef(null);
    if (initialDraftRef.current === null) {
        initialDraftRef.current =
            loadCircuitDraft(userId, problemCode) ?? {
                placed: [],
                potPositions: {},
                switchStates: {},
            };
        initialDraftRef.current.placed = (
            initialDraftRef.current.placed ?? []
        ).filter((part) => !isPhotoAccessoryType(part.type));
    }
    const initialDraft = initialDraftRef.current;
    const gridRef = useRef(null);
    const heldButtonIdRef = useRef(null);
    const switchStatesRef = useRef({ ...initialDraft.switchStates });
    const potPositionsRef = useRef({ ...initialDraft.potPositions });
    const potSimTimerRef = useRef(null);
    const boardSimTimerRef = useRef(null);
    const accessorySimTimerRef = useRef(null);
    const accessoryDragAnchorRef = useRef(null);
    const accessoryLastLightRef = useRef(null);
    const accessoryLastSimAtRef = useRef(0);
    const photoAccessoryDragRef = useRef(null);
    const simRequestIdRef = useRef(0);
    const runLiveSimulationRef = useRef(async () => {});
    const placedRef = useRef([]);
    const pendingClickInteractRef = useRef(null);
    const lastButtonClickAtRef = useRef({});
    const lockedButtonIdsRef = useRef(new Set());
    const interactFnsRef = useRef({
        pressMomentary: async () => {},
        releaseMomentary: async () => {},
        unlockMomentary: async () => {},
        clickInteract: async () => {},
        runLiveSim: async () => {},
    });
    const scheduleAccessoryDragSimulationRef = useRef(() => {});
    /** DI.L3.6: last pot position that kicked off a live sim (for prior-IC discharge steps). */
    const di36LastSimPotRef = useRef({});
    const moveSessionRef = useRef(null);
    const palettePointerSessionRef = useRef(null);
    const boardHostRef = useRef(null);

    const [placed, setPlaced] = useState(() => initialDraft.placed);
    placedRef.current = placed;
    const [paletteRotations, setPaletteRotations] = useState({});
    const [connectorLength, setConnectorLength] = useState(3);
    const [wireColor, setWireColor] = useState('red');
    const [wireToolArmed, setWireToolArmed] = useState(false);
    const [wireDraft, setWireDraft] = useState(null);
    const [resistorKey, setResistorKey] = useState('100o');
    const [capacitorKey, setCapacitorKey] = useState('10uf');
    const [ledColor, setLedColor] = useState('red');
    const [transistorKey, setTransistorKey] = useState('q1');
    const [message, setMessage] = useState('');
    const messageRef = useRef(null);
    const [simulating, setSimulating] = useState(false);
    /** Live simulation is always on — interact anytime; drag still moves parts. */
    const liveSimMode = true;
    const [switchStates, setSwitchStates] = useState(
        () => initialDraft.switchStates
    );
    const [, setLockedButtonsVersion] = useState(0);
    const [potPositions, setPotPositions] = useState(
        () => initialDraft.potPositions
    );
    const [simResults, setSimResults] = useState(null);
    /** Bumps after mount so restored parts can measure the grid (ref is null on first paint). */
    const [boardLayoutTick, setBoardLayoutTick] = useState(0);
    const [tranFrameIndex, setTranFrameIndex] = useState(0);
    /** Sync frame for LED sampling — avoids one-frame flash of the prior last index on new .tran. */
    const tranFrameRef = useRef(0);
    const setTranFrame = useCallback((frameOrUpdater) => {
        const next =
            typeof frameOrUpdater === 'function'
                ? frameOrUpdater(tranFrameRef.current)
                : frameOrUpdater;
        const frame = Math.max(0, next);
        tranFrameRef.current = frame;
        setTranFrameIndex(frame);
    }, []);
    const tranAnimRef = useRef(null);
    /** Max LED forward current reference for brightness scaling during tran animation. */
    const pressedLedCurrentMaxRef = useRef(null);
    /** CP.L2.14: dim baseline current with master ON / button open. */
    const baselineLedCurrentRef = useRef(null);
    /** PR.*: ambient LED current (no torch) for relative brightness. */
    const photoLedBaselineRef = useRef(null);
    const [ledTranAnimPhase, setLedTranAnimPhase] = useState(null);
    const idleSimResultsRef = useRef(null);
    /** Motor fan: deg/sec by component id + accumulated angle. */
    const motorSpeedsRef = useRef({});
    const motorAnglesRef = useRef({});
    const [, setMotorSpinTick] = useState(0);

    useEffect(() => {
        switchStatesRef.current = switchStates;
    }, [switchStates]);

    useEffect(() => {
        potPositionsRef.current = potPositions;
    }, [potPositions]);

    // After the board DOM mounts, re-render so restored (or any) parts get layout.
    useLayoutEffect(() => {
        setBoardLayoutTick((n) => n + 1);
    }, []);

    // Persist board layout so returning to this challenge restores the build.
    useEffect(() => {
        saveCircuitDraft(userId, problemCode, {
            placed: placed.filter((part) => !isPhotoAccessoryType(part.type)),
            potPositions,
            switchStates,
        });
    }, [placed, potPositions, switchStates, problemCode, userId]);

    const liveSimModeRef = useRef(true);
    useEffect(() => {
        liveSimModeRef.current = liveSimMode;
    }, [liveSimMode]);

    useEffect(() => {
        return () => {
            if (potSimTimerRef.current) {
                clearTimeout(potSimTimerRef.current);
            }
            if (boardSimTimerRef.current) {
                clearTimeout(boardSimTimerRef.current);
            }
            if (accessorySimTimerRef.current) {
                clearTimeout(accessorySimTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!liveSimMode) {
            motorSpeedsRef.current = {};
            return undefined;
        }
        let raf = 0;
        let last = performance.now();
        const tick = (now) => {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            let moving = false;
            for (const [id, spd] of Object.entries(motorSpeedsRef.current)) {
                if (!spd) continue;
                moving = true;
                motorAnglesRef.current[id] =
                    (motorAnglesRef.current[id] ?? 0) + spd * dt;
            }
            if (moving) {
                setMotorSpinTick((n) => n + 1);
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [liveSimMode]);

    useEffect(() => {
        if (
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
            problemCode === 'DI.L3.6'
        ) {
            setCapacitorKey('470uf');
        } else if (problemCode === 'TCP.L1.1' || problemCode === 'TCP.L1.2') {
            setCapacitorKey('100uf');
        } else if (problemCode === 'TCP.L1.3' || problemCode === 'TCP.L1.4') {
            setCapacitorKey('470uf');
        } else if (problemCode === 'TCP.L3.5') {
            setCapacitorKey('100uf');
        } else if (problemCode === 'DTR.L2.4') {
            setCapacitorKey('1uf');
        } else if (problemCode === 'DTR.L2.5' || problemCode === 'DTR.L2.6') {
            setCapacitorKey('10uf');
        } else if (problemCode === 'DTR.L2.11' || problemCode === 'DTR.L2.12') {
            setCapacitorKey('100uf');
        } else {
            setCapacitorKey('10uf');
        }
        if (problemCode === 'CP.L2.5') {
            setResistorKey('5ko1');
        } else if (problemCode === 'TCP.L1.1' || problemCode === 'TCP.L1.2') {
            setResistorKey('100ko');
        } else if (problemCode === 'TCP.L1.3') {
            setResistorKey('1ko');
        } else if (problemCode === 'TCP.L1.4') {
            setResistorKey('5ko1');
        } else if (problemCode === 'TCP.L3.5') {
            setResistorKey('1ko');
        } else if (problemCode === 'DTR.L2.11' || problemCode === 'DTR.L2.12') {
            setResistorKey('100ko');
        } else if (
            problemCode === 'TFB.L1.1' ||
            problemCode === 'TFB.L1.2' ||
            problemCode === 'TFB.L2.5' ||
            problemCode === 'TFB.L3.3' ||
            problemCode === 'TFB.L3.4'
        ) {
            setResistorKey('1ko');
        } else if (
            problemCode === 'VR.L1.1' ||
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
            problemCode === 'DI.L3.6' ||
            problemCode === 'TR.L2.9' ||
            problemCode === 'TR.L2.10' ||
            problemCode === 'TR.L2.11' ||
            problemCode === 'TR.L2.13'
        ) {
            setResistorKey('1ko');
        } else if (problemCode === 'TR.L2.12') {
            setResistorKey('5ko1');
        } else if (
            problemCode === 'TR.L2.14' ||
            problemCode === 'TR.L2.16'
        ) {
            setResistorKey('100o');
        } else if (problemCode === 'TR.L2.17') {
            setResistorKey('1ko');
        } else if (
            problemCode === 'CP.L2.6' ||
            problemCode === 'CP.L2.7' ||
            problemCode === 'CP.L2.12' ||
            problemCode === 'CP.L2.13' ||
            problemCode === 'CP.L2.14' ||
            problemCode === 'CP.L2.15' ||
            problemCode === 'CP.L2.16' ||
            problemCode === 'CP.L4.19' ||
            problemCode === 'LR.L2.13' ||
            problemCode === 'LR.L2.14' ||
            problemCode === 'LR.L2.15' ||
            problemCode === 'SW.L1.1' ||
            problemCode === 'SW.L1.2' ||
            problemCode === 'SW.L1.13' ||
            problemCode === 'SW.L4.14' ||
            problemCode === 'SW.L2.3' ||
            problemCode === 'SW.L2.5' ||
            problemCode === 'SW.L2.9' ||
            problemCode === 'SW.L2.10' ||
            problemCode === 'SW.L3.7' ||
            problemCode === 'SW.L3.8' ||
            problemCode === 'SW.L3.11'
        ) {
            setResistorKey(
                problemCode === 'SW.L2.5'
                    ? '20o'
                    : problemCode === 'SW.L3.11' ||
                        problemCode === 'SW.L1.13' ||
                        problemCode === 'SW.L4.14' ||
                        problemCode === 'LR.L2.13' ||
                        problemCode === 'LR.L2.14' ||
                        problemCode === 'LR.L2.15' ||
                        problemCode === 'CP.L2.6' ||
                        problemCode === 'CP.L2.7' ||
                        problemCode === 'CP.L2.12'
                      ? '1ko'
                      : '5ko1'
            );
        } else {
            setResistorKey('100o');
        }
    }, [problemCode]);

    const commitSwitchStates = useCallback((nextStates) => {
        switchStatesRef.current = nextStates;
        setSwitchStates(nextStates);
    }, []);

    const commitPotPosition = useCallback((id, position) => {
        const clamped = clampPotPosition(position);
        const next = {
            ...potPositionsRef.current,
            [id]: clamped,
        };
        potPositionsRef.current = next;
        setPotPositions(next);
    }, []);

    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [activeDrag, setActiveDrag] = useState(null);
    const [hoverPin, setHoverPin] = useState(null);
    const [accessoryDragPoint, setAccessoryDragPoint] = useState(null);

    const connectorGroup = getConnectorGroupItem(palette);
    const wireGroup = getWireGroupItem(palette);
    const resistorGroup = getResistorGroupItem(palette);
    const capacitorGroup = getCapacitorGroupItem(palette);
    const ledGroup = getLedGroupItem(palette);
    const transistorGroup = getTransistorGroupItem(palette);
    const standardPalette = getStandardPaletteItems(palette);

    const getPaletteRotation = (type) => paletteRotations[type] ?? 0;

    const cyclePaletteRotation = (type, e) => {
        e.preventDefault();
        e.stopPropagation();
        setPaletteRotations((prev) => ({
            ...prev,
            [type]: normalizeRotation((prev[type] ?? 0) + 90),
        }));
    };

    const getLabel = useCallback(
        (type) => {
            const def = palette?.find((p) => p.type === type);
            if (def) {
                return lang === 'ka' ? def.labelKa : def.labelEn;
            }
            const len = parseConnectorLength(type);
            if (len !== null) {
                return lang === 'ka' ? `გამტარი ${len}` : `Connector ${len}`;
            }
            const spec = getResistorSpec(type);
            if (spec) {
                return lang === 'ka' ? spec.labelKa : spec.labelEn;
            }
            const led = getLedSpec(type);
            if (led) {
                return lang === 'ka' ? led.labelKa : led.labelEn;
            }
            const cap = getCapacitorSpec(type);
            if (cap) {
                return lang === 'ka' ? cap.labelKa : cap.labelEn;
            }
            const tr = getTransistorSpec(type);
            if (tr) {
                return lang === 'ka' ? tr.labelKa : tr.labelEn;
            }
            return type;
        },
        [palette, lang]
    );

    const remaining = (type) => {
        if (isPhotoAccessoryType(type)) {
            const def = palette?.find((p) => p.type === type);
            return def?.maxCount ?? 1;
        }
        const connectorLen = parseConnectorLength(type);
        if (connectorLen !== null) {
            const max = getConnectorMaxCount(palette, connectorLen);
            return max - countPlacedByType(placed, type);
        }
        const rKey = parseResistorKey(type);
        if (rKey !== null) {
            const max = getResistorMaxCount(palette, rKey);
            const used = usesResistorTotalCap(palette)
                ? placed.filter((p) => isResistorType(p.type)).length
                : countPlacedByType(placed, type);
            return max - used;
        }
        const ledKey = parseLedKey(type);
        if (ledKey !== null) {
            const max = getLedMaxCountForType(palette, type);
            return max - countPlacedByType(placed, type);
        }
        const cKey = parseCapacitorKey(type);
        if (cKey !== null) {
            const max = getCapacitorMaxCount(palette);
            return max - countPlacedByType(placed, type);
        }
        const tKey = parseTransistorKey(type);
        if (tKey !== null) {
            const max = getTransistorMaxCount(palette, type);
            return max - countPlacedByType(placed, type);
        }
        if (isWireType(type)) {
            return getWireMaxCount(palette) - countPlacedByType(placed, type);
        }
        const def = palette?.find((p) => p.type === type);
        if (!def) return 0;
        return def.maxCount - countPlacedByType(placed, type);
    };

    const activeConnectorType = connectorType(connectorLength);
    const activeResistorType = resistorType(resistorKey);
    const activeCapacitorType = capacitorType(capacitorKey);
    const activeLedType = ledType(ledColor);
    const activeTransistorType = transistorType(transistorKey);

    const cancelWireDraft = useCallback(() => {
        setWireDraft(null);
    }, []);

    const disarmWireTool = useCallback(() => {
        setWireToolArmed(false);
        setWireDraft(null);
    }, []);

    const tryPlaceWire = useCallback(
        (from, to, colorKey = wireColor) => {
            if (!from || !to) return false;
            if (from.row === to.row && from.col === to.col) {
                setMessage(
                    lang === 'ka'
                        ? 'აირჩიეთ სხვა პინი მავთულის მეორე ბოლოსთვის'
                        : 'Pick a different pin for the other end'
                );
                return false;
            }
            const max = getWireMaxCount(palette);
            if (countPlacedByType(placed, COMPONENT_TYPES.WIRE) >= max) {
                setMessage(
                    lang === 'ka'
                        ? 'მავთულების ლიმიტი ამოწურულია'
                        : 'No more wires allowed'
                );
                return false;
            }
            if (
                !canPlaceAt(COMPONENT_TYPES.WIRE, from.row, from.col, placed, null, 0, {
                    endRow: to.row,
                    endCol: to.col,
                })
            ) {
                setMessage(
                    lang === 'ka'
                        ? 'აქ მავთულის განთავსება არ ხერხდება'
                        : 'Cannot place wire here'
                );
                return false;
            }

            const id = createComponentId(COMPONENT_TYPES.WIRE);
            setPlaced((prev) => [
                ...prev,
                {
                    id,
                    type: COMPONENT_TYPES.WIRE,
                    row: from.row,
                    col: from.col,
                    endRow: to.row,
                    endCol: to.col,
                    color: colorKey,
                    rotation: 0,
                },
            ]);
            setMessage('');
            return true;
        },
        [lang, palette, placed, wireColor]
    );

    useEffect(() => {
        if (!wireToolArmed && !wireDraft) return undefined;
        const onKey = (ev) => {
            if (ev.key !== 'Escape') return;
            if (wireDraft) {
                cancelWireDraft();
                setMessage(
                    lang === 'ka'
                        ? 'მავთულის დახატვა გაუქმდა'
                        : 'Wire draft cancelled'
                );
            } else {
                disarmWireTool();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [wireToolArmed, wireDraft, cancelWireDraft, disarmWireTool, lang]);

    const tryPlace = (type, row, col, rotation, ignoreId = null) => {
        if (isPhotoAccessoryType(type)) {
            return false;
        }
        const connectorLen = parseConnectorLength(type);
        const used = countPlacedByType(placed, type);

        if (connectorLen !== null) {
            const max = getConnectorMaxCount(palette, connectorLen);
            if (used >= max && !ignoreId) {
                setMessage(
                    lang === 'ka'
                        ? 'ამ ზომის გამტრის ლიმიტი ამოწურულია'
                        : 'No more connectors of this length'
                );
                return false;
            }
        } else if (parseResistorKey(type) !== null) {
            const max = getResistorMaxCount(palette, parseResistorKey(type));
            const resistorUsed = usesResistorTotalCap(palette)
                ? placed.filter((p) => isResistorType(p.type)).length
                : used;
            if (resistorUsed >= max && !ignoreId) {
                setMessage(
                    lang === 'ka'
                        ? usesResistorTotalCap(palette)
                            ? 'რეზისტორის ლიმიტი ამოწურულია'
                            : 'ამ მნიშვნელობის რეზისტორის ლიმიტი ამოწურულია'
                        : usesResistorTotalCap(palette)
                          ? 'No more resistors allowed'
                          : 'No more resistors of this value'
                );
                return false;
            }
        } else if (parseLedKey(type) !== null) {
            const max = getLedMaxCountForType(palette, type);
            if (used >= max && !ignoreId) {
                setMessage(
                    lang === 'ka'
                        ? 'ამ ფერის LED-ის ლიმიტი ამოწურულია'
                        : 'No more LEDs of this color'
                );
                return false;
            }
        } else if (parseCapacitorKey(type) !== null) {
            const max = getCapacitorMaxCount(palette);
            if (used >= max && !ignoreId) {
                setMessage(
                    lang === 'ka'
                        ? 'ამ მნიშვნელობის კონდენსატორის ლიმიტი ამოწურულია'
                        : 'No more capacitors of this value'
                );
                return false;
            }
        } else if (parseTransistorKey(type) !== null) {
            const max = getTransistorMaxCount(palette, type);
            if (used >= max && !ignoreId) {
                setMessage(
                    lang === 'ka'
                        ? 'ამ ტრანზისტორის ლიმიტი ამოწურულია'
                        : 'No more of this transistor'
                );
                return false;
            }
        } else {
            const def = palette?.find((p) => p.type === type);
            if (def && used >= def.maxCount && !ignoreId) {
                setMessage(
                    lang === 'ka'
                        ? 'ამ დეტალის ლიმიტი ამოწურულია'
                        : 'No more of this component allowed'
                );
                return false;
            }
        }

        if (!canPlaceAt(type, row, col, placed, ignoreId, rotation)) {
            setMessage(
                lang === 'ka' ? 'აქ განთავსება არ ხერხდება' : 'Cannot place here'
            );
            return false;
        }

        setMessage('');
        return true;
    };

    const commitPlacedMove = (id, type, rotation, rawPin, grabDr = 0, grabDc = 0) => {
        const anchoredPin = {
            row: rawPin.row - grabDr,
            col: rawPin.col - grabDc,
        };
        const anchor = alignPlacementAnchor(
            type,
            anchoredPin.row,
            anchoredPin.col,
            rotation
        );
        if (!anchor) return;

        const { row, col } = anchor;
        const existing = placed.find((p) => p.id === id);
        if (!existing) return;

        const unchanged =
            existing.row === row &&
            existing.col === col &&
            (existing.rotation ?? 0) === rotation;

        if (unchanged) return;

        if (!tryPlace(type, row, col, rotation, id)) return;

        setPlaced((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, row, col, rotation } : p
            )
        );
    };

    /** Rotate an already-placed component 90° around its footprint center. */
    const rotatePlaced = (comp) => {
        if (!comp) return;
        const curRot = comp.rotation ?? 0;
        const nextRotation = normalizeRotation(curRot + 90);
        const { w: w0, h: h0 } = getRotatedFootprint(comp.type, curRot);
        const { w: w1, h: h1 } = getRotatedFootprint(comp.type, nextRotation);

        // Pin the geometric center so the part doesn't jump from a top-left pivot.
        const centerR = comp.row + (h0 - 1) / 2;
        const centerC = comp.col + (w0 - 1) / 2;
        const row = Math.round(centerR - (h1 - 1) / 2);
        const col = Math.round(centerC - (w1 - 1) / 2);

        if (!tryPlace(comp.type, row, col, nextRotation, comp.id)) return;

        setPlaced((prev) =>
            prev.map((p) =>
                p.id === comp.id
                    ? { ...p, row, col, rotation: nextRotation }
                    : p
            )
        );
    };

    /** Clear stuck pointer-drag without setState (safe during HTML5 dragstart). */
    const clearMoveSessionRef = () => {
        const session = moveSessionRef.current;
        if (!session) return;
        const host = boardHostRef.current;
        if (host && session.pointerId != null) {
            try {
                host.releasePointerCapture(session.pointerId);
            } catch {
                /* already released */
            }
        }
        moveSessionRef.current = null;
    };

    const endMoveSession = () => {
        clearMoveSessionRef();
        setActiveDrag(null);
        setHoverPin(null);
    };

    /**
     * Board-level pointer drag — only the topmost part under the cursor moves.
     * (Per-part handlers caused stacked connectors to drag together.)
     */
    const beginMoveSession = (comp, clientX, clientY, pointerId) => {
        const rotation = comp.rotation ?? 0;
        const rawPin = pointerToPin(clientX, clientY, gridRef.current);
        const grabDr = rawPin ? rawPin.row - comp.row : 0;
        const grabDc = rawPin ? rawPin.col - comp.col : 0;

        moveSessionRef.current = {
            id: comp.id,
            type: comp.type,
            rotation,
            startX: clientX,
            startY: clientY,
            dragging: false,
            grabDr,
            grabDc,
            pointerId,
        };

        boardHostRef.current?.setPointerCapture(pointerId);
    };

    const handleBoardPointerDownCapture = (e) => {
        if (e.button !== 0) return;

        // On-part pot slider — never start a board drag from the control.
        if (e.target.closest?.('[data-pot-slider]')) {
            return;
        }

        // Rotate handle — let its own click rotate; don't drag/toggle/lock.
        if (e.target.closest?.('[data-rotate-handle]')) {
            return;
        }

        if (wireToolArmed) {
            e.preventDefault();
            e.stopPropagation();
            const pin = pointerToPin(e.clientX, e.clientY, gridRef.current);
            if (!pin) return;

            if (!wireDraft?.from) {
                const stage = getBoardStage(gridRef.current);
                const pointer = clientToStagePercent(
                    e.clientX,
                    e.clientY,
                    stage
                );
                setWireDraft({ from: pin, pointer, hoverPin: pin });
                setMessage(
                    lang === 'ka'
                        ? 'აირჩიეთ მეორე პინი მავთულისთვის'
                        : 'Click the second pin to finish the wire'
                );
                return;
            }

            if (tryPlaceWire(wireDraft.from, pin)) {
                setWireDraft(null);
                setMessage(
                    lang === 'ka'
                        ? 'მავთული დაემატა — დააჭირეთ შემდეგ პინს ან Esc'
                        : 'Wire placed — click another pin or press Esc'
                );
            }
            return;
        }

        const partId = findPlacedPartIdAt(e.clientX, e.clientY);
        if (!partId) return;

        const comp = placed.find((p) => p.id === partId);
        if (!comp) return;

        // Free wires: delete via right-click only (no drag-move yet).
        if (isWireType(comp.type)) {
            return;
        }

        // Always allow drag (including switches/buttons). Clicks without a drag
        // still toggle / press via the move-session finish path.
        e.preventDefault();
        e.stopPropagation();
        beginMoveSession(comp, e.clientX, e.clientY, e.pointerId);

        if (!isInteractivePart(comp.type, problemCode)) return;
        if (isVarResistorType(comp.type)) return;

        if (
            isToggleInteractive(comp.type) ||
            (supportsMotorStallToggle(problemCode) &&
                comp.type === COMPONENT_TYPES.MOTOR)
        ) {
            pendingClickInteractRef.current = comp.id;
            return;
        }

        if (isMomentaryInteractive(comp.type)) {
            if (lockedButtonIdsRef.current.has(comp.id)) {
                pendingClickInteractRef.current = `unlock:${comp.id}`;
                return;
            }
            // Fire-and-forget press; release on drag-start or pointer-up.
            void interactFnsRef.current.pressMomentary(comp);
        }
    };

    const handleBoardPointerMove = (e) => {
        if (wireDraft?.from) {
            const stage = getBoardStage(gridRef.current);
            const pointer = clientToStagePercent(e.clientX, e.clientY, stage);
            const hover = pointerToPin(e.clientX, e.clientY, gridRef.current);
            setWireDraft((prev) =>
                prev ? { ...prev, pointer, hoverPin: hover } : null
            );
        }

        const session = moveSessionRef.current;
        if (!session) return;

        const dx = e.clientX - session.startX;
        const dy = e.clientY - session.startY;
        if (
            !session.dragging &&
            dx * dx + dy * dy < MOVE_DRAG_THRESHOLD_PX * MOVE_DRAG_THRESHOLD_PX
        ) {
            return;
        }

        if (!session.dragging) {
            session.dragging = true;
            pendingClickInteractRef.current = null;
            // Cancel a held momentary button if the user started dragging it.
            if (heldButtonIdRef.current) {
                const buttonId = heldButtonIdRef.current;
                const buttonComp = placed.find((p) => p.id === buttonId);
                if (buttonComp) {
                    void interactFnsRef.current.releaseMomentary(buttonComp, {
                        allowLock: false,
                    });
                } else {
                    heldButtonIdRef.current = null;
                }
            }
            setActiveDrag({
                id: session.id,
                type: session.type,
                rotation: session.rotation,
                grabDr: session.grabDr,
                grabDc: session.grabDc,
            });
        }

        e.preventDefault();
        const pin = pointerToPin(e.clientX, e.clientY, gridRef.current);
        setHoverPin(pin);
    };

    const finishMoveSession = (e) => {
        const session = moveSessionRef.current;
        if (!session) return;

        const wasDragging = Boolean(session.dragging);
        const sessionId = session.id;
        const sessionType = session.type;

        try {
            boardHostRef.current?.releasePointerCapture(e.pointerId);
        } catch {
            /* already released */
        }

        if (session.dragging) {
            const pin = pointerToPin(e.clientX, e.clientY, gridRef.current);
            if (pin) {
                commitPlacedMove(
                    session.id,
                    session.type,
                    session.rotation,
                    pin,
                    session.grabDr,
                    session.grabDc
                );
            }
        }

        endMoveSession();

        if (wasDragging) {
            pendingClickInteractRef.current = null;
            return;
        }

        const comp = placed.find((p) => p.id === sessionId);
        if (!comp) return;

        if (pendingClickInteractRef.current === sessionId) {
            pendingClickInteractRef.current = null;
            void interactFnsRef.current.clickInteract(comp);
            return;
        }

        if (pendingClickInteractRef.current === `unlock:${sessionId}`) {
            pendingClickInteractRef.current = null;
            void interactFnsRef.current.unlockMomentary(comp);
            return;
        }

        if (
            isMomentaryInteractive(sessionType) &&
            heldButtonIdRef.current === sessionId
        ) {
            void interactFnsRef.current.releaseMomentary(comp);
        }
    };

    const handleBoardPointerUp = (e) => {
        if (!moveSessionRef.current) return;
        e.preventDefault();
        finishMoveSession(e);
    };

    const handleBoardPointerCancel = (e) => {
        if (!moveSessionRef.current) return;
        finishMoveSession(e);
    };

    const handlePalettePointerDown = (e, type, left) => {
        if (
            e.button !== 0 ||
            e.target.closest?.('button, input, select')
        ) {
            return;
        }
        if (!isPhotoAccessoryType(type) && left <= 0) {
            return;
        }

        e.preventDefault();
        clearMoveSessionRef();
        disarmWireTool();
        const rotation = getPaletteRotation(type);
        palettePointerSessionRef.current = {
            pointerId: e.pointerId,
            type,
            rotation,
            target: e.currentTarget,
        };
        e.currentTarget.setPointerCapture(e.pointerId);
        setActiveDrag({ type, rotation, grabDr: 0, grabDc: 0 });
        setHoverPin(null);
    };

    const palettePointerToGridPoint = (clientX, clientY) => {
        const grid = gridRef.current;
        const stage = getBoardStage(grid);
        if (!stage) return null;
        const rect = stage.getBoundingClientRect();
        if (
            clientX < rect.left ||
            clientX > rect.right ||
            clientY < rect.top ||
            clientY > rect.bottom
        ) {
            return null;
        }
        return pointerToGridPoint(clientX, clientY, stage);
    };

    const palettePointerToPin = (clientX, clientY) => {
        const grid = gridRef.current;
        if (!grid) return null;
        const rect = grid.getBoundingClientRect();
        if (
            clientX < rect.left ||
            clientX > rect.right ||
            clientY < rect.top ||
            clientY > rect.bottom
        ) {
            return null;
        }
        return pointerToPin(clientX, clientY, grid);
    };

    const handlePalettePointerMove = (e) => {
        const session = palettePointerSessionRef.current;
        if (!session || session.pointerId !== e.pointerId) return;
        e.preventDefault();

        if (isPhotoAccessoryType(session.type)) {
            const pt = palettePointerToGridPoint(e.clientX, e.clientY);
            setAccessoryDragPoint(pt);
            if (pt) {
                scheduleAccessoryDragSimulationRef.current({
                    type: session.type,
                    row: pt.row,
                    col: pt.col,
                });
            } else {
                // Outside the board: do not spam /simulate — restore ambient at most once.
                scheduleAccessoryDragSimulationRef.current(null, {
                    leaveBoard: true,
                });
            }
            return;
        }

        setHoverPin(palettePointerToPin(e.clientX, e.clientY));
    };

    const finishPalettePointerDrag = (e, cancelled = false) => {
        const session = palettePointerSessionRef.current;
        if (!session || session.pointerId !== e.pointerId) return;

        try {
            session.target?.releasePointerCapture(e.pointerId);
        } catch {
            /* already released */
        }
        palettePointerSessionRef.current = null;
        setHoverPin(null);
        setActiveDrag(null);
        setAccessoryDragPoint(null);

        if (isPhotoAccessoryType(session.type)) {
            photoAccessoryDragRef.current = null;
            accessoryDragAnchorRef.current = null;
            if (accessorySimTimerRef.current) {
                clearTimeout(accessorySimTimerRef.current);
                accessorySimTimerRef.current = null;
            }
            if (liveSimModeRef.current) {
                // One ambient restore only if torch/cover had changed the light.
                scheduleAccessoryDragSimulationRef.current(null, {
                    leaveBoard: true,
                    force: true,
                });
            }
            accessoryLastLightRef.current = null;
            return;
        }

        if (cancelled) return;
        const pin = palettePointerToPin(e.clientX, e.clientY);
        if (!pin) return;

        const anchor = alignPlacementAnchor(
            session.type,
            pin.row,
            pin.col,
            session.rotation
        );
        if (!anchor) return;
        if (
            !tryPlace(
                session.type,
                anchor.row,
                anchor.col,
                session.rotation
            )
        ) {
            return;
        }

        setPlaced((prev) => [
            ...prev,
            {
                id: createComponentId(),
                type: session.type,
                row: anchor.row,
                col: anchor.col,
                rotation: session.rotation,
            },
        ]);
    };

    const palettePointerHandlers = (type, left) => ({
        onPointerDown: (e) => handlePalettePointerDown(e, type, left),
        onPointerMove: handlePalettePointerMove,
        onPointerUp: (e) => finishPalettePointerDrag(e),
        onPointerCancel: (e) => finishPalettePointerDrag(e, true),
    });

    const handleBoardDragOver = (e) => {
        // Must always preventDefault or the browser rejects the drop.
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (moveSessionRef.current) {
            clearMoveSessionRef();
        }
        setHoverPin(pointerToPin(e.clientX, e.clientY, gridRef.current));
    };

    const handleBoardDragLeave = () => {
        setHoverPin(null);
    };

    const handleBoardDrop = (e) => {
        e.preventDefault();
        if (moveSessionRef.current) {
            clearMoveSessionRef();
        }

        const pin = pointerToPin(e.clientX, e.clientY, gridRef.current);
        setHoverPin(null);
        setActiveDrag(null);

        if (!pin) return;

        const payload = parseDragPayload(e.dataTransfer);
        if (!payload?.type) return;

        const { type } = payload;
        const rotation = payload.rotation ?? 0;
        const anchor = alignPlacementAnchor(
            type,
            pin.row,
            pin.col,
            rotation
        );

        if (payload.source === 'board' && payload.id) {
            commitPlacedMove(payload.id, type, rotation, pin, 0, 0);
            return;
        }

        if (!anchor) return;

        const { row, col } = anchor;
        if (!tryPlace(type, row, col, rotation)) return;

        setPlaced((prev) => [
            ...prev,
            { id: createComponentId(), type, row, col, rotation },
        ]);
    };

    const removeComponent = (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        setPlaced((prev) => prev.filter((p) => p.id !== id));
        setMessage('');
    };

    const clearBoard = () => {
        if (placed.length === 0) return;
        potPositionsRef.current = {};
        switchStatesRef.current = {};
        setPotPositions({});
        setSwitchStates({});
        setPlaced([]);
        clearCircuitDraft(userId, problemCode);
        setMessage('');
        setSubmitStatus(null);
        setHoverPin(null);
        setActiveDrag(null);
        setAccessoryDragPoint(null);
        photoAccessoryDragRef.current = null;
        photoLedBaselineRef.current = null;
        accessoryDragAnchorRef.current = null;
        accessoryLastLightRef.current = null;
        if (accessorySimTimerRef.current) {
            clearTimeout(accessorySimTimerRef.current);
            accessorySimTimerRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            if (tranAnimRef.current != null) {
                cancelAnimationFrame(tranAnimRef.current);
            }
        };
    }, []);

    const cancelTranAnimation = useCallback(() => {
        if (tranAnimRef.current != null) {
            cancelAnimationFrame(tranAnimRef.current);
            tranAnimRef.current = null;
        }
    }, []);

    const finishTranAnimation = useCallback(() => {
        setLedTranAnimPhase(null);
        setTranFrame(0);
        if (idleSimResultsRef.current) {
            setSimResults(idleSimResultsRef.current);
        }
    }, [setTranFrame]);

    /** End of a CP.L2.3 crossfade: keep final frame (do not snap back to power-on idle). */
    const finishCrossfadeAnimation = useCallback(
        (result) => {
            setLedTranAnimPhase(null);
            const last = Array.isArray(result?.time) ? result.time.length - 1 : 0;
            setTranFrame(Math.max(0, last));
        },
        [setTranFrame]
    );

    const rememberPressedLedCurrent = useCallback(
        (result) => {
            const ledComp = placed.find((p) => isLedType(p.type));
            if (!ledComp) {
                return;
            }
            const spiceId = toSpiceId(ledComp.id);
            if (isTransientResult(result)) {
                const peak =
                    getTransientSeriesMax(result, spiceId, 'forward_current', {
                        forwardOnly: true,
                    }) ??
                    getTransientSeriesMax(result, spiceId, 'current', {
                        forwardOnly: true,
                    });
                if (typeof peak === 'number' && peak > 0) {
                    pressedLedCurrentMaxRef.current = peak;
                }
                return;
            }
            const i = getComponentCurrent(result, spiceId, { signed: true });
            if (typeof i === 'number' && i > 0) {
                pressedLedCurrentMaxRef.current = i;
            }
        },
        [placed]
    );

    const startTranAnimation = useCallback(
        (result, phase, options = {}) => {
            cancelTranAnimation();
            const keepLastFrame = options.keepLastFrame === true;
            const times = result?.time;
            if (!Array.isArray(times) || times.length < 2) {
                if (phase === 'discharge' && !keepLastFrame) {
                    finishTranAnimation();
                } else {
                    setLedTranAnimPhase(null);
                }
                return;
            }

            setLedTranAnimPhase(phase);

            const ledComp = placed.find((p) => isLedType(p.type));
            if (ledComp) {
                const spiceId = toSpiceId(ledComp.id);
                if (phase === 'charge') {
                    const peak =
                        getTransientSeriesMax(result, spiceId, 'forward_current', {
                            forwardOnly: true,
                        }) ??
                        getTransientSeriesMax(result, spiceId, 'current', {
                            forwardOnly: true,
                        });
                    if (typeof peak === 'number' && peak > 0) {
                        pressedLedCurrentMaxRef.current = peak;
                    }
                } else if (pressedLedCurrentMaxRef.current == null) {
                    const i0 = getComponentCurrent(result, spiceId, { signed: true }, 0);
                    if (typeof i0 === 'number' && i0 > 0) {
                        pressedLedCurrentMaxRef.current = i0;
                    }
                }
            }

            const simStopSec =
                typeof result.stop === 'number'
                    ? result.stop
                    : times[times.length - 1];
            const fullDuration = options.fullDuration === true;
            const readableCrossfade = options.readableCrossfade === true;
            const flashEdge = options.flashEdge === true;
            // TCP.L3.5: only scrub the bright capacitive spike (~60 ms), then snap to the
            // settled dark end — playing the full 0.5 s decay looks like “hold stays lit”.
            const playUntilSec = flashEdge
                ? Math.min(0.06, simStopSec)
                : keepLastFrame
                  ? fullDuration
                      ? simStopSec
                      : (getTransientSettleTime(result) ?? simStopSec)
                  : simStopSec;
            // Stretch the active transition across a readable wall-clock fade
            // (RC settles in tens of ms; playing the full 4s stop makes fade look instant).
            // L2.7 polarity: play settle window in ~2–2.5 s (not a full 4 s wait).
            // TCP.L3.5: brief flash (~150 ms wall), then dark while button remains held.
            const durationMs = flashEdge
                ? Math.max(120, Math.min(200, playUntilSec * 2800))
                : keepLastFrame
                  ? fullDuration
                      ? Math.max(3500, simStopSec * 1000)
                      : readableCrossfade
                        ? Math.max(2000, Math.min(2600, playUntilSec * 1100))
                        : Math.max(2800, Math.min(5000, playUntilSec * 12000))
                  : Math.max(3000, simStopSec * 1000);
            const start = performance.now();
            setTranFrame(0);

            const tick = (now) => {
                const progress = Math.min(1, (now - start) / durationMs);
                const targetTime = progress * playUntilSec;
                let idx = 0;
                while (idx < times.length - 1 && times[idx + 1] < targetTime) {
                    idx += 1;
                }
                setTranFrame(idx);
                if (progress < 1) {
                    tranAnimRef.current = requestAnimationFrame(tick);
                } else {
                    tranAnimRef.current = null;
                    if (keepLastFrame) {
                        finishCrossfadeAnimation(result);
                    } else if (phase === 'discharge') {
                        finishTranAnimation();
                    } else if (flashEdge) {
                        // Settled dark end of the edge .tran (button may still be held).
                        setLedTranAnimPhase(null);
                        setTranFrame(times.length - 1);
                    } else {
                        setLedTranAnimPhase(null);
                        setTranFrame(times.length - 1);
                        rememberPressedLedCurrent(result);
                    }
                }
            };

            tranAnimRef.current = requestAnimationFrame(tick);
        },
        [
            cancelTranAnimation,
            finishTranAnimation,
            finishCrossfadeAnimation,
            placed,
            rememberPressedLedCurrent,
            setTranFrame,
        ]
    );

    const runLiveSimulation = useCallback(
        async (states, options = {}) => {
            const isLive = options.live ?? liveSimMode;
            const simPhase = options.simPhase ?? 'idle';
            const priorPotPositions = options.priorPotPositions;
            const priorSwitchStates = options.priorSwitchStates;
            const boardPlaced = options.placedOverride ?? placed;
            const floatingPhotoAccessories =
                options.floatingPhotoAccessories ??
                (photoAccessoryDragRef.current
                    ? [photoAccessoryDragRef.current]
                    : []);
            const requestId = ++simRequestIdRef.current;
            const circuitJson = buildCircuitJson(
                boardPlaced,
                states,
                problemCode,
                potPositionsRef.current,
                floatingPhotoAccessories
            );

            if (!circuitJson.components.length) {
                setMessage(
                    lang === 'ka'
                        ? 'განათავსეთ მაინც ერთი დეტალი (კვება, ღილაკი, ნათურა)'
                        : 'Place at least one part (supply, button, lamp)'
                );
                return;
            }

            setSimulating(true);

            try {
                const phase =
                    usesTransientSimulation(problemCode) ? simPhase : undefined;
                const raw = await simulateCircuit(
                    circuitJson,
                    problemCode,
                    phase,
                    priorPotPositions,
                    priorSwitchStates
                );
                const result = normalizeSimulationResults(raw);

                if (requestId !== simRequestIdRef.current) {
                    return;
                }

                if (simulationHasError(result)) {
                    setSimResults(null);
                    setTranFrame(0);
                    setMessage(
                        lang === 'ka'
                            ? `სიმულაციის შეცდომა: ${result.error}`
                            : `Simulation error: ${result.error}`
                    );
                } else {
                    if (simPhase === 'idle') {
                        idleSimResultsRef.current = result;
                        if (problemCode !== 'CP.L2.14' && problemCode !== 'CP.L2.16') {
                            pressedLedCurrentMaxRef.current = null;
                        }
                        if (problemCode === 'CP.L2.14' || problemCode === 'CP.L2.16') {
                            const ledComp = placed.find((p) => isLedType(p.type));
                            if (ledComp) {
                                const lastIdx = isTransientResult(result)
                                    ? Math.max(0, (result.time?.length ?? 1) - 1)
                                    : undefined;
                                const i = getComponentCurrent(
                                    result,
                                    toSpiceId(ledComp.id),
                                    { signed: true },
                                    lastIdx
                                );
                                if (typeof i === 'number' && i >= 0.00035) {
                                    baselineLedCurrentRef.current = i;
                                } else {
                                    // Too little current to count as baseline (e.g. 100 kΩ).
                                    baselineLedCurrentRef.current = null;
                                    pressedLedCurrentMaxRef.current = null;
                                }
                            }
                        }
                        if (
                            typeof problemCode === 'string' &&
                            problemCode.startsWith('PR.') &&
                            !photoAccessoryDragRef.current &&
                            !isTransientResult(result)
                        ) {
                            const ledComp = placed.find((p) => isLedType(p.type));
                            const slideComp = placed.find((p) =>
                                isSlideSwitchType(p.type)
                            );
                            const slideState = slideComp
                                ? switchStatesRef.current[slideComp.id] ?? 'left'
                                : 'left';
                            const captureDimBaseline =
                                problemCode === 'PR.L1.2' ||
                                problemCode === 'PR.L2.3' ||
                                (problemCode === 'PR.L2.4' &&
                                    slideState === 'right');
                            if (ledComp && captureDimBaseline) {
                                const i = getComponentCurrent(
                                    result,
                                    toSpiceId(ledComp.id),
                                    { signed: true }
                                );
                                if (typeof i === 'number' && i >= 0.001) {
                                    photoLedBaselineRef.current = i;
                                }
                            }
                        }
                    }
                    if (
                        simPhase === 'pressed' &&
                        !isTransientResult(result)
                    ) {
                        rememberPressedLedCurrent(result);
                    }
                    // Reset frame synchronously before swapping results so LEDs never
                    // sample the previous last-index against the new charge/discharge series
                    // (that one-frame mismatch looks like an instant flash then fade).
                    if (isTransientResult(result)) {
                        tranFrameRef.current = 0;
                        setTranFrameIndex(0);
                    }
                    setSimResults(result);
                    if (isTransientResult(result)) {
                        const crossfade =
                            usesSwitchCrossfadeSimulation(problemCode);
                        const parallelDip =
                            usesParallelCapDipSimulation(problemCode);
                        const animPhase =
                            result.simPhase === 'pressed' ||
                            result.simPhase === 'idle' ||
                            simPhase === 'pressed' ||
                            simPhase === 'idle'
                                ? 'charge'
                                : 'discharge';
                        const parallelPolarity =
                            usesParallelCapPolaritySimulation(problemCode);
                        startTranAnimation(result, animPhase, {
                            // Stretch settle so dip→reclaim (and L2.3 crossfade) is visible.
                            // CP.L2.14 / L2.15: keep final frame; play full RC window.
                            keepLastFrame:
                                crossfade ||
                                (parallelDip && animPhase === 'charge') ||
                                problemCode === 'CP.L2.14' ||
                                problemCode === 'CP.L2.15' ||
                                problemCode === 'CP.L2.16' ||
                                problemCode === 'DI.L3.6' ||
                                problemCode === 'TCP.L1.1' ||
                                problemCode === 'TCP.L1.2' ||
                                problemCode === 'TCP.L1.3' ||
                                problemCode === 'TCP.L1.4' ||
                                problemCode === 'DTR.L2.4' ||
                                problemCode === 'DTR.L2.5' ||
                                problemCode === 'DTR.L2.6' ||
                                problemCode === 'DTR.L2.11' ||
                                problemCode === 'DTR.L2.12',
                            fullDuration:
                                (crossfade &&
                                    usesMasterSwitchSimulation(problemCode) &&
                                    !parallelPolarity) ||
                                problemCode === 'CP.L2.14' ||
                                problemCode === 'CP.L2.15' ||
                                problemCode === 'CP.L2.16' ||
                                problemCode === 'TCP.L1.1' ||
                                problemCode === 'TCP.L1.2' ||
                                problemCode === 'TCP.L1.3' ||
                                problemCode === 'TCP.L1.4' ||
                                problemCode === 'DTR.L2.4' ||
                                problemCode === 'DTR.L2.5' ||
                                problemCode === 'DTR.L2.6' ||
                                problemCode === 'DTR.L2.11' ||
                                problemCode === 'DTR.L2.12',
                            // DI.L3.6: ~2–2.5 s fade so live pot-drag steps stay readable
                            // when each move cancels/restarts the prior .tran.
                            readableCrossfade:
                                parallelPolarity || problemCode === 'DI.L3.6',
                            // TCP.L3.5: brief capacitive flash (~200 ms), not a 3–4 s RC play.
                            flashEdge: problemCode === 'TCP.L3.5',
                        });
                    } else {
                        cancelTranAnimation();
                        setLedTranAnimPhase(null);
                        setTranFrame(0);
                    }
                }

                // Interaction tips live in the Components panel; don't spam the board message while building.
            } catch (err) {
                if (requestId !== simRequestIdRef.current) {
                    return;
                }
                setSimResults(null);
                const detail = err?.message ?? String(err);
                const isNetwork =
                    detail.includes('Failed to fetch') ||
                    detail.includes('NetworkError');
                setMessage(
                    isNetwork
                        ? lang === 'ka'
                            ? 'სერვერი არ პასუხობს — გაუშვით backend (პორტი 8080)'
                            : 'Server not reachable — start backend on port 8080'
                        : lang === 'ka'
                          ? `შეცდომა: ${detail}`
                          : `Error: ${detail}`
                );
            } finally {
                // Always clear for the latest request; superseded requests leave
                // simulating true so a hung/outdated torch drag cannot lock Submit.
                if (requestId === simRequestIdRef.current) {
                    setSimulating(false);
                }
            }
        },
        [
            placed,
            lang,
            liveSimMode,
            problemCode,
            startTranAnimation,
            cancelTranAnimation,
            commitSwitchStates,
            rememberPressedLedCurrent,
            finishTranAnimation,
            setTranFrame,
        ]
    );

    useEffect(() => {
        runLiveSimulationRef.current = runLiveSimulation;
    }, [runLiveSimulation]);

    const scheduleAccessoryDragSimulation = useCallback(
        (floater, { flush = false, leaveBoard = false, force = false } = {}) => {
            if (!liveSimModeRef.current) return;

            const clearTimer = () => {
                if (accessorySimTimerRef.current) {
                    clearTimeout(accessorySimTimerRef.current);
                    accessorySimTimerRef.current = null;
                }
            };

            const runAmbient = () => {
                photoAccessoryDragRef.current = null;
                accessorySimTimerRef.current = null;
                if (!liveSimModeRef.current) return;
                accessoryLastLightRef.current = PHOTO_AMBIENT_LIGHT_LEVEL;
                accessoryLastSimAtRef.current = Date.now();
                runLiveSimulationRef.current(switchStatesRef.current, {
                    live: true,
                    simPhase: 'idle',
                    floatingPhotoAccessories: [],
                });
            };

            const wasAffectingLight = () => {
                const prev = accessoryLastLightRef.current;
                return (
                    typeof prev === 'number' &&
                    Math.abs(prev - PHOTO_AMBIENT_LIGHT_LEVEL) >= 0.002
                );
            };

            // Pointer left the board (or drag ended): restore ambient at most once.
            if (leaveBoard || (flush && !floater)) {
                photoAccessoryDragRef.current = null;
                clearTimer();
                if (!force && accessoryDragAnchorRef.current === 'outside') {
                    return;
                }
                if (!wasAffectingLight()) {
                    accessoryDragAnchorRef.current = 'outside';
                    return;
                }
                accessoryDragAnchorRef.current = 'outside';
                runAmbient();
                return;
            }

            if (flush) {
                clearTimer();
                photoAccessoryDragRef.current = floater;
                accessoryLastSimAtRef.current = Date.now();
                runLiveSimulationRef.current(switchStatesRef.current, {
                    live: true,
                    simPhase: 'idle',
                    floatingPhotoAccessories: floater ? [floater] : [],
                });
                return;
            }

            if (!floater) {
                return;
            }

            photoAccessoryDragRef.current = floater;

            const quantize = (v) =>
                Math.round(v / ACCESSORY_SIM_GRID_STEP) * ACCESSORY_SIM_GRID_STEP;
            const anchorKey = `${floater.type}:${quantize(floater.row)},${quantize(floater.col)}`;

            if (accessoryDragAnchorRef.current === anchorKey) {
                return;
            }

            const photo = placedRef.current.find(
                (c) => c.type === COMPONENT_TYPES.PHOTO_RESISTOR
            );
            if (photo) {
                const light = lightLevelForPhotoResistor(
                    photo,
                    placedRef.current,
                    [floater]
                );
                // On board but far from the photoresistor: no light change — skip.
                // Restore ambient once when leaving an active effect zone.
                if (Math.abs(light - PHOTO_AMBIENT_LIGHT_LEVEL) < 0.002) {
                    accessoryDragAnchorRef.current = anchorKey;
                    if (!wasAffectingLight()) {
                        return;
                    }
                    clearTimer();
                    runAmbient();
                    return;
                }
                if (
                    typeof accessoryLastLightRef.current === 'number' &&
                    Math.abs(light - accessoryLastLightRef.current) <
                        ACCESSORY_LIGHT_EPSILON
                ) {
                    accessoryDragAnchorRef.current = anchorKey;
                    return;
                }
            }

            accessoryDragAnchorRef.current = anchorKey;

            const run = () => {
                accessorySimTimerRef.current = null;
                if (!liveSimModeRef.current) return;
                const active = photoAccessoryDragRef.current;
                const photoComp = placedRef.current.find(
                    (c) => c.type === COMPONENT_TYPES.PHOTO_RESISTOR
                );
                if (photoComp) {
                    accessoryLastLightRef.current = lightLevelForPhotoResistor(
                        photoComp,
                        placedRef.current,
                        active ? [active] : []
                    );
                }
                accessoryLastSimAtRef.current = Date.now();
                runLiveSimulationRef.current(switchStatesRef.current, {
                    live: true,
                    simPhase: 'idle',
                    floatingPhotoAccessories: active ? [active] : [],
                });
            };

            const elapsed = Date.now() - accessoryLastSimAtRef.current;
            if (
                accessoryLastSimAtRef.current === 0 ||
                elapsed >= ACCESSORY_SIM_MIN_INTERVAL_MS
            ) {
                clearTimer();
                run();
                return;
            }

            clearTimer();
            accessorySimTimerRef.current = setTimeout(
                run,
                ACCESSORY_SIM_MIN_INTERVAL_MS - elapsed
            );
        },
        []
    );

    useEffect(() => {
        scheduleAccessoryDragSimulationRef.current =
            scheduleAccessoryDragSimulation;
    }, [scheduleAccessoryDragSimulation]);

    // Keep switch/pot state in sync with the board and re-simulate automatically.
    useEffect(() => {
        const initial = createInitialSwitchStates(placed, problemCode);
        const placedIds = new Set(placed.map((comp) => comp.id));
        const nextLocked = new Set(
            [...lockedButtonIdsRef.current].filter((id) => placedIds.has(id))
        );
        if (nextLocked.size !== lockedButtonIdsRef.current.size) {
            lockedButtonIdsRef.current = nextLocked;
            setLockedButtonsVersion((n) => n + 1);
        }
        const merged = {};
        for (const [id, state] of Object.entries(initial)) {
            merged[id] = switchStatesRef.current[id] ?? state;
        }
        switchStatesRef.current = merged;
        setSwitchStates(merged);

        const keptPots = {};
        for (const comp of placed) {
            if (!isVarResistorType(comp.type)) continue;
            keptPots[comp.id] =
                potPositionsRef.current[comp.id] ?? DEFAULT_POT_POSITION;
        }
        potPositionsRef.current = keptPots;
        setPotPositions(keptPots);

        if (boardSimTimerRef.current) {
            clearTimeout(boardSimTimerRef.current);
            boardSimTimerRef.current = null;
        }

        if (placed.length === 0) {
            lockedButtonIdsRef.current = new Set();
            lastButtonClickAtRef.current = {};
            setLockedButtonsVersion((n) => n + 1);
            setSimResults(null);
            tranFrameRef.current = 0;
            setTranFrameIndex(0);
            pressedLedCurrentMaxRef.current = null;
            baselineLedCurrentRef.current = null;
            di36LastSimPotRef.current = {};
            pendingClickInteractRef.current = null;
            heldButtonIdRef.current = null;
            return undefined;
        }

        // Torch/cover drag owns live sim; do not pile on board-resync requests.
        if (photoAccessoryDragRef.current) {
            return undefined;
        }

        boardSimTimerRef.current = setTimeout(() => {
            boardSimTimerRef.current = null;
            if (photoAccessoryDragRef.current) return;
            di36LastSimPotRef.current = { ...potPositionsRef.current };
            runLiveSimulationRef.current(switchStatesRef.current, {
                live: true,
                simPhase: 'idle',
            });
        }, 140);

        return () => {
            if (boardSimTimerRef.current) {
                clearTimeout(boardSimTimerRef.current);
                boardSimTimerRef.current = null;
            }
        };
        // Intentionally omit runLiveSimulation — identity churn was re-firing
        // this effect on every sim response and flooding /simulate during torch drag.
    }, [placed, problemCode]);

    /** Potentiometer dial: update A–B share (0…1) and re-sim while live. */
    const handlePotPositionChange = useCallback(
        (compId, rawValue, { flush = false } = {}) => {
            const next = Number(rawValue) / 100;
            commitPotPosition(compId, next);
            if (!liveSimModeRef.current) return;

            if (potSimTimerRef.current) {
                clearTimeout(potSimTimerRef.current);
                potSimTimerRef.current = null;
            }

            // DI.L3.6: live updates while dragging (like VR). Dim → prior-pot
            // .tran so the hold LED fades; brighten → sync DC.
            // TFB.L3.3 / TFB.L2.5: always pass prior pot so snap/hysteresis settle works.
            if (problemCode === 'DI.L3.6' || problemCode === 'TFB.L3.3' || problemCode === 'TFB.L2.5') {
                const run = () => {
                    potSimTimerRef.current = null;
                    if (!liveSimModeRef.current) return;
                    const current =
                        potPositionsRef.current[compId] ?? next;
                    const prior =
                        di36LastSimPotRef.current[compId] ??
                        DEFAULT_POT_POSITION;
                    di36LastSimPotRef.current = {
                        ...di36LastSimPotRef.current,
                        [compId]: current,
                    };
                    if (problemCode === 'TFB.L3.3' || problemCode === 'TFB.L2.5') {
                        runLiveSimulation(switchStatesRef.current, {
                            simPhase: 'idle',
                            priorPotPositions: {
                                variable_resistor: prior,
                            },
                        });
                        return;
                    }
                    const dimming = current > prior + 0.015;
                    if (dimming) {
                        runLiveSimulation(switchStatesRef.current, {
                            simPhase: 'discharge',
                            priorPotPositions: {
                                variable_resistor: prior,
                            },
                        });
                    } else {
                        runLiveSimulation(switchStatesRef.current, {
                            simPhase: 'idle',
                        });
                    }
                };

                if (flush) {
                    run();
                } else {
                    // Slightly slower than VR so each discharge .tran can start fading.
                    potSimTimerRef.current = setTimeout(run, 140);
                }
                return;
            }

            const run = () => {
                potSimTimerRef.current = null;
                if (!liveSimModeRef.current) return;
                runLiveSimulation(switchStatesRef.current);
            };

            if (flush) {
                run();
            } else {
                potSimTimerRef.current = setTimeout(run, 120);
            }
        },
        [commitPotPosition, problemCode, runLiveSimulation]
    );

    /** Momentary button: close while held (not while dragging). */
    const pressMomentaryButton = async (comp) => {
        if (!isMomentaryInteractive(comp.type)) return;

        const wasDischarging = ledTranAnimPhase === 'discharge';
        cancelTranAnimation();
        setLedTranAnimPhase(null);
        if (wasDischarging) {
            finishTranAnimation();
        } else {
            setTranFrame(0);
        }

        heldButtonIdRef.current = comp.id;

        const priorSwitchStates =
            problemCode === 'TFB.L3.4' ? switchStatesRef.current : undefined;

        const nextStates = {
            ...switchStatesRef.current,
            [comp.id]: 'closed',
        };
        commitSwitchStates(nextStates);
        await runLiveSimulation(nextStates, {
            simPhase: 'pressed',
            priorSwitchStates,
        });
    };

    const releaseMomentaryButton = async (comp, { allowLock = true } = {}) => {
        if (!isMomentaryInteractive(comp.type)) return;
        if (heldButtonIdRef.current !== comp.id) return;
        heldButtonIdRef.current = null;

        if (allowLock) {
            const now = Date.now();
            const previousClick = lastButtonClickAtRef.current[comp.id] ?? 0;
            lastButtonClickAtRef.current[comp.id] = now;
            if (now - previousClick <= 400) {
                lockedButtonIdsRef.current.add(comp.id);
                setLockedButtonsVersion((n) => n + 1);
                return;
            }
        } else {
            delete lastButtonClickAtRef.current[comp.id];
        }

        const nextStates = {
            ...switchStatesRef.current,
            [comp.id]: 'open',
        };
        const priorSwitchStates =
            problemCode === 'TFB.L3.4'
                ? {
                      ...switchStatesRef.current,
                      [comp.id]: 'closed',
                  }
                : undefined;
        commitSwitchStates(nextStates);
        await runLiveSimulation(nextStates, {
            simPhase: 'discharge',
            priorSwitchStates,
        });
    };

    const unlockMomentaryButton = async (comp) => {
        if (!lockedButtonIdsRef.current.has(comp.id)) return;
        lockedButtonIdsRef.current.delete(comp.id);
        delete lastButtonClickAtRef.current[comp.id];
        setLockedButtonsVersion((n) => n + 1);

        const nextStates = {
            ...switchStatesRef.current,
            [comp.id]: 'open',
        };
        commitSwitchStates(nextStates);
        await runLiveSimulation(nextStates, {
            simPhase: 'discharge',
            priorSwitchStates:
                problemCode === 'TFB.L3.4'
                    ? {
                          ...switchStatesRef.current,
                          [comp.id]: 'closed',
                      }
                    : undefined,
        });
    };

    /** Click (no drag): toggle switches / motor stall. */
    const handleInteractiveClick = async (comp) => {
        if (
            supportsMotorStallToggle(problemCode) &&
            comp.type === COMPONENT_TYPES.MOTOR
        ) {
            const current = switchStatesRef.current[comp.id] ?? 'running';
            const next = current === 'stalled' ? 'running' : 'stalled';
            const nextStates = {
                ...switchStatesRef.current,
                [comp.id]: next,
            };
            commitSwitchStates(nextStates);
            await runLiveSimulation(nextStates);
            return;
        }

        if (!isToggleInteractive(comp.type)) return;

        const current = switchStatesRef.current[comp.id];
        let next;
        let simPhase;

        if (isSlideSwitchType(comp.type)) {
            const atLeft = (current ?? 'left') !== 'right';
            next = atLeft ? 'right' : 'left';
            simPhase = next === 'right' ? 'pressed' : 'discharge';
            if (usesMasterSwitchSimulation(problemCode)) {
                const masterOpen = Object.entries(switchStatesRef.current).some(
                    ([id, state]) => {
                        const part = placed.find((p) => p.id === id);
                        return (
                            part?.type === COMPONENT_TYPES.SWITCH &&
                            state !== 'closed'
                        );
                    }
                );
                if (masterOpen) {
                    simPhase = 'idle';
                }
            }
        } else {
            const isClosed = current === 'closed';
            next = isClosed ? 'open' : 'closed';
            if (usesMasterOffDischargeSimulation(problemCode)) {
                simPhase = next === 'closed' ? 'idle' : 'discharge';
            } else if (usesSwitchCrossfadeSimulation(problemCode)) {
                simPhase = 'idle';
            } else if (usesMasterSwitchSimulation(problemCode)) {
                simPhase = 'idle';
            } else {
                simPhase = next === 'closed' ? 'pressed' : 'discharge';
            }
        }

        const nextStates = {
            ...switchStatesRef.current,
            [comp.id]: next,
        };
        if (problemCode === 'CP.L4.19' && isSlideSwitchType(comp.type)) {
            for (const part of placed) {
                if (isSlideSwitchType(part.type)) {
                    nextStates[part.id] = next;
                }
            }
        }
        commitSwitchStates(nextStates);

        if (usesSwitchCrossfadeSimulation(problemCode)) {
            cancelTranAnimation();
            setLedTranAnimPhase(null);
            await runLiveSimulation(nextStates, { simPhase });
            return;
        }

        await runLiveSimulation(nextStates);
    };

    interactFnsRef.current = {
        pressMomentary: pressMomentaryButton,
        releaseMomentary: releaseMomentaryButton,
        unlockMomentary: unlockMomentaryButton,
        clickInteract: handleInteractiveClick,
        runLiveSim: runLiveSimulation,
    };

    const handleSubmit = async () => {
        if (!usesCircuitValidation(problemCode)) {
            setSubmitStatus(null);
            setMessage(
                problemCode === 'DM.L4.4'
                    ? lang === 'ka'
                        ? 'ამ ამოცანაში ავტომატური შემოწმება არ არის — ააწყვეთ საზომი წრედი და შეადარეთ ძაბვები/ნათება.'
                        : 'No automated check for this task — build a measurement circuit and compare voltages/brightness.'
                    : problemCode === 'DM.L3.14'
                      ? lang === 'ka'
                          ? 'ამ ამოცანაში ავტომატური შემოწმება არ არის — ააწყვეთ გენერაციის წრედი (ძრავი + ინდიკატორი); ინერცია/გენერაცია სრულად იხილება ფიზიკურ ნაკრებზე.'
                          : 'No automated check for this task — build a generation circuit (motor + indicator); coasting/generator effect is fully visible on the physical kit.'
                      : lang === 'ka'
                        ? 'ამ ამოცანაში წრედის შემოწმება არ არის — ააწყვეთ სურათის მიხედვით და დააკვირდით სიმულაციას.'
                        : 'No circuit check for this task — rebuild from the picture and watch the live simulation.'
            );
            return;
        }

        if (!isBoardComplete(placed, problemCode)) {
            setSubmitStatus('fail');
            setMessage(incompleteBoardMessage(problemCode, lang));
            return;
        }

        const circuitJson = buildCircuitJson(
            placed,
            {},
            problemCode,
            potPositionsRef.current
        );
        setSubmitting(true);
        setSimulating(false);
        setSubmitStatus(null);
        setMessage('');

        try {
            const result = await validateCircuit(
                problemCode,
                circuitJson,
                user?.id ?? null
            );

            setSubmitStatus(result.passed ? 'pass' : 'fail');
            let msg =
                lang === 'ka'
                    ? result.messageKa ?? result.message
                    : result.message;
            if (result.passed && result.solved) {
                msg =
                    (msg ? `${msg}\n` : '') +
                    (lang === 'ka'
                        ? 'პროგრესი შენახულია — ამოცანა მონიშნულია როგორც ამოხსნილი.'
                        : 'Progress saved — this challenge is marked as solved.');
            }
            setMessage(msg);
            queueMicrotask(() => {
                messageRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            });
        } catch (err) {
            setSubmitStatus('fail');
            const detail = err?.message ?? String(err);
            setMessage(
                lang === 'ka' ? `შეცდომა: ${detail}` : `Error: ${detail}`
            );
            queueMicrotask(() => {
                messageRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            });
        } finally {
            setSubmitting(false);
        }
    };

    const renderPaletteRotateBtn = (type, rotation) => (
        <button
            type="button"
            className={styles.rotateBtn}
            title={lang === 'ka' ? 'შებრუნება 90°' : 'Rotate 90°'}
            onClick={(e) => cyclePaletteRotation(type, e)}
        >
            ↻
            <span className={styles.rotateDeg}>{rotation}°</span>
        </button>
    );

    const renderPreviewImg = (type, rotation) => {
        const img = getComponentImage(type);
        const rotated = rotationSteps(rotation) % 2 === 1;
        const wide = isWidePalettePart(type);

        if (!img) {
            return (
                <span className={styles.paletteFallback}>
                    {getLabel(type).slice(0, 2)}
                </span>
            );
        }

        return (
            <img
                src={img}
                alt=""
                className={`${styles.paletteImg} ${wide ? styles.paletteImgWide : ''} ${rotated ? styles.paletteImgRotated : ''}`}
                style={{ transform: `rotate(${rotation}deg)` }}
                draggable={false}
            />
        );
    };

    const renderPaletteCard = (item) => {
        const isAccessory = isPhotoAccessoryType(item.type);
        const left = remaining(item.type);
        const rotation = getPaletteRotation(item.type);
        const wide = isWidePalettePart(item.type);

        return (
            <div key={item.type} className={styles.paletteCard}>
                <div
                    className={`${styles.paletteItem} ${styles.paletteItemStandard} ${!isAccessory && left <= 0 ? styles.paletteItemDisabled : ''} ${isAccessory ? styles.paletteItemAccessory : ''}`}
                    draggable={false}
                    {...palettePointerHandlers(item.type, left)}
                >
                    <span className={styles.paletteLabel}>
                        {lang === 'ka' ? item.labelKa : item.labelEn}
                    </span>
                    <div
                        className={`${styles.palettePreview} ${wide ? styles.palettePreviewWide : ''}`}
                    >
                        {renderPreviewImg(item.type, rotation)}
                    </div>
                    <span className={styles.paletteCount}>
                        {isAccessory
                            ? lang === 'ka'
                                ? 'გადაათრიე'
                                : 'drag'
                            : `×${left}`}
                    </span>
                    {!isAccessory ? renderPaletteRotateBtn(item.type, rotation) : null}
                </div>
            </div>
        );
    };

    const renderResistorCard = () => {
        if (!resistorGroup) return null;

        const type = activeResistorType;
        const left = remaining(type);
        const rotation = getPaletteRotation(type);
        const label =
            lang === 'ka' ? resistorGroup.labelKa : resistorGroup.labelEn;

        return (
            <div className={`${styles.paletteCard} ${styles.connectorCard}`}>
                <div
                    className={`${styles.paletteItem} ${left <= 0 ? styles.paletteItemDisabled : ''}`}
                    draggable={false}
                    {...palettePointerHandlers(type, left)}
                >
                    <span className={styles.paletteLabel}>{label}</span>

                    <div className={styles.connectorLengthPicker}>
                        <span className={styles.connectorLengthLabel}>
                            {lang === 'ka' ? 'მნიშვნელობა' : 'Value'}
                        </span>
                        <div className={styles.connectorLengthOptions}>
                            {RESISTOR_SPECS.map((spec) => (
                                <button
                                    key={spec.key}
                                    type="button"
                                    className={`${styles.lengthOption} ${resistorKey === spec.key ? styles.lengthOptionActive : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setResistorKey(spec.key);
                                    }}
                                >
                                    {spec.pickerLabel ?? spec.key}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div
                        className={`${styles.palettePreview} ${styles.palettePreviewWide}`}
                    >
                        {renderPreviewImg(type, rotation)}
                    </div>
                    <span className={styles.paletteCount}>×{left}</span>
                    {renderPaletteRotateBtn(type, rotation)}
                </div>
            </div>
        );
    };

    const renderCapacitorCard = () => {
        if (!capacitorGroup) return null;

        const type = activeCapacitorType;
        const left = remaining(type);
        const rotation = getPaletteRotation(type);
        const label =
            lang === 'ka' ? capacitorGroup.labelKa : capacitorGroup.labelEn;

        return (
            <div className={`${styles.paletteCard} ${styles.connectorCard}`}>
                <div
                    className={`${styles.paletteItem} ${left <= 0 ? styles.paletteItemDisabled : ''}`}
                    draggable={false}
                    {...palettePointerHandlers(type, left)}
                >
                    <span className={styles.paletteLabel}>{label}</span>

                    <div className={styles.connectorLengthPicker}>
                        <span className={styles.connectorLengthLabel}>
                            {lang === 'ka' ? 'მნიშვნელობა' : 'Value'}
                        </span>
                        <div className={styles.connectorLengthOptions}>
                            {(capacitorGroup.keys
                                ? CAPACITOR_SPECS.filter((spec) =>
                                      capacitorGroup.keys.includes(spec.key)
                                  )
                                : CAPACITOR_SPECS
                            ).map((spec) => (
                                <button
                                    key={spec.key}
                                    type="button"
                                    className={`${styles.lengthOption} ${capacitorKey === spec.key ? styles.lengthOptionActive : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCapacitorKey(spec.key);
                                    }}
                                >
                                    {spec.pickerLabel}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div
                        className={`${styles.palettePreview} ${styles.palettePreviewWide}`}
                    >
                        {renderPreviewImg(type, rotation)}
                    </div>
                    <span className={styles.paletteCount}>×{left}</span>
                    {renderPaletteRotateBtn(type, rotation)}
                </div>
            </div>
        );
    };

    const renderTransistorCard = () => {
        if (!transistorGroup) return null;

        const type = activeTransistorType;
        const left = remaining(type);
        const rotation = getPaletteRotation(type);
        const label =
            lang === 'ka' ? transistorGroup.labelKa : transistorGroup.labelEn;

        return (
            <div className={`${styles.paletteCard} ${styles.connectorCard}`}>
                <div
                    className={`${styles.paletteItem} ${left <= 0 ? styles.paletteItemDisabled : ''}`}
                    draggable={false}
                    {...palettePointerHandlers(type, left)}
                >
                    <span className={styles.paletteLabel}>{label}</span>

                    <div className={styles.connectorLengthPicker}>
                        <span className={styles.connectorLengthLabel}>
                            {lang === 'ka' ? 'ტიპი' : 'Type'}
                        </span>
                        <div className={styles.connectorLengthOptions}>
                            {TRANSISTOR_SPECS.map((spec) => (
                                <button
                                    key={spec.key}
                                    type="button"
                                    className={`${styles.lengthOption} ${transistorKey === spec.key ? styles.lengthOptionActive : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setTransistorKey(spec.key);
                                    }}
                                >
                                    {spec.pickerLabel}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div
                        className={`${styles.palettePreview} ${styles.palettePreviewWide}`}
                    >
                        {renderPreviewImg(type, rotation)}
                    </div>
                    <span className={styles.paletteCount}>×{left}</span>
                    {renderPaletteRotateBtn(type, rotation)}
                </div>
            </div>
        );
    };

    const renderLedCard = () => {
        if (!ledGroup) return null;

        const type = activeLedType;
        const left = remaining(type);
        const rotation = getPaletteRotation(type);
        const label = lang === 'ka' ? ledGroup.labelKa : ledGroup.labelEn;
        const ledActiveClass = {
            red: styles.ledOptionRedActive,
            green: styles.ledOptionGreenActive,
            blue: styles.ledOptionBlueActive,
        };
        const selectedLedSpec = LED_SPECS.find((s) => s.key === ledColor);
        const selectedVf = selectedLedSpec
            ? (lang === 'ka' ? selectedLedSpec.vfKa : selectedLedSpec.vfEn)
            : '';

        return (
            <div className={`${styles.paletteCard} ${styles.ledCard}`}>
                <div
                    className={`${styles.paletteItem} ${styles.paletteItemStandard} ${left <= 0 ? styles.paletteItemDisabled : ''}`}
                    draggable={false}
                    {...palettePointerHandlers(type, left)}
                >
                    <span className={styles.paletteLabel}>{label}</span>

                    <div className={styles.connectorLengthPicker}>
                        <span className={styles.connectorLengthLabel}>
                            {lang === 'ka' ? 'ფერი' : 'Color'}
                        </span>
                        <div
                            className={`${styles.connectorLengthOptions} ${styles.ledOptionsRow}`}
                        >
                            {LED_SPECS.map((spec) => (
                                <button
                                    key={spec.key}
                                    type="button"
                                    title={`${lang === 'ka' ? spec.labelKa : spec.labelEn} · ${lang === 'ka' ? spec.vfKa : spec.vfEn}`}
                                    className={`${styles.lengthOption} ${ledColor === spec.key ? ledActiveClass[spec.key] : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLedColor(spec.key);
                                    }}
                                >
                                    {spec.pickerLabel}
                                </button>
                            ))}
                        </div>
                        <span className={styles.connectorLengthLabel}>
                            {lang === 'ka' ? 'ასანთები ძაბვა' : 'Turn-on voltage'}: {selectedVf}
                        </span>
                    </div>

                    <div
                        className={`${styles.palettePreview} ${styles.palettePreviewWide}`}
                    >
                        {renderPreviewImg(type, rotation)}
                    </div>
                    <span className={styles.paletteCount}>×{left}</span>
                    {renderPaletteRotateBtn(type, rotation)}
                </div>
            </div>
        );
    };

    const renderConnectorCard = () => {
        if (!connectorGroup) return null;

        const type = activeConnectorType;
        const left = remaining(type);
        const rotation = getPaletteRotation(type);
        const label =
            lang === 'ka' ? connectorGroup.labelKa : connectorGroup.labelEn;
        // Hide connector lengths that are not available in this palette (e.g. LAB removes 1-length).
        const allowedLengths = CONNECTOR_LENGTHS.filter(
            (n) => getConnectorMaxCount(palette, n) > 0
        );
        const lengthsToShow = allowedLengths.length ? allowedLengths : CONNECTOR_LENGTHS;

        return (
            <div className={`${styles.paletteCard} ${styles.connectorCard}`}>
                <div
                    className={`${styles.paletteItem} ${left <= 0 ? styles.paletteItemDisabled : ''}`}
                    draggable={false}
                    {...palettePointerHandlers(type, left)}
                >
                    <span className={styles.paletteLabel}>{label}</span>

                    <div className={styles.connectorLengthPicker}>
                        <span className={styles.connectorLengthLabel}>
                            {lang === 'ka' ? 'სიგრძე' : 'Length'}
                        </span>
                        <div className={styles.connectorLengthOptions}>
                            {lengthsToShow.map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    className={`${styles.lengthOption} ${connectorLength === n ? styles.lengthOptionActive : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setConnectorLength(n);
                                    }}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div
                        className={`${styles.palettePreview} ${styles.palettePreviewWide}`}
                    >
                        {renderPreviewImg(type, rotation)}
                    </div>
                    <span className={styles.paletteCount}>×{left}</span>
                    {renderPaletteRotateBtn(type, rotation)}
                </div>
            </div>
        );
    };

    const renderWireCard = () => {
        if (!wireGroup) return null;

        const left = remaining(COMPONENT_TYPES.WIRE);
        const label = lang === 'ka' ? wireGroup.labelKa : wireGroup.labelEn;
        const pinSrc = getWirePinImage(wireColor);

        return (
            <div
                className={`${styles.paletteCard} ${styles.connectorCard}`}
            >
                <div
                    className={`${styles.paletteItem} ${styles.wireToolBtn} ${left <= 0 ? styles.paletteItemDisabled : ''} ${wireToolArmed ? styles.wireToolArmed : ''}`}
                    role="button"
                    tabIndex={left <= 0 ? -1 : 0}
                    aria-disabled={left <= 0}
                    onClick={() => {
                        if (left <= 0) return;
                        clearMoveSessionRef();
                        setActiveDrag(null);
                        setHoverPin(null);
                        if (wireToolArmed) {
                            disarmWireTool();
                            setMessage('');
                        } else {
                            setWireToolArmed(true);
                            setWireDraft(null);
                            setMessage(
                                lang === 'ka'
                                    ? 'დააჭირეთ პირველ პინს, შემდეგ მეორეს'
                                    : 'Click first pin, then the second'
                            );
                        }
                    }}
                    onKeyDown={(e) => {
                        if (left <= 0) return;
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.currentTarget.click();
                        }
                    }}
                >
                    <span className={styles.paletteLabel}>{label}</span>

                    <div className={styles.connectorLengthPicker}>
                        <span className={styles.connectorLengthLabel}>
                            {lang === 'ka' ? 'ფერი' : 'Color'}
                        </span>
                        <div className={styles.connectorLengthOptions}>
                            {(wireGroup.colors?.length
                                ? WIRE_COLOR_SPECS.filter((s) =>
                                      wireGroup.colors.includes(s.key)
                                  )
                                : WIRE_COLOR_SPECS
                            ).map((spec) => (
                                <button
                                    key={spec.key}
                                    type="button"
                                    className={`${styles.lengthOption} ${wireColor === spec.key ? styles.lengthOptionActive : ''}`}
                                    title={lang === 'ka' ? spec.labelKa : spec.labelEn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setWireColor(spec.key);
                                    }}
                                >
                                    {spec.pickerLabel}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.palettePreview}>
                        <img
                            src={pinSrc}
                            alt=""
                            className={styles.wirePalettePin}
                            draggable={false}
                        />
                    </div>
                    <span className={styles.paletteCount}>×{left}</span>
                    <span className={styles.wireToolHint}>
                        {wireToolArmed
                            ? lang === 'ka'
                                ? 'აქტიური — Esc გასაუქმებლად'
                                : 'Armed — Esc to cancel'
                            : lang === 'ka'
                              ? 'დააჭირეთ ჩასართავად'
                              : 'Click to arm'}
                    </span>
                </div>
            </div>
        );
    };

    if (!palette) return null;

    const previewRotation = activeDrag?.rotation ?? 0;
    const grabDr = activeDrag?.grabDr ?? 0;
    const grabDc = activeDrag?.grabDc ?? 0;

    const adjustedHoverPin = hoverPin
        ? { row: hoverPin.row - grabDr, col: hoverPin.col - grabDc }
        : null;

    const previewFootprint =
        activeDrag && adjustedHoverPin
            ? getRotatedFootprint(activeDrag.type, previewRotation)
            : null;

    const previewAnchor =
        activeDrag && adjustedHoverPin && previewFootprint
            ? alignPlacementAnchor(
                  activeDrag.type,
                  adjustedHoverPin.row,
                  adjustedHoverPin.col,
                  previewRotation
              )
            : null;

    const previewPartStyle =
        activeDrag &&
        isPhotoAccessoryType(activeDrag.type) &&
        accessoryDragPoint
            ? getAccessoryStyleAtGridPoint(
                  gridRef.current,
                  accessoryDragPoint.row,
                  accessoryDragPoint.col,
                  activeDrag.type
              )
            : activeDrag && previewAnchor && previewFootprint
              ? getPartStyle(
                    gridRef.current,
                    previewAnchor.row,
                    previewAnchor.col,
                    previewFootprint.w,
                    previewFootprint.h,
                    activeDrag.type,
                    previewRotation
                )
              : null;

    const previewCss = previewPartStyle ? partStyleToCss(previewPartStyle) : null;
    const previewIsTorch =
        activeDrag?.type === COMPONENT_TYPES.TORCH;
    const previewIsCover =
        activeDrag?.type === COMPONENT_TYPES.COVER;

    return (
        <div
            className={`${styles.workbench} ${problemCode === 'LAB' ? styles.workbenchLab : ''}`}
        >
            <aside className={styles.palette}>
                <div className={styles.paletteHeader}>
                    <h2 className={styles.paletteTitle}>
                        {lang === 'ka' ? 'დეტალები' : 'Components'}
                    </h2>
                    <p className={styles.paletteHint}>
                        {problemCode?.startsWith('PR.')
                            ? lang === 'ka'
                                ? '↻ შებრუნება · ფანრი — მიახლოე; დამფარავი — ფოტორეზისტორზე'
                                : '↻ rotate · torch: move near · cover: on photoresistor'
                            : lang === 'ka'
                              ? '↻ შებრუნება · გადაიტანეთ დაფაზე'
                              : '↻ rotate · drag onto the board'}
                    </p>
                    <button
                        type="button"
                        className={styles.clearBtn}
                        onClick={clearBoard}
                        disabled={simulating || submitting || placed.length === 0}
                    >
                        {lang === 'ka' ? 'დაფის გასუფთავება' : 'Clear board'}
                    </button>
                    <p className={styles.paletteHint}>
                        {lang === 'ka'
                            ? 'მარჯვენა ღილაკი დეტალზე — წაშლა'
                            : 'Right-click a component to delete it'}
                    </p>
                    <p className={styles.paletteHint}>
                        {lang === 'ka'
                            ? 'დაფაზე დეტალზე გადაფარებისას ↻ ღილაკი აბრუნებს (ან R)'
                            : 'Hover a placed part and click ↻ to rotate it (or press R)'}
                    </p>
                    {palette.some((item) => item.type === COMPONENT_TYPES.BUTTON) && (
                        <p className={styles.paletteHint}>
                            {lang === 'ka'
                                ? 'ღილაკზე ორჯერ დაწკაპუნება — დაჭერილზე ჩაკეტვა; კიდევ ერთხელ — განბლოკვა'
                                : 'Double-click a button to lock it pressed; click again to unlock'}
                        </p>
                    )}
                    {wireGroup && (
                        <p className={styles.paletteHint}>
                            {lang === 'ka'
                                ? 'მავთული: ჩართეთ → პინი → გადაადგილება → მეორე პინი'
                                : 'Wire: arm → pin → drag → second pin'}
                        </p>
                    )}
                </div>
                <div className={styles.paletteItems}>
                    {standardPalette.map(renderPaletteCard)}
                    {renderConnectorCard()}
                    {renderWireCard()}
                    {renderResistorCard()}
                    {renderCapacitorCard()}
                    {renderTransistorCard()}
                    {renderLedCard()}
                </div>
            </aside>

            <div className={styles.stage}>
            <div
                ref={boardHostRef}
                className={`${styles.boardHost} ${activeDrag?.id ? styles.boardHostDragging : ''} ${wireToolArmed ? styles.boardHostWireTool : ''}`}
                onPointerDownCapture={handleBoardPointerDownCapture}
                onPointerMove={handleBoardPointerMove}
                onPointerUp={handleBoardPointerUp}
                onPointerCancel={handleBoardPointerCancel}
                onDragOver={handleBoardDragOver}
                onDragLeave={handleBoardDragLeave}
                onDrop={handleBoardDrop}
            >
                <CircuitBoard gridRef={gridRef} simulator>
                    {previewCss && activeDrag && (
                        <div
                            className={`${isPhotoAccessoryType(activeDrag.type) ? styles.accessoryPreview : styles.dropPreview} ${previewIsTorch ? styles.dropPreviewTorch : ''} ${previewIsCover ? styles.dropPreviewCover : ''}`}
                            style={{ ...previewCss, zIndex: 110 }}
                            aria-hidden
                        >
                            {getComponentImage(activeDrag.type) ? (
                                <div className={styles.partInner}>
                                    <img
                                        src={getComponentImage(activeDrag.type)}
                                        alt=""
                                        className={styles.partImgAligned}
                                        draggable={false}
                                        style={
                                            previewIsTorch
                                                ? {
                                                      filter: 'drop-shadow(0 0 6px rgba(255, 230, 100, 0.95))',
                                                  }
                                                : previewIsCover
                                                  ? {
                                                        filter: 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.55))',
                                                    }
                                                  : undefined
                                        }
                                    />
                                </div>
                            ) : null}
                        </div>
                    )}
                    <div className={styles.wireLayer} aria-hidden={!wireToolArmed}>
                        <svg className={styles.wireSvg} aria-hidden>
                            {placed
                                .filter((comp) => isWireType(comp.type))
                                .map((comp) => {
                                    const ends = getWireEndpoints(comp);
                                    if (ends.length < 2) return null;
                                    const a = pinToPercent(ends[0].row, ends[0].col);
                                    const b = pinToPercent(ends[1].row, ends[1].col);
                                    return (
                                        <g key={`${comp.id}-cable`}>
                                            <line
                                                x1={`${a.x}%`}
                                                y1={`${a.y}%`}
                                                x2={`${b.x}%`}
                                                y2={`${b.y}%`}
                                                stroke={getWireCableColor(comp.color)}
                                                strokeWidth="5"
                                                strokeLinecap="round"
                                            />
                                            <line
                                                className={styles.wireHitStroke}
                                                x1={`${a.x}%`}
                                                y1={`${a.y}%`}
                                                x2={`${b.x}%`}
                                                y2={`${b.y}%`}
                                                stroke="transparent"
                                                strokeWidth="16"
                                                strokeLinecap="round"
                                                data-placed-part={comp.id}
                                                onContextMenu={(e) => {
                                                    removeComponent(comp.id, e);
                                                }}
                                            />
                                        </g>
                                    );
                                })}
                            {wireDraft?.from &&
                                (() => {
                                    const a = pinToPercent(
                                        wireDraft.from.row,
                                        wireDraft.from.col
                                    );
                                    const b = wireDraft.hoverPin
                                        ? pinToPercent(
                                              wireDraft.hoverPin.row,
                                              wireDraft.hoverPin.col
                                          )
                                        : wireDraft.pointer;
                                    if (!b) return null;
                                    return (
                                        <line
                                            key="wire-draft"
                                            x1={`${a.x}%`}
                                            y1={`${a.y}%`}
                                            x2={`${b.x}%`}
                                            y2={`${b.y}%`}
                                            stroke={getWireCableColor(wireColor)}
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeDasharray="6 4"
                                            opacity="0.85"
                                        />
                                    );
                                })()}
                        </svg>
                        {placed
                            .filter((comp) => isWireType(comp.type))
                            .map((comp) => {
                                const ends = getWireEndpoints(comp);
                                if (ends.length < 2) return null;
                                const a = pinToPercent(ends[0].row, ends[0].col);
                                const b = pinToPercent(ends[1].row, ends[1].col);
                                const angle = wireAngleDeg(a, b);
                                const pinSrc = getWirePinImage(comp.color);
                                return (
                                    <div
                                        key={comp.id}
                                        data-placed-part={comp.id}
                                        className={styles.wirePlaced}
                                        onContextMenu={(e) => {
                                            removeComponent(comp.id, e);
                                        }}
                                    >
                                        <img
                                            src={pinSrc}
                                            alt=""
                                            className={styles.wirePin}
                                            style={{
                                                left: `${a.x}%`,
                                                top: `${a.y}%`,
                                                transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                                            }}
                                            draggable={false}
                                        />
                                        <img
                                            src={pinSrc}
                                            alt=""
                                            className={styles.wirePin}
                                            style={{
                                                left: `${b.x}%`,
                                                top: `${b.y}%`,
                                                transform: `translate(-50%, -50%) rotate(${angle + 180}deg)`,
                                            }}
                                            draggable={false}
                                        />
                                    </div>
                                );
                            })}
                        {wireDraft?.from && (
                            <img
                                src={getWirePinImage(wireColor)}
                                alt=""
                                className={styles.wirePin}
                                style={{
                                    left: `${pinToPercent(wireDraft.from.row, wireDraft.from.col).x}%`,
                                    top: `${pinToPercent(wireDraft.from.row, wireDraft.from.col).y}%`,
                                    transform: `translate(-50%, -50%) rotate(${
                                        wireDraft.hoverPin || wireDraft.pointer
                                            ? wireAngleDeg(
                                                  pinToPercent(
                                                      wireDraft.from.row,
                                                      wireDraft.from.col
                                                  ),
                                                  wireDraft.hoverPin
                                                      ? pinToPercent(
                                                            wireDraft.hoverPin.row,
                                                            wireDraft.hoverPin.col
                                                        )
                                                      : wireDraft.pointer
                                              )
                                            : 0
                                    }deg)`,
                                    opacity: 0.9,
                                    pointerEvents: 'none',
                                }}
                                draggable={false}
                            />
                        )}
                    </div>
                    {placed
                        .filter(
                            (comp) =>
                                !isPhotoAccessoryType(comp.type) &&
                                !isWireType(comp.type)
                        )
                        .map((comp, index) => {
                        // boardLayoutTick: wait for grid mount before measuring pins
                        void boardLayoutTick;
                        const rotation = comp.rotation ?? 0;
                        const { w, h } = getRotatedFootprint(
                            comp.type,
                            rotation
                        );
                        const partStyle = getPartStyle(
                            gridRef.current,
                            comp.row,
                            comp.col,
                            w,
                            h,
                            comp.type,
                            rotation
                        );
                        const simOk =
                            liveSimMode &&
                            simResults &&
                            !simulationHasError(simResults);
                        const spiceComponentId = toSpiceId(comp.id);
                        const slideState = isSlideSwitchType(comp.type)
                            ? (switchStatesRef.current[comp.id] ?? 'left')
                            : null;
                        const switchClosed =
                            switchStatesRef.current[comp.id] === 'closed' ||
                            slideState === 'right';
                        // Prefer ref (updated sync before setSimResults) so a new .tran never
                        // paints one frame at the previous crossfade's last index.
                        const frameIndex = isTransientResult(simResults)
                            ? tranFrameIndex >= 0
                                ? tranFrameRef.current
                                : 0
                            : 0;
                        const isChargeTranResult =
                            simResults?.simPhase === 'pressed' && switchClosed;
                        const switchCrossfade =
                            usesSwitchCrossfadeSimulation(problemCode) &&
                            isLedType(comp.type) &&
                            isTransientResult(simResults);
                        const dualLedRcFade =
                            (problemCode === 'CP.L2.15' ||
                                problemCode === 'DI.L3.6') &&
                            isLedType(comp.type) &&
                            isTransientResult(simResults);
                        const gradualBrighten =
                            problemCode === 'CP.L2.14' || problemCode === 'CP.L2.16';
                        const dcLedBrightness =
                            (problemCode === 'SW.L1.1' ||
                                problemCode === 'SW.L1.2' ||
                                problemCode === 'SW.L1.13' ||
                                problemCode === 'SW.L4.14' ||
                                problemCode === 'SW.L2.3' ||
                                problemCode === 'SW.L2.9' ||
                                problemCode === 'SW.L2.10' ||
                                problemCode === 'SW.L3.7' ||
                                problemCode === 'SW.L3.8' ||
                                problemCode === 'SW.L3.11') &&
                            isLedType(comp.type) &&
                            simOk &&
                            !isTransientResult(simResults);
                        const dcLampBrightness =
                            (problemCode === 'SW.L1.13' ||
                                problemCode === 'SW.L4.14' ||
                                problemCode === 'SW.L2.4' ||
                                problemCode === 'SW.L2.5') &&
                            comp.type === COMPONENT_TYPES.LAMP &&
                            simOk &&
                            !isTransientResult(simResults);
                        let isLedTranFade = false;
                        let ledBrightnessDirection = 'discharge';
                        let brightnessRatio;

                        if (gradualBrighten && isLedType(comp.type) && simOk) {
                            const i =
                                getComponentCurrent(
                                    simResults,
                                    spiceComponentId,
                                    { signed: true },
                                    frameIndex
                                ) ?? 0;
                            brightnessRatio =
                                getBaselineRelativeLedBrightness(
                                    i,
                                    baselineLedCurrentRef.current,
                                    pressedLedCurrentMaxRef.current
                                );
                            isLedTranFade = brightnessRatio > 0;
                        } else if (dcLedBrightness) {
                            const i =
                                getComponentCurrent(
                                    simResults,
                                    spiceComponentId,
                                    { signed: true },
                                    frameIndex
                                ) ?? 0;
                            brightnessRatio = getAbsoluteLedBrightness(i, {
                                fineContrast: problemCode === 'SW.L2.9',
                                seriesBypass: problemCode === 'SW.L2.10',
                            });
                            isLedTranFade = brightnessRatio > 0;
                        } else if (dcLampBrightness) {
                            const i =
                                getComponentCurrent(
                                    simResults,
                                    spiceComponentId,
                                    {},
                                    frameIndex
                                ) ?? 0;
                            brightnessRatio = getAbsoluteLampBrightness(i, {
                                fineContrast: problemCode === 'SW.L2.5',
                            });
                            isLedTranFade = brightnessRatio > 0;
                        } else if (switchCrossfade || dualLedRcFade) {
                            const i0 =
                                getComponentCurrent(
                                    simResults,
                                    spiceComponentId,
                                    { signed: true },
                                    0
                                ) ?? 0;
                            const lastIdx = Math.max(
                                0,
                                (simResults.time?.length ?? 1) - 1
                            );
                            const iLast =
                                getComponentCurrent(
                                    simResults,
                                    spiceComponentId,
                                    { signed: true },
                                    lastIdx
                                ) ?? 0;
                            const seriesPeak =
                                getTransientSeriesMax(
                                    simResults,
                                    spiceComponentId,
                                    'forward_current',
                                    { forwardOnly: true }
                                ) ??
                                getTransientSeriesMax(
                                    simResults,
                                    spiceComponentId,
                                    'current',
                                    { forwardOnly: true }
                                );
                            // Per-LED peak so green/red timing differences stay visible.
                            const peak = Math.max(
                                seriesPeak ?? 0,
                                i0,
                                iLast
                            );
                            if (peak > 0) {
                                isLedTranFade = true;
                                ledBrightnessDirection =
                                    iLast > i0 ? 'charge' : 'discharge';
                                brightnessRatio = getLedBrightnessRatio(
                                    simResults,
                                    spiceComponentId,
                                    frameIndex,
                                    peak,
                                    ledBrightnessDirection
                                );
                            }
                        } else if (
                            isLedType(comp.type) &&
                            isTransientResult(simResults) &&
                            pressedLedCurrentMaxRef.current &&
                            (ledTranAnimPhase === 'charge' ||
                                ledTranAnimPhase === 'discharge' ||
                                isChargeTranResult)
                        ) {
                            isLedTranFade = true;
                            ledBrightnessDirection =
                                ledTranAnimPhase === 'charge' ||
                                isChargeTranResult
                                    ? 'charge'
                                    : 'discharge';
                            brightnessRatio = getLedBrightnessRatio(
                                simResults,
                                spiceComponentId,
                                frameIndex,
                                pressedLedCurrentMaxRef.current,
                                ledBrightnessDirection
                            );
                        } else if (
                            simOk &&
                            isLedType(comp.type) &&
                            (problemCode === 'VR.L3.22' || problemCode === 'VR.L4.23')
                        ) {
                            brightnessRatio = getRgbSequenceLedDcBrightnessRatio(
                                simResults,
                                spiceComponentId,
                                frameIndex
                            );
                            isLedTranFade = brightnessRatio > 0;
                        } else if (simOk && isLedType(comp.type) && (problemCode === 'VR.L3.19' || problemCode === 'VR.L1.20' || problemCode === 'PR.L3.10')) {
                            brightnessRatio = getAntiparallelLedDcBrightnessRatio(
                                simResults,
                                spiceComponentId,
                                frameIndex
                            );
                            isLedTranFade = brightnessRatio > 0;
                        } else if (
                            simOk &&
                            isLedType(comp.type) &&
                            problemCode === 'PR.L3.11'
                        ) {
                            const i =
                                getComponentCurrent(
                                    simResults,
                                    spiceComponentId,
                                    { signed: true },
                                    frameIndex
                                ) ?? 0;
                            brightnessRatio = getPrL311SeriesLedBrightness(i);
                            isLedTranFade = brightnessRatio > 0;
                        } else if (
                            simOk &&
                            isLedType(comp.type) &&
                            problemCode === 'PR.L2.12'
                        ) {
                            const i =
                                getComponentCurrent(
                                    simResults,
                                    spiceComponentId,
                                    { signed: true },
                                    frameIndex
                                ) ?? 0;
                            brightnessRatio = getPrL212LedBrightness(
                                i,
                                getLedSpec(comp.type)?.spiceColor ??
                                    getLedSpec(comp.type)?.key
                            );
                            isLedTranFade = brightnessRatio > 0;
                        } else if (
                            simOk &&
                            isLedType(comp.type) &&
                            problemCode === 'PR.L2.9'
                        ) {
                            const i =
                                getComponentCurrent(
                                    simResults,
                                    spiceComponentId,
                                    { signed: true },
                                    frameIndex
                                ) ?? 0;
                            brightnessRatio =
                                getPhotoModuleLedContrastBrightness(i);
                            isLedTranFade = brightnessRatio > 0;
                        } else if (
                            simOk &&
                            isLedType(comp.type) &&
                            (problemCode === 'PR.L1.1' ||
                                problemCode === 'PR.L1.5')
                        ) {
                            const i =
                                getComponentCurrent(
                                    simResults,
                                    spiceComponentId,
                                    { signed: true },
                                    frameIndex
                                ) ?? 0;
                            brightnessRatio =
                                getPhotoModuleLedBrightBrightness(i);
                            isLedTranFade = brightnessRatio > 0;
                        } else if (
                            simOk &&
                            isLedType(comp.type) &&
                            problemCode === 'PR.L2.4'
                        ) {
                            const slideComp = placed.find((p) =>
                                isSlideSwitchType(p.type)
                            );
                            const slideState = slideComp
                                ? switchStatesRef.current[slideComp.id] ?? 'left'
                                : 'left';
                            const i =
                                getComponentCurrent(
                                    simResults,
                                    spiceComponentId,
                                    { signed: true },
                                    frameIndex
                                ) ?? 0;
                            if (slideState === 'right') {
                                brightnessRatio = getPhotoModuleLedDimBrightness(
                                    i,
                                    photoLedBaselineRef.current
                                );
                            } else {
                                brightnessRatio =
                                    getPhotoModuleLedBrightBrightness(i);
                            }
                            isLedTranFade = brightnessRatio > 0;
                        } else if (
                            simOk &&
                            isLedType(comp.type) &&
                            (problemCode === 'PR.L1.2' ||
                                problemCode === 'PR.L2.3')
                        ) {
                            const i =
                                getComponentCurrent(
                                    simResults,
                                    spiceComponentId,
                                    { signed: true },
                                    frameIndex
                                ) ?? 0;
                            brightnessRatio = getPhotoModuleLedDimBrightness(
                                i,
                                photoLedBaselineRef.current
                            );
                            isLedTranFade = brightnessRatio > 0;
                        } else if (simOk && isLedType(comp.type)) {
                            // DC / steady: different series resistors → different glow.
                            brightnessRatio = getLedDcBrightnessRatio(
                                simResults,
                                spiceComponentId,
                                frameIndex
                            );
                            isLedTranFade = brightnessRatio > 0;
                        } else if (simOk && comp.type === COMPONENT_TYPES.LAMP) {
                            brightnessRatio = getLampDcBrightnessRatio(
                                simResults,
                                spiceComponentId,
                                frameIndex
                            );
                            isLedTranFade = brightnessRatio > 0;
                        }

                        const img = getPlacedComponentImage(comp.type, {
                            liveSimMode,
                            switchClosed,
                            slideState: slideState ?? undefined,
                            simOk,
                            simResults,
                            spiceId: spiceComponentId,
                            tranFrameIndex: frameIndex,
                            ledBrightnessRatio: brightnessRatio,
                            voltage: getComponentVoltage(
                                simResults,
                                spiceComponentId,
                                frameIndex
                            ),
                        });
                        if (!partStyle) return null;

                        const interactive =
                            liveSimMode && isInteractivePart(comp.type, problemCode);
                        const controlsOnTop =
                            isMomentaryInteractive(comp.type) ||
                            isToggleInteractive(comp.type) ||
                            isVarResistorType(comp.type);

                        // Buttons above transistors; soft wires stay visually on top
                        // (z-index 100) with pass-through hits except the thin stroke.
                        const boxStyle = {
                            ...partStyleToCss(partStyle),
                            zIndex: controlsOnTop
                                ? 40
                                : interactive
                                  ? 30
                                  : 10 + index,
                        };

                        // Keep the fade overlay for the whole tran, even at opacity 0.
                        // Otherwise when ratio hits the floor we fall back to the binary ON
                        // artwork while current is still above the lit threshold — a bright
                        // flash mid fade / before the slow charge begins (CP.L2.3 crossfade).
                        const glowOpacity = brightnessRatio ?? 0;
                        const useGlowOverlay = Boolean(isLedTranFade);
                        const baseGlowImg = useGlowOverlay
                            ? getComponentImage(comp.type)
                            : null;
                        const glowOnImg = useGlowOverlay
                            ? getPlacedComponentImage(comp.type, {
                                  liveSimMode: true,
                                  simOk: true,
                                  dischargeFading: true,
                                  spiceId: spiceComponentId,
                                  tranFrameIndex: frameIndex,
                                  simResults,
                                  voltage:
                                      getComponentVoltage(
                                          simResults,
                                          spiceComponentId,
                                          frameIndex
                                      ) ?? 1,
                              })
                            : null;

                        const motorPeak =
                            simOk &&
                            comp.type === COMPONENT_TYPES.MOTOR &&
                            isTransientResult(simResults)
                                ? getTransientSeriesMax(
                                      simResults,
                                      spiceComponentId,
                                      'current'
                                  )
                                : undefined;
                        const motorSpinRaw =
                            simOk && comp.type === COMPONENT_TYPES.MOTOR
                                ? getMotorSpinState(
                                      simResults,
                                      spiceComponentId,
                                      frameIndex,
                                      motorPeak
                                  )
                                : null;
                        const motorStalled =
                            supportsMotorStallToggle(problemCode) &&
                            switchStatesRef.current[comp.id] === 'stalled';
                        const motorSpin =
                            motorSpinRaw && motorStalled
                                ? {
                                      ...motorSpinRaw,
                                      spinning: false,
                                      speedRatio: 0,
                                  }
                                : motorSpinRaw;
                        if (comp.type === COMPONENT_TYPES.MOTOR) {
                            motorSpeedsRef.current[comp.id] = motorSpin?.spinning
                                ? (360 / motorSpin.periodSec) *
                                  motorSpin.direction
                                : 0;
                        }
                        const motorAngle = motorAnglesRef.current[comp.id] ?? 0;

                        return (
                            <div
                                key={comp.id}
                                data-placed-part={comp.id}
                                className={`${styles.placedPart} ${activeDrag?.id === comp.id ? styles.placedPartDragging : ''} ${interactive ? styles.placedPartInteractive : ''}`}
                                style={boxStyle}
                                draggable={false}
                                onContextMenu={(e) => {
                                    removeComponent(comp.id, e);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'r' || e.key === 'R') {
                                        e.preventDefault();
                                        rotatePlaced(comp);
                                    }
                                }}
                                role={
                                    interactive &&
                                    !isVarResistorType(comp.type)
                                        ? isToggleInteractive(comp.type) ||
                                          (supportsMotorStallToggle(problemCode) &&
                                              comp.type === COMPONENT_TYPES.MOTOR)
                                            ? 'switch'
                                            : 'button'
                                        : undefined
                                }
                                tabIndex={
                                    interactive &&
                                    !isVarResistorType(comp.type)
                                        ? 0
                                        : undefined
                                }
                                aria-checked={
                                    interactive &&
                                    (isToggleInteractive(comp.type) ||
                                        (supportsMotorStallToggle(problemCode) &&
                                            comp.type === COMPONENT_TYPES.MOTOR))
                                        ? supportsMotorStallToggle(problemCode) &&
                                          comp.type === COMPONENT_TYPES.MOTOR
                                            ? switchStatesRef.current[comp.id] ===
                                              'stalled'
                                            : switchClosed
                                        : undefined
                                }
                                aria-pressed={
                                    interactive &&
                                    isMomentaryInteractive(comp.type)
                                        ? switchClosed
                                        : undefined
                                }
                                aria-label={
                                    interactive
                                        ? isSlideSwitchType(comp.type)
                                            ? `${getLabel(comp.type)} — ${
                                                  slideState === 'right'
                                                      ? 'A–C'
                                                      : 'A–B'
                                              }`
                                            : isVarResistorType(comp.type)
                                              ? `${getLabel(comp.type)} — ${formatPotResistanceLabel(
                                                    potPositions[comp.id] ??
                                                        DEFAULT_POT_POSITION
                                                )}`
                                            : supportsMotorStallToggle(
                                                    problemCode
                                                ) &&
                                                comp.type ===
                                                    COMPONENT_TYPES.MOTOR
                                              ? `${getLabel(comp.type)} — ${
                                                    switchStatesRef.current[
                                                        comp.id
                                                    ] === 'stalled'
                                                        ? lang === 'ka'
                                                            ? 'გაჩერებული'
                                                            : 'stalled'
                                                        : lang === 'ka'
                                                          ? 'ტრიალებს'
                                                          : 'running'
                                                }`
                                              : isToggleInteractive(comp.type)
                                                ? `${getLabel(comp.type)} — ${switchClosed ? (lang === 'ka' ? 'ჩართული' : 'on') : lang === 'ka' ? 'გამორთული' : 'off'}`
                                                : getLabel(comp.type)
                                        : undefined
                                }
                            >
                                <button
                                    type="button"
                                    data-rotate-handle
                                    tabIndex={-1}
                                    className={styles.rotateHandle}
                                    style={rotateHandleScreenStyle(rotation)}
                                    title={
                                        lang === 'ka'
                                            ? 'შებრუნება 90° (ან R)'
                                            : 'Rotate 90° (or press R)'
                                    }
                                    aria-label={
                                        lang === 'ka'
                                            ? 'დეტალის შებრუნება'
                                            : 'Rotate component'
                                    }
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        rotatePlaced(comp);
                                        e.currentTarget.blur();
                                    }}
                                    onContextMenu={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    ↻
                                </button>
                                <div
                                    className={
                                        useGlowOverlay
                                            ? `${styles.partInner} ${styles.partInnerLedFade}`
                                            : motorSpin
                                              ? `${styles.partInner} ${styles.partInnerOverlay}`
                                            : styles.partInner
                                    }
                                >
                                    {useGlowOverlay &&
                                    baseGlowImg &&
                                    glowOnImg ? (
                                        <>
                                            <img
                                                src={baseGlowImg}
                                                alt=""
                                                aria-hidden
                                                className={styles.partImgAligned}
                                                draggable={false}
                                            />
                                            <img
                                                src={glowOnImg}
                                                alt=""
                                                aria-hidden
                                                className={styles.ledGlowOverlay}
                                                style={{
                                                    opacity: glowOpacity,
                                                }}
                                                draggable={false}
                                            />
                                        </>
                                    ) : img ? (
                                        <img
                                            src={img}
                                            alt=""
                                            aria-hidden
                                            className={styles.partImgAligned}
                                            style={
                                                comp.type === COMPONENT_TYPES.TORCH
                                                    ? {
                                                          filter: 'drop-shadow(0 0 6px rgba(255, 230, 100, 0.95))',
                                                      }
                                                    : comp.type === COMPONENT_TYPES.COVER
                                                      ? {
                                                            filter: 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.55))',
                                                        }
                                                      : undefined
                                            }
                                            draggable={false}
                                        />
                                    ) : (
                                        <span className={styles.partFallback}>
                                            {getLabel(comp.type)}
                                        </span>
                                    )}
                                    {motorSpin ? (
                                        <>
                                            <img
                                                src="/components/motor-fan.svg"
                                                alt=""
                                                aria-hidden
                                                className={styles.motorFanOverlay}
                                                style={{
                                                    transform: `translate(-50%, -50%) rotate(${motorAngle}deg)`,
                                                }}
                                                draggable={false}
                                            />
                                            {motorSpin.spinning ? (
                                                <span
                                                    className={`${styles.motorDirBadge} ${
                                                        motorSpin.direction >= 0
                                                            ? styles.motorDirCw
                                                            : styles.motorDirCcw
                                                    }`}
                                                    title={
                                                        motorSpin.direction >= 0
                                                            ? lang === 'ka'
                                                                ? 'ბრუნვა საათის ისრის მიმართულებით'
                                                                : 'Clockwise'
                                                            : lang === 'ka'
                                                              ? 'ბრუნვა საათის ისრის საწინააღმდეგოდ'
                                                              : 'Counter-clockwise'
                                                    }
                                                    aria-label={
                                                        motorSpin.direction >= 0
                                                            ? 'CW'
                                                            : 'CCW'
                                                    }
                                                >
                                                    {motorSpin.direction >= 0
                                                        ? '↻'
                                                        : '↺'}
                                                </span>
                                            ) : null}
                                        </>
                                    ) : null}
                                </div>
                                {isVarResistorType(comp.type) ? (
                                    <div
                                        className={styles.potSliderWrap}
                                        data-pot-slider
                                        onPointerDown={(e) => {
                                            e.stopPropagation();
                                        }}
                                    >
                                        <label className={styles.potSliderLabel}>
                                            <input
                                                type="range"
                                                className={styles.potSlider}
                                                min={0}
                                                max={100}
                                                step={1}
                                                value={Math.round(
                                                    clampPotPosition(
                                                        potPositions[comp.id] ??
                                                            DEFAULT_POT_POSITION
                                                    ) * 100
                                                )}
                                                aria-label={
                                                    lang === 'ka'
                                                        ? 'ცვლადი რეზისტორი A–B'
                                                        : 'Potentiometer A–B'
                                                }
                                                onChange={(e) => {
                                                    handlePotPositionChange(
                                                        comp.id,
                                                        e.target.value
                                                    );
                                                }}
                                                onPointerUp={(e) => {
                                                    handlePotPositionChange(
                                                        comp.id,
                                                        e.target.value,
                                                        { flush: true }
                                                    );
                                                }}
                                            />
                                            <span className={styles.potSliderValue}>
                                                {formatPotResistanceLabel(
                                                    potPositions[comp.id] ??
                                                        DEFAULT_POT_POSITION
                                                )}
                                            </span>
                                        </label>
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
                </CircuitBoard>
            </div>

            <div className={styles.boardBar}>
                <div className={styles.actionBtns}>
                    {usesCircuitValidation(problemCode) && (
                        <button
                            type="button"
                            className={styles.submitBtn}
                            onClick={handleSubmit}
                            disabled={submitting || placed.length === 0}
                        >
                            {submitting
                                ? lang === 'ka'
                                    ? 'იმოწმება...'
                                    : 'Checking...'
                                : lang === 'ka'
                                  ? 'შემოწმება'
                                  : 'Submit'}
                        </button>
                    )}
                </div>
                {message && (
                    <p
                        ref={messageRef}
                        className={`${styles.message} ${
                            submitStatus === 'pass'
                                ? styles.messagePass
                                : submitStatus === 'fail'
                                  ? styles.messageFail
                                  : ''
                        }`}
                    >
                        {message}
                    </p>
                )}
            </div>
            </div>
        </div>
    );
}
