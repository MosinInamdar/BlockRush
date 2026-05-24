import { analyticsEvents } from '../services/analytics/analyticsService';

/** Fires `line_clear` and updates session line tally. */
export function trackLineClear(
  lines: number,
  getSessionLines: () => number,
  setSessionLines: (n: number) => void
) {
  if (lines <= 0) return;
  setSessionLines(getSessionLines() + lines);
  void analyticsEvents.lineClear(lines);
}

/** Fires `game_over` once per run end. */
export function trackGameOver(score: number, sessionLinesCleared: number) {
  void analyticsEvents.gameOver(score, sessionLinesCleared);
}
