import { GRID_SIZE, BlockColor } from './constants';
import { ClearResult, Grid } from './types';

export interface ClearedCellSnapshot {
  row: number;
  col: number;
  color: BlockColor;
}

/** Snapshot filled cells that will be removed (for clear VFX). */
export function snapshotClearedCells(grid: Grid, result: ClearResult): ClearedCellSnapshot[] {
  const cells: ClearedCellSnapshot[] = [];
  const seen = new Set<string>();

  for (const r of result.clearedRows) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = grid[r][c];
      if (!cell.filled) continue;
      const key = `${r},${c}`;
      if (seen.has(key)) continue;
      seen.add(key);
      cells.push({ row: r, col: c, color: cell.color });
    }
  }

  for (const c of result.clearedCols) {
    for (let r = 0; r < GRID_SIZE; r++) {
      const key = `${r},${c}`;
      if (seen.has(key)) continue;
      const cell = grid[r][c];
      if (!cell.filled) continue;
      seen.add(key);
      cells.push({ row: r, col: c, color: cell.color });
    }
  }

  return cells;
}

/** Pixel center of cleared lines for score pop positioning. */
export function getClearPopAnchor(
  clearedRows: number[],
  clearedCols: number[],
  cellSize: number
): { x: number; y: number } {
  if (clearedRows.length > 0) {
    const row = clearedRows[0];
    return { x: (GRID_SIZE * cellSize) / 2, y: (row + 0.5) * cellSize };
  }
  if (clearedCols.length > 0) {
    const col = clearedCols[0];
    return { x: (col + 0.5) * cellSize, y: (GRID_SIZE * cellSize) / 2 };
  }
  return { x: (GRID_SIZE * cellSize) / 2, y: (GRID_SIZE * cellSize) / 2 };
}
