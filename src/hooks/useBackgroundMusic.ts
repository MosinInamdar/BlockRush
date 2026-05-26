import { useEffect } from 'react';
import { backgroundMusic } from '../services/backgroundMusic';
import { useSettingsStore } from '../store/settingsStore';

/** Starts or stops the menu/game music loop based on settings. */
export function useBackgroundMusic(active: boolean) {
  const musicEnabled = useSettingsStore((s) => s.musicEnabled);

  useEffect(() => {
    void backgroundMusic.sync(active && musicEnabled);
    return () => {
      backgroundMusic.stop();
    };
  }, [active, musicEnabled]);
}
