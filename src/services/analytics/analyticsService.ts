/**
 * Firebase Analytics wrapper. No-ops when native Firebase is unavailable (Expo Go, tests).
 * Events match docs/MONETIZATION-ANALYTICS.md.
 */

import { canUseFirebaseAnalytics } from '../../utils/nativeModules';

export type AnalyticsParams = Record<string, string | number | boolean>;

type AnalyticsModule = typeof import('@react-native-firebase/analytics').default;

let analytics: AnalyticsModule | null = null;
let initAttempted = false;

async function getAnalytics(): Promise<AnalyticsModule | null> {
  if (initAttempted) return analytics;
  initAttempted = true;
  if (!canUseFirebaseAnalytics()) {
    return null;
  }
  try {
    const mod = await import('@react-native-firebase/analytics');
    analytics = mod.default;
    return analytics;
  } catch {
    return null;
  }
}

/** Firebase event names must be <= 40 chars, alphanumeric + underscore. */
function sanitizeParams(params?: AnalyticsParams): AnalyticsParams | undefined {
  if (!params) return undefined;
  const out: AnalyticsParams = {};
  for (const [key, value] of Object.entries(params)) {
    const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 40);
    if (typeof value === 'number' && !Number.isFinite(value)) continue;
    out[safeKey] = value;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export async function logEvent(name: string, params?: AnalyticsParams): Promise<void> {
  const safeParams = sanitizeParams(params);
  if (__DEV__) {
    console.debug('[analytics]', name, safeParams ?? {});
  }
  try {
    const instance = await getAnalytics();
    if (!instance) return;
    await instance.logEvent(name, safeParams);
  } catch {
    // Firebase unavailable or misconfigured — never crash gameplay
  }
}

export const analyticsEvents = {
  appOpen: () => logEvent('app_open'),

  gameStart: (mode: 'classic' = 'classic') => logEvent('game_start', { mode }),

  gameOver: (score: number, linesTotal: number) =>
    logEvent('game_over', { score, lines_total: linesTotal }),

  lineClear: (lines: number) => logEvent('line_clear', { lines }),

  adImpression: (type: 'banner' | 'interstitial' | 'rewarded') =>
    logEvent('ad_impression', { type }),

  adReward: (placement: 'continue') => logEvent('ad_reward', { placement }),

  iapPurchase: (productId: string) => logEvent('iap_purchase', { product_id: productId }),
};
