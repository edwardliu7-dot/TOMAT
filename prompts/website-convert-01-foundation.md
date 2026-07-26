# TOMAT — Konversi WebApp ke Website · Sesi 1: Fondasi & Shell

## Konteks Proyek

TOMAT (Tantangan Otak Matematika) adalah platform gamifikasi matematika untuk SMP. Saat ini berupa **webapp mobile-first** dengan lebar konten maksimum 800px. Tugas sesi ini adalah membangun **fondasi layout desktop** — CSS system, komponen shell sidebar, dan konversi layar utama (Login + Home).

Sesi-sesi berikutnya (02, 03, 04) akan menggunakan komponen yang dibuat di sesi ini sebagai dasar.

---

## Prinsip Desain Website

Ubah dari pola webapp ke website dengan prinsip berikut:

- **Layout**: Sidebar kiri permanen (lebar 220px) di ≥ 1024px; top bar tetap di < 1024px (mobile fallback tetap berfungsi)
- **Konten**: Lebar maksimum konten menjadi 1200px; gunakan grid multi-kolom untuk layar yang kaya data
- **Warna**: Pertahankan palet gelap yang sudah ada (`#0F1115`, `#1A1D27`, aksen indigo/cyan/amber)
- **Font**: Tetap Inter; ukuran minimum body 14px di desktop
- **Hover states**: Semua tombol/card interaktif harus punya `transition` dan efek hover yang jelas
- **Mobile fallback**: Semua perubahan harus tetap fungsional di viewport 390px (gunakan media query)

---

## Tugas Sesi 1

### 1. Update `index.html` — CSS Variables & Global Styles

Ganti semua CSS variable di `<style>` dalam `<head>` dengan yang baru:

```css
:root {
  /* Layout */
  --sidebar-w: 0px;
  --shell-max: 100%;
  --content-max: 480px;
  --page-pad: 16px;
  --fs-scale: clamp(0.82, 2.8vw, 1);
}
@media (min-width: 540px) {
  :root { --content-max: 540px; --fs-scale: 1; }
}
@media (min-width: 768px) {
  :root { --content-max: 720px; --page-pad: 24px; }
}
@media (min-width: 1024px) {
  :root {
    --sidebar-w: 220px;
    --content-max: 860px;
    --page-pad: 32px;
  }
}
@media (min-width: 1280px) {
  :root { --content-max: 1000px; }
}
@media (min-width: 1440px) {
  :root { --content-max: 1100px; }
}
```

Tambahkan global CSS tambahan:
```css
/* Sidebar offset untuk konten utama */
.with-sidebar { margin-left: var(--sidebar-w); transition: margin-left 0.2s; }

/* Hover utility */
.btn-hover { transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s; }
.btn-hover:hover { opacity: 0.88; transform: translateY(-1px); }

/* Card hover */
.card-hover { transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s; }
.card-hover:hover { border-color: rgba(99,102,241,0.4) !important; box-shadow: 0 8px 24px rgba(0,0,0,0.3); transform: translateY(-2px); }

/* Scrollbar yang lebih tipis */
::-webkit-scrollbar { width: 5px; height: 5px; }
```

---

### 2. Buat `src/components/Sidebar.jsx` — Komponen Baru

Buat file baru. Sidebar ini ditampilkan **hanya di ≥ 1024px** (gunakan CSS media query atau window.innerWidth + resize listener).

Props: `{ user, navigate, currentScreen, onLogout }`

Struktur sidebar:
```
┌─────────────────────────┐
│  🍅 TOMAT               │  ← Logo + nama app (padding-top 20px)
│  Tantangan Otak Mat.    │
├─────────────────────────┤
│  [Avatar] Nama Siswa    │  ← Avatar kecil 32px + nama user
│  Kelas VII Al-Kindi     │  ← kelas user, font kecil abu
├─────────────────────────┤
│  NAVIGASI               │  ← label section (font 10px, tracking)
│  🏠 Beranda             │  ← nav items (lihat daftar di bawah)
│  🎮 Zona Belajar        │
│  📊 Nilai & Tugas       │
│  🏆 Papan Peringkat     │
│  🛒 Toko                │
│  🏅 Lencana             │
│  💬 Chat                │
├─────────────────────────┤
│  AKUN                   │
│  👤 Profil              │
│  🚪 Keluar              │  ← trigger logout
└─────────────────────────┘
```

Navigasi item yang memetakan ke screen key:
- Beranda → `home`
- Zona Belajar → tergantung grade user (grade7/grade8/grade9 — deteksi dari `user.kelas`)
- Nilai & Tugas → `grades`
- Papan Peringkat → `leaderboard`
- Toko → `shop`
- Lencana → `badges`
- Chat → `communication`
- Profil → `profile`

Style tiap nav item:
- Height: 44px, padding: 0 16px, border-radius: 10px, display flex + align-items center, gap: 12px
- Default: background transparent, color #94A3B8
- Active (currentScreen === key): background rgba(99,102,241,0.12), color #fff, font-weight 600, border-left 3px solid #6366F1
- Hover: background rgba(255,255,255,0.05)

Style sidebar keseluruhan:
```jsx
{
  position: 'fixed', top: 0, left: 0,
  width: 220, height: '100vh',
  background: '#111318',
  borderRight: '1px solid rgba(255,255,255,0.07)',
  display: 'flex', flexDirection: 'column',
  padding: '20px 12px',
  zIndex: 100,
  overflowY: 'auto',
}
```

Sidebar **tidak ditampilkan** jika:
- `window.innerWidth < 1024` (gunakan state + resize listener dengan cleanup)
- User belum login (user === null)
- Screen aktif adalah game (screen key bukan salah satu dari: home, grade7, grade8, grade9, grades, leaderboard, shop, badges, communication, profile, guruDashboard)

Untuk **guru**: ganti nav items dengan:
- 🏠 Dashboard → `guruDashboard`
- 📋 Tugas → tab Tugas di dashboard (navigate ke guruDashboard dengan state tab)
- 👥 Pantau Kelas → tab Pantau
- 📊 Nilai Siswa → tab Nilai
- 🎯 Hafalan → `guruHafalan`

---

### 3. Buat `src/components/AppShell.jsx` — Komponen Baru

Wrapper yang menggabungkan Sidebar + konten utama.

```jsx
// src/components/AppShell.jsx
// Wrapper yang menambahkan sidebar di kiri dan offset konten di kanan
// Props: { user, navigate, currentScreen, onLogout, children }
```

- Render `<Sidebar>` di luar children
- Bungkus children dalam `<div className="with-sidebar">` agar tergeser ke kanan saat sidebar muncul
- Di mobile (< 1024px): tidak ada offset, sidebar tersembunyi

---

### 4. Update `src/App.jsx` — Gunakan AppShell

- Import `AppShell` dari `./components/AppShell`
- Bungkus hasil `renderScreen()` dengan `<AppShell>`, passing props yang diperlukan
- `currentScreen` = screen key saat ini dari history stack
- Pastikan game screens (dari `GAME_ROUTES`) **tidak** mendapat sidebar (cek apakah key ada di GAME_ROUTES)
- Sidebar disembunyikan otomatis saat di game screen (logika sudah ada di Sidebar.jsx)

---

### 5. Redesign `src/screens/LoginScreen.jsx` — Desktop Split-Screen

Ubah layout login menjadi **dua kolom** di desktop:

**Kiri (40% lebar)** — Branding panel:
```
Background: linear-gradient(160deg, #0F1115 0%, #1a1040 100%)
Border-right: 1px solid rgba(255,255,255,0.07)

Konten (center vertikal):
  🍅 [Logo 80px]
  "TOMAT"  (font 36px, weight 900, gradient text indigo→purple)
  "Tantangan Otak Matematika"  (14px, #94A3B8)
  
  [Gap 40px]
  
  Tiga feature bullets:
  ✦ Gamifikasi Matematika SMP
  ✦ Duel & Turnamen Real-time
  ✦ Sistem Reward & Leaderboard
  
  [Bottom]
  "SMP TISA Islamic School · v2.0"  (12px, #475569)
```

**Kanan (60% lebar)** — Form login:
```
Background: #111318
Padding: 48px

Judul: "Masuk ke Akun"  (24px, weight 800)
Sub: "Pilih peranmu dan masuk"  (14px, #94A3B8)

[Form yang sudah ada — pertahankan logika, perbaiki style]
- Role selector (Siswa/Guru) jadi dua card besar horizontal
- Input username dan password dengan label
- Tombol masuk yang lebih besar (height 52px)
```

Di mobile (< 768px): kembali ke layout single-column yang ada (sembunyikan panel kiri, tampilkan form full-width).

**Jangan ubah logika auth sama sekali** — hanya ubah JSX/style.

---

### 6. Redesign `src/screens/HomeScreen.jsx` — Desktop Dashboard

Ubah HomeScreen menjadi layout desktop yang lebih kaya.

**Layout desktop (≥ 1024px):**

```
┌────────────────────────────────────────────────────────────────┐
│  PlayerHeader (tetap, tapi lebih lebar)                        │
├──────────────────────────┬─────────────────────────────────────┤
│  KOLOM KIRI (340px)      │  KOLOM KANAN (flex: 1)             │
│                          │                                     │
│  Card: Statistik Siswa   │  Zona Belajar (3 cards horizontal) │
│  - Level, XP, Koin       │  [Kelas 7] [Kelas 8] [Kelas 9]    │
│  - Progress bar XP       │                                     │
│                          │  Tugas Aktif (jika ada)            │
│  Card: Tugas Aktif       │  - List task cards                  │
│  (jika pendingTasks > 0) │                                     │
│                          │  Pintasan:                          │
│  Card: Shortcut          │  [Chat] [Toko] [Leaderboard]       │
│  [Toko] [Lencana]        │  [Lencana] [Profil]                │
│  [Chat] [Profil]         │                                     │
└──────────────────────────┴─────────────────────────────────────┘
```

Zone cards di kolom kanan: tampilkan secara **horizontal** (flex row, tidak vertikal stack seperti sekarang). Tiap card:
- Min-width: 240px, flex: 1
- Height: 180px
- Tampilkan emoji, judul zona, subtitle, jumlah misi
- Tombol "Masuk →" di bawah
- Locked zone: opacity 0.4, cursor not-allowed

Shortcut buttons di bawah zone cards: grid 4 kolom di desktop, tetap 2 kolom di mobile.

Di mobile (< 1024px): pertahankan layout single-column yang sudah ada.

---

## Hal yang TIDAK Boleh Diubah di Sesi Ini

- Semua file di `src/minigames/`
- Semua file di `server/`
- `src/AuthContext.jsx`, `src/PlayerContext.jsx`, `src/PetContext.jsx`, `src/TaskContext.jsx`
- `src/socket.js`, `src/gamesCatalog.js`
- Screen selain LoginScreen dan HomeScreen
- Logika navigasi (history stack) di App.jsx — hanya tambahkan AppShell wrapper

---

## Cara Verifikasi

Setelah selesai:
1. Restart workflow `TOMAT Web App`
2. Pastikan tidak ada error di console
3. Buka di viewport 1280px: sidebar harus muncul, konten tergeser ke kanan
4. Buka di viewport 390px: sidebar tersembunyi, tampilan mobile normal
5. Login sebagai siswa → HomeScreen tampil dua kolom di desktop
6. Login sebagai guru → Sidebar menampilkan menu guru

---

## File yang Dibuat/Diubah di Sesi Ini

| File | Status |
|------|--------|
| `index.html` | Diubah |
| `src/components/Sidebar.jsx` | **Baru** |
| `src/components/AppShell.jsx` | **Baru** |
| `src/App.jsx` | Diubah (wrapper saja) |
| `src/screens/LoginScreen.jsx` | Diubah |
| `src/screens/HomeScreen.jsx` | Diubah |
