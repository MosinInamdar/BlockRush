import { GRID_SIZE } from './constants';
import { Grid, Piece } from './types';

export function isValidPlacement(
  grid: Grid,
  piece: Piece,
  originRow: number,
  originCol: number
): boolean {
  for (const [dr, dc] of piece.shape) {
    const r = originRow + dr;
    const c = originCol + dc;

    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) {
      return false;
    }

    if (grid[r][c].filled) {
      return false;
    }
  }
  return true;
}

export function pixelToGridOrigin(
  dragX: number,
  dragY: number,
  gridOriginX: number,
  gridOriginY: number,
  cellSize: number,
  piece: Piece
): { row: number; col: number } {
  const offsetX = dragX - gridOriginX - (piece.boundingBox.cols * cellSize) / 2;
  const offsetY = dragY - gridOriginY - (piece.boundingBox.rows * cellSize) / 2;

  const col = Math.round(offsetX / cellSize);
  const row = Math.round(offsetY / cellSize);

  return { row, col };
}

export function findSnapPosition(
  grid: Grid,
  piece: Piece,
  preferredRow: number,
  preferredCol: number
): { row: number; col: number } | null {
  if (isValidPlacement(grid, piece, preferredRow, preferredCol)) {
    return { row: preferredRow, col: preferredCol };
  }

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = preferredRow + dr;
      const c = preferredCol + dc;
      if (isValidPlacement(grid, piece, r, c)) {
        return { row: r, col: c };
      }
    }
  }

  return null;
}

export function getAllValidPlacements(
  grid: Grid,
  piece: Piece
): { row: number; col: number }[] {
  const valid: { row: number; col: number }[] = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (isValidPlacement(grid, piece, r, c)) {
        valid.push({ row: r, col: c });
      }
    }
  }

  return valid;
}

export function getGhostCells(
  grid: Grid,
  piece: Piece,
  originRow: number,
  originCol: number
): { row: number; col: number }[] {
  if (!isValidPlacement(grid, piece, originRow, originCol)) {
    return [];
  }

  return piece.shape.map(([dr, dc]) => ({
    row: originRow + dr,
    col: originCol + dc,
  }));
}
