import { useEffect, useRef } from 'react';
import { useTutorialStore } from '../store/tutorialStore';

/** Starts the walkthrough for new users and surfaces contextual hints after completion. */
export function useGameTutorial() {
  const loaded = useTutorialStore((s) => s.loaded);
  const completed = useTutorialStore((s) => s.completed);
  const active = useTutorialStore((s) => s.active);
  const currentHint = useTutorialStore((s) => s.currentHint);
  const loadTutorial = useTutorialStore((s) => s.loadTutorial);
  const startTutorial = useTutorialStore((s) => s.startTutorial);
  const showNextHint = useTutorialStore((s) => s.showNextHint);
  const dismissHint = useTutorialStore((s) => s.dismissHint);
  const hintShownThisSession = useRef(false);

  useEffect(() => {
    void loadTutorial();
  }, [loadTutorial]);

  useEffect(() => {
    if (!loaded || completed || active) return;
    startTutorial();
  }, [loaded, completed, active, startTutorial]);

  useEffect(() => {
    if (!loaded || !completed || active || currentHint || hintShownThisSession.current) {
      return;
    }
    hintShownThisSession.current = true;
    void showNextHint();
  }, [loaded, completed, active, currentHint, showNextHint]);

  return {
    tutorialActive: active,
    currentHint,
    dismissHint,
  };
}
