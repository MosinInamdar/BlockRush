# BlockRush — Monetization & Analytics

**Parent:** [GAME-MASTER.md](../GAME-MASTER.md)  
**Source:** [game-concept.md](../game-concept.md) §9, §12

---

## Monetization model (v1)

**Free to play** with ads + optional **Remove Ads** IAP.

| Stream | v1 |
|---|---|
| AdMob banner | Yes |
| AdMob interstitial | Yes |
| AdMob rewarded | Yes |
| Remove Ads IAP | Yes |
| Cosmetics / battle pass | No |

---

## Ad placements

### Banner

- **Where:** Bottom of game screen, always during play (unless ads removed)
- **Size:** Adaptive banner
- **Layout:** Reserve height in `GameScreen` so grid is not obscured

### Interstitial

- **When:** After game over screen shown / on return to home
- **Frequency cap:** Max **1 per 3 minutes** (store + UX requirement)
- **Skip if:** User purchased Remove Ads

### Rewarded — “Continue playing”

- **When:** Game over screen, optional button
- **Reward:** Remove **3 random filled cells** from grid + grant **one more turn** — keep unused tray pieces; if all three were used, generate a new set of 3 ([DECISIONS.md](./DECISIONS.md))
- **Implementation notes:**
  - Must call engine-safe grid mutation (new helper: `removeRandomBlocks(grid, count)` in engine)
  - Re-run `isGameOver` after reward; if still stuck, do not grant extra turn
  - Always available even with Remove Ads (player choice)

---

## IAP — Remove Ads

| Field | Value |
|---|---|
| Product ID (example) | `blockrush_remove_ads` |
| Price | ₹99 / $0.99 / €0.99 |
| Effect | Removes banner + interstitial permanently |
| Rewarded | Still available |

**Persistence:** `AsyncStorage` key `@blockrush_ads_removed` + reconcile with store on launch.

**Restore purchases:** Required for iOS; implement `getAvailablePurchases` or equivalent before iOS launch.

---

## Revenue expectations (planning only)

From game concept — not guarantees:

| DAU | Rough ARPDAU | ~Monthly |
|---|---|---|
| 1,000 | $0.08 | ~$2,400 |
| 10,000 | $0.08 | ~$24,000 |

Tune after real Firebase + AdMob data.

---

## Firebase Analytics events

| Event | Parameters | When |
|---|---|---|
| `app_open` | — | Cold start |
| `game_start` | `mode: classic` | New game |
| `game_over` | `score`, `lines_total` (session) | Game ends |
| `line_clear` | `lines: 1-4` | Each clear |
| `ad_impression` | `type: banner|interstitial|rewarded` | Ad shown |
| `ad_reward` | `placement: continue` | Rewarded completed |
| `iap_purchase` | `product_id` | Remove ads bought |

**Privacy:** Disclose analytics + ads in privacy policy; consider consent if targeting EU/UK later.

---

## Implementation checklist (Phase 6–7)

- [ ] Create AdMob account + app IDs (replace test ids in `app.json` before launch)
- [x] Use test ad unit IDs in development (`src/constants/monetization.ts`)
- [x] Configure `app.json` / plugins for google-mobile-ads
- [ ] EAS build with native modules — see [MONETIZATION-SETUP.md](./MONETIZATION-SETUP.md)
- [ ] Firebase project + replace placeholder `google-services.json` (see [FIREBASE-SETUP.md](./FIREBASE-SETUP.md))
- [x] Wire events in store/game over flows (Phase 7)
- [ ] Play Console in-app product for Remove Ads (`blockrush_remove_ads`)
- [ ] Verify COPPA / families policy if targeting all ages (concept targets 16–35 — confirm store category)

---

## Ethical / UX constraints

- No deceptive “close” buttons on ads
- Rewarded must be clearly labeled (~30s watch)
- Interstitial never mid-drag or mid-animation
- Children: if rated for everyone, adjust ad content settings in AdMob

---

*Product IDs: configure in Play Console before Phase 8; use test IDs in development.*
