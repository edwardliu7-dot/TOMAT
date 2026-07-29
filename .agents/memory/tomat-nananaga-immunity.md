---
name: TOMAT Nananaga immunity
description: Wrong-answer immunity bonus for Nananaga pet skins in duel, tournament, and survival modes.
---

## Rule
Nananaga pet skins grant wrong-answer immunity tokens (not hungerMult):
- `pet_nananaga` → 1 token
- `pet_nananaga_merah` → 2 tokens
- `pet_nananaga_es` → 3 tokens

Immunity ONLY applies in: duel, tournament, survival.
Immunity is DISABLED when `activeSession !== null` (tugas guru active).

## Architecture

### Notification
`window.dispatchEvent(new CustomEvent('nananaga-shield', { detail: { tokensLeft } }))` is fired whenever a token is consumed. `NananagaShieldToast` in `src/App.jsx` listens to this event and shows the overlay — no game file changes needed.

### Survival (src/difficulty.js — useSurvival)
`useSurvival` internally calls `useAuth()` and `useTask()` to derive token count. Token tracking is via `immunityLeft` ref. When `recordResult(false)` and `immunityLeft > 0`: consume token, dispatch event, do NOT call `setGameOver()`. Reset on `reset()`.
**Why:** 53+ game files use useSurvival — centralizing in the hook avoids touching all of them.

### Duel (src/screens/DuelKatakScreen.jsx)
In `duel:answer-result` handler: if `!correct && immunityLeft.current > 0 && !activeSession`, consume token, dispatch event, emit `duel:use-immunity` to server, set `myAnswered = false` (stay in playing phase).

### Tournament (src/screens/TournamentMatchScreen.jsx)
Same pattern, emits `tournament:use-immunity` with `{ tournamentId, matchId }`.

### Server (server/multiplayer.js)
`duel:use-immunity` handler: resets `player.answered`, generates new question via `genTournamentQ`, emits `duel:question` with same `player.myRound` (does NOT increment round).
`tournament:use-immunity` handler: resets `match._playerCurrentQ[userId]`, generates new question, emits `tournament:question` with same round number.

**Why:** Server must authorize the bonus question so questions remain server-authoritative and the round count integrity is preserved.

## How to apply
- Adding more nananaga skins: update `wrongImmunity` in `server/pet-bonuses.js` AND `WRONG_IMMUNITY_MAP` in `src/petBonuses.js` (they are manually kept in sync — no single source of truth).
- The immunity check in duel/tournament uses a stale-closure `activeSession` value captured at mount. This is acceptable because task sessions cannot start while a student is in a duel or tournament.
