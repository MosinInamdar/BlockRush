import { createGrid } from '../src/engine/grid';
import {
  checkGameOver,
  getPlayableTrayIndices,
  isPiecePlayable,
} from '../src/engine/gameOver';
import { generatePieceSet } from '../src/engine/pieces';
import { Piece } from '../src/engine/types';

const tinyPiece = (): Piece => ({
  id: 'SINGLE',
  shape: [[0, 0]],
  color: '#00D4FF',
  boundingBox: { rows: 1, cols: 1 },
});

const line4H = (): Piece => ({
  id: 'LINE4_H',
  shape: [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
  ],
  color: '#39FF14',
  boundingBox: { rows: 1, cols: 4 },
});

const noneUsed: [boolean, boolean, boolean] = [false, false, false];

function fillGridExcept(grid: ReturnType<typeof createGrid>, empty: { r: number; c: number }) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (r === empty.r && c === empty.c) continue;
      grid[r][c] = { filled: true, color: '#00D4FF' };
    }
  }
}

describe('checkGameOver', () => {
  it('is NOT game over on empty grid with all tray pieces available', () => {
    const pieces = generatePieceSet();
    expect(checkGameOver(createGrid(), pieces, noneUsed)).toBe(false);
  });

  it('is NOT game over when an unused single-cell piece can fit', () => {
    const grid = createGrid();
    fillGridExcept(grid, { r: 7, c: 7 });

    const pieces: [Piece, Piece, Piece] = [tinyPiece(), tinyPiece(), tinyPiece()];
    expect(checkGameOver(grid, pieces, noneUsed)).toBe(false);
  });

  it('IS game over when grid is full and all tray pieces are unused', () => {
    const grid = createGrid();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        grid[r][c] = { filled: true, color: '#00D4FF' };
      }
    }

    const pieces = generatePieceSet();
    expect(checkGameOver(grid, pieces, noneUsed)).toBe(true);
  });

  it('IS game over when only the last unused piece cannot fit', () => {
    const grid = createGrid();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        grid[r][c] = { filled: true, color: '#00D4FF' };
      }
    }

    const pieces: [Piece, Piece, Piece] = [tinyPiece(), tinyPiece(), tinyPiece()];
    const used: [boolean, boolean, boolean] = [true, true, false];

    expect(checkGameOver(grid, pieces, used)).toBe(true);
  });

  it('is NOT game over when a used piece still fits but an unused piece fits too', () => {
    const grid = createGrid();
    fillGridExcept(grid, { r: 7, c: 7 });

    const pieces: [Piece, Piece, Piece] = [line4H(), tinyPiece(), tinyPiece()];
    const used: [boolean, boolean, boolean] = [true, false, false];

    // LINE4_H was "played" but could still fit on row 7; only unused tinies matter.
    expect(checkGameOver(grid, pieces, used)).toBe(false);
  });

  it('IS game over when used piece still fits on grid but no unused piece fits', () => {
    const grid = createGrid();
    fillGridExcept(grid, { r: 7, c: 7 });

    const pieces: [Piece, Piece, Piece] = [tinyPiece(), tinyPiece(), line4H()];
    const used: [boolean, boolean, boolean] = [true, true, false];

    // Only one 1×1 hole; used singles could fit there but are spent. Unused LINE4 cannot fit.
    expect(checkGameOver(grid, pieces, used)).toBe(true);
  });

  it('IS game over immediately when a fresh set has no legal placement', () => {
    const grid = createGrid();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        grid[r][c] = { filled: true, color: '#00D4FF' };
      }
    }

    const pieces: [Piece, Piece, Piece] = [line4H(), line4H(), line4H()];
    expect(checkGameOver(grid, pieces, noneUsed)).toBe(true);
  });
});

describe('getPlayableTrayIndices', () => {
  it('returns only unused playable slots', () => {
    const grid = createGrid();
    fillGridExcept(grid, { r: 3, c: 3 });

    const pieces: [Piece, Piece, Piece] = [line4H(), tinyPiece(), tinyPiece()];
    const used: [boolean, boolean, boolean] = [true, false, false];

    expect(getPlayableTrayIndices(grid, pieces, used)).toEqual([1, 2]);
  });
});

describe('isPiecePlayable', () => {
  it('returns true when piece fits', () => {
    expect(isPiecePlayable(createGrid(), tinyPiece())).toBe(true);
  });

  it('returns false on full grid', () => {
    const grid = createGrid();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        grid[r][c] = { filled: true, color: '#00D4FF' };
      }
    }
    expect(isPiecePlayable(grid, tinyPiece())).toBe(false);
  });
});
