import { Fragment, useMemo, useState } from 'react';
import { useLang } from '../../context/LangContext';
import { BOARD_COLS, BOARD_ROWS } from '../../constants/circuitGrid';
import {
    CONNECTOR_LENGTHS,
    connectorType,
    getFootprint,
    getPaletteForProblem,
    parseConnectorLength,
} from '../../constants/componentCatalog';
import {
    canPlaceAt,
    cellKey,
    countPlacedByType,
    createComponentId,
    getOccupiedCells,
} from './circuitUtils';
import styles from './CircuitSimulator.module.css';

export default function CircuitSimulator({ problemCode }) {
    const { lang } = useLang();
    const palette = getPaletteForProblem(problemCode);

    const [placed, setPlaced] = useState([]);
    const [selected, setSelected] = useState(null);
    const [message, setMessage] = useState('');

    const occupied = useMemo(() => getOccupiedCells(placed), [placed]);

    if (!palette) {
        return null;
    }

    const partsPalette = palette.filter((p) => parseConnectorLength(p.type) === null);
    const connectorsPalette = palette.filter((p) => parseConnectorLength(p.type) !== null);

    const selectItem = (item) => {
        setSelected(item);
        setMessage('');
    };

    const tryPlace = (row, col) => {
        if (!selected) {
            setMessage(lang === 'ka' ? 'ჯერ აირჩიე დეტალი' : 'Select a component first');
            return;
        }

        const { type } = selected;

        const used = countPlacedByType(placed, type);
        const def = palette.find((p) => p.type === type);
        if (def && used >= def.maxCount) {
            setMessage(
                lang === 'ka'
                    ? 'ამ დეტალის ლიმიტი ამოწურულია'
                    : 'No more of this component allowed'
            );
            return;
        }

        if (!canPlaceAt(type, row, col, placed)) {
            setMessage(
                lang === 'ka'
                    ? 'აქ განთავსება არ ხერხდება'
                    : 'Cannot place here'
            );
            return;
        }

        setPlaced((prev) => [
            ...prev,
            {
                id: createComponentId(),
                type,
                row,
                col,
            },
        ]);
        setMessage('');
        if (parseConnectorLength(type) === null) {
            setSelected(null);
        }
    };

    const removeComponent = (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        setPlaced((prev) => prev.filter((p) => p.id !== id));
        setMessage('');
    };

    const getLabel = (type) => {
        const def = palette.find((p) => p.type === type);
        if (!def) return type;
        return lang === 'ka' ? def.labelKa : def.labelEn;
    };

    const remaining = (type) => {
        const def = palette.find((p) => p.type === type);
        if (!def) return 0;
        return def.maxCount - countPlacedByType(placed, type);
    };

    return (
        <div className={styles.workspace}>
            <aside className={styles.palette}>
                <h2 className={styles.paletteTitle}>
                    {lang === 'ka' ? 'დეტალები' : 'Components'}
                </h2>

                <div className={styles.paletteGroup}>
                    {partsPalette.map((item) => {
                        const left = remaining(item.type);
                        const isActive = selected?.type === item.type;
                        const { w, h } = getFootprint(item.type);
                        return (
                            <button
                                key={item.type}
                                type="button"
                                className={`${styles.paletteItem} ${isActive ? styles.paletteItemActive : ''}`}
                                disabled={left <= 0}
                                onClick={() => selectItem({ type: item.type })}
                            >
                                <span className={styles.paletteLabel}>
                                    {lang === 'ka' ? item.labelKa : item.labelEn}
                                </span>
                                <span className={styles.paletteMeta}>
                                    {w}×{h} · {left}/{item.maxCount}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <h3 className={styles.wireTitle}>
                    {lang === 'ka' ? 'გამტარები' : 'Connectors'}
                </h3>
                <div className={styles.wireGrid}>
                    {CONNECTOR_LENGTHS.map((len) => {
                        const type = connectorType(len);
                        const def = connectorsPalette.find((p) => p.type === type);
                        if (!def) return null;
                        const left = remaining(type);
                        const isActive = selected?.type === type;
                        return (
                            <button
                                key={type}
                                type="button"
                                className={`${styles.wireBtn} ${isActive ? styles.paletteItemActive : ''}`}
                                disabled={left <= 0}
                                onClick={() => selectItem({ type })}
                            >
                                {lang === 'ka' ? def.labelKa : def.labelEn}
                            </button>
                        );
                    })}
                </div>
                <p className={styles.paletteHint}>
                    {lang === 'ka'
                        ? 'აირჩიე დეტალი და დააწკაპუნე ფირსზე. მარჯვენა ღილაკი დეტალზე — წაშლა.'
                        : 'Select a part, click a pin to place. Right-click a part to remove.'}
                </p>
            </aside>

            <div className={styles.boardWrap}>
                {message && <p className={styles.feedback}>{message}</p>}

                <div className={styles.board}>
                    <div className={styles.corner} />
                    {BOARD_COLS.map((col) => (
                        <div key={`h-${col}`} className={styles.colLabel}>
                            {col}
                        </div>
                    ))}

                    {BOARD_ROWS.map((rowLabel, row) => (
                        <Fragment key={rowLabel}>
                            <div className={styles.rowLabel}>{rowLabel}</div>
                            {BOARD_COLS.map((col, colIndex) => {
                                const key = cellKey(row, colIndex);
                                const isOccupied = occupied.has(key);
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        className={`${styles.cell} ${isOccupied ? styles.cellOccupied : ''}`}
                                        onClick={() => tryPlace(row, colIndex)}
                                        aria-label={`${rowLabel}${col}`}
                                    >
                                        <span className={styles.pin} />
                                    </button>
                                );
                            })}
                        </Fragment>
                    ))}

                    {placed.map((comp) => {
                        const { w, h } = getFootprint(comp.type);
                        return (
                            <button
                                key={comp.id}
                                type="button"
                                className={styles.placedPart}
                                style={{
                                    gridColumn: `${comp.col + 2} / span ${w}`,
                                    gridRow: `${comp.row + 2} / span ${h}`,
                                }}
                                onContextMenu={(e) => removeComponent(comp.id, e)}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span className={styles.placedLabel}>
                                    {getLabel(comp.type)}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
