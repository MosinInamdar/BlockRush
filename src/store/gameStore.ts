import { create } from 'zustand';
import { analyticsEvents } from '../services/analytics/analyticsService';
import { storageGet, storageRemove, storageSet } from '../utils/safeStorage';
import { trackGameOver, trackLineClear } from './gameStore.analytics';
import {
  ClearedCellSnapshot,
  snapshotClearedCells,
} from '../engine/clearAnimation';
import { applyPieceToGrid, clearFilledLines, createGrid } from '../engine/grid';
import { removeRandomBlocks } from '../engine/gridMutations';
import { checkGameOver } from '../engine/gameOver';
import { generatePieceSet } from '../engine/pieces';
import { isValidPlacement } from '../engine/placement';
import { calculateTurnScore } from '../engine/score';
import { Grid, Piece } from '../engine/types';
import { FeedbackEvent } from '../services/feedback';

export const BEST_SCORE_KEY = '@blockrush_best_score';
export const SAVED_GAME_KEY = '@blockrush_saved_game';

export interface SavedGameData {
  grid: Grid;
  currentPieces: [Piece, Piece, Piece];
  usedPieces: [boolean, boolean, boolean];
  score: number;
}

export interface ClearEffectState {
  cells: ClearedCellSnapshot[];
  clearedRows: number[];
  clearedCols: number[];
  linesCleared: number;
  clearBonus: number;
  turnPoints: number;
  pending: {
    grid: Grid;
    currentPieces: [Piece, Piece, Piece];
    usedPieces: [boolean, boolean, boolean];
    score: number;
    bestScore: number;
    isGameOver: boolean;
  };
}

interface GameState {
  grid: Grid;
  currentPieces: [Piece, Piece, Piece];
  usedPieces: [boolean, boolean, boolean];
  score: number;
  bestScore: number;
  /** Best score at the start of the current run (for “new best” UI). */
  bestScoreAtRunStart: number;
  isGameOver: boolean;
  isAnimating: boolean;
  clearEffect: ClearEffectState | null;
  pendingFeedback: FeedbackEvent | null;
  /** Lines cleared in the current run (for analytics). */
  sessionLinesCleared: number;

  placePiece: (pieceIndex: 0 | 1 | 2, originRow: number, originCol: number) => boolean;
  commitClearAnimation: () => void;
  consumeFeedback: () => FeedbackEvent | null;
  setAnimating: (value: boolean) => void;
  startNewGame: () => void;
  loadBestScore: () => Promise<void>;
  saveGame: () => Promise<void>;
  loadSavedGame: () => Promise<boolean>;
  hasSavedGame: () => Promise<boolean>;
  getSavedGameSummary: () => Promise<{ score: number } | null>;
  clearSavedGame: () => Promise<void>;
  isRunNewBest: () => boolean;
  /** Rewarded ad continue: clear 3 blocks and resume if a move exists. */
  applyRewardedContinue: () => boolean;
}

export function isGameSavable(state: {
  isGameOver: boolean;
  score: number;
  grid: Grid;
  usedPieces: [boolean, boolean, boolean];
}): boolean {
  if (state.isGameOver) return false;
  if (state.score > 0) return true;
  if (state.usedPieces.some(Boolean)) return true;
  return state.grid.some((row) => row.some((cell) => cell.filled));
}

export const useGameStore = create<GameState>((set, get) => ({
  grid: createGrid(),
  currentPieces: generatePieceSet(),
  usedPieces: [false, false, false],
  score: 0,
  bestScore: 0,
  bestScoreAtRunStart: 0,
  isGameOver: false,
  isAnimating: false,
  clearEffect: null,
  pendingFeedback: null,
  sessionLinesCleared: 0,

  placePiece: (pieceIndex, originRow, originCol) => {
    const state = get();
    if (state.isAnimating || state.isGameOver) return false;
    if (state.usedPieces[pieceIndex]) return false;

    const piece = state.currentPieces[pieceIndex];
    if (!isValidPlacement(state.grid, piece, originRow, originCol)) return false;

    const gridAfterPlace = applyPieceToGrid(state.grid, {
      piece,
      originRow,
      originCol,
    });
    const clearResult = clearFilledLines(gridAfterPlace);
    const turnScore = calculateTurnScore(piece, clearResult.totalLinesCleared);

    const newUsedPieces: [boolean, boolean, boolean] = [...state.usedPieces] as [
      boolean,
      boolean,
      boolean,
    ];
    newUsedPieces[pieceIndex] = true;

    const allUsed = newUsedPieces.every(Boolean);
    const nextPieces: [Piece, Piece, Piece] = allUsed
      ? generatePieceSet()
      : state.currentPieces;
    const nextUsed: [boolean, boolean, boolean] = allUsed
      ? [false, false, false]
      : newUsedPieces;

    const newScore = state.score + turnScore.total;
    const previousBest = state.bestScore;
    const newBestScore = Math.max(newScore, previousBest);
    const gameOver = checkGameOver(clearResult.newGrid, nextPieces, nextUsed);

    const pending = {
      grid: clearResult.newGrid,
      currentPieces: nextPieces,
      usedPieces: nextUsed,
      score: newScore,
      bestScore: newBestScore,
      isGameOver: gameOver,
    };

    if (clearResult.totalLinesCleared > 0) {
      const lines = clearResult.totalLinesCleared;
      const feedback: FeedbackEvent = lines >= 2 ? 'combo' : 'clear';
      trackLineClear(
        lines,
        () => get().sessionLinesCleared,
        (n) => set({ sessionLinesCleared: n })
      );

      set({
        isAnimating: true,
        grid: gridAfterPlace,
        clearEffect: {
          cells: snapshotClearedCells(gridAfterPlace, clearResult),
          clearedRows: clearResult.clearedRows,
          clearedCols: clearResult.clearedCols,
          linesCleared: lines,
          clearBonus: clearResult.scoreEarned,
          turnPoints: turnScore.total,
          pending,
        },
        pendingFeedback: feedback,
        score: state.score,
        bestScore: state.bestScore,
        isGameOver: false,
      });
    } else {
      set({
        grid: pending.grid,
        currentPieces: pending.currentPieces,
        usedPieces: pending.usedPieces,
        score: pending.score,
        bestScore: pending.bestScore,
        isGameOver: pending.isGameOver,
        clearEffect: null,
        pendingFeedback: gameOver ? 'gameover' : 'place',
      });
      if (gameOver) {
        trackGameOver(newScore, get().sessionLinesCleared);
      }
    }

    if (newBestScore > previousBest) {
      void storageSet(BEST_SCORE_KEY, String(newBestScore));
    }

    return true;
  },

  commitClearAnimation: () => {
    const effect = get().clearEffect;
    if (!effect) return;

    const { pending } = effect;
    const beatBest = pending.bestScore > get().bestScore;

    set({
      grid: pending.grid,
      currentPieces: pending.currentPieces,
      usedPieces: pending.usedPieces,
      score: pending.score,
      bestScore: pending.bestScore,
      isGameOver: pending.isGameOver,
      clearEffect: null,
      isAnimating: false,
      pendingFeedback: beatBest ? 'newBest' : pending.isGameOver ? 'gameover' : null,
    });

    if (pending.isGameOver) {
      trackGameOver(pending.score, get().sessionLinesCleared);
    }
  },

  consumeFeedback: () => {
    const event = get().pendingFeedback;
    if (event) set({ pendingFeedback: null });
    return event;
  },

  setAnimating: (value) => set({ isAnimating: value }),

  startNewGame: () => {
    const best = get().bestScore;
    set({
      grid: createGrid(),
      currentPieces: generatePieceSet(),
      usedPieces: [false, false, false],
      score: 0,
      isGameOver: false,
      isAnimating: false,
      clearEffect: null,
      pendingFeedback: null,
      bestScoreAtRunStart: best,
      sessionLinesCleared: 0,
    });
    void storageRemove(SAVED_GAME_KEY);
    void analyticsEvents.gameStart('classic');
  },

  loadBestScore: async () => {
    const saved = await storageGet(BEST_SCORE_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!Number.isNaN(parsed)) {
        set({ bestScore: parsed });
      }
    }
  },

  saveGame: async () => {
    const state = get();
    if (!isGameSavable(state)) return;
    const saveData: SavedGameData = {
      grid: state.grid,
      currentPieces: state.currentPieces,
      usedPieces: state.usedPieces,
      score: state.score,
    };
    await storageSet(SAVED_GAME_KEY, JSON.stringify(saveData));
  },

  loadSavedGame: async () => {
    const saved = await storageGet(SAVED_GAME_KEY);
    if (!saved) return false;

    try {
      const data = JSON.parse(saved) as SavedGameData;
      const gameOver = checkGameOver(data.grid, data.currentPieces, data.usedPieces);
      if (gameOver) {
        await storageRemove(SAVED_GAME_KEY);
        return false;
      }
      const best = get().bestScore;
      set({
        grid: data.grid,
        currentPieces: data.currentPieces,
        usedPieces: data.usedPieces,
        score: data.score,
        isGameOver: false,
        isAnimating: false,
        clearEffect: null,
        pendingFeedback: null,
        bestScoreAtRunStart: best,
      });
      return true;
    } catch {
      await storageRemove(SAVED_GAME_KEY);
      return false;
    }
  },

  hasSavedGame: async () => {
    const summary = await get().getSavedGameSummary();
    return summary !== null;
  },

  getSavedGameSummary: async () => {
    const saved = await storageGet(SAVED_GAME_KEY);
    if (!saved) return null;
    try {
      const data = JSON.parse(saved) as SavedGameData;
      if (checkGameOver(data.grid, data.currentPieces, data.usedPieces)) {
        await storageRemove(SAVED_GAME_KEY);
        return null;
      }
      return { score: data.score };
    } catch {
      return null;
    }
  },

  clearSavedGame: async () => {
    await storageRemove(SAVED_GAME_KEY);
  },

  isRunNewBest: () => {
    const { score, bestScoreAtRunStart } = get();
    return score > 0 && score > bestScoreAtRunStart;
  },

  applyRewardedContinue: () => {
    const state = get();
    if (!state.isGameOver) return false;

    const grid = removeRandomBlocks(state.grid, 3);
    let currentPieces = state.currentPieces;
    let usedPieces = state.usedPieces;

    if (usedPieces.every(Boolean)) {
      currentPieces = generatePieceSet();
      usedPieces = [false, false, false];
    }

    if (checkGameOver(grid, currentPieces, usedPieces)) {
      return false;
    }

    set({
      grid,
      currentPieces,
      usedPieces,
      isGameOver: false,
      isAnimating: false,
      clearEffect: null,
      pendingFeedback: null,
    });
    void get().saveGame();
    return true;
  },
}));

export function resetGameStore(): void {
  useGameStore.getState().startNewGame();
  useGameStore.setState({ bestScore: 0, bestScoreAtRunStart: 0, sessionLinesCleared: 0 });
}
