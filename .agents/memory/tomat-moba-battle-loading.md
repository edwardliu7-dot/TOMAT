---
name: TOMAT MOBA Battle Loading Screen
description: Loading gate + game mechanic changes implemented between matchmaking_found and match start.
---

## What changed

### Server

**config.js**
- `durationMs: 420_000` (7 min, was 600k)
- `POINTS_BY_DIFFICULTY.hard: 60` (was 50)
- Added: `wave2StartMs: 300_000`, `wave2MaxActiveNodes: 20`, `wave2SpawnIntervalMs: 4_000`
- Added: `clientLoadTimeoutMs: 30_000`, `boxCapacity: 100`

**questions.js**
- Added `createCurriculumQuestionGenerator(gameKeys)` — sync, imports from `../tournament-questions.js`
- Converts tournament-questions slider answers into 4-option multiple-choice for MOBA modal

**state.js**
- Added `clientLoadedIds: new Set()` and `depositBoxes: new Map(...)` to `createMatchState`
- Added `depositBoxes` serialization to `sanitizeMatchState`

**match-manager.js**
- Added `DEPOSIT_ZONES`, `DEFAULT_MOBA_CONFIG` to imports from config.js
- `createMatch()` accepts `questionGeneratorOverride` param; stored on match object
- `claimNode` uses `match.questionGeneratorOverride || questionGenerator`
- `beginRunning` adds `wave2` timer at `wave2StartMs` → upgrades maxActiveNodes + spawn interval
- `depositScroll` refactored: finds nearest player-team zone (zone.team === player.teamId, !isLibrary), fills box, emits `scroll_deposited` + `box_completed`; NO tower/base damage
- Added `markClientLoaded({matchId, playerId})` — tracks clientLoadedIds, triggers `tryStart` when all loaded
- `clearLifecycleTimers` now also clears `wave2` timer

**socket-handlers.js**
- Imports: `PHASES, DEFAULT_MOBA_CONFIG` from config; `createCurriculumQuestionGenerator` from questions; `SUPPORTED_TOURNAMENT_GAMES` from tournament-questions
- Added `loadTimeouts` Map for per-match auto-ready safety timers
- `formMatchmakingGroup`: detects player grades via DB, picks lowest, builds curriculum generator, REMOVES auto-setReady, emits matchmaking_found, sets 30s timeout fallback
- Added `moba:client_loaded` handler → calls `markClientLoaded` → clears timeout when all loaded

**results.js**
- Winner gets 1 coin per point (Math.max(1, Math.min(score, 500))); fallback to fixed amount for draws/zero-score

### Client

**MobaBattleLoader.jsx** (new)
- Full-screen loading gate shown when `matchmaking.status === 'matched' && !countdownStarted`
- 4 simulated loading steps (total ~2.6s), then emits `moba:client_loaded`
- Shows both players' pet emojis, loading steps, progress bar

**mobaTypes.js**
- Added `box_completed` to MOBA_SERVER_EVENTS

**mobaReducer.js**
- `matchmaking_found` → sets `countdownStarted: false`
- `match_countdown` → sets `countdownStarted: true` (triggers arena transition)

**useMobaSocket.js**
- Added `clientLoaded(matchId)` action (emits `moba:client_loaded`)

**MobaLobbyScreen.jsx**
- When `isLoadingBattle` (matched && !countdownStarted) → renders `<MobaBattleLoader />`
- Transitions to arena only when `isEnteringArena` (countdownStarted === true)

## Key rules

**Why:** The loading gate ensures both players start simultaneously, preventing one player from having a head start while the other is still loading assets.

**Deposit zones:** `zone.team === player.teamId && !isLibrary` → Team A's scoring zones (az-*) are at x=73,500 (right side, enemy territory). Team B's (bz-*) at x=6,500 (left side).

**Question generator must be sync** — `claimNode` is synchronous; do not make `createCurriculumQuestionGenerator` return an async function.

**Box fill accumulates infinitely** — team.score is total points deposited; box.fill resets to 0 when it hits 100, emitting `box_completed`. Match winner = higher team.score at end of 7 min.
