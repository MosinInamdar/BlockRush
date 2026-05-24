import { BLOCK_COLORS, BlockColor } from './constants';
import { Piece, PieceShape } from './types';

export const PIECE_SHAPES: Record<string, { shape: PieceShape; rows: number; cols: number }> = {
  SINGLE: {
    shape: [[0, 0]],
    rows: 1,
    cols: 1,
  },
  DOMINO_H: {
    shape: [
      [0, 0],
      [0, 1],
    ],
    rows: 1,
    cols: 2,
  },
  DOMINO_V: {
    shape: [
      [0, 0],
      [1, 0],
    ],
    rows: 2,
    cols: 1,
  },
  LINE3_H: {
    shape: [
      [0, 0],
      [0, 1],
      [0, 2],
    ],
    rows: 1,
    cols: 3,
  },
  LINE3_V: {
    shape: [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    rows: 3,
    cols: 1,
  },
  LINE4_H: {
    shape: [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
    ],
    rows: 1,
    cols: 4,
  },
  LINE4_V: {
    shape: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ],
    rows: 4,
    cols: 1,
  },
  SQUARE: {
    shape: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
    rows: 2,
    cols: 2,
  },
  L_SHAPE: {
    shape: [
      [0, 0],
      [1, 0],
      [1, 1],
    ],
    rows: 2,
    cols: 2,
  },
  J_SHAPE: {
    shape: [
      [0, 1],
      [1, 0],
      [1, 1],
    ],
    rows: 2,
    cols: 2,
  },
  T_SHAPE: {
    shape: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 1],
    ],
    rows: 2,
    cols: 3,
  },
  T_SHAPE_R: {
    shape: [
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 1],
    ],
    rows: 3,
    cols: 2,
  },
  S_SHAPE: {
    shape: [
      [0, 1],
      [0, 2],
      [1, 0],
      [1, 1],
    ],
    rows: 2,
    cols: 3,
  },
  Z_SHAPE: {
    shape: [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
    rows: 2,
    cols: 3,
  },
  BIG_L: {
    shape: [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
    ],
    rows: 3,
    cols: 2,
  },
  BIG_J: {
    shape: [
      [0, 1],
      [1, 1],
      [2, 0],
      [2, 1],
    ],
    rows: 3,
    cols: 2,
  },
};

const PIECE_WEIGHTS: Record<string, number> = {
  SINGLE: 1,
  DOMINO_H: 6,
  DOMINO_V: 6,
  LINE3_H: 8,
  LINE3_V: 8,
  LINE4_H: 3,
  LINE4_V: 3,
  SQUARE: 8,
  L_SHAPE: 7,
  J_SHAPE: 7,
  T_SHAPE: 6,
  T_SHAPE_R: 6,
  S_SHAPE: 4,
  Z_SHAPE: 4,
  BIG_L: 3,
  BIG_J: 3,
};

const LINE4_IDS = new Set(['LINE4_H', 'LINE4_V']);

function weightedRandomPieceId(): string {
  const ids = Object.keys(PIECE_WEIGHTS);
  const totalWeight = ids.reduce((sum, id) => sum + PIECE_WEIGHTS[id], 0);
  let rand = Math.random() * totalWeight;

  for (const id of ids) {
    rand -= PIECE_WEIGHTS[id];
    if (rand <= 0) return id;
  }
  return ids[ids.length - 1];
}

function buildPiece(pieceId: string, color: BlockColor): Piece {
  const def = PIECE_SHAPES[pieceId];
  return {
    id: pieceId,
    shape: def.shape,
    color,
    boundingBox: { rows: def.rows, cols: def.cols },
  };
}

export function generatePieceSet(): [Piece, Piece, Piece] {
  const usedColors = new Set<BlockColor>();
  const pieces: Piece[] = [];
  let line4Count = 0;

  function makePiece(): Piece {
    const pieceId = weightedRandomPieceId();
    const availableColors = BLOCK_COLORS.filter((c) => !usedColors.has(c));
    const color = availableColors[Math.floor(Math.random() * availableColors.length)];
    usedColors.add(color);
    return buildPiece(pieceId, color);
  }

  for (let i = 0; i < 3; i++) {
    let piece = makePiece();

    if (LINE4_IDS.has(piece.id)) {
      line4Count++;
      if (line4Count > 1) {
        while (LINE4_IDS.has(piece.id)) {
          usedColors.delete(piece.color);
          piece = makePiece();
        }
        line4Count--;
      }
    }

    pieces.push(piece);
  }

  return pieces as [Piece, Piece, Piece];
}
