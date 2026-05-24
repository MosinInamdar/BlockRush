import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { isGameSavable, useGameStore } from '../store/gameStore';

/** Persists in-progress games when the app backgrounds or the game screen blurs. */
export function useAutoSaveGame() {
  const saveGame = useGameStore((s) => s.saveGame);

  const persistIfNeeded = useCallback(() => {
    const state = useGameStore.getState();
    if (isGameSavable(state)) {
      void saveGame();
    }
  }, [saveGame]);

  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next === 'background' || next === 'inactive') {
        persistIfNeeded();
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [persistIfNeeded]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        persistIfNeeded();
      };
    }, [persistIfNeeded])
  );
}
