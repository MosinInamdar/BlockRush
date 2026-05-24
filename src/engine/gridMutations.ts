import { GRID_SIZE } from './constants';
import { cloneGrid } from './grid';
import { Grid } from './types';

export interface GridCellRef {
  row: number;
  col: number;
}

/** Lists all filled cells on the grid (row-major order). */
export function getFilledCellRefs(grid: Grid): GridCellRef[] {
  const refs: GridCellRef[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col].filled) {
        refs.push({ row, col });
      }
    }
  }
  return refs;
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Clears up to `count` random filled cells. No-op when the grid has no filled cells.
 */
export function removeRandomBlocks(
  grid: Grid,
  count: number,
  random: () => number = Math.random
): Grid {
  const filled = getFilledCellRefs(grid);
  if (filled.length === 0) return cloneGrid(grid);

  const picks = shuffle(filled, random).slice(0, Math.min(count, filled.length));
  const next = cloneGrid(grid);
  for (const { row, col } of picks) {
    next[row][col] = { filled: false };
  }
  return next;
}
