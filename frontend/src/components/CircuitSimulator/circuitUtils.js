import { BOARD_COLS, BOARD_ROWS, isInsideBoard, pinId } from '../../constants/circuitGrid';
import { isConnectorType } from '../../constants/componentCatalog';
import {
    getRotatedFootprint,
    getRotatedSnapOffsets,
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

export function getComponentCells(component) {
    const rotation = component.rotation ?? 0;
    const { w, h } = getRotatedFootprint(component.type, rotation);
    const cells = [];
    for (let dr = 0; dr < h; dr++) {
        for (let dc = 0; dc < w; dc++) {
            cells.push({ row: component.row + dr, col: component.col + dc });
        }
    }
    return cells;
}

function isSnapCell(type, row, col, anchorRow, anchorCol, rotation = 0) {
    return getRotatedSnapOffsets(type, rotation).some(
        (o) => anchorRow + o.dr === row && anchorCol + o.dc === col
    );
}

/** Map hovered pin to footprint anchor so a terminal can sit on that pin. */
export function alignPlacementAnchor(type, hoverRow, hoverCol, rotation = 0) {
    const offsets = getRotatedSnapOffsets(type, rotation);
    const { w, h } = getRotatedFootprint(type, rotation);

    const fits = (row, col) =>
        row >= 0 &&
        col >= 0 &&
        row + h <= BOARD_ROWS.length &&
        col + w <= BOARD_COLS.length;

    for (const { dr, dc } of offsets) {
        const row = hoverRow - dr;
        const col = hoverCol - dc;
        if (
            row + dr === hoverRow &&
            col + dc === hoverCol &&
            fits(row, col)
        ) {
            return { row, col };
        }
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
    rotation = 0
) {
    const candidate = { type, row, col, rotation };
    const cells = getComponentCells(candidate);
    if (cells.some((c) => !isInsideBoard(c.row, c.col))) {
        return false;
    }

    const others = placed.filter((p) => p.id !== ignoreId);
    const occupied = getOccupiedCells(others);

    for (const cell of cells) {
        if (!occupied.has(cellKey(cell.row, cell.col))) continue;
        const blocked = others.some((p) => {
            const pCells = getComponentCells(p);
            const onP = pCells.some(
                (c) => c.row === cell.row && c.col === cell.col
            );
            if (!onP) return false;
            const pRot = p.rotation ?? 0;
            const snapHere = isSnapCell(type, cell.row, cell.col, row, col, rotation);
            const snapThere = isSnapCell(
                p.type,
                cell.row,
                cell.col,
                p.row,
                p.col,
                pRot
            );
            if (isConnectorType(type) && !snapThere) {
                return false;
            }
            return !(snapHere && snapThere);
        });
        if (blocked) return false;
    }

    return true;
}

export function countPlacedByType(placed, type) {
    return placed.filter((p) => p.type === type).length;
}

export function getPinNodesForComponent(component) {
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
