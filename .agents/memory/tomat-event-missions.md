---
name: TOMAT event mission system
description: How the seasonal event mission system works — DB, hooks, API, and UI conventions.
---

## Architecture

- `server/event-missions.js` — mission definitions (EVENT_MISSIONS[]) + DB helpers: `incrementMissionProgress`, `getMissionProgress`, `claimMissionReward`
- `server/event-missions-router.js` — `GET /api/siswa/event-missions`, `POST /api/siswa/event-missions/:missionId/claim`
- `server/schema.js` — `event_mission_progress` table: `(student_id, mission_id, progress, completed_at, reward_claimed_at)`

## Kemerdekaan missions (eventSlug: 'kemerdekaan', active Jul 15 – Aug 31)

| missionId | nama | goal | reward item |
|---|---|---|---|
| kemerdekaan_1 | Lomba 17-an | 17 jawaban benar dari game apapun | bingkai_kemerdekaan |
| kemerdekaan_2 | Pasukan Merah Putih | 8 duel dimenangkan | spanduk_kemerdekaan |
| kemerdekaan_3 | Garuda Matematika | requires: [kemerdekaan_1, kemerdekaan_2] | pet_kelinsay_merahputih |

## Progress hooks

- **Mission 1 (correct answers)**: `server/player.js` POST `/gain` — fires `incrementMissionProgress(userId, 'kemerdekaan_1', 1)` when `coinsGain > 0` (fire-and-forget after commit).
- **Mission 2 (duel wins)**: `server/multiplayer.js` `finishGame()` — fires `incrementMissionProgress(winner.userId, 'kemerdekaan_2', 1)` when winner is determined.
- **Mission 3 (auto)**: `_autoCompleteRequires()` called automatically inside `incrementMissionProgress` whenever a mission in the same event is updated.

## missionOnly items

All 3 kemerdekaan items have `visual.missionOnly = true` and `harga = 0`. `toko.js /beli` rejects purchase with 403 if `missionOnly`. Items are given via `claimMissionReward()` which inserts directly into `student_inventory`.

## Adding future event missions

Push to `EVENT_MISSIONS` array in `server/event-missions.js`. Hook progress increments at appropriate server endpoints. No schema changes needed (table is generic).

**Why missionOnly + harga=0:** Items should feel earned, not bought. Setting harga=0 prevents accidental coin-free purchase; the missionOnly guard is the authoritative block.
