import { useCallback, useRef, useState } from 'react';
import { useLang } from '../../context/LangContext';
import { getComponentImage } from '../../constants/componentAssets';
import {
    COMPONENT_TYPES,
    getFootprint,
    getPaletteForProblem,
} from '../../constants/componentCatalog';
import {
    canPlaceAt,
    countPlacedByType,
    createComponentId,
} from '../CircuitSimulator/circuitUtils';
import CircuitBoard from './CircuitBoard';
import {
    getPartStyle,
    getFootprintStyle,
    parseDragPayload,
    pointerToPin,
    setDragPayload,
} from './boardPlacement';
import styles from './CircuitWorkbench.module.css';

export default function CircuitWorkbench({ problemCode }) {
    const { lang } = useLang();
    const palette = getPaletteForProblem(problemCode);
    const gridRef = useRef(null);

    const [placed, setPlaced] = useState([]);
    const [message, setMessage] = useState('');
    const [activeDrag, setActiveDrag] = useState(null);
    const [hoverPin, setHoverPin] = useState(null);

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

    const tryPlace = (type, row, col, wireLength, ignoreId = null) => {
        if (type !== COMPONENT_TYPES.WIRE) {
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
        }

        if (!canPlaceAt(type, row, col, wireLength, placed, ignoreId)) {
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
        setDragPayload(e.dataTransfer, { source: 'palette', type });
    };

    const handlePlacedDragStart = (e, comp) => {
        setDragPayload(e.dataTransfer, {
            source: 'board',
            id: comp.id,
            type: comp.type,
            wireLength: comp.wireLength,
        });
        setActiveDrag({ id: comp.id, type: comp.type });
    };

    const handleDragEnd = () => {
        setActiveDrag(null);
        setHoverPin(null);
    };

    const handleBoardDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const pin = pointerToPin(e.clientX, e.clientY, gridRef.current);
        setHoverPin(pin);
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
        const { type, wireLength } = payload;

        if (payload.source === 'board' && payload.id) {
            const existing = placed.find((p) => p.id === payload.id);
            if (!existing) return;
            if (
                !tryPlace(type, row, col, wireLength, payload.id) ||
                (existing.row === row && existing.col === col)
            ) {
                return;
            }
            setPlaced((prev) =>
                prev.map((p) =>
                    p.id === payload.id ? { ...p, row, col } : p
                )
            );
            return;
        }

        if (!tryPlace(type, row, col, wireLength)) return;

        setPlaced((prev) => [
            ...prev,
            {
                id: createComponentId(),
                type,
                row,
                col,
                wireLength: type === COMPONENT_TYPES.WIRE ? wireLength : undefined,
            },
        ]);
    };

    const removeComponent = (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        setPlaced((prev) => prev.filter((p) => p.id !== id));
        setMessage('');
    };

    if (!palette) return null;

    const previewComp = activeDrag
        ? { type: activeDrag.type, row: hoverPin?.row ?? 0, col: hoverPin?.col ?? 0 }
        : null;

    // Use footprint bounds (pin occupancy) for the drop preview, not the art
    // bounds — so the dashed outline always shows exactly the pins that will
    // be occupied, regardless of how large the component image is.
    const previewStyle =
        previewComp && hoverPin
            ? getFootprintStyle(
                  gridRef.current,
                  hoverPin.row,
                  hoverPin.col,
                  getFootprint(previewComp.type).w,
                  getFootprint(previewComp.type).h
              )
            : null;

    return (
        <div className={styles.workbench}>
            <aside className={styles.palette}>
                <h2 className={styles.paletteTitle}>
                    {lang === 'ka' ? 'დეტალები' : 'Components'}
                </h2>
                <div className={styles.paletteItems}>
                    {palette.map((item) => {
                        const left = remaining(item.type);
                        const img = getComponentImage(item.type);
                        return (
                            <button
                                key={item.type}
                                type="button"
                                className={styles.paletteItem}
                                draggable={left > 0}
                                disabled={left <= 0}
                                onDragStart={(e) =>
                                    handlePaletteDragStart(e, item.type)
                                }
                                onDragEnd={handleDragEnd}
                            >
                                {img ? (
                                    <img
                                        src={img}
                                        alt=""
                                        className={styles.paletteImg}
                                        draggable={false}
                                    />
                                ) : (
                                    <span className={styles.paletteFallback}>
                                        {getLabel(item.type).slice(0, 2)}
                                    </span>
                                )}
                                <span className={styles.paletteLabel}>
                                    {lang === 'ka' ? item.labelKa : item.labelEn}
                                </span>
                                <span className={styles.paletteCount}>×{left}</span>
                            </button>
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
                    {previewStyle && activeDrag && (
                        <div
                            className={styles.dropPreview}
                            style={previewStyle}
                            aria-hidden
                        />
                    )}
                    {placed.map((comp, index) => {
                        const { w, h } = getFootprint(comp.type, comp.wireLength);
                        const partStyle = getPartStyle(
                            gridRef.current,
                            comp.row,
                            comp.col,
                            w,
                            h,
                            comp.type
                        );
                        const img = getComponentImage(comp.type);
                        if (!partStyle) return null;

                        return (
                            <div
                                key={comp.id}
                                className={`${styles.placedPart} ${activeDrag?.id === comp.id ? styles.placedPartDragging : ''}`}
                                style={{ ...partStyle, zIndex: 10 + index }}
                                draggable
                                onDragStart={(e) => handlePlacedDragStart(e, comp)}
                                onDragEnd={handleDragEnd}
                                onContextMenu={(e) => removeComponent(comp.id, e)}
                            >
                                {img ? (
                                    <img
                                        src={img}
                                        alt={getLabel(comp.type)}
                                        className={styles.partImg}
                                        draggable={false}
                                    />
                                ) : (
                                    <span className={styles.partFallback}>
                                        {getLabel(comp.type)}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </CircuitBoard>
            </div>

            {message && <p className={styles.message}>{message}</p>}
        </div>
    );
}
