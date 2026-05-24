import {
  calculateClearBonus,
  calculatePlacementScore,
  calculateTurnScore,
} from '../src/engine/score';
import { Piece } from '../src/engine/types';

const squarePiece: Piece = {
  id: 'SQUARE',
  shape: [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ],
  color: '#FFB800',
  boundingBox: { rows: 2, cols: 2 },
};

describe('calculatePlacementScore', () => {
  it('gives 4 points for a 2×2 square (4 cells)', () => {
    expect(calculatePlacementScore(squarePiece)).toBe(4);
  });
});

describe('calculateClearBonus', () => {
  it('gives 0 for no clears', () => expect(calculateClearBonus(0)).toBe(0));
  it('gives 10 for 1 line', () => expect(calculateClearBonus(1)).toBe(10));
  it('gives 30 for 2 lines', () => expect(calculateClearBonus(2)).toBe(30));
  it('gives 60 for 3 lines', () => expect(calculateClearBonus(3)).toBe(60));
  it('gives 100 for 4 lines', () => expect(calculateClearBonus(4)).toBe(100));
  it('gives 100 for 5+ lines', () => expect(calculateClearBonus(5)).toBe(100));
});

describe('calculateTurnScore', () => {
  it('sums placement + clear bonus correctly', () => {
    const result = calculateTurnScore(squarePiece, 2);
    expect(result.cellPoints).toBe(4);
    expect(result.clearBonus).toBe(30);
    expect(result.total).toBe(34);
  });
});
