---
name: TOMAT What's New modal
description: Per-version changelog popup shown once after update, keyed by localStorage
---

## Rule
- `src/version.js` exports `APP_VERSION` — the single source of truth for the current version string.
- `src/components/WhatsNewModal.jsx` reads `APP_VERSION` and uses localStorage key `tomat_seen_whats_new_v{APP_VERSION}` to show the modal exactly once per version.
- `useWhatsNew()` hook exported from same file — used in `PlayerExperience` in App.jsx.
- Modal only renders for siswa (guruMode guard in App.jsx).

**Why:** On every new release users should see what changed without manual dismissal on every session.

**How to apply on version bump:**
1. Update `src/version.js` APP_VERSION.
2. Update `android/app/build.gradle` versionCode + versionName.
3. Update the `CHANGES` array in `WhatsNewModal.jsx` with the new changelog entries.
The old localStorage key becomes irrelevant; the new key is automatically fresh for all users.
