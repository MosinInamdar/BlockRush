import { REMOVE_ADS_PRODUCT_ID } from '../../constants/monetization';
import { REMOVE_ADS_KEY } from '../../store/settingsStore';
import { storageGet, storageSet } from '../../utils/safeStorage';

type IapModule = typeof import('expo-iap');

let iapModule: IapModule | null = null;
let connected = false;
let initFailed = false;
let purchaseListener: { remove: () => void } | null = null;

export function isIapNativeAvailable(): boolean {
  return connected && iapModule !== null;
}

export async function initIap(onRemoveAdsOwned?: () => void): Promise<boolean> {
  if (connected) return iapModule !== null;
  if (initFailed) return false;
  try {
    iapModule = await import('expo-iap');
    connected = await iapModule.initConnection();
    if (connected && onRemoveAdsOwned) {
      purchaseListener?.remove();
      purchaseListener = iapModule.purchaseUpdatedListener(async (purchase) => {
        const id = purchase.productId ?? purchase.id;
        if (id === REMOVE_ADS_PRODUCT_ID) {
          await finishRemoveAdsPurchase(purchase);
          onRemoveAdsOwned();
        }
      });
    }
    return connected;
  } catch {
    initFailed = true;
    return false;
  }
}

export async function markRemoveAdsPurchased(): Promise<void> {
  await storageSet(REMOVE_ADS_KEY, 'true');
}

/** Restores prior non-consumable purchases from the store. */
export async function restorePurchases(): Promise<boolean> {
  if (!iapModule || !connected) {
    const saved = await storageGet(REMOVE_ADS_KEY);
    return saved === 'true';
  }

  try {
    const purchases = await iapModule.getAvailablePurchases();
    const owned = purchases.some(
      (p) => p.productId === REMOVE_ADS_PRODUCT_ID || p.id === REMOVE_ADS_PRODUCT_ID
    );
    if (owned) {
      await markRemoveAdsPurchased();
    }
    return owned;
  } catch {
    const saved = await storageGet(REMOVE_ADS_KEY);
    return saved === 'true';
  }
}

export async function purchaseRemoveAds(): Promise<'success' | 'cancelled' | 'unavailable'> {
  if (!iapModule || !connected) {
    if (__DEV__) {
      await markRemoveAdsPurchased();
      return 'success';
    }
    return 'unavailable';
  }

  try {
    await iapModule.requestPurchase({
      request: {
        apple: { sku: REMOVE_ADS_PRODUCT_ID },
        google: { skus: [REMOVE_ADS_PRODUCT_ID] },
      },
      type: 'in-app',
    });
    return 'success';
  } catch (error: unknown) {
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code: string }).code)
        : '';
    if (code.toLowerCase().includes('cancel')) {
      return 'cancelled';
    }
    return 'unavailable';
  }
}

/** Call after a validated purchase to finish the transaction (non-consumable). */
export async function finishRemoveAdsPurchase(
  purchase: import('expo-iap').Purchase
): Promise<void> {
  if (!iapModule) return;
  try {
    await iapModule.finishTransaction({ purchase, isConsumable: false });
    await markRemoveAdsPurchased();
  } catch {
    // Store may already acknowledge; still persist locally for UX.
    await markRemoveAdsPurchased();
  }
}

export { REMOVE_ADS_PRODUCT_ID };
