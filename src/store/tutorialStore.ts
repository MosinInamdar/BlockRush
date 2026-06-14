import { create } from 'zustand';
import {
  TUTORIAL_COMPLETED_KEY,
  TUTORIAL_HINTS_SHOWN_KEY,
} from '../constants/storageKeys';
import { storageGet, storageSet } from '../utils/safeStorage';

export type TutorialStepId =
  | 'welcome'
  | 'drag'
  | 'place'
  | 'clear'
  | 'combo'
  | 'done';

export type TutorialHighlight =
  | 'none'
  | 'grid'
  | 'tray'
  | 'grid-row'
  | 'drag-demo';

export interface TutorialStep {
  id: TutorialStepId;
  title: string;
  body: string;
  emoji: string;
  highlight: TutorialHighlight;
  /** Advance when the player performs this action. */
  waitFor?: 'placement' | 'clear';
  /** Example row index (0–7) highlighted during the clear step. */
  demoGridRow?: number;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to BlockRush!',
    body: 'Fill rows and columns on the 8×8 grid to clear them and score points.',
    emoji: '🎮',
    highlight: 'grid',
  },
  {
    id: 'drag',
    title: 'Drag a block',
    body: 'Pick up a shape from the tray and drop it on the board.',
    emoji: '✋',
    highlight: 'drag-demo',
    waitFor: 'placement',
  },
  {
    id: 'place',
    title: 'Nice placement!',
    body: 'Blocks snap to the grid. Try to complete a full row or column.',
    emoji: '✅',
    highlight: 'none',
  },
  {
    id: 'clear',
    title: 'Clear lines',
    body: 'Fill an entire row or column — it clears and awards bonus points.',
    emoji: '💥',
    highlight: 'grid-row',
    demoGridRow: 6,
    waitFor: 'clear',
  },
  {
    id: 'combo',
    title: 'Combo bonus',
    body: 'Clear two or more lines at once for a combo and a bigger score boost!',
    emoji: '🔥',
    highlight: 'grid',
  },
  {
    id: 'done',
    title: "You're ready!",
    body: 'Use all three pieces to get a fresh set. Keep playing until no moves remain!',
    emoji: '🚀',
    highlight: 'none',
  },
];

const CONTEXTUAL_HINTS = [
  'Tip: Drag blocks from the tray onto empty grid cells.',
  'Tip: Complete a full row or column to clear it and score bonus points.',
  'Tip: Clear multiple lines at once for a combo bonus!',
  'Tip: If you get stuck, try rotating your strategy — corners are valuable.',
] as const;

interface TutorialState {
  loaded: boolean;
  completed: boolean;
  active: boolean;
  stepIndex: number;
  placementsThisSession: number;
  clearsThisSession: number;
  hintsShown: number;
  currentHint: string | null;
  loadTutorial: () => Promise<void>;
  startTutorial: () => void;
  skipTutorial: () => Promise<void>;
  advanceStep: () => void;
  completeTutorial: () => Promise<void>;
  recordPlacement: () => void;
  recordClear: () => void;
  showNextHint: () => Promise<void>;
  dismissHint: () => void;
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  loaded: false,
  completed: false,
  active: false,
  stepIndex: 0,
  placementsThisSession: 0,
  clearsThisSession: 0,
  hintsShown: 0,
  currentHint: null,

  loadTutorial: async () => {
    const [completedRaw, hintsRaw] = await Promise.all([
      storageGet(TUTORIAL_COMPLETED_KEY),
      storageGet(TUTORIAL_HINTS_SHOWN_KEY),
    ]);
    set({
      loaded: true,
      completed: completedRaw === 'true',
      hintsShown: hintsRaw ? Number.parseInt(hintsRaw, 10) || 0 : 0,
    });
  },

  startTutorial: () => {
    set({
      active: true,
      stepIndex: 0,
      placementsThisSession: 0,
      clearsThisSession: 0,
    });
  },

  skipTutorial: async () => {
    await storageSet(TUTORIAL_COMPLETED_KEY, 'true');
    set({ active: false, completed: true, stepIndex: 0 });
  },

  advanceStep: () => {
    const { stepIndex } = get();
    const next = stepIndex + 1;
    if (next >= TUTORIAL_STEPS.length) {
      void get().completeTutorial();
      return;
    }
    set({ stepIndex: next });
  },

  completeTutorial: async () => {
    await storageSet(TUTORIAL_COMPLETED_KEY, 'true');
    set({ active: false, completed: true });
  },

  recordPlacement: () => {
    const placements = get().placementsThisSession + 1;
    set({ placementsThisSession: placements });

    const step = TUTORIAL_STEPS[get().stepIndex];
    if (get().active && step?.waitFor === 'placement') {
      get().advanceStep();
    }
  },

  recordClear: () => {
    const clears = get().clearsThisSession + 1;
    set({ clearsThisSession: clears });

    const step = TUTORIAL_STEPS[get().stepIndex];
    if (get().active && step?.waitFor === 'clear') {
      get().advanceStep();
    }
  },

  showNextHint: async () => {
    const { hintsShown, completed, active } = get();
    if (!completed || active || hintsShown >= CONTEXTUAL_HINTS.length) return;

    const hint = CONTEXTUAL_HINTS[hintsShown];
    const nextCount = hintsShown + 1;
    await storageSet(TUTORIAL_HINTS_SHOWN_KEY, String(nextCount));
    set({ hintsShown: nextCount, currentHint: hint });
  },

  dismissHint: () => {
    set({ currentHint: null });
  },
}));
