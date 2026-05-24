import { GRID_SIZE } from './constants';
import { Cell, Grid, PlacedPiece, ClearResult } from './types';
import { calculateClearBonus } from './score';

export function createGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, (): Cell => ({ filled: false }))
  );
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => row.map((cell) => ({ ...cell })));
}

export function applyPieceToGrid(grid: Grid, placed: PlacedPiece): Grid {
  const next = cloneGrid(grid);
  for (const [dr, dc] of placed.piece.shape) {
    const r = placed.originRow + dr;
    const c = placed.originCol + dc;
    next[r][c] = { filled: true, color: placed.piece.color };
  }
  return next;
}

export function getFilledRows(grid: Grid): number[] {
  const filled: number[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    if (grid[r].every((cell) => cell.filled)) {
      filled.push(r);
    }
  }
  return filled;
}

export function getFilledCols(grid: Grid): number[] {
  const filled: number[] = [];
  for (let c = 0; c < GRID_SIZE; c++) {
    if (grid.every((row) => row[c].filled)) {
      filled.push(c);
    }
  }
  return filled;
}

export function clearFilledLines(grid: Grid): ClearResult {
  const clearedRows = getFilledRows(grid);
  const clearedCols = getFilledCols(grid);
  const totalLinesCleared = clearedRows.length + clearedCols.length;

  if (totalLinesCleared === 0) {
    return {
      clearedRows: [],
      clearedCols: [],
      totalLinesCleared: 0,
      scoreEarned: 0,
      newGrid: grid,
    };
  }

  const next = cloneGrid(grid);

  for (const r of clearedRows) {
    for (let c = 0; c < GRID_SIZE; c++) {
      next[r][c] = { filled: false };
    }
  }

  for (const c of clearedCols) {
    for (let r = 0; r < GRID_SIZE; r++) {
      next[r][c] = { filled: false };
    }
  }

  const scoreEarned = calculateClearBonus(totalLinesCleared);

  return {
    clearedRows,
    clearedCols,
    totalLinesCleared,
    scoreEarned,
    newGrid: next,
  };
}
