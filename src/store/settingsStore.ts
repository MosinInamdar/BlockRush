import { create } from 'zustand';
import { REMOVE_ADS_PRODUCT_ID } from '../constants/monetization';
import { analyticsEvents } from '../services/analytics/analyticsService';
import {
  purchaseRemoveAds as requestRemoveAdsPurchase,
  restorePurchases,
} from '../services/iap/iapService';
import { storageGet, storageSet } from '../utils/safeStorage';

const SFX_KEY = '@blockrush_sfx_enabled';
const MUSIC_KEY = '@blockrush_music_enabled';
export const REMOVE_ADS_KEY = '@blockrush_remove_ads';

interface SettingsState {
  sfxEnabled: boolean;
  musicEnabled: boolean;
  removeAdsPurchased: boolean;
  iapBusy: boolean;
  loadSettings: () => Promise<void>;
  setSfxEnabled: (enabled: boolean) => void;
  toggleSfx: () => void;
  setMusicEnabled: (enabled: boolean) => void;
  toggleMusic: () => void;
  setRemoveAdsPurchased: (purchased: boolean) => void;
  purchaseRemoveAds: () => Promise<'success' | 'cancelled' | 'unavailable'>;
  restoreRemoveAds: () => Promise<boolean>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  sfxEnabled: true,
  musicEnabled: false,
  removeAdsPurchased: false,
  iapBusy: false,

  loadSettings: async () => {
    const [sfx, music, removeAds] = await Promise.all([
      storageGet(SFX_KEY),
      storageGet(MUSIC_KEY),
      storageGet(REMOVE_ADS_KEY),
    ]);
    set({
      sfxEnabled: sfx !== null ? sfx === 'true' : true,
      musicEnabled: music === 'true',
      removeAdsPurchased: removeAds === 'true',
    });
  },

  setSfxEnabled: (enabled) => {
    set({ sfxEnabled: enabled });
    void storageSet(SFX_KEY, String(enabled));
  },

  toggleSfx: () => {
    const next = !get().sfxEnabled;
    get().setSfxEnabled(next);
  },

  setMusicEnabled: (enabled) => {
    set({ musicEnabled: enabled });
    void storageSet(MUSIC_KEY, String(enabled));
  },

  toggleMusic: () => {
    const next = !get().musicEnabled;
    get().setMusicEnabled(next);
  },

  setRemoveAdsPurchased: (purchased) => {
    set({ removeAdsPurchased: purchased });
    void storageSet(REMOVE_ADS_KEY, String(purchased));
    if (purchased) {
      void analyticsEvents.iapPurchase(REMOVE_ADS_PRODUCT_ID);
    }
  },

  purchaseRemoveAds: async () => {
    set({ iapBusy: true });
    try {
      const result = await requestRemoveAdsPurchase();
      if (result === 'success') {
        get().setRemoveAdsPurchased(true);
      }
      return result;
    } finally {
      set({ iapBusy: false });
    }
  },

  restoreRemoveAds: async () => {
    set({ iapBusy: true });
    try {
      const restored = await restorePurchases();
      if (restored) {
        set({ removeAdsPurchased: true });
        await storageSet(REMOVE_ADS_KEY, 'true');
        void analyticsEvents.iapPurchase(REMOVE_ADS_PRODUCT_ID);
      }
      return restored;
    } finally {
      set({ iapBusy: false });
    }
  },
}));
