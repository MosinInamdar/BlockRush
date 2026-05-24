import { useEffect } from 'react';
import { feedback } from '../services/feedback';
import { useGameStore } from '../store/gameStore';

/** Plays SFX / haptics when the store queues a feedback event. */
export function useGameFeedback() {
  const pendingFeedback = useGameStore((s) => s.pendingFeedback);
  const consumeFeedback = useGameStore((s) => s.consumeFeedback);
  const clearEffect = useGameStore((s) => s.clearEffect);

  useEffect(() => {
    if (!pendingFeedback) return;
    const event = consumeFeedback();
    if (!event) return;
    const lines = clearEffect?.linesCleared ?? 0;
    void feedback.play(event, lines);
  }, [pendingFeedback, consumeFeedback, clearEffect?.linesCleared]);
}
