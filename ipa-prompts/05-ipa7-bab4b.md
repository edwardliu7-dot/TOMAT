# Prompt 05 — IPA Kelas 7 BAB 4 Part B: Gaya dan Gerak — TP 4 & 5

## Prasyarat
Prompt 04 selesai (TP 1–3 sudah ada). Prompt ini mengerjakan TP 4 dan TP 5.

## Konvensi Wajib
```jsx
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
// 10 soal per sesi, pilihan diacak, auto-next 1.3 detik
// addReward({ coins: 15, exp: 10 }) hanya saat benar
```

---

## Game 1 — `ipa7b4t4`: Speed vs Velocity Pilot

**File:** `src/minigames/Ipa7B4T4Game.jsx`  
**TP:** Membedakan kecepatan dan kelajuan  
**Tema:** biru elektrik (`#6366f1`), background `#080010 → #120820`

**Rumus (komentar di kode):**
```
Kelajuan  : v = s / t    (skalar, s = jarak tempuh)
Kecepatan : v = Δx / t  (vektor, Δx = perpindahan, ada arah)
Perpindahan = posisi akhir − posisi awal (bisa nol jika balik ke titik asal)
```

```js
const SOAL = [
  { teks: 'Perbedaan utama kelajuan dan kecepatan adalah...', benar: 'Kelajuan skalar (tanpa arah), kecepatan vektor (ada arah)', salah: ['Kelajuan lebih besar dari kecepatan', 'Tidak ada perbedaan', 'Kelajuan punya arah, kecepatan tidak'] },
  { teks: 'Mobil menempuh jarak 150 km dalam 3 jam. Kelajuannya = ?', benar: '50 km/jam', salah: ['450 km/jam', '0,5 km/jam', '153 km/jam'] },
  { teks: 'Andi berlari mengelilingi lapangan 400 m lalu kembali ke start. Perpindahannya = ?', benar: '0 m (kembali ke titik awal)', salah: ['400 m', '800 m', '200 m'] },
  { teks: 'Kelajuan rata-rata mobil 60 km/jam selama 2 jam. Jarak yang ditempuh = ?', benar: '120 km', salah: ['30 km', '62 km', '120 m'] },
  { teks: 'Seorang pelari menempuh 100 m ke timur dalam 10 detik. Kecepatannya = ?', benar: '10 m/s ke arah timur', salah: ['10 m/s (tanpa arah)', '100 m/s ke timur', '1 m/s ke timur'] },
  { teks: 'Besaran yang TIDAK termasuk kecepatan adalah...', benar: 'Hanya besar tanpa arah (contoh: 60 km/jam)', salah: ['60 km/jam ke utara', '10 m/s ke barat', '5 m/s ke atas'] },
  { teks: 'Pelari marathon menyelesaikan 42 km dalam 4 jam. Kelajuan rata-ratanya = ?', benar: '10,5 km/jam', salah: ['42 km/jam', '4 km/jam', '168 km/jam'] },
  { teks: 'Benda bergerak dari A ke B (5 m) lalu balik ke A. Perpindahan totalnya = ?', benar: '0 m', salah: ['10 m', '5 m', '25 m'] },
  { teks: 'Speedometer kendaraan menunjukkan...', benar: 'Kelajuan sesaat (skalar, tanpa arah)', salah: ['Kecepatan (vektor)', 'Percepatan', 'Jarak total'] },
  { teks: 'GPS menunjukkan arah dan kecepatan kendaraan. Data yang ditampilkan GPS adalah...', benar: 'Kecepatan (vektor, ada nilai dan arah)', salah: ['Kelajuan', 'Percepatan', 'Perpindahan saja'] },
  { teks: 'Satuan SI untuk kelajuan dan kecepatan adalah...', benar: 'm/s (meter per sekon)', salah: ['km/jam', 'cm/s²', 'Newton'] },
  { teks: 'Bola dilempar ke atas dan kembali ke tangan pelempar. Perpindahannya = ?', benar: '0 m (kembali ke posisi awal)', salah: ['2× tinggi lemparan', 'Tinggi lemparan', 'Tidak bisa ditentukan'] },
]
```

---

## Game 2 — `ipa7b4t5`: Newton's Law Arena

**File:** `src/minigames/Ipa7B4T5Game.jsx`  
**TP:** Menjelaskan Hukum Newton dan penerapannya  
**Tema:** kuning listrik (`#facc15`), background `#0a0a00 → #1a1800`

**Rumus (komentar di kode):**
```
Hukum I   : Benda diam tetap diam / benda bergerak tetap bergerak jika ΣF = 0
Hukum II  : F = m × a  (gaya = massa × percepatan)
Hukum III : F aksi = −F reaksi (sama besar, berlawanan arah, pada BENDA BERBEDA)
```

```js
const SOAL = [
  { teks: 'Penumpang terdorong ke depan saat bus tiba-tiba direm. Ini menerapkan...', benar: 'Hukum Newton I (inersia)', salah: ['Hukum Newton II', 'Hukum Newton III', 'Hukum Gravitasi'] },
  { teks: 'Roket meluncur ke atas karena gas menyembur ke bawah. Ini menerapkan...', benar: 'Hukum Newton III (aksi-reaksi)', salah: ['Hukum Newton I', 'Hukum Newton II', 'Gaya gravitasi'] },
  { teks: 'Benda bermassa 5 kg mendapat gaya 20 N. Percepatannya = ?', benar: '4 m/s²', salah: ['100 m/s²', '25 m/s²', '2 m/s²'] },
  { teks: 'Benda bermassa 10 kg bergerak dengan percepatan 3 m/s². Gaya yang bekerja = ?', benar: '30 N', salah: ['13 N', '3 N', '300 N'] },
  { teks: 'Bola di lantai licin sempurna akan terus bergerak selamanya karena...', benar: 'Hukum Newton I — tidak ada gaya yang mengubah geraknya', salah: ['Hukum Newton II — ada gaya mendorong', 'Hukum Newton III', 'Bola memiliki energi tak terbatas'] },
  { teks: 'Truk bermassa besar butuh gaya lebih besar dari sepeda motor untuk percepatan yang sama. Ini Hukum Newton...', benar: 'II (F = ma, semakin besar massa semakin besar gaya yang dibutuhkan)', salah: ['I', 'III', 'Gravitasi Newton'] },
  { teks: 'Saat berenang, tangan mendorong air ke belakang sehingga badan maju. Ini Hukum Newton...', benar: 'III (aksi: tangan mendorong air, reaksi: air mendorong badan)', salah: ['I', 'II', 'Hukum Archimedes'] },
  { teks: 'Sabuk pengaman berfungsi melindungi pengemudi saat tabrakan berdasarkan...', benar: 'Hukum Newton I — tubuh cenderung terus bergerak ke depan', salah: ['Hukum Newton II', 'Hukum Newton III', 'Gaya gesek'] },
  { teks: 'Pistol bergerak mundur (recoil) saat peluru ditembakkan ke depan karena...', benar: 'Hukum Newton III — gaya aksi peluru = gaya reaksi pistol', salah: ['Hukum Newton I', 'Hukum Newton II', 'Gravitasi'] },
  { teks: 'Gaya 50 N bekerja pada benda, menghasilkan percepatan 5 m/s². Massa benda = ?', benar: '10 kg', salah: ['250 kg', '45 kg', '55 kg'] },
  { teks: 'Buku diam di atas meja. Gaya-gaya yang bekerja pada buku (gravitasi + normal) berjumlah...', benar: '0 N (setimbang, sesuai Hukum Newton I)', salah: ['Positif ke bawah', 'Positif ke atas', 'Sama dengan massa buku'] },
  { teks: 'Mendayung perahu: dayung mendorong air ke belakang, perahu maju. Ini contoh Hukum Newton...', benar: 'III (aksi-reaksi)', salah: ['I', 'II', 'Gravitasi'] },
]
```

---

## File yang Dibuat/Diubah

1. **Buat** `src/minigames/Ipa7B4T4Game.jsx`
2. **Buat** `src/minigames/Ipa7B4T5Game.jsx`
3. **Ubah** `src/App.jsx` — ganti placeholder ipa7b4t4 dan ipa7b4t5 dengan lazy import.

## Checklist
- [ ] 2 game berjalan tanpa error
- [ ] Rumus ada sebagai komentar di kode masing-masing game
- [ ] Soal dan pilihan diacak setiap sesi
- [ ] Layar selesai: skor X/10, koin, Main Lagi & Kembali
