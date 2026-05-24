import { createGrid, clearFilledLines, applyPieceToGrid } from '../src/engine/grid';
import { getClearPopAnchor, snapshotClearedCells } from '../src/engine/clearAnimation';
import { Piece } from '../src/engine/types';

const single: Piece = {
  id: 'SINGLE',
  shape: [[0, 0]],
  color: '#00D4FF',
  boundingBox: { rows: 1, cols: 1 },
};

describe('snapshotClearedCells', () => {
  it('captures cells from cleared rows and columns without duplicates', () => {
    const grid = createGrid();
    for (let c = 0; c < 8; c++) grid[2][c] = { filled: true, color: '#00D4FF' };
    for (let r = 0; r < 8; r++) grid[r][4] = { filled: true, color: '#39FF14' };

    const result = clearFilledLines(grid);
    const cells = snapshotClearedCells(grid, result);

    expect(cells.length).toBe(15);
    expect(cells.some((c) => c.row === 2 && c.col === 4)).toBe(true);
  });

  it('snapshots cells from a completed row after placement', () => {
    const grid = createGrid();
    for (let c = 0; c < 7; c++) grid[0][c] = { filled: true, color: '#FFB800' };

    const placed = applyPieceToGrid(grid, { piece: single, originRow: 0, originCol: 7 });
    const result = clearFilledLines(placed);
    const cells = snapshotClearedCells(placed, result);

    expect(cells.length).toBe(8);
  });
});

describe('getClearPopAnchor', () => {
  it('anchors to first cleared row center', () => {
    const anchor = getClearPopAnchor([2], [], 40);
    expect(anchor).toEqual({ x: 160, y: 100 });
  });
});
