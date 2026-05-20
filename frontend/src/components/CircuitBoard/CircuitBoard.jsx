import { Fragment } from 'react';
import { BOARD_IMAGE } from '../../constants/componentAssets';
import { DOT_COL_X, DOT_ROW_Y } from './boardLayout';
import styles from './CircuitBoard.module.css';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const COLS = Array.from({ length: 10 }, (_, i) => i + 1);
const SNAP_COLS = 9;

const pinCol = (index) => index * 2 + 1;
const snapCol = (index) => index * 2 + 2;

function SimulatorDotGrid() {
    return ROWS.map((row, rowIndex) =>
        COLS.map((col, colIndex) => (
            <span
                key={`${row}${col}`}
                className={styles.hitPin}
                data-pin={`${row}${col}`}
                style={{
                    left: `${DOT_COL_X[colIndex] * 100}%`,
                    top: `${DOT_ROW_Y[rowIndex] * 100}%`,
                }}
                role="gridcell"
                aria-label={`Pin ${row}${col}`}
            />
        ))
    );
}

function GridPins({ simulator }) {
    if (simulator) {
        return <SimulatorDotGrid />;
    }

    return ROWS.map((row, rowIndex) => (
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
    ));
}

export default function CircuitBoard({ label, gridRef, children, simulator = false }) {
    if (simulator) {
        return (
            <div className={styles.wrapperSimulator}>
                <div className={styles.simulatorWithLabels}>
                    <div className={styles.boardAndRowLabels}>
                        <div className={styles.simRowLabels} aria-hidden>
                            {ROWS.map((row, rowIndex) => (
                                <span
                                    key={row}
                                    className={styles.simRowLabel}
                                    style={{
                                        top: `${DOT_ROW_Y[rowIndex] * 100}%`,
                                    }}
                                >
                                    {row}
                                </span>
                            ))}
                        </div>

                        <div className={styles.boardStage} data-board-stage>
                            <div className={styles.simColLabels} aria-hidden>
                                {COLS.map((col, colIndex) => (
                                    <span
                                        key={col}
                                        className={styles.simColLabel}
                                        style={{
                                            left: `${DOT_COL_X[colIndex] * 100}%`,
                                        }}
                                    >
                                        {col}
                                    </span>
                                ))}
                            </div>

                            <img
                                src={BOARD_IMAGE}
                                className={styles.boardImage}
                                alt=""
                                draggable={false}
                            />

                            <div
                                className={styles.dotLayer}
                                ref={gridRef}
                                role="grid"
                                aria-label="Circuit board"
                            >
                                <SimulatorDotGrid />
                            </div>

                            {children && (
                                <div className={styles.componentsLayer}>
                                    {children}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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

                    <div
                        className={styles.grid}
                        ref={gridRef}
                        role="grid"
                        aria-label="Circuit board"
                    >
                        <GridPins simulator={false} />
                        {children}
                    </div>
                </div>
            </div>

            {label && <p className={styles.label}>{label}</p>}
        </div>
    );
}
