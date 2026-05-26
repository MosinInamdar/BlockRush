# BlockRush — Content & UX Specification

**Parent:** [GAME-MASTER.md](../GAME-MASTER.md)  
**Source:** [game-concept.md](../game-concept.md) §5–7

Visual and audio requirements for implementation. Deviations need a note in [DECISIONS.md](./DECISIONS.md).

---

## Visual identity

### Palette

| Token | Hex | Usage |
|---|---|---|
| `background` | `#0D0D14` | App background — deep void |
| `gridLine` | `#1A1A2E` | Grid borders — subtle |
| `textPrimary` | `#FFFFFF` | Score, labels (90% opacity ok) |
| `textMuted` | `#6B6B80` | Secondary labels |

### Block colors (engine constants)

| Name | Hex |
|---|---|
| Electric blue | `#00D4FF` |
| Neon green | `#39FF14` |
| Hot pink | `#FF006E` |
| Amber | `#FFB800` |
| Violet | `#BF00FF` |
| Coral | `#FF4500` |
| Cyan | `#00FFCC` |

**Block rendering:**

- Flat fill (no gradients on blocks)
- 1px brighter inner stroke (LED tile look)
- Optional outer glow via shadow (platform-dependent; keep subtle for performance)

### Typography

- **Scores:** Bold, tabular figures if available
- **Combo text:** Heavy, neon color matching largest clear
- **UI:** System font or one bundled font — avoid multiple families in v1

---

## Screen layouts (v1)

### Home

- Shared `NeonBackdrop` (grid + vignette) with intro for visual continuity
- Hero: logo + `GameWordmark`, `StatCard` for best score (shows “—” when zero)
- Bottom-anchored CTAs: primary **PLAY**, secondary **Continue** when save exists
- Settings: ghost `NeonButton` top-right
- Staggered entrance animation on menu elements after intro
- No account/login

### Game

- `NeonBackdrop` variant `game` (gradients only; no decor grid behind play board)
- Top: back (`NeonButton` ghost) + `GameHud` with `ScoreChip` score/best
- Center: `GameBoardFrame` around 8×8 grid (`surface` cells, neon frame)
- Bottom: `PieceTray` surface panel with three slots; banner ad in `surface` strip
- Mount: board fade/scale in; tray stagger up
- Piece tray: used pieces at 30% opacity, non-interactive

### Game over (modal or screen)

- Final score
- Best score (highlight if new record)
- Play Again
- Home
- Rewarded continue button (Phase 6)
- Interstitial after dismiss (frequency cap)

### Settings

- Sound effects toggle
- Music toggle (default **off**)
- Remove ads / restore purchase status

---

## Interaction spec

| Action | Behavior |
|---|---|
| Drag piece | Reanimated overlay tracks finger at 60fps; tray piece hidden |
| Ghost | Valid placement: piece color @ 30% opacity; updates only when snap cell changes |
| Invalid | No ghost |
| Drop valid | Snap to cell; `placePiece`; place SFX immediate |
| Drop invalid | Overlay clears instantly |
| During clear anim | No drag/input (`isAnimating`) |

**Snap:** `findSnapPosition` with 1-cell radius per [core-engine.md](../core-engine.md).

---

## Clear animation (canonical sequence)

**Per line cleared** (row or column; run in parallel for multi-line):

| Step | Effect | Timing (target) |
|---|---|---|
| 1 | Cells flash white | 80ms |
| 2 | Line scale 1.0 → 1.04 | ~60ms |
| 3 | Collapse / fade out | ~100ms |
| 4 | Particle burst (8–12 squares, piece colors) | ~300ms |
| 5 | Score pop from line center | ~400ms fly-up |
| 6 | Screen edge glow pulse | ~200ms |

**Combo (2+ lines in one clear):**

- Text: `COMBO x2` (or x3, etc.)
- Screen shake: ±3px horizontal, 120ms
- Higher-pitch clear SFX

Total blocking time: ~400–600ms (tune so gameplay feels snappy, not sluggish).

---

## Scoring feedback

| Event | UI |
|---|---|
| Place piece | +N small float near placement (optional v1) |
| Clear line(s) | Bonus from `calculateClearBonus` in score pop |
| New best | Trophy burst + haptic |

Scoring table: [core-engine.md](../core-engine.md) and [game-concept.md](../game-concept.md) §7.

---

## Audio spec

| Event | Description |
|---|---|
| Place | Soft thunk (~140Hz, 70ms); `feedback.playImmediate` on drop |
| Clear 1 line | Rising two-tone sweep |
| Clear 2+ | Three-note combo arpeggio + heavy haptic |
| Game over | Low descending tone |
| Music | Lo-fi electronic loop; **off by default** |

**Implementation:** MP3 assets in `assets/sounds/` via `src/constants/soundAssets.ts`; playback in `src/services/feedback.ts` and `src/services/backgroundMusic.ts`. `prewarm()` on game mount preloads SFX.

**Licensing:** Document source in DECISIONS (BFXR, Kenney, custom, etc.).

---

## Haptics

| Event | Style |
|---|---|
| Place | Light impact |
| Clear | Medium impact |
| New best | Success / notification |
| Game over | None or light (optional) |

Use `expo-haptics` if added; fallback silent on unsupported devices.

---

## App icon & store art (Phase 7–8)

- **Icon:** Dark background, 2–3 glowing blocks, readable at 48dp
- **Screenshots:** Game in action mid-combo; emphasize neon on dark
- **Feature graphic:** Logo + tagline “Drag. Place. Clear.”

Placeholder acceptable until Phase 7.

---

## Accessibility (v1 minimum)

- Touch targets ≥ 44×44 pt for buttons
- Sufficient contrast on score text vs `#0D0D14`
- No color-only critical info (icons + numbers)

---

## Localization

**Default:** English strings; icon-first UI.

Hindi or other languages: track decision in [DECISIONS.md](./DECISIONS.md).

---

*Engine color constants must match this doc — single source in `src/engine/constants.ts`.*
