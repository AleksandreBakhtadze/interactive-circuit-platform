import { useCallback, useEffect, useRef, useState } from 'react';
import { simulateCircuit, validateCircuit } from '../../api';
import { useLang } from '../../context/LangContext';
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
    isResistorType,
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
    getLampDcBrightnessRatio,
    getBaselineRelativeLedBrightness,
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
    supportsMotorStallToggle,
    toSpiceId,
} from '../../utils/circuitNetlist';
import {
    alignPlacementAnchor,
    canPlaceAt,
    countPlacedByType,
    createComponentId,
} from '../CircuitSimulator/circuitUtils';
import CircuitBoard from './CircuitBoard';
import {
    getPartStyle,
    parseDragPayload,
    partStyleToCss,
    pointerToPin,
    setDragPayload,
    setTransparentDragGhost,
} from './boardPlacement';
import styles from './CircuitWorkbench.module.css';

const MOVE_DRAG_THRESHOLD_PX = 4;

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
        if (problemCode === 'DM.L4.4') {
            return 'განათავსეთ: 2 კვების წყარო, ძრავი (და საზომი დეტალები სურვილისამებრ)';
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
    if (problemCode === 'DM.L4.4') {
        return 'Place: 2 power supplies, motor (plus measurement parts as needed)';
    }
    return 'Place: power supply, button, lamp';
}

export default function CircuitWorkbench({ problemCode }) {
    const { lang } = useLang();
    const palette = getPaletteForProblem(problemCode);
    const gridRef = useRef(null);
    const heldButtonIdRef = useRef(null);
    const switchStatesRef = useRef({});
    const potPositionsRef = useRef({});
    const potSimTimerRef = useRef(null);
    const moveSessionRef = useRef(null);
    const boardHostRef = useRef(null);

    const [placed, setPlaced] = useState([]);
    const [paletteRotations, setPaletteRotations] = useState({});
    const [connectorLength, setConnectorLength] = useState(3);
    const [resistorKey, setResistorKey] = useState('100o');
    const [capacitorKey, setCapacitorKey] = useState('10uf');
    const [ledColor, setLedColor] = useState('red');
    const [transistorKey, setTransistorKey] = useState('q1');
    const [message, setMessage] = useState('');
    const messageRef = useRef(null);
    const [simulating, setSimulating] = useState(false);
    const [liveSimMode, setLiveSimMode] = useState(false);
    const [switchStates, setSwitchStates] = useState({});
    const [potPositions, setPotPositions] = useState({});
    const [simResults, setSimResults] = useState(null);
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

    const liveSimModeRef = useRef(false);
    useEffect(() => {
        liveSimModeRef.current = liveSimMode;
    }, [liveSimMode]);

    useEffect(() => {
        return () => {
            if (potSimTimerRef.current) {
                clearTimeout(potSimTimerRef.current);
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
            problemCode === 'CP.L4.19'
        ) {
            setCapacitorKey('470uf');
        } else {
            setCapacitorKey('10uf');
        }
        if (problemCode === 'CP.L2.5') {
            setResistorKey('5ko1');
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
            problemCode === 'VR.L1.10'
        ) {
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

    useEffect(() => {
        setLiveSimMode(false);
        switchStatesRef.current = {};
        setSwitchStates({});
        setSimResults(null);
        tranFrameRef.current = 0;
        setTranFrameIndex(0);
        pressedLedCurrentMaxRef.current = null;
        baselineLedCurrentRef.current = null;
    }, [placed]);
    const connectorGroup = getConnectorGroupItem(palette);
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
        const connectorLen = parseConnectorLength(type);
        if (connectorLen !== null) {
            const max = getConnectorMaxCount(palette);
            return max - countPlacedByType(placed, type);
        }
        const rKey = parseResistorKey(type);
        if (rKey !== null) {
            const max = getResistorMaxCount(palette);
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
            const max = getTransistorMaxCount(palette);
            return max - countPlacedByType(placed, type);
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

    const tryPlace = (type, row, col, rotation, ignoreId = null) => {
        const connectorLen = parseConnectorLength(type);
        const used = countPlacedByType(placed, type);

        if (connectorLen !== null) {
            const max = getConnectorMaxCount(palette);
            if (used >= max && !ignoreId) {
                setMessage(
                    lang === 'ka'
                        ? 'ამ ზომის გამტრის ლიმიტი ამოწურულია'
                        : 'No more connectors of this length'
                );
                return false;
            }
        } else if (parseResistorKey(type) !== null) {
            const max = getResistorMaxCount(palette);
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
            const max = getTransistorMaxCount(palette);
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

    const handlePaletteDragStart = (e, type) => {
        if (remaining(type) <= 0) {
            e.preventDefault();
            return;
        }
        const rotation = getPaletteRotation(type);
        setActiveDrag({ type, rotation, grabDr: 0, grabDc: 0 });
        setDragPayload(e.dataTransfer, { source: 'palette', type, rotation });
        setTransparentDragGhost(e.dataTransfer);
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

    const endMoveSession = () => {
        moveSessionRef.current = null;
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
        };

        boardHostRef.current?.setPointerCapture(pointerId);
    };

    const handleBoardPointerDownCapture = (e) => {
        if (e.button !== 0) return;

        // On-part pot slider — never start a board drag from the control.
        if (e.target.closest?.('[data-pot-slider]')) {
            return;
        }

        const partId = findPlacedPartIdAt(e.clientX, e.clientY);
        if (!partId) return;

        const comp = placed.find((p) => p.id === partId);
        if (!comp) return;

        if (liveSimMode && isInteractivePart(comp.type, problemCode)) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        beginMoveSession(comp, e.clientX, e.clientY, e.pointerId);
    };

    const handleBoardPointerMove = (e) => {
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
            setActiveDrag({
                id: session.id,
                type: session.type,
                rotation: session.rotation,
                grabDr: session.grabDr,
                grabDc: session.grabDc,
            });
        }

        e.preventDefault();
        setHoverPin(pointerToPin(e.clientX, e.clientY, gridRef.current));
    };

    const finishMoveSession = (e) => {
        const session = moveSessionRef.current;
        if (!session) return;

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

    const handleDragEnd = () => {
        setActiveDrag(null);
        setHoverPin(null);
    };

    const handleBoardDragOver = (e) => {
        if (moveSessionRef.current) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setHoverPin(pointerToPin(e.clientX, e.clientY, gridRef.current));
    };

    const handleBoardDragLeave = () => {
        setHoverPin(null);
    };

    const handleBoardDrop = (e) => {
        e.preventDefault();
        if (moveSessionRef.current) {
            endMoveSession();
            return;
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
            const playUntilSec = keepLastFrame
                ? fullDuration
                    ? simStopSec
                    : (getTransientSettleTime(result) ?? simStopSec)
                : simStopSec;
            // Stretch the active transition across a readable wall-clock fade
            // (RC settles in tens of ms; playing the full 4s stop makes fade look instant).
            // L2.7 polarity: play settle window in ~2–2.5 s (not a full 4 s wait).
            const durationMs = keepLastFrame
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
            const circuitJson = buildCircuitJson(
                placed,
                states,
                problemCode,
                potPositionsRef.current
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
                const raw = await simulateCircuit(circuitJson, problemCode, phase);
                const result = normalizeSimulationResults(raw);

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
                                problemCode === 'CP.L2.16',
                            fullDuration:
                                (crossfade &&
                                    usesMasterSwitchSimulation(problemCode) &&
                                    !parallelPolarity) ||
                                problemCode === 'CP.L2.14' ||
                                problemCode === 'CP.L2.15' ||
                                problemCode === 'CP.L2.16',
                            // CP.L2.7: fade then rise in ~2–2.5 s (not instant, not 4 s).
                            readableCrossfade: parallelPolarity,
                        });
                    } else {
                        cancelTranAnimation();
                        setLedTranAnimPhase(null);
                        setTranFrame(0);
                    }
                }

                if (!simulationHasError(result) && isLive) {
                    setMessage(
                        problemCode === 'CP.L2.14'
                            ? lang === 'ka'
                                ? 'ჩართეთ ჩამრთველი, შემდეგ დააჭირეთ და არ გაუშვათ ღილაკი ფირზე'
                                : 'Turn the switch ON, then press and hold the button on the board'
                            : problemCode === 'SW.L1.1'
                              ? lang === 'ka'
                                  ? 'დააწკაპუნეთ გადამრთველზე — ანთდება მეორე შუქდიოდი'
                                  : 'Click the slide switch — the other LED lights'
                              : problemCode === 'SW.L1.2' ||
                                  problemCode === 'SW.L1.13' ||
                                  problemCode === 'SW.L2.3' ||
                                  problemCode === 'SW.L2.4' ||
                                  problemCode === 'SW.L2.5' ||
                                  problemCode === 'DM.L2.2' ||
                                  problemCode === 'DM.L2.3' ||
                                  problemCode === 'DM.L2.6' ||
                                  problemCode === 'DM.L2.7' ||
                                  problemCode === 'DM.L2.8' ||
                                  problemCode === 'DM.L3.9'
                                ? lang === 'ka'
                                    ? problemCode === 'DM.L3.9'
                                        ? 'დააწკაპუნეთ გადამრთველზე — ბრუნვის მიმართულება და წითელი/მწვანე LED იცვლება'
                                        : problemCode === 'DM.L2.8'
                                          ? 'დააწკაპუნეთ გადამრთველებზე — ერთნაირი პოზიცია ტრიალებს, განსხვავებული აჩერებს; ორივეს გადართვა ცვლის მიმართულებას'
                                          : problemCode === 'DM.L2.6' ||
                                              problemCode === 'DM.L2.7'
                                            ? 'დააწკაპუნეთ გადამრთველზე — ბრუნვის მიმართულება იცვლება'
                                            : problemCode === 'DM.L2.2' ||
                                                problemCode === 'DM.L2.3'
                                              ? 'დააწკაპუნეთ გადამრთველზე — ბრუნვა ნელი ↔ ჩქარი'
                                              : 'დააწკაპუნეთ გადამრთველზე — ნათება სუსტი ↔ ძლიერი'
                                    : problemCode === 'DM.L3.9'
                                      ? 'Click the slide — spin direction and red/green LEDs swap'
                                      : problemCode === 'DM.L2.8'
                                        ? 'Click the slides — same position spins, different stops; flip both to reverse'
                                        : problemCode === 'DM.L2.6' ||
                                            problemCode === 'DM.L2.7'
                                          ? 'Click the slide switch — spin direction reverses'
                                          : problemCode === 'DM.L2.2' ||
                                              problemCode === 'DM.L2.3'
                                            ? 'Click the slide switch — spin slow ↔ fast'
                                            : 'Click the slide switch — brightness dim ↔ bright'
                                : problemCode === 'SW.L4.14'
                                  ? lang === 'ka'
                                      ? 'დააწკაპუნეთ გადამრთველზე — ნათურა და შუქდიოდი შებრუნებულად იცვლება'
                                      : 'Click the slide switch — lamp and LED brightness swap inversely'
                                  : problemCode === 'SW.L2.9'
                                  ? lang === 'ka'
                                      ? 'ჩართეთ ჩამრთველი, აირჩიეთ გადამრთველით სიძლიერე, დააჭირეთ და არ გაუშვათ ღილაკი'
                                      : 'Turn the switch ON, pick boost strength on the slide, then press and hold the button'
                                  : problemCode === 'SW.L2.10'
                                    ? lang === 'ka'
                                        ? 'ჩართეთ ჩამრთველი, გადაართეთ შუქდიოდი, დააჭირეთ და არ გაუშვათ ღილაკი — ნათება მოიმატებს'
                                        : 'Turn the switch ON, pick an LED with the slide, then press and hold the button to brighten'
                                    : problemCode === 'SW.L3.11'
                                      ? lang === 'ka'
                                          ? 'გადაართეთ მწვანე/ლურჯი; დააჭირეთ ღილაკს — წითელი ჩაანაცვლებს (Vf)'
                                          : 'Toggle green/blue on the slide; press the button — red replaces it (Vf clamp)'
                                      : problemCode === 'SW.L3.6'
                                  ? lang === 'ka'
                                      ? 'დააწკაპუნეთ რომელიმე გადამრთველზე — ნათურა ჩაირთვება/გამოირთვება'
                                      : 'Click either slide switch — the lamp toggles on/off'
                                  : problemCode === 'SW.L3.7' ||
                                      problemCode === 'SW.L3.8'
                                    ? lang === 'ka'
                                        ? 'დააწკაპუნეთ რომელიმე გადამრთველზე — შუქდიოდები იცვლება'
                                        : 'Click either slide switch — the LEDs swap'
                                    : problemCode === 'CP.L2.16'
                                ? lang === 'ka'
                                    ? 'დააწკაპუნეთ გადამრთველზე (სლაიდერზე) — ნათება თანდათან იცვლება'
                                    : 'Click the slide switch — brightness changes gradually'
                                : problemCode === 'CP.L4.19'
                                  ? lang === 'ka'
                                      ? 'დააწკაპუნეთ რომელიმე გადამრთველზე — ორივე ერთად გადაირთვება (გაორმაგება)'
                                      : 'Click either slide — both toggle together (voltage doubler)'
                                  : usesMasterSwitchSimulation(problemCode) &&
                                      !isTransientResult(result)
                                    ? lang === 'ka'
                                        ? 'ჩართეთ ჩამრთველი ფირზე, შემდეგ გადაართეთ სლაიდერი (A–B ↔ A–C)'
                                        : 'Turn the switch ON on the board, then toggle the slide (A–B ↔ A–C)'
                                    : usesSwitchCrossfadeSimulation(problemCode)
                                      ? lang === 'ka'
                                          ? usesMasterSwitchSimulation(problemCode)
                                              ? 'ჩართეთ ჩამრთველი, შემდეგ გადაართეთ სლაიდერი (A–B ↔ A–C)'
                                              : 'დააწკაპუნეთ გადამრთველზე (სლაიდერზე) ფირზე გადასართავად'
                                          : usesMasterSwitchSimulation(problemCode)
                                            ? 'Turn the switch ON, then toggle the slide (A–B ↔ A–C)'
                                            : 'Click the slide switch on the board to toggle'
                                      : lang === 'ka'
                                        ? 'დააჭირეთ და არ გაუშვათ ღილაკი ფირზე'
                                        : 'Press and hold the button on the board'
                    );
                } else if (!simulationHasError(result)) {
                    setMessage(
                        lang === 'ka' ? 'სიმულაცია დასრულდა' : 'Simulation finished'
                    );
                }
            } catch (err) {
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
                setSimulating(false);
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

    const handleSimulate = async () => {
        const initial = createInitialSwitchStates(placed, problemCode);
        commitSwitchStates(initial);
        setLiveSimMode(true);
        setMessage('');
        await runLiveSimulation(initial, { live: true, simPhase: 'idle' });
    };

    /** Potentiometer dial: update A–B share (0…1) and re-sim while live. */
    const handlePotPositionChange = useCallback(
        (compId, rawValue, { flush = false } = {}) => {
            commitPotPosition(compId, Number(rawValue) / 100);
            if (!liveSimModeRef.current) return;

            if (potSimTimerRef.current) {
                clearTimeout(potSimTimerRef.current);
                potSimTimerRef.current = null;
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
        [commitPotPosition, runLiveSimulation]
    );

    /** Momentary button: closed only while pointer is held down. */
    const handleInteractivePointerDown = async (comp, e) => {
        if (!liveSimMode || !isInteractivePart(comp.type, problemCode)) return;
        if (e.button !== 0) return;
        // Potentiometer uses the on-part slider — ignore body clicks.
        if (isVarResistorType(comp.type)) return;
        e.stopPropagation();
        e.preventDefault();

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

        if (isToggleInteractive(comp.type)) {
            const current = switchStatesRef.current[comp.id];
            let next;
            let simPhase;

            if (isSlideSwitchType(comp.type)) {
                const atLeft = (current ?? 'left') !== 'right';
                next = atLeft ? 'right' : 'left';
                // left = green resting side; right = red side (pressed / discharge phases)
                simPhase = next === 'right' ? 'pressed' : 'discharge';
                // Master-switch problems: ignore slide pulses while SPST is open.
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
                    // Also check nextStates will keep master open (slide-only change).
                    if (masterOpen) {
                        simPhase = 'idle';
                    }
                }
            } else {
                const isClosed = current === 'closed';
                next = isClosed ? 'open' : 'closed';
                // Master SPST: closing → idle charge/rise; L2.7 opening → discharge fade.
                if (usesMasterOffDischargeSimulation(problemCode)) {
                    simPhase = next === 'closed' ? 'idle' : 'discharge';
                } else if (usesSwitchCrossfadeSimulation(problemCode)) {
                    simPhase = 'idle';
                } else if (usesMasterSwitchSimulation(problemCode)) {
                    // CP.L2.14: toggling master only powers the dim baseline (DC).
                    simPhase = 'idle';
                } else {
                    simPhase = next === 'closed' ? 'pressed' : 'discharge';
                }
            }

            const nextStates = {
                ...switchStatesRef.current,
                [comp.id]: next,
            };
            // CP.L4.19: both SPDTs must move together for the voltage doubler.
            if (
                problemCode === 'CP.L4.19' &&
                isSlideSwitchType(comp.type)
            ) {
                for (const part of placed) {
                    if (isSlideSwitchType(part.type)) {
                        nextStates[part.id] = next;
                    }
                }
            }
            commitSwitchStates(nextStates);

            if (usesSwitchCrossfadeSimulation(problemCode)) {
                // Keep the last lit frame until the new .tran arrives — resetting
                // to frame 0 on the old series snaps the fading LED off instantly.
                cancelTranAnimation();
                setLedTranAnimPhase(null);
                await runLiveSimulation(nextStates, { simPhase });
                return;
            }

            await runLiveSimulation(nextStates);
            return;
        }

        if (!isMomentaryInteractive(comp.type)) return;

        const wasDischarging = ledTranAnimPhase === 'discharge';
        cancelTranAnimation();
        setLedTranAnimPhase(null);
        if (wasDischarging) {
            finishTranAnimation();
        } else {
            setTranFrame(0);
        }

        e.currentTarget.setPointerCapture(e.pointerId);
        heldButtonIdRef.current = comp.id;

        const nextStates = {
            ...switchStatesRef.current,
            [comp.id]: 'closed',
        };
        commitSwitchStates(nextStates);
        await runLiveSimulation(nextStates, { simPhase: 'pressed' });
    };

    const handleInteractivePointerUp = async (comp, e) => {
        if (!liveSimMode || !isMomentaryInteractive(comp.type)) return;
        if (heldButtonIdRef.current !== comp.id) return;
        e.stopPropagation();
        heldButtonIdRef.current = null;

        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
            /* already released */
        }

        const nextStates = {
            ...switchStatesRef.current,
            [comp.id]: 'open',
        };
        commitSwitchStates(nextStates);
        await runLiveSimulation(nextStates, { simPhase: 'discharge' });
    };

    const handleSubmit = async () => {
        if (!usesCircuitValidation(problemCode)) {
            setSubmitStatus(null);
            setMessage(
                problemCode === 'DM.L4.4'
                    ? lang === 'ka'
                        ? 'ამ ამოცანაში ავტომატური შემოწმება არ არის — ააწყვეთ საზომი წრედი და გამოიყენეთ სიმულაცია ძაბვების/ნათების შესადარებლად.'
                        : 'No automated check for this task — build a measurement circuit and use Simulate to compare voltages/brightness.'
                    : lang === 'ka'
                      ? 'ამ ამოცანაში წრედის შემოწმება არ არის — ააწყვეთ სურათის მიხედვით და გამოიყენეთ სიმულაცია.'
                      : 'No circuit check for this task — rebuild from the picture and use Simulate.'
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
        setSubmitStatus(null);
        setMessage('');

        try {
            const result = await validateCircuit(problemCode, circuitJson);

            setSubmitStatus(result.passed ? 'pass' : 'fail');
            setMessage(
                lang === 'ka'
                    ? result.messageKa ?? result.message
                    : result.message
            );
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
        const left = remaining(item.type);
        const rotation = getPaletteRotation(item.type);
        const wide = isWidePalettePart(item.type);

        return (
            <div key={item.type} className={styles.paletteCard}>
                <div
                    className={`${styles.paletteItem} ${styles.paletteItemStandard} ${left <= 0 ? styles.paletteItemDisabled : ''}`}
                    draggable={left > 0}
                    onDragStart={(e) => {
                        if (left <= 0) {
                            e.preventDefault();
                            return;
                        }
                        handlePaletteDragStart(e, item.type);
                    }}
                    onDragEnd={handleDragEnd}
                >
                    <span className={styles.paletteLabel}>
                        {lang === 'ka' ? item.labelKa : item.labelEn}
                    </span>
                    <div
                        className={`${styles.palettePreview} ${wide ? styles.palettePreviewWide : ''}`}
                    >
                        {renderPreviewImg(item.type, rotation)}
                    </div>
                    <span className={styles.paletteCount}>×{left}</span>
                </div>
                <button
                    type="button"
                    className={styles.rotateBtn}
                    title={lang === 'ka' ? 'შებრუნება 90°' : 'Rotate 90°'}
                    onClick={(e) => cyclePaletteRotation(item.type, e)}
                >
                    ↻
                    <span className={styles.rotateDeg}>{rotation}°</span>
                </button>
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
                    draggable={left > 0}
                    onDragStart={(e) => {
                        if (left <= 0) {
                            e.preventDefault();
                            return;
                        }
                        handlePaletteDragStart(e, type);
                    }}
                    onDragEnd={handleDragEnd}
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
                </div>

                <button
                    type="button"
                    className={styles.rotateBtn}
                    title={lang === 'ka' ? 'შებრუნება 90°' : 'Rotate 90°'}
                    onClick={(e) => cyclePaletteRotation(type, e)}
                >
                    ↻
                    <span className={styles.rotateDeg}>{rotation}°</span>
                </button>
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
                    draggable={left > 0}
                    onDragStart={(e) => {
                        if (left <= 0) {
                            e.preventDefault();
                            return;
                        }
                        handlePaletteDragStart(e, type);
                    }}
                    onDragEnd={handleDragEnd}
                >
                    <span className={styles.paletteLabel}>{label}</span>

                    <div className={styles.connectorLengthPicker}>
                        <span className={styles.connectorLengthLabel}>
                            {lang === 'ka' ? 'მნიშვნელობა' : 'Value'}
                        </span>
                        <div className={styles.connectorLengthOptions}>
                            {CAPACITOR_SPECS.map((spec) => (
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
                </div>

                <button
                    type="button"
                    className={styles.rotateBtn}
                    title={lang === 'ka' ? 'შებრუნება 90°' : 'Rotate 90°'}
                    onClick={(e) => cyclePaletteRotation(type, e)}
                >
                    ↻
                    <span className={styles.rotateDeg}>{rotation}°</span>
                </button>
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
                    draggable={left > 0}
                    onDragStart={(e) => {
                        if (left <= 0) {
                            e.preventDefault();
                            return;
                        }
                        handlePaletteDragStart(e, type);
                    }}
                    onDragEnd={handleDragEnd}
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
                </div>

                <button
                    type="button"
                    className={styles.rotateBtn}
                    title={lang === 'ka' ? 'შებრუნება 90°' : 'Rotate 90°'}
                    onClick={(e) => cyclePaletteRotation(type, e)}
                >
                    ↻
                    <span className={styles.rotateDeg}>{rotation}°</span>
                </button>
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
                    draggable={left > 0}
                    onDragStart={(e) => {
                        if (left <= 0) {
                            e.preventDefault();
                            return;
                        }
                        handlePaletteDragStart(e, type);
                    }}
                    onDragEnd={handleDragEnd}
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
                </div>

                <button
                    type="button"
                    className={styles.rotateBtn}
                    title={lang === 'ka' ? 'შებრუნება 90°' : 'Rotate 90°'}
                    onClick={(e) => cyclePaletteRotation(type, e)}
                >
                    ↻
                    <span className={styles.rotateDeg}>{rotation}°</span>
                </button>
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

        return (
            <div className={`${styles.paletteCard} ${styles.connectorCard}`}>
                <div
                    className={`${styles.paletteItem} ${left <= 0 ? styles.paletteItemDisabled : ''}`}
                    draggable={left > 0}
                    onDragStart={(e) => {
                        if (left <= 0) {
                            e.preventDefault();
                            return;
                        }
                        handlePaletteDragStart(e, type);
                    }}
                    onDragEnd={handleDragEnd}
                >
                    <span className={styles.paletteLabel}>{label}</span>

                    <div className={styles.connectorLengthPicker}>
                        <span className={styles.connectorLengthLabel}>
                            {lang === 'ka' ? 'სიგრძე' : 'Length'}
                        </span>
                        <div className={styles.connectorLengthOptions}>
                            {CONNECTOR_LENGTHS.map((n) => (
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
                </div>

                <button
                    type="button"
                    className={styles.rotateBtn}
                    title={lang === 'ka' ? 'შებრუნება 90°' : 'Rotate 90°'}
                    onClick={(e) => cyclePaletteRotation(type, e)}
                >
                    ↻
                    <span className={styles.rotateDeg}>{rotation}°</span>
                </button>
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
        activeDrag && previewAnchor && previewFootprint
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

    return (
        <div className={styles.workbench}>
            <aside className={styles.palette}>
                <div className={styles.paletteHeader}>
                    <h2 className={styles.paletteTitle}>
                        {lang === 'ka' ? 'დეტალები' : 'Components'}
                    </h2>
                    <p className={styles.paletteHint}>
                    {liveSimMode
                        ? problemCode === 'VR.L1.1' ||
                          problemCode === 'VR.L1.2' ||
                          problemCode === 'VR.L1.3' ||
                          problemCode === 'VR.L1.4' ||
                          problemCode === 'VR.L1.5' ||
                          problemCode === 'VR.L2.6' ||
                          problemCode === 'VR.L2.7' ||
                          problemCode === 'VR.L2.8' ||
                          problemCode === 'VR.L2.9' ||
                          problemCode === 'VR.L1.10'
                            ? lang === 'ka'
                                ? problemCode === 'VR.L1.10'
                                    ? 'სიმულაციის რეჟიმი: ააწყვეთ სურათის წრედი; ცოცია შუაში და ბოლოში — ნათურა არ უნდა აინთოს (დამცავი ~50 Ω). შემდეგ უპასუხეთ ტესტს.'
                                    : problemCode === 'VR.L2.9'
                                    ? 'სიმულაციის რეჟიმი: ჩართეთ ჩამრთველი — ცოცია ცვლის ნათებას; გადაართეთ გადამრთველი — იგივე მოძრაობის მიმართულება შებრუნდება.'
                                    : problemCode === 'VR.L2.8'
                                    ? 'სიმულაციის რეჟიმი: ცოცია შუაში — მაქსიმალური ნათება; ნებისმიერი მიმართულებით გადაადგილება ამცირებს ნათებას, მაგრამ LED არ ქრება (დამატებითი R პოტის მიმდევრობით).'
                                    : problemCode === 'VR.L2.7'
                                    ? 'სიმულაციის რეჟიმი: ცოცია შუაში — მაქსიმალური ნათება; ნებისმიერი მიმართულებით გადაადგილება ამცირებს ნათებას და ჩაქრობს LED-ს (პოტი || LED, B–C შეერთებული).'
                                    : problemCode === 'VR.L2.6'
                                    ? 'სიმულაციის რეჟიმი: ცოცია შუაში — მინიმალური ნათება; ნებისმიერი მიმართულებით გადაადგილება ზრდის ნათებას (B–C შეერთებული).'
                                    : problemCode === 'VR.L1.5'
                                      ? 'სიმულაციის რეჟიმი: ჩართეთ ჩამრთველი — ცოცია ცვლის ნათებას; დააჭირეთ ღილაკს — LED მაქსიმუმზეა, ცოცია აღარ მოქმედებს.'
                                      : problemCode === 'VR.L1.4'
                                        ? 'სიმულაციის რეჟიმი: ჩართეთ ჩამრთველი — ცოცია ნათებას არ ცვლის; დააჭირეთ ღილაკს — მაშინ ცოცია ცვლის ნათებას.'
                                      : problemCode === 'VR.L1.3'
                                        ? 'სიმულაციის რეჟიმი: ცოცია შუაში — ორივე LED; გადაადგილეთ — ერთი ძლიერდება, მეორე სუსტდება.'
                                        : problemCode === 'VR.L1.2'
                                          ? 'სიმულაციის რეჟიმი: ჩართეთ ჩამრთველი (ON), გადაადგილეთ ცოცია — LED უნდა აინთოს და ერთ ნაპირზე ბოლომდე ჩაქრეს.'
                                          : 'სიმულაციის რეჟიმი: ჩართეთ ჩამრთველი (ON), შემდეგ გადაადგილეთ ცვლადი რეზისტორის ცოცია — LED-ის ნათება უნდა შეიცვალოს.'
                                : problemCode === 'VR.L1.10'
                                  ? 'Simulation mode: build the figure; mid and end-stop — lamp stays dark (~50 Ω floor). Then answer the quiz.'
                                  : problemCode === 'VR.L2.9'
                                  ? 'Simulation mode: switch ON — pot changes brightness; flip the slide switch to reverse that direction.'
                                  : problemCode === 'VR.L2.8'
                                  ? 'Simulation mode: pot mid = brightest; move either way to dim but stay lit (series R in shunt branch).'
                                  : problemCode === 'VR.L2.7'
                                  ? 'Simulation mode: pot mid = brightest; move either way to dim and extinguish (pot || LED, B–C shorted).'
                                  : problemCode === 'VR.L2.6'
                                  ? 'Simulation mode: pot mid = dimmest; move either way to brighten (B–C shorted).'
                                  : problemCode === 'VR.L1.5'
                                    ? 'Simulation mode: switch ON — pot changes brightness; hold button — LED max, pot ignored.'
                                    : problemCode === 'VR.L1.4'
                                      ? 'Simulation mode: switch ON — pot ignored until you hold the button; then pot changes brightness.'
                                    : problemCode === 'VR.L1.3'
                                      ? 'Simulation mode: pot mid — both LEDs; move it — one brightens, the other dims.'
                                      : problemCode === 'VR.L1.2'
                                        ? 'Simulation mode: turn the switch ON, move the pot — LED should light and fully extinguish at one end.'
                                        : 'Simulation mode: turn the switch ON, then move the pot slider — LED brightness should change.'
                        : problemCode === 'ST.L2.4' || problemCode === 'ST.L2.10'
                            ? lang === 'ka'
                                ? 'სიმულაციის რეჟიმი: ჩართეთ ჩამრთველი (ON), შემდეგ ერთდროულად დააჭირეთ ორივე ღილაკს.'
                                : 'Simulation mode: turn the switch ON, then press and hold both buttons together.'
                            : problemCode === 'ST.L2.11' || problemCode === 'ST.L2.12'
                              ? lang === 'ka'
                                  ? 'სიმულაციის რეჟიმი: ჩართეთ ჩამრთველი (ON), შემდეგ დააჭირეთ ნებისმიერ ღილაკს.'
                                  : 'Simulation mode: turn the switch ON, then press either button.'
                              : problemCode === 'ST.L2.13' || problemCode === 'ST.L2.14'
                                ? lang === 'ka'
                                    ? 'სიმულაციის რეჟიმი: ჩართეთ ჩამრთველი (ON); თითოეული ღილაკი თავის შუქდიოდ(ებ)ს ანთებს.'
                                    : 'Simulation mode: turn the switch ON; each button lights its own LED(s).'
                                : problemCode === 'LR.L3.9'
                                  ? lang === 'ka'
                                      ? 'სიმულაციის რეჟიმი: ჩართეთ ჩამრთველი (ON); პირველი ღილაკი ზრდის, მეორე ამცირებს LED-ის ნათებას.'
                                      : 'Simulation mode: turn the switch ON; the first button brightens and the second dims the LED.'
                                  : problemCode === 'LR.L3.10'
                                    ? lang === 'ka'
                                        ? 'სიმულაციის რეჟიმი: ჩართეთ ჩამრთველი (ON); ღილაკზე დაჭერისას ერთი LED ძლიერდება, მეორე სუსტდება.'
                                        : 'Simulation mode: turn the switch ON; pressing the button brightens one LED and dims the other.'
                                    : problemCode === 'LR.L1.11' ||
                                        problemCode === 'LR.L2.12' ||
                                        problemCode === 'DM.L4.4'
                                      ? lang === 'ka'
                                          ? problemCode === 'DM.L4.4'
                                              ? 'სიმულაციის რეჟიმი: ჩართეთ ჩამრთველი (ON), შეადარეთ LED-ების ნათება; ზუსტი შედარებისთვის დააჭირეთ ღილაკს.'
                                              : 'სიმულაციის რეჟიმი: ჩართეთ ჩამრთველი (ON) და შეადარეთ ორივე LED-ის ნათება.'
                                          : problemCode === 'DM.L4.4'
                                            ? 'Simulation mode: turn the switch ON, compare LED brightness; press the button for a precise comparison.'
                                            : 'Simulation mode: turn the switch ON and compare both LED brightness levels.'
                                  : problemCode === 'LR.L2.5'
                                  ? lang === 'ka'
                                      ? 'სიმულაციის რეჟიმი: ჩართეთ ჩამრთველი (ON); ერთი ღილაკი — ნათურა, მეორე — LED.'
                                      : 'Simulation mode: turn the switch ON; one button lights the lamp, the other the LED.'
                                  : problemCode === 'LR.L3.6' ||
                                      problemCode === 'DM.L2.5' ||
                                      problemCode === 'DM.L2.10'
                                    ? lang === 'ka'
                                        ? problemCode === 'DM.L2.10'
                                            ? 'სიმულაციის რეჟიმი: ჩართეთ ჩამრთველი (ON); დააწკაპუნეთ ძრავზე — გაჩერება/გაშვება (თითით შეჩერება).'
                                            : problemCode === 'DM.L2.5'
                                              ? 'სიმულაციის რეჟიმი: ჩართეთ ჩამრთველი (ON); დააჭირეთ ღილაკს ძრავის გასაჩერებლად.'
                                              : 'სიმულაციის რეჟიმი: LED თავიდან ანთებულია; დააჭირეთ ღილაკს მის ჩასაქრობად.'
                                        : problemCode === 'DM.L2.10'
                                          ? 'Simulation mode: turn the switch ON; click the motor to stall/release (finger stop).'
                                          : problemCode === 'DM.L2.5'
                                            ? 'Simulation mode: turn the switch ON; press and hold the button to stop the motor.'
                                            : 'Simulation mode: the LED starts on; press and hold the button to turn it off.'
                                    : problemCode === 'LR.L2.7'
                                      ? lang === 'ka'
                                          ? 'სიმულაციის რეჟიმი: ჩართეთ ჩამრთველი (ON), შემდეგ დააჭირეთ ღილაკს ნათების მოსამატებლად.'
                                          : 'Simulation mode: turn the switch ON, then press the button to brighten the LED.'
                                      : problemCode === 'LR.L3.8'
                                        ? lang === 'ka'
                                            ? 'სიმულაციის რეჟიმი: ჩართეთ ჩამრთველი (ON), შემდეგ დააჭირეთ ღილაკს ნათების შესამცირებლად.'
                                            : 'Simulation mode: turn the switch ON, then press the button to dim the LED.'
                                  : problemCode === 'ST.L1.3' ||
                                      problemCode === 'ST.L1.8' ||
                                      problemCode === 'ST.L2.9' ||
                                      problemCode === 'LR.L1.1' ||
                                      problemCode === 'LR.L1.2' ||
                                      problemCode === 'LR.L1.3' ||
                                      problemCode === 'LR.L2.4' ||
                                      problemCode === 'DM.L1.1'
                                    ? lang === 'ka'
                                        ? 'სიმულაციის რეჟიმი: ჩართეთ ჩამრთველი (ON), შემდეგ დააჭირეთ და არ გაუშვათ ღილაკი.'
                                        : 'Simulation mode: turn the switch ON, then press and hold the button.'
                                    : lang === 'ka'
                                    ? 'დააჭირეთ და არ გაუშვათ ღილაკი.'
                                    : 'Press and hold the button.'
                        : lang === 'ka'
                          ? '↻ შებრუნება · გადაიტანეთ ფირზე · მარჯვენა ღილაკი — წაშლა'
                          : '↻ rotate · drag to board · right-click to remove'}
                    </p>
                </div>
                <div className={styles.paletteItems}>
                    {standardPalette.map(renderPaletteCard)}
                    {renderConnectorCard()}
                    {renderResistorCard()}
                    {renderCapacitorCard()}
                    {renderTransistorCard()}
                    {renderLedCard()}
                </div>
            </aside>

            <div className={styles.stage}>
            <div
                ref={boardHostRef}
                className={`${styles.boardHost} ${activeDrag?.id ? styles.boardHostDragging : ''}`}
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
                            className={styles.dropPreview}
                            style={{ ...previewCss, zIndex: 25 }}
                            aria-hidden
                        >
                            {getComponentImage(activeDrag.type) ? (
                                <div className={styles.partInner}>
                                    <img
                                        src={getComponentImage(activeDrag.type)}
                                        alt=""
                                        className={styles.partImgAligned}
                                        draggable={false}
                                    />
                                </div>
                            ) : null}
                        </div>
                    )}
                    {placed.map((comp, index) => {
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
                            problemCode === 'CP.L2.15' &&
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

                        const boxStyle = {
                            ...partStyleToCss(partStyle),
                            zIndex: 10 + index,
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
                                onPointerDown={(e) => {
                                    if (!interactive) return;
                                    e.stopPropagation();
                                    handleInteractivePointerDown(comp, e);
                                }}
                                onPointerUp={(e) => {
                                    if (!interactive) return;
                                    e.stopPropagation();
                                    if (isMomentaryInteractive(comp.type)) {
                                        handleInteractivePointerUp(comp, e);
                                    }
                                }}
                                onPointerCancel={(e) => {
                                    if (!interactive) return;
                                    e.stopPropagation();
                                    if (isMomentaryInteractive(comp.type)) {
                                        handleInteractivePointerUp(comp, e);
                                    }
                                }}
                                onContextMenu={(e) => {
                                    if (interactive) {
                                        e.preventDefault();
                                        return;
                                    }
                                    removeComponent(comp.id, e);
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
                    <button
                        type="button"
                        className={styles.simulateBtn}
                        onClick={handleSimulate}
                        disabled={simulating || submitting || placed.length === 0}
                    >
                        {simulating
                            ? lang === 'ka'
                                ? 'ითვლება...'
                                : 'Running...'
                            : lang === 'ka'
                              ? 'სიმულაცია'
                              : 'Simulate'}
                    </button>
                    {usesCircuitValidation(problemCode) && (
                        <button
                            type="button"
                            className={styles.submitBtn}
                            onClick={handleSubmit}
                            disabled={submitting || simulating || placed.length === 0}
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
