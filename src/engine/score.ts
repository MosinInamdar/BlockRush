import { SCORE_PER_CELL, CLEAR_BONUS } from './constants';
import { Piece, ScoreResult } from './types';

export function calculatePlacementScore(piece: Piece): number {
  return piece.shape.length * SCORE_PER_CELL;
}

export function calculateClearBonus(linesCleared: number): number {
  if (linesCleared === 0) return 0;
  return CLEAR_BONUS[linesCleared] ?? CLEAR_BONUS[4];
}

export function calculateTurnScore(piece: Piece, linesCleared: number): ScoreResult {
  const cellPoints = calculatePlacementScore(piece);
  const clearBonus = calculateClearBonus(linesCleared);
  return {
    cellPoints,
    clearBonus,
    total: cellPoints + clearBonus,
    linesCleared,
  };
}
