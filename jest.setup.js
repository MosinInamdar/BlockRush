jest.mock('react-native-google-mobile-ads', () => {
  const listeners = new Map();
  const ad = {
    addAdEventListener: jest.fn((event, cb) => {
      listeners.set(event, cb);
      return jest.fn();
    }),
    load: jest.fn(),
    show: jest.fn(() => Promise.resolve()),
  };
  return {
    MobileAds: jest.fn(() => ({
      initialize: jest.fn(() => Promise.resolve()),
    })),
    BannerAd: 'BannerAd',
    BannerAdSize: { ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER' },
    InterstitialAd: { createForAdRequest: jest.fn(() => ad) },
    RewardedAd: { createForAdRequest: jest.fn(() => ad) },
    AdEventType: { LOADED: 'loaded', CLOSED: 'closed', ERROR: 'error' },
    RewardedAdEventType: {
      LOADED: 'loaded',
      EARNED_REWARD: 'earned',
      CLOSED: 'closed',
      ERROR: 'error',
    },
  };
});

jest.mock('@react-native-firebase/analytics', () => () => ({
  logEvent: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-iap', () => ({
  initConnection: jest.fn(() => Promise.resolve(true)),
  purchaseUpdatedListener: jest.fn(() => ({ remove: jest.fn() })),
  purchaseErrorListener: jest.fn(() => ({ remove: jest.fn() })),
  fetchProducts: jest.fn(() =>
    Promise.resolve([
      {
        id: 'blockrush_remove_ads',
        displayPrice: '$0.99',
      },
    ])
  ),
  getAvailablePurchases: jest.fn(() => Promise.resolve([])),
  requestPurchase: jest.fn(() => Promise.resolve()),
  finishTransaction: jest.fn(() => Promise.resolve()),
}));
