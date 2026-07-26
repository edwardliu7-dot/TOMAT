# TOMAT — Konversi WebApp ke Website · Sesi 4: Polish & Finalisasi

## Prasyarat

Sesi ini dimulai **setelah Sesi 1, 2, dan 3 selesai**. Ini adalah sesi finalisasi — tidak ada screen baru yang dikonversi, fokus pada kualitas dan konsistensi. Baca semua file yang disebutkan di bawah sebelum mulai.

---

## Gambaran Sesi Ini

Sesi 4 mencakup:
1. Wrapper minigame untuk pengalaman desktop yang lebih baik
2. Screen kecil yang tersisa (`TaskResultScreen`)
3. Repositioning FloatingPet (Tomi) untuk desktop
4. Hover states global di semua komponen shared
5. Keyboard navigation & aksesibilitas dasar
6. Responsive QA pass — perbaiki masalah layout yang ditemukan di Sesi 1–3
7. Favicon, meta tags, dan tab title yang lebih proper untuk website

---

## Tugas Sesi 4

### 1. Minigame Desktop Wrapper

Semua minigame di `src/minigames/` menggunakan `minHeight: '100vh'` dan layout mobile. Di desktop, game tetap dimainkan dalam **centered container** — tidak perlu mengubah game logic atau layout internal game.

Buat komponen baru: **`src/components/GameDesktopWrapper.jsx`**

```jsx
// Wrapper yang menampilkan game dalam area centered di desktop.
// Di mobile (< 768px): tidak ada efek, children dirender penuh.
// Di desktop: game dirender dalam kotak centered 480px dengan backdrop.
//
// Props: { children, gameTitle, gameEmoji, onExit }
```

Layout desktop:
```
┌─────────────────────────────────────────────────────────────────┐
│  Backdrop: #0A0B14 dengan subtle noise pattern atau grid faint  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  [← Keluar]  🎮 [gameEmoji] [gameTitle]              │      │
│  │  ─────────────────────────────────────────────────   │      │
│  │                                                       │      │
│  │  [children — game content, max-width 480px]          │      │
│  │                                                       │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Container inner game:
```js
{
  width: '100%',
  maxWidth: 480,
  minHeight: '100vh',  // game tetap full height di dalam container
  background: 'inherit',
  margin: '0 auto',
  position: 'relative',
}
```

Update `src/App.jsx`:
- Saat merender game dari `GAME_ROUTES`, bungkus dengan `<GameDesktopWrapper>` jika `window.innerWidth >= 768`
- Pass `gameTitle` dan `gameEmoji` dari `GAME_ROUTES[key].name` dan `.emoji`
- `onExit` memanggil `goBack()`

---

### 2. `src/screens/TaskResultScreen.jsx` — Desktop Result Card

Ubah dari full-screen vertikal menjadi **centered card** di desktop:

```
Backdrop: #0A0B14, full viewport

┌──────────────────────────────────────────┐
│  [emoji hasil: 🏆/🎖️/📝]                 │
│  "Misi Selesai!" atau "Tugas Selesai!"   │
│  ──────────────────────────────────────  │
│  Nilai: 92          Benar: 9/10          │
│  XP: +180           Koin: +45            │
│  ──────────────────────────────────────  │
│  [Bar per soal — benar/salah]            │
│  ──────────────────────────────────────  │
│  [Kembali ke Menu]   [Mainkan Lagi]      │
└──────────────────────────────────────────┘
```

Card: `maxWidth: 480px, margin: '0 auto', borderRadius: 24px, background: #1A1D27, border: 1px solid rgba(255,255,255,0.1), padding: 32px`

Di mobile: pertahankan full-screen existing atau gunakan card dengan padding lebih kecil.

---

### 3. FloatingPet (`src/components/FloatingPet.jsx`) — Repositioning Desktop

Saat ini FloatingPet muncul di posisi yang bisa mengganggu konten di desktop (karena konten melebar).

Update posisi FloatingPet:
- Di mobile (< 1024px): posisi existing (bottom-right dengan offset kecil)
- Di desktop (≥ 1024px): 
  - Posisi: `bottom: 32px, right: 32px` (fixed, di luar sidebar area)
  - Pastikan tidak overlap dengan sidebar global (sidebar ada di kiri, bukan kanan — aman)
  - Ukuran sedikit lebih besar di desktop: scale 1.1

---

### 4. Hover States Global — `src/components/shared.jsx`

Audit semua komponen di `shared.jsx` dan tambahkan hover states yang konsisten:

**`Btn` component**: Tambahkan CSS `transition: all 0.15s` dan `onMouseEnter/Leave` state untuk `opacity: 0.85` + `transform: translateY(-1px)` saat hover.

**`Card` component**: Jika interaktif (ada `onClick`), tambahkan hover: `box-shadow` lebih kuat, `border-color` lebih terang.

**`TopBar`**: Di desktop (≥ 1024px), buat TopBar lebih tipis (height 52px alih-alih 64px) karena navigasi utama ada di sidebar. Pertahankan back button dan title.

**`UserAvatar`**: Jika ada `onClick`, tambahkan hover ring (border 2px indigo saat hover).

---

### 5. Keyboard Navigation Dasar

Tambahkan keyboard support minimal untuk aksesibilitas:

- **Escape key**: Di semua modal/overlay (bottom sheet, dialog), `Escape` menutup modal. Tambahkan `useEffect` dengan `keydown` listener di komponen modal.
- **Enter key**: Semua form dengan satu input utama (login, kode lobby) sudah support Enter — verifikasi ini berfungsi.
- **Tab order**: Pastikan elemen interaktif utama bisa di-tab di layar login dan lobby.

Cukup tiga hal di atas — tidak perlu full ARIA implementation.

---

### 6. Responsive QA Pass

Buka setiap screen dan perbaiki masalah layout yang mungkin timbul dari Sesi 1–3. Hal yang paling sering bermasalah:

**Overflow horizontal**: Cek tidak ada elemen yang keluar dari viewport di 390px. Gunakan `overflow: hidden` atau `width: 100%` di container yang bermasalah.

**Sidebar overlap**: Di 1024px tepat, pastikan konten tidak tertimpa sidebar (test di viewport 1024px persis).

**Font terlalu kecil di desktop**: Cek semua label/caption (< 12px) masih terbaca di 1440px.

**Grid breakpoints**: Screen yang menggunakan grid (ShopScreen, BadgesScreen, ZoneScreen) harus smooth dari 1 kolom → 2 kolom → 3/4 kolom.

**Fix spesifik yang perlu dicek:**
```
LoginScreen     — form tidak terlalu lebar di 1440px (max 560px untuk form kanan)
HomeScreen      — zone cards tidak collapse di 768px-1024px range
LeaderboardScreen — tabel tidak overflow di 390px (scroll horizontal table)
CommunicationScreen — panel list tidak terlalu sempit di 1024px tepat
GuruDashboardScreen — sidebar internal + sidebar global tidak overlap
```

---

### 7. Meta Tags & Tab Title untuk Website

Update `index.html`:

```html
<!-- SEO & Social meta -->
<meta name="description" content="TOMAT - Platform gamifikasi matematika SMP dengan duel real-time, turnamen, dan sistem reward." />
<meta name="theme-color" content="#0F1115" />
<meta property="og:title" content="TOMAT — Tantangan Otak Matematika" />
<meta property="og:description" content="Belajar matematika SMP dengan cara yang menyenangkan. Duel teman, ikut turnamen, kumpulkan reward!" />
<meta property="og:type" content="website" />

<!-- Apple/PWA -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="TOMAT" />
```

Update `src/App.jsx` untuk mengubah `document.title` berdasarkan screen aktif:
```js
// Map screen key ke judul tab
const SCREEN_TITLES = {
  home: 'Beranda',
  grade7: 'Zona Kelas 7',
  grade8: 'Zona Kelas 8',
  grade9: 'Zona Kelas 9',
  shop: 'Toko',
  leaderboard: 'Papan Peringkat',
  badges: 'Lencana',
  grades: 'Nilai & Tugas',
  communication: 'Chat',
  profile: 'Profil',
  guruDashboard: 'Dashboard Guru',
}

// Di dalam useEffect atau renderScreen:
document.title = currentScreen && SCREEN_TITLES[currentScreen]
  ? `${SCREEN_TITLES[currentScreen]} — TOMAT`
  : 'TOMAT — Tantangan Otak Matematika'
```

---

### 8. `src/components/shared.jsx` — Komponen `PageLayout` Baru

Tambahkan komponen helper `PageLayout` untuk menyederhanakan screen yang belum menggunakannya:

```jsx
// PageLayout — wrapper standar untuk semua content screens
// Props: { title, onBack, children, maxWidth, noPad }
export function PageLayout({ title, onBack, children, maxWidth, noPad }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0F1115' }}>
      {onBack && <TopBar title={title} onBack={onBack} />}
      <div style={{
        maxWidth: maxWidth || 'var(--content-max)',
        margin: '0 auto',
        padding: noPad ? 0 : 'var(--page-pad)',
        paddingTop: noPad ? 0 : 24,
      }}>
        {children}
      </div>
    </div>
  )
}
```

Jika ada screen dari Sesi 2–3 yang belum menggunakan pola ini, refactor untuk menggunakannya.

---

### 9. Verifikasi End-to-End

Lakukan uji coba lengkap sebelum menyatakan selesai:

**Sebagai Siswa:**
1. Login → HomeScreen tampil dua kolom di 1280px ✓
2. Buka Zona Kelas 7 → filter BAB berfungsi ✓
3. Mainkan satu game (contoh: Katak) → GameDesktopWrapper muncul, game playable ✓
4. Selesaikan game → TaskResultScreen muncul benar ✓
5. Buka Toko → grid item tampil, beli item berfungsi ✓
6. Buka Chat → layout split panel berfungsi ✓
7. Buka Leaderboard → tabel tampil benar ✓
8. Sidebar: semua nav link berfungsi ✓

**Sebagai Guru:**
1. Login → GuruDashboard dengan sidebar internal ✓
2. Buat tugas → form + list tugas aktif ✓
3. Pantau kelas → list siswa + detail panel ✓
4. Lihat nilai → tabel nilai ✓

**Responsive:**
1. Semua screen di 390px: tidak ada horizontal scroll yang tidak disengaja ✓
2. Semua screen di 768px: transisi dari mobile ke desktop layout smooth ✓
3. Semua screen di 1280px: sidebar muncul, konten tata letak dengan benar ✓

---

## File yang Dibuat/Diubah di Sesi Ini

| File | Status |
|------|--------|
| `src/components/GameDesktopWrapper.jsx` | **Baru** |
| `src/components/FloatingPet.jsx` | Diubah kecil (posisi desktop) |
| `src/components/shared.jsx` | Diubah (hover states, PageLayout) |
| `src/screens/TaskResultScreen.jsx` | Diubah |
| `src/App.jsx` | Diubah (GameDesktopWrapper, document.title) |
| `index.html` | Diubah (meta tags) |
| Screen-screen dari Sesi 2–3 yang butuh perbaikan | Diubah (bugfix) |

## Hal yang TIDAK Boleh Diubah

- Semua file di `src/minigames/` — internal game tidak disentuh sama sekali
- Semua file di `server/`
- Semua context files dan `src/socket.js`
- Logika auth, logika game, logika socket

---

## Catatan Akhir

Setelah Sesi 4 selesai, TOMAT sudah menjadi website yang proper dengan:
- ✅ Sidebar navigasi permanen di desktop
- ✅ Layout multi-kolom untuk semua screen utama
- ✅ Game tetap playable dalam centered wrapper
- ✅ Mobile fallback tetap berfungsi penuh
- ✅ Hover states dan interaksi desktop
- ✅ Meta tags dan tab titles proper
- ✅ Konsistensi visual di semua breakpoint
