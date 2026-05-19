import { useCallback, useEffect, useRef, useState } from 'react';
import { simulateCircuit, validateCircuit } from '../../api';
import { useLang } from '../../context/LangContext';
import { getComponentImage } from '../../constants/componentAssets';
import { getPaletteForProblem } from '../../constants/componentCatalog';
import { getRotatedFootprint, normalizeRotation } from '../../constants/componentRotation';
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

export default function CircuitWorkbench({ problemCode }) {
    const { lang } = useLang();
    const palette = getPaletteForProblem(problemCode);
    const gridRef = useRef(null);
    const heldButtonIdRef = useRef(null);
    const switchStatesRef = useRef({});

    const [placed, setPlaced] = useState([]);
    const [paletteRotations, setPaletteRotations] = useState({});
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
            if (!def) return type;
            return lang === 'ka' ? def.labelKa : def.labelEn;
        },
        [palette, lang]
    );

    const remaining = (type) => {
        const def = palette?.find((p) => p.type === type);
        if (!def) return 0;
        return def.maxCount - countPlacedByType(placed, type);
    };

    const tryPlace = (type, row, col, rotation, ignoreId = null) => {
        const def = palette?.find((p) => p.type === type);
        const used = countPlacedByType(placed, type);
        if (def && used >= def.maxCount && !ignoreId) {
            setMessage(
                lang === 'ka'
                    ? 'ამ დეტალის ლიმიტი ამოწურულია'
                    : 'No more of this component allowed'
            );
            return false;
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
                          ? '↻ — შებრუნება სიაში, შემდეგ გადაიტანეთ ფირზე. მარჯვენა ღილაკი — წაშლა.'
                          : 'Click ↻ to rotate in the list, then drag onto the board. Right-click to remove.'}
                </p>
                <div className={styles.paletteItems}>
                    {palette.map((item) => {
                        const left = remaining(item.type);
                        const img = getComponentImage(item.type);
                        const rotation = getPaletteRotation(item.type);
                        return (
                            <div key={item.type} className={styles.paletteCard}>
                                <button
                                    type="button"
                                    className={styles.rotateBtn}
                                    title={
                                        lang === 'ka'
                                            ? 'შებრუნება 90°'
                                            : 'Rotate 90°'
                                    }
                                    onClick={(e) =>
                                        cyclePaletteRotation(item.type, e)
                                    }
                                >
                                    ↻
                                    <span className={styles.rotateDeg}>
                                        {rotation}°
                                    </span>
                                </button>
                                <div
                                    className={`${styles.paletteItem} ${left <= 0 ? styles.paletteItemDisabled : ''}`}
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
                                    <div className={styles.palettePreview}>
                                        {img ? (
                                            <img
                                                src={img}
                                                alt=""
                                                className={styles.paletteImg}
                                                style={{
                                                    transform: `rotate(${rotation}deg)`,
                                                }}
                                                draggable={false}
                                            />
                                        ) : (
                                            <span
                                                className={styles.paletteFallback}
                                            >
                                                {getLabel(item.type).slice(0, 2)}
                                            </span>
                                        )}
                                    </div>
                                    <span className={styles.paletteLabel}>
                                        {lang === 'ka'
                                            ? item.labelKa
                                            : item.labelEn}
                                    </span>
                                    <span className={styles.paletteCount}>
                                        ×{left}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
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
