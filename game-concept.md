# 🧱 BlockRush — Game Concept Document

**Version:** 1.0  
**Date:** May 2026  
**Developer:** Mosin (Solo)  
**Status:** Pre-development

---

## 1. The Core Idea

**BlockRush** is a casual block puzzle game built on the proven Block Blast mechanic — drag, place, and clear blocks on a grid — with a **dark neon aesthetic** targeting a **global audience** while being built and launched from India.

> **One-line pitch:** "The block puzzle game that actually looks cool."

The twist is not a gimmick. It is a deliberate visual and feel positioning: while Block Blast uses a flat, child-friendly colorful style, BlockRush uses a **dark background with glowing neon blocks** — satisfying to look at, premium-feeling, and shareable. Every clear feels like a light show.

---

## 2. Why This Twist

### The gap in the market
Block Blast dominates on gameplay but looks dated. Its visual style targets all ages via bright, safe colors. There is no top-ranked block puzzle game with:
- A dark/neon visual identity
- Premium-feeling UI
- A "satisfying to watch" quality that drives organic sharing

### Why it works for India specifically
- India is the **#1 market globally by download volume** — 8.45 billion downloads per year
- Indian gamers under 25 (60%+ of the market) respond strongly to neon/dark aesthetics — same demographic that drives BGMI, Free Fire, and cyberpunk content
- A "cool looking" puzzle game fills a whitespace: casual mechanics + premium visual = broad appeal with shareable screenshots and clips
- Works offline, runs on low-end Android devices (critical for India — optimize for 2GB RAM phones)

### Why it works globally
- Dark neon is a universal aesthetic trend — no cultural localization needed
- Satisfying clears with glow and particle effects → naturally viral on YouTube Shorts and TikTok
- No language barrier: the UI is icon-first

---

## 3. Game Name Options

| Name | Notes |
|---|---|
| **BlockRush** | Clean, energetic, global — preferred |
| **NeonBlocks** | Describes the visual directly, easy ASO |
| **GridGlow** | Distinctive, memorable |
| **VoidBlocks** | More mysterious, dark-theme aligned |

→ **Go with BlockRush** for the app store listing. Use "Neon Block Puzzle" as the subtitle for ASO keyword targeting.

---

## 4. Core Mechanic (What Stays from Block Blast)

Do not reinvent the mechanic. It is proven with 368M downloads. Copy it exactly:

- **8×8 grid** — the standard that players already know
- **3 pieces shown at a time** — drag any of the 3 to place on the grid
- **No timer, no pressure** — relaxed strategic play
- **Clear full rows or columns** — both horizontal and vertical, like Block Blast
- **Game over when no valid placement exists** for any of the 3 current pieces
- **Score per cell placed + multiplier for multi-line clears**

---

## 5. The Twist in Detail — Neon Dark Aesthetic

### Visual style
- **Background:** Near-black (`#0D0D14`) — deep space / void feel
- **Grid lines:** Subtle, very dim (`#1A1A2E`) — visible but not distracting
- **Blocks:** 6–7 neon color variants, each a solid glowing color with a soft inner border
- **Block colors:** Electric blue `#00D4FF`, Neon green `#39FF14`, Hot pink `#FF006E`, Amber `#FFB800`, Violet `#BF00FF`, Coral `#FF4500`, Cyan `#00FFCC`
- **No gradients on blocks** — flat fill with a 1px bright inner stroke, like a glowing LED tile

### The clear animation (most important)
This is where BlockRush beats Block Blast. When a row or column clears:
1. Cells **flash white** for 80ms
2. Row **expands slightly** (scale 1.0 → 1.04) then **collapses** to nothing
3. **Particle burst** — 8–12 small colored squares scatter from the line
4. **Score pop** — number flies up from the center of the cleared line in matching neon color
5. **Screen edge glow** — a brief pulse of color radiates from the sides (not center)

For combo clears (2+ lines at once): add a **"COMBO x2"** text burst with a brief screen shake (±3px, 120ms).

### Sound design
- Block placement: soft "thunk" with a subtle reverb tail
- Line clear: a rising synth tone (pitch varies with combo — higher pitch = bigger combo)
- Game over: a descending reverb fade, no harsh buzzer
- Background music: optional, off by default — subtle lo-fi electronic loop

---

## 6. Block Piece Set

Use exactly 8 standard piece shapes. No custom shapes needed for v1:

| Piece | Shape | Notes |
|---|---|---|
| Single | 1×1 | Rare, gift piece |
| Domino | 1×2 | Common |
| Line-3 | 1×3 | Common |
| Line-4 | 1×4 | Less common |
| L-shape | 2×2 minus one corner | Common |
| T-shape | T tetromino | Common |
| Square | 2×2 | Common |
| S/Z | S or Z tetromino | Less common |

**Generation rule:** Weighted random. Favor pieces that fit in typical mid-game grids. Never give 3 line-4 pieces simultaneously.

---

## 7. Scoring System

| Action | Points |
|---|---|
| Place a block cell | 1 point per cell |
| Clear 1 line | 10 bonus points |
| Clear 2 lines simultaneously | 30 bonus points (3× multiplier) |
| Clear 3+ lines simultaneously | 60 bonus points (6× multiplier) |
| Personal best beaten | Trophy animation + haptic |

**High score** is stored locally with AsyncStorage. No server required for v1.

---

## 8. Game Modes — v1 Launch

**Launch with one mode only.** Scope creep kills solo dev projects.

| Mode | Description |
|---|---|
| **Classic** (v1) | Endless play. Game ends when no placement possible. Score as high as you can. |
| Daily Challenge (v2) | Same seed for all players on a given day. Share your score. |
| Time Attack (v3) | 3-minute timer. Clear as many lines as possible. |

→ **Ship Classic only. Add modes in updates based on player feedback.**

---

## 9. Monetization Plan

### Primary: AdMob ads (100% free to play)
| Ad Type | Placement | Frequency |
|---|---|---|
| Banner | Bottom of game screen, always visible | Constant |
| Interstitial | After game over | Once per loss, max 1 per 3 min |
| Rewarded | "Watch to continue" button on game-over screen | On demand |

**Rewarded ad mechanic:** Watching a ~30-second ad removes 3 random blocks from the grid and gives the player one more turn. This is the highest-CPM ad type and aligns perfectly with the game loop.

### Secondary: One-time IAP
- **"Remove Ads"** — ₹99 / $0.99 / €0.99
- Removes banner and interstitial ads permanently
- Rewarded ads remain available (player's choice)
- Block Blast does NOT offer this — it is a direct gap to exploit

### Revenue benchmark
- Puzzle game ARPDAU: ~$0.08
- 1,000 DAU → ~$80/day → ~$2,400/month
- 10,000 DAU → ~$800/day → ~$24,000/month

---

## 11. Target Platforms & Devices

| Platform | Priority |
|---|---|
| Android (Google Play) | **Primary — launch first** |
| iOS (App Store) | Secondary — launch 2–4 weeks after Android |

**Android device targeting:** Must run smoothly on 2GB RAM devices. No 3D assets, no heavy physics. Pure React Native with Reanimated animations — performance safe.

---

## 12. Technical Summary

| Item | Choice |
|---|---|
| Framework | React Native + Expo (TypeScript) |
| Animations | react-native-reanimated v3 |
| Gesture handling | react-native-gesture-handler |
| State management | Zustand |
| Local storage | AsyncStorage |
| Ads | react-native-google-mobile-ads (AdMob) |
| Analytics | Firebase Analytics |
| Build & deploy | Expo EAS Build |
| Audio | expo-av |

---

## 13. USP Summary — What Makes BlockRush Distinct

| Feature | Block Blast | BlockRush |
|---|---|---|
| Visual style | Bright, child-friendly | Dark neon, premium-feeling |
| Clear animation | Simple fade | Glow burst + particles + screen pulse |
| Remove Ads IAP | ❌ Not available | ✅ ₹99 one-time |
| Sound design | Basic | Synth tones, pitch-scaled combos |
| Target audience | All ages | 16–35, casual but style-conscious |
| Shareability | Low | High — clips look great on Shorts/Reels |

---

## 14. Build Timeline

| Week | Milestone |
|---|---|
| Week 1 | Project setup + core grid engine (logic only) |
| Week 2 | Drag-and-drop, piece placement, game-over detection |
| Week 3 | UI, animations, sounds, game-over screen |
| Week 4 | AdMob integration, IAP, Firebase analytics |
| Week 5 | Testing, ASO assets, Play Store submission |

---

## 15. ASO Keywords (Day-1 Targeting)

**Primary:** block puzzle game, neon puzzle, grid puzzle offline  
**Secondary:** brain puzzle, block blast alternative, relax puzzle game  
**Long-tail:** block game no wifi, best puzzle game 2025, neon block game

**App title:** BlockRush: Neon Block Puzzle  
**Short description:** The most satisfying block puzzle game. Drag, place, clear. No timer. No internet needed.

---

## 16. Open Questions (Decide Before Coding)

- [ ] App icon design — dark background with a glowing block arrangement
- [ ] Exact block colors — finalize 6-color palette before building UI
- [ ] Sound effects — source free-license synth sounds or create with BFXR/Sfxr
- [ ] Hindi language support in v1 or v2?
- [ ] Google Play developer account set up?

---

*Document owner: Mosin | Last updated: May 2026*
