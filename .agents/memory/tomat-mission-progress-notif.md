---
name: TOMAT Mission Progress Notification
description: Arsitektur MissionProgressToast + MissionClaimNotification — alur data dari server ke UI
---

## Aturan Kritis (RULES.md §16 compliance)

`EVENT_MISSIONS` **hanya boleh diimport** di `event-missions.js` dan `gameplay-events.js`.  
`player.js`, `multiplayer.js`, `tournament-engine.js` **tidak boleh** import `EVENT_MISSIONS` langsung.

**Why:** gameplay-events.js adalah single source of truth. Jika caller mengimport EVENT_MISSIONS
sendiri, menambah misi baru memaksa perubahan di banyak file — melanggar §16.

## Alur Data

### Minigame (REST)
```
addCoins() → persistGain() → POST /api/siswa/player/gain
  → onCorrectAnswerWithResult() → _formatDeltas() → Array<MissionDelta>
  → response.missionDeltas[]
  → PlayerContext.addCoins .then() → setMissionToasts / setMissionClaims
  → MissionProgressToast / MissionClaimNotification
```

### Duel / Turnamen (Socket)
```
duel:answer correct / handleTournamentAnswer correct
  → onCorrectAnswerWithResult() → Array<MissionDelta>
  → socket.emit / emitToUser('mission:progress', delta)
  → App.jsx socket.on('mission:progress') → pushMissionProgress()
  → setMissionToasts / setMissionClaims
  → MissionProgressToast / MissionClaimNotification
```

### Duel Win
```
finishGame() → onDuelWinWithResult() → Array<MissionDelta>
  → iterate sockets → emit('mission:progress', delta) to winner
```

## Shape MissionDelta

```js
{ missionId, nama, emoji, delta, newProgress, goal, completed }
```

- `delta > 0` = progress nyata bertambah
- `delta = 0` = auto-complete (kemerdekaan_3 triggered oleh 1 & 2)
- `completed = true` = misi baru selesai di call ini → trigger MissionClaimNotification

## File Baru / Diubah

| File | Perubahan |
|------|-----------|
| `server/event-missions.js` | `incrementMissionProgress` returns `delta` (SELECT sebelum UPSERT) |
| `server/gameplay-events.js` | `fireAndReturn()`, `_formatDeltas()`, `onCorrectAnswerWithResult()`, `onDuelWinWithResult()` |
| `server/player.js` | `missionDeltas` di response `/gain` |
| `server/multiplayer.js` | emit `mission:progress` di `duel:answer` + `finishGame` |
| `server/tournament-engine.js` | emit `mission:progress` di `handleTournamentAnswer` (async) |
| `src/PlayerContext.jsx` | `missionToasts`, `missionClaims`, `pushMissionProgress`, `dismissMission*` |
| `src/App.jsx` | import komponen, `usePlayer()`, socket listener, render toast+modal |
| `src/components/MissionProgressToast.jsx` | BARU — FIFO queue, bottom 80px, auto-dismiss 2500ms |
| `src/components/MissionClaimNotification.jsx` | BARU — modal overlay, tombol klaim + nanti saja |

## Menambah Misi Baru

1. Tambah entri di `EVENT_MISSIONS` di `event-missions.js`
2. Di `gameplay-events.js`: tambah `fire(studentId, 'id_baru')` di fungsi yang sesuai
3. Jika butuh notifikasi: gunakan `fireAndReturn` + sertakan dalam `_formatDeltas`
4. **Tidak perlu ubah** player.js, multiplayer.js, tournament-engine.js, atau komponen frontend
