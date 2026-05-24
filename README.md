# BlockRush

**Neon Block Puzzle** — casual 8×8 block puzzle (Block Blast–style) with a dark neon aesthetic. Android first.

| Doc | Purpose |
|---|---|
| [GAME-MASTER.md](./GAME-MASTER.md) | Project hub & phase status |
| [docs/LAUNCH-RUNBOOK.md](./docs/LAUNCH-RUNBOOK.md) | **Play Store launch steps** |
| [docs/QA-RELEASE.md](./docs/QA-RELEASE.md) | QA checklist |
| [core-engine.md](./core-engine.md) | Game engine API |

---

## Quick start (development)

```bash
npm install
npm start
```

- **Expo Go (SDK 56):** Install from [expo.dev/go](https://expo.dev/go) — Play Store Expo Go may be older.
- **Ads / IAP / Firebase:** Require a [development build](docs/MONETIZATION-SETUP.md), not Expo Go.

```bash
npm test              # unit tests (engine + store)
npm run test:ci       # CI-friendly test run
```

---

## Release build (Android)

1. Complete [docs/LAUNCH-RUNBOOK.md](./docs/LAUNCH-RUNBOOK.md) prerequisites  
2. `npm run validate`  
3. `npm run build:android:preview` — internal APK  
4. `npm run build:android:production` — Play Store AAB  

```bash
eas login
eas build --profile production --platform android
eas submit --profile production --platform android --latest
```

Set production AdMob unit IDs in EAS Secrets (see `.env.example`).

---

## Project structure

```
app/           Expo Router screens (home, game, settings)
src/engine/    Pure game logic (no React)
src/store/     Zustand state
src/components/ UI
docs/          Architecture, launch, legal
```

---

## Stack

Expo 56 · TypeScript · Zustand · Reanimated · Gesture Handler · AdMob · Firebase Analytics · expo-iap · EAS Build

---

## License

Private / proprietary — Mosin Inamdar. All rights reserved unless stated otherwise.
