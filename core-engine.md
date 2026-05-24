# BlockRush — Core Game Engine Documentation

**Version:** 1.0  
**Date:** May 2026  
**Developer:** Mosin (Solo)  
**Stack:** React Native + Expo + TypeScript  
**Scope:** Week 1–2 (Days 4–12) — Pure logic, no UI

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Folder Structure](#2-folder-structure)
3. [Grid Data Model](#3-grid-data-model)
4. [Row & Column Clear Logic](#4-row--column-clear-logic)
5. [Piece Definitions](#5-piece-definitions)
6. [Piece Generator](#6-piece-generator)
7. [Placement & Validation](#7-placement--validation)
8. [Ghost Preview Logic](#8-ghost-preview-logic)
9. [Drag-and-Drop (Gesture Handler)](#9-drag-and-drop-gesture-handler)
10. [Score System](#10-score-system)
11. [Game-Over Detection](#11-game-over-detection)
12. [Game State (Zustand Store)](#12-game-state-zustand-store)
13. [Unit Tests](#13-unit-tests)
14. [Implementation Order](#14-implementation-order)

---

## 1. Project Setup

### Initialize the project

```bash
npx create-expo-app@latest blockrush --template blank-typescript
cd blockrush
```

### Install all core engine dependencies

```bash
# Gesture handling (drag-and-drop)
npx expo install react-native-gesture-handler

# Animations (60fps clears, particle bursts)
npx expo install react-native-reanimated

# State management
npm install zustand

# Local storage (high score, game state persistence)
npx expo install @react-native-async-storage/async-storage

# Audio (sfx)
npx expo install expo-av

# Testing
npm install --save-dev jest @types/jest jest-expo ts-jest
```

### Configure `babel.config.js`

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'], // must be last
  };
};
```

### Configure `jest.config.js`

```js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};
```

### `package.json` scripts to add

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch"
}
```

---

## 2. Folder Structure

```
blockrush/
├── app/                    # Expo Router screens (UI only)
│   └── index.tsx
├── src/
│   ├── engine/             # ← ALL CORE LOGIC LIVES HERE (Week 1–2)
│   │   ├── constants.ts    # Grid size, colors, scoring values
│   │   ├── types.ts        # All TypeScript types & interfaces
│   │   ├── grid.ts         # Grid model, clear detection, apply clears
│   │   ├── pieces.ts       # Piece definitions and generator
│   │   ├── placement.ts    # Validate placement, ghost preview
│   │   ├── score.ts        # Score calculation
│   │   ├── gameOver.ts     # Game-over detection
│   │   └── index.ts        # Re-exports everything
│   ├── store/
│   │   └── gameStore.ts    # Zustand global game state
│   ├── components/         # UI components (Week 3)
│   └── hooks/              # Custom React hooks (Week 3)
├── __tests__/
│   ├── grid.test.ts
│   ├── pieces.test.ts
│   ├── placement.test.ts
│   ├── score.test.ts
│   └── gameOver.test.ts
└── assets/
```

> **Rule:** Nothing inside `src/engine/` imports from React or React Native. Pure TypeScript. This makes testing trivial and logic fully portable.

---

## 3. Grid Data Model

### `src/engine/constants.ts`

```typescript
export const GRID_SIZE = 8; // 8×8 grid — same as Block Blast

// Neon color palette (matches game-concept.md)
export const BLOCK_COLORS = [
  '#00D4FF', // Electric blue
  '#39FF14', // Neon green
  '#FF006E', // Hot pink
  '#FFB800', // Amber
  '#BF00FF', // Violet
  '#FF4500', // Coral
  '#00FFCC', // Cyan
] as const;

export type BlockColor = typeof BLOCK_COLORS[number];

// Scoring
export const SCORE_PER_CELL = 1;
export const CLEAR_BONUS: Record<number, number> = {
  1: 10,   // 1 line cleared
  2: 30,   // 2 lines cleared simultaneously
  3: 60,   // 3 lines cleared
  4: 100,  // 4 lines (rare — reward it)
};
```

### `src/engine/types.ts`

```typescript
import { BlockColor } from './constants';

// A single cell in the grid
export type Cell =
  | { filled: false }
  | { filled: true; color: BlockColor };

// The full 8×8 grid — row-major: grid[row][col]
// grid[0][0] = top-left, grid[7][7] = bottom-right
export type Grid = Cell[][];

// A single piece shape — array of [row, col] offsets from origin (top-left of bounding box)
export type PieceShape = [number, number][];

export interface Piece {
  id: string;             // unique identifier e.g. 'L_SHAPE'
  shape: PieceShape;      // cells this piece occupies
  color: BlockColor;      // neon color assigned at generation time
  boundingBox: {          // width/height of the piece's bounding box
    rows: number;
    cols: number;
  };
}

// A positioned piece (during drag / ghost preview)
export interface PlacedPiece {
  piece: Piece;
  originRow: number;      // top-left grid row
  originCol: number;      // top-left grid col
}

export interface ClearResult {
  clearedRows: number[];  // indices of rows cleared
  clearedCols: number[];  // indices of cols cleared
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
```

### `src/engine/grid.ts`

```typescript
import { GRID_SIZE, BlockColor } from './constants';
import { Cell, Grid, PlacedPiece, ClearResult } from './types';
import { calculateClearBonus } from './score';

/** Create a fresh empty 8×8 grid */
export function createGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, (): Cell => ({ filled: false }))
  );
}

/** Deep-clone a grid (never mutate state directly) */
export function cloneGrid(grid: Grid): Grid {
  return grid.map(row => row.map(cell => ({ ...cell })));
}

/** Apply a placed piece to the grid — returns a new grid */
export function applyPieceToGrid(grid: Grid, placed: PlacedPiece): Grid {
  const next = cloneGrid(grid);
  for (const [dr, dc] of placed.piece.shape) {
    const r = placed.originRow + dr;
    const c = placed.originCol + dc;
    next[r][c] = { filled: true, color: placed.piece.color };
  }
  return next;
}

/** Check which rows are completely filled */
export function getFilledRows(grid: Grid): number[] {
  const filled: number[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    if (grid[r].every(cell => cell.filled)) {
      filled.push(r);
    }
  }
  return filled;
}

/** Check which columns are completely filled */
export function getFilledCols(grid: Grid): number[] {
  const filled: number[] = [];
  for (let c = 0; c < GRID_SIZE; c++) {
    if (grid.every(row => row[c].filled)) {
      filled.push(c);
    }
  }
  return filled;
}

/**
 * Core clear function.
 * 1. Find all filled rows and columns
 * 2. Clear them simultaneously (both rows and cols cleared at once)
 * 3. Calculate score bonus
 * Returns a ClearResult with the new grid and score earned.
 */
export function clearFilledLines(grid: Grid): ClearResult {
  const clearedRows = getFilledRows(grid);
  const clearedCols = getFilledCols(grid);
  const totalLinesCleared = clearedRows.length + clearedCols.length;

  if (totalLinesCleared === 0) {
    return {
      clearedRows: [],
      clearedCols: [],
      totalLinesCleared: 0,
      scoreEarned: 0,
      newGrid: grid,
    };
  }

  const next = cloneGrid(grid);

  // Clear rows
  for (const r of clearedRows) {
    for (let c = 0; c < GRID_SIZE; c++) {
      next[r][c] = { filled: false };
    }
  }

  // Clear cols
  for (const c of clearedCols) {
    for (let r = 0; r < GRID_SIZE; r++) {
      next[r][c] = { filled: false };
    }
  }

  const scoreEarned = calculateClearBonus(totalLinesCleared);

  return {
    clearedRows,
    clearedCols,
    totalLinesCleared,
    scoreEarned,
    newGrid: next,
  };
}
```

---

## 4. Row & Column Clear Logic

### How simultaneous clears work

A cell can be at the intersection of a filled row AND a filled column. It gets cleared once — no double-clear issue since we're setting to `{ filled: false }` idempotently.

### Clear sequence (important for animation timing)

```
1. Player places piece
2. applyPieceToGrid()         → new grid with piece placed
3. clearFilledLines()         → detect + clear rows/cols, get score
4. Trigger clear animation    → flash cleared cells (Week 3 — UI)
5. Update score               → add clearResult.scoreEarned + cell points
6. checkGameOver()            → with next 3 pieces vs new grid
7. If game over → show screen
8. If not → continue
```

---

## 5. Piece Definitions

### `src/engine/pieces.ts`

All shapes defined as `[row, col]` offsets. Origin is always `[0, 0]` (top-left of bounding box).

```typescript
import { PieceShape, Piece, BlockColor } from './types';
import { BLOCK_COLORS } from './constants';

// ─── Shape Library ────────────────────────────────────────────────────────────

export const PIECE_SHAPES: Record<string, { shape: PieceShape; rows: number; cols: number }> = {
  // Single cell (1×1) — rare gift piece
  SINGLE: {
    shape: [[0, 0]],
    rows: 1,
    cols: 1,
  },

  // Domino (1×2) horizontal
  DOMINO_H: {
    shape: [[0, 0], [0, 1]],
    rows: 1,
    cols: 2,
  },

  // Domino (2×1) vertical
  DOMINO_V: {
    shape: [[0, 0], [1, 0]],
    rows: 2,
    cols: 1,
  },

  // Line 3 horizontal
  LINE3_H: {
    shape: [[0, 0], [0, 1], [0, 2]],
    rows: 1,
    cols: 3,
  },

  // Line 3 vertical
  LINE3_V: {
    shape: [[0, 0], [1, 0], [2, 0]],
    rows: 3,
    cols: 1,
  },

  // Line 4 horizontal (less common)
  LINE4_H: {
    shape: [[0, 0], [0, 1], [0, 2], [0, 3]],
    rows: 1,
    cols: 4,
  },

  // Line 4 vertical (less common)
  LINE4_V: {
    shape: [[0, 0], [1, 0], [2, 0], [3, 0]],
    rows: 4,
    cols: 1,
  },

  // 2×2 Square
  SQUARE: {
    shape: [[0, 0], [0, 1], [1, 0], [1, 1]],
    rows: 2,
    cols: 2,
  },

  // L-shape (2×2 minus top-right)
  L_SHAPE: {
    shape: [[0, 0], [1, 0], [1, 1]],
    rows: 2,
    cols: 2,
  },

  // J-shape (mirror of L — 2×2 minus top-left)
  J_SHAPE: {
    shape: [[0, 1], [1, 0], [1, 1]],
    rows: 2,
    cols: 2,
  },

  // T-shape (3 across, 1 down center)
  T_SHAPE: {
    shape: [[0, 0], [0, 1], [0, 2], [1, 1]],
    rows: 2,
    cols: 3,
  },

  // T-shape rotated 90° (3 down, 1 right center)
  T_SHAPE_R: {
    shape: [[0, 0], [1, 0], [2, 0], [1, 1]],
    rows: 3,
    cols: 2,
  },

  // S-shape
  S_SHAPE: {
    shape: [[0, 1], [0, 2], [1, 0], [1, 1]],
    rows: 2,
    cols: 3,
  },

  // Z-shape
  Z_SHAPE: {
    shape: [[0, 0], [0, 1], [1, 1], [1, 2]],
    rows: 2,
    cols: 3,
  },

  // Big L (3×2)
  BIG_L: {
    shape: [[0, 0], [1, 0], [2, 0], [2, 1]],
    rows: 3,
    cols: 2,
  },

  // Big J (3×2 mirror)
  BIG_J: {
    shape: [[0, 1], [1, 1], [2, 0], [2, 1]],
    rows: 3,
    cols: 2,
  },
};

// ─── Piece Weights (higher = more common) ─────────────────────────────────────

const PIECE_WEIGHTS: Record<string, number> = {
  SINGLE:    1,   // rare — gift piece
  DOMINO_H:  6,
  DOMINO_V:  6,
  LINE3_H:   8,
  LINE3_V:   8,
  LINE4_H:   3,
  LINE4_V:   3,
  SQUARE:    8,
  L_SHAPE:   7,
  J_SHAPE:   7,
  T_SHAPE:   6,
  T_SHAPE_R: 6,
  S_SHAPE:   4,
  Z_SHAPE:   4,
  BIG_L:     3,
  BIG_J:     3,
};

// ─── Generator ────────────────────────────────────────────────────────────────

function getRandomColor(): BlockColor {
  return BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
}

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

/**
 * Generate exactly 3 pieces for the current turn.
 *
 * Rules:
 * - Colors are assigned randomly and independently per piece
 * - Never give 3 line-4 pieces simultaneously (too hard to place)
 * - Each piece gets a unique color (no two same color in a set of 3)
 */
export function generatePieceSet(): [Piece, Piece, Piece] {
  const usedColors = new Set<BlockColor>();

  function makePiece(): Piece {
    let pieceId = weightedRandomPieceId();

    // Pick a color not already used in this set
    let color: BlockColor;
    const availableColors = BLOCK_COLORS.filter(c => !usedColors.has(c));
    color = availableColors[Math.floor(Math.random() * availableColors.length)];
    usedColors.add(color);

    const def = PIECE_SHAPES[pieceId];
    return {
      id: pieceId,
      shape: def.shape,
      color,
      boundingBox: { rows: def.rows, cols: def.cols },
    };
  }

  const pieces: Piece[] = [];
  let line4Count = 0;

  for (let i = 0; i < 3; i++) {
    let piece = makePiece();

    // Prevent 3× LINE4 in same set
    if (piece.id === 'LINE4_H' || piece.id === 'LINE4_V') {
      line4Count++;
      if (line4Count > 1) {
        // Re-roll until we get something else
        while (piece.id === 'LINE4_H' || piece.id === 'LINE4_V') {
          piece = makePiece();
        }
        line4Count--;
      }
    }

    pieces.push(piece);
  }

  return pieces as [Piece, Piece, Piece];
}
```

---

## 6. Placement & Validation

### `src/engine/placement.ts`

```typescript
import { GRID_SIZE } from './constants';
import { Grid, Piece, PlacedPiece } from './types';

/**
 * Check if a piece can be placed at (originRow, originCol) on the grid.
 * Returns true only if:
 * 1. All cells are within bounds (0 to GRID_SIZE-1)
 * 2. No cell is already filled
 */
export function isValidPlacement(
  grid: Grid,
  piece: Piece,
  originRow: number,
  originCol: number
): boolean {
  for (const [dr, dc] of piece.shape) {
    const r = originRow + dr;
    const c = originCol + dc;

    // Bounds check
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) {
      return false;
    }

    // Overlap check
    if (grid[r][c].filled) {
      return false;
    }
  }
  return true;
}

/**
 * Given a pixel drag position, convert to grid (row, col) origin.
 * Used by the gesture handler to snap the piece to the grid.
 *
 * @param dragX        - Absolute X position of drag (pixels)
 * @param dragY        - Absolute Y position of drag (pixels)
 * @param gridOriginX  - Pixel X of grid top-left corner
 * @param gridOriginY  - Pixel Y of grid top-left corner
 * @param cellSize     - Size of each cell in pixels
 * @param piece        - The piece being dragged (for centering offset)
 */
export function pixelToGridOrigin(
  dragX: number,
  dragY: number,
  gridOriginX: number,
  gridOriginY: number,
  cellSize: number,
  piece: Piece
): { row: number; col: number } {
  // Center the piece on the finger
  const offsetX = dragX - gridOriginX - (piece.boundingBox.cols * cellSize) / 2;
  const offsetY = dragY - gridOriginY - (piece.boundingBox.rows * cellSize) / 2;

  const col = Math.round(offsetX / cellSize);
  const row = Math.round(offsetY / cellSize);

  return { row, col };
}

/**
 * Find the best valid snap position near a given (row, col).
 * Returns the closest valid origin, or null if nowhere nearby is valid.
 * Search radius: 1 cell in all directions.
 */
export function findSnapPosition(
  grid: Grid,
  piece: Piece,
  preferredRow: number,
  preferredCol: number
): { row: number; col: number } | null {
  // Try exact position first
  if (isValidPlacement(grid, piece, preferredRow, preferredCol)) {
    return { row: preferredRow, col: preferredCol };
  }

  // Try adjacent positions (1-cell radius)
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

/**
 * Get all valid placement positions for a piece on the current grid.
 * Used for game-over detection.
 */
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
```

---

## 7. Ghost Preview Logic

The ghost preview shows a **translucent overlay** on the grid where the piece would land if the player releases their finger now. It is calculated every frame during drag — no state storage needed.

```typescript
// src/engine/placement.ts — add this function

/**
 * Returns the ghost cells (the grid positions the piece would occupy)
 * at the current snap position. Returns empty array if invalid.
 */
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
```

**UI usage (Week 3):** During drag, render ghost cells as the piece color at 30% opacity (`rgba(color, 0.3)`). On a valid position show the ghost. On an invalid position show nothing (or a red tint).

---

## 8. Score System

### `src/engine/score.ts`

```typescript
import { SCORE_PER_CELL, CLEAR_BONUS } from './constants';
import { Piece, ScoreResult } from './types';

/**
 * Score earned for placing a piece (cells placed × 1 point each)
 */
export function calculatePlacementScore(piece: Piece): number {
  return piece.shape.length * SCORE_PER_CELL;
}

/**
 * Bonus score for clearing N lines simultaneously.
 * Uses the CLEAR_BONUS table; defaults to 100 for 4+ lines.
 */
export function calculateClearBonus(linesCleared: number): number {
  if (linesCleared === 0) return 0;
  return CLEAR_BONUS[linesCleared] ?? CLEAR_BONUS[4];
}

/**
 * Full score calculation for one placement + its resulting clears.
 */
export function calculateTurnScore(
  piece: Piece,
  linesCleared: number
): ScoreResult {
  const cellPoints = calculatePlacementScore(piece);
  const clearBonus = calculateClearBonus(linesCleared);
  return {
    cellPoints,
    clearBonus,
    total: cellPoints + clearBonus,
    linesCleared,
  };
}
```

### Scoring table reference

| Action | Points | Notes |
|---|---|---|
| Place 1 cell | 1 | All pieces earn this |
| Place a 2×2 square | 4 | 4 cells × 1 |
| Place a line-4 | 4 | 4 cells × 1 |
| Clear 1 line | 10 bonus | Added on top of placement points |
| Clear 2 lines | 30 bonus | Jumping from 10 to 30 — rewards combos |
| Clear 3 lines | 60 bonus | |
| Clear 4 lines | 100 bonus | Very rare — celebrate it |

---

## 9. Game-Over Detection

### `src/engine/gameOver.ts`

```typescript
import { Grid, Piece } from './types';
import { getAllValidPlacements } from './placement';

/**
 * Game over occurs when NONE of the 3 current pieces can be placed
 * ANYWHERE on the grid.
 *
 * Note: A piece is "placeable" if at least one valid (row, col) origin exists.
 * We only need to find ONE valid position per piece — short-circuit as soon as found.
 */
export function checkGameOver(
  grid: Grid,
  pieces: [Piece, Piece, Piece],
  usedPieces: [boolean, boolean, boolean]
): boolean {
  for (let i = 0; i < 3; i++) {
    if (usedPieces[i]) continue; // already played this turn
    if (getAllValidPlacements(grid, pieces[i]).length > 0) {
      return false;
    }
  }
  return true;
}

/**
 * Check game over only for a specific piece.
 * Used when pieces are placed one-by-one to check remaining pieces.
 */
export function isPiecePlayable(grid: Grid, piece: Piece): boolean {
  return getAllValidPlacements(grid, piece).length > 0;
}
```

### Game-over sequence

```
1. Player places a piece
2. Grid is updated (applyPieceToGrid)
3. Lines are cleared (clearFilledLines)
4. New piece set is generated (if all 3 pieces used up)
5. isGameOver(newGrid, currentPieces) → called here
6. If true → trigger game-over screen
7. If false → update state, continue
```

---

## 10. Game State (Zustand Store)

### `src/store/gameStore.ts`

```typescript
import { create } from 'zustand';
import { Grid, Piece, ClearResult } from '../engine/types';
import { createGrid, applyPieceToGrid, clearFilledLines } from '../engine/grid';
import { generatePieceSet } from '../engine/pieces';
import { isGameOver } from '../engine/gameOver';
import { calculateTurnScore } from '../engine/score';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BEST_SCORE_KEY = '@blockrush_best_score';
const SAVED_GAME_KEY = '@blockrush_saved_game';

interface GameState {
  // Grid
  grid: Grid;

  // Current 3 pieces available to place
  currentPieces: [Piece, Piece, Piece];

  // Which of the 3 pieces has been used (null = available)
  usedPieces: [boolean, boolean, boolean];

  // Score
  score: number;
  bestScore: number;

  // Game status
  isGameOver: boolean;
  isAnimating: boolean; // true while clear animation plays — blocks input

  // Actions
  placePiece: (pieceIndex: 0 | 1 | 2, originRow: number, originCol: number) => void;
  startNewGame: () => void;
  loadBestScore: () => Promise<void>;
  saveGame: () => Promise<void>;
  loadSavedGame: () => Promise<boolean>;
}

export const useGameStore = create<GameState>((set, get) => ({
  grid: createGrid(),
  currentPieces: generatePieceSet(),
  usedPieces: [false, false, false],
  score: 0,
  bestScore: 0,
  isGameOver: false,
  isAnimating: false,

  placePiece: (pieceIndex, originRow, originCol) => {
    const { grid, currentPieces, usedPieces, score } = get();

    if (get().isAnimating) return; // Block input during animation
    if (usedPieces[pieceIndex]) return; // Piece already used

    const piece = currentPieces[pieceIndex];

    // 1. Apply piece to grid
    const gridAfterPlace = applyPieceToGrid(grid, { piece, originRow, originCol });

    // 2. Calculate placement score
    const clearResult = clearFilledLines(gridAfterPlace);
    const turnScore = calculateTurnScore(piece, clearResult.totalLinesCleared);

    // 3. Mark piece as used
    const newUsedPieces: [boolean, boolean, boolean] = [...usedPieces] as [boolean, boolean, boolean];
    newUsedPieces[pieceIndex] = true;

    // 4. Check if all 3 pieces used — generate new set
    const allUsed = newUsedPieces.every(Boolean);
    const nextPieces: [Piece, Piece, Piece] = allUsed
      ? generatePieceSet()
      : currentPieces;
    const nextUsed: [boolean, boolean, boolean] = allUsed
      ? [false, false, false]
      : newUsedPieces;

    // 5. Calculate new score
    const newScore = score + turnScore.total;
    const newBestScore = Math.max(newScore, get().bestScore);

    // 6. Check game over
    const gameOver = checkGameOver(clearResult.newGrid, nextPieces, nextUsed);

    // 7. Commit state
    set({
      grid: clearResult.newGrid,
      currentPieces: nextPieces,
      usedPieces: nextUsed,
      score: newScore,
      bestScore: newBestScore,
      isGameOver: gameOver,
    });

    // 8. Persist best score async
    if (newBestScore > get().bestScore) {
      AsyncStorage.setItem(BEST_SCORE_KEY, String(newBestScore));
    }
  },

  startNewGame: () => {
    set({
      grid: createGrid(),
      currentPieces: generatePieceSet(),
      usedPieces: [false, false, false],
      score: 0,
      isGameOver: false,
      isAnimating: false,
    });
    AsyncStorage.removeItem(SAVED_GAME_KEY);
  },

  loadBestScore: async () => {
    const saved = await AsyncStorage.getItem(BEST_SCORE_KEY);
    if (saved) {
      set({ bestScore: parseInt(saved, 10) });
    }
  },

  saveGame: async () => {
    const { grid, currentPieces, usedPieces, score } = get();
    const saveData = JSON.stringify({ grid, currentPieces, usedPieces, score });
    await AsyncStorage.setItem(SAVED_GAME_KEY, saveData);
  },

  loadSavedGame: async () => {
    const saved = await AsyncStorage.getItem(SAVED_GAME_KEY);
    if (!saved) return false;
    try {
      const data = JSON.parse(saved);
      set({
        grid: data.grid,
        currentPieces: data.currentPieces,
        usedPieces: data.usedPieces,
        score: data.score,
        isGameOver: false,
      });
      return true;
    } catch {
      return false;
    }
  },
}));
```

---

## 11. Drag-and-Drop (Gesture Handler)

This lives in a component (Week 3), but the logic contract is defined here so the engine is built to support it.

### How gesture → grid position works

```
Finger position (px)
      ↓
pixelToGridOrigin()       → (row, col) — raw, may be off-grid
      ↓
findSnapPosition()         → nearest valid (row, col) or null
      ↓
isValidPlacement()         → bool — show green ghost or nothing
      ↓
getGhostCells()            → list of cells to highlight
      ↓
On release:
  placePiece(index, row, col)  → updates Zustand store
```

### Gesture component skeleton (Week 3 reference)

```typescript
// src/components/DraggablePiece.tsx — skeleton for Week 3

import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';

// Key values needed from layout (measured in Week 3):
// - gridOriginX, gridOriginY: position of grid on screen
// - cellSize: pixel size per cell

// Gesture handler emits:
// - onDrag(x, y) → calculates ghost position
// - onDrop(x, y) → calls placePiece if valid
```

---

## 12. Unit Tests

### `__tests__/grid.test.ts`

```typescript
import { createGrid, applyPieceToGrid, getFilledRows, getFilledCols, clearFilledLines } from '../src/engine/grid';
import { Piece } from '../src/engine/types';

const mockPiece = (shape: [number, number][]): Piece => ({
  id: 'TEST',
  shape,
  color: '#00D4FF',
  boundingBox: { rows: 1, cols: shape.length },
});

describe('createGrid', () => {
  it('creates an 8×8 grid of empty cells', () => {
    const grid = createGrid();
    expect(grid.length).toBe(8);
    expect(grid[0].length).toBe(8);
    expect(grid[0][0].filled).toBe(false);
  });
});

describe('getFilledRows', () => {
  it('returns empty array for empty grid', () => {
    expect(getFilledRows(createGrid())).toEqual([]);
  });

  it('detects a completely filled row', () => {
    const grid = createGrid();
    // Fill row 3 entirely
    for (let c = 0; c < 8; c++) {
      grid[3][c] = { filled: true, color: '#00D4FF' };
    }
    expect(getFilledRows(grid)).toEqual([3]);
  });

  it('does not count partially filled rows', () => {
    const grid = createGrid();
    grid[0][0] = { filled: true, color: '#00D4FF' };
    expect(getFilledRows(grid)).toEqual([]);
  });
});

describe('getFilledCols', () => {
  it('detects a completely filled column', () => {
    const grid = createGrid();
    for (let r = 0; r < 8; r++) {
      grid[r][5] = { filled: true, color: '#39FF14' };
    }
    expect(getFilledCols(grid)).toEqual([5]);
  });
});

describe('clearFilledLines', () => {
  it('returns no clears on empty grid', () => {
    const result = clearFilledLines(createGrid());
    expect(result.totalLinesCleared).toBe(0);
    expect(result.scoreEarned).toBe(0);
  });

  it('clears a full row and awards 10 bonus points', () => {
    const grid = createGrid();
    for (let c = 0; c < 8; c++) {
      grid[0][c] = { filled: true, color: '#00D4FF' };
    }
    const result = clearFilledLines(grid);
    expect(result.clearedRows).toEqual([0]);
    expect(result.totalLinesCleared).toBe(1);
    expect(result.scoreEarned).toBe(10);
    expect(result.newGrid[0][0].filled).toBe(false);
  });

  it('clears row and column simultaneously', () => {
    const grid = createGrid();
    // Fill row 2
    for (let c = 0; c < 8; c++) grid[2][c] = { filled: true, color: '#00D4FF' };
    // Fill col 4
    for (let r = 0; r < 8; r++) grid[r][4] = { filled: true, color: '#39FF14' };

    const result = clearFilledLines(grid);
    expect(result.clearedRows).toContain(2);
    expect(result.clearedCols).toContain(4);
    expect(result.totalLinesCleared).toBe(2);
    expect(result.scoreEarned).toBe(30); // 2-line bonus
    // Intersection cell [2][4] cleared once
    expect(result.newGrid[2][4].filled).toBe(false);
  });
});
```

### `__tests__/placement.test.ts`

```typescript
import { createGrid } from '../src/engine/grid';
import { isValidPlacement, getAllValidPlacements } from '../src/engine/placement';
import { Piece } from '../src/engine/types';

const linePiece: Piece = {
  id: 'LINE3_H',
  shape: [[0, 0], [0, 1], [0, 2]],
  color: '#00D4FF',
  boundingBox: { rows: 1, cols: 3 },
};

describe('isValidPlacement', () => {
  it('allows valid in-bounds placement', () => {
    expect(isValidPlacement(createGrid(), linePiece, 0, 0)).toBe(true);
  });

  it('rejects out-of-bounds placement (right edge)', () => {
    // col 6,7,8 — col 8 is out of bounds
    expect(isValidPlacement(createGrid(), linePiece, 0, 6)).toBe(false);
  });

  it('rejects placement on filled cells', () => {
    const grid = createGrid();
    grid[0][1] = { filled: true, color: '#39FF14' };
    expect(isValidPlacement(grid, linePiece, 0, 0)).toBe(false);
  });
});

describe('getAllValidPlacements', () => {
  it('returns placements for LINE3_H on empty grid', () => {
    const placements = getAllValidPlacements(createGrid(), linePiece);
    // Can start at col 0–5 (6 positions) on any of 8 rows = 48 total
    expect(placements.length).toBe(48);
  });

  it('returns empty array when piece cannot be placed', () => {
    // Fill entire grid
    const grid = createGrid();
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        grid[r][c] = { filled: true, color: '#00D4FF' };
    expect(getAllValidPlacements(grid, linePiece)).toHaveLength(0);
  });
});
```

### `__tests__/gameOver.test.ts`

```typescript
import { createGrid } from '../src/engine/grid';
import { isGameOver } from '../src/engine/gameOver';
import { generatePieceSet } from '../src/engine/pieces';
import { Piece } from '../src/engine/types';

const tinyPiece: Piece = {
  id: 'SINGLE',
  shape: [[0, 0]],
  color: '#00D4FF',
  boundingBox: { rows: 1, cols: 1 },
};

describe('isGameOver', () => {
  it('is NOT game over on empty grid with any pieces', () => {
    const pieces = generatePieceSet();
    expect(isGameOver(createGrid(), pieces)).toBe(false);
  });

  it('is NOT game over when single-cell piece can fit', () => {
    const grid = createGrid();
    // Fill all except one cell
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        grid[r][c] = { filled: true, color: '#00D4FF' };
    grid[7][7] = { filled: false }; // one empty cell

    const pieces: [Piece, Piece, Piece] = [tinyPiece, tinyPiece, tinyPiece];
    expect(isGameOver(grid, pieces)).toBe(false);
  });

  it('IS game over when grid is full', () => {
    const grid = createGrid();
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        grid[r][c] = { filled: true, color: '#00D4FF' };

    const pieces = generatePieceSet();
    expect(isGameOver(grid, pieces)).toBe(true);
  });
});
```

### `__tests__/score.test.ts`

```typescript
import { calculatePlacementScore, calculateClearBonus, calculateTurnScore } from '../src/engine/score';
import { Piece } from '../src/engine/types';

const squarePiece: Piece = {
  id: 'SQUARE',
  shape: [[0,0],[0,1],[1,0],[1,1]],
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
});

describe('calculateTurnScore', () => {
  it('sums placement + clear bonus correctly', () => {
    const result = calculateTurnScore(squarePiece, 2);
    expect(result.cellPoints).toBe(4);
    expect(result.clearBonus).toBe(30);
    expect(result.total).toBe(34);
  });
});
```

---

## 13. Implementation Order

Follow this exactly — each step builds on the last and is independently testable.

```
Day 4   → Project setup, install deps, confirm app runs on device/simulator
Day 5   → types.ts + constants.ts + createGrid() + cloneGrid()
Day 5   → Write and pass: grid creation tests
Day 6   → getFilledRows() + getFilledCols() + clearFilledLines()
Day 6   → Write and pass: clear detection tests
Day 7   → pieces.ts — all PIECE_SHAPES defined
Day 7   → generatePieceSet() — weighted random + color assignment
Day 8   → Write and pass: piece generation tests (check 3 unique colors, no 3× LINE4)
Day 8   → placement.ts — isValidPlacement() + getAllValidPlacements()
Day 9   → Write and pass: placement tests (bounds, overlap)
Day 9   → ghostPreview logic — getGhostCells()
Day 10  → score.ts — all 3 score functions
Day 10  → Write and pass: score tests
Day 11  → gameOver.ts — isGameOver() + isPiecePlayable()
Day 11  → Write and pass: game-over tests
Day 12  → gameStore.ts — Zustand store wiring everything together
Day 12  → Manual integration test: open app, place pieces via console/test harness
          Confirm score updates, lines clear, game-over triggers correctly
```

**Golden rule: `npm test` must be green before moving to the next day.**

---

## 14. Key Contracts & Rules

| Rule | Reason |
|---|---|
| Engine files never import React/RN | Keeps logic testable and portable |
| Never mutate grid in place — always clone | Prevents state bugs, enables undo in future |
| Ghost preview is calculated live, not stored in state | Avoids stale state issues during fast drags |
| `checkGameOver` only checks **unused** tray pieces | Placed shapes may still fit on grid but cannot be replayed |
| Piece colors are assigned at generation time, not placement time | Consistent look across the turn |
| `isAnimating` flag blocks all input during clear animation | Prevents double-placement bugs |

---

*Document owner: Mosin | Last updated: May 2026 | Next: UI & Animations (Week 3)*
