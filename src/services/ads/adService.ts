import {
  AD_UNIT_IDS,
  INTERSTITIAL_MIN_INTERVAL_MS,
  LAST_INTERSTITIAL_KEY,
} from '../../constants/monetization';
import { analyticsEvents } from '../analytics/analyticsService';
import { canUseGoogleMobileAds } from '../../utils/nativeModules';
import { storageGet, storageSet } from '../../utils/safeStorage';

type GoogleAdsModule = typeof import('react-native-google-mobile-ads');

let adsModule: GoogleAdsModule | null = null;
let initialized = false;
let initFailed = false;

let interstitialAd: import('react-native-google-mobile-ads').InterstitialAd | null = null;
let interstitialLoaded = false;
let rewardedAd: import('react-native-google-mobile-ads').RewardedAd | null = null;
let rewardedLoaded = false;

export function isAdsNativeAvailable(): boolean {
  return initialized && adsModule !== null;
}

export function getAdsModule(): GoogleAdsModule | null {
  return adsModule;
}

export async function initAds(): Promise<boolean> {
  if (initialized) return adsModule !== null;
  if (initFailed) return false;
  if (!canUseGoogleMobileAds()) {
    initFailed = true;
    initialized = true;
    return false;
  }
  try {
    adsModule = await import('react-native-google-mobile-ads');
    await adsModule.MobileAds().initialize();
    initialized = true;
    preloadInterstitial();
    preloadRewarded();
    return true;
  } catch {
    initFailed = true;
    initialized = true;
    return false;
  }
}

function getInterstitial() {
  if (!adsModule) return null;
  if (!interstitialAd) {
    interstitialAd = adsModule.InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial);
    interstitialAd.addAdEventListener(adsModule.AdEventType.LOADED, () => {
      interstitialLoaded = true;
    });
    interstitialAd.addAdEventListener(adsModule.AdEventType.CLOSED, () => {
      interstitialLoaded = false;
      preloadInterstitial();
    });
    interstitialAd.addAdEventListener(adsModule.AdEventType.ERROR, () => {
      interstitialLoaded = false;
      preloadInterstitial();
    });
  }
  return interstitialAd;
}

function preloadInterstitial() {
  if (!adsModule) return;
  const ad = getInterstitial();
  if (!ad) return;
  interstitialLoaded = false;
  ad.load();
}

function getRewarded() {
  if (!adsModule) return null;
  if (!rewardedAd) {
    rewardedAd = adsModule.RewardedAd.createForAdRequest(AD_UNIT_IDS.rewarded);
    rewardedAd.addAdEventListener(adsModule.RewardedAdEventType.LOADED, () => {
      rewardedLoaded = true;
    });
    rewardedAd.addAdEventListener(adsModule.RewardedAdEventType.CLOSED, () => {
      rewardedLoaded = false;
      preloadRewarded();
    });
    rewardedAd.addAdEventListener(adsModule.RewardedAdEventType.ERROR, () => {
      rewardedLoaded = false;
      preloadRewarded();
    });
  }
  return rewardedAd;
}

function preloadRewarded() {
  if (!adsModule) return;
  const ad = getRewarded();
  if (!ad) return;
  rewardedLoaded = false;
  ad.load();
}

async function canShowInterstitial(): Promise<boolean> {
  const raw = await storageGet(LAST_INTERSTITIAL_KEY);
  if (!raw) return true;
  const last = parseInt(raw, 10);
  if (Number.isNaN(last)) return true;
  return Date.now() - last >= INTERSTITIAL_MIN_INTERVAL_MS;
}

async function markInterstitialShown() {
  await storageSet(LAST_INTERSTITIAL_KEY, String(Date.now()));
}

/** Shows an interstitial if ads are enabled, loaded, and frequency cap allows. */
export async function showInterstitialIfAllowed(adsRemoved: boolean): Promise<boolean> {
  if (adsRemoved) return false;
  if (!adsModule) return false;
  if (!(await canShowInterstitial())) return false;

  const ad = getInterstitial();
  if (!ad || !interstitialLoaded) {
    preloadInterstitial();
    return false;
  }

  try {
    await ad.show();
    void analyticsEvents.adImpression('interstitial');
    await markInterstitialShown();
    interstitialLoaded = false;
    return true;
  } catch {
    preloadInterstitial();
    return false;
  }
}

/**
 * Shows a rewarded ad. Resolves true when the user earns the reward.
 * In __DEV__ without native ads, simulates success so the continue flow is testable in Expo Go.
 */
export async function showRewardedAd(): Promise<boolean> {
  if (!adsModule) {
    return __DEV__;
  }

  const ad = getRewarded();
  if (!ad) return false;

  if (!rewardedLoaded) {
    ad.load();
    return false;
  }

  return new Promise((resolve) => {
    let earned = false;
    const unsubEarned = ad.addAdEventListener(
      adsModule!.RewardedAdEventType.EARNED_REWARD,
      () => {
        earned = true;
        void analyticsEvents.adReward('continue');
      }
    );
    const unsubClosed = ad.addAdEventListener(adsModule!.AdEventType.CLOSED, () => {
      unsubEarned();
      unsubClosed();
      rewardedLoaded = false;
      preloadRewarded();
      resolve(earned);
    });
    const unsubError = ad.addAdEventListener(adsModule!.AdEventType.ERROR, () => {
      unsubEarned();
      unsubClosed();
      unsubError();
      rewardedLoaded = false;
      preloadRewarded();
      resolve(false);
    });

    void ad.show().then(() => {
      void analyticsEvents.adImpression('rewarded');
    }).catch(() => {
      unsubEarned();
      unsubClosed();
      unsubError();
      resolve(false);
    });
  });
}

export { AD_UNIT_IDS };
