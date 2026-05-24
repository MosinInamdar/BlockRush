import { Grid, Piece } from './types';
import { getAllValidPlacements } from './placement';

/**
 * Game over when no **remaining tray piece** can be placed anywhere.
 * Already-used slots are ignored — a shape may still fit on the grid but
 * cannot be played again until a new set of three is dealt.
 */
export function checkGameOver(
  grid: Grid,
  pieces: [Piece, Piece, Piece],
  usedPieces: [boolean, boolean, boolean]
): boolean {
  let hasUnusedPiece = false;

  for (let i = 0; i < 3; i++) {
    if (usedPieces[i]) continue;
    hasUnusedPiece = true;
    if (getAllValidPlacements(grid, pieces[i]).length > 0) {
      return false;
    }
  }

  // All slots used (caller should deal a new set before checking) — treat as stuck.
  return hasUnusedPiece;
}

/** @deprecated Use `checkGameOver` with `usedPieces`. */
export const isGameOver = checkGameOver;

export function isPiecePlayable(grid: Grid, piece: Piece): boolean {
  return getAllValidPlacements(grid, piece).length > 0;
}

/** Indices of tray slots that are unused and can be placed somewhere. */
export function getPlayableTrayIndices(
  grid: Grid,
  pieces: [Piece, Piece, Piece],
  usedPieces: [boolean, boolean, boolean]
): (0 | 1 | 2)[] {
  const playable: (0 | 1 | 2)[] = [];
  for (let i = 0; i < 3; i++) {
    if (usedPieces[i]) continue;
    if (getAllValidPlacements(grid, pieces[i]).length > 0) {
      playable.push(i as 0 | 1 | 2);
    }
  }
  return playable;
}
