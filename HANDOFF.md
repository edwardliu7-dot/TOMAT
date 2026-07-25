# TOMAT App — Handoff Prompt

## Konteks Proyek

**TOMAT** adalah platform belajar matematika gamifikasi untuk siswa SMP (Kelas 7–9).
- **Stack:** React + Vite (frontend), Node.js/Express + Socket.io (backend), Neon PostgreSQL
- **Workflow:** `TOMAT Web App` → `npm run dev`
- **Secrets yang ada:** `NEON_DATABASE_URL`, `SESSION_SECRET`

---

## Status Pekerjaan Sesi Ini

### ✅ Sudah Selesai
- `src/components/DuelInviteBanner.jsx` — **sudah dibuat lengkap, jangan dibuat ulang**

### ❌ Belum Selesai (lanjutkan semua ini)

---

## Task 1 — Animasi Validasi 3 Game BAB 1 Kelas 7 yang Tersisa

Empat game sebelumnya (WormholeGame, GembokRodaGigiGame, JembatanGame, SortirKargoGame) sudah diberi animasi validasi post-submit. Tiga game ini **belum** dan masih menampilkan FeedbackBanner secara instan.

### Pola yang Harus Diikuti

```jsx
// State
const [animStep, setAnimStep] = useState(0)  // 0 = belum submit, 1+ = animasi berjalan
const [animDone, setAnimDone] = useState(false)

// Saat submit:
function handleSubmit() {
  setSubmitted(true)
  setAnimStep(1)  // mulai animasi
}

// useEffect untuk increment animStep secara bertahap:
useEffect(() => {
  if (animStep === 0 || animDone) return
  if (animStep >= ANIM_TOTAL_STEPS) { setAnimDone(true); return }
  const t = setTimeout(() => setAnimStep(s => s + 1), 400) // sesuaikan delay
  return () => clearTimeout(t)
}, [animStep, animDone])

// FeedbackBanner dan tombol "Lanjut" hanya muncul saat animDone === true
{animDone && <FeedbackBanner ... />}

// Reset saat soal baru:
function nextQuestion() {
  setAnimStep(0)
  setAnimDone(false)
  setSubmitted(false)
  // ... generate soal baru
}
```

**Sebelum submit:** jangan tampilkan indikator OK/✗ atau highlight hijau/merah berdasarkan posisi slider real-time.
**Setelah submit:** tampilkan animasi "bukti", baru reveal FeedbackBanner.

---

### File: `src/minigames/TermometerGame.jsx`

**Animasi:** Setelah submit, animasikan kolom merkuri bergerak dari posisi saat ini ke posisi suhu yang benar.

- Gunakan state `displayTemp` yang dimulai dari nilai jawaban siswa
- Pada `animStep === 1`, gerakkan `displayTemp` secara bertahap menuju `correctAnswer` (increment/decrement per step dengan interval ~100ms)
- Saat `displayTemp === correctAnswer`, set `animDone = true`
- Kolom merkuri menggunakan tinggi CSS yang dihitung dari `displayTemp`
- Sebelum submit: merkuri mengikuti slider tapi **jangan** tampilkan warna hijau/merah

---

### File: `src/minigames/SubmarineGame.jsx` (game "Katak Pelompat Batu")

**Animasi:** Setelah submit, animasikan katak melompat dari posisi awal, masing-masing lompatan sebesar `jump`, sampai mendarat di posisi yang benar.

- State: `frogPos` (posisi katak saat animasi), mulai dari `start`
- Setiap `animStep`, tambah atau kurangi `frogPos` sebesar `jump` (sesuai arah `isForward`)
- Total langkah = jumlah lompatan = `Math.abs(correctAnswer - start) / jump`
- Interval antar lompatan: ~350ms
- Saat katak sudah di posisi `correctAnswer`, set `animDone = true`
- Sebelum submit: tampilkan katak di posisi `start` saja (jangan gerakkan real-time)

---

### File: `src/minigames/PabrikSenjataGame.jsx` (game "Pabrik Pasukan Robot")

**Animasi:** Setelah submit, sweep slider ke posisi jawaban benar, lalu tampilkan robot "celebrate".

- `animStep 1`: gerakkan nilai slider secara bertahap dari jawaban siswa ke `correctAnswer` (increment/decrement per step, interval ~80ms)
- `animStep 2` (saat slider sudah di posisi benar): flash robot sprite dengan efek glow hijau + emoji ✅ atau ❌ di atas robot selama ~600ms
- `animStep 3`: set `animDone = true`
- Sebelum submit: slider tidak menampilkan highlight hijau/merah berdasarkan posisi

---

## Task 2 — Tombol "Kunjungi Profil" + "Ajak Duel" di PublicProfileModal

**File:** `src/components/shared.jsx`

Komponen `PublicProfileModal` (sekitar baris 276) perlu dua tombol aksi di bagian bawah kartu profil, **setelah** div bio dan **sebelum** strip Celestia/Royal.

### Langkah-langkah:

1. Tambahkan `const { user: currentUser } = useAuth()` di **baris pertama** fungsi `PublicProfileModal` (useAuth sudah diimport di shared.jsx).

2. Ubah padding div profile info dari `'0 22px 24px'` menjadi `'0 22px 10px'`.

3. Tambahkan div tombol tepat **setelah** div bio (masih di dalam blok `<> ... </>`), sebelum strip aksen Celestia/Royal:

```jsx
{/* Action buttons */}
<div style={{ display: 'flex', gap: 8, padding: '0 22px 18px', marginTop: 8 }}>
  <button
    onClick={() => {
      window.dispatchEvent(new CustomEvent('tomat:visit-profile', { detail: profile }))
      onClose()
    }}
    style={{
      flex: 1, padding: '10px 0', borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.12)',
      background: 'rgba(255,255,255,0.06)', color: '#E2E8F0',
      fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
    }}
  >👤 Lihat Profil</button>

  {profile.role === 'siswa' && currentUser?.role === 'siswa' && profile.id !== currentUser?.id && (
    <button
      onClick={() => {
        window.dispatchEvent(new CustomEvent('tomat:invite-duel', { detail: profile }))
        onClose()
      }}
      style={{
        flex: 1, padding: '10px 0', borderRadius: 12, border: 'none',
        background: 'linear-gradient(90deg,#6366F1,#8B5CF6)', color: '#fff',
        fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
        boxShadow: '0 2px 12px rgba(99,102,241,0.35)',
      }}
    >⚔️ Ajak Duel</button>
  )}
</div>
```

---

## Task 3 — Buat `src/screens/PublicProfileScreen.jsx`

Layar read-only full-screen untuk melihat profil siswa/guru lain. Mirip PublicProfileModal tapi full page.

**Props:** `profile` (objek profil dari API), `goBack`, `onInviteDuel` (opsional)

**Tampilan (dari atas ke bawah):**
1. TopBar dengan judul "Profil" dan tombol back (`goBack`)
2. Banner spanduk (sama persis dengan PublicProfileModal — gradient, Celestia particles, Royal shimmer, stickers read-only)
3. Avatar overlap banner + pet di samping (sama dengan PublicProfileModal)
4. Nama, role pill, kelas
5. Grid stat 3 kolom (Level ⭐ / Koin 🪙 / EXP ⚡) — **hanya untuk siswa**
6. Bio box
7. Tombol "⚔️ Ajak Duel" di bawah — tampilkan hanya jika `profile.role === 'siswa'` dan `currentUser.role === 'siswa'` dan `profile.id !== currentUser.id`

**Import yang dibutuhkan:**
```jsx
import { TopBar, UserAvatar, LuxuryAvatarFrame, CelestiaParticles, RoyalShimmer, ensureLuxuryStyles } from '../components/shared'
import { BINGKAI_VISUALS, SPANDUK_VISUALS } from '../shopVisuals'
import TomiSVG, { PET_CSS } from '../components/TomiSVG'
import { useAuth } from '../AuthContext'
```

Inject `PET_CSS` via `useEffect` ke `document.head` (lihat cara di ProfileScreen.jsx).

Warna background halaman: `#0A0B14`. Style kartu bio dan stat tiles: sama dengan ProfileScreen.jsx.

---

## Task 4 — `src/screens/LobbyScreen.jsx` — Prop `initialCode` untuk Auto-Join

Tambahkan prop `initialCode` ke `LobbyScreen`. Saat prop ini ada, skip fase menu dan langsung emit `duel:join`.

```jsx
export default function LobbyScreen({ goBack, onStart, initialCode }) {
  // ... semua state yang sudah ada ...

  // Tambahkan useEffect ini:
  useEffect(() => {
    if (!initialCode) return
    // Beri jeda kecil agar socket listeners sudah terdaftar
    const t = setTimeout(() => {
      connectSocket().emit('duel:join', { code: initialCode, avatar: null })
    }, 300)
    return () => clearTimeout(t)
  }, [initialCode])

  // ... sisa komponen tidak berubah
```

---

## Task 5 — `server/multiplayer.js` — Duel Invite via Socket

### 5a. Tambahkan import di baris paling atas:
```javascript
import { notifyUser } from './notifications.js'
```

### 5b. Tambahkan Map di atas fungsi `setupMultiplayer`:
```javascript
// Track online users: userId → Set<socketId>
const userSockets = new Map()
```

### 5c. Di dalam `io.on('connection', (socket) => { ... })`, setelah blok `if (!user ...)`:

**Registrasi socket user:**
```javascript
// Register socket
if (!userSockets.has(user.id)) userSockets.set(user.id, new Set())
userSockets.get(user.id).add(socket.id)
```

**Tambahkan handler disconnect** (sebelum penutup `})` dari `io.on('connection', ...)`):
```javascript
socket.on('disconnect', () => {
  const set = userSockets.get(user.id)
  if (set) {
    set.delete(socket.id)
    if (set.size === 0) userSockets.delete(user.id)
  }
  leaveAllRooms(socket, io)
})
```

### 5d. Tambahkan handler `duel:invite` dan `duel:invite-decline` (di dalam `io.on('connection', ...)`, setelah handler `duel:leave`):

```javascript
// ── INVITE (kirim undangan duel langsung ke user lain) ───────────────────────
socket.on('duel:invite', ({ targetUserId, targetRole, avatar } = {}) => {
  if (user.role !== 'siswa' || targetRole !== 'siswa') {
    socket.emit('duel:error', { message: 'Undangan duel hanya antar siswa.' })
    return
  }
  if (!targetUserId || targetUserId === user.id) {
    socket.emit('duel:error', { message: 'Target undangan tidak valid.' })
    return
  }

  leaveAllRooms(socket, io)
  const code = genCode()
  const player = makePlayer(avatar)
  const room = {
    code,
    players: [player],
    status: 'waiting',
    currentQ: null,
    round: 0,
    createdAt: Date.now(),
    inviteTargetId: targetUserId,
    cancelTimeout: null,
  }
  rooms.set(code, room)
  socket.join(code)
  // Beri tahu host bahwa room sudah dibuat (LobbyScreen mendengarkan ini)
  socket.emit('duel:created', { code, player: safePlayer(player) })

  const invitePayload = {
    code,
    from: { userId: user.id, name: player.name },
  }

  // Kirim ke target jika online
  const targetSocks = userSockets.get(targetUserId)
  if (targetSocks && targetSocks.size > 0) {
    for (const sid of targetSocks) {
      io.to(sid).emit('duel:incoming-invite', invitePayload)
    }
  } else {
    // Target offline → push notification
    notifyUser({
      userId: targetUserId,
      role: targetRole,
      type: 'duel_invite',
      title: `⚔️ Tantangan Duel dari ${player.name}!`,
      body: `${player.name} mengajakmu duel Matematika. Buka TOMAT sekarang!`,
      url: '/',
      metadata: { code, fromUserId: user.id, fromName: player.name },
    }).catch(() => {})
  }

  // Auto-cancel setelah 60 detik jika tidak ada yang bergabung
  room.cancelTimeout = setTimeout(() => {
    const r = rooms.get(code)
    if (r && r.status === 'waiting' && r.players.length < 2) {
      rooms.delete(code)
      socket.emit('duel:invite-expired', { code })
    }
  }, 60_000)
})

socket.on('duel:invite-decline', ({ code } = {}) => {
  const room = rooms.get(code)
  if (!room) return
  // Beri tahu host bahwa undangan ditolak
  const host = room.players[0]
  if (host) {
    const hostSocks = userSockets.get(host.userId)
    if (hostSocks) {
      for (const sid of hostSocks) {
        io.to(sid).emit('duel:invite-declined', { byUserId: user.id })
      }
    }
  }
})
```

---

## Task 6 — `src/App.jsx` — Wiring Semua Fitur Baru

### 6a. Tambahkan imports di bagian atas:
```jsx
import PublicProfileScreen from './screens/PublicProfileScreen'
import DuelInviteBanner from './components/DuelInviteBanner'
```

### 6b. Di dalam `PlayerExperience`, tambahkan state baru:
```jsx
const [publicProfileData, setPublicProfileData] = useState(null) // { profile }
const [duelInvite, setDuelInvite]               = useState(null) // { code, from }
const [duelInviteCode, setDuelInviteCode]        = useState(null) // untuk auto-join LobbyScreen
```

### 6c. Tambahkan window event listeners (di dalam `useEffect` terpisah, bersama yang sudah ada):
```jsx
useEffect(() => {
  const onVisitProfile = e => {
    setPublicProfileData(e.detail)
    setHistory(h => [...h, 'public-profile'])
  }
  const onInviteDuel = e => {
    const target = e.detail
    if (!target?.id) return
    // Emit socket invite lalu navigate ke lobby
    const socket = connectSocket()
    socket.emit('duel:invite', {
      targetUserId: target.id,
      targetRole: target.role || 'siswa',
      avatar: null,
    })
    navigate('duel-lobby')  // LobbyScreen akan mendengar duel:created
  }
  window.addEventListener('tomat:visit-profile', onVisitProfile)
  window.addEventListener('tomat:invite-duel', onInviteDuel)
  return () => {
    window.removeEventListener('tomat:visit-profile', onVisitProfile)
    window.removeEventListener('tomat:invite-duel', onInviteDuel)
  }
}, [navigate])
```

### 6d. Di dalam `useEffect` socket (yang sudah ada untuk tournament), tambahkan listener:
```jsx
socket.on('duel:incoming-invite', (data) => {
  setDuelInvite(data)  // { code, from: { userId, name } }
})

socket.on('duel:invite-expired', () => {
  // Host: undangan habis waktu, kembalikan ke home jika masih di lobby
  // (opsional — LobbyScreen sudah handle sendiri)
})

// Cleanup:
socket.off('duel:incoming-invite')
socket.off('duel:invite-expired')
```

### 6e. Tambahkan route di `renderScreen()` (sebelum blok `if (current === 'home')`):
```jsx
if (current === 'public-profile' && publicProfileData) {
  return (
    <PublicProfileScreen
      profile={publicProfileData}
      goBack={goBack}
      onInviteDuel={(profile) => {
        const socket = connectSocket()
        socket.emit('duel:invite', {
          targetUserId: profile.id,
          targetRole: profile.role || 'siswa',
          avatar: null,
        })
        navigate('duel-lobby')
      }}
    />
  )
}
```

### 6f. Modifikasi route `duel-lobby` agar bisa menerima `duelInviteCode`:
```jsx
if (current === 'duel-lobby') {
  const inviteCode = duelInviteCode
  return (
    <LobbyScreen
      goBack={() => { setDuelInviteCode(null); goBack() }}
      initialCode={inviteCode}  // <-- BARU
      onStart={(data) => {
        setDuelInviteCode(null)
        setDuelState(data)
        replaceTop('duel-katak')
      }}
    />
  )
}
```

### 6g. Tambahkan `DuelInviteBanner` di blok `return` (setelah `TournamentNotificationBanner`):
```jsx
{duelInvite && current !== 'duel-lobby' && current !== 'duel-katak' && (
  <DuelInviteBanner
    invite={duelInvite}
    onAccept={(inv) => {
      setDuelInvite(null)
      setDuelInviteCode(inv.code)
      navigate('duel-lobby')
    }}
    onDecline={() => {
      const socket = connectSocket()
      if (duelInvite?.code) socket.emit('duel:invite-decline', { code: duelInvite.code })
      setDuelInvite(null)
    }}
  />
)}
```

---

## Task 7 — Set VAPID Keys untuk Web Push Notifications

### Latar belakang
Server sudah siap menerima VAPID keys (`server/notifications.js` membacanya dari env). Selama ini push notification tidak pernah diaktifkan karena key belum di-set.

### Langkah:

1. Generate VAPID keys di shell:
```bash
npx web-push generate-vapid-keys
```

2. Set keduanya sebagai **Replit Secrets** (bukan env var biasa):
   - `VAPID_PUBLIC_KEY` → public key dari output
   - `VAPID_PRIVATE_KEY` → private key dari output

3. Untuk memudahkan user mengaktifkan notifikasi, **push notification prompt sudah ada** di `PlayerHeader` dan `AppNotificationBell` (tombol "Aktifkan notifikasi HP/browser"). Tombol ini memanggil `push.enable()` dari `usePushNotifications`. Tidak perlu auto-prompt — user bisa klik sendiri dari bell notifikasi.

4. Setelah secret di-set, **restart workflow** `TOMAT Web App`. Cek di console server tidak ada error VAPID.

5. Verifikasi: buka notifikasi bell → tombol "Aktifkan notifikasi HP/browser" harus muncul (bukan teks "Notifikasi perangkat belum dikonfigurasi"). Klik → browser meminta izin notifikasi.

---

## Referensi File Penting

| File | Keterangan |
|------|------------|
| `src/components/shared.jsx` | `PublicProfileModal`, `usePublicProfile`, `PlayerHeader`, `AppNotificationBell` |
| `src/screens/ProfileScreen.jsx` | Lihat `ProfileHero`, stat tiles, dan injeksi `PET_CSS` sebagai referensi visual |
| `src/screens/LobbyScreen.jsx` | Socket duel: create, join, start-game |
| `src/components/DuelInviteBanner.jsx` | **Sudah ada** — jangan dibuat ulang |
| `src/components/TournamentNotificationBanner.jsx` | Referensi pola banner overlay |
| `server/multiplayer.js` | Socket.io duel + boss raid + tournament |
| `server/notifications.js` | `notifyUser()`, `sendPush()`, `getPushConfig()` |
| `src/App.jsx` | Navigation stack, socket listeners, semua route |
| `src/notifications.js` | `usePushNotifications` hook (frontend) |

---

## Catatan Penting

- Jangan ubah struktur database — schema sudah auto-sync via `ensureSchema()` saat server start
- Password login di DB disimpan plaintext (sistem lama), jangan diubah
- `connectSocket()` dari `src/socket.js` selalu return socket yang sama (singleton)
- Setelah semua Task selesai, restart workflow dan verifikasi:
  - Buka profil siswa dari leaderboard → muncul tombol "Lihat Profil" dan "Ajak Duel"
  - Klik "Lihat Profil" → masuk ke PublicProfileScreen
  - Klik "Ajak Duel" → navigate ke LobbyScreen, target terima DuelInviteBanner
  - Tiga game Kelas 7 (Termometer, Katak, Pabrik Robot) menampilkan animasi setelah submit sebelum FeedbackBanner muncul
