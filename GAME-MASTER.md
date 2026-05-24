# BlockRush — Game Development Master Plan

**Version:** 1.0  
**Date:** May 2026  
**Owner:** Mosin (Solo)  
**Status:** Phase 8 — QA & store launch

This is the **single source of truth** for building BlockRush. All work should trace back to a phase and checklist item here.

---

## Quick links

| Document | Purpose |
|---|---|
| [game-concept.md](./game-concept.md) | Vision, USP, monetization, ASO |
| [core-engine.md](./core-engine.md) | Engine API, types, tests, day-by-day engine tasks |
| [docs/DEVELOPMENT-PHASES.md](./docs/DEVELOPMENT-PHASES.md) | Full phased roadmap with exit criteria |
| [docs/TECHNICAL-ARCHITECTURE.md](./docs/TECHNICAL-ARCHITECTURE.md) | Stack, folders, conventions, dependencies |
| [docs/CONTENT-SPEC.md](./docs/CONTENT-SPEC.md) | Visual, animation, audio, UX specs |
| [docs/MONETIZATION-ANALYTICS.md](./docs/MONETIZATION-ANALYTICS.md) | Ads, IAP, Firebase |
| [docs/QA-RELEASE.md](./docs/QA-RELEASE.md) | Testing, performance, store submission |
| [docs/LAUNCH-RUNBOOK.md](./docs/LAUNCH-RUNBOOK.md) | EAS build + Play Console launch steps |
| [docs/STORE-LISTING.md](./docs/STORE-LISTING.md) | Play Store copy (ready to paste) |
| [docs/DECISIONS.md](./docs/DECISIONS.md) | Open questions and logged decisions |

---

## What we are building

**BlockRush** — casual 8×8 block puzzle (Block Blast mechanic) with a **dark neon** aesthetic. **v1 ships Classic mode only** (endless, no timer). Android first; iOS 2–4 weeks after.

**Stack:** React Native + Expo + TypeScript · Zustand · Reanimated · Gesture Handler · AsyncStorage · expo-av · AdMob · Firebase · EAS Build

---

## Development principles

1. **Engine first, UI second** — All grid/piece/score logic lives in `src/engine/` with zero React imports. See [core-engine.md](./core-engine.md).
2. **Tests gate progress** — `npm test` green before leaving an engine milestone.
3. **One vertical slice before polish** — Playable loop (place → clear → score → game over) before particles, ads, or ASO.
4. **Scope lock for v1** — Classic mode only. No daily challenge, time attack, or server.
5. **Performance budget** — 60fps on 2GB RAM Android; no 3D; prefer Reanimated on UI thread.
6. **Document decisions** — Update [docs/DECISIONS.md](./docs/DECISIONS.md) when resolving open items.

---

## Phase overview

| Phase | Name | Target | Doc section |
|---|---|---|---|
| **0** | Pre-production | 1–2 days | [DEVELOPMENT-PHASES §0](./docs/DEVELOPMENT-PHASES.md#phase-0--pre-production) |
| **1** | Core engine | Week 1 | [§1](./docs/DEVELOPMENT-PHASES.md#phase-1--core-engine-logic-only) |
| **2** | Game state & loop | Week 2 | [§2](./docs/DEVELOPMENT-PHASES.md#phase-2--game-state--integration-loop) |
| **3** | Gameplay UI | Week 3 (part 1) | [§3](./docs/DEVELOPMENT-PHASES.md#phase-3--gameplay-ui) |
| **4** | Juice (feel) | Week 3 (part 2) | [§4](./docs/DEVELOPMENT-PHASES.md#phase-4--juice-animations--audio) |
| **5** | Meta & persistence | Week 3–4 | [§5](./docs/DEVELOPMENT-PHASES.md#phase-5--meta-screens--persistence) |
| **6** | Monetization | Week 4 | [§6](./docs/DEVELOPMENT-PHASES.md#phase-6--monetization) |
| **7** | Analytics & polish | Week 4–5 | [§7](./docs/DEVELOPMENT-PHASES.md#phase-7--analytics--polish) |
| **8** | QA & launch | Week 5 | [§8](./docs/DEVELOPMENT-PHASES.md#phase-8--qa--store-launch) |

**Rough calendar (from [game-concept.md](./game-concept.md)):** 5 weeks to Play Store. Phases can slip; exit criteria matter more than dates.

---

## Current status

Update this table as you progress:

| Phase | Status | Notes |
|---|---|---|
| 0 Pre-production | ✅ Done | Expo SDK 56, Router, Jest, EAS stub |
| 1 Core engine | ✅ Done | 37 tests, pure `src/engine/` |
| 2 State & loop | ✅ Done | Zustand + 14 store tests, debug grid |
| 3 Gameplay UI | ✅ Done | Grid, tray, drag-drop, ghost, game over |
| 4 Juice | ✅ Done | Clear VFX, haptics, procedural SFX |
| 5 Meta | ✅ Done | Home, settings, save/resume |
| 6 Monetization | ✅ Done | AdMob + Remove Ads IAP |
| 7 Analytics | ✅ Done | Firebase, splash, a11y, perf |
| 8 Launch | 🟡 In progress | Runbook + store copy ready; manual Play steps remain |

Legend: ⬜ Not started · 🟡 In progress · ✅ Done

---

## v1 feature checklist (ship gate)

Must be true before Play Store submission:

- [x] Classic endless mode on 8×8 grid
- [x] Drag-and-drop placement with ghost preview
- [x] Row/column clear with neon clear animation (see [CONTENT-SPEC](./docs/CONTENT-SPEC.md))
- [x] Score + local high score (AsyncStorage)
- [x] Game over + restart
- [x] Banner + interstitial (capped) + rewarded continue
- [x] Remove Ads IAP (₹99 / $0.99)
- [x] Firebase Analytics (core events)
- [ ] Runs smoothly on low-end Android (manual test device list)
- [ ] Store listing assets + privacy policy URL ([LAUNCH-RUNBOOK.md](./docs/LAUNCH-RUNBOOK.md))

**Explicitly out of v1:** Daily challenge, time attack, online leaderboard, Hindi/localization, social login.

---

## Piece set note (concept vs engine)

[game-concept.md](./game-concept.md) lists **8 shape families** (single, domino, line-3/4, L, T, square, S/Z).  
[core-engine.md](./core-engine.md) implements **oriented variants** (e.g. `LINE3_H` / `LINE3_V`, `BIG_L`, `T_SHAPE_R`) with weighted generation. **Implementation follows core-engine.md** — the families are the design intent; orientations are engine detail.

---

## How to use this repo day to day

1. Pick the **current phase** in [DEVELOPMENT-PHASES.md](./docs/DEVELOPMENT-PHASES.md).
2. Complete tasks in order; check exit criteria before advancing.
3. For engine work, follow the day order in [core-engine.md §13](./core-engine.md#13-implementation-order).
4. Log decisions and resolved questions in [DECISIONS.md](./docs/DECISIONS.md).
5. Before release, run [QA-RELEASE.md](./docs/QA-RELEASE.md) checklists.

---

## Confirmed decisions (defaults)

All planning questions resolved — see [docs/DECISIONS.md](./docs/DECISIONS.md).

| Area | Choice |
|---|---|
| Localization | English + icons only (v1) |
| App icon | Placeholder → final art in Phase 7 |
| Sound | Royalty-free / BFXR-style assets |
| Navigation | Expo Router |
| Rewarded continue | Keep unused pieces; new set if all used |
| Timeline | Exit-criteria driven (~5 week guide) |
| EAS | Set up Phase 0 or before Phase 6 |
| Play account | Required before Phase 8 |

---

*Next action: **Phase 8 (manual)** — follow [docs/LAUNCH-RUNBOOK.md](./docs/LAUNCH-RUNBOOK.md): preview build → QA → production AAB → Play Console → beta → release. Tag `v1.0.0` when live.*
