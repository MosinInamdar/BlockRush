import { createGrid } from '../src/engine/grid';
import {
  findSnapPosition,
  getAllValidPlacements,
  getGhostCells,
  isValidPlacement,
  pixelToGridOrigin,
} from '../src/engine/placement';
import { Piece } from '../src/engine/types';

const linePiece: Piece = {
  id: 'LINE3_H',
  shape: [
    [0, 0],
    [0, 1],
    [0, 2],
  ],
  color: '#00D4FF',
  boundingBox: { rows: 1, cols: 3 },
};

describe('isValidPlacement', () => {
  it('allows valid in-bounds placement', () => {
    expect(isValidPlacement(createGrid(), linePiece, 0, 0)).toBe(true);
  });

  it('rejects out-of-bounds placement (right edge)', () => {
    expect(isValidPlacement(createGrid(), linePiece, 0, 6)).toBe(false);
  });

  it('rejects placement on filled cells', () => {
    const grid = createGrid();
    grid[0][1] = { filled: true, color: '#39FF14' };
    expect(isValidPlacement(grid, linePiece, 0, 0)).toBe(false);
  });
});

describe('getAllValidPlacements', () => {
  it('returns placements for LINE3_H on empty grid', () => {
    const placements = getAllValidPlacements(createGrid(), linePiece);
    expect(placements.length).toBe(48);
  });

  it('returns empty array when piece cannot be placed', () => {
    const grid = createGrid();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        grid[r][c] = { filled: true, color: '#00D4FF' };
      }
    }
    expect(getAllValidPlacements(grid, linePiece)).toHaveLength(0);
  });
});

describe('findSnapPosition', () => {
  it('returns exact position when valid', () => {
    expect(findSnapPosition(createGrid(), linePiece, 2, 3)).toEqual({ row: 2, col: 3 });
  });

  it('snaps to adjacent cell when preferred is invalid', () => {
    const grid = createGrid();
    grid[1][1] = { filled: true, color: '#39FF14' };
    const snap = findSnapPosition(grid, linePiece, 1, 1);
    expect(snap).not.toBeNull();
    expect(isValidPlacement(grid, linePiece, snap!.row, snap!.col)).toBe(true);
    expect(snap).not.toEqual({ row: 1, col: 1 });
  });
});

describe('getGhostCells', () => {
  it('returns occupied cells for valid placement', () => {
    const cells = getGhostCells(createGrid(), linePiece, 0, 0);
    expect(cells).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
    ]);
  });

  it('returns empty array for invalid placement', () => {
    expect(getGhostCells(createGrid(), linePiece, 0, 6)).toEqual([]);
  });
});

describe('pixelToGridOrigin', () => {
  it('centers piece on finger position', () => {
    const single: Piece = {
      id: 'SINGLE',
      shape: [[0, 0]],
      color: '#00D4FF',
      boundingBox: { rows: 1, cols: 1 },
    };
    const { row, col } = pixelToGridOrigin(104, 104, 100, 100, 40, single);
    expect(row).toBeCloseTo(0);
    expect(col).toBeCloseTo(0);
  });
});
