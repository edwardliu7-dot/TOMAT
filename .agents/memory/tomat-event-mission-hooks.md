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

## Fix + Refactor Applied

Centralized `server/gameplay-events.js` created as Single Source of Truth.
All callers (`player.js`, `multiplayer.js`, `tournament-engine.js`) now call exported functions — never `incrementMissionProgress` directly.

| Function | When called | Missions triggered |
|----------|-------------|-------------------|
| `onCorrectAnswer(studentId)` | Any correct answer, any mode | `kemerdekaan_1` |
| `onDuelWin(winnerId)` | Duel 1v1 win | `kemerdekaan_2`, `kemerdekaan_3` (auto) |
| `onTournamentWin(winnerId)` | Tournament match win | (placeholder, no active mission yet) |

### Duel Win Coin Award
`finishGame()` made async; winner gets `+15 coins` via `pool.query` update.
New field `winnerNewCoins` added to `duel:game-over` payload.
Client (`DuelKatakScreen.jsx`) calls `syncCoins(winnerNewCoins)` — NOT `addCoins()` — to avoid double-counting.

**Why:** `addCoins()` calls `persistGain()` which would POST to `/gain` again (double DB write).
`syncCoins()` only updates local state from an authoritative server value.

## Rule for Future Modes / Missions

To add a new mission triggered by existing gameplay:
1. Define the mission in `server/event-missions.js`
2. Add `fire(studentId, 'new_mission_id')` inside the right function in `gameplay-events.js`
3. NO changes needed in `player.js`, `multiplayer.js`, or `tournament-engine.js`

Boss Raid correct answers intentionally NOT hooked (co-op event, different reward flow).
