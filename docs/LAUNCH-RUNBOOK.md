# BlockRush — Launch runbook (Phase 8)

**Parent:** [QA-RELEASE.md](./QA-RELEASE.md) · [GAME-MASTER.md](../GAME-MASTER.md)

Step-by-step guide to ship **v1.0.0** on Google Play (Android first).

---

## Prerequisites

| Item | Status |
|---|---|
| Google Play Developer account ($25 one-time) | ☐ |
| AdMob app + **production** ad unit IDs | ☐ |
| Firebase project + real `google-services.json` | ☐ |
| Play Console in-app product `blockrush_remove_ads` | ☐ |
| Privacy policy hosted at a public HTTPS URL | ☐ |
| EAS account linked (`eas login`) | ☐ |

---

## 1. Pre-build checklist

```bash
npm test
```

- [ ] All tests green (82+)
- [ ] Replace placeholder `google-services.json` — [FIREBASE-SETUP.md](./FIREBASE-SETUP.md)
- [ ] Set production AdMob IDs in EAS Secrets (see `.env.example`)
- [ ] Replace AdMob **app** IDs in `app.json` plugin (not test IDs)
- [ ] Run manual QA from [QA-RELEASE.md](./QA-RELEASE.md) on a **release APK/AAB**
- [ ] Note test devices in `CHANGELOG.md`

---

## 2. EAS build (Android)

### Internal testing (first upload)

```bash
eas build --profile preview --platform android
```

Install the APK on 2+ devices. Complete [QA-RELEASE.md](./QA-RELEASE.md) smoke test.

### Production AAB (Play Store)

```bash
eas build --profile production --platform android
```

- Uses **app-bundle** (required for Play)
- `versionCode` auto-increments via EAS (`appVersionSource: remote`)

### Optional: local dev client

```bash
npx expo run:android
```

---

## 3. Play Console setup

### Create app

1. Play Console → **Create app**
2. Name: **BlockRush: Neon Block Puzzle**
3. Default language: English
4. App / game, free with ads + IAP

### Store listing

Copy from [STORE-LISTING.md](./STORE-LISTING.md).

### App content

| Section | Doc |
|---|---|
| Privacy policy URL | Host [legal/PRIVACY-POLICY.md](./legal/PRIVACY-POLICY.md) |
| Ads declaration | Yes — AdMob |
| Content rating | IARC questionnaire — casual puzzle, no violence |
| Data safety | [PLAY-CONSOLE-DATA-SAFETY.md](./PLAY-CONSOLE-DATA-SAFETY.md) |
| Target audience | 16+ recommended (ads + IAP) |

### Monetization

1. **In-app products** → Create `blockrush_remove_ads` (non-consumable), activate
2. Add **license testers** for purchase QA
3. Link AdMob app to Play app (AdMob console)

---

## 4. Upload & rollout

### Submit via EAS (recommended)

1. Create a [Google Play service account](https://expo.fyi/creating-google-service-account) with release permissions
2. Upload JSON key to EAS: `eas credentials`
3. Submit:

```bash
eas submit --profile production --platform android --latest
```

Default track in `eas.json`: **internal** (draft). Promote in Play Console after QA.

### Manual upload

1. Play Console → **Testing → Internal testing** → Create release
2. Upload AAB from EAS build page
3. Add release notes from `CHANGELOG.md`
4. Review → roll out to internal testers

### Rollout path

```
Internal (you + testers) → Closed (5–10 testers) → Open (optional) → Production
```

---

## 5. Closed beta (5–10 testers)

- [ ] Share internal testing link
- [ ] Collect feedback: feel, ad frequency, rewarded continue fairness
- [ ] Fix P0/P1 only — defer v1.1 features

---

## 6. Production release

- [ ] Promote release to **Production**
- [ ] Staged rollout: start 20% → monitor vitals 48h → 100%
- [ ] Tag git: `git tag v1.0.0` (when ready)
- [ ] Update [GAME-MASTER.md](../GAME-MASTER.md) status to shipped

---

## 7. Post-launch (week 1)

- [ ] Firebase Analytics → Events (DAU, game_over, ad_reward)
- [ ] Play Console → Vitals (crash rate, ANRs)
- [ ] AdMob → eCPM fill rate
- [ ] Plan v1.1 from [game-concept.md](../game-concept.md) backlog

---

## iOS backlog (weeks 6–8)

- Apple Developer account
- `GoogleService-Info.plist` + `app.json` `googleServicesFile`
- App Store Connect listing (reuse [STORE-LISTING.md](./STORE-LISTING.md))
- Test IAP restore on TestFlight

---

## Troubleshooting

| Issue | See |
|---|---|
| Expo Go vs native ads | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) |
| Firebase / Analytics | [FIREBASE-SETUP.md](./FIREBASE-SETUP.md) |
| AdMob / IAP dev build | [MONETIZATION-SETUP.md](./MONETIZATION-SETUP.md) |
