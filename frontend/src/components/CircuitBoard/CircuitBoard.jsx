import { Fragment } from 'react';
import styles from './CircuitBoard.module.css';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const COLS = Array.from({ length: 10 }, (_, i) => i + 1);
const SNAP_COLS = 9;

/** Pin columns: 1, 3, 5, … 19 */
const pinCol = (index) => index * 2 + 1;
/** Snap columns between pins: 2, 4, 6, … 18 */
const snapCol = (index) => index * 2 + 2;

export default function CircuitBoard({ label }) {
    return (
        <div className={styles.wrapper}>
            <div className={styles.boardArea}>
                <div className={styles.rowLabels}>
                    {ROWS.map((row, rowIndex) => (
                        <Fragment key={row}>
                            <span className={styles.rowLabel}>{row}</span>
                            {rowIndex < ROWS.length - 1 && (
                                <span className={styles.rowLabelSpacer} aria-hidden />
                            )}
                        </Fragment>
                    ))}
                </div>

                <div className={styles.gridWrap}>
                    <div className={styles.colLabels}>
                        {COLS.map((col, i) => (
                            <span
                                key={col}
                                className={styles.colLabel}
                                style={{ gridColumn: pinCol(i) }}
                            >
                                {col}
                            </span>
                        ))}
                    </div>

                    <div className={styles.grid} role="grid" aria-label="Circuit board">
                        {ROWS.map((row, rowIndex) => (
                            <Fragment key={row}>
                                <div className={styles.pinRow} role="row">
                                    {COLS.map((col, colIndex) => (
                                        <span
                                            key={`${row}${col}`}
                                            className={styles.pin}
                                            style={{ gridColumn: pinCol(colIndex) }}
                                            data-pin={`${row}${col}`}
                                            role="gridcell"
                                            aria-label={`Pin ${row}${col}`}
                                        />
                                    ))}
                                </div>

                                {rowIndex < ROWS.length - 1 && (
                                    <div className={styles.circleRow} aria-hidden>
                                        {Array.from({ length: SNAP_COLS }, (_, i) => (
                                            <span
                                                key={`${row}-snap-${i}`}
                                                className={styles.snapCircle}
                                                style={{ gridColumn: snapCol(i) }}
                                                data-snap={`${row}${COLS[i]}-${ROWS[rowIndex + 1]}${COLS[i + 1]}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {label && <p className={styles.label}>{label}</p>}
        </div>
    );
}
