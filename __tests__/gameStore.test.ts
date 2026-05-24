import AsyncStorage from '@react-native-async-storage/async-storage';
import { createGrid } from '../src/engine/grid';
import { checkGameOver } from '../src/engine/gameOver';
import { Piece } from '../src/engine/types';
import {
  BEST_SCORE_KEY,
  isGameSavable,
  resetGameStore,
  SAVED_GAME_KEY,
  useGameStore,
} from '../src/store/gameStore';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

const singlePiece = (): Piece => ({
  id: 'SINGLE',
  shape: [[0, 0]],
  color: '#00D4FF',
  boundingBox: { rows: 1, cols: 1 },
});

beforeEach(() => {
  jest.clearAllMocks();
  resetGameStore();
  useGameStore.setState({
    currentPieces: [singlePiece(), singlePiece(), singlePiece()],
    usedPieces: [false, false, false],
  });
});

describe('placePiece', () => {
  it('places a valid piece and increases score', () => {
    const placed = useGameStore.getState().placePiece(0, 0, 0);
    const { score, grid, usedPieces } = useGameStore.getState();

    expect(placed).toBe(true);
    expect(score).toBe(1);
    expect(grid[0][0].filled).toBe(true);
    expect(usedPieces[0]).toBe(true);
  });

  it('rejects invalid placement', () => {
    useGameStore.getState().placePiece(0, 0, 0);
    const placed = useGameStore.getState().placePiece(1, 0, 0);

    expect(placed).toBe(false);
    expect(useGameStore.getState().score).toBe(1);
  });

  it('rejects placing an already-used piece slot', () => {
    useGameStore.getState().placePiece(0, 0, 0);
    const placed = useGameStore.getState().placePiece(0, 1, 1);

    expect(placed).toBe(false);
  });

  it('blocks input while animating', () => {
    useGameStore.getState().setAnimating(true);
    const placed = useGameStore.getState().placePiece(0, 0, 0);
    expect(placed).toBe(false);
  });

  it('blocks input after game over', () => {
    useGameStore.setState({ isGameOver: true });
    const placed = useGameStore.getState().placePiece(0, 0, 0);
    expect(placed).toBe(false);
  });

  it('refreshes piece tray after all three are used', () => {
    useGameStore.getState().placePiece(0, 0, 0);
    useGameStore.getState().placePiece(1, 0, 1);
    useGameStore.getState().placePiece(2, 0, 2);

    const { usedPieces, score } = useGameStore.getState();
    expect(usedPieces).toEqual([false, false, false]);
    expect(score).toBe(3);
  });

  it('awards line-clear bonus after clear animation commits', () => {
    const grid = createGrid();
    for (let c = 0; c < 7; c++) {
      grid[0][c] = { filled: true, color: '#39FF14' };
    }

    useGameStore.setState({
      grid,
      currentPieces: [singlePiece(), singlePiece(), singlePiece()],
      usedPieces: [false, false, false],
      score: 0,
    });

    useGameStore.getState().placePiece(0, 0, 7);
    expect(useGameStore.getState().clearEffect).not.toBeNull();
    expect(useGameStore.getState().isAnimating).toBe(true);
    expect(useGameStore.getState().score).toBe(0);

    useGameStore.getState().commitClearAnimation();
    expect(useGameStore.getState().score).toBe(11);
    expect(useGameStore.getState().grid[0].every((cell) => !cell.filled)).toBe(true);
    expect(useGameStore.getState().isAnimating).toBe(false);
  });
});

describe('startNewGame', () => {
  it('resets score and clears saved game', () => {
    useGameStore.getState().placePiece(0, 0, 0);
    useGameStore.getState().startNewGame();

    const state = useGameStore.getState();
    expect(state.score).toBe(0);
    expect(state.isGameOver).toBe(false);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(SAVED_GAME_KEY);
  });
});

describe('loadBestScore', () => {
  it('loads persisted best score', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('420');
    await useGameStore.getState().loadBestScore();
    expect(useGameStore.getState().bestScore).toBe(420);
  });
});

describe('placePiece best score persistence', () => {
  it('writes best score when beaten', () => {
    useGameStore.setState({ bestScore: 0, score: 0 });
    useGameStore.getState().placePiece(0, 0, 0);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(BEST_SCORE_KEY, '1');
    expect(useGameStore.getState().bestScore).toBe(1);
  });

  it('does not write when score does not beat best', () => {
    useGameStore.setState({ bestScore: 100 });
    useGameStore.getState().placePiece(0, 0, 0);
    expect(AsyncStorage.setItem).not.toHaveBeenCalledWith(
      BEST_SCORE_KEY,
      expect.any(String)
    );
  });
});

describe('isGameSavable', () => {
  it('is false for a fresh game', () => {
    expect(isGameSavable(useGameStore.getState())).toBe(false);
  });

  it('is true after a placement', () => {
    useGameStore.getState().placePiece(0, 0, 0);
    expect(isGameSavable(useGameStore.getState())).toBe(true);
  });

  it('is false when game is over', () => {
    useGameStore.setState({ isGameOver: true, score: 10 });
    expect(isGameSavable(useGameStore.getState())).toBe(false);
  });
});

describe('saveGame / loadSavedGame', () => {
  it('does not write when nothing to save', async () => {
    await useGameStore.getState().saveGame();
    expect(AsyncStorage.setItem).not.toHaveBeenCalledWith(
      SAVED_GAME_KEY,
      expect.any(String)
    );
  });

  it('round-trips game state through AsyncStorage', async () => {
    useGameStore.getState().placePiece(0, 0, 0);
    const before = useGameStore.getState();

    await useGameStore.getState().saveGame();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      SAVED_GAME_KEY,
      expect.stringContaining('"score":1')
    );

    resetGameStore();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({
        grid: before.grid,
        currentPieces: before.currentPieces,
        usedPieces: before.usedPieces,
        score: before.score,
      })
    );

    const loaded = await useGameStore.getState().loadSavedGame();
    expect(loaded).toBe(true);
    expect(useGameStore.getState().score).toBe(1);
    expect(useGameStore.getState().grid[0][0].filled).toBe(true);
  });

  it('returns false when no save exists', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const loaded = await useGameStore.getState().loadSavedGame();
    expect(loaded).toBe(false);
  });

  it('clears corrupt save data', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('{not valid json');
    const loaded = await useGameStore.getState().loadSavedGame();
    expect(loaded).toBe(false);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(SAVED_GAME_KEY);
  });

  it('sets bestScoreAtRunStart when loading a save', async () => {
    useGameStore.setState({ bestScore: 99 });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({
        grid: createGrid(),
        currentPieces: [singlePiece(), singlePiece(), singlePiece()],
        usedPieces: [false, false, false],
        score: 12,
      })
    );
    await useGameStore.getState().loadSavedGame();
    expect(useGameStore.getState().bestScoreAtRunStart).toBe(99);
  });

  it('rejects saved games that are already game over', async () => {
    const grid = createGrid();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        grid[r][c] = { filled: true, color: '#00D4FF' };
      }
    }
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({
        grid,
        currentPieces: [singlePiece(), singlePiece(), singlePiece()],
        usedPieces: [false, false, false],
        score: 5,
      })
    );
    const loaded = await useGameStore.getState().loadSavedGame();
    expect(loaded).toBe(false);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(SAVED_GAME_KEY);
  });
});

describe('isRunNewBest', () => {
  it('is true when score beats run-start best', () => {
    useGameStore.setState({ bestScore: 10, bestScoreAtRunStart: 10, score: 15 });
    expect(useGameStore.getState().isRunNewBest()).toBe(true);
  });

  it('is false when score only ties the previous best', () => {
    useGameStore.setState({ bestScore: 10, bestScoreAtRunStart: 10, score: 10 });
    expect(useGameStore.getState().isRunNewBest()).toBe(false);
  });
});

describe('applyRewardedContinue', () => {
  it('resumes when removing blocks creates a valid move', () => {
    const grid = createGrid();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (r === 7 && c === 7) continue;
        grid[r][c] = { filled: true, color: '#00D4FF' };
      }
    }

    useGameStore.setState({
      grid,
      currentPieces: [singlePiece(), singlePiece(), singlePiece()],
      usedPieces: [false, false, false],
      isGameOver: true,
      score: 42,
    });

    const ok = useGameStore.getState().applyRewardedContinue();
    expect(ok).toBe(true);
    expect(useGameStore.getState().isGameOver).toBe(false);
  });

  it('returns false when the run is not over', () => {
    useGameStore.setState({ isGameOver: false });
    expect(useGameStore.getState().applyRewardedContinue()).toBe(false);
  });

  it('refreshes the tray when all pieces were used', () => {
    const grid = createGrid();
    grid[7][7] = { filled: true, color: '#00D4FF' };

    const beforePieces = useGameStore.getState().currentPieces;
    useGameStore.setState({
      grid,
      currentPieces: beforePieces,
      usedPieces: [true, true, true],
      isGameOver: true,
    });

    const ok = useGameStore.getState().applyRewardedContinue();
    expect(ok).toBe(true);
    expect(useGameStore.getState().usedPieces).toEqual([false, false, false]);
  });
});

describe('hasSavedGame / getSavedGameSummary', () => {
  it('returns summary for a valid save', async () => {
    const payload = JSON.stringify({
      grid: createGrid(),
      currentPieces: [singlePiece(), singlePiece(), singlePiece()],
      usedPieces: [false, false, false],
      score: 7,
    });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(payload);
    const summary = await useGameStore.getState().getSavedGameSummary();
    expect(summary).toEqual({ score: 7 });
    expect(await useGameStore.getState().hasSavedGame()).toBe(true);
  });
});

describe('game over detection', () => {
  it('sets isGameOver when no unused tray piece fits', () => {
    const grid = createGrid();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        grid[r][c] = { filled: true, color: '#00D4FF' };
      }
    }

    const currentPieces: [Piece, Piece, Piece] = [
      singlePiece(),
      singlePiece(),
      singlePiece(),
    ];
    const usedPieces: [boolean, boolean, boolean] = [false, false, false];
    useGameStore.setState({
      grid,
      currentPieces,
      usedPieces,
      isGameOver: checkGameOver(grid, currentPieces, usedPieces),
    });

    expect(useGameStore.getState().isGameOver).toBe(true);
  });

  it('triggers game over when last unused piece cannot fit', () => {
    const grid = createGrid();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        grid[r][c] = { filled: true, color: '#00D4FF' };
      }
    }

    const line: Piece = {
      id: 'LINE4_H',
      shape: [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
      ],
      color: '#39FF14',
      boundingBox: { rows: 1, cols: 4 },
    };

    const usedPieces: [boolean, boolean, boolean] = [true, true, false];
    const currentPieces: [Piece, Piece, Piece] = [
      singlePiece(),
      singlePiece(),
      line,
    ];

    useGameStore.setState({
      grid,
      currentPieces,
      usedPieces,
      isGameOver: checkGameOver(grid, currentPieces, usedPieces),
    });

    expect(useGameStore.getState().isGameOver).toBe(true);
  });

  it('does not treat an already-played piece as still playable', () => {
    const grid = createGrid();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (r === 7 && c === 7) continue;
        grid[r][c] = { filled: true, color: '#00D4FF' };
      }
    }

    const pieces: [Piece, Piece, Piece] = [
      singlePiece(),
      line4FromStore(),
      line4FromStore(),
    ];
    const usedPieces: [boolean, boolean, boolean] = [true, true, false];

    expect(checkGameOver(grid, pieces, usedPieces)).toBe(true);
  });
});

function line4FromStore(): Piece {
  return {
    id: 'LINE4_H',
    shape: [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
    ],
    color: '#39FF14',
    boundingBox: { rows: 1, cols: 4 },
  };
}
