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
    getLedSpec,
    getPaletteForProblem,
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
    buildCircuitJson,
    createInitialSwitchStates,
    isBoardComplete,
    isInteractivePart,
} from '../../utils/circuitNetlist';
import {
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

function isWidePalettePart(type) {
    const { w, h } = getFootprint(type);
    return w > h;
}

export default function CircuitWorkbench({ problemCode }) {
    const { lang } = useLang();
    const palette = getPaletteForProblem(problemCode);
    const gridRef = useRef(null);
    const heldButtonIdRef = useRef(null);
    const switchStatesRef = useRef({});

    const [placed, setPlaced] = useState([]);
    const [paletteRotations, setPaletteRotations] = useState({});
    const [connectorLength, setConnectorLength] = useState(3);
    const [resistorKey, setResistorKey] = useState('100o');
    const [capacitorKey, setCapacitorKey] = useState('10uf');
    const [ledColor, setLedColor] = useState('red');
    const [transistorKey, setTransistorKey] = useState('q1');
    const [message, setMessage] = useState('');
    const [simulating, setSimulating] = useState(false);
    const [liveSimMode, setLiveSimMode] = useState(false);
    const [switchStates, setSwitchStates] = useState({});

    useEffect(() => {
        switchStatesRef.current = switchStates;
    }, [switchStates]);
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [activeDrag, setActiveDrag] = useState(null);
    const [hoverPin, setHoverPin] = useState(null);

    useEffect(() => {
        setLiveSimMode(false);
        setSwitchStates({});
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
            const max = getLedMaxCount(palette);
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
            const max = getLedMaxCount(palette);
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
        setActiveDrag({ type, rotation });
        setDragPayload(e.dataTransfer, { source: 'palette', type, rotation });
        setTransparentDragGhost(e.dataTransfer);
    };

    const handlePlacedDragStart = (e, comp) => {
        const len = parseConnectorLength(comp.type);
        if (len !== null) setConnectorLength(len);
        const rKey = parseResistorKey(comp.type);
        if (rKey !== null) setResistorKey(rKey);
        const lKey = parseLedKey(comp.type);
        if (lKey !== null) setLedColor(lKey);
        const cKey = parseCapacitorKey(comp.type);
        if (cKey !== null) setCapacitorKey(cKey);
        const tKey = parseTransistorKey(comp.type);
        if (tKey !== null) setTransistorKey(tKey);

        const rotation = comp.rotation ?? 0;
        setDragPayload(e.dataTransfer, {
            source: 'board',
            id: comp.id,
            type: comp.type,
            rotation,
        });
        setActiveDrag({ id: comp.id, type: comp.type, rotation });
        setTransparentDragGhost(e.dataTransfer);
    };

    const handleDragEnd = () => {
        setActiveDrag(null);
        setHoverPin(null);
    };

    const handleBoardDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setHoverPin(pointerToPin(e.clientX, e.clientY, gridRef.current));
    };

    const handleBoardDragLeave = () => {
        setHoverPin(null);
    };

    const handleBoardDrop = (e) => {
        e.preventDefault();
        const pin = pointerToPin(e.clientX, e.clientY, gridRef.current);
        setHoverPin(null);
        setActiveDrag(null);

        if (!pin) return;

        const payload = parseDragPayload(e.dataTransfer);
        if (!payload?.type) return;

        const { row, col } = pin;
        const { type } = payload;
        const rotation = payload.rotation ?? 0;

        if (payload.source === 'board' && payload.id) {
            const existing = placed.find((p) => p.id === payload.id);
            if (!existing) return;
            if (
                !tryPlace(type, row, col, rotation, payload.id) ||
                (existing.row === row &&
                    existing.col === col &&
                    (existing.rotation ?? 0) === rotation)
            ) {
                return;
            }
            setPlaced((prev) =>
                prev.map((p) =>
                    p.id === payload.id ? { ...p, row, col, rotation } : p
                )
            );
            return;
        }

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

    const runLiveSimulation = useCallback(
        async (states, logLabel) => {
            const circuitJson = buildCircuitJson(placed, states);
            console.log(
                logLabel ?? 'Circuit JSON sent to backend:',
                circuitJson
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
                const result = await simulateCircuit(circuitJson);
                console.log(
                    logLabel
                        ? `Simulation (${logLabel}):`
                        : 'Simulation result:',
                    result
                );

                if (result.error) {
                    setMessage(
                        lang === 'ka'
                            ? `სიმულაციის შეცდომა: ${result.error}`
                            : `Simulation error: ${result.error}`
                    );
                } else if (liveSimMode || logLabel) {
                    setMessage(
                        lang === 'ka'
                            ? 'დააჭირეთ და არ გაუშვათ ღილაკი ფირზე — შედეგი კონსოლში (F12)'
                            : 'Press and hold the button on the board — results in console (F12)'
                    );
                } else {
                    setMessage(
                        lang === 'ka'
                            ? 'სიმულაცია დასრულდა — შედეგი კონსოლშია (F12)'
                            : 'Simulation done — see browser console (F12)'
                    );
                }
            } catch (err) {
                console.error('Simulation request failed:', err);
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
        [placed, lang, liveSimMode]
    );

    const handleSimulate = async () => {
        const initial = createInitialSwitchStates(placed);
        setSwitchStates(initial);
        setLiveSimMode(true);
        setMessage('');
        await runLiveSimulation(
            initial,
            'initial (switches released / open)'
        );
    };

    /** Momentary button: closed only while pointer is held down. */
    const handleInteractivePointerDown = async (comp, e) => {
        if (!liveSimMode || !isInteractivePart(comp.type)) return;
        if (e.button !== 0) return;
        e.stopPropagation();
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        heldButtonIdRef.current = comp.id;

        const nextStates = {
            ...switchStatesRef.current,
            [comp.id]: 'closed',
        };
        setSwitchStates(nextStates);
        await runLiveSimulation(nextStates, 'button pressed');
    };

    const handleInteractivePointerUp = async (comp, e) => {
        if (!liveSimMode || heldButtonIdRef.current !== comp.id) return;
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
        setSwitchStates(nextStates);
        await runLiveSimulation(nextStates, 'button released');
    };

    const handleSubmit = async () => {
        if (!isBoardComplete(placed, palette)) {
            setSubmitStatus('fail');
            setMessage(
                lang === 'ka'
                    ? 'განათავსეთ ყველა საჭირო დეტალი (კვება, ღილაკი, ნათურა)'
                    : 'Place all required parts (supply, button, lamp)'
            );
            return;
        }

        const circuitJson = buildCircuitJson(placed);
        setSubmitting(true);
        setSubmitStatus(null);
        setMessage('');

        try {
            const result = await validateCircuit(problemCode, circuitJson);
            console.log('Validation result:', result);

            setSubmitStatus(result.passed ? 'pass' : 'fail');
            setMessage(
                lang === 'ka'
                    ? result.messageKa ?? result.message
                    : result.message
            );
        } catch (err) {
            console.error('Validation failed:', err);
            setSubmitStatus('fail');
            const detail = err?.message ?? String(err);
            setMessage(
                lang === 'ka' ? `შეცდომა: ${detail}` : `Error: ${detail}`
            );
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
    const previewFootprint =
        activeDrag && hoverPin
            ? getRotatedFootprint(activeDrag.type, previewRotation)
            : null;

    const previewPartStyle =
        activeDrag && hoverPin && previewFootprint
            ? getPartStyle(
                  gridRef.current,
                  hoverPin.row,
                  hoverPin.col,
                  previewFootprint.w,
                  previewFootprint.h,
                  activeDrag.type,
                  previewRotation
              )
            : null;

    const previewCss = previewPartStyle
        ? partStyleToCss(previewPartStyle)
        : null;

    return (
        <div className={styles.workbench}>
            <aside className={styles.palette}>
                <div className={styles.paletteHeader}>
                    <h2 className={styles.paletteTitle}>
                        {lang === 'ka' ? 'დეტალები' : 'Components'}
                    </h2>
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
                </div>
                <p className={styles.paletteHint}>
                    {liveSimMode
                        ? lang === 'ka'
                            ? 'სიმულაციის რეჟიმი: დააჭირეთ და არ გაუშვათ ღილაკი (როგორც ნამდვილ ღილაკზე).'
                            : 'Simulation mode: press and hold the button (release to open).'
                        : lang === 'ka'
                          ? '↻ — შებრუნება, შემდეგ გადაიტანეთ ფირზე. მარჯვენა ღილაკი — წაშლა.'
                        : '↻ to rotate, then drag onto the board. Right-click to remove.'}
                </p>
                <div className={styles.paletteItems}>
                    {standardPalette.map(renderPaletteCard)}
                    {renderConnectorCard()}
                    {renderResistorCard()}
                    {renderCapacitorCard()}
                    {renderTransistorCard()}
                    {renderLedCard()}
                </div>
            </aside>

            <div
                className={styles.boardHost}
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
                        const img = getComponentImage(comp.type);
                        if (!partStyle) return null;

                        const interactive =
                            liveSimMode && isInteractivePart(comp.type);
                        const isPressed =
                            interactive &&
                            switchStates[comp.id] === 'closed';

                        const boxStyle = {
                            ...partStyleToCss(partStyle),
                            zIndex: 10 + index,
                        };

                        return (
                            <div
                                key={comp.id}
                                className={`${styles.placedPart} ${activeDrag?.id === comp.id ? styles.placedPartDragging : ''} ${interactive ? styles.placedPartInteractive : ''} ${isPressed ? styles.placedPartPressed : ''}`}
                                style={boxStyle}
                                draggable={!interactive}
                                onDragStart={(e) => {
                                    if (interactive) {
                                        e.preventDefault();
                                        return;
                                    }
                                    handlePlacedDragStart(e, comp);
                                }}
                                onDragEnd={handleDragEnd}
                                onPointerDown={
                                    interactive
                                        ? (e) =>
                                              handleInteractivePointerDown(
                                                  comp,
                                                  e
                                              )
                                        : undefined
                                }
                                onPointerUp={
                                    interactive
                                        ? (e) =>
                                              handleInteractivePointerUp(
                                                  comp,
                                                  e
                                              )
                                        : undefined
                                }
                                onPointerCancel={
                                    interactive
                                        ? (e) =>
                                              handleInteractivePointerUp(
                                                  comp,
                                                  e
                                              )
                                        : undefined
                                }
                                onContextMenu={(e) => {
                                    if (interactive) {
                                        e.preventDefault();
                                        return;
                                    }
                                    removeComponent(comp.id, e);
                                }}
                                role={interactive ? 'button' : undefined}
                                tabIndex={interactive ? 0 : undefined}
                                aria-pressed={
                                    interactive ? isPressed : undefined
                                }
                            >
                                <div className={styles.partInner}>
                                    {img ? (
                                        <img
                                            src={img}
                                            alt={getLabel(comp.type)}
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

            {message && (
                <p
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
    );
}
