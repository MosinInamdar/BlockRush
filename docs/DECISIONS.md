# BlockRush — Decision Log

**Parent:** [GAME-MASTER.md](../GAME-MASTER.md)  
**Status:** All v1 planning questions resolved (defaults confirmed May 2026)

Log new decisions using the template at the bottom.

---

## Resolved decisions

### 2026-05 — Game name
**Decision:** Ship as **BlockRush**; subtitle **Neon Block Puzzle** for ASO.  
**Rationale:** [game-concept.md](../game-concept.md) §3.

### 2026-05 — v1 game modes
**Decision:** **Classic only** (endless).  
**Rationale:** Scope control for solo dev; daily/time attack in v2+.

### 2026-05 — Grid and mechanic
**Decision:** 8×8 grid; 3 pieces; row+column clear; no timer.  
**Rationale:** Proven Block Blast loop; [game-concept.md](../game-concept.md) §4.

### 2026-05 — Piece implementation source of truth
**Decision:** Implement oriented pieces and weights from [core-engine.md](../core-engine.md), not the simplified 8-shape table alone.  
**Rationale:** Engine doc is implementation-ready; concept table is design families.

### 2026-05 — Engine/UI separation
**Decision:** Pure `src/engine/`; Zustand store orchestrates; UI in Phase 3+.  
**Rationale:** [core-engine.md](../core-engine.md) architecture.

### 2026-05 — Platform order
**Decision:** Android Play Store first; iOS 2–4 weeks later.  
**Rationale:** [game-concept.md](../game-concept.md) §11.

### 2026-05 — Monetization
**Decision:** AdMob (banner, interstitial, rewarded) + Remove Ads IAP; no subscription in v1.  
**Rationale:** [game-concept.md](../game-concept.md) §9.

### 2026-05 — Documentation hub
**Decision:** [GAME-MASTER.md](../GAME-MASTER.md) is the main entry; phased detail in `docs/`.  
**Rationale:** User request May 2026.

### 2026-05 — Localization (Q1)
**Decision:** **English only** in v1; icon-first UI (no Hindi or other languages).  
**Rationale:** Default; reduces scope; global neon aesthetic needs no copy-heavy UI.  
**Impacts:** No i18n setup in v1; revisit in v2 if needed.

### 2026-05 — App icon (Q2)
**Decision:** **Placeholder** until Phase 7 polish.  
**Rationale:** Default; unblock engine and gameplay work first.  
**Impacts:** [QA-RELEASE.md](./QA-RELEASE.md) Phase 7–8 for final 512×512 asset.

### 2026-05 — Sound assets (Q3)
**Decision:** **Royalty-free sources** (e.g. BFXR / Sfxr-generated or licensed packs); document license in repo when files are added.  
**Rationale:** Default; fast iteration without custom studio work.  
**Impacts:** `assets/sounds/` + note in release checklist.

### 2026-05 — Google Play account (Q4)
**Decision:** Account **not assumed ready** — must be created before **Phase 8** submission.  
**Rationale:** Default planning assumption; no blocker until launch phase.  
**Impacts:** Phase 8 gate in [DEVELOPMENT-PHASES.md](./DEVELOPMENT-PHASES.md).

### 2026-05 — Rewarded continue — piece set (Q5)
**Decision:** After rewarded revive, **keep unused pieces** from the current tray; if all three were used, **generate a new set of 3**.  
**Rationale:** Default; fair continuation without resetting a nearly-finished tray.  
**Impacts:** Store action + `removeRandomBlocks` helper in engine (Phase 6).

### 2026-05 — Navigation (Q6)
**Decision:** **Expo Router** (`app/` directory) per [core-engine.md](../core-engine.md).  
**Rationale:** Default; matches architecture doc and Expo template path.  
**Impacts:** [TECHNICAL-ARCHITECTURE.md](./TECHNICAL-ARCHITECTURE.md).

### 2026-05 — EAS builds (Q7)
**Decision:** Set up **EAS account and dev build** in **Phase 0** (or no later than start of **Phase 6** for AdMob).  
**Rationale:** Default; native ads/IAP require dev client, not Expo Go alone.  
**Impacts:** Phase 0 checklist, Phase 6 dependency.

### 2026-05 — Timeline (Q8)
**Decision:** **Flexible schedule** — advance by phase **exit criteria**, not fixed calendar dates.  
**Rationale:** Default; ~5 weeks from [game-concept.md](../game-concept.md) is a guide only.  
**Impacts:** [GAME-MASTER.md](../GAME-MASTER.md) status table drives progress.

### 2026-05 — Play Store rollout (Phase 8)
**Decision:** First upload to **internal testing** track; promote to closed beta, then staged production (20% → 100%).  
**Rationale:** Standard solo-dev risk reduction; aligns with [LAUNCH-RUNBOOK.md](./LAUNCH-RUNBOOK.md).  
**Impacts:** `eas.json` submit profile `track: internal`; production rollout manual in Play Console.

### 2026-05 — App icon (Phase 7)
**Decision:** **Splash** uses brand background `#0D0D14` + current `assets/icon.png`; **final marketing icon** deferred to Phase 8 store assets.  
**Rationale:** Phase 7 focuses on analytics and stability; icon art is a store-submission deliverable.  
**Impacts:** [QA-RELEASE.md](./QA-RELEASE.md), `app.json` splash plugin.

### 2026-05 — Pause (v1)
**Decision:** **No pause menu in v1.** Auto-save on background / leaving the game screen; resume from home.  
**Rationale:** Phase 5 scope; endless Classic does not need a timer pause.  
**Impacts:** [DEVELOPMENT-PHASES.md](./DEVELOPMENT-PHASES.md) Phase 5; back button + home flow only.

---

## Template for new entries

```markdown
### YYYY-MM-DD — Short title
**Decision:** What we chose.
**Rationale:** Why.
**Impacts:** Files/phases affected.
```
