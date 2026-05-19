import { useCallback, useRef, useState } from 'react';
import { useLang } from '../../context/LangContext';
import { getComponentImage } from '../../constants/componentAssets';
import { getPaletteForProblem } from '../../constants/componentCatalog';
import { getRotatedFootprint, normalizeRotation } from '../../constants/componentRotation';
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
    const [paletteRotations, setPaletteRotations] = useState({});
    const [message, setMessage] = useState('');
    const [activeDrag, setActiveDrag] = useState(null);
    const [hoverPin, setHoverPin] = useState(null);

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

    if (!palette) return null;

    const previewRotation = activeDrag?.rotation ?? 0;
    const previewFootprint =
        activeDrag && hoverPin
            ? getRotatedFootprint(activeDrag.type, previewRotation)
            : null;

    const previewStyle =
        previewFootprint && hoverPin
            ? getFootprintStyle(
                  gridRef.current,
                  hoverPin.row,
                  hoverPin.col,
                  previewFootprint.w,
                  previewFootprint.h
              )
            : null;

    return (
        <div className={styles.workbench}>
            <aside className={styles.palette}>
                <h2 className={styles.paletteTitle}>
                    {lang === 'ka' ? 'დეტალები' : 'Components'}
                </h2>
                <p className={styles.paletteHint}>
                    {lang === 'ka'
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
                    {previewStyle && activeDrag && (
                        <div
                            className={styles.dropPreview}
                            style={previewStyle}
                            aria-hidden
                        />
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

                        const rotDeg = partStyle.rotation ?? 0;
                        const boxStyle = {
                            left: partStyle.left,
                            top: partStyle.top,
                            width: partStyle.width,
                            height: partStyle.height,
                            zIndex: 10 + index,
                            ...(rotDeg
                                ? {
                                      transform: `rotate(${rotDeg}deg)`,
                                      transformOrigin:
                                          partStyle.transformOrigin ??
                                          'center center',
                                  }
                                : {}),
                        };

                        return (
                            <div
                                key={comp.id}
                                className={`${styles.placedPart} ${activeDrag?.id === comp.id ? styles.placedPartDragging : ''}`}
                                style={boxStyle}
                                draggable
                                onDragStart={(e) =>
                                    handlePlacedDragStart(e, comp)
                                }
                                onDragEnd={handleDragEnd}
                                onContextMenu={(e) =>
                                    removeComponent(comp.id, e)
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

            {message && <p className={styles.message}>{message}</p>}
        </div>
    );
}
