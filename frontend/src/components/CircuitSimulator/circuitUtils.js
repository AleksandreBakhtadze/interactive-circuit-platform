import { BOARD_COLS, BOARD_ROWS, isInsideBoard, pinId } from '../../constants/circuitGrid';
import {
    COMPONENT_TYPES,
    getFootprint,
    isRelayType,
    isThreePinTriangleType,
    isTransistorType,
    isWireType,
    parseConnectorLength,
    usesSnapOnlyCells,
} from '../../constants/componentCatalog';
import {
    getRotatedFootprint,
    getRotatedSnapOffsets,
    getTriangleCollisionOffsets,
    isTriangleBodyAt,
    isTriangleBodyCell,
    rotateGridPoint,
    rotationSteps,
} from '../../constants/componentRotation';

export function getOccupiedCells(components) {
    const set = new Set();
    for (const comp of components) {
        for (const cell of getComponentCells(comp)) {
            set.add(cellKey(cell.row, cell.col));
        }
    }
    return set;
}

export function cellKey(row, col) {
    return `${row},${col}`;
}

export function getWireEndpoints(component) {
    if (!component || !isWireType(component.type)) return [];
    const endRow = component.endRow ?? component.row;
    const endCol = component.endCol ?? component.col;
    return [
        { row: component.row, col: component.col },
        { row: endRow, col: endCol },
    ];
}

export function getComponentCells(component) {
    const rotation = component.rotation ?? 0;
    const { type, row, col } = component;

    if (isWireType(type)) {
        const ends = getWireEndpoints(component);
        if (
            ends.length === 2 &&
            ends[0].row === ends[1].row &&
            ends[0].col === ends[1].col
        ) {
            return [ends[0]];
        }
        return ends;
    }

    if (usesSnapOnlyCells(type)) {
        return getTriangleCollisionOffsets(type, rotation).map(({ dr, dc }) => ({
            row: row + dr,
            col: col + dc,
        }));
    }

    const { w, h } = getRotatedFootprint(type, rotation);
    const cells = [];
    for (let dr = 0; dr < h; dr++) {
        for (let dc = 0; dc < w; dc++) {
            cells.push({ row: row + dr, col: col + dc });
        }
    }
    return cells;
}

function isSnapCell(type, row, col, anchorRow, anchorCol, rotation = 0) {
    return getRotatedSnapOffsets(type, rotation).some(
        (o) => anchorRow + o.dr === row && anchorCol + o.dc === col
    );
}

function terminalOffsetsToPins(offsets, anchorRow, anchorCol) {
    return offsets.map(({ dr, dc }) => ({
        row: anchorRow + dr,
        col: anchorCol + dc,
    }));
}

/**
 * Relative (dr, dc) cells where wires / other leads may connect.
 * Unlike collision cells, middle connector segments are not terminals.
 */
function getTerminalOffsets(type, rotation = 0) {
    const steps = rotationSteps(rotation);

    if (type === COMPONENT_TYPES.POWER_SUPPLY) {
        const { w, h } = getFootprint(type);
        return [
            { dr: 0, dc: 0 },
            { dr: 2, dc: 0 },
        ].map(({ dr, dc }) => rotateGridPoint(dr, dc, w, h, steps));
    }

    if (isWireType(type)) {
        return [{ dr: 0, dc: 0 }];
    }

    if (isTransistorType(type) || isThreePinTriangleType(type) || isRelayType(type)) {
        return getRotatedSnapOffsets(type, rotation);
    }

    const connectorLen = parseConnectorLength(type);
    if (connectorLen !== null) {
        const { w, h } = getFootprint(type);
        return [
            { dr: 0, dc: 0 },
            { dr: 0, dc: connectorLen - 1 },
        ].map(({ dr, dc }) => rotateGridPoint(dr, dc, w, h, steps));
    }

    return getRotatedSnapOffsets(type, rotation);
}

/** Board cells that are electrical terminals for this anchored component. */
export function getTerminalPins(type, anchorRow, anchorCol, rotation = 0, component = null) {
    if (component && isWireType(component.type)) {
        return getWireEndpoints(component);
    }
    return terminalOffsetsToPins(
        getTerminalOffsets(type, rotation),
        anchorRow,
        anchorCol
    );
}

function isTerminalPin(type, row, col, anchorRow, anchorCol, rotation = 0, component = null) {
    return getTerminalPins(type, anchorRow, anchorCol, rotation, component).some(
        (t) => t.row === row && t.col === col
    );
}

/** Connector span cell that is not an endpoint — may sit on another part's pin. */
function isConnectorMiddleCell(type, row, col, anchorRow, anchorCol, rotation = 0) {
    if (parseConnectorLength(type) === null) return false;
    const onConnector = getComponentCells({
        type,
        row: anchorRow,
        col: anchorCol,
        rotation,
    }).some((c) => c.row === row && c.col === col);
    return onConnector && !isTerminalPin(type, row, col, anchorRow, anchorCol, rotation);
}

/** Keep the same board cell under the cursor as when the drag started. */
export function anchorFromGrabOffset(cursorRow, cursorCol, grabDr, grabDc) {
    return { row: cursorRow - grabDr, col: cursorCol - grabDc };
}

/**
 * Map hovered grid dot to footprint anchor.
 * Triangles only snap when the cursor is on a real terminal — not body cells.
 */
export function alignPlacementAnchor(type, hoverRow, hoverCol, rotation = 0) {
    const offsets = getRotatedSnapOffsets(type, rotation);
    const { w, h } = getRotatedFootprint(type, rotation);

    const fits = (row, col) =>
        row >= 0 &&
        col >= 0 &&
        row + h <= BOARD_ROWS.length &&
        col + w <= BOARD_COLS.length;

    if (isThreePinTriangleType(type) && isTriangleBodyAt(type, hoverRow, hoverCol, rotation)) {
        return null;
    }

    for (const { dr, dc } of offsets) {
        const row = hoverRow - dr;
        const col = hoverCol - dc;
        if (
            row + dr === hoverRow &&
            col + dc === hoverCol &&
            fits(row, col) &&
            isSnapCell(type, hoverRow, hoverCol, row, col, rotation) &&
            !isTriangleBodyCell(type, hoverRow, hoverCol, row, col, rotation)
        ) {
            return { row, col };
        }
    }

    // Transistors / apex triangles: only place when the cursor is on a real pin.
    if (isThreePinTriangleType(type)) {
        return null;
    }

    for (const { dr, dc } of offsets) {
        const row = hoverRow - dr;
        const col = hoverCol - dc;
        if (fits(row, col)) {
            return { row, col };
        }
    }

    const { dr, dc } = offsets[0] ?? { dr: 0, dc: 0 };
    return { row: hoverRow - dr, col: hoverCol - dc };
}

export function canPlaceAt(
    type,
    row,
    col,
    placed,
    ignoreId = null,
    rotation = 0,
    extra = null
) {
    const candidate = {
        type,
        row,
        col,
        rotation,
        ...(extra && typeof extra === 'object' ? extra : {}),
    };
    const cells = getComponentCells(candidate);
    if (cells.some((c) => !isInsideBoard(c.row, c.col))) {
        return false;
    }

    if (isWireType(type)) {
        const ends = getWireEndpoints(candidate);
        if (
            ends.length < 2 ||
            (ends[0].row === ends[1].row && ends[0].col === ends[1].col)
        ) {
            return false;
        }
    }

    const others = placed.filter((p) => p.id !== ignoreId);
    const occupied = getOccupiedCells(others);

    for (const cell of cells) {
        if (!occupied.has(cellKey(cell.row, cell.col))) continue;

        const blocked = others.some((p) => {
            const pRot = p.rotation ?? 0;
            const onP = getComponentCells(p).some(
                (c) => c.row === cell.row && c.col === cell.col
            );
            if (!onP) return false;

            const bodyThere = isTriangleBodyCell(
                p.type,
                cell.row,
                cell.col,
                p.row,
                p.col,
                pRot
            );
            const bodyHere = isTriangleBodyCell(
                type,
                cell.row,
                cell.col,
                row,
                col,
                rotation
            );
            if (bodyThere || bodyHere) {
                return true;
            }

            const terminalHere = isTerminalPin(
                type,
                cell.row,
                cell.col,
                row,
                col,
                rotation,
                candidate
            );
            const terminalThere = isTerminalPin(
                p.type,
                cell.row,
                cell.col,
                p.row,
                p.col,
                pRot,
                p
            );

            if (terminalHere && terminalThere) {
                return false;
            }

            // Wire may pass through a pin on its middle segment (e.g. connector3 over collector).
            if (
                terminalThere &&
                isConnectorMiddleCell(type, cell.row, cell.col, row, col, rotation)
            ) {
                return false;
            }
            if (
                terminalHere &&
                isConnectorMiddleCell(
                    p.type,
                    cell.row,
                    cell.col,
                    p.row,
                    p.col,
                    pRot
                )
            ) {
                return false;
            }

            return true;
        });
        if (blocked) return false;
    }

    return true;
}

export function countPlacedByType(placed, type) {
    return placed.filter((p) => p.type === type).length;
}

export function getPinNodesForComponent(component) {
    if (isWireType(component.type)) {
        return getWireEndpoints(component).map((p) => pinId(p.row, p.col));
    }
    const rotation = component.rotation ?? 0;
    const offsets = getRotatedSnapOffsets(component.type, rotation);
    return offsets.map((o) =>
        pinId(component.row + o.dr, component.col + o.dc)
    );
}

export function createComponentId() {
    return `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function rowLabel(row) {
    return BOARD_ROWS[row];
}

export function colLabel(col) {
    return BOARD_COLS[col];
}
