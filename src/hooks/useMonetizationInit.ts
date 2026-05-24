import { useEffect } from 'react';
import { initAds } from '../services/ads/adService';
import { initIap } from '../services/iap/iapService';
import { useSettingsStore } from '../store/settingsStore';

/** Initializes AdMob and IAP once at app launch (no-ops in Expo Go). */
export function useMonetizationInit() {
  const setRemoveAdsPurchased = useSettingsStore((s) => s.setRemoveAdsPurchased);

  useEffect(() => {
    void initAds();
    void initIap(() => setRemoveAdsPurchased(true));
  }, [setRemoveAdsPurchased]);
}
