# TOMAT — Konversi WebApp ke Website · Sesi 3: Dashboard Guru & Layar Kompetitif

## Prasyarat

Sesi ini dimulai **setelah Sesi 1 dan 2 selesai**. Baca terlebih dahulu:
- `src/components/Sidebar.jsx` dan `AppShell.jsx`
- `index.html` (CSS variables terbaru)
- `src/screens/GuruDashboardScreen.jsx` (panjang ~1600 baris — baca penuh sebelum mengedit)
- `src/screens/LobbyScreen.jsx`
- `src/screens/TournamentWaitScreen.jsx`
- `src/screens/TournamentMatchScreen.jsx`
- `src/screens/DuelKatakScreen.jsx`

---

## Tugas Sesi 3

### 1. `src/screens/GuruDashboardScreen.jsx` — Desktop Admin Panel

Ini adalah screen terpanjang dan terpenting untuk guru. Ubah dari tab vertikal mobile menjadi **admin panel desktop**.

**Layout desktop (≥ 1024px):**

```
┌──────────────────────────────────────────────────────────────────┐
│  TOPBAR: "Dashboard Guru" · Nama guru · [Logout]                 │
├────────────────────┬─────────────────────────────────────────────┤
│  SIDEBAR TAB       │  KONTEN TAB AKTIF                           │
│  (220px, kiri)     │  (flex: 1)                                  │
│                    │                                             │
│  📋 Kelola Tugas   │  [konten tab yang dipilih]                  │
│  👥 Pantau Kelas   │                                             │
│  📊 Nilai Siswa    │                                             │
│  ⚔️ Duel & Rank    │                                             │
│  🏆 Turnamen       │                                             │
│  📖 Hafalan        │                                             │
│                    │                                             │
│  ─────────────     │                                             │
│  Kelas:            │                                             │
│  [dropdown kelas]  │                                             │
└────────────────────┴─────────────────────────────────────────────┘
```

Sidebar tab ini adalah **sidebar internal** khusus GuruDashboard (berbeda dari Sidebar global). Implementasi:
- State `activeTab` sudah ada — gunakan untuk highlight sidebar internal
- Sidebar internal: background `#111318`, border-right `1px solid rgba(255,255,255,0.07)`, width 220px, fixed height 100% (overflow scroll jika perlu)
- Nav item active: background `rgba(99,102,241,0.12)`, color `#fff`, border-left `3px solid #6366F1`

**Tab "Kelola Tugas" — desktop:**

```
┌──────────────────────────────────────────────────────────────────┐
│  "Buat Tugas Baru"  [tombol +]                                   │
├────────────────────────────────┬─────────────────────────────────┤
│  FORM BUAT TUGAS               │  TUGAS AKTIF                    │
│  (show/hide dengan toggle)     │  (list cards)                   │
│                                │                                 │
│  [Kelas] [Game] [Bab]          │  Tiap card tugas:               │
│  [Jumlah Soal] [Batas Waktu]   │  - Nama game + kelas            │
│  [Submit Tugas]                │  - Progress (X/Y siswa)         │
│                                │  - Waktu tersisa                │
│                                │  - [Hapus] [Detail]             │
└────────────────────────────────┴─────────────────────────────────┘
```

**Tab "Pantau Kelas" — desktop:**

```
┌──────────────────────────────────────────────────────────────────┐
│  [Kelas selector dropdown di atas]                               │
├────────────────────────────────┬─────────────────────────────────┤
│  DAFTAR SISWA                  │  DETAIL SISWA TERPILIH          │
│  (280px)                       │  (klik siswa di kiri)           │
│                                │                                 │
│  Tiap row:                     │  Nama, Level, XP, Koin          │
│  [Avatar] Nama                 │  Progress per BAB               │
│  Level · Online/Offline        │  Riwayat tugas terakhir         │
│  [Progress bar mini]           │  Lencana diraih                 │
│                                │                                 │
│  [highlight siswa aktif]       │                                 │
└────────────────────────────────┴─────────────────────────────────┘
```

**Tab "Nilai Siswa" — desktop tabel:**

```
┌──────────────────────────────────────────────────────────────────┐
│  Filter: [Kelas] [Game] [Periode]  [Export CSV - jika ada]      │
├──────┬────────────┬────────────┬────────────┬────────────────────┤
│ Rank │ Siswa      │ Rata-rata  │ Selesai    │  Tugas Terakhir    │
├──────┼────────────┼────────────┼────────────┼────────────────────┤
│  1   │ [Nama]     │  92.4      │ 14/14      │  3 jam lalu        │
│  2   │ [Nama]     │  88.1      │ 12/14      │  Kemarin           │
└──────┴────────────┴────────────┴────────────┴────────────────────┘
```

Logika data, fetch, dan state **tidak berubah** — hanya layout.

Di mobile (< 1024px): pertahankan tab selector horizontal existing.

---

### 2. `src/screens/GuruHafalanScreen.jsx` — Desktop Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Header: "Pemantauan Hafalan"                                    │
├────────────────┬─────────────────────────────────────────────────┤
│  FILTER        │  TABEL HAFALAN                                  │
│  (200px)       │                                                 │
│                │  [Siswa] [Jenis Hafalan] [Status] [Tanggal]     │
│  Kelas:        │  ─────────────────────────────────────────      │
│  [dropdown]    │  rows...                                        │
│                │                                                 │
│  Status:       │  Klik row → expandable detail di bawah row      │
│  ○ Semua       │  atau side panel di kanan                       │
│  ○ Lulus       │                                                 │
│  ○ Belum       │                                                 │
└────────────────┴─────────────────────────────────────────────────┘
```

---

### 3. `src/screens/ModeSelectScreen.jsx` — Desktop Mode Cards

Ubah dari vertikal stack card menjadi **grid horizontal** di desktop.

**Layout desktop (≥ 768px):**

```
┌──────────────────────────────────────────────────────────────────┐
│  Header: "Pilih Mode — [Nama Game]"                             │
│  Deskripsi game singkat                                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [MODE MUDAH]   [MODE SEDANG]   [MODE SULIT]   [SURVIVAL]       │
│  Card lebar     Card lebar      Card lebar      Card lebar       │
│  160px min      dengan          dengan          dengan           │
│                 deskripsi       deskripsi       deskripsi        │
│                                                                  │
│  ─────── atau ───────────────────────────────────────────────   │
│                                                                  │
│  [MODE TUGAS ⚠️ Hanya jika ada tugas aktif]                     │
│  [MODE DUEL  ⚠️ Full width, amber accent]                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

Mode card tiap item:
- Padding 24px, border-radius 16px, cursor pointer
- Hover: transform translateY(-4px), box-shadow lebih kuat
- Icon besar di atas (48px emoji), nama mode, deskripsi singkat, tombol "Mulai"
- Disabled (locked): opacity 0.4, cursor not-allowed, overlay pesan

---

### 4. `src/screens/LobbyScreen.jsx` — Desktop Lobby

**Layout desktop (≥ 768px):**

```
┌──────────────────────────────────────────────────────────────────┐
│  Header: "Lobi Duel ⚔️"                                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Buat Ruangan]          [Masuk dengan Kode]                     │
│  Card kiri (flex: 1)     Card kanan (flex: 1)                    │
│                                                                  │
│  ⚔️ (icon besar)         [Input kode 6 digit]                   │
│  Buat Ruangan            [Tombol Bergabung]                      │
│  "Bagikan kode..."                                               │
│  [Tombol Buat →]                                                 │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  Pilih Game:                                                     │
│  Grid 3 kolom game cards (icon + nama)                           │
│  Selected: cyan border + background                              │
└──────────────────────────────────────────────────────────────────┘
```

Saat sudah membuat room dan menunggu lawan:
```
┌──────────────────────────────────────────────────────────────────┐
│  KODE RUANGAN:   ABC123                                          │
│  [Salin Kode]                                                    │
│                                                                  │
│  [Avatar kamu]   ⚔️   [??? Menunggu lawan]                      │
│  Namamu              Slot kosong                                  │
│                                                                  │
│  ⏳ Menunggu lawan bergabung...                                  │
│  [Batal]                                                         │
└──────────────────────────────────────────────────────────────────┘
```

---

### 5. `src/screens/TournamentWaitScreen.jsx` — Desktop Bracket View

**Layout desktop (≥ 1024px):**

```
┌──────────────────────────────────────────────────────────────────┐
│  Header: "🏆 [Nama Turnamen]" · Status badge LIVE/SELESAI        │
├──────────────────────────────────────────────────────────────────┤
│  Summary strip: [Game] [Peserta] [Ronde X/Y] [Status]           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BRACKET — tampilan per ronde secara HORIZONTAL dengan scroll    │
│                                                                  │
│  ┌─ Ronde 1 ──┐   ┌─ Ronde 2 ──┐   ┌─ Ronde 3 (Final) ─┐      │
│  │ A vs B  ✅  │ → │ A vs C  ⚡  │ → │ A vs D  🔒         │      │
│  │ C vs D  ✅  │   │ (berlangsung)│   │                   │      │
│  └────────────┘   └────────────┘   └────────────────────┘      │
│                                                                  │
│  Kamu di ronde ini: vs [Nama Lawan]  [Masuk Arena →]           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

Bracket kolom per ronde:
- Setiap ronde = kolom dengan `min-width: 200px`
- Kontainer: `display: flex, gap: 24px, overflowX: auto`
- Connector lines antar ronde: gunakan CSS pseudo-element atau SVG sederhana
- Match card: background card gelap, tampilkan dua pemain (nama + skor jika sudah selesai)
- Match berlangsung: highlight border cyan + badge "⚡ LIVE"
- Match menang: border hijau, nama pemenang bold

---

### 6. `src/screens/TournamentMatchScreen.jsx` — Desktop Split Game

**Layout desktop (≥ 768px):**

```
┌──────────────────────────────────────────────────────────────────┐
│  ScoreBar di atas: [Kamu: 3]  ─── SOAL 4/7 ───  [Lawan: 2]     │
├──────────────────────────────────────────────────────────────────┤
│  KOLOM KIRI (flex: 1)       │  KOLOM KANAN (flex: 1)            │
│                              │                                   │
│  Pertanyaan & Slider         │  Visualisasi real-time lawan      │
│  (yang sudah ada)            │  (slider posisi lawan, greyed)    │
│                              │                                   │
│  [Value badge besar]         │  Kamu: [progress bar soal]        │
│  [Slider]                    │  Lawan: [progress bar soal]       │
│  [Konfirmasi]                │                                   │
│                              │  Feedback animasi terakhir        │
│                              │  (✅ atau ❌)                     │
└──────────────────────────────┴───────────────────────────────────┘
```

Di mobile (< 768px): pertahankan layout vertikal existing.

---

### 7. `src/screens/DuelKatakScreen.jsx` — Desktop Duel Layout

**Layout desktop (≥ 768px):**

```
┌──────────────────────────────────────────────────────────────────┐
│  ScoreBar: [Kamu 🐸] ─── SOAL X/Y ─── [Lawan 🔥]               │
├──────────────────────────────────────────────────────────────────┤
│  KOLOM KIRI (flex: 1)       │  KOLOM KANAN (flex: 1)            │
│                              │                                   │
│  "Pertanyaan soal"           │  Visualisasi garis bilangan       │
│                              │  (frog + fire positions)          │
│  [Value badge]               │                                   │
│  [Slider input kamu]         │  Status lawan (answered/waiting)  │
│  [Konfirmasi]                │                                   │
│                              │  Timer countdown (jika ada)       │
└──────────────────────────────┴───────────────────────────────────┘
```

Di mobile: pertahankan layout vertikal existing.

---

### 8. `src/screens/BossRaidScreen.jsx` — Desktop Co-op View

**Layout desktop (≥ 768px):**

```
┌──────────────────────────────────────────────────────────────────┐
│  Boss HP bar (full width, merah → oranye → hijau)               │
│  "👹 Boss: [Nama]" · HP: 450 / 1000                            │
├──────────────────────────────────────────────────────────────────┤
│  KOLOM KIRI (flex: 2)       │  KOLOM KANAN (240px)              │
│                              │                                   │
│  Soal & Slider               │  Live Feed Serangan               │
│  (input area)                │  (list event: siapa menyerang,   │
│                              │   damage, cooldown)               │
│  Status serangan kamu        │                                   │
│  (cooldown timer)            │  Daftar peserta (avatar + HP      │
│                              │   kontribusi)                     │
└──────────────────────────────┴───────────────────────────────────┘
```

---

## File yang Dibuat/Diubah di Sesi Ini

| File | Status |
|------|--------|
| `src/screens/GuruDashboardScreen.jsx` | Diubah besar |
| `src/screens/GuruHafalanScreen.jsx` | Diubah |
| `src/screens/ModeSelectScreen.jsx` | Diubah |
| `src/screens/LobbyScreen.jsx` | Diubah |
| `src/screens/TournamentWaitScreen.jsx` | Diubah |
| `src/screens/TournamentMatchScreen.jsx` | Diubah |
| `src/screens/DuelKatakScreen.jsx` | Diubah |
| `src/screens/BossRaidScreen.jsx` | Diubah |

## Hal yang TIDAK Boleh Diubah

- Semua file di `src/minigames/`
- Semua file di `server/`
- Semua context files
- `src/socket.js`, logika socket di semua screen
- `src/components/Sidebar.jsx` dan `AppShell.jsx`

## Cara Verifikasi

1. GuruDashboard: login sebagai guru → cek 3 tab utama tampil benar di desktop
2. ModeSelect: buka game → pilih mode → semua mode tampil horizontal
3. Lobby: buka lobby → buat room → kode muncul, UI menunggu lawan
4. Tournament screens: tidak ada error saat render
5. Semua screen: mobile 390px tetap berfungsi normal
