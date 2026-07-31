---
name: Event Mission Hooks — Duel & Tournament Gap
description: Duel and tournament correct answers must hook incrementMissionProgress directly (not via /api/siswa/player/gain). Documents the fix pattern and all three authoritative hook points.
---

## The Problem (fixed 2026-07-31)

`kemerdekaan_1` ("Lomba 17-an" — 17 correct answers) was only incremented via
`POST /api/siswa/player/gain` in `server/player.js`. This meant:

- Minigame free-play / task mode: ✅ worked (calls `addCoins(50)` → `persistGain` → `/gain`)
- **Duel mode**: ❌ broken — `duel:answer` only updated `player.score` in-memory, never called `/gain`
- **Tournament mode**: ❌ broken — `handleTournamentAnswer` only updated `match.scores`, never called `/gain`

Also: `finishGame()` tracked `kemerdekaan_2` for the winner but never awarded the 15 coins
despite `GameOverScreen` displaying "+15 koin". Coins were fictional.

## Fix Applied

Three hook points added — each mode must hook its own correct-answer path:

| Mode | File | Hook location |
|------|------|--------------|
| Minigame (REST) | `server/player.js` | Already correct — `if (coinsGain > 0)` → `incrementMissionProgress('kemerdekaan_1')` |
| Duel (Socket.io) | `server/multiplayer.js` | `duel:answer` handler → `if (correct)` → `incrementMissionProgress(user.id, 'kemerdekaan_1', 1)` |
| Tournament (Socket.io) | `server/tournament-engine.js` | `handleTournamentAnswer` → `if (correct)` → `incrementMissionProgress(userId, 'kemerdekaan_1', 1)` |

### Duel Win Coin Award
`finishGame()` made async; winner gets `+15 coins` via `pool.query` update.
New field `winnerNewCoins` added to `duel:game-over` payload.
Client (`DuelKatakScreen.jsx`) calls `syncCoins(winnerNewCoins)` — NOT `addCoins()` — to avoid double-counting.

**Why:** `addCoins()` calls `persistGain()` which would POST to `/gain` again (double DB write).
`syncCoins()` only updates local state from an authoritative server value.

## Rule for Future Modes

Any new gameplay mode that awards correct answers and needs event mission tracking:
- If REST: ensure it calls `/api/siswa/player/gain` with `coins > 0`
- If Socket.io: add `incrementMissionProgress(userId, 'kemerdekaan_1', 1)` directly in the server handler

Boss Raid correct answers intentionally NOT hooked (co-op event, different reward flow).
