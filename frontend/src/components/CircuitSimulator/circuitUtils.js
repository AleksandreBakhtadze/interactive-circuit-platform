import { BOARD_COLS, BOARD_ROWS, isInsideBoard, pinId } from '../../constants/circuitGrid';
import { getFootprint, getSnapOffsets } from '../../constants/componentCatalog';

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
    const { w, h } = getFootprint(component.type, component.wireLength);
    const cells = [];
    for (let dr = 0; dr < h; dr++) {
        for (let dc = 0; dc < w; dc++) {
            cells.push({ row: component.row + dr, col: component.col + dc });
        }
    }
    return cells;
}

function isSnapCell(type, row, col, anchorRow, anchorCol) {
    return getSnapOffsets(type).some(
        (o) => anchorRow + o.dr === row && anchorCol + o.dc === col
    );
}

export function canPlaceAt(type, row, col, wireLength, placed, ignoreId = null) {
    const candidate = { type, row, col, wireLength };
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
            const snapHere = isSnapCell(type, cell.row, cell.col, row, col);
            const snapThere = isSnapCell(
                p.type,
                cell.row,
                cell.col,
                p.row,
                p.col
            );
            return !(snapHere && snapThere);
        });
        if (blocked) return false;
    }

    return true;
}

export function countPlaced(placed, type, wireLength = null) {
    return placed.filter((p) => {
        if (p.type !== type) return false;
        if (type === 'wire' && wireLength != null) {
            return p.wireLength === wireLength;
        }
        return true;
    }).length;
}

export function countPlacedByType(placed, type) {
    return placed.filter((p) => p.type === type).length;
}

export function getPinNodesForComponent(component) {
    return getComponentCells(component).map((c) => pinId(c.row, c.col));
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
