import { REMOVE_ADS_PRODUCT_ID } from '../../constants/monetization';
import { REMOVE_ADS_KEY } from '../../constants/storageKeys';
import { storageGet, storageSet } from '../../utils/safeStorage';

type IapModule = typeof import('expo-iap');

let iapModule: IapModule | null = null;
let connected = false;
let productsFetched = false;
let initFailed = false;
let initPromise: Promise<boolean> | null = null;
let purchaseListener: { remove: () => void } | null = null;
let purchaseErrorListener: { remove: () => void } | null = null;
let removeAdsProductPrice: string | null = null;

export function isIapNativeAvailable(): boolean {
  return connected && iapModule !== null;
}

export function getRemoveAdsDisplayPrice(): string | null {
  return removeAdsProductPrice;
}

async function fetchRemoveAdsProduct(): Promise<boolean> {
  if (!iapModule || !connected) return false;
  try {
    const products = await iapModule.fetchProducts({
      skus: [REMOVE_ADS_PRODUCT_ID],
      type: 'in-app',
    });
    const match = products.find(
      (p) => p.id === REMOVE_ADS_PRODUCT_ID || p.productId === REMOVE_ADS_PRODUCT_ID
    );
    if (match?.displayPrice) {
      removeAdsProductPrice = match.displayPrice;
    }
    productsFetched = products.length > 0;
    return productsFetched;
  } catch {
    return false;
  }
}

function registerPurchaseListeners(onRemoveAdsOwned?: () => void) {
  if (!iapModule) return;

  purchaseListener?.remove();
  purchaseErrorListener?.remove();

  purchaseListener = iapModule.purchaseUpdatedListener(async (purchase) => {
    const id = purchase.productId ?? purchase.id;
    if (id === REMOVE_ADS_PRODUCT_ID) {
      await finishRemoveAdsPurchase(purchase);
      onRemoveAdsOwned?.();
    }
  });

  purchaseErrorListener = iapModule.purchaseErrorListener((error) => {
    const code = String(error.code ?? '').toLowerCase();
    if (code.includes('cancel') || code.includes('user')) {
      return;
    }
  });
}

async function connectIap(onRemoveAdsOwned?: () => void): Promise<boolean> {
  if (connected && iapModule) {
    if (!productsFetched) {
      await fetchRemoveAdsProduct();
    }
    return true;
  }
  if (initFailed && !onRemoveAdsOwned) return false;

  try {
    iapModule = await import('expo-iap');
    connected = await iapModule.initConnection();
    if (!connected) {
      initFailed = true;
      return false;
    }

    registerPurchaseListeners(onRemoveAdsOwned);
    await fetchRemoveAdsProduct();
    initFailed = false;
    return true;
  } catch {
    initFailed = true;
    connected = false;
    iapModule = null;
    return false;
  }
}

export async function initIap(onRemoveAdsOwned?: () => void): Promise<boolean> {
  if (connected && iapModule) return true;
  if (initPromise) return initPromise;

  initPromise = connectIap(onRemoveAdsOwned).finally(() => {
    initPromise = null;
  });
  return initPromise;
}

export async function markRemoveAdsPurchased(): Promise<void> {
  await storageSet(REMOVE_ADS_KEY, 'true');
}

/** Restores prior non-consumable purchases from the store. */
export async function restorePurchases(): Promise<boolean> {
  const ready = await initIap();
  if (!ready || !iapModule) {
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

export async function purchaseRemoveAds(): Promise<
  'pending' | 'cancelled' | 'unavailable'
> {
  initFailed = false;
  const ready = await initIap();
  if (!ready || !iapModule) {
    if (__DEV__) {
      await markRemoveAdsPurchased();
      return 'pending';
    }
    return 'unavailable';
  }

  if (!productsFetched) {
    const fetched = await fetchRemoveAdsProduct();
    if (!fetched) {
      return 'unavailable';
    }
  }

  try {
    await iapModule.requestPurchase({
      request: {
        apple: { sku: REMOVE_ADS_PRODUCT_ID },
        google: { skus: [REMOVE_ADS_PRODUCT_ID] },
      },
      type: 'in-app',
    });
    return 'pending';
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
    await markRemoveAdsPurchased();
  }
}

export { REMOVE_ADS_PRODUCT_ID };
