export const GRID_SIZE = 8;

export const BLOCK_COLORS = [
  '#00D4FF',
  '#39FF14',
  '#FF006E',
  '#FFB800',
  '#BF00FF',
  '#FF4500',
  '#00FFCC',
] as const;

export type BlockColor = (typeof BLOCK_COLORS)[number];

export const SCORE_PER_CELL = 1;
export const CLEAR_BONUS: Record<number, number> = {
  1: 10,
  2: 30,
  3: 60,
  4: 100,
};
