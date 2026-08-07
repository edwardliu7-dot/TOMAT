---
name: TOMAT tournament upgrades
description: Lobby system + kelompok team mode with juru jawab selection for tournaments
---

## Lobby System (berlaku untuk semua mode)

Tournament dibuat dengan `lobbyOpen: true` → ronde TIDAK otomatis mulai.
- Siswa mendapat notifikasi → buka app → navigasi ke `tournament-wait` (TournamentWaitScreen)
- Siswa klik "Masuk Lobby" → emit `tournament:join-lobby` → server update `tournament.lobby` → emit `tournament:lobby-state` ke guru room
- Guru melihat daftar peserta lobby live di GuruDashboardScreen TurnamenTab
- Guru klik "Mulai Pertandingan" → POST `/api/guru/tournament/:id/start` → server set `lobbyOpen: false`, call `startTournamentRound_all`

**Why:** Agar guru bisa memastikan semua siswa siap sebelum ronde dimulai, mencegah banyak walkover.

**How to apply:** Jangan call `startTournamentRound_all` langsung saat POST /tournament. Selalu via `/start` endpoint.

---

## Kelompok Mode — Juru Jawab System

Soal SAMA dikirim ke semua anggota kedua tim. Hanya juru jawab yang bisa submit.

### Server-side flow:
1. `startTournamentRound_all` → emit `tournament:your-match` ke SEMUA anggota kedua tim (bukan hanya representatif)
2. `tournament:player-ready` (multiplayer.js) → kelompok: semua anggota bisa join; track socket di `match._teamMemberSockets`; set `match.status = 'waiting-juru'`; mulai timer 30s `_teamJuruTimer`
3. `tournament:claim-juru-jawab` → set `match.teamJuruJawab[teamId] = userId`; emit `tournament:juru-jawab-set`; call `checkAndStartKelompokMatch`
4. `checkAndStartKelompokMatch` → jika kedua tim punya juru jawab → `startTournamentMatch`
5. `sendQuestionToAllTeamMembers` → generate 1 soal → kirim ke semua `_teamMemberSockets` dengan `isKelompok: true, teamJuruJawab`
6. `handleTournamentAnswer` (kelompok) → validasi user adalah juru jawab → `handleKelompokAnswer` → update skor team rep → emit `tournament:team-answer-result` ke seluruh match room → tunggu kedua tim jawab → next Q
7. Setelah `TOURNAMENT_MAX_ROUNDS` (7) soal → `finishTournamentMatch`

### Scoring (kelompok):
- Skor keyed by `teamRepUserId` (player1.userId / player2.userId) di `match.scores`
- `getTeamRepUserId(match, teamId)` → cari player1 atau player2 yang punya teamId ini
- Reward koin diberikan ke SEMUA anggota tim yang menang (bukan hanya representatif)

### Client-side flow (TournamentMatchScreen):
- Props baru: `isKelompok, teamId, teamName, teamRepUserId, myTeamMembers`
- Phase baru `'juru-select'` → tampilkan `JuruJawabSelectScreen` dengan tombol "Saya Jadi Juru Jawab!"
- Socket event `tournament:juru-jawab-set` → update `juruJawabList`
- `isJuruJawab = juruJawabList.find(j => j.teamId === teamId)?.userId === myUserId`
- Non-juru: slider disabled, lihat posisi juru via `tournament:team-slider-update`
- Juru: emit `tournament:team-slider` (broadcast ke tim + guru)
- `tournament:team-answer-result` → semua anggota kedua tim lihat hasilnya

### Bracket saat menunggu ronde
- Siswa yang sudah selesai bertanding menampilkan bracket live pada layar menunggu hasil/ronde berikutnya.
- Popup `Masuk Arena!` tetap menjadi overlay paling atas; transisi ke arena mengganti route turnamen yang sedang tampil, bukan menumpuk route baru.

**Why:** Siswa perlu melihat progres pertandingan lain tanpa kehilangan notifikasi pertandingan berikutnya atau membuat bracket menutupi CTA masuk arena.

**How to apply:** Bracket adalah konten layar biasa; notifikasi arena dirender sebagai overlay global dengan z-index tertinggi dan navigasi ke arena mengganti layar turnamen aktif.

### Match states untuk kelompok:
- `'pending'` → `'waiting-join'` → `'waiting-juru'` → `'in-progress'` → `'finished'`

---

## File yang diubah
- `server/tournament-state.js` — lobbyOpen/lobby fields, kelompok match fields, tournamentToClient update
- `server/tournament-engine.js` — lobby gate, kelompok question/answer handlers, team reward
- `server/multiplayer.js` — join-lobby, player-ready kelompok, claim-juru-jawab, team-slider handlers
- `server/guru.js` — POST tournament sets lobbyOpen=true; POST /:id/start endpoint
- `src/screens/TournamentWaitScreen.jsx` — LobbyWaitScreen component, lobby state handling
- `src/screens/TournamentMatchScreen.jsx` — JuruJawabSelectScreen, team-aware game UI
- `src/screens/GuruDashboardScreen.jsx` — lobby management panel, handleStartFromLobby
- `src/App.jsx` — pass kelompok props, navigate to tournament-wait on tournament:started
