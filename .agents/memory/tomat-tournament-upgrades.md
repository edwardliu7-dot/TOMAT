---
name: TOMAT tournament upgrades
description: Multi-kelas tournament, auto round labels (Final/Semifinal/Perempat Final), podium top-3 tracking.
---

## Multi-kelas support
- `tournament.kelasArr: string[]` — array of all participating classes; `tournament.kelas` stays as `kelasArr[0]` for backward compat.
- POST `/api/guru/tournament` accepts `{ kelasArr: string[], gameKey }`. Falls back to `[kelas]` if only single kelas sent.
- All socket emits (started / round-start / finished / cancelled) loop over `kelasArr` rooms.
- GET filters by `kelasArr.some(k => kelasDiampu.includes(k))`.

## Round labels
- `getRoundLabel(matchCount)` in `server/tournament-state.js` — exported helper:
  - 1 match → 'Final', 2 → 'Semifinal', ≤4 → 'Perempat Final', else → 'Babak N Besar'
- Each round in `tournamentToClient` includes a `label` field.
- Both `TournamentWaitScreen` and `GuruDashboardScreen` use `round.label` instead of hardcoded "Ronde N".

## Podium top-3
- `tournament.runnerUp` — loser of the final match, computed in `checkRoundComplete`.
- `tournament.semifinalists[]` — losers of the second-to-last round (when it had ≥2 real matches).
- Emitted in `tournament:finished` state payload.
- `TournamentWaitScreen` shows a podium card (🥇🥈🥉) instead of a plain champion name.
- `GuruDashboardScreen` champion banner shows runner-up and semifinalist chips.

## Schema
- `tournament_history` gets 4 new columns via `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`:
  `kelas_arr text[]`, `runner_up_name text`, `runner_up_id text`, `third_place_names text[]`.

## Reward koin podium
- `grantTournamentRewards(io, tournament)` di `tournament-engine.js` — dipanggil setelah `saveTournamentHistory`.
- Langsung UPDATE DB (`coins + total_coins_earned`), kemudian emit `tournament:reward { amount, rank, newCoins }` via `emitToUser`.
- Jumlah: rank 1 = 500, rank 2 = 250, rank 3 = 100 (konstanta `TOURNAMENT_REWARDS`).
- Client: `TournamentWaitScreen` listen `tournament:reward`, panggil `syncCoins(newCoins)` dari PlayerContext (TANPA persistGain agar tidak double-count), tampilkan toast animasi 5 detik.
- `syncCoins` ditambah ke PlayerContext sebagai method tersendiri yang hanya `setState` tanpa persist.

**Why:** Teachers running school competitions wanted cross-class tournaments; named rounds and a podium make results more meaningful for students and parents. Coin rewards added to incentivize participation.
