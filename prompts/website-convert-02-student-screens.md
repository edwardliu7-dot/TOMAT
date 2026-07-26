# TOMAT — Konversi WebApp ke Website · Sesi 2: Layar Siswa

## Prasyarat

Sesi ini dimulai **setelah Sesi 1 selesai**. Komponen `Sidebar`, `AppShell`, dan CSS variables desktop sudah tersedia. Baca file-file berikut sebelum mulai:
- `src/components/Sidebar.jsx`
- `src/components/AppShell.jsx`
- `index.html` (CSS variables terbaru)
- `src/components/shared.jsx` (TopBar, Card, Btn, dll)

---

## Prinsip Umum untuk Semua Screen di Sesi Ini

Setiap screen mengikuti pola berikut di desktop (≥ 1024px):

```jsx
// Pola wrapper standar untuk screen konten
<div style={{ minHeight: '100vh', background: '#0F1115' }}>
  <TopBar title="..." onBack={goBack} />          {/* tetap ada untuk mobile */}
  <div style={{
    maxWidth: 'var(--content-max)',
    margin: '0 auto',
    padding: 'var(--page-pad)',
    paddingTop: 24,
  }}>
    {/* konten */}
  </div>
</div>
```

Di desktop, `TopBar` menjadi kurang penting (navigasi lewat sidebar), tapi tetap dirender untuk mobile fallback.

---

## Tugas Sesi 2

### 1. `src/screens/Grade7ZoneScreen.jsx` — Two-Column Layout

**Layout desktop (≥ 1024px):**

```
┌─────────────────────────────────────────────────────┐
│  Header: "Zona Kelas 7 · Lautan Dalam"  🌊          │
│  Subtitle, progress bar overall                      │
├───────────────────────┬─────────────────────────────┤
│  KOLOM KIRI (260px)   │  KOLOM KANAN (flex: 1)      │
│                       │                             │
│  Daftar BAB           │  Grid game cards            │
│  (vertical list)      │  (2 kolom → 3 kolom         │
│  ← klik bab filter    │   di ≥ 1280px)              │
│    konten kanan        │                             │
│                       │  Tiap card: emoji besar,    │
│  Tiap bab item:       │  nama game, status, tombol  │
│  - Nama BAB           │  "Mainkan" atau "Terkunci"  │
│  - Progress (X/Y)     │                             │
│  - Status badge       │                             │
└───────────────────────┴─────────────────────────────┘
```

Implementasi:
- Tambahkan state `selectedBab` (null = tampil semua)
- Kolom kiri: list semua BAB sebagai tombol filter dengan jumlah game dan progress
- Kolom kanan: grid game cards difilter berdasarkan `selectedBab`
- Game card di desktop: lebih lebar, tampilkan deskripsi singkat game (dari `gamesCatalog` atau hardcode deskripsi singkat per key)
- Di mobile (< 1024px): pertahankan layout existing (accordion/vertikal)

Lakukan hal yang sama untuk **`Grade8ZoneScreen.jsx`** dan **`Grade9ZoneScreen.jsx`** dengan struktur dan BAB yang sesuai.

---

### 2. `src/screens/ProfileScreen.jsx` — Desktop Profile Page

**Layout desktop (≥ 1024px):**

```
┌──────────────────────────────────────────────────────────┐
│  SECTION ATAS: Profile Hero                              │
│  [Foto/Avatar besar 96px] Nama · Kelas · Level           │
│  [Edit Foto] [Edit Profil]                               │
├────────────────────┬─────────────────────────────────────┤
│  KOLOM KIRI        │  KOLOM KANAN                        │
│  (300px)           │  (flex: 1)                          │
│                    │                                     │
│  Card: Statistik   │  Tab: [Ekuipmen] [Statistik Detail] │
│  - Level, XP       │                                     │
│  - Total Koin      │  Tab Ekuipmen:                      │
│  - Games Selesai   │    Grid item yang dipakai (bingkai, │
│  - Tugas Selesai   │    stiker, pet skin)                │
│                    │                                     │
│  Card: Biodata     │  Tab Statistik:                     │
│  - Email           │    Bar chart horizontal per mapel   │
│  - WhatsApp        │    (atau simple stat cards)         │
│  - Kelas           │                                     │
└────────────────────┴─────────────────────────────────────┘
```

Di mobile: pertahankan layout vertikal existing.

---

### 3. `src/screens/ShopScreen.jsx` — Desktop Shop dengan Kategori Sidebar

**Layout desktop (≥ 1024px):**

```
┌──────────────────────────────────────────────────────────┐
│  Header: "Toko TOMAT" · Saldo: 💰 XXX Koin              │
├────────────────┬─────────────────────────────────────────┤
│  KATEGORI      │  GRID ITEM (3 kolom → 4 kolom ≥ 1280px)│
│  (200px)       │                                         │
│                │  Tiap item card:                        │
│  🐾 Pet Skins  │  - Gambar/emoji besar (80px)            │
│  🖼️ Bingkai    │  - Nama item                            │
│  🌟 Stiker     │  - Harga atau "Dimiliki"                │
│  🍖 Makanan    │  - Tombol Beli / Equip / Terkunci       │
│                │                                         │
│  [aktif item   │  Item yang dimiliki: border hijau       │
│   highlight]   │  Item terpasang: badge "Dipakai"        │
└────────────────┴─────────────────────────────────────────┘
```

Logika pembelian dan equip **tidak berubah** — hanya layout.

---

### 4. `src/screens/LeaderboardScreen.jsx` — Desktop Table View

**Layout desktop (≥ 1024px):**

Ubah dari card list menjadi **tabel yang proper**:

```
┌──────────────────────────────────────────────────────────┐
│  Tab: [Kelasku] [Kelas 8] [Kelas 9]                     │
│  Filter: Urutkan [EXP ▼] [Koin] [Misi Selesai]          │
├──────┬────────────────────────┬──────┬──────┬───────────┤
│  #   │  Siswa                 │  EXP │ Koin │  Misi     │
├──────┼────────────────────────┼──────┼──────┼───────────┤
│  🥇1 │  [Avatar] Nama Siswa   │ 4200 │  890 │  34       │
│  🥈2 │  [Avatar] Nama Siswa   │ 3800 │  720 │  29       │
│  ... │  ...                   │  ... │  ... │  ...      │
├──────┼────────────────────────┼──────┼──────┼───────────┤
│ ★ 12│  [Avatar] Kamu         │ 1200 │  340 │  12       │  ← row user sendiri, highlight
└──────┴────────────────────────┴──────┴──────┴───────────┘
```

Row user sendiri selalu ditampilkan di bawah tabel meski tidak di top 10 (sticky row highlight).

Kolom tabel:
- `#` (rank) — 48px
- Siswa (avatar 32px + nama) — flex
- EXP — 80px, text-align right
- Koin — 80px
- Misi — 80px

Di mobile: pertahankan card list existing.

---

### 5. `src/screens/BadgesScreen.jsx` — Desktop Grid

**Layout desktop:**

```
┌──────────────────────────────────────────────────────────┐
│  Header: "Lencana Prestasi"                             │
│  Sub: "X dari Y lencana diraih"  [progress bar overall]  │
├──────────────────────────────────────────────────────────┤
│  Filter: [Semua] [Diraih] [Belum Diraih]                │
├──────────────────────────────────────────────────────────┤
│  Grid 4 kolom (desktop) / 2 kolom (mobile)               │
│                                                          │
│  Tiap card:                                              │
│  [Emoji besar 48px]                                      │
│  Nama lencana                                            │
│  Deskripsi singkat (2 baris, clamp)                      │
│  [Tanggal diraih] atau [🔒 Belum diraih]                │
└──────────────────────────────────────────────────────────┘
```

Lencana belum diraih: tampilkan dengan opacity 0.35 dan grayscale filter.

---

### 6. `src/screens/GradesScreen.jsx` — Desktop Data Table

**Layout desktop:**

```
┌──────────────────────────────────────────────────────────┐
│  Header: "Nilai & Tugas"                                 │
│  Summary bar: Rata-rata: 84.2 · Selesai: 12 · Aktif: 3  │
├──────────────────────────────────────────────────────────┤
│  Tab: [Tugas Selesai] [Tugas Aktif] [Nilai Per Game]    │
├──────────────────────────────────────────────────────────┤
│  Tab Tugas Selesai — tabel:                              │
│  [Game] [Nilai] [Tanggal] [Waktu Selesai] [Status]       │
│                                                          │
│  Tab Nilai Per Game — bar chart horizontal sederhana     │
│  atau grid kartu per game dengan nilai tertinggi         │
└──────────────────────────────────────────────────────────┘
```

---

### 7. `src/screens/CommunicationScreen.jsx` — Desktop Chat Layout

Ini adalah perubahan **paling signifikan** di sesi ini. Ubah menjadi layout chat desktop klasik.

**Layout desktop (≥ 1024px):**

```
┌──────────────────────────────────────────────────────────┐
│  Tab: [💬 Chat Pribadi] [📢 Forum Kelas]                 │
├────────────────┬─────────────────────────────────────────┤
│  DAFTAR        │  AREA CHAT AKTIF                        │
│  PERCAKAPAN    │                                         │
│  (280px)       │  [Header: Nama lawan chat]              │
│                │                                         │
│  Tiap item:    │  [Bubble messages — scroll]             │
│  - Avatar      │                                         │
│  - Nama        │  [Input bar bawah]                      │
│  - Preview     │  [Input teks]  [Kirim →]                │
│  - Waktu       │                                         │
│  - Unread dot  │                                         │
│                │                                         │
│  [+ Mulai Chat]│                                         │
└────────────────┴─────────────────────────────────────────┘
```

Untuk Forum Kelas: layout serupa, kolom kiri = daftar forum/kelas, kolom kanan = thread forum.

State management (siapa yang sedang di-chat, daftar percakapan, dll) **tidak berubah** — hanya layout.

Di mobile (< 1024px): pertahankan flow existing (layar list → layar chat terpisah via navigate).

---

### 8. `src/screens/PublicProfileScreen.jsx` — Desktop Profil Publik

Layout sederhana dua kolom:
- Kiri: foto, nama, kelas, tombol Duel
- Kanan: statistik publik (level, misi selesai, lencana yang dipamerkan)

---

## File yang Dibuat/Diubah di Sesi Ini

| File | Status |
|------|--------|
| `src/screens/Grade7ZoneScreen.jsx` | Diubah |
| `src/screens/Grade8ZoneScreen.jsx` | Diubah |
| `src/screens/Grade9ZoneScreen.jsx` | Diubah |
| `src/screens/ProfileScreen.jsx` | Diubah |
| `src/screens/ShopScreen.jsx` | Diubah |
| `src/screens/LeaderboardScreen.jsx` | Diubah |
| `src/screens/BadgesScreen.jsx` | Diubah |
| `src/screens/GradesScreen.jsx` | Diubah |
| `src/screens/CommunicationScreen.jsx` | Diubah |
| `src/screens/PublicProfileScreen.jsx` | Diubah |

## Hal yang TIDAK Boleh Diubah

- Semua logika fetch API, socket, dan state management
- Semua file di `src/minigames/`
- Semua file di `server/`
- Context files (AuthContext, PlayerContext, PetContext, TaskContext)
- `src/components/Sidebar.jsx` dan `AppShell.jsx` (sudah selesai di Sesi 1)

## Cara Verifikasi

1. Setiap screen yang diubah: cek di 1280px (desktop) dan 390px (mobile)
2. Tidak ada error TypeScript/React di console
3. Fungsionalitas (beli item, kirim chat, filter leaderboard) tetap bekerja
4. Sidebar tetap tampil dan highlight nav item yang sesuai
