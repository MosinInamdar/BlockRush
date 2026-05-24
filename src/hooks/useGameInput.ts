import { useGameStore } from '../store/gameStore';

/** Whether the player can drag pieces or interact with the board */
export function useGameInput() {
  const isAnimating = useGameStore((s) => s.isAnimating);
  const isGameOver = useGameStore((s) => s.isGameOver);
  const canInteract = !isAnimating && !isGameOver;

  return { canInteract, isAnimating, isGameOver };
}
