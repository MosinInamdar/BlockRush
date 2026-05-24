import { useEffect, useRef } from 'react';
import { initAds, showInterstitialIfAllowed } from '../services/ads/adService';
import { useSettingsStore } from '../store/settingsStore';

/** Shows a capped interstitial shortly after game over (not during animations). */
export function useInterstitialOnGameOver(isGameOver: boolean) {
  const removeAds = useSettingsStore((s) => s.removeAdsPurchased);
  const shownForSession = useRef(false);

  useEffect(() => {
    if (!isGameOver || removeAds) return;
    if (shownForSession.current) return;

    const timer = setTimeout(() => {
      shownForSession.current = true;
      void initAds().then(() => showInterstitialIfAllowed(removeAds));
    }, 600);

    return () => clearTimeout(timer);
  }, [isGameOver, removeAds]);

  useEffect(() => {
    if (!isGameOver) {
      shownForSession.current = false;
    }
  }, [isGameOver]);
}
