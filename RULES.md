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
│   ├── hooks/
│   │   └── useLandscapeMobile.js  # Deteksi landscape mobile (width>height && 620≤w<1024)
│   ├── components/
│   │   ├── shared.jsx                  # Komponen UI reusable (lihat §6)
│   │   ├── AppShell.jsx                # Shell navigasi utama (header mobile + sidebar)
│   │   ├── AppSwitcher.jsx             # Tab TOMAT / BLP / GURU — buka URL eksternal
│   │   ├── IframeAppShell.jsx          # Overlay pembuka app eksternal (web: iframe; APK: Capacitor Browser)
│   │   ├── MobileLandscapeDashboard.jsx# ZonaDashboard siswa 3-kolom (lihat §20)
│   │   ├── FloatingPet.jsx             # Widget pet mengambang (TIDAK dirender, hanya import tetap ada)
│   │   ├── SeasonalEventBanner.jsx     # Banner event musiman — ditampilkan di ZonaDashboard
│   │   ├── TaskGuard.jsx               # Paksa siswa selesaikan tugas aktif
│   │   ├── TaskOverlay.jsx             # Overlay saat tugas sedang berlangsung
│   │   ├── TomiSprite.jsx              # Sprite pet Tomi
│   │   ├── KelinsaySprite.jsx          # Sprite pet Kelinsay
│   │   ├── MonyangSprite.jsx           # Sprite pet Monyang
│   │   ├── NananagaSprite.jsx          # Sprite pet Nananaga (sheet khusus)
│   │   ├── KomodihSprite.jsx           # Sprite pet KomoDIH (sheet khusus)
│   │   └── WhatsNewModal.jsx           # Modal "What's New" (ditampilkan sekali per versi)
│   ├── screens/
│   │   ├── landscape/         # Layar landscape siswa (semua file baru, lihat §20)
│   │   │   ├── LandscapeArena.jsx
│   │   │   ├── LandscapeNilaiTugas.jsx
│   │   │   ├── LandscapeLeaderboard.jsx
│   │   │   ├── LandscapeZonaMap.jsx
│   │   │   ├── LandscapeZonaIPA.jsx
│   │   │   ├── LandscapeLencana.jsx
│   │   │   ├── LandscapeProfil.jsx
│   │   │   ├── LandscapeChat.jsx
│   │   │   ├── LandscapeHafalan.jsx
│   │   │   ├── LandscapeLatihanUjian.jsx
│   │   │   └── LandscapeTokoScreen.jsx
│   │   └── ...                # Layar-layar utama lainnya
│   └── minigames/             # Semua file game (lihat §7)
│
├── public/
│   ├── wallpaper-dashboard.png  # Wallpaper Negeri Tomat (fantasy RPG) — background ZonaDashboard
│   └── ...                      # Sprite sheet, banner, aset statis lainnya
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
- Route `arena` terdaftar dan menampilkan `LandscapeArena.jsx` (4 mode: Duel, Turnamen, Boss Raid, MOBA).

### Landscape Router (Siswa — semua device)
- Di `renderScreen()` dalam `App.jsx`, terdapat **landscape router block** yang dieksekusi sebelum routing utama.
- Kondisi: `!guruMode && user?.role === 'siswa'` — berlaku untuk **semua device** (desktop, mobile landscape, portrait).
- `landscapeMap` memetakan 11 route ke komponen `src/screens/landscape/Landscape*.jsx`.
- **Game routes (`GAME_ROUTES`)** dan screen immersive (duel, tournament, boss-raid, moba) di-bypass landscape router — mereka tidak ada di `landscapeMap` sehingga fall-through ke routing normal.
- `useLandscapeMobile` hook **tidak lagi digunakan di App.jsx** — dihapus dari import dan variable. Hook masih ada di `src/hooks/` untuk referensi, tapi tidak aktif.
- Semua AppShell chrome (sidebar, AppSwitcher, mobile header, bottom nav) disembunyikan untuk seluruh siswa via `isZonaDashboard = user?.role === 'siswa'` di `AppShell.jsx`.

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

### Dukungan Duel / Turnamen / MOBA per BAB
Semua 53 game key di bawah ini sudah punya generator soal dan aktif di Duel, Turnamen, dan MOBA:

| Kelas | BAB | Game Keys | Count |
|-------|-----|-----------|-------|
| 7 | BAB I — Bilangan Bulat | `katak`, `termometer`, `pabrikrobot`, `gembok`, `mercusuar`, `sporajamur`, `scanner` | 7 |
| 7 | BAB II — Bilangan Rasional | `kokipizza`, `pipaair`, `bortambang`, `kabataku`, `baterai`, `timbanganemas`, `fokusteleskop` | 7 |
| 7 | BAB III — Rasio & Perbandingan | `ramuanjus`, `kasirsihir`, `benteng`, `nakhoda`, `relkereta`, `brankas` | 6 |
| 8 | BAB I — Bilangan Berpangkat | `g8selramuan`, `g8racunminiatur`, `g8kristal`, `g8fusienergi`, `g8mantraakar`, `g8geolog` | 6 |
| 8 | BAB II — Teorema Pythagoras | `g8trebuchet`, `g8perisai`, `g8hartakarun`, `g8inspeksisudut`, `g8petaradar`, `g8taligantung` | 6 |
| 8 | BAB III — PLSV | `g8gerbanglogika`, `g8katrol`, `g8gulungan`, `g8keretakuda` | 4 |
| 9 | BAB I — SPLDV | `g9manifest`, `g9plotrute`, `g9interseksi`, `g9konsol`, `g9pasargalaksi` | 5 |
| 9 | BAB II — Lingkaran | `g9kalibrasirada`, `g9orbit`, `g9shieldgaya`, `g9laserjuring`, `g9asteroid` | 5 |
| 9 | BAB III — Bangun Ruang | `g9boksbaterai`, `g9refraktor`, `g9kuilalien`, `g9reaktorbahan`, `g9sinyalkerucut`, `g9bintang`, `g9upgradekapal` | 7 |

**Aturan matematika generator soal:**
- Semua jawaban slider **harus bilangan bulat positif**.
- G7 BAB II: pola `p/q × n` dengan `n` kelipatan `q`.
- G7 BAB III: perbandingan senilai → hasil pembagian bulat.
- G8 BAB III (PLSV): bentuk `ax = c` atau `ax + b = c` → x bilangan bulat.
- G9 BAB I (SPLDV): eliminasi/substitusi → x bilangan bulat.
- G9 BAB II (Lingkaran): gunakan `π = 22/7`, jari-jari kelipatan 7.
- G9 BAB III: gunakan pool hardcoded dengan nilai integer terverifikasi.

### Mendaftarkan Game Baru
Setelah membuat file game, daftarkan di:
1. `src/screens/Grade7ZoneScreen.jsx` / `Grade8ZoneScreen.jsx` / `Grade9ZoneScreen.jsx` (katalog & tampilan)
2. `server/tournament-questions.js` — tambahkan generator ke objek `generators` (jawaban harus integer)
3. `src/gamesCatalog.js` — tambahkan key ke `DUEL_GAME_KEYS`
4. `server/moba/socket-handlers.js` — tambahkan key ke `GAME_KEY_TO_BAB`
5. `src/features/moba/MobaQuestionModal.jsx` — tambahkan entry ke `GAME_INFO` (emoji, label, color)

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
| MOBA | `moba:join`, `moba:snapshot`, `moba:move`, `moba:question_opened`, `moba:answer`, `moba:scroll_claimed`, `moba:player_stunned`, `moba:player_update`, `moba:match_end` | Mode multiplayer 2D (lihat §21) |

### Aturan Multiplayer
- State lobby/room disimpan **in-memory** (Map) — tidak persisten antar restart server.
- Soal turnamen di-generate oleh `tournament-questions.js` (server-authoritative).
- Pemenang turnamen wajib ditentukan server dari jumlah jawaban benar. Jika skor sama, gunakan total waktu respons yang dicatat server sejak soal dikirim sampai jawaban diterima sebagai tie-breaker; jangan gunakan skor atau waktu dari client.
- **Immunity Nananaga wajib server-authoritative:** server harus memverifikasi pemain sudah menjawab soal aktif dan jawaban terakhir salah, memastikan pemain adalah anggota room/match yang diminta, mengonsumsi token di state server, dan menolak klaim token paralel. Client tidak boleh mengurangi token sebelum ACK sukses.
- **Timer soal normal harus dibatalkan setelah klaim immunity sukses** agar tidak menimpa soal bonus; jika server menolak klaim, alur soal normal harus tetap berjalan.
- Handler `tournament:player-ready` wajib memvalidasi kepemilikan match sebelum `socket.join()`. Pada mode kelompok, klaim juru jawab hanya boleh dilakukan oleh anggota yang sudah tercatat join pada match tersebut.
- `tournament:player-ready` harus idempotent: reconnect atau refresh arena tidak boleh mengulang dari nol, mereset skor, atau membuat soal baru. Jika match sudah berjalan, server harus mengirim ulang soal aktif yang tersimpan.
- Jawaban Boss Raid harus dinormalisasi numerik di server (`Number(value) === Number(answer)`) agar string dari input UI dan nilai numerik memiliki perilaku yang sama.
- Hindari stale closure di komponen lobby — gunakan refs.
- Saat arena duel atau turnamen aktif, komponen pet mengambang harus disembunyikan agar tidak menutupi slider, tombol jawaban, atau area interaksi pertandingan.
- Event/listener arena harus dipasang sebelum mengirim event `player-ready`/join; soal aktif harus dapat dikirim ulang saat reconnect atau re-entry karena event Socket.io tidak persisten. UI wajib menampilkan status koneksi/error agar siswa tidak terlihat stuck tanpa penjelasan.
- Refresh atau disconnect dashboard guru tidak boleh memanggil pembatalan atau menghapus turnamen. Dashboard harus mengambil state aktif dari REST dan join ulang room Socket.io setelah reconnect. Pembatalan hanya terjadi melalui aksi batal eksplisit guru.
- Turnamen berstatus `finished` ditutup dari UI, bukan dihapus saat guru ingin membuat turnamen baru, agar riwayat dan hasil tetap tersimpan.

---

## 9. Sistem Pet

### Tipe Pet & Skin
| Pet | Skin Pool |
|-----|-----------|
| Tomi | Base + skin umum/langka/epic |
| Kelinsay | Base + skin umum/langka/epic |
| Monyang | Base + skin umum/langka/epic |
| KomoDIH | Pet dasar langka (sheet sprite khusus) |
| Nananaga | Skin khusus (sheet sprite terpisah, immunitas + koin & EXP booster) |

### Aturan Pet
- `hunger_map` menggunakan key **tipe pet** (tomi/kelinsay/monyang/komodih/nananaga), bukan skinId.
- Skin hewan memerlukan kepemilikan **base pet** sebelum bisa dibeli/diequip.
- Pet mati (`isDead=true`): siswa harus `POST /api/siswa/pet/revive` (300 koin) — tidak bisa diberi makan.
- Sprite sheet: 768×768, grid 6×6 (128×128/cell).
- Bonus per skin/pet didefinisikan di `server/pet-bonuses.js` dan di-mirror ke `src/petBonuses.js`.
- **KomoDIH:** pet dasar mandiri kategori langka dengan ID `pet_komodih`; memakai hunger key `komodih`, memberi `+15% EXP` dan `+10% durasi makanan`, tanpa bonus koin atau immunity.
- Kemampuan pet hanya boleh memengaruhi reward yang sudah ditentukan sistem (misalnya multiplier EXP atau durasi makanan); pet tidak boleh memberi jawaban atau mengubah skor akademik secara langsung.
- **Nananaga immunity:** Tidak diimplementasikan di file game — ditangani oleh `useSurvival` via CustomEvent `'nananaga-shield'`.
- `FloatingPet` **TIDAK dirender di manapun** — dihapus dari `App.jsx`. Pet hanya hidup di dalam ZonaDashboard (`MobileLandscapeDashboard`). Jangan kembalikan render `FloatingPet` ke `App.jsx` tanpa konfirmasi eksplisit.

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
| Dashboard Siswa (ZonaDashboard) | `src/components/MobileLandscapeDashboard.jsx` | Layout 3-kolom universal (semua device). Lihat §20 |
| Tugas / Assignment | `server/guru.js`, `server/siswa.js`, `TaskContext.jsx` | |
| Nilai / Scoring | `server/player.js`, `TaskResultScreen.jsx` | |
| Toko | `server/toko.js`, `ShopScreen.jsx`, `LandscapeTokoScreen.jsx` | |
| Pet | `server/pet.js`, `PetContext.jsx` | `FloatingPet.jsx` ada tapi tidak dirender |
| Arena (hub) | `src/screens/landscape/LandscapeArena.jsx` | 4 mode: Duel, Turnamen, Boss Raid, MOBA |
| Duel | `server/multiplayer.js`, `DuelKatakScreen.jsx`, `LobbyScreen.jsx` | |
| Boss Raid | `server/boss-state.js`, `BossRaidScreen.jsx` | |
| Turnamen | `server/tournament-*.js`, `TournamentMatchScreen.jsx` | |
| MOBA | `server/moba/`, `src/features/moba/` | Lihat §21 |
| Leaderboard | `server/papan-peringkat.js`, `LeaderboardScreen.jsx`, `LandscapeLeaderboard.jsx` | |
| Chat/Forum (siswa) | `server/komunikasi.js`, `CommunicationScreen.jsx`, `LandscapeChat.jsx` | **Hanya siswa & sisi siswa.** Guru tidak punya tab Chat di TOMAT — guru balas dari GuruEOB5 |
| Notifikasi | `server/notifications.js`, `AppNotificationBell` di `shared.jsx` | Mendukung field `source`: `'tomat'` atau `'blp'` — tampil sebagai pill badge di bell |
| Hafalan | `server/hafalan-*.js`, `HafalanScreen.jsx`, `LandscapeHafalan.jsx` | |
| Latihan Ujian | `src/screens/LatihanUjianScreen.jsx`, `LandscapeLatihanUjian.jsx` | Soal di `src/data/soalUjian.js` (ekspor `PAKET_UJIAN`) |
| Event Misi | `server/event-missions*.js` | |
| Badges | `server/lencana.js`, `BadgesScreen.jsx`, `LandscapeLencana.jsx` | |
| Profil | `server/auth.js`, `ProfileScreen.jsx`, `LandscapeProfil.jsx` | |
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
- Saat rilis baru: bump `version.js`, `android/app/build.gradle` (`versionName` dan `versionCode`), serta `android/app/src/main/AndroidManifest.xml` agar metadata APK konsisten.
- `versionCode` harus selalu naik untuk setiap APK yang didistribusikan; `versionName` mengikuti `APP_VERSION`.

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

## 21. MOBA — Mode Multiplayer 2D

> File server: `server/moba/` — file client: `src/features/moba/`

### Konsep
Mode permainan multiplayer 2D berbasis node soal di arena overhead-view. Format: 1v1 / 2v2 / 3v3 dengan pet siswa sebagai karakter. MOBA berjalan **berdampingan** dengan mode individu — jangan matikan mode individu saat MOBA aktif.

### File Utama
| File | Tanggung Jawab |
|------|----------------|
| `server/moba/match-manager.js` | State match in-memory; lifecycle absolute-timestamp; timer injectable untuk test |
| `server/moba/socket-handlers.js` | Adapter Socket.io → match-manager; bab-filtering dari `bab_locks` |
| `server/moba/questions.js` | `createCurriculumQuestionGenerator()` — ambil soal dari `tournament-questions.js` per game key |
| `server/moba/player-state.js` | Validasi & update state pemain; semua buff pet dihitung di sini |
| `server/moba/pet-effects.js` | `applyPetEffects(playerState)` — Kelinsay/Monyang/Tomi/Nananaga buff |
| `src/features/moba/MobaScreen.jsx` | Root MOBA (socket lifecycle, input handling, Team B direction flip) |
| `src/features/moba/MobaArena.jsx` | Canvas render arena (tile grid, pet sprites, node markers) |
| `src/features/moba/MobaQuestionModal.jsx` | Popup soal mini-game bertema per game key (`GAME_INFO` map) |
| `src/features/moba/moba.css` | Style MOBA (CSS classes untuk modal, timer bar, badge game) |
| `src/features/moba/MobaBattleLoader.jsx` | Loading gate sebelum masuk match (countdown + curriculum sync) |
| `src/features/moba/MobaArenaMap.jsx` | Render peta arena (river, lane, spawn points, deposit zones, library) |

### Arena & Tile Grid
- Dunia **8.000 × 8.000 unit**, tile **32 unit** → grid 250×250.
- Movement tetap **kontinu** dan **server-authoritative** (bukan tile-by-tile).
- Layout arena "Diagonal X": river (NW→SE), lane (NE→SW), Team A spawn bawah-kiri, Team B spawn atas-kanan.
- **Team B view di-flip 180° client-side** — koordinat dunia tetap sama di server.

### Movement & Direction Flip
- `sendMove(direction)` di `MobaScreen.jsx` menerapkan flip Team B **sebelum** mengirim ke server: `isTeamB ? { x: -direction.x, y: -direction.y } : direction`.
- `MobaArena.handleMove` meneruskan arah **tanpa perubahan** — flip sudah ditangani di `sendMove`.
- Mobile/tablet: analog joystick; laptop/desktop: tombol arah.

### Question Nodes & Mini-Game
- Node dibuat server-side, di-validate per arena, ada TTL, ada jarak interaksi, dan klaim bersifat **first-come-first-served** (sinkron).
- Server menyertakan `gameKey` dan `gameLabel` di payload `moba:question_opened`.
- Saat node diklaim, **movement diblokir** sampai soal dijawab atau timeout.
- Jawaban **benar** → `moba:scroll_claimed` → deposit zone → reward koin.
- Jawaban **salah** → `moba:player_stunned` → stun 3 detik.

### Bab Filtering (Matchmaking)
- `server/moba/socket-handlers.js` — `GAME_KEY_TO_BAB` memetakan **semua 53 game key** ke BAB I/II/III.
- `formMatchmakingGroup()` query `bab_locks` untuk grade **terendah** dalam group, lalu filter game key yang babnya terkunci.

### GAME_INFO di Modal
- `src/features/moba/MobaQuestionModal.jsx` punya map `GAME_INFO` dengan **53 entri** (emoji, label, accent color) untuk semua game key.
- Jika game key baru ditambahkan: wajib tambahkan ke `GAME_INFO`, `GAME_KEY_TO_BAB`, `DUEL_GAME_KEYS`, dan `generators` di `tournament-questions.js`.

### Rollout Gate
- `MOBA_ENABLED=true` env var mengaktifkan mode MOBA untuk semua.
- `MOBA_ALLOWED_STUDENT_IDS` (comma-separated) untuk allowlist demo.
- Perubahan env baru berlaku setelah **workflow server di-restart**.

### Reward & Settlement
- Hasil match final disimpan ke DB (idempotent).
- Reward pemenang: **1 koin per poin** yang dikumpulkan di deposit zone.
- Durasi match: **7 menit** (gelombang-2 soal mulai menit ke-5).
- Deposit box memiliki kapasitas tetap **100 poin**. Box yang selesai (`completed`) tidak lagi menjadi target setor dan memicu event `box_completed`.
- Pustaka tim terbuka setelah minimal satu box tim selesai. Setoran ke pustaka memakai multiplier server-authoritative **1,5×**, sebelum bonus Pet yang berlaku.
- Animasi sprite box bersifat diam secara default dan hanya diputar satu kali setelah setoran sukses; box selesai boleh tetap terlihat selama burst singkat sebelum dihapus dari arena.

---

## 17. BLP Harian — Aplikasi Terpisah

> ⚠️ **BLP Harian BUKAN bagian dari kode TOMAT.** BLP berjalan di server dan URL-nya sendiri. TOMAT hanya membuka URL BLP secara eksternal. **Jangan menambahkan server route `/api/blp/*` atau screen `src/screens/blp/` ke TOMAT.**

### Cara Akses dari TOMAT
- **AppSwitcher** (tab "BLP") → `IframeAppShell` → di web: coba iframe, timeout → tampil tombol "Buka Aplikasi ↗"; di APK: Capacitor Browser (Chrome Custom Tab)
- **HomeScreen** → kartu shortcut BLP → mekanisme sama via `onOpenApp`
- URL produksi BLP: `https://nswzqjz1jnr821kuh3s9aji1.157.10.161.229.sslip.io` (di-hardcode di `AppSwitcher.jsx` dan `IframeAppShell.jsx`)

### Shared Database
BLP dan TOMAT menggunakan **satu Neon database yang sama**. Tabel yang dibuat/dikelola TOMAT (`server/schema.js`) tetapi juga dipakai BLP:
- `gurus`, `students` — akun guru & siswa (shared identity)
- `blp_periods` — rentang hari aktif BLP per kelas per bulan
- `daily_records` — checklist harian siswa BLP
- `haid_periods` — data haid siswa

Perubahan pada tabel-tabel ini (schema, kolom) **berdampak ke BLP** — koordinasikan sebelum mengubah.

### Notifikasi Lintas Modul
- `server/notifications.js` — modul push notification (VAPID); `server/notifikasi.js` — API router `/api/notifikasi/*`
- Kolom `source` di tabel notifikasi mendukung `'tomat'` dan `'blp'`
- `AppNotificationBell` menampilkan pill per source: **BLP** (biru) dan **TOMAT** (hijau)
- Jangan tambahkan notif BLP dari server TOMAT kecuali dipicu oleh event yang memang terjadi di TOMAT (misal: siswa submit checklist via form TOMAT — tidak ada skenario seperti ini sekarang)

---

## 18. GURU (GuruEOB5) — Aplikasi Terpisah

> ⚠️ **GURU/EOB5 BUKAN bagian dari kode TOMAT.** Modul GURU berjalan di server dan URL-nya sendiri. TOMAT hanya membuka URL GURU secara eksternal. **Jangan menambahkan server route `/api/eob5/*` atau screen `src/screens/eob5/` ke TOMAT.**

### Cara Akses dari TOMAT
- **AppSwitcher** (tab "GURU", hanya untuk role guru) → `IframeAppShell` → mekanisme sama seperti BLP
- URL produksi GURU: `https://sfptjjfqgqidt4736qzont0l.157.10.161.229.sslip.io` (di-hardcode di `AppSwitcher.jsx` dan `IframeAppShell.jsx`)

### Dashboard Guru di TOMAT
`GuruDashboardScreen.jsx` adalah layar guru **khusus TOMAT** — bukan GuruEOB5. Berisi fitur:
- Manajemen tugas (`/api/guru/tugas`) — assign game ke kelas
- Kunci BAB per kelas
- Boss Raid management
- Turnamen
- Insight/analitik siswa (`/api/guru/insight/*`)
- Hafalan guru (`/api/guru/hafalan/*`)
- Komunikasi (inbox pesan dari siswa)

### Shared Database
GURU dan TOMAT menggunakan **satu Neon database yang sama**. Tabel yang di-manage `server/schema.js` TOMAT tetapi dipakai GURU:
- `gurus` — akun guru (shared identity)
- Tabel EOB5 yang di-`ALTER` via `ensureSchema()`: `subjects`, `tujuan_pembelajaran`, dll.
- **Jangan DROP atau RENAME** kolom tabel-tabel ini — app GURU standalone masih membaca dari sini.

### Aturan Keras (Warisan dari Saat GURU Masih Embedded)
1. Nama tabel **TANPA prefix `eob5_`** — ikuti skema lama app standalone.
2. Kolom kunci: `teacher_id` (bukan `guru_id`) di `subjects`, `journal_entries`, `tujuan_pembelajaran`, `prosem`; `created_by` (bukan `guru_id`) di `academic_calendars`.
3. Status absen: tabel `absensi` menyimpan `'alpha'` (ejaan lama); filter dengan `IN ('alpha', 'alpa')` saat query.

---

## 19. App Switcher & IframeAppShell

### AppSwitcher (`src/components/AppSwitcher.jsx`)
- Ditampilkan di `AppShell` header mobile dan desktop floating bar
- **Siswa:** tab TOMAT (aktif) + BLP (eksternal)
- **Guru:** tab TOMAT (aktif) + BLP (eksternal) + GURU (eksternal)
- Tab TOMAT → `onSwitch(tab)` → navigasi internal ke `homeScreen` (siswa: `'home'`, guru: `'guruDashboard'`)
- Tab BLP / GURU → `onOpenApp({ src, title })` → membuka `IframeAppShell`
- Palet warna: TOMAT = biru-ungu, BLP = hijau, GURU = amber-oranye

### IframeAppShell (`src/components/IframeAppShell.jsx`)
- **Di APK (Capacitor):** gunakan `@capacitor/browser` (di-alias ke `src/stubs/capacitor-browser.js` via `vite.config.js`) → Chrome Custom Tab dalam app, bukan browser eksternal. Event `browserFinished` → kembali ke TOMAT otomatis.
- **Di web:** coba iframe; timeout 12 detik → `BlockedState` (tampil tombol "Buka Aplikasi ↗" yang memanggil `openExternalUrl()`); error jaringan → `ErrorState`.
- `openExternalUrl()` (`src/openExternalUrl.js`): di Capacitor pakai `Browser.open({ presentationStyle: 'popover' })`; di web pakai `window.open`.
- **Jangan** gunakan dynamic import dengan string concatenation (`'@capacitor' + '/browser'`) — modul tidak akan ter-bundle → import gagal di APK → catch → kembali instan (berkedip). Selalu import statis dari alias.

---

---

## 20. ZonaDashboard — Beranda Siswa Baru

> `src/components/MobileLandscapeDashboard.jsx` adalah **beranda universal** siswa TOMAT. File ini menggantikan desain lama dan berlaku untuk **semua device** (desktop, mobile landscape, portrait).

### Layout
```
┌──────────────────────── ZONA ATAS (header bar) ───────────────────────────┐
│  Avatar + Nama │    XP Bar (flex-grow)    │  Koin  🔔  ⚙️              │
├──────────────────┬─────────────────────────┬──────────────────────────────┤
│  ZONA KIRI       │     ZONA TENGAH          │  ZONA KANAN                  │
│  - Event Banner  │  - Sapaan               │  - ➕ Zona Matematika        │
│  - Tugas Aktif   │  - Pet (PetSVG)         │  - 🧪 Zona IPA              │
│  - Quick Links   │  - Hunger bar           │  - ⚔️ Arena Tanding (LIVE)  │
│                  │  - Feed / Shop btn      │                               │
│                  │  ─────────────────────  │                               │
│                  │  Chat preview + nav bar  │                               │
└──────────────────┴─────────────────────────┴──────────────────────────────┘
```

### Aturan Penting
- **`HomeScreen.jsx`** tidak lagi mengecek `isDesktop` untuk siswa — kondisinya hanya `!guruMode && user?.role === 'siswa'`. Seluruh siswa langsung mendapat `MobileLandscapeDashboard`.
- **Background:** `public/wallpaper-dashboard.png` — `center 72% / cover` + dark gradient wash. Jangan ganti nilai `72%` tanpa cek visual; nilai ini mengekspos cobblestone plaza di bawah pet.
- **Pet:** dirender via `<PetSVG size={110} />` di dalam dashboard, tanpa animasi float (grounded). `FloatingPet` tidak dirender.
- **SeasonalEventBanner:** dirender di zona kiri, di atas task card. Prop: `onOpenEventShop`.
- **Arena button:** selalu `navigate('arena')` — tidak perlu cek `canUseDemoMoba` lagi.
- **AppShell chrome:** `isZonaDashboard = user?.role === 'siswa'` — sidebar, AppSwitcher, mobile header, bottom nav SEMUA disembunyikan untuk siswa di SEMUA screen (bukan hanya home).
- **Landscape router universal:** `App.jsx` landscape router block tidak lagi gated oleh `isLandscapeMobile` — berlaku untuk semua device. `useLandscapeMobile` hook tidak dipakai di `App.jsx`. CSS responsive variables (`--ls-text-*`, `--ls-gap`, dll.) diinjeksi di App.jsx wrapper untuk siswa.
- **Zona Kanan (3 pintu):** grade zone ditentukan dari `user.kelas` (parse angka 7/8/9) → ID zone `grade7/8/9` dan `ipa7/8/9`.
- **Responsive:**
  - Desktop (≥1024px): kolom lebih lebar (200px kiri/kanan).
  - Landscape compact (height < 430px): sapaan dan beberapa elemen disembunyikan.
  - Portrait mobile: stack vertikal; bottom nav bar fixed di bawah.

### Context & Data yang Dipakai
| Prop | Sumber |
|------|--------|
| `player.coins`, `player.level`, `player.exp` | `PlayerContext` via `HomeScreen` |
| `pet.skin`, `pet.hunger`, `pet.isDead` | `PetContext` via `HomeScreen` |
| `nextTask` | `TaskContext` |
| `pendingTaskCount` | `TaskContext` |
| `user` | `AuthContext` |

### Landscape Screens (src/screens/landscape/)
Ke-11 screen landscape hanya dipakai saat `isLandscapeMobile = true` (hook `useLandscapeMobile`). Di desktop, route normal (non-landscape) digunakan.

| Route | Komponen Landscape |
|-------|--------------------|
| `grades` | `LandscapeNilaiTugas.jsx` |
| `papanperingkat` | `LandscapeLeaderboard.jsx` |
| `arena` | `LandscapeArena.jsx` |
| `grade7/8/9` | `LandscapeZonaMap.jsx` |
| `ipa7/8/9` | `LandscapeZonaIPA.jsx` |
| `lencana` | `LandscapeLencana.jsx` |
| `profile` | `LandscapeProfil.jsx` |
| `komunikasi` | `LandscapeChat.jsx` |
| `hafalan` | `LandscapeHafalan.jsx` |
| `latihan-ujian` | `LandscapeLatihanUjian.jsx` |
| `toko` | `LandscapeTokoScreen.jsx` |

---

*Terakhir diperbarui: 9 Agustus 2026 — §21 ditambahkan: MOBA mode multiplayer 2D (match manager, socket contract, arena map, question nodes, bab filtering, GAME\_KEY\_TO\_BAB, rollout gate). §7 diperbarui: tabel 53 game key per BAB yang sudah mendukung Duel/Turnamen/MOBA, aturan matematika generator soal, dan checklist 5 file wajib saat mendaftarkan game baru. §8 diperbarui: event MOBA. §12 diperbarui: baris MOBA. Update file ini setiap kali ada perubahan arsitektur signifikan.*
