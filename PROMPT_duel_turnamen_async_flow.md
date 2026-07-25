# TOMAT — Duel & Turnamen: Async Answer Flow

## Ringkasan Fitur

Ubah mekanik duel dan turnamen dari **sinkron** (menunggu kedua pemain menjawab sebelum soal berikutnya muncul) menjadi **asinkron** (setiap pemain langsung lanjut ke soal berikutnya setelah menjawab, tanpa menunggu lawan). Tambahkan juga logika "leaderboard/selesai" dan aturan disconnect yang lebih adil.

---

## Aturan Baru (Spesifikasi Lengkap)

### 1. Alur Jawaban — Async

- Setelah seorang pemain menjawab satu soal, **server langsung mengirimkan soal berikutnya kepada pemain tersebut** tanpa menunggu lawan.
- Kedua pemain mengerjakan soal **secara independen** — bisa berada di soal yang berbeda di waktu yang sama.
- Setiap pemain memiliki **counter soal sendiri** (`myRound`), bukan round global bersama.
- Jika seorang pemain sudah menjawab soalnya dan belum ada soal baru (karena server menunggu sesuatu), itu tidak boleh terjadi — server harus langsung kirim soal berikutnya.

### 2. State "Selesai" (Leaderboard)

- Ketika seorang pemain menyelesaikan **semua soal** (jawab soal ke-7/`MAX_ROUNDS`), mereka masuk ke state **"finished"** / leaderboard.
- Di layar leaderboard, pemain yang sudah selesai melihat:
  - Skornya sendiri (final).
  - Skor lawan **yang terus diperbarui secara realtime** saat lawan masih bermain.
  - Tombol **"Keluar"** yang bisa diklik kapan saja.
  - Status lawan: "⏳ Lawan masih mengerjakan…" selama lawan belum selesai.
  - Ketika lawan selesai: tampilkan hasil akhir + pemenang.
- **Server menentukan pemenang** hanya setelah kedua pemain selesai, atau salah satu disconnect dalam kondisi tertentu (lihat aturan disconnect).

### 3. Aturan Disconnect

| Kondisi | Akibat |
|---|---|
| Pemain A disconnect saat **masih bermain** (belum selesai semua soal) | Game berhenti untuk keduanya. Pemain B mendapat notif "Lawan kabur!" dan game selesai. Pemain A dianggap kalah (skor saat itu). |
| Pemain A disconnect setelah **sudah selesai** (sedang di leaderboard) | Pemain B **tetap bisa menyelesaikan** semua soalnya. Setelah B selesai, leaderboard ditampilkan (A disconnect → B menang otomatis atau hasil berdasarkan skor). |
| Kedua pemain selesai, lalu salah satu disconnect | Tidak berpengaruh — hasilnya sudah final. |

**Deteksi "sudah selesai":** Server melacak per-pemain apakah `playerRound >= MAX_ROUNDS` dan sudah submit jawaban terakhir.

---

## Arsitektur Saat Ini (Yang Perlu Diubah)

### Server: `server/multiplayer.js`

**State room saat ini:**
```js
const MAX_ROUNDS  = 7
const NEXT_Q_DELAY_MS = 2500

function startRound(io, room) {
  room.currentQ = genTournamentQ(room.gameKey || 'katak')
  room.round++                          // ← round GLOBAL, shared
  room.players.forEach(p => { p.answered = false; p.lastAnswer = null })
  io.to(room.code).emit('duel:question', { question, round, maxRounds, scores, gameKey })
}

socket.on('duel:answer', ({ code, value }) => {
  // ...
  player.answered = true
  // Cek apakah KEDUA pemain sudah jawab ← ini yang harus dihapus
  if (room.players.every(p => p.answered)) {
    if (room.round >= MAX_ROUNDS) {
      setTimeout(() => finishGame(io, room), NEXT_Q_DELAY_MS)
    } else {
      setTimeout(() => startRound(io, room), NEXT_Q_DELAY_MS)
    }
  }
})
```

**`leaveAllRooms` saat ini:**
```js
function leaveAllRooms(socket, io) {
  // ...
  if (room.status === 'in-progress') {
    room.status = 'finished'
    io.to(code).emit('duel:player-left', { name: leaving.name })
  }
}
```

### Server: `server/tournament-engine.js`

**`handleTournamentAnswer` saat ini:**
```js
export function handleTournamentAnswer(io, tournament, match, userId, value, socket) {
  if (match._answers[userId] !== undefined) return
  match._answers[userId] = value
  // ...
  // Cek apakah KEDUA pemain sudah jawab ← ini yang harus diubah
  const allAnswered = playerIds.every(id => match._answers[id] !== undefined)
  if (allAnswered) {
    if (match._round >= TOURNAMENT_MAX_ROUNDS) {
      setTimeout(() => finishTournamentMatch(...), NEXT_Q_DELAY_MS)
    } else {
      setTimeout(() => startTournamentRound(...), NEXT_Q_DELAY_MS)
    }
  }
}
```

### Client: `src/screens/DuelKatakScreen.jsx`

**Event yang di-listen saat ini:**
- `duel:question` → reset state, mulai soal baru
- `duel:answer-result` → set `myAnswered=true`, masuk phase `'result'`, tampil banner "Menunggu lawan…"
- `duel:opponent-answered` → update skor lawan, tampil "Lawan sudah menjawab!"
- `duel:game-over` → tampil `GameOverScreen`
- `duel:player-left` → tampil "Lawan Kabur!"

**Phase saat ini:** `playing | result | game-over | left`

**Yang perlu diubah di client:**
- Di phase `'result'`, sekarang ada teks "Menunggu lawan menjawab…" — ini harus dihilangkan.
- Setelah menerima `duel:answer-result`, jika masih ada soal → langsung transisi ke soal berikutnya (server yang kirim `duel:question` tanpa delay).
- Tambah phase baru: `'leaderboard'` saat pemain sudah selesai semua soal.
- Tambah event baru: `duel:score-update` untuk update skor lawan secara realtime saat di leaderboard.

### Client: `src/screens/TournamentMatchScreen.jsx`

**Phase saat ini:** `waiting | playing | result | match-over`

Sama seperti duel — perlu async flow + phase `'leaderboard'`.

---

## Perubahan yang Diperlukan

### A. `server/multiplayer.js` — Duel

#### 1. Ubah state player dalam room

Tambah tracking round per-pemain:
```js
// Di makePlayer(), tambah:
myRound: 0,      // soal ke berapa yang sedang dikerjakan player ini
finished: false, // apakah sudah selesai semua soal
```

#### 2. Ubah `startRound` menjadi `startPlayerRound(io, room, player)`

Bukan lagi mengirim soal ke seluruh room, tapi hanya ke satu player:
```js
function startPlayerRound(io, room, player) {
  player.myRound++
  player.answered = false
  player.lastAnswer = null
  const q = genTournamentQ(room.gameKey || 'katak')
  player.currentQ = q  // simpan per-player, bukan room-level
  const { answer, ...qForClient } = q
  // Kirim hanya ke socket player ini
  const playerSocket = io.sockets.sockets.get(player.socketId)
  playerSocket?.emit('duel:question', {
    question: qForClient,
    round: player.myRound,
    maxRounds: MAX_ROUNDS,
    scores: room.players.map(safePlayer),
    gameKey: room.gameKey || 'katak',
  })
}
```

#### 3. Ubah `duel:start-game`

Panggil `startPlayerRound` untuk masing-masing player setelah countdown:
```js
// Setelah countdown selesai:
room.players.forEach(p => startPlayerRound(io, room, p))
```

#### 4. Ubah `duel:answer`

Setelah seorang player menjawab, langsung kirim soal berikutnya ke **player tersebut** (bukan menunggu keduanya):
```js
socket.on('duel:answer', ({ code, value }) => {
  // ... validasi ...
  player.answered = true
  player.lastAnswer = value
  const correct = (value === player.currentQ.answer)
  if (correct) player.score++

  // Beritahu lawan skor terbaru
  socket.to(code).emit('duel:score-update', {
    opponentScore: player.score,
    opponentRound: player.myRound,
  })

  // Kirim hasil ke player ini
  socket.emit('duel:answer-result', {
    correct,
    yourScore: player.score,
    correctAnswer: player.currentQ.answer,
    yourValue: value,
  })

  // Langsung lanjut atau selesai
  if (player.myRound >= MAX_ROUNDS) {
    player.finished = true
    // Cek apakah lawan juga sudah selesai
    const opponent = room.players.find(p => p.userId !== user.id)
    if (!opponent || opponent.finished) {
      finishGame(io, room)
    } else {
      // Beritahu player ini bahwa ia sudah selesai → masuk leaderboard
      socket.emit('duel:self-finished', {
        yourScore: player.score,
        opponentScore: opponent?.score ?? 0,
        scores: room.players.map(safePlayer),
      })
    }
  } else {
    // Langsung kirim soal berikutnya ke player ini
    setTimeout(() => startPlayerRound(io, room, player), 1200)
    // (delay kecil ~1.2s supaya ada jeda visual setelah feedback benar/salah)
  }
})
```

#### 5. Ubah `finishGame`

Tetap sama: emit `duel:game-over` ke room dengan winner dan scores final.

#### 6. Ubah `leaveAllRooms`

Perlu tahu apakah player yang pergi sudah `finished` atau belum:
```js
function leaveAllRooms(socket, io) {
  for (const [code, room] of rooms) {
    const idx = room.players.findIndex(p => p.socketId === socket.id)
    if (idx === -1) continue
    const leaving = room.players[idx]
    room.players.splice(idx, 1)
    socket.leave(code)

    if (room.players.length === 0) {
      rooms.delete(code)
    } else if (room.status === 'in-progress') {
      const remaining = room.players[0]
      if (leaving.finished) {
        // Player yang pergi sudah selesai → remaining tetap lanjut
        // Tidak perlu emit apa-apa, remaining masih bermain
        // Ketika remaining selesai, server emit duel:game-over dengan winner = remaining
        // Tandai bahwa lawan sudah pergi supaya saat remaining selesai, finishGame langsung dipanggil
        room._opponentLeft = true
      } else {
        // Player yang pergi belum selesai → hentikan game
        room.status = 'finished'
        io.to(code).emit('duel:player-left', { name: leaving.name })
      }
    }
  }
}
```

Dan di `duel:answer`, setelah `player.finished = true`, tambahkan:
```js
if (room._opponentLeft) {
  // Lawan sudah pergi, kita yang baru selesai → langsung game over
  finishGame(io, room)
}
```

---

### B. `server/tournament-engine.js` — Turnamen

Logika yang sama: tracking per-player round, kirim soal berikutnya ke pemain yang menjawab tanpa menunggu lawan.

#### Ubah state match
```js
match._playerRounds = {}   // userId → round saat ini
match._playerFinished = {} // userId → boolean
match._playerCurrentQ = {} // userId → { question, answer }
```

#### Ubah `startTournamentRound` menjadi `startPlayerTournamentRound(io, match, tournament, userId)`

Kirim soal hanya ke pemain tertentu lewat socketId yang tersimpan di `match.player1.socketId` / `match.player2.socketId`.

#### Ubah `handleTournamentAnswer`

Setelah jawab:
1. Emit `tournament:answer-result` ke pemain ini.
2. Emit `tournament:score-update` ke lawan.
3. Jika `playerRound < MAX_ROUNDS` → kirim soal berikutnya ke pemain ini.
4. Jika `playerRound >= MAX_ROUNDS` → tandai finished. Cek apakah lawan juga selesai → jika ya, `finishTournamentMatch`. Jika tidak → emit `tournament:self-finished` ke pemain ini.

---

### C. `src/screens/DuelKatakScreen.jsx` — Client Duel

#### Tambah phase baru
```js
// phase: 'playing' | 'result' | 'leaderboard' | 'game-over' | 'left'
```

#### Event baru yang perlu di-listen
```js
// Skor lawan diperbarui realtime
socket.on('duel:score-update', ({ opponentScore, opponentRound }) => {
  // Update tampilan skor lawan
})

// Pemain ini sudah selesai, masuk leaderboard
socket.on('duel:self-finished', ({ yourScore, opponentScore, scores }) => {
  setPhase('leaderboard')
  // Simpan scores, tampilkan leaderboard screen dengan status "⏳ Lawan masih mengerjakan"
})
```

#### Ubah handler `duel:answer-result`
```js
socket.on('duel:answer-result', ({ correct, yourScore, correctAnswer }) => {
  setMyAnswered(true)
  setMyCorrect(correct)
  setCorrectAnswer(correct ? null : correctAnswer)
  // Tidak perlu set phase 'result' yang panjang
  // Soal berikutnya akan datang otomatis dari server setelah ~1.2s
  // Cukup tunjukkan feedback sebentar
})
```

#### Ubah handler `duel:question`
Tetap sama — reset state, mulai soal baru. Hapus logika "menunggu lawan" dari UI.

#### Tambah `LeaderboardWaitScreen`
Komponen baru yang menampilkan:
- Skor sendiri (final, tidak berubah).
- Skor lawan (diperbarui via `duel:score-update`, dengan animasi jika berubah).
- Status: "⏳ Menunggu lawan menyelesaikan soal…" atau "✅ Lawan sudah selesai!"
- Tombol "Keluar" yang langsung bisa diklik.

```jsx
function LeaderboardWaitScreen({ myScore, myName, oppScore, oppName, oppFinished, onLeave }) {
  return (
    <div> {/* layar full, background gelap */}
      <div>🏁 Kamu Sudah Selesai!</div>
      {/* Skor */}
      <div>
        <div>Kamu: {myScore}</div>
        <div>VS</div>
        <div>Lawan: {oppScore} {!oppFinished && '⏳'}</div>
      </div>
      {/* Status */}
      {!oppFinished
        ? <div>⏳ Lawan masih mengerjakan soal…</div>
        : <div>✅ Lawan selesai! Menentukan pemenang…</div>
      }
      <button onClick={onLeave}>Keluar</button>
    </div>
  )
}
```

#### Ubah `GameOverScreen`
Tampilkan pemenang dengan skor final. Tidak ada perubahan besar, tapi pastikan bisa dipanggil dari phase `'leaderboard'` juga (ketika `duel:game-over` diterima saat di leaderboard).

---

### D. `src/screens/TournamentMatchScreen.jsx` — Client Turnamen

Sama seperti DuelKatakScreen:
- Tambah phase `'leaderboard'`.
- Listen event `tournament:self-finished` dan `tournament:score-update`.
- Tambah `LeaderboardWaitScreen` (bisa komponen yang sama/serupa dengan duel).
- Hapus teks "Menunggu lawan menjawab…".

---

## Socket Events — Ringkasan Perubahan

### Events yang DIHAPUS / tidak dipakai lagi:
- `duel:opponent-answered` ← diganti `duel:score-update` (lebih minimal)

### Events yang DIPERTAHANKAN (tidak berubah):
- `duel:question` — server kirim soal ke satu player
- `duel:answer` — client submit jawaban
- `duel:answer-result` — server konfirmasi hasil jawaban ke player
- `duel:game-over` — server umumkan pemenang ke room (bisa diterima saat di leaderboard juga)
- `duel:player-left` — lawan kabur saat masih bermain
- `duel:leave` — client minta keluar
- `duel:countdown` — countdown sebelum game mulai
- `duel:slider-move` / `duel:opponent-slider` — real-time ghost slider (bisa dipertahankan)

### Events BARU:
| Event | Arah | Payload | Keterangan |
|---|---|---|---|
| `duel:score-update` | server → client | `{ opponentScore, opponentRound }` | Kirim ke lawan setiap kali ada yang jawab |
| `duel:self-finished` | server → client | `{ yourScore, opponentScore, scores }` | Kirim ke pemain yang baru saja selesai semua soal, saat lawan belum selesai |
| `tournament:score-update` | server → client | `{ userId, score, round }` | Sama seperti duel |
| `tournament:self-finished` | server → client | `{ scores }` | Sama seperti duel |

---

## Edge Cases yang Harus Dihandle

1. **Pemain menjawab soal terakhir dan lawan sudah pergi dari leaderboard:**
   - Server langsung panggil `finishGame` dengan winner = pemain yang baru selesai.

2. **Kedua pemain selesai hampir bersamaan:**
   - Gunakan flag `room._finishingGame = true` di `finishGame` untuk mencegah duplikasi emit.

3. **Client menerima `duel:game-over` saat masih di phase `'result'` atau `'leaderboard'`:**
   - Langsung transisi ke `GameOverScreen`. Kedua phase harus bisa menerima event ini.

4. **Delay antar soal:**
   - Sebelum async: delay 2500ms karena menunggu keduanya jawab.
   - Setelah async: cukup delay ~1200ms (cukup untuk baca feedback benar/salah sebelum soal baru muncul).
   - Bisa dikonfigurasi sebagai `const NEXT_Q_DELAY_MS = 1200` (ganti dari 2500).

5. **Pemain disconnect dan reconnect:**
   - Di luar scope fitur ini. Tidak perlu dihandle.

6. **Turnamen — walkover timer:**
   - Tidak berubah. Jika player tidak join dalam 60 detik, lawan menang otomatis.

---

## Informasi Teknis Proyek

- **Stack:** React (Vite, tanpa TypeScript) + Node.js ESM + Socket.io + PostgreSQL (Neon)
- **File server utama:** `server/index.js` (entry), `server/multiplayer.js` (socket duel/turnamen), `server/tournament-engine.js`
- **File client utama:** `src/screens/DuelKatakScreen.jsx`, `src/screens/TournamentMatchScreen.jsx`, `src/screens/LobbyScreen.jsx`
- **Socket helper:** `src/socket.js` — `connectSocket()` dan `getSocket()`
- **Room state** disimpan di in-memory `Map` bernama `rooms` di `multiplayer.js`
- **Tournament state** disimpan di in-memory `Map` bernama `tournaments` di `tournament-state.js`
- Server berjalan di port 5000. Dev workflow: `npm run dev`

---

## Urutan Implementasi yang Disarankan

1. **`server/multiplayer.js`** — Ubah `makePlayer`, `startRound` → `startPlayerRound`, `duel:answer`, `leaveAllRooms`. Tambah event `duel:score-update` dan `duel:self-finished`.
2. **`server/tournament-engine.js`** — Ubah `startTournamentRound` → per-player, `handleTournamentAnswer`. Tambah event `tournament:score-update` dan `tournament:self-finished`.
3. **`src/screens/DuelKatakScreen.jsx`** — Tambah phase `'leaderboard'`, komponen `LeaderboardWaitScreen`, ubah handler events.
4. **`src/screens/TournamentMatchScreen.jsx`** — Sama seperti langkah 3.
5. **Test:** Buat dua browser tab, login sebagai dua siswa berbeda, duel, pastikan keduanya berjalan independen.
