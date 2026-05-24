import { Platform } from 'react-native';

/** Google Play / App Store non-consumable product id. */
export const REMOVE_ADS_PRODUCT_ID = 'blockrush_remove_ads';

/** AdMob app ids — replace with production ids before store submit. */
export const ADMOB_APP_IDS = {
  android: 'ca-app-pub-3940256099942544~3347511713',
  ios: 'ca-app-pub-3940256099942544~1458002511',
} as const;

/**
 * Ad unit ids. Defaults to Google’s official test units in development.
 * Set EXPO_PUBLIC_* in eas.json / .env for production builds.
 */
export const AD_UNIT_IDS = {
  banner:
    Platform.select({
      android:
        process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID ??
        'ca-app-pub-3940256099942544/6300978111',
      ios:
        process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS ??
        'ca-app-pub-3940256099942544/2934735716',
      default: 'ca-app-pub-3940256099942544/6300978111',
    }) ?? 'ca-app-pub-3940256099942544/6300978111',
  interstitial:
    Platform.select({
      android:
        process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID ??
        'ca-app-pub-3940256099942544/1033173712',
      ios:
        process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS ??
        'ca-app-pub-3940256099942544/4411468910',
      default: 'ca-app-pub-3940256099942544/1033173712',
    }) ?? 'ca-app-pub-3940256099942544/1033173712',
  rewarded:
    Platform.select({
      android:
        process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID ??
        'ca-app-pub-3940256099942544/5224354917',
      ios:
        process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS ??
        'ca-app-pub-3940256099942544/1712485313',
      default: 'ca-app-pub-3940256099942544/5224354917',
    }) ?? 'ca-app-pub-3940256099942544/5224354917',
} as const;

/** Minimum ms between interstitial impressions. */
export const INTERSTITIAL_MIN_INTERVAL_MS = 3 * 60 * 1000;

export const LAST_INTERSTITIAL_KEY = '@blockrush_last_interstitial_at';
