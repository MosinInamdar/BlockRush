import { TurboModuleRegistry } from 'react-native';

/** TurboModule names registered by native dependencies (dev client / production builds). */
export const NATIVE_MODULE_NAMES = {
  googleMobileAds: 'RNGoogleMobileAdsModule',
  firebaseApp: 'RNFBAppModule',
} as const;

/** True when the native binary includes the given TurboModule (avoids getEnforcing crashes). */
export function hasTurboModule(name: string): boolean {
  try {
    return TurboModuleRegistry.get(name) != null;
  } catch {
    return false;
  }
}

export function canUseGoogleMobileAds(): boolean {
  return hasTurboModule(NATIVE_MODULE_NAMES.googleMobileAds);
}

export function canUseFirebaseAnalytics(): boolean {
  return hasTurboModule(NATIVE_MODULE_NAMES.firebaseApp);
}
