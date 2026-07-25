# PROMPT IMPLEMENTASI: Mode Duel (Relokasi) + Mode Turnamen

## KONTEKS PROYEK

Ini adalah aplikasi **TOMAT (Tantangan Otak Matematika)** — platform edukasi matematika berbasis game untuk SMP. Tech stack:
- **Frontend**: React + Vite (SPA, tidak ada React Router — navigasi pakai state `history` stack)
- **Backend**: Express.js + Socket.io (real-time)
- **Database**: PostgreSQL via Neon (pool dari `server/db.js`)
- **Session**: `express-session` + `connect-pg-simple`
- **Auth**: session-based, `req.session.user` / `socket.request.session.user`

---

## ARSITEKTUR YANG SUDAH ADA (WAJIB DIBACA DULU)

### Navigasi (App.jsx)
```
history stack: ['home'] → push route → render screen
navigate(routeKey) → jika GAME_ROUTES[key] → push 'modeselect' dulu → ModeSelectScreen → pilih mode → play
```

### Sistem Duel yang sudah ada
- `server/multiplayer.js` — Socket.io handlers untuk duel 1v1
- `server/boss-state.js` — shared state untuk Boss Raid (sudah ada, referensi arsitektur)
- `src/socket.js` — singleton `connectSocket()` / `disconnectSocket()`
- `src/screens/LobbyScreen.jsx` — UI buat/join ruangan dengan kode 6 karakter
- `src/screens/DuelKatakScreen.jsx` — layar game duel (slider ghost, scoring)

### Socket events duel yang sudah ada
```
Client → Server: duel:create, duel:join, duel:start-game, duel:slider-move, duel:answer, duel:leave
Server → Client: duel:created, duel:joined, duel:opponent-joined, duel:opponent-slider,
                 duel:countdown, duel:question, duel:answer-result, duel:opponent-answered,
                 duel:player-left, duel:game-over, duel:error
```

### Question generation server-side (sudah ada di multiplayer.js)
```javascript
function genKatakQ() {
  const jump  = rand(2, 7)
  const bound = 15 - jump
  const start = rand(-bound, bound)
  const isForward = Math.random() < 0.5
  const answer = isForward ? start + jump : start - jump
  return { start, jump, isForward, answer }
}
```

### Peran user
- `siswa`: bisa bermain game, ikut duel/turnamen
- `guru`: hanya bisa akses dashboard, bisa mulai turnamen/boss raid

### Kelas
- Siswa: `students.kelas` (string, misal `"VII A"`)
- Guru: `gurus.kelas_diampu` (array of strings, misal `["VII A", "VII B"]`)

---

## FITUR 1: RELOKASI TOMBOL MODE DUEL

### Masalah saat ini
Tombol "⚔️ Mode Duel" ada di `Grade7ZoneScreen.jsx` sebagai button kecil di bawah card Katak Pelompat. Ini tidak ideal.

### Yang harus dilakukan

**1. Hapus tombol duel dari `Grade7ZoneScreen.jsx`**

Cari dan hapus blok ini:
```jsx
{!babILocked && (
  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -4 }}>
    <button onClick={() => navigate('duel-lobby')} ...>
      ⚔️ Mode Duel
    </button>
  </div>
)}
```

**2. Tambahkan Mode Card "Mode Duel" di `ModeSelectScreen.jsx`**

Mode Card duel hanya muncul **jika `pendingGame?.key === 'katak'`** (hanya game Katak yang mendukung duel server-authoritative).

Tambahkan props baru ke ModeSelectScreen: `onDuel` (fungsi callback, dipanggil saat siswa pilih mode duel).

```jsx
// Di ModeSelectScreen, setelah card Mode Tugas:
{pendingGame?.key === 'katak' && (
  <ModeCard
    icon="⚔️"
    title="Mode Duel"
    subtitle="Tantang teman sekelasmu secara real-time! 7 soal, siapa lebih banyak benar?"
    badge="MULTIPLAYER"
    badgeColor="#f59e0b"
    ctaLabel="Masuk Lobby Duel ▶"
    ctaColor="#f59e0b"
    onClick={onDuel}
  />
)}
```

**3. Hubungkan di App.jsx**

Di `handleModeSelected` atau di blok render `modeselect`:
```jsx
<ModeSelectScreen
  ...props yang sudah ada...
  onDuel={() => {
    replaceTop('duel-lobby')
  }}
/>
```

---

## FITUR 2: MODE TURNAMEN

### Konsep
- **Guru** mulai turnamen untuk satu kelas → server ambil semua siswa di kelas, acak, buat bracket single-elimination
- Semua match di setiap ronde berjalan **serentak (paralel)**
- **Siswa** terima notifikasi socket → tap → auto-join match mereka (tanpa kode)
- **Guru** lihat bagan bracket live di dashboard, bisa klik match → spectator view
- Jika siswa tidak join dalam **60 detik** → lawan menang walkover otomatis
- Ronde berikutnya dimulai **otomatis** setelah semua match selesai
- Jumlah siswa ganjil → satu siswa acak dapat **bye** (langsung lolos)

### Game yang didukung turnamen
Karena turnamen membutuhkan soal server-authoritative, buat modul `server/tournament-questions.js` yang berisi fungsi `genQ(gameKey)` untuk game-game berikut:

```javascript
// server/tournament-questions.js

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

const generators = {
  // Katak Pelompat — bilangan bulat, garis bilangan
  katak: () => {
    const jump  = rand(2, 7)
    const bound = 15 - jump
    const start = rand(-bound, bound)
    const isForward = Math.random() < 0.5
    const answer = isForward ? start + jump : start - jump
    return {
      question: {
        start, jump, isForward,
        text: `Katak di posisi ${start}, lompat ${isForward ? 'maju' : 'mundur'} ${jump} langkah. Posisi akhir?`
      },
      answer,
      sliderMin: -20, sliderMax: 20,
      gameLabel: 'Katak Pelompat'
    }
  },

  // Termometer — penjumlahan/pengurangan bilangan bulat
  termometer: () => {
    const start  = rand(-15, 15)
    const change = rand(1, 10) * (Math.random() < 0.5 ? 1 : -1)
    const answer = start + change
    return {
      question: {
        text: `Suhu awal ${start}°C, ${change >= 0 ? 'naik' : 'turun'} ${Math.abs(change)}°. Suhu akhir?`
      },
      answer,
      sliderMin: -25, sliderMax: 25,
      gameLabel: 'Termometer'
    }
  },

  // Pabrik Robot — perkalian bilangan bulat
  pabrikrobot: () => {
    const a = rand(2, 9)
    const b = rand(2, 9) * (Math.random() < 0.3 ? -1 : 1)
    const answer = a * b
    return {
      question: { text: `${a} × ${b} = ?` },
      answer,
      sliderMin: -81, sliderMax: 81,
      gameLabel: 'Pabrik Robot'
    }
  },

  // FPB sederhana
  gembok: () => {
    const factors = [2, 3, 4, 5, 6]
    const fpb = factors[rand(0, factors.length - 1)]
    const a = fpb * rand(2, 6)
    const b = fpb * rand(2, 6)
    // pastikan tidak sama
    const bFinal = (a === b) ? b + fpb : b
    const answer = fpb
    return {
      question: { text: `FPB dari ${a} dan ${bFinal}?` },
      answer,
      sliderMin: 1, sliderMax: 30,
      gameLabel: 'Gembok Roda Gigi'
    }
  },

  // KPK sederhana
  mercusuar: () => {
    const a = rand(2, 6)
    const b = rand(2, 6)
    // hitung KPK
    const gcd = (x, y) => y === 0 ? x : gcd(y, x % y)
    const answer = (a * b) / gcd(a, b)
    return {
      question: { text: `KPK dari ${a} dan ${b}?` },
      answer,
      sliderMin: 1, sliderMax: 60,
      gameLabel: 'Mercusuar'
    }
  },
}

export function genTournamentQ(gameKey) {
  const gen = generators[gameKey]
  if (!gen) throw new Error(`Game '${gameKey}' belum didukung untuk turnamen.`)
  return gen()
}

export const SUPPORTED_TOURNAMENT_GAMES = Object.keys(generators)
// ['katak', 'termometer', 'pabrikrobot', 'gembok', 'mercusuar']
```

---

### State Turnamen: `server/tournament-state.js`

```javascript
// server/tournament-state.js

export const tournaments = new Map() // tournamentId → Tournament

let _io = null
export function setTournamentIo(io) { _io = io }
export function getTournamentIo() { return _io }

/**
 * Struktur Tournament:
 * {
 *   id: string (uuid),
 *   kelas: string,
 *   guruId: number,
 *   gameKey: string,
 *   status: 'waiting' | 'in-progress' | 'finished',
 *   currentRound: number,
 *   rounds: Round[],   // index 0 = ronde 1
 *   students: Student[], // semua peserta
 *   champion: Student | null,
 *   createdAt: number,
 * }
 *
 * Round: { matches: Match[] }
 *
 * Match: {
 *   id: string,
 *   player1: Student | null,  // null = bye slot kosong
 *   player2: Student | null,
 *   winner: Student | null,
 *   status: 'pending' | 'waiting-join' | 'in-progress' | 'finished' | 'walkover' | 'bye',
 *   roomCode: string | null,
 *   scores: { [userId]: number },
 *   walkoverTimer: NodeJS timer ref | null,
 * }
 *
 * Student: { userId, name, kelas, socketId | null }
 */

import { v4 as uuidv4 } from 'uuid' // atau pakai crypto.randomUUID()

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildFirstRound(students) {
  const shuffled = shuffle(students)
  const matches = []
  for (let i = 0; i < shuffled.length; i += 2) {
    const p1 = shuffled[i]
    const p2 = shuffled[i + 1] || null  // null = bye
    matches.push({
      id: uuidv4(),
      player1: p1,
      player2: p2,
      winner: null,
      status: p2 === null ? 'bye' : 'pending',
      roomCode: null,
      scores: {},
      walkoverTimer: null,
    })
  }
  return { matches }
}

export function tournamentToClient(t) {
  if (!t) return null
  return {
    id: t.id,
    kelas: t.kelas,
    gameKey: t.gameKey,
    status: t.status,
    currentRound: t.currentRound,
    rounds: t.rounds.map(round => ({
      matches: round.matches.map(m => ({
        id: m.id,
        player1: m.player1 ? { userId: m.player1.userId, name: m.player1.name } : null,
        player2: m.player2 ? { userId: m.player2.userId, name: m.player2.name } : null,
        winner: m.winner ? { userId: m.winner.userId, name: m.winner.name } : null,
        status: m.status,
        roomCode: m.roomCode,
        scores: m.scores,
      }))
    })),
    champion: t.champion ? { userId: t.champion.userId, name: t.champion.name } : null,
  }
}
```

---

### Server: Socket.io handlers baru di `server/multiplayer.js`

Tambahkan di dalam `io.on('connection', ...)` — pisahkan di bagian bawah setelah Boss Raid handlers:

```javascript
// ═══════════════════════════════════════════════════════════════
// TOURNAMENT — spectator + player events
// ═══════════════════════════════════════════════════════════════

// Guru join sebagai spectator tournament room
socket.on('tournament:spectate', ({ tournamentId } = {}) => {
  if (user.role !== 'guru') return
  const t = tournaments.get(tournamentId)
  if (!t) return
  socket.join(`tournament:${tournamentId}`)
  socket.emit('tournament:state', tournamentToClient(t))
})

// Guru spectate match tertentu (live slider view)
socket.on('tournament:spectate-match', ({ matchId } = {}) => {
  if (user.role !== 'guru') return
  socket.join(`match-spectate:${matchId}`)
})

// Siswa: acknowledge notifikasi dan siap join match
socket.on('tournament:player-ready', ({ tournamentId, matchId } = {}) => {
  if (user.role !== 'siswa') return
  const t = tournaments.get(tournamentId)
  if (!t) return

  const round = t.rounds[t.currentRound - 1]
  const match = round?.matches.find(m => m.id === matchId)
  if (!match || match.status === 'finished' || match.status === 'walkover') return

  // Cek player ada di match ini
  const isP1 = match.player1?.userId === user.id
  const isP2 = match.player2?.userId === user.id
  if (!isP1 && !isP2) return

  // Update socketId player
  if (isP1) match.player1.socketId = socket.id
  if (isP2) match.player2.socketId = socket.id

  // Join room duel
  socket.join(match.roomCode)

  // Broadcast update ke guru
  _io.to(`tournament:${tournamentId}`).emit('tournament:state', tournamentToClient(t))

  // Cek apakah kedua player sudah join
  const p1Ready = !match.player1 || match.player1.socketId
  const p2Ready = !match.player2 || match.player2.socketId
  if (p1Ready && p2Ready && match.status === 'waiting-join') {
    clearTimeout(match.walkoverTimer)
    match.walkoverTimer = null
    startTournamentMatch(_io, t, match)
  }
})
```

---

### Fungsi inti turnamen (tambahkan di `server/multiplayer.js` atau file terpisah `server/tournament-engine.js`)

```javascript
import { genTournamentQ } from './tournament-questions.js'
import { tournaments, tournamentToClient, buildFirstRound } from './tournament-state.js'

const TOURNAMENT_MAX_ROUNDS = 7
const WALKOVER_TIMEOUT_MS   = 60_000  // 60 detik

// Mulai satu match
function startTournamentMatch(io, tournament, match) {
  match.status = 'in-progress'
  match.scores  = {}
  if (match.player1) match.scores[match.player1.userId] = 0
  if (match.player2) match.scores[match.player2.userId] = 0
  match._round = 0
  match._answers = {}

  // Notify guru
  io.to(`tournament:${tournament.id}`).emit('tournament:state', tournamentToClient(tournament))

  startTournamentRound(io, tournament, match)
}

function startTournamentRound(io, tournament, match) {
  match._round++
  const q = genTournamentQ(tournament.gameKey)
  match._currentQ = q  // simpan di server, JANGAN kirim answer ke client

  match._answers = {}  // reset jawaban ronde ini

  // Kirim soal ke kedua player (via room duel)
  const { answer, ...qForClient } = q.question ? { ...q, answer: q.answer } : q
  io.to(match.roomCode).emit('tournament:question', {
    question: qForClient,
    round: match._round,
    maxRounds: TOURNAMENT_MAX_ROUNDS,
    scores: match.scores,
    sliderMin: q.sliderMin,
    sliderMax: q.sliderMax,
  })

  // Kirim ke spectator guru
  io.to(`match-spectate:${match.id}`).emit('tournament:question', {
    question: qForClient,
    round: match._round,
    maxRounds: TOURNAMENT_MAX_ROUNDS,
    scores: match.scores,
    matchId: match.id,
  })
}

// Dipanggil saat siswa submit jawaban
function handleTournamentAnswer(io, tournament, match, userId, value, socket) {
  if (match._answers[userId] !== undefined) return  // sudah jawab
  match._answers[userId] = value

  const correct = (value === match._currentQ.answer)
  if (correct) match.scores[userId] = (match.scores[userId] || 0) + 1

  // Kirim hasil ke player ybs
  socket.emit('tournament:answer-result', {
    correct,
    correctAnswer: match._currentQ.answer,
    yourValue: value,
    scores: match.scores,
  })

  // Kirim ke spectator guru
  io.to(`match-spectate:${match.id}`).emit('tournament:player-answered', {
    userId, correct, value,
    scores: match.scores,
    matchId: match.id,
  })

  // Cek apakah kedua sudah jawab
  const playerIds = [match.player1?.userId, match.player2?.userId].filter(Boolean)
  const allAnswered = playerIds.every(id => match._answers[id] !== undefined)

  if (allAnswered) {
    if (match._round >= TOURNAMENT_MAX_ROUNDS) {
      finishTournamentMatch(io, tournament, match)
    } else {
      setTimeout(() => startTournamentRound(io, tournament, match), 2500)
    }
  }
}

// Selesaikan match, tentukan pemenang
function finishTournamentMatch(io, tournament, match) {
  if (match.status === 'finished' || match.status === 'walkover') return
  match.status = 'finished'

  const p1  = match.player1
  const p2  = match.player2
  const s1  = match.scores[p1?.userId] || 0
  const s2  = match.scores[p2?.userId] || 0

  if (!p2 || match.status === 'bye') {
    match.winner = p1
  } else if (s1 > s2) {
    match.winner = p1
  } else if (s2 > s1) {
    match.winner = p2
  } else {
    // Draw → p1 menang (randomize jika mau)
    match.winner = Math.random() < 0.5 ? p1 : p2
  }

  io.to(match.roomCode).emit('tournament:match-over', {
    winner: { userId: match.winner.userId, name: match.winner.name },
    scores: match.scores,
    matchId: match.id,
  })

  io.to(`tournament:${tournament.id}`).emit('tournament:state', tournamentToClient(tournament))

  // Cek apakah semua match ronde ini selesai
  checkRoundComplete(io, tournament)
}

function checkRoundComplete(io, tournament) {
  const round = tournament.rounds[tournament.currentRound - 1]
  const allDone = round.matches.every(m =>
    m.status === 'finished' || m.status === 'walkover' || m.status === 'bye'
  )
  if (!allDone) return

  const winners = round.matches
    .map(m => m.winner)
    .filter(Boolean)

  if (winners.length === 1) {
    // Turnamen selesai!
    tournament.status   = 'finished'
    tournament.champion = winners[0]
    io.to(`tournament:${tournament.id}`).emit('tournament:finished', {
      champion: { userId: winners[0].userId, name: winners[0].name },
      state: tournamentToClient(tournament),
    })
    // Notify semua siswa di kelas
    io.to(`kelas:${tournament.kelas}`).emit('tournament:finished', {
      champion: { userId: winners[0].userId, name: winners[0].name },
    })
    return
  }

  // Lanjut ke ronde berikutnya
  tournament.currentRound++
  const nextRound = buildFirstRound(winners) // re-use, tapi ini buat matches dari winners
  // CATATAN: buildFirstRound harus bisa menerima winners (Student[]) langsung
  tournament.rounds.push(nextRound)

  // Delay sebelum ronde baru mulai
  setTimeout(() => {
    startTournamentRound_all(io, tournament)
  }, 5000)  // 5 detik jeda antar ronde
}

function startTournamentRound_all(io, tournament) {
  const round = tournament.rounds[tournament.currentRound - 1]

  // Notify semua peserta ronde baru
  io.to(`kelas:${tournament.kelas}`).emit('tournament:round-start', {
    round: tournament.currentRound,
    state: tournamentToClient(tournament),
  })

  // Untuk setiap match: set status, buat roomCode, notify kedua player
  round.matches.forEach(match => {
    if (match.status === 'bye') {
      match.winner = match.player1
      return
    }

    match.status   = 'waiting-join'
    match.roomCode = `t-${tournament.id}-${match.id}`.slice(0, 20)

    // Notify p1
    const p1Socket = io.sockets.sockets.get(match.player1?.socketId)
    p1Socket?.emit('tournament:your-match', {
      matchId:      match.id,
      tournamentId: tournament.id,
      opponent:     { userId: match.player2.userId, name: match.player2.name },
      gameKey:      tournament.gameKey,
      round:        tournament.currentRound,
    })

    // Notify p2
    const p2Socket = io.sockets.sockets.get(match.player2?.socketId)
    p2Socket?.emit('tournament:your-match', {
      matchId:      match.id,
      tournamentId: tournament.id,
      opponent:     { userId: match.player1.userId, name: match.player1.name },
      gameKey:      tournament.gameKey,
      round:        tournament.currentRound,
    })

    // Walkover timer: 60 detik
    match.walkoverTimer = setTimeout(() => {
      if (match.status !== 'waiting-join') return

      // Siapa yang sudah join?
      const p1Joined = !!match.player1?.socketId
      const p2Joined = !!match.player2?.socketId

      if (!p1Joined && p2Joined) {
        match.winner = match.player2
      } else if (p1Joined && !p2Joined) {
        match.winner = match.player1
      } else {
        // Keduanya tidak join — random
        match.winner = Math.random() < 0.5 ? match.player1 : match.player2
      }

      match.status = 'walkover'
      io.to(`tournament:${tournament.id}`).emit('tournament:state', tournamentToClient(tournament))
      checkRoundComplete(io, tournament)
    }, WALKOVER_TIMEOUT_MS)
  })

  io.to(`tournament:${tournament.id}`).emit('tournament:state', tournamentToClient(tournament))
}
```

---

### REST API (tambahkan di `server/guru.js`)

```javascript
import { SUPPORTED_TOURNAMENT_GAMES } from './tournament-questions.js'
import { tournaments, tournamentToClient, buildFirstRound } from './tournament-state.js'
import { getTournamentIo } from './tournament-state.js'

// GET /api/guru/tournament/games — list game yang didukung turnamen
router.get('/tournament/games', (req, res) => {
  res.json({ games: SUPPORTED_TOURNAMENT_GAMES })
})

// GET /api/guru/tournament — turnamen aktif untuk kelas guru ini
router.get('/tournament', async (req, res) => {
  try {
    const kelasDiampu = await getMyKelasDiampu(req)
    const active = [...tournaments.values()]
      .filter(t => kelasDiampu.includes(t.kelas))
      .map(tournamentToClient)
    res.json({ tournaments: active })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/guru/tournament — mulai turnamen
router.post('/tournament', async (req, res) => {
  try {
    const kelasDiampu = await getMyKelasDiampu(req)
    const { kelas, gameKey } = req.body || {}

    if (!kelas || !kelasDiampu.includes(kelas))
      return res.status(403).json({ error: 'Kelas tidak valid.' })
    if (!SUPPORTED_TOURNAMENT_GAMES.includes(gameKey))
      return res.status(400).json({ error: `Game '${gameKey}' belum didukung.` })

    // Cek tidak ada turnamen aktif untuk kelas ini
    const existing = [...tournaments.values()].find(
      t => t.kelas === kelas && t.status !== 'finished'
    )
    if (existing) return res.status(409).json({ error: 'Turnamen masih aktif untuk kelas ini.' })

    // Ambil semua siswa di kelas
    const { rows } = await pool.query(
      'SELECT id AS "userId", name FROM students WHERE kelas = $1',
      [kelas]
    )
    if (rows.length < 2)
      return res.status(400).json({ error: 'Minimal 2 siswa untuk memulai turnamen.' })

    const students = rows.map(r => ({ ...r, socketId: null }))

    const tournamentId = crypto.randomUUID()
    const firstRound   = buildFirstRound(students)

    const tournament = {
      id: tournamentId,
      kelas,
      guruId: req.session.user.id,
      gameKey,
      status: 'in-progress',
      currentRound: 1,
      rounds: [firstRound],
      students,
      champion: null,
      createdAt: Date.now(),
    }
    tournaments.set(tournamentId, tournament)

    // Siswa join kelas room supaya bisa di-notify
    // (siswa harus emit 'kelas:join' saat login — lihat catatan di bawah)
    const io = getTournamentIo()
    io.to(`kelas:${kelas}`).emit('tournament:started', {
      tournamentId,
      gameKey,
      state: tournamentToClient(tournament),
    })

    // Langsung mulai ronde 1
    startTournamentRound_all(io, tournament)

    res.json({ tournament: tournamentToClient(tournament) })
  } catch (err) {
    console.error('tournament create error', err)
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/guru/tournament/:id — batalkan turnamen
router.delete('/tournament/:id', async (req, res) => {
  try {
    const t = tournaments.get(req.params.id)
    if (!t) return res.status(404).json({ error: 'Turnamen tidak ditemukan.' })
    const kelasDiampu = await getMyKelasDiampu(req)
    if (!kelasDiampu.includes(t.kelas)) return res.status(403).json({ error: 'Akses ditolak.' })
    t.status = 'finished'
    const io = getTournamentIo()
    io.to(`tournament:${t.id}`).emit('tournament:cancelled')
    io.to(`kelas:${t.kelas}`).emit('tournament:cancelled')
    tournaments.delete(req.params.id)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
```

**PENTING — tambahkan di socket handler siswa (`server/multiplayer.js`):**
```javascript
// Siswa join "kelas room" supaya bisa terima notifikasi turnamen
// Panggil saat connect, setelah validasi session
socket.join(`kelas:${user.kelas}`)

// Handler answer turnamen (tambahkan di dalam io.on('connection')):
socket.on('tournament:answer', ({ tournamentId, matchId, value } = {}) => {
  if (user.role !== 'siswa') return
  const t = tournaments.get(tournamentId)
  if (!t) return
  const round = t.rounds[t.currentRound - 1]
  const match = round?.matches.find(m => m.id === matchId)
  if (!match) return
  handleTournamentAnswer(getTournamentIo(), t, match, user.id, value, socket)
})

// Real-time slider untuk spectator guru
socket.on('tournament:slider-move', ({ matchId, value } = {}) => {
  socket.to(`match-spectate:${matchId}`).emit('tournament:opponent-slider', {
    userId: user.id, value, matchId
  })
})
```

---

### Frontend — Screens baru yang perlu dibuat

#### A. `src/screens/TournamentMatchScreen.jsx`
Mirip `DuelKatakScreen.jsx` tapi untuk turnamen. Menerima props:
- `tournamentId`, `matchId`, `opponent`, `gameKey`, `round`, `onMatchOver`

Slider-based answer (sama dengan duel). Emit `tournament:answer` dan `tournament:slider-move`.

Perbedaan dengan DuelKatakScreen:
- Header menampilkan "Ronde X Turnamen" + nama lawan
- Tidak ada countdown (langsung soal)
- Setelah match selesai → tampil "Menunggu ronde berikutnya..." atau "Kamu kalah 😢"

#### B. `src/screens/TournamentWaitScreen.jsx`
Layar menunggu setelah siswa join turnamen tapi belum ada match untuknya di ronde ini (bye, atau ronde berikutnya belum mulai).

Tampilkan: bracket state yang di-update live via socket.

#### C. Di `GuruDashboardScreen.jsx` — Tab "🏆 Turnamen"
Tab baru dengan 2 tampilan:

**1. Setup (tidak ada turnamen aktif):**
- Pilih kelas
- Pilih game (dari SUPPORTED_TOURNAMENT_GAMES)
- Tombol "Mulai Turnamen"
- Minimal siswa: 2

**2. Bracket view (ada turnamen aktif):**
- Bagan tree yang render dari `tournament.rounds`
- Setiap match box: `[Nama P1] vs [Nama P2]` + status badge (🟡 Berlangsung / ✅ Selesai / ⏳ Menunggu)
- Skor live jika sedang berlangsung
- Klik match → panel spectator muncul (bisa modal atau overlay)
- Tombol "Batalkan Turnamen"

**Panel Spectator (dalam bracket view):**
- Nama Pemain A vs Nama Pemain B
- Skor: `3 - 2`
- Slider visual kedua pemain (posisi saat ini, real-time)
- Jawaban terakhir (benar/salah) masing-masing pemain
- Round indicator: `Soal 5/7`

#### D. Modifikasi `App.jsx`
Tambahkan route baru:
```jsx
const [tournamentState, setTournamentState] = useState(null)
// tournamentState: { tournamentId, matchId, opponent, gameKey, round }

// Di renderScreen():
if (current === 'tournament-match' && tournamentState) {
  return (
    <TournamentMatchScreen
      {...tournamentState}
      goBack={() => setHistory(h => h.slice(0, -1))}
      onMatchOver={() => replaceTop('home')}
    />
  )
}
```

Tambahkan socket listener global untuk notifikasi turnamen (di dalam `PlayerExperience useEffect`):
```javascript
useEffect(() => {
  const socket = connectSocket()

  // Notifikasi match kamu
  socket.on('tournament:your-match', (data) => {
    setTournamentState(data)
    // Tampilkan banner notifikasi
    // Jika siswa accept → navigate('tournament-match')
  })

  socket.on('tournament:finished', ({ champion }) => {
    // Banner "Turnamen selesai! Juara: [nama]"
  })

  return () => {
    socket.off('tournament:your-match')
    socket.off('tournament:finished')
  }
}, [])
```

**Notifikasi banner:** Buat komponen `TournamentNotificationBanner` yang muncul overlay di atas semua screen saat `tournament:your-match` diterima, dengan tombol "⚔️ Masuk Arena!" dan countdown 60 detik (walkover timer).

---

### Checklist Implementasi (urutan yang disarankan)

1. ✅ Buat `server/tournament-questions.js`
2. ✅ Buat `server/tournament-state.js`
3. ✅ Buat `server/tournament-engine.js` (fungsi startTournamentMatch, handleTournamentAnswer, dst)
4. ✅ Modifikasi `server/multiplayer.js` — tambahkan socket handlers turnamen + `socket.join(kelas:...)` 
5. ✅ Modifikasi `server/guru.js` — tambahkan REST endpoints turnamen
6. ✅ Modifikasi `server/index.js` — `setTournamentIo(io)`
7. ✅ Pindahkan tombol duel ke `ModeSelectScreen.jsx` (Feature 1 — lebih mudah, lakukan dulu)
8. ✅ Buat `src/screens/TournamentMatchScreen.jsx`
9. ✅ Buat `src/screens/TournamentWaitScreen.jsx`
10. ✅ Buat `src/components/TournamentNotificationBanner.jsx`
11. ✅ Tambah Tab "🏆 Turnamen" di `GuruDashboardScreen.jsx` dengan bracket view + spectator
12. ✅ Modifikasi `App.jsx` — route + global socket listeners

---

### Catatan Teknis Penting

**Server state sharing:** Gunakan pola yang sama dengan `server/boss-state.js` yang sudah ada — module-level Map + `setIo` pattern.

**Room naming conventions:**
- Kelas room (notifikasi): `kelas:${kelas}` (contoh: `kelas:VII A`)
- Tournament room (guru spectate): `tournament:${tournamentId}`
- Match spectate (guru lihat live): `match-spectate:${matchId}`
- Match duel room (2 pemain): `t-${tournamentId.slice(0,8)}-${matchId.slice(0,8)}`

**SocketId tracking:** Saat siswa `tournament:player-ready`, update `match.player1.socketId` atau `match.player2.socketId`. SocketId bisa berubah jika reconnect — handle reconnect dengan event `tournament:reconnect { tournamentId, matchId }`.

**Import uuid:** Gunakan `crypto.randomUUID()` (Node.js built-in, tidak perlu install package) daripada uuid library.

**Bracket rendering di frontend:** Untuk render tree bracket, buat komponen `BracketView` yang menerima `rounds: Round[]` dan render per-kolom. Ronde 1 di kiri, final di kanan. Gunakan CSS grid atau flexbox. Tidak perlu library eksternal.

**Slider range per game:** `genTournamentQ` mengembalikan `sliderMin` dan `sliderMax` — pastikan `TournamentMatchScreen` menggunakan ini, bukan hardcode range -20 to 20 (karena game berbeda punya range berbeda).

**Walkover vs disconnected:** Bedakan siswa yang tidak pernah join (tidak tap notifikasi) dengan siswa yang disconnect mid-game. Yang disconnect mid-game: jika opponent sudah lebih unggul → langsung `finishTournamentMatch`.

---

## RINGKASAN FILE YANG DIBUAT/DIMODIFIKASI

| File | Aksi |
|------|------|
| `server/tournament-questions.js` | BARU — generate soal server-authoritative per game |
| `server/tournament-state.js` | BARU — in-memory state Map + helper functions |
| `server/tournament-engine.js` | BARU — logika bracket, start match, walkover, dst |
| `server/multiplayer.js` | MODIFIKASI — tambah socket handlers turnamen + kelas room join |
| `server/guru.js` | MODIFIKASI — tambah REST endpoints turnamen |
| `server/index.js` | MODIFIKASI — `setTournamentIo(io)` |
| `src/screens/ModeSelectScreen.jsx` | MODIFIKASI — tambah Mode Card duel (hanya katak) |
| `src/screens/Grade7ZoneScreen.jsx` | MODIFIKASI — hapus tombol duel lama |
| `src/screens/TournamentMatchScreen.jsx` | BARU — game screen untuk turnamen |
| `src/screens/TournamentWaitScreen.jsx` | BARU — waiting screen antar ronde |
| `src/components/TournamentNotificationBanner.jsx` | BARU — banner notifikasi match |
| `src/screens/GuruDashboardScreen.jsx` | MODIFIKASI — tambah tab Turnamen + bracket view + spectator |
| `src/App.jsx` | MODIFIKASI — route tournament-match + global socket listeners |
