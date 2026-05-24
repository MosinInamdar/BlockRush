# BlockRush — Monetization setup (Phase 6)

**Parent:** [MONETIZATION-ANALYTICS.md](./MONETIZATION-ANALYTICS.md)

## Development build required

AdMob and Play Billing **do not run in Expo Go**. Use a development build:

```bash
npx expo install expo-dev-client
npx eas build --profile development --platform android
```

Or locally:

```bash
npx expo prebuild
npx expo run:android
```

## AdMob

1. Create an [AdMob](https://admob.google.com/) app for Android (and iOS when ready).
2. Replace test app ids in `app.json` → `react-native-google-mobile-ads` plugin with your production app ids.
3. Set production ad unit ids via EAS env:
   - `EXPO_PUBLIC_ADMOB_BANNER_ANDROID`
   - `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID`
   - `EXPO_PUBLIC_ADMOB_REWARDED_ANDROID`
   - (and `_IOS` variants)

Until then, Google’s **test ad units** in `src/constants/monetization.ts` are used.

## Remove Ads IAP

| Item | Value |
|---|---|
| Product ID | `blockrush_remove_ads` |
| Type | Non-consumable (managed product) |
| Effect | Hides banner + interstitial; rewarded continue stays |

### Google Play Console

1. Monetize → Products → In-app products → Create `blockrush_remove_ads`.
2. Activate the product before testing.
3. Add license testers for internal testing.

### Restore purchases

Settings → **Restore purchases** calls `getAvailablePurchases()` and sets `@blockrush_remove_ads` when the product is owned. Required for App Store review on iOS.

## Expo Go / Jest behavior

- **Expo Go:** Ads are hidden; rewarded “Watch to Continue” grants the reward in `__DEV__` only so you can test the continue flow.
- **Jest:** Native ad/IAP modules are mocked in `jest.setup.js`.

## Interstitial frequency

Max **1 interstitial per 3 minutes**, stored in `@blockrush_last_interstitial_at`. Shown ~600ms after game over; also attempted when leaving for Home (if cap allows).
