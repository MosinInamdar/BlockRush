import {
  applyPieceToGrid,
  clearFilledLines,
  createGrid,
  getFilledCols,
  getFilledRows,
} from '../src/engine/grid';
import { Piece } from '../src/engine/types';

const mockPiece = (shape: [number, number][]): Piece => ({
  id: 'TEST',
  shape,
  color: '#00D4FF',
  boundingBox: { rows: 1, cols: shape.length },
});

describe('createGrid', () => {
  it('creates an 8×8 grid of empty cells', () => {
    const grid = createGrid();
    expect(grid.length).toBe(8);
    expect(grid[0].length).toBe(8);
    expect(grid[0][0].filled).toBe(false);
  });
});

describe('applyPieceToGrid', () => {
  it('places cells without mutating the original grid', () => {
    const grid = createGrid();
    const piece = mockPiece([[0, 0], [0, 1]]);
    const next = applyPieceToGrid(grid, { piece, originRow: 0, originCol: 0 });
    expect(next[0][0].filled).toBe(true);
    expect(grid[0][0].filled).toBe(false);
  });
});

describe('getFilledRows', () => {
  it('returns empty array for empty grid', () => {
    expect(getFilledRows(createGrid())).toEqual([]);
  });

  it('detects a completely filled row', () => {
    const grid = createGrid();
    for (let c = 0; c < 8; c++) {
      grid[3][c] = { filled: true, color: '#00D4FF' };
    }
    expect(getFilledRows(grid)).toEqual([3]);
  });

  it('does not count partially filled rows', () => {
    const grid = createGrid();
    grid[0][0] = { filled: true, color: '#00D4FF' };
    expect(getFilledRows(grid)).toEqual([]);
  });
});

describe('getFilledCols', () => {
  it('detects a completely filled column', () => {
    const grid = createGrid();
    for (let r = 0; r < 8; r++) {
      grid[r][5] = { filled: true, color: '#39FF14' };
    }
    expect(getFilledCols(grid)).toEqual([5]);
  });
});

describe('clearFilledLines', () => {
  it('returns no clears on empty grid', () => {
    const result = clearFilledLines(createGrid());
    expect(result.totalLinesCleared).toBe(0);
    expect(result.scoreEarned).toBe(0);
  });

  it('clears a full row and awards 10 bonus points', () => {
    const grid = createGrid();
    for (let c = 0; c < 8; c++) {
      grid[0][c] = { filled: true, color: '#00D4FF' };
    }
    const result = clearFilledLines(grid);
    expect(result.clearedRows).toEqual([0]);
    expect(result.totalLinesCleared).toBe(1);
    expect(result.scoreEarned).toBe(10);
    expect(result.newGrid[0][0].filled).toBe(false);
  });

  it('clears row and column simultaneously', () => {
    const grid = createGrid();
    for (let c = 0; c < 8; c++) grid[2][c] = { filled: true, color: '#00D4FF' };
    for (let r = 0; r < 8; r++) grid[r][4] = { filled: true, color: '#39FF14' };

    const result = clearFilledLines(grid);
    expect(result.clearedRows).toContain(2);
    expect(result.clearedCols).toContain(4);
    expect(result.totalLinesCleared).toBe(2);
    expect(result.scoreEarned).toBe(30);
    expect(result.newGrid[2][4].filled).toBe(false);
  });
});
