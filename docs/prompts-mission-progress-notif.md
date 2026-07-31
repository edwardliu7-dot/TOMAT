# Prompt Breakdown — Mission Progress Notification
**Fitur:** MissionProgressToast + MissionClaimNotification  
**Total file terdampak:** 9 file  
**Dibagi menjadi 3 sesi** agar sesuai limit harian Replit Agent.

---

## Konteks Arsitektur (baca sebelum mulai)

```
server/event-missions.js      ← DB helper; incrementMissionProgress()
server/gameplay-events.js     ← Event bus; fire() fire-and-forget wrapper
server/player.js              ← REST /api/siswa/player/gain
server/multiplayer.js         ← Socket.io duel; onDuelWin + onCorrectAnswer
server/tournament-engine.js   ← handleTournamentAnswer; onCorrectAnswer
src/PlayerContext.jsx         ← addCoins → persistGain → /gain response
src/App.jsx                   ← Root; socket.io client
src/components/MissionProgressToast.jsx    ← BARU
src/components/MissionClaimNotification.jsx ← BARU
```

Alur data yang diinginkan setelah fitur selesai:

```
[Siswa jawab benar di minigame]
  → /api/siswa/player/gain
  → server await incrementMissionProgress
  → response menyertakan { missionDeltas: [{ missionId, nama, newProgress, goal, completed }] }
  → PlayerContext membaca missionDeltas → trigger MissionProgressToast / MissionClaimNotification

[Siswa jawab benar di duel/turnamen]
  → server emit socket event "mission:progress" ke socket siswa
  → App.jsx listener → trigger MissionProgressToast / MissionClaimNotification
```

---

## SESI 1 — Backend Core (3 file)
**File:** `server/event-missions.js`, `server/gameplay-events.js`, `server/player.js`

### Prompt untuk Agent

```
Kamu sedang mengerjakan TOMAT (aplikasi edukasi matematika berbasis React + Express).
Lakukan perubahan berikut di 3 file backend. Jangan ubah file lain.

────────────────────────────────────────────────
FILE 1: server/event-missions.js
────────────────────────────────────────────────

Fungsi `incrementMissionProgress` saat ini mengembalikan:
  { progress, goal, justCompleted, autoCompleted }

Ubah agar ia juga mengembalikan `delta` — yaitu selisih progress yang BENAR-BENAR
tercatat di DB (bisa lebih kecil dari parameter delta jika mendekati goal).

Caranya: simpan nilai progress sebelum update, lalu hitung delta = newProgress - oldProgress.

Karena Postgres UPSERT tidak mudah memberi "old value", gunakan pendekatan ini:
- Tambahkan `prev_progress` di RETURNING dengan trik:
    progress - least($3, $4 - (progress - least($3, $4 - progress))) -- terlalu rumit
- Cara lebih sederhana: lakukan SELECT dulu (di luar transaksi, atau di dalam
  satu round-trip), simpan sebagai `prevProgress`, lalu jalankan UPSERT.

Implementasi yang direkomendasikan:
1. Sebelum UPSERT, SELECT progress (atau 0 jika belum ada) ke variabel `prevProgress`.
2. Jalankan UPSERT seperti sebelumnya.
3. Hitung `actualDelta = rows[0].progress - prevProgress` (min 0).
4. Kembalikan { progress: rows[0].progress, goal: mission.goal, justCompleted,
                autoCompleted, delta: actualDelta }.

Jika mission sudah complete (rows.length === 0), tetap return null seperti sekarang.

────────────────────────────────────────────────
FILE 2: server/gameplay-events.js
────────────────────────────────────────────────

Saat ini `fire()` bersifat fire-and-forget (tidak di-await, error hanya di-log).

Tambahkan fungsi BARU `fireAndReturn(studentId, missionId, delta = 1)`:
- Sama persis dengan fire() tapi menggunakan await dan mengembalikan hasil dari
  incrementMissionProgress (atau null jika error).
- fire() lama TIDAK DIUBAH (masih dipakai oleh kode yang tidak butuh hasil).

Tambahkan juga fungsi baru yang bisa di-await oleh player.js:

  export async function onCorrectAnswerWithResult(studentId) {
    return fireAndReturn(studentId, 'kemerdekaan_1')
  }

  export async function onDuelWinWithResult(winnerId) {
    return fireAndReturn(winnerId, 'kemerdekaan_2')
  }

Fungsi lama onCorrectAnswer() dan onDuelWin() TIDAK DIUBAH.

────────────────────────────────────────────────
FILE 3: server/player.js
────────────────────────────────────────────────

Di route POST /api/siswa/player/gain, saat ini ada:
  if (coinsGain > 0) {
    onCorrectAnswer(req.session.user.id)
  }
  res.json({ player: ..., newBadges, gainedCoins: ..., gainedExp: ... })

Ubah menjadi:
  let missionDeltas = []
  if (coinsGain > 0) {
    const result = await onCorrectAnswerWithResult(req.session.user.id)
    if (result) {
      const mission = EVENT_MISSIONS.find(m => m.id === 'kemerdekaan_1')
      missionDeltas.push({
        missionId:   'kemerdekaan_1',
        nama:        mission?.nama        ?? 'Misi',
        emoji:       mission?.emoji       ?? '🎯',
        delta:       result.delta,
        newProgress: result.progress,
        goal:        result.goal,
        completed:   result.justCompleted,
      })
      // Sertakan auto-completed missions (misal: kemerdekaan_3 otomatis selesai)
      for (const autoId of (result.autoCompleted || [])) {
        const am = EVENT_MISSIONS.find(m => m.id === autoId)
        if (am) missionDeltas.push({
          missionId:   autoId,
          nama:        am.nama,
          emoji:       am.emoji       ?? '🦅',
          delta:       0,
          newProgress: am.goal,
          goal:        am.goal,
          completed:   true,
        })
      }
    }
  }
  res.json({ player: ..., newBadges, gainedCoins: ..., gainedExp: ..., missionDeltas })

Tambahkan import berikut di bagian atas player.js (gantikan import onCorrectAnswer yang lama):
  import { onCorrectAnswerWithResult } from './gameplay-events.js'
  import { EVENT_MISSIONS } from './event-missions.js'

Jika onCorrectAnswer masih dipakai di tempat lain di player.js, pertahankan importnya juga.
(Cek dulu — kemungkinan hanya dipakai di satu tempat, jadi cukup ganti importnya.)

────────────────────────────────────────────────
Setelah selesai, restart server dan pastikan tidak ada error import.
Tidak perlu mengubah file frontend apapun pada sesi ini.
```

---

## SESI 2 — Backend Socket.io (2 file)
**File:** `server/multiplayer.js`, `server/tournament-engine.js`  
**Prasyarat:** Sesi 1 sudah selesai dan server berjalan normal.

### Prompt untuk Agent

```
Kamu sedang mengerjakan TOMAT. Sesi 1 sudah selesai:
- incrementMissionProgress() sekarang mengembalikan { delta, progress, goal, justCompleted, autoCompleted }
- gameplay-events.js punya onDuelWinWithResult() dan onCorrectAnswerWithResult()

Lakukan perubahan di 2 file berikut. Jangan ubah file lain.

────────────────────────────────────────────────
KONTEKS: Cara emit ke satu user via socket
────────────────────────────────────────────────

Di tournament-engine.js sudah ada helper:
  function emitToUser(io, userId, event, payload) { ... }

Di multiplayer.js belum ada fungsi tersebut, tapi ada akses ke io.sockets.sockets.
Gunakan pola:
  for (const [, s] of io.sockets.sockets) {
    if (String(s.data?.userId) === String(userId)) s.emit('mission:progress', payload)
  }

────────────────────────────────────────────────
Format payload event "mission:progress":
────────────────────────────────────────────────

  {
    missionId:   string,   // e.g. 'kemerdekaan_1'
    nama:        string,   // e.g. 'Lomba 17-an'
    emoji:       string,   // e.g. '🎯'
    delta:       number,   // progress yang baru saja ditambahkan (biasanya 1)
    newProgress: number,   // total progress sekarang
    goal:        number,   // target misi
    completed:   boolean,  // true jika misi baru saja selesai di update ini
  }

Jika misi auto-complete terpicu (result.autoCompleted), emit JUGA event terpisah
untuk setiap misi yang auto-complete, dengan delta=0, newProgress=goal, completed=true.

────────────────────────────────────────────────
FILE 1: server/multiplayer.js
────────────────────────────────────────────────

Import yang perlu ditambahkan di bagian atas:
  import { onCorrectAnswerWithResult, onDuelWinWithResult } from './gameplay-events.js'
  import { EVENT_MISSIONS } from './event-missions.js'

(Impor lama onCorrectAnswer dan onDuelWin bisa dihapus jika tidak dipakai lagi di file ini,
atau pertahankan jika masih dipakai di tempat lain dalam file yang sama — cek dulu.)

--- Perubahan di fungsi finishGame(io, room) ---

Saat ini:
  // Delegate duel-win side-effects to the centralized gameplay event bus.
  onDuelWin(winner.userId)

Ubah menjadi:
  const duelWinResult = await onDuelWinWithResult(winner.userId)
  if (duelWinResult && duelWinResult.delta > 0) {
    const mission = EVENT_MISSIONS.find(m => m.id === 'kemerdekaan_2')
    const payload = {
      missionId:   'kemerdekaan_2',
      nama:        mission?.nama  ?? 'Misi',
      emoji:       mission?.emoji ?? '⚔️',
      delta:       duelWinResult.delta,
      newProgress: duelWinResult.progress,
      goal:        duelWinResult.goal,
      completed:   duelWinResult.justCompleted,
    }
    for (const [, s] of io.sockets.sockets) {
      if (String(s.data?.userId) === String(winner.userId)) s.emit('mission:progress', payload)
    }
    for (const autoId of (duelWinResult.autoCompleted || [])) {
      const am = EVENT_MISSIONS.find(m => m.id === autoId)
      if (!am) continue
      const autoPayload = { missionId: autoId, nama: am.nama, emoji: am.emoji ?? '🦅',
                            delta: 0, newProgress: am.goal, goal: am.goal, completed: true }
      for (const [, s] of io.sockets.sockets) {
        if (String(s.data?.userId) === String(winner.userId)) s.emit('mission:progress', autoPayload)
      }
    }
  }

--- Perubahan di fungsi duel:answer handler (jawaban benar per soal) ---

Cari blok di mana duel per-question correct answer ditangani. Di multiplayer.js,
jawaban diproses di dalam socket.on('duel:answer', ...) atau di startPlayerRound
callback. Cari kondisi `if (correct)` yang memanggil onCorrectAnswer:

Saat ini kemungkinan ada baris seperti:
  if (correct) onCorrectAnswer(player.userId)
  -- atau --
  if (correct) { player.score++; onCorrectAnswer(player.userId) }

Ubah menjadi:
  if (correct) {
    player.score++
    const result = await onCorrectAnswerWithResult(player.userId)
    if (result && result.delta > 0) {
      const m1 = EVENT_MISSIONS.find(m => m.id === 'kemerdekaan_1')
      const prog = { missionId: 'kemerdekaan_1', nama: m1?.nama ?? 'Misi',
                     emoji: m1?.emoji ?? '🎯', delta: result.delta,
                     newProgress: result.progress, goal: result.goal,
                     completed: result.justCompleted }
      for (const [, s] of io.sockets.sockets) {
        if (String(s.data?.userId) === String(player.userId)) s.emit('mission:progress', prog)
      }
    }
  }

Catatan: Jika handler 'duel:answer' sudah async, tidak perlu perubahan signature.
Jika belum async, tambahkan async ke callback.

────────────────────────────────────────────────
FILE 2: server/tournament-engine.js
────────────────────────────────────────────────

Import yang perlu diubah di bagian atas:
  // Ganti:
  import { onCorrectAnswer, onTournamentWin } from './gameplay-events.js'
  // Dengan:
  import { onCorrectAnswer, onTournamentWin, onCorrectAnswerWithResult } from './gameplay-events.js'
  import { EVENT_MISSIONS } from './event-missions.js'

Di fungsi handleTournamentAnswer(), cari:
  // Delegate correct-answer side-effects to the centralized gameplay event bus.
  if (correct) onCorrectAnswer(userId)

Ubah menjadi:
  if (correct) {
    const result = await onCorrectAnswerWithResult(userId)
    if (result && result.delta > 0) {
      const m1 = EVENT_MISSIONS.find(m => m.id === 'kemerdekaan_1')
      const prog = { missionId: 'kemerdekaan_1', nama: m1?.nama ?? 'Misi',
                     emoji: m1?.emoji ?? '🎯', delta: result.delta,
                     newProgress: result.progress, goal: result.goal,
                     completed: result.justCompleted }
      emitToUser(io, userId, 'mission:progress', prog)
      for (const autoId of (result.autoCompleted || [])) {
        const am = EVENT_MISSIONS.find(m => m.id === autoId)
        if (!am) continue
        emitToUser(io, userId, 'mission:progress', {
          missionId: autoId, nama: am.nama, emoji: am.emoji ?? '🦅',
          delta: 0, newProgress: am.goal, goal: am.goal, completed: true,
        })
      }
    }
  }

Karena handleTournamentAnswer() saat ini bukan async, ubah signaturenya menjadi:
  export async function handleTournamentAnswer(io, tournament, match, userId, value, socket) {

Dan di multiplayer.js, cek apakah pemanggil handleTournamentAnswer sudah menggunakan await.
Jika belum, tambahkan await di depannya (di handler socket.on('tournament:answer', ...)).

────────────────────────────────────────────────
Setelah selesai, restart server dan coba duel — pastikan tidak ada error di console server.
Tidak perlu mengubah file frontend apapun pada sesi ini.
```

---

## SESI 3 — Frontend (4 file)
**File:** `src/components/MissionProgressToast.jsx` (baru), `src/components/MissionClaimNotification.jsx` (baru), `src/PlayerContext.jsx`, `src/App.jsx`  
**Prasyarat:** Sesi 1 + Sesi 2 sudah selesai.

### Prompt untuk Agent

```
Kamu sedang mengerjakan TOMAT. Backend sudah selesai:
- POST /api/siswa/player/gain sekarang menyertakan missionDeltas[] di response.
- Socket.io emit event "mission:progress" ke siswa setiap ada progress.

Payload missionDeltas[] (dari REST) dan event "mission:progress" (dari socket)
menggunakan format yang sama:
  { missionId, nama, emoji, delta, newProgress, goal, completed }

Buat/ubah 4 file berikut. Jangan ubah file lain.

────────────────────────────────────────────────
FILE 1 (BARU): src/components/MissionProgressToast.jsx
────────────────────────────────────────────────

Komponen ini menerima array `toasts` (dari parent) dan menampilkannya secara
berurutan (FIFO), satu per satu. Setiap toast:
- Muncul dari bawah dengan animasi slide-up.
- Menampilkan: emoji + "+{delta} {nama} ({newProgress}/{goal})".
  Jika completed=true, tampilkan juga baris kedua "✅ Misi Selesai! Klaim hadiahmu."
- Auto-dismiss setelah 2500ms.
- Posisi: fixed, bottom: 80px, left: 50%, transform: translateX(-50%)
  (di atas navbar bawah kira-kira — sesuaikan jika perlu).

Props:
  toasts:    Array<{ id, missionId, nama, emoji, delta, newProgress, goal, completed }>
  onDismiss: (id) => void

Gunakan inline styles (bukan Tailwind/CSS module) agar konsisten dengan gaya file lain di TOMAT.
Warna latar: #1E293B (dark slate), teks: #F8FAFC, aksen completed: #22C55E.
Border-radius: 12px. Padding: 10px 18px. Box-shadow ringan.

Implementasi queue: tampilkan hanya toast[0], panggil onDismiss(toast[0].id) setelah 2500ms.

────────────────────────────────────────────────
FILE 2 (BARU): src/components/MissionClaimNotification.jsx
────────────────────────────────────────────────

Modal/banner yang muncul ketika misi baru completed dan reward belum diklaim.

Props:
  missions:  Array<{ missionId, nama, emoji, rewardItemId? }>
             (hanya misi yang baru completed dan perlu klaim)
  onClaim:   async (missionId) => void
  onDismiss: (missionId) => void

Tampilan untuk setiap misi yang perlu diklaim (tampilkan satu per satu):
- Overlay semi-transparan + card di tengah layar.
- Judul: "{emoji} Misi Selesai!"
- Nama misi besar.
- Teks: "Kamu berhasil menyelesaikan misi ini! Klaim hadiahmu sekarang."
- Tombol "Klaim Hadiah 🎁" (primary, merah #E11D48).
- Tombol "Nanti Saja" (secondary, abu-abu).

onClaim memanggil POST /api/siswa/event-missions/{missionId}/claim, lalu
memanggil onDismiss untuk menghapus dari queue.

Tampilkan hanya missions[0] (FIFO). Jika missions kosong, return null.

────────────────────────────────────────────────
FILE 3: src/PlayerContext.jsx
────────────────────────────────────────────────

Saat ini `persistGain()` mengembalikan data dari /gain dan PlayerContext
hanya membaca data.player, data.newBadges.

Perubahan:
1. Tambahkan state baru di PlayerProvider:
     const [missionToasts, setMissionToasts] = useState([])
     const [missionClaims, setMissionClaims] = useState([])

2. Di dalam addCoins(), setelah `persistGain(...)`:
   Saat ini ada:
     persistGain(base, 0).then(data => {
       if (data?.player) { setPlayer(...) }
       if (data?.newBadges?.length) setNewBadges(...)
     })

   Tambahkan pembacaan missionDeltas:
     if (data?.missionDeltas?.length) {
       const toasts = data.missionDeltas
         .filter(d => d.delta > 0)  // hanya yang benar-benar bertambah
         .map(d => ({ ...d, id: `${d.missionId}-${Date.now()}-${Math.random()}` }))
       if (toasts.length) setMissionToasts(q => [...q, ...toasts])

       const newlyCompleted = data.missionDeltas.filter(d => d.completed)
       if (newlyCompleted.length) setMissionClaims(q => [...q, ...newlyCompleted])
     }

3. Tambahkan fungsi helper:
     const dismissMissionToast = useCallback((id) => {
       setMissionToasts(q => q.filter(t => t.id !== id))
     }, [])

     const dismissMissionClaim = useCallback((missionId) => {
       setMissionClaims(q => q.filter(m => m.missionId !== missionId))
     }, [])

     // Dipanggil dari App.jsx ketika socket emit mission:progress
     const pushMissionProgress = useCallback((data) => {
       if (!data || data.delta <= 0) return
       const toast = { ...data, id: `${data.missionId}-${Date.now()}-${Math.random()}` }
       setMissionToasts(q => [...q, toast])
       if (data.completed) setMissionClaims(q => [...q, data])
     }, [])

4. Expose di context value:
   Tambahkan: missionToasts, missionClaims, dismissMissionToast, dismissMissionClaim, pushMissionProgress

────────────────────────────────────────────────
FILE 4: src/App.jsx
────────────────────────────────────────────────

Di App.jsx sudah ada penggunaan socket.io di beberapa tempat (cari `socket.on` atau
`useEffect` yang berkaitan dengan socket). Temukan komponen PlayerExperience atau
root siswa yang sudah punya akses ke PlayerContext.

Perubahan yang dibutuhkan:

A. Import komponen baru:
     import MissionProgressToast from './components/MissionProgressToast'
     import MissionClaimNotification from './components/MissionClaimNotification'

B. Di dalam komponen yang memiliki akses ke PlayerContext (kemungkinan PlayerExperience
   atau wrapper siswa), tambahkan:
     const { missionToasts, missionClaims, dismissMissionToast, dismissMissionClaim,
             pushMissionProgress } = usePlayer()

C. Tambahkan socket listener. Cari di mana socket.io diinisialisasi untuk siswa
   (biasanya ada `io(...)` atau `useSocket`). Tambahkan listener:
     socket.on('mission:progress', (data) => {
       pushMissionProgress(data)
     })
   Pastikan cleanup saat unmount: `socket.off('mission:progress')`

D. Render komponen toast dan claim di dalam JSX siswa (setelah semua screen/overlay lain):
     <MissionProgressToast toasts={missionToasts} onDismiss={dismissMissionToast} />
     <MissionClaimNotification
       missions={missionClaims}
       onDismiss={dismissMissionClaim}
       onClaim={async (missionId) => {
         try {
           const res = await fetch(`/api/siswa/event-missions/${missionId}/claim`, {
             method: 'POST', credentials: 'include'
           })
           if (!res.ok) throw new Error('Gagal klaim hadiah.')
           dismissMissionClaim(missionId)
         } catch (err) {
           console.error('[MissionClaim]', err)
         }
       }}
     />

────────────────────────────────────────────────
CATATAN PENTING:
- Komponen toast dan claim harus berada di dalam <PlayerProvider> agar usePlayer() bekerja.
- Jika App.jsx tidak punya direct access ke socket.io (karena socket diinisialisasi
  di screen lain), tambahkan socket listener di komponen yang SUDAH punya socket
  (misal LobbyScreen, DuelKatakScreen) — tapi idealnya di level atas yang persist
  selama sesi siswa berlangsung.
- Periksa apakah sudah ada global socket ref di App.jsx (cari `socketRef`, `useSocket`,
  atau `import io from 'socket.io-client'`). Gunakan yang sudah ada daripada membuat baru.

Setelah selesai, restart server dan test:
1. Main game apa saja → seharusnya muncul toast "+1 Lomba 17-an (X/17)".
2. Mainkan sampai misi selesai → seharusnya muncul MissionClaimNotification.
3. Klik "Klaim Hadiah" → modal hilang, item masuk inventori.
```

---

## Checklist Akhir (Setelah Sesi 3)

- [ ] Toast muncul setelah jawaban benar di minigame (REST path)
- [ ] Toast muncul setelah jawaban benar di duel (Socket path)
- [ ] Toast muncul setelah jawaban benar di turnamen (Socket path)
- [ ] MissionClaimNotification muncul saat progress mencapai goal
- [ ] Tombol "Klaim Hadiah" berhasil POST dan modal hilang
- [ ] Auto-complete kemerdekaan_3 (selesaikan misi 1 & 2) → claim notification muncul
- [ ] Tidak ada double-toast (REST + Socket tidak saling tumpuk untuk event yang sama)
  - Untuk minigame: hanya dari REST (tidak ada socket emit dari server untuk minigame)
  - Untuk duel/turnamen: hanya dari Socket (tidak ada REST gain call di sana)
- [ ] Toast tidak muncul jika delta = 0 (misi sudah selesai sebelumnya)
- [ ] Server tidak throw error di console setelah perubahan

---

## Catatan Teknis Tambahan

**Kenapa delta bisa 0?**  
Jika misi sudah selesai, `incrementMissionProgress` return null → tidak ada toast.  
Jika delta dihitung dan ternyata 0 (edge case: `progress = goal` tepat sebelum call),
filter `d.delta > 0` di PlayerContext memastikan tidak ada toast kosong.

**Double-emit prevention:**  
Minigame flow: server REST → response missionDeltas → PlayerContext.  
Duel/Tournament flow: server socket emit → App.jsx listener → PlayerContext.pushMissionProgress.  
Kedua path ini tidak overlap karena duel/tournament tidak memanggil /api/siswa/player/gain.

**handleTournamentAnswer async:**  
Mengubah fungsi menjadi async aman karena pemanggil di multiplayer.js tidak
mengandalkan return value-nya (dipanggil dengan `handleTournamentAnswer(io, t, match, ...)`
tanpa await sebelumnya). Tambahkan `await` di pemanggil agar tidak menjadi
unhandled promise, tapi tidak akan memblokir alur game.
