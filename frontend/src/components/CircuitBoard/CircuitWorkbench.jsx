import { useCallback, useEffect, useRef, useState } from 'react';
import { simulateCircuit, validateCircuit } from '../../api';
import { useLang } from '../../context/LangContext';
import { getComponentImage } from '../../constants/componentAssets';
import {
    CAPACITOR_SPECS,
    capacitorType,
    CONNECTOR_LENGTHS,
    connectorType,
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
    getResistorGroupItem,
    getResistorMaxCount,
    getResistorSpec,
    getStandardPaletteItems,
    getTransistorGroupItem,
    getTransistorMaxCount,
    getTransistorSpec,
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
    getTransientSeriesMax,
    getTransientSettleTime,
    getPlacedComponentImage,
    isTransientResult,
    normalizeSimulationResults,
    simulationHasError,
} from '../../utils/componentDisplay';
import {
    buildCircuitJson,
    createInitialSwitchStates,
    isBoardComplete,
    isInteractivePart,
    isMomentaryInteractive,
    isToggleInteractive,
    isSlideSwitchType,
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
    return 'Place: power supply, button, lamp';
}

export default function CircuitWorkbench({ problemCode }) {
    const { lang } = useLang();
    const palette = getPaletteForProblem(problemCode);
    const gridRef = useRef(null);
    const heldButtonIdRef = useRef(null);
    const switchStatesRef = useRef({});
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
    const [simResults, setSimResults] = useState(null);
    const [tranFrameIndex, setTranFrameIndex] = useState(0);
    const tranAnimRef = useRef(null);
    /** Max LED forward current reference for brightness scaling during tran animation. */
    const pressedLedCurrentMaxRef = useRef(null);
    const [ledTranAnimPhase, setLedTranAnimPhase] = useState(null);
    const idleSimResultsRef = useRef(null);

    useEffect(() => {
        switchStatesRef.current = switchStates;
    }, [switchStates]);

    const commitSwitchStates = useCallback((nextStates) => {
        switchStatesRef.current = nextStates;
        setSwitchStates(nextStates);
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
            return max - countPlacedByType(placed, type);
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
            if (used >= max && !ignoreId) {
                setMessage(
                    lang === 'ka'
                        ? 'ამ მნიშვნელობის რეზისტორის ლიმიტი ამოწურულია'
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

        const partId = findPlacedPartIdAt(e.clientX, e.clientY);
        if (!partId) return;

        const comp = placed.find((p) => p.id === partId);
        if (!comp) return;

        if (liveSimMode && isInteractivePart(comp.type)) {
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
        setTranFrameIndex(0);
        if (idleSimResultsRef.current) {
            setSimResults(idleSimResultsRef.current);
        }
    }, []);

    /** End of a CP.L2.3 crossfade: keep final frame (do not snap back to power-on idle). */
    const finishCrossfadeAnimation = useCallback((result) => {
        setLedTranAnimPhase(null);
        const last = Array.isArray(result?.time) ? result.time.length - 1 : 0;
        setTranFrameIndex(Math.max(0, last));
    }, []);

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
            const playUntilSec = keepLastFrame
                ? (getTransientSettleTime(result) ?? simStopSec)
                : simStopSec;
            // Stretch the active transition across a readable wall-clock fade
            // (RC settles in tens of ms; playing the full 4s stop makes fade look instant).
            const durationMs = keepLastFrame
                ? Math.max(2800, Math.min(5000, playUntilSec * 12000))
                : Math.max(3000, simStopSec * 1000);
            const start = performance.now();
            setTranFrameIndex(0);

            const tick = (now) => {
                const progress = Math.min(1, (now - start) / durationMs);
                const targetTime = progress * playUntilSec;
                let idx = 0;
                while (idx < times.length - 1 && times[idx + 1] < targetTime) {
                    idx += 1;
                }
                setTranFrameIndex(idx);
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
                        setTranFrameIndex(times.length - 1);
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
        ]
    );

    const runLiveSimulation = useCallback(
        async (states, options = {}) => {
            const isLive = options.live ?? liveSimMode;
            const simPhase = options.simPhase ?? 'idle';
            const circuitJson = buildCircuitJson(placed, states);

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
                    setTranFrameIndex(0);
                    setMessage(
                        lang === 'ka'
                            ? `სიმულაციის შეცდომა: ${result.error}`
                            : `Simulation error: ${result.error}`
                    );
                } else {
                    if (simPhase === 'idle') {
                        idleSimResultsRef.current = result;
                        pressedLedCurrentMaxRef.current = null;
                    }
                    if (
                        simPhase === 'pressed' &&
                        !isTransientResult(result)
                    ) {
                        rememberPressedLedCurrent(result);
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
                        startTranAnimation(result, animPhase, {
                            // Stretch settle so dip→reclaim (and L2.3 crossfade) is visible.
                            keepLastFrame:
                                crossfade ||
                                (parallelDip && animPhase === 'charge'),
                        });
                    } else {
                        cancelTranAnimation();
                        setLedTranAnimPhase(null);
                        setTranFrameIndex(0);
                    }
                }

                if (!simulationHasError(result) && isLive) {
                    setMessage(
                        usesSwitchCrossfadeSimulation(problemCode)
                            ? lang === 'ka'
                                ? 'დააწკაპუნეთ გადამრთველზე (სლაიდერზე) ფირზე გადასართავად'
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
        ]
    );

    const handleSimulate = async () => {
        const initial = createInitialSwitchStates(placed);
        commitSwitchStates(initial);
        setLiveSimMode(true);
        setMessage('');
        await runLiveSimulation(initial, { live: true, simPhase: 'idle' });
    };

    /** Momentary button: closed only while pointer is held down. */
    const handleInteractivePointerDown = async (comp, e) => {
        if (!liveSimMode || !isInteractivePart(comp.type)) return;
        if (e.button !== 0) return;
        e.stopPropagation();
        e.preventDefault();

        if (isToggleInteractive(comp.type)) {
            const current = switchStatesRef.current[comp.id];
            let next;
            let simPhase;

            if (isSlideSwitchType(comp.type)) {
                const atLeft = (current ?? 'left') !== 'right';
                next = atLeft ? 'right' : 'left';
                // left = green resting side; right = red side (pressed / discharge phases)
                simPhase = next === 'right' ? 'pressed' : 'discharge';
            } else {
                const isClosed = current === 'closed';
                next = isClosed ? 'open' : 'closed';
                simPhase = next === 'closed' ? 'pressed' : 'discharge';
            }

            const nextStates = {
                ...switchStatesRef.current,
                [comp.id]: next,
            };
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
            setTranFrameIndex(0);
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
        if (!isBoardComplete(placed, problemCode)) {
            setSubmitStatus('fail');
            setMessage(incompleteBoardMessage(problemCode, lang));
            return;
        }

        const circuitJson = buildCircuitJson(placed);
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
                        ? problemCode === 'ST.L2.4' || problemCode === 'ST.L2.10'
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
                                : problemCode === 'LR.L2.5'
                                  ? lang === 'ka'
                                      ? 'სიმულაციის რეჟიმი: ჩართეთ ჩამრთველი (ON); ერთი ღილაკი — ნათურა, მეორე — LED.'
                                      : 'Simulation mode: turn the switch ON; one button lights the lamp, the other the LED.'
                                  : problemCode === 'ST.L1.3' ||
                                      problemCode === 'ST.L1.8' ||
                                      problemCode === 'ST.L2.9' ||
                                      problemCode === 'LR.L1.1' ||
                                      problemCode === 'LR.L1.2' ||
                                      problemCode === 'LR.L1.3' ||
                                      problemCode === 'LR.L2.4'
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
                        const frameIndex = isTransientResult(simResults)
                            ? tranFrameIndex
                            : 0;
                        const isChargeTranResult =
                            simResults?.simPhase === 'pressed' && switchClosed;
                        const switchCrossfade =
                            usesSwitchCrossfadeSimulation(problemCode) &&
                            isLedType(comp.type) &&
                            isTransientResult(simResults);
                        let isLedTranFade = false;
                        let ledBrightnessDirection = 'discharge';
                        let ledBrightnessRatio;

                        if (switchCrossfade) {
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
                            // Discharge must scale from the start current so fade
                            // begins fully lit; charge scales from the series peak.
                            const peak = Math.max(
                                seriesPeak ?? 0,
                                i0,
                                iLast
                            );
                            if (peak > 0) {
                                isLedTranFade = true;
                                ledBrightnessDirection =
                                    iLast > i0 ? 'charge' : 'discharge';
                                ledBrightnessRatio = getLedBrightnessRatio(
                                    simResults,
                                    spiceComponentId,
                                    frameIndex,
                                    peak,
                                    ledBrightnessDirection
                                );
                            }
                        } else {
                            isLedTranFade =
                                isLedType(comp.type) &&
                                isTransientResult(simResults) &&
                                pressedLedCurrentMaxRef.current &&
                                (ledTranAnimPhase === 'charge' ||
                                    ledTranAnimPhase === 'discharge' ||
                                    isChargeTranResult);
                            ledBrightnessDirection =
                                ledTranAnimPhase === 'charge' ||
                                isChargeTranResult
                                    ? 'charge'
                                    : 'discharge';
                            ledBrightnessRatio = isLedTranFade
                                ? getLedBrightnessRatio(
                                      simResults,
                                      spiceComponentId,
                                      frameIndex,
                                      pressedLedCurrentMaxRef.current,
                                      ledBrightnessDirection
                                  )
                                : undefined;
                        }
                        const img = getPlacedComponentImage(comp.type, {
                            liveSimMode,
                            switchClosed,
                            slideState: slideState ?? undefined,
                            simOk,
                            simResults,
                            spiceId: spiceComponentId,
                            tranFrameIndex: frameIndex,
                            ledBrightnessRatio,
                            voltage: getComponentVoltage(
                                simResults,
                                spiceComponentId,
                                frameIndex
                            ),
                        });
                        if (!partStyle) return null;

                        const interactive =
                            liveSimMode && isInteractivePart(comp.type);

                        const boxStyle = {
                            ...partStyleToCss(partStyle),
                            zIndex: 10 + index,
                        };

                        const baseLedImg = isLedTranFade
                            ? getComponentImage(comp.type)
                            : null;
                        const glowLedImg = isLedTranFade
                            ? getPlacedComponentImage(comp.type, {
                                  liveSimMode: true,
                                  simOk: true,
                                  dischargeFading: true,
                                  spiceId: spiceComponentId,
                                  tranFrameIndex: frameIndex,
                              })
                            : null;

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
                                    interactive
                                        ? isToggleInteractive(comp.type)
                                            ? 'switch'
                                            : 'button'
                                        : undefined
                                }
                                tabIndex={interactive ? 0 : undefined}
                                aria-checked={
                                    interactive && isToggleInteractive(comp.type)
                                        ? switchClosed
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
                                            : isToggleInteractive(comp.type)
                                              ? `${getLabel(comp.type)} — ${switchClosed ? (lang === 'ka' ? 'ჩართული' : 'on') : lang === 'ka' ? 'გამორთული' : 'off'}`
                                              : getLabel(comp.type)
                                        : undefined
                                }
                            >
                                <div
                                    className={
                                        isLedTranFade
                                            ? `${styles.partInner} ${styles.partInnerLedFade}`
                                            : styles.partInner
                                    }
                                >
                                    {isLedTranFade &&
                                    baseLedImg &&
                                    glowLedImg ? (
                                        <>
                                            <img
                                                src={baseLedImg}
                                                alt=""
                                                aria-hidden
                                                className={styles.partImgAligned}
                                                draggable={false}
                                            />
                                            <img
                                                src={glowLedImg}
                                                alt=""
                                                aria-hidden
                                                className={styles.ledGlowOverlay}
                                                style={{
                                                    opacity: ledBrightnessRatio,
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
                                </div>
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
