---
name: TOMAT hafalan interaktif
description: HafalanScreen siswa — flash card dan kuis mandiri perkalian/pembagian, wired ke HomeScreen quick link dan App.jsx route 'hafalan'.
---

## Arsitektur
- `src/screens/HafalanScreen.jsx` — single file, internal view state: 'home' | 'detail' | 'flash' | 'kuis' | 'result'
- Route 'hafalan' ditambah ke App.jsx renderScreen dan SCREEN_TITLES
- Quick link 🧮 'Hafalan' ditambah ke HomeScreen quickLinks array (index pertama)
- Import HafalanScreen di App.jsx (non-lazy, file kecil)

## Data flow
- `GET /api/siswa/hafalan` dipanggil sekali saat mount → `hafalanStatus: { perkalian: {1:'lulus',...}, pembagian: {...} }`
- Status lulus/diulang hanya dari guru (formal setoran) — kuis mandiri tidak mengubah status ini
- Kuis & flash card sepenuhnya client-side; tidak ada route server baru

## Views
- **Home**: grid 5×2 per jenis (perkalian/pembagian), warna tile sesuai status
- **Detail**: 2 tombol besar (Flash Card / Kuis Mandiri) + preview soal
- **Flash Card**: 10 kartu berurutan, ketuk flip untuk reveal jawaban, navigasi prev/next + dots
- **Kuis Mandiri**: 10 soal diacak, numpad custom (0-9 + ⌫ + ✓), feedback 800ms, review salah di layar result
- **Result**: skor, reward koin, daftar soal yang salah

## Reward koin
- Kuis 10/10 → +30 koin, 9/10 → +15 koin, 8/10 → +15 koin
- Menggunakan `addCoins()` dari PlayerContext (client-side persist via /api/siswa/player/gain)
- Server tidak tahu tentang kuis mandiri — itu hanya latihan, bukan pengganti setoran guru

## Question generation
- Perkalian tabel N: soal N×1 s/d N×10, jawaban N*k
- Pembagian tabel N: soal (N*k)÷N, jawaban k (k=1..10)
- Kuis: soal diacak dengan shuffle()

**Why:** Siswa butuh cara mandiri untuk berlatih hafalan sebelum setoran ke guru; flash card untuk menghafal, kuis untuk menguji diri sendiri.
