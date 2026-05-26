# BlockRush — Troubleshooting

## “Project is incompatible with this version of Expo Go”

### Cause

BlockRush uses **Expo SDK 56**. As of May 2026, **Expo Go on the Google Play Store is still an older SDK** (typically SDK 54). Play Store “latest” ≠ SDK 56.

This is expected Expo behavior, not a bug in your project.

### Fix A — Install Expo Go for SDK 56 (recommended, keep current project)

**Android (physical device):**

1. Uninstall is optional; you can keep Play Store Expo Go, but you must open the **SDK 56** build when scanning.
2. On your phone, open: [https://expo.dev/go](https://expo.dev/go)
3. Set **SDK Version** to **SDK 56**
4. Tap **Android** → **Install** (downloads the matching APK)
5. Allow install from browser / unknown sources if Android prompts you
6. Open **that** Expo Go app (not the Play Store one)
7. Run `npm start` on your PC and scan the QR again

**Android emulator (on PC):**

1. Start the emulator
2. Run `npm start`
3. Press **`a`** in the terminal — Expo CLI installs the correct Expo Go on the emulator

**iOS (physical iPhone):**

Play Store Expo Go cannot be sideloaded to an older/newer SDK easily. Options:

- Use **iOS Simulator** on a Mac (`npm start` → press **`i`**)
- Use Expo’s **TestFlight** beta for SDK 56 (see [Expo changelog](https://expo.dev/changelog/expo-go-and-app-store-may-2026))
- Use a **development build** (`npx expo run:ios` on Mac)

### Fix B — Use web (quick UI check)

```bash
npm run web
```

Opens the app in the browser. Gestures differ from device, but home/navigation works.

### Fix C — Downgrade project to match Play Store Expo Go

If you only want the Play Store Expo Go app and not a separate APK:

```bash
npx expo install expo@^54.0.0 --fix
```

Then restart with `npx expo start --clear`. This changes SDK versions across the repo; only do this if you accept staying on SDK 54 until you upgrade again.

### Fix D — Development build (production-style, Phase 6+)

```bash
npx expo install expo-dev-client
npx expo run:android
```

Installs your own dev client with the correct native SDK. Required for AdMob anyway.

---

## “Cannot find native module ExponentAV” / `game.tsx` missing default export

### Cause

`expo-av` was removed from **Expo Go for SDK 55+**. Importing it at the top of a file (e.g. `src/services/feedback.ts`) crashes module load, and Expo Router then reports that `app/game.tsx` has no default export.

### Fix

BlockRush uses **`expo-audio`** instead (see `package.json` and the `expo-audio` config plugin in `app.json`). After pulling this change:

1. `npm install`
2. `npx expo start --clear`
3. Open the app in **Expo Go for SDK 56** ([expo.dev/go](https://expo.dev/go)), not an older Play Store build

If you use a custom dev client, rebuild it after adding `expo-audio`.

---

## Ads or IAP not working (Expo Go)

### Cause

`react-native-google-mobile-ads` and `expo-iap` require **native code**. They do not load in Expo Go.

### Fix

1. Build a **development client**: `npx eas build --profile development --platform android` (see [MONETIZATION-SETUP.md](./MONETIZATION-SETUP.md)).
2. In Expo Go, gameplay still works; **Watch to Continue** simulates success in `__DEV__` only.
3. Create the `blockrush_remove_ads` product in Play Console before testing real IAP.

---

## `RNFBAppModule` / `RNGoogleMobileAdsModule` could not be found

### Cause

Those modules are only compiled into a **custom dev client** or **store build**, not Expo Go. Importing the JS packages without the native binary triggers a red error.

BlockRush gates Firebase and AdMob behind `TurboModuleRegistry.get()` checks in `src/utils/nativeModules.ts` so Expo Go runs without crashing.

### Fix

- **Expo Go (UI / gameplay only):** Restart Metro with `npx expo start --clear`. Errors should stop; ads/analytics no-op in dev.
- **Real ads / Firebase:** Install a dev build that includes the plugins in `app.json`:
  ```bash
  npx expo run:android
  ```
  or `eas build --profile development --platform android`, then open the app from that APK — not Expo Go.

---

## Still stuck?

- Same Wi‑Fi for phone and PC (or use `npx expo start --tunnel`)
- Restart Metro: `npx expo start --clear`
- Confirm `package.json` has `"expo": "~56.0.x"`
