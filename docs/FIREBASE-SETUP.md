# BlockRush — Firebase Analytics setup (Phase 7)

**Parent:** [MONETIZATION-ANALYTICS.md](./MONETIZATION-ANALYTICS.md)

## What is wired in code

| Event | When |
|---|---|
| `app_open` | Cold start after settings/best score load |
| `game_start` | `startNewGame()` |
| `game_over` | `score`, `lines_total` (session) |
| `line_clear` | `lines` (1–4) per clear |
| `ad_impression` | banner / interstitial / rewarded shown |
| `ad_reward` | rewarded continue earned |
| `iap_purchase` | Remove Ads purchased or restored |

Implementation: `src/services/analytics/analyticsService.ts` (no-ops if Firebase native module is missing).

## 1. Create Firebase project

1. [Firebase Console](https://console.firebase.google.com/) → Add project **BlockRush**.
2. Add an **Android** app with package `com.blockrush.app`.
3. Download **`google-services.json`** and replace the placeholder at the project root.
4. Enable **Google Analytics** for the project.

## 2. iOS (before App Store)

1. Add iOS app `com.blockrush.app` in Firebase.
2. Download **`GoogleService-Info.plist`** into the project root.
3. In `app.json`, set `"ios": { "googleServicesFile": "./GoogleService-Info.plist" }`.
4. Rebuild with EAS.

## 3. Development build

Firebase Analytics requires a **dev client** (same as AdMob):

```bash
npx eas build --profile development --platform android
```

## 4. DebugView

1. Enable debug mode on Android (see [Firebase debug docs](https://firebase.google.com/docs/analytics/debugview)).
2. Play a full session: home → game → clear lines → game over.
3. Confirm events in Firebase → Analytics → **DebugView**.

## 5. Store icon & splash

- **Icon:** Replace `assets/icon.png` and Android adaptive icons before Phase 8.
- **Splash:** Configured in `app.json` (`#0D0D14` background + icon). Tune via `expo-splash-screen` plugin.

## Placeholder `google-services.json`

The repo includes a **placeholder** file so Android prebuild succeeds. **Replace it** with your real file from Firebase before measuring production analytics or shipping.
