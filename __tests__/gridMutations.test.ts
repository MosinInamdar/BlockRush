import { createGrid } from '../src/engine/grid';
import { getFilledCellRefs, removeRandomBlocks } from '../src/engine/gridMutations';

describe('getFilledCellRefs', () => {
  it('returns empty for a new grid', () => {
    expect(getFilledCellRefs(createGrid())).toEqual([]);
  });

  it('lists filled cells', () => {
    const grid = createGrid();
    grid[1][2] = { filled: true, color: '#00D4FF' };
    grid[3][4] = { filled: true, color: '#39FF14' };
    expect(getFilledCellRefs(grid)).toEqual([
      { row: 1, col: 2 },
      { row: 3, col: 4 },
    ]);
  });
});

describe('removeRandomBlocks', () => {
  it('removes the requested number of blocks', () => {
    const grid = createGrid();
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        grid[r][c] = { filled: true, color: '#00D4FF' };
      }
    }
    let n = 0;
    const next = removeRandomBlocks(grid, 3, () => {
      const values = [0.9, 0.5, 0.1];
      return values[Math.min(n++, values.length - 1)];
    });
    const remaining = getFilledCellRefs(next).length;
    expect(remaining).toBe(6);
  });

  it('removes at most the number of filled cells', () => {
    const grid = createGrid();
    grid[0][0] = { filled: true, color: '#00D4FF' };
    const next = removeRandomBlocks(grid, 5, () => 0.5);
    expect(getFilledCellRefs(next)).toHaveLength(0);
  });

  it('does not mutate the source grid', () => {
    const grid = createGrid();
    grid[2][2] = { filled: true, color: '#FF006E' };
    removeRandomBlocks(grid, 1, () => 0);
    expect(grid[2][2].filled).toBe(true);
  });
});
