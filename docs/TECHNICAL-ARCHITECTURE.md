# BlockRush — Technical Architecture

**Parent:** [GAME-MASTER.md](../GAME-MASTER.md)

---

## Stack summary

| Layer | Technology |
|---|---|
| App framework | React Native + Expo (TypeScript) |
| Routing | Expo Router (`app/`) |
| Game logic | Pure TS in `src/engine/` |
| State | Zustand (`src/store/gameStore.ts`) |
| Gestures | react-native-gesture-handler |
| Animation | react-native-reanimated (babel plugin last) |
| Storage | @react-native-async-storage/async-storage |
| Audio | expo-audio |
| Ads | react-native-google-mobile-ads |
| Analytics | `@react-native-firebase/analytics` via `src/services/analytics/` |
| Build | Expo EAS Build |
| Tests | Jest 29 + jest-expo (Jest 30 incompatible with jest-expo today) |

---

## Folder structure

```
blockrush/
├── app/                      # Expo Router — screens only
│   ├── _layout.tsx
│   ├── index.tsx             # Home
│   ├── game.tsx              # Main game
│   └── settings.tsx          # Settings
├── src/
│   ├── engine/               # Pure logic — NO React imports
│   │   ├── constants.ts
│   │   ├── types.ts
│   │   ├── grid.ts
│   │   ├── pieces.ts
│   │   ├── placement.ts
│   │   ├── score.ts
│   │   ├── gameOver.ts
│   │   └── index.ts
│   ├── store/
│   │   └── gameStore.ts
│   ├── components/           # UI: Grid, DraggablePiece, etc.
│   ├── hooks/
│   ├── theme/                # Colors, spacing, typography tokens
│   └── utils/                # Shared non-engine helpers
├── __tests__/                # Mirror engine modules
├── assets/
│   ├── images/
│   ├── sounds/
│   └── fonts/                # If needed
├── docs/                     # This documentation set
├── core-engine.md
├── game-concept.md
└── GAME-MASTER.md
```

---

## Layering rules

```
┌─────────────────────────────────────┐
│  app/ screens (compose UI)          │
├─────────────────────────────────────┤
│  components/ + hooks/               │
├─────────────────────────────────────┤
│  store/ (Zustand — orchestration)   │
├─────────────────────────────────────┤
│  engine/ (pure functions, types)    │
└─────────────────────────────────────┘
```

| Rule | Rationale |
|---|---|
| `engine/` never imports `react` or `react-native` | Unit testable; portable |
| UI never mutates grid arrays in place | Always use `cloneGrid` / store actions |
| Ghost position computed on drag, not stored | Avoid stale state during fast moves |
| Ads/analytics only in screens or thin service modules | Keeps engine clean |
| Persist only serializable state | Grid + pieces + score JSON |

---

## Data flow (one turn)

```
User drags piece
  → pixelToGridOrigin / findSnapPosition (engine)
  → getGhostCells (engine) → UI ghost overlay
User releases
  → placePiece(index, row, col) (store)
      → applyPieceToGrid
      → clearFilledLines
      → calculateTurnScore
      → update usedPieces / maybe generatePieceSet
      → isGameOver
  → UI plays clear animation (isAnimating = true)
  → persist best score / save game
```

---

## Key types (reference)

Defined in `src/engine/types.ts` — see [core-engine.md](../core-engine.md):

- `Grid` — `Cell[][]`, 8×8, row-major
- `Piece` — shape offsets, color, bounding box
- `ClearResult` — cleared rows/cols, new grid, score
- Store mirrors: `grid`, `currentPieces`, `usedPieces`, `score`, `bestScore`, flags

---

## Environment & secrets

| Item | Storage |
|---|---|
| AdMob app IDs | `app.json` / `app.config.ts` + EAS env |
| Firebase config | `google-services.json` (Android), `GoogleService-Info.plist` (iOS) |
| IAP product IDs | Constants file + Play Console / App Store Connect |

**Never commit:** production API keys in public repos; use EAS secrets for CI.

---

## Native capabilities timeline

| Feature | Expo Go | Dev build / EAS |
|---|---|---|
| Core game + Reanimated | ✅ | ✅ |
| AdMob | ❌ | ✅ |
| IAP | ❌ | ✅ |
| Firebase native | Limited | ✅ |

Plan EAS development build before Phase 6.

---

## Performance guidelines

- Target **60fps** during drag and clear animations
- Prefer `useSharedValue` + `useAnimatedStyle` for moving pieces
- Grid rendering: consider memoized cell components or single canvas if profiling shows bottleneck
- Avoid `setState` every frame for ghost — derive from gesture shared values + runOnJS
- Bundle size: no heavy game engines; vector/simple views only
- Test on **2GB RAM Android** device listed in [QA-RELEASE.md](./QA-RELEASE.md)

---

## Testing strategy

| Layer | Tool | Coverage |
|---|---|---|
| Engine | Jest unit tests | Grid, placement, score, game over, pieces |
| Store | Jest + manual / integration | `placePiece` sequences |
| UI | Manual + optional Detox later | Gestures, navigation — post v1 if needed |

**Gate:** `npm test` green before merging engine changes.

---

## Versioning & releases

- **Semantic versioning** for store builds: `1.0.0` at launch
- Changelog in release notes (Play Console)
- Engine breaking changes require test updates in same PR

---

*Implementation details for engine modules: [core-engine.md](../core-engine.md)*
