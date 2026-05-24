import { BLOCK_COLORS } from '../src/engine/constants';
import { generatePieceSet, PIECE_SHAPES } from '../src/engine/pieces';

const LINE4_IDS = new Set(['LINE4_H', 'LINE4_V']);

describe('PIECE_SHAPES', () => {
  it('defines all weighted piece types', () => {
    expect(Object.keys(PIECE_SHAPES).length).toBe(16);
  });
});

describe('generatePieceSet', () => {
  it('returns exactly 3 pieces with valid shapes', () => {
    const [a, b, c] = generatePieceSet();
    expect(a.shape.length).toBeGreaterThan(0);
    expect(b.shape.length).toBeGreaterThan(0);
    expect(c.shape.length).toBeGreaterThan(0);
    expect(PIECE_SHAPES[a.id]).toBeDefined();
  });

  it('assigns unique colors within each set', () => {
    for (let trial = 0; trial < 50; trial++) {
      const pieces = generatePieceSet();
      const colors = new Set(pieces.map((p) => p.color));
      expect(colors.size).toBe(3);
      for (const color of colors) {
        expect(BLOCK_COLORS).toContain(color);
      }
    }
  });

  it('never gives 3 LINE4 pieces in the same set', () => {
    for (let trial = 0; trial < 100; trial++) {
      const pieces = generatePieceSet();
      const line4Count = pieces.filter((p) => LINE4_IDS.has(p.id)).length;
      expect(line4Count).toBeLessThan(3);
    }
  });
});
