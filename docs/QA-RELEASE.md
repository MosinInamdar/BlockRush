# BlockRush — QA & Release Checklist

**Parent:** [GAME-MASTER.md](../GAME-MASTER.md)

Use before Phase 8 store submission and for each release candidate.

**Launch steps:** [LAUNCH-RUNBOOK.md](./LAUNCH-RUNBOOK.md) · **Store copy:** [STORE-LISTING.md](./STORE-LISTING.md)

---

## Phase 8 progress (manual)

| Task | Owner | Done |
|---|---|---|
| `npm test` green | Dev | ☐ |
| Preview APK on 2+ devices | Dev | ☐ |
| Production AAB uploaded (internal track) | Dev | ☐ |
| Closed beta 5–10 testers | Dev | ☐ |
| Privacy policy URL live | Dev | ☐ |
| Store listing + graphics | Dev | ☐ |
| Data safety + content rating | Dev | ☐ |
| Production rollout | Dev | ☐ |
| Git tag `v1.0.0` | Dev | ☐ |

---

## Test devices (minimum)

| Device class | Example | Why |
|---|---|---|
| Low-end Android | 2GB RAM, 720p | Primary market (India) |
| Mid Android | 4GB RAM | Majority users |
| iOS (pre–iOS launch) | iPhone SE / 12 | Secondary platform |

Record actual models tested in release notes.

---

## Functional QA

### Core gameplay

- [ ] Place each piece type on empty grid corners and center
- [ ] Reject overlap and out-of-bounds drops
- [ ] Single row clear → +10 bonus, grid cells empty
- [ ] Single column clear → same
- [ ] Simultaneous row + column → intersection cleared once, correct bonus (30 for 2 lines)
- [ ] Use all 3 pieces → new set appears with 3 unique colors
- [ ] Game over when no piece fits; not before
- [ ] Score = cell points + clear bonus per turn
- [ ] Best score updates and persists after kill app

### Gestures & UI

- [ ] Ghost shows only on valid snap
- [ ] Piece returns to tray on invalid drop
- [ ] No placement during clear animation
- [ ] Banner does not cover grid or pieces
- [ ] Rotation / notch safe areas

### Persistence

- [ ] Save mid-game → force quit → resume
- [ ] New game clears save
- [ ] Corrupt save file → graceful new game

### Monetization

- [ ] Banner shows (free user)
- [ ] Interstitial on game over, respects 3-min cap
- [ ] Rewarded continue works once per game over
- [ ] Remove Ads hides banner + interstitial
- [ ] Rewarded still works after purchase

### Audio / haptics

- [ ] SFX toggle works
- [ ] Music off by default; toggle works if implemented
- [ ] No crash when sound files missing

---

## Performance QA

- [ ] 10-minute session without crash
- [ ] Drag maintains smooth frame rate on low-end device
- [ ] Clear animation + particles without sustained &lt;45fps
- [ ] App size reasonable (&lt;50MB ideal for emerging markets)
- [ ] Offline play: airplane mode, full session works

---

## Regression tests (automated)

```bash
npm test
```

All engine tests green before each release build.

---

## Store submission — Android (primary)

### Play Console assets

- [ ] App title: **BlockRush: Neon Block Puzzle**
- [ ] Short description (80 chars)
- [ ] Full description with keywords from [game-concept.md](../game-concept.md) §15
- [ ] Screenshots: phone 16:9 or 9:16 per guidelines (min 4)
- [ ] Feature graphic 1024×500
- [ ] App icon 512×512
- [ ] Privacy policy URL (hosted)
- [ ] Content rating questionnaire completed
- [ ] Target countries selected
- [ ] Data safety form (ads, analytics, storage)

### Build

- [ ] Version code / name incremented
- [ ] Production AdMob unit IDs
- [ ] ProGuard / release signing via EAS
- [ ] Internal testing → closed → production rollout

### ASO keywords (reference)

**Primary:** block puzzle game, neon puzzle, grid puzzle offline  
**Secondary:** brain puzzle, block blast alternative, relax puzzle game

---

## iOS (Phase 8+ backlog)

- [ ] Apple Developer account
- [ ] App Store Connect listing
- [ ] `GoogleService-Info.plist`
- [ ] IAP restore purchases tested
- [ ] App Tracking Transparency if using IDFA (likely N/A for Firebase only)

---

## Pre-launch smoke (15 min)

1. Install release APK from internal track  
2. Play full game to game over  
3. Watch rewarded ad → continue → play again  
4. Purchase Remove Ads (license test) → confirm no banner  
5. Kill app → relaunch → best score intact  

---

## Post-launch

- [ ] Monitor Firebase crashes (if Crashlytics added)
- [ ] Review Play Console vitals (ANR, crash rate)
- [ ] Plan v1.1: difficulty tuning, daily challenge, Hindi, etc.

---

*Track release version and test devices in git tag message or CHANGELOG when created.*
