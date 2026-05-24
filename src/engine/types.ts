import { BlockColor } from './constants';

export type Cell =
  | { filled: false }
  | { filled: true; color: BlockColor };

export type Grid = Cell[][];

export type PieceShape = [number, number][];

export interface Piece {
  id: string;
  shape: PieceShape;
  color: BlockColor;
  boundingBox: {
    rows: number;
    cols: number;
  };
}

export interface PlacedPiece {
  piece: Piece;
  originRow: number;
  originCol: number;
}

export interface ClearResult {
  clearedRows: number[];
  clearedCols: number[];
  totalLinesCleared: number;
  scoreEarned: number;
  newGrid: Grid;
}

export interface ScoreResult {
  cellPoints: number;
  clearBonus: number;
  total: number;
  linesCleared: number;
}
