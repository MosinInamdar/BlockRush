# Google Play — Data safety form (BlockRush v1)

**Parent:** [LAUNCH-RUNBOOK.md](./LAUNCH-RUNBOOK.md)

Use this when completing **App content → Data safety** in Play Console. Answers reflect the current codebase; verify before submit.

---

## Summary

| Question | Answer |
|---|---|
| Does your app collect or share user data? | **Yes** |
| Is all data encrypted in transit? | **Yes** (HTTPS for ad/analytics SDKs) |
| Can users request data deletion? | **Partially** — uninstall / clear app data removes local saves; ad/analytics via Google account settings |

---

## Data types collected (via SDKs)

### App activity (Firebase Analytics)

- **Collected:** Yes  
- **Shared:** No (Firebase/Google as processor)  
- **Purpose:** Analytics  
- **Optional:** No (required for product improvement; no account)  
- **Ephemeral:** No  

Events include: app open, game start, game over (score), line clears, ad impressions, ad rewards, IAP.

### Device or other IDs (AdMob / Firebase)

- **Collected:** Yes (Advertising ID / app instance ID per Google SDK behavior)  
- **Purpose:** Advertising, Analytics  
- **Optional:** No for free tier with ads  

### App info and performance (crash/diagnostics)

- **Collected:** May be collected by Google SDKs automatically  
- **Purpose:** Analytics, fraud prevention  

### Financial info (Play Billing)

- **Collected:** Purchase history handled by **Google Play** — declare per Play’s IAP guidance  
- **Purpose:** App functionality (Remove Ads)  

---

## Data NOT collected by BlockRush directly

- Name, email, phone (no account system in v1)
- Precise location
- Photos, contacts, SMS
- Health data

---

## Security practices

- Data encrypted in transit: **Yes**
- Users can request deletion: **Uninstall app** for local data; link [Google ad settings](https://adssettings.google.com) in policy optional

---

## Ads

- **Does the app contain ads?** Yes  
- **Are ads from a certified ad network?** Yes (AdMob)  
- **Are ads limited to age-appropriate content?** Configure in AdMob console; target 16+ in store listing

---

## Privacy policy URL

Required. Host [legal/PRIVACY-POLICY.md](./legal/PRIVACY-POLICY.md) and enter the HTTPS URL.

---

*Re-check this form when adding Crashlytics, login, or new SDKs in v1.1+.*
