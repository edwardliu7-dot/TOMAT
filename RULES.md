# RULES.md — Panduan Wajib Replit Agent untuk Proyek SMARTISA

> **⚠️ BACA FILE INI SEBELUM MELAKUKAN PERUBAHAN APAPUN.**
> File ini adalah sumber kebenaran tunggal tentang arsitektur, konvensi, dan aturan proyek SMARTISA.
> Jika Anda menambahkan fitur baru, identifikasi dulu modul mana yang akan terdampak menggunakan panduan di bawah ini.

---

## 1. Identitas Proyek

- **Nama Platform:** SMARTISA — Platform Pembelajaran Resmi TISA
- **Sub-modul:**
  - **TOMAT** — Tantangan Otak Mendidik Anak TISA (platform belajar siswa, game RPG edukasi)
  - **BLP** — BLP Harian (jurnal harian)
  - **GURU** — Administrasi Guru (dahulu GuruEOB5)
- **Deskripsi:** Platform pembelajaran terpadu untuk guru dan siswa SMP TISA Islamic School (Kelas 7–9).
- **Stack:** React 18 + Vite (frontend), Express + Node.js + Socket.io (backend), PostgreSQL via Neon (database).
- **Tidak menggunakan** library UI eksternal — semua styling adalah inline style / CSS vanilla.
- **Semua teks in-game harus dalam Bahasa Indonesia.**
- **Port:** `5000` (dijalankan via `npm run dev`).
- **Mobile:** Dikemas sebagai APK Android menggunakan Capacitor (`/app`, `/android`).

---

## 2. Struktur Folder

```
/
├── server/                    # Backend Express
│   ├── index.js               # Entry point: mount semua router, setup Socket.io
│   ├── schema.js              # ensureSchema() — DDL semua tabel, dijalankan saat startup
│   ├── db.js                  # Pool koneksi PostgreSQL (gunakan `pool` dari sini)
│   ├── auth.js                # Login/logout/profil — /api/auth/*
│   ├── guru.js                # Dashboard guru, manajemen kelas — /api/guru/*
│   ├── siswa.js               # Data siswa — /api/siswa/*
│   ├── player.js              # Reward coins/exp, POST /api/siswa/player/gain
│   ├── toko.js                # Toko item — /api/siswa/toko/*
│   ├── pet.js                 # Pet actions (feed, equip, revive) — /api/siswa/pet/*
│   ├── pet-state.js           # Kalkulasi HP & status pet
│   ├── pet-bonuses.js         # coinMult/expMult/hungerMult per skin
│   ├── multiplayer.js         # Socket.io: Duel Katak & Boss Raid
│   ├── tournament-engine.js   # Logika turnamen
│   ├── tournament-state.js    # State in-memory turnamen, setTournamentIo()
│   ├── tournament-questions.js# Generator soal per game key
│   ├── boss-state.js          # State Boss Raid, setIo()
│   ├── komunikasi.js          # Chat pribadi & forum kelas — /api/komunikasi/*
│   ├── notifikasi.js          # Push/in-app notifikasi — /api/notifikasi/*
│   ├── papan-peringkat.js     # Leaderboard — /api/siswa/papan-peringkat/*
│   ├── lencana.js             # Badges/lencana
│   ├── insight.js             # Analitik guru — /api/guru/insight/*
│   ├── gamify.js              # Helper gamifikasi umum
│   ├── hafalan-guru.js        # Hafalan (guru side)
│   ├── hafalan-siswa.js       # Hafalan (siswa side)
│   ├── event-missions.js      # Logika misi event
│   ├── event-missions-router.js # /api/siswa/event-missions/*
│   ├── seasonal-events.js     # Event musiman
│   └── kelas.js               # Helper data kelas
│
├── src/                       # Frontend React
│   ├── App.jsx                # AppShell: navigation stack (push/pop), route mapping
│   ├── version.js             # APP_VERSION — satu-satunya sumber versi
│   ├── difficulty.js          # useSurvival(), byDifficulty(), randInt()
│   ├── petBonuses.js          # Mirror client-side dari server/pet-bonuses.js
│   ├── PlayerContext.jsx      # coins, level, EXP, addCoins(), addExp(), recordWrongAnswer()
│   ├── AuthContext.jsx        # user session (guru/siswa), login/logout
│   ├── PetContext.jsx         # pet state, feed, equip, revivePet()
│   ├── TaskContext.jsx        # Tugas aktif, bab-lock, task guard
│   ├── components/
│   │   ├── shared.jsx         # Komponen UI reusable (lihat §6)
│   │   ├── AppShell.jsx       # Shell navigasi utama
│   │   ├── FloatingPet.jsx    # Widget pet mengambang
│   │   ├── TaskGuard.jsx      # Paksa siswa selesaikan tugas aktif
│   │   ├── TaskOverlay.jsx    # Overlay saat tugas sedang berlangsung
│   │   ├── TomiSprite.jsx     # Sprite pet Tomi
│   │   ├── KelinsaySprite.jsx # Sprite pet Kelinsay
│   │   ├── MonyangSprite.jsx  # Sprite pet Monyang
│   │   ├── NananagaSprite.jsx # Sprite pet Nananaga (sheet khusus)
│   │   ├── WhatsNewModal.jsx  # Modal "What's New" (ditampilkan sekali per versi)
│   │   └── shared.jsx         # Semua shared UI components
│   ├── screens/               # Layar-layar utama aplikasi
│   └── minigames/             # Semua file game (lihat §7)
│
├── public/                    # Aset statis (sprite sheet, banner, dll)
├── artifacts/mockup-sandbox/  # Sandbox desain (Vite terpisah, BUKAN bagian app utama)
└── RULES.md                   # ← File ini
```

---

## 3. Database & Schema

### Aturan Wajib
- **JANGAN** edit skema database secara manual. Semua DDL ada di `server/schema.js` dalam fungsi `ensureSchema()`.
- Tambahkan kolom baru dengan pola `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...` di dalam `ensureSchema()`.
- `ensureSchema()` dijalankan otomatis saat server startup — tidak butuh migration script manual.
- **⛔ DILARANG KERAS: Migrasi / copy data dari tabel lama ke tabel baru.** Data yang diinput di app lama (GuruEOB5 standalone) harus **tetap di tabel asalnya**. SMARTISA harus membaca langsung dari tabel lama — bukan menduplikatnya. Pelanggaran ini menyebabkan dua sumber kebenaran dan risiko kehilangan data.

### Tabel Utama
| Tabel | Deskripsi |
|-------|-----------|
| `gurus` | Akun guru (shared dengan BLP Harian) |
| `students` | Akun siswa (shared dengan BLP Harian) |
| `tugas` | Penugasan guru ke kelas |
| `nilai` | Hasil pengerjaan tugas siswa |
| `task_exit_reports` | Log siswa keluar saat mengerjakan tugas |
| `inventory` | Item yang dimiliki siswa (skin, frame, tema) |
| `pet_states` | Status hunger/death per siswa per pet type |
| `tomat_sessions` | Session store PostgreSQL |
| `pesan_pribadi` | Chat guru↔siswa |
| `pesan_forum_kelas` | Forum kelas |
| `tournament_history` | Arsip turnamen selesai |
| `hafalan_*` | Tabel sistem hafalan interaktif |
| `event_missions_*` | Progress misi event |

### Koneksi Database
- Selalu gunakan `import { pool } from './db.js'` — jangan buat koneksi baru.
- Password user disimpan sebagai plaintext (warisan BLP Harian) — **jangan ubah** kecuali diminta eksplisit.

---

## 4. API Routes

### Prefix dan Router
```
/api/auth/*              → server/auth.js        (login, logout, profil)
/api/guru/*              → server/guru.js         (dashboard guru)
/api/guru/insight/*      → server/insight.js      (analitik)
/api/siswa/*             → server/siswa.js        (data siswa)
/api/siswa/player/*      → server/player.js       (gain coins/exp)
/api/siswa/toko/*        → server/toko.js         (toko)
/api/siswa/pet/*         → server/pet.js          (pet actions)
/api/siswa/papan-peringkat/* → server/papan-peringkat.js
/api/siswa/event-missions/*  → server/event-missions-router.js
/api/siswa/hafalan/*     → server/hafalan-siswa.js
/api/guru/hafalan/*      → server/hafalan-guru.js
/api/komunikasi/*        → server/komunikasi.js
/api/notifikasi/*        → server/notifikasi.js
/api/lencana/*           → server/lencana.js
```

### Endpoint Kritis
- `POST /api/auth/login` — autentikasi guru/siswa
- `GET /api/player/me` — hydrate profil, pet state, daily bonus
- `POST /api/siswa/player/gain` — server-authoritative reward (coins + EXP)
- `POST /api/siswa/toko/beli` — beli item
- `POST /api/siswa/pet/revive` — adopsi pet baru (300 koin)
- `POST /api/siswa/nilai` — submit hasil tugas

### Menambahkan Router Baru
1. Buat file `server/nama-fitur.js`.
2. Import dan mount di `server/index.js` dengan prefix yang sesuai.
3. Jangan buat endpoint duplikat yang sudah ada di router lain.

---

## 5. Frontend — Navigasi & State

### Navigasi (App.jsx)
- BUKAN React Router. Navigasi menggunakan **history stack** custom di `App.jsx`.
- Untuk pindah layar: `push('NamaScreen', propsOpsional)`.
- Untuk kembali: `pop()` atau `goBack` prop yang diteruskan ke setiap screen.
- Setiap screen baru harus didaftarkan di switch/map di `App.jsx`.

### Context — Hierarki & Tanggung Jawab
| Context | Tanggung Jawab | Jangan Duplikat |
|---------|---------------|-----------------|
| `AuthContext` | Session user, role (guru/siswa), data profil | Login state |
| `PlayerContext` | coins, level, EXP, `addCoins()`, `addExp()`, `recordWrongAnswer()` | Reward logic |
| `PetContext` | Pet state, `feedPet()`, `equipSkin()`, `revivePet()` | Pet mutations |
| `TaskContext` | Tugas aktif, soal selesai, bab-lock | Task tracking |

**Aturan:** Jika fungsionalitas sudah ada di salah satu context di atas, gunakan context tersebut — jangan buat state lokal atau context baru yang menduplikasi.

---

## 6. Komponen Shared (src/components/shared.jsx)

Selalu gunakan komponen dari `shared.jsx` — jangan buat komponen duplikat.

| Komponen | Kegunaan |
|----------|----------|
| `TopBar` | Header layar dengan tombol back |
| `PlayerHeader` | Header dengan info coins/EXP siswa |
| `Card` | Container kartu standar |
| `Btn` | Tombol standar |
| `FeedbackBanner` | Banner benar/salah setelah jawab soal |
| `SliderInput` | Input slider untuk jawaban numerik |
| `randomSliderRange()` | **WAJIB** digunakan untuk range slider — jangan hardcode |
| `DifficultyBadge` | Badge level kesulitan |
| `SurvivalOverScreen` | Layar game over mode survival |

### FeedbackBanner — Dua Pola Props
- Game lama (G7): `{ isCorrect, correctAnswer, onNext }`
- Game baru G8/G9: `{ correct, answer, onNext }`
- `shared.jsx` mendukung **keduanya** — pastikan tidak merusak saat modifikasi.

---

## 7. Minigames — Konvensi

### Struktur File Game
Setiap game adalah React component di `src/minigames/`:

```jsx
// Naming: [G8/G9]NamaGame.jsx atau NamaGame.jsx (G7)
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, 
         randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') { /* ... */ }

export default function NamaGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp, recordWrongAnswer } = usePlayer()
  const survivalState = useSurvival(survival)
  // ...
}
```

### Aturan Game
1. **SliderInput:** Selalu gunakan `randomSliderRange()` — **jangan** hardcode range dengan padding tetap di sekitar jawaban (celah keamanan: siswa bisa tebak posisi).
2. **Jawaban slider** harus selalu bilangan bulat positif.
3. **Wrong answers** di pilihan ganda tidak boleh equivalen dengan jawaban benar (contoh: 2/6 ≡ 1/3 adalah bug).
4. **Reward:** Gunakan `addCoins()` dan `addExp()` dari `PlayerContext` — jangan panggil API langsung dari game.
5. **Survival mode:** Gunakan `useSurvival(survival)` dari `difficulty.js` — tidak perlu implementasi manual.
6. **gameTheme:** File tema harus disimpan sebagai `.jsx` (bukan `.js`) karena berisi JSX.

### Katalog Game per Kelas
- **Kelas 7:** 20 game (BAB I–III) — file tanpa prefix G8/G9
- **Kelas 8:** 38 game (BAB I–VII) — prefix `G8`
- **Kelas 9:** 31 game (BAB I–V) — prefix `G9`

### Mendaftarkan Game Baru
Setelah membuat file game, daftarkan di:
1. `src/screens/Grade7ZoneScreen.jsx` / `Grade8ZoneScreen.jsx` / `Grade9ZoneScreen.jsx` (katalog & tampilan)
2. `server/tournament-questions.js` — jika game akan tersedia di **Duel** atau **Turnamen**
3. Konstanta `DUEL_GAME_KEYS` di multiplayer jika relevan

---

## 8. Sistem Multiplayer (Socket.io)

### Setup
- Socket.io berjalan di atas `http.createServer(app)` — **bukan** server Express terpisah.
- Session middleware di-share antara Express dan Socket.io.
- `setIo(io)` di `boss-state.js` dan `setTournamentIo(io)` di `tournament-state.js` harus dipanggil setelah `io` dibuat (sudah dilakukan di `server/index.js`).

### Event Utama
| Namespace | Event | Deskripsi |
|-----------|-------|-----------|
| Duel | `duel:join`, `duel:question`, `duel:game-over` | Pertarungan 1v1 |
| Boss Raid | `boss:hit`, `boss:update`, `boss:defeated` | Event co-op kelas |
| Turnamen | `tournament:join`, `tournament:question`, `tournament:match-won` | Bracket turnamen |
| Nananaga | `duel:use-immunity`, `tournament:use-immunity` | Skill pet khusus |
| Misi Event | `mission:progress` | Server → client: progress misi bertambah (duel/turnamen). Minigame via REST `/gain` response `missionDeltas[]`. |

### Aturan Multiplayer
- State lobby/room disimpan **in-memory** (Map) — tidak persisten antar restart server.
- Soal turnamen di-generate oleh `tournament-questions.js` (server-authoritative).
- Hindari stale closure di komponen lobby — gunakan refs.

---

## 9. Sistem Pet

### Tipe Pet & Skin
| Pet | Skin Pool |
|-----|-----------|
| Tomi | Base + skin umum/langka/epic |
| Kelinsay | Base + skin umum/langka/epic |
| Monyang | Base + skin umum/langka/epic |
| Nananaga | Skin khusus (sheet sprite terpisah, immunitas) |

### Aturan Pet
- `hunger_map` menggunakan key **tipe pet** (tomi/kelinsay/monyang/nananaga), bukan skinId.
- Skin hewan memerlukan kepemilikan **base pet** sebelum bisa dibeli/diequip.
- Pet mati (`isDead=true`): siswa harus `POST /api/siswa/pet/revive` (300 koin) — tidak bisa diberi makan.
- Sprite sheet: 768×768, grid 6×6 (128×128/cell).
- Bonus per skin didefinisikan di `server/pet-bonuses.js` dan di-mirror ke `src/petBonuses.js`.
- **Nananaga immunity:** Tidak diimplementasikan di file game — ditangani oleh `useSurvival` via CustomEvent `'nananaga-shield'`.

---

## 10. Sistem Ekonomi (Koin & EXP)

- Jawaban benar dalam gameplay: **+15 koin** (default).
- Reward ditetapkan server-side — klien hanya memanggil `addCoins()`/`addExp()` yang memanggil `POST /api/siswa/player/gain`.
- Server menerapkan **cap** pada reward untuk mencegah farming.
- Bonus koin/exp dari skin pet diterapkan **setelah cap** di `player/gain`.
- Item kosmetik premium: harga bervariasi, dicek server-side saat pembelian.

---

## 11. Autentikasi & Keamanan

- Login: `POST /api/auth/login` — mendukung plaintext dan bcrypt (warisan BLP Harian).
- Session: Cookie-based via `express-session` + PostgreSQL store (`tomat_sessions`).
- **Capacitor/APK:** Cookie SameSite di-patch ke `None; Secure` untuk cross-origin WebView.
- Akses komunikasi (chat/forum): dicek server-side berdasarkan relasi guru-kelas-siswa yang eksak.
- Profil publik: hanya terlihat dalam lingkaran kelas yang diizinkan.

### `hasMateriTerdaftar` — Akses Penuh Guru TOMAT
- Guru mendapat akses penuh TOMAT (raid, tugas, kunci bab, turnamen) jika `hasMateriTerdaftar = true`.
- Flag ini `true` jika: jabatan berisi **`'guru'` atau `'guru_mapel'`** DAN guru memiliki minimal satu baris aktif di tabel `subjects`.
- **Jangan gunakan `'guru_mapel'` sebagai satu-satunya syarat** — jabatan `'guru'` (generik) sudah cukup.
- Middleware yang menggunakannya: `requireGuruMapelTerdaftar` di `server/guru.js`.

### Sesi Guru — Sync Otomatis dari DB
- Setiap request `GET /api/auth/me` **selalu** meng-overwrite `jabatan`, `kelas_diampu`, dan `wali_kelas_kelas` di sesi dari DB.
- Ini memastikan perubahan jabatan/kelas berlaku tanpa re-login, dan sesi lama yang tidak punya field ini otomatis ter-backfill.
- Response login dan `/me` menyertakan `jabatan`, `kelas_diampu`, `wali_kelas_kelas` sehingga klien (termasuk GuruEOB5) bisa membacanya langsung dari `user` di `AuthContext`.

### BLP — Auth Berbasis Sesi
- Route BLP guru (`/api/blp/dashboard`, review submission) **tidak memanggil `loadGuru()` dari DB** untuk cek akses — cukup baca `req.session.user.jabatan` dan `req.session.user.wali_kelas_kelas` yang sudah divalidasi saat login.
- Pattern: `jabatan.includes('wali_kelas') && wali_kelas_kelas` → izinkan akses.

---

## 12. Fitur Khusus — Daftar Modul

### Modul yang Ada — Cek Sebelum Membuat Ulang
| Fitur | File Utama | Catatan |
|-------|-----------|---------|
| Tugas / Assignment | `server/guru.js`, `server/siswa.js`, `TaskContext.jsx` | |
| Nilai / Scoring | `server/player.js`, `TaskResultScreen.jsx` | |
| Toko | `server/toko.js`, `ShopScreen.jsx` | |
| Pet | `server/pet.js`, `PetContext.jsx`, `FloatingPet.jsx` | |
| Duel | `server/multiplayer.js`, `DuelKatakScreen.jsx`, `LobbyScreen.jsx` | |
| Boss Raid | `server/boss-state.js`, `BossRaidScreen.jsx` | |
| Turnamen | `server/tournament-*.js`, `TournamentMatchScreen.jsx` | |
| Leaderboard | `server/papan-peringkat.js`, `LeaderboardScreen.jsx` | |
| Chat/Forum (siswa) | `server/komunikasi.js`, `CommunicationScreen.jsx` | **Hanya siswa & sisi siswa.** Guru tidak punya tab Chat di TOMAT — guru balas dari GuruEOB5 |
| Notifikasi | `server/notifications.js`, `AppNotificationBell` di `shared.jsx` | Mendukung field `source`: `'tomat'` atau `'blp'` — tampil sebagai pill badge di bell |
| Hafalan | `server/hafalan-*.js`, `HafalanScreen.jsx` | |
| Event Misi | `server/event-missions*.js` | |
| Badges | `server/lencana.js`, `BadgesScreen.jsx` | |
| Profil | `server/auth.js`, `ProfileScreen.jsx` | |
| What's New Modal | `WhatsNewModal.jsx`, `src/version.js` | |

---

## 13. Aturan Penambahan Fitur Baru

Sebelum membuat kode fitur baru, lakukan langkah berikut **secara berurutan**:

### Langkah 1 — Audit Duplikasi
- Cek §12 dan codebase apakah fungsionalitas sudah ada.
- Cari fungsi/komponen serupa dengan `grep` sebelum membuat yang baru.

### Langkah 2 — Identifikasi Dampak
Tanyakan: "Fitur ini menyentuh modul mana?"
- Jika memengaruhi **koin/EXP** → perlu modifikasi `server/player.js` + `PlayerContext`
- Jika memengaruhi **pet** → perlu modifikasi `server/pet.js` + `PetContext`
- Jika memengaruhi **tugas** → perlu modifikasi `server/guru.js` + `TaskContext`
- Jika memengaruhi **multiplayer** → koordinasikan dengan `server/multiplayer.js` dan Socket.io events
- Jika menambah **tabel baru** → tambahkan DDL di `server/schema.js` dengan `IF NOT EXISTS`
- Jika menambah **router baru** → daftarkan di `server/index.js`

### Langkah 3 — Ikuti Konvensi
- Game baru: ikuti template §7.
- Komponen UI baru: periksa `shared.jsx` dahulu.
- API baru: ikuti pola router yang ada (middleware auth, error handling konsisten).
- Bahasa: **Semua teks UI dalam Bahasa Indonesia.**

### Langkah 4 — Jangan Rusak yang Lama
- Jalankan aplikasi dan test fitur yang berdekatan setelah perubahan.
- FeedbackBanner: pastikan tetap mendukung dua pola props (§6).
- Schema: gunakan `ADD COLUMN IF NOT EXISTS`, **jangan DROP** kolom tanpa konfirmasi eksplisit.

---

## 14. Versi Aplikasi

- Sumber kebenaran: `src/version.js` — ekspor `APP_VERSION`.
- `WhatsNewModal` ditampilkan sekali per versi via localStorage.
- Saat rilis baru: bump `version.js` **dan** `build.gradle` bersamaan.

---

## 15. Akun Demo & Testing

- `tomat_demo`: Akun demo di kelas `IX Al Khawarizmi` (Grade 9), memiliki full luxury catalog.
- Akun demo disembunyikan dari tampilan siswa lain.
- Seed akun guru default: `guru1` / `tomat2026` (ganti setelah deploy pertama).

---

## 16. Event Mission — Centralized Gameplay Event Bus

**`server/gameplay-events.js`** adalah **Single Source of Truth** untuk semua side-effect yang dipicu oleh kejadian gameplay.

### Aturan Wajib
- **DILARANG** memanggil `incrementMissionProgress()` langsung dari modul lain.
- Setiap mode permainan memanggil fungsi dari `gameplay-events.js`:

| Kejadian | Fungsi | Misi yang diperbarui |
|----------|--------|----------------------|
| Jawaban benar (semua mode) | `onCorrectAnswer(studentId)` | `kemerdekaan_1` |
| Jawaban benar + butuh payload | `onCorrectAnswerWithResult(studentId)` | sama — return `Array<MissionDelta>` terformat |
| Menang duel 1v1 | `onDuelWin(winnerId)` | `kemerdekaan_2`, `kemerdekaan_3` (auto) |
| Menang duel + butuh payload | `onDuelWinWithResult(winnerId)` | sama — return `Array<MissionDelta>` terformat |
| Menang match turnamen | `onTournamentWin(winnerId)` | (siap, belum ada misi aktif) |

### Jalur per Mode
| Mode | File Pemanggil | Titik Panggilan |
|------|----------------|-----------------|
| Minigame (REST) | `server/player.js` | `/gain` handler — `if (coinsGain > 0)` |
| Duel (Socket.io) | `server/multiplayer.js` | `duel:answer` handler — `if (correct)` |
| Turnamen (Socket.io) | `server/tournament-engine.js` | `handleTournamentAnswer` — `if (correct)` |

### Menambah Misi Baru
1. Definisikan misi baru di `server/event-missions.js` (`EVENT_MISSIONS` array).
2. Tambahkan `fire(studentId, 'id_misi_baru')` di fungsi yang sesuai di `gameplay-events.js`.
   - Jika misi butuh notifikasi toast/klaim: gunakan `fireAndReturn` dan sertakan dalam `_formatDeltas`.
3. **Tidak perlu mengubah** `player.js`, `multiplayer.js`, atau `tournament-engine.js`.
   - `EVENT_MISSIONS` **hanya** boleh diimport di `event-missions.js` dan `gameplay-events.js`.
   - Caller lain menerima `Array<MissionDelta>` terformat — tidak pernah raw DB result.

### Koin Kemenangan Duel
- Diberikan server-side di `finishGame()` via `pool.query` → `+15 coins`.
- Field `winnerNewCoins` dikirim di payload `duel:game-over`.
- Klien panggil `syncCoins(winnerNewCoins)` — **jangan** `addCoins()` (double-count).
- **Boss Raid** jawaban benar tidak terhubung ke `onCorrectAnswer` (intentional: co-op event dengan alur reward sendiri).

---

---

## 17. Modul BLP Harian

- Backend routes: `server/blp/*.js` — prefix `/api/blp/*`
- Frontend screens: `src/screens/blp/`
- Komponen UI: `src/components/blp/`
- Data context: `src/contexts/BlpDataContext.jsx` — menyimpan cache dashboard, `loadDashboard()`, `invalidate()`, `patchSubmission()`
- Entry point layar: `BlpHomeScreen.jsx`
- Auth: pakai session TOMAT yang ada — tidak ada login terpisah
- Teks: semua Bahasa Indonesia
- Styling: inline styles (BUKAN Tailwind)
- Schema: tabel BLP **tidak menggunakan prefix `blp_`** untuk tabel baru. Tabel lama (`blp_periods`, `daily_records`, `haid_periods`) dipertahankan apa adanya karena merupakan nama asli dari standalone BLP app.

### Akses Guru BLP
- Hanya guru dengan `jabatan.includes('wali_kelas')` dan `wali_kelas_kelas` terisi yang bisa akses BLP guru.
- **Jangan panggil `loadGuru()` dari DB untuk cek akses** — gunakan `req.session.user` langsung (sudah divalidasi saat login, selalu di-sync di `/me`).
- Siswa di luar kelas wali tidak bisa diakses guru tersebut.

### Notifikasi BLP (Lintas Modul)
- Siswa submit checklist harian → `notifyUser()` dikirim ke guru wali kelas kelas siswa (`source: 'blp'`, `type: 'blp_submit'`). **Non-blocking** — tidak menunda response HTTP.
- Guru review submission pertama kali (`reviewedAt` baru diset) → `notifyUser()` dikirim ke siswa (`source: 'blp'`, `type: 'blp_feedback'`).
- Di `AppNotificationBell`: notif BLP tampil dengan pill biru **BLP**, notif TOMAT dengan pill hijau **TOMAT**.

## 18. Modul GuruEOB5

- Backend routes: `server/eob5/*.js` — prefix `/api/eob5/*`
- Frontend screens: `src/screens/eob5/`
- Komponen UI: `src/components/eob5/` (Eob5Sidebar, Eob5Layout)
- Entry point layar: `Eob5DashboardScreen.jsx`
- Auth: pakai session TOMAT yang ada — tidak ada login terpisah
- Teks: semua Bahasa Indonesia
- Styling: inline styles (BUKAN Tailwind/ShadCN)
- Schema: tabel modul GURU **tidak menggunakan prefix `eob5_`**. Nama tabel mengikuti skema lama standalone GuruEOB5 yang sudah berisi data (contoh: `grades`, `journal_entries`, `subjects`, `tujuan_pembelajaran`). Tabel baru yang tidak ada padanannya dibuat TANPA prefix (contoh: `absensi`, `kelas_guru`, `student_points`).
- Layout: semua screen `eob5-*` dibungkus `Eob5Layout` di App.jsx → menampilkan `Eob5Sidebar` (desktop inline, mobile drawer via tombol ☰)

### ⚠️ Dua Aplikasi Berjalan Berdampingan — Wajib Dibaca

SMARTISA modul GURU adalah **interface mobile tambahan** untuk app standalone GuruEOB5 yang sudah ada. Keduanya berbagi satu Neon database. App lama adalah **aplikasi utama** — jangan ubah strukturnya.

**Aturan keras:**
1. **Jangan pernah migrasi / copy data dari tabel lama ke tabel baru.** Baca langsung dari tabel asal.
2. **Jangan DROP atau RENAME tabel/kolom lama** tanpa konfirmasi eksplisit.
3. **Selalu cek nama kolom aktual di DB** — app lama kadang berbeda dari yang tertulis di schema.js (contoh: `teacher_id` bukan `guru_id` di beberapa tabel; `schedules` bukan `jadwal`).

### Pemetaan Tabel: App Lama vs SMARTISA

| Data | Tabel app lama (baca dari sini) | Tabel SMARTISA (jangan pakai untuk data lama) | Catatan |
|------|------|------|------|
| Jadwal pelajaran | **`schedules`** (kolom: `teacher_id`, `subject_id` UUID, `kelas`, `hari`, `jam_mulai`, `jam_selesai`) | `jadwal` (kosong — hanya entri baru SMARTISA) | GET `/api/eob5/jadwal` UNION kedua tabel |
| Absensi harian | **`absensi`** (kolom: `student_id`, `guru_id`, `tanggal`, `status`, `keterangan`) | `attendance_records` (sebagian copy lama + entri baru) | Status `'alpha'` = absen (ejaan lama); `'alpa'` = ejaan baru |
| Nilai akademik | **`grades`** (kolom: `student_id`, `guru_id`, `subject_id` UUID, `jenis`, `nilai`) | `nilai_akademik` (kosong) | Gunakan JOIN ke `subjects` untuk nama mapel |
| Nilai TOMAT | `nilai` | — | Tabel terpisah milik TOMAT — jangan campur |
| Prosem & items | `prosem` + `prosem_items` | — | Semua pakai `teacher_id`; `prosem_items.week_id` lama = UUID orphan |
| Jurnal | `journal_entries` | — | Kolom: `teacher_id` |
| Mata pelajaran | `subjects` | — | Kolom: `teacher_id`; soft-delete via `deleted_at` |
| Tujuan Pembelajaran | `tujuan_pembelajaran` | — | Kolom: `teacher_id`, `description` (bukan `deskripsi`) |
| Kalender akademik | `academic_calendars` | — | Kolom: `created_by` (bukan `guru_id`) |
| Poin perilaku | `point_records` | — | Dahulu `student_points` (sudah di-rename via schema.js) |

### Kolom Kunci yang Berbeda dari Default

Tabel-tabel berikut menggunakan kolom **`teacher_id`** (bukan `guru_id`):
`subjects`, `journal_entries`, `tujuan_pembelajaran`, `prosem`, `academic_calendars` (pakai `created_by`)

Tabel `schedules` (jadwal app lama) menggunakan `teacher_id`, bukan `guru_id`.

### Akses Kontrol per Jabatan

Nilai `jabatan` yang valid di tabel `gurus` (array): `guru`, `wali_kelas`, `wakasek`, `kepala_sekolah`, `admin`.

| Middleware | Jabatan yang diizinkan | Dipakai di |
|---|---|---|
| `requireGuru` | semua guru (role='guru') | semua route umum |
| `requireAdmin` | `kepala_sekolah`, `admin` | tambah/hapus guru |
| `requireKepsekOrWakasek` | `kepala_sekolah`, `wakasek`, `admin` | kepsek.js, kurikulum.js |
| `requireWaliKelasOrAbove` | `wali_kelas`, `kepala_sekolah`, `wakasek`, `admin` | kesiswaan.js |

**Sidebar `Eob5Sidebar.jsx`** menyaring item menu berdasarkan `user.jabatan` (prop dari `AuthContext`):
- Grup **Jabatan**: `kepsek` hanya untuk `kepala_sekolah`/`wakasek`; `kesiswaan`/`walikelas` hanya untuk `wali_kelas` ke atas; `kurikulum` hanya untuk `kepala_sekolah`/`wakasek`.
- Grup **Admin**: Manajemen Siswa, Poin, Akun Siswa, Direktori hanya untuk `wali_kelas` ke atas; Administrasi hanya untuk `kepala_sekolah`/`admin`.
- Item tanpa properti `roles` → tampil untuk semua guru.

### Status Absensi — Normalisasi

App lama menyimpan status absen sebagai `'alpha'`. SMARTISA (`attendance.js`) menggunakan `'alpa'`. Saat query absensi dari tabel `absensi`:
- Filter/count gunakan `status IN ('alpha', 'alpa')` untuk menghitung keduanya.
- Saat INSERT baru via `absensi.js` → normalize via `normalizeStatus()` → simpan sebagai `'alpha'`.

### Info Pekanan

`GET /api/eob5/info-pekanan` → `server/eob5/info-pekanan.js` menghitung ringkasan pekan dari:
- `prosem_items` (data ada tapi `week_id` lama = UUID orphan → query sertakan `OR NOT EXISTS (SELECT 1 FROM academic_weeks WHERE id = pi.week_id)`)
- `journal_entries` (data lengkap)
- `schedules` UNION `jadwal` untuk slot jadwal guru

### Daftar Lengkap Screen & Route

#### Grup Utama
| Route key | Screen file | Deskripsi |
|-----------|-------------|-----------|
| `eob5-dashboard` | `Eob5DashboardScreen.jsx` | Dashboard utama & statistik |
| `eob5-absensi` | `Eob5AbsensiScreen.jsx` | Input & rekap kehadiran siswa |
| `eob5-nilai` | `Eob5NilaiScreen.jsx` | Nilai Kurikulum Merdeka |
| `eob5-jurnal` | `Eob5JurnalScreen.jsx` | Jurnal mengajar harian |
| `eob5-jadwal` | `Eob5JadwalScreen.jsx` | Jadwal pelajaran |
| `eob5-prosem` | `Eob5ProsemScreen.jsx` | Program semester |
| `eob5-materi` | `Eob5MateriScreen.jsx` | Generate Modul Ajar via Groq AI, history, ekspor .txt |
| `eob5-soal-ai` | `Eob5SoalAiScreen.jsx` | Generate soal otomatis via Groq AI, history, preview |
| `eob5-rekap` | `Eob5RekapScreen.jsx` | Rekap kelas & periode |
| `eob5-inbox` | `Eob5InboxScreen.jsx` | Pesan masuk dari siswa |

#### Grup Jabatan
| Route key | Screen file | Deskripsi |
|-----------|-------------|-----------|
| `eob5-kepsek` | `Eob5KepsekScreen.jsx` | Progres kinerja guru (Kepala Sekolah) |
| `eob5-kesiswaan` | `Eob5KesiswaanScreen.jsx` | Rekap kesiswaan |
| `eob5-walikelas` | `Eob5WaliKelasScreen.jsx` | Rekap wali kelas |
| `eob5-kurikulum` | `Eob5KurikulumScreen.jsx` | Supervisi kurikulum |

#### Grup Admin
| Route key | Screen file | Deskripsi |
|-----------|-------------|-----------|
| `eob5-siswa` | `Eob5ManajemenSiswaScreen.jsx` | Manajemen data siswa |
| `eob5-detail-siswa` | `Eob5DetailSiswaScreen.jsx` | Detail siswa (sub-screen, trigger via event `eob5:lihat-siswa`) |
| `eob5-poin` | `Eob5PoinScreen.jsx` | Rekap poin perilaku siswa |
| `eob5-akun-siswa` | `Eob5AkunSiswaScreen.jsx` | Generate akun login siswa |
| `eob5-direktori-guru` | `Eob5DirektoriGuruScreen.jsx` | Direktori semua guru |
| `eob5-direktori-siswa` | `Eob5DirektoriSiswaScreen.jsx` | Direktori semua siswa |
| `eob5-kalender` | `Eob5KalenderScreen.jsx` | Kalender akademik & pekan |
| `eob5-info-pekanan` | `Eob5InfoPekananScreen.jsx` | Ringkasan mingguan & WA |
| `eob5-administrasi` | `Eob5AdministrasiScreen.jsx` | Upload/browse dokumen administrasi & bahan ajar |
| `eob5-feedback` | `Eob5FeedbackScreen.jsx` | Kotak masuk feedback dari guru |
| `eob5-pengaturan` | `Eob5PengaturanScreen.jsx` | Pengaturan profil guru: nama, jabatan, foto, password |

### API Routes GuruEOB5
```
/api/eob5/dashboard          → server/eob5/dashboard.js
/api/eob5/guru               → server/eob5/guru.js
/api/eob5/siswa              → server/eob5/siswa-akun.js
/api/eob5/absensi            → server/eob5/absensi.js
/api/eob5/kelas              → server/eob5/kelas.js
/api/eob5/nilai              → server/eob5/nilai.js
/api/eob5/materi             → server/eob5/materi.js
/api/eob5/modul-ajar         → server/eob5/modul-ajar.js       (Groq AI)
/api/eob5/soal-otomatis      → server/eob5/soal-otomatis.js    (Groq AI)
/api/eob5/jadwal             → server/eob5/jadwal.js
/api/eob5/prosem             → server/eob5/prosem.js
/api/eob5/rekap              → server/eob5/rekap.js
/api/eob5/inbox              → server/eob5/inbox.js
/api/eob5/subjects           → server/eob5/subjects.js
/api/eob5/journal            → server/eob5/journal.js
/api/eob5/attendance         → server/eob5/attendance.js
/api/eob5/grades             → server/eob5/grades.js
/api/eob5/points             → server/eob5/points.js
/api/eob5/tujuan-pembelajaran→ server/eob5/tujuan-pembelajaran.js
/api/eob5/documents          → server/eob5/documents.js
/api/eob5/bahan-ajar         → server/eob5/bahan-ajar.js
/api/eob5/student-accounts   → server/eob5/student-accounts.js
/api/eob5/teachers           → server/eob5/teachers.js
/api/eob5/info-pekanan       → server/eob5/info-pekanan.js
/api/eob5/feedback           → server/eob5/feedback.js
/api/eob5/kepsek             → server/eob5/kepsek.js
/api/eob5/kesiswaan          → server/eob5/kesiswaan.js
/api/eob5/walikelas          → server/eob5/walikelas.js
/api/eob5/kurikulum          → server/eob5/kurikulum.js
/api/eob5/                   → server/eob5/academic-calendars.js (/academic-calendars, /academic-weeks)
```

---

## 19. App Switcher

- Komponen: `src/components/AppSwitcher.jsx`
- Ditampilkan di `AppShell` header untuk semua user yang sudah login
- Siswa: tab TOMAT + BLP
- Guru: tab TOMAT + BLP + GURU (dahulu EOB5)
- Switch module: `setHistory([homeScreen])` — reset history ke home screen modul yang dipilih
- Palet warna per modul: TOMAT = biru-ungu, BLP = hijau, GURU = amber-oranye
- Route key tetap `eob5-*` secara internal — hanya label tampilan yang berubah ke "GURU"

---

*Terakhir diperbarui: 3 Agustus 2026 — Ditambahkan §18 pemetaan tabel app lama GuruEOB5 vs SMARTISA; aturan DILARANG migrasi data; normalisasi status absensi `alpha`/`alpa`; pemetaan jadwal dari `schedules` (UNION `jadwal`); nilai dari `grades` (bukan `nilai_akademik`); akses kontrol per jabatan (`requireKepsekOrWakasek`, `requireWaliKelasOrAbove`); filter sidebar `Eob5Sidebar` berdasarkan jabatan. Auth overhaul: `hasMateriTerdaftar` kenali jabatan `'guru'`; sesi guru selalu sync dari DB. Update file ini setiap kali ada perubahan arsitektur signifikan.*
